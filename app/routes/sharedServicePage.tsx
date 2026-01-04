import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { UsersIcon, Cog6ToothIcon, ChartBarIcon, BuildingOfficeIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TimeSelector from "~/components/HomePageComponents/TimeSelector";
import React, { useState } from "react";
import { Link } from "@remix-run/react";

export default function HRSharedServicesPage() {
    const [showPopup, setShowPopup] = useState(false);
    const [selected, setSelected] = useState<Date | undefined>(undefined);
  return (
    <>
      <Navbar />

      {/* INTRO SECTION */}
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
                          Shared Service Designer
                        </span>
                        <br />
                        <span className="font-light text-[#D4E1F4]">
                          Crafting Efficient, Centralized HR Service Experiences
                        </span>
                      </h2>
                    </div>
                    <p className="text-lg italic text-[#C5D5EC] max-w-xl">
                      “One Team. Multiple Functions. Seamless Experience.” <br />
A Shared Services Operating Model (SSOM) in HR is a strategic approach that consolidates transactional and administrative HR tasks into a centralized service delivery hub. Instead of having each business unit or region manage these services independently leading to inconsistencies, inefficiencies, and cost overruns Shared Services ensures that standardized, efficient, and high-quality services are delivered consistently across the organization.

                    </p>
                  </div>

                  {/* Right Side: Static UI Image */}
                  <div className="flex justify-center">
                    <img
                      src="/assets/homepageAssets/scroll0/images/sService.png"
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
<section className="max-w-full mx-auto px-6 py-16 grid md:grid-cols-2 gap-12 items-center bg-white text-gray-800">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold">
              What is a Shared Services Model in HR?
            </h2>
            <p className="text-lg text-gray-600">
              A Shared Services Operating Model (SSOM) in HR is a centralized service delivery structure where common HR processes are streamlined and delivered through a single hub (or virtually) across the organization. Rather than duplicating processes in every business unit or location, Shared Services allows organizations to create efficiency, consistency, and cost savings by standardizing key HR functions.
            </p>    
          </div>
          <div>
            <img
              src="/assets/homepageAssets/scroll0/images/sServices2.png"
              alt="Illustration showing HR technology evaluation process"
              className="w-full h-auto object-contain rounded-lg shadow-lg"
            />
          </div>
        </section>

      {/* KEY COMPONENTS */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            Key Components of HR Shared Services
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: UsersIcon, title: "Employee Support" },
              { icon: Cog6ToothIcon, title: "Process Automation" },
              { icon: ChartBarIcon, title: "Data & Analytics" },
              { icon: BuildingOfficeIcon, title: "Centralized Administration" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center p-6 rounded-2xl shadow hover:shadow-lg transition-shadow"
              >
                <div className="bg-indigo-50 p-4 rounded-full mb-4 transition-transform hover:scale-110">
                  <item.icon className="h-8 w-8 text-indigo-600" />
                </div>
                <h4 className="font-semibold text-gray-800">{item.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROFITABILITY BENEFITS */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center">
            How Shared Services Drive Profitability
          </h3>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              "Reduced administrative overhead through automation",
              "Faster turnaround for HR requests",
              "Consistent compliance with labor regulations",
              "Better workforce data for decision making",
              "Scalable HR operations as your company grows",
              "Improved employee satisfaction via streamlined support",
            ].map((benefit, idx) => (
              <div
                key={idx}
                className={`p-6 rounded-2xl shadow bg-white hover:shadow-lg transition-shadow`}
              >
                <div className="flex items-start gap-3">
                  <CurrencyDollarIcon className="h-6 w-6 text-green-600 mt-1" />
                  <p className="text-gray-700">{benefit}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* READINESS CHECKLIST */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Is Shared Services Right for You?
            </h3>
            <p className="text-gray-600">
              If you check most of these boxes, your organization is ready to
              benefit from a Shared Services model:
            </p>
          </div>
          <ul className="space-y-3">
            {[
              "Multiple HR functions across different locations",
              "Desire to improve efficiency & standardization",
              "Need for better HR data and analytics",
              "High administrative workload",
              "Growing headcount and scalability concerns",
            ].map((point, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
                <span className="text-gray-700">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* OUR APPROACH */}
      <section className="bg-indigo-50 py-20">
  <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-start">
    
    {/* Left - Our Approach */}
    <div>
      <h3 className="text-2xl font-bold text-gray-900 mb-12 text-center lg:text-left">
        Our Approach to HR Shared Services
      </h3>
      <div className="relative border-l-4 border-indigo-400 pl-6 space-y-10">
        {[
          "Shared Services Operating Model Design",
          "HR Process Reengineering",
          "SLA and Performance Framework Setup",
          "Technology Enablement (HRIS, Ticketing, Chatbots)",
          "Build-Operate-Transfer or Managed Service Delivery",
        ].map((step, idx) => (
          <div key={idx} className="relative">
            <div className="absolute -left-[38px] top-0 bg-indigo-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-semibold">
              {idx + 1}
            </div>
            <p className="text-gray-700">{step}</p>
          </div>
        ))}
      </div>
    </div>

    {/* Right - How It Works */}
    <div className="bg-blue-50 p-10 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
  <h3 className="text-2xl font-semibold flex items-center gap-2 mb-8 text-blue-800">
    💡 How It Works
  </h3>
  <ol className="space-y-6 text-gray-800">
    {[
      "Complete our comprehensive Shared Services Readiness Assessment (takes about 15–20 minutes).",
      "Our system analyzes your responses using advanced AI-driven evaluation to pinpoint your current state.",
      <>
        Instantly receive a tailored roadmap highlighting:
        <ul className="list-disc list-inside mt-2 ml-4 text-gray-700 text-sm space-y-1">
          <li>Key efficiency improvements and quick wins</li>
          <li>Strategic priorities to streamline HR operations</li>
          <li>Opportunities to leverage technology and automation</li>
          <li>Potential risks and change management considerations</li>
        </ul>
      </>,
      "Optionally, our expert advisory team can support you in implementing the roadmap and achieving measurable results.",
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
      <button onClick={() => { const isLoggedIn = document.cookie.includes('user_session'); if (isLoggedIn) { window.location.href = '/assessment?engine=Shared%20Service%20Designer'; } else { window.location.href = '/auth'; } }} className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300">Take the Assessment</button>
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
    </>
  );
}

