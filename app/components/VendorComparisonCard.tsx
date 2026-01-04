import { useState } from "react";
import { LucideIcon } from "lucide-react";

interface VendorComparisonCardProps {
    vendorName: string;
    status: "top-choice" | "moderate" | "evaluated" | "in-progress";
    fitScore: number;
    estimatedCost: string;
    onViewDetails?: () => void;
    onSelect?: () => void;
    isSelected?: boolean;
    className?: string;
}

const statusConfig = {
    "top-choice": {
        label: "TOP CHOICE",
        bgColor: "bg-green-50",
        borderColor: "border-l-green-500",
        textColor: "text-green-700",
        badgeBg: "bg-green-100",
        progressColor: "bg-green-500",
    },
    moderate: {
        label: "MODERATE",
        bgColor: "bg-amber-50",
        borderColor: "border-l-amber-500",
        textColor: "text-amber-700",
        badgeBg: "bg-amber-100",
        progressColor: "bg-amber-500",
    },
    evaluated: {
        label: "EVALUATED",
        bgColor: "bg-blue-50",
        borderColor: "border-l-blue-500",
        textColor: "text-blue-700",
        badgeBg: "bg-blue-100",
        progressColor: "bg-blue-500",
    },
    "in-progress": {
        label: "IN PROGRESS",
        bgColor: "bg-gray-50",
        borderColor: "border-l-gray-500",
        textColor: "text-gray-700",
        badgeBg: "bg-gray-100",
        progressColor: "bg-gray-500",
    },
};

export default function VendorComparisonCard({
    vendorName,
    status,
    fitScore,
    estimatedCost,
    onViewDetails,
    onSelect,
    isSelected = false,
    className = "",
}: VendorComparisonCardProps) {
    const config = statusConfig[status];
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`bg-white rounded-xl shadow-md border-l-4 ${config.borderColor} p-6 hover:shadow-xl transition-all duration-300 cursor-pointer ${isSelected ? "ring-2 ring-blue-500 ring-offset-2" : ""
                } ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onSelect}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{vendorName}</h3>
                    <span
                        className={`text-xs font-semibold ${config.textColor} ${config.badgeBg} px-3 py-1 rounded-full`}
                    >
                        {config.label}
                    </span>
                </div>
                <div className="flex gap-2">
                    {isSelected && (
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </div>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails?.();
                        }}
                        className={`text-gray-400 hover:text-gray-600 transition-all ${isHovered ? "opacity-100" : "opacity-0"
                            }`}
                    >
                        <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Fit Score */}
            <div className="mb-6">
                <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Fit Score</span>
                    <span className="text-3xl font-bold text-gray-900">{fitScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                        className={`${config.progressColor} h-2.5 rounded-full transition-all duration-1000 ease-out`}
                        style={{ width: `${fitScore}%` }}
                    />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                </div>
            </div>

            {/* Estimated Cost */}
            <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1 font-semibold">
                    EST. 1ST YEAR COST
                </p>
                <p className="text-2xl font-bold text-gray-900">{estimatedCost}</p>
            </div>

            {/* Select Button (appears on hover) */}
            {onSelect && !isSelected && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                    }}
                    className={`mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                        }`}
                >
                    Select Vendor
                </button>
            )}
        </div>
    );
}
