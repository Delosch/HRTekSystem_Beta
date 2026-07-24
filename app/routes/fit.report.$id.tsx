// fit/report/HCM Vendor Fit Engine
import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { AlertTriangle, ArrowLeft, Clock, Sparkles } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Scatter, ScatterChart, Tooltip, Treemap, XAxis, YAxis, ZAxis } from "recharts";
import { useMemo } from "react";

import VendorFitReportDashboard from "~/components/reports/VendorFitReportDashboard";
import { getEnginePriceByName } from "~/lib/pricing";
import { requireUserSession } from "~/lib/session.server";
import { addOrUpdateCartItem } from "~/models/cart.model.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { getCompanyPayments } from "~/models/payment.model.server";
import { getLatestAnalysis } from "~/utils/analysis.server";
import { resolveReportClientIdentity } from "~/utils/reportClientIdentity";

// --- Data Types ---
type HcmAnalysis = {
  profile: { organizationName: string | null; industry: string | null; employeeBand: string | null; geoPresence: string[] | null; };
  answers: { byQuestionId: Record<string, unknown>; completeness: { answered: number; total: number; percent: number; }; };
  scores: { satisfaction: number; painIndex: number; integrationComplexity: number; decisionAgility: number; changeReadiness: number; fitScore: number; fitBand: "Excellent vendor readiness" | "Moderate – some alignment gaps" | "Needs alignment before vendor search"; };
  fitVector: { modules: string[] | null; goalsWeighted: Record<string, number>; deployment: "saas" | "on_prem" | "hybrid" | null; budgetBand: "under_10k" | "10k_50k" | "50k_100k" | "100k_plus" | null; complianceNeeded: boolean; costSensitivity: "cost_sensitive" | "value_focused" | null; globalization: "local" | "multi_country" | "global" | null; scaleTier: "small" | "mid" | "upper_mid" | "enterprise" | "large_enterprise" | null; growthPercent: number | null; };
  diagnostics: { missingOrInvalid: string[]; riskLevel: "high" | "medium" | "low"; riskReasons: string[]; recommendations: string[]; };
  viz: {
    executiveRadar: { Satisfaction: number; BusinessPriority: number; IntegrationNeeds: number; BudgetReadiness: number; FitScore: number; };
    demographics: { industry: string | null; employeeBand: string | null; geoPresence: string[] | null; };
    landscape: { modulesCount: number; satisfaction: number; challengesCount: number; urgencyScore: number; };
    priorityFit: { goalsWeighted: Record<string, number>; deployment: "saas" | "on_prem" | "hybrid" | null; budgetBand: "under_10k" | "10k_50k" | "50k_100k" | "100k_plus" | null; };
    integrationScalability: { integrationsCount: number; growthPercent: number | null; integrationComplexity: number; };
    decisionAgility: { teamSizeLabel: string | null; vendorSelectionLabel: string | null; implementationStartLabel: string | null; decisionAgility: number; };
    tags: string[];
    recommendationsTable: Array<{ category: "SaaS Starter" | "Modular HCM Suite" | "Enterprise Transformation"; fitScore: number; reasons: string[]; riskFlags: string[]; }>;
  };
};

type VendorFitLoaderData = {
  analysis?: HcmAnalysis;
  companyName?: string;
  companyLogo?: string | null;
  paymentStatus?: string;
};

