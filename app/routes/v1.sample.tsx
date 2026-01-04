import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement
} from 'chart.js';
import { Radar, Bar, Doughnut } from 'react-chartjs-2';
import { requireUserSession } from "~/lib/session.server";
import { getLatestAnalysis } from "~/utils/analysis";

// Register Chart.js components
ChartJS.register(
  RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, ArcElement
);

// Enhanced TypeScript Interfaces
interface DatabaseRecord {
  pk: string;
  sk: string;
  assessment_id: string;
  createdAt: string;
  result: AssessmentReport;
  section: string;
}

interface Capability {
  name?: string;
  score?: number;
  // color_intensity?: number;
}

interface DimensionMatrix {
  name?: string;
  capabilities?: Capability[];
}

interface HeatMapData {
  dimensions?: DimensionMatrix[];
  colors?: {
    min: string;
    mid?: string;
    max?: string;
  };
}

interface ProgressBar {
  dimension?: string;
  current_percentage?: number;
  target_percentage?: number;
  color_code?: string;
  status?: string;
}

interface RadarChartData {
  labels?: string[];
  current_scores?: number[];
  industry_benchmarks?: number[];
  target_scores?: number[];
  colors?: {
    current?: string;
    benchmark?: string;
    target?: string;
  };
}

interface BubbleData {
  dimension?: string;
  gap?: number;
  importance?: number;
  investment?: number;
  timeline?: number;
  status?: string;
}

interface AssessmentReport {
  assessment_metadata?: {
    assessment_id?: string;
    completion_date?: string;
    total_questions?: number;
    answered_questions?: number;
    completion_percentage?: number;
    processing_confidence?: number;
  };
  organization_profile?: {
    company_size?: string;
    industry_sector?: string;
    annual_revenue?: string;
    business_model?: string[];
    current_digital_stage?: number;
  };
  maturity_analysis?: {
    overall_score?: {
      raw_score?: number;
      weighted_score?: number;
      percentage?: number;
      maturity_level?: string;
      confidence_score?: number;
      industry_benchmark?: {
        industry_average?: number;
        percentile_ranking?: number;
        top_quartile_threshold?: number;
        peer_comparison?: string;
      };
    };
    dimensional_scores?: Array<{
      dimension?: string;
      raw_score?: number;
      weighted_score?: number;
      percentage?: number;
      maturity_level?: string;
      confidence_score?: number;
      questions_analyzed?: number;
      industry_benchmark?: number;
      gap_analysis?: {
        gap_to_benchmark?: number;
        gap_to_best_practice?: number;
        improvement_potential?: number;
      };
      key_strengths?: string[];
      critical_gaps?: string[];
    }>;
  };
  visualization_data?: {
    radar_chart?: RadarChartData;
    progress_bars?: ProgressBar[];
    heat_map?: HeatMapData;
    gap_bubbles?: BubbleData[];
  };
  strategic_insights?: {
    overall_assessment?: string;
    maturity_stage_description?: string;
    competitive_position?: string;
    transformation_readiness?: {
      score?: number;
      readiness_level?: string;
      enabling_factors?: string[];
      blocking_factors?: string[];
    };
  };
  [key: string]: any;
}

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

const chartVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      delay: 0.3
    }
  }
};

// Loader
export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  try {
    const user = await requireUserSession(request);
    const data = await getLatestAnalysis(`COMPANY#${user.organisationId}`, "Profiling Assessment");

    if (!data) {
      throw new Response("No assessment data found", { status: 404 });
    }

    return json(data);
  } catch (error) {
    console.error("Error loading assessment data:", error);
    throw new Response("Failed to load assessment data", { status: 500 });
  }
};

