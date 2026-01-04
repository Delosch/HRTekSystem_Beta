import { useState } from "react";
import { ChevronDown, ChevronUp, Lightbulb, AlertTriangle, TrendingUp, CheckCircle } from "lucide-react";

interface Insight {
    id: string;
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
    category: "strength" | "improvement" | "recommendation" | "risk";
    actionable?: boolean;
}

interface InsightsPanelProps {
    insights: Insight[];
    className?: string;
}

const categoryConfig = {
    strength: {
        icon: CheckCircle,
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        textColor: "text-green-700",
        iconColor: "text-green-600",
    },
    improvement: {
        icon: TrendingUp,
        color: "blue",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        textColor: "text-blue-700",
        iconColor: "text-blue-600",
    },
    recommendation: {
        icon: Lightbulb,
        color: "amber",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200",
        textColor: "text-amber-700",
        iconColor: "text-amber-600",
    },
    risk: {
        icon: AlertTriangle,
        color: "red",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        textColor: "text-red-700",
        iconColor: "text-red-600",
    },
};

const priorityBadges = {
    high: "bg-red-100 text-red-800 border-red-200",
    medium: "bg-amber-100 text-amber-800 border-amber-200",
    low: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function InsightsPanel({ insights, className = "" }: InsightsPanelProps) {
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {insights.map((insight) => {
                const config = categoryConfig[insight.category];
                const Icon = config.icon;
                const isExpanded = expandedId === insight.id;

                return (
                    <div
                        key={insight.id}
                        className={`${config.bgColor} ${config.borderColor} border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-md`}
                    >
                        <button
                            onClick={() => toggleExpand(insight.id)}
                            className="w-full px-5 py-4 flex items-start gap-4 text-left hover:bg-white/50 transition-colors"
                        >
                            <div className={`${config.iconColor} mt-0.5 flex-shrink-0`}>
                                <Icon className="w-5 h-5" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <h4 className={`font-semibold ${config.textColor} text-sm`}>
                                        {insight.title}
                                    </h4>
                                    <span
                                        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${priorityBadges[insight.priority]
                                            }`}
                                    >
                                        {insight.priority.toUpperCase()}
                                    </span>
                                </div>

                                {!isExpanded && (
                                    <p className="text-sm text-gray-600 line-clamp-1">
                                        {insight.description}
                                    </p>
                                )}
                            </div>

                            <div className="flex-shrink-0 mt-1">
                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                            </div>
                        </button>

                        {isExpanded && (
                            <div className="px-5 pb-4 pt-2 border-t border-gray-200/50 bg-white/30">
                                <p className="text-sm text-gray-700 leading-relaxed mb-3">
                                    {insight.description}
                                </p>

                                {insight.actionable && (
                                    <div className="flex gap-2">
                                        <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg">
                                            Take Action
                                        </button>
                                        <button className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                                            Learn More
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}
