import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Target, TrendingUp, Award, RocketIcon } from 'lucide-react';
import { Card } from '~/components/ui/card';

export function SummaryHero({ data }: { data: any }) {
    const c = data?.computed;
    const overallScore = c?.sstiScore ?? (Math.round((data?.result?.maturity_analysis?.overall_score || 0) * 20) || 78);
    const techScore    = c?.technology     ?? 89;
    const agenticScore = c?.agentic        ?? 45;
    const govScore     = c?.governance     ?? 92;
    const riskBuf      = Math.max(5, 100 - overallScore);
    const processScore = c?.process        ?? 71;
    const changeScore  = c?.changeAdoption ?? 58;
    const changeStatus = changeScore >= 70 ? 'HIGH' : changeScore >= 50 ? 'MED' : 'LOW';
    const effDelta     = overallScore - 65;
    const effGain      = effDelta >= 0 ? `+${effDelta.toFixed(1)}%` : `${effDelta.toFixed(1)}%`;

    return (
        <div className="space-y-16">
            {/* Premium Metric Cards (Top Row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Strategic Risk Buffer', val: `${riskBuf}%`,    icon: Target,     color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100/50' },
                    { label: 'Digital Core Maturity', val: `${techScore}%`,  icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100/50' },
                    { label: 'Agentic Readiness',    val: `${agenticScore}%`, icon: RocketIcon, color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-100/50' },
                    { label: 'Governance Health',    val: `${govScore}%`,    icon: Award,      color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100/50' }
                ].map((item, id) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: id * 0.1, duration: 0.5 }}
                        className={`p-6 bg-white rounded-[32px] border ${item.border} flex items-center justify-between group hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500`}
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-3.5 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.15em]">{item.label}</span>
                        </div>
                        <span className={`text-2xl font-semibold ${item.color} italic tracking-tighter`}>{item.val}</span>
                    </motion.div>
                ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-semibold uppercase tracking-widest">
                        <Zap className="w-3 h-3 text-blue-400" />
                        Executive Insight
                    </div>
                    <h1 className="text-7xl font-semibold text-slate-900 uppercase tracking-tighter italic leading-none">
                        Strategic <span className="text-blue-600">Pulse</span>
                    </h1>
                    <p className="text-slate-500 font-medium uppercase text-[10px] tracking-[0.2em]">Global Shared Services Architecture & Readiness Blueprint</p>
                </div>
                <div className="flex items-center gap-10">
                    <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Audit Status</span>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            <span className="text-sm font-semibold text-slate-900 uppercase italic">Active Validation</span>
                        </div>
                    </div>
                    <div className="h-12 w-px bg-slate-200 hidden md:block" />
                    <div className="text-right">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block mb-1">Efficiency Gain</span>
                        <span className="text-3xl font-semibold text-blue-600 italic tracking-tighter">{effGain}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Gauge */}
                <Card className="lg:col-span-8 p-12 bg-white rounded-[64px] border-none shadow-[0_30px_60px_-20px_rgba(0,0,0,0.08)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-50 opacity-40 rounded-full blur-[100px] -mr-64 -mt-64 transition-all duration-1000 group-hover:opacity-70" />
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="relative flex justify-center">
                            {/* Inner Glow */}
                            <div className="absolute inset-0 bg-blue-500/5 blur-[100px] rounded-full" />
                            
                            <svg className="w-72 h-72 -rotate-90">
                                <circle
                                    cx="144" cy="144" r="125"
                                    className="stroke-slate-50 fill-none"
                                    strokeWidth="32"
                                />
                                <motion.circle
                                    cx="144" cy="144" r="125"
                                    className="stroke-blue-600 fill-none shadow-2xl"
                                    strokeWidth="32"
                                    strokeDasharray="785"
                                    initial={{ strokeDashoffset: 785 }}
                                    whileInView={{ strokeDashoffset: 785 - (785 * (overallScore / 100)) }}
                                    strokeLinecap="round"
                                    transition={{ duration: 2, ease: "circOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    className="text-8xl font-semibold text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-600 tracking-tighter italic"
                                >
                                    {overallScore}<span className="text-4xl text-blue-600 align-top mt-4 ml-1 italic">%</span>
                                </motion.span>
                                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.3em] mt-1">Maturity Fit</span>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="space-y-4">
                                <h2 className="text-5xl font-semibold text-slate-900 uppercase tracking-tighter leading-[0.85] italic">
                                    Service Model <br />
                                    <span className="text-blue-600">Integrity</span>
                                </h2>
                                <p className="text-base font-medium text-slate-500 leading-relaxed italic uppercase max-w-sm">
                                    Structural alignment indicates a high-velocity transition capability, contingent on unified governance framework adoption.
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-8 bg-slate-50 rounded-[40px] border border-slate-100 flex flex-col gap-1">
                                    <span className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">Industry Avg</span>
                                    <span className="text-2xl font-semibold text-slate-900 italic tracking-tighter">65%</span>
                                </div>
                                <div className="p-8 bg-emerald-50 rounded-[40px] border border-emerald-100 flex flex-col gap-1">
                                    <span className="text-[9px] font-semibold text-emerald-600 uppercase tracking-widest">Efficiency Delta</span>
                                    <span className="text-2xl font-semibold text-emerald-600 italic tracking-tighter">{effGain}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Sub Gauges */}
                <div className="lg:col-span-4 grid grid-cols-1 gap-10">
                    <Card className="p-10 bg-slate-950 text-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-emerald-500/20 transition-all duration-1000" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-white/5 rounded-3xl backdrop-blur-xl border border-white/10">
                                    <Activity className="w-7 h-7 text-emerald-400" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-4xl font-semibold italic text-emerald-400 tracking-tighter">{processScore}%</span>
                                    <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mt-1">Status: Stable</span>
                                </div>
                            </div>
                            <div className="mt-16">
                                <h3 className="text-2xl font-semibold uppercase tracking-tighter italic leading-tight mb-2">Process Maturity</h3>
                                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">Global Standardization Index</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-10 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-xl border border-white/20">
                                    <Award className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="text-4xl font-semibold italic text-white tracking-tighter">{changeStatus}</span>
                                    <span className="text-[9px] font-semibold text-blue-200 uppercase tracking-widest mt-1">{changeScore}% Score</span>
                                </div>
                            </div>
                            <div className="mt-16">
                                <h3 className="text-2xl font-semibold uppercase tracking-tighter italic leading-tight mb-2">Change Readiness</h3>
                                <p className="text-[10px] font-medium text-blue-200 uppercase tracking-[0.2em]">Internal Culture Alignment</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
