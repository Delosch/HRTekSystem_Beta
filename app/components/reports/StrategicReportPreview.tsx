import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, FileText, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";
import {resolveReportClientIdentity} from "~/utils/reportClientIdentity";

function sanitizeFileNamePart(
    value: string
): string {
    return value
        .trim()
        .replace(/[^a-zA-Z0-9-_]+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");
}

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

function hasVisibleText(
    value: unknown
): value is string {
    return (
        typeof value === "string" &&
        value.trim().length > 0
    );
}

function hasVisibleHtml(
    value: unknown
): value is string {
    if (!hasVisibleText(value)) {
        return false;
    }

    const plainText = value
        .replace(/<style[\s\S]*?<\/style>/gi, " ")
        .replace(/<script[\s\S]*?<\/script>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;|&#160;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/\s+/g, " ")
        .trim();

    return plainText.length > 0;
}

function cleanStringList(
    value: unknown
): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .filter(hasVisibleText)
        .map((item) => item.trim());
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
    const {companyName: clientName,} = resolveReportClientIdentity({
    brand_name: brandName,});

    const detailedSections = (reportData?.detailedSections ?? []).filter((section) => hasVisibleText(section?.title) && hasVisibleHtml(section?.content));
    const riskFlags = (reportData?.riskFlags ?? []).filter((risk) => hasVisibleText(risk?.risk) || hasVisibleText(risk?.mitigation));
    const keyGaps = cleanStringList(reportData?.currentState?.keyGaps);

    const recommendations = {
        now: cleanStringList(reportData?.recommendations?.now),
        next: cleanStringList(reportData?.recommendations?.next),
        later: cleanStringList(reportData?.recommendations?.later),
    };

    const dependencies = cleanStringList(reportData?.dependencies);
    const successMetrics = cleanStringList(reportData?.successMetrics);

    const hasStrategicSummary = riskFlags.length > 0 || keyGaps.length > 0;
    const hasRecommendations = recommendations.now.length > 0 || recommendations.next.length > 0 || recommendations.later.length > 0;
    const hasSupportingMeasures = dependencies.length > 0 || successMetrics.length > 0;

    //const currentYear = new Date().getFullYear();
    const reportDate = new Date().toISOString().slice(0, 10);
    const resolvedEngineTitle = engineTitle?.trim() || "Strategic Assessment";
    //const resolvedBrandName = brandName?.trim() || "Client";

    const pdfFileName = ["HRTek", sanitizeFileNamePart(clientName), sanitizeFileNamePart(resolvedEngineTitle), "_Strategic_Advisory_", reportDate].filter(Boolean).join("_").concat(".pdf");

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

        // ── Slice canvas per page without changing its aspect ratio───────────────────────────────────────────
        // The complete canvas width will be rendered as CONTENT_W millimetres.
        // Calculate how many source pixels naturally fit inside CONTENT_H.
        const sourcePageHeight = Math.max(1,Math.floor((canvas.width * CONTENT_H) / CONTENT_W));
        const totalPages = Math.max(1,Math.ceil(canvas.height / sourcePageHeight ));
        //const pixPerPage   = canvas.height / totalPages;   --> not needed

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
            // Use a fixed source-page height for every full page.
            // The final page uses only its remaining canvas height.
            const sourceY = pg * sourcePageHeight;
            const remainingSourceHeight = canvas.height - sourceY;
            const currentSliceHeight = Math.min(sourcePageHeight, remainingSourceHeight);

            const sliceCanvas = document.createElement('canvas');
            sliceCanvas.width = canvas.width;
            sliceCanvas.height = currentSliceHeight;

            const ctx = sliceCanvas.getContext('2d');
            if (!ctx) {
                throw new Error(`Unable to create PDF canvas context for page ${pg + 1}`);
            }

            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

            ctx.drawImage(
                canvas,
                // Source rectangle
                0, sourceY, canvas.width, currentSliceHeight,
                // Destination rectangle
                0, 0, canvas.width, currentSliceHeight
            );

            const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.93);

            /**
             * Preserve the source slice's aspect ratio.
             *
             * Full pages will render at approximately CONTENT_H.
             * The last page will render at its natural shorter height.
             */
            const renderedSliceHeightMm = Math.min(CONTENT_H, (currentSliceHeight * CONTENT_W) / canvas.width);

            // Content begins below the PDF header.
            pdf.addImage(sliceData, 'JPEG', MARGIN, HEADER_H + 1.5, CONTENT_W, renderedSliceHeightMm, '', 'FAST');

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
                `© {currentYear} HRTek Systems  •  ${clientName}  •  Confidential & Proprietary  •  Not for External Distribution`,
                PAGE_W / 2,
                PAGE_H - 4,
                { align: 'center' },
            );
        }

        const safeName = clientName.trim().replace(/[^a-zA-Z0-9\s_-]/g,"",).replace(/\s+/g, "_").replace(/_+/g, "_").replace(/^_+|_+$/g, "");
        const dateSuffix = new Date().toISOString().split('T')[0];
        pdf.save(pdfFileName);
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
                        <div className="px-8 py-5 flex items-center justify-between bg-slate-900 border-b-2 border-indigo-600">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-900/40">
                                    <FileText className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-white tracking-tight italic uppercase leading-tight">Report Preview</h2>
                                    <p className="text-[11px] text-indigo-400 font-bold uppercase tracking-widest leading-tight">{engineTitle}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {reportData && !isGenerating && (
                                    <button
                                        onClick={handleDownload}
                                        className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/30"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download PDF
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto p-8 sm:p-12 bg-slate-100/30 relative">
                            {isGenerating ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-12 py-10">
                                    {/* Header Animation */}
                                    <div className="text-center space-y-4 max-w-lg mx-auto">
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm mb-4"
                                        >
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                                            </span>
                                            <span className="text-indigo-600 text-[10px] font-black tracking-[0.2em] uppercase">Report Generation in Progress</span>
                                        </motion.div>
                                        
                                        <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter leading-none">
                                            Architecting Your
                                            <span className="block italic text-indigo-600">Strategic Advisory</span>
                                        </h3>
                                        <p className="text-slate-400 text-sm font-normal">
                                            Synthesizing assessment data into a board-level transformation brief.
                                        </p>
                                    </div>

                                    {/* Main Loading visualizer */}
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <Sparkles className="w-10 h-10 text-indigo-600 animate-pulse" />
                                        </div>
                                    </div>

                                    {/* Progress Tracker (Stages) */}
                                    <div className="w-full max-w-md space-y-3">
                                        {[
                                            { label: 'Ingesting assessment responses', from: 0, to: 8 },
                                            { label: 'Mapping operational patterns', from: 8, to: 18 },
                                            { label: 'Synthesizing strategic insights', from: 18, to: 30 },
                                            { label: 'Finalizing transformation brief', from: 30, to: 45 },
                                        ].map((stage, idx) => {
                                            const isActive = idx === Math.min(3, Math.floor(phraseIdx / 2.5));
                                            const isDone = Math.floor(phraseIdx / 2.5) > idx;
                                            
                                            return (
                                                <div key={idx} className={`flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-500 ${
                                                    isActive ? 'bg-white border border-indigo-200 shadow-xl shadow-indigo-100/50' :
                                                    isDone   ? 'bg-slate-50 border border-slate-100 opacity-60' :
                                                               'border border-transparent opacity-20'
                                                }`}>
                                                    <div className={`w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center transition-all ${
                                                        isDone   ? 'bg-emerald-500 text-white' :
                                                        isActive ? 'bg-indigo-600 text-white' :
                                                                   'bg-slate-200'
                                                    }`}>
                                                        {isDone ? (
                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                        ) : isActive ? (
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                                                        ) : null}
                                                    </div>
                                                    <span className={`text-[11px] font-black tracking-wider uppercase flex-1 ${
                                                        isActive ? 'text-slate-900' : 'text-slate-400'
                                                    }`}>{stage.label}</span>
                                                    {isActive && <span className="text-[8px] text-indigo-600 font-black uppercase tracking-widest px-2 py-0.5 bg-indigo-50 rounded-md">processing</span>}
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Detailed Status */}
                                    <div className="w-full max-w-md space-y-4">
                                        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden">
                                            <div className="flex justify-between items-end mb-3">
                                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Overall Progress</span>
                                                <span className="text-xl font-black text-slate-900">{Math.min(95, Math.round((phraseIdx / phrases.length) * 100))}%</span>
                                            </div>
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 rounded-full shadow-lg"
                                                    initial={{ width: "0%" }}
                                                    animate={{ width: `${Math.min(95, Math.round((phraseIdx / phrases.length) * 100))}%` }}
                                                    transition={{ duration: 0.5 }}
                                                />
                                            </div>
                                            
                                            {/* Rotating engine-specific phrase */}
                                            <div className="mt-6 pt-6 border-t border-slate-50 text-center">
                                                <AnimatePresence mode="wait">
                                                    <motion.p
                                                        key={phraseIdx}
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -8 }}
                                                        transition={{ duration: 0.4 }}
                                                        className="text-indigo-600 font-bold text-[11px] uppercase tracking-wider min-h-[16px]"
                                                    >
                                                        {phrases[phraseIdx]}
                                                    </motion.p>
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                        
                                        <p className="text-slate-400 text-[10px] font-black text-center uppercase tracking-[0.3em]">
                                            Estimated time: 45 seconds • Confidential Advisory
                                        </p>
                                    </div>
                                </div>
                            ) : reportData ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    id="report-content-to-export"
                                    className="max-w-4xl mx-auto bg-white shadow-xl rounded-[2.5rem] p-12 relative border border-slate-50"
                                >
                                    {/* Professional table + paragraph styles captured by html2canvas */}
                                    <style>{`
                                        #report-content-to-export {
                                            max-width: 100%;
                                            overflow-x: hidden;
                                        }

                                        #report-content-to-export table {
                                            width: 100% !important;
                                            max-width: 100% !important;

                                            /*
                                            * Prevent content from expanding columns beyond
                                            * the available A4 report width.
                                            */
                                            table-layout: fixed;

                                            border-collapse: separate;
                                            border-spacing: 0;

                                            margin: 1.75rem 0;

                                            border: 1.5px solid #cbd5e1;
                                            border-radius: 10px;

                                            /*
                                            * Prevent wide table content from escaping the
                                            * captured report container.
                                            */
                                            overflow: hidden;

                                            box-sizing: border-box;

                                            font-size: 12px;

                                            box-shadow: 0 3px 12px -2px rgba(0, 0, 0, 0.08);
                                        }

                                        #report-content-to-export thead {
                                            display: table-header-group;
                                        }

                                        #report-content-to-export thead tr {
                                            background-color: #0f172a;
                                        }

                                        #report-content-to-export tbody {
                                            width: 100%;
                                        }

                                        #report-content-to-export tr {
                                            width: 100%;
                                        }

                                        #report-content-to-export th,
                                        #report-content-to-export td {
                                            /*
                                            * Include padding and borders inside the calculated
                                            * fixed-column width.
                                            */
                                            box-sizing: border-box;

                                            /*
                                            * Always align multi-line table content from the top.
                                            */
                                            vertical-align: top;

                                            /*
                                            * Do not allow content to remain on one long line.
                                            */
                                            white-space: normal !important;

                                            /*
                                            * Wrap ordinary words, identifiers, URLs, and
                                            * uninterrupted AI-generated strings.
                                            */
                                            overflow-wrap: anywhere;
                                            word-wrap: break-word;
                                            word-break: break-word;
                                            hyphens: auto;

                                            /*
                                            * Prevent any individual cell from drawing outside
                                            * the table boundary.
                                            */
                                            max-width: 0;
                                            overflow: hidden;

                                            text-align: left;
                                        }

                                        #report-content-to-export th {
                                            padding: 8px 12px;

                                            color: #ffffff;
                                            background-color: #0f172a;

                                            font-size: 9.5px;
                                            font-weight: 800;
                                            line-height: 1.35;

                                            text-transform: uppercase;
                                            letter-spacing: 0.08em;

                                            border-right: 1px solid #1e293b;

                                            border-bottom: 2.5px solid #4f46e5;
                                        }

                                        #report-content-to-export th:last-child {
                                            border-right: none;
                                        }

                                        #report-content-to-export td {
                                            padding: 8px 12px;

                                            color: #475569;

                                            font-size: 11.5px;
                                            font-weight: 500;
                                            line-height: 1.45;

                                            border-right: 1px solid #e2e8f0;

                                            border-bottom: 1px solid #e2e8f0;
                                        }

                                        #report-content-to-export td:last-child {
                                            border-right: none;
                                        }

                                        #report-content-to-export tbody tr:last-child td {
                                            border-bottom: none;
                                        }

                                        #report-content-to-export tbody tr:nth-child(odd) td {
                                            background-color: #ffffff;
                                        }

                                        #report-content-to-export tbody tr:nth-child(even) td {
                                            background-color: #f8fafc;
                                        }

                                        /*
                                        * Long links and generated identifiers need their own
                                        * wrapping rules because browsers often keep them intact.
                                        */
                                        #report-content-to-export td a,
                                        #report-content-to-export th a,
                                        #report-content-to-export td code,
                                        #report-content-to-export th code {
                                            display: inline;

                                            max-width: 100%;

                                            white-space: normal !important;
                                            overflow-wrap: anywhere;
                                            word-break: break-all;
                                        }

                                        /*
                                        * Ensure images or badges included inside table cells
                                        * cannot make the column wider.
                                        */
                                        #report-content-to-export td img,
                                        #report-content-to-export th img,
                                        #report-content-to-export td svg,
                                        #report-content-to-export th svg {
                                            max-width: 100%;
                                            height: auto;
                                        }

                                        /*
                                        * Prevent nested blocks generated by the AI from applying
                                        * margins that make the cells unnecessarily tall.
                                        */
                                        #report-content-to-export td p,
                                        #report-content-to-export th p {
                                            margin-top: 0;
                                            margin-bottom: 0.4rem;
                                            line-height: 1.45;
                                        }

                                        #report-content-to-export td p:last-child,
                                        #report-content-to-export th p:last-child {
                                            margin-bottom: 0;
                                        }

                                        #report-content-to-export td ul,
                                        #report-content-to-export td ol {
                                            margin-top: 0.25rem;
                                            margin-bottom: 0.25rem;
                                            padding-left: 1rem;
                                        }

                                        #report-content-to-export td li {
                                            margin-bottom: 0.2rem;
                                            line-height: 1.4;
                                        }
                                    `}</style>

                                    {/* A4 Paper Look */}
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 rounded-t-full" />

                                    <div className="flex justify-between items-start mb-10">
                                        <div>
                                            <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic leading-none mb-2">
                                                Strategic <br />
                                                <span className="text-indigo-600">Advisory Report</span>
                                            </h1>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 inline-flex mt-4">
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Assessment-Based Strategic Advisory</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Prepared For</p>
                                            <p className="text-sm font-bold text-slate-700">{clientName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 mt-4 uppercase tracking-widest">
                                                {isMounted ? new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '-- --- ----'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* AI Content - Rendered from HTML */}
                                    <div
                                        className="prose prose-slate max-w-none
                                            prose-headings:font-bold prose-headings:uppercase prose-headings:italic prose-headings:tracking-tight
                                            prose-h2:text-3xl prose-h2:text-slate-900 prose-h2:border-b-4 prose-h2:border-indigo-600 prose-h2:pb-3 prose-h2:mt-10 prose-h2:mb-5
                                            prose-h3:text-xl prose-h3:text-indigo-600 prose-h3:mt-7 prose-h3:mb-4
                                            prose-h4:text-base prose-h4:text-slate-800 prose-h4:mt-5 prose-h4:mb-2
                                            prose-p:text-slate-600 prose-p:text-base prose-p:mb-5 prose-p:font-medium
                                            prose-ul:my-5 prose-ol:my-5 prose-li:text-slate-600 prose-li:text-base prose-li:my-2 prose-li:font-medium"
                                    >
                                        <div dangerouslySetInnerHTML={{ __html: reportData.executiveSummary }} />

                                        {/* Detailed Chapters */}
                                        {detailedSections.map((section, idx) => (
                                        <div key={`${section.title}-${idx}`} className="mt-12 pt-8 border-t-2 border-slate-100">
                                            <div className="flex items-start gap-4 mb-6">
                                                <span className="text-[52px] leading-none font-black text-indigo-100 italic select-none">
                                                    {String(idx + 1).padStart(2, "0")}
                                                </span>

                                                <h2 className="text-[30px] leading-tight !text-slate-900 !mt-2 !mb-0 !border-none !pb-0">
                                                    {section.title}
                                                </h2>
                                            </div>

                                            <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                        </div>
                                    ))}
                                    </div>

                                    {/* Gaps/Recommendations Summary Cards */}
                                    {hasStrategicSummary && (
                                        <div className="mt-12 pt-8 border-t-2 border-slate-100">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-5">
                                                Strategic Intelligence Summary
                                            </h3>

                                            <div className={`grid grid-cols-1 gap-5 ${riskFlags.length > 0 && keyGaps.length > 0 ? "md:grid-cols-2" : ""}`}>
                                                {riskFlags.length > 0 && (
                                                    <div className="p-6 bg-red-50 rounded-2xl border border-red-200">
                                                        <h4 className="text-red-700 font-black uppercase tracking-widest text-xs mb-5 flex items-center gap-2">
                                                            <X className="w-4 h-4" />
                                                            Critical Risk Flags
                                                        </h4>

                                                        <ul className="space-y-4">
                                                            {riskFlags.map((risk, index) => (
                                                                <li key={index} className="text-sm border-b border-red-100 pb-4 last:border-0 last:pb-0">
                                                                    {hasVisibleText(risk.risk) && (
                                                                        <p className="font-medium text-red-900 mb-1.5">{risk.risk}</p>
                                                                    )}
                                                                    {hasVisibleText(risk.mitigation) && (
                                                                        <p className="text-red-700/70 text-xs leading-relaxed font-normal">{risk.mitigation}</p>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {keyGaps.length > 0 && (
                                                    <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200">
                                                        <h4 className="text-emerald-700 font-black uppercase tracking-widest text-xs mb-5 flex items-center gap-2">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                            Key Transformation Gaps
                                                        </h4>

                                                        <ul className="space-y-3">
                                                            {keyGaps.map((gap, index) => (
                                                                <li key={index} className="flex gap-3 text-sm text-emerald-800 font-medium leading-snug">
                                                                    <span className="shrink-0 text-emerald-500 mt-0.5 font-bold">▸</span>
                                                                    {gap}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {hasRecommendations && (
                                        <div className="mt-12 pt-8 border-t-2 border-slate-100">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-5">
                                                Strategic Recommendations
                                            </h3>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                                {recommendations.now.length > 0 && (
                                                    <div className="p-5 bg-red-50 rounded-2xl border border-red-200">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-red-700 mb-4">
                                                            Now
                                                        </h4>

                                                        <ul className="space-y-3">
                                                            {recommendations.now.map((item, index) => (
                                                                <li key={index} className="text-sm text-red-900 leading-relaxed">
                                                                    • {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {recommendations.next.length > 0 && (
                                                    <div className="p-5 bg-amber-50 rounded-2xl border border-amber-200">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-amber-700 mb-4">
                                                            Next
                                                        </h4>

                                                        <ul className="space-y-3">
                                                            {recommendations.next.map((item, index) => (
                                                                <li key={index} className="text-sm text-amber-900 leading-relaxed">
                                                                    • {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}

                                                {recommendations.later.length > 0 && (
                                                    <div className="p-5 bg-emerald-50 rounded-2xl border border-emerald-200">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-emerald-700 mb-4">
                                                            Later
                                                        </h4>

                                                        <ul className="space-y-3">
                                                            {recommendations.later.map((item, index) => (
                                                                <li key={index} className="text-sm text-emerald-900 leading-relaxed">
                                                                    • {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {hasSupportingMeasures && (
                                        <div className="mt-12 pt-8 border-t-2 border-slate-100">
                                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-5">
                                                Execution Controls
                                            </h3>

                                            <div
                                                className={`grid grid-cols-1 gap-5 ${
                                                    dependencies.length >
                                                        0 &&
                                                    successMetrics.length >
                                                        0
                                                        ? "md:grid-cols-2"
                                                        : ""
                                                }`}
                                            >
                                                {dependencies.length > 0 && (
                                                    <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-700 mb-4">
                                                            Dependencies
                                                        </h4>

                                                        <ul className="space-y-3">
                                                            {dependencies.map(
                                                                (
                                                                    dependency,
                                                                    index
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex gap-3 text-sm text-slate-700 leading-relaxed"
                                                                    >
                                                                        <span className="font-bold text-indigo-500">
                                                                            ▸
                                                                        </span>

                                                                        {
                                                                            dependency
                                                                        }
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}

                                                {successMetrics.length >
                                                    0 && (
                                                    <div className="p-5 bg-blue-50 rounded-2xl border border-blue-200">
                                                        <h4 className="text-xs font-black uppercase tracking-widest text-blue-700 mb-4">
                                                            Success Metrics
                                                        </h4>

                                                        <ul className="space-y-3">
                                                            {successMetrics.map(
                                                                (
                                                                    metric,
                                                                    index
                                                                ) => (
                                                                    <li
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="flex gap-3 text-sm text-blue-900 leading-relaxed"
                                                                    >
                                                                        <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />

                                                                        {metric}
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}


                                    <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">
                                        <span>HRTEKSYSTEM ADVISORY</span>
                                        <span>CONFIDENTIAL ADVISORY</span>
                                    </div>
                                </motion.div>
                            ) : error ? (
                                <div className="h-full flex flex-col items-center justify-center p-20 text-center">
                                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
                                        <X className="w-10 h-10 text-red-600" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 mb-2 uppercase italic tracking-tight">Generation Failed</h3>
                                    <p className="text-slate-500 max-w-md mx-auto mb-8 font-medium">
                                        Something went wrong during the analysis. Error: {error}
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
