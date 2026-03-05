//fit/report/HCM Vendor Fit Engine
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { getEnginePriceByName } from "~/lib/pricing";
import { addOrUpdateCartItem } from "~/models/cart.model.server";
import { useLoaderData } from "@remix-run/react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  Treemap, ScatterChart, Scatter, ZAxis, Cell
} from "recharts";
import { useMemo } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getLatestAnalysis } from "~/utils/analysis.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { getVerifiedPaymentsByCompany, getCompanyPayments } from "~/models/payment.model.server";
import { Clock, AlertTriangle, CheckCircle, ArrowLeft, Sparkles, FileText } from "lucide-react";
import VendorFitReportDashboard from "~/components/reports/VendorFitReportDashboard";

// --- Data Types ---
type HcmAnalysis = {
  profile: {
    organizationName: string | null;
    industry: string | null;
    employeeBand: string | null;
    geoPresence: string[] | null;
  };
  answers: {
    byQuestionId: Record<string, unknown>;
    completeness: { answered: number; total: number; percent: number };
  };
  scores: {
    satisfaction: number;
    painIndex: number;
    integrationComplexity: number;
    decisionAgility: number;
    changeReadiness: number;
    fitScore: number;
    fitBand: "Excellent vendor readiness" | "Moderate – some alignment gaps" | "Needs alignment before vendor search";
  };
  fitVector: {
    modules: string[] | null;
    goalsWeighted: Record<string, number>;
    deployment: "saas" | "on_prem" | "hybrid" | null;
    budgetBand: "under_10k" | "10k_50k" | "50k_100k" | "100k_plus" | null;
    complianceNeeded: boolean;
    costSensitivity: "cost_sensitive" | "value_focused" | null;
    globalization: "local" | "multi_country" | "global" | null;
    scaleTier: "small" | "mid" | "upper_mid" | "enterprise" | "large_enterprise" | null;
    growthPercent: number | null;
  };
  diagnostics: {
    missingOrInvalid: string[];
    riskLevel: "high" | "medium" | "low";
    riskReasons: string[];
    recommendations: string[];
  };
  viz: {
    executiveRadar: {
      Satisfaction: number;
      BusinessPriority: number;
      IntegrationNeeds: number;
      BudgetReadiness: number;
      FitScore: number;
    };
    demographics: {
      industry: string | null;
      employeeBand: string | null;
      geoPresence: string[] | null;
    };
    landscape: {
      modulesCount: number;
      satisfaction: number;
      challengesCount: number;
      urgencyScore: number;
    };
    priorityFit: {
      goalsWeighted: Record<string, number>;
      deployment: "saas" | "on_prem" | "hybrid" | null;
      budgetBand: "under_10k" | "10k_50k" | "50k_100k" | "100k_plus" | null;
    };
    integrationScalability: {
      integrationsCount: number;
      growthPercent: number | null;
      integrationComplexity: number;
    };
    decisionAgility: {
      teamSizeLabel: string | null;
      vendorSelectionLabel: string | null;
      implementationStartLabel: string | null;
      decisionAgility: number;
    };
    tags: string[];
    recommendationsTable: Array<{
      category: "SaaS Starter" | "Modular HCM Suite" | "Enterprise Transformation";
      fitScore: number;
      reasons: string[];
      riskFlags: string[];
    }>;
  };
};

