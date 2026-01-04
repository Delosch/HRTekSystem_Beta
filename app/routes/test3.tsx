// @ts-nocheck
import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import {
    Building, Target, BarChart, CheckCircle, XCircle, TrendingUp, TrendingDown,
    Shield, Users, Lightbulb, Briefcase, AlertTriangle, Zap, Clock, DollarSign, Gauge, Activity
} from 'lucide-react';

// --- Data ---
// Paste the complete user data object here. This would typically be loaded
// via a Remix `loader` function.
const reportData = {
    "pk": "COMPANY#8f3b5935-677e-4bcb-a4db-2649a15832a0",
    // ... (rest of your JSON data)
    "sk": "ANALYSIS#2025-08-05T11:10:08.369Z",
    "assessment_id": "QUESTION#5f41bdc9-67f0-478d-bba3-0271141d0eae",
    "createdAt": "2025-08-05T11:10:08.369Z",
    "result": {
        "assessment_metadata": { "answered_questions": 29, "assessment_id": "DMA-2025-01-20-A4B1", "completion_date": "2025-01-20T10:00:00.000Z", "completion_percentage": 100, "processing_confidence": 0.95, "total_questions": 29 },
        "detailed_recommendations": {
            "immediate_actions": { "actions": [{ "action": "Establish Digital Transformation Steering Committee", "dimension": "Innovation & Governance", "effort": "Medium", "estimated_cost": "$10,000 - $25,000", "impact": "High", "success_metrics": ["Committee charter approved and signed by executive sponsor", "Monthly governance meetings scheduled with clear agendas"] }], "priority": "Critical", "timeline": "0-3 months" },
            "short_term_initiatives": { "actions": [{ "action": "Deploy customer data platform (CDP) to unify customer view", "dimension": "Customer Experience", "effort": "High", "estimated_cost": "$100,000 - $250,000", "impact": "High", "success_metrics": ["CDP implementation complete and integrated with 2+ key systems", "Customer segmentation capabilities improved by 25%"] }], "priority": "High", "timeline": "3-12 months" }
        },
        "industry_benchmarking": {
            "capability_rankings": [{ "dimension": "Strategic Foundation", "improvement_urgency": "Low", "industry_rank": "Top 25%", "score_gap_to_leaders": 0.7 }, { "dimension": "Operations & Process", "improvement_urgency": "High", "industry_rank": "Bottom 30%", "score_gap_to_leaders": 1.5 }],
            "peer_analysis": { "bottom_quartile_threshold": 2.8, "industry_average": 3.5, "similar_size_average": 3.4, "top_performers_average": 4.2 }
        },
        "maturity_analysis": {
            "dimensional_scores": [
                { "confidence_score": 0.98, "critical_gaps": ["Budget allocation limitations", "Change resistance barriers"], "dimension": "Strategic Foundation", "key_strengths": ["Strong executive leadership support", "Clear digital transformation roadmap"], "maturity_level": "Advanced", "raw_score": 4.3 },
                { "confidence_score": 0.95, "critical_gaps": ["Legacy system integration challenges", "Data quality and accessibility issues"], "dimension": "Technology & Infrastructure", "key_strengths": ["Scalable IT infrastructure", "Effective cybersecurity measures"], "maturity_level": "Advanced", "raw_score": 3.5 },
                { "confidence_score": 0.98, "critical_gaps": ["Limited personalization capabilities", "Weak customer feedback integration"], "dimension": "Customer Experience", "key_strengths": ["Multi-channel digital presence", "Basic omnichannel capabilities"], "maturity_level": "Developing", "raw_score": 3.3 },
                { "confidence_score": 0.9, "critical_gaps": ["Manual workflow dependencies", "Limited operational efficiency measurement"], "dimension": "Operations & Process", "key_strengths": ["Identified automation priorities", "Some process digitization"], "maturity_level": "Developing", "raw_score": 2.7 },
                { "confidence_score": 1, "critical_gaps": ["Moderate digital skills baseline", "Change management effectiveness"], "dimension": "People & Culture", "key_strengths": ["Cultural openness to digital change", "Clear skill development priorities"], "maturity_level": "Developing", "raw_score": 3.3 },
                { "confidence_score": 0.95, "critical_gaps": ["Budget constraints for innovation", "Systematic innovation processes"], "dimension": "Innovation & Governance", "key_strengths": ["Some digital governance framework", "Risk awareness"], "maturity_level": "Developing", "raw_score": 2.7 },
                { "confidence_score": 1, "critical_gaps": ["Current digital maturity stage limitations"], "dimension": "Organization Overview", "key_strengths": ["Clear digital transformation awareness", "Appropriate organizational scale"], "maturity_level": "Developing", "raw_score": 3 }
            ],
            "overall_score": { "confidence_score": 0.95, "industry_benchmark": { "industry_average": 3.5, "peer_comparison": "Below", "percentile_ranking": 40, "top_quartile_threshold": 4 }, "maturity_level": "Developing", "percentage": 66, "raw_score": 3.2, "weighted_score": 3.3 }
        },
        "organization_profile": { "company_name": "Placeholder Company Inc." }, // Added for Cover Page
        "risk_assessment": {
            "transformation_risks": [{ "impact": "High", "mitigation_strategy": "Implement a comprehensive change management program with clear communication, training, and employee involvement.", "probability": "Medium", "risk_category": "Cultural", "risk_description": "Employee resistance to digital transformation initiatives due to perceived threats to job security or increased workload." }, { "impact": "Medium", "mitigation_strategy": "Adopt a phased implementation approach with thorough testing in a sandbox environment before full rollout.", "probability": "High", "risk_category": "Operational", "risk_description": "Disruption to core business processes during the integration of new technologies with legacy systems." }]
        },
        "strategic_insights": {
            "competitive_position": "Currently positioned slightly below the industry average...",
            "transformation_readiness": { "blocking_factors": ["Budget constraints", "Skills gaps", "Legacy system dependencies"], "enabling_factors": ["Strong executive leadership support", "Clear digital strategy", "Cultural openness to change"], "readiness_level": "Medium", "score": 3.5 }
        },
        "success_metrics": {
            "kpi_framework": [{ "dimension": "Strategic Foundation", "measurement_frequency": "Quarterly", "primary_kpis": ["Digital initiative success rate", "Strategic alignment score (survey-based)"], "target_improvement": "10% increase in success rate within 12 months" }, { "dimension": "Customer Experience", "measurement_frequency": "Quarterly", "primary_kpis": ["Customer Lifetime Value (CLV)", "Net Promoter Score (NPS)"], "target_improvement": "5-point increase in NPS within 6 months of CDP implementation" }]
        },
        "visualization_data": {
            "gap_bubbles": [
                { "dimension": "Strategic Foundation", "status": "Excellent" },
                { "dimension": "Technology & Infrastructure", "status": "On_Track" },
                { "dimension": "Customer Experience", "status": "Needs_Attention" },
                { "dimension": "Operations & Process", "status": "Critical" },
                { "dimension": "People & Culture", "status": "Needs_Attention" },
                { "dimension": "Innovation & Governance", "status": "Critical" },
                { "dimension": "Organization Overview", "status": "Needs_Attention" }
            ],
            "heat_map": { /* ... data ... */ },
            "radar_chart": { "current_scores": [4.3, 3.5, 3.3, 2.7, 3.3, 2.7, 3], "industry_benchmarks": [4, 3.8, 3.7, 3.2, 3.5, 3, 3], "labels": ["Strategy", "Tech", "Customer", "Ops", "People", "Innovation", "Overview"], "target_scores": [5, 5, 5, 5, 5, 5, 5] }
        }
    }
};


