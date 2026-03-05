import { useState, useRef, useEffect } from 'react';
import { json, type LoaderFunctionArgs, redirect, type LinksFunction, type MetaFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate, useFetcher } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getEnhancedUser } from "~/utils/user.server";

// Import the new components
import { DashboardSidebar } from "~/components/SharedServicesEngine/components/DashboardSidebar";
import { DomainSection } from "~/components/SharedServicesEngine/components/DomainSection";
import { ExecutiveSummary } from "~/components/SharedServicesEngine/components/ExecutiveSummary";
import { ExecutiveAdvisory } from "~/components/SharedServicesEngine/components/ExecutiveAdvisory";
import { assessmentData } from "~/components/SharedServicesEngine/data/assessment-data";
import { calculateSSTI } from "~/components/SharedServicesEngine/utils/calculations";
import { Menu, Zap, ArrowLeft, Save, Sparkles, Loader2, FileText, Download, X, Home } from 'lucide-react';
import sharedServicesStyles from "~/styles/shared-services-engine.css?url";
import { findEngineData } from "~/models/engine.model.server";

// Server side imports
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

    // Perform calculations server-side for AI context
    const sstiResult = calculateSSTI(answers);

    // Aggregating data for Shared Services specifically
    const aggregatedData = {
        companyId: user.companyId || user.id,
        timestamp: new Date().toISOString(),
        engines: {
            sharedServices: {
                engineName: "Shared Service Designer",
                progress: sstiResult.isComplete ? 100 : Math.round((sstiResult.totalAnswered / sstiResult.totalQuestions) * 100),
                responses: answers,
                scores: sstiResult.domainScores.reduce((acc, ds) => ({ ...acc, [ds.domainId]: ds.score }), {}),
                aiAnalysis: sstiResult
            }
        },
        completedEnginesCount: 1,
        totalEngines: 1
    };

    try {
        // 1. Save responses to Engine Storage (for progress and continuation)
        await createOrUpdateEngineStorage({
            company_id: user.organisationId,
            user_id: user.id || user.userId,
            engine_name: "Shared Service Designer",
            country: user.country_iso || "Global",
            progress: sstiResult.isComplete ? 100 : Math.round((sstiResult.totalAnswered / sstiResult.totalQuestions) * 100),
            responses: answers // This is important for the loader to find it
        });

        const advisory = await generateHTIAdvisory(aggregatedData as any);

        // 2. Save report to DB
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
    if (!user) {
        return redirect("/login");
    }

    const engineData = await findEngineData(user.organisationId, "Shared Service Designer");
    const initialAnswers = engineData?.responses || {};

    return json({ user, initialAnswers });
}

