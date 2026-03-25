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
    title: "HR Tech Maturity Analysis - Digital Readiness Assessment",
    description: "Analyze your HR technology maturity across 9 critical pillars. Discover digital readiness, identify gaps, and benchmark your HR tech stack for future innovation.",
    keywords: "HR tech maturity, digital readiness, HR assessment, maturity analysis, HR technology pillars, digital HR transformation assessment",
    url: "https://www.hrteksystem.com/maturity-analysis-service",
    image: "https://www.hrteksystem.com/og-maturity.jpg",
  });
};

const pillars = [
  "HR Strategy & Vision : Is there a clear roadmap for HR tech?",
  "Digital Alignment : Is HR embedded in the company’s digital strategy?",
  "System Adoption : Are employees and managers using the tools provided?",
  "Mobile Enablement : Can your workforce access HR on the go?",
  "Process Automation : What’s still manual that could be automated?",
  "Integration & Data : Are systems connected? Is data clean and actionable?",
  "Governance & Change : Is there a structured approach to HCM rollouts?",
  "Analytics & Feedback : Are KPIs in place to track HR tech performance?",
  "Innovation Readiness : Are you leveraging AI, chatbots, and talent intelligence?",
];

const benefits = [
  "Reduce HR operating costs through targeted automation",
  "Eliminate productivity loss due to underused or manual processes",
  "Increase employee engagement through mobile-first, user-friendly tools",
  "Optimize your HCM investment by knowing what features to expand or retire",
  "Enable data-driven talent decisions with better analytics readiness",
  "Prepare for AI-powered HR capabilities by identifying innovation gaps",
];

