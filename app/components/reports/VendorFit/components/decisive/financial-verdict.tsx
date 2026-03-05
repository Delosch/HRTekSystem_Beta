import React from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";
import { Info, DollarSign, TrendingDown, Percent, Wallet, BarChart3, Clock, ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "~/components/ui/card";

const tcoTrajectory = [
    { year: "Year 1", tco: 1200000, build: 400000, run: 800000 },
    { year: "Year 2", tco: 950000, build: 150000, run: 800000 },
    { year: "Year 3", tco: 850000, build: 50000, run: 800000 },
    { year: "Year 4", tco: 820000, build: 20000, run: 800000 },
    { year: "Year 5", tco: 810000, build: 10000, run: 800000 },
];

export function FinancialVerdict({ data }: { data: any }) {
    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Wallet className="w-3 h-3 text-orange-400" />
                        Investment Architecture
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Financial <span className="text-blue-600">Dynamics</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                        Total Cost of Ownership (TCO) & Value Realization Blueprint
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* TCO Trajectory Chart */}
                <Card className="lg:col-span-8 p-10 bg-white rounded-[48px] border-none shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl -mr-32 -mt-32 opacity-50" />

                    <div className="relative z-10 space-y-8">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase italic">5-Year TCO Trajectory</h3>
                            <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-600" /> Build Cost</div>
                                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400" /> Operational</div>
                            </div>
                        </div>

                        <div className="h-[340px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={tcoTrajectory} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTco" x1="0" y1="0" x2="0" y2="1">
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
                                        tickFormatter={(val) => `$${(val / 1000000).toFixed(1)}M`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="tco"
                                        stroke="#2563eb"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorTco)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Sub-Decision Framework */}
                <Card className="lg:col-span-4 p-10 bg-slate-900 text-white rounded-[48px] border-none shadow-2xl flex flex-col justify-between overflow-hidden relative">
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -ml-32 -mb-32" />

                    <div className="space-y-12">
                        <div className="flex items-center gap-3">
                            <BarChart3 className="w-5 h-5 text-blue-400" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">ROI Dynamics</span>
                        </div>

                        <div className="space-y-10">
                            {[
                                { label: 'Capital Outlay', value: '$1.4M', progress: 100, color: 'bg-blue-600', sub: 'Year 1 Impact' },
                                { label: 'Recurring OPEX', value: '$812K', progress: 65, color: 'bg-emerald-500', sub: 'Post-Year 3' },
                                { label: 'Break-Even', value: '18 Mo.', progress: 45, color: 'bg-orange-500', sub: 'Target Velocity' }
                            ].map((stat, id) => (
                                <div key={id} className="space-y-3">
                                    <div className="flex justify-between items-end">
                                        <div className="space-y-1">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase">{stat.sub}</p>
                                        </div>
                                        <span className="text-2xl font-black italic text-white">{stat.value}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${stat.progress}%` }}
                                            className={`h-full ${stat.color} shadow-lg shadow-blue-500/10`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-500" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">5-Year Projected Horizon</span>
                        </div>
                        <ArrowUpRight className="w-4 h-4 text-blue-500" />
                    </div>
                </Card>
            </div>

            {/* Financial Summary Note */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-8 bg-orange-50 rounded-[40px] border border-orange-100 flex items-start gap-6"
            >
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <TrendingDown className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Commercial Dynamics Note</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        "The proposed model reflects a 22% TCO reduction over a 36-month cycle, primarily driven by legacy maintenance elimination and unified licensing agreements."
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
