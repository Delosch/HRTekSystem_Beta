import { ActionFunction, json, LoaderFunction, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData, useLocation } from "@remix-run/react"
import { requireUserSession } from "~/lib/session.server"
import { getAnswerSheetByAssessmentName, getLatestQuestion, save_answers } from "~/utils/question.utils"
import { QuestionSchema } from "./questionSchema"
import EngineFormRender from "./RenderEngineForm"
import VendorFitAssessmentWrapper from "~/components/assessment/VendorFitAssessmentWrapper"
import { generateHTIAdvisory } from "~/lib/hti.deepseek";
import { saveAdvisoryReport } from "~/models/hti.model.server";
import { createOrUpdateEngineStorage, fetchEngineRecomendations } from "~/models/engine.model.server"
import { createLog } from "~/models/companylogs.model.server"
import { addOrUpdateCartItem, CartItem } from "~/models/cart.model.server"
import { calculateFinalPrice } from "~/lib/pricing"

export const loader: LoaderFunction = async ({ params, request }: LoaderFunctionArgs) => {
    // Require authentication first - this will redirect to login if not authenticated
    const user = await requireUserSession(request);

    // Map URL slug IDs to actual question section names in the DB
    const ENGINE_SLUG_MAP: Record<string, string> = {
        "hr-tech-maturity": "HR Technology Maturity Analysis",
        "digital-roadmap": "HR Transformation Roadmap Generator",
        "hcm-vendor-fit": "HCM Vendor Fit Engine",
        "shared-services": "Shared Service Designer",
        "change-management": "Intelligent Change Management"
    };

    const slug = params.id ? decodeURIComponent(params.id) : undefined;

    // Redirect Change Management to the new interactive assessment
    if (slug === "change-management" || slug === "Intelligent Change Management") {
        return redirect("/change-management/assessment");
    }

    const question_section = slug ? (ENGINE_SLUG_MAP[slug] || slug) : undefined;

    if (!question_section) {
        throw new Response("wrong parameters", { status: 404 })
    }

    console.log("Loading questions for section:", question_section, "(Slug:", slug, ")");
    const questions = await getLatestQuestion(question_section);

    if (!questions) {
        console.error(`No questions found for section: ${question_section}`);
    }

    // Fetch existing responses for the authenticated user
    let existingResponses = null;
    if (user && user.organisationId) {
        existingResponses = await getAnswerSheetByAssessmentName(
            user.organisationId,
            question_section
        );
        console.log("📝 Existing responses loaded:", existingResponses ? "Yes" : "No");
    }

    return { questions, question_section, existingResponses };
}

