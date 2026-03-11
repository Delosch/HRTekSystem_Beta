
export interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface Dimension {
  id: number;
  title: string;
  questions: Question[];
  insight: string; // The generic AI suggestion for the footer
  description: string; // Brief section purpose
}

export const diagnosticData: Dimension[] = [
  {
    id: 1,
    title: "Dimension 1: HR Tech Architecture Depth",
    description: "Analyze the core structure and technical health of your HR technology stack.",
    insight: "Architecture limits scalability due to point-solution fragmentation.",
    questions: [
      {
        id: 1,
        text: "How is your HR tech stack architected?",
        options: [
          "Tool-based (point solutions)",
          "Function-based (HRMS + ATS)",
          "Suite-based (HCM)",
          "Platform-based (API ecosystem)",
          "Product-based digital HR platform"
        ]
      },
      {
        id: 2,
        text: "Degree of customization vs configuration:",
        options: [
          "Heavy customization",
          "Moderate customization",
          "Mostly configuration",
          "Config + extensions",
          "Low-code / composable"
        ]
      },
      {
        id: 3,
        text: "Dependency on individuals for system operations:",
        options: [
          "Critical dependency",
          "High dependency",
          "Moderate dependency",
          "Low dependency",
          "Process & system driven"
        ]
      },
      {
        id: 4,
        text: "HR tech technical debt level:",
        options: [
          "Unknown",
          "Very high",
          "High",
          "Manageable",
          "Continuously reduced"
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Dimension 2: Process Intelligence & Friction Mapping",
    description: "Identify operational inefficiencies and map process friction across functions.",
    insight: "High friction in process handoffs indicates significant efficiency loss.",
    questions: [
      {
        id: 5,
        text: "HR processes visibility across lifecycle:",
        options: [
          "No visibility",
          "Step-based",
          "SLA-based",
          "Flow-based",
          "Value-stream based"
        ]
      },
      {
        id: 6,
        text: "Process handoffs across functions cause:",
        options: [
          "Frequent breakdowns",
          "Delays",
          "Rework",
          "Minor friction",
          "Seamless transitions"
        ]
      },
      {
        id: 7,
        text: "Average HR cycle time compared to industry benchmark:",
        options: [
          ">50% slower",
          "25–50% slower",
          "At benchmark",
          "10–25% faster",
          "Top quartile"
        ]
      },
      {
        id: 8,
        text: "Root cause analysis of HR issues is:",
        options: [
          "Not done",
          "Anecdotal",
          "Periodic",
          "Systematic",
          "AI-assisted"
        ]
      }
    ]
  },
  {
    id: 3,
    title: "Dimension 3: Data Gravity & Decision Latency",
    description: "Measure the speed and quality of data-driven decision making.",
    insight: "Decision latency is critically high; real-time insights are unavailable.",
    questions: [
      {
        id: 9,
        text: "Time taken to generate leadership HR insights:",
        options: [
          "Weeks",
          "Days",
          "Hours",
          "Near real-time",
          "Real-time"
        ]
      },
      {
        id: 10,
        text: "Number of manual interventions before data is usable:",
        options: [
          "5+",
          "3–4",
          "2",
          "1",
          "Zero"
        ]
      },
      {
        id: 11,
        text: "Confidence in HR data used for decisions:",
        options: [
          "Very low",
          "Low",
          "Moderate",
          "High",
          "Board-level confidence"
        ]
      },
      {
        id: 12,
        text: "Ability to correlate HR data with business outcomes:",
        options: [
          "Not possible",
          "Limited",
          "Moderate",
          "Strong",
          "Automated correlation"
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Dimension 4: Cost, ROI & Economic Leakage",
    description: "Evaluate your total cost of ownership and investment value realization.",
    insight: "Hidden costs and lack of ROI tracking suggest economic leakage.",
    questions: [
      {
        id: 13,
        text: "Visibility into HR tech TCO:",
        options: [
          "No visibility",
          "License only",
          "Partial TCO",
          "Full TCO",
          "ROI tracked"
        ]
      },
      {
        id: 14,
        text: "HR cost leakage due to inefficiencies:",
        options: [
          "Unknown",
          "Very high",
          "High",
          "Moderate",
          "Minimal"
        ]
      },
      {
        id: 15,
        text: "ROI tracking of HR tech investments:",
        options: [
          "Not tracked",
          "Anecdotal",
          "Periodic",
          "KPI-based",
          "Value-realization engine"
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Dimension 5: Organizational Change Velocity",
    description: "Assess the speed and effectiveness of change adoption within your team.",
    insight: "Slow adoption rates and high fatigue are stalling transformation.",
    questions: [
      {
        id: 16,
        text: "Time to adopt new HR processes:",
        options: [
          ">12 months",
          "6–12 months",
          "3–6 months",
          "<3 months",
          "Continuous adoption"
        ]
      },
      {
        id: 17,
        text: "Change fatigue level in organization:",
        options: [
          "Severe",
          "High",
          "Moderate",
          "Low",
          "Adaptive culture"
        ]
      },
      {
        id: 18,
        text: "Role clarity during transformation:",
        options: [
          "Highly unclear",
          "Partially unclear",
          "Defined",
          "Well-defined",
          "Product ownership model"
        ]
      }
    ]
  },
  {
    id: 6,
    title: "Dimension 6: AI Depth (Not AI-washing)",
    description: "Distinguish between superficial AI usage and deeply embedded intelligent capabilities.",
    insight: "AI usage is superficial; deeper integration required for true intelligence.",
    questions: [
      {
        id: 19,
        text: "AI use cases maturity:",
        options: [
          "No AI",
          "Chatbots only",
          "Narrow use cases",
          "Multi-process AI",
          "AI orchestrated HR"
        ]
      },
      {
        id: 20,
        text: "Quality of data feeding AI models:",
        options: [
          "Poor",
          "Inconsistent",
          "Clean",
          "Governed",
          "ML-ready"
        ]
      },
      {
        id: 21,
        text: "Human-AI decision balance:",
        options: [
          "Fully human",
          "Human dominant",
          "AI assisted",
          "AI recommended",
          "AI augmented governance"
        ]
      },
      {
        id: 22,
        text: "Explainability & trust in AI decisions:",
        options: [
          "No trust",
          "Low trust",
          "Moderate trust",
          "High trust",
          "Auditable AI"
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Dimension 7: Experience Intelligence (EX ≠ UX)",
    description: "Optimize employee experience through advanced behavioral and experience data.",
    insight: "Experience metrics are anecdotal; shift to behavioural analytics needed.",
    questions: [
      {
        id: 23,
        text: "Ability to measure employee effort & friction:",
        options: [
          "Not measured",
          "Anecdotal",
          "Survey-based",
          "Behavioural analytics",
          "Experience intelligence"
        ]
      },
      {
        id: 24,
        text: "Alignment between EX & CX outcomes:",
        options: [
          "No alignment",
          "Weak",
          "Moderate",
          "Strong",
          "Causal linkage"
        ]
      },
      {
        id: 25,
        text: "Personalization of employee journeys:",
        options: [
          "None",
          "Rule-based",
          "Segment-based",
          "Context-aware",
          "AI-personalized"
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Dimension 8: Governance, Risk & Resilience",
    description: "Ensure robust compliance frameworks and operational resilience across systems.",
    insight: "Operational risk visibility is reactive; predictive capabilities missing.",
    questions: [
      {
        id: 26,
        text: "HR operational risk visibility:",
        options: [
          "No visibility",
          "Reactive",
          "Periodic",
          "Continuous",
          "Predictive"
        ]
      },
      {
        id: 27,
        text: "Audit readiness of HR systems:",
        options: [
          "Poor",
          "Basic",
          "Adequate",
          "Strong",
          "Always audit-ready"
        ]
      },
      {
        id: 28,
        text: "Business continuity for HR operations:",
        options: [
          "No plan",
          "Documented",
          "Partially tested",
          "Tested regularly",
          "Autonomous resilience"
        ]
      }
    ]
  },
  {
    id: 9,
    title: "Dimension 9: Scalability, M&A & Global Readiness",
    description: "Evaluate your system's readiness for rapid growth and global expansion.",
    insight: "Current systems pose high risk for rapid scaling or M&A integration.",
    questions: [
      {
        id: 29,
        text: "Readiness for rapid headcount growth:",
        options: [
          "Not ready",
          "High risk",
          "Moderate risk",
          "Low risk",
          "Plug-and-scale"
        ]
      },
      {
        id: 30,
        text: "M&A / restructuring readiness of HR systems:",
        options: [
          "Not supported",
          "Manual heavy",
          "Semi-supported",
          "Well supported",
          "Designed for change"
        ]
      },
      {
        id: 31,
        text: "Localization & compliance flexibility:",
        options: [
          "Very limited",
          "Limited",
          "Moderate",
          "High",
          "Global-by-design"
        ]
      }
    ]
  },
  {
    id: 10,
    title: "Dimension 10: HR Operating Model Intelligence",
    description: "Align your HR operating model with future-state digital delivery needs.",
    insight: "Operating model is transaction-heavy; needs shift to strategic analytics.",
    questions: [
      {
        id: 32,
        text: "HR role distribution:",
        options: [
          "Mostly transactional",
          "Ops heavy",
          "Balanced",
          "Strategic heavy",
          "Product & analytics led"
        ]
      },
      {
        id: 33,
        text: "Decision rights clarity in HR:",
        options: [
          "Unclear",
          "Partially clear",
          "Clear",
          "Well governed",
          "Product governance"
        ]
      },
      {
        id: 34,
        text: "Dependency on consultants/vendors:",
        options: [
          "Total dependency",
          "High",
          "Moderate",
          "Low",
          "Internal capability"
        ]
      }
    ]
  }
];
