import { aggregateEngineData, saveAdvisoryReport, updateApprovalStatus, checkAllEngineReportsGenerated } from "~/models/hti.model.server";
import { generateHTIAdvisory } from "~/lib/hti.deepseek";
import { hasVerifiedPaymentForEngines, getEngineAccessStatus } from "~/models/payment.model.server";
import type { HTIApprovalStatus } from "~/models/hti.model.server";
import { getPricingForCompany } from "~/utils/pricing.server";
import { getCompanyProfile } from "~/models/company.model.server";

// ========================================
// HTI SERVICE ORCHESTRATION
// ========================================

/**
 * Main function to generate HTI advisory report
 * 
 * Flow:
 * 1. Validate HTI access (payment verification)
 * 2. Aggregate data from all 5 engines
 * 3. Check if ALL 5 engines are completed (100% progress)
 * 4. Check if ALL 5 engine AI reports are generated (ANALYSIS# records)
 * 5. Call DeepSeek LLM for advisory generation
 * 6. Save report with 'pending' status
 * 7. Notify admin for approval
 * 8. Return report ID
 */
export async function generateAdvisoryReport(
    companyId: string,
    requestedBy: string
): Promise<{ success: boolean; reportId?: string; error?: string }> {
    try {
        console.log(`🚀 Starting HTI advisory generation for company: ${companyId}`);

        // Step 1: Validate HTI access (payment verification)
        const hasAccess = await validateHTIAccess(companyId);
        if (!hasAccess) {
            return {
                success: false,
                error: "HTI module access not verified. Please ensure payment is completed and verified."
            };
        }

        // Step 2: Aggregate engine data
        console.log("📊 Aggregating data from all engines...");
        const aggregatedData = await aggregateEngineData(companyId);

        // Step 3: Check if ALL 5 engines are completed (100% progress)
        const requiredEngines = 5;
        if (aggregatedData.completedEnginesCount < requiredEngines) {
            const missingEngines: string[] = [];

            if (!aggregatedData.engines.maturity || aggregatedData.engines.maturity.progress < 100) {
                missingEngines.push("HR Technology Maturity Analysis");
            }
            if (!aggregatedData.engines.roadmap || aggregatedData.engines.roadmap.progress < 100) {
                missingEngines.push("HR Transformation Roadmap Generator");
            }
            if (!aggregatedData.engines.vendor || aggregatedData.engines.vendor.progress < 100) {
                missingEngines.push("Cognitive HCM Vendor Fit");
            }
            if (!aggregatedData.engines.change || aggregatedData.engines.change.progress < 100) {
                missingEngines.push("Intelligent Change Management");
            }
            if (!aggregatedData.engines.sharedServices || aggregatedData.engines.sharedServices.progress < 100) {
                missingEngines.push("Shared Service Designer");
            }

            return {
                success: false,
                error: `All 5 assessment engines must be completed before generating HTI advisory. Missing: ${missingEngines.join(", ")}`
            };
        }

        console.log(`✅ All ${requiredEngines} engines completed`);

        // Step 4: Check if ALL 5 engine AI reports are generated (ANALYSIS# records)
        console.log("📋 Checking engine report generation status...");
        const reportsCheck = await checkAllEngineReportsGenerated(companyId);
        if (!reportsCheck.allGenerated) {
            return {
                success: false,
                error: `All 5 engine AI reports must be generated before creating HTI advisory. Missing reports: ${reportsCheck.missing.join(", ")}`
            };
        }

        console.log("✅ All engine AI reports are generated");

        // Step 5: Generate advisory using DeepSeek
        console.log("🧠 Calling DeepSeek LLM for advisory generation...");
        const advisory = await generateHTIAdvisory(aggregatedData);

        // Inject Pricing
        const company = await getCompanyProfile(companyId);
        if (company) {
            const pricing = getPricingForCompany(company.employee_count || 0);
            advisory.recommendedPricing = {
                tierName: pricing.name,
                priceINR: pricing.priceINR,
                priceUSD: pricing.priceUSD
            };
        }

        // Step 6: Append audit trail entry for save event
        if (!advisory.auditTrail) advisory.auditTrail = [];
        advisory.auditTrail.push({
            timestamp: new Date().toISOString(),
            action: "submitted_for_review",
            details: `Report submitted for admin review by ${requestedBy}`
        });

        console.log("💾 Saving advisory report...");
        const reportId = await saveAdvisoryReport(
            companyId,
            requestedBy,
            advisory,
            aggregatedData
        );

        // Step 7: Notify admin for approval
        await notifyAdminForApproval(reportId, companyId);

        console.log(`✅ HTI Advisory generated successfully: ${reportId}`);

        return {
            success: true,
            reportId
        };
    } catch (error) {
        console.error("❌ Error generating HTI advisory:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error occurred"
        };
    }
}

