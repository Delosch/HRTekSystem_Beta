import { json, type LoaderFunctionArgs, redirect, type MetaFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getEnhancedUser } from "~/utils/user.server";
import DigitalRoadmapApp from "~/components/assessment/DigitalRoadmap/App";
import { findEngineData, createOrUpdateEngineStorage } from "~/models/engine.model.server";
import { generateHTIAdvisory } from "~/lib/hti.deepseek";
import { saveAdvisoryReport } from "~/models/hti.model.server";
import { addOrUpdateCartItem } from "~/models/cart.model.server";
import { calculatePricing } from "~/services/pricing.server";

export const meta: MetaFunction = () => {
    return [
        { title: "HR Digital Roadmap Assessment | HRTek System" },
        { name: "description", content: "Generate your customized HR Digital Transformation Roadmap." },
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
        engine_name: "HR Transformation Roadmap Generator",
        country: user.country_iso || "Global",
        progress: progress || 0,
        responses: responses || {}
    });

    if (intent === "generate_report") {
        const aggregatedData = {
            companyId: user.organisationId,
            timestamp: new Date().toISOString(),
            engines: {
                digitalRoadmap: {
                    engineName: "HR Transformation Roadmap Generator",
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
            const advisory = await generateHTIAdvisory(aggregatedData as any, 'digitalRoadmap' as any);
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

            const pricing = calculatePricing({ engine: "roadmap", employeeCount });
            console.log(`HR Roadmap | Employees: ${employeeCount} | Price: ₹${pricing.basePrice.toLocaleString()}`);

            await addOrUpdateCartItem({
                companyId: user.organisationId,
                productName: "HR Transformation Roadmap Generator",
                price: pricing.basePrice,
                userId: user.id || user.userId,
                employeeCount,
            });
        } catch (cartError) {
            console.warn("Failed to add to cart, proceeding:", cartError);
        }

        return json({
            success: true,
            redirect: `/intermediate?promptId=digital_transformation&engine=${encodeURIComponent("HR Transformation Roadmap Generator")}`
        });
    }

    return json({ success: true });
}

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getEnhancedUser(request);
    if (!user) return redirect("/login");

    const engineData = await findEngineData(user.organisationId, "HR Transformation Roadmap Generator");
    const initialAnswers = engineData?.responses || {};
    const savedProgress = engineData?.progress || 0;

    return json({ user, initialAnswers, savedProgress });
}

export default function DigitalRoadmapAssessmentRoute() {
    const { initialAnswers, savedProgress } = useLoaderData<typeof loader>();

    return (
        <DigitalRoadmapApp initialData={initialAnswers} savedProgress={savedProgress} />
    );
}
