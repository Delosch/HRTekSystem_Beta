import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { getCompanyAdvisories } from "~/models/hti.model.server";

/**
 * API Route: List Company's HTI Advisory Reports
 * GET /api/hti/reports
 * 
 * Returns all advisory reports for the user's company
 */
export async function loader({ request }: LoaderFunctionArgs) {
    try {
        const user = await requireUserSession(request);

        if (!user.organisationId) {
            return json(
                { error: "Organization ID not found" },
                { status: 400 }
            );
        }

        const reports = await getCompanyAdvisories(user.organisationId);

        // Filter out full advisory content for list view
        // Only include metadata
        const reportsList = reports.map(report => ({
            reportId: report.reportId,
            status: report.status,
            generatedAt: report.generatedAt,
            approvedAt: report.approvedAt,
            approvedBy: report.approvedBy,
            executiveSummary: report.advisory.executiveSummary.substring(0, 200) + "...", // Preview only
            completedEngines: report.inputData.completedEnginesCount,
            totalEngines: report.inputData.totalEngines
        }));

        return json({
            success: true,
            reports: reportsList,
            total: reportsList.length
        });
    } catch (error) {
        console.error("Error fetching company advisories:", error);
        return json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
