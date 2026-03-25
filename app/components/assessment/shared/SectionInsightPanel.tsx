/**
 * SectionInsightPanel — shared premium section analytics widget.
 *
 * Used by: AiMaturity, DigitalRoadmap (and any future engine that wants
 * the VendorFit-style Intelligence Insights block after each section).
 *
 * Props:
 *   sectionNumber  – 1-indexed section number (for gradient IDs + header)
 *   total          – total questions in this section
 *   answered       – how many of those questions have been answered
 *   avgScore       – optional 0-10 numeric average (pass null to show richness instead)
 *   richLabel      – 'Rich' | 'Partial' | 'Sparse' (used when avgScore is null)
 *   label          – section label shown in the header (e.g. section title)
 */

import { motion } from "framer-motion";
import { Brain, CheckCircle2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface SectionInsightPanelProps {
    sectionNumber: number;
    total: number;
    answered: number;
    /** Optional 0–10 avg. score. Pass null/undefined to show "Data Richness" instead. */
    avgScore?: number | null;
    label: string;
}

export function SectionInsightPanel({
    sectionNumber,
    total,
    answered,
    avgScore,
    label,
}: SectionInsightPanelProps) {
    if (answered === 0) return null;

    const completionPct = total > 0 ? Math.min(100, Math.round((answered / total) * 100)) : 0;
    const remaining = total - answered;
    const sid = sectionNumber;
    const circ = 2 * Math.PI * 42;

    // Coverage tier
    const coverageTier = completionPct >= 80 ? "High" : completionPct >= 50 ? "Medium" : "Low";
    const coverageColor = coverageTier === "High" ? "#10b981" : coverageTier === "Medium" ? "#f59e0b" : "#ef4444";
    const coverageColor2 = coverageTier === "High" ? "#059669" : coverageTier === "Medium" ? "#d97706" : "#dc2626";
    const coverageSub =
        coverageTier === "High" ? "Strong quality" : coverageTier === "Medium" ? "Partially complete" : "Needs more answers";

    // Remaining
    const remPct = remaining === 0 ? 100 : completionPct;
    const remColor = remaining === 0 ? "#10b981" : "#f59e0b";
    const remColor2 = remaining === 0 ? "#059669" : "#d97706";

    // Scale score (avg 0-10 or richness)
    const scaleHealthPct = avgScore != null ? Math.round((avgScore / 10) * 100) : null;
    const richLabel =
        completionPct >= 80 ? "Rich" : completionPct >= 50 ? "Partial" : "Sparse";
    const scaleSub =
        scaleHealthPct != null
            ? (scaleHealthPct >= 70 ? "Strong tendency" : scaleHealthPct >= 40 ? "Moderate" : "Low tendency")
            : (completionPct >= 80 ? "Excellent quality" : "Keep answering");

    // Bar chart data
    const typeBarData = [
        { name: "Answered", answered, remaining: 0 },
        { name: "Remaining", answered: 0, remaining },
    ].filter((d) => d.answered + d.remaining > 0);

    // A simpler bar: answered vs remaining
    const barData = [{ name: label.slice(0, 12), answered, remaining }];

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="mt-12 space-y-6"
        >
            {/* ── Header ── */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-2xl shadow-lg shadow-indigo-200">
                        <Brain className="w-5 h-5" />
                    </div>
                    <div>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] block mb-0.5">
                            Section 0{sectionNumber} Analysis
                        </span>
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">
                            Intelligence Insights
                        </h3>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black text-emerald-700 uppercase tracking-widest">Audit Active</span>
                    </div>
                    <span
                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg text-white ${
                            completionPct >= 80
                                ? "bg-emerald-600 shadow-emerald-200"
                                : completionPct >= 50
                                ? "bg-indigo-600 shadow-indigo-200"
                                : "bg-amber-500 shadow-amber-200"
                        }`}
                    >
                        Completion: {completionPct}%
                    </span>
                </div>
            </div>

            {/* ── Stat Cards Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {/* Box 1 · Completion */}
                <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-lg shadow-indigo-200/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-300/50 transition-all duration-300">
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.25em] relative z-10">Section Completion</span>
                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white leading-none">{completionPct}<span className="text-xl ml-0.5 text-indigo-200">%</span></div>
                        <div className="text-[10px] font-bold text-indigo-200 mt-1">{answered} of {total} answered</div>
                    </div>
                </div>

                {/* Box 2 · Coverage Tier */}
                <div className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${
                    coverageTier === "High"
                        ? "bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-emerald-200/50 hover:shadow-emerald-300/50"
                        : coverageTier === "Medium"
                        ? "bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-amber-200/50 hover:shadow-amber-300/50"
                        : "bg-gradient-to-br from-red-400 via-red-500 to-rose-600 shadow-red-200/50 hover:shadow-red-300/50"
                }`}>
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.25em] relative z-10">Response Coverage</span>
                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white leading-none uppercase">{coverageTier}</div>
                        <div className="text-[10px] font-bold text-white/80 mt-1">{coverageSub}</div>
                    </div>
                </div>

                {/* Box 3 · Scale/Richness */}
                {avgScore != null ? (
                    <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-200/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-300/50 transition-all duration-300">
                        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                        <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                        <span className="text-[9px] font-black text-cyan-100 uppercase tracking-[0.25em] relative z-10">Avg Score</span>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-white leading-none">{avgScore.toFixed(1)}<span className="text-xl ml-0.5 text-cyan-200">/10</span></div>
                            <div className="text-[10px] font-bold text-cyan-100 mt-1">{scaleSub}</div>
                        </div>
                    </div>
                ) : (
                    <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] bg-gradient-to-br from-slate-600 via-slate-700 to-slate-900 shadow-lg shadow-slate-300/30 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                        <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.25em] relative z-10">Data Richness</span>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-white leading-none uppercase">{richLabel}</div>
                            <div className="text-[10px] font-bold text-slate-300 mt-1">{completionPct >= 80 ? "Excellent quality" : "Keep answering"}</div>
                        </div>
                    </div>
                )}

                {/* Box 4 · Remaining */}
                <div className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${
                    remaining === 0
                        ? "bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 shadow-emerald-200/50 hover:shadow-emerald-300/50"
                        : "bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 shadow-amber-200/50 hover:shadow-amber-300/50"
                }`}>
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.25em] relative z-10">Remaining</span>
                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white leading-none">{remaining === 0 ? "✓" : remaining}</div>
                        <div className="text-[10px] font-bold text-white/80 mt-1">{remaining === 0 ? "All complete!" : `${remaining} question${remaining > 1 ? "s" : ""} left`}</div>
                    </div>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-3">Detailed Analysis</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            {/* ── Circular Metrics Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
                {/* 1 · Section Completion */}
                <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Section Completion</span>
                    <div className="relative w-[110px] h-[110px]">
                        <svg width="110" height="110" className="-rotate-90">
                            <defs>
                                <linearGradient id={`cg-ind-${sid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#8b5cf6" />
                                </linearGradient>
                            </defs>
                            <circle cx="55" cy="55" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                            <circle cx="55" cy="55" r="42" fill="none"
                                stroke={`url(#cg-ind-${sid})`} strokeWidth="10"
                                strokeDasharray={`${circ} ${circ}`}
                                strokeDashoffset={circ * (1 - completionPct / 100)}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-indigo-600 leading-none">{answered}</span>
                            <span className="text-[11px] font-bold text-slate-400 leading-none mt-0.5">/ {total}</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-[9px] font-black text-indigo-600 uppercase tracking-wider">{completionPct}% done</span>
                        <div className="w-full h-1 bg-indigo-100 rounded-full mt-1.5 overflow-hidden">
                            <div className="h-full bg-indigo-500 rounded-full transition-all duration-700" style={{ width: `${completionPct}%` }} />
                        </div>
                    </div>
                </div>

                {/* 2 · Response Coverage */}
                <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Response Coverage</span>
                    <div className="relative w-[110px] h-[110px]">
                        <svg width="110" height="110" className="-rotate-90">
                            <defs>
                                <linearGradient id={`cg-cov-${sid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={coverageColor} />
                                    <stop offset="100%" stopColor={coverageColor2} />
                                </linearGradient>
                            </defs>
                            <circle cx="55" cy="55" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                            <circle cx="55" cy="55" r="42" fill="none"
                                stroke={`url(#cg-cov-${sid})`} strokeWidth="10"
                                strokeDasharray={`${circ} ${circ}`}
                                strokeDashoffset={circ * (1 - completionPct / 100)}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-black uppercase leading-none" style={{ color: coverageColor }}>{coverageTier}</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: coverageColor }}>{coverageSub}</span>
                    </div>
                </div>

                {/* 3 · Remaining */}
                <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Remaining</span>
                    <div className="relative w-[110px] h-[110px]">
                        <svg width="110" height="110" className="-rotate-90">
                            <defs>
                                <linearGradient id={`cg-rem-${sid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={remColor} />
                                    <stop offset="100%" stopColor={remColor2} />
                                </linearGradient>
                            </defs>
                            <circle cx="55" cy="55" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                            <circle cx="55" cy="55" r="42" fill="none"
                                stroke={`url(#cg-rem-${sid})`} strokeWidth="10"
                                strokeDasharray={`${circ} ${circ}`}
                                strokeDashoffset={circ * (1 - remPct / 100)}
                                strokeLinecap="round"
                                style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {remaining === 0
                                ? <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                                : <span className="text-3xl font-black text-amber-500 leading-none">{remaining}</span>
                            }
                        </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-center" style={{ color: remColor }}>
                        {remaining === 0 ? "All complete!" : `${remaining} question${remaining > 1 ? "s" : ""} left`}
                    </span>
                </div>
            </div>

            {/* ── Progress Bar Chart ── */}
            <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Section Response Coverage
                    </span>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-indigo-500" />
                            <span className="text-[9px] font-black text-slate-400 uppercase">Answered</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-slate-200" />
                            <span className="text-[9px] font-black text-slate-400 uppercase">Remaining</span>
                        </div>
                    </div>
                </div>
                <div className="h-[100px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData} margin={{ top: 0, right: 10, left: -30, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 700 }} />
                            <Tooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }} />
                            <Bar dataKey="answered" name="Answered" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={48} stackId="a" />
                            <Bar dataKey="remaining" name="Remaining" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={48} stackId="a" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </motion.div>
    );
}
