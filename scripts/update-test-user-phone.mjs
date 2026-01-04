/**
 * Update Test User Phone Script
 * 
 * Updates the test user's phone number to the correct format
 * 
 * Usage: node scripts/update-test-user-phone.mjs
 */

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1"
});

const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "hrtek-users-prod";

async function updateTestUserPhone() {
    console.log("🔧 Updating Test User Phone Number");
    console.log("=".repeat(60));

    const testEmail = "mass@mail.com";
    const correctPhone = "(+91)9876543210"; // Correct format

    try {
        // Find the user
        console.log("\n🔍 Finding user...");
        const queryCommand = new QueryCommand({
            TableName: TABLE_NAME,
            IndexName: "email-index",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": testEmail,
            },
            Limit: 1,
        });

        const result = await ddbDocClient.send(queryCommand);

        if (!result.Items || result.Items.length === 0) {
            console.error("❌ User not found!");
            return;
        }

        const user = result.Items[0];
        console.log("✓ User found:", user.pk);

        // Update the phone number
        console.log("\n📱 Updating phone number to:", correctPhone);
        const updateCommand = new UpdateCommand({
            TableName: TABLE_NAME,
            Key: {
                pk: user.pk,
                sk: user.sk
            },
            UpdateExpression: "SET phone = :phone",
            ExpressionAttributeValues: {
                ":phone": correctPhone
            }
        });

        await ddbDocClient.send(updateCommand);

        console.log("\n" + "=".repeat(60));
        console.log("✅ PHONE NUMBER UPDATED SUCCESSFULLY!");
        console.log("=".repeat(60));
        console.log("\n📧 Email:", testEmail);
        console.log("📱 New Phone:", correctPhone);
        console.log("\n🎉 Test login should now work!");

    } catch (error) {
        console.error("\n❌ Error updating user:", error);
        process.exit(1);
    }
}

updateTestUserPhone();
