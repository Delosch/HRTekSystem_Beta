import React from 'react';
import { motion } from 'framer-motion';
import { Database, Cloud, Share2, ShieldCheck, Cpu, Globe, Infinity, Layers } from 'lucide-react';
import { Card } from '~/components/ui/card';

export function TechInfrastructure({ data }: { data: any }) {
    const techStacks = [
        { name: "Digital Core (ERP)", value: 92, status: "UNIFIED", icon: Database, color: "text-blue-600", bg: "bg-blue-50" },
        { name: "Cloud Infrastructure", value: 85, status: "NATIVE", icon: Cloud, color: "text-indigo-600", bg: "bg-indigo-50" },
        { name: "API & Connectivity", value: 76, status: "ACTIVE", icon: Share2, color: "text-emerald-600", bg: "bg-emerald-50" },
        { name: "Security Protocols", value: 88, status: "ZERO-T", icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50" },
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Layers className="w-3 h-3 text-blue-400" />
                        Technological Fabric
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Digital <span className="text-blue-600">Core</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Infrastructure readiness & Cloud adoption index</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {techStacks.map((stack, id) => (
                    <motion.div
                        key={id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: id * 0.1 }}
                    >
                        <Card className="p-10 bg-white rounded-[48px] border-none shadow-2xl hover:shadow-blue-500/10 transition-all group overflow-hidden relative">
                            <div className={`absolute top-0 right-0 w-32 h-32 ${stack.bg} rounded-full blur-3xl -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity`} />

                            <div className="relative z-10 space-y-8 text-center">
                                <div className={`w-20 h-20 ${stack.bg} ${stack.color} rounded-3xl mx-auto flex items-center justify-center shadow-lg group-hover:rotate-6 transition-transform`}>
                                    <stack.icon className="w-10 h-10" />
                                </div>
                                <div className="space-y-2">
                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none block">{stack.status}</span>
                                    <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter leading-tight">{stack.name}</h4>
                                </div>
                                <div className="space-y-3">
                                    <span className="text-4xl font-black text-slate-900 italic tracking-tighter block">{stack.value}%</span>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${stack.value}%` }}
                                            className={`h-full ${stack.color.replace('text', 'bg')} shadow-lg`}
                                        />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-10">
                <Card className="lg:col-span-7 p-12 bg-slate-900 text-white rounded-[48px] border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute left-0 bottom-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -ml-32 -mb-32" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                        <div className="w-48 h-48 relative flex items-center justify-center">
                            <svg className="w-full h-full -rotate-90">
                                <circle cx="96" cy="96" r="85" className="stroke-slate-800 fill-none" strokeWidth="18" />
                                <motion.circle
                                    cx="96" cy="96" r="85"
                                    className="stroke-blue-500 fill-none"
                                    strokeWidth="18"
                                    strokeDasharray="534"
                                    initial={{ strokeDashoffset: 534 }}
                                    whileInView={{ strokeDashoffset: 534 - (534 * 0.89) }}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center">
                                <span className="text-4xl font-black italic tracking-tighter">89%</span>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Connectivity</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-6">
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Hyper-Scale <br /> Connectivity</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase leading-relaxed italic">The current ecosystem supports high-bandwidth real-time data sync across 14 global processing hubs.</p>
                            <div className="flex gap-4">
                                <div className="px-5 py-3 bg-slate-800 rounded-2xl border border-slate-700">
                                    <span className="text-xl font-black italic text-blue-400">0.4s</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Core Latency</span>
                                </div>
                                <div className="px-5 py-3 bg-slate-800 rounded-2xl border border-slate-700">
                                    <span className="text-xl font-black italic text-emerald-400">99.9</span>
                                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest block">Uptime %</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-5 p-12 bg-white rounded-[48px] border-none shadow-2xl flex items-center justify-center group overflow-hidden relative text-center">
                    <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 space-y-6">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-[24px] mx-auto flex items-center justify-center shadow-xl shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <Infinity className="w-8 h-8" />
                        </div>
                        <div>
                            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none mb-2">Omni-Channel Flow</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Rate Index</p>
                        </div>
                        <span className="text-5xl font-black text-blue-600 italic tracking-tighter">94.2%</span>
                    </div>
                </Card>
            </div>
        </div>
    );
}
