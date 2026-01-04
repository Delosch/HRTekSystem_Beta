import { Link } from "@remix-run/react";

interface HTIReport {
    reportId: string;
    generatedAt: string;
    status: "pending" | "approved" | "rejected";
    advisory: {
        executiveSummary: string;
        currentState: {
            maturityLevel: string;
            digitalReadiness: string;
        };
    };
}

interface HTIReportsWidgetProps {
    reports: HTIReport[];
}

export default function HTIReportsWidget({ reports }: HTIReportsWidgetProps) {
    if (!reports || reports.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">HTI Advisory Reports</h3>
                    <Link
                        to="/hti"
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Generate Report →
                    </Link>
                </div>
                <div className="text-center py-8 text-gray-500">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-sm">No HTI advisory reports yet</p>
                    <p className="text-xs mt-1">Complete all 5 engines to generate your first report</p>
                </div>
            </div>
        );
    }

    const getStatusBadge = (status: string) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800"
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    HTI Advisory Reports
                    <span className="ml-2 text-sm font-normal text-gray-500">
                        ({reports.length})
                    </span>
                </h3>
                <Link
                    to="/hti"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                    View All →
                </Link>
            </div>

            <div className="space-y-3">
                {reports.slice(0, 3).map((report) => (
                    <div
                        key={report.reportId}
                        className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <h4 className="font-medium text-gray-900 text-sm">
                                        Strategic Advisory Report
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(report.status)}`}>
                                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Generated: {new Date(report.generatedAt).toLocaleDateString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500">Maturity:</span>
                                <span className="font-medium text-gray-700">
                                    {report.advisory.currentState.maturityLevel}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                                <span className="text-gray-500">Readiness:</span>
                                <span className="font-medium text-gray-700">
                                    {report.advisory.currentState.digitalReadiness}
                                </span>
                            </div>
                        </div>

                        <p className="mt-3 text-xs text-gray-600 line-clamp-2">
                            {report.advisory.executiveSummary.substring(0, 150)}...
                        </p>

                        <Link
                            to="/hti/report"
                            className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1"
                        >
                            View Full Report
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </Link>
                    </div>
                ))}
            </div>

            {reports.length > 3 && (
                <Link
                    to="/hti"
                    className="mt-4 block text-center text-sm text-gray-600 hover:text-gray-900"
                >
                    View {reports.length - 3} more reports →
                </Link>
            )}
        </div>
    );
}
