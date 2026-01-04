import {
    checkEligibility,
    createEligibilityRecord,
    updateEligibilityStatus,
    getEligibilityRecord
} from "~/models/eligibility.model";

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
 * Mark company as eligible for transformation
 */
export async function markEligibleForTransformation(
    companyId: string
): Promise<{ success: boolean; message: string }> {
    try {
        const eligibilityCheck = await checkEligibility(companyId);

        if (!eligibilityCheck.eligible) {
            return {
                success: false,
                message: `Not eligible. Missing: ${eligibilityCheck.missingRequirements.join(", ")}`
            };
        }

        // Check if record exists
        const existingRecord = await getEligibilityRecord(companyId);

        if (existingRecord) {
            // Update existing record
            await updateEligibilityStatus(companyId, {
                isEligible: true,
                completedEngines: eligibilityCheck.completedEngines,
                paidEngines: eligibilityCheck.paidEngines
            });
        } else {
            // Create new record
            await createEligibilityRecord(companyId, {
                isEligible: true,
                completedEngines: eligibilityCheck.completedEngines,
                paidEngines: eligibilityCheck.paidEngines
            });
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
        completedEnginesList: eligibilityCheck.paidEngines,
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
        const status = await checkTransformationEligibility(companyId);

        if (status.eligible) {
            await markEligibleForTransformation(companyId);

            // Auto-generate proposal
            const { autoGenerateProposal } = await import("~/services/proposal.service");
            const proposalResult = await autoGenerateProposal(companyId);

            return {
                eligible: true,
                message: "🎉 Congratulations! You're now eligible for HR Digital Transformation!",
                proposalGenerated: proposalResult.success
            };
        }

        return {
            eligible: false,
            message: `Progress: ${status.paidEngines}/3 engines completed. ${status.missingRequirements.join(". ")}`
        };
    } catch (error) {
        console.error("Error in auto-check eligibility:", error);
        return {
            eligible: false,
            message: "Error checking eligibility"
        };
    }
}
