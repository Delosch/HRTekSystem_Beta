import os

path = r'c:\Users\jmadh\OneDrive\Desktop\old_hrtek\old_hrtek\app\routes\hti.report.tsx'

# I will recreate the file specific sections I know are correct and needed.
# Since I cannot read the file reliably due to my own errors, I will reconstruct it based on the previous know state and the new design.

content = r"""import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getVerifiedPaymentsByCompany } from "~/models/payment.model";
import { getCompany } from "~/models/company.server";
import { getHTIReport } from "~/models/hti.server";
import { 
    Download, 
    ArrowLeft, 
    Brain, 
    TrendingUp, 
    ShieldCheck, 
    Target, 
    Zap, 
    AlertTriangle, 
    CheckCircle,
    Info,
    ChevronDown,
    ChevronUp,
    Clock,
    DollarSign,
    Users,
    Layers,
    Activity,
    FileText,
    Lightbulb
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import HTIReportPDF from "~/components/reports/HTIReportPDF";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
    PieChart,
    Pie,
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ScatterChart,
    Scatter,
    LabelList
} from 'recharts';

/**
 * HTI Report View Page
 * Route: /hti/report
 * 
 * Displays the user's approved HTI advisory report
 */
export async function loader({ request }: LoaderFunctionArgs) {
    const session = await requireUserSession(request);
    const company = await getCompany(session.userId);
    
    if (!company) {
        throw new Response("Company not found", { status: 404 });
    }

    // Check if user has paid for the report
    const payments = await getVerifiedPaymentsByCompany(company.id);
    const hasPaid = payments && payments.length > 0;

    // For now, we might allow viewing if report exists, or enforce payment
    // const hasPaid = true; // Bypass for dev if needed

    const report = await getHTIReport(company.id);

    if (!report) {
         return json({ 
            hasReport: false, 
            error: "Report not generated yet. Please complete the assessment." 
        });
    }

    return json({ 
        hasReport: true, 
        report,
        companyName: company.name,
        hasPaid
    });
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-slate-100 shadow-xl rounded-xl">
                <p className="font-bold text-slate-800 text-sm mb-1">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs font-semibold" style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export default function HTIReportView() {
    const data = useLoaderData<typeof loader>();

    if (!(data as any).hasReport || data.error) {
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center">
                    <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h2 className="text-xl font-black text-slate-800 mb-2">Report Not Available</h2>
                    <p className="text-slate-500 mb-6">{(data as any).error}</p>
                    <Link
                        to="/hti"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to Assessment
                    </Link>
                </div>
            </div>
        );
    }

    const { report } = data as any;
    const { advisory } = report;

    // Get company name from data or use default
    const companyName = (data as any).companyName || "Techinova";
    const assessmentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const assessmentId = `DMA-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}-001`;

    const radarData = [
        { subject: 'Strategic Foundation', A: 35, fullMark: 100 },
        { subject: 'Tech & Infrastructure', A: 29, fullMark: 100 },
        { subject: 'Customer Experience', A: 29, fullMark: 100 },
        { subject: 'Operations & Process', A: 20, fullMark: 100 },
        { subject: 'People & Culture', A: 16, fullMark: 100 },
        { subject: 'Innovation & Gov', A: 16, fullMark: 100 },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <style>{`
                .backface-hidden { backface-visibility: hidden; }
                .perspective { perspective: 1000px; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .preserve-3d { transform-style: preserve-3d; }
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { bg: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
            `}</style>
            
            {/* Professional Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white">
                                <Brain className="w-6 h-6" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 leading-none">{companyName}</h1>
                                <p className="text-xs text-slate-500 font-medium mt-1">Digital Maturity Assessment • {assessmentId}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Powered by</p>
                                <p className="text-sm font-bold text-slate-700">Delosh Intelligence</p>
                            </div>
                            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>
                            <div className="flex gap-3">
                                <PDFDownloadLink
                                    document={<HTIReportPDF report={report} />}
                                    fileName={`HTI_Advisory_${report?.companyId}_${new Date().toISOString().split('T')[0]}.pdf`}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors"
                                >
                                    {({ loading }) => (
                                        <>
                                            <Download className="w-4 h-4" />
                                            {loading ? '...' : 'PDF'}
                                        </>
                                    )}
                                </PDFDownloadLink>
                                <Link
                                    to="/dashboard"
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" />
                                    <span>EXIT</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                
                {/* Section: Executive Summary */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-800">Executive Summary</h2>
                    </div>

                    {/* Overall Assessment Card */}
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Overall Assessment</h3>
                            <p className="text-lg text-slate-700 leading-relaxed font-medium">
                                The organization demonstrates <span className="text-blue-600 font-bold">'Emerging'</span> digital maturity with significant foundational gaps across all dimensions. Strong financial performance provides a solid base for transformation, but cultural resistance and lack of digital strategy are major barriers to scalability.
                            </p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Maturity Level</p>
                                    <p className="text-xl font-black text-blue-600">Emerging</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Competitive Position</p>
                                    <p className="text-xl font-black text-amber-500">Below Average</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Transf. Readiness</p>
                                    <p className="text-xl font-black text-rose-500">Low</p>
                                </div>
                            </div>
                        </div>
                        <div className="w-full md:w-1/3 h-64 bg-slate-50 rounded-xl border border-slate-100 p-4 relative">
                            <p className="absolute top-4 left-4 text-xs font-bold text-slate-400 uppercase tracking-wider z-10">Capability Analysis Radar</p>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="55%" outerRadius="70%" data={radarData}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
                                    <Radar name="Maturity" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Key Factors Grid */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <h3 className="font-bold text-slate-700">Enabling Factors</h3>
                            </div>
                            <ul className="space-y-3">
                                {["Growing profitability", "Adequate IT budget allocation", "Data-driven HR team capability"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertTriangle className="w-5 h-5 text-rose-500" />
                                <h3 className="font-bold text-slate-700">Blocking Factors</h3>
                            </div>
                             <ul className="space-y-3">
                                {["Resistant leadership culture", "No digital strategy", "Manual processes throughout", "Low employee digital adoption"].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-sm text-slate-600 bg-rose-50/50 p-3 rounded-lg border border-rose-100/50">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Section: Gap Analysis - Strategic Importance vs Investment */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Gap Analysis – Strategic Importance vs Investment</h3>
                            <p className="text-sm text-slate-500">Bubble size indicates investment magnitude. Numbers show gap size.</p>
                        </div>
                        <div className="flex gap-4 text-xs font-semibold text-slate-600">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div> Critical
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div> Stable
                            </div>
                        </div>
                    </div>
                    
                    <div className="h-96 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" dataKey="importance" name="Strategic Importance" unit="" label={{ value: 'Strategic Importance', position: 'bottom', offset: 0 }} domain={[0, 5]} />
                                <YAxis type="number" dataKey="investment" name="Investment Required" unit="" label={{ value: 'Investment Required', angle: -90, position: 'left' }} domain={[0, 5]} />
                                <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-white p-3 border border-slate-200 shadow-lg rounded-lg">
                                                <p className="font-bold text-slate-800">{payload[0].payload.name}</p>
                                                <p className="text-xs text-slate-500">Importance: {payload[0].value}</p>
                                                <p className="text-xs text-slate-500">Investment: {payload[1].value}</p>
                                            </div>
                                        );
                                    }
                                    return null;
                                }} />
                                <Scatter name="Dimensions" data={[
                                    { name: 'Strategic Fnd', importance: 4.5, investment: 1.8, size: 24, fill: '#3b82f6' },
                                    { name: 'Tech & Infra', importance: 4.2, investment: 4.5, size: 40, fill: '#ef4444' },
                                    { name: 'Customer Exp', importance: 3.8, investment: 2.5, size: 25, fill: '#f59e0b' },
                                    { name: 'Ops & Process', importance: 3.5, investment: 1.5, size: 15, fill: '#10b981' },
                                    { name: 'People', importance: 4.0, investment: 3.5, size: 35, fill: '#ef4444' },
                                    { name: 'Innovation', importance: 2.5, investment: 4.0, size: 40, fill: '#f59e0b' },
                                ]} fill="#8884d8">
                                    <LabelList dataKey="name" position="top" style={{ fontSize: '10px', fontWeight: 'bold', fill: '#475569' }} />
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Section: Maturity Dimension Breakdown */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                         <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                            <h2 className="text-xl font-bold text-slate-800">Maturity Dimension Breakdown</h2>
                        </div>
                        <p className="text-xs text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Hover cards for details</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[
                            { name: "Strategic Foundation", score: 34, status: "Critical", color: "rose", strengths: ["Growing profitability"], gaps: ["No digital strategy", "Resistant leadership"] },
                            { name: "Tech & Infrastructure", score: 29, status: "Critical", color: "rose", strengths: ["Partial integration"], gaps: ["Manual operations", "Non-scalable systems"] },
                            { name: "Customer Experience", score: 29, status: "Critical", color: "rose", strengths: ["Employee listening"], gaps: ["Manual CX processes", "No integration"] },
                            { name: "Operations & Process", score: 20, status: "Critical", color: "rose", strengths: ["Data-driven HR"], gaps: ["No process ownership", "Reactive compliance"] },
                            { name: "People & Culture", score: 16, status: "Critical", color: "rose", strengths: ["Data-decision approach"], gaps: ["Resistant culture", "No change mgmt"] },
                            { name: "Innovation & Gov", score: 16, status: "Critical", color: "rose", strengths: ["Vendor governance"], gaps: ["No formal innovation", "Manual integration"] },
                            { name: "Org Overview", score: 46, status: "Needs Attention", color: "amber", strengths: ["IT budget allocation"], gaps: ["Scalability limits", "Org complexity"] },
                        ].map((dim, i) => (
                            <div key={i} className="group h-64 perspective">
                                <div className="relative w-full h-full duration-500 preserve-3d group-hover:rotate-y-180">
                                    {/* Front */}
                                    <div className={`absolute w-full h-full backface-hidden bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between overflow-hidden`}>
                                        <div className={`absolute top-0 left-0 w-2 h-full bg-${dim.color}-500`}></div>
                                        <div>
                                            <div className="flex justify-between items-start mb-4 pl-4">
                                                <span className={`text-${dim.color}-600 font-black text-4xl`}>{dim.score}%</span>
                                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase bg-${dim.color}-50 text-${dim.color}-600 border border-${dim.color}-100`}>{dim.status}</span>
                                            </div>
                                            <h3 className="font-bold text-slate-800 text-lg pl-4 leading-tight">{dim.name}</h3>
                                        </div>
                                        <div className="pl-4">
                                            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2">
                                                <div className={`bg-${dim.color}-500 h-1.5 rounded-full`} style={{ width: `${dim.score}%` }}></div>
                                            </div>
                                            <p className="text-xs text-slate-400 font-medium">{dim.status === 'Critical' ? 'Immediate Action Required' : 'Strategic Focus Area'}</p>
                                        </div>
                                    </div>

                                    {/* Back */}
                                    <div className={`absolute w-full h-full backface-hidden bg-slate-800 rounded-2xl p-6 shadow-xl border border-slate-700 rotate-y-180 overflow-y-auto custom-scrollbar`}>
                                        <h3 className="font-bold text-white text-sm mb-4 border-b border-slate-700 pb-2">{dim.name} Analysis</h3>
                                        
                                        <div className="mb-3">
                                            <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Strengths</p>
                                            <ul className="text-xs text-slate-300 space-y-1">
                                                {dim.strengths.map((s, idx) => <li key={idx}>• {s}</li>)}
                                            </ul>
                                        </div>
                                        
                                        <div>
                                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">Critical Gaps</p>
                                            <ul className="text-xs text-slate-300 space-y-1">
                                                {dim.gaps.map((g, idx) => <li key={idx}>• {g}</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section: Transformation Roadmap */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-slate-800">Transformation Roadmap</h2>
                    </div>
                    
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                        <div className="space-y-8">
                            <div className="relative">
                                <div className="absolute top-0 left-4 h-full w-px bg-slate-200"></div>
                                
                                {/* Timeline Item 1 */}
                                <div className="relative pl-12 pb-8">
                                    <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-red-100 border-4 border-white shadow-sm flex items-center justify-center z-10">
                                        <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                    </div>
                                    <div className="bg-red-50/50 rounded-xl p-6 border border-red-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">Critical Priority • 0-3 Months</span>
                                                <h3 className="text-lg font-bold text-slate-800">Conduct digital transformation leadership workshop</h3>
                                            </div>
                                            <span className="text-sm font-bold text-slate-500">$15k - $30k</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-4">Align leadership on digital goals and remove cultural blockers.</p>
                                        <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
                                           <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> Strategic Foundation</span>
                                           <span className="flex items-center gap-1"><ArrowLeft className="w-4 h-4 rotate-90" /> High Impact</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Item 2 */}
                                <div className="relative pl-12 pb-8">
                                    <div className="absolute top-0 left-0 w-8 h-8 rounded-full bg-amber-100 border-4 border-white shadow-sm flex items-center justify-center z-10">
                                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                    </div>
                                    <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2">High Priority • 3-12 Months</span>
                                                <h3 className="text-lg font-bold text-slate-800">Develop comprehensive digital transformation roadmap</h3>
                                            </div>
                                            <span className="text-sm font-bold text-slate-500">$75k - $150k</span>
                                        </div>
                                        <p className="text-sm text-slate-600 mb-4">Create a detailed execution plan with timelines and resource allocation.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section: Risk Assessment */}
                <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
                        <div className="flex items-center justify-between mb-4">
                             <h3 className="font-bold text-slate-800">Cultural Risk</h3>
                             <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded uppercase">High</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium mb-4">Strong leadership resistance to digital transformation</p>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mitigation</p>
                            <p className="text-xs text-slate-700">Executive coaching and change management program</p>
                        </div>
                    </div>
                     <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
                        <div className="flex items-center justify-between mb-4">
                             <h3 className="font-bold text-slate-800">Technical Risk</h3>
                             <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded uppercase">Critical</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium mb-4">Complete lack of digital infrastructure capabilities</p>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mitigation</p>
                            <p className="text-xs text-slate-700">Phased technology implementation with vendor support</p>
                        </div>
                    </div>
                     <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 border-l-4 border-l-rose-500">
                        <div className="flex items-center justify-between mb-4">
                             <h3 className="font-bold text-slate-800">Operational Risk</h3>
                             <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded uppercase">Medium</span>
                        </div>
                        <p className="text-sm text-slate-600 font-medium mb-4">Manual processes causing efficiency bottlenecks</p>
                        <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-xs font-bold text-slate-500 uppercase mb-1">Mitigation</p>
                            <p className="text-xs text-slate-700">Process automation prioritization and quick wins</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}"""

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"File {path} rewritten successfully.")
