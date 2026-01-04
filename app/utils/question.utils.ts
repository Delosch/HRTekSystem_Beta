import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";



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

export const getLatestQuestion = async (section: string) => {
    const command = new ScanCommand({
        TableName: "Questions",
        FilterExpression: "questionSection = :section",
        ExpressionAttributeValues: {
            ":section": section,
        },
    });

    const { Items } = await ddbDocClient.send(command);
    return Items?.[0]
}

// now we need to make 1 funx to append or we can say update and other fuction to check 
// Define the type for the 'answer' parameter based on your Remix action's body
interface AnswerPayload {
    section: string;
    answers: Record<string, any>;
    progress?: number;
}

export const save_answers = async (
    company_id: string,
    assessment_id: string, // This should be the assessment UUID, e.g., "dwfef3"
    user_id: string,
    answer: AnswerPayload // Changed type to AnswerPayload
) => {
    const pk = `COMPANY#${company_id}`;
    const sk = `ASSESSMENT#${assessment_id}`; // SK is just the assessment UUID

    // Step 1: Check for existing assessment entry for this company and assessment ID
    const queryCommand = new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
        KeyConditionExpression: "pk = :pk AND sk = :sk", // Only PK and SK in KeyConditionExpression
        FilterExpression: "userId = :userId", // userId is a non-key attribute, so use FilterExpression
        ExpressionAttributeValues: {
            ":pk": pk,
            ":sk": sk,
            ":userId": `USER#${user_id}` // Ensure userId format matches DB
        },
        ProjectionExpression: "#statusAttr, answers", // Project 'status' and 'answers'
        ExpressionAttributeNames: {
            "#statusAttr": "status" // Alias for reserved keyword 'status'
        }
    });

    try {
        const { Items } = await ddbDocClient.send(queryCommand);

        const currentTime = new Date().toISOString();

        if (!Items || Items.length === 0) {
            console.log("No existing assessment found. Creating a new entry.");

            // Create a new item using PutCommand
            const putCommand = new PutCommand({
                TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
                Item: {
                    pk: pk,
                    sk: sk,
                    userId: `USER#${user_id}`,
                    answers: {
                        [answer.section]: answer.answers // Store the current section's answers
                    },
                    status: "DRAFT", // Initial status
                    completionPercentage: 0.0, // Initial percentage
                    createdAt: currentTime,
                    updatedAt: currentTime
                }
            });
            await ddbDocClient.send(putCommand);
            console.log("New assessment entry created successfully.");

        } else {
            const existingItem = Items[0];
            console.log(`Found existing assessment with status: ${existingItem.status}`);

            // Only update if the status is "DRAFT"
            if (existingItem.status === "DRAFT") {
                console.log("Assessment is in DRAFT status. Appending/updating data.");

                // Use UpdateCommand to append/update the 'answers' map
                const updateCommand = new UpdateCommand({
                    TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
                    Key: {
                        pk: pk,
                        sk: sk,
                    },
                    UpdateExpression: "SET answers.#sectionName = :newAnswers, updatedAt = :updatedAt, completionPercentage = :progress,#status = :status",
                    ExpressionAttributeNames: {
                        "#sectionName": answer.section, // Dynamic attribute name for the section
                        "#status": "status"
                    },
                    ExpressionAttributeValues: {
                        ":newAnswers": answer.answers, // The new answers for this section
                        ":updatedAt": currentTime,
                        ":progress": answer.progress,
                        ":status": answer.progress == 100.0 ? "COMPLETED" : "DRAFT",
                    },
                    ReturnValues: "UPDATED_NEW" // Optionally return the updated attributes
                });
                await ddbDocClient.send(updateCommand);
                console.log("Assessment data updated successfully.");
            } else {
                console.log(`Assessment is not in DRAFT status (${existingItem.status}). No update performed.`);
            }
        }
    } catch (error) {
        console.error("Error in save_answers:", error);
        throw error; // Re-throw the error to be handled by the Remix action
    }
};
// get answer by company id and assessment id
export const getAnswerSheet = async (company_id: string, assessment_id: string) => {
    const command = new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
        KeyConditionExpression: "pk = :pk AND sk= :sk",
        ExpressionAttributeValues: {
            ":pk": `COMPANY#${company_id.replace("COMPANY#", "")}`,
            ":sk": `ASSESSMENT#${assessment_id.replace("QUESTION#", "")}`
        },
        ScanIndexForward: false, // Sorts by createdAt descending (latest first)
        Limit: 1                 // Only fetch the latest one
    });

    const { Items } = await ddbDocClient.send(command);
    console.log("Answer Sheet : \n", Items)
    return Items?.[0]?.answers
}
// get answer sheet by company id and assessment name
export const getAnswerSheetByAssessmentName = async (company_id: string, assessment_name: string) => {
    const assessment_id = await getLatestQuestion(assessment_name)

    if (!assessment_id || !assessment_id.pk) {
        console.error("Assessment not found for:", assessment_name);
        return undefined;
    }

    const command = new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
        KeyConditionExpression: "pk = :pk AND sk= :sk",
        ExpressionAttributeValues: {
            ":pk": `COMPANY#${company_id.replace("COMPANY#", "")}`,
            ":sk": `ASSESSMENT#${assessment_id.pk.replace("QUESTION#", "")}`
        },
        ScanIndexForward: false, // Sorts by createdAt descending (latest first)
        Limit: 1                 // Only fetch the latest one
    });

    const { Items } = await ddbDocClient.send(command);
    console.log("Answer Sheet : \n", Items)
    return Items?.[0]?.answers
}

export const getAllResponseSheet = async (orgId: string) => {
    const command = new QueryCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk_prefix)',
        ExpressionAttributeValues: {
            ':pk': `COMPANY#${orgId}`,
            ':sk_prefix': "ASSESSMENT",
        },
    });

    try {
        const response = await ddbDocClient.send(command);
        return response.Items;
    } catch (error) {
        console.error('Error querying DynamoDB:', error);
        throw error;
    }
};

// Usage
// console.log(await getAllResponseSheet ('e4db14aa-7d46-4ed4-9a70-c14da61284bc'));

// console.log(await getAnswerSheet("9216e992-1599-4103-831e-9554870d76af","5f41bdc9-67f0-478d-bba3-0271141d0eae"))

// now store the analysis
export async function store_analysis(
    company_id: string,
    assessment_id: string,
    question_section: string,
    res: JSON // Changed from JSON to object for clarity
) {

    try {
        const sortKey = `ANALYSIS#${new Date().toISOString()}`;

        const putCommand = new PutCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME || "b2b_platform",
            Item: {
                // Partition Key: Use a standard entity pattern
                pk: `COMPANY#${company_id.replace("COMPANY#", "")}`,
                sk: sortKey,
                assessment_id: assessment_id,
                section: question_section,
                result: res, // Storing the object directly
                status: "approved", // Auto-approved - reports dispatched directly to dashboard after payment verification
                createdAt: new Date().toISOString() // This is now redundant but still a good practice
            }
        });

        const state = await ddbDocClient.send(putCommand);
        console.log(`Successfully stored analysis for company ${company_id} and assessment ${assessment_id}.`);
        if (state) {
            return true
        }
        else {
            return false
        }

    } catch (error) {
        // Essential for production: Catch and log errors instead of letting the program crash.
        console.error("Error storing analysis in DynamoDB:", error);
        throw error; // Re-throw the error for the calling function to handle

    }
}