// Interactive Radar Chart Component
const InteractiveRadarChart: React.FC<{ data: RadarChartData }> = ({ data }) => {
  const [activeDataset, setActiveDataset] = useState<number | null>(null);

  const chartData = useMemo(() => ({
    labels: data.labels || [],
    datasets: [
      {
        label: 'Current Scores',
        data: data.current_scores || [],
        backgroundColor: data.colors?.current?.replace('0.6', activeDataset === 0 ? '0.4' : '0.2') || 'rgba(54, 162, 235, 0.2)',
        borderColor: data.colors?.current?.replace('0.6', '1') || 'rgba(54, 162, 235, 1)',
        borderWidth: activeDataset === 0 ? 3 : 2,
        pointRadius: activeDataset === 0 ? 6 : 4,
        pointHoverRadius: 8,
      },
      {
        label: 'Industry Benchmark',
        data: data.industry_benchmarks || [],
        backgroundColor: data.colors?.benchmark?.replace('0.6', activeDataset === 1 ? '0.4' : '0.2') || 'rgba(255, 99, 132, 0.2)',
        borderColor: data.colors?.benchmark?.replace('0.6', '1') || 'rgba(255, 99, 132, 1)',
        borderWidth: activeDataset === 1 ? 3 : 2,
        pointRadius: activeDataset === 1 ? 6 : 4,
        pointHoverRadius: 8,
      },
      {
        label: 'Target Scores',
        data: data.target_scores || [],
        backgroundColor: data.colors?.target?.replace('0.6', activeDataset === 2 ? '0.4' : '0.2') || 'rgba(75, 192, 192, 0.2)',
        borderColor: data.colors?.target?.replace('0.6', '1') || 'rgba(75, 192, 192, 1)',
        borderWidth: activeDataset === 2 ? 3 : 2,
        pointRadius: activeDataset === 2 ? 6 : 4,
        pointHoverRadius: 8,
        borderDash: [5, 5],
      }
    ]
  }), [data, activeDataset]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1500,
      easing: 'easeInOutQuart' as const,
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    scales: {
      r: {
        angleLines: { display: true, color: 'rgba(0,0,0,0.1)' },
        grid: { color: 'rgba(0,0,0,0.1)' },
        pointLabels: {
          font: { size: 12, weight: 'bold' as const },
          color: '#374151'
        },
        ticks: {
          beginAtZero: true,
          max: 5,
          stepSize: 1,
          color: '#6B7280'
        },
        suggestedMin: 0,
        suggestedMax: 5
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        onClick: (e: any, legendItem: any) => {
          setActiveDataset(activeDataset === legendItem.datasetIndex ? null : legendItem.datasetIndex);
        },
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { weight: 'bold' as const }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#374151',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => `${context[0].label}`,
          label: (context: any) => `${context.dataset.label}: ${context.parsed.r.toFixed(1)}/5`
        }
      }
    },
    onHover: (event: any, elements: any) => {
      if (elements.length > 0) {
        setActiveDataset(elements[0].datasetIndex);
      }
    }
  }), [activeDataset]);

  if (!data.labels || data.labels.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        <p>No radar chart data available</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        Dimensional Performance Radar
      </h3>
      <div className="relative h-96">
        <Radar data={chartData} options={options} />
      </div>
      <div className="mt-4 text-sm text-gray-600 text-center">
        <p>Click legend items to highlight datasets • Hover for details</p>
      </div>
    </motion.div>
  );
};
const LegendSquare: React.FC<{label: string; color: string}> = ({label, color}) => (
  <div className="flex items-center space-x-2">
    <div className="w-5 h-5 rounded" style={{ backgroundColor: color }}></div>
    <span className="text-sm text-gray-600">{label}</span>
  </div>
);
// Interactive Heatmap Component
export const InteractiveHeatmap: React.FC<{ data: HeatMapData }> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ visible: boolean; content: string; x: number; y: number }>({ visible: false, content: '', x: 0, y: 0 });
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  // Defensive fallback
  const dimensions = data.dimensions ?? [];
  const colors = data.colors ?? { min: '#ff4444', mid: '#ffaa00', max: '#44ff44' };

  const getHeatColor = useCallback((score: number) => {
    if (score <= 2) return colors.min || '#ff4444';
    if (score <= 3) return colors.mid || '#ffaa00';
    return colors.max || '#44ff44';
  }, [colors]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent, capabilityName: string, score: number, dimensionName: string) => {
      setTooltip({ visible: true, content: `${dimensionName} - ${capabilityName}: ${score}/5`, x: e.clientX, y: e.clientY });
      setHoveredCell(`${dimensionName}-${capabilityName}`);
    }, []
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
    setHoveredCell(null);
  }, []);

  // Find max number of capabilities in any dimension to pad rows
  const maxCapabilities = useMemo(
    () => Math.max(0, ...dimensions.map(d => d.capabilities?.length || 0)),
    [dimensions]
  );

  // Early empty state
  if (!dimensions.length) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 bg-white rounded-xl shadow-lg border">
        <p>No heatmap data available</p>
      </div>
    );
  }

  return (
    <motion.div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 relative"
      variants={chartVariants} initial="hidden" animate="visible" whileHover={{ scale: 1.02 }}>
      
      {/* Tooltip */}
      <AnimatePresence>
        {tooltip.visible && (
          <motion.div className="fixed z-50 bg-gray-900 text-white text-xs rounded-md p-1 px-2 pointer-events-none"
            style={{ top: tooltip.y + 10, left: tooltip.x + 10, maxWidth: 300 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.1 }}
          >
            {tooltip.content}
            <div className="absolute -bottom-1 left-2 w-2 h-2 bg-gray-900 rotate-45"></div>
          </motion.div>
        )}
      </AnimatePresence>

      <h3 className="text-center text-xl font-semibold text-gray-900 mb-6">Capability Heatmap</h3>

      {/* Table Header */}
      <div className={`grid grid-cols-[140px_repeat(${dimensions.length},1fr)] gap-1 sticky top-0 bg-gray-50 px-4 py-1 border-b border-gray-200`}>
        <div className=""></div>
        {dimensions.map((dim, idx) => (
          <div key={idx} className="text-center text-gray-700 font-semibold truncate">{dim.name ?? 'Unnamed'}</div>
        ))}
      </div>

      {/* Capability rows */}
      {Array.from({ length: maxCapabilities }).map((_, capIdx) => (
        <div key={capIdx} className={`grid grid-cols-[140px_repeat(${dimensions.length},1fr)] gap-1 px-4 py-2 items-center border-b border-gray-100`}>
          <div className="text-gray-600 font-semibold pr-2 truncate text-right">
            {dimensions[0]?.capabilities?.[capIdx]?.name ?? `Cap ${capIdx + 1}`}
          </div>
          {dimensions.map((dim, dimIdx) => {
            const capability = dim.capabilities?.[capIdx];
            if (!capability) {
              return <div key={dimIdx} className="bg-gray-100 opacity-30 rounded-lg" style={{ height: 48 }}></div>;
            }
            const cellKey = `${dim.name}-${capability.name}`;
            const isHovered = hoveredCell === cellKey;
            const color = getHeatColor(capability.score || 0);

            return (
              <motion.div
                key={dimIdx}
                className={clsx("rounded-lg flex items-center justify-center font-semibold text-white cursor-pointer", {
                  'ring ring-blue-400 ring-offset-2 z-10': isHovered
                })}
                style={{ backgroundColor: color, height: 48 }}
                onMouseMove={e => handleMouseMove(e, capability.name ?? '', capability.score ?? 0, dim.name ?? '')}
                onMouseLeave={handleMouseLeave}
                whileHover={{ scale: 1.1, zIndex: 20 }}
                transition={{ duration: 0.2 }}
              >
                {capability.score?.toFixed(1)}
              </motion.div>
            );
          })}
        </div>
      ))}

      {/* Legend */}
      <div className="flex justify-center space-x-6 mt-6">
        <LegendSquare label="Low (1-2)" color={colors.min} />
        <LegendSquare label="Medium (3)" color={colors.mid ?? '#ffaa00'} />
        <LegendSquare label="High (4-5)" color={colors.max ?? '#44ff44'} />
      </div>
    </motion.div>
  );
};

