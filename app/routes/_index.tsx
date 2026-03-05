// landing page (main site)
import { useState } from "react";
import { Link } from "@remix-run/react";
import FAQSection from "app/components/HomePageComponents/FAQsection";
import Footer from "../components/Footer";
import CustomerSuccessCarousel from "~/components/HomePageComponents/CustomerSuccessCarousel";
import Carousel from "~/components/HomePageComponents/MainCarousel";
import Navbar from "~/components/HomePageComponents/Navbar";
import ServicesTabs from "~/components/HomePageComponents/ServicesTabs";
import TestimonialsSection from "~/components/HomePageComponents/TestimonialsSection";
import { MetaFunction } from "@remix-run/node";
import { generateMeta, generateFAQSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
  return generateMeta({
    title: "AI-Powered HR Transformation Platform",
    description: "Transform your HR operations with HRTek System's AI-driven diagnostics, strategic roadmaps, and intelligent change management solutions. Trusted by leading organizations worldwide.",
    keywords: "HR transformation, AI HR platform, digital maturity assessment, HCM vendor selection, HR roadmap generator, change management, HR technology",
    url: "https://hrteksystem.com",
    image: "https://hrteksystem.com/og-home.jpg",
  });
};

export default function Index() {
  // FAQ Schema for SEO
  const faqSchema = generateFAQSchema([
    {
      question: "What does your software help HR teams achieve?",
      answer: "Our platform empowers HR teams to navigate transformation with confidence—whether it's building a strategic HR roadmap, optimizing technology choices, or redesigning service delivery models."
    },
    {
      question: "How is this solution relevant to my company's size and maturity?",
      answer: "Our solution dynamically adapts to your organization's scale—whether you're a small business needing foundational guidance or an enterprise seeking digital maturity and change governance."
    },
    {
      question: "How does the HR Transformation Roadmap work?",
      answer: "It analyzes your current HR capabilities and generates a tailored, actionable transformation path aligned with business goals and organizational readiness."
    },
    {
      question: "What is HCM Vendor Fit Analysis?",
      answer: "This feature evaluates your HR needs and matches them with the most suitable HCM vendors, ensuring strategic alignment, scalability, and ROI."
    },
    {
      question: "How do you handle change management within the platform?",
      answer: "Our Intelligent Change Management module identifies potential adoption challenges, recommends engagement strategies, and supports smooth transitions across organizational layers."
    },
    {
      question: "Can this help in setting up or optimizing HR shared services?",
      answer: "Yes. Our Shared Service Designing module provides architectural and operational models that improve efficiency, user experience, and service scalability."
    },
    {
      question: "Is there support for assessing our current HR technology maturity?",
      answer: "Absolutely. Our HR Technology Maturity Analysis benchmarks your current systems, identifies gaps, and provides clear next steps for digital evolution."
    }
  ]);

  return (
    <>
      <link rel="canonical" href="https://hrteksystem.com/" />

      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="bg-white">
        {/* Hero Section*/}
        <Navbar />
        <Carousel />

        {/* Business Size + Our Engagement Model Section*/}
        <section className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-24 px-6 overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

          {/* Business Size Part */}
          <div className="max-w-7xl mx-auto text-center relative z-10">
            <div className="mb-16 animate-fade-in">
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
                Powered by Cognitive AI
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-8 leading-tight px-4 sm:px-0">
                Reinvent Your HR Ecosystem with Cognitive AI
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4">
                Drive transformation across your organization with intelligent solutions tailored to your business size
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Small Business */}
              <BusinessCard
                imageSrc="/assets/homepageAssets/scroll0/images/SmallBusiness.png"
                title="Small Business"
                description="Plan your HR growth smartly with the right tech, vendors, and change support."
                features={[
                  "Scalable HR Blueprint",
                  "Optimized Vendor Alignment",
                  "Foundational Change Enablement",
                ]}
                cta="More Small Business Solutions"
              />

              {/* Midsized Business */}
              <BusinessCard
                imageSrc="/assets/homepageAssets/scroll0/images/MidSizeBusiness.png"
                title="Midsized Business"
                description="Streamline HR operations with tailored tech fit, service design, and transformation roadmap."
                features={[
                  "Technology-Process Synergy",
                  "Operational Excellence Design",
                  "Centralized Service Architecture",
                  "Adaptive Change Strategy",
                ]}
                cta="More Midsized Business Solutions"
              />

              {/* Large Business */}
              <BusinessCard
                imageSrc="/assets/homepageAssets/scroll0/images/Enterprise.png"
                title="Large Business"
                description="Drive enterprise-wide HR transformation with intelligent change, maturity analysis, and strategy."
                features={[
                  "Enterprise HR Transformation Strategy",
                  "Digital Maturity Benchmarking",
                  "Strategic Vendor Ecosystem Curation",
                  "Integrated Change Governance",
                  "Next-Gen Service Delivery Models",
                ]}
                cta="More Large Business Solutions"
              />
            </div>
          </div>

          {/* Our Engagement Model Part */}
          <div className="max-w-7xl mx-auto mt-24 relative z-10">
            <div className="text-center mb-12">
              <span className="inline-block px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-sm font-semibold mb-4">
                How We Work
              </span>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-900 mb-4 px-2">
                Cognitive AI Aligned Engagement Model
              </h3>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Our proven methodology combines AI intelligence with human expertise
              </p>
            </div>

            {/* Container for 4 horizontal steps */}
            <div className="flex flex-col md:flex-row gap-8 justify-between text-black">
              {/* First item */}
              <div className="flex-1 flex flex-col items-center gap-6 group">
                <div className="w-full overflow-hidden rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="relative">
                    <img
                      src="/assets/homepageAssets/scroll0/images/howItWork1.png"
                      alt="AI-powered HR diagnostic assessment questionnaire for digital maturity analysis"
                      className="w-full h-auto object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100 transform transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-lg shadow-lg">1</span>
                    <h4 className="font-bold text-gray-900 text-lg">Diagnostic Assessment</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    We begin with a{" "}
                    <span className="font-bold text-blue-600">Cognitive Diagnostic Assessment</span>, powered
                    by AI-driven maturity scoring to understand your current HR landscape.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="text-blue-500 text-4xl font-bold animate-pulse">→</div>
              </div>

              {/* Second item */}
              <div className="flex-1 flex flex-col items-center gap-6 group">
                <div className="w-full overflow-hidden rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="relative">
                    <img
                      src="/assets/homepageAssets/scroll0/images/howItWork2.png"
                      alt="Cognitive AI analysis engine processing HR transformation data and patterns"
                      className="w-full h-auto object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-indigo-100 transform transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-lg shadow-lg">2</span>
                    <h4 className="font-bold text-gray-900 text-lg">AI Analysis</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    Your inputs flow into HR-Tek's{" "}
                    <span className="font-bold text-indigo-600">Cognitive Reasoning Engine</span>, where AI
                    analyses patterns, interdependencies, and improvement opportunities.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="text-indigo-500 text-4xl font-bold animate-pulse">→</div>
              </div>

              {/* Third item */}
              <div className="flex-1 flex flex-col items-center gap-6 group">
                <div className="w-full overflow-hidden rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="relative">
                    <img
                      src="/assets/homepageAssets/scroll0/images/howItWork3.png"
                      alt="Personalized HR transformation roadmap and strategic insights dashboard"
                      className="w-full h-auto object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-purple-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-purple-100 transform transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 text-white font-bold text-lg shadow-lg">3</span>
                    <h4 className="font-bold text-gray-900 text-lg">Personalized Insights</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    The platform delivers{" "}
                    <span className="font-bold text-purple-600">
                      personalized insights and clear transformation roadmaps
                    </span>{" "}
                    powered by real-time analytics and benchmarks.
                  </p>
                </div>
              </div>

              <div className="hidden md:flex items-center justify-center">
                <div className="text-purple-500 text-4xl font-bold animate-pulse">→</div>
              </div>

              {/* Fourth item */}
              <div className="flex-1 flex flex-col items-center gap-6 group">
                <div className="w-full overflow-hidden rounded-2xl shadow-xl transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="relative">
                    <img
                      src="/assets/homepageAssets/scroll0/images/howItWork4.png"
                      alt="Expert HR transformation implementation support and change management execution"
                      className="w-full h-auto object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-pink-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-lg border border-pink-100 transform transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 text-white font-bold text-lg shadow-lg">4</span>
                    <h4 className="font-bold text-gray-900 text-lg">Implementation</h4>
                  </div>
                  <p className="text-gray-600 leading-relaxed">
                    We go beyond advising, HR-Tek's{" "}
                    <span className="font-bold text-pink-600">Agentic AI</span> and consulting team work together
                    to transform the ways your organization works.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section*/}
        <section id="services" className="scroll-mt-20">
          <ServicesTabs />
        </section>

        {/* Testimonials Section

        <TestimonialsSection testimonials={testimonials} />

        */}

        {/* Costumer Success Stories Section

        <CustomerSuccessCarousel />

        */}

        <FAQSection />

        <section className="bg-[#f7fbff] py-16 px-6 md:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center">
            {/* Left Column: Heading + Text */}
            <div>
              <h2 className="text-4xl font-semibold mb-4 text-gray-800">
                What’s Shaping the Future of HR?
              </h2>
              <p className="text-lg text-gray-600">
                Our Knowledge Hub is where HR innovation meets practical execution. Read
                how organizations are building scalable processes, choosing the
                right HCM tools, and managing change intelligently. Whether
                you’re scaling up or optimizing, our insights are designed to
                support your unique journey.
              </p>
            </div>

            {/* Center Image */}
            <div>
              <img
                src="/assets/homepageAssets/readArticles.png"
                alt="HR technology insights and transformation strategies Knowledge Hub"
                className="w-full rounded-lg shadow"
                loading="lazy"
                decoding="async"
              />
            </div>

            {/* Right Column: Blog Entries */}
            <div className="space-y-8">
              {[
                {
                  title: "Why Most HR Technology Investments Fail",
                  img: "/assets/blogAssets/fail_invest.png",
                  link: "/articles",
                },
                {
                  title: "From HR Automation to HR Intelligence",
                  img: "/assets/blogAssets/hr_intelligence.png",
                  link: "/articles",
                },
                {
                  title: "Designing a Future-Ready HR Operating Model",
                  img: "/assets/blogAssets/op_model.png",
                  link: "/articles",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between border-b pb-4"
                >
                  <Link
                    to={item.link}
                    className="text-blue-600 text-base font-medium leading-snug pr-4 hover:underline"
                  >
                    {item.title}
                  </Link>
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-20 h-14 object-cover rounded-md"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA Section */}
        <section id="contact" className="py-20 bg-[#0B2A57] relative overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          </div>

          <div className="relative max-w-7xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">Ready to transform your HR operations?</h2>
            <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-10 max-w-5xl mx-auto">
              Join the organizations that are already optimizing their workforce with HR-Tek System.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 bg-white text-blue-900 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-xl"
            >
              <span>Get in Touch</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

type BusinessCardProps = {
  imageSrc: string;
  title: string;
  description: string;
  features: string[];
  cta: string;
};

function BusinessCard({
  imageSrc,
  title,
  description,
  features,
  cta,
}: BusinessCardProps) {
  return (
    <div className="group relative bg-white border-2 border-blue-100 rounded-2xl flex flex-col justify-between h-full overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

      <div className="relative px-6 py-8 space-y-4 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          <img src={imageSrc} alt={`${title} HR transformation solutions`} className="mx-auto h-48 relative z-10 transform group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" />
        </div>

        <div className="space-y-3">
          <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 group-hover:from-indigo-600 group-hover:to-purple-600 transition-all duration-300">
            {title}
          </h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>

        <div className="space-y-3 mt-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="relative overflow-hidden bg-gradient-to-r from-gray-50 to-blue-50 hover:from-blue-50 hover:to-indigo-50 text-gray-700 hover:text-gray-900 px-4 py-3 rounded-lg text-sm font-medium text-left transition-all duration-300 shadow-sm hover:shadow-md group/item"
            >
              <div className="flex justify-between items-center">
                <span className="relative z-10">{feature}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-indigo-500/0 group-hover/item:from-blue-500/5 group-hover/item:to-indigo-500/10 transition-all duration-300"></div>
            </div>
          ))}

        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
    </div>
  );
}

