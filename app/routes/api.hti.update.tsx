import { json, type ActionFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";

/**
 * API Route: Update HTI Advisory Content
 * POST /api/hti/update
 * 
 * Allows admin to update advisory content before approval
 */
export async function action({ request }: ActionFunctionArgs) {
    try {
        const user = await requireUserSession(request);

        // Check if user is admin (bypassed in development)
        const userWithRole = user as any;
        if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
            return json(
                { error: "Unauthorized: Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { reportId, companyId, advisory, action } = body;

        if (!reportId || !companyId || !advisory) {
            return json(
                { error: "Missing required fields: reportId, companyId, advisory" },
                { status: 400 }
            );
        }

        console.log(`📝 Admin updating HTI report: ${reportId}, action: ${action || 'save'}`);

        const { updateAdvisoryContent } = await import("~/models/hti.model");
        const result = await updateAdvisoryContent(companyId, reportId, advisory);

        if (!result.success) {
            return json(
                { error: result.error },
                { status: 400 }
            );
        }

        // If action is approve, also update status
        if (action === "approve") {
            const { processAdminApproval } = await import("~/services/hti.service");
            const approvalResult = await processAdminApproval(
                companyId,
                reportId,
                "approve",
                user.userId,
                "Approved after editing"
            );

            if (!approvalResult.success) {
                return json(
                    { error: approvalResult.error },
                    { status: 400 }
                );
            }

            console.log(`✅ HTI report updated and approved: ${reportId}`);
            return json({
                success: true,
                message: "Report updated and approved successfully",
                reportId
            });
        }

        console.log(`✅ HTI report updated: ${reportId}`);
        return json({
            success: true,
            message: "Report updated successfully",
            reportId
        });
    } catch (error) {
        console.error("Error updating HTI report:", error);
        return json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
