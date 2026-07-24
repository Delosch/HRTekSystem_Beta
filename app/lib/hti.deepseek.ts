import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

import type {
  HTIAggregatedInput,
  HTIAdvisoryContent,
} from "~/models/hti.model.server";

import { deriveHTIScores } from "~/utils/htiScoreUtils";
import { buildEngineEvidenceBlock } from "~/utils/htiEvidence.server";
import type {HTIReportType} from "~/constants/engines";

export type EngineReportType =HTIReportType;

interface ReportSectionDefinition {
  title: string;
  focus: string;
  minWords: number;
  maxWords: number;
}

interface ReportPromptConfig {
  reportTitle: string;
  objective: string;
  sections: ReportSectionDefinition[];
}

interface EngineInput {
  engineName?: string;
  progress?: number;
  responses?: unknown;
  scores?: unknown;
  aiAnalysis?: unknown;
  aiReport?: unknown;
}

interface NormalizedEngines {
  maturity?: EngineInput;
  roadmap?: EngineInput;
  vendor?: EngineInput;
  change?: EngineInput;
  sharedServices?: EngineInput;
}

interface AvailableEngineDefinition {
  reportType: Exclude<EngineReportType, "crossEngine">;
  heading: string;
  evidenceName: string;
  heatmapName: string;
  data: EngineInput;
}

