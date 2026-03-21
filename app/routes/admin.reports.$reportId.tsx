import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import {
    ArrowLeftIcon, CheckCircleIcon, ClockIcon, BuildingOffice2Icon,
    CalendarIcon, PrinterIcon, ArrowDownTrayIcon, ChartBarIcon,
    LightBulbIcon, RocketLaunchIcon, ExclamationTriangleIcon,
    ShieldCheckIcon, CurrencyRupeeIcon, MapIcon, StarIcon,
    XCircleIcon
} from "@heroicons/react/24/outline";

interface ReportData {
    reportId: string;
    companyId: string;
    companyName: string;
    engineName: string;
    submittedAt: string;
    status: "pending" | "approved" | "rejected";
    result: any;
    assessmentId: string;
}

export const loader: LoaderFunction = async ({ params }) => {
    let reportId = params.reportId;

    if (!reportId) {
        throw new Response("Report ID not provided", { status: 400 });
    }

    reportId = decodeURIComponent(reportId);
    console.log(`🔍 Viewing Report ID: ${reportId}`);

    const { getDynamoDBDocumentClient } = await import("~/lib/dynamodb.server");
    const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");
    const { getCompanyProfile } = await import("~/models/company.model.server");

    const ddbDocClient = getDynamoDBDocumentClient();
    const USERS_TABLE = process.env.DYNAMODB_ASSESSMENTS_TABLE || process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

    const scanCommand = new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "sk = :sk",
        ExpressionAttributeValues: { ":sk": reportId }
    });

    const { Items } = await ddbDocClient.send(scanCommand);

    if (!Items || Items.length === 0) {
        throw new Response("Report not found", { status: 404 });
    }

    const reportItem = Items[0];
    const companyId = reportItem.pk.replace("COMPANY#", "");

    let companyName = "Unknown Company";
    try {
        const profile = await getCompanyProfile(companyId);
        if (profile) companyName = profile.company_name || profile.brand_name || companyId;
    } catch (e) {
        console.error(`Failed to fetch profile for ${companyId}`, e);
    }

    const report: ReportData = {
        reportId: reportItem.sk,
        companyId,
        companyName,
        engineName: reportItem.section || "Unknown Engine",
        submittedAt: reportItem.createdAt || new Date().toISOString(),
        status: reportItem.status || "approved",
        result: reportItem.result || {},
        assessmentId: reportItem.assessment_id || ""
    };

    return json({ report });
};

// ─────────────────────────────────────────────
// Helper: extract top-level fields from result
// ─────────────────────────────────────────────
function parseResult(result: any) {
    // Handle nested result.result
    const r = result?.result ?? result ?? {};

    const execSummary       = r.executive_summary ?? r.consulting_report?.executive_summary ?? null;
    const maturityAnalysis  = r.maturity_analysis ?? null;
    const dimScores         = r.maturity_analysis?.dimensional_scores ?? r.maturity_scorecard ?? [];
    const strategicInsights = r.strategic_insights ?? r.visualization_data?.strategic_insights ?? null;
    const detailedRecs      = r.detailed_recommendations ?? r.visualization_data?.detailed_recommendations ?? null;
    const consultingReport  = r.consulting_report ?? null;
    const roadmap           = r.transformation_roadmap ?? consultingReport?.transformation_roadmap ?? [];
    const dimDeepDives      = r.dimension_deep_dives ?? consultingReport?.dimension_deep_dives ?? [];
    const investmentInd     = r.investment_indication ?? consultingReport?.investment_indication ?? [];
    const readinessMetrics  = r.readiness_metrics ?? r.visualization_data?.readiness_metrics ?? [];

    return { execSummary, maturityAnalysis, dimScores, strategicInsights, detailedRecs, consultingReport, roadmap, dimDeepDives, investmentInd, readinessMetrics };
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle, color = "indigo" }: { icon: any; title: string; subtitle?: string; color?: string }) {
    const colorMap: Record<string, string> = {
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-500",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-500",
        amber: "bg-amber-50 text-amber-600 border-amber-500",
        rose: "bg-rose-50 text-rose-600 border-rose-500",
        blue: "bg-blue-50 text-blue-600 border-blue-500",
        purple: "bg-purple-50 text-purple-600 border-purple-500",
        cyan: "bg-cyan-50 text-cyan-600 border-cyan-500",
    };
    const cls = colorMap[color] || colorMap.indigo;
    const [bg, text, border] = cls.split(" ");
    return (
        <div className={`flex items-center gap-4 mb-6 pb-4 border-b-2 ${border}`}>
            <div className={`p-2.5 rounded-xl ${bg} ${text} print:hidden`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h2 className={`text-xl font-black tracking-tight ${text} uppercase`}>{title}</h2>
                {subtitle && <p className="text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
            </div>
        </div>
    );
}

function ScoreBar({ label, score, maxScore = 5, color = "#6366f1" }: { label: string; score: number; maxScore?: number; color?: string }) {
    const pct = Math.min((score / maxScore) * 100, 100);
    const scoreColor = score >= 4 ? "#10b981" : score >= 3 ? "#3b82f6" : score >= 2 ? "#f59e0b" : "#ef4444";
    return (
        <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-slate-700">{label}</span>
                <span className="text-sm font-black" style={{ color: scoreColor }}>
                    {typeof score === "number" ? (score > 5 ? (score).toFixed(0) + "%" : score.toFixed(1) + "/5") : score}
                </span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: scoreColor }}
                />
            </div>
        </div>
    );
}

