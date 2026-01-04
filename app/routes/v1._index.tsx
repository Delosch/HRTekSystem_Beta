// app/routes/analysis.$id.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Updated Data Structures based on your new prompt ---

interface AssessmentMetadata {
  assessment_id: string;
  completion_date: string;
  total_questions: number;
  answered_questions: number;
  completion_percentage: number;
  processing_confidence: number;
}

interface OrganizationProfile {
  company_size: string;
  industry_sector: string;
  annual_revenue: string;
  business_model: string[];
  current_digital_stage: number;
}

interface ScoreDetails {
  raw_score: number;
  weighted_score: number;
  percentage: number;
  maturity_level: string;
  confidence_score: number;
}

interface IndustryBenchmark {
  industry_average: number;
  percentile_ranking: number;
  top_quartile_threshold: number;
  peer_comparison: "Below" | "At" | "Above";
}

interface DimensionalScore extends ScoreDetails {
  dimension: string;
  questions_analyzed: number;
  industry_benchmark: number;
  gap_analysis: {
    gap_to_benchmark: number;
    gap_to_best_practice: number;
    improvement_potential: number;
  };
  key_strengths: string[];
  critical_gaps: string[];
}

interface MaturityAnalysis {
  overall_score: ScoreDetails & { industry_benchmark: IndustryBenchmark };
  dimensional_scores: DimensionalScore[];
}

interface RadarChartData {
  labels: string[];
  current_scores: number[];
  industry_benchmarks: number[];
  target_scores: number[];
  colors: {
    current: string;
    benchmark: string;
    target: string;
  };
}

interface ProgressBarData {
  dimension: string;
  current_percentage: number;
  target_percentage: number;
  color_code: string;
  status: "Critical" | "Needs_Attention" | "On_Track" | "Excellent";
}

interface HeatmapCapability {
  capability: string;
  score: number;
  color_intensity: number;
}

interface HeatmapDimension {
  dimension: string;
  capabilities: HeatmapCapability[];
}

interface HeatmapDataConfig {
  matrix: HeatmapDimension[];
  color_scale: {
    min_color: string;
    mid_color: string;
    max_color: string;
  };
}

interface BubbleChartDataPoint {
  dimension: string;
  current_score: number;
  strategic_importance: number;
  investment_required: number;
  timeline_months: number;
  bubble_size: number;
  color: string;
}

interface VisualizationData {
  radar_chart: RadarChartData;
  progress_bars: ProgressBarData[];
  heat_map_data: HeatmapDataConfig;
  gap_analysis_chart: {
    bubbles: BubbleChartDataPoint[];
  };
}

interface StrategicInsights {
  overall_assessment: string;
  maturity_stage_description: string;
  competitive_position: string;
  transformation_readiness: {
    score: number;
    readiness_level: string;
    enabling_factors: string[];
    blocking_factors: string[];
  };
  pattern_analysis: {
    strengths_pattern: string;
    weakness_pattern: string;
    correlation_insights: string;
    anomaly_detection: string;
  };
}

interface RecommendationAction {
  action: string;
  dimension: string;
  impact: "High" | "Medium" | "Low";
  effort: "High" | "Medium" | "Low";
  success_metrics: string[];
  estimated_cost: string;
}

interface RecommendationSection {
  timeline: string;
  priority: string;
  actions: RecommendationAction[];
}

interface DetailedRecommendations {
  immediate_actions: RecommendationSection;
  short_term_initiatives: RecommendationSection;
  long_term_strategy: RecommendationSection;
  investment_roadmap: {
    total_estimated_investment: string;
    roi_projection: string;
    risk_assessment: string;
    success_probability: number;
  };
}

interface PeerAnalysis {
  similar_size_average: number;
  industry_average: number;
  top_performers_average: number;
  bottom_quartile_threshold: number;
}

interface CapabilityRanking {
  dimension: string;
  industry_rank: string;
  score_gap_to_leaders: number;
  improvement_urgency: "Critical" | "High" | "Medium" | "Low";
}

interface MarketTrends {
  emerging_technologies: string[];
  industry_disruptions: string[];
  competitive_advantages: string[];
}

interface IndustryBenchmarking {
  peer_analysis: PeerAnalysis;
  capability_rankings: CapabilityRanking[];
  market_trends: MarketTrends;
}

interface Risk {
  risk_category: string;
  risk_description: string;
  probability: "High" | "Medium" | "Low";
  impact: "High" | "Medium" | "Low";
  mitigation_strategy: string;
}

interface Vulnerability {
  vulnerability: string;
  affected_dimensions: string[];
  severity: number;
  remediation_priority: "Critical" | "High" | "Medium" | "Low";
}

interface RiskAssessment {
  transformation_risks: Risk[];
  digital_vulnerabilities: Vulnerability[];
}

interface KPI {
  dimension: string;
  primary_kpis: string[];
  measurement_frequency: string;
  target_improvement: string;
}

interface Milestone {
  milestone: string;
  target_date: string;
  success_criteria: string[];
  dependencies: string[];
}

interface SuccessMetrics {
  kpi_framework: KPI[];
  milestone_tracking: Milestone[];
}

// The full AI-generated report structure
interface AIAnalysisReport {
  pk: string;
  sk: string;
  assessment_id: string;
  createdAt: string;
  result: {
    data: {
      assessment_metadata: AssessmentMetadata;
      organization_profile: OrganizationProfile;
      maturity_analysis: MaturityAnalysis;
      visualization_data: VisualizationData;
      strategic_insights: StrategicInsights;
      detailed_recommendations: DetailedRecommendations;
      industry_benchmarking: IndustryBenchmarking;
      risk_assessment: RiskAssessment;
      success_metrics: SuccessMetrics;
    };
    strategyUsed: string;
    success: boolean;
  };
  section: string;
}


// --- Utility Functions for Data Transformation ---

// Helper to get score level for Radar Chart
const getRadarChartData = (dimensionalScores: DimensionalScore[], radarChartData: RadarChartData) => {
  if (!dimensionalScores || dimensionalScores.length === 0) return [];

  return dimensionalScores.map(d => ({
    name: d.dimension,
    Current: d.percentage, // Using percentage as per new structure for radar
    Benchmark: d.industry_benchmark,
    Target: radarChartData.target_scores[radarChartData.labels.indexOf(d.dimension)], // Map target score to dimension
    fullMark: 100 // Assuming percentages go up to 100
  }));
};

const getProgressBarData = (progressBars: ProgressBarData[]) => {
  return progressBars; // Directly use the provided progress_bars
};

