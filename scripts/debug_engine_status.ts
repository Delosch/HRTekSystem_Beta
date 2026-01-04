
import "dotenv/config";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

const ddbDocClient = getDynamoDBDocumentClient();
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";
const COMPANY_ID = "abaec057-123d-4678-8eda-677624e9f1ac";

async function checkCompanyData() {
    console.log(`🔍 Checking data for company: ${COMPANY_ID}`);
    console.log(`Table: ${TABLE_NAME}\n`);

    try {
        // Query everything for this company
        const result = await ddbDocClient.send(new QueryCommand({
            TableName: TABLE_NAME,
            KeyConditionExpression: "pk = :pk",
            ExpressionAttributeValues: {
                ":pk": `COMPANY#${COMPANY_ID}`
            }
        }));

        console.log(`Found ${result.Items?.length || 0} items for this company.`);

        console.log("\n--- ENGINE ITEMS ---");
        const engines = result.Items?.filter(item => item.sk.startsWith("ENGINE#") || (item.progress !== undefined));

        engines?.forEach(item => {
            console.log(`\nSK: ${item.sk}`);
            console.log(`Progress: ${item.progress}`);
            console.log(`Status: ${item.usage_status || item.status}`);
            console.log(`UpdatedAt: ${item.updatedAt}`);
        });

        console.log("\n--------------------");
    } catch (e) {
        console.error("Error querying data:", e);
    }
}

checkCompanyData();
