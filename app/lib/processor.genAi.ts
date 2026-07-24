import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

import { postProcessAiResponse } from "~/utils/ai_post_processing";
import { prompt_processed, getPromptById } from "~/utils/prompt";
import { getAnswerSheet, store_analysis } from "~/utils/question.utils";
import { setAIStatus } from "~/services/ai-status.server";

/**
 * AWS Bedrock client
 * Uses IAM credentials automatically (local / EC2 / ECS / Lambda)
 */
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

interface AssessmentResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

interface AnswerSheet {
  answers: Record<string, unknown>;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseJsonStringIfPossible(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  if (
    !(
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    )
  ) {
    return trimmed;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return trimmed;
  }
}

function normalizeAnswerValue(value: unknown): unknown {
  const parsed = parseJsonStringIfPossible(value);

  if (Array.isArray(parsed)) {
    return parsed.map(normalizeAnswerValue);
  }

  if (isRecord(parsed)) {
    return Object.fromEntries(
      Object.entries(parsed).map(([key, nestedValue]) => [
        key,
        normalizeAnswerValue(nestedValue),
      ])
    );
  }

  return parsed;
}

function normalizeAnswers(answer: unknown): unknown {
  const normalized = normalizeAnswerValue(answer);

  /**
   * Some future or fallback path may accidentally pass:
   * { answers: {...} }
   *
   * In that case, unwrap it so the prompt receives the actual answer map.
   */
  if (
    isRecord(normalized) &&
    Object.keys(normalized).length === 1 &&
    isRecord(normalized.answers)
  ) {
    return normalized.answers;
  }

  return normalized;
}

function extractMatchingFields(
  source: unknown,
  keywords: string[],
  prefix = "",
  output: UnknownRecord = {}
): UnknownRecord {
  if (!isRecord(source)) return output;

  for (const [key, value] of Object.entries(source)) {
    const path = prefix ? `${prefix}.${key}` : key;
    const keyLower = key.toLowerCase();

    const isContextField = keywords.some((keyword) =>
      keyLower.includes(keyword)
    );

    if (isContextField && value !== undefined && value !== null && value !== "") {
      output[path] = value;
    }

    if (isRecord(value)) {
      extractMatchingFields(value, keywords, path, output);
    }
  }

  return output;
}

function buildNormalizedAssessmentInput(params: {
  promptId: string;
  engine: string;
  companyId: string;
  assessmentId: string;
  answer: unknown;
}) {
  const normalizedAnswers = normalizeAnswers(params.answer);

  const organizationContext = extractMatchingFields(normalizedAnswers, [
    "company",
    "industry",
    "sector",
    "employee",
    "size",
    "revenue",
    "country",
    "region",
    "location",
    "business",
    "department",
    "hrms",
    "hcm",
    "system",
    "vendor",
  ]);

  const scoringContext = extractMatchingFields(normalizedAnswers, [
    "score",
    "scoring",
    "maturity",
    "readiness",
    "risk",
    "progress",
  ]);

  return {
    assessment_context: {
      company_id: params.companyId,
      assessment_id: params.assessmentId,
      engine: params.engine,
      prompt_id: params.promptId,
      generated_at: new Date().toISOString(),
    },

    input_aliases: {
      schema: "Use the ASSESSMENT QUESTIONS STRUCTURE section provided above.",
      questions_json: "Use the ASSESSMENT QUESTIONS STRUCTURE section provided above.",
      responses_json: "Use submission.answers as the authoritative user response object.",
      organization_context:
        "Use organization_context only for company/profile context. Do not treat it as the full answer set.",
    },

    submission: {
      answers: normalizedAnswers,
    },

    organization_context: organizationContext,

    scoring_context:
      Object.keys(scoringContext).length > 0 ? scoringContext : null,
  };
}

/**
 * Quality Warning Helpers
 */
function collectStrings(value: unknown, output: string[] = []): string[] {
  if (typeof value === "string") {
    output.push(value);
    return output;
  }

  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, output);
    return output;
  }

  if (typeof value === "object" && value !== null) {
    for (const item of Object.values(value)) collectStrings(item, output);
  }

  return output;
}

function getReportQualityWarnings(report: Record<string, any>): string[] {
  const text = collectStrings(report).join(" ");
  const warnings: string[] = [];

  if (/lorem ipsum|placeholder|sample company|example only/i.test(text)) {
    warnings.push("Possible placeholder or sample text found.");
  }

  if (/\b\d+(\.\d+)?x\b/i.test(text)) {
    warnings.push("Possible unsupported multiplier claim found.");
  }

  if (/benchmark data from \d+|similar transformations/i.test(text)) {
    warnings.push("Possible unsupported benchmark-study claim found.");
  }

  if (/\b\d+\.\d{2,}\b/.test(text)) {
    warnings.push("Over-precise decimal score found in report text.");
  }

  if (/significant intervention|required|robust framework/i.test(text)) {
    warnings.push("Possible vague consulting phrase found; check whether it includes a specific action.");
  }

  return warnings;
}

