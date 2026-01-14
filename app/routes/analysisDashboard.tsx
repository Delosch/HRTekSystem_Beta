import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Sidebar from "../components/DashboardComponents/Sidebar";
import EngineStatusActions from "../components/DashboardComponents/EngineStatusActions";
import { redirect, useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { completedEngine, fetchEngineRecomendations, findEngineData } from "~/models/engine.model";
import { requireUserSession } from "~/lib/session.server";
import { CheckCircle, Clock, ArrowRight, Sparkles, TrendingUp, Activity, Target, Users } from "lucide-react";
import { json, LoaderFunction } from "@remix-run/node";
import EnginePricingCard from "~/components/EnginePricingCard";
import MetricsCard from "~/components/MetricsCard";
import ProgressRing from "~/components/ProgressRing";

const ENGINE = "HR Technology Maturity Analysis";

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

  const currentEngineData = await findEngineData(user.organisationId as string, ENGINE);
  const completedEngines = await completedEngine(user.organisationId as string);

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
    user
  });
};

export default function AnalysisDashboard() {
  const { currentEngine, completedEngines, recommendations, user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
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
    if (fetcher.data?.success && fetcher.data?.message) {
      setToastMessage(fetcher.data.message);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [fetcher.data]);



  const recommendedEngines = recommendations
    .filter(([engineName]: [string, number]) => !completedEngines.includes(engineName))
    .slice(0, 3);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
      {!isSidebarCollapsed && <Sidebar user={user} />}

      <main className="flex-1 md:ml-64 p-6">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {currentEngine.name}
          </h1>
          <p className="text-gray-600">
            Comprehensive assessment of your HR technology landscape and digital readiness
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricsCard
            title="Completion Rate"
            value={currentEngine.progress}
            suffix="%"
            icon={Target}
            colorScheme="blue"
            trend={{
              value: 12,
              isPositive: true,
            }}
          />
          <MetricsCard
            title="Total Submissions"
            value={1}
            icon={Activity}
            colorScheme="green"
          />
          <MetricsCard
            title="Average Score"
            value={currentEngine.progress > 0 ? Math.floor(currentEngine.progress * 0.85) : 0}
            suffix="/100"
            icon={TrendingUp}
            colorScheme="purple"
            trend={{
              value: 8,
              isPositive: true,
            }}
          />
          <MetricsCard
            title="Active Users"
            value={1}
            icon={Users}
            colorScheme="amber"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Progress Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Current Progress
              </h2>

              <div className="flex flex-col items-center justify-center py-8">
                <ProgressRing
                  progress={currentEngine.progress}
                  size={200}
                  strokeWidth={16}
                  label="Complete"
                />

                <div className="mt-8 w-full space-y-3">
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Sections Completed</span>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.floor((currentEngine.progress / 100) * 10)}/10
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Time Spent</span>
                    <span className="text-lg font-bold text-purple-600">
                      {currentEngine.progress > 0 ? Math.floor(currentEngine.progress * 0.5) : 0} min
                    </span>
                  </div>
                </div>
              </div>

              {/* View Detailed Dashboard Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => navigate('/engine/dashboard/hr-tech-maturity')}
                  className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Detailed Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Access advanced analytics, insights, and visualizations
                </p>
              </div>
            </div>
          </div>

          {/* Assessment Breakdown */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Assessment Breakdown
              </h2>

              <div className="space-y-4">
                {[
                  { name: "Digital Infrastructure", score: 85, color: "blue" },
                  { name: "Process Automation", score: 72, color: "green" },
                  { name: "Data Analytics", score: 68, color: "purple" },
                  { name: "Employee Experience", score: 91, color: "amber" },
                  { name: "Integration Capability", score: 55, color: "indigo" },
                ].map((section, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {section.name}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {section.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full bg-gradient-to-r from-${section.color}-500 to-${section.color}-600 transition-all duration-1000`}
                        style={{ width: `${section.score}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 flex gap-3">
                <EngineStatusActions
                  engineStatus={currentEngine.status}
                  param={ENGINE}
                />
                <button
                  onClick={() => navigate('/engine/dashboard/hr-tech-maturity')}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
                >
                  View Detailed Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Card */}
        <EnginePricingCard engineId="hr-tech-maturity" productName="HR Technology Maturity Analysis" className="mb-8" />

        {completedEngines.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-500" />
              Completed Engines
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedEngines.map((engineName: string) => {
                const engineIdMap: Record<string, string> = {
                  "HR Technology Maturity Analysis": "hr-tech-maturity",
                  "HR Transformation Roadmap Generator": "digital-roadmap",
                  "HCM Vendor Fit Engine": "hcm-vendor-fit",
                  "Shared Service Designer": "shared-services",
                  "Intelligent Change Management": "change-management",
                };
                const dashboardId = engineIdMap[engineName];

                return (
                  <div
                    key={engineName}
                    className="bg-green-50 border border-green-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{engineDetails[engineName]?.icon || "✅"}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {engineDetails[engineName]?.name || engineName}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {engineDetails[engineName]?.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex items-center gap-2 text-xs text-green-700 font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Completed
                      </div>
                      {dashboardId && (
                        <button
                          onClick={() => navigate(`/engine/dashboard/${dashboardId}`)}
                          className="ml-auto px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm hover:shadow-md"
                        >
                          📊 View Dashboard
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {recommendedEngines.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              AI Recommended Next Steps
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendedEngines.map(([engineName, score]: [string, number]) => {
                const engineIdMap: Record<string, string> = {
                  "HR Technology Maturity Analysis": "hr-tech-maturity",
                  "HR Transformation Roadmap Generator": "digital-roadmap",
                  "HCM Vendor Fit Engine": "hcm-vendor-fit",
                  "Shared Service Designer": "shared-services",
                  "Intelligent Change Management": "change-management",
                };
                const dashboardId = engineIdMap[engineName];

                return (
                  <div
                    key={engineName}
                    className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => dashboardId && navigate(`/engine/dashboard/${dashboardId}`)}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{engineDetails[engineName]?.icon || "🎯"}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {engineDetails[engineName]?.name || engineName}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {engineDetails[engineName]?.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-blue-100">
                      <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
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
                            className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            {fetcher.state === 'submitting' && fetcher.formData?.get('engineName') === engineName ? (
                              "..."
                            ) : (
                              "🛒 Add"
                            )}
                          </button>
                        </fetcher.Form>
                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {completedEngines.length === 0 && recommendedEngines.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <div className="text-6xl mb-4">🚀</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Start Your HR Transformation Journey
            </h3>
            <p className="text-gray-600 mb-6">
              Choose from our suite of AI-powered assessment engines
            </p>
            <button
              onClick={() => navigate('/startTransformationDashboard')}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl"
            >
              Explore All Engines
            </button>
          </div>
        )}

        {/* All Assessment Engines Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            All Assessment Engines
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                id: "hr-tech-maturity",
                name: "AI-driven HR Tech Diagnostics",
                description: "Assess your HR technology landscape and digital readiness",
                icon: "📊",
                fullName: "HR Technology Maturity Analysis"
              },
              {
                id: "digital-roadmap",
                name: "Auto-generated HR Digital Roadmap & ROI",
                description: "Strategic roadmap for HR digital transformation",
                icon: "🗺️",
                fullName: "HR Transformation Roadmap Generator"
              },
              {
                id: "hcm-vendor-fit",
                name: "Cognitive HCM Vendor Fit Engine",
                description: "Intelligent vendor selection and HCM recommendations",
                icon: "🎯",
                fullName: "HCM Vendor Fit Engine"
              },
              {
                id: "shared-services",
                name: "Shared Services Operating Model Planner",
                description: "Design and optimize your HR shared services model",
                icon: "🏢",
                fullName: "Shared Service Designer"
              },
              {
                id: "change-management",
                name: "Intelligent Change Management Systems",
                description: "Emotionally intelligent change strategy and alignment",
                icon: "🔄",
                fullName: "Intelligent Change Management"
              }
            ].map((engine) => {
              const isCompleted = completedEngines.includes(engine.fullName);
              const isRecommended = recommendedEngines.some(([name]: [string, number]) => name === engine.fullName);

              return (
                <div
                  key={engine.id}
                  className={`border rounded-lg p-4 hover:shadow-md transition-all ${isCompleted ? "bg-green-50 border-green-200" :
                    isRecommended ? "bg-blue-50 border-blue-200" :
                      "bg-gray-50 border-gray-200"
                    }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{engine.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm leading-tight">
                        {engine.name}
                      </h4>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-xs text-green-700 font-medium mt-1">
                          <CheckCircle className="w-3 h-3" />
                          Completed
                        </span>
                      )}
                      {isRecommended && !isCompleted && (
                        <span className="inline-flex items-center gap-1 text-xs text-blue-700 font-medium mt-1">
                          <Sparkles className="w-3 h-3" />
                          Recommended
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {engine.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/engine/dashboard/${engine.id}`)}
                      className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      View Dashboard
                    </button>
                    {!isCompleted && (
                      <fetcher.Form method="post" action="/startTransformationDashboard">
                        <input type="hidden" name="intent" value="addToCart" />
                        <input type="hidden" name="engineName" value={engine.fullName} />
                        <button
                          type="submit"
                          disabled={fetcher.state === 'submitting'}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                          title="Add to cart"
                        >
                          🛒
                        </button>
                      </fetcher.Form>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-slide-up z-50">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
