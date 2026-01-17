import { ProposalPhase } from "~/models/proposal.model.server";

/**
 * Proposal Timeline Service
 * Estimates project timelines based on scope and company factors
 */

export interface TimelineFactors {
    companySize: "small" | "medium" | "large" | "enterprise";
    complexity: "low" | "medium" | "high";
    parallelExecution: boolean;
}

// Base timeline per engine (in months)
const ENGINE_TIMELINES: Record<string, number> = {
    "HR Tech Maturity Assessment": 1,
    "Digital HR Roadmap Generator": 2,
    "HCM Vendor Fit Engine": 2,
    "SSC/COE Shared Service Planner": 3,
    "EI Change Management Analysis": 2
};

const SIZE_ADJUSTMENTS = {
    small: 0,
    medium: 1,
    large: 2,
    enterprise: 3
};

const COMPLEXITY_ADJUSTMENTS = {
    low: 0,
    medium: 1,
    high: 2
};

/**
 * Estimate timeline for transformation
 */
export function estimateTimeline(
    selectedEngines: string[],
    factors: TimelineFactors
): {
    estimatedDuration: number;
    phases: ProposalPhase[];
} {
    // Calculate base duration
    let baseDuration = 0;
    selectedEngines.forEach(engineName => {
        baseDuration += ENGINE_TIMELINES[engineName] || 2;
    });

    // Apply adjustments
    const sizeAdjustment = SIZE_ADJUSTMENTS[factors.companySize];
    const complexityAdjustment = COMPLEXITY_ADJUSTMENTS[factors.complexity];

    let totalDuration = baseDuration + sizeAdjustment + complexityAdjustment;

    // Apply parallel execution discount
    if (factors.parallelExecution && selectedEngines.length > 1) {
        totalDuration = Math.ceil(totalDuration * 0.75); // 25% reduction
    }

    // Create phases
    const phases: ProposalPhase[] = [
        {
            name: "Discovery & Planning",
            duration: Math.ceil(totalDuration * 0.15),
            deliverables: [
                "Current state assessment",
                "Stakeholder interviews",
                "Detailed project plan",
                "Risk assessment"
            ]
        },
        {
            name: "Design & Configuration",
            duration: Math.ceil(totalDuration * 0.30),
            deliverables: [
                "Solution architecture",
                "Process design",
                "System configuration",
                "Integration planning"
            ]
        },
        {
            name: "Implementation",
            duration: Math.ceil(totalDuration * 0.35),
            deliverables: [
                "System deployment",
                "Data migration",
                "Integration execution",
                "Testing & validation"
            ]
        },
        {
            name: "Change Management & Training",
            duration: Math.ceil(totalDuration * 0.15),
            deliverables: [
                "Training materials",
                "User training sessions",
                "Change communication",
                "Adoption support"
            ]
        },
        {
            name: "Go-Live & Support",
            duration: Math.ceil(totalDuration * 0.05),
            deliverables: [
                "Production cutover",
                "Hypercare support",
                "Performance monitoring",
                "Post-implementation review"
            ]
        }
    ];

    return {
        estimatedDuration: totalDuration,
        phases
    };
}