/**
 * Vendor Fit Score Normalization Helpers
 */
function clampPercentage(value: unknown): number | unknown {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return value;
  }
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
}

function normalizeVendorFitReport(report: any) {
  if (!report || typeof report !== "object") return report;

  if (report.scores) {
    report.scores.satisfaction = clampPercentage(report.scores.satisfaction);
    report.scores.painIndex = clampPercentage(report.scores.painIndex);
    report.scores.integrationComplexity = clampPercentage(report.scores.integrationComplexity);
    report.scores.decisionAgility = clampPercentage(report.scores.decisionAgility);
    report.scores.changeReadiness = clampPercentage(report.scores.changeReadiness);
    report.scores.fitScore = clampPercentage(report.scores.fitScore);

    const fitScore =
      typeof report.scores.fitScore === "number" ? report.scores.fitScore : null;

    if (fitScore !== null) {
      report.scores.fitBand =
        fitScore >= 75
          ? "Excellent vendor readiness"
          : fitScore >= 45
            ? "Moderate – some alignment gaps"
            : "Needs alignment before vendor search";
    }
  }

  if (Array.isArray(report.viz?.recommendationsTable)) {
    report.viz.recommendationsTable = report.viz.recommendationsTable.map((item: any) => ({
      ...item,
      fitScore: clampPercentage(item.fitScore),
    }));
  }

  if (report.viz?.executiveRadar) {
    for (const key of Object.keys(report.viz.executiveRadar)) {
      report.viz.executiveRadar[key] = clampPercentage(report.viz.executiveRadar[key]);
    }
  }

  return report;
}

/**
 * Main AI generation entry point
 * Called once from Intermediate loader
 */