// --- Helper Components & Functions ---

const Section = ({ title, subtitle, children }) => (
    <section className="p-8 md:p-12 bg-gray-50 border-t border-gray-200">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-lg text-gray-500 mb-8">{subtitle}</p>
        {children}
    </section>
);

const getStatusStyles = (status) => {
    switch (status) {
        case 'Excellent': return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-800' };
        case 'On_Track': return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' };
        case 'Needs_Attention': return { border: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-800' };
        case 'Critical': return { border: 'border-red-500', bg: 'bg-red-50', text: 'text-red-800' };
        default: return { border: 'border-gray-400', bg: 'bg-gray-50', text: 'text-gray-800' };
    }
};

const DimensionIcon = ({ dimension, className = "w-6 h-6" }) => {
    // Icon mapping remains the same as your example
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


// --- 1. Cover Page Component (Adheres to System Prompt) ---

const CoverPage = ({ metadata, profile }) => {
    const completionDate = new Date(metadata.completion_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const subtitleDate = new Date(metadata.completion_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <div
            className="h-screen w-full flex flex-col justify-center items-center text-center p-12 bg-slate-900 text-white"
            style={{
                backgroundImage: "url('/assets/reportAssets/image.png')",
                backgroundSize: 'cover', backgroundPosition: 'center', backgroundBlendMode: 'overlay'
            }}
        >
            <div className="absolute top-8 left-8 text-left">
                {/* Placeholder Logo */}
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                    <Building className="w-6 h-6 text-white" />
                </div>
                <p className="font-semibold text-lg">{profile.company_name || 'Placeholder Company Inc.'}</p>
            </div>

            <div className="flex-grow flex flex-col justify-center items-center">
                <h1 className="text-5xl font-extrabold tracking-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    Digital Maturity Assessment Report
                </h1>
                <h2 className="text-2xl font-light mt-4 text-gray-200">
                    Comprehensive Diagnostic Report – {subtitleDate}
                </h2>
                <p className="mt-8 font-mono text-lg py-2 px-4 border border-white/30 rounded-md">
                    Assessment ID: {metadata.assessment_id}
                </p>
            </div>

            <div className="absolute bottom-8 text-center w-full text-sm">
                <p className="text-gray-300">Date of Completion: {completionDate}</p>
                <p className="text-gray-400 mt-1">Powered by Perplexity AI</p>
            </div>
        </div>
    );
};


// --- 2. Executive Summary (Adheres to System Prompt) ---

const ExecutiveSummary = ({ insights, overallScore, vizData }) => {
    const chartData = vizData.radar_chart.labels.map((label, i) => ({
        subject: label,
        'Current': vizData.radar_chart.current_scores[i],
        'Benchmark': vizData.radar_chart.industry_benchmarks[i],
        'Target': vizData.radar_chart.target_scores[i],
        fullMark: 5,
    }));

    return (
        <Section title="Executive Summary" subtitle="Strategic insights into your digital capabilities.">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Left Column: Text Insights */}
                <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                            <h4 className="text-sm font-semibold text-blue-700">Maturity Level</h4>
                            <p className="text-2xl font-bold text-blue-900">{overallScore.maturity_level}</p>
                        </div>
                        <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                            <h4 className="text-sm font-semibold text-green-700">Competitive Position</h4>
                            <p className="text-xl font-bold text-green-900">{overallScore.industry_benchmark.peer_comparison} Average</p>
                        </div>
                        <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                            <h4 className="text-sm font-semibold text-purple-700">Readiness</h4>
                            <p className="text-2xl font-bold text-purple-900">{insights.transformation_readiness.readiness_level}</p>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-green-500" />Key Enabling Factors</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {insights.transformation_readiness.enabling_factors.map(factor => (
                                <li key={factor} className="flex items-start"><CheckCircle className="w-4 h-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />{factor}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center"><TrendingDown className="w-5 h-5 mr-2 text-red-500" />Key Blocking Factors</h3>
                        <ul className="space-y-2 text-sm text-gray-600">
                            {insights.transformation_readiness.blocking_factors.map(factor => (
                                <li key={factor} className="flex items-start"><XCircle className="w-4 h-4 mr-2 mt-0.5 text-red-500 flex-shrink-0" />{factor}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Column: Visuals */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg shadow-md h-96">
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Current vs. Benchmark vs. Target</h3>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 5]} />
                                <Tooltip />
                                <Legend />
                                <Radar name="Current" dataKey="Current" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                                <Radar name="Benchmark" dataKey="Benchmark" stroke="#FBBF24" fill="#FBBF24" fillOpacity={0.4} />
                                <Radar name="Target" dataKey="Target" stroke="#10B981" fill="#10B981" fillOpacity={0.2} strokeDasharray="3 3" />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-md flex items-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                            <Activity className="w-10 h-10 text-gray-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-gray-800">Heat Map Preview</h4>
                            <p className="text-sm text-gray-500">A detailed capability heat map is available in the full analysis section, highlighting specific strengths and weaknesses.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Section>
    );
};


// --- 3. Maturity Dimension Breakdown (Adheres to System Prompt) ---

const ProgressCard = ({ dimension }) => {
    const statusStyles = getStatusStyles(dimension.status);
    return (
        <div className={`bg-white p-4 rounded-lg shadow-md border-l-4 ${statusStyles.border}`}>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">{dimension.dimension}</h3>
                <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusStyles.bg} ${statusStyles.text}`}>{dimension.maturity_level}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Score</p>
                    <p className="text-xl font-semibold text-gray-900">{dimension.raw_score.toFixed(1)}</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Confidence</p>
                    <p className="text-xl font-semibold text-gray-900">{(dimension.confidence_score * 100)}%</p>
                </div>
                <div className="p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-500">Status</p>
                    <p className={`text-lg font-semibold ${statusStyles.text}`}>{dimension.status.replace('_', ' ')}</p>
                </div>
            </div>
        </div>
    );
};

const MaturityDimensionBreakdown = ({ dimensionalScores }) => (
    <Section title="Maturity Dimension Breakdown" subtitle="Performance overview for each of the 7 key dimensions.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dimensionalScores.map(dim => (
                <ProgressCard key={dim.dimension} dimension={dim} />
            ))}
        </div>
    </Section>
);


// --- Sections 4-7: Components based on your inspirational code ---
// These are refined for consistency and clarity.

const DetailedRecommendations = ({ data }) => { /* ... (Identical to your example code, as it's well-structured) ... */
    const { immediate_actions, short_term_initiatives } = data.detailed_recommendations;
    const ActionCard = ({ action }) => (
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
const IndustryBenchmarking = ({ data }) => { /* ... (Identical to your example code) ... */
    const { peer_analysis, capability_rankings } = data.industry_benchmarking;
    const getUrgencyStyles = (urgency) => {
        if (urgency === 'High') return 'text-red-600 font-semibold';
        if (urgency === 'Medium') return 'text-yellow-600 font-semibold';
        return 'text-green-600 font-semibold';
    };
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
const RiskAssessment = ({ data }) => { /* ... (Identical to your example code) ... */
    const { transformation_risks } = data.risk_assessment;
    const getUrgencyStyles = (urgency) => {
        if (urgency === 'High') return 'text-red-600 font-medium';
        if (urgency === 'Medium') return 'text-yellow-600 font-medium';
        return 'text-gray-600 font-medium';
    };
    return (
        <Section title="Risk Assessment" subtitle="Potential challenges in your transformation journey.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {transformation_risks.map(risk => (
                    <div key={risk.risk_category} className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center"><AlertTriangle className="w-5 h-5 mr-2 text-red-500" />{risk.risk_category} Risk</h3>
                        <div className="flex space-x-4 text-sm mb-3">
                            <span className={getUrgencyStyles(risk.impact)}>Impact: {risk.impact}</span>
                            <span className={getUrgencyStyles(risk.probability)}>Probability: {risk.probability}</span>
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
const SuccessMetrics = ({ data }) => { /* ... (Identical to your example code) ... */
    const { kpi_framework } = data.success_metrics;
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


// --- Main App Component to Assemble the Report ---

export default function DigitalMaturityReport() {
    // In a real Remix app, you'd get this from `useLoaderData()`
    const data = reportData.result;

    // Data Enrichment: Combine dimensional scores with their status for easier rendering.
    const enrichedDimensionalScores = data.maturity_analysis.dimensional_scores.map(score => {
        const vizInfo = data.visualization_data.gap_bubbles.find(p => p.dimension === score.dimension);
        return {
            ...score,
            status: vizInfo ? vizInfo.status : 'N/A'
        };
    });

    return (
        <main className="font-sans bg-white">
            <CoverPage metadata={data.assessment_metadata} profile={data.organization_profile} />
            <ExecutiveSummary insights={data.strategic_insights} overallScore={data.maturity_analysis.overall_score} vizData={data.visualization_data} />
            <MaturityDimensionBreakdown dimensionalScores={enrichedDimensionalScores} />
            <DetailedRecommendations data={data} />
            <IndustryBenchmarking data={data} />
            <RiskAssessment data={data} />
            <SuccessMetrics data={data} />
        </main>
    );
}
