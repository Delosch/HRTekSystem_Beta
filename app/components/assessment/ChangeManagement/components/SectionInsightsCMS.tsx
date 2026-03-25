import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';
import { TrendingUp, Activity, Target, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { Question, Response, SectionScore } from '../types/assessment';

interface SectionInsightsCMSProps {
    sectionNumber: number;
    responses: Response;
    questions: Question[];
    score: SectionScore;
    indexMapping: string;
}

const COLORS = ['#dc2626', '#f97316', '#eab308', '#3b82f6', '#22c55e'];

export const SectionInsightsCMS: React.FC<SectionInsightsCMSProps> = ({
    sectionNumber,
    responses,
    questions,
    score,
    indexMapping
}) => {
    // Calculate maturity distribution for these specific questions
    const questionScores = questions.map((q, i) => ({
        name: `Q${i + 1}`,
        score: responses[q.id] !== undefined ? responses[q.id] : 0,
        answered: responses[q.id] !== undefined
    }));

    const distribution = [
        { name: 'Critical', value: questionScores.filter(q => q.answered && q.score === 0).length, fill: COLORS[0] },
        { name: 'Weak', value: questionScores.filter(q => q.answered && q.score === 1).length, fill: COLORS[1] },
        { name: 'Dev', value: questionScores.filter(q => q.answered && q.score === 2).length, fill: COLORS[2] },
        { name: 'Mature', value: questionScores.filter(q => q.answered && q.score === 3).length, fill: COLORS[3] },
        { name: 'Excel', value: questionScores.filter(q => q.answered && q.score === 4).length, fill: COLORS[4] },
    ].filter(d => d.value > 0);

    const answeredCount = questionScores.filter(q => q.answered).length;
    if (answeredCount === 0) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
        >
            {/* Header */}
            <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Section {sectionNumber} Insights</h3>
                        <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{indexMapping} Dimension</p>
                    </div>
                </div>
                <div className="text-right">
                    <div className={`text-3xl font-black ${
                        score.percentage >= 70 ? 'text-green-600' : 
                        score.percentage >= 50 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                        {score.percentage.toFixed(0)}%
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Section Readiness</p>
                </div>
            </div>

            <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Distribution Chart */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <Target className="w-5 h-5 text-indigo-600" />
                            <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest">Maturity Spread</h4>
                        </div>
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={questionScores.filter(q => q.answered)}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <YAxis domain={[0, 4]} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="score" radius={[6, 6, 0, 0]} barSize={32}>
                                        {questionScores.filter(q => q.answered).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[entry.score]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Stats & Risk */}
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <Shield className="w-5 h-5 text-amber-500 mb-3" />
                                <div className="text-2xl font-black text-slate-900">
                                    {questionScores.filter(q => q.answered && q.score <= 1).length}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">High Risk Gaps</p>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <Zap className="w-5 h-5 text-green-500 mb-3" />
                                <div className="text-2xl font-black text-slate-900">
                                    {questionScores.filter(q => q.answered && q.score >= 3).length}
                                </div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Strength Points</p>
                            </div>
                        </div>

                        <div className="bg-indigo-50/50 rounded-2xl p-6 border border-indigo-100">
                            <div className="flex items-center gap-3 mb-4">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                <h4 className="font-black text-slate-800 uppercase text-xs tracking-widest text-indigo-900">Strategic Outlook</h4>
                            </div>
                            <p className="text-sm text-indigo-800 leading-relaxed font-medium">
                                {score.percentage >= 75 ? 
                                    `Your organization shows exceptional resilience in ${indexMapping}. Focus on institutionalizing these best practices across other departments.` :
                                 score.percentage >= 50 ?
                                    `There is a solid foundation in ${indexMapping}, but inconsistent execution across the ${questions.length} domains indicates potential for adoption slippage.` :
                                    `Critical vulnerabilities detected in ${indexMapping}. Immediate stabilization of governance and resource allocation is required before proceeding.`
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
