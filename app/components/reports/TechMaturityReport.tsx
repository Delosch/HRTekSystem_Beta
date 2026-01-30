import { useState } from "react";
import { Link } from "@remix-run/react";
import {
    ArrowLeft, Download, TrendingUp, AlertTriangle, CheckCircle,
    Lightbulb, ChevronDown, ChevronUp, FileText, Target, Activity, Cpu, Database, Network
} from "lucide-react";
import {
    ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

interface TechMaturityReportProps {
    data: any;
    brandName: string;
}

export default function TechMaturityReport({ data, brandName }: TechMaturityReportProps) {
    const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

    const result = data?.result || {};
    const scores = result?.dimensionScores || {};

    const kpis = [
        { title: "Overall Maturity", value: 85, unit: "/100", subtitle: "12% vs last month", color: "blue", icon: Target },
        { title: "Digital Infrastructure", value: 85, unit: "%", color: "green", icon: Cpu },
        { title: "Process Automation", value: 72, unit: "%", color: "purple", icon: Activity },
        { title: "Integration Score", value: 55, unit: "%", subtitle: "-5% vs last month", color: "orange", icon: Network },
    ];

    const radarData = [
        { subject: 'Digital Infrastructure', A: 85, fullMark: 100 },
        { subject: 'Process Automation', A: 72, fullMark: 100 },
        { subject: 'Data & Analytics', A: 65, fullMark: 100 },
        { subject: 'Employee Experience', A: 80, fullMark: 100 },
        { subject: 'Integration Capability', A: 55, fullMark: 100 },
        { subject: 'Innovation Readiness', A: 60, fullMark: 100 },
    ];

    const chartData = [
        { name: 'Week 1', progress: 25 },
        { name: 'Week 2', progress: 45 },
        { name: 'Week 3', progress: 70 },
        { name: 'Week 4', progress: 85 },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc] p-6 lg:p-12">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden mb-16">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md p-1">
                                <img src="/logo_icon_final.png" alt="HRTek" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-800">{brandName}</h1>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="font-bold text-blue-600 uppercase tracking-wide">AI-driven HR Tech Diagnostics</span>
                                    <span className="text-slate-400">•</span>
                                    <nav className="flex items-center gap-2">
                                        <Link to="/dashboard" className="hover:text-slate-900">Dashboard</Link>
                                        <span>/</span>
                                        <span className="font-semibold text-slate-900">Tech Diagnostics</span>
                                    </nav>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => window.print()}
                                className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg ml-2">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-12">
                {/* Print-Only Cover Page */}
                <div className="hidden print:block print:break-after-always mb-12">
                    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center border-4 border-double border-blue-600 p-12">
                        <div className="w-64 h-32 mb-12">
                            <img src="/logo_report_final.png" alt="HRTek System" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-6xl font-black text-slate-800 mb-6 tracking-tight">AI-Driven HR Tech Diagnostics</h1>
                        <div className="h-2 w-48 bg-blue-600 rounded-full mb-12"></div>
                        <h2 className="text-4xl font-bold text-gray-700 mb-16">{brandName}</h2>

                        <div className="space-y-6 text-left max-w-xl w-full text-lg">
                            <div className="flex justify-between border-b-2 border-slate-100 pb-4">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Assessment Type</span>
                                <span className="font-bold text-slate-800 font-sans">HR Technology Maturity Diagnostic</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-slate-100 pb-4">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Generated Date</span>
                                <span className="font-bold text-slate-800 font-sans">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-slate-100 pb-4">
                                <span className="font-bold text-slate-400 uppercase tracking-widest text-sm">Status</span>
                                <span className="font-bold text-blue-600 font-sans uppercase">Confidential Analysis</span>
                            </div>
                        </div>

                        <div className="mt-24 text-sm font-bold text-slate-400 uppercase tracking-widest">
                            <p className="mb-2">© {new Date().getFullYear()} HR TEK SYSTEMS. All rights reserved.</p>
                            <p>Proprietary & Confidential Strategic Advisory</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-start gap-8 print:mt-12">
                    <div className="w-20 h-20 bg-white shadow-xl rounded-[2rem] flex items-center justify-center border border-slate-100 p-4">
                        <BarChart3Icon className="w-full h-full text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-slate-800 mb-3 tracking-tight">AI-driven HR Tech Diagnostics</h1>
                        <p className="text-xl font-bold text-slate-400">Comprehensive assessment of your HR technology landscape and digital readiness</p>
                        <p className="mt-4 text-sm font-bold text-slate-500 bg-slate-200/50 px-4 py-1.5 rounded-lg w-fit">Assess your HR technology landscape, identify gaps, and benchmark against industry standards.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 group">
                            <div className="flex justify-between items-start mb-8">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{kpi.title}</span>
                                <div className={`p-4 rounded-2xl ${kpi.color === 'blue' ? 'bg-blue-600' :
                                    kpi.color === 'green' ? 'bg-green-500' :
                                        kpi.color === 'purple' ? 'bg-purple-600' : 'bg-orange-500'
                                    } text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                    <kpi.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black text-slate-800 tracking-tighter">{kpi.value}</span>
                                <span className="text-xl font-bold text-slate-400">{kpi.unit}</span>
                            </div>
                            {kpi.subtitle && (
                                <div className="mt-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-green-500">
                                    <TrendingUp className="w-4 h-4" /> {kpi.subtitle}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-4 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col items-center">
                        <div className="flex items-center gap-2 mb-10 w-full">
                            <Activity className="w-5 h-5 text-blue-500" />
                            <h2 className="text-xl font-black text-slate-800 tracking-tight">Assessment Progress</h2>
                        </div>

                        <div className="relative w-56 h-56 mb-12">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="112" cy="112" r="100" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
                                <circle cx="112" cy="112" r="100" stroke="#10b981" strokeWidth="16" fill="transparent"
                                    strokeDasharray={2 * Math.PI * 100}
                                    strokeDashoffset={2 * Math.PI * 100 * (1 - 1)}
                                    strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-slate-800">100%</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Complete</span>
                            </div>
                        </div>

                        <div className="w-full space-y-6">
                            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl">
                                <span className="text-sm font-bold text-slate-500">Sections Completed</span>
                                <span className="text-xl font-black text-slate-800">10/10</span>
                            </div>
                            <div className="flex justify-between items-center bg-slate-50 p-6 rounded-3xl">
                                <span className="text-sm font-bold text-slate-500">Time Spent</span>
                                <span className="text-xl font-black text-slate-800">50 min</span>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8 bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-slate-800 mb-2">Technology Maturity Assessment</h2>
                        <p className="text-sm font-bold text-slate-400 mb-10">Performance Radar across key dimensions</p>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#f1f5f9" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }} />
                                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Current Maturity" dataKey="A" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={4} />
                                    <Radar name="Industry Benchmark" dataKey="fullMark" stroke="#f1f5f9" fill="none" strokeDasharray="5 5" />
                                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-8 mt-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-600" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Maturity</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-[2px] bg-slate-200" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Benchmark</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
                    <h2 className="text-3xl font-black text-slate-800 mb-12">Critical Technology Gaps</h2>
                    <div className="space-y-4">
                        {[
                            { title: "Integration Capability", text: "Invest in API management platform", gap: 10, priority: "HIGH" },
                            { title: "Innovation Readiness", text: "Establish innovation lab", gap: 8, priority: "HIGH" },
                            { title: "Data & Analytics", text: "Enhance analytics capabilities", gap: 4, priority: "MED" }
                        ].map((row, i) => (
                            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[2rem] border border-slate-50 transition-all hover:bg-slate-50">
                                <div>
                                    <h4 className="text-xl font-black text-slate-800 mb-1">{row.title}</h4>
                                    <p className="text-base font-bold text-slate-400">{row.text}</p>
                                </div>
                                <div className="flex items-center gap-8 mt-4 md:mt-0">
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Gap</span>
                                        <span className="text-3xl font-black text-slate-800">{row.gap}%</span>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${row.priority === 'HIGH' ? 'bg-red-50 text-red-600' : 'bg-yellow-50 text-yellow-600'
                                        }`}>{row.priority}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-12">
                        <Lightbulb className="w-10 h-10 text-yellow-500" />
                        <h2 className="text-3xl font-black text-slate-800">AI-Powered Insights & Recommendations</h2>
                    </div>
                    <div className="space-y-6">
                        {[
                            { title: "Strong Digital Infrastructure", priority: "HIGH", text: "Your organization shows excellent foundation in digital infrastructure with 85% maturity.", color: "green" },
                            { title: "Integration Capability Gap", priority: "HIGH", text: "Integration capabilities need improvement. Consider investing in API management and middleware solutions.", color: "blue" },
                            { title: "Recommended: Employee Experience Platform", priority: "MEDIUM", text: "Based on your high employee experience score, consider implementing a unified EX platform.", color: "yellow" }
                        ].map((insight, i) => (
                            <div key={i} className={`rounded-[2.5rem] border p-8 transition-all hover:-translate-x-2 ${insight.color === 'green' ? 'bg-green-50/50 border-green-100' :
                                insight.color === 'blue' ? 'bg-blue-50/50 border-blue-100' : 'bg-yellow-50/30 border-yellow-100'
                                }`}>
                                <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpandedInsight(expandedInsight === i ? null : i)}>
                                    <div className="flex gap-6">
                                        <div className="p-4 bg-white rounded-3xl shadow-sm h-fit">
                                            {insight.color === 'green' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                                                insight.color === 'blue' ? <Network className="w-6 h-6 text-blue-600" /> : <Lightbulb className="w-6 h-6 text-yellow-600" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-4 mb-2">
                                                <h4 className="text-xl font-black text-slate-800">{insight.title}</h4>
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${insight.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                                    }`}>{insight.priority}</span>
                                            </div>
                                            <p className="text-base font-bold text-slate-500 leading-relaxed">{insight.text}</p>
                                        </div>
                                    </div>
                                    <ChevronDown className={`w-8 h-8 text-slate-300 transition-transform ${expandedInsight === i ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
                    <h2 className="text-3xl font-black text-slate-800 mb-12">Maturity Progress Over Time</h2>
                    <div className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }} dy={20} />
                                <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }} dx={-10} unit="%" />
                                <Tooltip />
                                <Area type="monotone" dataKey="progress" stroke="#3b82f6" strokeWidth={5} fillOpacity={1} fill="url(#colorProgress)" dot={{ r: 6, fill: "#fff", stroke: "#3b82f6", strokeWidth: 3 }} activeDot={{ r: 10 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-12 flex justify-between items-center text-xs font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-500" />
                            <span>Completion Progress</span>
                        </div>
                        <span>4 data points available</span>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
          .print:hidden { display: none !important; }
          body { background-color: white !important; }
          header, .lg:p-12 { padding: 0 !important; }
          .rounded-[3rem], .rounded-[2.5rem], .rounded-[2rem] { border-radius: 12px !important; }
        }
      `}</style>
        </div>
    );
}

function BarChart3Icon(props: any) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3v18h18" />
            <path d="M18 17V9" />
            <path d="M13 17V5" />
            <path d="M8 17v-3" />
        </svg>
    );
}
