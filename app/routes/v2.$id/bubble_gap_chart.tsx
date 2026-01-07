import { useState, useMemo } from "react";
import { BubbleData } from "./schemas";
import { motion, Variants } from "framer-motion";

const chartVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 120, damping: 15, delay: 0.3 },
    },
};

const STATUS_COLORS: Record<string, string> = {
    Excellent: '#10b981',
    On_Track: '#3b82f6',
    Needs_Attention: '#f59e0b',
    Critical: '#ef4444',
};

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const Bubble = ({ bubble, isHovered, isDimmed }: { bubble: BubbleData & { x: number; y: number }, isHovered: boolean, isDimmed: boolean }) => {
    const { x, y, investment, status, dimension, timeline, gap } = bubble;
    const radius = clamp((investment ?? 1) * 10, 15, 40);
    const fillColor = STATUS_COLORS[status ?? ''] || '#3b82f6';

    return (
        <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{
                scale: 1,
                opacity: isDimmed ? 0.3 : 1,
                filter: isDimmed ? 'blur(2px)' : 'blur(0px)',
            }}
            whileHover={{ scale: 1.1, zIndex: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            style={{ zIndex: isHovered ? 10 : 1, position: 'relative' }}
        >
            <circle
                cx={x}
                cy={y}
                r={radius}
                fill={fillColor}
                fillOpacity={isHovered ? 0.9 : 0.7}
                stroke={fillColor}
                strokeWidth={isHovered ? 3 : 1}
                className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
            />
            {/* Label below bubble */}
            <foreignObject x={x - 60} y={y + radius + 8} width="120" height="50">
                <div className="flex flex-col items-center text-center">
                    <span className="text-xs font-bold text-slate-200 leading-tight drop-shadow-md">
                        {dimension}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5 bg-slate-900/50 px-1.5 py-0.5 rounded-full border border-white/10">
                        {timeline} mo
                    </span>
                </div>
            </foreignObject>

            {/* Gap Score inside bubble */}
            <text
                x={x}
                y={y + 5}
                textAnchor="middle"
                className="text-sm font-black text-white pointer-events-none drop-shadow-md"
                fill="white"
            >
                {(gap ?? 0).toFixed(1)}
            </text>
        </motion.g>
    );
};

export const InteractiveBubbleChart = ({ bubbles = [] }: { bubbles: BubbleData[] }) => {
    const [hovered, setHovered] = useState<string | null>(null);

    const processedBubbles = useMemo(() => {
        if (!bubbles.length) return [];
        const maxInvestment = Math.max(...bubbles.map(b => b.investment || 0)) || 1;
        const maxImportance = Math.max(...bubbles.map(b => b.importance || 0)) || 1;
        const positionMap = new Map<string, number>();

        return bubbles.map(bubble => {
            const initialX = 70 + ((bubble.importance ?? 0) / maxImportance) * 460;
            const initialY = 330 - ((bubble.investment ?? 0) / maxInvestment) * 260;
            const positionKey = `${initialX.toFixed(2)},${initialY.toFixed(2)}`;
            const countAtPosition = positionMap.get(positionKey) || 0;
            positionMap.set(positionKey, countAtPosition + 1);

            if (countAtPosition > 0) {
                const angle = countAtPosition * (Math.PI / 3);
                const radius = 20;
                return {
                    ...bubble,
                    x: initialX + radius * Math.cos(angle),
                    y: initialY + radius * Math.sin(angle)
                };
            }
            return { ...bubble, x: initialX, y: initialY };
        });
    }, [bubbles]);


    if (!bubbles.length) {
        return (
            <div className="flex items-center justify-center h-96 text-slate-400">
                <p>No bubble chart data available</p>
            </div>
        );
    }

    return (
        <motion.div
            className="p-2 w-full"
            variants={chartVariants}
            initial="hidden"
            animate="visible"
        >
            <div className="relative rounded-lg p-2" onMouseLeave={() => setHovered(null)}>
                <svg width="100%" height="400" viewBox="0 0 600 400" className="overflow-visible">
                    <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    {/* Axes */}
                    <line x1={50} y1={350} x2={550} y2={350} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />
                    <line x1={50} y1={50} x2={50} y2={350} stroke="rgba(255,255,255,0.2)" strokeWidth={2} />

                    <text x={300} y={390} textAnchor="middle" fontSize={12} fill="#94a3b8" fontWeight="bold">Strategic Importance →</text>
                    <text x={20} y={200} textAnchor="middle" fontSize={12} fill="#94a3b8" transform="rotate(-90 20 200)" fontWeight="bold">Investment Required →</text>

                    {processedBubbles.map((bubble, i) => {
                        const isHovered = hovered === bubble.dimension;
                        const isDimmed = hovered !== null && !isHovered;
                        return (
                            <g key={i} onMouseEnter={() => setHovered(bubble.dimension ?? null)}>
                                <Bubble
                                    bubble={bubble}
                                    isHovered={isHovered}
                                    isDimmed={isDimmed}
                                />
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="mt-4 text-xs text-slate-500 text-center space-y-1">
                <p><strong>Bubble size:</strong> Investment magnitude • <strong>Number:</strong> Gap score</p>
                <div className="flex justify-center gap-4 mt-2">
                    {Object.entries(STATUS_COLORS).map(([status, color]) => (
                        <div key={status} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: color }}></span>
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};
