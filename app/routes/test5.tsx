import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend, Bar, BarChart, XAxis, YAxis, CartesianGrid } from 'recharts';
import { 
    Building, Target, BarChart as BarChartIcon, CheckCircle, XCircle, TrendingUp, TrendingDown, 
    Shield, Users, Lightbulb, Briefcase, AlertTriangle, Zap, Clock, DollarSign, Gauge,
    Construction, BrainCircuit, HardHat, FileText
} from 'lucide-react';

// --- DATA: In a real Remix app, this would come from a `loader` function ---
const reportData = {
 "pk": "COMPANY#8f3b5935-677e-4bcb-a4db-2649a15832a0",
 "sk": "ANALYSIS#2025-08-05T11:10:08.369Z",
 "result": {
  "assessment_metadata": { "assessment_id": "DMA-2025-01-20-A4B1", "completion_date": "2025-01-20T10:00:00.000Z" },
  "organization_profile": { "company_name": "Innovatech Solutions", "industry_sector": "Technology" },
  "strategic_insights": {
   "competitive_position": "Slightly below industry average",
   "transformation_readiness": { "readiness_level": "Medium", "score": 3.5, "enabling_factors": ["Strong executive leadership support", "Clear digital strategy", "Cultural openness to change"], "blocking_factors": ["Budget constraints", "Skills gaps", "Legacy system dependencies"] }
  },
  "maturity_analysis": {
   "overall_score": { "maturity_level": "Developing", "raw_score": 3.2, "industry_benchmark": { "peer_comparison": "Slightly below" } },
   "dimensional_scores": [
    { "dimension": "Strategic Foundation", "confidence_score": 0.98, "raw_score": 4.3, "key_strengths": ["Strong executive leadership support", "Clear digital transformation roadmap"], "critical_gaps": ["Budget allocation limitations"] },
    { "dimension": "Technology & Infrastructure", "confidence_score": 0.95, "raw_score": 3.5, "key_strengths": ["Scalable IT infrastructure", "Effective cybersecurity measures"], "critical_gaps": ["Legacy system integration challenges", "Data quality issues"] },
    { "dimension": "Customer Experience", "confidence_score": 0.98, "raw_score": 3.3, "key_strengths": ["Multi-channel digital presence"], "critical_gaps": ["Limited personalization", "Weak feedback integration"] },
    { "dimension": "Operations & Process", "confidence_score": 0.9, "raw_score": 2.7, "key_strengths": ["Identified automation priorities"], "critical_gaps": ["Manual workflow dependencies", "Limited efficiency measurement"] },
    { "dimension": "People & Culture", "confidence_score": 1, "raw_score": 3.3, "key_strengths": ["Cultural openness to change"], "critical_gaps": ["Moderate digital skills baseline", "Change management effectiveness"] },
    { "dimension": "Innovation & Governance", "confidence_score": 0.95, "raw_score": 2.7, "key_strengths": ["Some digital governance framework", "Risk awareness"], "critical_gaps": ["Budget constraints for innovation"] },
    { "dimension": "Organization Overview", "confidence_score": 1, "raw_score": 3, "key_strengths": ["Clear digital transformation awareness"], "critical_gaps": ["Current digital maturity limitations"] }
   ]
  },
  "detailed_recommendations": {
   "immediate_actions": { "actions": [{ "action": "Establish Digital Transformation Steering Committee", "dimension": "Innovation & Governance", "effort": "Medium", "impact": "High", "estimated_cost": "$10k-$25k", "success_metrics": ["Committee charter approved", "Monthly meetings scheduled"] }], "timeline": "0-3 months" },
   "short_term_initiatives": { "actions": [{ "action": "Deploy customer data platform (CDP)", "dimension": "Customer Experience", "effort": "High", "impact": "High", "estimated_cost": "$100k-$250k", "success_metrics": ["CDP integrated with 2+ systems", "Segmentation capabilities +25%"] }], "timeline": "3-12 months" }
  },
  "industry_benchmarking": {
   "peer_analysis": { "industry_average": 3.5, "top_performers_average": 4.2, "percentile_ranking": 40 },
   "capability_rankings": [
    { "dimension": "Strategic Foundation", "industry_rank": "Top 25%", "score_gap_to_leaders": 0.7, "improvement_urgency": "Low" },
    { "dimension": "Operations & Process", "industry_rank": "Bottom 30%", "score_gap_to_leaders": 1.5, "improvement_urgency": "High" }
   ]
  },
  "risk_assessment": {
   "transformation_risks": [
    { "risk_category": "Cultural", "risk_description": "Employee resistance to new digital initiatives.", "probability": "Medium", "impact": "High", "mitigation_strategy": "Implement a comprehensive change management program." },
    { "risk_category": "Operational", "risk_description": "Disruption to core business processes during tech integration.", "probability": "High", "impact": "Medium", "mitigation_strategy": "Adopt a phased implementation with thorough testing." },
    { "risk_category": "Technical", "risk_description": "Legacy system dependencies slowing down new deployments.", "probability": "High", "impact": "High", "mitigation_strategy": "Develop a modular modernization roadmap." }
   ]
  },
  "success_metrics": {
   "kpi_framework": [
    { "dimension": "Strategic Foundation", "primary_kpis": ["Digital initiative success rate"], "measurement_frequency": "Quarterly" },
    { "dimension": "Customer Experience", "primary_kpis": ["Customer Lifetime Value (CLV)", "Net Promoter Score (NPS)"], "measurement_frequency": "Quarterly" }
   ]
  },
  "visualization_data": {
   "progress_bars": [ { "dimension": "Strategic Foundation", "current_percentage": 86, "color_code": "#22c55e" }, { "dimension": "Technology & Infrastructure", "current_percentage": 70, "color_code": "#3b82f6" }, { "dimension": "Customer Experience", "current_percentage": 66, "color_code": "#f97316" }, { "dimension": "Operations & Process", "current_percentage": 54, "color_code": "#ef4444" }, { "dimension": "People & Culture", "current_percentage": 66, "color_code": "#f97316" }, { "dimension": "Innovation & Governance", "current_percentage": 54, "color_code": "#ef4444" }, { "dimension": "Organization Overview", "current_percentage": 60, "color_code": "#f97316" } ],
   "gap_bubbles": [ { "dimension": "Strategic Foundation", "gap": -0.3, "importance": 5, "investment": 2, "status": "Excellent" }, { "dimension": "Technology & Infrastructure", "gap": 0.3, "importance": 4.5, "investment": 4, "status": "On_Track" }, { "dimension": "Customer Experience", "gap": 0.4, "importance": 4, "investment": 3.5, "status": "Needs_Attention" }, { "dimension": "Operations & Process", "gap": 0.5, "importance": 5, "investment": 4.5, "status": "Critical" }, { "dimension": "People & Culture", "gap": 0.2, "importance": 4, "investment": 3, "status": "Needs_Attention" }, { "dimension": "Innovation & Governance", "gap": 0.3, "importance": 4.5, "investment": 4, "status": "Critical" }, { "dimension": "Organization Overview", "gap": 0, "importance": 3, "investment": 2.5, "status": "Needs_Attention" } ],
   "heat_map": {
    "dimensions": [
     { "name": "Strategic Foundation", "capabilities": [{ "name": "Vision Clarity", "score": 4 }, { "name": "Leadership", "score": 5 }] },
     { "name": "Technology & Infrastructure", "capabilities": [{ "name": "IT Scalability", "score": 4 }, { "name": "Data Management", "score": 3 }] }
    ]
   },
   "bar_chart": { "dimensions": ["Strategy", "Tech", "Customer", "Ops", "People", "Innovation", "Overview"], "answeredQuestions": [4, 5, 4, 5, 4, 5, 5], "totalQuestions": [4, 5, 4, 5, 4, 5, 5] },
   "radar_chart": { "labels": ["Strategy", "Tech", "Customer", "Ops", "People", "Innovation", "Overview"], "current_scores": [4.3, 3.5, 3.3, 2.7, 3.3, 2.7, 3], "industry_benchmarks": [4, 3.8, 3.7, 3.2, 3.5, 3, 3], "target_scores": [5, 4.5, 4.5, 4, 4.5, 4, 4] }
  }
 }
};

