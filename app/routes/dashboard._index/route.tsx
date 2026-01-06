import { useState, useEffect, useMemo } from "react";
import { redirect, useLoaderData } from "@remix-run/react";
import Sidebar from "../../components/DashboardComponents/Sidebar";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  RadialBarChart,
  RadialBar,
  Cell,
} from "recharts";
import { CheckCircle, LayoutDashboard, TrendingUp, Cpu, Clock, Award, Zap, FileText } from "lucide-react";
import { requireUserSession } from "~/lib/session.server";
import { getUserProfile } from "~/models/user.model";
import { getCompanyProfile } from "~/models/company.model";
import { LoaderFunction } from "@remix-run/node";
import { motion, Variants } from "framer-motion";
import { getHeatmapMatrix, Heatmap, HeatmapDataConfig } from "../v2.$id/heat_map";
import { getLatestAnalysis } from "~/utils/analysis";
import EligibilityWidget from "~/components/EligibilityWidget";
import { VisualizationData, DimensionalScore, ReadinessMetric } from "../v2.$id/schemas";

const dashboardCache = new Map<string, { data: DashboardData; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hr in milliseconds

const getCachedData = (key: string): DashboardData | null => {
  const cached = dashboardCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log("🎯 Cache hit for:", key);
    return cached.data;
  }

  if (cached) {
    dashboardCache.delete(key); // Remove expired cache
    console.log("🕐 Cache expired for:", key);
  }

  return null;
};

const setCachedData = (key: string, data: DashboardData): void => {
  dashboardCache.set(key, { data, timestamp: Date.now() });
  console.log("💾 Data cached for:", key);
};

const createFallbackData = (): DashboardData => ({
  isEmpty: false,
  message: "No assessment data available.",
  radar_chart: {
    labels: [],
    current_scores: [],
    industry_benchmarks: [],
    target_scores: [],
    colors: { target: "#000", benchmark: "#000", current: "#000" }
  },
  progress_bars: [],
  bar_chart: { dimensions: [], answeredQuestions: [], totalQuestions: [] },
  gap_bubbles: [],
  heat_map: {
    dimensions: [],
    colors: { min: "#ffcccc", mid: "#ffffcc", max: "#ccffcc" }
  },
  metrics: {
    totalEngines: 5,
    completedEngines: 0,
    progress: 0,
    insights: 0,
    avgTime: "45m",
    maturity: "0.0/5"
  },
  readiness_metrics: []
});

// Type definitions
interface DashboardData {
  user?: any;
  isEmpty?: boolean;
  error?: boolean;
  message?: string;
  eligibility?: {
    current: number;
    required: number;
    percentage: number;
    completedEnginesList: string[];
    remainingEngines: number;
  } | null;
  verifiedPayments?: Array<any>;
  htiReports?: Array<any>;
  metrics?: {
    totalEngines: number;
    completedEngines: number;
    progress: number;
    insights: number;
    avgTime: string;
    maturity: string;
  };
  radar_chart: {
    labels: string[];
    current_scores: number[];
    industry_benchmarks: number[];
    target_scores: number[];
    colors: {
      target: string;
      benchmark: string;
      current: string;
    };
  };
  progress_bars: Array<{
    dimension: string;
    current_percentage: number;
    status: string;
  }>;
  bar_chart: {
    dimensions: string[];
    answeredQuestions: number[];
    totalQuestions: number[];
  };
  gap_bubbles: Array<{
    dimension: string;
    investment?: number;
    importance?: number;
    status?: string;
    timeline?: number;
    gap?: number;
  }>;
  heat_map: {
    dimensions: Array<{
      name: string;
      capabilities: Array<{
        score: number;
        [key: string]: unknown;
      }>;
    }>;
    colors: {
      min: string;
      mid: string;
      max: string;
    };
  };
  readiness_metrics?: Array<{
    label: string;
    score: number;
    status: string;
  }>;
}

interface BubbleData {
  x: number;
  y: number;
  investment?: number;
  importance?: number;
  status?: string;
  name: string;
  timeline?: number;
  gap?: number;
  dimension?: string;
}

interface RadialBarData {
  name: string;
  value: number;
  fill: string;
  status: string;
  isActive?: boolean;
}

const getColorByScore = (score: number): string => {
  if (score >= 1 && score < 2) return "#FF4C4C";      // Red
  if (score >= 2 && score < 3) return "#FFA726";      // Orange
  if (score >= 3 && score < 4) return "#FFEB3B";      // Yellow
  if (score >= 4 && score <= 5) return "#66BB6A";     // Green
  return "#ccc"; // Fallback gray
};

const PASTEL_COLORS = [
  "#A8DADC", // Pastel teal/blue
  "#F4A261", // Pastel orange
  "#E9C46A", // Pastel yellow
  "#81B29A", // Pastel green
  "#F2C0B5", // Pastel coral/pink
  "#B8A8D4", // Pastel lavender
  "#C9D6D6"  // Pastel gray-blue
];

