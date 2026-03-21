import React from "react";
import { CheckCircle, Clock, AlertTriangle, X, Calendar, ArrowRight, Building2 } from "lucide-react";

interface PaymentStatusModalProps {
    isOpen: boolean;
    onClose: () => void;
    status: "paid" | "pending" | "rejected" | "unpaid";
    engineName: string;
    expiresAt?: string;
    onProceed?: () => void;
}

export default function PaymentStatusModal({ 
    isOpen, 
    onClose, 
    status, 
    engineName, 
    expiresAt,
    onProceed 
}: PaymentStatusModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-slide-up relative">
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="p-8 text-center">
                    {status === "pending" && (
                        <>
                            <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                                <Clock className="w-10 h-10 text-yellow-600 animate-pulse" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verification in Progress</h2>
                            <p className="text-slate-600 mb-6">
                                Your payment for <span className="font-bold text-slate-800">{engineName}</span> is currently under verification by our admin.
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-6">
                                <p className="text-sm text-yellow-800 flex items-center gap-2 justify-center">
                                    <Clock className="w-4 h-4" /> Expected activation within 24 hours
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-2xl transition-all"
                            >
                                Close
                            </button>
                        </>
                    )}

                    {status === "paid" && (
                        <>
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Active!</h2>
                            <p className="text-slate-600 mb-4">
                                Your subscription for <span className="font-bold text-slate-800">{engineName}</span> is active and verified.
                            </p>
                            {expiresAt && (
                                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-6">
                                    <p className="text-sm text-green-800 flex items-center gap-2 justify-center">
                                        <Calendar className="w-4 h-4" /> Expires on: {new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </p>
                                </div>
                            )}
                            <button 
                                onClick={onProceed}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                            >
                                View Report <ArrowRight className="w-5 h-5" />
                            </button>
                        </>
                    )}

                    {status === "rejected" && (
                        <>
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                                <AlertTriangle className="w-10 h-10 text-red-600" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Rejected</h2>
                            <p className="text-slate-600 mb-6">
                                Unfortunately, your payment proof was rejected. Please review your submission or try another payment method.
                            </p>
                            <button 
                                onClick={onProceed} // Redirect to payment
                                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-200"
                            >
                                Try Again
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
