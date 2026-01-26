// @ts-nocheck
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
    Building, Target, BarChart, CheckCircle, XCircle, ArrowRight, TrendingUp, TrendingDown,
    Shield, Users, Lightbulb, Briefcase, AlertTriangle, Zap, Clock, DollarSign, Gauge
} from 'lucide-react';

// --- Data ---
// Using the complete data object provided.
const reportData = {
    "pk": "COMPANY#8f3b5935-677e-4bcb-a4db-2649a15832a0",
    "sk": "ANALYSIS#2025-08-05T11:10:08.369Z",
    "assessment_id": "QUESTION#5f41bdc9-67f0-478d-bba3-0271141d0eae",
    "createdAt": "2025-08-05T11:10:08.369Z",
    "result": {
        "assessment_metadata": { "assessment_id": "DMA-2025-01-20-A4B1", "completion_date": "2025-01-20T10:00:00.000Z" },
        "detailed_recommendations": {
            "immediate_actions": {
                "actions": [{ "action": "Establish Digital Transformation Steering Committee", "dimension": "Innovation & Governance", "effort": "Medium", "estimated_cost": "$10,000 - $25,000", "impact": "High", "success_metrics": ["Committee charter approved and signed by executive sponsor", "Monthly governance meetings scheduled with clear agendas"] }],
                "priority": "Critical", "timeline": "0-3 months"
            },
            "short_term_initiatives": {
                "actions": [{ "action": "Deploy customer data platform (CDP) to unify customer view", "dimension": "Customer Experience", "effort": "High", "estimated_cost": "$100,000 - $250,000", "impact": "High", "success_metrics": ["CDP implementation complete and integrated with 2+ key systems", "Customer segmentation capabilities improved by 25%"] }],
                "priority": "High", "timeline": "3-12 months"
            }
        },
        "industry_benchmarking": {
            "capability_rankings": [
                { "dimension": "Strategic Foundation", "improvement_urgency": "Low", "industry_rank": "Top 25%", "score_gap_to_leaders": 0.7 },
                { "dimension": "Operations & Process", "improvement_urgency": "High", "industry_rank": "Bottom 30%", "score_gap_to_leaders": 1.5 }
            ],
            "peer_analysis": { "bottom_quartile_threshold": 2.8, "industry_average": 3.5, "similar_size_average": 3.4, "top_performers_average": 4.2 }
        },
        "maturity_analysis": {
            "dimensional_scores": [
                { "dimension": "Strategic Foundation", "confidence_score": 0.98, "critical_gaps": ["Budget allocation limitations", "Change resistance barriers"], "key_strengths": ["Strong executive leadership support", "Clear digital transformation roadmap"], "maturity_level": "Advanced", "raw_score": 4.3, "status": "Excellent" },
                { "dimension": "Technology & Infrastructure", "confidence_score": 0.95, "critical_gaps": ["Legacy system integration challenges", "Data quality and accessibility issues"], "key_strengths": ["Scalable IT infrastructure", "Effective cybersecurity measures"], "maturity_level": "Advanced", "raw_score": 3.5, "status": "On Track" },
                { "dimension": "Customer Experience", "confidence_score": 0.98, "critical_gaps": ["Limited personalization capabilities", "Weak customer feedback integration"], "key_strengths": ["Multi-channel digital presence", "Basic omnichannel capabilities"], "maturity_level": "Developing", "raw_score": 3.3, "status": "Needs Attention" },
                { "dimension": "Operations & Process", "confidence_score": 0.9, "critical_gaps": ["Manual workflow dependencies", "Limited operational efficiency measurement"], "key_strengths": ["Identified automation priorities", "Some process digitization"], "maturity_level": "Developing", "raw_score": 2.7, "status": "Critical" },
                { "dimension": "People & Culture", "confidence_score": 1, "critical_gaps": ["Moderate digital skills baseline", "Change management effectiveness"], "key_strengths": ["Cultural openness to digital change", "Clear skill development priorities"], "maturity_level": "Developing", "raw_score": 3.3, "status": "Needs Attention" },
                { "dimension": "Innovation & Governance", "confidence_score": 0.95, "critical_gaps": ["Budget constraints for innovation", "Systematic innovation processes"], "key_strengths": ["Some digital governance framework", "Risk awareness"], "maturity_level": "Developing", "raw_score": 2.7, "status": "Critical" },
                { "dimension": "Organization Overview", "confidence_score": 1, "critical_gaps": ["Current digital maturity stage limitations"], "key_strengths": ["Clear digital transformation awareness", "Appropriate organizational scale"], "maturity_level": "Developing", "raw_score": 3, "status": "Needs Attention" }
            ],
            "overall_score": { "maturity_level": "Developing", "industry_benchmark": { "peer_comparison": "Below" } }
        },
        "risk_assessment": {
            "transformation_risks": [
                { "impact": "High", "mitigation_strategy": "Implement a comprehensive change management program with clear communication, training, and employee involvement.", "probability": "Medium", "risk_category": "Cultural", "risk_description": "Employee resistance to digital transformation initiatives due to perceived threats to job security or increased workload." },
                { "impact": "Medium", "mitigation_strategy": "Adopt a phased implementation approach with thorough testing in a sandbox environment before full rollout.", "probability": "High", "risk_category": "Operational", "risk_description": "Disruption to core business processes during the integration of new technologies with legacy systems." }
            ]
        },
        "strategic_insights": {
            "competitive_position": "Currently positioned slightly below the industry average, your organization's strong strategic foundation provides a competitive advantage that can be leveraged by improving operational and customer-facing capabilities.",
            "transformation_readiness": { "readiness_level": "Medium", "score": 3.5, "enabling_factors": ["Strong executive leadership support", "Clear digital strategy", "Cultural openness to change"], "blocking_factors": ["Budget constraints", "Skills gaps", "Legacy system dependencies"] }
        },
        "success_metrics": {
            "kpi_framework": [
                { "dimension": "Strategic Foundation", "measurement_frequency": "Quarterly", "primary_kpis": ["Digital initiative success rate", "Strategic alignment score (survey-based)"], "target_improvement": "10% increase in success rate within 12 months" },
                { "dimension": "Customer Experience", "measurement_frequency": "Quarterly", "primary_kpis": ["Customer Lifetime Value (CLV)", "Net Promoter Score (NPS)"], "target_improvement": "5-point increase in NPS within 6 months of CDP implementation" }
            ]
        },
        "visualization_data": {
            "radar_chart": {
                "labels": ["Strategy", "Tech", "Customer", "Operations", "People", "Innovation", "Overview"],
                "current_scores": [4.3, 3.5, 3.3, 2.7, 3.3, 2.7, 3],
                "industry_benchmarks": [4, 3.8, 3.7, 3.2, 3.5, 3, 3],
                "target_scores": [5, 5, 5, 5, 5, 5, 5]
            }
        }
    }
};

