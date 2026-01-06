import { useState, useEffect } from "react";
import Sidebar from "../components/DashboardComponents/Sidebar";
import EngineStatusActions from "../components/DashboardComponents/EngineStatusActions";
import { redirect, useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { completedEngine, fetchEngineRecomendations, findEngineData } from "~/models/engine.model";
import { requireUserSession } from "~/lib/session.server";
import { CheckCircle, Clock, ArrowRight, Sparkles, TrendingUp, Activity, Target, Users } from "lucide-react";
import { json, LoaderFunction } from "@remix-run/node";
import { getEnhancedUser } from "~/utils/user.server";
import EnginePricingCard from "~/components/EnginePricingCard";
import MetricsCard from "~/components/MetricsCard";
import ProgressRing from "~/components/ProgressRing";

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
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getEnhancedUser(request);

  if (!user.organisationId) {
    throw redirect('/onboarding');
  }

  const currentEngineData = await findEngineData(user.organisationId as string, ENGINE);
  const completedEngines = await completedEngine(user.organisationId as string);

  let recommendations = null;
  try {
    recommendations = await fetchEngineRecomendations(user.organisationId as string);
  } catch (error) {
    console.log("No recommendations available yet");
  }

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
    user
  });
};

export default function RoadmapDashboard() {
  const { currentEngine, completedEngines, recommendations, user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const recommendedEngines = recommendations
    .filter(([engineName]: [string, number]) => !completedEngines.includes(engineName))
    .slice(0, 3);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500" />

      {!isSidebarCollapsed && <Sidebar user={user} />}

      <main className="flex-1 md:ml-64 p-6 relative z-10">
        {/* Enhanced Page Header with Gradient Text */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 bg-clip-text text-transparent mb-3 tracking-tight">
            {currentEngine.name}
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Create strategic roadmaps for HR digital transformation
          </p>
        </div>

        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { title: "Completion Rate", value: currentEngine.progress, suffix: "%", icon: Target, colorScheme: "blue" as const, trend: { value: 15, isPositive: true }, delay: "0ms" },
            { title: "Total Submissions", value: 1, icon: Activity, colorScheme: "green" as const, delay: "100ms" },
            { title: "Average Score", value: currentEngine.progress > 0 ? Math.floor(currentEngine.progress * 0.88) : 0, suffix: "/100", icon: TrendingUp, colorScheme: "purple" as const, trend: { value: 10, isPositive: true }, delay: "200ms" },
            { title: "Active Users", value: 1, icon: Users, colorScheme: "amber" as const, delay: "300ms" }
          ].map(({ delay, ...metric }, index) => (
            <div key={index} style={{ animationDelay: delay }} className="animate-slide-up">
              <MetricsCard {...metric} />
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: "400ms" }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 h-full hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-teal-500/20 via-cyan-500/20 to-blue-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <h2 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-teal-600" />
                Current Progress
              </h2>

              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full blur-2xl opacity-30 animate-pulse" />
                  <ProgressRing progress={currentEngine.progress} size={200} strokeWidth={16} label="Complete" />
                </div>

                <div className="mt-8 w-full space-y-3">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-teal-50 to-teal-100/50 rounded-xl border border-teal-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Sections Completed</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
                      {Math.floor((currentEngine.progress / 100) * 10)}/10
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-cyan-50 to-cyan-100/50 rounded-xl border border-cyan-200/50 hover:scale-105 transition-transform duration-300 cursor-pointer">
                    <span className="text-sm font-semibold text-gray-700">Time Spent</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                      {currentEngine.progress > 0 ? Math.floor(currentEngine.progress * 0.6) : 0} min
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200/50">
                <button
                  onClick={() => navigate('/engine/dashboard/digital-roadmap')}
                  className="w-full py-4 px-6 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-700 hover:via-cyan-700 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-500 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                  <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span className="relative z-10">View Detailed Dashboard</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300 relative z-10" />
                </button>
                <p className="text-xs text-gray-500 text-center mt-3 font-medium">
                  ✨ Access advanced analytics, insights, and visualizations
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 animate-slide-up" style={{ animationDelay: "500ms" }}>
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 p-6 h-full hover:shadow-3xl transition-all duration-500 hover:-translate-y-1">
              <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6">
                Assessment Breakdown
              </h2>

              <div className="space-y-5">
                {[
                  { name: "Current State Analysis", score: 88, gradient: "from-teal-500 to-cyan-500" },
                  { name: "Future State Vision", score: 92, gradient: "from-cyan-500 to-blue-500" },
                  { name: "Gap Analysis", score: 78, gradient: "from-blue-500 to-indigo-500" },
                  { name: "Implementation Strategy", score: 85, gradient: "from-indigo-500 to-purple-500" },
                  { name: "ROI Projection", score: 80, gradient: "from-purple-500 to-pink-500" },
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
                  onClick={() => navigate('/engine/dashboard/digital-roadmap')}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold rounded-2xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                >
                  View Detailed Report
                </button>
              </div>
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
      </main>

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
    </div>
  );
}