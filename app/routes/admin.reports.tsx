import { json } from "@remix-run/node";
import type { LoaderFunction, ActionFunction } from "@remix-run/node";
import { Link, useLoaderData, Form, useNavigation } from "@remix-run/react";
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon, EyeIcon, ClockIcon } from "@heroicons/react/24/outline";

interface Report {
    reportId: string;
    companyId: string;
    companyName: string;
    engineName: string;
    submittedAt: string;
    status: "pending" | "approved" | "rejected";
}

export const loader: LoaderFunction = async () => {
    const { getAllAnalysisReports } = await import("~/utils/analysis");
    const { getCompanyProfile } = await import("~/models/company.model");

    const allReports = await getAllAnalysisReports();

    // Map DB items to Report interface
    const reports: Report[] = await Promise.all(allReports.map(async (item: any) => {
        const companyId = item.pk.replace("COMPANY#", "");
        let companyName = "Unknown Company";
        try {
            const profile = await getCompanyProfile(companyId);
            if (profile) {
                companyName = profile.company_name || profile.brand_name || companyId;
            }
        } catch (e) {
            console.error(`Failed to fetch profile for ${companyId}`, e);
        }

        return {
            reportId: item.sk, // Use SK as report ID (ANALYSIS#TIMESTAMP)
            companyId: companyId,
            companyName: companyName,
            engineName: item.section || "Unknown Engine",
            submittedAt: item.createdAt || new Date().toISOString(),
            status: item.status || "approved"
        };
    }));

    // Sort by most recent first
    reports.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    return json({ reports });
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const reportId = formData.get("reportId") as string; // sk
    const action = formData.get("action") as string;
    const companyId = formData.get("companyId") as string;

    if (!reportId || !companyId || !action) {
        return json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    const { updateAnalysisStatus } = await import("~/utils/analysis");

    const status = action === "approve" ? "approved" : "rejected";
    const pk = `COMPANY#${companyId}`;

    const success = await updateAnalysisStatus(pk, reportId, status);

    if (success && action === "approve") {
        try {
            const { autoGenerateProposal } = await import("~/services/proposal.service");
            const proposalResult = await autoGenerateProposal(companyId);
            if (proposalResult.success) {
                console.log("Proposal auto-generated:", proposalResult.message);
            }
        } catch (err) {
            console.error("Failed to trigger proposal generation:", err);
        }
    }

    return json({ success });
};

export default function AdminReports() {
    const { reports } = useLoaderData<{ reports: Report[] }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { color: "bg-yellow-100 text-yellow-800", icon: ClockIcon, text: "Pending Review" },
            approved: { color: "bg-green-100 text-green-800", icon: CheckCircleIcon, text: "Auto-Approved" },
            rejected: { color: "bg-red-100 text-red-800", icon: XCircleIcon, text: "Rejected" },
        };

        const badge = badges[status as keyof typeof badges] || badges.approved;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                <Icon className="w-4 h-4" />
                {badge.text}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <Link
                    to="/admin"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to Dashboard
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">AI Generated Reports</h1>
                        <p className="text-gray-600 mt-1">Monitor all auto-approved AI-generated assessment reports</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Total Reports</p>
                        <p className="text-3xl font-bold text-indigo-600">{reports.length}</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6 border border-gray-200">
                <div className="flex gap-4 items-center">
                    <label className="text-sm font-medium text-gray-700">Filter by:</label>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option value="all">All Reports</option>
                        <option value="pending">Pending Only</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                        <option value="">All Engines</option>
                        <option value="roadmap">HR Transformation Roadmap</option>
                        <option value="vendor">HCM Vendor Fit</option>
                        <option value="shared">Shared Service Designer</option>
                        <option value="change">Change Management</option>
                        <option value="maturity">HR Tech Maturity</option>
                    </select>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {reports.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-md p-12 border border-gray-200 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircleIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports to Review</h3>
                        <p className="text-gray-600">All AI-generated reports have been reviewed.</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report.reportId} className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-gray-900">{report.companyName}</h3>
                                        {getStatusBadge(report.status)}
                                    </div>
                                    <p className="text-gray-600 mb-1">
                                        <span className="font-medium">Engine:</span> {report.engineName}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        <span className="font-medium">Report ID:</span> {report.reportId}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Created: {formatDate(report.submittedAt)}
                                        </span>
                                        <span className="flex items-center gap-1 text-green-600 font-medium">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Updated: {formatDate(new Date().toISOString())}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-200">
                                <a
                                    href={`/admin/reports/${encodeURIComponent(report.reportId)}`}
                                    className="relative z-10 flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                    View Report
                                </a>

                                {report.status === "pending" && (
                                    <>
                                        <Form method="post" className="flex-1">
                                            <input type="hidden" name="reportId" value={report.reportId} />
                                            <input type="hidden" name="companyId" value={report.companyId} />
                                            <input type="hidden" name="action" value="approve" />
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                            >
                                                <CheckCircleIcon className="w-5 h-5" />
                                                Approve
                                            </button>
                                        </Form>

                                        <Form method="post" className="flex-1">
                                            <input type="hidden" name="reportId" value={report.reportId} />
                                            <input type="hidden" name="companyId" value={report.companyId} />
                                            <input type="hidden" name="action" value="reject" />
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                            >
                                                <XCircleIcon className="w-5 h-5" />
                                                Reject
                                            </button>
                                        </Form>
                                    </>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
