import { useState, useRef, useCallback, useEffect } from "react";
import { useFetcher, useNavigate, useSearchParams } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    CheckCircle2, Circle, ChevronRight, Menu, X,
    ArrowLeft, ArrowRight, Save, BarChart3, Target, Sparkles, Loader2
} from "lucide-react";
import { diagnosticData } from "./data/diagnosticData";
import { SectionInsightPanel } from "../shared/SectionInsightPanel";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";
import { ExecutiveAdvisory } from "../../SharedServicesEngine/components/ExecutiveAdvisory";

interface AiMaturityAssessmentProps {
    initialData?: Record<string, any>;
    savedProgress?: number;
}

const calculateSectionScore = (questions: any[], responses: Record<string, number>) => {
    let totalScore = 0;
    let answered = 0;
    questions.forEach(q => {
        if (responses[q.id.toString()] !== undefined) {
            totalScore += responses[q.id.toString()];
            answered++;
        }
    });
    const percentage = answered > 0 ? (totalScore / (answered * 4)) * 100 : 0;
    return { percentage, rawScore: totalScore, maxScore: questions.length * 4 };
};

export default function App({ initialData = {}, savedProgress = 0 }: AiMaturityAssessmentProps) {
    const navigate = useNavigate();
    const fetcher = useFetcher();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
    const modify = searchParams.get('modify') === 'true';

    const hasExistingData = !!(initialData && Object.keys(initialData).length > 0);
    const [started, setStarted] = useState(modify || !hasExistingData);
    const [responses, setResponses] = useState<Record<string, number>>(initialData || {});
    const [currentStep, setCurrentStep] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [showAIReport, setShowAIReport] = useState(false);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const sections = diagnosticData;
    const currentSection = sections[currentStep];

    const totalQuestions = sections.reduce((acc, s) => acc + s.questions.length, 0);
    const answeredCount = Object.keys(responses).filter(k => {
        const val = responses[k];
        return val !== undefined && val !== null;
    }).length;
    const progress = totalQuestions > 0 ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100)) : 0;
    const isComplete = progress === 100;

    // AI Report Generation
    const generateReport = () => {
        setIsGeneratingReport(true);
        fetcher.submit(
            {
                intent: "generate_report",
                responses: responses,
                progress: progress
            },
            { method: "post", encType: "application/json" }
        );
    };

    const isGenerating = isGeneratingReport && fetcher.state !== "idle";
    const aiAdvisory = (fetcher.data as any)?.advisory as HTIAdvisoryContent;

    // Redirect if done / clear generating state
    useEffect(() => {
        if (fetcher.data && (fetcher.data as any).redirect) {
            window.location.href = (fetcher.data as any).redirect;
        }
        if (fetcher.state === "idle" && isGeneratingReport) {
            setIsGeneratingReport(false);
        }
    }, [fetcher.data, fetcher.state, isGeneratingReport]);

    const handleResponse = useCallback((questionId: string, value: number | undefined) => {
        setResponses(prev => {
            if (value === undefined) {
                const n = { ...prev };
                delete n[questionId];
                return n;
            }
            return { ...prev, [questionId]: value };
        });
    }, []);

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            fetcher.submit({
                progress,
                responses,
                params: "AI Driven Maturity Engine",
            }, { method: "POST", encType: "application/json" });

            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch {
            setShowErrorToast(true);
            setTimeout(() => setShowErrorToast(false), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async () => {
        if (currentStep < sections.length - 1) {
            await handleSave();
            setCurrentStep(p => p + 1);
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            // Final submission — send ALL responses
            setIsSubmitting(true);
            fetcher.submit({
                responses: responses,
                progress: progress,
                params: "AI Driven Maturity Engine",
            }, { method: "POST", encType: "application/json" });
        }
    };

    // Handle redirect after final submission
    useEffect(() => {
        if (fetcher.data && (fetcher.data as any).redirect) {
            window.location.href = (fetcher.data as any).redirect;
        }
        if (fetcher.state === "idle" && isSubmitting) {
            setIsSubmitting(false);
        }
    }, [fetcher.data, fetcher.state]);

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(p => p - 1);
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            navigate(-1);
        }
    };

    const navigateToStep = (idx: number) => {
        setCurrentStep(idx);
        setIsSidebarOpen(false);
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    const getSectionAnsweredCount = (sectionIdx: number) => {
        return sections[sectionIdx].questions.filter(q => responses[q.id] !== undefined).length;
    };

    // Score for current section header display
    const currentSectionAnswered = getSectionAnsweredCount(currentStep);
    const currentSectionTotal = currentSection.questions.length;

    if (!started) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-white px-6">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-6 border border-slate-100">
                    <img src="/hrtek_logo.png" alt="HRTek" className="h-10 mx-auto object-contain" />
                    <h1 className="text-2xl font-black text-slate-900">AI Driven Maturity Engine</h1>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        You have a saved session with <span className="font-bold text-blue-600">{savedProgress}%</span> progress. Would you like to continue where you left off?
                    </p>
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={() => setStarted(true)}
                            className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg transition-all"
                        >
                            Continue with Saved Responses ({savedProgress}%)
                        </button>
                        <button
                            onClick={() => { setResponses({}); setStarted(true); }}
                            className="w-full px-8 py-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-base transition-all"
                        >
                            Start Fresh
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">

            {/* Toasts */}
            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm z-[200] font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Progress Saved
                    </motion.div>
                )}
                {showErrorToast && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm z-[200] font-semibold">
                        Error saving progress
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out border-r border-slate-200 shadow-2xl
                lg:relative lg:translate-x-0 lg:shadow-none
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img src="/hrtek_logo.png" alt="HRTek" className="h-9 w-auto object-contain" />
                            <div className="h-8 w-px bg-slate-200" />
                            <div>
                                <h2 className="font-bold text-lg tracking-tight text-slate-900 leading-tight">AI Driven</h2>
                                <p className="text-xs text-indigo-600 uppercase tracking-wider font-bold">Maturity</p>
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
                                    {answeredCount}/{totalQuestions}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-3">
                        <div className="px-3 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Assessment Sections
                        </div>
                        <nav className="space-y-1">
                            {sections.map((section, idx) => {
                                const sectionQuestionIds = section.questions.map(q => q.id.toString());
                                const sectionAnswered = sectionQuestionIds.filter(id => responses[id] !== undefined).length;
                                const isComplete = sectionAnswered === section.questions.length && section.questions.length > 0;
                                const isActive = currentStep === idx;
                                const isStarted = sectionAnswered > 0;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setCurrentStep(idx);
                                            setIsSidebarOpen(false);
                                            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
                                        }}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm transition-all group ${isActive
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                            : isStarted
                                                ? "bg-indigo-50 text-indigo-900 font-medium hover:bg-indigo-100"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isComplete ? (
                                                <CheckCircle2 className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-500"}`} />
                                            ) : (
                                                <Circle className={`w-4 h-4 ${isActive ? "text-white/60" : isStarted ? "text-indigo-400" : "text-slate-300"}`} />
                                            )}
                                            <span className="text-left text-[11px] font-bold uppercase tracking-wider leading-tight">
                                                {section.title}
                                            </span>
                                        </div>
                                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/60" />}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Sidebar Footer */}
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

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="hidden lg:flex items-center gap-3">
                            <button 
                                onClick={() => {
                                    if (showAIReport) setShowAIReport(false);
                                    else navigate("/dashboard");
                                }} 
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                            </button>
                            <div className="h-6 w-px bg-slate-200" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                AI Driven Maturity
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Section {currentStep + 1} of {sections.length} • {currentSection.title}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-600">{progress}% Complete</span>
                        </div>
                        <button
                            onClick={handleSave}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-lg disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Save
                        </button>
                        <button
                            onClick={() => {
                                if (aiAdvisory) setShowAIReport(true);
                                else generateReport();
                            }}
                            disabled={!isComplete || isGenerating}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg disabled:opacity-50 ${isComplete
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            {isGenerating ? 'Generating Strategy...' : aiAdvisory ? 'View Full Report' : 'Generate Strategic Report'}
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-gradient-to-b from-slate-50 to-slate-100/50">
                    {isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">AI Deep-Dive in Progress</h3>
                                <p className="text-slate-500 max-w-md">Our transformation engine is analyzing your change readiness indexes to architect your intervention strategy.</p>
                            </div>
                            <div className="flex flex-col gap-2 w-64">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 animate-[loading_3s_ease-in-out_infinite]"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                                    <span>Analysis</span>
                                    <span>Resistance Mapping</span>
                                    <span>Synthesis</span>
                                </div>
                            </div>
                        </div>
                    ) : showAIReport && aiAdvisory ? (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <ExecutiveAdvisory advisory={aiAdvisory} />
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto px-6 py-10">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentSection.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Section Header Card */}
                                    <div className="bg-white rounded-2xl border border-slate-300 shadow-sm p-8 mb-8 overflow-hidden relative">
                                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500" />
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-bold tracking-wide uppercase text-indigo-600">
                                                Section {currentStep + 1}
                                            </span>
                                            <div className="flex items-center gap-3">
                                                <span className="text-xs text-slate-500 font-medium">
                                                    {currentSection.questions.filter(q => responses[q.id] !== undefined).length}/{currentSection.questions.length} Completed
                                                </span>
                                                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-500 rounded-full"
                                                        style={{ width: `${(currentSection.questions.filter(q => responses[q.id] !== undefined).length / currentSection.questions.length) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{currentSection.title}</h2>
                                        <p className="text-slate-600 leading-relaxed">{currentSection.description}</p>
                                    </div>

                                    {/* Questions */}
                                    <div className="space-y-6">
                                        {currentSection.questions.map((question) => {
                                            const questionIdStr = question.id.toString();
                                            const selectedValue = responses[questionIdStr];

                                            return (
                                                <div key={question.id} className="bg-white rounded-2xl border border-slate-300 shadow-sm hover:shadow-md transition-shadow p-6">
                                                    <div className="flex gap-3 mb-5">
                                                        <span className="text-sm text-indigo-600 font-bold shrink-0">{question.id}.</span>
                                                        <p className="text-base text-slate-800 font-semibold leading-relaxed">
                                                            {question.text}
                                                            <span className="text-red-500 ml-1">*</span>
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-5">
                                                        {question.options.map((optionText, optionIdx) => {
                                                            // We store optionIdx as the value (0-4)
                                                            const isSelected = selectedValue === optionIdx;
                                                            return (
                                                                <div
                                                                    key={optionIdx}
                                                                    onClick={() => handleResponse(questionIdStr, optionIdx)}
                                                                    className={`relative flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                                                                        ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                                                                        : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white"
                                                                        }`}
                                                                >
                                                                    <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 bg-white"
                                                                        }`}>
                                                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-0.5">
                                                                            <span className={`text-sm font-semibold ${isSelected ? "text-indigo-900" : "text-slate-700"}`}>
                                                                                {optionText}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Sectional Metrics / Insights */}
                                    <SectionInsightPanel
                                        sectionNumber={currentStep + 1}
                                        total={currentSection.questions.length}
                                        answered={currentSection.questions.filter((q: any) => responses[q.id.toString()] !== undefined).length}
                                        label={currentSection.title}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between mt-10 pt-6 border-t border-slate-200">
                                <button
                                    onClick={handlePrevious}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={isSubmitting}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                                >
                                    {isSubmitting ? "Saving..." : currentStep === sections.length - 1 ? "Submit Assessment" : "Next Section"}
                                    {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                                </button>
                            </div>

                            {/* Footer */}
                            <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
                                <p>&copy; 2026 HRTek Systems. All rights reserved.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
