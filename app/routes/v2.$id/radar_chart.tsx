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

export const NewRadarChart = ({ data }: {data:RadarChartData}) => {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'Current',
        data: data.current_scores,
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(59, 130, 246, 1)',
      },
      {
        label: 'Benchmark',
        data: data.industry_benchmarks,
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: 'rgba(245, 158, 11, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(245, 158, 11, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(245, 158, 11, 1)',
      },
      {
        label: 'Target',
        data: data.target_scores,
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: 'rgba(16, 185, 129, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(16, 185, 129, 1)',
        borderDash: [5, 5],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: '#e5e7eb',
        },
        grid: {
          color: '#e5e7eb',
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold' as const,
          },
          color: '#4b5563',
        },
        ticks: {
          backdropColor: 'transparent',
          color: '#6b7280',
          stepSize: 1,
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
            boxWidth: 8,
            padding: 20
        }
      },
      tooltip: {
        enabled: true,
        backgroundColor: '#1f2937',
        titleFont: {
            size: 14,
            weight: 'bold' as const
        },
        bodyFont: {
            size: 12
        },
        callbacks: {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          label: function(context: any) {
            return `${context.dataset.label}: ${context.raw.toFixed(1)}`;
          }
        }
      }
    },
    elements: {
        line: {
            tension: 0.1
        }
    }
  };

  return <Radar data={chartData} options={options} />;
};

