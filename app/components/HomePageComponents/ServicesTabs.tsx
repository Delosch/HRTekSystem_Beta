
import React, { useState } from "react";
import { Link } from "@remix-run/react";
import {
  Map,
  Puzzle,
  DraftingCompass,
  Shapes,
  FileBarChart2,
} from "lucide-react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TimeSelector from "~/components/HomePageComponents/TimeSelector";

const services = [
  {
    id: "hr-roadmap",
    title: "Auto-generated HR Digital Roadmap & ROI",
    icon: <Map className="w-6 h-6" />,
    description:
      "We craft tailored HR transformation roadmaps that align with your business goals. Each step is strategically phased to drive measurable impact. From automation to culture change, we guide your journey end-to-end.",
    image: "/assets/homepageAssets/scroll0/images/roadmap1.png",
    cta: "Explore Roadmap Generator →",
    link: "/roadmap-service",
    features: [
      "Current State Mapping",
      "Digitalization Coverage",
      "Step-by-Step Planning",
      "Timeline Visualization",
    ],
  },
  {
    id: "hcm-vendor-fit",
    title: "Cognitive HCM Vendor Fit Engine",
    icon: <Puzzle className="w-6 h-6" />,
    description:
      "Take the guesswork out of choosing your HCM partner. Our intelligent HCM Vendor Fit Engine analyzes your unique business needs and instantly matches you with the best-fit HCM vendors saving you time, effort, and costly missteps.",
    image: "/assets/homepageAssets/scroll0/images/hcm.png",
    cta: "Explore Engine →",
    link: "/hcm-service",
    features: [
      "HCM Analysis",
      "Vendor Matching",
      "Fit Scoring",
      "Decision Support",
    ],
  },
  {
    id: "hr-maturity",
    title: "AI-driven HR Tech Diagnostics",
    icon: <FileBarChart2 className="w-6 h-6" />,
    description:
      "Assess where you stand and how far you can go. Our HR Technology Maturity Analysis evaluates your current HR tech landscape across key dimensions like automation, integration, analytics, and user experience. Gain clear insights into your maturity level and receive actionable guidance to advance to the next stage.",
    image: "/assets/homepageAssets/scroll0/images/matAnalysis.png",
    cta: "Explore Analyzer →",
    link: "/maturity-analysis-service",
    features: [
      "Capability Benchmarking",
      "Fit-Gap Analysis",
      "Stage Classification",
      "Roadmap Optimization",
    ],
  },
  {
    id: "shared-service",
    title: "Shared Services Operating Model Planner",
    icon: <DraftingCompass className="w-6 h-6" />,
    description:
      "Design unified service models that scale. Our Shared Service Designer enables you to structure and standardize service delivery across departments and functions. It ensures operational efficiency, governance, and consistency helping your organization reduce duplication and drive value at scale.",
    image: "/assets/homepageAssets/scroll0/images/sService.png",
    cta: "Explore Designer →",
    link: "/shared-service",
    features: [
      "Process Governance",
      "Decentralized or Centeralized",
      "Standard Operating System",
      "Scope of Shared Services",
    ],
  },
  {
    id: "change-management",
    title: "Intelligent Change Management Systems",
    icon: <Shapes className="w-6 h-6" />,
    description:
      "Proactively navigate organizational shifts with data-driven insights. Our Intelligent Change Management module empowers HR leaders to plan, execute, and monitor transformation initiatives with precision. By leveraging predictive analytics, stakeholder impact assessments, and adaptive communication strategies, this tool ensures smooth transitions, minimal disruption, and sustained employee engagement.",
    image: "/assets/homepageAssets/scroll0/images/changeMan.png",
    cta: "Explore Manager →",
    link: "/change-management-service",
    features: [
      "Change Readiness & Culture",
      "Change Champions",
      "Adaptive Communication Tools",
      "Readiness & Adoption Tracking",
    ],
  },
  {
    id: "hr-advisory",
    title: "HR Tech Advisory",
    icon: <FileBarChart2 className="w-6 h-6" />,
    description:
      "Strategic guidance for your HR technology journey. Our HR Tech Advisory service provides expert consultation to help you navigate the complex landscape of HR technology solutions. From vendor selection to implementation strategy, we offer tailored advice to ensure your HR tech investments deliver maximum value and align with your business objectives.",
    image: "/assets/homepageAssets/scroll0/images/advisory.png",
    cta: "Explore Advisory Services ",
    link: "/hrtech-advisory-service",
    features: [
      "Technology Strategy",
      "Vendor Evaluation",
      "Implementation Planning",
      "ROI Optimization",
    ],
  },
];

export default function ServicesTabs() {
  const [active, setActive] = useState("hr-roadmap");
  const current = services.find((s) => s.id === active);
  const [showPopup, setShowPopup] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(undefined);

  return (
    <section className="bg-gray-50 py-10 px-4">
      {/* Section Heading */}
      <div className="text-center mb-16 max-w-7xl mx-auto px-4">
        <h3 className="font-roboto font-bold text-[22px] md:text-[32px] lg:text-[38px] leading-tight tracking-tight text-slate-800">
          HR Cognitive Autopilot Engines that Diagnose, Predict, Execute
        </h3>
      </div>

      {/* Tab Icons */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mb-8 max-w-6xl mx-auto">
        {services.map((service) => (
          <button
            key={service.id || service.title}
            onClick={() => service.id && setActive(service.id)}
            className={`w-full h-28 flex flex-col justify-center items-center px-3 py-4 rounded-2xl border font-medium text-sm text-center transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 group ${active === service.id
              ? "bg-blue-600 text-white shadow-xl ring-4 ring-blue-500/20 border-transparent translate-y-[-4px]"
              : "bg-white text-gray-700 border-gray-300 hover:bg-white hover:border-blue-400 hover:text-blue-600"
              }`}
          >
            <span className={`mb-2 transition-transform duration-300 ${active === service.id ? 'scale-110' : 'group-hover:scale-110'}`}>
              {service.icon}
            </span>
            <span className="leading-tight">{service.title}</span>
          </button>
        ))}
      </div>

      {/* Service Card Display */}
      <div className="flex justify-center">
        <div className="w-full max-w-7xl bg-white rounded-3xl shadow-xl p-10 transform transition-all duration-500 hover:shadow-2xl border border-gray-100 hover:border-blue-200 hover:-translate-y-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Side */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                  {current!.title}
                </h1>
                <p className="text-gray-700 text-lg">{current!.description}</p>
                <Link
                  to={current!.link}
                  className="inline-block border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-sm hover:shadow-md"
                >
                  {current!.cta}
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-10 pt-20">
                {current!.features.map((feature, idx) => (
                  <div className="flex items-center gap-2" key={idx}>
                    <span className="text-xl">✔</span>
                    <p className="text-lg text-gray-900 font-medium">
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex justify-center">
              <img
                src={current!.image}
                alt={`Visual metaphor for ${current!.title
                  } in an HR/business context`}
                className="rounded-xl shadow-md max-w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


