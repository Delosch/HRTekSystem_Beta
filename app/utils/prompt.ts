import { getLatestQuestion } from "./question.utils";

export interface PromptType {
  id: string;
  name: string;
  basePrompt: string;
}

export interface QuestionResult {
  pk: string;
  parts: unknown;
}

export const PROMPT_PLACEHOLDERS = {
  USER_ANSWERS: "{{USER_ANSWERS}}",
  QUESTION_SHEET: "{{QUESTION_SHEET}}",
} as const;

const prompt_extra = `
## 🚨 ABSOLUTE JSON REQUIREMENTS:
- Return ONLY the JSON object without any markdown formatting
- Do NOT wrap the response in \`\`\`json or \`\`\`
- Do NOT include any explanatory text before or after the JSON  
- Start directly with { and end with }
- Ensure the JSON is valid and properly escaped
- All strings must use double quotes, not single quotes
- No trailing commas anywhere in the JSON
- All arrays must have the exact number of elements specified
- Use null for missing values, never undefined
`;

export const PROMPTS: PromptType[] = [
  {
    id: "digital_maturity",
    name: "Company Profiling assessment",
    basePrompt: `# Digital Maturity Assessment Analysis Engine

You are an expert digital transformation analyst tasked with processing a comprehensive digital maturity assessment and generating production-ready analysis results.

## ROLE EXPLANATION:
- System Role: You receive analysis instructions and methodology
- User Role: You receive assessment data to analyze according to the system instructions
- Output: You return a JSON analysis following the exact structure specified

## INPUT DATA:
- questions_json: Complete questionnaire structure with all questions, types, and metadata
- responses_json: User responses to all assessment questions
- organization_context: Industry, size, revenue data from responses

## ANALYSIS REQUIREMENTS:

### SCORING METHODOLOGY:
1. **Dimensional Weights** (industry-configurable):
   - Strategic Foundation: 20%
   - Technology & Infrastructure: 18% 
   - Customer Experience: 17%
   - Operations & Process: 15%
   - People & Culture: 12%
   - Innovation & Governance: 8%
   - Organization Overview: 10%

2. **Industry-Specific Adjustments**:
   - Technology sector: +10% Technology Infrastructure, -5% Customer Experience
   - Healthcare: +15% Governance, +10% Security considerations
   - Financial Services: +20% Governance, +15% Security
   - Manufacturing: +10% Operations, +5% Technology Infrastructure
   - Retail: +15% Customer Experience, +10% Technology Infrastructure
   - Default: Use base weights for other industries

3. **Maturity Level Thresholds** (configurable by company size):
   - Small (<50 employees): Nascent 0-1.2, Emerging 1.3-2.5, Developing 2.6-3.5, Advanced 3.6-4.2, Transformative 4.3-5.0
   - Medium (50-1000): Nascent 0-1.0, Emerging 1.1-2.2, Developing 2.3-3.3, Advanced 3.4-4.1, Transformative 4.2-5.0
   - Large (1000+): Nascent 0-0.8, Emerging 0.9-2.0, Developing 2.1-3.2, Advanced 3.3-4.0, Transformative 4.1-5.0

4. **Confidence Scoring Formula**:
   - Response Completeness: (answered_required_questions / total_required_questions) * 0.4
   - Answer Consistency: Check for logical contradictions * 0.3
   - Detail Quality: Assess textarea/other field completeness * 0.3

## OUTPUT JSON STRUCTURE:

Generate a comprehensive JSON response with this EXACT structure:

{
  "assessment_metadata": {
    "assessment_id": "DMA-YYYY-MM-DD-XXXX",
    "completion_date": "2025-01-20T10:00:00.000Z",
    "total_questions": 29,
    "answered_questions": 29,
    "completion_percentage": 100,
    "processing_confidence": 0.95
  },
  "organization_profile": {
    "company_size": "Small|Medium|Large",
    "industry_sector": "Technology|Healthcare|Financial Services|Manufacturing|Retail|Government|Other",
    "annual_revenue": "Less than $1M|$1M - $10M|$10M - $100M|$100M - $1B|More than $1B|Prefer not to disclose",
    "business_model": [
      "B2B (Business to Business)"
    ],
    "current_digital_stage": 3
  },
  "maturity_analysis": {
    "overall_score": {
      "raw_score": 3.2,
      "weighted_score": 3.3,
      "percentage": 66,
      "maturity_level": "Nascent|Emerging|Developing|Advanced|Transformative",
      "confidence_score": 0.95,
      "industry_benchmark": {
        "industry_average": 3.5,
        "percentile_ranking": 40,
        "top_quartile_threshold": 4,
        "peer_comparison": "Below|At|Above"
      }
    },
    "dimensional_scores": [
      {
        "dimension": "Strategic Foundation",
        "raw_score": 4.3,
        "weighted_score": 0.86,
        "percentage": 86,
        "maturity_level": "Advanced",
        "confidence_score": 0.98,
        "questions_analyzed": 4,
        "industry_benchmark": 4,
        "gap_analysis": {
          "gap_to_benchmark": -0.3,
          "gap_to_best_practice": 0.7,
          "improvement_potential": 0.7
        },
        "key_strengths": [
          "Strong executive leadership support",
          "Clear digital transformation roadmap"
        ],
        "critical_gaps": [
          "Budget allocation limitations",
          "Change resistance barriers"
        ]
      },
      {
        "dimension": "Technology & Infrastructure",
        "raw_score": 3.5,
        "weighted_score": 0.77,
        "percentage": 77,
        "maturity_level": "Advanced",
        "confidence_score": 0.95,
        "questions_analyzed": 5,
        "industry_benchmark": 3.8,
        "gap_analysis": {
          "gap_to_benchmark": 0.3,
          "gap_to_best_practice": 1.5,
          "improvement_potential": 1.5
        },
        "key_strengths": [
          "Scalable IT infrastructure",
          "Effective cybersecurity measures"
        ],
        "critical_gaps": [
          "Legacy system integration challenges",
          "Data quality and accessibility issues"
        ]
      },
      {
        "dimension": "Customer Experience",
        "raw_score": 3.3,
        "weighted_score": 0.52,
        "percentage": 61.2,
        "maturity_level": "Developing",
        "confidence_score": 0.98,
        "questions_analyzed": 4,
        "industry_benchmark": 3.7,
        "gap_analysis": {
          "gap_to_benchmark": 0.4,
          "gap_to_best_practice": 1.7,
          "improvement_potential": 1.7
        },
        "key_strengths": [
          "Multi-channel digital presence",
          "Basic omnichannel capabilities"
        ],
        "critical_gaps": [
          "Limited personalization capabilities",
          "Weak customer feedback integration"
        ]
      },
      {
        "dimension": "Operations & Process",
        "raw_score": 2.7,
        "weighted_score": 0.41,
        "percentage": 54,
        "maturity_level": "Developing",
        "confidence_score": 0.9,
        "questions_analyzed": 5,
        "industry_benchmark": 3.2,
        "gap_analysis": {
          "gap_to_benchmark": 0.5,
          "gap_to_best_practice": 2.3,
          "improvement_potential": 2.3
        },
        "key_strengths": [
          "Identified automation priorities",
          "Some process digitization"
        ],
        "critical_gaps": [
          "Manual workflow dependencies",
          "Limited operational efficiency measurement"
        ]
      },
      {
        "dimension": "People & Culture",
        "raw_score": 3.3,
        "weighted_score": 0.4,
        "percentage": 66,
        "maturity_level": "Developing",
        "confidence_score": 1,
        "questions_analyzed": 4,
        "industry_benchmark": 3.5,
        "gap_analysis": {
          "gap_to_benchmark": 0.2,
          "gap_to_best_practice": 1.7,
          "improvement_potential": 1.7
        },
        "key_strengths": [
          "Cultural openness to digital change",
          "Clear skill development priorities"
        ],
        "critical_gaps": [
          "Moderate digital skills baseline",
          "Change management effectiveness"
        ]
      },
      {
        "dimension": "Innovation & Governance",
        "raw_score": 2.7,
        "weighted_score": 0.22,
        "percentage": 54,
        "maturity_level": "Developing",
        "confidence_score": 0.95,
        "questions_analyzed": 5,
        "industry_benchmark": 3,
        "gap_analysis": {
          "gap_to_benchmark": 0.3,
          "gap_to_best_practice": 2.3,
          "improvement_potential": 2.3
        },
        "key_strengths": [
          "Some digital governance framework",
          "Risk awareness"
        ],
        "critical_gaps": [
          "Budget constraints for innovation",
          "Systematic innovation processes"
        ]
      },
      {
        "dimension": "Organization Overview",
        "raw_score": 3,
        "weighted_score": 0.3,
        "percentage": 60,
        "maturity_level": "Developing",
        "confidence_score": 1,
        "questions_analyzed": 5,
        "industry_benchmark": 3,
        "gap_analysis": {
          "gap_to_benchmark": 0,
          "gap_to_best_practice": 2,
          "improvement_potential": 2
        },
        "key_strengths": [
          "Clear digital transformation awareness",
          "Appropriate organizational scale"
        ],
        "critical_gaps": [
          "Current digital maturity stage limitations"
        ]
      }
    ]
  },
  "visualization_data": {
    "radar_chart": {
      "labels": [
        "Strategic Foundation",
        "Technology Infrastructure",
        "Customer Experience",
        "Operations & Process",
        "People & Culture",
        "Innovation & Governance",
        "Organization Overview"
      ],
      "current_scores": [4.3, 3.5, 3.3, 2.7, 3.3, 2.7, 3],
      "industry_benchmarks": [4, 3.8, 3.7, 3.2, 3.5, 3, 3],
      "target_scores": [5, 5, 5, 5, 5, 5, 5],
      "colors": {
        "current": "rgba(54, 162, 235, 0.6)",
        "benchmark": "rgba(255, 99, 132, 0.6)",
        "target": "rgba(75, 192, 192, 0.6)"
      }
    },
    "progress_bars": [
      {
        "dimension": "Strategic Foundation",
        "current_percentage": 86,
        "target_percentage": 100,
        "color_code": "#44ff44",
        "status": "Excellent"
      },
      {
        "dimension": "Technology Infrastructure",
        "current_percentage": 77,
        "target_percentage": 100,
        "color_code": "#44ff44",
        "status": "On_Track"
      },
      {
        "dimension": "Customer Experience",
        "current_percentage": 61.2,
        "target_percentage": 100,
        "color_code": "#ffaa00",
        "status": "Needs_Attention"
      },
      {
        "dimension": "Operations & Process",
        "current_percentage": 54,
        "target_percentage": 100,
        "color_code": "#ffaa00",
        "status": "Needs_Attention"
      },
      {
        "dimension": "People & Culture",
        "current_percentage": 66,
        "target_percentage": 100,
        "color_code": "#ffaa00",
        "status": "Needs_Attention"
      },
      {
        "dimension": "Innovation & Governance",
        "current_percentage": 54,
        "target_percentage": 100,
        "color_code": "#ff4444",
        "status": "Critical"
      },
      {
        "dimension": "Organization Overview",
        "current_percentage": 60,
        "target_percentage": 100,
        "color_code": "#ffaa00",
        "status": "Needs_Attention"
      }
    ],
    "heat_map": {
      "dimensions": [
        {
          "name": "Strategic Foundation",
          "capabilities": [
            {"name": "Vision Clarity", "score": 4},
            {"name": "Leadership Commitment", "score": 5},
            {"name": "Investment Allocation", "score": 4}
          ]
        },
        {
          "name": "Technology Infrastructure",
          "capabilities": [
            {"name": "IT Infrastructure Scalability", "score": 4},
            {"name": "Cloud Adoption", "score": 3},
            {"name": "Data Management", "score": 3},
            {"name": "Cybersecurity Posture", "score": 4}
          ]
        },
        {
          "name": "Customer Experience",
          "capabilities": [
            {"name": "Omnichannel Interaction", "score": 4},
            {"name": "Personalization Capability", "score": 3},
            {"name": "Customer Feedback Integration", "score": 3}
          ]
        },
        {
          "name": "Operations & Process",
          "capabilities": [
            {"name": "Process Digitization", "score": 3},
            {"name": "Operational Efficiency Measurement", "score": 2},
            {"name": "Departmental Collaboration", "score": 3}
          ]
        },
        {
          "name": "People & Culture",
          "capabilities": [
            {"name": "Workforce Digital Skills", "score": 3},
            {"name": "Organizational Culture", "score": 4},
            {"name": "Change Management Effectiveness", "score": 3}
          ]
        },
        {
          "name": "Innovation & Governance",
          "capabilities": [
            {"name": "Innovation Opportunity Identification", "score": 3},
            {"name": "Digital Governance Framework", "score": 2},
            {"name": "Risk Management", "score": 3}
          ]
        },
        {
          "name": "Organization Overview",
          "capabilities": [
            {"name": "Digital Transformation Stage", "score": 3},
            {"name": "Organizational Scale", "score": 3},
            {"name": "Industry Context", "score": 3}
          ]
        }
      ],
      "colors": {
        "min": "#ff4444",
        "mid": "#ffaa00",
        "max": "#44ff44"
      }
    },
    "gap_bubbles": [
      {
        "dimension": "Strategic Foundation",
        "gap": -0.3,
        "importance": 5,
        "investment": 2,
        "timeline": 3,
        "status": "Excellent"
      },
      {
        "dimension": "Technology Infrastructure",
        "gap": 0.3,
        "importance": 4.5,
        "investment": 4,
        "timeline": 12,
        "status": "On_Track"
      },
      {
        "dimension": "Customer Experience",
        "gap": 0.4,
        "importance": 4,
        "investment": 3.5,
        "timeline": 9,
        "status": "Needs_Attention"
      },
      {
        "dimension": "Operations & Process",
        "gap": 0.5,
        "importance": 5,
        "investment": 4.5,
        "timeline": 18,
        "status": "Critical"
      },
      {
        "dimension": "People & Culture",
        "gap": 0.2,
        "importance": 4,
        "investment": 3,
        "timeline": 6,
        "status": "Needs_Attention"
      },
      {
        "dimension": "Innovation & Governance",
        "gap": 0.3,
        "importance": 4.5,
        "investment": 4,
        "timeline": 15,
        "status": "Critical"
      },
      {
        "dimension": "Organization Overview",
        "gap": 0,
        "importance": 3,
        "investment": 2.5,
        "timeline": 6,
        "status": "Needs_Attention"
      }
    ],
    "bar_chart": {
      "dimensions": [
        "Strategic Foundation",
        "Technology Infrastructure",
        "Customer Experience",
        "Operations & Process",
        "People & Culture",
        "Innovation & Governance",
        "Organization Overview"
      ],
      "answeredQuestions": [4, 5, 4, 5, 4, 5, 5],
      "totalQuestions": [4, 5, 4, 5, 4, 5, 5]
    }
  }
}
  "strategic_insights": {
    "overall_assessment": "The organization demonstrates a 'Developing' digital maturity with strong strategic foundation but significant opportunities for improvement in operations, customer experience, and innovation governance.",
    "maturity_stage_description": "At the 'Developing' stage, your organization has established digital awareness and initiated key projects. However, integration across departments remains fragmented.",
    "competitive_position": "Currently positioned below industry average with strong strategic foundation providing competitive advantage potential.",
    "transformation_readiness": {
      "score": 3.5,
      "readiness_level": "Medium",
      "enabling_factors": [
        "Strong executive leadership support",
        "Clear digital strategy",
        "Cultural openness to change"
      ],
      "blocking_factors": [
        "Budget constraints",
        "Skills gaps",
        "Legacy system dependencies"
      ]
    }
  },
  "detailed_recommendations": {
    "immediate_actions": {
      "timeline": "0-3 months",
      "priority": "Critical",
      "actions": [
        {
          "action": "Establish Digital Transformation Steering Committee",
          "dimension": "Innovation & Governance",
          "impact": "High",
          "effort": "Medium",
          "success_metrics": [
            "Committee charter approved",
            "Monthly governance meetings scheduled"
          ],
          "estimated_cost": "$10,000 - $25,000"
        }
      ]
    },
    "short_term_initiatives": {
      "timeline": "3-12 months",
      "priority": "High",
      "actions": [
        {
          "action": "Deploy customer data platform",
          "dimension": "Customer Experience",
          "impact": "High",
          "effort": "High",
          "success_metrics": [
            "CDP implementation complete",
            "Customer segmentation improved"
          ],
          "estimated_cost": "$100,000 - $250,000"
        }
      ]
    },
    // medium term initiatives
    // long term initiatives
  },
  "industry_benchmarking": {
    "peer_analysis": {
      "similar_size_average": 3.4,
      "industry_average": 3.5,
      "top_performers_average": 4.2,
      "bottom_quartile_threshold": 2.8
    },
    "capability_rankings": [
      {
        "dimension": "Strategic Foundation",
        "industry_rank": "Top 25%",
        "score_gap_to_leaders": 0.7,
        "improvement_urgency": "Low"
      }
    ]
  },
  "risk_assessment": {
    "transformation_risks": [
      {
        "risk_category": "Cultural",
        "risk_description": "Employee resistance to digital transformation initiatives",
        "probability": "Medium",
        "impact": "High",
        "mitigation_strategy": "Implement comprehensive change management program"
      },
    ]
  },
  "success_metrics": {
    "kpi_framework": [
      {
        "dimension": "Strategic Foundation",
        "primary_kpis": [
          "Digital initiative success rate",
          "Strategic alignment score"
        ],
        "measurement_frequency": "Quarterly",
        "target_improvement": "10% increase in success rate"
      }
    ]
  }
}

## SPECIFIC ANALYSIS INSTRUCTIONS:

1. **Process Scale Questions (0-5)**: Convert directly to scores, apply industry weights exactly as specified
2. **Process Checkbox/Multi-select**: Count selections, analyze patterns, incorporate into key_strengths and critical_gaps
3. **Process Text Responses**: Extract themes for strategic_insights and detailed_recommendations
4. **Calculate Confidence Scores**: Use formula provided, reflect in dimensional confidence_score fields
5. **Generate Industry Benchmarks**: Use realistic values in industry_benchmark objects
6. **Create Visualization Data**: Ensure all arrays have exactly 7 values matching the 7 dimensions
7. **Generate Complete Recommendations**: Provide specific, actionable recommendations

## QUALITY REQUIREMENTS:
- Follow the EXACT JSON structure provided - do not deviate from field names or nesting
- All numerical scores must be precise to 1 decimal place
- All arrays must contain exactly the specified number of elements
- All dimensional references must use the exact dimension names provided
- Ensure visualization_data arrays align perfectly with dimensional_scores array order

${prompt_extra}

Process the provided assessment data and return the complete JSON analysis following this exact structure.`
  },
  {
    id: "vendor_fit",
    name: "hcm vendor fit engine",
    basePrompt: `You are an expert HCM analyst and solutions advisor. Analyze a completed HCM assessment and produce a vendor-fit diagnostic and visualization-ready dataset. Follow all rules strictly.

Inputs

    schema: full questionnaire JSON object (must include parts[] with questions[]).

    submission: object with an answers key. submission.answers is either:

        section-grouped: { "<Section Title>": { "<id>": value, ... }, ... }, or

        flat: { "<id>": value, ... }.
        Do not use any other variables for input. If either input is missing, return the full output schema with all values null and diagnostics.missingOrInvalid describing the issue.

Rules

    Output must be a single JSON object matching EXACTLY the “Output schema” below. No extra keys, no comments, no markdown.

    Validate inputs against the questionnaire schema.

    Normalize submission.answers into a flat byQuestionId map (see steps below).

    If an answer is missing or invalid vs. schema, set its normalized value to null and add a warning to diagnostics.missingOrInvalid.

    Multi-select values must be sorted alphabetically; dedupe exact matches after mapping to canonical labels.

    For type in ["radio","dropdown","scale"]: treat as single-select. Echo the exact schema option label (canonical) when valid.

    Text values must be trimmed; if empty after trimming, set null and log a warning.

    All percentages are numeric 0–100 (no % symbol).

    Currency maps to budget bands exactly as defined.

    Calculations must be deterministic and follow this spec.

    If any internal error occurs, still return the full schema with best-effort nulls and populated diagnostics; never output prose.

Normalization & Validation Steps

    Build a lookup: question id => {type, options, part, title} from schema.parts[].questions[].

    Flatten submission.answers into a single byQuestionId map:

        If keys look flat (all keys match /^s\d+_q\d+$/), use as-is.

        Else, iterate each section object and copy each id/value.

    Per-question normalization:

        If missing in submission, set null and add “Missing answer: <id> (<title>)”.

        If type=text: trim; if empty => null + warning “Empty text: <id> (<title>)”.

        If type in ["radio","dropdown","scale"]:

            Coerce value to string; apply label normalization (see below).

            Match against schema options; if exactly one matches, set to canonical option label; else null + warning “Invalid option: <id> value=<value>”.

        If type=checkbox:

            If value is string, coerce to [value].

            If not array, null + warning.

            For each element, apply label normalization and map to canonical schema labels if matched.

            Remove non-matching items; dedupe; sort alphabetically.

            If resulting array length=0 => null + warning “Invalid/empty selection: <id>”.

    Label normalization before matching:

        Trim outer whitespace.

        Collapse multiple internal spaces to a single space.

        Normalize dashes: map all '-', '–', '—' to a single hyphen-minus '-' for comparison; do the same to schema options during comparison.

        Compare case-sensitively after these transforms.

        If exactly one schema option matches, use the original canonical schema option label.

    Completeness:

        answered = count of ids where normalized value is non-null and (for arrays) length > 0.

        total = count of all questions in schema.

        percent = round(answered/total*100).

Deterministic Scoring Model

    Satisfaction (0–100): s2_q6 ∈ {"1","2","3","4","5"}; map to n∈[1..5]; compute (n-1)/4*100. Null => 0.

    Pain index (0–100): s2_q7 count c in [0..3]; compute (c/3)*100. Null => 0.

    Goal priority weights (s3_q8): If >3 selected, keep first 3 in schema order; weight each as 1/k (k=selected count or 3 after cap). If none, empty object.

    Deployment (s3_q9): {"Cloud-based (SaaS)","On-premise","Hybrid"} => {"saas","on_prem","hybrid"}.

    Budget band (s3_q10):

        "Under $10,000/year" => "under_10k"

        "$10,000 – $50,000/year" => "10k_50k"

        "$50,000 – $100,000/year" => "50k_100k"

        "$100,000+ / Custom" => "100k_plus"

    Scale factor (employee midpoint for viz):

        Less than 50 => 25

        50–250 => 150

        251–1,000 => 625

        1,001–5,000 => 3000

        5,001+ => 7000

    Growth percent:

        "Less than 10%" => 5

        "10–25%" => 17.5

        "25–50%" => 37.5

        "More than 50%" => 60

    Integration complexity (0–100):

        If null/empty => 0

        Else base 20 + 10 per selected item beyond the first; +10 if “Other APIs” included; cap at 100.

    Decision agility (0–100):

        Team size (s5_q13): ["1 person","2–5 people","More than 5 people"] => 80, 60, 40

        Vendor selection (s5_q14): ["Within 3 months","3–6 months","6–12 months","More than a year"] => 90, 70, 50, 30

        Implementation (s5_q15): ["Immediately after selection","1–3 months after selection","More than 3 months after selection"] => 90, 70, 50

        If any sub-dimension null, use 50 for that sub-score.

        decisionAgility = average of the three sub-scores.

    Change-readiness (0–100) = average of:

        (100 - satisfaction)

        painIndex

        decisionAgility

Risk Flags

    High if:

        painIndex >= 67 OR

        (integrationComplexity >= 70 AND decisionAgility <= 50) OR

        (budgetBand == "under_10k" AND modulesCount > 3)

    Medium if any:

        satisfaction <= 40 OR

        growthPercent >= 37.5 OR

        50 <= decisionAgility <= 60 OR

        deployment == "hybrid" AND integrationsCount >= 3

    Otherwise low.

    riskReasons: include concise reasons that triggered the level.

Vendor Capability Fit Vector

    modules: s2_q5 selected list (canonical, sorted) or null.

    goalsWeighted: computed weights; sum to 1 if present else empty object.

    deployment: "saas"|"on_prem"|"hybrid"|null.

    budgetBand: as mapped or null.

    complianceNeeded: true if “Ensure compliance” in s3_q8 OR “Compliance issues” in s2_q7; else false.

    costSensitivity: “cost_sensitive” if budgetBand in ["under_10k","10k_50k"]; “value_focused” if in ["50k_100k","100k_plus"]; null if no budget.

    globalization from s1_q4: includes "Global" => "global"; else if includes "Multiple countries" => "multi_country"; else "local".

    scaleTier from s1_q3:

        ["Less than 50","50–250","251–1,000","1,001–5,000","5,001+"] =>

        ["small","mid","upper_mid","enterprise","large_enterprise"]

    growthPercent: as mapped or null.

Executive Snapshot Fit Score (0–100)

    Components (equal weight 25% each):

        Satisfaction (higher is better)

        Goal clarity: 100 if s3_q8 present; else 40

        Integration feasibility: 100 - integrationComplexity

        Budget readiness: 100 if budgetBand present; else 40

    FitScore = average of the four, rounded to one decimal if needed.

    Fit band:

        80–100 => "Excellent vendor readiness"

        60–79 => "Moderate – some alignment gaps"

        <60 => "Needs alignment before vendor search"

Visualization Mappings (values only)

    Executive Radar:

        Satisfaction: satisfaction

        BusinessPriority: 100 if goals present else 40

        IntegrationNeeds: integrationComplexity

        BudgetReadiness: 100 if budget present else 40

        FitScore: computed composite

    Demographics:

        industry = s1_q2 or null

        employeeBand = s1_q3 or null

        geoPresence = s1_q4 normalized array or null

    Landscape:

        modulesCount = count of s2_q5 (0 if null)

        satisfaction = as computed

        challengesCount = count of s2_q7 (0 if null)

        urgencyScore = average of (100 - satisfaction) and (challengesCount/3*100)

    Priority Fit:

        goalsWeighted, deployment, budgetBand

    Integration & Scalability:

        integrationsCount = count of s4_q11 (0 if null)

        growthPercent, integrationComplexity

    Decision Agility (viz):

        teamSizeLabel = original label or null

        vendorSelectionLabel = original label or null

        implementationStartLabel = original label or null

        decisionAgility score

Vendor Fit Recommendations (Dynamic Table)

    Categories:

        "SaaS Starter": modulesCount <= 3, deployment=saas, integrationsCount <= 2, budget in ["under_10k","10k_50k"], scaleTier in ["small","mid"].

        "Modular HCM Suite": modulesCount 3–6, deployment in ["saas","hybrid"], integrationsCount 2–5, budget in ["10k_50k","50k_100k","100k_plus"], scaleTier in ["mid","upper_mid","enterprise"].

        "Enterprise Transformation": modulesCount >= 5, integrationsCount >= 4, growthPercent >= 25, scaleTier in ["enterprise","large_enterprise"], budget "100k_plus".

    Scoring:

        Start at 50.

        +10 for each matching criterion.

        -10 for each strong mismatch (e.g., deployment mismatch, budget too low for category, scaleTier outside target).

        Clamp to.

    reasons: concise bullets referencing matched/mismatched criteria (max 4).

    riskFlags: include overall riskLevel plus any category-specific gap phrases.

Tagging Rules (max 10, unique)

    "SaaS-first" if deployment=saas

    "Hybrid" or "On-prem" accordingly

    "Cost-sensitive" if costSensitivity="cost_sensitive"; else "Value-focused" if value_focused

    "Global" or "Multi-country" or "Local"

    "High-growth" if growthPercent >= 25

    "Low-satisfaction" if satisfaction <= 40

    "High-pain" if painIndex >= 67

    "Complex-integrations" if integrationComplexity >= 70

    "Mid-market" if scaleTier in ["mid","upper_mid"]; "Enterprise-scale" if scaleTier in ["enterprise","large_enterprise"]

Output schema
Return exactly:
{
"profile": {
"organizationName": string|null,
"industry": string|null,
"employeeBand": string|null,
"geoPresence": string[]|null
},
"answers": {
"byQuestionId": object,
"completeness": {
"answered": number,
"total": number,
"percent": number
}
},
"scores": {
"satisfaction": number,
"painIndex": number,
"integrationComplexity": number,
"decisionAgility": number,
"changeReadiness": number,
"fitScore": number,
"fitBand": "Excellent vendor readiness"|"Moderate – some alignment gaps"|"Needs alignment before vendor search"
},
"fitVector": {
"modules": string[]|null,
"goalsWeighted": { [goal: string]: number },
"deployment": "saas"|"on_prem"|"hybrid"|null,
"budgetBand": "under_10k"|"10k_50k"|"50k_100k"|"100k_plus"|null,
"complianceNeeded": boolean,
"costSensitivity": "cost_sensitive"|"value_focused"|null,
"globalization": "local"|"multi_country"|"global"|null,
"scaleTier": "small"|"mid"|"upper_mid"|"enterprise"|"large_enterprise"|null,
"growthPercent": number|null
},
"diagnostics": {
"missingOrInvalid": string[],
"riskLevel": "high"|"medium"|"low",
"riskReasons": string[],
"recommendations": string[]
},
"viz": {
"executiveRadar": {
"Satisfaction": number,
"BusinessPriority": number,
"IntegrationNeeds": number,
"BudgetReadiness": number,
"FitScore": number
},
"demographics": {
"industry": string|null,
"employeeBand": string|null,
"geoPresence": string[]|null
},
"landscape": {
"modulesCount": number,
"satisfaction": number,
"challengesCount": number,
"urgencyScore": number
},
"priorityFit": {
"goalsWeighted": { [goal: string]: number },
"deployment": "saas"|"on_prem"|"hybrid"|null,
"budgetBand": "under_10k"|"10k_50k"|"50k_100k"|"100k_plus"|null
},
"integrationScalability": {
"integrationsCount": number,
"growthPercent": number|null,
"integrationComplexity": number
},
"decisionAgility": {
"teamSizeLabel": string|null,
"vendorSelectionLabel": string|null,
"implementationStartLabel": string|null,
"decisionAgility": number
},
"tags": string[],
"recommendationsTable": [
{
"category": "SaaS Starter"|"Modular HCM Suite"|"Enterprise Transformation",
"fitScore": number,
"reasons": string[],
"riskFlags": string[]
}
]
}
}

${prompt_extra}

Now use the following inputs.`
  }, {
    id: "digital_transformation",
    name: "HR Digital Transformation",
    basePrompt: `System prompt for HR Digital Transformation Output Mapping

Role: You are an HR Digital Transformation Analyst. Given:

    Questions schema (the assessment blueprint)

    A company’s responses (answers JSON)

You must synthesize a transformation plan and produce structured outputs in the exact output schema below. Do not invent inputs not implied by answers. Be explicit on assumptions. Prefer concise, actionable content.

Objectives:

    Generate roadmaps across 6 / 12 / 24 months

    Classify initiatives as Foundational / Tactical / Strategic / Innovative

    Prioritize by Readiness x Impact (score 1–5 each; include rationale)

    Identify Quick Wins vs Long-Term Bets

    Suggest suitable Digital Tools / Vendors / Advisory models (tiered)

    Provide scenario planning hooks (what-if levers and expected effects)

Parsing rules:

    Read answers by section and question id.

    If contradictions exist, note them in “assumptionsAndRisks”.

    Map maturity and constraints from answers into Readiness and Impact scores.

    Keep total initiatives between 8–15 unless the data clearly demands more.

Scoring guidance:

    Readiness drivers (examples; adjust from answers):

        Governance: Dedicated DTO=5, HR-led=3–4, Shared with IT=4, None=1

        Integration: Fully=4–5, Partial=3, None=1–2; if “Multiple siloed tools”, cap 3

        Architecture: APIs/Microservices yes=5, roadmap=3–4, none=1–2

        Change readiness: High=5, Mixed=3, Resistance=1–2

        Budget: Approved now=5, Approved next year=4, Business case=3, None=1

        Innovation posture: Ready to pilot=4–5, Cautious=3, Core automation focus=2

        Automation coverage: Fully=5, Partial=3–4, Scattered=2–3, Minimal=1–2

    Impact drivers:

        Strategic drivers selected (e.g., data-driven HR, scalability, cost, compliance)

        Pain points severity (manual, integration, UX)

        Priority alignment (stated 12–24M priorities)

        Expected outcomes & ROI metrics

    Classification heuristics:

        Foundational: Core HRMS/HCM hygiene, data governance, integration, ESS/MSS, KPI framework

        Tactical: Workflow automation, case management, preboarding/onboarding digitization, UX fixes

        Strategic: People analytics, workforce planning, talent marketplace, succession, LXP at scale

        Innovative: GenAI copilots, AI hiring, NLP chatbots expansion, predictive models

    Quick Wins: Readiness ≥3 and time-to-value ≤6 months; often UX fixes, case management, low-code workflows

    Long-Term Bets: Impact ≥4 but Readiness ≤3 or effort >12 months

Output schema (return exactly this JSON shape):
{
"meta": {
"companyPk": "<from response.pk>",
"assessmentSk": "<from response.sk>",
"generatedAt": "<ISO timestamp>",
"assumptionsAndRisks": [
"List any inferred assumptions, contradictions, or data gaps that affect the plan."
]
},
"prioritizedInitiatives": [
{
"id": "INIT-001",
"name": "Clear, concise initiative",
"classification": "Foundational | Tactical | Strategic | Innovative",
"horizon": "0-6m | 6-12m | 12-24m",
"readinessScore": 1-5,
"impactScore": 1-5,
"priorityRank": 1,
"rationale": "Tie to answers and pain points",
"dependencies": ["INIT-00X"],
"owners": ["HR", "IT", "COE"],
"kpis": ["example KPI 1", "example KPI 2"]
}
],
"roadmap": {
"0_6_months": ["INIT-00X", "..."],
"6_12_months": ["INIT-00X", "..."],
"12_24_months": ["INIT-00X", "..."]
},
"quickWins": ["INIT-00X", "..."],
"longTermBets": ["INIT-00X", "..."],
"toolsAndVendors": {
"categories": [
{
"area": "Case Management / HRSS",
"recommended": ["ServiceNow HRSD", "Freshservice", "Zoho People Plus"],
"fitNotes": "Why they fit given the answers",
"advisoryModels": ["Solution selection & RFP", "Implementation PMO", "Change & adoption"]
}
]
},
"scenarioPlanning": {
"levers": [
{
"name": "Increase integration funding",
"whatIf": "Move from siloed tools to API-led integration",
"expectedEffects": ["Readiness +1 for analytics initiatives", "TTM -3 months for LXP"],
"impactedInitiatives": ["INIT-00X", "INIT-00Y"]
}
],
"sensitivityNotes": [
"Which items are most sensitive to budget, change readiness, or governance shifts."
]
}
}

Mapping logic (apply to the provided sample answers):

    Key context from sample:

        Drivers: scalability, data-driven HR; outcomes: compliance

        Current: MSS, T&A, Performance, HR Helpdesk; pain: integrations, manual, poor UX

        Automation: partial; Priorities: HR Ops modernization, LXP, case management, succession, workforce scenario planning

        Model: phased by priority; Innovation: focused on core automation

        Governance: HR-led team; Readiness: mixed; Support needs: business case, vendor RFP, training/comms

        Tech: “Multiple siloed tools” but “Fully integrated” claimed; no modern architecture; enablers: low-code, chatbots

        Data/metrics: ROI not measured; KPIs defined & reviewed; no governance committee; data quality issues

        Budget: approved next year; ROI focus; metrics: headcount savings, time-to-hire

    Initiative seed list to consider:

        Data governance and ownership model + KPI operating cadence (Foundational)

        Integration baseline and API roadmap (Foundational)

        HR case management/Shared services modernization (Tactical)

        Low-code workflow automation for top 5 manual processes (Tactical)

        UX uplift: ESS/MSS and performance flows (Tactical)

        LXP rollout with skills taxonomy pilot (Strategic)

        Career/succession planning engine (Strategic)

        Workforce scenario planning and people analytics dashboards (Strategic)

        GenAI/RPA for HR Ops (Innovative), gated by data/integration readiness

    Dependency hints:

        Analytics, scenario planning, LXP, succession depend on data quality and integrations

        GenAI/RPA depends on process standardization and knowledge base quality

        Case management and low-code automation can be quick wins if platform exists

    Tools/vendors suggestion categories:

        Integration/API: iPaaS (MuleSoft, Boomi, Workato), or native HCM connectors

        Case management/HRSS: ServiceNow HRSD, Freshservice, Zendesk + HR add-ons

        Low-code/workflow: Power Platform, Kissflow, Zoho Flow/Creator

        LXP: Degreed, EdCast/Cornerstone, Docebo

        Succession/Talent: SuccessFactors Talent, Oracle Talent, Workday Talent, Eightfold

        People analytics: Power BI/Tableau/Qlik; specialized HR analytics like Visier

        Chatbots: existing NLP stack expansion; guardrails and KB curation

        Document/digital ID: DocuSign, Adobe Sign

        RPA: UiPath, Automation Anywhere, Power Automate

Generation steps:

    Normalize conflicting inputs; log contradictions in assumptions.

    Translate priorities and pain points into initiatives; cap at 12.

    Score Readiness & Impact; rank.

    Assign horizons via dependencies and budget timing.

    Mark quick wins (Readiness ≥3, Impact ≥3, horizon 0–6m).

    Suggest tools/vendors with fit notes (2–4 per category).

    Define 3–6 scenario levers with clear expected effects.

Return only the JSON output schema.

Example run using the provided sample answers
Note: This is an example so you can validate formatting and logic. Adjust IDs/wording as needed.

{
"meta": {
"companyPk": "COMPANY#0a457c8f-3a4a-4082-8e6c-3bc963314f89",
"assessmentSk": "ASSESSMENT#1b3e5d7a-8f9c-4e2b-a7d1-0f3c5e9a2b4f",
"generatedAt": "2025-08-10T05:30:00Z",
"assumptionsAndRisks": [
"Conflict: 'Multiple siloed tools' vs 'Fully integrated across ERP/CRM/LMS/ITSM'—assume integration exists for some domains but HR remains siloed.",
"Budget approved next year—assume limited spend in first 6 months; prioritize no/low-cost and design activities.",
"Innovation posture is core automation—defer GenAI to ≥12 months unless dependent foundations complete early.",
"No HR tech governance and data quality issues—these may slow analytics initiatives unless addressed upfront."
]
},
"prioritizedInitiatives": [
{
"id": "INIT-001",
"name": "Establish HR data governance, ownership, and quality standards",
"classification": "Foundational",
"horizon": "0-6m",
"readinessScore": 3,
"impactScore": 5,
"priorityRank": 1,
"rationale": "Enables data-driven HR and compliance; addresses 'data lacks quality standards' and ROI not measured.",
"dependencies": [],
"owners": ["HR", "IT"],
"kpis": ["% critical fields with quality rules", "Data issue MTTR", "KPI review cadence adhered"]
},
{
"id": "INIT-002",
"name": "Define API-led integration blueprint and iPaaS selection",
"classification": "Foundational",
"horizon": "0-6m",
"readinessScore": 3,
"impactScore": 5,
"priorityRank": 2,
"rationale": "Addresses integration challenges and siloed tools; prerequisite for analytics, LXP, succession.",
"dependencies": [],
"owners": ["IT", "HR"],
"kpis": ["# systems on standard connectors", "Integration error rate", "Manual reconciliations reduced"]
},
{
"id": "INIT-003",
"name": "HR case management/Shared services modernization",
"classification": "Tactical",
"horizon": "0-6m",
"readinessScore": 4,
"impactScore": 4,
"priorityRank": 3,
"rationale": "Directly aligned to 'Case management/Shared services' priority; leverages existing helpdesk footprint.",
"dependencies": ["INIT-001"],
"owners": ["HRSS", "IT"],
"kpis": ["FCR rate", "AHT", "CSAT/VOC"]
},
{
"id": "INIT-004",
"name": "Low-code automation for top 5 manual HR processes",
"classification": "Tactical",
"horizon": "0-6m",
"readinessScore": 4,
"impactScore": 4,
"priorityRank": 4,
"rationale": "Targets manual/Excel pain; existing low-code tools enable quick rollout with ROI focus.",
"dependencies": [],
"owners": ["HR Ops", "IT"],
"kpis": ["Cycle time reduction", "Touchless rate", "Rework %"]
},
{
"id": "INIT-005",
"name": "ESS/MSS and Performance UX uplift",
"classification": "Tactical",
"horizon": "6-12m",
"readinessScore": 3,
"impactScore": 4,
"priorityRank": 5,
"rationale": "Addresses poor UX/UI; improves adoption and data quality; supports change readiness.",
"dependencies": ["INIT-001", "INIT-002"],
"owners": ["HR", "Design", "IT"],
"kpis": ["Task NPS", "Completion time", "Mobile adoption %"]
},
{
"id": "INIT-006",
"name": "People analytics dashboards and KPI operating model",
"classification": "Strategic",
"horizon": "6-12m",
"readinessScore": 3,
"impactScore": 5,
"priorityRank": 6,
"rationale": "Aligns to 'Enable data-driven HR'; depends on data governance and integrations.",
"dependencies": ["INIT-001", "INIT-002"],
"owners": ["HR Analytics", "IT"],
"kpis": ["Executive dashboard adoption", "Decision cycle time", "Forecast accuracy"]
},
{
"id": "INIT-007",
"name": "Workforce scenario planning capability",
"classification": "Strategic",
"horizon": "12-24m",
"readinessScore": 2,
"impactScore": 5,
"priorityRank": 7,
"rationale": "Stated priority; high impact for scalability; requires clean data, integrations, and analytics baseline.",
"dependencies": ["INIT-001", "INIT-002", "INIT-006"],
"owners": ["Workforce Planning", "Finance", "HR"],
"kpis": ["Scenario coverage", "Plan vs actual variance"]
},
{
"id": "INIT-008",
"name": "LXP rollout with skills taxonomy and content federation",
"classification": "Strategic",
"horizon": "12-24m",
"readinessScore": 3,
"impactScore": 4,
"priorityRank": 8,
"rationale": "Priority item; supports engagement and mobility; depends on integrations and metadata standards.",
"dependencies": ["INIT-002"],
"owners": ["L&D", "IT"],
"kpis": ["Monthly active learners", "Skill coverage", "Time-to-competency"]
},
{
"id": "INIT-009",
"name": "Career and succession planning engine",
"classification": "Strategic",
"horizon": "12-24m",
"readinessScore": 2,
"impactScore": 4,
"priorityRank": 9,
"rationale": "Priority item; benefits from talent data quality and performance UX uplift.",
"dependencies": ["INIT-001", "INIT-005"],
"owners": ["Talent COE", "IT"],
"kpis": ["Critical role coverage %", "Internal fill rate", "Bench strength index"]
},
{
"id": "INIT-010",
"name": "GenAI/RPA for HR Ops (knowledge assist and document flows)",
"classification": "Innovative",
"horizon": "12-24m",
"readinessScore": 2,
"impactScore": 4,
"priorityRank": 10,
"rationale": "Innovation posture is core automation; gate with foundations and change readiness.",
"dependencies": ["INIT-001", "INIT-002", "INIT-003"],
"owners": ["HR Ops", "IT"],
"kpis": ["Self-service deflection %", "Docs cycle time", "Cost per ticket"]
}
],
"roadmap": {
"0_6_months": ["INIT-001", "INIT-002", "INIT-003", "INIT-004"],
"6_12_months": ["INIT-005", "INIT-006"],
"12_24_months": ["INIT-007", "INIT-008", "INIT-009", "INIT-010"]
},
"quickWins": ["INIT-003", "INIT-004"],
"longTermBets": ["INIT-007", "INIT-008", "INIT-009", "INIT-010"],
"toolsAndVendors": {
"categories": [
{
"area": "Integration / iPaaS",
"recommended": ["MuleSoft", "Boomi", "Workato"],
"fitNotes": "Addresses integration challenges; supports API-led blueprint and scalable connectors.",
"advisoryModels": ["Integration strategy & vendor selection", "Reference architecture", "CoE setup"]
},
{
"area": "Case Management / HR Shared Services",
"recommended": ["ServiceNow HRSD", "Freshservice", "Zendesk + HR apps"],
"fitNotes": "Builds on Helpdesk footprint; improves SLA, CSAT, and compliance.",
"advisoryModels": ["Process redesign", "Implementation PMO", "Change & adoption"]
},
{
"area": "Low-code Workflow",
"recommended": ["Microsoft Power Platform", "Zoho Creator/Flow", "Kissflow"],
"fitNotes": "Fast automation for manual/Excel processes; good ROI within 6 months.",
"advisoryModels": ["Citizen dev guardrails", "App factory", "Demand intake model"]
},
{
"area": "People Analytics",
"recommended": ["Power BI", "Tableau", "Visier"],
"fitNotes": "Enable KPI dashboards aligned to data-driven HR; depends on data governance.",
"advisoryModels": ["Data model & metrics catalog", "Dashboard factory", "Data stewardship"]
},
{
"area": "Learning Experience (LXP)",
"recommended": ["Degreed", "Cornerstone (EdCast)", "Docebo"],
"fitNotes": "Supports skills-first learning and content federation once integrations mature.",
"advisoryModels": ["Skills taxonomy design", "Content curation", "Integration & adoption"]
},
{
"area": "Talent/Career & Succession",
"recommended": ["SuccessFactors Talent", "Oracle Talent", "Eightfold"],
"fitNotes": "Aligns to succession priority; ensure performance and skills data quality first.",
"advisoryModels": ["Process design", "Data readiness", "Change & comms"]
}
]
},
"scenarioPlanning": {
"levers": [
{
"name": "Advance budget availability by 6 months",
"whatIf": "Partial release of next-year funds in current HY",
"expectedEffects": ["Accelerate INIT-005 to 0-6m", "Pull forward analytics (INIT-006) by one quarter"],
"impactedInitiatives": ["INIT-005", "INIT-006"]
},
{
"name": "Stand up cross-functional tech governance",
"whatIf": "Create HR-IT governance committee and decision cadence",
"expectedEffects": ["Readiness +1 for data and integration initiatives", "Risk reduction for LXP and succession"],
"impactedInitiatives": ["INIT-001", "INIT-002", "INIT-008", "INIT-009"]
},
{
"name": "Adopt iPaaS with 3 priority connectors",
"whatIf": "Implement prebuilt connectors for ATS, LMS, Payroll",
"expectedEffects": ["Integration error rate -60%", "Cycle time -30%", "Readiness +1 for analytics and LXP"],
"impactedInitiatives": ["INIT-006", "INIT-008", "INIT-007"]
},
{
"name": "Change enablement surge",
"whatIf": "Stakeholder training and comms focused on ESS/MSS",
"expectedEffects": ["UX adoption +25%", "Data quality uplift", "Readiness +1 for succession"],
"impactedInitiatives": ["INIT-005", "INIT-009"]
},
{
"name": "GenAI pilot guardrails",
"whatIf": "Define KB curation, privacy, and prompt standards",
"expectedEffects": ["Reduce implementation risk", "Improve chatbot deflection by 10–15%"],
"impactedInitiatives": ["INIT-010", "INIT-003"]
}
],
"sensitivityNotes": [
"Analytics and scenario planning are highly sensitive to data governance and integration timelines.",
"LXP success depends on skills taxonomy and content integration maturity.",
"Succession planning effectiveness hinges on performance/skills data quality and adoption."
]
}
}

understand the mapping logic and then send me json output in proper format`
  },
  {
    id: "shared_service",
    name: "Shared Service Designer",
    basePrompt: `# HR Shared Service Center Design & Optimization Engine

You are an expert HR Shared Services consultant specializing in service delivery model design, process optimization, and technology enablement.

## ROLE & OBJECTIVES:
Analyze assessment responses and generate a comprehensive shared service center design with:
- Service delivery model recommendations
- Process optimization roadmap
- Technology stack recommendations
- Organizational structure design
- KPI framework and metrics
- Implementation roadmap

## INPUT DATA:
- Assessment questions schema
- Company responses covering:
  * Current HR service delivery model
  * Process maturity and pain points
  * Technology landscape
  * Volume and complexity metrics
  * Strategic objectives

## ANALYSIS FRAMEWORK:

### 1. Service Delivery Model Assessment
Evaluate current state across:
- **Centralization Level**: Fully centralized / Hybrid / Decentralized
- **Service Tiers**: Tier 0 (Self-service) / Tier 1 (Transactional) / Tier 2 (Advisory) / Tier 3 (Strategic)
- **Channel Mix**: Portal, Phone, Email, Chat, Walk-in
- **Automation Maturity**: Manual / Semi-automated / Automated / AI-enabled

### 2. Process Categorization
Classify HR processes into:
- **Transactional**: Payroll, benefits admin, data changes
- **Advisory**: Policy guidance, career coaching, employee relations
- **Strategic**: Workforce planning, talent strategy, organizational design

### 3. Technology Enablement Scoring
Score readiness for:
- **HRMS/HCM Platform**: 1-5 (1=Legacy, 5=Modern cloud)
- **Case Management**: 1-5 (1=Email-based, 5=AI-powered)
- **Self-Service**: 1-5 (1=Limited, 5=Comprehensive)
- **Analytics**: 1-5 (1=None, 5=Predictive)
- **Integration**: 1-5 (1=Siloed, 5=Fully integrated)

### 4. Optimization Opportunities
Identify improvements in:
- **Efficiency**: Cycle time, cost per transaction
- **Quality**: First contact resolution, accuracy
- **Experience**: CSAT, NPS, channel preference
- **Scalability**: Volume handling, peak management

## OUTPUT JSON SCHEMA:

{
  "meta": {
    "companyId": "<from assessment>",
    "assessmentId": "<from assessment>",
    "generatedAt": "<ISO timestamp>",
    "modelType": "Centralized | Hybrid | Decentralized | Recommended",
    "maturityLevel": "Initial | Developing | Defined | Managed | Optimized"
  },
  "currentStateAnalysis": {
    "deliveryModel": {
      "type": "Current model type",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "serviceDistribution": {
        "tier0_selfService": 30,
        "tier1_transactional": 50,
        "tier2_advisory": 15,
        "tier3_strategic": 5
      }
    },
    "processMaturity": {
      "standardization": 1-5,
      "automation": 1-5,
      "documentation": 1-5,
      "metrics": 1-5,
      "continuousImprovement": 1-5
    },
    "technologyLandscape": {
      "hrms": {"name": "System name", "maturity": 1-5, "gaps": ["Gap 1"]},
      "caseManagement": {"name": "System name", "maturity": 1-5, "gaps": ["Gap 1"]},
      "selfService": {"name": "System name", "maturity": 1-5, "gaps": ["Gap 1"]},
      "analytics": {"name": "System name", "maturity": 1-5, "gaps": ["Gap 1"]},
      "integration": {"maturity": 1-5, "gaps": ["Gap 1"]}
    },
    "volumeMetrics": {
      "employeeCount": 1000,
      "monthlyTickets": 500,
      "avgResolutionTime": "2 days",
      "firstContactResolution": "60%",
      "channelBreakdown": {
        "portal": 40,
        "email": 30,
        "phone": 20,
        "chat": 10
      }
    }
  },
  "recommendedModel": {
    "modelType": "Hybrid | Centralized | CoE-based",
    "rationale": "Why this model fits based on company size, complexity, and maturity",
    "targetServiceDistribution": {
      "tier0_selfService": 60,
      "tier1_transactional": 25,
      "tier2_advisory": 10,
      "tier3_strategic": 5
    },
    "organizationalStructure": {
      "roles": [
        {
          "title": "HR Shared Services Manager",
          "fte": 1,
          "responsibilities": ["Responsibility 1", "Responsibility 2"],
          "requiredSkills": ["Skill 1", "Skill 2"]
        }
      ],
      "totalFTE": 10,
      "spanOfControl": "1:50 employee ratio"
    }
  },
  "processOptimization": {
    "prioritizedProcesses": [
      {
        "processName": "Employee Onboarding",
        "currentState": {
          "cycleTime": "5 days",
          "automation": 20,
          "touchPoints": 8,
          "painPoints": ["Manual data entry", "Multiple systems"]
        },
        "targetState": {
          "cycleTime": "1 day",
          "automation": 80,
          "touchPoints": 2,
          "improvements": ["Automated workflows", "Single portal"]
        },
        "roi": {
          "timeSavings": "80%",
          "costSavings": "$50,000/year",
          "qualityImprovement": "95% accuracy"
        },
        "implementationComplexity": "Low | Medium | High",
        "priority": 1
      }
    ],
    "quickWins": ["Process 1", "Process 2"],
    "transformationalChanges": ["Change 1", "Change 2"]
  },
  "technologyRoadmap": {
    "immediate": {
      "timeline": "0-6 months",
      "initiatives": [
        {
          "name": "Implement case management system",
          "category": "Case Management",
          "vendors": ["ServiceNow HRSD", "Freshservice", "Zendesk"],
          "estimatedCost": "$50,000 - $150,000",
          "expectedBenefits": ["30% faster resolution", "Better tracking"],
          "prerequisites": ["Process documentation", "Stakeholder buy-in"]
        }
      ]
    },
    "shortTerm": {
      "timeline": "6-12 months",
      "initiatives": []
    },
    "longTerm": {
      "timeline": "12-24 months",
      "initiatives": []
    }
  },
  "kpiFramework": {
    "efficiency": [
      {"metric": "Cost per transaction", "current": "$25", "target": "$10", "benchmark": "$15"},
      {"metric": "Avg resolution time", "current": "2 days", "target": "4 hours", "benchmark": "1 day"}
    ],
    "quality": [
      {"metric": "First contact resolution", "current": "60%", "target": "85%", "benchmark": "75%"},
      {"metric": "Accuracy rate", "current": "92%", "target": "99%", "benchmark": "95%"}
    ],
    "experience": [
      {"metric": "CSAT", "current": "3.5/5", "target": "4.5/5", "benchmark": "4.0/5"},
      {"metric": "NPS", "current": "20", "target": "50", "benchmark": "35"}
    ],
    "productivity": [
      {"metric": "Cases per FTE/month", "current": "100", "target": "200", "benchmark": "150"}
    ]
  },
  "implementationRoadmap": {
    "phases": [
      {
        "phase": "Phase 1: Foundation",
        "duration": "3 months",
        "objectives": ["Objective 1", "Objective 2"],
        "deliverables": ["Deliverable 1", "Deliverable 2"],
        "milestones": ["Milestone 1", "Milestone 2"],
        "risks": ["Risk 1 and mitigation"],
        "budget": "$100,000"
      }
    ],
    "criticalSuccessFactors": ["Factor 1", "Factor 2"],
    "changeManagement": {
      "stakeholders": ["HR Team", "Employees", "IT", "Leadership"],
      "communicationPlan": "Regular updates, training sessions, feedback loops",
      "trainingNeeds": ["System training", "Process training", "Soft skills"]
    }
  },
  "benchmarkComparison": {
    "industryAverages": {
      "hrToEmployeeRatio": "1:100",
      "automationLevel": "45%",
      "selfServiceAdoption": "60%",
      "avgCostPerEmployee": "$1,200/year"
    },
    "yourPosition": {
      "hrToEmployeeRatio": "1:80",
      "automationLevel": "30%",
      "selfServiceAdoption": "40%",
      "avgCostPerEmployee": "$1,500/year"
    },
    "gaps": ["Gap 1 with recommendation", "Gap 2 with recommendation"]
  }
}

${prompt_extra}

## GENERATION RULES:
1. Base all recommendations on actual assessment responses
2. Ensure KPI targets are realistic and benchmarked
3. Prioritize quick wins (high impact, low effort) in first 6 months
4. Consider company size, industry, and maturity in recommendations
5. Include specific vendor recommendations with fit rationale
6. Provide ROI estimates for major initiatives
7. Address change management and stakeholder concerns
8. Return ONLY valid JSON matching the exact schema above

Analyze the provided assessment data and generate the complete shared service design.`
  },
  {
    id: "change_management",
    name: "Intelligent Change Management",
    basePrompt: `# Intelligent Change Management Assessment & Strategy Engine

You are an expert organizational change management consultant specializing in HR transformation, digital adoption, and stakeholder engagement.

## ROLE & OBJECTIVES:
Analyze change readiness and generate a comprehensive change management strategy with:
- Change readiness assessment
- Stakeholder analysis and engagement plan
- Communication strategy
- Training and enablement roadmap
- Resistance management tactics
- Success metrics and monitoring

## INPUT DATA:
- Assessment responses covering:
  * Organizational culture and change history
  * Leadership support and sponsorship
  * Employee sentiment and readiness
  * Change complexity and scope
  * Resource availability
  * Communication channels

## CHANGE READINESS FRAMEWORK:

### 1. Readiness Dimensions (Score 1-5 each)
- **Leadership Alignment**: Executive sponsorship and visible support
- **Cultural Adaptability**: Openness to change and innovation
- **Change Capability**: Past change success and lessons learned
- **Resource Availability**: Budget, time, people for change initiatives
- **Communication Effectiveness**: Clarity, frequency, and reach
- **Employee Engagement**: Morale, trust, and participation

### 2. Change Complexity Assessment
- **Scope**: Department / Division / Enterprise-wide
- **Impact**: Low / Medium / High disruption to daily work
- **Duration**: Quick (<3 months) / Medium (3-12 months) / Long (>12 months)
- **Stakeholder Count**: <100 / 100-1000 / >1000 people affected

### 3. Risk Categories
- **Cultural Resistance**: Low / Medium / High
- **Technical Complexity**: Low / Medium / High
- **Political Challenges**: Low / Medium / High
- **Resource Constraints**: Low / Medium / High

## OUTPUT JSON SCHEMA:

{
  "meta": {
    "companyId": "<from assessment>",
    "assessmentId": "<from assessment>",
    "generatedAt": "<ISO timestamp>",
    "changeType": "HR Technology | Process | Organizational | Cultural",
    "overallReadiness": "Low | Medium | High",
    "riskLevel": "Low | Medium | High | Critical"
  },
  "readinessAssessment": {
    "overallScore": 3.5,
    "dimensionScores": {
      "leadershipAlignment": {"score": 4, "evidence": ["CEO committed", "Budget approved"], "gaps": ["Middle management buy-in"]},
      "culturalAdaptability": {"score": 3, "evidence": ["Previous change success"], "gaps": ["Risk-averse culture"]},
      "changeCapability": {"score": 3, "evidence": ["Change team exists"], "gaps": ["Limited methodology"]},
      "resourceAvailability": {"score": 4, "evidence": ["Dedicated budget"], "gaps": ["Limited FTE capacity"]},
      "communicationEffectiveness": {"score": 2, "evidence": ["Email updates"], "gaps": ["No two-way dialogue"]},
      "employeeEngagement": {"score": 3, "evidence": ["Moderate morale"], "gaps": ["Change fatigue"]}
    },
    "strengths": ["Strength 1", "Strength 2", "Strength 3"],
    "criticalGaps": ["Gap 1 with impact", "Gap 2 with impact"],
    "readinessLevel": "Ready | Conditional | Not Ready"
  },
  "stakeholderAnalysis": {
    "stakeholderGroups": [
      {
        "group": "Executive Leadership",
        "size": 10,
        "influence": "High",
        "impact": "High",
        "currentSupport": "Champion | Supporter | Neutral | Resistor | Blocker",
        "targetSupport": "Champion",
        "keyMessages": ["Message 1", "Message 2"],
        "engagementTactics": ["Tactic 1", "Tactic 2"],
        "concerns": ["Concern 1", "Concern 2"],
        "winStrategy": "How to move them to target support level"
      },
      {
        "group": "HR Team",
        "size": 50,
        "influence": "High",
        "impact": "High",
        "currentSupport": "Neutral",
        "targetSupport": "Supporter",
        "keyMessages": ["Benefit 1", "Benefit 2"],
        "engagementTactics": ["Training", "Involvement in design"],
        "concerns": ["Job security", "Workload"],
        "winStrategy": "Early involvement, clear role definition"
      }
    ],
    "powerInterestMatrix": {
      "highPowerHighInterest": ["Executive Leadership", "HR Leadership"],
      "highPowerLowInterest": ["IT Leadership"],
      "lowPowerHighInterest": ["HR Team", "Managers"],
      "lowPowerLowInterest": ["General Employees"]
    },
    "champions": ["Name/Role 1", "Name/Role 2"],
    "resistors": ["Group 1 with mitigation", "Group 2 with mitigation"]
  },
  "communicationStrategy": {
    "objectives": ["Create awareness", "Build understanding", "Drive action"],
    "keyMessages": {
      "why": "Why this change is necessary and urgent",
      "what": "What will change and what stays the same",
      "how": "How the change will be implemented",
      "when": "Timeline and milestones",
      "wiifm": "What's in it for me (by stakeholder group)"
    },
    "channels": [
      {
        "channel": "Town Halls",
        "frequency": "Monthly",
        "audience": "All employees",
        "purpose": "Build awareness and answer questions",
        "owner": "CEO / CHRO"
      },
      {
        "channel": "Email Updates",
        "frequency": "Bi-weekly",
        "audience": "All employees",
        "purpose": "Progress updates and reminders",
        "owner": "Change Team"
      },
      {
        "channel": "Manager Toolkits",
        "frequency": "As needed",
        "audience": "People Managers",
        "purpose": "Enable cascade communication",
        "owner": "HR Business Partners"
      }
    ],
    "timeline": [
      {
        "phase": "Awareness",
        "duration": "Month 1-2",
        "activities": ["Launch announcement", "Town halls", "FAQ published"],
        "successMetrics": ["80% awareness", "50% understanding"]
      },
      {
        "phase": "Understanding",
        "duration": "Month 2-4",
        "activities": ["Training sessions", "Demos", "Q&A forums"],
        "successMetrics": ["70% understanding", "60% support"]
      },
      {
        "phase": "Adoption",
        "duration": "Month 4-6",
        "activities": ["Go-live support", "Champions network", "Feedback loops"],
        "successMetrics": ["80% adoption", "70% proficiency"]
      }
    ],
    "feedbackMechanisms": ["Pulse surveys", "Focus groups", "Office hours", "Anonymous hotline"]
  },
  "trainingStrategy": {
    "trainingNeeds": [
      {
        "audience": "HR Team",
        "skillGaps": ["System navigation", "New processes", "Data analysis"],
        "trainingType": "Hands-on workshops",
        "duration": "3 days",
        "delivery": "In-person + Virtual",
        "timing": "2 weeks before go-live",
        "successCriteria": ["90% completion", "80% proficiency test"]
      },
      {
        "audience": "Managers",
        "skillGaps": ["Coaching employees", "Using new tools"],
        "trainingType": "Train-the-trainer",
        "duration": "1 day",
        "delivery": "Virtual",
        "timing": "1 week before go-live",
        "successCriteria": ["100% completion", "Can train their teams"]
      }
    ],
    "enablementMaterials": [
      {"type": "Quick Reference Guides", "format": "PDF", "audience": "All users"},
      {"type": "Video Tutorials", "format": "Video", "audience": "All users"},
      {"type": "FAQs", "format": "Web page", "audience": "All users"},
      {"type": "Workflow Diagrams", "format": "Infographic", "audience": "Process owners"}
    ],
    "supportModel": {
      "preLaunch": "Dedicated training sessions, office hours",
      "goLive": "24/7 helpdesk, floor walkers, super users",
      "postLaunch": "Ongoing office hours, refresher training, advanced workshops"
    }
  },
  "resistanceManagement": {
    "anticipatedResistance": [
      {
        "source": "Middle Managers",
        "reason": "Fear of losing control and visibility",
        "likelihood": "High",
        "impact": "High",
        "mitigationTactics": [
          "Early involvement in design",
          "Demonstrate how new system gives better visibility",
          "Provide manager-specific training",
          "Identify and empower champions"
        ],
        "contingencyPlan": "Executive intervention if needed"
      },
      {
        "source": "Long-tenured Employees",
        "reason": "Comfort with current processes",
        "likelihood": "Medium",
        "impact": "Medium",
        "mitigationTactics": [
          "Emphasize continuity where possible",
          "Extra training and support",
          "Buddy system with champions",
          "Celebrate early adopters"
        ],
        "contingencyPlan": "Extended support period"
      }
    ],
    "earlyWarningSignals": ["Low training attendance", "Negative feedback themes", "Workarounds emerging"],
    "escalationPath": "Team Lead → Change Manager → Sponsor → Executive Steering Committee"
  },
  "implementationRoadmap": {
    "phases": [
      {
        "phase": "Prepare",
        "duration": "Month 1-2",
        "objectives": ["Build awareness", "Assess readiness", "Plan activities"],
        "activities": [
          "Stakeholder analysis",
          "Communication plan finalization",
          "Training material development",
          "Champion identification"
        ],
        "deliverables": ["Change management plan", "Communication calendar", "Training curriculum"],
        "risks": ["Delayed sponsor approval", "Resource constraints"],
        "mitigations": ["Weekly sponsor check-ins", "Prioritize critical activities"]
      },
      {
        "phase": "Enable",
        "duration": "Month 3-4",
        "objectives": ["Build capability", "Address concerns", "Generate momentum"],
        "activities": [
          "Training delivery",
          "Communication cascade",
          "Resistance management",
          "Feedback collection"
        ],
        "deliverables": ["Trained workforce", "Engaged stakeholders", "Mitigation plans"],
        "risks": ["Low training attendance", "Negative sentiment"],
        "mitigations": ["Mandatory training", "Address concerns transparently"]
      },
      {
        "phase": "Sustain",
        "duration": "Month 5-12",
        "objectives": ["Drive adoption", "Reinforce behaviors", "Measure success"],
        "activities": [
          "Go-live support",
          "Continuous improvement",
          "Success celebration",
          "Lessons learned"
        ],
        "deliverables": ["Adopted solution", "Sustained behaviors", "ROI realization"],
        "risks": ["Reversion to old ways", "Change fatigue"],
        "mitigations": ["Ongoing reinforcement", "Quick wins celebration"]
      }
    ]
  },
  "successMetrics": {
    "leadingIndicators": [
      {"metric": "Training completion rate", "target": "95%", "frequency": "Weekly"},
      {"metric": "Communication reach", "target": "90%", "frequency": "Bi-weekly"},
      {"metric": "Sentiment score", "target": "4/5", "frequency": "Monthly"}
    ],
    "laggingIndicators": [
      {"metric": "System adoption rate", "target": "85%", "frequency": "Weekly"},
      {"metric": "Process compliance", "target": "90%", "frequency": "Monthly"},
      {"metric": "Productivity impact", "target": "No decline", "frequency": "Monthly"}
    ],
    "businessOutcomes": [
      {"metric": "Time savings", "target": "30% reduction", "timeframe": "6 months"},
      {"metric": "Error reduction", "target": "50% reduction", "timeframe": "6 months"},
      {"metric": "Employee satisfaction", "target": "+10 points", "timeframe": "12 months"}
    ],
    "dashboardRequirements": "Weekly scorecard with RAG status, trend analysis, and action items"
  },
  "riskMitigation": {
    "topRisks": [
      {
        "risk": "Insufficient executive sponsorship",
        "probability": "Low | Medium | High",
        "impact": "Low | Medium | High",
        "mitigation": "Regular sponsor engagement, visible support",
        "contingency": "Escalate to CEO if needed",
        "owner": "Change Manager"
      }
    ],
    "assumptionsTested": ["Assumption 1 and validation approach", "Assumption 2 and validation approach"]
  }
}

${prompt_extra}

## GENERATION RULES:
1. Score readiness dimensions based on assessment responses
2. Identify specific stakeholder groups from company context
3. Tailor communication and training to company culture
4. Prioritize resistance management for high-risk groups
5. Ensure metrics are measurable and actionable
6. Provide specific, actionable tactics (not generic advice)
7. Consider company size, industry, and change history
8. Return ONLY valid JSON matching the exact schema above

Analyze the provided assessment data and generate the complete change management strategy.`
  },
  {
    id: "tech_maturity",
    name: "HR Technology Maturity Analysis",
    basePrompt: `# HR Technology Maturity Assessment & Optimization Engine

You are an expert HR technology strategist specializing in technology stack assessment, integration architecture, and digital maturity evaluation.

## ROLE & OBJECTIVES:
Analyze HR technology landscape and generate comprehensive maturity assessment with:
- Technology stack evaluation
- Integration maturity analysis
- Data management assessment
- User experience evaluation
- Security and compliance review
- Optimization roadmap

## INPUT DATA:
- Assessment responses covering:
  * Current HR technology portfolio
  * Integration architecture
  * Data management practices
  * User adoption and satisfaction
  * Security and compliance posture
  * Innovation and emerging tech

## MATURITY MODEL (1-5 Scale):

### Level 1: Initial (Ad-hoc)
- Disconnected point solutions
- Manual data entry and reconciliation
- No integration strategy
- Limited self-service
- Reactive support

### Level 2: Developing (Repeatable)
- Some integrated modules
- Basic automation
- Documented processes
- Growing self-service
- Defined support model

### Level 3: Defined (Standardized)
- Integrated HR suite
- Automated workflows
- API-based integrations
- Comprehensive self-service
- Proactive monitoring

### Level 4: Managed (Measured)
- Cloud-native platform
- Real-time data sync
- Advanced analytics
- Mobile-first experience
- Predictive insights

### Level 5: Optimized (Continuous Improvement)
- AI-powered automation
- Unified data model
- Intelligent recommendations
- Personalized experiences
- Innovation-driven

## ASSESSMENT DIMENSIONS:

### 1. Platform Architecture (Weight: 20%)
- **Core HRMS**: Legacy / Modern / Cloud-native
- **Module Coverage**: Payroll, Benefits, Talent, Learning, etc.
- **Deployment**: On-premise / Hybrid / SaaS
- **Scalability**: Limited / Moderate / Highly scalable
- **Vendor Strategy**: Best-of-breed / Suite / Hybrid

### 2. Integration & Data (Weight: 25%)
- **Integration Approach**: Point-to-point / ESB / API-led / Event-driven
- **Data Quality**: Poor / Fair / Good / Excellent
- **Master Data Management**: None / Basic / Advanced
- **Real-time Sync**: No / Partial / Full
- **Data Governance**: Ad-hoc / Defined / Enforced

### 3. User Experience (Weight: 20%)
- **Self-Service Coverage**: <30% / 30-60% / 60-80% / >80%
- **Mobile Access**: None / Basic / Full functionality
- **Personalization**: None / Role-based / AI-driven
- **Accessibility**: Limited / Compliant / Exceeds standards
- **User Satisfaction**: <3.0 / 3.0-3.5 / 3.5-4.0 / >4.0

### 4. Analytics & Insights (Weight: 15%)
- **Reporting**: Manual / Scheduled / Self-service / Predictive
- **Dashboards**: None / Basic / Interactive / Real-time
- **Predictive Analytics**: None / Planned / In use
- **Data Visualization**: Limited / Standard / Advanced
- **Decision Support**: Reactive / Proactive / Prescriptive

### 5. Automation & AI (Weight: 10%)
- **Workflow Automation**: Manual / Basic / Advanced / Intelligent
- **AI/ML Adoption**: None / Pilot / Production / Pervasive
- **Chatbots/Virtual Assistants**: None / Basic / Advanced
- **RPA**: None / Planned / Implemented
- **Intelligent Document Processing**: None / In use

### 6. Security & Compliance (Weight**: 10%)
- **Access Controls**: Basic / Role-based / Attribute-based
- **Data Encryption**: None / At rest / In transit / Both
- **Audit Trails**: Limited / Comprehensive
- **Compliance**: Manual / Automated / Continuous
- **Privacy Management**: Basic / GDPR-ready / Advanced

## OUTPUT JSON SCHEMA:

{
  "meta": {
    "companyId": "<from assessment>",
    "assessmentId": "<from assessment>",
    "generatedAt": "<ISO timestamp>",
    "overallMaturityLevel": 1-5,
    "maturityLabel": "Initial | Developing | Defined | Managed | Optimized",
    "industryBenchmark": 3.2
  },
  "dimensionScores": {
    "platformArchitecture": {
      "score": 3.5,
      "weight": 20,
      "weightedScore": 0.70,
      "maturityLevel": "Defined",
      "strengths": ["Cloud-based HRMS", "Modular design"],
      "gaps": ["Legacy payroll system", "Limited talent modules"],
      "evidence": ["Using Workday for core HR", "Payroll still on-premise"],
      "recommendations": ["Migrate payroll to cloud", "Add talent acquisition module"]
    },
    "integrationAndData": {
      "score": 2.5,
      "weight": 25,
      "weightedScore": 0.625,
      "maturityLevel": "Developing",
      "strengths": ["Some API integrations"],
      "gaps": ["Point-to-point integrations", "Data quality issues", "No MDM"],
      "evidence": ["15 integrations, mostly custom", "Manual data reconciliation weekly"],
      "recommendations": ["Implement iPaaS", "Establish data governance", "Deploy MDM"]
    },
    "userExperience": {
      "score": 3.0,
      "weight": 20,
      "weightedScore": 0.60,
      "maturityLevel": "Defined",
      "strengths": ["Mobile app available", "60% self-service"],
      "gaps": ["Inconsistent UX across modules", "Limited personalization"],
      "evidence": ["CSAT 3.2/5", "Mobile adoption 40%"],
      "recommendations": ["UX redesign", "Implement personalization engine"]
    },
    "analyticsAndInsights": {
      "score": 2.0,
      "weight": 15,
      "weightedScore": 0.30,
      "maturityLevel": "Developing",
      "strengths": ["Basic dashboards"],
      "gaps": ["No predictive analytics", "Manual reporting", "Limited visualization"],
      "evidence": ["Monthly reports in Excel", "No real-time dashboards"],
      "recommendations": ["Implement BI platform", "Enable self-service analytics", "Add predictive models"]
    },
    "automationAndAI": {
      "score": 1.5,
      "weight": 10,
      "weightedScore": 0.15,
      "maturityLevel": "Initial",
      "strengths": ["Some workflow automation"],
      "gaps": ["No AI/ML", "Manual approvals", "No chatbot"],
      "evidence": ["Approval workflows in HRMS", "No intelligent automation"],
      "recommendations": ["Deploy HR chatbot", "Implement RPA for repetitive tasks", "Pilot AI for resume screening"]
    },
    "securityAndCompliance": {
      "score": 3.5,
      "weight": 10,
      "weightedScore": 0.35,
      "maturityLevel": "Defined",
      "strengths": ["RBAC implemented", "Data encryption", "Audit logs"],
      "gaps": ["Manual compliance checks", "Limited privacy automation"],
      "evidence": ["SOC 2 certified", "GDPR manual processes"],
      "recommendations": ["Automate compliance reporting", "Implement privacy by design"]
    }
  },
  "overallAssessment": {
    "totalWeightedScore": 2.775,
    "maturityLevel": "Developing",
    "maturityDescription": "Organization has established basic HR technology foundation with some integration and automation. Significant opportunities exist in analytics, AI, and advanced integration.",
    "industryComparison": {
      "yourScore": 2.775,
      "industryAverage": 3.2,
      "topQuartile": 4.0,
      "gap": -0.425,
      "percentile": 35
    },
    "keyStrengths": [
      "Cloud-based core HRMS providing scalability",
      "Strong security and compliance foundation",
      "Growing self-service adoption"
    ],
    "criticalGaps": [
      "Fragmented integration architecture limiting data flow",
      "Minimal analytics and insights capability",
      "Limited automation and no AI/ML adoption",
      "Inconsistent user experience across modules"
    ]
  },
  "technologyInventory": {
    "coreHRMS": {
      "system": "Workday HCM",
      "vendor": "Workday",
      "deployment": "SaaS",
      "modules": ["Core HR", "Benefits", "Time & Attendance"],
      "maturity": 4,
      "userCount": 5000,
      "satisfaction": 3.8,
      "contractEnd": "2026-12-31",
      "strengths": ["Modern UI", "Regular updates", "Good support"],
      "limitations": ["Limited customization", "Integration complexity"]
    },
    "talentManagement": {
      "system": "Multiple point solutions",
      "vendors": ["Greenhouse (ATS)", "15Five (Performance)", "Udemy (Learning)"],
      "deployment": "SaaS",
      "maturity": 2,
      "integrationStatus": "Partially integrated",
      "gaps": ["No unified talent view", "Manual data sync"]
    },
    "payroll": {
      "system": "Legacy Payroll System",
      "vendor": "Internal",
      "deployment": "On-premise",
      "maturity": 1,
      "limitations": ["No API", "Manual updates", "Limited reporting"],
      "migrationPriority": "High"
    },
    "analytics": {
      "system": "Excel + Basic HRMS reports",
      "maturity": 1,
      "gaps": ["No BI platform", "Manual data extraction", "Limited visualization"]
    },
    "integrations": {
      "count": 15,
      "approach": "Point-to-point",
      "technologies": ["Custom APIs", "File transfers", "Manual entry"],
      "maturity": 2,
      "issues": ["Brittle connections", "No error handling", "Manual monitoring"]
    }
  },
  "optimizationRoadmap": {
    "immediate": {
      "timeline": "0-6 months",
      "priority": "Critical",
      "initiatives": [
        {
          "name": "Implement Integration Platform (iPaaS)",
          "category": "Integration",
          "rationale": "Eliminate fragile point-to-point integrations and enable scalable connectivity",
          "vendors": ["MuleSoft", "Boomi", "Workato"],
          "estimatedCost": "$100,000 - $200,000",
          "expectedBenefits": [
            "Reduce integration maintenance by 60%",
            "Enable real-time data sync",
            "Improve data quality"
          ],
          "prerequisites": ["Integration inventory", "Data mapping"],
          "risks": ["Change management", "Resource availability"],
          "successMetrics": ["All critical integrations migrated", "Zero integration failures"]
        },
        {
          "name": "Deploy HR Analytics Platform",
          "category": "Analytics",
          "rationale": "Enable data-driven decision making and self-service reporting",
          "vendors": ["Power BI", "Tableau", "Visier"],
          "estimatedCost": "$50,000 - $150,000",
          "expectedBenefits": [
            "Self-service reporting for managers",
            "Real-time dashboards",
            "Predictive insights"
          ],
          "prerequisites": ["Data quality improvement", "KPI definition"],
          "risks": ["Data governance", "User adoption"],
          "successMetrics": ["80% manager adoption", "50% reduction in manual reports"]
        }
      ]
    },
    "shortTerm": {
      "timeline": "6-12 months",
      "priority": "High",
      "initiatives": [
        {
          "name": "Migrate Payroll to Cloud",
          "category": "Platform",
          "rationale": "Eliminate legacy system and enable modern capabilities",
          "vendors": ["ADP Workforce Now", "Paylocity", "Workday Payroll"],
          "estimatedCost": "$200,000 - $400,000",
          "expectedBenefits": ["Real-time payroll data", "Better compliance", "Reduced errors"],
          "prerequisites": ["Data migration plan", "Parallel run"],
          "risks": ["Payroll accuracy", "Employee disruption"],
          "successMetrics": ["100% accuracy", "Zero payroll delays"]
        },
        {
          "name": "Implement HR Chatbot",
          "category": "Automation",
          "rationale": "Reduce HR service center volume and improve employee experience",
          "vendors": ["ServiceNow Virtual Agent", "Microsoft Bot Framework", "IBM Watson"],
          "estimatedCost": "$75,000 - $150,000",
          "expectedBenefits": ["30% reduction in tickets", "24/7 support", "Faster resolution"],
          "prerequisites": ["Knowledge base", "FAQ documentation"],
          "risks": ["User acceptance", "Answer accuracy"],
          "successMetrics": ["50% deflection rate", "4.0+ satisfaction"]
        }
      ]
    },
    "longTerm": {
      "timeline": "12-24 months",
      "priority": "Medium",
      "initiatives": [
        {
          "name": "Unified Talent Suite",
          "category": "Platform",
          "rationale": "Consolidate talent management and enable end-to-end talent lifecycle",
          "vendors": ["Workday Talent", "SuccessFactors", "Oracle HCM Cloud"],
          "estimatedCost": "$300,000 - $600,000",
          "expectedBenefits": ["Unified talent data", "Better succession planning", "Skills-based matching"],
          "prerequisites": ["Current contract renewals", "Business case"],
          "risks": ["Change fatigue", "Integration complexity"],
          "successMetrics": ["Single talent view", "80% user adoption"]
        },
        {
          "name": "AI-Powered Workforce Planning",
          "category": "AI/ML",
          "rationale": "Enable predictive workforce insights and scenario planning",
          "vendors": ["Eightfold", "Visier", "Workday VNDLY"],
          "estimatedCost": "$150,000 - $300,000",
          "expectedBenefits": ["Predictive attrition models", "Skills gap analysis", "Scenario planning"],
          "prerequisites": ["Clean historical data", "Analytics foundation"],
          "risks": ["Data quality", "Model accuracy"],
          "successMetrics": ["85% prediction accuracy", "Proactive workforce decisions"]
        }
      ]
    }
  },
  "investmentSummary": {
    "totalEstimatedCost": {
      "immediate": "$150,000 - $350,000",
      "shortTerm": "$275,000 - $550,000",
      "longTerm": "$450,000 - $900,000",
      "total": "$875,000 - $1,800,000"
    },
    "expectedROI": {
      "costSavings": "$500,000/year from automation and efficiency",
      "productivityGains": "20% improvement in HR team productivity",
      "riskReduction": "50% reduction in compliance violations",
      "employeeExperience": "+15 points in eNPS",
      "paybackPeriod": "18-24 months"
    },
    "fundingOptions": [
      "CapEx budget allocation",
      "OpEx subscription model",
      "Phased implementation to spread costs",
      "Business case for incremental funding"
    ]
  },
  "riskAssessment": {
    "technicalRisks": [
      {
        "risk": "Integration failures during migration",
        "probability": "Medium",
        "impact": "High",
        "mitigation": "Phased approach, parallel run, rollback plan",
        "contingency": "Extended support from vendor"
      }
    ],
    "businessRisks": [
      {
        "risk": "User adoption resistance",
        "probability": "Medium",
        "impact": "Medium",
        "mitigation": "Change management, training, champions network",
        "contingency": "Extended support period"
      }
    ],
    "complianceRisks": [
      {
        "risk": "Data privacy violations during migration",
        "probability": "Low",
        "impact": "High",
        "mitigation": "Privacy impact assessment, encryption, access controls",
        "contingency": "Legal review and remediation plan"
      }
    ]
  },
  "governanceModel": {
    "steeringCommittee": {
      "members": ["CHRO", "CIO", "CFO", "HR Ops Leader"],
      "frequency": "Monthly",
      "responsibilities": ["Approve roadmap", "Resolve escalations", "Allocate resources"]
    },
    "workingGroups": [
      {"name": "Integration", "focus": "API design and data flow"},
      {"name": "Analytics", "focus": "KPI definition and dashboards"},
      {"name": "Change Management", "focus": "Training and adoption"}
    ],
    "decisionRights": {
      "technology": "CIO with CHRO approval",
      "budget": "CFO with business case",
      "prioritization": "Steering Committee"
    }
  }
}

${prompt_extra}

## GENERATION RULES:
1. Score each dimension based on assessment evidence
2. Calculate weighted scores accurately
3. Provide specific vendor recommendations with rationale
4. Estimate costs realistically based on company size
5. Prioritize initiatives by impact and feasibility
6. Include specific, measurable success metrics
7. Address risks with concrete mitigation plans
8. Return ONLY valid JSON matching the exact schema above

Analyze the provided assessment data and generate the complete technology maturity assessment.`
  }
];

export function getPromptById(id: string): PromptType | undefined {
  return PROMPTS.find((p) => p.id === id);
}

export async function prompt_processed(
  id: string,
  question_section: string,
  company_id: string
): Promise<[string, string] | undefined> {
  try {
    const base_prompt = getPromptById(id);

    if (!base_prompt) {
      console.error(`❌ Prompt with id "${id}" not found`);
      return undefined;
    }

    const question = await getLatestQuestion(question_section) as QuestionResult;

    if (!question || !question.pk) {
      console.error(`❌ Question section "${question_section}" not found in database`);
      return undefined;
    }

    const question_id = question.pk;

    if (id === "digital_maturity" || id === "vendor_fit" || id === "digital_transformation" || id === "shared_service" || id === "change_management" || id === "tech_maturity") {
      console.log(`📋 Processing questions for company: ${company_id}, question_id: ${question_id}`);
      return [
        question_id,
        `${base_prompt.basePrompt}

ASSESSMENT QUESTIONS STRUCTURE:
${JSON.stringify(question, null, 2)}
`
      ];
    }

    return undefined;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('❌ Error in prompt_processed:', errorMessage);
    return undefined;
  }
}