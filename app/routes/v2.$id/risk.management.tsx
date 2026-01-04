import React,{ FC, useState } from "react";
import { AlertTriangle, Shield, Eye, TrendingUp, Filter, ChevronDown, ChevronUp} from "lucide-react";
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

// Get risk category icon and color
const getRiskCategoryStyle = (category: string): { icon: string; color: string; bg: string; text: string } => {
    switch (category.toLowerCase()) {
        case 'operational':
            return { icon: '🚧', color: 'border-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' };
        case 'cultural':
            return { icon: '🎭', color: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' };
        case 'technical':
            return { icon: '🖥️', color: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' };
        case 'financial':
            return { icon: '💰', color: 'border-green-500', bg: 'bg-green-50', text: 'text-green-700' };
        case 'regulatory':
            return { icon: '⚖️', color: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700' };
        default:
            return { icon: '⚠️', color: 'border-gray-500', bg: 'bg-gray-50', text: 'text-gray-700' };
    }
};

// Get severity styling based on probability and impact
const getSeverityStyle = (probability: string, impact: string): { color: string; label: string; priority: number } => {
    const probScore = probability.toLowerCase() === 'high' ? 3 : probability.toLowerCase() === 'medium' ? 2 : 1;
    const impactScore = impact.toLowerCase() === 'high' ? 3 : impact.toLowerCase() === 'medium' ? 2 : 1;
    const totalScore = probScore + impactScore;

    if (totalScore >= 5) return { color: 'text-red-600 bg-red-100', label: 'Critical', priority: 1 };
    if (totalScore >= 4) return { color: 'text-orange-600 bg-orange-100', label: 'High', priority: 2 };
    if (totalScore >= 3) return { color: 'text-yellow-600 bg-yellow-100', label: 'Medium', priority: 3 };
    return { color: 'text-green-600 bg-green-100', label: 'Low', priority: 4 };
};

// Get badge styling for probability and impact
const getBadgeStyle = (level: string): string => {
    switch (level.toLowerCase()) {
        case 'high': return 'bg-red-100 text-red-800 border-red-200';
        case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'low': return 'bg-green-100 text-green-800 border-green-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// --- Sub-components ---

// Enhanced Risk Matrix Visualization
const RiskMatrix: FC<{ risks: any[] }> = ({ risks }) => {
    const [hoveredRisk, setHoveredRisk] = useState<any>(null);
    
    const matrixRisks = risks.map(risk => ({
        ...risk,
        x: risk.probability.toLowerCase() === 'high' ? 3 : risk.probability.toLowerCase() === 'medium' ? 2 : 1,
        y: risk.impact.toLowerCase() === 'high' ? 3 : risk.impact.toLowerCase() === 'medium' ? 2 : 1,
    }));

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <Eye className="w-6 h-6 mr-3 text-blue-600" />
                Risk Matrix
            </h3>
            
            <div className="relative">
                <div className="grid grid-cols-4 gap-0 border border-gray-300 rounded-lg overflow-hidden" style={{ aspectRatio: '1/1', maxWidth: '400px', margin: '0 auto' }}>
                    {/* Matrix cells with proper labels */}
                    {[3, 2, 1].map((impactLevel) => (
                        <React.Fragment key={impactLevel}>
                            {/* Impact label column */}
                            <div className="bg-gray-100 border-r border-gray-300 flex items-center justify-center p-2">
                                <span className="text-xs font-semibold text-gray-600 transform -rotate-90">
                                    {impactLevel === 3 ? 'High' : impactLevel === 2 ? 'Medium' : 'Low'} Impact
                                </span>
                            </div>
                            {/* Risk cells */}
                            {[1, 2, 3].map((probLevel) => {
                                const cellRisks = matrixRisks.filter(r => r.x === probLevel && r.y === impactLevel);
                                const riskLevel = probLevel + impactLevel >= 5 ? 'critical' : 
                                                probLevel + impactLevel >= 4 ? 'high' : 
                                                probLevel + impactLevel >= 3 ? 'medium' : 'low';
                                
                                const cellBg = riskLevel === 'critical' ? 'bg-red-100' :
                                             riskLevel === 'high' ? 'bg-orange-100' :
                                             riskLevel === 'medium' ? 'bg-yellow-100' : 'bg-green-100';

                                return (
                                    <div 
                                        key={`${probLevel}-${impactLevel}`} 
                                        className={`${cellBg} border-r border-b border-gray-300 p-2 min-h-[80px] flex flex-wrap items-center justify-center relative`}
                                    >
                                        {cellRisks.map((risk, index) => {
                                            const { icon } = getRiskCategoryStyle(risk.risk_category);
                                            return (
                                                <motion.div
                                                    key={index}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: index * 0.2, duration: 0.5 }}
                                                    className="w-6 h-6 bg-white rounded-full border-2 border-gray-400 flex items-center justify-center text-xs cursor-pointer hover:scale-110 transition-transform m-0.5"
                                                    onMouseEnter={() => setHoveredRisk(risk)}
                                                    onMouseLeave={() => setHoveredRisk(null)}
                                                    title={risk.risk_category}
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
                    {/* Probability labels row */}
                    <div className="bg-gray-100 border-r border-gray-300"></div>
                    <div className="bg-gray-100 border-r border-gray-300 p-2 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">Low Prob</span>
                    </div>
                    <div className="bg-gray-100 border-r border-gray-300 p-2 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">Medium Prob</span>
                    </div>
                    <div className="bg-gray-100 p-2 flex items-center justify-center">
                        <span className="text-xs font-semibold text-gray-600">High Prob</span>
                    </div>
                </div>

                {/* Tooltip for hovered risk */}
                <AnimatePresence>
                    {hoveredRisk && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full left-1/4 transform -translate-x-1/2 mt-2 bg-gray-800 text-white p-3 rounded-lg shadow-lg z-10 max-w-xs"
                        >
                            <h4 className="font-semibold text-sm mb-1">{hoveredRisk.risk_category}</h4>
                            <p className="text-xs mb-2">{hoveredRisk.risk_description}</p>
                            <div className="flex gap-2 text-xs">
                                <span className="bg-gray-600 px-2 py-1 rounded">
                                    {hoveredRisk.probability} Prob
                                </span>
                                <span className="bg-gray-600 px-2 py-1 rounded">
                                    {hoveredRisk.impact} Impact
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-red-100 border border-gray-300 rounded"></div>
                        <span className="text-black">Critical</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-orange-100 border border-gray-300 rounded"></div>
                        <span className="text-black">High</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-yellow-100 border border-gray-300 rounded"></div>
                        <span className="text-black">Medium</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-4 h-4 bg-green-100 border border-gray-300 rounded"></div>
                        <span className="text-black">Low</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Enhanced Expandable Risk Row
const RiskTableRow: FC<{ risk: any; index: number }> = ({ risk, index }) => {
    const [expanded, setExpanded] = useState(false);
    const { icon, color, bg, text } = getRiskCategoryStyle(risk.risk_category);
    const { color: severityColor, label: severityLabel } = getSeverityStyle(risk.probability, risk.impact);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="border border-gray-200 rounded-lg overflow-hidden"
        >
            <div 
                className="p-4 bg-white hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                        <div className={`w-12 h-12 rounded-lg ${bg} ${color} border-2 flex items-center justify-center text-lg`}>
                            {icon}
                        </div>
                        <div className="flex-1">
                            <h4 className={`font-semibold ${text}`}>{risk.risk_category}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">{risk.risk_description}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeStyle(risk.probability)}`}>
                            {risk.probability}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeStyle(risk.impact)}`}>
                            {risk.impact}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${severityColor}`}>
                            {severityLabel}
                        </span>
                        {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </div>
                </div>
            </div>
            
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 border-t border-gray-200"
                    >
                        <div className="p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <AlertTriangle size={16} className="mr-2 text-red-500" />
                                        Risk Description
                                    </h5>
                                    <p className="text-sm text-gray-700 leading-relaxed">{risk.risk_description}</p>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                                        <Shield size={16} className="mr-2 text-green-500" />
                                        Mitigation Strategy
                                    </h5>
                                    <p className="text-sm text-gray-700 leading-relaxed">{risk.mitigation_strategy}</p>
                                </div>
                            </div>
                            
                            {/* Additional risk details */}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                                <div className="flex flex-wrap gap-4 text-sm">
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-600 mr-2">Probability:</span>
                                        <span className={`px-2 py-1 rounded text-xs ${getBadgeStyle(risk.probability)}`}>
                                            {risk.probability}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-600 mr-2">Impact:</span>
                                        <span className={`px-2 py-1 rounded text-xs ${getBadgeStyle(risk.impact)}`}>
                                            {risk.impact}
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-600 mr-2">Overall Risk:</span>
                                        <span className={`px-2 py-1 rounded text-xs ${severityColor}`}>
                                            {severityLabel}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

// Enhanced Priority Risks Summary
const PriorityRisks: FC<{ risks: any[] }> = ({ risks }) => {
    const priorityRisks = risks
        .map(risk => ({ ...risk, ...getSeverityStyle(risk.probability, risk.impact) }))
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 3);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-3 text-red-600" />
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
                            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center text-lg flex-shrink-0`}>
                                    {icon}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className={`font-semibold ${text}`}>{risk.risk_category}</h4>
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${risk.color}`}>
                                            {risk.label}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-3">{risk.risk_description}</p>
                                    
                                    <div className="bg-white p-3 rounded border border-gray-200">
                                        <h5 className="font-medium text-gray-800 mb-1 flex items-center text-xs">
                                            <Shield size={12} className="mr-1 text-green-500" />
                                            Mitigation Strategy
                                        </h5>
                                        <p className="text-xs text-gray-600">{risk.mitigation_strategy}</p>
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

// --- Main Risk Assessment Component ---
export const RiskAssessment: FC<RiskAssessmentProps> = ({ transformationRisks }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    
    const categories = ['all', ...Array.from(new Set(transformationRisks.map(risk => risk.risk_category)))];
    
    const filteredRisks = selectedCategory === 'all' 
        ? transformationRisks 
        : transformationRisks.filter(risk => risk.risk_category === selectedCategory);

    if (!transformationRisks.length) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No risk assessment data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
            <div className="text-center">
                <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-gray-800 tracking-tight"
                >
                    Risk Assessment
                </motion.h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-2 text-lg text-gray-600 max-w-2xl mx-auto"
                >
                    Identify and mitigate potential risks in your digital transformation journey.
                </motion.p>
            </div>

            {/* Risk Overview Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <PriorityRisks risks={transformationRisks} />
                <RiskMatrix risks={transformationRisks} />
            </div>

            {/* Risk Table with Filters */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-800 flex items-center">
                        <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                        Detailed Risk Analysis
                    </h3>
                    
                    <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                        <Filter size={16} className="text-gray-500" />
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-3 bg-white text-gray-600 py-2 border border-gray-400 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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