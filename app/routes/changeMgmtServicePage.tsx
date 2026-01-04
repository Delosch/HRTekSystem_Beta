import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { Link } from "@remix-run/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TimeSelector from "~/components/HomePageComponents/TimeSelector";
import React, { useState } from "react";

const challenges = [
  "Low user adoption after HR tech go-live",
  "Resistance or fatigue slowing down change",
  "Ineffective communication or training strategies",
  "Lack of early interventions to course-correct",
];

const solutions = [
  "A comprehensive readiness assessment across eight change pillars",
  "Real-time scoring engine with red-flag detection",
  "Personalized recommendations mapped to maturity levels",
  "Downloadable PDF reports and dashboard visualizations",
];

export default function ChangeManagementDiagnosticPage() {
  const [showPopup, setShowPopup] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <>
      <div className="bg-white text-gray-800">
        {/* Hero Section */}
        <Navbar />
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
                          Emotionally Intelligent Change Management
                        </span>
                        <br />
                        <span className="font-light text-[#D4E1F4]">
                          Transform Workforce Change into Strategic Advantage
                        </span>
                      </h2>
                    </div>
                    <p className="text-lg italic text-[#C5D5EC] max-w-xl">
The Intelligent Change Management Diagnostic is a strategic capability within HRTek System’s platform, built to guide organizations through the people-side of HR digital transformation with measurable, sustainable outcomes. Acting as a real-time organizational mirror, it helps leaders assess readiness, identify resistance or change fatigue, and evaluate communication and training effectiveness, transforming change management into a proactive, data-driven lever for ROI and long-term success.
                    </p>
                  </div>

                  {/* Right Side: Static UI Image */}
                  <div className="flex justify-center">
                    <img
                      src="/assets/homepageAssets/scroll0/images/changeMan.png"
                      alt="Visual metaphor for Emotionally Intelligent Change Management service"
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </div>
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
        Why Change Management Often Fails
      </h2>
      <p className="text-lg text-gray-600 mb-8">
        <strong>70% of digital transformation initiatives fail</strong> not because of the technology, but because people aren’t ready to change:
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
        Without addressing these challenges early, adoption rates drop, investments are wasted, and trust in HR is eroded.
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
        The Emotionally Intelligent Change Management Diagnostic helps you manage change as a strategic lever and not a side activity:
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
      src="/assets/aboutUsAssets/aboutUs2d.png"
      alt="Visual metaphor for overcoming resistance to HR tech change"
      className="w-full h-full max-h-[600px] object-contain"
    />
  </div>
</section>


        {/* Features & How It Works */}
        <section className="bg-gray-50 py-20">
          <div className="max-w-7xl mx-auto px-6 space-y-20">
            {/* Heading */}
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                How It Works — Step by Step
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                From diagnostic to action a clear path to adoption success.
              </p>
            </div>

            {/* Two Columns */}
            <div className="grid lg:grid-cols-2 gap-10">
              {/* Benefits */}
              <div className="bg-white p-10 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-8 text-blue-700">
                  How It Drives Business Value
                </h3>
                <ul className="space-y-6">
                  {[
                    { title: "Faster User Adoption", text: "Targeted training and campaigns to minimize resistance." },
                    { title: "Higher ROI", text: "Ensure your HCM platform delivers productivity, not shelfware." },
                    { title: "Reduced Attrition Risk", text: "Manage anxiety, fatigue, and role-impact proactively." },
                    { title: "Smarter Leadership Decisions", text: "Equip leaders with readiness data for strategy alignment." },
                    { title: "Cultural Transformation", text: "Move from tech resistance to tech resilience." }
                  ].map((item, idx) => (
                    <li key={idx}>
                      <span className="block font-semibold text-gray-900">{item.title}</span>
                      <span className="text-gray-600">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Steps */}
              <div className="bg-blue-50 p-10 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
                <h3 className="text-2xl font-semibold mb-8 text-blue-800">
                  📋 Step-by-Step Process
                </h3>
                <ol className="space-y-6 text-gray-800">
                  {[
                    "Smart Diagnostic Questionnaire (~40 questions across 8 pillars)",
                    "Automated Scoring Engine with section scores, maturity score & red flags",
                    <>
                      Personalized Recommendations based on maturity:
                      <ul className="list-disc list-inside mt-2 ml-2 text-gray-700 text-sm space-y-1">
                        <li>Low → Capability workshops, leadership alignment</li>
                        <li>Medium → Comms plan revamp, manager enablement</li>
                        <li>High → Agile rollout, culture transformation</li>
                      </ul>
                    </>,
                    "PDF Summary + Dashboard View for visualization and tracking"
                  ].map((step, idx) => (
                    <li key={idx} className="relative pl-10">
                      <span className="absolute left-0 top-0 flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">
                        {idx + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Trust & Fit */}
            <div className="grid md:grid-cols-2 gap-12 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
              {/* Who Should Use It */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  🎯 Who Should Use This
                </h3>
                <ul className="space-y-3 text-gray-600 text-sm leading-relaxed">
                  {[
                    "CHROs & HR Transformation Leads",
                    "HRIS Implementation Teams",
                    "Digital COEs & Business Unit Heads",
                    "Change Managers & HRBPs"
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-gray-500 mt-0.5">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">
                  🔒 Confidential, Secure & Customizable
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Your data stays safe. Your change strategy stays yours.
                </p>
                <p className="text-gray-600 text-sm">
                  The platform ensures confidential diagnostics, with exportable
                  reports and optional integration with our Digital Maturity Tool
                  for a complete transformation view.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
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
      <button onClick={() => { const isLoggedIn = document.cookie.includes('user_session'); if (isLoggedIn) { window.location.href = '/assessment?engine=Change%20Management%20Readiness'; } else { window.location.href = '/auth'; } }} className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300">Take the Assessment</button>
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

