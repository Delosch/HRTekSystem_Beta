import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { RadarChartData } from './schemas';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

export const NewRadarChart = ({ data }: { data: RadarChartData }) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Current',
        data: data.current_scores,
        backgroundColor: 'rgba(6, 182, 212, 0.3)', // Cyan-500
        borderColor: '#06b6d4',
        borderWidth: 3,
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#06b6d4',
        pointRadius: 4,
      },
      {
        label: 'Benchmark',
        data: data.industry_benchmarks,
        backgroundColor: 'rgba(236, 72, 153, 0.2)', // Pink-500
        borderColor: '#ec4899',
        borderWidth: 2,
        pointBackgroundColor: '#ec4899',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#ec4899',
        pointRadius: 3,
      },
      {
        label: 'Target',
        data: data.target_scores,
        backgroundColor: 'transparent',
        borderColor: '#facc15', // Yellow-400
        borderWidth: 2,
        pointBackgroundColor: '#facc15',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#facc15',
        borderDash: [6, 4],
        pointRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: 'rgba(255, 255, 255, 0.15)',
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.15)',
          circular: true,
        },
        pointLabels: {
          font: {
            size: 11,
            family: "'Inter', sans-serif",
            weight: '700' as const,
          },
          color: '#f1f5f9', // Slate-100 (High contrast)
          padding: 10,
        },
        ticks: {
          backdropColor: 'transparent',
          color: 'rgba(255, 255, 255, 0.5)',
          stepSize: 1,
          showLabelBackdrop: false,
          font: {
            weight: 'bold' as const
          }
        },
        suggestedMin: 0,
        suggestedMax: 5,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          boxWidth: 8,
          padding: 20,
          color: '#fff',
          font: {
            family: "'Inter', sans-serif",
            size: 13,
            weight: 'bold' as const
          }
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        titleFont: {
          size: 14,
          weight: 'bold' as const
        },
        bodyFont: {
          size: 13,
          weight: '600' as const
        },
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function (context: any) {
            return ` ${context.dataset.label}: ${context.raw.toFixed(1)}`;
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          labelColor: function (context: any) {
            return {
              borderColor: context.dataset.borderColor,
              backgroundColor: context.dataset.borderColor,
              borderWidth: 2,
              borderRadius: 2,
            };
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.3
      }
    }
  };

  return <Radar data={chartData} options={options} />;
};