// Interactive Bar Chart Component
const InteractiveBarChart: React.FC<{ 
  dimensionalScores: Array<{
    dimension?: string;
    raw_score?: number;
    industry_benchmark?: number;
    questions_analyzed?: number;
  }> 
}> = ({ dimensionalScores }) => {
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const chartData = useMemo(() => {
    const dimensions = dimensionalScores.map(d => d.dimension || 'Unknown');
    const scores = dimensionalScores.map(d => d.raw_score || 0);
    const benchmarks = dimensionalScores.map(d => d.industry_benchmark || 0);
    const questions = dimensionalScores.map(d => d.questions_analyzed || 0);

    return {
      labels: dimensions,
      datasets: [
        {
          label: 'Your Score',
          data: scores,
          backgroundColor: dimensions.map((_, index) => 
            activeBar === index ? 'rgba(59, 130, 246, 0.8)' : 'rgba(59, 130, 246, 0.6)'
          ),
          borderColor: 'rgba(59, 130, 246, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Industry Benchmark',
          data: benchmarks,
          backgroundColor: dimensions.map((_, index) => 
            activeBar === index ? 'rgba(239, 68, 68, 0.8)' : 'rgba(239, 68, 68, 0.6)'
          ),
          borderColor: 'rgba(239, 68, 68, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
        {
          label: 'Questions Analyzed',
          data: questions,
          backgroundColor: dimensions.map((_, index) => 
            activeBar === index ? 'rgba(16, 185, 129, 0.8)' : 'rgba(16, 185, 129, 0.6)'
          ),
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          yAxisID: 'y1',
        }
      ]
    };
  }, [dimensionalScores, activeBar]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeInOutCubic' as const,
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          font: { weight: 'bold' as const },
          maxRotation: 45,
          color: '#374151'
        }
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        max: 5,
        grid: { color: 'rgba(0,0,0,0.1)' },
        ticks: {
          stepSize: 1,
          color: '#6B7280'
        },
        title: {
          display: true,
          text: 'Score (1-5)',
          font: { weight: 'bold' as const },
          color: '#374151'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        grid: { drawOnChartArea: false },
        ticks: { color: '#6B7280' },
        title: {
          display: true,
          text: 'Questions',
          font: { weight: 'bold' as const },
          color: '#374151'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { weight: 'bold' as const }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context: any) => context[0].label,
          label: (context: any) => {
            const suffix = context.datasetIndex === 2 ? ' questions' : '/5';
            return `${context.dataset.label}: ${context.parsed.y}${suffix}`;
          }
        }
      }
    },
    onHover: (event: any, elements: any) => {
      if (elements.length > 0) {
        setActiveBar(elements[0].index);
      } else {
        setActiveBar(null);
      }
    }
  }), []);

  if (!dimensionalScores || dimensionalScores.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 bg-white rounded-xl shadow-lg border">
        <p>No dimensional score data available</p>
      </div>
    );
  }

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        Dimensional Scores vs Industry Benchmark
      </h3>
      <div className="relative h-96">
        <Bar data={chartData} options={options} />
      </div>
    </motion.div>
  );
};

