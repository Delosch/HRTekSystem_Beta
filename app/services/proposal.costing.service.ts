import { ENGINE_PRICING } from "~/config/pricing.config";

/**
 * Proposal Costing Service
 * Calculates transformation proposal costs based on various factors
 */

export interface CostingFactors {
    companySize: "small" | "medium" | "large" | "enterprise";
    complexity: "low" | "medium" | "high";
    supportLevel: "standard" | "dedicated" | "premium";
    urgency: "standard" | "fast" | "urgent";
}

export interface CostBreakdown {
    baseCost: number;
    multipliers: {
        size: number;
        complexity: number;
        support: number;
        urgency: number;
    };
    additionalCosts: Array<{ item: string; cost: number }>;
    subtotal: number;
    tax: number;
    totalCost: number;
}

const SIZE_MULTIPLIERS = {
    small: 1.0,
    medium: 1.2,
    large: 1.4,
    enterprise: 1.6
};

const COMPLEXITY_MULTIPLIERS = {
    low: 1.0,
    medium: 1.15,
    high: 1.3
};

const SUPPORT_MULTIPLIERS = {
    standard: 1.0,
    dedicated: 1.2,
    premium: 1.4
};

const URGENCY_MULTIPLIERS = {
    standard: 1.0,
    fast: 1.25,
    urgent: 1.5
};

/**
 * Calculate proposal cost
 */
export function calculateProposalCost(
    selectedEngines: string[],
    factors: CostingFactors
): CostBreakdown {
    // Calculate base cost from selected engines
    let baseCost = 0;
    selectedEngines.forEach(engineName => {
        const engine = ENGINE_PRICING.find(e => e.name === engineName);
        if (engine) {
            baseCost += engine.basePrice;
        }
    });

    // Apply multipliers
    const sizeMultiplier = SIZE_MULTIPLIERS[factors.companySize];
    const complexityMultiplier = COMPLEXITY_MULTIPLIERS[factors.complexity];
    const supportMultiplier = SUPPORT_MULTIPLIERS[factors.supportLevel];
    const urgencyMultiplier = URGENCY_MULTIPLIERS[factors.urgency];

    const totalMultiplier = sizeMultiplier * complexityMultiplier * supportMultiplier * urgencyMultiplier;

    // Additional costs
    const additionalCosts: Array<{ item: string; cost: number }> = [];

    if (factors.supportLevel === "dedicated") {
        additionalCosts.push({ item: "Dedicated Consultant", cost: 50000 });
    }

    if (factors.supportLevel === "premium") {
        additionalCosts.push({ item: "Premium Support Package", cost: 100000 });
    }

    if (factors.urgency === "urgent") {
        additionalCosts.push({ item: "Expedited Delivery", cost: 75000 });
    }

    const additionalTotal = additionalCosts.reduce((sum, item) => sum + item.cost, 0);

    // Calculate subtotal
    const subtotal = (baseCost * totalMultiplier) + additionalTotal;

    // Calculate tax (18% GST)
    const tax = subtotal * 0.18;

    // Total cost
    const totalCost = subtotal + tax;

    return {
        baseCost,
        multipliers: {
            size: sizeMultiplier,
            complexity: complexityMultiplier,
            support: supportMultiplier,
            urgency: urgencyMultiplier
        },
        additionalCosts,
        subtotal,
        tax,
        totalCost: Math.round(totalCost)
    };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string = "INR"): string {
    if (currency === "INR") {
        return `₹${amount.toLocaleString("en-IN")}`;
    }
    return `${currency} ${amount.toLocaleString()}`;
}
