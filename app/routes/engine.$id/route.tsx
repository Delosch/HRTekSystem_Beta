import { ActionFunction, json, LoaderFunction, LoaderFunctionArgs, ActionFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData, useLocation } from "@remix-run/react"
import { requireUserSession } from "~/lib/session.server"
import { getAnswerSheetByAssessmentName, getLatestQuestion, save_answers } from "~/utils/question.utils"
import { QuestionSchema } from "./questionSchema"
import EngineFormRender from "./RenderEngineForm"
import VendorFitAssessmentWrapper from "~/components/assessment/VendorFitAssessmentWrapper"
// Note: Per-engine report generation is handled by dedicated assessment routes.
// HTI advisory (cross-engine) is triggered from /hti, not here.
import { createOrUpdateEngineStorage, findEngineData } from "~/models/engine.model.server"
import { createLog } from "~/models/companylogs.model.server"
import { addOrUpdateCartItem, CartItem } from "~/models/cart.model.server"

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

        // Per-engine report redirect map (used by generate_report intent below)
        const ENGINE_REPORT_REDIRECT: Record<string, string> = {
            "HCM Vendor Fit Engine": "/vendorDashboard",
            "Shared Service Designer": "/sharedDashboard",
            "Intelligent Change Management": "/changeDashboard",
        };

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

        // Handle Report Generation Intent — redirect to intermediate to start generation pipeline
        if (body.intent === "generate_report") {
            const ENGINE_PROMPT_MAP: Record<string, string> = {
                "HCM Vendor Fit Engine": "vendor_fit",
                "Shared Service Designer": "shared_service",
                "Intelligent Change Management": "change_management",
                "HR Transformation Roadmap Generator": "digital_transformation",
                "HR Technology Maturity Analysis": "tech_maturity",
            };
            const promptId = ENGINE_PROMPT_MAP[body.params] || "digital_maturity";
            return json({
                success: true,
                redirect: `/intermediate?engine=${encodeURIComponent(body.params)}&promptId=${encodeURIComponent(promptId)}`
            });
        }

        if (body.progress === 100 && body.section === "Completion") {
            const isFreeEngine = body.params === "Profiling Assessment";

            if (!isFreeEngine) {
                // Get employee count for correct per-employee pricing
                const { getCompanyProfile } = await import("~/models/company.model.server");
                const { calculatePricing } = await import("~/services/pricing.server");

                let employeeCount = body.employeeCount ? Number(body.employeeCount) : null;
                if (!employeeCount) {
                    const companyProfile = await getCompanyProfile(companyId);
                    employeeCount = typeof companyProfile?.employee_count === 'number'
                        ? companyProfile.employee_count
                        : parseInt(companyProfile?.employee_count || "500");
                }

                const engineTypeMap: Record<string, string> = {
                    "HCM Vendor Fit Engine": "hcm-vendor-fit",
                    "HR Technology Maturity Analysis": "ai-maturity",
                    "Digital Maturity Assessment": "ai-maturity",
                    "HR AI Based Digital Maturity": "ai-maturity",
                    "AI Driven Maturity Engine": "ai-maturity",
                    "HR Transformation Roadmap Generator": "roadmap",
                    "Intelligent Change Management": "icms",
                    "Shared Service Designer": "shared-services",
                    "Shared Services Designer": "shared-services",
                    "SSC/COE Shared Service Planner": "shared-services",
                    "HTI - HR Transformation Intelligence": "hti",
                };

                const enginePricingType = engineTypeMap[body.params] || "roadmap";
                const months = Number(body.months) || 1;

                const pricing = calculatePricing({ engine: enginePricingType as any, employeeCount, months });
                const price = pricing.basePrice;

                const items: CartItem = {
                    companyId,
                    productName: body.params,
                    price,
                    userId: user.userId,
                    employeeCount,
                };

                console.log(`@@@@@@ Engine: ${body.params} | Employees: ${employeeCount} | Months: ${months} | Price: ₹${price.toLocaleString()}`);
                await addOrUpdateCartItem(items);
            } else {
                console.log("✅ Skipping cart addition for free engine:", body.params);
            }

            // Check transformation eligibility
            const { autoCheckEligibility } = await import("~/services/eligibility.service.server");
            const eligibilityResult = await autoCheckEligibility(companyId);
            console.log("🎯 Eligibility Check:", eligibilityResult.message);

            // All engines redirect directly to intermediate report generator after completion
            return json({ success: true, redirect: `/intermediate?engine=${encodeURIComponent(body.params)}` });
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