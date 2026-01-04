import {
    SUBSCRIPTION_TIERS,
    ENGINE_PRICING,
    BUNDLE_PRICING,
    PRICING_FACTORS,
    TAX_RATES,
    CURRENCY_RATES
} from "~/config/pricing.config";

/**
 * Pricing Calculator Service
 * Handles all pricing calculations including dynamic pricing, bundles, and taxes
 */

export interface PricingCalculation {
    basePrice: number;
    factors: {
        type: string;
        label: string;
        value: string;
        multiplier: number;
    }[];
    totalFactorMultiplier: number;
    subtotal: number;
    tax: number;
    total: number;
    currency: string;
    breakdown: string[];
}

export interface SubscriptionRecommendation {
    tierId: string;
    tierName: string;
    employeeCount: number;
    annualFee: number;
    includedEngines: number;
    savings?: number;
}

/**
 * Calculate dynamic pricing based on multiple factors
 */
export function calculateDynamicPrice(
    basePrice: number,
    selectedFactors: { [key: string]: string },
    currency: string = "INR",
    isExport: boolean = false
): PricingCalculation {

    const appliedFactors: PricingCalculation["factors"] = [];
    let totalMultiplier = 0;

    // Apply each selected factor
    for (const [factorType, selectedValue] of Object.entries(selectedFactors)) {
        const factor = PRICING_FACTORS.find(f => f.type === factorType);
        if (!factor) continue;

        const option = factor.options.find(o => o.value === selectedValue);
        if (!option) continue;

        appliedFactors.push({
            type: factorType,
            label: factor.label,
            value: selectedValue,
            multiplier: option.multiplier
        });

        totalMultiplier += option.multiplier;
    }

    // Calculate subtotal using formula: Base × (1 + Sum of Factors)
    const subtotal = basePrice * (1 + totalMultiplier);

    // Calculate tax
    const taxRate = isExport ? TAX_RATES.export.gst : TAX_RATES.india.gst;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Convert currency if needed
    const conversionRate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;
    const convertedSubtotal = subtotal * conversionRate;
    const convertedTax = tax * conversionRate;
    const convertedTotal = total * conversionRate;

    // Create breakdown
    const breakdown: string[] = [
        `Base Price: ${formatCurrency(basePrice, "INR")}`,
        `Total Factor: ${(totalMultiplier * 100).toFixed(0)}% (${appliedFactors.length} factors)`,
        `Subtotal: ${formatCurrency(subtotal, "INR")}`,
        `Tax (${(taxRate * 100).toFixed(0)}%): ${formatCurrency(tax, "INR")}`,
    ];

    if (currency !== "INR") {
        breakdown.push(`Converted to ${currency}: ${formatCurrency(convertedTotal, currency)}`);
    }

    return {
        basePrice,
        factors: appliedFactors,
        totalFactorMultiplier: totalMultiplier,
        subtotal: currency === "INR" ? subtotal : convertedSubtotal,
        tax: currency === "INR" ? tax : convertedTax,
        total: currency === "INR" ? total : convertedTotal,
        currency,
        breakdown
    };
}

/**
 * Get recommended subscription tier based on employee count
 */
export function getRecommendedTier(employeeCount: number): SubscriptionRecommendation {
    const tier = SUBSCRIPTION_TIERS.find(
        t => employeeCount >= t.employeeMin && (t.employeeMax === null || employeeCount <= t.employeeMax)
    ) || SUBSCRIPTION_TIERS[0];

    return {
        tierId: tier.id,
        tierName: tier.name,
        employeeCount,
        annualFee: tier.annualFee,
        includedEngines: tier.includedEngines
    };
}

/**
 * Calculate bundle savings
 */
