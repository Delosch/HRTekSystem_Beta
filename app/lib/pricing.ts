/**
 * Pricing Module - Updated with New Pricing Structure
 * 
 * This file maintains backward compatibility with existing code
 * while integrating the new comprehensive pricing system
 */

import {
    SUBSCRIPTION_TIERS,
    ENGINE_PRICING,
    BUNDLE_PRICING,
    PRICING_FACTORS,
    TAX_RATES
} from "~/config/pricing.config";

import {
    calculateDynamicPrice,
    calculateEnginePurchase,
    formatCurrency,
    getTierByEmployeeCount
} from "~/services/pricing.calculator";

// ==========================================
// LEGACY PRICING LOGIC (For Backward Compatibility)
// ==========================================

interface ResponseSheet {
    company_size?: string;
    industry_sector?: string;
    annual_revenue?: string;
    business_model?: string[];
    digital_transformation_stage?: string;
}

type RecommendationScores = Map<string, number>;

// Updated base prices to match new pricing structure
const MODULE_BASE_PRICES: Record<string, number> = {
    "HR Transformation Roadmap Generator": 45000,  // Updated from 30000
    "HCM Vendor Fit Engine": 35000,                // Updated from 20000
    "Shared Service Designer": 45000,              // Updated from 25000
    "Intelligent Change Management": 45000,        // Updated from 30000
    "HR Technology Maturity Analysis": 40000,      // Updated from 25000
    "HR Digital Transformation": 35000,
    "Digital Maturity Assessment": 35000,
};

const HIGH_INCOME_COUNTRIES: Set<string> = new Set(["US", "AE", "SG", "DE", "FR", "GB", "CA", "AU", "JP"]);
const MIDDLE_INCOME_COUNTRIES: Set<string> = new Set(["IN", "BR", "ZA", "CN", "MX", "RU"]);

const SIZE_FACTOR_MAPPING: Record<string, number> = {
    "Less than 50": 1.0,
    "50-250": 1.0,
    "251-1000": 1.15,
    "1000+": 1.30,
    "201–1000": 1.15,
};

const REVENUE_FACTOR_MAPPING: Record<string, number> = {
    "Less than ₹10 Crores": 1.0,
    "₹10 Crores - ₹100 Crores": 1.20,
    "₹100 Crores - ₹1,000 Crores": 1.40,
    "₹1,000 Crores - ₹10,000 Crores": 1.40,
    "More than ₹10,000 Crores": 1.60,
    "Prefer not to disclose": 1.0,
};

const INDUSTRY_FACTOR_MAPPING: Record<string, number> = {
    "Financial Services": 1.25,
    "Healthcare": 1.25,
    "Government": 1.25,
    "Manufacturing": 1.0,
    "Retail": 1.0,
    "Non-profit": 0.90,
    "Technology": 1.0,
    "Education": 1.0,
    "Other": 1.0,
};

/**
 * Legacy pricing calculation function (maintained for backward compatibility)
 * 
 * @deprecated Use calculateDynamicPrice from pricing.calculator.ts for new implementations
 */
export function calculateFinalPrice(
    moduleName: string,
    responseSheet: ResponseSheet,
    countryCode: string,
    recommendationScores: RecommendationScores
): number {
    try {
        const basePrice = MODULE_BASE_PRICES[moduleName];
        if (basePrice === undefined) {
            throw new Error(`Invalid module name provided: ${moduleName}`);
        }

        const countryUpper = countryCode.toUpperCase();
        let regionFactor = 1.0;
        if (HIGH_INCOME_COUNTRIES.has(countryUpper)) regionFactor = 1.30;
        else if (!MIDDLE_INCOME_COUNTRIES.has(countryUpper)) regionFactor = 0.80;

        const sizeFactor = SIZE_FACTOR_MAPPING[responseSheet.company_size ?? ""] ?? 1.0;
        const networthFactor = REVENUE_FACTOR_MAPPING[responseSheet.annual_revenue ?? ""] ?? 1.0;
        const industryFactor = INDUSTRY_FACTOR_MAPPING[responseSheet.industry_sector ?? ""] ?? 1.0;

        const maturityScore = parseInt(responseSheet.digital_transformation_stage ?? "5", 10);
        let maturityFactor = 1.0;
        if (maturityScore <= 1) maturityFactor = 1.25;
        else if (maturityScore <= 3) maturityFactor = 1.15;

        const score = recommendationScores.get(moduleName) ?? 0;
        let recommendationFactor: number;
        if (score > 10) {
            recommendationFactor = 1.20;
        } else if (score > 5) {
            recommendationFactor = 1.10;
        } else if (score > 0) {
            recommendationFactor = 1.0;
        } else {
            recommendationFactor = 0.90;
        }

        const finalPrice =
            basePrice *
            regionFactor *
            sizeFactor *
            networthFactor *
            industryFactor *
            maturityFactor *
            recommendationFactor;

        return Math.round(finalPrice * 100) / 100;
    } catch (e) {
        console.error(`Error calculating price:\n${e}`);
        const basePrice = MODULE_BASE_PRICES[moduleName];
        return basePrice ?? 40000;
    }
}

// ==========================================
// NEW PRICING EXPORTS (Use these for new code)
// ==========================================

export {
    // Configuration
    SUBSCRIPTION_TIERS,
    ENGINE_PRICING,
    BUNDLE_PRICING,
    PRICING_FACTORS,
    TAX_RATES,

    // Calculator functions
    calculateDynamicPrice,
    calculateEnginePurchase,
    formatCurrency,
    getTierByEmployeeCount
};

/**
 * Get engine price by ID
 */
export function getEnginePrice(engineId: string): number {
    const engine = ENGINE_PRICING.find(e => e.id === engineId);
    return engine?.basePrice ?? 40000;
}

/**
 * Get engine price by name (for backward compatibility)
 */
export function getEnginePriceByName(engineName: string): number {
    // Map old names to new IDs
    const nameToIdMap: Record<string, string> = {
        "HR Technology Maturity Analysis": "hr-tech-maturity",
        "HR Transformation Roadmap Generator": "digital-roadmap",
        "HCM Vendor Fit Engine": "hcm-vendor-fit",
        "Shared Service Designer": "shared-services",
        "Intelligent Change Management": "change-management"
    };

    const engineId = nameToIdMap[engineName];
    if (engineId) {
        return getEnginePrice(engineId);
    }

    // Fallback to old base prices
    return MODULE_BASE_PRICES[engineName] ?? 40000;
}

/**
 * Calculate bundle price with savings
 */
export function getBundlePrice(): {
    regularPrice: number;
    bundlePrice: number;
    savings: number;
} {
    return {
        regularPrice: BUNDLE_PRICING.allEngines.regularPrice,
        bundlePrice: BUNDLE_PRICING.allEngines.bundlePrice,
        savings: BUNDLE_PRICING.allEngines.savings
    };
}

/**
 * Check if user's subscription includes an engine
 */
export function isEngineIncludedInTier(tierId: string, engineIndex: number): boolean {
    const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
    if (!tier) return false;

    return tier.includedEngines >= (engineIndex + 1);
}

/**
 * Get subscription tier name by employee count
 */
export function getTierName(employeeCount: number): string {
    const tier = getTierByEmployeeCount(employeeCount);
    return tier.name;
}
