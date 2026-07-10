import { ActionFunction, json, type LoaderFunctionArgs, redirect, type MetaFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getEnhancedUser } from "~/utils/user.server";
import DigitalRoadmapDashboard from "~/components/reports/DigitalRoadmap/App";
import { findEngineData } from "~/models/engine.model.server";

export const meta: MetaFunction = () => {
    return [
        { title: "HR Digital Roadmap Dashboard | HRTek System" },
        { name: "description", content: "View your customized HR Digital Transformation Roadmap." },
    ];
};

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const isVerifyPoll = url.searchParams.get("verify") === "true";

    const user = await getEnhancedUser(request);
    if (!user) {
        if (isVerifyPoll) return new Response(null, { status: 202 });
        return redirect("/login");
    }

    // Wrap all DB operations in try-catch so verify polling never 500s
    let engineData: any = null;
    try {
        engineData = await findEngineData(user.organisationId, "HR Transformation Roadmap Generator");
    } catch (e) {
        console.error("[digital-roadmap dashboard] findEngineData failed:", e);
        if (isVerifyPoll) return new Response(null, { status: 202 });
    }

    if (!engineData || engineData.progress < 100) {
        if (isVerifyPoll) return new Response(null, { status: 202 });
        return redirect("/roadmapDashboard");
    }

    // Payment gating
    const hasPaid = true; // BYPASS: Force paid for testing

    if (!hasPaid) {
        if (isVerifyPoll) return new Response(null, { status: 202 });
        return redirect("/roadmapDashboard");
    }

    // Fetch real DeepSeek AI analysis data
    const { getLatestAnalysis } = await import("~/utils/analysis.server");
    let aiAnalysis = null;
    try {
        aiAnalysis = await getLatestAnalysis(user.organisationId, "HR Transformation Roadmap Generator");
        // Also try the mapped section name if the first query returns nothing
        if (!aiAnalysis) {
            aiAnalysis = await getLatestAnalysis(user.organisationId, "Digital Roadmap");
        }
    } catch (e) {
        console.error("[digital-roadmap dashboard] getLatestAnalysis failed:", e);
    }

    const isReportReady = aiAnalysis && aiAnalysis.result && aiAnalysis.result.status !== "pending_generation";

    // For verify polling from intermediate.tsx — return early with status code
    if (isVerifyPoll) {
        return new Response(null, { status: isReportReady ? 200 : 202 });
    }

    let latestReportId = null;
    try {
        const { getCompanyAdvisories } = await import("~/models/hti.model.server");
        const advisories = await getCompanyAdvisories(user.organisationId);
        latestReportId = advisories.length > 0 ? advisories[0].reportId : null;
    } catch (e) {
        console.error("[digital-roadmap dashboard] getCompanyAdvisories failed:", e);
    }

    return json({ user, engineData, aiAnalysis, latestReportId });
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
                digitalRoadmap: {
                    engineName: params,
                    progress: 100,
                    responses: answers || {},
                }
            }
        };

        try {
            const advisory = await generateHTIAdvisory(aggregatedData as any);
            await saveAdvisoryReport(user.organisationId, user.userId, advisory, aggregatedData as any);
            return json({ success: true, advisory });
        } catch (error) {
            console.error("AI Generation Error:", error);
            return json({ error: "Failed to generate AI report" }, { status: 500 });
        }
    }
    return json({ error: "Invalid intent" }, { status: 400 });
};

export default function DigitalRoadmapDashboardRoute() {
    const { user, engineData, aiAnalysis, latestReportId } = useLoaderData<typeof loader>();

    return (
        <>
            <DigitalRoadmapDashboard
                data={engineData}
                aiAnalysis={aiAnalysis}
                brandName={user.organisationName || "Your Organization"}
                companyLogo={user.companyLogo}
                reportId={latestReportId}
            />
            <Link
                to="/digital-roadmap/assessment?modify=true"
                className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg text-sm font-semibold transition-colors"
            >
                ✏️ Modify Responses
            </Link>
        </>
    );
}