// --- Helper Components ---

const Section = ({ title, subtitle, children }) => (
    <section className="p-8 md:p-12 bg-gray-50 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-lg text-gray-500 mb-8">{subtitle}</p>
        {children}
    </section>
);

const DimensionIcon = ({ dimension, className = "w-6 h-6" }) => {
    const icons = {
        "Strategic Foundation": <Target className={`${className} text-blue-500`} />,
        "Technology & Infrastructure": <Shield className={`${className} text-green-500`} />,
        "Customer Experience": <Users className={`${className} text-purple-500`} />,
        "Operations & Process": <Briefcase className={`${className} text-orange-500`} />,
        "People & Culture": <Users className={`${className} text-pink-500`} />,
        "Innovation & Governance": <Lightbulb className={`${className} text-yellow-500`} />,
        "Organization Overview": <Building className={`${className} text-indigo-500`} />,
    };
    return icons[dimension] || <BarChart className={`${className} text-gray-500`} />;
};

const getStatusStyles = (status) => {
    switch (status) {
        case 'Excellent': return { bg: 'bg-green-100', text: 'text-green-800' };
        case 'On Track': return { bg: 'bg-blue-100', text: 'text-blue-800' };
        case 'Needs Attention': return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
        case 'Critical': return { bg: 'bg-red-100', text: 'text-red-800' };
        default: return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
};

const getUrgencyStyles = (urgency) => {
    if (urgency === 'High') return 'text-red-600 font-semibold';
    if (urgency === 'Medium') return 'text-yellow-600 font-semibold';
    return 'text-green-600 font-semibold';
};

// --- Main Components ---

const CoverPage = ({ data }) => {
    const { assessment_metadata } = data.result;
    const completionDate = new Date(assessment_metadata.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
        <div className="h-screen w-full bg-cover bg-center flex flex-col justify-between p-12 text-white" style={{ backgroundImage: "url('https://placehold.co/1920x1080/0f172a/ffffff?text=.')" }}>
            <div>
                <div className="flex items-center mb-4">
                    <Building className="w-10 h-10 mr-4" />
                    <h1 className="text-2xl font-bold">Placeholder Company Inc.</h1>
                </div>
            </div>
            <div className="flex-grow flex flex-col justify-center items-start max-w-3xl">
                <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4 tracking-wide">Digital Maturity Assessment Report</h2>
                <p className="text-xl md:text-2xl text-gray-300 mb-8">Comprehensive Diagnostic Report – August 2025</p>
                <div className="space-y-3 text-lg">
                    <p><span className="font-semibold">Assessment ID:</span> {assessment_metadata.assessment_id}</p>
                    <p><span className="font-semibold">Date of Completion:</span> {completionDate}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-sm text-gray-400">Powered by Gemini AI</p>
            </div>
        </div>
    );
};

const ExecutiveSummary = ({ data }) => {
    const { strategic_insights, maturity_analysis } = data.result;
    const { radar_chart } = data.result.visualization_data;

    const chartData = radar_chart.labels.map((label, i) => ({
        subject: label,
        'Current': radar_chart.current_scores[i],
        'Benchmark': radar_chart.industry_benchmarks[i],
        fullMark: 5,
    }));

    return (
        <Section title="Executive Summary" subtitle="Strategic Insights at a Glance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-center">
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-700">Maturity Level</h4>
                            <p className="text-2xl font-bold text-blue-900">{maturity_analysis.overall_score.maturity_level}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                            <h4 className="text-sm font-semibold text-green-700">Competitive Position</h4>
                            <p className="text-2xl font-bold text-green-900">{maturity_analysis.overall_score.industry_benchmark.peer_comparison} Average</p>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200 col-span-1 sm:col-span-2">
                            <h4 className="text-sm font-semibold text-purple-700">Transformation Readiness</h4>
                            <p className="text-2xl font-bold text-purple-900">{strategic_insights.transformation_readiness.readiness_level} ({strategic_insights.transformation_readiness.score} / 5)</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-green-500" />Key Enabling Factors</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                {strategic_insights.transformation_readiness.enabling_factors.map(factor => (
                                    <li key={factor} className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />{factor}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><TrendingDown className="w-5 h-5 mr-2 text-red-500" />Key Blocking Factors</h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                {strategic_insights.transformation_readiness.blocking_factors.map(factor => (
                                    <li key={factor} className="flex items-start"><XCircle className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />{factor}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-center items-center">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Maturity Radar (Current vs. Benchmark)</h3>
                    <ResponsiveContainer width="100%" height={400}>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fontSize: 10 }} />
                            <Tooltip />
                            <Legend />
                            <Radar name="Current" dataKey="Current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                            <Radar name="Benchmark" dataKey="Benchmark" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.6} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </Section>
    );
};

const DimensionBreakdown = ({ data }) => {
    const { dimensional_scores } = data.result.maturity_analysis;
    return (
        <Section title="Maturity Dimension Breakdown" subtitle="A detailed look into each area of digital maturity.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {dimensional_scores.map(dim => {
                    const statusStyles = getStatusStyles(dim.status);
                    return (
                        <div key={dim.dimension} className="bg-white p-6 rounded-lg shadow-md border-l-4" style={{ borderLeftColor: statusStyles.bg.includes('green') ? '#4ade80' : statusStyles.bg.includes('blue') ? '#60a5fa' : statusStyles.bg.includes('yellow') ? '#facc15' : '#f87171' }}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center mb-2">
                                        <DimensionIcon dimension={dim.dimension} className="w-8 h-8" />
                                        <h3 className="text-xl font-bold text-gray-800 ml-3">{dim.dimension}</h3>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${statusStyles.bg} ${statusStyles.text}`}>{dim.status}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-gray-800">{dim.raw_score.toFixed(1)}</p>
                                    <p className="text-sm text-gray-500">Score</p>
                                </div>
                            </div>
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <h4 className="font-semibold text-green-700 mb-2">Key Strengths</h4>
                                    <ul className="space-y-1 text-gray-600">
                                        {dim.key_strengths.map(s => <li key={s} className="flex"><CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />{s}</li>)}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-red-700 mb-2">Critical Gaps</h4>
                                    <ul className="space-y-1 text-gray-600">
                                        {dim.critical_gaps.map(g => <li key={g} className="flex"><XCircle className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />{g}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Section>
    );
};

const DetailedRecommendations = ({ data }) => {
    const { immediate_actions, short_term_initiatives } = data.result.detailed_recommendations;
    const ActionCard = ({ action, timeline, priority }) => (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <h4 className="text-lg font-bold text-gray-800 mb-2">{action.action}</h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500 mb-4">
                <span className="flex items-center"><DimensionIcon dimension={action.dimension} className="w-4 h-4 mr-1.5" /> {action.dimension}</span>
                <span className="flex items-center"><Zap className="w-4 h-4 mr-1.5 text-yellow-500" /> Impact: {action.impact}</span>
                <span className="flex items-center"><Gauge className="w-4 h-4 mr-1.5 text-blue-500" /> Effort: {action.effort}</span>
                <span className="flex items-center"><DollarSign className="w-4 h-4 mr-1.5 text-green-500" /> Cost: {action.estimated_cost}</span>
            </div>
            <div>
                <h5 className="font-semibold text-gray-700 mb-2">Success Metrics</h5>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {action.success_metrics.map(metric => <li key={metric}>{metric}</li>)}
                </ul>
            </div>
        </div>
    );

    return (
        <Section title="Detailed Recommendations" subtitle="Actionable steps to accelerate your digital transformation.">
            <div className="space-y-8">
                <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center"><Clock className="w-6 h-6 mr-3 text-red-600" />Immediate Actions ({immediate_actions.timeline})</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {immediate_actions.actions.map(action => <ActionCard key={action.action} action={action} />)}
                    </div>
                </div>
                <div>
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center"><Clock className="w-6 h-6 mr-3 text-blue-600" />Short-Term Initiatives ({short_term_initiatives.timeline})</h3>
                    <div className="grid grid-cols-1 gap-6">
                        {short_term_initiatives.actions.map(action => <ActionCard key={action.action} action={action} />)}
                    </div>
                </div>
            </div>
        </Section>
    );
};

const IndustryBenchmarking = ({ data }) => {
    const { peer_analysis, capability_rankings } = data.result.industry_benchmarking;
    return (
        <Section title="Industry Benchmarking" subtitle="How you stack up against the competition.">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 text-center">
                <div className="bg-white p-4 rounded-lg shadow-sm"><h4 className="text-sm text-gray-500">Industry Average</h4><p className="text-2xl font-bold text-gray-800">{peer_analysis.industry_average}</p></div>
                <div className="bg-white p-4 rounded-lg shadow-sm"><h4 className="text-sm text-gray-500">Peer Group Average</h4><p className="text-2xl font-bold text-gray-800">{peer_analysis.similar_size_average}</p></div>
                <div className="bg-white p-4 rounded-lg shadow-sm"><h4 className="text-sm text-gray-500">Top Performers</h4><p className="text-2xl font-bold text-green-600">{peer_analysis.top_performers_average}</p></div>
                <div className="bg-white p-4 rounded-lg shadow-sm"><h4 className="text-sm text-gray-500">Bottom Performers</h4><p className="text-2xl font-bold text-red-600">{peer_analysis.bottom_quartile_threshold}</p></div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Capability Rankings</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="text-left py-2 px-4 font-semibold text-gray-600 text-sm">Dimension</th>
                                <th className="text-center py-2 px-4 font-semibold text-gray-600 text-sm">Industry Rank</th>
                                <th className="text-center py-2 px-4 font-semibold text-gray-600 text-sm">Gap to Leaders</th>
                                <th className="text-center py-2 px-4 font-semibold text-gray-600 text-sm">Improvement Urgency</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {capability_rankings.map(rank => (
                                <tr key={rank.dimension} className="border-b border-gray-200">
                                    <td className="py-3 px-4 flex items-center"><DimensionIcon dimension={rank.dimension} className="w-5 h-5 mr-3" />{rank.dimension}</td>
                                    <td className="py-3 px-4 text-center">{rank.industry_rank}</td>
                                    <td className="py-3 px-4 text-center">{rank.score_gap_to_leaders.toFixed(1)}</td>
                                    <td className={`py-3 px-4 text-center ${getUrgencyStyles(rank.improvement_urgency)}`}>{rank.improvement_urgency}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Section>
    );
};

const RiskAssessment = ({ data }) => {
    const { transformation_risks } = data.result.risk_assessment;
    return (
        <Section title="Risk Assessment" subtitle="Potential challenges in your transformation journey.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transformation_risks.map(risk => (
                    <div key={risk.risk_category} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-500" />{risk.risk_category} Risk</h3>
                        <div className="flex space-x-4 text-sm text-gray-500 mb-3">
                            <span className={`font-medium ${getUrgencyStyles(risk.impact)}`}>Impact: {risk.impact}</span>
                            <span className={`font-medium ${getUrgencyStyles(risk.probability)}`}>Probability: {risk.probability}</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-4">{risk.risk_description}</p>
                        <h4 className="font-semibold text-gray-700 mb-1">Mitigation Strategy</h4>
                        <p className="text-sm text-gray-600">{risk.mitigation_strategy}</p>
                    </div>
                ))}
            </div>
        </Section>
    );
};

const SuccessMetrics = ({ data }) => {
    const { kpi_framework } = data.result.success_metrics;
    return (
        <Section title="Success Metrics" subtitle="How to measure progress and define success.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {kpi_framework.map(kpi => (
                    <div key={kpi.dimension} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                            <DimensionIcon dimension={kpi.dimension} className="w-5 h-5 mr-2" />
                            {kpi.dimension}
                        </h3>
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-1">Primary KPIs</h4>
                            <ul className="list-disc list-inside text-sm text-gray-600">
                                {kpi.primary_kpis.map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                        <div className="mb-4">
                            <h4 className="font-semibold text-gray-700 mb-1">Target Improvement</h4>
                            <p className="text-sm text-gray-600 flex items-center"><Target className="w-4 h-4 mr-2 text-green-600" />{kpi.target_improvement}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-700 mb-1">Frequency</h4>
                            <p className="text-sm text-gray-600 flex items-center"><Clock className="w-4 h-4 mr-2 text-blue-600" />{kpi.measurement_frequency}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Section>
    );
};

// --- Main App Component ---

export default function App() {
    return (
        <main className="font-sans bg-white">
            <CoverPage data={reportData} />
            <ExecutiveSummary data={reportData} />
            <DimensionBreakdown data={reportData} />
            <DetailedRecommendations data={reportData} />
            <IndustryBenchmarking data={reportData} />
            <RiskAssessment data={reportData} />
            <SuccessMetrics data={reportData} />
        </main>
    );
}