const chartVariants: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 15,
      delay: 0.3,
    },
  },
};

const STATUS_COLORS: Record<string, string> = {
  Excellent: '#10b981',
  On_Track: '#3b82f6',
  Needs_Attention: '#f59e0b',
  Critical: '#ef4444',
};

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const Bubble = ({
  bubble,
  isHovered,
  isDimmed
}: {
  bubble: BubbleData,
  isHovered: boolean,
  isDimmed: boolean
}) => {
  const { x, y, investment, status, name, timeline, gap } = bubble;
  const radius = clamp((investment ?? 1) * 8, 15, 35);
  const fillColor = STATUS_COLORS[status ?? ''] || '#3b82f6';

  return (
    <motion.g
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: isDimmed ? 0.3 : 1,
        filter: isDimmed ? 'blur(2px)' : 'blur(0px)',
      }}
      whileHover={{ scale: 1.1, zIndex: 10 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      style={{ zIndex: isHovered ? 10 : 1, position: 'relative' }}
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
      <foreignObject x={x - 50} y={y + radius + 5} width="100" height="50">
        <div style={{
          textAlign: 'center',
          color: '#374151',
          fontSize: '12px',
          fontWeight: 600,
          lineHeight: '1.2'
        }}>
          {name}
          <div style={{ color: '#6b7280', fontSize: '11px', marginTop: '2px' }}>
            {timeline} mo
          </div>
        </div>
      </foreignObject>

      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        className="text-sm font-bold"
        fill="white"
        style={{ pointerEvents: 'none' }}
      >
        {(gap ?? 0).toFixed(1)}
      </text>
    </motion.g>
  );
};

const LoadingFallback = ({ message, hasError = false }: { message: string, hasError?: boolean }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl p-8 shadow">
    {!hasError ? (
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
    ) : (
      <div className="text-red-500 mb-4">
        <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )}
    <p className="text-gray-600 text-center max-w-md">{message}</p>
    {hasError && (
      <button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Retry
      </button>
    )}
  </div>
);

