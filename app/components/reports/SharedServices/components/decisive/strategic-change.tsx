import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, Users, Target, MousePointer2, Briefcase, GraduationCap, Brain, ShieldAlert, Sparkles, TrendingUp } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

const adoptionData = [
    { period: "Month 1", velocity: 12 },
    { period: "Month 2", velocity: 28 },
    { period: "Month 3", velocity: 45 },
    { period: "Month 4", velocity: 76 },
    { period: "Month 5", velocity: 92 },
];

export function StrategicChange({ data }: { data: any }) {
    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        Human Dynamics
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Strategic <span className="text-blue-600">Change</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Impact analysis & Adoption velocity trajectory</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Adoption Velocity Area Chart */}
                <Card className="lg:col-span-12 p-12 bg-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40 opacity-50 transition-opacity group-hover:opacity-100" />

                    <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
                        <div className="lg:col-span-2 space-y-10">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase italic">Adoption Velocity Benchmark</h3>
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time Adoption</span>
                                </div>
                            </div>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={adoptionData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorVelocity" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} tickFormatter={(val) => `${val}%`} />
                                        <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }} />
                                        <Area type="monotone" dataKey="velocity" stroke="#2563eb" strokeWidth={4} fillOpacity={1} fill="url(#colorVelocity)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-10">
                            <div className="text-center p-10 bg-slate-50 rounded-[48px] border border-slate-100">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Adoption Ceiling</h4>
                                <span className="text-6xl font-black text-slate-900 italic tracking-tighter">92%</span>
                                <div className="mt-6 flex flex-col items-center gap-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                                        <TrendingUp className="w-3 h-3" />
                                        High Velocity
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-slate-400 font-bold">Risk of Resistance</span>
                                    <span className="text-orange-500 italic">22% (Low)</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: '22%' }}
                                        className="h-full bg-orange-500 shadow-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { title: 'Training Depth', val: '84%', icon: GraduationCap, color: 'text-blue-500' },
                    { title: 'Leader Advocacy', val: '96%', icon: Target, color: 'text-emerald-500' },
                    { title: 'Agentic Grip', val: '62%', icon: Brain, color: 'text-indigo-500' }
                ].map((stat, id) => (
                    <Card key={id} className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-xl group hover:border-blue-200 transition-all">
                        <div className="flex items-center gap-6 mb-6">
                            <div className={`p-4 rounded-[24px] bg-slate-50 ${stat.color} group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <h4 className="text-sm font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-1">{stat.title}</h4>
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Global Status Index</span>
                            </div>
                        </div>
                        <div className="flex items-end justify-between">
                            <span className="text-3xl font-black text-slate-900 italic tracking-tighter">{stat.val}</span>
                            <div className="h-12 w-24">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[
                                        { v: 10 }, { v: 40 }, { v: 30 }, { v: stat.val === '84%' ? 84 : stat.val === '96%' ? 96 : 62 }
                                    ]}>
                                        <Area type="monotone" dataKey="v" stroke={stat.color.includes('blue') ? '#2563eb' : stat.color.includes('emerald') ? '#10b981' : '#6366f1'} fillOpacity={0} strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
