import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { Link, useRouteLoaderData } from "@remix-run/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import React, { useState } from "react";
import BookingModal from "~/components/HomePageComponents/BookingModal";
import { MetaFunction } from "@remix-run/node";
import { generateMeta, generateBreadcrumbSchema, generateServiceSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HR Transformation Roadmap Generator - Strategic Planning",
    description: "Generate AI-powered HR transformation roadmaps tailored to your organization. Strategic planning with ROI focus, timeline optimization, and actionable milestones.",
    keywords: "HR roadmap, transformation planning, HR strategy, digital roadmap, HR transformation timeline, strategic HR planning",
    url: "https://hrteksystem.com/roadmap-service",
    image: "https://hrteksystem.com/og-roadmap.jpg",
  });
};

const challenges = [
  "Faster hiring cycles",
  "Seamless employee experiences",
  "Predictive workforce insights",
  "Agile support for growth",
];

const solutions = [
  "A real-time analysis of your current state",
  "Identification of key gaps and quick wins",
  "A customized transformation roadmap mapped over 6, 12, and 24 months",
];

export default function RoadmapGenServicePage() {
  const [showPopup, setShowPopup] = useState(false);
  const rootData = useRouteLoaderData("root") as { user: any };
  const user = rootData?.user;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Roadmap Service", url: "/roadmap-service" }
  ]);

  const serviceSchema = generateServiceSchema({
    name: "HR Transformation Roadmap Generator",
    description: "AI-powered strategic roadmap generation for HR digital transformation",
    provider: "HRTek System",
    areaServed: "Global",
    url: "https://hrteksystem.com/roadmap-service"
  });

  return (
    <>
      <link rel="canonical" href="https://hrteksystem.com/roadmap-service" />
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
                  <span className="text-white/90 text-sm font-medium">Strategic HR Transformation</span>
                </div>

                {/* Main Heading */}
                <div className="space-y-4">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                    HR-Tek Transformation
                    <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                      Roadmap Generator
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl font-semibold text-white/90 leading-relaxed">
                    Your Step-by-Step Guide to Streamlining HR for the Future
                  </p>
                </div>

                {/* Description */}
                <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                  The HR-Tek Transformation Roadmap Generator helps organizations streamline HR processes
                  with clarity and precision. It analyzes current practices, identifies gaps, and delivers
                  a tailored, step-by-step plan for transformation. From boosting efficiency to adopting
                  modern HR technologies, it's your blueprint for turning HR into a strategic powerhouse.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Link
                    to="/engine/digital-roadmap"
                    className="group px-8 py-4 bg-white text-[#023e8a] rounded-xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    Start Assessment
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => setShowPopup(true)}
                    className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                  >
                    Talk to Expert
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                  <div>
                    <div className="text-3xl font-black text-white">360°</div>
                    <div className="text-sm text-white/70 mt-1">HR Analysis</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">ROI</div>
                    <div className="text-sm text-white/70 mt-1">Focused Plans</div>
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
                    src="/assets/homepageAssets/scroll0/images/roadmap1.png"
                    alt="HR Transformation Roadmap Visualization"
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

        {/* Problem & Solution */}
        <section className="max-w-7xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-stretch">
          {/* Left Column */}
          <div className="space-y-16">
            {/* Problem Section */}
            <div>
              <p className="text-sm font-semibold tracking-wider text-red-600 uppercase mb-2">
                The Problem
              </p>
              <h2 className="text-4xl font-extrabold text-gray-900 leading-snug mb-6">
                The Challenge Businesses Face
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                In today’s competitive and fast-evolving world, HR is expected to deliver:
              </p>
              <ul className="space-y-4">
                {challenges.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
              <p className="text-lg text-gray-600 mt-6">
                But most HR departments are held back by legacy systems, manual processes, or uncoordinated tech investments.
              </p>
            </div>

            {/* Solution Section */}
            <div>
              <p className="text-sm font-semibold tracking-wider text-green-600 uppercase mb-2">
                The Answer
              </p>
              <h2 className="text-4xl font-extrabold text-gray-900 leading-snug mb-6">
                Our Solution
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                The HR Digital Roadmap Assessment helps by guiding your organization through a set of structured diagnostic questions, delivering:
              </p>
              <ul className="space-y-4">
                {solutions.map((item, idx) => (
                  <li key={idx} className="flex items-start">
                    <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="ml-3 text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex items-center justify-center bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <img
              src="/assets/aboutUsAssets/aboutUs2a.png"
              alt="Inefficient manual HR process contrasted with modern automated HR system"
              className="w-full h-full max-h-[600px] object-contain"
            />
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6 space-y-20">

            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                Unlock Strategic Impact
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                Discover how our solution accelerates outcomes and guides your journey — from
                <span className="text-blue-600 font-semibold"> insight to execution</span>.
              </p>
            </div>

            {/* Benefits - Single Column for better readability after removing How It Works */}
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              <h3 className="text-2xl font-semibold flex items-center gap-2 mb-8 text-blue-700">
                How It Helps Drive Business Results
              </h3>
              <ul className="space-y-6">
                {[
                  { title: "Faster Time-to-Value", text: "Prioritize digital initiatives that deliver impact in 3–6 months." },
                  { title: "Cost Efficiency", text: "Avoid wasted spend on redundant tools or low-impact tech." },
                  { title: "Workforce Intelligence", text: "Move from reactive to predictive HR using real-time analytics." },
                  { title: "Change Confidence", text: "Get organization-wide visibility on what’s ready and what’s not." },
                  { title: "Leadership Alignment", text: "Support business strategy by aligning HR’s roadmap to enterprise goals." }
                ].map((item, idx) => (
                  <li key={idx}>
                    <span className="block font-semibold text-gray-900"> {item.title}</span> {/* insert there character you want as bullet*/}
                    <span className="text-gray-600">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* SecC - Trust & Fit */}
            <div className="grid md:grid-cols-2 gap-12 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">

              {/* Who Should Use It */}
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
                  🎯 Who Should Use It
                </h3>
                <ul className="space-y-3 text-gray-600 text-sm leading-relaxed">
                  {[
                    "CHROs and HR Leaders planning a transformation",
                    "Digital or HRIT teams evaluating new platforms",
                    "HR Shared Services & COE Heads",
                    "Business leaders seeking more value from HR technology"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security & Customization */}
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
                  🔒 Confidential, Secure & Fully Customizable
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  Your data is protected. Your roadmap is unique.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Our platform ensures confidential diagnostics, with the option to export detailed
                  reports or initiate an advisory engagement for expert guidance.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* Call to Action */}
        <section className="bg-blue-700 text-white py-16">
          <div className="max-w-3xl mx-auto text-center px-6">
            <h2 className="text-3xl font-bold mb-6">
              Ready to Begin Your Transformation Journey
            </h2>
            <p className="text-lg mb-8">
              Take the assessment today and let HR-Tek System show you a smarter
              path forward.
            </p>

            <div className="flex flex-col gap-4 items-center">
              <button
                onClick={() => setShowPopup(true)}
                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300"
              >
                Talk to a Consultant
              </button>
              <Link to="/engine/digital-roadmap" className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300 text-center">Take the Assessment</Link>
            </div>
          </div>
        </section>

        {/* Booking Modal */}
        <BookingModal
          isOpen={showPopup}
          onClose={() => setShowPopup(false)}
          engineName="HR-Tek Transformation Roadmap Generator"
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
