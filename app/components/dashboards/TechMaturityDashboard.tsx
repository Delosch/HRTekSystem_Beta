import { Activity, TrendingUp, Target, Zap, Database, Users as UsersIcon } from "lucide-react";
import MetricsCard from "../MetricsCard";
import ProgressRing from "../ProgressRing";
import InsightsPanel from "../InsightsPanel";
import TrendChart from "../TrendChart";
import RadarChart from "../RadarChart";

interface TechMaturityDashboardProps {
    engineData: {
        name: string;
        description: string;
        icon: string;
    };
    metrics: {
        completionRate: number;
        totalSubmissions: number;
        averageScore: number;
        lastUpdated: string;
        activeUsers: number;
        timeSpent: number;
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
        actionable: boolean;
    }>;
    historicalData?: {
        dates: string[];
        scores: number[];
    };
}

export default function TechMaturityDashboard({
    engineData,
    metrics,
    assessmentData,
    insights,
    historicalData,
}: TechMaturityDashboardProps) {
    // Technology maturity dimensions
    const maturityData = {
        labels: [
            "Digital Infrastructure",
            "Process Automation",
            "Data & Analytics",
            "Employee Experience",
            "Integration Capability",
            "Innovation Readiness"
        ],
        datasets: [
            {
                label: "Current Maturity",
                data: [85, 72, 68, 91, 55, 60],
                color: "rgb(59, 130, 246)",
            },
            {
                label: "Industry Benchmark",
                data: [75, 70, 72, 80, 65, 68],
                color: "rgb(156, 163, 175)",
            },
        ],
    };

    // Technology gaps
    const technologyGaps = [
        { area: "Integration Capability", gap: 10, priority: "HIGH", recommendation: "Invest in API management platform" },
        { area: "Innovation Readiness", gap: 8, priority: "HIGH", recommendation: "Establish innovation lab" },
        { area: "Data & Analytics", gap: 4, priority: "MED", recommendation: "Enhance analytics capabilities" },
    ];

    return (
        <main className="max-w-[1600px] mx-auto px-6 py-8">
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
                <p className="text-sm text-gray-500">
                    Assess your HR technology landscape, identify gaps, and benchmark against industry standards.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricsCard
                    title="Overall Maturity"
                    value={metrics.averageScore}
                    suffix="/100"
                    icon={Target}
                    colorScheme="blue"
                    trend={{ value: 12, isPositive: true }}
                />
                <MetricsCard
                    title="Digital Infrastructure"
                    value={85}
                    suffix="%"
                    icon={Database}
                    colorScheme="green"
                />
                <MetricsCard
                    title="Process Automation"
                    value={72}
                    suffix="%"
                    icon={Zap}
                    colorScheme="purple"
                />
                <MetricsCard
                    title="Integration Score"
                    value={55}
                    suffix="%"
                    icon={Activity}
                    colorScheme="amber"
                    trend={{ value: -5, isPositive: false }}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Progress Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-blue-600" />
                            Assessment Progress
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

                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                    <span className="text-sm font-medium text-gray-700">Time Spent</span>
                                    <span className="text-lg font-bold text-purple-600">
                                        {metrics.timeSpent} min
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Technology Maturity Radar */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
                        <RadarChart
                            labels={maturityData.labels}
                            datasets={maturityData.datasets}
                            title="Technology Maturity Assessment"
                        />
                    </div>
                </div>
            </div>

            {/* Technology Gaps */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Critical Technology Gaps
                </h2>
                <div className="space-y-4">
                    {technologyGaps.map((gap, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{gap.area}</h3>
                                <p className="text-sm text-gray-600 mt-1">{gap.recommendation}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Gap</p>
                                    <p className="text-2xl font-bold text-red-600">{gap.gap}%</p>
                                </div>
                                <span
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${gap.priority === "HIGH"
                                        ? "bg-red-100 text-red-700"
                                        : "bg-amber-100 text-amber-700"
                                        }`}
                                >
                                    {gap.priority}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    AI-Powered Insights & Recommendations
                </h2>
                <InsightsPanel insights={insights} />
            </div>

            {/* Historical Trends */}
            {historicalData && historicalData.dates.length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <TrendChart
                        dates={historicalData.dates}
                        scores={historicalData.scores}
                        title="Maturity Progress Over Time"
                    />
                </div>
            )}
        </main>
    );
}
