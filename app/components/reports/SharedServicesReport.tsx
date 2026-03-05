import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import SharedServicesDashboard from "./SharedServices/SharedServicesDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { useFetcher } from "@remix-run/react";
import { StrategicReportPreview } from "../reports/StrategicReportPreview";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";

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
    const [reportData, setReportData] = useState<HTIAdvisoryContent | null>(null);
    const fetcher = useFetcher();
    const isGenerating = fetcher.state !== "idle";

    useEffect(() => {
        if (fetcher.data && (fetcher.data as any).success) {
            setReportData((fetcher.data as any).advisory);
        } else if (fetcher.data && (fetcher.data as any).error) {
            console.error("Shared Services Report Generation Error:", (fetcher.data as any).error);
        }
    }, [fetcher.data]);

    const handleExportPDF = () => {
        setIsPreviewOpen(true);
        if (!reportData) {
            fetcher.submit(
                {
                    intent: "generate_report",
                    params: "Shared Service Designer",
                    answers: responses || {},
                    progress: 100
                },
                { method: "post", encType: "application/json" }
            );
        }
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
                error={(fetcher.data as any)?.error}
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
