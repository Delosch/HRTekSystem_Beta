import { Badge } from "~/components/ui/badge";
import { ChevronRight, Globe, Clock, Shield, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
    data: any;
    onGenerateDossier?: () => void;
    progress?: number;
}

export function DashboardHeader({ data, onGenerateDossier, progress = 0 }: DashboardHeaderProps) {
    const orgName = data?.profile?.organizationName || "Your Organization";

    return (
        <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-8 py-4 sticky top-0 z-50 shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 pr-8 border-r border-slate-200"
                    >
                        <img src="/hrtek_logo.png" alt="HRTek" className="h-9 w-auto object-contain" />
                        <div className="flex flex-col">
                            <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Vendor Fit</h1>
                            <span className="text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mt-1">Intelligence Engine</span>
                        </div>
                    </motion.div>

                    <div className="hidden lg:flex flex-col justify-center gap-1">
                        <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">
                            <span>Analysis Architecture</span>
                            <ChevronRight className="w-2.5 h-2.5" />
                            <span className="text-slate-300 italic">{orgName}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-orange-500" />
                            Live Vendor Comparison • ID: VF-SEL-2026
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="hidden md:flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Capture Rate</span>
                            <span className="text-xs font-black text-orange-600 italic">{progress}%</span>
                        </div>
                        <div className="h-1.5 w-40 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200/50">
                            <motion.div 
                                initial={{ width: 0 }} 
                                animate={{ width: `${progress}%` }} 
                                className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.3)]" 
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={onGenerateDossier}
                            className="group relative h-12 bg-slate-900 overflow-hidden text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center gap-2">
                                Export Report
                                <Sparkles className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" />
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
}
