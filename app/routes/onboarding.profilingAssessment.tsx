import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { commitSession, getSession, requireUserSession } from "~/lib/session.server";
import { getLatestQuestion, save_answers } from "~/utils/question.utils";
import QuestionnaireEngine from "~/components/QuestionnaireEngine";
import type { QuestionSchema } from "./engine.$id/questionSchema";
import { updateUser } from "~/models/user.model";
import { generate } from "~/lib/processor.genAi";
import { createOrUpdateEngineStorage, fetchEngineRecomendations } from "~/models/engine.model";
import { addOrUpdateCartItem, CartItem } from "~/models/cart.model";
import { calculateFinalPrice } from "~/lib/pricing";

// let's keep a single variable just now to manage assessment form
const variable = "Profiling Assessment"
const prompt_id = "digital_maturity"
export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  const session = await requireUserSession(request)
  if (session) {
    const questions = await getLatestQuestion(variable);

    if (!questions) {
      // 🔥 Fix: Handle missing questions gracefully instead of crashing
      console.error(`Assessment questions for '${variable}' not found in DB.`);
      throw new Response(
        `Assessment Content Not Found. Please run 'node upload-questions.cjs' to populate the database.`,
        { status: 404, statusText: "Assessment Not Found" }
      );
    }

    return json(questions); // Ensure we return structured JSON
  }
  return redirect('/auth');
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const body = await request.json();
  // we were working here first check complete status
  console.log(body.progress)


  const companyId = user.organisationId;
  if (!companyId || !body.assessment_id) {
    return json({ error: "Missing required data" }, { status: 400 });
  }
  await save_answers(companyId, body.assessment_id.replace("QUESTION#", ""), user.userId, body);
  if (body.progress)
    if (body.progress == 100.00) {
      console.log("completed answers")
      const session = await getSession(request.headers.get("Cookie"));
      session.set("onboardingStatus", "Completed");
      await updateUser(user.userId, { onboardingStatus: "Completed" })

      // Mark engine complete in storage
      await createOrUpdateEngineStorage({
        company_id: companyId,
        user_id: user.userId,
        engine_name: variable,
        country: user.country_iso,
        progress: 100
      });

      // Notify Admin
      try {
        const { notifyAdmin } = await import("~/services/admin.notifier.server");
        await notifyAdmin(
          "Profiling Assessment Completed",
          `A user has completed their profiling assessment:\n
          User: ${user.first_name} ${user.last_name} (${user.email})\n
          Company ID: ${companyId}\n
          Assessment: Digital Maturity`
        );
      } catch (notifierError) {
        console.warn("Failed to notify admin about assessment:", notifierError);
      }

      // Add to cart logic
      try {
        const recommendation = await fetchEngineRecomendations(companyId);
        const rankings = recommendation && recommendation.allRankings ? recommendation.allRankings : [];
        const orgOverview = body.answers ? body.answers["Section 1: Organization Overview"] : {};

        // Use "Digital Maturity Assessment" as the product name for pricing since that's what's generated
        const productName = "Digital Maturity Assessment";
        const price = calculateFinalPrice(productName, orgOverview, user.country_iso, new Map(rankings));

        const cartItem: CartItem = {
          companyId,
          productName,
          price,
          userId: user.userId
        };
        await addOrUpdateCartItem(cartItem);
        console.log(`Added ${productName} to cart for profiling assessment`);
      } catch (cartError) {
        console.warn("Failed to add profiling assessment to cart:", cartError);
      }

      // Sync eligibility record
      try {
        const { autoCheckEligibility } = await import("~/services/eligibility.service");
        await autoCheckEligibility(companyId);
      } catch (eligibilityError) {
        console.warn("Failed to sync eligibility after profiling assessment:", eligibilityError);
      }

      // Commit the session and redirect
      return redirect("/intermediate", {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

  return json({ message: "Received!" });
};

export default function ProfilingAssessment() {
  const LoaderData = useLoaderData() as QuestionSchema;
  const navigate = useNavigate();

  const handleStepSave = async (stepData: any) => {
    console.log("Saving step:", stepData);
    const response = await fetch('/onboarding/profilingAssessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessment_id: LoaderData.pk,
        progress: stepData.progress,
        section: stepData.stepName,
        answers: stepData.answers,
        currentStepIndex: stepData.stepIndex,
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to save step:", errorData);
      throw new Error(errorData.error || 'Failed to save step');
    }
  };

  const handleComplete = async (allData: any) => {
    // Handle final completion
    console.log('Assessment completed! Submitting final results...', allData);

    const response = await fetch('/onboarding/profilingAssessment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        assessment_id: LoaderData.pk,
        progress: 100,
        section: "Completion",
        answers: allData,
      })
    });

    if (response.ok) {
      const result = await response.json();
      if (result.redirect) {
        window.location.href = result.redirect;
      } else {
        navigate('/intermediate');
      }
    } else {
      console.error("Failed to submit final assessment");
      alert("Failed to submit final assessment. Please try again.");
    }
  };

  return (
    <QuestionnaireEngine
      steps={LoaderData.parts}
      assessmentId={LoaderData.pk}
      title="Company Assessment Form"
      onStepSave={handleStepSave}
      onComplete={handleComplete}
      onNavigateBack={() => navigate('/onboarding/company')}
      onError={(error, context) => console.error(`Error in ${context}:`, error)}
    />
  );
}