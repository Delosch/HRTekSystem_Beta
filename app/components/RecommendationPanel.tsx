import { useState } from "react";

interface RecommendationPanelProps {
    selectedVendor: string;
    reason: string;
    advantages: string[];
    onProceed?: () => void;
    onChangeSelection?: () => void;
    className?: string;
}

export default function RecommendationPanel({
    selectedVendor,
    reason,
    advantages,
    onProceed,
    onChangeSelection,
    className = "",
}: RecommendationPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 rounded-2xl shadow-2xl p-8 text-white ${className}`}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <svg
                            className="w-6 h-6 text-blue-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-sm text-blue-300 uppercase tracking-wide font-semibold">
                            FINAL RECOMMENDATION
                        </p>
                    </div>
                </div>

                {onChangeSelection && (
                    <button
                        onClick={onChangeSelection}
                        className="text-sm text-gray-400 hover:text-white transition-colors underline"
                    >
                        Change Selection
                    </button>
                )}
            </div>

            {/* Selected Vendor */}
            <h2 className="text-3xl font-bold mb-6">
                Select{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                    {selectedVendor}
                </span>
            </h2>

            {/* Reason */}
            <div className="mb-6">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center justify-between w-full text-left"
                >
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                        WHY?
                    </h3>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
                <div
                    className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-96 mt-2" : "max-h-20"
                        }`}
                >
                    <p className="text-gray-300 leading-relaxed">{reason}</p>
                </div>
            </div>

            {/* Key Advantages */}
            <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wide mb-3">
                    KEY ADVANTAGE
                </h3>
                <div className="flex flex-wrap gap-2">
                    {advantages.map((advantage, index) => (
                        <span
                            key={index}
                            className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg text-sm font-medium border border-white/20 hover:bg-white/20 transition-colors cursor-default"
                        >
                            {advantage}
                        </span>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={onProceed}
                    className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                    Proceed with Selection
                    <svg
                        className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                    </svg>
                </button>

                <button
                    onClick={() => window.print()}
                    className="px-6 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold rounded-xl transition-all flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print
                </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 text-center mt-4">
                Action will not impact your current team
            </p>
        </div>
    );
}
