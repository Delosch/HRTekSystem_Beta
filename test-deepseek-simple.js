// Quick DeepSeek Test
require('dotenv').config();
const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');

async function testDeepSeek() {
    console.log('\n🔍 Testing DeepSeek V3 Integration...\n');

    try {
        const bedrock = new BedrockRuntimeClient({
            region: process.env.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        console.log('📤 Sending test request to DeepSeek V3...');

        const command = new InvokeModelCommand({
            modelId: 'deepseek.v3-v1:0',
            contentType: 'application/json',
            accept: 'application/json',
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: 'Respond with: {"status": "working", "model": "DeepSeek V3"}'
                }],
                temperature: 0.1,
                max_tokens: 100
            })
        });

        const startTime = Date.now();
        const response = await bedrock.send(command);
        const elapsed = Date.now() - startTime;

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));

        console.log(`✅ Response received in ${elapsed}ms\n`);
        console.log('📥 DeepSeek Response:');
        console.log(JSON.stringify(responseBody, null, 2));

        console.log('\n🎉 SUCCESS! DeepSeek V3 is working correctly!\n');
        console.log('Integration Status:');
        console.log('  ✅ AWS Bedrock connection: OK');
        console.log('  ✅ DeepSeek V3 model: ACCESSIBLE');
        console.log('  ✅ Response time: ' + elapsed + 'ms');
        console.log('  ✅ Model ID: deepseek.v3-v1:0');
        console.log('  ✅ Region: ' + (process.env.AWS_REGION || 'ap-south-1'));
        console.log('\n');

    } catch (error) {
        console.error('\n❌ DeepSeek Test FAILED\n');
        console.error('Error:', error.message);
        console.error('Type:', error.name);

        if (error.name === 'ResourceNotFoundException') {
            console.error('\n⚠️  DeepSeek V3 model not available in your region or account');
            console.error('   Please request access in AWS Bedrock console');
        } else if (error.name === 'UnrecognizedClientException') {
            console.error('\n⚠️  Invalid AWS credentials');
        } else if (error.name === 'AccessDeniedException') {
            console.error('\n⚠️  Missing bedrock:InvokeModel permission');
        }

        console.error('\n');
        process.exit(1);
    }
}

testDeepSeek();
