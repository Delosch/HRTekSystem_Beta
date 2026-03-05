import React, { useState, useEffect } from 'react';
import {
    CheckCircle2, Circle, ChevronRight, Brain, Activity,
    Target, Users, Layers, Shield, Globe, BarChart3, Menu, X, Flame
} from 'lucide-react';

interface CMSideNavigationProps {
    currentSection: string;
    onNavigate: (sectionId: string) => void;
    completionPercentage: number;
    compositeScore: number;
    sectionStatuses: { [key: string]: 'green' | 'amber' | 'red' | 'incomplete' };
}

const navItems = [
    { id: 'executive-summary', label: 'Executive Summary', icon: Brain },
    { id: 'indices', label: '5 Intelligence Indices', icon: Activity },
    { id: 'section-1', label: 'Strategic Readiness', icon: Target, section: true },
    { id: 'section-2', label: 'Executive Sponsorship', icon: Users, section: true },
    { id: 'section-3', label: 'Change Capacity', icon: Layers, section: true },
    { id: 'section-4', label: 'HR Tech Readiness', icon: Shield, section: true },
    { id: 'section-5', label: 'Digital Fluency', icon: Globe, section: true },
    { id: 'section-6', label: 'Stakeholder Mapping', icon: Users, section: true },
    { id: 'section-7', label: 'Communication', icon: Activity, section: true },
    { id: 'section-8', label: 'Learning & Adoption', icon: Brain, section: true },
    { id: 'section-9', label: 'Governance', icon: BarChart3, section: true },
    { id: 'section-10', label: 'Measurement', icon: BarChart3, section: true },
    { id: 'section-11', label: 'Sustainability', icon: Globe, section: true },
    { id: 'section-12', label: 'Stress Test', icon: Target, section: true },
    { id: 'risk-heatmap', label: 'Risk Heatmap', icon: Flame },
    { id: 'benchmark-comparison', label: 'Industry Benchmarks', icon: BarChart3 },
];

const statusIconMap = {
    green: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
    amber: <CheckCircle2 className="w-4 h-4 text-amber-500" />,
    red: <CheckCircle2 className="w-4 h-4 text-red-500" />,
    incomplete: <Circle className="w-4 h-4 text-slate-300" />,
};

export function CMSideNavigation({
    currentSection,
    onNavigate,
    completionPercentage,
    compositeScore,
    sectionStatuses,
}: CMSideNavigationProps) {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const check = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (!mobile) setIsMobileOpen(false);
        };
        check();
        window.addEventListener('resize', check);
        return () => window.removeEventListener('resize', check);
    }, []);

    const handleNav = (id: string) => {
        onNavigate(id);
        setIsMobileOpen(false);
    };

    const SidebarContent = () => (
        <div className="h-full flex flex-col bg-white text-slate-900 border-r border-slate-200 shadow-sm">
            {/* Header */}
            <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                    <img src="/hrtek_logo.png" alt="HRTek Logo" className="w-8 h-8 object-contain" />
                    <div className="h-6 w-[1.5px] bg-slate-200 mx-1" />
                    <div>
                        <h2 className="font-bold text-lg tracking-tight text-slate-900 leading-none">HRTek</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Assessment</p>
                    </div>
                </div>

                {/* Progress Widget */}
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm text-slate-500 font-medium">Completion</span>
                        <span className="text-xl font-bold text-indigo-600">{Math.round(completionPercentage)}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                            style={{ width: `${completionPercentage}%` }}
                        />
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs text-slate-500">Readiness Score</span>
                        <span className="text-xs font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
                            {compositeScore > 0 ? `${compositeScore.toFixed(1)}` : '—'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
                <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Assessment Sections
                </div>
                <nav className="space-y-0.5 px-2">
                    {navItems.map((item) => {
                        const isActive = currentSection === item.id;
                        const status = sectionStatuses[item.id] || 'incomplete';
                        const Icon = item.icon;

                        return (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleNav(item.id)}
                                className={`
                                    w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all group cursor-pointer pointer-events-auto relative z-10
                                    ${isActive
                                        ? 'bg-indigo-50 text-indigo-900 font-semibold border-l-4 border-indigo-600'
                                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-l-4 border-transparent'}
                                `}
                            >
                                <div className="flex items-center gap-3">
                                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                                    <span className="text-left text-xs leading-snug">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-shrink-0">
                                    {item.section && statusIconMap[status]}
                                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-600" />}
                                </div>
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Status Legend */}
            <div className="p-4 border-t border-slate-100">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                    <h3 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Status Legend</h3>
                    <div className="space-y-1.5 text-xs">
                        {[
                            { icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />, label: 'Strong (70%+)' },
                            { icon: <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />, label: 'Monitor (50–69%)' },
                            { icon: <CheckCircle2 className="w-3.5 h-3.5 text-red-500" />, label: 'Risk (<50%)' },
                            { icon: <Circle className="w-3.5 h-3.5 text-slate-300" />, label: 'Not Started' },
                        ].map((s) => (
                            <div key={s.label} className="flex items-center gap-2">
                                {s.icon}
                                <span className="text-slate-600">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle button */}
            {isMobile && (
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="fixed top-4 left-4 z-[60] p-2 bg-white rounded-lg shadow-lg border border-slate-200 lg:hidden"
                >
                    {isMobileOpen ? <X className="w-5 h-5 text-slate-700" /> : <Menu className="w-5 h-5 text-slate-700" />}
                </button>
            )}

            {/* Mobile overlay */}
            {isMobile && isMobileOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Desktop: always visible */}
            <div className="hidden lg:block w-80 h-screen flex-shrink-0">
                <SidebarContent />
            </div>

            {/* Mobile: slide in */}
            {isMobile && (
                <div className={`
                    fixed top-0 left-0 h-screen w-80 z-50 transform transition-transform duration-300 ease-in-out lg:hidden
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                `}>
                    <SidebarContent />
                </div>
            )}
        </>
    );
}
