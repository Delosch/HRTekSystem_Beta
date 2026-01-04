import { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";

interface MetricsCardProps {
    title: string;
    value: number | string;
    icon: LucideIcon;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    suffix?: string;
    colorScheme?: "blue" | "green" | "purple" | "amber" | "indigo";
    className?: string;
}

const colorSchemes = {
    blue: {
        gradient: "from-blue-500 to-blue-600",
        bg: "bg-blue-50",
        text: "text-blue-600",
        iconBg: "bg-gradient-to-br from-blue-500 to-blue-600",
    },
    green: {
        gradient: "from-green-500 to-green-600",
        bg: "bg-green-50",
        text: "text-green-600",
        iconBg: "bg-gradient-to-br from-green-500 to-green-600",
    },
    purple: {
        gradient: "from-purple-500 to-purple-600",
        bg: "bg-purple-50",
        text: "text-purple-600",
        iconBg: "bg-gradient-to-br from-purple-500 to-purple-600",
    },
    amber: {
        gradient: "from-amber-500 to-amber-600",
        bg: "bg-amber-50",
        text: "text-amber-600",
        iconBg: "bg-gradient-to-br from-amber-500 to-amber-600",
    },
    indigo: {
        gradient: "from-indigo-500 to-indigo-600",
        bg: "bg-indigo-50",
        text: "text-indigo-600",
        iconBg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
    },
};

export default function MetricsCard({
    title,
    value,
    icon: Icon,
    trend,
    suffix = "",
    colorScheme = "blue",
    className = "",
}: MetricsCardProps) {
    const [displayValue, setDisplayValue] = useState(0);
    const colors = colorSchemes[colorScheme] || colorSchemes.blue;

    // Animated counter effect
    useEffect(() => {
        if (typeof value === "number") {
            let start = 0;
            const end = value;
            const duration = 1000; // 1 second
            const increment = end / (duration / 16); // 60fps

            const timer = setInterval(() => {
                start += increment;
                if (start >= end) {
                    setDisplayValue(end);
                    clearInterval(timer);
                } else {
                    setDisplayValue(Math.floor(start));
                }
            }, 16);

            return () => clearInterval(timer);
        }
    }, [value]);

    const displayedValue = typeof value === "number" ? displayValue : value;

    return (
        <div
            className={`relative overflow-hidden bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${className}`}
        >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 ${colors.bg} rounded-full -mr-16 -mt-16 opacity-50`} />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-3xl font-bold text-gray-900">
                                {displayedValue}
                                {suffix && <span className="text-xl ml-1">{suffix}</span>}
                            </h3>
                        </div>
                    </div>

                    <div className={`${colors.iconBg} p-3 rounded-xl shadow-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                    </div>
                </div>

                {trend && (
                    <div className="flex items-center gap-1">
                        <svg
                            className={`w-4 h-4 ${trend.isPositive ? "text-green-500" : "text-red-500"}`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            {trend.isPositive ? (
                                <path
                                    fillRule="evenodd"
                                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                                    clipRule="evenodd"
                                />
                            ) : (
                                <path
                                    fillRule="evenodd"
                                    d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                />
                            )}
                        </svg>
                        <span
                            className={`text-sm font-medium ${trend.isPositive ? "text-green-600" : "text-red-600"
                                }`}
                        >
                            {trend.value}%
                        </span>
                        <span className="text-sm text-gray-500">vs last month</span>
                    </div>
                )}
            </div>
        </div>
    );
}
