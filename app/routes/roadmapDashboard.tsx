import { useState, useEffect } from "react";
import Sidebar from "../components/DashboardComponents/Sidebar";
import EngineStatusActions from "../components/DashboardComponents/EngineStatusActions";
import { redirect, useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { completedEngine, fetchEngineRecomendations, findEngineData } from "~/models/engine.model.server";
import { requireUserSession } from "~/lib/session.server";
import { CheckCircle, Clock, ArrowRight, Sparkles, TrendingUp, Activity, Target, Users, CheckCircle2, Circle } from "lucide-react";
import { json, LoaderFunction } from "@remix-run/node";
import { getEnhancedUser } from "~/utils/user.server";
import EnginePricingCard from "~/components/EnginePricingCard";
import MetricsCard from "~/components/MetricsCard";
import ProgressRing from "~/components/ProgressRing";
import PaymentStatusModal from "~/components/PaymentStatusModal";
import { getEnginePaymentStatus } from "~/models/payment.model.server";

// ── Real section definitions matching App.tsx ─────────────────────────────────
const SECTION_KEYS: Record<string, string[]> = {
  'business-strategy': ['drivers', 'outcomes', 'alignment', 'hr-role', 'sponsor'],
  'process-maturity':  ['manual-areas', 'standardization', 'sop-maturity', 'benchmarking'],
  'digital-capability':['digitized-areas', 'pain-points', 'user-satisfaction'],
  'technology-landscape':['integrated-systems', 'hcm-platform', 'tool-count', 'vendor-optimization'],
  'automation-ai':     ['ai-use-cases', 'automation-level', 'automation-percent', 'ai-comfort'],
  'data-analytics':    ['data-consumers', 'data-quality', 'analytics-level', 'business-influence'],
  'operating-model':   ['operating-model', 'shared-services-maturity', 'sla-tracking', 'effort-split'],
  'change-readiness':  ['past-success', 'digital-capability', 'change-approach'],
  'compliance-risk':   ['compliance-automation', 'audit-trails', 'privacy-maturity'],
  'budget-vision':     ['budget-readiness', 'leadership-mindset', 'hr-vision', 'ecosystem-openness'],
};

const SECTION_LABELS: Record<string, string> = {
  'business-strategy':   'Business Strategy & Intent',
  'process-maturity':    'HR Process Maturity',
  'digital-capability':  'Digital Capability',
  'technology-landscape':'Technology Landscape',
  'automation-ai':       'Automation & AI',
  'data-analytics':      'Data & Analytics',
  'operating-model':     'HR Operating Model',
  'change-readiness':    'Change & Adoption',
  'compliance-risk':     'Compliance & Risk',
  'budget-vision':       'Budget & Vision',
};

const SECTION_GRADIENTS: Record<string, string> = {
  'business-strategy':   'from-blue-500 to-indigo-500',
  'process-maturity':    'from-teal-500 to-cyan-500',
  'digital-capability':  'from-cyan-500 to-blue-500',
  'technology-landscape':'from-indigo-500 to-purple-500',
  'automation-ai':       'from-purple-500 to-pink-500',
  'data-analytics':      'from-pink-500 to-rose-500',
  'operating-model':     'from-orange-500 to-amber-500',
  'change-readiness':    'from-amber-500 to-yellow-500',
  'compliance-risk':     'from-green-500 to-emerald-500',
  'budget-vision':       'from-emerald-500 to-teal-500',
};

/** Compute per-section completion % from actual responses */
function computeSectionScores(responses: Record<string, any> | null | undefined): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const [sectionId, keys] of Object.entries(SECTION_KEYS)) {
    if (!responses || Object.keys(responses).length === 0) {
      scores[sectionId] = 0;
      continue;
    }
    const answered = keys.filter(k => {
      const v = responses[k];
      return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
    });
    scores[sectionId] = Math.round((answered.length / keys.length) * 100);
  }
  return scores;
}

const ENGINE = "HR Transformation Roadmap Generator";

