import { useState, useRef, useEffect } from 'react';
import { json, type LoaderFunctionArgs, redirect, type LinksFunction, type MetaFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { getEnhancedUser } from "~/utils/user.server";
import { AnimatePresence, motion } from "framer-motion";

import { DomainSection } from "~/components/SharedServicesEngine/components/DomainSection";
import { ExecutiveSummary } from "~/components/SharedServicesEngine/components/ExecutiveSummary";
import { ExecutiveAdvisory } from "~/components/SharedServicesEngine/components/ExecutiveAdvisory";
import { assessmentData } from "~/components/SharedServicesEngine/data/assessment-data";
import { calculateSSTI } from "~/components/SharedServicesEngine/utils/calculations";
import { SectionInsightPanel } from "~/components/assessment/shared/SectionInsightPanel";
import {
    Menu, X, ArrowLeft, Save, Sparkles, Loader2, CheckCircle2, Circle,
    ChevronRight, BarChart3, Target, FileText
} from 'lucide-react';
import sharedServicesStyles from "~/styles/shared-services-engine.css?url";
import { findEngineData } from "~/models/engine.model.server";

import { generateHTIAdvisory } from "~/lib/hti.deepseek";
import { saveAdvisoryReport, type HTIAdvisoryContent } from "~/models/hti.model.server";
import { createOrUpdateEngineStorage } from "~/models/engine.model.server";

export const meta: MetaFunction = () => {
    return [
        { title: "Shared Services Assessment | HRTek System" },
        { name: "description", content: "Assess your enterprise shared services maturity." },
    ];
};

export const links: LinksFunction = () => [
    { rel: "stylesheet", href: sharedServicesStyles },
];

export async function action({ request }: ActionFunctionArgs) {
    const user = await getEnhancedUser(request);
    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    const formData = await request.formData();
    const answersStr = formData.get("answers") as string;
    const answers = JSON.parse(answersStr);

    const sstiResult = calculateSSTI(answers);

    const aggregatedData = {
        companyId: user.companyId || user.id,
        timestamp: new Date().toISOString(),
        engines: {
            sharedServices: {
                engineName: "Shared Service Designer",
                progress: sstiResult.isComplete ? 100 : Math.round((sstiResult.totalAnswered / sstiResult.totalQuestions) * 100),
                responses: answers,
                scores: sstiResult.domainScores.reduce((acc: any, ds: any) => ({ ...acc, [ds.domainId]: ds.score }), {}),
                aiAnalysis: sstiResult
            }
        },
        completedEnginesCount: 1,
        totalEngines: 1
    };

    try {
        await createOrUpdateEngineStorage({
            company_id: user.organisationId,
            user_id: user.id || user.userId,
            engine_name: "Shared Service Designer",
            country: user.country_iso || "Global",
            progress: sstiResult.isComplete ? 100 : Math.round((sstiResult.totalAnswered / sstiResult.totalQuestions) * 100),
            responses: answers
        });

        const advisory = await generateHTIAdvisory(aggregatedData as any);

        await saveAdvisoryReport(
            user.organisationId,
            user.id || user.userId,
            advisory,
            aggregatedData as any
        );

        return json({ success: true, advisory });
    } catch (error) {
        console.error("AI Generation Error:", error);
        return json({ error: "Failed to generate AI report" }, { status: 500 });
    }
}

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getEnhancedUser(request);
    if (!user) return redirect("/login");

    const engineData = await findEngineData(user.organisationId, "Shared Service Designer");
    const initialAnswers = engineData?.responses || {};

    return json({ user, initialAnswers });
}

