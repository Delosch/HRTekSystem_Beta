import { useState, useRef, useCallback, useEffect } from "react";
import { useFetcher, useLocation, useNavigate } from "@remix-run/react";
import { AnimatePresence, motion } from "framer-motion";
import {
    CheckCircle2, Circle, ChevronRight, Menu, X,
    ArrowLeft, ArrowRight, Save, BarChart3, Target,
    Brain, Activity, TrendingUp, TrendingDown, AlertTriangle
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { QuestionSchema } from "~/routes/engine.$id/questionSchema";
import { ExecutiveAdvisory } from "~/components/SharedServicesEngine/components/ExecutiveAdvisory";
import { Sparkles, Loader2, Download } from "lucide-react";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";

// ── Section Insights component for Vendor Fit ──────────────────────────────
// Colour tokens per question type (for per-type progress bars)
const TYPE_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
    radio:    { bar: 'bg-indigo-500',  text: 'text-indigo-700',  bg: 'bg-indigo-50'  },
    checkbox: { bar: 'bg-violet-500',  text: 'text-violet-700',  bg: 'bg-violet-50'  },
    scale:    { bar: 'bg-cyan-500',    text: 'text-cyan-700',    bg: 'bg-cyan-50'    },
    text:     { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    textarea: { bar: 'bg-teal-500',    text: 'text-teal-700',    bg: 'bg-teal-50'    },
    dropdown: { bar: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50'    },
    other:    { bar: 'bg-slate-400',   text: 'text-slate-600',   bg: 'bg-slate-50'   },
};

function VendorFitSectionInsights({
    questions,
    formData,
    sectionNumber,
}: {
    questions: any[];
    formData: Record<string, any>;
    sectionNumber: number;
}) {
    const isAnswered = (q: any) => {
        const v = formData[q.id];
        if (v === undefined || v === "" || v === null) return false;
        if (Array.isArray(v) && v.length === 0) return false;
        return true;
    };

    const total = questions.length;
    const answeredCount = questions.filter(isAnswered).length;
    const completionPct = total > 0 ? Math.min(100, Math.round((answeredCount / total) * 100)) : 0;
    const remaining = total - answeredCount;

    if (answeredCount === 0) return null;

    // Scale questions (1-10) — compute average
    const scaleQs = questions.filter(q => q.type === "scale" && formData[q.id] !== undefined);
    const avgScale = scaleQs.length > 0
        ? scaleQs.reduce((s, q) => s + (formData[q.id] ?? 0), 0) / scaleQs.length
        : null;
    const scaleHealthPct = avgScale !== null ? Math.round((avgScale / 10) * 100) : null;

    // Per-type breakdown
    const typeGroups: Record<string, { total: number; answered: number }> = {};
    questions.forEach(q => {
        const t = q.type || "other";
        if (!typeGroups[t]) typeGroups[t] = { total: 0, answered: 0 };
        typeGroups[t].total++;
        if (isAnswered(q)) typeGroups[t].answered++;
    });

    const typeBarData = Object.entries(typeGroups).map(([type, { total: t, answered: a }]) => ({
        name: type.charAt(0).toUpperCase() + type.slice(1),
        answered: a,
        remaining: t - a,
    }));

    // Required fields
    const unansweredRequired = questions.filter(q => q.required && !isAnswered(q));
    const allRequiredDone = unansweredRequired.length === 0;

    // Coverage tier
    const coverageTier = completionPct >= 80 ? 'High' : completionPct >= 50 ? 'Medium' : 'Low';

    const circ = 2 * Math.PI * 42;
    const coverageColor = coverageTier === 'High' ? '#10b981' : coverageTier === 'Medium' ? '#f59e0b' : '#ef4444';
    const coverageColor2 = coverageTier === 'High' ? '#059669' : coverageTier === 'Medium' ? '#d97706' : '#dc2626';
    const coverageSub = coverageTier === 'High' ? 'Strong quality' : coverageTier === 'Medium' ? 'Partially complete' : 'Needs more answers';
    const reqTotal = questions.filter((q: any) => q.required).length;
    const reqDone = reqTotal - unansweredRequired.length;
    const reqPct = reqTotal > 0 ? Math.round((reqDone / reqTotal) * 100) : 100;
    const reqColor = allRequiredDone ? '#10b981' : '#ef4444';
    const reqColor2 = allRequiredDone ? '#059669' : '#dc2626';
    const richLabel = completionPct >= 80 ? 'Rich' : completionPct >= 50 ? 'Partial' : 'Sparse';
    const remPct = remaining === 0 ? 100 : completionPct;
    const remColor = remaining === 0 ? '#10b981' : '#f59e0b';
    const remColor2 = remaining === 0 ? '#059669' : '#d97706';
    const scaleSub = (scaleHealthPct ?? 0) >= 70 ? 'Strong tendency' : (scaleHealthPct ?? 0) >= 40 ? 'Moderate' : 'Low tendency';
    const sid = sectionNumber; // short alias for gradient IDs

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
                    <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg ${completionPct >= 80 ? 'bg-emerald-600 shadow-emerald-200' : completionPct >= 50 ? 'bg-indigo-600 shadow-indigo-200' : 'bg-amber-500 shadow-amber-200'} text-white`}>
                        Completion: {completionPct}%
                    </span>
                </div>
            </div>

            {/* ── Boxed Summary Cards Row ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {/* Box 1 · Completion */}
                <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] bg-gradient-to-br from-indigo-500 via-indigo-600 to-violet-700 shadow-lg shadow-indigo-200/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-300/50 transition-all duration-300">
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black text-indigo-200 uppercase tracking-[0.25em] relative z-10">Section Completion</span>
                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white leading-none">{completionPct}<span className="text-xl ml-0.5 text-indigo-200">%</span></div>
                        <div className="text-[10px] font-bold text-indigo-200 mt-1">{answeredCount} of {total} answered</div>
                    </div>
                </div>

                {/* Box 2 · Coverage Tier */}
                <div className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${coverageTier === 'High' ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 shadow-emerald-200/50 hover:shadow-emerald-300/50' : coverageTier === 'Medium' ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-500 shadow-amber-200/50 hover:shadow-amber-300/50' : 'bg-gradient-to-br from-red-400 via-red-500 to-rose-600 shadow-red-200/50 hover:shadow-red-300/50'}`}>
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.25em] relative z-10">Response Coverage</span>
                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white leading-none uppercase">{coverageTier}</div>
                        <div className="text-[10px] font-bold text-white/80 mt-1">{coverageSub}</div>
                    </div>
                </div>

                {/* Box 3 · Avg Scale / Data Richness */}
                {avgScale !== null ? (
                    <div className="relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 shadow-lg shadow-cyan-200/50 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-300/50 transition-all duration-300">
                        <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                        <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                        <span className="text-[9px] font-black text-cyan-100 uppercase tracking-[0.25em] relative z-10">Avg Scale Score</span>
                        <div className="relative z-10">
                            <div className="text-4xl font-black text-white leading-none">{avgScale.toFixed(1)}<span className="text-xl ml-0.5 text-cyan-200">/10</span></div>
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
                            <div className="text-[10px] font-bold text-slate-300 mt-1">{completionPct >= 80 ? 'Excellent quality' : 'Keep answering'}</div>
                        </div>
                    </div>
                )}

                {/* Box 4 · Remaining */}
                <div className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${remaining === 0 ? 'bg-gradient-to-br from-emerald-400 via-emerald-500 to-green-600 shadow-emerald-200/50 hover:shadow-emerald-300/50' : 'bg-gradient-to-br from-amber-400 via-orange-400 to-orange-500 shadow-amber-200/50 hover:shadow-amber-300/50'}`}>
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.25em] relative z-10">Remaining</span>
                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white leading-none">{remaining === 0 ? '✓' : remaining}</div>
                        <div className="text-[10px] font-bold text-white/80 mt-1">{remaining === 0 ? 'All complete!' : `${remaining} question${remaining > 1 ? 's' : ''} left`}</div>
                    </div>
                </div>

                {/* Box 5 · Required Fields */}
                <div className={`relative overflow-hidden rounded-2xl p-5 flex flex-col justify-between min-h-[110px] shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 ${allRequiredDone ? 'bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-700 shadow-emerald-200/50 hover:shadow-emerald-300/50' : 'bg-gradient-to-br from-red-400 via-red-500 to-rose-700 shadow-red-200/50 hover:shadow-red-300/50'}`}>
                    <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-white/10" />
                    <div className="absolute -bottom-3 -left-3 w-14 h-14 rounded-full bg-white/10" />
                    <span className="text-[9px] font-black text-white/70 uppercase tracking-[0.25em] relative z-10">Required Fields</span>
                    <div className="relative z-10">
                        <div className="text-4xl font-black text-white leading-none">{allRequiredDone ? '✓' : unansweredRequired.length}</div>
                        <div className="text-[10px] font-bold text-white/80 mt-1">{allRequiredDone ? 'Ready to proceed' : 'Complete before next'}</div>
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
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">

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
                                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-indigo-600 leading-none">{answeredCount}</span>
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
                                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-black uppercase leading-none" style={{ color: coverageColor }}>{coverageTier}</span>
                        </div>
                    </div>
                    <div className="text-center">
                        <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: coverageColor }}>{coverageSub}</span>
                        {unansweredRequired.length > 0 && (
                            <div className="mt-1 px-2 py-0.5 rounded-full inline-block" style={{ backgroundColor: `${coverageColor}20` }}>
                                <span className="text-[8px] font-black" style={{ color: coverageColor }}>{unansweredRequired.length} req. pending</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3 · Avg Scale Score / Data Richness */}
                {avgScale !== null ? (
                    <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Avg Scale Score</span>
                        <div className="relative w-[110px] h-[110px]">
                            <svg width="110" height="110" className="-rotate-90">
                                <defs>
                                    <linearGradient id={`cg-scl-${sid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#06b6d4" />
                                        <stop offset="100%" stopColor="#3b82f6" />
                                    </linearGradient>
                                </defs>
                                <circle cx="55" cy="55" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                <circle cx="55" cy="55" r="42" fill="none"
                                    stroke={`url(#cg-scl-${sid})`} strokeWidth="10"
                                    strokeDasharray={`${circ} ${circ}`}
                                    strokeDashoffset={circ * (1 - (scaleHealthPct ?? 0) / 100)}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-cyan-600 leading-none">{avgScale.toFixed(1)}</span>
                                <span className="text-[11px] font-bold text-slate-400 leading-none mt-0.5">/10</span>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-cyan-600 uppercase tracking-wider text-center">{scaleSub}</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Data Richness</span>
                        <div className="relative w-[110px] h-[110px]">
                            <svg width="110" height="110" className="-rotate-90">
                                <defs>
                                    <linearGradient id={`cg-rch-${sid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#1e293b" />
                                        <stop offset="100%" stopColor="#475569" />
                                    </linearGradient>
                                </defs>
                                <circle cx="55" cy="55" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                                <circle cx="55" cy="55" r="42" fill="none"
                                    stroke={`url(#cg-rch-${sid})`} strokeWidth="10"
                                    strokeDasharray={`${circ} ${circ}`}
                                    strokeDashoffset={circ * (1 - completionPct / 100)}
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-black text-slate-800 uppercase leading-none">{richLabel}</span>
                            </div>
                        </div>
                        <span className="text-[9px] font-black text-slate-600 uppercase tracking-wider text-center">
                            {completionPct >= 80 ? 'Excellent quality' : 'Keep answering'}
                        </span>
                    </div>
                )}

                {/* 4 · Remaining */}
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
                                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
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
                        {remaining === 0 ? 'All complete!' : `${remaining} question${remaining > 1 ? 's' : ''} left`}
                    </span>
                </div>

                {/* 5 · Required Fields */}
                <div className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Required Fields</span>
                    <div className="relative w-[110px] h-[110px]">
                        <svg width="110" height="110" className="-rotate-90">
                            <defs>
                                <linearGradient id={`cg-req-${sid}`} x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor={reqColor} />
                                    <stop offset="100%" stopColor={reqColor2} />
                                </linearGradient>
                            </defs>
                            <circle cx="55" cy="55" r="42" fill="none" stroke="#f1f5f9" strokeWidth="10" />
                            <circle cx="55" cy="55" r="42" fill="none"
                                stroke={`url(#cg-req-${sid})`} strokeWidth="10"
                                strokeDasharray={`${circ} ${circ}`}
                                strokeDashoffset={circ * (1 - reqPct / 100)}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.4,0,0.2,1)' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            {allRequiredDone
                                ? <CheckCircle2 className="w-9 h-9 text-emerald-500" />
                                : <span className="text-2xl font-black text-red-500 leading-none">{unansweredRequired.length}</span>
                            }
                        </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider text-center" style={{ color: reqColor }}>
                        {allRequiredDone ? 'Ready to proceed' : 'Complete before next'}
                    </span>
                </div>
            </div>

            {/* ── Response Coverage by Question Type ── */}
            {typeBarData.length > 0 && (
                <div className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Response Coverage by Question Type
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
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={typeBarData} margin={{ top: 0, right: 10, left: -30, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} />
                                <Bar dataKey="answered" name="Answered" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={36} stackId="a" />
                                <Bar dataKey="remaining" name="Remaining" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={36} stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </motion.div>
    );
}

interface VendorFitAssessmentWrapperProps {
    data: QuestionSchema;
    engineName: string;
    existingResponses?: any;
}

export default function VendorFitAssessmentWrapper({
    data, engineName, existingResponses
}: VendorFitAssessmentWrapperProps) {
    const navigate = useNavigate();
    const path = useLocation();
    const fetcher = useFetcher();
    const scrollRef = useRef<HTMLDivElement>(null);

    const hasExistingData = !!(existingResponses && Object.keys(existingResponses).length > 0);
    const [started, setStarted] = useState(false);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [currentStep, setCurrentStep] = useState(0);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [showErrorToast, setShowErrorToast] = useState(false);
    const [showAIReport, setShowAIReport] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const steps = data.parts;
    const currentStepData = steps[currentStep];
    const totalQuestions = steps.reduce((acc, s) => acc + s.questions.length, 0);
    const answeredCount = Object.keys(formData).filter(k => {
        if (k.endsWith("_other")) return false;
        const val = formData[k];
        if (val === undefined || val === "" || val === null) return false;
        if (Array.isArray(val) && val.length === 0) return false;
        return true;
    }).length;
    const progress = totalQuestions > 0 ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100)) : 0;
    const isComplete = progress === 100;

    // AI Report Generation
    const generateReport = () => {
        const payload = {
            intent: "generate_report",
            assessment_id: data.pk,
            progress: progress,
            answers: formData,
            params: engineName
        };
        fetcher.submit(payload, {
            method: "POST", encType: "application/json", action: path.pathname
        });
    };

    const isGenerating = fetcher.state !== "idle" && fetcher.formData?.get("intent") === "generate_report";
    const aiAdvisory = (fetcher.data as any)?.advisory as HTIAdvisoryContent;

    useEffect(() => {
        if (fetcher.data && (fetcher.data as any).redirect) {
            window.location.href = (fetcher.data as any).redirect;
        }
    }, [fetcher.data]);

    const handleChange = useCallback((questionId: string, value: any) => {
        setFormData(prev => {
            if (value === undefined) {
                const n = { ...prev };
                delete n[questionId];
                return n;
            }
            return { ...prev, [questionId]: value };
        });
        if (errors[questionId]) {
            setErrors(prev => { const n = { ...prev }; delete n[questionId]; return n; });
        }
    }, [errors]);

    const validateCurrentStep = () => {
        const newErrors: Record<string, string> = {};
        currentStepData.questions.forEach(q => {
            if (q.required && (formData[q.id] === undefined || formData[q.id] === "")) {
                newErrors[q.id] = "This field is required";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStepSave = async () => {
        try {
            setIsSubmitting(true);
            const payload = {
                assessment_id: data.pk,
                progress: totalQuestions > 0 ? Math.min(100, Math.round((answeredCount / totalQuestions) * 100)) : 0,
                section: currentStepData.part,
                answers: formData,
                currentStepIndex: currentStep,
                params: engineName
            };

            fetcher.submit(payload, {
                method: "POST", encType: "application/json", action: path.pathname
            });

            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
        } catch (e) {
            setShowErrorToast(true);
            setTimeout(() => setShowErrorToast(false), 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleNext = async () => {
        const isValid = validateCurrentStep();
        if (!isValid) return;
        await handleStepSave();
        if (currentStep < steps.length - 1) {
            setCurrentStep(p => p + 1);
            setErrors({});
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            // Final completion
            const payload = {
                assessment_id: data.pk, progress: 100,
                section: "Completion", answers: formData, params: engineName
            };
            fetcher.submit(payload, {
                method: "POST", encType: "application/json", action: path.pathname
            });
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setCurrentStep(p => p - 1);
            setErrors({});
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            navigate(-1);
        }
    };

    const navigateToStep = (idx: number) => {
        setCurrentStep(idx);
        setErrors({});
        setIsSidebarOpen(false);
        scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    };

    if (!started) {
        const existingProgress = hasExistingData
            ? Math.min(100, Math.round((Object.keys(existingResponses).filter(k => !k.endsWith("_other") && existingResponses[k] !== undefined && existingResponses[k] !== "" && existingResponses[k] !== null && !(Array.isArray(existingResponses[k]) && existingResponses[k].length === 0)).length / Math.max(1, steps.reduce((a, s) => a + s.questions.length, 0))) * 100))
            : 0;
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-white px-6">
                <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-6 border border-slate-100">
                    <img src="/hrtek_logo.png" alt="HRTek" className="h-10 mx-auto object-contain" />
                    <h1 className="text-2xl font-black text-slate-900">{engineName} Assessment</h1>
                    {hasExistingData ? (
                        <>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                You have a saved session with <span className="font-bold text-blue-600">{existingProgress}%</span> progress. Would you like to continue where you left off?
                            </p>
                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    onClick={() => { setFormData(existingResponses); setStarted(true); }}
                                    className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg transition-all"
                                >
                                    Continue Previous Session ({existingProgress}%)
                                </button>
                                <button
                                    onClick={() => { setFormData({}); setStarted(true); }}
                                    className="w-full px-8 py-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-base transition-all"
                                >
                                    Start Fresh
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <p className="text-slate-600 text-sm leading-relaxed">
                                Welcome! This assessment will help us understand your requirements and recommend the best fit. It covers {steps.length} sections with {steps.reduce((a, s) => a + s.questions.length, 0)} questions.
                            </p>
                            <button
                                onClick={() => { setFormData({}); setStarted(true); }}
                                className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg transition-all"
                            >
                                Begin Assessment →
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            {/* Toasts */}
            <AnimatePresence>
                {showToast && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm z-[200] font-semibold flex items-center gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4" /> Progress Saved
                    </motion.div>
                )}
                {showErrorToast && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                        className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-2xl text-sm z-[200] font-semibold"
                    >
                        Error saving progress
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-white transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} border-r border-slate-200 shadow-xl lg:shadow-sm`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <img src="/hrtek_logo.png" alt="HRTek" className="h-9 w-auto object-contain" />
                            <div className="h-8 w-px bg-slate-200" />
                            <div>
                                <h2 className="font-bold text-lg tracking-tight text-slate-900 leading-tight" title={engineName.replace(/^HCM\s*/i, "")}>
                                    {engineName.replace(/^HCM\s*/i, "")}
                                </h2>
                                <p className="text-xs text-indigo-600 uppercase tracking-wider font-bold">Assessment Engine</p>
                            </div>
                            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden ml-auto p-1.5 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* Progress Widget */}
                        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-2xl p-5 border border-slate-200/80">
                            <div className="flex justify-between items-end mb-3">
                                <span className="text-sm text-slate-500 font-medium">Completion</span>
                                <span className="text-2xl font-black text-indigo-600">{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                                <motion.div
                                    className="bg-gradient-to-r from-indigo-600 to-blue-500 h-full rounded-full"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${progress}%` }}
                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                />
                            </div>
                            <div className="mt-4 flex justify-between items-center">
                                <span className="text-xs text-slate-500 font-medium">Questions Answered</span>
                                <span className="text-xs font-mono text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-lg shadow-sm font-bold">
                                    {answeredCount}/{totalQuestions}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-4 px-3">
                        <div className="px-3 mb-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Assessment Sections
                        </div>
                        <nav className="space-y-1">
                            {steps.map((step, idx) => {
                                const stepQuestionIds = step.questions.map(q => q.id);
                                const stepAnswered = stepQuestionIds.filter(id => formData[id] !== undefined && formData[id] !== "").length;
                                const isComplete = stepAnswered === step.questions.length && step.questions.length > 0;
                                const isActive = currentStep === idx;
                                const isStarted = stepAnswered > 0;

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => navigateToStep(idx)}
                                        className={`w-full flex items-center justify-between p-3.5 rounded-xl text-sm transition-all group ${isActive
                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                            : isStarted
                                                ? "bg-indigo-50 text-indigo-900 font-medium hover:bg-indigo-100"
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {isComplete ? (
                                                <CheckCircle2 className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-500"}`} />
                                            ) : (
                                                <Circle className={`w-4 h-4 ${isActive ? "text-white/60" : isStarted ? "text-indigo-400" : "text-slate-300"}`} />
                                            )}
                                            <span className="text-left text-[11px] font-bold uppercase tracking-wider leading-tight">
                                                {step.part.replace(/Section \d+:\s*/i, "")}
                                            </span>
                                        </div>
                                        {isStarted && !isComplete && !isActive && (
                                            <span className="text-[10px] bg-white border border-indigo-100 text-indigo-600 px-2 py-0.5 rounded-lg shadow-sm font-bold">
                                                {stepAnswered}/{step.questions.length}
                                            </span>
                                        )}
                                        {isActive && (
                                            <ChevronRight className="w-3.5 h-3.5 text-white/60" />
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Sidebar Footer */}
                    <div className="p-5 border-t border-slate-100 bg-slate-50/50">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-br from-orange-100 to-red-100 rounded-lg">
                                <Target className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Powered by</p>
                                <p className="text-xs font-bold text-slate-700">HRTek Intelligence</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-slate-100 rounded-xl transition-colors">
                            <Menu className="w-5 h-5 text-slate-600" />
                        </button>
                        <div className="hidden lg:flex items-center gap-3">
                            <button 
                                onClick={() => {
                                    if (showAIReport) setShowAIReport(false);
                                    else navigate(-1);
                                }} 
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors group"
                            >
                                <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-indigo-600" />
                            </button>
                            <div className="h-6 w-px bg-slate-200" />
                        </div>
                        <div>
                            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                                {engineName.replace("HCM ", "")} Assessment
                            </h1>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">
                                Section {currentStep + 1} of {steps.length} • {currentStepData.part}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200">
                            <BarChart3 className="w-4 h-4 text-indigo-500" />
                            <span className="text-xs font-bold text-slate-600">{progress}% Complete</span>
                        </div>
                        <button
                            onClick={handleStepSave}
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black transition-all shadow-lg disabled:opacity-50"
                        >
                            <Save className="w-3.5 h-3.5" />
                            Save
                        </button>
                        <button
                            onClick={() => {
                                if (aiAdvisory) setShowAIReport(true);
                                else generateReport();
                            }}
                            disabled={!isComplete || isGenerating}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-lg disabled:opacity-50 ${isComplete
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-200'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                }`}
                        >
                            {isGenerating ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Sparkles className="w-4 h-4" />
                            )}
                            {isGenerating ? 'Generating Strategy...' : aiAdvisory ? 'View Full AI Report' : 'Generate Strategic Report'}
                        </button>
                    </div>
                </header>

                {/* Form Content */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth bg-gradient-to-b from-slate-50 to-slate-100/50">
                    {isGenerating ? (
                        <div className="h-full flex flex-col items-center justify-center p-10 text-center space-y-6">
                            <div className="relative">
                                <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">AI Analysis in Progress</h3>
                                <p className="text-slate-500 max-w-md">Our intelligence engine is correlating your responses with 50,000+ benchmark data points to provide your personalized strategy.</p>
                            </div>
                            <div className="flex flex-col gap-2 w-64">
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 animate-[loading_3s_ease-in-out_infinite]"></div>
                                </div>
                                <div className="flex justify-between text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                                    <span>Clustering</span>
                                    <span>Comparison</span>
                                    <span>Forecasting</span>
                                </div>
                            </div>
                        </div>
                    ) : showAIReport && aiAdvisory ? (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <ExecutiveAdvisory advisory={aiAdvisory} />
                        </div>
                    ) : (
                        <div className="max-w-4xl mx-auto px-6 py-10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentStepData.part}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {/* Section Header Card */}
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8 overflow-hidden relative">
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500" />
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-sm font-bold tracking-wide uppercase text-indigo-600">
                                            Section {currentStep + 1}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 font-medium">
                                                {currentStepData.questions.filter(q => formData[q.id] !== undefined && formData[q.id] !== "").length}/{currentStepData.questions.length} Completed
                                            </span>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-600 to-blue-500 transition-all duration-500 rounded-full"
                                                    style={{
                                                        width: `${(currentStepData.questions.filter(q => formData[q.id] !== undefined && formData[q.id] !== "").length / currentStepData.questions.length) * 100}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{currentStepData.part}</h2>
                                    <p className="text-slate-600 leading-relaxed">{currentStepData.intro}</p>
                                </div>

                                {/* Questions */}
                                <div className="space-y-6">
                                    {currentStepData.questions.map((question) => (
                                        <div key={question.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6">
                                            <div className="flex gap-3 mb-5">
                                                <span className="text-sm text-indigo-600 font-bold shrink-0">{question.number}.</span>
                                                <div>
                                                    <p className="text-base text-slate-800 font-semibold leading-relaxed">
                                                        {question.question || question.title}
                                                        {question.required && <span className="text-red-500 ml-1">*</span>}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Render Options based on type */}
                                            {(question.type === "radio" || question.type === "dropdown") && question.options && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-5">
                                                    {question.options.map((option, optIdx) => {
                                                        const isSelected = formData[question.id] === option;
                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                onClick={() => handleChange(question.id, isSelected ? undefined : option)}
                                                                className={`relative flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                                                                    ? "border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100"
                                                                    : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white"
                                                                    }`}
                                                            >
                                                                <div className={`h-4 w-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 bg-white"
                                                                    }`}>
                                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                                <span className={`text-sm font-medium leading-snug ${isSelected ? "text-indigo-900" : "text-slate-600"}`}>
                                                                    {option}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {question.type === "checkbox" && question.options && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ml-5">
                                                    {question.options.map((option, optIdx) => {
                                                        const currentValues = Array.isArray(formData[question.id]) ? formData[question.id] : [];
                                                        const isSelected = currentValues.includes(option);
                                                        return (
                                                            <div
                                                                key={optIdx}
                                                                onClick={() => {
                                                                    const updated = isSelected
                                                                        ? currentValues.filter((v: string) => v !== option)
                                                                        : [...currentValues, option];
                                                                    handleChange(question.id, updated);
                                                                }}
                                                                className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border-2 transition-all duration-200 cursor-pointer ${isSelected
                                                                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                                                                    : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white"
                                                                    }`}
                                                            >
                                                                <div className={`h-4 w-4 rounded flex-shrink-0 flex items-center justify-center mt-0.5 border-2 transition-colors ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 bg-white"
                                                                    }`}>
                                                                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                                                                </div>
                                                                <span className={`text-sm font-medium leading-snug ${isSelected ? "text-indigo-900" : "text-slate-600"}`}>
                                                                    {option}
                                                                </span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {(question.type === "textarea" || question.type === "text") && (
                                                <div className="ml-5">
                                                    {question.type === "textarea" ? (
                                                        <textarea
                                                            value={formData[question.id] || ""}
                                                            onChange={(e) => handleChange(question.id, e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm text-slate-800 min-h-[100px] resize-y bg-white"
                                                            placeholder="Type your response here..."
                                                            maxLength={question.maxLength}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={formData[question.id] || ""}
                                                            onChange={(e) => handleChange(question.id, e.target.value)}
                                                            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm text-slate-800 bg-white"
                                                            placeholder="Type your answer..."
                                                            maxLength={question.maxLength}
                                                        />
                                                    )}
                                                </div>
                                            )}

                                            {question.type === "scale" && (
                                                <div className="flex gap-3 ml-5 flex-wrap">
                                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                                                        const isSelected = formData[question.id] === num;
                                                        return (
                                                            <button
                                                                key={num}
                                                                onClick={() => handleChange(question.id, isSelected ? undefined : num)}
                                                                className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all ${isSelected
                                                                    ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                                                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                                                                    }`}
                                                            >
                                                                {num}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* "Other" option */}
                                            {question.hasOther && formData[question.id] === "Other" && (
                                                <div className="mt-3 ml-5">
                                                    <input
                                                        type="text"
                                                        value={formData[`${question.id}_other`] || ""}
                                                        onChange={(e) => handleChange(`${question.id}_other`, e.target.value)}
                                                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm bg-white"
                                                        placeholder="Please specify..."
                                                    />
                                                </div>
                                            )}

                                            {errors[question.id] && (
                                                <p className="error-message text-red-500 text-xs mt-2 ml-5 font-medium">{errors[question.id]}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Sectional Metrics / Insights */}
                                <VendorFitSectionInsights
                                    questions={currentStepData.questions}
                                    formData={formData}
                                    sectionNumber={currentStep + 1}
                                />
                            </motion.div>
                        </AnimatePresence>

                        {/* Navigation */}
                        <div className="flex justify-between mt-10 pt-6 border-t border-slate-200">
                            <button
                                onClick={handlePrevious}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 transition-all shadow-sm"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Previous
                            </button>
                            <button
                                onClick={handleNext}
                                disabled={isSubmitting}
                                className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm hover:from-indigo-700 hover:to-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                            >
                                {isSubmitting ? "Saving..." : currentStep === steps.length - 1 ? "Submit Assessment" : "Next Section"}
                                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm">
                            <p>&copy; 2026 HRTek Systems. All rights reserved.</p>
                        </div>
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}