function Badge({ text, variant = "default" }: { text: string; variant?: "default" | "success" | "warning" | "danger" | "info" }) {
    const cls = {
        default: "bg-slate-100 text-slate-700",
        success: "bg-emerald-50 text-emerald-700 border border-emerald-100",
        warning: "bg-amber-50 text-amber-700 border border-amber-100",
        danger: "bg-rose-50 text-rose-700 border border-rose-100",
        info: "bg-blue-50 text-blue-700 border border-blue-100",
    }[variant];
    return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${cls}`}>{text}</span>;
}

function BulletList({ items, color = "indigo" }: { items: string[]; color?: string }) {
    const dotColor: Record<string, string> = {
        indigo: "bg-indigo-500", emerald: "bg-emerald-500",
        amber: "bg-amber-500", rose: "bg-rose-500",
        blue: "bg-blue-500", purple: "bg-purple-500",
    };
    return (
        <ul className="space-y-2">
            {items.filter(Boolean).map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${dotColor[color] || dotColor.indigo}`} />
                    <span className="text-sm text-slate-700 font-medium leading-relaxed">{item}</span>
                </li>
            ))}
        </ul>
    );
}

function InfoCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
    return (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</div>
            <div className="text-2xl font-black text-slate-900 tracking-tight">{value}</div>
            {sub && <div className="text-xs font-medium text-slate-500 mt-1">{sub}</div>}
        </div>
    );
}

