/**
 * PDF Report Generator Utility
 * Captures a rendered HTML element and produces a professional multi-page PDF
 * with HRTek branding, watermark, and per-page headers/footers.
 */

export async function downloadReportAsPDF(
    contentElementId: string,
    engineName: string,
): Promise<void> {
    // Dynamic imports – browser-only libs, avoid SSR issues
    const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
    ]);

    const element = document.getElementById(contentElementId);
    if (!element) throw new Error(`Element #${contentElementId} not found`);

    // 1. Capture the full rendered element
    const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        // Capture full element height regardless of scroll position
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
    });

    // 2. A4 page layout constants (all values in mm)
    const PAGE_W = 210;
    const PAGE_H = 297;
    const MARGIN = 14;
    const HEADER_H = 28;   // top header band
    const FOOTER_H = 13;   // bottom footer band
    const CONTENT_W = PAGE_W - MARGIN * 2;
    const CONTENT_H = PAGE_H - HEADER_H - FOOTER_H - 4; // 4 mm padding between bands

    // 3. Calculate how many PDF pages are needed
    const scaledImgH = (canvas.height * CONTENT_W) / canvas.width;
    const totalPages = Math.max(1, Math.ceil(scaledImgH / CONTENT_H));
    const pixelsPerPage = canvas.height / totalPages;

    // 4. Load HRTek logo as a data URL (best-effort)
    let logoUrl: string | null = null;
    try {
        const resp = await fetch('/hrtek_logo.png');
        if (resp.ok) {
            const blob = await resp.blob();
            logoUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });
        }
    } catch {
        // Logo is decorative – proceed without it
    }

    // 5. Build the PDF document
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });

    const dateStr = new Date().toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
    });

    for (let pg = 0; pg < totalPages; pg++) {
        if (pg > 0) pdf.addPage();

        // ── Header background (dark slate) ──────────────────────────────
        pdf.setFillColor(15, 23, 42);           // slate-900
        pdf.rect(0, 0, PAGE_W, HEADER_H, 'F');

        // Two-tone accent bar at bottom of header
        pdf.setFillColor(99, 102, 241);          // indigo-500
        pdf.rect(0, HEADER_H - 2, PAGE_W * 0.55, 2, 'F');
        pdf.setFillColor(6, 182, 212);           // cyan-500
        pdf.rect(PAGE_W * 0.55, HEADER_H - 2, PAGE_W * 0.45, 2, 'F');

        // Logo (top-left inside header)
        const logoX = MARGIN;
        if (logoUrl) {
            pdf.addImage(logoUrl, 'PNG', logoX, 5, 16, 16);
        }

        const textX = logoUrl ? MARGIN + 20 : MARGIN;

        // Engine name
        pdf.setFontSize(12.5);
        pdf.setTextColor(255, 255, 255);
        pdf.setFont('helvetica', 'bold');
        pdf.text(engineName, textX, 13);

        // Subtitle
        pdf.setFontSize(6.5);
        pdf.setTextColor(148, 163, 184);         // slate-400
        pdf.setFont('helvetica', 'normal');
        pdf.text('Strategic Intelligence Report  •  AI-Powered by HRTek System', textX, 21);

        // Date + page counter (right side)
        pdf.setFontSize(7);
        pdf.setTextColor(100, 116, 139);
        pdf.text(`${dateStr}   |   Page ${pg + 1} / ${totalPages}`, PAGE_W - MARGIN, 13, { align: 'right' });

        // Confidential badge
        pdf.setFontSize(5.5);
        pdf.setTextColor(239, 68, 68);           // red-500
        pdf.setFont('helvetica', 'bold');
        pdf.text('CONFIDENTIAL', PAGE_W - MARGIN, 21, { align: 'right' });

        // ── HRTEKSYSTEM watermark (diagonal, very light) ─────────────────
        pdf.setFontSize(48);
        pdf.setTextColor(220, 228, 242);         // light blue-gray
        pdf.setFont('helvetica', 'bold');
        pdf.text('HRTEKSYSTEM', PAGE_W / 2, PAGE_H / 2 + 20, {
            align: 'center',
            angle: 315,
        });

        // Reset text color before content
        pdf.setTextColor(30, 41, 59);

        // ── Content slice ─────────────────────────────────────────────────
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        const sliceH = Math.ceil(pixelsPerPage);
        sliceCanvas.height = sliceH;

        const ctx = sliceCanvas.getContext('2d')!;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, sliceCanvas.width, sliceH);
        ctx.drawImage(
            canvas,
            0, pg * pixelsPerPage,
            canvas.width, pixelsPerPage,
            0, 0,
            canvas.width, sliceH,
        );

        const sliceData = sliceCanvas.toDataURL('image/jpeg', 0.88);
        pdf.addImage(sliceData, 'JPEG', MARGIN, HEADER_H + 2, CONTENT_W, CONTENT_H, '', 'FAST');

        // ── Footer ────────────────────────────────────────────────────────
        pdf.setFillColor(248, 250, 252);         // slate-50
        pdf.rect(0, PAGE_H - FOOTER_H, PAGE_W, FOOTER_H, 'F');

        pdf.setDrawColor(226, 232, 240);         // slate-200
        pdf.setLineWidth(0.25);
        pdf.line(MARGIN, PAGE_H - FOOTER_H + 0.3, PAGE_W - MARGIN, PAGE_H - FOOTER_H + 0.3);

        pdf.setFontSize(6.5);
        pdf.setTextColor(148, 163, 184);
        pdf.setFont('helvetica', 'normal');
        pdf.text(
            '© 2026 HRTek Systems  •  Confidential & Proprietary  •  Not for External Distribution',
            PAGE_W / 2,
            PAGE_H - 4,
            { align: 'center' },
        );
    }

    // 6. Trigger download
    const safeName = engineName.replace(/[^a-zA-Z0-9\s_-]/g, '').replace(/\s+/g, '_');
    const dateSuffix = new Date().toISOString().split('T')[0];
    pdf.save(`${safeName}_Strategic_Report_${dateSuffix}.pdf`);
}
