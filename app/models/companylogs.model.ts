// these are the logs for admin and client
// need to fix : don't allow logs to be updated instead they should have history maintained
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

const USERS_TABLE = process.env.DYNAMODB_TABLE_LOG || 'log';
if (!USERS_TABLE) {
    throw new Error("DYNAMODB_TABLE_LOG environment variable is not set");
}

console.log(USERS_TABLE)
let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;

// Initialize DynamoDB client once
try {
    ddbDocClient = getDynamoDBDocumentClient();
} catch (error: unknown) {
    console.error("CRITICAL ERROR: Failed to initialize DynamoDB Document Client.");
    if (error instanceof Error) {
        console.error(`Details: ${error.message}`);
    }
    process.exit(1);
}

// at present not storing ip but later we will add it
export async function createLog(company_id: string, type: string, user_id: string, dataObj: any) {
    try {
        const nDate = new Date()
        const newItem = {
            pk: `LOG#${company_id}`,
            sk: `${type}@${nDate.getTime()}`,
            type: type,
            details: dataObj,
            // ip:ip_address,
            created_by: user_id,
            createdAt: nDate.toISOString(),
        };

        const putCommand = new PutCommand({
            TableName: USERS_TABLE || "b2b_platform", // Fallback to main table if log table env is missing
            Item: newItem,
        });

        const item = await ddbDocClient.send(putCommand);

        // Return a consistent structure
        return { item };
    } catch (error: unknown) {
        console.error("Warning: Failed to create log, but continuing execution.\n", error)
        // Do NOT rethrow. Logging failure should not block the main application flow.
        return null;
    }
}