const REPORT_PROMPT_CONFIG: Record<EngineReportType, ReportPromptConfig> = {
  crossEngine: {
    reportTitle: "Cross-Engine HR Transformation Intelligence Advisory",
    objective:
      "Synthesize all completed assessment engines into one unified enterprise transformation advisory. Identify reinforcing signals, contradictions, dependencies, sequencing requirements, and CXO decisions.",
    sections: [
      {
        title: "Cross-Engine Strategic Synthesis",
        focus:
          "Identify convergence, contradictions, and strategic alignment gaps across all completed engines. Establish the unified transformation narrative leadership must act on.",
        minWords: 500,
        maxWords: 650,
      },
      {
        title: "Organizational & Change Architecture",
        focus:
          "Connect cultural readiness, governance, leadership accountability, workforce capability, and operating-model implications across the available evidence.",
        minWords: 425,
        maxWords: 575,
      },
      {
        title: "Technology Landscape & Vendor Intelligence",
        focus:
          "Connect technology maturity, integration readiness, vendor fit, scalability, data quality, and build-versus-buy implications where relevant evidence is available.",
        minWords: 425,
        maxWords: 575,
      },
      {
        title: "Digital Roadmap & Execution Blueprint",
        focus:
          "Present a phased execution plan with milestones, resources, dependencies, governance, and adoption requirements.",
        minWords: 475,
        maxWords: 625,
      },
      {
        title: "Cross-Engine Risk and Dependency Map",
        focus:
          "Identify enterprise risks and explain how weaknesses in one assessment area amplify risks found in another.",
        minWords: 375,
        maxWords: 525,
      },
      {
        title: "Transformation Priority and Sequencing",
        focus:
          "Rank initiatives by impact and effort and define what should happen Now, Next, and Later, including sequencing dependencies.",
        minWords: 375,
        maxWords: 525,
      },
      {
        title: "CXO Decision Brief",
        focus:
          "Summarize the decisions, ownership, funding, governance, and risk thresholds requiring executive action.",
        minWords: 325,
        maxWords: 475,
      },
      {
        title: "Caution Zones and Deferred Initiatives",
        focus:
          "Identify initiatives that should not proceed until specific organizational, financial, technical, or cultural prerequisites are satisfied.",
        minWords: 275,
        maxWords: 425,
      },
    ],
  },
  aiMaturity: {
    reportTitle: "HR Technology Maturity Strategic Advisory",
    objective:
      "Assess the organization's HR technology maturity and convert the evidence into a focused technology, data, integration, governance, capability, and investment roadmap.",
    sections: [
      {
        title: "Executive Technology Maturity Synthesis",
        focus:
          "Explain the overall maturity level, principal strengths, constraints, and executive implications.",
        minWords: 425,
        maxWords: 575,
      },
      {
        title: "Current Technology and Capability Baseline",
        focus:
          "Assess systems, architecture, processes, automation, data, workforce capability, and digital operating maturity.",
        minWords: 425,
        maxWords: 575,
      },
      {
        title: "Data, Integration and Automation Readiness",
        focus:
          "Evaluate interoperability, data quality, analytics, automation, AI readiness, and technical dependencies.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "Governance, Security and Operating Model",
        focus:
          "Assess decision rights, ownership, governance, security, service support, and delivery capacity.",
        minWords: 375,
        maxWords: 525,
      },
      {
        title: "Investment Priorities and Technology Roadmap",
        focus:
          "Prioritize foundational, tactical, and strategic technology improvements with sequencing and measurable outcomes.",
        minWords: 425,
        maxWords: 575,
      },
      {
        title: "Risks, Success Metrics and Executive Decisions",
        focus:
          "Define key risks, success measures, decision gates, and actions required from leadership.",
        minWords: 325,
        maxWords: 475,
      },
    ],
  },
  digitalRoadmap: {
    reportTitle: "HR Transformation Roadmap Strategic Advisory",
    objective:
      "Translate the roadmap assessment into a sequenced and executable HR transformation plan grounded in organizational priorities, constraints, readiness, and expected value.",
    sections: [
      {
        title: "Transformation Ambition and Strategic Alignment",
        focus:
          "Explain the transformation ambition, business drivers, desired outcomes, and strategic alignment gaps.",
        minWords: 425,
        maxWords: 575,
      },
      {
        title: "Current-State Gaps and Dependencies",
        focus:
          "Assess process, technology, workforce, data, governance, and change dependencies.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "Prioritized Transformation Portfolio",
        focus:
          "Rank initiatives by value, readiness, complexity, dependency, and strategic contribution.",
        minWords: 425,
        maxWords: 575,
      },
      {
        title: "Phased Execution Roadmap",
        focus:
          "Define the 0-6, 6-12, and 12-24 month sequence with milestones, outcomes, and prerequisites.",
        minWords: 450,
        maxWords: 600,
      },
      {
        title: "Resources, Governance and Change Requirements",
        focus:
          "Explain ownership, funding, capacity, governance, communication, and adoption prerequisites.",
        minWords: 375,
        maxWords: 525,
      },
      {
        title: "Risks, Success Metrics and CXO Decisions",
        focus:
          "Identify execution risks, KPIs, decision gates, and executive actions.",
        minWords: 325,
        maxWords: 475,
      },
    ],
  },
  vendorFit: {
    reportTitle: "HCM Vendor Fit Strategic Advisory",
    objective:
      "Evaluate vendor readiness and fit based on functional, technical, commercial, operational, integration, scalability, and organizational requirements.",
    sections: [
      {
        title: "Vendor Readiness Executive Synthesis",
        focus:
          "Explain overall vendor readiness, fit level, material constraints, and decision implications.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "Functional and Deployment Fit",
        focus:
          "Assess required modules, deployment preferences, operating model, user requirements, and functional gaps.",
        minWords: 375,
        maxWords: 525,
      },
      {
        title: "Integration and Architecture Fit",
        focus:
          "Assess interfaces, data migration, technical complexity, security, interoperability, and scalability.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "Commercial Fit and Total Cost Implications",
        focus:
          "Assess budget alignment, implementation cost, operating cost, commercial constraints, and value realization risk.",
        minWords: 375,
        maxWords: 525,
      },
      {
        title: "Vendor Options and Trade-offs",
        focus:
          "Compare suitable vendor categories and explain their strengths, limitations, assumptions, and fit.",
        minWords: 425,
        maxWords: 575,
      },
      {
        title: "Selection Plan, Risks and Decision Criteria",
        focus:
          "Define evaluation criteria, due-diligence priorities, next steps, risks, and decision gates.",
        minWords: 325,
        maxWords: 475,
      },
    ],
  },
  changeManagement: {
    reportTitle: "Intelligent Change Management Strategic Advisory",
    objective:
      "Assess organizational change readiness and define a focused leadership, stakeholder, communication, capability, adoption, and sustainability plan.",
    sections: [
      {
        title: "Change Readiness Executive Synthesis",
        focus:
          "Explain organizational readiness, resistance exposure, strengths, constraints, and primary risks.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "Leadership and Stakeholder Alignment",
        focus:
          "Assess sponsorship, decision ownership, stakeholder influence, leadership consistency, and accountability.",
        minWords: 375,
        maxWords: 525,
      },
      {
        title: "Culture, Resistance and Communication",
        focus:
          "Identify resistance drivers, cultural barriers, communication gaps, employee concerns, and engagement needs.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "Capability and Training Strategy",
        focus:
          "Define role-based learning, manager enablement, workforce capability, and performance-support requirements.",
        minWords: 375,
        maxWords: 525,
      },
      {
        title: "Adoption Governance and Sustainability",
        focus:
          "Define adoption ownership, reinforcement, measurement, benefits realization, and sustainability mechanisms.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "90-Day Plan, Metrics and Executive Decisions",
        focus:
          "Provide immediate interventions, success measures, decision gates, and leadership actions.",
        minWords: 325,
        maxWords: 475,
      },
    ],
  },
  sharedServices: {
    reportTitle: "HR Shared Services Strategic Advisory",
    objective:
      "Assess the shared-services opportunity and define the appropriate service-delivery model, process architecture, technology enablement, governance, transition roadmap, and performance framework.",
    sections: [
      {
        title: "Shared Services Executive Synthesis",
        focus:
          "Explain the shared-services opportunity, readiness, constraints, and business-case implications.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "Current Operating Model and Process Baseline",
        focus:
          "Assess fragmentation, standardization, service ownership, volumes, process maturity, and control gaps.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "Target Service Delivery Model",
        focus:
          "Define service scope, tiers, channels, governance, locations, roles, and accountabilities.",
        minWords: 425,
        maxWords: 575,
      },
      {
        title: "Technology and Automation Enablement",
        focus:
          "Assess case management, knowledge, workflow, self-service, analytics, automation, and integration requirements.",
        minWords: 375,
        maxWords: 525,
      },
      {
        title: "Transition Roadmap and Workforce Impact",
        focus:
          "Define transition phases, workforce implications, dependencies, capability needs, and adoption requirements.",
        minWords: 400,
        maxWords: 550,
      },
      {
        title: "Risks, KPIs and Executive Decisions",
        focus:
          "Define service metrics, implementation risks, controls, decision gates, and leadership actions.",
        minWords: 325,
        maxWords: 475,
      },
    ],
  },
};