const STATUS_COLORS: Record<string, string> = {
  Excellent: '#10b981',      // Green
  On_Track: '#3b82f6',       // Blue
  Needs_Attention: '#f59e0b',// Yellow
  Critical: '#ef4444',       // Red
};

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);
// Interactive Bubble Chart Component
const InteractiveBubbleChart: React.FC<{ bubbles?: BubbleData[] }> = ({ bubbles = [] }) => {
  const [hovered, setHovered] = useState<string | null>(null);

  if (!bubbles.length) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500 bg-white rounded-xl shadow-lg border">
        <p>No bubble chart data available</p>
      </div>
    );
  }

  const maxInvestment = Math.max(...bubbles.map(b => b.investment || 0)) || 1;
  const maxImportance = Math.max(...bubbles.map(b => b.importance || 0)) || 1;

  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-lg border border-gray-200"
      variants={chartVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ scale: 1.01 }}
    >
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
        Gap Analysis – Strategic Importance vs Investment Required
      </h3>
      <div className="relative bg-gray-50 rounded-lg p-4">
        <svg width="100%" height="400" viewBox="0 0 600 400" className="overflow-visible">
          {/* Grid */}
          <defs>
            <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Axes */}
          <line x1={50} y1={350} x2={550} y2={350} stroke="#374151" strokeWidth={2}/>
          <line x1={50} y1={50} x2={50} y2={350} stroke="#374151" strokeWidth={2}/>
          {/* Labels */}
          <text x={300} y={390} textAnchor="middle" fontSize={14} fill="#374151">
            Strategic Importance -&gt;
          </text>
          <text x={20} y={200} textAnchor="middle" fontSize={14} fill="#374151" transform="rotate(-90 20 200)">
            Investment Required -&gt;
          </text>
          {/* Bubbles */}
          {bubbles.map((bubble, i) => {
            const x = 70 + ((bubble.importance ?? 0) / maxImportance) * 460;
            const y = 330 - ((bubble.investment ?? 0) / maxInvestment) * 260;
            const radius = clamp((bubble.investment ?? 1) * 10, 15, 40);
            const fillColor = STATUS_COLORS[bubble.status ?? ''] || '#3b82f6';
            const isHovered = hovered === bubble.dimension;

            return (
              <motion.g 
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ scale: 1.1 }}
                onHoverStart={() => setHovered(bubble.dimension ?? null)}
                onHoverEnd={() => setHovered(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={fillColor}
                  fillOpacity={isHovered ? 0.8 : 0.6}
                  stroke={fillColor}
                  strokeWidth={isHovered ? 3 : 2}
                  className="drop-shadow-lg"
                />
                {/* Dimension label */}
                <text
                  x={x}
                  y={y + radius + 20}
                  textAnchor="middle"
                  className="text-xs font-semibold"
                  fill="#374151"
                >
                  {bubble.dimension?.split(' ').slice(0, 2).join(' ')}
                </text>
                {/* Timeline */}
                <text
                  x={x}
                  y={y + radius + 35}
                  textAnchor="middle"
                  className="text-xs"
                  fill="#6b7280"
                >
                  {bubble.timeline} mo
                </text>
                {/* Gap value/gap magnitude */}
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="text-sm font-bold"
                  fill="white"
                >
                  {(bubble.gap ?? 0).toFixed(1)}
                </text>
              </motion.g>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 text-sm text-gray-600 text-center space-y-1">
        <p><strong>Bubble size:</strong> Investment required - <strong>Numbers:</strong> Gap magnitude</p>
        <p><strong>Timeline</strong> shown below each bubble in months</p>
      </div>
    </motion.div>
  );
};

// Animated Progress Ring Component
const AnimatedProgressRing: React.FC<{
  dimension: string;
  percentage: number;
  status: string;
  delay?: number;
}> = ({ dimension, percentage, status, delay = 0 }) => {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, delay);
    return () => clearTimeout(timer);
  }, [percentage, delay]);

  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = `${(animatedPercentage / 100) * circumference} ${circumference}`;
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return '#10b981';
      case 'on_track': return '#3b82f6';
      case 'needs_attention': return '#f59e0b';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center p-4 bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-300"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: delay / 1000, duration: 0.6, type: "spring" }}
      whileHover={{ y: -4 }}
    >
      <div className="relative mb-3">
        <svg width="80" height="80" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <motion.circle
            cx="40"
            cy="40"
            r={radius}
            fill="none"
            stroke={getStatusColor(status)}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference}
            animate={{
              strokeDashoffset: circumference - (animatedPercentage / 100) * circumference
            }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: delay / 1000 }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span 
            className="text-lg font-bold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (delay / 1000) + 0.5 }}
          >
            {animatedPercentage.toFixed(0)}%
          </motion.span>
        </div>
      </div>
      
      <h4 className="text-sm font-semibold text-center text-gray-700 mb-2 min-h-[2.5rem] flex items-center">
        {dimension}
      </h4>
      
      <motion.span 
        className="text-xs px-3 py-1 rounded-full text-white font-medium"
        style={{ backgroundColor: getStatusColor(status) }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: (delay / 1000) + 0.8, type: "spring" }}
      >
        {status.replace('_', ' ')}
      </motion.span>
    </motion.div>
  );
};

