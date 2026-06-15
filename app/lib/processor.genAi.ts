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

    // Dedicated background generator for Onboarding Profiling Assessment
    if (question_section === "Profiling Assessment") {
      const { generateProfilingReport } = await import("~/lib/profiling.genAi.server");
      
      const result = await prompt_processed(prompt_id, question_section, company_id);
      const assessment_id = result ? result[0] : `${company_id}#Profiling Assessment`;

      let answer = await getAnswerSheet(company_id, assessment_id);
      if (!answer) {
        const { findEngineData } = await import("~/models/engine.model.server");
        const engineRecord = await findEngineData(company_id, question_section);
        if (engineRecord && engineRecord.responses) {
          answer = (engineRecord.responses as any).answers || engineRecord.responses;
        }
      }

      if (!answer) {
        console.error("❌ No answer sheet found for Profiling Assessment background generation");
        setAIStatus(company_id, 'error');
        return false;
      }

      const answersMap = (answer as any).answers || answer;
      const reportResult = await generateProfilingReport(company_id, assessment_id, answersMap);

      const stored = await store_analysis(
        company_id,
        assessment_id,
        question_section,
        reportResult as any
      );

      if (stored) {
        console.log("✅ Profiling Assessment analysis stored successfully in background");
        setAIStatus(company_id, 'ready');
        return true;
      } else {
        console.error("❌ Storing Profiling Assessment analysis failed in background");
        setAIStatus(company_id, 'error');
        return false;
      }
    }

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
     * We attempt to find it via:
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

        const finalPrompt = `
${base_prompt}

🚨 ASSESSMENT INPUT DATA:
Below is the user's assessment data. Use this to perform your analysis.
Note: Data is provided in a structured format compatible with both "submission.answers" and "responses_json" requirements.

{
  "submission": {
    "answers": ${JSON.stringify(answer, null, 2)}
  },
  "responses_json": ${JSON.stringify(answer, null, 2)},
  "organization_context": ${JSON.stringify(answer, null, 2)}
}

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

        // ✅ Use Robust Post-Processing directly (bypass legacy preprocessor)
        const processed = postProcessAiResponse(
          rawText
        ) as AssessmentResult;

        if (processed.success && processed.data) {
          parsedJson = processed.data;
          console.log("✅ DeepSeek JSON parsing successful");
          break;
        }

        throw new Error(processed.error || "JSON validation failed");
      } catch (err: any) {
        // ✅ Enhanced error logging for AWS Bedrock issues
        console.error(`❌ Attempt ${attempt + 1} failed`);
        console.error(`Error name: ${err?.name}`);
        console.error(`Error message: ${err?.message}`);
        console.error(`Full error:`, JSON.stringify(err, null, 2));

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
