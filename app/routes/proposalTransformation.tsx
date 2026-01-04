import React, { useState, useEffect } from "react";
import Sidebar from "../components/DashboardComponents/Sidebar";
import {
  Building2,
  Phone,
  Globe,
  Calendar,
  Mail,
  Users,
  FileText,
  DollarSign,
  Clock,
} from "lucide-react";
import ExecutiveSummary from "../components/DashboardComponents/ExSummaryProposal";
import PricingStructure from "../components/DashboardComponents/PricingProposal";
import ProjectTimeline from "../components/DashboardComponents/TimelineProposal";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export default function ProposalPage() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const clientName = "Acme Corp";
  const projectName = "NextGen AI Platform";

  const priorities = [
    "Enhance operational efficiency",
    "Improve customer engagement",
    "Accelerate digital transformation",
  ];

  const outcomes = [
    "Increased revenue streams",
    "Stronger competitive positioning",
    "Sustainable business growth",
  ];

  const objectives = [
    "Foster innovation and creativity",
    "Strengthen cross-functional collaboration",
    "Build resilience against market volatility",
  ];

  const constraints = [
    "Budgetary limitations",
    "Regulatory compliance requirements",
    "Limited internal technical resources",
  ];

  const pricingData = [
    {
      phase: "Phase 1: Discovery",
      components: "Initial assessment, stakeholder workshops",
      range: "$5,000 - $8,000",
      justification: "Comprehensive research and tailored recommendations",
    },
    {
      phase: "Phase 2: Implementation",
      components: "Solution deployment, process integration",
      range: "$15,000 - $25,000",
      justification: "Hands-on execution with measurable outcomes",
    },
    {
      phase: "Phase 3: Optimization",
      components: "Performance tracking, ongoing support",
      range: "$7,000 - $12,000",
      justification: "Ensuring sustainability and continuous improvement",
    },
  ];

  const engagementDuration = "12 weeks";

  const phases = ["Diagnostic", "Quick Wins", "Strategic Build"];

  const timelineData = [
    {
      title: "Week 1-2",
      color: "sky" as const,
      items: ["Initial Assessments", "Stakeholder Alignment", "Diagnostic Workshops"],
    },
    {
      title: "Week 3-7",
      color: "amber" as const,
      items: [
        "Deploy the Help Desk Prototype",
        "Change Management Toolkit (V-I)",
        "Change Champion Program",
        "PeopleSoft Optimization Implementation",
      ],
    },
    {
      title: "Week 8-12",
      color: "emerald" as const,
      items: ["Strategic Build Activities", "Performance Optimization", "Ongoing Support Framework"],
    },
  ];

  const downloadPDF = async () => {
    const element = document.querySelector("main"); // capture only main content
    if (!element) return;

    const canvas = await html2canvas(element as HTMLElement, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save("proposal.pdf");
  };

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-sky-50 via-amber-50 to-rose-50">
      {!isSidebarCollapsed && <Sidebar />}

      <main className="flex-1 md:ml-64 p-6 sm:p-10 space-y-12">
        {/* Front Page Section */}
        <section className="bg-white shadow-xl rounded-2xl p-10 relative overflow-hidden min-h-[80vh] flex flex-col justify-between">
          {/* Decorative background */}
          <div className="absolute inset-0 opacity-30 bg-gradient-to-tr from-sky-200 via-amber-200 to-rose-200 rounded-2xl" />

          {/* Date - Top Left */}
          <div className="relative z-10 mb-6 flex justify-start items-start">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5 text-amber-600" />
              <span className="font-medium">August 18, 2025</span>
            </div>
          </div>

          {/* Center Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 flex-grow justify-center">
            {/* Heading */}
            <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
              Project Proposal
            </h1>
            <h2 className="text-2xl text-rose-700 font-medium max-w-2xl">
              Tailored Solutions for Your Business Growth
            </h2>

            {/* Extra Elements */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-10">
              <div className="bg-white border border-rose-100 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-center">
                  <Users className="w-8 h-8 text-rose-600 mb-3" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Our Team
                </h3>
                <p className="text-gray-600 text-sm">
                  Experienced professionals dedicated to driving your success.
                </p>
              </div>
              <div className="bg-white border border-emerald-100 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-center">
                  <Building2 className="w-8 h-8 text-emerald-600 mb-3" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Our Vision
                </h3>
                <p className="text-gray-600 text-sm">
                  Delivering innovative solutions tailored to your business
                  needs.
                </p>
              </div>
              <div className="bg-white border border-amber-100 rounded-xl p-6 shadow-sm hover:shadow-md transition">
                <div className="flex justify-center">
                  <Globe className="w-8 h-8 text-amber-600 mb-3" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Global Reach
                </h3>
                <p className="text-gray-600 text-sm">
                  Serving clients across industries and regions worldwide.
                </p>
              </div>
            </div>
          </div>

          {/* Company Details - Subtle Footer */}
          <footer className="relative z-10 mt-10 border-t border-gray-100 pt-3 text-xs text-gray-400 flex flex-col md:flex-row justify-between items-center">
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3 text-gray-300" /> 123 Corporate
              Plaza, Business City
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3 h-3 text-gray-300" /> +91 98765 43210
            </span>
            <span className="flex items-center gap-1">
              <Mail className="w-3 h-3 text-gray-300" /> info@company.com
            </span>
            <a
              href=""
              className="flex items-center gap-1 text-sky-500 hover:underline"
            >
              <Globe className="w-3 h-3" /> www.companywebsite.com
            </a>
          </footer>
        </section>

        {/* Executive Summary Section */}
        <ExecutiveSummary
          clientName={clientName}
          priorities={priorities}
          outcomes={outcomes}
          objectives={objectives}
          constraints={constraints}
        />

        {/* Pricing Structure Section */}
        <PricingStructure
          clientName={clientName}
          projectName={projectName}
          pricingData={pricingData} />

        {/* Project Timeline Section */}
        <ProjectTimeline
          engagementDuration={engagementDuration}
          phases={phases}
          timelineData={timelineData}
        />
      </main>
      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 flex gap-3 z-[9999]">
        <button
          onClick={downloadPDF}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg shadow-md hover:bg-amber-700"
        >
          Download PDF
        </button>
        <button
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg shadow-md hover:bg-emerald-700"
        >
          Agree
        </button>
      </div>
    </div>
  );
}
