import { ActionFunction, json, type LoaderFunctionArgs, redirect, type MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getEnhancedUser } from "~/utils/user.server";
import AiMaturityDashboard from "~/components/reports/AiMaturity/App";
import { findEngineData } from "~/models/engine.model.server";

export const meta: MetaFunction = () => [
    { title: "AI Maturity Report | HRTek System" },
    { name: "description", content: "Your detailed AI-driven HR technology maturity report and strategic insights." },
];

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getEnhancedUser(request);
    if (!user) return redirect("/login");

    const engineData = await findEngineData(user.organisationId, "AI Driven Maturity Engine");
    if (!engineData) return redirect("/ai-maturity/dashboard");

    const { getCompanyAdvisories } = await import("~/models/hti.model.server");
    const advisories = await getCompanyAdvisories(user.organisationId);
    const latestReportId = advisories.length > 0 ? advisories[0].reportId : null;

    return json({ user, engineData, latestReportId });
}

export const action: ActionFunction = async ({ request }) => {
    const user = await getEnhancedUser(request);
    if (!user || !user.organisationId) return json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { intent, answers, params } = body;

    if (intent === "generate_report") {
        const { generateHTIAdvisory } = await import("~/lib/hti.deepseek");
        const { saveAdvisoryReport } = await import("~/models/hti.model.server");

        const aggregatedData = {
            companyId: user.organisationId,
            timestamp: new Date().toISOString(),
            engines: {
                aiMaturity: {
                    engineName: params,
                    progress: 100,
                    responses: answers || {},
                }
            }
        };

        try {
            const advisory = await generateHTIAdvisory(aggregatedData as any, "aiMaturity");
            await saveAdvisoryReport(user.organisationId, user.userId, advisory, aggregatedData as any);
            return json({ success: true, advisory });
        } catch (error) {
            console.error("AI Generation Error:", error);
            return json({ error: "Failed to generate AI report" }, { status: 500 });
        }
    }
    return json({ error: "Invalid intent" }, { status: 400 });
};

export default function AiMaturityReportRoute() {
    const { user, engineData, latestReportId } = useLoaderData<typeof loader>();

    return (
        <>
            <AiMaturityDashboard
                data={engineData}
                brandName={user.organisationName || "Your Organization"}
                companyLogo={user.companyLogo}
                reportId={latestReportId}
            />
            <Link
                to="/ai-maturity/assessment?modify=true"
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-full shadow-lg text-sm font-semibold transition-colors"
            >
                ✏️ Modify Responses
            </Link>
        </>
    );
}
