import React from 'react';
import { motion } from 'framer-motion';
import { Users, Target, TrendingUp, Brain, GraduationCap, Briefcase, MousePointer2 } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const workloadData = [
    { period: "Q1 2026", talent: 45, skills: 32 },
    { period: "Q2 2026", talent: 52, skills: 38 },
    { period: "Q3 2026", talent: 64, skills: 45 },
    { period: "Q4 2026", talent: 78, skills: 52 },
    { period: "Q1 2027", talent: 85, skills: 58 },
];

export function WorkforceTransformation({ data }: { data: any }) {
    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Users className="w-3 h-3 text-indigo-400" />
                        Human Capital Radius
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Workforce <span className="text-blue-600">Transformation</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Strategic talent availability & skills gap mapping</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Talent Trajectory Chart */}
                <Card className="lg:col-span-8 p-12 bg-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl -mr-40 -mt-40 opacity-50" />

                    <div className="space-y-10 relative z-10">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase italic">Talent Availability & Skills Index</h3>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-600" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Talent Supply</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-indigo-300" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Skills</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[340px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={workloadData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTalent" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorSkills" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="period"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                                        tickFormatter={(val) => `${val}%`}
                                    />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="talent"
                                        stroke="#2563eb"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorTalent)"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="skills"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorSkills)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                {/* Talent Breakdown Card */}
                <Card className="lg:col-span-4 p-10 bg-slate-900 text-white rounded-[56px] border-none shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />

                    <div className="space-y-12 relative z-10">
                        <div className="flex items-center gap-3">
                            <Brain className="w-5 h-5 text-blue-400" />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Workforce DNA</span>
                        </div>

                        <div className="space-y-10">
                            {[
                                { label: 'Digital Fluency', val: 78, icon: MousePointer2, color: 'bg-blue-600' },
                                { label: 'Process Expertise', val: 92, icon: Briefcase, color: 'bg-emerald-500' },
                                { label: 'AI Adoption', val: 34, icon: GraduationCap, color: 'bg-orange-500' }
                            ].map((stat, id) => (
                                <div key={id} className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-slate-800 rounded-xl">
                                                <stat.icon className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                                        </div>
                                        <span className="text-2xl font-black italic">{stat.val}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${stat.val}%` }}
                                            className={`h-full ${stat.color} shadow-lg`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-10 mt-10 border-t border-slate-800">
                        <div className="flex items-center gap-3 p-5 bg-slate-800/50 rounded-3xl border border-slate-700">
                            <TrendingUp className="w-5 h-5 text-blue-400" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Productivity Index</p>
                                <p className="text-xl font-black text-white italic">+14.2% YoY</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