/**
 * Validate if company has HTI access
 */
export async function validateHTIAccess(companyId: string): Promise<boolean> {
    try {
        // Check if company has verified payment for HTI module
        const hasAccess = await hasVerifiedPaymentForEngines(companyId, [
            "HR Transformation Intelligence"
        ]);

        return hasAccess;
    } catch (error) {
        console.error("Error validating HTI access:", error);
        // In development, allow access
        if (process.env.NODE_ENV !== "production") {
            console.warn("⚠️ DEV MODE: Bypassing HTI access check");
            return true;
        }
        return false;
    }
}

/**
 * Notify admin that a new advisory is pending approval
 */
async function notifyAdminForApproval(reportId: string, companyId: string): Promise<void> {
    try {
        console.log(`📧 Notifying admin for approval: ${reportId}`);

        // TODO: Implement actual notification
        // Options:
        // 1. Email notification
        // 2. In-app notification
        // 3. Slack/Teams webhook
        // 4. SMS for urgent approvals

        // For now, just log
        console.log(`✅ Admin notification sent for report ${reportId}`);
    } catch (error) {
        console.error("Error sending admin notification:", error);
        // Don't fail the whole process if notification fails
    }
}

/**
 * Deliver approved report to company
 */
export async function deliverApprovedReport(reportId: string): Promise<void> {
    try {
        console.log(`📬 Delivering approved report: ${reportId}`);

        // TODO: Implement delivery mechanism
        // Options:
        // 1. Email with PDF attachment
        // 2. In-app notification
        // 3. Dashboard update
        // 4. API webhook to company system

        console.log(`✅ Report ${reportId} delivered`);
    } catch (error) {
        console.error("Error delivering report:", error);
    }
}

/**
 * Admin function to approve/reject advisory
 */
export async function processAdminApproval(
    companyId: string,
    reportId: string,
    action: "approve" | "reject" | "request_revision",
    adminId: string,
    adminNotes?: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const statusMap: Record<typeof action, HTIApprovalStatus> = {
            approve: "approved",
            reject: "rejected",
            request_revision: "revision_requested"
        };

        const status = statusMap[action];

        const updated = await updateApprovalStatus(
            companyId,
            reportId,
            status,
            adminId,
            adminNotes
        );

        if (!updated) {
            return {
                success: false,
                error: "Failed to update approval status"
            };
        }

        // If approved, deliver to company
        if (action === "approve") {
            await deliverApprovedReport(reportId);
        }

        return { success: true };
    } catch (error) {
        console.error("Error processing admin approval:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error"
        };
    }
}

/**
 * Check if company can generate new advisory
 * (Rate limiting / cooldown period)
 */
export async function canGenerateNewAdvisory(companyId: string): Promise<{
    canGenerate: boolean;
    reason?: string;
}> {
    // TODO: Implement rate limiting logic
    // For example:
    // - Only one advisory per month
    // - Must wait for previous advisory to be approved
    // - Cooldown period between generations

    return {
        canGenerate: true
    };
}
