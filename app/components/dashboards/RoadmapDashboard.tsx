import { Calendar, CheckCircle, TrendingUp, DollarSign, Clock } from "lucide-react";
import MetricsCard from "../MetricsCard";
import InsightsPanel from "../InsightsPanel";
import TrendChart from "../TrendChart";

interface RoadmapDashboardProps {
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

export default function RoadmapDashboard({
    engineData,
    metrics,
    assessmentData,
    insights,
    historicalData,
}: RoadmapDashboardProps) {
    // Roadmap phases
    const phases = [
        {
            name: "Quick Wins",
            duration: "0-3 months",
            progress: 100,
            milestones: 5,
            completed: 5,
            color: "green",
            initiatives: ["Employee Self-Service Portal", "Digital Onboarding", "Mobile App Launch"]
        },
        {
            name: "Foundation",
            duration: "3-9 months",
            progress: 65,
            milestones: 8,
            completed: 5,
            color: "blue",
            initiatives: ["Core HRIS Implementation", "Performance Management System", "Learning Platform"]
        },
        {
            name: "Transformation",
            duration: "9-18 months",
            progress: 30,
            milestones: 10,
            completed: 3,
            color: "purple",
            initiatives: ["AI-Powered Recruitment", "Predictive Analytics", "Talent Marketplace"]
        },
        {
            name: "Optimization",
            duration: "18-24 months",
            progress: 0,
            milestones: 6,
            completed: 0,
            color: "amber",
            initiatives: ["Advanced Analytics", "Process Automation", "Continuous Improvement"]
        },
    ];

    // ROI projection
    const roiData = {
        dates: ["Q1", "Q2", "Q3", "Q4", "Q5", "Q6", "Q7", "Q8"],
        scores: [0, -50, -30, 20, 80, 150, 220, 300],
    };

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
                    Your personalized digital transformation roadmap with phased milestones and ROI projections.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricsCard
                    title="Overall Progress"
                    value={metrics.completionRate}
                    suffix="%"
                    icon={TrendingUp}
                    colorScheme="blue"
                    trend={{ value: 15, isPositive: true }}
                />
                <MetricsCard
                    title="Milestones Completed"
                    value={13}
                    suffix="/29"
                    icon={CheckCircle}
                    colorScheme="green"
                />
                <MetricsCard
                    title="Projected ROI"
                    value={300}
                    suffix="%"
                    icon={DollarSign}
                    colorScheme="purple"
                />
                <MetricsCard
                    title="Timeline"
                    value={24}
                    suffix=" months"
                    icon={Clock}
                    colorScheme="amber"
                />
            </div>

            {/* Roadmap Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Transformation Roadmap
                </h2>

                <div className="space-y-6">
                    {phases.map((phase, index) => (
                        <div key={index} className="relative">
                            {/* Phase Header */}
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full bg-${phase.color}-100 flex items-center justify-center`}>
                                        <span className="text-lg font-bold text-${phase.color}-600">{index + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{phase.name}</h3>
                                        <p className="text-sm text-gray-500">{phase.duration}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Progress</p>
                                    <p className="text-2xl font-bold text-gray-900">{phase.progress}%</p>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                                <div
                                    className={`h-3 rounded-full bg-gradient-to-r from-${phase.color}-500 to-${phase.color}-600 transition-all duration-1000`}
                                    style={{ width: `${phase.progress}%` }}
                                />
                            </div>

                            {/* Milestones */}
                            <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                                <span>{phase.completed}/{phase.milestones} milestones completed</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${phase.progress === 100 ? "bg-green-100 text-green-700" :
                                    phase.progress > 0 ? "bg-blue-100 text-blue-700" :
                                        "bg-gray-100 text-gray-700"
                                    }`}>
                                    {phase.progress === 100 ? "Completed" : phase.progress > 0 ? "In Progress" : "Planned"}
                                </span>
                            </div>

                            {/* Key Initiatives */}
                            <div className="pl-13">
                                <p className="text-sm font-medium text-gray-700 mb-2">Key Initiatives:</p>
                                <div className="flex flex-wrap gap-2">
                                    {phase.initiatives.map((initiative, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs"
                                        >
                                            {initiative}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < phases.length - 1 && (
                                <div className="absolute left-5 top-full w-0.5 h-6 bg-gray-300" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ROI Projection */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <TrendChart
                    dates={roiData.dates}
                    scores={roiData.scores}
                    title="ROI Projection Over Time"
                />
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    Strategic Recommendations
                </h2>
                <InsightsPanel insights={insights} />
            </div>
        </main>
    );
}