export function calculateBundleSavings(engineIds: string[]): {
    regularPrice: number;
    bundlePrice: number;
    savings: number;
    isBundle: boolean;
} {
    const selectedEngines = ENGINE_PRICING.filter(e => engineIds.includes(e.id));
    const regularPrice = selectedEngines.reduce((sum, e) => sum + e.basePrice, 0);

    // Check if all 5 engines are selected
    const isBundle = engineIds.length === 5 &&
        engineIds.every(id => BUNDLE_PRICING.allEngines.engines.includes(id));

    if (isBundle) {
        return {
            regularPrice,
            bundlePrice: BUNDLE_PRICING.allEngines.bundlePrice,
            savings: BUNDLE_PRICING.allEngines.savings,
            isBundle: true
        };
    }

    return {
        regularPrice,
        bundlePrice: regularPrice,
        savings: 0,
        isBundle: false
    };
}

/**
 * Calculate total cost for engine purchase
 */
export function calculateEnginePurchase(
    engineIds: string[],
    currency: string = "INR",
    isExport: boolean = false
): {
    engines: typeof ENGINE_PRICING;
    subtotal: number;
    bundleSavings: number;
    tax: number;
    total: number;
    currency: string;
} {
    const selectedEngines = ENGINE_PRICING.filter(e => engineIds.includes(e.id));
    const bundleInfo = calculateBundleSavings(engineIds);

    const subtotal = bundleInfo.isBundle ? bundleInfo.bundlePrice : bundleInfo.regularPrice;
    const taxRate = isExport ? TAX_RATES.export.gst : TAX_RATES.india.gst;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Convert currency
    const conversionRate = CURRENCY_RATES[currency as keyof typeof CURRENCY_RATES] || 1;

    return {
        engines: selectedEngines,
        subtotal: subtotal * conversionRate,
        bundleSavings: bundleInfo.savings * conversionRate,
        tax: tax * conversionRate,
        total: total * conversionRate,
        currency
    };
}

/**
 * Calculate subscription upgrade cost
 */
export function calculateUpgradeCost(
    currentTierId: string,
    newTierId: string,
    monthsRemaining: number = 12
): {
    currentTierFee: number;
    newTierFee: number;
    proratedCost: number;
    additionalCost: number;
} {
    const currentTier = SUBSCRIPTION_TIERS.find(t => t.id === currentTierId);
    const newTier = SUBSCRIPTION_TIERS.find(t => t.id === newTierId);

    if (!currentTier || !newTier) {
        throw new Error("Invalid tier IDs");
    }

    const currentTierFee = currentTier.annualFee;
    const newTierFee = newTier.annualFee;

    // Calculate prorated cost for remaining months
    const proratedCost = (newTierFee - currentTierFee) * (monthsRemaining / 12);
    const additionalCost = Math.max(0, proratedCost);

    return {
        currentTierFee,
        newTierFee,
        proratedCost,
        additionalCost
    };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number, currency: string): string {
    const symbols: { [key: string]: string } = {
        INR: "₹",
        USD: "$",
        EUR: "€",
        GBP: "£",
        AED: "AED "
    };

    const symbol = symbols[currency] || currency;
    const formatted = amount.toLocaleString("en-IN", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    return `${symbol}${formatted}`;
}

/**
 * Get tier by employee count
 */
export function getTierByEmployeeCount(employeeCount: number) {
    return SUBSCRIPTION_TIERS.find(
        tier => employeeCount >= tier.employeeMin &&
            (tier.employeeMax === null || employeeCount <= tier.employeeMax)
    ) || SUBSCRIPTION_TIERS[0];
}

/**
 * Check if user has access to engine based on subscription
 */
export function hasEngineAccess(
    tierId: string,
    engineId: string,
    purchasedEngines: string[] = []
): boolean {
    const tier = SUBSCRIPTION_TIERS.find(t => t.id === tierId);
    if (!tier) return false;

    // Check if engine is purchased individually
    if (purchasedEngines.includes(engineId)) return true;

    // Check if tier includes all engines
    if (tier.includedEngines >= 5) return true;

    // For tiers with limited engines, check if user has selected this engine
    // This would need to be stored in user preferences
    return false;
}
