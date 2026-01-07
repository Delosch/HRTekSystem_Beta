import { FC } from "react";
import { TrendingUp, Award, Target, Users, BarChart3, ArrowRight, Zap, Grip, LineChart } from "lucide-react";
import { MaturityAnalysis, RadarChartData } from "./schemas";
import { motion } from "framer-motion";

// --- Props Interface ---
interface BenchmarkingAnalysisProps {
    dimensionalScores: MaturityAnalysis['dimensional_scores'];
    overallScore: MaturityAnalysis['overall_score'];
    radarData: RadarChartData;
}

// --- Helper Functions ---
const getPerformanceTier = (percentile: number): { color: string; label: string; bg: string; border: string } => {
    if (percentile >= 90) return { color: 'text-emerald-300', label: 'Top Tier', bg: 'bg-emerald-500/20', border: 'border-emerald-400/50' };
    if (percentile >= 75) return { color: 'text-indigo-300', label: 'High Performer', bg: 'bg-indigo-500/20', border: 'border-indigo-400/50' };
    if (percentile >= 50) return { color: 'text-blue-300', label: 'Above Average', bg: 'bg-blue-500/20', border: 'border-blue-400/50' };
    if (percentile >= 25) return { color: 'text-yellow-300', label: 'Below Average', bg: 'bg-yellow-500/20', border: 'border-yellow-400/50' };
    return { color: 'text-rose-300', label: 'Needs Improvement', bg: 'bg-rose-500/20', border: 'border-rose-400/50' };
};

const calculatePercentile = (yourScore: number, industryBenchmark: number): number => {
    const ratio = yourScore / industryBenchmark;
    if (ratio >= 1.2) return 92;
    if (ratio >= 1.1) return 78;
    if (ratio >= 1.0) return 60;
    if (ratio >= 0.9) return 40;
    return 20;
};

// --- Sub-components ---

