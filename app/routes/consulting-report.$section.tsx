import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";
import {
  Link,
  useLoaderData,
} from "@remix-run/react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  Lightbulb,
  ShieldCheck,
  Target,
  TrendingUp,
} from "lucide-react";

import Sidebar from "~/components/DashboardComponents/Sidebar";

// Engine-specific report components
import ChangeManagementReport from "~/components/reports/ChangeManagementReport";
import DigitalMaturityReport from "~/components/reports/DigitalMaturityReport";
import RoadmapReport from "~/components/reports/RoadmapReport";
import SharedServicesReport from "~/components/reports/SharedServicesReport";
import TechMaturityReport from "~/components/reports/TechMaturityReport";
import VendorFitReportDashboard from "~/components/reports/VendorFitReportDashboard";

import {
  resolveReportEngine,
  resolveReportEngineBySlug,
} from "~/constants/engines";
import { requireUserSession } from "~/lib/session.server";
import { getCompanyProfile } from "~/models/company.model.server";
import {
  getAnswerSheetByAssessmentName,
  getLatestAnalysis,
  getLatestQuestion,
} from "~/utils/question.utils";
import {
  resolveReportClientIdentity,
} from "~/utils/reportClientIdentity";
import { getEnhancedUser } from "~/utils/user.server";

export const meta: MetaFunction<
  typeof loader
> = ({ params }) => [
  {
    title: `${decodeURIComponent(
      params.section || "Report",
    )} | HRTek System`,
  },
];

export async function loader({
  request,
  params,
}: LoaderFunctionArgs) {
  const user =
    await getEnhancedUser(request);

  if (!user?.organisationId) {
    return redirect("/auth");
  }

  const reportSlug =
    decodeURIComponent(
      params.section || "",
    );

  /*
   * Resolve the route slug into the canonical
   * engine configuration.
   */
  const engineConfig =
    resolveReportEngineBySlug(
      reportSlug,
    ) ??
    resolveReportEngine(
      reportSlug,
    );

  const reportSection =
    engineConfig?.displayName;

  if (!reportSection) {
    throw new Response(
      `Unsupported report engine: ${reportSlug}`,
      {
        status: 404,
      },
    );
  }

  /*
   * Vendor Fit currently has its own dedicated
   * report route.
   */
  if (
    reportSection ===
    "HCM Vendor Fit Engine"
  ) {
    return redirect(
      `/fit/report/${encodeURIComponent(
        reportSection,
      )}`,
    );
  }

  const requestUrl =
    new URL(request.url);

  const analysis =
    await getLatestAnalysis(
      user.organisationId,
      reportSection,
    );

  let isReportReady =
    Boolean(analysis) &&
    analysis?.result?.status !==
      "pending_generation";

  /*
   * Profiling Assessment must use the current
   * Digital Maturity report schema.
   */
  if (
    isReportReady &&
    reportSection ===
      "Profiling Assessment"
  ) {
    const analysisResult =
      analysis?.result || {};

    const usesLegacySchema =
      !analysisResult.maturity_analysis &&
      Boolean(
        analysisResult.executiveSummary ||
          analysisResult.companyProfile,
      );

    if (usesLegacySchema) {
      console.log(
        "[Consulting Report Loader] Profiling Assessment has old schema, forcing regeneration",
      );

      isReportReady = false;
    }
  }

  console.log(
    `[Consulting Report Loader] Section: ${reportSection}, Data found: ${Boolean(
      analysis,
    )}, Ready: ${isReportReady}`,
  );

  /*
   * If the report is not ready, either return
   * the polling response or redirect to the
   * generation workflow.
   */
  if (!isReportReady) {
    if (
      requestUrl.searchParams.get(
        "verify",
      ) === "true"
    ) {
      return new Response(null, {
        status: 202,
      });
    }

    return redirect(
      `/intermediate?engine=${encodeURIComponent(
        engineConfig.displayName,
      )}&promptId=${encodeURIComponent(
        engineConfig.promptId,
      )}&skipQuestions=true`,
    );
  }

  /*
   * Resolve a safe, readable client identity.
   *
   * Resolution order:
   * company_name → brand_name →
   * "Confidential Client"
   *
   * Internal IDs are never used as the
   * client-facing name.
   */
  const companyProfile =
    await getCompanyProfile(
      user.organisationId,
    );

  const {
    companyName,
    logoUrl: companyLogo,
  } =
    resolveReportClientIdentity(
      companyProfile,
    );

  /*
   * Raw assessment responses and questions are
   * useful for report evidence, but their absence
   * should not block report rendering.
   */
  let responses = null;
  let questions = null;

  try {
    [
      responses,
      questions,
    ] = await Promise.all([
      getAnswerSheetByAssessmentName(
        user.organisationId,
        reportSection,
      ),
      getLatestQuestion(
        reportSection,
      ),
    ]);
  } catch (auxiliaryDataError) {
    console.error(
      "[Consulting Report Loader] Failed to fetch responses/questions:",
      auxiliaryDataError,
    );
  }

  // Change Management reports require full payment before download access.
  let reportUnlocked = true;

  if (
    reportSection ===
    "Intelligent Change Management"
  ) {
    const {
      getEngineAccessStatus,
    } = await import(
      "~/models/payment.model.server"
    );

    const accessStatus =
      await getEngineAccessStatus(
        user.organisationId,
        reportSection,
      );

    reportUnlocked =
      Boolean(
        accessStatus.reportUnlocked,
      );
  }

  return json({
    user,
    section: reportSection,
    analysis,
    companyName,
    companyLogo,
    responses,
    questions,
    reportUnlocked,
  });
}

