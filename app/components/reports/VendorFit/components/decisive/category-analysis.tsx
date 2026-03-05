import React, { useState } from 'react';
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from "recharts";
import {
    TrendingDown, Shield, Zap, Info, Trophy, CheckCircle2,
    Plug, Wrench, Cloud, Cpu, Activity, DollarSign, Sparkles, Target,
    XCircle,
    Settings,
    ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Inline InsightBlock Component
const InsightBlock = ({ variant = "default", children }: { variant?: "default" | "warning" | "success", children: React.ReactNode }) => {
    const styles = {
        default: "bg-blue-50/50 backdrop-blur-sm border-blue-200/50 text-blue-900 shadow-sm",
        warning: "bg-amber-50/50 backdrop-blur-sm border-amber-200/50 text-amber-900 shadow-sm",
        success: "bg-emerald-50/50 backdrop-blur-sm border-emerald-200/50 text-emerald-900 shadow-sm"
    };

    const iconColors = {
        default: "text-blue-600",
        warning: "text-amber-600",
        success: "text-emerald-600"
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className={`p-5 rounded-2xl border-l-[6px] ${styles[variant]} flex gap-4 text-sm leading-relaxed`}
        >
            <div className={`p-2 rounded-xl bg-white/50 shadow-inner shrink-0 ${iconColors[variant]}`}>
                <Info className="w-5 h-5" />
            </div>
            <div>
                <span className="font-black uppercase tracking-widest text-[10px] block mb-1 opacity-60">Engine Insight</span>
                {children}
            </div>
        </motion.div>
    );
};

interface CategoryAnalysisProps {
    id: string;
    title: string;
    vendors: string[]; // [Vendor A, Vendor B, Vendor C]
    data: any;
}

export function CategoryAnalysis({ id, title, vendors, data }: CategoryAnalysisProps) {
    // State for Trade-off Section Toggle
    const [tradeoffScenario, setTradeoffScenario] = useState<"cost" | "innovation">("innovation");

    // --- MOCK DATA ---
    const featureData = [
        { name: "Native Capabilities", [vendors[0]]: 88, [vendors[1]]: 72, [vendors[2]]: 65 },
        { name: "Configurable", [vendors[0]]: 10, [vendors[1]]: 18, [vendors[2]]: 25 },
        { name: "Custom Code", [vendors[0]]: 2, [vendors[1]]: 10, [vendors[2]]: 15 },
    ];

    const tcoData = [
        { year: "Year 0", [vendors[0]]: 140, [vendors[1]]: 110, [vendors[2]]: 160 },
        { year: "Year 1", [vendors[0]]: 240, [vendors[1]]: 210, [vendors[2]]: 280 },
        { year: "Year 2", [vendors[0]]: 340, [vendors[1]]: 310, [vendors[2]]: 420 },
        { year: "Year 3", [vendors[0]]: 440, [vendors[1]]: 410, [vendors[2]]: 560 },
    ];

    const costStructures = [
        { vendor: vendors[0], data: [{ name: "License", value: 50 }, { name: "Imp.", value: 30 }, { name: "Support", value: 20 }] },
        { vendor: vendors[1], data: [{ name: "License", value: 40 }, { name: "Imp.", value: 45 }, { name: "Support", value: 15 }] },
        { vendor: vendors[2], data: [{ name: "License", value: 60 }, { name: "Imp.", value: 25 }, { name: "Support", value: 15 }] },
    ];

    const PIE_COLORS = ["#3b82f6", "#10b981", "#f59e0b"]; // Blue, Emerald, Amber
    const pieLegend = [
        { name: "License", color: "#3b82f6" },
        { name: "Implementation", color: "#10b981" },
        { name: "Support", color: "#f59e0b" }
    ];

    const fitScores = [
        { vendor: vendors[0], score: 92, verdict: "Recommended" },
        { vendor: vendors[1], score: 84, verdict: "Contender" },
        { vendor: vendors[2], score: 76, verdict: "Lagging" },
    ];

    // Data for Technical Fit
    const integrations = [
        { name: "Slack / Teams", v1: "Native", v2: "API", v3: "API" },
        { name: "Salesforce CRM", v1: "Native", v2: "Native", v3: "API" },
        { name: "ERP (SAP/Oracle)", v1: "Native", v2: "Native", v3: "Native" },
        { name: "Identity (Okta)", v1: "Native", v2: "API", v3: "None" },
    ];

    const techMetrics = [
        { metric: "Cloud Security", v1: 98, v2: 92, v3: 88, icon: Cloud },
        { metric: "API Maturity", v1: 95, v2: 85, v3: 78, icon: Cpu },
        { metric: "Uptime SLA", v1: 99.9, v2: 99.5, v3: 99.0, icon: Activity },
    ];

    return (
        <div className="space-y-24 py-16">
            {/* SECTION HEADER */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="flex items-center gap-6 mb-12"
            >
                <div className="h-16 w-3 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/20"></div>
                <div>
                    <h2 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">{title}</h2>
                    <div className="mt-3 flex items-center gap-2">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold uppercase tracking-widest text-[10px] px-3">Category ID: {id}</Badge>
                        <span className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-1.5 ml-2">
                            <ArrowRight className="w-3 h-3" />
                            Multi-Vendor Comparison Matrix
                        </span>
                    </div>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {/* 1. FEATURE COVERAGE */}
                <motion.div
                    id={`${id}-features`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                                <Zap className="w-6 h-6" />
                            </div>
                            Feature Synergy
                        </h3>
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest">Live Metrics</Badge>
                    </div>

                    <Card className="p-8 bg-white border-slate-200 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Target className="w-40 h-40" />
                        </div>
                        <div className="relative z-10">
                            <ResponsiveContainer width="100%" height={320}>
                                <BarChart data={featureData} layout="vertical" barSize={32} margin={{ left: 20, right: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis type="number" domain={[0, 100]} hide />
                                    <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11, fontWeight: 800, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" />
                                    <Bar dataKey={vendors[0]} fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} name={vendors[0]} />
                                    <Bar dataKey={vendors[1]} fill="#64748b" stackId="b" radius={[0, 0, 0, 0]} name={vendors[1]} />
                                    <Bar dataKey={vendors[2]} fill="#f59e0b" stackId="c" radius={[0, 8, 8, 0]} name={vendors[2]} />
                                </BarChart>
                            </ResponsiveContainer>
                            <div className="mt-8">
                                <InsightBlock>
                                    <strong>Synergy Data:</strong> {vendors[0]} exhibits the highest native alignment (88%), significantly reducing "integration friction" compared to {vendors[2]}.
                                </InsightBlock>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* 2. FINANCIAL ANALYSIS */}
                <motion.div
                    id={`${id}-tco`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                >
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                                <DollarSign className="w-6 h-6" />
                            </div>
                            Economic Projection
                        </h3>
                        <Badge className="bg-blue-500/10 text-blue-600 border-none font-black text-[10px] uppercase tracking-widest">3-Year ROI</Badge>
                    </div>

                    <Card className="p-8 bg-white border-slate-200 shadow-sm overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <TrendingDown className="w-40 h-40" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Cumulative TCO Spend ($k)</h4>
                            <ResponsiveContainer width="100%" height={320}>
                                <LineChart data={tcoData} margin={{ left: -10, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `$${val}k`} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }} />
                                    <RechartsTooltip formatter={(val) => `$${val}k`} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                    <Legend iconType="circle" />
                                    <Line type="monotone" dataKey={vendors[0]} stroke="#3b82f6" strokeWidth={4} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey={vendors[1]} stroke="#64748b" strokeWidth={4} dot={{ r: 6, fill: '#64748b', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey={vendors[2]} stroke="#f59e0b" strokeWidth={4} strokeDasharray="8 8" dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* 3. TECHNICAL & RISK MATRIX */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* RISK */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="space-y-6"
                >
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                            <Shield className="w-5 h-5" />
                        </div>
                        Risk Mapping
                    </h3>
                    <Card className="p-6 bg-white border-slate-200 shadow-sm aspect-square flex flex-col">
                        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2 p-2 bg-slate-50 rounded-3xl relative">
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center p-4">
                                <Badge className="bg-emerald-500 text-white border-none shadow-lg shadow-emerald-500/20 text-[10px]">{vendors[0]}</Badge>
                            </div>
                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center p-4">
                                <Badge className="bg-amber-500 text-white border-none shadow-lg shadow-amber-500/20 text-[10px]">{vendors[1]}</Badge>
                            </div>
                            <div className="bg-slate-200/10 border border-slate-300/20 rounded-2xl"></div>
                            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center justify-center p-4">
                                <Badge className="bg-rose-500 text-white border-none shadow-lg shadow-rose-500/20 text-[10px]">{vendors[2]}</Badge>
                            </div>

                            {/* Axis Labels */}
                            <div className="absolute -left-10 top-1/2 -rotate-90 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Probability</div>
                            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Impact Impact</div>
                        </div>
                    </Card>
                </motion.div>

                {/* COMPLIANCE */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-900 border border-slate-200">
                            <Settings className="w-5 h-5" />
                        </div>
                        Verification Ledger
                    </h3>
                    <Card className="overflow-hidden bg-white border-slate-200 shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-100 text-slate-900">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Protocol</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">{vendors[0]}</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">{vendors[1]}</th>
                                    <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center">{vendors[2]}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {[
                                    { label: "GDPR Ready", v1: true, v2: true, v3: false },
                                    { label: "SOC2 Type II", v1: true, v2: false, v3: true },
                                    { label: "ISO 27001", v1: true, v2: true, v3: true },
                                    { label: "Local Data Center", v1: true, v2: false, v3: false },
                                ].map((row, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-bold text-slate-700">{row.label}</td>
                                        <td className="px-4 py-4"><div className="flex justify-center">{row.v1 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-300" />}</div></td>
                                        <td className="px-4 py-4"><div className="flex justify-center">{row.v2 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-300" />}</div></td>
                                        <td className="px-4 py-4"><div className="flex justify-center">{row.v3 ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-300" />}</div></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </Card>
                </motion.div>
            </div>

            {/* STRATEGIC TRADE-OFF */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="space-y-8"
            >
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200/60">
                    <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase mb-2">The Decision Axis</h3>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Select a strategic lens to simulate multi-year outcomes</p>
                    </div>
                    <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200 mt-2">
                        <button
                            onClick={() => setTradeoffScenario("cost")}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${tradeoffScenario === "cost" ? "bg-white text-slate-900 shadow-xl" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Cost Lens
                        </button>
                        <button
                            onClick={() => setTradeoffScenario("innovation")}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${tradeoffScenario === "innovation" ? "bg-indigo-600 text-white shadow-xl shadow-indigo-500/30" : "text-slate-500 hover:text-slate-700"}`}
                        >
                            Innovation Lens
                        </button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={tradeoffScenario}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        transition={{ duration: 0.3 }}
                        className={`p-10 rounded-[32px] border-2 overflow-hidden relative ${tradeoffScenario === 'cost' ? 'bg-amber-50/30 border-amber-200/50' : 'bg-indigo-50/30 border-indigo-200/50'}`}
                    >
                        {/* Decorative Background Icon */}
                        <div className="absolute -right-10 -bottom-10 opacity-[0.03] rotate-12">
                            {tradeoffScenario === 'cost' ? <DollarSign className="w-80 h-80" /> : <Sparkles className="w-80 h-80" />}
                        </div>

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <Badge className={`uppercase font-black tracking-widest px-4 py-1.5 rounded-full border-none ${tradeoffScenario === 'cost' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                    {tradeoffScenario === 'cost' ? 'Efficiency Winner' : 'Maturity Leader'}
                                </Badge>
                                <h4 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.9]">
                                    {tradeoffScenario === 'cost' ? vendors[1] : vendors[0]}
                                </h4>
                                <p className="text-lg text-slate-600 leading-relaxed max-w-lg font-medium">
                                    {tradeoffScenario === 'cost'
                                        ? `Offers the most aggressive license model (-15%) but requires a 14% higher operational contingency for manual bridge-fixes.`
                                        : `Architected for the "Intelligent Enterprise" with 98% native compliance parity, eliminating legacy technical debt.`
                                    }
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-xl shadow-black/5">
                                    <span className="text-4xl font-black text-slate-900 block mb-1">{tradeoffScenario === 'cost' ? '-15%' : '98%'}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{tradeoffScenario === 'cost' ? 'License Delta' : 'Synergy Match'}</span>
                                </div>
                                <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white shadow-xl shadow-black/5">
                                    <span className="text-4xl font-black text-slate-900 block mb-1">{tradeoffScenario === 'cost' ? '14 mo' : '9.2'}</span>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">{tradeoffScenario === 'cost' ? 'Payback Period' : 'Agility Index'}</span>
                                </div>
                                <div className="col-span-2">
                                    <InsightBlock variant={tradeoffScenario === 'cost' ? 'warning' : 'success'}>
                                        <strong>Strategic Vector:</strong> {tradeoffScenario === 'cost'
                                            ? `Value extraction depends on rapid implementation. Any delay >3 weeks will erode the price delta vs ${vendors[0]}.`
                                            : `Long-term TCO favors ${vendors[0]} due to a 3x faster upgrade cycle and integrated AI capabilities.`
                                        }
                                    </InsightBlock>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* CATEGORY VERDICT SUMMARY */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="pt-24 border-t border-slate-200/60"
            >
                <div className="text-center mb-16">
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">The Selection Verdict</h3>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest max-w-xl mx-auto">AI-weighted final fit scores for the {title} category based on 84 weighted parameters.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {fitScores.map((item, index) => (
                        <Card
                            key={index}
                            className={`group p-8 relative overflow-hidden transition-all duration-500 rounded-[32px] border-2 ${index === 0
                                ? 'bg-blue-50 border-blue-200 text-slate-900 shadow-2xl shadow-blue-500/10'
                                : 'bg-white border-slate-100 text-slate-900 shadow-xl'
                                }`}
                        >
                            {index === 0 && (
                                <div className="absolute top-0 right-0 p-4">
                                    <Trophy className="w-10 h-10 text-blue-500 opacity-40 group-hover:scale-125 transition-transform" />
                                </div>
                            )}

                            <div className="flex flex-col items-center text-center">
                                <div className={`w-24 h-24 rounded-[30px] flex items-center justify-center font-black text-3xl shadow-inner mb-6 rotate-3 group-hover:rotate-0 transition-transform ${index === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'
                                    }`}>
                                    {item.score}
                                </div>
                                <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">{item.vendor}</h4>
                                <Badge className={`font-black uppercase tracking-widest text-[9px] mb-6 border-none ${index === 0 ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {item.verdict}
                                </Badge>

                                {index === 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white border border-blue-100 p-4 rounded-2xl text-[11px] font-bold text-slate-700 leading-relaxed shadow-sm"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mb-2 text-emerald-500 mx-auto" />
                                        Dominant performance in scalability and security protocols.
                                    </motion.div>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            </motion.div>

        </div>
    );
}
