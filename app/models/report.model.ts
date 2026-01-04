import { PutCommand, QueryCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;

const USERS_TABLE = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

try {
    ddbDocClient = getDynamoDBDocumentClient();
} catch (error: unknown) {
    console.error("CRITICAL ERROR: Failed to initialize DynamoDB Document Client.");
    if (error instanceof Error) {
        console.error(`Details: ${error.message}`);
    }
    process.exit(1);
}

export type ReportStatus = "pending_review" | "approved" | "rejected" | "revision_requested";

export interface EngineReport {
    pk: string;              // COMPANY#{orgId}
    sk: string;              // REPORT#{engineName}#{reportId}
    reportId: string;
    companyId: string;
    engineName: string;

    // Report data
    assessmentId: string;
    reportData: any;         // The actual analysis/report data
    generatedAt: string;

    // Status and approval
    status: ReportStatus;
    submittedBy: string;
    submittedAt: string;

    // Admin review
    reviewedBy?: string;
    reviewedAt?: string;
    reviewNotes?: string;
    rejectionReason?: string;

    // Payment linkage
    isPaid: boolean;
    paymentInvoiceId?: string;

    createdAt: string;
    updatedAt: string;
}

/**
 * Create or update an engine report
 */
export async function createEngineReport(
    orgId: string,
    engineName: string,
    reportData: {
        assessmentId: string;
        reportData: any;
        submittedBy: string;
    }
): Promise<EngineReport> {
    const reportId = uuidv4();
    const timestamp = new Date().toISOString();

    const report: EngineReport = {
        pk: `COMPANY#${orgId}`,
        sk: `REPORT#${engineName}#${reportId}`,
        reportId,
        companyId: orgId,
        engineName,
        assessmentId: reportData.assessmentId,
        reportData: reportData.reportData,
        generatedAt: timestamp,
        status: "pending_review",
        submittedBy: reportData.submittedBy,
        submittedAt: timestamp,
        isPaid: false,
        createdAt: timestamp,
        updatedAt: timestamp
    };

    const command = new PutCommand({
        TableName: USERS_TABLE,
        Item: report
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Engine report created: ${reportId} for ${engineName}`);
        return report;
    } catch (e) {
        console.error("Error creating engine report:", e);
        throw e;
    }
}

/**
 * Approve a report (admin action)
 */
export async function approveReport(
    reportId: string,
    orgId: string,
    engineName: string,
    adminId: string,
    reviewNotes?: string
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `REPORT#${engineName}#${reportId}`
        },
        UpdateExpression: `
      SET #status = :status,
          reviewedBy = :reviewedBy,
          reviewedAt = :reviewedAt,
          reviewNotes = :reviewNotes,
          updatedAt = :updatedAt
    `,
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": "approved",
            ":reviewedBy": adminId,
            ":reviewedAt": new Date().toISOString(),
            ":reviewNotes": reviewNotes || null,
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Report approved: ${reportId} by admin ${adminId}`);
    } catch (e) {
        console.error("Error approving report:", e);
        throw e;
    }
}

/**
 * Reject a report (admin action)
 */
export async function rejectReport(
    reportId: string,
    orgId: string,
    engineName: string,
    adminId: string,
    rejectionReason: string
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `REPORT#${engineName}#${reportId}`
        },
        UpdateExpression: `
      SET #status = :status,
          reviewedBy = :reviewedBy,
          reviewedAt = :reviewedAt,
          rejectionReason = :rejectionReason,
          updatedAt = :updatedAt
    `,
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": "rejected",
            ":reviewedBy": adminId,
            ":reviewedAt": new Date().toISOString(),
            ":rejectionReason": rejectionReason,
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Report rejected: ${reportId} by admin ${adminId}`);
    } catch (e) {
        console.error("Error rejecting report:", e);
        throw e;
    }
}

/**
 * Request revision for a report (admin action)
 */
export async function requestRevision(
    reportId: string,
    orgId: string,
    engineName: string,
    adminId: string,
    revisionNotes: string
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `REPORT#${engineName}#${reportId}`
        },
        UpdateExpression: `
      SET #status = :status,
          reviewedBy = :reviewedBy,
          reviewedAt = :reviewedAt,
          reviewNotes = :reviewNotes,
          updatedAt = :updatedAt
    `,
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": "revision_requested",
            ":reviewedBy": adminId,
            ":reviewedAt": new Date().toISOString(),
            ":reviewNotes": revisionNotes,
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Revision requested for report: ${reportId} by admin ${adminId}`);
    } catch (e) {
        console.error("Error requesting revision:", e);
        throw e;
    }
}

/**
 * Link payment to report
 */
export async function linkPaymentToReport(
    reportId: string,
    orgId: string,
    engineName: string,
    invoiceId: string
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `REPORT#${engineName}#${reportId}`
        },
        UpdateExpression: `
      SET isPaid = :isPaid,
          paymentInvoiceId = :paymentInvoiceId,
          updatedAt = :updatedAt
    `,
        ExpressionAttributeValues: {
            ":isPaid": true,
            ":paymentInvoiceId": invoiceId,
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Payment linked to report: ${reportId}`);
    } catch (e) {
        console.error("Error linking payment to report:", e);
        throw e;
    }
}

/**
 * Get all reports for a company
 */
export async function getCompanyReports(orgId: string): Promise<EngineReport[]> {
    const command = new QueryCommand({
        TableName: USERS_TABLE,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
        ExpressionAttributeValues: {
            ":pk": `COMPANY#${orgId}`,
            ":skPrefix": "REPORT#"
        },
        ScanIndexForward: false
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        return (Items as EngineReport[]) || [];
    } catch (e) {
        console.error("Error fetching company reports:", e);
        throw e;
    }
}

/**
 * Get pending reports (for admin)
 */
export async function getPendingReports(): Promise<EngineReport[]> {
    // Note: This requires a GSI on status. For now, we'll return empty array
    // In production, create a GSI: status-submittedAt-index

    try {
        const command = new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: "status-index", // You'll need to create this GSI
            KeyConditionExpression: "#status = :status",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":status": "pending_review"
            },
            ScanIndexForward: false
        });

        const { Items } = await ddbDocClient.send(command);
        return (Items as EngineReport[]) || [];
    } catch (e) {
        console.error("Error fetching pending reports:", e);
        // Fallback: return empty array if GSI doesn't exist yet
        return [];
    }
}

/**
 * Get approved reports for a company
 */
export async function getApprovedReports(orgId: string): Promise<EngineReport[]> {
    const allReports = await getCompanyReports(orgId);
    return allReports.filter(r => r.status === "approved");
}

/**
 * Check if company has approved reports for specific engines
 */
export async function hasApprovedReportsForEngines(
    orgId: string,
    engineNames: string[]
): Promise<boolean> {
    const reports = await getCompanyReports(orgId);
    const approvedEngines = new Set(
        reports.filter(r => r.status === "approved").map(r => r.engineName)
    );

    return engineNames.every(engine => approvedEngines.has(engine));
}
