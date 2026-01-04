import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface CostBreakdownChartProps {
    totalCost: string;
    breakdown: Array<{
        label: string;
        value: number;
        percentage: number;
        color: string;
    }>;
    className?: string;
}

export default function CostBreakdownChart({
    totalCost,
    breakdown,
    className = "",
}: CostBreakdownChartProps) {
    const chartRef = useRef<ChartJS<"doughnut">>(null);

    const data = {
        labels: breakdown.map((item) => item.label),
        datasets: [
            {
                data: breakdown.map((item) => item.percentage),
                backgroundColor: breakdown.map((item) => item.color),
                borderColor: "#fff",
                borderWidth: 3,
                hoverOffset: 10,
            },
        ],
    };

    const options: ChartOptions<"doughnut"> = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "rgba(255, 255, 255, 0.2)",
                borderWidth: 1,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const label = context.label || "";
                        const value = context.parsed || 0;
                        return `${label}: ${value}%`;
                    },
                },
            },
        },
        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: "easeInOutQuart",
        },
    };

    return (
        <div className={`${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Cost Breakdown (TCO)
            </h3>

            <div className="relative h-64 mb-6">
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-xs text-gray-500 uppercase tracking-wide">
                        TOTAL COST OF OWNERSHIP
                    </p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{totalCost}</p>
                    <p className="text-xs text-gray-500 mt-1">First Year Spend</p>
                </div>

                <Doughnut ref={chartRef} data={data} options={options} />
            </div>

            {/* Legend */}
            <div className="space-y-2">
                {breakdown.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <span className="text-sm font-medium text-gray-700">
                                {item.label}
                            </span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">
                            {item.percentage}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
