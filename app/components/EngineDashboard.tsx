import { Activity, TrendingUp, Users, Target, Clock } from "lucide-react";
import MetricsCard from "./MetricsCard";
import ProgressRing from "./ProgressRing";
import InsightsPanel from "./InsightsPanel";
import TrendChart from "./TrendChart";
import RiskGauge from "./RiskGauge";

interface EngineDashboardProps {
    engineData: {
        id: string;
        name: string;
        description: string;
        icon: string;
    };
    metrics: {
        completionRate: number;
        totalSubmissions: number;
        averageScore: number;
        lastUpdated: string;
        activeUsers?: number;
        timeSpent?: number;
    };
    assessmentData: {
        currentProgress: number;
        sectionsCompleted: number;
        totalSections: number;
    };
    insights: Array<{
        id: string;
        title: string;
        description: string;
        priority: "high" | "medium" | "low";
        category: "strength" | "improvement" | "recommendation" | "risk";
        actionable?: boolean;
    }>;
    historicalData?: {
        dates: string[];
        scores: number[];
    };
}

export default function EngineDashboard({
    engineData,
    metrics,
    assessmentData,
    insights,
    historicalData,
}: EngineDashboardProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="text-6xl">{engineData.icon}</div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-2">
                                {engineData.name}
                            </h1>
                            <p className="text-lg text-gray-600">{engineData.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>Last updated: {new Date(metrics.lastUpdated).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricsCard
                        title="Completion Rate"
                        value={metrics.completionRate}
                        suffix="%"
                        icon={Target}
                        colorScheme="blue"
                        trend={{
                            value: 12,
                            isPositive: true,
                        }}
                    />
                    <MetricsCard
                        title="Total Submissions"
                        value={metrics.totalSubmissions}
                        icon={Activity}
                        colorScheme="green"
                    />
                    <MetricsCard
                        title="Average Score"
                        value={metrics.averageScore}
                        suffix="/100"
                        icon={TrendingUp}
                        colorScheme="purple"
                        trend={{
                            value: 8,
                            isPositive: true,
                        }}
                    />
                    <MetricsCard
                        title="Active Users"
                        value={metrics.activeUsers || 0}
                        icon={Users}
                        colorScheme="amber"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Progress Section */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Activity className="w-6 h-6 text-blue-600" />
                                Current Progress
                            </h2>

                            <div className="flex flex-col items-center justify-center py-8">
                                <ProgressRing
                                    progress={assessmentData.currentProgress}
                                    size={200}
                                    strokeWidth={16}
                                    label="Complete"
                                />

                                <div className="mt-8 w-full space-y-3">
                                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                                        <span className="text-sm font-medium text-gray-700">Sections Completed</span>
                                        <span className="text-lg font-bold text-blue-600">
                                            {assessmentData.sectionsCompleted}/{assessmentData.totalSections}
                                        </span>
                                    </div>

                                    {metrics.timeSpent && (
                                        <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                            <span className="text-sm font-medium text-gray-700">Time Spent</span>
                                            <span className="text-lg font-bold text-purple-600">
                                                {metrics.timeSpent} min
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Risk Assessment */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <RiskGauge
                                        riskLevel={
                                            assessmentData.currentProgress >= 80
                                                ? "low"
                                                : assessmentData.currentProgress >= 50
                                                    ? "medium"
                                                    : "high"
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Assessment Breakdown */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">
                                Assessment Breakdown
                            </h2>

                            <div className="space-y-4">
                                {/* Mock section data - replace with real data */}
                                {[
                                    { name: "Digital Infrastructure", score: 85, color: "blue" },
                                    { name: "Process Automation", score: 72, color: "green" },
                                    { name: "Data Analytics", score: 68, color: "purple" },
                                    { name: "Employee Experience", score: 91, color: "amber" },
                                    { name: "Integration Capability", score: 55, color: "indigo" },
                                ].map((section, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-700">
                                                {section.name}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900">
                                                {section.score}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                            <div
                                                className={`h-2.5 rounded-full bg-gradient-to-r from-${section.color}-500 to-${section.color}-600 transition-all duration-1000`}
                                                style={{ width: `${section.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <button className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
                                    View Detailed Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Insights Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                        </svg>
                        AI-Powered Insights & Recommendations
                    </h2>

                    <InsightsPanel insights={insights} />
                </div>

                {/* Historical Trends (if data available) */}
                {historicalData && historicalData.dates.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <TrendChart
                            dates={historicalData.dates}
                            scores={historicalData.scores}
                            title="Historical Progress Trends"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