const getHeatmapMatrix = (heatmapDataConfig: HeatmapDataConfig) => {
  const matrix = heatmapDataConfig.matrix;
  const colorScale = heatmapDataConfig.color_scale;

  const allCapabilities: { capability: string, dimension: string, score: number, color_intensity: number }[] = [];
  matrix.forEach(dim => {
    dim.capabilities.forEach(cap => {
      allCapabilities.push({ ...cap, dimension: dim.dimension });
    });
  });

  const dimensions = Array.from(new Set(allCapabilities.map(d => d.dimension)));
  const capabilities = Array.from(new Set(allCapabilities.map(d => d.capability))).sort(); // Sort for consistent order

  const dataGrid: { x: string, y: string, value: number, colorIntensity: number }[] = [];

  dimensions.forEach(dim => {
    capabilities.forEach(cap => {
      const foundCap = allCapabilities.find(
        (item) => item.dimension === dim && item.capability === cap
      );
      dataGrid.push({
        x: dim,
        y: cap,
        value: foundCap ? foundCap.score : 0, // Use actual score
        colorIntensity: foundCap ? foundCap.color_intensity : 0, // Use color_intensity for coloring
      });
    });
  });

  return { data: dataGrid, xLabels: dimensions, yLabels: capabilities, colorScale };
};

// --- Custom Heatmap Component ---
const getHeatmapCellColor = (intensity: number, colorScale: { min_color: string; mid_color: string; max_color: string; }) => {
  // This is a simple linear interpolation. For more nuanced scales,
  // you might define specific breakpoints or use a D3 scale.
  if (intensity <= 0) return 'bg-gray-200';
  if (intensity <= 1) return colorScale.max_color; // High score, good (green)
  if (intensity <= 2) return colorScale.mid_color; // Moderate (yellow/orange)
  if (intensity <= 3) return colorScale.min_color; // Low score, critical (red)

  // Fallback for values outside 1-3 if they appear in intensity
  if (intensity <= 5) return 'bg-red-800'; // Very critical
  return 'bg-gray-200';
};


const HeatmapCell: React.FC<{ value: number; intensity: number; colorScale: { min_color: string; mid_color: string; max_color: string; } }> = ({ value, intensity, colorScale }) => {
  const bgColorClass = getHeatmapCellColor(intensity, colorScale); // Use intensity for color

  return (
    <div
      className={`${bgColorClass} w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-105 group-hover:z-10`}
      style={{ minWidth: '80px', minHeight: '40px' }}
    >
      <span className="text-xs text-gray-800 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        {value !== undefined ? value.toFixed(1) : ''}
      </span>
    </div>
  );
};

