import { FC} from "react";
import { TrendingUp, Award, Target, Users, BarChart3 } from "lucide-react";
import { MaturityAnalysis, RadarChartData } from "./schemas";
import { motion } from "framer-motion";

// --- Props Interface ---
interface BenchmarkingAnalysisProps {
    dimensionalScores: MaturityAnalysis['dimensional_scores'];
    overallScore: MaturityAnalysis['overall_score'];
    radarData: RadarChartData;
}

// --- Helper Functions ---

// Get performance tier color based on percentile
const getPerformanceTier = (percentile: number): { color: string; label: string; bg: string } => {
    if (percentile >= 90) return { color: 'text-green-600', label: 'Top Tier', bg: 'bg-green-50' };
    if (percentile >= 75) return { color: 'text-blue-600', label: 'High Performer', bg: 'bg-blue-50' };
    if (percentile >= 50) return { color: 'text-yellow-600', label: 'Above Average', bg: 'bg-yellow-50' };
    if (percentile >= 25) return { color: 'text-orange-600', label: 'Below Average', bg: 'bg-orange-50' };
    return { color: 'text-red-600', label: 'Needs Improvement', bg: 'bg-red-50' };
};

// Calculate percentile ranking from industry benchmark
const calculatePercentile = (yourScore: number, industryBenchmark: number): number => {
    // Simple approximation - in real implementation, this would use actual distribution data
    const ratio = yourScore / industryBenchmark;
    if (ratio >= 1.2) return 90;
    if (ratio >= 1.1) return 75;
    if (ratio >= 1.0) return 60;
    if (ratio >= 0.9) return 40;
    return 25;
};

// --- Sub-components ---