// Textual Analysis Component (New)
const ComparativeAnalysisText: FC<{ dimensionalScores: MaturityAnalysis['dimensional_scores'] }> = ({ dimensionalScores }) => {
    const avgScore = dimensionalScores.reduce((acc, curr) => acc + curr.raw_score, 0) / dimensionalScores.length;
    const leaders = dimensionalScores.filter(d => d.raw_score > d.industry_benchmark);
    const laggards = dimensionalScores.filter(d => d.raw_score < d.industry_benchmark);

    return (
        <div className="h-full flex flex-col justify-center space-y-6">
            <div>
                <h4 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-indigo-400" /> Comparative Intelligence
                </h4>
                <p className="text-sm text-slate-300 leading-relaxed font-medium">
                    The organization is currently performing
                    <span className={avgScore > 2.5 ? " text-emerald-400 font-bold" : " text-yellow-400 font-bold"}>
                        {avgScore > 2.5 ? " at " : " slightly below "}
                    </span>
                    industry parity. While specific pockets of excellence exist, broad alignment with top-tier benchmarks remains a strategic opportunity.
                </p>
            </div>

            <div className="space-y-4">
                <div className="glass-card p-4 rounded-xl border border-white/10 bg-slate-800/80">
                    <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">Competitive Edge</h5>
                    {leaders.length > 0 ? (
                        <p className="text-xs text-slate-200">
                            Leading in <span className="text-white font-bold">{leaders[0].dimension}</span> (+{(leaders[0].raw_score - leaders[0].industry_benchmark).toFixed(1)} vs Avg), demonstrating strong capability maturity in execution.
                        </p>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No clear competitive advantages identified yet.</p>
                    )}
                </div>

                <div className="glass-card p-4 rounded-xl border border-white/10 bg-slate-800/80">
                    <h5 className="text-xs font-bold text-rose-400 uppercase tracking-widest mb-2">Critical Divergence</h5>
                    {laggards.length > 0 ? (
                        <p className="text-xs text-slate-200">
                            Significant gap observed in <span className="text-white font-bold">{laggards[0].dimension}</span>. This divergence poses potential operational risks relative to modernized peers.
                        </p>
                    ) : (
                        <p className="text-xs text-slate-400 italic">No critical lags detected.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

// Comparison Section (Grid Layout)
const PeerComparisonSection: FC<{ dimensionalScores: MaturityAnalysis['dimensional_scores'] }> = ({ dimensionalScores }) => {
    const maxScore = 5;

    return (
        <div className="glass-card p-8 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-8 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-indigo-400" />
                Peer Comparison Across Dimensions
            </h3>

            <div className="grid lg:grid-cols-2 gap-12">
                {/* Visual Chart - High Contrast Neon */}
                <div className="space-y-8">
                    {dimensionalScores.map((dimension, index) => {
                        const percentile = calculatePercentile(dimension.raw_score, dimension.industry_benchmark);
                        const tier = getPerformanceTier(percentile);

                        return (
                            <motion.div
                                key={dimension.dimension}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="space-y-3"
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <h4 className="font-bold text-xs text-white uppercase tracking-wider">{dimension.dimension}</h4>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${tier.bg} ${tier.color} ${tier.border} border font-bold uppercase`}>
                                        {tier.label}
                                    </span>
                                </div>

                                <div className="relative h-10 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 shadow-inner">
                                    {/* Tracks Labels */}
                                    <div className="absolute top-0 bottom-0 left-0 bg-transparent w-full flex items-center px-2 z-20 justify-between text-[10px] font-mono text-slate-500 font-bold pointer-events-none">
                                        <span>0</span>
                                        <span>2.5</span>
                                        <span>5.0</span>
                                    </div>

                                    {/* Industry Average Marker - Solid high contrast */}
                                    <motion.div
                                        initial={{ left: 0 }}
                                        whileInView={{ left: `${(dimension.industry_benchmark / maxScore) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                        className="absolute top-0 bottom-0 w-1.5 bg-yellow-400 z-10 shadow-[0_0_10px_rgba(250,204,21,0.6)]"
                                    />
                                    <motion.div
                                        initial={{ left: 0, opacity: 0 }}
                                        whileInView={{ left: `${(dimension.industry_benchmark / maxScore) * 100}%`, opacity: 1 }}
                                        transition={{ duration: 1, delay: 0.3 }}
                                        className="absolute -top-6 -translate-x-1/2 text-[10px] font-bold text-yellow-400 z-30 bg-slate-900 border border-yellow-400/50 px-1 rounded transform"
                                        style={{ left: `${(dimension.industry_benchmark / maxScore) * 100}%` }}
                                    >
                                        Avg
                                    </motion.div>

                                    {/* Your Score Bar - Solid high contrast */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${(dimension.raw_score / maxScore) * 100}%` }}
                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                                        className="absolute top-2.5 bottom-2.5 left-0 bg-cyan-500 rounded-r-sm z-0 flex items-center justify-end pr-2 shadow-[0_0_15px_rgba(6,182,212,0.5)] border-r-2 border-cyan-200"
                                    >
                                        <span className="text-white text-xs font-black drop-shadow-md">{dimension.raw_score}</span>
                                    </motion.div>
                                </div>
                                <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                                    <span className="text-cyan-400">You: {dimension.raw_score}</span>
                                    <span className="text-yellow-400">Peer Avg: {dimension.industry_benchmark}</span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Textual Analysis */}
                <div className="border-t lg:border-t-0 lg:border-l border-white/10 pt-8 lg:pt-0 lg:pl-12">
                    <ComparativeAnalysisText dimensionalScores={dimensionalScores} />
                </div>
            </div>
        </div>
    );
};

// Comparison Table
const ComparisonTable: FC<{ dimensionalScores: MaturityAnalysis['dimensional_scores']; overallScore: MaturityAnalysis['overall_score']; }> = ({ dimensionalScores }) => {
    return (
        <div className="glass-card p-6 rounded-2xl border border-white/10 overflow-hidden">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3 text-indigo-400" />
                Performance Data Matrix
            </h3>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-800 text-xs uppercase text-slate-300 font-bold tracking-wider border-b border-white/10">
                        <tr>
                            <th className="px-6 py-4 rounded-tl-lg">Dimension</th>
                            <th className="px-6 py-4 text-center">Score</th>
                            <th className="px-6 py-4 text-center">Industry</th>
                            <th className="px-6 py-4 text-center">Leader</th>
                            <th className="px-6 py-4 text-center">Ranking</th>
                            <th className="px-6 py-4 text-center rounded-tr-lg">Gap</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                        {dimensionalScores.map((dimension, index) => {
                            const topPerformer = dimension.industry_benchmark * 1.3;
                            const gap = topPerformer - dimension.raw_score;

                            // Calculate percentile dynamically for this row
                            const percentile = calculatePercentile(dimension.raw_score, dimension.industry_benchmark);
                            const tier = getPerformanceTier(percentile);

                            return (
                                <motion.tr
                                    key={dimension.dimension}
                                    initial={{ opacity: 0, y: 10 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-6 py-4 font-bold text-white">{dimension.dimension}</td>
                                    <td className="px-6 py-4 text-center font-black text-cyan-400 text-lg">{dimension.raw_score.toFixed(1)}</td>
                                    <td className="px-6 py-4 text-center text-slate-400 font-medium">{dimension.industry_benchmark.toFixed(1)}</td>
                                    <td className="px-6 py-4 text-center text-slate-400 font-medium">{topPerformer.toFixed(1)}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${tier.bg} ${tier.color} ${tier.border} border`}>
                                            {tier.label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`font-mono font-bold ${gap > 1 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                            {gap > 0 ? '-' : '+'}{Math.abs(gap).toFixed(1)}
                                        </span>
                                    </td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Key Insights Panel
const BenchmarkInsights: FC<{ overallScore: MaturityAnalysis['overall_score']; dimensionalScores: MaturityAnalysis['dimensional_scores']; }> = ({ overallScore, dimensionalScores }) => {
    const strongDimensions = dimensionalScores.filter(d => d.raw_score > d.industry_benchmark).slice(0, 3);
    const improvementAreas = dimensionalScores.filter(d => d.raw_score < d.industry_benchmark).slice(0, 3);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-card p-6 rounded-2xl border border-white/10 group hover:border-indigo-500/50 transition-colors bg-slate-800/40">
                <div className="flex items-center mb-4">
                    <Award className="w-8 h-8 text-indigo-400 mr-3" />
                    <h4 className="font-bold text-white">Market Position</h4>
                </div>
                <div className="text-5xl font-black text-white mb-2 neon-text drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">
                    {overallScore.industry_benchmark.percentile_ranking}th
                </div>
                <p className="text-xs text-slate-300 font-medium">
                    Percentile ranking vs <span className="text-white">{overallScore.industry_benchmark.peer_comparison}</span> peers.
                </p>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 group hover:border-emerald-500/50 transition-colors bg-slate-800/40">
                <div className="flex items-center mb-4">
                    <TrendingUp className="w-8 h-8 text-emerald-400 mr-3" />
                    <h4 className="font-bold text-white">Power Zones</h4>
                </div>
                <ul className="space-y-3">
                    {strongDimensions.map((dimension, index) => (
                        <li key={index} className="text-sm text-slate-200 flex items-center font-medium">
                            <ArrowRight className="w-4 h-4 text-emerald-500 mr-2 bg-emerald-500/20 rounded-full p-0.5" />
                            {dimension.dimension}
                        </li>
                    ))}
                    {strongDimensions.length === 0 && <li className="text-sm text-slate-500 italic">Evaluating strengths...</li>}
                </ul>
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 group hover:border-rose-500/50 transition-colors bg-slate-800/40">
                <div className="flex items-center mb-4">
                    <Zap className="w-8 h-8 text-rose-400 mr-3" />
                    <h4 className="font-bold text-white">Focus Areas</h4>
                </div>
                <ul className="space-y-3">
                    {improvementAreas.map((dimension, index) => (
                        <li key={index} className="text-sm text-slate-200 flex items-center font-medium">
                            <ArrowRight className="w-4 h-4 text-rose-500 mr-2 bg-rose-500/20 rounded-full p-0.5" />
                            {dimension.dimension}
                        </li>
                    ))}
                    {improvementAreas.length === 0 && <li className="text-sm text-slate-500 italic">No major gaps found.</li>}
                </ul>
            </div>
        </div>
    );
};

export const BenchmarkingAnalysis: FC<BenchmarkingAnalysisProps> = ({ dimensionalScores, overallScore, radarData }) => {
    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-12">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white tracking-tight"
                >
                    Benchmarking & Market Analysis
                </motion.h2>
                <p className="mt-2 text-lg text-slate-300 max-w-2xl mx-auto font-medium">
                    Comparative analytics against industry leaders and market standards.
                </p>
            </div>

            <BenchmarkInsights overallScore={overallScore} dimensionalScores={dimensionalScores} />
            <PeerComparisonSection dimensionalScores={dimensionalScores} />
            <ComparisonTable dimensionalScores={dimensionalScores} overallScore={overallScore} />
        </div>
    );
};