import { getDynamoDBDocumentClient } from "./app/lib/dynamodb.server";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import * as fs from 'fs';
import * as path from 'path';

const ddbDocClient = getDynamoDBDocumentClient();

interface UploadResult {
    success: boolean;
    file?: string;
    section?: string;
    sections?: number;
    questions?: number;
    error?: string;
}

async function uploadQuestionSet(filePath: string): Promise<UploadResult> {
    try {
        console.log(`\n📂 Reading file: ${filePath}`);
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const questionData = JSON.parse(fileContent);

        console.log(`📋 Question Section: ${questionData.questionSection}`);
        console.log(`📊 Total Sections: ${questionData.parts.length}`);

        // Count total questions
        const totalQuestions = questionData.parts.reduce((sum: number, part: any) =>
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
        console.error(`❌ Error uploading ${filePath}:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : String(error)
        };
    }
}

async function uploadAllQuestions() {
    console.log("🚀 Starting Question Upload Process...\n");
    console.log("=".repeat(60));

    const questionFiles = [
        'questions/shared-service-designer.json',
        'questions/intelligent-change-management.json',
        'questions/hr-tech-maturity-analysis.json'
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