// Action used for report generation from an engine page.
export async function action({
  request,
  params,
}: ActionFunctionArgs) {
  const user =
    await requireUserSession(
      request,
    );

  if (!user?.organisationId) {
    return json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      },
    );
  }

  const body =
    await request.json();

  const routeEngineId =
    decodeURIComponent(
      params.section || "",
    );

  if (
    body.intent !==
    "generate_report"
  ) {
    return json(
      {
        error: "Invalid intent",
      },
      {
        status: 400,
      },
    );
  }

  console.log(
    `[Consulting Report Action] Generating report for: ${routeEngineId}`,
  );

  const reportEngine =
    resolveReportEngine(
      body.params,
    );

  if (!reportEngine) {
    return json(
      {
        error:
          `Unsupported report engine: ${body.params}`,
      },
      {
        status: 400,
      },
    );
  }

  /*
   * Preserve compatibility with the current
   * advisory-generation pipeline.
   *
   * The existing engine mappings are intentionally
   * unchanged in this client-identity update.
   */
  const engineTypeMap:
    Record<string, string> = {
      "Intelligent Change Management":
        "changeManagement",

      "Shared Service Designer":
        "sharedServices",

      "HCM Vendor Fit Engine":
        "vendorFit",

      "HR Transformation Roadmap Generator":
        "sharedServices",

      "HR Technology Maturity Analysis":
        "sharedServices",

      "HR Tech Maturity Analysis":
        "sharedServices",
    };

  const engineType =
    engineTypeMap[
      reportEngine.displayName
    ] || "sharedServices";

  const aggregatedData = {
    companyId:
      user.organisationId,

    timestamp:
      new Date().toISOString(),

    engines: {
      [engineType]: {
        engineName:
          reportEngine.displayName,

        progress: 100,

        responses:
          body.answers || {},

        scores: {},

        aiAnalysis: {},
      },
    },

    completedEnginesCount: 1,
    totalEngines: 1,
  };

  try {
    const {
      generateHTIAdvisory,
    } = await import(
      "~/lib/hti.deepseek"
    );

    const {
      saveAdvisoryReport,
    } = await import(
      "~/models/hti.model.server"
    );

    const advisory =
      await generateHTIAdvisory(
        aggregatedData as any,
      );

    await saveAdvisoryReport(
      user.organisationId,
      user.userId,
      advisory,
      aggregatedData as any,
    );

    return json({
      success: true,

      redirect:
        `/intermediate?engine=${encodeURIComponent(
          reportEngine.displayName,
        )}` +
        `&promptId=${encodeURIComponent(
          reportEngine.promptId,
        )}` +
        "&skipQuestions=true",
    });
  } catch (
    generationError
  ) {
    console.error(
      "AI Generation Error in Consulting Report:",
      generationError,
    );

    return json(
      {
        error:
          "Failed to generate AI report",
      },
      {
        status: 500,
      },
    );
  }
}


