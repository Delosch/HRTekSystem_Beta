import { config } from "dotenv";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

// Load environment variables
config();

console.log("🔍 AWS Bedrock Connection Test\n");
console.log("Configuration:");
console.log(`  Region: ${process.env.AWS_REGION || 'not set'}`);
console.log(`  Access Key: ${process.env.AWS_ACCESS_KEY_ID ? '✅ Set (' + process.env.AWS_ACCESS_KEY_ID.substring(0, 8) + '...)' : '❌ Not set'}`);
console.log(`  Secret Key: ${process.env.AWS_SECRET_ACCESS_KEY ? '✅ Set' : '❌ Not set'}\n`);

async function testBedrockConnection() {
    const bedrock = new BedrockRuntimeClient({
        region: process.env.AWS_REGION || "ap-south-1",
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
        },
    });

    // Try different model IDs
    const modelIdsToTry = [
        "deepseek.v3-v1:0",
        "anthropic.claude-3-sonnet-20240229-v1:0",
        "anthropic.claude-v2:1",
        "amazon.titan-text-express-v1"
    ];

    for (const modelId of modelIdsToTry) {
        console.log(`\n🧪 Testing model: ${modelId}`);

        try {
            const payload = {
                prompt: "Say 'test' in JSON format: {\"message\": \"test\"}",
                max_tokens: 50,
                temperature: 0.1,
            };

            const command = new InvokeModelCommand({
                modelId,
                contentType: "application/json",
                accept: "application/json",
                body: JSON.stringify(payload),
            });

            const response = await bedrock.send(command);
            console.log(`✅ SUCCESS! Model ${modelId} is accessible`);

            if (response.body) {
                const responseBody = JSON.parse(new TextDecoder().decode(response.body));
                console.log("Response:", JSON.stringify(responseBody, null, 2));
            }

            return modelId; // Return the first working model
        } catch (error: any) {
            console.log(`❌ FAILED: ${error.message}`);
            if (error.name === 'ValidationException') {
                console.log(`   → Model not available in this region`);
            } else if (error.name === 'AccessDeniedException') {
                console.log(`   → Access denied - need to request model access`);
            } else if (error.name === 'UnrecognizedClientException') {
                console.log(`   → Invalid AWS credentials`);
            }
        }
    }

    return null;
}

testBedrockConnection()
    .then((workingModel) => {
        if (workingModel) {
            console.log(`\n✅ Found working model: ${workingModel}`);
            console.log(`\nUpdate your code to use this model ID.`);
        } else {
            console.log(`\n❌ No working models found.`);
            console.log(`\nPossible solutions:`);
            console.log(`1. Request model access in AWS Bedrock Console`);
            console.log(`2. Try a different AWS region (us-east-1, us-west-2)`);
            console.log(`3. Verify IAM permissions include bedrock:InvokeModel`);
        }
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Test failed:", error);
        process.exit(1);
    });
