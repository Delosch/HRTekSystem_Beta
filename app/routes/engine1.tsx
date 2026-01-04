import { ActionFunction, json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { commitSession, getSession, requireUserSession } from "~/lib/session.server";
import { getLatestQuestion, save_answers } from "~/utils/question.utils";
import QuestionnaireEngine from "~/components/QuestionnaireEngine";
import type { ProfilingSteps } from "~/types/profilingAssessment";
import { updateUser } from "~/models/user.model";
import { generate } from "~/lib/processor.genAi";
import { checkEngineAccess } from "~/lib/engineAccess.server";

// let's keep a single variable just now to manage assessment form
const variable = "Profiling Assessment"
const prompt_id = ""
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);
  const engineName = "Profiling Assessment";

  // Ensure organisationId exists
  if (!user.organisationId) {
    return redirect('/onboarding/company');
  }

  // ✅ Check if company has paid for this engine
  const accessResult = await checkEngineAccess(user.organisationId, engineName);

  if (!accessResult.hasAccess) {
    return redirect(`/engine-locked/${encodeURIComponent(engineName)}`);
  }

  const questions = await getLatestQuestion(engineName);
  return questions; // Return questions directly to match expected ProfilingSteps type
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const body = await request.json();
  // we were working here first check complete status
  console.log(body.progress)


  const companyId = user.organisationId || "";
  if (!companyId) {
    return json({ error: "Organisation ID not found" }, { status: 400 });
  }
  await save_answers(companyId, body.assessment_id.replace("QUESTION#", ""), user.userId, body);
  if (body.progress == 100.00) {
    console.log("completed answers")
    const session = await getSession(request.headers.get("Cookie"));
    session.set("onboardingStatus", "Completed");
    await updateUser(user.userId, { onboardingStatus: "Completed" })
    //check analyses and saving it
    console.log("Initiating ai process")
    if (companyId) {
      await generate(prompt_id, variable, companyId);
    }
    // Commit the session and redirect
    return redirect("/onboarding/company", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  return json({ message: "Received!" });
};

export default function ProfilingAssessment() {
  const LoaderData = useLoaderData() as any; // Use any to avoid type mismatch
  const navigate = useNavigate();

  const handleStepSave = async (stepData: any) => {
    const response = await fetch('/engine1', {
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
      throw new Error('Failed to save step');
    }
  };

  const handleComplete = async (allData: any) => {
    // Handle final completion
    console.log('Assessment completed:', allData);
    navigate('/dashboard');
  };

  return (
    <QuestionnaireEngine
      steps={LoaderData.parts}
      assessmentId={LoaderData.pk}
      title="Company Assessment Form"
      onStepSave={handleStepSave}
      onComplete={handleComplete}
      onNavigateBack={() => navigate('/dashboard/${"engineName"}')}
      onError={(error, context) => console.error(`Error in ${context}:`, error)}
    />
  );
}