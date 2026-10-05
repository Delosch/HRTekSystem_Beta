import { json, redirect, type LoaderFunctionArgs, type MetaFunction, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { getEnhancedUser } from "~/utils/user.server";
import { getLatestAnalysis } from "~/utils/question.utils";
import { requireUserSession } from "~/lib/session.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { getAnswerSheetByAssessmentName, getLatestQuestion } from "~/utils/question.utils";
import Sidebar from "~/components/DashboardComponents/Sidebar";
import { motion } from "framer-motion";
import {
  FileText,
  CheckCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  ShieldCheck,
  ArrowLeft,
  Building2,
  Users,
  Lightbulb,
  Clock,
  Calendar,
} from "lucide-react";

// Import engine-specific report components
import ChangeManagementReport from "~/components/reports/ChangeManagementReport";
import RoadmapReport from "~/components/reports/RoadmapReport";
import SharedServicesReport from "~/components/reports/SharedServicesReport";
import VendorFitReportDashboard from "~/components/reports/VendorFitReportDashboard";
import TechMaturityReport from "~/components/reports/TechMaturityReport";
import DigitalMaturityReport from "~/components/reports/DigitalMaturityReport";
import ProfilingReport from "~/components/reports/ProfilingReport";

export const meta: MetaFunction<typeof loader> = ({ params }) => [
  { title: `${decodeURIComponent(params.section || "Report")} | HRTek System` },
];

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await getEnhancedUser(request);
  if (!user || !user.organisationId) return redirect("/auth");

  const section = decodeURIComponent(params.section || "");
  if (section === "HCM Vendor Fit Engine") {
    return redirect(`/fit/report/${encodeURIComponent(section)}`);
  }
  const url = new URL(request.url);

  // BYPASS: Payment gate disabled — all engines are free
  // const isAdmin = (user as any).role === "ADMIN";
  // if (!isAdmin) {
  //   const payments = await getCompanyPayments(user.organisationId);
  //   const isVerified = payments.some(
  //     (p) =>
  //       p.status === "payment_verified" &&
  //       p.items?.some((item: any) => item.engineName?.trim() === section)
  //   );
  //   if (!isVerified) {
  //     return redirect("/reports");
  //   }
  // }

  const analysis = await getLatestAnalysis(user.organisationId, section);
  let isReportReady = analysis && analysis.result?.status !== "pending_generation";

  // For Profiling Assessment, ensure the data uses the digital_maturity schema
  // Old reports generated with profiling.genAi.server have executiveSummary/companyProfile
  // but DigitalMaturityReport needs maturity_analysis/strategic_insights
  if (isReportReady && section === "Profiling Assessment") {
    const result = analysis?.result || {};
    if (!result.maturity_analysis && (result.executiveSummary || result.companyProfile)) {
      console.log("[Consulting Report Loader] Profiling Assessment has old schema, forcing regeneration");
      isReportReady = false;
    }
  }

  console.log(`[Consulting Report Loader] Section: ${section}, Data found: ${!!analysis}, Ready: ${isReportReady}`);

  // If no report is ready, handle appropriately
  if (!isReportReady) {
    // Polling check from intermediate.tsx — return 202 so polling doesn't crash
    if (url.searchParams.get("verify") === "true") {
      return new Response(null, { status: 202 });
    }

    // Redirect to intermediate to trigger generation
    const promptMap: Record<string, string> = {
      "Profiling Assessment": "digital_maturity",
      "Digital Maturity Assessment": "digital_maturity",
      "HR Technology Maturity Analysis": "tech_maturity",
      "HR Tech Maturity Analysis": "tech_maturity",
      "Shared Service Designer": "shared_service",
      "Intelligent Change Management": "change_management",
      "Change Management Readiness": "change_management",
      "HCM Vendor Fit Engine": "vendor_fit",
      "HR Transformation Roadmap Generator": "digital_transformation",
    };

    const promptId = promptMap[section] || "digital_maturity";
    return redirect(
      `/intermediate?engine=${encodeURIComponent(section)}&promptId=${encodeURIComponent(promptId)}&skipQuestions=true`
    );
  }

  // Fetch company info for branding
  const company_info = await getCompanyProfile(user.organisationId);
  const brand_name = company_info?.brand_name || company_info?.company_name || "Confidential Client";

  // Also fetch raw responses and questions (best-effort; should not fail report rendering)
  let responses = null;
  let questions = null;
  try {
    responses = await getAnswerSheetByAssessmentName(user.organisationId, section);
    questions = await getLatestQuestion(section);
  } catch (auxError) {
    console.error("[Consulting Report Loader] Failed to fetch responses/questions:", auxError);
  }

  // Check report unlock status for Change Management (advanced engine — requires 100% payment)
  let reportUnlocked = true; // Default: unlocked for non-CM engines
  if (section === "Intelligent Change Management") {
    const { getEngineAccessStatus } = await import("~/models/payment.model.server");
    const accessStatus = await getEngineAccessStatus(user.organisationId, section);
    reportUnlocked = accessStatus.reportUnlocked;
  }

  return json({ user, section, analysis, brand_name, companyLogo: company_info?.logo_url, responses, questions, reportUnlocked });
}

