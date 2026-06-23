import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import SharedServicesDashboard from "./SharedServices/SharedServicesDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { StrategicReportPreview } from "../reports/StrategicReportPreview";
import { useReportGenerator } from "~/hooks/useReportGenerator";

interface SharedServicesReportProps {
    data: any;
    brandName: string;
    assessmentId?: string;
    companyLogo?: string;
    responses?: any;
    questions?: any;
}

export default function SharedServicesReport({ data, brandName, assessmentId, companyLogo, responses, questions }: SharedServicesReportProps) {
    // AI Report State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { reportData, isGenerating, reportError, generate } = useReportGenerator();

    const handleExportPDF = () => {
        setIsPreviewOpen(true);
        generate("Shared Service Designer", responses);
    };

    return (
        <div className="h-screen bg-white">
            <main className="h-full">
                <SharedServicesDashboard
                    data={data}
                    brandName={brandName}
                    hideSidebar={false}
                    onGenerateDossier={handleExportPDF}
                    responses={responses}
                    questions={questions}
                />
            </main>

            <StrategicReportPreview
                isOpen={isPreviewOpen}
                onClose={() => setIsPreviewOpen(false)}
                reportData={reportData}
                isGenerating={isGenerating}
                error={reportError}
                engineTitle="Shared Services Designer"
                brandName={brandName}
            />

            {/* Float Back Button */}
            <div className="fixed bottom-10 right-10 z-[100]">
                <button
                    onClick={() => window.history.back()}
                    className="p-5 bg-slate-950 text-white rounded-full shadow-2xl hover:scale-110 active:scale-90 transition-all group"
                >
                    <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
}
