import { DynamoDBDocumentClient, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

// this function role will be to store and load analysis
let ddbDocClient: DynamoDBDocumentClient
try {
    ddbDocClient = getDynamoDBDocumentClient();
} catch (error: unknown) {
    console.error("CRITICAL ERROR: Failed to initialize DynamoDB Document Client.");
    if (error instanceof Error) {
        console.error(`Details: ${error.message}`);
    }
    // Exiting allows infrastructure to detect and potentially restart
    process.exit(1);
}

export const getLatestAnalysis = async (companyPk: string, section: string) => {
    const command = new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
        KeyConditionExpression: "pk = :pk_val AND begins_with(sk, :sk_prefix)",
        FilterExpression: "#section = :section_val",
        ExpressionAttributeValues: {
            ":pk_val": companyPk,
            ":sk_prefix": "ANALYSIS#",
            ":section_val": section,
        },
        ExpressionAttributeNames: {
            "#section": "section", // 'section' is a reserved keyword, so we still need this alias.
            // REMOVED: "#result": "result", // This alias is no longer needed if ProjectionExpression is absent
            // and 'result' is not used in KeyCondition or Filter Expression.
        },
        // ProjectionExpression is omitted to get the complete JSON item.
        // Limit: 1, ~it worked after commenting it out
        ScanIndexForward: false, // Important for getting the "latest" by SK (descending sort)
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        return Items ? Items[0] : null; // Return the first item or null if not found
    } catch (error) {
        console.error("Error querying DynamoDB for latest analysis:", error);
        throw error; // Re-throw for higher-level error handling
    }
}

// console.log(await getLatestAnalysis("COMPANY2695b6#48be1ea9-fcc3-4db0-b414-66085e","Profiling Assessment"))

/**
 * Get all analysis reports (Admin - for monitoring)
 * No approval needed - reports are auto-approved after payment verification
 */
export const getAllAnalysisReports = async () => {
    // Scan for all items where sk begins with ANALYSIS#
    const command = new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
        FilterExpression: "begins_with(sk, :sk_prefix)",
        ExpressionAttributeValues: {
            ":sk_prefix": "ANALYSIS#"
        }
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        return Items || [];
    } catch (error) {
        console.error("Error scanning analysis reports:", error);
        return [];
    }
}

/**
 * Get all pending analysis reports (Legacy - kept for backward compatibility)
 * @deprecated Reports are now auto-approved, use getAllAnalysisReports instead
 */
export const getAllPendingAnalysis = async () => {
    // Scan for items where sk begins with ANALYSIS# and status is pending
    const command = new ScanCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
        FilterExpression: "begins_with(sk, :sk_prefix) AND #status = :status",
        ExpressionAttributeValues: {
            ":sk_prefix": "ANALYSIS#",
            ":status": "pending"
        },
        ExpressionAttributeNames: {
            "#status": "status"
        }
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        return Items || [];
    } catch (error) {
        console.error("Error scanning pending analysis:", error);
        return [];
    }
}

/**
 * Update analysis status (Admin Approval)
 */
export const updateAnalysisStatus = async (pk: string, sk: string, status: "approved" | "rejected") => {
    const command = new UpdateCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
        Key: { pk, sk },
        UpdateExpression: "SET #status = :status, approvedAt = :approvedAt",
        ExpressionAttributeValues: {
            ":status": status,
            ":approvedAt": new Date().toISOString()
        },
        ExpressionAttributeNames: {
            "#status": "status"
        }
    });

    try {
        await ddbDocClient.send(command);
        return true;
    } catch (error) {
        console.error("Error updating analysis status:", error);
        return false;
    }
}