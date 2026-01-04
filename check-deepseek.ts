/**
 * Simple DeepSeek Configuration Check
 */

import dotenv from "dotenv";
dotenv.config();

console.log("\n=== DeepSeek Configuration Check ===\n");

const config = {
    AWS_REGION: process.env.AWS_REGION,
    AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    DYNAMODB_TABLE_NAME: process.env.DYNAMODB_TABLE_NAME,
};

console.log("Environment Variables:");
console.log("- AWS_REGION:", config.AWS_REGION || "❌ NOT SET");
console.log("- AWS_ACCESS_KEY:", config.AWS_ACCESS_KEY ? `✅ Set (${config.AWS_ACCESS_KEY.substring(0, 4)}...)` : "❌ NOT SET");
console.log("- AWS_SECRET_ACCESS_KEY:", config.AWS_SECRET_ACCESS_KEY ? "✅ Set (hidden)" : "❌ NOT SET");
console.log("- DYNAMODB_TABLE_NAME:", config.DYNAMODB_TABLE_NAME || "❌ NOT SET");

console.log("\n=== DeepSeek Status ===");

if (!config.AWS_ACCESS_KEY || !config.AWS_SECRET_ACCESS_KEY) {
    console.log("❌ AWS credentials are NOT configured");
    console.log("\nTo use DeepSeek V3, you need to:");
    console.log("1. Create a .env file in the project root");
    console.log("2. Add the following variables:");
    console.log("   AWS_REGION=ap-south-1");
    console.log("   AWS_ACCESS_KEY=your_access_key");
    console.log("   AWS_SECRET_ACCESS_KEY=your_secret_key");
    console.log("   DYNAMODB_TABLE_NAME=your_table_name");
} else {
    console.log("✅ AWS credentials are configured");
    console.log("✅ DeepSeek V3 should be accessible via AWS Bedrock");
    console.log("\nModel Details:");
    console.log("- Model ID: deepseek.v3-v1:0");
    console.log("- Service: AWS Bedrock Runtime");
    console.log("- Region:", config.AWS_REGION);
}

console.log("\n=== Integration Files ===");
console.log("- app/lib/processor.genAi.ts - Main AI processor");
console.log("- app/lib/digitalMaturity.genAi.ts - Digital maturity analysis");

console.log("\n");
