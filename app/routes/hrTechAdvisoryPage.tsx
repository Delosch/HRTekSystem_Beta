import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { Link } from "@remix-run/react";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TimeSelector from "~/components/HomePageComponents/TimeSelector";
import React, { useState } from "react";

const challenges = [
    "Overwhelming technology options",
    "Unclear ROI on HR tech investments",
    "Integration challenges with existing systems",
    "Lack of strategic alignment",
];

const solutions = [
    "Expert guidance on technology selection",
    "Strategic roadmap aligned with business goals",
    "Vendor evaluation and comparison",
    "Implementation best practices and support",
];

export default function HRTechAdvisoryPage() {
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
                                                    HR Tech Advisory Services
                                                </span>
                                                <br />
                                                <span className="font-light text-[#D4E1F4]">
                                                    Strategic Guidance for Your HR Technology Journey
                                                </span>
                                            </h2>
                                        </div>
                                        <p className="text-lg italic text-[#C5D5EC] max-w-xl">
                                            Navigate the complex landscape of HR technology with confidence. Our expert advisors provide strategic guidance to help you select, implement, and optimize HR technology solutions that drive real business value.
                                        </p>
                                    </div>

                                    {/* Right Side: Static UI Image */}
                                    <div className="flex justify-center">
                                        <img
                                            src="/assets/homepageAssets/scroll0/images/advisory.png"
                                            alt="HR Tech Advisory Services visualization"
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
                                The Challenge Businesses Face
                            </h2>
                            <p className="text-lg text-gray-600 mb-8">
                                Organizations struggle with:
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
                                Without expert guidance, HR technology investments often fail to deliver expected returns.
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
                                Our HR Tech Advisory service provides:
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
                            alt="HR Tech Advisory consultation process"
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
                                Comprehensive Advisory Services
                            </h2>
                            <p className="text-gray-600 text-lg leading-relaxed">
                                From strategy to execution, we guide you through every step of your HR technology journey.
                            </p>
                        </div>

                        {/* Two Column Layout */}
                        <div className="grid lg:grid-cols-2 gap-10">

                            {/* Benefits */}
                            <div className="bg-white p-10 rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition-shadow duration-300">
                                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-8 text-blue-700">
                                    How Our Advisory Services Help
                                </h3>
                                <ul className="space-y-6">
                                    {[
                                        { title: "Strategic Clarity", text: "Align HR technology with business objectives and priorities." },
                                        { title: "Cost Optimization", text: "Maximize ROI and avoid costly implementation mistakes." },
                                        { title: "Vendor Selection", text: "Navigate the market with confidence and choose the right partners." },
                                        { title: "Change Management", text: "Ensure smooth adoption and user engagement." },
                                        { title: "Future-Proofing", text: "Build scalable solutions that grow with your organization." }
                                    ].map((item, idx) => (
                                        <li key={idx}>
                                            <span className="block font-semibold text-gray-900">{item.title}</span>
                                            <span className="text-gray-600">{item.text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* How It Works */}
                            <div className="bg-blue-50 p-10 rounded-2xl border border-blue-100 hover:shadow-md transition-shadow duration-300">
                                <h3 className="text-2xl font-semibold flex items-center gap-2 mb-8 text-blue-800">
                                    💡 Our Advisory Process
                                </h3>
                                <ol className="space-y-6 text-gray-800">
                                    {[
                                        "Discovery: Understand your business needs and current state",
                                        "Strategy: Develop a tailored HR technology roadmap",
                                        "Selection: Evaluate and recommend optimal solutions",
                                        "Implementation: Guide execution and change management",
                                        "Optimization: Continuous improvement and support"
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

                        {/* Who Should Use It */}
                        <div className="grid md:grid-cols-2 gap-12 bg-white p-8 md:p-10 rounded-2xl shadow-sm border border-gray-100">
                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
                                    🎯 Who Benefits Most
                                </h3>
                                <ul className="space-y-3 text-gray-600 text-sm leading-relaxed">
                                    {[
                                        "CHROs planning digital transformation",
                                        "HR leaders evaluating new technology",
                                        "Organizations undergoing mergers or restructuring",
                                        "Companies seeking to optimize existing HR tech stack"
                                    ].map((item, idx) => (
                                        <li key={idx} className="flex items-start gap-2">
                                            <span className="text-gray-500 mt-0.5">•</span> {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold flex items-center gap-2 mb-4 text-gray-800">
                                    🔒 Confidential & Independent
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                    Your success is our priority.
                                </p>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    We provide vendor-neutral advice based solely on your needs, ensuring you get unbiased recommendations that truly serve your organization's best interests.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section className="bg-blue-700 text-white py-16">
                    <div className="max-w-3xl mx-auto text-center px-6">
                        <h2 className="text-3xl font-bold mb-6">
                            Ready to Transform Your HR Technology Strategy?
                        </h2>
                        <p className="text-lg mb-8">
                            Schedule a consultation with our HR tech experts today.
                        </p>

                        <div className="flex flex-col gap-4 items-center">
                            <button
                                onClick={() => setShowPopup(true)}
                                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300"
                            >
                                Talk to a Consultant
                            </button>
                            <Link
                                to="/assessment"
                                className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300"
                            >
                                Take the Assessment
                            </Link>
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

                <style>{`
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
        `}</style>

                <Footer />
            </div>
        </>
    );
}
