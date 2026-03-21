import { json, redirect, type ActionFunctionArgs, type LoaderFunctionArgs } from "@remix-run/node";
import { Form, useLoaderData, useNavigation, useActionData, useNavigate } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { setAIStatus, getAIStatus } from "~/services/ai-status.server";
import { requireUserSession } from "~/lib/session.server";
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

// Recommendation Questions Data
const recommendationQuestions: Question[] = [
  {
    id: "primary_focus",
    question: "What is your organization's primary HR transformation focus for the next 12 months?",
    options: [
      { value: "change_management", text: "Building organizational change capability and readiness", engines: ["Intelligent Change Management"], points: 5 },
      { value: "digital_maturity", text: "Assessing and improving HR technology maturity", engines: ["HR Technology Maturity Analysis"], points: 5 },
      { value: "vendor_selection", text: "Evaluating and selecting HR technology vendors", engines: ["HCM Vendor Fit Engine"], points: 5 },
      { value: "service_design", text: "Designing efficient HR shared service models", engines: ["Shared Service Designer"], points: 5 },
      { value: "strategic_roadmap", text: "Creating comprehensive transformation roadmaps", engines: ["HR Transformation Roadmap Generator"], points: 5 }
    ]
  },
  {
    id: "transformation_stage",
    question: "At what stage is your organization's HR digital transformation?",
    options: [
      { value: "early_planning", text: "Early planning - defining strategy and approach", engines: ["HR Technology Maturity Analysis", "HR Transformation Roadmap Generator"], points: 4 },
      { value: "vendor_evaluation", text: "Actively evaluating technology solutions", engines: ["HCM Vendor Fit Engine", "HR Technology Maturity Analysis"], points: 4 },
      { value: "implementation", text: "Currently implementing new systems or processes", engines: ["Intelligent Change Management", "Shared Service Designer"], points: 4 },
      { value: "optimization", text: "Optimizing existing digital HR capabilities", engines: ["Shared Service Designer", "HR Technology Maturity Analysis"], points: 3 }
    ]
  },
  {
    id: "organizational_priority",
    question: "Which organizational capability needs the most attention?",
    options: [
      { value: "change_readiness", text: "Employee and leadership change readiness", engines: ["Intelligent Change Management"], points: 4 },
      { value: "service_efficiency", text: "HR service delivery efficiency and standardization", engines: ["Shared Service Designer"], points: 4 },
      { value: "technology_alignment", text: "Technology-business alignment and vendor management", engines: ["HCM Vendor Fit Engine"], points: 4 },
      { value: "strategic_planning", text: "Long-term strategic planning and roadmapping", engines: ["HR Transformation Roadmap Generator"], points: 4 }
    ]
  },
  {
    id: "consulting_preference",
    question: "What type of diagnostic approach would be most valuable?",
    options: [
      { value: "analytical_assessment", text: "Data-driven maturity assessments with benchmarking", engines: ["HR Technology Maturity Analysis"], points: 3 },
      { value: "vendor_analysis", text: "Detailed vendor fit analysis and selection support", engines: ["HCM Vendor Fit Engine"], points: 3 },
      { value: "process_design", text: "Service design frameworks and implementation guidance", engines: ["Shared Service Designer"], points: 3 },
      { value: "change_strategy", text: "Change management strategy and readiness planning", engines: ["Intelligent Change Management"], points: 3 }
    ]
  }
];

const engineList = [
  "HR Transformation Roadmap Generator",
  "HCM Vendor Fit Engine",
  "Shared Service Designer",
  "Intelligent Change Management",
  "HR Technology Maturity Analysis",
  "HR Digital Transformation"
];

