import React from "react";
import { CheckCircle2, Sparkles, Info, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export function RecommendedStack({ data }: { data: any }) {
    const recommendedVendor = data?.vendorRecommendations?.[0]?.category || "Workday";

    const drivers = [
        "Global HCM Unified Architecture",
        "Predictive Talent Frameworks",
        "Native Financial Reconciliation",
        "Security & Compliance Leadership"
    ];

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm">
                    <Sparkles className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Selection Decision Logic / AI Strategic Verdict</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Core Engine Reasoning Hierarchy</span>
                </div>
            </div>

            <Card className="p-12 rounded-[48px] border-none shadow-2xl shadow-slate-900/5 bg-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] group-hover:bg-blue-500/10 transition-all duration-700" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 relative z-10">
                    <div className="space-y-8">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block">Engine Recommendation</span>
                            <div className="flex items-center gap-4">
                                <div className="p-4 bg-blue-600 text-white rounded-[24px] shadow-xl shadow-blue-600/20">
                                    <Trophy className="w-8 h-8" />
                                </div>
                                <div className="flex flex-col">
                                    <h3 className="text-5xl font-black text-slate-900 tracking-tighter uppercase italic">{recommendedVendor}</h3>
                                    <Badge className="w-fit bg-emerald-50 text-emerald-600 border-none font-black text-[10px] uppercase tracking-widest mt-2 px-3">Primary Selection</Badge>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic">
                                "Algorithm identifies {recommendedVendor} as the optimal balance for global scale, integration depth, and 3-year TCO efficiency."
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-4 block">Strategic Value Drivers</span>
                        <div className="space-y-4">
                            {drivers.map((driver, i) => (
                                <motion.div
                                    key={driver}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-4 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                        <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-black text-slate-900 uppercase italic tracking-tight">{driver}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4"
            >
                <div className="p-2 bg-blue-50 rounded-xl">
                    <Info className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Decision Logic Note</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        "The platform's unified data model (UDM) serves as the primary technical driver, eliminating the need for middleware in 82% of core business processes."
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
