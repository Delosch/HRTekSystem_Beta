export interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface Domain {
  id: number;
  name: string;
  shortName: string;
  description: string;
  questionRange: [number, number];
  questions: Question[];
  isAgentic?: boolean;
}

export const assessmentData: Domain[] = [
  {
    id: 1,
    name: 'Operating Model Architecture',
    shortName: 'Operating Model',
    description: 'Assess structure, scalability, and role clarity.',
    questionRange: [1, 6],
    questions: [
      {
        id: 1,
        text: 'Current HR service delivery structure:',
        options: [
          'Fully decentralized with no central coordination',
          'Mostly decentralized with limited shared functions',
          'Hybrid model with partial centralization',
          'Formal Shared Services Center (SSC) exists',
          'Globally integrated SSC with digital governance',
        ],
      },
      {
        id: 2,
        text: 'Clarity of HRBP–COE–SSC role separation:',
        options: [
          'Roles overlap significantly',
          'Some role clarity but inconsistent',
          'Defined roles but operational confusion exists',
          'Clearly defined and governed roles',
          'Digitally enforced RACI with performance tracking',
        ],
      },
      {
        id: 3,
        text: 'HR Service Catalog maturity:',
        options: [
          'No defined catalog',
          'Informal list of services',
          'Documented static catalog',
          'Digital catalog with SLAs',
          'Dynamic catalog with analytics & usage tracking',
        ],
      },
      {
        id: 4,
        text: 'Scalability of HR operating model:',
        options: [
          'Not scalable',
          'Requires major restructuring',
          'Scalable with manual effort',
          'Designed for multi-region scale',
          'Cloud-enabled, globally harmonized model',
        ],
      },
      {
        id: 5,
        text: 'Tiered HR support model (Tier 0–3):',
        options: [
          'No tier model',
          'Basic helpdesk only',
          'Tier 1 & 2 partially defined',
          'Fully implemented tier model',
          'AI-driven intelligent routing & triage',
        ],
      },
      {
        id: 6,
        text: 'Governance structure for HR operations:',
        options: [
          'Reactive, issue-based reviews',
          'Informal meetings',
          'Periodic structured reviews',
          'Defined governance cadence & metrics',
          'Real-time operational command centre',
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Service Experience',
    shortName: 'Service Experience',
    description: 'Evaluate employee access, satisfaction, and self-service adoption.',
    questionRange: [7, 12],
    questions: [
      {
        id: 7,
        text: 'Employee access to HR services:',
        options: [
          'Email/manual requests',
          'Email + forms',
          'Basic portal access',
          'Centralized digital portal',
          'Omnichannel (portal + chatbot + mobile + AI)',
        ],
      },
      {
        id: 8,
        text: 'First-contact resolution maturity:',
        options: [
          'Not tracked',
          'Estimated informally',
          'Measured occasionally',
          'Regularly tracked & optimized',
          'Predictive optimization through AI',
        ],
      },
      {
        id: 9,
        text: 'Self-service adoption:',
        options: [
          'Very low usage',
          'Limited adoption',
          'Moderate adoption',
          'High adoption across workforce',
          'AI-personalized self-service experience',
        ],
      },
      {
        id: 10,
        text: 'Case transparency:',
        options: [
          'No tracking',
          'Manual follow-ups',
          'Ticket numbers provided',
          'SLA dashboards visible',
          'Real-time predictive updates',
        ],
      },
      {
        id: 11,
        text: 'Employee satisfaction tracking:',
        options: [
          'Not measured',
          'Ad-hoc feedback',
          'Annual survey',
          'Periodic pulse surveys',
          'Real-time sentiment analytics',
        ],
      },
      {
        id: 12,
        text: 'HR communication automation:',
        options: [
          'Manual communication',
          'Email templates',
          'Workflow-triggered messages',
          'Automated lifecycle notifications',
          'AI-personalized communication journeys',
        ],
      },
    ],
  },
  {
    id: 3,
    name: 'Process Standardization',
    shortName: 'Process Standardization',
    description: 'Measure standardization, harmonization, and continuous improvement.',
    questionRange: [13, 18],
    questions: [
      {
        id: 13,
        text: 'SOP documentation:',
        options: [
          'Not documented',
          'Partially documented',
          'Documented but outdated',
          'Standardized & maintained',
          'Digitally embedded & auto-updated',
        ],
      },
      {
        id: 14,
        text: 'Process harmonization:',
        options: [
          'Highly inconsistent',
          'Mostly local variations',
          'Core processes standardized',
          'Fully harmonized enterprise-wide',
          'Digitally enforced harmonization',
        ],
      },
      {
        id: 15,
        text: 'Escalation framework:',
        options: [
          'No structure',
          'Informal escalation',
          'Documented but slow',
          'SLA-driven structured matrix',
          'Automated escalation logic',
        ],
      },
      {
        id: 16,
        text: 'Cross-functional integration:',
        options: [
          'Isolated HR processes',
          'Manual coordination',
          'Limited integration',
          'System/API integration',
          'Real-time interconnected workflows',
        ],
      },
      {
        id: 17,
        text: 'Exception management:',
        options: [
          'Ad-hoc decisions',
          'Manager discretion',
          'Documented but manual',
          'Structured exception workflow',
          'Automated anomaly detection',
        ],
      },
      {
        id: 18,
        text: 'Continuous improvement:',
        options: [
          'None',
          'Reactive corrections',
          'Periodic reviews',
          'Structured CI program',
          'AI-driven optimization cycles',
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Technology & Automation Enablement',
    shortName: 'Tech & Automation',
    description: 'Assess HCM integration, workflow automation, and digital capabilities.',
    questionRange: [19, 24],
    questions: [
      {
        id: 19,
        text: 'How integrated is your core HCM platform across HR functions?',
        options: [
          'No unified HCM; multiple disconnected tools',
          'Basic HCM used mainly for records',
          'HCM supports core processes with manual dependencies',
          'Fully integrated HCM across HR operations',
          'Intelligent HCM with automation, analytics, and AI extensions',
        ],
      },
      {
        id: 20,
        text: 'What best describes your HR case management or ticketing system?',
        options: [
          'No ticketing; handled via emails or calls',
          'Basic ticket logging without workflows',
          'Ticketing exists with limited automation',
          'Workflow-driven case management with SLAs',
          'AI-enabled case management with auto-routing and prioritization',
        ],
      },
      {
        id: 21,
        text: 'Level of workflow automation in HR processes:',
        options: [
          'Processes are fully manual',
          'Isolated automation in few processes',
          'Core workflows automated with manual interventions',
          'End-to-end workflow automation',
          'Self-optimizing workflows using AI/ML',
        ],
      },
      {
        id: 22,
        text: 'Use of RPA or automation bots in HR operations:',
        options: [
          'No RPA usage',
          'RPA planned or piloted',
          'RPA used in limited processes',
          'RPA embedded in multiple HR processes',
          'Intelligent automation with orchestration & monitoring',
        ],
      },
      {
        id: 23,
        text: 'Chatbot or virtual assistant capability in HR:',
        options: [
          'No chatbot or digital assistant',
          'Basic FAQ chatbot',
          'Chatbot supports limited HR queries',
          'Chatbot resolves majority of Tier-1 queries',
          'Conversational AI with contextual understanding & learning',
        ],
      },
      {
        id: 24,
        text: 'Digital documentation and paperless HR operations:',
        options: [
          'Predominantly paper-based',
          'Partial digitization of documents',
          'Digital documents with manual approvals',
          'Fully paperless HR workflows',
          'Intelligent document processing with auto-classification',
        ],
      },
    ],
  },
  {
    id: 5,
    name: 'Data & Analytics Intelligence',
    shortName: 'Data & Analytics',
    description: 'Evaluate dashboards, data centralization, and predictive capabilities.',
    questionRange: [25, 30],
    questions: [
      {
        id: 25,
        text: 'Visibility of HR service performance dashboards:',
        options: [
          'No dashboards',
          'Manual reports prepared periodically',
          'Static dashboards with delayed data',
          'Real-time SLA and KPI dashboards',
          'Predictive dashboards with alerts and insights',
        ],
      },
      {
        id: 26,
        text: 'HR data centralization across systems:',
        options: [
          'Data scattered across systems',
          'Partial consolidation',
          'Central data repository with manual updates',
          'Fully centralized and standardized HR data',
          'Unified data lake with AI-driven insights',
        ],
      },
      {
        id: 27,
        text: 'Use of analytics for HR operational decisions:',
        options: [
          'Decisions are intuition-based',
          'Basic descriptive reporting',
          'Trend analysis used occasionally',
          'Analytics drives operational decisions',
          'Predictive and prescriptive analytics in use',
        ],
      },
      {
        id: 28,
        text: 'Measurement of cost per HR transaction/service:',
        options: [
          'No cost measurement',
          'High-level cost estimates',
          'Partial cost tracking',
          'Defined cost-per-service metrics',
          'Dynamic cost optimization and benchmarking',
        ],
      },
      {
        id: 29,
        text: 'Demand forecasting for HR services:',
        options: [
          'No forecasting',
          'Reactive staffing adjustments',
          'Historical trend-based planning',
          'Forecast-based capacity planning',
          'ML-based demand prediction',
        ],
      },
      {
        id: 30,
        text: 'Data governance and access controls:',
        options: [
          'No formal data governance',
          'Basic access controls',
          'Documented governance policies',
          'Enforced governance and audit trails',
          'Automated governance with risk alerts',
        ],
      },
    ],
  },
  {
    id: 6,
    name: 'Governance, Risk & SLA Maturity',
    shortName: 'Governance & Risk',
    description: 'Review SLA coverage, compliance automation, and risk management.',
    questionRange: [31, 36],
    questions: [
      {
        id: 31,
        text: 'Coverage of SLAs across HR services:',
        options: [
          'No SLAs defined',
          'SLAs defined for few services',
          'SLAs defined but inconsistently tracked',
          'SLAs tracked and reviewed regularly',
          'Predictive SLA management with alerts',
        ],
      },
      {
        id: 32,
        text: 'KPI monitoring and review cadence:',
        options: [
          'No KPI monitoring',
          'Ad-hoc KPI reviews',
          'Periodic KPI reporting',
          'Structured KPI governance reviews',
          'Real-time KPI monitoring with analytics',
        ],
      },
      {
        id: 33,
        text: 'Risk management framework in HR operations:',
        options: [
          'No formal risk framework',
          'Reactive risk handling',
          'Documented risk register',
          'Integrated risk controls in processes',
          'Predictive risk identification & mitigation',
        ],
      },
      {
        id: 34,
        text: 'Compliance automation in HR processes:',
        options: [
          'Manual compliance tracking',
          'Spreadsheet-based compliance',
          'System-assisted compliance checks',
          'Automated compliance workflows',
          'Continuous compliance monitoring with alerts',
        ],
      },
      {
        id: 35,
        text: 'Internal audit integration with HR operations:',
        options: [
          'No audit linkage',
          'Audit conducted manually',
          'Audit supported by reports',
          'Audit embedded in HR governance',
          'Continuous audit readiness via systems',
        ],
      },
      {
        id: 36,
        text: 'Vendor governance (if outsourcing is used):',
        options: [
          'No vendor governance',
          'Informal vendor reviews',
          'Contract-based reviews',
          'SLA-driven vendor management',
          'Performance analytics-based vendor governance',
        ],
      },
    ],
  },
  {
    id: 7,
    name: 'Financial Efficiency & ROI Intelligence',
    shortName: 'Financial Efficiency',
    description: 'Analyze cost transparency, benchmarking, and productivity tracking.',
    questionRange: [37, 42],
    questions: [
      {
        id: 37,
        text: 'Transparency of HR operational costs:',
        options: [
          'No cost visibility',
          'High-level budget view',
          'Cost visibility by function',
          'Cost visibility by service',
          'Real-time cost analytics',
        ],
      },
      {
        id: 38,
        text: 'Cost benchmarking against peers:',
        options: [
          'No benchmarking',
          'Informal comparisons',
          'Periodic benchmarking exercises',
          'Structured benchmarking framework',
          'Continuous benchmark-driven optimization',
        ],
      },
      {
        id: 39,
        text: 'ROI measurement of Shared Services initiatives:',
        options: [
          'ROI not measured',
          'Qualitative ROI discussion',
          'Partial ROI calculation',
          'Formal ROI framework',
          'Dynamic ROI tracking and forecasting',
        ],
      },
      {
        id: 40,
        text: 'Productivity tracking per HR FTE:',
        options: [
          'No productivity metrics',
          'Activity-based tracking',
          'Output-based tracking',
          'Efficiency metrics defined',
          'AI-driven productivity optimization',
        ],
      },
      {
        id: 41,
        text: 'Budget forecasting accuracy:',
        options: [
          'Reactive budgeting',
          'Historical budgeting',
          'Trend-based forecasting',
          'Forecast-driven budgeting',
          'Predictive budget modeling',
        ],
      },
      {
        id: 42,
        text: 'Cost optimization capability in HR:',
        options: [
          'No optimization efforts',
          'One-time cost cutting',
          'Periodic optimization initiatives',
          'Continuous cost optimization',
          'Intelligent cost optimization engine',
        ],
      },
    ],
  },
  {
    id: 8,
    name: 'Change Readiness & Transformation',
    shortName: 'Change Readiness',
    description: 'Gauge leadership sponsorship, change management, and digital capability.',
    questionRange: [43, 48],
    questions: [
      {
        id: 43,
        text: 'Leadership sponsorship for Shared Services:',
        options: [
          'No leadership support',
          'Limited support',
          'Verbal endorsement',
          'Active sponsorship',
          'Leadership-driven transformation agenda',
        ],
      },
      {
        id: 44,
        text: 'Change management maturity:',
        options: [
          'No change framework',
          'Ad-hoc change efforts',
          'Structured change planning',
          'Formal change management program',
          'Data-driven, adaptive change model',
        ],
      },
      {
        id: 45,
        text: 'Stakeholder alignment across business units:',
        options: [
          'Misaligned stakeholders',
          'Partial alignment',
          'Alignment with resistance',
          'Strong alignment',
          'Shared transformation ownership',
        ],
      },
      {
        id: 46,
        text: 'Digital capability of HR teams:',
        options: [
          'Low digital literacy',
          'Basic tool usage',
          'Moderate digital skills',
          'Strong digital proficiency',
          'Advanced digital & AI capability',
        ],
      },
      {
        id: 47,
        text: 'Resistance management effectiveness:',
        options: [
          'Resistance unmanaged',
          'Reactive handling',
          'Planned mitigation',
          'Proactive resistance management',
          'Predictive resistance modeling',
        ],
      },
      {
        id: 48,
        text: 'Transformation governance / PMO:',
        options: [
          'No governance structure',
          'Informal oversight',
          'Temporary PMO',
          'Dedicated transformation PMO',
          'Enterprise digital transformation office',
        ],
      },
    ],
  },
  {
    id: 9,
    name: 'Agentic HR Digital Capability',
    shortName: 'Agentic Capability',
    description: 'Explore AI-driven workflows, intelligent routing, and autonomous capabilities.',
    questionRange: [49, 54],
    isAgentic: true,
    questions: [
      {
        id: 49,
        text: 'AI-driven workflow recommendations:',
        options: [
          'No AI recommendations',
          'Rule-based suggestions',
          'Data-driven recommendations',
          'AI-assisted optimization',
          'Self-learning workflow engine',
        ],
      },
      {
        id: 50,
        text: 'Intelligent ticket routing capability:',
        options: [
          'Manual routing',
          'Rule-based routing',
          'Semi-automated routing',
          'AI-assisted routing',
          'Autonomous routing with learning',
        ],
      },
      {
        id: 51,
        text: 'SLA breach prediction:',
        options: [
          'No prediction',
          'Manual tracking',
          'Threshold-based alerts',
          'Predictive alerts',
          'Autonomous prevention actions',
        ],
      },
      {
        id: 52,
        text: 'Knowledge engine intelligence:',
        options: [
          'Static documents',
          'Searchable knowledge base',
          'Context-based suggestions',
          'AI-recommended knowledge',
          'Self-learning knowledge engine',
        ],
      },
      {
        id: 53,
        text: 'Demand forecasting using ML:',
        options: [
          'No forecasting',
          'Historical analysis',
          'Trend-based forecasting',
          'Advanced analytics forecasting',
          'ML-based demand prediction',
        ],
      },
      {
        id: 54,
        text: 'Autonomous HR case resolution:',
        options: [
          'Fully manual resolution',
          'Assisted resolution',
          'Partial automation',
          'High automation with oversight',
          'Fully autonomous HR service resolution',
        ],
      },
    ],
  },
];
