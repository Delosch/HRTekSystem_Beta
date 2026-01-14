import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Check, Zap } from "lucide-react";
import { SUBSCRIPTION_TIERS, ENGINE_PRICING, BUNDLE_PRICING } from "~/config/pricing.config";
import { formatCurrency } from "~/services/pricing.calculator";

export async function loader() {
    return json({
        tiers: SUBSCRIPTION_TIERS,
        engines: ENGINE_PRICING,
        bundle: BUNDLE_PRICING.allEngines
    });
}

export default function PricingPage() {
    const { tiers, engines, bundle } = useLoaderData<typeof loader>();

    // Define unique gradient and icon colors for each engine
    const gradients = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-orange-500 to-red-500',
        'from-green-500 to-emerald-500',
        'from-indigo-500 to-purple-500'
    ];

    const iconBgs = [
        'bg-blue-100',
        'bg-purple-100',
        'bg-orange-100',
        'bg-green-100',
        'bg-indigo-100'
    ];

    const iconColors = [
        'text-blue-600',
        'text-purple-600',
        'text-orange-600',
        'text-green-600',
        'text-indigo-600'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-[#03045e] to-[#0B0D39] text-white py-20">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <h1 className="text-5xl font-bold mb-6">Simple, Transparent Pricing</h1>
                    <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                        Choose the plan that fits your organization size. All plans include dashboard access and expert support.
                    </p>
                </div>
            </div>

            {/* Individual Engine Pricing */}
            <div className="bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 py-16">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Powerful Assessment Engines
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Choose individual engines or get the complete bundle. Click any card to explore features and start your assessment.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {engines.map((engine, index) => (
                            <Link
                                key={engine.id}
                                to="/auth"
                                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer"
                            >
                                {/* Gradient Top Border */}
                                <div className={`h-2 bg-gradient-to-r ${gradients[index % 5]}`} />

                                <div className="p-6">
                                    {/* Icon and Price */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`${iconBgs[index % 5]} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                            <Zap className={`w-8 h-8 ${iconColors[index % 5]}`} />
                                        </div>
                                        <div className="text-right">
                                            <div className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                                                {formatCurrency(engine.basePrice, "INR")}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">one-time</div>
                                        </div>
                                    </div>

                                    {/* Engine Name */}
                                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                        {engine.name}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-sm text-gray-600 mb-6 line-clamp-2">
                                        {engine.description}
                                    </p>

                                    {/* CTA Button */}
                                    <div className={`flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r ${gradients[index % 5]} text-white rounded-xl font-semibold group-hover:shadow-lg transition-all duration-300`}>
                                        <span>Login to Access</span>
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Hover Border Effect */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-400 rounded-2xl pointer-events-none transition-all duration-300" />
                            </Link>
                        ))}
                    </div>

                    {/* Bundle Offer */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-500 rounded-2xl p-8">
                        <div className="flex items-center justify-between flex-wrap gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                                        SAVE {formatCurrency(bundle.savings, "INR")}
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900">All 5 Engines Bundle</h3>
                                </div>
                                <p className="text-gray-700 mb-4">
                                    Get complete access to all 5 assessment engines and save {formatCurrency(bundle.savings, "INR")} compared to individual purchases
                                </p>
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-bold text-green-600">
                                        {formatCurrency(bundle.bundlePrice, "INR")}
                                    </span>
                                    <span className="text-lg text-gray-500 line-through">
                                        {formatCurrency(bundle.regularPrice, "INR")}
                                    </span>
                                </div>
                            </div>

                            <Link
                                to="/contact"
                                className="bg-green-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Get Bundle
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subscription Tiers */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Subscription Plans</h2>
                    <p className="text-gray-600">Annual plans with flexible engine access</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className={`rounded-2xl p-8 ${tier.id === "enterprise"
                                ? "bg-gradient-to-br from-[#03045e] to-[#0B0D39] text-white shadow-2xl scale-105"
                                : "bg-white shadow-lg"
                                }`}
                        >
                            {tier.id === "enterprise" && (
                                <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full inline-block mb-4">
                                    MOST POPULAR
                                </div>
                            )}

                            <h3 className={`text-2xl font-bold mb-2 ${tier.id === "enterprise" ? "text-white" : "text-gray-900"}`}>
                                {tier.name}
                            </h3>

                            <p className={`text-sm mb-4 ${tier.id === "enterprise" ? "text-blue-100" : "text-gray-600"}`}>
                                {tier.employeeMin.toLocaleString()} - {tier.employeeMax ? tier.employeeMax.toLocaleString() : "Unlimited"} employees
                            </p>

                            <div className="mb-6">
                                <div className={`text-4xl font-bold ${tier.id === "enterprise" ? "text-white" : "text-gray-900"}`}>
                                    {formatCurrency(tier.annualFee, "INR")}
                                </div>
                                <p className={`text-sm ${tier.id === "enterprise" ? "text-blue-100" : "text-gray-600"}`}>
                                    per year
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className={`text-lg font-semibold mb-3 ${tier.id === "enterprise" ? "text-white" : "text-gray-900"}`}>
                                    {tier.includedEngines === 5
                                        ? "All 5 Engines Included"
                                        : `${tier.includedEngines} Engine${tier.includedEngines > 1 ? "s" : ""} of Choice`}
                                </div>

                                <ul className="space-y-3">
                                    {tier.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-center gap-2">
                                            <Check className={`w-5 h-5 ${tier.id === "enterprise" ? "text-green-300" : "text-green-500"}`} />
                                            <span className={`text-sm ${tier.id === "enterprise" ? "text-white" : "text-gray-700"}`}>
                                                {feature}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <a
                                href="/#contact"
                                className={`block w-full text-center py-3 px-6 rounded-lg font-semibold transition-colors ${tier.id === "enterprise"
                                    ? "bg-white text-[#03045e] hover:bg-gray-100"
                                    : "bg-[#03045e] text-white hover:bg-[#0B0D39]"
                                    }`}
                            >
                                {tier.isCustom ? "Contact Sales" : "Subscribe Now"}
                            </a>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ Section */}
            <div className="max-w-4xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>

                <div className="space-y-6">
                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">What's included in each subscription tier?</h3>
                        <p className="text-gray-600">
                            Each tier includes dashboard access, basic reports, and email support. Higher tiers include more engines, advanced features, and priority support.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I upgrade my plan later?</h3>
                        <p className="text-gray-600">
                            Yes! You can upgrade your subscription at any time. We'll prorate the cost based on your remaining subscription period.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
                        <p className="text-gray-600">
                            We accept UPI, NEFT, credit/debit cards, net banking, and international wire transfers. GST @18% applies for Indian clients.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg p-6 shadow-md">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer discounts?</h3>
                        <p className="text-gray-600">
                            Yes! We offer volume discounts for large enterprises, multi-year contracts, and special pricing for non-profits and educational institutions.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-[#03045e] to-[#0B0D39] text-white py-16">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-3xl font-bold mb-4">Ready to Transform Your HR?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Contact us to discuss the best plan for your organization
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                        <Link
                            to="/auth"
                            className="bg-white text-[#03045e] py-3 px-8 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                        >
                            Create Profile
                        </Link>
                        <a
                            href="/#contact"
                            className="border-2 border-white text-white py-3 px-8 rounded-lg font-semibold hover:bg-white hover:text-[#03045e] transition-colors"
                        >
                            Contact Sales
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

