import { useState } from "react";
import { Link } from "@remix-run/react";
import {
    ArrowLeft, Download, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
    Users, Brain, Target, Activity, Zap, Shield, BarChart3, Heart, MessageCircle,
    Clock, ChevronDown, ChevronUp, UserCheck, UserX, Lightbulb, Bell, XCircle,
    ThumbsUp, ThumbsDown, Eye, Filter, Calendar, DollarSign, Gauge
} from "lucide-react";
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    Radar, BarChart as ReBarChart, Bar, Cell, LineChart, Line, ScatterChart,
    Scatter, ZAxis, PieChart, Pie
} from 'recharts';
import { motion, AnimatePresence } from "framer-motion";

interface ChangeManagementDashboardProps {
    engineData: any;
    metrics: any;
    assessmentData: any;
    insights: any;
    historicalData?: any;
    brandName: string;
}

export default function ChangeManagementDashboard({
    engineData,
    metrics,
    assessmentData,
    insights,
    historicalData,
    brandName
}: ChangeManagementDashboardProps) {
    const [activeTab, setActiveTab] = useState("executive");
    const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveTab(id);
        }
    };

    const downloadPDF = async () => {
        const root = document.getElementById('cm-dashboard-root');
        if (!root) return;
        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');
        const canvas = await html2canvas(root, {
            scale: 1.5,
            useCORS: true,
            logging: false,
            backgroundColor: '#0a0c10',
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
            pdf.setTextColor(40, 40, 40);
            pdf.setFontSize(60);
            pdf.setFont('helvetica', 'bold');
            pdf.text('HRTEKSYSTEM', pageWidth / 2, pageHeight / 2, { angle: 45, align: 'center' });
            // Header bar
            pdf.setFillColor(10, 12, 16); pdf.rect(0, 0, pageWidth, 48, 'F');
            pdf.setTextColor(255, 255, 255); pdf.setFontSize(10); pdf.setFont('helvetica', 'bold');
            pdf.text('HRTek Systems', 30, 20);
            pdf.setTextColor(168, 85, 247); pdf.setFontSize(8);
            pdf.text('CHANGE MANAGEMENT INTELLIGENCE | CONFIDENTIAL', 30, 34);
            pdf.setTextColor(148, 163, 184); pdf.setFontSize(8); pdf.setFont('helvetica', 'normal');
            pdf.text(`${brandName}`, pageWidth - 30, 27, { align: 'right' });
            // Footer bar
            pdf.setFillColor(10, 12, 16); pdf.rect(0, pageHeight - 26, pageWidth, 26, 'F');
            pdf.setFontSize(7); pdf.setTextColor(100, 116, 139);
            pdf.text(`© 2026 HRTek Systems | Page ${pageNum}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            heightLeft -= canvasPageHeight;
            position += canvasPageHeight;
            pageNum++;
            if (heightLeft > 0) pdf.addPage();
        }
        pdf.save(`HRTek-ChangeManagement-${brandName.replace(/\s+/g, '_')}-${Date.now()}.pdf`);
    };

    // Map insights to dashboard categories if possible
    const readinessScore = metrics?.completionRate || 0;
    const avgScore = metrics?.averageScore || 0;

    const getCRSColor = (crs: number) => {
        if (crs >= 71) return "text-emerald-400";
        if (crs >= 41) return "text-amber-400";
        return "text-red-400";
    };

    const getCRSBg = (crs: number) => {
        if (crs >= 71) return "bg-emerald-500/10 border-emerald-500/30";
        if (crs >= 41) return "bg-amber-500/10 border-amber-500/30";
        return "bg-red-500/10 border-red-500/30";
    };

    return (
        <div id="cm-dashboard-root" className="min-h-screen bg-[#0a0c10] text-slate-200">
            {/* Nav Header */}
            <nav className="sticky top-0 z-50 bg-[#0f1117]/80 backdrop-blur-xl border-b border-slate-800/50 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <img src="/logo-icon.png" alt="Logo" className="w-10 h-10 object-contain" />
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            Change Management Intelligence Engine
                        </h1>
                        <p className="text-xs text-slate-500 font-medium tracking-wider uppercase">{brandName} • Live Dashboard</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-1 mr-4">
                        <button onClick={() => scrollToSection("executive")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "executive" ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                            Executive View
                        </button>
                        <button onClick={() => scrollToSection("detailed")} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === "detailed" ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                            Detailed Analytics
                        </button>
                    </div>
                    <button onClick={downloadPDF} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sm font-bold rounded-lg border border-slate-700 transition-all flex items-center gap-2">
                        <Download className="w-4 h-4" /> Export PDF
                    </button>
                    <Link to="/dashboard" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                </div>
            </nav>

            <main className="max-w-[1800px] mx-auto p-6 space-y-24 scroll-smooth">
                {/* Executive Section */}
                <section id="executive" className="space-y-8 scroll-mt-24">
                    {/* KPI Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Target className="w-5 h-5 text-purple-400" />
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Completion</h3>
                            </div>
                            <p className="text-4xl font-black text-white">{readinessScore}%</p>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <Brain className="w-5 h-5 text-emerald-400" />
                                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Intelligence Score</h3>
                            </div>
                            <p className="text-4xl font-black text-emerald-400">{avgScore}/100</p>
                        </div>
                        {/* Insights mapping ... */}
                    </div>

                    {/* Insights List */}
                    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-white mb-6">AI-Generated Insights</h3>
                        <div className="space-y-4">
                            {insights.map((insight: any) => (
                                <div key={insight.id} className="p-4 bg-black/30 border border-slate-800 rounded-xl">
                                    <h4 className="font-bold text-white mb-1 uppercase text-sm tracking-tight">{insight.title}</h4>
                                    <p className="text-sm text-slate-400 font-medium italic">{insight.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Detailed Section */}
                <section id="detailed" className="space-y-8 scroll-mt-24 border-t border-slate-800 pt-24">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Detailed Analytics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Historical Readiness Trend</h4>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={[
                                        { date: 'Week 1', score: 45 },
                                        { date: 'Week 2', score: 52 },
                                        { date: 'Week 3', score: 48 },
                                        { date: 'Week 4', score: 65 },
                                        { date: 'Week 5', score: readinessScore }
                                    ]}>
                                        <defs>
                                            <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                                        <Area type="monotone" dataKey="score" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorScore)" strokeWidth={3} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Sentiment Distribution</h4>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ReBarChart data={[
                                        { name: 'Optimism', value: 40 },
                                        { name: 'Anxiety', value: 25 },
                                        { name: 'Resistance', value: 15 },
                                        { name: 'Neutral', value: 20 }
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                                        <Tooltip cursor={{ fill: '#1e293b' }} contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }} />
                                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                            {
                                                [0, 1, 2, 3].map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={['#10b981', '#f59e0b', '#ef4444', '#64748b'][index]} />
                                                ))
                                            }
                                        </Bar>
                                    </ReBarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
