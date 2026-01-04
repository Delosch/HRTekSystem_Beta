import { Users, AlertTriangle, TrendingUp, MessageSquare, Target } from "lucide-react";
import MetricsCard from "../MetricsCard";
import InsightsPanel from "../InsightsPanel";
import ProgressRing from "../ProgressRing";

interface ChangeManagementDashboardProps {
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
}

export default function ChangeManagementDashboard({
    engineData,
    metrics,
    assessmentData,
    insights,
}: ChangeManagementDashboardProps) {
    // Stakeholder groups
    const stakeholders = [
        { group: "Executive Leadership", influence: "High", support: "High", readiness: 85, count: 12, risk: "Low" },
        { group: "Middle Management", influence: "High", support: "Medium", readiness: 65, count: 45, risk: "Medium" },
        { group: "Frontline Employees", influence: "Low", support: "Medium", readiness: 55, count: 320, risk: "Medium" },
        { group: "HR Team", influence: "Medium", support: "High", readiness: 90, count: 25, risk: "Low" },
        { group: "IT Department", influence: "Medium", support: "Low", readiness: 45, count: 18, risk: "High" },
    ];

    // Communication timeline
    const communicationPhases = [
        { phase: "Awareness", duration: "Weeks 1-2", status: "Completed", activities: 5, completed: 5 },
        { phase: "Understanding", duration: "Weeks 3-4", status: "In Progress", activities: 6, completed: 4 },
        { phase: "Acceptance", duration: "Weeks 5-8", status: "Planned", activities: 8, completed: 0 },
        { phase: "Adoption", duration: "Weeks 9-12", status: "Planned", activities: 10, completed: 0 },
    ];

    // Resistance areas
    const resistanceAreas = [
        { area: "Process Changes", level: "High", impact: "Critical", mitigation: "Hands-on training sessions" },
        { area: "Technology Adoption", level: "High", impact: "High", mitigation: "Extended support period" },
        { area: "Role Clarity", level: "Medium", impact: "Medium", mitigation: "Clear communication plan" },
        { area: "Workload Concerns", level: "Medium", impact: "Medium", mitigation: "Phased rollout approach" },
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
                    Assess stakeholder readiness, identify resistance points, and develop targeted change strategies.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricsCard
                    title="Overall Readiness"
                    value={metrics.averageScore}
                    suffix="%"
                    icon={Target}
                    colorScheme="blue"
                    trend={{ value: 8, isPositive: true }}
                />
                <MetricsCard
                    title="Stakeholder Groups"
                    value={5}
                    suffix=" groups"
                    icon={Users}
                    colorScheme="green"
                />
                <MetricsCard
                    title="High Risk Areas"
                    value={2}
                    suffix=" areas"
                    icon={AlertTriangle}
                    colorScheme="red"
                />
                <MetricsCard
                    title="Communication Activities"
                    value={9}
                    suffix="/29"
                    icon={MessageSquare}
                    colorScheme="purple"
                />
            </div>

            {/* Stakeholder Readiness Matrix */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Stakeholder Readiness Matrix
                </h2>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Stakeholder Group</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Influence</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Support</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Readiness</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Count</th>
                                <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Risk</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stakeholders.map((stakeholder, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 text-sm font-medium text-gray-900">{stakeholder.group}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stakeholder.influence === "High" ? "bg-purple-100 text-purple-700" :
                                            stakeholder.influence === "Medium" ? "bg-blue-100 text-blue-700" :
                                                "bg-gray-100 text-gray-700"
                                            }`}>
                                            {stakeholder.influence}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stakeholder.support === "High" ? "bg-green-100 text-green-700" :
                                            stakeholder.support === "Medium" ? "bg-amber-100 text-amber-700" :
                                                "bg-red-100 text-red-700"
                                            }`}>
                                            {stakeholder.support}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`h-2 rounded-full ${stakeholder.readiness >= 80 ? "bg-green-500" :
                                                        stakeholder.readiness >= 60 ? "bg-blue-500" :
                                                            stakeholder.readiness >= 40 ? "bg-amber-500" :
                                                                "bg-red-500"
                                                        }`}
                                                    style={{ width: `${stakeholder.readiness}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-bold text-gray-900 w-12">{stakeholder.readiness}%</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center text-sm text-gray-600">{stakeholder.count}</td>
                                    <td className="py-4 px-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stakeholder.risk === "Low" ? "bg-green-100 text-green-700" :
                                            stakeholder.risk === "Medium" ? "bg-amber-100 text-amber-700" :
                                                "bg-red-100 text-red-700"
                                            }`}>
                                            {stakeholder.risk}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Communication Timeline */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Communication Plan Timeline
                </h2>

                <div className="space-y-4">
                    {communicationPhases.map((phase, index) => (
                        <div key={index} className="relative">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${phase.status === "Completed" ? "bg-green-100" :
                                        phase.status === "In Progress" ? "bg-blue-100" :
                                            "bg-gray-100"
                                        }`}>
                                        <span className={`text-lg font-bold ${phase.status === "Completed" ? "text-green-600" :
                                            phase.status === "In Progress" ? "text-blue-600" :
                                                "text-gray-600"
                                            }`}>{index + 1}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{phase.phase}</h3>
                                        <p className="text-sm text-gray-500">{phase.duration}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Activities</p>
                                    <p className="text-lg font-bold text-gray-900">{phase.completed}/{phase.activities}</p>
                                </div>
                            </div>

                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div
                                    className={`h-2 rounded-full ${phase.status === "Completed" ? "bg-green-500" :
                                        phase.status === "In Progress" ? "bg-blue-500" :
                                            "bg-gray-400"
                                        }`}
                                    style={{ width: `${(phase.completed / phase.activities) * 100}%` }}
                                />
                            </div>

                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${phase.status === "Completed" ? "bg-green-100 text-green-700" :
                                phase.status === "In Progress" ? "bg-blue-100 text-blue-700" :
                                    "bg-gray-100 text-gray-700"
                                }`}>
                                {phase.status}
                            </span>

                            {index < communicationPhases.length - 1 && (
                                <div className="absolute left-5 top-full w-0.5 h-4 bg-gray-300" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Resistance Risk Areas */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Resistance Risk Heatmap
                </h2>

                <div className="space-y-4">
                    {resistanceAreas.map((area, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{area.area}</h3>
                                <p className="text-sm text-gray-600 mt-1">Mitigation: {area.mitigation}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500">Impact</p>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${area.impact === "Critical" ? "bg-red-100 text-red-700" :
                                        area.impact === "High" ? "bg-orange-100 text-orange-700" :
                                            "bg-amber-100 text-amber-700"
                                        }`}>
                                        {area.impact}
                                    </span>
                                </div>
                                <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${area.level === "High" ? "bg-red-100 text-red-700" :
                                    "bg-amber-100 text-amber-700"
                                    }`}>
                                    {area.level} Risk
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    Change Strategy Recommendations
                </h2>
                <InsightsPanel insights={insights} />
            </div>
        </main>
    );
}
