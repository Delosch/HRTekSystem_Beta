import { useState, useEffect } from "react";
import Sidebar from "../components/DashboardComponents/Sidebar";
import EngineStatusActions from "../components/DashboardComponents/EngineStatusActions";
import { redirect, useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { completedEngine, fetchEngineRecomendations, findEngineData } from "~/models/engine.model.server";
import { getEnhancedUser } from "~/utils/user.server";
import { json, LoaderFunction, type MetaFunction } from "@remix-run/node";
import { CheckCircle, Clock, ArrowRight, Sparkles, TrendingUp, Activity, Target, Users, Menu, X, Brain } from "lucide-react";
import EnginePricingCard from "~/components/EnginePricingCard";
import MetricsCard from "~/components/MetricsCard";
import ProgressRing from "~/components/ProgressRing";
import PaymentStatusModal from "~/components/PaymentStatusModal";
import { getEnginePaymentStatus } from "~/models/payment.model.server";

export const meta: MetaFunction = () => [
  { title: "AI Maturity Dashboard | HRTek System" },
  { name: "description", content: "View your AI-driven HR technology maturity and strategic insights." },
];

const ENGINE = "AI Driven Maturity Engine";

const engineDetails: Record<string, { name: string; description: string; icon: string }> = {
  "Intelligent Change Management": { name: "Change Management Intelligence Engine", description: "Build organizational readiness and drive successful adoption", icon: "🔄" },
  "HR Transformation Roadmap Generator": { name: "HR Transformation Roadmap", description: "Create strategic roadmaps for HR digital transformation", icon: "🗺️" },
  "Shared Service Designer": { name: "Shared Service Designer", description: "Design efficient HR shared service models", icon: "🏢" },
  "HR Technology Maturity Analysis": { name: "HR Technology Maturity Analysis", description: "Assess your HR technology landscape and identify gaps", icon: "📊" },
  "HCM Vendor Fit Engine": { name: "HCM Vendor Fit Engine", description: "Select the right HCM vendors for your business", icon: "🎯" },
  "AI Driven Maturity Engine": { name: "AI Driven Maturity Engine", description: "Assess your AI transformation maturity and digital readiness", icon: "🤖" },
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getEnhancedUser(request);
  if (!user.organisationId) throw redirect('/onboarding');

  const { getCompanyPayments } = await import("~/models/payment.model.server");
  const { getLatestAnalysis } = await import("~/utils/analysis.server");
  const { getCompanyProfile } = await import("~/models/company.model.server");

  const company = await getCompanyProfile(user.organisationId);
  const companyLogo = company?.logo_url || null;

  const currentEngineData = await findEngineData(user.organisationId as string, ENGINE);
  const completedEngines = await completedEngine(user.organisationId as string);

  // Check detailed payment status
  const isAdmin = (user as any).role === "ADMIN";
  const paymentStatus = await getEnginePaymentStatus(user.organisationId, ENGINE);
  const isPaid = isAdmin || paymentStatus.status === "paid";
  const isPending = !isAdmin && paymentStatus.status === "pending";

  const report = await getLatestAnalysis(user.organisationId, ENGINE);
  const hasReport = !!report;

  let recommendations = null;
  try { recommendations = await fetchEngineRecomendations(user.organisationId as string); } catch { /* no recommendations yet */ }

  return json({
    currentEngine: { name: ENGINE, status: currentEngineData?.usage_status || "Draft", progress: currentEngineData?.progress || 0, data: currentEngineData },
    completedEngines,
    recommendations: recommendations?.allRankings || [],
    user, paymentStatus, isPaid, isPending, hasReport, companyLogo,
  });
};

export default function AiMaturityDashboard() {
  const { currentEngine, completedEngines, recommendations, user, paymentStatus, isPaid, isPending, hasReport, companyLogo } = useLoaderData<any>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsSidebarCollapsed(window.innerWidth < 768);
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
        navigate(`/ai-maturity/report`);
      } else if (isPending || paymentStatus.status === "rejected") {
        setIsStatusModalOpen(true);
      } else {
        navigate('/payment/checkout');
      }
    } else {
      if (currentEngine.progress === 100) {
        navigate(`/intermediate?engine=${encodeURIComponent(ENGINE)}`);
      } else {
        navigate(`/ai-maturity/assessment`);
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50/20 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-violet-400/20 to-blue-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-400/10 to-indigo-400/10 rounded-full blur-3xl animate-pulse delay-500" />

      {!isSidebarCollapsed && (
        <div className="hidden md:block">
          <Sidebar user={user} />
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white relative animate-slide-in-left" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full z-10">
              <X className="w-5 h-5 text-slate-500" />
            </button>
            <Sidebar user={user} onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <main className={`flex-1 p-4 md:p-8 transition-all duration-300 relative z-10 ${isSidebarCollapsed ? "" : "md:ml-64"}`}>
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-sm">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-white rounded-xl transition-colors">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/hrtek_logo.png" alt="HRTek" className="h-7 w-auto" />
            {companyLogo && (<><div className="h-5 w-[1px] bg-slate-200"></div><img src={companyLogo} alt="Company" className="h-7 w-auto object-contain rounded" /></>)}
            <div className="font-bold text-slate-900 border-l border-slate-200 pl-2">AI Maturity</div>
          </div>
          <div className="w-10"></div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-down">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img src="/hrtek_logo.png" alt="HRTek" className="h-10 w-auto" />
              {companyLogo && (<><div className="h-8 w-[1px] bg-slate-200"></div><img src={companyLogo} alt="Company" className="h-9 w-auto object-contain rounded" /></>)}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase whitespace-nowrap">AI Maturity Dashboard</h1>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                AI Intelligence Assessment • Generated for {user.organisationName || "Your Organization"}
              </p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-gray-600">Last updated: Today</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Completion Rate", value: currentEngine.progress, suffix: "%", icon: Target, colorScheme: "blue" as const, trend: { value: 10, isPositive: true }, delay: "0ms" },
            { title: "Total Submissions", value: 1, icon: Activity, colorScheme: "green" as const, delay: "100ms" },
            { title: "Maturity Score", value: currentEngine.progress > 0 ? Math.floor(currentEngine.progress * 0.9) : 0, suffix: "/100", icon: TrendingUp, colorScheme: "purple" as const, trend: { value: 9, isPositive: true }, delay: "200ms" },
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
                <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">Analysis Progress</h2>
                <div className="p-2 bg-gradient-to-br from-violet-100 to-blue-100 rounded-xl group-hover:rotate-12 transition-transform duration-500">
                  <Brain className="w-6 h-6 text-violet-600" />
                </div>
              </div>

              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                  <ProgressRing progress={currentEngine.progress} size={160} strokeWidth={12} gradientId="ai-progress-gradient" />
                </div>
                <div className="mt-8 w-full space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-violet-50 to-violet-100/50 rounded-xl border border-violet-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Dimensions Assessed</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-violet-700 bg-clip-text text-transparent">
                      {Math.floor((currentEngine.progress / 100) * 10)}/10
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Maturity Level</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                      {currentEngine.progress >= 80 ? "Advanced" : currentEngine.progress >= 60 ? "Proficient" : currentEngine.progress >= 40 ? "Developing" : currentEngine.progress > 0 ? "Emerging" : "—"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <button
                  onClick={handleReportAction}
                  className={`w-full py-4 px-6 font-bold rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group relative overflow-hidden ${
                    isPaid && hasReport ? 'bg-gradient-to-r from-violet-600 via-blue-600 to-indigo-600 hover:from-violet-700 hover:via-blue-700 hover:to-indigo-700 text-white'
                    : isPending && hasReport ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white'
                    : hasReport ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                    : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700 text-white'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  {isPaid && hasReport ? (<><Brain className="w-5 h-5 relative z-10" /><span className="relative z-10">View AI Maturity Report</span></>)
                    : isPending && hasReport ? (<><Clock className="w-5 h-5 relative z-10" /><span className="relative z-10">Verification Pending</span></>)
                    : hasReport ? (<><svg className="w-5 h-5 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg><span className="relative z-10">Unlock Report</span></>)
                    : (<><span className="relative z-10">{currentEngine.progress === 100 ? "Generate Report" : currentEngine.progress > 0 ? "Continue Assessment" : "Start Assessment"}</span></>)
                  }
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                </button>
                <p className="text-xs text-gray-500 text-center mt-3 font-medium">
                  {isPaid && hasReport ? "✨ Access your full AI maturity analysis and recommendations" : isPending && hasReport ? "⏳ Payment verification in progress" : hasReport ? "🔒 Unlock your strategic AI maturity insights" : "🤖 Complete assessment to generate your AI maturity profile"}
                </p>
                {currentEngine.progress > 0 && (
                  <button
                    onClick={() => navigate('/ai-maturity/assessment?modify=true')}
                    className="w-full mt-3 py-3 px-6 font-semibold rounded-2xl border-2 border-violet-200 text-violet-700 bg-violet-50 hover:bg-violet-100 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    ✏️ Modify Responses
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Assessment Breakdown */}
          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "500ms" }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 h-full hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent mb-6">
                AI Maturity Dimensions
              </h2>
              <div className="space-y-5">
                {[
                  { name: "HR Tech Architecture Depth", gradient: "from-violet-500 to-purple-500" },
                  { name: "Process Intelligence", gradient: "from-blue-500 to-cyan-500" },
                  { name: "Data Gravity & Analytics", gradient: "from-cyan-500 to-teal-500" },
                  { name: "Cost & ROI Optimization", gradient: "from-emerald-500 to-green-500" },
                  { name: "Change Velocity", gradient: "from-amber-500 to-yellow-500" },
                  { name: "AI Depth & Automation", gradient: "from-orange-500 to-red-500" },
                  { name: "Experience Intelligence", gradient: "from-pink-500 to-rose-500" },
                  { name: "Governance & Ethics", gradient: "from-indigo-500 to-violet-500" },
                  { name: "Scalability & Resilience", gradient: "from-teal-500 to-blue-500" },
                  { name: "HR Operating Model", gradient: "from-purple-500 to-pink-500" },
                ].map((section, index) => {
                  const dimProgress = currentEngine.progress > 0
                    ? Math.min(100, Math.max(0, currentEngine.progress + (index % 3 === 0 ? 5 : index % 3 === 1 ? -8 : 3)))
                    : 0;
                  return (
                    <div key={index} className="space-y-2 group">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">{section.name}</span>
                        <span className="text-sm font-extrabold text-gray-600">{currentEngine.progress > 0 ? `${dimProgress}%` : "—"}</span>
                      </div>
                      <div className="relative w-full bg-gray-200/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                        <div
                          className={`h-2.5 rounded-full bg-gradient-to-r ${section.gradient} transition-all duration-1000 ease-out relative overflow-hidden`}
                          style={{ width: currentEngine.progress > 0 ? `${dimProgress}%` : "0%" }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/50 flex gap-3">
                <EngineStatusActions engineStatus={currentEngine.status} param={ENGINE} />
                <button
                  onClick={handleReportAction}
                  className={`flex-1 px-6 py-4 font-bold rounded-2xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-white ${
                    isPaid && hasReport ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700'
                    : hasReport ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600'
                    : 'bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-700 hover:to-blue-700'
                  }`}
                >
                  {isPaid && hasReport ? "View AI Maturity Report" : isPending && hasReport ? "Verification Pending" : hasReport ? "Unlock Report" : currentEngine.progress === 100 ? "Generate Report" : currentEngine.progress > 0 ? "Continue Assessment" : "Open Assessment"}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="animate-slide-up" style={{ animationDelay: "600ms" }}>
          <EnginePricingCard engineId="ai-maturity" productName="AI Driven Maturity Engine" className="mb-8" />
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {showToast && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-3 rounded-2xl shadow-2xl font-semibold animate-slide-up">
            {toastMessage}
          </div>
        )}

        <PaymentStatusModal 
          isOpen={isStatusModalOpen}
          onClose={() => setIsStatusModalOpen(false)}
          status={paymentStatus.status}
          engineName={ENGINE}
          expiresAt={paymentStatus.expiresAt}
          onProceed={paymentStatus.status === "paid" ? () => navigate(`/ai-maturity/report`) : () => navigate('/payment/checkout')}
        />
      </main>
    </div>
  );
}
