import React, { useState, useEffect, useRef } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Target,
  Layers,
  Search,
  Settings,
  ShieldCheck,
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  Calendar,
  MessageSquare,
  Clock,
  DollarSign,
  ChevronRight,
  Download,
  CheckCircle2,
  Info,
  Lock,
  CornerDownRight,
  ArrowRight,
  Building2,
  Phone,
  Mail,
  Globe,
  Monitor,
  Heart,
  Zap,
  Printer,
  ChevronDown,
  Layout
} from "lucide-react";
import { requireUserSession } from "~/lib/session.server";
import { getUserProfile } from "~/models/user.model";
import { getCompanyProfile } from "~/models/company.model";
import { getCompanyAdvisories } from "~/models/hti.model";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  const user = await getUserProfile(session.userId);
  if (!user || !user.organisationId) {
    throw new Response("User or Company not found", { status: 404 });
  }

  const company = await getCompanyProfile(user.organisationId);
  const reports = await getCompanyAdvisories(user.organisationId);
  const latestReport = reports && reports.length > 0
    ? reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
    : null;

  return json({
    company,
    user,
    latestReport,
    generatedAt: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  });
}

const sections = [
  { id: "cover", title: "Cover Page", icon: Monitor },
  { id: "exec-summary", title: "1. Executive Summary", icon: FileText },
  { id: "objectives", title: "2. Client Objectives", icon: Target },
  { id: "model", title: "3. Engagement Model", icon: Layers },
  { id: "phase1", title: "4. Phase 1: Assess", icon: Search },
  { id: "phase2", title: "5. Phase 2: Advise", icon: Settings },
  { id: "phase4", title: "6. Phase 3: Implement", icon: ShieldCheck },
  { id: "change-mgmt", title: "7. Phase 4: Adoption", icon: Users },
  { id: "support", title: "8. Phase 5: Optimize", icon: TrendingUp },
  { id: "governance", title: "9. Governance", icon: Activity },
  { id: "commercials", title: "10. Commercials", icon: DollarSign },
  { id: "legal", title: "11-14. Legal & Terms", icon: Lock },
  { id: "appendix-d", title: "Appendix D: Mapping", icon: BarChart3 },
];

