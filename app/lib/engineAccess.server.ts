import { hasVerifiedPaymentForEngines, getVerifiedPaidEngines } from "~/models/payment.model";

/**
 * Engine Access Control
 * Checks if a company has paid for and can access specific engines
 */

export interface EngineAccessResult {
    hasAccess: boolean;
    engineName: string;
    reason?: string;
}

/**
 * Check if a company has access to a specific engine
 */
export async function checkEngineAccess(
    orgId: string,
    engineName: string
): Promise<EngineAccessResult> {
    try {
        // Check if company has verified payment for this engine
        const hasAccess = await hasVerifiedPaymentForEngines(orgId, [engineName]);

        if (hasAccess) {
            return {
                hasAccess: true,
                engineName
            };
        }

        return {
            hasAccess: false,
            engineName,
            reason: "Payment not verified for this engine"
        };
    } catch (error) {
        console.error(`Error checking engine access for ${engineName}:`, error);
        return {
            hasAccess: false,
            engineName,
            reason: "Error checking access"
        };
    }
}

/**
 * Get list of all engines the company has access to
 */
export async function getAccessibleEngines(orgId: string): Promise<string[]> {
    try {
        return await getVerifiedPaidEngines(orgId);
    } catch (error) {
        console.error("Error getting accessible engines:", error);
        return [];
    }
}

/**
 * Get list of locked engines (not paid for)
 */
export async function getLockedEngines(orgId: string): Promise<string[]> {
    const allEngines = [
        "HR Technology Maturity Analysis",
        "Intelligent Change Management",
        "Shared Service Designer",
        "Profiling Assessment",
        "Vendor Evaluation"
    ];

    const accessibleEngines = await getAccessibleEngines(orgId);

    return allEngines.filter(engine => !accessibleEngines.includes(engine));
}

/**
 * Require engine access - throws redirect if no access
 */
export async function requireEngineAccess(
    orgId: string,
    engineName: string
): Promise<void> {
    const accessResult = await checkEngineAccess(orgId, engineName);

    if (!accessResult.hasAccess) {
        throw new Response("Redirect", {
            status: 302,
            headers: {
                Location: `/engine-locked/${encodeURIComponent(engineName)}`
            }
        });
    }
}