// --- Remix Action Function ---
export const action: ActionFunction = async ({ request, params }) => {
  const user = await requireUserSession(request);

  if (!user || !user.organisationId) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const engineId = params.id;

  if (body.intent === "generate_report") {
    console.log(`[Fit Report Action] Generating report for: ${engineId}`);

    const aggregatedData = {
      companyId: user.organisationId,
      timestamp: new Date().toISOString(),
      engines: {
        vendorFit: { engineName: engineId, progress: 100, responses: body.answers || {}, scores: {}, aiAnalysis: {} },
      },
      completedEnginesCount: 1,
      totalEngines: 1,
    };

    try {
      const { generateHTIAdvisory } = await import("~/lib/hti.deepseek");
      const { saveAdvisoryReport } = await import("~/models/hti.model.server");

      const advisory = await generateHTIAdvisory(aggregatedData as any);
      await saveAdvisoryReport(user.organisationId, user.userId, advisory, aggregatedData as any);

      return json({ success: true, advisory });
    } catch (error) {
      console.error("AI Generation Error in Fit Report:", error);
      return json({ error: "Failed to generate AI report" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};

// --- Remix Loader Function ---
export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const user = await requireUserSession(request);

    if (!user || !user.organisationId) {
      return redirect("/auth");
    }

    const engineId = params.id;

    if (!engineId) {
      throw new Response("Assessment ID is missing.", { status: 404 });
    }

    // Check payment status.
    const allPayments = await getCompanyPayments(user.organisationId);
    const isAdmin = (user as any).role === "ADMIN";

    // Check whether this is a free onboarding assessment.
    const engineName = engineId.trim();
    const isFreeEngine = engineName === "Profiling Assessment";

    // Payment is currently forced to true by the existing workflow.
    const isPaid = true;

    const isPending = !isPaid && !isFreeEngine && allPayments.some((payment: any) =>
      payment.status === "payment_submitted" && payment.items?.some((item: any) => item.engineName.trim() === engineId.trim())
    );

    if (!isPaid && !isAdmin) {
      if (isPending) {
        return json({ paymentStatus: "pending" });
      }

      const price = getEnginePriceByName(engineId);
      await addOrUpdateCartItem({ companyId: user.organisationId, productName: engineId, price, userId: user.userId });

      return redirect("/payment/checkout");
    }

    if (engineId.toLowerCase() === "hcm vendor fit engine") {
      const data = await getLatestAnalysis(user.organisationId, engineId);
      const isReportReady = Boolean(data && data.result);
      const requestUrl = new URL(request.url);

      if (requestUrl.searchParams.get("verify") === "true") {
        return new Response(null, { status: isReportReady ? 200 : 202 });
      }

      if (!data || !data.result) {
        console.log("No Vendor Fit report data found.");
        throw new Response("No assessment data found for this organization.", { status: 404 });
      }

      const companyProfile = await getCompanyProfile(user.organisationId);
      const { companyName, logoUrl: companyLogo } = resolveReportClientIdentity(companyProfile);

      // Safety normalization to prevent UI crashes when AI data is sparse.
      const rawResult = data.result || {};

      const analysis: HcmAnalysis = {
        ...rawResult,
        profile: {
          organizationName: companyName,
          industry: rawResult.profile?.industry || "Not Specified",
          employeeBand: rawResult.profile?.employeeBand || "Not Specified",
          geoPresence: rawResult.profile?.geoPresence || [],
        },
        scores: rawResult.scores || {
          satisfaction: 0,
          painIndex: 0,
          integrationComplexity: 0,
          decisionAgility: 0,
          changeReadiness: 0,
          fitScore: 0,
          fitBand: "Moderate – some alignment gaps",
        },
        viz: {
          executiveRadar: rawResult.viz?.executiveRadar || { Satisfaction: 0, BusinessPriority: 0, IntegrationNeeds: 0, BudgetReadiness: 0, FitScore: 0 },
          demographics: rawResult.viz?.demographics || { industry: null, employeeBand: null, geoPresence: [] },
          landscape: rawResult.viz?.landscape || { modulesCount: 0, satisfaction: 0, challengesCount: 0, urgencyScore: 0 },
          priorityFit: rawResult.viz?.priorityFit || { goalsWeighted: {}, deployment: null, budgetBand: null },
          integrationScalability: rawResult.viz?.integrationScalability || { integrationsCount: 0, growthPercent: 0, integrationComplexity: 0 },
          decisionAgility: rawResult.viz?.decisionAgility || { teamSizeLabel: null, vendorSelectionLabel: null, implementationStartLabel: null, decisionAgility: 0 },
          tags: rawResult.viz?.tags || [],
          recommendationsTable: rawResult.viz?.recommendationsTable || [],
        },
        fitVector: rawResult.fitVector || { modules: [], goalsWeighted: {}, deployment: null, budgetBand: null, complianceNeeded: false, costSensitivity: null, globalization: null, scaleTier: null, growthPercent: null },
        diagnostics: rawResult.diagnostics || { missingOrInvalid: [], riskLevel: "medium", riskReasons: [], recommendations: [] },
        answers: rawResult.answers || { byQuestionId: {}, completeness: { answered: 0, total: 0, percent: 0 } },
      };

      return json({ analysis, companyName, companyLogo });
    }

    throw new Response("The requested assessment was not found.", { status: 404 });
  } catch (error) {
    console.error("An error occurred in the report loader:", error);

    if (error instanceof Response) {
      throw error;
    }

    throw new Response("An unexpected error occurred while generating the report.", { status: 500 });
  }
};

export default function VendorFitReport() {
  const loaderData = useLoaderData<VendorFitLoaderData>();

  if (loaderData.paymentStatus === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 font-sans">
        <div className="max-w-lg rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-2xl">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-yellow-50">
            <Clock className="h-10 w-10 text-yellow-600" />
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Payment Verification Pending</h1>
          <p className="mb-8 text-lg leading-relaxed text-gray-500">
            Your payment has been submitted and is currently being verified by our administrators. This usually takes less than 24 hours. You will be notified once the report is unlocked.
          </p>
          <a href="/reports" className="inline-flex items-center gap-2 font-semibold text-blue-600 transition-colors hover:text-blue-700">
            <ArrowLeft className="h-5 w-5" /> Return to My Reports
          </a>
        </div>
      </div>
    );
  }

  const analysis = loaderData.analysis;
  if (!analysis) return null;

  /*
   * The loader resolves this value through
   * resolveReportClientIdentity(), so it cannot
   * be a UUID, a COMPANY# key, or an empty string.
   */
  const companyName = loaderData.companyName ?? "Confidential Client";

  // Map the analysis object to the structure expected by the premium dashboard.
  const dashboardData = {
    ...analysis,
    brandName: companyName,
    businessPriorityFit: {
      goals: Object.entries(analysis.viz.priorityFit.goalsWeighted || {}).map(([name, weight]) => ({
        name: name.replace(/_/g, " "),
        score: Math.round(weight * 100),
        priority: weight > 0.8 ? "Critical" : weight > 0.5 ? "High" : "Medium",
      })),
    },
    currentHCMLandscape: analysis.viz.landscape,
    decisionMakingAgility: {
      ...analysis.viz.decisionAgility,
      decisionTeamSize: analysis.viz.decisionAgility.teamSizeLabel,
      selectionTimeline: analysis.viz.decisionAgility.vendorSelectionLabel,
      implementationStart: analysis.viz.decisionAgility.implementationStartLabel,
      agilityScore: analysis.viz.decisionAgility.decisionAgility,
    },
    keyProfileTags: analysis.viz.tags,
    vendorRecommendations: analysis.viz.recommendationsTable,
    executiveRadarData: [
      { axis: "Satisfaction", value: analysis.viz.executiveRadar.Satisfaction },
      { axis: "Priority", value: analysis.viz.executiveRadar.BusinessPriority },
      { axis: "Integration", value: analysis.viz.executiveRadar.IntegrationNeeds },
      { axis: "Budget", value: analysis.viz.executiveRadar.BudgetReadiness },
      { axis: "Score", value: analysis.viz.executiveRadar.FitScore },
    ],
    organizationDemographics: {
      industry: analysis.profile.industry,
      employeeCount: analysis.profile.employeeBand,
      geographicalPresence: analysis.profile.geoPresence?.join(", "),
      globalization: analysis.fitVector.globalization,
    },
    diagnostics: {
      missingData: (analysis.diagnostics.missingOrInvalid || []).map((item) => ({ item, found: false })),
    },
    integrationScalability: [
      {
        complexity: analysis.viz.integrationScalability.integrationComplexity,
        scalability: 100 - analysis.viz.integrationScalability.integrationComplexity * 10,
      },
    ],
  };

  return <VendorFitReportDashboard data={dashboardData} brandName={companyName} />;
}

/* --- Sub-components for UI --- */

// A styled header for the report.
function HeaderSection({ analysis }: { analysis: HcmAnalysis }) {
  const getStatusChipClass = (type: "fit" | "risk") => {
    const base = "rounded-full px-3 py-1 text-xs font-medium";

    if (type === "fit") {
      switch (analysis.scores.fitBand) {
        case "Excellent vendor readiness": return `${base} bg-green-100 text-green-800`;
        case "Moderate – some alignment gaps": return `${base} bg-yellow-100 text-yellow-800`;
        default: return `${base} bg-red-100 text-red-800`;
      }
    }

    if (type === "risk") {
      switch (analysis.diagnostics.riskLevel) {
        case "low": return `${base} bg-green-100 text-green-800`;
        case "medium": return `${base} bg-yellow-100 text-yellow-800`;
        default: return `${base} bg-red-100 text-red-800`;
      }
    }

    return `${base} bg-gray-100 text-gray-800`;
  };

  return (
    <div className="border-b border-gray-200 pb-5">
      <h1 className="text-3xl font-bold text-gray-900">HCM Vendor Fit Report</h1>
      <p className="mt-1 text-lg text-gray-600">{analysis.profile.organizationName}</p>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Fit Score:</span>
          <span className="font-bold text-gray-800">{analysis.scores.fitScore.toFixed(1)}/100</span>
          <span className={getStatusChipClass("fit")}>{analysis.scores.fitBand}</span>

          {analysis.scores.fitScore === 0 && (
            <a
              href={`/intermediate?promptId=vendor_fit&engine=${encodeURIComponent("HCM Vendor Fit Engine")}&force=true`}
              className="ml-2 inline-flex items-center gap-1 rounded bg-blue-600 px-2 py-1 text-xs font-bold text-white shadow-sm transition-all hover:bg-blue-700"
              title="Click to re-run AI analysis if data looks missing"
            >
              <Sparkles className="h-3 w-3" /> Regenerate Analysis
            </a>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold">Risk Level:</span>
          <span className={`${getStatusChipClass("risk")} capitalize`}>{analysis.diagnostics.riskLevel}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-semibold">Completeness:</span>
          <span className="font-bold text-gray-800">{analysis.answers.completeness.percent}%</span>
        </div>
      </div>
    </div>
  );
}

// A generic card component for widgets.
function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string; }) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md ${className}`}>
      <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  );
}

// Styled Key Performance Indicators.
function Kpis({ items }: { items: { label: string; value: string | number; }[]; }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 border-t border-gray-200 pt-4 md:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="text-center">
          <div className="text-sm text-gray-500">{item.label}</div>
          <div className="text-xl font-semibold text-gray-800">{item.value}</div>
        </div>
      ))}
    </div>
  );
}

// Styled demographics display.
function Demographics({ analysis }: { analysis: HcmAnalysis }) {
  return (
    <div className="space-y-4">
      <InlineStat label="Industry" value={analysis.viz.demographics.industry ?? "—"} />
      <InlineStat label="Employee Band" value={analysis.viz.demographics.employeeBand ?? "—"} />
      <InlineStat label="Geographical Presence" value={analysis.viz.demographics.geoPresence?.join(", ") || "—"} />
      <InlineStat label="Globalization" value={labelizeGlobalization(analysis.fitVector.globalization)} />
    </div>
  );
}

// A single statistic line item.
function InlineStat({ label, value, isScore = false }: { label: string; value: string | number; isScore?: boolean; }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 py-2">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-base font-semibold ${isScore ? "text-blue-600" : "text-gray-800"}`}>{value}</div>
    </div>
  );
}