function PageDivider({ page, total }: { page: number; total: number }) {
    return (
        <div className="flex items-center gap-4 my-10 print:my-8">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">Page {page} of {total}</span>
            <div className="flex-1 h-px bg-slate-100" />
        </div>
    );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function AdminReportView() {
    const { report } = useLoaderData<{ report: ReportData }>();
    const [isExporting, setIsExporting] = useState(false);

    const { execSummary, maturityAnalysis, dimScores, strategicInsights, detailedRecs, consultingReport, roadmap, dimDeepDives, investmentInd, readinessMetrics } = parseResult(report.result);

    const overallScore = maturityAnalysis?.overall_score?.weighted_score
        ?? maturityAnalysis?.overall_score?.raw_score
        ?? execSummary?.overall_maturity_index
        ?? "—";

    const maturityCategory = execSummary?.maturity_category
        ?? maturityAnalysis?.overall_score?.category
        ?? "Strategic Baseline";

    const readinessScore = strategicInsights?.transformation_readiness?.score ?? null;

    const statusBadgeProps: Record<string, { variant: "success" | "warning" | "danger"; label: string }> = {
        approved: { variant: "success", label: "Approved" },
        pending: { variant: "warning", label: "Pending Review" },
        rejected: { variant: "danger", label: "Rejected" },
    };
    const statusBadge = statusBadgeProps[report.status] || statusBadgeProps.approved;

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            const { downloadPDF } = await import("~/services/report-pdf.client");
            downloadPDF({ companyName: report.companyName, engineName: report.engineName, generatedDate: report.submittedAt, result: report.result });
        } catch (e) {
            alert("Failed to generate PDF.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 print:bg-white">
            {/* Top Nav Bar — hidden on print */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-100 shadow-sm print:hidden">
                <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
                    <Link to="/admin/reports" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors">
                        <ArrowLeftIcon className="w-4 h-4" />
                        Back to Reports
                    </Link>
                    <div className="flex items-center gap-2">
                        <Badge text={statusBadge.label} variant={statusBadge.variant} />
                        <button
                            onClick={() => window.print()}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-200 transition-all"
                        >
                            <PrinterIcon className="w-4 h-4" />
                            Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            disabled={isExporting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                        >
                            <ArrowDownTrayIcon className="w-4 h-4" />
                            {isExporting ? "Generating…" : "PDF"}
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-10 space-y-0 print:px-0 print:py-0">

                {/* ═══════════════════════════════════════
                    PAGE 1 — COVER
                ═══════════════════════════════════════ */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8 print:rounded-none print:shadow-none print:border-0 print:mb-0 print:min-h-screen print:flex print:flex-col print:justify-between">
                    {/* Color band */}
                    <div className="h-2 bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-500" />

                    <div className="p-10 print:p-12 flex-1">
                        {/* Logo + Brand */}
                        <div className="flex items-center justify-between mb-12">
                            <div className="flex items-center gap-3">
                                <img src="/hrtek_logo.png" alt="HRTek" className="h-10 w-auto" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                <div>
                                    <div className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">HRTek Systems</div>
                                    <div className="text-[10px] text-slate-400 font-medium">Confidential Advisory Report</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Generated</div>
                                <div className="text-xs font-bold text-slate-600">
                                    {new Date(report.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                </div>
                            </div>
                        </div>

                        {/* Title block */}
                        <div className="mb-12">
                            <div className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
                                AI Transformation Intelligence
                            </div>
                            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight mb-2 print:text-5xl">
                                {report.engineName}
                            </h1>
                            <h2 className="text-2xl font-bold text-indigo-600">{report.companyName}</h2>
                        </div>

                        {/* Key Metrics Row */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                            <InfoCard
                                label="Maturity Score"
                                value={typeof overallScore === "number" ? `${overallScore > 5 ? overallScore.toFixed(0) : overallScore.toFixed(1)}${overallScore > 5 ? "%" : "/5"}` : String(overallScore)}
                                sub="Overall Index"
                            />
                            <InfoCard label="Category" value={maturityCategory} sub="Classification" />
                            {readinessScore !== null && (
                                <InfoCard label="Readiness" value={`${readinessScore}%`} sub="Transformation" />
                            )}
                            <InfoCard label="Engine" value={report.engineName.split(" ").slice(0, 2).join(" ")} sub="Assessment Type" />
                        </div>

                        {/* Company meta */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-slate-100">
                            <div className="flex items-start gap-3">
                                <BuildingOffice2Icon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Client</div>
                                    <div className="text-sm font-bold text-slate-900">{report.companyName}</div>
                                    <div className="text-[10px] text-slate-400 font-mono">{report.companyId}</div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CalendarIcon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Report Date</div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {new Date(report.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircleIcon className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</div>
                                    <Badge text={statusBadge.label} variant={statusBadge.variant} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cover footer */}
                    <div className="bg-slate-900 px-10 py-4 flex items-center justify-between print:px-12">
                        <div className="text-[9px] text-slate-500 uppercase tracking-[0.2em] font-bold">Strictly Confidential</div>
                        <div className="text-[9px] text-slate-500">© {new Date().getFullYear()} HRTek Systems Pvt. Ltd.</div>
                    </div>
                </div>

                <PageDivider page={1} total={10} />

                {/* ═══════════════════════════════════════
                    PAGE 2 — EXECUTIVE SUMMARY
                ═══════════════════════════════════════ */}
                {execSummary && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 mb-8 print:rounded-none print:shadow-none print:border-0 print:page-break-before-always">
                        <SectionHeader icon={StarIcon} title="Executive Summary" subtitle="Board-level strategic overview" color="indigo" />

                        {execSummary.executive_recommendation && (
                            <div className="bg-indigo-50 border-l-4 border-indigo-500 rounded-r-2xl p-6 mb-8">
                                <div className="text-[9px] font-black text-indigo-500 uppercase tracking-widest mb-2">Strategic Recommendation</div>
                                <p className="text-slate-800 font-medium leading-relaxed text-sm">{execSummary.executive_recommendation}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {execSummary.key_observations?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                                        <LightBulbIcon className="w-4 h-4 text-amber-500" /> Key Observations
                                    </h3>
                                    <BulletList items={execSummary.key_observations} color="indigo" />
                                </div>
                            )}
                            {execSummary.what_this_means?.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                                        <ChartBarIcon className="w-4 h-4 text-indigo-500" /> What This Means
                                    </h3>
                                    <BulletList items={execSummary.what_this_means} color="blue" />
                                </div>
                            )}
                        </div>

                        {execSummary.maturity_stage_description && (
                            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Maturity Stage Description</div>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{execSummary.maturity_stage_description}</p>
                            </div>
                        )}
                    </div>
                )}

                <PageDivider page={2} total={10} />

                {/* ═══════════════════════════════════════
                    PAGE 3 — MATURITY SCORECARD
                ═══════════════════════════════════════ */}
                {dimScores?.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 mb-8 print:rounded-none print:shadow-none print:border-0 print:page-break-before-always">
                        <SectionHeader icon={ChartBarIcon} title="Maturity Scorecard" subtitle="Dimensional performance across all assessed areas" color="blue" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            {dimScores.map((item: any, i: number) => {
                                const label = item.dimension ?? item.name ?? `Dimension ${i + 1}`;
                                const raw = item.weighted_score ?? item.raw_score ?? item.score ?? item.current_percentage ?? 0;
                                const score = raw > 5 ? raw / 20 : raw;
                                return <ScoreBar key={i} label={label} score={score} maxScore={5} />;
                            })}
                        </div>

                        {maturityAnalysis?.overall_score && (
                            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { label: "Weighted Score", value: maturityAnalysis.overall_score.weighted_score?.toFixed(2) },
                                    { label: "Raw Score", value: maturityAnalysis.overall_score.raw_score?.toFixed(2) },
                                    { label: "Percentage", value: maturityAnalysis.overall_score.percentage ? `${maturityAnalysis.overall_score.percentage.toFixed(1)}%` : null },
                                    { label: "Category", value: maturityAnalysis.overall_score.category ?? maturityCategory },
                                ].filter(m => m.value).map((m, i) => (
                                    <div key={i} className="bg-indigo-50 rounded-2xl p-4 text-center border border-indigo-100">
                                        <div className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1">{m.label}</div>
                                        <div className="text-lg font-black text-indigo-700">{m.value}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <PageDivider page={3} total={10} />

                {/* ═══════════════════════════════════════
                    PAGE 4 — TRANSFORMATION READINESS
                ═══════════════════════════════════════ */}
                {strategicInsights && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 mb-8 print:rounded-none print:shadow-none print:border-0 print:page-break-before-always">
                        <SectionHeader icon={RocketLaunchIcon} title="Transformation Readiness" subtitle="Organizational capacity for change and digital transformation" color="emerald" />

                        {strategicInsights.transformation_readiness && (
                            <>
                                <div className="flex flex-col md:flex-row items-start gap-8 mb-8">
                                    {/* Score Ring */}
                                    <div className="flex flex-col items-center bg-emerald-50 rounded-3xl p-8 border border-emerald-100 min-w-[160px]">
                                        <div className="text-5xl font-black text-emerald-600 mb-1">
                                            {strategicInsights.transformation_readiness.score ?? "—"}
                                        </div>
                                        <div className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-2">Readiness Score</div>
                                        <Badge
                                            text={strategicInsights.transformation_readiness.readiness_level ?? "Moderate"}
                                            variant={
                                                (strategicInsights.transformation_readiness.readiness_level ?? "").toLowerCase() === "high" ? "success" :
                                                (strategicInsights.transformation_readiness.readiness_level ?? "").toLowerCase() === "moderate" ? "warning" : "danger"
                                            }
                                        />
                                    </div>

                                    <div className="flex-1 space-y-6">
                                        {strategicInsights.transformation_readiness.enabling_factors?.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-black text-emerald-700 uppercase tracking-tight mb-3 flex items-center gap-2">
                                                    <ShieldCheckIcon className="w-4 h-4" /> Enabling Factors
                                                </h3>
                                                <BulletList items={strategicInsights.transformation_readiness.enabling_factors} color="emerald" />
                                            </div>
                                        )}
                                        {strategicInsights.transformation_readiness.blocking_factors?.length > 0 && (
                                            <div>
                                                <h3 className="text-sm font-black text-rose-700 uppercase tracking-tight mb-3 flex items-center gap-2">
                                                    <ExclamationTriangleIcon className="w-4 h-4" /> Blocking Factors
                                                </h3>
                                                <BulletList items={strategicInsights.transformation_readiness.blocking_factors} color="rose" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}

                        {strategicInsights.maturity_stage_description && (
                            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Maturity Context</div>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium">{strategicInsights.maturity_stage_description}</p>
                            </div>
                        )}

                        {strategicInsights.key_findings?.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Key Findings</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {strategicInsights.key_findings.map((finding: string, i: number) => (
                                        <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-black flex-shrink-0">{i + 1}</div>
                                            <p className="text-sm text-slate-700 font-medium leading-relaxed">{finding}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <PageDivider page={4} total={10} />

                {/* ═══════════════════════════════════════
                    PAGE 5 — DIMENSION DEEP DIVES
                ═══════════════════════════════════════ */}
                {dimDeepDives?.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 mb-8 print:rounded-none print:shadow-none print:border-0 print:page-break-before-always">
                        <SectionHeader icon={ChartBarIcon} title="Dimension Deep Dives" subtitle="Granular analysis per strategic dimension" color="purple" />

                        <div className="space-y-8">
                            {dimDeepDives.map((dim: any, i: number) => (
                                <div key={i} className="border border-slate-100 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                        <h3 className="font-black text-slate-900 tracking-tight">{dim.dimension ?? dim.name ?? `Dimension ${i + 1}`}</h3>
                                        {(dim.score ?? dim.current_score) !== undefined && (
                                            <Badge text={`Score: ${Number(dim.score ?? dim.current_score).toFixed(1)}`} variant="info" />
                                        )}
                                    </div>
                                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {dim.current_state?.length > 0 && (
                                            <div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Current State</div>
                                                <BulletList items={Array.isArray(dim.current_state) ? dim.current_state : [dim.current_state]} color="amber" />
                                            </div>
                                        )}
                                        {dim.recommendations?.length > 0 && (
                                            <div>
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Recommendations</div>
                                                <BulletList items={Array.isArray(dim.recommendations) ? dim.recommendations : [dim.recommendations]} color="indigo" />
                                            </div>
                                        )}
                                        {dim.gap_analysis && (
                                            <div className="md:col-span-2">
                                                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Gap Analysis</div>
                                                <p className="text-sm text-slate-700 font-medium">{typeof dim.gap_analysis === "string" ? dim.gap_analysis : JSON.stringify(dim.gap_analysis)}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <PageDivider page={5} total={10} />

                {/* ═══════════════════════════════════════
                    PAGE 6 — STRATEGIC RECOMMENDATIONS
                ═══════════════════════════════════════ */}
                {detailedRecs && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 mb-8 print:rounded-none print:shadow-none print:border-0 print:page-break-before-always">
                        <SectionHeader icon={LightBulbIcon} title="Detailed Recommendations" subtitle="Prioritized action plan across three horizons" color="amber" />

                        <div className="space-y-6">
                            {[
                                { key: "immediate_actions", label: "Immediate Actions", horizon: "0–3 Months", color: "rose" },
                                { key: "short_term_actions", label: "Short-term Actions", horizon: "3–12 Months", color: "amber" },
                                { key: "long_term_actions", label: "Long-term Actions", horizon: "12–36 Months", color: "emerald" },
                            ].map(({ key, label, horizon, color }) => {
                                const section = detailedRecs[key];
                                if (!section) return null;
                                const actions: string[] = section.actions?.map((a: any) => typeof a === "string" ? a : a.action || a.title || JSON.stringify(a)) ?? (Array.isArray(section) ? section.map((a: any) => typeof a === "string" ? a : a.action ?? JSON.stringify(a)) : []);
                                if (!actions.length) return null;
                                const borderColor: Record<string, string> = { rose: "border-rose-200 bg-rose-50", amber: "border-amber-200 bg-amber-50", emerald: "border-emerald-200 bg-emerald-50" };
                                const textColor: Record<string, string> = { rose: "text-rose-700", amber: "text-amber-700", emerald: "text-emerald-700" };
                                return (
                                    <div key={key} className={`border rounded-2xl overflow-hidden`}>
                                        <div className={`px-6 py-3 flex items-center justify-between ${borderColor[color]}`}>
                                            <h3 className={`font-black text-sm uppercase tracking-tight ${textColor[color]}`}>{label}</h3>
                                            <Badge text={horizon} variant={color === "rose" ? "danger" : color === "amber" ? "warning" : "success"} />
                                        </div>
                                        <div className="p-6">
                                            <ol className="space-y-3">
                                                {actions.map((action: string, i: number) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-xs font-black flex items-center justify-center">{i + 1}</span>
                                                        <span className="text-sm text-slate-700 font-medium leading-relaxed">{action}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <PageDivider page={6} total={10} />

                {/* ═══════════════════════════════════════
                    PAGE 7 — TRANSFORMATION ROADMAP
                ═══════════════════════════════════════ */}
                {roadmap?.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 mb-8 print:rounded-none print:shadow-none print:border-0 print:page-break-before-always">
                        <SectionHeader icon={MapIcon} title="Transformation Roadmap" subtitle="Phased execution plan for digital and HR transformation" color="cyan" />

                        <div className="relative">
                            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100 print:hidden" />
                            <div className="space-y-8">
                                {roadmap.map((phase: any, i: number) => (
                                    <div key={i} className="relative pl-14 print:pl-0">
                                        <div className="absolute left-3 top-1 w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center shadow-lg print:hidden">
                                            {i + 1}
                                        </div>
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                                            <div className="flex items-center gap-3 mb-4">
                                                <h3 className="font-black text-slate-900 tracking-tight">{phase.phase ?? `Phase ${i + 1}`}</h3>
                                                {phase.timeline && <Badge text={phase.timeline} variant="info" />}
                                                {phase.focus && <Badge text={phase.focus} variant="default" />}
                                            </div>
                                            {phase.actions?.length > 0 && (
                                                <BulletList items={phase.actions} color="indigo" />
                                            )}
                                            {phase.deliverables?.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Deliverables</div>
                                                    <BulletList items={phase.deliverables} color="emerald" />
                                                </div>
                                            )}
                                            {phase.success_metrics?.length > 0 && (
                                                <div className="mt-4 pt-4 border-t border-slate-100">
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Success Metrics</div>
                                                    <BulletList items={phase.success_metrics} color="blue" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <PageDivider page={7} total={10} />

                {/* ═══════════════════════════════════════
                    PAGE 8 — INVESTMENT & ROI
                ═══════════════════════════════════════ */}
                {(investmentInd?.length > 0 || consultingReport?.roi_analysis) && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 mb-8 print:rounded-none print:shadow-none print:border-0 print:page-break-before-always">
                        <SectionHeader icon={CurrencyRupeeIcon} title="Investment & ROI Projections" subtitle="Financial outlook and return on transformation investment" color="emerald" />

                        {investmentInd?.length > 0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {investmentInd.map((item: any, i: number) => (
                                    <InfoCard key={i} label={item.label ?? `Metric ${i + 1}`} value={String(item.value ?? item.amount ?? "—")} sub={item.sub ?? item.period ?? ""} />
                                ))}
                            </div>
                        )}

                        {consultingReport?.roi_analysis && (
                            <div className="space-y-4">
                                {Object.entries(consultingReport.roi_analysis).map(([key, value]) => (
                                    <div key={key} className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <div className="flex-1">
                                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{key.replace(/_/g, " ")}</div>
                                            <p className="text-sm font-medium text-slate-700">{typeof value === "object" ? JSON.stringify(value) : String(value)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <PageDivider page={8} total={10} />

                {/* ═══════════════════════════════════════
                    PAGE 9 — READINESS METRICS
                ═══════════════════════════════════════ */}
                {readinessMetrics?.length > 0 && (
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 mb-8 print:rounded-none print:shadow-none print:border-0 print:page-break-before-always">
                        <SectionHeader icon={ShieldCheckIcon} title="Strategic Readiness Matrices" subtitle="Cross-functional capability assessments" color="rose" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {readinessMetrics.map((metric: any, i: number) => (
                                <div key={i} className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-black text-slate-900 text-sm tracking-tight">{metric.label}</h4>
                                        <Badge
                                            text={metric.status ?? "TBD"}
                                            variant={metric.score >= 4 ? "success" : metric.score >= 3 ? "info" : "warning"}
                                        />
                                    </div>
                                    <ScoreBar label="" score={metric.score ?? 0} maxScore={5} />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <PageDivider page={9} total={10} />

                {/* ═══════════════════════════════════════
                    PAGE 10 — APPENDIX / RAW INSIGHTS
                ═══════════════════════════════════════ */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-10 mb-8 print:rounded-none print:shadow-none print:border-0 print:page-break-before-always">
                    <SectionHeader icon={ChartBarIcon} title="Appendix — Additional Insights" subtitle="Supplementary AI-generated analysis data" color="indigo" />

                    {/* Render any top-level fields not already covered */}
                    {(() => {
                        const r = report.result?.result ?? report.result ?? {};
                        const handled = new Set(["executive_summary", "maturity_analysis", "strategic_insights", "detailed_recommendations", "consulting_report", "transformation_roadmap", "dimension_deep_dives", "investment_indication", "readiness_metrics", "maturity_scorecard", "visualization_data"]);
                        const remaining = Object.entries(r).filter(([k]) => !handled.has(k));
                        if (!remaining.length) return <p className="text-slate-400 text-sm font-medium italic">All data has been presented in the sections above.</p>;
                        return (
                            <div className="space-y-6">
                                {remaining.map(([key, value]) => (
                                    <div key={key} className="border border-slate-100 rounded-2xl overflow-hidden">
                                        <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
                                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-tight">{key.replace(/_/g, " ")}</h3>
                                        </div>
                                        <div className="p-6">
                                            {typeof value === "string" ? (
                                                <p className="text-sm text-slate-700 font-medium leading-relaxed">{value}</p>
                                            ) : Array.isArray(value) ? (
                                                <BulletList items={value.map((v: any) => typeof v === "string" ? v : JSON.stringify(v))} color="indigo" />
                                            ) : (
                                                <pre className="text-xs text-slate-600 bg-slate-50 p-4 rounded-xl overflow-x-auto border border-slate-100 font-mono">
                                                    {JSON.stringify(value, null, 2)}
                                                </pre>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* ═══════════════════════════════════════
                    FINAL FOOTER
                ═══════════════════════════════════════ */}
                <div className="bg-slate-900 rounded-3xl p-8 text-center print:rounded-none print:fixed print:bottom-0 print:left-0 print:right-0">
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">
                        Generated by HRTek Systems • AI Transformation Intelligence Platform
                    </div>
                    <div className="text-[9px] text-slate-600">
                        This report is confidential and intended solely for {report.companyName}. Unauthorized distribution is prohibited.
                    </div>
                </div>
            </div>

            {/* Print-specific styles */}
            <style>{`
                @media print {
                    @page { size: A4; margin: 20mm; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .print\\:page-break-before-always { page-break-before: always; }
                }
            `}</style>
        </div>
    );
}
