import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { Link } from "@remix-run/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TimeSelector from "~/components/HomePageComponents/TimeSelector";
import React, { useState } from "react";

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
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <>
      <div className="bg-white text-gray-800">
        <Navbar />

        {/* Hero Section */}
        <div className="bg-[#023e8a]">
          <div className="relative w-full bg-[#023e8a] text-white overflow-hidden">
            <div className="w-full flex items-center justify-center px-4 py-12 sm:py-12">
              <div className="bg-[#023e8a] text-white py-2 px-6">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-12">
                  {/* Left Side: Text and CTA */}
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-4xl md:text-5xl font-bold leading-tight text-white mt-20">
                        <span className="text-white">
                          Advanced HR Maturity Analysis
                        </span>
                        <br />
                        <span className="font-light text-[#D4E1F4]">
                          Pinpointing Your HR Strengths, Gaps, and Growth
                          Opportunities
                        </span>
                      </h2>
                    </div>
                    <p className="text-lg italic text-[#C5D5EC] max-w-xl">
                      Our HR Technology Maturity Assessment helps organizations
                      evaluate their current digital HR landscape across nine
                      critical pillars from system adoption and automation to
                      data integration, innovation, and strategic alignment.
                      Whether you're using a leading HCM suite or a legacy HRIS,
                      this module reveals how effectively your HR tech stack
                      supports your business goals and where the gaps are.
                    </p>
                  </div>

                  {/* Right Side: Static UI Image */}
                  <div className="flex justify-center">
                    <img
                      src="/assets/homepageAssets/scroll0/images/matAnalysis.png"
                      alt="Visual metaphor for Advanced HR Maturity Analysis service"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 1: What is it */}
        <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              What Is the HR Technology Maturity Assessment?
            </h2>
            <p className="text-lg text-gray-600">
              Our HR Technology Maturity Assessment helps organizations evaluate
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

        {/* Final CTA */}
<section className="bg-blue-700 text-white py-16">
  <div className="max-w-3xl mx-auto text-center px-6">
    <h2 className="text-3xl font-bold mb-6">
      Ready to Begin Your Transformation Journey
    </h2>
    <p className="text-lg mb-8">
      Take the assessment today and let HRTek System show you a smarter
      path forward.
    </p>

    <div className="flex flex-col gap-4 items-center">
      <button
        onClick={() => setShowPopup(true)}
        className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300"
      >
        Talk to a Consultant
      </button>
      <button onClick={() => { const isLoggedIn = document.cookie.includes('user_session'); if (isLoggedIn) { window.location.href = '/assessment?engine=HR%20Tech%20Maturity%20Analysis'; } else { window.location.href = '/auth'; } }} className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300">Take the Assessment</button>
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

