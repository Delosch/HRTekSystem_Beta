// app/routes/analysis.$id.tsx
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// --- Data Structures ---
interface AnalysisReport {
  pk: string;
  sk: string;
  assessment_id: string;
  createdAt: string;
  result: {
    data: {
      executive_summary: {
        key_recommendations: string[];
        maturity_level: string;
        strengths: string[];
        weaknesses: string[];
      };
      sections_analysis: Array<{
        analysis: Record<string, string>;
        part: string;
      }>;
    };
    strategyUsed: string;
    success: boolean;
  };
  section: string;
}

interface ChartData {
  name: string;
  score: number;
  fullMark: number;
}

interface HeatmapData {
  x: string;
  y: string;
  value: number;
}

// --- Data Transformation & Visualization Logic ---

const getMaturityScore = (level: string): number => {
  const levels: { [key: string]: number } = {
    "Emerging": 1,
    "Developing": 2,
    "Maturing": 3,
    "Advanced": 4,
    "Leading": 5,
  };
  return levels[level] || 0;
};

const extractAssessmentScores = (sections: AnalysisReport['result']['data']['sections_analysis']): ChartData[] => {
  const scores: ChartData[] = [];
  sections.forEach(section => {
    // Look for assessment scores, assuming they follow a pattern like "X out of 5"
    for (const key in section.analysis) {
      const match = section.analysis[key].match(/(\d+)\s+out of\s+5/);
      if (match && section.part !== "Section 1: Organization Overview") { // Exclude overview as it doesn't contain direct scores for visualization
        const score = parseInt(match[1], 10);
        scores.push({
          name: key.replace(/_assessment$/, '').replace(/_/g, ' '), // Clean up key for display
          score: score,
          fullMark: 5,
        });
      }
    }
  });
  return scores;
};

const generateHeatmapData = (sections: AnalysisReport['result']['data']['sections_analysis']): HeatmapData[] => {
  const data: HeatmapData[] = [];
  const weaknessesMap: { [key: string]: number } = {}; // To aggregate weakness impact
  
  sections.forEach(section => {
    // This is a simplified example. A real-world heatmap might require more specific data points.
    // Here, we'll try to quantify "challenges" or "limitations" mentioned in analysis.
    const partName = section.part.replace('Section ', 'S').replace(': ', '\n'); // Shorten for display

    for (const key in section.analysis) {
      const analysisText = section.analysis[key].toLowerCase();
      let intensity = 0;

      if (analysisText.includes('very low') || analysisText.includes('critical impediment')) intensity = 5;
      else if (analysisText.includes('low') || analysisText.includes('significant challenges') || analysisText.includes('major limitations')) intensity = 4;
      else if (analysisText.includes('moderate') || analysisText.includes('some progress')) intensity = 3;
      else if (analysisText.includes('decent') || analysisText.includes('good range')) intensity = 2;
      else if (analysisText.includes('high') || analysisText.includes('strong')) intensity = 1; // Lower intensity for positive
      
      data.push({ x: partName, y: key.replace(/_/g, ' ').substring(0, 20), value: intensity }); // Limit y label length
    }
  });

  return data.filter(d => d.value > 0); // Only include relevant entries
};

// --- Custom Heatmap Component ---
const HeatmapCell: React.FC<{ value: number }> = ({ value }) => {
  let bgColor = 'bg-gray-200'; // Default for 0 or not found
  if (value === 1) bgColor = 'bg-green-100'; // Strong
  if (value === 2) bgColor = 'bg-green-300'; // Decent
  if (value === 3) bgColor = 'bg-yellow-300'; // Moderate
  if (value === 4) bgColor = 'bg-orange-400'; // Low/Significant
  if (value === 5) bgColor = 'bg-red-500';   // Very Low/Critical

  return (
    <div
      className={`${bgColor} w-full h-full flex items-center justify-center transition-all duration-300 ease-in-out hover:scale-105`}
      style={{ minWidth: '80px', minHeight: '40px' }} // Ensure visibility
    >
      <span className="text-xs text-gray-800 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
        {value > 0 ? value : ''}
      </span>
    </div>
  );
};

