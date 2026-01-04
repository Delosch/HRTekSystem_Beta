
// --- Props Interface ---

import { motion } from "framer-motion";
import { BarChart2, Check, Target, X } from "lucide-react";
import { FC, useState } from "react";
import { HeatMapData, MaturityAnalysis, ProgressBar, SuccessMetrics } from "./schemas";

// Accepts the raw data structures from your main schema.
export interface MaturityDimensionBreakdownProps {
    dimensionalScores: MaturityAnalysis['dimensional_scores'];
    progressBars: ProgressBar[];
    heatmap:HeatMapData;
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
        case 'excellent': return '#10b981';
        case 'on_track': return '#3b82f6';
        case 'needs_attention': return '#f59e0b';
        case 'critical': return '#ef4444';
        default: return '#6b7280';
    }
};


// --- Sub-components for the Flippable Card ---

// Card Front: Animated Progress Ring
export const CardFront: FC<{ dimension: string; percentage: number; status: string; }> = ({ dimension, percentage, status }) => {
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    const color = getStatusColor(status);
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="absolute inset-0 w-full h-full bg-white rounded-xl shadow-lg border border-gray-200 p-4 flex flex-col items-center justify-center [backface-visibility:hidden]">
            <div className="relative mb-3">
                <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
                    <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    <motion.circle
                        cx="60"
                        cy="60"
                        r={radius}
                        fill="none"
                        stroke={color}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1, ease: "circOut", delay: 0.2 }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{percentage}%</span>
                </div>
            </div>
            <h4 className="text-md font-semibold text-center text-gray-700">{dimension}</h4>
            <span className="mt-2 text-xs px-3 py-1 rounded-full text-white font-medium" style={{ backgroundColor: color }}>
                {status.replace(/_/g, ' ')}
            </span>
        </div>
    );
};

// Card Back: Details on a white background
export const CardBack: FC<{ data: CombinedDimensionData }> = ({ data }) => {
    return (
        <div className="absolute inset-0 w-full h-full bg-white text-gray-800 rounded-xl shadow-lg p-4 flex flex-col [backface-visibility:hidden] [transform:rotateY(180deg)] border">
            <h3 className="text-lg font-bold text-center border-b border-gray-200 pb-2">{data.dimension}</h3>
            <div className="mt-2 space-y-2 overflow-y-auto flex-grow text-xs no-scrollbar">
                <div>
                    <h4 className="font-semibold text-green-600 flex items-center mb-1"><Check size={14} className="mr-1.5" /> Strengths</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                        {data.key_strengths.map((s, i) => <li key={`s-${i}`}>{s}</li>)}
                    </ul>
                </div>
                <div className="mt-2">
                    <h4 className="font-semibold text-red-600 flex items-center mb-1"><X size={14} className="mr-1.5" /> Gaps</h4>
                    <ul className="list-disc list-inside pl-2 space-y-1">
                        {data.critical_gaps.map((g, i) => <li key={`g-${i}`}>{g}</li>)}
                    </ul>
                </div>
                {data.kpis && (
                    <div className="mt-2">
                        <h4 className="font-semibold text-blue-600 flex items-center mb-1"><Target size={14} className="mr-1.5" /> KPIs</h4>
                        <ul className="pl-2 space-y-1">
                            {data.kpis.primary_kpis.map((kpi, i) => (
                                <li key={`kpi-${i}`} className="flex items-start"><BarChart2 size={12} className="mr-2 mt-0.5 flex-shrink-0" />{kpi}</li>
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
            className="w-full h-72 [perspective:1000px]"
            onMouseEnter={() => setIsFlipped(true)}
            onMouseLeave={() => setIsFlipped(false)}
        >
            <motion.div
                className="relative w-full h-full [transform-style:preserve-3d]"
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
            >
                <CardFront dimension={data.dimension} percentage={data.percentage} status={data.status} />
                <CardBack data={data} />
            </motion.div>
        </div>
    );
};