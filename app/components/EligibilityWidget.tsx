import { CheckCircle, Clock, Zap, ArrowRight } from "lucide-react";
import { Link } from "@remix-run/react";

interface EligibilityWidgetProps {
    current: number;
    required: number;
    completedEngines: string[];
    isEligible: boolean;
}

export default function EligibilityWidget({
    current,
    required,
    completedEngines,
    isEligible
}: EligibilityWidgetProps) {
    const percentage = Math.min(100, Math.round((current / required) * 100));
    const remaining = Math.max(0, required - current);

    return (
        <div className={`rounded-xl shadow-lg p-6 border-2 ${isEligible
            ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-500"
            : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300"
            }`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        {isEligible ? (
                            <>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Ready for Transformation
                            </>
                        ) : (
                            <>
                                <Clock className="w-5 h-5 text-blue-600" />
                                Transformation Eligibility
                            </>
                        )}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                        {isEligible
                            ? "You've unlocked HR Digital Transformation!"
                            : `Complete ${remaining} more engine${remaining !== 1 ? 's' : ''} to unlock`
                        }
                    </p>
                </div>
                <div className="text-3xl">
                    {isEligible ? "🎉" : "🚀"}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm text-gray-700 mb-2">
                    <span className="font-medium">Progress</span>
                    <span className="font-bold">{current}/{required} engines</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                        className={`h-3 rounded-full transition-all duration-500 ${isEligible
                            ? "bg-gradient-to-r from-green-500 to-emerald-600"
                            : "bg-gradient-to-r from-blue-500 to-indigo-600"
                            }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">{percentage}% complete</p>
            </div>

            {/* Completed Engines List */}
            {completedEngines.length > 0 && (
                <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Completed & Paid:</p>
                    <div className="space-y-1">
                        {completedEngines.map((engine, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                                <span className="truncate">{engine}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CTA Button */}
            {isEligible ? (
                <Link
                    to="/startTransformationDashboard"
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md"
                >
                    <Zap className="w-5 h-5" />
                    Start Transformation Journey
                    <ArrowRight className="w-5 h-5" />
                </Link>
            ) : (
                <Link
                    to="/pricing"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    View Available Engines
                    <ArrowRight className="w-5 h-5" />
                </Link>
            )}

            {/* Info Text */}
            <p className="text-xs text-gray-500 text-center mt-3">
                {isEligible
                    ? "Our team will contact you to begin your transformation"
                    : "Complete assessments and verify payment to unlock transformation"
                }
            </p>
        </div>
    );
}
