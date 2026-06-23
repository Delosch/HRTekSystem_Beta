import { Link } from "@remix-run/react";
import { motion, useInView, Variants, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import BoardDossierRenderer from "./BoardDossierRenderer";
import {
    FileText, Target, TrendingUp, AlertTriangle, ShieldCheck,
    Clock, Zap, LayoutPanelTop, Lightbulb, Download, ArrowLeft,
    CheckCircle, Brain, DollarSign, PlayCircle, Star, Sparkles,
    ChevronRight, ArrowUpRight, Activity, BarChart2, ScanLine, Info
} from "lucide-react";
import {
    ResponsiveContainer, Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area,
    BarChart, Bar, Legend, ReferenceLine
} from 'recharts';
import { StrategicReportPreview } from "../reports/StrategicReportPreview";
import { useReportGenerator } from "~/hooks/useReportGenerator";

// --- Helper Components ---

const TypewriterText = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    const ref = useRef<HTMLParagraphElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    useEffect(() => {
        if (!isInView) return;
        let currentText = "";
        let currentIndex = 0;

        const timeout = setTimeout(() => {
            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    currentText += text[currentIndex];
                    setDisplayedText(currentText);
                    currentIndex++;
                } else {
                    clearInterval(interval);
                }
            }, 20);
            return () => clearInterval(interval);
        }, delay * 1000);

        return () => clearTimeout(timeout);
    }, [text, delay, isInView]);

    return <p ref={ref} className={className}>{displayedText}</p>;
};

const AnimatedCounter = ({ value, duration = 2 }: { value: number; duration?: number }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        let animationFrame: number;

        const updateCount = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / (duration * 1000), 1);

            setCount(Math.floor(percentage * value));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(updateCount);
            }
        };

        animationFrame = requestAnimationFrame(updateCount);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return <>{count}</>;
};

