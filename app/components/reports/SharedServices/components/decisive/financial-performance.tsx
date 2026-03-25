import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingDown, TrendingUp, BarChart3, Clock, ArrowUpRight, DollarSign, Calculator } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const financialData = [
    { year: "Year 1", opex: 1200, capex: 800, savings: 0 },
    { year: "Year 2", opex: 1000, capex: 300, savings: 400 },
    { year: "Year 3", opex: 850, capex: 100, savings: 850 },
    { year: "Year 4", opex: 810, capex: 50, savings: 1200 },
    { year: "Year 5", opex: 800, capex: 20, savings: 1600 },
];

export function FinancialPerformance({ data }: { data: any }) {
    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Wallet className="w-3 h-3 text-emerald-400" />
                        Value Realization
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Financial <span className="text-blue-600">Dynamics</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">ROI projection & TCO optimization trajectory</p>
                </div>
                <div className="flex gap-4">
                    <Card className="px-6 py-4 bg-white rounded-2xl shadow-lg border-none flex items-center gap-4">
                        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                            <TrendingDown className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Efficiency Gain</span>
                            <span className="text-xl font-black text-slate-900 italic tracking-tighter">+21.4%</span>
                        </div>
                    </Card>
                    <Card className="px-6 py-4 bg-white rounded-2xl shadow-lg border-none flex items-center gap-4">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block leading-none">Net Savings</span>
                            <span className="text-xl font-black text-slate-900 italic tracking-tighter">$4.8M</span>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Savings & Cost Trajectory */}
                <Card className="lg:col-span-8 p-12 bg-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40 opacity-50" />

                    <div className="relative z-10 space-y-10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase italic">5-Year Value Trajectory</h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cumulative Savings</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-slate-300" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OPEX Outlay</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[360px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={financialData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="year"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(val) => `$${val}K`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="savings"
                                        stroke="#2563eb"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorSavings)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="opex"
                                        stroke="#cbd5e1"
                                        strokeWidth={2}
                                        fill="transparent"
                                        strokeDasharray="5 5"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Commercial Terms / ROI Break-even */}
                <div className="lg:col-span-4 space-y-8">
                    <Card className="p-10 bg-slate-950 text-white rounded-[56px] border-none shadow-2xl relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -ml-32 -mb-32" />
                        <div className="space-y-12 relative z-10">
                            <div className="flex items-center gap-3">
                                <BarChart3 className="w-5 h-5 text-blue-400" />
                                <span className="text-xs font-black uppercase tracking-[0.2em]">ROI Calculus</span>
                            </div>

                            <div className="space-y-10 text-center">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-2">Break-Even Point</span>
                                    <span className="text-5xl font-black italic tracking-tighter italic">14.2 <span className="text-xl">Months</span></span>
                                </div>
                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '70%' }}
                                        className="h-full bg-blue-500 shadow-lg"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase italic">Based on accelerated adoption velocity in Wave 2.</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-xl flex items-center gap-6">
                        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-[24px]">
                            <Calculator className="w-8 h-8" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Investment Velocity</p>
                            <p className="text-xl font-black text-slate-900 italic tracking-tighter uppercase">High Speed</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
