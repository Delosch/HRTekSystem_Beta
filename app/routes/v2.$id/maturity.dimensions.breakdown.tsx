import { useMemo, } from "react";
import { FlippableDimensionCard, MaturityDimensionBreakdownProps } from "./progressCards";
import { getHeatmapMatrix, Heatmap, HeatmapDataConfig } from "./heat_map";

// --- Main Section Component ---
export const MaturityDimensionBreakdown = ({ dimensionalScores, progressBars, heatmap ,kpiFramework }: MaturityDimensionBreakdownProps) => {

    const combinedData = useMemo(() => {
        return progressBars.map(progressBar => {
            const dimensionScore = dimensionalScores.find(d => d.dimension === progressBar.dimension);
            const kpi = kpiFramework.find(k => k.dimension === progressBar.dimension);

            return {
                dimension: progressBar.dimension,
                percentage: progressBar.current_percentage,
                status: progressBar.status, // FIX: Using status from ProgressBar
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
        <div className="space-y-8 p-4">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Maturity Dimension Breakdown</h2>
                <p className="mt-2 text-lg text-gray-500">Hover over a card to flip it and view detailed insights.</p>
            </div>

            <div className="flex flex-col items-center space-y-6">
                {/* First Row: 4 Cards */}
                <div className="grid w-full max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {row1Data.map((data) => (
                        <FlippableDimensionCard key={data.dimension} data={data} />
                    ))}
                </div>

                {/* Second Row: 3 Cards, Centered */}
                {row2Data.length > 0 && (
                    <div className="grid w-full max-w-4xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {row2Data.map((data) => (
                            <FlippableDimensionCard key={data.dimension} data={data} />
                        ))}
                    </div>
                )}
            </div>
            <div className="pt-8">
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                        Detailed Capability Heatmap
                    </h3>
                    <div className="overflow-x-auto">
                        <Heatmap data={heatmapMatrixData} />
                    </div>
                </div>
            </div>
        </div>
    );
};
