// Quick test script to check if payment submission works
import dotenv from 'dotenv';
dotenv.config();

import { getDynamoDBDocumentClient } from "./app/lib/dynamodb.server";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

async function testPaymentRecord() {
    try {
        const ddbDocClient = getDynamoDBDocumentClient();

        // Test invoice ID from the error
        const invoiceId = "e1d07c60-c71e-4ab3-a7e7-be7a0c5d4767";

        console.log("🔍 Searching for payment record...");
        console.log("Table:", TABLE_NAME);
        console.log("Invoice ID:", invoiceId);

        // Try to find the payment record
        // We need to scan since we don't know the company ID
        const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");

        const result = await ddbDocClient.send(
            new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "contains(#sk, :invoiceId)",
                ExpressionAttributeNames: {
                    "#sk": "sk"
                },
                ExpressionAttributeValues: {
                    ":invoiceId": invoiceId
                }
            })
        );

        console.log("\n📊 Results:");
        console.log("Items found:", result.Items?.length || 0);

        if (result.Items && result.Items.length > 0) {
            console.log("\n✅ Payment record found:");
            console.log(JSON.stringify(result.Items[0], null, 2));
        } else {
            console.log("\n❌ No payment record found for this invoice ID");
            console.log("This means the invoice doesn't exist in the database");
        }

    } catch (error) {
        console.error("\n❌ Error:", error);
        if (error instanceof Error) {
            console.error("Message:", error.message);
            console.error("Stack:", error.stack);
        }
    }
}

testPaymentRecord()
    .then(() => {
        console.log("\n✅ Test completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    });
