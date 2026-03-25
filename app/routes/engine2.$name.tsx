import { json, ActionFunction, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import { getLatestQuestion, save_answers } from "~/utils/question.utils";
import { requireUserSession } from "~/lib/session.server";
import { checkEngineAccess } from "~/lib/engineAccess.server";
import EngineRenderer from "~/components/EngineRenderer";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const user = await requireUserSession(request);
  const engineName = params.name;

  if (!engineName) {
    throw new Response("Engine name is required", { status: 400 });
  }

  // ✅ Check if company has paid for this engine
  const accessResult = await checkEngineAccess(user.organisationId, engineName);

  if (!accessResult.hasAccess) {
    return redirect(`/engine-locked/${encodeURIComponent(engineName)}`);
  }

  const questions = await getLatestQuestion(engineName);
  
  // Redirect logic for consistency
  const normalizedEngineName = engineName.toLowerCase().replace(/ assessment$/i, "").trim();
  
  if (normalizedEngineName.includes("hr technology maturity") || normalizedEngineName.includes("ai maturity") || normalizedEngineName.includes("hr-tech-maturity")) {
    return redirect("/ai-maturity/assessment");
  }
  if (normalizedEngineName.includes("digital roadmap") || normalizedEngineName.includes("hr transformation roadmap")) {
    return redirect("/digital-roadmap/assessment");
  }
  if (normalizedEngineName.includes("change management")) {
    return redirect("/change-management/assessment");
  }
  if (normalizedEngineName.includes("shared service")) {
    return redirect("/shared-services/assessment");
  }

  return json({ questions, engineName });
};

export const action: ActionFunction = async ({ request }: { request: Request }) => {
  const user = await requireUserSession(request);
  const body = await request.json();
  await save_answers("company_id", body.assessment_id.replace("QUESTION#", ""), user.userId, body);
  return json({ message: "Received!" });
};

export default function EnginePage() {
  const data = useLoaderData();
  const { name } = useParams();
  return <EngineRenderer data={data} engineName={name!} />;
}