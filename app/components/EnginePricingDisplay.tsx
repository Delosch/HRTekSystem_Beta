import { Link } from "@remix-run/react";
import { Zap, ShoppingCart, CheckCircle } from "lucide-react";
import { ENGINE_PRICING, BUNDLE_PRICING } from "~/config/pricing.config";
import { formatCurrency } from "~/services/pricing.calculator";

/**
 * Engine Pricing Display Component
 * 
 * Shows pricing for individual engines or bundle
 * Can be embedded in engine dashboards
 */

interface EnginePricingDisplayProps {
    engineId?: string;
    showBundle?: boolean;
    compact?: boolean;
}

export default function EnginePricingDisplay({
    engineId,
    showBundle = false,
    compact = false
}: EnginePricingDisplayProps) {

    const engine = engineId ? ENGINE_PRICING.find(e => e.id === engineId) : null;

    if (compact && engine) {
        // Compact version for dashboard sidebar or header
        return (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-gray-600">Engine Price</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(engine.basePrice, "INR")}
                        </p>
                    </div>
                    <Link
                        to={`/payment/manual?engines=${engine.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <ShoppingCart className="w-4 h-4" />
                        Purchase
                    </Link>
                </div>
            </div>
        );
    }

    if (showBundle) {
        // Bundle pricing display
        return (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold inline-block mb-2">
                            SAVE {formatCurrency(BUNDLE_PRICING.allEngines.savings, "INR")}
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">All 5 Engines Bundle</h3>
                        <p className="text-gray-700 mt-2">
                            Get complete access to all assessment engines
                        </p>
                    </div>
                    <Zap className="w-12 h-12 text-green-600" />
                </div>

                <div className="flex items-baseline gap-3 mb-4">
                    <span className="text-4xl font-bold text-green-600">
                        {formatCurrency(BUNDLE_PRICING.allEngines.bundlePrice, "INR")}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                        {formatCurrency(BUNDLE_PRICING.allEngines.regularPrice, "INR")}
                    </span>
                </div>

                <div className="space-y-2 mb-6">
                    {ENGINE_PRICING.map((engine) => (
                        <div key={engine.id} className="flex items-center gap-2 text-sm text-gray-700">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            {engine.name}
                        </div>
                    ))}
                </div>

                <Link
                    to={`/payment/manual?engines=${ENGINE_PRICING.map(e => e.id).join(",")}`}
                    className="block w-full text-center bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                    Purchase Bundle
                </Link>
            </div>
        );
    }

    if (engine) {
        // Full engine pricing display
        return (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">{engine.name}</h3>
                        <p className="text-sm text-gray-600">{engine.description}</p>
                    </div>
                    <Zap className="w-8 h-8 text-blue-600" />
                </div>

                <div className="mb-6">
                    <div className="text-3xl font-bold text-gray-900 mb-1">
                        {formatCurrency(engine.basePrice, "INR")}
                    </div>
                    <p className="text-sm text-gray-600">One-time purchase</p>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Lifetime access to engine
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Detailed assessment reports
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Export to PDF
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Email support
                    </div>
                </div>

                <Link
                    to={`/payment/manual?engines=${engine.id}`}
                    className="block w-full text-center bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                    Purchase Now
                </Link>

                <p className="text-xs text-gray-500 text-center mt-4">
                    + GST @18% applicable
                </p>
            </div>
        );
    }

    return null;
}

/**
 * Subscription Tier Display Component
 * Shows current tier and upgrade options
 */

interface SubscriptionTierDisplayProps {
    currentTier: string;
    employeeCount: number;
}

export function SubscriptionTierDisplay({
    currentTier,
    employeeCount
}: SubscriptionTierDisplayProps) {
    return (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <p className="text-sm text-gray-600">Current Plan</p>
                    <p className="text-2xl font-bold text-purple-600 capitalize">{currentTier}</p>
                </div>
                <Link
                    to="/pricing"
                    className="text-purple-600 hover:text-purple-700 font-semibold text-sm"
                >
                    View All Plans →
                </Link>
            </div>

            <p className="text-sm text-gray-700 mb-4">
                {employeeCount} employees • Upgrade for more engines
            </p>

            <Link
                to="/pricing"
                className="block w-full text-center bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
                Upgrade Plan
            </Link>
        </div>
    );
}
