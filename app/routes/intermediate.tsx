import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { ClockIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { setAIStatus, hasAIStatus, getAIStatus } from "~/services/ai-status.server";
import { requireUserSession } from "~/lib/session.server";
import { generate } from "~/lib/digitalMaturity.genAi";
import { engineRecommendationList } from "~/models/engine.model.server";

// Types
interface Question {
  id: string;
  question: string;
  options: Array<{
    value: string;
    text: string;
    engines: string[];
    points: number;
  }>;
}

interface ActionData {
  success: boolean;
  error?: string;
}

// Recommendation Questions Data (Keep as is)
const recommendationQuestions: Question[] = [
  // ... your questions data ...
  {
    id: "primary_focus",
    question: "What is your organization's primary HR transformation focus for the next 12 months?",
    options: [
      {
        value: "change_management",
        text: "Building organizational change capability and readiness",
        engines: ["Intelligent Change Management"],
        points: 5
      },
      {
        value: "digital_maturity",
        text: "Assessing and improving HR technology maturity",
        engines: ["HR Technology Maturity Analysis"],
        points: 5
      },
      {
        value: "vendor_selection",
        text: "Evaluating and selecting HR technology vendors",
        engines: ["HCM Vendor Fit Engine"],
        points: 5
      },
      {
        value: "service_design",
        text: "Designing efficient HR shared service models",
        engines: ["Shared Service Designer"],
        points: 5
      },
      {
        value: "strategic_roadmap",
        text: "Creating comprehensive transformation roadmaps",
        engines: ["HR Transformation Roadmap Generator"],
        points: 5
      }
    ]
  },
  {
    id: "transformation_stage",
    question: "At what stage is your organization's HR digital transformation?",
    options: [
      {
        value: "early_planning",
        text: "Early planning - defining strategy and approach",
        engines: ["HR Technology Maturity Analysis", "HR Transformation Roadmap Generator"],
        points: 4
      },
      {
        value: "vendor_evaluation",
        text: "Actively evaluating technology solutions",
        engines: ["HCM Vendor Fit Engine", "HR Technology Maturity Analysis"],
        points: 4
      },
      {
        value: "implementation",
        text: "Currently implementing new systems or processes",
        engines: ["Intelligent Change Management", "Shared Service Designer"],
        points: 4
      },
      {
        value: "optimization",
        text: "Optimizing existing digital HR capabilities",
        engines: ["Shared Service Designer", "HR Technology Maturity Analysis"],
        points: 3
      }
    ]
  },
  {
    id: "organizational_priority",
    question: "Which organizational capability needs the most attention?",
    options: [
      {
        value: "change_readiness",
        text: "Employee and leadership change readiness",
        engines: ["Intelligent Change Management"],
        points: 4
      },
      {
        value: "service_efficiency",
        text: "HR service delivery efficiency and standardization",
        engines: ["Shared Service Designer"],
        points: 4
      },
      {
        value: "technology_alignment",
        text: "Technology-business alignment and vendor management",
        engines: ["HCM Vendor Fit Engine"],
        points: 4
      },
      {
        value: "strategic_planning",
        text: "Long-term strategic planning and roadmapping",
        engines: ["HR Transformation Roadmap Generator"],
        points: 4
      }
    ]
  },
  {
    id: "consulting_preference",
    question: "What type of diagnostic approach would be most valuable?",
    options: [
      {
        value: "analytical_assessment",
        text: "Data-driven maturity assessments with benchmarking",
        engines: ["HR Technology Maturity Analysis"],
        points: 3
      },
      {
        value: "vendor_analysis",
        text: "Detailed vendor fit analysis and selection support",
        engines: ["HCM Vendor Fit Engine"],
        points: 3
      },
      {
        value: "process_design",
        text: "Service design frameworks and implementation guidance",
        engines: ["Shared Service Designer"],
        points: 3
      },
      {
        value: "change_strategy",
        text: "Change management strategy and readiness planning",
        engines: ["Intelligent Change Management"],
        points: 3
      }
    ]
  }
];

// Engine List (Keep as is)
const engineList = [
  // ... your engine list ...
  "HR Transformation Roadmap Generator",
  "HCM Vendor Fit Engine",
  "Shared Service Designer",
  "Intelligent Change Management",
  "HR Technology Maturity Analysis",
  "HR Digital Transformation"
];

// Backend scoring function (Keep as is)
function calculateScores(answers: Record<string, string>): Record<string, number> {
  // ... your calculateScores logic ...
  const scores: Record<string, number> = {};

  // Initialize scores
  engineList.forEach(engine => {
    scores[engine] = 0;
  });

  // Calculate scores based on answers
  (recommendationQuestions || []).forEach(question => {
    const answer = answers[question.id];
    if (!answer) return;

    const selectedOption = (question.options || []).find(opt => opt.value === answer);
    if (!selectedOption) return;

    (selectedOption.engines || []).forEach(engine => {
      if (scores[engine] !== undefined) {
        scores[engine] += selectedOption.points;
      }
    });
  });

  return scores;
}

// Loader: Start AI report process
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUserSession(request);
  if (!user) throw redirect('/auth');
  const companyId = user.organisationId || "";

  const url = new URL(request.url);
  const promptId = url.searchParams.get("promptId") || "digital_maturity";
  const engine = url.searchParams.get("engine") || "Profiling Assessment";

  const currentStatus = getAIStatus(companyId);

  console.log(`[Intermediate Loader] Company: ${companyId}`);
  console.log(`[Intermediate Loader] Engine: ${engine}`);
  console.log(`[Intermediate Loader] Prompt: ${promptId}`);
  console.log(`[Intermediate Loader] Current AI Status: ${currentStatus}`);

  // Check if report already exists in DB
  const { getLatestAnalysis } = await import("~/utils/analysis.server");
  const existingReport = await getLatestAnalysis(companyId, engine);

  console.log(`[Intermediate Loader] Existing Report: ${existingReport ? 'Found' : 'Not Found'}`);

  // Trigger generation if:
  // 1. No status OR status is 'error' OR
  // 2. Status is 'ready' but no report exists (edge case fix) OR
  // 3. Forced regeneration requested
  const shouldGenerate = !currentStatus ||
    currentStatus === "error" ||
    url.searchParams.get("force") === "true" ||
    (currentStatus === "ready" && !existingReport);

  if (shouldGenerate) {
    const { generate } = await import("~/lib/processor.genAi");
    setAIStatus(companyId, "pending");

    console.log(`[Intermediate Loader] 🚀 Triggering AI generation for ${engine}`);

    // Fire and forget - generation happens in background
    generate(promptId, engine, companyId).catch((err) => {
      console.error("[Intermediate Loader] ❌ AI generation failed:", err);
      setAIStatus(companyId, "error");
    });
  } else {
    console.log(`[Intermediate Loader] ⏭️ Skipping generation (Status: ${currentStatus}, Report exists: ${!!existingReport})`);
  }

  return json({
    companyId,
    questions: recommendationQuestions,
    engine,
    promptId,
    initialStatus: currentStatus,
    hasExistingReport: !!existingReport
  });
}

