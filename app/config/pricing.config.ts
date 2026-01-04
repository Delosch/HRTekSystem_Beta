/**
 * Pricing Configuration for HR Tek Systems
 * 
 * Defines subscription tiers, engine pricing, and pricing factors
 */

export interface SubscriptionTier {
    id: string;
    name: string;
    employeeMin: number;
    employeeMax: number | null;
    annualFee: number;
    includedEngines: number;
    features: string[];
    isCustom: boolean;
}

export interface EnginePricing {
    id: string;
    name: string;
    basePrice: number;
    description: string;
    category: string;
}

export interface PricingFactor {
    type: string;
    label: string;
    options: {
        value: string;
        multiplier: number;
        description: string;
    }[];
}

// Subscription Tiers
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
    {
        id: "starter",
        name: "Starter",
        employeeMin: 0,
        employeeMax: 250,
        annualFee: 0,
        includedEngines: 0,
        features: ["Dashboard Access", "Basic Reports", "Email Support"],
        isCustom: false
    },
    {
        id: "growth",
        name: "Growth",
        employeeMin: 250,
        employeeMax: 750,
        annualFee: 300000,
        includedEngines: 1,
        features: ["1 Engine Included", "Dashboard Access", "Standard Support", "Export Reports"],
        isCustom: false
    },
    {
        id: "standard",
        name: "Standard",
        employeeMin: 751,
        employeeMax: 1500,
        annualFee: 500000,
        includedEngines: 2,
        features: ["2 Engines Included", "Advanced Analytics", "Priority Support", "API Access"],
        isCustom: false
    },
    {
        id: "professional",
        name: "Professional",
        employeeMin: 1501,
        employeeMax: 5000,
        annualFee: 750000,
        includedEngines: 3,
        features: ["3 Engines Included", "Custom Integrations", "Dedicated Support", "White-label Reports"],
        isCustom: false
    },
    {
        id: "enterprise",
        name: "Enterprise",
        employeeMin: 5001,
        employeeMax: 20000,
        annualFee: 1000000,
        includedEngines: 5,
        features: ["All Engines Included", "24x7 Support", "Custom Development", "SLA Guarantee"],
        isCustom: false
    },
    {
        id: "global",
        name: "Global",
        employeeMin: 20001,
        employeeMax: null,
        annualFee: 1200000,
        includedEngines: 5,
        features: ["All Engines + Advisory", "Global Support", "Multi-region Deployment", "Executive Consulting"],
        isCustom: true
    }
];

// Individual Engine Pricing
export const ENGINE_PRICING: EnginePricing[] = [
    {
        id: "hr-tech-maturity",
        name: "HR Tech Maturity Assessment",
        basePrice: 40000,
        description: "Complete digital diagnosis of HR capabilities, processes, and tech gaps",
        category: "assessment"
    },
    {
        id: "digital-roadmap",
        name: "Digital HR Roadmap Generator",
        basePrice: 45000,
        description: "Custom 12-18 month actionable digital HR roadmap",
        category: "strategy"
    },
    {
        id: "hcm-vendor-fit",
        name: "HCM Vendor Fit Engine",
        basePrice: 35000,
        description: "Personalized HCM vendor recommendations and shortlist",
        category: "selection"
    },
    {
        id: "shared-services",
        name: "SSC/COE Shared Service Planner",
        basePrice: 45000,
        description: "Shared services operating model design with capacity analysis",
        category: "operations"
    },
    {
        id: "change-management",
        name: "EI Change Management Analysis",
        basePrice: 45000,
        description: "Emotionally intelligent change strategy and stakeholder alignment",
        category: "transformation"
    }
];

// Bundle Pricing
export const BUNDLE_PRICING = {
    allEngines: {
        name: "All 5 Engines Bundle",
        regularPrice: 210000, // Sum of individual prices
        bundlePrice: 185000,
        savings: 25000,
        engines: ENGINE_PRICING.map(e => e.id)
    }
};

