import {
    checkEligibility,
    createEligibilityRecord,
    updateEligibilityStatus,
    getEligibilityRecord,
    EligibilityRecord
} from "~/models/eligibility.model.server";

/**
 * Eligibility Service
 * Business logic for transformation eligibility
 */

export interface EligibilityStatus {
    eligible: boolean;
    completedEngines: number;
    paidEngines: number;
    missingRequirements: string[];
    progress: number; // Percentage toward eligibility
}

export interface EligibilityProgress {
    current: number;
    required: number;
    percentage: number;
    completedEnginesList: string[];
    paidEnginesList: string[];
    completedCount: number;
    paidCount: number;
    remainingEngines: number;
}

/**
 * Check if company is eligible for transformation
 */
export async function checkTransformationEligibility(
    companyId: string
): Promise<EligibilityStatus> {
    const eligibilityCheck = await checkEligibility(companyId);

    const minimumRequired = 3;
    const progress = Math.min(
        100,
        Math.round((eligibilityCheck.paidCount / minimumRequired) * 100)
    );

    return {
        eligible: eligibilityCheck.eligible,
        completedEngines: eligibilityCheck.completedCount,
        paidEngines: eligibilityCheck.paidCount,
        missingRequirements: eligibilityCheck.missingRequirements,
        progress
    };
}

/**
 * Sync eligibility record with current assessment and payment status
 * Updated to ALWAYS update the record, even if not eligible for transformation
 */
export async function syncEligibilityRecord(
    companyId: string
): Promise<{ success: boolean; record: EligibilityRecord }> {
    try {
        const eligibilityCheck = await checkEligibility(companyId);

        // Check if record exists
        const existingRecord = await getEligibilityRecord(companyId);

        let record;
        if (existingRecord) {
            // Update existing record
            await updateEligibilityStatus(companyId, {
                isEligible: eligibilityCheck.eligible,
                completedEngines: eligibilityCheck.completedEngines,
                paidEngines: eligibilityCheck.paidEngines
            });
            record = { ...existingRecord, isEligible: eligibilityCheck.eligible, completedEngines: eligibilityCheck.completedEngines, paidEngines: eligibilityCheck.paidEngines };
        } else {
            // Create new record
            record = await createEligibilityRecord(companyId, {
                isEligible: eligibilityCheck.eligible,
                completedEngines: eligibilityCheck.completedEngines,
                paidEngines: eligibilityCheck.paidEngines
            });
        }

        return {
            success: true,
            record
        };
    } catch (error) {
        console.error("Error syncing eligibility:", error);
        throw error;
    }
}

/**
 * Mark company as eligible for transformation (Checks first)
 * @deprecated Use syncEligibilityRecord for general updates
 */
export async function markEligibleForTransformation(
    companyId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const result = await syncEligibilityRecord(companyId);

        if (!result.record.isEligible) {
            const eligibilityCheck = await checkEligibility(companyId);
            return {
                success: false,
                message: `Not eligible. Missing: ${eligibilityCheck.missingRequirements.join(", ")}`
            };
        }

        return {
            success: true,
            message: "Company marked as eligible for transformation"
        };
    } catch (error) {
        console.error("Error marking eligibility:", error);
        return {
            success: false,
            message: "Failed to mark eligibility"
        };
    }
}

/**
 * Get current eligibility status
 */
export async function getEligibilityStatus(
    companyId: string
): Promise<EligibilityStatus> {
    return await checkTransformationEligibility(companyId);
}

/**
 * Get progress toward eligibility
 */
export async function getEligibilityProgress(
    companyId: string
): Promise<EligibilityProgress> {
    const eligibilityCheck = await checkEligibility(companyId);
    const minimumRequired = 3;

    return {
        current: eligibilityCheck.paidCount,
        required: minimumRequired,
        percentage: Math.min(
            100,
            Math.round((eligibilityCheck.paidCount / minimumRequired) * 100)
        ),
        completedEnginesList: eligibilityCheck.completedEngines,
        paidEnginesList: eligibilityCheck.paidEngines,
        completedCount: eligibilityCheck.completedCount,
        paidCount: eligibilityCheck.paidCount,
        remainingEngines: Math.max(0, minimumRequired - eligibilityCheck.paidCount)
    };
}

/**
 * Auto-check and update eligibility after engine completion
 */
export async function autoCheckEligibility(
    companyId: string
): Promise<{ eligible: boolean; message: string; proposalGenerated?: boolean }> {
    try {
        // ALWAYS Sync current status to the eligibility record
        const syncResult = await syncEligibilityRecord(companyId);

        if (syncResult.record.isEligible) {
            // Auto-generate proposal if eligible
            const { autoGenerateProposal } = await import("~/services/proposal.service.server");
            const proposalResult = await autoGenerateProposal(companyId);

            return {
                eligible: true,
                message: "🎉 Congratulations! You're now eligible for HR Digital Transformation!",
                proposalGenerated: proposalResult.success
            };
        }

        const statusResult = await checkTransformationEligibility(companyId);

        return {
            eligible: false,
            message: `Progress: ${statusResult.paidEngines}/3 engines completed. ${statusResult.missingRequirements.join(". ")}`
        };
    } catch (error) {
        console.error("Error in auto-check eligibility:", error);
        return {
            eligible: false,
            message: "Error checking eligibility"
        };
    }
}
