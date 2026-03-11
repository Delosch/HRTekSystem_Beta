import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFetcher, useNavigate, useLocation } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    CheckCircle2, Circle, ChevronRight, Menu, X,
    ArrowLeft, ArrowRight, Save, Target, Sparkles, Loader2, BarChart3
} from "lucide-react";
import { ExecutiveAdvisory } from "~/components/SharedServicesEngine/components/ExecutiveAdvisory";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";
import { SectionInsightPanel } from "../shared/SectionInsightPanel";

import { BusinessStrategySection } from './components/sections/BusinessStrategySection';
import { ProcessMaturitySection } from './components/sections/ProcessMaturitySection';
import { DigitalCapabilitySection } from './components/sections/DigitalCapabilitySection';
import { TechnologyLandscapeSection } from './components/sections/TechnologyLandscapeSection';
import { AutomationAISection } from './components/sections/AutomationAISection';
import { DataAnalyticsSection } from './components/sections/DataAnalyticsSection';
import { OperatingModelSection } from './components/sections/OperatingModelSection';
import { ChangeReadinessSection } from './components/sections/ChangeReadinessSection';
import { ComplianceRiskSection } from './components/sections/ComplianceRiskSection';
import { BudgetVisionSection } from './components/sections/BudgetVisionSection';
import { ResultsDashboard } from './components/ResultsDashboard';

export interface AssessmentData {
  [key: string]: any;
}

const sections = [
  { id: 'business-strategy', title: 'Business Strategy & Intent', component: BusinessStrategySection, description: "Define your digital transformation vision and core operating model." },
  { id: 'process-maturity', title: 'HR Process Maturity', component: ProcessMaturitySection, description: "Standardized processes are the foundation for automation and analytics." },
  { id: 'digital-capability', title: 'Digital Capability', component: DigitalCapabilitySection, description: "Evaluate the digital skills and digital-first mindset of your HR team." },
  { id: 'technology-landscape', title: 'Technology Landscape', component: TechnologyLandscapeSection, description: "Assess your current core HR systems, technical debt, and integration level." },
  { id: 'automation-ai', title: 'Automation & AI', component: AutomationAISection, description: "Determine how deeply automation and AI are embedded across the employee lifecycle." },
  { id: 'data-analytics', title: 'Data & Analytics', component: DataAnalyticsSection, description: "Assess your data foundation, governance, and advanced analytics capabilities." },
  { id: 'operating-model', title: 'HR Operating Model', component: OperatingModelSection, description: "Evaluate how your HR structure supports digital delivery and agility." },
  { id: 'change-readiness', title: 'Change & Adoption', component: ChangeReadinessSection, description: "Measure organizational readiness, leadership alignment, and change resilience." },
  { id: 'compliance-risk', title: 'Compliance & Risk', component: ComplianceRiskSection, description: "Assess data privacy, security frameworks, and regulatory compliance of HR tech." },
  { id: 'budget-vision', title: 'Budget & Vision', component: BudgetVisionSection, description: "Define your investment capacity and ROI tracking mechanisms." },
];