// --- Remix Loader Function ---
export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const user = await requireUserSession(request);
    if (!user || !user.organisationId) {
      return redirect('/auth');
    }

    const engineId = params.id;
    if (!engineId) {
      throw new Response("Assessment ID is missing.", { status: 404 });
    }

    // Check payment status
    const allPayments = await getCompanyPayments(user.organisationId);
    const isAdmin = (user as any).role === "ADMIN";

    // Check if this is a free assessment (onboarding)
    const engineName = engineId.trim();
    const isFreeEngine = engineName === "Profiling Assessment" ||
      engineName === "Digital Maturity Assessment" ||
      engineName === "HR Technology Maturity Analysis" ||
      engineName === "HR Tech Maturity Analysis";

    // Check if any payment record for this engine is verified
    const isPaid = isAdmin || isFreeEngine || allPayments.some((p: any) =>
      p.status === "payment_verified" &&
      p.items?.some((i: any) => i.engineName.trim() === engineId.trim())
    );

    // Check if any payment record for this engine is pending (submitted but not verified)
    const isPending = !isPaid && !isFreeEngine && allPayments.some((p: any) =>
      p.status === "payment_submitted" &&
      p.items?.some((i: any) => i.engineName.trim() === engineId.trim())
    );

    if (!isPaid && !isAdmin) {
      if (isPending) {
        return json({ paymentStatus: "pending" });
      }

      const price = getEnginePriceByName(engineId);
      await addOrUpdateCartItem({
        companyId: user.organisationId,
        productName: engineId,
        price: price,
        userId: user.userId,
      });
      return redirect('/payment/checkout');
    }

    if (engineId.toLowerCase() === "hcm vendor fit engine") {
      const data = await getLatestAnalysis(user.organisationId, engineId);
      if (!data || !data.result) {
        console.log("no report")
        throw new Response("No assessment data found for this organization.", { status: 404 });
      }

      const companyInfo = await getCompanyProfile(user.organisationId);
      const brandName = companyInfo?.brand_name || companyInfo?.company_name || "Your Company";

      // Safety normalization to prevent UI crashes if AI data is sparse
      const rawResult = data.result || {};
      const analysis: HcmAnalysis = {
        ...rawResult,
        profile: {
          organizationName: brandName,
          industry: rawResult.profile?.industry || "Not Specified",
          employeeBand: rawResult.profile?.employeeBand || "Not Specified",
          geoPresence: rawResult.profile?.geoPresence || []
        },
        scores: rawResult.scores || {
          satisfaction: 0, painIndex: 0, integrationComplexity: 0,
          decisionAgility: 0, changeReadiness: 0, fitScore: 0,
          fitBand: "Moderate – some alignment gaps"
        },
        viz: {


          executiveRadar: rawResult.viz?.executiveRadar || { Satisfaction: 0, BusinessPriority: 0, IntegrationNeeds: 0, BudgetReadiness: 0, FitScore: 0 },
          demographics: rawResult.viz?.demographics || { industry: null, employeeBand: null, geoPresence: [] },
          landscape: rawResult.viz?.landscape || { modulesCount: 0, satisfaction: 0, challengesCount: 0, urgencyScore: 0 },
          priorityFit: rawResult.viz?.priorityFit || { goalsWeighted: {}, deployment: null, budgetBand: null },
          integrationScalability: rawResult.viz?.integrationScalability || { integrationsCount: 0, growthPercent: 0, integrationComplexity: 0 },
          decisionAgility: rawResult.viz?.decisionAgility || { teamSizeLabel: null, vendorSelectionLabel: null, implementationStartLabel: null, decisionAgility: 0 },
          tags: rawResult.viz?.tags || [],
          recommendationsTable: rawResult.viz?.recommendationsTable || []
        },
        fitVector: rawResult.fitVector || { modules: [], goalsWeighted: {}, deployment: null, budgetBand: null, globalization: null },
        diagnostics: rawResult.diagnostics || { missingOrInvalid: [], riskLevel: "medium", riskReasons: [], recommendations: [] },
        answers: rawResult.answers || { completeness: { percent: 0 } }
      };

      return json({ analysis, companyLogo: companyInfo?.logo_url });
    }

    throw new Response("The requested assessment was not found.", { status: 404 });

  } catch (e) {
    console.error("An error occurred in the report loader:", e);
    // Depending on the error type, you might want to return different responses
    if (e instanceof Response) throw e;
    throw new Response("An unexpected error occurred while generating the report.", { status: 500 });
  }
};

