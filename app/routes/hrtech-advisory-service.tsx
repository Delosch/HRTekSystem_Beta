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
import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { LoaderFunction, json, MetaFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { getPricingForCompany, PricingTier, PRICING_TIERS } from "~/utils/pricing.server";
import { requireUserSession, getUserSession } from "~/lib/session.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { generateMeta, generateBreadcrumbSchema, generateServiceSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
    return generateMeta({
        title: "Cognitive HR Advisory - AI-Powered HR Strategy",
        description: "Experience the first AI-powered advisory layer that converts HR data into board-ready strategies. 50-70% cost savings compared to traditional consulting.",
        keywords: "HR advisory, cognitive HR strategy, AI consulting, board-ready HR reports, HR digital transformation advisor, HR ROI strategy",
        url: "https://www.hrteksystem.com/hrtech-advisory-service",
        image: "https://www.hrteksystem.com/og-advisory.jpg",
    });
};

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

    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "HRTech Advisory", url: "/hrtech-advisory-service" }
    ]);

    const serviceSchema = generateServiceSchema({
        name: "Cognitive HR Advisory",
        description: "AI-powered strategic HR advisory layer",
        provider: "HRTek System",
        areaServed: "Global",
        url: "https://www.hrteksystem.com/hrtech-advisory-service"
    });

    return (
        <>
            <link rel="canonical" href="https://www.hrteksystem.com/hrtech-advisory-service" />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
            />
            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 font-sans">
                <Navbar />
                {/* Hero Section - Enhanced with Problem-Agitation */}
                {/* Hero Section - Modern Professional Design */}
                <div className="relative bg-gradient-to-br from-[#001845] via-[#023e8a] to-[#0077b6] overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }}></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                            {/* Left Side: Content */}
                            <div className="space-y-8">
                                {/* Badge */}
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-white/90 text-sm font-medium">Cognitive HR Advisory Module</span>
                                </div>

                                {/* Main Heading */}
                                <div className="space-y-4">
                                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                                        Stop Buying Reports.
                                        <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                            Start Making Decisions.
                                        </span>
                                    </h1>
                                    <p className="text-xl md:text-2xl font-semibold text-white/90 leading-relaxed">
                                        Board-Ready Transformation Strategies—Automatically.
                                    </p>
                                </div>

                                {/* Description */}
                                <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                                    The first AI-powered advisory layer that converts your HR data into actionable strategies.
                                    What Big-4 firms charge ₹2-3 Cr for, you get for 50-70% less. And it works 24/7.
                                </p>

                                {/* CTA Buttons */}
                                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                    <Link
                                        to="/auth"
                                        className="group px-8 py-4 bg-yellow-400 hover:bg-yellow-300 text-[#0B2A57] rounded-xl font-bold text-lg shadow-2xl hover:shadow-yellow-400/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
                                    >
                                        See It In Action
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                    <a
                                        href="#pricing"
                                        className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                                    >
                                        Explore Pricing
                                    </a>
                                </div>

                                {/* Trust Indicators */}
                                <div className="flex flex-wrap gap-6 pt-8 border-t border-white/20 text-white/80 text-sm font-medium">
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

                            {/* Right Side: Image */}
                            <div className="relative lg:h-[600px] flex items-center justify-center">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl rounded-full"></div>

                                {/* Image Container */}
                                <div className="relative z-10 w-full h-full flex items-center justify-center">
                                    <img
                                        src="/assets/advisoryAssets/hr_tech_advisory_illustration.png"
                                        alt="HR Tech Advisory Services Illustration"
                                        className="w-full h-auto max-h-[550px] object-contain drop-shadow-2xl transform hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Wave */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                        </svg>
                    </div>
                </div>

                {/* Statistics Bar - Executive Impact */}
                <section className="relative -mt-10 z-20 px-6">
                    <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 p-8 grid md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        <div className="group hover:-translate-y-1 transition-transform duration-300">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-2">50-70%</div>
                            <div className="text-gray-500 font-medium text-sm tracking-wide uppercase">Cost Savings vs Big-4</div>
                        </div>
                        <div className="group hover:-translate-y-1 transition-transform duration-300 pt-6 md:pt-0">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-600 mb-2">24/7</div>
                            <div className="text-gray-500 font-medium text-sm tracking-wide uppercase">Always-On Intelligence</div>
                        </div>
                        <div className="group hover:-translate-y-1 transition-transform duration-300 pt-6 md:pt-0">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">4-Layer</div>
                            <div className="text-gray-500 font-medium text-sm tracking-wide uppercase">Advisory Architecture</div>
                        </div>
                        <div className="group hover:-translate-y-1 transition-transform duration-300 pt-6 md:pt-0">
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-500 mb-2">10x</div>
                            <div className="text-gray-500 font-medium text-sm tracking-wide uppercase">ROI in First 90 Days</div>
                        </div>
                    </div>
                </section>

                {/* The Real Problem - Strategic Comparison */}
                <section className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                                The Advisory Gap
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Why traditional models are failing the modern CHRO.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 mb-16">
                            {/* Traditional */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-6">
                                    <DollarSign className="w-6 h-6 text-red-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Traditional HR Tech</h3>
                                <ul className="space-y-4 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 mt-1">✕</span>
                                        <span>Static dashboards nobody uses</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 mt-1">✕</span>
                                        <span>Data without context</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-red-500 mt-1">✕</span>
                                        <span>Reactive reporting</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Consulting */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-6">
                                    <Clock className="w-6 h-6 text-yellow-600" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-4">Legacy Consulting</h3>
                                <ul className="space-y-4 text-gray-600">
                                    <li className="flex items-start gap-3">
                                        <span className="text-yellow-500 mt-1">✕</span>
                                        <span>Expensive (₹2-3 Cr/project)</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-yellow-500 mt-1">✕</span>
                                        <span>Slow time-to-value</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="text-yellow-500 mt-1">✕</span>
                                        <span>One-off PowerPoint decks</span>
                                    </li>
                                </ul>
                            </div>

                            {/* HTI Solution - Featured */}
                            <div className="bg-[#0B2A57] text-white p-8 rounded-2xl shadow-2xl relative overflow-hidden transform md:-translate-y-4">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -ml-16 -mb-16"></div>

                                <div className="relative z-10">
                                    <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/20">
                                        <Zap className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-4">Cognitive Advisory</h3>
                                    <ul className="space-y-4 text-blue-100">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                                            <span>Continuous, AI-driven insights</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                                            <span>Actionable roadmaps, not slides</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                                            <span>Fraction of the cost</span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-green-400 mt-1 shrink-0" />
                                            <span>Board-ready deliverables</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 4-Layer Architecture - Premium Visualization */}
                <section className="py-24 bg-white overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-20">
                            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Proprietary IP</span>
                            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-3 mb-6">
                                Inside the Brain Layer
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Consulting intelligence, codified into 4 powerful tiers.
                            </p>
                        </div>

                        <div className="relative">
                            {/* Connecting Line (Desktop) */}
                            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-blue-200 via-purple-200 to-orange-200 -z-10"></div>

                            <div className="space-y-12">
                                {/* Layer 1 */}
                                <div className="relative grid md:grid-cols-2 gap-12 items-center group">
                                    <div className="md:text-right space-y-4">
                                        <div className="inline-block p-3 rounded-2xl bg-blue-50 text-blue-600 mb-2">
                                            <BarChart3 className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">1. Aggregation Layer</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Seamlessly ingests data across People, Process, Performance, and Cost.
                                            Creates a unified "Single Source of Truth" that eliminates silos.
                                        </p>
                                    </div>
                                    <div className="hidden md:flex justify-center md:absolute left-1/2 -translate-x-1/2">
                                        <div className="w-8 h-8 rounded-full bg-white border-4 border-blue-500 z-10"></div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                                        <h4 className="font-bold text-gray-900 mb-2">Benefit</h4>
                                        <p className="text-sm text-gray-600">Eliminates 100+ hours of manual data gathering per quarter.</p>
                                    </div>
                                </div>

                                {/* Layer 2 */}
                                <div className="relative grid md:grid-cols-2 gap-12 items-center group">
                                    <div className="order-2 md:order-1 bg-gray-50 rounded-2xl p-8 border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                                        <h4 className="font-bold text-gray-900 mb-2">The Moat</h4>
                                        <p className="text-sm text-gray-600">Consulting logic encoded into software rulesets.</p>
                                    </div>
                                    <div className="hidden md:flex justify-center md:absolute left-1/2 -translate-x-1/2">
                                        <div className="w-8 h-8 rounded-full bg-white border-4 border-green-500 z-10"></div>
                                    </div>
                                    <div className="order-1 md:order-2 space-y-4">
                                        <div className="inline-block p-3 rounded-2xl bg-green-50 text-green-600 mb-2">
                                            <Brain className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">2. Interpretation Layer</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Analyzes raw data against maturity models and industry benchmarks.
                                            Identifies capability gaps and operational risks automatically.
                                        </p>
                                    </div>
                                </div>

                                {/* Layer 3 */}
                                <div className="relative grid md:grid-cols-2 gap-12 items-center group">
                                    <div className="md:text-right space-y-4">
                                        <div className="inline-block p-3 rounded-2xl bg-purple-50 text-purple-600 mb-2">
                                            <Target className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">3. Transformation Mapping</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Translates gaps into strategic roadmaps.
                                            Prioritizes initiatives based on impact, effort, and organizational readiness.
                                        </p>
                                    </div>
                                    <div className="hidden md:flex justify-center md:absolute left-1/2 -translate-x-1/2">
                                        <div className="w-8 h-8 rounded-full bg-white border-4 border-purple-500 z-10"></div>
                                    </div>
                                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                                        <h4 className="font-bold text-gray-900 mb-2">Strategic Output</h4>
                                        <p className="text-sm text-gray-600">Quarterly Transformation Roadmap (PDF & Interactive).</p>
                                    </div>
                                </div>

                                {/* Layer 4 */}
                                <div className="relative grid md:grid-cols-2 gap-12 items-center group">
                                    <div className="order-2 md:order-1 bg-gray-50 rounded-2xl p-8 border border-gray-100 group-hover:shadow-lg transition-all duration-300">
                                        <h4 className="font-bold text-gray-900 mb-2">Executive Advantage</h4>
                                        <p className="text-sm text-gray-600">Answers "Now What?" with ROI-backed decisions.</p>
                                    </div>
                                    <div className="hidden md:flex justify-center md:absolute left-1/2 -translate-x-1/2">
                                        <div className="w-8 h-8 rounded-full bg-white border-4 border-orange-500 z-10"></div>
                                    </div>
                                    <div className="order-1 md:order-2 space-y-4">
                                        <div className="inline-block p-3 rounded-2xl bg-orange-50 text-orange-600 mb-2">
                                            <Lightbulb className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900">4. Advisory Engine</h3>
                                        <p className="text-gray-600 leading-relaxed">
                                            Delivers final, board-ready recommendations.
                                            Predicts outcomes and simulates "What-If" scenarios for budget planning.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Social Proof - Editorial Style */}
                <section className="py-24 bg-[#0B2A57] text-white">
                    <div className="max-w-4xl mx-auto px-6 text-center">
                        <Users className="w-12 h-12 text-blue-400 mx-auto mb-8" />
                        <blockquote className="text-3xl md:text-5xl font-serif leading-tight italic mb-10 opacity-90">
                            "The only platform that gave me a board-ready transformation strategy
                            in <span className="text-blue-400">weeks</span>, not months."
                        </blockquote>
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/30 flex items-center justify-center text-xl font-bold">
                                VR
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-lg">Vikram R.</div>
                                <div className="text-blue-300 text-sm">CHRO, Manufacturing Conglomerate (12k Employees)</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Pricing Section - Exclusive Tiers */}
                <section id="pricing" className="py-24 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
                                Choose Your Transformation Tier
                            </h2>
                            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                                Flexible engagement models designed for your scale.
                            </p>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8 items-start">
                            {/* Tier 1 */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-blue-500/30 transition-all duration-300 relative group">
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-700 uppercase tracking-wider">Essentials</h3>
                                    <div className="mt-6 flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-gray-900 tracking-tight">Contact Us</span>
                                    </div>
                                    <p className="text-blue-600 font-medium text-sm mt-3 bg-blue-50 inline-block px-3 py-1 rounded-full">For mid-size growth companies</p>
                                </div>
                                <a href="#contact" className="block w-full py-4 text-center rounded-xl border-2 border-slate-900 text-slate-900 font-bold hover:bg-slate-900 hover:text-white transition-all">
                                    Contact Sales
                                </a>
                                <div className="mt-8 space-y-4">
                                    <div className="text-sm font-semibold text-gray-900">Core Capabilities:</div>
                                    <ul className="space-y-3 text-sm text-gray-600">
                                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /> Full Data Aggregation</li>
                                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /> CXO Summary Dashboard</li>
                                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /> Basic Maturity Scoring</li>
                                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" /> Quarterly Report Refresh</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Tier 2 - Pop */}
                            <div className="bg-[#0B2A57] rounded-3xl p-8 shadow-2xl shadow-blue-900/30 transform md:-translate-y-6 relative overflow-hidden border border-blue-800">
                                <div className="absolute top-0 right-0 p-4">
                                    <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-[#0B2A57] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">Most Popular</span>
                                </div>
                                <div className="mb-8 relative z-10">
                                    <h3 className="text-xl font-bold text-blue-100 uppercase tracking-wider">Transformation</h3>
                                    <div className="mt-6 flex items-baseline gap-1 text-white">
                                        <span className="text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-200 drop-shadow-lg">Contact Us</span>
                                    </div>
                                    <p className="text-white font-medium text-sm mt-3 bg-white/10 inline-block px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">For enterprise-grade transformation</p>
                                </div>
                                <a href="#contact" className="block w-full py-4 text-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold hover:from-blue-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-blue-500/50 hover:-translate-y-1">
                                    Contact Sales
                                </a>
                                <div className="mt-8 space-y-4 relative z-10">
                                    <div className="text-sm font-bold text-white uppercase tracking-wide">Everything in Essentials +</div>
                                    <ul className="space-y-4 text-sm text-blue-50">
                                        <li className="flex gap-3 items-center"><div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /></div> Transformation Mapping Layer</li>
                                        <li className="flex gap-3 items-center"><div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /></div> Priority & Dependency Engine</li>
                                        <li className="flex gap-3 items-center"><div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /></div> Operating Model Designer</li>
                                        <li className="flex gap-3 items-center"><div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /></div> ROI Calculator</li>
                                        <li className="flex gap-3 items-center"><div className="bg-green-500/20 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" /></div> 24/7 Advisory Assistant</li>
                                    </ul>
                                </div>
                                {/* Background Elements */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('/bg-pattern.svg')] opacity-5 z-0"></div>
                            </div>

                            {/* Tier 3 */}
                            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:border-purple-500/30 transition-all duration-300 relative group">
                                <div className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-700 uppercase tracking-wider">Global Enterprise</h3>
                                    <div className="mt-6 flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-gray-900 tracking-tight">Custom Plan</span>
                                    </div>
                                    <p className="text-purple-600 font-medium text-sm mt-3 bg-purple-50 inline-block px-3 py-1 rounded-full">For multi-entity multinationals</p>
                                </div>
                                <a href="#contact" className="block w-full py-4 text-center rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-purple-600 hover:text-purple-600 transition-all">
                                    Contact Sales
                                </a>
                                <div className="mt-8 space-y-4">
                                    <div className="text-sm font-semibold text-gray-900">Custom capabilities:</div>
                                    <ul className="space-y-3 text-sm text-gray-600">
                                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" /> Multi-country Intelligence</li>
                                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" /> Custom Logic Models</li>
                                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" /> Dedicated Success Director</li>
                                        <li className="flex gap-3"><CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0" /> Board Presentation Support</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Final CTA - Urgency */}
                <section id="contact" className="relative py-24 overflow-hidden">
                    <div className="absolute inset-0 bg-[#001845]">
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    </div>
                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">
                            Transform Your HR Function.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
                                Without The Consulting Fees.
                            </span>
                        </h2>
                        <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto">
                            Join the CHROs who are leading with data, not guessing with intuition.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                to="/auth"
                                className="px-10 py-5 bg-white text-[#0B2A57] rounded-xl font-bold text-lg hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-white/20"
                            >
                                Get Started Now
                            </Link>
                            <a
                                href="mailto:demo@hrtek.com"
                                className="px-10 py-5 bg-transparent border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                            >
                                Request Executive Demo
                            </a>
                        </div>
                    </div>
                </section>

                {/* Video Tutorial Section */}
                <section className="py-20 bg-white">
                    <div className="max-w-5xl mx-auto px-6">
                        <div className="text-center mb-10">
                            <span className="inline-block px-4 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Video Tutorial</span>
                            <h2 className="text-3xl font-bold text-gray-900 mb-3">See HR Tech Advisory Layer In Action</h2>
                            <p className="text-gray-500 max-w-xl mx-auto text-sm">Watch how the HR Tech Advisory Layer delivers executive-grade strategic intelligence and vendor-agnostic guidance for your transformation.</p>
                        </div>
                        <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-slate-900" style={{ aspectRatio: '16/9' }}>
                            <iframe
                                src="https://www.youtube.com/embed/3_mEgGnjFXc"
                                title="HR Tech Advisory Layer Tutorial"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="absolute inset-0 w-full h-full"
                            />
                        </div>
                    </div>
                </section>

                <Footer />
            </div>
        </>
    );
}
