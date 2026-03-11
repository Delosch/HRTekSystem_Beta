import { useState, useEffect } from "react";
import Sidebar from "../components/DashboardComponents/Sidebar";
import EngineStatusActions from "../components/DashboardComponents/EngineStatusActions";
import { redirect, useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { completedEngine, fetchEngineRecomendations, findEngineData } from "~/models/engine.model.server";
import { requireUserSession } from "~/lib/session.server";
import { json, LoaderFunction } from "@remix-run/node";
import { CheckCircle, Clock, ArrowRight, Sparkles, TrendingUp, Activity, Target, Users, Menu, X } from "lucide-react";
import EnginePricingCard from "~/components/EnginePricingCard";
import MetricsCard from "~/components/MetricsCard";
import ProgressRing from "~/components/ProgressRing";

const ENGINE = "HCM Vendor Fit Engine";

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
};
import { getEnhancedUser } from "~/utils/user.server";

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getEnhancedUser(request);

  if (!user.organisationId) {
    throw redirect('/onboarding');
  }

  const { getCompanyPayments } = await import("~/models/payment.model.server");
  const { getLatestAnalysis } = await import("~/utils/analysis.server");
  const { getCompanyProfile } = await import("~/models/company.model.server");

  const company = await getCompanyProfile(user.organisationId);
  const companyLogo = company?.logo_url || null;

  const currentEngineData = await findEngineData(user.organisationId as string, ENGINE);
  const completedEngines = await completedEngine(user.organisationId as string);

  // Check payment status
  const payments = await getCompanyPayments(user.organisationId);
  const isAdmin = (user as any).role === "ADMIN";

  // Check if any payment record for this engine is verified
  const isPaid = isAdmin || payments.some((p: any) =>
    (p.status === "payment_verified" || p.status === "completed") &&
    p.items?.some((i: any) => i.engineName.trim() === ENGINE.trim())
  );

  // Check if any payment record for this engine is pending
  const isPending = !isPaid && payments.some((p: any) =>
    p.status === "payment_submitted" &&
    p.items?.some((i: any) => i.engineName.trim() === ENGINE.trim())
  );

  // Check report existence
  const report = await getLatestAnalysis(user.organisationId, ENGINE);
  const hasReport = !!report;

  let recommendations = null;
  try {
    recommendations = await fetchEngineRecomendations(user.organisationId as string);
  } catch (error) {
    console.log("No recommendations available yet");
  }

  return json({
    currentEngine: {
      name: ENGINE,
      status: currentEngineData?.usage_status || "Draft",
      progress: currentEngineData?.progress || 0,
      data: currentEngineData
    },
    completedEngines,
    recommendations: recommendations?.allRankings || [],
    user,
    isPaid,
    isPending,
    hasReport,
    companyLogo
  });
}