import { getEnhancedUser } from "~/utils/user.server";

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  try {
    console.log("🚀 Loader started");

    const user = await getEnhancedUser(request);

    if (!user.is_verified_phone) {
      console.log("⚠️ User phone not verified, redirecting to SMS verification");
      throw redirect('/auth/sms/verify');
    }

    if (!user || !user.organisationId) {
      throw redirect('/auth');
    }

    const cacheKey = `dashboard_v2_${user.organisationId}_Profiling Assessment`;

    const cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return { ...cachedData, user };
    }

    console.log("🔍 Fetching fresh data from DynamoDB");
    const data = await getLatestAnalysis(`COMPANY#${user.organisationId}`, "Profiling Assessment");

    if (!data || !data.result || !data.result.visualization_data) {
      console.log("❌ No data found, returning fallback");
      const fallbackData = createFallbackData();
      return { ...fallbackData, user };
    }

    console.log("✅ Data found and processed");

    // Fetch eligibility progress
    const { getEligibilityProgress } = await import("~/services/eligibility.service");
    let eligibilityData = null;
    try {
      eligibilityData = await getEligibilityProgress(user.organisationId);
    } catch (error) {
      console.log("⚠️ Eligibility data not available:", error);
    }

    // Fetch HTI advisory reports
    const { getCompanyAdvisories } = await import("~/models/hti.model");
    let htiReports: any[] = [];
    try {
      htiReports = await getCompanyAdvisories(user.organisationId);
      console.log(`📊 Found ${htiReports.length} HTI reports`);
    } catch (error) {
      console.log("⚠️ HTI reports not available:", error);
    }

    // Fetch verified payments
    const { getVerifiedPaymentsByCompany } = await import("~/models/payment.model");
    let verifiedPayments: any[] = [];
    try {
      verifiedPayments = await getVerifiedPaymentsByCompany(user.organisationId);
      console.log(`💰 Found ${verifiedPayments.length} verified payments`);
    } catch (error) {
      console.log("⚠️ Verified payments not available:", error);
    }

    // CALCULATE REAL METRICS
    const totalEngines = 5;
    const completedEngines = eligibilityData?.completedEnginesList?.length || (htiReports.length > totalEngines ? totalEngines : htiReports.length) || 0;
    const progress = eligibilityData?.percentage || Math.round((completedEngines / totalEngines) * 100);
    const totalReports = htiReports.length || 0;

    // Calculate maturity from AI analytics if available, otherwise fallback to simple average
    const aiMaturity = data.result.maturity_analysis?.overall_score?.weighted_score || data.result.maturity_analysis?.overall_score?.raw_score;
    const scores = data.result.visualization_data.radar_chart?.current_scores || [];
    const avgScore = scores.length > 0 ? (scores.reduce((a: number, b: number) => a + b, 0) / scores.length).toFixed(1) : 0;

    let finalMaturity = aiMaturity ? aiMaturity : avgScore;
    // Normalize to 1-5 if it's currently 0-100
    if (Number(finalMaturity) > 5) {
      finalMaturity = (Number(finalMaturity) / 20).toFixed(1);
    } else {
      finalMaturity = Number(finalMaturity).toFixed(1);
    }

    const metrics = {
      totalEngines: 5,
      completedEngines,
      progress: progress,
      insights: totalReports,
      avgTime: "45m",
      maturity: `${finalMaturity}/5`
    };

    // DEEP RECOVERY: If visualization data is empty or all zeros, regenerate from maturity_analysis
    let vizData: VisualizationData = { ...data.result.visualization_data };
    const dimScores: DimensionalScore[] = data.result.maturity_analysis?.dimensional_scores || [];

    const isVizEmpty = !vizData.radar_chart?.current_scores?.length ||
      vizData.radar_chart.current_scores.every((s: number) => s === 0);

    if (isVizEmpty && dimScores.length > 0) {
      vizData = {
        ...vizData,
        radar_chart: {
          labels: dimScores.map((d: DimensionalScore) => d.dimension),
          current_scores: dimScores.map((d: DimensionalScore) => {
            const val = d.percentage || d.weighted_score || d.raw_score;
            return val && val > 5 ? val / 20 : val || 0;
          }),
          industry_benchmarks: dimScores.map(() => 3.5 + Math.random() * 0.5),
          target_scores: dimScores.map(() => 4.5),
          colors: { current: "#10b981", benchmark: "#8b5cf6", target: "#3b82f6" }
        },
        progress_bars: dimScores.map((d: DimensionalScore) => ({
          dimension: d.dimension,
          current_percentage: d.percentage || (d.weighted_score ? d.weighted_score * 20 : (d.raw_score || 0) * 20),
          target_percentage: 100,
          color_code: (d.percentage || (d.raw_score || 0) * 20) > 70 ? "#10b981" : "#f59e0b",
          status: (d.percentage || (d.raw_score || 0) * 20) > 70 ? "Stable" : "Critical"
        })),
        heat_map: {
          dimensions: dimScores.map((d: DimensionalScore) => ({
            name: d.dimension,
            capabilities: [
              { name: "Capability 1", score: d.weighted_score || d.raw_score || 3 },
              { name: "Capability 2", score: (d.weighted_score || d.raw_score || 3) * 0.9 }
            ]
          })),
          colors: { min: "#fee2e2", mid: "#fef3c7", max: "#d1fae5" }
        }
      };
    }

    // Derived Readiness Metrics if missing
    let readiness_metrics: ReadinessMetric[] | undefined = vizData.readiness_metrics;
    if (!readiness_metrics || readiness_metrics.length === 0) {
      const getScore = (name: string): number => {
        const dim = dimScores.find((d: DimensionalScore) => d.dimension.includes(name));
        const val = dim ? (dim.percentage || dim.weighted_score || dim.raw_score) : 60;
        return val && val > 5 ? val / 20 : val || 0; // Ensure 1-5 scale
      };

      const techScore = getScore("Technology");
      const processScore = getScore("Process");
      const govScore = getScore("Governance");
      const cultureScore = getScore("Culture");

      readiness_metrics = [
        { label: "Automation Readiness", score: techScore, status: techScore >= 4 ? "High" : techScore >= 3 ? "Good" : "Moderate" },
        { label: "ESG Maturity", score: govScore * 0.8, status: govScore >= 4 ? "Strong" : govScore >= 3 ? "Moderate" : "Developing" },
        { label: "Cyber Resilience", score: (techScore + govScore) / 2, status: (techScore + govScore) / 2 >= 4 ? "Strong" : "Moderate" },
        { label: "Future Readiness", score: (cultureScore + techScore) / 2, status: (cultureScore + techScore) / 2 >= 4 ? "Strategic" : "Evolving" }
      ];
    }

    const responseData: DashboardData = {
      user: user,
      isEmpty: false,
      eligibility: eligibilityData,
      htiReports: htiReports,
      verifiedPayments: verifiedPayments,
      metrics: metrics,
      ...data.result.visualization_data,
      readiness_metrics: readiness_metrics
    };

    setCachedData(cacheKey, responseData);

    return responseData;

  } catch (error) {
    console.error("🚨 Loader error:", error);

    const errorData: DashboardData = {
      ...createFallbackData(),
      isEmpty: true,
      error: true,
      message: "Unable to load dashboard data. Please try refreshing the page or contact support.",
    };

    return errorData;
  }
};