function calculateScores(answers: Record<string, string>): Record<string, number> {
  const scores: Record<string, number> = {};
  engineList.forEach(engine => { scores[engine] = 0; });
  recommendationQuestions.forEach(question => {
    const answer = answers[question.id];
    if (!answer) return;
    const selectedOption = question.options.find(opt => opt.value === answer);
    if (!selectedOption) return;
    selectedOption.engines.forEach(engine => {
      if (scores[engine] !== undefined) scores[engine] += selectedOption.points;
    });
  });
  return scores;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUserSession(request);
  if (!user) throw redirect('/auth');
  const companyId = user.organisationId || "";
  const url = new URL(request.url);
  const promptIdRaw = url.searchParams.get("promptId") || "digital_maturity";
  const promptIdMap: Record<string, string> = {
    ai_maturity: "digital_maturity",
    hr_maturity: "digital_maturity",
    tech_maturity_assessment: "tech_maturity",
  };
  const promptId = promptIdMap[promptIdRaw] ?? promptIdRaw;
  const engine = url.searchParams.get("engine") || "Profiling Assessment";

  const currentStatus = getAIStatus(companyId);
  const { getLatestAnalysis } = await import("~/utils/analysis.server");
  const { getCompanyProfile } = await import("~/models/company.model.server");

  const existingReport = await getLatestAnalysis(companyId, engine);
  const companyProfile = await getCompanyProfile(companyId);
  const employeeCount = typeof companyProfile?.employee_count === 'number' ? companyProfile.employee_count : parseInt(companyProfile?.employee_count || "500");

  const shouldGenerate = !currentStatus || currentStatus === "error" || url.searchParams.get("force") === "true" || (currentStatus === "ready" && !existingReport);

  if (shouldGenerate) {
    const { generate } = await import("~/lib/processor.genAi");
    setAIStatus(companyId, "pending");
    generate(promptId, engine, companyId).catch((err) => {
      console.error("[Intermediate Loader] ❌ AI generation failed:", err);
      setAIStatus(companyId, "error");
    });
  }

  const roadmapPricing = [
    { min: 0, max: 500, price: 275000 },
    { min: 501, max: 1000, price: 550000 },
    { min: 1001, max: 2000, price: 1100000 },
    { min: 2001, max: 3000, price: 1950000 },
    { min: 3001, max: 4000, price: 2600000 },
    { min: 4001, max: 5000, price: 3250000 },
    { min: 5001, max: 7500, price: 4875000 },
    { min: 7501, max: 10000, price: 7500000 },
    { min: 10001, max: 15000, price: 11250000 },
    { min: 15001, max: 20000, price: 15000000 },
    { min: 20001, max: 30000, price: 25500000 },
    { min: 30001, max: 40000, price: 34000000 },
    { min: 40001, max: 50000, price: 42500000 },
    { min: 50001, max: 70000, price: 66500000 },
    { min: 70001, max: 100000, price: 95000000 },
    { min: 100001, max: 150000, price: 142500000 },
    { min: 150001, max: 1000000000, price: 190000000 },
  ];

  const pricingMatch = roadmapPricing.find(p => employeeCount >= p.min && employeeCount <= p.max) || roadmapPricing[0];
  const calculatedPrice = pricingMatch.price;

  const { getEnginePaymentStatus } = await import("~/models/payment.model.server");
  const isFreeEngine = engine === "Profiling Assessment";
  const paymentStatus = isFreeEngine ? { status: "paid" } : await getEnginePaymentStatus(companyId, engine);
  const isAdminUser = user.isAdmin || (user as any).role === 'ADMIN';
  const hasPaid = isAdminUser || isFreeEngine || paymentStatus.status === "paid";

  return json({
    companyId,
    questions: recommendationQuestions,
    engine,
    promptId,
    initialStatus: currentStatus,
    hasExistingReport: !!existingReport,
    hasPaid,
    paymentStatus,
    isAdmin: user.isAdmin || (user as any).role === "ADMIN" || false,
    calculatedPrice,
    employeeCount
  });
}

