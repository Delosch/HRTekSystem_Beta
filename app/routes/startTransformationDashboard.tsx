import React, { useState, useEffect } from "react";
import { Link, useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import Sidebar from "../components/DashboardComponents/Sidebar";
import {
  ArrowRightCircleIcon,
  CheckCircleIcon,
  LightBulbIcon,
  SparklesIcon,
  ChartBarIcon,
  ClockIcon,
  RocketLaunchIcon,
} from "@heroicons/react/24/outline";
import { json, LoaderFunction, ActionFunction, redirect } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { completedEngine, fetchEngineRecomendations } from "~/models/engine.model";
import { getEnginePriceByName } from "~/lib/pricing";
import { addOrUpdateCartItem } from "~/models/cart.model";

const engineDetails: Record<string, { name: string; description: string; icon: string; route: string }> = {
  "Intelligent Change Management": {
    name: "Intelligent Change Management",
    description: "Build organizational readiness and drive successful adoption",
    icon: "🔄",
    route: "/changeDashboard"
  },
  "HR Transformation Roadmap Generator": {
    name: "HR Transformation Roadmap",
    description: "Create strategic roadmaps for HR digital transformation",
    icon: "🗺️",
    route: "/roadmapDashboard"
  },
  "Shared Service Designer": {
    name: "Shared Service Designer",
    description: "Design efficient HR shared service models",
    icon: "🏢",
    route: "/sharedDashboard"
  },
  "HR Technology Maturity Analysis": {
    name: "HR Technology Maturity Analysis",
    description: "Assess your HR technology landscape and identify gaps",
    icon: "📊",
    route: "/analysisDashboard"
  },
  "HCM Vendor Fit Engine": {
    name: "HCM Vendor Fit Engine",
    description: "Select the right HCM vendors for your business",
    icon: "🎯",
    route: "/vendorDashboard"
  },
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);

  if (!user.organisationId) {
    throw redirect('/onboarding');
  }

  // Check transformation eligibility (requires 3+ verified paid engines)
  const { isEligibleForTransformation } = await import("~/models/payment.model");
  const eligibility = await isEligibleForTransformation(user.organisationId);

  const completedEngines = await completedEngine(user.organisationId);

  let recommendations = null;
  try {
    recommendations = await fetchEngineRecomendations(user.organisationId);
  } catch (error) {
    console.log("No recommendations available yet");
  }

  // Calculate prices for all engines
  const enginePrices: Record<string, number> = {};
  Object.keys(engineDetails).forEach(key => {
    enginePrices[key] = getEnginePriceByName(key);
  });

  return json({
    completedEngines,
    recommendations: recommendations?.allRankings || [],
    user: {
      name: user.first_name,
      company: user.organisationId
    },
    transformationEligibility: eligibility,
    enginePrices
  });
};

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  if (!user || !user.organisationId) return redirect('/auth');

  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "addToCart") {
    const engineName = formData.get("engineName") as string;

    if (!engineName) {
      return json({ error: "Missing engine name" }, { status: 400 });
    }

    // Get the authoritative price from the server-side utility
    const price = getEnginePriceByName(engineName);

    try {
      await addOrUpdateCartItem({
        companyId: user.organisationId,
        productName: engineName,
        price: price,
        userId: user.userId
      });
      return json({ success: true, message: `${engineName} added to cart` });
    } catch (error) {
      console.error("Error adding to cart:", error);
      return json({ error: "Failed to add item to cart" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
};

export default function HRDigitalTransformationDashboard() {
  const { completedEngines, recommendations, user, transformationEligibility, enginePrices } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const fetcher = useFetcher(); // Use fetcher for add to cart actions

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const allEngines = Object.keys(engineDetails);
  const inProgressEngines = allEngines.filter(
    engine => !completedEngines.includes(engine)
  );
  const recommendedEngines = recommendations
    .filter(([engineName]: [string, number]) => !completedEngines.includes(engineName))
    .slice(0, 3);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      {!isSidebarCollapsed && <Sidebar />}

      <main className="flex-1 md:ml-64 p-6 space-y-8">
        {/* Transformation Eligibility Banner */}
        {!transformationEligibility.eligible && (
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-6 shadow-xl text-white">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white/20 rounded-full">
                <RocketLaunchIcon className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Unlock HR Digital Transformation</h3>
                <p className="text-orange-100 mb-4">
                  Complete and pay for {transformationEligibility.requiredCount} engines to access full HR Digital Transformation services.
                </p>
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold">Your Progress</span>
                    <span className="text-sm font-bold">{transformationEligibility.paidCount}/{transformationEligibility.requiredCount} Engines</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-3 mb-3">
                    <div
                      className="bg-white h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(transformationEligibility.paidCount / transformationEligibility.requiredCount) * 100}%` }}
                    />
                  </div>
                  {transformationEligibility.paidEngines.length > 0 && (
                    <div className="text-sm text-orange-100">
                      <span className="font-semibold">Paid Engines:</span> {transformationEligibility.paidEngines.join(", ")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Header */}
        <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="max-w-2xl text-white">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Welcome back, {user.name}! 👋
              </h1>
              <p className="text-blue-100 text-lg leading-relaxed mb-6">
                Your HR Digital Transformation journey starts here. Track your progress,
                explore assessment engines, and get AI-powered recommendations tailored to your needs.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/proposalTransformation">
                  <button
                    disabled={!transformationEligibility.eligible}
                    className={`px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 ${transformationEligibility.eligible
                      ? 'bg-white text-blue-700 hover:bg-gray-100 hover:scale-105'
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
                      }`}
                  >
                    {transformationEligibility.eligible ? 'Start Full Transformation' : `🔒 Locked (${transformationEligibility.paidCount}/3 Engines)`}
                  </button>
                </Link>
                <Link to="/recommendation">
                  <button className="bg-blue-800/50 backdrop-blur-sm text-white border-2 border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-blue-800/70 transition-all duration-200">
                    View Recommendations
                  </button>
                </Link>
              </div>
            </div>

            <div className="mt-8 md:mt-0 md:ml-10">
              <div className="bg-white/10 p-8 rounded-2xl shadow-inner backdrop-blur-sm border border-white/20">
                <RocketLaunchIcon className="h-32 w-32 text-white/80" />
              </div>
            </div>
          </div>
        </section>

        {/* Progress Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <CheckCircleIcon className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{completedEngines.length}</div>
                <div className="text-green-100 text-sm">Completed</div>
              </div>
            </div>
            <div className="text-green-50 text-sm">Assessment Engines Completed</div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <ClockIcon className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{inProgressEngines.length}</div>
                <div className="text-blue-100 text-sm">Available</div>
              </div>
            </div>
            <div className="text-blue-50 text-sm">Engines Ready to Start</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <SparklesIcon className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-4xl font-bold">{recommendedEngines.length}</div>
                <div className="text-purple-100 text-sm">AI Picks</div>
              </div>
            </div>
            <div className="text-purple-50 text-sm">Recommended for You</div>
          </div>
        </section>

        {/* Completed Engines */}
        {completedEngines.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <CheckCircleIcon className="w-8 h-8 text-green-600" />
              <h2 className="text-3xl font-bold text-gray-800">
                Completed Engines
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedEngines.map((engineName: string) => (
                <div
                  key={engineName}
                  onClick={() => navigate(engineDetails[engineName]?.route || `/engine/${encodeURIComponent(engineName)}`)}
                  className="bg-white rounded-xl border-2 border-green-200 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-5xl">{engineDetails[engineName]?.icon || "✅"}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {engineDetails[engineName]?.name || engineName}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {engineDetails[engineName]?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-green-700 font-semibold text-sm bg-green-50 px-4 py-2 rounded-lg">
                    <CheckCircleIcon className="w-5 h-5" />
                    Completed
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Recommended Engines */}
        {recommendedEngines.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <SparklesIcon className="w-8 h-8 text-yellow-500" />
              <h2 className="text-3xl font-bold text-gray-800">
                AI Recommended Next Steps
              </h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedEngines.map(([engineName, score]: [string, number]) => (
                <div
                  key={engineName}
                  onClick={() => navigate(engineDetails[engineName]?.route || `/engine/${encodeURIComponent(engineName)}`)}
                  className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-5xl">{engineDetails[engineName]?.icon || "🎯"}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {engineDetails[engineName]?.name || engineName}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {engineDetails[engineName]?.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-blue-100">
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-500 font-medium">Relevance: {score}/10</span>
                      <span className="text-lg font-bold text-gray-800">
                        {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(enginePrices[engineName] || 0)}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <fetcher.Form method="post" onSubmit={(e) => e.stopPropagation()}>
                        <input type="hidden" name="intent" value="addToCart" />
                        <input type="hidden" name="engineName" value={engineName} />
                        <button
                          type="submit"
                          onClick={(e) => e.stopPropagation()}
                          disabled={fetcher.state === 'submitting'}
                          className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                        >
                          {fetcher.state === 'submitting' && fetcher.formData?.get('engineName') === engineName ? (
                            <span className="w-4 h-4 border-2 border-blue-700 border-t-transparent rounded-full animate-spin"></span>
                          ) : (
                            "🛒 Add"
                          )}
                        </button>
                      </fetcher.Form>
                      <ArrowRightCircleIcon className="w-8 h-8 text-blue-600 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* All Available Engines */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <LightBulbIcon className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-bold text-gray-800">
              All Assessment Engines
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allEngines.map((engineName) => {
              const isCompleted = completedEngines.includes(engineName);
              return (
                <div
                  key={engineName}
                  onClick={() => navigate(engineDetails[engineName]?.route || `/engine/${encodeURIComponent(engineName)}`)}
                  className={`rounded-xl border-2 p-6 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group ${isCompleted
                    ? 'bg-gray-50 border-gray-300 opacity-75'
                    : 'bg-white border-gray-200'
                    }`}
                >
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-5xl">{engineDetails[engineName]?.icon}</span>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {engineDetails[engineName]?.name}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {engineDetails[engineName]?.description}
                      </p>
                    </div>
                  </div>
                  {isCompleted ? (
                    <div className="flex items-center gap-2 text-green-700 font-semibold text-sm bg-green-50 px-4 py-2 rounded-lg">
                      <CheckCircleIcon className="w-5 h-5" />
                      Completed
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-gray-800">
                          {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(enginePrices[engineName] || 0)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <fetcher.Form method="post" onSubmit={(e) => e.stopPropagation()}>
                          <input type="hidden" name="intent" value="addToCart" />
                          <input type="hidden" name="engineName" value={engineName} />
                          <button
                            type="submit"
                            onClick={(e) => e.stopPropagation()}
                            disabled={fetcher.state === 'submitting'}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
                          >
                            {fetcher.state === 'submitting' && fetcher.formData?.get('engineName') === engineName ? (
                              "..."
                            ) : (
                              "🛒 Add"
                            )}
                          </button>
                        </fetcher.Form>

                        <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm bg-blue-50 px-4 py-2 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <ArrowRightCircleIcon className="w-5 h-5" />
                          Start
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div >
        </section >

        {/* Why Transformation Section */}
        < section >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Why Your HR Needs Digital Transformation
          </h2>
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <ul className="grid md:grid-cols-2 gap-6">
              {[
                "Streamline fragmented HR processes into a unified, automated system",
                "Replace manual or outdated workflows with modern digital tools",
                "Enhance decision-making with real-time HR analytics and dashboards",
                "Improve employee engagement through self-service and mobile access",
                "Reduce operational costs and increase HR team productivity",
                "Ensure compliance with automated tracking and reporting",
              ].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section >

        {/* Our Approach */}
        < section >
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Our Transformation Approach
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <LightBulbIcon className="w-10 h-10 text-yellow-500" />,
                title: "Strategic Planning",
                desc: "Align transformation goals with your business objectives, backed by diagnostic data and AI insights.",
              },
              {
                icon: <ArrowRightCircleIcon className="w-10 h-10 text-blue-600" />,
                title: "Technology Integration",
                desc: "Implement modern HRIS, automation, and AI-driven tools tailored to your specific needs.",
              },
              {
                icon: <CheckCircleIcon className="w-10 h-10 text-green-600" />,
                title: "Change Enablement",
                desc: "Provide comprehensive training, adoption strategies, and ongoing support for smooth transition.",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
              >
                <div className="mb-4">{step.icon}</div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </section >
      </main >
    </div >
  );
}
