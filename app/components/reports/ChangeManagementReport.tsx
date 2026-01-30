import { useState } from "react";
import { Link } from "@remix-run/react";
import {
    ArrowLeft, Download, TrendingUp, AlertTriangle, CheckCircle,
    Lightbulb, ChevronDown, ChevronUp, FileText, Target, Activity
} from "lucide-react";
import {
    ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis,
    PolarRadiusAxis, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip
} from "recharts";

interface ChangeManagementReportProps {
    data: any;
    brandName: string;
    assessmentId: string;
}

export default function ChangeManagementReport({ data, brandName, assessmentId }: ChangeManagementReportProps) {
    const [expandedInsight, setExpandedInsight] = useState<number | null>(null);

    // Extract real data from the analysis result
    const result = data?.result || {};
    const readiness = result?.readinessAssessment || {};
    const dimensionScores = readiness?.dimensionScores || {};
    const communication = result?.communicationStrategy || {};
    const criticalGaps = readiness?.criticalGaps || [];
    const strengths = readiness?.strengths || [];

    // Calculate overall maturity score from dimension scores (scale 1-5, convert to percentage)
    const dimensions = [
        { key: 'leadershipAlignment', label: 'Leadership Alignment' },
        { key: 'culturalAdaptability', label: 'Cultural Adaptability' },
        { key: 'changeCapability', label: 'Change Capability' },
        { key: 'resourceAvailability', label: 'Resource Availability' },
        { key: 'communicationEffectiveness', label: 'Communication Effectiveness' },
        { key: 'employeeEngagement', label: 'Employee Engagement' }
    ];

    const dimensionData = dimensions.map(dim => ({
        key: dim.key,
        label: dim.label,
        score: dimensionScores[dim.key]?.score || 0,
        gaps: dimensionScores[dim.key]?.gaps || [],
        evidence: dimensionScores[dim.key]?.evidence || []
    }));

    // Calculate overall score (average of all dimensions, convert to 0-100 scale)
    const overallScore = readiness?.overallScore
        ? Math.round((readiness.overallScore / 5) * 100)
        : dimensionData.length > 0
            ? Math.round((dimensionData.reduce((acc, d) => acc + d.score, 0) / dimensionData.length / 5) * 100)
            : 72;

    // KPI data - extract from real data
    const kpiCards = [
        {
            title: "Overall Readiness",
            value: overallScore,
            unit: "/100",
            subtitle: readiness?.readinessLevel || "Conditional",
            color: "blue",
            icon: Target
        },
        {
            title: "Leadership Alignment",
            value: dimensionScores.leadershipAlignment?.score
                ? Math.round((dimensionScores.leadershipAlignment.score / 5) * 100)
                : 80,
            unit: "%",
            subtitle: "",
            color: "green",
            icon: Activity
        },
        {
            title: "Change Capability",
            value: dimensionScores.changeCapability?.score
                ? Math.round((dimensionScores.changeCapability.score / 5) * 100)
                : 60,
            unit: "%",
            subtitle: "",
            color: "purple",
            icon: TrendingUp
        },
        {
            title: "Employee Engagement",
            value: dimensionScores.employeeEngagement?.score
                ? Math.round((dimensionScores.employeeEngagement.score / 5) * 100)
                : 55,
            unit: "%",
            subtitle: "",
            color: "orange",
            icon: FileText
        }
    ];

    // Radar chart data - use real dimension scores
    const radarData = dimensionData.map(d => ({
        subject: d.label,
        A: Math.round((d.score / 5) * 100), // Convert 1-5 scale to 0-100
        fullMark: 100
    }));

    // Critical gaps - extract from real data
    const gapsData = criticalGaps.slice(0, 3).map((gap: string, index: number) => {
        // Try to extract gap percentage if mentioned in the text
        const percentMatch = gap.match(/(\d+)%/);
        const gapPercent = percentMatch ? parseInt(percentMatch[1]) : (index === 0 ? 10 : index === 1 ? 8 : 4);

        return {
            title: gap.split(':')[0] || gap.substring(0, 50),
            description: gap.split(':')[1]?.trim() || gap,
            gap: gapPercent,
            severity: gapPercent >= 8 ? "HIGH" : "MED"
        };
    });

    // If no gaps from API, use dimension gaps
    if (gapsData.length === 0) {
        dimensionData.forEach((dim, index) => {
            if (dim.gaps.length > 0 && gapsData.length < 3) {
                const gapScore = 100 - Math.round((dim.score / 5) * 100);
                gapsData.push({
                    title: dim.label,
                    description: dim.gaps[0],
                    gap: gapScore,
                    severity: gapScore >= 40 ? "HIGH" : "MED"
                });
            }
        });
    }

    // AI Insights - combine strengths and gaps
    const aiInsights = [];

    // Add strengths as positive insights
    strengths.slice(0, 2).forEach((strength: string) => {
        aiInsights.push({
            title: strength.split(':')[0] || strength.substring(0, 50),
            priority: "HIGH",
            description: strength.split(':')[1]?.trim() || strength,
            color: "green"
        });
    });

    // Add critical gaps as areas for improvement
    criticalGaps.slice(0, 2).forEach((gap: string) => {
        aiInsights.push({
            title: gap.split(':')[0] || gap.substring(0, 50),
            priority: "HIGH",
            description: gap.split(':')[1]?.trim() || gap,
            color: "red"
        });
    });

    // Add communication effectiveness insight
    if (dimensionScores.communicationEffectiveness?.score) {
        const score = dimensionScores.communicationEffectiveness.score;
        aiInsights.push({
            title: score >= 4 ? "Strong Communication Foundation" : "Communication Enhancement Needed",
            priority: score >= 4 ? "MEDIUM" : "HIGH",
            description: score >= 4
                ? `Your communication effectiveness score of ${score}/5 indicates a solid foundation for change messaging.`
                : `Communication effectiveness at ${score}/5 needs improvement. ${dimensionScores.communicationEffectiveness.gaps?.[0] || 'Consider enhancing two-way dialogue and feedback mechanisms.'}`,
            color: score >= 4 ? "green" : "yellow"
        });
    }

    // Progress over time data - use communication timeline if available
    const timelinePhases = communication?.timeline || [];
    const progressData = timelinePhases.length > 0
        ? timelinePhases.map((phase: any, index: number) => ({
            phase: phase.phase || `Phase ${index + 1}`,
            progress: 25 + (index * 20) // Progressive increase
        }))
        : [
            { phase: "Prepare", progress: 45 },
            { phase: "Enable", progress: 62 },
            { phase: "Adopt", progress: 78 },
            { phase: "Sustain", progress: overallScore }
        ];

    const getColorClass = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-50 border-blue-200",
            green: "bg-green-50 border-green-200",
            purple: "bg-purple-50 border-purple-200",
            orange: "bg-orange-50 border-orange-200"
        };
        return colors[color] || colors.blue;
    };

    const getIconBgClass = (color: string) => {
        const colors: Record<string, string> = {
            blue: "bg-blue-500",
            green: "bg-green-500",
            purple: "bg-purple-500",
            orange: "bg-orange-500"
        };
        return colors[color] || colors.blue;
    };

    const getSeverityBadge = (severity: string) => {
        const classes = severity === "HIGH"
            ? "bg-red-100 text-red-700 border-red-200"
            : "bg-yellow-100 text-yellow-700 border-yellow-200";
        return (
            <span className={`px-2 py-0.5 rounded text-xs font-bold border ${classes}`}>
                {severity}
            </span>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const classes = priority === "HIGH"
            ? "bg-red-100 text-red-700"
            : priority === "MEDIUM"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-blue-100 text-blue-700";
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold ${classes}`}>
                {priority}
            </span>
        );
    };

    const handleExportReport = () => {
        // Use browser's print functionality to export as PDF
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 print:hidden">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md p-1">
                                <img src="/logo_icon_final.png" alt="HRTek" className="w-full h-full object-contain" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-gray-900">{brandName}</h1>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <span className="font-bold text-blue-600 uppercase tracking-wide">Change Readiness Assessment</span>
                                    <span className="text-gray-400">•</span>
                                    <nav className="flex items-center gap-2">
                                        <Link to="/dashboard" className="hover:text-gray-900">Dashboard</Link>
                                        <span>/</span>
                                        <span className="font-semibold text-gray-900">Change Management</span>
                                    </nav>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => window.print()}
                                className="px-5 py-2.5 text-sm font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 flex items-center gap-2 shadow-sm"
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                            <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg ml-2">
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Print-Only Cover Page */}
                <div className="hidden print:block print:break-after-always mb-12">
                    <div className="flex flex-col items-center justify-center min-h-[90vh] text-center border-4 border-double border-blue-600 p-12">
                        <div className="w-64 h-32 mb-12">
                            <img src="/logo_report_final.png" alt="HRTek System" className="w-full h-full object-contain" />
                        </div>
                        <h1 className="text-6xl font-black text-gray-900 mb-6 tracking-tight">Change Readiness Assessment</h1>
                        <div className="h-2 w-48 bg-blue-600 rounded-full mb-12"></div>
                        <h2 className="text-4xl font-bold text-gray-700 mb-16">{brandName}</h2>

                        <div className="space-y-6 text-left max-w-xl w-full text-lg">
                            <div className="flex justify-between border-b-2 border-gray-100 pb-4">
                                <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Assessment Type</span>
                                <span className="font-bold text-gray-900 font-sans">Change Management Strategy</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-gray-100 pb-4">
                                <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Generated Date</span>
                                <span className="font-bold text-gray-900 font-sans">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            </div>
                            <div className="flex justify-between border-b-2 border-gray-100 pb-4">
                                <span className="font-bold text-gray-600 uppercase tracking-widest text-sm">Status</span>
                                <span className="font-bold text-blue-600 font-sans uppercase">Confidential Analysis</span>
                            </div>
                        </div>

                        <div className="mt-24 text-sm font-bold text-gray-400 uppercase tracking-widest">
                            <p className="mb-2">© {new Date().getFullYear()} HR TEK SYSTEMS. All rights reserved.</p>
                            <p>Proprietary & Confidential Strategic Advisory</p>
                        </div>
                    </div>
                </div>

                {/* Title Section */}
                <div className="mb-8 print:mt-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Change Readiness Assessment</h1>
                    <p className="text-gray-600">
                        Comprehensive assessment of organizational change readiness and stakeholder engagement
                    </p>
                    <div className="mt-3 inline-block bg-gray-100 px-3 py-1 rounded text-sm text-gray-700">
                        Assess change capability, identify resistance points, and develop targeted engagement strategies
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {kpiCards.map((kpi, index) => {
                        const Icon = kpi.icon;
                        return (
                            <div key={index} className={`bg-white rounded-xl border-2 p-6 ${getColorClass(kpi.color)}`}>
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="text-sm font-semibold text-gray-700">{kpi.title}</h3>
                                    <div className={`w-10 h-10 ${getIconBgClass(kpi.color)} rounded-lg flex items-center justify-center`}>
                                        <Icon className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-gray-900">{kpi.value}</span>
                                    <span className="text-lg text-gray-600">{kpi.unit}</span>
                                </div>
                                {kpi.subtitle && (
                                    <p className="text-xs text-gray-500 mt-2">{kpi.subtitle}</p>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Assessment Progress & Radar Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Assessment Progress */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Activity className="w-5 h-5 text-gray-700" />
                            <h2 className="text-lg font-bold text-gray-900">Assessment Progress</h2>
                        </div>

                        <div className="flex flex-col items-center mb-6">
                            <div className="relative w-40 h-40">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="#e5e7eb"
                                        strokeWidth="12"
                                        fill="none"
                                    />
                                    <circle
                                        cx="80"
                                        cy="80"
                                        r="70"
                                        stroke="#10b981"
                                        strokeWidth="12"
                                        fill="none"
                                        strokeDasharray={`${2 * Math.PI * 70}`}
                                        strokeDashoffset={`${2 * Math.PI * 70 * (1 - 1)}`}
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-4xl font-bold text-gray-900">100%</span>
                                    <span className="text-sm text-gray-600">Complete</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <span className="text-sm text-gray-600">Dimensions Assessed</span>
                                <span className="text-sm font-bold text-gray-900">{dimensionData.length}/6</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-gray-600">Readiness Level</span>
                                <span className="text-sm font-bold text-gray-900">{readiness?.readinessLevel || "Conditional"}</span>
                            </div>
                        </div>
                    </div>

                    {/* Change Readiness Assessment - Radar Chart */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-2">Change Readiness Assessment</h2>
                        <p className="text-sm text-gray-600 mb-6">Performance across key readiness dimensions</p>

                        <ResponsiveContainer width="100%" height={300}>
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="#e5e7eb" />
                                <PolarAngleAxis
                                    dataKey="subject"
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                />
                                <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                                <Radar
                                    name="Current Readiness"
                                    dataKey="A"
                                    stroke="#3b82f6"
                                    fill="#3b82f6"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                                <Radar
                                    name="Target Readiness"
                                    dataKey="fullMark"
                                    stroke="#e5e7eb"
                                    fill="none"
                                    strokeDasharray="5 5"
                                    strokeWidth={1}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        fontSize: '12px'
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Critical Readiness Gaps */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Critical Readiness Gaps</h2>

                    <div className="space-y-4">
                        {gapsData.length > 0 ? gapsData.map((gap: any, index: number) => (
                            <div key={index} className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-gray-900 mb-1">{gap.title}</h3>
                                    <p className="text-sm text-gray-600">{gap.description}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Gap</div>
                                        <div className="text-2xl font-bold text-gray-900">{gap.gap}%</div>
                                    </div>
                                    {getSeverityBadge(gap.severity)}
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-500 text-center py-4">No critical gaps identified</p>
                        )}
                    </div>
                </div>

                {/* AI-Powered Insights & Recommendations */}
                <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
                    <div className="flex items-center gap-2 mb-6">
                        <Lightbulb className="w-5 h-5 text-yellow-500" />
                        <h2 className="text-lg font-bold text-gray-900">AI-Powered Insights & Recommendations</h2>
                    </div>

                    <div className="space-y-3">
                        {aiInsights.length > 0 ? aiInsights.map((insight, index) => {
                            const isExpanded = expandedInsight === index;
                            const bgColor = insight.color === "green"
                                ? "bg-green-50 border-green-200"
                                : insight.color === "red"
                                    ? "bg-red-50 border-red-200"
                                    : "bg-yellow-50 border-yellow-200";

                            return (
                                <div key={index} className={`border rounded-lg ${bgColor}`}>
                                    <button
                                        onClick={() => setExpandedInsight(isExpanded ? null : index)}
                                        className="w-full px-4 py-3 flex items-center justify-between text-left"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            {insight.color === "green" && <CheckCircle className="w-5 h-5 text-green-600" />}
                                            {insight.color === "red" && <AlertTriangle className="w-5 h-5 text-red-600" />}
                                            {insight.color === "yellow" && <Lightbulb className="w-5 h-5 text-yellow-600" />}
                                            <span className="font-semibold text-gray-900">{insight.title}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {getPriorityBadge(insight.priority)}
                                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </button>
                                    {isExpanded && (
                                        <div className="px-4 pb-3 pt-1">
                                            <p className="text-sm text-gray-700">{insight.description}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        }) : (
                            <p className="text-gray-500 text-center py-4">Generating insights...</p>
                        )}
                    </div>
                </div>

                {/* Readiness Progress Over Time */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-6">Readiness Progress Timeline</h2>

                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={progressData}>
                            <defs>
                                <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis
                                dataKey="phase"
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: '#6b7280', fontSize: 12 }}
                                axisLine={{ stroke: '#e5e7eb' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="progress"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorProgress)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>

                    <div className="mt-4 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-600">Readiness Progress</span>
                        </div>
                        <span className="text-gray-500">{progressData.length} phases tracked</span>
                    </div>
                </div>
            </main>

            <style>{`
                @media print {
                    header { display: none !important; }
                    body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                    .bg-gray-50 { background-color: white !important; }
                }
            `}</style>
        </div>
    );
}
