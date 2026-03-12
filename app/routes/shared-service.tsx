import Footer from "../components/Footer";
import Navbar from "~/components/HomePageComponents/Navbar";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { UsersIcon, Cog6ToothIcon, ChartBarIcon, BuildingOfficeIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import { useRouteLoaderData, Link } from "@remix-run/react";
import BookingModal from "~/components/HomePageComponents/BookingModal";
import { MetaFunction } from "@remix-run/node";
import { generateMeta, generateBreadcrumbSchema, generateServiceSchema } from "~/utils/seo";

export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HR Shared Services Operating Model Designer",
    description: "Design and optimize your HR Shared Services Operating Model. Centralize HR tasks, improve consistency, and drive operational efficiency with our intelligent designer.",
    keywords: "HR shared services, operating model design, SSOM, centralized HR hub, HR process standardization, service delivery model",
    url: "https://www.hrteksystem.com/shared-service",
    image: "https://www.hrteksystem.com/og-shared-services.jpg",
  });
};

export default function HRSharedServicesPage() {
  const [showPopup, setShowPopup] = useState(false);
  const rootData = useRouteLoaderData("root") as { user: any };
  const user = rootData?.user;

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Shared Services", url: "/shared-service" }
  ]);

  const serviceSchema = generateServiceSchema({
    name: "HR Shared Services Designer",
    description: "Operating model planner for centralized HR service delivery",
    provider: "HRTek System",
    areaServed: "Global",
    url: "https://www.hrteksystem.com/shared-service"
  });

  return (
    <>
      <link rel="canonical" href="https://www.hrteksystem.com/shared-service" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
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

        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side: Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-white/90 text-sm font-medium">Operating Model Planner</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight">
                  HR-Tek Shared Service
                  <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                    Designer
                  </span>
                </h1>
                <p className="text-xl md:text-2xl font-semibold text-white/90 leading-relaxed">
                  Crafting Efficient, Centralized HR Service Experiences
                </p>
              </div>

              {/* Description */}
              <p className="text-lg text-white/80 leading-relaxed max-w-xl">
                <span className="font-bold text-white">"One Team. Multiple Functions. Seamless Experience."</span><br />
                A Shared Services Operating Model (SSOM) in HR is a strategic approach that consolidates
                transactional and administrative HR tasks into a centralized service delivery hub. Instead of
                having each business unit or region manage these services independently, Shared Services ensures
                that standardized, efficient, and high-quality services are delivered consistently across the organization.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button
                  onClick={() => setShowPopup(true)}
                  className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-bold text-lg hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
                >
                  Talk to Expert
                </button>
                <Link
                  to="/engine/shared-services"
                  className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 shadow-xl flex items-center justify-center"
                >
                  Start Model Designer
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/20">
                <div>
                  <div className="text-3xl font-black text-white">1</div>
                  <div className="text-sm text-white/70 mt-1">Unified Team</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">100%</div>
                  <div className="text-sm text-white/70 mt-1">Consistency</div>
                </div>
                <div>
                  <div className="text-3xl font-black text-white">Cost</div>
                  <div className="text-sm text-white/70 mt-1">Optimized</div>
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
                  src="/assets/homepageAssets/scroll0/images/sService.png"
                  alt="Shared Services Visualization"
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
        <div className="max-w-4xl mx-auto px-6">
          {/* Our Approach */}
          <div className="w-full">
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
        </div>
      </section>



      {/* Final CTA */}
      <section className="bg-blue-700 text-white py-16">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Begin Your Transformation Journey
          </h2>
          <p className="text-lg mb-8">
            Connect with our HR experts to discover how HR-Tek can accelerate your transformation.
          </p>

          <div className="flex flex-col gap-4 items-center">
            <button
              onClick={() => setShowPopup(true)}
              className="bg-white text-blue-700 px-8 py-3 rounded-lg font-semibold shadow-md hover:bg-gray-100 transition-all duration-300"
            >
              Talk to a Consultant
            </button>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showPopup}
        onClose={() => setShowPopup(false)}
        engineName="HR Shared Services Operating Model Designer"
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
    </>
  );
}
