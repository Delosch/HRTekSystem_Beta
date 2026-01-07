import { motion } from "framer-motion";
import { BarChart2, Check, Target, X } from "lucide-react";
import { FC, useState } from "react";
import { HeatMapData, MaturityAnalysis, ProgressBar, SuccessMetrics } from "./schemas";

// --- Props Interface ---
// Accepts the raw data structures from your main schema.
export interface MaturityDimensionBreakdownProps {
    dimensionalScores: MaturityAnalysis['dimensional_scores'];
    progressBars: ProgressBar[];
    heatmap: HeatMapData;
    kpiFramework: SuccessMetrics['kpi_framework'];
}

// --- Internal Data Structure ---
// This is created inside the component for clean data handling.
export interface CombinedDimensionData {
    dimension: string;
    percentage: number;
    status: string; // Sourced from ProgressBar
    key_strengths: string[];
    critical_gaps: string[];
    kpis?: {
        primary_kpis: string[];
    };
}


// --- Helper Functions ---

// Helper for status colors
export const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
        case 'excellent': return '#10b981'; // emerald-500
        case 'on_track': return '#6366f1'; // indigo-500
        case 'needs_attention': return '#f59e0b'; // amber-500
        case 'critical': return '#f43f5e'; // rose-500
        default: return '#94a3b8'; // slate-400
    }
};


// --- Sub-components for the Flippable Card ---

// Card Front: Animated Progress Ring (Dark Mode)
export const CardFront: FC<{ dimension: string; percentage: number; status: string; }> = ({ dimension, percentage, status }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const color = getStatusColor(status);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="absolute inset-0 w-full h-full glass-card rounded-2xl shadow-xl border border-white/5 p-4 flex flex-col items-center justify-center [backface-visibility:hidden] bg-slate-900/40">
            <div className="relative mb-3">
                <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                    <motion.circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
                        className="drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-black text-white">{percentage}%</span>
                </div>
            </div>
            <h4 className="text-sm font-bold text-center text-slate-200 px-2 leading-tight min-h-[2.5em] flex items-center">{dimension}</h4>
            <span
                className="mt-3 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full text-white font-bold"
                style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40`, color: color }}
            >
                {status.replace(/_/g, ' ')}
            </span>
        </div>
    );
};

// Card Back: Details on a dark background
export const CardBack: FC<{ data: CombinedDimensionData }> = ({ data }) => {
    return (
        <div className="absolute inset-0 w-full h-full glass-card bg-slate-900 border border-indigo-500/30 rounded-2xl shadow-2xl p-5 flex flex-col [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <h3 className="text-sm font-bold text-center border-b border-white/10 pb-3 text-white mb-2">{data.dimension}</h3>
            <div className="space-y-3 overflow-y-auto flex-grow text-xs no-scrollbar">
                <div>
                    <h4 className="font-bold text-emerald-400 flex items-center mb-1.5 uppercase tracking-wider text-[10px]">
                        <Check size={12} className="mr-1.5" /> Strengths
                    </h4>
                    <ul className="space-y-1.5">
                        {data.key_strengths.map((s, i) => (
                            <li key={`s-${i}`} className="text-slate-300 pl-2 border-l-2 border-emerald-500/20">{s}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-rose-400 flex items-center mb-1.5 uppercase tracking-wider text-[10px]">
                        <X size={12} className="mr-1.5" /> Gaps
                    </h4>
                    <ul className="space-y-1.5">
                        {data.critical_gaps.map((g, i) => (
                            <li key={`g-${i}`} className="text-slate-300 pl-2 border-l-2 border-rose-500/20">{g}</li>
                        ))}
                    </ul>
                </div>
                {data.kpis && (
                    <div>
                        <h4 className="font-bold text-indigo-400 flex items-center mb-1.5 uppercase tracking-wider text-[10px]">
                            <Target size={12} className="mr-1.5" /> Metrics
                        </h4>
                        <ul className="space-y-1.5">
                            {data.kpis.primary_kpis.map((kpi, i) => (
                                <li key={`kpi-${i}`} className="flex items-start text-slate-400 pl-2">
                                    <BarChart2 size={10} className="mr-2 mt-0.5 flex-shrink-0 text-slate-500" />{kpi}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

// Main Flippable Card Component
export const FlippableDimensionCard: FC<{ data: CombinedDimensionData }> = ({ data }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div
            className="w-full h-[340px] [perspective:1000px] cursor-pointer group"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="relative w-full h-full [transform-style:preserve-3d]"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "backOut" }}
            >
                <CardFront dimension={data.dimension} percentage={data.percentage} status={data.status} />
                <CardBack data={data} />
            </motion.div>
        </div>
    );
};