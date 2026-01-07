import React, { FC, useState } from "react";
import { AlertTriangle, Shield, Eye, TrendingUp, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- Props Interface ---
interface RiskAssessmentProps {
    transformationRisks: Array<{
        impact: string;
        mitigation_strategy: string;
        probability: string;
        risk_category: string;
        risk_description: string;
    }>;
}

// --- Helper Functions ---
const getRiskCategoryStyle = (category: string): { icon: string; color: string; bg: string; text: string } => {
    switch (category.toLowerCase()) {
        case 'operational': return { icon: '🚧', color: 'border-orange-500/50', bg: 'bg-orange-500/10', text: 'text-orange-400' };
        case 'cultural': return { icon: '🎭', color: 'border-purple-500/50', bg: 'bg-purple-500/10', text: 'text-purple-400' };
        case 'technical': return { icon: '🖥️', color: 'border-blue-500/50', bg: 'bg-blue-500/10', text: 'text-blue-400' };
        case 'financial': return { icon: '💰', color: 'border-emerald-500/50', bg: 'bg-emerald-500/10', text: 'text-emerald-400' };
        case 'regulatory': return { icon: '⚖️', color: 'border-red-500/50', bg: 'bg-red-500/10', text: 'text-red-400' };
        default: return { icon: '⚠️', color: 'border-slate-500/50', bg: 'bg-slate-500/10', text: 'text-slate-400' };
    }
};

const getSeverityStyle = (probability: string, impact: string): { color: string; label: string; priority: number } => {
    const probScore = probability.toLowerCase() === 'high' ? 3 : probability.toLowerCase() === 'medium' ? 2 : 1;
    const impactScore = impact.toLowerCase() === 'high' ? 3 : impact.toLowerCase() === 'medium' ? 2 : 1;
    const totalScore = probScore + impactScore;

    if (totalScore >= 5) return { color: 'text-red-400 bg-red-500/20 border-red-500/50', label: 'Critical', priority: 1 };
    if (totalScore >= 4) return { color: 'text-orange-400 bg-orange-500/20 border-orange-500/50', label: 'High', priority: 2 };
    if (totalScore >= 3) return { color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50', label: 'Medium', priority: 3 };
    return { color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50', label: 'Low', priority: 4 };
};

const getBadgeStyle = (level: string): string => {
    switch (level.toLowerCase()) {
        case 'high': return 'bg-red-500/10 text-red-400 border-red-500/30';
        case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
        case 'low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        default: return 'bg-slate-500/10 text-slate-400 border-slate-500/30';
    }
};

// --- Sub-components ---

// Enhanced Risk Matrix with Dark Theme
const RiskMatrix: FC<{ risks: any[] }> = ({ risks }) => {
    const [hoveredRisk, setHoveredRisk] = useState<any>(null);

    const matrixRisks = risks.map(risk => ({
        ...risk,
        x: risk.probability.toLowerCase() === 'high' ? 3 : risk.probability.toLowerCase() === 'medium' ? 2 : 1,
        y: risk.impact.toLowerCase() === 'high' ? 3 : risk.impact.toLowerCase() === 'medium' ? 2 : 1,
    }));

    return (
        <div className="glass-card p-6 rounded-2xl relative">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-indigo-400" />
                Risk Matrix
            </h3>

            <div className="relative">
                <div className="grid grid-cols-4 gap-0 border border-white/10 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', maxWidth: '400px', margin: '0 auto' }}>
                    {[3, 2, 1].map((impactLevel) => (
                        <React.Fragment key={impactLevel}>
                            <div className="bg-slate-800/50 border-r border-white/10 flex items-center justify-center p-2">
                                <span className="text-xs font-semibold text-slate-400 transform -rotate-90 whitespace-nowrap">
                                    {impactLevel === 3 ? 'High' : impactLevel === 2 ? 'Medium' : 'Low'} Impact
                                </span>
                            </div>
                            {[1, 2, 3].map((probLevel) => {
                                const cellRisks = matrixRisks.filter(r => r.x === probLevel && r.y === impactLevel);
                                const riskLevel = probLevel + impactLevel >= 5 ? 'critical' :
                                    probLevel + impactLevel >= 4 ? 'high' :
                                        probLevel + impactLevel >= 3 ? 'medium' : 'low';

                                const cellBg = riskLevel === 'critical' ? 'bg-red-500/20' :
                                    riskLevel === 'high' ? 'bg-orange-500/20' :
                                        riskLevel === 'medium' ? 'bg-yellow-500/20' : 'bg-emerald-500/20';

                                return (
                                    <div
                                        key={`${probLevel}-${impactLevel}`}
                                        className={`${cellBg} border-r border-b border-white/10 p-2 min-h-[80px] flex flex-wrap items-center justify-center relative`}
                                    >
                                        {cellRisks.map((risk, index) => {
                                            const { icon } = getRiskCategoryStyle(risk.risk_category);
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: index * 0.2, duration: 0.5 }}
                                                    className="w-6 h-6 bg-slate-900 rounded-full border border-white/20 flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform m-0.5 shadow-sm"
                                                    onMouseEnter={() => setHoveredRisk(risk)}
                                                    onMouseLeave={() => setHoveredRisk(null)}
                                                >
                                                    {icon}
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </React.Fragment>
                    ))}
                    <div className="bg-slate-800/50 border-r border-white/10"></div>
                    <div className="bg-slate-800/50 border-r border-white/10 p-2 flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-400">Low Prob</span>
                    </div>
                    <div className="bg-slate-800/50 border-r border-white/10 p-2 flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-400">Med Prob</span>
                    </div>
                    <div className="bg-slate-800/50 p-2 flex items-center justify-center">
                        <span className="text-xs font-semibold text-slate-400">High Prob</span>
                    </div>
                </div>

                <AnimatePresence>
                    {hoveredRisk && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-slate-800 text-slate-200 border border-white/10 p-4 rounded-xl shadow-xl z-20 w-64 backdrop-blur-xl"
                        >
                            <h4 className="font-bold text-white text-sm mb-1">{hoveredRisk.risk_category}</h4>
                            <p className="text-xs mb-2 text-slate-400 leading-relaxed">{hoveredRisk.risk_description}</p>
                            <div className="flex gap-2 text-xs">
                                <span className={`px-2 py-0.5 rounded border ${getBadgeStyle(hoveredRisk.probability)}`}>{hoveredRisk.probability} P</span>
                                <span className={`px-2 py-0.5 rounded border ${getBadgeStyle(hoveredRisk.impact)}`}>{hoveredRisk.impact} I</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const RiskTableRow: FC<{ risk: any; index: number }> = ({ risk, index }) => {
    const [expanded, setExpanded] = useState(false);
    const { icon, color, bg, text } = getRiskCategoryStyle(risk.risk_category);
    const { color: severityColor, label: severityLabel } = getSeverityStyle(risk.probability, risk.impact);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="border border-white/10 rounded-xl overflow-hidden glass-card"
        >
            <div
                className="p-4 bg-transparent hover:bg-white/5 cursor-pointer transition-colors duration-200"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg ${bg} ${color} border flex items-center justify-center text-lg`}>
                            {icon}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-semibold ${text}`}>{risk.risk_category}</h4>
                            <p className="text-sm text-slate-400 line-clamp-2">{risk.risk_description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 md:space-x-3">
                        <span className={`hidden md:inline-block px-2 py-1 rounded-full text-xs font-medium border ${getBadgeStyle(risk.probability)}`}>{risk.probability}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold border ${severityColor}`}>
                            {severityLabel}
                        </span>
                        {expanded ? <ChevronUp size={20} className="text-slate-500" /> : <ChevronDown size={20} className="text-slate-500" />}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-900/50 border-t border-white/5"
                    >
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="font-semibold text-slate-300 mb-3 flex items-center text-sm">
                                        <AlertTriangle size={14} className="mr-2 text-rose-400" /> Description
                                    </h5>
                                    <p className="text-sm text-slate-400 leading-relaxed">{risk.risk_description}</p>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-slate-300 mb-3 flex items-center text-sm">
                                        <Shield size={14} className="mr-2 text-emerald-400" /> Mitigation
                                    </h5>
                                    <p className="text-sm text-slate-400 leading-relaxed">{risk.mitigation_strategy}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const PriorityRisks: FC<{ risks: any[] }> = ({ risks }) => {
    const priorityRisks = risks
        .map(risk => ({ ...risk, ...getSeverityStyle(risk.probability, risk.impact) }))
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3);

    return (
        <div className="glass-card p-6 rounded-2xl border border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-rose-500" />
                Top Priority Risks
            </h3>

            <div className="space-y-4">
                {priorityRisks.map((risk, index) => {
                    const { icon, bg, text } = getRiskCategoryStyle(risk.risk_category);
                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            className="p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-white/20 transition-colors"
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center text-lg flex-shrink-0`}>
                                    {icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className={`font-semibold text-sm ${text}`}>{risk.risk_category}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${risk.color}`}>
                                            {risk.label}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">{risk.risk_description}</p>

                                    <div className="bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                        <h5 className="font-medium text-slate-300 mb-1 flex items-center text-[10px] uppercase tracking-wider">
                                            <Shield size={10} className="mr-1 text-emerald-400" /> Mitigation
                                        </h5>
                                        <p className="text-xs text-slate-500">{risk.mitigation_strategy}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export const RiskAssessment: FC<RiskAssessmentProps> = ({ transformationRisks }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const categories = ['all', ...Array.from(new Set(transformationRisks.map(risk => risk.risk_category)))];

    const filteredRisks = selectedCategory === 'all'
        ? transformationRisks
        : transformationRisks.filter(risk => risk.risk_category === selectedCategory);

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="text-center mb-12">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-white tracking-tight"
                >
                    Risk Assessment & Mitigation
                </motion.h2>
                <motion.div className="h-1 w-20 bg-indigo-500 rounded-full mx-auto mt-4 mb-4"></motion.div>
                <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                    Strategic foresight into potential transformation blockers.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PriorityRisks risks={transformationRisks} />
                <RiskMatrix risks={transformationRisks} />
            </div>

            <div className="glass-card p-6 rounded-2xl border border-white/10 mt-12">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h3 className="text-xl font-bold text-white flex items-center">
                        <TrendingUp className="w-6 h-6 mr-3 text-indigo-400" />
                        Detailed Risk Analysis
                    </h3>

                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        <Filter size={16} className="text-slate-500" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 bg-slate-900 text-slate-200 py-2 border border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-500/50 transition-colors"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'all' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredRisks.map((risk, index) => (
                        <RiskTableRow key={index} risk={risk} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
}