// --- Helper Components & Functions ---
const Section = ({ title, children, className = "" }) => (
    <section className={`p-8 md:p-12 border-b border-gray-200 ${className}`}>
        <h2 className="text-4xl font-bold text-slate-800 mb-8 font-serif">{title}</h2>
        {children}
    </section>
);

const DimensionIcon = ({ dimension, className = "" }) => {
    const icons = {
        "Strategic Foundation": <Target className={className} />,
        "Technology & Infrastructure": <Shield className={className} />,
        "Customer Experience": <Users className={className} />,
        "Operations & Process": <Briefcase className={className} />,
        "People & Culture": <Users className={className} />,
        "Innovation & Governance": <Lightbulb className={className} />,
        "Organization Overview": <Building className={className} />,
    };
    return icons[dimension] || <BarChartIcon className={className} />;
};

// --- 1. Cover Page ---
const CoverPage = ({ data }) => {
    const { assessment_metadata, organization_profile } = data;
    return (
        <div className="h-screen w-full flex flex-col justify-between p-12 text-white bg-slate-800" style={{ backgroundImage: "url('/tech-bg.jpg')", backgroundSize: 'cover', backgroundBlendMode: 'overlay' }}>
            <header className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center"><Building className="w-6 h-6 text-white"/></div>
                <span className="text-xl font-semibold">{organization_profile.company_name}</span>
            </header>
            <main className="flex-grow flex flex-col justify-center">
                <h1 className="text-6xl font-extrabold tracking-tight">Digital Maturity Assessment Report</h1>
                <p className="text-2xl mt-4 text-slate-300">Comprehensive Diagnostic Report – August 2025</p>
                <p className="mt-8 font-mono text-lg py-2 px-4 border border-white/30 rounded-md self-start">ID: {assessment_metadata.assessment_id}</p>
            </main>
            <footer className="flex justify-between items-end text-sm">
                <p>Date of Completion: {new Date(assessment_metadata.completion_date).toLocaleDateString()}</p>
                <p className="text-slate-400">Powered by Perplexity AI</p>
            </footer>
        </div>
    );
};

