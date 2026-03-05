import React from 'react';
import { motion } from 'framer-motion';
import { Users, ShieldCheck, Trophy, Target, Star, Briefcase } from 'lucide-react';
import { Card } from '~/components/ui/card';

export function LeadershipAlignment({ data }: { data: any }) {
    const segments = [
        { label: 'Executive Board', score: 92, status: 'CHAMPION', color: 'bg-emerald-500' },
        { label: 'Senior Leadership', score: 78, status: 'ADVANCED', color: 'bg-indigo-600' },
        { label: 'Middle Management', score: 54, status: 'EMERGING', color: 'bg-amber-500' },
        { label: 'Frontline Supervisors', score: 42, status: 'NEUTRAL', color: 'bg-slate-400' },
    ];

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Trophy className="w-3 h-3 text-indigo-400" />
                        Coalition Strength
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Leadership <span className="text-indigo-600">Alignment</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">Advocacy levels & change sponsorship effectiveness</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Main Scoreboard */}
                <Card className="lg:col-span-12 p-12 bg-white rounded-[56px] border-none shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-slate-50 rounded-full blur-3xl -mr-40 -mt-40 opacity-50 transition-opacity" />

                    <div className="space-y-12 relative z-10">
                        {segments.map((item, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: id * 0.1 }}
                                className="group/item"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-8">
                                    <div className="w-16 h-16 rounded-[24px] bg-slate-50 flex items-center justify-center group-hover/item:bg-indigo-50 transition-colors">
                                        {[Briefcase, Star, Target, Users][id % 4] && React.createElement([Briefcase, Star, Target, Users][id % 4], { className: "w-8 h-8 text-slate-400 group-hover/item:text-indigo-600 transition-colors" })}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="flex justify-between items-end">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">{item.label}</h4>
                                                <span className="px-2 py-0.5 bg-slate-100 rounded text-[8px] font-black text-slate-500 tracking-widest uppercase">{item.status}</span>
                                            </div>
                                            <span className="text-3xl font-black text-slate-900 italic tracking-tighter">{item.score}%</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden relative group-hover/item:bg-slate-100 transition-colors">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${item.score}%` }}
                                                transition={{ duration: 1.2, ease: "easeOut" }}
                                                className={`h-full ${item.color} rounded-full shadow-lg`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </Card>

                {/* Insight Tags */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-10 bg-slate-950 text-white rounded-[40px] border-none shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <ShieldCheck className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs font-black uppercase tracking-widest">Coalition Health</span>
                        </div>
                        <p className="text-lg font-bold leading-relaxed italic text-slate-300 uppercase">
                            Strong executive consensus acts as a <span className="text-white font-black underline decoration-indigo-600 underline-offset-4">Strategic Moat</span> against initial resistance.
                        </p>
                    </Card>
                    <Card className="p-10 bg-indigo-600 text-white rounded-[40px] border-none shadow-2xl relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-6">
                            <Target className="w-5 h-5 text-white" />
                            <span className="text-xs font-black uppercase tracking-widest">Frontline Gap</span>
                        </div>
                        <p className="text-lg font-bold leading-relaxed italic text-indigo-100 uppercase">
                            Operational managers require <span className="text-white font-black underline decoration-slate-900 underline-offset-4">Tactical Reframing</span> to improve translation effectiveness.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
