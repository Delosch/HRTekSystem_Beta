import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";

interface StrategicReportPreviewProps {
    isOpen: boolean;
    onClose: () => void;
    reportData: HTIAdvisoryContent | null;
    isGenerating: boolean;
    error?: string;
    engineTitle: string;
    brandName: string;
}

// Engine-specific rotating analysis phrases
const ENGINE_PHRASES: Record<string, string[]> = {
    vendor: [
        "Evaluating vendor capability profiles...",
        "Mapping your HCM requirements against market options...",
        "Scoring fit dimensions and alignment gaps...",
        "Analyzing vendor pricing and contract flexibility...",
        "Benchmarking support quality and SLA track records...",
        "Profiling integration complexity and tech stack fit...",
        "Weighing scalability against your growth roadmap...",
        "Stress-testing vendor financial stability indicators...",
        "Identifying hidden risk factors in vendor ecosystems...",
        "Assembling your vendor recommendation matrix...",
    ],
    shared: [
        "Benchmarking your shared services maturity index...",
        "Mapping operational efficiency opportunities...",
        "Evaluating service delivery model options...",
        "Analyzing process standardization potential...",
        "Assessing workforce capability for transition...",
        "Scoring governance and compliance readiness...",
        "Calculating projected cost savings and ROI...",
        "Identifying automation leverage points...",
        "Profiling your agentic services readiness...",
        "Designing your shared services transformation roadmap...",
    ],
    change: [
        "Profiling your organizational change readiness...",
        "Analyzing stakeholder resistance and influence maps...",
        "Assessing leadership sponsorship strength...",
        "Evaluating cultural adaptability indicators...",
        "Mapping digital and workforce capability gaps...",
        "Scoring adoption probability across business units...",
        "Identifying critical intervention touchpoints...",
        "Stress-testing your change saturation thresholds...",
        "Quantifying transformation risk exposure...",
        "Architecting your change risk mitigation blueprint...",
    ],
    aiMaturity: [
        "Evaluating enterprise intelligence readiness...",
        "Identifying high-impact Agentic use cases...",
        "Assessing data infrastructure for model training...",
        "Designing ethical governance frameworks...",
        "Calculating ROI from Agentic transformation...",
        "Mapping 24-month intelligence adoption trajectory...",
        "Analyzing workforce readiness for machine collaboration...",
        "Securing data privacy and compliance protocols...",
        "Architecting your enterprise intelligence strategy...",
        "Synthesizing your strategic maturity brief...",
    ],
    digitalRoadmap: [
        "Synthesizing your 9-pillar digital transformation vision...",
        "Mapping complex system synergy and architecture...",
        "Architecting multi-phase implementation timelines...",
        "Evaluating workforce digital upskilling pathways...",
        "Calculating ROI across the transformation lifecycle...",
        "Designing risk mitigation and governance models...",
        "Benchmarking your roadmap against industry standard...",
        "Identifying critical path dependencies for rollout...",
        "Optimizing your strategic transformation sequence...",
        "Finalizing your board-level digital roadmap...",
    ],
};

function getEnginePhrases(title: string): string[] {
    const t = title.toLowerCase();
    if (t.includes('vendor') || t.includes('hcm')) return ENGINE_PHRASES.vendor;
    if (t.includes('shared') || t.includes('service')) return ENGINE_PHRASES.shared;
    if (t.includes('change')) return ENGINE_PHRASES.change;
    if (t.includes('ai') || t.includes('maturity')) return ENGINE_PHRASES.aiMaturity;
    if (t.includes('roadmap')) return ENGINE_PHRASES.digitalRoadmap;
    return ENGINE_PHRASES.change; // fallback
}