// --- 2. Executive Summary ---
const ExecutiveSummary = ({ data }) => {
    const { strategic_insights, maturity_analysis, visualization_data } = data;
    const chartData = visualization_data.radar_chart.labels.map((label, i) => ({
        subject: label,
        'Current': visualization_data.radar_chart.current_scores[i],
        'Benchmark': visualization_data.radar_chart.industry_benchmarks[i],
        'Target': visualization_data.radar_chart.target_scores[i],
        fullMark: 5,
    }));
    return (
        <Section title="Executive Summary">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-8">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-4 bg-blue-50 rounded-lg"><h4 className="text-sm font-semibold text-blue-700">Maturity Level</h4><p className="text-2xl font-bold text-blue-900">{maturity_analysis.overall_score.maturity_level}</p></div>
                        <div className="p-4 bg-green-50 rounded-lg"><h4 className="text-sm font-semibold text-green-700">Competitive Position</h4><p className="text-xl font-bold text-green-900">{strategic_insights.competitive_position}</p></div>
                        <div className="p-4 bg-purple-50 rounded-lg"><h4 className="text-sm font-semibold text-purple-700">Readiness</h4><p className="text-2xl font-bold text-purple-900">{strategic_insights.transformation_readiness.readiness_level} ({strategic_insights.transformation_readiness.score})</p></div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg flex items-center mb-2"><TrendingUp className="w-5 h-5 mr-2 text-green-500"/>Enabling Factors</h3>
                        <ul className="list-disc list-inside text-slate-600">
                            {strategic_insights.transformation_readiness.enabling_factors.map(f => <li key={f}>{f}</li>)}
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg flex items-center mb-2"><TrendingDown className="w-5 h-5 mr-2 text-red-500"/>Blocking Factors</h3>
                        <ul className="list-disc list-inside text-slate-600">
                            {strategic_insights.transformation_readiness.blocking_factors.map(f => <li key={f}>{f}</li>)}
                        </ul>
                    </div>
                </div>
                <div className="space-y-6">
                    <div className="bg-white p-4 rounded-lg shadow-lg h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                             <RadarChart data={chartData}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="subject" />
                                <PolarRadiusAxis angle={30} domain={[0, 5]}/>
                                <Tooltip />
                                <Legend />
                                <Radar name="Current" dataKey="Current" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                                <Radar name="Benchmark" dataKey="Benchmark" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
                                <Radar name="Target" dataKey="Target" stroke="#ffc658" fill="#ffc658" fillOpacity={0.4} strokeDasharray="3 3"/>
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-4">
                        <div className="w-24 h-24 bg-slate-100 rounded-lg flex items-center justify-center"><BarChartIcon className="w-10 h-10 text-slate-400"/></div>
                        <div><h4 className="font-bold text-slate-800">Heat Map Preview</h4><p className="text-sm text-slate-500">Detailed capability heat map available in the appendix.</p></div>
                    </div>
                </div>
            </div>
        </Section>
    );
};

