import { useState } from "react";
import { Link } from "@remix-run/react";
import {
    ArrowLeft, Download, TrendingUp, CheckCircle,
    Lightbulb, ChevronDown, ChevronUp, Map, Clock, DollarSign, Target
} from "lucide-react";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

interface RoadmapReportProps {
    data: any;
    brandName: string;
}

export default function RoadmapReport({ data, brandName }: RoadmapReportProps) {
    const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

    const result = data?.result || {};
    const roadmapData = result?.roadmap || {};
    const initiatives = result?.initiatives || [];

    // KPI data (Real or Fallback)
    const kpiCards = [
        {
            title: "Overall Progress",
            value: 100,
            unit: "%",
            subtitle: "15% vs last month",
            color: "blue",
            icon: TrendingUp
        },
        {
            title: "Milestones Completed",
            value: "13",
            unit: "/29",
            subtitle: "",
            color: "green",
            icon: CheckCircle
        },
        {
            title: "Projected ROI",
            value: 300,
            unit: "%",
            subtitle: "",
            color: "purple",
            icon: DollarSign
        },
        {
            title: "Timeline",
            value: 24,
            unit: "months",
            subtitle: "",
            color: "orange",
            icon: Clock
        }
    ];

    // Roadmap Phases
    const phases = [
        {
            id: 1,
            title: "Quick Wins",
            timeline: "0-3 months",
            progress: 100,
            status: "Completed",
            milestones: "5/5 milestones completed",
            initiatives: ["Employee Self-Service Portal", "Digital Onboarding", "Mobile App Launch"],
            color: "#10b981"
        },
        {
            id: 2,
            title: "Foundation",
            timeline: "3-9 months",
            progress: 65,
            status: "In Progress",
            milestones: "5/8 milestones completed",
            initiatives: ["Core HRMS Implementation", "Performance Management System", "Learning Platform"],
            color: "#3b82f6"
        },
        {
            id: 3,
            title: "Transformation",
            timeline: "9-18 months",
            progress: 30,
            status: "In Progress",
            milestones: "3/10 milestones completed",
            initiatives: ["AI-Powered Recruitment", "Predictive Analytics", "Talent Marketplace"],
            color: "#8b5cf6"
        },
        {
            id: 4,
            title: "Optimization",
            timeline: "18-24 months",
            progress: 0,
            status: "Planned",
            milestones: "0/6 milestones completed",
            initiatives: ["Advanced Analytics", "Process Automation", "Continuous Improvement"],
            color: "#94a3b8"
        }
    ];

    // ROI Projection Chart Data
    const chartData = [
        { name: 'Q1', roi: -5 },
        { name: 'Q2', roi: -30 },
        { name: 'Q3', roi: -15 },
        { name: 'Q4', roi: 20 },
        { name: 'Q5', roi: 45 },
        { name: 'Q6', roi: 75 },
        { name: 'Q7', roi: 82 },
        { name: 'Q8', roi: 95 },
    ];

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-50 border-blue-200",
            green: "bg-green-50 border-green-200",
            purple: "bg-purple-50 border-purple-200",
            orange: "bg-orange-50 border-orange-200"
        };
        return colors[color] || colors.blue;
    };

    const getIconBgClass = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-500",
            green: "bg-green-500",
            purple: "bg-purple-500",
            orange: "bg-orange-500"
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-sm">H</span>
                                </div>
                                <span className="font-bold text-gray-900 uppercase tracking-wider">HRTEK SYSTEM</span>
                            </div>
                            <nav className="hidden md:flex items-center gap-6 ml-8 text-sm">
                                <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">Overview</Link>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-600">Assessment Dashboard</span>
                                <span className="text-gray-400">/</span>
                                <span className="text-gray-900 font-semibold border-b-2 border-blue-600 pb-1">Auto-generated HR Digital Roadmap & ROI</span>
                            </nav>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => window.print()}
                                className="px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-lg flex items-center gap-2 border border-gray-200"
                            >
                                <Download className="w-4 h-4" />
                                Export Report
                            </button>
                            <button className="px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                + New Comparison
                            </button>
                            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg ml-2">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8 flex items-start gap-6">
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-blue-100 shadow-sm">
                        <Map className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Auto-generated HR Digital Roadmap & ROI</h1>
                        <p className="text-xl text-gray-500 font-medium">Strategic roadmap for HR digital transformation initiatives with ROI projections</p>
                        <div className="mt-4 inline-block bg-gray-100 px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                            Your personalized digital transformation roadmap with phased milestones and ROI projections
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {kpiCards.map((kpi, index) => {
                        const Icon = kpi.icon;
                        return (
                            <div key={index} className={`bg-white rounded-3xl border border-gray-200 p-8 shadow-sm transition-all hover:shadow-md`}>
                                <div className="flex items-start justify-between mb-6">
                                    <h3 className="text-base font-bold text-gray-500">{kpi.title}</h3>
                                    <div className={`w-12 h-12 ${getIconBgClass(kpi.color)} rounded-2xl flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-gray-900">{kpi.value}</span>
                                    <span className="text-xl font-bold text-gray-400">{kpi.unit}</span>
                                </div>
                                {kpi.subtitle && (
                                    <p className="text-sm font-bold text-green-500 mt-4 flex items-center gap-1">
                                        <TrendingUp className="w-4 h-4" /> {kpi.subtitle}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-10 shadow-sm">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Transformation Roadmap</h2>
                    <div className="space-y-12">
                        {phases.map((phase) => (
                            <div key={phase.id} className="relative">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center font-black text-gray-900 border-2 border-gray-200 text-lg">
                                            {phase.id}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-gray-900">{phase.title}</h3>
                                            <p className="text-sm font-bold text-gray-400">{phase.timeline}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest block mb-1">Progress</span>
                                        <span className="text-3xl font-black text-gray-900">{phase.progress}%</span>
                                    </div>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                                    <div
                                        className="h-full transition-all duration-1000 ease-out rounded-full"
                                        style={{ width: `${phase.progress}%`, backgroundColor: phase.color }}
                                    />
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-gray-500">{phase.milestones}</span>
                                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-widest ${phase.status === "Completed" ? "bg-green-100 text-green-700" :
                                            phase.status === "In Progress" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                                        }`}>
                                        {phase.status}
                                    </span>
                                </div>
                                <div className="mt-4">
                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Key Initiatives:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {phase.initiatives.map((init, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-600">
                                                {init}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-10 shadow-sm">
                    <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">ROI Projection Over Time</h2>
                    <ResponsiveContainer width="100%" height={350}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorRoi" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontWeight: 700 }} unit="%" />
                            <Tooltip
                                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '16px' }}
                            />
                            <Area type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRoi)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex items-center gap-2 mb-8">
                        <Lightbulb className="w-8 h-8 text-yellow-500" />
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Strategic Recommendations</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { title: "Strong Digital Infrastructure", priority: "HIGH", text: "Your organization shows excellent foundation in digital infrastructure with 85% maturity.", type: "green" },
                            { title: "Integration Capability Gap", priority: "HIGH", text: "Integration capabilities need improvement. Consider investing in API management and middleware solutions.", type: "blue" },
                            { title: "Recommend Employee Experience Platform", priority: "MEDIUM", text: "Based on your high employee experience score, consider implementing a unified EX platform.", type: "yellow" }
                        ].map((rec, i) => (
                            <div key={i} className={`rounded-2xl border p-6 flex items-start justify-between cursor-pointer transition-all hover:bg-gray-50 ${rec.type === 'green' ? 'bg-green-50 border-green-100' :
                                    rec.type === 'blue' ? 'bg-blue-50 border-blue-100' : 'bg-yellow-50 border-yellow-100'
                                }`}>
                                <div className="flex gap-4">
                                    <div className={`mt-1 p-2 rounded-xl bg-white shadow-sm`}>
                                        {rec.type === 'green' ? <CheckCircle className="w-5 h-5 text-green-600" /> :
                                            rec.type === 'blue' ? <TrendingUp className="w-5 h-5 text-blue-600" /> : <Lightbulb className="w-5 h-5 text-yellow-600" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-black text-gray-900">{rec.title}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${rec.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                                }`}>{rec.priority}</span>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-600">{rec.text}</p>
                                    </div>
                                </div>
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <style>{`
        @media print {
          header { display: none !important; }
          .bg-gray-50 { background-color: white !important; }
          .rounded-3xl { border-radius: 12px !important; }
          main { padding: 0 !important; }
        }
      `}</style>
        </div>
    );
}
