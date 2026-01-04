import { useEffect, useRef } from "react";
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    ChartOptions,
} from "chart.js";
import { Radar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface RadarChartProps {
    datasets: Array<{
        label: string;
        data: number[];
        color: string;
    }>;
    labels: string[];
    title?: string;
    className?: string;
}

export default function RadarChart({
    datasets,
    labels,
    title = "Comparative Analysis",
    className = "",
}: RadarChartProps) {
    const chartRef = useRef<ChartJS<"radar">>(null);

    const data = {
        labels,
        datasets: datasets.map((dataset) => ({
            label: dataset.label,
            data: dataset.data,
            borderColor: dataset.color,
            backgroundColor: dataset.color.replace("rgb", "rgba").replace(")", ", 0.2)"),
            borderWidth: 3,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: dataset.color,
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: dataset.color,
            pointHoverBorderWidth: 3,
        })),
    };

    const options: ChartOptions<"radar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: "bottom",
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                        weight: 500,
                    },
                    usePointStyle: true,
                    pointStyle: "circle",
                },
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
                        return `${context.dataset.label}: ${context.parsed.r}%`;
                    },
                },
            },
        },
        scales: {
            r: {
                beginAtZero: true,
                max: 100,
                ticks: {
                    stepSize: 20,
                    color: "#6B7280",
                    backdropColor: "transparent",
                    font: {
                        size: 11,
                    },
                },
                grid: {
                    color: "rgba(0, 0, 0, 0.1)",
                },
                pointLabels: {
                    color: "#374151",
                    font: {
                        size: 12,
                        weight: 600,
                    },
                },
            },
        },
        animation: {
            duration: 1000,
            easing: "easeInOutQuart",
        },
    };

    return (
        <div className={`${className}`}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 mb-4">
                Performance Radar across key dimensions
            </p>
            <div className="relative h-80">
                <Radar ref={chartRef} data={data} options={options} />
            </div>
        </div>
    );
}
