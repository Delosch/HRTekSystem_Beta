/**
 * Engine Activation Service
 * 
 * Handles:
 * - Payment status checking
 * - Engine access control logic
 * - Feature unlock calculation
 * - Engine enable/disable triggers
 * 
 * Access Control Rules:
 * - Core Engine + Full Payment (100%) = Enabled
 * - Core Engine + Partial Payment = Disabled
 * - Advanced Engine + Milestone Paid = Partially Enabled (features based on %)
 * - Advanced Engine + Full Payment = Fully Enabled
 * - Admin Override = Manual enable/disable
 */

import {
    getEngineAccessStatus,
    isCoreEngine,
    isAdvancedEngine,
    getEngineClassification,
    buildFeatureUnlockMapping,
    getUnlockedFeatures,
    EngineSubscriptionConfig,
    EngineAccessStatus,
    PaymentRecord,
    canonicalEngineName,
    getEngineSubscriptionConfig,
} from "~/models/payment.model.server";

export interface EngineActivationResult {
    success: boolean;
    engineName: string;
    activationStatus: "disabled" | "partially_enabled" | "enabled";
    enabledFeatures: string[];
    paymentProgress: number;
    totalPaidAmount: number;
    fullAmount: number;
    nextMilestoneInfo?: {
        nextPercentage: number;
        nextFeatures: string[];
    };
    message: string;
}

export interface AccessControlCheck {
    engineName: string;
    engineType: "core" | "advanced";
    isAllowed: boolean;
    reason: string;
    activationStatus: "disabled" | "partially_enabled" | "enabled";
    features: string[];
}

/**
 * Check if engine should be enabled based on payment status
 * Implements EXACT access control logic as specified
 */
export async function checkEngineAccess(
    orgId: string,
    engineName: string,
    paymentRecord?: PaymentRecord,
    config?: EngineSubscriptionConfig
): Promise<AccessControlCheck> {
    const canonical = canonicalEngineName(engineName);
    const classification = getEngineClassification(canonical);

    if (!classification) {
        return {
            engineName: canonical,
            engineType: "core",
            isAllowed: false,
            reason: "Engine classification not found",
            activationStatus: "disabled",
            features: [],
        };
    }

    // Check for manual override first
    if (config?.manualEnabled) {
        return {
            engineName: canonical,
            engineType: classification,
            isAllowed: true,
            reason: "Manually enabled by admin",
            activationStatus: "enabled",
            features: config.featureUnlocks?.flatMap((f) => f.features) || [],
        };
    }

    if (config?.manualDisabled) {
        return {
            engineName: canonical,
            engineType: classification,
            isAllowed: false,
            reason: `Manually disabled by admin. Notes: ${config.overrideNotes || "No notes provided"}`,
            activationStatus: "disabled",
            features: [],
        };
    }

    // CORE ENGINE RULES: 100% upfront payment mandatory, unless included with advanced engine
    if (isCoreEngine(canonical)) {
        // Check if this core engine is included in an advanced engine payment
        const isIncludedWithAdvanced = paymentRecord && 
            paymentRecord.items && 
            paymentRecord.items.length > 1 && 
            paymentRecord.items.some(item => 
                item.engineName === canonical && 
                (item.price === 0 || item.price === "0") &&
                getEngineClassification(paymentRecord.items[0]?.engineName) === "advanced"
            );

        if (isIncludedWithAdvanced) {
            // Core engine included with advanced engine - unlock when advanced engine reaches 50%
            const paidAmount = paymentRecord.paidAmount || paymentRecord.totalAmount || 0;
            const fullAmount = paymentRecord.fullAmount || paymentRecord.totalAmount || 0;
            const paymentPercent = fullAmount > 0 ? Math.round((paidAmount / fullAmount) * 100) : 0;

            if (paymentPercent >= 50) {
                return {
                    engineName: canonical,
                    engineType: "core",
                    isAllowed: true,
                    reason: `Core Engine: Included with advanced engine (${paymentPercent}% paid) - Access enabled`,
                    activationStatus: "enabled",
                    features: config?.featureUnlocks?.flatMap((f) => f.features) || 
                              ["All Features"],
                };
            } else {
                return {
                    engineName: canonical,
                    engineType: "core",
                    isAllowed: false,
                    reason: `Core Engine: Included with advanced engine. Requires 50% payment of advanced engine (${paymentPercent}% paid so far).`,
                    activationStatus: "disabled",
                    features: [],
                };
            }
        }

        // Standard core engine rules
        if (!paymentRecord || paymentRecord.status !== "payment_verified") {
            return {
                engineName: canonical,
                engineType: "core",
                isAllowed: false,
                reason: "Core Engine: 100% upfront payment required and must be verified",
                activationStatus: "disabled",
                features: [],
            };
        }

        // Check if full payment is verified
        const paidAmount = paymentRecord.paidAmount || paymentRecord.totalAmount || 0;
        const fullAmount = paymentRecord.fullAmount || paymentRecord.totalAmount || 0;
        const paymentPercent = fullAmount > 0 ? Math.round((paidAmount / fullAmount) * 100) : 0;

        if (paymentPercent === 100) {
            return {
                engineName: canonical,
                engineType: "core",
                isAllowed: true,
                reason: "Core Engine: 100% payment verified - Full access enabled",
                activationStatus: "enabled",
                features: config?.featureUnlocks?.flatMap((f) => f.features) || 
                          ["All Features"], // Default: all features for core engine at 100%
            };
        }

        return {
            engineName: canonical,
            engineType: "core",
            isAllowed: false,
            reason: `Core Engine: Only ${paymentPercent}% paid. 100% payment required for access.`,
            activationStatus: "disabled",
            features: [],
        };
    }

    // ADVANCED ENGINE RULES: Milestone-based payments allowed
    if (isAdvancedEngine(canonical)) {
        if (!paymentRecord) {
            return {
                engineName: canonical,
                engineType: "advanced",
                isAllowed: false,
                reason: "Advanced Engine: No payment record found",
                activationStatus: "disabled",
                features: [],
            };
        }

        const paidAmount = paymentRecord.paidAmount || 0;
        const fullAmount = paymentRecord.fullAmount || paymentRecord.totalAmount || 0;
        const paymentPercent = fullAmount > 0 ? Math.round((paidAmount / fullAmount) * 100) : 0;

        if (paymentPercent === 0) {
            return {
                engineName: canonical,
                engineType: "advanced",
                isAllowed: false,
                reason: "Advanced Engine: No payment received yet",
                activationStatus: "disabled",
                features: [],
            };
        }

        if (paymentPercent === 100) {
            return {
                engineName: canonical,
                engineType: "advanced",
                isAllowed: true,
                reason: "Advanced Engine: 100% payment completed - Full access enabled",
                activationStatus: "enabled",
                features: config?.featureUnlocks?.flatMap((f) => f.features) || 
                          ["All Features"],
            };
        }

        // Partially paid - enable based on milestones
        const unlockedFeatures = getUnlockedFeatures(config, paidAmount, fullAmount);
        return {
            engineName: canonical,
            engineType: "advanced",
            isAllowed: true,
            reason: `Advanced Engine: ${paymentPercent}% milestone payment received - Partial access enabled`,
            activationStatus: "partially_enabled",
            features: unlockedFeatures.unlockedFeatures,
        };
    }

    return {
        engineName: canonical,
        engineType: "core",
        isAllowed: false,
        reason: "Engine classification unknown",
        activationStatus: "disabled",
        features: [],
    };
}