// Styled list of tags.
function TagList({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) {
    return <p className="text-sm text-gray-500">No tags available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 12).map((tag) => (
        <span key={tag} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium capitalize text-blue-700">
          {tag.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}

// Styled diagnostics section.
function Diagnostics({ analysis }: { analysis: HcmAnalysis }) {
  return (
    <div className="space-y-4">
      {analysis.diagnostics.riskReasons.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-semibold text-gray-700">Risk Reasons</h3>
          <ul className="space-y-1">
            {analysis.diagnostics.riskReasons.map((reason, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <AlertTriangleIcon className="mr-2 mt-0.5 h-4 w-4 text-yellow-500" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {analysis.diagnostics.missingOrInvalid.length > 0 && (
        <div>
          <h3 className="mb-1 text-sm font-semibold text-gray-700">Missing or Invalid Data</h3>
          <ul className="space-y-1">
            {analysis.diagnostics.missingOrInvalid.map((item, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <InfoIcon className="mr-2 mt-0.5 h-4 w-4 text-gray-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Styled recommendations table.
function RecommendationsTable({ rows }: { rows: HcmAnalysis["viz"]["recommendationsTable"]; }) {
  if (!rows || rows.length === 0) {
    return <p className="text-sm text-gray-500">No category recommendations available.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Category</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Fit Score</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Key Reasons</th>
            <th className="px-4 py-2 text-left font-semibold text-gray-600">Potential Flags</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {rows.map((row, index) => (
            <tr key={index}>
              <td className="px-4 py-3 font-medium text-gray-800">{row.category}</td>
              <td className="px-4 py-3">
                <span className="text-lg font-bold text-blue-600">{Math.round(row.fitScore)}</span>
                <span className="text-gray-500">/100</span>
              </td>
              <td className="px-4 py-3 text-gray-600">
                <ul className="list-disc space-y-1 pl-4">
                  {row.reasons.slice(0, 3).map((reason, reasonIndex) => (
                    <li key={reasonIndex}>{reason}</li>
                  ))}
                </ul>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {row.riskFlags.length > 0 ? (
                    row.riskFlags.map((flag, flagIndex) => (
                      <span key={flagIndex} className="rounded bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                        {flag}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">None</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* --- Chart Customization & Helpers --- */

// A custom tooltip for all charts.
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white p-3 shadow-lg">
        <p className="font-bold text-gray-800">{label || payload[0].name || "Data Point"}</p>
        {payload.map((item: any, index: number) => (
          <p key={index} style={{ color: item.color || item.fill }}>
            {`${item.name}: ${item.value.toFixed(1)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom Treemap content.
const CustomizedTreemapContent = ({ depth, x, y, width, height, index, colors, name }: any) => (
  <g>
    <rect
      x={x}
      y={y}
      width={width}
      height={height}
      style={{
        fill: colors[index % colors.length],
        stroke: "#fff",
        strokeWidth: 2 / (depth + 1e-10),
        strokeOpacity: 1 / (depth + 1e-10),
      }}
    />
    {width > 80 && height > 25 ? (
      <text x={x + width / 2} y={y + height / 2 + 7} textAnchor="middle" fill="#fff" fontSize={14}>
        {name}
      </text>
    ) : null}
  </g>
);

// Label formatting helpers.
function labelizeDeployment(deployment: HcmAnalysis["fitVector"]["deployment"]) {
  const labels = { saas: "Cloud-based (SaaS)", on_prem: "On-premise", hybrid: "Hybrid" };
  return deployment ? labels[deployment] : "—";
}

function labelizeBudget(budget: HcmAnalysis["fitVector"]["budgetBand"]) {
  const labels = {
    under_10k: "Under ₹10 Lakhs/year",
    "10k_50k": "₹10L – ₹50L/year",
    "50k_100k": "₹50L – ₹1Cr/year",
    "100k_plus": "₹1 Crore+ / Custom",
  };
  return budget ? labels[budget] : "—";
}

function labelizeGlobalization(globalization: HcmAnalysis["fitVector"]["globalization"]) {
  const labels = { global: "Global", multi_country: "Multiple Countries", local: "Local / Single Country" };
  return globalization ? labels[globalization] : "—";
}

/* --- Icons --- */
const CheckIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const AlertTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
  </svg>
);

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);