export function StrategicReportPreview({
    isOpen,
    onClose,
    reportData,
    isGenerating,
    error,
    engineTitle,
    brandName
}: StrategicReportPreviewProps) {
    const [phraseIdx, setPhraseIdx] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const phrases = getEnginePhrases(engineTitle);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isGenerating) return;
        setPhraseIdx(0);
        const interval = setInterval(() => {
            setPhraseIdx(prev => (prev + 1) % phrases.length);
        }, 2800);
        return () => clearInterval(interval);
    }, [isGenerating, phrases.length]);

    const handleDownload = async () => {
        if (!reportData) return;

        const { default: jsPDF } = await import('jspdf');
        const { default: html2canvas } = await import('html2canvas');

        const element = document.getElementById('report-content-to-export');
        if (!element) return;

        // Fix element width to exact A4 pixel width for consistent rendering
        const originalStyle = element.style.cssText;
        element.style.borderRadius = '0';
        element.style.boxShadow = 'none';
        element.style.maxWidth = 'none';
        element.style.width = '794px'; // A4 @ 96dpi

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
        });

        element.style.cssText = originalStyle;

        // ── Load HRTek logo ─────────────────────────────────────────────────
        let logoDataUrl: string | null = null;
        try {
            const resp = await fetch('/hrtek_logo.png');
            if (resp.ok) {
                const blob = await resp.blob();
                logoDataUrl = await new Promise<string>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                });
            }
        } catch { /* logo is decorative – proceed without */ }

        // ── A4 layout constants (mm) ────────────────────────────────────────
        const PAGE_W  = 210;
        const PAGE_H  = 297;
        const MARGIN  = 14;
        const HEADER_H = 24;   // header band height
        const FOOTER_H = 14;   // footer band height
        const CONTENT_W = PAGE_W - MARGIN * 2;           // 182 mm
        const CONTENT_H = PAGE_H - HEADER_H - FOOTER_H - 3; // gap between bands

        // ── Slice canvas per page ───────────────────────────────────────────
        const scaledTotalH = (canvas.height * CONTENT_W) / canvas.width;
        const totalPages   = Math.max(1, Math.ceil(scaledTotalH / CONTENT_H));
        const pixPerPage   = canvas.height / totalPages;

        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
        const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

        for (let pg = 0; pg < totalPages; pg++) {
            if (pg > 0) pdf.addPage();

            // ── 1. Diagonal watermark FIRST (drawn behind content) ─────────
            pdf.setFontSize(40);
            pdf.setTextColor(235, 238, 250);   // near-white, barely visible
            pdf.setFont('helvetica', 'bold');
            // bottom-left → top-right = 45° counter-clockwise
            pdf.text('HRTEKSYSTEM', PAGE_W * 0.18, PAGE_H * 0.72, { angle: 45 });

            // ── 2. Content slice ───────────────────────────────────────────
            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width  = canvas.width;
            const sliceH = Math.ceil(pixPerPage);
            sliceCanvas.height = sliceH;

            const ctx = sliceCanvas.getContext('2d')!;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceH);
            ctx.drawImage(
                canvas,
                0, pg * pixPerPage, canvas.width, pixPerPage,
                0, 0, canvas.width, sliceH,
            );

            const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.93);
            // Content area starts below header + 1.5mm gap
            pdf.addImage(sliceData, 'JPEG', MARGIN, HEADER_H + 1.5, CONTENT_W, CONTENT_H, '', 'FAST');

            // ── 3. Header band (drawn OVER content top edge) ───────────────
            pdf.setFillColor(15, 23, 42);          // slate-900
            pdf.rect(0, 0, PAGE_W, HEADER_H, 'F');

            // Two-tone accent bar at header bottom
            pdf.setFillColor(99, 102, 241);         // indigo-500
            pdf.rect(0, HEADER_H - 2, PAGE_W * 0.55, 2, 'F');
            pdf.setFillColor(6, 182, 212);           // cyan-500
            pdf.rect(PAGE_W * 0.55, HEADER_H - 2, PAGE_W * 0.45, 2, 'F');

            // Logo inside header
            if (logoDataUrl) {
                pdf.addImage(logoDataUrl, 'PNG', MARGIN, 4, 14, 14);
            }
            const textX = logoDataUrl ? MARGIN + 18 : MARGIN;

            pdf.setFontSize(11);
            pdf.setTextColor(255, 255, 255);
            pdf.setFont('helvetica', 'bold');
            pdf.text(engineTitle, textX, 12);

            pdf.setFontSize(6);
            pdf.setTextColor(148, 163, 184);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Strategic Intelligence Report  •  Intelligence-Driven Insight', textX, 19);

            pdf.setFontSize(7);
            pdf.setTextColor(100, 116, 139);
            pdf.text(`${dateStr}   |   Page ${pg + 1} / ${totalPages}`, PAGE_W - MARGIN, 12, { align: 'right' });

            pdf.setFontSize(5.5);
            pdf.setTextColor(239, 68, 68);
            pdf.setFont('helvetica', 'bold');
            pdf.text('CONFIDENTIAL', PAGE_W - MARGIN, 19, { align: 'right' });

            // ── 4. Footer band (drawn OVER content bottom edge) ────────────
            pdf.setFillColor(248, 250, 252);         // slate-50
            pdf.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, 'F');

            pdf.setDrawColor(226, 232, 240);
            pdf.setLineWidth(0.3);
            pdf.line(MARGIN, PAGE_H - FOOTER_H + 0.3, PAGE_W - MARGIN, PAGE_H - FOOTER_H + 0.3);

            if (logoDataUrl) {
                pdf.addImage(logoDataUrl, 'PNG', MARGIN, PAGE_H - FOOTER_H + 3, 7, 7);
            }

            pdf.setFontSize(6.5);
            pdf.setTextColor(148, 163, 184);
            pdf.setFont('helvetica', 'normal');
            pdf.text(
                `© 2026 HRTek Systems  •  ${brandName}  •  Confidential & Proprietary  •  Not for External Distribution`,
                PAGE_W / 2,
                PAGE_H - 4,
                { align: 'center' },
            );
        }

        const safeName = brandName.replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_');
        const dateSuffix = new Date().toISOString().split('T')[0];
        pdf.save(`HRTek_${safeName}_Strategic_Report_${dateSuffix}.pdf`);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-5xl h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100">
                                    <FileText className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 tracking-tight italic uppercase">Report Preview</h2>
                                    <p className="text-xs text-indigo-600 font-bold uppercase tracking-widest">{engineTitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {reportData && !isGenerating && (
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                                >
                                    <X className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-12 bg-slate-100/30">
                            {isGenerating ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="text-center space-y-4 max-w-md mx-auto">
                                        <h3 className="text-2xl font-black text-slate-900 italic uppercase tracking-tight">
                                            Architecting Strategic Advisory
                                        </h3>
                                        {/* Rotating engine-specific phrase */}
                                        <AnimatePresence mode="wait">
                                            <motion.p
                                                key={phraseIdx}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -8 }}
                                                transition={{ duration: 0.4 }}
                                                className="text-indigo-600 font-bold text-sm tracking-wide min-h-[24px]"
                                            >
                                                {phrases[phraseIdx]}
                                            </motion.p>
                                        </AnimatePresence>
                                        <p className="text-slate-400 text-xs font-medium">
                                            Your report will be ready in about 30–45 seconds
                                        </p>
                                    </div>
                                    <div className="w-64 space-y-2">
                                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-indigo-600 to-cyan-500"
                                                initial={{ width: "0%" }}
                                                animate={{ width: "100%" }}
                                                transition={{ duration: 40, ease: "linear" }}
                                            />
                                        </div>
                                        <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            <span>Analysis</span>
                                            <span>Synthesis</span>
                                            <span>Reporting</span>
                                        </div>
                                    </div>
                                </div>
                            ) : reportData ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    id="report-content-to-export"
                                    className="max-w-4xl mx-auto bg-white shadow-xl rounded-[2.5rem] p-16 relative border border-slate-50"
                                >
                                    {/* Professional table + paragraph styles captured by html2canvas */}
                                    <style>{`
                                        #report-content-to-export table {
                                            width: 100%;
                                            border-collapse: separate;
                                            border-spacing: 0;
                                            margin: 2.5rem 0;
                                            border-radius: 12px;
                                            overflow: hidden;
                                            border: 1.5px solid #cbd5e1;
                                            box-shadow: 0 4px 18px -2px rgba(0,0,0,0.09);
                                            font-size: 13.5px;
                                        }
                                        #report-content-to-export thead tr {
                                            background-color: #0f172a;
                                        }
                                        #report-content-to-export th {
                                            padding: 13px 20px;
                                            color: #ffffff;
                                            font-size: 10px;
                                            font-weight: 800;
                                            text-transform: uppercase;
                                            letter-spacing: 0.14em;
                                            text-align: left;
                                            border-right: 1px solid #1e293b;
                                            border-bottom: 2.5px solid #4f46e5;
                                        }
                                        #report-content-to-export th:last-child {
                                            border-right: none;
                                        }
                                        #report-content-to-export td {
                                            padding: 11px 20px;
                                            color: #475569;
                                            line-height: 1.6;
                                            border-right: 1px solid #e2e8f0;
                                            border-bottom: 1px solid #e2e8f0;
                                        }
                                        #report-content-to-export td:last-child {
                                            border-right: none;
                                        }
                                        #report-content-to-export tbody tr:last-child td {
                                            border-bottom: none;
                                        }
                                        #report-content-to-export tbody tr:nth-child(even) td {
                                            background-color: #f8fafc;
                                        }
                                        #report-content-to-export tbody tr:nth-child(odd) td {
                                            background-color: #ffffff;
                                        }
                                        #report-content-to-export .prose p {
                                            margin-bottom: 1.75rem;
                                            line-height: 1.85;
                                        }
                                        #report-content-to-export .prose ul {
                                            margin-top: 1rem;
                                            margin-bottom: 1.75rem;
                                        }
                                        #report-content-to-export .prose li {
                                            margin-bottom: 0.6rem;
                                            line-height: 1.7;
                                        }
                                        #report-content-to-export .prose h2 {
                                            margin-top: 3.5rem;
                                            margin-bottom: 1.25rem;
                                        }
                                        #report-content-to-export .prose h3 {
                                            margin-top: 2.5rem;
                                            margin-bottom: 1rem;
                                        }
                                        #report-content-to-export .prose h4 {
                                            margin-top: 2rem;
                                            margin-bottom: 0.75rem;
                                        }
                                    `}</style>

                                    {/* A4 Paper Look */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 rounded-t-full" />

                                    <div className="flex justify-between items-start mb-16">
                                        <div>
                                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">
                                                Strategic <br />
                                                <span className="text-indigo-600">Advisory Report</span>
                                            </h1>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 inline-flex mt-4">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Verified DeepSeek Analysis</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Company</p>
                                            <p className="text-sm font-bold text-slate-700">{brandName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
                                                {isMounted ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-- --- ----'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI Content - Rendered from HTML */}
                                    <div
                                        className="prose prose-slate max-w-none
                                            prose-headings:font-black prose-headings:uppercase prose-headings:italic prose-headings:tracking-tight
                                            prose-h2:text-3xl prose-h2:text-slate-900 prose-h2:border-b-4 prose-h2:border-indigo-600 prose-h2:pb-4 prose-h2:mt-16 prose-h2:mb-8
                                            prose-h3:text-xl prose-h3:text-indigo-600 prose-h3:mt-10 prose-h3:mb-6
                                            prose-h4:text-base prose-h4:text-slate-800 prose-h4:mt-8 prose-h4:mb-3
                                            prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-base prose-p:mb-8
                                            prose-ul:my-8 prose-li:text-slate-600 prose-li:text-base prose-li:my-3"
                                    >
                                        <div dangerouslySetInnerHTML={{ __html: reportData.executiveSummary }} />

                                        {/* Detailed Chapters */}
                                        {reportData.detailedSections?.map((section, idx) => (
                                            <div key={idx} className="mt-24 pt-12 border-t-2 border-slate-100">
                                                <div className="flex items-start gap-5 mb-10">
                                                    <span className="text-[80px] leading-none font-black text-indigo-100 italic select-none">{String(idx + 1).padStart(2, '0')}</span>
                                                    <h2 className="text-4xl !text-slate-900 !mt-4 !mb-0 !border-none !pb-0">{section.title}</h2>
                                                </div>
                                                <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                            </div>
                                        ))}
                                    </div>

                                    {/* Gaps/Recommendations Summary Cards */}
                                    <div className="mt-24 pt-10 border-t-2 border-slate-100">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Strategic Intelligence Summary</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="p-8 bg-red-50 rounded-2xl border border-red-200">
                                                <h4 className="text-red-700 font-black uppercase tracking-widest text-xs mb-5 flex items-center gap-2">
                                                    <X className="w-4 h-4" /> Critical Risk Flags
                                                </h4>
                                                <ul className="space-y-5">
                                                    {reportData.riskFlags.map((risk, i) => (
                                                        <li key={i} className="text-sm border-b border-red-100 pb-4 last:border-0 last:pb-0">
                                                            <p className="font-bold text-red-900 mb-1.5">{risk.risk}</p>
                                                            <p className="text-red-700/70 text-xs leading-relaxed">{risk.mitigation}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                            <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200">
                                                <h4 className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-5 flex items-center gap-2">
                                                    <CheckCircle2 className="w-4 h-4" /> Key Transformation Gaps
                                                </h4>
                                                <ul className="space-y-4">
                                                    {reportData.currentState.keyGaps.map((gap, i) => (
                                                        <li key={i} className="flex gap-3 text-sm text-emerald-800 font-semibold leading-snug">
                                                            <span className="shrink-0 text-emerald-500 mt-0.5">▸</span>
                                                            {gap}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-20 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
                                        <span>HRTEKSYSTEM ADVISORY</span>
                                        <span>REPORT REF: HTI-DEEPSEEK-2026</span>
                                    </div>
                                </motion.div>
                            ) : error ? (
                                <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                        <X className="w-10 h-10 text-red-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Generation Failed</h3>
                                    <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                                        Something went wrong during the DeepSeek analysis. Error: {error}
                                    </p>
                                    <button
                                        onClick={onClose}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold uppercase tracking-widest text-xs"
                                    >
                                        Close and Retry
                                    </button>
                                </div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400">
                                    <p>No report data available. Please generate the report.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
