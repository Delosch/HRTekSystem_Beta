import React from 'react';
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
    Sparkles, ArrowRightLeft, ShieldCheck,
    TrendingDown, Scale, CheckCircle2,
    Trophy, Info, BarChart3, AlertCircle,
    ChevronRight, Zap, Globe, Cpu
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ExecutiveVerdictProps {
    data: any;
}

export function ExecutiveVerdict({ data }: ExecutiveVerdictProps) {
    const defaultVendors = [
        { category: "Workday", fitScore: 92, riskFlags: ["Low Risk"], reasons: ["Global compliance", "Unified data"], status: 'Market Leader' },
        { category: "SAP SuccessFactors", fitScore: 84, riskFlags: ["Medium Risk"], reasons: ["ERP Integration", "Payroll depth"], status: 'Enterprise Scale' },
        { category: "Oracle HCM Cloud", fitScore: 79, riskFlags: ["Medium Risk"], reasons: ["Org modelling", "Complexity"], status: 'Capability Depth' },
    ];
    const raw = data?.vendorRecommendations;
    const vendors = Array.isArray(raw) && raw.length > 0 ? raw : defaultVendors;

    return (
        <div className="space-y-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-slate-200">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest">
                        <Trophy className="w-3 h-3 text-orange-400" />
                        Executive Shortlist
                    </div>
                    <h2 className="text-5xl font-black text-slate-900 uppercase tracking-tighter italic leading-none">
                        Exposure <span className="text-blue-600">Profile</span>
                    </h2>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em]">
                        Validated Vendor Nominees based on 142 selection parameters
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="px-6 py-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Top Alignment</p>
                        <p className="text-lg font-black text-slate-900 uppercase italic leading-none">Primary: {vendors[0]?.category || 'Primary Vendor'}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {vendors.slice(0, 3).map((v: any, i: number) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.15, duration: 0.6 }}
                    >
                        <Card className={`relative overflow-hidden rounded-[48px] border-none shadow-2xl transition-all duration-500 group ${i === 0 ? 'bg-slate-900 text-white shadow-blue-900/20' : 'bg-white text-slate-900 shadow-slate-200'}`}>
                            {/* Accent Background for Top Pick */}
                            {i === 0 && (
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
                            )}

                            <div className="p-10 relative z-10 space-y-10">
                                {/* Header */}
                                <div className="flex justify-between items-start">
                                    <div className="space-y-3">
                                        <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center font-black text-3xl shadow-xl ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-900 text-white'}`}>
                                            {v.category?.charAt(0) || 'V'}
                                        </div>
                                        <div className="space-y-1">
                                            <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-tight">{v.category || 'Vendor'}</h3>
                                            <p className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-blue-400' : 'text-slate-400'}`}>
                                                {v.status || 'Strategic Nominee'}
                                            </p>
                                        </div>
                                    </div>
                                    <Badge className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest border-none ${i === 0 ? 'bg-blue-600/20 text-blue-400' : 'bg-slate-100 text-slate-500'}`}>
                                        Nominee #{i + 1}
                                    </Badge>
                                </div>

                                {/* Main Score */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${i === 0 ? 'text-slate-400' : 'text-slate-400'}`}>Strategic Fit Index</span>
                                        <span className={`text-4xl font-black italic ${i === 0 ? 'text-white' : 'text-blue-600'}`}>{v.fitScore}%</span>
                                    </div>
                                    <div className={`h-2 w-full rounded-full overflow-hidden ${i === 0 ? 'bg-slate-800' : 'bg-slate-100'}`}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${v.fitScore}%` }}
                                            className={`h-full rounded-full ${i === 0 ? 'bg-blue-500' : 'bg-blue-600'}`}
                                        />
                                    </div>
                                </div>

                                {/* Sub-Metrics Grid */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={`p-5 rounded-[32px] border ${i === 0 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Cpu className={`w-3.5 h-3.5 ${i === 0 ? 'text-blue-400' : 'text-blue-600'}`} />
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Tech Fit</span>
                                        </div>
                                        <p className="text-sm font-black italic uppercase italic">Enterprise</p>
                                    </div>
                                    <div className={`p-5 rounded-[32px] border ${i === 0 ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Globe className={`w-3.5 h-3.5 ${i === 0 ? 'text-emerald-400' : 'text-emerald-600'}`} />
                                            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Reach</span>
                                        </div>
                                        <p className="text-sm font-black italic uppercase italic">Global</p>
                                    </div>
                                </div>

                                {/* Key Reasons */}
                                <div className={`pt-8 border-t ${i === 0 ? 'border-slate-800' : 'border-slate-100'}`}>
                                    <p className={`text-xs font-bold leading-relaxed italic ${i === 0 ? 'text-slate-400' : 'text-slate-500'}`}>
                                        "{v.reasons?.[0] || 'Top alignment for global scale with native HR tech architecture.'}"
                                    </p>
                                </div>

                                <button className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 ${i === 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-900 text-white hover:bg-black'}`}>
                                    View Full Analysis
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Strategic Comparison Note */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex items-start gap-6"
            >
                <div className="p-4 bg-white rounded-2xl shadow-sm">
                    <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exposure Analysis Note</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        "The primary selection differentiator across the top three candidates relates to the depth of native AI integration—{vendors[0]?.category || 'Primary Vendor'} currently leads with its 'Human Capital Brain' architecture."
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
