import { useState } from "react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useSubmit, Link } from "@remix-run/react";
import EmployeeSizeModal from "~/components/EmployeeSizeModal";
import { requireUserSession } from "~/lib/session.server";
import {
    Brain, CheckCircle2, Clock, AlertCircle, Sparkles,
    TrendingUp, Zap, Target, Lock, ShieldCheck, FileText,
    ArrowRight, Eye, RefreshCw,
    BarChart3, Layers, Network, Users, DollarSign, Activity,
    Cpu, Award, ChevronDown,
    ExternalLink, Radar,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getPricingForCompany, PRICING_TIERS } from "~/utils/pricing.server";
import { calculatePricing } from "~/services/pricing.server";
import { getCompanyProfile } from "~/models/company.model.server";
import Navbar from "~/components/HomePageComponents/Navbar";

// ── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    if (!user.organisationId) {
        const { redirect } = await import("@remix-run/node");
        return redirect("/auth/drx");
    }

    const { completedEngine } = await import("~/models/engine.model.server");
    const completedEngines = await completedEngine(user.organisationId);

    const { getCompanyAdvisories } = await import("~/models/hti.model.server");
    const rawReports = await getCompanyAdvisories(user.organisationId);

    const reports = rawReports.map(report => ({
        reportId: report.reportId,
        status: report.status,
        generatedAt: report.generatedAt,
        approvedAt: report.approvedAt,
        executiveSummary: report.advisory?.executiveSummary
            ? report.advisory.executiveSummary.substring(0, 280) + "…"
            : "No summary available",
        completedEngines: report.inputData.completedEnginesCount || 0,
        totalEngines: report.inputData.totalEngines || 5,
        transformationReadinessScore: report.advisory?.transformationReadinessScore ?? null,
        riskExposureIndex: report.advisory?.riskExposureIndex ?? null,
        confidenceScore: report.advisory?.confidenceScore ?? null,
    }));

    let pricingTier = PRICING_TIERS.TRANSFORMATION;
    let htiPricing = calculatePricing({ engine: "hti", employeeCount: 0 });
    let employeeCount = 0;
    try {
        const company = await getCompanyProfile(user.organisationId);
        if (company) {
            employeeCount = company.employee_count || 0;
            pricingTier = getPricingForCompany(employeeCount);
            htiPricing = calculatePricing({ engine: "hti", employeeCount });
        }
    } catch { /* ignore */ }

    const { getCompanyPayments } = await import("~/models/payment.model.server");
    const payments = await getCompanyPayments(user.organisationId);
    const isAdmin = (user as any).role === "ADMIN";
    const hasPaid = isAdmin || payments.some((p: any) =>
        (p.status === "payment_verified" || p.status === "completed") &&
        p.items?.some((i: any) => i.engineName?.startsWith("HTI Advisory"))
    );

    return json({
        user,
        companyId: user.organisationId,
        reports,
        completedEngines,
        pricingTier,
        htiPricing: {
            basePrice: htiPricing.basePrice,
            gst: htiPricing.gst,
            totalPrice: htiPricing.totalPrice,
            employeeTier: htiPricing.employeeTier,
        },
        hasPaid,
    });
}

// ── Action ────────────────────────────────────────────────────────────────────

