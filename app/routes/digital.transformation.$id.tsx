//digital/transformation/digital_transformation
import type { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useMemo, useState } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getCompanyProfile } from "~/models/company.model";
import { getLatestAnalysis } from "~/utils/analysis";

// ---------- Types ----------
type Initiative = {
  id: string;
  name: string;
  classification: "Foundational" | "Tactical" | "Strategic" | "Innovative";
  horizon: "0-6m" | "6-12m" | "12-24m";
  readinessScore: number;
  impactScore: number;
  priorityRank: number;
  rationale: string;
  dependencies: string[];
  owners: string[];
  kpis: string[];
};

type VendorCategory = {
  area: string;
  recommended: string[];
  fitNotes: string;
  advisoryModels: string[];
};

type ReportResult = {
  meta: {
    companyPk: string;
    assessmentSk: string;
    generatedAt: string;
    assumptionsAndRisks: string[];
  };
  prioritizedInitiatives: Initiative[];
  roadmap: {
    "0_6_months": string[];
    "6_12_months": string[];
    "12_24_months": string[];
  };
  quickWins: string[];
  longTermBets: string[];
  toolsAndVendors: { categories: VendorCategory[] };
  scenarioPlanning: {
    levers: {
      name: string;
      whatIf: string;
      expectedEffects: string[];
      impactedInitiatives: string[];
    }[];
    sensitivityNotes: string[];
  };
};

type AnalysisPayload = {
  pk: string;
  sk: string;
  assessment_id: string;
  createdAt: string;
  section: string;
  result: ReportResult;
};

