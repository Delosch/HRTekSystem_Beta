import { Section } from "./helper_layout";
import { Award, BarChart3, Check, Users, X, Loader2, Sparkles, TrendingUp, ShieldAlert, Cpu } from "lucide-react";
import { NewRadarChart } from "./radar_chart";
import { MaturityAnalysis_OverallScrore, StrategicInsights, VisualizationData } from "./schemas";
import { InteractiveBubbleChart } from "./bubble_gap_chart";
import { motion } from "framer-motion";

export const ExecutiveSummary = ({ insights, overallScore, vizData }: { insights?: StrategicInsights, overallScore?: MaturityAnalysis_OverallScrore, vizData?: VisualizationData }) => {
    // If data is not yet available, show a loading indicator.
    if (!insights || !overallScore || !vizData) {
        return (
            <Section title="Executive Summary" subtitle="Loading assessment data...">
                <div className="flex flex-col justify-center items-center h-96 glass-card rounded-3xl">
                    <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                    <p className="mt-4 text-indigo-300">Accessing Neural Network...</p>
                </div>
            </Section>
        );
    }

    return (
        <Section title="Executive Summary" subtitle="Strategic intelligence and maturity breakdown.">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Textual Summary and Key Metrics */}
                <div className="lg:col-span-1 space-y-8">

                    {/* Overall Assessment Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="p-8 glass-card rounded-3xl relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Cpu className="w-24 h-24 text-indigo-400" />
                        </div>
                        <h3 className="text-sm font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Sparkles className="w-4 h-4" /> AI Assessment
                        </h3>
                        <p className="text-lg text-slate-200 leading-relaxed font-light">
                            {insights.overall_assessment}
                        </p>
                    </motion.div>

                    {/* Key Metrics */}
                    <div className="p-6 glass-card rounded-3xl border border-white/5">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Core Performance</h3>
                        <div className="space-y-6">
                            <div className="flex items-center group">
                                <div className="p-3 bg-indigo-500/20 rounded-xl mr-5 group-hover:bg-indigo-500/30 transition-colors">
                                    <Award className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Maturity Level</p>
                                    <p className="text-2xl font-bold text-white group-hover:text-indigo-300 transition-colors">{overallScore.maturity_level}</p>
                                </div>
                            </div>
                            <div className="flex items-center group">
                                <div className="p-3 bg-emerald-500/20 rounded-xl mr-5 group-hover:bg-emerald-500/30 transition-colors">
                                    <BarChart3 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Competitive Position</p>
                                    <p className="text-2xl font-bold text-white group-hover:text-emerald-300 transition-colors">{overallScore.industry_benchmark.peer_comparison} Avg.</p>
                                </div>
                            </div>
                            <div className="flex items-center group">
                                <div className="p-3 bg-purple-500/20 rounded-xl mr-5 group-hover:bg-purple-500/30 transition-colors">
                                    <Users className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Readiness Index</p>
                                    <p className="text-2xl font-bold text-white group-hover:text-purple-300 transition-colors">{insights.transformation_readiness.readiness_level}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Factors */}
                    <div className="p-6 glass-card rounded-3xl">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Transformation Catalysts</h3>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-xs font-bold text-emerald-400 mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-3 h-3" /> ENABLERS
                                </h4>
                                <ul className="space-y-2">
                                    {insights.transformation_readiness.enabling_factors.map((factor, i) => (
                                        <li key={i} className="flex items-start text-sm text-slate-400">
                                            <Check className="w-4 h-4 mr-2 mt-0.5 text-emerald-500 flex-shrink-0" />
                                            <span>{factor}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-rose-400 mb-3 flex items-center gap-2">
                                    <ShieldAlert className="w-3 h-3" /> BLOCKERS
                                </h4>
                                <ul className="space-y-2">
                                    {insights.transformation_readiness.blocking_factors.map((factor, i) => (
                                        <li key={i} className="flex items-start text-sm text-slate-400">
                                            <X className="w-4 h-4 mr-2 mt-0.5 text-rose-500 flex-shrink-0" />
                                            <span>{factor}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Visualizations */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="p-8 glass-card rounded-[2.5rem] min-h-[400px] flex flex-col items-center">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Capability Radar</h3>
                        <div className="w-full h-96">
                            <NewRadarChart data={vizData.radar_chart} />
                        </div>
                    </div>

                    <div className="p-8 glass-card rounded-[2.5rem] min-h-[400px]">
                        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">Impact vs. Gap Analysis</h3>
                        <InteractiveBubbleChart bubbles={vizData.gap_bubbles} />
                    </div>
                </div>
            </div>
        </Section>
    );
};