const Heatmap: React.FC<{ data: ReturnType<typeof getHeatmapMatrix> }> = ({ data }) => {
  const { data: dataGrid, xLabels, yLabels, colorScale } = data;

  const getCellValue = (x: string, y: string) => {
    return dataGrid.find(d => d.x === x && d.y === y);
  };

  return (
    <div className="overflow-x-auto p-4">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(100px, 1fr))` }}>
        {/* Corner empty cell */}
        <div className="bg-gray-100 p-2 text-center text-xs font-semibold"></div>
        {/* X-axis labels (Dimensions) */}
        {xLabels.map((label, idx) => (
          <div key={idx} className="bg-gray-100 p-2 text-center text-xs font-semibold leading-tight break-words" style={{ minWidth: '100px' }}>
            {label}
          </div>
        ))}

        {/* Y-axis labels (Capabilities) and data cells */}
        {yLabels.map((yLabel, yIdx) => (
          <React.Fragment key={yIdx}>
            <div className="bg-gray-100 p-2 text-left text-xs font-semibold break-words flex items-center" style={{ minHeight: '40px' }}>
              {yLabel}
            </div>
            {xLabels.map((xLabel, xIdx) => {
              const cellData = getCellValue(xLabel, yLabel);
              return (
                <div key={`${xIdx}-${yIdx}`} className="group relative border border-gray-200">
                  <HeatmapCell
                    value={cellData?.value ?? 0}
                    intensity={cellData?.colorIntensity ?? 0}
                    colorScale={colorScale}
                  />
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="mt-4 flex justify-center gap-4 text-sm font-semibold">
        <span className="flex items-center"><span className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: colorScale.min_color}}></span>Critical (Low Score/High Intensity)</span>
        <span className="flex items-center"><span className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: colorScale.mid_color}}></span>Moderate</span>
        <span className="flex items-center"><span className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: colorScale.max_color}}></span>Excellent (High Score/Low Intensity)</span>
      </div>
    </div>
  );
};

// --- Remix Loader (using the provided new JSON structure) ---
export const loader = async ({ params }: LoaderFunctionArgs) => {
  // In a real application, fetch this from your database
  // using params.id, companyPk, etc.
  // For this example, we're using your provided full JSON mock data.
  const mockData: AIAnalysisReport = {
    "pk": "COMPANY#bc3a067b-d180-4b0d-a400-edcd8a038a25",
    "sk": "ANALYSIS#2025-08-03T15:12:01.309Z",
    "assessment_id": "QUESTION#5f41bdc9-67f0-478d-bba3-0271141d0eae",
    "createdAt": "2025-08-03T15:12:01.309Z",
    "result": {
     "data": {
      "areas_for_improvement": [
       "Moderate budget allocation for digital transformation.",
       "Identified barriers to strategic implementation include skills gap and resistance to change.",
       "Data accessibility, accuracy, and actionability are moderate.",
       "Omnichannel customer interaction and personalization capabilities are developing.",
       "Core business process digitization and departmental collaboration are moderate.",
       "Challenges with legacy system dependencies and inter-departmental workflow alignment.",
       "Workforce digital skills and change management effectiveness are moderate.",
       "Digital governance framework needs strengthening.",
       "Innovation is hindered by skills shortage and budget constraints."
      ],
      "detailed_analysis_by_section": {
       "Section 1: Organization Overview": {
        "areas_for_improvement": [
         "The current digital transformation stage (3/5) indicates significant room for growth and acceleration."
        ],
        "raw_responses": {
         "annual_revenue": "$10M - $100M",
         "business_model": [
          "B2B (Business to Business)"
         ],
         "company_size": "251-1000",
         "digital_transformation_stage": "3",
         "industry_sector": "Technology"
        },
        "recommendations": [
         "Focus on accelerating digital initiatives to move towards an advanced or leader stage of digital transformation."
        ],
        "score": 3,
        "strengths": [
         "Operating in the technology sector, which often implies a higher inherent digital aptitude and focus."
        ],
        "summary": "A mid-sized technology company with moderate annual revenue, primarily B2B, currently at a developing stage of digital transformation."
       },
       "Section 2: Strategic Foundation": {
        "areas_for_improvement": [
         "Budget allocation for digital transformation is moderate (3/5).",
         "Identified barriers include 'Skills gap' and 'Resistance to change' in digital strategy implementation."
        ],
        "raw_responses": {
         "budget_allocation": "3",
         "digital_strategy_clarity": "4",
         "executive_leadership_support": "5",
         "strategic_alignment_barriers": [
          "Skills gap",
          "Resistance to change"
         ]
        },
        "recommendations": [
         "Advocate for increased and sustained budget allocation to adequately fund digital initiatives.",
         "Develop robust change management strategies and communication plans to address resistance to change.",
         "Prioritize upskilling and reskilling programs to close the identified skills gap."
        ],
        "score": 4,
        "strengths": [
         "Excellent executive leadership support (5/5) actively champions digital initiatives.",
         "Good clarity in the digital transformation roadmap (4/5)."
        ],
        "summary": "The organization benefits from strong executive leadership support and a clear digital strategy, but budget allocation is moderate, and key barriers include skills gaps and resistance to change."
       },
       "Section 3: Technology & Infrastructure": {
        "areas_for_improvement": [
         "Data accessibility, accuracy, and actionability are moderate (3/5), indicating potential data silos or quality issues.",
         "Skills shortage is identified as a significant technology infrastructure challenge."
        ],
        "raw_responses": {
         "cloud_adoption_level": "5",
         "cybersecurity_posture": "4",
         "data_accessibility_quality": "3",
         "it_infrastructure_scalability": "4",
         "technology_integration_challenges": [
          "Skills shortage"
         ]
        },
        "recommendations": [
         "Invest in data governance and quality initiatives to improve data accessibility, accuracy, and actionability.",
         "Address the skills shortage in technology infrastructure through targeted training, recruitment, or partnerships.",
         "Explore solutions to integrate legacy systems and break down data silos."
        ],
        "score": 4,
        "strengths": [
         "High cloud adoption (5/5) indicates a modern technology approach.",
         "Strong IT infrastructure scalability (4/5) supports growing digital operations.",
         "Effective cybersecurity posture (4/5) protects digital assets."
        ],
        "summary": "The organization demonstrates high cloud adoption and good infrastructure scalability and cybersecurity, but data management needs improvement, and skills shortage is a key challenge."
       },
       "Section 4: Customer Experience & Engagement": {
        "areas_for_improvement": [
         "Omnichannel customer interaction is moderate (3/5), suggesting potential gaps in seamless customer journeys.",
         "Personalization capability is low (2/5), indicating underutilization of customer data for tailored experiences."
        ],
        "raw_responses": {
         "customer_feedback_integration": "4",
         "digital_customer_channels": [
          "Website",
          "Mobile app",
          "Social media",
          "Email marketing"
         ],
         "omnichannel_customer_interaction": "3",
         "personalization_capability": "2"
        },
        "recommendations": [
         "Enhance omnichannel integration to provide truly seamless and consistent customer experiences across all digital touchpoints.",
         "Prioritize investment in personalization technologies and strategies to leverage customer data more effectively and deliver relevant experiences."
        ],
        "score": 3,
        "strengths": [
         "Good integration of customer feedback (4/5) directly influences digital improvements.",
         "Utilizes a solid range of primary digital customer channels including Website, Mobile app, Social media, and Email marketing."
        ],
        "summary": "The organization effectively integrates customer feedback and utilizes a decent range of digital channels, but omnichannel interaction and personalization capabilities are still developing."
       },
       "Section 5: Operations & Process Efficiency": {
        "areas_for_improvement": [
         "Core business process digitization (3/5) and departmental collaboration (3/5) are at a developing stage.",
         "Significant operational challenges include legacy system dependencies and inter-departmental workflow alignment."
        ],
        "raw_responses": {
         "automation_priorities": [
          "Customer service",
          "HR processes",
          "Marketing campaigns"
         ],
         "departmental_collaboration": "3",
         "operational_challenges": "We face challenges with legacy system dependencies and inter-departmental workflow alignment which affect overall process efficiency.",
         "operational_efficiency_measurement": "4",
         "process_digitization_level": "3"
        },
        "recommendations": [
         "Accelerate the digitization of core business processes, prioritizing those with the highest impact on efficiency and customer experience.",
         "Implement solutions and strategies to improve inter-departmental collaboration and streamline workflows.",
         "Develop a clear roadmap for addressing legacy system dependencies, potentially through modernization, integration, or replacement."
        ],
        "score": 3.33,
        "strengths": [
         "Effective measurement and optimization of operational efficiency using digital tools (4/5).",
         "Clear focus on automating key processes like Customer service, HR, and Marketing campaigns."
        ],
        "summary": "The organization effectively measures operational efficiency, but core processes are moderately digitized, and departmental collaboration is developing. Legacy systems and workflow alignment are key operational challenges."
       },
       "Section 6: People & Culture": {
        "areas_for_improvement": [
         "Workforce digital skills (3/5) are moderate, indicating a need for further development.",
         "Change management effectiveness (3/5) is moderate, suggesting room for improvement in guiding digital transitions."
        ],
        "raw_responses": {
         "change_management_effectiveness": "3",
         "organizational_culture_adaptation": "4",
         "skill_development_priorities": [
          "Cloud technologies",
          "AI/Machine learning",
          "Cybersecurity"
         ],
         "workforce_digital_skills": "3"
        },
        "recommendations": [
         "Invest in targeted training and development programs to enhance workforce digital skills, particularly in identified priority areas.",
         "Strengthen change management practices and communication strategies to ensure smoother adoption of digital initiatives and mitigate resistance."
        ],
        "score": 3.33,
        "strengths": [
         "Organizational culture shows good adaptation to digital change (4/5).",
         "Clear focus on developing critical future skills such as Cloud technologies, AI/Machine learning, and Cybersecurity."
        ],
        "summary": "The organizational culture is adapting well to digital change, but workforce digital skills and change management effectiveness are moderate, with a clear focus on developing advanced technology skills."
       },
       "Section 7: Innovation & Governance": {
        "areas_for_improvement": [
         "Digital governance framework is moderate (3/5), suggesting a need for clearer policies and accountability.",
         "Innovation is hindered by identified barriers: 'Skills shortage' and 'Budget constraints'."
        ],
        "raw_responses": {
         "digital_governance_framework": "3",
         "digital_risk_management": "4",
         "future_digital_priorities": "We plan to modernize our data architecture, implement AI-driven analytics, enhance cybersecurity infrastructure, and launch a unified customer experience platform over the next 12-18 months",
         "innovation_barriers": [
          "Skills shortage",
          "Budget constraints"
         ],
         "innovation_opportunity_identification": "4"
        },
        "recommendations": [
         "Develop and implement a more robust digital governance framework with clear policies, roles, and accountability for digital initiatives.",
         "Address the skills shortage and advocate for adequate budget allocation to foster a more innovative environment.",
         "Leverage the identified future digital priorities to create a focused roadmap and secure necessary resources for execution."
        ],
        "score": 3.67,
        "strengths": [
         "Proactive digital risk management (4/5) indicates a mature approach to digital security and resilience.",
         "Systematic identification and development of digital innovation opportunities (4/5).",
         "Clear and ambitious future digital transformation priorities are defined for the next 12-18 months."
        ],
        "summary": "The organization demonstrates good proactive risk management and systematic identification of innovation opportunities, but digital governance needs strengthening. Innovation is hindered by skills shortage and budget constraints, despite clear future priorities."
       }
      },
      "maturity_level": "Advanced", // This is the old path from first JSON, now under maturity_analysis.overall_score.maturity_level
      "overall_maturity_score": 3.55, // Old path
      "strategic_recommendations": [ // Old path
       "Develop a comprehensive strategy to address the identified skills gap across all relevant domains (strategic, technical, operational) through targeted training and recruitment.",
       "Implement robust change management programs to overcome resistance and foster a more agile, digitally-oriented culture.",
       "Invest in data governance and quality initiatives to enhance data accessibility, accuracy, and actionability for better decision-making and personalized customer experiences.",
       "Enhance customer experience by improving omnichannel integration and investing in advanced personalization technologies to leverage customer data more effectively.",
       "Accelerate the digitization and automation of core business processes, addressing legacy system dependencies and improving inter-departmental workflows for greater efficiency.",
       "Strengthen the digital governance framework to ensure clear policies, accountability, and effective oversight of all digital initiatives.",
       "Advocate for increased and sustained budget allocation for critical digital transformation initiatives and innovation to support strategic growth."
      ],
      "strengths": [ // Old path
       "Strong executive leadership support for digital initiatives.",
       "High cloud adoption and good IT infrastructure scalability.",
       "Effective cybersecurity posture.",
       "Good integration of customer feedback and utilization of multiple digital channels.",
       "Organizational culture shows good adaptation to digital change.",
       "Systematic identification of innovation opportunities and proactive digital risk management.",
       "Clear future digital transformation priorities are defined."
      ],
      // New structure elements from the prompt
      "assessment_metadata": {
        "assessment_id": "generated_unique_id_123",
        "completion_date": "2025-08-03T15:12:01.309Z",
        "total_questions": 30,
        "answered_questions": 28,
        "completion_percentage": 93.3,
        "processing_confidence": 0.95
      },
      "organization_profile": {
        "company_size": "251-1000",
        "industry_sector": "Technology",
        "annual_revenue": "$10M - $100M",
        "business_model": ["B2B"],
        "current_digital_stage": 3
      },
      "maturity_analysis": {
        "overall_score": {
          "raw_score": 3.55,
          "weighted_score": 3.55,
          "percentage": 71,
          "maturity_level": "Advanced",
          "confidence_score": 0.92,
          "industry_benchmark": {
            "industry_average": 3.2,
            "percentile_ranking": 75,
            "top_quartile_threshold": 3.8,
            "peer_comparison": "Above"
          }
        },
        "dimensional_scores": [
          {
            "dimension": "Strategic Foundation",
            "raw_score": 4,
            "weighted_score": 4,
            "percentage": 80,
            "maturity_level": "Advanced",
            "confidence_score": 0.95,
            "questions_analyzed": 5,
            "industry_benchmark": 3.5,
            "gap_analysis": {
              "gap_to_benchmark": 0.5,
              "gap_to_best_practice": 1,
              "improvement_potential": 0.5
            },
            "key_strengths": ["Strong executive leadership support", "Clear digital strategy"],
            "critical_gaps": ["Moderate budget allocation"]
          },
          {
            "dimension": "Technology Infrastructure",
            "raw_score": 4,
            "weighted_score": 4,
            "percentage": 80,
            "maturity_level": "Advanced",
            "confidence_score": 0.9,
            "questions_analyzed": 6,
            "industry_benchmark": 3.8,
            "gap_analysis": {
              "gap_to_benchmark": 0.2,
              "gap_to_best_practice": 0.8,
              "improvement_potential": 0.6
            },
            "key_strengths": ["High cloud adoption", "Strong IT scalability", "Effective cybersecurity"],
            "critical_gaps": ["Data accessibility & quality", "Skills shortage"]
          },
          {
            "dimension": "Customer Experience",
            "raw_score": 3,
            "weighted_score": 3,
            "percentage": 60,
            "maturity_level": "Developing",
            "confidence_score": 0.88,
            "questions_analyzed": 5,
            "industry_benchmark": 3.6,
            "gap_analysis": {
              "gap_to_benchmark": -0.6,
              "gap_to_best_practice": 1.4,
              "improvement_potential": 0.8
            },
            "key_strengths": ["Good customer feedback integration", "Multiple digital channels"],
            "critical_gaps": ["Omnichannel interaction", "Personalization capability"]
          },
          {
            "dimension": "Operations & Process Efficiency",
            "raw_score": 3.33,
            "weighted_score": 3.33,
            "percentage": 66.6,
            "maturity_level": "Developing",
            "confidence_score": 0.89,
            "questions_analyzed": 6,
            "industry_benchmark": 3.4,
            "gap_analysis": {
              "gap_to_benchmark": -0.07,
              "gap_to_best_practice": 1.67,
              "improvement_potential": 1
            },
            "key_strengths": ["Effective efficiency measurement", "Clear automation priorities"],
            "critical_gaps": ["Legacy system dependencies", "Inter-departmental workflow alignment"]
          },
          {
            "dimension": "People & Culture",
            "raw_score": 3.33,
            "weighted_score": 3.33,
            "percentage": 66.6,
            "maturity_level": "Developing",
            "confidence_score": 0.91,
            "questions_analyzed": 4,
            "industry_benchmark": 3.2,
            "gap_analysis": {
              "gap_to_benchmark": 0.13,
              "gap_to_best_practice": 1.67,
              "improvement_potential": 0.5
            },
            "key_strengths": ["Good culture adaptation to change", "Focus on future skill development"],
            "critical_gaps": ["Workforce digital skills", "Change management effectiveness"]
          },
          {
            "dimension": "Innovation & Governance",
            "raw_score": 3.67,
            "weighted_score": 3.67,
            "percentage": 73.4,
            "maturity_level": "Advanced",
            "confidence_score": 0.93,
            "questions_analyzed": 6,
            "industry_benchmark": 3.7,
            "gap_analysis": {
              "gap_to_benchmark": -0.03,
              "gap_to_best_practice": 1.33,
              "improvement_potential": 0.7
            },
            "key_strengths": ["Proactive risk management", "Systematic innovation identification", "Clear future priorities"],
            "critical_gaps": ["Digital governance framework", "Innovation budget constraints"]
          }
        ]
      },
      "visualization_data": {
        "radar_chart": {
          "labels": ["Strategic Foundation", "Technology Infrastructure", "Customer Experience", "Operations & Process Efficiency", "People & Culture", "Innovation & Governance"],
          "current_scores": [80, 80, 60, 66.6, 66.6, 73.4],
          "industry_benchmarks": [70, 76, 72, 68, 64, 74],
          "target_scores": [90, 90, 80, 85, 80, 85],
          "colors": {
            "current": "rgba(54, 162, 235, 0.8)",
            "benchmark": "rgba(255, 99, 132, 0.8)",
            "target": "rgba(75, 192, 192, 0.8)"
          }
        },
        "progress_bars": [
          { "dimension": "Overall", "current_percentage": 71, "target_percentage": 90, "color_code": "#4299E1", "status": "On_Track" },
          { "dimension": "Strategic Foundation", "current_percentage": 80, "target_percentage": 90, "color_code": "#48BB78", "status": "Excellent" },
          { "dimension": "Technology Infrastructure", "current_percentage": 80, "target_percentage": 90, "color_code": "#48BB78", "status": "Excellent" },
          { "dimension": "Customer Experience", "current_percentage": 60, "target_percentage": 80, "color_code": "#ECC94B", "status": "Needs_Attention" },
          { "dimension": "Operations & Process Efficiency", "current_percentage": 66.6, "target_percentage": 85, "color_code": "#ED8936", "status": "Needs_Attention" },
          { "dimension": "People & Culture", "current_percentage": 66.6, "target_percentage": 80, "color_code": "#ED8936", "status": "Needs_Attention" },
          { "dimension": "Innovation & Governance", "current_percentage": 73.4, "target_percentage": 85, "color_code": "#4299E1", "status": "On_Track" }
        ],
        "heat_map_data": {
          "matrix": [
            {
              "dimension": "Strategic Foundation",
              "capabilities": [
                {"capability": "Vision Clarity", "score": 4, "color_intensity": 1},
                {"capability": "Leadership Commitment", "score": 5, "color_intensity": 1},
                {"capability": "Investment Allocation", "score": 3, "color_intensity": 2}
              ]
            },
            {
              "dimension": "Technology Infrastructure",
              "capabilities": [
                {"capability": "Cloud Adoption", "score": 5, "color_intensity": 1},
                {"capability": "IT Scalability", "score": 4, "color_intensity": 1},
                {"capability": "Data Accessibility", "score": 3, "color_intensity": 2},
                {"capability": "Cybersecurity Posture", "score": 4, "color_intensity": 1}
              ]
            },
            {
              "dimension": "Customer Experience",
              "capabilities": [
                {"capability": "Feedback Integration", "score": 4, "color_intensity": 1},
                {"capability": "Omnichannel Interaction", "score": 3, "color_intensity": 2},
                {"capability": "Personalization Capability", "score": 2, "color_intensity": 3}
              ]
            },
            {
              "dimension": "Operations & Process Efficiency",
              "capabilities": [
                {"capability": "Process Digitization", "score": 3, "color_intensity": 2},
                {"capability": "Departmental Collaboration", "score": 3, "color_intensity": 2},
                {"capability": "Operational Efficiency Measurement", "score": 4, "color_intensity": 1}
              ]
            },
            {
              "dimension": "People & Culture",
              "capabilities": [
                {"capability": "Culture Adaptation", "score": 4, "color_intensity": 1},
                {"capability": "Workforce Digital Skills", "score": 3, "color_intensity": 2},
                {"capability": "Change Management Effectiveness", "score": 3, "color_intensity": 2}
              ]
            },
            {
              "dimension": "Innovation & Governance",
              "capabilities": [
                {"capability": "Digital Governance Framework", "score": 3, "color_intensity": 2},
                {"capability": "Digital Risk Management", "score": 4, "color_intensity": 1},
                {"capability": "Innovation Opportunity Identification", "score": 4, "color_intensity": 1}
              ]
            }
          ],
          "color_scale": {
            "min_color": "#EF4444", // red-500 for critical/low score
            "mid_color": "#F59E0B", // amber-500 for moderate
            "max_color": "#10B981"  // emerald-500 for excellent/high score
          }
        },
        "gap_analysis_chart": {
          "bubbles": [
            {
              "dimension": "Customer Experience",
              "current_score": 60,
              "strategic_importance": 0.8,
              "investment_required": 0.7,
              "timeline_months": 6,
              "bubble_size": 2500,
              "color": "#F87171" // red
            },
            {
              "dimension": "Operations & Process Efficiency",
              "current_score": 66.6,
              "strategic_importance": 0.7,
              "investment_required": 0.6,
              "timeline_months": 8,
              "bubble_size": 2000,
              "color": "#FBBF24" // yellow
            },
            {
              "dimension": "People & Culture",
              "current_score": 66.6,
              "strategic_importance": 0.6,
              "investment_required": 0.5,
              "timeline_months": 10,
              "bubble_size": 1800,
              "color": "#FBBF24" // yellow
            },
            {
              "dimension": "Innovation & Governance",
              "current_score": 73.4,
              "strategic_importance": 0.9,
              "investment_required": 0.8,
              "timeline_months": 12,
              "bubble_size": 3000,
              "color": "#60A5FA" // blue
            },
            {
              "dimension": "Strategic Foundation",
              "current_score": 80,
              "strategic_importance": 0.95,
              "investment_required": 0.4,
              "timeline_months": 4,
              "bubble_size": 2200,
              "color": "#34D399" // green
            },
            {
              "dimension": "Technology Infrastructure",
              "current_score": 80,
              "strategic_importance": 0.9,
              "investment_required": 0.5,
              "timeline_months": 5,
              "bubble_size": 2300,
              "color": "#34D399" // green
            }
          ]
        }
      },
      "strategic_insights": {
        "overall_assessment": "The organization exhibits a strong foundation in strategic direction and technology infrastructure, positioning it well above industry average in these dimensions. However, customer experience, operational efficiency, and people & culture dimensions show room for significant improvement to reach optimal digital maturity.",
        "maturity_stage_description": "Currently positioned at the 'Advanced' stage, indicating that the organization has integrated digital technologies across several core functions and is achieving notable efficiencies. The focus should now shift towards optimizing these integrations and fostering deeper, more pervasive digital adoption.",
        "competitive_position": "The company maintains an 'Above' peer comparison status relative to the industry average, primarily driven by its robust executive leadership and advanced cloud adoption. This allows for a competitive edge in solution delivery, but gaps in customer personalization and workflow automation could impede future market leadership.",
        "transformation_readiness": {
          "score": 0.75,
          "readiness_level": "High",
          "enabling_factors": ["Strong executive buy-in", "Proactive cybersecurity posture", "Clear future digital priorities"],
          "blocking_factors": ["Skills gap", "Resistance to comprehensive change", "Legacy system dependencies"]
        },
        "pattern_analysis": {
          "strengths_pattern": "A consistent pattern of strong top-down leadership and foundational technology adoption, suggesting that strategic mandates are effectively translated into initial infrastructure investments.",
          "weakness_pattern": "Recurring themes of 'skills shortage' and 'budget constraints' across multiple dimensions (Strategic Foundation, Technology, Innovation), indicating a systemic challenge in resource allocation and human capital development for digital initiatives.",
          "correlation_insights": "A notable correlation between moderate 'Data accessibility & quality' and lower 'Personalization capability' in Customer Experience, highlighting that data limitations directly impact the ability to deliver tailored customer interactions. Similarly, 'Legacy system dependencies' significantly contribute to challenges in 'Operational & Process Efficiency'.",
          "anomaly_detection": "While overall digital governance is moderate, the 'Innovation Opportunity Identification' scores are relatively high, suggesting a disconnect where ideas are identified but might not be effectively scaled or resourced due to governance gaps or other barriers."
        }
      },
      "detailed_recommendations": {
        "immediate_actions": {
          "timeline": "0-3 months",
          "priority": "Critical",
          "actions": [
            {
              "action": "Initiate data governance task force to define policies and improve data quality for customer insights.",
              "dimension": "Customer Experience",
              "impact": "High",
              "effort": "Medium",
              "success_metrics": ["Data accuracy %", "Data accessibility rate"],
              "estimated_cost": "$20K - $50K"
            },
            {
              "action": "Conduct a change readiness assessment and develop a targeted communication plan for upcoming automation initiatives.",
              "dimension": "People & Culture",
              "impact": "High",
              "effort": "Medium",
              "success_metrics": ["Employee engagement in training", "Project adoption rate"],
              "estimated_cost": "$15K - $30K"
            }
          ]
        },
        "short_term_initiatives": {
          "timeline": "3-12 months",
          "priority": "High",
          "actions": [
            {
              "action": "Implement a phased upgrade/integration plan for critical legacy systems affecting inter-departmental workflows.",
              "dimension": "Operations & Process Efficiency",
              "impact": "High",
              "effort": "High",
              "success_metrics": ["Workflow automation %", "Process cycle time reduction"],
              "estimated_cost": "$100K - $300K"
            },
            {
              "action": "Develop and launch a pilot program for AI-driven personalization across key customer touchpoints (e.g., website, email).",
              "dimension": "Customer Experience",
              "impact": "High",
              "effort": "High",
              "success_metrics": ["Conversion rate increase", "Customer satisfaction score (CSAT)"],
              "estimated_cost": "$75K - $200K"
            }
          ]
        },
        "long_term_strategy": {
          "timeline": "12-24 months",
          "priority": "Strategic",
          "actions": [
            {
              "action": "Establish a Digital Center of Excellence to foster continuous innovation and cross-functional digital skill development.",
              "dimension": "Innovation & Governance",
              "impact": "High",
              "effort": "High",
              "success_metrics": ["Number of digital innovations launched", "Employee digital proficiency score"],
              "estimated_cost": "$250K - $500K annually"
            },
            {
              "action": "Explore strategic partnerships or acquisitions to rapidly onboard niche digital capabilities and fill critical skills gaps.",
              "dimension": "Strategic Foundation",
              "impact": "High",
              "effort": "High",
              "success_metrics": ["Time to market for new digital services", "Digital talent retention rate"],
              "estimated_cost": "Variable, depending on opportunity"
            }
          ]
        },
        "investment_roadmap": {
          "total_estimated_investment": "$500K - $1.5M over 2 years",
          "roi_projection": "Projected ROI of 1.5x - 2.5x within 3 years, driven by efficiency gains, new revenue streams, and enhanced customer retention.",
          "risk_assessment": "Key risks include inadequate funding, talent scarcity, and internal resistance. Mitigation involves phased investment, aggressive recruitment, and robust change management.",
          "success_probability": 0.8
        }
      },
      "industry_benchmarking": {
        "peer_analysis": {
          "similar_size_average": 3.4,
          "industry_average": 3.2,
          "top_performers_average": 4.5,
          "bottom_quartile_threshold": 2.5
        },
        "capability_rankings": [
          {
            "dimension": "Strategic Foundation",
            "industry_rank": "Top 10%",
            "score_gap_to_leaders": 0.5,
            "improvement_urgency": "Low"
          },
          {
            "dimension": "Technology Infrastructure",
            "industry_rank": "Top 25%",
            "score_gap_to_leaders": 0.8,
            "improvement_urgency": "Medium"
          },
          {
            "dimension": "Customer Experience",
            "industry_rank": "Below Average",
            "score_gap_to_leaders": 1.5,
            "improvement_urgency": "Critical"
          },
          {
            "dimension": "Operations & Process Efficiency",
            "industry_rank": "Average",
            "score_gap_to_leaders": 1.2,
            "improvement_urgency": "High"
          },
          {
            "dimension": "People & Culture",
            "industry_rank": "Average",
            "score_gap_to_leaders": 1.3,
            "improvement_urgency": "High"
          },
          {
            "dimension": "Innovation & Governance",
            "industry_rank": "Top 25%",
            "score_gap_to_leaders": 1.0,
            "improvement_urgency": "Medium"
          }
        ],
        "market_trends": {
          "emerging_technologies": ["Generative AI", "Edge Computing", "Quantum Computing (early stage)"],
          "industry_disruptions": ["API-first economy", "Data privacy regulations", "Hyper-automation"],
          "competitive_advantages": ["Agile delivery models", "Customer-centric product development", "Ecosystem partnerships"]
        }
      },
      "risk_assessment": {
        "transformation_risks": [
          {
            "risk_category": "Cultural",
            "risk_description": "Resistance from employees to adopt new digital tools and processes, leading to low utilization and ROI.",
            "probability": "Medium",
            "impact": "High",
            "mitigation_strategy": "Proactive change management, clear communication, leadership buy-in, training and support."
          },
          {
            "risk_category": "Technical",
            "risk_description": "Integration complexities with legacy systems causing project delays and increased costs.",
            "probability": "High",
            "impact": "Medium",
            "mitigation_strategy": "Phased integration approach, robust API strategy, specialized external expertise."
          },
          {
            "risk_category": "Financial",
            "risk_description": "Underestimation of budget requirements leading to stalled initiatives.",
            "probability": "Medium",
            "impact": "High",
            "mitigation_strategy": "Detailed cost-benefit analysis, contingency planning, executive advocacy for funding."
          }
        ],
        "digital_vulnerabilities": [
          {
            "vulnerability": "Data Silos",
            "affected_dimensions": ["Technology Infrastructure", "Customer Experience", "Operations & Process Efficiency"],
            "severity": 8,
            "remediation_priority": "Critical"
          },
          {
            "vulnerability": "Skills Gap in Emerging Tech",
            "affected_dimensions": ["People & Culture", "Technology Infrastructure", "Innovation & Governance"],
            "severity": 7,
            "remediation_priority": "High"
          }
        ]
      },
      "success_metrics": {
        "kpi_framework": [
          {
            "dimension": "Customer Experience",
            "primary_kpis": ["NPS (Net Promoter Score)", "CSAT (Customer Satisfaction Score)", "Digital engagement rate"],
            "measurement_frequency": "Quarterly",
            "target_improvement": "10% increase in NPS"
          },
          {
            "dimension": "Operations & Process Efficiency",
            "primary_kpis": ["Process automation rate", "Cycle time reduction", "Cost per transaction"],
            "measurement_frequency": "Monthly",
            "target_improvement": "15% reduction in manual tasks"
          }
        ],
        "milestone_tracking": [
          {
            "milestone": "Launch integrated customer personalization platform (Phase 1)",
            "target_date": "2026-03-31",
            "success_criteria": ["50% user adoption", "2% conversion rate increase"],
            "dependencies": ["Data governance policies", "Legacy system integration completed"]
          },
          {
            "milestone": "Automate 3 key HR workflows",
            "target_date": "2025-12-31",
            "success_criteria": ["90% automation rate for selected workflows", "20% time savings"],
            "dependencies": ["New HRIS module deployed"]
          }
        ]
      }
     },
     "strategyUsed": "parseFromMarkdownBlock",
     "success": true
    },
    "section": "Profiling Assessment"
   };


  return json(mockData);
};

// --- React Component for the Page ---
export default function AnalysisReportPage() {
  const report = useLoaderData<typeof loader>();
  const data = report.result.data;

  // Destructure for easier access (using optional chaining for safety)
  const {
    assessment_metadata,
    organization_profile,
    maturity_analysis,
    visualization_data,
    strategic_insights,
    detailed_recommendations,
    industry_benchmarking,
    risk_assessment,
    success_metrics,
  } = data;

  // Prepare data for charts using the new structure
  const radarChartData = getRadarChartData(maturity_analysis?.dimensional_scores, visualization_data?.radar_chart);
  const progressBars = getProgressBarData(visualization_data?.progress_bars);
  const heatmapConfig = getHeatmapMatrix(visualization_data?.heat_map_data);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 font-sans antialiased text-gray-800">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight leading-tight animate-fade-in-down">
          Digital Maturity Analysis Report
        </h1>
        <p className="mt-2 text-lg text-gray-600 animate-fade-in">
          Assessment for Company ID: <span className="font-semibold text-blue-700">{report.pk.split('#')[1] || report.pk}</span>
        </p>
        {assessment_metadata && (
          <p className="mt-1 text-sm text-gray-500">
            Completed on: {new Date(assessment_metadata.completion_date).toLocaleDateString()} | Confidence: {(assessment_metadata.processing_confidence * 100).toFixed(1)}%
          </p>
        )}
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        {/* --- Organization Profile --- */}
        {organization_profile && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Organization Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-700">
              <p><span className="font-semibold">Company Size:</span> {organization_profile.company_size}</p>
              <p><span className="font-semibold">Industry Sector:</span> {organization_profile.industry_sector}</p>
              <p><span className="font-semibold">Annual Revenue:</span> {organization_profile.annual_revenue}</p>
              <p><span className="font-semibold">Business Model:</span> {organization_profile.business_model.join(', ')}</p>
              <p><span className="font-semibold">Current Digital Stage:</span> {organization_profile.current_digital_stage}/5</p>
            </div>
          </section>
        )}

        {/* --- Overall Maturity & Benchmarking --- */}
        {maturity_analysis?.overall_score && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Overall Digital Maturity</h2>

            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Maturity Level: {maturity_analysis.overall_score.maturity_level}
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-6 relative overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out-cubic flex items-center justify-center"
                  style={{ width: `${maturity_analysis.overall_score.percentage}%` }}
                >
                  <span className="text-sm font-bold text-white pr-2">
                    {maturity_analysis.overall_score.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                Weighted Score: {maturity_analysis.overall_score.weighted_score.toFixed(2)} | Confidence: {(maturity_analysis.overall_score.confidence_score * 100).toFixed(1)}%
              </p>
            </div>

            {maturity_analysis.overall_score.industry_benchmark && (
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Industry Benchmarking</h3>
                  <p><span className="font-semibold">Industry Average:</span> {maturity_analysis.overall_score.industry_benchmark.industry_average.toFixed(2)}</p>
                  <p><span className="font-semibold">Percentile Ranking:</span> {maturity_analysis.overall_score.industry_benchmark.percentile_ranking}%</p>
                  <p><span className="font-semibold">Peer Comparison:</span> {maturity_analysis.overall_score.industry_benchmark.peer_comparison}</p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* --- Dimensional Scores Radar Chart --- */}
        {visualization_data?.radar_chart && radarChartData.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Dimensional Maturity Scores</h2>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Digital Maturity Radar (Percentage)</h3>
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarChartData} className="opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#CBD5E0" tickCount={6} />
                <Radar name="Current Score" dataKey="Current" stroke={visualization_data.radar_chart.colors.current} fill={visualization_data.radar_chart.colors.current} fillOpacity={0.6} animationDuration={1500} />
                <Radar name="Industry Benchmark" dataKey="Benchmark" stroke={visualization_data.radar_chart.colors.benchmark} fill={visualization_data.radar_chart.colors.benchmark} fillOpacity={0.0} animationDuration={1500} strokeDasharray="3 3"/>
                <Radar name="Target Score" dataKey="Target" stroke={visualization_data.radar_chart.colors.target} fill={visualization_data.radar_chart.colors.target} fillOpacity={0.0} animationDuration={1500} strokeDasharray="5 5"/>
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </section>
        )}

        {/* --- Progress Bars for Dimensions --- */}
        {visualization_data?.progress_bars && visualization_data.progress_bars.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Progress Towards Digital Targets</h2>
            <div className="space-y-6">
              {progressBars.map((pb, index) => (
                <div key={index} className="opacity-0 animate-fade-in" style={{ animationDelay: `${0.1 * index}s` }}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-1">{pb.dimension}</h3>
                  <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out-cubic"
                      style={{ width: `${pb.current_percentage}%`, backgroundColor: pb.color_code }}
                    ></div>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                      {pb.current_percentage.toFixed(1)}% (Target: {pb.target_percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 text-right">Status: <span className={`font-semibold ${pb.status === 'Critical' ? 'text-red-600' : pb.status === 'Needs_Attention' ? 'text-orange-600' : pb.status === 'On_Track' ? 'text-blue-600' : 'text-green-600'}`}>{pb.status.replace(/_/g, ' ')}</span></p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* --- Heatmap for Capabilities --- */}
        {visualization_data?.heat_map_data && heatmapConfig.data.length > 0 && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Capability Assessment Heatmap</h2>
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Score by Dimension & Capability (1-5 Scale: 1=Excellent, 5=Critical)</h3>
            <Heatmap data={heatmapConfig} />
          </section>
        )}

        {/* --- Strategic Insights --- */}
        {strategic_insights && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Strategic Insights</h2>
            <div className="space-y-6 text-gray-700">
              <p><span className="font-semibold">Overall Assessment:</span> {strategic_insights.overall_assessment}</p>
              <p><span className="font-semibold">Maturity Stage Description:</span> {strategic_insights.maturity_stage_description}</p>
              <p><span className="font-semibold">Competitive Position:</span> {strategic_insights.competitive_position}</p>

              {strategic_insights.transformation_readiness && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Transformation Readiness: {strategic_insights.transformation_readiness.readiness_level}</h3>
                  <p><span className="font-semibold">Score:</span> {(strategic_insights.transformation_readiness.score * 100).toFixed(1)}%</p>
                  <p><span className="font-semibold">Enabling Factors:</span> {strategic_insights.transformation_readiness.enabling_factors.join(', ')}</p>
                  <p><span className="font-semibold">Blocking Factors:</span> {strategic_insights.transformation_readiness.blocking_factors.join(', ')}</p>
                </div>
              )}

              {strategic_insights.pattern_analysis && (
                <div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Pattern Analysis</h3>
                  <p><span className="font-semibold">Strengths Pattern:</span> {strategic_insights.pattern_analysis.strengths_pattern}</p>
                  <p><span className="font-semibold">Weakness Pattern:</span> {strategic_insights.pattern_analysis.weakness_pattern}</p>
                  <p><span className="font-semibold">Correlation Insights:</span> {strategic_insights.pattern_analysis.correlation_insights}</p>
                  <p><span className="font-semibold">Anomaly Detection:</span> {strategic_insights.pattern_analysis.anomaly_detection}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* --- Detailed Recommendations --- */}
        {detailed_recommendations && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Detailed Recommendations</h2>

            {[detailed_recommendations.immediate_actions, detailed_recommendations.short_term_initiatives, detailed_recommendations.long_term_strategy].map((recSection, idx) => (
              recSection && (
                <div key={idx} className="mb-8 p-4 bg-gray-50 rounded-lg shadow-inner">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">{recSection.timeline} ({recSection.priority})</h3>
                  <ul className="list-disc list-inside space-y-3 text-gray-700">
                    {recSection.actions.map((action, actionIdx) => (
                      <li key={actionIdx}>
                        <p className="font-semibold">{action.action}</p>
                        <ul className="list-none ml-4 text-sm space-y-1">
                          <li><span className="font-medium">Dimension:</span> {action.dimension}</li>
                          <li><span className="font-medium">Impact:</span> {action.impact} | <span className="font-medium">Effort:</span> {action.effort}</li>
                          <li><span className="font-medium">Success Metrics:</span> {action.success_metrics.join(', ')}</li>
                          <li><span className="font-medium">Estimated Cost:</span> {action.estimated_cost}</li>
                        </ul>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            ))}

            {detailed_recommendations.investment_roadmap && (
              <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow-inner">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Investment Roadmap</h3>
                <p><span className="font-semibold">Total Estimated Investment:</span> {detailed_recommendations.investment_roadmap.total_estimated_investment}</p>
                <p><span className="font-semibold">ROI Projection:</span> {detailed_recommendations.investment_roadmap.roi_projection}</p>
                <p><span className="font-semibold">Risk Assessment:</span> {detailed_recommendations.investment_roadmap.risk_assessment}</p>
                <p><span className="font-semibold">Success Probability:</span> {(detailed_recommendations.investment_roadmap.success_probability * 100).toFixed(1)}%</p>
              </div>
            )}
          </section>
        )}

        {/* --- Industry Benchmarking --- */}
        {industry_benchmarking && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Industry Benchmarking</h2>
            {industry_benchmarking.peer_analysis && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Peer Analysis</h3>
                <p><span className="font-semibold">Similar Size Average:</span> {industry_benchmarking.peer_analysis.similar_size_average.toFixed(2)}</p>
                <p><span className="font-semibold">Industry Average:</span> {industry_benchmarking.peer_analysis.industry_average.toFixed(2)}</p>
                <p><span className="font-semibold">Top Performers Average:</span> {industry_benchmarking.peer_analysis.top_performers_average.toFixed(2)}</p>
                <p><span className="font-semibold">Bottom Quartile Threshold:</span> {industry_benchmarking.peer_analysis.bottom_quartile_threshold.toFixed(2)}</p>
              </div>
            )}

            {industry_benchmarking.capability_rankings && industry_benchmarking.capability_rankings.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Capability Rankings</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {industry_benchmarking.capability_rankings.map((cr, idx) => (
                    <li key={idx}><span className="font-semibold">{cr.dimension}:</span> Rank - {cr.industry_rank}, Gap to Leaders - {cr.score_gap_to_leaders.toFixed(2)}, Urgency - {cr.improvement_urgency}</li>
                  ))}
                </ul>
              </div>
            )}

            {industry_benchmarking.market_trends && (
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Market Trends</h3>
                <p><span className="font-semibold">Emerging Technologies:</span> {industry_benchmarking.market_trends.emerging_technologies.join(', ')}</p>
                <p><span className="font-semibold">Industry Disruptions:</span> {industry_benchmarking.market_trends.industry_disruptions.join(', ')}</p>
                <p><span className="font-semibold">Competitive Advantages:</span> {industry_benchmarking.market_trends.competitive_advantages.join(', ')}</p>
              </div>
            )}
          </section>
        )}

        {/* --- Risk Assessment --- */}
        {risk_assessment && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Risk Assessment</h2>
            {risk_assessment.transformation_risks && risk_assessment.transformation_risks.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Transformation Risks</h3>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  {risk_assessment.transformation_risks.map((risk, idx) => (
                    <li key={idx}>
                      <p className="font-semibold">{risk.risk_category}:</p>
                      <ul className="list-none ml-4 text-sm space-y-1">
                        <li><span className="font-medium">Description:</span> {risk.risk_description}</li>
                        <li><span className="font-medium">Probability:</span> {risk.probability} | <span className="font-medium">Impact:</span> {risk.impact}</li>
                        <li><span className="font-medium">Mitigation:</span> {risk.mitigation_strategy}</li>
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {risk_assessment.digital_vulnerabilities && risk_assessment.digital_vulnerabilities.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Digital Vulnerabilities</h3>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  {risk_assessment.digital_vulnerabilities.map((vuln, idx) => (
                    <li key={idx}>
                      <p className="font-semibold">{vuln.vulnerability}:</p>
                      <ul className="list-none ml-4 text-sm space-y-1">
                        <li><span className="font-medium">Affected Dimensions:</span> {vuln.affected_dimensions.join(', ')}</li>
                        <li><span className="font-medium">Severity:</span> {vuln.severity} | <span className="font-medium">Remediation Priority:</span> {vuln.remediation_priority}</li>
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

        {/* --- Success Metrics --- */}
        {success_metrics && (
          <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
            <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Success Metrics & Milestones</h2>
            {success_metrics.kpi_framework && success_metrics.kpi_framework.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">KPI Framework</h3>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  {success_metrics.kpi_framework.map((kpi, idx) => (
                    <li key={idx}>
                      <p><span className="font-semibold">{kpi.dimension}:</span></p>
                      <ul className="list-none ml-4 text-sm space-y-1">
                        <li><span className="font-medium">Primary KPIs:</span> {kpi.primary_kpis.join(', ')}</li>
                        <li><span className="font-medium">Measurement Frequency:</span> {kpi.measurement_frequency}</li>
                        <li><span className="font-medium">Target Improvement:</span> {kpi.target_improvement}</li>
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {success_metrics.milestone_tracking && success_metrics.milestone_tracking.length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Milestone Tracking</h3>
                <ul className="list-disc list-inside space-y-3 text-gray-700">
                  {success_metrics.milestone_tracking.map((milestone, idx) => (
                    <li key={idx}>
                      <p className="font-semibold">{milestone.milestone}</p>
                      <ul className="list-none ml-4 text-sm space-y-1">
                        <li><span className="font-medium">Target Date:</span> {new Date(milestone.target_date).toLocaleDateString()}</li>
                        <li><span className="font-medium">Success Criteria:</span> {milestone.success_criteria.join(', ')}</li>
                        <li><span className="font-medium">Dependencies:</span> {milestone.dependencies.join(', ')}</li>
                      </ul>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        )}

      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>

      {/* Tailwind CSS Animations */}
      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(50px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-fade-in-down { animation: fadeInDown 1s ease-out forwards; }
        .animate-fade-in { animation: fadeIn 0.8s ease-out forwards; }
        .animate-slide-in-up { animation: slideInUp 0.7s ease-out forwards; }
        .ease-out-cubic { transition-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }
      `}</style>
    </div>
  );
}