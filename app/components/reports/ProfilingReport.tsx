import React from "react";
import { Link } from "@remix-run/react";
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
  Calendar,
  Clock,
  Lightbulb,
} from "lucide-react";
import Sidebar from "../DashboardComponents/Sidebar";

interface ProfilingReportProps {
  data: any;
  user: any;
  brandName: string;
  assessmentId?: string;
}

export default function ProfilingReport({
  data,
  user,
  brandName,
  assessmentId,
}: ProfilingReportProps) {
  let report = data?.result || {};

  // Fallback adapter for alternative AI response schemas to map cleanly to profiling schema.
  // The profiling report expects: executiveSummary, companyProfile, hrMaturityAssessment,
  // transformationReadiness, strategicRecommendations. We handle three known schemas:
  //   1. digital_maturity prompt schema (maturity_analysis, strategic_insights, detailed_recommendations)
  //   2. overallAssessment schema (overallAssessment, dimensionScores, optimizationRoadmap)
  //   3. Direct profiling schema (already in correct format — no mapping needed)
  if (!report.executiveSummary && (report.maturity_analysis || report.dimensionScores || report.overallAssessment || report.strategic_insights)) {

    // --- Schema 1: digital_maturity prompt (snake_case field names) ---
    if (report.maturity_analysis) {
      const overallScore = report.maturity_analysis?.overall_score || {};
      const dimScores = report.maturity_analysis?.dimensional_scores || [];
      const insights = report.strategic_insights || {};
      const readiness = insights.transformation_readiness || {};
      const detailedRecs = report.detailed_recommendations || {};
      const immediateActions = detailedRecs.immediate_actions?.actions || detailedRecs.immediate_actions || [];
      const shortTermActions = detailedRecs.short_term_initiatives?.actions || [];
      const orgProfile = report.organization_profile || {};

      let score = 50;
      if (overallScore.percentage !== undefined) {
        score = Math.round(Number(overallScore.percentage));
      } else if (overallScore.weighted_score !== undefined) {
        const raw = Number(overallScore.weighted_score);
        score = raw <= 5 ? Math.round(raw * 20) : Math.round(raw);
      }

      // Extract strengths and gaps from dimensional scores
      const strengths: string[] = [];
      const gaps: string[] = [];
      if (Array.isArray(dimScores)) {
        dimScores.forEach((dim: any) => {
          (dim.key_strengths || []).forEach((s: string) => strengths.push(s));
          (dim.critical_gaps || []).forEach((g: string) => gaps.push(g));
        });
      }

      report = {
        executiveSummary: insights.overall_assessment || insights.maturity_stage_description || "Comprehensive digital maturity assessment completed successfully.",
        companyProfile: {
          overview: insights.overall_assessment || `Company operates in ${orgProfile.industry_sector || "the"} industry with ${orgProfile.company_size || "N/A"} employee base.`,
          industryContext: insights.competitive_position || `Industry: ${orgProfile.industry_sector || "N/A"}. Revenue: ${orgProfile.annual_revenue || "N/A"}.`,
          workforceAnalysis: `Organization size: ${orgProfile.company_size || "N/A"}. Current digital stage: ${orgProfile.current_digital_stage || "N/A"}/5.`
        },
        hrMaturityAssessment: {
          score: score,
          currentMaturityLevel: overallScore.maturity_level || "Developing",
          keyStrengths: strengths.length > 0 ? strengths.slice(0, 5) : (readiness.enabling_factors || []),
          criticalGaps: gaps.length > 0 ? gaps.slice(0, 5) : (readiness.blocking_factors || [])
        },
        transformationReadiness: {
          readinessScore: readiness.score !== undefined ? Math.round(Number(readiness.score)) : score,
          readinessLevel: readiness.readiness_level || overallScore.maturity_level || "Moderately Ready",
          enablers: readiness.enabling_factors || strengths.slice(0, 3),
          barriers: readiness.blocking_factors || gaps.slice(0, 3)
        },
        strategicRecommendations: {
          immediate: immediateActions.map((a: any) => a.action || a.name || a),
          shortTerm: shortTermActions.map((a: any) => a.action || a.name || a),
          longTerm: (report.risk_assessment?.transformation_risks || []).map((r: any) => r.mitigation_strategy || r.risk_description || r)
        }
      };
    }
    // --- Schema 2: overallAssessment / dimensionScores schema ---
    else {
      const overall = report.overallAssessment || {};
      const roadmap = report.optimizationRoadmap || {};
      const dimScores = report.dimensionScores || {};

      let score = 50;
      if (overall.totalWeightedScore !== undefined) {
        const rawScore = Number(overall.totalWeightedScore);
        score = rawScore <= 5 ? Math.round(rawScore * 20) : Math.round(rawScore);
      } else if (report.meta?.overallMaturityLevel) {
        score = Math.round(Number(report.meta.overallMaturityLevel) * 20);
      }

      report = {
        executiveSummary: overall.maturityDescription || "Comprehensive digital assessment and profiling completed successfully.",
        companyProfile: {
          overview: overall.maturityDescription || "Strategic overview generated from operational maturity analysis.",
          industryContext: `Positioning: ${overall.maturityLevel || "Active"}. Benchmark average: ${overall.industryComparison?.industryAverage || "3.2/5"}.`,
          workforceAnalysis: `Platform alignment score: ${dimScores.platformArchitecture?.score || "N/A"}/5 (${dimScores.platformArchitecture?.maturityLevel || "Defined"}).`
        },
        hrMaturityAssessment: {
          score: score,
          currentMaturityLevel: overall.maturityLevel || report.meta?.maturityLabel || "Developing",
          keyStrengths: overall.keyStrengths || dimScores.platformArchitecture?.strengths || [],
          criticalGaps: overall.criticalGaps || dimScores.platformArchitecture?.gaps || []
        },
        transformationReadiness: {
          readinessScore: score,
          readinessLevel: overall.maturityLevel || "Moderately Ready",
          enablers: overall.keyStrengths || [],
          barriers: overall.criticalGaps || []
        },
        strategicRecommendations: {
          immediate: (roadmap.immediate?.initiatives || []).map((i: any) => i.name || i),
          shortTerm: (roadmap.shortTerm?.initiatives || []).map((i: any) => i.name || i),
          longTerm: (roadmap.longTerm?.initiatives || []).map((i: any) => i.name || i)
        }
      };
    }
  }

  const generatedAt = data?.createdAt
    ? new Date(data.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 w-full">
      <Sidebar user={user} />

      <main className="flex-1 md:ml-64 p-4 sm:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                {assessmentId || "Profiling Assessment"}
              </h1>
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
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all"
            >
              Return to Dashboard
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
                  <div className="bg-blue-50 rounded-xl p-5 text-center border border-blue-100 flex flex-col justify-center">
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
