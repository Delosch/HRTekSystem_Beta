import { Link, useFetcher } from "@remix-run/react";
import { CheckCircle } from "lucide-react";
import { ENGINE_PRICING } from "~/config/pricing.config";
import { formatCurrency } from "~/services/pricing.calculator";

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
    // Use useFetcher from local scope? It needs to be passed or imported.
    // Importing useFetcher inside the component file relies on Remix Context.
    // I need to import useFetcher from @remix-run/react at the top.
    const fetcher = useFetcher();

    if (!engine) {
        return null;
    }

    const targetName = productName || engine.name;

    return (
        <div className={`bg-white border-2 border-green-500 rounded-2xl p-6 shadow-sm ${className}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Engine Pricing
                    </h3>
                    <p className="text-sm text-gray-600">
                        One-time purchase for lifetime access
                    </p>
                </div>
                <div className="text-3xl">💰</div>
            </div>

            {/* Price */}
            <div className="mb-4">
                <div className="text-4xl font-bold text-green-600 mb-1">
                    {formatCurrency(engine.basePrice, "INR")}
                </div>
                <p className="text-sm text-gray-600">+ GST @18%</p>
            </div>

            {/* Features */}
            <div className="space-y-2 mb-6">
                <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Detailed AI-powered analysis</span>
                </div>
                <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Comprehensive recommendations</span>
                </div>
                <div className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700">Visual dashboards & reports</span>
                </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3">
                <fetcher.Form method="post" action="/startTransformationDashboard">
                    <input type="hidden" name="intent" value="addToCart" />
                    <input type="hidden" name="engineName" value={targetName} />
                    <button
                        type="submit"
                        disabled={fetcher.state === 'submitting'}
                        className="w-full text-center bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
                    >
                        {fetcher.state === 'submitting' ? (
                            <>Adding...</>
                        ) : (
                            <>🛒 Add to Cart</>
                        )}
                    </button>
                </fetcher.Form>

                <Link
                    to={`/payment/manual?engines=${engine.id}`}
                    className="w-full text-center border border-green-600 text-green-700 py-3 px-6 rounded-lg font-semibold hover:bg-green-50 transition-colors"
                >
                    View Pricing Details
                </Link>
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
