import { useState, useEffect, useRef } from "react";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  FileText, Target, Layers, Search, Settings, ShieldCheck, Users, TrendingUp,
  Activity, BarChart3, DollarSign, Download, CheckCircle2, Lock, ArrowRight,
  Monitor, Printer, AlertTriangle, XCircle, Zap, ChevronRight, Award,
  Info, Clock, CalendarDays,
} from "lucide-react";
import { requireUserSession } from "~/lib/session.server";
import { getUserProfile } from "~/models/user.model.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { getCompanyAdvisories } from "~/models/hti.model.server";
import type { HTIAdvisoryReport } from "~/models/hti.model.server";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await requireUserSession(request);
  const user = await getUserProfile(session.userId);
  if (!user || !user.organisationId) {
    throw new Response("User or Company not found", { status: 404 });
  }
  const [company, reports] = await Promise.all([
    getCompanyProfile(user.organisationId),
    getCompanyAdvisories(user.organisationId),
  ]);

  const approvedReport = reports?.find((r: HTIAdvisoryReport) => r.status === "approved" && r.isLocked);
  const latestReport = approvedReport ??
    (reports && reports.length > 0
      ? reports.sort((a: HTIAdvisoryReport, b: HTIAdvisoryReport) =>
          new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())[0]
      : null);

  const baseDate = latestReport ? new Date(latestReport.generatedAt) : new Date();
  const validUntil = new Date(baseDate);
  validUntil.setDate(validUntil.getDate() + 90);

  return json({
    company,
    user,
    latestReport,
    generatedAt: baseDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
    validUntil: validUntil.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }),
  });
}

const NAV_SECTIONS = [
  { id: "cover",       title: "Cover",                 icon: Monitor },
  { id: "exec",        title: "1. Executive Summary",  icon: FileText },
  { id: "readiness",   title: "2. Readiness",          icon: Activity },
  { id: "objectives",  title: "3. Objectives",         icon: Target },
  { id: "priorities",  title: "4. Priority Matrix",    icon: BarChart3 },
  { id: "reco",        title: "5. Recommendations",    icon: Zap },
  { id: "risks",       title: "6. Risk & Mitigation",  icon: AlertTriangle },
  { id: "avoid",       title: "7. What to Avoid",      icon: XCircle },
  { id: "metrics",     title: "8. Success Metrics",    icon: Award },
  { id: "phases",      title: "9. Engagement Phases",  icon: Layers },
  { id: "governance",  title: "10. Governance",        icon: ShieldCheck },
  { id: "commercials", title: "11. Commercials",       icon: DollarSign },
  { id: "client-resp", title: "12. Client Resp.",      icon: Users },
  { id: "hrtek-resp",  title: "13. HRTek Resp.",       icon: CheckCircle2 },
  { id: "assumptions", title: "14. Assumptions",       icon: Info },
  { id: "legal",       title: "15. Legal",             icon: Lock },
  { id: "next-steps",  title: "16. Next Steps",        icon: ArrowRight },
  { id: "appendix",    title: "Appendix D",            icon: FileText },
];

// ── Components ─────────────────────────────────────────────────────────────

function ScoreRing({ score, color, label, sub }: { score: number; color: string; label: string; sub: string }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative w-28 h-28">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#f1f5f9" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-900">{score}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">/100</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-black text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-400 font-semibold">{sub}</p>
      </div>
    </div>
  );
}