export async function action({ request }: ActionFunctionArgs) {
    const user = await requireUserSession(request);
    const formData = await request.formData();
    const intent = formData.get("intent");

    if (!user.organisationId) return json({ error: "Organization ID required" }, { status: 400 });

    if (intent === "add_to_cart") {
        try {
            const { addOrUpdateCartItem } = await import("~/models/cart.model.server");
            const { getCompanyProfile } = await import("~/models/company.model.server");
            const { calculatePricing } = await import("~/services/pricing.server");
            const company = await getCompanyProfile(user.organisationId);
            const empCount = company?.employee_count || 0;
            const pricing = calculatePricing({ engine: "hti", employeeCount: empCount });
            await addOrUpdateCartItem({
                companyId: user.organisationId,
                productName: "HTI Advisory",
                price: pricing.totalPrice,
                userId: user.userId,
                employeeCount: typeof empCount === "number" ? empCount : parseInt(String(empCount) || "0"),
            });
            const { redirect } = await import("@remix-run/node");
            return redirect("/cartDashboard");
        } catch {
            return json({ error: "Failed to add to cart" }, { status: 500 });
        }
    }

    if (intent === "contact_sales") {
        const { redirect } = await import("@remix-run/node");
        return redirect("/contact");
    }

    const alreadyPaid = formData.get("alreadyPaid") === "true";
    if (!alreadyPaid) {
        const { getCompanyPayments } = await import("~/models/payment.model.server");
        const payments = await getCompanyPayments(user.organisationId);
        const isAdmin = (user as any).role === "ADMIN";
        const serverConfirmedPaid = isAdmin || payments.some((p: any) =>
            (p.status === "payment_verified" || p.status === "completed") &&
            p.items?.some((i: any) => i.engineName?.startsWith("HTI Advisory"))
        );
        if (serverConfirmedPaid) {
            try {
                const { generateAdvisoryReport } = await import("~/services/hti.service.server");
                const result = await generateAdvisoryReport(user.organisationId || "", user.userId);
                if (!result.success) return json({ error: result.error }, { status: 400 });
            } catch {
                return json({ error: "Failed to generate HTI advisory" }, { status: 500 });
            }
            const { redirect } = await import("@remix-run/node");
            return redirect("/hti");
        }
    }

    try {
        const { generateAdvisoryReport } = await import("~/services/hti.service.server");
        const result = await generateAdvisoryReport(user.organisationId || "", user.userId);

        if (!result.success) return json({ error: result.error }, { status: 400 });

        if (alreadyPaid) {
            const { redirect } = await import("@remix-run/node");
            return redirect("/hti");
        }

        try {
            const { addOrUpdateCartItem } = await import("~/models/cart.model.server");
            const { getCompanyProfile } = await import("~/models/company.model.server");
            const { calculatePricing } = await import("~/services/pricing.server");
            const formEmpCount = formData.get("employeeCount");
            const company = await getCompanyProfile(user.organisationId);
            const empCount = formEmpCount
                ? parseInt(String(formEmpCount))
                : (company?.employee_count || 0);
            const pricing = calculatePricing({ engine: "hti", employeeCount: empCount });
            await addOrUpdateCartItem({
                companyId: user.organisationId,
                productName: "HTI Advisory",
                price: pricing.totalPrice,
                userId: user.userId,
                employeeCount: empCount,
            });
        } catch { /* cart failure is non-critical */ }

        const { redirect } = await import("@remix-run/node");
        return redirect("/cartDashboard");
    } catch {
        return json({ error: "Failed to generate HTI advisory" }, { status: 500 });
    }
}

// ── Constants ─────────────────────────────────────────────────────────────────

const REQUIRED_ENGINES = [
    { name: "HR Technology Maturity Analysis", key: "maturity", icon: BarChart3, desc: "Evaluates your current HR tech stack maturity" },
    { name: "HR Transformation Roadmap Generator", key: "roadmap", icon: Layers, desc: "Creates your digital transformation roadmap" },
    { name: "Cognitive HCM Vendor Fit", key: "vendor", icon: Target, desc: "Matches your organisation to the right HCM vendors" },
    { name: "Intelligent Change Management", key: "change", icon: Users, desc: "Assesses change readiness and risk factors" },
    { name: "Shared Service Designer", key: "sharedServices", icon: Network, desc: "Designs your shared service architecture" },
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    approved: { label: "Approved",    bg: "bg-emerald-500/10 border-emerald-500/20", text: "text-emerald-400", dot: "bg-emerald-400" },
    pending:  { label: "Under Review", bg: "bg-amber-500/10 border-amber-500/20",   text: "text-amber-400",   dot: "bg-amber-400"   },
    rejected: { label: "Rejected",    bg: "bg-red-500/10 border-red-500/20",        text: "text-red-400",     dot: "bg-red-400"     },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function formatINR(amount: number) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

// ── ProgressRing ──────────────────────────────────────────────────────────────

function ProgressRing({ value, max, size = 120 }: { value: number; max: number; size?: number }) {
    const r = (size - 16) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / max) * circ;
    const pct = Math.round((value / max) * 100);
    return (
        <svg width={size} height={size} className="rotate-[-90deg]">
            <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.1)" strokeWidth={8} fill="none" />
            <circle cx={size / 2} cy={size / 2} r={r} stroke="#60a5fa" strokeWidth={8} fill="none"
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.8s ease" }} />
            <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
                style={{ transform: `rotate(90deg)`, transformOrigin: "center", fontSize: size * 0.22, fontWeight: 800 }}
                transform={`rotate(90, ${size / 2}, ${size / 2})`} fill="white">
                {pct}%
            </text>
        </svg>
    );
}

// ── Locked Gateway ─────────────────────────────────────────────────────────────

