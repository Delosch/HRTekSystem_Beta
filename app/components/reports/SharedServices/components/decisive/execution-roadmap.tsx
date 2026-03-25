import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Flag, Globe, Search, Settings2, ShieldCheck, Activity, Zap, CheckCircle2, Clock } from 'lucide-react';
import { Card } from '~/components/ui/card';

export function ExecutionRoadmap({ data }: { data: any }) {
    const phases = [
        {
            title: "Wave 1: Foundation",
            duration: "0-3 Months",
            status: "CURRENT",
            color: "bg-blue-600",
            icon: ShieldCheck,
            milestones: ["Unified Governance", "Cloud Core Setup", "Process Audit"]
        },
        {
            title: "Wave 2: Convergence",
            duration: "3-9 Months",
            status: "PLANNING",
            color: "bg-indigo-500",
            icon: Activity,
            milestones: ["Regional Hubs Sync", "Service Lifecycle", "AI Core Integration"]
        },
        {
            title: "Wave 3: Autonomy",
            duration: "9-24 Months",
            status: "FUTURE",
            color: "bg-emerald-500",
            icon: Rocket,
            milestones: ["Agentic Orchestration", "Zero-Touch Support", "Cognitive GBS"]
        }
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Flag className="w-3 h-3 text-blue-400" />
                        Execution Blueprint
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Strategic <span className="text-blue-600">Roadmap</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Milestone-based delivery trajectory for GBS transformation</p>
                </div>
            </div>

            <div className="relative pt-12">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 hidden lg:block" />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
                    {phases.map((phase, id) => (
                        <motion.div
                            key={id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: id * 0.2 }}
                            className="group"
                        >
                            <Card className="p-10 bg-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group-hover:-translate-y-4 transition-all duration-500">
                                <div className={`absolute top-0 right-0 w-32 h-32 ${phase.color.replace('bg-', 'bg-')}/10 rounded-full blur-3xl -mr-16 -mt-16`} />

                                <div className="space-y-10 relative z-10">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-4 ${phase.color} text-white rounded-[24px] shadow-xl shadow-${phase.color.split('-')[1]}-500/20`}>
                                            <phase.icon className="w-8 h-8" />
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">{phase.duration}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${phase.status === 'CURRENT' ? 'bg-blue-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                                {phase.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none group-hover:text-blue-600 transition-colors">{phase.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Strategic Phase Objectives</p>
                                    </div>

                                    <div className="space-y-4 pt-6 border-t border-slate-50">
                                        {phase.milestones.map((ms, mid) => (
                                            <div key={mid} className="flex items-center gap-3">
                                                <CheckCircle2 className={`w-4 h-4 ${phase.status === 'CURRENT' ? 'text-blue-500' : 'text-slate-200'}`} />
                                                <span className="text-[11px] font-black text-slate-700 uppercase italic tracking-tight">{ms}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-6">
                                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-3xl border border-slate-100 group-hover:bg-blue-50 group-hover:border-blue-200 transition-all">
                                            <div className="flex items-center gap-3">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Est. Completion</span>
                                            </div>
                                            <span className="text-xs font-black text-slate-900 italic tracking-tighter">Oct 2026</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            <Card className="p-12 bg-slate-950 text-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl -mr-40 -mt-40" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-blue-400">
                            <Zap className="w-3 h-3" />
                            Accelerated Path
                        </div>
                        <h3 className="text-4xl font-black uppercase tracking-tighter italic leading-none">Capture Efficiency <br /> <span className="text-blue-500">Ahead of Schedule</span></h3>
                        <p className="text-sm font-bold text-slate-400 leading-relaxed italic uppercase max-w-xl">Leveraging human-AI orchestration patterns identified in the audit can compress Wave 2 timelines by an estimated 14.5%.</p>
                    </div>
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 shadow-2xl shadow-blue-500/20 ring-8 ring-white/5">
                            <button className="px-12 py-6 bg-slate-950 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all border border-white/10">
                                Initiate Wave 1 Audit
                            </button>
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Signed off by HRTek Systems Audit Team</span>
                    </div>
                </div>
            </Card>
        </div>
    );
}