export const action: ActionFunction = async ({ request }: { request: Request }) => {
    try {
        const user = await requireUserSession(request)
        const body = await request.json();
        console.log("action function\n", body)
        const companyId = user.organisationId;
        if (!companyId) { return null }

        // Determine engine type for HTI
        const engineTypeMap: Record<string, 'vendorFit' | 'sharedServices' | 'changeManagement'> = {
            "HCM Vendor Fit Engine": "vendorFit",
            "Shared Service Designer": "sharedServices",
            "Intelligent Change Management": "changeManagement"
        };
        const engineType = engineTypeMap[body.params] || 'vendorFit';

        // save response 
        const dataSheet = {
            company_id: user.organisationId,
            user_id: user.userId,
            engine_name: body.params,
            country: user.country_iso,
            progress: body.progress,
            responses: body.answers // Storing structured answers
        }
        await createOrUpdateEngineStorage(dataSheet)

        try {
            await createLog(companyId, body.params, user.userId, { progress: body.progress })
        } catch (logError) {
            console.warn("Failed to create log entry, proceeding matches:", logError);
        }

        const assessmentId = body.assessment_id ? body.assessment_id.toString() : "";
        await save_answers(companyId, assessmentId.replace("QUESTION#", ""), user.userId, body);

        // Handle AI Report Generation Intent
        if (body.intent === "generate_report") {
            const aggregatedData = {
                companyId: user.organisationId,
                timestamp: new Date().toISOString(),
                engines: {
                    [engineType]: {
                        engineName: body.params,
                        progress: body.progress,
                        responses: body.answers,
                        scores: {}, // Scoring logic for schema-based engines varies
                        aiAnalysis: { }
                    }
                },
                completedEnginesCount: 1,
                totalEngines: 1
            };

            try {
                const advisory = await generateHTIAdvisory(aggregatedData as any, engineType);
                await saveAdvisoryReport(
                    user.organisationId,
                    user.userId,
                    advisory,
                    aggregatedData as any
                );
                return json({ success: true, advisory });
            } catch (error) {
                console.error("AI Generation Error:", error);
                return json({ error: "Failed to generate AI report" }, { status: 500 });
            }
        }

        if (body.progress === 100) {
            // ... (rest of completion logic remains same)
            console.log("__________________________")
            const recommendation = await fetchEngineRecomendations(companyId);
            const rankings = recommendation && recommendation.allRankings ? recommendation.allRankings : [];

            //need profiling assessment response sheet
            const responseSheet = await getAnswerSheetByAssessmentName(companyId, 'Profiling Assessment')
            console.log("Response Sheerrrr \n", responseSheet)

            const orgOverview = responseSheet ? responseSheet["Section 1: Organization Overview"] : {};

            const price = calculateFinalPrice(body.params, orgOverview, user.country_iso, new Map(rankings));
            const items: CartItem = {
                companyId,
                productName: body.params,
                price,
                userId: user.userId
            }
            const isFreeEngine = body.params === "Profiling Assessment" ||
                body.params === "Digital Maturity Assessment" ||
                body.params === "HR Technology Maturity Analysis" ||
                body.params === "HR Tech Maturity Analysis";

            if (!isFreeEngine) {
                console.log("@@@@@@ Net Price is :", price)
                await addOrUpdateCartItem(items)
            } else {
                console.log("✅ Skipping cart addition for free engine:", body.params);
            }

            // Check transformation eligibility
            const { autoCheckEligibility } = await import("~/services/eligibility.service.server");
            const eligibilityResult = await autoCheckEligibility(companyId);
            console.log("🎯 Eligibility Check:", eligibilityResult.message);

            // Redirect to appropriate dashboard based on engine name
            const dashboardMap: Record<string, string> = {
                "HR Transformation Roadmap Generator": `/intermediate?promptId=digital_transformation&engine=${encodeURIComponent("HR Transformation Roadmap Generator")}`,
                "HCM Vendor Fit Engine": `/intermediate?promptId=vendor_fit&engine=${encodeURIComponent("HCM Vendor Fit Engine")}`,
                "Shared Service Designer": `/intermediate?promptId=shared_service&engine=${encodeURIComponent("Shared Service Designer")}`,
                "Intelligent Change Management": `/intermediate?promptId=change_management&engine=${encodeURIComponent("Intelligent Change Management")}`,
                "Change Management Readiness": `/intermediate?promptId=change_management&engine=${encodeURIComponent("Change Management Readiness")}`,
                "HR Technology Maturity Analysis": `/intermediate?promptId=tech_maturity&engine=${encodeURIComponent("HR Technology Maturity Analysis")}`,
                "HR Tech Maturity Analysis": `/intermediate?promptId=tech_maturity&engine=${encodeURIComponent("HR Tech Maturity Analysis")}`,
                "Digital Maturity Assessment": `/intermediate?promptId=digital_maturity&engine=${encodeURIComponent("Digital Maturity Assessment")}`
            };

            const dashboardUrl = dashboardMap[body.params] || "/dashboard";

            // For fetcher-based submissions, we return the URL so the client can navigate if needed
            return json({ success: true, redirect: dashboardUrl });
        }
        return json({ message: "Received!" });
    }
    catch (e) {
        console.error("Error :\n", e)
        throw json("Server Error", { status: 500 });
    }
}
export default function EngineForm() {
    const LoaderData = useLoaderData<{ questions: QuestionSchema, question_section: string, existingResponses: any }>();
    const location = useLocation();

    // Fallback: Get engine name from URL if loader data is missing
    const engineNameFromUrl = decodeURIComponent(location.pathname.split('/').pop() || '');
    const engineName = LoaderData?.question_section || engineNameFromUrl || "Unknown Engine";

    // Use premium assessment wrapper for specific engines
    const isPremiumEngine = engineName === "HCM Vendor Fit Engine" || engineName === "Shared Service Designer";

    if (isPremiumEngine && LoaderData?.questions?.parts?.length > 0) {
        return (
            <VendorFitAssessmentWrapper
                data={LoaderData.questions}
                engineName={engineName}
                existingResponses={LoaderData?.existingResponses}
            />
        );
    }

    return (
        <EngineFormRender
            data={LoaderData?.questions}
            engineName={engineName}
            existingResponses={LoaderData?.existingResponses}
        />
    )
}