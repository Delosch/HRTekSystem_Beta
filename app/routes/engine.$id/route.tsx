import { ActionFunction, json, LoaderFunction, LoaderFunctionArgs, redirect } from "@remix-run/node"
import { useLoaderData, useLocation } from "@remix-run/react"
import { requireUserSession } from "~/lib/session.server"
import { getAnswerSheetByAssessmentName, getLatestQuestion, save_answers } from "~/utils/question.utils"
import { QuestionSchema } from "./questionSchema"
import EngineFormRender from "./RenderEngineForm"
// import { generate } from "~/lib/processor.genAi"
import { createOrUpdateEngineStorage, fetchEngineRecomendations } from "~/models/engine.model.server"
import { createLog } from "~/models/companylogs.model.server"
import { addOrUpdateCartItem, CartItem } from "~/models/cart.model.server"
import { calculateFinalPrice } from "~/lib/pricing"

//
//HCM Vendor Fit Engine
// let question_section = "HR Digital Transformation"
//digital_transformation
// //vendor_fit
// const prompt_id = "digital_transformation"

export const loader: LoaderFunction = async ({ params, request }: LoaderFunctionArgs) => {
    // Decode the URL parameter to get the actual engine name
    const question_section = params.id ? decodeURIComponent(params.id) : undefined;

    if (!question_section) {
        throw new Response("wrong parameters", { status: 404 })
    }

    console.log("Loading questions for:", question_section);
    const questions = await getLatestQuestion(question_section);

    if (!questions) {
        console.error(`No questions found for section: ${question_section}`);
    }

    // Fetch existing responses if user is authenticated
    let existingResponses = null;
    try {
        const user = await requireUserSession(request);
        if (user && user.organisationId) {
            existingResponses = await getAnswerSheetByAssessmentName(
                user.organisationId,
                question_section
            );
            console.log("📝 Existing responses loaded:", existingResponses ? "Yes" : "No");
        }
    } catch (error) {
        // User might not be authenticated, continue without existing responses
        console.log("No existing responses found or user not authenticated");
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
        // save response 

        const dataSheet = {
            company_id: user.organisationId,
            user_id: user.userId,
            engine_name: body.params,
            country: user.country_iso,
            progress: body.progress
        }
        await createOrUpdateEngineStorage(dataSheet)

        try {
            await createLog(companyId, body.params, user.userId, { progress: body.progress })
        } catch (logError) {
            console.warn("Failed to create log entry, proceeding matches:", logError);
        }

        const assessmentId = body.assessment_id ? body.assessment_id.toString() : "";
        await save_answers(companyId, assessmentId.replace("QUESTION#", ""), user.userId, body);

        if (body.progress === 100) {
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
            console.log("@@@@@@ Net Price is :", price)
            await addOrUpdateCartItem(items)

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

    // Debug logging
    console.log("🔍 EngineForm - LoaderData:", LoaderData);
    console.log("🔍 EngineForm - question_section:", LoaderData?.question_section);
    console.log("🔍 EngineForm - engineNameFromUrl:", engineNameFromUrl);
    console.log("🔍 EngineForm - final engineName:", engineName);
    console.log("🔍 EngineForm - questions:", LoaderData?.questions);
    console.log("🔍 EngineForm - existingResponses:", LoaderData?.existingResponses);

    return (
        <EngineFormRender
            data={LoaderData?.questions}
            engineName={engineName}
            existingResponses={LoaderData?.existingResponses}
        />
    )
}