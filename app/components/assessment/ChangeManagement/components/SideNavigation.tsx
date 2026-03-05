import { useState, useEffect } from 'react';
import { Menu, X, Circle, CheckCircle, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SideNavigationProps {
    currentSection: string;
    onNavigate: (sectionId: string) => void;
    sectionStatuses: { [key: string]: 'green' | 'amber' | 'red' | 'incomplete' };
    completionPercentage: number;
}

const navItems = [
    { id: 'executive-summary', label: 'Executive Summary', icon: '📊' },
    { id: 'indices', label: '5 Core Intelligence Indices', icon: '📈' },
    { id: 'section-1', label: 'Strategic & Business Readiness', icon: '🎯', section: true },
    { id: 'section-2', label: 'Executive Sponsorship', icon: '👔', section: true },
    { id: 'section-3', label: 'Change Capacity', icon: '🔄', section: true },
    { id: 'section-4', label: 'HR Tech Readiness', icon: '💻', section: true },
    { id: 'section-5', label: 'Digital Fluency', icon: '🚀', section: true },
    { id: 'section-6', label: 'Stakeholder Mapping', icon: '👥', section: true },
    { id: 'section-7', label: 'Communication', icon: '💬', section: true },
    { id: 'section-8', label: 'Learning & Adoption', icon: '📚', section: true },
    { id: 'section-9', label: 'Governance', icon: '⚖️', section: true },
    { id: 'section-10', label: 'Measurement', icon: '📏', section: true },
    { id: 'section-11', label: 'Sustainability', icon: '♻️', section: true },
    { id: 'section-12', label: 'Stress Test', icon: '🔬', section: true },
    { id: 'risk-heatmap', label: 'Risk Heatmap & Analysis', icon: '🔥' },
    { id: 'benchmark-comparison', label: 'Industry Benchmarks', icon: '📊' },
];

export function SideNavigation({ currentSection, onNavigate, sectionStatuses, completionPercentage }: SideNavigationProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) setIsOpen(false);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const getStatusDot = (itemId: string) => {
        const status = sectionStatuses[itemId];
        if (!status || status === 'incomplete') return <Circle className="w-3 h-3 text-slate-300" />;
        const colors = { green: 'text-green-500', amber: 'text-amber-500', red: 'text-red-500' };
        return <CheckCircle className={`w-3 h-3 ${colors[status]}`} />;
    };

    return (
        <>
            {/* Mobile Toggle */}
            {isMobile && (
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg border border-slate-200 lg:hidden"
                >
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            )}

            {/* Mobile overlay */}
            <AnimatePresence>
                {isMobile && isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/20 z-30 lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <AnimatePresence>
                {(isOpen || !isMobile) && (
                    <motion.aside
                        initial={isMobile ? { x: -300 } : false}
                        animate={{ x: 0 }}
                        exit={isMobile ? { x: -300 } : {}}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 left-0 h-screen bg-white border-r border-slate-200 shadow-xl z-40 w-80 overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <img src="/hrtek_logo.png" alt="HRTek" className="h-8 w-auto object-contain" />
                                        <h2 className="text-lg font-bold text-slate-900">HR-Tek GCIA</h2>
                                    </div>
                                    {!isMobile && (
                                        <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-100 rounded">
                                            <X className="w-4 h-4 text-slate-500" />
                                        </button>
                                    )}
                                </div>

                                {/* Progress Tracker */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-blue-900">Overall Progress</span>
                                        <span className="text-sm font-bold text-blue-600">{completionPercentage.toFixed(0)}%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-blue-600 h-full rounded-full transition-all duration-500"
                                            style={{ width: `${completionPercentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-blue-700 mt-2">
                                        {completionPercentage === 100
                                            ? '✓ Assessment Complete'
                                            : `${(100 - completionPercentage).toFixed(0)}% remaining`}
                                    </p>
                                </div>
                            </div>

                            {/* Navigation Items */}
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const isActive = currentSection === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => { onNavigate(item.id); if (isMobile) setIsOpen(false); }}
                                            className={`
                                                w-full text-left px-3 py-2.5 rounded-lg transition-all
                                                flex items-center gap-3 group
                                                ${isActive
                                                    ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-900 font-semibold'
                                                    : 'hover:bg-slate-50 text-slate-700 border-l-4 border-transparent'}
                                            `}
                                        >
                                            <span className="text-lg flex-shrink-0">{item.icon}</span>
                                            <span className="flex-1 text-sm">{item.label}</span>
                                            <div className="flex items-center gap-2">
                                                {item.section && getStatusDot(item.id)}
                                                {isActive && <ChevronRight className="w-4 h-4 text-blue-600" />}
                                            </div>
                                        </button>
                                    );
                                })}
                            </nav>

                            {/* Status Legend */}
                            <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                <h3 className="text-xs font-semibold text-slate-700 mb-3">Status Legend</h3>
                                <div className="space-y-2 text-xs">
                                    {[
                                        { icon: <CheckCircle className="w-3 h-3 text-green-500" />, label: 'Strong (70%+)' },
                                        { icon: <CheckCircle className="w-3 h-3 text-amber-500" />, label: 'Monitor (50-69%)' },
                                        { icon: <CheckCircle className="w-3 h-3 text-red-500" />, label: 'Risk (<50%)' },
                                        { icon: <Circle className="w-3 h-3 text-slate-300" />, label: 'Not Started' },
                                    ].map(s => (
                                        <div key={s.label} className="flex items-center gap-2">
                                            {s.icon}
                                            <span className="text-slate-600">{s.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Collapsed toggle (Desktop) */}
            {!isOpen && !isMobile && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed top-4 left-4 z-40 p-2 bg-white rounded-lg shadow-lg border border-slate-200"
                >
                    <Menu className="w-5 h-5" />
                </button>
            )}
        </>
    );
}
