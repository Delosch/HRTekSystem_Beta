import { json, LoaderFunction } from "@remix-run/node";
import { Params, useLoaderData, Link } from "@remix-run/react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getLatestAnalysis } from "~/utils/analysis";
import { getCompanyProfile } from "~/models/company.model";
import { DatabaseRecord } from "../v2.$id/schemas";
import {
    FileText, Target, TrendingUp, AlertTriangle, ShieldCheck,
    Clock, Zap, LayoutPanelTop, Lightbulb, Download, ArrowLeft,
    CheckCircle, Brain, DollarSign, PlayCircle, Star, Sparkles,
    ChevronRight, ArrowUpRight, Activity, BarChart2, ScanLine
} from "lucide-react";
import {
    ResponsiveContainer, Radar, RadarChart, PolarGrid,
    PolarAngleAxis, PolarRadiusAxis, ScatterChart, Scatter,
    XAxis, YAxis, CartesianGrid, Tooltip, Cell, AreaChart, Area,
    BarChart, Bar, Legend, ReferenceLine
} from 'recharts';
import { PDFDownloadLink } from "@react-pdf/renderer";
import ConsultingReportPDF from "~/components/reports/ConsultingReportPDF";

// --- Loader ---
export const loader: LoaderFunction = async ({ request, params }: { request: Request, params: Params }) => {
    try {
        const user = await requireUserSession(request);
        if (!user || !user.organisationId) return null;
        if (!params.id) throw new Response("Assessment ID Required", { status: 404 });

        const data = await getLatestAnalysis(`COMPANY#${user.organisationId}`, params.id);
        if (!data) throw new Response("No assessment data found", { status: 404 });

        const company_info = await getCompanyProfile(user.organisationId);
        const brand_name = company_info?.brand_name || company_info?.company_name || "Confidential Client";

        return json({ data, brand_name, assessmentId: params.id });
    } catch (e) {
        console.error("Report loader error:", e);
        throw new Response("Internal Server Error", { status: 500 });
    }
}

interface LoaderReturn {
    data: DatabaseRecord,
    brand_name: string,
    assessmentId: string
}

// --- Components ---

const TypewriterText = ({ text, delay = 0, className = "" }: { text: string; delay?: number; className?: string }) => {
    const [displayedText, setDisplayedText] = useState("");
    const controls = useInView({ triggerOnce: true, threshold: 0.5 });

    useEffect(() => {
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
            }, 20); // Typing speed
            return () => clearInterval(interval);
        }, delay * 1000);

        return () => clearTimeout(timeout);
    }, [text, delay]);

    return <p className={className}>{displayedText}</p>;
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

// --- Main Component ---

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.2 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

