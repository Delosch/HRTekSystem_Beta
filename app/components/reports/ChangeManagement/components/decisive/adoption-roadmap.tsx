import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Circle, ArrowRight, Flag, Rocket, ShieldCheck } from 'lucide-react';
import { Card } from '~/components/ui/card';

export function AdoptionRoadmap({ data }: { data: any }) {
    const phases = [
        {
            title: "Wave 1: Initialization",
            timeline: "Months 1-3",
            status: "COMPLETE",
            tasks: ["Case for Change", "Stakeholder ID", "Baseline Assessment"],
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            icon: CheckCircle2
        },
        {
            title: "Wave 2: Activation",
            timeline: "Months 4-8",
            status: "IN PROGRESS",
            tasks: ["Leader Toolkits", "Digital Fluency Training", "Feedback Loop Live"],
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            icon: Rocket
        },
        {
            title: "Wave 3: Embedding",
            timeline: "Months 9-18",
            status: "PLANNED",
            tasks: ["Sustainment Audit", "Knowledge Transfer", "Benefit Realization"],
            color: "text-slate-400",
            bg: "bg-slate-50",
            icon: Flag
        }
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Calendar className="w-3 h-3 text-indigo-400" />
                        Execution Timeline
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Adoption <span className="text-indigo-600">Roadmap</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Phased transformation delivery & benefit realization waves</p>
                </div>
            </div>

            <div className="space-y-10">
                {phases.map((phase, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <Card className="p-10 bg-white rounded-[48px] border-none shadow-xl hover:shadow-2xl transition-all relative overflow-hidden group">
                            {/* Connector Line */}
                            {idx < phases.length - 1 && (
                                <div className="absolute left-1/2 bottom-0 w-px h-10 bg-slate-200 translate-y-full z-0" />
                            )}

                            <div className="flex flex-col md:flex-row gap-10 items-start md:items-center relative z-10">
                                <div className={`w-20 h-20 rounded-[32px] ${phase.bg} flex items-center justify-center shrink-0`}>
                                    <phase.icon className={`w-10 h-10 ${phase.color}`} />
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">{phase.title}</h3>
                                                <span className={`px-2 py-0.5 ${phase.bg} ${phase.color} rounded text-[8px] font-black tracking-widest uppercase`}>{phase.status}</span>
                                            </div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{phase.timeline}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        {phase.tasks.map((task, i) => (
                                            <div key={i} className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                                                <div className={`w-1.5 h-1.5 rounded-full ${phase.color}`} />
                                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{task}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-8 bg-slate-50 rounded-[32px] md:w-64">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Confidence</span>
                                        <span className="text-xs font-black text-slate-900 italic">85%</span>
                                    </div>
                                    <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: '85%' }}
                                            className="h-full bg-indigo-600"
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
