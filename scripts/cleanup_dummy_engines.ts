import "dotenv/config";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

const ddbDocClient = getDynamoDBDocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";
const COMPANY_ID = "abaec057-123d-4678-8eda-677624e9f1ac";

const ENGINE_NAMES = [
    "HR Transformation Roadmap Generator",
    "Cognitive HCM Vendor Fit",
    "Shared Service Designer",
    "Intelligent Change Management",
    "HR Technology Maturity Analysis"
];

async function cleanupEngines() {
    console.log(`🧹 Starting cleanup for company: ${COMPANY_ID}`);

    let deletedCount = 0;

    for (const engineName of ENGINE_NAMES) {
        // Delete 'ENGINE#' prefixed keys (Created by testing utility)
        try {
            await ddbDocClient.send(new DeleteCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: `COMPANY#${COMPANY_ID}`,
                    sk: `ENGINE#${engineName}`
                }
            }));
            console.log(`✅ Deleted: ENGINE#${engineName}`);
            deletedCount++;
        } catch (e) {
            console.log(`⚠️ Failed to delete ENGINE#${engineName}: ${e.message}`);
        }

        // Delete legacy Keys (Just the name)
        try {
            await ddbDocClient.send(new DeleteCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: `COMPANY#${COMPANY_ID}`,
                    sk: engineName
                }
            }));
            console.log(`✅ Deleted Legacy: ${engineName}`);
            deletedCount++;
        } catch (e) {
            console.log(`⚠️ Failed to delete Legacy ${engineName}: ${e.message}`);
        }
    }

    console.log(`\n✨ Cleanup complete! Removed ${deletedCount} items.`);
}

cleanupEngines().catch(console.error);
