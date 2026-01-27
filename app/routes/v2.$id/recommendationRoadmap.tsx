import { FC, useEffect, useState, useRef } from "react";
import { Zap, TrendingUp, Calendar, Flag, Map } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { DetailedRecommendations, RecommendationGroup } from "./schemas";

// --- Props Interface ---
interface RoadmapTimelineProps {
    recommendations: DetailedRecommendations;
}

// Helper to get color-coded dot for each dimension
const getDimensionColor = (dimension: string): string => {
    switch (dimension) {
        case 'Customer Experience': return 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]';
        case 'Technology & Infrastructure': return 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]';
        case 'Operations & Process': return 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]';
        case 'Innovation & Governance': return 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]';
        case 'People & Culture': return 'bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]';
        case 'Strategic Foundation': return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]';
        default: return 'bg-slate-500';
    }
};

// Get priority color
const getPriorityColor = (priority: string | undefined): { bg: string; border: string; text: string } => {
    if (!priority) return { bg: 'bg-slate-500', border: 'border-slate-500', text: 'text-slate-400' };

    switch (priority.toLowerCase()) {
        case 'critical': return { bg: 'bg-rose-500', border: 'border-rose-500', text: 'text-rose-400' };
        case 'high': return { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-400' };
        case 'medium': return { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-400' };
        default: return { bg: 'bg-slate-500', border: 'border-slate-500', text: 'text-slate-400' };
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
        className="p-5 glass-card rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group relative overflow-hidden"
    >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Zap className="w-16 h-16 text-indigo-400" />
        </div>

        <div className="relative z-10 flex items-start justify-between">
            <div className="flex-1">
                <p className="font-bold text-sm text-slate-200 leading-relaxed max-w-[90%]">{action.action}</p>
                <div className="flex items-center mt-3 text-xs text-slate-400">
                    <div className="flex items-center mr-4">
                        <span className={`w-2 h-2 rounded-full mr-2 ${getDimensionColor(action.dimension)}`}></span>
                        <span className="font-medium">{action.dimension}</span>
                    </div>
                </div>
            </div>
            <div className="flex flex-col items-end space-y-2 ml-4">
                <span className="flex items-center text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-full uppercase tracking-wider font-bold">
                    <TrendingUp size={10} className="mr-1" />{action.impact}
                </span>
                <span className="flex items-center text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-full uppercase tracking-wider font-bold">
                    <Zap size={10} className="mr-1" />{action.effort}
                </span>
            </div>
        </div>
        {action.estimated_cost && (
            <div className="mt-4 pt-3 border-t border-white/5 relative z-10">
                <p className="text-xs text-slate-500 flex justify-between">
                    <span className="font-bold uppercase tracking-wider">Estimated Investment</span>
                    <span className="text-slate-300 font-mono">{action.estimated_cost}</span>
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
    const { bg, border, text } = getPriorityColor(phase.priority);
    const isLast = index === totalPhases - 1;

    return (
        <div className="relative flex items-start group">
            {/* Timeline line and dot */}
            <div className="flex flex-col items-center mr-8">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className={`w-4 h-4 rounded-full border-2 ${border} bg-slate-900 z-10 relative shadow-[0_0_10px_rgba(255,255,255,0.1)]`}
                >
                    {isActive && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className={`absolute inset-0.5 rounded-full ${bg} animate-pulse`}
                        />
                    )}
                </motion.div>
                {!isLast && (
                    <div className="w-px h-full bg-gradient-to-b from-white/20 to-white/5 absolute top-4 bottom-0 left-[7px]" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-16">
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <div className="mb-6 flex items-center justify-between">
                        <div className="flex items-center">
                            <Flag className={`mr-3 ${text} w-5 h-5`} />
                            <div>
                                <h3 className="text-xl font-bold text-white">
                                    {phase.priority} Priority Actions
                                </h3>
                                <p className={`text-xs font-mono mt-0.5 ${text} opacity-80 uppercase tracking-widest`}>
                                    Phase {index + 1}: {phase.timeline}
                                </p>
                            </div>
                        </div>
                        <span className="text-xs bg-white/5 text-slate-400 px-3 py-1 rounded-full font-mono border border-white/5">
                            {phase.actions.length} Items
                        </span>
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
        stiffness: 100, damping: 30, restDelta: 0.001
    });

    const lineHeight = useTransform(springProgress, [0, 1], ["0%", "100%"]);

    useEffect(() => {
        const unsubscribe = scrollYProgress.onChange((value) => {
            const phaseIndex = Math.floor(value * roadmapPhases.length);
            setActivePhase(Math.min(phaseIndex, roadmapPhases.length - 1));
        });
        return unsubscribe;
    }, [scrollYProgress, roadmapPhases.length]);

    if (roadmapPhases.length === 0) return null;

    return (
        <div className="space-y-12 p-4 sm:p-6 lg:p-8 relative z-10" ref={containerRef}>
            <div className="text-center mb-0">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-white tracking-tight"
                >
                    Transformation Roadmap
                </motion.h2>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-6 max-w-3xl mx-auto glass-card p-6 rounded-2xl border border-white/10 text-left"
                >
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-500/20 rounded-xl">
                            <Map className="w-6 h-6 text-indigo-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-bold text-sm mb-2">Strategic Execution Path</h4>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                This roadmap outlines a phased execution strategy, prioritizing high-impact quick wins to build momentum, followed by structural transformations.
                                The timeline is calibrated to balance resource intensity with business continuity, ensuring sustainable digital evolution.
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Main Timeline Container */}
            <div className="relative max-w-4xl mx-auto pl-4 md:pl-0">
                {/* Animated Progress Line */}
                <div className="absolute left-[11px] top-4 bottom-0 w-[2px] bg-white/5 rounded-full overflow-hidden mobile-line-fix">
                    <motion.div
                        className="w-full bg-gradient-to-b from-indigo-500 via-purple-500 to-cyan-500 rounded-full origin-top"
                        style={{ height: lineHeight }}
                    />
                </div>

                {/* Timeline Milestones */}
                <div className="space-y-0 pt-8">
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
            <style>{`
                @media (max-width: 640px) {
                    .mobile-line-fix { left: 4px; }
                 }
            `}</style>
        </div>
    );
};
