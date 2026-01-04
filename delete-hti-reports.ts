import dotenv from 'dotenv';
dotenv.config();

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ""
    }
});

const ddbDocClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = "b2b_platform"; // Old table where HTI reports are stored

async function deleteHTIReports() {
    console.log("🔍 Scanning for HTI reports...");

    try {
        // Scan for all HTI reports
        const scanResult = await ddbDocClient.send(
            new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "contains(#sk, :prefix)",
                ExpressionAttributeNames: {
                    "#sk": "sk"
                },
                ExpressionAttributeValues: {
                    ":prefix": "HTI_REPORT#"
                }
            })
        );

        const reports = scanResult.Items || [];
        console.log(`📊 Found ${reports.length} HTI report(s)`);

        if (reports.length === 0) {
            console.log("✅ No HTI reports to delete");
            return;
        }

        // Delete each report
        for (const report of reports) {
            console.log(`🗑️  Deleting report: ${report.reportId} (${report.status})`);

            await ddbDocClient.send(
                new DeleteCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        pk: report.pk,
                        sk: report.sk
                    }
                })
            );

            console.log(`   ✅ Deleted: ${report.reportId}`);
        }

        console.log(`\n🎉 Successfully deleted ${reports.length} HTI report(s)`);
        console.log("\n📝 Next steps:");
        console.log("1. Go to http://localhost:5173/hti");
        console.log("2. Click 'Generate HTI Advisory' button");
        console.log("3. Wait for generation to complete");
        console.log("4. Go to http://localhost:5173/admin/hti");
        console.log("5. Edit and approve the new report");

    } catch (error) {
        console.error("❌ Error deleting HTI reports:", error);
        throw error;
    }
}

// Run the deletion
deleteHTIReports()
    .then(() => {
        console.log("\n✅ Script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Script failed:", error);
        process.exit(1);
    });
