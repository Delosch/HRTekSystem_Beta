import { useState, useEffect } from "react";
import { ArrowUpDown, Download } from "lucide-react";

interface ScoringMatrixProps {
    parameters: Array<{
        name: string;
        weight: number;
        scores: Record<string, number>;
        impact: "HIGH" | "MED" | "LOW";
    }>;
    vendors: string[];
    className?: string;
    onViewFullReport?: () => void;
}

const impactConfig = {
    HIGH: { bg: "bg-red-100", text: "text-red-700", label: "HIGH" },
    MED: { bg: "bg-amber-100", text: "text-amber-700", label: "MED" },
    LOW: { bg: "bg-green-100", text: "text-green-700", label: "LOW" },
};

export default function ScoringMatrix({
    parameters,
    vendors,
    className = "",
    onViewFullReport,
}: ScoringMatrixProps) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [sortedParams, setSortedParams] = useState(parameters);

    useEffect(() => {
        setSortedParams(parameters);
    }, [parameters]);

    const handleSort = (column: string) => {
        let newDirection: "asc" | "desc" = "desc";

        if (sortColumn === column) {
            newDirection = sortDirection === "asc" ? "desc" : "asc";
        }

        setSortColumn(column);
        setSortDirection(newDirection);

        // Sort the parameters based on the selected vendor's scores
        const sorted = [...parameters].sort((a, b) => {
            const aScore = a.scores[column] || 0;
            const bScore = b.scores[column] || 0;
            return newDirection === "asc" ? aScore - bScore : bScore - aScore;
        });

        setSortedParams(sorted);
    };

    const handleExport = () => {
        // Create CSV content
        const headers = ["Parameter", "Weight", ...vendors, "Impact"];
        const rows = sortedParams.map(param => [
            param.name,
            `${param.weight}%`,
            ...vendors.map(v => `${param.scores[v] ?? 0}/10`),
            param.impact
        ]);

        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.map(val => `"${val}"`).join(","))
        ].join("\n");

        // Download CSV
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "scoring-matrix.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg border border-gray-100 p-6 ${className}`}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Detailed Scoring Matrix
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Weighted evaluation across key parameters
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    {onViewFullReport && (
                        <button
                            onClick={onViewFullReport}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                        >
                            View Full Report
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b-2 border-gray-200">
                            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Evaluation Parameter
                            </th>
                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Weight
                            </th>
                            {vendors.map((vendor) => (
                                <th
                                    key={vendor}
                                    className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-50 transition-colors"
                                    onClick={() => handleSort(vendor)}
                                >
                                    <div className="flex items-center justify-center gap-1">
                                        {vendor}
                                        <ArrowUpDown className={`w-3 h-3 ${sortColumn === vendor ? 'text-blue-600' : 'text-gray-400'}`} />
                                    </div>
                                </th>
                            ))}
                            <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Impact
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedParams.map((param) => (
                            <tr
                                key={param.name}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                                    {param.name}
                                </td>
                                <td className="py-4 px-4 text-center text-sm text-gray-600">
                                    {param.weight}%
                                </td>
                                {vendors.map((vendor) => {
                                    const score = param.scores[vendor];
                                    const isHighest = score === Math.max(
  ...vendors.map(v => param.scores[v] ?? 0)
);
                                    return (
                                        <td
                                            key={vendor}
                                            className={`py-4 px-4 text-center text-sm font-bold ${isHighest ? 'text-green-600' : 'text-gray-900'
                                                }`}
                                        >
                                            {(score ?? 0)}/10
                                        </td>
                                    );
                                })}
                                <td className="py-4 px-4 text-center">
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${impactConfig[param.impact].bg
                                            } ${impactConfig[param.impact].text}`}
                                    >
                                        {impactConfig[param.impact].label}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Summary Row */}
            <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-4 gap-4">
                    {vendors.map((vendor) => {
                        const totalScore = sortedParams.reduce((sum, param) => {
                            return sum + ((param.scores[vendor] ?? 0) * param.weight / 100);
                        }, 0);
                        return (
                            <div key={vendor} className="text-center p-4 bg-gray-50 rounded-lg">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                                    {vendor} Total
                                </p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {totalScore.toFixed(1)}/10
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
