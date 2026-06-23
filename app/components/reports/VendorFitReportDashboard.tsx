import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Users, TrendingUp, Bell, FileText, Settings,
    ArrowLeft, Download, Globe, Database, ShieldCheck, Building2,
    DollarSign, Activity, MapPin, Search, Cpu, Target, Rocket, Award
} from 'lucide-react';
import { VendorFitDashboard as NewVendorFitDashboard } from "./VendorFit/VendorFitDashboard";
import { motion, AnimatePresence } from "framer-motion";
import { StrategicReportPreview } from "../reports/StrategicReportPreview";
import { useReportGenerator } from "~/hooks/useReportGenerator";

type View = 'executive' | 'context' | 'financial' | 'functional' | 'matching' | 'risk' | 'tech' | 'tradeoffs' | 'rankings' | 'recommendation' | 'roadmap';

interface VendorFitReportDashboardProps {
    data: any;
    brandName: string;
    assessmentId?: string;
    companyLogo?: string;
    responses?: any;
    questions?: any;
}

export default function VendorFitReportDashboard({ data, brandName, assessmentId, companyLogo, responses, questions }: VendorFitReportDashboardProps) {
    const [activeView, setActiveView] = useState<View>('executive');
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isMounted, setIsMounted] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // AI Report State
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const { reportData, isGenerating, reportError, generate } = useReportGenerator();

    useEffect(() => setIsMounted(true), []);

    useEffect(() => {
        document.title = `${brandName || 'HRTek'} | Vendor Fit Intelligence`;
    }, [brandName]);

    const handleExportPDF = () => {
        setIsPreviewOpen(true);
        generate("HCM Vendor Fit Engine", responses);
    };

    useEffect(() => {
        const container = document.getElementById('vf-scroll-container');
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
        { id: 'executive' as View, label: 'Executive Verdict', icon: LayoutDashboard },
        { id: 'context' as View, label: 'Decision Context', icon: Target },
        { id: 'financial' as View, label: 'Financial Impact', icon: DollarSign },
        { id: 'functional' as View, label: 'Functional Fit', icon: Activity },
        { id: 'matching' as View, label: 'Requirement Match', icon: ShieldCheck },
        { id: 'risk' as View, label: 'Risk Analysis', icon: Bell },
        { id: 'tech' as View, label: 'Tech Compatibility', icon: Cpu },
        { id: 'tradeoffs' as View, label: 'Strategic Trade-offs', icon: TrendingUp },
        { id: 'rankings' as View, label: 'Vendor Rankings', icon: Users },
        { id: 'recommendation' as View, label: 'Final Recommendation', icon: Award },
        { id: 'roadmap' as View, label: 'Action Roadmap', icon: Rocket },
    ];

    useEffect(() => {
        if (!isMounted) return;
        const scrollContainer = document.getElementById('vf-scroll-container');
        if (!scrollContainer) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        // Map section IDs to View types
                        const idMap: Record<string, View> = {
                            'executive-summary': 'executive',
                            'decision-context': 'context',
                            'financial-analysis': 'financial',
                            'functional-deep-dive': 'functional',
                            'requirement-matching': 'matching',
                            'risk-assessment': 'risk',
                            'technical-compatibility': 'tech',
                            'strategic-tradeoffs': 'tradeoffs',
                            'vendor-rankings': 'rankings',
                            'recommendation': 'recommendation',
                            'roadmap': 'roadmap'
                        };
                        if (idMap[id]) setActiveView(idMap[id]);
                    }
                });
            },
            {
                threshold: 0.1,
                root: scrollContainer,
                rootMargin: '-20% 0px -60% 0px'
            }
        );

        const sectionIds = [
            'executive-summary', 'decision-context', 'financial-analysis',
            'functional-deep-dive', 'requirement-matching', 'risk-assessment',
            'technical-compatibility', 'strategic-tradeoffs', 'vendor-rankings',
            'recommendation', 'roadmap'
        ];

        // Delay to ensure inner dashboard sections are mounted
        const timer = setTimeout(() => {
            sectionIds.forEach((id) => {
                const el = document.getElementById(id);
                if (el) observer.observe(el);
            });
        }, 500);

        return () => {
            clearTimeout(timer);
            observer.disconnect();
        };
    }, [isMounted]);

    const scrollToSection = (viewId: View) => {
        setIsMobileMenuOpen(false);
        const idMap: Record<View, string> = {
            'executive': 'executive-summary',
            'context': 'decision-context',
            'financial': 'financial-analysis',
            'functional': 'functional-deep-dive',
            'matching': 'requirement-matching',
            'risk': 'risk-assessment',
            'tech': 'technical-compatibility',
            'tradeoffs': 'strategic-tradeoffs',
            'rankings': 'vendor-rankings',
            'recommendation': 'recommendation',
            'roadmap': 'roadmap'
        };
        const targetId = idMap[viewId];
        const el = document.getElementById(targetId);
        const container = document.getElementById('vf-scroll-container');
        if (el && container) {
            const containerRect = container.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const relativeTop = elRect.top - containerRect.top;
            const scrollTarget = container.scrollTop + relativeTop - 120; // Offset for header

            container.scrollTo({
                top: Math.max(0, scrollTarget),
                behavior: 'smooth'
            });
            setActiveView(viewId);
        }
    };

    return (
        <div className="h-screen bg-white font-sans">
            <main className="h-full">
                <NewVendorFitDashboard
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
                engineTitle="HCM Vendor Fit"
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
