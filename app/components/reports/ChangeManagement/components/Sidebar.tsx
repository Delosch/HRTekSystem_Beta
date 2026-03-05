import {
    Activity, Trophy, PieChart, ShieldCheck,
    TrendingUp, RefreshCw, Brain, Layout,
    Globe, Zap, Target, Flag, ChevronRight, MessageSquare, Layers, ShieldAlert, ArrowLeft
} from 'lucide-react';
import { motion } from 'framer-motion';

interface SidebarProps {
    activeSection: string;
    onNavigate: (sectionId: string) => void;
    data?: any;
    navItems?: Array<{ id: string; label: string; icon: any }>;
}

const navItems = [
    { id: 'summary', label: 'Overview', icon: Layout },
    { id: 'impact', label: '01. Impact Architecture', icon: Layers },
    { id: 'alignment', label: '02. Leadership Sync', icon: Trophy },
    { id: 'comms', label: '03. Communication Dynamics', icon: MessageSquare },
    { id: 'risk', label: '04. Risk Perimeter Analysis', icon: ShieldAlert },
    { id: 'readiness', label: '05. Readiness Index', icon: Activity },
    { id: 'roadmap', label: 'Implementation Roadmap', icon: Flag },
];

export function Sidebar({ activeSection, onNavigate, navItems: customNavItems }: SidebarProps) {
    const items = customNavItems || navItems;
    return (
        <aside className="w-64 flex-shrink-0 h-screen sticky top-0 bg-white border-r border-slate-100 z-[100] flex flex-col shadow-2xl shadow-slate-900/5">
            {/* Branding Section */}
            <div className="pt-10 pb-8 px-8 flex flex-col gap-8">
                <button
                    onClick={() => window.history.back()}
                    className="flex items-center gap-3 text-slate-400 hover:text-indigo-600 transition-all group w-fit"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Dashboard</span>
                </button>

                <div className="flex items-center gap-4 group cursor-default">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-600/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img src="/hrtek_logo.png" alt="HRTek" className="h-7 w-auto relative z-10" />
                    </div>
                    <div className="h-6 w-[1px] bg-slate-200" />
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 tracking-tighter uppercase leading-none italic">Change</span>
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1 antialiased">Intelligence</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 px-4 py-8 space-y-2 overflow-y-auto no-scrollbar">
                {items.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id)}
                            className={`
                                w-full group flex items-center gap-4 px-5 py-4 rounded-[24px] transition-all duration-500 relative overflow-hidden
                                ${isActive
                                    ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1 scale-[1.02]'
                                    : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'}
                            `}
                        >
                            {isActive && (
                                <motion.div 
                                    layoutId="nav-bg-cm"
                                    className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 to-transparent pointer-events-none" 
                                />
                            )}
                            <item.icon className={`w-5 h-5 relative z-10 transition-transform duration-500 group-hover:scale-110 ${isActive ? 'text-indigo-400' : 'text-slate-300 group-hover:text-indigo-600'}`} />
                            <span className={`text-[11px] font-black uppercase tracking-[0.15em] text-left flex-1 relative z-10 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-900'}`}>
                                {item.label}
                            </span>
                            {isActive && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.8)]"
                                />
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Premium Status Footer */}
            <div className="p-10 border-t border-slate-100 bg-white">
                <div className="flex items-center gap-3 group cursor-default">
                    <div className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-900 transition-colors">Audit Active</span>
                </div>
                <div className="mt-4 flex flex-col gap-1">
                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.3em]">ENGINE v4.2.0-CM</p>
                    <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.1em] opacity-60">Confidential Session</p>
                </div>
            </div>
        </aside>
    );
}