export default function VendorDashboard() {
  const { currentEngine, completedEngines, recommendations, user, isPaid, isPending, hasReport, companyLogo } = useLoaderData<any>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

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
      if (isPaid || isPending) {
        navigate(`/consulting-report/${encodeURIComponent(ENGINE)}`);
      } else {
        navigate('/payment/checkout');
      }
    } else {
      if (currentEngine.progress === 100) {
        navigate(`/intermediate?engine=${encodeURIComponent(ENGINE)}`);
      } else {
        navigate(`/engine/${encodeURIComponent(ENGINE)}`);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-red-50/20 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-yellow-400/20 to-orange-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-red-400/10 to-pink-400/10 rounded-full blur-3xl animate-pulse delay-500" />

      {!isSidebarCollapsed && (
        <div className="hidden md:block">
          <Sidebar user={user} />
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white relative animate-slide-in-left" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full z-10"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
            <Sidebar user={user} onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className={`flex-1 p-4 md:p-8 transition-all duration-300 relative z-10 ${isSidebarCollapsed ? "" : "md:ml-64"}`}>
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-sm">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-white rounded-xl transition-colors">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/hrtek_logo.png" alt="HRTek" className="h-7 w-auto" />
            {companyLogo && (
              <>
                <div className="h-5 w-[1px] bg-slate-200"></div>
                <img src={companyLogo} alt="Company" className="h-7 w-auto object-contain rounded" />
              </>
            )}
            <div className="font-bold text-slate-900 border-l border-slate-200 pl-2">Vendor Fit</div>
          </div>
          <div className="w-10"></div>
        </div>
        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-down">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/hrtek_logo.png" alt="HRTek" className="h-10 w-auto" />
              {companyLogo && (
                <>
                  <div className="h-8 w-[1px] bg-slate-200"></div>
                  <img src={companyLogo} alt="Company" className="h-9 w-auto object-contain rounded" />
                </>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">Vendor Fit Dashboard</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                HCM Selection Intelligence • Generated for {user.organisationName || "Your Organization"}
              </p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-semibold text-gray-600">Last updated: Today</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Completion Rate", value: currentEngine.progress, suffix: "%", icon: Target, colorScheme: "blue" as const, trend: { value: 18, isPositive: true }, delay: "0ms" },
            { title: "Total Submissions", value: 1, icon: Activity, colorScheme: "green" as const, delay: "100ms" },
            { title: "Average Score", value: currentEngine.progress > 0 ? Math.floor(currentEngine.progress * 0.92) : 0, suffix: "/100", icon: TrendingUp, colorScheme: "purple" as const, trend: { value: 14, isPositive: true }, delay: "200ms" },
            { title: "Active Users", value: 1, icon: Users, colorScheme: "amber" as const, delay: "300ms" }
          ].map(({ delay, ...metric }, index) => (
            <div key={index} style={{ animationDelay: delay }} className="animate-slide-up">
              <MetricsCard {...metric} />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Progress Card */}
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 h-full hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 group">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Analysis Progress</h2>
                <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-xl group-hover:rotate-12 transition-transform duration-500">
                  <Activity className="w-6 h-6 text-orange-600" />
                </div>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                  <ProgressRing progress={currentEngine.progress} size={160} strokeWidth={12} gradientId="progress-gradient" />
                </div>

                <div className="mt-8 w-full space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-orange-50 to-orange-100/50 rounded-xl border border-orange-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Sections Completed</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-orange-700 bg-clip-text text-transparent">
                      {Math.floor((currentEngine.progress / 100) * 10)}/10
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-red-50 to-red-100/50 rounded-xl border border-red-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Time Spent</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                      {currentEngine.progress > 0 ? Math.floor(currentEngine.progress * 0.7) : 0} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <button
                  onClick={handleReportAction}
                  className={`w-full py-4 px-6 font-bold rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group relative overflow-hidden ${isPaid && hasReport
                    ? 'bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 hover:from-orange-700 hover:via-red-700 hover:to-pink-700 text-white'
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
                {currentEngine.progress > 0 && (
                  <button
                    onClick={() => navigate('/engine/hcm-vendor-fit?modify=true')}
                    className="w-full mt-3 py-3 px-6 font-semibold rounded-2xl border-2 border-orange-200 text-orange-700 bg-orange-50 hover:bg-orange-100 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    ✏️ Modify Responses
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "500ms" }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 h-full hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Assessment Breakdown
              </h2>

              <div className="space-y-5">
                {[
                  { name: "Requirements Analysis", score: 92, gradient: "from-orange-500 to-red-500" },
                  { name: "Vendor Evaluation", score: 88, gradient: "from-red-500 to-pink-500" },
                  { name: "Cost-Benefit Analysis", score: 85, gradient: "from-pink-500 to-purple-500" },
                  { name: "Implementation Readiness", score: 78, gradient: "from-purple-500 to-indigo-500" },
                  { name: "Risk Assessment", score: 82, gradient: "from-indigo-500 to-blue-500" },
                ].map((section, index) => (
                  <div key={index} className="space-y-3 group">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                        {section.name}
                      </span>
                      <span className="text-lg font-extrabold bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent">
                        {section.score}%
                      </span>
                    </div>
                    <div className="relative w-full bg-gray-200/50 rounded-full h-3 overflow-hidden shadow-inner">
                      <div
                        className={`h-3 rounded-full bg-gradient-to-r ${section.gradient} transition-all duration-1000 ease-out relative overflow-hidden group-hover:shadow-lg`}
                        style={{ width: `${section.score}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200/50 flex gap-3">
                <EngineStatusActions engineStatus={currentEngine.status} param={ENGINE} />
                <button
                  onClick={handleReportAction}
                  className={`flex-1 px-6 py-4 font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-white ${isPaid && hasReport
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700'
                    : hasReport
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                    }`}
                >
                  {isPaid && hasReport ? "View Detailed Report" : isPending && hasReport ? "Verification Pending" : hasReport ? "Unlock Report" : currentEngine.progress === 100 ? "Generate Report" : "Continue"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
          <EnginePricingCard engineId="hcm-vendor-fit" productName="HCM Vendor Fit Engine" className="mb-8" />
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
            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
              Start Your HR Transformation Journey
            </h3>
            <p className="text-gray-600 mb-6 text-lg">
              Complete the {currentEngine.name} to get personalized recommendations.
            </p>
            <button
              onClick={() => navigate(`/engine/${encodeURIComponent(ENGINE)}`)}
              className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl hover:scale-105"
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
    </div>
  );
}
