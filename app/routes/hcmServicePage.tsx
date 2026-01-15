import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { Link } from "@remix-run/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TimeSelector from "~/components/HomePageComponents/TimeSelector";
import React, { useState } from "react";

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
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <>
      <div className="bg-white text-gray-800">
        {/* Hero Section */}
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
                    onClick={() => { const isLoggedIn = document.cookie.includes('user_session'); if (isLoggedIn) { window.location.href = '/assessment?engine=HCM%20Vendor%20Fit%20Engine'; } else { window.location.href = '/auth'; } }}
                    className="group px-8 py-4 bg-white text-[#023e8a] rounded-xl font-bold text-lg shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-2"
                  >
                    Start Assessment
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
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
                    <div className="text-3xl font-black text-white">100+</div>
                    <div className="text-sm text-white/70 mt-1">Vendors Analyzed</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">95%</div>
                    <div className="text-sm text-white/70 mt-1">Accuracy Rate</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-white">24/7</div>
                    <div className="text-sm text-white/70 mt-1">AI Support</div>
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
                    src="/assets/homepageAssets/scroll0/images/hcm.png"
                    alt="HCM Vendor Selection Visualization"
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
            {/* Challenge Section */}
            <div>
              <p className="text-sm font-semibold tracking-wider text-red-600 uppercase mb-2">
                The Problem
              </p>
              <h2 className="text-4xl font-extrabold text-gray-900 leading-snug mb-6">
                The Challenge Businesses Face
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                In today’s complex HR tech landscape, HCM selection is high-stakes:
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
                The wrong choice leads to wasted investment, frustrated teams, and stalled
                transformation.
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
                The HCM Vendor Fit Module is an intelligent, advisory-grade assessment that:
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
              src="/assets/aboutUsAssets/aboutUs1bb.png"
              alt="Depiction of comparing HCM vendors and solutions"
              className="w-full h-full max-h-[600px] object-contain"
            />
          </div>
        </section>


        {/* Features */}
        <section className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-6 space-y-20">
            {/* Section Heading */}
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-sm font-semibold tracking-wider text-blue-600 uppercase mb-2">
                Strategic Impact
              </p>
              <h2 className="text-4xl font-extrabold text-gray-900 leading-snug mb-6">
                Why This Matters
              </h2>
              <p className="text-gray-600 text-lg">
                Choosing the right HCM system is a strategic decision that impacts every process,
                employee, and business outcome.
              </p>
            </div>

            {/* Benefits - Full Width */}
            <div className="max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
              <h3 className="text-2xl font-bold flex items-center gap-3 mb-8 text-blue-700">
                <span className="text-3xl">📊</span> The ROI of the Right Choice
              </h3>
              <ul className="space-y-6">
                {[
                  {
                    title: "Save Time & Reduce Risk",
                    desc: "Avoid months of internal debate, RFP errors, and mismatched scope."
                  },
                  {
                    title: "Cost Efficiency",
                    desc: "Eliminate overspending on underused features or modules."
                  },
                  {
                    title: "Adoption & Integration Success",
                    desc: "Reduce failed rollouts and change fatigue with the right fit."
                  },
                  {
                    title: "Long-Term Scalability",
                    desc: "Invest in a platform that grows with your business needs."
                  }
                ].map((item, idx) => (
                  <li key={idx}>
                    <span className="block font-semibold text-gray-900">✔️ {item.title}</span>
                    <span className="text-gray-600">{item.desc}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Who Should Use It */}
            <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl p-10 shadow-sm border border-gray-100">
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
                  🎯 Who Should Use It
                </h3>
                <ul className="space-y-3 text-gray-600 text-sm leading-relaxed">
                  <li>HR & CHRO teams planning system replacement</li>
                  <li>IT & CIOs managing integration and platform strategy</li>
                  <li>CFOs evaluating HR tech investments</li>
                  <li>Business heads aligning people strategy to business goals</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
                  🔒 Confidential & Secure
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  All assessments are encrypted and owned by you. No vendor receives your data
                  without explicit consent.
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
              <button onClick={() => { const isLoggedIn = document.cookie.includes('user_session'); if (isLoggedIn) { window.location.href = '/assessment?engine=HCM%20Vendor%20Fit%20Engine'; } else { window.location.href = '/auth'; } }} className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300">Take the Assessment</button>
            </div>
          </div>

          {showPopup && (
            <div className="fixed inset-0 z-50 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center px-4 animate-fadeIn">
              <div className="relative w-full max-w-5xl bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-blue-100 overflow-auto max-h-[90vh] no-scrollbar transform scale-95 animate-scaleIn">
                {/* Close Button */}
                <button
                  onClick={() => setShowPopup(false)}
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 hover:scale-110 transition-all"
                  aria-label="Close"
                >
                  ✕
                </button>

                {/* Modal Content */}
                <div>
                  <h2 className="text-blue-600 text-3xl font-extrabold mb-4">
                    Ready to Transform Your HR Strategy?
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-8">
                    If you're interested in learning more about how our solutions can help your
                    organization—or if you'd like expert guidance tailored to your HR goals—
                    <br />
                    <span className="font-semibold text-black">
                      Select a convenient date and time
                    </span>{" "}
                    below, and take the next step toward building a future-ready HR Architecture.
                  </p>

                  {/* Calendar and Time Slots */}
                  <div className="flex flex-col lg:flex-row gap-8 mb-8">
                    {/* Calendar */}
                    <div className="flex-1 bg-white rounded-xl shadow-md p-4">
                      <DayPicker
                        mode="single"
                        selected={selected}
                        onSelect={setSelected}
                        fromDate={new Date()}
                        disabled={{ before: new Date() }}
                        modifiersClassNames={{
                          selected: "bg-blue-600 text-white rounded-full",
                          today: "text-blue-700 font-bold",
                        }}
                        className="text-center text-black"
                      />
                    </div>

                    {/* Time Slots */}
                    <div className="flex-1 bg-white rounded-xl shadow-md p-4">
                      <TimeSelector />
                    </div>

                    {/* Image */}
                    <div className="hidden lg:block flex-1">
                      <img
                        src="/assets/homepageAssets/bookAppointment.png"
                        alt="Client booking appointment illustration"
                        className="w-full h-auto rounded-xl shadow-lg"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-4">
                    <button
                      onClick={() => setShowPopup(false)}
                      className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all"
                    >
                      Cancel
                    </button>
                    <button className="px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md transition-all">
                      Book Appointment
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        <style>
          {`
  /* Hide scrollbar */
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  /* Smooth animations */
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

