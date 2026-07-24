import React from "react";
import {
    PDFDownloadLink,
    PDFViewer,
} from "@react-pdf/renderer";
import { Download, X } from "lucide-react";

import { HTIReportPDF } from "./HTIReportPDF";

interface PDFPreviewModalProps {
    report: any;
    companyName: string;
    isOpen: boolean;
    onClose: () => void;
}

function sanitizeFileNamePart(
    value: string,
): string {
    const sanitizedValue = value
        .trim()
        .replace(
            /[<>:"/\\|?*\u0000-\u001F]/g,
            "_",
        )
        .replace(/\s+/g, "_")
        .replace(/_+/g, "_")
        .replace(/^_+|_+$/g, "");

    return (
        sanitizedValue ||
        "Confidential_Client"
    );
}

export const PDFPreviewModal:
    React.FC<PDFPreviewModalProps> = ({
        report,
        companyName,
        isOpen,
        onClose,
    }) => {
        if (!isOpen) {
            return null;
        }

        const reportDate =
            new Date()
                .toISOString()
                .split("T")[0];

        const safeCompanyName =
            sanitizeFileNamePart(
                companyName,
            );

        const fileName =
            `HTI_Advisory_${safeCompanyName}_${reportDate}.pdf`;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">
                            PDF Preview
                        </h2>

                        <div className="flex items-center gap-3">
                            <PDFDownloadLink
                                document={
                                    <HTIReportPDF
                                        report={report}
                                        companyName={companyName}
                                    />
                                }
                                fileName={
                                    fileName
                                }
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {({
                                    loading,
                                }) => (
                                    <>
                                        <Download className="w-4 h-4" />

                                        {loading
                                            ? "Generating..."
                                            : "Download PDF"}
                                    </>
                                )}
                            </PDFDownloadLink>

                            <button
                                type="button"
                                onClick={
                                    onClose
                                }
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                aria-label="Close PDF preview"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>
                    </div>

                    {/* PDF Viewer */}
                    <div className="flex-1 overflow-hidden">
                        <PDFViewer
                            width="100%"
                            height="100%"
                            className="border-0"
                        >
                            <HTIReportPDF
                                        report={report}
                                        companyName={companyName}
                            />
                        </PDFViewer>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <p className="text-sm text-gray-600 text-center">
                            Preview of HTI
                            Advisory Report
                        </p>
                    </div>
                </div>
            </div>
        );
    };