{
  /* Array For Test Testimonials Data


const testimonials = [
  {
    quote:
      "HR Sols completely transformed how we manage our people.From onboarding to payroll, everything runs smoother now.It’s easy to use and saves our team so much time.Can’t imagine going back!",
    name: "Jonathon Bartlett",
    title: "Chief Human Resources Officer at Indica Labs",
    image: "/assets/homepageAssets/scroll3/square1/pp1.png",
  },
  {
    quote:
      "HR Sols and HR Transformation are a package deal. If you want transformation, I’m making the case for HR Sols.",
    name: "Marijane Moreau Peterson",
    title: "Director of Talents and Culture at Viridia Terra International",
    image: "/assets/homepageAssets/scroll3/square8/pp8.png",
  },
  {
    quote:
      "The automation tools in HR Sol saved us countless hours.We used to drown in spreadsheets — now it’s all streamlined.What’s more, the learning curve was surprisingly low.Our HR team loves the self-service features.Even employees are happier with the experience.The support team? Absolutely top-notch.",
    title: "VP of HR & Sustainability at PROBI",
    image: "/assets/homepageAssets/scroll3/square2/pp2.png",
    name: "Morgan Von Berg",
  },
  {
    quote:
      "HR Sols shared service design and payroll together have saved me almost 20 hours a week...",
    name: "Rachael Schau",
    title: "Chief of Staff at Rockford Silk Screen Process",
    image: "/assets/homepageAssets/scroll3/square3/pp3.png",
  },
  {
    quote:
      "HR Sol’s shared service model brought structure to our HR chaos.We had fragmented systems and no consistency.Now, everything is centralized and accessible.Support tickets are resolved faster.Service delivery is smooth across all our branches.Highly recommend it to any multi-site organization.",
    name: "Anne Seebach",
    title: "Head of People & Culture at Architrave",
    image: "/assets/homepageAssets/scroll3/square4/pp4.png",
  },
  {
    quote:
      "The way HR Sols has designed the product has been very thoughtful — the needs of the employee as well as the needs of HR.",
    name: "Rob Scott",
    title: "Chief Operating Officer at Smart WFM",
    image: "/assets/homepageAssets/scroll3/square5/pp5.png",
  },
  {
    quote:
      "HR Sols was easy to learn and start using for everyone at the company and made compliance easy.",
    name: "Josh Franklin",
    title: "HR Program Manager at CTI, Inc.",
    image: "/assets/homepageAssets/scroll3/square6/pp6.png",
  },
  {
    quote:
      "I’d absolutely recommend HR Sols Time Tracking. It’s a great system that does exactly what you need it to do.",
    name: "Jessica Neal",
    title: "HR General Manager at American Cedar & Millwork",
    image: "/assets/homepageAssets/scroll3/square7/pp7.png",
  },
  {
    quote:
      "We’ve seen a real shift in employee engagement since switching.The pulse surveys, feedback tools, and performance tracking really work.Managers are more proactive with coaching.HR Sol made everything feel more people-first.The UI is clean and easy to navigate.It’s more than software — it’s a culture enabler",
    name: "Rajeev Kapoor",
    title: "HR Director",
    image: "/assets/homepageAssets/scroll3/square2/pp2.png",
  },
];

*/
}