// Animated Bar Chart for Dimension Comparison
const DimensionBarChart: FC<{ dimensionalScores: MaturityAnalysis['dimensional_scores'] }> = ({ dimensionalScores }) => {
    const maxScore = 5; // Assuming scores are out of 5

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <BarChart3 className="w-6 h-6 mr-3 text-blue-600" />
                Peer Comparison Across Dimensions
            </h3>
            <div className="space-y-4">
                {dimensionalScores.map((dimension, index) => {
                    const percentile = calculatePercentile(dimension.raw_score, dimension.industry_benchmark);
                    const { color, label, bg } = getPerformanceTier(percentile);
                    
                    return (
                        <motion.div
                            key={dimension.dimension}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1, duration: 0.5 }}
                            className="space-y-2"
                        >
                            <div className="flex justify-between items-center">
                                <h4 className="font-semibold text-sm text-gray-700">{dimension.dimension}</h4>
                                <span className={`text-xs px-2 py-1 rounded-full ${bg} ${color} font-medium`}>
                                    {label}
                                </span>
                            </div>
                            
                            <div className="relative">
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Your Score: {dimension.raw_score.toFixed(1)}</span>
                                    <span>Industry Avg: {dimension.industry_benchmark.toFixed(1)}</span>
                                    <span>Top Performer: {(dimension.industry_benchmark * 1.3).toFixed(1)}</span>
                                </div>
                                
                                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                                    {/* Industry Average Bar */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(dimension.industry_benchmark / maxScore) * 100}%` }}
                                        transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                                        className="absolute h-full bg-gray-400 opacity-60"
                                    />
                                    
                                    {/* Top Performer Bar */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((dimension.industry_benchmark * 1.3) / maxScore) * 100}%` }}
                                        transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                                        className="absolute h-full bg-green-300 opacity-60"
                                    />
                                    
                                    {/* Your Score Bar */}
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(dimension.raw_score / maxScore) * 100}%` }}
                                        transition={{ delay: index * 0.1 + 0.7, duration: 0.8 }}
                                        className="absolute h-full bg-blue-600 rounded-full"
                                    />
                                    
                                    {/* Score Labels */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">
                                            {dimension.raw_score.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

// Comparison Table
const ComparisonTable: FC<{ 
    dimensionalScores: MaturityAnalysis['dimensional_scores']; 
    overallScore: MaturityAnalysis['overall_score'];
}> = ({ dimensionalScores, overallScore }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Target className="w-6 h-6 mr-3 text-blue-600" />
                Performance Benchmarking Table
            </h3>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold text-gray-700">Dimension</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Your Score</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Industry Avg</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Top Performers</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Percentile</th>
                            <th className="px-4 py-3 text-center font-semibold text-gray-700">Gap to Leaders</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {dimensionalScores.map((dimension, index) => {
                            const topPerformer = dimension.industry_benchmark * 1.3;
                            const percentile = calculatePercentile(dimension.raw_score, dimension.industry_benchmark);
                            const { color, label, bg } = getPerformanceTier(percentile);
                            const gap = topPerformer - dimension.raw_score;
                            
                            return (
                                <motion.tr
                                    key={dimension.dimension}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.3 }}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-4 py-3 font-medium text-gray-900">{dimension.dimension}</td>
                                    <td className="px-4 py-3 text-center font-bold text-blue-600">
                                        {dimension.raw_score.toFixed(1)}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {dimension.industry_benchmark.toFixed(1)}
                                    </td>
                                    <td className="px-4 py-3 text-center text-gray-600">
                                        {topPerformer.toFixed(1)}
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${bg} ${color}`}>
                                            {percentile}th
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={gap > 0 ? 'text-red-600' : 'text-green-600'}>
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
const BenchmarkInsights: FC<{ 
    overallScore: MaturityAnalysis['overall_score']; 
    dimensionalScores: MaturityAnalysis['dimensional_scores'];
}> = ({ overallScore, dimensionalScores }) => {
    const strongDimensions = dimensionalScores
        .filter(d => d.raw_score > d.industry_benchmark)
        .sort((a, b) => (b.raw_score - b.industry_benchmark) - (a.raw_score - a.industry_benchmark))
        .slice(0, 3);
    
    const improvementAreas = dimensionalScores
        .filter(d => d.raw_score < d.industry_benchmark)
        .sort((a, b) => (a.raw_score - a.industry_benchmark) - (b.raw_score - b.industry_benchmark))
        .slice(0, 3);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Position */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center mb-4">
                    <Award className="w-8 h-8 text-yellow-500 mr-3" />
                    <h4 className="font-bold text-gray-800">Overall Position</h4>
                </div>
                <div className="text-3xl font-bold text-blue-600 mb-2">
                    {overallScore.industry_benchmark.percentile_ranking}th
                </div>
                <p className="text-sm text-gray-600">
                    Percentile ranking across {overallScore.industry_benchmark.peer_comparison} peers in your industry
                </p>
            </div>

            {/* Strongest Areas */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center mb-4">
                    <TrendingUp className="w-8 h-8 text-green-500 mr-3" />
                    <h4 className="font-bold text-gray-800">Leading Areas</h4>
                </div>
                <ul className="space-y-2">
                    {strongDimensions.map((dimension, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            {dimension.dimension}
                        </li>
                    ))}
                </ul>
            </div>

            {/* Improvement Opportunities */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex items-center mb-4">
                    <Users className="w-8 h-8 text-orange-500 mr-3" />
                    <h4 className="font-bold text-gray-800">Focus Areas</h4>
                </div>
                <ul className="space-y-2">
                    {improvementAreas.map((dimension, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-center">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                            {dimension.dimension}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

// --- Main Benchmarking Analysis Component ---
export const BenchmarkingAnalysis: FC<BenchmarkingAnalysisProps> = ({ 
    dimensionalScores, 
    overallScore, 
    radarData 
}) => {
    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="text-center">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-gray-800 tracking-tight"
                >
                    Benchmarking & Peer Analysis
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto"
                >
                    See how your organization compares to industry benchmarks and top performers.
                </motion.p>
            </div>

            {/* Key Insights */}
            <BenchmarkInsights overallScore={overallScore} dimensionalScores={dimensionalScores} />

            {/* Bar Chart and Radar Chart */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <DimensionBarChart dimensionalScores={dimensionalScores} />
                
                {/* <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                        Multi-Dimensional Comparison
                    </h3>
                    <div className="h-96">
                        <NewRadarChart data={radarData} />
                    </div>
                </div> */}
            </div>

            {/* Detailed Comparison Table */}
            <ComparisonTable dimensionalScores={dimensionalScores} overallScore={overallScore} />
        </div>
    );
};