import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const bedrock = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

async function testDeepSeek() {
    console.log("🧪 Testing AWS Bedrock DeepSeek V3 access...\n");
    console.log("Region:", process.env.AWS_REGION || "ap-south-1");
    console.log("Access Key:", process.env.AWS_ACCESS_KEY_ID ? "✓ Present" : "✗ Missing");

    try {
        const command = new InvokeModelCommand({
            modelId: "deepseek.v3-v1:0",
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify({
                messages: [
                    {
                        role: "user",
                        content: "Say 'Hello from DeepSeek V3!' and nothing else."
                    }
                ],
                temperature: 0.1,
                max_tokens: 50
            })
        });

        console.log("\n📡 Sending test request to DeepSeek V3...");
        const response = await bedrock.send(command);

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        const text = responseBody?.output?.message?.content?.[0]?.text;

        console.log("\n✅ SUCCESS! DeepSeek V3 is working!");
        console.log("Response:", text);
        console.log("\n✨ Your AWS Bedrock is properly configured for DeepSeek V3!");

    } catch (error) {
        console.error("\n❌ ERROR: DeepSeek V3 access failed");
        console.error("Error Code:", error.name);
        console.error("Error Message:", error.message);

        if (error.name === "ResourceNotFoundException") {
            console.log("\n💡 SOLUTION:");
            console.log("1. DeepSeek V3 model is not available in your region (ap-south-1)");
            console.log("2. Try switching to us-east-1 or us-west-2 in your .env file");
            console.log("3. OR enable model access in AWS Bedrock console");
        } else if (error.name === "AccessDeniedException") {
            console.log("\n💡 SOLUTION:");
            console.log("1. Your IAM user lacks Bedrock permissions");
            console.log("2. Add 'bedrock:InvokeModel' permission to your IAM policy");
        } else if (error.name === "ValidationException") {
            console.log("\n💡 SOLUTION:");
            console.log("1. Model ID might be incorrect");
            console.log("2. Check AWS Bedrock console for correct model ID");
        }
    }
}

testDeepSeek();
