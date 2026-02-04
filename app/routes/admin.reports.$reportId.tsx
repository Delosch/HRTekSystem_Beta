import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState } from "react";
import { ArrowLeftIcon, CheckCircleIcon, ClockIcon, BuildingOffice2Icon, CalendarIcon } from "@heroicons/react/24/outline";

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

    // Ensure it's decoded properly (handling %23 for #)
    reportId = decodeURIComponent(reportId);
    console.log(`🔍 Viewing Report ID: ${reportId}`);

    // Import necessary functions
    const { getDynamoDBDocumentClient } = await import("~/lib/dynamodb.server");
    const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");
    const { getCompanyProfile } = await import("~/models/company.model.server");

    const ddbDocClient = getDynamoDBDocumentClient();
    const USERS_TABLE = process.env.DYNAMODB_ASSESSMENTS_TABLE || process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

    // Find the report by SK (reportId is the SK like ANALYSIS#timestamp)
    const scanCommand = new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "sk = :sk",
        ExpressionAttributeValues: {
            ":sk": reportId
        }
    });

    const { Items } = await ddbDocClient.send(scanCommand);

    if (!Items || Items.length === 0) {
        throw new Response("Report not found", { status: 404 });
    }

    const reportItem = Items[0];
    const companyId = reportItem.pk.replace("COMPANY#", "");

    // Get company details
    let companyName = "Unknown Company";
    try {
        const profile = await getCompanyProfile(companyId);
        if (profile) {
            companyName = profile.company_name || profile.brand_name || companyId;
        }
    } catch (e) {
        console.error(`Failed to fetch profile for ${companyId}`, e);
    }

    const report: ReportData = {
        reportId: reportItem.sk,
        companyId: companyId,
        companyName: companyName,
        engineName: reportItem.section || "Unknown Engine",
        submittedAt: reportItem.createdAt || new Date().toISOString(),
        status: reportItem.status || "approved",
        result: reportItem.result || {},
        assessmentId: reportItem.assessment_id || ""
    };

    return json({ report });
};

export default function AdminReportView() {
    const { report } = useLoaderData<{ report: ReportData }>();
    const [isExporting, setIsExporting] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: { color: "bg-yellow-100 text-yellow-800 border-yellow-300", icon: ClockIcon, text: "Pending Review" },
            approved: { color: "bg-green-100 text-green-800 border-green-300", icon: CheckCircleIcon, text: "Auto-Approved" },
            rejected: { color: "bg-red-100 text-red-800 border-red-300", icon: CheckCircleIcon, text: "Rejected" },
        };

        const badge = badges[status as keyof typeof badges] || badges.approved;
        const Icon = badge.icon;

        return (
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border ${badge.color}`}>
                <Icon className="w-5 h-5" />
                {badge.text}
            </span>
        );
    };

    const handleDownloadPDF = async () => {
        setIsExporting(true);
        try {
            const { downloadPDF } = await import('~/services/report-pdf.client');
            downloadPDF({
                companyName: report.companyName,
                engineName: report.engineName,
                generatedDate: report.submittedAt,
                result: report.result
            });
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to generate PDF. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const handleDownloadDOCX = async () => {
        setIsExporting(true);
        try {
            const { downloadDOCX } = await import('~/services/report-docx.client');
            await downloadDOCX({
                companyName: report.companyName,
                engineName: report.engineName,
                generatedDate: report.submittedAt,
                result: report.result
            });
        } catch (error) {
            console.error('Error generating DOCX:', error);
            alert('Failed to generate DOCX. Please try again.');
        } finally {
            setIsExporting(false);
        }
    };

    const renderReportContent = (result: any) => {
        if (!result || typeof result !== 'object') {
            return <p className="text-gray-500">No report data available</p>;
        }

        return (
            <div className="space-y-6">
                {Object.entries(result).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 capitalize">
                            {key.replace(/_/g, ' ')}
                        </h3>
                        <div className="prose prose-sm max-w-none">
                            {typeof value === 'object' ? (
                                <pre className="bg-white p-4 rounded border border-gray-200 overflow-x-auto text-xs">
                                    {JSON.stringify(value, null, 2)}
                                </pre>
                            ) : (
                                <p className="text-gray-700 whitespace-pre-wrap">{String(value)}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <Link
                    to="/admin/reports"
                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4"
                >
                    <ArrowLeftIcon className="w-5 h-5 mr-2" />
                    Back to All Reports
                </Link>

                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">
                                AI Generated Report
                            </h1>
                            <p className="text-gray-600">{report.engineName}</p>
                        </div>
                        {getStatusBadge(report.status)}
                    </div>

                    {/* Report Metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200">
                        <div className="flex items-start gap-3">
                            <BuildingOffice2Icon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Company</p>
                                <p className="text-lg font-semibold text-gray-900">{report.companyName}</p>
                                <p className="text-xs text-gray-500 mt-1">ID: {report.companyId}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CalendarIcon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Generated On</p>
                                <p className="text-lg font-semibold text-gray-900">{formatDate(report.submittedAt)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <CheckCircleIcon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                            <div>
                                <p className="text-sm font-medium text-gray-500">Assessment ID</p>
                                <p className="text-sm font-mono text-gray-700 break-all">{report.assessmentId}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Report Content */}
            <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b border-gray-200">
                    Report Analysis
                </h2>
                {renderReportContent(report.result)}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-wrap gap-4">
                <button
                    onClick={handleDownloadPDF}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    {isExporting ? 'Generating...' : 'Download PDF'}
                </button>

                <button
                    onClick={handleDownloadDOCX}
                    disabled={isExporting}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {isExporting ? 'Generating...' : 'Download DOCX'}
                </button>

                <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Report
                </button>

                <Link
                    to={`/admin/companies/${report.companyId}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-100 text-indigo-700 font-semibold rounded-lg hover:bg-indigo-200 transition-colors"
                >
                    <BuildingOffice2Icon className="w-5 h-5" />
                    View Company Profile
                </Link>
            </div>
        </div>
    );
}
