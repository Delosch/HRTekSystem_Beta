import React, { useState } from 'react';
import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { HTIReportPDF } from './HTIReportPDF';
import { X, Download } from 'lucide-react';

interface PDFPreviewModalProps {
    report: any;
    isOpen: boolean;
    onClose: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ report, isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">PDF Preview</h2>
                    <div className="flex items-center gap-3">
                        <PDFDownloadLink
                            document={<HTIReportPDF report={report} />}
                            fileName={`HTI_Advisory_${report.companyId}_${new Date().toISOString().split('T')[0]}.pdf`}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {({ loading }) => (
                                <>
                                    <Download className="w-4 h-4" />
                                    {loading ? 'Generating...' : 'Download PDF'}
                                </>
                            )}
                        </PDFDownloadLink>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 overflow-hidden">
                    <PDFViewer width="100%" height="100%" className="border-0">
                        <HTIReportPDF report={report} />
                    </PDFViewer>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <p className="text-sm text-gray-600 text-center">
                        Preview of HTI Advisory Report with HRTekSystem watermark
                    </p>
                </div>
            </div>
        </div>
    );
};
