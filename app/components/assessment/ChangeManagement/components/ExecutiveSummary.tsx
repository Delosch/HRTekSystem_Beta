import { CompositeScore, IndexScore } from '../types/assessment';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis } from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';

interface ExecutiveSummaryProps {
    compositeScore: CompositeScore;
    indices: IndexScore[];
}

export function ExecutiveSummary({ compositeScore, indices }: ExecutiveSummaryProps) {
    const getScoreIcon = (score: number) => {
        if (score >= 85) return <CheckCircle className="w-8 h-8 text-green-600" />;
        if (score >= 70) return <TrendingUp className="w-8 h-8 text-blue-600" />;
        if (score >= 50) return <AlertTriangle className="w-8 h-8 text-amber-600" />;
        return <XCircle className="w-8 h-8 text-red-600" />;
    };

    const getScoreColor = (score: number) => {
        if (score >= 85) return 'text-green-600';
        if (score >= 70) return 'text-blue-600';
        if (score >= 50) return 'text-amber-600';
        return 'text-red-600';
    };

    const overallData = [{
        name: 'Score',
        value: compositeScore.overall,
        fill: compositeScore.overall >= 85 ? '#16a34a' :
            compositeScore.overall >= 70 ? '#3b82f6' :
                compositeScore.overall >= 50 ? '#f59e0b' : '#dc2626'
    }];

    return (
        <div className="space-y-6">
            {/* Hero Score Card */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl">
                <div className="p-8">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">Change Intelligence Score</h2>
                            <p className="text-slate-600">Overall transformation readiness assessment</p>
                        </div>
                        {getScoreIcon(compositeScore.overall)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Main Score Visualization */}
                        <div className="flex flex-col items-center justify-center">
                            <ResponsiveContainer width="100%" height={250}>
                                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                                    data={overallData} startAngle={180} endAngle={0}>
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background dataKey="value" cornerRadius={10} fill={overallData[0].fill} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="text-center -mt-24">
                                <div className={`text-6xl font-bold ${getScoreColor(compositeScore.overall)}`}>
                                    {compositeScore.overall.toFixed(1)}
                                </div>
                                <div className="text-slate-500 text-sm mt-1">out of 100</div>
                            </div>
                        </div>

                        {/* Score Details */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="text-sm text-slate-500 mb-1">Category</div>
                                <div className="text-xl font-semibold text-slate-900">{compositeScore.category}</div>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <div className="text-sm text-slate-500 mb-1">Interpretation</div>
                                <div className="text-lg text-slate-700">{compositeScore.interpretation}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                    <div className="text-xs text-slate-500 mb-1">Risk Index</div>
                                    <div className="text-2xl font-bold text-red-600">
                                        {compositeScore.transformationRiskIndex.toFixed(0)}%
                                    </div>
                                </div>
                                <div className="bg-white rounded-lg p-3 border border-slate-200">
                                    <div className="text-xs text-slate-500 mb-1">Adoption Probability</div>
                                    <div className="text-2xl font-bold text-blue-600">
                                        {compositeScore.adoptionProbabilityIndex.toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard
                    icon={<Activity className="w-5 h-5" />}
                    title="Financial Feasibility"
                    value={`${compositeScore.financialFeasibilityScore.toFixed(0)}%`}
                    status={compositeScore.financialFeasibilityScore >= 70 ? 'green' : compositeScore.financialFeasibilityScore >= 50 ? 'amber' : 'red'}
                    description="ROI viability and budget readiness"
                />
                <MetricCard
                    icon={<TrendingUp className="w-5 h-5" />}
                    title="Transformation Risk"
                    value={`${compositeScore.transformationRiskIndex.toFixed(0)}%`}
                    status={compositeScore.transformationRiskIndex <= 30 ? 'green' : compositeScore.transformationRiskIndex <= 50 ? 'amber' : 'red'}
                    description="Overall risk exposure"
                    inverse
                />
                <MetricCard
                    icon={<CheckCircle className="w-5 h-5" />}
                    title="Adoption Likelihood"
                    value={`${compositeScore.adoptionProbabilityIndex.toFixed(0)}%`}
                    status={compositeScore.adoptionProbabilityIndex >= 70 ? 'green' : compositeScore.adoptionProbabilityIndex >= 50 ? 'amber' : 'red'}
                    description="Expected user acceptance rate"
                />
            </div>
        </div>
    );
}

interface MetricCardProps {
    icon: React.ReactNode;
    title: string;
    value: string;
    status: 'green' | 'amber' | 'red';
    description: string;
    inverse?: boolean;
}

function MetricCard({ icon, title, value, status, description }: MetricCardProps) {
    const colors = {
        green: 'bg-green-50 border-green-200 text-green-700',
        amber: 'bg-amber-50 border-amber-200 text-amber-700',
        red: 'bg-red-50 border-red-200 text-red-700',
    };
    const valueColors = { green: 'text-green-600', amber: 'text-amber-600', red: 'text-red-600' };

    return (
        <div className={`${colors[status]} border-2 rounded-xl`}>
            <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                    <div className={valueColors[status]}>{icon}</div>
                    <div className={`text-3xl font-bold ${valueColors[status]}`}>{value}</div>
                </div>
                <div className="font-semibold text-slate-900 mb-1">{title}</div>
                <div className="text-sm text-slate-600">{description}</div>
            </div>
        </div>
    );
}