// Dynamic Pricing Factors
export const PRICING_FACTORS: PricingFactor[] = [
    {
        type: "region",
        label: "Region / Income Level",
        options: [
            { value: "high-income", multiplier: 0.30, description: "US, UAE, EU, Singapore" },
            { value: "middle-income", multiplier: 0.00, description: "India, Brazil, South Africa" },
            { value: "low-income", multiplier: -0.20, description: "Developing Nations" }
        ]
    },
    {
        type: "company-size",
        label: "Company Size",
        options: [
            { value: "small", multiplier: 0.00, description: "1-200 employees" },
            { value: "medium", multiplier: 0.15, description: "201-1000 employees" },
            { value: "large", multiplier: 0.30, description: "1001-5000 employees" },
            { value: "enterprise", multiplier: 0.50, description: "5000+ employees" }
        ]
    },
    {
        type: "net-worth",
        label: "Company Net Worth / Revenue",
        options: [
            { value: "tier1", multiplier: 0.00, description: "< ₹80 Cr" },
            { value: "tier2", multiplier: 0.20, description: "₹80 Cr - ₹800 Cr" },
            { value: "tier3", multiplier: 0.40, description: "₹800 Cr - ₹8,000 Cr" },
            { value: "tier4", multiplier: 0.60, description: "> ₹8,000 Cr" }
        ]
    },
    {
        type: "industry",
        label: "Industry Sector",
        options: [
            { value: "bfsi-healthcare-govt", multiplier: 0.25, description: "BFSI / Healthcare / Government" },
            { value: "manufacturing-retail", multiplier: 0.00, description: "Manufacturing / Retail" },
            { value: "startups-ngos", multiplier: -0.10, description: "Startups / NGOs" }
        ]
    },
    {
        type: "maturity",
        label: "Digital Maturity Level",
        options: [
            { value: "low", multiplier: 0.25, description: "Manual/Excel-driven" },
            { value: "medium", multiplier: 0.15, description: "Legacy HCMs" },
            { value: "high", multiplier: 0.00, description: "Modern HCM (SAP/Workday)" }
        ]
    },
    {
        type: "modules",
        label: "Number of Modules",
        options: [
            { value: "1", multiplier: 0.00, description: "1 module" },
            { value: "2", multiplier: 0.10, description: "2 modules" },
            { value: "3", multiplier: 0.20, description: "3 modules" },
            { value: "4", multiplier: 0.30, description: "All 4 modules" }
        ]
    },
    {
        type: "complexity",
        label: "Implementation Complexity",
        options: [
            { value: "single", multiplier: 0.00, description: "Single-country" },
            { value: "multi", multiplier: 0.25, description: "Multi-country (2-4)" },
            { value: "global", multiplier: 0.40, description: "Global spread (5+)" }
        ]
    },
    {
        type: "support",
        label: "Support Model",
        options: [
            { value: "standard", multiplier: 0.00, description: "Standard Email/Portal" },
            { value: "dedicated", multiplier: 0.15, description: "Dedicated Consultant" },
            { value: "24x7", multiplier: 0.30, description: "24x7 Priority Support" }
        ]
    },
    {
        type: "engagement",
        label: "Engagement Type",
        options: [
            { value: "one-time", multiplier: 0.00, description: "One-time Advisory" },
            { value: "transformation", multiplier: 0.25, description: "Ongoing Transformation" },
            { value: "retainer", multiplier: -0.15, description: "Annual Retainer" }
        ]
    },
    {
        type: "urgency",
        label: "Project Urgency",
        options: [
            { value: "standard", multiplier: 0.00, description: "Standard (3-6 months)" },
            { value: "fast-track", multiplier: 0.25, description: "Fast Track (<3 months)" },
            { value: "ultra-fast", multiplier: 0.50, description: "Ultra Fast (<6 weeks)" }
        ]
    },
    {
        type: "workforce",
        label: "Workforce Profile",
        options: [
            { value: "white-collar", multiplier: 0.00, description: "White-collar only" },
            { value: "mixed", multiplier: 0.20, description: "Mixed (white + blue collar)" }
        ]
    }
];

// Tax Rates
export const TAX_RATES = {
    india: {
        gst: 0.18,
        description: "GST @18%"
    },
    export: {
        gst: 0.00,
        description: "Zero-rated export (LUT filed)"
    }
};

// Currency Exchange (Base rates - should be fetched from API in production)
export const CURRENCY_RATES = {
    INR: 1.00,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    AED: 0.044
};

