import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, BarChart2, PieChart as PieChartIcon, CheckCircle2, Crosshair, Users, Database } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell, CartesianGrid } from "recharts";

export function OperationalEfficiency({ data }: { data: any }) {
    const c = data?.computed;
    const sl = (v: number) => v >= 70 ? 'OPT' : v >= 50 ? 'STD' : 'DEF';
    const p  = c?.process          ?? 71;
    const s  = c?.serviceExperience ?? 64;
    const g  = c?.governance        ?? 52;
    const o  = c?.operatingModel    ?? 68;
    const performanceData = [
        { name: "Process Framework",   value: p, status: sl(p), details: "Global standardization mapping complete", color: "bg-blue-600" },
        { name: "Service Architecture",value: s, status: sl(s), details: "Hub & Spoke model optimization",         color: "bg-emerald-500" },
        { name: "Governance Engine",   value: g, status: sl(g), details: "Regional compliance matrix audit",       color: "bg-blue-500" },
        { name: "Sourcing Strategy",   value: o, status: sl(o), details: "Hybrid delivery model valuation",        color: "bg-orange-500" },
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Settings2 className="w-3 h-3 text-blue-400" />
                        Operating Model Architecture
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Operational <span className="text-blue-600">Efficiency</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Efficiency Audit of the GBS framework</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Horizontal Bar Scoreboard */}
                <Card className="lg:col-span-12 p-16 bg-white rounded-[64px] border-none shadow-[0_30px_60px_-15px_rgba(0,0,0,0.06)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-40 group-hover:opacity-60 transition-opacity duration-1000" />

                    <div className="space-y-16 relative z-10">
                        {performanceData.map((item, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: id * 0.1, duration: 0.6 }}
                                className="group/item"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-10">
                                    <div className="w-20 h-20 rounded-[32px] bg-slate-50 flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-blue-50 transition-all duration-500 shadow-sm">
                                        {[Database, Users, Crosshair, Settings2][id % 4] && React.createElement([Database, Users, Crosshair, Settings2][id % 4], { className: "w-9 h-9 text-slate-400 group-hover/item:text-blue-600 transition-colors" })}
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-4">
                                                <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic">{item.name}</h4>
                                                <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black text-slate-500 tracking-[0.2em] uppercase">{item.status}</span>
                                            </div>
                                            <span className="text-3xl font-black text-slate-900 italic tracking-tighter">{item.value}%</span>
                                        </div>
                                        <div className="h-3 w-full bg-slate-50 rounded-full overflow-hidden relative border border-slate-100 p-[1px]">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.value}%` }}
                                                transition={{ duration: 1.5, ease: "circOut" }}
                                                className={`h-full ${item.color} rounded-full shadow-lg relative overflow-hidden`}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
                                            </motion.div>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-400 uppercase italic tracking-[0.2em]">
                                            {item.details}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div className="mt-20 pt-12 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { title: 'Unified Process Taxonomy', label: 'Strategic Strength', icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' },
                            { title: 'Autonomous Orchestration', label: 'Growth Potential', icon: BarChart2, bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                            { title: 'Regional Service Symmetry', label: 'Core Focus', icon: Crosshair, bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' }
                        ].map((rec, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className={`p-8 ${rec.bg} rounded-[40px] border ${rec.border} group hover:scale-[1.03] transition-all duration-500`}
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <rec.icon className={`w-5 h-5 ${rec.text}`} />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{rec.label}</span>
                                </div>
                                <p className={`text-lg font-black ${rec.text === 'text-emerald-600' ? 'text-slate-800' : rec.text} italic uppercase leading-tight`}>
                                    {rec.title}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