const mock ={
 "pk": "COMPANY#fe5e5521-ede1-4d4a-a2bd-59f68bc1cee5",
 "sk": "ANALYSIS#2025-08-11T07:04:59.908Z",
 "assessment_id": "QUESTION#1b3e5d7a-8f9c-4e2b-a7d1-0f3c5e9a2b4f",
 "createdAt": "2025-08-11T07:04:59.908Z",
 "result": {
  "longTermBets": [
   "INIT-006",
   "INIT-007",
   "INIT-009"
  ],
  "meta": {
   "assessmentSk": "ASSESSMENT#1b3e5d7a-8f9c-4e2b-a7d1-0f3c5e9a2b4f",
   "assumptionsAndRisks": [
    "Major Conflict: Innovation readiness is 'Not relevant currently' (s3_q9) while risk appetite is 'High – Innovation-led' (s7_q24) and priorities include AI/Chatbots (s3_q8). Plan assumes priorities are the true intent, but innovative projects require strong foundational work and business cases first.",
    "Conflict: The company uses 'SAP SuccessFactors' (s5_q14) but lacks Core HRMS, ESS/MSS, and Payroll coverage (s2_q5). Assumed they have licensed SF but only implemented limited talent modules, not Employee Central.",
    "Risk: A 'Big-bang' rollout (s3_q10) is selected but is extremely high-risk given 'Not integrated – siloed data pools' (s5_q15) and 'Mixed' change readiness (s4_q12). The proposed roadmap is phased to mitigate this risk.",
    "Data quality is a known issue ('lacks quality standards' s6_q21), which will delay the impact of any analytics, AI, or planning initiatives until foundational data governance is established."
   ],
   "companyPk": "COMPANY#0a457c8f-3a4a-4082-8e6c-3bc963314f89",
   "generatedAt": "2024-10-27T10:00:00Z"
  },
  "prioritizedInitiatives": [
   {
    "classification": "Foundational",
    "dependencies": [
    ],
    "horizon": "0-6m",
    "id": "INIT-001",
    "impactScore": 5,
    "kpis": [
     "% of critical data elements with defined owners",
     "Data quality score improvement",
     "Reduction in manual data correction incidents"
    ],
    "name": "Establish HR Data Governance and Quality Framework",
    "owners": [
     "DTO",
     "HR",
     "IT"
    ],
    "priorityRank": 1,
    "rationale": "Directly addresses 'data lacks quality standards' (s6_q21). A critical prerequisite for enabling 'data-driven HR' (s1_q1) and all strategic priorities like workforce planning and analytics.",
    "readinessScore": 4
   },
   {
    "classification": "Foundational",
    "dependencies": [
    ],
    "horizon": "0-6m",
    "id": "INIT-002",
    "impactScore": 5,
    "kpis": [
     "Integration blueprint approved",
     "iPaaS vendor selected",
     "Time to integrate new application"
    ],
    "name": "Define Integration Strategy and Select iPaaS Solution",
    "owners": [
     "DTO",
     "IT",
     "HR"
    ],
    "priorityRank": 2,
    "rationale": "Addresses top pain points of 'Integration challenges' and 'Fragmented tools' (s2_q6). Essential for connecting SuccessFactors modules and enabling a cohesive ecosystem.",
    "readinessScore": 4
   },
   {
    "classification": "Foundational",
    "dependencies": [
     "INIT-001",
     "INIT-002"
    ],
    "horizon": "6-12m",
    "id": "INIT-003",
    "impactScore": 5,
    "kpis": [
     "Employee data accuracy",
     "ESS/MSS adoption rate",
     "Reduction in HR admin queries"
    ],
    "name": "Implement Core HRMS (SuccessFactors EC) with ESS/MSS",
    "owners": [
     "HR",
     "IT",
     "DTO"
    ],
    "priorityRank": 3,
    "rationale": "Fills a major gap in current coverage (s2_q5) and addresses the 'Lack of mobile/web self-service' pain point (s2_q6). Creates the single source of truth required for all other initiatives.",
    "readinessScore": 3
   },
   {
    "classification": "Tactical",
    "dependencies": [
    ],
    "horizon": "0-6m",
    "id": "INIT-004",
    "impactScore": 4,
    "kpis": [
     "Time to onboard",
     "New hire satisfaction score (NPS)",
     "Reduction in paper/printing costs"
    ],
    "name": "Implement Paperless Onboarding Solution",
    "owners": [
     "Talent Acquisition",
     "HR Ops",
     "IT"
    ],
    "priorityRank": 4,
    "rationale": "Directly addresses a stated priority (s3_q8) and improves 'Talent experience' (s1_q1). Can be implemented quickly for immediate impact on time-to-hire metrics.",
    "readinessScore": 4
   },
   {
    "classification": "Tactical",
    "dependencies": [
     "INIT-003"
    ],
    "horizon": "6-12m",
    "id": "INIT-005",
    "impactScore": 4,
    "kpis": [
     "Case resolution time",
     "First contact resolution %",
     "Employee satisfaction with HR support (CSAT)"
    ],
    "name": "Launch HR Case Management and Knowledge Base",
    "owners": [
     "HRSS",
     "IT"
    ],
    "priorityRank": 5,
    "rationale": "A key priority (s3_q8) that improves operational efficiency and employee experience. Foundational for future chatbot expansion.",
    "readinessScore": 3
   },
   {
    "classification": "Strategic",
    "dependencies": [
     "INIT-001",
     "INIT-003"
    ],
    "horizon": "12-24m",
    "id": "INIT-006",
    "impactScore": 5,
    "kpis": [
     "Forecast accuracy (plan vs. actual)",
     "Time to model new business scenarios",
     "Critical role gap analysis"
    ],
    "name": "Develop Workforce Scenario Planning Capability",
    "owners": [
     "Workforce Planning",
     "Finance",
     "HR"
    ],
    "priorityRank": 6,
    "rationale": "High-impact priority (s3_q8) supporting 'Business scalability' (s1_q1). Readiness is low due to heavy dependency on clean, integrated core HR data.",
    "readinessScore": 2
   },
   {
    "classification": "Strategic",
    "dependencies": [
     "INIT-001",
     "INIT-003"
    ],
    "horizon": "12-24m",
    "id": "INIT-007",
    "impactScore": 4,
    "kpis": [
     "Internal mobility rate",
     "% of projects staffed internally",
     "Employee skill profile completion rate"
    ],
    "name": "Pilot a Talent Marketplace Platform",
    "owners": [
     "Talent Management",
     "L&D",
     "IT"
    ],
    "priorityRank": 7,
    "rationale": "Addresses priority for 'Talent marketplace' (s3_q8) and driver of 'Talent experience' (s1_q1). Requires mature skills data and core HR platform.",
    "readinessScore": 2
   },
   {
    "classification": "Innovative",
    "dependencies": [
     "INIT-005"
    ],
    "horizon": "12-24m",
    "id": "INIT-008",
    "impactScore": 3,
    "kpis": [
     "% of queries deflected to chatbot",
     "Chatbot resolution rate",
     "User satisfaction with chatbot"
    ],
    "name": "Expand HR Chatbot for Tier-0 Support",
    "owners": [
     "HRSS",
     "IT"
    ],
    "priorityRank": 8,
    "rationale": "Builds on existing chatbot capability (s5_q17) and priority (s3_q8). Depends on a well-structured knowledge base from the case management system.",
    "readinessScore": 3
   },
   {
    "classification": "Innovative",
    "dependencies": [
     "INIT-001",
     "INIT-002"
    ],
    "horizon": "12-24m",
    "id": "INIT-009",
    "impactScore": 4,
    "kpis": [
     "Time-to-shortlist reduction",
     "Quality of hire from AI-sourced candidates",
     "Diversity of candidate slate"
    ],
    "name": "Pilot AI-enabled Candidate Screening",
    "owners": [
     "Talent Acquisition",
     "IT",
     "Legal"
    ],
    "priorityRank": 9,
    "rationale": "Addresses a high-innovation priority (s3_q8) and 'Time-to-hire' metric (s7_q25). Gated by data quality, integration, and ethical AI governance which must be built first.",
    "readinessScore": 2
   }
  ],
  "quickWins": [
   "INIT-004"
  ],
  "roadmap": {
   "0_6_months": [
    "INIT-001",
    "INIT-002",
    "INIT-004"
   ],
   "12_24_months": [
    "INIT-006",
    "INIT-007",
    "INIT-008",
    "INIT-009"
   ],
   "6_12_months": [
    "INIT-003",
    "INIT-005"
   ]
  },
  "scenarioPlanning": {
   "levers": [
    {
     "expectedEffects": [
      "Reduces implementation risk by 50%",
      "Increases user adoption by focusing change",
      "Extends overall timeline by 3-6 months but improves outcomes"
     ],
     "impactedInitiatives": [
      "INIT-003",
      "INIT-005",
      "INIT-006"
     ],
     "name": "Adopt a Phased Rollout vs. Big-Bang",
     "whatIf": "The DTO enforces a phased implementation, starting with foundational elements, despite the 'big-bang' preference."
    },
    {
     "expectedEffects": [
      "Readiness +2 for all strategic/innovative initiatives",
      "Accelerates timeline for Workforce Planning (INIT-006) by 6 months"
     ],
     "impactedInitiatives": [
      "INIT-001",
      "INIT-006",
      "INIT-007",
      "INIT-009"
     ],
     "name": "Accelerate Data Governance Program",
     "whatIf": "A dedicated data steward team is funded and staffed in Q1."
    },
    {
     "expectedEffects": [
      "Improves 'Mixed' change readiness (s4_q12)",
      "Increases ESS/MSS adoption by 30%",
      "Reduces post-go-live support tickets by 40%"
     ],
     "impactedInitiatives": [
      "INIT-003",
      "INIT-004",
      "INIT-005"
     ],
     "name": "Prioritize Change Management Funding",
     "whatIf": "Allocate 15-20% of the project budget specifically to change management and communications."
    },
    {
     "expectedEffects": [
      "De-risks AI pilot (INIT-009)",
      "Improves stakeholder trust and buy-in",
      "Readiness +1 for INIT-009"
     ],
     "impactedInitiatives": [
      "INIT-009",
      "INIT-008"
     ],
     "name": "Establish an 'Ethical AI' Steering Committee",
     "whatIf": "A cross-functional team (HR, Legal, IT, D&I) is formed to create guardrails for AI use in hiring."
    }
   ],
   "sensitivityNotes": [
    "The entire strategic and innovative layer of the roadmap (Workforce Planning, Talent Marketplace, AI) is highly sensitive to the successful and timely completion of foundational initiatives INIT-001, INIT-002, and INIT-003.",
    "The success of ESS/MSS and other employee-facing tools is highly sensitive to the organization's ability to manage change effectively, moving from 'Mixed' to 'High' readiness.",
    "The 'Big-bang' preference, if enforced, poses the single largest risk to the entire transformation, potentially leading to failure in adoption and ROI realization."
   ]
  },
  "toolsAndVendors": {
   "categories": [
    {
     "advisoryModels": [
      "Implementation partner selection",
      "Process redesign for EC/Onboarding",
      "Change management & adoption"
     ],
     "area": "Core HRMS / Onboarding",
     "fitNotes": "Leverages existing investment in SAP SuccessFactors. Implementing the core modules is the most critical foundational step to create a data backbone.",
     "recommended": [
      "SAP SuccessFactors (Employee Central, Onboarding 2.0)"
     ]
    },
    {
     "advisoryModels": [
      "Integration architecture design",
      "Vendor selection (RFP)",
      "Center for Enablement (C4E) setup"
     ],
     "area": "Integration / iPaaS",
     "fitNotes": "Crucial for resolving 'siloed data pools' (s5_q15). SAP's native tool offers tight coupling, while others provide broader non-SAP connectivity.",
     "recommended": [
      "SAP Integration Suite (CPI)",
      "MuleSoft",
      "Boomi"
     ]
    },
    {
     "advisoryModels": [
      "Shared services operating model design",
      "Implementation PMO",
      "Process optimization"
     ],
     "area": "HR Case Management",
     "fitNotes": "Addresses a key priority (s3_q8). These platforms provide robust workflow, knowledge management, and SLA tracking to professionalize HR service delivery.",
     "recommended": [
      "ServiceNow HRSD",
      "Salesforce for HR",
      "Zendesk"
     ]
    },
    {
     "advisoryModels": [
      "Skills taxonomy development",
      "Internal mobility process design",
      "Vendor evaluation"
     ],
     "area": "Talent Marketplace",
     "fitNotes": "Aligns with strategic priority (s3_q8). SuccessFactors provides a native option, while Gloat and Eightfold are best-of-breed leaders in the AI-powered talent intelligence space.",
     "recommended": [
      "SAP SuccessFactors Opportunity Marketplace",
      "Gloat",
      "Eightfold AI"
     ]
    }
   ]
  }
 },
 "section": "HR Digital Transformation"
}

