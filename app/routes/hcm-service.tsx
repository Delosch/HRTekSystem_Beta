import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { useRouteLoaderData, Link } from "@remix-run/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import BookingModal from "~/components/HomePageComponents/BookingModal";
import { MetaFunction } from "@remix-run/node";
import { generateMeta, generateBreadcrumbSchema, generateServiceSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HCM Vendor Fit Engine - AI-Powered Selection Tool",
    description: "Choose the right HCM provider with our AI-powered Vendor Fit Engine. Eliminate bias and find the perfect partner for your unique HR requirements.",
    keywords: "HCM vendor selection, HR software fit, HCM matching engine, vendor evaluation, HR tech procurement, best HCM platform",
    url: "https://www.hrteksystem.com/hcm-service",
    image: "https://www.hrteksystem.com/og-hcm.jpg",
  });
};

const challenges = [
  "Overwhelming vendor options with overlapping promises",
  "Decisions made on surface-level demos",
  "Cost overruns, low adoption, and poor integration post-implementation",
  "HCM systems failing to deliver expected ROI",
];

const solutions = [
  "Clarity on your true HCM needs, readiness, and constraints",
  "An objective, evidence-based fitment recommendation",
  "A personalized selection report you can trust",
  "Elimination of vendor bias and internal disagreement",
];

export default function HCMVendorFitPage() {
  const [showPopup, setShowPopup] = useState(false);
  const rootData = useRouteLoaderData("root") as { user: any };
  const user = rootData?.user;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "HCM Service", url: "/hcm-service" }
  ]);

  const serviceSchema = generateServiceSchema({
    name: "HCM Vendor Fit Engine",
    description: "AI-powered tool for selecting the most compatible HCM vendor based on organizational needs",
    provider: "HRTek System",
    areaServed: "Global",
    url: "https://www.hrteksystem.com/hcm-service"
  });

  return (
    <>
      <link rel="canonical" href="https://www.hrteksystem.com/hcm-service" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <div className="bg-white text-gray-800">
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

          <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Side: Content */}
              <div className="space-y-8 z-10">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-white/90 text-sm font-medium">AI-Powered Vendor Selection</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                    HR-Tek HCM Vendor
                    <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Fit Engine
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold text-white/90 leading-relaxed">
                    Make Confident, Risk-Free HCM Decisions with Expert Intelligence
                  </p>
                </div>

                {/* Description */}
                <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                  Choosing an HR-Tek HCM system isn't just about software—it's about aligning your
                  entire HR operating model with your business strategy. With 100+ vendors
                  offering similar promises, our HCM Vendor Fit Engine gives you clarity,
                  removes bias, and delivers an evidence-backed recommendation you can trust.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    onClick={() => setShowPopup(true)}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                  >
                    Talk to Expert
                  </button>
                  <Link
                    to="/engine/hcm-vendor-fit"
                    className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center"
                  >
                    Start Selection Engine
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                  <div>
                    <div className="text-3xl font-black text-white">100+</div>
                    <div className="text-sm text-white/70 mt-1">Vendors Analyzed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">95%</div>
                    <div className="text-sm text-white/70 mt-1">Decision Accuracy</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">$2k+</div>
                    <div className="text-sm text-white/70 mt-1">Single Access</div>
                  </div>
                </div>
              </div>

              {/* Right Side: Image/Visual */}
              <div className="relative group lg:block">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 md:p-8 shadow-2xl overflow-hidden">
                  <img
                    src="/assets/homepageAssets/scroll0/images/hcm.png"
                    alt="HCM Vendor Fit Engine"
                    className="w-full h-auto rounded-2xl transform transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#001845]/40 to-transparent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Challenges Section */}
        <section className="py-24 bg-slate-50 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 relative">
            <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900">Why Most HCM Projects Fail</h2>
              <p className="text-slate-600 max-w-2xl mx-auto text-lg">Don't let your transformation become another statistic of poor selection.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {challenges.map((challenge, idx) => (
                <div key={idx} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 group">
                  <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center mb-6 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  </div>
                  <p className="text-slate-700 font-medium leading-relaxed">{challenge}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Solution/Benefits Section */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <h2 className="text-3xl md:text-5xl font-extrabold text-[#023e8a] leading-tight">
                  The Intelligent Path to Selection
                </h2>
                <div className="space-y-6">
                  {solutions.map((solution, idx) => (
                    <div key={idx} className="flex gap-4 p-4 rounded-xl hover:bg-slate-50 transition-colors">
                      <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                      <p className="text-slate-700 text-lg">{solution}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="absolute -inset-4 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
                <img
                  src="/assets/homepageAssets/scroll0/images/hcm.png"
                  alt="Solution Visualization"
                  className="relative rounded-3xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-20 bg-[#1A56DB]">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Begin Your Transformation Journey
            </h2>
            <p className="text-lg text-white mb-10">
              Connect with our HR experts to discover how HR-Tek can accelerate your transformation.
            </p>

            <div className="flex flex-col items-center gap-4">
              <button
                onClick={() => setShowPopup(true)}
                className="px-8 py-3 bg-white text-[#1A56DB] rounded-lg font-bold text-base hover:bg-gray-100 transition-colors min-w-[240px] shadow-sm"
              >
                Talk to a Consultant
              </button>
            </div>
          </div>
        </section>

        {/* Booking Modal */}
        <BookingModal
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          engineName="HCM Vendor Fit Engine"
          user={user}
        />

        <style>
          {`
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @keyframes fadeIn {
    from { opacity: 0 }
    to { opacity: 1 }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0 }
    to { transform: scale(1); opacity: 1 }
  }
  .animate-fadeIn { animation: fadeIn 0.25s ease-out }
  .animate-scaleIn { animation: scaleIn 0.25s ease-out }
`}
        </style>

        <Footer />
      </div>
    </>
  );
}
