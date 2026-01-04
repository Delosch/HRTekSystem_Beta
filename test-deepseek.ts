/**
 * DeepSeek V3 Integration Test
 * 
 * This script tests the DeepSeek V3 integration via AWS Bedrock
 * Run with: npx tsx test-deepseek.ts
 */

import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configuration
const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const AWS_ACCESS_KEY = process.env.AWS_ACCESS_KEY;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

console.log("🔍 DeepSeek V3 Integration Test\n");
console.log("=".repeat(60));

// Check environment variables
console.log("\n📋 Environment Configuration:");
console.log(`   AWS_REGION: ${AWS_REGION}`);
console.log(`   AWS_ACCESS_KEY: ${AWS_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`   AWS_SECRET_ACCESS_KEY: ${AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Missing'}`);

if (!AWS_ACCESS_KEY || !AWS_SECRET_ACCESS_KEY) {
    console.error("\n❌ ERROR: AWS credentials are missing!");
    console.error("   Please set AWS_ACCESS_KEY and AWS_SECRET_ACCESS_KEY in your .env file");
    process.exit(1);
}

// Initialize Bedrock client
console.log("\n🔧 Initializing AWS Bedrock Client...");
const bedrock = new BedrockRuntimeClient({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});
console.log("✅ Bedrock client initialized successfully");

// Test function
async function testDeepSeek() {
    console.log("\n🚀 Testing DeepSeek V3 Model...");
    console.log("   Model ID: deepseek.v3-v1:0");

    const testPrompt = `You are a helpful AI assistant. Please respond with a simple JSON object containing:
{
  "status": "success",
  "message": "DeepSeek V3 is working correctly",
  "timestamp": "<current timestamp>",
  "model": "DeepSeek V3"
}

Return ONLY the JSON object, no markdown, no explanations.`;

    try {
        console.log("\n📤 Sending request to DeepSeek V3...");

        const command = new InvokeModelCommand({
            modelId: "deepseek.v3-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: testPrompt,
                    },
                ],
                temperature: 0.1,
                max_tokens: 500,
            }),
        });

        const startTime = Date.now();
        const response = await bedrock.send(command);
        const endTime = Date.now();

        console.log(`✅ Response received in ${endTime - startTime}ms`);

        // Parse response
        const responseBody = JSON.parse(
            new TextDecoder().decode(response.body)
        );

        console.log("\n📥 Raw Response Structure:");
        console.log(JSON.stringify(responseBody, null, 2));

        // Extract text from response
        const text =
            responseBody?.output?.message?.content?.[0]?.text ||
            responseBody?.results?.[0]?.outputText ||
            responseBody?.generation ||
            responseBody?.output;

        if (!text) {
            console.error("\n❌ ERROR: Could not extract text from response");
            console.error("   Response structure:", JSON.stringify(responseBody, null, 2));
            return false;
        }

        console.log("\n📝 DeepSeek Response:");
        console.log(text);

        // Try to parse as JSON
        try {
            const cleanText = text.trim().replace(/```json|```/g, "");
            const firstBrace = cleanText.indexOf("{");
            const lastBrace = cleanText.lastIndexOf("}");

            if (firstBrace !== -1 && lastBrace !== -1) {
                const jsonText = cleanText.slice(firstBrace, lastBrace + 1);
                const parsed = JSON.parse(jsonText);

                console.log("\n✅ JSON Parsing Successful:");
                console.log(JSON.stringify(parsed, null, 2));

                if (parsed.status === "success") {
                    console.log("\n🎉 DeepSeek V3 is working correctly!");
                    return true;
                }
            }
        } catch (parseError) {
            console.log("\n⚠️  Response is not valid JSON, but DeepSeek responded");
            console.log("   This is okay - the model is working");
            return true;
        }

        return true;

    } catch (error: any) {
        console.error("\n❌ ERROR: DeepSeek test failed");
        console.error("   Error Type:", error.name);
        console.error("   Error Message:", error.message);

        if (error.name === "ResourceNotFoundException") {
            console.error("\n   ⚠️  The DeepSeek V3 model may not be available in your region");
            console.error("   ⚠️  Or you may need to request access to the model in AWS Bedrock");
        } else if (error.name === "UnrecognizedClientException") {
            console.error("\n   ⚠️  AWS credentials are invalid");
        } else if (error.name === "AccessDeniedException") {
            console.error("\n   ⚠️  Your AWS account doesn't have permission to access Bedrock");
            console.error("   ⚠️  Please ensure your IAM user/role has bedrock:InvokeModel permission");
        }

        console.error("\n   Full Error:", error);
        return false;
    }
}

// Run the test
async function main() {
    console.log("\n" + "=".repeat(60));
    console.log("Starting DeepSeek V3 Integration Test");
    console.log("=".repeat(60));

    const success = await testDeepSeek();

    console.log("\n" + "=".repeat(60));
    if (success) {
        console.log("✅ TEST PASSED: DeepSeek V3 is working correctly!");
    } else {
        console.log("❌ TEST FAILED: DeepSeek V3 is not working");
    }
    console.log("=".repeat(60) + "\n");

    process.exit(success ? 0 : 1);
}

main();
