import { useState, useEffect, useRef, useCallback } from 'react';
import {
    LayoutDashboard, Users, TrendingUp, Bell, FileText, Settings,
    ArrowLeft, Download, Share2, Globe, Database, Cpu, ShieldCheck
} from 'lucide-react';
import { useFetcher } from "@remix-run/react";
import { StrategicReportPreview } from "../reports/StrategicReportPreview";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";
import ChangeManagementDashboard from "./ChangeManagement/ChangeManagementDashboard";

type View = 'dashboard' | 'emotions' | 'stakeholders' | 'interventions' | 'alerts' | 'reports' | 'settings';

interface ChangeManagementReportProps {
    data: any;
    brandName: string;
    assessmentId: string;
    companyLogo?: string;
    responses?: any;
    questions?: any;
}

export default function ChangeManagementReport({ data, brandName, assessmentId, companyLogo, responses, questions }: ChangeManagementReportProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeView, setActiveView] = useState<View>('dashboard');
    const [scrollProgress, setScrollProgress] = useState(0);
    const isScrollingRef = useRef(false);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

    // AI Report State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [reportData, setReportData] = useState<HTIAdvisoryContent | null>(null);
    const fetcher = useFetcher();
    const isGenerating = fetcher.state !== "idle";

    useEffect(() => {
        document.title = `${data?.profile?.organizationName || 'HRTek'} | Change Intelligence Engine`;
    }, [data]);

    useEffect(() => {
        if (fetcher.data && (fetcher.data as any).success) {
            setReportData((fetcher.data as any).advisory);
        } else if (fetcher.data && (fetcher.data as any).error) {
            console.error("Change Report Generation Error:", (fetcher.data as any).error);
        }
    }, [fetcher.data]);

    const handleExportPDF = () => {
        setIsPreviewOpen(true);
        if (!reportData) {
            fetcher.submit(
                {
                    intent: "generate_report",
                    params: "Intelligent Change Management",
                    answers: responses || {},
                    progress: 100
                },
                { method: "post", encType: "application/json" }
            );
        }
    };

    useEffect(() => {
        const container = document.getElementById('report-scroll-container');
        const handleScroll = () => {
            if (!container) return;
            const scrolled = container.scrollTop;
            const height = container.scrollHeight - container.clientHeight;
            const progress = (scrolled / height) * 100;
            setScrollProgress(progress);
        };
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, []);

    const navItems = [
        { id: 'dashboard' as View, label: 'Dashboard', icon: LayoutDashboard },
        { id: 'emotions' as View, label: 'Emotion Intelligence', icon: TrendingUp },
        { id: 'stakeholders' as View, label: 'Stakeholder Risk', icon: Users },
        { id: 'interventions' as View, label: 'Interventions', icon: FileText },
        { id: 'alerts' as View, label: 'Alerts', icon: Bell },
        { id: 'reports' as View, label: 'Reports', icon: FileText },
        { id: 'settings' as View, label: 'Settings', icon: Settings },
    ];

    useEffect(() => {
        const scrollContainer = document.getElementById('report-scroll-container');
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isScrollingRef.current) {
                        setActiveView(entry.target.id as View);
                    }
                });
            },
            {
                threshold: 0.2,
                root: scrollContainer,
                rootMargin: '-20% 0px -60% 0px'
            }
        );

        navItems.forEach((item) => {
            const el = document.getElementById(item.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    const scrollToSection = useCallback((id: string) => {
        const el = document.getElementById(id);
        const container = document.getElementById('report-scroll-container');
        if (el && container) {
            isScrollingRef.current = true;
            clearTimeout(scrollTimerRef.current);

            const containerRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - 24;

            container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
            setActiveView(id as View);

            scrollTimerRef.current = setTimeout(() => {
                isScrollingRef.current = false;
            }, 700);
        }
    }, []);

    return (
        <div className="h-screen bg-white">
            <main className="h-full">
                <ChangeManagementDashboard
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
                engineTitle="Intelligent Change Management"
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
