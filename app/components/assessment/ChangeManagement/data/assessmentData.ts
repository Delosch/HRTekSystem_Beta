import { Section } from '../types/assessment';

export const assessmentSections: Section[] = [
    {
        id: 'section-1',
        title: 'Strategic & Business Case Readiness',
        shortTitle: 'Strategic Readiness',
        description: 'Evaluate the strength of your business case, strategic alignment, and financial planning.',
        indexMapping: 'SFRI',
        questions: [
            { id: 's1-q1', question: 'Business Case Maturity', weight: 0.25, options: [{ value: 0, label: 'No documented business case', description: 'Critical Risk' }, { value: 1, label: 'Informal justification only', description: 'Weak' }, { value: 2, label: 'Documented but not approved', description: 'Developing' }, { value: 3, label: 'Approved by leadership', description: 'Mature' }, { value: 4, label: 'Board-approved with financial validation', description: 'Best Practice' }] },
            { id: 's1-q2', question: 'Strategic Alignment', weight: 0.20, options: [{ value: 0, label: 'Isolated HR initiative', description: 'Critical Risk' }, { value: 1, label: 'Limited alignment to business strategy', description: 'Weak' }, { value: 2, label: 'Partially linked to enterprise goals', description: 'Developing' }, { value: 3, label: 'Clearly aligned to business priorities', description: 'Mature' }, { value: 4, label: 'Fully embedded in enterprise strategic roadmap', description: 'Best Practice' }] },
            { id: 's1-q3', question: 'ROI Definition', weight: 0.25, options: [{ value: 0, label: 'No ROI defined', description: 'Critical Risk' }, { value: 1, label: 'Qualitative benefits only', description: 'Weak' }, { value: 2, label: 'High-level financial estimates', description: 'Developing' }, { value: 3, label: 'Quantified ROI model', description: 'Mature' }, { value: 4, label: 'ROI tied to measurable KPIs and tracked', description: 'Best Practice' }] },
            { id: 's1-q4', question: 'Budget Coverage', weight: 0.20, options: [{ value: 0, label: 'Tech budget only', description: 'Critical Risk' }, { value: 1, label: 'Limited change budget', description: 'Weak' }, { value: 2, label: 'Budget for tech + training', description: 'Developing' }, { value: 3, label: 'Budget includes change, comms & reinforcement', description: 'Mature' }, { value: 4, label: 'Fully funded lifecycle (tech + change + sustainment)', description: 'Best Practice' }] },
            { id: 's1-q5', question: 'Financial Feasibility', weight: 0.10, options: [{ value: 0, label: 'High financial uncertainty', description: 'Critical Risk' }, { value: 1, label: 'Break-even unclear', description: 'Weak' }, { value: 2, label: '3+ year break-even projection', description: 'Developing' }, { value: 3, label: '2–3 year feasible break-even', description: 'Mature' }, { value: 4, label: '<2 year ROI with risk buffer', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-2',
        title: 'Executive Sponsorship & Leadership',
        shortTitle: 'Leadership',
        description: 'Assess the strength of executive sponsorship, governance, and leadership commitment.',
        indexMapping: 'LGI',
        questions: [
            { id: 's2-q1', question: 'Executive Sponsor Strength', weight: 0.35, options: [{ value: 0, label: 'No sponsor', description: 'Critical Risk' }, { value: 1, label: 'Nominal sponsor', description: 'Weak' }, { value: 2, label: 'Sponsor with limited involvement', description: 'Developing' }, { value: 3, label: 'Active sponsor with visibility', description: 'Mature' }, { value: 4, label: 'Highly influential sponsor driving adoption', description: 'Best Practice' }] },
            { id: 's2-q2', question: 'Leadership Accountability', weight: 0.25, options: [{ value: 0, label: 'No accountability', description: 'Critical Risk' }, { value: 1, label: 'Informal expectations', description: 'Weak' }, { value: 2, label: 'Partial KPI linkage', description: 'Developing' }, { value: 3, label: 'Adoption KPIs assigned', description: 'Mature' }, { value: 4, label: 'Performance-linked accountability', description: 'Best Practice' }] },
            { id: 's2-q3', question: 'Governance Maturity', weight: 0.25, options: [{ value: 0, label: 'No governance structure', description: 'Critical Risk' }, { value: 1, label: 'Ad hoc reviews', description: 'Weak' }, { value: 2, label: 'Steering committee formed', description: 'Developing' }, { value: 3, label: 'Structured governance cadence', description: 'Mature' }, { value: 4, label: 'Agile, data-driven governance with risk oversight', description: 'Best Practice' }] },
            { id: 's2-q4', question: 'Leadership Modeling', weight: 0.15, options: [{ value: 0, label: 'Leaders not using system', description: 'Critical Risk' }, { value: 1, label: 'Minimal usage', description: 'Weak' }, { value: 2, label: 'Occasional usage', description: 'Developing' }, { value: 3, label: 'Consistent usage', description: 'Mature' }, { value: 4, label: 'Leaders champion and model new behaviors', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-3',
        title: 'Organizational Change Capacity',
        shortTitle: 'Change Capacity',
        description: "Evaluate your organization's capacity to absorb change and cultural adaptability.",
        indexMapping: 'OCRI',
        questions: [
            { id: 's3-q1', question: 'Change Saturation Level', weight: 0.30, options: [{ value: 0, label: 'Overloaded (multiple simultaneous changes)', description: 'Critical Risk' }, { value: 1, label: 'High fatigue', description: 'Weak' }, { value: 2, label: 'Moderate fatigue', description: 'Developing' }, { value: 3, label: 'Manageable workload', description: 'Mature' }, { value: 4, label: 'Strong capacity for new change', description: 'Best Practice' }] },
            { id: 's3-q2', question: 'Past Transformation Success', weight: 0.25, options: [{ value: 0, label: 'Mostly failed initiatives', description: 'Critical Risk' }, { value: 1, label: 'Low adoption history', description: 'Weak' }, { value: 2, label: 'Mixed outcomes', description: 'Developing' }, { value: 3, label: 'Generally successful', description: 'Mature' }, { value: 4, label: 'Consistently high adoption track record', description: 'Best Practice' }] },
            { id: 's3-q3', question: 'Cultural Adaptability', weight: 0.25, options: [{ value: 0, label: 'Resistant culture', description: 'Critical Risk' }, { value: 1, label: 'Passive compliance', description: 'Weak' }, { value: 2, label: 'Cautiously adaptive', description: 'Developing' }, { value: 3, label: 'Proactive mindset', description: 'Mature' }, { value: 4, label: 'Innovation-driven culture', description: 'Best Practice' }] },
            { id: 's3-q4', question: 'Psychological Safety', weight: 0.20, options: [{ value: 0, label: 'Employees fear speaking up', description: 'Critical Risk' }, { value: 1, label: 'Limited openness', description: 'Weak' }, { value: 2, label: 'Selective openness', description: 'Developing' }, { value: 3, label: 'Generally open environment', description: 'Mature' }, { value: 4, label: 'High trust & transparent communication', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-4',
        title: 'HR Tech & Process Readiness',
        shortTitle: 'Tech Readiness',
        description: 'Assess process standardization, data quality, and IT-HR alignment.',
        indexMapping: 'DWRI',
        questions: [
            { id: 's4-q1', question: 'Process Standardization', weight: 0.35, options: [{ value: 0, label: 'Highly inconsistent processes', description: 'Critical Risk' }, { value: 1, label: 'Mostly manual and variable', description: 'Weak' }, { value: 2, label: 'Partially standardized', description: 'Developing' }, { value: 3, label: 'Standardized across units', description: 'Mature' }, { value: 4, label: 'Optimized & documented enterprise-wide', description: 'Best Practice' }] },
            { id: 's4-q2', question: 'Data Quality', weight: 0.35, options: [{ value: 0, label: 'Poor, unvalidated data', description: 'Critical Risk' }, { value: 1, label: 'Fragmented data', description: 'Weak' }, { value: 2, label: 'Partially cleansed', description: 'Developing' }, { value: 3, label: 'Cleaned & validated', description: 'Mature' }, { value: 4, label: 'Governance-controlled master data', description: 'Best Practice' }] },
            { id: 's4-q3', question: 'IT–HR Alignment', weight: 0.30, options: [{ value: 0, label: 'No alignment', description: 'Critical Risk' }, { value: 1, label: 'Reactive coordination', description: 'Weak' }, { value: 2, label: 'Working alignment', description: 'Developing' }, { value: 3, label: 'Strategic collaboration', description: 'Mature' }, { value: 4, label: 'Fully integrated transformation partnership', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-5',
        title: 'Workforce Digital Fluency',
        shortTitle: 'Digital Fluency',
        description: 'Evaluate digital literacy, automation preparedness, and AI readiness.',
        indexMapping: 'DWRI',
        questions: [
            { id: 's5-q1', question: 'Digital Literacy', weight: 0.40, options: [{ value: 0, label: 'Very low', description: 'Critical Risk' }, { value: 1, label: 'Basic', description: 'Weak' }, { value: 2, label: 'Intermediate', description: 'Developing' }, { value: 3, label: 'Advanced', description: 'Mature' }, { value: 4, label: 'Digitally fluent workforce', description: 'Best Practice' }] },
            { id: 's5-q2', question: 'Automation Impact Preparedness', weight: 0.35, options: [{ value: 0, label: 'No analysis done', description: 'Critical Risk' }, { value: 1, label: 'High impact, no plan', description: 'Weak' }, { value: 2, label: 'Some impact awareness', description: 'Developing' }, { value: 3, label: 'Reskilling defined', description: 'Mature' }, { value: 4, label: 'Proactive workforce transition plan', description: 'Best Practice' }] },
            { id: 's5-q3', question: 'AI Anxiety Management', weight: 0.25, options: [{ value: 0, label: 'High visible fear', description: 'Critical Risk' }, { value: 1, label: 'Moderate anxiety', description: 'Weak' }, { value: 2, label: 'Some concerns', description: 'Developing' }, { value: 3, label: 'Transparent communication', description: 'Mature' }, { value: 4, label: 'Strong AI-positive culture', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-6',
        title: 'Stakeholder & Resistance Mapping',
        shortTitle: 'Stakeholder Mapping',
        description: 'Assess stakeholder identification and resistance management strategies.',
        indexMapping: 'OCRI',
        questions: [
            { id: 's6-q1', question: 'Stakeholder Identification', weight: 0.50, options: [{ value: 0, label: 'Not mapped', description: 'Critical Risk' }, { value: 1, label: 'Partially identified', description: 'Weak' }, { value: 2, label: 'Most stakeholders mapped', description: 'Developing' }, { value: 3, label: 'Full mapping completed', description: 'Mature' }, { value: 4, label: 'Power–influence grid with strategy', description: 'Best Practice' }] },
            { id: 's6-q2', question: 'Resistance Planning', weight: 0.50, options: [{ value: 0, label: 'No strategy', description: 'Critical Risk' }, { value: 1, label: 'Reactive only', description: 'Weak' }, { value: 2, label: 'Informal mitigation', description: 'Developing' }, { value: 3, label: 'Targeted resistance plans', description: 'Mature' }, { value: 4, label: 'Predictive resistance analytics', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-7',
        title: 'Communication Intelligence',
        shortTitle: 'Communication',
        description: 'Evaluate change narrative and communication channel effectiveness.',
        indexMapping: 'ASII',
        questions: [
            { id: 's7-q1', question: 'Change Narrative', weight: 0.50, options: [{ value: 0, label: 'No clear story', description: 'Critical Risk' }, { value: 1, label: 'Technical explanation only', description: 'Weak' }, { value: 2, label: 'Business benefit message', description: 'Developing' }, { value: 3, label: 'Compelling transformation story', description: 'Mature' }, { value: 4, label: 'Personalized and role-based narrative', description: 'Best Practice' }] },
            { id: 's7-q2', question: 'Channel Strategy', weight: 0.50, options: [{ value: 0, label: 'Email only', description: 'Critical Risk' }, { value: 1, label: 'Limited channels', description: 'Weak' }, { value: 2, label: 'Multi-channel', description: 'Developing' }, { value: 3, label: 'Multi-channel + engagement', description: 'Mature' }, { value: 4, label: 'Data-driven omnichannel communication', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-8',
        title: 'Learning & Adoption Engineering',
        shortTitle: 'Learning & Adoption',
        description: 'Assess training strategy and change champion network effectiveness.',
        indexMapping: 'ASII',
        questions: [
            { id: 's8-q1', question: 'Training Strategy', weight: 0.60, options: [{ value: 0, label: 'One-time training', description: 'Critical Risk' }, { value: 1, label: 'Basic sessions', description: 'Weak' }, { value: 2, label: 'Structured program', description: 'Developing' }, { value: 3, label: 'Role-based & workflow aligned', description: 'Mature' }, { value: 4, label: 'Continuous, embedded learning ecosystem', description: 'Best Practice' }] },
            { id: 's8-q2', question: 'Change Champions', weight: 0.40, options: [{ value: 0, label: 'None', description: 'Critical Risk' }, { value: 1, label: 'Informal supporters', description: 'Weak' }, { value: 2, label: 'Identified but untrained', description: 'Developing' }, { value: 3, label: 'Structured champion network', description: 'Mature' }, { value: 4, label: 'Incentivized and performance-linked champions', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-9',
        title: 'Governance & Agile Execution',
        shortTitle: 'Governance',
        description: 'Evaluate change plan formalization and risk tracking mechanisms.',
        indexMapping: 'LGI',
        questions: [
            { id: 's9-q1', question: 'Change Plan Formalization', weight: 0.50, options: [{ value: 0, label: 'No documented plan', description: 'Critical Risk' }, { value: 1, label: 'Draft plan', description: 'Weak' }, { value: 2, label: 'Approved plan', description: 'Developing' }, { value: 3, label: 'Risk-integrated plan', description: 'Mature' }, { value: 4, label: 'Agile, milestone-driven plan with KPIs', description: 'Best Practice' }] },
            { id: 's9-q2', question: 'Risk Tracking', weight: 0.50, options: [{ value: 0, label: 'No tracking', description: 'Critical Risk' }, { value: 1, label: 'Informal tracking', description: 'Weak' }, { value: 2, label: 'Risk log exists', description: 'Developing' }, { value: 3, label: 'Regularly reviewed', description: 'Mature' }, { value: 4, label: 'Real-time risk dashboard', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-10',
        title: 'Measurement & Predictive Intelligence',
        shortTitle: 'Measurement',
        description: 'Assess adoption tracking and KPI integration capabilities.',
        indexMapping: 'ASII',
        questions: [
            { id: 's10-q1', question: 'Adoption Tracking', weight: 0.50, options: [{ value: 0, label: 'Not tracked', description: 'Critical Risk' }, { value: 1, label: 'Manual tracking', description: 'Weak' }, { value: 2, label: 'Basic reporting', description: 'Developing' }, { value: 3, label: 'Dashboard-based tracking', description: 'Mature' }, { value: 4, label: 'Real-time predictive analytics', description: 'Best Practice' }] },
            { id: 's10-q2', question: 'KPI Integration', weight: 0.50, options: [{ value: 0, label: 'No KPI linkage', description: 'Critical Risk' }, { value: 1, label: 'Limited HR metrics', description: 'Weak' }, { value: 2, label: 'Business KPIs linked', description: 'Developing' }, { value: 3, label: 'Cross-functional KPIs', description: 'Mature' }, { value: 4, label: 'Executive-level performance integrated', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-11',
        title: 'Sustainability & Reinforcement',
        shortTitle: 'Sustainability',
        description: 'Evaluate reinforcement plans and behavior integration strategies.',
        indexMapping: 'ASII',
        questions: [
            { id: 's11-q1', question: 'Reinforcement Plan', weight: 0.50, options: [{ value: 0, label: 'None', description: 'Critical Risk' }, { value: 1, label: 'Informal reminders', description: 'Weak' }, { value: 2, label: '30-day follow-up', description: 'Developing' }, { value: 3, label: '30/60/90 day structured plan', description: 'Mature' }, { value: 4, label: 'Continuous reinforcement engine', description: 'Best Practice' }] },
            { id: 's11-q2', question: 'Behavior Integration', weight: 0.50, options: [{ value: 0, label: 'Not integrated', description: 'Critical Risk' }, { value: 1, label: 'Informal expectation', description: 'Weak' }, { value: 2, label: 'Included in SOP', description: 'Developing' }, { value: 3, label: 'Linked to performance', description: 'Mature' }, { value: 4, label: 'Embedded in culture & rewards', description: 'Best Practice' }] }
        ]
    },
    {
        id: 'section-12',
        title: 'Financial & Operational Stress Test',
        shortTitle: 'Stress Test',
        description: 'Assess operational disruption risk and long-term financial sustainability.',
        indexMapping: 'SFRI',
        questions: [
            { id: 's12-q1', question: 'Operational Disruption Risk', weight: 0.50, options: [{ value: 0, label: 'Severe risk', description: 'Critical Risk' }, { value: 1, label: 'High risk', description: 'Weak' }, { value: 2, label: 'Moderate risk', description: 'Developing' }, { value: 3, label: 'Controlled risk', description: 'Mature' }, { value: 4, label: 'Well-mitigated with contingency', description: 'Best Practice' }] },
            { id: 's12-q2', question: 'Long-Term Financial Sustainability', weight: 0.50, options: [{ value: 0, label: 'Unsustainable', description: 'Critical Risk' }, { value: 1, label: 'Financial strain likely', description: 'Weak' }, { value: 2, label: 'Break-even uncertain', description: 'Developing' }, { value: 3, label: 'Sustainable', description: 'Mature' }, { value: 4, label: 'Strong long-term profitability projection', description: 'Best Practice' }] }
        ]
    }
];
