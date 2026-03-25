import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Target, TrendingUp, ShieldCheck, Rocket } from 'lucide-react';
import { Card } from '~/components/ui/card';

export function SummaryHero({ data }: { data: any }) {
    const readiness_score = data?.readinessAssessment?.overallScore || 72;
    const impact_score = data?.impactAssessment?.overallScore || 65;
    const maturity_score = data?.maturityLevel || 58;
    const c = data?.computed;
    const advocacyFlow = c?.advocacyFlow ?? 84;
    const fluencyRate  = c?.fluencyRate  ?? 67;
    const overall      = c?.overall      ?? readiness_score;
    const gripDelta    = overall - 62;
    const gripDeltaStr = gripDelta >= 0 ? `+${gripDelta}%` : `${gripDelta}%`;

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-slate-200/60">
                <div className="space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-slate-200/50">
                        <Zap className="w-4 h-4 text-indigo-400 animate-pulse" />
                        Executive Intelligence Pulse
                    </div>
                    <h1 className="text-8xl font-black text-slate-900 uppercase tracking-tighter italic leading-[0.8]">
                        Change <br />
                        <span className="text-indigo-600">Readiness</span>
                    </h1>
                    <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em] flex items-center gap-3">
                        <div className="w-12 h-[1px] bg-slate-200" />
                        Organizational Absorption Velocity Audit
                    </p>
                </div>
                <div className="flex items-center gap-12 mb-2">
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Alignment Status</span>
                        <div className="flex items-center gap-2 justify-end">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-[pulse_2s_infinite] shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                            <span className="text-lg font-black text-slate-900 uppercase italic tracking-tighter">Firm Grip</span>
                        </div>
                    </div>
                    <div className="h-16 w-px bg-slate-200 hidden md:block" />
                    <div className="text-right">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Impact Radius</span>
                        <span className="text-3xl font-black text-indigo-600 italic tracking-tighter uppercase">Enterprise</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Gauge */}
                <Card className="lg:col-span-8 p-14 bg-white rounded-[64px] border-none shadow-[0_30px_60px_-20px_rgba(0,0,0,0.06)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-50/40 rounded-full blur-[100px] -mr-64 -mt-64 transition-all duration-1000 group-hover:bg-indigo-50/60" />
                    
                    <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div className="relative flex justify-center shrink-0">
                            <div className="absolute inset-0 bg-indigo-500/5 blur-[80px] rounded-full" />
                            <svg className="w-72 h-72 -rotate-90 scale-110">
                                <circle
                                    cx="144" cy="144" r="125"
                                    className="stroke-slate-50 fill-none"
                                    strokeWidth="32"
                                />
                                <motion.circle
                                    cx="144" cy="144" r="125"
                                    className="stroke-indigo-600 fill-none"
                                    strokeWidth="32"
                                    strokeLinecap="round"
                                    initial={{ strokeDasharray: "0, 1000" }}
                                    whileInView={{ strokeDasharray: `${(readiness_score / 100) * 785}, 1000` }}
                                    transition={{ duration: 2, ease: "circOut" }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    className="text-8xl font-black text-slate-900 tracking-tighter italic"
                                >
                                    {readiness_score}<span className="text-4xl text-indigo-600 italic opacity-50">%</span>
                                </motion.span>
                                <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] mt-2">Ready Index</span>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter leading-[0.85] italic">
                                    Strategic <br />
                                    <span className="text-indigo-600">Saturation</span>
                                </h2>
                                <p className="text-[13px] font-bold text-slate-500 leading-relaxed italic uppercase">
                                    High cultural receptivity noted across digital domains. Sustained advocacy required to maintain transformation momentum.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-100">
                                <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100/50">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Industry Median</span>
                                    <span className="text-2xl font-black text-slate-900 italic tracking-tighter">62%</span>
                                </div>
                                <div className="p-6 bg-emerald-50 rounded-[32px] border border-emerald-100/50">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest block mb-2">Grip Delta</span>
                                    <span className="text-2xl font-black text-emerald-600 italic tracking-tighter">{gripDeltaStr}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Sub Gauges */}
                <div className="lg:col-span-4 grid grid-cols-1 gap-8">
                    <Card className="p-10 bg-slate-950 text-white rounded-[48px] border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-indigo-500/20 transition-all duration-1000" />
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-white/5 rounded-[24px] border border-white/10 backdrop-blur-md">
                                    <Activity className="w-6 h-6 text-indigo-400 shadow-[0_0_15px_rgba(129,140,248,0.4)]" />
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black italic text-indigo-400 tracking-tighter">{impact_score}%</span>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Magnitude</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none mb-2">Impact Radius</h3>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Disruption Intensity</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-10 bg-indigo-600 text-white rounded-[48px] border-none shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px] -mr-24 -mt-24 group-hover:bg-white/20 transition-all duration-1000" />
                        <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                            <div className="flex justify-between items-start">
                                <div className="p-4 bg-white/10 rounded-[24px] border border-white/10 backdrop-blur-md">
                                    <ShieldCheck className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <span className="text-4xl font-black italic text-white tracking-tighter">{maturity_score}%</span>
                                    <p className="text-[9px] font-bold text-indigo-200 uppercase tracking-widest mt-1">Structural</p>
                                </div>
                            </div>
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tighter italic leading-none mb-2">Change Maturity</h3>
                                <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest opacity-80">Adaptation Intelligence</p>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Micro-Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Advocacy Flow', val: `${advocacyFlow}%`, icon: Target, color: 'text-orange-500', bg: 'bg-orange-50' },
                    { label: 'Fluency Rate', val: `${fluencyRate}%`, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-50' },
                    { label: 'Velocity', val: '4.2x', icon: Rocket, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                    { label: 'Symmetry', val: 'Unified', icon: ShieldCheck, color: 'text-blue-500', bg: 'bg-blue-50' }
                ].map((item, id) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, y: 15 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: id * 0.1 }}
                        className="p-8 bg-white rounded-[40px] border border-slate-100 flex items-center justify-between group hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500"
                    >
                        <div className="flex items-center gap-5">
                            <div className={`p-3 rounded-[20px] ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{item.label}</span>
                        </div>
                        <span className="text-2xl font-black text-slate-900 italic tracking-tighter">{item.val}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
