import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TrendChartProps {
    dates: string[];
    scores: number[];
    title?: string;
    className?: string;
}

export default function TrendChart({
    dates,
    scores,
    title = "Progress Over Time",
    className = "",
}: TrendChartProps) {
    const chartRef = useRef<ChartJS<"line">>(null);

    const data = {
        labels: dates,
        datasets: [
            {
                label: "Completion Score",
                data: scores,
                borderColor: "rgb(59, 130, 246)",
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
                    gradient.addColorStop(0, "rgba(59, 130, 246, 0.5)");
                    gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
                    return gradient;
                },
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: "rgb(59, 130, 246)",
                pointBorderColor: "#fff",
                pointBorderWidth: 2,
                pointHoverBackgroundColor: "rgb(37, 99, 235)",
                pointHoverBorderColor: "#fff",
                pointHoverBorderWidth: 3,
            },
        ],
    };

    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                padding: 12,
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "rgb(59, 130, 246)",
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return `Score: ${context.parsed.y}%`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    callback: function (value) {
                        return value + "%";
                    },
                    color: "#6B7280",
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    color: "rgba(0, 0, 0, 0.05)",
                    drawBorder: false,
                },
            },
            x: {
                ticks: {
                    color: "#6B7280",
                    font: {
                        size: 12,
                    },
                },
                grid: {
                    display: false,
                    drawBorder: false,
                },
            },
        },
        interaction: {
            intersect: false,
            mode: "index",
        },
        animation: {
            duration: 1000,
            easing: "easeInOutQuart",
        },
    };

    return (
        <div className={`${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
            <div className="relative h-64">
                <Line ref={chartRef} data={data} options={options} />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Completion Progress</span>
                </div>
                <div className="text-xs">
                    {scores.length} data point{scores.length !== 1 ? "s" : ""} available
                </div>
            </div>
        </div>
    );
}
