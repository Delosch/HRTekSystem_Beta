import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import BoardDossierRenderer from "./BoardDossierRenderer";
import { StrategicReportPreview } from "../reports/StrategicReportPreview";
import { useReportGenerator } from "~/hooks/useReportGenerator";
import {
    ArrowLeft, Download, TrendingUp, AlertTriangle, CheckCircle,
    Lightbulb, ChevronDown, ChevronUp, FileText, Target, Activity, Cpu, Database, Network
} from "lucide-react";
import {
    ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";
import { ENGINES } from "~/constants/engines";

// Use the canonical engine definition so report generation always
// uses the registered engine name instead of a hardcoded string.
const TECH_MATURITY_ENGINE = ENGINES.HR_TECH_MATURITY;

interface TechMaturityReportProps {
    data: any;
    brandName: string;
    responses?: any;
    questions?: any;
}

export default function TechMaturityReport({ data, brandName }: TechMaturityReportProps) {
    const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    // AI Report State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { reportData, isGenerating, reportError, generate } = useReportGenerator();

    const handleExportPDF = () => {
        setIsPreviewOpen(true);
        generate(
        // Use the canonical display name from the engine registry.
        TECH_MATURITY_ENGINE.displayName,
        (data as any)?.responses
        );
    };

    const result = (data?.result || {}) as any;
    const maturity = result?.maturity_analysis || {};
    const consulting = result?.consulting_report || {};
    const viz = result?.visualization_data || {};

    const overallScore = maturity?.overall_score?.percentage || consulting?.executive_summary?.overall_maturity_index || 0;

    // Extrapolate KPIs from dimensional scores
    const dimScores = maturity?.dimensional_scores || consulting?.maturity_scorecard || [];
    const infra = dimScores.find((d: any) => d.dimension?.toLowerCase().includes("infra"))?.percentage || dimScores?.[0]?.score || 0;
    const auto = dimScores.find((d: any) => d.dimension?.toLowerCase().includes("auto"))?.percentage || dimScores?.[1]?.score || 0;
    const integ = dimScores.find((d: any) => d.dimension?.toLowerCase().includes("integ"))?.percentage || dimScores?.[2]?.score || 0;

    const kpis = [
        {
            title: "Overall Maturity",
            value: overallScore,
            unit: "/100",
            description: "Consolidated health of your current technology stack compared to global HR benchmarks.",
            color: "blue",
            icon: Target
        },
        {
            title: "Infrastructure",
            value: infra,
            unit: "%",
            description: "Cloud readiness and hardware scalability to support modern HR applications.",
            color: "green",
            icon: Cpu
        },
        {
            title: "Automation",
            value: auto,
            unit: "%",
            description: "Percentage of repetitive HR tasks currently handled by automated workflows or bots.",
            color: "purple",
            icon: Activity
        },
        {
            title: "Integration",
            value: integ,
            unit: "%",
            description: "How well your different HR tools communicate and share data in real-time.",
            color: "orange",
            icon: Network
        },
    ];

    const radarData = viz?.radar_chart ? viz.radar_chart.labels.map((l: string, i: number) => ({
        subject: l,
        A: viz.radar_chart.current_scores[i] || 0,
        fullMark: 100
    })) : [
        { subject: 'Infrastructure', A: infra, fullMark: 100 },
        { subject: 'Automation', A: auto, fullMark: 100 },
        { subject: 'Integration', A: integ, fullMark: 100 }
    ];

    const chartData = viz?.bar_chart?.dimensions?.map((d: string, i: number) => ({
        name: d,
        progress: viz.bar_chart.answeredQuestions[i] || 0
    })) || [];

    const gaps = consulting?.gap_data?.map((g: any) => ({
        title: g.name || "Gap identified",
        text: g.description || "Strategic intervention required",
        explanation: g.explanation || `Impact level: ${g.impact || 'High'}. Improving this will increase overall efficiency.`,
        gap: g.gap || 10,
        priority: g.impact === 10 ? "CRITICAL" : g.impact > 7 ? "HIGH" : "MEDIUM"
    })) || maturity?.gaps?.map((g: any) => ({
        title: g.name || g.gap_area || "Gap identified",
        text: g.description || "Strategic intervention required",
        explanation: g.explanation || `Impact: ${g.impact || 'High'}`,
        gap: g.gap || g.severity || 10,
        priority: (g.priority || "HIGH").toUpperCase()
    })) || [];

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden mb-16">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md p-1">
                                <img src="/logo_icon_final.png" alt="HRTek" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">{brandName}</h1>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="font-medium text-blue-600 uppercase tracking-wide">AI-driven HR Tech Diagnostics</span>
                                    <span className="text-slate-400">•</span>
                                    <nav className="flex items-center gap-2">
                                        <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
                                        <span>/</span>
                                        <span className="font-medium text-slate-900">Tech Diagnostics</span>
                                    </nav>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-1 mr-4">
                                <button onClick={() => setActiveTab("overview")} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "overview" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>Dashboard</button>
                                <button onClick={() => setActiveTab("narrative")} className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all ${activeTab === "narrative" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>Detailed Report</button>
                            </div>
                            <button
                                onClick={handleExportPDF}
                                className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg ml-2">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <AnimatePresence mode="wait">
                {activeTab === "overview" ? (
                    <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12 max-w-7xl mx-auto">
                        <div className="flex items-start gap-8 print:mt-12">
                            <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center border border-slate-100 p-4 font-bold text-blue-500">
                                <Target className="w-full h-full" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">AI-driven HR Tech Diagnostics</h1>
                                <p className="text-xl font-semibold text-slate-400">Comprehensive assessment of your HR technology landscape and digital readiness</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {kpis.map((kpi: any, i: number) => (
                                <div key={i} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                                    <div className="flex justify-between items-start mb-6">                                         <div className={`p-3 rounded-2xl ${kpi.color === 'blue' ? 'bg-blue-600' :
                                            kpi.color === 'green' ? 'bg-green-500' :
                                                kpi.color === 'purple' ? 'bg-purple-600' : 'bg-orange-500'
                                            } text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                            <kpi.icon className="w-5 h-5" />
                                        </div>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mt-2">{kpi.title}</span>
                                    </div>
                                    <div className="flex items-baseline gap-2 mb-4">
                                        <span className="text-5xl font-black text-slate-800 tracking-tighter">{kpi.value}</span>
                                        <span className="text-xl font-medium text-slate-400">{kpi.unit}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                        {kpi.description}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                            <div className="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col items-center">
                                <div className="flex items-center gap-2 mb-6 w-full">
                                    <Activity className="w-5 h-5 text-blue-500" />
                                    <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">Audit Completion</h2>
                                </div>

                                <div className="relative w-56 h-56 mb-10">
                                    <svg className="w-full h-full transform -rotate-90">
                                        <circle cx="112" cy="112" r="100" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
                                        <circle cx="112" cy="112" r="100" stroke="#10b981" strokeWidth="16" fill="transparent"
                                            strokeDasharray={2 * Math.PI * 100}
                                            strokeDashoffset={0}
                                            strokeLinecap="round" />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-5xl font-black text-slate-800">100%</span>
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Confidence</span>
                                    </div>
                                </div>

                                <div className="w-full space-y-4">
                                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                        <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em] mb-3">Diagnostic Status</h4>
                                        <p className="text-sm font-normal text-slate-700 leading-relaxed">
                                            Our AI engine has successfully parsed all 10 diagnostic vectors. The data synthesis is <strong>Optimized</strong> and reflects your organization's real-world capacity.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                                <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Technology performance Radar</h2>
                                <p className="text-sm font-semibold text-slate-400 mb-8 uppercase tracking-widest">Multi-dimensional Infrastructure Scorecard</p>
                                <div className="h-[350px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="#f1f5f9" />
                                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }} />
                                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                                            <Radar name="Current Maturity" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={4} />
                                            <Radar name="Industry Benchmark" dataKey="fullMark" stroke="#f1f5f9" fill="none" strokeDasharray="5 5" />
                                            <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 mt-6">
                                    <p className="text-xs text-blue-800 leading-relaxed font-medium italic">
                                        "Interpretation: Your 'Digital Infrastructure' is leading the curve, but 'Integration Capability' remains a strategic bottleneck. Prioritize centralized API management to unify your ecosystem."
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tight">Critical Deployment Gaps</h2>
                                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-2">Actionable tactical interventions required</p>
                                </div>
                                <div className="px-6 py-3 bg-red-50 border border-red-200 rounded-2xl text-[10px] font-semibold text-red-600 uppercase tracking-[0.2em] shadow-sm">
                                    Strategic Priority: High
                                </div>
                            </div>

                            <div className="space-y-4">
                                {gaps.map((row: any, i: number) => (
                                    <div key={i} className="flex flex-col lg:flex-row lg:items-center justify-between p-8 rounded-[2.5rem] border border-slate-50 transition-all hover:bg-slate-50 relative group">
                                        <div className="max-w-2xl">                                             <div className="flex items-center gap-3 mb-2">
                                                <h4 className="text-xl font-black text-slate-800">{row.title}</h4>
                                                <span className={`px-3 py-1 rounded-lg text-[9px] font-bold tracking-widest uppercase ${row.priority === 'CRITICAL' ? 'bg-red-600 text-white' : row.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'}`}>
                                                    {row.priority}
                                                </span>
                                            </div>
                                            <p className="text-sm font-normal text-blue-600 mb-3">{row.text}</p>
                                            <p className="text-xs text-slate-500 leading-relaxed font-normal">
                                                {row.explanation}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-8 mt-6 lg:mt-0 lg:border-l border-slate-200 lg:pl-10">
                                            <div className="text-right">
                                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Maturity Gap</span>
                                                <span className="text-4xl font-black text-slate-800 tracking-tighter">-{row.gap}%</span>
                                            </div>
                                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Lightbulb className="w-6 h-6" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
                            <h2 className="text-3xl font-black text-slate-800 mb-12">Maturity Progress Over Time</h2>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }} dy={20} />
                                        <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }} dx={-10} unit="%" />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorProgress)" dot={{ r: 6, fill: "#fff", stroke: "#3b82f6", strokeWidth: 3 }} activeDot={{ r: 10 }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div key="narrative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-7xl mx-auto">
                        <BoardDossierRenderer report={data?.result || data} engineName="Tech Maturity" />
                    </motion.div>
                )}
            </AnimatePresence>

            <StrategicReportPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                reportData={reportData}
                isGenerating={isGenerating}
                engineTitle={TECH_MATURITY_ENGINE.displayName}
                brandName={brandName}
            />

            <style>{`
                @media print {
                    @page { margin: 1.5cm; }
                    header, nav, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .min-h-screen, .bg-[#f8fafc] { background: white !important; }
                    main { padding: 0 !important; max-width: 100% !important; }
                    .bg-white, .bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50, .bg-slate-50 { background: white !important; border: 1px solid #e2e8f0 !important; }
                    .text-slate-800, .text-slate-400, .text-slate-500 { color: black !important; }
                    .text-blue-600, .text-green-500, .text-red-600 { color: black !important; font-weight: 600 !important; }
                    h1, h2, h3, h4 { color: black !important; page-break-after: avoid; font-weight: 800 !important; }
                    section, .grid { page-break-inside: avoid; margin-bottom: 2rem !important; }
                    .shadow-sm, .shadow-md, .shadow-lg, .shadow-xl { box-shadow: none !important; }
                    .rounded-[3rem], .rounded-[2.5rem], .rounded-3xl, .rounded-2xl { border-radius: 0.75rem !important; }

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
                    
                    /* Force Charts to be visible */
                    .recharts-responsive-container { min-height: 300px !important; }
                }
            `}</style>
            <div className="print-watermark hidden print:block">HRTEKSYSTEM</div>
        </div>
    );
}

function BarChart3Icon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    );
}
