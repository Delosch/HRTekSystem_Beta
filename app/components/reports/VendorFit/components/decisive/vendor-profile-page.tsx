import React from 'react';
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import {
    ArrowLeft, CheckCircle2, XCircle, Shield,
    Database, Globe, Zap, FileText, ExternalLink,
    Trophy, Activity, Target
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Detailed Mock Data based on
const vendorDetails: Record<string, any> = {
    "Vendor A (Workday)": {
        name: "Workday HCM",
        tier: "Strategic Leader",
        description: "Cloud-native unified suite best suited for complex, multi-country organizations requiring deep analytics.",
        fitScore: 92,
        fitBreakdown: { "Core HR": 95, "Talent": 92, "Payroll": 88, "Analytics": 98 },
        strengths: [
            "Unified Data Model: No integration needed between modules.",
            "Global Compliance: Native support for 80+ countries.",
            "Object-Oriented Architecture: Highly configurable without code."
        ],
        weaknesses: [
            "Premium Pricing: Highest TCO in the cohort.",
            "Implementation Rigidity: Requires certified partners."
        ],
        rfpHighlights: [
            { q: "Data Migration Concern?", a: "Automated ETL tools provided for legacy migration.", status: "positive" },
            { q: "Cross-functional Eval?", a: "Dedicated Finance/IT dashboards included.", status: "positive" }
        ],
        riskProfile: {
            level: "Low",
            factors: ["SOC2 Type II Certified", "GDPR Compliant", "ISO 27001"]
        }
    },
    "Vendor B (SAP)": {
        name: "SAP SuccessFactors",
        tier: "Market Contender",
        description: "Modular suite with deep ERP integration, ideal for manufacturing and engineering heavy organizations.",
        fitScore: 84,
        fitBreakdown: { "Core HR": 85, "Talent": 88, "Payroll": 95, "Analytics": 80 },
        strengths: [
            "Payroll Powerhouse: Best-in-class for complex payroll.",
            "ERP Integration: Native connectors to SAP S/4HANA.",
            "Global Footprint: Massive support ecosystem."
        ],
        weaknesses: [
            "User Experience: Interface inconsistencies across modules.",
            "Technical Debt: Mix of legacy and acquired tech stacks."
        ],
        rfpHighlights: [
            { q: "Data Migration Concern?", a: "Manual mapping required for non-SAP data.", status: "neutral" },
            { q: "Cross-functional Eval?", a: "Strong Finance link, weaker IT self-service.", status: "neutral" }
        ],
        riskProfile: {
            level: "Medium",
            factors: ["Data Residency Gaps in APAC", "Audit findings in last report"]
        }
    },
    "Vendor C (Oracle)": {
        name: "Oracle HCM Cloud",
        tier: "Enterprise Contender",
        description: "Comprehensive suite for complex, matrixed organizations. Strongest in Core HR depth and supply chain linkages.",
        fitScore: 79,
        fitBreakdown: { "Core HR": 90, "Talent": 75, "Payroll": 85, "Analytics": 85 },
        strengths: [
            "Complex Org Modelling: Handles matrix structures best.",
            "Supply Chain Link: Integrates workforce with operational planning.",
            "Deep Compliance: Robust controls for regulated industries."
        ],
        weaknesses: [
            "User Interface: Can be complex and non-intuitive.",
            "Implementation Timeline: Often exceeds 12 months."
        ],
        rfpHighlights: [
            { q: "Data Migration Concern?", a: "Standard tools available, but complex mapping.", status: "neutral" },
            { q: "Cross-functional Eval?", a: "Strong Ops/Finance capability.", status: "positive" }
        ],
        riskProfile: {
            level: "Medium",
            factors: ["Solid Security", "Complex Contract Terms"]
        }
    },
    "Vendor D (Darwinbox)": {
        name: "Darwinbox",
        tier: "Agile Challenger",
        description: "Mobile-first, cloud-native platform focused on employee experience and speed of deployment. Strong in Asia.",
        fitScore: 76,
        fitBreakdown: { "Core HR": 82, "Talent": 85, "Payroll": 70, "Analytics": 75 },
        strengths: [
            "Fast Deployment: Average go-live in 12-16 weeks.",
            "Mobile UX: Best-in-class mobile app adoption.",
            "Voice AI: Native voice-enabled commands."
        ],
        weaknesses: [
            "Global Reach: Limited support/payroll outside Asia/MENA.",
            "Depth: Less granular controls than Oracle/SAP."
        ],
        rfpHighlights: [
            { q: "Data Migration Concern?", a: "Agile squad assists with Excel uploads.", status: "neutral" },
            { q: "Cross-functional Eval?", a: "Focus on HR/Employee User capability.", status: "neutral" }
        ],
        riskProfile: {
            level: "Low",
            factors: ["Modern Stack", "Growing Partner Ecosystem"]
        }
    },
    "Vendor E (ADP)": {
        name: "ADP Workforce Now",
        tier: "Specialist (Payroll)",
        description: "Payroll-first solution ideal for organizations prioritizing pay accuracy and outsourcing over talent management depth.",
        fitScore: 72,
        fitBreakdown: { "Core HR": 70, "Talent": 60, "Payroll": 98, "Analytics": 80 },
        strengths: [
            "Payroll Accuracy: Global leader in payroll services.",
            "Compliance: Outsourced statutory liability options.",
            "Stability: Massive, stable public company."
        ],
        weaknesses: [
            "Talent Management: Basic functionality compared to suite vendors.",
            "Integration: Core HR often feels separate from Payroll."
        ],
        rfpHighlights: [
            { q: "Data Migration Concern?", a: "Full service migration included.", status: "positive" },
            { q: "Cross-functional Eval?", a: "Finance loves it, HR tolerates it.", status: "neutral" }
        ],
        riskProfile: {
            level: "High", // Risk due to functional fit gaps
            factors: ["Functional Gaps in Talent", "Strong Financial Stability"]
        }
    }
};

interface VendorProfilePageProps {
    vendorId: string;
    onBack: () => void;
    data: any;
}

export function VendorProfilePage({ vendorId, onBack, data: analysisData }: VendorProfilePageProps) {
    // Safe access to vendor data or fallback
    const data = vendorDetails[vendorId] || vendorDetails["Vendor A (Workday)"];

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
        >
            {/* Navigation & Breadcrumb */}
            <div className="flex items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        onClick={onBack}
                        className="h-12 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-black uppercase tracking-widest text-[10px] gap-3 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" /> Return to Rankings
                    </Button>
                    <div className="w-px h-8 bg-slate-200" />
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Dossier Analysis</span>
                        <span className="text-xs font-bold text-slate-900">{data.name} v2026.1</span>
                    </div>
                </div>
                <Button className="h-12 px-8 rounded-2xl bg-slate-900 border-none text-white font-black uppercase tracking-widest text-[10px] gap-3 shadow-xl shadow-slate-900/10">
                    Export Dossier <FileText className="w-4 h-4" />
                </Button>
            </div>

            {/* Profile Hero Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-[48px] bg-white border-2 border-slate-100 shadow-2xl shadow-slate-900/[0.03]"
            >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] rotate-12">
                    <Target className="w-64 h-64" />
                </div>

                <div className="p-12 relative z-10 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <Badge className="h-10 px-6 rounded-full bg-blue-600 text-white border-none font-black uppercase tracking-widest text-[10px] shadow-lg shadow-blue-500/20">
                                {data.tier}
                            </Badge>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Candidate Index</span>
                        </div>
                        <h1 className="text-7xl font-black text-slate-900 tracking-tighter uppercase italic leading-[0.8]">
                            {data.name.split(' ')[0]} <span className="text-blue-600">{data.name.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <p className="text-xl font-bold text-slate-500 max-w-2xl leading-relaxed italic">
                            "{data.description}"
                        </p>
                    </div>

                    <div className="shrink-0 p-10 rounded-[48px] bg-slate-50 flex flex-col items-center border border-slate-100 shadow-inner">
                        <div className="text-8xl font-black text-slate-900 tracking-tighter leading-none mb-2">
                            {data.fitScore}
                        </div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Absolute Fit</span>
                    </div>
                </div>
            </motion.div>

            {/* Analysis Depth */}
            <Tabs defaultValue="capabilities" className="space-y-10">
                <TabsList className="bg-slate-100 p-1.5 rounded-[24px] h-16 border border-slate-200">
                    <TabsTrigger value="capabilities" className="h-full px-10 rounded-2xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg transition-all duration-300">
                        Capability Matrix
                    </TabsTrigger>
                    <TabsTrigger value="risk" className="h-full px-10 rounded-2xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg transition-all duration-300">
                        Governance & Risk
                    </TabsTrigger>
                    <TabsTrigger value="rfp" className="h-full px-10 rounded-2xl text-xs font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-lg transition-all duration-300">
                        RFP Raw Ledger
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <TabsContent value="capabilities">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-10"
                        >
                            {/* Performance Radar Bar Chart */}
                            <Card className="p-10 rounded-[40px] border-none bg-slate-900 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
                                <div className="absolute -left-10 -bottom-10 opacity-10">
                                    <Activity className="w-64 h-64" />
                                </div>
                                <div className="relative z-10 space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white/10 rounded-2xl border border-white/10">
                                            <Zap className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tighter uppercase">Module Integrity</h3>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Weighted benchmark vs industry avg</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        {Object.entries(data.fitBreakdown).map(([key, score]: [string, any], i: number) => (
                                            <div key={key} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest">{key}</span>
                                                    <span className="text-2xl font-black">{score}%</span>
                                                </div>
                                                <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${score}%` }}
                                                        transition={{ duration: 1.5, delay: i * 0.1 }}
                                                        className={`h-full rounded-full bg-gradient-to-r ${score >= 90 ? "from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" :
                                                                "from-slate-600 to-slate-400"
                                                            }`}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Card>

                            {/* Pros/Cons Matrix */}
                            <div className="grid grid-cols-1 gap-6">
                                <Card className="p-8 rounded-[40px] border-none bg-white shadow-xl shadow-slate-900/[0.03]">
                                    <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        Strategic Competitive Pros
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {data.strengths.map((item: string, i: number) => (
                                            <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-3xl group hover:bg-emerald-50 transition-colors">
                                                <div className="shrink-0 w-8 h-8 rounded-xl bg-white flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100 group-hover:border-emerald-200">
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-800 leading-tight flex-1">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>

                                <Card className="p-8 rounded-[40px] border-none bg-white shadow-xl shadow-slate-900/[0.03]">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                        Critical Delta Gaps
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        {data.weaknesses.map((item: string, i: number) => (
                                            <div key={i} className="flex gap-4 p-5 bg-slate-50 rounded-3xl group hover:bg-orange-50 transition-colors">
                                                <div className="shrink-0 w-8 h-8 rounded-xl bg-white flex items-center justify-center text-orange-400 shadow-sm border border-slate-100 group-hover:border-orange-200">
                                                    <XCircle className="w-4 h-4" />
                                                </div>
                                                <p className="text-sm font-bold text-slate-600 leading-tight flex-1">{item}</p>
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </div>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="risk">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-1 xl:grid-cols-3 gap-10"
                        >
                            <Card className="xl:col-span-2 p-12 rounded-[48px] bg-slate-900 text-white relative overflow-hidden">
                                <div className="absolute right-0 top-0 p-12 opacity-10">
                                    <Shield className="w-48 h-48" />
                                </div>
                                <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
                                    <div className="shrink-0 w-40 h-40 rounded-[48px] bg-blue-600 flex flex-col items-center justify-center shadow-2xl shadow-blue-600/40">
                                        <Shield className="w-12 h-12 text-white mb-2" />
                                        <span className="text-xs font-black tracking-widest uppercase">{data.riskProfile.level} RISK</span>
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">Security Architecture</h3>
                                        <p className="text-lg font-bold text-slate-400 leading-relaxed italic max-w-xl">
                                            "Engine-verified data residency and sovereignty protocols exceed standard GDPR-II requirements for {analysisData?.profile?.organizationName}."
                                        </p>
                                        <div className="flex flex-wrap gap-3">
                                            {data.riskProfile.factors.map((factor: string, i: number) => (
                                                <Badge key={i} className="px-5 py-2 rounded-2xl bg-white/10 text-white border-white/10 font-black text-[9px] uppercase tracking-widest hover:bg-white hover:text-slate-900 transition-colors">
                                                    {factor}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <Card className="p-10 rounded-[48px] bg-white border-2 border-slate-100 shadow-2xl shadow-slate-900/[0.03] flex flex-col items-center justify-center text-center group">
                                <div className="p-6 rounded-[32px] bg-slate-100 mb-6 group-hover:scale-110 transition-transform">
                                    <Globe className="w-12 h-12 text-blue-600" />
                                </div>
                                <h4 className="text-lg font-black uppercase tracking-tighter mb-2">Global Maturity</h4>
                                <p className="text-sm font-bold text-slate-500 max-w-[200px]">Vendor represents 18% higher market share in your core region.</p>
                                <div className="mt-8 pt-8 border-t border-slate-100 w-full flex justify-center gap-10">
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black">1.2x</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Scalability</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-2xl font-black">99.9</span>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SLA Uptime</span>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="rfp">
                        <Card className="rounded-[40px] overflow-hidden border-none shadow-2xl shadow-slate-900/[0.03]">
                            <div className="bg-slate-900 p-8 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-2xl bg-white/10">
                                        <FileText className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-white tracking-tighter uppercase">RFP Response Ledger</h3>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Verified extracted answers from Candidate submission</p>
                                    </div>
                                </div>
                                <Badge className="bg-white/10 text-white border-none font-black text-[10px] uppercase tracking-widest px-4 py-2">Version 4.2RC</Badge>
                            </div>
                            <div className="divide-y divide-slate-100 bg-white">
                                {data.rfpHighlights.map((item: any, i: number) => (
                                    <div key={i} className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10 hover:bg-slate-50/50 transition-colors group">
                                        <div className="lg:col-span-4 space-y-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Category Inquiry</span>
                                            <h4 className="text-lg font-black text-slate-900 leading-tight group-hover:text-blue-600 transition-colors italic uppercase">{item.q}</h4>
                                        </div>
                                        <div className="lg:col-span-8 flex flex-col md:flex-row gap-8 items-start justify-between">
                                            <p className="text-sm font-bold text-slate-600 leading-relaxed italic max-w-xl">"{item.a}"</p>
                                            <div className="shrink-0">
                                                {item.status === "positive" ? (
                                                    <Badge className="bg-emerald-500 text-white border-none font-black text-[9px] uppercase tracking-widest px-4 py-2 shadow-lg shadow-emerald-500/20">Optimal Align</Badge>
                                                ) : (
                                                    <Badge className="bg-slate-100 text-slate-500 border-none font-black text-[9px] uppercase tracking-widest px-4 py-2">Neutral Parity</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </motion.div>
    );
}
