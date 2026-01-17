import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { membershipSchema, MembershipInput } from "~/schemas/membershipSchema";
import { z } from 'zod';

const USERS_TABLE = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

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

// Helper function for consistent error handling
function handleDynamoDBError(error: unknown, operationName: string) {
    if (error instanceof z.ZodError) {
        console.warn(`Validation error during ${operationName}:`, error.issues);
        // Re-throw a more structured error for Remix loaders/actions to catch and return
        throw new Error(`Validation Failed: ${JSON.stringify(error.issues.map(issue => ({ path: issue.path, message: issue.message })))}`);
    } else if (error instanceof Error) {
        console.error(`DynamoDB operation error during ${operationName}:`, error.message);
        // Generic error for the client
        throw new Error(`Failed to perform ${operationName}: ${error.message}`);
    } else {
        console.error(`An unexpected error occurred during ${operationName}:`, error);
        throw new Error("An unexpected error occurred while processing your request.");
    }
}

/**
 * Creates a membership record linking a user to a company.
 * PK: USER#{userId}, SK: MEMBERSHIP#{companyId}
 */
export async function createMembershipUserToCompany(data: MembershipInput) {
    try {
        const validatedData = membershipSchema.parse(data);

        const {
            userId,
            companyId,
            isCreator,
            role,
            permissions,
            invited,
            invitedBy
        } = validatedData;

        const newItem = {
            pk: `USER#${userId}`,
            sk: `MEMBERSHIP#${companyId}`,
            isCreator,
            role,
            permissions,
            invited,
            invitedBy,
            createdAt: new Date().toISOString(),
        };

        const putCommand = new PutCommand({
            TableName: USERS_TABLE,
            Item: newItem,
        });

        await ddbDocClient.send(putCommand);

        // Return a consistent structure
        return { userId, companyId, role, permissions, isCreator, invited };
    } catch (error: unknown) {
        handleDynamoDBError(error, "createMembershipUserToCompany");
    }
}

/**
 * Creates a membership record linking a company to a user.
 * PK: COMPANY#{companyId}, SK: MEMBERSHIP#{userId}
 * This is crucial for querying all members of a company.
 */
export async function createMembershipCompanyToUser(data: MembershipInput) {
    try {
        const validatedData = membershipSchema.parse(data);

        const {
            companyId,
            userId,
            isCreator,
            role,
            permissions,
            invited,
            invitedBy
        } = validatedData;

        const newItem = {
            pk: `COMPANY#${companyId}`,
            sk: `MEMBERSHIP#${userId}`,
            isCreator,
            role,
            permissions,
            invited,
            invitedBy,
            createdAt: new Date().toISOString(),
        };

        const putCommand = new PutCommand({
            TableName: USERS_TABLE,
            Item: newItem,
        });

        await ddbDocClient.send(putCommand);

        // Return a consistent structure
        return { userId, companyId, role, permissions, isCreator, invited };
    } catch (error: unknown) {
        handleDynamoDBError(error, "createMembershipCompanyToUser");
    }
}

/**
 * Retrieves all company IDs and roles for a given user.
 * Queries on PK: USER#{userId} and SK begins_with "MEMBERSHIP#"
 */
export async function getUserCompanyMemberships(userId: string) {
    try {
        z.uuidv4("Invalid user ID format.").parse(userId); // Validate input userId

        const queryCommand = new QueryCommand({
            TableName: USERS_TABLE,
            KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
            ExpressionAttributeValues: {
                ":pk": `USER#${userId}`,
                ":skPrefix": "MEMBERSHIP#",
            },
            ProjectionExpression: "pk, sk, #role, #permissions, invited, invitedBy, joinedAt",
            ExpressionAttributeNames: {
                "#role": "role",
                "#permissions": "permissions",
            },
            Limit: 1,
        });

        const { Items } = await ddbDocClient.send(queryCommand);

        if (!Items || Items.length === 0) {
            // No items found, return empty array
            return [];
        }

        // Safely extract companyId for each item
        return Items.map((item) => {
            const sk = item.sk;
            const companyId = typeof sk === "string" ? sk.split("#")[1] : null;

            return {
                companyId,
                role: item.role,
                isCreator: item.isCreator,
                permissions: item.permissions,
                invited: item.invited,
                invitedBy: item.invitedBy,
                createdAt: item.createdAt,
            };
        });
    } catch (error: unknown) {
        handleDynamoDBError(error, "getUserCompanyMemberships");
    }

    // In case error handler doesn’t throw, ensure you return something
    return [];
}

/**
 * Retrieves all user IDs (members) and their roles for a given company.
 * Queries on PK: COMPANY#{companyId} and SK begins_with "MEMBERSHIP#"
 */
export async function getCompanyMembers(companyId: string) {
    try {
        z.string().uuid("Invalid company ID format.").parse(companyId); // Validate input companyId

        const queryCommand = new QueryCommand({
            TableName: USERS_TABLE,
            KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
            ExpressionAttributeValues: {
                ":pk": `COMPANY#${companyId}`,
                ":skPrefix": "MEMBERSHIP#",
            },
            ProjectionExpression: "userId, role, isCreator, permissions, invited, invitedBy, createdAt", // Specify desired attributes
        });

        const { Items } = await ddbDocClient.send(queryCommand);

        // Map items to a more friendly format
        return Items?.map(item => ({
            userId: item.sk.split('#')[1], // Extract userId from SK
            role: item.role,
            isCreator: item.isCreator,
            permissions: item.permissions,
            invited: item.invited,
            invitedBy: item.invitedBy,
            createdAt: item.createdAt,
        })) || [];
    } catch (error: unknown) {
        handleDynamoDBError(error, "getCompanyMembers");
    }
}