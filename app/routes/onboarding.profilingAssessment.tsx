import { useEffect } from "react";
import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { commitSession, getSession, requireUserSession } from "~/lib/session.server";
import { getLatestQuestion, save_answers } from "~/utils/question.utils";
import QuestionnaireEngine from "~/components/QuestionnaireEngine";
import type { QuestionSchema } from "./engine.$id/questionSchema";
import { updateUser } from "~/models/user.model.server";
import { createOrUpdateEngineStorage, fetchEngineRecomendations } from "~/models/engine.model.server";
import { addOrUpdateCartItem, CartItem } from "~/models/cart.model.server";
import { calculateFinalPrice } from "~/lib/pricing";

// let's keep a single variable just now to manage assessment form
const variable = "Profiling Assessment"

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

    const draftScope = session.organisationId || session.userId || "anonymous";
    return json({
      ...questions,
      draftScope,
    });
  }
  return redirect('/auth');
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const body = await request.json();

  console.log(`[Assessment Action] Progress status: ${body.progress}`);

  const companyId = user.organisationId;
  const assessmentId = body.assessment_id?.replace("QUESTION#", "");

  if (!companyId || !assessmentId) {
    console.error("[Assessment Action] Missing companyId or assessmentId");
    return json({ error: "Missing required data" }, { status: 400 });
  }

  try {
    await save_answers(companyId, assessmentId, user.userId, body);

    if (body.progress === 100 || body.progress === "100.00") {
      const session = await getSession(request.headers.get("Cookie"));
      session.set("onboardingStatus", "Completed");
      await updateUser(user.userId, { onboardingStatus: "Completed" });

      // Mark engine complete in storage
      await createOrUpdateEngineStorage({
        company_id: companyId,
        user_id: user.userId,
        engine_name: "HR Technology Maturity Analysis",
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

      /**
       * REMOVED: Automatic payment requirement for Profiling Assessment
       * The user requested this assessment to be free.
       * 
      // Add to cart logic
      try {
        const recommendation = await fetchEngineRecomendations(companyId);
        const rankings = recommendation && recommendation.allRankings ? recommendation.allRankings : [];
        const orgOverview = body.answers ? body.answers["Section 1: Organization Overview"] : {};

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
      */

      // Sync eligibility record
      try {
        const { autoCheckEligibility } = await import("~/services/eligibility.service.server");
        await autoCheckEligibility(companyId);
      } catch (eligibilityError) {
        console.warn("Failed to sync eligibility after profiling assessment:", eligibilityError);
      }

      return json({ success: true, redirect: "/intermediate" }, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    return json({ success: true, message: "Received!" });
  } catch (error) {
    console.error("[Assessment Action] Error:", error);
    return json({ error: "Failed to save assessment data" }, { status: 500 });
  }
};

export default function ProfilingAssessment() {
  const LoaderData = useLoaderData() as QuestionSchema & { draftScope?: string };
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const scopedDraftKey = `draft_${LoaderData.pk}_${LoaderData.draftScope || "default"}`;

  // Redirection handling from fetcher
  useEffect(() => {
    if (fetcher.data && (fetcher.data as any).redirect) {
      localStorage.removeItem(scopedDraftKey);
      window.location.href = (fetcher.data as any).redirect;
    }
  }, [fetcher.data, scopedDraftKey]);

  const handleStepSave = async (stepData: any) => {
    fetcher.submit(
      {
        assessment_id: LoaderData.pk,
        progress: stepData.progress,
        section: stepData.stepName,
        answers: stepData.answers,
        currentStepIndex: stepData.stepIndex,
      },
      {
        method: "POST",
        encType: "application/json"
      }
    );
  };

  const handleComplete = async (allData: any) => {
    fetcher.submit(
      {
        assessment_id: LoaderData.pk,
        progress: 100,
        section: "Completion",
        answers: allData,
      },
      {
        method: "POST",
        encType: "application/json"
      }
    );
  };

  return (
    <>
      <QuestionnaireEngine
        steps={LoaderData.parts}
        assessmentId={LoaderData.pk}
        autoSaveKey={scopedDraftKey}
        title="Company Assessment Form"
        onStepSave={handleStepSave}
        onComplete={handleComplete}
        onNavigateBack={() => navigate('/onboarding/company')}
        onError={(error, context) => console.error(`Error in ${context}:`, error)}
      />
      {/* Optional: Show error if submission fails */}
      {fetcher.data && (fetcher.data as any).error && (
        <div className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-lg shadow-lg z-50">
          {(fetcher.data as any).error}
        </div>
      )}
    </>
  );
}