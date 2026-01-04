import { Section } from "./helper_layout";
import { Award, BarChart3, Check, Users, X, Loader2 } from "lucide-react";
import { NewRadarChart } from "./radar_chart";
import { MaturityAnalysis_OverallScrore, StrategicInsights, VisualizationData } from "./schemas";
import { InteractiveBubbleChart } from "./bubble_gap_chart";

export const ExecutiveSummary = ({ insights, overallScore, vizData }: { insights?: StrategicInsights, overallScore?: MaturityAnalysis_OverallScrore, vizData?: VisualizationData }) => {
    // If data is not yet available, show a loading indicator.
    if (!insights || !overallScore || !vizData) {
        return (
            <Section title="Executive Summary" subtitle="Loading assessment data...">
                <div className="flex flex-col justify-center items-center h-96 bg-white rounded-lg shadow-md">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="mt-4 text-gray-500">Mapping data...</p>
                </div>
            </Section>
        );
    }

    return (
        <Section title="Executive Summary" subtitle="A high-level overview of your digital maturity assessment.">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Textual Summary and Key Metrics */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-3">Overall Assessment</h3>
                        <p className="text-sm text-gray-600">
                            {insights.overall_assessment}
                        </p>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-full mr-4">
                                    <Award className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Maturity Level</p>
                                    <p className="text-lg font-bold text-gray-800">{overallScore.maturity_level}</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-full mr-4">
                                    <BarChart3 className="w-6 h-6 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Competitive Position</p>
                                    <p className="text-lg font-bold text-gray-800">{overallScore.industry_benchmark.peer_comparison} Average</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-full mr-4">
                                    <Users className="w-6 h-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Transformation Readiness</p>
                                    <p className="text-lg font-bold text-gray-800">{insights.transformation_readiness.readiness_level}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Factors</h3>
                        <div className="space-y-3">
                            <div>
                                <h4 className="font-semibold text-green-600 mb-2">Enabling Factors</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    {insights.transformation_readiness.enabling_factors.map(factor => (
                                        <li key={factor} className="flex items-start">
                                            <Check className="w-4 h-4 mr-2 mt-1 text-green-500 flex-shrink-0" />
                                            <span>{factor}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-semibold text-red-600 mb-2">Blocking Factors</h4>
                                <ul className="space-y-1 text-sm text-gray-600">
                                    {insights.transformation_readiness.blocking_factors.map(factor => (
                                        <li key={factor} className="flex items-start">
                                            <X className="w-4 h-4 mr-2 mt-1 text-red-500 flex-shrink-0" />
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
                    <div className="p-6 bg-white rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">Capability Analysis Radar</h3>
                        <div className="h-96">
                            <NewRadarChart data={vizData.radar_chart} />
                        </div>
                    </div>
                    
                    <div>
                        <InteractiveBubbleChart bubbles={vizData.gap_bubbles} />
                    </div>
                </div>
            </div>
        </Section>
    );
};