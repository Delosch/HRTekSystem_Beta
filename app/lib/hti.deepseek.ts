import {
    BedrockRuntimeClient,
    InvokeModelCommand
} from "@aws-sdk/client-bedrock-runtime";
import type { HTIAggregatedInput, HTIAdvisoryContent } from "~/models/hti.model.server";

// ========================================
// AWS BEDROCK CLIENT
// ========================================

const bedrock = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "ap-south-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

const MODEL_ID = "deepseek.v3-v1:0";

// ========================================
// PROMPT ENGINEERING
// ========================================

/**
 * Build comprehensive advisory prompt for DeepSeek
 */
function buildAdvisoryPrompt(data: HTIAggregatedInput): string {
    const { engines, completedEnginesCount, totalEngines } = data;

    // Format engine data for prompt
    const engineSummaries: string[] = [];

    if (engines.maturity) {
        engineSummaries.push(`
**HR Technology Maturity Analysis**:
- Progress: ${engines.maturity.progress}%
- Completed: ${engines.maturity.completedAt || "In Progress"}
- Key Findings: ${JSON.stringify(engines.maturity.aiAnalysis || "Not available", null, 2)}
`);
    }

    if (engines.roadmap) {
        engineSummaries.push(`
**HR Transformation Roadmap**:
- Progress: ${engines.roadmap.progress}%
- Completed: ${engines.roadmap.completedAt || "In Progress"}
- Key Findings: ${JSON.stringify(engines.roadmap.aiAnalysis || "Not available", null, 2)}
`);
    }

    if (engines.vendor) {
        engineSummaries.push(`
**Vendor Fit Analysis**:
- Progress: ${engines.vendor.progress}%
- Completed: ${engines.vendor.completedAt || "In Progress"}
- Key Findings: ${JSON.stringify(engines.vendor.aiAnalysis || "Not available", null, 2)}
`);
    }

    if (engines.change) {
        engineSummaries.push(`
**Change Management Assessment**:
- Progress: ${engines.change.progress}%
- Completed: ${engines.change.completedAt || "In Progress"}
- Key Findings: ${JSON.stringify(engines.change.aiAnalysis || "Not available", null, 2)}
`);
    }

    if (engines.sharedServices) {
        engineSummaries.push(`
**Shared Services Design**:
- Progress: ${engines.sharedServices.progress}%
- Completed: ${engines.sharedServices.completedAt || "In Progress"}
- Key Findings: ${JSON.stringify(engines.sharedServices.aiAnalysis || "Not available", null, 2)}
`);
    }

    const prompt = `You are a senior HR transformation consultant with 20+ years of experience advising Fortune 500 companies on HR digital transformation. You have deep expertise in HR technology, change management, shared services, and organizational design.

**CONTEXT**:
A company has completed ${completedEnginesCount} out of ${totalEngines} HR assessment engines. You have access to their comprehensive HR assessment data below.

**YOUR TASK**:
Provide board-level strategic advisory that answers:
1. What should we do first?
2. Is now the right time to transform?
3. What is risky?
4. What should we NOT do yet?

**ASSESSMENT DATA**:
${engineSummaries.join("\n---\n")}

**CRITICAL INSTRUCTIONS FOR RICH CONTENT**:
1. **Use HTML Formatting** in the executiveSummary field:
   - Use <h2>, <h3> for section headings
   - Use <strong>, <em> for emphasis
   - Use <ul>, <ol> for lists
   - Use <p> for paragraphs
   - Use <table> for comparison data
   - Use color coding: <span style="color: #10b981">green for strengths</span>, <span style="color: #ef4444">red for risks</span>

2. **Include HTML Tables** where appropriate:
   - Maturity comparison tables
   - Readiness assessment matrices
   - Priority matrices (Impact vs Effort)
   - Timeline tables
   Example:
   <table border="1" style="border-collapse: collapse; width: 100%;">
     <thead>
       <tr style="background-color: #f3f4f6;">
         <th style="padding: 8px;">Area</th>
         <th style="padding: 8px;">Current</th>
         <th style="padding: 8px;">Target</th>
       </tr>
     </thead>
     <tbody>
       <tr><td>Automation</td><td>20%</td><td>80%</td></tr>
     </tbody>
   </table>

3. **Include Visual Heatmaps** using HTML/CSS:
   Example for maturity heatmap:
   <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 4px; margin: 10px 0;">
     <div style="background: #ef4444; padding: 10px; text-align: center; color: white; border-radius: 4px;">Low: Area 1</div>
     <div style="background: #f59e0b; padding: 10px; text-align: center; color: white; border-radius: 4px;">Medium: Area 2</div>
     <div style="background: #10b981; padding: 10px; text-align: center; color: white; border-radius: 4px;">High: Area 3</div>
   </div>

4. **Include Progress Indicators**:
   <div style="background: #e5e7eb; border-radius: 8px; overflow: hidden; height: 20px; margin: 10px 0;">
     <div style="background: linear-gradient(to right, #3b82f6, #10b981); width: 65%; height: 100%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold;">65% Complete</div>
   </div>

5. **Include Comparison Charts** (as HTML tables with visual bars):
   <table style="width: 100%; border-collapse: collapse;">
     <tr>
       <td style="padding: 8px; width: 150px;">Process Automation</td>
       <td style="padding: 8px;">
         <div style="background: #e5e7eb; border-radius: 4px; height: 24px; position: relative;">
           <div style="background: linear-gradient(to right, #3b82f6, #10b981); width: 75%; height: 100%; border-radius: 4px; display: flex; align-items: center; padding-left: 8px; color: white; font-weight: bold; font-size: 12px;">75%</div>
         </div>
       </td>
     </tr>
   </table>

6. **Include Risk Matrix** (HTML grid):
   <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin: 10px 0; font-size: 12px;">
     <div style="background: #10b981; padding: 15px; text-align: center; color: white; font-weight: bold;">Low Risk<br/>Low Impact</div>
     <div style="background: #f59e0b; padding: 15px; text-align: center; color: white; font-weight: bold;">Medium Risk<br/>Low Impact</div>
     <div style="background: #ef4444; padding: 15px; text-align: center; color: white; font-weight: bold;">High Risk<br/>Low Impact</div>
     <div style="background: #f59e0b; padding: 15px; text-align: center; color: white; font-weight: bold;">Low Risk<br/>High Impact</div>
     <div style="background: #ef4444; padding: 15px; text-align: center; color: white; font-weight: bold;">Medium Risk<br/>High Impact</div>
     <div style="background: #dc2626; padding: 15px; text-align: center; color: white; font-weight: bold;">CRITICAL<br/>High Impact</div>
   </div>

7. **Include Timeline Visualization**:
   <div style="margin: 20px 0;">
     <div style="display: flex; gap: 10px; align-items: center; margin-bottom: 10px;">
       <div style="background: #10b981; color: white; padding: 10px 20px; border-radius: 8px; flex: 1; text-align: center; font-weight: bold;">NOW<br/><small>3-6 months</small></div>
       <div style="font-size: 24px;">→</div>
       <div style="background: #f59e0b; color: white; padding: 10px 20px; border-radius: 8px; flex: 1; text-align: center; font-weight: bold;">NEXT<br/><small>6-12 months</small></div>
       <div style="font-size: 24px;">→</div>
       <div style="background: #3b82f6; color: white; padding: 10px 20px; border-radius: 8px; flex: 1; text-align: center; font-weight: bold;">LATER<br/><small>12-24 months</small></div>
     </div>
   </div>

8. **Include Key Metrics Dashboard**:
   <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 20px 0;">
     <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 12px; color: white; text-align: center;">
       <div style="font-size: 36px; font-weight: bold;">65%</div>
       <div style="font-size: 14px; opacity: 0.9;">Digital Readiness</div>
     </div>
     <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; border-radius: 12px; color: white; text-align: center;">
       <div style="font-size: 36px; font-weight: bold;">8/10</div>
       <div style="font-size: 14px; opacity: 0.9;">Maturity Score</div>
     </div>
     <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; border-radius: 12px; color: white; text-align: center;">
       <div style="font-size: 36px; font-weight: bold;">12</div>
       <div style="font-size: 14px; opacity: 0.9;">Priority Actions</div>
     </div>
   </div>

**CONTENT REQUIREMENTS**:
- Be specific, not generic
- Reference actual data from the assessments
- Prioritize based on maturity, readiness, and risk
- Flag dependencies clearly
- Be honest about what should wait
- **Make the executiveSummary rich with HTML tables, heatmaps, progress bars, and visual elements**
- Use color coding consistently (green=good, yellow=caution, red=risk)

**RESPOND IN VALID JSON FORMAT** with the following structure:

{
  "executiveSummary": "Rich HTML content with <h2> headings, <table> elements, heatmaps, progress bars, and visual dashboards. Include at least 2-3 tables, 1 heatmap, and 1 metrics dashboard. Use the HTML examples provided above.",
  "currentState": {
    "maturityLevel": "Low | Medium | High",
    "digitalReadiness": "Not Ready | Partially Ready | Ready",
    "keyGaps": ["Gap 1", "Gap 2", "Gap 3"],
    "strengths": ["Strength 1", "Strength 2"]
  },
  "recommendations": {
    "now": [
      "Specific action 1 (Next 3-6 months)",
      "Specific action 2",
      "Specific action 3"
    ],
    "next": [
      "Specific action 1 (6-12 months)",
      "Specific action 2"
    ],
    "later": [
      "Specific action 1 (12-24 months)",
      "Specific action 2"
    ]
  },
  "riskFlags": [
    {
      "risk": "Specific risk description",
      "mitigation": "How to mitigate this risk"
    }
  ],
  "dependencies": [
    "Prerequisite 1 that must be in place",
    "Prerequisite 2"
  ],
  "avoidNow": [
    "Action to avoid and why",
    "Another action to delay"
  ],
  "successMetrics": [
    "Metric 1 to track progress",
    "Metric 2"
  ]
}

**RESPOND ONLY WITH THE JSON OBJECT. NO ADDITIONAL TEXT.**`;

    return prompt;
}

