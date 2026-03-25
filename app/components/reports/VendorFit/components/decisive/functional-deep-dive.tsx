import React from 'react';
import { Info, Activity, Zap, CheckCircle2, ShieldCheck, Database, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "~/components/ui/card";

export function FunctionalDeepDive({ data }: { data: any }) {
    const c = data?.computed;
    const sl = (v: number) => v >= 80 ? 'HIGH' : v >= 60 ? 'CORE' : 'ADV';
    const fn  = c?.functional    ?? 94;
    const sec = c?.securityScore  ?? 88;
    const rm  = c?.roadmapScore   ?? 82;
    const vs  = c?.vendorScore    ?? 76;
    const imp = c?.implementScore ?? 85;
    const performanceData = [
        { name: "Core HR & Employee Lifecycle", value: fn,  status: sl(fn),  details: "Market-leading automation",    icon: Users,      color: "bg-blue-600" },
        { name: "Global Payroll & Compliance",  value: sec, status: sl(sec), details: "Native 120+ countries",        icon: Globe,      color: "bg-emerald-500" },
        { name: "Talent & Performance Mgmt",    value: rm,  status: sl(rm),  details: "AI-driven skill mapping",      icon: TargetIcon, color: "bg-blue-500" },
        { name: "Advanced Workforce Analytics", value: vs,  status: sl(vs),  details: "Predictive turnover modeling", icon: Activity,   color: "bg-orange-500" },
        { name: "Tech Ecosystem & APIs",        value: imp, status: sl(imp), details: "Open REST architecture",       icon: Database,   color: "bg-blue-600" },
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Activity className="w-3 h-3 text-teal-400" />
                        Capability Audit
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Functional <span className="text-blue-600">Scoreboard</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                        Deep-dive analysis of {data?.vendorRecommendations?.[0]?.category || 'Primary Vendor'} capability matrix
                    </p>
                </div>
            </div>

            <Card className="p-12 bg-white rounded-[48px] border-none shadow-2xl shadow-slate-200">
                <div className="space-y-10">
                    {performanceData.map((item, id) => (
                        <motion.div
                            key={id}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: id * 0.1, duration: 0.5 }}
                            className="group"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-6 mb-3">
                                <div className={`w-12 h-12 rounded-2xl ${item.color.replace('bg-', 'bg-opacity-10 text-').replace('600', '600').replace('500', '500')} flex items-center justify-center`}>
                                    <item.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <div className="flex items-center gap-3">
                                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight italic">{item.name}</h4>
                                            <div className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-500 tracking-widest uppercase">
                                                {item.status}
                                            </div>
                                        </div>
                                        <span className="text-xl font-black text-slate-900 italic tracking-tighter">{item.value}%</span>
                                    </div>
                                    <div className="h-4 w-full bg-slate-50 rounded-full overflow-hidden relative group-hover:bg-slate-100 transition-colors">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${item.value}%` }}
                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                            className={`h-full ${item.color} rounded-full transition-all group-hover:brightness-110 shadow-lg`}
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 mt-2 italic uppercase">
                                        Analysis: {item.details}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-16 pt-10 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Strengths</span>
                        </div>
                        <p className="text-xs font-black text-slate-700 italic uppercase">Native Talent Mobility</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <Zap className="w-4 h-4 text-orange-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Future Potential</span>
                        </div>
                        <p className="text-xs font-black text-slate-700 italic uppercase">Next-Gen Org Modeling</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                        <div className="flex items-center gap-3 mb-2">
                            <ShieldCheck className="w-4 h-4 text-blue-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Stability</span>
                        </div>
                        <p className="text-xs font-black text-slate-700 italic uppercase">High Availability (99.9%)</p>
                    </div>
                </div>
            </Card>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-8 bg-teal-50 rounded-[40px] border border-teal-100 flex items-start gap-6"
            >
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <Info className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Functional Note</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        "The platform exhibits exceptional system efficiency (94%) but modernization of recruitment workflows remains a primary focus for the next major release cycle."
                    </p>
                </div>
            </motion.div>
        </div>
    );
}

function TargetIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <circle cx="12" cy="12" r="6" />
            <circle cx="12" cy="12" r="2" />
        </svg>
    )
}
