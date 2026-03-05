import { CompositeScore, IndexScore } from '../types/assessment';
import { TrendingUp, Award, Target } from 'lucide-react';

interface BenchmarkComparisonProps {
    compositeScore: CompositeScore;
    indices: IndexScore[];
}

export function BenchmarkComparison({ compositeScore, indices }: BenchmarkComparisonProps) {
    const globalAvg = 64.5;
    const top10Pct = 88.2;
    const isAboveAvg = compositeScore.overall > globalAvg;
    const weakest = [...indices].sort((a, b) => a.score - b.score)[0];

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Industry Benchmark Comparison</h2>
                <p className="text-slate-600">How your organization compares to industry standards</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Award className="w-6 h-6 text-indigo-600" />
                        <h3 className="text-xl font-semibold text-slate-900">Score Benchmarks</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                            <div className="text-sm text-slate-500 mb-1">Your Score</div>
                            <div className="text-3xl font-bold text-indigo-600 mb-1">{compositeScore.overall.toFixed(1)}</div>
                            <div className="text-xs text-slate-400">Total Assessment Value</div>
                            <div className="mt-3 h-2 bg-indigo-100 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${compositeScore.overall}%` }} />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-sm text-slate-500 mb-1">Global Average</div>
                            <div className="text-3xl font-bold text-slate-700 mb-1">{globalAvg}</div>
                            <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                                <TrendingUp className="w-3 h-3" />
                                Industry Standard
                            </div>
                            <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-500 rounded-full" style={{ width: `${globalAvg}%` }} />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                            <div className="text-sm text-slate-500 mb-1">Market Top 10%</div>
                            <div className="text-3xl font-bold text-slate-700 mb-1">{top10Pct}</div>
                            <div className="flex items-center gap-1 text-xs text-indigo-500 font-medium">
                                <Target className="w-3 h-3" />
                                Competitive Target
                            </div>
                            <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${top10Pct}%` }} />
                            </div>
                        </div>
                    </div>

                    <div className={`mt-8 p-4 rounded-lg border ${isAboveAvg ? 'bg-emerald-50 border-emerald-100' : 'bg-indigo-50 border-indigo-100'}`}>
                        <p className={`text-sm ${isAboveAvg ? 'text-emerald-900' : 'text-indigo-900'}`}>
                            <strong>Benchmark Insight:</strong> Your transformation readiness is currently
                            {isAboveAvg ? ' above ' : ' below '} the global industry average.
                            {weakest && <> Focus on <strong>{weakest.name}</strong> to improve your competitive positioning.</>}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
