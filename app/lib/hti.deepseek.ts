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
});

const MODEL_ID = "deepseek.v3-v1:0";

// ========================================
// CROSS-ENGINE SYNTHESIS PROMPT
// ========================================

const CROSS_ENGINE_SECTIONS = [
  {
    title: "Cross-Engine Strategic Synthesis",
    focus: "Identify convergence, contradictions, and strategic alignment gaps across all 5 assessment engines. Produce the unified transformation narrative the CXO must act on. (Approx 900-1200 words)"
  },
  {
    title: "Organizational & Change Architecture",
    focus: "Synthesize Change Management + Shared Services findings: cultural readiness, governance gaps, and operating model implications. (Approx 800-1000 words)"
  },
  {
    title: "Technology Landscape & Vendor Intelligence",
    focus: "Synthesize AI Maturity + Vendor Fit findings: current tech debt, vendor selection rationale, integration complexity, and build vs buy decisions. (Approx 800-1000 words)"
  },
  {
    title: "Digital Roadmap & Execution Blueprint",
    focus: "From the Digital Roadmap engine: phased execution plan with 6/12/24-month milestones, financial forecast, and resource requirements. (Approx 800-1000 words)"
  },
  {
    title: "Cross-Engine Risk Matrix & Dependency Map",
    focus: "Identify risks that span multiple engines (e.g. vendor selection risk worsened by low AI maturity). Map dependencies between transformation initiatives. (Approx 700-900 words)"
  },
  {
    title: "Transformation Priority Matrix & Sequencing",
    focus: "Rank all initiatives by impact vs effort. Define what must happen Now (0-6m), Next (6-18m), and Later (18m+). Identify sequencing dependencies. (Approx 700-900 words)"
  },
  {
    title: "CXO Decision Brief & Board-Level Directives",
    focus: "Summarize the 5-7 critical decisions the C-Suite must make. Include ROI projections, risk thresholds, and governance recommendations. Board-ready language only. (Approx 600-800 words)"
  },
  {
    title: "Caution Zones — What Not to Transform Yet",
    focus: "Identify areas where premature transformation would cause harm: financial, cultural, technical, or organizational reasons. Be specific and evidence-based. (Approx 500-700 words)"
  }
];