function HeatBar({ engine, score, status }: { engine: string; score: number; status: string }) {
  const color = status === "strong" ? "#10b981" : status === "moderate" ? "#f59e0b" : "#ef4444";
  const bg = status === "strong" ? "bg-emerald-50 border-emerald-100" : status === "moderate" ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100";
  const badge = status === "strong" ? "bg-emerald-100 text-emerald-700" : status === "moderate" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700";
  const implication = status === "strong"
    ? "This area shows solid capability. Leverage as a foundation for broader transformation."
    : status === "moderate"
    ? "Functional but with notable gaps. Targeted improvement is recommended before scaling."
    : "Critical gap identified. Address this before proceeding with dependent initiatives.";
  return (
    <div className={`p-5 rounded-xl border ${bg} space-y-3`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-slate-800">{engine}</p>
        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${badge}`}>{status} · {score}/100</span>
      </div>
      <div className="h-2.5 bg-white rounded-full overflow-hidden border border-slate-100">
        <div style={{ width: `${score}%`, backgroundColor: color }} className="h-full rounded-full transition-all duration-700" />
      </div>
      <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{implication}</p>
    </div>
  );
}

function SectionHeader({ num, title, icon: Icon, intro }: { num: string; title: string; icon: any; intro?: string }) {
  return (
    <div className="mb-12 space-y-4">
      <div className="flex items-end justify-between pb-5 border-b-2 border-slate-900">
        <div className="flex items-baseline gap-4">
          <span className="text-6xl font-black text-slate-100 leading-none select-none">{num}</span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{title}</h2>
        </div>
        <Icon className="w-8 h-8 text-slate-300 shrink-0" />
      </div>
      {intro && (
        <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-2xl">{intro}</p>
      )}
    </div>
  );
}

function Callout({ icon: Icon = Info, color = "blue", title, children }: { icon?: any; color?: string; title: string; children: React.ReactNode }) {
  const styles: Record<string, string> = {
    blue:   "bg-blue-50 border-blue-200 text-blue-900",
    amber:  "bg-amber-50 border-amber-200 text-amber-900",
    green:  "bg-emerald-50 border-emerald-200 text-emerald-900",
    red:    "bg-red-50 border-red-200 text-red-900",
    slate:  "bg-slate-50 border-slate-200 text-slate-800",
  };
  const iconColors: Record<string, string> = {
    blue: "text-blue-500", amber: "text-amber-500", green: "text-emerald-500", red: "text-red-500", slate: "text-slate-500",
  };
  return (
    <div className={`flex gap-4 p-6 rounded-2xl border ${styles[color]}`}>
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconColors[color]}`} />
      <div>
        <p className="font-black text-sm uppercase tracking-wider mb-1.5">{title}</p>
        <div className="text-sm font-medium leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl p-6">
      <Activity className="w-5 h-5 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-100 my-10" />;
}

// ── Score interpretation helpers ───────────────────────────────────────────
function interpretReadiness(score: number): { verdict: string; detail: string } {
  if (score >= 80) return { verdict: "High Readiness", detail: "The organization is well-positioned to begin full-scale transformation. Leadership alignment, technical infrastructure, and process maturity are at levels that support ambitious change programs." };
  if (score >= 65) return { verdict: "Conditional Readiness", detail: "The organization has the foundational elements in place but requires targeted preparation in specific areas before committing to large-scale implementation. A phased approach is strongly recommended." };
  if (score >= 50) return { verdict: "Moderate Readiness", detail: "Significant groundwork is required. Key capability gaps must be addressed in parallel with early transformation activities to avoid implementation failure." };
  return { verdict: "Low Readiness", detail: "The organization is not yet ready for comprehensive transformation. A 6–12 month readiness-building program must precede technology implementation to avoid costly failures." };
}

function interpretRisk(score: number): { verdict: string; detail: string } {
  if (score >= 70) return { verdict: "High Risk Exposure", detail: "Multiple critical risk factors are present. Without active mitigation, the probability of cost overruns, adoption failures, or project delays is significant. Risk management must be a first-class workstream." };
  if (score >= 45) return { verdict: "Moderate Risk", detail: "Risks are manageable but require dedicated attention. The mitigation strategies outlined in this proposal directly address the identified exposure points and should be integrated into the project governance framework." };
  return { verdict: "Low Risk", detail: "The organization's transformation profile carries minimal risk. Standard project governance and change management practices are sufficient." };
}

function interpretConfidence(score: number): { verdict: string; detail: string } {
  if (score >= 85) return { verdict: "High Confidence", detail: "Assessment data is comprehensive and cross-validated across all five engines. The advisory recommendations carry strong evidentiary support and can be acted upon with confidence." };
  if (score >= 65) return { verdict: "Moderate Confidence", detail: "Assessment data is substantially complete. Some areas have partial data; recommendations are directionally accurate but may benefit from additional validation in specific domains." };
  return { verdict: "Limited Confidence", detail: "Assessment data is incomplete. Recommendations should be treated as directional guidance and validated through deeper discovery workshops before committing resources." };
}

export default function ProposalTransformationCorporate() {
  const { company, latestReport, generatedAt, validUntil } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState("cover");
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  const clientName = company?.company_name || company?.brand_name || "Valued Client";
  const industry   = (company as any)?.industry || null;
  const empCount   = (company as any)?.employee_count || null;
  const reportId   = latestReport?.reportId || null;
  const shortId    = reportId?.split("_")[1]?.slice(0, 8)?.toUpperCase() ?? null;
  const refId      = shortId ? `HTI-${shortId}` : null;
  const advisory   = latestReport?.advisory;

  const readinessScore = advisory?.transformationReadinessScore ?? null;
  const riskScore      = advisory?.riskExposureIndex ?? null;
  const confidence     = advisory?.confidenceScore ?? null;
  const heatmap        = advisory?.capabilityHeatmap ?? [];
  const priorities     = advisory?.priorityMatrix ?? [];
  const riskFlags      = advisory?.riskFlags ?? [];
  const avoidNow       = (advisory?.doNotTransformNow ?? []) as any[];
  const avoidStrings   = (advisory?.avoidNow ?? []) as string[];
  const metrics        = advisory?.successMetrics ?? [];
  const recoNow        = advisory?.recommendations?.now ?? [];
  const recoNext       = advisory?.recommendations?.next ?? [];
  const recoLater      = advisory?.recommendations?.later ?? [];
  const keyGaps        = advisory?.currentState?.keyGaps ?? [];
  const strengths      = advisory?.currentState?.strengths ?? [];
  const dependencies   = advisory?.dependencies ?? [];

  const readinessInterp = readinessScore != null ? interpretReadiness(readinessScore) : null;
  const riskInterp      = riskScore != null ? interpretRisk(riskScore) : null;
  const confidenceInterp = confidence != null ? interpretConfidence(confidence) : null;

  const handlePrint = () => window.print();

  const downloadPDF = async () => {
    setIsExporting(true);
    const element = reportRef.current;
    if (!element) { setIsExporting(false); return; }
    setTimeout(async () => {
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false, backgroundColor: "#ffffff", windowWidth: 1200 });
        const imgWidth = 210; const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        const pdf = new jsPDF("p", "mm", "a4");
        let position = 0;
        pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(canvas.toDataURL("image/jpeg", 1.0), "JPEG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`HRTek_Proposal_${clientName.replace(/\s+/g, "_")}.pdf`);
      } catch (err) {
        console.error("PDF export failed", err);
      } finally { setIsExporting(false); }
    }, 400);
  };

  const scrollTo = (id: string) => {
    setActiveTab(id);
    const el = document.getElementById(id);
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
  };

  useEffect(() => {
    const onScroll = () => {
      const sp = window.scrollY + 220;
      for (const s of NAV_SECTIONS) {
        const el = document.getElementById(s.id);
        if (el && sp >= el.offsetTop && sp < el.offsetTop + el.offsetHeight) { setActiveTab(s.id); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans text-slate-900">

      {/* ── Header ── */}
      <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-50 flex items-center justify-between px-8 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <Link to="/dashboard">
            <img src="/hrtek_logo.png" alt="HRTek" className="h-8 w-auto" />
          </Link>
          <div className="h-5 w-px bg-slate-200" />
          <p className="text-sm font-semibold text-slate-500">
            Transformation Proposal — <span className="text-slate-900 font-bold">{clientName}</span>
            {refId && <span className="ml-2 text-xs font-bold text-slate-400">#{refId}</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
          <button onClick={downloadPDF} disabled={isExporting} className="flex items-center gap-2 px-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50">
            {isExporting ? <Activity className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </button>
          <Link to="/hti" className="px-5 py-2 bg-[#023e8a] text-white rounded-lg text-sm font-bold hover:bg-[#022e6a] transition-colors">
            ← Back to Report
          </Link>
        </div>
      </header>

      <div className="flex flex-1">
        {/* ── Sidebar ── */}
        <nav className="w-64 bg-white border-r border-slate-100 h-[calc(100vh-64px)] overflow-y-auto sticky top-16 hidden xl:flex flex-col p-5 print:hidden">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4 px-2">Table of Contents</p>
          <div className="space-y-0.5 flex-1">
            {NAV_SECTIONS.map((s) => (
              <button key={s.id} onClick={() => scrollTo(s.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all text-left ${
                  activeTab === s.id ? "bg-[#023e8a] text-white" : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                }`}>
                <s.icon className="w-3.5 h-3.5 shrink-0" />
                {s.title}
              </button>
            ))}
          </div>
          {latestReport && (
            <div className="mt-4 p-4 bg-slate-900 rounded-2xl space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Report Status</p>
              <p className={`text-sm font-black capitalize ${latestReport.status === "approved" ? "text-emerald-400" : "text-amber-400"}`}>
                {latestReport.status}
              </p>
              <p className="text-[9px] text-slate-500 font-semibold">Generated {generatedAt}</p>
            </div>
          )}
        </nav>

        {/* ── Document ── */}
        <main className="flex-1 overflow-x-hidden py-10 px-4">
          <div ref={reportRef} className="max-w-[900px] mx-auto bg-white border border-slate-200 shadow-xl print:shadow-none print:border-none" style={{ padding: "72px 80px" }}>

            {/* ═══════ COVER ═══════ */}
            <section id="cover" className="min-h-[900px] flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-20">
                  <img src="/hrtek_logo.png" alt="HRTek" className="h-10 w-auto opacity-90" />
                  <div className="h-6 w-px bg-slate-200" />
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">HR-TEK SYSTEM</span>
                </div>

                <div className="space-y-6 mb-14">
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">Confidential · HR Transformation Proposal</span>
                  </div>
                  <h1 className="text-[58px] font-black text-slate-900 leading-[1.02] tracking-tight">
                    End-to-End<br />HR Digital<br />
                    <span className="text-[#023e8a]">Transformation</span>
                  </h1>
                  <p className="text-lg text-slate-500 font-medium max-w-xl leading-relaxed">
                    A comprehensive, data-driven engagement proposal for <strong className="text-slate-700">{clientName}</strong> — built entirely on your organization's verified assessment results across five HR intelligence engines.
                  </p>
                </div>

                {/* About this document */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-7 mb-8">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">About This Proposal</p>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    This document represents HR-Tek System's formal transformation engagement proposal for {clientName}. Unlike conventional consulting proposals, every strategic recommendation, risk assessment, priority initiative, and success metric contained herein is derived directly from your organization's actual assessment data — not industry templates or generic benchmarks. The proposal is structured to serve as both a strategic roadmap and an operational guide for your HR transformation journey.
                  </p>
                </div>

                {/* Score strip */}
                {(readinessScore != null || riskScore != null || confidence != null) && (
                  <div className="grid grid-cols-3 gap-4 mb-10">
                    {readinessScore != null && (
                      <div className="text-center bg-white border border-slate-200 rounded-xl py-5 px-4">
                        <div className="text-3xl font-black text-[#023e8a]">{readinessScore}<span className="text-lg text-slate-400">/100</span></div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Readiness Score</div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{interpretReadiness(readinessScore).verdict}</div>
                      </div>
                    )}
                    {riskScore != null && (
                      <div className="text-center bg-white border border-slate-200 rounded-xl py-5 px-4">
                        <div className={`text-3xl font-black ${riskScore >= 60 ? "text-red-600" : riskScore >= 40 ? "text-amber-600" : "text-emerald-600"}`}>{riskScore}<span className="text-lg text-slate-400">/100</span></div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Risk Exposure</div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{interpretRisk(riskScore).verdict}</div>
                      </div>
                    )}
                    {confidence != null && (
                      <div className="text-center bg-white border border-slate-200 rounded-xl py-5 px-4">
                        <div className="text-3xl font-black text-indigo-600">{confidence}<span className="text-lg text-slate-400">%</span></div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Advisory Confidence</div>
                        <div className="text-[11px] text-slate-500 font-semibold mt-0.5">{interpretConfidence(confidence).verdict}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-16 gap-y-8 border-t border-slate-200 pt-10">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Prepared For</p>
                  <p className="text-2xl font-black text-slate-900">{clientName}</p>
                  {industry && <p className="text-sm text-slate-500 font-semibold mt-0.5">{industry}</p>}
                  {empCount && <p className="text-xs text-slate-400 font-semibold">{empCount.toLocaleString()} employees</p>}
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Reference ID</p>
                  <p className="text-2xl font-black text-slate-900 font-mono">{refId ?? "—"}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">Platform-verified report identifier</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Issue Date</p>
                  <p className="text-base font-bold text-slate-900">{generatedAt}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Proposal Valid Until</p>
                  <p className="text-base font-bold text-slate-900">{validUntil}</p>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">90 days from assessment date</p>
                </div>
              </div>
            </section>

            {/* ═══════ 1. EXECUTIVE SUMMARY ═══════ */}
            <section id="exec" className="scroll-mt-24 mt-24">
              <SectionHeader num="01" title="Executive Summary" icon={FileText}
                intro={`This section distills the key findings from HR-Tek System's cross-engine intelligence analysis of ${clientName}. It represents a synthesized, AI-verified view of your organization's HR transformation readiness, major capability gaps, and the strategic mandate for action.`}
              />

              {advisory?.executiveSummary ? (
                <div className="proposal-content text-slate-700 leading-relaxed text-[15px]"
                  dangerouslySetInnerHTML={{ __html: advisory.executiveSummary }} />
              ) : (
                <EmptyState text="Executive summary will appear once the HTI advisory report has been generated and approved." />
              )}

              <Divider />

              {/* How to read this proposal */}
              <Callout icon={Info} color="blue" title="How to Read This Proposal">
                This proposal is organized in order of strategic priority. Section 2 establishes baseline readiness. Sections 3–5 define what needs to change and in what order. Sections 6–7 identify risks and areas to avoid. Section 8 defines how success will be measured. Sections 9–12 cover execution structure, governance, and commercial terms.
              </Callout>
            </section>

            {/* ═══════ 2. READINESS SCORES ═══════ */}
            <section id="readiness" className="scroll-mt-24 mt-24">
              <SectionHeader num="02" title="Transformation Readiness Assessment" icon={Activity}
                intro={`The three composite scores below are calculated by HR-Tek's AI engine from your organization's responses across all five assessment modules. Together, they provide an objective baseline for understanding ${clientName}'s transformation starting position.`}
              />

              {(readinessScore != null || riskScore != null || confidence != null) ? (
                <>
                  {/* Score rings */}
                  <div className="flex items-center justify-around py-10 bg-slate-50 rounded-3xl border border-slate-100 mb-10">
                    {readinessScore != null && <ScoreRing score={readinessScore} color={readinessScore >= 75 ? "#10b981" : readinessScore >= 50 ? "#f59e0b" : "#ef4444"} label="Readiness Score" sub={readinessInterp!.verdict} />}
                    {riskScore != null && <ScoreRing score={riskScore} color={riskScore >= 60 ? "#ef4444" : riskScore >= 40 ? "#f59e0b" : "#10b981"} label="Risk Exposure" sub={riskInterp!.verdict} />}
                    {confidence != null && <ScoreRing score={confidence} color="#6366f1" label="Confidence Score" sub={confidenceInterp!.verdict} />}
                  </div>

                  {/* Interpretation grid */}
                  <div className="space-y-5 mb-10">
                    {readinessInterp && (
                      <div className="grid grid-cols-[auto,1fr] gap-6 p-6 border border-slate-200 rounded-2xl bg-white">
                        <div className="text-center">
                          <div className={`text-4xl font-black ${readinessScore! >= 75 ? "text-emerald-600" : readinessScore! >= 50 ? "text-amber-600" : "text-red-600"}`}>{readinessScore}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Readiness</div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 mb-1.5">{readinessInterp.verdict}</p>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{readinessInterp.detail}</p>
                        </div>
                      </div>
                    )}
                    {riskInterp && (
                      <div className="grid grid-cols-[auto,1fr] gap-6 p-6 border border-slate-200 rounded-2xl bg-white">
                        <div className="text-center">
                          <div className={`text-4xl font-black ${riskScore! >= 60 ? "text-red-600" : riskScore! >= 40 ? "text-amber-600" : "text-emerald-600"}`}>{riskScore}</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Risk</div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 mb-1.5">{riskInterp.verdict}</p>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{riskInterp.detail}</p>
                        </div>
                      </div>
                    )}
                    {confidenceInterp && (
                      <div className="grid grid-cols-[auto,1fr] gap-6 p-6 border border-slate-200 rounded-2xl bg-white">
                        <div className="text-center">
                          <div className="text-4xl font-black text-indigo-600">{confidence}%</div>
                          <div className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">Confidence</div>
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 mb-1.5">{confidenceInterp.verdict}</p>
                          <p className="text-sm text-slate-500 font-medium leading-relaxed">{confidenceInterp.detail}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Capability heatmap */}
                  {heatmap.length > 0 && (
                    <>
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Capability Heatmap — Engine-by-Engine Breakdown</h3>
                      <p className="text-sm text-slate-400 font-medium mb-5 leading-relaxed">
                        Each bar represents the AI-assessed capability score for one of {clientName}'s five HR assessment engines. Scores above 70 indicate capability strengths; scores below 40 indicate areas requiring immediate attention before transformation can safely proceed.
                      </p>
                      <div className="space-y-3 mb-10">
                        {heatmap.map((h: any, i: number) => (
                          <HeatBar key={i} engine={h.engine} score={h.score} status={h.status} />
                        ))}
                      </div>
                    </>
                  )}

                  {/* Current state cards */}
                  {(advisory?.currentState?.maturityLevel || advisory?.currentState?.digitalReadiness) && (
                    <>
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Current State Summary</h3>
                      <div className="grid grid-cols-2 gap-5 mb-10">
                        {advisory.currentState.maturityLevel && (
                          <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Maturity Level</p>
                            <p className="text-xl font-black text-slate-900 mb-2">{advisory.currentState.maturityLevel}</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Maturity level reflects the organization's overall HR operational sophistication, measured across process standardization, technology adoption, and governance structures.</p>
                          </div>
                        )}
                        {advisory.currentState.digitalReadiness && (
                          <div className="bg-white border border-slate-200 rounded-2xl p-6">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Digital Readiness</p>
                            <p className="text-xl font-black text-slate-900 mb-2">{advisory.currentState.digitalReadiness}</p>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">Digital readiness captures the organization's preparedness to adopt and sustain new HR technology platforms, including infrastructure, data quality, and user capability.</p>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {/* Strengths */}
                  {strengths.length > 0 && (
                    <>
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Identified Organizational Strengths</h3>
                      <p className="text-sm text-slate-400 font-medium mb-4 leading-relaxed">
                        The following strengths were identified across your assessments. These represent genuine competitive advantages and should serve as the anchors of your transformation strategy — build upon them rather than disrupting them.
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        {strengths.map((s: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-emerald-900 font-semibold leading-snug">{s}</p>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <EmptyState text="Readiness scores are computed from your completed assessments. Generate and approve an HTI report to see your scores." />
              )}
            </section>

            {/* ═══════ 3. OBJECTIVES ═══════ */}
            <section id="objectives" className="scroll-mt-24 mt-24">
              <SectionHeader num="03" title="Client Objectives & Context" icon={Target}
                intro={`The strategic priorities below are not consultant-derived assumptions — they are extracted directly from ${clientName}'s assessment responses and cross-validated by the AI engine. They represent the most significant capability gaps that are limiting your HR function's effectiveness and strategic impact.`}
              />

              {keyGaps.length > 0 ? (
                <>
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Strategic Priority Areas — From Your Assessment Data</h3>
                  <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                    Each item below represents a validated gap in {clientName}'s current HR capability profile. These gaps were identified through AI analysis of your assessment responses and ranked by their potential impact on transformation outcomes. They form the strategic foundation for every recommendation in this proposal.
                  </p>
                  <div className="space-y-4 mb-10">
                    {keyGaps.map((gap: string, i: number) => (
                      <div key={i} className="flex items-start gap-5 p-6 border border-slate-100 rounded-xl hover:border-[#023e8a]/20 hover:bg-blue-50/20 transition-all">
                        <div className="w-9 h-9 bg-[#023e8a] text-white rounded-xl flex items-center justify-center text-xs font-black shrink-0">
                          {String(i + 1).padStart(2, "0")}
                        </div>
                        <div>
                          <p className="text-base text-slate-800 font-bold leading-snug">{gap}</p>
                          <p className="text-xs text-slate-400 font-medium mt-1.5">Priority gap · Derived from cross-engine assessment analysis</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Callout icon={Info} color="slate" title="Why These Priorities Matter">
                    Organizations that address their assessed capability gaps before technology implementation are 2.4× more likely to achieve projected ROI within the first 18 months. This proposal's engagement model is specifically designed to close these gaps in a sequenced, risk-managed manner.
                  </Callout>
                </>
              ) : (
                <EmptyState text="Strategic objectives derived from your assessment gaps will appear here once the report is generated." />
              )}
            </section>

            {/* ═══════ 4. PRIORITY MATRIX ═══════ */}
            <section id="priorities" className="scroll-mt-24 mt-24">
              <SectionHeader num="04" title="Transformation Priority Matrix" icon={BarChart3}
                intro={`The priority matrix below maps every transformation initiative identified for ${clientName} against two key dimensions: strategic impact (1–10) and implementation effort (1–10). Initiatives are grouped into three horizons — Act Now, Plan Next, and Future — allowing your leadership to sequence investments for maximum early value while building toward longer-term goals.`}
              />

              <Callout icon={Info} color="blue" title="How to Interpret This Matrix">
                <strong>Impact</strong> reflects the potential business value of the initiative (10 = transformational). <strong>Effort</strong> reflects the implementation complexity and resource requirement (10 = maximum difficulty). High-impact, lower-effort initiatives in the "Act Now" horizon should be prioritized for immediate resourcing.
              </Callout>

              {priorities.length > 0 ? (
                <div className="space-y-8 mt-8">
                  {(["now", "next", "later"] as const).map((tier) => {
                    const items = priorities.filter((p: any) => p.timeframe === tier);
                    if (items.length === 0) return null;
                    const config: Record<string, { label: string; desc: string; badgeClass: string; barClass: string; timeline: string }> = {
                      now:   { label: "Act Now",          desc: "These initiatives have the highest ROI relative to their implementation complexity. They should be resourced and initiated within the first 90 days of engagement.",                    badgeClass: "bg-[#023e8a] text-white",            barClass: "border-l-4 border-[#023e8a] bg-blue-50/50",      timeline: "0–3 months" },
                      next:  { label: "Plan Next",         desc: "These initiatives represent the second layer of transformation. They require foundational work from the 'Act Now' phase to be in place before they can succeed.",                       badgeClass: "bg-amber-500 text-white",            barClass: "border-l-4 border-amber-400 bg-amber-50/40",     timeline: "3–12 months" },
                      later: { label: "Future Horizon",    desc: "These are longer-term strategic investments that will drive sustained competitive advantage. They require organizational maturity built through the first two phases.",                    badgeClass: "bg-slate-400 text-white",            barClass: "border-l-4 border-slate-300 bg-slate-50/50",     timeline: "12+ months" },
                    };
                    const c = config[tier];
                    return (
                      <div key={tier} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${c.badgeClass}`}>{c.label}</span>
                            <span className="text-xs text-slate-400 font-semibold">{items.length} initiative{items.length > 1 ? "s" : ""}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
                            <Clock className="w-3.5 h-3.5" />
                            {c.timeline}
                          </div>
                        </div>
                        <p className="text-xs text-slate-400 font-medium leading-relaxed">{c.desc}</p>
                        <div className="space-y-2">
                          {items.map((p: any, i: number) => (
                            <div key={i} className={`flex items-center gap-4 px-6 py-5 rounded-xl ${c.barClass}`}>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800">{p.initiative}</p>
                                {p.category && <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{p.category}</p>}
                              </div>
                              <div className="flex items-center gap-6 shrink-0 text-center">
                                <div>
                                  <div className="text-xl font-black text-slate-900">{p.impact}</div>
                                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Impact</div>
                                </div>
                                <div className="h-8 w-px bg-slate-200" />
                                <div>
                                  <div className="text-xl font-black text-slate-900">{p.effort}</div>
                                  <div className="text-[9px] text-slate-400 font-black uppercase tracking-wider">Effort</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState text="The AI-generated priority matrix will display transformation initiatives ranked by impact, effort, and timeframe once the report is generated." />
              )}
            </section>

            {/* ═══════ 5. RECOMMENDATIONS ═══════ */}
            <section id="reco" className="scroll-mt-24 mt-24">
              <SectionHeader num="05" title="Strategic Recommendations" icon={Zap}
                intro={`The following recommendations are sequenced into three time horizons based on your assessed readiness and the logical dependency chain between initiatives. Each recommendation was generated by AI synthesis of all five assessment engines and validated against industry transformation benchmarks.`}
              />

              {(recoNow.length > 0 || recoNext.length > 0 || recoLater.length > 0) ? (
                <div className="space-y-12">
                  {[
                    {
                      items: recoNow,
                      label: "Immediate Actions",
                      horizon: "0 – 3 Months",
                      color: "bg-[#023e8a]",
                      bg: "bg-blue-50",
                      border: "border-blue-100",
                      context: `These actions address the most urgent gaps identified in ${clientName}'s assessment and are prerequisites for everything that follows. Delays here cascade into every subsequent phase. Leadership alignment and resource commitment must be confirmed before these are initiated.`,
                    },
                    {
                      items: recoNext,
                      label: "Short-term Implementation Plan",
                      horizon: "3 – 12 Months",
                      color: "bg-amber-500",
                      bg: "bg-amber-50",
                      border: "border-amber-100",
                      context: "These recommendations represent the core transformation program. They assume the immediate actions have been completed or are actively in progress. Each item requires dedicated project management and stakeholder engagement to succeed.",
                    },
                    {
                      items: recoLater,
                      label: "Long-term Strategic Vision",
                      horizon: "12+ Months",
                      color: "bg-slate-600",
                      bg: "bg-slate-50",
                      border: "border-slate-200",
                      context: "The long-term vision represents the target state — where the organization will be once foundational work is complete and transformation momentum is established. These initiatives drive competitive differentiation and sustained operational excellence.",
                    },
                  ].map(({ items, label, horizon, color, bg, border, context }) => items.length > 0 && (
                    <div key={label}>
                      <div className="flex items-center justify-between mb-3">
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${color}`}>
                          <span className="text-[10px] font-black text-white uppercase tracking-widest">{label}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                          <CalendarDays className="w-3.5 h-3.5" />
                          {horizon}
                        </div>
                      </div>
                      <p className="text-sm text-slate-400 font-medium leading-relaxed mb-5">{context}</p>
                      <div className={`${bg} ${border} border rounded-2xl divide-y divide-white`}>
                        {items.map((r: string, i: number) => (
                          <div key={i} className="flex items-start gap-4 px-6 py-5">
                            <div className={`w-6 h-6 ${color} rounded-md flex items-center justify-center shrink-0 mt-0.5`}>
                              <ChevronRight className="w-3.5 h-3.5 text-white" />
                            </div>
                            <p className="text-sm text-slate-700 font-semibold leading-relaxed">{r}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Tiered recommendations (Now / Next / Later) from your advisory report will appear here." />
              )}

              {/* Dependencies */}
              {dependencies.length > 0 && (
                <div className="mt-12 space-y-4">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Implementation Dependencies</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed mb-4">
                    The following dependencies govern the recommended sequencing. Attempting to execute dependent initiatives out of order is the most common cause of transformation failure. These dependencies are not arbitrary — they reflect genuine technical, organizational, and process prerequisites identified in your assessment.
                  </p>
                  <div className="space-y-2">
                    {dependencies.map((d: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-5 bg-indigo-50 border border-indigo-100 rounded-xl">
                        <ArrowRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <p className="text-sm text-indigo-800 font-semibold leading-relaxed">{d}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* ═══════ 6. RISKS ═══════ */}
            <section id="risks" className="scroll-mt-24 mt-24">
              <SectionHeader num="06" title="Risk Register & Mitigation Framework" icon={AlertTriangle}
                intro={`Every transformation engagement carries inherent risks. The risks below were identified through AI analysis of ${clientName}'s specific assessment data — not generic industry checklists. Each risk is paired with a concrete mitigation strategy that should be embedded into the project governance structure from day one.`}
              />

              <Callout icon={AlertTriangle} color="amber" title="Risk Management Principle">
                Identified risks are not reasons to delay transformation — they are inputs for smarter planning. Each risk below represents a known variable that can be managed through the mitigation strategies provided. Ignoring these risks, however, significantly increases the probability of cost overruns, adoption failures, and delayed ROI.
              </Callout>

              {riskFlags.length > 0 ? (
                <div className="space-y-5 mt-8">
                  {riskFlags.map((r: any, i: number) => (
                    <div key={i} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                      <div className="flex items-center gap-2 px-6 py-3 bg-slate-50 border-b border-slate-100">
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Risk Item {String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <div className="grid grid-cols-2 divide-x divide-slate-100">
                        <div className="p-6 space-y-2">
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Identified Risk</p>
                          <p className="text-sm font-bold text-slate-800 leading-relaxed">{r.risk}</p>
                        </div>
                        <div className="p-6 space-y-2">
                          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Mitigation Strategy</p>
                          <p className="text-sm font-semibold text-slate-600 leading-relaxed">{r.mitigation}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="Risk flags and mitigation strategies identified during your assessment will be listed here." />
              )}
            </section>

            {/* ═══════ 7. WHAT TO AVOID ═══════ */}
            <section id="avoid" className="scroll-mt-24 mt-24">
              <SectionHeader num="07" title="What Not to Transform — Yet" icon={XCircle}
                intro={`One of the most valuable outputs of the assessment process is identifying areas that should not be transformed in the current cycle. Premature action in these areas — before the necessary foundations are in place — is a leading cause of wasted investment and organizational fatigue.`}
              />

              <Callout icon={XCircle} color="red" title="Strategic Restraint as Competitive Advantage">
                Organizations that over-extend their transformation scope consistently underperform those that pursue focused, sequenced change. The areas identified below are not permanent exclusions — they represent initiatives that require prerequisite work before they can deliver positive ROI for {clientName}. Plan to revisit them in the appropriate horizon.
              </Callout>

              {(avoidNow.length > 0 || avoidStrings.length > 0) ? (
                <div className="space-y-4 mt-8">
                  {avoidNow.length > 0
                    ? avoidNow.map((a: any, i: number) => (
                        <div key={i} className="bg-red-50 border border-red-100 rounded-2xl p-6">
                          <div className="flex items-start gap-4">
                            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-black text-red-900 mb-1.5">
                                {typeof a === "string" ? a : a.area ?? a.initiative ?? ""}
                              </p>
                              {typeof a === "object" && a.reason && (
                                <p className="text-sm text-red-700 font-medium leading-relaxed">{a.reason}</p>
                              )}
                              {typeof a === "object" && a.category && (
                                <span className="mt-3 inline-block text-[9px] font-black uppercase tracking-widest px-2.5 py-1 bg-red-100 text-red-600 rounded-full">
                                  Category: {a.category}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    : avoidStrings.map((a: string, i: number) => (
                        <div key={i} className="flex items-start gap-4 p-5 bg-red-50 border border-red-100 rounded-xl">
                          <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                          <p className="text-sm font-semibold text-red-800">{a}</p>
                        </div>
                      ))
                  }
                </div>
              ) : (
                <EmptyState text="Areas to avoid for transformation based on your current maturity will be outlined here." />
              )}
            </section>

            {/* ═══════ 8. SUCCESS METRICS ═══════ */}
            <section id="metrics" className="scroll-mt-24 mt-24">
              <SectionHeader num="08" title="Success Metrics & KPIs" icon={Award}
                intro={`Transformation without measurement is change without accountability. The KPIs below define how ${clientName} and HR-Tek will jointly assess whether the transformation program is delivering its intended outcomes. Each metric includes a baseline, a target, and a timeframe — enabling objective progress tracking at every governance review.`}
              />

              <Callout icon={Award} color="green" title="Measurement Philosophy">
                HR-Tek's measurement framework tracks both leading indicators (early signals of change momentum) and lagging indicators (proof of sustained business impact). The metrics below are designed to be tracked within the HR-Tek platform dashboards, providing real-time visibility to all stakeholders.
              </Callout>

              {metrics.length > 0 ? (
                <div className="mt-8 space-y-3">
                  {metrics.map((m: string, i: number) => (
                    <div key={i} className="flex items-start gap-5 p-6 bg-white border border-slate-200 rounded-xl hover:border-[#023e8a]/30 hover:shadow-sm transition-all">
                      <div className="w-8 h-8 bg-[#023e8a]/10 text-[#023e8a] rounded-lg flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                        {i + 1}
                      </div>
                      <div>
                        <p className="text-sm text-slate-700 font-semibold leading-relaxed">{m}</p>
                        <p className="text-[10px] text-slate-400 font-medium mt-1.5">Tracked within HR-Tek System platform · Reviewed at monthly governance sessions</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState text="KPIs and success benchmarks generated from your assessment will appear here." />
              )}
            </section>

            {/* ═══════ 9. ENGAGEMENT PHASES ═══════ */}
            <section id="phases" className="scroll-mt-24 mt-24">
              <SectionHeader num="09" title="Engagement Model & Delivery Phases" icon={Layers}
                intro={`HR-Tek's engagement follows a structured four-phase delivery model: Assess → Advise → Implement → Optimize. This model ensures that every subsequent phase is built on validated outputs from the prior one, eliminating the rework and scope creep that characterize poorly sequenced transformation programs.`}
              />

              {/* Phase overview */}
              <div className="bg-slate-900 rounded-2xl p-8 mb-10">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Delivery Framework Overview</p>
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { n: "01", label: "Assess", icon: Search, color: "text-blue-400", desc: "Diagnostic & scoring" },
                    { n: "02", label: "Advise", icon: Settings, color: "text-indigo-400", desc: "Strategy & design" },
                    { n: "03", label: "Implement", icon: ShieldCheck, color: "text-violet-400", desc: "Build & configure" },
                    { n: "04", label: "Optimize", icon: TrendingUp, color: "text-emerald-400", desc: "Scale & sustain" },
                  ].map((p, i, arr) => (
                    <div key={p.n} className="relative flex flex-col items-center text-center gap-3">
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                        <p.icon className={`w-6 h-6 ${p.color}`} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Phase {p.n}</p>
                        <p className="text-base font-black text-white">{p.label}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{p.desc}</p>
                      </div>
                      {i < arr.length - 1 && (
                        <div className="absolute top-7 left-[calc(50%+28px)] right-0 h-px bg-white/10" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Detailed phase cards */}
              <div className="space-y-8">
                {[
                  {
                    num: "01", phase: "Phase 1: Digital HR Assessment",
                    duration: "4–6 Weeks",
                    color: "border-blue-400",
                    intro: "The assessment phase establishes the factual baseline for all subsequent decisions. Using HR-Tek's proprietary five-engine platform, the organization is evaluated across HR technology maturity, digital roadmap alignment, vendor fit, change management readiness, and shared services capability.",
                    items: [
                      "HR Process Maturity Scoring across all functional HR domains",
                      "Technology & Automation Gap Analysis against industry benchmarks",
                      "Organization Complexity Mapping — headcount, geography, entity structure",
                      "Change readiness profiling across all leadership and employee tiers",
                      "Compliance, Risk & Security Audit of existing HR systems",
                    ],
                    deliverables: [
                      { d: "Maturity Scorecard", detail: "Quantified scores for each HR domain" },
                      { d: "Technology Gap Inventory", detail: "Prioritized list of technology deficiencies" },
                      { d: "Risk Heat Map", detail: "Visual summary of risk concentration areas" },
                    ],
                  },
                  {
                    num: "02", phase: "Phase 2: Strategy & Solution Design",
                    duration: "6–8 Weeks",
                    color: "border-indigo-400",
                    intro: "The advisory phase translates assessment findings into a concrete transformation blueprint. Every strategic recommendation, vendor shortlist, and process redesign is grounded in the data collected in Phase 1 — ensuring the solution is designed for your organization's specific context, not a generic template.",
                    items: [
                      "Data-driven vendor shortlist and comparative fit analysis",
                      "HR process re-engineering and standardized workflow blueprints",
                      "Future-state architecture design and systems integration planning",
                      "ROI model development and Total Cost of Ownership (TCO) analysis",
                      "Change management plan, including stakeholder mapping and engagement strategy",
                    ],
                    deliverables: [
                      { d: "Architecture Blueprint", detail: "Detailed future-state system architecture" },
                      { d: "ROI & TCO Model", detail: "Financial case for transformation investment" },
                      { d: "Change Management Plan", detail: "Structured adoption and communications plan" },
                    ],
                  },
                  {
                    num: "03", phase: "Phase 3: Implementation & Configuration",
                    duration: "12–20 Weeks",
                    color: "border-violet-400",
                    intro: "Implementation is where strategy becomes reality. HR-Tek's delivery team manages the end-to-end technical execution: platform configuration, data migration, integration development, and user acceptance testing. A quality gate is maintained at each milestone to ensure the go-live meets defined acceptance criteria.",
                    items: [
                      "Core HCM & HRMS platform configuration and customization",
                      "Legacy HR data cleansing, transformation, and migration",
                      "Payroll, Finance, IT, and third-party system integrations",
                      "Parallel-run validation and issue resolution",
                      "User acceptance testing (UAT) with representative user groups",
                    ],
                    deliverables: [
                      { d: "Live Platform", detail: "Fully configured and tested HR system" },
                      { d: "Integration Runbook", detail: "Documentation of all system connections" },
                      { d: "UAT Sign-off Report", detail: "Formal acceptance of go-live readiness" },
                    ],
                  },
                  {
                    num: "04", phase: "Phase 4: Change Management & Adoption",
                    duration: "Ongoing (parallel to Phase 3+)",
                    color: "border-emerald-400",
                    intro: "Technology without adoption is shelfware. This phase deploys a structured change network within the organization to build digital readiness, drive active use of new systems, and embed new ways of working. Adoption metrics are tracked in real time and reported at every governance checkpoint.",
                    items: [
                      "Role-based training curriculum design and delivery",
                      "Change champion network — identification, training, and activation",
                      "SOP documentation and digital training asset creation",
                      "Adoption tracking dashboards and resistance intervention protocols",
                      "Hypercare support — intensive 60-day post-go-live assistance",
                    ],
                    deliverables: [
                      { d: "Training Completion Report", detail: "Evidence of workforce enablement" },
                      { d: "Adoption Metrics Dashboard", detail: "Real-time system usage and engagement data" },
                      { d: "SOP Library", detail: "Standardized operating procedures for all HR processes" },
                    ],
                  },
                  {
                    num: "05", phase: "Phase 5: Post Go-Live Support & Optimization",
                    duration: "Ongoing — 12+ months",
                    color: "border-amber-400",
                    intro: "Transformation is not complete at go-live. This phase delivers sustained value through a structured hypercare model, continuous improvement cycles, and quarterly optimization reviews. HR-Tek remains an active delivery partner, ensuring the platform evolves with your organization and continues to generate measurable ROI.",
                    items: [
                      "Hypercare helpdesk with SLA-backed incident resolution and root cause analysis",
                      "Monthly platform performance monitoring and system health reporting",
                      "Quarterly optimization reviews — process, automation, and analytics enhancements",
                      "New feature enablement and platform upgrade management",
                      "Value realization tracking against baseline KPIs established in Phase 1",
                    ],
                    deliverables: [
                      { d: "Support SLA Reports", detail: "Monthly incident resolution and uptime dashboards" },
                      { d: "Optimization Roadmap", detail: "Quarterly enhancement backlog with prioritized business cases" },
                      { d: "Value Realization Dashboard", detail: "Real-time ROI tracking against committed transformation baselines" },
                    ],
                  },
                ].map((phase) => (
                  <div key={phase.num} className={`bg-white border-2 ${phase.color} border-l-4 border-slate-100 rounded-2xl overflow-hidden`}
                    style={{ borderTopColor: "transparent", borderRightColor: "transparent", borderBottomColor: "transparent" }}>
                    <div className={`border-l-4 ${phase.color} bg-slate-50 px-7 py-5 flex items-center justify-between`}>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-black text-slate-200">{phase.num}</span>
                        <h3 className="text-lg font-black text-slate-900">{phase.phase}</h3>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                        <Clock className="w-3.5 h-3.5" />
                        {phase.duration}
                      </div>
                    </div>
                    <div className="p-7 space-y-6">
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{phase.intro}</p>
                      <div className="grid grid-cols-2 gap-8">
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Key Activities</p>
                          <div className="space-y-2">
                            {phase.items.map((item, i) => (
                              <div key={i} className="flex items-start gap-2.5">
                                <div className="w-1.5 h-1.5 bg-[#023e8a] rounded-full shrink-0 mt-1.5" />
                                <span className="text-sm text-slate-600 font-medium leading-relaxed">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Phase Deliverables</p>
                          <div className="space-y-4">
                            {phase.deliverables.map((d, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <FileText className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-xs font-bold text-slate-800">{d.d}</p>
                                  <p className="text-[11px] text-slate-400 font-medium">{d.detail}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════ 10. GOVERNANCE ═══════ */}
            <section id="governance" className="scroll-mt-24 mt-24">
              <SectionHeader num="10" title="Project Governance & Oversight" icon={ShieldCheck}
                intro={`Transformation programs fail when governance is informal. HR-Tek operates a structured, multi-tier governance model that ensures decisions are made at the right level, escalations are handled promptly, and stakeholders maintain clear visibility of progress, risks, and milestone achievement throughout the engagement.`}
              />

              <Callout icon={ShieldCheck} color="slate" title="Governance Principle">
                Each governance forum below has a defined purpose, a fixed stakeholder set, and clear escalation protocols. Agendas, minutes, and action registers are maintained in the HR-Tek platform, accessible to all authorized stakeholders in real time.
              </Callout>

              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200">
                <table className="w-full text-left">
                  <thead className="bg-slate-900">
                    <tr>
                      {["Forum", "Stakeholders", "Frequency", "Objective", "Format"].map((h) => (
                        <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {[
                      { f: "Steering Committee",     s: "CXO Sponsors",            fr: "Monthly",    o: "Strategic direction, risk escalation, and budget decisions",    fmt: "Executive Briefing" },
                      { f: "Project Review Board",   s: "PMO & Delivery Leads",    fr: "Weekly",     o: "Milestone progress, blockers, and cross-workstream coordination", fmt: "Status Report + Action Register" },
                      { f: "Daily Standups",         s: "Task Leads & Analysts",   fr: "Daily",      o: "Operational sync, impediment removal, daily priorities",          fmt: "15-min standup" },
                      { f: "Quality Gate Review",    s: "QA Lead + Client Sign-off", fr: "Per Phase", o: "Formal acceptance of deliverables before next phase begins",    fmt: "Gated Approval Document" },
                      { f: "Change Advisory Board",  s: "HR + IT + Change Leads",  fr: "Bi-weekly",  o: "Adoption progress, resistance monitoring, training effectiveness", fmt: "Adoption Dashboard Review" },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-900">{row.f}</td>
                        <td className="px-5 py-4 text-slate-600 font-medium">{row.s}</td>
                        <td className="px-5 py-4 text-slate-600 font-medium">{row.fr}</td>
                        <td className="px-5 py-4 text-slate-500 italic text-xs leading-relaxed">{row.o}</td>
                        <td className="px-5 py-4 text-slate-400 text-xs font-medium">{row.fmt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-5">
                {[
                  { title: "Escalation Path", desc: "All risks and issues are escalated within 24 hours of identification. Critical issues bypass weekly cadence and are addressed in an emergency steering call within 48 hours." },
                  { title: "Documentation", desc: "All decisions, approvals, and action items are documented in the HR-Tek platform. Version history is maintained for full audit traceability throughout the engagement." },
                  { title: "Change Control", desc: "Scope changes require formal impact assessment and written approval from both the client's authorized signatory and the HR-Tek Engagement Lead before implementation." },
                ].map((card, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">{card.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════ 11. COMMERCIALS ═══════ */}
            <section id="commercials" className="scroll-mt-24 mt-24">
              <SectionHeader num="11" title="Commercial & Investment Framework" icon={DollarSign}
                intro={`The commercial structure for this engagement is designed to align HR-Tek's financial incentives with the client's transformation outcomes. Investment is structured across distinct phases to minimize upfront risk and ensure accountability at every milestone.`}
              />

              {advisory?.recommendedPricing ? (
                <div className="bg-[#023e8a] text-white rounded-3xl p-10 mb-8 space-y-6">
                  <div>
                    <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">AI-Recommended Investment Tier</p>
                    <h3 className="text-3xl font-black">{advisory.recommendedPricing.tierName}</h3>
                    <p className="text-blue-200 text-sm mt-2 font-medium">Recommended based on your organization's size, complexity, and assessed readiness level.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-6 pt-4 border-t border-white/10">
                    <div>
                      <p className="text-blue-300 text-xs font-black uppercase tracking-wider mb-1">Investment (INR)</p>
                      <p className="text-3xl font-black">{advisory.recommendedPricing.priceINR}</p>
                    </div>
                    <div>
                      <p className="text-blue-300 text-xs font-black uppercase tracking-wider mb-1">Investment (USD)</p>
                      <p className="text-3xl font-black">{advisory.recommendedPricing.priceUSD}</p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="space-y-5">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Investment Structure</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900">
                      <tr>
                        {["Investment Component", "Structure", "Trigger / Basis", "Notes"].map((h) => (
                          <th key={h} className="px-5 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {[
                        { c: "Assessment & Advisory Fee", s: "Fixed Fee", t: "Project commencement", n: "Covers Phases 1 & 2 in full" },
                        { c: "Implementation Fee", s: "Milestone-Based", t: "Phase gate approvals", n: "Released on delivery of agreed phase outputs" },
                        { c: "Platform Licensing", s: "Per-Headcount / Annual", t: "Go-live date", n: "Scales with active user count; reviewed annually" },
                        { c: "Post-Live Support", s: "Annual Retainer", t: "Post-go-live", n: "Includes hypercare, upgrades, and quarterly ROI reviews" },
                      ].map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-4 font-bold text-slate-900">{row.c}</td>
                          <td className="px-5 py-4 text-slate-600 font-medium">{row.s}</td>
                          <td className="px-5 py-4 text-slate-500 text-xs">{row.t}</td>
                          <td className="px-5 py-4 text-slate-400 text-xs italic">{row.n}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-slate-500">
                <Link to="/pricing" className="flex items-center gap-1.5 hover:text-[#023e8a] transition-colors">
                  View full itemized pricing breakdown <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </section>

            {/* ═══════ 12. CLIENT RESPONSIBILITIES ═══════ */}
            <section id="client-resp" className="scroll-mt-24 mt-24">
              <SectionHeader num="12" title="Client Responsibilities" icon={Users}
                intro={`A successful transformation requires active client participation. The following responsibilities must be fulfilled by ${clientName} throughout the engagement to ensure that HR-Tek can deliver the agreed outcomes on time and within scope.`}
              />
              <div className="space-y-3 mt-6">
                {[
                  { title: "Stakeholder Availability", desc: "Ensure timely access to key decision-makers, subject matter experts, and HR, IT, and Finance stakeholders for workshops, reviews, and approvals." },
                  { title: "Accurate Data & Requirements", desc: "Provide complete, accurate organizational data including org charts, headcount figures, system inventories, and existing HR process documentation." },
                  { title: "Infrastructure & Access Readiness", desc: "Ensure that all required infrastructure, environments, and system access credentials are available to the HR-Tek team within the agreed timelines." },
                  { title: "Internal Change Sponsorship", desc: "Maintain active executive sponsorship and visible leadership commitment. Nominate internal change champions for each business unit." },
                  { title: "Timely Decision-Making", desc: "Commit to agreed response SLAs for approvals, feedback, and sign-offs. Delayed decisions are the primary driver of cost overruns and timeline slippage." },
                  { title: "UAT Participation", desc: "Provide a representative group of end-users to participate in User Acceptance Testing and deliver structured, documented feedback within the agreed testing window." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 bg-white border border-slate-200 rounded-xl hover:border-[#023e8a]/20 hover:bg-blue-50/10 transition-all">
                    <div className="w-6 h-6 rounded-full bg-[#023e8a]/10 flex items-center justify-center text-[11px] text-[#023e8a] font-black shrink-0 mt-0.5">{i + 1}</div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">{item.title}</p>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════ 13. HRTEK RESPONSIBILITIES ═══════ */}
            <section id="hrtek-resp" className="scroll-mt-24 mt-24">
              <SectionHeader num="13" title="HR-Tek System Responsibilities" icon={CheckCircle2}
                intro="HR-Tek commits to the following obligations throughout the engagement. These commitments are binding and reflected in the formal Master Services Agreement executed at project commencement."
              />
              <div className="space-y-3 mt-6">
                {[
                  { title: "End-to-End Project Delivery", desc: "Deliver all agreed phases, milestones, and deliverables as defined in this proposal and the MSA, within the committed timeline and quality standards." },
                  { title: "Quality Assurance & Governance", desc: "Maintain a formal quality assurance process with gated phase reviews. No phase commences without documented sign-off from both parties on prior phase deliverables." },
                  { title: "Risk Mitigation & Compliance", desc: "Proactively identify, escalate, and mitigate project risks. Ensure all delivery activities comply with applicable data protection, security, and regulatory requirements." },
                  { title: "Value Realization Focus", desc: "Continuously align delivery to the business outcomes defined in this proposal. Report progress against KPIs at every governance review." },
                  { title: "Knowledge Transfer", desc: "Ensure all configurations, customizations, and processes are fully documented and client team members are trained to manage the solution independently post-engagement." },
                  { title: "Confidentiality", desc: "Treat all client data, business information, and organizational insights as strictly confidential, governed by the NDA executed at engagement commencement." },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-4 p-6 bg-white border border-slate-200 rounded-xl hover:border-emerald-200 hover:bg-emerald-50/10 transition-all">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-slate-900 mb-1">{item.title}</p>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════ 14. ASSUMPTIONS & DEPENDENCIES ═══════ */}
            <section id="assumptions" className="scroll-mt-24 mt-24">
              <SectionHeader num="14" title="Assumptions & Dependencies" icon={Info}
                intro="The scope, timeline, and commercials outlined in this proposal are based on the following assumptions. Material deviations may require a formal scope review and commercial adjustment."
              />
              <div className="grid grid-cols-2 gap-5 mt-6">
                {[
                  { title: "Scope Boundary", desc: "This proposal covers the modules and phases explicitly named herein. Integrations or modules not listed are out of scope and subject to separate commercial negotiation." },
                  { title: "Third-Party Cooperation", desc: "Where implementation requires integration with third-party vendors (payroll, ERP, finance), those vendors will provide timely technical cooperation and documentation." },
                  { title: "Data Quality", desc: "The accuracy of AI-generated recommendations is contingent on the accuracy and completeness of organizational data provided by the client during assessment." },
                  { title: "Technology Infrastructure", desc: "The client will provide or procure necessary infrastructure, cloud environments, and network connectivity required to support the selected HR technology platforms." },
                  { title: "Regulatory Environment", desc: "No material changes to employment law, tax legislation, or data protection regulations occur during the engagement that would require significant redesign of in-scope processes." },
                  { title: "Organizational Stability", desc: "No significant mergers, acquisitions, divestitures, or major restructurings occur that materially change the in-scope organizational boundaries during the engagement." },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-6">
                    <p className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">{item.title}</p>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════ 15. LEGAL ═══════ */}
            <section id="legal" className="scroll-mt-24 mt-24">
              <SectionHeader num="15" title="Legal, Confidentiality & Terms" icon={Lock}
                intro="This section governs the legal basis of this proposal and the obligations of both parties in connection with its contents, the engagement it describes, and the data it contains."
              />

              <div className="space-y-6 text-sm text-slate-500 font-medium leading-relaxed">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-7 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">1. Confidentiality</h4>
                  <p>This proposal and all related strategic documentation are confidential and intended solely for the internal review of <strong className="text-slate-800">{clientName}</strong> and its authorized stakeholders. Unauthorized disclosure, reproduction, or distribution to any third party — in whole or in part — is strictly prohibited without the prior written consent of HR-Tek System.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-7 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">2. Intellectual Property</h4>
                  <p>All proprietary assessment methodologies, AI-generated scoring logic, advisory frameworks, and transformation templates utilized in this proposal are the exclusive intellectual property of <strong className="text-slate-800">HR-Tek System (Delosch Technologies Pvt. Ltd.)</strong>. Usage rights for client-specific outputs (scorecards, roadmaps, reports) are granted to the client upon full commercial engagement, as detailed in the Master Services Agreement.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-7 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">3. Data Protection</h4>
                  <p>All organizational data provided during the assessment process is processed in accordance with applicable data protection regulations. Data is stored on encrypted AWS infrastructure in the Asia Pacific (Mumbai) region and is not shared with any third parties without explicit client consent.</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-7 space-y-4">
                  <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">4. Governing Law & Dispute Resolution</h4>
                  <p>This proposal and any resulting engagement are governed by the laws of India. Any disputes arising in connection with this proposal or the engagement it describes shall be subject to the exclusive jurisdiction of the courts of Lucknow, Uttar Pradesh.</p>
                </div>
                <div className="flex items-center justify-between bg-slate-900 rounded-xl px-6 py-4 text-[11px] font-black uppercase tracking-widest text-slate-400">
                  <span>Ref: {refId ?? "—"}</span>
                  <span>Platform Verified · Audit Logged</span>
                  <span>Valid Until {validUntil}</span>
                </div>
              </div>
            </section>

            {/* ═══════ 16. NEXT STEPS ═══════ */}
            <section id="next-steps" className="scroll-mt-24 mt-24">
              <SectionHeader num="16" title="Acceptance & Next Steps" icon={ArrowRight}
                intro={`Upon acceptance of this proposal, the following steps are initiated automatically within the HR-Tek System platform to ensure a seamless transition from proposal to active engagement.`}
              />
              <div className="space-y-4 mb-10">
                {[
                  { step: "01", title: "Digital Acceptance on HR-Tek System", desc: "The authorized representative of the client digitally accepts this proposal within the HR-Tek platform. Acceptance is timestamped, audit-logged, and triggers the next step automatically." },
                  { step: "02", title: "Invoice Generation & Payment Confirmation", desc: "A GST-compliant invoice is auto-generated based on the agreed scope and pricing. Upon payment confirmation, the project is formally activated and a Project ID is assigned." },
                  { step: "03", title: "Project Kick-Off Initiation", desc: "The HR-Tek Engagement Lead contacts the client within 2 business days to schedule the project kick-off. Resources are allocated, access is provisioned, and the Phase 1 assessment program commences." },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-5 p-7 bg-white border border-slate-200 rounded-2xl hover:border-[#023e8a]/30 hover:shadow-md transition-all">
                    <div className="w-12 h-12 bg-[#023e8a] text-white rounded-2xl flex items-center justify-center text-lg font-black shrink-0">{item.step}</div>
                    <div>
                      <p className="text-base font-black text-slate-900 mb-1.5">{item.title}</p>
                      <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ═══════ APPENDIX D ═══════ */}
            <section id="appendix" className="scroll-mt-24 mt-24">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Appendix D</p>
                  <h2 className="text-xl font-black text-slate-900">System Mapping: Assessment → Pricing → Invoice → Checkout</h2>
                </div>
              </div>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                This appendix maps this proposal to HR-Tek System's internal intelligence engines, ensuring seamless digital execution from client assessment to payment confirmation. Every section is dynamically populated from real-time assessment data — no generic templates, no manual input.
              </p>

              {/* D1 */}
              <div className="mb-8">
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">D1. Proposal ↔ Assessment Engine Mapping</p>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900">
                      <tr>{["Proposal Section", "Assessment Engine", "Key Inputs", "System Output"].map(h => <th key={h} className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { s: "Client Objectives",    e: "Digital HR Maturity Engine",       i: "Process, tech, compliance", o: "Maturity index & gaps" },
                        { s: "Strategic Priorities", e: "HR Strategy Engine",               i: "Target maturity & growth", o: "Digital roadmap" },
                        { s: "Phases 1–3",           e: "Implementation Complexity Engine", i: "Modules, integrations, data", o: "Effort & timeline" },
                        { s: "Change Management",    e: "Adoption Readiness Engine",        i: "Culture & change inputs", o: "Change intensity score" },
                        { s: "Support & Optimize",   e: "Optimization Potential Engine",    i: "Usage & performance data", o: "Retainer recommendations" },
                      ].map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-800">{r.s}</td>
                          <td className="px-4 py-3 text-[#023e8a] font-semibold">{r.e}</td>
                          <td className="px-4 py-3 text-slate-500">{r.i}</td>
                          <td className="px-4 py-3 text-slate-500 italic">{r.o}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* D2 */}
              <div className="mb-8">
                <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">D2. Proposal ↔ Pricing Calculator Mapping</p>
                <div className="overflow-hidden rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900">
                      <tr>{["Pricing Driver", "Source Engine", "Impact on Pricing"].map(h => <th key={h} className="px-4 py-3 font-black text-slate-400 uppercase tracking-widest">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {[
                        { d: "Employee Count",    s: "Org Profiling Engine",        i: "Base pricing slab" },
                        { d: "Modules Selected",  s: "HR Maturity Engine",          i: "Feature-based pricing" },
                        { d: "Complexity Score",  s: "Implementation Engine",       i: "Effort multiplier" },
                        { d: "Integration Count", s: "Tech Readiness Engine",       i: "Integration fees" },
                        { d: "Change Intensity",  s: "Adoption Engine",             i: "Change & training cost" },
                        { d: "Support Duration",  s: "Optimization Engine",         i: "AMC / retainer value" },
                      ].map((r, i) => (
                        <tr key={i} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-800">{r.d}</td>
                          <td className="px-4 py-3 text-[#023e8a] font-semibold">{r.s}</td>
                          <td className="px-4 py-3 text-slate-500 italic">{r.i}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* D3 + D4 grid */}
              <div className="grid grid-cols-2 gap-5 mb-8">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">D3. Invoice Generation</p>
                  <div className="space-y-2">
                    {["Lock scope & commercials", "Generate GST-compliant invoice", "Assign milestone-based billing tags", "Push invoice to client dashboard"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-[#023e8a] rounded-md flex items-center justify-center text-[9px] font-black text-white shrink-0">{i + 1}</div>
                        <span className="text-xs text-slate-600 font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
                  <p className="text-xs font-black text-slate-700 uppercase tracking-widest mb-3">D4. Checkout & Post-Payment</p>
                  <div className="space-y-2">
                    {["Client reviews & digitally accepts proposal", "Invoice locked & payment initiated", "Receipt generated & transaction logged", "Project ID created & implementation activated"].map((s, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 bg-emerald-600 rounded-md flex items-center justify-center text-[9px] font-black text-white shrink-0">{i + 1}</div>
                        <span className="text-xs text-slate-600 font-medium">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* D5 Benefits */}
              <div className="bg-slate-900 rounded-2xl p-7">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">D5. Platform Advantages</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { t: "Zero Manual Handling", d: "Proposals auto-generated from assessment data" },
                    { t: "No Pricing Leakage",   d: "All pricing locked to assessment engine outputs" },
                    { t: "Faster Deal Closure",  d: "Digital acceptance removes paper-based delays" },
                    { t: "Audit-Ready Docs",     d: "Every action is timestamped and audit-logged" },
                    { t: "Investor-Grade Transparency", d: "Full traceability from assessment to invoice" },
                    { t: "Scalable Automation",  d: "SMB, Enterprise, and Investor variants auto-configured" },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 rounded-xl p-4">
                      <p className="text-[11px] font-black text-white mb-1">{item.t}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* ═══════ SIGNATURE ═══════ */}
            <section className="mt-24 pt-12 border-t-2 border-slate-900">
              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-10">Execution & Acceptance</p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed mb-10">
                By signing below, the authorized representative of <strong className="text-slate-800">{clientName}</strong> confirms that they have read, understood, and accepted the terms of this proposal, and authorizes the commencement of the engagement as described herein, subject to the execution of a formal Master Services Agreement.
              </p>
              <div className="grid grid-cols-2 gap-16">
                <div className="space-y-6">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Client Acceptance</p>
                  <div className="h-16 bg-slate-50 border-b-2 border-slate-300 rounded-t-sm" />
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Authorized Signatory Name & Designation</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{clientName}</p>
                  </div>
                  <div className="h-10 bg-slate-50 border-b border-slate-200 rounded-t-sm" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Date</p>
                </div>
                <div className="space-y-6">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">HR-Tek System Acknowledgement</p>
                  <div className="h-16 flex items-center">
                    <span className="font-serif text-3xl italic font-bold text-slate-200">System Verified</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 uppercase tracking-wider">Engagement Lead · Transformation PMO</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">HR-Tek System · Delosch Technologies Pvt. Ltd.</p>
                    <p className="text-xs text-slate-400 font-semibold">Lucknow, Uttar Pradesh, India</p>
                  </div>
                  <div className="h-10 bg-slate-50 border-b border-slate-200 rounded-t-sm" />
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Date</p>
                </div>
              </div>
            </section>

          </div>

          <footer className="text-center py-10 max-w-[900px] mx-auto text-slate-400 text-[10px] font-bold uppercase tracking-widest print:hidden">
            Proprietary Methodology © {new Date().getFullYear()} HR-Tek System · Delosch Technologies Pvt. Ltd. · All Rights Reserved
          </footer>
        </main>
      </div>

      <style>{`
        .proposal-content h1, .proposal-content h2 { color: #1e293b; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; font-size: 1.5rem; }
        .proposal-content h3 { color: #334155; font-weight: 700; margin-top: 1.75rem; margin-bottom: 0.75rem; font-size: 1.15rem; }
        .proposal-content h4 { color: #475569; font-weight: 700; margin-top: 1.25rem; margin-bottom: 0.5rem; }
        .proposal-content p { color: #475569; line-height: 1.85; margin-bottom: 1.15rem; font-size: 0.9375rem; }
        .proposal-content ul, .proposal-content ol { padding-left: 1.5rem; margin-bottom: 1.15rem; }
        .proposal-content li { color: #475569; margin-bottom: 0.5rem; line-height: 1.75; font-size: 0.9375rem; }
        .proposal-content strong { color: #0f172a; font-weight: 700; }
        .proposal-content em { color: #64748b; }
        .proposal-content blockquote { border-left: 4px solid #023e8a; padding: 0.75rem 1.25rem; margin: 1.5rem 0; background: #f0f7ff; border-radius: 0 8px 8px 0; }
        .proposal-content blockquote p { color: #1e3a5f; font-style: italic; margin: 0; }
        .proposal-content table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; }
        .proposal-content th { background: #f8fafc; padding: 0.75rem 1rem; font-weight: 700; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; border: 1px solid #e2e8f0; color: #64748b; }
        .proposal-content td { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; font-size: 0.875rem; color: #475569; }
        .proposal-content hr { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }

        @media print {
          body { background: white !important; }
          aside, header, footer, nav { display: none !important; }
          .max-w-\\[900px\\] { max-width: 100% !important; border: none !important; box-shadow: none !important; margin: 0 !important; padding: 20mm 15mm !important; }
          section { page-break-after: always; }
        }
      `}</style>
    </div>
  );
}
