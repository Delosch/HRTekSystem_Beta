import { useState } from "react";

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
        {/* Left: Heading */}
        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
          Frequently Asked <br /> Questions
        </h2>

        {/* Right: Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`rounded-md bg-[#023e8a] transition-all duration-300 ${
                activeIndex === index ? "pb-6" : ""
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
