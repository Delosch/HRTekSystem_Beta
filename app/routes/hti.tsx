import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { Brain, CheckCircle, Clock, XCircle, AlertCircle, Sparkles, TrendingUp, DollarSign, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";
import { getPricingForCompany, PRICING_TIERS } from "~/utils/pricing.server";
import { getCompanyProfile } from "~/models/company.model.server";

/**
 * HTI Dashboard - Ultra-Attractive Design with Pricing
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    if (!user.organisationId) {
        return json({ error: "Organization ID required" }, { status: 400 });
    }

    // Fetch completed engines
    const { completedEngine } = await import("~/models/engine.model.server");
    const completedEngines = await completedEngine(user.organisationId);

    // Fetch company's advisories
    const reportsResponse = await fetch(`${new URL(request.url).origin}/api/hti/reports`, {
        headers: {
            Cookie: request.headers.get("Cookie") || ""
        }
    });

    let reports = [];
    if (reportsResponse.ok) {
        const data = await reportsResponse.json();
        reports = data.reports || [];
    }

    // Get pricing tier
    let pricingTier = PRICING_TIERS.TRANSFORMATION;
    try {
        const company = await getCompanyProfile(user.organisationId);
        if (company) {
            pricingTier = getPricingForCompany(company.employee_count || 0);
        }
    } catch (error) {
        console.log("Could not fetch pricing:", error);
    }

    return json({
        user,
        companyId: user.organisationId,
        reports,
        completedEngines,
        pricingTier
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const user = await requireUserSession(request);

    if (!user.organisationId) {
        return json({ error: "Organization ID required" }, { status: 400 });
    }

    try {
        // Auto-add to Cart
        try {
            const { getCompanyProfile } = await import("~/models/company.model.server");
            const { getPricingForCompany } = await import("~/utils/pricing.server");
            const { addOrUpdateCartItem } = await import("~/models/cart.model.server");

            const companyProfile = await getCompanyProfile(user.organisationId);
            const employeeCount = companyProfile?.employee_count || 0;
            const pricingTier = getPricingForCompany(employeeCount);

            if (pricingTier.basePrice > 0) {
                await addOrUpdateCartItem({
                    companyId: user.organisationId,
                    productName: `HTI Advisory: ${pricingTier.name}`,
                    price: pricingTier.basePrice,
                    userId: user.userId
                });
            }
        } catch (cartError) {
            console.error("⚠️ Failed to auto-add to cart:", cartError);
        }

        const { generateAdvisoryReport } = await import("~/services/hti.service.server");
        const result = await generateAdvisoryReport(
            user.organisationId || "",
            user.userId
        );

        if (!result.success) {
            return json({ error: result.error }, { status: 400 });
        }

        return json({ success: true, reportId: result.reportId });
    } catch (error) {
        console.error(`❌ HTI action error:`, error);
        return json({ error: "Failed to generate HTI advisory" }, { status: 500 });
    }
}

export default function HTIDashboard() {
    const loaderData = useLoaderData<typeof loader>() as any;
    const user = loaderData?.user;
    const reports = loaderData?.reports || [];
    const pricingTier = loaderData?.pricingTier;
    const navigation = useNavigation();
    const isGenerating = navigation.state === "submitting";

    const requiredEngines = [
        { name: "HR Technology Maturity Analysis", key: "maturity" },
        { name: "HR Transformation Roadmap Generator", key: "roadmap" },
        { name: "Cognitive HCM Vendor Fit", key: "vendor" },
        { name: "Intelligent Change Management", key: "change" },
        { name: "Shared Service Designer", key: "sharedServices" }
    ];

    const completedCount = loaderData.completedEngines?.length || 0;
    const progressPercentage = (completedCount / 5) * 100;

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "approved":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "pending":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case "rejected":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            approved: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            rejected: "bg-red-100 text-red-800",
            revision_requested: "bg-orange-100 text-orange-800"
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
                {status.replace("_", " ").toUpperCase()}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Ultra-Attractive Header */}
            <div className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white py-16 overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 opacity-10">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-2 h-2 bg-white rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                            }}
                            animate={{
                                y: [0, -30, 0],
                                opacity: [0.2, 0.8, 0.2],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 mb-6"
                    >
                        <motion.div
                            animate={{
                                rotate: [0, 360],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                duration: 4,
                                repeat: Infinity,
                            }}
                        >
                            <Brain className="w-16 h-16 text-cyan-400" />
                        </motion.div>
                        <div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent">
                                HR Transformation Intelligence
                            </h1>
                            <p className="text-blue-200 mt-2 text-xl">Cognitive HR Advisory Module</p>
                        </div>
                    </motion.div>
                    <p className="text-blue-100 max-w-3xl text-lg">
                        AI-powered strategic advisory that converts your HR assessment data into board-ready transformation recommendations.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    {[
                        { icon: <Target className="w-8 h-8" />, label: "Completed", value: `${completedCount}/5`, color: "from-green-500 to-emerald-500", bg: "from-green-50 to-emerald-50" },
                        { icon: <TrendingUp className="w-8 h-8" />, label: "Progress", value: `${Math.round(progressPercentage)}%`, color: "from-blue-500 to-cyan-500", bg: "from-blue-50 to-cyan-50" },
                        { icon: <Brain className="w-8 h-8" />, label: "Reports", value: reports.length.toString(), color: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50" },
                        { icon: <Sparkles className="w-8 h-8" />, label: "Approved", value: reports.filter((r: any) => r.status === "approved").length.toString(), color: "from-yellow-500 to-orange-500", bg: "from-yellow-50 to-orange-50" },
                    ].map((stat, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className={`relative overflow-hidden bg-gradient-to-br ${stat.bg} rounded-2xl p-6 border-2 border-white shadow-xl`}
                        >
                            <div className={`text-transparent bg-gradient-to-br ${stat.color} bg-clip-text mb-2`}>
                                {stat.icon}
                            </div>
                            <div className="text-gray-600 text-sm font-medium">{stat.label}</div>
                            <div className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                                {stat.value}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Comprehensive Pricing Section - All Tiers */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="text-center mb-8">
                        <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                            HTI Advisory Pricing Tiers
                        </h2>
                        <p className="text-gray-600 text-lg">Choose the perfect plan for your organization's transformation journey</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {/* Tier 1: Essentials */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 ${pricingTier?.id === 'essentials'
                                    ? 'border-blue-500 ring-4 ring-blue-200'
                                    : 'border-gray-200'
                                }`}
                        >
                            {pricingTier?.id === 'essentials' && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                    ⭐ RECOMMENDED FOR YOU
                                </div>
                            )}

                            <div className="text-center mb-6 mt-2">
                                <div className="inline-block p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl mb-4">
                                    <Target className="w-12 h-12 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Advisory Essentials</h3>
                                <p className="text-gray-600 text-sm mb-4">For mid-size enterprises</p>
                                <div className="text-5xl font-black bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                                    ₹12-18L
                                </div>
                                <p className="text-gray-500 text-sm">per year</p>
                                <p className="text-gray-400 text-xs mt-1">USD 18,000 - 25,000</p>
                            </div>

                            <div className="space-y-3 mb-6">
                                {[
                                    "Aggregation from all HR-Tek modules",
                                    "Interpretation Layer (maturity, gaps)",
                                    "Standard transformation insights",
                                    "CXO summary dashboard",
                                    "Confidence & explainability indicators",
                                    "Quarterly data refresh",
                                    "Email support"
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg">
                                Get Started
                            </button>
                        </motion.div>

                        {/* Tier 2: Transformation (Most Popular) */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            className={`relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl border-2 transform ${pricingTier?.id === 'transformation' || !pricingTier
                                    ? 'scale-105 border-yellow-400 ring-4 ring-yellow-200'
                                    : 'border-purple-400'
                                }`}
                        >
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 px-6 py-2 rounded-full text-sm font-bold shadow-lg animate-pulse">
                                🔥 MOST POPULAR
                            </div>

                            <div className="text-center mb-6 mt-2 text-white">
                                <div className="inline-block p-4 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
                                    <Sparkles className="w-12 h-12 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Transformation Intelligence</h3>
                                <p className="text-purple-100 text-sm mb-4">For enterprises (500-5,000 employees)</p>
                                <div className="text-5xl font-black text-white mb-2">
                                    ₹28-40L
                                </div>
                                <p className="text-purple-100 text-sm">per year</p>
                                <p className="text-purple-200 text-xs mt-1">USD 40,000 - 60,000</p>
                                <div className="mt-3 inline-block bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-xs font-bold">
                                    70% of clients choose this
                                </div>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-2 text-white">
                                    <CheckCircle className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm font-semibold">Everything in Essentials plus:</span>
                                </div>
                                {[
                                    "Transformation Mapping Layer",
                                    "Priority & dependency engine",
                                    "Advisory & recommendation engine",
                                    "ROI-based digitization guidance",
                                    "Risk-aware transformation flags",
                                    "Operating model implications",
                                    "Quarterly intelligence refresh",
                                    "Priority support & consultation"
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-2 text-white">
                                        <CheckCircle className="w-5 h-5 text-yellow-300 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-3 bg-yellow-400 text-gray-900 rounded-xl font-bold hover:bg-yellow-300 transition-all shadow-xl">
                                Start Transformation
                            </button>
                        </motion.div>

                        {/* Tier 3: Enterprise */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            whileHover={{ scale: 1.03, y: -5 }}
                            className={`relative bg-white rounded-3xl p-8 shadow-xl border-2 ${pricingTier?.id === 'enterprise'
                                    ? 'border-purple-500 ring-4 ring-purple-200'
                                    : 'border-gray-200'
                                }`}
                        >
                            {pricingTier?.id === 'enterprise' && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                                    ⭐ RECOMMENDED FOR YOU
                                </div>
                            )}

                            <div className="text-center mb-6 mt-2">
                                <div className="inline-block p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl mb-4">
                                    <Brain className="w-12 h-12 text-purple-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Cognitive Advisory</h3>
                                <p className="text-gray-600 text-sm mb-4">Board / CXO Tier</p>
                                <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                    Contact Us
                                </div>
                                <p className="text-gray-500 text-sm">for custom pricing</p>
                                <p className="text-gray-400 text-xs mt-1">For global programs</p>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700 font-semibold">Everything in Transformation plus:</span>
                                </div>
                                {[
                                    "Scenario & simulation modelling",
                                    "Multi-country / multi-entity intelligence",
                                    "Executive decision cockpit",
                                    "Advisory logic customization",
                                    "Agentic HR AI workflows",
                                    "Board-ready outputs & presentations",
                                    "Priority access & SLA",
                                    "Dedicated success manager"
                                ].map((feature, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <CheckCircle className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg">
                                Contact Sales
                            </button>
                        </motion.div>
                    </div>

                    {/* Value Proposition Cards */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-green-500 rounded-xl">
                                    <TrendingUp className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">50-70% Cost Savings</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Compared to Big-4 consulting firms. Get the same strategic insights at a fraction of the cost.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-blue-500 rounded-xl">
                                    <Zap className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">24/7 Intelligence</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Always-on AI advisory that updates quarterly. No waiting for consultant availability.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200"
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-3 bg-purple-500 rounded-xl">
                                    <Target className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">ROI in Q1</h3>
                            </div>
                            <p className="text-gray-700 text-sm">
                                Most organizations see measurable ROI within the first quarter of implementation.
                            </p>
                        </motion.div>
                    </div>

                    {/* Additional Info */}
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-r-2xl p-6">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    💰 Limited Time Offer
                                </h3>
                                <p className="text-gray-700 mb-2">
                                    First 10 clients get <strong className="text-orange-600">15% founding customer discount</strong>
                                </p>
                                <p className="text-gray-600 text-sm">
                                    * Prices vary based on organization size (500 to 15,000+ employees)<br />
                                    * Multi-year discounts available | Strategic logo clients: Custom pricing
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Generate Advisory Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 mb-8 border-2 border-gray-100"
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-purple-600" />
                        Generate New Advisory
                    </h2>
                    <p className="text-gray-600 mb-6 text-lg">
                        Create a comprehensive strategic advisory based on your completed HR assessments.
                    </p>

                    {/* Progress Bar */}
                    <div className="mb-6">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Assessment Progress</span>
                            <span className="text-sm font-bold text-purple-600">{completedCount}/5 Complete</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                            <motion.div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercentage}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                            />
                        </div>
                    </div>

                    {/* Engine Status */}
                    <div className="mb-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                        <h3 className="font-semibold text-gray-900 mb-4 text-lg">Required Assessments</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                            {requiredEngines.map((engine) => {
                                const isCompleted = loaderData.completedEngines?.some((completedName: string) =>
                                    completedName === engine.name ||
                                    completedName === `ENGINE#${engine.name}` ||
                                    completedName.replace('ENGINE#', '') === engine.name ||
                                    (engine.key === 'vendor' && completedName.includes('HCM Vendor Fit Engine'))
                                ) || false;

                                return (
                                    <motion.div
                                        key={engine.key}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={`flex items-center gap-3 p-3 rounded-xl ${isCompleted ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}
                                    >
                                        {isCompleted ? (
                                            <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-gray-300 flex-shrink-0" />
                                        )}
                                        <span className={`text-sm ${isCompleted ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                                            {engine.name}
                                        </span>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Generation Progress */}
                    {isGenerating && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mb-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Brain className="w-8 h-8" />
                                </motion.div>
                                <div>
                                    <h4 className="font-bold text-lg">AI Analysis in Progress...</h4>
                                    <p className="text-blue-100 text-sm">Generating strategic insights</p>
                                </div>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                                <motion.div
                                    className="bg-white h-2 rounded-full"
                                    animate={{ width: ["0%", "85%"] }}
                                    transition={{ duration: 30, ease: "easeInOut" }}
                                />
                            </div>
                        </motion.div>
                    )}

                    {/* Generate Button */}
                    <Form method="post">
                        <motion.button
                            type="submit"
                            disabled={isGenerating || completedCount < 5}
                            whileHover={{ scale: completedCount >= 5 ? 1.02 : 1 }}
                            whileTap={{ scale: completedCount >= 5 ? 0.98 : 1 }}
                            className={`w-full px-8 py-4 rounded-2xl font-bold text-white transition-all duration-200 flex items-center justify-center gap-3 text-lg ${isGenerating || completedCount < 5
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-xl hover:shadow-2xl"
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Processing Advisory...
                                </>
                            ) : (
                                <>
                                    <Brain className="w-6 h-6" />
                                    Generate HTI Advisory
                                </>
                            )}
                        </motion.button>
                    </Form>

                    {completedCount < 5 && (
                        <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-xl p-4">
                            <p className="text-sm text-yellow-800">
                                <strong>⚠️ Action Required:</strong> Complete all 5 assessment engines (currently {completedCount}/5) before generating an HTI advisory.
                            </p>
                        </div>
                    )}

                    {reports.filter((r: any) => r.status === "pending").length > 0 && (
                        <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-xl p-4">
                            <p className="text-sm text-blue-800">
                                <strong>⏳ {reports.filter((r: any) => r.status === "pending").length} advisory(ies) pending approval</strong>
                                <br />
                                You'll be notified once reviewed.
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Reports List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-3xl shadow-2xl p-8 border-2 border-gray-100"
                >
                    <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Brain className="w-8 h-8 text-blue-600" />
                        Your Advisory Reports
                    </h2>

                    {reports.length === 0 ? (
                        <div className="text-center py-16">
                            <Brain className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-xl font-medium">No advisory reports yet</p>
                            <p className="text-gray-400 mt-2">Generate your first HTI advisory to get started</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reports.map((report: any, idx: number) => (
                                <motion.div
                                    key={report.reportId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="border-2 border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:border-blue-300"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(report.status)}
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">
                                                    Advisory Report
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Generated: {new Date(report.generatedAt).toLocaleDateString("en-US", {
                                                        year: "numeric",
                                                        month: "long",
                                                        day: "numeric",
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        {getStatusBadge(report.status)}
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
                                        <p className="text-sm text-gray-700 line-clamp-3">
                                            {report.executiveSummary}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-semibold">{report.completedEngines}</span> of{" "}
                                            <span className="font-semibold">{report.totalEngines}</span> engines analyzed
                                        </div>

                                        {report.status === "approved" && (
                                            <a
                                                href={`/api/hti/reports/${report.reportId}/pdf`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
                                            >
                                                View Full Report
                                            </a>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
