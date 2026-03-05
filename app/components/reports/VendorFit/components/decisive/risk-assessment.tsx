import React from "react";
import { Info, ShieldCheck, AlertTriangle, CheckCircle2, Target, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "~/components/ui/card";

export function RiskAssessment({ data }: { data: any }) {
    const c = data?.computed;
    const rl = (v: number) => v >= 70 ? 'Low' : v >= 50 ? 'Med' : 'High';
    const rc = (v: number) => v >= 70 ? 'text-emerald-500' : v >= 50 ? 'text-orange-500' : 'text-red-500';
    const sec  = c?.securityScore    ?? 92;
    const rep  = c?.vendorReputation ?? 88;
    const vend = c?.vendorScore      ?? 76;
    const impl = c?.implementScore   ?? 84;
    const riskAreas = [
        { name: "Global Data Residency",      score: sec,  risk: rl(sec),  color: rc(sec)  },
        { name: "API Integrity & Security",   score: rep,  risk: rl(rep),  color: rc(rep)  },
        { name: "Vendor Financial Stability", score: vend, risk: rl(vend), color: rc(vend) },
        { name: "Implementation Scalability", score: impl, risk: rl(impl), color: rc(impl) },
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <ShieldCheck className="w-3 h-3 text-red-400" />
                        Risk Radius & Matrix
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Integrity <span className="text-blue-600">Profile</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                        Structural integrity mapping of primary vendor ecosystem
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* 2x2 Strategic Priority Matrix */}
                <Card className="lg:col-span-7 p-10 bg-white rounded-[48px] border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase italic">Strategic Priority Matrix</h3>
                            <div className="flex items-center gap-4 text-[8px] font-black uppercase tracking-widest text-slate-400">
                                <span>High Value</span>
                                <div className="w-8 h-px bg-slate-200" />
                                <span>Low Complexity</span>
                            </div>
                        </div>

                        {/* The Matrix */}
                        <div className="aspect-[4/3] bg-slate-50 rounded-[32px] border-2 border-slate-100 relative p-8">
                            {/* Lines */}
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-slate-200" />
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200" />

                            {/* Axis Labels */}
                            <div className="absolute -left-12 top-1/2 -rotate-90 origin-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Value</div>
                            <div className="absolute left-1/2 -bottom-8 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Implementation Complexity</div>

                            {/* Matrix Points */}
                            <MatrixPoint x="20%" y="20%" label="Core HR" color="bg-blue-600" active />
                            <MatrixPoint x="70%" y="30%" label="Advanced AI" color="bg-orange-600" />
                            <MatrixPoint x="40%" y="65%" label="Legacy Integration" color="bg-slate-400" />
                            <MatrixPoint x="80%" y="80%" label="Global Payroll" color="bg-emerald-600" />
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-4">
                            <div className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
                                <p>1. Target high value / low complexity implementations initially.</p>
                            </div>
                            <div className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase">
                                <p>2. Defer high-complexity / low-value items to phase 3.</p>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Risk Area Profile */}
                <Card className="lg:col-span-5 p-10 bg-slate-900 text-white rounded-[48px] border-none shadow-2xl space-y-10">
                    <div className="flex items-center gap-3 mb-8">
                        <AlertTriangle className="w-5 h-5 text-orange-500" />
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Risk Profiling</span>
                    </div>

                    <div className="space-y-8">
                        {riskAreas.map((area, id) => (
                            <div key={id} className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{area.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${area.color}`}>{area.risk}</span>
                                        <span className="text-lg font-black italic">{area.score}%</span>
                                    </div>
                                </div>
                                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${area.score}%` }}
                                        className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-8 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <p className="text-[10px] font-bold text-slate-300 italic uppercase">Enterprise Stability Verified</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function MatrixPoint({ x, y, label, color, active = false }: { x: string, y: string, label: string, color: string, active?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
            style={{ left: x, top: y }}
        >
            <div className={`w-4 h-4 ${active ? 'w-6 h-6' : ''} ${color} rounded-full shadow-lg ${active ? 'animate-pulse ring-4 ring-offset-2 ring-blue-500/20 ring-offset-slate-50' : ''}`} />
            <span className="text-[8px] font-black text-slate-900 bg-white/80 backdrop-blur-sm px-2 py-0.5 rounded shadow-sm uppercase tracking-tighter whitespace-nowrap">
                {label}
            </span>
        </motion.div>
    );
}
