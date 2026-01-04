const { DynamoDBClient, ListTablesCommand } = require("@aws-sdk/client-dynamodb");
require('dotenv').config();

console.log("🔍 Testing AWS Credentials...\n");
console.log("Environment variables loaded:");
console.log("- AWS_ACCESS_KEY:", process.env.AWS_ACCESS_KEY ? "✓ Present" : "✗ Missing");
console.log("- AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "✓ Present" : "✗ Missing");
console.log("- AWS_REGION:", process.env.AWS_REGION || "Not set");
console.log("- DYNAMODB_TABLE_NAME:", process.env.DYNAMODB_TABLE_NAME || "Not set");

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

async function testConnection() {
    try {
        console.log("\n🔌 Testing DynamoDB connection...");
        const command = new ListTablesCommand({});
        const response = await client.send(command);

        console.log("\n✅ Connection successful!");
        console.log("📋 Available tables:", response.TableNames);

        if (response.TableNames.includes("Questions")) {
            console.log("✓ 'Questions' table found!");
        } else {
            console.log("⚠️  'Questions' table NOT found. Available tables:", response.TableNames);
        }
    } catch (error) {
        console.error("\n❌ Connection failed!");
        console.error("Error:", error.message);
        console.error("\nPossible issues:");
        console.error("1. AWS credentials are expired or invalid");
        console.error("2. IAM user lacks DynamoDB permissions");
        console.error("3. Wrong AWS region or account");
    }
}

testConnection();