export default function HRTechMaturityServicePage() {
  const [showPopup, setShowPopup] = useState(false);
  const rootData = useRouteLoaderData("root") as { user: any };
  const user = rootData?.user;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Maturity Analysis", url: "/maturity-analysis-service" }
  ]);

  const serviceSchema = generateServiceSchema({
    name: "HR Tech Maturity Analysis",
    description: "Holistic evaluation of HR technology landscape across 9 critical pillars",
    provider: "HRTek System",
    areaServed: "Global",
    url: "https://www.hrteksystem.com/maturity-analysis-service"
  });

  return (
    <>
      <link rel="canonical" href="https://www.hrteksystem.com/maturity-analysis-service" />
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

          <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Left Side: Content */}
              <div className="space-y-8">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-white/90 text-sm font-medium">AI-Driven Maturity Assessment</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                    Advanced HR-Tek
                    <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Maturity Analysis
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold text-white/90 leading-relaxed">
                    Pinpointing Your HR Strengths, Gaps, and Growth Opportunities
                  </p>
                </div>

                {/* Description */}
                <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                  Our HR-Tek Technology Maturity Assessment helps organizations evaluate their current
                  digital HR landscape across nine critical pillars—from system adoption and automation
                  to data integration, innovation, and strategic alignment. Whether you're using a leading
                  HCM suite or a legacy HRIS, this module reveals how effectively your HR tech stack
                  supports your business goals and where the gaps are.
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
                    to="/ai-maturity/assessment"
                    className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center"
                  >
                    Start Maturity Assessment
                  </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                  <div>
                    <div className="text-3xl font-black text-white">9</div>
                    <div className="text-sm text-white/70 mt-1">Critical Pillars</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">360°</div>
                    <div className="text-sm text-white/70 mt-1">Assessment</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">AI</div>
                    <div className="text-sm text-white/70 mt-1">Powered Insights</div>
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
                    src="/assets/homepageAssets/scroll0/images/matAnalysis.png"
                    alt="HR Maturity Analysis Visualization"
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

        {/* Section 1: What is it */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              What Is the HR-Tek Technology Maturity Assessment?
            </h2>
            <p className="text-lg text-gray-600">
              Our HR-Tek Technology Maturity Assessment helps organizations evaluate
              their current digital HR landscape across nine critical pillars
              from system adoption and automation to data integration,
              innovation, and strategic alignment.
            </p>
            <p className="text-lg text-gray-600">
              Whether you're using a leading HCM suite or a legacy HRIS, this
              module reveals how effectively your HR tech stack supports your
              business goals and where the gaps are.
            </p>
          </div>
          <div>
            <img
              src="/assets/homepageAssets/scroll0/images/matService.png"
              alt="Illustration showing HR technology evaluation process"
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        </section>

        {/* Section 2: Why This Matters */}
        <section className="relative bg-gradient-to-b from-gray-50 to-white py-20">
          <div className="max-w-7xl mx-auto px-6">
            {/* Section Heading */}
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
                Go Beyond Software — Understand{" "}
                <span className="text-blue-600">
                  Readiness, Utilization, and ROI
                </span>
              </h2>
              <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                We help you uncover hidden opportunities, improve
                decision-making, and ensure your HR tech drives measurable
                business outcomes.
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: "✅",
                  title: "Uncover Blind Spots",
                  desc: "Identify underutilized modules, manual processes, and integration gaps that slow down efficiency.",
                  color: "from-green-500 to-green-600",
                },
                {
                  icon: "📈",
                  title: "Improve Decision-Making",
                  desc: "Gain actionable insights to guide investments in automation, mobile enablement, AI tools, and user training.",
                  color: "from-blue-500 to-blue-600",
                },
                {
                  icon: "💼",
                  title: "Align HR with Business Goals",
                  desc: "Ensure your HR tech is aligned with your digital transformation strategy not working in isolation.",
                  color: "from-indigo-500 to-indigo-600",
                },
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="group bg-white rounded-2xl shadow-md border border-gray-100 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Icon */}
                  <div
                    className={`h-14 w-14 mx-auto rounded-full bg-gradient-to-br ${card.color} flex items-center justify-center text-2xl text-white mb-5 shadow-md`}
                  >
                    {card.icon}
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 9 Pillars */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          {/* Section Heading */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
              The 9 Pillars We Assess
            </h2>
            <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
              A holistic evaluation of your HR technology landscape to uncover
              strengths, opportunities, and actionable insights.
            </p>
          </div>

          {/* Pillars Grid */}
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, idx) => (
              <li
                key={idx}
                className="group bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-start gap-4"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 transition-colors duration-300">
                    <CheckCircleIcon className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                </div>

                {/* Text */}
                <span className="text-gray-800 leading-relaxed">{pillar}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* From Compliance + Right Column with Assessment & Who */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          {/* Section Title - full width */}
          <h2 className="text-3xl md:text-4xl font-extrabold mb-12 text-center">
            💡 <span className="text-gray-800">From Compliance to</span>{" "}
            <span className="text-green-600">Competitive Advantage</span>
          </h2>

          {/* 2 Column Grid */}
          <div className="grid md:grid-cols-2 gap-12 items-start">
            {/* Left Column - Benefits */}
            <ul className="grid sm:grid-cols-1 gap-6">
              {benefits.map((benefit, idx) => (
                <li
                  key={idx}
                  className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-2xl shadow-lg border border-gray-100 flex items-start gap-3 hover:shadow-xl transition-shadow duration-300"
                >
                  <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                  <span className="text-gray-700 leading-relaxed">
                    {benefit}
                  </span>
                </li>
              ))}
            </ul>

            {/* Right Column - Info Cards */}
            <div className="space-y-8">
              {/* How the Assessment Works */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-green-600 px-6 py-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6" />
                    How the Assessment Works
                  </h3>
                </div>
                <div className="p-6">
                  <ol className="list-decimal list-inside space-y-3 text-gray-700 leading-relaxed">
                    <li>Answer a series of questions across the 9 pillars.</li>
                    <li>Receive an instant maturity score.</li>
                    <li>Get personalized recommendations for improvement.</li>
                  </ol>
                </div>
              </div>

              {/* Who Is It For */}
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="bg-blue-600 px-6 py-3">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircleIcon className="h-6 w-6" />
                    Who Is It For?
                  </h3>
                </div>
                <div className="p-6">
                  <ul className="list-disc list-inside space-y-3 text-gray-700 leading-relaxed">
                    <li>HR Leaders and Directors</li>
                    <li>Business Owners</li>
                    <li>CHROs and Senior Executives</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Video Tutorial Section */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-10">
              <span className="inline-block px-4 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Video Tutorial</span>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">See HR Technology Maturity Analysis In Action</h2>
              <p className="text-gray-500 max-w-xl mx-auto text-sm">Watch how the Maturity Analysis engine benchmarks your HR tech stack and generates a prioritised improvement roadmap.</p>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-slate-900" style={{ aspectRatio: '16/9' }}>
              <iframe
                src="https://www.youtube.com/embed/bsW0rYwrBbQ"
                title="HR Technology Maturity Analysis Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="bg-blue-700 text-white py-16">
          <div className="max-w-3xl mx-auto text-center px-6">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Begin Your Transformation Journey
            </h2>
            <p className="text-lg mb-8">
              Connect with our HR experts to discover how HR-Tek can accelerate your transformation.
            </p>

            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => setShowPopup(true)}
                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300"
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
          engineName="HR Technology Maturity Analysis"
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
      </div >
    </>
  );
}
