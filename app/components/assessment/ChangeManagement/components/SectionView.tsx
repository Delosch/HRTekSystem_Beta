import { Section, Response, SectionScore } from '../types/assessment';
import { QuestionCard } from './QuestionCard';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    PieChart, Pie, Legend
} from 'recharts';
import { AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface SectionViewProps {
    section: Section;
    responses: Response;
    onResponse: (questionId: string, value: number) => void;
    sectionScore: SectionScore;
    sectionIndex: number;
}

function StatusBadge({ status }: { status: 'green' | 'amber' | 'red' }) {
    const config = {
        green: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2, label: 'Strong' },
        amber: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle, label: 'Monitor' },
        red: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle, label: 'Risk' },
    };
    const { bg, text, icon: Icon, label } = config[status];
    return (
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
            <Icon className="w-3 h-3" />
            {label}
        </span>
    );
}

function ScoreDisplay({ score }: { score: SectionScore }) {
    return (
        <div className="text-right">
            <div className="text-3xl font-bold text-slate-900">{score.percentage.toFixed(0)}%</div>
            <div className="text-sm text-slate-500">{score.score.toFixed(1)} / {score.maxScore.toFixed(1)}</div>
        </div>
    );
}

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize="12" fontWeight="bold">
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

export function SectionView({ section, responses, onResponse, sectionScore, sectionIndex }: SectionViewProps) {
    const questionScores = section.questions.map((q, i) => ({
        name: `Q${i + 1}`,
        score: responses[q.id] !== undefined ? responses[q.id] : 0,
        maxScore: 4,
        answered: responses[q.id] !== undefined,
    }));

    const answeredCount = questionScores.filter(q => q.answered).length;
    const totalCount = section.questions.length;
    const completionRate = (answeredCount / totalCount) * 100;

    const scoreDistribution = [
        { name: 'Critical Risk (0)', value: questionScores.filter(q => q.score === 0 && q.answered).length, fill: '#dc2626' },
        { name: 'Weak (1)', value: questionScores.filter(q => q.score === 1).length, fill: '#f97316' },
        { name: 'Developing (2)', value: questionScores.filter(q => q.score === 2).length, fill: '#eab308' },
        { name: 'Mature (3)', value: questionScores.filter(q => q.score === 3).length, fill: '#3b82f6' },
        { name: 'Best Practice (4)', value: questionScores.filter(q => q.score === 4).length, fill: '#22c55e' },
    ].filter(item => item.value > 0);

    return (
        <div className="space-y-6">
            {/* Section Header */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl">
                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-semibold text-slate-500">SECTION {sectionIndex + 1}</span>
                                    {answeredCount > 0 && <StatusBadge status={sectionScore.status as 'green' | 'amber' | 'red'} />}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 mb-2">{section.title}</h2>
                                <p className="text-slate-600">{section.description}</p>
                            </div>
                            {answeredCount > 0 && <ScoreDisplay score={sectionScore} />}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Completion Progress</span>
                                <span className="font-semibold text-slate-900">{answeredCount} / {totalCount} questions</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3">
                                <div className="bg-blue-600 h-3 rounded-full transition-all duration-500" style={{ width: `${completionRate}%` }} />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Visualizations */}
            {answeredCount > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Question-Level Scores</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={questionScores}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                    <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <YAxis domain={[0, 4]} tick={{ fill: '#64748b', fontSize: 12 }} />
                                    <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                                        {questionScores.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={
                                                entry.score === 4 ? '#22c55e' :
                                                    entry.score === 3 ? '#3b82f6' :
                                                        entry.score === 2 ? '#eab308' :
                                                            entry.score === 1 ? '#f97316' : '#dc2626'
                                            } />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold mb-4 text-slate-900">Maturity Distribution</h3>
                            {scoreDistribution.length > 0 ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie data={scoreDistribution} cx="50%" cy="50%" labelLine={false} label={renderCustomLabel} outerRadius={80} dataKey="value">
                                            {scoreDistribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend verticalAlign="bottom" height={36} formatter={(value, entry: any) => `${value}: ${entry.payload.value}`} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[250px] flex items-center justify-center text-slate-400 text-sm">No data yet</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Key Insights */}
            {answeredCount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl">
                    <div className="p-6">
                        <div className="flex items-start gap-3">
                            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">Section Insights</h3>
                                <ul className="space-y-1 text-sm text-blue-800">
                                    <li>• Current Score: {sectionScore.score.toFixed(1)} out of {sectionScore.maxScore.toFixed(1)}</li>
                                    <li>• Performance Level: {sectionScore.percentage.toFixed(0)}%</li>
                                    <li>• Status: {sectionScore.status === 'green' ? 'Strong Performance' : sectionScore.status === 'amber' ? 'Needs Monitoring' : 'Requires Intervention'}</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Questions */}
            <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Assessment Questions</h3>
                {section.questions.map((question, index) => (
                    <motion.div key={question.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }}>
                        <QuestionCard
                            question={question}
                            response={responses[question.id]}
                            onResponse={(value) => onResponse(question.id, value)}
                            questionNumber={index + 1}
                        />
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
