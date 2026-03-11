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
export type EngineReportType = 'sharedServices' | 'changeManagement' | 'vendorFit' | 'digitalRoadmap' | 'aiMaturity';

type SectionPlan = { title: string, focus: string };

function getEngineSections(engineType: EngineReportType): SectionPlan[] {
  const SECTIONS: Record<EngineReportType, SectionPlan[]> = {
    sharedServices: [
      { title: "Executive Strategic Synthesis", focus: "Architecture of 'Case for Change', high-level maturity classification, and long-term organizational posture. (Approx 600-800 words)" },
      { title: "Maturity Domain Deep-Dive: Service Delivery & Governance", focus: "Analyzing the 9 maturity domains specifically for governance, delivery models, and accountability structures. (Approx 800-1000 words)" },
      { title: "The Agentic Transformation: AI-Powered Workflows", focus: "Detailed blueprint for replacing manual HR tasks with Agentic AI. Specific technology stack and operational impact. (Approx 600-800 words)" },
      { title: "Financial Engineering & ROI Calculus", focus: "5-year cost bridge, efficiency benchmarks, and value realization timelines. Detailed ROI tables. (Approx 600-800 words)" },
      { title: "Digital Infrastructure & Integration Architecture", focus: "Technical debt assessment and modern API-driven integration plan. (Approx 600-800 words)" },
      { title: "3-Year Strategic Roadmap & KPIs", focus: "Phase-by-phase tactical execution plan from 'Now' to 'Future State'. (Approx 800-1000 words)" }
    ],
    changeManagement: [
      { title: "Change Readiness Index Analysis (SFRI & LGI)", focus: "Strategic, Financial, and Leadership governance deep-dive. ROOT CAUSE analysis of readiness gaps. (Approx 800-1000 words)" },
      { title: "Organizational & Cultural Readiness (OCRI)", focus: "Culture mapping, psychological safety, and change resistance drivers. (Approx 800-1000 words)" },
      { title: "Digital & Workforce Readiness (DWRI)", focus: "Digital literacy assessment and workforce upskilling strategy. (Approx 800-1000 words)" },
      { title: "Adoption & Sustainability Intelligence (ASII)", focus: "Ensuring persistent change and governance of adoption. (Approx 600-800 words)" },
      { title: "Communication & Stakeholder Engagement Blueprint", focus: "Detailed communication matrix and stakeholder resistance map. (Approx 800-1000 words)" },
      { title: "Transition Metrics & 12-Month Execution Plan", focus: "90-day quick wins and 12-month sustainability milestones. (Approx 600-800 words)" }
    ],
    vendorFit: [
      { title: "Decision Framework & Recommendation", focus: "Overall fit score and Strategic Rationale. Why the selected architecture wins. (Approx 600-800 words)" },
      { title: "Functional Coverage & Requirement Matrix", focus: "Item-by-item matching of business requirements vs vendor capability. (Approx 800-1000 words)" },
      { title: "Technical & Security Architecture Evaluation", focus: "Cloud-native assessment, data security, and API maturity. (Approx 800-1000 words)" },
      { title: "Total Cost of Ownership (TCO) & Negotiation Strategy", focus: "5-year financial model and license structures. (Approx 600-800 words)" },
      { title: "Implementation Risk & Vendor Viability", focus: "Project failure risk assessment and vendor support model. (Approx 800-1000 words)" },
      { title: "Strategic Alignment & Future-Proofing", focus: "Vendor roadmap vs Company’s 5-year growth strategy. (Approx 600-800 words)" }
    ],
    digitalRoadmap: [
      { title: "Transformation Vision & Digital Pillars", focus: "Strategic alignment of digital roadmap with 9 transformation pillars. (Approx 800-1000 words)" },
      { title: "System Synergy & Architecture Roadmap", focus: "How current and future systems will integrate. (Approx 800-1000 words)" },
      { title: "Workforce Impact & Reskilling Strategy", focus: "Transition planning for employees and digital upskilling. (Approx 800-1000 words)" },
      { title: "Implementation Timeline & Milestones", focus: "6, 12, and 24-month granular action plan. (Approx 800-1000 words)" },
      { title: "Financial Forecast & ROI Projections", focus: "Budget planning and value realization metrics. (Approx 600-800 words)" },
      { title: "Risk Mitigation & Governance Framework", focus: "Security, compliance, and change governance. (Approx 600-800 words)" }
    ],
    aiMaturity: [
      { title: "AI Readiness & Maturity Index", focus: "Deep-dive into current AI adoption vs industry benchmarks. (Approx 800-1000 words)" },
      { title: "Agentic AI Use-Case Prioritization", focus: "Identifying high-impact HR areas for AI agents. (Approx 800-1000 words)" },
      { title: "Data Infrastructure for AI Success", focus: "Assessing data quality and accessibility for AI models. (Approx 800-1000 words)" },
      { title: "Ethical AI & Governance Model", focus: "Bias mitigation, privacy, and transparent AI policies. (Approx 600-800 words)" },
      { title: "ROI of AI Implementation", focus: "Efficiency gains vs implementation costs. (Approx 600-800 words)" },
      { title: "Strategic 24-Month AI Adoption Roadmap", focus: "Phase-by-phase rollout of AI capabilities. (Approx 800-1000 words)" }
    ]
  };
  return SECTIONS[engineType];
}

