import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import {
    ArrowLeft, Download, TrendingUp, CheckCircle,
    Lightbulb, ChevronDown, ChevronUp, Map, Clock, DollarSign, Target
} from "lucide-react";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

import { motion, AnimatePresence } from "framer-motion";
import BoardDossierRenderer from "./BoardDossierRenderer";
import { useFetcher } from "@remix-run/react";
import { StrategicReportPreview } from "../reports/StrategicReportPreview";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";

interface RoadmapReportProps {
    data: any;
    brandName: string;
    companyLogo?: string;
    responses?: any;
    questions?: any;
}

export default function RoadmapReport({ data, brandName, companyLogo, responses, questions }: RoadmapReportProps) {
    const [expandedInsight, setExpandedInsight] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState("overview");

    // AI Report State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [reportData, setReportData] = useState<HTIAdvisoryContent | null>(null);
    const fetcher = useFetcher();
    const isGenerating = fetcher.state !== "idle";

    useEffect(() => {
        if (fetcher.data && (fetcher.data as any).success) {
            setReportData((fetcher.data as any).advisory);
        } else if (fetcher.data && (fetcher.data as any).error) {
            console.error("Roadmap Report Generation Error:", (fetcher.data as any).error);
        }
    }, [fetcher.data]);

    const handleExportPDF = () => {
        setIsPreviewOpen(true);
        if (!reportData) {
            fetcher.submit(
                {
                    intent: "generate_report",
                    params: "HR Transformation Roadmap Generator",
                    answers: responses || {},
                    progress: 100
                },
                { method: "post", encType: "application/json" }
            );
        }
    };

    const result = (data?.result || {}) as any;
    const consulting = result?.consulting_report || {};
    const maturity = result?.maturity_analysis || {};
    const metadata = result?.assessment_metadata || {};

    // KPI data (Real or Fallback)
    const overallScore = maturity?.overall_score?.percentage || consulting?.executive_summary?.overall_maturity_index || 0;
    const answered = metadata?.answered_questions || 0;
    const total = metadata?.total_questions || 20;
    const roi = result?.success_metrics?.projected_roi || 300;

    const kpiCards = [
        {
            title: "Overall Progress",
            value: overallScore,
            unit: "%",
            subtitle: "Based on assessment",
            color: "blue",
            icon: TrendingUp
        },
        {
            title: "Milestones Defined",
            value: answered.toString(),
            unit: `/${total}`,
            subtitle: "Engagement status",
            color: "green",
            icon: CheckCircle
        },
        {
            title: "Projected ROI",
            value: roi,
            unit: "%",
            subtitle: "24-month forecast",
            color: "purple",
            icon: DollarSign
        },
        {
            title: "Timeline",
            value: 24,
            unit: "months",
            subtitle: "Implementation cycle",
            color: "orange",
            icon: Clock
        }
    ];

    // Roadmap Phases (Map from consulting report)
    const roadmap = consulting?.transformation_roadmap || [];
    const colors = ["#10b981", "#3b82f6", "#8b5cf6", "#94a3b8"];
    const statuses = ["Completed", "In Progress", "In Progress", "Planned"];

    const phases = roadmap.length > 0 ? roadmap.map((item: any, idx: number) => ({
        id: idx + 1,
        title: item.phase || "Phase " + (idx + 1),
        timeline: item.timeline || "TBD",
        progress: idx === 0 ? 100 : idx === 1 ? 65 : idx === 2 ? 30 : 0,
        status: statuses[idx] || "Planned",
        milestones: idx === 0 ? "5/5 completed" : idx === 1 ? "5/8 completed" : "Ongoing",
        initiatives: item.actions || [],
        color: colors[idx % colors.length]
    })) : [
        {
            id: 1,
            title: "Quick Wins",
            timeline: "0-3 months",
            progress: 100,
            status: "Completed",
            milestones: "5/5 milestones completed",
            initiatives: ["Employee Self-Service Portal", "Digital Onboarding", "Mobile App Launch"],
            color: "#10b981"
        },
        {
            id: 2,
            title: "Foundation",
            timeline: "3-9 months",
            progress: 65,
            status: "In Progress",
            milestones: "5/8 milestones completed",
            initiatives: ["Core HRMS Implementation", "Performance Management System", "Learning Platform"],
            color: "#3b82f6"
        }
    ];

    // ROI Projection Chart Data
    const chartData = result?.visualization_data?.roi_curve || [
        { name: 'Q1', roi: -5 },
        { name: 'Q2', roi: -30 },
        { name: 'Q3', roi: -15 },
        { name: 'Q4', roi: 20 },
        { name: 'Q5', roi: 45 },
        { name: 'Q6', roi: 75 },
        { name: 'Q7', roi: 82 },
        { name: 'Q8', roi: 95 },
    ];

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-50 border-blue-200",
            green: "bg-green-50 border-green-200",
            purple: "bg-purple-50 border-purple-200",
            orange: "bg-orange-50 border-orange-200"
        };
        return colors[color] || colors.blue;
    };

    const getIconBgClass = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-500",
            green: "bg-green-500",
            purple: "bg-purple-500",
            orange: "bg-orange-500"
        };
        return colors[color] || colors.blue;
    };

    const priorities = consulting?.transformation_priority_matrix || [
        { initiative: "Infrastructure", priority: "CRITICAL", text: "85% maturity reached. Focus on high-load stability.", type: "green" },
        { initiative: "API Integration", priority: "HIGH", text: "Address silos between payroll and HRMS.", type: "blue" },
        { initiative: "EX Platform", priority: "MEDIUM", text: "Implement unified employee experience portal.", type: "yellow" }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-4">
                                <img src="/hrtek_logo.png" alt="HRTek" className="h-9 w-auto object-contain" />
                                {companyLogo && (
                                    <>
                                        <div className="h-6 w-[1px] bg-slate-200"></div>
                                        <img src={companyLogo} alt={brandName} className="h-9 w-auto object-contain max-w-[120px] rounded" />
                                    </>
                                )}
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">{brandName}</h1>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="font-bold text-blue-600 uppercase tracking-wide">Digital Transformation Roadmap</span>
                                    <span className="text-gray-400">•</span>
                                    <nav className="flex items-center gap-2">
                                        <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
                                        <span>/</span>
                                        <span className="font-semibold text-gray-900">Roadmap & ROI</span>
                                    </nav>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-100 border border-gray-200 rounded-lg p-1 mr-4">
                                <button onClick={() => setActiveTab("overview")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "overview" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>Roadmap Overview</button>
                                <button onClick={() => setActiveTab("narrative")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "narrative" ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-700 hover:bg-white'}`}>Strategic Analysis</button>
                            </div>
                            <button
                                onClick={handleExportPDF}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 border border-gray-200 shadow-sm"
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

            <main className="max-w-7xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    {activeTab === "overview" ? (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {/* Print-Only Cover Page */}
                            <div className="hidden print:block print:break-after-always mb-12">
                                <div className="flex flex-col items-center justify-center min-h-[90vh] text-center border-4 border-double border-blue-600 p-12">
                                    <div className="w-64 h-32 mb-12">
                                        <img src="/logo_report_final.png" alt="HRTek System" className="w-full h-full object-contain" />
                                    </div>
                                    <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tight">HR Digital Transformation Roadmap</h1>
                                    <div className="h-2 w-48 bg-blue-600 rounded-full mb-12"></div>
                                    <h2 className="text-4xl font-bold text-gray-700 mb-16">{brandName}</h2>

                                    <div className="space-y-6 text-left max-w-xl w-full text-lg">
                                        <div className="flex justify-between border-b-2 border-gray-100 pb-4">
                                            <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Assessment Type</span>
                                            <span className="font-bold text-gray-900 font-sans">Digital Roadmap & ROI</span>
                                        </div>
                                        <div className="flex justify-between border-b-2 border-gray-100 pb-4">
                                            <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Generated Date</span>
                                            <span className="font-bold text-gray-900 font-sans">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex justify-between border-b-2 border-gray-100 pb-4">
                                            <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Status</span>
                                            <span className="font-bold text-blue-600 font-sans uppercase">Confidential Analysis</span>
                                        </div>
                                    </div>

                                    <div className="mt-24 text-sm font-bold text-gray-400 uppercase tracking-widest">
                                        <p className="mb-2">© {new Date().getFullYear()} HR TEK SYSTEMS. All rights reserved.</p>
                                        <p>Proprietary & Confidential Strategic Advisory</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8 flex items-start gap-6 print:mt-12">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
                                    <Map className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Auto-generated HR Digital Roadmap & ROI</h1>
                                    <p className="text-xl text-gray-500 font-medium">Strategic roadmap for HR digital transformation initiatives with ROI projections</p>
                                    <div className="mt-4 inline-block bg-gray-100 px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                                        Your personalized digital transformation roadmap with phased milestones and ROI projections
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                                {kpiCards.map((kpi, index) => {
                                    const Icon = kpi.icon;
                                    return (
                                        <div key={index} className={`bg-white rounded-3xl border border-gray-200 p-8 shadow-sm transition-all hover:shadow-md group`}>
                                            <div className="flex items-start justify-between mb-6">
                                                <h3 className="text-base font-bold text-gray-400 group-hover:text-blue-600 transition-colors uppercase tracking-widest text-[10px]">{kpi.title}</h3>
                                                <div className={`w-12 h-12 ${getIconBgClass(kpi.color)} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                                    <Icon className="w-5 h-5 text-white" />
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-2 mb-4">
                                                <span className="text-4xl font-black text-gray-900 tracking-tighter">{kpi.value}</span>
                                                <span className="text-lg font-extrabold text-gray-400">{kpi.unit}</span>
                                            </div>
                                            <div className="h-px w-full bg-gray-100 mb-4" />
                                            <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                                                {kpi.title === "Overall Progress" ? "Total completion of your strategic roadmap across all defined phases." :
                                                    kpi.title === "Milestones Completed" ? "Key tactical objectives achieved vs. the total transformation backlog." :
                                                        kpi.title === "Projected ROI" ? "Estimated efficiency gains and cost savings over 24 months." :
                                                            "Duration of the multi-phase implementation from kickoff to optimization."}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                <div className="lg:col-span-12">
                                    <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-10 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50/50 blur-3xl -mr-32 -mt-32 rounded-full pointer-events-none" />
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                                            <div>
                                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Transformation Roadmap Execution</h2>
                                                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">Phased delivery of core HR technology vectors</p>
                                            </div>
                                            <div className="px-4 py-2 bg-blue-50 border border-blue-100 rounded-xl text-xs font-black text-blue-600 uppercase tracking-widest">
                                                Current Phase: Foundation
                                            </div>
                                        </div>

                                        <div className="space-y-12">
                                            {phases.map((phase: any) => (
                                                <div key={phase.id} className="relative group">
                                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center font-black text-gray-900 border-2 border-gray-100 text-xl shadow-sm group-hover:border-blue-200 group-hover:bg-white transition-all">
                                                                {phase.id}
                                                            </div>
                                                            <div>
                                                                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{phase.title}</h3>
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{phase.timeline}</span>
                                                                    <span className="text-gray-300">•</span>
                                                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${phase.status === "Completed" ? "text-green-600" : phase.status === "In Progress" ? "text-blue-600" : "text-gray-400"}`}>{phase.status}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right w-full md:w-auto">
                                                            <div className="flex items-baseline justify-between md:justify-end gap-3">
                                                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Phase Health</span>
                                                                <span className="text-4xl font-black text-gray-900 tracking-tighter">{phase.progress}%</span>
                                                            </div>
                                                            <div className="w-full md:w-48 h-2 bg-gray-100 rounded-full overflow-hidden mt-2">
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${phase.progress}%` }}
                                                                    transition={{ duration: 1, delay: 0.5 }}
                                                                    className="h-full rounded-full"
                                                                    style={{ backgroundColor: phase.color }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-0 md:pl-20">
                                                        <div className="space-y-4">
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">High-Impact Initiatives</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {phase.initiatives.map((init: any, i: number) => (
                                                                    <span key={i} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 shadow-sm hover:border-blue-300 transition-colors">
                                                                        {init}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 italic">
                                                            <p className="text-xs text-gray-500 leading-relaxed font-medium">
                                                                {phase.id === 1 ? "Eliminating low-hanging procedural friction to build organizational momentum and immediate trust in the new platform." :
                                                                    phase.id === 2 ? "Configuring the architectural bedrock. This phase requires 100% data integrity before moving to advanced automation." :
                                                                        phase.id === 3 ? "Deployment of intelligent agents and predictive modules to shift HR from a service desk to a strategic partner." :
                                                                            "Continuous refinement through data audits and feedback loops to ensure 99.9% uptime and user satisfaction."}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {phase.id < 4 && <div className="h-12 w-px bg-gray-100 ml-7 my-4 border-dashed border-l-2" />}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                                <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm group">
                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Projected ROI Realization</h2>
                                            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mt-1">24-Month Value Trajectory Analysis</p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center">
                                            <TrendingUp className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <div className="h-[350px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={chartData}>
                                                <defs>
                                                    <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }} dy={10} />
                                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }} unit="%" />
                                                <Tooltip
                                                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '20px' }}
                                                />
                                                <Area type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorRoi)" dot={{ r: 6, fill: "#fff", stroke: "#3b82f6", strokeWidth: 3 }} activeDot={{ r: 10 }} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="mt-8 bg-blue-50 border border-blue-100 p-6 rounded-2xl relative overflow-hidden">
                                        <div className="relative z-10 flex items-start gap-4">
                                            <div className="p-2 bg-white rounded-lg shadow-sm shrink-0">
                                                <Lightbulb className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <p className="text-sm text-blue-800 font-bold leading-relaxed">
                                                The 'J-Curve' effect: Notice the initial investment dip in Q1-Q2 followed by exponential ROI as automation takes over manual tasks. We project a <strong>300% cumulative ROI</strong> by the end of Year 2.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                                    <div className="flex items-center gap-2 mb-8 border-b border-gray-100 pb-6">
                                        <Target className="w-6 h-6 text-indigo-600" />
                                        <h2 className="text-xl font-black text-gray-900 tracking-tight uppercase">Strategic Priorities</h2>
                                    </div>
                                    <div className="space-y-6">
                                        {priorities.map((rec: any, i: number) => (
                                            <div key={i} className="group cursor-pointer">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h4 className="font-extrabold text-gray-800 text-sm group-hover:text-blue-600 transition-colors uppercase tracking-tight">{rec.initiative || rec.title}</h4>
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase ${rec.priority === 'CRITICAL' ? 'bg-red-600 text-white' : rec.priority === 'HIGH' ? 'bg-blue-600 text-white' : 'bg-yellow-500 text-white'}`}>
                                                        {rec.priority}
                                                    </span>
                                                </div>
                                                <p className="text-xs font-bold text-gray-500 leading-relaxed mb-4">{rec.text || `Strategy for ${rec.initiative}`}</p>
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className={`h-full ${rec.type === 'green' || rec.impact === 'High' ? 'bg-green-500' : rec.type === 'blue' || rec.impact === 'Medium' ? 'bg-blue-600' : 'bg-yellow-500'}`} style={{ width: rec.impact === 'High' ? '85%' : rec.impact === 'Medium' ? '45%' : '30%' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-10 p-6 bg-slate-900 rounded-2xl text-white shadow-xl">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-3 text-blue-400">Tactical Insight</h4>
                                        <p className="text-xs font-medium leading-relaxed opacity-80">
                                            Accelerated deployment in Phase 2 could pull forward ROI by up to 3 months, but carries an increased risk of 15% in user adoption friction.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="narrative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <BoardDossierRenderer report={data?.result || data} engineName="Roadmap & ROI" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <style>{`
                @media print {
                    @page { margin: 1.5cm; }
                    header, nav, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    .min-h-screen, .bg-gray-50 { background: white !important; }
                    main { padding: 0 !important; max-width: 100% !important; }
                    .bg-white, .bg-blue-50, .bg-green-50, .bg-purple-50, .bg-orange-50, .bg-gray-50 { background: white !important; border: 1px solid #e2e8f0 !important; }
                    .text-gray-900, .text-gray-500, .text-gray-600, .text-gray-700, .text-slate-500 { color: black !important; }
                    .text-blue-600, .text-green-700, .text-red-600 { color: black !important; font-weight: bold !important; }
                    h1, h2, h3, h4 { color: black !important; page-break-after: avoid; font-weight: 900 !important; }
                    section, .grid, .mb-10 { page-break-inside: avoid; margin-bottom: 2rem !important; }
                    .shadow-sm, .shadow-md, .shadow-lg { box-shadow: none !important; }
                    .rounded-3xl, .rounded-2xl, .rounded-xl { border-radius: 0.75rem !important; }

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
            <div className="print-watermark hidden print:block">HRTEKSYSTEM</div>

            <StrategicReportPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                reportData={reportData}
                isGenerating={isGenerating}
                error={(fetcher.data as any)?.error}
                engineTitle="HR Transformation Roadmap"
                brandName={brandName}
            />
        </div>
    );
}