export async function action({ request }: ActionFunctionArgs) {
  try {
    const formData = await request.formData();
    const user = await requireUserSession(request);
    const answers: Record<string, string> = {};
    recommendationQuestions.forEach(question => {
      const value = formData.get(question.id);
      if (value && typeof value === "string") answers[question.id] = value;
    });
    if (Object.keys(answers).length !== recommendationQuestions.length) return json<ActionData>({ success: false, error: "Please answer all questions" });
    const scores = calculateScores(answers);
    const sortedEngines = Object.entries(scores).filter(([engine]) => engine !== "HR Digital Transformation").sort(([, a], [, b]) => b - a);
    await engineRecommendationList({ user_id: user.userId, company_id: user.organisationId || "", sortedEngines });
    return json<ActionData>({ success: true });
  } catch (error) {
    return json<ActionData>({ success: false, error: "Failed to process recommendation" });
  }
}

const statusMessages = [
  "Gathering Organizational Data...",
  "Running Neural Pattern Recognition...",
  "Analyzing Technology Maturity Scores...",
  "Mapping Strategic Benchmarking...",
  "Synthesizing Transformation Roadmap...",
  "Finalizing Intelligent Insights..."
];

export default function Intermediate() {
  const { companyId, questions, engine, initialStatus, hasExistingReport } = useLoaderData<typeof loader>();
  const actionData = useActionData<ActionData>();
  const navigation = useNavigation();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(initialStatus === "ready" && hasExistingReport);
  const [aiReady, setAiReady] = useState(initialStatus === "ready" && hasExistingReport);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [messageIndex, setMessageIndex] = useState(0);

  const pollRef = useRef<NodeJS.Timeout>();
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);

  // Advance pipeline steps tied to actual progress rather than a fixed 4s interval
  useEffect(() => {
    if (submitted && !aiReady) {
      const logProg = elapsed > 0 ? Math.log(elapsed + 1) / Math.log(76) : 0;
      const pct = Math.min(99, Math.round(5 + logProg * 94));
      const stepAt = [0, 20, 40, 58, 75, 90]; // % thresholds to activate each step
      const newIndex = stepAt.filter(t => pct >= t).length - 1;
      setMessageIndex(Math.min(newIndex, statusMessages.length - 1));
    }
  }, [submitted, aiReady, elapsed]);

  useEffect(() => {
    if (actionData?.success) setSubmitted(true);
    else if (actionData?.error) setError(actionData.error);
  }, [actionData]);

  useEffect(() => {
    if (submitted && aiReady) navigate("/cartDashboard", { replace: true });
  }, [submitted, aiReady, navigate]);

  useEffect(() => {
    if (submitted && !aiReady) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000)), 1000);
      const poll = async () => {
        try {
          const res = await fetch(`/api/ai-status?companyId=${companyId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'ready') setAiReady(true);
            else if (data.status === 'error' || Math.floor((Date.now() - startTimeRef.current) / 1000) > 120) setError("Processing delayed.");
          }
        } catch (e) {}
      };
      pollRef.current = setInterval(poll, 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [submitted, aiReady, companyId]);

  // Logarithmic curve: jumps to ~20% in the first second, then gradually reaches 99% at 75s
  // This makes the loading feel fast and responsive rather than trickling at 1%/s
  const logProgress = elapsed > 0 ? Math.log(elapsed + 1) / Math.log(76) : 0;
  const loadingPct = Math.min(99, Math.round(5 + logProgress * 94));
  const loadingRemaining = Math.max(0, 75 - elapsed);
  const loadingInsightIndex = Math.floor(elapsed / 8) % 4;
  const loadingInsights = [
    "Our AI cross-references 200+ HR transformation frameworks to build your report.",
    "Benchmarking your data against industry peers across 40+ dimensions.",
    "Identifying your highest-impact transformation levers automatically.",
    "Generating executive-ready insights tailored to your organization size.",
  ];

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #080818 0%, #0f0c2b 35%, #0d1440 65%, #0a0820 100%)' }}>

        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)', backgroundSize: '64px 64px' }} />

        {/* Animated glow orbs */}
        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
          transition={{ repeat: Infinity, duration: 5 }}
          className="absolute pointer-events-none"
          style={{ top: '30%', left: '30%', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)', filter: 'blur(70px)', transform: 'translate(-50%,-50%)' }}
        />
        <motion.div
          animate={{ opacity: [0.3, 0.6, 0.3], scale: [1.1, 1, 1.1] }}
          transition={{ repeat: Infinity, duration: 6, delay: 1.5 }}
          className="absolute pointer-events-none"
          style={{ top: '70%', right: '20%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)', filter: 'blur(70px)', transform: 'translate(50%,-50%)' }}
        />

        <AnimatePresence mode="wait">
          {aiReady ? (
            /* ── DONE STATE ── */
            <motion.div
              key="done"
              className="flex-1 flex flex-col items-center justify-center gap-8 px-4 relative z-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <div className="relative">
                <motion.div
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 180 }}
                  className="w-28 h-28 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 60px rgba(16,185,129,0.4)' }}
                >
                  <CheckCircleIcon className="w-14 h-14 text-white" />
                </motion.div>
                <motion.div animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0, 0.4] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute -inset-5 rounded-full border border-emerald-400/40" />
                <motion.div animate={{ scale: [1, 2.2, 1], opacity: [0.2, 0, 0.2] }} transition={{ repeat: Infinity, duration: 2.5, delay: 0.6 }} className="absolute -inset-5 rounded-full border border-emerald-400/20" />
              </div>
              <div className="text-center">
                <h2 className="text-5xl font-black text-white uppercase tracking-tight mb-3">Analysis Complete</h2>
                <p className="text-white/40 text-lg">Your strategic report is ready. Redirecting...</p>
              </div>
              <motion.button
                onClick={() => navigate("/cartDashboard")}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className="px-10 py-4 font-black text-lg uppercase tracking-widest rounded-2xl text-white"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 20px 60px rgba(16,185,129,0.25)' }}
              >
                View Report →
              </motion.button>
            </motion.div>
          ) : (
            /* ── LOADING STATE ── */
            <motion.div
              key="loading"
              className="flex-1 flex flex-col relative z-10"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-8 py-5">
                <div className="flex items-center gap-3">
                  <img src="/logo_icon_final.png" alt="HRTek" className="w-7 h-7 object-contain opacity-70" />
                  <span className="text-white/40 text-xs font-black uppercase tracking-[0.3em]">HR TEK SYSTEMS</span>
                </div>
                <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
                  <motion.div
                    animate={{ opacity: [1, 0.15, 1], scale: [1, 1.6, 1] }}
                    transition={{ repeat: Infinity, duration: 1.1 }}
                    className="w-1.5 h-1.5 rounded-full bg-emerald-400"
                    style={{ boxShadow: '0 0 6px rgba(52,211,153,0.9)' }}
                  />
                  <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">AI Active</span>
                </div>
              </div>

              {/* Engine name */}
              <motion.div
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-center pt-4 pb-8"
              >
                <p className="text-indigo-400/50 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Processing Engine</p>
                <h1 className="text-4xl md:text-5xl font-black text-white">{engine}</h1>
              </motion.div>

              {/* Three-column layout */}
              <div className="flex-1 flex items-center justify-center px-8 gap-10 max-w-5xl mx-auto w-full">

                {/* LEFT: Analysis Pipeline */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                  className="w-52 space-y-1 hidden lg:block"
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-4">Analysis Pipeline</p>
                  {statusMessages.map((msg, i) => {
                    const isDone = i < messageIndex;
                    const isActive = i === messageIndex;
                    return (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isDone ? 0.3 : isActive ? 1 : 0.18 }}
                        className="flex items-center gap-3 py-2 px-3 rounded-xl"
                        style={isActive ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)' } : {}}
                      >
                        <div className="w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center">
                          {isDone ? (
                            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none">
                              <circle cx="10" cy="10" r="9" stroke="#10b981" strokeWidth="1.5" />
                              <path d="M6 10l3 3 5-5" stroke="#10b981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : isActive ? (
                            <motion.div
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ repeat: Infinity, duration: 0.9 }}
                              className="w-2 h-2 rounded-full bg-indigo-400"
                              style={{ boxShadow: '0 0 6px rgba(99,102,241,0.8)' }}
                            />
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-white/15" />
                          )}
                        </div>
                        <span className={`text-xs font-semibold leading-tight ${isActive ? 'text-white' : isDone ? 'text-white/30 line-through' : 'text-white/20'}`}>
                          {msg.replace("...", "")}
                        </span>
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* CENTER: Circular progress */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }}
                  className="relative flex-shrink-0"
                >
                  {/* Glow behind circle */}
                  <div className="absolute inset-0 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 65%)', filter: 'blur(40px)', transform: 'scale(1.5)' }} />

                  <div className="relative w-72 h-72">
                    <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 240 240">
                      {/* Decorative outer ring */}
                      <circle cx="120" cy="120" r="112" fill="none" stroke="rgba(99,102,241,0.06)" strokeWidth="1" strokeDasharray="3 9" />
                      {/* Track */}
                      <circle cx="120" cy="120" r="100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="14" />
                      {/* Inner ring */}
                      <circle cx="120" cy="120" r="82" fill="none" stroke="rgba(99,102,241,0.04)" strokeWidth="1" />
                      <defs>
                        <linearGradient id="pGrad" gradientUnits="userSpaceOnUse" x1="20" y1="120" x2="220" y2="120">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="50%" stopColor="#a855f7" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                      <motion.circle
                        cx="120" cy="120" r="100"
                        fill="none"
                        stroke="url(#pGrad)"
                        strokeWidth="14"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 100}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 100 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 100 * (1 - loadingPct / 100) }}
                        transition={{ duration: 0.8, ease: "easeInOut" }}
                        style={{ filter: 'drop-shadow(0 0 12px rgba(99,102,241,0.8))' }}
                      />
                    </svg>

                    {/* Orbiting dot */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      <div
                        className="absolute w-4 h-4 rounded-full"
                        style={{
                          top: '50%', left: '50%',
                          transform: 'translate(-50%, -120px)',
                          background: 'radial-gradient(circle, #fff 20%, #a855f7 80%)',
                          boxShadow: '0 0 18px rgba(168,85,247,0.9), 0 0 6px rgba(255,255,255,0.8)'
                        }}
                      />
                    </motion.div>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        key={loadingPct}
                        initial={{ scale: 0.9, opacity: 0.6 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-baseline gap-1"
                      >
                        <span
                          className="text-8xl font-black text-white tabular-nums leading-none"
                          style={{ textShadow: '0 0 50px rgba(99,102,241,0.6)' }}
                        >
                          {loadingPct}
                        </span>
                        <span className="text-3xl font-black text-white/25 mb-1">%</span>
                      </motion.div>
                      <motion.p
                        animate={{ opacity: [0.3, 0.7, 0.3] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-[9px] font-black uppercase tracking-[0.35em] text-indigo-300/50 mt-1"
                      >
                        Processing
                      </motion.p>
                    </div>
                  </div>
                </motion.div>

                {/* RIGHT: Stats */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                  className="w-48 space-y-4 hidden lg:flex flex-col justify-center"
                >
                  <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25 mb-2">Elapsed Time</p>
                    <p className="text-3xl font-black text-white tabular-nums">
                      {String(Math.floor(elapsed / 60)).padStart(2, "0")}
                      <motion.span animate={{ opacity: [1, 0.1, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="text-white/20">:</motion.span>
                      {String(elapsed % 60).padStart(2, "0")}
                    </p>
                  </div>

                  <div className="rounded-2xl p-5" style={{ background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.15)' }}>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300/40 mb-2">Est. Remaining</p>
                    <p className="text-3xl font-black text-indigo-400 tabular-nums">~{loadingRemaining}s</p>
                  </div>

                  <div className="rounded-2xl p-5 space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/25">Progress Steps</p>
                    <div className="flex gap-1.5 flex-wrap">
                      {statusMessages.map((_, i) => (
                        <div
                          key={i}
                          className="rounded-full transition-all duration-500"
                          style={{
                            width: i === messageIndex ? '20px' : '7px',
                            height: '7px',
                            background: i < messageIndex ? '#10b981' : i === messageIndex ? 'linear-gradient(90deg, #6366f1, #a855f7)' : 'rgba(255,255,255,0.10)',
                            boxShadow: i === messageIndex ? '0 0 8px rgba(99,102,241,0.7)' : 'none'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Bottom section */}
              <div className="px-8 pb-6 max-w-3xl mx-auto w-full space-y-4 mt-6">

                {/* Current step name */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={messageIndex}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    className="flex items-center gap-2 justify-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.6, 1] }}
                      transition={{ repeat: Infinity, duration: 0.9 }}
                      className="w-1.5 h-1.5 rounded-full bg-indigo-400"
                      style={{ boxShadow: '0 0 6px rgba(99,102,241,0.8)' }}
                    />
                    <span className="text-sm font-bold text-white/70">{statusMessages[messageIndex].replace("...", "")}</span>
                    <motion.span
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="text-[9px] font-black uppercase tracking-widest text-emerald-500 ml-1"
                    >
                      ● Live
                    </motion.span>
                  </motion.div>
                </AnimatePresence>

                {/* Thin glowing progress bar */}
                <div className="w-full h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                  <motion.div
                    initial={{ width: "5%" }}
                    animate={{ width: `${loadingPct}%` }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7, #ec4899)', boxShadow: '0 0 8px rgba(99,102,241,0.6)' }}
                  >
                    <motion.div
                      animate={{ x: ["0%", "100%"] }}
                      transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
                      className="absolute inset-0"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)' }}
                    />
                  </motion.div>
                </div>

                {/* Rotating insight */}
                <div className="flex items-start gap-2 justify-center">
                  <SparklesIcon className="w-3 h-3 flex-shrink-0 mt-0.5 text-indigo-400/40" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingInsightIndex}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.6 }}
                      className="text-[11px] font-medium text-white/25 leading-relaxed text-center max-w-md"
                    >
                      {loadingInsights[loadingInsightIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>

              {/* Footer */}
              <div className="pb-5 text-center">
                <p className="text-[10px] font-medium text-white/15 uppercase tracking-[0.25em]">Secure · AI-Synthesized · Confidential</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  const allAnswered = questions.every(q => answers[q.id]);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Form method="post" className="bg-white rounded-xl shadow-lg border border-gray-200">
          <div className="px-8 py-6 border-b">
            <h1 className="text-2xl font-bold italic uppercase">Engine Recommendation</h1>
          </div>
          <div className="p-8 space-y-10">
            {questions.map(q => (
              <div key={q.id}>
                <h3 className="text-lg font-bold mb-4">{q.question}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {q.options.map(o => (
                    <label key={o.value} className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer ${answers[q.id] === o.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                      <input type="radio" name={q.id} value={o.value} checked={answers[q.id] === o.value} onChange={e => setAnswers(p => ({...p, [q.id]: e.target.value}))} className="mt-1" required />
                      <span>{o.text}</span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="p-8 border-t">
            <button type="submit" disabled={!allAnswered || navigation.state === "submitting"} className={`w-full py-4 rounded-lg font-bold text-lg ${allAnswered ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-500'}`}>
              {navigation.state === "submitting" ? 'Analyzing...' : 'Complete Assessment'}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