const bedrock = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const MODEL_ID = "deepseek.v3-v1:0";

const HTI_ADVISORY_ROLE = `
You are HRTek's senior HR transformation advisory analyst.

Prepare an evidence-based, client-ready strategic advisory for executive
and board-level decision-makers.

Use HRTek's own professional advisory voice. Do not claim affiliation with,
endorsement by, or imitation of any named consulting firm.

Your analysis must be clear, neutral, specific, and grounded in the
assessment evidence provided.
`.trim();

function getNormalizedEngines(data: HTIAggregatedInput): NormalizedEngines {
  const engines = data.engines as Record<string, EngineInput | undefined>;

  return {
    maturity: engines.maturity ?? engines.aiMaturity,
    roadmap: engines.roadmap ?? engines.digitalRoadmap,
    vendor: engines.vendor ?? engines.vendorFit,
    change: engines.change ?? engines.changeManagement,
    sharedServices: engines.sharedServices,
  };
}

function getAvailableEngines(
  data: HTIAggregatedInput
): AvailableEngineDefinition[] {
  const engines = getNormalizedEngines(data);
  const available: AvailableEngineDefinition[] = [];

  if (engines.maturity) {
    available.push({
      reportType: "aiMaturity",
      heading: "HR TECHNOLOGY MATURITY ANALYSIS",
      evidenceName: "HR Technology Maturity Analysis",
      heatmapName: "HR Technology Maturity",
      data: engines.maturity,
    });
  }

  if (engines.roadmap) {
    available.push({
      reportType: "digitalRoadmap",
      heading: "HR DIGITAL TRANSFORMATION ROADMAP",
      evidenceName: "HR Transformation Roadmap Generator",
      heatmapName: "Digital Roadmap",
      data: engines.roadmap,
    });
  }

  if (engines.vendor) {
    available.push({
      reportType: "vendorFit",
      heading: "COGNITIVE HCM VENDOR FIT ASSESSMENT",
      evidenceName: "HCM Vendor Fit Engine",
      heatmapName: "Vendor Fit",
      data: engines.vendor,
    });
  }

  if (engines.change) {
    available.push({
      reportType: "changeManagement",
      heading: "INTELLIGENT CHANGE MANAGEMENT ASSESSMENT",
      evidenceName: "Intelligent Change Management",
      heatmapName: "Change Management",
      data: engines.change,
    });
  }

  if (engines.sharedServices) {
    available.push({
      reportType: "sharedServices",
      heading: "SHARED SERVICE DESIGNER ASSESSMENT",
      evidenceName: "Shared Service Designer",
      heatmapName: "Shared Services",
      data: engines.sharedServices,
    });
  }

  return available;
}

