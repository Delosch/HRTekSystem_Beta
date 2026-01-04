import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getVerifiedPaymentsByCompany } from "~/models/payment.model";
// import { getLatestApprovedAdvisory } from "~/models/hti.model";
import { Brain, Download, ArrowLeft, CheckCircle, AlertTriangle, TrendingUp, Target } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { HTIReportPDF } from "~/components/HTIReportPDF";

/**
 * HTI Report View Page
 * Route: /hti/report
 * 
 * Displays the user's approved HTI advisory report
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    if (!user.organisationId) {
        return json({ error: "No organization found" }, { status: 400 });
    }

    // Payment Verification Gate
    const payments = await getVerifiedPaymentsByCompany(user.organisationId);
    // inclusive check for any HTI-related keywords
    const isPaid = payments.some(p => p.items?.some((i: any) =>
        i.engineName.includes("HTI") ||
        i.engineName.includes("Advisory") ||
        i.engineName.includes("Transformation") ||
        i.engineName.includes("Maturity")
    ));
    const isAdmin = (user as any).role === "ADMIN";

    if (!isPaid && !isAdmin) {
        // Return a cleaner error state that the component can render, or throw
        return json({
            error: "Access Denied: Payment Verification Pending. Your advisory report is generating and will be available after admin verification.",
            hasReport: false
        });
    }

    try {
        const url = new URL(request.url);
        const reportId = url.searchParams.get("id");

        let report;

        if (reportId) {
            const { getAdvisoryReport } = await import("~/models/hti.model");
            report = await getAdvisoryReport(user.organisationId, reportId);
        } else {
            const { getLatestApprovedAdvisory } = await import("~/models/hti.model");
            report = await getLatestApprovedAdvisory(user.organisationId);
        }

        if (!report) {
            return json({
                error: reportId ? "Report not found" : "No approved HTI advisory report found",
                hasReport: false
            });
        }

        return json({
            report,
            hasReport: true,
            error: null
        });
    } catch (error) {
        console.error("Error loading HTI report:", error);
        return json({
            error: "Failed to load HTI report",
            hasReport: false
        }, { status: 500 });
    }
}

export default function HTIReportView() {
    const data = useLoaderData<typeof loader>();

    if (!(data as any).hasReport || data.error) {
        return (
            <div className="min-h-screen bg-gray-50 p-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-r-lg">
                        <div className="flex items-center gap-3 mb-2">
                            <AlertTriangle className="w-6 h-6 text-yellow-600" />
                            <h2 className="text-xl font-bold text-gray-900">No HTI Report Available</h2>
                        </div>
                        <p className="text-gray-700 mb-4">{data.error}</p>
                        <Link
                            to="/hti"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Go to HTI Page
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const { report } = data as any;
    const { advisory } = report;

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Investment & ROI Section */}
            {advisory.recommendedPricing && (
                <div className="mb-12 break-inside-avoid">
                    <h2 className="text-2xl font-bold text-[#1F2A5A] mb-6 flex items-center gap-2 border-b-2 border-green-500 pb-2">
                        <span>💰</span> Recommended Investment & ROI
                    </h2>

                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100 shadow-sm">
                        <div className="flex items-start justify-between gap-8">
                            <div>
                                <h3 className="text-lg font-bold text-green-900 mb-2">
                                    {advisory.recommendedPricing.tierName}
                                </h3>
                                <p className="text-sm text-green-700 max-w-lg mb-4">
                                    Based on your organization size and complexity, this tier provides the optimal balance of advisory intelligence and cost efficiency.
                                </p>
                                <div className="inline-block bg-white rounded-lg px-4 py-2 border border-green-200">
                                    <span className="text-sm text-green-600 font-semibold mr-2">Investment:</span>
                                    <span className="text-lg font-bold text-green-800">
                                        {advisory.recommendedPricing.priceINR} / {advisory.recommendedPricing.priceUSD}
                                    </span>
                                    <span className="text-xs text-gray-500 ml-1">per year</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-4 shadow-sm border border-green-100 max-w-xs">
                                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Projected Value</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Consulting Savings</span>
                                        <span className="font-bold text-green-600">~60-70%</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Time to Insights</span>
                                        <span className="font-bold text-green-600">Instant</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Board Readiness</span>
                                        <span className="font-bold text-green-600">100%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8 px-8 shadow-lg">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Brain className="w-12 h-12" />
                            <div>
                                <h1 className="text-3xl font-bold">HTI Advisory Report</h1>
                                <p className="text-blue-100">HR Transformation Intelligence</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <PDFDownloadLink
                                document={<HTIReportPDF report={report} />}
                                fileName={`HTI_Advisory_${report.companyId}_${new Date().toISOString().split('T')[0]}.pdf`}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 rounded-lg hover:bg-blue-50 font-semibold"
                            >
                                {({ loading }) => (
                                    <>
                                        <Download className="w-4 h-4" />
                                        {loading ? 'Generating...' : 'Download PDF'}
                                    </>
                                )}
                            </PDFDownloadLink>
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 bg-blue-800 text-white rounded-lg hover:bg-blue-900"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Dashboard
                            </Link>
                        </div>
                    </div>

                    {/* Report Metadata */}
                    <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-blue-200">Generated</p>
                            <p className="font-semibold">{new Date(report.generatedAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <p className="text-blue-200">Approved</p>
                            <p className="font-semibold">{report.approvedAt ? new Date(report.approvedAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-blue-200">Status</p>
                            <p className="font-semibold flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" />
                                Approved
                            </p>
                        </div>
                        <div>
                            <p className="text-blue-200">Engines Analyzed</p>
                            <p className="font-semibold">{report.inputData?.completedEnginesCount || 5} of 5</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-8 space-y-8">
                {/* Executive Summary */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Brain className="w-6 h-6 text-blue-600" />
                        Executive Summary
                    </h2>
                    <div
                        className="text-gray-700 leading-relaxed prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: advisory.executiveSummary }}
                    />
                </div>

                {/* Current State */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Current State Assessment</h2>

                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Maturity Level</p>
                            <p className="text-xl font-bold text-blue-700">{advisory.currentState?.maturityLevel || 'N/A'}</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Digital Readiness</p>
                            <p className="text-xl font-bold text-green-700">{advisory.currentState?.digitalReadiness || 'N/A'}</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-600" />
                                Key Gaps
                            </h3>
                            <ul className="space-y-2">
                                {advisory.currentState?.keyGaps?.map((gap: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-red-500 mt-1">•</span>
                                        <span>{gap}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-600" />
                                Strengths
                            </h3>
                            <ul className="space-y-2">
                                {advisory.currentState?.strengths?.map((strength: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-700">
                                        <span className="text-green-500 mt-1">•</span>
                                        <span>{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Strategic Recommendations */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <TrendingUp className="w-6 h-6 text-blue-600" />
                        Strategic Recommendations
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        {/* NOW */}
                        <div className="border-l-4 border-green-500 pl-4">
                            <h3 className="font-bold text-green-700 mb-3">NOW (3-6 months)</h3>
                            <ul className="space-y-2">
                                {advisory.recommendations?.now?.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-green-500 font-bold">→</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* NEXT */}
                        <div className="border-l-4 border-yellow-500 pl-4">
                            <h3 className="font-bold text-yellow-700 mb-3">NEXT (6-12 months)</h3>
                            <ul className="space-y-2">
                                {advisory.recommendations?.next?.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-yellow-500 font-bold">→</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* LATER */}
                        <div className="border-l-4 border-blue-500 pl-4">
                            <h3 className="font-bold text-blue-700 mb-3">LATER (12-24 months)</h3>
                            <ul className="space-y-2">
                                {advisory.recommendations?.later?.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                        <span className="text-blue-500 font-bold">→</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Risk Flags */}
                {advisory.riskFlags && advisory.riskFlags.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                            Risk Flags
                        </h2>
                        <div className="space-y-4">
                            {advisory.riskFlags.map((risk: any, i: number) => (
                                <div key={i} className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
                                    <p className="font-semibold text-red-900 mb-2">{risk.risk}</p>
                                    <p className="text-sm text-gray-700"><strong>Mitigation:</strong> {risk.mitigation}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Dependencies */}
                {advisory.dependencies && advisory.dependencies.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Dependencies</h2>
                        <ul className="space-y-2">
                            {advisory.dependencies.map((dep: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700">
                                    <span className="text-blue-500 mt-1">•</span>
                                    <span>{dep}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Avoid Now */}
                {advisory.avoidNow && advisory.avoidNow.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle className="w-6 h-6 text-orange-600" />
                            Actions to Avoid Now
                        </h2>
                        <ul className="space-y-2">
                            {advisory.avoidNow.map((item: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700 bg-orange-50 p-3 rounded-lg">
                                    <span className="text-orange-500 font-bold mt-1">⚠</span>
                                    <span>{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Success Metrics */}
                {advisory.successMetrics && advisory.successMetrics.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Target className="w-6 h-6 text-green-600" />
                            Success Metrics
                        </h2>
                        <ul className="space-y-2">
                            {advisory.successMetrics.map((metric: string, i: number) => (
                                <li key={i} className="flex items-start gap-2 text-gray-700">
                                    <span className="text-green-500 mt-1">✓</span>
                                    <span>{metric}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
