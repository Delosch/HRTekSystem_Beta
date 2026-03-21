import React, { useState } from "react";
import { X, Users, ArrowRight, Check } from "lucide-react";

const EMPLOYEE_TIERS = [
    { scale: "Small Scale",      range: "100 – 500",           value: 500 },
    { scale: "Small Scale",      range: "501 – 1,000",         value: 1000 },
    { scale: "Small Scale",      range: "1,001 – 2,000",       value: 2000 },
    { scale: "Mid Size",         range: "2,001 – 3,000",       value: 3000 },
    { scale: "Mid Size",         range: "3,001 – 4,000",       value: 4000 },
    { scale: "Mid Size",         range: "4,001 – 5,000",       value: 5000 },
    { scale: "Mid Size",         range: "5,001 – 7,500",       value: 7500 },
    { scale: "Large Scale",      range: "7,501 – 10,000",      value: 10000 },
    { scale: "Large Scale",      range: "10,001 – 15,000",     value: 15000 },
    { scale: "Large Scale",      range: "15,001 – 20,000",     value: 20000 },
    { scale: "Enterprise",       range: "20,001 – 30,000",     value: 30000 },
    { scale: "Enterprise",       range: "30,001 – 40,000",     value: 40000 },
    { scale: "Enterprise",       range: "40,001 – 50,000",     value: 50000 },
    { scale: "Conglomerate",     range: "50,001 – 70,000",     value: 70000 },
    { scale: "Conglomerate",     range: "70,001 – 1,00,000",   value: 100000 },
    { scale: "Conglomerate",     range: "1,00,001 – 1,50,000", value: 150000 },
    { scale: "Conglomerate",     range: "1,50,001 – 2,00,000+",value: 200000 },
];

const SCALE_COLORS: Record<string, string> = {
    "Small Scale":  "bg-emerald-100 text-emerald-700",
    "Mid Size":     "bg-blue-100 text-blue-700",
    "Large Scale":  "bg-violet-100 text-violet-700",
    "Enterprise":   "bg-orange-100 text-orange-700",
    "Conglomerate": "bg-rose-100 text-rose-700",
};

interface EmployeeSizeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (employeeCount: number) => void;
}

export default function EmployeeSizeModal({ isOpen, onClose, onSelect }: EmployeeSizeModalProps) {
    const [selected, setSelected] = useState<number | null>(null);

    if (!isOpen) return null;

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
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-blue-100 rounded-2xl text-blue-600">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Organisation Size</h2>
                            <p className="text-slate-500 text-sm">Select your employee headcount for accurate pricing</p>
                        </div>
                    </div>

                    <p className="text-xs text-slate-400 mb-4">
                        Pricing is calculated per employee based on your organisation's scale.
                    </p>

                    <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1 mb-6 scrollbar-thin">
                        {EMPLOYEE_TIERS.map((tier) => {
                            const isSelected = selected === tier.value;
                            return (
                                <button
                                    key={tier.value}
                                    onClick={() => setSelected(tier.value)}
                                    className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between gap-3 ${
                                        isSelected
                                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                                            : "border-slate-100 hover:border-slate-200 bg-white"
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`text-sm font-semibold ${isSelected ? "text-blue-800" : "text-slate-800"}`}>
                                            {tier.range} Employees
                                        </span>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${SCALE_COLORS[tier.scale]}`}>
                                            {tier.scale}
                                        </span>
                                    </div>
                                    {isSelected && (
                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {selected && (
                        <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-3 mb-5 flex items-center justify-between">
                            <span className="text-sm text-blue-700 font-medium">Selected:</span>
                            <span className="text-sm font-bold text-blue-900">
                                {EMPLOYEE_TIERS.find(t => t.value === selected)?.range} Employees
                            </span>
                        </div>
                    )}

                    <button
                        onClick={() => selected && onSelect(selected)}
                        disabled={!selected}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2 group"
                    >
                        Confirm & Proceed to Payment
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
    );
}
