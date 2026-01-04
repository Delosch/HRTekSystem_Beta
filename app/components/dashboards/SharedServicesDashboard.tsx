import { Building2, Users, MapPin, TrendingUp, DollarSign, Clock } from "lucide-react";
import MetricsCard from "../MetricsCard";
import InsightsPanel from "../InsightsPanel";
import ProgressRing from "../ProgressRing";

interface SharedServicesDashboardProps {
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

export default function SharedServicesDashboard({
    engineData,
    metrics,
    assessmentData,
    insights,
}: SharedServicesDashboardProps) {
    // Service catalog
    const services = [
        { name: "Payroll Processing", type: "Transactional", headcount: 12, location: "Bangalore", sla: "99.5%" },
        { name: "Benefits Administration", type: "Transactional", headcount: 8, location: "Mumbai", sla: "98.0%" },
        { name: "Talent Acquisition", type: "COE", headcount: 15, location: "Hyderabad", sla: "95.0%" },
        { name: "Learning & Development", type: "COE", headcount: 10, location: "Pune", sla: "97.0%" },
        { name: "HR Analytics", type: "COE", headcount: 6, location: "Bangalore", sla: "96.5%" },
        { name: "Employee Relations", type: "Business Partner", headcount: 20, location: "Multiple", sla: "94.0%" },
    ];

    // Headcount distribution
    const headcountByType = [
        { type: "Transactional SSC", count: 20, percentage: 28 },
        { type: "COE", count: 31, percentage: 44 },
        { type: "Business Partners", count: 20, percentage: 28 },
    ];

    // Cost savings projection
    const costSavings = {
        currentCost: "₹15 Cr",
        projectedCost: "₹10.5 Cr",
        savings: "₹4.5 Cr",
        savingsPercentage: 30,
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
                    Design your optimal shared services model with SSC, COE, and Business Partner structure.
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <MetricsCard
                    title="Total Headcount"
                    value={71}
                    suffix=" FTEs"
                    icon={Users}
                    colorScheme="blue"
                />
                <MetricsCard
                    title="Service Locations"
                    value={4}
                    suffix=" cities"
                    icon={MapPin}
                    colorScheme="green"
                />
                <MetricsCard
                    title="Cost Savings"
                    value={30}
                    suffix="%"
                    icon={DollarSign}
                    colorScheme="purple"
                    trend={{ value: 30, isPositive: true }}
                />
                <MetricsCard
                    title="Avg SLA"
                    value={96.7}
                    suffix="%"
                    icon={TrendingUp}
                    colorScheme="amber"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                {/* Headcount Distribution */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Headcount Distribution
                        </h2>

                        <div className="space-y-6">
                            {headcountByType.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-gray-700">{item.type}</span>
                                        <span className="text-lg font-bold text-gray-900">{item.count} FTEs</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full ${index === 0 ? "bg-blue-500" :
                                                index === 1 ? "bg-purple-500" :
                                                    "bg-green-500"
                                                }`}
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">{item.percentage}% of total</p>
                                </div>
                            ))}
                        </div>

                        {/* Cost Savings */}
                        <div className="mt-8 p-4 bg-green-50 rounded-lg">
                            <h3 className="text-sm font-semibold text-green-900 mb-3">Projected Cost Savings</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Current Cost:</span>
                                    <span className="font-semibold text-gray-900">{costSavings.currentCost}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Projected Cost:</span>
                                    <span className="font-semibold text-gray-900">{costSavings.projectedCost}</span>
                                </div>
                                <div className="pt-2 border-t border-green-200 flex justify-between">
                                    <span className="text-sm font-semibold text-green-700">Annual Savings:</span>
                                    <span className="text-lg font-bold text-green-700">{costSavings.savings}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Service Catalog */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 h-full">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">
                            Service Catalog & Structure
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b-2 border-gray-200">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Service</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Type</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Headcount</th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600 uppercase">Location</th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600 uppercase">SLA</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service, index) => (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-4 px-4 text-sm font-medium text-gray-900">{service.name}</td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${service.type === "Transactional" ? "bg-blue-100 text-blue-700" :
                                                    service.type === "COE" ? "bg-purple-100 text-purple-700" :
                                                        "bg-green-100 text-green-700"
                                                    }`}>
                                                    {service.type}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-center text-sm font-bold text-gray-900">{service.headcount}</td>
                                            <td className="py-4 px-4 text-sm text-gray-600">{service.location}</td>
                                            <td className="py-4 px-4 text-center text-sm font-bold text-green-600">{service.sla}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Insights */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    Design Recommendations
                </h2>
                <InsightsPanel insights={insights} />
            </div>
        </main>
    );
}
