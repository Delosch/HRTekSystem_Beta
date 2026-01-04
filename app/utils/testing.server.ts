import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { UpdateCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";
const ddbDocClient = getDynamoDBDocumentClient();

/**
 * Testing Utility: Mark All Engines as Completed
 * Use this to test the eligibility and HTI flow
 */

const ALL_ENGINES = [
    "HR Transformation Roadmap Generator",
    "Cognitive HCM Vendor Fit",
    "Shared Service Designer",
    "Intelligent Change Management",
    "HR Technology Maturity Analysis"
];

/**
 * Mark all engines as 100% complete for a company
 */
export async function markAllEnginesComplete(companyId: string, userId: string) {
    console.log(`\n🧪 TESTING: Marking all engines complete for company ${companyId}\n`);

    const results = [];

    for (const engineName of ALL_ENGINES) {
        try {
            // Update engine to 100% progress
            await ddbDocClient.send(
                new UpdateCommand({
                    TableName: DYNAMODB_TABLE_NAME,
                    Key: {
                        pk: `COMPANY#${companyId}`,
                        sk: `ENGINE#${engineName}`
                    },
                    UpdateExpression: "SET progress = :progress, updatedAt = :updated, completedAt = :completed",
                    ExpressionAttributeValues: {
                        ":progress": 100,
                        ":updated": new Date().toISOString(),
                        ":completed": new Date().toISOString()
                    }
                })
            );

            console.log(`✅ Marked ${engineName} as 100% complete`);
            results.push({ engine: engineName, status: "success" });
        } catch (error) {
            console.error(`❌ Failed to mark ${engineName}:`, error);
            results.push({ engine: engineName, status: "failed", error });
        }
    }

    console.log(`\n✅ Completed marking ${results.filter(r => r.status === "success").length}/${ALL_ENGINES.length} engines\n`);

    return results;
}

/**
 * Create mock payment records for all engines
 */
export async function createMockPayments(companyId: string, userId: string) {
    console.log(`\n💰 TESTING: Creating mock payment records for company ${companyId}\n`);

    const results = [];

    for (const engineName of ALL_ENGINES) {
        try {
            const paymentId = `TEST_PAYMENT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            await ddbDocClient.send(
                new PutCommand({
                    TableName: DYNAMODB_TABLE_NAME,
                    Item: {
                        pk: `COMPANY#${companyId}`,
                        sk: `PAYMENT#${paymentId}`,
                        paymentId,
                        userId,
                        companyId,
                        engines: [engineName],
                        amount: 45000,
                        currency: "INR",
                        status: "verified",
                        paymentMethod: "test",
                        verifiedAt: new Date().toISOString(),
                        verifiedBy: "TEST_SCRIPT",
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                })
            );

            console.log(`✅ Created verified payment for ${engineName}`);
            results.push({ engine: engineName, status: "success" });
        } catch (error) {
            console.error(`❌ Failed to create payment for ${engineName}:`, error);
            results.push({ engine: engineName, status: "failed", error });
        }
    }

    console.log(`\n✅ Created ${results.filter(r => r.status === "success").length}/${ALL_ENGINES.length} payment records\n`);

    return results;
}

/**
 * Complete testing setup - marks engines complete AND creates payments
 */
export async function setupTestingEnvironment(companyId: string, userId: string) {
    console.log(`\n🚀 SETTING UP TESTING ENVIRONMENT\n`);
    console.log(`Company ID: ${companyId}`);
    console.log(`User ID: ${userId}\n`);

    // Step 1: Mark all engines complete
    const engineResults = await markAllEnginesComplete(companyId, userId);

    // Step 2: Create payment records
    const paymentResults = await createMockPayments(companyId, userId);

    // Step 3: Trigger eligibility check
    console.log(`\n🎯 Triggering eligibility check...\n`);

    try {
        const { autoCheckEligibility } = await import("~/services/eligibility.service");
        const eligibilityResult = await autoCheckEligibility(companyId);

        console.log(`\n📊 ELIGIBILITY RESULT:`);
        console.log(`   Eligible: ${eligibilityResult.eligible}`);
        console.log(`   Message: ${eligibilityResult.message}`);
        console.log(`   Proposal Generated: ${eligibilityResult.proposalGenerated || false}\n`);
    } catch (error) {
        console.error(`❌ Error checking eligibility:`, error);
    }

    console.log(`\n✅ TESTING ENVIRONMENT SETUP COMPLETE!\n`);
    console.log(`Next steps:`);
    console.log(`1. Navigate to /dashboard to see eligibility widget`);
    console.log(`2. Navigate to /hti to test HTI advisory generation`);
    console.log(`3. Check console logs for eligibility and proposal messages\n`);

    return {
        engines: engineResults,
        payments: paymentResults
    };
}
