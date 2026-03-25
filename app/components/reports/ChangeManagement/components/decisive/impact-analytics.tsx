import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Target, TrendingUp, Activity, BarChart3, Globe } from 'lucide-react';
import { Card } from '~/components/ui/card';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';

export function ImpactAnalytics({ data }: { data: any }) {
    const c = data?.computed;
    const radarData = [
        { subject: 'Culture',    A: c?.culture    ?? 85, fullMark: 100 },
        { subject: 'Process',    A: c?.process    ?? 65, fullMark: 100 },
        { subject: 'Technology', A: c?.technology ?? 92, fullMark: 100 },
        { subject: 'Structure',  A: c?.structure  ?? 48, fullMark: 100 },
        { subject: 'People',     A: c?.people     ?? 78, fullMark: 100 },
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Layers className="w-3 h-3 text-indigo-400" />
                        Impact Mapping
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Organizational <span className="text-indigo-600">Impact</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Cross-functional transformation radius & domain intensity</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Radar Chart */}
                <Card className="lg:col-span-12 p-12 bg-white rounded-[56px] border-none shadow-2xl relative overflow-hidden flex flex-col items-center">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-50 rounded-full blur-3xl -mr-40 -mt-40 opacity-50" />

                    <div className="w-full text-center mb-10">
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                            Impact <span className="text-indigo-600">Distribution</span>
                        </h3>
                    </div>

                    <div className="w-full h-[500px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                <PolarGrid stroke="#e2e8f0" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 900 }}
                                />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar
                                    name="Impact Depth"
                                    dataKey="A"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    fill="#4f46e5"
                                    fillOpacity={0.15}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)' }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-8 w-full mt-10 border-t border-slate-100 pt-10">
                        {radarData.map((item, idx) => (
                            <div key={idx} className="text-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{item.subject}</span>
                                <span className="text-2xl font-black text-indigo-600 italic tracking-tighter">{item.A}%</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
