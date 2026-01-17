import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { getPendingApprovals } from "~/models/hti.model.server";
import { processAdminApproval } from "~/services/hti.service.server";

/**
 * API Route: HTI Admin Approvals
 * GET /api/hti/approvals - List pending approvals
 * POST /api/hti/approvals - Approve/Reject advisory
 */

export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const user = await requireUserSession(request);

        // Check if user is admin (type assertion for role field)
        const userWithRole = user as any;
        if (userWithRole.role !== "admin") {
            return json(
                { error: "Unauthorized: Admin access required" },
                { status: 403 }
            );
        }

        const pendingReports = await getPendingApprovals();

        // Format for admin view
        const formattedReports = pendingReports.map(report => ({
            reportId: report.reportId,
            companyId: report.companyId,
            generatedAt: report.generatedAt,
            generatedBy: report.generatedBy,
            status: report.status,
            completedEngines: report.inputData.completedEnginesCount,
            totalEngines: report.inputData.totalEngines,
            executiveSummary: report.advisory.executiveSummary,
            // Include full advisory for admin review
            advisory: report.advisory
        }));

        return json({
            success: true,
            pendingApprovals: formattedReports,
            total: formattedReports.length
        });
    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        return json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function action({ request }: ActionFunctionArgs) {
    try {
        const user = await requireUserSession(request);

        // Check if user is admin (type assertion for role field)
        const userWithRole = user as any;
        if (userWithRole.role !== "admin") {
            return json(
                { error: "Unauthorized: Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { reportId, companyId, action, notes } = body;

        if (!reportId || !companyId || !action) {
            return json(
                { error: "Missing required fields: reportId, companyId, action" },
                { status: 400 }
            );
        }

        if (!["approve", "reject", "request_revision"].includes(action)) {
            return json(
                { error: "Invalid action. Must be: approve, reject, or request_revision" },
                { status: 400 }
            );
        }

        const result = await processAdminApproval(
            companyId,
            reportId,
            action,
            user.userId,
            notes
        );

        if (!result.success) {
            return json(
                { error: result.error },
                { status: 400 }
            );
        }

        return json({
            success: true,
            message: `Advisory ${action}d successfully`,
            reportId,
            newStatus: action === "approve" ? "approved" : action === "reject" ? "rejected" : "revision_requested"
        });
    } catch (error) {
        console.error("Error processing approval:", error);
        return json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
