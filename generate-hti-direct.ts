/**
 * Direct HTI Report Generation Script
 * Bypasses all validation to test DeepSeek
 * Run with: npx tsx generate-hti-direct.ts
 */

import { config } from "dotenv";
config();

const COMPANY_ID = "0867dc3e-ec46-46ac-96e2-fe6fd9705d7b";
const USER_ID = "dbe2ceef-08ee-4a12-8f7a-e953fb0c206a";

async function generateHTIReportDirect() {
    console.log("🚀 Direct HTI Report Generation\n");
    console.log(`Company ID: ${COMPANY_ID}`);
    console.log(`User ID: ${USER_ID}\n`);

    try {
        // Import the service
        const { generateAdvisoryReport } = await import("./app/services/hti.service");

        console.log("📝 Calling HTI service...\n");

        const result = await generateAdvisoryReport(COMPANY_ID, USER_ID);

        if (!result.success) {
            console.error("\n❌ HTI Generation Failed:");
            console.error(`Error: ${result.error}\n`);
            process.exit(1);
        }

        console.log("\n✅ HTI Report Generated Successfully!\n");
        console.log(`Report ID: ${result.reportId}`);
        console.log(`\nThe report has been saved to DynamoDB with status: pending`);
        console.log(`\nNext steps:`);
        console.log(`1. Refresh the HTI page to see the report`);
        console.log(`2. Admin can approve it from admin dashboard`);
        console.log(`3. Once approved, it will appear on user dashboard\n`);

        process.exit(0);
    } catch (error) {
        console.error("\n❌ Error:", error);
        process.exit(1);
    }
}

generateHTIReportDirect();
