import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from '~/components/reports/SharedServices/components/Sidebar';
import { SummaryHero } from './components/decisive/summary-hero';
import { OperationalEfficiency } from './components/decisive/operational-efficiency';
import { WorkforceTransformation } from './components/decisive/workforce-transformation';
import { TechInfrastructure } from './components/decisive/tech-infrastructure';
import { RiskGovernance } from './components/decisive/risk-governance';
import { FinancialPerformance } from './components/decisive/financial-performance';
import { StrategicChange } from './components/decisive/strategic-change';
import { ExecutionRoadmap } from './components/decisive/execution-roadmap';
import { Layout, Building2, Users, Layers, ShieldCheck, Wallet, Sparkles, Flag } from 'lucide-react';
import { calculateSSTI } from '~/components/SharedServicesEngine/utils/calculations';

const SECTION_IDS = [
    'summary-hero',
    'operational-efficiency',
    'workforce-transformation',
    'tech-infrastructure',
    'risk-governance',
    'financial-performance',
    'strategic-change',
    'execution-roadmap'
];

const HEADER_HEIGHT = 100;

export default function SharedServicesDashboard({
    data,
    brandName = "HR TEK SYSTEMS",
    hideSidebar = false,
    onGenerateDossier,
    responses,
    questions
}: {
    data: any;
    brandName?: string;
    hideSidebar?: boolean;
    onGenerateDossier?: () => void;
    responses?: any;
    questions?: any;
}) {
    const [activeSection, setActiveSection] = useState('summary-hero');
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
        return Math.min(100, Math.round((answeredCount / totalCount) * 100));
    }, [responses, questions]);

    // Compute real domain scores from user responses
    const computedData = React.useMemo(() => {
        const base = data ?? {};
        if (!responses) return base;
        const answersMap: Record<number, number> = {};
        Object.entries(responses).forEach(([k, v]) => {
            const num = parseInt(k, 10);
            if (!isNaN(num)) answersMap[num] = Number(v);
        });
        const sstiResult = calculateSSTI(answersMap);
        const ds = sstiResult.domainScores;
        const score = (idx: number) => ds[idx]?.score ?? 0;
        return {
            ...base,
            computed: {
                sstiScore: sstiResult.sstiScore,
                classification: sstiResult.classification,
                domainScores: ds,
                operatingModel: score(0),
                serviceExperience: score(1),
                process: score(2),
                technology: score(3),
                dataManagement: score(4),
                governance: score(5),
                financial: score(6),
                changeAdoption: score(7),
                agentic: score(8),
            },
        };
    }, [responses, data]);
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Standard Nav Items for Shared Services
    const navItems = [
        { id: 'summary-hero', label: 'Executive Pulse', icon: Layout },
        { id: 'operational-efficiency', label: 'Operating Model', icon: Building2 },
        { id: 'workforce-transformation', label: 'Workforce Radius', icon: Users },
        { id: 'tech-infrastructure', label: 'Digital Core', icon: Layers },
        { id: 'risk-governance', label: 'Governance Shield', icon: ShieldCheck },
        { id: 'financial-performance', label: 'Value Dynamics', icon: Wallet },
        { id: 'strategic-change', label: 'Strategic Change', icon: Sparkles },
        { id: 'execution-roadmap', label: 'Strategic Roadmap', icon: Flag }
    ];

    // Scroll spy
    useEffect(() => {
        if (!isMounted) return;
        const container = scrollRef.current;
        if (!container) return;

        const onScroll = () => {
            if (isScrollingRef.current) return;

            const containerRect = container.getBoundingClientRect();
            const threshold = containerRect.top + HEADER_HEIGHT + 40;

            for (const id of SECTION_IDS) {
                const el = container.querySelector(`#${id}`) as HTMLElement | null;
                if (!el) continue;

                const rect = el.getBoundingClientRect();
                if (rect.top <= threshold && rect.bottom > threshold) {
                    setActiveSection(id);
                    break;
                }
            }
        };

        container.addEventListener('scroll', onScroll, { passive: true });
        return () => container.removeEventListener('scroll', onScroll);
    }, [isMounted]);

    // Navigate to a section
    const scrollToSection = useCallback((id: string) => {
        const container = scrollRef.current;
        if (!container) return;

        const el = container.querySelector(`#${id}`) as HTMLElement | null;
        if (!el) return;

        isScrollingRef.current = true;
        clearTimeout(scrollTimerRef.current);

        const containerRect = container.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const targetScrollTop = container.scrollTop + (elRect.top - containerRect.top) - HEADER_HEIGHT;

        container.scrollTo({ top: Math.max(0, targetScrollTop), behavior: 'smooth' });
        setActiveSection(id);

        scrollTimerRef.current = setTimeout(() => {
            isScrollingRef.current = false;
        }, 800);
    }, []);

    if (!isMounted) {
        return <div className="h-screen w-full bg-white animate-pulse" />;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-white font-sans text-slate-900">
            {!hideSidebar && (
                <Sidebar
                    activeSection={activeSection}
                    onNavigate={scrollToSection}
                    data={data}
                    navItems={navItems}
                />
            )}

            <div
                ref={scrollRef}
                className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth bg-slate-50/30 font-sans"
            >
                {/* Premium Status Header */}
                <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-200/50 px-10 py-5 flex items-center justify-between shadow-[0_4px_20px_-5px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center gap-8">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-4 pr-8 border-r border-slate-200"
                        >
                            <img src="/hrtek_logo.png" alt="HRTek" className="h-9 w-auto object-contain" />
                            <div className="flex flex-col">
                                <h1 className="text-xl font-bold text-slate-900 tracking-tighter uppercase leading-none italic">Shared Services</h1>
                                <span className="text-[10px] font-medium text-blue-600 uppercase tracking-[0.3em] mt-1">Intelligence Engine</span>
                            </div>
                        </motion.div>

                        <div className="hidden lg:block">
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-[0.2em] flex items-center gap-2.5">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                {brandName} • Strategic Audit v4.2
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-12">
                        <div className="hidden md:flex flex-col items-end gap-1.5">
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] font-medium text-slate-400 uppercase tracking-[0.2em]">Capture Rate</span>
                                <span className="text-xs font-semibold text-blue-600 italic">{progress}%</span>
                            </div>
                            <div className="h-1.5 w-40 bg-slate-100 rounded-full overflow-hidden p-[1px] border border-slate-200/50">
                                <motion.div 
                                    initial={{ width: 0 }} 
                                    animate={{ width: `${progress}%` }} 
                                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.3)]" 
                                />
                            </div>
                        </div>
                        <button
                            onClick={onGenerateDossier}
                            className="group relative h-12 bg-slate-900 overflow-hidden text-white font-semibold text-[10px] uppercase tracking-[0.2em] px-10 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <span className="relative z-10 flex items-center gap-2">
                                Export Report
                                <motion.span
                                    animate={{ x: [0, 4, 0] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    →
                                </motion.span>
                            </span>
                        </button>
                    </div>
                </div>

                <main className="max-w-7xl mx-auto w-full px-12 py-24 pb-40">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-64"
                    >
                        <section id="summary-hero">
                            <SummaryHero data={computedData} />
                        </section>

                        <section id="operational-efficiency">
                            <OperationalEfficiency data={computedData} />
                        </section>

                        <section id="workforce-transformation">
                            <WorkforceTransformation data={computedData} />
                        </section>

                        <section id="tech-infrastructure">
                            <TechInfrastructure data={computedData} />
                        </section>

                        <section id="risk-governance">
                            <RiskGovernance data={computedData} />
                        </section>

                        <section id="financial-performance">
                            <FinancialPerformance data={computedData} />
                        </section>

                        <section id="strategic-change">
                            <StrategicChange data={computedData} />
                        </section>

                        <section id="execution-roadmap">
                            <ExecutionRoadmap data={computedData} />
                        </section>
                    </motion.div>

                    <footer className="pt-32 pb-16 flex flex-col items-center gap-8 border-t border-slate-100 mt-64 text-center">
                        <img src="/hrtek_logo.png" alt="HRTek" className="h-10 opacity-20 brightness-0" />
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-slate-300 uppercase tracking-[0.3em]">
                                HR TEK SYSTEMS GLOBAL AUDIT © 2026
                            </p>
                            <p className="text-[10px] text-slate-300 font-medium uppercase tracking-[0.2em]">
                                Confidential Intelligence Blueprint • Private & Sensitive
                            </p>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
