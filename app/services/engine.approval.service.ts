import {
    createEngineApproval,
    updateApprovalStatus,
    getEngineApproval,
    getPendingApprovals,
    markReportGenerated,
    EngineApproval
} from "~/models/engine.approval.model";

/**
 * Engine Approval Service
 * Business logic for engine approval workflow
 */

export interface ApprovalResult {
    success: boolean;
    message: string;
}

/**
 * Approve an engine
 */
export async function approveEngine(
    companyId: string,
    engineName: string,
    approvedBy: string
): Promise<ApprovalResult> {
    try {
        // Check if approval record exists
        let approval = await getEngineApproval(companyId, engineName);

        if (!approval) {
            // Create approval record if it doesn't exist
            approval = await createEngineApproval(companyId, engineName, new Date().toISOString());
        }

        if (approval.status === "approved") {
            return {
                success: false,
                message: "Engine already approved"
            };
        }

        // Update status to approved
        await updateApprovalStatus(companyId, engineName, "approved", approvedBy);

        return {
            success: true,
            message: `Engine "${engineName}" approved successfully`
        };
    } catch (error) {
        console.error("Error approving engine:", error);
        return {
            success: false,
            message: "Failed to approve engine"
        };
    }
}

/**
 * Reject an engine
 */
export async function rejectEngine(
    companyId: string,
    engineName: string,
    rejectedBy: string,
    reason: string
): Promise<ApprovalResult> {
    try {
        let approval = await getEngineApproval(companyId, engineName);

        if (!approval) {
            approval = await createEngineApproval(companyId, engineName, new Date().toISOString());
        }

        if (approval.status === "rejected") {
            return {
                success: false,
                message: "Engine already rejected"
            };
        }

        await updateApprovalStatus(companyId, engineName, "rejected", rejectedBy, reason);

        return {
            success: true,
            message: `Engine "${engineName}" rejected`
        };
    } catch (error) {
        console.error("Error rejecting engine:", error);
        return {
            success: false,
            message: "Failed to reject engine"
        };
    }
}

/**
 * Bulk approve engines
 */
export async function bulkApproveEngines(
    approvals: Array<{ companyId: string; engineName: string }>,
    approvedBy: string
): Promise<{ successful: number; failed: number; errors: string[] }> {
    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const { companyId, engineName } of approvals) {
        const result = await approveEngine(companyId, engineName, approvedBy);
        if (result.success) {
            successful++;
        } else {
            failed++;
            errors.push(`${engineName}: ${result.message}`);
        }
    }

    return { successful, failed, errors };
}

/**
 * Get engine approval status
 */
export async function getEngineApprovalStatus(
    companyId: string,
    engineName: string
): Promise<{
    exists: boolean;
    status?: "pending" | "approved" | "rejected";
    approvedBy?: string;
    approvedAt?: string;
    rejectionReason?: string;
}> {
    const approval = await getEngineApproval(companyId, engineName);

    if (!approval) {
        return { exists: false };
    }

    return {
        exists: true,
        status: approval.status,
        approvedBy: approval.approvedBy,
        approvedAt: approval.approvedAt,
        rejectionReason: approval.rejectionReason
    };
}

/**
 * Get all pending engine reviews
 */
export async function getPendingEngineReviews(): Promise<EngineApproval[]> {
    return await getPendingApprovals();
}

/**
 * Auto-create approval record when engine is completed
 */
export async function autoCreateApprovalRecord(
    companyId: string,
    engineName: string
): Promise<void> {
    try {
        // Check if approval already exists
        const existing = await getEngineApproval(companyId, engineName);

        if (!existing) {
            await createEngineApproval(companyId, engineName, new Date().toISOString());
            console.log(`✅ Created approval record for ${engineName}`);
        }
    } catch (error) {
        console.error("Error creating approval record:", error);
    }
}