export default function VendorFitReport() {
  const loaderData = useLoaderData<{ analysis?: HcmAnalysis; paymentStatus?: string }>();

  if (loaderData.paymentStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-lg text-center border border-gray-100">
          <div className="w-20 h-20 bg-yellow-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Verification Pending</h1>
          <p className="text-gray-500 mb-8 text-lg leading-relaxed">
            Your payment has been submitted and is currently being verified by our administrators.
            This usually takes less than 24 hours. You will be notified once the report is unlocked.
          </p>
          <a href="/reports" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            <ArrowLeft className="w-5 h-5" />
            Return to My Reports
          </a>
        </div>
      </div>
    );
  }

  const analysis = loaderData.analysis;
  if (!analysis) return null;

  // Map the analysis object to the structure expected by the premium dashboard
  const dashboardData = {
    ...analysis,
    brandName: analysis.profile.organizationName,
    businessPriorityFit: {
      goals: Object.entries(analysis.viz.priorityFit.goalsWeighted || {}).map(([name, weight]) => ({
        name: name.replace(/_/g, ' '),
        score: Math.round(weight * 100),
        priority: weight > 0.8 ? "Critical" : weight > 0.5 ? "High" : "Medium"
      }))
    },
    currentHCMLandscape: analysis.viz.landscape,
    decisionMakingAgility: {
      ...analysis.viz.decisionAgility,
      decisionTeamSize: analysis.viz.decisionAgility.teamSizeLabel,
      selectionTimeline: analysis.viz.decisionAgility.vendorSelectionLabel,
      implementationStart: analysis.viz.decisionAgility.implementationStartLabel,
      agilityScore: analysis.viz.decisionAgility.decisionAgility
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
      globalization: analysis.fitVector.globalization
    },
    diagnostics: {
      missingData: (analysis.diagnostics.missingOrInvalid || []).map(m => ({ item: m, found: false }))
    },
    integrationScalability: [
      { complexity: analysis.viz.integrationScalability.integrationComplexity, scalability: 100 - (analysis.viz.integrationScalability.integrationComplexity * 10) }
    ]
  };

  return <VendorFitReportDashboard data={dashboardData} brandName={analysis.profile.organizationName || "Your Company"} />;
}

/* --- Sub-components for UI --- */

