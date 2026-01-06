import { LoaderFunction } from "@remix-run/node";
import { Params, useLoaderData } from "@remix-run/react";
import { motion } from "framer-motion";
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
    Briefcase
} from "lucide-react";

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

        return { data, brand_name };
    }
    catch (e) {
        console.error("Report loader error:", e)
        throw new Response("Internal Server Error", { status: 500 });
    }
}

interface LoaderReturn {
    data: DatabaseRecord,
    brand_name: string
}

export default function ConsultingReport() {
    const { data, brand_name } = useLoaderData<LoaderReturn>();
    const [isLoading, setIsLoading] = useState(true);

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
            ...(recommendations.immediate_actions?.actions || []).map(a => ({ ...a, priority: 'P1' })),
            ...(recommendations.short_term_initiatives?.actions || []).map(a => ({ ...a, priority: 'P2' })),
            ...(recommendations.medium_term_initiatives?.actions || []).map(a => ({ ...a, priority: 'P3' }))
        ];

        return {
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
                executive_recommendation: insights.overall_assessment || "Initiate a structured digital transformation roadmap focusing on core process automation."
            },
            maturity_scorecard: analysis.dimensional_scores.map(d => {
                const finalScore = normalizeScore(d.percentage || d.weighted_score || d.raw_score);
                return {
                    dimension: d.dimension,
                    score: finalScore,
                    max_score: 100,
                    risk_level: finalScore < 40 ? "High" : finalScore < 70 ? "Medium" : "Low"
                };
            }),
            dimension_deep_dives: analysis.dimensional_scores.slice(0, 5).map(d => ({
                dimension: d.dimension,
                current_state: d.critical_gaps.slice(0, 3),
                business_impact: d.gap_analysis.improvement_potential > 60 ? ["Significant operational leakage", "High compliance risk"] : ["Optimization opportunity", "Margin improvement potential"],
                recommendations: d.key_strengths.length > 0 ? d.key_strengths : ["Establish standard KPIs", "Digitalize manual records"]
            })),
            business_risk_opportunity: {
                top_risks: risks.slice(0, 2).map(r => ({ risk: r.risk_category || r.risk_description, impact: r.impact })),
                opportunity_areas: analysis.dimensional_scores
                    .sort((a, b) => b.gap_analysis.improvement_potential - a.gap_analysis.improvement_potential)
                    .slice(0, 2)
                    .map(d => ({ opportunity: `Optimize ${d.dimension}`, value: "High" }))
            },
            transformation_priority_matrix: allActions.slice(0, 3).map(a => ({
                initiative: a.action,
                priority: a.priority,
                impact: a.impact,
                effort: a.effort
            })),
            transformation_roadmap: [
                {
                    phase: "IMMEDIATE",
                    timeline: recommendations.immediate_actions.timeline || "0-3 Months",
                    actions: recommendations.immediate_actions.actions.slice(0, 3).map(a => a.action)
                },
                {
                    phase: "SHORT-TERM",
                    timeline: recommendations.short_term_initiatives.timeline || "3-6 Months",
                    actions: recommendations.short_term_initiatives.actions.slice(0, 3).map(a => a.action)
                },
                {
                    phase: "MEDIUM-TERM",
                    timeline: recommendations.medium_term_initiatives?.timeline || "6-12 Months",
                    actions: (recommendations.medium_term_initiatives?.actions || []).slice(0, 3).map(a => a.action)
                }
            ].filter(p => p.actions.length > 0),
            investment_indication: [
                { area: "Core Transformation", effort: "High", investment_band: "₹₹₹" },
                { area: "Change Management", effort: "Medium", investment_band: "₹₹" }
            ]
        };
    };

    const report = data.result.consulting_report || generateFallbackReport();

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="flex flex-col items-center space-y-6">
                    <div className="w-20 h-20 border-t-4 border-blue-700 rounded-full animate-spin"></div>
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-slate-800">HR Tek Systems</h2>
                        <p className="text-slate-500">Generating Confidential Deliverable...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100 pb-20 overflow-x-hidden">
            {/* Page 1: Cover Page */}
            <section className="min-h-screen flex flex-col justify-between p-12 md:p-24 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                            <Zap className="w-8 h-8 text-blue-400 fill-blue-400/20" />
                        </div>
                        <span className="text-3xl font-black tracking-tighter uppercase">HR TEK SYSTEMS</span>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-none">
                            PROFESSIONAL <br />
                            <span className="text-blue-400">DIGITAL MATURITY</span> <br />
                            REPORT
                        </h1>
                        <div className="h-1 w-32 bg-blue-500 mb-8"></div>
                        <h2 className="text-2xl md:text-3xl font-light text-slate-300 tracking-wide uppercase">
                            Deliverable for: {brand_name}
                        </h2>
                    </motion.div>
                </div>

                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 mt-20">
                    <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4">Report Objective</h3>
                        <p className="text-xl text-slate-300 leading-relaxed font-light">
                            This report evaluates the organization’s Digital & HR Transformation Maturity across Technology, Culture, People, Process, Data, and AI.
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            "Clear maturity score",
                            "Key risk areas",
                            "Business impact assessment",
                            "Prioritized roadmap",
                            "Investment guidance",
                            "Scale readiness"
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm text-slate-400">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative z-10 mt-20 pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-end md:items-center">
                    <div className="text-slate-500 text-sm uppercase tracking-widest">
                        Confidential Client Deliverable • © {new Date().getFullYear()} HR Tek Systems
                    </div>
                    <div className="text-slate-400 text-sm italic font-light">
                        Designed for CXOs, CHROs, CIOs, and Board-level discussions.
                    </div>
                </div>
            </section>

            {/* Print Button - Floating */}
            <button
                onClick={() => window.print()}
                className="fixed bottom-8 right-8 z-[100] p-4 bg-blue-600 text-white rounded-full shadow-2xl hover:bg-blue-700 transition-all hover:scale-110 active:scale-95 group print:hidden"
                title="Export to PDF"
            >
                <div className="flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 font-bold whitespace-nowrap">EXTRACT PDF</span>
                </div>
            </button>

            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    section {
                        page-break-after: always;
                        min-height: 100vh !important;
                        display: block !important;
                    }
                    .print\\:hidden {
                        display: none !important;
                    }
                }
            ` }} />

            {/* Page 2: Executive Summary */}
            <section className="min-h-screen py-24 px-12 md:px-24 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-16 px-4 py-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-blue-100 text-blue-700 rounded-lg font-bold">01</span>
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Executive Summary</span>
                        </div>
                        <div className="text-xs text-slate-300 uppercase tracking-widest">HR TEK SYSTEMS • Confidential</div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                        <div className="lg:col-span-4 text-center lg:text-left">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                className="relative inline-block"
                            >
                                <svg className="w-64 h-64">
                                    <circle cx="128" cy="128" r="120" stroke="#e2e8f0" strokeWidth="16" fill="transparent" />
                                    <circle cx="128" cy="128" r="120" stroke="#3b82f6" strokeWidth="16" fill="transparent"
                                        strokeDasharray={753} strokeDashoffset={753 - (753 * report.executive_summary.overall_maturity_index / 100)}
                                        strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-7xl font-black text-slate-800">{report.executive_summary.overall_maturity_index}</span>
                                    <span className="text-slate-400 font-bold tracking-widest text-sm uppercase">INDEX SCORE</span>
                                </div>
                            </motion.div>
                        </div>

                        <div className="lg:col-span-8">
                            <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
                                Maturity Category: <br />
                                <span className="text-blue-600">{report.executive_summary.maturity_category}</span>
                            </h2>
                            <div className="h-1 w-20 bg-blue-600 mb-8"></div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                <div className="bg-white p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                                    <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <BarChart3 className="w-5 h-5 text-blue-500" />
                                        What This Means
                                    </h3>
                                    <ul className="space-y-4">
                                        {report.executive_summary.what_this_means.map((item, i) => (
                                            <li key={i} className="flex items-start gap-3 text-slate-600 text-sm leading-relaxed">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 shrink-0"></div>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="bg-blue-600 p-8 rounded-3xl shadow-xl shadow-blue-200/50 text-white relative overflow-hidden">
                                    <Target className="absolute top-0 right-0 w-32 h-32 text-blue-500/30 -translate-y-6 translate-x-6" />
                                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2 relative z-10">
                                        <Zap className="w-5 h-5 text-yellow-400" />
                                        Executive Recommendation
                                    </h3>
                                    <p className="text-lg leading-relaxed relative z-10 font-medium">
                                        "{report.executive_summary.executive_recommendation}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Page 3: Maturity Scorecard */}
            <section className="py-24 px-12 md:px-24 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-16 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-blue-700 text-white rounded-lg font-bold">02</span>
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Maturity Scorecard</span>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 shadow-2xl">
                        <table className="w-full text-left">
                            <thead className="bg-slate-900 text-white uppercase text-xs tracking-widest">
                                <tr>
                                    <th className="px-8 py-6">Dimension</th>
                                    <th className="px-8 py-6">Score</th>
                                    <th className="px-8 py-6">Status / Risk</th>
                                    <th className="px-8 py-6 w-48">Visualization</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {report.maturity_scorecard.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-6 font-bold text-slate-700">{item.dimension}</td>
                                        <td className="px-8 py-6">
                                            <span className="text-2xl font-black text-slate-900">{item.score}</span>
                                            <span className="text-slate-400 text-xs ml-1">/ {item.max_score}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.risk_level === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                                                item.risk_level.includes('Medium') ? 'bg-amber-100 text-amber-700' :
                                                    'bg-rose-100 text-rose-700'
                                                }`}>
                                                {item.risk_level} Risk
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${(item.score / item.max_score) > 0.7 ? 'bg-emerald-500' :
                                                        (item.score / item.max_score) > 0.4 ? 'bg-amber-500' :
                                                            'bg-rose-500'
                                                        }`}
                                                    style={{ width: `${(item.score / item.max_score) * 100}%` }}
                                                ></div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {/* Page 4: Detailed Deep Dives */}
            <section className="py-24 px-12 md:px-24 bg-slate-900 text-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-16 px-4 py-3 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-blue-500 text-white rounded-lg font-bold">03</span>
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Dimension Deep Dives</span>
                        </div>
                    </div>

                    <div className="space-y-16">
                        {report.dimension_deep_dives.map((dive, idx) => (
                            <div key={idx} className="grid grid-cols-1 lg:grid-cols-12 gap-12 border-b border-white/10 pb-16 last:border-0 last:pb-0">
                                <div className="lg:col-span-4">
                                    <h3 className="text-3xl font-black mb-4 tracking-tight">03.{idx + 1} <br /> {dive.dimension}</h3>
                                    <div className="h-1 w-12 bg-blue-500"></div>
                                </div>
                                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-6 flex items-center justify-between">
                                            Current State
                                            <FileText className="w-4 h-4" />
                                        </h4>
                                        <ul className="space-y-3">
                                            {dive.current_state.map((text, i) => (
                                                <li key={i} className="text-slate-400 text-sm leading-relaxed flex gap-2">
                                                    <span className="text-blue-500">•</span> {text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-rose-500/5 p-6 rounded-2xl border border-rose-500/10 hover:bg-rose-500/10 transition-all">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-rose-400 mb-6 flex items-center justify-between">
                                            {dive.risk ? 'Observed Risks' : 'Business Impact'}
                                            <AlertTriangle className="w-4 h-4" />
                                        </h4>
                                        <ul className="space-y-3">
                                            {(dive.risk || dive.business_impact || []).map((text, i) => (
                                                <li key={i} className="text-slate-300 text-sm leading-relaxed flex gap-2">
                                                    <span className="text-rose-500">•</span> {text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10 hover:bg-emerald-500/10 transition-all">
                                        <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-6 flex items-center justify-between">
                                            Strategic Recs
                                            <Zap className="w-4 h-4" />
                                        </h4>
                                        <ul className="space-y-3">
                                            {dive.recommendations.map((text, i) => (
                                                <li key={i} className="text-slate-200 text-sm leading-relaxed flex gap-2">
                                                    <span className="text-emerald-500">✔</span> {text}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Page 5: Business Risk & Opportunity */}
            <section className="py-24 px-12 md:px-24 bg-slate-50">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-16 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded-lg font-bold">04</span>
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Risk & Opportunity Analysis</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div className="bg-rose-600 p-12 rounded-[3rem] text-white shadow-2xl shadow-rose-200 relative overflow-hidden group">
                            <AlertTriangle className="absolute -bottom-6 -left-6 w-48 h-48 text-rose-500/30 group-hover:scale-110 transition-transform duration-700" />
                            <h2 className="text-4xl font-black mb-12 relative z-10 tracking-tight">Critical Exposure <br /> Areas</h2>
                            <div className="space-y-6 relative z-10">
                                {report.business_risk_opportunity.top_risks.map((item, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex items-center justify-between">
                                        <span className="font-bold text-lg">{item.risk}</span>
                                        <span className="px-3 py-1 bg-white text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest">{item.impact} IMPACT</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-emerald-600 p-12 rounded-[3rem] text-white shadow-2xl shadow-emerald-200 relative overflow-hidden group">
                            <TrendingUp className="absolute -bottom-6 -right-6 w-48 h-48 text-emerald-500/30 group-hover:scale-110 transition-transform duration-700" />
                            <h2 className="text-4xl font-black mb-12 relative z-10 tracking-tight">Growth & Scale <br /> Opportunities</h2>
                            <div className="space-y-6 relative z-10">
                                {report.business_risk_opportunity.opportunity_areas.map((item, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex items-center justify-between">
                                        <span className="font-bold text-lg">{item.opportunity}</span>
                                        <span className="px-3 py-1 bg-white text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest">{item.value} VALUE</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Page 6: Transformation Priority Matrix */}
            <section className="py-24 px-12 md:px-24 bg-white">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-16 px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg font-bold">05</span>
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Transformation Priority Matrix</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {report.transformation_priority_matrix.map((item, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className={`p-8 rounded-[2rem] border-2 shadow-xl ${item.priority === 'P1' ? 'border-blue-600 bg-blue-50/30' :
                                    item.priority === 'P2' ? 'border-indigo-200 bg-white' :
                                        'border-slate-100 bg-white'
                                    }`}
                            >
                                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl font-black text-xl mb-8 ${item.priority === 'P1' ? 'bg-blue-600 text-white' :
                                    item.priority === 'P2' ? 'bg-indigo-600 text-white' :
                                        'bg-slate-200 text-slate-600'
                                    }`}>
                                    {item.priority}
                                </div>
                                <h3 className="text-xl font-black text-slate-800 mb-8 leading-tight h-14 overflow-hidden">{item.initiative}</h3>

                                <div className="space-y-4 pt-8 border-t border-slate-200">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Impact</span>
                                        <span className="text-xs font-bold text-blue-600">{item.impact}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Effort</span>
                                        <span className="text-xs font-bold text-slate-600">{item.effort}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Page 7: Transformation Roadmap */}
            <section className="py-24 px-12 md:px-24 bg-slate-50 overflow-hidden">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-24 px-4 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 flex items-center justify-center bg-emerald-600 text-white rounded-lg font-bold">06</span>
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-xs">Transformation Roadmap</span>
                        </div>
                    </div>

                    <div className="relative">
                        {/* Horizontal Line for Desktop */}
                        <div className="hidden lg:block absolute top-[28px] left-[10%] right-[10%] h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 rounded-full"></div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 lg:gap-8">
                            {report.transformation_roadmap.map((phase, i) => (
                                <div key={i} className="relative z-10 flex flex-col group">
                                    <div className="w-14 h-14 bg-white border-4 border-slate-50 flex items-center justify-center rounded-2xl text-slate-800 font-black text-xl mb-8 mx-auto lg:mx-0 shadow-lg group-hover:scale-110 group-hover:border-blue-500 transition-all duration-300">
                                        {i + 1}
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <h4 className="text-blue-600 font-black uppercase tracking-widest text-xs mb-2">{phase.phase}</h4>
                                        <div className="text-2xl font-black text-slate-800 mb-2">{phase.timeline}</div>
                                        <div className="h-0.5 w-10 bg-blue-200 mb-6 mx-auto lg:mx-0"></div>
                                        <div className="bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
                                            <ul className="space-y-3">
                                                {phase.actions.map((action, ai) => (
                                                    <li key={ai} className="text-slate-600 text-sm leading-relaxed flex items-start gap-2">
                                                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                                                        {action}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Page 8: Investment Indication */}
            <section className="py-24 px-12 md:px-24 bg-white text-slate-900">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                        <div>
                            <h2 className="text-5xl font-black tracking-tight text-slate-800 mb-4">Investment & Effort <br /> <span className="text-blue-600">Guidance</span></h2>
                            <p className="text-slate-500 font-medium">Indicative, non-binding estimates based on current maturity levels.</p>
                        </div>
                        <div className="bg-slate-50 px-8 py-6 rounded-3xl border border-slate-100">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Partner</div>
                            <div className="flex items-center gap-3">
                                <Zap className="w-6 h-6 text-blue-600 fill-blue-600/10" />
                                <span className="font-bold text-xl tracking-tight uppercase">HR Tek Systems</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {report.investment_indication.map((item, i) => (
                            <div key={i} className="bg-white border-2 border-slate-100 p-8 rounded-[2.5rem] hover:border-blue-200 transition-all shadow-lg hover:shadow-2xl">
                                <h3 className="text-lg font-bold text-slate-800 mb-10 h-10 overflow-hidden leading-tight">{item.area}</h3>
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Est. Effort</span>
                                            <span className="font-bold text-slate-700">{item.effort}</span>
                                        </div>
                                        <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
                                            <Briefcase className="w-5 h-5 text-slate-400" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-8 border-t border-slate-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Band</span>
                                            <span className="text-3xl font-black text-blue-600">{item.investment_band}</span>
                                        </div>
                                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                            <TrendingUp className="w-5 h-5 text-blue-600" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-8 bg-slate-900 rounded-[2rem] text-white flex flex-col md:flex-row items-center gap-8 justify-between shadow-2xl overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl translate-x-12 -translate-y-12"></div>
                        <div className="max-w-xl relative z-10">
                            <h4 className="text-2xl font-bold mb-4 tracking-tight text-white/90">Interested in a high-fidelity implementation roadmap?</h4>
                            <p className="text-slate-400 font-light">Contact our strategy team to map these recommendations to exact service SKUs, timelines, and implementation frameworks.</p>
                        </div>
                        <button className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition relative z-10 whitespace-nowrap shadow-xl">
                            INITIATE ADVISORY →
                        </button>
                    </div>
                </div>
            </section>

            {/* Final Page: Why HR Tek Systems */}
            <section className="py-24 px-12 md:px-24 bg-slate-50">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-bold text-xs uppercase tracking-widest mb-12">
                        Execution Partner
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-20 leading-none">
                        WHY <span className="text-blue-600">HR TEK</span> SYSTEMS?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                        {[
                            { title: "Independant Advisory", text: "Vendor-neutral strategy ensuring the best tool for your specific business needs." },
                            { title: "Business-First", text: "Focusing on ROI and outcomes rather than just tool implementations." },
                            { title: "Transformation Expertise", text: "Deep bench of specialists in HR technology and change management." },
                            { title: "Scalable Model", text: "Unique HAAS (HR as a Service) model built for global scale." }
                        ].map((item, i) => (
                            <div key={i} className="text-left bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm transition-all hover:shadow-xl">
                                <ShieldCheck className="w-8 h-8 text-blue-600 mb-6" />
                                <h4 className="text-lg font-black text-slate-800 mb-4">{item.title}</h4>
                                <p className="text-slate-500 font-light text-sm leading-relaxed">{item.text}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col items-center gap-12">
                        <div className="h-0.5 w-32 bg-slate-200"></div>
                        <div className="flex items-center space-x-12 opacity-50 grayscale hover:grayscale-0 transition-all">
                            <span className="text-2xl font-black tracking-tighter uppercase">ADVISE</span>
                            <span className="text-2xl font-black tracking-tighter uppercase">IMPLEMENT</span>
                            <span className="text-2xl font-black tracking-tighter uppercase">OPTIMIZE</span>
                        </div>
                        <div className="text-slate-400 text-xs font-bold uppercase tracking-[0.5em] mt-10">
                            WWW.HRTEKSYSTEMS.COM
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

const CheckCircle = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
);