// --- 3. Maturity Dimension Breakdown ---
const DimensionDetailCard = ({ dim, viz }) => {
    // Helper to find corresponding data from different parts of the JSON
    const progressBar = viz.progress_bars.find(p => p.dimension === dim.dimension);
    const gapBubble = viz.gap_bubbles.find(g => g.dimension === dim.dimension);
    const miniHeatmap = viz.heat_map.dimensions.find(h => h.name === dim.dimension);
    const kpis = viz.kpis.find(k => k.dimension === dim.dimension);

    return (
        <div className="bg-white p-6 rounded-lg shadow-xl border-t-4" style={{borderColor: progressBar?.color_code || '#ccc'}}>
            <header className="flex items-center space-x-3 mb-4">
                <DimensionIcon dimension={dim.dimension} className="w-8 h-8 text-slate-700"/>
                <h3 className="text-2xl font-bold text-slate-800">{dim.dimension}</h3>
            </header>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between text-sm font-medium text-slate-600 mb-1"><span>Progress</span><span>{progressBar?.current_percentage}%</span></div>
                <div className="w-full bg-slate-200 rounded-full h-2.5"><div className="h-2.5 rounded-full" style={{ width: `${progressBar?.current_percentage}%`, backgroundColor: progressBar?.color_code }}></div></div>
            </div>

            {/* Gaps and Strengths */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div><h4 className="font-semibold text-green-700 mb-1">Key Strengths</h4><ul className="list-disc list-inside text-sm text-slate-600">{dim.key_strengths.map(s => <li key={s}>{s}</li>)}</ul></div>
                <div><h4 className="font-semibold text-red-700 mb-1">Critical Gaps</h4><ul className="list-disc list-inside text-sm text-slate-600">{dim.critical_gaps.map(g => <li key={g}>{g}</li>)}</ul></div>
            </div>

            {/* Gap Bubble Placeholder */}
            {gapBubble && <div className="bg-slate-50 p-3 rounded-lg text-sm text-center mb-4"><p><strong>Gap Analysis:</strong> Gap of <strong>{gapBubble.gap}</strong> vs benchmark, with <strong>{gapBubble.importance}/5</strong> importance and <strong>{gapBubble.investment}/5</strong> required investment.</p></div>}
            
            {/* Mini Heatmap Placeholder */}
            {miniHeatmap && <div className="mb-4"><h4 className="font-semibold text-slate-700 mb-1">Capability Scores</h4><div className="flex gap-2">{miniHeatmap.capabilities.map(c => <div key={c.name} className="flex-1 bg-blue-100 p-2 rounded text-center text-sm"><p>{c.name}</p><p className="font-bold text-blue-800">{c.score}/5</p></div>)}</div></div>}
            
            {/* KPIs */}
            {kpis && <div><h4 className="font-semibold text-slate-700 mb-1">Suggested KPIs</h4><p className="text-sm text-slate-600">{kpis.primary_kpis.join(', ')} (Measured {kpis.measurement_frequency})</p></div>}
        </div>
    );
};

const MaturityDimensionBreakdown = ({ data }) => {
    const vizData = {
        progress_bars: data.visualization_data.progress_bars,
        gap_bubbles: data.visualization_data.gap_bubbles,
        heat_map: data.visualization_data.heat_map,
        kpis: data.success_metrics.kpi_framework,
    };
    return (
        <Section title="Maturity Dimension Breakdown" className="bg-slate-100">
            <div className="grid grid-cols-1 gap-8">
                {data.maturity_analysis.dimensional_scores.map(dim => (
                    <DimensionDetailCard key={dim.dimension} dim={dim} viz={vizData} />
                ))}
            </div>
        </Section>
    );
};

// --- 4. Recommendations & Roadmap ---
const ActionCard = ({ action }) => (
    <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="font-bold text-slate-800">{action.action}</h4>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 my-2">
            <span className="flex items-center"><BrainCircuit className="w-3 h-3 mr-1"/>{action.dimension}</span>
            <span className="flex items-center"><Zap className="w-3 h-3 mr-1 text-yellow-500"/>Impact: {action.impact}</span>
            <span className="flex items-center"><HardHat className="w-3 h-3 mr-1 text-blue-500"/>Effort: {action.effort}</span>
            <span className="flex items-center"><DollarSign className="w-3 h-3 mr-1 text-green-500"/>Cost: {action.estimated_cost}</span>
        </div>
        <h5 className="font-semibold text-sm mt-2">Success Metrics</h5>
        <ul className="list-disc list-inside text-sm text-slate-600">{action.success_metrics.map(m => <li key={m}>{m}</li>)}</ul>
    </div>
);

const RecommendationsRoadmap = ({ data }) => {
    const { immediate_actions, short_term_initiatives } = data.detailed_recommendations;
    return (
        <Section title="Recommendations & Roadmap">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-red-50 p-4 rounded-lg"><h3 className="text-xl font-bold text-red-800 mb-3">Immediate (0-3 Months)</h3><div className="space-y-3">{immediate_actions.actions.map(a => <ActionCard key={a.action} action={a} />)}</div></div>
                <div className="bg-blue-50 p-4 rounded-lg"><h3 className="text-xl font-bold text-blue-800 mb-3">Short-Term (3-12 Months)</h3><div className="space-y-3">{short_term_initiatives.actions.map(a => <ActionCard key={a.action} action={a} />)}</div></div>
                <div className="bg-slate-50 p-4 rounded-lg border-2 border-dashed"><h3 className="text-xl font-bold text-slate-800 mb-3">Long-Term (12-24 Months)</h3><p className="text-slate-500 text-center mt-8">No long-term actions defined in this assessment.</p></div>
            </div>
        </Section>
    );
};

// --- 5. Benchmarking & Peer Analysis ---
const BenchmarkingPeerAnalysis = ({ data }) => {
    const { peer_analysis } = data.industry_benchmarking;
    const { overall_score } = data.maturity_analysis;
    return (
        <Section title="Benchmarking & Peer Analysis" className="bg-slate-100">
            <div className="bg-white p-6 rounded-lg shadow-lg">
                <h3 className="text-xl font-bold mb-4">Score Comparison</h3>
                <table className="w-full text-left">
                    <thead><tr className="bg-slate-50"><th className="p-3">Metric</th><th className="p-3 text-center">Your Score</th><th className="p-3 text-center">Industry Avg.</th><th className="p-3 text-center">Top Performers</th></tr></thead>
                    <tbody>
                        <tr className="border-b"><td className="p-3 font-semibold">Overall Maturity Score</td><td className="p-3 text-center text-xl font-bold text-blue-600">{overall_score.raw_score.toFixed(1)}</td><td className="p-3 text-center text-xl font-bold text-slate-600">{peer_analysis.industry_average.toFixed(1)}</td><td className="p-3 text-center text-xl font-bold text-green-600">{peer_analysis.top_performers_average.toFixed(1)}</td></tr>
                        <tr className="border-b"><td className="p-3 font-semibold">Percentile Ranking</td><td colSpan={3} className="p-3 text-center font-bold text-lg">{peer_analysis.percentile_ranking}th Percentile</td></tr>
                    </tbody>
                </table>
            </div>
        </Section>
    );
};

// --- 6. Risk Assessment ---
const RiskAssessment = ({ data }) => {
    const RiskIcon = ({ category }) => {
        const icons = { 'Cultural': <Users className="w-5 h-5 text-pink-500"/>, 'Operational': <Briefcase className="w-5 h-5 text-orange-500"/>, 'Technical': <Shield className="w-5 h-5 text-indigo-500"/> };
        return icons[category] || <AlertTriangle className="w-5 h-5"/>;
    };
    return (
        <Section title="Risk Assessment">
             <div className="bg-white p-6 rounded-lg shadow-lg overflow-x-auto">
                 <table className="w-full text-sm">
                    <thead><tr className="bg-slate-50"><th className="p-3">Category</th><th className="p-3">Description</th><th className="p-3 text-center">Probability</th><th className="p-3 text-center">Impact</th><th className="p-3">Mitigation Strategy</th></tr></thead>
                    <tbody>
                        {data.risk_assessment.transformation_risks.map(risk => (
                            <tr key={risk.risk_description} className="border-b">
                                <td className="p-3 font-semibold flex items-center space-x-2"><RiskIcon category={risk.risk_category} /><span>{risk.risk_category}</span></td>
                                <td className="p-3 text-slate-600">{risk.risk_description}</td>
                                <td className="p-3 text-center font-medium">{risk.probability}</td>
                                <td className="p-3 text-center font-medium">{risk.impact}</td>
                                <td className="p-3 text-slate-600">{risk.mitigation_strategy}</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             </div>
        </Section>
    );
};

// --- 7. Data Visualizations Summary (Appendix) ---
const VisualizationsAppendix = ({ data }) => {
    const { bar_chart, heat_map } = data.visualization_data;
    const barData = bar_chart.dimensions.map((dim, i) => ({ name: dim, answered: bar_chart.answeredQuestions[i], total: bar_chart.totalQuestions[i] }));
    return (
        <Section title="Visual Appendix" className="bg-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="font-bold text-xl mb-4">Question Completion per Dimension</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="name" type="category" width={80} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="answered" fill="#8884d8" name="Answered Questions" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h3 className="font-bold text-xl mb-4">Capability Heat Map</h3>
                    <div className="space-y-4">
                        {heat_map.dimensions.map(dim => (
                            <div key={dim.name}>
                                <h4 className="font-semibold">{dim.name}</h4>
                                <div className="flex gap-2 mt-1">
                                    {dim.capabilities.map(cap => (
                                         <div key={cap.name} className="flex-1 p-2 rounded text-center text-sm" style={{backgroundColor: `rgba(136, 132, 216, ${cap.score / 5})`}}>
                                            <p className="text-white font-medium text-shadow">{cap.name}</p>
                                            <p className="font-bold text-white text-lg">{cap.score}</p>
                                         </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-lg lg:col-span-2">
                    <h3 className="font-bold text-xl mb-4">Gap vs. Importance (Bubble Chart)</h3>
                     <div className="h-80 flex items-center justify-center bg-slate-50 rounded-lg">
                        <div className="text-center text-slate-500">
                            <Construction className="w-16 h-16 mx-auto mb-2"/>
                            <p className="font-bold">Bubble Chart Placeholder</p>
                            <p className="text-sm">This area will display the Gap vs. Importance vs. Investment bubble chart.</p>
                        </div>
                     </div>
                </div>
            </div>
        </Section>
    );
};

// --- Main Component ---
export default function FullDigitalMaturityReport() {
    const data = reportData.result; // In Remix, this would be from useLoaderData()

    return (
        <main className="font-sans bg-white text-slate-900">
            <CoverPage data={data} />
            <ExecutiveSummary data={data} />
            <MaturityDimensionBreakdown data={data} />
            <RecommendationsRoadmap data={data} />
            <BenchmarkingPeerAnalysis data={data} />
            <RiskAssessment data={data} />
            <VisualizationsAppendix data={data} />
        </main>
    );
}