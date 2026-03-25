import React from "react";
import { Search, Layers, Zap, ShieldCheck, Flag, Info, Rocket, Timer, Settings2, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "~/components/ui/card";

const steps = [
    { title: "Configuration & Build", sub: "Weeks 1-8", status: "Active", icon: Settings2, color: "bg-blue-600" },
    { title: "Global Integration", sub: "Weeks 9-16", status: "Planning", icon: Share2, color: "bg-indigo-600" },
    { title: "Testing & Validation", sub: "Weeks 17-20", status: "Queued", icon: ShieldCheck, color: "bg-emerald-600" },
    { title: "Deployment Wave 1", sub: "Weeks 21-24", status: "Future", icon: Rocket, color: "bg-orange-600" },
];

export function ActionRoadmap({ data }: { data: any }) {
    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Timer className="w-3 h-3 text-blue-400" />
                        Execution Blueprint
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Strategic <span className="text-blue-600">Roadmap</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                        High-velocity implementation trajectory for {data?.vendorRecommendations?.[0]?.category || 'Primary Vendor'}
                    </p>
                </div>
            </div>

            <Card className="p-16 bg-white rounded-[48px] border-none shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-12 relative">
                        {/* Connecting Line */}
                        <div className="absolute top-12 left-12 right-12 h-0.5 bg-slate-100 hidden md:block" />

                        {steps.map((step, i) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.15 }}
                                className="flex flex-col items-center gap-8 relative z-20 group"
                            >
                                <div className="space-y-4 flex flex-col items-center">
                                    <div className={`w-24 h-24 rounded-[32px] ${step.color} text-white flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform duration-500`}>
                                        <step.icon className="w-10 h-10" />
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${step.status === 'Active' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-slate-100 text-slate-400'}`}>
                                        {step.status}
                                    </div>
                                </div>

                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{step.sub}</p>
                                    <h4 className="text-lg font-black text-slate-900 uppercase italic leading-tight tracking-tight">
                                        {step.title.split(' ').map((word, idx) => (
                                            <React.Fragment key={idx}>{word}<br /></React.Fragment>
                                        ))}
                                    </h4>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <div className="mt-20 pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-6">
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none block">Primary Velocity</span>
                            <p className="text-xl font-black text-slate-900 italic uppercase">24 Weeks to MVP</p>
                        </div>
                        <div className="w-px h-10 bg-slate-200" />
                        <div className="space-y-1">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none block">Critical Gate</span>
                            <p className="text-xl font-black text-slate-900 italic uppercase">UAT Sign-off</p>
                        </div>
                    </div>
                    <button className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-slate-900/10">
                        View Detailed Gantt Chart
                    </button>
                </div>
            </Card>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex items-start gap-6"
            >
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <Flag className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategic Roadmap Note</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        "The architecture phase (Weeks 1-8) is identified as the critical path, requiring early alignment on data mapping between legacy core systems and Workday's unified data model."
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
