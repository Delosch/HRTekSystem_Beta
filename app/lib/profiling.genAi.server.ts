import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const MODEL_ID = "deepseek.v3-v1:0";

export interface ProfilingReportResult {
  companyProfile: {
    overview: string;
    industryContext: string;
    workforceAnalysis: string;
  };
  hrMaturityAssessment: {
    currentMaturityLevel: string;
    score: number;
    keyStrengths: string[];
    criticalGaps: string[];
  };
  transformationReadiness: {
    readinessScore: number;
    readinessLevel: string;
    enablers: string[];
    barriers: string[];
  };
  strategicRecommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
  executiveSummary: string;
  generatedAt: string;
}

export async function generateProfilingReport(
  companyId: string,
  assessmentId: string,
  answers: Record<string, any>
): Promise<ProfilingReportResult> {
  const answersText = Object.entries(answers)
    .map(([section, sectionAnswers]) => {
      if (typeof sectionAnswers === "object" && sectionAnswers !== null) {
        const qa = Object.entries(sectionAnswers)
          .map(([q, a]) => `  Q: ${q}\n  A: ${JSON.stringify(a)}`)
          .join("\n");
        return `### ${section}\n${qa}`;
      }
      return `### ${section}\n  ${JSON.stringify(sectionAnswers)}`;
    })
    .join("\n\n");

  const prompt = `You are an expert HR transformation consultant. Analyze the following profiling assessment responses from a company and generate a comprehensive HR Profiling Report.

ASSESSMENT RESPONSES:
${answersText}

Generate a JSON report with this exact structure (no markdown, pure JSON):
{
  "companyProfile": {
    "overview": "<2-3 sentence company overview based on the answers>",
    "industryContext": "<industry positioning and market context>",
    "workforceAnalysis": "<workforce size, structure, and composition insights>"
  },
  "hrMaturityAssessment": {
    "currentMaturityLevel": "<one of: Initial, Developing, Defined, Managed, Optimizing>",
    "score": <integer 0-100>,
    "keyStrengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
    "criticalGaps": ["<gap 1>", "<gap 2>", "<gap 3>"]
  },
  "transformationReadiness": {
    "readinessScore": <integer 0-100>,
    "readinessLevel": "<one of: Not Ready, Partially Ready, Moderately Ready, Ready, Highly Ready>",
    "enablers": ["<enabler 1>", "<enabler 2>", "<enabler 3>"],
    "barriers": ["<barrier 1>", "<barrier 2>", "<barrier 3>"]
  },
  "strategicRecommendations": {
    "immediate": ["<action 1>", "<action 2>", "<action 3>"],
    "shortTerm": ["<action 1>", "<action 2>", "<action 3>"],
    "longTerm": ["<action 1>", "<action 2>", "<action 3>"]
  },
  "executiveSummary": "<200-300 word executive summary of the profiling assessment findings and key recommendations>"
}`;

  const body = JSON.stringify({
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4096,
    temperature: 0.3,
  });

  const command = new InvokeModelCommand({
    modelId: MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: Buffer.from(body),
  });

  const response = await bedrock.send(command);
  const responseText = new TextDecoder().decode(response.body);
  const parsed = JSON.parse(responseText);

  const content: string =
    parsed?.choices?.[0]?.message?.content ||
    parsed?.content?.[0]?.text ||
    parsed?.output?.message?.content?.[0]?.text ||
    "";

  // Extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in DeepSeek response");
  }

  const reportData = JSON.parse(jsonMatch[0]) as ProfilingReportResult;
  reportData.generatedAt = new Date().toISOString();

  return reportData;
}
