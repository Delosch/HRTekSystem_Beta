import { json, redirect, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getVerifiedPaymentsByCompany } from "~/models/payment.model.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { getCompanyAdvisories } from "~/models/hti.model.server";
import { getUserProfile } from "~/models/user.model.server";
import {
    Download, ArrowLeft, Brain, Zap, Target, Layers,
    ShieldCheck, TrendingUp, Clock, AlertTriangle,
    Star, Rocket, LayoutDashboard, FileText, ChevronRight,
    Award, ShieldAlert
} from "lucide-react";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis,
    CartesianGrid, Tooltip, ScatterChart as ReScatterChart,
    BarChart, Bar, Cell
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";
import { getEnginePriceByName } from "~/lib/pricing";
import { addOrUpdateCartItem } from "~/models/cart.model.server";
import BoardDossierRenderer from "~/components/reports/BoardDossierRenderer";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireUserSession(request);
    const user = await getUserProfile(session.userId);
    if (!user || !user.organisationId) return redirect("/auth/drx");

    const company = await getCompanyProfile(user.organisationId);
    const engineName = "HR Technology Maturity Analysis";

    // Check payment status
    const payments = await getVerifiedPaymentsByCompany(user.organisationId);
    const isAdmin = (user as any).role === "ADMIN";
    const hasPaid = isAdmin || payments.some(p => p.items?.some((i: any) => i.engineName === engineName));

    if (!hasPaid) {
        const price = getEnginePriceByName(engineName);
        await addOrUpdateCartItem({
            companyId: user.organisationId,
            productName: engineName,
            price: price,
            userId: session.userId,
        });
        return redirect('/payment/checkout');
    }

    const reports = await getCompanyAdvisories(user.organisationId);
    const report = reports?.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0];

    if (!report) return json({ hasReport: false, companyName: company?.company_name });

    return json({ hasReport: true, report, companyName: company?.company_name });
}