const engineDetails: Record<string, { name: string; description: string; icon: string }> = {
  "Intelligent Change Management": {
    name: "Intelligent Change Management",
    description: "Build organizational readiness and drive successful adoption",
    icon: "🔄"
  },
  "HR Transformation Roadmap Generator": {
    name: "HR Transformation Roadmap",
    description: "Create strategic roadmaps for HR digital transformation",
    icon: "🗺️"
  },
  "Shared Service Designer": {
    name: "Shared Service Designer",
    description: "Design efficient HR shared service models",
    icon: "🏢"
  },
  "HR Technology Maturity Analysis": {
    name: "HR Technology Maturity Analysis",
    description: "Assess your HR technology landscape and identify gaps",
    icon: "📊"
  },
  "HCM Vendor Fit Engine": {
    name: "HCM Vendor Fit Engine",
    description: "Select the right HCM vendors for your business",
    icon: "🎯"
  },
  "AI Driven Maturity Engine": {
    name: "AI Driven Maturity Engine",
    description: "Assess your AI transformation maturity and digital readiness",
    icon: "🤖"
  }
};


export const loader: LoaderFunction = async ({ request }) => {
  const user = await getEnhancedUser(request);

  if (!user.organisationId) {
    throw redirect('/onboarding');
  }

  const { getCompanyPayments } = await import("~/models/payment.model.server");
  const { getLatestAnalysis } = await import("~/utils/analysis.server");

  const currentEngineData = await findEngineData(user.organisationId as string, ENGINE);
  const completedEngines = await completedEngine(user.organisationId as string);

  // Check detailed payment status
  const isAdmin = (user as any).role === "ADMIN";
  const paymentStatus = await getEnginePaymentStatus(user.organisationId, ENGINE);
  const isPaid = true; // BYPASS: Force paid for testing
  const isPending = false; // BYPASS: Force no pending for testing

  // Check report existence
  const report = await getLatestAnalysis(user.organisationId, ENGINE);
  const hasReport = !!report;

  let recommendations = null;
  try {
    recommendations = await fetchEngineRecomendations(user.organisationId as string);
  } catch (error) {
    console.log("No recommendations available yet");
  }

  // ── Compute real metrics from actual responses ──────────────────────────
  const responses = currentEngineData?.responses || {};
  const sectionScores = computeSectionScores(responses);

  const totalSections = Object.keys(SECTION_KEYS).length; // 10
  
  // A section is counted in the progress panel if it is at least 50% completed
  const stepsCompleted = Object.values(sectionScores).filter(s => s >= 50).length;

  const sectionsWithAnyData = Object.values(sectionScores).filter(s => s > 0).length;

  // Average score: mean of all section completion %s (only 0 when nothing answered)
  const averageScore = sectionsWithAnyData > 0
    ? Math.round(Object.values(sectionScores).reduce((a, b) => a + b, 0) / totalSections)
    : 0;

  // Last active date from DynamoDB record
  const lastActiveDate = currentEngineData?.createdAt || null;

  return json({
    locked: false,
    currentEngine: {
      name: ENGINE,
      status: currentEngineData?.usage_status || "Draft",
      progress: currentEngineData?.progress || 0,
      data: currentEngineData
    },
    completedEngines,
    recommendations: recommendations?.allRankings || [],
    user,
    paymentStatus,
    isPaid,
    isPending,
    hasReport,
    // real computed metrics
    sectionScores,
    stepsCompleted,
    totalSections,
    averageScore,
    lastActiveDate,
  });
};

