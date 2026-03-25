import { IndexScore } from '../types/assessment';
import {
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { TrendingUp, Shield, Users, Cpu, Target } from 'lucide-react';

interface IndicesVisualizationProps {
    indices: IndexScore[];
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

const getIndexIcon = (name: string) => {
    if (name.includes('Strategic')) return <Target className="w-5 h-5" />;
    if (name.includes('Leadership')) return <Shield className="w-5 h-5" />;
    if (name.includes('Organizational')) return <Users className="w-5 h-5" />;
    if (name.includes('Digital')) return <Cpu className="w-5 h-5" />;
    if (name.includes('Adoption')) return <TrendingUp className="w-5 h-5" />;
    return <Target className="w-5 h-5" />;
};

function IndexCard({ index, icon, color }: { index: IndexScore; icon: React.ReactNode; color: string }) {
    const percentage = (index.score / index.maxScore) * 100;
    const statusBg = { green: 'bg-green-50 border-green-200', amber: 'bg-amber-50 border-amber-200', red: 'bg-red-50 border-red-200' };
    return (
        <div className={`${statusBg[index.status]} border-2 rounded-xl hover:shadow-lg transition-shadow`}>
            <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                    <div style={{ color }}>{icon}</div>
                    <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color }}>{index.score.toFixed(1)}</div>
                        <div className="text-xs text-slate-500">/ {index.maxScore}</div>
                    </div>
                </div>
                <h4 className="font-semibold text-slate-900 mb-2 text-sm">{index.name}</h4>
                <p className="text-xs text-slate-600 mb-3">{index.description}</p>
                <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                    <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: color }} />
                </div>
                <div className="text-xs text-slate-500 text-right">{percentage.toFixed(0)}%</div>
            </div>
        </div>
    );
}

export function IndicesVisualization({ indices }: IndicesVisualizationProps) {
    const radarData = indices.map(index => ({
        subject: index.name.split(' ')[0],
        value: index.percentage,
        fullMark: 100,
    }));

    const barData = indices.map(index => ({
        name: index.name,
        score: index.score,
        maxScore: index.maxScore,
        percentage: index.percentage,
    }));

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">5 Core Intelligence Indices</h2>
                <p className="text-slate-600">Comprehensive analysis across all transformation dimensions</p>
            </div>

            {/* Radar Chart */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-slate-900">Transformation Readiness Radar</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="#e2e8f0" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Radar name="Readiness Score" dataKey="value" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} strokeWidth={2} />
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bar Chart Comparison */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4 text-slate-900">Index Score Comparison</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={barData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis type="number" domain={[0, 20]} tick={{ fill: '#64748b' }} />
                            <YAxis dataKey="name" type="category" width={200} tick={{ fill: '#475569', fontSize: 11 }} />
                            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} formatter={(value: number) => [`${value.toFixed(1)}/20`, 'Score']} />
                            <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                                {barData.map((_, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Individual Index Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {indices.map((index, i) => (
                    <IndexCard key={index.name} index={index} icon={getIndexIcon(index.name)} color={COLORS[i % COLORS.length]} />
                ))}
            </div>
        </div>
    );
}
