import { json, type LoaderFunctionArgs, redirect, type MetaFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getEnhancedUser } from "~/utils/user.server";
import AiMaturityApp from "~/components/assessment/AiMaturity/App";
import { findEngineData, createOrUpdateEngineStorage } from "~/models/engine.model.server";
import { generateHTIAdvisory } from "~/lib/hti.deepseek";
import { saveAdvisoryReport } from "~/models/hti.model.server";
import { addOrUpdateCartItem } from "~/models/cart.model.server";
import { calculatePricing } from "~/services/pricing.server";

export const meta: MetaFunction = () => {
    return [
        { title: "AI Driven Maturity Assessment | HRTek System" },
        { name: "description", content: "Assess your AI transformation maturity and digital readiness." },
    ];
};

export async function action({ request }: ActionFunctionArgs) {
    const user = await getEnhancedUser(request);
    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { responses, progress, intent, employeeCount: submittedEmployeeCount } = body;

    await createOrUpdateEngineStorage({
        company_id: user.organisationId,
        user_id: user.id || user.userId,
        engine_name: "AI Driven Maturity Engine",
        country: user.country_iso || "Global",
        progress: progress || 0,
        responses: responses || {}
    });

    if (intent === "generate_report") {
        const aggregatedData = {
            companyId: user.organisationId,
            timestamp: new Date().toISOString(),
            engines: {
                aiMaturity: {
                    engineName: "AI Driven Maturity Engine",
                    progress: progress,
                    responses: responses,
                    scores: {},
                    aiAnalysis: {}
                }
            },
            completedEnginesCount: 1,
            totalEngines: 1
        };

        try {
            const advisory = await generateHTIAdvisory(aggregatedData as any, 'aiMaturity' as any);
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

    if (progress === 100 && submittedEmployeeCount) {
        try {
            const employeeCount = Number(submittedEmployeeCount);

            const pricing = calculatePricing({ engine: "ai-maturity", employeeCount });
            console.log(`AI Maturity | Employees: ${employeeCount} | Price: ₹${pricing.basePrice.toLocaleString()}`);

            await addOrUpdateCartItem({
                companyId: user.organisationId,
                productName: "AI Driven Maturity Engine",
                price: pricing.basePrice,
                userId: user.id || user.userId,
                employeeCount,
            });
        } catch (cartError) {
            console.warn("Failed to add to cart, proceeding:", cartError);
        }

        return json({
            success: true,
            redirect: `/intermediate?promptId=digital_maturity&engine=${encodeURIComponent("AI Driven Maturity Engine")}`
        });
    }

    return json({ success: true });
}

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getEnhancedUser(request);
    if (!user) return redirect("/login");

    if ((user as any).role !== "ADMIN") {
        const access = await import("~/models/payment.model.server").then((mod) =>
            mod.getEngineAccessStatus(user.organisationId, "AI Driven Maturity Engine")
        );
        if (!access.assessmentUnlocked) {
            return redirect("/user-payment-dashboard");
        }
    }

    const engineData = await findEngineData(user.organisationId, "AI Driven Maturity Engine");
    const initialAnswers = engineData?.responses || {};
    const savedProgress = engineData?.progress || 0;

    return json({ user, initialAnswers, savedProgress });
}

export default function AiMaturityAssessmentRoute() {
    const { initialAnswers, savedProgress } = useLoaderData<typeof loader>();

    return (
        <AiMaturityApp initialData={initialAnswers} savedProgress={savedProgress} />
    );
}
