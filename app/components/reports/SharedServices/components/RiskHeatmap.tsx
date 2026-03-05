import React from 'react';
import { Card } from '~/components/ui/card';

interface RiskItem {
    name: string;
    probability: number; // 1-3
    impact: number; // 1-3
}

interface RiskHeatmapProps {
    risks: RiskItem[];
}

export function RiskHeatmap({ risks }: RiskHeatmapProps) {
    const getZoneColor = (prob: number, impact: number) => {
        const score = prob * impact;
        if (score >= 6) return 'bg-red-100 border-red-300';
        if (score >= 3) return 'bg-amber-100 border-amber-300';
        return 'bg-green-100 border-green-300';
    };

    const getZoneLabel = (prob: number, impact: number) => {
        const score = prob * impact;
        if (score >= 6) return 'Critical';
        if (score >= 3) return 'Monitor';
        return 'Safe';
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-4 gap-2">
                {/* Header row */}
                <div></div>
                <div className="text-center text-xs font-bold text-gray-600 uppercase">Low Impact</div>
                <div className="text-center text-xs font-bold text-gray-600 uppercase">Medium Impact</div>
                <div className="text-center text-xs font-bold text-gray-600 uppercase">High Impact</div>

                {/* High Probability Row */}
                <div className="flex items-center justify-end pr-2 text-xs font-bold text-gray-600 uppercase text-right">
                    High<br />Prob
                </div>
                {[1, 2, 3].map((impact) => (
                    <div
                        key={`3-${impact}`}
                        className={`relative aspect-square border-2 rounded-lg ${getZoneColor(3, impact)} flex items-center justify-center group`}
                    >
                        <span className="text-xs font-medium text-gray-500 opacity-50">{getZoneLabel(3, impact)}</span>
                        {risks
                            .filter((r) => r.probability === 3 && r.impact === impact)
                            .map((risk, idx) => (
                                <div
                                    key={idx}
                                    className="absolute w-4 h-4 bg-gray-900 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform"
                                    style={{
                                        left: `${30 + idx * 20}%`,
                                        top: `${40 + idx * 10}%`,
                                    }}
                                    title={`${risk.name} (Critical)`}
                                />
                            ))}
                    </div>
                ))}

                {/* Medium Probability Row */}
                <div className="flex items-center justify-end pr-2 text-xs font-bold text-gray-600 uppercase text-right">
                    Med<br />Prob
                </div>
                {[1, 2, 3].map((impact) => (
                    <div
                        key={`2-${impact}`}
                        className={`relative aspect-square border-2 rounded-lg ${getZoneColor(2, impact)} flex items-center justify-center`}
                    >
                        <span className="text-xs font-medium text-gray-500 opacity-50">{getZoneLabel(2, impact)}</span>
                        {risks
                            .filter((r) => r.probability === 2 && r.impact === impact)
                            .map((risk, idx) => (
                                <div
                                    key={idx}
                                    className="absolute w-4 h-4 bg-gray-900 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform"
                                    style={{
                                        left: `${30 + idx * 20}%`,
                                        top: `${40 + idx * 10}%`,
                                    }}
                                    title={`${risk.name} (Monitor)`}
                                />
                            ))}
                    </div>
                ))}

                {/* Low Probability Row */}
                <div className="flex items-center justify-end pr-2 text-xs font-bold text-gray-600 uppercase text-right">
                    Low<br />Prob
                </div>
                {[1, 2, 3].map((impact) => (
                    <div
                        key={`1-${impact}`}
                        className={`relative aspect-square border-2 rounded-lg ${getZoneColor(1, impact)} flex items-center justify-center`}
                    >
                        <span className="text-xs font-medium text-gray-500 opacity-50">{getZoneLabel(1, impact)}</span>
                        {risks
                            .filter((r) => r.probability === 1 && r.impact === impact)
                            .map((risk, idx) => (
                                <div
                                    key={idx}
                                    className="absolute w-4 h-4 bg-gray-900 rounded-full border-2 border-white shadow-md cursor-pointer hover:scale-125 transition-transform"
                                    style={{
                                        left: `${30 + idx * 20}%`,
                                        top: `${40 + idx * 10}%`,
                                    }}
                                    title={`${risk.name} (Safe)`}
                                />
                            ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-200">
                {risks.map((risk, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-900 rounded-full" />
                        <span className="text-sm text-gray-600">{risk.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