function inferReportType(data: HTIAggregatedInput): EngineReportType {
  const available = getAvailableEngines(data);
  return available.length === 1 ? available[0].reportType : "crossEngine";
}

function buildEngineBlock(definition: AvailableEngineDefinition): string {
  const evidenceBlock = buildEngineEvidenceBlock({
    engineName: definition.evidenceName,
    progress: definition.data.progress,
    responses: definition.data.responses,
    scores: definition.data.scores,
    aiAnalysis: definition.data.aiAnalysis,
    aiReport: definition.data.aiReport,
  });

  return `=== ${definition.heading} ===\n${evidenceBlock}`;
}

function getRelevantEngines(
  available: AvailableEngineDefinition[],
  reportType: EngineReportType
): AvailableEngineDefinition[] {
  if (reportType === "crossEngine") return available;

  const matching = available.filter(
    (engine) => engine.reportType === reportType
  );

  return matching.length > 0 ? matching : available;
}

function buildCapabilityHeatmapExample(
  definitions: AvailableEngineDefinition[]
): string {
  if (definitions.length === 0) return "[]";

  return `[
${definitions
  .map(
    (engine) =>
      `    { "engine": "${engine.heatmapName}", "score": 70, "status": "moderate" }`
  )
  .join(",\n")}
  ]`;
}

