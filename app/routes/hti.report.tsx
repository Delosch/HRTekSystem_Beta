import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getVerifiedPaymentsByCompany } from "~/models/payment.model.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { getCompanyAdvisories } from "~/models/hti.model.server";
import { getUserProfile } from "~/models/user.model.server";
import {
    Download, ArrowLeft, Brain, Target, Layers,
    Clock, Star, LayoutDashboard, FileText,
    ShieldAlert, ChevronDown, ChevronUp, History,
    XCircle, CheckCircle, Activity, Info, AlertTriangle,
    Award, TrendingUp, Zap, ArrowRight, ShieldCheck,
    BarChart3, Lightbulb, Eye,
} from "lucide-react";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis,
    ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
    CartesianGrid, Tooltip, ReferenceLine, ZAxis
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import BoardDossierRenderer from "~/components/reports/BoardDossierRenderer";

import { deriveHTIScores } from "~/utils/htiScoreUtils";
import { resolveReportClientIdentity } from "~/utils/reportClientIdentity";

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireUserSession(request);
    const user = await getUserProfile(session.userId).catch(() => null);

    const url = new URL(request.url);
    let organisationId = user?.organisationId || session.organisationId;

    const isAdmin = session.isAdmin || (user as any)?.role === "ADMIN" || (session as any)?.role === "ADMIN";
    if (isAdmin) {
        const queryCompanyId = url.searchParams.get("companyId") || url.searchParams.get("organisationId");
        if (queryCompanyId) {
            organisationId = queryCompanyId;
        }
    }

    if (!organisationId) return redirect("/auth/drx");

    const companyProfile = await getCompanyProfile(organisationId);
    const { companyName } = resolveReportClientIdentity(companyProfile);

    const [reports, payments] = await Promise.all([
        getCompanyAdvisories(organisationId),
        getVerifiedPaymentsByCompany(organisationId),
    ]);

    // Check for ?reportId= param
    const requestedId = url.searchParams.get("reportId");

    let report;
    if (requestedId) {
        report = reports?.find(r => r.reportId === requestedId) ?? null;
    }
    if (!report) {
        report = reports
            ?.filter(r => r.status === "approved")
            .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
            ?? reports
            ?.filter(r => r.status === "approved" && r.isLocked)
            .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
            ?? reports?.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0];
    }

    if (!report) return json({ hasReport: false, companyName });

    return json({ hasReport: true, report, companyName });
}

// ── Score Interpretation Helpers ─────────────────────────────────────────────

function interpretReadiness(score: number) {
    if (score >= 80) return {
        verdict: "High Readiness", color: "emerald",
        badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        ring: "#10b981",
        detail: `A score of ${score}/100 indicates the organisation is well-positioned to begin full-scale transformation. Leadership alignment, infrastructure maturity, and process standardisation are at levels that support ambitious change programs without significant pre-work.`,
        action: "Proceed confidently with the highest-priority initiatives. The foundation is strong enough to support parallel workstreams."
    };
    if (score >= 65) return {
        verdict: "Conditional Readiness", color: "blue",
        badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        ring: "#3b82f6",
        detail: `A score of ${score}/100 means the organisation has essential building blocks in place but requires targeted preparation in specific areas before committing to large-scale implementation. A phased approach is strongly recommended to prevent mid-programme stalls.`,
        action: "Initiate highest-impact initiatives in parallel with capability-building activities. Address identified gaps within the first 90 days."
    };
    if (score >= 50) return {
        verdict: "Moderate Readiness", color: "amber",
        badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        ring: "#f59e0b",
        detail: `A score of ${score}/100 signals significant groundwork is required. Key capability gaps must be addressed in parallel with early transformation activities to avoid programme failure. An unmanaged start at this level typically leads to budget overruns and re-platforming.`,
        action: "Invest in a 60-day readiness sprint before committing to technology procurement. Focus on change governance and data quality first."
    };
    return {
        verdict: "Low Readiness", color: "red",
        badge: "bg-red-500/10 border-red-500/20 text-red-400",
        ring: "#ef4444",
        detail: `A score of ${score}/100 indicates the organisation is not yet prepared for comprehensive transformation. A 6–12 month readiness-building programme must precede any technology implementation to avoid compounding existing capability debt.`,
        action: "Initiate a formal HR transformation pre-programme. Focus on change management capacity, data hygiene, and leadership alignment before any platform selection."
    };
}

function interpretRisk(score: number) {
    if (score >= 65) return {
        verdict: "High Risk Exposure", color: "red",
        badge: "bg-red-500/10 border-red-500/20 text-red-400",
        ring: "#ef4444",
        detail: `A risk exposure index of ${score}/100 indicates multiple critical risk factors are present simultaneously. Without active mitigation embedded in the programme governance framework, the probability of cost overruns, adoption failures, or schedule delays is statistically significant.`,
        action: "Activate a dedicated Risk Management workstream from day one. Do not proceed without a formal risk register and weekly risk review cadence."
    };
    if (score >= 40) return {
        verdict: "Moderate Risk Exposure", color: "amber",
        badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        ring: "#f59e0b",
        detail: `A risk index of ${score}/100 indicates manageable but material risks are present. The mitigation strategies identified in this advisory directly address the exposure points and should be integrated into project governance immediately. These risks are controllable with proactive management.`,
        action: "Embed risk owners for each identified flag in the programme structure. Review mitigations at every project review board session."
    };
    return {
        verdict: "Low Risk Profile", color: "emerald",
        badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        ring: "#10b981",
        detail: `A risk index of ${score}/100 indicates the organisation's transformation profile carries minimal systemic risk. Standard project governance and change management practices, consistently applied, are sufficient to manage the residual risk level.`,
        action: "Maintain standard risk monitoring. Focus energy on maximising speed and initiative throughput rather than risk management overhead."
    };
}

