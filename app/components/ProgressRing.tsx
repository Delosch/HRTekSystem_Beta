import { useEffect, useState } from "react";

interface ProgressRingProps {
    progress: number; // 0-100
    size?: number;
    strokeWidth?: number;
    className?: string;
    label?: string;
    showPercentage?: boolean;
}

export default function ProgressRing({
    progress,
    size = 160,
    strokeWidth = 12,
    className = "",
    label = "",
    showPercentage = true,
}: ProgressRingProps) {
    const [animatedProgress, setAnimatedProgress] = useState(0);

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (animatedProgress / 100) * circumference;

    // Animate progress on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedProgress(progress);
        }, 100);
        return () => clearTimeout(timer);
    }, [progress]);

    // Determine color based on progress
    const getColor = () => {
        if (progress >= 80) return "#10B981"; // green
        if (progress >= 50) return "#3B82F6"; // blue
        if (progress >= 30) return "#F59E0B"; // amber
        return "#EF4444"; // red
    };

    const getGradientId = () => {
        if (progress >= 80) return "greenGradient";
        if (progress >= 50) return "blueGradient";
        if (progress >= 30) return "amberGradient";
        return "redGradient";
    };

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg width={size} height={size} className="transform -rotate-90">
                <defs>
                    <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                    <linearGradient id="amberGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>
                    <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#EF4444" />
                        <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                </defs>

                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="#E5E7EB"
                    strokeWidth={strokeWidth}
                    fill="none"
                />

                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={`url(#${getGradientId()})`}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    style={{
                        filter: "drop-shadow(0 0 8px rgba(59, 130, 246, 0.3))",
                    }}
                />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                {showPercentage && (
                    <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900">
                            {Math.round(animatedProgress)}%
                        </div>
                        {label && (
                            <div className="text-sm text-gray-600 mt-1 font-medium">{label}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
