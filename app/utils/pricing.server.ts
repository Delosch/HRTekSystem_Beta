
export interface PricingTier {
    id: string;
    name: string;
    description: string;
    priceINR: string;
    priceUSD: string;
    period: string;
    features: string[];
    cta: string;
    ctaLink: string;
    recommended?: boolean;
    basePrice: number;
}

export const PRICING_TIERS: Record<string, PricingTier> = {
    ESSENTIALS: {
        id: "essentials",
        name: "Advisory Essentials",
        description: "For mid-size enterprises (< 500 employees)",
        priceINR: "Contact Us",
        priceUSD: "for pricing",
        period: "",
        features: [
            "Aggregation from all HR-Tek modules",
            "Interpretation Layer (maturity, gaps, readiness)",
            "Standard transformation insights",
            "CXO summary dashboard",
            "Confidence & explainability indicators"
        ],
        cta: "Contact Sales",
        ctaLink: "/contact",
        basePrice: 1200000
    },
    TRANSFORMATION: {
        id: "transformation",
        name: "Transformation Intelligence",
        description: "For enterprises (500-5,000 employees)",
        priceINR: "Contact Us",
        priceUSD: "for pricing",
        period: "",
        features: [
            "Everything in Essentials",
            "Transformation Mapping Layer",
            "Priority & dependency engine",
            "Advisory & recommendation engine",
            "ROI-based digitization guidance",
            "Risk-aware 'Do Not Transform Yet' flags",
            "Operating model implications",
            "Quarterly transformation intelligence refresh"
        ],
        cta: "Contact Sales",
        ctaLink: "/contact",
        recommended: true,
        basePrice: 2800000
    },
    ENTERPRISE: {
        id: "enterprise",
        name: "Enterprise Cognitive Advisory",
        description: "For global transformation programs (> 5,000 employees)",
        priceINR: "Contact Us",
        priceUSD: "for pricing",
        period: "",
        features: [
            "Everything in Transformation",
            "Scenario & simulation modelling",
            "Multi-country / multi-entity intelligence",
            "Executive decision cockpit",
            "Advisory logic customization",
            "Agentic HR AI workflows (human-in-loop)",
            "Board-ready outputs",
            "Priority access & SLA"
        ],
        cta: "Contact Sales",
        ctaLink: "/contact",
        basePrice: 0
    }
};

export function getPricingForCompany(employeeCount: number = 0): PricingTier {
    if (employeeCount > 0 && employeeCount < 500) {
        return PRICING_TIERS.ESSENTIALS;
    }
    if (employeeCount >= 500 && employeeCount <= 5000) {
        return PRICING_TIERS.TRANSFORMATION;
    }
    if (employeeCount > 5000) {
        return PRICING_TIERS.ENTERPRISE;
    }

    // Default recommendation if count is 0 or unknown
    return PRICING_TIERS.TRANSFORMATION;
}
