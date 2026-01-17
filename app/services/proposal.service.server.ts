import { v4 as uuidv4 } from "uuid";
import { createProposal, Proposal } from "~/models/proposal.model.server";
import { calculateProposalCost, CostingFactors } from "./proposal.costing.service.server";
import { estimateTimeline, TimelineFactors } from "./proposal.timeline.service.server";
import { completedEngine } from "~/models/engine.model.server";

/**
 * Proposal Service
 * Main service for generating transformation proposals
 */

export interface ProposalGenerationParams {
    companyId: string;
    companySize: "small" | "medium" | "large" | "enterprise";
    complexity: "low" | "medium" | "high";
    supportLevel?: "standard" | "dedicated" | "premium";
    urgency?: "standard" | "fast" | "urgent";
    parallelExecution?: boolean;
}

/**
 * Generate transformation proposal
 */
export async function generateProposal(
    params: ProposalGenerationParams
): Promise<{ success: boolean; proposal?: Proposal; message: string }> {
    try {
        // Get completed engines for the company
        const completedEngines = await completedEngine(params.companyId);

        if (completedEngines.length < 3) {
            return {
                success: false,
                message: `Company needs to complete at least 3 engines. Currently completed: ${completedEngines.length}`
            };
        }

        // Prepare costing factors
        const costingFactors: CostingFactors = {
            companySize: params.companySize,
            complexity: params.complexity,
            supportLevel: params.supportLevel || "standard",
            urgency: params.urgency || "standard"
        };

        // Calculate costs
        const costBreakdown = calculateProposalCost(completedEngines, costingFactors);

        // Prepare timeline factors
        const timelineFactors: TimelineFactors = {
            companySize: params.companySize,
            complexity: params.complexity,
            parallelExecution: params.parallelExecution || false
        };

        // Estimate timeline
        const timeline = estimateTimeline(completedEngines, timelineFactors);

        // Generate transformation scope
        const transformationScope = generateTransformationScope(completedEngines);

        // Create proposal
        const proposalId = uuidv4();
        const proposal = await createProposal({
            proposalId,
            companyId: params.companyId,
            status: "draft",
            selectedEngines: completedEngines,
            transformationScope,
            baseCost: costBreakdown.baseCost,
            additionalCosts: costBreakdown.additionalCosts,
            totalCost: costBreakdown.totalCost,
            currency: "INR",
            estimatedDuration: timeline.estimatedDuration,
            phases: timeline.phases,
            generatedAt: new Date().toISOString(),
            generatedBy: "system"
        });

        return {
            success: true,
            proposal,
            message: "Proposal generated successfully"
        };
    } catch (error) {
        console.error("Error generating proposal:", error);
        return {
            success: false,
            message: "Failed to generate proposal"
        };
    }
}

/**
 * Generate transformation scope description
 */
function generateTransformationScope(selectedEngines: string[]): string {
    const scopeParts: string[] = [
        "Comprehensive HR Digital Transformation Program including:"
    ];

    if (selectedEngines.includes("HR Tech Maturity Assessment") || selectedEngines.includes("HR Technology Maturity Analysis")) {
        scopeParts.push("- Digital maturity assessment and gap analysis");
    }

    if (selectedEngines.includes("Digital HR Roadmap Generator") || selectedEngines.includes("HR Transformation Roadmap Generator")) {
        scopeParts.push("- Strategic roadmap development and implementation planning");
    }

    if (selectedEngines.includes("HCM Vendor Fit Engine")) {
        scopeParts.push("- HCM vendor selection and implementation support");
    }

    if (selectedEngines.includes("SSC/COE Shared Service Planner") || selectedEngines.includes("Shared Service Designer")) {
        scopeParts.push("- Shared services model design and implementation");
    }

    if (selectedEngines.includes("EI Change Management Analysis") || selectedEngines.includes("Intelligent Change Management")) {
        scopeParts.push("- Change management strategy and execution");
    }

    scopeParts.push("\nThe transformation will be delivered in phased approach with dedicated support throughout the journey.");

    return scopeParts.join("\n");
}

/**
 * Auto-generate proposal when company becomes eligible
 */
export async function autoGenerateProposal(
    companyId: string
): Promise<{ success: boolean; proposalId?: string; message: string }> {
    try {
        // Use default parameters for auto-generation
        const params: ProposalGenerationParams = {
            companyId,
            companySize: "medium", // Default, can be updated by admin
            complexity: "medium",
            supportLevel: "standard",
            urgency: "standard",
            parallelExecution: true
        };

        const result = await generateProposal(params);

        if (result.success && result.proposal) {
            console.log(`✅ Auto-generated proposal ${result.proposal.proposalId} for company ${companyId}`);
            return {
                success: true,
                proposalId: result.proposal.proposalId,
                message: "Proposal auto-generated successfully"
            };
        }

        return {
            success: false,
            message: result.message
        };
    } catch (error) {
        console.error("Error in auto-generate proposal:", error);
        return {
            success: false,
            message: "Failed to auto-generate proposal"
        };
    }
}
