import { json, type ActionFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { generateAdvisoryReport } from "~/services/hti.service.server";

/**
 * API Route: Generate HTI Advisory
 * POST /api/hti/generate
 * 
 * Triggers advisory generation for a company
 */
export async function action({ request }: ActionFunctionArgs) {
    try {
        const user = await requireUserSession(request);

        if (!user.organisationId) {
            return json(
                { error: "Organization ID not found" },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { companyId } = body;

        // Verify user is requesting for their own company
        if (companyId !== user.organisationId) {
            return json(
                { error: "Unauthorized: Can only generate advisory for your own organization" },
                { status: 403 }
            );
        }

        console.log(`📝 HTI Advisory generation requested by user: ${user.userId}`);

        const result = await generateAdvisoryReport(companyId, user.userId);

        if (!result.success) {
            return json(
                { error: result.error },
                { status: 400 }
            );
        }

        return json({
            success: true,
            reportId: result.reportId,
            status: "pending",
            message: "Advisory generation initiated. Report is pending admin approval."
        });
    } catch (error) {
        console.error("Error in HTI generation endpoint:", error);
        return json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
