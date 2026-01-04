import { FC } from "react";
import { Zap, TrendingUp, Calendar, Flag } from "lucide-react";
import { DetailedRecommendations, RecommendationGroup } from "./schemas"; // Make sure to import your schema types


// --- Props Interface ---
// This component accepts the `detailed_recommendations` object directly.
interface RoadmapTimelineProps {
    recommendations: DetailedRecommendations;
}

// --- Helper Functions ---

// Helper to get color-coded dot for each dimension
const getDimensionColor = (dimension: string): string => {
    switch (dimension) {
        case 'Customer Experience': return 'bg-blue-500';
        case 'Technology & Infrastructure': return 'bg-purple-500';
        case 'Operations & Process': return 'bg-orange-500';
        case 'Innovation & Governance': return 'bg-teal-500';
        case 'People & Culture': return 'bg-pink-500';
        case 'Strategic Foundation': return 'bg-green-500';
        default: return 'bg-gray-500';
    }
};

// --- Sub-components ---

// A card for a single action item
const ActionItem: FC<{ action: any }> = ({ action }) => (
    <div className="p-3 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-300">
        <p className="font-bold text-sm text-gray-800">{action.action}</p>
        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <div className="flex items-center">
                <span className={`w-2.5 h-2.5 rounded-full mr-1.5 ${getDimensionColor(action.dimension)}`}></span>
                {action.dimension}
            </div>
            <div className="flex items-center space-x-2">
                <span className="flex items-center"><TrendingUp size={12} className="mr-1" />{action.impact}</span>
                <span className="flex items-center"><Zap size={12} className="mr-1" />{action.effort}</span>
            </div>
        </div>
    </div>
);

// --- Main Roadmap Timeline Component ---
export const RoadmapTimeline = ({ recommendations }: RoadmapTimelineProps) => {

    const roadmapPhases = [
        recommendations?.immediate_actions,
        recommendations?.short_term_initiatives,
        // Add optional medium/long term initiatives here if they exist
    ].filter((phase): phase is RecommendationGroup => !!phase);

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Transformation Roadmap</h2>
                <p className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto">
                    A visual timeline of prioritized actions to guide your digital transformation.
                </p>
            </div>

            {/* Timeline Container */}
            <div className="relative w-full">
                {/* Horizontal line for desktop */}
                <div className="hidden lg:block absolute left-0 right-0 top-8 h-0.5 bg-gray-300"></div>

                <div className="relative flex flex-col lg:flex-row justify-between gap-12 lg:gap-8">
                    {roadmapPhases.map((phase) => (
                        <div key={phase.timeline} className="flex-1">
                            {/* Milestone Marker for desktop */}
                            <div className="hidden lg:flex flex-col items-center">
                                <div className="absolute w-6 h-6 bg-white border-4 border-blue-600 rounded-full z-10" style={{top: "20px"}}></div>
                            </div>
                            
                            {/* Phase Info and Action Cards */}
                            <div className={`mt-0 lg:mt-16`}>
                                <div className="text-center mb-4">
                                     <h3 className="text-lg font-bold text-gray-800 flex items-center justify-center">
                                        <Flag size={18} className="mr-2 text-blue-600" />
                                        {phase.priority} Actions
                                    </h3>
                                    <p className="text-sm text-gray-500 flex items-center justify-center">
                                        <Calendar size={14} className="mr-1.5" />
                                        {phase.timeline}
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    {phase.actions.map((action, i) => (
                                        <ActionItem key={i} action={action} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};