import { json, LoaderFunctionArgs, MetaFunction, redirect } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Map, Puzzle, FileBarChart2, DraftingCompass, Shapes, Check, Zap } from "lucide-react";
import { SUBSCRIPTION_TIERS, ENGINE_PRICING, BUNDLE_PRICING } from "~/config/pricing.config";
import { getUserSession } from "~/lib/session.server";
import { generateMeta, generateBreadcrumbSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
    return generateMeta({
        title: "Pricing Plans - Affordable HR Transformation Solutions",
        description: "Explore HRTek System's flexible pricing plans for HR transformation. Choose from Starter, Professional, or Enterprise packages. Transparent pricing with no hidden fees.",
        keywords: "HR software pricing, HCM pricing, HR transformation cost, affordable HR solutions, enterprise HR pricing",
        url: "https://www.hrteksystem.com/pricing",
        image: "https://www.hrteksystem.com/logo_icon_final.png",
        robots: "noindex, nofollow", 
    });
};

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await getUserSession(request);
    if (!user) {
        return redirect("/auth?redirectTo=/pricing");
    }
    return json({
        tiers: SUBSCRIPTION_TIERS,
        engines: ENGINE_PRICING,
        bundle: BUNDLE_PRICING.allEngines,
        isLoggedIn: true
    });
}

import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "~/components/Footer";

