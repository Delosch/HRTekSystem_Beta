import { json, type LoaderFunctionArgs, redirect, type MetaFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getEnhancedUser } from "~/utils/user.server";
import { ChangeManagementAssessment } from "~/components/assessment/ChangeManagement/ChangeManagementAssessment";
import { findEngineData, createOrUpdateEngineStorage } from "~/models/engine.model.server";
import { generateHTIAdvisory } from "~/lib/hti.deepseek";
import { saveAdvisoryReport } from "~/models/hti.model.server";
import { calculateCompositeScore, getCompletionPercentage } from "~/components/assessment/ChangeManagement/utils/scoringEngine";

export const meta: MetaFunction = () => {
    return [
        { title: "Change Management Assessment | HRTek System" },
        { name: "description", content: "Assess your enterprise change management readiness and digital adoption intelligence." },
    ];
};

export async function action({ request }: ActionFunctionArgs) {
    const user = await getEnhancedUser(request);
    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const intent = formData.get("intent");
    const responsesStr = formData.get("responses") as string | null;

    // Section-save (no responses key) — just acknowledge
    if (!responsesStr) {
        const sectionAnswersStr = formData.get("answers") as string | null;
        const sectionAnswers = sectionAnswersStr ? JSON.parse(sectionAnswersStr) : {};
        await createOrUpdateEngineStorage({
            company_id: user.organisationId,
            user_id: user.id || user.userId,
            engine_name: "Intelligent Change Management",
            country: user.country_iso || "Global",
            progress: Number(formData.get("progress") || 0),
            responses: sectionAnswers
        });
        return json({ success: true });
    }

    const responses = JSON.parse(responsesStr);

    // Save progress
    const progress = getCompletionPercentage(responses);

    await createOrUpdateEngineStorage({
        company_id: user.organisationId,
        user_id: user.id || user.userId,
        engine_name: "Intelligent Change Management",
        country: user.country_iso || "Global",
        progress: progress,
        responses: responses
    });

    // Full submission (no specific intent) — redirect to intermediate/dashboard
    if (!intent) {
        return json({
            success: true,
            redirect: `/intermediate?promptId=change_management&engine=${encodeURIComponent("Intelligent Change Management")}`
        });
    }

    if (intent === "generate_report") {
        const compositeScore = calculateCompositeScore(responses);
        
        const aggregatedData = {
            companyId: user.organisationId,
            timestamp: new Date().toISOString(),
            engines: {
                changeManagement: {
                    engineName: "Intelligent Change Management",
                    progress: progress,
                    responses: responses,
                    scores: { composite: compositeScore },
                    aiAnalysis: { compositeScore }
                }
            },
            completedEnginesCount: 1,
            totalEngines: 1
        };

        try {
            const advisory = await generateHTIAdvisory(aggregatedData as any, 'changeManagement');
            await saveAdvisoryReport(
                user.organisationId,
                user.id || user.userId,
                advisory,
                aggregatedData as any
            );
            return json({ success: true, advisory });
        } catch (error) {
            console.error("AI Generation Error:", error);
            return json({ error: "Failed to generate AI report" }, { status: 500 });
        }
    }

    return json({ success: true });
}

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getEnhancedUser(request);
    if (!user) {
        return redirect("/login");
    }

    // We can load existing assessment data here if needed
    const engineData = await findEngineData(user.organisationId, "Intelligent Change Management");
    const initialAnswers = engineData?.responses || {};
    const savedProgress = engineData?.progress || 0;

    return json({ user, initialAnswers, savedProgress });
}

export default function ChangeManagementAssessmentRoute() {
    const { user, initialAnswers, savedProgress } = useLoaderData<typeof loader>();

    return (
        <ChangeManagementAssessment initialResponses={initialAnswers} savedProgress={savedProgress} />
    );
}