/**
 * Get activation status for an engine
 */
export async function getEngineActivationStatus(
    orgId: string,
    engineName: string
): Promise<EngineActivationResult> {
    try {
        const accessStatus = await getEngineAccessStatus(orgId, engineName);
        const config = await getEngineSubscriptionConfig(orgId, engineName);

        const canonical = canonicalEngineName(engineName);
        const isAllowed = accessStatus.activationStatus !== "disabled";

        return {
            success: isAllowed,
            engineName: canonical,
            activationStatus: accessStatus.activationStatus || "disabled",
            enabledFeatures: accessStatus.enabledFeatures || [],
            paymentProgress: accessStatus.totalPaidAmount && accessStatus.fullAmount
                ? Math.round((accessStatus.totalPaidAmount / accessStatus.fullAmount) * 100)
                : 0,
            totalPaidAmount: accessStatus.totalPaidAmount || 0,
            fullAmount: accessStatus.fullAmount || 0,
            nextMilestoneInfo: accessStatus.featureUnlocks
                ? (function () {
                    const nextUnlock = accessStatus.featureUnlocks!.find(
                        (u) => accessStatus.paymentProgress! < u.percentage
                    );
                    return nextUnlock
                        ? {
                            nextPercentage: nextUnlock.percentage,
                            nextFeatures: nextUnlock.features,
                        }
                        : undefined;
                })()
                : undefined,
            message: isAllowed
                ? `Engine "${canonical}" is ${accessStatus.activationStatus}`
                : `Engine "${canonical}" access denied`,
        };
    } catch (error) {
        console.error(`Error getting activation status for ${engineName}:`, error);
        return {
            success: false,
            engineName: canonicalEngineName(engineName),
            activationStatus: "disabled",
            enabledFeatures: [],
            paymentProgress: 0,
            totalPaidAmount: 0,
            fullAmount: 0,
            message: "Error retrieving activation status",
        };
    }
}

/**
 * Batch get activation status for multiple engines
 */
export async function getEnginesActivationStatus(
    orgId: string,
    engineNames: string[]
): Promise<EngineActivationResult[]> {
    return Promise.all(
        engineNames.map((name) => getEngineActivationStatus(orgId, name))
    );
}

/**
 * Check if all required engines are enabled
 */
export async function areAllEnginesEnabled(
    orgId: string,
    engineNames: string[]
): Promise<boolean> {
    const statuses = await getEnginesActivationStatus(orgId, engineNames);
    return statuses.every((status) => status.activationStatus === "enabled");
}

/**
 * Get next milestone information for partial payment
 */
export async function getNextPaymentMilestone(
    orgId: string,
    engineName: string,
    config?: EngineSubscriptionConfig
): Promise<{
    nextPercentage: number;
    nextFeatures: string[];
    amountToPay: number;
} | null> {
    try {
        const accessStatus = await getEngineAccessStatus(orgId, engineName);
        const unlockedFeatures = getUnlockedFeatures(
            config,
            accessStatus.totalPaidAmount || 0,
            accessStatus.fullAmount || 0
        );

        const nextMilestone = unlockedFeatures.nextMilestone;
        if (!nextMilestone) return null;

        const fullAmount = accessStatus.fullAmount || 0;
        const amountToPay = Math.round(fullAmount * (nextMilestone.percentage / 100)) -
            (accessStatus.totalPaidAmount || 0);

        return {
            nextPercentage: nextMilestone.percentage,
            nextFeatures: nextMilestone.features,
            amountToPay,
        };
    } catch (error) {
        console.error(`Error getting next milestone for ${engineName}:`, error);
        return null;
    }
}
