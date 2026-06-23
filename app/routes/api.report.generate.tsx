import { json, type ActionFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";

/**
 * API Resource Route: Generate Strategic Advisory Report
 * POST /api/report/generate
 *
 * Dedicated resource route for AI report generation.
 * This is a resource route (no default export) so Remix won't try to
 * decode the response as turbo-stream — preventing 504 HTML pages from
 * crashing the UI.
 */
export async function action({ request }: ActionFunctionArgs) {
  try {
    const user = await requireUserSession(request);
    if (!user || !user.organisationId) {
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { engineName, answers } = body;

    if (!engineName) {
      return json({ error: "Missing engineName" }, { status: 400 });
    }

    console.log(`[API Report Generate] Generating report for: ${engineName}`);

    const engineTypeMap: Record<string, string> = {
      "Intelligent Change Management": "changeManagement",
      "Shared Service Designer": "sharedServices",
      "HCM Vendor Fit Engine": "vendorFit",
      "HR Transformation Roadmap Generator": "sharedServices",
      "HR Technology Maturity Analysis": "sharedServices",
      "HR Tech Maturity Analysis": "sharedServices",
    };

    const engineType = engineTypeMap[engineName] || "sharedServices";

    const aggregatedData = {
      companyId: user.organisationId,
      timestamp: new Date().toISOString(),
      engines: {
        [engineType]: {
          engineName,
          progress: 100,
          responses: answers || {},
          scores: {},
          aiAnalysis: {},
        },
      },
      completedEnginesCount: 1,
      totalEngines: 1,
    };

    const { generateHTIAdvisory } = await import("~/lib/hti.deepseek");
    const { saveAdvisoryReport } = await import("~/models/hti.model.server");
    const advisory = await generateHTIAdvisory(aggregatedData as any);
    await saveAdvisoryReport(user.organisationId, user.userId, advisory, aggregatedData as any);

    return json({ success: true, advisory });
  } catch (error) {
    console.error("[API Report Generate] Error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate AI report";
    return json({ error: message }, { status: 500 });
  }
}
