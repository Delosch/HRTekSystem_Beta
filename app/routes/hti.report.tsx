import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getVerifiedPaymentsByCompany } from "~/models/payment.model.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { getCompanyAdvisories } from "~/models/hti.model.server";
import { getUserProfile } from "~/models/user.model.server";
import {
    Download,
    ArrowLeft,
    Brain,
    AlertTriangle,
    CheckCircle,
    Layers,
    Clock,
    ShieldCheck,
    Target,
    Zap,
    TrendingUp,
    FileText,
    ChevronRight
} from "lucide-react";
import HTIReportPDF from "../components/reports/HTIReportPDF";
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    ScatterChart,
    Scatter,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LabelList,
    Cell
} from 'recharts';
import { motion } from "framer-motion";
import Navbar from "~/components/HomePageComponents/Navbar";

import { getEnginePriceByName } from "~/lib/pricing";
import { addOrUpdateCartItem } from "~/models/cart.model.server";

/**
 * HTI Report View Page
 * Route: /hti/report
 */
export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireUserSession(request);

    // Get user to find company
    const user = await getUserProfile(session.userId);
    if (!user || !user.organisationId) {
        throw new Response("User or Company not found", { status: 404 });
    }

    const company = await getCompanyProfile(user.organisationId);
    if (!company) {
        throw new Response("Company profile not found", { status: 404 });
    }

    const engineName = "HR Technology Maturity Analysis";

    // Check payment status
    const payments = await getVerifiedPaymentsByCompany(user.organisationId);
    const hasPaid = payments.some(p => p.items?.some((i: any) => i.engineName === engineName));
    const isAdmin = (user as any).role === "ADMIN";

    if (!hasPaid && !isAdmin) {
        // Redirect to payment: Add to cart first then checkout
        const price = getEnginePriceByName(engineName);
        await addOrUpdateCartItem({
            companyId: user.organisationId,
            productName: engineName,
            price: price,
            userId: session.userId,
        });
        return redirect('/payment/checkout');
    }

    // Get the latest report
    const companyId = user.organisationId;
    const reports = await getCompanyAdvisories(companyId);

    const report = reports && reports.length > 0
        ? reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
        : null;

    if (!report) {
        return json({
            hasReport: false,
            error: "Report not generated yet. Please complete the assessment.",
            companyName: company.company_name
        });
    }

    return json({
        hasReport: true,
        report,
        companyName: company.company_name,
        hasPaid
    });
}

