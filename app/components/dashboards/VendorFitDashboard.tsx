import { useState } from "react";
import {
    CheckCircle2, Circle, Download, Target, DollarSign,
    Rocket, Building2, ChevronRight, BarChart3,
    Shield, TrendingUp, AlertTriangle, Award
} from "lucide-react";
import {
    ResponsiveContainer, BarChart as ReBarChart, Bar, Cell, XAxis, YAxis,
    CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, Radar, Legend
} from 'recharts';
import { motion } from "framer-motion";

interface VendorFitDashboardProps {
    data?: any;
    brandName: string;
}

const navSections = [
    { id: "executive", label: "Executive Summary", icon: "📊" },
    { id: "rankings", label: "Vendor Rankings", icon: "🏆" },
    { id: "capability", label: "Capability Matrix", icon: "🎯" },
    { id: "financial", label: "Financial Analysis", icon: "💰" },
    { id: "risk", label: "Risk Assessment", icon: "⚠️" },
    { id: "recommendation", label: "Recommendation", icon: "✅" },
];

export default function VendorFitDashboard({ data, brandName }: VendorFitDashboardProps) {
    const [activeSection, setActiveSection] = useState("executive");

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(`vf-section-${id}`);
        if (!el) return;
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const downloadPDF = async () => {
        const root = document.getElementById('vf-dashboard-root');
        if (!root) return;
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(root, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#f8fafc',
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const ratio = pageWidth / canvas.width;
        const imgHeight = canvas.height * ratio;
        const canvasPageHeight = pageHeight / ratio;
        let heightLeft = canvas.height;
        let position = 0;
        let pageNum = 1;
        while (heightLeft > 0) {
            pdf.addImage(imgData, 'PNG', 0, -position * ratio, pageWidth, imgHeight);
            // Watermark
            pdf.setTextColor(220, 220, 220);
            pdf.setFontSize(60);
            pdf.setFont('helvetica', 'bold');
            pdf.text('HRTEKSYSTEM', pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center' });
            // Header bar
            pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, pageWidth, 48, 'F');
            pdf.setTextColor(15, 23, 42); pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
            pdf.text('HRTek Systems', 30, 20);
            pdf.setTextColor(79, 70, 229); pdf.setFontSize(8);
            pdf.text('VENDOR FIT INTELLIGENCE | CONFIDENTIAL', 30, 34);
            pdf.setTextColor(100, 116, 139); pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
            pdf.text(`${brandName}`, pageWidth - 30, 27, { align: 'right' });
            pdf.setDrawColor(226, 232, 240); pdf.line(30, 44, pageWidth - 30, 44);
            // Footer bar
            pdf.setFillColor(255, 255, 255); pdf.rect(0, pageHeight - 26, pageWidth, 26, 'F');
            pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
            pdf.text(`© 2026 HRTek Systems | Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            heightLeft -= canvasPageHeight;
            position += canvasPageHeight;
            pageNum++;
            if (heightLeft > 0) pdf.addPage();
        }
        pdf.save(`HRTek-VendorFit-${brandName.replace(/\s+/g, '_')}-${Date.now()}.pdf`);
    };

    // Demo vendors
    const vendors = [
        { id: "workday", name: "Workday HCM", score: 88, color: "#3b82f6", pros: ["Best-in-class UX", "Strong analytics", "Global compliance"], cons: ["High cost", "Complex implementation"] },
        { id: "sap", name: "SAP SuccessFactors", score: 82, color: "#10b981", pros: ["Enterprise scale", "Deep integrations", "Mature product"], cons: ["Dated UI", "Heavy customization"] },
        { id: "oracle", name: "Oracle HCM Cloud", score: 79, color: "#f59e0b", pros: ["Strong financials", "AI capabilities", "Global reach"], cons: ["Steep learning curve", "Complex licensing"] },
    ];

    const radarData = [
        { subject: "Core HR", workday: 90, sap: 85, oracle: 80 },
        { subject: "Payroll", workday: 78, sap: 92, oracle: 85 },
        { subject: "Talent", workday: 95, sap: 80, oracle: 75 },
        { subject: "Analytics", workday: 88, sap: 70, oracle: 82 },
        { subject: "UX/UI", workday: 92, sap: 65, oracle: 72 },
    ];

    const barData = vendors.map(v => ({ name: v.name.split(" ")[0], score: v.score }));

    const riskItems = [
        { label: "Implementation Complexity", level: "High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
        { label: "Vendor Lock-in Risk", level: "Medium", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
        { label: "Data Migration Risk", level: "High", color: "text-red-600", bg: "bg-red-50", border: "border-red-200" },
        { label: "Change Management Readiness", level: "Medium", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
        { label: "Integration Complexity", level: "Low", color: "text-green-600", bg: "bg-green-50", border: "border-green-200" },
    ];

    return (
        <div id="vf-dashboard-root" className="flex bg-slate-50 min-h-screen font-sans text-slate-900">

            {/* ===== LEFT SIDEBAR ===== */}
            <div className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col sticky top-0 self-start"
                style={{ height: "calc(100vh - 64px)", top: "64px" }}>
                <div className="p-5 border-b border-slate-100">
                    <div className="flex items-center gap-2 mb-4">
                        <img src="/hrtek_logo.png" alt="HRTek" className="h-8 w-auto object-contain" />
                        <div>
                            <p className="font-bold text-sm text-slate-900">Vendor Fit</p>
                            <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider">Intelligence Engine</p>
                        </div>
                    </div>
                    {/* Fit Score */}
                    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-100">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-xs text-slate-500 font-medium">Fit Score</span>
                            <span className="text-xl font-black text-indigo-600">88%</span>
                        </div>
                        <div className="w-full bg-indigo-100 rounded-full h-2">
                            <div className="bg-indigo-600 h-2 rounded-full" style={{ width: "88%" }} />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-2 font-medium">Based on your requirements</p>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto p-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 mb-2">Report Sections</p>
                    <nav className="space-y-1">
                        {navSections.map((sec) => {
                            const isActive = activeSection === sec.id;
                            return (
                                <button
                                    key={sec.id}
                                    onClick={() => scrollToSection(sec.id)}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left ${isActive
                                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <span className="text-base">{sec.icon}</span>
                                    <span className="text-xs font-bold flex-1">{sec.label}</span>
                                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/70" />}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button
                        onClick={downloadPDF}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-black transition-all"
                    >
                        <Download className="w-3.5 h-3.5" />
                        Export PDF
                    </button>
                </div>
            </div>

            {/* ===== MAIN CONTENT ===== */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-5xl mx-auto px-8 py-10 space-y-16">

                    {/* ── EXECUTIVE SUMMARY ─────────────────────── */}
                    <section id="vf-section-executive" className="scroll-mt-[100px]">
                        <SectionTitle icon="📊" label="Executive Summary" />

                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                            {[
                                { icon: <Building2 className="w-5 h-5 text-indigo-600" />, label: "Top Candidate", value: "Workday HCM", sub: "Best fit for your needs", bg: "bg-indigo-50", border: "border-indigo-100" },
                                { icon: <Target className="w-5 h-5 text-emerald-600" />, label: "Fit Accuracy", value: "88%", sub: "Requirement match", bg: "bg-emerald-50", border: "border-emerald-100" },
                                { icon: <DollarSign className="w-5 h-5 text-blue-600" />, label: "Estimated TCO", value: "₹2.4 Cr", sub: "Per year (3-yr avg)", bg: "bg-blue-50", border: "border-blue-100" },
                                { icon: <Rocket className="w-5 h-5 text-purple-600" />, label: "Launch Speed", value: "4-6 Mo", sub: "Implementation timeline", bg: "bg-purple-50", border: "border-purple-100" },
                            ].map((kpi, i) => (
                                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                    className={`${kpi.bg} border ${kpi.border} rounded-xl p-5`}>
                                    <div className="flex items-center gap-2 mb-3">{kpi.icon}<span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{kpi.label}</span></div>
                                    <p className="text-2xl font-black text-slate-900">{kpi.value}</p>
                                    <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>
                                </motion.div>
                            ))}
                        </div>
                    </section>

                    {/* ── VENDOR RANKINGS ────────────────────────── */}
                    <section id="vf-section-rankings" className="scroll-mt-[100px]">
                        <SectionTitle icon="🏆" label="Vendor Rankings" />
                        <div className="space-y-3">
                            {vendors.map((vendor, idx) => (
                                <div key={vendor.id} className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-5 hover:shadow-md transition-shadow">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-sm shrink-0`}
                                        style={{ backgroundColor: vendor.color }}>
                                        {idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900">{vendor.name}</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {vendor.pros.map(p => (
                                                <span key={p} className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">{p}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-2xl font-black" style={{ color: vendor.color }}>{vendor.score}%</p>
                                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Match Score</p>
                                    </div>
                                    <div className="w-24">
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div className="h-2 rounded-full transition-all" style={{ width: `${vendor.score}%`, backgroundColor: vendor.color }} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── CAPABILITY MATRIX ─────────────────────── */}
                    <section id="vf-section-capability" className="scroll-mt-[100px]">
                        <SectionTitle icon="🎯" label="Capability Matrix" />
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white border border-slate-200 rounded-xl p-6">
                                <h3 className="font-semibold text-slate-900 mb-4">Functional Radar</h3>
                                <ResponsiveContainer width="100%" height={320}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="#e2e8f0" />
                                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                                        <Radar name="Workday" dataKey="workday" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} strokeWidth={2} />
                                        <Radar name="SAP" dataKey="sap" stroke="#10b981" fill="#10b981" fillOpacity={0.15} strokeWidth={2} />
                                        <Radar name="Oracle" dataKey="oracle" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                                        <Legend />
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-6">
                                <h3 className="font-semibold text-slate-900 mb-4">Overall Score Comparison</h3>
                                <ResponsiveContainer width="100%" height={320}>
                                    <ReBarChart data={barData} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                        <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} />
                                        <YAxis dataKey="name" type="category" tick={{ fill: '#475569', fontSize: 11 }} width={70} />
                                        <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} formatter={(v: number) => [`${v}%`, 'Match Score']} />
                                        <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                                            {barData.map((_, i) => (
                                                <Cell key={i} fill={vendors[i].color} />
                                            ))}
                                        </Bar>
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </section>

                    {/* ── FINANCIAL ANALYSIS ────────────────────── */}
                    <section id="vf-section-financial" className="scroll-mt-[100px]">
                        <SectionTitle icon="💰" label="Financial Analysis" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {vendors.map((vendor) => (
                                <div key={vendor.id} className="bg-white border border-slate-200 rounded-xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: vendor.color }} />
                                        <h4 className="font-semibold text-slate-900 text-sm">{vendor.name}</h4>
                                    </div>
                                    {[
                                        { label: "Year 1 Cost", value: "₹0.8 – 1.2 Cr" },
                                        { label: "3-Year TCO", value: "₹2.4 – 3.6 Cr" },
                                        { label: "ROI Timeline", value: "18 – 24 months" },
                                        { label: "Licensing", value: "Per user/month" },
                                    ].map((row) => (
                                        <div key={row.label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
                                            <span className="text-xs text-slate-500">{row.label}</span>
                                            <span className="text-xs font-semibold text-slate-900">{row.value}</span>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── RISK ASSESSMENT ───────────────────────── */}
                    <section id="vf-section-risk" className="scroll-mt-[100px]">
                        <SectionTitle icon="⚠️" label="Risk Assessment" />
                        <div className="space-y-3">
                            {riskItems.map((risk) => (
                                <div key={risk.label} className={`${risk.bg} border ${risk.border} rounded-xl p-4 flex items-center justify-between`}>
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className={`w-4 h-4 ${risk.color}`} />
                                        <span className="text-sm font-medium text-slate-900">{risk.label}</span>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white border ${risk.border} ${risk.color}`}>
                                        {risk.level}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── RECOMMENDATION ────────────────────────── */}
                    <section id="vf-section-recommendation" className="scroll-mt-[100px]">
                        <SectionTitle icon="✅" label="Final Recommendation" />
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-8">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-600 rounded-xl shrink-0">
                                    <Award className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-indigo-900 mb-2">Recommended: Workday HCM</h3>
                                    <p className="text-slate-700 leading-relaxed mb-4">
                                        Based on your organization's requirements, budget, and strategic priorities, <strong>Workday HCM</strong> is the recommended vendor with an 88% fit score. It offers the best combination of user experience, analytics capabilities, and long-term scalability.
                                    </p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {["Best UX in class", "Strong analytics", "Global compliance", "Scalable architecture"].map(item => (
                                            <div key={item} className="flex items-center gap-2 text-sm text-indigo-800">
                                                <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <div className="pt-8 border-t border-slate-200 text-center">
                        <img src="/hrtek_logo.png" alt="HRTek" className="h-7 mx-auto mb-3 opacity-30 object-contain" />
                        <p className="text-sm text-slate-400">© 2026 HRTek Systems. Confidential Vendor Selection Report.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SectionTitle({ icon, label }: { icon: string; label: string }) {
    return (
        <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">{icon}</span>
            <h2 className="text-2xl font-extrabold text-slate-900">{label}</h2>
            <div className="flex-1 h-px bg-slate-200" />
        </div>
    );
}
