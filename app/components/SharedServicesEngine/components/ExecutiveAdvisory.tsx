import { useRef } from 'react';
import { HTIAdvisoryContent } from "~/models/hti.model.server";
import { Download, FileText, CheckCircle2, AlertTriangle, Lightbulb } from 'lucide-react';

interface ExecutiveAdvisoryProps {
    advisory: HTIAdvisoryContent;
}

export function ExecutiveAdvisory({ advisory }: ExecutiveAdvisoryProps) {
    const reportRef = useRef<HTMLDivElement>(null);

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            <div className="max-w-5xl mx-auto px-6 pt-10">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* report header */}
                    <div className="bg-slate-900 text-white p-10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                        <div className="relative z-10 flex justify-between items-start">
                            <div>
                                <h1 className="text-3xl font-bold mb-2">Strategic Transformation Report</h1>
                                <p className="text-slate-400">DeepSeek AI Advisor | HR Transformation Intelligence</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={async () => {
                                        const { default: jsPDF } = await import('jspdf');
                                        const { default: html2canvas } = await import('html2canvas');
                                        if (!reportRef.current) return;

                                        const pdf = new jsPDF({
                                            orientation: 'p',
                                            unit: 'pt',
                                            format: 'a4'
                                        });

                                         const canvas = await html2canvas(reportRef.current, {
                                             scale: 2,
                                             useCORS: true,
                                             logging: false,
                                             backgroundColor: '#ffffff'
                                         });
 
                                        const imgData = canvas.toDataURL('image/png');
                                        const pageWidth = pdf.internal.pageSize.getWidth();
                                        const pageHeight = pdf.internal.pageSize.getHeight();
                                        const imgHeight = canvas.height;
                                        const ratio = pageWidth / canvas.width;
                                        const canvasPageHeight = pageHeight / ratio;

                                        let heightLeft = imgHeight;
                                        let position = 0;
                                        let pageNum = 1;

                                        while (heightLeft > 0) {
                                            // Render page slice
                                            pdf.addImage(imgData, 'PNG', 0, -position, pageWidth, imgHeight * ratio);

                                            // 1. Watermark — light gray diagonal text (no GState needed)
                                            pdf.setTextColor(220, 220, 220);
                                            pdf.setFontSize(65);
                                            pdf.setFont('helvetica', 'bold');
                                            pdf.text('HRTEKSYSTEM', pageWidth / 2, pageHeight / 2, {
                                                angle: 45,
                                                align: 'center'
                                            });

                                            // 2. Header white bar
                                            pdf.setFillColor(255, 255, 255);
                                            pdf.rect(0, 0, pageWidth, 50, 'F');
                                            pdf.setFontSize(14);
                                            pdf.setTextColor(15, 23, 42);
                                            pdf.setFont('helvetica', 'bold');
                                            pdf.text('HRTEK', 40, 30);
                                            pdf.setFontSize(8);
                                            pdf.setTextColor(79, 70, 229);
                                            pdf.text('SYSTEM', 40, 40);
                                            pdf.setFontSize(8);
                                            pdf.setTextColor(148, 163, 184);
                                            pdf.setFont('helvetica', 'normal');
                                            pdf.text('STRATEGIC ADVISORY REPORT | CONFIDENTIAL', pageWidth - 40, 35, { align: 'right' });
                                            pdf.setDrawColor(226, 232, 240);
                                            pdf.line(40, 45, pageWidth - 40, 45);

                                            // 3. Footer white bar
                                            pdf.setFillColor(255, 255, 255);
                                            pdf.rect(0, pageHeight - 30, pageWidth, 30, 'F');
                                            pdf.setFontSize(8);
                                            pdf.setTextColor(148, 163, 184);
                                            pdf.text(`© 2026 HRTek Systems | Page ${pageNum}`, pageWidth / 2, pageHeight - 12, { align: 'center' });

                                            heightLeft -= canvasPageHeight;
                                            position += pageHeight;
                                            pageNum++;
                                            if (heightLeft > 0) pdf.addPage();
                                        }

                                        pdf.save(`HRTek-Strategic-Report-${new Date().getTime()}.pdf`);
                                    }}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                                >
                                    <Download className="w-4 h-4" />
                                    Download Strategic PDF
                                </button>
                                <div className="px-4 py-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/20">
                                    <div className="text-xs text-slate-300 uppercase tracking-widest mb-1">Status</div>
                                    <div className="font-bold text-emerald-400 flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" /> Ready for Review
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 space-y-12" id="ai-report-content" ref={reportRef}>
                        {/* Report Header Branding for PDF Capture */}
                        <div className="flex items-center justify-between border-b-2 border-slate-900 pb-6 mb-10">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-slate-900 rounded-lg">
                                    <Target className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">HRTek System</h2>
                                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest -mt-1">Strategic Advisory Intelligence</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confidential Report</p>
                                <p className="text-sm font-black text-slate-900">ID: HTI-{new Date().getFullYear()}-8492</p>
                            </div>
                        </div>

                        {/* Quick Summary Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <Target className="w-5 h-5 text-indigo-600" /> Current Maturity
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Maturity Level</span>
                                        <span className="font-bold text-slate-900">{advisory.currentState.maturityLevel || "Evaluating"}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-slate-500">Readiness Score</span>
                                        <span className="font-bold text-indigo-600">{advisory.currentState.digitalReadiness || "Partially Ready"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 bg-slate-50 rounded-xl border border-slate-200">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" /> Priority Gaps
                                </h3>
                                <ul className="space-y-2">
                                    {advisory.currentState.keyGaps.slice(0, 3).map((gap, i) => (
                                        <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                            {gap}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* The Main AI Generated Long-form Content */}
                        <div className="prose prose-slate max-w-none">
                            <div
                                className="ai-rendered-html-content space-y-8"
                                dangerouslySetInnerHTML={{ __html: advisory.executiveSummary }}
                            />
                        </div>

                        {/* Strategic Recommendations */}
                        <div className="pt-8 border-t border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-8 flex items-center gap-2">
                                <Lightbulb className="w-6 h-6 text-indigo-600" /> Strategic Roadmap Recommendations
                            </h2>

                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-indigo-700 mb-4 border-l-4 border-indigo-600 pl-3">Immediate Actions (Now)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {advisory.recommendations.now.map((rec, i) => (
                                            <div key={i} className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-sm text-indigo-900">
                                                {rec}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-4 border-l-4 border-slate-600 pl-3">Mid-Term Objectives (Next)</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {advisory.recommendations.next.map((rec, i) => (
                                            <div key={i} className="p-4 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-900">
                                                {rec}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Risk Mitigation */}
                        <div className="pt-8 border-t border-slate-200">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <AlertTriangle className="w-6 h-6 text-red-600" /> Risk Mitigation Framework
                            </h2>
                            <div className="overflow-hidden border border-slate-200 rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Risk Profile</th>
                                            <th className="px-6 py-4">Mitigation Strategy</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        {advisory.riskFlags.map((risk, i) => (
                                            <tr key={i}>
                                                <td className="px-6 py-4 font-medium text-slate-900">{risk.risk}</td>
                                                <td className="px-6 py-4 text-slate-600">{risk.mitigation}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .ai-rendered-html-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #0f172a;
          margin-top: 2rem;
          padding-bottom: 0.5rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .ai-rendered-html-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1e293b;
          margin-top: 1.5rem;
        }
        .ai-rendered-html-content p {
          line-height: 1.75;
          color: #334155;
          margin-bottom: 1rem;
        }
        .ai-rendered-html-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .ai-rendered-html-content li {
          margin-bottom: 0.5rem;
        }
        .ai-rendered-html-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
        }
        .ai-rendered-html-content table th, 
        .ai-rendered-html-content table td {
          border: 1px solid #e2e8f0;
          padding: 0.75rem;
        }
      `}} />
        </div>
    );
}

function Target({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
    );
}
