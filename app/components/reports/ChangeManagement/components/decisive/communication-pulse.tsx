import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, BarChart2, TrendingUp, Users, Activity } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function CommunicationPulse({ data }: { data: any }) {
    const commsData = [
        { name: "Global Townhall", engagement: 82, reach: 95 },
        { name: "Digital Pack", engagement: 64, reach: 88 },
        { name: "Manager Toolkit", engagement: 45, reach: 72 },
        { name: "Social Feed", engagement: 91, reach: 84 },
        { name: "Email Series", engagement: 38, reach: 98 },
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <MessageSquare className="w-3 h-3 text-indigo-400" />
                        Engagement Pulse
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Communication <span className="text-indigo-600">Dynamics</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Message reach vs. sentiment engagement velocity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Bar Chart */}
                <Card className="lg:col-span-12 p-12 bg-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40 opacity-50 transition-opacity" />

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 relative z-10">
                        <h3 className="text-sm font-black text-slate-900 tracking-[0.2em] uppercase italic">Outreach vs Engagement Matrix</h3>
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-600" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement Rate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-100" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Reach</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[400px] w-full relative z-10">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={commsData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
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
                                <Bar dataKey="reach" fill="#e0e7ff" radius={[10, 10, 0, 0]} barSize={40} />
                                <Bar dataKey="engagement" fill="#4f46e5" radius={[10, 10, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Info Cards */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="p-8 bg-slate-900 text-white rounded-[40px] border-none shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6">
                            <Send className="w-5 h-5 text-indigo-400" />
                            <span className="text-xs font-black uppercase tracking-widest">Message Flow</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-4xl font-black italic">Accelerated</span>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-2">Current delivery velocity</p>
                        </div>
                    </Card>
                    <Card className="p-8 bg-white rounded-[40px] border border-slate-100 shadow-xl group hover:border-indigo-200 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <Activity className="w-5 h-5 text-indigo-600" />
                            <span className="text-xs font-black uppercase tracking-widest text-slate-400">Saturation</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-4xl font-black italic text-slate-900">Optimal</span>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-2">Noise-to-signal ratio</p>
                        </div>
                    </Card>
                    <Card className="p-8 bg-indigo-600 text-white rounded-[40px] border-none shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-6">
                            <Users className="w-5 h-5 text-white" />
                            <span className="text-xs font-black uppercase tracking-widest">Advocacy</span>
                        </div>
                        <div className="space-y-2">
                            <span className="text-4xl font-black italic">+24%</span>
                            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest leading-none mt-2">Growth in leader advocacy</p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
