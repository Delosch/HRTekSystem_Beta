import { useState } from "react";
import { Link } from "@remix-run/react";
import {
    ArrowLeft, Download, CheckCircle, AlertTriangle, ShieldCheck,
    Lightbulb, ChevronDown, Award, PieChart, Activity, Info, BarChart3, Filter
} from "lucide-react";
import {
    ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, PieChart as RePieChart, Pie, Cell, Tooltip
} from "recharts";

interface VendorFitReportDashboardProps {
    data: any;
    brandName: string;
}

export default function VendorFitReportDashboard({ data, brandName }: VendorFitReportDashboardProps) {
    const [selectedVendor, setSelectedVendor] = useState("Vendor A");

    const vendors = [
        { name: "Vendor A", score: 92, status: "TOP CHOICE", cost: "₹96 Lakhs", color: "#10b981", bg: "bg-green-50", border: "border-green-100" },
        { name: "Vendor B", score: 78, status: "MODERATE", cost: "₹82 Lakhs", color: "#f59e0b", bg: "bg-yellow-50", border: "border-yellow-100" },
        { name: "Vendor C", score: 65, status: "FAIRLY FIT", cost: "₹110 Lakhs", color: "#3b82f6", bg: "bg-blue-50", border: "border-blue-100" },
    ];

    const radarData = [
        { subject: 'Cost Efficiency', A: 100, B: 80, C: 60, fullMark: 100 },
        { subject: 'Support', A: 90, B: 70, C: 80, fullMark: 100 },
        { subject: 'Quality', A: 95, B: 85, C: 70, fullMark: 100 },
        { subject: 'Delivery', A: 85, B: 75, C: 75, fullMark: 100 },
        { subject: 'Tech Fit', A: 90, B: 80, C: 85, fullMark: 100 },
        { subject: 'Compliance', A: 95, B: 90, C: 90, fullMark: 100 },
    ];

    const tcoData = [
        { name: 'License', value: 60, color: '#3b82f6' },
        { name: 'Implementation', value: 25, color: '#10b981' },
        { name: 'Training', value: 15, color: '#f59e0b' },
    ];

    const scoringMatrix = [
        { param: "Functional Coverage", weight: "30%", a: "9/10", b: "7/10", c: "6/10", impact: "HIGH" },
        { param: "Technical Architecture", weight: "20%", a: "8.5/10", b: "8/10", c: "7/10", impact: "HIGH" },
        { param: "User Experience (UX)", weight: "15%", a: "9/10", b: "6/10", c: "7/10", impact: "MED" },
        { param: "Cost of Ownership", weight: "25%", a: "7/10", b: "9/10", c: "5/10", impact: "HIGH" },
        { param: "Vendor Viability", weight: "10%", a: "8.5/10", b: "8/10", c: "8/10", impact: "LOW" },
    ];

    return (
        <div className="min-h-screen bg-[#f1f5f9] p-4 lg:p-10">
            <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-[#0047cc] rounded-xl flex items-center justify-center p-2">
                        <BarChart3 className="text-white w-full h-full" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#1e293b] tracking-tight">Cognitive HCM Vendor Fit Engine</h1>
                        <p className="text-gray-500 font-bold">Intelligent vendor selection and HCM system recommendations</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => window.print()} className="px-6 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-black text-slate-600 shadow-sm flex items-center gap-2 hover:bg-slate-50 transition-all">
                        <Download className="w-4 h-4" /> Export Report
                    </button>
                    <button className="px-6 py-3 bg-[#0047cc] rounded-2xl text-sm font-black text-white shadow-xl flex items-center gap-2 hover:bg-[#0037a3] transform hover:-translate-y-1 transition-all">
                        + New Comparison
                    </button>
                    <Link to="/dashboard" className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                </div>
            </header>

            <div className="max-w-7xl mx-auto space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {vendors.map((vendor, i) => (
                        <div key={i} className={`relative bg-white rounded-[2.5rem] p-10 border-2 transition-all hover:shadow-2xl hover:scale-[1.02] cursor-pointer ${vendor.name === selectedVendor ? 'border-[#0047cc]' : 'border-transparent'
                            }`} onClick={() => setSelectedVendor(vendor.name)}>
                            {vendor.name === selectedVendor && (
                                <div className="absolute top-6 right-6 w-8 h-8 bg-[#0047cc] rounded-full flex items-center justify-center">
                                    <CheckCircle className="text-white w-5 h-5" />
                                </div>
                            )}
                            <div className="flex flex-col gap-6">
                                <div>
                                    <h3 className="text-2xl font-black text-[#1e293b] mb-2">{vendor.name}</h3>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${vendor.status === 'TOP CHOICE' ? 'bg-green-100 text-green-700' :
                                            vendor.status === 'MODERATE' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                                        }`}>{vendor.status}</span>
                                </div>
                                <div>
                                    <div className="flex justify-between items-end mb-4">
                                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Fit Score</span>
                                        <span className="text-5xl font-black text-[#1e293b]">{vendor.score}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${vendor.score}%`, backgroundColor: vendor.color }} />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-100">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Est. 1st Year Cost</span>
                                    <span className="text-2xl font-black text-[#1e293b]">{vendor.cost}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
                        <h2 className="text-2xl font-black text-[#1e293b] mb-2">Comparative Analysis</h2>
                        <p className="text-sm font-bold text-slate-400 mb-10">Performance Radar across key dimensions</p>
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="#f1f5f9" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontWeight: 900, fontSize: 10 }} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Vendor A" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={3} />
                                    <Radar name="Vendor B" dataKey="B" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} strokeWidth={3} />
                                    <Radar name="Vendor C" dataKey="C" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={3} />
                                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="flex justify-center gap-8 mt-6">
                            {vendors.map((v, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: v.color }} />
                                    <span className="text-xs font-black text-slate-500 uppercase tracking-wider">{v.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100 flex flex-col justify-between">
                        <div>
                            <h2 className="text-2xl font-black text-[#1e293b] mb-2">Cost Breakdown (TCO)</h2>
                            <div className="h-[250px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RePieChart>
                                        <Pie data={tcoData} dataKey="value" innerRadius={80} outerRadius={100} paddingAngle={10} stroke="none">
                                            {tcoData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </RePieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Total Cost</span>
                                    <span className="text-3xl font-black text-[#1e293b]">₹96.0L</span>
                                    <span className="text-[10px] font-bold text-slate-500">First Year Spend</span>
                                </div>
                            </div>
                            <div className="space-y-4 mt-8">
                                {tcoData.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm font-black text-slate-600 uppercase tracking-tighter">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-[#1e293b]">{item.value}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Risk Assessment</span>
                                <Info className="w-3 h-3 text-slate-400" />
                            </div>
                            <div className="relative h-2 w-full bg-gradient-to-r from-green-500 via-yellow-400 to-red-500 rounded-full mb-6">
                                <div className="absolute top-1/2 left-[20%] w-1 h-8 bg-black -translate-y-1/2 rounded-full shadow-lg" />
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Overall Risk:</span>
                                    <span className="text-xl font-black text-green-600">Low</span>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-center"><span className="text-[8px] font-black text-slate-400 uppercase block">Low</span></div>
                                    <div className="text-center"><span className="text-[8px] font-black text-slate-400 uppercase block">Med</span></div>
                                    <div className="text-center"><span className="text-[8px] font-black text-slate-400 uppercase block">High</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
                    <div className="flex justify-between items-center mb-10">
                        <div>
                            <h2 className="text-3xl font-black text-[#1e293b] mb-2">Detailed Scoring Matrix</h2>
                            <p className="text-base font-bold text-slate-400">Weighted evaluation across key parameters</p>
                        </div>
                        <div className="flex gap-4">
                            <button className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-slate-600 flex items-center gap-2">
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                            <button className="px-5 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-xs font-black flex items-center gap-2">
                                View Full Report <ChevronDown className="w-4 h-4 rotate-270" />
                            </button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-50">
                                    <th className="pb-6 text-left w-1/3">Evaluation Parameter</th>
                                    <th className="pb-6 text-left">Weight</th>
                                    <th className="pb-6 text-left">Vendor A</th>
                                    <th className="pb-6 text-left">Vendor B</th>
                                    <th className="pb-6 text-left">Vendor C</th>
                                    <th className="pb-6 text-left">Impact</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {scoringMatrix.map((row, i) => (
                                    <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                                        <td className="py-6 font-black text-[#1e293b]">{row.param}</td>
                                        <td className="py-6 font-bold text-slate-500">{row.weight}</td>
                                        <td className="py-6"><span className="font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-xl">{row.a}</span></td>
                                        <td className="py-6 font-black text-slate-800">{row.b}</td>
                                        <td className="py-6 font-black text-slate-800">{row.c}</td>
                                        <td className="py-6">
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest uppercase ${row.impact === 'HIGH' ? 'bg-red-50 text-red-600' :
                                                    row.impact === 'MED' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'
                                                }`}>{row.impact}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-slate-100">
                        <div className="bg-slate-50/50 rounded-[2rem] p-8 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vendor A Total</span>
                            <span className="text-3xl font-black text-[#1e293b]">8.4/10</span>
                        </div>
                        <div className="bg-slate-50/50 rounded-[2rem] p-8 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vendor B Total</span>
                            <span className="text-3xl font-black text-[#1e293b]">7.7/10</span>
                        </div>
                        <div className="bg-slate-50/50 rounded-[2rem] p-8 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Vendor C Total</span>
                            <span className="text-3xl font-black text-[#1e293b]">6.3/10</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[3rem] p-12 shadow-sm border border-slate-100">
                    <div className="flex items-center gap-4 mb-10">
                        <Lightbulb className="w-8 h-8 text-yellow-500" />
                        <h2 className="text-3xl font-black text-[#1e293b]">AI-Powered Vendor Insights</h2>
                    </div>
                    <div className="space-y-6">
                        {[
                            { title: "Strong Digital Infrastructure", priority: "HIGH", text: "Your organization shows excellent foundation in digital infrastructure with 85% maturity.", color: "green" },
                            { title: "Integration Capability Gap", priority: "HIGH", text: "Integration capabilities need improvement. Consider investing in API management and middleware solutions.", color: "blue" },
                            { title: "Recommended Employee Experience Platform", priority: "MEDIUM", text: "Based on your high employee experience score, consider implementing a unified EX platform.", color: "yellow" }
                        ].map((insight, i) => (
                            <div key={i} className={`rounded-[2rem] border p-8 flex items-start justify-between cursor-pointer group transition-all ${insight.color === 'green' ? 'bg-green-50/50 border-green-100' :
                                    insight.color === 'blue' ? 'bg-blue-50/50 border-blue-100' : 'bg-yellow-50/50 border-yellow-100'
                                }`}>
                                <div className="flex gap-6">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm h-fit">
                                        {insight.color === 'green' ? <CheckCircle className="w-6 h-6 text-green-600" /> :
                                            insight.color === 'blue' ? <Activity className="w-6 h-6 text-blue-600" /> : <Lightbulb className="w-6 h-6 text-yellow-600" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-4 mb-2">
                                            <h4 className="text-xl font-black text-[#1e293b]">{insight.title}</h4>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${insight.priority === 'HIGH' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                                }`}>{insight.priority}</span>
                                        </div>
                                        <p className="text-base font-bold text-slate-500 leading-relaxed">{insight.text}</p>
                                    </div>
                                </div>
                                <ChevronDown className="w-6 h-6 text-slate-300 group-hover:text-slate-500 transition-colors" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-[#1e293b] rounded-[3.5rem] p-12 text-white shadow-2xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-700/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-4 h-4 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Recommendation</span>
                            <div className="ml-auto text-[10px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-white transition-colors underline offset-4">Change Selection</div>
                        </div>

                        <h2 className="text-5xl font-black mb-12 tracking-tight">Select <span className="text-blue-400">Vendor A</span></h2>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
                            <div className="lg:col-span-8">
                                <div className="group cursor-pointer">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-black uppercase tracking-widest text-slate-400">Why?</span>
                                        <ChevronDown className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <p className="text-lg font-bold text-slate-300 leading-relaxed mb-10 max-w-3xl">
                                        Vendor A outperforms in functional coverage and UX, aligning with your long-term strategic goals despite a marginally higher initial cost. The vendor demonstrates strong technical architecture and excellent vendor viability scores.
                                    </p>
                                </div>

                                <div>
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400 block mb-6">Key Advantages:</span>
                                    <div className="flex flex-wrap gap-4">
                                        {["High Scalability", "Seamless API", "Best-in-class UX", "Strong Support"].map((adv, i) => (
                                            <div key={i} className="px-6 py-2.5 bg-slate-800 border border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-slate-700 hover:border-slate-500">
                                                {adv}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="lg:col-span-4 space-y-4">
                                <button className="w-full py-5 bg-[#0ea5e9] text-white rounded-[2rem] font-black uppercase tracking-widest shadow-[0_20px_40px_rgba(14,165,233,0.3)] transition-all hover:scale-[1.02] hover:shadow-[0_25px_50px_rgba(14,165,233,0.4)] flex items-center justify-center gap-3">
                                    Proceed with Selection <ChevronDown className="w-5 h-5 rotate-270" />
                                </button>
                                <button className="w-full py-5 bg-white/5 border border-white/10 text-white rounded-[2rem] font-black uppercase tracking-widest backdrop-blur-md transition-all hover:bg-white/10 flex items-center justify-center gap-3">
                                    <Award className="w-5 h-5" /> Print
                                </button>
                            </div>
                        </div>
                        <p className="mt-12 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest opacity-50">Actions will not impact your current team</p>
                    </div>
                </div>
            </div>

            <style>{`
        @media print {
          .print:hidden { display: none !important; }
          body { background-color: white !important; }
          header, .lg:p-10 { padding: 0 !important; }
          .rounded-[3.5rem], .rounded-[3rem], .rounded-[2.5rem] { border-radius: 12px !important; }
          #f1f5f9 { background-color: white !important; }
        }
      `}</style>
        </div>
    );
}
