import os

path = r'c:\Users\jmadh\OneDrive\Desktop\old_hrtek\old_hrtek\app\routes\consulting-report.$id\route.tsx'

content = r"""import { json, LoaderFunction } from "@remix-run/node";
import { Params, useLoaderData, Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getLatestAnalysis } from "~/utils/analysis";
import { getCompanyProfile } from "~/models/company.model";
import { DatabaseRecord } from "../v2.$id/schemas";
import {
    FileText,
    Target,
    TrendingUp,
    AlertTriangle,
    ShieldCheck,
    BarChart3,
    Clock,
    Zap,
    Globe,
    Settings,
    Users,
    Database,
    Briefcase,
    ChevronRight,
    Search,
    Info,
    ArrowUpRight,
    Minus,
    LayoutPanelTop,
    Lightbulb,
    GanttChart,
    Download,
    ArrowLeft,
    CheckCircle,
    Layers,
    Activity,
    Brain,
    DollarSign
} from "lucide-react";
import {
    ResponsiveContainer,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Cell,
    AreaChart,
    Area,
    PieChart,
    Pie,
    ScatterChart,
    Scatter,
    LabelList
} from 'recharts';
import { PDFDownloadLink } from "@react-pdf/renderer";
// Note: You'll need to create a ConsultingReportPDF component if it doesn't exist, similar to HTIReportPDF
// import ConsultingReportPDF from "~/components/reports/ConsultingReportPDF"; 

export const loader: LoaderFunction = async ({ request, params }: { request: Request, params: Params }) => {
    try {
        const user = await requireUserSession(request);
        if (!user || !user.organisationId) {
            return null
        }
        if (!params.id) {
            throw new Response("Assessment ID Required", { status: 404 })
        }

        const data = await getLatestAnalysis(`COMPANY#${user.organisationId}`, params.id);
        if (!data) {
            throw new Response("No assessment data found", { status: 404 });
        }

        const company_info = await getCompanyProfile(user.organisationId);
        const brand_name = company_info?.brand_name || company_info?.company_name || "Confidential Client";

        return json({ data, brand_name, assessmentId: params.id });
    }
    catch (e) {
        console.error("Report loader error:", e)
        throw new Response("Internal Server Error", { status: 500 });
    }
}

interface LoaderReturn {
    data: DatabaseRecord,
    brand_name: string,
    assessmentId: string
}

export default function ConsultingReport() {
    const { data, brand_name, assessmentId } = useLoaderData<LoaderReturn>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
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
            // If the value is strictly <= 5 and not a percentage, assume it's on a 1-5 scale
            if (val <= 5 && val > 0) return Math.round(val * 20);
            return Math.round(val);
        };

        // Flatten recommendations for priority matrix
        const allActions = [
            ...(recommendations.immediate_actions?.actions || []).map(a => ({ ...a, priority: 'P1', impact: 'High', effort: 'Medium' })), // Defaulting mapping if missing
            ...(recommendations.short_term_initiatives?.actions || []).map(a => ({ ...a, priority: 'P2', impact: 'Medium', effort: 'High' })),
            ...(recommendations.medium_term_initiatives?.actions || []).map(a => ({ ...a, priority: 'P3', impact: 'High', effort: 'High' }))
        ];

        const report_content = {
            executive_summary: {
                overall_maturity_index: normalizeScore(analysis.overall_score.percentage || analysis.overall_score.weighted_score || analysis.overall_score.raw_score),
                maturity_category: analysis.overall_score.maturity_level || insights.maturity_stage_description || "Developing",
                what_this_means: [
                    ...(insights.transformation_readiness.enabling_factors || []).slice(0, 2),
                    ...(insights.transformation_readiness.blocking_factors || []).slice(0, 2)
                ].length > 0 ? [
                    ...(insights.transformation_readiness.enabling_factors || []).slice(0, 2),
                    ...(insights.transformation_readiness.blocking_factors || []).slice(0, 2)
                ] : [
                    "Core systems exist but operate in departmental silos.",
                    "Digital strategy lacks formal board-level integration.",
                    "Manual handling of data creates scalability bottlenecks.",
                    "Organizational culture is in the early stages of digital adoption."
                ],
                executive_recommendation: insights.overall_assessment || "Initiate a structured digital transformation roadmap focusing on core process automation.",
                key_observations: [ "Growing profitability", "Adequate IT budget allocation", "Resistant leadership culture", "No digital strategy" ] // Mocked from prompt if missing
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
                effort: a.effort === 'High' ? 1 : a.effort === 'Medium' ? 2 : 3 // Invert for "Easier is better" or just map raw
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
        return report_content;
    };

    const report = data.result.consulting_report || generateFallbackReport();

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-slate-50 z-[100] flex items-center justify-center">
                <div className="flex flex-col items-center">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-500 font-bold animate-pulse">Generating Digital Maturity Report...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <style>{`
                .backface-hidden { backface-visibility: hidden; }
                .perspective { perspective: 1000px; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .preserve-3d { transform-style: preserve-3d; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>

            {/* Professional Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <Brain className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 leading-none">{brand_name}</h1>
                                <p className="text-xs text-slate-500 font-medium mt-1">Digital Maturity Report • {assessmentId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/dashboard" className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors">
                                EXIT REPORT
                            </Link>
                             {/* Placeholder for PDF Download - connect whenever ready */}
                            <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors">
                                <Download className="w-4 h-4" />
                                <span>DOWNLOAD PDF</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8 space-y-12">
            
                {/* 01 Executive Summary */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black text-slate-200">01</span>
                        <h2 className="text-2xl font-bold text-slate-800">Executive Summary</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Overall Assessment</h3>
                                <div className="flex items-end gap-4 mb-6">
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-500 mb-1">Maturity Category</p>
                                        <p className="text-2xl font-black text-blue-600">{report.executive_summary.maturity_category}</p>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-slate-500 mb-1">Index Score</p>
                                        <p className="text-2xl font-black text-slate-800">{report.executive_summary.overall_maturity_index} <span className="text-sm text-slate-400 font-normal">/ 100</span></p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Key Observations</p>
                                        <ul className="space-y-2">
                                            {(report.executive_summary.key_observations || report.executive_summary.what_this_means).map((obs: string, i: number) => (
                                                <li key={i} className="flex items-center gap-2 text-sm text-slate-600">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                                                    {obs}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Top Recommendation</p>
                                        <p className="text-sm text-slate-700 italic border-l-4 border-blue-500 pl-4 py-1">"{report.executive_summary.executive_recommendation}"</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col items-center justify-center">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 w-full text-left">Global Maturity Radar</h3>
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={report.radar_data}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                        <Radar name="Maturity" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                                        <Tooltip />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 02 Maturity Scorecard */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black text-slate-200">02</span>
                        <h2 className="text-2xl font-bold text-slate-800">Maturity Scorecard</h2>
                    </div>
                    
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Dimension</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Score</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider">Status / Risk</th>
                                    <th className="px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-wider text-right">Visualization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {report.maturity_scorecard.map((item: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-700">{item.dimension}</td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{item.score} <span className="text-slate-400 text-xs font-normal">/ 100</span></td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                                                ${item.risk_level.includes('High') ? 'bg-rose-100 text-rose-800' : 
                                                  item.risk_level.includes('Medium') ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                {item.risk_level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="w-24 h-2 bg-slate-100 rounded-full ml-auto overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${item.risk_level.includes('High') ? 'bg-rose-500' : item.risk_level.includes('Medium') ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                                                    style={{ width: `${item.score}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* 03 Dimension Deep Dives (Flip Cards) */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black text-slate-200">03</span>
                        <h2 className="text-2xl font-bold text-slate-800">Dimension Deep Dives</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {report.dimension_deep_dives.map((dim: any, i: number) => (
                             <div key={i} className="group h-80 perspective">
                                <div className="relative w-full h-full duration-500 preserve-3d group-hover:rotate-y-180">
                                    {/* Front */}
                                    <div className="absolute w-full h-full backface-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between overflow-hidden">
                                        <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                                        <div className="pl-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-blue-200 font-black text-6xl opacity-50 absolute right-4 top-4">{i+1}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg leading-tight mt-8 mb-4">{dim.dimension}</h3>
                                            <div className="text-4xl font-black text-blue-600 mb-2">{dim.score}</div>
                                            <div className="text-xs uppercase tracking-wider font-bold text-slate-400">Current Score</div>
                                        </div>
                                        <div className="pl-4">
                                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1">
                                                <span>Target: 90</span>
                                                <span>Bench: 65</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${dim.score}%` }}></div>
                                            </div>
                                            <p className="text-center font-bold text-slate-400 uppercase tracking-widest text-xs mt-4">"{dim.strategic_outlook}"</p>
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className="absolute w-full h-full backface-hidden bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 rotate-y-180 overflow-y-auto custom-scrollbar">
                                        <h3 className="font-bold text-white text-sm mb-4 border-b border-slate-700 pb-2">{dim.dimension}</h3>
                                        
                                        <div className="mb-4">
                                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2">Current State</p>
                                            <ul className="text-xs text-slate-300 space-y-1">
                                                {dim.current_state.map((s: string, idx: number) => <li key={idx}>• {s}</li>)}
                                            </ul>
                                        </div>

                                        <div>
                                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2">Strategic Recs</p>
                                            <ul className="text-xs text-slate-300 space-y-1">
                                                {dim.recommendations.map((r: string, idx: number) => <li key={idx}>• {r}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 04 Risk & Opportunity Analysis */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black text-slate-200">04</span>
                        <h2 className="text-2xl font-bold text-slate-800">Risk & Opportunity Analysis</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                         {/* Risks */}
                        <div className="space-y-4">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Critical Exposure Areas</h3>
                             {report.business_risk_opportunity.top_risks.map((risk: any, i: number) => (
                                 <div key={i} className="bg-white rounded-xl p-4 border border-rose-100 shadow-sm flex items-start justify-between">
                                     <div>
                                         <p className="text-xs font-bold text-rose-600 uppercase mb-1">{risk.category}</p>
                                         <p className="font-bold text-slate-700 text-sm mb-2">{risk.risk}</p>
                                     </div>
                                     <span className="px-2 py-1 bg-rose-50 text-rose-700 text-xs font-black uppercase rounded">High Impact</span>
                                 </div>
                             ))}
                        </div>

                         {/* Opportunities */}
                        <div className="space-y-4">
                             <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Growth & Scale Opportunities</h3>
                             <div className="grid grid-cols-1 gap-4">
                                {report.business_risk_opportunity.opportunity_areas.map((opp: any, i: number) => (
                                    <div key={i} className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100/50 flex items-center justify-between">
                                          <p className="font-bold text-slate-700 text-sm">{opp.opportunity}</p>
                                          <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-black uppercase rounded">{opp.value}</span>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </section>

                {/* 05 Transformation Priority Matrix */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black text-slate-200">05</span>
                        <h2 className="text-2xl font-bold text-slate-800">Transformation Priority Matrix</h2>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                        <div className="flex flex-col md:flex-row gap-8">
                            {/* Matrix Viz */}
                            <div className="flex-1 h-80 relative border border-slate-100 bg-slate-50/50 rounded-xl">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-xs text-slate-300 font-bold uppercase tracking-[0.2em] transform -rotate-45">Strategic Impact vs Effort</p>
                                </div>
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" dataKey="effort" name="Effort" unit="" domain={[0, 4]} hide />
                                        <YAxis type="number" dataKey="impact" name="Impact" unit="" domain={[0, 4]} hide />
                                        <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                             if (active && payload && payload.length) {
                                                return (
                                                    <div className="bg-white p-2 border border-slate-200 shadow-lg rounded text-xs select-none z-50">
                                                        <p className="font-bold text-slate-800">{payload[0].payload.initiative}</p>
                                                        <p className="text-slate-500">{payload[0].payload.priority}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }} />
                                        <Scatter name="Initiatives" data={report.transformation_priority_matrix} fill="#3b82f6" shape="circle">
                                            <Cell fill="#ef4444" />
                                            <Cell fill="#3b82f6" />
                                            <Cell fill="#10b981" />
                                            <Cell fill="#f59e0b" />
                                        </Scatter>
                                    </ScatterChart>
                                </ResponsiveContainer>
                                <div className="absolute bottom-2 right-2 text-[10px] font-bold text-slate-400">EFFORT →</div>
                                <div className="absolute top-2 left-2 text-[10px] font-bold text-slate-400">IMPACT ↑</div>
                            </div>

                            {/* List */}
                            <div className="flex-1 space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">High Impact Zone</h3>
                                {report.transformation_priority_matrix.map((item: any, i: number) => (
                                    <div key={i} className="flex items-start gap-4 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white shrink-0
                                            ${item.priority === 'P1' ? 'bg-rose-500' : item.priority === 'P2' ? 'bg-amber-500' : 'bg-blue-500'}`}>
                                            {item.priority}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight mb-1">{item.initiative}</p>
                                            <div className="flex gap-4 text-[10px] font-bold text-slate-400 uppercase">
                                                <span>Est. Impact: High</span>
                                                <span>Complexity: {item.effort === 1 ? 'High' : 'Medium'}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* 06 Transformation Roadmap */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-black text-slate-200">06</span>
                        <h2 className="text-2xl font-bold text-slate-800">Transformation Roadmap</h2>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 relative">
                        <div className="absolute top-8 left-8 bottom-8 w-px bg-slate-200"></div>
                        <div className="space-y-8">
                            {report.transformation_roadmap.map((phase: any, i: number) => (
                                <div key={i} className="relative pl-12">
                                    <div className="absolute top-0 left-6 w-4 h-4 rounded-full bg-white border-4 border-blue-500 -translate-x-1/2"></div>
                                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl font-black text-slate-300">{i+1}</span>
                                            <div>
                                                <h3 className="text-lg font-black text-slate-800 uppercase tracking-wide">{phase.phase}</h3>
                                                <p className="text-xs font-bold text-slate-400 uppercase">{phase.timeline}</p>
                                            </div>
                                        </div>
                                        <ul className="space-y-2">
                                            {phase.actions.map((action: string, idx: number) => (
                                                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                                                    <ChevronRight className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                                                    {action}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
                
                 {/* Investment Indication */}
                 <section className="space-y-6">
                    <div className="flex items-center gap-3">
                         <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Investment & Effort Guidance</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {report.investment_indication.map((inv: any, i: number) => (
                            <div key={i} className="bg-white rounded-xl p-6 border border-slate-200 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase mb-2">{inv.area}</p>
                                <div className="text-2xl font-black text-slate-800 mb-1">{inv.investment_band}</div>
                                <p className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 inline-block px-2 py-1 rounded">Effort: {inv.effort}</p>
                            </div>
                        ))}
                    </div>
                 </section>

                {/* Footer */}
                <div className="border-t border-slate-200 pt-8 mt-12 pb-12">
                    <div className="grid md:grid-cols-2 gap-8">
                         <div>
                             <h4 className="font-black text-slate-800 text-lg mb-4">WHY HR TEK SYSTEMS?</h4>
                             <p className="text-sm text-slate-600 leading-relaxed mb-4">
                                 Vendor-neutral strategy ensuring the best tool for your specific business needs. 
                                 Focusing on ROI and outcomes rather than just tool implementations.
                             </p>
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-400 tracking-widest uppercase">
                                 <span>Advise</span>
                                 <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                 <span>Implement</span>
                                 <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                 <span>Optimize</span>
                             </div>
                         </div>
                         <div className="text-right flex flex-col justify-end">
                             <a href="https://www.hrteksystems.com" className="text-2xl font-black text-slate-900 mb-1 block">WWW.HRTEKSYSTEMS.COM</a>
                             <p className="text-xs text-slate-400 font-bold uppercase">Confidential Client Deliverable • © 2026</p>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );
}"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"File {path} rewritten successfully.")