export default function RoadmapDashboard() {
  const {
    currentEngine, completedEngines, recommendations, user,
    paymentStatus, isPaid, isPending, hasReport,
    sectionScores, stepsCompleted, totalSections, averageScore, lastActiveDate,
  } = useLoaderData<any>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const data = fetcher.data as { success?: boolean; message?: string } | undefined;
    if (data?.success && data?.message) {
      setToastMessage(data.message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [fetcher.data]);

  const recommendedEngines = recommendations
    .filter(([engineName]: [string, number]) => !completedEngines.includes(engineName))
    .slice(0, 3);

  const handleReportAction = () => {
    if (hasReport) {
      if (isPaid) {
        navigate(`/digital-roadmap/dashboard`);
      } else if (isPending || paymentStatus.status === "rejected") {
        setIsStatusModalOpen(true);
      } else {
        navigate('/payment/checkout');
      }
    } else {
      if (currentEngine.progress === 100) {
        navigate(`/intermediate?engine=${encodeURIComponent(ENGINE)}&skipQuestions=true`);
      } else {
        navigate(`/digital-roadmap/assessment`);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500" />

      <Sidebar user={user} />

      <div className={`flex-1 p-4 md:p-8 transition-all duration-300 relative z-10 ${isSidebarCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent flex items-center gap-3">
              {engineDetails[ENGINE].icon} {engineDetails[ENGINE].name}
              {isPaid && hasReport && <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200">Unlocked</span>}
              {isPending && hasReport && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full border border-yellow-200">Pending Verification</span>}
            </h1>
            <p className="text-gray-500 font-medium mt-1 ml-11">
              {engineDetails[ENGINE].description}
            </p>
          </div>
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-600" />
            <span className="text-sm font-semibold text-gray-600">Last updated: Today</span>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              title: "Completion Rate",
              value: currentEngine.progress,
              suffix: "%",
              icon: Target,
              colorScheme: "blue" as const,
              delay: "0ms"
            },
            {
              title: "Sections Complete",
              value: stepsCompleted,
              suffix: `/${totalSections}`,
              icon: Activity,
              colorScheme: "green" as const,
              delay: "100ms"
            },
            {
              title: "Average Score",
              value: averageScore,
              suffix: "/100",
              icon: TrendingUp,
              colorScheme: "purple" as const,
              delay: "200ms"
            },
            {
              title: "Status",
              value: currentEngine.status,
              icon: Users,
              colorScheme: "amber" as const,
              delay: "300ms"
            }
          ].map(({ delay, ...metric }, index) => (
            <div key={index} style={{ animationDelay: delay }} className="animate-slide-up">
              <MetricsCard {...metric} />
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 h-full hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 group">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">Analysis Progress</h2>
                <div className="p-2 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-xl group-hover:rotate-12 transition-transform duration-500">
                  <Activity className="w-6 h-6 text-teal-600" />
                </div>
              </div>

              <div className="flex flex-col items-center mb-6">
                <ProgressRing progress={currentEngine.progress} size={160} strokeWidth={12} gradientId="progress-gradient" />
                <div className="mt-6 w-full space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-xl border border-teal-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Sections Completed</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                      {stepsCompleted}/{totalSections}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-50 to-cyan-100/50 rounded-xl border border-cyan-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Last Active</span>
                    <span className="text-sm font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                      {lastActiveDate
                        ? new Date(lastActiveDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
                        : "Not started"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <button
                  onClick={handleReportAction}
                  className={`w-full py-4 px-6 font-bold rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group relative overflow-hidden ${isPaid && hasReport
                    ? 'bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white'
                    : isPending && hasReport
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white'
                      : hasReport
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white'
                    }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                  {isPaid && hasReport ? (
                    <>
                      <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="relative z-10">View Detailed Dashboard</span>
                    </>
                  ) : isPending && hasReport ? (
                    <>
                      <Clock className="w-5 h-5 relative z-10" />
                      <span className="relative z-10">Verification Pending</span>
                    </>
                  ) : hasReport ? (
                    <>
                      <svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="relative z-10">Unlock Report</span>
                    </>
                  ) : (
                    <>
                      <span className="relative z-10">{currentEngine.progress === 100 ? "Generate Report" : "Continue Assessment"}</span>
                    </>
                  )}

                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                </button>
                <p className="text-xs text-gray-500 text-center mt-3 font-medium">
                  {isPaid && hasReport ? "✨ Access advanced analytics, insights, and visualizations" : isPending && hasReport ? "⏳ Your payment is detailed verification" : hasReport ? "🔒 Unlock full strategic insights" : "📝 Complete assessment to generate insights"}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "500ms" }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 h-full hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6">
                Assessment Breakdown
              </h2>

              <div className="space-y-4">
                {currentEngine.progress === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                      <Activity className="w-6 h-6 text-gray-400" />
                    </div>
                    <p className="text-sm font-semibold text-gray-500">No assessment data yet</p>
                    <p className="text-xs text-gray-400 mt-1">Start the assessment to see your section breakdown</p>
                  </div>
                ) : (
                  Object.entries(SECTION_KEYS).map(([sectionId], index) => {
                    const score = sectionScores?.[sectionId] ?? 0;
                    const gradient = SECTION_GRADIENTS[sectionId] || "from-teal-500 to-cyan-500";
                    const label = SECTION_LABELS[sectionId] || sectionId;
                    return (
                      <div key={sectionId} className="space-y-2 group">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            {score === 100
                              ? <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                              : score > 0
                              ? <Circle className="w-4 h-4 text-teal-400 shrink-0" />
                              : <Circle className="w-4 h-4 text-gray-300 shrink-0" />
                            }
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                              {label}
                            </span>
                          </div>
                          <span className="text-sm font-extrabold text-gray-700">
                            {score}%
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                          <div
                            className={`h-2.5 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000 ease-out`}
                            style={{ width: `${score}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/50 flex gap-3">
                <EngineStatusActions engineStatus={currentEngine.status} param={ENGINE} />
                <button
                  onClick={handleReportAction}
                  className={`flex-1 px-6 py-4 font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-white ${isPaid && hasReport
                    ? 'bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700'
                    : hasReport
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                >
                  {isPaid && hasReport ? "View Detailed Report" : hasReport ? "Unlock Report" : currentEngine.progress === 100 ? "Generate Report" : "Continue"}
                </button>
              </div>
              {currentEngine.progress > 0 && (
                <button
                  onClick={() => navigate('/digital-roadmap/assessment?modify=true')}
                  className="w-full mt-3 py-3 px-6 font-semibold rounded-2xl border-2 border-teal-200 text-teal-700 bg-teal-50 hover:bg-teal-100 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  ✏️ Modify Responses
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
          <EnginePricingCard engineId="digital-roadmap" productName="HR Transformation Roadmap Generator" className="mb-8" />
        </div>

        {completedEngines.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 mb-8 animate-slide-up" style={{ animationDelay: "700ms" }}>
            <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Completed Engines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedEngines.map((engineName: string) => (
                <div
                  key={engineName}
                  className="bg-gradient-to-br from-green-50 to-emerald-50/50 border-2 border-green-200/50 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:border-green-300"
                  onClick={() => navigate(`/engine/${encodeURIComponent(engineName)}`)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{engineDetails[engineName]?.icon || "✅"}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">{engineDetails[engineName]?.name || engineName}</h4>
                      <p className="text-xs text-gray-600 mt-1">{engineDetails[engineName]?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-700 font-bold mt-2">
                    <CheckCircle className="w-4 h-4" />
                    Completed
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recommendedEngines.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 animate-slide-up" style={{ animationDelay: "800ms" }}>
            <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              AI Recommended Next Steps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedEngines.map(([engineName, score]: [string, number]) => (
                <div
                  key={engineName}
                  className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border-2 border-blue-200/50 rounded-2xl p-4 hover:shadow-xl transition-all duration-300 cursor-pointer group hover:-translate-y-1 hover:border-blue-300"
                  onClick={() => navigate(`/engine/${encodeURIComponent(engineName)}`)}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{engineDetails[engineName]?.icon || "🎯"}</span>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 text-sm">{engineDetails[engineName]?.name || engineName}</h4>
                      <p className="text-xs text-gray-600 mt-1">{engineDetails[engineName]?.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-blue-100">
                    <div className="flex items-center gap-2 text-xs text-blue-700 font-bold">
                      <Clock className="w-4 h-4" />
                      Relevance: {score}/10
                    </div>
                    <div className="flex items-center gap-2">
                      <fetcher.Form method="post" action="/startTransformationDashboard" onSubmit={(e) => e.stopPropagation()}>
                        <input type="hidden" name="intent" value="addToCart" />
                        <input type="hidden" name="engineName" value={engineName} />
                        <button
                          type="submit"
                          onClick={(e) => e.stopPropagation()}
                          disabled={fetcher.state === 'submitting'}
                          className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-xs font-bold transition-all hover:scale-105 flex items-center gap-1"
                        >
                          {fetcher.state === 'submitting' && fetcher.formData?.get('engineName') === engineName ? "..." : "🛒 Add"}
                        </button>
                      </fetcher.Form>
                      <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {completedEngines.length === 0 && recommendedEngines.length === 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-12 text-center">
            <div className="text-7xl mb-4 animate-bounce">🚀</div>
            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2">
              Start Your HR Transformation Journey
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Complete the {currentEngine.name} to get personalized recommendations.
            </p>
            <button
              onClick={() => navigate(`/engine/${encodeURIComponent(ENGINE)}`)}
              className="px-8 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              Get Started
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-up z-50">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      <PaymentStatusModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        status={paymentStatus.status}
        engineName={ENGINE}
        expiresAt={paymentStatus.expiresAt}
        onProceed={paymentStatus.status === "paid" ? () => navigate(`/digital-roadmap/dashboard`) : () => navigate('/payment/checkout')}
      />
    </div>
  );
}