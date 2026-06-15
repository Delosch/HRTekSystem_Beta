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
import { CheckCircle, LayoutDashboard, TrendingUp, Cpu, Clock, Award, Zap, FileText, Menu, X, ChevronRight, ShieldAlert } from "lucide-react";
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
  readiness_metrics: [],
  strategic_insights: null,
  detailed_recommendations: null,
  consulting_report: null
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
  strategic_insights?: any;
  detailed_recommendations?: any;
  consulting_report?: any;
  today?: {
    day: string;
    monthYear: string;
    weekday: string;
  };
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
  <div className="flex flex-col items-center justify-center min-h-[450px] bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-12 text-center border border-white shadow-xl shadow-slate-200/50">
    {!hasError ? (
      <div className="relative mb-10">
        <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center -rotate-6 shadow-lg">
             <Cpu className="w-6 h-6 text-white" />
          </div>
        </div>
      </div>
    ) : (
      <div className="w-20 h-20 bg-rose-50 rounded-2xl flex items-center justify-center mb-10 shadow-sm border border-rose-100">
        <svg className="h-10 w-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    )}
    
    <div className="space-y-3 max-w-sm">
      <h3 className={`text-xl font-black uppercase tracking-tight ${hasError ? 'text-rose-900' : 'text-slate-900'}`}>
        {hasError ? "Retrieval Interrupted" : "Syncing Insights"}
      </h3>
      <p className="text-slate-500 text-sm font-medium leading-relaxed">{message}</p>
    </div>

    {hasError && (
      <button
        onClick={() => window.location.reload()}
        className="mt-10 px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl text-xs uppercase tracking-widest"
      >
        Attempt Recovery
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

    // Filter out "Profiling Assessment" from counts as it's the baseline, not one of the 5 main engines
    const coreEnginesCompleted = (eligibilityData?.completedEnginesList || [])
      .filter((name: string) => name !== "Profiling Assessment");

    // Completed Engines = Main transformation engines user has finished
    const completedEngines = coreEnginesCompleted.length;

    // AI Reports = Successful analysis records for main engines
    const uniqueAnalyses = new Set(
      allAnalyses
        .filter((a: any) => a.section !== "Profiling Assessment")
        .map((a: any) => a.section)
    );
    const aiInsightCount = uniqueAnalyses.size;

    // Transformation Progress = Based on PAID engines (for eligibility)
    const transformationProgress = eligibilityData?.percentage || 0;

    console.log(`📊 Metrics Calculated (Excluding Profiling):`, {
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
          industry_benchmarks: dimScores.map((_, i) => 3.2 + (i % 3) * 0.3), // Stable benchmarks
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

    const date = new Date();
    const today = {
      day: date.getDate().toString(),
      monthYear: date.toLocaleString('default', { month: 'long', year: 'numeric' }),
      weekday: date.toLocaleString('default', { weekday: 'long' })
    };

    const responseData: DashboardData = {
      user: user,
      isEmpty: false,
      eligibility: eligibilityData,
      htiReports: htiReports,
      verifiedPayments: verifiedPayments,
      metrics: metrics,
      today: today,
      ...vizData,
      bar_chart: {
        ...vizData.bar_chart,
        totalQuestions: Array.isArray(vizData.bar_chart.totalQuestions)
          ? vizData.bar_chart.totalQuestions
          : vizData.bar_chart.dimensions.map(() => vizData.bar_chart.totalQuestions as unknown as number)
      },
      readiness_metrics: readiness_metrics,
      strategic_insights: data.result.strategic_insights || data.result.visualization_data?.strategic_insights || null,
      detailed_recommendations: data.result.detailed_recommendations || data.result.visualization_data?.detailed_recommendations || null,
      consulting_report: data.result.consulting_report || data.result.visualization_data?.consulting_report || null,
    };

    return responseData;
  } catch (error) {
    if (error instanceof Response) throw error;
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

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const greeting = getGreeting();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 font-sans">
          {!isSidebarCollapsed && <Sidebar user={data.user} />}
          <main className="flex-1 md:ml-64 p-4 sm:p-6 flex items-center justify-center">
            <div className="max-w-xl w-full">
              <div className="bg-white/70 backdrop-blur-2xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] p-12 text-center border border-white relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-10"
                >
                  <img src="/hrtek_logo.png" alt="HRTek Logo" className="h-12 w-auto mx-auto mb-10" />
                  <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-slate-100/80 border border-slate-200">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                    </span>
                    <span className="text-slate-600 text-[10px] font-black tracking-[0.2em] uppercase">Intelligence Engine Active</span>
                  </div>
                </motion.div>

                <div className="relative mb-12 flex justify-center">
                  <div className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-2 border-slate-100" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-2 border-dashed border-blue-200/50" 
                    />
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-900 flex items-center justify-center shadow-2xl shadow-blue-900/20 relative z-10">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90 rounded-full" />
                      <Cpu className="w-8 h-8 md:w-10 md:h-10 text-white relative z-20 animate-pulse" />
                    </div>
                  </div>
                </div>

                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-4">
                  Analysis in Progress
                </h2>
                <p className="text-slate-500 mb-10 max-w-sm mx-auto font-medium leading-relaxed">
                  Congratulations on completing your assessment. Our AI is now synthesizing your responses into strategic insights.
                </p>

                <div className="space-y-4">
                  <button
                    onClick={() => revalidator.revalidate()}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl text-xs uppercase tracking-widest flex items-center justify-center gap-3 group"
                  >
                    <Clock className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                    Check Status Now
                  </button>
                  <a
                    href="/onboarding/profilingAssessment"
                    className="w-full inline-flex items-center justify-center py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
                  >
                    Retake Assessment
                  </a>
                </div>

                <div className="mt-8 flex justify-center items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <div className="w-1 h-1 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce" />
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Auto-refreshing enabled</span>
                </div>
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

              <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-1">
                {(() => {
                  const hour = new Date().getHours();
                  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
                  return `${greeting}, ${data.user?.organisationName || 'Strategic Partner'}`;
                })()}
              </h1>
              <p className="text-slate-500 font-bold tracking-tight mb-4">
                {data.user?.email || "Analytics Session Active"}
              </p>
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
    <div className="flex flex-col md:flex-row min-h-screen bg-[#f8f9fc] relative overflow-hidden">
      {/* Subtle background glows */}
      <div className="fixed top-0 right-0 w-[600px] h-[400px] bg-blue-100/20 rounded-full blur-[150px] -z-0 pointer-events-none"></div>
      <div className="fixed bottom-0 left-0 w-[500px] h-[400px] bg-indigo-100/15 rounded-full blur-[150px] -z-0 pointer-events-none"></div>

      {!isSidebarCollapsed && (
        <div className="hidden md:block">
          <Sidebar user={data.user} />
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="w-64 h-full bg-white relative" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full z-10"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
            <Sidebar user={data.user} onLinkClick={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8 relative z-10">
        {/* Mobile Header Toggle */}
        <div className="md:hidden flex items-center justify-between mb-6 bg-white/80 backdrop-blur-md p-3 rounded-2xl border border-white/20 shadow-sm">
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 hover:bg-white rounded-xl transition-colors">
            <Menu className="w-6 h-6 text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <img src="/hrtek_logo.png" alt="HRTek" className="h-7 w-auto" />
            <div className="font-bold text-slate-900 font-outfit">HRTek Dashboard</div>
          </div>
          <div className="w-10"></div>
        </div>
        {/* ── Stats Overview Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {(() => {
            const totalEngines = data.metrics?.totalEngines || 5;
            const completed = data.metrics?.completedEngines || 0;
            const progress = data.metrics?.progress || 0;
            const insights = Number(data.metrics?.insights) || 0;
            const maturityRaw = parseFloat((data.metrics?.maturity || "0").split("/")[0]) || 0;

            const stats = [
              {
                icon: <LayoutDashboard className="w-5 h-5" />,
                label: "Total Engines",
                value: totalEngines,
                subtext: "Available",
                barWidth: 100,
                iconStyle: { background: "linear-gradient(135deg,#2563eb,#06b6d4)" },
                barColor: "bg-blue-500",
                accentColor: "#2563eb",
              },
              {
                icon: <CheckCircle className="w-5 h-5" />,
                label: "Completed",
                value: completed,
                subtext: `of ${totalEngines} engines`,
                barWidth: Math.round((completed / totalEngines) * 100),
                iconStyle: { background: "linear-gradient(135deg,#059669,#10b981)" },
                barColor: "bg-emerald-500",
                accentColor: "#059669",
              },
              {
                icon: <TrendingUp className="w-5 h-5" />,
                label: "Progress",
                value: `${progress}%`,
                subtext: "Transformation",
                barWidth: progress,
                iconStyle: { background: "linear-gradient(135deg,#4f46e5,#7c3aed)" },
                barColor: "bg-indigo-500",
                accentColor: "#4f46e5",
              },
              {
                icon: <Cpu className="w-5 h-5" />,
                label: "AI Reports",
                value: insights,
                subtext: "Generated",
                barWidth: Math.min((insights / 5) * 100, 100),
                iconStyle: { background: "linear-gradient(135deg,#d97706,#f59e0b)" },
                barColor: "bg-amber-500",
                accentColor: "#d97706",
              },
              {
                icon: <Clock className="w-5 h-5" />,
                label: "Avg. Time",
                value: data.metrics?.avgTime || "45m",
                subtext: "Per Engine",
                barWidth: 60,
                iconStyle: { background: "linear-gradient(135deg,#0891b2,#06b6d4)" },
                barColor: "bg-cyan-500",
                accentColor: "#0891b2",
              },
              {
                icon: <Award className="w-5 h-5" />,
                label: "Maturity",
                value: data.metrics?.maturity || "0.0/5",
                subtext: maturityRaw >= 4 ? "Excellent" : maturityRaw >= 3 ? "Good" : maturityRaw >= 2 ? "Developing" : "Baseline",
                barWidth: Math.round((maturityRaw / 5) * 100),
                iconStyle: maturityRaw >= 4
                  ? { background: "linear-gradient(135deg,#059669,#10b981)" }
                  : maturityRaw >= 3
                  ? { background: "linear-gradient(135deg,#2563eb,#4f46e5)" }
                  : { background: "linear-gradient(135deg,#dc2626,#f59e0b)" },
                barColor: maturityRaw >= 4 ? "bg-emerald-500" : maturityRaw >= 3 ? "bg-blue-500" : maturityRaw >= 2 ? "bg-amber-500" : "bg-rose-500",
                accentColor: maturityRaw >= 4 ? "#059669" : maturityRaw >= 3 ? "#2563eb" : "#dc2626",
              },
            ];

            return stats.map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_16px_40px_rgba(0,0,0,0.09)] transition-all duration-300 overflow-hidden relative group"
                style={{ borderTop: `2px solid ${stat.accentColor}20` }}
              >
                {/* Subtle glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl pointer-events-none"
                  style={{ background: `radial-gradient(ellipse at top left, ${stat.accentColor}08 0%, transparent 60%)` }} />

                <div className="flex flex-col h-full relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className="p-2 rounded-xl text-white group-hover:scale-110 transition-transform duration-300 shadow-md"
                      style={stat.iconStyle}
                    >
                      {stat.icon}
                    </div>
                    <div className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-50 text-slate-500">
                      {stat.subtext}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-slate-900 tracking-tighter mb-0.5">
                      {stat.value}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{stat.label}</div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.barWidth}%` }}
                        transition={{ duration: 1.2, delay: 0.4 + idx * 0.1, ease: "easeOut" }}
                        className={`h-full rounded-full ${stat.barColor}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ));
          })()}
        </div>

        {/* Priority Spotlight Banner */}
        {(data.metrics?.completedEngines || 0) < 5 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-6 flex items-center gap-4 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-lg shadow-indigo-200/40 text-white"
          >
            <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white fill-white/40" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Next Priority</span>
              <p className="text-sm font-bold truncate">
                {(data.metrics?.completedEngines || 0) === 0
                  ? "Begin your first transformation engine to unlock insights"
                  : `${5 - (data.metrics?.completedEngines || 0)} engine${5 - (data.metrics?.completedEngines || 0) > 1 ? 's' : ''} remaining to achieve full transformation eligibility`}
              </p>
            </div>
            <a
              href="/startTransformationDashboard"
              className="flex-shrink-0 px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all whitespace-nowrap"
            >
              Take Action →
            </a>
          </motion.div>
        )}

        {/* ── Hero Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">

          {/* Welcome + Maturity Card */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-50/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-50/40 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 p-8 flex flex-col sm:flex-row items-start sm:items-center gap-8 h-full">
              {/* Left: Text */}
              <div className="flex-1 min-w-0">
                <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                  <Zap className="w-3 h-3 fill-current" />
                  Dashboard Overview
                </div>

                <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-3">
                  Welcome back,<br />
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {data.user?.first_name || 'Strategic Partner'}
                  </span>
                </h1>

                <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 max-w-xs">
                  {data.consulting_report?.executive_summary?.executive_recommendation ||
                    "Your organizational transformation is currently being analyzed based on your assessment inputs."}
                </p>

                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white shadow-lg font-black text-sm">
                    {data.user?.first_name?.[0] || 'U'}
                  </div>
                  <div>
                    <div className="text-sm font-black text-slate-900">
                      {data.user?.role || 'Founder & CEO'}
                      {data.user?.organisationName ? ` • ${data.user.organisationName}` : ''}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verified Account</span>
                      <span className="text-slate-200 text-xs mx-1">|</span>
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span className="text-[10px] text-slate-400 font-bold">Last login: Today</span>
                    </div>
                  </div>
                </div>

                <a
                  href="/consulting-report/Profiling Assessment"
                  className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-slate-900 text-white font-black rounded-2xl hover:bg-black transition-all shadow-xl shadow-slate-200/60 hover:-translate-y-0.5 active:translate-y-0 text-sm"
                >
                  <Zap className="w-4 h-4 text-blue-400 fill-blue-400/30" />
                  View Detailed Analysis Report
                </a>
              </div>

              {/* Right: Maturity Ring */}
              {(() => {
                const maturityRaw = parseFloat((data.metrics?.maturity || "0").split("/")[0]) || 0;
                const pct = Math.min((maturityRaw / 5) * 100, 100);
                const r = 70;
                const circ = 2 * Math.PI * r;
                const strokeColor = maturityRaw >= 4 ? '#10b981' : maturityRaw >= 3 ? '#3b82f6' : maturityRaw >= 2 ? '#6366f1' : '#f59e0b';
                const category = data.consulting_report?.executive_summary?.maturity_category || "Strategic Baseline";
                return (
                  <div className="flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="relative w-44 h-44">
                      <svg width="176" height="176" viewBox="0 0 176 176" className="-rotate-90">
                        <circle cx="88" cy="88" r={r} fill="none" stroke="#f1f5f9" strokeWidth="12" />
                        <motion.circle
                          cx="88" cy="88" r={r}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="12"
                          strokeLinecap="round"
                          strokeDasharray={circ}
                          initial={{ strokeDashoffset: circ }}
                          animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
                          transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-black text-slate-900 tracking-tighter leading-none">
                          {maturityRaw.toFixed(1)}
                        </span>
                        <span className="text-sm text-slate-400 font-bold">/5.0</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Score</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-blue-50 text-blue-600">
                        {category}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Date + Quick Stats Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 to-blue-500" />

            {/* Top: Date */}
            <div className="p-8 flex-1">
              <div className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-5 flex items-center gap-2">
                <div className="w-4 h-[2px] bg-blue-600"></div>
                Today's Date
              </div>
              <div className="flex items-end justify-between mb-2">
                <div className="text-8xl font-black text-slate-900 tracking-tighter leading-none">
                  {data.today?.day || new Date().getDate()}
                </div>
                <div className="absolute top-8 right-8 opacity-[0.07]">
                  <LayoutDashboard className="w-20 h-20" />
                </div>
              </div>
              <div className="text-2xl text-slate-500 font-bold tracking-tight">
                {data.today?.monthYear || "Current Month"}
              </div>
            </div>

            {/* Bottom: Day + Engine mini-stats */}
            <div className="px-8 pb-8 pt-5 border-t border-slate-50">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-slate-900 text-base font-black tracking-tight block">
                    {data.today?.weekday || "Business Day"}
                  </span>
                  <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Business Day</span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              {/* Mini engine progress */}
              <div className="space-y-2.5">
                {[
                  { label: "Engines", value: `${data.metrics?.completedEngines || 0}/${data.metrics?.totalEngines || 5}`, color: "bg-blue-500" },
                  { label: "AI Reports", value: `${data.metrics?.insights || 0} Generated`, color: "bg-indigo-500" },
                  { label: "Progress", value: `${data.metrics?.progress || 0}% Complete`, color: "bg-emerald-500" },
                ].map((row, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${row.color}`} />
                    <div className="flex-1 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{row.label}</span>
                      <span className="text-[11px] font-black text-slate-900">{row.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Engine Journey ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="relative w-full rounded-3xl mb-8 overflow-hidden bg-white border border-slate-100 shadow-xl"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600" />

          <div className="p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                Your Transformation Journey
              </h3>
              <div className="flex items-center gap-2">
                <div className="text-xs font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                  Phase 1: Foundation
                </div>
                <a href="/startTransformationDashboard" className="text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors">
                  Start Engine →
                </a>
              </div>
            </div>

            {(() => {
              const completed = data.eligibility?.completedEnginesList || [];
              const engines = [
                { key: "HR Transformation Roadmap Generator", label: "Roadmap", short: "Roadmap", href: "/roadmapDashboard", icon: <TrendingUp className="w-4 h-4" /> },
                { key: "HCM Vendor Fit Engine", label: "Vendor Fit", short: "Vendor", href: "/vendorDashboard", icon: <Cpu className="w-4 h-4" /> },
                { key: "Shared Service Designer", label: "Shared Services", short: "Shared", href: "/sharedDashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
                { key: "Intelligent Change Management", label: "Change Mgmt", short: "Change", href: "/changeDashboard", icon: <Zap className="w-4 h-4" /> },
                { key: "HR Technology Maturity Analysis", label: "Tech Maturity", short: "Tech", href: "/analysisDashboard", icon: <Award className="w-4 h-4" /> },
              ];
              const completedCount = engines.filter(e => completed.includes(e.key)).length;
              const lineWidth = completedCount === 0 ? 0 : Math.min(((completedCount - 0.5) / engines.length) * 100, 100);

              return (
                <div className="relative">
                  {/* Track line */}
                  <div className="absolute top-[22px] left-[52px] right-[52px] h-[2px] bg-slate-100 z-0" />
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${lineWidth}%` }}
                    transition={{ duration: 1.4, delay: 0.4, ease: "easeOut" }}
                    className="absolute top-[22px] left-[52px] h-[2px] bg-gradient-to-r from-blue-600 to-indigo-500 z-0"
                  />

                  <div className="flex items-start justify-between relative z-10 overflow-x-auto pb-2 gap-2">
                    {engines.map((engine, index) => {
                      const isDone = completed.includes(engine.key);
                      const isNext = !isDone && engines.slice(0, index).every(e => completed.includes(e.key));
                      return (
                        <a
                          key={engine.key}
                          href={engine.href}
                          className="flex flex-col items-center gap-3 min-w-[90px] sm:min-w-[110px] group"
                        >
                          <div className="relative">
                            {isNext && (
                              <span className="absolute inset-0 rounded-2xl bg-indigo-400/30 animate-ping" />
                            )}
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.08, type: "spring", stiffness: 220 }}
                              className={`relative w-11 h-11 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 ${
                                isDone
                                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-blue-200'
                                  : isNext
                                  ? 'bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-violet-200 ring-4 ring-indigo-100'
                                  : 'bg-white border-2 border-slate-100 text-slate-300'
                              }`}
                            >
                              {isDone ? <CheckCircle className="w-4 h-4" /> : engine.icon}
                            </motion.div>
                          </div>
                          <div className="text-center">
                            <div className={`text-[10px] font-black uppercase tracking-wider mb-1 ${isDone ? 'text-slate-900' : isNext ? 'text-indigo-700' : 'text-slate-400'}`}>
                              {engine.short}
                            </div>
                            <div className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                              isDone ? 'text-blue-600 bg-blue-50' : isNext ? 'text-indigo-600 bg-indigo-50 animate-pulse' : 'text-slate-300'
                            }`}>
                              {isDone ? 'DONE' : isNext ? 'NEXT' : 'PENDING'}
                            </div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </motion.div>

        {/* ── Strategic Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
                <Zap className="w-5 h-5 text-violet-600" />
              </div>
              Strategic Quick Actions
            </h3>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">6 modules</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: <TrendingUp className="w-5 h-5" />, label: "Start Assessment", desc: "Launch an engine", href: "/startTransformationDashboard", from: "#2563eb", to: "#06b6d4", accent: "border-blue-200 bg-blue-50/50" },
              { icon: <FileText className="w-5 h-5" />, label: "View Reports", desc: "AI-generated insights", href: "/analysisDashboard", from: "#7c3aed", to: "#ec4899", accent: "border-purple-200 bg-purple-50/50" },
              { icon: <Award className="w-5 h-5" />, label: "Roadmap", desc: "Digital journey plan", href: "/roadmapDashboard", from: "#059669", to: "#10b981", accent: "border-emerald-200 bg-emerald-50/50" },
              { icon: <Clock className="w-5 h-5" />, label: "Change Mgmt", desc: "Track adoption", href: "/changeDashboard", from: "#ea580c", to: "#f59e0b", accent: "border-orange-200 bg-orange-50/50" },
              { icon: <Cpu className="w-5 h-5" />, label: "Vendors", desc: "Fit analysis", href: "/vendorDashboard", from: "#4f46e5", to: "#7c3aed", accent: "border-indigo-200 bg-indigo-50/50" },
              { icon: <LayoutDashboard className="w-5 h-5" />, label: "Settings", desc: "Account & prefs", href: "/userSettingsDashboard", from: "#475569", to: "#64748b", accent: "border-slate-200 bg-slate-50/50" },
            ].map((action, idx) => (
              <motion.a
                key={idx}
                href={action.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + idx * 0.04 }}
                whileHover={{ y: -5, scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="group bg-white border border-slate-100 rounded-3xl p-5 flex flex-col items-center justify-center text-center transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 cursor-pointer overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
                  style={{ background: `linear-gradient(to right, ${action.from}, ${action.to})` }} />

                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300"
                  style={{ background: `linear-gradient(135deg, ${action.from}, ${action.to})` }}
                >
                  {action.icon}
                </div>

                <div className="text-slate-900 text-xs font-black tracking-tight group-hover:text-blue-600 transition-colors leading-tight mb-1">
                  {action.label}
                </div>
                <div className="text-[10px] text-slate-400 font-medium group-hover:text-slate-500 transition-colors">
                  {action.desc}
                </div>

                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* ── AI Insights + System Pulse ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* AI Insights */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500" />
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50/60 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 pointer-events-none" />

            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-7">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-50 rounded-xl">
                    <Cpu className="w-5 h-5 text-violet-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 tracking-tighter leading-none">AI-Powered Strategic Insights</h3>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5">Generated from your assessment responses</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-3 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-violet-500 rounded-full animate-pulse" />
                  Live
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {(data.strategic_insights?.transformation_readiness?.enabling_factors?.length > 0
                  ? data.strategic_insights.transformation_readiness.enabling_factors.slice(0, 3).map((factor: string, idx: number) => ({
                    title: ["Strategic Enabler", "Growth Catalyst", "Transformation Factor"][idx] || "Insight",
                    desc: factor,
                    gradFrom: ["#059669", "#2563eb", "#d97706"][idx],
                    gradTo: ["#0d9488", "#6366f1", "#ea580c"][idx],
                  }))
                  : [
                    { title: "Cloud Potential", desc: "Infrastructure is being assessed for cloud scalability and digital readiness.", gradFrom: "#059669", gradTo: "#0d9488" },
                    { title: "Team Alignment", desc: "Analyzing organizational readiness for the upcoming digital shift.", gradFrom: "#2563eb", gradTo: "#6366f1" },
                    { title: "Efficiency Gains", desc: "Calculating potential operational improvements from your assessment inputs.", gradFrom: "#d97706", gradTo: "#ea580c" },
                  ]
                ).map((insight: any, idx: number) => (
                  <div
                    key={idx}
                    className="bg-slate-50 border border-slate-100 rounded-2xl p-6 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                  >
                    <div className="absolute bottom-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-40 transition-opacity"
                      style={{ background: insight.gradFrom }} />
                    <div
                      className="w-10 h-10 rounded-xl text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform"
                      style={{ background: `linear-gradient(135deg, ${insight.gradFrom}, ${insight.gradTo})` }}
                    >
                      {[<CheckCircle key={0} className="w-5 h-5" />, <TrendingUp key={1} className="w-5 h-5" />, <Award key={2} className="w-5 h-5" />][idx]}
                    </div>
                    <h4 className="text-slate-900 font-black mb-2 tracking-tight text-sm">{insight.title}</h4>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-3">{insight.desc}</p>
                  </div>
                ))}
              </div>

              {/* Bottom strip: key factors */}
              {data.strategic_insights?.risk_assessment?.high_priority_risks?.length > 0 && (
                <div className="mt-6 pt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2 mb-3">
                    <ShieldAlert className="w-4 h-4 text-rose-500" />
                    <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">High-Priority Risks</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.strategic_insights.risk_assessment.high_priority_risks.slice(0, 4).map((risk: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 bg-rose-50 text-rose-700 text-[10px] font-black rounded-full border border-rose-100">
                        {risk.length > 40 ? risk.slice(0, 40) + '…' : risk}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* System Pulse */}
          <div className="bg-white border border-slate-100 rounded-3xl shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <div className="p-8 flex-1">
              <div className="flex items-center gap-3 mb-7">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tighter leading-none">System Pulse</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">Recent platform activity</p>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[280px] custom-scrollbar-light pr-1">
                {(() => {
                  const activities = [
                    ...(data.htiReports || []).map((r: any) => ({
                      id: r.reportId,
                      action: `HTI Report: ${r.status.toUpperCase()}`,
                      time: new Date(r.generatedAt).toLocaleDateString(),
                      type: 'info',
                      href: `/hti`,
                      timestamp: new Date(r.generatedAt).getTime()
                    })),
                    ...(data.verifiedPayments || []).map((p: any) => ({
                      id: p.paymentId || p.invoiceId,
                      action: `Payment Verified: ₹${p.totalAmount}`,
                      time: new Date(p.verifiedAt).toLocaleDateString(),
                      type: 'success',
                      href: `/roadmapDashboard`,
                      timestamp: new Date(p.verifiedAt).getTime()
                    }))
                  ].sort((a, b) => b.timestamp - a.timestamp);

                  if (activities.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                          <Clock className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-xs text-slate-400 font-bold">No recent activity yet</p>
                      </div>
                    );
                  }

                  return activities.slice(0, 7).map((activity, idx) => (
                    <Link
                      key={idx}
                      to={activity.href}
                      className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-blue-100 hover:shadow-md transition-all group cursor-pointer"
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        activity.type === 'success' ? 'bg-emerald-100' : 'bg-blue-100'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-slate-900 text-[12px] font-black tracking-tight group-hover:text-blue-600 transition-colors truncate">
                          {activity.action}
                        </div>
                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">{activity.time}</div>
                      </div>
                    </Link>
                  ));
                })()}
              </div>
            </div>

            <div className="px-8 pb-7">
              <Link to="/admin/activity-logs" className="block w-full py-2.5 text-center text-xs font-black text-blue-600 uppercase tracking-widest bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors">
                View Activity Audit →
              </Link>
            </div>
          </div>
        </div>

        {/* ── ROI Projections ── */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-xl mb-8 overflow-hidden relative">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-50/50 rounded-full blur-[120px] pointer-events-none" />

          <div className="p-8">
            <div className="flex items-center justify-between mb-7">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tighter leading-none">Transformation ROI Projections</h3>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">AI-generated investment return estimates</p>
                </div>
              </div>
              <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
                Projected Gains
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {(data.consulting_report?.investment_indication?.length > 0 ? data.consulting_report.investment_indication : [
                { label: "Projected Spend", value: "Calculated", sub: "Annual" },
                { label: "Net Present Value", value: "TBD", sub: "3-Year Horizon" },
                { label: "ROI (Est.)", value: "Developing", sub: "Based on data" },
                { label: "Payback Period", value: "Pending", sub: "Months" }
              ]).map((item: any, idx: number) => {
                const colors = [
                  { from: "#059669", to: "#0d9488", light: "bg-emerald-50", text: "text-emerald-600" },
                  { from: "#2563eb", to: "#4f46e5", light: "bg-blue-50", text: "text-blue-600" },
                  { from: "#7c3aed", to: "#a855f7", light: "bg-violet-50", text: "text-violet-600" },
                  { from: "#d97706", to: "#ea580c", light: "bg-amber-50", text: "text-amber-600" },
                ][idx % 4];
                return (
                  <div key={idx} className="relative p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 group overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: `linear-gradient(to right, ${colors.from}, ${colors.to})` }} />
                    <div className={`text-[9px] font-black uppercase tracking-[0.15em] mb-3 px-2 py-0.5 rounded-full w-fit ${colors.light} ${colors.text}`}>
                      {item.sub || "Metric"}
                    </div>
                    <div className="text-2xl font-black text-slate-900 tracking-tighter mb-1">{item.value || item.score || "—"}</div>
                    <div className="text-xs font-black text-slate-500 tracking-tight">{item.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Strategic Readiness Scorecard Section */}
        <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-50 rounded-xl">
                <Award className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">Strategic Readiness Matrices</h3>
            </div>
            <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
              Live Scores
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {(data.readiness_metrics || [
              { label: "Automation Readiness", score: 0, status: "TBD" },
              { label: "ESG Maturity", score: 0, status: "TBD" },
              { label: "Cyber Resilience", score: 0, status: "TBD" },
              { label: "Future Readiness", score: 0, status: "TBD" }
            ]).map((metric, idx) => {
              const pct = Math.min((metric.score / 5) * 100, 100);
              const radius = 40;
              const circ = 2 * Math.PI * radius;
              const strokeColor = metric.score >= 4 ? '#10b981' : metric.score >= 3 ? '#3b82f6' : metric.score >= 2 ? '#f59e0b' : '#ef4444';
              const trackColor = metric.score >= 4 ? '#d1fae5' : metric.score >= 3 ? '#dbeafe' : metric.score >= 2 ? '#fef3c7' : '#fee2e2';
              const badgeBg = metric.score >= 4 ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : metric.score >= 3 ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-amber-50 text-amber-700 border-amber-100';

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + idx * 0.08 }}
                  className="relative p-6 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col items-center text-center"
                >
                  {/* SVG Ring */}
                  <div className="relative w-[100px] h-[100px] mb-4">
                    <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
                      <circle cx="50" cy="50" r={radius} fill="none" stroke={trackColor} strokeWidth="10" />
                      <motion.circle
                        cx="50" cy="50" r={radius}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={circ}
                        initial={{ strokeDashoffset: circ }}
                        animate={{ strokeDashoffset: circ - (pct / 100) * circ }}
                        transition={{ duration: 1.4, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black text-slate-900">{(metric.score || 0).toFixed(1)}</span>
                      <span className="text-[9px] font-black text-slate-400 uppercase">/5.0</span>
                    </div>
                  </div>

                  <h4 className="text-sm font-black text-slate-800 mb-2 tracking-tight leading-tight">{metric.label}</h4>
                  <div className={`text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-widest border ${badgeBg}`}>
                    {metric.status}
                  </div>
                </motion.div>
              );
            })}
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

        {/* ── Financial Pulse ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-all duration-700"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-md">
                    <Zap className="w-6 h-6 text-blue-400" />
                  </div>
                  <h3 className="text-xl font-black text-white tracking-tighter">Financial Subscription Pulse</h3>
                </div>
                <Link to="/pricing" className="text-[10px] font-black text-blue-400 uppercase tracking-widest bg-white/5 border border-white/10 px-4 py-2 rounded-full hover:bg-white/10 transition-all">
                  Upgrade & Expand
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Current Investment</div>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-4xl font-black text-white tracking-tighter">
                      ₹{data.verifiedPayments?.reduce((sum, p) => sum + (parseFloat(p.totalAmount) || 0), 0).toLocaleString()}
                    </span>
                    <span className="text-slate-400 font-bold text-sm">TOTAL PAID</span>
                  </div>
                  <div className="text-slate-500 text-xs font-medium">Across all assessment engines</div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1">Engines</div>
                    <div className="text-xl font-black text-white">{data.verifiedPayments?.length || 0}</div>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Status</div>
                    <div className="text-xl font-black text-white">Active</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-white/10">
                <div className="flex flex-wrap gap-3">
                  {["HR Tech Maturity", "Digital Roadmap", "Vendor Fit", "Shared Services", "Change Mgmt"].map((engine, i) => {
                    const isPaid = true;
                    return (
                      <div key={i} className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 ${
                        isPaid ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-500 border border-white/10'
                      }`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></div>
                        {engine}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-xl flex flex-col">
            <h3 className="text-lg font-black text-slate-900 tracking-tighter mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Payouts
            </h3>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar-light">
              {data.verifiedPayments && data.verifiedPayments.length > 0 ? (
                data.verifiedPayments.slice(0, 5).map((payment, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 group hover:border-blue-100 hover:bg-white transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-black text-slate-900 group-hover:text-blue-600 transition-colors">₹{payment.totalAmount}</div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase">{new Date(payment.verifiedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <Link to="/receiptsDashboard" className="text-[9px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Invoice
                    </Link>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                    <ShieldAlert className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-xs text-slate-400 font-bold italic">No payouts detected</p>
                </div>
              )}
            </div>
            <Link to="/pricing" className="mt-6 w-full py-3 bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-widest rounded-xl text-center hover:bg-blue-100 transition-colors">
              Manage Subscriptions
            </Link>
          </div>
        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 items-start">
          {/* Maturity Score */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter">Maturity Score</h3>
              </div>
              <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                Radar Analysis
              </div>
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
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <Award className="w-4 h-4 text-blue-600" />
                </div>
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">Areas of Improvement</h4>
              </div>
              <ul className="list-none space-y-2">
                {renderImprovementContent()}
              </ul>
            </div>
          </div>

          {/* Radial Chart - Updated with Pastel Colors */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl flex flex-col w-full">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-black text-slate-900 tracking-tighter">
                  Progress Overview
                  {activeRadialIndex !== null && (
                    <span className="text-sm font-medium text-slate-400 ml-2 normal-case">
                      (Click to deselect)
                    </span>
                  )}
                </h3>
              </div>
              <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full">
                Dimension View
              </div>
            </div>
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
            <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-x-6 gap-y-2 w-full">
              {data.progress_bars.map((item, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: PASTEL_COLORS[index % PASTEL_COLORS.length] }}
                  ></div>
                  <span className="text-xs font-bold text-slate-600 tracking-tight truncate">{(item.dimension ?? "").split(" ")[0]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>



        {/* ── Dimension Charts ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-violet-50 rounded-xl">
                    <LayoutDashboard className="w-6 h-6 text-violet-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">Assessment Completion</h3>
                </div>
                <div className="text-[10px] font-black text-violet-600 uppercase tracking-widest bg-violet-50 px-3 py-1 rounded-full">
                  By Dimension
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }} barGap={4}>
                    <defs>
                      <linearGradient id="barAnswered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ background: 'white', border: 'none', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: '12px' }}
                      formatter={(value: unknown, name: unknown) => [
                        name === 'answered' ? `${value} answered` : `${value} total`,
                        name === 'answered' ? 'Answered Questions' : 'Total Questions'
                      ]}
                      labelFormatter={(label: unknown) => `Dimension: ${label}`}
                    />
                    <Bar dataKey="total" fill="#e2e8f0" name="total" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="answered" fill="url(#barAnswered)" name="answered" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Interactive Gap Analysis Bubble Chart */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl flex flex-col justify-between h-full">
            <motion.div
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              className="h-full"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-50 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tighter">Gap Analysis</h3>
                </div>
                <div className="text-[10px] font-black text-rose-600 uppercase tracking-widest bg-rose-50 px-3 py-1 rounded-full">
                  Interactive
                </div>
              </div>
              <div className="relative bg-slate-50/60 rounded-2xl p-2 h-72 border border-slate-100" onMouseLeave={() => setHovered(null)}>
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
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400 font-bold text-center tracking-tight">
                <p><span className="text-slate-600 font-black">Size:</span> Investment &nbsp;•&nbsp; <span className="text-slate-600 font-black">Numbers:</span> Gap &nbsp;•&nbsp; <span className="text-slate-600 font-black">Timeline:</span> Months</p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Graph Row - Heatmap replacing Trends */}
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 rounded-xl">
                <LayoutDashboard className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">Detailed Capability Heatmap</h3>
            </div>
            <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest bg-amber-50 px-3 py-1 rounded-full">
              Capability Matrix
            </div>
          </div>
          <div className="overflow-x-auto">
            <Heatmap data={heatmapMatrixData} />
          </div>
        </div>

        {/* Key Recommendations Section - Light Theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 bg-white border border-slate-100 rounded-3xl p-10 shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600"></div>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-cyan-50 rounded-xl">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">Key Recommendations</h3>
            </div>
            <div className="text-[10px] font-black text-cyan-600 uppercase tracking-widest bg-cyan-50 px-3 py-1 rounded-full">
              Strategic Guidance
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-black">✓</div>
                <h4 className="text-sm font-black text-emerald-700 uppercase tracking-widest">Strengths to Leverage</h4>
              </div>
              {(data.consulting_report?.executive_summary?.what_this_means?.slice(0, 4) || [
                "Analyzed infrastructure adoption",
                "Leadership investment appetite mapping",
                "Innovation culture assessment",
                "Digital strategy definition",
              ]).map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                  className="flex items-start gap-3 text-slate-700 bg-gradient-to-r from-emerald-50/80 to-green-50/60 p-4 rounded-2xl border border-emerald-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="text-emerald-500 mt-0.5 font-black text-sm flex-shrink-0">✓</span>
                  <span className="text-sm font-medium leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-black">→</div>
                <h4 className="text-sm font-black text-orange-700 uppercase tracking-widest">Priority Actions</h4>
              </div>
              {(data.detailed_recommendations?.immediate_actions?.actions?.slice(0, 4).map((a: any) => a.action) || [
                "Complete assessment for priority actions",
                "Review strategic alignment",
                "Analyze legacy dependencies",
                "Evaluate learning frameworks",
              ]).map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + idx * 0.1 }}
                  className="flex items-start gap-3 text-slate-700 bg-gradient-to-r from-orange-50/80 to-amber-50/60 p-4 rounded-2xl border border-orange-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                >
                  <span className="text-orange-500 mt-0.5 font-black text-sm flex-shrink-0">→</span>
                  <span className="text-sm font-medium leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom CTA Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {[
            {
              label: "Book HTI Advisory",
              desc: "Talk to an expert about your transformation strategy",
              href: "/hti",
              gradient: "from-purple-600 to-indigo-600",
              shadow: "shadow-purple-200/50",
              icon: <Award className="w-5 h-5" />,
            },
            {
              label: "Full Analysis Report",
              desc: "Deep-dive into every dimension of your maturity score",
              href: "/consulting-report/Profiling Assessment",
              gradient: "from-blue-600 to-cyan-600",
              shadow: "shadow-blue-200/50",
              icon: <FileText className="w-5 h-5" />,
            },
            {
              label: "Explore All Engines",
              desc: "Unlock additional transformation modules for your org",
              href: "/startTransformationDashboard",
              gradient: "from-emerald-600 to-teal-600",
              shadow: "shadow-emerald-200/50",
              icon: <TrendingUp className="w-5 h-5" />,
            },
          ].map((cta, idx) => (
            <motion.a
              key={idx}
              href={cta.href}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center gap-4 p-5 bg-gradient-to-r ${cta.gradient} rounded-2xl shadow-lg ${cta.shadow} text-white group transition-all duration-300`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                {cta.icon}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-black tracking-tight">{cta.label}</div>
                <div className="text-[11px] text-white/70 font-medium leading-tight mt-0.5 truncate">{cta.desc}</div>
              </div>
              <ChevronRight className="w-4 h-4 text-white/60 flex-shrink-0 group-hover:translate-x-1 transition-transform ml-auto" />
            </motion.a>
          ))}
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
