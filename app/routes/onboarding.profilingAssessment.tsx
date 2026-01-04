import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { commitSession, getSession, requireUserSession } from "~/lib/session.server";
import { getLatestQuestion, save_answers } from "~/utils/question.utils";
import QuestionnaireEngine from "~/components/QuestionnaireEngine";
import type { ProfilingSteps } from "~/types/profilingAssessment";
import { updateUser } from "~/models/user.model";
import { generate } from "~/lib/processor.genAi";

// let's keep a single variable just now to manage assessment form
const variable ="Profiling Assessment"
const prompt_id= "digital_maturity"
export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  const session = await requireUserSession(request)
  if(session){
  const questions = await getLatestQuestion(variable);
  return questions;
  }
  return redirect('/auth')
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const body = await request.json();
  // we were working here first check complete status
  console.log(body.progress)


  const companyId = user.organisationId;
  await save_answers(companyId, body.assessment_id.replace("QUESTION#", ""), user.userId, body);
  if(body.progress)
  if (body.progress == 100.00) {
    console.log("completed answers")
    const session = await getSession(request.headers.get("Cookie"));
    session.set("onboardingStatus", "Completed");
    await updateUser(user.userId, { onboardingStatus: "Completed" })
    //check analyses and saving it
    console.log("Initiating ai process")
    // await generate("digital_maturity", "Profiling Assessment", companyId)
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
  const LoaderData = useLoaderData() as ProfilingSteps;
  const navigate = useNavigate();

  const handleStepSave = async (stepData: any) => {
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
      throw new Error('Failed to save step');
    }
  };

  const handleComplete = async (allData: any) => {
    // Handle final completion
    console.log('Assessment completed:', allData);
    navigate('/intermediate');
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