const Heatmap: React.FC<{ data: HeatmapData[] }> = ({ data }) => {
  const xLabels = Array.from(new Set(data.map(d => d.x)));
  const yLabels = Array.from(new Set(data.map(d => d.y))).sort(); // Sort y-labels for consistency

  const getCellValue = (x: string, y: string) => {
    const cell = data.find(d => d.x === x && d.y === y);
    return cell ? cell.value : 0;
  };

  return (
    <div className="overflow-x-auto p-4">
      <div className="inline-grid gap-1" style={{ gridTemplateColumns: `auto repeat(${xLabels.length}, minmax(80px, 1fr))` }}>
        {/* Corner empty cell */}
        <div className="bg-gray-100 p-2 text-center text-xs font-semibold"></div>
        {/* X-axis labels */}
        {xLabels.map((label, idx) => (
          <div key={idx} className="bg-gray-100 p-2 text-center text-xs font-semibold leading-tight break-words" style={{minWidth: '80px'}}>
            {label}
          </div>
        ))}

        {/* Y-axis labels and data cells */}
        {yLabels.map((yLabel, yIdx) => (
          <React.Fragment key={yIdx}>
            <div className="bg-gray-100 p-2 text-left text-xs font-semibold break-words" style={{minHeight: '40px'}}>
              {yLabel}
            </div>
            {xLabels.map((xLabel, xIdx) => (
              <div key={`${xIdx}-${yIdx}`} className="group relative border border-gray-200">
                <HeatmapCell value={getCellValue(xLabel, yLabel)} />
              </div>
            ))}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};


// --- Remix Loader ---
export const loader = async ({ params }: LoaderFunctionArgs) => {
  // In a real application, you would fetch this from your database using params.id
  // For now, we'll use the provided static JSON data.
  const mockData: AnalysisReport = {
    "pk": "COMPANY2695b6#48be1ea9-fcc3-4db0-b414-66085e",
    "sk": "ANALYSIS#2025-08-03T14:06:29.893Z",
    "assessment_id": "QUESTION#5f41bdc9-67f0-478d-bba3-0271141d0eae",
    "createdAt": "2025-08-03T14:06:29.893Z",
    "result": {
      "data": {
        "executive_summary": {
          "key_recommendations": [
            "**Strengthen Strategic Foundation:** Develop a clear, actionable digital transformation roadmap with strong executive championship and dedicated, adequate budget allocation. Address the 'lack of clear vision' as a primary barrier.",
            "**Modernize Core Infrastructure:** Prioritize improving IT infrastructure scalability and addressing legacy system integration. Invest in data governance to enhance data accessibility, accuracy, and actionability.",
            "**Enhance Operational Efficiency:** Accelerate process automation beyond current plans, focusing on critical areas identified (HR, finance, customer service) and addressing manual coordination and approval workflow automation. Implement digital tools for performance measurement.",
            "**Foster Digital Culture & Skills:** Implement robust change management strategies to overcome resistance and improve cultural adaptation. Systematically invest in workforce digital skills development, particularly in data analysis, AI/ML, and project management.",
            "**Systematize Innovation & Governance:** Establish a formal process for identifying and developing digital innovation opportunities. Address innovation barriers by allocating dedicated resources (budget, time) and fostering a culture that embraces calculated risks."
          ],
          "maturity_level": "Developing",
          "strengths": [
            "Moderate cloud adoption and cybersecurity posture, indicating foundational technology efforts.",
            "Established presence across multiple digital customer channels (website, mobile app, social media, AI chatbots).",
            "Initial steps in process digitization, with identified automation priorities in HR, finance, and customer service.",
            "Workforce possesses moderate digital skills, and there's a recognition of key skill development areas.",
            "Presence of a digital governance framework and proactive digital risk management.",
            "Clear articulation of future digital priorities, including AI expansion, data-driven decision making, cloud migration, and enhanced customer personalization."
          ],
          "weaknesses": [
            "Low digital transformation stage (2 out of 5), indicating early-stage maturity.",
            "Significant challenges in strategic foundation: very low clarity in digital strategy (1/5), insufficient budget allocation (1/5), and limited executive leadership support (2/5).",
            "Major technology infrastructure limitations: very low IT infrastructure scalability (1/5), and challenges with legacy system integration, data silos, and skills shortage.",
            "Data accessibility and quality are moderate (2/5), hindering data-driven initiatives.",
            "Customer feedback integration is weak (2/5), suggesting a reactive approach to CX improvements.",
            "Operational efficiency measurement and departmental collaboration are low (2/5), compounded by manual processes and lack of automation in workflows.",
            "Organizational culture shows limited adaptation to digital change (2/5), and change management effectiveness is very low (1/5).",
            "Innovation opportunity identification is low (2 out of 5), with significant barriers including budget, time, skills shortage, and risk aversion."
          ]
        },
        "sections_analysis": [
          {
            "analysis": {
              "annual_revenue": "Annual revenue is less than $1M, indicating a smaller scale of operations, which aligns with the employee count and can impact investment capacity for digital initiatives.",
              "business_model": "The primary business model is B2B2C, suggesting a need for robust digital interfaces and strategies to engage both business partners and end-consumers.",
              "company_size": "The organization is small, with less than 50 employees, which can imply agility but also resource constraints.",
              "digital_transformation_stage_assessment": "The organization rates its current digital transformation stage as 2 out of 5, indicating it is in the early stages of its digital journey, likely having initiated some digital projects but not yet achieving widespread integration or significant maturity.",
              "industry_sector": "Operating within the Government sector, which often faces unique challenges related to regulatory constraints, legacy systems, and budget processes, as highlighted in later sections."
            },
            "part": "Section 1: Organization Overview"
          },
          {
            "analysis": {
              "budget_allocation_assessment": "Budget allocation for digital transformation is very low (1 out of 5), which is a critical impediment to progress and aligns with 'insufficient funding' as a barrier.",
              "digital_strategy_clarity_assessment": "A score of 1 out of 5 indicates a very low level of clarity in the digital transformation roadmap, suggesting a lack of a well-defined direction or strategic plan.",
              "executive_leadership_support_assessment": "Executive leadership support is rated 2 out of 5, implying that while some support may exist, it is not consistently strong or actively championing digital initiatives.",
              "strategic_alignment_barriers_analysis": "The main barriers identified are 'Lack of clear vision,' 'Regulatory constraints,' and 'Insufficient funding.' These directly correlate with the low scores in strategy clarity and budget, and are common in the government sector. The lack of vision is particularly concerning as it impacts all other strategic efforts.",
              "strategic_foundation_summary": "Overall, the strategic foundation for digital transformation is weak. The absence of a clear vision, coupled with insufficient funding and limited executive championship, creates significant hurdles for any digital initiative. Regulatory constraints further complicate strategic implementation."
            },
            "part": "Section 2: Strategic Foundation"
          },
          {
            "analysis": {
              "cloud_adoption_level_assessment": "Cloud adoption is at a moderate level (3 out of 5), suggesting some progress in leveraging cloud technologies, which is a positive step towards modernization.",
              "cybersecurity_posture_assessment": "Cybersecurity measures are moderately effective (3 out of 5), which is a reasonable posture, but continuous vigilance is required, especially with increasing digital assets.",
              "data_accessibility_quality_assessment": "Data accessibility, accuracy, and actionability are rated 2 out of 5, implying that data management capabilities are still developing, potentially leading to data silos or unreliable insights.",
              "it_infrastructure_scalability_assessment": "IT infrastructure scalability is very low (1 out of 5), indicating that the current systems may struggle to support growing digital operations or new digital services.",
              "technology_infrastructure_summary": "The technology infrastructure presents a mixed picture. While there's moderate cloud adoption and cybersecurity, the fundamental issues of legacy systems, poor scalability, and data quality significantly impede digital progress. The skills shortage further exacerbates these challenges.",
              "technology_integration_challenges_analysis": "Key challenges include 'Legacy system integration,' 'Scalability limitations,' and 'Skills shortage.' These directly reflect the low score in IT infrastructure scalability and the developing data management capabilities. Legacy systems are a common bottleneck, especially in government."
            },
            "part": "Section 3: Technology & Infrastructure"
          },
          {
            "analysis": {
              "customer_experience_summary": "The organization has a decent digital presence and makes efforts towards omnichannel interaction and personalization. However, the limited integration of customer feedback suggests a potential gap in truly customer-centric digital development. Leveraging the existing channels more effectively with better feedback loops could significantly enhance CX.",
              "customer_feedback_integration_assessment": "Customer feedback directly influences digital improvements at a low level (2 out of 5), suggesting that feedback mechanisms might be in place but are not effectively integrated into the improvement cycle.",
              "digital_customer_channels_analysis": "The organization utilizes a good range of digital channels including 'Website,' 'Mobile app,' 'AI chatbots,' and 'Social media,' demonstrating a commitment to digital engagement.",
              "omnichannel_customer_interaction_assessment": "Customers can interact seamlessly across digital channels at a moderate level (3 out of 5), suggesting some integration but likely room for improvement in consistency and completeness across touchpoints.",
              "personalization_capability_assessment": "The use of customer data for personalization is at a moderate level (3 out of 5), indicating efforts to tailor experiences, but perhaps not yet fully leveraging available data or advanced analytics."
            },
            "part": "Section 4: Customer Experience & Engagement"
          },
          {
            "analysis": {
              "automation_priorities_analysis": "The organization plans to automate 'HR processes,' 'Financial reporting,' and 'Customer service,' which are common and impactful areas for efficiency gains.",
              "departmental_collaboration_assessment": "Departmental collaboration through digital platforms is low (2 out of 5), pointing to potential silos and inefficiencies in cross-functional workflows.",
              "operational_challenges_analysis": "The key operational challenges are 'Manual coordination between departments and lack of automation in approval workflows.' This aligns perfectly with the low scores in departmental collaboration and efficiency measurement, highlighting critical bottlenecks.",
              "operational_efficiency_measurement_assessment": "Measuring and optimizing operational efficiency using digital tools is low (2 out of 5), suggesting a lack of robust digital performance monitoring and optimization practices.",
              "operations_efficiency_summary": "While some processes are digitized, the organization struggles significantly with operational efficiency due to manual coordination, lack of automation in critical workflows (like approvals), and insufficient digital tools for performance measurement. Improving inter-departmental digital collaboration is crucial for unlocking efficiency.",
              "process_digitization_level_assessment": "Core business processes are digitally enabled at a moderate level (3 out of 5), indicating that some processes have been digitized, but many may still be manual or partially digital."
            },
            "part": "Section 5: Operations & Process Efficiency"
          },
          {
            "analysis": {
              "change_management_effectiveness_assessment": "Effectiveness in managing digital transformation changes is very low (1 out of 5), which is a critical weakness, as poor change management can derail even well-planned initiatives.",
              "organizational_culture_adaptation_assessment": "Organizational culture embraces digital change at a low level (2 out of 5), suggesting resistance or a slow pace of adaptation to new digital ways of working.",
              "people_culture_summary": "The organization faces significant challenges in its people and culture dimension. While there's a moderate baseline of digital skills and a clear understanding of future skill needs, the low cultural adaptation and very ineffective change management pose substantial risks to successful digital transformation. Addressing cultural resistance and improving change leadership are paramount.",
              "skill_development_priorities_analysis": "Priority skill development areas include 'Data analysis,' 'Project management,' 'AI/Machine learning,' and 'Customer experience.' This indicates a forward-looking approach to skill development, recognizing the importance of data, emerging tech, and customer focus.",
              "workforce_digital_skills_assessment": "The workforce possesses digital skills needed for current operations at a moderate level (3 out of 5), indicating a foundational level of competence but likely gaps in advanced or emerging digital areas."
            },
            "part": "Section 6: People & Culture"
          },
          {
            "analysis": {
              "digital_governance_framework_assessment": "Digital initiatives are governed by clear policies and accountability at a moderate level (3 out of 5), indicating some structure is in place, but it may not be fully comprehensive or consistently applied.",
              "digital_risk_management_assessment": "Proactive management of digital transformation risks is at a moderate level (3 out of 5), suggesting awareness and some measures, but potential for more robust frameworks.",
              "future_digital_priorities_analysis": "Top digital transformation priorities for the next 12-18 months are ambitious: 'expand AI capabilities in operations, enhance data-driven decision making, migrate 50% of our services to the cloud, and improve the personalization of customer interactions.' These priorities are well-aligned with modern digital trends and address some current weaknesses.",
              "innovation_barriers_analysis": "Main barriers to innovation include 'Lack of time,' 'Skills shortage,' and 'Budget constraints.' These align with challenges identified in other sections (e.g., insufficient funding, skills gap) and highlight resource limitations.",
              "innovation_governance_summary": "While there's a foundational level of digital governance and risk management, the organization struggles with systematic innovation. Resource constraints (time, budget, skills) are significant barriers. The ambitious future priorities indicate a desire for growth, but achieving them will require overcoming the current innovation and foundational weaknesses.",
              "innovation_opportunity_identification_assessment": "Systematic identification and development of digital innovation opportunities are low (2 out of 5), suggesting an ad-hoc or reactive approach to innovation rather than a structured pipeline."
            },
            "part": "Section 7: Innovation & Governance"
          }
        ]
      },
      "strategyUsed": "parseFromMarkdownBlock",
      "success": true
    },
    "section": "Profiling Assessment"
  };

  // In a real app, you would use params.id to fetch the specific data.
  // const data = await getAnalysisReportFromDB(params.id);
  // if (!data) {
  //   throw new Response("Not Found", { status: 404 });
  // }

  return json(mockData);
};

// --- React Component for the Page ---
export default function AnalysisReportPage() {
  const report = useLoaderData<typeof loader>();
  const assessmentData = report.result.data;

  // Prepare data for charts
  const maturityScore = getMaturityScore(assessmentData.executive_summary.maturity_level);
  const assessmentScores = extractAssessmentScores(assessmentData.sections_analysis);
  const heatmapData = generateHeatmapData(assessmentData.sections_analysis);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 font-sans antialiased text-gray-800">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-blue-800 tracking-tight leading-tight animate-fade-in-down">
          Digital Maturity Analysis Report
        </h1>
        <p className="mt-2 text-lg text-gray-600 animate-fade-in">
          Assessment for Company: <span className="font-semibold text-blue-700">{report.pk.split('#')[0]}</span>
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Generated on: {new Date(report.createdAt).toLocaleDateString()}
        </p>
      </header>

      <main className="max-w-7xl mx-auto space-y-12">
        {/* --- Executive Summary --- */}
        <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
          <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Executive Summary</h2>

          {/* Maturity Level Progress Bar */}
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Overall Digital Maturity: {assessmentData.executive_summary.maturity_level}</h3>
            <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out-cubic"
                style={{ width: `${(maturityScore / 5) * 100}%` }}
              ></div>
              <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                {maturityScore} / 5
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-green-700 mb-3">Strengths</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {assessmentData.executive_summary.strengths.map((s, i) => (
                  <li key={i} className="opacity-0 animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-red-700 mb-3">Weaknesses</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                {assessmentData.executive_summary.weaknesses.map((w, i) => (
                  <li key={i} className="opacity-0 animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-xl font-semibold text-purple-700 mb-3">Key Recommendations</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {assessmentData.executive_summary.key_recommendations.map((r, i) => (
                <li key={i} className="opacity-0 animate-fade-in" style={{ animationDelay: `${0.1 * i}s` }}>
                  <span dangerouslySetInnerHTML={{ __html: r.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* --- Sectional Analysis & Charts --- */}
        <section className="bg-white rounded-xl shadow-lg p-8 animate-slide-in-up">
          <h2 className="text-3xl font-bold text-blue-700 mb-6 border-b-2 pb-2 border-blue-200">Detailed Analysis</h2>

          {/* Radar Chart for Sectional Scores */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Sectional Digital Readiness Scores (Out of 5)</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={assessmentScores} className="opacity-0 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 12 }} />
                <PolarRadiusAxis angle={90} domain={[0, 5]} stroke="#CBD5E0" tickCount={6} />
                <Radar name="Digital Readiness" dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} animationDuration={1500} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart for Individual Assessment Scores */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Key Assessment Metrics (Out of 5)</h3>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={assessmentScores} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} className="opacity-0 animate-fade-in" style={{ animationDelay: '0.8s' }}>
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} tick={{ fill: '#4B5563', fontSize: 10 }} />
                <YAxis domain={[0, 5]} tickCount={6} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#4299E1" animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Heatmap */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-700 mb-4 text-center">Impact & Challenges Heatmap (Higher value = Higher Challenge/Impact)</h3>
            <Heatmap data={heatmapData} />
            <div className="mt-4 flex justify-center gap-4 text-sm font-semibold">
              <span className="flex items-center"><span className="w-4 h-4 rounded-full bg-red-500 mr-2"></span>5 (Very High Challenge)</span>
              <span className="flex items-center"><span className="w-4 h-4 rounded-full bg-orange-400 mr-2"></span>4 (High Challenge)</span>
              <span className="flex items-center"><span className="w-4 h-4 rounded-full bg-yellow-300 mr-2"></span>3 (Moderate)</span>
              <span className="flex items-center"><span className="w-4 h-4 rounded-full bg-green-300 mr-2"></span>2 (Low Challenge)</span>
              <span className="flex items-center"><span className="w-4 h-4 rounded-full bg-green-100 mr-2"></span>1 (Very Low Challenge/Strength)</span>
            </div>
          </div>


          {/* Detailed Section Analyses */}
          <div className="space-y-8 mt-12">
            {assessmentData.sections_analysis.map((section, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg shadow-inner opacity-0 animate-slide-in-up" style={{ animationDelay: `${0.2 * index}s` }}>
                <h3 className="text-2xl font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">
                  {section.part}
                </h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {Object.entries(section.analysis).map(([key, value]) => (
                    <li key={key}>
                      <span className="font-semibold capitalize">{key.replace(/_/g, ' ')}:</span> {value}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-12 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>

      {/* Tailwind CSS Animations (add this to your root.tsx or a global CSS file) */}
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