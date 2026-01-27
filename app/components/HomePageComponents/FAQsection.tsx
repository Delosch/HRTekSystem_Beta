import { useState } from "react";
import { Link } from "@remix-run/react";
import { ArrowRight } from "lucide-react";

export default function FAQSection() {
  const faqs = [
    {
      question: "What does your software help HR teams achieve?",
      answer:
        "Our platform empowers HR teams to navigate transformation with confidence—whether it's building a strategic HR roadmap, optimizing technology choices, or redesigning service delivery models.",
    },
    {
      question: "How is this solution relevant to my company’s size and maturity",
      answer:
        "Our solution dynamically adapts to your organization’s scale—whether you're a small business needing foundational guidance or an enterprise seeking digital maturity and change governance.",
    },
    {
      question: "How does the HR Transformation Roadmap work?",
      answer:
        "It analyzes your current HR capabilities and generates a tailored, actionable transformation path aligned with business goals and organizational readiness.",
    },
    {
      question: "What is HCM Vendor Fit Analysis",
      answer:
        "This feature evaluates your HR needs and matches them with the most suitable HCM vendors, ensuring strategic alignment, scalability, and ROI.",
    },
    {
      question: "How do you handle change management within the platform?",
      answer:
        "Our Intelligent Change Management module identifies potential adoption challenges, recommends engagement strategies, and supports smooth transitions across organizational layers.",
    },
    {
      question: "Can this help in setting up or optimizing HR shared services?",
      answer:
        "Yes. Our Shared Service Designing module provides architectural and operational models that improve efficiency, user experience, and service scalability.",
    },
    {
      question: "Is there support for assessing our current HR technology maturity?",
      answer:
        "Absolutely. Our HR Technology Maturity Analysis benchmarks your current systems, identifies gaps, and provides clear next steps for digital evolution.",
    },
  ];

  const [activeIndex, setActiveIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <section className="bg-[#03045e] text-white py-20 px-6 md:px-12">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">
        {/* Left: Heading & Content */}
        <div className="flex flex-col items-start lg:sticky lg:top-24 h-fit">
          <h2 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Frequently Asked <br /> Questions
          </h2>
          <p className="text-lg text-blue-100 max-w-md mb-8 leading-relaxed font-light">
            Can't find the answer you're looking for? Our dedicated team is ready to assist you with any inquiries about our HR transformation solutions.
          </p>
          <Link
            to="/contact"
            className="group inline-flex items-center gap-3 bg-white text-[#03045e] px-8 py-4 rounded-2xl font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Contact Support
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Right: Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-md bg-[#023e8a] transition-all duration-300 ${activeIndex === index ? "pb-6" : ""
                }`}
            >
              <button
                onClick={() => toggle(index)}
                className="w-full flex justify-between items-center text-left px-6 py-5 focus:outline-none"
              >
                <span className="font-semibold text-white">{faq.question}</span>
                <span className="text-2xl font-bold">
                  {activeIndex === index ? "−" : "+"}
                </span>
              </button>
              {activeIndex === index && (
                <div className="px-6 text-sm text-gray-300">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
