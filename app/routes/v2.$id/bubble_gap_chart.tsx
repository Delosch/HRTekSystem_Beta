import { useState, useMemo } from "react";
import { BubbleData } from "./schemas"; // Assuming this path is correct
import { motion, Variants } from "framer-motion";

// Correctly typed variants to resolve the framer-motion error
const chartVariants: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 120,
            damping: 15,
            delay: 0.3,
        },
    },
};

const STATUS_COLORS: Record<string, string> = {
  Excellent: '#10b981',
  On_Track: '#3b82f6',
  Needs_Attention: '#f59e0b',
  Critical: '#ef4444',
};

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

// A dedicated component for each bubble
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
                fillOpacity={isHovered ? 0.8 : 0.6}
                stroke={fillColor}
                strokeWidth={isHovered ? 3 : 2}
                className="drop-shadow-lg"
            />
            <foreignObject x={x - 50} y={y + radius + 5} width="100" height="50">
                <div style={{
                    textAlign: 'center',
                    color: '#374151',
                    fontSize: '12px',
                    fontWeight: 600,
                    lineHeight: '1.2'
                }}>
                    {dimension}
                    <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>
                        {timeline} mo
                    </div>
                </div>
            </foreignObject>
            
            <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                className="text-sm font-bold"
                fill="white"
                style={{ pointerEvents: 'none' }}
            >
                {(gap ?? 0).toFixed(1)}
            </text>
        </motion.g>
    );
};

// Main Interactive Bubble Chart Component
export const InteractiveBubbleChart= ({ bubbles = [] }:{bubbles:BubbleData[]}) => {
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

            // Apply jitter if this is not the first bubble at this position
            if (countAtPosition > 0) {
                const angle = countAtPosition * (Math.PI / 3); // 60 degrees apart
                const radius = 20; // The radius of the jitter circle
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
            <div className="flex items-center justify-center h-96 text-gray-500 bg-white rounded-xl shadow-lg border">
                <p>No bubble chart data available</p>
            </div>
        );
    }

    return (
        <motion.div
            className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
            variants={chartVariants}
            initial="hidden"
            animate="visible"
        >
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
                Gap Analysis – Strategic Importance vs Investment Required
            </h3>
            <div className="relative bg-gray-50 rounded-lg p-4" onMouseLeave={() => setHovered(null)}>
                <svg width="100%" height="400" viewBox="0 0 600 400" className="overflow-visible">
                    {/* Grid and Axes */}
                    <defs>
                        <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                    <line x1={50} y1={350} x2={550} y2={350} stroke="#374151" strokeWidth={2} />
                    <line x1={50} y1={50} x2={50} y2={350} stroke="#374151" strokeWidth={2} />
                    <text x={300} y={390} textAnchor="middle" fontSize={14} fill="#374151">Strategic Importance →</text>
                    <text x={20} y={200} textAnchor="middle" fontSize={14} fill="#374151" transform="rotate(-90 20 200)">Investment Required →</text>
                    
                    {/* Bubbles */}
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
            <div className="mt-4 text-sm text-gray-600 text-center space-y-1">
                <p><strong>Bubble size:</strong> Investment required - <strong>Numbers:</strong> Gap magnitude</p>
                <p><strong>Timeline</strong> shown below each bubble in months</p>
            </div>
        </motion.div>
    );
};