// A styled header for the report
function HeaderSection({ analysis }: { analysis: HcmAnalysis }) {
  const getStatusChipClass = (type: 'fit' | 'risk') => {
    let base = "rounded-full px-3 py-1 text-xs font-medium";
    if (type === 'fit') {
      switch (analysis.scores.fitBand) {
        case "Excellent vendor readiness": return `${base} bg-green-100 text-green-800`;
        case "Moderate – some alignment gaps": return `${base} bg-yellow-100 text-yellow-800`;
        default: return `${base} bg-red-100 text-red-800`;
      }
    }
    if (type === 'risk') {
      switch (analysis.diagnostics.riskLevel) {
        case "low": return `${base} bg-green-100 text-green-800`;
        case "medium": return `${base} bg-yellow-100 text-yellow-800`;
        default: return `${base} bg-red-100 text-red-800`;
      }
    }
    return `${base} bg-gray-100 text-gray-800`;
  }

  return (
    <div className="border-b border-gray-200 pb-5">
      <h1 className="text-3xl font-bold text-gray-900">
        HCM Vendor Fit Report
      </h1>
      <p className="mt-1 text-lg text-gray-600">{analysis.profile.organizationName}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold">Fit Score:</span>
          <span className="font-bold text-gray-800">{analysis.scores.fitScore.toFixed(1)}/100</span>
          <span className={getStatusChipClass('fit')}>{analysis.scores.fitBand}</span>

          {analysis.scores.fitScore === 0 && (
            <a
              href={`/intermediate?promptId=vendor_fit&engine=${encodeURIComponent("HCM Vendor Fit Engine")}&force=true`}
              className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm transition-all"
              title="Click to re-run AI analysis if data looks missing"
            >
              <Sparkles className="w-3 h-3" />
              Regenerate Analysis
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Risk Level:</span>
          <span className={`${getStatusChipClass('risk')} capitalize`}>{analysis.diagnostics.riskLevel}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-semibold">Completeness:</span>
          <span className="font-bold text-gray-800">{analysis.answers.completeness.percent}%</span>
        </div>
      </div>
    </div>
  );
}

// A generic card component for widgets
function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 ${className}`}>
      <div className="border-b border-gray-200 px-4 py-3 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
      </div>
      <div className="p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}

// Styled Key Performance Indicators
function Kpis({ items }: { items: { label: string; value: string | number }[] }) {
  return (
    <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4 border-t border-gray-200 pt-4">
      {items.map((it) => (
        <div key={it.label} className="text-center">
          <div className="text-sm text-gray-500">{it.label}</div>
          <div className="text-xl font-semibold text-gray-800">{it.value}</div>
        </div>
      ))}
    </div>
  );
}

// Styled Demographics display
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

// A single statistic line item
function InlineStat({ label, value, isScore = false }: { label: string; value: string | number, isScore?: boolean }) {
  return (
    <div className="flex justify-between items-center border-b border-gray-100 py-2">
      <div className="text-sm text-gray-600">{label}</div>
      <div className={`text-base font-semibold ${isScore ? 'text-blue-600' : 'text-gray-800'}`}>{value}</div>
    </div>
  );
}

// Styled list of tags
function TagList({ tags }: { tags: string[] }) {
  if (!tags || tags.length === 0) return <p className="text-sm text-gray-500">No tags available.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {tags.slice(0, 12).map((t) => (
        <span key={t} className="rounded-full bg-blue-50 text-blue-700 px-3 py-1 text-xs font-medium capitalize">
          {t.replace(/_/g, " ")}
        </span>
      ))}
    </div>
  );
}

// Styled diagnostics section
function Diagnostics({ analysis }: { analysis: HcmAnalysis }) {
  return (
    <div className="space-y-4">
      {analysis.diagnostics.riskReasons.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Risk Reasons</h3>
          <ul className="space-y-1">
            {analysis.diagnostics.riskReasons.map((r, i) => (
              <li key={i} className="flex items-start text-sm text-gray-600">
                <AlertTriangleIcon className="w-4 h-4 mr-2 mt-0.5 text-yellow-500" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {analysis.diagnostics.missingOrInvalid.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Missing or Invalid Data</h3>
          <ul className="space-y-1">
            {analysis.diagnostics.missingOrInvalid.map((m, i) => (
              <li key={i} className="flex items-start text-sm text-gray-600">
                <InfoIcon className="w-4 h-4 mr-2 mt-0.5 text-gray-400" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// Styled recommendations table
function RecommendationsTable({ rows }: { rows: HcmAnalysis["viz"]["recommendationsTable"] }) {
  if (!rows || rows.length === 0) return <p className="text-sm text-gray-500">No category recommendations available.</p>;
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
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((r, idx) => (
            <tr key={idx}>
              <td className="px-4 py-3 font-medium text-gray-800">{r.category}</td>
              <td className="px-4 py-3">
                <span className="font-bold text-lg text-blue-600">{Math.round(r.fitScore)}</span>
                <span className="text-gray-500">/100</span>
              </td>
              <td className="px-4 py-3 text-gray-600">
                <ul className="list-disc pl-4 space-y-1">
                  {r.reasons.slice(0, 3).map((reason, i) => <li key={i}>{reason}</li>)}
                </ul>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {r.riskFlags.length > 0 ? r.riskFlags.map((f, i) => (
                    <span key={i} className="rounded bg-yellow-100 text-yellow-800 px-2 py-0.5 text-xs font-medium">
                      {f}
                    </span>
                  )) : <span className="text-gray-400 text-xs">None</span>}
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

// A custom tooltip for all charts for a consistent look
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-white p-3 shadow-lg">
        <p className="font-bold text-gray-800">{label || payload[0].name || 'Data Point'}</p>
        {payload.map((pld: any, index: number) => (
          <p key={index} style={{ color: pld.color || pld.fill }}>
            {`${pld.name}: ${pld.value.toFixed(1)}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom content for the Treemap to apply different colors
const CustomizedTreemapContent = ({ root, depth, x, y, width, height, index, colors, name }: any) => {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        style={{
          fill: colors[index % colors.length],
          stroke: '#fff',
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
};

// Label formatting helpers
function labelizeDeployment(d: HcmAnalysis["fitVector"]["deployment"]) {
  const labels = { saas: "Cloud-based (SaaS)", on_prem: "On-premise", hybrid: "Hybrid" };
  return d ? labels[d] : "—";
}

function labelizeBudget(b: HcmAnalysis["fitVector"]["budgetBand"]) {
  const labels = {
    under_10k: "Under $10,000/year",
    "10k_50k": "$10k – $50k/year",
    "50k_100k": "$50k – $100k/year",
    "100k_plus": "$100,000+ / Custom",
  };
  return b ? labels[b] : "—";
}

function labelizeGlobalization(g: HcmAnalysis["fitVector"]["globalization"]) {
  const labels = { global: "Global", multi_country: "Multiple Countries", local: "Local / Single Country" };
  return g ? labels[g] : "—";
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