export async function generate(
  prompt_id: string,
  question_section: string,
  company_id: string
): Promise<boolean> {
  try {
    console.log(
      `🚀 Starting DeepSeek V3 (AWS Bedrock) generation for company: ${company_id}, section: ${question_section}`
    );

    // Profiling Assessment now uses the standard digital_maturity prompt path (same as all other engines)
    // The old profiling.genAi.server generator has been retired in favor of the unified pipeline

    /**
     * 1. Build base prompt and get assessment id
     */
    const result = await prompt_processed(
      prompt_id,
      question_section,
      company_id
    );

    let assessment_id: string;
    let base_prompt: string;

    if (!result) {
      // Fallback for engines without a Questions table entry (e.g. AI Driven Maturity Engine)
      // Use the prompt directly and derive assessment_id from the engine name
      console.warn(`⚠️ prompt_processed returned undefined for "${question_section}", trying direct prompt fallback`);
      const promptObj = getPromptById(prompt_id);
      if (!promptObj) {
        console.error("❌ Prompt not found for id:", prompt_id);
        setAIStatus(company_id, 'error');
        return false;
      }
      assessment_id = `${company_id}#${question_section}`;
      base_prompt = promptObj.basePrompt;
    } else {
      [assessment_id, base_prompt] = result as [string, string];
    }

    /**
     * 2. Fetch completed answer sheet
     * * We attempt to find it via:
     * a) ASSESSMENT#{id} (from save_answers)
     * b) {engineName} (from createOrUpdateEngineStorage)
     */
    let answer = (await getAnswerSheet(
      company_id,
      assessment_id
    )) as AnswerSheet;

    if (!answer) {
      console.log(`⚠️ Answer sheet not found with ID ${assessment_id}, trying engine name: ${question_section}`);
      const { findEngineData } = await import("~/models/engine.model.server");
      const engineRecord = await findEngineData(company_id, question_section);
      if (engineRecord && engineRecord.responses) {
        answer = engineRecord.responses as unknown as AnswerSheet;
        console.log(`✅ Found answer sheet using engine name: ${question_section}`);
      }
    }

    if (!answer) {
      console.error("❌ No answer sheet found via ID or engine name");
      setAIStatus(company_id, 'error');
      return false;
    }

    console.log(`📊 Processing assessment: ${assessment_id}`);

    /**
     * 3. Retry-safe DeepSeek invocation
     */
    const maxRetries = 3;
    let attempt = 0;
    let parsedJson: unknown = null;

    while (attempt < maxRetries) {
      try {
        console.log(`🔄 DeepSeek attempt ${attempt + 1}/${maxRetries}`);

        const assessmentInput = buildNormalizedAssessmentInput({
          promptId: prompt_id,
          engine: question_section,
          companyId: company_id,
          assessmentId: assessment_id,
          answer,
        });

        const finalPrompt = `
      ${base_prompt}

      🚨 ASSESSMENT INPUT DATA:
      Below is the user's assessment data. Use this to perform your analysis.

      IMPORTANT INPUT MAPPING:
      - Use "submission.answers" as the single authoritative source of user responses.
      - If the engine prompt mentions "responses_json", treat it as an alias for "submission.answers".
      - Use "organization_context" only as derived company/profile context.
      - Do not treat organization_context as the complete answer set.
      - Use the ASSESSMENT QUESTIONS STRUCTURE above as the questionnaire schema.

      ${JSON.stringify(assessmentInput, null, 2)}

      🚨 STRICT JSON RULES (MANDATORY):
      - Return ONLY valid JSON
      - No markdown, no comments
      - No explanations
      - Start with { and end with }
      - Use double quotes only
      - No trailing commas
      `.trim();

        /**
         * 4. Call DeepSeek V3 via Bedrock
         */
        const command = new InvokeModelCommand({
          modelId: "deepseek.v3-v1:0",
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: finalPrompt,
              },
            ],
            temperature: 0.05,
            max_tokens: 15000,
          }),
        });

        const response = await bedrock.send(command);

        const responseBody = JSON.parse(
          new TextDecoder().decode(response.body)
        );

        // ✅ AWS Bedrock DeepSeek response formats (Robust Handling)
        let rawText: string | undefined;

        if (responseBody?.choices?.[0]?.message?.content) {
          const content = responseBody.choices[0].message.content;
          if (Array.isArray(content)) {
            rawText = content.map((c: any) => c.text || "").join("");
          } else {
            rawText = content;
          }
        } else if (responseBody?.output?.message?.content) {
          const content = responseBody.output.message.content;
          if (Array.isArray(content)) {
            rawText = content.map((c: any) => c.text || "").join("");
          } else {
            rawText = content;
          }
        } else if (responseBody?.results?.[0]?.outputText) {
          rawText = responseBody.results[0].outputText;
        } else if (responseBody?.generation) {
          rawText = responseBody.generation;
        }

        if (!rawText || !rawText.trim()) {
          console.error("❌ Invalid DeepSeek Bedrock response:", JSON.stringify(responseBody, null, 2));
          throw new Error("Empty response from DeepSeek");
        }

        const processed = postProcessAiResponse(rawText) as AssessmentResult;

        if (processed.success && processed.data) {
          parsedJson = processed.data;
          console.log("✅ DeepSeek JSON parsing successful");

          const qualityWarnings = getReportQualityWarnings(processed.data as Record<string, any>);
          if (qualityWarnings.length > 0) {
            console.warn("AI report quality warnings:", qualityWarnings);
          }

          break;
        }

        throw new Error(processed.error || "JSON validation failed");
      } catch (err: any) {
        // ✅ Enhanced error logging for AWS Bedrock issues
        console.error(`❌ Attempt ${attempt + 1} failed`);
        console.error(`Error name: ${err?.name}`);
        console.error(`Error message: ${err?.message}`);
        
        // Log AWS-specific error details if available
        if (err?.$metadata) {
          console.error(`AWS Metadata:`, err.$metadata);
        }

        attempt++;

        if (attempt < maxRetries) {
          console.log(`⏳ Waiting ${2 * attempt} seconds before retry...`);
          await new Promise((r) => setTimeout(r, 2000 * attempt));
        }
      }
    }

    /**
     * 5. Hard fail if AI never produced valid JSON
     */
    if (!parsedJson) {
      console.error("❌ All DeepSeek attempts failed");
      setAIStatus(company_id, 'error');
      return false;
    }

    /**
     * NEW: Runtime normalizer guard applied here
     */
    if (prompt_id === "vendor_fit") {
      console.log("Normalizing vendor_fit report scores...");
      parsedJson = normalizeVendorFitReport(parsedJson);
    }

    /**
     * 6. Persist analysis to DynamoDB
     * THIS is what fixes the Dashboard loop
     */
    console.log("💾 Storing analysis in DynamoDB...");
    const stored = await store_analysis(
      company_id,
      assessment_id,
      question_section,
      parsedJson as any
    );

    if (stored) {
      console.log("✅ Analysis stored, updating status to READY");
      // ✅ FIX: Update the status so the frontend stops polling
      setAIStatus(company_id, 'ready');
      return true;
    } else {
      console.log("❌ Store failed");
      setAIStatus(company_id, 'error');
      return false;
    }
  } catch (error) {
    console.error("💥 Unhandled AI error:", error);
    setAIStatus(company_id, 'error');
    return false;
  }
}

/**
 * Utility: Clean LLM output to strict JSON
 */
function preprocessJsonResponse(text: string): string {
  let cleaned = text.replace(/```json|```/g, "").trim();

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first !== -1 && last !== -1) {
    cleaned = cleaned.slice(first, last + 1);
  }

  return cleaned
    .replace(/,\s*}/g, "}")
    .replace(/,\s*]/g, "]")
    .replace(/\s+/g, " ");
}