function buildAdvisoryPrompt(data: HTIAggregatedInput, engineType: EngineReportType = 'sharedServices'): string {
  const { engines } = data;
  const sections = getEngineSections(engineType);

  // ── Engine-specific title/context ──────────────────────────────────────────
  const TITLES: Record<EngineReportType, string> = {
    sharedServices: "Shared Services Transformation",
    changeManagement: "Intelligent Change Management Assessment",
    vendorFit: "Cognitive HCM Vendor Fit Assessment",
    digitalRoadmap: "HR Digital Transformation Roadmap",
    aiMaturity: "AI Driven Maturity Assessment"
  };

  const CONTEXTS: Record<EngineReportType, string> = {
    sharedServices: "HR Shared Services Assessment across 9 maturity domains.",
    changeManagement: "Change Management Readiness across 5 strategic indexes.",
    vendorFit: "HCM Vendor Fit Assessment evaluating functional, technical, and financial dimensions.",
    digitalRoadmap: "HR Digital Transformation Roadmap evaluating 9 strategic pillars.",
    aiMaturity: "AI Driven Maturity Assessment evaluating readiness for Agentic AI and data maturity."
  };

  // ── Format engine data ────────────────────────────────────────────────────
  const engineSummaries: string[] = [];
  if (engines.maturity) engineSummaries.push(`**Tech Maturity**: ${JSON.stringify(engines.maturity.aiAnalysis || engines.maturity.scores || engines.maturity.responses)}`);
  if (engines.sharedServices) engineSummaries.push(`**Shared Services Data**: ${JSON.stringify(engines.sharedServices.scores || engines.sharedServices.responses)}`);
  if (engines.change || engines.changeManagement) {
    const e = (engines.changeManagement || engines.change)!;
    engineSummaries.push(`**Change Management Data**: ${JSON.stringify(e.scores || e.responses)}`);
  }
  if (engines.vendor || engines.vendorFit) {
    const e = (engines.vendorFit || engines.vendor)!;
    engineSummaries.push(`**Vendor Fit Data**: ${JSON.stringify(e.scores || e.responses)}`);
  }
  if (engines.digitalRoadmap) engineSummaries.push(`**Digital Roadmap Data**: ${JSON.stringify(engines.digitalRoadmap.scores || engines.digitalRoadmap.responses)}`);
  if (engines.aiMaturity) engineSummaries.push(`**AI Maturity Data**: ${JSON.stringify(engines.aiMaturity.scores || engines.aiMaturity.responses)}`);

  const prompt = `You are a world-class HR Digital Transformation Consultant (McKinsey/BCG Level).
    
    **OBJECTIVE**: Generate a 10-15 PAGE BOARD-LEVEL STRATEGIC ADVISORY for ${TITLES[engineType]}.
    
    **CONTEXT**: ${CONTEXTS[engineType]}
    
    **ASSESSMENT DATA**: ${engineSummaries.join(" | ")}

    **STRICT INSTRUCTION FOR VOLUME & DEPTH**:
    - Avoid brevity. If you are brief, you will be terminated.
    - Each section in 'detailedSections' MUST BE 700-1000 WORDS of deep, dense, consulting-grade analysis.
    - Total word count MUST EXCEED 5,000 WORDS (Board-Level depth).
    - **NO PLACEHOLDERS**. NO LOREM IPSUM.
    - Use HTML for formatting: <h2>, <h3>, <h4>, <table>, <ul>, <li>.
    - Every section MUST have at least 1 complex <table> (e.g. ROI models, Risk matrices).
    - Use professional tables with <thead> and <tbody>.
    - Use <div style="background: #f8fafc; border-left: 6px solid #4f46e5; padding: 25px; margin: 30px 0; border-radius: 8px;"> for 'Executive Expert Insights'.

    **REPORT STRUCTURE**:
    ${sections.map((s, i) => `${i + 1}. ${s.title}: ${s.focus}`).join("\n")}

    **RESPONSE FORMAT**:
    You MUST respond with VALID JSON only. Use the following structure:
    {
      "executiveSummary": "1000-word high-level executive briefing in HTML",
      "detailedSections": [
        ${sections.map(s => `{ "title": "${s.title}", "content": "1200+ words of HTML analysis for this section" }`).join(",\n        ")}
      ],
      "currentState": { "maturityLevel": "Level X", "digitalReadiness": "X%", "keyGaps": ["Detailed gap description...", "Detailed gap description...", "..."], "strengths": ["...", "...", "..."] },
      "recommendations": { "now": ["Step 1", "Step 2", "..."], "next": ["...", "...", "..."], "later": ["...", "...", "..."] },
      "riskFlags": [ { "risk": "...", "mitigation": "..." }, ... ],
      "dependencies": ["...", "...", "..."],
      "avoidNow": ["...", "...", "..."],
      "successMetrics": ["Detailed KPI...", "Detailed KPI...", "..."]
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

    // Validate structure (minimal check)
    if (!parsed.executiveSummary || !parsed.currentState || !parsed.recommendations) {
      throw new Error("Invalid advisory structure from LLM");
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
 * Generate HTI advisory using DeepSeek LLM
 */
export async function generateHTIAdvisory(
  aggregatedData: HTIAggregatedInput,
  engineType: EngineReportType = 'sharedServices'
): Promise<HTIAdvisoryContent> {
  console.log(`🧠 Generating HTI Advisory for ${engineType} with DeepSeek...`);

  const prompt = buildAdvisoryPrompt(aggregatedData, engineType);

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

    return parseAdvisoryResponse(llmOutput);
  } catch (error) {
    console.error("❌ Error generating HTI advisory:", error);
    throw error;
  }
}