export default function HTIAdvisoryReport() {
    const data = useLoaderData<typeof loader>();
    const [activeTab, setActiveTab] = useState("overview");

    if (!data.hasReport) {
        return (
            <div className="min-h-screen bg-[#0a0c12] flex items-center justify-center p-6">
                <div className="text-center space-y-4">
                    <Brain className="w-16 h-16 text-indigo-500 mx-auto animate-pulse" />
                    <h2 className="text-2xl font-bold text-white">Advisory Not Generated</h2>
                    <p className="text-slate-400">Complete all assessments to unlock the cross-engine strategic advisory.</p>
                </div>
            </div>
        );
    }

    const report = (data as any).report;
    const reportData = report.advisory;
    const radarData = reportData?.radarData || [
        { subject: 'Strategy', value: 75 },
        { subject: 'Tech', value: 65 },
        { subject: 'Operations', value: 85 },
        { subject: 'People', value: 60 },
        { subject: 'Innovation', value: 70 },
    ];

    return (
        <div className="min-h-screen bg-[#05060a] text-slate-200 font-sans">
            {/* Header ... */}
            <nav className="sticky top-0 z-50 bg-[#05060a]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <img src="/logo_icon_final.png" alt="Logo" className="w-10 h-10" />
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent uppercase tracking-wider">Premium HTI Advisory</h1>
                        <p className="text-[10px] text-slate-500 font-black tracking-[0.3em] uppercase">{data.companyName} • Board Dossier</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-white/5 border border-white/10 rounded-lg p-1 mr-4">
                        <button onClick={() => setActiveTab("overview")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "overview" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}>Insights Dashboard</button>
                        <button onClick={() => setActiveTab("narrative")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "narrative" ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300'}`}>Executive Briefing</button>
                    </div>
                    <button onClick={() => window.print()} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                        <Download className="w-5 h-5" />
                    </button>
                    <Link to="/dashboard" className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>
            </nav>

            <main className="max-w-[1700px] mx-auto p-8 lg:p-12 space-y-12">
                <AnimatePresence mode="wait">
                    {activeTab === "overview" ? (
                        <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                            {/* HERO ADVISORY CARD */}
                            <section className="bg-gradient-to-br from-indigo-900/30 to-slate-900 border border-indigo-500/20 rounded-[4rem] p-12 relative overflow-hidden group shadow-2xl">
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/10 blur-[120px] -mr-64 -mt-64 rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000" />
                                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                                    <div className="lg:col-span-8">
                                        <div className="flex items-center gap-4 mb-8">
                                            <div className="p-4 bg-indigo-500/20 rounded-3xl border border-indigo-500/30">
                                                <Star className="w-8 h-8 text-indigo-400" />
                                            </div>
                                            <span className="text-sm font-black text-indigo-400 uppercase tracking-[0.4em]">Cross-Engine Strategic Synthesis</span>
                                        </div>
                                        <h2 className="text-4xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                                            Transformation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400 italic">Ecosystem Readiness</span> <br />
                                            is Benchmarked at <span className="underline decoration-indigo-500 underline-offset-[12px]">Optimized Level.</span>
                                        </h2>
                                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-3xl border border-white/10 mb-8 border-l-4 border-l-indigo-500">
                                            <p className="text-xl lg:text-2xl text-slate-300 font-medium leading-relaxed italic mb-4">
                                                "Our multi-engine analysis detects a critical decoupling between technology ambition and cultural readiness. Strategic intervention in governance is prioritized for Q2 FY26."
                                            </p>
                                            <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-widest">
                                                * This synthesis aggregates data from Digital Maturity, Tech Capability, and Financial Roadmap engines to provide a unified strategic directive.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-4 h-[400px] flex flex-col items-center justify-center">
                                        <div className="relative w-full h-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                                                    <PolarGrid stroke="#1e293b" />
                                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 900 }} />
                                                    <Radar name="Maturity" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="mt-4 text-center">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Multi-Axial Capability Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                                {[
                                    { label: "Synthesis Confidence", val: "94.8%", sub: "AI Alignment", icon: Brain, color: "blue" },
                                    { label: "Execution Index", val: "High", sub: "Based on data", icon: Rocket, color: "emerald" },
                                    { label: "Risk Exposure", val: "Moderate", sub: "Governance Gap", icon: ShieldAlert, color: "amber" },
                                    { label: "ROI Potential", val: "3.2x", sub: "3 Year Projection", icon: TrendingUp, color: "purple" }
                                ].map((kpi, i) => (
                                    <div key={i} className="bg-slate-900 border border-white/5 rounded-[2.5rem] p-8 hover:border-white/10 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="p-3 bg-white/5 rounded-2xl" style={{ color: `var(--${kpi.color}-400)` }}>
                                                <kpi.icon className="w-6 h-6" />
                                            </div>
                                            <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global KPI</div>
                                        </div>
                                        <div className="text-4xl font-black text-white mb-2">{kpi.val}</div>
                                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{kpi.label}</div>
                                        <div className="mt-4 text-[10px] font-medium text-slate-600">{kpi.sub}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                                <div className="lg:col-span-12 space-y-12">
                                    <section className="bg-slate-900/40 border border-white/5 rounded-[3.5rem] p-12">
                                        <h3 className="text-3xl font-black text-white mb-12 flex items-center gap-4">
                                            <LayoutDashboard className="w-8 h-8 text-blue-400" />
                                            Executive Insights Consensus
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                                                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">Maturity Status</h4>
                                                <div className="text-4xl font-black text-white">{report.data?.currentState?.maturityLevel || "Optimized"}</div>
                                                <p className="text-slate-500 mt-2">Comprehensive engine consensus</p>
                                            </div>
                                            <div className="p-8 bg-white/5 rounded-3xl border border-white/5">
                                                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Digital Readiness</h4>
                                                <div className="text-4xl font-black text-white">{report.data?.currentState?.digitalReadiness || "Ready"}</div>
                                                <p className="text-slate-500 mt-2">Cultural & Infrastructure index</p>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div key="narrative" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-12">
                            {/* Board Dossier Renderer */}
                            <BoardDossierRenderer report={report.data} engineName="Premium HTI Advisory" />

                            {/* Narrative Content */}
                            <div className="bg-[#0f1118] border border-white/5 rounded-[5rem] p-20 max-w-6xl mx-auto shadow-2xl space-y-24 print:border-none print:shadow-none">
                                <div className="text-center space-y-6 pb-20 border-b border-white/10">
                                    <h2 className="text-7xl font-black text-white italic tracking-tighter">Strategic Analyst Commentary</h2>
                                    <p className="text-2xl text-slate-500 font-medium tracking-[0.2em] uppercase">Narrative Context • {data.companyName}</p>
                                </div>

                                <div className="prose prose-invert prose-2xl max-w-none text-slate-400 leading-[1.6] hti-advisory-content">
                                    {report.data?.executiveSummary ? (
                                        <div dangerouslySetInnerHTML={{ __html: report.data?.executiveSummary }} />
                                    ) : (
                                        <div className="space-y-12">
                                            <div className="flex items-center gap-6 border-l-4 border-indigo-500 pl-8">
                                                <h3 className="text-4xl font-black text-white">Synthesizing Narrative Logic...</h3>
                                            </div>
                                            <p className="text-xl pl-12 text-slate-400 italic">"The HTI Advisory engine is currently generating the detailed narrative logic. Please check back in a moment as we synthesize multi-engine findings."</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>

            <style>{`
                .hti-advisory-content h2 { color: white; font-weight: 900; font-size: 3rem; margin-top: 4rem; margin-bottom: 2rem; border-left: 6px solid #6366f1; padding-left: 2rem; }
                .hti-advisory-content h3 { color: #818cf8; font-weight: 800; font-size: 2rem; margin-top: 3rem; margin-bottom: 1.5rem; }
                .hti-advisory-content p { font-size: 1.25rem; margin-bottom: 1.5rem; line-height: 1.8; }
                .hti-advisory-content ul { list-style: none; padding-left: 2rem; margin-bottom: 2rem; }
                .hti-advisory-content li { position: relative; padding-bottom: 0.75rem; font-size: 1.15rem; }
                .hti-advisory-content li::before { content: "•"; color: #6366f1; font-weight: bold; display: inline-block; width: 1.5em; margin-left: -1.5em; }
                .hti-advisory-content table { width: 100%; border-collapse: collapse; margin: 3rem 0; border-radius: 2rem; overflow: hidden; background: rgba(255,255,255,0.03); }
                .hti-advisory-content th { background: rgba(255,255,255,0.05); padding: 1.5rem; text-align: left; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: white; }
                .hti-advisory-content td { padding: 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); color: #94a3b8; }

                @media print {
                    nav, .no-print { display: none !important; }
                    body { background: white !important; color: black !important; }
                    main { padding: 0 !important; width: 100% !important; max-width: 100% !important; }
                    .bg-[#05060a], .bg-[#0f1118], .bg-slate-900\\/40, .bg-slate-900, .bg-gradient-to-br { background: white !important; border: 1px solid #e2e8f0 !important; color: black !important; }
                    .text-white, .text-slate-200, .text-slate-400, .text-slate-500 { color: black !important; }
                    .hti-advisory-content h2, .hti-advisory-content h3 { color: black !important; border-left-color: #000 !important; }
                    .hti-advisory-content td, .hti-advisory-content th { color: black !important; border-bottom-color: #eee !important; background: white !important; }
                    section { page-break-inside: avoid; margin-bottom: 3rem !important; }
                }
            `}</style>
        </div>
    );
}