/**
 * DynamoDB GSI Setup Script
 * 
 * This script adds the required Global Secondary Indexes (GSIs) to the users table.
 * Run this script once to fix the "email-index" and "phone-index" errors.
 * 
 * Usage: node scripts/setup-dynamodb-indexes.js
 */

import { DynamoDBClient, UpdateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "us-east-1"
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "hrtek-users-prod";

async function checkExistingIndexes() {
    try {
        const command = new DescribeTableCommand({ TableName: TABLE_NAME });
        const response = await client.send(command);

        const existingIndexes = response.Table?.GlobalSecondaryIndexes?.map(idx => idx.IndexName) || [];
        console.log("📋 Existing indexes:", existingIndexes);

        return existingIndexes;
    } catch (error) {
        console.error("❌ Error checking table:", error);
        throw error;
    }
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
                        },
                        ProvisionedThroughput: {
                            ReadCapacityUnits: 5,
                            WriteCapacityUnits: 5
                        }
                    }
                }
            ]
        });

        await client.send(command);
        console.log("✅ email-index created successfully!");
    } catch (error) {
        if (error.name === "ResourceInUseException") {
            console.log("⏳ Table is being updated, please wait...");
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
                        },
                        ProvisionedThroughput: {
                            ReadCapacityUnits: 5,
                            WriteCapacityUnits: 5
                        }
                    }
                }
            ]
        });

        await client.send(command);
        console.log("✅ phone-index created successfully!");
    } catch (error) {
        if (error.name === "ResourceInUseException") {
            console.log("⏳ Table is being updated, please wait...");
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

        // Add email-index if it doesn't exist
        if (!existingIndexes.includes("email-index")) {
            await addEmailIndex();
            console.log("\n⏳ Waiting 60 seconds for email-index to be created...");
            await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
            console.log("\n✓ email-index already exists");
        }

        // Add phone-index if it doesn't exist
        if (!existingIndexes.includes("phone-index")) {
            await addPhoneIndex();
            console.log("\n⏳ Waiting 60 seconds for phone-index to be created...");
            await new Promise(resolve => setTimeout(resolve, 60000));
        } else {
            console.log("\n✓ phone-index already exists");
        }

        console.log("\n" + "=".repeat(60));
        console.log("✅ GSI SETUP COMPLETE!");
        console.log("=".repeat(60));
        console.log("\n📝 Next steps:");
        console.log("1. Wait for indexes to finish creating (check AWS Console)");
        console.log("2. Test login again");
        console.log("\n💡 Note: Index creation can take 5-10 minutes for large tables");

    } catch (error) {
        console.error("\n❌ Setup failed:", error);
        process.exit(1);
    }
}

main();
