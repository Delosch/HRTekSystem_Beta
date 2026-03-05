import { IndexScore, SectionScore } from '../types/assessment';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface RiskHeatmapProps {
    indices: IndexScore[];
    sectionScores: SectionScore[];
}

const getRiskLevel = (percentage: number) => {
    if (percentage >= 85) return { level: 'Low Risk', color: 'text-green-700', bgColor: 'bg-green-500', icon: <CheckCircle className="w-4 h-4" /> };
    if (percentage >= 70) return { level: 'Moderate Risk', color: 'text-blue-700', bgColor: 'bg-blue-500', icon: <CheckCircle className="w-4 h-4" /> };
    if (percentage >= 50) return { level: 'Elevated Risk', color: 'text-amber-700', bgColor: 'bg-amber-500', icon: <AlertTriangle className="w-4 h-4" /> };
    if (percentage >= 30) return { level: 'High Risk', color: 'text-orange-700', bgColor: 'bg-orange-500', icon: <XCircle className="w-4 h-4" /> };
    return { level: 'Critical Risk', color: 'text-red-700', bgColor: 'bg-red-500', icon: <XCircle className="w-4 h-4" /> };
};

function RiskLegendItem({ color, label, range, description }: { color: string; label: string; range: string; description: string }) {
    return (
        <div className="bg-white rounded-lg p-3 border border-slate-200">
            <div className={`w-full h-2 ${color} rounded-full mb-2`} />
            <div className="font-semibold text-slate-900 text-sm mb-1">{label}</div>
            <div className="text-xs text-slate-600 mb-1">{range}</div>
            <div className="text-xs text-slate-500">{description}</div>
        </div>
    );
}

export function RiskHeatmap({ indices, sectionScores }: RiskHeatmapProps) {
    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Risk Heatmap & Analysis</h2>
                <p className="text-slate-600">Visual representation of risk across all assessment areas</p>
            </div>

            {/* Index-Level Heatmap */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6 text-slate-900">Index Risk Assessment</h3>
                    <div className="space-y-4">
                        {indices.map((index) => {
                            const risk = getRiskLevel(index.percentage);
                            return (
                                <div key={index.name} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className={risk.color}>{risk.icon}</span>
                                            <span className="font-medium text-slate-900">{index.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-sm font-semibold ${risk.color}`}>{risk.level}</span>
                                            <span className="text-sm text-slate-600">{index.percentage.toFixed(0)}%</span>
                                        </div>
                                    </div>
                                    <div className="relative w-full h-8 bg-slate-100 rounded-lg overflow-hidden">
                                        <div className={`absolute left-0 top-0 h-full ${risk.bgColor} transition-all duration-500`} style={{ width: `${index.percentage}%` }} />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-semibold text-slate-700 mix-blend-difference">
                                                {index.score.toFixed(1)} / {index.maxScore}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Section-Level Heatmap Grid */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-6 text-slate-900">Section Risk Matrix</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {sectionScores.map((section) => {
                            const risk = getRiskLevel(section.percentage);
                            return (
                                <div key={section.sectionId} className={`p-4 rounded-lg border-2 ${section.status === 'green' ? 'border-green-200 bg-green-50' :
                                        section.status === 'amber' ? 'border-amber-200 bg-amber-50' :
                                            'border-red-200 bg-red-50'
                                    }`}>
                                    <div className="flex items-start justify-between mb-2">
                                        <span className={`text-xs font-semibold ${risk.color}`}>{section.sectionId.toUpperCase()}</span>
                                        {risk.icon}
                                    </div>
                                    <div className="text-2xl font-bold text-slate-900 mb-1">{section.percentage.toFixed(0)}%</div>
                                    <div className={`text-xs font-medium ${risk.color}`}>{risk.level}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Risk Legend */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl shadow-sm">
                <div className="p-6">
                    <h3 className="text-lg font-semibold mb-4 text-slate-900">Risk Level Guide</h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                        <RiskLegendItem color="bg-green-500" label="Low Risk" range="85-100%" description="Transformation-ready" />
                        <RiskLegendItem color="bg-blue-500" label="Moderate Risk" range="70-84%" description="Structured approach" />
                        <RiskLegendItem color="bg-amber-500" label="Elevated Risk" range="50-69%" description="Needs attention" />
                        <RiskLegendItem color="bg-orange-500" label="High Risk" range="30-49%" description="Significant gaps" />
                        <RiskLegendItem color="bg-red-500" label="Critical Risk" range="0-29%" description="Immediate action" />
                    </div>
                </div>
            </div>

            {/* Priority Risk Areas */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl">
                <div className="p-6">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-red-900 mb-3">Priority Risk Areas</h3>
                            <div className="space-y-2">
                                {indices.filter(index => index.percentage < 70).sort((a, b) => a.percentage - b.percentage).map(index => (
                                    <div key={index.name} className="bg-white rounded-lg p-3 border border-red-200">
                                        <div className="font-semibold text-red-900 mb-1">{index.name}</div>
                                        <p className="text-sm text-red-700">
                                            Current score: {index.percentage.toFixed(0)}% — Requires strategic intervention and focused improvement plan
                                        </p>
                                    </div>
                                ))}
                                {indices.every(index => index.percentage >= 70) && (
                                    <div className="text-green-700 font-medium">
                                        ✓ All indices are performing within acceptable ranges
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