/**
 * Extract JSON from LLM response
 */
function safeJsonExtract(rawText: string): string {
    const firstBrace = rawText.indexOf("{");
    const lastBrace = rawText.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
        throw new Error("No JSON object found in LLM response");
    }

    return rawText.slice(firstBrace, lastBrace + 1);
}

/**
 * Parse and validate LLM response
 */
function parseAdvisoryResponse(llmOutput: string): HTIAdvisoryContent {
    try {
        const jsonStr = safeJsonExtract(llmOutput);
        const parsed = JSON.parse(jsonStr);

        // Validate structure
        if (!parsed.executiveSummary || !parsed.currentState || !parsed.recommendations) {
            throw new Error("Invalid advisory structure from LLM");
        }

        return parsed as HTIAdvisoryContent;
    } catch (error) {
        console.error("Error parsing LLM response:", error);
        console.error("Raw output:", llmOutput);
        throw new Error("Failed to parse LLM advisory response");
    }
}

// ========================================
// MAIN LLM INTEGRATION
// ========================================

/**
 * Generate HTI advisory using DeepSeek LLM
 */
export async function generateHTIAdvisory(
    aggregatedData: HTIAggregatedInput
): Promise<HTIAdvisoryContent> {
    console.log("🧠 Generating HTI Advisory with DeepSeek...");

    const prompt = buildAdvisoryPrompt(aggregatedData);

    // DeepSeek API uses messages format, not prompt
    const payload = {
        messages: [
            {
                role: "user",
                content: prompt
            }
        ],
        max_tokens: 4000,
        temperature: 0.7,
        top_p: 0.9,
    };

    try {
        const command = new InvokeModelCommand({
            modelId: MODEL_ID,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(payload),
        });

        const response = await bedrock.send(command);

        if (!response.body) {
            throw new Error("Empty response from DeepSeek");
        }

        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        // DeepSeek with messages format returns: choices[0].message.content
        const llmOutput = responseBody.choices?.[0]?.message?.content ||
            responseBody.choices?.[0]?.text ||
            responseBody.completion ||
            "";

        if (!llmOutput) {
            console.error("❌ DeepSeek response structure:", JSON.stringify(responseBody, null, 2));
            throw new Error("No text in DeepSeek response");
        }

        console.log("✅ DeepSeek response received");

        const advisory = parseAdvisoryResponse(llmOutput);

        console.log("✅ HTI Advisory generated successfully");
        return advisory;
    } catch (error) {
        console.error("❌ Error generating HTI advisory:", error);
        throw error;
    }
}

/**
 * Test function to validate DeepSeek connection
 */
export async function testDeepSeekConnection(): Promise<boolean> {
    try {
        const testPayload = {
            prompt: "Say 'HTI is ready' in JSON format: {\"message\": \"...\"}",
            max_tokens: 50,
            temperature: 0.1,
        };

        const command = new InvokeModelCommand({
            modelId: MODEL_ID,
            contentType: "application/json",
            accept: "application/json",
            body: JSON.stringify(testPayload),
        });

        const response = await bedrock.send(command);
        console.log("✅ DeepSeek connection test successful");
        return true;
    } catch (error) {
        console.error("❌ DeepSeek connection test failed:", error);
        return false;
    }
}
