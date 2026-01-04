import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportData {
    companyName: string;
    engineName: string;
    generatedDate: string;
    result: any;
}

/**
 * Generate PDF report from analysis data
 */
export function generatePDFReport(reportData: ReportData): Blob {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFillColor(37, 99, 235); // Blue
    doc.rect(0, 0, pageWidth, 40, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('AI-Generated Report', pageWidth / 2, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(reportData.engineName, pageWidth / 2, 30, { align: 'center' });

    yPosition = 50;

    // Company Information
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Company:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(reportData.companyName, 50, yPosition);

    yPosition += 7;
    doc.setFont('helvetica', 'bold');
    doc.text('Generated:', 20, yPosition);
    doc.setFont('helvetica', 'normal');
    doc.text(new Date(reportData.generatedDate).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }), 50, yPosition);

    yPosition += 15;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Report Content
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('Analysis Report', 20, yPosition);
    yPosition += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    // Process report data
    if (reportData.result && typeof reportData.result === 'object') {
        Object.entries(reportData.result).forEach(([key, value]) => {
            // Check if we need a new page
            if (yPosition > pageHeight - 40) {
                doc.addPage();
                yPosition = 20;
            }

            // Section title
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(37, 99, 235);
            const sectionTitle = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            doc.text(sectionTitle, 20, yPosition);
            yPosition += 7;

            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);

            // Section content
            if (typeof value === 'object' && value !== null) {
                // Handle nested objects/arrays
                if (Array.isArray(value)) {
                    value.forEach((item, index) => {
                        if (yPosition > pageHeight - 30) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        const text = typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item);
                        const lines = doc.splitTextToSize(`${index + 1}. ${text}`, pageWidth - 50);
                        doc.text(lines, 25, yPosition);
                        yPosition += lines.length * 5 + 3;
                    });
                } else {
                    // Handle object
                    Object.entries(value).forEach(([subKey, subValue]) => {
                        if (yPosition > pageHeight - 30) {
                            doc.addPage();
                            yPosition = 20;
                        }
                        const subTitle = subKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        doc.setFont('helvetica', 'bold');
                        doc.text(`${subTitle}:`, 25, yPosition);
                        yPosition += 5;

                        doc.setFont('helvetica', 'normal');
                        const text = typeof subValue === 'object' ? JSON.stringify(subValue, null, 2) : String(subValue);
                        const lines = doc.splitTextToSize(text, pageWidth - 55);
                        doc.text(lines, 30, yPosition);
                        yPosition += lines.length * 5 + 3;
                    });
                }
            } else {
                // Handle simple values
                const text = String(value);
                const lines = doc.splitTextToSize(text, pageWidth - 50);
                doc.text(lines, 25, yPosition);
                yPosition += lines.length * 5;
            }

            yPosition += 8;
        });
    }

    // Footer on all pages
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
            `Page ${i} of ${pageCount} | Generated by HR-Tek AI Platform`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        );
    }

    return doc.output('blob');
}

/**
 * Download PDF report
 */
export function downloadPDF(reportData: ReportData, filename?: string) {
    const blob = generatePDFReport(reportData);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `${reportData.engineName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