function buildAdvisoryPrompt(
  data: HTIAggregatedInput,
  reportType: EngineReportType
): string {
  const config = REPORT_PROMPT_CONFIG[reportType];
  const isCrossEngine = reportType === "crossEngine";
  const available = getAvailableEngines(data);
  const relevant = getRelevantEngines(available, reportType);
  const engineBlocks = relevant.map(buildEngineBlock);
  const completedCount = relevant.filter(
    (engine) => engine.data.progress === 100
  ).length;

  const scope = isCrossEngine
    ? `Synthesize the ${relevant.length} available assessment engine inputs into one unified strategic advisory. Cross-engine claims must be based only on engines present in the evidence.`
    : `Prepare an engine-specific advisory for ${config.reportTitle}. Do not describe this report as a cross-engine synthesis unless multiple inputs are explicitly compared.`;

  const wordTarget =
    config.sections.length >= 8 ? "4,000-5,500" : "3,000-4,500";

  return `${HTI_ADVISORY_ROLE}

**REPORT TYPE**:
${config.reportTitle}

**OBJECTIVE**:
${config.objective}

**COMPANY ID**:
${data.companyId}

**REPORT SCOPE**:
${scope}

**ASSESSMENT INPUTS**:
- Relevant engine inputs available: ${relevant.length}
- Relevant engines marked complete: ${completedCount}
- Platform completion metadata: ${data.completedEnginesCount}/${data.totalEngines}

${engineBlocks.length > 0
  ? engineBlocks.join("\n\n")
  : "No usable assessment evidence was supplied. State this limitation and do not invent findings."}

**QUALITY REQUIREMENTS**:
- Produce an executive advisory intended to render in approximately 10-15 A4 pages.
- Target approximately ${wordTarget} words; do not exceed 6,000 words.
- The executive summary must be 450-600 words.
- Follow the chapter-specific word ranges below.
- Prioritize evidence, interpretation, business impact, and action over repetition.
- Use 3-5 meaningful subsections per chapter.
- No placeholders, sample values, lorem ipsum, or invented client facts.
- Use HTML only inside executiveSummary and detailedSections[].content.
- Supported tags: <h2>, <h3>, <h4>, <p>, <table>, <thead>, <tbody>, <tr>, <th>, <td>, <ul>, <ol>, <li>, <strong>, <em>, <div>.
- Use no more than 3-4 tables; each table may contain at most 6 body rows and 5 columns.
- Restate each table's main conclusion in a short paragraph.
- Use the assessment-response evidence blocks as the primary factual basis.
- Each major finding must reference at least 2 response signals when at least 2 mapped signals are available.
- Tie every material recommendation to assessment evidence.
- If evidence is incomplete or unclear, state the limitation instead of inventing meaning.
- Each detailed section must include <h4>Evidence from assessment responses</h4>, <h4>Business implication</h4>, and <h4>Recommended action</h4>.
- ${isCrossEngine
  ? "Cross-reference engines only where the evidence supports a genuine relationship."
  : "Do not introduce findings from assessment engines that are not relevant to this report type."}

**PROFESSIONAL WRITING STANDARD**:
- Use a neutral, precise, client-ready advisory tone.
- Avoid shallow bullet-only analysis, generic consulting filler, and repeated wording.
- Do not mention named consulting firms, DeepSeek, the model, or internal prompt instructions.
- Do not invent benchmark studies, market statistics, peer counts, or success multipliers.
- Round user-facing scores to at most one decimal place.

**STRUCTURED CONTENT LIMITS**:
- currentState.keyGaps and strengths: 4-6 items, 20-45 words each.
- recommendations.now/next/later: 3-5 items, 35-70 words each.
- riskFlags: 4-6 items; risk 15-35 words; mitigation 35-80 words.
- dependencies: 4-7 items, 25-60 words each.
- avoidNow: 3-5 items, 25-60 words each.
- successMetrics: 5-8 items, 20-45 words each.
- priorityMatrix: 8-12 rows.
- doNotTransformNow: 3-6 rows.

**REPORT STRUCTURE** (${config.sections.length} chapters):
${config.sections
  .map(
    (section, index) =>
      `${index + 1}. ${section.title}
   Focus: ${section.focus}
   Target length: ${section.minWords}-${section.maxWords} words`
  )
  .join("\n")}

**SCORING INSTRUCTIONS**:
- transformationReadinessScore (0-100): Derive it from relevant assessment evidence, not completion percentage.
- riskExposureIndex (0-100): Higher means greater evidenced risk.
- confidenceScore (0-100): Reflect evidence completeness, clarity, consistency, and coverage.
- capabilityHeatmap: Include only engines present in the supplied evidence.
- priorityMatrix: Provide 8-12 specific initiatives with impact and effort from 1-10 and timeframe now/next/later.
- doNotTransformNow: Provide 3-6 evidence-based caution areas.
- Do not invent a score merely to fill the schema; explain limitations in the nearest narrative field.

**RESPONSE FORMAT — RETURN VALID JSON ONLY**:
{
  "executiveSummary": "450-600 word HTML executive briefing appropriate for ${config.reportTitle}",
  "detailedSections": [
${config.sections
  .map(
    (section) =>
      `    { "title": "${section.title}", "content": "${section.minWords}-${section.maxWords} words of evidence-based HTML analysis" }`
  )
  .join(",\n")}
  ],
  "currentState": {
    "maturityLevel": "Level X — descriptive label",
    "digitalReadiness": "X% — with context relevant to this report type",
    "keyGaps": ["Specific evidence-based gap"],
    "strengths": ["Specific evidence-based strength"]
  },
  "recommendations": {
    "now": ["Immediate evidence-based action"],
    "next": ["Medium-term evidence-based action"],
    "later": ["Longer-term evidence-based action"]
  },
  "riskFlags": [
    {
      "risk": "Specific evidence-based risk",
      "mitigation": "Specific mitigation with owner, timeframe, and expected control"
    }
  ],
  "dependencies": ["Initiative A must precede Initiative B because..."],
  "avoidNow": ["Do not attempt X until prerequisite Y is satisfied because..."],
  "successMetrics": ["KPI with target and timeline"],
  "transformationReadinessScore": 72,
  "riskExposureIndex": 45,
  "confidenceScore": 88,
  "capabilityHeatmap": ${buildCapabilityHeatmapExample(relevant)},
  "priorityMatrix": [
    {
      "initiative": "Specific initiative",
      "impact": 9,
      "effort": 4,
      "timeframe": "now",
      "category": "Technology"
    }
  ],
  "doNotTransformNow": [
    {
      "area": "Specific area",
      "reason": "Evidence-based reason",
      "category": "organizational",
      "revisitIn": "12 months"
    }
  ]
}

**ABSOLUTE OUTPUT RULES**:
- Return exactly one JSON object.
- Do not use markdown code fences.
- Do not include text before or after the JSON.
- Preserve the property names and data types shown above.
- Use double quotes and no trailing commas.
`.trim();
}

