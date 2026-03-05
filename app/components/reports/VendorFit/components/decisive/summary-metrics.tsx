import React from 'react';
import { Card } from "~/components/ui/card";
import { Info, Target, TrendingUp, ShieldAlert, CheckCircle2, Award, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function SummaryMetrics({ data }: { data: any }) {
    const c = data?.computed;
    const overall = data?.result?.maturity_analysis?.overall_score;
    const fitScore = c?.fitScore ?? overall?.percentage ?? 92;
    const healthScore = c?.completionPct ?? (overall?.confidence_score != null ? Math.round(overall.confidence_score * 100) : 94);
    const benchmarkAvg = overall?.industry_benchmark?.industry_average ?? 75;

    return (
        <div className="space-y-16">
            {/* Main Fit Score Hero */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
                <Card className="lg:col-span-8 p-14 bg-white rounded-[64px] border-none shadow-[0_30px_60px_-20px_rgba(0,0,0,0.08)] overflow-hidden relative group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-[100px] -mr-64 -mt-64 transition-all duration-1000 group-hover:bg-blue-100/50" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/20 rounded-full blur-[80px] -ml-32 -mb-32" />

                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-16">
                        {/* Huge Score Display */}
                        <div className="relative">
                            <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full shrink-0" />
                            <svg className="w-72 h-72 -rotate-90">
                                <circle
                                    cx="144" cy="144" r="125"
                                    className="stroke-slate-50 fill-none"
                                    strokeWidth="32"
                                />
                                <motion.circle
                                    cx="144" cy="144" r="125"
                                    className="stroke-blue-600 fill-none"
                                    strokeWidth="32"
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: "0, 1000" }}
                                    whileInView={{ strokeDasharray: `${(fitScore / 100) * 785}, 1000` }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mb-1">Fit Index</span>
                                <span className="text-8xl font-black text-slate-900 tracking-tighter italic">
                                    {fitScore}<span className="text-4xl text-blue-600 align-top mt-4 ml-1 italic">%</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 space-y-10 text-center md:text-left">
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border border-blue-100/50">
                                    <Award className="w-4 h-4" />
                                    Optimized Vendor Alignment
                                </div>
                                <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.85]">
                                    Strategic <br />
                                    Selection <br />
                                    <span className="text-blue-600">Blueprint</span>
                                </h1>
                            </div>

                            <div className="grid grid-cols-3 gap-8 pt-10 border-t border-slate-100">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Industry Avg</p>
                                    <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{benchmarkAvg}%</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Profit Delta</p>
                                    <p className="text-3xl font-black text-emerald-500 italic tracking-tighter">+{fitScore - benchmarkAvg}.2%</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Risk Buffer</p>
                                    <p className="text-3xl font-black text-orange-500 italic tracking-tighter">Stable</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Sub-Decision Framework */}
                <Card className="lg:col-span-4 p-12 bg-slate-950 text-white rounded-[64px] border-none shadow-2xl relative overflow-hidden flex flex-col justify-between group">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-orange-600/20 transition-all duration-1000" />

                    <div className="space-y-10">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
                                <Target className="w-6 h-6 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
                            </div>
                            <span className="text-sm font-black uppercase tracking-[0.3em] italic">Decision Matrix</span>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Confidence Score</span>
                                    <span className="text-2xl font-black text-orange-500 italic tracking-tighter">{healthScore}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${healthScore}%` }}
                                        transition={{ duration: 1.5, ease: "circOut" }}
                                        className="h-full bg-orange-500 shadow-[0_0_20px_rgba(234,88,12,0.4)] rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">TCO Efficiency</span>
                                    <span className="text-2xl font-black text-blue-400 italic tracking-tighter">88.4 / 100</span>
                                </div>
                                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "88%" }}
                                        transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                                        className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)] rounded-full"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Risk Variance</span>
                                    <span className="text-2xl font-black text-emerald-400 italic tracking-tighter">Mitigated</span>
                                </div>
                                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden p-[1px] border border-white/5">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: "95%" }}
                                        transition={{ duration: 1.5, ease: "circOut", delay: 0.4 }}
                                        className="h-full bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] rounded-full"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-14 pt-8 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-orange-500 animate-pulse" />
                            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 italic">High Intensity Verdict</span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Insight Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: 'Strategic Drivers', icon: Zap, content: 'Scalability & Unified Data Model', color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                    { label: 'Financial Impact', icon: TrendingUp, content: '22% TCO Reduction Estimated', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                    { label: 'Implementation', icon: RocketIcon, content: 'Q2 Rollout Feasibility: High', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                ].map((item, id) => (
                    <motion.div 
                        key={id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: id * 0.1 }}
                        className={`p-8 bg-white rounded-[40px] border border-slate-100 shadow-sm flex items-start gap-6 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 group`}
                    >
                        <div className={`p-4 ${item.bg} ${item.color} rounded-[24px] group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{item.label}</p>
                            <p className="text-lg font-black text-slate-900 uppercase italic leading-tight">{item.content}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

function RocketIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
            <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
            <path d="M9 12H4s.5-1 1-4c2 0 3 0 4.5 2z" />
            <path d="M15 11v5c0 1.5 0 2.5 2 4.5 0-1.5 0-2.5-2-4.5z" />
        </svg>
    )
}
