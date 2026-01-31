import { Link, useFetcher } from "@remix-run/react";
import { CheckCircle } from "lucide-react";
import { ENGINE_PRICING } from "~/config/pricing.config";
import { formatCurrency } from "~/services/pricing.calculator";
import React, { useState, useEffect } from "react";

/**
 * Engine Pricing Card Component
 * 
 * Displays pricing information for a specific engine
 * Matches the design with green border, features list, and CTA button
 */

interface EnginePricingCardProps {
    engineId: string;
    productName?: string; // Legacy name for cart compatibility
    className?: string;
}

export default function EnginePricingCard({ engineId, productName, className = "" }: EnginePricingCardProps) {
    const engine = ENGINE_PRICING.find(e => e.id === engineId);
    const fetcher = useFetcher();
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        if (fetcher.state === 'idle' && fetcher.data && (fetcher.data as any).success) {
            setShowSuccess(true);
            const timer = setTimeout(() => setShowSuccess(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [fetcher.state, fetcher.data]);

    if (!engine) {
        return null;
    }

    const targetName = productName || engine.name;

    return (
        <div className={`bg-white rounded-2xl p-6 shadow-sm border border-gray-100 border-l-4 border-l-emerald-500 relative ${className}`}>
            {showSuccess && (
                <div className="absolute top-4 right-20 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold animate-fade-in-scale z-20 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Added to cart!
                </div>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                {/* Left Section: Info & Features */}
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 leading-tight">
                            Engine Pricing
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            One-time purchase for lifetime access
                        </p>
                    </div>

                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-emerald-600 tracking-tight">
                            {formatCurrency(engine.basePrice, "INR")}
                        </span>
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                            + GST @18%
                        </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-y-2 gap-x-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span>Detailed AI-powered analysis</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span>Comprehensive recommendations</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            <span>Visual dashboards & reports</span>
                        </div>
                    </div>
                </div>

                {/* Right Section: Actions */}
                <div className="flex flex-col items-end gap-4 min-w-full md:min-w-[240px]">
                    <div className="text-2xl absolute top-6 right-6 md:static self-end mb-2">💰</div>

                    <fetcher.Form method="post" action="/startTransformationDashboard" className="w-full">
                        <input type="hidden" name="intent" value="addToCart" />
                        <input type="hidden" name="engineName" value={targetName} />
                        <button
                            type="submit"
                            disabled={fetcher.state === 'submitting' || showSuccess}
                            className={`w-full py-2.5 px-6 rounded-xl font-bold shadow-lg transition-all active:scale-95 flex justify-center items-center gap-2 ${showSuccess
                                ? 'bg-emerald-600 text-white shadow-emerald-200'
                                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
                                }`}
                        >
                            {fetcher.state === 'submitting' ? (
                                <span className="animate-pulse">Adding...</span>
                            ) : showSuccess ? (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Done!
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    Add to Cart
                                </>
                            )}
                        </button>
                    </fetcher.Form>

                    <Link
                        to={`/payment/manual?engines=${engine.id}`}
                        className="w-full bg-white border border-emerald-200 text-emerald-700 py-2.5 px-6 rounded-xl font-bold hover:bg-emerald-50 transition-colors text-center shadow-sm"
                    >
                        View Pricing Details
                    </Link>
                </div>
            </div>
        </div>
    );
}

/**
 * Compact Engine Pricing Badge
 * For use in headers or sidebars
 */
interface EnginePricingBadgeProps {
    engineId: string;
}

export function EnginePricingBadge({ engineId }: EnginePricingBadgeProps) {
    const engine = ENGINE_PRICING.find(e => e.id === engineId);

    if (!engine) {
        return null;
    }

    return (
        <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            <span className="text-lg">💰</span>
            <div>
                <p className="text-xs text-gray-600">Engine Price</p>
                <p className="text-sm font-bold text-green-600">
                    {formatCurrency(engine.basePrice, "INR")}
                </p>
            </div>
        </div>
    );
}
