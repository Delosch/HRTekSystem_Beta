import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Progress } from '~/components/ui/progress';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
    BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
    ChevronRight, CheckCircle2, Flag, Zap,
    ArrowRight, Brain, Layout, Activity,
    Globe, Target, RefreshCw, Building2
} from 'lucide-react';

// --- Sidebar Component (Internalized to avoid complex import issues) ---
const Sidebar = ({ activeSection, onNavigate }: { activeSection: string; onNavigate: (id: string) => void }) => {
    const navItems = [
        { id: 'summary', label: 'Overview', icon: Layout },
        { id: 'operating-model', label: '01. Operating Model', icon: Building2 },
        { id: 'service-experience', label: '02. Service Experience', icon: Globe },
        { id: 'process-intelligence', label: '03. Process Intel', icon: Activity },
        { id: 'business-change', label: '04. Change Mgmt', icon: RefreshCw },
        { id: 'transformation', label: '05. Programme', icon: Target },
        { id: 'agentic-capability', label: '06. Digital Cap', icon: Brain },
        { id: 'roadmap', label: 'Next Steps', icon: Flag },
    ];

    return (
        <aside className="w-64 flex-shrink-0 h-screen sticky top-0 bg-white border-r border-slate-100 z-[100] flex flex-col shadow-xl">
            <div className="h-24 flex items-center px-8 border-b border-slate-50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-950 rounded-lg">
                        <Layout className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-900 tracking-wider uppercase leading-none">Shared</span>
                        <span className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mt-1">Services</span>
                    </div>
                </div>
            </div>
            <div className="flex-1 px-4 py-8 space-y-1">
                {navItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                                w-full group flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all
                                ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}
                            `}
                        >
                            <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                            <span className="text-[11px] font-black uppercase tracking-widest text-left flex-1">{item.label}</span>
                            {isActive && <ChevronRight className="w-3 h-3 text-white/50" />}
                        </button>
                    );
                })}
            </div>
        </aside>
    );
};

// --- Sub-Components ---
const DonutChart = ({ data }: { data: any[] }) => (
    <div className="h-[220px] w-full flex flex-col items-center">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie data={data} innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="val" stroke="none" startAngle={90} endAngle={-270}>
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center gap-4 mt-2 pb-2">
            {data.map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name}</span>
                </div>
            ))}
        </div>
    </div>
);

const MiniBarChart = ({ data }: { data: any[] }) => (
    <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={data} margin={{ top: 20, right: 10, left: -30, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 5]} ticks={[0, 2.5, 5]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <RechartsTooltip cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }} />
                <Bar dataKey="val" radius={[2, 2, 0, 0]} barSize={32}>
                    {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
            </ReBarChart>
        </ResponsiveContainer>
    </div>
);

const SectionView = ({ section }: { section: any }) => {
    const performance = Math.round((section.insightData.score / 5) * 100);

    return (
        <div className="space-y-12">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                        <Brain className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em]">Section 0{section.number} Analysis</span>
                </div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">{section.title}</h2>
                <p className="text-slate-500 font-bold text-sm leading-relaxed italic max-w-2xl">{section.description}</p>
            </div>

            {/* Questions Grid */}
            <div className="space-y-6">
                {section.subSections.map((sub: any) => (
                    <div key={sub.id} className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{sub.number}</span>
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{sub.title}</h4>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {sub.options.map((opt: any) => (
                                <div key={opt.id} className={`p-4 rounded-xl border transition-all flex items-center justify-between ${opt.selected ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-slate-50'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${opt.selected ? 'bg-blue-600 border-blue-600' : 'border-slate-200'}`}>
                                            {opt.selected && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                                        </div>
                                        <span className={`text-[10px] font-bold uppercase tracking-tight ${opt.selected ? 'text-blue-700' : 'text-slate-400'}`}>{opt.label}</span>
                                    </div>
                                    {opt.selected && <Badge className="bg-blue-600 text-white border-none text-[8px] px-2">Verified</Badge>}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* SECTION INSIGHT MODULE (CRITICAL) */}
            <Card className="p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 bg-white">
                <div className="flex flex-col md:flex-row gap-10">
                    {/* Left: Scorecard Column */}
                    <div className="w-full md:w-1/3 space-y-6">
                        <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight italic">Section Overview</h3>
                        <div className="space-y-4">
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Section Index</span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-slate-900 italic">{section.insightData.score.toFixed(1)}</span>
                                    <span className="text-xs font-bold text-slate-400">/5.0</span>
                                </div>
                            </div>
                            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Maturity Band</span>
                                <span className={`text-2xl font-black uppercase italic tracking-tighter ${performance > 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {performance > 80 ? 'Strategic' : performance > 60 ? 'Defined' : 'Developing'}
                                </span>
                            </div>
                            <div className="p-5 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
                                <span className="text-[9px] font-black text-white/70 uppercase tracking-widest block mb-1">Section Health</span>
                                <div className="flex items-baseline justify-between">
                                    <span className="text-3xl font-black italic">{performance}%</span>
                                    <Activity className="w-5 h-5 text-white/50" />
                                </div>
                            </div>
                        </div>
                        <button className="w-full py-4 text-[10px] font-black text-blue-600 uppercase tracking-widest border border-blue-100 rounded-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                            <ArrowRight className="w-3 h-3" /> Agentic Roadmap
                        </button>
                    </div>

                    {/* Right: Charts Column */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question-Level Scores</span>
                            <MiniBarChart data={section.insightData.benchmarks} />
                        </div>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maturity Distribution</span>
                                <Badge className="bg-white text-blue-600 border-slate-200 text-[8px]">Live Audit</Badge>
                            </div>
                            <DonutChart data={section.insightData.distribution} />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};

// --- Mock Data Generator ---
const generateSectionData = (num: number, title: string, id: string, desc: string) => ({
    id, number: num, title, description: desc,
    subSections: [
        {
            id: `${num}.1`, number: `${num}.1`, title: 'Foundational Maturity', options: [
                { id: 'a', label: 'Initial/Ad-hoc' }, { id: 'b', label: 'Defined/Standardized', selected: true },
                { id: 'c', label: 'Managed/Optimized' }, { id: 'd', label: 'Strategic/Autonomous' }
            ]
        },
        {
            id: `${num}.2`, number: `${num}.2`, title: 'Strategic Alignment', options: [
                { id: 'a', label: 'Low integration' }, { id: 'b', label: 'Functional alignment', selected: true },
                { id: 'c', label: 'Enterprise synergy' }, { id: 'd', label: 'Market leadership' }
            ]
        }
    ],
    insightData: {
        score: 3.2 + (Math.random() * 1.5),
        benchmarks: [
            { name: 'Q1', val: 2.5 + Math.random() * 2, color: '#10b981' },
            { name: 'Q2', val: 3 + Math.random() * 2, color: '#10b981' },
            { name: 'Q3', val: 4.5, color: '#10b981' },
            { name: 'Q4', val: 4.2, color: '#10b981' },
            { name: 'Q5', val: 4.8, color: '#10b981' },
            { name: 'Q6', val: 2.1, color: '#f59e0b' }
        ],
        distribution: [
            { name: 'Developing', val: 15, color: '#f97316' },
            { name: 'Defined', val: 60, color: '#eab308' },
            { name: 'Optimized', val: 25, color: '#3b82f6' }
        ]
    }
});

const allSections = [
    generateSectionData(1, 'Operating Model Architecture', 'operating-model', 'Core structural design and service delivery framework for global scaling.'),
    generateSectionData(2, 'Service Design & Experience', 'service-experience', 'End-to-end employee journey optimization and omni-channel orchestration.'),
    generateSectionData(3, 'Process Intelligence', 'process-intelligence', 'Data-driven process mining, standardization and autonomous audit loops.'),
    generateSectionData(4, 'Business Management of Change', 'business-change', 'Cultural readiness, stakeholder advocacy and leadership transformation.'),
    generateSectionData(5, 'Programme Transformation', 'transformation', 'Governance precision, risk mitigation pipelines and agile orchestration.'),
    generateSectionData(6, 'Agentic Digital Capability', 'agentic-capability', 'Autonomous logic nodes, AI reasoning layers and intelligent workflow agents.')
];

export default function SharedServicesDashboard({ brandName = "HR TEK SYSTEMS" }: { brandName?: string }) {
    const [activeSection, setActiveSection] = useState('summary');
    const mainRef = useRef<HTMLDivElement>(null);

    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const container = mainRef.current;
        const el = document.getElementById(id);
        if (!el || !container) return;
        // Scroll within the overflow-y-auto container, offset for sticky header (~80px)
        const headerHeight = 80;
        const elTop = el.offsetTop - headerHeight;
        container.scrollTo({ top: elTop, behavior: 'smooth' });
    };

    const downloadPDF = async () => {
        if (!mainRef.current) return;
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(mainRef.current, { scale: 1.5, useCORS: true, logging: false, backgroundColor: '#f8fafc' });
        const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgHeight = canvas.height;
        const ratio = pageWidth / canvas.width;
        const canvasPageHeight = pageHeight / ratio;
        let heightLeft = imgHeight;
        let position = 0;
        let pageNum = 1;
        while (heightLeft > 0) {
            pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -position, pageWidth, imgHeight * ratio);
            pdf.setTextColor(220, 220, 220); pdf.setFontSize(55); pdf.setFont('helvetica', 'bold');
            pdf.text('HRTEKSYSTEM', pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center' });
            pdf.setFillColor(255, 255, 255); pdf.rect(0, 0, pageWidth, 44, 'F');
            pdf.setFontSize(12); pdf.setTextColor(15, 23, 42); pdf.setFont('helvetica', 'bold'); pdf.text('HRTEK', 30, 26);
            pdf.setFontSize(7); pdf.setTextColor(79, 70, 229); pdf.text('SYSTEM', 30, 36);
            pdf.setFontSize(7); pdf.setTextColor(148, 163, 184); pdf.setFont('helvetica', 'normal');
            pdf.text('SHARED SERVICES REPORT | CONFIDENTIAL', pageWidth - 30, 30, { align: 'right' });
            pdf.setDrawColor(226, 232, 240); pdf.line(30, 42, pageWidth - 30, 42);
            pdf.setFillColor(255, 255, 255); pdf.rect(0, pageHeight - 26, pageWidth, 26, 'F');
            pdf.setFontSize(7); pdf.setTextColor(148, 163, 184);
            pdf.text(`© 2026 HRTek Systems | Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            heightLeft -= canvasPageHeight; position += pageHeight; pageNum++;
            if (heightLeft > 0) pdf.addPage();
        }
        pdf.save(`HRTek-SharedServices-Report-${Date.now()}.pdf`);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-900">
            <Sidebar activeSection={activeSection} onNavigate={scrollToSection} />
            <div ref={mainRef} className="flex-1 min-h-0 overflow-y-auto flex flex-col bg-slate-50/30 scroll-smooth">
                {/* Header */}
                <div className="sticky top-0 z-[60] bg-white/95 backdrop-blur-md border-b border-slate-100 px-10 py-6 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4">
                        <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">{brandName}</h2>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] tracking-widest uppercase">Live Analysis</Badge>
                    </div>
                    <div className="flex items-center gap-8 text-[11px] font-black uppercase tracking-widest text-slate-400">
                        <div className="flex items-center gap-2">Ready: <span className="text-blue-600">82%</span></div>
                        <Button onClick={downloadPDF} className="bg-blue-600 text-white rounded-full px-6 text-[10px] font-black">Export PDF</Button>
                    </div>
                </div>

                <main className="max-w-5xl mx-auto w-full px-10 py-24 space-y-32">
                    {/* Overview */}
                    <section id="summary" className="space-y-12 scroll-mt-20">
                        <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.9]">
                            Global Shared <br />
                            <span className="text-blue-600">Services Audit</span>
                        </h1>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-8 border-none shadow-2xl shadow-slate-200 rounded-3xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Index</span>
                                <div className="text-5xl font-black italic">4.2<span className="text-lg text-slate-300 not-italic">/5.0</span></div>
                            </Card>
                            <Card className="p-8 border-none shadow-2xl shadow-slate-200 rounded-3xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Maturity</span>
                                <div className="text-4xl font-black text-emerald-600 uppercase italic">Strategic</div>
                            </Card>
                            <Card className="p-8 border-none shadow-2xl shadow-slate-200 rounded-3xl">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Health</span>
                                <div className="text-5xl font-black text-blue-600 italic">89%</div>
                            </Card>
                        </div>
                    </section>

                    {/* All 6 Sections */}
                    {allSections.map((sec) => (
                        <section key={sec.id} id={sec.id} className="pt-20 border-t border-slate-100 scroll-mt-20">
                            <SectionView section={sec} />
                        </section>
                    ))}

                    <footer className="pt-20 pb-12 border-t border-slate-100 flex flex-col items-center gap-4 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                        <img src="/hrtek_logo.png" className="h-6 opacity-20 brightness-0 mb-4" />
                        <span>HR TEK SYSTEMS © 2026 • Confidential Report</span>
                    </footer>
                </main>
            </div>
        </div>
    );
}