function interpretConfidence(score: number) {
    if (score >= 85) return {
        verdict: "High Confidence", color: "emerald",
        badge: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
        detail: `Confidence of ${score}% means assessment data is comprehensive and cross-validated across all five engines. The advisory recommendations carry strong evidentiary support and can be acted upon with confidence. The AI synthesis has sufficient signal density to make high-conviction strategic calls.`,
        action: "Proceed with recommendations as-is. High confidence supports executive presentation and board-level investment justification."
    };
    if (score >= 65) return {
        verdict: "Moderate Confidence", color: "blue",
        badge: "bg-blue-500/10 border-blue-500/20 text-blue-400",
        detail: `Confidence of ${score}% indicates assessment data is substantially complete but some engines have partial data coverage. Recommendations are directionally accurate but may benefit from additional discovery workshops in areas flagged as lower-confidence.`,
        action: "Validate the lowest-confidence engine findings through stakeholder interviews before committing significant budget to those specific initiatives."
    };
    return {
        verdict: "Limited Confidence", color: "amber",
        badge: "bg-amber-500/10 border-amber-500/20 text-amber-400",
        detail: `Confidence of ${score}% signals incomplete assessment data. Recommendations should be treated as directional guidance and validated through deeper discovery sessions before resource commitment. Consider re-running incomplete engine assessments to improve advisory accuracy.`,
        action: "Complete all five assessment engines before taking major decisions based on this report. Treat current recommendations as a hypothesis to be validated."
    };
}

function interpretEngineScore(score: number, status: string) {
    if (status === "strong" || score >= 70) return "This engine area demonstrates solid organisational capability. It can serve as a foundation and proof-of-concept environment for broader transformation programmes.";
    if (status === "moderate" || (score >= 45 && score < 70)) return "This area is functional but contains notable gaps. Targeted improvement investment is recommended before scaling or integrating this capability into wider transformation initiatives.";
    return "A critical gap has been identified in this domain. Attempting transformation in dependent areas without first addressing this gap is a primary driver of programme failure. Prioritise remediation immediately.";
}

// ── UI Components ─────────────────────────────────────────────────────────────

function ScoreRing({ value, label, color, size = 120 }: { value: number; label: string; color: string; size?: number }) {
    const r = (size - 16) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (value / 100) * circ;
    return (
        <div className="flex flex-col items-center gap-2">
            <svg width={size} height={size}>
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1e293b" strokeWidth={10} />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={10}
                    strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
                    transform={`rotate(-90 ${size / 2} ${size / 2})`} />
                <text x={size / 2} y={size / 2 + 6} textAnchor="middle" fill="white"
                    fontSize={size * 0.22} fontWeight="900">{value}</text>
            </svg>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">{label}</span>
        </div>
    );
}