// Action: Process form submission and calculate scores (Keep as is)
export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const user = await requireUserSession(request);

    if (!user) {
      // This will redirect to your login page if the user is not authenticated
      // requireUserSession should handle this, but it's good practice to check
      return json<ActionData>({ success: false, error: "User not authenticated" });
    }
    const answers: Record<string, string> = {};
    (recommendationQuestions || []).forEach(question => {
      const value = formData.get(question.id);
      if (value && typeof value === "string") {
        answers[question.id] = value;
      }
    });

    if (Object.keys(answers).length !== recommendationQuestions.length) {
      return json<ActionData>({ success: false, error: "Please answer all questions" });
    }

    const scores = calculateScores(answers);

    const sortedEngines = Object.entries(scores)
      .filter(([engine]) => engine !== "HR Digital Transformation")
      .sort(([, scoreA], [, scoreB]) => scoreB - scoreA);

    const topRecommendation = sortedEngines[0]?.[0] || "HR Transformation Roadmap Generator";

    console.log("=== RECOMMENDATION ANALYSIS ===");
    console.log("Company ID:", user.organisationId);
    console.log("User Responses:", answers);
    console.log("Engine Scores:", scores);
    console.log("Top Recommendation:", topRecommendation);
    console.log("All Rankings:", sortedEngines);
    console.log("Timestamp:", new Date().toISOString());
    console.log("================================");
    // lets save the all ranking
    await engineRecommendationList({ user_id: user.userId, company_id: user.organisationId || "", sortedEngines })
    return json<ActionData>({ success: true });

  } catch (error) {
    console.error("Action error:", error);
    return json<ActionData>({ success: false, error: "Failed to process recommendation" });
  }
}