// --- Action (for AI report generation from engine page) ---
export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUserSession(request);
  if (!user || !user.organisationId) return json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const engineId = decodeURIComponent(params.section || "");

  if (body.intent === "generate_report") {
    console.log(`[Consulting Report Action] Generating report for: ${engineId}`);

    const engineTypeMap: Record<string, string> = {
      "Intelligent Change Management": "changeManagement",
      "Shared Service Designer": "sharedServices",
      "HCM Vendor Fit Engine": "vendorFit",
      "HR Transformation Roadmap Generator": "sharedServices",
      "HR Technology Maturity Analysis": "sharedServices",
      "HR Tech Maturity Analysis": "sharedServices",
    };

    const engineType = engineTypeMap[engineId] || "sharedServices";

    const aggregatedData = {
      companyId: user.organisationId,
      timestamp: new Date().toISOString(),
      engines: {
        [engineType]: {
          engineName: engineId,
          progress: 100,
          responses: body.answers || {},
          scores: {},
          aiAnalysis: {},
        },
      },
      completedEnginesCount: 1,
      totalEngines: 1,
    };

    try {
      const { generateHTIAdvisory } = await import("~/lib/hti.deepseek");
      const { saveAdvisoryReport } = await import("~/models/hti.model.server");
      const advisory = await generateHTIAdvisory(aggregatedData as any);
      await saveAdvisoryReport(user.organisationId, user.userId, advisory, aggregatedData as any);
      return json({ success: true, advisory });
    } catch (error) {
      console.error("AI Generation Error in Consulting Report:", error);
      return json({ error: "Failed to generate AI report" }, { status: 500 });
    }
  }

  return json({ error: "Invalid intent" }, { status: 400 });
}

