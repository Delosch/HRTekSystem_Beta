import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { ClockIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { setAIStatus, hasAIStatus, getAIStatus } from "~/services/ai-status.server";
import { requireUserSession } from "~/lib/session.server";
import { generate } from "~/lib/digitalMaturity.genAi";
import { engineRecommendationList } from "~/models/engine.model";

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

  const currentStatus = getAIStatus(companyId);

  console.log(`[Loader] Company: ${companyId} Status: ${currentStatus}`);

  // If status is error, reset to pending to retry AI generation
  if (currentStatus === "error") {
    console.log(`[Loader] Status is error, resetting to pending and retrying.`);
    setAIStatus(companyId, "pending");
    // Trigger regenerate
    generate("digital_maturity", "Profiling Assessment", companyId);
  } else if (!currentStatus || currentStatus === "pending") {
    // Start generation if no status or pending
    if (!currentStatus) {
      setAIStatus(companyId, "pending");
      generate("digital_maturity", "Profiling Assessment", companyId);
      console.log(`[Loader] Starting AI generation as status was missing`);
    }
  } else {
    console.log(`[Loader] AI generation already in progress or done: ${currentStatus}`);
  }

  return json({
    companyId,
    questions: recommendationQuestions
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
    await engineRecommendationList({ user_id: user.userId, company_id: user.organisationId|| "", sortedEngines })
    return json<ActionData>({ success: true });

  } catch (error) {
    console.error("Action error:", error);
    return json<ActionData>({ success: false, error: "Failed to process recommendation" });
  }
}

// Main Component
export default function Intermediate() {
  const { companyId, questions } = useLoaderData<typeof loader>();
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

  useEffect(() => {
    if (submitted && aiReady) {
      console.log("starting to navigate")
      navigate("/dashboard", { replace: true });
    }
  }, [submitted, aiReady, navigate]);

  useEffect(() => {
    if (submitted && !aiReady) {
      const startTime = Date.now();

      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      const poll = async () => {
        try {
          const response = await fetch(`/api/ai-status?companyId=${companyId}`);
          if (response.ok) {
            const data = await response.json();
            if (data.status === 'ready') {
              setAiReady(true);
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
  }, [submitted, aiReady, companyId]);

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
                  Your Dashboard is Ready!
                </h2>
                <p className="text-gray-600 mb-6">
                  Thank you for completing the recommendation assessment.
                </p>
                <a
                  href="/dashboard"
                  className="inline-flex items-center justify-center w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Access Your Personalized Dashboard
                </a>
              </>
            ) : (
              <>
                <ClockIcon className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-pulse" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Processing Your Assessment
                </h2>
                <p className="text-gray-600 mb-6">
                  We are personalizing your dashboard based on your responses.
                  <br />
                  This typically takes around 17 seconds.
                </p>

                {/* Loading Spinner */}
                <div className="flex justify-center mb-6">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 border-t-blue-600"></div>
                </div>

                {/* Elapsed Time */}
                <div className="text-sm text-gray-500 mb-4">
                  <div className="font-medium text-blue-600">
                    Elapsed Time: {elapsed}s
                  </div>
                </div>

                {/* Safe to refresh message */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Safe to refresh:</span> Your progress is saved.
                    <br />
                    Feel free to close this tab and return later.
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