export default function SharedServicesAssessment() {
    const { user, initialAnswers } = useLoaderData<typeof loader>();
    const navigate = useNavigate();
    const fetcher = useFetcher<any>();
    const [answers, setAnswers] = useState<Record<number, number>>(initialAnswers);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [showExecutiveSummary, setShowExecutiveSummary] = useState(false);
    const [showAIReport, setShowAIReport] = useState(false);
    const [pendingScrollId, setPendingScrollId] = useState<number | null>(null);
    const [mounted, setMounted] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Effect to handle scroll after view switch
    useEffect(() => {
        if (pendingScrollId !== null && !showExecutiveSummary && !showAIReport) {
            const element = document.getElementById(`domain-${pendingScrollId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                setPendingScrollId(null);
            }
        }
    }, [showExecutiveSummary, showAIReport, pendingScrollId]);

    const handleAnswerChange = (questionId: number, value: number) => {
        setAnswers((prev) => ({
            ...prev,
            [questionId]: value,
        }));
    };

    const sstiResult = calculateSSTI(answers);

    // AI Report Generation
    const generateReport = () => {
        fetcher.submit(
            { answers: JSON.stringify(answers) },
            { method: "post" }
        );
    };

    const isGenerating = fetcher.state !== "idle";
    const aiAdvisory = fetcher.data?.advisory as HTIAdvisoryContent;

    // Sync with scroll
    const scrollToDomain = (domainId: number) => {
        // If showing summaries, switch back to questions
        if (showExecutiveSummary || showAIReport) {
            setShowExecutiveSummary(false);
            setShowAIReport(false);
            setPendingScrollId(domainId);
        } else {
            // Use a small timeout to ensure any state changes are processed
            setTimeout(() => {
                const element = document.getElementById(`domain-${domainId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 10);
        }

        setIsSidebarOpen(false);
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <div className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out border-r border-slate-200 shadow-2xl
                lg:relative lg:translate-x-0 lg:shadow-none
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="absolute top-4 right-4 lg:hidden">
                    <button onClick={() => setIsSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>
                <DashboardSidebar
                    currentScore={sstiResult.sstiScore}
                    answers={answers}
                    totalQuestions={sstiResult.totalQuestions}
                    onNavigate={scrollToDomain}
                />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Header */}
                <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => {
                                if (showAIReport) setShowAIReport(false);
                                else if (showExecutiveSummary) setShowExecutiveSummary(false);
                                else navigate("/sharedDashboard");
                            }}
                            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <Home className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="flex items-center gap-3 ml-2 border-l border-slate-200 pl-4">
                            <img src="/hrtek_logo.png" alt="HRTek Logo" className="h-8 w-auto object-contain" />
                            <div>
                                <div className="font-bold text-slate-900 leading-tight">Shared Services Engine</div>
                                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Intelligent Planner</div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!showAIReport && (
                            <button
                                onClick={() => setShowExecutiveSummary(!showExecutiveSummary)}
                                className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${sstiResult.isComplete
                                    ? 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                                    : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                    }`}
                                disabled={!sstiResult.isComplete}
                            >
                                <FileText className="w-4 h-4" />
                                {showExecutiveSummary ? 'Back to Questions' : 'Maturity Forecast'}
                            </button>
                        )}

                        <button
                            onClick={() => {
                                if (aiAdvisory) setShowAIReport(true);
                                else generateReport();
                            }}
                            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${sstiResult.isComplete
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                            disabled={!sstiResult.isComplete || isGenerating}
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            {isGenerating ? 'Generating Strategy...' : aiAdvisory ? 'View Full AI Report' : 'Generate Strategic Report'}
                        </button>

                        <button
                            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-slate-50/50">
                    {isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900">AI Deep-Dive in Progress</h3>
                                <p className="text-slate-500 max-w-md">Our transformation engine is analyzing your responses against 10,000+ benchmark data points to architect your roadmap.</p>
                            </div>
                            <div className="flex flex-col gap-2 w-64">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 animate-[loading_3s_ease-in-out_infinite]"></div>
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
                        <div className="max-w-5xl mx-auto px-6 py-12">
                            {/* Welcome Section */}
                            <div className="mb-12">
                                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                                    Enterprise Shared Services Engine
                                </h1>
                                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                                    Assess your current maturity across 9 key transformation domains.
                                    Generate your AI-driven roadmap and readiness score.
                                </p>

                                {sstiResult.totalAnswered > 0 && (
                                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-full text-indigo-700 text-sm font-medium">
                                        <Zap className="w-4 h-4 fill-indigo-500" />
                                        {sstiResult.totalAnswered} of {sstiResult.totalQuestions} questions answered
                                    </div>
                                )}
                            </div>

                            {/* Domain Sections */}
                            <div className="space-y-6">
                                {assessmentData.map((domain) => (
                                    <DomainSection
                                        key={domain.id}
                                        domainId={domain.id}
                                        title={domain.name}
                                        description={domain.description}
                                        questions={domain.questions}
                                        answers={answers}
                                        onAnswerChange={handleAnswerChange}
                                        isAgentic={domain.id === 9}
                                    />
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="mt-20 pt-10 border-t border-slate-200 text-center text-slate-400 text-sm pb-10">
                                <p>&copy; 2026 Enterprise Shared Services Engine. Powered by HRTek System.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
