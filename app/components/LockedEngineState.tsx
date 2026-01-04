import { Link } from "@remix-run/react";
import { LockClosedIcon, ShoppingCartIcon, CreditCardIcon } from "@heroicons/react/24/outline";

interface LockedEngineProps {
    engineName: string;
    engineIcon?: string;
    previewMessage?: string;
    price: number;
}

export default function LockedEngineState({
    engineName,
    engineIcon = "🔒",
    previewMessage = "Complete payment to unlock the full detailed report and insights.",
    price
}: LockedEngineProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center p-6">
            <div className="max-w-2xl w-full">
                {/* Locked State Card */}
                <div className="bg-white rounded-2xl shadow-2xl border-2 border-orange-200 overflow-hidden">
                    {/* Header with Lock Icon */}
                    <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white text-center">
                        <div className="inline-block p-4 bg-white/20 rounded-full mb-4">
                            <LockClosedIcon className="w-16 h-16" />
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Report Locked</h1>
                        <p className="text-orange-100 text-lg">
                            {engineName}
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {/* Preview Message */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">{engineIcon}</span>
                                <div>
                                    <h3 className="font-semibold text-yellow-900 mb-1">Assessment Completed!</h3>
                                    <p className="text-sm text-yellow-800">{previewMessage}</p>
                                </div>
                            </div>
                        </div>

                        {/* What's Included */}
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 text-lg">Unlock Full Report to Get:</h3>
                            <ul className="space-y-2">
                                {[
                                    "Detailed AI-powered analysis and insights",
                                    "Comprehensive recommendations and action plans",
                                    "Visual dashboards and data visualizations",
                                    "Downloadable PDF reports",
                                    "Priority support and consultation"
                                ].map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        <span className="text-gray-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pricing */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <p className="text-sm text-gray-600 mb-1">One-time payment</p>
                                    <p className="text-3xl font-bold text-blue-600">₹{price.toLocaleString()}</p>
                                    <p className="text-xs text-gray-500 mt-1">+ 18% GST</p>
                                </div>
                                <div className="text-right">
                                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                                        Already in Cart
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Added automatically</p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Link
                                to="/cartDashboard"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-4 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <ShoppingCartIcon className="w-5 h-5" />
                                View Cart & Proceed to Payment
                            </Link>

                            <Link
                                to="/payment/checkout"
                                className="w-full bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-600 font-semibold px-6 py-4 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                <CreditCardIcon className="w-5 h-5" />
                                Go Directly to Checkout
                            </Link>

                            <Link
                                to="/startTransformationDashboard"
                                className="w-full text-center text-gray-600 hover:text-gray-900 text-sm py-2 transition-colors"
                            >
                                ← Back to Dashboard
                            </Link>
                        </div>

                        {/* Help Text */}
                        <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                            <p>Need help? Contact our support team at <a href="mailto:support@hrtek.com" className="text-blue-600 hover:underline">support@hrtek.com</a></p>
                        </div>
                    </div>
                </div>

                {/* Security Badge */}
                <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>Secure payment processing • 100% money-back guarantee</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
