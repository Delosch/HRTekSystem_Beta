import { useState, useEffect, useMemo } from "react";
import { redirect, useLoaderData, useRevalidator, Link } from "@remix-run/react";
import Sidebar from "../../components/DashboardComponents/Sidebar";
import { useNavigate } from "@remix-run/react";
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
import { getUserProfile } from "~/models/user.model.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { LoaderFunction } from "@remix-run/node";
import { motion, Variants } from "framer-motion";
import { getHeatmapMatrix, Heatmap, HeatmapDataConfig } from "../v2.$id/heat_map";
import { getLatestAnalysis, getAllAnalysesForCompany } from "~/utils/analysis.server";
import EligibilityWidget from "~/components/EligibilityWidget";
import { VisualizationData, DimensionalScore, ReadinessMetric } from "../v2.$id/schemas";
import { getAIStatus, setAIStatus } from "~/services/ai-status.server";
import { generate } from "~/lib/digitalMaturity.genAi";
import { getEligibilityProgress } from "~/services/eligibility.service.server";
import { getCompanyAdvisories } from "~/models/hti.model.server";
import { getVerifiedPaymentsByCompany } from "~/models/payment.model.server";



const createFallbackData = (): DashboardData => ({
  isEmpty: true,
  message: "No assessment data available. Please complete an assessment first.",
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
      capabilities: Array<any>;
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

    const orgId = user.organisationId;


    console.log("🔍 Fetching fresh data from DynamoDB (Parallel)");

    // FETCH EVERYTHING CONCURRENTLY
    const [data, eligibilityData, htiReports, verifiedPayments, status, allAnalyses] = await Promise.all([
      getLatestAnalysis(`COMPANY#${orgId}`, "Profiling Assessment"),
      getEligibilityProgress(orgId).catch(err => {
        console.log("⚠️ Eligibility data fetch failed:", err);
        return null;
      }),
      getCompanyAdvisories(orgId).catch(err => {
        console.log("⚠️ HTI reports fetch failed:", err);
        return [];
      }),
      getVerifiedPaymentsByCompany(orgId).catch(err => {
        console.log("⚠️ Verified payments fetch failed:", err);
        return [];
      }),
      Promise.resolve(getAIStatus(orgId)),
      getAllAnalysesForCompany(orgId).catch(err => {
        console.log("⚠️ All analyses fetch failed:", err);
        return [];
      })
    ]);

    if (!data || !data.result || !data.result.visualization_data) {
      console.log("❌ No data found, returning fallback");

      if (user.onboardingStatus === "Completed") {
        console.log(`[Dashboard] Current AI Status: ${status}`);

        if (!status || status === 'error' || status === 'ready') {
          console.log("⚠️ Analysis missing for completed user (Status: " + status + "). Triggering regeneration...");
          setAIStatus(orgId, 'pending');

          // Fire and forget generation
          generate("digital_maturity", "Profiling Assessment", orgId).catch(e => {
            console.error("🚨 Dashboard generation trigger failed:", e);
            setAIStatus(orgId, 'error');
          });
        }
      }

      const fallbackData = createFallbackData();
      return { ...fallbackData, user };
    }

    console.log("✅ Data found and processed");

    // CALCULATE REAL METRICS WITH CLEAR DISTINCTION
    const totalEnginesAvailable = 5;

    // Completed Engines = Assessments user has finished (progress = 100)
    const completedEngines = eligibilityData?.completedCount || 0;

    // AI Reports = Actual analysis records stored in DB
    const uniqueAnalyses = new Set(allAnalyses.map((a: any) => a.section));
    const aiInsightCount = uniqueAnalyses.size || 0;

    // Transformation Progress = Based on PAID engines (for eligibility)
    const transformationProgress = eligibilityData?.percentage || 0;

    console.log(`📊 Metrics Calculated:`, {
      completedEngines,
      aiInsightCount,
      transformationProgress,
      totalEnginesAvailable
    });

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
      totalEngines: totalEnginesAvailable,
      completedEngines,
      progress: transformationProgress,
      insights: aiInsightCount,
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
      ...vizData,
      bar_chart: {
        ...vizData.bar_chart,
        totalQuestions: Array.isArray(vizData.bar_chart.totalQuestions)
          ? vizData.bar_chart.totalQuestions
          : vizData.bar_chart.dimensions.map(() => vizData.bar_chart.totalQuestions as unknown as number)
      },
      readiness_metrics: readiness_metrics
    };

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
  const navigate = useNavigate();
  const data = useLoaderData<DashboardData>();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [activeRadialIndex, setActiveRadialIndex] = useState<number | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(1);
    }, 100);
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
      const revalidator = useRevalidator();

      useEffect(() => {
        const interval = setInterval(() => {
          console.log("🔄 Checking for analysis results...");
          revalidator.revalidate();
        }, 5000);
        return () => clearInterval(interval);
      }, [revalidator]);

      return (
        <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F6F3]">
          {!isSidebarCollapsed && <Sidebar user={data.user} />}
          <main className="flex-1 md:ml-64 p-4 sm:p-6">
            <div className="flex flex-col items-center justify-center h-[80vh] bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-100 border-t-blue-600 mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Analysis in Progress</h2>
              <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
                Great job completing the assessment! Our AI is currently processing your inputs to generate detailed insights.
                <br /><span className="text-sm text-blue-600 font-medium">Auto-refreshing every 5 seconds...</span>
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => revalidator.revalidate()}
                  className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
                >
                  Refresh Now
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
              className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-1 h-full ${stat.bg.replace('bg-', 'bg-').replace('-50', '-500')}`}></div>
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.border} border shadow-inner`}>
                    {stat.icon}
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.subtext.split(' ')[0]}</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-slate-900 tracking-tighter mb-1 font-outfit">
                    {stat.value}
                  </div>
                  <div className="text-sm font-bold text-slate-500 uppercase tracking-tight">{stat.label}</div>
                  <div className="mt-2 h-1 w-full bg-slate-50 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "60%" }}
                      transition={{ duration: 1, delay: idx * 0.1 }}
                      className={`h-full ${stat.bg.replace('bg-', 'bg-').replace('-50', '-500')}`}
                    ></motion.div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Top Section - Professional Design */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Welcome Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50 rounded-full blur-[100px] -translate-x-12 -translate-y-24 group-hover:bg-indigo-50 transition-colors duration-700"></div>
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-50 rounded-full blur-[80px] opacity-60"></div>

            <div className="relative z-10">
              <div className="flex flex-col h-full justify-center">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  <Zap className="w-3 h-3 fill-current" />
                  Dashboard Overview
                </div>

                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">
                  Welcome back, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{data.user?.first_name || 'User'}</span>
                </h1>

                <p className="text-slate-500 max-w-lg mb-8 text-lg font-medium leading-relaxed">
                  Track your organizational transformation progress and view your latest assessment insights.
                </p>

                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg">
                      {data.user?.first_name?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-slate-900">
                        {data.user?.role || 'Founder & CEO'}
                        {data.user?.organisationName ? ` • ${data.user.organisationName}` : ' • Techninova'}
                      </div>
                      <div className="text-xs text-slate-400 font-medium">Verified Account</div>
                    </div>
                  </div>

                  <div className="h-8 w-[1px] bg-slate-200 hidden sm:block"></div>

                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Last login: Today</span>
                  </div>
                </div>

                <div className="mt-10 flex flex-wrap gap-4">
                  <a
                    href="/consulting-report/Profiling Assessment"
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200 hover:-translate-y-1 active:translate-y-0"
                  >
                    <Zap className="w-5 h-5 text-blue-400 fill-blue-400/20" />
                    View Detailed Analysis Report
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Date Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <LayoutDashboard className="w-24 h-24 rotate-12" />
            </div>

            <div className="relative z-10">
              <div className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-6 flex items-center gap-2">
                <div className="w-4 h-[2px] bg-blue-600"></div>
                Today's Date
              </div>

              <div className="relative">
                <div className="text-7xl font-black text-slate-900 mb-1 tracking-tighter">
                  {new Date().toLocaleDateString("en-IN", { day: "numeric" })}
                </div>
                <div className="text-2xl text-slate-500 font-bold tracking-tight">
                  {new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-slate-900 text-lg font-black tracking-tight">
                  {new Date().toLocaleDateString("en-IN", { weekday: "long" })}
                </span>
                <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">Business Day</span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                <Clock className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Progress Steps - Modern Design */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative w-full rounded-3xl mb-8 p-8 overflow-hidden bg-white border border-slate-100 shadow-xl"
        >
          <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                Your Transformation Journey
              </h3>
              <div className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                Phase 1: Foundation
              </div>
            </div>

            <div className="relative">
              {/* Connection Line */}
              <div className="absolute top-[18px] left-0 w-full h-[2px] bg-slate-100 -z-0"></div>

              <div className="flex items-start justify-between relative z-10 overflow-x-auto pb-4 custom-scrollbar-light">
                {[
                  { label: "Sign Up", done: true, icon: <CheckCircle className="w-4 h-4" /> },
                  { label: "Assessment", done: true, icon: <FileText className="w-4 h-4" /> },
                  { label: "Reports", done: true, icon: <LayoutDashboard className="w-4 h-4" /> },
                  { label: "Initiation", done: true, icon: <Zap className="w-4 h-4" /> },
                  { label: "Transformation", done: false, icon: <TrendingUp className="w-4 h-4" /> },
                  { label: "Excellence", done: false, icon: <Award className="w-4 h-4" /> },
                ].map((step, index) => (
                  <div key={index} className="flex flex-col items-center gap-4 min-w-[120px]">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-all duration-300 ${step.done
                        ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                        : 'bg-white border-2 border-slate-100 text-slate-300'
                        }`}
                    >
                      {step.icon}
                    </motion.div>
                    <div className="text-center">
                      <div className={`text-xs font-black uppercase tracking-tighter mb-1 ${step.done ? 'text-slate-900' : 'text-slate-400'}`}>
                        {step.label}
                      </div>
                      <div className={`text-[10px] font-bold ${step.done ? 'text-blue-600' : 'text-slate-300'}`}>
                        {step.done ? 'COMPLETED' : 'PENDING'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Professional Quick Actions Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h3 className="text-xl font-black text-slate-900 tracking-tighter mb-6 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            Strategic Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {[
              { icon: <TrendingUp className="w-6 h-6" />, label: "Start Assessment", href: "/startTransformationDashboard", gradient: "from-blue-600 to-cyan-500", shadow: "shadow-blue-100" },
              { icon: <FileText className="w-6 h-6" />, label: "View Reports", href: "/analysisDashboard", gradient: "from-purple-600 to-pink-500", shadow: "shadow-purple-100" },
              { icon: <Award className="w-6 h-6" />, label: "Roadmap", href: "/roadmapDashboard", gradient: "from-emerald-600 to-green-500", shadow: "shadow-emerald-100" },
              { icon: <Clock className="w-6 h-6" />, label: "Change Mgmt", href: "/changeDashboard", gradient: "from-orange-600 to-red-500", shadow: "shadow-orange-100" },
              { icon: <Cpu className="w-6 h-6" />, label: "Vendors", href: "/vendorDashboard", gradient: "from-indigo-600 to-purple-500", shadow: "shadow-indigo-100" },
              { icon: <LayoutDashboard className="w-6 h-6" />, label: "Settings", href: "/userSettingsDashboard", gradient: "from-slate-600 to-gray-500", shadow: "shadow-slate-100" },
            ].map((action, idx) => (
              <motion.a
                key={idx}
                href={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.03 }}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group bg-white border border-slate-100 rounded-3xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-xl shadow-slate-100 hover:shadow-2xl hover:shadow-slate-200 cursor-pointer overflow-hidden relative"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center text-white mb-4 shadow-lg ${action.shadow} group-hover:scale-110 transition-transform duration-500`}>
                  {action.icon}
                </div>

                <div className="text-slate-900 text-sm font-black tracking-tight group-hover:text-blue-600 transition-colors">
                  {action.label}
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* AI Insights & Recent Activity Grid - Premium Polishing */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* AI Insights - 2 columns */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-[100px] -translate-x-12 -translate-y-12 opacity-50"></div>

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-50 rounded-xl">
                    <Cpu className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">AI-Powered Strategic Insights</h3>
                </div>
                <div className="text-[10px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-3 py-1 rounded-full">
                  Real-time Analysis
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Cloud Potential",
                    desc: "Your current infrastructure shows 85% readiness for further cloud scaling.",
                    icon: <CheckCircle className="w-5 h-5" />,
                    color: "emerald",
                    gradient: "from-emerald-500 to-teal-600"
                  },
                  {
                    title: "Team Alignment",
                    desc: "Engagement metrics indicate 92% readiness for the upcoming digital shift.",
                    icon: <TrendingUp className="w-5 h-5" />,
                    color: "blue",
                    gradient: "from-blue-500 to-indigo-600"
                  },
                  {
                    title: "Efficiency Gains",
                    desc: "Potential for 18% operational efficiency improvement through current roadmap.",
                    icon: <Award className="w-5 h-5" />,
                    color: "amber",
                    gradient: "from-amber-500 to-orange-600"
                  },
                ].map((insight, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${insight.gradient} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                      {insight.icon}
                    </div>
                    <h4 className="text-slate-900 font-black mb-2 tracking-tight">{insight.title}</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">{insight.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity Mini-Feed */}
          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">System Pulse</h3>
            </div>

            <div className="space-y-4 overflow-y-auto custom-scrollbar-light pr-2">
              {(() => {
                const activities = [
                  ...(data.htiReports || []).map((r: any) => ({
                    id: r.reportId,
                    action: `HTI Report: ${r.status.toUpperCase()}`,
                    time: new Date(r.generatedAt).toLocaleDateString(),
                    type: r.status === 'approved' ? 'success' : 'info',
                    href: `/hti`
                  })),
                  ...(data.verifiedPayments || []).map((p: any) => ({
                    id: p.paymentId,
                    action: `Payment Verified: ${p.amount}`,
                    time: new Date(p.verifiedAt).toLocaleDateString(),
                    type: 'success',
                    href: `/roadmapDashboard`
                  }))
                ].sort((a, b) => 0.5 - Math.random()); // Randomize for now or use timestamp if available

                if (activities.length === 0) {
                  return (
                    <p className="text-gray-400 text-xs text-center py-4 italic">No recent activity yet</p>
                  );
                }

                return activities.slice(0, 6).map((activity, idx) => (
                  <Link
                    key={idx}
                    to={activity.href}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.type === 'success' ? 'bg-emerald-500' :
                      activity.type === 'info' ? 'bg-blue-500' :
                        activity.type === 'alert' ? 'bg-rose-500' : 'bg-amber-500'
                      } group-hover:scale-150 transition-transform`}></div>
                    <div className="flex-1">
                      <div className="text-slate-900 text-[13px] font-black tracking-tight group-hover:text-blue-600 transition-colors">
                        {activity.action}
                      </div>
                      <div className="text-slate-400 text-[10px] font-extrabold uppercase tracking-widest">{activity.time}</div>
                    </div>
                  </Link>
                ));
              })()}
            </div>

            <Link to="/admin/activity-logs" className="mt-8 text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-700 transition-colors text-center w-full block">
              View Activity Audit
            </Link>
          </div>
        </div>

        {/* Strategic Readiness Scorecard Section */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-indigo-50 rounded-xl">
              <Award className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tighter">Strategic Readiness Matrices</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(data.readiness_metrics || [
              { label: "Automation Readiness", score: 0, status: "TBD" },
              { label: "ESG Maturity", score: 0, status: "TBD" },
              { label: "Cyber Resilience", score: 0, status: "TBD" },
              { label: "Future Readiness", score: 0, status: "TBD" }
            ]).map((metric, idx) => (
              <div key={idx} className="relative p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-2xl transition-all duration-500 overflow-hidden">
                <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-30 transition-opacity ${metric.score >= 4 ? 'bg-emerald-400' :
                  metric.score >= 3 ? 'bg-blue-400' : 'bg-amber-400'
                  }`}></div>

                <div className="flex items-center justify-between mb-6">
                  <div className={`text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${metric.score >= 4 ? 'bg-emerald-50 text-emerald-600' :
                    metric.score >= 3 ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                    }`}>
                    {metric.status}
                  </div>
                  <div className="text-2xl font-black text-slate-900 tracking-tighter">
                    {(metric.score || 0).toFixed(1)}
                  </div>
                </div>

                <h4 className="text-sm font-black text-slate-700 mb-4 tracking-tight">{metric.label}</h4>

                <div className="h-2.5 w-full bg-slate-200 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(metric.score / 5) * 100}%` }}
                    transition={{ duration: 1.5, type: "spring" }}
                    className={`h-full rounded-full bg-gradient-to-r ${metric.score >= 4 ? 'from-emerald-400 to-emerald-600' :
                      metric.score >= 3 ? 'from-blue-400 to-blue-600' : 'from-amber-400 to-amber-600'
                      } shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                  ></motion.div>
                </div>
              </div>
            ))}
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