// ---------- Loader ----------
export const loader: LoaderFunction = async ({ request, params }) => {
    return mock
};
// ---------- Small UI helpers ----------
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </section>
  );
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function ClassificationPill({ c }: { c: "Foundational" | "Tactical" | "Strategic" | "Innovative" }) {
  const cls =
    c === "Foundational"
      ? "bg-gray-100 text-gray-800"
      : c === "Tactical"
        ? "bg-blue-100 text-blue-800"
        : c === "Strategic"
          ? "bg-teal-100 text-teal-800"
          : "bg-purple-100 text-purple-800";
  // FIX: Used template literal for className string
  return <span className={`px-2 py-0.5 rounded text-xs ${cls}`}>{c}</span>;
}

function RoadmapColumn({
  title,
  ids,
  findInit
}: {
  title: string;
  ids: string[];
  findInit: (id: string) => Initiative | undefined;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="text-sm font-semibold text-gray-800 mb-2">{title}</div>
      <div className="space-y-2">
        {ids.map((id) => {
          const i = findInit(id);
          if (!i) return null;
          return (
            <div key={id} className="rounded border border-gray-200 p-3">
              <div className="font-medium text-gray-900 text-sm">{i.name}</div>
              <div className="mt-1 text-xs text-gray-600">
                {i.classification} - Owners: {i.owners.join(", ")}
              </div>
              {i.dependencies?.length > 0 && (
                <div className="mt-1 text-xs text-gray-500">Deps: {i.dependencies.join(", ")}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Lightweight SVG scatter (no external deps)
function ScatterFallback({
  points
}: {
  points: { id: string; x: number; y: number; label: string; classification: "Foundational" | "Tactical" | "Strategic" | "Innovative" }[];
}) {
  const width = 900;
  const height = 360;
  const padding = { left: 50, right: 20, top: 20, bottom: 40 };
  const xScale = (v: number) => padding.left + (v / 5) * (width - padding.left - padding.right);
  const yScale = (v: number) => height - padding.bottom - (v / 5) * (height - padding.top - padding.bottom);
  const color = (c: "Foundational" | "Tactical" | "Strategic" | "Innovative") =>
    c === "Foundational" ? "#6b7280" : c === "Tactical" ? "#2563eb" : c === "Strategic" ? "#0d9488" : "#7c3aed";

  // FIX: Corrected the ticks array. It should just be an array of numbers.
  const ticks = [0, 1, 2, 3, 4, 5];

  // FIX: The entire SVG structure was incorrectly placed. It must be in a return statement.
  return (
    <svg width={width} height={height} className="w-full">
      {/* Axes */}
      <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#e5e7eb" />
      <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#e5e7eb" />
      
      {/* X ticks */}
      {ticks.map((t) => (
        // FIX: Used template literal for the key
        <g key={`x-${t}`}>
          <line x1={xScale(t)} y1={height - padding.bottom} x2={xScale(t)} y2={height - padding.bottom + 6} stroke="#9ca3af" />
          <text x={xScale(t)} y={height - padding.bottom + 18} textAnchor="middle" fontSize="10" fill="#6b7280">
            {t}
          </text>
        </g>
      ))}

      {/* Y ticks */}
      {ticks.map((t) => (
        // FIX: Used template literal for the key
        <g key={`y-${t}`}>
          <line x1={padding.left - 6} y1={yScale(t)} x2={padding.left} y2={yScale(t)} stroke="#9ca3af" />
          <text x={padding.left - 10} y={yScale(t) + 3} textAnchor="end" fontSize="10" fill="#6b7280">
            {t}
          </text>
        </g>
      ))}

      {/* Axis labels */}
      <text x={width / 2} y={height - 8} textAnchor="middle" fontSize="11" fill="#374151">
        Readiness
      </text>
      {/* FIX: Used template literal for the transform attribute */}
      <text x={14} y={height / 2} transform={`rotate(-90 14 ${height / 2})`} textAnchor="middle" fontSize="11" fill="#374151">
        Impact
      </text>

      {/* Points */}
      {points.map((p) => (
        <g
          key={p.id}
          // FIX: Used template literal for the transform attribute
          transform={`translate(${xScale(p.x)}, ${yScale(p.y)})`}
          className="group"
        >
          <circle r={5} fill={color(p.classification)} opacity={0.9} />
          <rect x={8} y={-16} rx={3} ry={3} width={280} height={22} fill="white" stroke="#e5e7eb" className="opacity-0 group-hover:opacity-100 transition" />
          <text x={12} y={0} alignmentBaseline="middle" fontSize="11" className="opacity-0 group-hover:opacity-100 transition fill-gray-700" >
            {p.label} ({p.id})
          </text>
        </g>
      ))}
    </svg>
  );
}

// ---------- Page ----------
export default function ReportSingleFile() {
  const analysis = useLoaderData<AnalysisPayload>();
  const { result } = analysis;
  const [vendorTab, setVendorTab] = useState(0);

  const totals = useMemo(() => {
    const list = result.prioritizedInitiatives;
    const n = list.length || 1;
    const avgR = Math.round((list.reduce((s, i) => s + (i.readinessScore || 0), 0) / n) * 10) / 10;
    const avgI = Math.round((list.reduce((s, i) => s + (i.impactScore || 0), 0) / n) * 10) / 10;
    return { n: list.length, avgR, avgI };
  }, [result]);

  const findInit = (id: string) => result.prioritizedInitiatives.find((i) => i.id === id);

  // Scatter points
  const points = result.prioritizedInitiatives.map((i) => ({
    id: i.id,
    x: i.readinessScore,
    y: i.impactScore,
    label: i.name,
    classification: i.classification
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">HR Digital Transformation — Executive Report</h1>
            <p className="text-sm text-gray-500">
              Company: <span className="font-medium text-gray-700">{result.meta.companyPk}</span> - Assessment: {result.meta.assessmentSk} - Generated:{" "}
              {new Date(result.meta.generatedAt).toLocaleString()}
            </p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50">Download JSON</button>
            <button className="px-3 py-2 rounded border text-sm bg-white hover:bg-gray-50">Share</button>
            <button className="px-3 py-2 rounded text-sm bg-indigo-600 text-white hover:bg-indigo-700">Export PDF</button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-7xl px-6 py-6 space-y-8">
        {/* At-a-Glance */}
        <Section title="At-a-Glance">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatTile label="Total Initiatives" value={totals.n} />
            <StatTile label="Quick Wins" value={result.quickWins.length} />
            <StatTile label="Long-Term Bets" value={result.longTermBets.length} />
            <StatTile label="Avg Readiness" value={totals.avgR} />
            <StatTile label="Avg Impact" value={totals.avgI} />
          </div>
        </Section>

        {/* Top Priorities */}
        <Section title="Top Priorities">
          <div className="grid gap-3">
            {result.prioritizedInitiatives
              .slice()
              .sort((a, b) => a.priorityRank - b.priorityRank)
              .slice(0, 5)
              .map((i) => (
                <div
                  key={i.id}
                  className="rounded-lg border border-gray-200 bg-white p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">#{i.priorityRank}</span>
                      <h3 className="font-medium text-gray-900">{i.name}</h3>
                      <ClassificationPill c={i.classification} />
                      <span className="text-xs rounded bg-gray-100 text-gray-700 px-2 py-0.5">{i.horizon}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{i.rationale}</p>
                    <div className="mt-2 text-xs text-gray-500">KPIs: {i.kpis.join(" -  ")}</div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-sm">
                      <div className="text-gray-500">Readiness</div>
                      <div className="font-semibold">{i.readinessScore}</div>
                    </div>
                    <div className="text-sm">
                      <div className="text-gray-500">Impact</div>
                      <div className="font-semibold">{i.impactScore}</div>
                    </div>
                    <div className="hidden md:block w-px h-8 bg-gray-200" />
                    <div className="text-sm">
                      <div className="text-gray-500">Owners</div>
                      <div className="font-semibold">{i.owners.join(", ")}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Section>

        {/* Roadmap */}
        <Section title="Multi-Horizon Roadmap">
          <div className="grid md:grid-cols-3 gap-4">
            <RoadmapColumn title="0–6 months" ids={result.roadmap["0_6_months"]} findInit={findInit} />
            <RoadmapColumn title="6–12 months" ids={result.roadmap["6_12_months"]} findInit={findInit} />
            <RoadmapColumn title="12–24 months" ids={result.roadmap["12_24_months"]} findInit={findInit} />
          </div>
        </Section>

        {/* Quick Wins / Long-Term Bets */}
        <Section title="Quick Wins and Long-Term Bets">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Quick Wins</h3>
              <ul className="space-y-2">
                {result.quickWins.map((id) => {
                  const i = findInit(id);
                  if (!i) return null;
                  return (
                    <li key={id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">{i.name}</span>
                      <span className="text-xs text-gray-500">
                        R{i.readinessScore} × I{i.impactScore}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Long-Term Bets</h3>
              <ul className="space-y-2">
                {result.longTermBets.map((id) => {
                  const i = findInit(id);
                  if (!i) return null;
                  return (
                    <li key={id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-800">{i.name}</span>
                      <span className="text-xs text-gray-500">
                        R{i.readinessScore} × I{i.impactScore}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </Section>

        {/* Readiness × Impact */}
        <Section title="Readiness × Impact">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <ScatterFallback points={points} />
            <p className="text-xs text-gray-500 mt-2">
              Top-right quadrant indicates high-priority candidates.
            </p>
          </div>
        </Section>

        {/* Tools & Vendors */}
        <Section title="Tools & Vendors">
          <div className="flex flex-wrap gap-2 mb-3">
            {result.toolsAndVendors.categories.map((c, i) => (
              <button
                key={c.area}
                onClick={() => setVendorTab(i)}
                className={`px-3 py-1.5 rounded border text-sm ${i === vendorTab
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                  }`}
              >
                {c.area}
              </button>
            ))}
          </div>
          {result.toolsAndVendors.categories[vendorTab] && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="text-sm text-gray-500">Area</div>
              <div className="text-lg font-semibold text-gray-900">
                {result.toolsAndVendors.categories[vendorTab].area}
              </div>
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-800">Recommended Vendors</div>
                <ul className="mt-1 text-sm text-gray-700 list-disc pl-5">
                  {result.toolsAndVendors.categories[vendorTab].recommended.map((v) => (
                    <li key={v}>{v}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-800">Fit Notes</div>
                <p className="text-sm text-gray-700">
                  {result.toolsAndVendors.categories[vendorTab].fitNotes}
                </p>
              </div>
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-800">Advisory Models</div>
                <ul className="mt-1 text-sm text-gray-700 list-disc pl-5">
                  {result.toolsAndVendors.categories[vendorTab].advisoryModels.map((m) => (
                    <li key={m}>{m}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </Section>

        {/* Scenario Planning */}
        <Section title="Scenario Planning">
          <div className="grid md:grid-cols-2 gap-4">
            {result.scenarioPlanning.levers.map((l) => (
              <div key={l.name} className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="text-sm text-gray-500">Lever</div>
                <div className="text-lg font-semibold text-gray-900">{l.name}</div>
                <div className="mt-2 text-sm">
                  <div className="text-gray-500">What if</div>
                  <div className="text-gray-800">{l.whatIf}</div>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-gray-500">Expected Effects</div>
                  <ul className="list-disc pl-5 text-gray-800">
                    {l.expectedEffects.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 text-sm">
                  <div className="text-gray-500">Impacted Initiatives</div>
                  <div className="text-gray-800">{l.impactedInitiatives.join(", ")}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm font-semibold text-amber-900 mb-1">Sensitivity Notes</div>
            <ul className="list-disc pl-5 text-sm text-amber-900">
              {result.scenarioPlanning.sensitivityNotes.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        </Section>

        {/* Assumptions & Risks */}
        <Section title="Assumptions & Risks">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <ul className="list-disc pl-5 text-sm text-red-900">
              {result.meta.assumptionsAndRisks.map((r, idx) => (
                <li key={idx}>{r}</li>
              ))}
            </ul>
          </div>
        </Section>

        <footer className="pt-4 text-xs text-gray-500">
          HR Digital Transformation Report — {new Date().getFullYear()}
        </footer>
      </main>
    </div>

  );
}