// Main Component
export default function Intermediate() {
  const { companyId, questions, engine } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const pollRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();

  const allAnswered = questions.every(q => answers[q.id]);
  const isSubmitting = navigation.state === "submitting";

  useEffect(() => {
    if (actionData?.success) {
      setSubmitted(true);
      setError(null);
    } else if (actionData?.error) {
      setError(actionData.error);
      setSubmitted(false);
    }
  }, [actionData]);

  const reportRouteMap: Record<string, string> = {
    "HCM Vendor Fit Engine": `/fit/report/${encodeURIComponent("HCM Vendor Fit Engine")}`,
    "Digital Maturity Assessment": `/consulting-report/${encodeURIComponent("Digital Maturity Assessment")}`,
    "Profiling Assessment": `/consulting-report/${encodeURIComponent("Profiling Assessment")}`,
    "HR Transformation Roadmap Generator": `/consulting-report/${encodeURIComponent("HR Transformation Roadmap Generator")}`,
    "Shared Service Designer": `/consulting-report/${encodeURIComponent("Shared Service Designer")}`,
    "Intelligent Change Management": `/consulting-report/${encodeURIComponent("Intelligent Change Management")}`,
    "Change Management Readiness": `/consulting-report/${encodeURIComponent("Change Management Readiness")}`,
    "HR Technology Maturity Analysis": `/consulting-report/${encodeURIComponent("HR Technology Maturity Analysis")}`,
    "HR Tech Maturity Analysis": `/consulting-report/${encodeURIComponent("HR Tech Maturity Analysis")}`
  };

  const reportUrl = reportRouteMap[engine] || `/consulting-report/${encodeURIComponent(engine)}`;

  useEffect(() => {
    if (submitted && aiReady) {
      console.log("starting to navigate to report:", reportUrl);
      navigate(reportUrl, { replace: true });
    }
  }, [submitted, aiReady, navigate, reportUrl]);

  useEffect(() => {
    if (submitted && !aiReady) {
      const startTime = Date.now();

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      const poll = async () => {
        try {
          const currentElapsed = Math.floor((Date.now() - startTime) / 1000);

          // Check AI status
          const statusResponse = await fetch(`/api/ai-status?companyId=${companyId}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();

            console.log(`[Polling ${currentElapsed}s] AI Status: ${statusData.status}`);

            // If status is 'ready', verify the report actually exists in DB
            if (statusData.status === 'ready') {
              console.log(`[Polling ${currentElapsed}s] Status is 'ready', verifying report in DB...`);

              try {
                // Try to fetch the actual report to confirm it exists
                const reportCheckUrl = reportUrl.includes('?')
                  ? `${reportUrl}&verify=true`
                  : `${reportUrl}?verify=true`;

                const reportResponse = await fetch(reportCheckUrl, {
                  method: 'HEAD' // Just check if it exists, don't load full content
                });

                if (reportResponse.ok || reportResponse.status === 200) {
                  console.log(`[Polling ${currentElapsed}s] ✅ Report confirmed in database!`);
                  setAiReady(true);
                  if (pollRef.current) clearInterval(pollRef.current);
                  if (timerRef.current) clearInterval(timerRef.current);
                } else {
                  console.log(`[Polling ${currentElapsed}s] ⚠️ Status 'ready' but report not found (${reportResponse.status}), continuing to poll...`);
                }
              } catch (reportErr) {
                console.log(`[Polling ${currentElapsed}s] ⚠️ Error checking report, will retry:`, reportErr);
              }
            }
            // Auto-redirect after 25 seconds even if still pending
            else if (statusData.status === 'pending' && currentElapsed > 25) {
              console.log(`⚠️ Generation slow (elapsed: ${currentElapsed}s), auto-redirecting to report`);
              navigate(reportUrl, { replace: true });
              if (pollRef.current) clearInterval(pollRef.current);
              if (timerRef.current) clearInterval(timerRef.current);
            }
            // Show error after 10 seconds if status is error or timeout
            else if (
              statusData.status === 'timeout' ||
              (statusData.status === 'error' && currentElapsed > 10)
            ) {
              console.log(`⚠️ Generation failed (status: ${statusData.status}, elapsed: ${currentElapsed}s), showing error UI`);
              setError('AI generation encountered an issue. You can proceed to dashboard.');
              if (pollRef.current) clearInterval(pollRef.current);
              if (timerRef.current) clearInterval(timerRef.current);
            }
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      };

      // Poll immediately and then set interval
      poll();
      pollRef.current = setInterval(poll, 2000);
    }

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submitted, aiReady, companyId, reportUrl, navigate]);

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    setError(null);
  };

  // Loading/Success State
  if (submitted) {
    // ... your submitted UI ...
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 max-w-lg w-full p-8">
          <div className="text-center">
            {aiReady ? (
              <>
                <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Detailed Report is Ready!
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for completing the assessment. Your personalized analysis has been generated.
                </p>
                <a
                  href={reportUrl}
                  className="inline-flex items-center justify-center w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  View Your Detailed Analysis Report
                </a>
              </>
            ) : error ? (
              <>
                {/* ✅ ERROR STATE UI */}
                <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  AI Analysis Delayed
                </h2>
                <p className="text-gray-600 mb-6">
                  {error}
                </p>

                <div className="space-y-3">
                  <a
                    href={reportUrl}
                    className="inline-flex items-center justify-center w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Proceed to Report Anyway
                  </a>
                  <button
                    onClick={() => {
                      setError(null);
                      setSubmitted(false);
                    }}
                    className="inline-flex items-center justify-center w-full py-3 px-6 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-300 hover:bg-gray-50 transition-all duration-200"
                  >
                    Retry Assessment
                  </button>
                </div>

                <div className="mt-4 text-xs text-gray-500">
                  Your responses have been saved. The AI analysis will continue in the background.
                </div>
              </>
            ) : (
              <>
                <ClockIcon className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Generating Your AI-Powered Report
                </h2>
                <p className="text-gray-600 mb-6">
                  Our AI is analyzing your responses to create personalized insights.
                  <br />
                  This typically takes 15-30 seconds.
                </p>

                {/* Progress Stages */}
                <div className="mb-6">
                  <div className="flex justify-between text-xs text-gray-500 mb-2">
                    <span className={elapsed < 5 ? "text-blue-600 font-semibold" : ""}>
                      {elapsed < 5 ? "🔄 Initializing..." : "✓ Initialized"}
                    </span>
                    <span className={elapsed >= 5 && elapsed < 12 ? "text-blue-600 font-semibold" : elapsed >= 12 ? "text-gray-700" : ""}>
                      {elapsed < 5 ? "⏳ Analyzing" : elapsed < 12 ? "🔄 Analyzing..." : "✓ Analyzed"}
                    </span>
                    <span className={elapsed >= 12 && elapsed < 20 ? "text-blue-600 font-semibold" : elapsed >= 20 ? "text-gray-700" : ""}>
                      {elapsed < 12 ? "⏳ Generating" : elapsed < 20 ? "🔄 Generating..." : "✓ Generated"}
                    </span>
                    <span className={elapsed >= 20 ? "text-blue-600 font-semibold" : ""}>
                      {elapsed < 20 ? "⏳ Finalizing" : "🔄 Finalizing..."}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${Math.min((elapsed / 25) * 100, 95)}%` }}
                    />
                  </div>
                </div>

                {/* Current Activity */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-sm text-blue-900">
                    <span className="font-semibold">
                      {elapsed < 5 && "🔍 Loading your assessment data..."}
                      {elapsed >= 5 && elapsed < 12 && "🧠 AI is analyzing your responses..."}
                      {elapsed >= 12 && elapsed < 20 && "📊 Generating personalized insights..."}
                      {elapsed >= 20 && "✨ Finalizing your report..."}
                    </span>
                  </p>
                </div>

                {/* Loading Spinner */}
                <div className="flex justify-center mb-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                </div>

                {/* Elapsed Time */}
                <div className="text-sm text-gray-500 mb-4">
                  <div className="font-medium text-blue-600">
                    Elapsed Time: {elapsed}s {elapsed > 15 && `• Est. ${Math.max(0, 25 - elapsed)}s remaining`}
                  </div>
                </div>

                {/* Safe to refresh message */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    <span className="font-semibold">💡 Tip:</span> Your progress is automatically saved.
                    <br />
                    Feel free to close this tab and check back later.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Form
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Header */}
          <div className="px-8 py-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <SparklesIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Engine Recommendation Assessment
                </h1>
                <p className="text-gray-600 mt-1">
                  Help us identify the most relevant diagnostic tools for your organization
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="px-8 py-4 bg-gray-50">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Progress</span>
              <span>{Object.keys(answers).length} of {questions.length} questions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>

          {/* Error Display */}
          {actionData?.error && (
            <div className="mx-8 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-medium">{actionData.error}</p>
            </div>
          )}

          {/* Form */}
          <Form method="post" className="px-8 py-6">
            <div className="space-y-8">
              {questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {question.question}
                      </h3>
                      <div className="space-y-3">
                        {question.options.map((option) => (
                          <label
                            key={option.value}
                            className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${answers[question.id] === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            <input
                              type="radio"
                              name={question.id}
                              value={option.value}
                              checked={answers[question.id] === option.value}
                              onChange={(e) => handleAnswer(question.id, e.target.value)}
                              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                              required
                            />
                            <span className="text-gray-700 leading-relaxed">
                              {option.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-12 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={!allAnswered || isSubmitting}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${allAnswered && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Processing Your Assessment...
                  </div>
                ) : (
                  'Submit and Personalize Dashboard'
                )}
              </button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}