export default function ConsultingReportPage() {
  const { user, section, analysis, brand_name, companyLogo, responses, questions, reportUnlocked } =
    useLoaderData<typeof loader>();

  // --- Engine-specific report components ---
  if (section === "Profiling Assessment") {
    return (
      <DigitalMaturityReport
        data={analysis}
        brandName={brand_name || "Your Organization"}
        assessmentId={section}
        reportType="detailed"
        responses={responses}
        questions={questions}
      />
    );
  }
  if (section === "Intelligent Change Management") {
    return (
      <ChangeManagementReport
        data={analysis?.result || analysis}
        brandName={brand_name || "Your Organization"}
        companyLogo={companyLogo}
        assessmentId={section}
        responses={responses}
        questions={questions}
        reportUnlocked={reportUnlocked}
      />
    );
  }
  if (section === "HR Transformation Roadmap Generator") {
    return (
      <RoadmapReport
        data={analysis?.result || analysis}
        brandName={brand_name || "Your Organization"}
        companyLogo={companyLogo}
        responses={responses}
        questions={questions}
      />
    );
  }
  if (section === "Shared Service Designer") {
    return (
      <SharedServicesReport
        data={analysis?.result || analysis}
        brandName={brand_name || "Your Organization"}
        companyLogo={companyLogo}
        assessmentId={section}
        responses={responses}
        questions={questions}
      />
    );
  }
  if (section === "HCM Vendor Fit Engine") {
    return (
      <VendorFitReportDashboard
        data={analysis?.result || analysis}
        brandName={brand_name || "Your Organization"}
        companyLogo={companyLogo}
        assessmentId={section}
        responses={responses}
        questions={questions}
      />
    );
  }
  if (section === "HR Technology Maturity Analysis" || section === "HR Tech Maturity Analysis") {
    return (
      <TechMaturityReport
        data={analysis?.result || analysis}
        brandName={brand_name || "Your Organization"}
        responses={responses}
        questions={questions}
      />
    );
  }
  if (section === "Digital Maturity Assessment") {
    return (
      <DigitalMaturityReport
        data={analysis?.result || analysis}
        brandName={brand_name || "Your Organization"}
        assessmentId={section}
        reportType="detailed"
        responses={responses}
        questions={questions}
      />
    );
  }

  // --- Default: Inline report view (original Apr 18 layout) ---
  const report = analysis?.result as any;
  const generatedAt = analysis?.createdAt
    ? new Date(analysis.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar user={user} />

      <main className="flex-1 md:ml-64 p-4 sm:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to My Reports
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{section}</h1>
              {generatedAt && (
                <p className="text-slate-500 text-sm flex items-center gap-1 mt-1">
                  <Calendar className="w-4 h-4" />
                  Generated on {generatedAt}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {!report || report.status === "pending_generation" ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl shadow-lg border border-amber-200 p-12 text-center"
          >
            <Clock className="w-16 h-16 text-amber-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Report Generation In Progress
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Your AI-powered report is being generated. This usually takes a few
              minutes. Please check back shortly.
            </p>
            <Link
              to="/reports"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Return to Reports
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Executive Summary */}
            {report.executiveSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <ShieldCheck className="w-6 h-6" />
                  <h2 className="text-xl font-bold">Executive Summary</h2>
                </div>
                <p className="text-blue-100 leading-relaxed text-base">
                  {report.executiveSummary}
                </p>
              </motion.div>
            )}

            {/* Company Profile */}
            {report.companyProfile && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Company Profile
                  </h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: "Overview", value: report.companyProfile.overview },
                    {
                      label: "Industry Context",
                      value: report.companyProfile.industryContext,
                    },
                    {
                      label: "Workforce Analysis",
                      value: report.companyProfile.workforceAnalysis,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="bg-slate-50 rounded-xl p-4"
                    >
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        {item.label}
                      </p>
                      <p className="text-slate-700 text-sm leading-relaxed">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* HR Maturity Assessment */}
            {report.hrMaturityAssessment && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    HR Maturity Assessment
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Score */}
                  <div className="flex items-center gap-6 bg-slate-50 rounded-xl p-6">
                    <div className="relative w-24 h-24 flex-shrink-0">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#e2e8f0"
                          strokeWidth="3"
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="15.9"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          strokeDasharray={`${report.hrMaturityAssessment.score} ${100 - report.hrMaturityAssessment.score}`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900">
                          {report.hrMaturityAssessment.score}
                        </span>
                        <span className="text-xs text-slate-500">/100</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Maturity Level
                      </p>
                      <p className="text-lg font-bold text-emerald-600">
                        {report.hrMaturityAssessment.currentMaturityLevel}
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Gaps */}
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Key Strengths
                      </p>
                      <ul className="space-y-1">
                        {report.hrMaturityAssessment.keyStrengths?.map(
                          (s: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-slate-700 flex items-start gap-2"
                            >
                              <span className="text-emerald-500 mt-0.5">•</span>
                              {s}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Critical Gaps
                      </p>
                      <ul className="space-y-1">
                        {report.hrMaturityAssessment.criticalGaps?.map(
                          (g: string, i: number) => (
                            <li
                              key={i}
                              className="text-sm text-slate-700 flex items-start gap-2"
                            >
                              <span className="text-rose-400 mt-0.5">•</span>
                              {g}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Transformation Readiness */}
            {report.transformationReadiness && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Transformation Readiness
                  </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {/* Score */}
                  <div className="bg-blue-50 rounded-xl p-5 text-center border border-blue-100">
                    <p className="text-4xl font-bold text-blue-700 mb-1">
                      {report.transformationReadiness.readinessScore}
                      <span className="text-lg text-blue-400">/100</span>
                    </p>
                    <p className="text-sm font-bold text-blue-600">
                      {report.transformationReadiness.readinessLevel}
                    </p>
                  </div>

                  {/* Enablers */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Enablers
                    </p>
                    <ul className="space-y-1">
                      {report.transformationReadiness.enablers?.map(
                        (e: string, i: number) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-emerald-500 mt-0.5">+</span>{e}
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  {/* Barriers */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-3 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Barriers
                    </p>
                    <ul className="space-y-1">
                      {report.transformationReadiness.barriers?.map(
                        (b: string, i: number) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-rose-400 mt-0.5">-</span>{b}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Strategic Recommendations */}
            {report.strategicRecommendations && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-amber-600" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Strategic Recommendations
                  </h2>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Immediate (0–3 months)",
                      items: report.strategicRecommendations.immediate,
                      color: "rose",
                      bg: "bg-rose-50",
                      border: "border-rose-100",
                      text: "text-rose-600",
                    },
                    {
                      label: "Short-term (3–12 months)",
                      items: report.strategicRecommendations.shortTerm,
                      color: "amber",
                      bg: "bg-amber-50",
                      border: "border-amber-100",
                      text: "text-amber-600",
                    },
                    {
                      label: "Long-term (12+ months)",
                      items: report.strategicRecommendations.longTerm,
                      color: "blue",
                      bg: "bg-blue-50",
                      border: "border-blue-100",
                      text: "text-blue-600",
                    },
                  ].map((phase) => (
                    <div
                      key={phase.label}
                      className={`${phase.bg} rounded-xl p-5 border ${phase.border}`}
                    >
                      <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${phase.text}`}>
                        {phase.label}
                      </p>
                      <ul className="space-y-2">
                        {phase.items?.map((item: string, i: number) => (
                          <li
                            key={i}
                            className="text-sm text-slate-700 flex items-start gap-2"
                          >
                            <span className={`${phase.text} font-bold mt-0.5 flex-shrink-0`}>
                              {i + 1}.
                            </span>
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