export default function PricingPage() {
    const { tiers, engines, isLoggedIn } = useLoaderData<typeof loader>();

    // Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Pricing", url: "/pricing" }
    ]);

    // Mapping engine IDs to their respective icons from the home page
    const getEngineIcon = (id: string, className: string) => {
        switch (id) {
            case "digital-roadmap":
                return <Map className={className} />;
            case "hcm-vendor-fit":
                return <Puzzle className={className} />;
            case "hr-tech-maturity":
                return <FileBarChart2 className={className} />;
            case "shared-services":
                return <DraftingCompass className={className} />;
            case "change-management":
                return <Shapes className={className} />;
            default:
                return <Zap className={className} />;
        }
    };

    return (
        <>
            <link rel="canonical" href="https://www.hrteksystem.com/pricing" />

            {/* Breadcrumb Schema */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <div className="min-h-screen bg-white">
                <Navbar />

                {/* Hero Section - Modern Professional Design */}
                <div className="relative bg-gradient-to-br from-[#001845] via-[#023e8a] to-[#0077b6] overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }}></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32 text-center z-10">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6 animate-bounce">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-white/90 text-sm font-medium">Transparent Enterprise Pricing</span>
                        </div>

                        {/* Main Heading */}
                        <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-8">
                            The Intelligence Layer
                            <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                For HR Transformation
                            </span>
                        </h1>

                        <p className="text-xl md:text-3xl text-white/80 max-w-4xl mx-auto leading-relaxed mb-10">
                            Select individual engines or subscribe to full transformation tiers designed for your organizational scale.
                        </p>

                        {/* Bottom Wave */}
                        <div className="absolute bottom-0 left-0 right-0">
                            <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto translate-y-px">
                                <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Assessment Engines Section */}
                <div className="bg-white py-24 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold text-[#001845] mb-6">
                                Decision-Making Engines
                            </h2>
                            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full mb-6"></div>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                High-precision diagnostic tools to analyze, predict, and optimize your HR architecture.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-16">
                            {engines.map((engine) => (
                                <Link
                                    key={engine.id}
                                    to={isLoggedIn ? `/engine/${engine.id}` : `/auth?redirectTo=/engine/${engine.id}`}
                                    className="group relative bg-[#f8fbff] rounded-3xl overflow-hidden border border-blue-100 shadow-sm hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 cursor-pointer"
                                >
                                    <div className="h-2 bg-[#023e8a]" />

                                    <div className="p-8">
                                        <div className="flex items-start justify-between mb-6">
                                            <div className="bg-white p-4 rounded-2xl group-hover:bg-blue-600 group-hover:scale-110 transition-all duration-500 shadow-sm">
                                                {getEngineIcon(engine.id, "w-10 h-10 text-[#023e8a] group-hover:text-white transition-colors duration-500")}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-semibold text-blue-600 uppercase tracking-widest">Contact Us</div>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors">
                                            {engine.name}
                                        </h3>

                                        <p className="text-gray-600 text-base leading-relaxed mb-8 min-h-[4.5rem] line-clamp-3">
                                            {engine.description}
                                        </p>

                                        <div className="flex items-center justify-center gap-3 py-4 px-6 bg-[#023e8a] group-hover:bg-[#001845] text-white rounded-2xl font-bold text-lg shadow-lg group-hover:shadow-blue-200 transition-all duration-300">
                                            <span>{isLoggedIn ? 'Launch Engine' : 'Login to Access'}</span>
                                            <svg className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Enhanced Bundle Offer */}
                        <div className="relative group overflow-hidden bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-1 md:p-1.5 shadow-2xl">
                            <div className="bg-white rounded-[1.4rem] p-8 md:p-12">
                                <div className="grid lg:grid-cols-3 gap-10 items-center">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="flex items-center gap-4">
                                            <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest">
                                                Infinite Value Bundle
                                            </span>
                                            <span className="text-green-600 font-bold text-lg">Best Value Bundle</span>
                                        </div>
                                        <h3 className="text-4xl font-bold text-gray-900">The Complete Cognitive Suite</h3>
                                        <p className="text-xl text-gray-600 leading-relaxed">
                                            Get unlimited access to all 5 assessment engines. This is the ultimate toolkit for CHROs and Transformation Leads looking to architect a future-ready HR function.
                                        </p>
                                    </div>
                                    <div className="text-center lg:text-right space-y-6">
                                        <div>
                                            <div className="text-2xl font-bold text-green-600 tracking-tighter">
                                                Custom Pricing
                                            </div>
                                        </div>
                                        <Link
                                            to="/contact"
                                            className="inline-flex items-center justify-center w-full lg:w-auto bg-green-600 text-white hover:bg-green-700 px-12 py-5 rounded-2xl font-bold text-xl shadow-xl hover:shadow-green-200 transition-all transform hover:scale-105"
                                        >
                                            Inquire for Bundle
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Subscription Section - Dark Premium Theme */}
                <div className="bg-[#000814] py-24 text-white relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
                        <div className="h-full w-full bg-[url('/assets/grid-white.svg')]"></div>
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10">
                        <div className="text-center mb-20">
                            <h2 className="text-4xl md:text-6xl font-bold mb-6">
                                Transformation Tiers
                            </h2>
                            <div className="w-32 h-1.5 bg-blue-500 mx-auto rounded-full mb-6"></div>
                            <p className="text-2xl text-blue-100/70 max-w-3xl mx-auto">
                                Scalable engagement models for continuous strategic support.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {tiers.map((tier) => (
                                <div
                                    key={tier.id}
                                    className={`relative rounded-[2.5rem] p-8 sm:p-10 flex flex-col transition-all duration-500 group border-2 ${tier.id === "enterprise"
                                        ? "bg-gradient-to-br from-blue-900 via-[#000814] to-indigo-950 border-blue-500 shadow-[0_0_50px_rgba(59,130,246,0.3)] lg:scale-110 z-20"
                                        : "bg-[#0b132b] border-[#1c2a4a] hover:border-blue-400/50 hover:bg-[#121f3d]"
                                        }`}
                                >
                                    {tier.id === "enterprise" && (
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-sm font-semibold px-6 py-2 rounded-full shadow-2xl tracking-[0.2em] transform uppercase">
                                            Executive Choice
                                        </div>
                                    )}

                                    <div className="mb-10 text-center">
                                        <h3 className="text-3xl font-bold mb-4 group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                                            {tier.name}
                                        </h3>
                                        <div className="text-blue-200/50 font-bold tracking-widest text-xs uppercase mb-6">
                                            {tier.employeeMin.toLocaleString()} - {tier.employeeMax ? tier.employeeMax.toLocaleString() : "Unlimited"} EMPLOYEES
                                        </div>
                                        <div className="flex items-baseline justify-center gap-2">
                                            <span className="text-2xl lg:text-3xl font-bold text-white">Custom Pricing</span>
                                        </div>
                                    </div>

                                    <div className="flex-grow space-y-8 mb-10">
                                        <div className={`p-4 rounded-xl text-center font-bold uppercase text-sm tracking-widest ${tier.id === "enterprise" ? "bg-blue-600/20 text-blue-400" : "bg-white/5 text-blue-200/70"}`}>
                                            {tier.includedEngines === 5
                                                ? "Complete Suite Access"
                                                : `${tier.includedEngines} Selection Engines`}
                                        </div>

                                        <ul className="space-y-4">
                                            {tier.features.map((feature, idx) => (
                                                <li key={idx} className="flex items-start gap-4">
                                                    <div className="mt-1 p-0.5 bg-blue-500 rounded-full">
                                                        <Check className="w-4 h-4 text-white" strokeWidth={4} />
                                                    </div>
                                                    <span className="text-gray-300 font-medium group-hover:text-white transition-colors">
                                                        {feature}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <a
                                        href="/#contact"
                                        className={`block w-full text-center py-5 rounded-2xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl uppercase tracking-widest ${tier.id === "enterprise"
                                            ? "bg-blue-500 text-white hover:bg-blue-400 shadow-blue-500/20"
                                            : "bg-white text-[#000814] hover:bg-blue-50"
                                            }`}
                                    >
                                        {tier.isCustom ? "Get Consultation" : "Activate Tier"}
                                    </a>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Polished FAQ Section */}
                <div className="max-w-5xl mx-auto px-6 py-24">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 font-bold uppercase tracking-[0.3em] text-sm">Common Queries</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4 underline decoration-blue-600 decoration-4 underline-offset-8">Support & Licensing</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        {[
                            {
                                q: "What's included in each subscription tier?",
                                a: "Every tier grants centralized dashboard access, comprehensive AI diagnostics, and dedicated email support. Strategic tiers include advanced multi-module integration and priority advisory hours."
                            },
                            {
                                q: "Can I upgrade my plan later?",
                                a: "Absolutely. Our platform supports seamless scalability. You can upgrade your tier or add modular engines at any time, with costs automatically prorated to your existing cycle."
                            },
                            {
                                q: "What payment methods do you accept?",
                                a: "We support enterprise billing via NEFT/Wire, as well as immediate digital fulfillment through UPI and Corporate Cards. All Indian transactions include standard 18% GST."
                            },
                            {
                                q: "Do you offer customized licensing?",
                                a: "Yes. For multi-entity conglomerates or non-profits, we offer bespoke engagement models. Contact our global sales team for a custom architectural assessment."
                            }
                        ].map((item, idx) => (
                            <div key={idx} className="bg-[#f0f7ff] rounded-3xl p-8 border border-blue-50 hover:border-blue-200 transition-all group">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors flex gap-3">
                                    <span className="text-blue-600 italic">Q.</span> {item.q}
                                </h3>
                                <p className="text-gray-600 leading-relaxed font-medium">
                                    {item.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Elite Final CTA */}
                <div className="bg-[#001845] text-white py-24 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]"></div>
                    </div>

                    <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                        <h2 className="text-4xl md:text-6xl font-bold mb-8 leading-tight">Ready to Pioneer the <br />Future of People Ops?</h2>
                        <p className="text-2xl text-blue-200/70 mb-12 font-medium">
                            Join elite organizations scaling with HR-Tek AI intelligence.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-6 justify-center">
                            <Link
                                to="/auth"
                                className="bg-white text-[#001845] px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-50 transition-all transform hover:scale-110 shadow-2xl"
                            >
                                Start Now
                            </Link>
                            <a
                                href="/#contact"
                                className="bg-blue-600/20 border-2 border-blue-500/50 text-white px-12 py-5 rounded-2xl font-bold text-xl hover:bg-blue-600/40 transition-all"
                            >
                                Executive Demo
                            </a>
                        </div>
                    </div>
                </div>

                <Footer />
            </div>
        </>
    );
}
