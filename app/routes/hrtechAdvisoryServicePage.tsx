import { Link } from "@remix-run/react";
import {
    Brain,
    TrendingUp,
    Target,
    Lightbulb,
    CheckCircle2,
    ArrowRight,
    Layers,
    Zap,
    Shield,
    BarChart3,
    Users,
    Clock,
    DollarSign,
    AlertCircle
} from "lucide-react";
import { LoaderFunction, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPricingForCompany, PricingTier, PRICING_TIERS } from "~/utils/pricing.server";
import { requireUserSession, getUserSession } from "~/lib/session.server";
import { getCompanyProfile } from "~/models/company.model";

export const loader: LoaderFunction = async ({ request }) => {
    const sessionUser = await getUserSession(request);
    let recommendedTier = PRICING_TIERS.TRANSFORMATION; // Default

    if (sessionUser && sessionUser.organisationId) {
        const company = await getCompanyProfile(sessionUser.organisationId);
        if (company) {
            recommendedTier = getPricingForCompany(company.employee_count || 0);
        }
    }

    return json({ recommendedTier });
};

export default function HRTechAdvisoryServicePage() {
    const { recommendedTier } = useLoaderData<{ recommendedTier: PricingTier }>() || {};

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100">
            {/* Hero Section - Enhanced with Problem-Agitation */}
            <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white py-24 overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-20"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

                <div className="relative max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Content */}
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <Brain className="w-12 h-12 text-blue-300 animate-pulse" />
                                <span className="text-blue-300 font-semibold text-lg">Cognitive HR Advisory Module</span>
                            </div>

                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                Stop Buying Reports.
                                <span className="block text-yellow-300 mt-2">Start Making Decisions.</span>
                            </h1>

                            <p className="text-xl md:text-2xl text-blue-100 mb-4 max-w-3xl font-light">
                                The first AI-powered advisory layer that converts your HR data into
                                <span className="font-semibold text-white"> board-ready transformation strategies</span> — automatically.
                            </p>

                            <p className="text-lg text-blue-200 mb-8 max-w-3xl">
                                What Big-4 firms charge ₹2-3 Cr for, you get for <span className="font-bold text-yellow-300">50-70% less</span>.
                                And it works 24/7.
                            </p>

                            <div className="flex flex-wrap gap-4 mb-8">
                                <Link
                                    to="/auth"
                                    className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transition-all duration-200 shadow-lg hover:shadow-2xl flex items-center gap-2 transform hover:scale-105"
                                >
                                    See It In Action <ArrowRight className="w-5 h-5" />
                                </Link>
                                <a
                                    href="#pricing"
                                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 border-2 border-white/30"
                                >
                                    Explore Pricing Plans
                                </a>
                            </div>

                            {/* Trust Indicators */}
                            <div className="flex flex-wrap gap-8 items-center text-blue-200 text-sm">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <span>No consultants needed</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <span>Instant insights</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    <span>Board-ready outputs</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Illustration */}
                        <div className="hidden md:flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-3xl"></div>
                                <img
                                    src="/assets/advisoryAssets/hr_tech_advisory_illustration.png"
                                    alt="HR Tech Advisory Services Illustration"
                                    className="relative w-full max-w-lg drop-shadow-2xl"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Statistics Bar - Social Proof */}
            <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-yellow-400 mb-2">50-70%</div>
                            <div className="text-gray-300 text-sm">Cost Savings vs Big-4</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-green-400 mb-2">24/7</div>
                            <div className="text-gray-300 text-sm">Always-On Intelligence</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-blue-400 mb-2">4-Layer</div>
                            <div className="text-gray-300 text-sm">Advisory Architecture</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-400 mb-2">₹12L+</div>
                            <div className="text-gray-300 text-sm">Starting Investment</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* The Real Problem - Agitation */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Here's What's Actually Happening in Most Organizations
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 relative">
                            <div className="absolute -top-3 left-6 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                Traditional HR Tech
                            </div>
                            <div className="mt-4">
                                <div className="text-red-600 font-semibold mb-4 flex items-center gap-2">
                                    <DollarSign className="w-5 h-5" />
                                    You're Paying For:
                                </div>
                                <ul className="space-y-2 text-gray-700 mb-4">
                                    <li>• Dashboards no one uses</li>
                                    <li>• Reports that don't answer "so what?"</li>
                                    <li>• Metrics without meaning</li>
                                    <li>• Data without direction</li>
                                </ul>
                                <div className="bg-red-100 rounded-lg p-3 text-sm text-red-800">
                                    <strong>Result:</strong> You still need consultants to make sense of it all.
                                </div>
                            </div>
                        </div>

                        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 relative">
                            <div className="absolute -top-3 left-6 bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                Big-4 Consulting
                            </div>
                            <div className="mt-4">
                                <div className="text-yellow-700 font-semibold mb-4 flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    The Reality:
                                </div>
                                <ul className="space-y-2 text-gray-700 mb-4">
                                    <li>• ₹2-3 Cr for 3-month engagement</li>
                                    <li>• Beautiful PowerPoints</li>
                                    <li>• Generic frameworks</li>
                                    <li>• No ongoing support</li>
                                </ul>
                                <div className="bg-yellow-100 rounded-lg p-3 text-sm text-yellow-800">
                                    <strong>Result:</strong> Report sits on shelf. Nothing changes.
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 border-2 border-green-500 rounded-xl p-6 relative shadow-lg">
                            <div className="absolute -top-3 left-6 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                HTI Solution
                            </div>
                            <div className="mt-4">
                                <div className="text-green-600 font-semibold mb-4 flex items-center gap-2">
                                    <Zap className="w-5 h-5" />
                                    What You Get:
                                </div>
                                <ul className="space-y-2 text-gray-700 mb-4">
                                    <li>• Actionable recommendations</li>
                                    <li>• Prioritized roadmaps</li>
                                    <li>• ROI-driven decisions</li>
                                    <li>• Continuous intelligence</li>
                                </ul>
                                <div className="bg-green-100 rounded-lg p-3 text-sm text-green-800">
                                    <strong>Result:</strong> Transformation happens. Measurably.
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Urgency Element */}
                    <div className="bg-gradient-to-r from-orange-100 to-red-100 border-l-4 border-orange-500 rounded-r-xl p-6 max-w-4xl mx-auto">
                        <div className="flex items-start gap-4">
                            <AlertCircle className="w-8 h-8 text-orange-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    Every Quarter Without This Costs You
                                </h3>
                                <ul className="text-gray-700 space-y-1">
                                    <li>• Delayed transformation decisions</li>
                                    <li>• Wasted spend on wrong priorities</li>
                                    <li>• Competitive disadvantage in talent</li>
                                    <li>• Board questions you can't answer</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4-Layer Architecture */}
            <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <Layers className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            The Brain Layer: 4-Tier Intelligence Architecture
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            This isn't software. This is <span className="font-bold text-blue-600">consulting intelligence productized</span>.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Layer 1 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-blue-500 hover:shadow-2xl transition-shadow duration-300">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 rounded-full p-3">
                                    <BarChart3 className="w-8 h-8 text-blue-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        1. Aggregation Layer
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Pulls insights from all 5 HR Tek System modules and normalizes data across people, process, performance, skills, cost, and risk.
                                    </p>
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">
                                            <strong>Value:</strong> One source of truth. No more data silos or conflicting reports.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layer 2 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-green-500 hover:shadow-2xl transition-shadow duration-300">
                            <div className="flex items-start gap-4">
                                <div className="bg-green-100 rounded-full p-3">
                                    <Brain className="w-8 h-8 text-green-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        2. Interpretation Layer <span className="text-green-600">(Your Defensible Moat)</span>
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Converts reports into capability gaps, process maturity scores, digital readiness indicators, and workforce risk signals.
                                    </p>
                                    <div className="bg-green-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700 mb-2">
                                            <strong>This is the IP:</strong> Consulting logic encoded into software.
                                        </p>
                                        <p className="text-xs text-gray-600">
                                            What normally lives in consultant's heads is now systematic, repeatable, and always available.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layer 3 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-purple-500 hover:shadow-2xl transition-shadow duration-300">
                            <div className="flex items-start gap-4">
                                <div className="bg-purple-100 rounded-full p-3">
                                    <Target className="w-8 h-8 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        3. Transformation Mapping Layer
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Maps insights to HR Digital Transformation roadmap, operating model changes, technology interventions, and change management priorities.
                                    </p>
                                    <div className="bg-purple-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-700">
                                            <strong>Enterprise-Grade:</strong> From "here's your score" to "here's what must structurally change"
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Layer 4 */}
                        <div className="bg-white rounded-xl shadow-lg p-8 border-l-4 border-orange-500 hover:shadow-2xl transition-shadow duration-300">
                            <div className="flex items-start gap-4">
                                <div className="bg-orange-100 rounded-full p-3">
                                    <Lightbulb className="w-8 h-8 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        4. Advisory & Recommendation Engine
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Answers "So what?" and "Now what?" with prioritization, ROI logic, risk containment, and workforce implications.
                                    </p>
                                    <div className="bg-orange-50 rounded-lg p-4 space-y-2">
                                        <p className="text-sm text-gray-700 font-semibold">Tells you exactly:</p>
                                        <ul className="text-sm text-gray-700 space-y-1 ml-4">
                                            <li>• Which HR processes to digitize first (based on scoring)</li>
                                            <li>• Where AI/automation will give max ROI</li>
                                            <li>• What NOT to change yet (risk containment)</li>
                                            <li>• Skill & org redesign implications</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof / Testimonial Placeholder */}
            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-12 text-white text-center">
                        <Users className="w-16 h-16 mx-auto mb-6 text-blue-200" />
                        <blockquote className="text-2xl md:text-3xl font-light italic mb-6">
                            "This module does what our ₹2.5 Cr consulting engagement promised but never delivered —
                            <span className="font-semibold"> actionable transformation guidance that updates quarterly</span>,
                            not a static report from 6 months ago."
                        </blockquote>
                        <div className="text-blue-200">
                            <p className="font-semibold">CHRO, Fortune 500 Company</p>
                            <p className="text-sm">5,000+ employees</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why This Matters - Emotional Appeal */}
            <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Why CHROs Choose This Over Everything Else
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-blue-900 mb-4">For Your Board</h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                    <span>Answer "What's our HR transformation ROI?" with data</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                    <span>Board-ready outputs (strategy packs, PDFs)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                                    <span>Defend budget decisions with intelligence, not intuition</span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-xl p-8 shadow-lg">
                            <h3 className="text-2xl font-bold text-green-900 mb-4">For Your Team</h3>
                            <ul className="space-y-3 text-gray-700">
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                    <span>Stop guessing which initiatives to prioritize</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                    <span>Continuous guidance, not one-time consulting</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                                    <span>Build transformation muscle internally</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="mt-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-8 text-center">
                        <p className="text-2xl font-bold text-purple-900 mb-2">
                            "A digital CHRO advisory office — powered by intelligence, not headcount."
                        </p>
                        <p className="text-lg text-purple-700">
                            — The Brain Layer of HR Tek System
                        </p>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-16 bg-gradient-to-br from-gray-900 to-blue-900 text-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-4">
                        <h2 className="text-4xl font-bold mb-4">
                            Transform Your HR Strategy Today
                        </h2>
                        <p className="text-xl text-blue-200 mb-2">
                            Get 365 days of AI-powered advisory intelligence for the cost of just 3 weeks of traditional consulting
                        </p>
                        <p className="text-sm text-yellow-300 font-semibold">
                            💡 Join forward-thinking CHROs who've already made the switch • ROI visible in 90 days
                        </p>
                    </div>

                </div>

                <div className="grid md:grid-cols-3 gap-8 mt-12">
                    {/* Tier 1 */}
                    <div className={`bg-white text-gray-900 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:scale-105 ${recommendedTier?.id === 'essentials' ? 'ring-4 ring-yellow-400 transform scale-105' : ''}`}>
                        {recommendedTier?.id === 'essentials' && (
                            <div className="bg-yellow-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full w-max mx-auto mb-4">
                                RECOMMENDED FOR YOU
                            </div>
                        )}
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">Advisory Essentials</h3>
                            <p className="text-gray-600 text-sm mb-4">For mid-size enterprises</p>
                            <div className="text-4xl font-bold text-blue-600 mb-2">
                                ₹12-18L
                            </div>
                            <p className="text-gray-500 text-sm">per year</p>
                            <p className="text-gray-500 text-xs mt-1">USD 18,000 - 25,000</p>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Aggregation from all HR-Tek modules</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Interpretation Layer (maturity, gaps, readiness)</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Standard transformation insights</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">CXO summary dashboard</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Confidence & explainability indicators</span>
                            </div>
                        </div>

                        <Link
                            to="/auth"
                            className="block w-full text-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Tier 2 - Recommended */}
                    <div className={`bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-8 shadow-2xl relative z-10 transition-all duration-300 hover:scale-105 ${recommendedTier?.id === 'transformation' ? 'transform scale-110 border-4 border-yellow-400' : ''}`}>
                        {(recommendedTier?.id === 'transformation' || !recommendedTier) && (
                            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-gray-900 px-4 py-1 rounded-full text-sm font-bold animate-pulse">
                                MOST POPULAR
                            </div>
                        )}

                        <div className="text-center mb-6 mt-4">
                            <h3 className="text-2xl font-bold mb-2">Transformation Intelligence</h3>
                            <p className="text-blue-100 text-sm mb-4">For enterprises (500-5,000 employees)</p>
                            <div className="text-4xl font-bold mb-2">
                                ₹28-40L
                            </div>
                            <p className="text-blue-200 text-sm">per year</p>
                            <p className="text-blue-200 text-xs mt-1">USD 40,000 - 60,000</p>
                            <div className="mt-3 text-xs text-yellow-300 font-semibold">
                                70% of our clients choose this tier
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                                <span className="text-sm font-semibold">Everything in Essentials plus:</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                                <span className="text-sm">Transformation Mapping Layer</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                                <span className="text-sm">Priority & dependency engine</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                                <span className="text-sm">Advisory & recommendation engine</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                                <span className="text-sm">ROI-based digitization guidance</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                                <span className="text-sm">Risk-aware "Do Not Transform Yet" flags</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                                <span className="text-sm">Operating model implications</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-yellow-300 mt-1 flex-shrink-0" />
                                <span className="text-sm">Quarterly transformation intelligence refresh</span>
                            </div>
                        </div>

                        <Link
                            to="/auth"
                            className="block w-full text-center px-6 py-3 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transition-colors shadow-lg"
                        >
                            Start Transformation
                        </Link>
                    </div>

                    {/* Tier 3 */}
                    <div className={`bg-white text-gray-900 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:scale-105 ${recommendedTier?.id === 'enterprise' ? 'ring-4 ring-purple-600 transform scale-105' : ''}`}>
                        {recommendedTier?.id === 'enterprise' && (
                            <div className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full w-max mx-auto mb-4">
                                RECOMMENDED FOR YOU
                            </div>
                        )}
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold mb-2">Enterprise Cognitive Advisory</h3>
                            <p className="text-gray-600 text-sm mb-4">Board / CXO Tier</p>
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                                Contact Us
                            </div>
                            <p className="text-gray-500 text-sm">for pricing</p>
                            <p className="text-gray-500 text-xs mt-1">&nbsp;</p>
                            <div className="mt-3 text-xs text-purple-600 font-semibold">
                                For global transformation programs
                            </div>
                        </div>

                        <div className="space-y-3 mb-8">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm font-semibold">Everything in Transformation plus:</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Scenario & simulation modelling</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Multi-country / multi-entity intelligence</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Executive decision cockpit</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Advisory logic customization</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Agentic HR AI workflows (human-in-loop)</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Board-ready outputs</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                                <span className="text-sm">Priority access & SLA</span>
                            </div>
                        </div>

                        <Link
                            to="/auth"
                            className="block w-full text-center px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                        >
                            Contact Sales
                        </Link>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <p className="text-blue-200 text-sm mb-2">
                        * Prices vary based on organization size (500 to 15,000+ employees)
                    </p>
                    <p className="text-blue-200 text-sm mb-4">
                        Multi-year discounts available | Strategic logo clients: Custom pricing
                    </p>
                    <div className="inline-block bg-yellow-400/20 border border-yellow-400 rounded-lg px-6 py-3">
                        <p className="text-yellow-300 font-semibold">
                            💰 Limited Time: First 10 clients get 15% founding customer discount
                        </p>
                    </div>
                </div>
            </section>

            {/* Final CTA - Urgency */}
            <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <Shield className="w-16 h-16 mx-auto mb-6 text-blue-200" />
                    <h2 className="text-4xl font-bold mb-4">
                        Your Board Will Ask: "What's Our HR Transformation Strategy?"
                    </h2>
                    <p className="text-xl text-blue-100 mb-2">
                        Will you have data-driven answers, or another PowerPoint?
                    </p>
                    <p className="text-lg text-blue-200 mb-8">
                        Join CHROs who've replaced consulting fees with continuous intelligence.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            to="/auth"
                            className="px-8 py-4 bg-yellow-400 text-gray-900 rounded-lg font-bold hover:bg-yellow-300 transition-all duration-200 shadow-lg hover:shadow-2xl flex items-center gap-2 transform hover:scale-105"
                        >
                            Start Your Transformation <ArrowRight className="w-5 h-5" />
                        </Link>
                        <a
                            href="/#contact"
                            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-lg font-semibold hover:bg-white/20 transition-all duration-200 border-2 border-white/30"
                        >
                            Schedule a Demo
                        </a>
                    </div>
                    <p className="text-sm text-blue-200 mt-6">
                        ✓ No credit card required  ✓ 30-day pilot available  ✓ Board-ready demo in 48 hours
                    </p>
                </div>
            </section>
        </div>
    );
}
