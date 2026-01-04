/**
 * DynamoDB GSI Setup Script
 * 
 * This script adds the required Global Secondary Indexes (GSIs) to the users table.
 * Run this script once to fix the "email-index" and "phone-index" errors.
 * 
 * Usage: node scripts/setup-dynamodb-indexes.mjs
 */

import { DynamoDBClient, UpdateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1"
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "hrtek-users-prod";

async function checkTableStatus() {
    try {
        const command = new DescribeTableCommand({ TableName: TABLE_NAME });
        const response = await client.send(command);
        return response.Table;
    } catch (error) {
        console.error("❌ Error checking table:", error);
        throw error;
    }
}

async function checkExistingIndexes() {
    try {
        const table = await checkTableStatus();
        const existingIndexes = table?.GlobalSecondaryIndexes?.map(idx => ({
            name: idx.IndexName,
            status: idx.IndexStatus
        })) || [];

        console.log("📋 Existing indexes:");
        existingIndexes.forEach(idx => {
            console.log(`   - ${idx.name}: ${idx.status}`);
        });

        return existingIndexes;
    } catch (error) {
        console.error("❌ Error checking indexes:", error);
        throw error;
    }
}

async function waitForIndexToBeActive(indexName, maxWaitMinutes = 10) {
    console.log(`\n⏳ Waiting for ${indexName} to become ACTIVE...`);
    const maxAttempts = maxWaitMinutes * 6; // Check every 10 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const table = await checkTableStatus();
        const index = table?.GlobalSecondaryIndexes?.find(idx => idx.IndexName === indexName);

        if (!index) {
            throw new Error(`Index ${indexName} not found`);
        }

        console.log(`   [${attempt}/${maxAttempts}] Status: ${index.IndexStatus}`);

        if (index.IndexStatus === "ACTIVE") {
            console.log(`✅ ${indexName} is now ACTIVE!`);
            return true;
        }

        // Wait 10 seconds before next check
        await new Promise(resolve => setTimeout(resolve, 10000));
    }

    throw new Error(`Timeout waiting for ${indexName} to become ACTIVE`);
}

async function addEmailIndex() {
    console.log("\n🔧 Adding email-index GSI...");

    try {
        const command = new UpdateTableCommand({
            TableName: TABLE_NAME,
            AttributeDefinitions: [
                {
                    AttributeName: "email",
                    AttributeType: "S"
                }
            ],
            GlobalSecondaryIndexUpdates: [
                {
                    Create: {
                        IndexName: "email-index",
                        KeySchema: [
                            {
                                AttributeName: "email",
                                KeyType: "HASH"
                            }
                        ],
                        Projection: {
                            ProjectionType: "ALL"
                        }
                    }
                }
            ]
        });

        await client.send(command);
        console.log("✅ email-index creation initiated!");
        return true;
    } catch (error) {
        if (error.name === "ResourceInUseException") {
            console.log("⏳ Table is being updated, please wait...");
            return false;
        } else if (error.name === "ResourceNotFoundException") {
            console.error("❌ Table not found:", TABLE_NAME);
            console.error("   Check your DYNAMODB_TABLE_NAME in .env file");
            throw error;
        } else {
            console.error("❌ Error creating email-index:", error.message);
            throw error;
        }
    }
}

async function addPhoneIndex() {
    console.log("\n🔧 Adding phone-index GSI...");

    try {
        const command = new UpdateTableCommand({
            TableName: TABLE_NAME,
            AttributeDefinitions: [
                {
                    AttributeName: "phone",
                    AttributeType: "S"
                }
            ],
            GlobalSecondaryIndexUpdates: [
                {
                    Create: {
                        IndexName: "phone-index",
                        KeySchema: [
                            {
                                AttributeName: "phone",
                                KeyType: "HASH"
                            }
                        ],
                        Projection: {
                            ProjectionType: "ALL"
                        }
                    }
                }
            ]
        });

        await client.send(command);
        console.log("✅ phone-index creation initiated!");
        return true;
    } catch (error) {
        if (error.name === "ResourceInUseException") {
            console.log("⏳ Table is being updated, please wait...");
            return false;
        } else if (error.name === "LimitExceededException") {
            console.log("⚠️  Cannot create phone-index yet - email-index is still being created");
            console.log("   Please wait for email-index to complete, then run this script again");
            return false;
        } else if (error.name === "ResourceNotFoundException") {
            console.error("❌ Table not found:", TABLE_NAME);
            console.error("   Check your DYNAMODB_TABLE_NAME in .env file");
            throw error;
        } else {
            console.error("❌ Error creating phone-index:", error.message);
            throw error;
        }
    }
}

async function main() {
    console.log("🚀 DynamoDB GSI Setup Script");
    console.log("=".repeat(60));
    console.log(`📊 Table: ${TABLE_NAME}`);
    console.log(`🌍 Region: ${process.env.AWS_REGION || "us-east-1"}`);
    console.log("=".repeat(60));

    try {
        // Check existing indexes
        const existingIndexes = await checkExistingIndexes();

        const emailIndexExists = existingIndexes.find(idx => idx.name === "email-index");
        const phoneIndexExists = existingIndexes.find(idx => idx.name === "phone-index");

        // Add email-index if it doesn't exist
        if (!emailIndexExists) {
            const created = await addEmailIndex();
            if (created) {
                await waitForIndexToBeActive("email-index");
            }
        } else if (emailIndexExists.status !== "ACTIVE") {
            console.log("\n⏳ email-index exists but is not ACTIVE yet");
            await waitForIndexToBeActive("email-index");
        } else {
            console.log("\n✓ email-index already exists and is ACTIVE");
        }

        // Add phone-index if it doesn't exist
        if (!phoneIndexExists) {
            const created = await addPhoneIndex();
            if (created) {
                await waitForIndexToBeActive("phone-index");
            } else {
                console.log("\n⚠️  phone-index creation was skipped");
                console.log("   Run this script again after email-index is ACTIVE");
                process.exit(0);
            }
        } else if (phoneIndexExists.status !== "ACTIVE") {
            console.log("\n⏳ phone-index exists but is not ACTIVE yet");
            await waitForIndexToBeActive("phone-index");
        } else {
            console.log("\n✓ phone-index already exists and is ACTIVE");
        }

        console.log("\n" + "=".repeat(60));
        console.log("✅ GSI SETUP COMPLETE!");
        console.log("=".repeat(60));
        console.log("\n📝 Both indexes are now ACTIVE:");
        console.log("   ✓ email-index");
        console.log("   ✓ phone-index");
        console.log("\n🎉 You can now test login!");

    } catch (error) {
        console.error("\n❌ Setup failed:", error);
        process.exit(1);
    }
}

main();
