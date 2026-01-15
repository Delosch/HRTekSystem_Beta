import type { LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server"; // Your session utility
import {
  SparklesIcon,
  ChevronRightIcon,
  CheckBadgeIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import { completedEngine, fetchEngineRecomendations } from "~/models/engine.model";
import { useState } from "react";

interface RecommendationItem {
  pk: string;
  sk: string;
  company_id: string;
  createdBy: string;
  createdAt: string;
  allRankings: [string, number][];
}

interface EngineDetails {
  name: string;
  description: string;
  imageUrl: string;
  engineModuleUrl: string
}

const engineDetails: Record<string, EngineDetails> = {
  "Intelligent Change Management": {
    name: "Intelligent Change Management",
    description:
      "Build organizational readiness and drive successful adoption of new HR initiatives with data-driven change strategies.",
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600",
    engineModuleUrl: "/changeDashboard"
  },
  "HR Transformation Roadmap Generator": {
    name: "HR Transformation Roadmap Generator",
    description:
      "Create a strategic, actionable roadmap to guide your HR digital transformation journey from start to finish.",
    imageUrl:
      "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600",
    engineModuleUrl: "/roadmapDashboard"
  },
  "Shared Service Designer": {
    name: "Shared Service Designer",
    description:
      "Design and implement efficient, standardized HR shared service models to improve service delivery and reduce costs.",
    imageUrl:
      "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600",
    engineModuleUrl: "/sharedDashboard"
  },
  "HR Technology Maturity Analysis": {
    name: "HR Technology Maturity Analysis",
    description:
      "Assess your current HR technology landscape to identify gaps, benchmark against peers, and plan for future investments.",
    imageUrl:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600",
    engineModuleUrl: "/analysisDashboard"
  },
  "HCM Vendor Fit Engine": {
    name: "HCM Vendor Fit Engine",
    description:
      "Evaluate and select the right Human Capital Management vendors that align perfectly with your business needs and goals.",
    imageUrl:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=600",
    engineModuleUrl: "/vendorDashboard"
  }
};


export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUserSession(request);
  if (!user) throw redirect("/auth");

  const companyId = user.organisationId || "default-company";

  // Fetch recommendation data - replace with your real DB fetch


  const recommendation = await fetchEngineRecomendations(companyId) || { allRankings: [] };
  const completedEngines = await completedEngine(companyId);

  // Find top recommended not completed engine:
  let topRecommendation: EngineDetails | null = null;
  const rankings = recommendation.allRankings || [];
  for (const [engineName] of rankings) {
    if (!completedEngines.includes(engineName)) {
      topRecommendation = engineDetails[engineName];
      break;
    }
  }
  console.log("top recomen \n", topRecommendation)

  return json({
    userName: user.first_name || "there",
    topRecommendation,
    allRankings: rankings as [string, number][],
    completedEngines,
  });
}

const messagesForEngines: Record<string, string> = {
  "Intelligent Change Management":
    "Focus on organizational readiness and data-driven adoption strategies.",
  "HR Transformation Roadmap Generator":
    "Build a strategic roadmap to guide your HR digital transformation.",
  "Shared Service Designer":
    "Design efficient HR shared service models to reduce costs and improve delivery.",
  "HR Technology Maturity Analysis":
    "Assess your HR tech landscape, identify gaps, and plan investments.",
  "HCM Vendor Fit Engine":
    "Select the right HCM vendors aligned with your goals.",
};

export default function RecommendationPage() {
  const navigate = useNavigate();
  const { userName, topRecommendation, allRankings, completedEngines } =
    useLoaderData<typeof loader>();

  const [currentEngine, setCurrentEngine] = useState<string | null>(
    topRecommendation?.name || null
  );
  if (!topRecommendation && allRankings.length === 0) {
    return (
      <div className="text-center py-20 text-2xl font-semibold">
        No recommendation data available.
      </div>
    );
  }

  const handleSkipEngine = (engineName: string) => {
    setCurrentEngine(engineName);
  };

  const handleGoToCheckout = () => {
    navigate("/cartDashboard");
  };
  console.log("111\n", { userName, topRecommendation, allRankings, completedEngines })
  console.log("\n!!!!\n", currentEngine)

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-slate-800 sm:text-5xl">
            Welcome back, {userName}!
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Based on your assessment, here is your personalized path
            forward.
          </p>
        </header>

        {currentEngine && (
          <section className="mb-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <SparklesIcon className="h-6 w-6 text-blue-500" />
              Your Current Recommendation
            </h2>
            <div
              className="relative rounded-2xl bg-white shadow-lg border border-slate-200/80 p-8"
              key={currentEngine}
            >
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <img
                  src={engineDetails[currentEngine].imageUrl}
                  alt={engineDetails[currentEngine].name}
                  className="rounded-xl object-cover h-60 w-full"
                />
                <div>
                  <h3 className="text-3xl font-bold text-slate-800 mb-4">
                    {engineDetails[currentEngine].name}
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {messagesForEngines[currentEngine]}
                  </p>
                  <a
                    href={engineDetails[currentEngine].engineModuleUrl}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700"
                  >
                    Start This Engine
                    <ChevronRightIcon className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-slate-700 mb-6">
            Your Full Assessment Rankings
          </h2>
          <div className="space-y-4">
            {allRankings.map(([engineName, score], idx) => {
              const isCompleted = completedEngines.includes(engineName);
              return (
                <div
                  key={engineName}
                  className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-300 ${isCompleted
                    ? "bg-green-50 border-green-200 opacity-70"
                    : "bg-white border-slate-200/80 shadow-sm"
                    }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <h4
                        className={`text-lg font-semibold ${isCompleted ? "text-slate-500" : "text-slate-800"
                          }`}
                      >
                        {engineName}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Relevance Score: <span className="font-medium">{score}</span>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCompleted && (
                      <div className="flex items-center gap-2 rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-800">
                        <CheckBadgeIcon className="h-5 w-5" />
                        Completed
                      </div>
                    )}
                    {!isCompleted && (
                      <button
                        onClick={() => handleSkipEngine(engineName)}
                        className="rounded-full border border-gray-300 px-4 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-100"
                      >
                        Try this instead
                        <ArrowRightIcon className="h-5 w-5 inline ml-1" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <button
              onClick={handleGoToCheckout}
              className="rounded-lg border border-blue-600 bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              No more engines, go to checkout
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}