function buildCrossEnginePrompt(data: HTIAggregatedInput): string {
  const { engines, companyId } = data;

  // Build engine context blocks — prefer AI report text, fall back to scores/responses
  const engineBlocks: string[] = [];

  if (engines.maturity) {
    const e = engines.maturity;
    const content = e.aiReport || JSON.stringify(e.scores || e.aiAnalysis || e.responses || {});
    engineBlocks.push(`=== HR TECHNOLOGY MATURITY ANALYSIS ===\nProgress: ${e.progress}%\n${content}`);
  }

  if (engines.roadmap) {
    const e = engines.roadmap;
    const content = e.aiReport || JSON.stringify(e.scores || e.aiAnalysis || e.responses || {});
    engineBlocks.push(`=== HR DIGITAL TRANSFORMATION ROADMAP ===\nProgress: ${e.progress}%\n${content}`);
  }

  const vendorEngine = engines.vendor || engines.vendorFit;
  if (vendorEngine) {
    const content = vendorEngine.aiReport || JSON.stringify(vendorEngine.scores || vendorEngine.aiAnalysis || vendorEngine.responses || {});
    engineBlocks.push(`=== COGNITIVE HCM VENDOR FIT ASSESSMENT ===\nProgress: ${vendorEngine.progress}%\n${content}`);
  }

  const changeEngine = engines.change || engines.changeManagement;
  if (changeEngine) {
    const content = changeEngine.aiReport || JSON.stringify(changeEngine.scores || changeEngine.aiAnalysis || changeEngine.responses || {});
    engineBlocks.push(`=== INTELLIGENT CHANGE MANAGEMENT ASSESSMENT ===\nProgress: ${changeEngine.progress}%\n${content}`);
  }

  if (engines.sharedServices) {
    const e = engines.sharedServices;
    const content = e.aiReport || JSON.stringify(e.scores || e.aiAnalysis || e.responses || {});
    engineBlocks.push(`=== SHARED SERVICE DESIGNER ASSESSMENT ===\nProgress: ${e.progress}%\n${content}`);
  }

  const completedCount = [engines.maturity, engines.roadmap, vendorEngine, changeEngine, engines.sharedServices]
    .filter(e => e && e.progress === 100).length;

  const prompt = `You are a world-class HR Digital Transformation Consultant (McKinsey/BCG/Deloitte Level) specializing in enterprise-wide transformation synthesis.

**MISSION**: Generate a COMPREHENSIVE CROSS-ENGINE STRATEGIC ADVISORY for Company ID: ${companyId}.
This is NOT a per-engine report. This is the UNIFIED INTELLIGENCE LAYER that synthesizes insights from ALL ${completedCount} completed HR assessment engines into one strategic directive.

**ASSESSMENT INPUTS** (${completedCount}/5 engines completed):
${engineBlocks.join("\n\n")}

**STRICT INSTRUCTIONS FOR QUALITY**:
- 10-15 PAGE BOARD-LEVEL advisory. Total word count MUST EXCEED 6,000 WORDS.
- Each section in 'detailedSections' MUST BE 700-1200 WORDS of dense, consulting-grade analysis.
- NO PLACEHOLDERS. NO LOREM IPSUM. Every insight must be grounded in the assessment data above.
- Use HTML formatting: <h2>, <h3>, <h4>, <table>, <ul>, <li>, <strong>, <em>.
- Every section MUST include at least 1 complex <table> (ROI models, risk matrices, priority rankings).
- Use <div style="background: #f8fafc; border-left: 6px solid #4f46e5; padding: 25px; margin: 30px 0; border-radius: 8px;"> for "Expert Insight" callouts.
- CROSS-REFERENCE FINDINGS: explicitly connect data points across different engines (e.g., "The AI Maturity score of X directly amplifies the vendor integration risk identified in...").

**REPORT STRUCTURE** (8 chapters):
${CROSS_ENGINE_SECTIONS.map((s, i) => `${i + 1}. ${s.title}: ${s.focus}`).join("\n")}

**SCORING INSTRUCTIONS**:
- transformationReadinessScore (0-100): Weighted average across all engine progress and quality scores. >75 = ready, 50-75 = conditional, <50 = not ready.
- riskExposureIndex (0-100): Higher = more risk. Consider governance gaps, change resistance, technology debt.
- confidenceScore (0-100): How confident is this advisory based on data completeness.
- capabilityHeatmap: Score each engine (0-100) and classify as "strong" (>70), "moderate" (40-70), or "critical" (<40).
- priorityMatrix: List 8-12 specific transformation initiatives with impact (1-10), effort (1-10), timeframe (now/next/later), and category.
- doNotTransformNow: List 3-6 specific areas with reason and category (organizational/financial/technical/cultural).

**RESPONSE FORMAT — YOU MUST RESPOND WITH VALID JSON ONLY**:
{
  "executiveSummary": "1200-word HTML executive briefing synthesizing ALL engine findings",
  "detailedSections": [
    ${CROSS_ENGINE_SECTIONS.map(s => `{ "title": "${s.title}", "content": "1000+ words of HTML analysis" }`).join(",\n    ")}
  ],
  "currentState": {
    "maturityLevel": "Level X — descriptive label",
    "digitalReadiness": "X% — with context",
    "keyGaps": ["Specific gap with engine reference...", "..."],
    "strengths": ["Specific strength with engine reference...", "..."]
  },
  "recommendations": {
    "now": ["Specific action 0-6 months...", "..."],
    "next": ["Specific action 6-18 months...", "..."],
    "later": ["Specific action 18+ months...", "..."]
  },
  "riskFlags": [{ "risk": "...", "mitigation": "..." }],
  "dependencies": ["Initiative A must precede Initiative B because...", "..."],
  "avoidNow": ["Do not attempt X because Y assessment shows...", "..."],
  "successMetrics": ["KPI with target and timeline...", "..."],
  "transformationReadinessScore": 72,
  "riskExposureIndex": 45,
  "confidenceScore": 88,
  "capabilityHeatmap": [
    { "engine": "HR Technology Maturity", "score": 70, "status": "moderate" },
    { "engine": "Digital Roadmap", "score": 80, "status": "strong" },
    { "engine": "Vendor Fit", "score": 55, "status": "moderate" },
    { "engine": "Change Management", "score": 40, "status": "critical" },
    { "engine": "Shared Services", "score": 65, "status": "moderate" }
  ],
  "priorityMatrix": [
    { "initiative": "Specific initiative name", "impact": 9, "effort": 4, "timeframe": "now", "category": "Technology" }
  ],
  "doNotTransformNow": [
    { "area": "Specific area", "reason": "Evidence-based reason from assessment data", "category": "organizational", "revisitIn": "12 months" }
  ]
}`;

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

    if (!parsed.executiveSummary || !parsed.currentState || !parsed.recommendations) {
      throw new Error("Invalid advisory structure from LLM");
    }

    // Validate scores are in range if present
    if (parsed.transformationReadinessScore !== undefined) {
      parsed.transformationReadinessScore = Math.max(0, Math.min(100, Number(parsed.transformationReadinessScore)));
    }
    if (parsed.riskExposureIndex !== undefined) {
      parsed.riskExposureIndex = Math.max(0, Math.min(100, Number(parsed.riskExposureIndex)));
    }
    if (parsed.confidenceScore !== undefined) {
      parsed.confidenceScore = Math.max(0, Math.min(100, Number(parsed.confidenceScore)));
    }

    return parsed as HTIAdvisoryContent;
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    throw new Error("Failed to parse LLM advisory response");
  }
}

// ========================================
// MAIN LLM INTEGRATION
// ========================================

/**
 * Generate unified cross-engine HTI advisory using DeepSeek LLM
 */
export async function generateHTIAdvisory(
  aggregatedData: HTIAggregatedInput
): Promise<HTIAdvisoryContent> {
  console.log(`🧠 Generating unified cross-engine HTI Advisory with DeepSeek...`);

  const prompt = buildCrossEnginePrompt(aggregatedData);

  const payload = {
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    max_tokens: 32000,
    temperature: 0.7,
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
    const llmOutput = responseBody.choices?.[0]?.message?.content || "";

    if (!llmOutput) {
      throw new Error("No text in DeepSeek response");
    }

    const advisory = parseAdvisoryResponse(llmOutput);

    // Add audit trail entry
    advisory.auditTrail = [{
      timestamp: new Date().toISOString(),
      action: "generated",
      details: `Cross-engine advisory generated from ${aggregatedData.completedEnginesCount}/${aggregatedData.totalEngines} completed engines using ${MODEL_ID}`
    }];

    return advisory;
  } catch (error) {
    console.error("❌ Error generating HTI advisory:", error);
    throw error;
  }
}
