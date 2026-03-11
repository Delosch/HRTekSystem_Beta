import { ActionFunction, json, LoaderFunction, LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData, useLocation } from "@remix-run/react"
import { requireUserSession } from "~/lib/session.server"
import { getAnswerSheetByAssessmentName, getLatestQuestion, save_answers } from "~/utils/question.utils"
import { QuestionSchema } from "./questionSchema"
import EngineFormRender from "./RenderEngineForm"
import VendorFitAssessmentWrapper from "~/components/assessment/VendorFitAssessmentWrapper"
import { generateHTIAdvisory } from "~/lib/hti.deepseek";
import { saveAdvisoryReport } from "~/models/hti.model.server";
import { createOrUpdateEngineStorage, fetchEngineRecomendations, findEngineData } from "~/models/engine.model.server"
import { createLog } from "~/models/companylogs.model.server"
import { addOrUpdateCartItem, CartItem } from "~/models/cart.model.server"
import { calculateFinalPrice } from "~/lib/pricing"

export const loader: LoaderFunction = async ({ params, request }: LoaderFunctionArgs) => {
    const slug = params.id ? decodeURIComponent(params.id) : undefined;
    const url = new URL(request.url);
    
    console.log(`[ENGINE LOADER] URL: ${url.pathname}, Params ID: ${params.id}, Decoded Slug: ${slug}`);
    
    // 🔥 EMERGENCY REDIRECTS - Handle both slugs and full names
    if (slug) {
        const normalized = slug.toLowerCase().trim();
        console.log(`[ENGINE LOADER] Normalized: ${normalized}`);
        if (normalized.includes("hr technology maturity") || normalized.includes("hr-tech-maturity") || normalized.includes("ai maturity") || normalized.includes("ai driven maturity")) {
            console.log("TRIGGERING REDIRECT TO /ai-maturity/assessment");
            throw redirect("/ai-maturity/assessment");
        }
        if (normalized.includes("digital roadmap") || normalized.includes("hr transformation roadmap")) {
            console.log("TRIGGERING REDIRECT TO /digital-roadmap/assessment");
            throw redirect("/digital-roadmap/assessment");
        }
        if (normalized.includes("shared service")) {
            console.log("TRIGGERING REDIRECT TO /shared-services/assessment");
            throw redirect("/shared-services/assessment");
        }
        if (normalized === "change-management" || normalized.includes("intelligent change management")) {
            console.log("TRIGGERING REDIRECT TO /change-management/assessment");
            throw redirect("/change-management/assessment");
        }
    }

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
    let savedProgress = 0;
    if (user && user.organisationId) {
        const engineData = await findEngineData(user.organisationId, question_section);
        existingResponses = engineData?.responses || null;
        savedProgress = engineData?.progress || 0;
        console.log("📝 Existing responses loaded:", existingResponses ? "Yes" : "No", "| Progress:", savedProgress);
    }

    return { questions, question_section, existingResponses, savedProgress };
}

export const action: ActionFunction = async ({ request, params }: ActionFunctionArgs) => {
    try {
        const slug = params.id ? decodeURIComponent(params.id) : undefined;
        // 🔥 EMERGENCY REDIRECTS - Handle both slugs and full names
        if (slug) {
            const normalized = slug.toLowerCase().trim();
            if (normalized.includes("hr technology maturity") || normalized.includes("hr-tech-maturity") || normalized.includes("ai maturity") || normalized.includes("ai driven maturity")) {
                throw redirect("/ai-maturity/assessment");
            }
            if (normalized.includes("digital roadmap") || normalized.includes("hr transformation roadmap")) {
                throw redirect("/digital-roadmap/assessment");
            }
            if (normalized.includes("shared service")) {
                throw redirect("/shared-services/assessment");
            }
            if (normalized === "change-management" || normalized.includes("intelligent change management")) {
                throw redirect("/change-management/assessment");
            }
        }

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
            country: user.country_iso || "Global",
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
                    user.organisationId || companyId,
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
    const LoaderData = useLoaderData<{ questions: QuestionSchema, question_section: string, existingResponses: any, savedProgress: number }>();
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
                savedProgress={LoaderData?.savedProgress ?? 0}
            />
        );
    }

    return (
        <EngineFormRender
            data={LoaderData?.questions}
            engineName={engineName}
            existingResponses={LoaderData?.existingResponses}
            savedProgress={LoaderData?.savedProgress ?? 0}
        />
    )
}