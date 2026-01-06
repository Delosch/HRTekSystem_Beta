const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize DynamoDB client
const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

const ddbDocClient = DynamoDBDocumentClient.from(client);

async function uploadQuestionSet(filePath) {
    try {
        console.log(`\n📂 Reading file: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const questionData = JSON.parse(fileContent);

        console.log(`📋 Question Section: ${questionData.questionSection}`);
        console.log(`📊 Total Sections: ${questionData.parts.length}`);

        // Count total questions
        const totalQuestions = questionData.parts.reduce((sum, part) =>
            sum + part.questions.length, 0
        );
        console.log(`❓ Total Questions: ${totalQuestions}`);

        const putCommand = new PutCommand({
            TableName: "Questions",
            Item: questionData
        });

        await ddbDocClient.send(putCommand);
        console.log(`✅ Successfully uploaded: ${questionData.questionSection}`);

        return {
            success: true,
            section: questionData.questionSection,
            sections: questionData.parts.length,
            questions: totalQuestions
        };
    } catch (error) {
        console.error(`❌ Error uploading ${filePath}:`, error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

async function uploadAllQuestions() {
    console.log("🚀 Starting Question Upload Process...\n");
    console.log("=".repeat(60));

    const questionFiles = [
        'questions/shared-service-designer.json',
        'questions/intelligent-change-management.json',
        'questions/hr-tech-maturity-analysis-updated.json',
        'questions/profiling-assessment.json',
        'questions/vendor-evaluation.json',
        'questions/hr-transformation-roadmap-generator.json'
    ];

    const results = [];

    for (const file of questionFiles) {
        const filePath = path.join(process.cwd(), file);

        if (!fs.existsSync(filePath)) {
            console.log(`⚠️  File not found: ${filePath}`);
            results.push({ success: false, file, error: 'File not found' });
            continue;
        }

        const result = await uploadQuestionSet(filePath);
        results.push({ ...result, file });

        // Add delay between uploads
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 UPLOAD SUMMARY");
    console.log("=".repeat(60));

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`\n✅ Successful: ${successful.length}/${results.length}`);
    successful.forEach(r => {
        console.log(`   - ${r.section}: ${r.sections} sections, ${r.questions} questions`);
    });

    if (failed.length > 0) {
        console.log(`\n❌ Failed: ${failed.length}/${results.length}`);
        failed.forEach(r => {
            console.log(`   - ${r.file}: ${r.error}`);
        });
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Upload process completed!");
    console.log("=".repeat(60));
}

// Run the upload
uploadAllQuestions()
    .then(() => {
        console.log("\n✨ All done! You can now test the new assessment engines.");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n💥 Fatal error:", error);
        process.exit(1);
    });
