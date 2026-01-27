import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChartBarIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ChevronRightIcon,
  ClockIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import Chart from 'chart.js/auto';
import { requireUserSession } from "~/lib/session.server";
import { getLatestAnalysis } from "~/utils/analysis.server";

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  const user = await requireUserSession(request);
  const data = await getLatestAnalysis(`COMPANY#${user.organisationId}`, "Profiling Assessment");

  if (!data) {
    throw new Response("Not Found", { status: 404 });
  }

  return json({ assessmentData: data });
};

export default function AssessmentReport() {
  const { assessmentData } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Process data for visualization with safety checks
  const processedData = processAssessmentData(assessmentData?.result?.digitalMaturityAnalysis || []);

  const tabs = [
    { id: "overview", label: "Executive Overview", icon: DocumentTextIcon },
    { id: "detailed", label: "Detailed Analysis", icon: ChartBarIcon },
    { id: "recommendations", label: "Recommendations", icon: ArrowTrendingUpIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Digital Maturity Assessment Report
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Generated on {new Date(assessmentData?.createdAt || Date.now()).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <MaturityBadge level={processedData.overallMaturity} />
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Export PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
              >
                <tab.icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && (
              <OverviewTab data={processedData} />
            )}
            {activeTab === "detailed" && (
              <DetailedTab
                data={processedData}
                onSectionSelect={setSelectedSection}
                selectedSection={selectedSection}
              />
            )}
            {activeTab === "recommendations" && (
              <RecommendationsTab data={processedData} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper function to process assessment data
function processAssessmentData(digitalMaturityAnalysis: any[]) {
  if (!digitalMaturityAnalysis || digitalMaturityAnalysis.length === 0) {
    return {
      sections: [],
      overallMaturity: "Unknown",
      radarData: { labels: [], datasets: [] },
      heatMapData: [],
      keyInsights: { topStrengths: [], criticalWeaknesses: [] },
      recommendations: []
    };
  }

  const sections = digitalMaturityAnalysis.map(section => ({
    title: section.section || "Unknown Section",
    summary: section.summary || "",
    strengths: section.strengths || [],
    weaknesses: section.weaknesses || [],
    score: calculateSectionScore(section)
  }));

  const overallMaturity = calculateOverallMaturity(sections);
  const radarData = generateRadarData(sections);
  const heatMapData = generateHeatMapData(sections);

  return {
    sections,
    overallMaturity,
    radarData,
    heatMapData,
    keyInsights: extractKeyInsights(sections),
    recommendations: generateRecommendations(sections)
  };
}

function calculateSectionScore(section: any): number {
  const strengthCount = section.strengths?.length || 0;
  const weaknessCount = section.weaknesses?.length || 0;

  if (weaknessCount > strengthCount * 2) return 1;
  if (weaknessCount > strengthCount) return 2;
  if (strengthCount === weaknessCount) return 3;
  if (strengthCount > weaknessCount) return 4;
  return 5;
}

function calculateOverallMaturity(sections: any[]): string {
  if (sections.length === 0) return "Unknown";
  const avgScore = sections.reduce((sum, s) => sum + s.score, 0) / sections.length;
  if (avgScore <= 1.5) return "Nascent";
  if (avgScore <= 2.5) return "Emerging";
  if (avgScore <= 3.5) return "Developing";
  if (avgScore <= 4.5) return "Advanced";
  return "Transformative";
}

function generateRadarData(sections: any[]) {
  return {
    labels: sections.map(s => s.title.replace("Section ", "").replace(/:\s*.*/, "")),
    datasets: [{
      label: 'Current Maturity',
      data: sections.map(s => s.score),
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 2
    }]
  };
}

function generateHeatMapData(sections: any[]) {
  return sections.map(section => ({
    dimension: section.title.replace("Section ", "").replace(/:\s*.*/, ""),
    score: section.score,
    intensity: section.score / 5
  }));
}

function extractKeyInsights(sections: any[]) {
  const topStrengths = sections
    .flatMap(s => s.strengths.map((strength: string) => ({ section: s.title, text: strength })))
    .slice(0, 5);

  const criticalWeaknesses = sections
    .flatMap(s => s.weaknesses.map((weakness: string) => ({ section: s.title, text: weakness })))
    .slice(0, 5);

  return { topStrengths, criticalWeaknesses };
}

function generateRecommendations(sections: any[]) {
  return sections
    .filter(s => s.weaknesses.length > 0)
    .map(section => ({
      title: `Improve ${section.title.replace("Section ", "").replace(/:\s*.*/, "")}`,
      priority: section.score <= 2 ? "High" : section.score <= 3 ? "Medium" : "Low",
      description: `Address key weaknesses: ${section.weaknesses[0]}`,
      timeline: section.score <= 2 ? "0-3 months" : "3-12 months"
    }));
}

// Overview Tab Component
interface OverviewTabProps {
  data: {
    overallMaturity: string;
    sections: Array<{
      title: string;
      score: number;
      strengths: string[];
      weaknesses: string[];
    }>;
    radarData: any;
    keyInsights: {
      topStrengths: Array<{ section: string; text: string }>;
      criticalWeaknesses: Array<{ section: string; text: string }>;
    };
  };
}

function OverviewTab({ data }: OverviewTabProps) {
  const avgScore = data.sections.length > 0
    ? data.sections.reduce((sum, s) => sum + s.score, 0) / data.sections.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Executive Summary Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">Overall Maturity</div>
              <div className="text-2xl font-bold text-blue-600">{data.overallMaturity}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Average Score</div>
              <div className="text-2xl font-bold text-green-600">{avgScore.toFixed(1)}/5.0</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Maturity Overview</h3>
            <MaturityRadarChart data={data.radarData} />
          </div>

          {/* Key Metrics */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Section Scores</h3>
            <MetricsGrid sections={data.sections} />
          </div>
        </div>
      </motion.div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Strengths */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Top Strengths</h3>
          </div>
          <div className="space-y-3">
            {data.keyInsights.topStrengths.map((strength, index) => (
              <div key={index} className="border-l-4 border-green-500 pl-4">
                <div className="text-sm font-medium text-green-700">
                  {strength.section.replace("Section ", "").replace(/:\s*.*/, "")}
                </div>
                <div className="text-sm text-gray-600 mt-1">{strength.text}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Critical Areas */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Critical Areas</h3>
          </div>
          <div className="space-y-3">
            {data.keyInsights.criticalWeaknesses.map((weakness, index) => (
              <div key={index} className="border-l-4 border-red-500 pl-4">
                <div className="text-sm font-medium text-red-700">
                  {weakness.section.replace("Section ", "").replace(/:\s*.*/, "")}
                </div>
                <div className="text-sm text-gray-600 mt-1">{weakness.text}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Detailed Analysis Tab
interface DetailedTabProps {
  data: {
    sections: Array<{
      title: string;
      summary: string;
      score: number;
      strengths: string[];
      weaknesses: string[];
    }>;
    heatMapData: Array<{
      dimension: string;
      score: number;
      intensity: number;
    }>;
  };
  onSectionSelect: (section: string | null) => void;
  selectedSection: string | null;
}

function DetailedTab({ data, onSectionSelect, selectedSection }: DetailedTabProps) {
  return (
    <div className="space-y-6">
      {/* Heat Map Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <h2 className="text-xl font-bold text-gray-900 mb-4">Maturity Heat Map</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {data.heatMapData.map((item, index) => (
            <div
              key={index}
              className="p-4 rounded-lg text-center cursor-pointer transition-all hover:scale-105"
              style={{
                backgroundColor: getHeatMapColor(item.intensity),
                color: item.intensity > 0.6 ? 'white' : 'black'
              }}
              onClick={() => onSectionSelect(item.dimension)}
            >
              <div className="text-sm font-medium">{item.dimension}</div>
              <div className="text-lg font-bold">{item.score}/5</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Section Details */}
      <div className="grid grid-cols-1 gap-6">
        {data.sections.map((section, index) => (
          <SectionAnalysisCard
            key={index}
            section={section}
            isExpanded={selectedSection === section.title}
            onToggle={() => onSectionSelect(
              selectedSection === section.title ? null : section.title
            )}
          />
        ))}
      </div>
    </div>
  );
}

function SectionAnalysisCard({
  section,
  isExpanded,
  onToggle
}: {
  section: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
    >
      <div
        className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <ScoreBadge score={section.score} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {section.title.replace("Section ", "").replace(/:\s*.*/, "")}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {section.strengths.length} strengths, {section.weaknesses.length} areas for improvement
              </p>
            </div>
          </div>
          <ChevronRightIcon
            className={`h-5 w-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''
              }`}
          />
        </div>
      </div>

      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-gray-200"
        >
          <div className="p-6 space-y-6">
            {/* Summary */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{section.summary}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div>
                <h4 className="font-medium text-green-700 mb-3 flex items-center">
                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                  Strengths ({section.strengths.length})
                </h4>
                <ul className="space-y-2">
                  {section.strengths.map((strength: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-green-500">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses */}
              <div>
                <h4 className="font-medium text-red-700 mb-3 flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                  Areas for Improvement ({section.weaknesses.length})
                </h4>
                <ul className="space-y-2">
                  {section.weaknesses.map((weakness: string, idx: number) => (
                    <li key={idx} className="text-sm text-gray-700 pl-4 border-l-2 border-red-500">
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// Recommendations Tab
interface RecommendationsTabProps {
  data: {
    recommendations: Array<{
      title: string;
      priority: string;
      description: string;
      timeline: string;
    }>;
  };
}

function RecommendationsTab({ data }: RecommendationsTabProps) {
  const groupedRecommendations = {
    High: data.recommendations.filter(r => r.priority === 'High'),
    Medium: data.recommendations.filter(r => r.priority === 'Medium'),
    Low: data.recommendations.filter(r => r.priority === 'Low')
  };

  return (
    <div className="space-y-8">
      {Object.entries(groupedRecommendations).map(([priority, recommendations], groupIndex) => (
        <motion.div
          key={priority}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.1 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center mb-4">
            <PriorityIcon priority={priority} />
            <h2 className="text-xl font-bold text-gray-900 ml-2">
              {priority} Priority Recommendations
            </h2>
            <span className="ml-2 bg-gray-100 text-gray-800 text-sm px-2 py-1 rounded-full">
              {recommendations.length}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={index} recommendation={rec} />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RecommendationCard({ recommendation }: { recommendation: any }) {
  const priorityColors = {
    High: 'border-red-500 bg-red-50',
    Medium: 'border-yellow-500 bg-yellow-50',
    Low: 'border-green-500 bg-green-50'
  };

  return (
    <div className={`p-4 rounded-lg border-l-4 ${priorityColors[recommendation.priority as keyof typeof priorityColors]}`}>
      <h3 className="font-semibold text-gray-900 mb-2">{recommendation.title}</h3>
      <p className="text-sm text-gray-700 mb-3">{recommendation.description}</p>
      <div className="flex items-center text-xs text-gray-600">
        <ClockIcon className="h-4 w-4 mr-1" />
        <span>{recommendation.timeline}</span>
      </div>
    </div>
  );
}

function PriorityIcon({ priority }: { priority: string }) {
  const icons = {
    High: <ExclamationCircleIcon className="h-6 w-6 text-red-600" />,
    Medium: <ClockIcon className="h-6 w-6 text-yellow-600" />,
    Low: <CheckCircleIcon className="h-6 w-6 text-green-600" />
  };

  return icons[priority as keyof typeof icons] || icons.Medium;
}

// Utility Components
function getHeatMapColor(intensity: number): string {
  if (intensity <= 0.2) return '#fee2e2'; // red-100
  if (intensity <= 0.4) return '#fcd34d'; // yellow-300
  if (intensity <= 0.6) return '#a7f3d0'; // green-200
  if (intensity <= 0.8) return '#34d399'; // green-400
  return '#10b981'; // green-500
}

interface MaturityBadgeProps {
  level: string;
}

function MaturityBadge({ level }: MaturityBadgeProps) {
  const colors = {
    Nascent: 'bg-red-100 text-red-800',
    Emerging: 'bg-yellow-100 text-yellow-800',
    Developing: 'bg-blue-100 text-blue-800',
    Advanced: 'bg-green-100 text-green-800',
    Transformative: 'bg-purple-100 text-purple-800'
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors[level as keyof typeof colors] || colors.Developing}`}>
      {level}
    </span>
  );
}

interface ScoreBadgeProps {
  score: number;
}

function ScoreBadge({ score }: ScoreBadgeProps) {
  const color = score <= 2 ? 'bg-red-500' : score <= 3 ? 'bg-yellow-500' : 'bg-green-500';

  return (
    <div className={`${color} text-white rounded-lg w-12 h-12 flex items-center justify-center`}>
      <span className="text-lg font-bold">{score}</span>
    </div>
  );
}

interface MaturityRadarChartProps {
  data: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }>;
  };
}

function MaturityRadarChart({ data }: MaturityRadarChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (chartRef.current && data.labels.length > 0) {
      const ctx = chartRef.current.getContext('2d');
      if (ctx) {
        // Destroy existing chart
        if (chartInstance.current) {
          chartInstance.current.destroy();
        }

        chartInstance.current = new Chart(ctx, {
          type: 'radar',
          data: data,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              r: {
                beginAtZero: true,
                min: 0,
                max: 5,
                ticks: {
                  stepSize: 1
                }
              }
            },
            plugins: {
              legend: {
                position: 'top' as const,
              }
            }
          }
        });
      }
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  if (data.labels.length === 0) {
    return (
      <div className="relative h-64 w-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">No data available for chart</p>
      </div>
    );
  }

  return (
    <div className="relative h-64 w-full">
      <canvas ref={chartRef} />
    </div>
  );
}

function MetricsGrid({ sections }: { sections: any[] }) {
  if (sections.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No sections available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sections.map((section, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span className="text-sm font-medium text-gray-700">
            {section.title.replace("Section ", "").replace(/:\s*.*/, "")}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">{section.score}/5</span>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(section.score / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
