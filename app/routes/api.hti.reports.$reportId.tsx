import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { getAdvisoryReport } from "~/models/hti.model.server";

/**
 * API Route: Get Specific HTI Advisory Report
 * GET /api/hti/reports/:reportId
 * 
 * Returns advisory report (only if approved or user is admin)
 */
export async function loader({ request, params }: LoaderFunctionArgs) {
    try {
        const user = await requireUserSession(request);
        const { reportId } = params;

        if (!reportId) {
            return json(
                { error: "Report ID is required" },
                { status: 400 }
            );
        }

        if (!user.organisationId) {
            return json(
                { error: "Organization ID not found" },
                { status: 400 }
            );
        }

        const report = await getAdvisoryReport(user.organisationId, reportId);

        if (!report) {
            return json(
                { error: "Report not found" },
                { status: 404 }
            );
        }

        // Check authorization
        // Only show approved reports to regular users
        // Admins can see all reports
        const userWithRole = user as any;
        const isAdmin = userWithRole.role === "admin";

        if (!isAdmin && report.status !== "approved") {
            return json(
                {
                    error: "Report is not yet approved",
                    status: report.status,
                    message: "This report is pending admin approval"
                },
                { status: 403 }
            );
        }

        return json({
            success: true,
            report
        });
    } catch (error) {
        console.error("Error fetching HTI report:", error);
        return json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