export default function ConsultingReportPage() {
  const {
    user,
    section,
    analysis,
    companyName,
    companyLogo,
    responses,
    questions,
    reportUnlocked,
  } =
    useLoaderData<
      typeof loader
    >();

  const reportData =
    analysis?.result ||
    analysis;

  // Profiling Assessment
  if (
    section ===
    "Profiling Assessment"
  ) {
    return (
      <DigitalMaturityReport
        data={analysis}
        brandName={companyName}
        assessmentId={section}
        reportType="detailed"
        responses={responses}
        questions={questions}
      />
    );
  }

  // Change Management
  if (
    section ===
    "Intelligent Change Management"
  ) {
    return (
      <ChangeManagementReport
        data={reportData}
        brandName={companyName}
        companyLogo={companyLogo}
        assessmentId={section}
        responses={responses}
        questions={questions}
        reportUnlocked={reportUnlocked}
      />
    );
  }

  // Transformation Roadmap
  if (
    section ===
    "HR Transformation Roadmap Generator"
  ) {
    return (
      <RoadmapReport
        data={reportData}
        brandName={companyName}
        companyLogo={companyLogo}
        responses={responses}
        questions={questions}
      />
    );
  }

  // Shared Services
  if (
    section ===
    "Shared Service Designer"
  ) {
    return (
      <SharedServicesReport
        data={reportData}
        brandName={companyName}
        companyLogo={companyLogo}
        assessmentId={section}
        responses={responses}
        questions={questions}
      />
    );
  }

  /*
   * This branch is retained for compatibility,
   * although Vendor Fit currently redirects to
   * its dedicated route in the loader.
   */
  if (
    section ===
    "HCM Vendor Fit Engine"
  ) {
    return (
      <VendorFitReportDashboard
        data={reportData}
        brandName={companyName}
        companyLogo={companyLogo}
        assessmentId={section}
        responses={responses}
        questions={questions}
      />
    );
  }

  // Technology Maturity
  if (
    section ===
      "HR Technology Maturity Analysis" ||
    section ===
      "HR Tech Maturity Analysis"
  ) {
    return (
      <TechMaturityReport
        data={reportData}
        brandName={companyName}
        responses={responses}
        questions={questions}
      />
    );
  }

  // Digital Maturity
  if (
    section ===
    "Digital Maturity Assessment"
  ) {
    return (
      <DigitalMaturityReport
        data={reportData}
        brandName={companyName}
        assessmentId={section}
        reportType="detailed"
        responses={responses}
        questions={questions}
      />
    );
  }

  /*
   * Default inline report view for any supported
   * report schema without a dedicated wrapper.
   */
  const report =
    analysis?.result as any;

  const generatedAt =
    analysis?.createdAt
      ? new Date(
          analysis.createdAt,
        ).toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "long",
            year: "numeric",
          },
        )
      : null;

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 md:flex-row">
      <Sidebar user={user} />

      <main className="flex-1 p-4 sm:p-8 md:ml-64">
        {/* Header */}
        <motion.div
          initial={{
            opacity: 0,
            y: -20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="mb-8"
        >
          <Link
            to="/reports"
            className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition-colors hover:text-blue-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Reports
          </Link>

          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
              <FileText className="h-7 w-7 text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {section}
              </h1>

              <p className="mt-1 text-sm font-medium text-slate-600">
                Prepared for{" "}
                <span className="font-semibold text-slate-800">
                  {companyName}
                </span>
              </p>

              {generatedAt && (
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  <Calendar className="h-4 w-4" />
                  Generated on{" "}
                  {generatedAt}
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {!report ||
        report.status ===
          "pending_generation" ? (
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="rounded-2xl border border-amber-200 bg-white p-12 text-center shadow-lg"
          >
            <Clock className="mx-auto mb-4 h-16 w-16 text-amber-400" />

            <h3 className="mb-2 text-xl font-bold text-slate-900">
              Report Generation In
              Progress
            </h3>

            <p className="mx-auto max-w-md text-slate-600">
              Your report is being
              generated. This usually
              takes a few minutes.
              Please check back
              shortly.
            </p>

            <Link
              to="/reports"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all hover:bg-blue-700"
            >
              Return to Reports
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Executive Summary */}
            {report.executiveSummary && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.05,
                }}
                className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white shadow-xl"
              >
                <div className="mb-4 flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6" />

                  <h2 className="text-xl font-bold">
                    Executive Summary
                  </h2>
                </div>

                <p className="text-base leading-relaxed text-blue-100">
                  {
                    report.executiveSummary
                  }
                </p>
              </motion.div>
            )}

            {/* Company Profile */}
            {report.companyProfile && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.1,
                }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Company Profile
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      label:
                        "Overview",

                      value:
                        report
                          .companyProfile
                          .overview,
                    },
                    {
                      label:
                        "Industry Context",

                      value:
                        report
                          .companyProfile
                          .industryContext,
                    },
                    {
                      label:
                        "Workforce Analysis",

                      value:
                        report
                          .companyProfile
                          .workforceAnalysis,
                    },
                  ].map(
                    (
                      item,
                    ) => (
                      <div
                        key={
                          item.label
                        }
                        className="rounded-xl bg-slate-50 p-4"
                      >
                        <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                          {
                            item.label
                          }
                        </p>

                        <p className="text-sm leading-relaxed text-slate-700">
                          {
                            item.value
                          }
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </motion.div>
            )}

            {/* HR Maturity Assessment */}
            {report.hrMaturityAssessment && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.15,
                }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    HR Maturity
                    Assessment
                  </h2>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="flex items-center gap-6 rounded-xl bg-slate-50 p-6">
                    <div className="relative h-24 w-24 flex-shrink-0">
                      <svg
                        className="h-24 w-24 -rotate-90"
                        viewBox="0 0 36 36"
                      >
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
                          strokeDasharray={`${report.hrMaturityAssessment.score} ${
                            100 -
                            report
                              .hrMaturityAssessment
                              .score
                          }`}
                          strokeLinecap="round"
                        />
                      </svg>

                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-900">
                          {
                            report
                              .hrMaturityAssessment
                              .score
                          }
                        </span>

                        <span className="text-xs text-slate-500">
                          /100
                        </span>
                      </div>
                    </div>

                    <div>
                      <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Maturity Level
                      </p>

                      <p className="text-lg font-bold text-emerald-600">
                        {
                          report
                            .hrMaturityAssessment
                            .currentMaturityLevel
                        }
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Key Strengths
                      </p>

                      <ul className="space-y-1">
                        {report.hrMaturityAssessment.keyStrengths?.map(
                          (
                            strength:
                              string,
                            index:
                              number,
                          ) => (
                            <li
                              key={
                                index
                              }
                              className="flex items-start gap-2 text-sm text-slate-700"
                            >
                              <span className="mt-0.5 text-emerald-500">
                                •
                              </span>

                              {
                                strength
                              }
                            </li>
                          ),
                        )}
                      </ul>
                    </div>

                    <div>
                      <p className="mb-2 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-600">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Critical Gaps
                      </p>

                      <ul className="space-y-1">
                        {report.hrMaturityAssessment.criticalGaps?.map(
                          (
                            gap:
                              string,
                            index:
                              number,
                          ) => (
                            <li
                              key={
                                index
                              }
                              className="flex items-start gap-2 text-sm text-slate-700"
                            >
                              <span className="mt-0.5 text-rose-400">
                                •
                              </span>

                              {gap}
                            </li>
                          ),
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
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.2,
                }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Transformation
                    Readiness
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-center">
                    <p className="mb-1 text-4xl font-bold text-blue-700">
                      {
                        report
                          .transformationReadiness
                          .readinessScore
                      }

                      <span className="text-lg text-blue-400">
                        /100
                      </span>
                    </p>

                    <p className="text-sm font-bold text-blue-600">
                      {
                        report
                          .transformationReadiness
                          .readinessLevel
                      }
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="mb-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-emerald-600">
                      <CheckCircle className="h-3.5 w-3.5" />
                      Enablers
                    </p>

                    <ul className="space-y-1">
                      {report.transformationReadiness.enablers?.map(
                        (
                          enabler:
                            string,
                          index:
                            number,
                        ) => (
                          <li
                            key={
                              index
                            }
                            className="flex items-start gap-2 text-sm text-slate-700"
                          >
                            <span className="mt-0.5 text-emerald-500">
                              +
                            </span>

                            {enabler}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="mb-3 flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-rose-600">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Barriers
                    </p>

                    <ul className="space-y-1">
                      {report.transformationReadiness.barriers?.map(
                        (
                          barrier:
                            string,
                          index:
                            number,
                        ) => (
                          <li
                            key={
                              index
                            }
                            className="flex items-start gap-2 text-sm text-slate-700"
                          >
                            <span className="mt-0.5 text-rose-400">
                              -
                            </span>

                            {barrier}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Strategic Recommendations */}
            {report.strategicRecommendations && (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.25,
                }}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
              >
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100">
                    <Lightbulb className="h-5 w-5 text-amber-600" />
                  </div>

                  <h2 className="text-xl font-bold text-slate-900">
                    Strategic
                    Recommendations
                  </h2>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      label:
                        "Immediate (0–3 months)",

                      items:
                        report
                          .strategicRecommendations
                          .immediate,

                      background:
                        "bg-rose-50",

                      border:
                        "border-rose-100",

                      text:
                        "text-rose-600",
                    },
                    {
                      label:
                        "Short-term (3–12 months)",

                      items:
                        report
                          .strategicRecommendations
                          .shortTerm,

                      background:
                        "bg-amber-50",

                      border:
                        "border-amber-100",

                      text:
                        "text-amber-600",
                    },
                    {
                      label:
                        "Long-term (12+ months)",

                      items:
                        report
                          .strategicRecommendations
                          .longTerm,

                      background:
                        "bg-blue-50",

                      border:
                        "border-blue-100",

                      text:
                        "text-blue-600",
                    },
                  ].map(
                    (
                      phase,
                    ) => (
                      <div
                        key={
                          phase.label
                        }
                        className={`${phase.background} ${phase.border} rounded-xl border p-5`}
                      >
                        <p
                          className={`mb-3 text-xs font-bold uppercase tracking-wider ${phase.text}`}
                        >
                          {
                            phase.label
                          }
                        </p>

                        <ul className="space-y-2">
                          {phase.items?.map(
                            (
                              item:
                                string,
                              index:
                                number,
                            ) => (
                              <li
                                key={
                                  index
                                }
                                className="flex items-start gap-2 text-sm text-slate-700"
                              >
                                <span
                                  className={`${phase.text} mt-0.5 flex-shrink-0 font-bold`}
                                >
                                  {index +
                                    1}
                                  .
                                </span>

                                {
                                  item
                                }
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    ),
                  )}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}