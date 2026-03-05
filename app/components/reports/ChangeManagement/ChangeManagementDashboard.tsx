import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share2, Globe, FileText, Layout, ChevronRight, Menu, X, Rocket } from 'lucide-react';
import { calculateIndexScores } from '~/components/assessment/ChangeManagement/utils/scoringEngine';
import { Sidebar } from './components/Sidebar';
import { SummaryHero } from './components/decisive/summary-hero';
import { ImpactAnalytics } from './components/decisive/impact-analytics';
import { LeadershipAlignment } from './components/decisive/leadership-alignment';
import { CommunicationPulse } from './components/decisive/communication-pulse';
import { ChangeRiskMatrix } from './components/decisive/change-risk-matrix';
import { AdoptionRoadmap } from './components/decisive/adoption-roadmap';

interface ChangeManagementDashboardProps {
    data: any;
    brandName: string;
    hideSidebar?: boolean;
    onGenerateDossier?: () => void;
    responses?: any;
    questions?: any;
}

export default function ChangeManagementDashboard({
    data,
    brandName,
    hideSidebar = false,
    onGenerateDossier,
    responses,
    questions
}: ChangeManagementDashboardProps) {
    const [activeSection, setActiveSection] = useState('summary');
    const [isMounted, setIsMounted] = useState(false);

    const progress = React.useMemo(() => {
        if (!responses || !questions) return 0;
        let totalCount = 0;
        if (Array.isArray(questions)) {
            totalCount = questions.length;
        } else if (typeof questions === 'object') {
            Object.values(questions).forEach((section: any) => {
                if (Array.isArray(section)) totalCount += section.length;
                else if (section?.questions && Array.isArray(section.questions)) totalCount += section.questions.length;
            });
        }
        if (totalCount === 0) return 0;
        const answeredCount = Object.keys(responses).length;
        return Math.round((answeredCount / totalCount) * 100);
    }, [responses, questions]);

    // Compute real index scores from user responses
    const computedData = React.useMemo(() => {
        const base = data ?? {};
        if (!responses) return base;
        const indexScores = calculateIndexScores(responses as any);
        const pct = (key: string) => Math.round(indexScores.find((i: any) => i.indexKey === key)?.percentage ?? 65);
        const sfri = pct('SFRI');
        const lgi  = pct('LGI');
        const ocri = pct('OCRI');
        const dwri = pct('DWRI');
        const asii = pct('ASII');
        const overall = Math.round((sfri + lgi + ocri + dwri + asii) / 5);
        return {
            ...base,
            readinessAssessment: { overallScore: Math.round((sfri + ocri) / 2) },
            impactAssessment:    { overallScore: dwri },
            maturityLevel:       lgi,
            computed: { overall, sfri, lgi, ocri, dwri, asii,
                culture: ocri, process: sfri, technology: dwri, structure: lgi, people: asii,
                advocacyFlow: lgi, fluencyRate: dwri, adoptionCeiling: asii,
            },
        };
    }, [responses, data]);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Scrollspy logic
    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const sections = ['summary', 'impact', 'alignment', 'comms', 'risk', 'readiness', 'roadmap'];
            const current = sections.find(section => {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    return rect.top >= 0 && rect.top <= 400;
                }
                return false;
            });
            if (current) setActiveSection(current);
        };

        container.addEventListener('scroll', handleScroll);
        return () => container.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            setActiveSection(id);
        }
    };

    if (!isMounted) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Initializing Pulse Engine...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {!hideSidebar && (
                <Sidebar
                    activeSection={activeSection}
                    onNavigate={scrollToSection}
                />
            )}

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Premium Header */}
                <header className="h-24 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 flex items-center justify-between px-12 sticky top-0 z-[90] shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-10">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 border-r border-slate-200 pr-8"
                        >
                            <img src="/hrtek_logo.png" alt="HRTek" className="h-9 w-auto object-contain" />
                            <div className="flex flex-col">
                                <h1 className="text-xl font-black text-slate-900 tracking-tighter uppercase leading-none italic">Change Management</h1>
                                <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.3em] mt-1">Intelligence Engine</span>
                            </div>
                        </motion.div>

                        <div className="hidden lg:flex flex-col justify-center gap-1">
                            <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] leading-none">Transformation Target</h2>
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-black text-slate-900 uppercase italic tracking-tighter">
                                    {brandName}
                                </span>
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="hidden md:flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Capture Rate</span>
                                <span className="text-xs font-black text-indigo-600 italic">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-40 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200/50">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${progress}%` }} 
                                    className="h-full bg-gradient-to-r from-indigo-600 to-violet-500 rounded-full shadow-[0_0_10px_rgba(79,70,229,0.3)]" 
                                />
                            </div>
                        </div>

                        <button
                            onClick={onGenerateDossier}
                            className="group relative h-12 bg-slate-900 overflow-hidden text-white font-black text-[10px] uppercase tracking-[0.2em] px-10 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-violet-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center gap-2">
                                Export Report
                                <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                            </span>
                        </button>
                    </div>
                </header>

                <main
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth bg-slate-50/50"
                >
                    <div className="max-w-7xl mx-auto px-12 py-20 space-y-32 pb-40">
                        <section id="summary" className="scroll-mt-32">
                            <SummaryHero data={computedData} />
                        </section>

                        <section id="impact" className="scroll-mt-32">
                            <ImpactAnalytics data={computedData} />
                        </section>

                        <section id="alignment" className="scroll-mt-32">
                            <LeadershipAlignment data={computedData} />
                        </section>

                        <section id="comms" className="scroll-mt-32">
                            <CommunicationPulse data={computedData} />
                        </section>

                        <section id="risk" className="scroll-mt-32">
                            <ChangeRiskMatrix data={computedData} />
                        </section>

                        <section id="roadmap" className="scroll-mt-32 pt-20 border-t border-slate-200">
                            <AdoptionRoadmap data={computedData} />
                        </section>
                    </div>

                    {/* Industrial Footer */}
                    <footer className="px-12 py-10 border-t border-slate-200 bg-white flex justify-between items-center">
                        <div className="flex items-center gap-6">
                            <img src="/hrtek_logo.png" alt="HRTek" className="h-5 brightness-0 opacity-30" />
                            <div className="w-px h-4 bg-slate-200" />
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] italic">
                                Built for Strategic Transformation Leaders
                            </p>
                        </div>
                        <div className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                            CONFIDENTIAL // HRTEK CM-ENGINE v4.2
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