// Main Report Component
export default function ReportPage() {
  const data = useLoaderData<DatabaseRecord>();
  const report = data?.result;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for animations
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading your assessment report...</p>
        </motion.div>
      </div>
    );
  }

  if (!data || !report) {
    return (
      <motion.div 
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">No Report Data Available</h1>
          <p className="text-gray-600">Please complete your assessment first.</p>
        </div>
      </motion.div>
    );
  }

  // Safe data extraction
  const assessmentMetadata = report.assessment_metadata || {};
  const organizationProfile = report.organization_profile || {};
  const maturityAnalysis = report.maturity_analysis || {};
  const visualizationData = report.visualization_data || {};
  const strategicInsights = report.strategic_insights || {};

  const overallScore = maturityAnalysis.overall_score || {};
  const dimensionalScores = maturityAnalysis.dimensional_scores || [];
  const progressBars = visualizationData.progress_bars || [];
  const heatmap = visualizationData.heat_map || {}
  const bubbleGap = visualizationData.gap_bubbles || {}

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Animated Header */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8 relative overflow-hidden"
          variants={itemVariants}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5"></div>
          
          <div className="relative flex items-center justify-between">
            <div>
              <motion.h1 
                className="text-4xl font-bold text-gray-900 mb-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                Digital Maturity Assessment Report
              </motion.h1>
              <motion.div 
                className="text-sm text-gray-500 space-y-1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <p><span className="font-medium">Assessment ID:</span> {assessmentMetadata.assessment_id || 'N/A'}</p>
                <p><span className="font-medium">Section:</span> {data.section}</p>
                <p><span className="font-medium">Completed:</span> {assessmentMetadata.completion_date ? 
                  new Date(assessmentMetadata.completion_date).toLocaleDateString() : 'N/A'}</p>
              </motion.div>
            </div>
            
            <motion.div 
              className="text-right"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <div className="relative">
                <div className="text-6xl font-bold text-blue-600 mb-2">
                  {overallScore.percentage || 0}%
                </div>
                <div className={clsx(
                  "inline-flex px-4 py-2 rounded-full text-sm font-bold border-2",
                  overallScore.maturity_level === 'Advanced' && "bg-blue-100 text-blue-800 border-blue-200",
                  overallScore.maturity_level === 'Developing' && "bg-yellow-100 text-yellow-800 border-yellow-200",
                  !overallScore.maturity_level && "bg-gray-100 text-gray-800 border-gray-200"
                )}>
                  {overallScore.maturity_level || 'Not Assessed'}
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Confidence: {((overallScore.confidence_score || 0) * 100).toFixed(0)}%
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Executive Dashboard */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          variants={itemVariants}
        >
          {[
            { label: "Overall Score", value: (overallScore.raw_score || 0).toFixed(1), color: "blue", suffix: "/5" },
            { label: "Confidence", value: ((overallScore.confidence_score || 0) * 100).toFixed(0), color: "green", suffix: "%" },
            { label: "Percentile", value: overallScore.industry_benchmark?.percentile_ranking || 0, color: "purple", suffix: "th" },
            { label: "Completion", value: assessmentMetadata.completion_percentage || 0, color: "orange", suffix: "%" }
          ].map((metric, index) => (
            <motion.div
              key={metric.label}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 text-center hover:shadow-xl transition-shadow duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -2 }}
            >
              <div className={clsx(
                "text-4xl font-bold mb-2",
                metric.color === "blue" && "text-blue-600",
                metric.color === "green" && "text-green-600",
                metric.color === "purple" && "text-purple-600",
                metric.color === "orange" && "text-orange-600"
              )}>
                {metric.value}{metric.suffix}
              </div>
              <p className="text-sm text-gray-500 font-medium">{metric.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Visualizations Section */}
        <motion.div className="mb-8" variants={itemVariants}>
          <motion.h2 
            className="text-3xl font-bold text-gray-900 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            📊 Interactive Analytics Dashboard
          </motion.h2>
          
          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <InteractiveRadarChart data={visualizationData.radar_chart || {}} />
            <InteractiveHeatmap data={heatmap} />
          </div>

          {/* Secondary Charts */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            <InteractiveBarChart dimensionalScores={dimensionalScores} />
            <InteractiveBubbleChart bubbles={bubbleGap} />
          </div>

          {/* Progress Rings */}
          {progressBars.length > 0 && (
            <motion.div 
              className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200"
              variants={itemVariants}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Dimensional Performance Overview
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                {progressBars.map((bar, index) => (
                  <AnimatedProgressRing
                    key={index}
                    dimension={bar.dimension || `Dimension ${index + 1}`}
                    percentage={bar.current_percentage || 0}
                    status={bar.status || 'unknown'}
                    delay={index * 150}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Organization Profile */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🏢 Organization Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Company Size", value: organizationProfile.company_size || 'N/A' },
              { label: "Industry", value: organizationProfile.industry_sector || 'N/A' },
              { label: "Annual Revenue", value: organizationProfile.annual_revenue || 'N/A' },
              { label: "Digital Stage", value: `${organizationProfile.current_digital_stage || 0}/5` }
            ].map((item, index) => (
              <motion.div
                key={item.label}
                className="bg-gray-50 p-4 rounded-lg"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <label className="block text-sm font-semibold text-gray-500 mb-2">{item.label}</label>
                <p className="text-lg font-bold text-gray-900">{item.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Strategic Insights */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 mb-8"
          variants={itemVariants}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">🎯 Strategic Insights</h2>
          <div className="space-y-6">
            {[
              { title: "Overall Assessment", content: strategicInsights.overall_assessment },
              { title: "Maturity Stage Description", content: strategicInsights.maturity_stage_description },
              { title: "Competitive Position", content: strategicInsights.competitive_position }
            ].map((insight, index) => (
              <motion.div
                key={insight.title}
                className="bg-gray-50 p-6 rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-3">{insight.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {insight.content || 'No analysis available.'}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Transformation Readiness */}
          {strategicInsights.transformation_readiness && (
            <motion.div 
              className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border border-blue-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-xl font-bold text-gray-900">🚀 Transformation Readiness</h3>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-bold text-blue-600">
                    {(strategicInsights.transformation_readiness.score || 0).toFixed(1)}
                  </span>
                  <span className="inline-flex px-3 py-1 rounded-full text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200">
                    {strategicInsights.transformation_readiness.readiness_level || 'N/A'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                    ✅ Enabling Factors
                  </h4>
                  <ul className="space-y-3">
                    {(strategicInsights.transformation_readiness.enabling_factors || []).map((factor, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start text-gray-700 bg-white p-3 rounded-lg shadow-sm"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <span className="text-green-500 mr-3 mt-0.5 text-lg">✓</span>
                        {factor}
                      </motion.li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                    ⚠️ Blocking Factors
                  </h4>
                  <ul className="space-y-3">
                    {(strategicInsights.transformation_readiness.blocking_factors || []).map((factor, index) => (
                      <motion.li 
                        key={index} 
                        className="flex items-start text-gray-700 bg-white p-3 rounded-lg shadow-sm"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                      >
                        <span className="text-red-500 mr-3 mt-0.5 text-lg">⚠</span>
                        {factor}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center text-sm text-gray-500 py-8"
          variants={itemVariants}
        >
          <p className="flex items-center justify-center space-x-2">
            <span>📊 Report generated on {new Date().toLocaleDateString()}</span>
            <span>•</span>
            <span>🚀 Digital Maturity Assessment Platform</span>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}

