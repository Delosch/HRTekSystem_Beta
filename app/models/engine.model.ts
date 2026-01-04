import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { EngineValidation } from "~/schemas/engineSchemas";

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
export interface Engine {
    pk: string//"ENGINE#company_id",
    sk: string//"engine_name#version",
    engine_id: string//"uuid",
    engine_name: string,
    version: string//"1.0", // semantic versioning
    status: string//"draft | published | archived",
    price: number,
    currency?: string,
    created_by: string//"user_id",
    createdAt: "timestamp",
    updated_by?: "user_id",
    updatedAt?: "timestamp",
    is_latest: boolean // for easy querying of latest version
}

export async function createOrUpdateEngineStorage(data: any) {
    try {
        console.log("trying to work on status")
        const validatedData = EngineValidation.parse(data);

        const {
            company_id,
            user_id,
            engine_name,
            country,
            progress
        } = validatedData;
        let usage_status
        if (progress === 100) { usage_status = "Completed" }
        else if (progress > 0) { usage_status = "In Progress" }
        else { usage_status = "Draft" }
        console.log(usage_status)
        const newItem = {
            pk: `COMPANY#${company_id}`,
            sk: engine_name,
            version: "1.0",
            country,
            isLatest: true,
            created_by: user_id,
            progress,
            usage_status,
            createdAt: new Date().toISOString(),
        };

        const putCommand = new PutCommand({
            TableName: USERS_TABLE,
            Item: newItem,
        });

        const item = await ddbDocClient.send(putCommand);

        // Return a consistent structure
        return { item };
    } catch (error: unknown) {
        console.error("while creating engine usage info an error occured\n", error)
        throw error
    }
}

export const findEngineData = async (company_id: string, engine_name: string) => {
    try {
        const command = new QueryCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
            KeyConditionExpression: "pk = :pk AND sk= :sk ",
            ExpressionAttributeValues: {
                ":pk": `COMPANY#${company_id.replace("COMPANY#", "")}`,
                ":sk": engine_name
            },
            ScanIndexForward: false, // Sorts by createdAt descending (latest first)
            Limit: 1                 // Only fetch the latest one
        });

        const { Items } = await ddbDocClient.send(command);
        if (Items === undefined || Items.length === 0) { return null }
        console.log("Answer Sheet : \n", Items)
        return Items[0]
    }
    catch (e) {
        console.error("error while reading engine status ", engine_name, ":\n", e)
        throw e
    }
}

export const completedEngine = async (company_id: string) => {
    try {
        const command = new QueryCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
            KeyConditionExpression: "pk = :pk",
            FilterExpression: "progress = :progress",
            ExpressionAttributeValues: {
                ":pk": `COMPANY#${company_id.replace("COMPANY#", "")}`,
                ":progress": 100,
            },
            ProjectionExpression: "sk",
        })
        const response = await ddbDocClient.send(command);
        return response.Items?.map((item) => item.sk) || [];
    } catch (error) {
        console.error("Error fetching completed engines:", error);
        return [];
    }
}

interface RecommendationItem {
    user_id: string;
    company_id: string;
    sortedEngines: [string, number][]; // An array of tuples, where each tuple is [engineName, score]
}
export const engineRecommendationList = async (data: RecommendationItem) => {
    const recommendationItem = {
        pk: `RECOMMENDATION#${data.company_id}`,
        sk: "RECOMMENDATION",
        company_id: data.company_id,
        createdBy: data.user_id,
        createdAt: new Date().toISOString(), // Use ISO 8601 format for timestamps
        allRankings: data.sortedEngines, // Use the calculated rankings directly
    };
    try {
        const command = new PutCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
            Item: recommendationItem,
        });
        const item = await ddbDocClient.send(command);
        return { item };
    } catch (error: unknown) {
        console.error("while creating engine usage info an error occured\n", error)
        throw error
    }
}
/**
 * @Usage to fetch recommendation info from db
 * @param company_id 
 * @returns 
 */
export const fetchEngineRecomendations = async (company_id: string): Promise<RecomendedEngine | null> => {
    try {
        console.log(company_id)
        const command = new GetCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
            Key: {
                "pk": `RECOMMENDATION#${company_id}`,
                "sk": "RECOMMENDATION"
            },
        })
        const { Item } = await ddbDocClient.send(command);
        return Item as RecomendedEngine | null;
    }
    catch (e) {
        console.error("error while fetching Engine Recommendation\n", e)
        throw e
    }
}


interface RecomendedEngine {
    pk: string;
    sk: string;
    company_id: string;
    createdBy: string;
    createdAt: string;
    allRankings: [string, number][];
}

/**
 * Get comprehensive dashboard data for a specific engine
 */
export async function getEngineDashboardData(organisationId: string, engineName: string) {
    try {
        const engineData = await findEngineData(organisationId, engineName);

        if (!engineData) {
            return null;
        }

        return {
            engineData,
            progress: engineData.progress || 0,
            status: engineData.usage_status || "Draft",
            createdAt: engineData.createdAt,
            lastUpdated: engineData.updatedAt || engineData.createdAt,
        };
    } catch (error) {
        console.error("Error fetching engine dashboard data:", error);
        throw error;
    }
}

/**
 * Get all engines for an organization with their status
 */
export async function getAllEnginesStatus(organisationId: string) {
    try {
        const engines = [
            "HR Technology Maturity Analysis",
            "HR Transformation Roadmap Generator",
            "HCM Vendor Fit Engine",
            "Shared Service Designer",
            "Intelligent Change Management",
        ];

        const engineStatuses = await Promise.all(
            engines.map(async (engineName) => {
                const data = await findEngineData(organisationId, engineName);
                return {
                    name: engineName,
                    progress: data?.progress || 0,
                    status: data?.usage_status || "Not Started",
                    lastUpdated: data?.createdAt || null,
                };
            })
        );

        return engineStatuses;
    } catch (error) {
        console.error("Error fetching all engines status:", error);
        return [];
    }
}
