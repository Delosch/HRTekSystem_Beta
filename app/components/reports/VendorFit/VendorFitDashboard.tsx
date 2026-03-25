import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardHeader } from './components/decisive/dashboard-header';
import { CategoryAnalysis } from './components/decisive/category-analysis';
import { RecommendedStack } from './components/decisive/recommended-stack';
import { ActionRoadmap } from './components/decisive/action-roadmap';
import { ExecutiveVerdict } from './components/decisive/executive-verdict';
import { FinancialVerdict } from './components/decisive/financial-verdict';
import { FunctionalDeepDive } from './components/decisive/functional-deep-dive';
import { RiskAssessment } from './components/decisive/risk-assessment';
import { VendorRankings } from './components/decisive/vendor-rankings';
import { SummaryMetrics } from './components/decisive/summary-metrics';
import { VendorProfilePage } from './components/decisive/vendor-profile-page';
import { DashboardSidebar } from '~/components/reports/VendorFit/components/dashboard-sidebar';
import { motion, AnimatePresence } from 'framer-motion';

interface VendorFitDashboardProps {
    data: any;
    brandName: string;
    hideSidebar?: boolean;
    responses?: any;
    questions?: any;
    onGenerateDossier?: () => void;
}

const SECTION_IDS = [
    'summary-metrics',
    'exposure-profile',
    'global-rankings',
    'functional-performance',
    'integrity-profile',
    'financial-dynamics',
    'decision-logic',
    'implementation-roadmap'
];

// Height of the sticky DashboardHeader inside the scroll container
const HEADER_HEIGHT = 100;

export function VendorFitDashboard({ data, brandName, hideSidebar = false, responses, questions, onGenerateDossier }: VendorFitDashboardProps) {
    const [currentView, setCurrentView] = useState<'dashboard' | 'profile'>('dashboard');
    const [selectedVendor, setSelectedVendor] = useState<string>('');
    const [activeSection, setActiveSection] = useState('summary-metrics');

    // Compute real domain scores from user responses (scale questions 1-5)
    const computedData = React.useMemo(() => {
        const base = data ?? {};
        if (!responses) return base;

        const getScale = (id: string): number | null => {
            const v = responses[id];
            if (v === undefined || v === null) return null;
            const n = Number(v);
            return isNaN(n) ? null : n;
        };
        const pct = (v: number | null) => v !== null ? Math.round((v / 5) * 100) : null;

        // Importance scale questions from vendor-evaluation.json
        const fnScore  = pct(getScale('s2_q3')) ?? 70;  // Customization needs → functional
        const repScore = pct(getScale('s3_q1')) ?? 75;  // Vendor reputation importance
        const impScore = pct(getScale('s3_q4')) ?? 70;  // Implementation support importance
        const rmScore  = pct(getScale('s3_q5')) ?? 72;  // Product roadmap importance
        const secScore = pct(getScale('s4_q4')) ?? 80;  // Data security importance

        const avgScale = Math.round((fnScore + repScore + impScore + rmScore + secScore) / 5);
        const answeredCount = Object.keys(responses).length;
        const completionPct = Math.min(100, Math.round((answeredCount / 25) * 100));
        const fitScore = Math.min(100, Math.round(avgScale * 0.8 + completionPct * 0.2));

        return {
            ...base,
            computed: {
                fitScore,
                completionPct,
                functional:       fnScore,
                vendorReputation: repScore,
                implementSupport: impScore,
                roadmapScore:     rmScore,
                securityScore:    secScore,
                vendorScore:      Math.round((repScore + rmScore) / 2),
                implementScore:   Math.round((impScore + fnScore) / 2),
            },
        };
    }, [responses, data]);

    const progress = React.useMemo(() => {
        if (!responses || !questions) return 0;
        // Collect all question IDs from all sections
        let totalCount = 0;
        if (Array.isArray(questions)) {
            totalCount = questions.length;
        } else if (typeof questions === 'object') {
            // If it's structured by sections
            Object.values(questions).forEach((section: any) => {
                if (Array.isArray(section)) totalCount += section.length;
                else if (section?.questions && Array.isArray(section.questions)) totalCount += section.questions.length;
            });
        }

        if (totalCount === 0) return 0;
        const answeredCount = Object.keys(responses).length;
        return Math.round((answeredCount / totalCount) * 100);
    }, [responses, questions]);

    // The main content area is the scroll container
    const scrollRef = useRef<HTMLDivElement>(null);
    const isScrollingRef = useRef(false);
    const scrollTimerRef = useRef<ReturnType<typeof setTimeout>>();

    // ── Scroll spy ────────────────────────────────────────────────────
    useEffect(() => {
        if (currentView !== 'dashboard') return;
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
    }, [currentView]);

    // ── Navigate to a section ─────────────────────────────────────────
    const doScroll = useCallback((id: string) => {
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

    const scrollToSection = useCallback((id: string) => {
        if (currentView !== 'dashboard') {
            setCurrentView('dashboard');
            setTimeout(() => doScroll(id), 400);
        } else {
            doScroll(id);
        }
    }, [currentView, doScroll]);

    const handleViewProfile = (vendorId: string) => {
        setSelectedVendor(vendorId);
        setCurrentView('profile');
        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={`flex h-screen overflow-hidden bg-white font-sans text-slate-900`}>

            {!hideSidebar && (
                <DashboardSidebar
                    activeSection={activeSection}
                    onNavigate={scrollToSection}
                    data={computedData}
                />
            )}

            <div
                ref={scrollRef}
                className={`flex-1 min-h-0 overflow-y-auto overflow-x-hidden relative z-10 scroll-smooth bg-slate-50/30`}
            >
                {!hideSidebar && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="sticky top-0 z-40"
                    >
                        <DashboardHeader data={computedData} onGenerateDossier={onGenerateDossier} progress={progress} />
                    </motion.div>
                )}

                <main className="max-w-7xl mx-auto w-full px-8 py-20">
                    <AnimatePresence mode="wait">
                        {currentView === 'dashboard' ? (
                            <motion.div
                                key="dashboard"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-40"
                            >
                                <section id="summary-metrics">
                                    <SummaryMetrics data={computedData} />
                                </section>

                                <section id="exposure-profile">
                                    <ExecutiveVerdict data={computedData} />
                                </section>

                                <section id="global-rankings">
                                    <VendorRankings data={computedData} />
                                </section>

                                <section id="functional-performance">
                                    <FunctionalDeepDive data={computedData} />
                                </section>

                                <section id="integrity-profile">
                                    <RiskAssessment data={computedData} />
                                </section>

                                <section id="financial-dynamics">
                                    <FinancialVerdict data={computedData} />
                                </section>

                                <section id="decision-logic">
                                    <RecommendedStack data={computedData} />
                                </section>

                                <section id="implementation-roadmap">
                                    <ActionRoadmap data={computedData} />
                                </section>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.4 }}
                            >
                                <VendorProfilePage
                                    vendorId={selectedVendor}
                                    data={computedData}
                                    onBack={() => {
                                        setCurrentView('dashboard');
                                        scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <footer className="pt-20 pb-12 border-t border-slate-100 flex flex-col items-center gap-6 mt-40">
                        <img src="/hrtek_logo.png" alt="HRTek" className="h-8 opacity-20 brightness-0" />
                        <div className="text-center">
                            <p className="text-sm font-black text-slate-300 uppercase tracking-widest mb-1">
                                HR TEK SYSTEMS © 2026
                            </p>
                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                                Strategic Assessment Analysis Report
                            </p>
                        </div>
                    </footer>
                </main>
            </div>
        </div>
    );
}
