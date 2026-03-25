import React from 'react';
import { CheckCircle2, Circle, HelpCircle } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "~/components/ui/tooltip"

interface ScoreCell {
    score: number;
    maxScore: number;
}

const scoringData = [
    {
        criteria: 'Cost Efficiency',
        weight: '35%',
        centralized: { score: 9, maxScore: 10 },
        hybrid: { score: 8, maxScore: 10 },
        outsourced: { score: 7, maxScore: 10 },
    },
    {
        criteria: 'Operational Flexibility',
        weight: '25%',
        centralized: { score: 4, maxScore: 10 },
        hybrid: { score: 8, maxScore: 10 },
        outsourced: { score: 9, maxScore: 10 },
    },
    {
        criteria: 'Governance & Control',
        weight: '20%',
        centralized: { score: 9, maxScore: 10 },
        hybrid: { score: 7, maxScore: 10 },
        outsourced: { score: 4, maxScore: 10 },
    },
    {
        criteria: 'Implementation Speed',
        weight: '15%',
        centralized: { score: 6, maxScore: 10 },
        hybrid: { score: 8, maxScore: 10 },
        outsourced: { score: 7, maxScore: 10 },
    },
    {
        criteria: 'Service Quality',
        weight: '5%',
        centralized: { score: 8, maxScore: 10 },
        hybrid: { score: 9, maxScore: 10 },
        outsourced: { score: 6, maxScore: 10 },
    },
];

const ScoreIndicator: React.FC<{ score: number; maxScore: number; isWinner?: boolean }> = ({
    score,
    maxScore,
    isWinner = false
}) => {
    const percentage = (score / maxScore) * 100;

    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 min-w-[60px]">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all ${isWinner ? 'bg-gradient-to-r from-teal-500 to-teal-600' : 'bg-gray-400'
                            }`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
            <span className={`text-sm font-bold min-w-[40px] ${isWinner ? 'text-teal-600' : 'text-gray-600'
                }`}>
                {score}/{maxScore}
            </span>
        </div>
    );
};

export const ScoringMatrix: React.FC = () => {
    // Calculate weighted totals
    const weights = [0.35, 0.25, 0.20, 0.15, 0.05];
    const centralizedTotal = scoringData.reduce((sum, item, idx) =>
        sum + (item.centralized.score * weights[idx]), 0
    ).toFixed(1);
    const hybridTotal = scoringData.reduce((sum, item, idx) =>
        sum + (item.hybrid.score * weights[idx]), 0
    ).toFixed(1);
    const outsourcedTotal = scoringData.reduce((sum, item, idx) =>
        sum + (item.outsourced.score * weights[idx]), 0
    ).toFixed(1);

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b-2 border-gray-300">
                        <th className="text-left py-4 px-3 text-sm font-bold text-gray-700">
                            Evaluation Criteria
                        </th>
                        <th className="text-center py-4 px-3 text-xs font-semibold text-gray-500 w-16">
                            Weight
                            <span className="inline-block ml-1 text-gray-400" title="Weights are adjustable in settings">(?)</span>
                        </th>
                        <th className="text-center py-4 px-3 text-sm font-bold text-gray-700 w-32">
                            Centralized
                        </th>
                        <th className="text-center py-4 px-3 text-sm font-bold text-white w-32 rounded-t-lg" style={{ backgroundColor: '#14b8a6' }}>
                            Hybrid ✓
                        </th>
                        <th className="text-center py-4 px-3 text-sm font-bold text-gray-700 w-32">
                            Outsourced
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {scoringData.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-3 text-sm font-medium text-gray-800">
                                {row.criteria}
                            </td>
                            <td className="py-4 px-3 text-center text-xs text-gray-600 font-semibold">
                                {row.weight}
                            </td>
                            <td className="py-4 px-3">
                                <ScoreIndicator
                                    score={row.centralized.score}
                                    maxScore={row.centralized.maxScore}
                                />
                            </td>
                            <td className="py-4 px-3 bg-teal-50">
                                <ScoreIndicator
                                    score={row.hybrid.score}
                                    maxScore={row.hybrid.maxScore}
                                    isWinner
                                />
                            </td>
                            <td className="py-4 px-3">
                                <ScoreIndicator
                                    score={row.outsourced.score}
                                    maxScore={row.outsourced.maxScore}
                                />
                            </td>
                        </tr>
                    ))}

                    {/* Total Score Row */}
                    <tr className="bg-gray-100 border-t-2 border-gray-300 font-bold">
                        <td className="py-4 px-3 text-sm text-gray-900">
                            Weighted Total Score
                        </td>
                        <td className="py-4 px-3 text-center text-xs text-gray-600">
                            100%
                        </td>
                        <td className="py-4 px-3 text-center">
                            <span className="text-xl font-bold text-gray-700">
                                {centralizedTotal}
                            </span>
                            <span className="text-sm text-gray-500">/10</span>
                        </td>
                        <td className="py-4 px-3 text-center bg-teal-100">
                            <div className="flex items-center justify-center gap-2">
                                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                                <span className="text-xl font-bold text-teal-700">
                                    {hybridTotal}
                                </span>
                                <span className="text-sm text-teal-600">/10</span>
                            </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                            <span className="text-xl font-bold text-gray-700">
                                {outsourcedTotal}
                            </span>
                            <span className="text-sm text-gray-500">/10</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};