// --- Animation Variants ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HTIReportView() {
    const data = useLoaderData<typeof loader>();

    // Error State Design
    if ('error' in data || !(data as any).hasReport) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border border-white/20 text-center"
                >
                    <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-amber-200 shadow-lg">
                        <AlertTriangle className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-3">Report Unavailable</h2>
                    <p className="text-slate-500 mb-8 leading-relaxed">
                        {(data as any).error}
                    </p>
                    <div className="flex items-center gap-4">

                    </div>
                </motion.div>
            </div>
        );
    }

    const { report } = data as any;
    // In a real scenario, map 'report' data to these visualize structures
    const companyName = (data as any).companyName || "Organization";
    const assessmentId = `REF - ${report.pk?.slice(-6) || '0001'} `;

    // Mock Data for Visualization (Replace/Map with real report data if structure known)
    const radarData = [
        { subject: 'Strategic', A: 35, fullMark: 100 },
        { subject: 'Technology', A: 29, fullMark: 100 },
        { subject: 'Customer', A: 29, fullMark: 100 },
        { subject: 'Operations', A: 20, fullMark: 100 },
        { subject: 'People', A: 16, fullMark: 100 },
        { subject: 'Innovation', A: 16, fullMark: 100 },
    ];

    const scatterData = [
        { name: 'Strategy', importance: 4.5, investment: 1.8, size: 24, fill: '#3b82f6' }, // Blue
        { name: 'Tech', importance: 4.2, investment: 4.5, size: 40, fill: '#ef4444' },     // Red
        { name: 'CX', importance: 3.8, investment: 2.5, size: 25, fill: '#f59e0b' },       // Amber
        { name: 'Ops', importance: 3.5, investment: 1.5, size: 15, fill: '#10b981' },       // Emerald
        { name: 'People', importance: 4.0, investment: 3.5, size: 35, fill: '#ef4444' },     // Red
        { name: 'Innovation', importance: 2.5, investment: 4.0, size: 40, fill: '#f59e0b' }, // Amber
    ];

    return (
        <div className="min-h-screen bg-[#F8F9FC] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            <style>{`
    .backface - hidden { backface - visibility: hidden; }
                .perspective { perspective: 1000px; }
                .rotate - y - 180 { transform: rotateY(180deg); }
                .preserve - 3d { transform - style: preserve - 3d; }
                .custom - scrollbar:: -webkit - scrollbar { width: 6px; }
                .custom - scrollbar:: -webkit - scrollbar - track { background: transparent; }
                .custom - scrollbar:: -webkit - scrollbar - thumb { background - color: #cbd5e1; border - radius: 20px; }
                .glass - card { background: rgba(255, 255, 255, 0.9); backdrop - filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.6); }
`}</style>

            {/* Sticky Blurry Header */}
            <motion.header
                initial={{ y: -100 }} animate={{ y: 0 }}
                className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/" className="flex items-center group">
                            <img
                                src="/logo_icon_final.png"
                                alt="HR-TEK SYSTEM"
                                className="h-12 w-auto object-contain transform group-hover:scale-105 transition-transform"
                            />
                        </Link>
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-tight">{companyName}</h1>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded border border-indigo-100">Digital Maturity Report</span>
                                <span>•</span>
                                <span>{assessmentId}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">

                        <Link to="/dashboard" className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Exit Report">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </motion.header>

            <motion.main
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8"
            >

                {/* --- HERO SECTION: Executive Summary --- */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Overall Sentiment */}
                    <div className="lg:col-span-2 glass-card rounded-3xl p-8 shadow-xl shadow-indigo-100/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>

                        <div className="relative z-10">
                            <h2 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Executive Summary
                            </h2>
                            <div className="mb-8">
                                <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                                    Digital Maturity is <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Emerging</span>.
                                </h3>
                                <p className="text-slate-600 text-lg leading-relaxed max-w-2xl">
                                    The organization shows potential with strong financial foundations, but <span className="text-slate-900 font-semibold decoration-indigo-300 decoration-2 underline-offset-2 underline">strategic alignment</span> and <span className="text-slate-900 font-semibold decoration-pink-300 decoration-2 underline-offset-2 underline">operational digitization</span> are critical bottlenecks preventing scalability.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                {[
                                    { label: "Maturity Index", value: "46/100", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
                                    { label: "Market Position", value: "Lagging", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
                                    { label: "Readiness", value: "Low", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-100" }
                                ].map((stat, i) => (
                                    <div key={i} className={`p - 4 rounded - 2xl ${stat.bg} border ${stat.border} `}>
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{stat.label}</p>
                                        <p className={`text - xl font - black ${stat.color} `}>{stat.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right: Radar Chart */}
                    <div className="glass-card rounded-3xl p-6 shadow-xl shadow-indigo-100/50 flex flex-col relative overflow-hidden">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 z-10">Capability Radar</h3>
                        <div className="flex-1 min-h-[250px] relative z-10 -ml-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                    <defs>
                                        <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.1} />
                                        </linearGradient>
                                    </defs>
                                    <PolarGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Maturity" dataKey="A" stroke="#6366f1" strokeWidth={3} fill="url(#radarFill)" />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        {/* Decorative Background Element */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-violet-100 rounded-full blur-3xl opacity-60"></div>
                    </div>
                </motion.section>

                {/* --- DIMENSION CARDS (Flip Effect) --- */}
                <motion.section variants={itemVariants}>
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Layers className="w-5 h-5 text-indigo-500" /> Dimension Analysis
                        </h3>
                        <div className="flex gap-2">
                            <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2 py-1 rounded-md border border-rose-100"><span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Critical</span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-100"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Attention</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { name: "Strategic Foundation", score: 34, status: "Critical", icon: Target, strengths: ["Financial Base"], gaps: ["Digital Strategy", "Leadership Buy-in"] },
                            { name: "Technology & Infra", score: 29, status: "Critical", icon: ShieldCheck, strengths: ["Basic Security"], gaps: ["Legacy Systems", "No Integration"] },
                            { name: "Customer Experience", score: 29, status: "Critical", icon: TrendingUp, strengths: ["Support Team"], gaps: ["No Omnichannel", "Manual CRM"] },
                            { name: "Organization Overview", score: 46, status: "Attention", icon: FileText, strengths: ["IT Budget"], gaps: ["Siloed Teams", "Slow Decisions"] },
                        ].map((dim, i) => {
                            const isCrit = dim.status === 'Critical';
                            const color = isCrit ? 'rose' : 'amber';
                            const Icon = dim.icon;

                            return (
                                <div key={i} className="group h-[320px] perspective cursor-pointer">
                                    <div className="relative w-full h-full duration-700 preserve-3d group-hover:rotate-y-180 transition-all ease-in-out">
                                        {/* FRONT FACE */}
                                        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl p-6 shadow-lg shadow-slate-200/50 border border-slate-100 flex flex-col justify-between overflow-hidden">
                                            {/* Top Decor */}
                                            <div className={`absolute top - 0 right - 0 p - 4 opacity - 10 text - ${color} -500`}>
                                                <Icon className="w-24 h-24 transform translate-x-4 -translate-y-4" />
                                            </div>

                                            <div>
                                                <div className={`w - 12 h - 12 rounded - 2xl bg - ${color} -50 flex items - center justify - center text - ${color} -500 mb - 6`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-800 mb-1">{dim.name}</h4>
                                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{dim.status} Priority</p>
                                            </div>

                                            <div className="space-y-4 relative z-10">
                                                <div className="flex items-end gap-2">
                                                    <span className={`text - 5xl font - black text - slate - 800`}>{dim.score}</span>
                                                    <span className="text-sm font-semibold text-slate-400 mb-2">/100</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${dim.score}% ` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className={`h - full rounded - full bg - gradient - to - r from - ${color} -500 to - ${color} -400 shadow - [0_0_10px_rgba(244, 63, 94, 0.4)]`}
                                                    ></motion.div>
                                                </div>
                                                <div className="flex justify-center mt-2">
                                                    <span className={`text - xs font - bold text - ${color} -600 bg - ${color} -50 px - 3 py - 1 rounded - full border border - ${color} -100 flex items - center gap - 1`}>
                                                        Tap for Insights <ChevronRight className="w-3 h-3" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* BACK FACE */}
                                        <div className="absolute w-full h-full backface-hidden bg-slate-900 rounded-3xl p-6 shadow-xl rotate-y-180 overflow-hidden flex flex-col text-white">
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                                            <h4 className="font-bold text-lg mb-6 flex items-center gap-2">
                                                <Icon className="w-5 h-5 text-indigo-400" /> Analysis
                                            </h4>

                                            <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                                                <div>
                                                    <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                        <CheckCircle className="w-3 h-3" /> Strengths
                                                    </p>
                                                    <ul className="text-sm text-slate-300 space-y-2">
                                                        {dim.strengths.map(s => <li key={s} className="flex gap-2"><span className="text-emerald-500">•</span> {s}</li>)}
                                                    </ul>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> Critical Gaps
                                                    </p>
                                                    <ul className="text-sm text-slate-300 space-y-2">
                                                        {dim.gaps.map(g => <li key={g} className="flex gap-2"><span className="text-rose-500">•</span> {g}</li>)}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.section>

                {/* --- SPLIT SECTION: Gap Bubble Chart & Roadmap --- */}
                <motion.section variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* GAP ANALYSIS */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col">
                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <Target className="w-5 h-5 text-indigo-500" /> Strategic Gaps
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">Impact vs. Investment Matrix</p>
                        </div>

                        <div className="flex-1 w-full min-h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis type="number" dataKey="importance" name="Strategic Importance" unit="" domain={[0, 5]} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Strategic Importance →', position: 'bottom', offset: 0, fontSize: 10, fill: '#64748b' }} />
                                    <YAxis type="number" dataKey="investment" name="Investment Required" unit="" domain={[0, 5]} tick={{ fontSize: 10, fill: '#94a3b8' }} label={{ value: 'Investment Required →', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }} />
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }}></div>
                                                            <p className="font-bold text-slate-800">{data.name}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-xs text-slate-500">Importance: <span className="font-bold text-slate-700">{data.importance}</span></p>
                                                            <p className="text-xs text-slate-500">Investment: <span className="font-bold text-slate-700">{data.investment}</span></p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Scatter name="Dimensions" data={scatterData}>
                                        <LabelList dataKey="name" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#64748b' }} />
                                    </Scatter>
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* ROADMAP TIMELINE */}
                    <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-8 shadow-xl shadow-indigo-900/20 text-white relative overflow-hidden">
                        {/* Background Flares */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20"></div>

                        <div className="relative z-10">
                            <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-indigo-400" /> Priority Roadmap
                            </h3>

                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-indigo-400 before:via-purple-400 before:to-transparent before:opacity-30">

                                {/* Timeline Item 1 */}
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-indigo-500/50 bg-indigo-900/80 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-indigo-300">
                                        <span className="font-bold text-sm">1</span>
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:border-indigo-500/50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Critical • Month 0-3</span>
                                            <span className="text-xs text-slate-400 font-mono">$15k-30k</span>
                                        </div>
                                        <h4 className="font-bold text-indigo-100 mb-2">Leadership Digital Workshop</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">Align executive vision and unlock budget for testing phase.</p>
                                    </div>
                                </div>

                                {/* Timeline Item 2 */}
                                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-purple-500/50 bg-indigo-900/80 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 text-purple-300">
                                        <span className="font-bold text-sm">2</span>
                                    </div>
                                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">High • Month 3-12</span>
                                            <span className="text-xs text-slate-400 font-mono">$75k+</span>
                                        </div>
                                        <h4 className="font-bold text-indigo-100 mb-2">Core System Integration</h4>
                                        <p className="text-xs text-slate-400 leading-relaxed">Connect HRIS with Payroll to eliminate manual data entry errors.</p>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </motion.section>

            </motion.main>
        </div>
    );
}