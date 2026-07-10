import React, { useState, useEffect } from "react";
import {
    Activity, Target, AlertTriangle, CheckCircle2, TrendingUp,
    Zap, Rocket, Layers, Globe, ShieldAlert, FileText,
    ClipboardList, TrendingDown, LayoutDashboard, Brain,
    ShieldCheck, Clock, DollarSign, BarChart3, PieChart,
    ChevronRight, ArrowRight, Star
} from "lucide-react";
import { motion } from "framer-motion";

interface SectionProps {
    title: string;
    number: number;
    children: React.ReactNode;
}

const Section = ({ title, number, children }: SectionProps) => (
    <section className="space-y-6 pt-12 first:pt-0">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-4">
            <span className="text-4xl font-black text-indigo-500/50 italic leading-none">{number}.</span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase">{title}</h2>
        </div>
        <div className="pl-0 sm:pl-12">
            {children}
        </div>
    </section>
);

interface BoardDossierRendererProps {
    report: any;
    engineName: string;
}

export default function BoardDossierRenderer({ report, engineName }: BoardDossierRendererProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!report?.consulting_report && !report?.consultingReport) {
        return (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200">
                <Brain className="w-12 h-12 text-indigo-600 mx-auto mb-4 animate-pulse" />
                <h3 className="text-xl font-bold text-slate-900">Strategic Analysis in Progress</h3>
                <p className="text-slate-500 mt-2 font-medium">The AI is currently synthesizing the board-level strategic briefing...</p>
            </div>
        );
    }

    const doc = report.consulting_report || report.consultingReport;

    return (
        <div className="bg-white text-slate-800 font-sans max-w-6xl mx-auto p-4 sm:p-12 space-y-16">
            {/* Print-Only Header */}
            <div className="hidden print:flex items-center justify-between mb-12 border-b-2 border-slate-100 pb-8">
                <div className="flex items-center gap-4">
                    <img src="/logo_icon_final.png" alt="HRTek" className="w-16 h-16 object-contain" />
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">HRTEK SYSTEM</h1>
                        <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest">{engineName} Strategic Analysis</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Confidential Report</p>
                    <p className="text-xs font-medium text-slate-500">{isMounted ? new Date().toLocaleDateString() : '-- --- ----'}</p>
                </div>
            </div>

            {/* 1. EXECUTIVE SUMMARY */}
            <Section title="Executive Summary" number={1}>
                {doc.executive_summary && (
                    <div className="space-y-8">
                        {/* Metrics Table */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/50">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-indigo-600 text-white">
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/90">Metric</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/90">Current State</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/90">Target State</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/90">Improvement</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {doc.executive_summary.metrics?.map((m: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-100/50 transition-colors">
                                            <td className="p-4 font-medium text-slate-900">{m.metric}</td>
                                            <td className="p-4 text-slate-600 font-medium">{m.current}</td>
                                            <td className="p-4 text-indigo-600 font-semibold">{m.target}</td>
                                            <td className="p-4">
                                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-semibold tracking-widest border border-emerald-200">
                                                    {m.improvement}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-8 bg-indigo-50 border-l-8 border-indigo-600 rounded-r-2xl shadow-sm">
                            <h4 className="text-sm font-bold text-indigo-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Star className="w-4 h-4" /> Key Strategic Insight
                            </h4>
                            <p className="text-2xl text-slate-900 font-serif italic leading-relaxed">"{doc.executive_summary.key_insight}"</p>
                        </div>
                    </div>
                )}
            </Section>

            {/* 2. STRATEGIC DRIVERS */}
            <Section title="Strategic Drivers & Alignment" number={2}>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-12 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Transformation Driver</th>
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Strategic Weight</th>
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Priority Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {doc.strategic_drivers?.drivers?.map((d: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-900">{d.driver}</td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: d.weight }}></div>
                                                </div>
                                                <span className="text-xs font-semibold text-slate-600">{d.weight}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xl font-black text-indigo-600 italic">{d.priority_score}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm lg:col-span-12">
                        <h4 className="text-xs font-semibold text-indigo-700 uppercase tracking-widest mb-4">Strategic Realignment</h4>
                        <p className="text-slate-700 leading-relaxed font-medium">
                            {doc.strategic_drivers.strategic_realignment}
                        </p>
                    </div>
                </div>
            </Section>

            {/* 3. CAPABILITY ASSESSMENT */}
            <Section title="Current Capability Assessment" number={3}>
                <div className="space-y-12">
                    {/* Heatmap */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-[0.3em]">HR Digitization Heatmap</h4>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Process Area</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Digitized</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Automated</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Mobile</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Gap Analysis</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {doc.capability_assessment?.digitization_heatmap?.map((h: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-medium text-slate-900">{h.process}</td>
                                            <td className="p-4 text-slate-600 border-x border-slate-100">{h.digitized}</td>
                                            <td className="p-4 text-slate-600 border-x border-slate-100">{h.automated}</td>
                                            <td className="p-4 text-slate-600 border-x border-slate-100">{h.mobile_enabled}</td>
                                            <td className="p-4 text-xs italic text-slate-500">{h.gap_analysis}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 4. DIGITAL PRIORITY PORTFOLIO */}
            <Section title="Digital Priority Portfolio" number={4}>
                <div className="space-y-8">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-indigo-600 text-white">
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/90">Strategic Initiative</th>
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-center text-white/90">Readiness</th>
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-center text-white/90">Impact</th>
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/90">Category</th>
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-right text-white/90">Score</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {doc.priority_portfolio?.initiatives?.map((n: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-900">{n.initiative}</td>
                                        <td className="p-4 text-center text-slate-600">{n.readiness}</td>
                                        <td className="p-4 text-center text-slate-600">{n.impact}</td>
                                        <td className="p-4 text-xs font-semibold text-indigo-600">{n.category}</td>
                                        <td className="p-4 text-right font-bold text-indigo-600">{n.priority_score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Section>

            {/* 5. CHANGE READINESS */}
            <Section title="Change Readiness Analysis" number={5}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl text-center shadow-sm">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">Adoption Readiness Thermometer</h4>
                        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border-8 border-slate-100 shadow-inner"></div>
                            <div className="text-6xl font-black text-slate-900">{doc.change_readiness?.readiness_thermometer?.score}%</div>
                            <div className="absolute -bottom-4 bg-indigo-600 text-[10px] font-semibold uppercase p-2 rounded-lg tracking-[0.2em] text-white shadow-lg">{doc.change_readiness?.readiness_thermometer?.label}</div>
                        </div>
                    </div>
                    <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-6">Resistance Risk Profile</h4>
                        <div className="space-y-4">
                            {Object.entries(doc.change_readiness?.resistance_profile || {}).map(([key, val]: any) => (
                                <div key={key} className="flex justify-between items-center pb-2 border-b border-slate-100 last:border-0">
                                    <span className="text-xs font-semibold text-slate-600 capitalize">{key.replace(/_/g, ' ')}</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${val === 'Strong' || val === 'High' ? 'text-emerald-700 bg-emerald-100' : val === 'Low' || val === 'Critical' ? 'text-rose-700 bg-rose-100' : 'text-amber-700 bg-amber-100'}`}>{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* 6. ARCHITECTURE ASSESSMENT */}
            <Section title="Architecture & Tools Assessment" number={6}>
                <div className="space-y-8">
                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-900 text-white">
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Enabler</th>
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Adoption</th>
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Status</th>
                                    <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Recommendation</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {doc.architecture_assessment?.enabler_adoption?.map((e: any, i: number) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-4 font-medium text-slate-900">{e.enabler}</td>
                                        <td className="p-4 text-slate-600">{e.adoption}</td>
                                        <td className="p-4"><span className="px-2 py-1 bg-slate-100 text-[10px] uppercase font-semibold tracking-widest rounded border border-slate-200">{e.status}</span></td>
                                        <td className="p-4 text-xs text-slate-500 italic">{e.recommendation}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
                        <strong className="text-xs font-semibold text-indigo-700 uppercase tracking-widest block mb-2">Recommended Architecture</strong>
                        <p className="text-slate-700 italic">{doc.architecture_assessment?.recommended_architecture}</p>
                    </div>
                </div>
            </Section>

            {/* 7. GOVERNANCE & METRICS */}
            <Section title="Governance & Metrics Maturity" number={7}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">KPI Maturity Assessment</h4>
                        <div className="space-y-3">
                            {doc.governance_metrics?.kpi_maturity?.map((k: any, i: number) => (
                                <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-slate-900">{k.kpi}</div>
                                        <div className="text-[10px] text-slate-500 uppercase tracking-widest">{k.maturity}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-600">{k.percentage}</span>
                                        <span>{k.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Measurement Framework Status</h4>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="p-3 text-white/80">Metric</th>
                                        <th className="p-3 text-white/80">Current</th>
                                        <th className="p-3 text-white/80">Target</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {doc.governance_metrics?.measurement_framework?.map((m: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-3 text-slate-900 font-normal">{m.metric}</td>
                                            <td className="p-3 text-slate-600">{m.current}</td>
                                            <td className="p-3 text-indigo-600 font-black">{m.target}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 8. BUDGET & TIMELINE */}
            <Section title="Budget & Timeline Planning" number={8}>
                <div className="space-y-12">
                    {/* Balanced Scenario */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: "Total Investment", val: doc.budget_timeline?.balanced_scenario?.investment, icon: DollarSign },
                            { label: "Timeline", val: doc.budget_timeline?.balanced_scenario?.timeline || "24 months", icon: Clock },
                            { label: "ROI Forecast", val: doc.budget_timeline?.balanced_scenario?.roi, icon: TrendingUp },
                            { label: "Payback Period", val: doc.budget_timeline?.balanced_scenario?.payback, icon: Activity },
                        ].map((item, i) => (
                            <div key={i} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                                <item.icon className="w-5 h-5 text-indigo-600 mb-4" />
                                <div className="text-2xl font-black text-slate-900">{item.val}</div>
                                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Investment Breakdown */}
                    <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Strategic Investment Breakdown</h4>
                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-white/80">Category</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-white/80">Percentage</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-white/80">Amount</th>
                                        <th className="p-4 text-xs font-black uppercase tracking-widest text-white/80">Strategic Rationale</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs">
                                    {doc.budget_timeline?.investment_breakdown?.map((b: any, i: number) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-medium text-slate-900">{b.category}</td>
                                            <td className="p-4 font-black text-indigo-600">{b.percentage}</td>
                                            <td className="p-4 font-bold text-slate-600">{b.amount}</td>
                                            <td className="p-4 text-slate-500 italic max-w-xs">{b.rationale}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 9. AI ROADMAP */}
            <Section title="AI-Powered Transformation Roadmap" number={9}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(doc.transformation_roadmap?.phases || {}).map(([phase, inits]: any) => (
                        <div key={phase} className="p-6 bg-slate-50 border border-slate-200 rounded-3xl space-y-4 shadow-sm">
                            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest border-b border-slate-100 pb-2">{phase.replace(/_/g, ' ')}</h4>
                            <ul className="space-y-2">
                                {inits.map((it: string, j: number) => (
                                    <li key={j} className="flex gap-2 text-xs font-medium text-slate-600 items-start">
                                        <ArrowRight className="w-3 h-3 text-indigo-500 mt-0.5 flex-shrink-0" />
                                        <span>{it}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </Section>

            {/* 10. SCENARIO PLANNING */}
            <Section title="Scenario Planning & Risk Management" number={10}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="p-8 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] space-y-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <Star className="w-6 h-6 text-emerald-600" />
                            <h4 className="text-lg font-black text-slate-900">Optimistic Scenario</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-emerald-100 pt-4">
                            <div><span className="block text-[10px] uppercase font-black text-slate-500">ROI</span><span className="font-bold text-emerald-600">{doc.scenario_risk_management?.optimistic_scenario?.roi}</span></div>
                            <div><span className="block text-[10px] uppercase font-black text-slate-500">Timeline</span><span className="font-bold text-emerald-600">{doc.scenario_risk_management?.optimistic_scenario?.timeline}</span></div>
                            <div><span className="block text-[10px] uppercase font-black text-slate-500">Maturity</span><span className="font-bold text-emerald-600">{doc.scenario_risk_management?.optimistic_scenario?.maturity}</span></div>
                        </div>
                    </div>
                    <div className="p-8 bg-rose-50 border border-rose-100 rounded-[2.5rem] space-y-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <ShieldAlert className="w-6 h-6 text-rose-600" />
                            <h4 className="text-lg font-black text-slate-900">Pessimistic Scenario</h4>
                        </div>
                        <div className="grid grid-cols-3 gap-4 border-t border-rose-100 pt-4">
                            <div><span className="block text-[10px] uppercase font-black text-slate-500">ROI</span><span className="font-bold text-rose-600">{doc.scenario_risk_management?.pessimistic_scenario?.roi}</span></div>
                            <div><span className="block text-[10px] uppercase font-black text-slate-500">Timeline</span><span className="font-bold text-rose-600">{doc.scenario_risk_management?.pessimistic_scenario?.timeline}</span></div>
                            <div><span className="block text-[10px] uppercase font-black text-slate-500">Maturity</span><span className="font-bold text-rose-600">{doc.scenario_risk_management?.pessimistic_scenario?.maturity}</span></div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 11. NEXT STEPS */}
            <Section title="Next Steps & Recommendations" number={11}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2">
                            <Rocket className="w-4 h-4" /> Immediate Actions (First 30 Days)
                        </h4>
                        <ul className="space-y-3">
                            {doc.recommendations_next_steps?.immediate_actions?.map((a: string, i: number) => (
                                <li key={i} className="flex gap-3 items-start p-4 bg-slate-50 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-black text-white">{i + 1}</div>
                                    <span className="text-sm font-medium text-slate-700">{a}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="p-8 bg-indigo-600 rounded-[3rem] text-white space-y-6 relative overflow-hidden group shadow-xl">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] -mr-32 -mt-32 rounded-full group-hover:scale-125 transition-transform duration-1000"></div>
                        <h4 className="text-xl font-black italic relative z-10">Critical Success Factors</h4>
                        <div className="grid grid-cols-1 gap-4 relative z-10">
                            {doc.recommendations_next_steps?.critical_success_factors?.map((f: string, i: number) => (
                                <div key={i} className="flex items-center gap-3 bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                                    <span className="text-sm font-black">{f}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* 12. DETAILED IMPLEMENTATION ROADMAP */}
            <Section title="Detailed Implementation Roadmap" number={12}>
                <div className="space-y-8">
                    <div className="p-6 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl">
                        <h4 className="text-sm font-black text-blue-700 uppercase tracking-widest mb-3">Phased Execution Strategy</h4>
                        <p className="text-slate-700 leading-relaxed">
                            The transformation will be executed across four strategic phases over 18-24 months, with each phase building upon the previous to ensure sustainable change and minimize operational disruption.
                        </p>
                    </div>

                    {/* Phase Details */}
                    {[
                        {
                            phase: "Phase 1: Foundation & Quick Wins",
                            duration: "Months 1-3",
                            budget: "15-20% of total investment",
                            objectives: [
                                "Establish program governance structure and steering committee",
                                "Deploy employee self-service portal for basic HR transactions",
                                "Implement mobile app for time & attendance",
                                "Automate 3-5 high-volume manual processes",
                                "Launch change management and communication campaign"
                            ],
                            deliverables: [
                                "Program charter and governance framework",
                                "Self-service portal (80% adoption target)",
                                "Mobile app with biometric integration",
                                "Process automation for leave requests, expense claims, document requests",
                                "Change readiness assessment and stakeholder map"
                            ],
                            risks: [
                                "User adoption resistance - Mitigate with champions network and training",
                                "Technical integration delays - Parallel run existing systems",
                                "Change fatigue - Focus on visible quick wins"
                            ]
                        },
                        {
                            phase: "Phase 2: Core Systems Deployment",
                            duration: "Months 4-9",
                            budget: "40-45% of total investment",
                            objectives: [
                                "Implement core HRMS platform (Workday/SAP SuccessFactors/Oracle HCM)",
                                "Deploy performance management system with continuous feedback",
                                "Launch learning management system (LMS) with AI-powered recommendations",
                                "Integrate payroll with time & attendance",
                                "Establish HR analytics foundation with key dashboards"
                            ],
                            deliverables: [
                                "Fully configured HRMS with employee master data migrated",
                                "Performance management workflows (goals, reviews, 360 feedback)",
                                "LMS with 500+ courses and learning paths",
                                "Integrated payroll processing with automated tax calculations",
                                "Executive dashboard with 15+ key HR metrics"
                            ],
                            risks: [
                                "Data migration quality issues - Implement data cleansing protocols",
                                "System integration complexity - Use proven middleware/APIs",
                                "Vendor delivery delays - Build buffer time and penalty clauses"
                            ]
                        },
                        {
                            phase: "Phase 3: Advanced Capabilities",
                            duration: "Months 10-15",
                            budget: "25-30% of total investment",
                            objectives: [
                                "Deploy AI-powered recruitment platform with candidate matching",
                                "Implement predictive analytics for attrition and succession planning",
                                "Launch internal talent marketplace for gig assignments",
                                "Deploy chatbot for HR service desk (70% automation target)",
                                "Establish people analytics center of excellence"
                            ],
                            deliverables: [
                                "AI recruitment platform with 40% faster time-to-hire",
                                "Predictive models for flight risk and high-potential identification",
                                "Talent marketplace with 200+ internal opportunities",
                                "HR chatbot handling 5,000+ queries/month",
                                "Advanced analytics team with 3-5 data scientists"
                            ],
                            risks: [
                                "AI model accuracy concerns - Continuous training and human oversight",
                                "Data privacy compliance - Privacy impact assessment and controls",
                                "Skills gap in analytics - Hire specialists and upskill existing team"
                            ]
                        },
                        {
                            phase: "Phase 4: Optimization & Innovation",
                            duration: "Months 16-24",
                            budget: "10-15% of total investment",
                            objectives: [
                                "Optimize all processes based on 12-month operational data",
                                "Implement advanced automation (RPA) for remaining manual tasks",
                                "Deploy employee experience platform with personalized journeys",
                                "Establish continuous improvement framework",
                                "Launch innovation lab for emerging HR tech pilots"
                            ],
                            deliverables: [
                                "Process optimization achieving 30%+ efficiency gains",
                                "RPA bots automating 50+ repetitive tasks",
                                "Employee experience score improvement of 20+ points",
                                "Quarterly innovation sprints with 2-3 pilots per year",
                                "Comprehensive lessons learned and best practices documentation"
                            ],
                            risks: [
                                "Optimization fatigue - Celebrate wins and maintain momentum",
                                "Technology obsolescence - Continuous market scanning",
                                "Sustaining improvements - Embed in operating model and KPIs"
                            ]
                        }
                    ].map((phase, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2">{phase.phase}</h3>
                                    <div className="flex items-center gap-4 text-sm">
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">{phase.duration}</span>
                                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-medium">{phase.budget}</span>
                                    </div>
                                </div>
                                <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                                    <span className="text-2xl font-black text-indigo-600">{idx + 1}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div>
                                    <h4 className="text-xs font-black text-indigo-700 uppercase tracking-widest mb-3">Key Objectives</h4>
                                    <ul className="space-y-2">
                                        {phase.objectives.map((obj: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start text-sm text-slate-600">
                                                <ChevronRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                                <span>{obj}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-3">Deliverables</h4>
                                    <ul className="space-y-2">
                                        {phase.deliverables.map((del: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start text-sm text-slate-600">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                <span>{del}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest mb-3">Risk Mitigation</h4>
                                    <ul className="space-y-2">
                                        {phase.risks.map((risk: string, i: number) => (
                                            <li key={i} className="flex gap-2 items-start text-sm text-slate-600">
                                                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                <span>{risk}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* 13. ORGANIZATIONAL CHANGE MANAGEMENT */}
            <Section title="Organizational Change Management Framework" number={13}>
                <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <Target className="w-6 h-6 text-blue-600" />
                                Stakeholder Engagement Strategy
                            </h3>
                            <div className="space-y-4">
                                {[
                                    {
                                        group: "Executive Leadership",
                                        approach: "Monthly steering committee meetings, executive dashboards, ROI tracking",
                                        engagement: "High"
                                    },
                                    {
                                        group: "HR Business Partners",
                                        approach: "Weekly working sessions, co-design workshops, early access to tools",
                                        engagement: "Very High"
                                    },
                                    {
                                        group: "Line Managers",
                                        approach: "Manager toolkits, train-the-trainer programs, peer learning circles",
                                        engagement: "High"
                                    },
                                    {
                                        group: "Employees",
                                        approach: "Town halls, demo sessions, gamified learning, support hotline",
                                        engagement: "Medium-High"
                                    },
                                    {
                                        group: "IT & Security",
                                        approach: "Technical design reviews, security assessments, integration planning",
                                        engagement: "High"
                                    }
                                ].map((stakeholder, i) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-slate-900">{stakeholder.group}</span>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black ${stakeholder.engagement === "Very High" ? "bg-emerald-100 text-emerald-700" :
                                                stakeholder.engagement === "High" ? "bg-blue-100 text-blue-700" :
                                                    "bg-amber-100 text-amber-700"
                                                }`}>{stakeholder.engagement}</span>
                                        </div>
                                        <p className="text-sm text-slate-600">{stakeholder.approach}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <Activity className="w-6 h-6 text-emerald-600" />
                                Training & Enablement Plan
                            </h3>
                            <div className="space-y-6">
                                {[
                                    {
                                        program: "Executive Briefings",
                                        duration: "2 hours",
                                        participants: "C-suite & VPs",
                                        content: "Strategic vision, business case, change roadmap, governance model"
                                    },
                                    {
                                        program: "Power User Certification",
                                        duration: "3 days",
                                        participants: "HR team & champions",
                                        content: "Deep-dive on all modules, admin functions, troubleshooting, support protocols"
                                    },
                                    {
                                        program: "Manager Workshops",
                                        duration: "4 hours",
                                        participants: "All people managers",
                                        content: "Performance management, talent reviews, analytics dashboards, mobile tools"
                                    },
                                    {
                                        program: "Employee Onboarding",
                                        duration: "1 hour",
                                        participants: "All employees",
                                        content: "Self-service portal, mobile app, key workflows, support resources"
                                    },
                                    {
                                        program: "Continuous Learning",
                                        duration: "Ongoing",
                                        participants: "All users",
                                        content: "Microlearning videos, knowledge base, monthly tips, office hours"
                                    }
                                ].map((training, i) => (
                                    <div key={i} className="p-4 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl shadow-sm">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-black text-slate-900">{training.program}</h4>
                                            <span className="text-xs font-bold text-emerald-600">{training.duration}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mb-1">Target: {training.participants}</p>
                                        <p className="text-sm text-slate-700">{training.content}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-indigo-50 border border-indigo-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-black text-indigo-900 mb-6">Communication Campaign Timeline</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { month: "Month 1-2", focus: "Awareness", activities: "Launch announcement, vision videos, FAQ portal, leadership messages" },
                                { month: "Month 3-6", focus: "Understanding", activities: "Demo sessions, roadshows, success stories, benefits messaging" },
                                { month: "Month 7-12", focus: "Adoption", activities: "Training campaigns, gamification, early adopter recognition, support resources" },
                                { month: "Month 13+", focus: "Sustainment", activities: "Continuous improvement, innovation showcases, best practices sharing" }
                            ].map((period, i) => (
                                <div key={i} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                                    <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">{period.month}</div>
                                    <div className="text-lg font-black text-slate-900 mb-3">{period.focus}</div>
                                    <p className="text-sm text-slate-600 leading-relaxed">{period.activities}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* 14. DETAILED FINANCIAL MODEL */}
            <Section title="Comprehensive Financial Analysis" number={14}>
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6">Investment Breakdown (3-Year TCO)</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h4 className="text-sm font-black text-blue-700 uppercase tracking-widest mb-4">Capital Expenditure (CapEx)</h4>
                                <div className="space-y-3">
                                    {[
                                        { item: "Software Licenses (HRMS, LMS, ATS)", amount: "$1.2M", percentage: "30%" },
                                        { item: "Implementation Services", amount: "$800K", percentage: "20%" },
                                        { item: "Infrastructure & Hardware", amount: "$400K", percentage: "10%" },
                                        { item: "Data Migration & Integration", amount: "$300K", percentage: "7.5%" },
                                        { item: "Customization & Configuration", amount: "$300K", percentage: "7.5%" }
                                    ].map((cost, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-slate-900 mb-1">{cost.item}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600" style={{ width: cost.percentage }}></div>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{cost.percentage}</span>
                                                </div>
                                            </div>
                                            <div className="text-lg font-black text-blue-600 ml-4">{cost.amount}</div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="font-black text-slate-900">Total CapEx</span>
                                        <span className="text-2xl font-black text-blue-600">$3.0M</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-4">Operating Expenditure (OpEx) - Annual</h4>
                                <div className="space-y-3">
                                    {[
                                        { item: "SaaS Subscriptions & Maintenance", amount: "$450K", percentage: "45%" },
                                        { item: "Support & Helpdesk", amount: "$200K", percentage: "20%" },
                                        { item: "Training & Change Management", amount: "$150K", percentage: "15%" },
                                        { item: "Cloud Infrastructure (AWS/Azure)", amount: "$100K", percentage: "10%" },
                                        { item: "Continuous Improvement & Innovation", amount: "$100K", percentage: "10%" }
                                    ].map((cost, i) => (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="flex-1">
                                                <div className="text-sm font-bold text-slate-900 mb-1">{cost.item}</div>
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-600" style={{ width: cost.percentage }}></div>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{cost.percentage}</span>
                                                </div>
                                            </div>
                                            <div className="text-lg font-black text-emerald-600 ml-4">{cost.amount}</div>
                                        </div>
                                    ))}
                                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                        <span className="font-black text-slate-900">Annual OpEx</span>
                                        <span className="text-2xl font-black text-emerald-600">$1.0M</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-r-xl border-l-4">
                            <h4 className="text-sm font-black text-indigo-700 uppercase tracking-widest mb-3">3-Year Total Cost of Ownership</h4>
                            <div className="flex items-baseline gap-4">
                                <span className="text-4xl font-black text-slate-900">$6.0M</span>
                                <span className="text-sm text-slate-500">(CapEx $3.0M + OpEx $3.0M over 3 years)</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6">Value Realization & ROI Model</h3>
                        <div className="space-y-6">
                            {[
                                {
                                    category: "Operational Efficiency Gains",
                                    items: [
                                        { benefit: "HR FTE reduction (30% efficiency)", value: "$900K/year", calculation: "10 FTEs × $90K avg cost × 30% efficiency" },
                                        { benefit: "Reduced manual processing time", value: "$400K/year", calculation: "5,000 hrs/month × $80/hr × 50% reduction" },
                                        { benefit: "Payroll error reduction", value: "$150K/year", calculation: "95% accuracy improvement × avg correction cost" }
                                    ]
                                },
                                {
                                    category: "Strategic Value Creation",
                                    items: [
                                        { benefit: "Improved time-to-hire (40% faster)", value: "$600K/year", calculation: "200 hires × 15 days saved × $200/day opportunity cost" },
                                        { benefit: "Reduced employee turnover (5% improvement)", value: "$1.2M/year", calculation: "50 fewer exits × $24K avg replacement cost" },
                                        { benefit: "Enhanced productivity (3% uplift)", value: "$2.4M/year", calculation: "2,000 employees × $40K avg productivity × 3%" }
                                    ]
                                },
                                {
                                    category: "Risk Mitigation & Compliance",
                                    items: [
                                        { benefit: "Reduced compliance violations", value: "$300K/year", calculation: "Avoid 3 major violations × $100K avg penalty" },
                                        { benefit: "Improved audit readiness", value: "$100K/year", calculation: "80% reduction in audit preparation time" },
                                        { benefit: "Data security improvements", value: "$200K/year", calculation: "Risk-adjusted value of breach prevention" }
                                    ]
                                }
                            ].map((category: any, idx) => (
                                <div key={idx} className="bg-emerald-50 border border-emerald-100 border-l-4 border-l-emerald-600 rounded-r-xl p-6 shadow-sm">
                                    <h4 className="text-lg font-bold text-emerald-800 mb-4">{category.category}</h4>
                                    <div className="space-y-3">
                                        {category.items.map((item: any, i: number) => (
                                            <div key={i} className="flex items-start justify-between gap-4 p-3 bg-white border border-slate-100 rounded-lg shadow-sm">
                                                <div className="flex-1">
                                                    <div className="font-semibold text-slate-900 text-sm mb-1">{item.benefit}</div>
                                                    <div className="text-xs text-slate-500">{item.calculation}</div>
                                                </div>
                                                <div className="text-lg font-black text-emerald-600 whitespace-nowrap">{item.value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="bg-indigo-600 border border-indigo-700 rounded-3xl p-8 text-white shadow-xl">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <div className="text-xs font-semibold text-indigo-200 uppercase tracking-widest mb-2">Total Annual Benefits</div>
                                        <div className="text-4xl font-black text-white mb-1">$6.25M</div>
                                        <div className="text-xs text-indigo-300">Recurring value per year</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-semibold text-emerald-300 uppercase tracking-widest mb-2">3-Year Net Value</div>
                                        <div className="text-4xl font-black text-white mb-1">$12.75M</div>
                                        <div className="text-xs text-emerald-400">Benefits $18.75M - Costs $6.0M</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs font-semibold text-purple-200 uppercase tracking-widest mb-2">ROI & Payback</div>
                                        <div className="text-4xl font-black text-white mb-1">213%</div>
                                        <div className="text-xs text-purple-300">Payback in 11 months</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 15. TECHNOLOGY ARCHITECTURE & INTEGRATION */}
            <Section title="Technology Architecture & Integration Strategy" number={15}>
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6">Recommended Technology Stack</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    layer: "Core HRMS Platform",
                                    vendors: ["Workday HCM", "SAP SuccessFactors", "Oracle HCM Cloud"],
                                    capabilities: ["Employee master data", "Org management", "Compensation", "Benefits admin", "Workflow engine"],
                                    recommendation: "Workday HCM (Best fit for mid-large enterprises, strong UX, continuous innovation)"
                                },
                                {
                                    layer: "Talent Management Suite",
                                    vendors: ["Cornerstone OnDemand", "Saba Cloud", "LinkedIn Learning"],
                                    capabilities: ["Recruitment (ATS)", "Onboarding", "Performance mgmt", "Learning & development", "Succession planning"],
                                    recommendation: "Integrated Workday Talent + LinkedIn Learning (Seamless experience, AI-powered recommendations)"
                                },
                                {
                                    layer: "Employee Experience Layer",
                                    vendors: ["Microsoft Viva", "ServiceNow HR", "Qualtrics"],
                                    capabilities: ["Employee portal", "Mobile app", "Chatbot/virtual assistant", "Surveys & feedback", "Knowledge management"],
                                    recommendation: "Microsoft Viva (Leverages existing M365 investment, strong adoption)"
                                }
                            ].map((stack: any, i: number) => (
                                <div key={i} className="bg-blue-50 border border-blue-100 rounded-2xl p-6 shadow-sm">
                                    <h4 className="text-lg font-bold text-blue-700 mb-4">{stack.layer}</h4>
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Vendor Options</div>
                                            <div className="flex flex-wrap gap-2">
                                                {stack.vendors.map((vendor: string, j: number) => (
                                                    <span key={j} className="px-2 py-1 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg">{vendor}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Key Capabilities</div>
                                            <ul className="space-y-1">
                                                {stack.capabilities.map((cap: string, j: number) => (
                                                    <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 flex-shrink-0" />
                                                        <span>{cap}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div className="pt-3 border-t border-blue-100">
                                            <div className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-1">Recommendation</div>
                                            <p className="text-xs text-slate-600 leading-relaxed font-bold">{stack.recommendation}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6">Integration Architecture & Data Flow</h3>
                        <div className="space-y-6">
                            <div className="p-6 bg-purple-50 border-l-4 border-purple-600 rounded-r-xl">
                                <h4 className="text-sm font-black text-purple-700 uppercase tracking-widest mb-3">Integration Principles</h4>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {[
                                        "API-first architecture using RESTful services",
                                        "Real-time data sync for critical transactions",
                                        "Batch processing for bulk data loads (nightly)",
                                        "Event-driven architecture for workflow triggers",
                                        "Master data management with HRMS as system of record",
                                        "Middleware layer (MuleSoft/Dell Boomi) for orchestration"
                                    ].map((principle, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                            <ChevronRight className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                            <span>{principle}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {[
                                    {
                                        integration: "HRMS ↔ Payroll System",
                                        frequency: "Real-time + Daily batch",
                                        dataFlow: "Employee master, time & attendance, salary changes → Payroll calculations, tax filings ← HRMS",
                                        method: "REST API + SFTP for bulk files",
                                        criticality: "High"
                                    },
                                    {
                                        integration: "HRMS ↔ Active Directory / SSO",
                                        frequency: "Real-time",
                                        dataFlow: "New hire, termination, role changes → AD provisioning/de-provisioning",
                                        method: "SCIM protocol + Azure AD Connect",
                                        criticality: "High"
                                    },
                                    {
                                        integration: "HRMS ↔ Finance ERP",
                                        frequency: "Daily batch",
                                        dataFlow: "Headcount, cost center allocations → Budget vs actuals, financial reporting",
                                        method: "REST API + scheduled jobs",
                                        criticality: "Medium"
                                    },
                                    {
                                        integration: "HRMS ↔ Background Check Vendor",
                                        frequency: "On-demand",
                                        dataFlow: "Candidate info → Background check results",
                                        method: "Webhook + API callbacks",
                                        criticality: "Medium"
                                    }
                                ].map((int, i) => (
                                    <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-black text-slate-900">{int.integration}</h4>
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-black ${int.criticality === "High" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"
                                                }`}>{int.criticality}</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div><span className="text-slate-500 font-bold">Frequency:</span> <span className="text-slate-700 font-medium">{int.frequency}</span></div>
                                            <div><span className="text-slate-500 font-bold">Data Flow:</span> <span className="text-slate-700">{int.dataFlow}</span></div>
                                            <div><span className="text-slate-500 font-bold">Method:</span> <span className="text-slate-700">{int.method}</span></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 16. VENDOR SELECTION & GOVERNANCE */}
            <Section title="Vendor Selection & Governance Framework" number={16}>
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6">Vendor Evaluation Criteria & Scoring</h3>
                        <div className="overflow-hidden rounded-2xl border border-slate-200">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-900 text-white">
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Evaluation Criteria</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Weight</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Workday</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">SAP SF</th>
                                        <th className="p-4 text-xs font-semibold uppercase tracking-widest text-white/80">Oracle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {[
                                        { criteria: "Functional Fit (Core HR, Payroll, Talent)", weight: "30%", workday: "95", sap: "90", oracle: "88" },
                                        { criteria: "User Experience & Adoption", weight: "20%", workday: "92", sap: "78", oracle: "75" },
                                        { criteria: "Integration Capabilities & APIs", weight: "15%", workday: "88", sap: "92", oracle: "90" },
                                        { criteria: "Analytics & Reporting", weight: "10%", workday: "90", sap: "85", oracle: "82" },
                                        { criteria: "Implementation Track Record", weight: "10%", workday: "87", sap: "88", oracle: "85" },
                                        { criteria: "Total Cost of Ownership (3-yr)", weight: "10%", workday: "75", sap: "82", oracle: "80" },
                                        { criteria: "Vendor Stability & Roadmap", weight: "5%", workday: "95", sap: "90", oracle: "88" }
                                    ].map((row, i) => (
                                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                                            <td className="p-4 font-semibold text-slate-900">{row.criteria}</td>
                                            <td className="p-4 text-slate-500 font-medium">{row.weight}</td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-emerald-600" style={{ width: `${row.workday}%` }}></div>
                                                    </div>
                                                    <span className="text-slate-900 font-bold text-sm w-8">{row.workday}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-blue-600" style={{ width: `${row.sap}%` }}></div>
                                                    </div>
                                                    <span className="text-slate-900 font-bold text-sm w-8">{row.sap}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className="h-full bg-purple-600" style={{ width: `${row.oracle}%` }}></div>
                                                    </div>
                                                    <span className="text-slate-900 font-bold text-sm w-8">{row.oracle}</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    <tr className="bg-slate-50 font-black">
                                        <td className="p-4 text-slate-900">Weighted Total Score</td>
                                        <td className="p-4 text-slate-900">100%</td>
                                        <td className="p-4 text-emerald-600 text-lg">89.4</td>
                                        <td className="p-4 text-blue-600 text-lg">86.7</td>
                                        <td className="p-4 text-purple-600 text-lg">84.2</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-6 p-6 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl">
                            <h4 className="text-sm font-bold text-emerald-700 uppercase tracking-widest mb-2">Recommended Vendor</h4>
                            <p className="text-slate-700 leading-relaxed font-medium">
                                <strong className="text-slate-900">Workday HCM</strong> emerges as the top choice with a weighted score of 89.4, excelling in functional fit, user experience, and analytics. While slightly higher in TCO, the superior adoption rates and lower change management costs justify the investment.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900 mb-6">Contract Negotiation Priorities</h3>
                            <div className="space-y-4">
                                {[
                                    { priority: "Pricing & Licensing", items: ["Volume discounts for 2,000+ users", "Flexible licensing (concurrent vs named)", "Price protection (max 5% annual increase)", "Free sandbox environments for testing"] },
                                    { priority: "Service Level Agreements", items: ["99.9% uptime guarantee with credits", "< 4 hour response for P1 incidents", "Dedicated customer success manager", "Quarterly business reviews"] },
                                    { priority: "Implementation Terms", items: ["Fixed-price implementation (not T&M)", "Milestone-based payments (30-40-30)", "Knowledge transfer included", "Go-live support (2 weeks post-launch)"] },
                                    { priority: "Exit & Data Portability", items: ["No termination penalties after Year 2", "Full data export in standard formats", "90-day transition assistance", "IP ownership of customizations"] }
                                ].map((section: any, i: number) => (
                                    <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                                        <h4 className="font-black text-slate-900 mb-3">{section.priority}</h4>
                                        <ul className="space-y-2">
                                            {section.items.map((item: string, j: number) => (
                                                <li key={j} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <ChevronRight className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                                                    <span>{item}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                            <h3 className="text-xl font-black text-slate-900 mb-6">Ongoing Vendor Governance</h3>
                            <div className="space-y-6">
                                <div className="p-6 bg-blue-50 border-l-4 border-blue-600 rounded-r-xl">
                                    <h4 className="text-sm font-black text-blue-700 uppercase tracking-widest mb-3">Performance Monitoring</h4>
                                    <ul className="space-y-2">
                                        {[
                                            "Monthly SLA compliance reports (uptime, response times, resolution rates)",
                                            "Quarterly user satisfaction surveys (NPS tracking)",
                                            "Annual vendor scorecard (functionality, support, innovation, value)",
                                            "Continuous roadmap alignment reviews"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <Activity className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 bg-amber-50 border-l-4 border-amber-600 rounded-r-xl">
                                    <h4 className="text-sm font-black text-amber-700 uppercase tracking-widest mb-3">Risk Mitigation</h4>
                                    <ul className="space-y-2">
                                        {[
                                            "Escrow agreement for source code (business continuity)",
                                            "Annual disaster recovery testing",
                                            "Data backup and retention policies (7-year minimum)",
                                            "Vendor financial health monitoring (Dun & Bradstreet)"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <ShieldAlert className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-6 bg-emerald-50 border-l-4 border-emerald-600 rounded-r-xl">
                                    <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest mb-3">Value Optimization</h4>
                                    <ul className="space-y-2">
                                        {[
                                            "Bi-annual feature adoption reviews (maximize license utilization)",
                                            "Innovation workshops with vendor product teams",
                                            "Peer community engagement (user groups, conferences)",
                                            "Continuous improvement backlog prioritization"
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                <TrendingUp className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* 17. PERFORMANCE MEASUREMENT & KPIs */}
            <Section title="Performance Measurement Framework" number={17}>
                <div className="space-y-8">
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900 mb-6">Transformation Success Metrics Dashboard</h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {[
                                {
                                    category: "Adoption & Engagement",
                                    metrics: [
                                        { kpi: "System Login Rate", baseline: "N/A", target: "95%", frequency: "Weekly" },
                                        { kpi: "Self-Service Utilization", baseline: "20%", target: "80%", frequency: "Monthly" },
                                        { kpi: "Mobile App Active Users", baseline: "N/A", target: "70%", frequency: "Monthly" },
                                        { kpi: "Training Completion Rate", baseline: "N/A", target: "100%", frequency: "Quarterly" },
                                        { kpi: "User Satisfaction (NPS)", baseline: "N/A", target: "50+", frequency: "Quarterly" }
                                    ]
                                },
                                {
                                    category: "Operational Efficiency",
                                    metrics: [
                                        { kpi: "HR-to-Employee Ratio", baseline: "1:80", target: "1:120", frequency: "Quarterly" },
                                        { kpi: "Average Transaction Time", baseline: "15 min", target: "5 min", frequency: "Monthly" },
                                        { kpi: "Process Automation Rate", baseline: "30%", target: "70%", frequency: "Quarterly" },
                                        { kpi: "Data Accuracy", baseline: "85%", target: "98%", frequency: "Monthly" },
                                        { kpi: "Service Desk Ticket Volume", baseline: "500/mo", target: "150/mo", frequency: "Monthly" }
                                    ]
                                },
                                {
                                    category: "Business Impact",
                                    metrics: [
                                        { kpi: "Time-to-Hire", baseline: "45 days", target: "27 days", frequency: "Monthly" },
                                        { kpi: "Employee Turnover Rate", baseline: "18%", target: "13%", frequency: "Quarterly" },
                                        { kpi: "Employee Engagement Score", baseline: "65", target: "75", frequency: "Annual" },
                                        { kpi: "Compliance Violations", baseline: "12/year", target: "2/year", frequency: "Quarterly" },
                                        { kpi: "ROI Realization", baseline: "0%", target: "100%", frequency: "Quarterly" }
                                    ]
                                }
                            ].map((category: any, idx) => (
                                <div key={idx} className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
                                    <h4 className="text-lg font-black text-indigo-700 mb-4">{category.category}</h4>
                                    <div className="space-y-3">
                                        {category.metrics.map((metric: any, i: number) => (
                                            <div key={i} className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-bold text-slate-900">{metric.kpi}</span>
                                                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{metric.frequency}</span>
                                                </div>
                                                <div className="flex items-center gap-3 text-xs">
                                                    <div className="flex-1">
                                                        <div className="text-slate-400 mb-1">Baseline</div>
                                                        <div className="font-bold text-slate-500">{metric.baseline}</div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 text-indigo-600" />
                                                    <div className="flex-1">
                                                        <div className="text-slate-400 mb-1">Target</div>
                                                        <div className="font-bold text-emerald-600">{metric.target}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-indigo-600 border border-indigo-700 rounded-3xl p-8 text-white shadow-xl">
                        <h3 className="text-xl font-black text-white mb-6">Continuous Improvement Cycle</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            {[
                                {
                                    phase: "Measure",
                                    icon: BarChart3,
                                    activities: ["Collect KPI data from systems", "Conduct user surveys", "Analyze support tickets", "Review audit logs"],
                                    frequency: "Weekly/Monthly"
                                },
                                {
                                    phase: "Analyze",
                                    icon: Brain,
                                    activities: ["Identify trends and patterns", "Root cause analysis", "Benchmark against targets", "Prioritize improvement areas"],
                                    frequency: "Monthly"
                                },
                                {
                                    phase: "Improve",
                                    icon: Zap,
                                    activities: ["Design interventions", "Pilot improvements", "Update training materials", "Refine processes"],
                                    frequency: "Quarterly"
                                },
                                {
                                    phase: "Control",
                                    icon: ShieldCheck,
                                    activities: ["Standardize best practices", "Update documentation", "Communicate changes", "Monitor sustainability"],
                                    frequency: "Ongoing"
                                }
                            ].map((step, i) => (
                                <div key={i} className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
                                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <step.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">{step.phase}</h4>
                                    <div className="text-xs font-bold text-indigo-200 mb-4">{step.frequency}</div>
                                    <ul className="space-y-2 text-left">
                                        {step.activities.map((activity, j) => (
                                            <li key={j} className="text-xs text-white/80 flex items-start gap-2">
                                                <CheckCircle2 className="w-3 h-3 text-emerald-300 mt-0.5 flex-shrink-0" />
                                                <span>{activity}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>

            {/* FOOTER */}
            <footer className="pt-24 pb-12 text-center opacity-50 border-t border-slate-200">
                <div className="w-16 h-8 mx-auto mb-4 grayscale contrast-125">
                    <img src="/logo_icon_final.png" alt="Logo" className="w-full h-full object-contain" />
                </div>
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Confidential Board Dossier • {engineName} Analysis • Powered by HRTEKSYSTEM AI</p>
                <p className="text-[10px] mt-1 text-slate-400 font-semibold uppercase tracking-[0.4em]">{isMounted ? new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-- --- ----'}</p>
            </footer>
        </div>
    );
}
