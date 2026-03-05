import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { findEngineData } from "~/models/engine.model.server";
import DashboardHeader from "~/components/DashboardHeader";
import TechMaturityDashboard from "~/components/dashboards/TechMaturityDashboard";
import RoadmapDashboard from "~/components/dashboards/RoadmapDashboard";
import VendorFitDashboard from "~/components/dashboards/VendorFitDashboard";
import SharedServicesDashboard from "~/components/dashboards/SharedServicesDashboard";
import ChangeManagementDashboard from "~/components/dashboards/ChangeManagementDashboard";
import { getLatestAnalysis } from "~/utils/question.utils";

// Engine configuration mapping - Updated names from image
const ENGINE_CONFIG: Record<string, { name: string; description: string; icon: string; id: string }> = {
    "hr-tech-maturity": {
        id: "hr-tech-maturity",
        name: "AI-driven HR Tech Diagnostics",
        description: "Comprehensive assessment of your HR technology landscape and digital readiness",
        icon: "📊",
    },
    "digital-roadmap": {
        id: "digital-roadmap",
        name: "Auto-generated HR Digital Roadmap & ROI",
        description: "Strategic roadmap for HR digital transformation initiatives with ROI projections",
        icon: "🗺️",
    },
    "hcm-vendor-fit": {
        id: "hcm-vendor-fit",
        name: "Cognitive HCM Vendor Fit Engine",
        description: "Intelligent vendor selection and HCM system recommendations",
        icon: "🎯",
    },
    "shared-services": {
        id: "shared-services",
        name: "Shared Services Operating Model Planner",
        description: "Design and optimize your HR shared services operating model",
        icon: "🏢",
    },
    "change-management": {
        id: "change-management",
        name: "Change Management Intelligence Engine",
        description: "Emotionally intelligent change strategy and stakeholder alignment",
        icon: "🔄",
    },
};

// Map engine IDs to their full names for database queries
const ENGINE_NAME_MAP: Record<string, string> = {
    "hr-tech-maturity": "HR Technology Maturity Analysis",
    "digital-roadmap": "HR Transformation Roadmap Generator",
    "hcm-vendor-fit": "HCM Vendor Fit Engine",
    "shared-services": "Shared Service Designer",
    "change-management": "Intelligent Change Management",
};

export async function loader({ params, request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);
    const engineId = params.engineId;

    if (!engineId || !ENGINE_CONFIG[engineId]) {
        throw new Response("Engine not found", { status: 404 });
    }

    const engineConfig = ENGINE_CONFIG[engineId];
    const engineFullName = ENGINE_NAME_MAP[engineId];

    // Fetch engine data from DynamoDB with error handling
    let engineData = null;
    try {
        engineData = user.organisationId
            ? await findEngineData(user.organisationId, engineFullName)
            : null;
    } catch (e) {
        console.error("⚠️ DynamoDB fetch failed, using fallback:", e);
    }

    const progress = engineData?.progress || 0;

    // Calculate metrics
    const metrics = {
        completionRate: progress,
        totalSubmissions: progress > 0 ? 1 : 0,
        averageScore: progress > 0 ? Math.floor(progress * 0.85) : 0,
        lastUpdated: String(engineData?.lastUpdated || new Date().toISOString()),
        activeUsers: 1,
        timeSpent: progress > 0 ? Math.floor(progress * 0.5) : 0,
    };

    // Assessment data
    const assessmentData = {
        currentProgress: progress,
        sectionsCompleted: Math.floor((progress / 100) * 10),
        totalSections: 10,
    };

    // Generate contextual insights with error handling
    let analysisResult = null;
    try {
        const latestAnalysis = await getLatestAnalysis(user.organisationId || "", engineFullName);
        analysisResult = latestAnalysis?.result;
    } catch (e) {
        console.error("⚠️ Analysis fetch failed:", e);
    }

    // Generate contextual insights from real analysis
    let insights = [
        {
            id: "1",
            title: "Assessment Not Started",
            description: "Complete the diagnostic assessment to generate AI-powered insights and maturity scores.",
            priority: "medium" as const,
            category: "recommendation" as const,
            actionable: true,
        }
    ];

    if (analysisResult?.maturity_analysis?.dimensional_scores) {
        insights = analysisResult.maturity_analysis.dimensional_scores.map((score: any, idx: number) => ({
            id: String(idx + 1),
            title: `${score.dimension}: ${score.maturity_level}`,
            description: `Maturity level is ${score.maturity_level} with a score of ${score.percentage}%.`,
            priority: score.percentage < 40 ? "high" : score.percentage < 70 ? "medium" : "low",
            category: score.percentage < 50 ? "improvement" : "strength",
            actionable: score.percentage < 70
        }));
    }

    // Historical data (mock for now)
    const historicalData = progress > 0 ? {
        dates: ["Week 1", "Week 2", "Week 3", "Week 4"],
        scores: [25, 45, 70, progress],
    } : undefined;

    return json({
        engineConfig,
        metrics: {
            ...metrics,
            averageScore: analysisResult?.maturity_analysis?.overall_score?.percentage || metrics.averageScore
        },
        assessmentData,
        insights,
        historicalData,
        analysisResult,
        user: {
            name: user.first_name,
            email: user.email,
        },
    });
}

export default function EngineDashboardRoute() {
    const { engineConfig, metrics, assessmentData, insights, historicalData, analysisResult, user } =
        useLoaderData<typeof loader>();
    const navigate = useNavigate();

    // Render engine-specific dashboard based on engineId
    const renderDashboard = () => {
        const commonProps = {
            engineData: engineConfig as any,
            metrics: metrics as any,
            assessmentData: assessmentData as any,
            insights: insights as any,
            historicalData: historicalData as any,
            brandName: "Your Organization" // Fallback or pass from loader
        };

        switch (engineConfig.id) {
            case "hr-tech-maturity":
                return <TechMaturityDashboard {...commonProps} analysisResult={analysisResult} />;

            case "digital-roadmap":
                return <RoadmapDashboard {...commonProps} />;

            case "hcm-vendor-fit":
                return <VendorFitDashboard
                    data={analysisResult}
                    brandName={commonProps.brandName}
                />;

            case "shared-services":
                return <SharedServicesDashboard {...commonProps} />;

            case "change-management":
                return <ChangeManagementDashboard {...commonProps} />;

            default:
                return (
                    <div className="max-w-[1600px] mx-auto px-6 py-8">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">
                                Dashboard Not Available
                            </h2>
                            <p className="text-gray-600">
                                This engine dashboard is currently under development.
                            </p>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30">
            {/* Header */}
            <DashboardHeader
                breadcrumbs={[
                    { label: "Overview", href: "/analysisDashboard" },
                    { label: "Assessment Dashboard" },
                    { label: engineConfig.name },
                ]}
                onExportReport={() => window.print()}
                onNewComparison={() => navigate("/analysisDashboard")}
                onSearch={(query) => console.log("Searching for:", query)}
                userName={user.name}
                notificationCount={3}
            />

            {/* Render Engine-Specific Dashboard */}
            {renderDashboard()}
        </div>
    );
}
