import { useState } from "react";
import VendorComparisonCard from "../VendorComparisonCard";
import RadarChart from "../RadarChart";
import CostBreakdownChart from "../CostBreakdownChart";
import ScoringMatrix from "../ScoringMatrix";
import RecommendationPanel from "../RecommendationPanel";
import RiskGauge from "../RiskGauge";
import InsightsPanel from "../InsightsPanel";

interface VendorFitDashboardProps {
    engineData: {
        name: string;
        description: string;
        icon: string;
    };
    assessmentData: {
        currentProgress: number;
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

export default function VendorFitDashboard({
    engineData,
    assessmentData,
    insights,
}: VendorFitDashboardProps) {
    const [selectedVendorIndex, setSelectedVendorIndex] = useState(0);

    // Vendor data
    const vendors = [
        {
            name: "Vendor A",
            status: "top-choice" as const,
            fitScore: 92,
            cost: "₹96 Lakhs",
        },
        {
            name: "Vendor B",
            status: "moderate" as const,
            fitScore: 78,
            cost: "₹82 Lakhs",
        },
        {
            name: "Vendor C",
            status: "evaluated" as const,
            fitScore: 65,
            cost: "₹110 Lakhs",
        },
    ];

    const selectedVendor = vendors[selectedVendorIndex];

    // Radar chart data
    const radarData = {
        labels: ["Cost Efficiency", "Support", "Quality", "Delivery", "Tech Fit", "Compliance"],
        datasets: [
            {
                label: "Vendor A",
                data: [92, 85, 90, 88, 95, 87],
                color: "rgb(16, 185, 129)",
            },
            {
                label: "Vendor B",
                data: [78, 80, 75, 82, 70, 85],
                color: "rgb(245, 158, 11)",
            },
            {
                label: "Vendor C",
                data: [65, 70, 68, 75, 60, 72],
                color: "rgb(59, 130, 246)",
            },
        ],
    };

    // Cost breakdown
    const costBreakdown = [
        { label: "License", value: 57.6, percentage: 60, color: "#3B82F6" },
        { label: "Implementation", value: 24, percentage: 25, color: "#10B981" },
        { label: "Training", value: 14.4, percentage: 15, color: "#F59E0B" },
    ];

    // Scoring parameters
    const scoringParameters = [
        {
            name: "Functional Coverage",
            weight: 30,
            scores: { "Vendor A": 9, "Vendor B": 7, "Vendor C": 6 },
            impact: "HIGH" as const,
        },
        {
            name: "Technical Architecture",
            weight: 20,
            scores: { "Vendor A": 8.5, "Vendor B": 8, "Vendor C": 7 },
            impact: "HIGH" as const,
        },
        {
            name: "User Experience (UX)",
            weight: 15,
            scores: { "Vendor A": 9, "Vendor B": 6, "Vendor C": 7 },
            impact: "MED" as const,
        },
        {
            name: "Cost of Ownership",
            weight: 25,
            scores: { "Vendor A": 7, "Vendor B": 9, "Vendor C": 5 },
            impact: "HIGH" as const,
        },
        {
            name: "Vendor Viability",
            weight: 10,
            scores: { "Vendor A": 9.5, "Vendor B": 8, "Vendor C": 8 },
            impact: "LOW" as const,
        },
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
                    Compare vendor fit, TCO, and risk metrics to finalize your HCM partner selection.
                </p>
            </div>

            {/* Vendor Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {vendors.map((vendor, index) => (
                    <VendorComparisonCard
                        key={index}
                        vendorName={vendor.name}
                        status={vendor.status}
                        fitScore={vendor.fitScore}
                        estimatedCost={vendor.cost}
                        isSelected={selectedVendorIndex === index}
                        onSelect={() => setSelectedVendorIndex(index)}
                        onViewDetails={() => alert(`Viewing details for ${vendor.name}`)}
                    />
                ))}
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Radar Chart */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                    <RadarChart
                        labels={radarData.labels}
                        datasets={radarData.datasets}
                        title="Comparative Analysis"
                    />
                </div>

                {/* Cost Breakdown & Risk */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                        <CostBreakdownChart
                            totalCost="₹96.0L"
                            breakdown={costBreakdown}
                        />
                    </div>
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
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

            {/* Scoring Matrix */}
            <ScoringMatrix
                parameters={scoringParameters}
                vendors={["Vendor A", "Vendor B", "Vendor C"]}
                onViewFullReport={() => alert("Opening full report...")}
                className="mb-8"
            />

            {/* Insights Panel */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-7 h-7 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
                    </svg>
                    AI-Powered Vendor Insights
                </h2>
                <InsightsPanel insights={insights} />
            </div>

            {/* Recommendation Panel */}
            <RecommendationPanel
                selectedVendor={selectedVendor.name}
                reason={`${selectedVendor.name} outperforms in functional coverage and UX, aligning with your long-term strategic goals despite a marginally higher initial cost. The vendor demonstrates strong technical architecture and excellent vendor viability scores.`}
                advantages={["High Scalability", "Seamless API", "Best-in-class UX", "Strong Support"]}
                onProceed={() => {
                    alert(`Proceeding with ${selectedVendor.name} selection!`);
                }}
                onChangeSelection={() => {
                    setSelectedVendorIndex((prev) => (prev + 1) % vendors.length);
                }}
                className="mb-8"
            />
        </main>
    );
}