export default function App({ initialData = {}, savedProgress = 0 }: { initialData?: any; savedProgress?: number }) {
    const navigate = useNavigate();
    const fetcher = useFetcher();
    const location = useLocation();
    const scrollRef = useRef<HTMLDivElement>(null);

    const hasExistingData = !!(initialData && Object.keys(initialData).length > 0);
    const modify = new URLSearchParams(location.search).get('modify') === 'true';
    const [started, setStarted] = useState(modify || !hasExistingData);
    const [assessmentData, setAssessmentData] = useState<AssessmentData>(initialData);
    const [currentStep, setCurrentStep] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [showAIReport, setShowAIReport] = useState(false);
    const [sectionCompletion, setSectionCompletion] = useState<{ [key: string]: boolean }>({});
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    const currentSection = sections[currentStep];
    const totalQuestions = 38;
    const answeredQuestions = Object.keys(assessmentData).length;
    const progress = totalQuestions > 0 ? Math.min(100, Math.round((answeredQuestions / totalQuestions) * 100)) : 0;
    const isComplete = progress >= 95; // Since we don't have exactly 38 easily trackable fields sometimes

    // AI Report Generation
    const generateReport = () => {
        setIsGeneratingReport(true);
        fetcher.submit(
            {
                intent: "generate_report",
                responses: assessmentData,
                progress: progress
            },
            { method: "post", encType: "application/json", action: location.pathname }
        );
    };

    const isGenerating = isGeneratingReport && fetcher.state !== "idle";
    const aiAdvisory = (fetcher.data as any)?.advisory as HTIAdvisoryContent;

    useEffect(() => {
        if (fetcher.data && (fetcher.data as any).redirect) {
            window.location.href = (fetcher.data as any).redirect;
        }
        if (fetcher.state === "idle") {
            if (isGeneratingReport) setIsGeneratingReport(false);
            if (isSubmitting) setIsSubmitting(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [fetcher.data, fetcher.state]);

    const updateAssessmentData = (key: string, value: any) => {
        setAssessmentData(prev => ({ ...prev, [key]: value }));
    };

    const markSectionComplete = (sectionId: string) => {
        setSectionCompletion((prev) => ({ ...prev, [sectionId]: true }));
    };

    const handleSave = async () => {
        try {
            setIsSubmitting(true);
            const prog = Math.round((Object.keys(assessmentData).length / totalQuestions) * 100);
            fetcher.submit({
                progress: prog,
                responses: assessmentData,
                params: "HR Digital Transformation Roadmap",
            }, { method: "POST", encType: "application/json", action: location.pathname });

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
            setIsSubmitting(true);
            const prog = Math.round((Object.keys(assessmentData).length / totalQuestions) * 100);
            fetcher.submit({
                responses: assessmentData,
                progress: 100,
                params: "HR Digital Transformation Roadmap",
            }, { method: "POST", encType: "application/json", action: location.pathname });
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(p => p - 1);
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            navigate(-1);
        }
    };

    if (!started) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-white px-6">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-6 border border-slate-100">
                    <img src="/hrtek_logo.png" alt="HRTek" className="h-10 mx-auto object-contain" />
                    <h1 className="text-2xl font-black text-slate-900">Digital Roadmap Engine</h1>
                    <p className="text-slate-600 text-sm leading-relaxed">
                        You have a saved session with <span className="font-bold text-indigo-600">{savedProgress}%</span> progress. Would you like to continue where you left off?
                    </p>
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={() => setStarted(true)}
                            className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-base shadow-lg transition-all"
                        >
                            Continue with Saved Responses ({savedProgress}%)
                        </button>
                        <button
                            onClick={() => { setAssessmentData({}); setStarted(true); }}
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
                                <h2 className="font-bold text-lg tracking-tight text-slate-900 leading-tight">Digital</h2>
                                <p className="text-xs text-indigo-600 uppercase tracking-wider font-bold">Roadmap</p>
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
                                    {answeredQuestions}/{totalQuestions}
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
                                const isActive = currentStep === idx;
                                const isSectionComplete = sectionCompletion[section.id];
                                const isStarted = true;

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
                                            {isSectionComplete ? (
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
                                HR Digital Roadmap Assessment
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
                                <p className="text-slate-500 max-w-md">Our transformation engine is analyzing your organizational profile to architect your roadmap.</p>
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
                                    {/* Custom Section Render */}
                                    <div className="mb-10">
                                        <currentSection.component
                                            data={assessmentData}
                                            updateData={updateAssessmentData}
                                            onComplete={() => markSectionComplete(currentSection.id)}
                                        />
                                    </div>

                                    {/* Section Intelligence Panel */}
                                    <SectionInsightPanel
                                        sectionNumber={currentStep + 1}
                                        total={Math.ceil(totalQuestions / sections.length)}
                                        answered={Object.keys(assessmentData).filter(k => k.startsWith(currentSection.id)).length || Math.min(Math.ceil(totalQuestions / sections.length), answeredQuestions)}
                                        label={currentSection.title}
                                    />
                                    
                                    {/* Final Screen Results Dashboard */}
                                    {currentStep === sections.length - 1 && isComplete && (
                                        <div className="mt-12 pt-8 border-t border-slate-200">
                                            <ResultsDashboard assessmentData={assessmentData} onReset={() => {}} />
                                        </div>
                                    )}
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
