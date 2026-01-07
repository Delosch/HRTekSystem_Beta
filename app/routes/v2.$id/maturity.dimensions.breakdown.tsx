import { useMemo, } from "react";
import { FlippableDimensionCard, MaturityDimensionBreakdownProps } from "./progressCards";
import { getHeatmapMatrix, Heatmap, HeatmapDataConfig } from "./heat_map";
import { LayoutGrid, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

// --- Main Section Component ---
export const MaturityDimensionBreakdown = ({ dimensionalScores, progressBars, heatmap, kpiFramework }: MaturityDimensionBreakdownProps) => {

    const combinedData = useMemo(() => {
        return progressBars.map(progressBar => {
            const dimensionScore = dimensionalScores.find(d => d.dimension === progressBar.dimension);
            const kpi = kpiFramework.find(k => k.dimension === progressBar.dimension);

            return {
                dimension: progressBar.dimension,
                percentage: progressBar.current_percentage,
                status: progressBar.status,
                key_strengths: dimensionScore?.key_strengths || [],
                critical_gaps: dimensionScore?.critical_gaps || [],
                kpis: kpi,
            };
        });
    }, [dimensionalScores, progressBars, kpiFramework]);

    // Split data for the two rows
    const row1Data = combinedData.slice(0, 4);
    const row2Data = combinedData.slice(4, 7);
    const heatmapDataConfig: HeatmapDataConfig = {
        matrix: heatmap.dimensions.map(dim => ({
            name: dim.name,
            capabilities: dim.capabilities.map(cap => ({
                ...cap,
                color_intensity: Math.max(1, 6 - cap.score) // intensity: 1 best, 5 worst
            }))
        })),
        color_scale: {
            min_color: heatmap.colors.min,
            mid_color: heatmap.colors.mid,
            max_color: heatmap.colors.max
        }
    };

    const heatmapMatrixData = getHeatmapMatrix(heatmapDataConfig);

    return (
        <div className="space-y-12 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-12">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white tracking-tight"
                >
                    Maturity Dimensions
                </motion.h2>
                <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">
                    Deep dive into core operational pillars. Hover over cards for detailed insights.
                </p>
            </div>

            <div className="flex flex-col items-center space-y-8">
                {/* First Row: 4 Cards */}
                <div className="grid w-full max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {row1Data.map((data, idx) => (
                        <motion.div
                            key={data.dimension}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <FlippableDimensionCard data={data} />
                        </motion.div>
                    ))}
                </div>

                {/* Second Row: 3 Cards, Centered */}
                {row2Data.length > 0 && (
                    <div className="grid w-full max-w-5xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {row2Data.map((data, idx) => (
                            <motion.div
                                key={data.dimension}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: (idx + 4) * 0.1 }}
                            >
                                <FlippableDimensionCard data={data} />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <div className="pt-8">
                <div className="glass-card p-8 rounded-2xl border border-white/10">
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left: Textual Analysis */}
                        <div className="lg:col-span-1 space-y-6">
                            <h3 className="text-xl font-bold text-white flex items-center">
                                <LayoutGrid className="w-6 h-6 mr-3 text-indigo-400" />
                                Operational Hotspots
                            </h3>
                            <div className="prose prose-invert prose-sm">
                                <p className="text-slate-400 leading-relaxed">
                                    The heatmap visualization reveals the density of capability maturity across functional areas.
                                    Darker regions indicate high-maturity clusters, while lighter zones highlight systemic gaps requiring intervention.
                                </p>
                            </div>

                            <div className="space-y-4 pt-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                                    <h4 className="flex items-center text-emerald-400 font-bold text-sm mb-2">
                                        <CheckCircle2 className="w-4 h-4 mr-2" /> Maturity Clusters
                                    </h4>
                                    <p className="text-xs text-emerald-200/70">
                                        Identified strong coherence in core processes. These areas can serve as centers of excellence for wider transformation.
                                    </p>
                                </div>
                                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl">
                                    <h4 className="flex items-center text-rose-400 font-bold text-sm mb-2">
                                        <AlertCircle className="w-4 h-4 mr-2" /> Fragmentation Risks
                                    </h4>
                                    <p className="text-xs text-rose-200/70">
                                        Dispersed low-maturity scores suggest fragmented capability development in innovation sectors.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right: Heatmap */}
                        <div className="lg:col-span-2">
                            <div className="overflow-x-auto rounded-xl border border-white/5 bg-slate-900/50 p-4">
                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 text-center">Capability Density Matrix</h4>
                                <Heatmap data={heatmapMatrixData} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
