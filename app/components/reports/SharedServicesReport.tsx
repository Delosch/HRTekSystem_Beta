import { useState } from "react";
import { Link } from "@remix-run/react";
import {
    ArrowLeft, Download, Users, MapPin, Calculator, ShieldCheck,
    Lightbulb, ChevronDown, ChevronUp, UserPlus, Building2, Briefcase
} from "lucide-react";

interface SharedServicesReportProps {
    data: any;
    brandName: string;
}

export default function SharedServicesReport({ data, brandName }: SharedServicesReportProps) {
    const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

    const result = data?.result || {};

    const kpis = [
        { title: "Total Headcount", value: "71", unit: "FTEs", color: "blue", icon: Users },
        { title: "Service Locations", value: "4", unit: "cities", color: "green", icon: MapPin },
        { title: "Cost Savings", value: "30", unit: "%", subtitle: "30% vs last month", color: "purple", icon: Calculator },
        { title: "Avg SLA", value: "96.7", unit: "%", color: "orange", icon: ShieldCheck },
    ];

    const distribution = [
        { label: "Transactional SSC", value: 20, percentage: 28, color: "bg-blue-500" },
        { label: "COE", value: 31, percentage: 44, color: "bg-purple-500" },
        { label: "Business Partners", value: 20, percentage: 28, color: "bg-green-500" },
    ];

    const serviceCatalog = [
        { service: "Payroll Processing", type: "Transactional", headcount: 12, location: "Bangalore", sla: "99.5%" },
        { service: "Benefits Administration", type: "Transactional", headcount: 8, location: "Mumbai", sla: "98.0%" },
        { service: "Talent Acquisition", type: "COE", headcount: 15, location: "Hyderabad", sla: "95.0%" },
        { service: "Learning & Development", type: "COE", headcount: 10, location: "Pune", sla: "97.0%" },
        { service: "HR Analytics", type: "COE", headcount: 6, location: "Bangalore", sla: "96.5%" },
        { service: "Employee Relations", type: "Business Partner", headcount: 20, location: "Multiple", sla: "94.0%" },
    ];

    return (
        <div className="min-h-screen bg-[#f8fafc]">
            <header className="bg-white border-b border-gray-100 sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md p-1">
                                <img src="/logo_icon_final.png" alt="HRTek" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-[#091e42]">{brandName}</h1>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="font-bold text-[#0052cc] uppercase tracking-wide">Shared Services Operating Model</span>
                                    <span className="text-gray-400">•</span>
                                    <nav className="flex items-center gap-2">
                                        <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
                                        <span>/</span>
                                        <span className="font-semibold text-[#091e42]">Operating Model Planner</span>
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
                                <ArrowLeft className="w-6 h-6 text-gray-400" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Print-Only Cover Page */}
                <div className="hidden print:block print:break-after-always mb-12">
                    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center border-4 border-double border-[#0052cc] p-12">
                        <div className="w-64 h-32 mb-12">
                            <img src="/logo_report_final.png" alt="HRTek System" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-6xl font-black text-[#091e42] mb-6 tracking-tight">Shared Services Operating Model Planner</h1>
                        <div className="h-2 w-48 bg-[#0052cc] rounded-full mb-12"></div>
                        <h2 className="text-4xl font-bold text-gray-700 mb-16">{brandName}</h2>

                        <div className="space-y-6 text-left max-w-xl w-full text-lg">
                            <div className="flex justify-between border-b-2 border-gray-100 pb-4">
                                <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Assessment Type</span>
                                <span className="font-bold text-[#091e42] font-sans">Shared Services Operating Model</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-gray-100 pb-4">
                                <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Generated Date</span>
                                <span className="font-bold text-[#091e42] font-sans">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-gray-100 pb-4">
                                <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Status</span>
                                <span className="font-bold text-[#0052cc] font-sans uppercase">Confidential Analysis</span>
                            </div>
                        </div>

                        <div className="mt-24 text-sm font-bold text-gray-400 uppercase tracking-widest">
                            <p className="mb-2">© {new Date().getFullYear()} HR TEK SYSTEMS. All rights reserved.</p>
                            <p>Proprietary & Confidential Strategic Advisory</p>
                        </div>
                    </div>
                </div>

                <div className="mb-12 flex gap-8 items-start print:mt-12">
                    <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center p-4 shadow-sm border border-gray-100">
                        <Building2 className="w-full h-full text-gray-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black text-[#091e42] mb-3">Shared Services Operating Model Planner</h1>
                        <p className="text-xl font-bold text-gray-500">Design and optimize your HR shared services operating model</p>
                        <p className="mt-4 text-sm font-semibold text-gray-400">Design your optimal shared services model with SSC, COE, and Business Partner structure.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    {kpis.map((kpi, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                            <div className="flex justify-between items-start mb-6">
                                <span className="text-sm font-bold text-gray-400">{kpi.title}</span>
                                <div className={`p-3 rounded-2xl ${kpi.color === 'blue' ? 'bg-blue-600' :
                                    kpi.color === 'green' ? 'bg-green-500' :
                                        kpi.color === 'purple' ? 'bg-purple-600' : 'bg-orange-500'
                                    } text-white shadow-lg`}>
                                    <kpi.icon className="w-6 h-6" />
                                </div>
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-black text-[#091e42]">{kpi.value}</span>
                                <span className="text-xl font-bold text-[#091e42]">{kpi.unit}</span>
                            </div>
                            {kpi.subtitle && (
                                <div className="mt-4 text-xs font-bold text-green-500 flex items-center gap-1">
                                    <ChevronDown className="w-4 h-4 rotate-180" /> {kpi.subtitle}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-full">
                            <h2 className="text-2xl font-black text-[#091e42] mb-8">Headcount Distribution</h2>
                            <div className="space-y-10">
                                {distribution.map((item, i) => (
                                    <div key={i}>
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="font-bold text-gray-600">{item.label}</span>
                                            <span className="font-black text-[#091e42]">{item.value} FTEs</span>
                                        </div>
                                        <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full ${item.color}`} style={{ width: `${item.percentage}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-400 mt-2 block">{item.percentage}% of total</span>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-12 p-6 bg-green-50 rounded-3xl border border-green-100">
                                <span className="text-sm font-bold text-green-600 block mb-4">Projected Cost Savings</span>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm font-semibold text-gray-500">Current Cost:</span>
                                    <span className="font-black text-gray-700">₹15 Cr</span>
                                </div>
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-sm font-semibold text-gray-500">Projected Cost:</span>
                                    <span className="font-black text-gray-700">₹10.5 Cr</span>
                                </div>
                                <div className="pt-4 border-t border-green-200 flex justify-between items-center">
                                    <span className="text-sm font-black text-green-700 uppercase tracking-widest">Annual Savings:</span>
                                    <span className="text-xl font-black text-green-700">₹4.5 Cr</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-full">
                            <h2 className="text-2xl font-black text-[#091e42] mb-8">Service Catalog & Structure</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                            <th className="pb-4">Service</th>
                                            <th className="pb-4">Type</th>
                                            <th className="pb-4">Headcount</th>
                                            <th className="pb-4">Location</th>
                                            <th className="pb-4">SLA</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {serviceCatalog.map((row, i) => (
                                            <tr key={i} className="text-sm font-bold group hover:bg-gray-50 transition-colors">
                                                <td className="py-5 text-[#091e42]">{row.service}</td>
                                                <td className="py-5">
                                                    <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest ${row.type === 'Transactional' ? 'bg-blue-100 text-blue-700' :
                                                        row.type === 'COE' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'
                                                        }`}>
                                                        {row.type}
                                                    </span>
                                                </td>
                                                <td className="py-5 text-[#091e42]">{row.headcount}</td>
                                                <td className="py-5 text-gray-500">{row.location}</td>
                                                <td className="py-5 text-green-600 font-extrabold">{row.sla}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[2rem] p-10 shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-10">
                        <Lightbulb className="w-8 h-8 text-yellow-500" />
                        <h2 className="text-3xl font-black text-[#091e42]">Design Recommendations</h2>
                    </div>
                    <div className="space-y-6">
                        {[
                            { title: "Strong Digital Infrastructure", priority: "HIGH", text: "Your organization shows excellent foundation in digital infrastructure with 85% maturity.", type: "green" },
                            { title: "Integration Capability Gap", priority: "HIGH", text: "Integration capabilities need improvement. Consider investing in API management and middleware solutions.", type: "blue" },
                            { title: "Recommended Employee Experience Platform", priority: "MEDIUM", text: "Based on your high employee experience score, consider implementing a unified EX platform.", type: "yellow" }
                        ].map((rec, i) => (
                            <div key={i} className={`rounded-[1.5rem] border p-8 flex items-start justify-between ${rec.type === 'green' ? 'bg-green-50/50 border-green-100' :
                                rec.type === 'blue' ? 'bg-blue-50/50 border-blue-100' : 'bg-yellow-50/50 border-yellow-100'
                                }`}>
                                <div className="flex gap-6">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm h-fit">
                                        {rec.type === 'green' ? <ShieldCheck className="w-6 h-6 text-green-600" /> :
                                            rec.type === 'blue' ? <Users className="w-6 h-6 text-blue-600" /> : <Lightbulb className="w-6 h-6 text-yellow-600" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <h4 className="text-lg font-black text-[#091e42]">{rec.title}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${rec.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                                }`}>{rec.priority}</span>
                                        </div>
                                        <p className="text-base font-bold text-gray-500">{rec.text}</p>
                                    </div>
                                </div>
                                <ChevronDown className="w-6 h-6 text-gray-300" />
                            </div>
                        ))}
                    </div>
                </div>
            </main>

            <style>{`
        @media print {
          header { display: none !important; }
          .bg-[#f8fafc] { background-color: white !important; }
          main { padding: 0 !important; }
          .shadow-sm { box-shadow: none !important; }
        }
      `}</style>
        </div>
    );
}