const FlipCard = ({ dim, index }: { dim: any; index: number }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    const colors = [
        { bg: 'from-blue-500 to-cyan-500', text: 'text-blue-600', border: 'border-blue-200', light: 'bg-blue-50' },
        { bg: 'from-purple-500 to-pink-500', text: 'text-purple-600', border: 'border-purple-200', light: 'bg-purple-50' },
        { bg: 'from-orange-500 to-red-500', text: 'text-orange-600', border: 'border-orange-200', light: 'bg-orange-50' },
        { bg: 'from-green-500 to-emerald-500', text: 'text-green-600', border: 'border-green-200', light: 'bg-green-50' },
        { bg: 'from-indigo-500 to-blue-500', text: 'text-indigo-600', border: 'border-indigo-200', light: 'bg-indigo-50' },
        { bg: 'from-rose-500 to-pink-500', text: 'text-rose-600', border: 'border-rose-200', light: 'bg-rose-50' },
    ];

    const color = colors[index % colors.length];

    return (
        <div
            className="group h-[360px] perspective cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
        >
            <div className={`relative w-full h-full duration-700 preserve-3d transition-all ease-in-out ${isFlipped ? 'rotate-y-180' : ''}`}>
                {/* Front */}
                <div className={`absolute w-full h-full backface-hidden bg-white rounded-3xl p-8 flex flex-col justify-between overflow-hidden border-2 ${color.border} shadow-xl hover:shadow-2xl transition-all`}>
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color.bg} opacity-10 rounded-full blur-2xl`}></div>

                    <div>
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color.bg} text-white flex items-center justify-center font-semibold mb-6 shadow-lg`}>
                            {index + 1}
                        </div>
                        <h3 className="font-semibold text-slate-900 text-xl leading-snug mb-2 pr-4">{dim.dimension}</h3>
                        <p className={`text-xs font-medium ${color.text} uppercase tracking-widest`}>{dim.strategic_outlook}</p>
                    </div>

                    <div className="space-y-3 relative z-10">
                        <div className="flex items-end gap-2">
                            <span className={`text-5xl font-black bg-gradient-to-br ${color.bg} bg-clip-text text-transparent`}>{dim.score}</span>
                            <span className="text-sm font-medium text-slate-500 mb-2">/100</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div className={`bg-gradient-to-r ${color.bg} h-full rounded-full transition-all duration-1000`} style={{ width: `${dim.score}%` }}></div>
                        </div>
                        <div className="flex justify-center mt-4 pt-4 border-t border-slate-200">
                            <span className={`text-xs font-medium ${color.text} flex items-center gap-2 group-hover:scale-105 transition-transform`}>
                                {isFlipped ? "Tap to hide analysis" : "Tap to reveal analysis"} <ArrowUpRight className={`w-3 h-3 ${isFlipped ? 'rotate-180' : ''} transition-transform`} />
                            </span>
                        </div>
                    </div>
                </div>

                {/* Back */}
                <div className={`absolute w-full h-full backface-hidden ${color.light} rounded-3xl p-8 shadow-2xl rotate-y-180 overflow-hidden flex flex-col text-slate-800 border-2 ${color.border}`}>
                    <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${color.bg}`}></div>
                    <h3 className="font-semibold text-slate-900 text-md mb-6 flex items-center gap-2 border-b border-slate-300 pb-4">
                        <Brain className={`w-4 h-4 ${color.text}`} /> Analysis
                    </h3>

                    <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                        <div>
                            <p className="text-[10px] font-medium text-red-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <AlertTriangle className="w-3 h-3" /> Critical Gaps
                            </p>
                            <ul className="text-sm text-slate-700 space-y-2">
                                {dim.current_state.map((s: string, idx: number) => <li key={idx} className="flex gap-2 leading-relaxed"><span className="text-red-500 mt-1 font-medium">•</span> {s}</li>)}
                            </ul>
                        </div>

                        <div>
                            <p className="text-[10px] font-medium text-green-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                                <Lightbulb className="w-3 h-3" /> Strategic Actions
                            </p>
                            <ul className="text-sm text-slate-700 space-y-2">
                                {dim.recommendations.map((r: string, idx: number) => <li key={idx} className="flex gap-2 leading-relaxed"><span className="text-green-500 mt-1 font-medium">•</span> {r}</li>)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Animations ---

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

interface DigitalMaturityReportProps {
    data: any;
    brandName: string;
    assessmentId?: string;
    reportType?: 'detailed' | 'standard';
    responses?: any;
    questions?: any;
}

export default function DigitalMaturityReport({ data, brandName, assessmentId, reportType = 'detailed' }: DigitalMaturityReportProps) {
    const isDetailed = reportType === 'detailed';
    const [activeTab, setActiveTab] = useState("overview");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // AI Report State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { reportData, isGenerating, reportError, generate } = useReportGenerator();

    const handleExportPDF = () => {
        setIsPreviewOpen(true);
        const engineName = assessmentId === "Profiling Assessment" ? "Industry Profiling Assessent" : "Digital Maturity Engine";
        generate(engineName, (data as any)?.responses);
    };

    // Distinct Titles for Different Report Types
    const baseTitle = assessmentId === "Profiling Assessment" ? "Profiling Assessment" : "Digital Maturity";
    const reportTitle = isDetailed
        ? `${baseTitle} Strategy & Analysis`
        : `${baseTitle} Executive Summary`;

    // Theme Accents (Optional: Could vary colors based on type)
    const reportTheme = isDetailed
        ? { label: "COMPREHENSIVE ANALYSIS", color: "from-blue-600 to-purple-600", text: "text-blue-600", badge: "bg-blue-100 text-blue-800" }
        : { label: "EXECUTIVE SUMMARY", color: "from-emerald-600 to-teal-600", text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-800" };

    const generateFallbackReport = () => {
        const res = (data?.result || {}) as any;

        let analysis = res?.maturity_analysis || {};

        if (!analysis.overall_score && res?.dimensions) {
            const dimensions = res.dimensions || [];
            const totalScore = dimensions.reduce((acc: number, d: any) => acc + (d.score || 0), 0);
            analysis = {
                overall_score: { percentage: Math.round(totalScore / (dimensions.length || 1)) },
                dimensional_scores: dimensions.map((d: any) => ({
                    dimension: d.name,
                    percentage: d.score,
                    maturity_level: d.level,
                    critical_gaps: d.gaps || [],
                    key_strengths: d.strengths || [],
                    gap_analysis: { improvement_potential: 100 - (d.score || 0) }
                }))
            };
        }

        if (!analysis.dimensional_scores || !Array.isArray(analysis.dimensional_scores)) {
            analysis.dimensional_scores = [];
        }

        if (!analysis.overall_score) analysis.overall_score = { percentage: 0 };
        if (!analysis.dimensional_scores) analysis.dimensional_scores = [];

        const insights = res?.strategic_insights || { transformation_readiness: { enabling_factors: [], blocking_factors: [] } };
        const risks = res?.risk_assessment?.transformation_risks || res?.risk_assessment || [];
        const recommendations = res?.detailed_recommendations || { immediate_actions: { actions: [] }, short_term_initiatives: { actions: [] } };

        const normalizeScore = (val: any) => {
            const numVal = Number(val);
            if (isNaN(numVal) || !numVal) return 0;
            if (numVal <= 10 && numVal > 0) return Math.round(numVal * 10);
            return Math.round(numVal);
        };

        const allActions = [
            ...(recommendations.immediate_actions?.actions || []).map((a: any) => ({ ...a, priority: 'P1', impact: 'High', effort: 'Medium' })),
            ...(recommendations.short_term_initiatives?.actions || []).map((a: any) => ({ ...a, priority: 'P2', impact: 'Medium', effort: 'High' })),
            ...(recommendations.medium_term_initiatives?.actions || []).map((a: any) => ({ ...a, priority: 'P3', impact: 'High', effort: 'High' }))
        ];

        return {
            executive_summary: {
                overall_maturity_index: normalizeScore(analysis.overall_score.percentage || analysis.overall_score.weighted_score || analysis.overall_score.raw_score),
                maturity_category: analysis.overall_score.maturity_level || insights.maturity_stage_description || "Developing",
                what_this_means: [
                    ...(insights.transformation_readiness.enabling_factors || []).slice(0, 2),
                    ...(insights.transformation_readiness.blocking_factors || []).slice(0, 2)
                ],
                executive_recommendation: insights.overall_assessment || "Initiate a structured digital transformation roadmap focusing on core process automation.",
                key_observations: insights?.key_findings || insights?.key_observations || []
            },
            maturity_scorecard: analysis.dimensional_scores.map((d: any) => {
                const finalScore = normalizeScore(d.percentage || d.weighted_score || d.raw_score);
                return {
                    dimension: d.dimension,
                    score: finalScore,
                    max_score: 100,
                    risk_level: finalScore < 40 ? "High Risk" : finalScore < 70 ? "Medium Risk" : "Low Risk"
                };
            }),
            radar_data: analysis.dimensional_scores.map((d: any) => ({
                subject: d.dimension,
                A: normalizeScore(d.percentage || d.weighted_score || d.raw_score),
                fullMark: 100
            })),
            dimension_deep_dives: analysis.dimensional_scores.slice(0, 6).map((d: any) => ({
                dimension: d.dimension,
                score: normalizeScore(d.percentage || d.weighted_score || d.raw_score),
                current_state: (d.critical_gaps || []).slice(0, 3),
                business_impact: d.business_impact || [],
                recommendations: (d.key_strengths || []),
                strategic_outlook: d.maturity_level === 'Nascent' ? "Nascent" : d.maturity_level || "Initial"
            })),
            business_risk_opportunity: {
                top_risks: risks.slice(0, 3).map((r: any, i: number) => ({
                    category: ["Cultural", "Technical", "Operational"][i] || "Strategic",
                    risk: r.risk_category || r.risk_description,
                    impact: r.impact,
                    mitigation: r.mitigation_strategy || "Implement change management"
                })),
                opportunity_areas: analysis.dimensional_scores
                    .sort((a: any, b: any) => b.gap_analysis.improvement_potential - a.gap_analysis.improvement_potential)
                    .slice(0, 4)
                    .map((d: any) => ({ opportunity: `Optimize ${d.dimension}`, value: "High VALUE" }))
            },
            transformation_priority_matrix: allActions.slice(0, 4).map((a: any) => ({
                initiative: a.action,
                priority: a.priority,
                impact: a.impact === 'High' ? 3 : a.impact === 'Medium' ? 2 : 1,
                effort: a.effort === 'High' ? 1 : a.effort === 'Medium' ? 2 : 3
            })),
            transformation_roadmap: (() => {
                const roadmap = [
                    {
                        phase: "IMMEDIATE",
                        timeline: recommendations?.immediate_actions?.timeline || "0-3 Months",
                        actions: (recommendations?.immediate_actions?.actions || []).slice(0, 2).map((a: any) => a.action)
                    },
                    {
                        phase: "SHORT-TERM",
                        timeline: recommendations?.short_term_initiatives?.timeline || "3-12 Months",
                        actions: (recommendations?.short_term_initiatives?.actions || []).slice(0, 2).map((a: any) => a.action)
                    },
                    {
                        phase: "MEDIUM-TERM",
                        timeline: recommendations?.medium_term_initiatives?.timeline || "12-24 Months",
                        actions: (recommendations?.medium_term_initiatives?.actions || []).slice(0, 1).map((a: any) => a.action)
                    }
                ].filter((p: any) => p.actions.length > 0);

                if (roadmap.length === 0) return [];
                return roadmap;
            })(),
            investment_indication: res?.investment_indication || []
        };
    };

    const aiReport = data?.result?.consulting_report;
    const fallbackReport = generateFallbackReport();

    const report = {
        ...fallbackReport,
        ...aiReport,
        executive_summary: {
            ...fallbackReport.executive_summary,
            ...(aiReport?.executive_summary || {})
        },
        business_risk_opportunity: {
            ...fallbackReport.business_risk_opportunity,
            ...(aiReport?.business_risk_opportunity || {})
        }
    };

    report.maturity_scorecard = (aiReport?.maturity_scorecard && aiReport.maturity_scorecard.length > 0)
        ? aiReport.maturity_scorecard
        : fallbackReport.maturity_scorecard;

    report.dimension_deep_dives = (aiReport?.dimension_deep_dives && aiReport.dimension_deep_dives.length > 0)
        ? aiReport.dimension_deep_dives
        : fallbackReport.dimension_deep_dives;

    report.transformation_roadmap = (aiReport?.transformation_roadmap && aiReport.transformation_roadmap.length > 0)
        ? aiReport.transformation_roadmap
        : fallbackReport.transformation_roadmap;

    const comparativeData = (report.maturity_scorecard || []).map((item: any) => ({
        name: item.dimension.length > 15 ? item.dimension.substring(0, 15) + '...' : item.dimension,
        full_name: item.dimension,
        Score: item.score,
        Target: 100,
        Gap: 100 - item.score
    }));

    const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 font-sans text-slate-900 selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
            <style>{`
                .backface-hidden { backface-visibility: hidden; }
                .perspective { perspective: 1000px; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .preserve-3d { transform-style: preserve-3d; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                
                /* Enhanced Print Styles for Perfect PDF Export */
                @media print {
                    /* Page Setup */
                    @page {
                        size: A4 portrait;
                        margin: 12mm 15mm;
                    }
                    
                    /* Color Preservation */
                    * {
                        print-color-adjust: exact !important;
                        -webkit-print-color-adjust: exact !important;
                        color-adjust: exact !important;
                    }
                    
                    /* Root Container */
                    body {
                        background: white !important;
                    }
                    
                    /* Hide Interactive Elements */
                    .no-print,
                    .print\\:hidden,
                    button:not(.keep-in-print),
                    a[href]:not(.keep-in-print) {
                        display: none !important;
                    }
                    
                    /* Show Print-Only Elements */
                    .print\\:block {
                        display: block !important;
                    }
                    
                    .print\\:break-after-always {
                        page-break-after: always !important;
                    }
                    
                    /* Header Adjustments */
                    .fixed-header {
                        position: relative !important;
                        box-shadow: none !important;
                        border-bottom: 2px solid #e2e8f0 !important;
                        margin-bottom: 20px !important;
                        page-break-after: avoid !important;
                    }
                    
                    /* Main Content */
                    main {
                        margin-top: 0 !important;
                        padding-top: 0 !important;
                    }
                    
                    /* Section Breaks */
                    section {
                        page-break-inside: avoid !important;
                        margin-bottom: 30px !important;
                    }
                    
                    section:first-of-type {
                        page-break-before: avoid !important;
                    }
                    
                    section:not(:first-of-type) {
                        page-break-before: always !important;
                    }
                    
                    /* Cards and Containers */
                    .glass-card,
                    .bg-white,
                    .rounded-3xl,
                    .rounded-2xl {
                        box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
                        page-break-inside: avoid !important;
                    }
                    
                    /* Charts - Ensure Proper Sizing */
                    .recharts-wrapper {
                        page-break-inside: avoid !important;
                    }
                    
                    svg {
                        max-width: 100% !important;
                        height: auto !important;
                    }
                    
                    /* Grid Layouts */
                    .grid {
                        page-break-inside: avoid !important;
                    }
                    
                    /* Flip Cards - Show Front Only */
                    .perspective {
                        perspective: none !important;
                    }
                    
                    .backface-hidden {
                        backface-visibility: visible !important;
                    }
                    
                    /* Tables */
                    table {
                        page-break-inside: auto !important;
                    }
                    
                    tr {
                        page-break-inside: avoid !important;
                        page-break-after: auto !important;
                    }
                    
                    thead {
                        display: table-header-group !important;
                    }
                    
                    /* Background Decorations - Reduce Opacity */
                    .fixed.top-0.left-0 {
                        display: none !important;
                    }
                    
                    /* Ensure Gradients Print */
                    .bg-gradient-to-br,
                    .bg-gradient-to-r,
                    .bg-gradient-to-l {
                        background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)) !important;
                    }
                    
                    /* Text Readability */
                    .text-slate-900,
                    .text-slate-800,
                    .text-slate-700 {
                        color: #1e293b !important;
                    }
                    
                    /* Spacing Adjustments */
                    .space-y-16 > * + * {
                        margin-top: 24px !important;
                    }
                    
                    .space-y-8 > * + * {
                        margin-top: 16px !important;
                    }
                    
                    /* Footer */
                    footer,
                    .border-t-2 {
                        page-break-before: avoid !important;
                        margin-top: 30px !important;
                    }
                    
                    /* Score Circle - Ensure Visibility */
                    .w-64.h-64 {
                        width: 200px !important;
                        height: 200px !important;
                    }
                    
                    /* Progress Bars */
                    .h-2,
                    .h-3 {
                        background-color: #e2e8f0 !important;
                    }
                    
                    /* Watermark */
                    .print-watermark {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) rotate(-45deg);
                        font-size: 80pt;
                        color: rgba(0,0,0,0.03);
                        pointer-events: none;
                        z-index: -1;
                        font-weight: 900;
                        white-space: nowrap;
                        text-transform: uppercase;
                    }
                }
            `}</style>

            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-blue-300 to-cyan-300 opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-gradient-to-br from-purple-300 to-pink-300 opacity-20 rounded-full blur-3xl"></div>
                <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-gradient-to-br from-orange-300 to-yellow-300 opacity-15 rounded-full blur-3xl"></div>
            </div>

            {/* Fixed Header */}
            <motion.header
                initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 shadow-sm fixed-header"
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Left: Company Branding */}
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg p-1`}>
                                <img src="/logo_icon_final.png" alt="HRTek" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-semibold text-slate-900">{brandName}</h1>
                                <div className="flex items-center gap-2 text-xs text-slate-600">
                                    <span className={`font-medium ${reportTheme.text} uppercase tracking-wide`}>{reportTitle}</span>
                                    <span className="text-slate-400">•</span>
                                    <span className="text-slate-500">{assessmentId}</span>
                                    {!isDetailed ? (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-semibold rounded-lg shadow-lg">
                                                EXECUTIVE SUMMARY MODE
                                            </span>
                                            <span className="text-slate-400">•</span>
                                            <span className="text-slate-500 font-medium">{assessmentId}</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow-lg animate-pulse">
                                                ANALYSIS MODE (DETAILED)
                                            </span>
                                            <span className="text-slate-400">•</span>
                                            <span className="text-slate-500 font-medium">{assessmentId}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-3 no-print">
                            <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1 mr-4">
                                <button onClick={() => setActiveTab("overview")} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "overview" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>Maturity Overview</button>
                                <button onClick={() => setActiveTab("narrative")} className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === "narrative" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>Strategic Analysis</button>
                            </div>
                            <button
                                onClick={handleExportPDF}
                                className={`px-5 py-2.5 bg-gradient-to-r ${reportTheme.color} text-white hover:opacity-90 rounded-lg text-sm font-semibold flex items-center gap-2 shadow-md hover:shadow-lg transition-all`}
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                            <Link
                                to="/dashboard"
                                className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Add padding to account for fixed header */}
            <AnimatePresence mode="wait">
                {activeTab === "overview" ? (
                    <motion.main
                        key="overview"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ opacity: 0 }}
                        className="max-w-7xl mx-auto px-4 sm:px-6 py-10 mt-24 space-y-16 relative z-10"
                    >

                        {/* Print-Only Cover Page */}
                        <div className="hidden print:block print:break-after-always">
                            <div className="flex flex-col items-center justify-center min-h-[90vh] text-center">
                                <div className="w-48 h-24 mb-8">
                                    <img src="/logo_report_final.png" alt="HRTek System" className="w-full h-full object-contain" />
                                </div>
                                <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">{reportTitle}</h1>
                                <div className={`h-2 w-32 bg-gradient-to-r ${reportTheme.color} rounded-full mb-8`}></div>
                                <h2 className="text-3xl font-semibold text-slate-700 mb-12">{brandName}</h2>

                                <div className="space-y-4 text-left max-w-md">
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="font-semibold text-slate-600">Assessment Type:</span>
                                        <span className="text-slate-900">{assessmentId}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="font-semibold text-slate-600">Report Type:</span>
                                        <span className="text-slate-900">{isDetailed ? 'Detailed Analysis' : 'Summary Report'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="font-semibold text-slate-600">Generated Date:</span>
                                        <span className="text-slate-900">{isMounted ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-- --- ----'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="font-semibold text-slate-600">Maturity Score:</span>
                                        <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            {report.executive_summary.overall_maturity_index}
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-16 text-sm text-slate-500">
                                    <p className="font-semibold">Confidential Report</p>
                                    <p>© {isMounted ? new Date().getFullYear() : '2026'} HR TEK SYSTEMS. All rights reserved.</p>
                                </div>
                            </div>
                        </div>

                        {/* 01 Executive Summary */}
                        <motion.section variants={itemVariants} className="space-y-8 print:break-inside-avoid">
                            <div className={`flex items-center gap-4 border-b-4 border-gradient-to-r ${reportTheme.color} pb-4`}>
                                <span className="text-6xl font-black bg-gradient-to-br from-slate-200 to-slate-300 bg-clip-text text-transparent">01</span>
                                <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Executive Summary</h2>
                            </div>

                            {isDetailed ? (
                                /* DETAILED VIEW: High-density score visualization */
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    <div className="lg:col-span-12 bg-white rounded-[2rem] p-8 relative overflow-hidden shadow-2xl border-2 border-blue-100 flex flex-col lg:flex-row items-center gap-12">
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 opacity-60"></div>

                                        {/* Large Score Visualization */}
                                        <div className="relative w-72 h-72 shrink-0">
                                            <motion.div
                                                animate={{ scale: [1, 1.05, 1], opacity: [0.5, 0.8, 0.5] }}
                                                transition={{ duration: 4, repeat: Infinity }}
                                                className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 blur-2xl opacity-40"
                                            ></motion.div>
                                            <div className="relative w-full h-full rounded-full bg-white shadow-2xl flex items-center justify-center border-8 border-slate-50">
                                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                                    <circle cx="144" cy="144" r="125" fill="none" stroke="#f1f5f9" strokeWidth="18" />
                                                    <motion.circle
                                                        cx="144" cy="144" r="125" fill="none" stroke="url(#detailedGrad)" strokeWidth="18" strokeLinecap="round"
                                                        strokeDasharray={`${2 * Math.PI * 125}`}
                                                        initial={{ strokeDashoffset: 2 * Math.PI * 125 }}
                                                        animate={{ strokeDashoffset: 2 * Math.PI * 125 * (1 - report.executive_summary.overall_maturity_index / 100) }}
                                                        transition={{ duration: 2.5, ease: "easeOut" }}
                                                    />
                                                    <defs>
                                                        <linearGradient id="detailedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                                            <stop offset="0%" stopColor="#2563eb" />
                                                            <stop offset="100%" stopColor="#9333ea" />
                                                        </linearGradient>
                                                    </defs>
                                                </svg>
                                                <div className="flex flex-col items-center">
                                                    <span className="text-8xl font-black bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                        <AnimatedCounter value={report.executive_summary.overall_maturity_index} />
                                                    </span>
                                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-widest mt-2">Analytical Index</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-6 relative z-10">
                                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200">
                                                <Activity className="w-4 h-4" /> Comprehensive Maturity Status
                                            </div>
                                            <h3 className="text-4xl font-extrabold text-slate-900 leading-tight">
                                                {report.executive_summary.maturity_category} Stage <span className="text-blue-600">Reached</span>
                                            </h3>
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-inner group-hover:bg-white transition-colors duration-500">
                                                <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Info className="w-3 h-3 text-blue-500" /> Strategic Context
                                                </p>
                                                <p className="text-lg text-slate-700 leading-relaxed italic">
                                                    "{report.executive_summary.executive_recommendation}"
                                                </p>
                                                <p className="mt-4 text-xs text-slate-500 leading-relaxed">
                                                    This score represents a holistic evaluation of your <strong>digital DNA</strong>, measuring everything from software infrastructure to cultural readiness for change. A score above 70 indicates a "Digital Native" profile, while your current level suggests a <strong>Phase 2: Hybrid Transition</strong>.
                                                </p>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {report.executive_summary.key_observations.slice(0, 4).map((obs: string, i: number) => (
                                                    <div key={i} className="flex flex-col gap-1 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-200 transition-colors">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                                                <CheckCircle className="w-3.5 h-3.5" />
                                                            </div>
                                                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Key Pulse</span>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-800 leading-relaxed">{obs}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* STANDARD VIEW: Simplified Maturity Gauge */
                                <div className="space-y-12">
                                    <div className="bg-white rounded-3xl p-10 shadow-xl border-2 border-emerald-100 flex flex-col md:flex-row items-center gap-12">
                                        <div className="w-full md:w-1/2 space-y-8">
                                            <div>
                                                <span className="text-sm font-medium text-emerald-600 uppercase tracking-widest mb-2 block">Current Status</span>
                                                <h3 className="text-5xl font-black text-slate-900">{report.executive_summary.maturity_category}</h3>
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between text-sm font-medium">
                                                    <span className="text-slate-500 uppercase tracking-wider">Maturity Progress</span>
                                                    <span className="text-emerald-600">{report.executive_summary.overall_maturity_index}%</span>
                                                </div>
                                                <div className="h-6 bg-slate-100 rounded-full overflow-hidden p-1 shadow-inner border border-slate-200">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${report.executive_summary.overall_maturity_index}%` }}
                                                        transition={{ duration: 2 }}
                                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-lg relative overflow-hidden"
                                                    >
                                                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)25%,transparent 25%,transparent 50%,rgba(255,255,255,0.2)50%,rgba(255,255,255,0.2)75%,transparent 75%,transparent)] bg-[length:40px_40px] animate-[slide_2s_linear_infinite]"></div>
                                                    </motion.div>
                                                </div>
                                            </div>

                                            <div className="bg-emerald-50 rounded-2xl p-6 border-2 border-emerald-100">
                                                <p className="text-lg text-emerald-800 font-medium leading-relaxed">
                                                    {report.executive_summary.what_this_means[0]}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                                            {[
                                                { label: 'Top Strength', icon: TrendingUp, val: report.executive_summary.key_observations?.[0] || '—' },
                                                { label: 'Priority Gap', icon: AlertTriangle, val: report.executive_summary.key_observations?.[2] || '—' },
                                                { label: 'Assessment ID', icon: FileText, val: assessmentId },
                                                { label: 'Generation Type', icon: Zap, val: 'Executive Brief' }
                                            ].map((item, i) => (
                                                <div key={i} className="p-6 rounded-[2rem] bg-slate-50 border border-slate-200 flex flex-col items-center text-center gap-4 hover:shadow-md transition-shadow">
                                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-emerald-600">
                                                        <item.icon className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-widest block mb-1">{item.label}</span>
                                                        <span className="text-xs font-medium text-slate-800 leading-tight">{item.val}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.section>

                        {/* 02 Comparative Gap Analysis */}
                        <motion.section variants={itemVariants} className="space-y-8">
                            <div className={`flex items-center gap-4 border-b-4 border-gradient-to-r ${reportTheme.color} pb-4`}>
                                <span className="text-6xl font-black bg-gradient-to-br from-slate-200 to-slate-300 bg-clip-text text-transparent">02</span>
                                <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Comparative Gap Analytics</h2>
                            </div>

                            {isDetailed ? (
                                /* DETAILED VIEW: Complex analytical charts */
                                <>
                                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full -mt-32 -mr-32" />
                                        <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                                            <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                                                <Target className="w-8 h-8 text-blue-400" />
                                            </div>
                                            <div className="space-y-2">
                                                <h4 className="text-xl font-black uppercase tracking-tight">Delta Intelligence <span className="text-blue-400">Analysis</span></h4>
                                                <p className="text-sm text-slate-300 leading-relaxed font-normal">
                                                    The visualizations below map your <strong>current footprint</strong> against industry-standard benchmarks. A wider area in the radar chart indicates higher multi-dimensional capabilities, while the bar chart highlights specific functional variances that require immediate strategic intervention.
                                                </p>
                                            </div>
                                        </div>
                                        <div className="mt-6 flex flex-wrap gap-3 relative z-10">
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-medium uppercase tracking-widest text-blue-400">Multi-Axial Mapping</span>
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-medium uppercase tracking-widest text-purple-400">Benchmark Comparison</span>
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-medium uppercase tracking-widest text-pink-400">Variance Detection</span>
                                        </div>
                                    </div>

                                    <div className="grid lg:grid-cols-2 gap-8">
                                        <div className="bg-white rounded-3xl p-8 min-h-[450px] relative overflow-hidden shadow-2xl border-2 border-purple-100">
                                            <h4 className="text-sm font-medium text-purple-600 uppercase tracking-widest mb-6 text-center">Capability Footprint</h4>
                                            <ResponsiveContainer width="100%" height={350}>
                                                <RadarChart data={report.radar_data}>
                                                    <PolarGrid stroke="#e2e8f0" strokeWidth={2} />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                                                    <Radar name="Organization" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} strokeWidth={3} />
                                                    <Tooltip />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="bg-white rounded-3xl p-8 min-h-[450px] relative overflow-hidden shadow-2xl border-2 border-pink-100">
                                            <h4 className="text-sm font-medium text-pink-600 uppercase tracking-widest mb-6 text-center">Benchmark Variance</h4>
                                            <ResponsiveContainer width="100%" height={350}>
                                                <BarChart data={comparativeData} layout="vertical">
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                    <XAxis type="number" domain={[0, 100]} hide />
                                                    <YAxis dataKey="name" type="category" width={75} tick={{ fontSize: 10 }} />
                                                    <Bar dataKey="Score" fill="#ec4899" radius={[0, 8, 8, 0]} />
                                                    <Bar dataKey="Target" fill="#f1f5f9" radius={[0, 8, 8, 0]} stroke="#cbd5e1" strokeDasharray="3 3" />
                                                    <Tooltip />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                /* STANDARD VIEW: Simplified Performance Summary (No Charts) */
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2 bg-white rounded-3xl p-8 shadow-xl border-2 border-slate-100">
                                        <h3 className="text-xl font-semibold text-slate-900 mb-8 flex items-center gap-2">
                                            <TrendingUp className="w-5 h-5 text-emerald-600" /> Organizational Performance Index
                                        </h3>
                                        <div className="space-y-8">
                                            {report.maturity_scorecard.slice(0, 5).map((item: any, i: number) => (
                                                <div key={i} className="space-y-3">
                                                    <div className="flex justify-between items-center">
                                                        <span className="text-sm font-medium text-slate-700">{item.dimension}</span>
                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-md ${item.score < 50 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                            {item.score < 50 ? 'Critical' : 'Healthy'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${item.score}%` }}
                                                                className={`h-full bg-gradient-to-r ${item.score < 50 ? 'from-orange-400 to-red-500' : 'from-emerald-400 to-teal-500'}`}
                                                            />
                                                        </div>
                                                        <span className="text-sm font-black text-slate-900 w-8">{item.score}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-emerald-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
                                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
                                        <div>
                                            <h3 className="text-2xl font-black mb-2">Industry <span className="text-emerald-400">Context</span></h3>
                                            <p className="text-emerald-100 opacity-70 text-sm mb-8 italic">How you stack up against the market average.</p>

                                            <div className="space-y-10">
                                                <div className="relative pt-10 border-t border-white/20">
                                                    <div className="absolute top-0 left-0 -mt-3 px-3 py-1 bg-emerald-500 rounded-full text-[10px] font-semibold uppercase tracking-wider">Gap Analysis</div>
                                                    <div className="text-4xl font-black text-white">{100 - report.executive_summary.overall_maturity_index}%</div>
                                                    <div className="text-xs text-emerald-300 font-medium">Capture Opportunity</div>
                                                </div>
                                                <div className="relative pt-10 border-t border-white/20">
                                                    <div className="absolute top-0 left-0 -mt-3 px-3 py-1 bg-blue-500 rounded-full text-[10px] font-semibold uppercase tracking-wider">Benchmarking</div>
                                                    <div className="text-4xl font-black text-white">+12.4%</div>
                                                    <div className="text-xs text-blue-200 font-medium">Above Sector Average</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-8 pt-6 border-t border-white/10">
                                            <button className="w-full py-4 bg-white text-emerald-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-50 transition-colors shadow-lg">
                                                View Opportunities
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.section>



                        {/* 03 Analysis Scorecard */}
                        {isDetailed && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className={`flex items-center gap-4 border-b-4 border-gradient-to-r ${reportTheme.color} pb-4`}>
                                    <span className="text-6xl font-black bg-gradient-to-br from-slate-200 to-slate-300 bg-clip-text text-transparent">03</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Analysis Scorecard</h2>
                                </div>

                                {/* Explanatory Text */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-500 shadow-md">
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        <strong className="text-green-700">Detailed Breakdown:</strong> Granular assessment of organizational readiness and risk profiles across technical and process domains. High-risk areas are highlighted for prioritization in the strategic roadmap.
                                    </p>
                                </div>

                                <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-2 border-green-100">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-slate-50">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Dimension</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Analytical Score</th>
                                                <th className="px-6 py-4 text-xs font-semibold text-slate-600 uppercase tracking-wider text-center">Risk Assessment</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {report.maturity_scorecard.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 font-medium text-slate-800">{item.dimension}</td>
                                                    <td className="px-6 py-4 text-2xl font-black text-center text-blue-600"><AnimatedCounter value={item.score} /></td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={`px-3 py-1 text-[10px] font-medium rounded-full uppercase ${item.risk_level.includes('High') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                            {item.risk_level}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.section>
                        )}

                        {/* 04 Dimension Insights - Only in Detailed Report */}
                        {isDetailed && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-orange-500 to-red-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-orange-200 to-red-200 bg-clip-text text-transparent">04</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Dimension Insights</h2>
                                </div>

                                {/* Explanatory Text */}
                                <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-6 border-l-4 border-orange-500 shadow-md">
                                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                                        <strong className="text-orange-700">Deep Dive Analysis:</strong> Each interactive card represents a critical capability dimension. Click any card to reveal detailed analysis including current state assessment, business impact, and strategic recommendations.
                                    </p>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        <strong className="text-orange-700">How to Use:</strong> Review each dimension's score and strategic outlook. The flip side reveals critical gaps and actionable recommendations. Prioritize dimensions with scores below 50 for immediate transformation initiatives.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {report.dimension_deep_dives.map((dim: any, i: number) => (
                                        <FlipCard key={i} dim={dim} index={i} />
                                    ))}
                                </div>
                            </motion.section>
                        )}

                        {/* 05 Transformation Roadmap - Choice between Detailed or Basic */}
                        {isDetailed ? (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-indigo-500 to-purple-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-indigo-200 to-purple-200 bg-clip-text text-transparent">05</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Transformation Roadmap</h2>
                                </div>

                                {/* Explanatory Text */}
                                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border-l-4 border-indigo-500 shadow-md">
                                    <p className="text-sm text-slate-700 leading-relaxed mb-3">
                                        <strong className="text-indigo-700 font-semibold">Implementation Strategy:</strong> This phased roadmap outlines a structured approach to digital transformation. Each phase builds upon the previous one, ensuring sustainable change management and minimizing operational disruption.
                                    </p>
                                    <p className="text-sm text-slate-700 leading-relaxed">
                                        <strong className="text-indigo-700 font-semibold">Timeline Guidance:</strong> Immediate actions (0-3 months) focus on quick wins and foundation building. Short-term initiatives (3-12 months) address core capabilities, while medium-term projects (12-24 months) drive strategic differentiation.
                                    </p>
                                </div>

                                <div className="grid lg:grid-cols-3 gap-8">
                                    {report.transformation_roadmap.map((phase: any, i: number) => {
                                        const phaseColors = [
                                            { bg: 'from-blue-500 to-cyan-500', light: 'from-blue-50 to-cyan-50', border: 'border-blue-300', text: 'text-blue-700' },
                                            { bg: 'from-purple-500 to-pink-500', light: 'from-purple-50 to-pink-50', border: 'border-purple-300', text: 'text-purple-700' },
                                            { bg: 'from-orange-500 to-red-500', light: 'from-orange-50 to-red-50', border: 'border-orange-300', text: 'text-orange-700' }
                                        ];
                                        const color = phaseColors[i % phaseColors.length];

                                        return (
                                            <div key={i} className={`bg-gradient-to-br ${color.light} p-8 rounded-3xl border-2 ${color.border} shadow-xl hover:shadow-2xl transition-all group relative overflow-hidden`}>
                                                <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${color.bg}`}></div>
                                                <div className="flex items-center justify-between mb-6 mt-2">
                                                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-lg bg-gradient-to-r ${color.bg} text-white shadow-md`}>{phase.timeline}</span>
                                                    <span className={`text-6xl font-black ${color.text} opacity-10 group-hover:opacity-20 transition-opacity`}>{i + 1}</span>
                                                </div>
                                                <h3 className={`text-xl font-semibold ${color.text} mb-6 uppercase tracking-wider`}>{phase.phase}</h3>
                                                <ul className="space-y-4">
                                                    {phase.actions.map((action: string, idx: number) => (
                                                        <li key={idx} className="flex items-start gap-3 text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                                                            <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center shrink-0 mt-0.5 shadow-md`}>
                                                                <CheckCircle className="w-3 h-3 text-white" />
                                                            </div>
                                                            <span className="leading-relaxed">{action}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.section>
                        ) : (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-blue-500 to-indigo-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-blue-200 to-indigo-200 bg-clip-text text-transparent">03</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Strategy Guidance</h2>
                                </div>
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border-2 border-blue-200 shadow-xl">
                                    <p className="text-lg text-slate-700 mb-6 font-medium">To unlock the next level of digital maturity, we recommend focusing on the following core pillars:</p>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {[
                                            { title: "Infrastructure Optimization", desc: "Move core HR systems to cloud-native platforms to ensure scalability and cross-border accessibility." },
                                            { title: "Process Standardization", desc: "Uniformly document and automate repetitive HR workflows across all business units." },
                                            { title: "Data Democratization", desc: "Implement self-service analytics to empower managers with real-time talent insights." },
                                            { title: "Culture of Agility", desc: "Launch continuous learning programs to bridge Digital Literacy gaps across the workforce." }
                                        ].map((pillar, i) => (
                                            <div key={i} className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-blue-100 shadow-sm">
                                                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 text-white font-semibold">{i + 1}</div>
                                                <div>
                                                    <h4 className="font-semibold text-slate-900 mb-1">{pillar.title}</h4>
                                                    <p className="text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* 06 Risk Assessment Matrix - Only in Detailed Report */}
                        {isDetailed && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-red-500 to-rose-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-red-200 to-rose-200 bg-clip-text text-transparent">06</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Risk Assessment & Mitigation</h2>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {(report.business_risk_opportunity?.top_risks || []).map((risk: any, i: number) => {
                                        const riskColors = [
                                            { bg: 'from-red-500 to-rose-500', light: 'from-red-50 to-rose-50', border: 'border-red-300', text: 'text-red-700' },
                                            { bg: 'from-orange-500 to-amber-500', light: 'from-orange-50 to-amber-50', border: 'border-orange-300', text: 'text-orange-700' },
                                            { bg: 'from-yellow-500 to-orange-500', light: 'from-yellow-50 to-orange-50', border: 'border-yellow-300', text: 'text-yellow-700' }
                                        ];
                                        const color = riskColors[i % riskColors.length];

                                        return (
                                            <div key={i} className={`bg-gradient-to-br ${color.light} p-6 rounded-2xl border-2 ${color.border} shadow-lg`}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${color.bg} text-white text-xs font-medium shadow-md`}>
                                                        {risk.category || `Risk ${i + 1}`}
                                                    </div>
                                                    <AlertTriangle className={`w-6 h-6 ${color.text}`} />
                                                </div>
                                                <h4 className="font-semibold text-slate-900 text-base mb-3">{risk.risk || "Strategic Risk"}</h4>
                                                <div className="space-y-3">
                                                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                        <p className="text-xs font-medium text-slate-600 mb-1">Impact:</p>
                                                        <p className="text-sm text-slate-800">{risk.impact || "High impact on transformation goals"}</p>
                                                    </div>
                                                    <div className="bg-white p-3 rounded-lg border border-slate-200">
                                                        <p className="text-xs font-medium text-slate-600 mb-1">Mitigation Strategy:</p>
                                                        <p className="text-sm text-slate-800">{risk.mitigation || "Implement comprehensive change management"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Opportunity Areas */}
                                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-300 shadow-xl">
                                    <h3 className="text-2xl font-semibold text-green-700 mb-6 flex items-center gap-3">
                                        <TrendingUp className="w-7 h-7" />
                                        Strategic Opportunities
                                    </h3>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {(report.business_risk_opportunity?.opportunity_areas || []).map((opp: any, i: number) => (
                                            <div key={i} className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-md hover:shadow-lg transition-shadow">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shrink-0">
                                                        <Star className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h5 className="font-semibold text-slate-900 text-sm mb-1">{opp.opportunity}</h5>
                                                        <span className="text-xs font-medium text-green-600 px-2 py-1 bg-green-100 rounded-full">{opp.value}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* 07 Investment Recommendations - Only in Detailed Report */}
                        {isDetailed && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-emerald-500 to-teal-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-emerald-200 to-teal-200 bg-clip-text text-transparent">07</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Investment & Resource Allocation</h2>
                                </div>

                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {report.investment_indication.map((inv: any, i: number) => {
                                        const investColors = [
                                            { bg: 'from-emerald-500 to-teal-500', light: 'from-emerald-50 to-teal-50', border: 'border-emerald-300' },
                                            { bg: 'from-blue-500 to-cyan-500', light: 'from-blue-50 to-cyan-50', border: 'border-blue-300' },
                                            { bg: 'from-purple-500 to-indigo-500', light: 'from-purple-50 to-indigo-50', border: 'border-purple-300' },
                                            { bg: 'from-pink-500 to-rose-500', light: 'from-pink-50 to-rose-50', border: 'border-pink-300' }
                                        ];
                                        const color = investColors[i % investColors.length];

                                        return (
                                            <div key={i} className={`bg-gradient-to-br ${color.light} p-6 rounded-2xl border-2 ${color.border} shadow-lg hover:shadow-xl transition-all group`}>
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color.bg} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                                                    <DollarSign className="w-6 h-6 text-white" />
                                                </div>
                                                <h4 className="font-semibold text-slate-900 text-base mb-2">{inv.area}</h4>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-600">Effort Level:</span>
                                                        <span className="font-medium text-slate-900">{inv.effort}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-600">Investment:</span>
                                                        <span className="text-2xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{inv.investment_band}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Budget Breakdown Chart */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-emerald-200 shadow-xl">
                                    <h3 className="text-xl font-semibold text-emerald-700 mb-6">Recommended Budget Allocation</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={report.investment_indication} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="area" tick={{ fill: '#475569', fontSize: 11 }} angle={-15} textAnchor="end" height={80} />
                                            <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '2px solid #10b981', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                            />
                                            <Bar dataKey={(d) => d.investment_band.length * 20} fill="url(#colorInvest)" radius={[8, 8, 0, 0]} name="Investment Level">
                                                {report.investment_indication.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={['#10b981', '#3b82f6', '#8b5cf6', '#ec4899'][index % 4]} />
                                                ))}
                                            </Bar>
                                            <defs>
                                                <linearGradient id="colorInvest" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" />
                                                    <stop offset="100%" stopColor="#14b8a6" />
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.section>
                        )}

                        {/* 08 Key Performance Indicators - Hidden (hardcoded data) */}
                        {false && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-cyan-500 to-blue-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-cyan-200 to-blue-200 bg-clip-text text-transparent">08</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Success Metrics & KPIs</h2>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    {[
                                        { title: "Process Efficiency", current: "45%", target: "85%", metric: "Automation Rate", icon: Zap, color: { bg: 'from-yellow-500 to-orange-500', light: 'from-yellow-50 to-orange-50', border: 'border-yellow-300' } },
                                        { title: "Employee Adoption", current: "52%", target: "90%", metric: "User Engagement", icon: Target, color: { bg: 'from-blue-500 to-cyan-500', light: 'from-blue-50 to-cyan-50', border: 'border-blue-300' } },
                                        { title: "Data Quality", current: "38%", target: "95%", metric: "Accuracy Score", icon: ShieldCheck, color: { bg: 'from-green-500 to-emerald-500', light: 'from-green-50 to-emerald-50', border: 'border-green-300' } },
                                        { title: "Cost Savings", current: "₹2.5M", target: "₹8M", metric: "Annual Savings", icon: DollarSign, color: { bg: 'from-purple-500 to-pink-500', light: 'from-purple-50 to-pink-50', border: 'border-purple-300' } },
                                        { title: "Time to Hire", current: "45 days", target: "20 days", metric: "Avg. Duration", icon: Clock, color: { bg: 'from-red-500 to-rose-500', light: 'from-red-50 to-rose-50', border: 'border-red-300' } },
                                        { title: "Compliance Rate", current: "68%", target: "100%", metric: "Regulatory Adherence", icon: CheckCircle, color: { bg: 'from-indigo-500 to-purple-500', light: 'from-indigo-50 to-purple-50', border: 'border-indigo-300' } }
                                    ].map((kpi, i) => {
                                        const Icon = kpi.icon;
                                        return (
                                            <div key={i} className={`bg-gradient-to-br ${kpi.color.light} p-6 rounded-2xl border-2 ${kpi.color.border} shadow-lg hover:shadow-xl transition-all group`}>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color.bg} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                                                        <Icon className="w-6 h-6 text-white" />
                                                    </div>
                                                    <TrendingUp className="w-5 h-5 text-green-500" />
                                                </div>
                                                <h4 className="font-semibold text-slate-900 text-base mb-1">{kpi.title}</h4>
                                                <p className="text-xs text-slate-600 mb-4">{kpi.metric}</p>
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-slate-600">Current:</span>
                                                        <span className="text-lg font-black text-slate-900">{kpi.current}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-slate-600">Target:</span>
                                                        <span className={`text-lg font-black bg-gradient-to-r ${kpi.color.bg} bg-clip-text text-transparent`}>{kpi.target}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* KPI Progress Chart */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-cyan-200 shadow-xl">
                                    <h3 className="text-xl font-semibold text-cyan-700 mb-6">Performance Improvement Trajectory</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <AreaChart data={[
                                            { month: 'Month 1', current: 45, target: 85 },
                                            { month: 'Month 3', current: 52, target: 85 },
                                            { month: 'Month 6', current: 61, target: 85 },
                                            { month: 'Month 9', current: 70, target: 85 },
                                            { month: 'Month 12', current: 78, target: 85 },
                                            { month: 'Month 18', current: 85, target: 85 }
                                        ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.1} />
                                                </linearGradient>
                                                <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} />
                                            <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '2px solid #06b6d4', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                            />
                                            <Area type="monotone" dataKey="current" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorCurrent)" name="Current Performance" />
                                            <Area type="monotone" dataKey="target" stroke="#10b981" strokeWidth={3} strokeDasharray="5 5" fillOpacity={1} fill="url(#colorTarget)" name="Target" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.section>
                        )}

                        {/* 09 Capability Maturity Heatmap - Only in Detailed Report */}
                        {isDetailed && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-violet-500 to-fuchsia-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-violet-200 to-fuchsia-200 bg-clip-text text-transparent">09</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Capability Maturity Matrix</h2>
                                </div>

                                {/* Heatmap Grid */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-violet-200 shadow-xl overflow-x-auto">
                                    <h3 className="text-xl font-semibold text-violet-700 mb-6">Maturity Level Assessment</h3>
                                    <div className="min-w-[800px]">
                                        <div className="grid grid-cols-6 gap-2">
                                            {/* Header Row */}
                                            <div className="font-semibold text-sm text-slate-700 p-3">Capability</div>
                                            {['Initial', 'Developing', 'Defined', 'Managed', 'Optimizing'].map((level, i) => (
                                                <div key={i} className="font-semibold text-xs text-center text-slate-700 p-3 bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-lg">
                                                    {level}
                                                </div>
                                            ))}

                                            {/* Data Rows */}
                                            {report.dimension_deep_dives.slice(0, 6).map((dim: any, rowIdx: number) => (
                                                <>
                                                    <div key={`label-${rowIdx}`} className="font-medium text-sm text-slate-800 p-3 bg-slate-50 rounded-lg flex items-center">
                                                        {dim.dimension}
                                                    </div>
                                                    {[1, 2, 3, 4, 5].map((level) => {
                                                        const maturityLevel = Math.floor(dim.score / 20);
                                                        const isActive = level <= maturityLevel;
                                                        const colors = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-emerald-500'];

                                                        return (
                                                            <div
                                                                key={`${rowIdx}-${level}`}
                                                                className={`h-12 rounded-lg transition-all ${isActive ? colors[level - 1] : 'bg-slate-100'} ${isActive ? 'shadow-md' : ''}`}
                                                            >
                                                                {isActive && level === maturityLevel && (
                                                                    <div className="h-full flex items-center justify-center">
                                                                        <CheckCircle className="w-5 h-5 text-white" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Maturity Distribution */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-violet-200 shadow-xl">
                                    <h3 className="text-xl font-semibold text-violet-700 mb-6">Maturity Distribution</h3>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={report.maturity_scorecard.map((item: any) => ({
                                            name: item.dimension.substring(0, 15),
                                            score: item.score,
                                            maturity: Math.floor(item.score / 20)
                                        }))} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} angle={-45} textAnchor="end" height={100} />
                                            <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '2px solid #8b5cf6', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                            />
                                            <Bar dataKey="score" fill="url(#colorMaturity)" radius={[8, 8, 0, 0]}>
                                                {report.maturity_scorecard.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Bar>
                                            <defs>
                                                <linearGradient id="colorMaturity" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#8b5cf6" />
                                                    <stop offset="100%" stopColor="#d946ef" />
                                                </linearGradient>
                                            </defs>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.section>
                        )}

                        {/* 10 Competitive Benchmarking - Only in Detailed Report */}
                        {isDetailed && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-sky-500 to-blue-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-sky-200 to-blue-200 bg-clip-text text-transparent">10</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Industry Benchmarking</h2>
                                </div>

                                {/* Benchmark Comparison */}
                                <div className="grid md:grid-cols-3 gap-6">
                                    {[
                                        { label: 'Industry Average', score: 65, color: 'from-slate-500 to-slate-600', light: 'from-slate-50 to-slate-100', border: 'border-slate-300' },
                                        { label: 'Your Organization', score: report.executive_summary.overall_maturity_index, color: 'from-blue-500 to-cyan-500', light: 'from-blue-50 to-cyan-50', border: 'border-blue-300' },
                                        { label: 'Industry Leaders', score: 88, color: 'from-green-500 to-emerald-500', light: 'from-green-50 to-emerald-50', border: 'border-green-300' }
                                    ].map((bench, i) => (
                                        <div key={i} className={`bg-gradient-to-br ${bench.light} p-8 rounded-3xl border-2 ${bench.border} shadow-xl`}>
                                            <h4 className="font-semibold text-slate-900 text-lg mb-6">{bench.label}</h4>
                                            <div className="relative w-40 h-40 mx-auto mb-6">
                                                <svg className="transform -rotate-90 w-40 h-40">
                                                    <circle cx="80" cy="80" r="70" stroke="#e2e8f0" strokeWidth="12" fill="none" />
                                                    <circle
                                                        cx="80"
                                                        cy="80"
                                                        r="70"
                                                        stroke={`url(#gradient-${i})`}
                                                        strokeWidth="12"
                                                        fill="none"
                                                        strokeDasharray={`${2 * Math.PI * 70}`}
                                                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - bench.score / 100)}`}
                                                        strokeLinecap="round"
                                                    />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className={`text-4xl font-black bg-gradient-to-r ${bench.color} bg-clip-text text-transparent`}>
                                                        {bench.score}
                                                    </span>
                                                </div>
                                                <defs>
                                                    <linearGradient id={`gradient-${i}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                                        <stop offset="0%" stopColor={bench.color.split(' ')[0].replace('from-', '#')} />
                                                    </linearGradient>
                                                </defs>
                                            </div>
                                            <p className="text-center text-sm text-slate-600">
                                                {i === 0 && 'Typical performance across similar organizations'}
                                                {i === 1 && 'Current organizational maturity level'}
                                                {i === 2 && 'Best-in-class performance benchmark'}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Radar Comparison */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-sky-200 shadow-xl">
                                    <h3 className="text-xl font-semibold text-sky-700 mb-6">Multi-Dimensional Comparison</h3>
                                    <ResponsiveContainer width="100%" height={400}>
                                        <RadarChart data={report.radar_data.map((item: any) => ({
                                            ...item,
                                            Industry: 65,
                                            Leaders: 88
                                        }))}>
                                            <PolarGrid stroke="#e2e8f0" strokeWidth={2} />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} />
                                            <Radar name="Your Organization" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={3} />
                                            <Radar name="Industry Average" dataKey="Industry" stroke="#64748b" fill="#64748b" fillOpacity={0.1} strokeWidth={2} strokeDasharray="5 5" />
                                            <Radar name="Industry Leaders" dataKey="Leaders" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} strokeDasharray="3 3" />
                                            <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '2px solid #0ea5e9', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                            />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.section>
                        )}

                        {/* 11 Technology Stack Analysis - Hidden (hardcoded data) */}
                        {false && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-teal-500 to-cyan-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-teal-200 to-cyan-200 bg-clip-text text-transparent">11</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Technology Stack Assessment</h2>
                                </div>

                                {/* Current vs Recommended */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Current Stack */}
                                    <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 border-2 border-red-200 shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-md">
                                                <AlertTriangle className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-semibold text-red-700">Current Stack</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { name: 'HRIS System', status: 'Legacy', risk: 'High' },
                                                { name: 'Payroll Software', status: 'On-Premise', risk: 'Medium' },
                                                { name: 'Recruitment Platform', status: 'Outdated', risk: 'High' },
                                                { name: 'Performance Management', status: 'Manual', risk: 'High' },
                                                { name: 'Learning Management', status: 'Limited', risk: 'Medium' }
                                            ].map((tech, i) => (
                                                <div key={i} className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-slate-900 text-sm">{tech.name}</span>
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${tech.risk === 'High' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                                            {tech.risk} Risk
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600">{tech.status}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recommended Stack */}
                                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border-2 border-green-200 shadow-xl">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-md">
                                                <CheckCircle className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-semibold text-green-700">Recommended Stack</h3>
                                        </div>
                                        <div className="space-y-3">
                                            {[
                                                { name: 'Cloud HRIS', benefit: 'Scalable & Integrated', impact: 'High' },
                                                { name: 'Automated Payroll', benefit: 'Real-time Processing', impact: 'High' },
                                                { name: 'AI Recruitment', benefit: 'Smart Matching', impact: 'High' },
                                                { name: 'Continuous Performance', benefit: 'Data-Driven Insights', impact: 'Medium' },
                                                { name: 'Adaptive Learning', benefit: 'Personalized Paths', impact: 'Medium' }
                                            ].map((tech, i) => (
                                                <div key={i} className="bg-white p-4 rounded-xl border border-green-200 shadow-sm">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-medium text-slate-900 text-sm">{tech.name}</span>
                                                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${tech.impact === 'High' ? 'bg-green-100 text-green-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                            {tech.impact} Impact
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-600">{tech.benefit}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Technology Adoption Timeline */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-teal-200 shadow-xl">
                                    <h3 className="text-xl font-semibold text-teal-700 mb-6">Technology Adoption Roadmap</h3>
                                    <div className="space-y-4">
                                        {[
                                            { quarter: 'Q1 2026', tech: 'Cloud HRIS Migration', progress: 25 },
                                            { quarter: 'Q2 2026', tech: 'Automated Payroll Implementation', progress: 60 },
                                            { quarter: 'Q3 2026', tech: 'AI Recruitment Platform', progress: 40 },
                                            { quarter: 'Q4 2026', tech: 'Performance Management System', progress: 15 }
                                        ].map((item, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <span className="font-semibold text-slate-900 text-sm">{item.tech}</span>
                                                        <span className="ml-3 text-xs text-slate-600">{item.quarter}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-teal-600">{item.progress}%</span>
                                                </div>
                                                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${item.progress}%` }}
                                                        transition={{ duration: 1, delay: i * 0.2 }}
                                                        className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full shadow-md"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* 12 Change Impact Assessment - Hidden (hardcoded data) */}
                        {false && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-amber-500 to-yellow-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-amber-200 to-yellow-200 bg-clip-text text-transparent">12</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Change Impact & Readiness</h2>
                                </div>

                                {/* Stakeholder Impact */}
                                <div className="grid md:grid-cols-4 gap-6">
                                    {[
                                        { group: 'Leadership', impact: 'High', readiness: 75, color: 'from-purple-500 to-indigo-500', light: 'from-purple-50 to-indigo-50', border: 'border-purple-300' },
                                        { group: 'HR Team', impact: 'Critical', readiness: 60, color: 'from-blue-500 to-cyan-500', light: 'from-blue-50 to-cyan-50', border: 'border-blue-300' },
                                        { group: 'Managers', impact: 'Medium', readiness: 45, color: 'from-green-500 to-emerald-500', light: 'from-green-50 to-emerald-50', border: 'border-green-300' },
                                        { group: 'Employees', impact: 'Medium', readiness: 40, color: 'from-orange-500 to-amber-500', light: 'from-orange-50 to-amber-50', border: 'border-orange-300' }
                                    ].map((stakeholder, i) => (
                                        <div key={i} className={`bg-gradient-to-br ${stakeholder.light} p-6 rounded-2xl border-2 ${stakeholder.border} shadow-lg`}>
                                            <h4 className="font-semibold text-slate-900 text-base mb-4">{stakeholder.group}</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-xs text-slate-600">Impact Level:</span>
                                                        <span className="text-xs font-semibold text-slate-900">{stakeholder.impact}</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs text-slate-600">Readiness:</span>
                                                        <span className={`text-lg font-black bg-gradient-to-r ${stakeholder.color} bg-clip-text text-transparent`}>
                                                            {stakeholder.readiness}%
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${stakeholder.readiness}%` }}
                                                            transition={{ duration: 1, delay: i * 0.15 }}
                                                            className={`h-full bg-gradient-to-r ${stakeholder.color} rounded-full`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Change Readiness Chart */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-amber-200 shadow-xl">
                                    <h3 className="text-xl font-semibold text-amber-700 mb-6">Organizational Change Readiness</h3>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis type="number" dataKey="impact" name="Impact" unit="%" domain={[0, 100]} tick={{ fill: '#475569' }} label={{ value: 'Change Impact', position: 'bottom', fill: '#64748b' }} />
                                            <YAxis type="number" dataKey="readiness" name="Readiness" unit="%" domain={[0, 100]} tick={{ fill: '#475569' }} label={{ value: 'Readiness Level', angle: -90, position: 'left', fill: '#64748b' }} />
                                            <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#fff', border: '2px solid #f59e0b', borderRadius: '12px' }} />
                                            <Scatter name="Stakeholder Groups" data={[
                                                { impact: 90, readiness: 75, name: 'Leadership' },
                                                { impact: 95, readiness: 60, name: 'HR Team' },
                                                { impact: 60, readiness: 45, name: 'Managers' },
                                                { impact: 55, readiness: 40, name: 'Employees' }
                                            ]} fill="#f59e0b">
                                                {[0, 1, 2, 3].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][index]} />
                                                ))}
                                            </Scatter>
                                            <ReferenceLine x={50} stroke="#94a3b8" strokeDasharray="3 3" />
                                            <ReferenceLine y={50} stroke="#94a3b8" strokeDasharray="3 3" />
                                        </ScatterChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.section>
                        )}

                        {/* 13 Financial ROI Projections - Hidden (hardcoded data) */}
                        {false && (
                            <motion.section variants={itemVariants} className="space-y-8">
                                <div className="flex items-center gap-4 border-b-4 border-gradient-to-r from-lime-500 to-green-500 pb-4">
                                    <span className="text-6xl font-black bg-gradient-to-br from-lime-200 to-green-200 bg-clip-text text-transparent">13</span>
                                    <h2 className="text-4xl font-semibold text-slate-900 tracking-tight">Financial Impact & ROI</h2>
                                </div>

                                {/* ROI Summary Cards */}
                                <div className="grid md:grid-cols-4 gap-6">
                                    {[
                                        { label: 'Total Investment', value: '₹45M', subtext: 'Over 18 months', icon: DollarSign, color: 'from-red-500 to-rose-500', light: 'from-red-50 to-rose-50', border: 'border-red-300' },
                                        { label: 'Expected Savings', value: '₹78M', subtext: 'Annual recurring', icon: TrendingUp, color: 'from-green-500 to-emerald-500', light: 'from-green-50 to-emerald-50', border: 'border-green-300' },
                                        { label: 'ROI', value: '173%', subtext: 'Within 24 months', icon: Target, color: 'from-blue-500 to-cyan-500', light: 'from-blue-50 to-cyan-50', border: 'border-blue-300' },
                                        { label: 'Payback Period', value: '14 Mo', subtext: 'Break-even point', icon: Clock, color: 'from-purple-500 to-pink-500', light: 'from-purple-50 to-pink-50', border: 'border-purple-300' }
                                    ].map((metric, i) => {
                                        const Icon = metric.icon;
                                        return (
                                            <div key={i} className={`bg-gradient-to-br ${metric.light} p-6 rounded-2xl border-2 ${metric.border} shadow-lg hover:shadow-xl transition-all group`}>
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4 shadow-md group-hover:scale-110 transition-transform`}>
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <h4 className="text-xs font-semibold text-slate-600 mb-2">{metric.label}</h4>
                                                <p className={`text-3xl font-black bg-gradient-to-r ${metric.color} bg-clip-text text-transparent mb-1`}>
                                                    {metric.value}
                                                </p>
                                                <p className="text-xs text-slate-600">{metric.subtext}</p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Cost-Benefit Analysis Chart */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-lime-200 shadow-xl">
                                    <h3 className="text-xl font-semibold text-lime-700 mb-6">Cost vs Benefit Projection (36 Months)</h3>
                                    <ResponsiveContainer width="100%" height={350}>
                                        <AreaChart data={[
                                            { month: 'M0', cost: 0, benefit: 0, cumulative: 0 },
                                            { month: 'M6', cost: 15, benefit: 8, cumulative: -7 },
                                            { month: 'M12', cost: 30, benefit: 25, cumulative: -5 },
                                            { month: 'M14', cost: 35, benefit: 35, cumulative: 0 },
                                            { month: 'M18', cost: 45, benefit: 52, cumulative: 7 },
                                            { month: 'M24', cost: 45, benefit: 78, cumulative: 33 },
                                            { month: 'M30', cost: 45, benefit: 104, cumulative: 59 },
                                            { month: 'M36', cost: 45, benefit: 130, cumulative: 85 }
                                        ]} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1} />
                                                </linearGradient>
                                                <linearGradient id="colorBenefit" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                            <XAxis dataKey="month" tick={{ fill: '#475569', fontSize: 11 }} />
                                            <YAxis tick={{ fill: '#475569', fontSize: 11 }} label={{ value: '₹ Million', angle: -90, position: 'insideLeft', fill: '#64748b' }} />
                                            <Tooltip
                                                contentStyle={{ backgroundColor: '#fff', border: '2px solid #84cc16', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                                itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                                            />
                                            <Area type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorCost)" name="Investment" />
                                            <Area type="monotone" dataKey="benefit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorBenefit)" name="Benefits" />
                                            <ReferenceLine y={0} stroke="#64748b" strokeDasharray="3 3" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Savings Breakdown */}
                                <div className="bg-white rounded-3xl p-8 border-2 border-lime-200 shadow-xl">
                                    <h3 className="text-xl font-semibold text-lime-700 mb-6">Annual Savings Breakdown</h3>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {[
                                            { category: 'Process Automation', amount: '₹28M', percentage: 36 },
                                            { category: 'Reduced Errors', amount: '₹18M', percentage: 23 },
                                            { category: 'Time Savings', amount: '₹15M', percentage: 19 },
                                            { category: 'Compliance Efficiency', amount: '₹12M', percentage: 15 },
                                            { category: 'Better Decision Making', amount: '₹5M', percentage: 7 }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4 bg-gradient-to-br from-lime-50 to-green-50 rounded-xl border border-lime-200">
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="font-semibold text-slate-900 text-sm">{item.category}</span>
                                                        <span className="text-lg font-black text-green-600">{item.amount}</span>
                                                    </div>
                                                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            whileInView={{ width: `${item.percentage}%` }}
                                                            transition={{ duration: 1, delay: i * 0.1 }}
                                                            className="h-full bg-gradient-to-r from-lime-500 to-green-500 rounded-full"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {/* Footer */}
                        <div className="border-t-2 border-slate-200 pt-12 mt-12 pb-12">
                            <p className="text-center text-xs font-semibold text-slate-500 uppercase tracking-[0.2em] mb-4">Confidential Advisory Report</p>
                            <div className="flex justify-center items-center gap-2 text-slate-600">
                                <span className="font-black text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">HR TEK SYSTEMS</span>
                                <span>•</span>
                                <span>© 2026</span>
                            </div>
                        </div>

                    </motion.main>
                ) : (
                    <motion.div
                        key="narrative"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="mt-24"
                    >
                        <BoardDossierRenderer report={data?.result || data} engineName="Digital Maturity" />
                    </motion.div>
                )}
            </AnimatePresence>
            <StrategicReportPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                reportData={reportData}
                isGenerating={isGenerating}
                engineTitle={assessmentId === "Profiling Assessment" ? "Profiling Assessment" : "Digital Maturity Engine"}
                brandName={brandName}
            />
            <div className="print-watermark hidden print:block">HRTEKSYSTEM</div>
        </div>
    );
}
