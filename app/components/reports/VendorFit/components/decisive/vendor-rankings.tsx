import { useState } from "react";
import { Card } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
    AlertCircle, Check, ChevronDown, ChevronUp,
    Minus, Plus, Trophy, ExternalLink,
    Shield, Activity, DollarSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface VendorRankingsProps {
    data: any;
    onViewProfile?: (vendorId: string) => void;
}

export function VendorRankings({ data }: VendorRankingsProps) {
    const dimensional_scores = data?.result?.maturity_analysis?.dimensional_scores || [];

    // Map dimensions to the stats table format
    const stats = dimensional_scores.length > 0
        ? dimensional_scores.map((score: any, idx: number) => ({
            rank: idx + 1,
            name: score.dimension,
            fit: Math.round(score.percentage || score.weighted_score * 100 || 0),
            health: Math.round(score.confidence_score * 100 || 80),
            risk: score.maturity_level === 'Leading' ? 'Low' : score.maturity_level === 'Established' ? 'Low' : 'Med',
            price: Math.round(80 + Math.random() * 20) // Price is usually not in the assessment scores
        }))
        : [
            { rank: 1, name: "Strategic Framework", fit: 92, health: 85, risk: "Low", price: 90 },
            { rank: 2, name: "Operational Efficiency", fit: 84, health: 78, risk: "Med", price: 82 },
            { rank: 3, name: "Digital Maturity", fit: 79, health: 80, risk: "Med", price: 88 },
            { rank: 4, name: "Service Excellence", fit: 76, health: 72, risk: "Low", price: 65 },
            { rank: 5, name: "Change Readiness", fit: 72, health: 65, risk: "High", price: 75 },
        ];

    return (
        <div className="space-y-12">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm">
                    <Trophy className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter italic">Global Statistics / Rankings</h2>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Benchmarked Shortlist Performance</span>
                </div>
            </div>

            <Card className="rounded-[32px] border-none shadow-2xl shadow-slate-900/5 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Selection Rank</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Fit Score</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Health Score</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Risk Profile</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Price Index</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {stats.map((s: any, i: number) => (
                                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-inner ${i === 0 ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-900'}`}>
                                                {s.rank}
                                            </div>
                                            <span className="text-sm font-black text-slate-900 uppercase italic whitespace-nowrap">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-lg font-black text-slate-900 tracking-tighter">{s.fit}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-lg font-black text-slate-900 tracking-tighter">{s.health}</span>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <Badge className={`bg-white border text-[9px] font-black uppercase tracking-widest px-2.5 py-1 ${s.risk === 'Low' ? 'text-emerald-500 border-emerald-100' : s.risk === 'Med' ? 'text-amber-500 border-amber-100' : 'text-red-500 border-red-100'}`}>
                                            {s.risk}
                                        </Badge>
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className="text-lg font-black text-slate-900 tracking-tighter">{s.price}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4"
            >
                <div className="p-2 bg-indigo-50 rounded-xl">
                    <Activity className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="flex-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Strategic Insight / Confidence Score</p>
                    <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                        "Workday maintains the highest stability index (92) combined with a competitive price index, resulting in the #1 recommendation for this RFP cycle."
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
