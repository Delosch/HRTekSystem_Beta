import { Button } from "~/components/ui/button";
import { Sparkles, DollarSign, Zap, Scale, Trophy, Medal, AlertCircle, TrendingDown, Target, Lightbulb, Boxes, Shield } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "~/components/ui/badge";

export function StrategicTradeoffs({ data }: { data: any }) {
    const [scenario, setScenario] = useState<"cost" | "innovation">("innovation");

    return (
        <motion.section
            id="decision-tradeoffs"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-12"
        >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 mb-4 px-4 py-1.5 text-xs font-black uppercase tracking-widest">
                        Decision Framework
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                        Strategic <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Equilibrium</span>
                    </h2>
                </div>
                <div className="flex bg-slate-900/50 backdrop-blur-md p-1 rounded-2xl border border-white/5">
                    <button
                        onClick={() => setScenario("innovation")}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scenario === "innovation"
                            ? "bg-purple-600 text-white shadow-lg shadow-purple-500/20"
                            : "text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <Zap className="w-3.5 h-3.5" />
                            Innovation Mode
                        </div>
                    </button>
                    <button
                        onClick={() => setScenario("cost")}
                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${scenario === "cost"
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                            : "text-slate-500 hover:text-slate-300"
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-3.5 h-3.5" />
                            Cost Mode
                        </div>
                    </button>
                </div>
            </div>

            <div className="bg-slate-950/40 backdrop-blur-xl rounded-[40px] border border-white/5 p-8 md:p-12 shadow-2xl relative overflow-hidden">
                {/* Background Decorative */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />

                <AnimatePresence mode="wait">
                    {scenario === "innovation" ? (
                        <motion.div
                            key="innovation"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-12"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                                <div className="space-y-8">
                                    <div className="p-8 bg-slate-900/60 rounded-[32px] border-l-4 border-purple-500 shadow-xl relative group overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10">
                                            <Trophy className="w-24 h-24 text-white" />
                                        </div>
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="p-3 bg-purple-500/20 rounded-2xl">
                                                <Trophy className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <div>
                                                <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Vendor A</h4>
                                                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Recommended Winner</p>
                                            </div>
                                        </div>

                                        <ul className="space-y-4">
                                            {[
                                                { icon: Zap, text: "AI-powered predictive modeling engine", highlight: "Proprietary" },
                                                { icon: Boxes, text: "Native integrations across HR stack", highlight: "$25k Saved" },
                                                { icon: Shield, text: "Future-proof microservices architecture", highlight: "Tier-1" },
                                                { icon: Target, text: "Best-in-class mobile experience", highlight: "98% Rating" },
                                            ].map((item, idx) => (
                                                <li key={idx} className="flex items-start gap-4">
                                                    <div className="p-1.5 bg-slate-800 rounded-lg mt-0.5">
                                                        <item.icon className="w-3 h-3 text-slate-300" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-slate-200 font-bold tracking-tight">{item.text}</p>
                                                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">{item.highlight}</span>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="mt-8 pt-8 border-t border-white/5 flex items-baseline justify-between">
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">3-Year Projected TCO</span>
                                            <span className="text-4xl font-black text-white tracking-widest">$450k</span>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-900/40 rounded-[32px] border border-white/5 opacity-60 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                                        <div className="flex items-center gap-3 mb-4">
                                            <Medal className="w-5 h-5 text-slate-500" />
                                            <h4 className="text-lg font-black text-slate-400 uppercase tracking-tighter">Vendor B</h4>
                                        </div>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mb-4">Runner Up • Cost Optimized Alternative</p>
                                        <div className="flex items-baseline justify-between">
                                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest italic">Sacrifices innovation for $30k savings</span>
                                            <span className="text-2xl font-black text-slate-400 tracking-widest">$420k</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-6">
                                    <div className="p-10 bg-gradient-to-br from-purple-600/20 to-indigo-600/20 rounded-[40px] border border-purple-500/20 relative group">
                                        <div className="absolute top-0 right-0 p-8">
                                            <Lightbulb className="w-16 h-16 text-purple-500/20 group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-6">
                                            The <span className="text-purple-400 underline decoration-purple-600/50">Verdict</span>
                                        </h3>
                                        <p className="text-slate-300 text-sm leading-relaxed mb-8">
                                            Focusing on <strong>long-term value</strong>, Vendor A is the superior fit. The $30k cost difference is easily offset by native integrations ($25k) and AI-driven efficiency gains projected at <span className="text-purple-400 font-black">$120k over 24 months</span>.
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="p-4 bg-purple-500 rounded-2xl shadow-lg shadow-purple-500/20">
                                                <Sparkles className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Impact Multiplier</p>
                                                <p className="text-xl font-black text-white tracking-widest">4.5x ROI</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-slate-900/30 rounded-3xl border border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Scale className="w-5 h-5 text-slate-500" />
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strategic Alignment Rating</span>
                                        </div>
                                        <div className="flex gap-1.5">
                                            {[1, 2, 3, 4, 5].map(i => <div key={i} className={`w-3 h-3 rounded-sm ${i <= 3 ? 'bg-purple-500' : 'bg-slate-800'}`} />)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="cost"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-12 py-12 text-center max-w-4xl mx-auto"
                        >
                            <div className="inline-flex p-6 bg-blue-500/10 rounded-[32px] mb-8">
                                <DollarSign className="w-20 h-20 text-blue-500" />
                            </div>
                            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase mb-6 italic">
                                Cost-Optimized View: <span className="text-blue-500">Vendor B</span>
                            </h3>
                            <p className="text-slate-400 text-lg leading-relaxed mb-12 uppercase font-bold tracking-widest text-[11px] max-w-2xl mx-auto">
                                If prioritizing <strong className="text-white">lowest initial TCO</strong>, Vendor B offers $30k in day-one savings. However, this introduces hidden remediation costs and structural compliance gaps.
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="p-8 bg-slate-900/40 rounded-[32px] border-b-4 border-emerald-500 shadow-xl">
                                    <p className="text-4xl font-black text-emerald-400 tracking-tighter mb-2">$30k</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Initial Savings</p>
                                </div>
                                <div className="p-8 bg-slate-900/40 rounded-[32px] border-b-4 border-red-500 shadow-xl">
                                    <p className="text-4xl font-black text-red-400 tracking-tighter mb-2">+$75k</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Hidden Liability</p>
                                </div>
                                <div className="p-8 bg-slate-900/40 rounded-[32px] border-b-4 border-amber-500 shadow-xl">
                                    <p className="text-4xl font-black text-amber-400 tracking-tighter mb-2">-30%</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Analytics Cap</p>
                                </div>
                            </div>

                            <div className="mt-12 inline-flex items-center gap-3 px-6 py-3 bg-red-500/10 border border-red-500/20 rounded-full">
                                <AlertCircle className="w-4 h-4 text-red-500" />
                                <span className="text-[10px] font-black text-red-400 uppercase tracking-widest italic decoration-dotted underline">Warning: Net result leads to higher long-term expenditure</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.section>
    );
}
