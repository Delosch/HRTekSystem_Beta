import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { PutCommand, GetCommand, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";
const ddbDocClient = getDynamoDBDocumentClient();

/**
 * Engine Approval Model
 * Handles approval records for completed engines
 */

export interface EngineApproval {
    pk: string;
    sk: string;
    companyId: string;
    engineName: string;
    status: "pending" | "approved" | "rejected";
    approvedBy?: string;
    approvedAt?: string;
    rejectedBy?: string;
    rejectedAt?: string;
    rejectionReason?: string;
    reportGenerated: boolean;
    reportUrl?: string;
    completedAt: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Create engine approval record
 */
export async function createEngineApproval(
    companyId: string,
    engineName: string,
    completedAt: string
): Promise<EngineApproval> {
    const now = new Date().toISOString();

    const approval: EngineApproval = {
        pk: `COMPANY#${companyId}`,
        sk: `ENGINE_APPROVAL#${engineName}`,
        companyId,
        engineName,
        status: "pending",
        reportGenerated: false,
        completedAt,
        createdAt: now,
        updatedAt: now
    };

    await ddbDocClient.send(
        new PutCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Item: approval
        })
    );

    return approval;
}

/**
 * Update approval status
 */
export async function updateApprovalStatus(
    companyId: string,
    engineName: string,
    status: "approved" | "rejected",
    actionBy: string,
    rejectionReason?: string
): Promise<void> {
    const now = new Date().toISOString();

    const updateExpression = status === "approved"
        ? "SET #status = :status, approvedBy = :actionBy, approvedAt = :now, updatedAt = :updated"
        : "SET #status = :status, rejectedBy = :actionBy, rejectedAt = :now, rejectionReason = :reason, updatedAt = :updated";

    const expressionAttributeValues: any = {
        ":status": status,
        ":actionBy": actionBy,
        ":now": now,
        ":updated": now
    };

    if (status === "rejected" && rejectionReason) {
        expressionAttributeValues[":reason"] = rejectionReason;
    }

    await ddbDocClient.send(
        new UpdateCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: {
                pk: `COMPANY#${companyId}`,
                sk: `ENGINE_APPROVAL#${engineName}`
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: expressionAttributeValues
        })
    );
}

/**
 * Mark report as generated
 */
export async function markReportGenerated(
    companyId: string,
    engineName: string,
    reportUrl: string
): Promise<void> {
    await ddbDocClient.send(
        new UpdateCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: {
                pk: `COMPANY#${companyId}`,
                sk: `ENGINE_APPROVAL#${engineName}`
            },
            UpdateExpression: "SET reportGenerated = :true, reportUrl = :url, updatedAt = :updated",
            ExpressionAttributeValues: {
                ":true": true,
                ":url": reportUrl,
                ":updated": new Date().toISOString()
            }
        })
    );
}

/**
 * Get approval record
 */
export async function getEngineApproval(
    companyId: string,
    engineName: string
): Promise<EngineApproval | null> {
    const result = await ddbDocClient.send(
        new GetCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: {
                pk: `COMPANY#${companyId}`,
                sk: `ENGINE_APPROVAL#${engineName}`
            }
        })
    );

    return result.Item as EngineApproval || null;
}

/**
 * Get all pending approvals (for admin dashboard)
 */
export async function getPendingApprovals(): Promise<EngineApproval[]> {
    // Note: This is a simplified version. In production, you'd use a GSI
    // For now, we'll scan the table (not ideal for large datasets)
    const result = await ddbDocClient.send(
        new QueryCommand({
            TableName: DYNAMODB_TABLE_NAME,
            IndexName: "GSI1", // Assuming you have a GSI
            KeyConditionExpression: "sk = :sk",
            FilterExpression: "#status = :pending",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":sk": "ENGINE_APPROVAL",
                ":pending": "pending"
            }
        })
    );

    return (result.Items as EngineApproval[]) || [];
}

/**
 * Get all approvals for a company
 */
export async function getCompanyApprovals(companyId: string): Promise<EngineApproval[]> {
    const result = await ddbDocClient.send(
        new QueryCommand({
            TableName: DYNAMODB_TABLE_NAME,
            KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
            ExpressionAttributeValues: {
                ":pk": `COMPANY#${companyId}`,
                ":sk": "ENGINE_APPROVAL#"
            }
        })
    );

    return (result.Items as EngineApproval[]) || [];
}