function safeJsonExtract(rawText: string): string {
  const firstBrace = rawText.indexOf("{");
  const lastBrace = rawText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("No JSON object found in LLM response");
  }

  return rawText.slice(firstBrace, lastBrace + 1);
}

function normalizeScore(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") {
    return undefined;
  }

  const numberValue =
    typeof value === "string"
      ? Number(value.replace(/%/g, "").trim())
      : Number(value);

  if (!Number.isFinite(numberValue)) return undefined;

  return Math.max(0, Math.min(100, Number(numberValue.toFixed(1))));
}

function htmlToPlainText(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function countWords(value: unknown): number {
  const text = htmlToPlainText(value);
  return text ? text.split(/\s+/).filter(Boolean).length : 0;
}

function auditAdvisoryLength(
  advisory: HTIAdvisoryContent,
  reportType: EngineReportType
): string[] {
  const warnings: string[] = [];
  const config = REPORT_PROMPT_CONFIG[reportType];
  const executiveWords = countWords(advisory.executiveSummary);

  if (executiveWords < 350) {
    warnings.push(`Executive summary is too short: ${executiveWords} words.`);
  }

  if (executiveWords > 700) {
    warnings.push(`Executive summary is too long: ${executiveWords} words.`);
  }

  advisory.detailedSections?.forEach((section, index) => {
    const target = config.sections[index];
    const words = countWords(section.content);

    if (!target) {
      warnings.push(
        `Unexpected detailed section "${section.title}" at index ${index}.`
      );
      return;
    }

    if (section.title.trim() !== target.title.trim()) {
      warnings.push(
        `Section ${index + 1} title differs: expected "${target.title}", received "${section.title}".`
      );
    }

    if (words < target.minWords * 0.8) {
      warnings.push(
        `"${section.title}" is short: ${words} words; target ${target.minWords}-${target.maxWords}.`
      );
    }

    if (words > target.maxWords * 1.2) {
      warnings.push(
        `"${section.title}" is long: ${words} words; target ${target.minWords}-${target.maxWords}.`
      );
    }
  });

  if (
    advisory.detailedSections &&
    advisory.detailedSections.length !== config.sections.length
  ) {
    warnings.push(
      `Expected ${config.sections.length} sections for ${reportType}, received ${advisory.detailedSections.length}.`
    );
  }

  const totalWords =
    executiveWords +
    (advisory.detailedSections ?? []).reduce(
      (total, section) => total + countWords(section.content),
      0
    );

  if (totalWords > 6000) {
    warnings.push(
      `The main narrative contains ${totalWords} words and may produce an excessively long PDF.`
    );
  }

  return warnings;
}

function parseAdvisoryResponse(
  llmOutput: string,
  aggregatedData: HTIAggregatedInput
): HTIAdvisoryContent {
  try {
    const parsed = JSON.parse(
      safeJsonExtract(llmOutput)
    ) as Record<string, unknown>;

    if (
      !parsed.executiveSummary ||
      !parsed.currentState ||
      !parsed.recommendations
    ) {
      throw new Error("Invalid advisory structure from LLM");
    }

    const directReadiness = normalizeScore(
      parsed.transformationReadinessScore
    );
    const directRisk = normalizeScore(parsed.riskExposureIndex);
    const directConfidence = normalizeScore(parsed.confidenceScore);

    if (directReadiness !== undefined) {
      parsed.transformationReadinessScore = directReadiness;
    }
    if (directRisk !== undefined) {
      parsed.riskExposureIndex = directRisk;
    }
    if (directConfidence !== undefined) {
      parsed.confidenceScore = directConfidence;
    }

    const derivedScores = deriveHTIScores(parsed, aggregatedData);

    if (derivedScores.readinessScore !== null) {
      parsed.transformationReadinessScore =
        derivedScores.readinessScore;
    }
    if (derivedScores.riskScore !== null) {
      parsed.riskExposureIndex = derivedScores.riskScore;
    }
    if (derivedScores.confidenceScore !== null) {
      parsed.confidenceScore = derivedScores.confidenceScore;
    }

    return parsed as unknown as HTIAdvisoryContent;
  } catch (error) {
    console.error("Error parsing LLM response:", error);
    throw new Error("Failed to parse LLM advisory response");
  }
}

export async function generateHTIAdvisory(
  aggregatedData: HTIAggregatedInput,
  reportType: EngineReportType = inferReportType(aggregatedData)
): Promise<HTIAdvisoryContent> {
  const config = REPORT_PROMPT_CONFIG[reportType];

  console.log(`Generating ${config.reportTitle} with DeepSeek`);

  const payload = {
    messages: [
      {
        role: "user",
        content: buildAdvisoryPrompt(aggregatedData, reportType),
      },
    ],
    max_tokens: 32000,
    temperature: 0.7,
  };

  try {
    const response = await bedrock.send(
      new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload),
      })
    );

    if (!response.body) {
      throw new Error("Empty response from DeepSeek");
    }

    const responseBody = JSON.parse(
      new TextDecoder().decode(response.body)
    );

    const llmOutput =
      responseBody.choices?.[0]?.message?.content ?? "";

    if (!llmOutput) {
      throw new Error("No text in DeepSeek response");
    }

    const advisory = parseAdvisoryResponse(llmOutput, aggregatedData);
    const lengthWarnings = auditAdvisoryLength(advisory, reportType);

    if (lengthWarnings.length > 0) {
      console.warn("HTI advisory length warnings:", lengthWarnings);
    }

    advisory.auditTrail = [
      {
        timestamp: new Date().toISOString(),
        action: "generated",
        details:
          `${config.reportTitle} generated from ` +
          `${aggregatedData.completedEnginesCount}/` +
          `${aggregatedData.totalEngines} completed engines using ${MODEL_ID}`,
      },
    ];

    return advisory;
  } catch (error) {
    console.error(`Error generating ${config.reportTitle}:`, error);
    throw error;
  }
}
