interface RiskGaugeProps {
    riskLevel: "low" | "medium" | "high";
    className?: string;
}

export default function RiskGauge({ riskLevel, className = "" }: RiskGaugeProps) {
    const riskConfig = {
        low: { position: 20, label: "Low", color: "text-green-600" },
        medium: { position: 50, label: "Med", color: "text-amber-600" },
        high: { position: 80, label: "High", color: "text-red-600" },
    };

    const config = riskConfig[riskLevel];

    return (
        <div className={`${className}`}>
            <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    Risk Assessment
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                        />
                    </svg>
                </h4>
            </div>

            {/* Risk Meter */}
            <div className="relative h-8 bg-gradient-to-r from-green-400 via-yellow-400 via-amber-500 to-red-500 rounded-full overflow-hidden">
                {/* Indicator */}
                <div
                    className="absolute top-0 bottom-0 w-1 bg-gray-900 shadow-lg transition-all duration-500"
                    style={{ left: `${config.position}%` }}
                >
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rounded-full" />
                    <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-gray-900 rounded-full" />
                </div>
            </div>

            {/* Labels */}
            <div className="flex justify-between mt-2 text-xs font-medium">
                <span className="text-green-600">Low</span>
                <span className="text-amber-600">Med</span>
                <span className="text-red-600">High</span>
            </div>

            {/* Overall Risk */}
            <div className="mt-3 text-center">
                <p className="text-xs text-gray-500">Overall Risk:</p>
                <p className={`text-lg font-bold ${config.color}`}>{config.label}</p>
            </div>
        </div>
    );
}