function Callout({ icon: Icon = Info, color = "blue", title, children }: { icon?: any; color?: string; title: string; children: React.ReactNode }) {
    const styles: Record<string, string> = {
        blue:   "bg-blue-500/5 border-blue-500/15 text-blue-300",
        amber:  "bg-amber-500/5 border-amber-500/15 text-amber-300",
        emerald: "bg-emerald-500/5 border-emerald-500/15 text-emerald-300",
        red:    "bg-red-500/5 border-red-500/15 text-red-300",
        slate:  "bg-white/[0.03] border-white/10 text-slate-300",
        violet: "bg-violet-500/5 border-violet-500/15 text-violet-300",
    };
    const iconStyles: Record<string, string> = {
        blue: "text-blue-400", amber: "text-amber-400", emerald: "text-emerald-400",
        red: "text-red-400", slate: "text-slate-400", violet: "text-violet-400",
    };
    return (
        <div className={`flex gap-4 p-5 rounded-2xl border ${styles[color]}`}>
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconStyles[color]}`} />
            <div>
                <p className="font-black text-xs uppercase tracking-wider mb-1.5">{title}</p>
                <div className="text-sm font-medium leading-relaxed opacity-85">{children}</div>
            </div>
        </div>
    );
}

function SectionTitle({ icon: Icon, title, subtitle, color = "indigo" }: { icon: any; title: string; subtitle?: string; color?: string }) {
    const colors: Record<string, string> = {
        indigo: "text-indigo-400", blue: "text-blue-400", emerald: "text-emerald-400",
        amber: "text-amber-400", red: "text-red-400", violet: "text-violet-400", slate: "text-slate-400",
    };
    return (
        <div className="mb-8">
            <h3 className="text-2xl font-black text-white flex items-center gap-3 mb-2">
                <Icon className={`w-7 h-7 ${colors[color]}`} />
                {title}
            </h3>
            {subtitle && <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl">{subtitle}</p>}
        </div>
    );
}

// ── Quadrant / Chart helpers ──────────────────────────────────────────────────

const QUADRANT_COLORS: Record<string, string> = {
    now: "#22c55e",
    next: "#f59e0b",
    later: "#6366f1"
};

const CustomScatterDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = QUADRANT_COLORS[payload.timeframe] || "#94a3b8";
    return (
        <g>
            <circle cx={cx} cy={cy} r={payload.effort > 5 ? 10 : 8} fill={color} fillOpacity={0.85} stroke={color} strokeWidth={2} />
            <text x={cx} y={cy - 14} textAnchor="middle" fill="white" fontSize={9} fontWeight={700}>{payload.initiative?.slice(0, 20)}</text>
        </g>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────

export default function HTIAdvisoryReport() {
    const data = useLoaderData<typeof loader>();
    const [activeTab, setActiveTab] = useState("overview");
    const [expandedSection, setExpandedSection] = useState<number | null>(0);

    if (!data.hasReport) {
        return (
            <div className="min-h-screen bg-[#05060a] flex items-center justify-center p-6">
                <div className="text-center space-y-5">
                    <div className="h-20 w-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto">
                        <Brain className="w-10 h-10 text-indigo-400 animate-pulse" />
                    </div>
                    <h2 className="text-2xl font-black text-white">Advisory Not Yet Generated</h2>
                    <p className="text-slate-400 max-w-md">Complete all five assessments and generate your HTI advisory to see the full cross-engine intelligence report here.</p>
                    <Link to="/hti" className="inline-flex items-center gap-2 mt-4 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-500 transition-all">
                        Go to HTI Dashboard <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    const report = (data as any).report;
    const advisory = report.advisory as any;
    const companyName = (data as any).companyName || "Confidential Client";

    // Extract data with safe fallbacks
    
    const derivedScores = deriveHTIScores(advisory, report.inputData);

    const readinessScore = derivedScores.readinessScore ?? 0;
    const riskScore = derivedScores.riskScore ?? 0;
    const confidenceScore = derivedScores.confidenceScore ?? 0;

    const capabilityHeatmap = advisory?.capabilityHeatmap ?? [];
    const priorityMatrix   = advisory?.priorityMatrix ?? [];
    const doNotTransformNow = advisory?.doNotTransformNow ?? [];
    const avoidNow         = advisory?.avoidNow ?? [];
    const auditTrail       = advisory?.auditTrail ?? [];
    const detailedSections = advisory?.detailedSections ?? [];
    const riskFlags        = advisory?.riskFlags ?? [];
    const dependencies     = advisory?.dependencies ?? [];
    const currentState     = advisory?.currentState ?? {};
    const successMetrics   = advisory?.successMetrics ?? [];
    const recoNow          = advisory?.recommendations?.now ?? [];
    const recoNext         = advisory?.recommendations?.next ?? [];
    const recoLater        = advisory?.recommendations?.later ?? [];

    const readinessInterp  = interpretReadiness(readinessScore);
    const riskInterp       = interpretRisk(riskScore);
    const confidenceInterp = interpretConfidence(confidenceScore);

    const radarData = capabilityHeatmap.length > 0
        ? capabilityHeatmap.map((h: any) => ({
            subject: h.engine?.replace("HR ", "").replace(" Analysis", "").replace(" Assessment", "").replace(" Generator", ""),
            value: h.score
        }))
        : [
            { subject: "Tech Maturity", value: 0 },
            { subject: "Roadmap", value: 0 },
            { subject: "Vendor Fit", value: 0 },
            { subject: "Change Mgmt", value: 0 },
            { subject: "Shared Svc", value: 0 },
        ];

    const heatmapColors: Record<string, string> = {
        strong: "#22c55e", moderate: "#f59e0b", critical: "#ef4444"
    };

    const TABS = [
        { id: "overview",   label: "Insights Dashboard",  icon: LayoutDashboard },
        { id: "narrative",  label: "Executive Briefing",  icon: FileText        },
        { id: "detail",     label: "Full Analysis",       icon: Eye             },
        { id: "audit",      label: "Audit Trail",         icon: History         },
    ];

    return (
        <div className="min-h-screen bg-[#05060a] text-slate-200 font-sans">

            {/* ── Nav ── */}
            <nav className="sticky top-0 z-50 bg-[#05060a]/90 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <img src="/logo_icon_final.png" alt="Logo" className="w-9 h-9" />
                    <div>
                        <h1 className="text-base font-black bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">
                            Premium HTI Advisory
                        </h1>
                        <p className="text-[10px] text-slate-500 font-black tracking-[0.25em] uppercase">
                            {companyName} · Cross-Engine Intelligence Report
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Tab bar */}
                    <div className="hidden md:flex bg-white/5 border border-white/10 rounded-xl p-1">
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                        activeTab === tab.id ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:text-slate-300"
                                    }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                    <Link to="/proposalTransformation"
                        className="hidden lg:flex items-center gap-1.5 px-4 py-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-xl text-xs font-bold hover:bg-violet-500/20 transition-colors">
                        <FileText className="w-3.5 h-3.5" /> View Proposal
                    </Link>
                    <button onClick={() => window.print()}
                        className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                        <Download className="w-5 h-5" />
                    </button>
                    <Link to="/hti" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>
            </nav>

            {/* Mobile tab bar */}
            <div className="md:hidden flex bg-[#05060a] border-b border-white/5 px-4 overflow-x-auto">
                {TABS.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`shrink-0 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
                            activeTab === tab.id ? "border-indigo-500 text-indigo-400" : "border-transparent text-slate-500"
                        }`}>
                        {tab.label}
                    </button>
                ))}
            </div>

            <main className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-10">
                <AnimatePresence mode="wait">

                    {/* ══════════════════════════════════════════════════════════
                        TAB 1 — INSIGHTS DASHBOARD
                    ══════════════════════════════════════════════════════════ */}
                    {activeTab === "overview" && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10">

                            {/* ── Hero ── */}
                            <section className="bg-gradient-to-br from-indigo-900/30 to-slate-900/80 border border-indigo-500/15 rounded-[3rem] p-10 relative overflow-hidden shadow-2xl">
                                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/8 blur-[120px] -mr-48 -mt-48 rounded-full pointer-events-none" />
                                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                                    <div className="lg:col-span-7 space-y-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-indigo-500/15 rounded-2xl border border-indigo-500/20">
                                                <Star className="w-6 h-6 text-indigo-400" />
                                            </div>
                                            <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.35em]">
                                                Cross-Engine Strategic Synthesis · {new Date(report.generatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </span>
                                        </div>

                                        <h2 className="text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tight">
                                            Transformation Readiness<br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic">
                                                {readinessInterp.verdict}
                                            </span>
                                        </h2>

                                        <p className="text-slate-400 text-sm leading-relaxed max-w-xl">
                                            This advisory synthesises intelligence from all five HR assessment engines into a unified
                                            cross-engine strategic view. Every score, recommendation, and risk flag on this page is
                                            derived from <strong className="text-slate-200">{companyName}</strong>'s actual assessment data.
                                        </p>

                                        {/* Score rings */}
                                        <div className="flex items-center gap-8 py-6 px-6 bg-white/[0.03] rounded-2xl border border-white/5">
                                            <ScoreRing value={readinessScore} label="Readiness" color={readinessInterp.ring} size={100} />
                                            <ScoreRing value={riskScore} label="Risk Exposure" color={riskInterp.ring} size={100} />
                                            <ScoreRing value={confidenceScore} label="Confidence" color="#818cf8" size={100} />
                                        </div>
                                    </div>

                                    <div className="lg:col-span-5">
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 text-center">
                                            Multi-Engine Capability Signature
                                        </p>
                                        <div className="h-[320px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart data={radarData}>
                                                    <PolarGrid stroke="#1e293b" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 900 }} />
                                                    <Radar name="Capability" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium text-center mt-1">
                                            Shape indicates relative strength across all 5 engines. A balanced pentagon indicates well-rounded capability.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* ── Score Intelligence Cards ── */}
                            <section className="space-y-4">
                                <div className="flex items-center gap-3 mb-6">
                                    <h3 className="text-xl font-black text-white">Score Intelligence — What Your Numbers Mean</h3>
                                    <span className="text-[10px] font-black text-slate-500 bg-white/5 px-3 py-1 rounded-full uppercase tracking-widest">AI-Interpreted</span>
                                </div>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-3xl -mt-3 mb-6">
                                    The three composite scores below are calculated by cross-referencing your responses across all five assessment engines. They are not arbitrary numbers — each score reflects a specific, measurable dimension of your organisation's transformation capability.
                                </p>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                    {/* Readiness */}
                                    <div className={`rounded-2xl border p-6 space-y-4 ${readinessInterp.badge}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Transformation Readiness</p>
                                                <p className="text-4xl font-black">{readinessScore}<span className="text-lg opacity-40">/100</span></p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                                                <Activity className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${readinessScore}%`, backgroundColor: readinessInterp.ring }} />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm mb-2">{readinessInterp.verdict}</p>
                                            <p className="text-xs leading-relaxed opacity-80">{readinessInterp.detail}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-wider opacity-60 mb-1">Recommended Action</p>
                                            <p className="text-xs leading-relaxed">{readinessInterp.action}</p>
                                        </div>
                                    </div>

                                    {/* Risk */}
                                    <div className={`rounded-2xl border p-6 space-y-4 ${riskInterp.badge}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Risk Exposure Index</p>
                                                <p className="text-4xl font-black">{riskScore}<span className="text-lg opacity-40">/100</span></p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                                                <ShieldAlert className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full" style={{ width: `${riskScore}%`, backgroundColor: riskInterp.ring }} />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm mb-2">{riskInterp.verdict}</p>
                                            <p className="text-xs leading-relaxed opacity-80">{riskInterp.detail}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-wider opacity-60 mb-1">Recommended Action</p>
                                            <p className="text-xs leading-relaxed">{riskInterp.action}</p>
                                        </div>
                                    </div>

                                    {/* Confidence */}
                                    <div className={`rounded-2xl border p-6 space-y-4 ${confidenceInterp.badge}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Advisory Confidence</p>
                                                <p className="text-4xl font-black">{confidenceScore}<span className="text-lg opacity-40">%</span></p>
                                            </div>
                                            <div className="h-12 w-12 rounded-xl bg-white/5 flex items-center justify-center">
                                                <ShieldCheck className="w-6 h-6" />
                                            </div>
                                        </div>
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full bg-indigo-400" style={{ width: `${confidenceScore}%` }} />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm mb-2">{confidenceInterp.verdict}</p>
                                            <p className="text-xs leading-relaxed opacity-80">{confidenceInterp.detail}</p>
                                        </div>
                                        <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                            <p className="text-[10px] font-black uppercase tracking-wider opacity-60 mb-1">Recommended Action</p>
                                            <p className="text-xs leading-relaxed">{confidenceInterp.action}</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ── Capability Heatmap ── */}
                            {capabilityHeatmap.length > 0 && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10">
                                    <SectionTitle icon={BarChart3} title="Engine Capability Heatmap" color="indigo"
                                        subtitle={`Each score represents ${companyName}'s assessed capability in one of the five HR intelligence domains. Scores above 70 are transformation-ready; scores below 40 indicate foundational gaps that must be addressed before related initiatives can succeed.`}
                                    />
                                    <Callout icon={Info} color="slate" title="How to Read the Heatmap">
                                        Scores are not isolated — they interact. A low score in Change Management will suppress the effective impact of even a high-scoring Technology Maturity implementation. The AI engine accounts for these cross-dependencies when generating recommendations.
                                    </Callout>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-8">
                                        {capabilityHeatmap.map((h: any, i: number) => {
                                            const col = heatmapColors[h.status] || "#94a3b8";
                                            const borderColors: Record<string, string> = {
                                                strong: "border-emerald-500/30", moderate: "border-amber-500/30", critical: "border-red-500/30"
                                            };
                                            const bgColors: Record<string, string> = {
                                                strong: "bg-emerald-500/5", moderate: "bg-amber-500/5", critical: "bg-red-500/5"
                                            };
                                            return (
                                                <div key={i} className={`rounded-2xl p-6 border-l-4 border ${borderColors[h.status] || "border-slate-700"} ${bgColors[h.status] || "bg-white/5"} space-y-4`}>
                                                    <div className="text-center">
                                                        <div className="text-4xl font-black mb-1" style={{ color: col }}>{h.score}</div>
                                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-tight">{h.engine}</div>
                                                    </div>
                                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${h.score}%`, backgroundColor: col }} />
                                                    </div>
                                                    <span className={`block text-center text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                                                        h.status === "strong" ? "bg-emerald-500/15 text-emerald-400" :
                                                        h.status === "critical" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-400"
                                                    }`}>
                                                        {h.status}
                                                    </span>
                                                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                                                        {interpretEngineScore(h.score, h.status)}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* ── Strategic Recommendations Preview ── */}
                            {(recoNow.length > 0 || recoNext.length > 0 || recoLater.length > 0) && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10">
                                    <SectionTitle icon={Zap} title="Strategic Recommendations" color="blue"
                                        subtitle="The following actions have been sequenced by the AI engine based on your readiness level, dependency chains, and impact-to-effort ratio. The order is deliberate — earlier actions create the conditions for later ones to succeed."
                                    />
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {[
                                            {
                                                items: recoNow, label: "Act Now", horizon: "0–3 Months",
                                                color: "#22c55e", bg: "bg-emerald-500/5", border: "border-emerald-500/15",
                                                badgeBg: "bg-emerald-500/15 text-emerald-400",
                                                context: "These actions address your most urgent assessed gaps. Delays here cascade into every downstream phase. Leadership commitment must be confirmed before these are initiated."
                                            },
                                            {
                                                items: recoNext, label: "Plan Next", horizon: "3–12 Months",
                                                color: "#f59e0b", bg: "bg-amber-500/5", border: "border-amber-500/15",
                                                badgeBg: "bg-amber-500/15 text-amber-400",
                                                context: "These represent your core transformation programme. They require foundational work from the 'Act Now' phase to be in place or actively in progress before they can deliver value."
                                            },
                                            {
                                                items: recoLater, label: "Future Vision", horizon: "12+ Months",
                                                color: "#6366f1", bg: "bg-indigo-500/5", border: "border-indigo-500/15",
                                                badgeBg: "bg-indigo-500/15 text-indigo-400",
                                                context: "Long-term investments that drive sustained competitive advantage. These require the organisational maturity built through earlier phases — attempting them prematurely is a leading cause of programme failure."
                                            },
                                        ].map(({ items, label, horizon, color, bg, border, badgeBg, context }) => items.length > 0 && (
                                            <div key={label} className={`${bg} ${border} border rounded-2xl p-6 flex flex-col`}>
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${badgeBg}`}>{label}</span>
                                                    <span className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                                                        <Clock className="w-3 h-3" /> {horizon}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">{context}</p>
                                                <div className="space-y-2 flex-1">
                                                    {items.map((r: string, i: number) => (
                                                        <div key={i} className="flex items-start gap-2.5">
                                                            <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">{r}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ── Priority Matrix ── */}
                            {priorityMatrix.length > 0 && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10">
                                    <SectionTitle icon={Target} title="Transformation Priority Matrix" color="emerald"
                                        subtitle="Every identified initiative is plotted across two dimensions: strategic impact (1–10) and implementation effort (1–10). This allows leadership to sequence investments for maximum early value while building toward longer-term goals."
                                    />
                                    <Callout icon={Info} color="blue" title="How to Read This Matrix">
                                        <strong>Impact</strong> = potential business value created (10 = transformational). <strong>Effort</strong> = implementation complexity and resource requirement (10 = maximum). High-impact, lower-effort initiatives in the "Act Now" quadrant represent your highest-ROI starting points. The quadrant reference lines divide the matrix into four strategic zones.
                                    </Callout>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-8">
                                        <div className="h-[380px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ScatterChart margin={{ top: 20, right: 30, bottom: 30, left: 20 }}>
                                                    <CartesianGrid stroke="#1e293b" strokeDasharray="4 4" />
                                                    <XAxis type="number" dataKey="effort" domain={[0, 11]} tick={{ fill: '#64748b', fontSize: 11 }}
                                                        label={{ value: 'Implementation Effort →', position: 'insideBottom', fill: '#475569', fontSize: 11, dy: 16 }} />
                                                    <YAxis type="number" dataKey="impact" domain={[0, 11]} tick={{ fill: '#64748b', fontSize: 11 }}
                                                        label={{ value: '← Business Impact', angle: -90, position: 'insideLeft', fill: '#475569', fontSize: 11, dx: -10 }} />
                                                    <ZAxis range={[80, 160]} />
                                                    <Tooltip content={({ active, payload }) => {
                                                        if (!active || !payload?.length) return null;
                                                        const d = payload[0].payload;
                                                        return (
                                                            <div className="bg-slate-900 border border-white/10 rounded-xl p-4 text-xs max-w-[220px] shadow-xl">
                                                                <p className="font-black text-white mb-2">{d.initiative}</p>
                                                                <p className="text-slate-400 mb-1">Impact: <strong className="text-white">{d.impact}/10</strong> · Effort: <strong className="text-white">{d.effort}/10</strong></p>
                                                                <p className="text-slate-400 mb-2">Category: {d.category}</p>
                                                                <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-black uppercase"
                                                                    style={{ backgroundColor: QUADRANT_COLORS[d.timeframe] + "33", color: QUADRANT_COLORS[d.timeframe] }}>{d.timeframe}</span>
                                                            </div>
                                                        );
                                                    }} />
                                                    <ReferenceLine x={5.5} stroke="#334155" strokeDasharray="6 3" label={{ value: "Effort midpoint", fill: "#475569", fontSize: 9 }} />
                                                    <ReferenceLine y={5.5} stroke="#334155" strokeDasharray="6 3" label={{ value: "Impact midpoint", fill: "#475569", fontSize: 9 }} />
                                                    <Scatter data={priorityMatrix} shape={<CustomScatterDot />} />
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-2 overflow-auto max-h-[380px] pr-1 scrollbar-thin scrollbar-thumb-white/10">
                                            <div className="grid grid-cols-4 gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 px-3 sticky top-0 bg-slate-900/40 py-2">
                                                <span>Initiative</span>
                                                <span className="text-center">Impact</span>
                                                <span className="text-center">Effort</span>
                                                <span className="text-center">Horizon</span>
                                            </div>
                                            {priorityMatrix.map((item: any, i: number) => (
                                                <div key={i} className="grid grid-cols-4 gap-2 items-center bg-white/5 rounded-xl px-3 py-3 hover:bg-white/8 transition-all">
                                                    <div>
                                                        <p className="text-xs text-slate-200 font-semibold leading-snug">{item.initiative}</p>
                                                        {item.category && <p className="text-[10px] text-slate-500 mt-0.5">{item.category}</p>}
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-sm font-black text-white">{item.impact}</span>
                                                        <span className="text-[10px] text-slate-500">/10</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-sm font-black text-slate-300">{item.effort}</span>
                                                        <span className="text-[10px] text-slate-500">/10</span>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase"
                                                            style={{ backgroundColor: QUADRANT_COLORS[item.timeframe] + "25", color: QUADRANT_COLORS[item.timeframe] }}>
                                                            {item.timeframe}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            )}

                            {/* ── Risk Register ── */}
                            {riskFlags.length > 0 && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10">
                                    <SectionTitle icon={ShieldAlert} title="Cross-Engine Risk Register" color="amber"
                                        subtitle="These risks were not derived from a generic checklist — they were identified through AI analysis of your specific assessment responses. Each risk is paired with a concrete mitigation strategy that should be embedded in the project governance framework."
                                    />
                                    <Callout icon={AlertTriangle} color="amber" title="Risk Management Principle">
                                        Identified risks are not reasons to delay transformation — they are inputs for smarter planning. Organisations that acknowledge and actively mitigate these specific risks are 3× more likely to deliver on projected ROI within the first year. Ignoring them compounds cost and timeline overruns.
                                    </Callout>
                                    <div className="space-y-4 mt-8">
                                        {riskFlags.map((r: any, i: number) => (
                                            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                                                <div className="flex items-center gap-3 px-6 py-3 bg-amber-500/5 border-b border-amber-500/10">
                                                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                                                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Risk {String(i + 1).padStart(2, "0")}</span>
                                                </div>
                                                <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/5">
                                                    <div className="p-6 space-y-2">
                                                        <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Identified Risk</p>
                                                        <p className="text-sm font-bold text-amber-100 leading-relaxed">{r.risk}</p>
                                                    </div>
                                                    <div className="p-6 space-y-2">
                                                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Mitigation Strategy</p>
                                                        <p className="text-sm font-semibold text-slate-300 leading-relaxed">{r.mitigation}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ── Caution Zones ── */}
                            {(doNotTransformNow.length > 0 || avoidNow.length > 0) && (
                                <section className="bg-red-950/10 border border-red-500/10 rounded-[2.5rem] p-10">
                                    <SectionTitle icon={XCircle} title="Do Not Transform Yet — Caution Zones" color="red"
                                        subtitle="One of the most valuable outputs of the assessment process is identifying areas that should NOT be transformed in the current cycle. Premature action in these areas — before the necessary foundations are in place — is a leading cause of wasted investment and programme fatigue."
                                    />
                                    <Callout icon={XCircle} color="red" title="Strategic Restraint as Competitive Advantage">
                                        Organisations that over-extend their transformation scope consistently underperform those that pursue focused, sequenced change. The areas below are not permanent exclusions — they represent initiatives that require prerequisite work before they can deliver positive ROI for {companyName}. Each has a suggested revisit timeline.
                                    </Callout>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
                                        {(doNotTransformNow.length > 0 ? doNotTransformNow : avoidNow.map((a: string) => ({ area: a, reason: "", category: "general" }))).map((item: any, i: number) => {
                                            const catColors: Record<string, string> = {
                                                organizational: "#f59e0b", financial: "#ef4444",
                                                technical: "#6366f1", cultural: "#ec4899", general: "#94a3b8"
                                            };
                                            const col = catColors[item.category] || "#94a3b8";
                                            return (
                                                <div key={i} className="bg-white/[0.03] rounded-2xl p-6 border border-white/5" style={{ borderLeftColor: col, borderLeftWidth: 3 }}>
                                                    <div className="flex items-start justify-between mb-3">
                                                        <h4 className="text-sm font-black text-white flex-1 pr-2">{item.area}</h4>
                                                        {item.category && (
                                                            <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0" style={{ backgroundColor: col + "25", color: col }}>
                                                                {item.category}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {item.reason && <p className="text-xs text-slate-400 leading-relaxed mb-3">{item.reason}</p>}
                                                    {item.revisitIn && (
                                                        <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                                                            <Clock className="w-3 h-3" /> Revisit in: {item.revisitIn}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            )}

                            {/* ── Success Metrics ── */}
                            {successMetrics.length > 0 && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10">
                                    <SectionTitle icon={Award} title="Success Metrics & KPIs" color="emerald"
                                        subtitle="Transformation without measurement is change without accountability. The KPIs below define how success will be jointly assessed between your organisation and HR-Tek. Each metric is designed to track both leading indicators (early momentum signals) and lagging indicators (proof of sustained business impact)."
                                    />
                                    <Callout icon={TrendingUp} color="emerald" title="Measurement Philosophy">
                                        These metrics are designed to be tracked within the HR-Tek platform dashboards, providing real-time visibility to all stakeholders at every governance review. Track both leading indicators (adoption rates, process compliance) and lagging indicators (cost reduction, time-to-hire) to maintain a balanced view of transformation progress.
                                    </Callout>
                                    <div className="space-y-3 mt-8">
                                        {successMetrics.map((m: string, i: number) => (
                                            <div key={i} className="flex items-start gap-5 p-5 bg-white/[0.03] border border-white/5 rounded-xl hover:border-emerald-500/15 hover:bg-emerald-500/[0.02] transition-all">
                                                <div className="w-8 h-8 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-200 font-semibold leading-relaxed">{m}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium mt-1.5">Tracked within HR-Tek System platform · Reviewed at monthly governance sessions</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* ── Current State ── */}
                            <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10">
                                <SectionTitle icon={LayoutDashboard} title="Current State Assessment" color="blue"
                                    subtitle="The current state profile below represents the AI engine's consensus view of where your organisation stands today across HR operational maturity, digital readiness, capability gaps, and existing strengths — derived directly from your assessment responses."
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                    {currentState?.maturityLevel && (
                                        <div className="p-6 bg-white/[0.03] rounded-2xl border border-indigo-500/10">
                                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">HR Maturity Level</p>
                                            <div className="text-2xl font-black text-white mb-2">{currentState.maturityLevel}</div>
                                            <p className="text-xs text-slate-400 leading-relaxed">Maturity level reflects the organisation's overall HR operational sophistication — measured across process standardisation, technology adoption, data quality, and governance structures. Higher maturity enables faster, lower-risk transformation execution.</p>
                                        </div>
                                    )}
                                    {currentState?.digitalReadiness && (
                                        <div className="p-6 bg-white/[0.03] rounded-2xl border border-emerald-500/10">
                                            <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Digital Readiness</p>
                                            <div className="text-2xl font-black text-white mb-2">{currentState.digitalReadiness}</div>
                                            <p className="text-xs text-slate-400 leading-relaxed">Digital readiness captures the organisation's preparedness to adopt and sustain new HR technology platforms — including infrastructure quality, change management capacity, user digital literacy, and leadership's digital vision alignment.</p>
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div>
                                        <h4 className="text-[10px] font-black text-red-400 uppercase tracking-widest mb-2">Key Capability Gaps</h4>
                                        <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">Gaps identified by the AI engine as the most significant barriers to effective HR transformation. Each represents a validated deficiency requiring targeted investment.</p>
                                        <div className="space-y-2">
                                            {(currentState?.keyGaps || []).map((gap: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3 p-3.5 bg-red-500/5 border border-red-500/10 rounded-xl">
                                                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                                                    <p className="text-sm text-slate-300 font-medium leading-snug">{gap}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Identified Strengths</h4>
                                        <p className="text-xs text-slate-500 font-medium mb-4 leading-relaxed">Genuine competitive advantages identified across your assessments. These represent your transformation anchors — build upon them rather than disrupting them during the programme.</p>
                                        <div className="space-y-2">
                                            {(currentState?.strengths || []).map((s: string, i: number) => (
                                                <div key={i} className="flex items-start gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
                                                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                                                    <p className="text-sm text-slate-300 font-medium leading-snug">{s}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* ── Dependencies ── */}
                            {dependencies.length > 0 && (
                                <section className="bg-slate-900/40 border border-white/5 rounded-[2.5rem] p-10">
                                    <SectionTitle icon={Layers} title="Implementation Dependencies" color="violet"
                                        subtitle="The following dependencies govern the recommended sequencing of all transformation initiatives. Attempting to execute dependent initiatives out of order is the most common cause of programme failure — these are not arbitrary constraints but genuine technical, organisational, and process prerequisites."
                                    />
                                    <Callout icon={Lightbulb} color="violet" title="Why Sequencing Matters">
                                        Dependencies represent logical prerequisites — situations where Initiative B cannot deliver its expected value until Initiative A is substantially complete. Violating these dependencies doesn't just slow things down; it typically requires costly rework and re-implementation.
                                    </Callout>
                                    <div className="space-y-3 mt-8">
                                        {dependencies.map((dep: string, i: number) => (
                                            <div key={i} className="flex items-start gap-4 p-5 bg-violet-500/5 border border-violet-500/10 rounded-xl">
                                                <ArrowRight className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                                                <p className="text-sm text-slate-300 font-medium leading-relaxed">{dep}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 2 — EXECUTIVE BRIEFING
                    ══════════════════════════════════════════════════════════ */}
                    {activeTab === "narrative" && (
                        <motion.div key="narrative" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-10 max-w-5xl mx-auto">

                            {/* Score header */}
                            <section className="bg-gradient-to-b from-slate-900 to-[#05060a] border border-white/5 rounded-[2.5rem] p-10 text-center">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3">Strategic Intelligence Report</p>
                                <h2 className="text-4xl font-black text-white mb-1">Executive Briefing</h2>
                                <p className="text-slate-400 font-medium mb-8">{companyName} · Cross-Engine Advisory Synthesis</p>
                                <div className="flex items-center justify-center gap-12">
                                    {[
                                        { label: "Readiness", value: readinessScore, suffix: "/100", color: readinessInterp.ring, verdict: readinessInterp.verdict },
                                        { label: "Risk Index", value: riskScore, suffix: "/100", color: riskInterp.ring, verdict: riskInterp.verdict },
                                        { label: "Confidence", value: confidenceScore, suffix: "%", color: "#818cf8", verdict: confidenceInterp.verdict },
                                    ].map(({ label, value, suffix, color, verdict }) => (
                                        <div key={label} className="text-center">
                                            <div className="text-4xl font-black mb-1" style={{ color }}>
                                                {value}<span className="text-lg text-slate-500">{suffix}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{label}</div>
                                            <div className="text-xs text-slate-400 font-semibold mt-1">{verdict}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Score interpretation summary */}
                            <section className="bg-white/[0.02] border border-white/5 rounded-2xl p-7 space-y-4">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Score Context for Leadership</p>
                                <p className="text-sm text-slate-300 font-medium leading-relaxed">{readinessInterp.detail}</p>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">{riskInterp.detail}</p>
                                <p className="text-sm text-slate-400 font-medium leading-relaxed">{confidenceInterp.detail}</p>
                            </section>

                            {/* Board dossier renderer */}
                            <BoardDossierRenderer report={advisory} engineName="Premium HTI Advisory" />

                            {/* Executive Summary HTML */}
                            <section className="bg-[#0f1118] border border-white/5 rounded-[2.5rem] p-10 space-y-8">
                                <h3 className="text-2xl font-black text-white">Strategic Narrative</h3>
                                {advisory?.executiveSummary ? (
                                    <div className="prose prose-invert max-w-none hti-advisory-content">
                                        <div dangerouslySetInnerHTML={{ __html: advisory.executiveSummary }} />
                                    </div>
                                ) : (
                                    <p className="text-slate-500 italic">Executive briefing is being generated…</p>
                                )}
                            </section>

                            {/* Structured Recommendations */}
                            {advisory?.recommendations && (
                                <section className="space-y-6">
                                    <h3 className="text-2xl font-black text-white">Sequenced Strategic Recommendations</h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed">
                                        The recommendations below are sequenced into three time horizons based on assessed readiness and the logical dependency chain between initiatives. Each group builds on the completion of the prior one — this is not a simple priority list but a programme design.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {[
                                            { key: "now", label: "Act Now (0–6 months)", color: "#22c55e", bg: "from-emerald-900/20 to-transparent", border: "border-emerald-500/15",
                                              context: "Address the most urgent assessed gaps. These are prerequisites for everything that follows." },
                                            { key: "next", label: "Plan Next (6–18 months)", color: "#f59e0b", bg: "from-amber-900/20 to-transparent", border: "border-amber-500/15",
                                              context: "Core transformation programme. Assumes 'Act Now' work is complete or actively in progress." },
                                            { key: "later", label: "Future Vision (18m+)", color: "#6366f1", bg: "from-indigo-900/20 to-transparent", border: "border-indigo-500/15",
                                              context: "Long-term competitive differentiation. Requires the organisational maturity built in earlier phases." },
                                        ].map(({ key, label, color, bg, border, context }) => (
                                            <div key={key} className={`bg-gradient-to-b ${bg} border ${border} rounded-2xl p-6`}>
                                                <h4 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color }}>{label}</h4>
                                                <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-4">{context}</p>
                                                <ul className="space-y-2.5">
                                                    {(advisory.recommendations[key as "now" | "next" | "later"] || []).map((r: string, i: number) => (
                                                        <li key={i} className="text-sm text-slate-300 flex items-start gap-2.5">
                                                            <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
                                                            {r}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Success Metrics in executive view */}
                            {successMetrics.length > 0 && (
                                <section className="bg-[#0f1118] border border-white/5 rounded-[2.5rem] p-10">
                                    <h3 className="text-xl font-black text-white mb-4 flex items-center gap-3">
                                        <Award className="w-6 h-6 text-emerald-400" />
                                        Transformation Success Metrics
                                    </h3>
                                    <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                                        These KPIs define how success will be measured and reported to the board throughout the engagement. Progress is tracked within the HR-Tek platform and reviewed at monthly governance sessions.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {successMetrics.map((m: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-4 bg-white/[0.03] border border-white/5 rounded-xl">
                                                <div className="w-6 h-6 bg-emerald-500/10 text-emerald-400 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">
                                                    {i + 1}
                                                </div>
                                                <p className="text-sm text-slate-300 font-medium leading-relaxed">{m}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}
                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 3 — FULL ANALYSIS
                    ══════════════════════════════════════════════════════════ */}
                    {activeTab === "detail" && (
                        <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 max-w-5xl mx-auto">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2">Full Cross-Engine Analysis</h2>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-2xl">
                                    The following chapters represent the AI engine's complete analysis across each strategic dimension. Each chapter was synthesised from your organisation's assessment data across all five engines — not from generic templates.
                                </p>
                            </div>
                            <Callout icon={Info} color="blue" title="About This Analysis">
                                Chapters are presented in strategic priority order. Expand each chapter to read the full analysis. The level of detail here exceeds what is shown in the Insights Dashboard and provides the evidential basis for every recommendation in this report.
                            </Callout>

                            {detailedSections.length === 0 ? (
                                <div className="text-center py-24 text-slate-500 bg-white/[0.02] border border-white/5 rounded-[2.5rem]">
                                    <FileText className="w-14 h-14 mx-auto mb-4 opacity-20" />
                                    <p className="font-black text-slate-400 text-base">Detailed Analysis Chapters</p>
                                    <p className="text-sm mt-2 max-w-sm mx-auto">Detailed analysis chapters will appear here once the report is generated and approved.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {detailedSections.map((section: any, i: number) => (
                                        <div key={i} className="bg-[#0f1118] border border-white/5 rounded-[2rem] overflow-hidden">
                                            <button
                                                className="w-full flex items-center justify-between p-7 hover:bg-white/5 transition-all text-left"
                                                onClick={() => setExpandedSection(expandedSection === i ? null : i)}
                                            >
                                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                                    <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-3 py-1.5 rounded-full shrink-0">
                                                        Chapter {String(i + 1).padStart(2, "0")}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <h3 className="text-base font-black text-white truncate">{section.title}</h3>
                                                        {!expandedSection !== (expandedSection === i) && section.content && (
                                                            <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                                {section.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)}…
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 shrink-0 ml-4">
                                                    <span className="text-[10px] text-slate-600 font-medium hidden sm:inline">
                                                        {section.content ? `~${Math.ceil(section.content.replace(/<[^>]*>/g, " ").split(" ").length)} words` : ""}
                                                    </span>
                                                    {expandedSection === i
                                                        ? <ChevronUp className="w-5 h-5 text-slate-500" />
                                                        : <ChevronDown className="w-5 h-5 text-slate-500" />
                                                    }
                                                </div>
                                            </button>
                                            <AnimatePresence>
                                                {expandedSection === i && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: "auto", opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.25 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="px-8 pb-10 border-t border-white/5">
                                                            <div className="pt-8 prose prose-invert prose-base max-w-none hti-advisory-content">
                                                                <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ══════════════════════════════════════════════════════════
                        TAB 4 — AUDIT TRAIL
                    ══════════════════════════════════════════════════════════ */}
                    {activeTab === "audit" && (
                        <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-4xl mx-auto space-y-8">
                            <div>
                                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                                    <History className="w-8 h-8 text-indigo-400" />
                                    Advisory Audit Trail
                                </h2>
                                <p className="text-slate-400 text-sm font-medium">Complete chain of custody for this advisory report — every generation, review, and approval event is logged here.</p>
                            </div>

                            {/* Report metadata */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Report ID", value: report.reportId?.slice(0, 16) + "…" },
                                    { label: "Generated", value: new Date(report.generatedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
                                    { label: "Status", value: report.status },
                                    { label: "Generated By", value: report.generatedBy?.slice(0, 20) ?? "Platform" }
                                ].map(({ label, value }) => (
                                    <div key={label} className="bg-white/5 rounded-2xl p-5 border border-white/5">
                                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">{label}</div>
                                        <div className="text-sm font-bold text-white truncate capitalize">{value}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Approval event */}
                            {report.approvedAt && (
                                <div className="flex items-start gap-4 bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-6">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                                    <div>
                                        <p className="text-sm font-black text-emerald-300">Report Approved & Published</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Approved by: {report.approvedBy || "Admin"} · {new Date(report.approvedAt).toLocaleString("en-IN")}
                                        </p>
                                        {report.adminNotes && <p className="text-xs text-slate-400 mt-2 italic border-t border-white/5 pt-2">Admin Notes: {report.adminNotes}</p>}
                                    </div>
                                </div>
                            )}

                            {/* Audit entries */}
                            {auditTrail.length === 0 && !report.approvedAt ? (
                                <div className="text-center py-16 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    <p className="text-slate-400 font-medium text-sm">Audit entries will appear here as actions are taken on this report.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {auditTrail.map((entry: any, i: number) => (
                                        <div key={i} className="flex items-start gap-4 bg-white/[0.03] border border-white/5 rounded-2xl p-5">
                                            <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 shrink-0" />
                                            <div>
                                                <p className="text-sm font-black text-white capitalize">{entry.action?.replace(/_/g, " ")}</p>
                                                <p className="text-xs text-slate-500 mt-0.5">{new Date(entry.timestamp).toLocaleString("en-IN")}</p>
                                                {entry.details && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{entry.details}</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                </AnimatePresence>
            </main>

            <style>{`
                .hti-advisory-content h2 { color: white; font-weight: 900; font-size: 1.75rem; margin-top: 2.5rem; margin-bottom: 1rem; border-left: 4px solid #6366f1; padding-left: 1.25rem; line-height: 1.2; }
                .hti-advisory-content h3 { color: #818cf8; font-weight: 800; font-size: 1.35rem; margin-top: 2rem; margin-bottom: 0.75rem; }
                .hti-advisory-content h4 { color: #94a3b8; font-weight: 700; font-size: 1.1rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                .hti-advisory-content p { font-size: 0.95rem; margin-bottom: 1rem; line-height: 1.8; color: #94a3b8; }
                .hti-advisory-content ul { list-style: none; padding-left: 1.25rem; margin-bottom: 1.25rem; }
                .hti-advisory-content li { position: relative; padding-bottom: 0.5rem; font-size: 0.9rem; color: #94a3b8; line-height: 1.7; }
                .hti-advisory-content li::before { content: "•"; color: #6366f1; font-weight: bold; display: inline-block; width: 1.5em; margin-left: -1.5em; }
                .hti-advisory-content table { width: 100%; border-collapse: collapse; margin: 2rem 0; border-radius: 1rem; overflow: hidden; background: rgba(255,255,255,0.02); }
                .hti-advisory-content th { background: rgba(255,255,255,0.05); padding: 1rem; text-align: left; font-weight: 900; text-transform: uppercase; letter-spacing: 0.08em; color: white; font-size: 0.75rem; }
                .hti-advisory-content td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; font-size: 0.875rem; }
                .hti-advisory-content strong { color: white; }
                .hti-advisory-content blockquote { border-left: 4px solid #6366f1; padding: 0.75rem 1.25rem; margin: 1.5rem 0; background: rgba(99,102,241,0.08); border-radius: 0 8px 8px 0; }
                .hti-advisory-content blockquote p { color: #a5b4fc; font-style: italic; margin: 0; }

                @media print {
                    nav, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    main { padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .hti-advisory-content h2, .hti-advisory-content h3 { color: black !important; border-left-color: #000 !important; }
                    .hti-advisory-content p, .hti-advisory-content td, .hti-advisory-content li { color: black !important; }
                    section { page-break-inside: avoid; margin-bottom: 2rem !important; }
                }
            `}</style>
        </div>
    );
}
