import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ShieldCheck, Activity, Target, Zap, ShieldAlert } from 'lucide-react';
import { Card } from '~/components/ui/card';

export function ChangeRiskMatrix({ data }: { data: any }) {
    const risks = [
        { name: "Cultural Inertia", level: "High", color: "bg-rose-500", p: 85, i: 92 },
        { name: "Skills Mismatch", level: "Med", color: "bg-amber-500", p: 45, i: 68 },
        { name: "Process Friction", level: "Med", color: "bg-amber-500", p: 60, i: 55 },
        { name: "Digital Fatigue", level: "Low", color: "bg-emerald-500", p: 25, i: 30 },
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <ShieldAlert className="w-3 h-3 text-rose-400" />
                        Risk Perimeter
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Resistance <span className="text-rose-600">Matrix</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Identification of organizational friction points & mitigation pathways</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Visual Matrix */}
                <Card className="lg:col-span-12 p-12 bg-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50 rounded-full blur-3xl -mr-40 -mt-40 opacity-50 transition-opacity" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 relative z-10">
                        <div className="space-y-10">
                            <h3 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase italic">Risk Velocity Matrix</h3>
                            <div className="relative aspect-square bg-slate-50 rounded-3xl border border-slate-100 overflow-hidden flex items-center justify-center">
                                {/* Grid Lines */}
                                <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                                    <div className="border-r border-b border-slate-200" />
                                    <div className="border-b border-slate-200" />
                                    <div className="border-r border-slate-200" />
                                    <div />
                                </div>

                                {/* Labels */}
                                <div className="absolute left-4 top-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">High Impact</div>
                                <div className="absolute right-4 bottom-4 text-[8px] font-black text-slate-400 uppercase tracking-widest">High Prob</div>

                                {/* Risk Bubbles */}
                                {risks.map((risk, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ scale: 0, opacity: 0 }}
                                        whileInView={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className={`absolute w-12 h-12 ${risk.color} rounded-full flex items-center justify-center text-white shadow-lg cursor-help group/bubble`}
                                        style={{
                                            left: `${risk.p}%`,
                                            bottom: `${risk.i}%`,
                                            transform: 'translate(-50%, 50%)'
                                        }}
                                    >
                                        <AlertTriangle className="w-5 h-5" />
                                        <div className="absolute bottom-full mb-3 hidden group-hover/bubble:block w-48 p-4 bg-slate-900 rounded-2xl text-white text-xs font-bold shadow-2xl z-20">
                                            <p className="uppercase tracking-widest text-[8px] text-slate-400 mb-1">{risk.name}</p>
                                            <p className="italic uppercase tracking-tight">Magnitude: {risk.level}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase italic">Mitigation Strategies</h3>
                            <div className="space-y-6">
                                {risks.map((risk, idx) => (
                                    <div key={idx} className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] hover:bg-slate-100 transition-colors">
                                        <div className={`w-10 h-10 rounded-2xl ${risk.color} flex items-center justify-center text-white shrink-0 shadow-lg`}>
                                            <Zap className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="text-sm font-black text-slate-900 uppercase tracking-tighter italic leading-none">{risk.name}</h4>
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">({risk.level})</span>
                                            </div>
                                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Targeted intervention required in Q2</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
