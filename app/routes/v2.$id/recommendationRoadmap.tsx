import { FC, useEffect, useState, useRef } from "react";
import { Zap, TrendingUp, Calendar, Flag } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { DetailedRecommendations, RecommendationGroup } from "./schemas";

// --- Props Interface ---
interface RoadmapTimelineProps {
    recommendations: DetailedRecommendations;
}

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

// Get priority color
const getPriorityColor = (priority: string): { bg: string; border: string } => {
    switch (priority.toLowerCase()) {
        case 'critical': return { bg: 'bg-red-500', border: 'border-red-500' };
        case 'high': return { bg: 'bg-orange-500', border: 'border-orange-500' };
        case 'medium': return { bg: 'bg-blue-500', border: 'border-blue-500' };
        default: return { bg: 'bg-gray-500', border: 'border-gray-500' };
    }
};

// --- Sub-components ---

// Enhanced action item with animation
const ActionItem: FC<{ action: any; index: number }> = ({ action, index }) => (
    <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1, duration: 0.5 }}
        viewport={{ once: true, margin: "-50px" }}
        className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300"
    >
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p className="font-bold text-sm text-gray-800 leading-relaxed">{action.action}</p>
                <div className="flex items-center mt-3 text-xs text-gray-500">
                    <div className="flex items-center mr-4">
                        <span className={`w-3 h-3 rounded-full mr-2 ${getDimensionColor(action.dimension)}`}></span>
                        <span className="font-medium">{action.dimension}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end space-y-1 ml-4">
                <span className="flex items-center text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">
                    <TrendingUp size={10} className="mr-1" />{action.impact}
                </span>
                <span className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                    <Zap size={10} className="mr-1" />{action.effort}
                </span>
            </div>
        </div>
        {action.estimated_cost && (
            <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-600">
                    <span className="font-medium">Est. Cost:</span> {action.estimated_cost}
                </p>
            </div>
        )}
    </motion.div>
);

// Timeline milestone component
const TimelineMilestone: FC<{ 
    phase: RecommendationGroup; 
    index: number; 
    isActive: boolean;
    totalPhases: number;
}> = ({ phase, index, isActive, totalPhases }) => {
    const { bg, border } = getPriorityColor(phase.priority);
    const isLast = index === totalPhases - 1;

    return (
        <div className="relative flex items-start">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center mr-8">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={`w-6 h-6 rounded-full border-4 ${border} bg-white z-10 relative`}
                >
                    {isActive && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute inset-1 rounded-full ${bg}`}
                        />
                    )}
                </motion.div>
                {!isLast && (
                    <div className="w-1 h-32 bg-gray-200 mt-2" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-12">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <div className="mb-6">
                        <div className="flex items-center mb-2">
                            <Flag className={`mr-3 ${bg.replace('bg-', 'text-')} w-5 h-5`} />
                            <h3 className="text-xl font-bold text-gray-800">
                                {phase.priority} Priority Actions
                            </h3>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                            <Calendar size={16} className="mr-2" />
                            <span className="font-medium">{phase.timeline}</span>
                            <span className="ml-4 text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {phase.actions.length} action{phase.actions.length !== 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {phase.actions.map((action, actionIndex) => (
                            <ActionItem key={actionIndex} action={action} index={actionIndex} />
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// --- Main Roadmap Timeline Component ---
export const RoadmapTimeline: FC<RoadmapTimelineProps> = ({ recommendations }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activePhase, setActivePhase] = useState(0);
    
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start center", "end center"]
    });

    const roadmapPhases = [
        recommendations?.immediate_actions,
        recommendations?.short_term_initiatives,
        recommendations?.medium_term_initiatives,
        recommendations?.long_term_initiatives,
    ].filter((phase): phase is RecommendationGroup => !!phase);

    // Smooth spring animation for the progress line
    const springProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    // Transform scroll progress to line height
    const lineHeight = useTransform(springProgress, [0, 1], ["0%", "100%"]);

    // Update active phase based on scroll
    useEffect(() => {
        const unsubscribe = scrollYProgress.onChange((value) => {
            const phaseIndex = Math.floor(value * roadmapPhases.length);
            setActivePhase(Math.min(phaseIndex, roadmapPhases.length - 1));
        });
        return unsubscribe;
    }, [scrollYProgress, roadmapPhases.length]);

    if (roadmapPhases.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No roadmap data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-12 p-4 sm:p-6 lg:p-8" ref={containerRef}>
            <div className="text-center">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-gray-800 tracking-tight"
                >
                    Transformation Roadmap
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto"
                >
                    Follow the timeline below to see your prioritized actions unfold as you scroll.
                </motion.p>
            </div>

            {/* Main Timeline Container */}
            <div className="relative max-w-4xl mx-auto">
                {/* Animated Progress Line */}
                <div className="absolute left-8 top-0 w-1 bg-gray-200 rounded-full" style={{ height: '100%' }}>
                    <motion.div
                        className="w-full bg-gradient-to-b from-blue-500 to-blue-600 rounded-full origin-top"
                        style={{ height: lineHeight }}
                    />
                </div>

                {/* Timeline Milestones */}
                <div className="space-y-0">
                    {roadmapPhases.map((phase, index) => (
                        <TimelineMilestone
                            key={phase.timeline}
                            phase={phase}
                            index={index}
                            isActive={index <= activePhase}
                            totalPhases={roadmapPhases.length}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