export default function SharedServicesAssessment() {
    const { initialAnswers } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const fetcher = useFetcher<any>();
    const [answers, setAnswers] = useState<Record<number, number>>(initialAnswers);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showExecutiveSummary, setShowExecutiveSummary] = useState(false);
    const [showAIReport, setShowAIReport] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [currentDomain, setCurrentDomain] = useState(0);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => { setMounted(true); }, []);

    const handleAnswerChange = (questionId: number, value: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const sstiResult = calculateSSTI(answers);
    const progress = sstiResult.isComplete
        ? 100
        : Math.round((sstiResult.totalAnswered / sstiResult.totalQuestions) * 100);

    const handleSave = () => {
        fetcher.submit({ answers: JSON.stringify(answers) }, { method: "post" });
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1500);
    };

    const generateReport = () => {
        fetcher.submit({ answers: JSON.stringify(answers) }, { method: "post" });
    };

    const isGenerating = fetcher.state !== "idle";
    const aiAdvisory = fetcher.data?.advisory as HTIAdvisoryContent;

    const scrollToDomain = (domainId: number) => {
        setCurrentDomain(domainId - 1);
        if (showExecutiveSummary || showAIReport) {
            setShowExecutiveSummary(false);
            setShowAIReport(false);
        }
        setTimeout(() => {
            const element = scrollRef.current?.querySelector(`#domain-${domainId}`);
            if (element) element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">

            {/* ── Toast ── */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm z-[200] font-semibold flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Progress Saved
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* ═══════════════════════════════════
                SIDEBAR
            ═══════════════════════════════════ */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out border-r border-slate-200 shadow-2xl
                lg:relative lg:translate-x-0 lg:shadow-none
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">

                    {/* Logo */}
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/hrtek_logo.png" alt="HRTek" className="h-9 w-auto object-contain" />
                            <div className="h-8 w-px bg-slate-200" />
                            <div>
                                <h2 className="font-bold text-lg tracking-tight text-slate-900 leading-tight">Shared</h2>
                                <p className="text-xs text-indigo-600 uppercase tracking-wider font-bold">Services</p>
                            </div>
                        </div>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1.5 hover:bg-slate-100 rounded-lg">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Progress Widget */}
                    <div className="p-6">
                        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-2xl p-5 border border-slate-200/80">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-sm text-slate-500 font-medium">Completion</span>
                                <span className="text-2xl font-black text-indigo-600">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    className="bg-gradient-to-r from-indigo-600 to-blue-500 h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-medium">Questions Answered</span>
                                <span className="text-xs font-mono text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm font-bold">
                                    {sstiResult.totalAnswered}/{sstiResult.totalQuestions}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Domain navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-3">
                        <div className="px-3 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Assessment Domains
                        </div>
                        <nav className="space-y-1">
                            {assessmentData.map((domain, idx) => {
                                const answered = domain.questions.filter((q: any) => answers[q.id] > 0).length;
                                const isComplete = answered === domain.questions.length;
                                const isActive = currentDomain === idx;
                                const isStarted = answered > 0;

                                return (
                                    <button
                                        key={domain.id}
                                        onClick={() => scrollToDomain(domain.id)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm transition-all ${isActive
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                            : isStarted
                                                ? "bg-indigo-50 text-indigo-900 font-medium hover:bg-indigo-100"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isComplete
                                                ? <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white" : "text-emerald-500"}`} />
                                                : <Circle className={`w-4 h-4 flex-shrink-0 ${isActive ? "text-white/60" : isStarted ? "text-indigo-400" : "text-slate-300"}`} />
                                            }
                                            <span className="text-left text-[11px] font-bold uppercase tracking-wider leading-tight">
                                                {domain.name}
                                            </span>
                                        </div>
                                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60 flex-shrink-0" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Footer */}
                    <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                                <Target className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by</p>
                                <p className="text-xs font-bold text-slate-700">HRTek Intelligence</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════ */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">

                {/* ── Topbar ── */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="hidden lg:flex items-center gap-3">
                            <button
                                onClick={() => {
                                    if (showAIReport) setShowAIReport(false);
                                    else if (showExecutiveSummary) setShowExecutiveSummary(false);
                                    else navigate("/sharedDashboard");
                                }}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                            </button>
                            <div className="h-6 w-px bg-slate-200" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                Shared Services Engine
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {sstiResult.totalAnswered} of {sstiResult.totalQuestions} questions answered
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Progress badge */}
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-600">{progress}% Complete</span>
                        </div>

                        {/* Maturity Forecast */}
                        {!showAIReport && (
                            <button
                                onClick={() => setShowExecutiveSummary(s => !s)}
                                disabled={!sstiResult.isComplete}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm disabled:opacity-50 ${sstiResult.isComplete
                                    ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                    }`}
                            >
                                <FileText className="w-3.5 h-3.5" />
                                {showExecutiveSummary ? 'Back' : 'Forecast'}
                            </button>
                        )}

                        {/* Save */}
                        <button
                            onClick={handleSave}
                            disabled={isGenerating}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-lg disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Save
                        </button>

                        {/* Generate */}
                        <button
                            onClick={() => { if (aiAdvisory) setShowAIReport(true); else generateReport(); }}
                            disabled={!sstiResult.isComplete || isGenerating}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg disabled:opacity-50 ${sstiResult.isComplete
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                            {isGenerating ? 'Generating...' : aiAdvisory ? 'View Full Report' : 'Generate Strategic Report'}
                        </button>
                    </div>
                </header>

                {/* ── Content Area ── */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-gradient-to-b from-slate-50 to-slate-100/50">

                    {isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Deep-Dive in Progress</h3>
                                <p className="text-slate-500 max-w-md">Analysing your responses against benchmark data points to architect your roadmap.</p>
                            </div>
                            <div className="flex flex-col gap-2 w-64">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 animate-[loading_3s_ease-in-out_infinite]" />
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                                    <span>Analysis</span>
                                    <span>Benchmarking</span>
                                    <span>Synthesis</span>
                                </div>
                            </div>
                        </div>

                    ) : showAIReport && aiAdvisory ? (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <ExecutiveAdvisory advisory={aiAdvisory} />
                        </div>

                    ) : showExecutiveSummary && mounted ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ExecutiveSummary sstiResult={sstiResult} />
                        </div>

                    ) : (
                        <div className="max-w-5xl mx-auto px-6 py-10">

                            {/* Section header card */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8 overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500" />
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-bold tracking-wide uppercase text-indigo-600">Enterprise Assessment</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-slate-500 font-medium">
                                            {sstiResult.totalAnswered}/{sstiResult.totalQuestions} Completed
                                        </span>
                                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-500 rounded-full"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Enterprise Shared Services Engine</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    Assess your current maturity across 9 key transformation domains. Generate your AI-driven roadmap and readiness score.
                                </p>
                            </div>

                            {/* Domain sections */}
                            <div className="space-y-8">
                                {assessmentData.map((domain: any, idx: number) => {
                                    const answeredInDomain = domain.questions.filter((q: any) => answers[q.id] > 0).length;
                                    return (
                                        <div key={domain.id}>
                                            <DomainSection
                                                domainId={domain.id}
                                                title={domain.name}
                                                description={domain.description}
                                                questions={domain.questions}
                                                answers={answers}
                                                onAnswerChange={handleAnswerChange}
                                                isAgentic={domain.id === 9}
                                            />
                                            <SectionInsightPanel
                                                sectionNumber={domain.id}
                                                total={domain.questions.length}
                                                answered={answeredInDomain}
                                                label={domain.name}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Footer */}
                            <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm pb-10">
                                <p>&copy; 2026 HRTek Systems. All rights reserved.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
