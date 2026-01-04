interface ComparisonCardProps {
    vendorName: string;
    status: "top-choice" | "moderate" | "evaluated" | "in-progress";
    fitScore: number;
    estimatedCost: string;
    className?: string;
}

const statusConfig = {
    "top-choice": {
        label: "TOP CHOICE",
        color: "green",
        bgColor: "bg-green-50",
        borderColor: "border-l-green-500",
        textColor: "text-green-700",
        progressColor: "bg-green-500",
    },
    moderate: {
        label: "MODERATE",
        color: "amber",
        bgColor: "bg-amber-50",
        borderColor: "border-l-amber-500",
        textColor: "text-amber-700",
        progressColor: "bg-amber-500",
    },
    evaluated: {
        label: "EVALUATED",
        color: "blue",
        bgColor: "bg-blue-50",
        borderColor: "border-l-blue-500",
        textColor: "text-blue-700",
        progressColor: "bg-blue-500",
    },
    "in-progress": {
        label: "IN PROGRESS",
        color: "gray",
        bgColor: "bg-gray-50",
        borderColor: "border-l-gray-500",
        textColor: "text-gray-700",
        progressColor: "bg-gray-500",
    },
};

export default function ComparisonCard({
    vendorName,
    status,
    fitScore,
    estimatedCost,
    className = "",
}: ComparisonCardProps) {
    const config = statusConfig[status];

    return (
        <div
            className={`bg-white rounded-xl shadow-md border-l-4 ${config.borderColor} p-6 hover:shadow-lg transition-all ${className}`}
        >
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{vendorName}</h3>
                    <span
                        className={`text-xs font-semibold ${config.textColor} ${config.bgColor} px-2 py-1 rounded`}
                    >
                        {config.label}
                    </span>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
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

            <div className="mb-4">
                <div className="flex items-baseline justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Fit Score</span>
                    <span className="text-2xl font-bold text-gray-900">{fitScore}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`${config.progressColor} h-2 rounded-full transition-all duration-500`}
                        style={{ width: `${fitScore}%` }}
                    />
                </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                    EST. 1ST YEAR COST
                </p>
                <p className="text-xl font-bold text-gray-900">{estimatedCost}</p>
            </div>
        </div>
    );
}