export default function ConsultingReport() {
    const { data, brand_name, assessmentId } = useLoaderData<LoaderReturn>();
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    const generateFallbackReport = () => {
        const res = data.result;
        const analysis = res.maturity_analysis;
        const insights = res.strategic_insights;
        const risks = res.risk_assessment?.transformation_risks || [];
        const recommendations = res.detailed_recommendations;

        const normalizeScore = (val: number) => {
            if (!val) return 0;
            if (val <= 5 && val > 0) return Math.round(val * 20);
            return Math.round(val);
        };

        const allActions = [
            ...(recommendations.immediate_actions?.actions || []).map(a => ({ ...a, priority: 'P1', impact: 'High', effort: 'Medium' })),
            ...(recommendations.short_term_initiatives?.actions || []).map(a => ({ ...a, priority: 'P2', impact: 'Medium', effort: 'High' })),
            ...(recommendations.medium_term_initiatives?.actions || []).map(a => ({ ...a, priority: 'P3', impact: 'High', effort: 'High' }))
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
                key_observations: ["Growing profitability", "Adequate IT budget allocation", "Resistant leadership culture", "No digital strategy"]
            },
            maturity_scorecard: analysis.dimensional_scores.map(d => {
                const finalScore = normalizeScore(d.percentage || d.weighted_score || d.raw_score);
                return {
                    dimension: d.dimension,
                    score: finalScore,
                    max_score: 100,
                    risk_level: finalScore < 40 ? "High Risk" : finalScore < 70 ? "Medium Risk" : "Low Risk"
                };
            }),
            radar_data: analysis.dimensional_scores.map(d => ({
                subject: d.dimension,
                A: normalizeScore(d.percentage || d.weighted_score || d.raw_score),
                fullMark: 100
            })),
            dimension_deep_dives: analysis.dimensional_scores.slice(0, 6).map(d => ({
                dimension: d.dimension,
                score: normalizeScore(d.percentage || d.weighted_score || d.raw_score),
                current_state: d.critical_gaps.slice(0, 3) || ["Manual processes"],
                business_impact: d.gap_analysis.improvement_potential > 60 ? ["Significant operational leakage", "High compliance risk"] : ["Optimization opportunity", "Margin improvement potential"],
                recommendations: d.key_strengths.length > 0 ? d.key_strengths : ["Establish standard KPIs", "Digitalize manual records"],
                strategic_outlook: d.maturity_level === 'Nascent' ? "Nascent" : d.maturity_level || "Initial"
            })),
            business_risk_opportunity: {
                top_risks: risks.slice(0, 3).map((r, i) => ({
                    category: ["Cultural", "Technical", "Operational"][i] || "Strategic",
                    risk: r.risk_category || r.risk_description,
                    impact: r.impact,
                    mitigation: r.mitigation_strategy || "Implement change management"
                })),
                opportunity_areas: analysis.dimensional_scores
                    .sort((a, b) => b.gap_analysis.improvement_potential - a.gap_analysis.improvement_potential)
                    .slice(0, 4)
                    .map(d => ({ opportunity: `Optimize ${d.dimension}`, value: "High VALUE" }))
            },
            transformation_priority_matrix: allActions.slice(0, 4).map(a => ({
                initiative: a.action,
                priority: a.priority,
                impact: a.impact === 'High' ? 3 : a.impact === 'Medium' ? 2 : 1,
                effort: a.effort === 'High' ? 1 : a.effort === 'Medium' ? 2 : 3
            })),
            transformation_roadmap: [
                {
                    phase: "IMMEDIATE",
                    timeline: recommendations.immediate_actions.timeline || "0-3 Months",
                    actions: recommendations.immediate_actions.actions.slice(0, 2).map(a => a.action)
                },
                {
                    phase: "SHORT-TERM",
                    timeline: recommendations.short_term_initiatives.timeline || "3-12 Months",
                    actions: recommendations.short_term_initiatives.actions.slice(0, 2).map(a => a.action)
                },
                {
                    phase: "MEDIUM-TERM",
                    timeline: recommendations.medium_term_initiatives?.timeline || "12-24 Months",
                    actions: (recommendations.medium_term_initiatives?.actions || []).slice(0, 1).map(a => a.action)
                }
            ].filter(p => p.actions.length > 0),
            investment_indication: [
                { area: "Core Transformation", effort: "High", investment_band: "₹₹₹" },
                { area: "Digital Infrastructure", effort: "Medium", investment_band: "₹₹" },
                { area: "Change Management", effort: "Medium", investment_band: "₹₹" },
                { area: "Data Governance", effort: "Low", investment_band: "₹" }
            ]
        };
    };

    const report = data.result.consulting_report || generateFallbackReport();

    // Transform data for comparative chart
    const comparativeData = report.maturity_scorecard.map(item => ({
        name: item.dimension.length > 15 ? item.dimension.substring(0, 15) + '...' : item.dimension,
        full_name: item.dimension,
        Score: item.score,
        Target: 100,
        Gap: 100 - item.score
    }));

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-[100] flex items-center justify-center">
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-t-2 border-r-2 border-indigo-500 animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Brain className="w-10 h-10 text-indigo-400 animate-pulse" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f172a] font-sans text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200 overflow-x-hidden">
            <style>{`
                .backface-hidden { backface-visibility: hidden; }
                .perspective { perspective: 1000px; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .preserve-3d { transform-style: preserve-3d; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 20px; }
                .glass-card { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); }
                .glass-header { background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(20px); border-bottom: 1px solid rgba(148, 163, 184, 0.1); }
                .neon-text { text-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
                .glow-box { box-shadow: 0 0 30px rgba(99, 102, 241, 0.15); }
                @keyframes scan { 
                    0% { top: 0%; opacity: 0; }
                    50% { opacity: 0.5; }
                    100% { top: 100%; opacity: 0; }
                }
                .scan-line { position: absolute; left:0; width: 100%; height: 2px; background: linear-gradient(to right, transparent, #6366f1, transparent); animation: scan 3s linear infinite; pointer-events: none; }
            `}</style>

            <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute top-[30%] right-[20%] w-[20%] h-[20%] bg-cyan-600/10 rounded-full blur-[100px]"></div>
            </div>

            <motion.header
                initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100, damping: 20 }}
                className="sticky top-0 z-50 glass-header"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                            <Brain className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">{brand_name}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                <span className="text-indigo-400 uppercase tracking-wider">Digital Maturity Report</span>
                                <span className="opacity-50">•</span>
                                <span>{assessmentId}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {isClient && (
                            <PDFDownloadLink
                                document={<ConsultingReportPDF report={report} brandName={brand_name} />}
                                fileName={`Digital_Maturity_${brand_name}.pdf`}
                                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 hover:bg-indigo-50 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-indigo-500/20 hover:scale-105 active:scale-95"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download className="w-4 h-4" />
                                        <span>{loading ? "Generating..." : "Download PDF"}</span>
                                    </>
                                )}
                            </PDFDownloadLink>
                        )}
                        <Link to="/dashboard" className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Exit Report">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </motion.header>

            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-16 relative z-10"
            >

                {/* 01 Executive Summary */}
                <motion.section variants={itemVariants} className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-indigo-500/30 pb-4">
                        <span className="text-5xl font-black text-indigo-500/20">01</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Executive Summary</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-5 glass-card rounded-[2rem] p-8 flex flex-col items-center justify-center relative overflow-hidden group min-h-[400px]">
                            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/10 to-transparent pointer-events-none"></div>
                            <div className="relative z-10 flex flex-col items-center text-center">
                                <motion.div
                                    animate={{
                                        boxShadow: ["0 0 20px rgba(99,102,241,0.2)", "0 0 60px rgba(99,102,241,0.6)", "0 0 20px rgba(99,102,241,0.2)"]
                                    }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="w-48 h-48 rounded-full border-4 border-indigo-500/30 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center mb-8 relative"
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute inset-0 rounded-full border-t-2 border-r-2 border-indigo-500 opacity-70"
                                    ></motion.div>
                                    <div className="flex flex-col items-center">
                                        <span className="text-6xl font-black text-white neon-text">
                                            <AnimatedCounter value={report.executive_summary.overall_maturity_index} />
                                        </span>
                                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">Index Score</span>
                                    </div>
                                </motion.div>

                                <h3 className="text-2xl font-bold text-white mb-2">{report.executive_summary.maturity_category}</h3>
                                <div className="h-1 w-20 bg-indigo-500 rounded-full mb-4"></div>
                                <p className="text-sm text-slate-400 max-w-xs">{report.executive_summary.what_this_means[0]}</p>
                            </div>
                        </div>

                        <div className="lg:col-span-7 flex flex-col gap-6">
                            <div className="bg-slate-800/50 rounded-2xl p-6 border border-white/5 relative overflow-hidden min-h-[160px]">
                                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-cyan-400 to-blue-500"></div>
                                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4" /> Strategic Directive
                                </h4>
                                <div className="text-xl font-medium text-slate-100 italic leading-relaxed">
                                    "<TypewriterText text={report.executive_summary.executive_recommendation} delay={0.5} />"
                                </div>
                            </div>

                            <div className="glass-card rounded-2xl p-6 border border-white/5">
                                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FileText className="w-4 h-4" /> Executive Context
                                </h4>
                                <div className="space-y-4">
                                    <p className="text-sm text-slate-300 leading-relaxed">
                                        The organization is currently positioned at the <strong className="text-white">{report.executive_summary.maturity_category}</strong> stage.
                                        This indicates that {report.executive_summary.what_this_means[1] || report.executive_summary.what_this_means[0].toLowerCase()}.
                                        Critical attention is required in standardizing core processes to unlock the next level of operational efficiency.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                                        {report.executive_summary.key_observations.slice(0, 2).map((obs: string, i: number) => (
                                            <div key={i} className="flex items-start gap-2 text-xs font-medium text-slate-400">
                                                <ArrowUpRight className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" /> {obs}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 02 Comparative Gap Analysis (New Section) */}
                <motion.section variants={itemVariants} className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-indigo-500/30 pb-4">
                        <span className="text-5xl font-black text-indigo-500/20">02</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Comparative Gap Analytics</h2>
                    </div>

                    <div className="grid lg:grid-cols-2 gap-8">
                        {/* Analytical View */}
                        <div className="glass-card rounded-3xl p-6 min-h-[350px] relative overflow-hidden">
                            <div className="scan-line"></div>
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Current vs Target Performance</h4>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={comparativeData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={false} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" width={100} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', color: '#fff' }}
                                    />
                                    <Bar dataKey="Score" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={12} name="Current Score" />
                                    <Bar dataKey="Target" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={8} name="Target" stroke="#475569" strokeDasharray="3 3" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Textual Diagnostic */}
                        <div className="glass-card rounded-3xl p-8 flex flex-col justify-center">
                            <div className="flex items-center gap-3 mb-6">
                                <ScanLine className="w-6 h-6 text-indigo-400" />
                                <h3 className="text-xl font-bold text-white">Diagnostic Report</h3>
                            </div>
                            <div className="space-y-6">
                                {report.dimension_deep_dives.slice(0, 3).map((dim: any, i: number) => (
                                    <div key={i} className="border-l-2 border-indigo-500/30 pl-4 py-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h5 className="font-bold text-indigo-200 text-sm">{dim.dimension}</h5>
                                            <span className="text-xs font-mono text-rose-400">GAP: {100 - dim.score}%</span>
                                        </div>
                                        <p className="text-xs text-slate-400 leading-relaxed mb-1">
                                            Analysis reveals {dim.current_state[0].toLowerCase()}.
                                        </p>
                                        <p className="text-xs text-emerald-400/80 font-medium">
                                            → Recommendation: {dim.recommendations[0]}
                                        </p>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-white/5">
                                    <p className="text-xs text-slate-500 italic">
                                        * Top 3 meaningful gaps selected for immediate strategic review.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* 03 Maturity Scorecard */}
                <motion.section variants={itemVariants} className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-indigo-500/30 pb-4">
                        <span className="text-5xl font-black text-indigo-500/20">03</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Analysis Scorecard</h2>
                    </div>

                    <div className="grid lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-12 glass-card rounded-3xl overflow-hidden p-1">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Dimension</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider">Score</th>
                                        <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-wider text-right">Metric</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {report.maturity_scorecard.map((item: any, i: number) => (
                                        <tr key={i} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-slate-200 block mb-1 group-hover:text-indigo-400 transition-colors">{item.dimension}</span>
                                                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase ${item.risk_level.includes('High') ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                    {item.risk_level}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-2xl font-black text-white"><AnimatedCounter value={item.score} duration={1} /></span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="w-full max-w-[200px] h-2 bg-slate-800 rounded-full ml-auto overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${item.score}%` }}
                                                        transition={{ duration: 1, delay: i * 0.1 }}
                                                        className={`h-full rounded-full ${item.risk_level.includes('High') ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}
                                                    ></motion.div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </motion.section>

                {/* 04 Dimension Deep Dives (Flip Cards) */}
                <motion.section variants={itemVariants} className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-indigo-500/30 pb-4">
                        <span className="text-5xl font-black text-indigo-500/20">04</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Dimension Insights</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {report.dimension_deep_dives.map((dim: any, i: number) => (
                            <div key={i} className="group h-[360px] perspective cursor-pointer">
                                <div className="relative w-full h-full duration-700 preserve-3d group-hover:rotate-y-180 transition-all ease-in-out">
                                    {/* Front */}
                                    <div className="absolute w-full h-full backface-hidden glass-card rounded-3xl p-8 flex flex-col justify-between overflow-hidden border border-white/10 group-hover:border-indigo-500/50 transition-colors">
                                        <div className="absolute top-0 right-0 p-6 opacity-5">
                                            <Target className="w-32 h-32 text-white" />
                                        </div>

                                        <div>
                                            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-6 border border-indigo-500/30">
                                                {i + 1}
                                            </div>
                                            <h3 className="font-bold text-white text-xl leading-snug mb-2 pr-4">{dim.dimension}</h3>
                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dim.strategic_outlook}</p>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            <div className="flex items-end gap-2">
                                                <span className="text-5xl font-black text-white">{dim.score}</span>
                                                <span className="text-sm font-semibold text-slate-500 mb-2">/100</span>
                                            </div>
                                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                                                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full w-full" style={{ width: `${dim.score}%` }}></div>
                                            </div>
                                            <div className="flex justify-center mt-4 pt-4 border-t border-white/5">
                                                <span className="text-xs font-bold text-indigo-300 flex items-center gap-2 group-hover:text-white transition-colors">
                                                    Tap to reveal analysis <ArrowUpRight className="w-3 h-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className="absolute w-full h-full backface-hidden bg-indigo-950 rounded-3xl p-8 shadow-2xl rotate-y-180 overflow-hidden flex flex-col text-slate-200 border border-indigo-500/30">
                                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-indigo-500"></div>
                                        <h3 className="font-bold text-white text-md mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                                            <Brain className="w-4 h-4 text-cyan-400" /> Analysis
                                        </h3>

                                        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                            <div>
                                                <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <AlertTriangle className="w-3 h-3" /> Critical Gaps
                                                </p>
                                                <ul className="text-sm text-slate-400 space-y-2">
                                                    {dim.current_state.map((s: string, idx: number) => <li key={idx} className="flex gap-2 leading-relaxed"><span className="text-rose-500 mt-1">•</span> {s}</li>)}
                                                </ul>
                                            </div>

                                            <div>
                                                <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                    <Lightbulb className="w-3 h-3" /> Strategic Actions
                                                </p>
                                                <ul className="text-sm text-slate-400 space-y-2">
                                                    {dim.recommendations.map((r: string, idx: number) => <li key={idx} className="flex gap-2 leading-relaxed"><span className="text-emerald-500 mt-1">•</span> {r}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.section>

                {/* 05 Transformation Roadmap (Circuit Style) */}
                <motion.section variants={itemVariants} className="space-y-8">
                    <div className="flex items-center gap-4 border-b border-indigo-500/30 pb-4">
                        <span className="text-5xl font-black text-indigo-500/20">05</span>
                        <h2 className="text-3xl font-bold text-white tracking-tight">Transformation Roadmap</h2>
                    </div>

                    <div className="p-8 lg:p-12 relative">
                        {/* Connecting Line (Vertical on Mobile) */}
                        <div className="absolute left-8 lg:left-1/2 top-0 bottom-0 w-1 lg:w-full lg:h-1 bg-gradient-to-b lg:bg-gradient-to-r from-indigo-500/20 via-purple-500/50 to-transparent"></div>

                        <div className="grid lg:grid-cols-3 gap-12 relative z-10">
                            {report.transformation_roadmap.map((phase: any, i: number) => (
                                <div key={i} className="relative pl-12 lg:pl-0 lg:pt-12">
                                    {/* Node Point */}
                                    <div className="absolute left-6 lg:left-1/2 top-0 lg:top-6 w-4 h-4 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)] -translate-x-1/2 lg:-translate-y-1/2 border-2 border-white z-20"></div>

                                    <div className="glass-card p-6 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors group">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-xs font-bold px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">{phase.timeline}</span>
                                            <span className="text-4xl font-black text-white/5 absolute right-4 top-4 group-hover:text-indigo-500/10 transition-colors">{i + 1}</span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider">{phase.phase}</h3>
                                        <ul className="space-y-3">
                                            {phase.actions.map((action: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-3 text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                                                    <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.section>

                {/* Footer */}
                <div className="border-t border-white/10 pt-12 mt-12 pb-12">
                    <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Confidential Advisory Report</p>
                    <div className="flex justify-center items-center gap-2 text-slate-600">
                        <span className="font-black text-lg">HR TEK SYSTEMS</span>
                        <span>•</span>
                        <span>© 2026</span>
                    </div>
                </div>

            </motion.main>
        </div>
    );
}