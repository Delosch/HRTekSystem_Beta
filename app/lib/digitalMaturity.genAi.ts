import {
  BedrockRuntimeClient,
  InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";

import { postProcessAiResponse } from "~/utils/ai_post_processing";
import { prompt_processed } from "~/utils/prompt";
import { getAnswerSheet, store_analysis } from "~/utils/question.utils";
import { setAIStatus } from "~/services/ai-status.server";
import "~/env.server"; // Ensure environment variables are loaded

interface AssessmentResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface AnswerSheet {
  answers: Record<string, unknown>;
}

// ✅ AWS Bedrock client with explicit credentials
const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

/**
 * ✅ JSON repair layer
 * Extracts the first valid JSON object from AI output
 */
function safeJsonExtract(rawText: string): string {
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in AI response");
  }

  return rawText.slice(firstBrace, lastBrace + 1);
}

/**
 * ✅ STRICT backend validator (ROOT FIX)
 * Prevents corrupted AI output from ever reaching DB / UI
 */
function validateAssessmentShape(data: any): boolean {
  if (!data?.maturity_analysis?.dimensional_scores) return false;

  return (
    Array.isArray(data.maturity_analysis.dimensional_scores) &&
    data.maturity_analysis.dimensional_scores.every((d: any) =>
      typeof d.dimension === "string" &&
      typeof d.percentage === "number" &&
      typeof d.maturity_level === "string"
    )
  );
}

export async function generate(
  prompt_id: string,
  question_section: string,
  company_id: string
): Promise<void> {

  console.log("🚀 GENERATE FUNCTION CALLED!", {
    prompt_id,
    question_section,
    company_id
  });

  try {
    console.log(`🚀 Starting AI generation for company: ${company_id}`);

    const result = await prompt_processed(
      prompt_id,
      question_section,
      company_id
    );

    if (!result) {
      console.error("❌ prompt_processed returned undefined");
      setAIStatus(company_id, "error");
      return;
    }

    const [assessment_id, base_prompt] = result as [string, string];

    const answer = await getAnswerSheet(
      company_id,
      assessment_id
    ) as AnswerSheet;

    console.log(`📊 Processing assessment: ${assessment_id}`);

    const maxRetries = 3;
    let attempt = 0;
    let parsedJson: any = null;

    while (attempt < maxRetries) {
      try {
        console.log(`🔄 DeepSeek attempt ${attempt + 1}/${maxRetries}`);

        const finalPrompt = `${base_prompt}

🚨 CRITICAL JSON OUTPUT REQUIREMENTS:
1. Return ONLY valid JSON
2. No markdown, no explanation
3. Start with { and end with }
4. Use double quotes only
5. No trailing commas
6. Use null for missing values
7. Use ONLY English standard characters (no special regional characters)

ASSESSMENT DATA:
${JSON.stringify(answer, null, 2)}

Return JSON only:`;

        const command = new InvokeModelCommand({
          modelId: "deepseek.v3-v1:0",
          contentType: "application/json",
          accept: "application/json",
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: [{ type: "text", text: finalPrompt }]
              }
            ],
            temperature: 0.05,
            max_tokens: 8000
          })
        });

        const response = await bedrock.send(command);
        const raw = new TextDecoder().decode(response.body);

        const parsed = JSON.parse(raw);

        // ✅ AWS Bedrock DeepSeek response formats
        // Handle standard Bedrock/Claude format
        // Handle OpenAI-compatible format (DeepSeek)
        let text: string | undefined;

        if (parsed?.choices?.[0]?.message?.content) {
          const content = parsed.choices[0].message.content;
          if (Array.isArray(content)) {
            text = content.map((c: any) => c.text || "").join("");
          } else {
            text = content;
          }
        } else if (parsed?.output?.message?.content) {
          const content = parsed.output.message.content;
          if (Array.isArray(content)) {
            text = content.map((c: any) => c.text || "").join("");
          } else {
            text = content; // Likely string or object with text
          }
        } else if (parsed?.results?.[0]?.outputText) {
          text = parsed.results[0].outputText;
        } else if (parsed?.generation) {
          text = parsed.generation;
        }

        if (typeof text !== "string" || !text.trim()) {
          console.error("❌ Invalid DeepSeek Bedrock response:", JSON.stringify(parsed, null, 2));
          throw new Error("Empty or invalid response from DeepSeek");
        }

        // ✅ Repair JSON BEFORE parsing
        const cleanedText = safeJsonExtract(text);

        const processed = postProcessAiResponse(
          cleanedText
        ) as AssessmentResult;

        if (!processed.success || !processed.data) {
          throw new Error(processed.error || "Post-processing failed");
        }

        // ✅ STRICT SHAPE VALIDATION (MANDATORY)
        if (!validateAssessmentShape(processed.data)) {
          console.error("❌ Invalid AI JSON shape. Rejecting save.", processed.data);
          setAIStatus(company_id, "error");
          return;
        }

        parsedJson = processed.data;
        console.log("✅ DeepSeek JSON validated successfully");
        break;

      } catch (err) {
        console.error(`❌ Attempt ${attempt + 1} failed`, err);
        attempt++;
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
    }

    if (!parsedJson) {
      console.error("❌ All DeepSeek attempts failed");
      setAIStatus(company_id, "error");
      return;
    }

    console.log("💾 Storing analysis results");

    const stored = await store_analysis(
      company_id,
      assessment_id,
      question_section,
      parsedJson
    );

    if (stored) {
      console.log("✅ Analysis stored. Status = ready");
      setAIStatus(company_id, "ready");
    } else {
      console.error("❌ Storage failed");
      setAIStatus(company_id, "error");
    }

  } catch (err) {
    console.error("💥 Unhandled error in generate()", err);
    setAIStatus(company_id, "error");
  }
}
