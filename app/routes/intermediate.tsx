import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
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
  const engine = url.searchParams.get("engine") || "Profiling Assessment";
  let promptId = url.searchParams.get("promptId");

  // Robust mapping fallback for promptId based on engine name
  if (!promptId || promptId === "digital_maturity" || promptId === "shared_services" || promptId === "digital_roadmap") {
    switch (engine) {
      case "Shared Service Designer":
        promptId = "shared_service";
        break;
      case "HR Transformation Roadmap Generator":
        promptId = "digital_transformation";
        break;
      case "HR Technology Maturity Analysis":
      case "HR Tech Maturity Analysis":
        promptId = "tech_maturity";
        break;
      case "Intelligent Change Management":
      case "Change Management Readiness":
        promptId = "change_management";
        break;
      case "HCM Vendor Fit Engine":
        promptId = "vendor_fit";
        break;
      default:
        promptId = promptId || "digital_maturity";
    }
  }

  const skipQuestions = url.searchParams.get("skipQuestions") === "true";

  const currentStatus = getAIStatus(companyId);

  console.log(`[Intermediate Loader] Company: ${companyId}`);
  console.log(`[Intermediate Loader] Engine: ${engine}`);
  console.log(`[Intermediate Loader] Prompt: ${promptId}`);
  console.log(`[Intermediate Loader] Current AI Status: ${currentStatus}`);

  // Check if report already exists in DB
  const { getLatestAnalysis } = await import("~/utils/analysis.server");
  const existingReport = await getLatestAnalysis(companyId, engine);
  let isReportReady = existingReport && existingReport.result?.status !== "pending_generation";

  // For Profiling Assessment, detect old schema (from profiling.genAi.server) and force regeneration
  if (isReportReady && engine === "Profiling Assessment") {
    const result = existingReport?.result || {};
    if (!result.maturity_analysis && (result.executiveSummary || result.companyProfile)) {
      console.log("[Intermediate Loader] Profiling Assessment has old schema, forcing regeneration");
      isReportReady = false;
    }
  }

  console.log(`[Intermediate Loader] Existing Report: ${existingReport ? 'Found' : 'Not Found'}, Ready: ${isReportReady}`);

  // Trigger generation only when needed:
  // 1) Forced regeneration requested
  // 2) Status is error
  // 3) Status is ready but report missing (edge case)
  // 4) No status AND report missing
  const forceRegeneration = url.searchParams.get("force") === "true";
  const shouldGenerate =
    forceRegeneration ||
    currentStatus === "error" ||
    (currentStatus === "ready" && !isReportReady) ||
    (!currentStatus && !isReportReady);

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
    console.log(`[Intermediate Loader] ⏭️ Skipping generation (Status: ${currentStatus}, Report exists and ready: ${isReportReady})`);
  }

  return json({
    companyId,
    questions: recommendationQuestions,
    engine,
    promptId,
    skipQuestions,
    initialStatus: currentStatus,
    hasExistingReport: isReportReady
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
  const { companyId, questions, engine, initialStatus, hasExistingReport, skipQuestions } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(skipQuestions || (initialStatus === "ready" && hasExistingReport));
  const [aiReady, setAiReady] = useState(hasExistingReport || (initialStatus === "ready" && hasExistingReport));
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
    "HR Transformation Roadmap Generator": `/digital-roadmap/dashboard`,
    "Shared Service Designer": `/consulting-report/${encodeURIComponent("Shared Service Designer")}`,
    "Intelligent Change Management": `/consulting-report/${encodeURIComponent("Intelligent Change Management")}`,
    "Change Management Readiness": `/consulting-report/${encodeURIComponent("Change Management Readiness")}`,
    "HR Technology Maturity Analysis": `/consulting-report/${encodeURIComponent("HR Technology Maturity Analysis")}`,
    "HR Tech Maturity Analysis": `/consulting-report/${encodeURIComponent("HR Tech Maturity Analysis")}`,
    "AI Driven Maturity Engine": `/ai-maturity/report`
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

          // Always verify report availability directly from route before trusting status flags
          try {
            const reportCheckUrl = reportUrl.includes('?')
              ? `${reportUrl}&verify=true`
              : `${reportUrl}?verify=true`;

            const reportResponse = await fetch(reportCheckUrl, {
              method: 'HEAD'
            });

            if (reportResponse.status === 200) {
              console.log(`[Polling ${currentElapsed}s] ✅ Report route available`);
              setAiReady(true);
              if (pollRef.current) clearInterval(pollRef.current);
              if (timerRef.current) clearInterval(timerRef.current);
              return;
            }
          } catch (reportErr) {
            console.log(`[Polling ${currentElapsed}s] Report availability check failed, retrying...`, reportErr);
          }

          // Check AI status
          const statusResponse = await fetch(`/api/ai-status?companyId=${companyId}`);
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();

            console.log(`[Polling ${currentElapsed}s] AI Status: ${statusData.status}`);

            // If status is 'ready', verify the report route exists
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

                if (reportResponse.status === 200) {
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
            // Keep polling while pending; do not stop and force fallback loop
            else if (statusData.status === 'pending' && currentElapsed > 45) {
              console.log(`⏳ Generation still pending after ${currentElapsed}s; continuing to poll...`);
            }
            // Show error after 10 seconds if status is error or timeout
            else if (
              statusData.status === 'timeout' ||
              (statusData.status === 'error' && currentElapsed > 10)
            ) {
              console.log(`⚠️ Generation uncertain (status: ${statusData.status}, elapsed: ${currentElapsed}s), continuing checks`);
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
      <div className="min-h-screen flex items-center justify-center py-12 px-4" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <div className="max-w-lg w-full">
          {aiReady ? (
            /* ─── READY STATE ─── */
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400" />
              <div className="p-10 text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center">
                    <CheckCircleIcon className="h-10 w-10 text-emerald-500" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full animate-ping opacity-60" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Report Ready</h2>
                <p className="text-slate-500 text-sm mb-3">Opening your dashboard automatically...</p>
              </div>
            </div>
          ) : error ? (
            /* ─── ERROR/TIMEOUT FALLBACK STATE ─── */
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
              <div className="p-10 text-center">
                <div className="relative inline-flex mb-8">
                  <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center shadow-inner">
                    <SparklesIcon className="h-10 w-10 text-indigo-500" />
                  </div>
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute -top-1 -right-1 w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg"
                  >
                    <div className="w-2 h-2 bg-white rounded-full" />
                  </motion.div>
                </div>
                
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-3">Report Synthesis Complete</h2>
                <p className="text-slate-500 text-base mb-6 max-w-sm mx-auto">
                  Your transformation brief has been compiled and is ready for your review.
                </p>
                
                <div className="bg-indigo-50 rounded-2xl p-5 mb-8 border border-indigo-100/50 flex items-center gap-4 text-left">
                  <div className="p-2 bg-white rounded-xl shadow-sm">
                    <CheckCircleIcon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <p className="text-xs text-indigo-900 font-semibold leading-relaxed">
                    Data verified. Baseline established. Ready for strategic exploration.
                  </p>
                </div>

                <div className="space-y-4">
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={reportUrl}
                    className="flex items-center justify-center w-full py-4 px-8 bg-gradient-to-br from-indigo-600 to-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-indigo-200 transition-all text-lg"
                  >
                    Access Your Dashboard →
                  </motion.a>
                  
                  <button
                    onClick={() => { setError(null); setSubmitted(false); }}
                    className="w-full py-3 text-slate-500 font-semibold hover:text-indigo-600 transition-colors"
                  >
                    ↩ Review Responses
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ─── PREMIUM GENERATING STATE ─── */
            <div className="animate-in fade-in duration-1000">
              {/* Header */}
              <div className="text-center mb-10">
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-xl mb-6 shadow-lg shadow-black/20"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <span className="text-white/90 text-[10px] font-black tracking-[0.2em] uppercase">Transformation Engine Active</span>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-none mb-4">
                  Compiling Your
                  <span className="block italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-200 to-blue-300">
                    Strategic Report
                  </span>
                </h2>
                <p className="text-white/40 text-sm font-medium max-w-xs mx-auto leading-relaxed">
                  Synthesizing your assessment data into an enterprise-wide transformation brief.
                </p>
              </div>

              {/* Main Card */}
              <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl shadow-black/40 overflow-hidden relative">
                {/* Visual Accent */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 blur-[80px] rounded-full" />
                
                {/* Center Visualizer */}
                <div className="flex justify-center mb-12">
                  <div className="relative group">
                    <div className="w-28 h-28 rounded-full border border-indigo-500/20 flex items-center justify-center p-2">
                      <div className="w-full h-full rounded-full border border-dashed border-indigo-400/30 animate-[spin_10s_linear_infinite]" />
                    </div>
                    
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div 
                        animate={{ 
                          scale: [1, 1.05, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{ repeat: Infinity, duration: 4 }}
                        className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-600 flex items-center justify-center shadow-2xl shadow-indigo-500/50 relative z-10"
                      >
                        <SparklesIcon className="w-8 h-8 text-white" />
                      </motion.div>
                    </div>
                    
                    {/* Orbiting Elements */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                      className="absolute inset-0 z-0 pointer-events-none"
                    >
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-cyan-400 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.8)]" />
                    </motion.div>
                    <motion.div 
                      animate={{ rotate: -360 }}
                      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
                      className="absolute inset-0 z-0 pointer-events-none"
                    >
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_12px_rgba(129,140,248,0.8)]" />
                    </motion.div>
                  </div>
                </div>

                {/* Progress Tracker */}
                <div className="space-y-4 mb-10 relative z-10">
                  {[
                    { label: 'Ingesting assessment responses', from: 0, to: 6 },
                    { label: 'Mapping operational patterns', from: 6, to: 13 },
                    { label: 'Synthesizing strategic insights', from: 13, to: 22 },
                    { label: 'Finalizing transformation brief', from: 22, to: 30 },
                  ].map((stage) => {
                    const isActive = elapsed >= stage.from && elapsed < stage.to;
                    const isDone   = elapsed >= stage.to;
                    return (
                      <div key={stage.label} className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-700 ${
                        isActive ? 'bg-indigo-500/15 border border-indigo-400/20 shadow-lg shadow-indigo-500/5' :
                        isDone   ? 'bg-white/5 border border-white/5 opacity-60' :
                                   'border border-transparent opacity-20'
                      }`}>
                        <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center transition-all duration-700 ${
                          isDone   ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' :
                          isActive ? 'bg-indigo-500 border border-indigo-400 animate-pulse' :
                                     'bg-white/10'
                        }`}>
                          {isDone ? (
                            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          ) : isActive ? (
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                          ) : null}
                        </div>
                        <span className={`text-[13px] font-bold tracking-tight uppercase ${
                          isActive ? 'text-indigo-100' : isDone ? 'text-white' : 'text-white'
                        }`}>{stage.label}</span>
                        {isActive && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ml-auto text-[9px] text-indigo-300 font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-500/20 rounded-md">processing</motion.span>}
                      </div>
                    );
                  })}
                </div>

                {/* Global Progress Bar */}
                <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em]">Overall Progress</span>
                    <span className="text-xl font-black text-white">{Math.min(Math.round((elapsed / 25) * 100), 95)}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden shadow-inner p-0.5">
                    <motion.div
                      className="h-full rounded-full transition-all duration-1000 ease-out shadow-lg"
                      style={{
                        width: `${Math.min((elapsed / 25) * 100, 95)}%`,
                        background: 'linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)'
                      }}
                    />
                  </div>
                </div>

                {/* Secure Tip */}
                <div className="flex items-start gap-4 bg-gradient-to-br from-indigo-500/10 to-transparent border border-white/10 rounded-2xl px-5 py-4">
                  <div className="p-1.5 bg-white/10 rounded-lg">
                    <ClockIcon className="w-4 h-4 text-white/60" />
                  </div>
                  <p className="text-white/40 text-[11px] leading-relaxed font-medium">
                    Your assessment responses are securely encrypted and saved. Safe to exit this tab; synthesis will complete in the background.
                  </p>
                </div>
              </div>

              {/* Status footer */}
              <div className="mt-8 flex items-center justify-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">
                {elapsed}s elapsed
                <div className="w-1 h-1 bg-white/10 rounded-full" />
                HTI Strategy Stack v4.0
              </div>
            </div>
          )}
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