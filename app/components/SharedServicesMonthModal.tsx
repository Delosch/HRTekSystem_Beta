import React, { useState } from "react";
import { X, Calendar, ArrowRight, Building2, Check } from "lucide-react";

interface SharedServicesMonthModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (months: number) => void;
}

export default function SharedServicesMonthModal({
    isOpen,
    onClose,
    onSelect
}: SharedServicesMonthModalProps) {
    const [selectedMonths, setSelectedMonths] = useState(1);

    if (!isOpen) return null;

    const options = [
        { value: 1, label: "1 Month", description: "Standard strategic assessment" },
        { value: 3, label: "3 Months", description: "Quarterly review and planning" },
        { value: 6, label: "6 Months", description: "Mid-term service optimization" },
        { value: 12, label: "1 Year", description: "Annual service delivery roadmap" }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-slide-up relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <X className="w-5 h-5 text-slate-400" />
                </button>

                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-indigo-100 rounded-2xl text-indigo-600">
                            <Building2 className="w-8 h-8" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900">Shared Services Report</h2>
                            <p className="text-slate-500">How many months of reporting do you need?</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => setSelectedMonths(opt.value)}
                                className={`p-4 rounded-2xl border-2 text-left transition-all ${selectedMonths === opt.value
                                    ? "border-indigo-600 bg-indigo-50 shadow-md ring-4 ring-indigo-50"
                                    : "border-slate-100 hover:border-slate-200 bg-white"
                                    }`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-bold ${selectedMonths === opt.value ? "text-indigo-700" : "text-slate-900"}`}>
                                        {opt.label}
                                    </span>
                                    {selectedMonths === opt.value && (
                                        <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 leading-tight">
                                    {opt.description}
                                </p>
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                        <div className="flex justify-between items-center text-sm mb-2">
                            <span className="text-slate-600 font-medium font-serif">Plan Type</span>
                            <span className="text-slate-900 font-bold uppercase tracking-wider">{selectedMonths === 12 ? "Annual" : "Standard"}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-600 font-medium font-serif">Validity</span>
                            <span className="text-slate-900 font-bold uppercase tracking-wider">30 Days from approval</span>
                        </div>
                    </div>

                    <button
                        onClick={() => onSelect(selectedMonths)}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 group"
                    >
                        Proceed to Payment
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