function LockedGateway({ completedEngines, requiredEngines }: { completedEngines: string[]; requiredEngines: typeof REQUIRED_ENGINES }) {
    const completedCount = completedEngines?.length || 0;

    return (
        <div className="max-w-5xl mx-auto px-6 pb-20">
            {/* Main locked card */}
            <div className="relative bg-gradient-to-br from-slate-900 to-[#010f2e] rounded-3xl overflow-hidden border border-white/5 shadow-2xl mb-8">
                {/* Grid bg */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.5) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />

                <div className="relative p-10 flex flex-col lg:flex-row items-start gap-10">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                                <Lock className="h-6 w-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-blue-300 text-[10px] font-black uppercase tracking-widest">Access Locked</p>
                                <p className="text-white font-black text-lg leading-tight">Complete All 5 Engines to Unlock HTI</p>
                            </div>
                        </div>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-lg mb-8">
                            The HR Transformation Intelligence module synthesises insights from all five engines into one unified AI advisory. Every engine feeds critical data — without complete coverage, the synthesis would be directionally compromised.
                        </p>

                        {/* Engine grid */}
                        <div className="grid sm:grid-cols-2 gap-2.5 mb-8">
                            {requiredEngines.map((engine) => {
                                const isDone = completedEngines?.some((c: string) =>
                                    c === engine.name || c === `ENGINE#${engine.name}` ||
                                    c.replace("ENGINE#", "") === engine.name ||
                                    (engine.key === "vendor" && c.includes("HCM Vendor Fit Engine"))
                                );
                                const Icon = engine.icon;
                                return (
                                    <div key={engine.key} className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all ${
                                        isDone ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/5"
                                    }`}>
                                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isDone ? "bg-emerald-500/20" : "bg-white/5"}`}>
                                            <Icon className={`h-4 w-4 ${isDone ? "text-emerald-400" : "text-slate-500"}`} />
                                        </div>
                                        <span className={`text-sm flex-1 font-medium truncate ${isDone ? "text-white" : "text-slate-500"}`}>
                                            {engine.name}
                                        </span>
                                        {isDone
                                            ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                            : <div className="h-4 w-4 rounded-full border-2 border-slate-600 shrink-0" />
                                        }
                                    </div>
                                );
                            })}
                        </div>

                        <Link to="/dashboard"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40 text-sm">
                            Go to Dashboard <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    <div className="flex flex-col items-center gap-4 shrink-0">
                        <ProgressRing value={completedCount} max={5} size={140} />
                        <div className="text-center">
                            <p className="text-white font-black text-2xl">{completedCount}/5</p>
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest">Engines Complete</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Value teaser cards */}
            <div className="grid md:grid-cols-3 gap-4">
                {[
                    { icon: Brain, title: "Unified AI Synthesis", desc: "All 5 engines converge into one cross-engine strategic recommendation powered by DeepSeek AI.", color: "blue" },
                    { icon: Award, title: "Board-Ready Reports", desc: "Structured advisory designed for CXO presentations, transformation roadmaps, and investor briefings.", color: "indigo" },
                    { icon: TrendingUp, title: "ROI-Guided Prioritisation", desc: "Every recommendation ranked by business impact, risk exposure, and implementation feasibility.", color: "violet" },
                ].map(({ icon: Icon, title, desc, color }) => (
                    <div key={title} className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-colors">
                        <div className={`h-10 w-10 rounded-xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center mb-4`}>
                            <Icon className={`h-5 w-5 text-${color}-400`} />
                        </div>
                        <h4 className="font-bold text-white mb-2 text-sm">{title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ── Pricing Gate ───────────────────────────────────────────────────────────────

function PricingGate({ htiPricing, pricingTier, onGetStarted }: { htiPricing: any; pricingTier: any; onGetStarted: () => void }) {
    const TIERS = [
        {
            id: "essentials",
            name: "Advisory Essentials",
            subtitle: "Mid-size enterprises",
            icon: Target,
            features: [
                "Aggregation from all HR-Tek modules",
                "Interpretation Layer (maturity, gaps)",
                "Standard transformation insights",
                "CXO summary dashboard",
                "Confidence & explainability indicators",
                "Quarterly data refresh",
                "Email support",
            ],
        },
        {
            id: "transformation",
            name: "Transformation Intelligence",
            subtitle: "Enterprise-grade transformation",
            icon: Sparkles,
            popular: true,
            features: [
                "Everything in Essentials plus:",
                "Transformation Mapping Layer",
                "Priority & dependency engine",
                "ROI-based digitization guidance",
                "Risk-aware transformation flags",
                "Operating model implications",
                "Quarterly intelligence refresh",
                "Priority support & consultation",
            ],
        },
        {
            id: "enterprise",
            name: "Enterprise Cognitive Advisory",
            subtitle: "Board / CXO Tier",
            icon: Brain,
            features: [
                "Everything in Transformation plus:",
                "Scenario & simulation modelling",
                "Multi-country / multi-entity intelligence",
                "Executive decision cockpit",
                "Advisory logic customization",
                "Agentic HR AI workflows",
                "Board-ready outputs & presentations",
                "Dedicated success manager",
            ],
        },
    ];

    return (
        <div className="max-w-6xl mx-auto px-6 pb-20">
            <div className="text-center mb-12">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-widest mb-4">
                    <CheckCircle2 className="h-3.5 w-3.5" /> All Engines Complete
                </span>
                <h2 className="text-3xl font-black text-white mb-3">Unlock Your HTI Advisory</h2>
                <p className="text-slate-400 max-w-xl mx-auto text-sm leading-relaxed">
                    Your assessment data is ready. Choose a plan and unlock your unified AI-generated transformation advisory.
                </p>
            </div>

            {htiPricing?.basePrice > 0 && (
                <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 mb-10 overflow-hidden shadow-2xl shadow-blue-900/30">
                    <div className="absolute inset-0 opacity-10"
                        style={{ backgroundImage: "radial-gradient(circle at 70% 50%, white 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div>
                            <p className="text-blue-200 text-xs font-black uppercase tracking-widest mb-2">Your Organisation's Estimated Price</p>
                            <p className="text-5xl font-black text-white">{formatINR(htiPricing.totalPrice)}</p>
                            <p className="text-blue-200 text-xs mt-2 font-medium">
                                Base {formatINR(htiPricing.basePrice)} + GST 18% ({formatINR(htiPricing.gst)}) · Tier: {htiPricing.employeeTier}
                            </p>
                        </div>
                        <button type="button" onClick={onGetStarted}
                            className="flex items-center gap-2.5 px-8 py-4 bg-white text-blue-700 rounded-xl font-black hover:bg-blue-50 transition-all shadow-xl text-sm whitespace-nowrap">
                            Get Started <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-6 mb-10">
                {TIERS.map((tier) => {
                    const isRecommended = pricingTier?.id === tier.id;
                    const Icon = tier.icon;
                    return (
                        <div key={tier.id} className={`relative rounded-2xl border p-7 flex flex-col transition-all ${
                            tier.popular
                                ? "bg-gradient-to-b from-blue-900/60 to-slate-900 border-blue-500/40 ring-1 ring-blue-500/20"
                                : "bg-white/[0.03] border-white/10 hover:border-white/20"
                        }`}>
                            {tier.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                                    Most Popular
                                </div>
                            )}
                            {isRecommended && !tier.popular && (
                                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-indigo-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg">
                                    Recommended for You
                                </div>
                            )}
                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                                <Icon className="h-6 w-6 text-blue-400" />
                            </div>
                            <h3 className="text-base font-black text-white mb-1">{tier.name}</h3>
                            <p className="text-xs text-slate-400 mb-6">{tier.subtitle}</p>
                            <ul className="space-y-2.5 flex-1 mb-8">
                                {tier.features.map((f, i) => (
                                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-300">
                                        <CheckCircle2 className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" /> {f}
                                    </li>
                                ))}
                            </ul>
                            <Form method="post">
                                <input type="hidden" name="intent" value="contact_sales" />
                                <button type="submit" className={`w-full py-3 rounded-xl font-bold text-sm transition-all ${
                                    tier.popular ? "bg-blue-600 text-white hover:bg-blue-500 shadow-lg shadow-blue-900/40" : "bg-white/5 text-slate-300 hover:bg-white/10 border border-white/10"
                                }`}>
                                    Contact Sales
                                </button>
                            </Form>
                        </div>
                    );
                })}
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                    { icon: TrendingUp, label: "50–70% Cost Savings", desc: "vs. Big-4 consulting firms for equivalent strategic advisory output." },
                    { icon: Zap, label: "Always-On AI", desc: "No waiting for consultant availability. Advisory updates quarterly." },
                    { icon: Target, label: "ROI in Q1", desc: "Most organisations see measurable ROI within the first quarter." },
                ].map(({ icon: Icon, label, desc }) => (
                    <div key={label} className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex gap-4">
                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="font-bold text-white text-sm mb-1">{label}</p>
                            <p className="text-xs text-slate-400">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-5 flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-300">
                    <strong>Limited Time:</strong> First 10 clients receive a 15% founding customer discount. Prices vary by organisation size. Multi-year discounts available.
                </p>
            </div>
        </div>
    );
}

// ── HTI Workspace ─────────────────────────────────────────────────────────────

function HTIWorkspace({ data, isGenerating, onGenerate, hasPaid }: { data: any; isGenerating: boolean; onGenerate: () => void; hasPaid: boolean }) {
    const { reports, completedEngines } = data;
    const completedCount = completedEngines?.length || 0;
    const approvedReports = reports.filter((r: any) => r.status === "approved");
    const pendingReports = reports.filter((r: any) => r.status === "pending");
    const [expandedReport, setExpandedReport] = useState<string | null>(null);

    const GENERATING_STEPS = [
        "Ingesting cross-engine assessment data…",
        "Running AI synthesis across 5 intelligence dimensions…",
        "Computing transformation readiness scores…",
        "Building priority matrix and risk register…",
        "Generating executive advisory narrative…",
    ];

    return (
        <div className="max-w-5xl mx-auto px-6 pb-20 space-y-6">

            {/* ── Stats Row ─── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: "Engines Complete",
                        value: `${completedCount}/5`,
                        sub: completedCount >= 5 ? "All engines active" : `${5 - completedCount} remaining`,
                        icon: Cpu,
                        gradient: "from-emerald-500/20 to-teal-500/10",
                        iconColor: "text-emerald-400",
                        iconBg: "bg-emerald-500/10",
                        valueColor: "text-emerald-400",
                    },
                    {
                        label: "Synthesis Coverage",
                        value: `${Math.round((completedCount / 5) * 100)}%`,
                        sub: "Data completeness",
                        icon: Activity,
                        gradient: "from-blue-500/20 to-indigo-500/10",
                        iconColor: "text-blue-400",
                        iconBg: "bg-blue-500/10",
                        valueColor: "text-blue-400",
                    },
                    {
                        label: "Total Reports",
                        value: reports.length,
                        sub: "Advisories generated",
                        icon: FileText,
                        gradient: "from-violet-500/20 to-purple-500/10",
                        iconColor: "text-violet-400",
                        iconBg: "bg-violet-500/10",
                        valueColor: "text-violet-400",
                    },
                    {
                        label: "Approved",
                        value: approvedReports.length,
                        sub: "Ready to view",
                        icon: CheckCircle2,
                        gradient: "from-amber-500/20 to-yellow-500/10",
                        iconColor: "text-amber-400",
                        iconBg: "bg-amber-500/10",
                        valueColor: "text-amber-400",
                    },
                ].map(({ label, value, sub, icon: Icon, gradient, iconColor, iconBg, valueColor }) => (
                    <div key={label} className={`relative bg-gradient-to-br ${gradient} border border-white/5 rounded-2xl p-5 overflow-hidden`}>
                        <div className={`h-9 w-9 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
                            <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                        <p className={`text-3xl font-black ${valueColor}`}>{value}</p>
                        <p className="text-xs font-bold text-white mt-0.5">{label}</p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">{sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Command Card: Generate ─── */}
            <div className="rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
                {/* Card header */}
                <div className="bg-gradient-to-r from-[#010f2e] to-[#023e8a]/80 px-8 py-6 flex items-center gap-4 border-b border-white/5">
                    <div className="relative">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                            <Brain className="h-6 w-6 text-blue-400" />
                        </div>
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-400" />
                        </span>
                    </div>
                    <div className="flex-1">
                        <h3 className="font-black text-white text-base">Generate New Advisory</h3>
                        <p className="text-xs text-blue-300/60 font-medium">Cross-engine AI synthesis · DeepSeek V3</p>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Intelligence Level</p>
                        <p className="text-sm font-black text-blue-300">Enterprise Grade</p>
                    </div>
                </div>

                <div className="bg-slate-900/80 px-8 py-7">
                    {/* Engine checklist */}
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Assessment Coverage</p>
                    <div className="grid sm:grid-cols-2 gap-2 mb-7">
                        {REQUIRED_ENGINES.map((engine) => {
                            const isDone = completedEngines?.some((c: string) =>
                                c === engine.name || c === `ENGINE#${engine.name}` ||
                                c.replace("ENGINE#", "") === engine.name ||
                                (engine.key === "vendor" && c.includes("HCM Vendor Fit Engine"))
                            );
                            const Icon = engine.icon;
                            return (
                                <div key={engine.key} className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                                    isDone ? "bg-emerald-500/5 border-emerald-500/15" : "bg-white/[0.02] border-white/5"
                                }`}>
                                    <Icon className={`h-4 w-4 shrink-0 ${isDone ? "text-emerald-400" : "text-slate-600"}`} />
                                    <span className={`text-sm flex-1 font-medium truncate ${isDone ? "text-slate-200" : "text-slate-500"}`}>
                                        {engine.name}
                                    </span>
                                    {isDone
                                        ? <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                                        : <div className="h-4 w-4 rounded-full border-2 border-slate-600 shrink-0" />
                                    }
                                </div>
                            );
                        })}
                    </div>

                    {/* Generating animation */}
                    <AnimatePresence>
                        {isGenerating && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="mb-6 bg-blue-500/5 border border-blue-500/15 rounded-2xl p-6"
                            >
                                <div className="flex items-center gap-4 mb-5">
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                                        <Brain className="h-7 w-7 text-blue-400" />
                                    </motion.div>
                                    <div>
                                        <p className="font-black text-white text-sm">HTI Intelligence Engine Running…</p>
                                        <p className="text-xs text-blue-400/70">Processing across 5 assessment dimensions</p>
                                    </div>
                                </div>
                                <div className="space-y-2 mb-5">
                                    {GENERATING_STEPS.map((step, i) => (
                                        <motion.div
                                            key={step}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.6 }}
                                            className="flex items-center gap-3"
                                        >
                                            <motion.div
                                                animate={{ scale: [1, 1.2, 1] }}
                                                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
                                                className="h-1.5 w-1.5 rounded-full bg-blue-400 shrink-0"
                                            />
                                            <p className="text-xs text-slate-400 font-medium">{step}</p>
                                        </motion.div>
                                    ))}
                                </div>
                                <div className="w-full bg-blue-500/10 rounded-full h-1.5 overflow-hidden">
                                    <motion.div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-1.5 rounded-full"
                                        animate={{ width: ["0%", "90%"] }}
                                        transition={{ duration: 45, ease: "easeInOut" }} />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Generate button */}
                    <button
                        type="button"
                        onClick={() => !isGenerating && completedCount >= 5 && onGenerate()}
                        disabled={isGenerating || completedCount < 5}
                        className={`w-full py-4 rounded-xl font-black text-sm flex items-center justify-center gap-2.5 transition-all ${
                            isGenerating || completedCount < 5
                                ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                                : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60"
                        }`}
                    >
                        {isGenerating ? (
                            <><RefreshCw className="h-4 w-4 animate-spin" /> Processing Advisory…</>
                        ) : (
                            <><Sparkles className="h-4 w-4" /> Generate HTI Advisory</>
                        )}
                    </button>

                    {completedCount < 5 && !isGenerating && (
                        <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-amber-500/5 border border-amber-500/15 rounded-xl">
                            <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
                            <p className="text-xs text-amber-300 font-medium">Complete all 5 engines first ({completedCount}/5 done).</p>
                        </div>
                    )}

                    {pendingReports.length > 0 && (
                        <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-blue-500/5 border border-blue-500/15 rounded-xl">
                            <Clock className="h-4 w-4 text-blue-400 shrink-0" />
                            <p className="text-xs text-blue-300 font-medium">
                                {pendingReports.length} advisory pending admin review. You'll be notified once approved.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Reports ─── */}
            <div className="rounded-3xl overflow-hidden border border-white/5">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-900 to-slate-800/80 px-8 py-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-11 w-11 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-violet-400" />
                        </div>
                        <div>
                            <h3 className="font-black text-white">Advisory Reports</h3>
                            <p className="text-xs text-slate-500 font-medium">
                                {reports.length} report{reports.length !== 1 ? "s" : ""} generated
                                {approvedReports.length > 0 && ` · ${approvedReports.length} approved`}
                            </p>
                        </div>
                    </div>
                    {approvedReports.length > 0 && (
                        <Link to="/hti/report"
                            className="flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-xl text-xs font-bold hover:bg-violet-500/20 transition-colors">
                            View Latest <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    )}
                </div>

                {reports.length === 0 ? (
                    <div className="bg-slate-900/60 py-20 flex flex-col items-center gap-4 text-slate-500">
                        <div className="h-20 w-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center">
                            <Brain className="h-10 w-10 opacity-20" />
                        </div>
                        <div className="text-center">
                            <p className="font-black text-slate-300 text-sm">No Advisory Reports Yet</p>
                            <p className="text-xs mt-1">Generate your first HTI advisory using the panel above.</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-900/60 divide-y divide-white/[0.04]">
                        {reports.map((report: any) => {
                            const cfg = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending;
                            const isExpanded = expandedReport === report.reportId;
                            const cleanSummary = stripHtml(report.executiveSummary);
                            const hasScores = report.transformationReadinessScore != null || report.riskExposureIndex != null;

                            return (
                                <div key={report.reportId} className="group">
                                    <div className="px-8 py-6 hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-start gap-5">
                                            {/* Icon */}
                                            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 border border-blue-500/15 flex items-center justify-center shrink-0 mt-0.5">
                                                <Brain className="h-6 w-6 text-blue-400" />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                    <p className="font-black text-white text-sm">HTI Advisory Report</p>
                                                    <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full font-black border ${cfg.bg} ${cfg.text}`}>
                                                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                                        {cfg.label}
                                                    </span>
                                                </div>

                                                <p className="text-xs text-slate-500 font-medium mb-3">
                                                    Generated {new Date(report.generatedAt).toLocaleDateString("en-IN", {
                                                        day: "2-digit", month: "short", year: "numeric",
                                                        hour: "2-digit", minute: "2-digit"
                                                    })}
                                                    {" · "}{report.completedEngines}/{report.totalEngines} engines analysed
                                                </p>

                                                {/* Score pills (if available) */}
                                                {hasScores && (
                                                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                        {report.transformationReadinessScore != null && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/5 border border-emerald-500/15 rounded-lg text-[10px] font-black text-emerald-400">
                                                                <Activity className="h-3 w-3" />
                                                                Readiness: {report.transformationReadinessScore}/100
                                                            </span>
                                                        )}
                                                        {report.riskExposureIndex != null && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/5 border border-amber-500/15 rounded-lg text-[10px] font-black text-amber-400">
                                                                <AlertCircle className="h-3 w-3" />
                                                                Risk: {report.riskExposureIndex}/100
                                                            </span>
                                                        )}
                                                        {report.confidenceScore != null && (
                                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/5 border border-blue-500/15 rounded-lg text-[10px] font-black text-blue-400">
                                                                <ShieldCheck className="h-3 w-3" />
                                                                Confidence: {report.confidenceScore}%
                                                            </span>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Summary */}
                                                <p className={`text-xs text-slate-400 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
                                                    {cleanSummary}
                                                </p>
                                                {cleanSummary.length > 150 && (
                                                    <button onClick={() => setExpandedReport(isExpanded ? null : report.reportId)}
                                                        className="text-[10px] text-blue-400 font-bold mt-1.5 hover:text-blue-300 flex items-center gap-1">
                                                        {isExpanded ? "Show less" : "Show more"}
                                                        <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="shrink-0 flex flex-col gap-2">
                                                {report.status === "approved" && (
                                                    hasPaid ? (
                                                        <>
                                                            <Link to={`/hti/report?reportId=${report.reportId}`}
                                                                className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-blue-900/30 whitespace-nowrap">
                                                                <Eye className="h-3.5 w-3.5" /> View Report
                                                            </Link>
                                                            <a href={`/api/hti/reports/${report.reportId}/pdf`}
                                                                target="_blank" rel="noopener noreferrer"
                                                                className="flex items-center gap-1.5 px-5 py-2 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl font-bold text-xs transition-all whitespace-nowrap">
                                                                <FileText className="h-3.5 w-3.5" /> PDF
                                                            </a>
                                                        </>
                                                    ) : (
                                                        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                                                            className="flex items-center gap-1.5 px-5 py-2.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:bg-amber-500/30 rounded-xl font-bold text-xs transition-all whitespace-nowrap">
                                                            <DollarSign className="h-3.5 w-3.5" /> Unlock Report
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Bottom CTA if has approved reports */}
            {approvedReports.length > 0 && hasPaid && (
                <div className="relative bg-gradient-to-br from-[#010f2e] to-[#023e8a]/40 rounded-3xl border border-blue-500/10 p-8 overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.04]"
                        style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                            <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                                <Radar className="h-7 w-7 text-blue-400" />
                            </div>
                            <div>
                                <h4 className="font-black text-white text-base mb-1">Ready to Act on Your Advisory?</h4>
                                <p className="text-sm text-slate-400 font-medium">View your detailed report or export your transformation proposal.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                            <Link to="/hti/report"
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-900/40">
                                <Eye className="h-4 w-4" /> View Full Report
                            </Link>
                            <Link to="/proposalTransformation"
                                className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl font-bold text-sm transition-colors">
                                <FileText className="h-4 w-4" /> View Proposal
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function HTIDashboard() {
    const loaderData = useLoaderData<typeof loader>() as any;
    const navigation = useNavigation();
    const isGenerating = navigation.state === "submitting";
    const submit = useSubmit();
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);

    const completedCount = loaderData.completedEngines?.length || 0;
    const allEnginesDone = completedCount >= 5;
    const hasPaid = loaderData.hasPaid;

    const gateState = !allEnginesDone ? "locked" : !hasPaid ? "pricing" : "workspace";

    const handleEmployeeSelect = (empCount: number) => {
        setShowEmployeeModal(false);
        const fd = new FormData();
        fd.set("employeeCount", empCount.toString());
        fd.set("alreadyPaid", "false");
        submit(fd, { method: "post" });
    };

    const handleGeneratePaid = () => {
        const fd = new FormData();
        fd.set("alreadyPaid", "true");
        submit(fd, { method: "post" });
    };

    const STEPS = [
        { label: "Complete 5 Engines", done: allEnginesDone, icon: Cpu },
        { label: "Verify Payment", done: hasPaid, icon: ShieldCheck },
        { label: "Generate Advisory", done: loaderData.reports?.some((r: any) => r.status === "approved"), icon: Brain },
    ];

    return (
        <div className="min-h-screen bg-[#080e1c]">
            <Navbar />
            <div className="h-16" />

            {/* ── Hero ─── */}
            <div className="relative overflow-hidden bg-gradient-to-b from-[#010a1f] via-[#021236] to-[#080e1c] border-b border-white/5">
                {/* Animated grid */}
                <div className="absolute inset-0 opacity-[0.04]"
                    style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.6) 1px,transparent 1px)", backgroundSize: "60px 60px" }} />
                {/* Glow blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-indigo-600/8 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative max-w-5xl mx-auto px-6 py-12">
                    <div className="flex items-start gap-7">
                        {/* Brain icon */}
                        <div className="relative shrink-0 hidden sm:block">
                            <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-900/50">
                                <Brain className="h-10 w-10 text-white" />
                            </div>
                            {/* Pulse rings */}
                            <div className="absolute inset-0 rounded-[1.5rem] border-2 border-blue-400/20 animate-ping" style={{ animationDuration: "3s" }} />
                            <div className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-[#010a1f] flex items-center justify-center shadow-lg">
                                <Sparkles className="h-3 w-3 text-white" />
                            </div>
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3 flex-wrap">
                                <h1 className="text-3xl font-black text-white tracking-tight">
                                    HR Transformation Intelligence
                                </h1>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[10px] font-black rounded-full uppercase tracking-widest">
                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                                    HTI — The Brain
                                </span>
                            </div>
                            <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mb-8">
                                HTI is the cognitive layer of HRTek System. It aggregates data from all five assessment engines and
                                generates a unified, AI-powered transformation advisory — the single source of truth for your HR transformation journey.
                            </p>

                            {/* 3-step progress */}
                            <div className="flex items-center gap-0">
                                {STEPS.map(({ label, done, icon: Icon }, i) => (
                                    <div key={label} className="flex items-center">
                                        <div className="flex items-center gap-2.5">
                                            <div className={`h-8 w-8 rounded-xl flex items-center justify-center border transition-all ${
                                                done
                                                    ? "bg-blue-600 border-blue-500 shadow-lg shadow-blue-900/40"
                                                    : "bg-white/5 border-white/10"
                                            }`}>
                                                {done
                                                    ? <CheckCircle2 className="h-4 w-4 text-white" />
                                                    : <Icon className="h-4 w-4 text-slate-500" />
                                                }
                                            </div>
                                            <span className={`text-xs font-bold hidden sm:inline ${done ? "text-slate-200" : "text-slate-500"}`}>
                                                {label}
                                            </span>
                                        </div>
                                        {i < 2 && (
                                            <div className={`w-12 h-px mx-3 ${done ? "bg-blue-600/50" : "bg-white/5"}`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Gate content ─── */}
            <div className="pt-8">
                {gateState === "locked" && (
                    <LockedGateway completedEngines={loaderData.completedEngines || []} requiredEngines={REQUIRED_ENGINES} />
                )}
                {gateState === "pricing" && (
                    <PricingGate htiPricing={loaderData.htiPricing} pricingTier={loaderData.pricingTier} onGetStarted={() => setShowEmployeeModal(true)} />
                )}
                {gateState === "workspace" && (
                    <HTIWorkspace data={loaderData} isGenerating={isGenerating}
                        onGenerate={hasPaid ? handleGeneratePaid : () => setShowEmployeeModal(true)}
                        hasPaid={hasPaid} />
                )}
            </div>

            <EmployeeSizeModal isOpen={showEmployeeModal} onClose={() => setShowEmployeeModal(false)} onSelect={handleEmployeeSelect} />
        </div>
    );
}
