import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, AlertTriangle, CheckCircle2, Target, BarChart3, Lock, ShieldAlert, FileText } from 'lucide-react';
import { Card } from '~/components/ui/card';

export function RiskGovernance({ data }: { data: any }) {
    const c = data?.computed;
    const rl = (v: number) => v >= 70 ? 'Low' : v >= 50 ? 'Med' : 'High';
    const rc = (v: number) => v >= 70
        ? { color: 'text-emerald-500', bg: 'bg-emerald-50' }
        : { color: 'text-orange-500',  bg: 'bg-orange-50' };
    const govScore    = c?.governance     ?? 94;
    const dataScore   = c?.dataManagement ?? 88;
    const opScore     = c?.operatingModel ?? 62;
    const procScore   = c?.process        ?? 81;
    const complianceScore = govScore;
    const riskAreas = [
        { name: "Regulatory Compliance", score: govScore,  risk: rl(govScore),  ...rc(govScore) },
        { name: "Data Privacy & GDPR",   score: dataScore, risk: rl(dataScore), ...rc(dataScore) },
        { name: "Third-Party Risk",      score: opScore,   risk: rl(opScore),   ...rc(opScore) },
        { name: "Operational Resilience",score: procScore, risk: rl(procScore), ...rc(procScore) },
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <ShieldAlert className="w-3 h-3 text-red-400" />
                        Governance Shield
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Risk & <span className="text-blue-600">Governance</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Resilience matrix & Audit readiness scoring</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Compliance Radar / Gauge */}
                <Card className="lg:col-span-5 p-12 bg-white rounded-[56px] border-none shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -ml-32 -mt-32" />
                    <div className="relative z-10 space-y-10">
                        <div className="w-56 h-56 relative flex items-center justify-center mx-auto">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="112" cy="112" r="100" className="stroke-slate-100 fill-none" strokeWidth="20" />
                                <motion.circle
                                    cx="112" cy="112" r="100"
                                    className="stroke-emerald-500 fill-none"
                                    strokeWidth="20"
                                    strokeDasharray="628"
                                    initial={{ strokeDashoffset: 628 }}
                                    whileInView={{ strokeDashoffset: 628 - (628 * (complianceScore / 100)) }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-5xl font-black italic text-slate-900 tracking-tighter">{complianceScore}%</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compliance Score</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                <CheckCircle2 className="w-3 h-3" />
                                Audit Ready
                            </div>
                            <p className="text-sm font-black text-slate-700 uppercase italic tracking-tight italic">Exceeds Industry Benchmarks</p>
                        </div>
                    </div>
                </Card>

                {/* Risk Area Profile */}
                <Card className="lg:col-span-7 p-12 bg-slate-900 text-white rounded-[56px] border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute right-0 bottom-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -mr-40 -mb-40" />

                    <div className="space-y-10 relative z-10 h-full flex flex-col justify-between">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-400 tracking-[0.2em] uppercase italic">Risk Mitigation Matrix</h3>
                            <AlertTriangle className="w-5 h-5 text-orange-500" />
                        </div>

                        <div className="space-y-8">
                            {riskAreas.map((area, id) => (
                                <div key={id} className="space-y-4 group">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-800 rounded-2xl group-hover:bg-blue-600 transition-colors">
                                                {[ShieldCheck, Lock, AlertTriangle, FileText][id] && React.createElement([ShieldCheck, Lock, AlertTriangle, FileText][id], { className: "w-4 h-4" })}
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">Status: {area.risk} Risk</span>
                                                <h4 className="text-sm font-black text-white uppercase italic tracking-tight leading-none">{area.name}</h4>
                                            </div>
                                        </div>
                                        <span className="text-2xl font-black italic text-blue-400">{area.score}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${area.score}%` }}
                                            className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">24/7 Threat Monitoring Active</span>
                            </div>
                            <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Version 2.4-BETA</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