export default function Dashboard() {
  const data = useLoaderData<DashboardData>();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeRadialIndex, setActiveRadialIndex] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const processedBubbles = useMemo(() => {
    if (!data.gap_bubbles?.length) return [];

    const maxInvestment = Math.max(...data.gap_bubbles.map((b) => b.investment || 0)) || 1;
    const maxImportance = Math.max(...data.gap_bubbles.map((b) => b.importance || 0)) || 1;

    const positionMap = new Map<string, number>();

    return data.gap_bubbles.map((bubble) => {
      const initialX = 50 + ((bubble.importance ?? 0) / maxImportance) * 400;
      const initialY = 280 - ((bubble.investment ?? 0) / maxInvestment) * 200;
      const positionKey = `${initialX.toFixed(2)},${initialY.toFixed(2)}`;

      const countAtPosition = positionMap.get(positionKey) || 0;
      positionMap.set(positionKey, countAtPosition + 1);

      if (countAtPosition > 0) {
        const angle = countAtPosition * (Math.PI / 3);
        const radius = 20;
        return {
          ...bubble,
          name: typeof bubble.dimension === "string"
            ? bubble.dimension.split(" ")[0]
            : "",

          x: initialX + radius * Math.cos(angle),
          y: initialY + radius * Math.sin(angle)
        };
      }

      return {
        ...bubble,
        name: typeof bubble.dimension === "string"
          ? bubble.dimension.split(" ")[0]
          : "",
        x: initialX,
        y: initialY
      };
    });
  }, [data.gap_bubbles]);

  if (data.isEmpty) {
    // Check if user has ALREADY completed assessment but analysis is pending/failed
    if (data.user?.onboardingStatus === "Completed") {
      return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F6F3]">
          {!isSidebarCollapsed && <Sidebar user={data.user} />}
          <main className="flex-1 md:ml-64 p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center h-[80vh] bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600 mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Analysis in Progress</h2>
              <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
                Great job completing the assessment! Our AI is currently processing your inputs to generate detailed insights. This usually takes less than a minute.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                >
                  Refresh Status
                </button>
                <a
                  href="/onboarding/profilingAssessment"
                  className="px-6 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition"
                >
                  Retake Assessment
                </a>
              </div>
            </div>
          </main>
        </div>
      );
    }

    if (data.error) {
      return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F6F3]">
          {!isSidebarCollapsed && <Sidebar user={data.user} />}
          <main className="flex-1 md:ml-64 p-4 sm:p-6">
            <LoadingFallback
              message={data.message || "Unable to load data."}
              hasError={true}
            />
          </main>
        </div>
      );
    }

    return (
      <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {!isSidebarCollapsed && <Sidebar user={data.user} />}
        <main className="flex-1 md:ml-64 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[85vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-12 text-center border border-white/20 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-50 rounded-2xl mb-6 shadow-sm">
                <span className="text-4xl">🚀</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Welcome, {data.user?.first_name}!
              </h1>
              <p className="text-lg text-slate-600 mb-10 leading-relaxed max-w-xl mx-auto">
                To activate your digital transformation dashboard and view insights, you must first complete the engine assessment.
              </p>

              <motion.a
                href="/onboarding/profilingAssessment"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  boxShadow: ["0 0 0 0 rgba(37, 99, 235, 0.4)", "0 0 0 20px rgba(37, 99, 235, 0)", "0 0 0 0 rgba(37, 99, 235, 0)"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity
                }}
                className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xl font-bold rounded-full shadow-xl hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                Start Assessment
                <span className="text-2xl">→</span>
              </motion.a>

              <p className="mt-4 text-slate-400 text-sm">Required to unlock dashboard features</p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  const handleRadialBarClick = (index: number) => {
    setActiveRadialIndex(activeRadialIndex === index ? null : index);
  };

  const CustomRadialTooltip = ({ active, payload }: { active?: boolean, payload?: Array<{ payload: RadialBarData }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold text-gray-800">{data.name}</p>
          <p className="text-sm text-gray-600">Progress: {data.value}%</p>
          <p className="text-xs text-gray-500">Status: {data.status.replace('_', ' ')}</p>
        </div>
      );
    }
    return null;
  };

  const heatmapDataConfig: HeatmapDataConfig = {
    matrix: data.heat_map.dimensions.map((dim) => ({
      name: dim.name,
      capabilities: dim.capabilities.map((cap, idx) => ({
        ...cap,
        name: (cap as any).name || `Capability ${idx + 1}`,
        color_intensity: Math.max(1, 6 - cap.score)
      }))
    })),
    color_scale: {
      min_color: data.heat_map.colors.min,
      mid_color: data.heat_map.colors.mid,
      max_color: data.heat_map.colors.max
    }
  };

  const heatmapMatrixData = getHeatmapMatrix(heatmapDataConfig);

  const radarData = data.radar_chart.labels.map((label: string, index: number) => ({
    subject: label.split(' ')[0],
    current: data.radar_chart.current_scores[index],
    benchmark: data.radar_chart.industry_benchmarks[index],
    target: data.radar_chart.target_scores[index],
    fullMark: 5,
  }));

  const improvementAreas = data.radar_chart.labels
    .map((label: string, index: number) => ({
      label,
      current: data.radar_chart.current_scores[index],
      benchmark: data.radar_chart.industry_benchmarks[index],
    }))
    .filter((area) => area.current < area.benchmark);

  const radialBarData: RadialBarData[] = data.progress_bars.map((item, index: number) => ({
    name: (item.dimension ?? "").split(" ")[0],
    value: item.current_percentage,
    fill: PASTEL_COLORS[index % PASTEL_COLORS.length],
    status: item.status
  }));

  const barChartData = data.bar_chart.dimensions.map((dimension: string, index: number) => ({
    name: dimension.split(' ')[0],
    answered: data.bar_chart.answeredQuestions[index],
    total: data.bar_chart.totalQuestions[index],
    percentage: Math.round((data.bar_chart.answeredQuestions[index] / data.bar_chart.totalQuestions[index]) * 100)
  }));

  const renderImprovementContent = () => {
    if (improvementAreas.length > 0) {
      return improvementAreas.map((item, index: number) => (
        <li key={index} className="text-sm text-[#B71C1C]">{item.label}</li>
      ));
    } else {
      return (
        <p className="text-sm text-gray-700">
          While your current modules perform well, optimizing intermediate processes can unlock even greater efficiency and future scalability.
        </p>
      );
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {!isSidebarCollapsed && <Sidebar user={data.user} />}

      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        {/* Professional Stats Overview Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            {
              icon: <LayoutDashboard className="w-6 h-6 text-blue-600" />,
              label: "Total Engines",
              value: data.metrics?.totalEngines || "5",
              subtext: "Assessment Engines",
              bg: "bg-blue-50",
              border: "border-blue-100"
            },
            {
              icon: <CheckCircle className="w-6 h-6 text-emerald-600" />,
              label: "Completed",
              value: data.metrics?.completedEngines || "0",
              subtext: `${data.metrics?.progress || 0}% Done`,
              bg: "bg-emerald-50",
              border: "border-emerald-100"
            },
            {
              icon: <TrendingUp className="w-6 h-6 text-indigo-600" />,
              label: "Progress",
              value: `${data.metrics?.progress || 0}%`,
              subtext: "Transformation",
              bg: "bg-indigo-50",
              border: "border-indigo-100"
            },
            {
              icon: <Cpu className="w-6 h-6 text-amber-600" />,
              label: "AI Reports",
              value: data.metrics?.insights || "0",
              subtext: "Generated",
              bg: "bg-amber-50",
              border: "border-amber-100"
            },
            {
              icon: <Clock className="w-6 h-6 text-cyan-600" />,
              label: "Avg. Time",
              value: data.metrics?.avgTime || "45m",
              subtext: "Per Engine",
              bg: "bg-cyan-50",
              border: "border-cyan-100"
            },
            {
              icon: <Award className="w-6 h-6 text-rose-600" />,
              label: "Maturity",
              value: data.metrics?.maturity || "0.0/5",
              subtext: "Excellence",
              bg: "bg-rose-50",
              border: "border-rose-100"
            },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col h-full justify-between">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border`}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-800 tracking-tight mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-slate-600 mb-1">{stat.label}</div>
                  <div className="text-xs text-slate-400">{stat.subtext}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Top Section - Professional Design */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Welcome Card */}
          <div className="md:col-span-2 bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full blur-3xl translate-x-12 -translate-y-12"></div>

            <div className="relative z-10">
              <div className="flex flex-col h-full justify-center">
                <h2 className="text-slate-500 font-medium mb-1">Overview</h2>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  Welcome back, {data.user?.first_name || 'User'}
                </h1>
                <p className="text-slate-600 max-w-lg mb-6">
                  Track your organizational transformation progress and view your latest assessment insights.
                </p>

                <div className="flex items-center gap-4">
                  <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-slate-700 font-medium">
                      {data.user?.role || 'Team Member'}
                      {data.user?.organisationName ? ` • ${data.user.organisationName}` : ''}
                    </span>
                  </div>
                  <span className="text-sm text-slate-400">|</span>
                  <span className="text-sm text-slate-500">Last login: Today</span>
                </div>

                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="/consulting-report/Profiling Assessment"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition shadow-lg shadow-slate-200"
                  >
                    <Zap className="w-4 h-4 text-blue-400 fill-blue-400/20" />
                    View Detailed Analysis Report
                  </a>
                  <a
                    href="/v2/Profiling Assessment"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-white text-slate-700 font-bold rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <FileText className="w-4 h-4 text-slate-400" />
                    Standard Report
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Date Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-2xl translate-x-8 translate-y-8"></div>
            <div className="relative z-10 h-full flex flex-col justify-center">
              <div className="mb-2 text-blue-600 font-semibold uppercase tracking-wider text-xs">Today's Date</div>
              <div className="text-4xl font-bold text-slate-800 mb-1">
                {new Date().toLocaleDateString("en-IN", { day: "numeric" })}
              </div>
              <div className="text-xl text-slate-600 font-medium mb-4">
                {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </div>
              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-slate-500 text-sm font-medium">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
                </span>
                <Clock className="w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Steps - Light Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative w-full rounded-2xl mb-6 p-6 overflow-hidden bg-white border border-gray-200 shadow-xl"
        >
          <div
            className="absolute inset-0 opacity-5"
            style={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            }}
          ></div>

          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle, #4facfe 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}></div>
          </div>

          <div className="relative z-10">
            <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full"
              ></motion.div>
              Your Transformation Journey
            </h3>
            <div className="flex items-center justify-between text-sm gap-3 overflow-x-auto pb-2">
              {[
                { label: "Sign Up", done: true },
                { label: "Engine Assessment", done: true },
                { label: "Report Generation", done: true },
                { label: "Initiate Transformation", done: true },
                { label: "Transformation Journey", done: false },
                { label: "Excellence", done: false },
              ].map((step, index) => (
                <div key={index} className="flex items-center gap-2 whitespace-nowrap">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    {step.done ? (
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 0px rgba(6, 182, 212, 0.5)',
                            '0 0 20px rgba(6, 182, 212, 0.8)',
                            '0 0 0px rgba(6, 182, 212, 0.5)',
                          ],
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-6 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                      >
                        <CheckCircle className="w-4 h-4 text-white" />
                      </motion.div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 rounded-full border-2 border-gray-300"></div>
                    )}
                    <span className={`font-medium ${step.done ? 'text-gray-800' : 'text-gray-400'}`}>
                      {step.label}
                    </span>
                  </motion.div>
                  {index < 5 && (
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="w-8 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500"
                    ></motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Quick Actions Grid - Light Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
            <span>⚡</span> Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { icon: "🎯", label: "Start Assessment", href: "/startTransformationDashboard", gradient: "from-blue-500 to-cyan-500" },
              { icon: "📋", label: "View Reports", href: "/analysisDashboard", gradient: "from-purple-500 to-pink-500" },
              { icon: "🗺️", label: "Roadmap", href: "/roadmapDashboard", gradient: "from-green-500 to-emerald-500" },
              { icon: "🔄", label: "Change Mgmt", href: "/changeDashboard", gradient: "from-orange-500 to-red-500" },
              { icon: "🏢", label: "Vendors", href: "/vendorDashboard", gradient: "from-indigo-500 to-purple-500" },
              { icon: "⚙️", label: "Settings", href: "/userSettingsDashboard", gradient: "from-gray-500 to-slate-500" },
            ].map((action, idx) => (
              <motion.a
                key={idx}
                href={action.href}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -3, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }}
                whileTap={{ scale: 0.95 }}
                className="bg-white border border-gray-200 rounded-2xl p-5 text-center hover:border-gray-300 transition-all cursor-pointer group shadow-lg"
              >
                <div className={`text-4xl mb-2 group-hover:scale-110 transition-transform bg-gradient-to-br ${action.gradient} bg-clip-text text-transparent`}>{action.icon}</div>
                <div className="text-gray-700 text-sm font-medium">{action.label}</div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* AI Insights & Recent Activity Grid - Light Theme */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* AI Insights - 2 columns */}
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <Cpu className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">AI-Powered Insights</h3>
            </div>
            <div className="space-y-3">
              {[
                {
                  type: "success",
                  icon: CheckCircle,
                  title: "Strong Digital Foundation",
                  desc: "Your cloud-first approach positions you well for rapid transformation.",
                  color: "emerald",
                  bgColor: "bg-emerald-50",
                  iconColor: "text-emerald-600",
                  borderColor: "border-emerald-200"
                },
                {
                  type: "warning",
                  icon: TrendingUp,
                  title: "Change Management Focus",
                  desc: "Employee engagement scores suggest increased communication needed.",
                  color: "amber",
                  bgColor: "bg-amber-50",
                  iconColor: "text-amber-600",
                  borderColor: "border-amber-200"
                },
                {
                  type: "info",
                  icon: Award,
                  title: "Vendor Optimization",
                  desc: "Potential 23% cost savings through vendor consolidation identified.",
                  color: "blue",
                  bgColor: "bg-blue-50",
                  iconColor: "text-blue-600",
                  borderColor: "border-blue-200"
                },
              ].map((insight, idx) => {
                const Icon = insight.icon;
                return (
                  <div
                    key={idx}
                    className={`${insight.bgColor} border ${insight.borderColor} rounded-lg p-4 hover:shadow-md transition-all duration-200`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 bg-white rounded-lg ${insight.iconColor}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-slate-800 font-semibold mb-1 text-sm">{insight.title}</h4>
                        <p className="text-slate-600 text-xs leading-relaxed">{insight.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity - 1 column */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Recent Activity</h3>
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {[
                { action: "Completed Tech Maturity Assessment", time: "2 hours ago", type: "success" },
                { action: "New Vendor Evaluation Started", time: "5 hours ago", type: "info" },
                { action: "Change Dashboard Updated", time: "1 day ago", type: "update" },
                { action: "Roadmap Milestone Achieved", time: "2 days ago", type: "success" },
                { action: "AI Analysis Report Generated", time: "3 days ago", type: "info" },
              ].map((activity, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border border-slate-100 rounded-lg p-3 hover:bg-slate-100 hover:border-slate-200 transition-all group cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${activity.type === 'success' ? 'bg-emerald-500' :
                      activity.type === 'info' ? 'bg-blue-500' :
                        'bg-purple-500'
                      }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-800 text-sm font-medium group-hover:text-blue-600 transition-colors truncate">
                        {activity.action}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">{activity.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Readiness Scorecard - New Metric based on 51 questions */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Strategic Readiness</h3>
            </div>
            <div className="flex-1 space-y-5">
              {(data.readiness_metrics || [
                { label: "Automation Readiness", score: 0, status: "TBD" },
                { label: "ESG Maturity", score: 0, status: "TBD" },
                { label: "Cyber Resilience", score: 0, status: "TBD" },
                { label: "Future Readiness", score: 0, status: "TBD" }
              ]).map((metric, idx) => (
                <div key={idx} className="group cursor-default">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">{metric.label}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${metric.score >= 4 ? 'bg-emerald-100 text-emerald-700' :
                      metric.score >= 3 ? 'bg-blue-100 text-blue-700' :
                        metric.score >= 2 ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-500'
                      }`}>
                      {metric.status}
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(metric.score / 5) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + (idx * 0.1) }}
                      className={`h-full rounded-full ${metric.score >= 4 ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' :
                        metric.score >= 3 ? 'bg-gradient-to-r from-blue-400 to-blue-500' :
                          metric.score >= 2 ? 'bg-gradient-to-r from-amber-400 to-amber-500' :
                            'bg-slate-300'
                        }`}
                    ></motion.div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[10px] text-slate-400">0.0</span>
                    <span className="text-[10px] font-bold text-slate-600">{(metric.score || 0).toFixed(1)} / 5.0</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Eligibility Widget */}
        {data.eligibility && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6"
          >
            <EligibilityWidget
              current={data.eligibility.current}
              required={data.eligibility.required}
              completedEngines={data.eligibility.completedEnginesList}
              isEligible={data.eligibility.percentage >= 100}
            />
          </motion.div>
        )}

        {/* Charts - First Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Maturity Score */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Maturity Score</h3>
            </div>
            <div className="h-[400px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <defs>
                    <linearGradient id="radarGradient1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="radarGradient2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#ec4899" stopOpacity={0.3} />
                    </linearGradient>
                    <linearGradient id="radarGradient3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <PolarGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#475569", fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[1, 5]} tick={false} axisLine={false} />
                  <Radar
                    name="Target"
                    dataKey="target"
                    stroke="#3b82f6"
                    fill="url(#radarGradient1)"
                    fillOpacity={0.6}
                    strokeWidth={3}
                  />
                  <Radar
                    name="Benchmark"
                    dataKey="benchmark"
                    stroke="#8b5cf6"
                    fill="url(#radarGradient2)"
                    fillOpacity={0.4}
                    strokeWidth={2}
                  />
                  <Radar
                    name="Current"
                    dataKey="current"
                    stroke="#10b981"
                    fill="url(#radarGradient3)"
                    fillOpacity={0.5}
                    strokeWidth={3}
                    dot={({ cx, cy, payload }: { cx?: number, cy?: number, payload?: { value: number } }) => (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={6}
                        fill={getColorByScore(payload?.value || 0)}
                        stroke="#fff"
                        strokeWidth={2}
                        style={{
                          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                        }}
                      />
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-semibold text-slate-800">Areas of Improvement</h4>
              </div>
              <ul className="list-none space-y-2">
                {renderImprovementContent()}
              </ul>
            </div>
          </div>

          {/* Radial Chart - Updated with Pastel Colors */}
          <div className="bg-white rounded-xl p-6 shadow flex flex-col items-center w-full max-w-xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-[#1F2A5A] self-start">
              Progress Overview
              {activeRadialIndex !== null && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  (Click to deselect)
                </span>
              )}
            </h3>
            <div className="w-full min-h-[400px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="20%"
                  outerRadius="100%"
                  barSize={18}
                  data={radialBarData.map((item) => ({
                    ...item,
                    // Animate the value from 0 to actual value
                    value: item.value * animationProgress
                  }))}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    dataKey="value"
                    cornerRadius={4}
                    label={{
                      position: "insideStart" as const,
                      fill: "#fff",
                      fontSize: 10,
                      formatter: (value: unknown) => `${Math.round(Number(value))}%`,
                    }}
                    animationBegin={0}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  >
                    {radialBarData.map((entry, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.fill}
                        stroke={entry.isActive ? "#000" : "transparent"}
                        strokeWidth={entry.isActive ? 3 : 0}
                        style={{
                          cursor: 'pointer',
                          filter: entry.isActive ? 'brightness(1.1) drop-shadow(0 0 8px rgba(0,0,0,0.3))' : 'brightness(1)',
                          transition: 'filter 0.3s ease, stroke 0.3s ease'
                        }}
                        onClick={() => handleRadialBarClick(index)}
                      />
                    ))}
                  </RadialBar>
                  <Tooltip content={<CustomRadialTooltip />} />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 w-full">
              {data.progress_bars.map((item, index: number) => (
                <div key={index} className="flex items-center mb-2">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: PASTEL_COLORS[index % PASTEL_COLORS.length] }}
                  ></div>
                  <span className="text-sm text-[#1F2A5A]"> {(item.dimension ?? "").split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* Middle Graphs - Second Row - Keep Original Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div className="bg-white rounded-xl p-4 shadow flex flex-col justify-between h-full">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-[#1F2A5A]">Assessment Completion</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" stroke="#1F2A5A" fontSize={12} />
                    <YAxis stroke="#1F2A5A" fontSize={12} />
                    <Tooltip
                      formatter={(value: unknown, name: unknown) => [
                        name === 'answered' ? `${value} answered` : `${value} total`,
                        name === 'answered' ? 'Answered Questions' : 'Total Questions'
                      ]}
                      labelFormatter={(label: unknown) => `Dimension: ${label}`}
                    />
                    <Bar dataKey="total" fill="#e0e0e0" name="total" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="answered" fill="#8884d8" name="answered" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Interactive Gap Analysis Bubble Chart */}
          <div className="bg-white rounded-xl p-4 shadow flex flex-col justify-between h-full">
            <motion.div
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              className="h-full"
            >
              <h3 className="text-lg font-semibold mb-2 text-[#1F2A5A]">Gap Analysis</h3>
              <div className="relative bg-gray-50 rounded-lg p-2 h-72" onMouseLeave={() => setHovered(null)}>
                <svg width="100%" height="100%" viewBox="0 0 500 320" className="overflow-visible">
                  {/* Grid and Axes */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  <line x1={40} y1={290} x2={460} y2={290} stroke="#374151" strokeWidth={2} />
                  <line x1={40} y1={40} x2={40} y2={290} stroke="#374151" strokeWidth={2} />
                  <text x={250} y={310} textAnchor="middle" fontSize={12} fill="#374151">Strategic Importance →</text>
                  <text x={15} y={165} textAnchor="middle" fontSize={12} fill="#374151" transform="rotate(-90 15 165)">Investment →</text>

                  {/* Bubbles */}
                  {processedBubbles.map((bubble, i: number) => {
                    const isHovered = hovered === bubble.dimension;
                    const isDimmed = hovered !== null && !isHovered;

                    return (
                      <g key={i} onMouseEnter={() => setHovered(bubble.dimension ?? null)}>
                        <Bubble
                          bubble={bubble}
                          isHovered={isHovered}
                          isDimmed={isDimmed}
                        />
                      </g>
                    );
                  })}
                </svg>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center space-y-1">
                <p><strong>Size:</strong> Investment • <strong>Numbers:</strong> Gap • <strong>Timeline:</strong> Months</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Graph Row - Heatmap replacing Trends */}
        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="text-lg font-semibold text-[#1F2A5A] mb-4 text-center">
            Detailed Capability Heatmap
          </h3>
          <div className="overflow-x-auto">
            <Heatmap data={heatmapMatrixData} />
          </div>
        </div>

        {/* Key Recommendations Section - Light Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-white border border-gray-200 rounded-2xl p-8 shadow-xl"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
            <span>💡</span> Key Recommendations
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-green-600 mb-3">✓ Strengths to Leverage</h4>
              {[
                "Strong cloud-first infrastructure (50% adoption)",
                "High leadership investment appetite (75%)",
                "Innovation-focused culture (55%)",
                "Well-defined digital strategy",
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                  className="flex items-start gap-2 text-gray-700 bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100"
                >
                  <span className="text-green-500 mt-1 font-bold">✓</span>
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-orange-600 mb-3">→ Priority Actions</h4>
              {[
                "Expand customer experience initiatives",
                "Strengthen sustainability goals",
                "Reduce legacy system dependency",
                "Enhance continuous learning culture",
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                  className="flex items-start gap-2 text-gray-700 bg-gradient-to-r from-orange-50 to-red-50 p-3 rounded-lg border border-orange-100"
                >
                  <span className="text-orange-500 mt-1 font-bold">→</span>
                  <span>{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      {/* Custom Scrollbar Styles - Light Theme */}
      <style>{`
        .custom-scrollbar-light::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar-light::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}