export default function ProposalTransformationCorporate() {
  const { company, latestReport, generatedAt } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState("cover");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const clientName = company?.company_name || "Valued Customer";
  const assessmentId = latestReport?.reportId?.split('_')[1]?.toUpperCase() || "HT-2026-SR-99X";

  const handlePrint = () => {
    window.print();
  };

  const downloadPDF = async () => {
    setIsExporting(true);
    const element = reportRef.current;
    if (!element) return;

    // Use a slight delay for re-rendering if needed
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1200 // Force standard width for PDF capture
        });

        const imgWidth = 210; // A4 Width in mm
        const pageHeight = 297; // A4 Height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        const pdf = new jsPDF('p', 'mm', 'a4');
        let position = 0;

        pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save(`HR-Tek_Proposal_${clientName.replace(/\s+/g, '_')}.pdf`);
      } catch (err) {
        console.error("PDF Export failed", err);
      } finally {
        setIsExporting(false);
      }
    }, 500);
  };

  const scrollToSection = (id: string) => {
    setActiveTab(id);
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Sync scroll with active tab
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const section of sections) {
        const element = document.getElementById(section.id);
        if (element) {
          const top = element.offsetTop;
          const height = element.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveTab(section.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col font-sans text-slate-900">
      {/* Header Bar */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between px-8 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-slate-900 rounded flex items-center justify-center">
              <Monitor className="text-white w-5 h-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">HR-TEK SYSTEM</span>
          </div>
          <div className="h-6 w-px bg-slate-200 mx-2" />
          <p className="text-slate-500 text-sm font-medium">Project Proposal: <span className="text-slate-900">{clientName}</span></p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Report
          </button>
          <button
            onClick={downloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {isExporting ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Image PDF
          </button>
          <button className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors">
            Approve Proposal
          </button>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <nav className="w-72 bg-white border-r border-slate-200 h-[calc(100vh-64px)] overflow-y-auto sticky top-16 hidden xl:block p-6 print:hidden">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 px-3">Table of Contents</p>
          <div className="space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${activeTab === section.id
                  ? "bg-slate-100 text-slate-900"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
              >
                <section.icon className={`w-4 h-4 ${activeTab === section.id ? "text-slate-900" : "text-slate-400 group-hover:text-slate-600"}`} />
                {section.title}
              </button>
            ))}
          </div>

          <div className="mt-12 p-6 bg-slate-900 rounded-xl text-white">
            <h4 className="text-sm font-bold mb-2">Need Help?</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">Contact your dedicated transformation lead for any clarifications.</p>
            <a href="mailto:support@hrteksystem.com" className="text-xs font-bold text-blue-400 hover:underline">Contact Support</a>
          </div>
        </nav>

        {/* Report Content */}
        <main className="flex-1 overflow-x-hidden">
          <div
            ref={reportRef}
            className="max-w-[900px] mx-auto bg-white my-12 border border-slate-200 shadow-2xl p-[60px] md:p-[80px] space-y-24 print:shadow-none print:border-none print:my-0 print:p-0"
          >

            {/* 0. COVER PAGE */}
            <section id="cover" className="min-h-[900px] flex flex-col justify-between pt-20">
              <div>
                <div className="flex items-center gap-3 mb-24 grayscale brightness-0 opacity-80">
                  <div className="w-12 h-12 bg-slate-900 rounded flex items-center justify-center">
                    <Monitor className="text-white w-8 h-8" />
                  </div>
                  <span className="text-2xl font-bold tracking-tight text-slate-900">HR-TEK SYSTEM</span>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 px-4 py-1.5 bg-slate-50 border border-slate-200 self-start inline-flex rounded-full">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Confidential Proposal</span>
                  </div>
                  <h1 className="text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                    End-to-End <br />
                    HR Digital <br />
                    Transformation
                  </h1>
                  <p className="text-xl text-slate-500 max-w-xl font-medium pt-4">
                    A comprehensive strategy for enterprise-wide HR technology modernization and operational excellence.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-20 gap-y-12 border-t border-slate-100 pt-16">
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Prepared For</p>
                  <p className="text-xl font-bold text-slate-900 underline decoration-blue-600/30 decoration-4 underline-offset-4">{clientName}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Reference ID</p>
                  <p className="text-xl font-bold text-slate-900">{assessmentId}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Issue Date</p>
                  <p className="text-slate-900 font-bold">{generatedAt}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Valid Until</p>
                  <p className="text-slate-900 font-bold">August 18, 2026</p>
                </div>
              </div>
            </section>

            {/* 1. EXECUTIVE SUMMARY */}
            <section id="exec-summary" className="scroll-mt-32 space-y-10">
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">1. Executive Summary</h2>
                <FileText className="w-8 h-8 text-slate-300" />
              </div>

              <div className="prose prose-slate max-w-none">
                <p className="text-xl leading-relaxed text-slate-700 font-medium">
                  HR-Tek System proposes a structured, outcome-driven engagement designed to assess, modernize, and unify {clientName}’s HR ecosystem. Our model ensures measurable business impact through the integration of proprietary assessment engines and advisory frameworks.
                </p>

                <div className="grid grid-cols-2 gap-8 my-12">
                  <div className="bg-[#FAFBFD] p-8 border-l-4 border-blue-600">
                    <h4 className="text-blue-900 font-bold text-sm mb-2">The Model</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      Our <span className="font-bold text-slate-900 italic">Assess → Advise → Implement → Optimize</span> framework ensures that every technology decision is backed by data and aligned with business growth.
                    </p>
                  </div>
                  <div className="bg-[#FAFBFD] p-8 border-l-4 border-slate-900">
                    <h4 className="text-slate-900 font-bold text-sm mb-2">The Impact</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      We target a reduction in manual processing, enhancement in employee NPS, and total transparency in HR spend through consolidated SaaS governance.
                    </p>
                  </div>
                </div>

                <p className="text-slate-500 text-sm italic">
                  This proposal outlines the complete project lifecycle, processes, deliverables, and commercial structures managed natively within the HR-Tek System platform.
                </p>
              </div>
            </section>

            {/* 2. CLIENT OBJECTIVES */}
            <section id="objectives" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">2. Client Objectives & Context</h2>
                <Target className="w-8 h-8 text-slate-300" />
              </div>

              <div className="grid grid-cols-2 gap-16">
                <div>
                  <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-8">Strategic Priorities</h3>
                  <ul className="space-y-6">
                    {[
                      "Standardize HR processes across global entities",
                      "Leverage AI for predictive talent analytics",
                      "Modernize legacy HCM infrastructure",
                      "Optimize total cost of HR ownership (TCO)",
                      "Establish a future-ready HR operating model"
                    ].map((obj, i) => (
                      <li key={i} className="flex gap-4 items-start">
                        <div className="w-6 h-6 bg-blue-50 text-blue-600 rounded-md flex items-center justify-center shrink-0 mt-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <p className="text-slate-700 font-bold text-lg leading-tight">{obj}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-50 p-10 rounded-2xl border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Current State Indicators
                  </h3>
                  <div className="space-y-6">
                    {[
                      { label: "Complexity", val: "Enterprise / Multi-Entity" },
                      { label: "Maturity Level", val: "Foundational / Transitional" },
                      { label: "Integration Needs", val: "High (ERP/Financials/CRM)" },
                      { label: "Change Intensity", val: "High Impact" }
                    ].map((item, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-slate-200 pb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">{item.label}</span>
                        <span className="text-sm font-bold text-slate-900">{item.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 3. ENGAGEMENT MODEL */}
            <section id="model" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">3. Engagement Model</h2>
                <Layers className="w-8 h-8 text-slate-300" />
              </div>

              <div className="relative">
                <div className="absolute top-[30px] left-0 right-0 h-0.5 bg-slate-100 hidden md:block"></div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  {[
                    { title: "Assess", icon: Search, color: "blue" },
                    { title: "Advise", icon: Settings, color: "slate" },
                    { title: "Implement", icon: ShieldCheck, color: "indigo" },
                    { title: "Optimize", icon: TrendingUp, color: "emerald" }
                  ].map((p, i) => (
                    <div key={i} className="relative bg-white text-center">
                      <div className={`w-[60px] h-[60px] mx-auto rounded-xl border-2 border-slate-900 bg-white flex items-center justify-center mb-6 relative z-10 transition-transform hover:scale-110`}>
                        <p.icon className="w-6 h-6 text-slate-900" />
                      </div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{p.title}</h4>
                      <p className="text-xs text-slate-500 font-bold leading-relaxed px-4">Phase {i + 1} Delivery Cycle</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 text-white p-12 rounded-2xl flex items-center gap-12 mt-12">
                <Activity className="w-16 h-16 text-blue-400 shrink-0" />
                <div>
                  <h4 className="text-xl font-bold mb-4">Outcome-Based Governance</h4>
                  <p className="text-slate-400 font-medium leading-relaxed">
                    Every phase is tied to platform-verified milestones. Progression is governed by the HR-Tek Analysis Engine, ensuring quality assurance at every transition point.
                  </p>
                </div>
              </div>
            </section>

            {/* 4. PHASE 1 - ASSESSMENT */}
            <section id="phase1" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-blue-600/20">01</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">Phase 1: Digital HR Assessment</h2>
                </div>
              </div>

              <div className="grid grid-cols-12 gap-12">
                <div className="col-span-12 lg:col-span-7 space-y-8">
                  <p className="text-lg text-slate-600 font-medium leading-relaxed">
                    Diagnostic phase involving role-based access to HR-Tek’s 8-dimensional assessment engine. We benchmarking your current state against industry leaders.
                  </p>

                  <div className="space-y-4">
                    {[
                      "HR Process Maturity Scoring",
                      "Technology & Automation Gap Analysis",
                      "Organization Complexity Mapping",
                      "Compliance, Risk & Security Audit"
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                        <div className="w-2 h-2 bg-blue-600 rounded-full" />
                        <span className="text-sm font-bold text-slate-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="col-span-12 lg:col-span-5 bg-white border border-slate-200 p-8 rounded-2xl shadow-lg">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 border-b pb-4">Phase Deliverables</h4>
                  <ul className="space-y-4">
                    {["Maturity Scorecard", "Tech Gap Inventory", "Risk Heat Map"].map((d, i) => (
                      <li key={i} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                          <FileText className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>

            {/* 5. PHASE 2 - ADVISORY */}
            <section id="phase2" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-slate-200">02</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">Phase 2: Strategy & Solution Design</h2>
                </div>
              </div>

              <div className="bg-slate-50 p-12 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-200/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>

                <h3 className="text-2xl font-bold text-slate-900 mb-8">Comprehensive Digital Roadmap</h3>
                <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Tool Selection</h4>
                    <p className="text-sm text-slate-600 font-bold leading-relaxed">Data-driven vendor comparison and solution fitment analysis to identify the best-fit HCM/SaaS stack for your unique scale.</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">Process Blueprinting</h4>
                    <p className="text-sm text-slate-600 font-bold leading-relaxed">Re-engineering core workflows to eliminate manual touchpoints and standardize global policy enforcement.</p>
                  </div>
                </div>

                <div className="mt-12 pt-12 border-t border-slate-200 grid grid-cols-3 gap-8">
                  {[
                    { label: "Arch Blueprint", icon: Monitor },
                    { label: "ROI Model", icon: DollarSign },
                    { label: "Change Plan", icon: Users }
                  ].map((x, i) => (
                    <div key={i} className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-white shadow-md rounded-lg flex items-center justify-center text-slate-400 mb-3">
                        <x.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{x.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. PHASE 3 - IMPLEMENT */}
            <section id="phase4" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-indigo-600/20">03</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">Phase 3: Implementation & Configuration</h2>
                </div>
              </div>

              <div className="space-y-12">
                <p className="text-lg text-slate-600 font-medium">
                  End-to-end technical execution of the selected HR stack. We manage the migration of legacy data and integration with your broader functional ecosystem (Finance, IT, Payroll).
                </p>

                <div className="grid grid-cols-3 gap-6">
                  {[
                    { title: "Core HCM", icon: Building2 },
                    { title: "Talent & LMS", icon: Layouts },
                    { title: "Payroll & Ops", icon: ShieldCheck }
                  ].map((m, i) => (
                    <div key={i} className="p-8 border-2 border-slate-100 rounded-2xl hover:border-indigo-500 transition-colors group">
                      <m.icon className="w-8 h-8 text-slate-300 group-hover:text-indigo-600 mb-6" />
                      <h4 className="text-xl font-bold mb-2">{m.title}</h4>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-none">Modules & Integrations</p>
                    </div>
                  ))}
                </div>

                <div className="bg-[#FAFBFD] p-10 rounded-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-bold text-slate-900">Execution Timeline</h3>
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estimated: 12-16 Weeks</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[
                      { l: "Kickoff", w: 10 },
                      { l: "Validation", w: 15 },
                      { l: "Config", w: 40 },
                      { l: "Testing", w: 20 },
                      { l: "Live", w: 15 }
                    ].map((step, i) => (
                      <div key={i} style={{ width: `${step.w}%` }} className="group">
                        <div className={`h-8 border-r border-white flex items-center justify-center text-[10px] font-black text-white ${i % 2 === 0 ? 'bg-indigo-600' : 'bg-indigo-400'}`}>
                          {step.w}%
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase mt-2 text-center">{step.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* 7. PHASE 4 - ADOPTION */}
            <section id="change-mgmt" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-slate-200">04</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">Phase 4: Change Management</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                  <p className="text-lg text-slate-600 font-medium">
                    High adoption is critical to ROI. We deploy a change network within your organization to foster digital readiness and ensure users are fully enabled.
                  </p>
                  <div className="space-y-4">
                    {[
                      "Role-based User Training Series",
                      "Change Champion Workshops",
                      "Stakeholder Impact Dashboards",
                      "SOP & Digital Training Asset Creation"
                    ].map((l, i) => (
                      <div key={i} className="flex gap-4">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="font-bold text-slate-700">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                  <Users className="w-16 h-16 text-slate-900 mb-6" />
                  <h4 className="text-xl font-bold mb-2 underline decoration-4 underline-offset-4 decoration-blue-600/20">The Human Interface</h4>
                  <p className="text-slate-500 font-bold text-sm leading-relaxed">
                    Measuring cultural adoption metrics alongside system logs to identify resistance points early and mitigate delivery risks.
                  </p>
                </div>
              </div>
            </section>

            {/* 8. PHASE 5 - OPTIMIZE */}
            <section id="support" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div className="flex items-baseline gap-3">
                  <span className="text-5xl font-black text-emerald-600/10">05</span>
                  <h2 className="text-2xl font-extrabold text-slate-900 uppercase tracking-tight">Phase 5: Post Go-Live Optimization</h2>
                </div>
              </div>

              <div className="bg-white border-2 border-slate-900 p-12 rounded-2xl shadow-xl">
                <div className="flex items-center gap-6 mb-10">
                  <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                    <TrendingUp className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Continuous Support & Growth</h3>
                    <p className="text-slate-500 font-bold">Maintaining technical health and strategic relevance.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-12">
                  {[
                    { t: "Hypercare", d: "Intensive 30-60 day post-launch support" },
                    { t: "Quarterly ROI", d: "Ongoing value realization audits" },
                    { t: "Feature Upgrades", d: "Regular rollout of platform updates" }
                  ].map((row, i) => (
                    <div key={i} className="space-y-4">
                      <h4 className="text-sm font-black uppercase text-blue-600 tracking-tighter">{row.t}</h4>
                      <p className="text-sm text-slate-600 font-bold leading-relaxed">{row.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 9. GOVERNANCE */}
            <section id="governance" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">9. Project Governance</h2>
                <Activity className="w-8 h-8 text-slate-300" />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-[#FAFBFD] border-y border-slate-200">
                    <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      <th className="p-6">Meeting / Forum</th>
                      <th className="p-6">Stakeholders</th>
                      <th className="p-6">Frequency</th>
                      <th className="p-6">Objective</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm font-bold">
                    {[
                      { meeting: "Steering Committee", who: "CXO Sponsors", freq: "Monthly", why: "Strategic direction" },
                      { meeting: "Project Review", who: "PMO / Leads", freq: "Weekly", why: "Milestone tracking" },
                      { meeting: "Daily Stand-ups", who: "Task Leads", freq: "Daily", why: "Operational sync" }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="p-6 text-slate-900">{row.meeting}</td>
                        <td className="p-6 text-slate-600">{row.who}</td>
                        <td className="p-6 text-slate-600">{row.freq}</td>
                        <td className="p-6 text-slate-600 italic">{row.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* 10. COMMERCIALS */}
            <section id="commercials" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">10. Investment Framework</h2>
                <DollarSign className="w-8 h-8 text-slate-300" />
              </div>

              <div className="bg-[#FAFBFD] border border-slate-200 rounded-3xl p-12 text-center">
                <h4 className="text-xs font-black uppercase text-blue-600 tracking-widest mb-4">Pricing Engine Generated</h4>
                <p className="text-xl text-slate-500 font-bold max-w-2xl mx-auto mb-12">
                  Investment values are auto-calculated based on organization complexity, headcount, and selected technical modules.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  {[
                    { l: "Setup Fee", v: "Milestone Based" },
                    { l: "Advisory", v: "Fixed-Fee" },
                    { l: "Licensing", v: "Headcount Based" },
                    { l: "Support", v: "Annual Retainer" }
                  ].map((p, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{p.l}</p>
                      <p className="text-sm font-black text-slate-900">{p.v}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-12">
                  <Link to="/pricing" className="text-sm font-bold text-slate-900 flex items-center justify-center gap-2 hover:underline">
                    View Itemized Commercial Summary <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>

            {/* 11-14. LEGAL */}
            <section id="legal" className="scroll-mt-32 space-y-12">
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">11. Legal & Confidentiality</h2>
                <Lock className="w-8 h-8 text-slate-300" />
              </div>

              <div className="prose prose-slate prose-sm max-w-none text-slate-500 leading-relaxed font-medium">
                <p>
                  This proposal and all related strategic documentation are confidential and intended solely for the internal review of {clientName} and its authorized stakeholders.
                </p>
                <p>
                  All proprietary assessment methodologies, scoring logic, and advisory frameworks utilized in this proposal are the intellectual property of HR-Tek System.
                </p>
                <div className="bg-slate-50 p-6 rounded-xl text-[11px] font-bold uppercase tracking-wider text-slate-400 border border-slate-100 flex items-center justify-between">
                  <span>Project Identifier: {assessmentId}</span>
                  <span>Audit Log: Verified Terminal Sync</span>
                </div>
              </div>
            </section>

            {/* APPENDIX D */}
            <section id="appendix-d" className="scroll-mt-32 space-y-12 pb-20">
              <div className="flex items-center justify-between pb-6 border-b-2 border-slate-900">
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Appendix D: System Mapping</h2>
                <BarChart3 className="w-8 h-8 text-slate-300" />
              </div>

              <div className="space-y-8">
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <h4 className="text-[11px] font-black uppercase text-blue-600 tracking-widest mb-6">Execution Logic Mapping</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-bold">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase">
                          <th className="pb-4">Proposal Node</th>
                          <th className="pb-4">System Engine</th>
                          <th className="pb-4">Data Output</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {[
                          { n: "Objectives", e: "Context Engine", d: "Org Profile" },
                          { n: "Phase 1: Assess", e: "Maturity Engine", d: "Benchmark Scape" },
                          { n: "Phase 2: Advise", e: "Advisory Engine", d: "Roadmap Model" },
                          { n: "Phase 3: Implement", e: "Implementation Engine", d: "WBS & Timelines" }
                        ].map((row, i) => (
                          <tr key={i}>
                            <td className="py-4 text-slate-900">{row.n}</td>
                            <td className="py-4 text-blue-600">{row.e}</td>
                            <td className="py-4 text-slate-500">{row.d}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>

            {/* Signature Block */}
            <section className="pt-24 border-t-2 border-slate-900 flex justify-between items-start gap-20">
              <div className="space-y-8 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Client Acceptance</p>
                <div className="space-y-4">
                  <p className="text-sm font-bold text-slate-500 italic">Digitally signed for {clientName}</p>
                  <div className="h-16 w-full bg-slate-50 border-b border-slate-300" />
                  <p className="text-xs font-black uppercase text-slate-900">Authorized Signatory Name & Designation</p>
                </div>
              </div>
              <div className="space-y-8 flex-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">HR-Tek System</p>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 grayscale brightness-0 opacity-60">
                    <Monitor className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-tight">HR-TEK SYSTEM</span>
                  </div>
                  <div className="h-16 w-full flex items-center">
                    <span className="font-serif text-2xl italic font-bold text-slate-400">System Verified Signature</span>
                  </div>
                  <p className="text-xs font-black uppercase text-slate-900">Engagement Lead: Transformation PMO</p>
                </div>
              </div>
            </section>

          </div>

          <footer className="text-center py-12 px-8 max-w-[900px] mx-auto text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] print:hidden">
            Proprietary Methodology © 2026 HR-Tek System Corporate. All Rights Reserved.
          </footer>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        
        body { font-family: 'Inter', sans-serif; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 20px; }

        @media print {
          body { background: white !important; }
          aside, header, footer { display: none !important; }
          main { margin: 0 !important; width: 100% !important; max-width: 100% !important; }
          .max-w-\[900px\] { max-width: 100% !important; border: none !important; box-shadow: none !important; margin: 0 !important; padding: 20px !important; }
          section { page-break-after: always; }
          h2 { border-bottom-color: black !important; }
        }
      `}</style>
    </div>
  );
}

function Layouts(props: any) {
  return <Layout {...props} />;
}
function HeartIcon(props: any) {
  return <Heart {...props} />;
}
