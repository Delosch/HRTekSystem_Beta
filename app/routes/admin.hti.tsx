import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useFetcher } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { useState } from "react";
import { Brain, CheckCircle, XCircle, Clock, AlertCircle, Eye, Edit, Save, FileText, Lock, Unlock } from "lucide-react";
import { HTIReportEditor } from "~/components/HTIReportEditor";
import { PDFPreviewModal } from "~/components/PDFPreviewModal";

/**
 * Admin HTI Approvals Page
 * Route: /admin/hti
 * 
 * Allows admins to:
 * - View pending HTI advisories
 * - Preview LLM-generated content
 * - Approve/Reject/Request Revision
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    // Check admin role (type assertion for role field)
    const userWithRole = user as any;
    if (userWithRole.role !== "admin") {
        // For now, allow access in development mode
        // In production, this should strictly check admin role
        if (process.env.NODE_ENV === "production") {
            return json({
                error: "Unauthorized - Admin access required",
                pendingApprovals: []
            }, { status: 403 });
        }
        console.warn("⚠️ DEV MODE: Bypassing admin role check for HTI approvals");
    }

    let pendingApprovals: any[] = [];
    let approvedReports: any[] = [];

    try {
        // Fetch pending approvals directly from model
        const { getPendingApprovals } = await import("~/models/hti.model");
        const pendingReports = await getPendingApprovals();

        console.log(`📊 Admin HTI: Found ${pendingReports.length} pending reports`);

        // Format for admin view
        pendingApprovals = pendingReports.map(report => ({
            reportId: report.reportId,
            companyId: report.companyId,
            generatedAt: report.generatedAt,
            generatedBy: report.generatedBy,
            status: report.status,
            completedEngines: report.inputData?.completedEnginesCount || 5,
            totalEngines: report.inputData?.totalEngines || 5,
            executiveSummary: report.advisory?.executiveSummary || "No summary available",
            advisory: report.advisory,
            approvedAt: report.approvedAt,
            approvedBy: report.approvedBy
        }));

        // Fetch approved reports
        const { ddbDocClient } = await import("~/lib/dynamodb.server");
        const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");
        const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

        const approvedResult = await ddbDocClient.send(
            new ScanCommand({
                TableName: TABLE_NAME,
                FilterExpression: "contains(#sk, :prefix) AND #status = :status",
                ExpressionAttributeNames: {
                    "#sk": "sk",
                    "#status": "status"
                },
                ExpressionAttributeValues: {
                    ":prefix": "HTI_REPORT#",
                    ":status": "approved"
                }
            })
        );

        approvedReports = (approvedResult.Items || []).map((report: any) => ({
            reportId: report.reportId,
            companyId: report.companyId,
            generatedAt: report.generatedAt,
            generatedBy: report.generatedBy,
            status: report.status,
            approvedAt: report.approvedAt,
            approvedBy: report.approvedBy,
            isLocked: report.isLocked ?? true, // Default to locked for old reports
            lockedAt: report.lockedAt,
            lockedBy: report.lockedBy,
            completedEngines: report.inputData?.completedEnginesCount || 5,
            totalEngines: report.inputData?.totalEngines || 5,
            executiveSummary: report.advisory?.executiveSummary || "No summary available",
            advisory: report.advisory
        }));

        console.log(`✅ Admin HTI: Found ${approvedReports.length} approved reports`);
    } catch (error) {
        console.error("Error fetching HTI reports:", error);
    }

    return json({
        user,
        pendingApprovals,
        approvedReports
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const user = await requireUserSession(request);

    // Check admin role (type assertion)
    const userWithRole = user as any;
    if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
        return json({ error: "Unauthorized - Admin access required" }, { status: 403 });
    }

    const formData = await request.formData();
    const action = formData.get("action");
    const reportId = formData.get("reportId");
    const companyId = formData.get("companyId");
    const notes = formData.get("notes");

    console.log(`📝 Admin action: ${action} for report ${reportId}`);

    try {
        const { processAdminApproval } = await import("~/services/hti.service");
        const result = await processAdminApproval(
            companyId as string,
            reportId as string,
            action as "approve" | "reject" | "request_revision",
            user.userId,
            notes as string
        );

        if (!result.success) {
            return json({ error: result.error }, { status: 400 });
        }

        console.log(`✅ Admin action successful: ${action}`);
        return json({ success: true });
    } catch (error) {
        console.error(`❌ Admin action error:`, error);
        return json({ error: "Failed to process approval" }, { status: 500 });
    }
}

export default function AdminHTIApprovals() {
    const loaderData = useLoaderData<typeof loader>();
    const pendingApprovals = loaderData?.pendingApprovals || [];
    const approvedReports = ('approvedReports' in loaderData) ? loaderData.approvedReports : [];
    const navigation = useNavigation();
    const fetcher = useFetcher();
    const [selectedReport, setSelectedReport] = useState<any>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [editMode, setEditMode] = useState<string | null>(null);
    const [editedAdvisory, setEditedAdvisory] = useState<any>(null);
    const [showPDFPreview, setShowPDFPreview] = useState(false);
    const [previewReport, setPreviewReport] = useState<any>(null);

    const isProcessing = navigation.state === "submitting";

    const handleEditMode = (reportId: string, advisory: any) => {
        setEditMode(reportId);
        setEditedAdvisory({ ...advisory });
    };

    const handleSave = async (reportId: string, companyId: string) => {
        const response = await fetch('/api/hti/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId, companyId, advisory: editedAdvisory })
        });
        if (response.ok) {
            alert('Saved!');
            setEditMode(null);
            window.location.reload();
        }
    };

    const handlePreviewPDF = (report: any) => {
        setPreviewReport({ ...report, advisory: editMode === report.reportId ? editedAdvisory : report.advisory });
        setShowPDFPreview(true);
    };

    const handleLockReport = async (reportId: string, companyId: string) => {
        if (!confirm('Lock this report? It will become visible to users.')) return;

        const response = await fetch('/api/hti/lock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId, companyId, action: 'lock' })
        });

        if (response.ok) {
            alert('✅ Report locked and published to user!');
            window.location.reload();
        } else {
            alert('❌ Failed to lock report');
        }
    };

    const handleUnlockReport = async (reportId: string, companyId: string) => {
        if (!confirm('Unlock this report for editing? It will be hidden from users.')) return;

        const response = await fetch('/api/hti/lock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId, companyId, action: 'unlock' })
        });

        if (response.ok) {
            alert('✅ Report unlocked for editing!');
            window.location.reload();
        } else {
            alert('❌ Failed to unlock report');
        }
    };


    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Brain className="w-10 h-10 text-blue-600" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">HTI Advisory Approvals</h1>
                            <p className="text-gray-600">Review and approve AI-generated advisory reports</p>
                        </div>
                    </div>

                    <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Pending Approvals:</strong> {pendingApprovals.length} advisory reports awaiting review
                        </p>
                    </div>
                </div>

                {/* Pending Approvals List */}
                {pendingApprovals.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">All Caught Up!</h2>
                        <p className="text-gray-600">No pending HTI advisories to review</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {pendingApprovals.map((report: any) => (
                            <div
                                key={report.reportId}
                                className="bg-white rounded-2xl shadow-lg overflow-hidden"
                            >
                                {/* Report Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-xl font-bold mb-2">
                                                Advisory Report
                                            </h3>
                                            <div className="space-y-1 text-blue-100 text-sm">
                                                <p><strong>Company ID:</strong> {report.companyId}</p>
                                                <p><strong>Requested By:</strong> {report.generatedBy}</p>
                                                <p><strong>Generated:</strong> {new Date(report.generatedAt).toLocaleString()}</p>
                                                <p><strong>Engines Analyzed:</strong> {report.completedEngines} of {report.totalEngines}</p>
                                            </div>
                                        </div>
                                        <div className="bg-yellow-400 text-gray-900 px-4 py-2 rounded-full font-semibold text-sm">
                                            PENDING REVIEW
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="mt-4 pt-4 border-t border-blue-500">
                                        <a
                                            href={`/admin/companies/${report.companyId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                            </svg>
                                            View Company Dashboard
                                        </a>
                                    </div>
                                </div>
                                {/* Executive Summary Preview */}
                                <div className="p-6 border-b border-gray-200">
                                    <h4 className="font-semibold text-gray-900 mb-3">Executive Summary</h4>
                                    <div
                                        className="text-gray-700 leading-relaxed prose max-w-none"
                                        dangerouslySetInnerHTML={{ __html: report.executiveSummary }}
                                    />
                                </div>

                                {/* Full Advisory Preview */}
                                {selectedReport === report.reportId && (
                                    <div className="p-6 bg-gray-50 border-b border-gray-200">
                                        <h4 className="font-semibold text-gray-900 mb-4">Full Advisory Content</h4>

                                        {/* Current State */}
                                        <div className="mb-6">
                                            <h5 className="font-semibold text-gray-800 mb-2">Current State</h5>
                                            <div className="bg-white rounded-lg p-4 space-y-2">
                                                <p><strong>Maturity Level:</strong> {report.advisory.currentState?.maturityLevel}</p>
                                                <p><strong>Digital Readiness:</strong> {report.advisory.currentState?.digitalReadiness}</p>
                                                {report.advisory.currentState?.keyGaps && (
                                                    <div>
                                                        <strong>Key Gaps:</strong>
                                                        <ul className="list-disc list-inside ml-4 mt-1">
                                                            {report.advisory.currentState.keyGaps.map((gap: string, i: number) => (
                                                                <li key={i} className="text-gray-700">{gap}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Recommendations */}
                                        <div className="mb-6">
                                            <h5 className="font-semibold text-gray-800 mb-2">Recommendations</h5>
                                            <div className="grid md:grid-cols-3 gap-4">
                                                <div className="bg-green-50 rounded-lg p-4">
                                                    <h6 className="font-semibold text-green-800 mb-2">NOW (3-6 months)</h6>
                                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                                        {report.advisory.recommendations?.now?.map((item: string, i: number) => (
                                                            <li key={i} className="text-gray-700">{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-yellow-50 rounded-lg p-4">
                                                    <h6 className="font-semibold text-yellow-800 mb-2">NEXT (6-12 months)</h6>
                                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                                        {report.advisory.recommendations?.next?.map((item: string, i: number) => (
                                                            <li key={i} className="text-gray-700">{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="bg-blue-50 rounded-lg p-4">
                                                    <h6 className="font-semibold text-blue-800 mb-2">LATER (12-24 months)</h6>
                                                    <ul className="list-disc list-inside space-y-1 text-sm">
                                                        {report.advisory.recommendations?.later?.map((item: string, i: number) => (
                                                            <li key={i} className="text-gray-700">{item}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Risk Flags */}
                                        {report.advisory.riskFlags && report.advisory.riskFlags.length > 0 && (
                                            <div className="mb-6">
                                                <h5 className="font-semibold text-gray-800 mb-2">Risk Flags</h5>
                                                <div className="bg-red-50 rounded-lg p-4 space-y-2">
                                                    {report.advisory.riskFlags.map((risk: any, i: number) => (
                                                        <div key={i} className="border-l-4 border-red-500 pl-3">
                                                            <p className="font-semibold text-red-800">{risk.risk}</p>
                                                            <p className="text-sm text-gray-700">Mitigation: {risk.mitigation}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="p-6 bg-gray-50">
                                    <div className="flex items-center justify-between mb-4">
                                        <button
                                            onClick={() => setSelectedReport(selectedReport === report.reportId ? null : report.reportId)}
                                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                                        >
                                            <Eye className="w-5 h-5" />
                                            {selectedReport === report.reportId ? "Hide" : "View"} Full Advisory
                                        </button>
                                    </div>

                                    {/* Edit Mode Buttons */}
                                    {editMode === report.reportId ? (
                                        <div className="flex flex-wrap gap-3 mb-4">
                                            <button onClick={() => handleSave(report.reportId, report.companyId)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                                <Save className="w-4 h-4" />
                                                Save Draft
                                            </button>
                                            <button onClick={() => handlePreviewPDF(report)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                                <FileText className="w-4 h-4" />
                                                Preview PDF
                                            </button>
                                            <button onClick={() => setEditMode(null)} className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleEditMode(report.reportId, report.advisory)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-4">
                                            <Edit className="w-4 h-4" />
                                            Edit Report
                                        </button>
                                    )}

                                    {/* Editor Interface */}
                                    {editMode === report.reportId && editedAdvisory && (
                                        <div className="mb-6 border-t border-gray-200 pt-6">
                                            <HTIReportEditor advisory={editedAdvisory} onChange={setEditedAdvisory} />
                                        </div>
                                    )}

                                    {/* Admin Notes */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Admin Notes (Optional)
                                        </label>
                                        <textarea
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Add notes about this approval decision..."
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            rows={3}
                                        />
                                    </div>

                                    {/* Action Buttons */}
                                    <Form method="post" className="flex flex-wrap gap-3">
                                        <input type="hidden" name="reportId" value={report.reportId} />
                                        <input type="hidden" name="companyId" value={report.companyId} />
                                        <input type="hidden" name="notes" value={adminNotes} />

                                        <button
                                            type="submit"
                                            name="action"
                                            value="approve"
                                            disabled={isProcessing}
                                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Approve
                                        </button>

                                        <button
                                            type="submit"
                                            name="action"
                                            value="request_revision"
                                            disabled={isProcessing}
                                            className="flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 disabled:bg-gray-400 transition-colors"
                                        >
                                            <AlertCircle className="w-5 h-5" />
                                            Request Revision
                                        </button>

                                        <button
                                            type="submit"
                                            name="action"
                                            value="reject"
                                            disabled={isProcessing}
                                            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                                        >
                                            <XCircle className="w-5 h-5" />
                                            Reject
                                        </button>
                                    </Form>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Approved Reports Section */}
                {approvedReports.length > 0 && (
                    <div className="mt-12">
                        <div className="bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4 mb-6">
                            <p className="text-sm text-green-800">
                                <strong>Approved Reports:</strong> {approvedReports.length} HTI advisory reports approved
                            </p>
                        </div>

                        <div className="space-y-6">
                            {approvedReports.map((report: any) => (
                                <div key={report.reportId} className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
                                    {/* Header */}
                                    <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-xl font-bold mb-2">
                                                    HTI Advisory Report
                                                </h3>
                                                <div className="space-y-1 text-green-100 text-sm">
                                                    <p><strong>Company ID:</strong> {report.companyId}</p>
                                                    <p><strong>Generated By:</strong> {report.generatedBy}</p>
                                                    <p><strong>Generated:</strong> {new Date(report.generatedAt).toLocaleString()}</p>
                                                    <p><strong>Approved By:</strong> {report.approvedBy || 'N/A'}</p>
                                                    <p><strong>Approved:</strong> {report.approvedAt ? new Date(report.approvedAt).toLocaleString() : 'N/A'}</p>
                                                    <p><strong>Engines Analyzed:</strong> {report.completedEngines} of {report.totalEngines}</p>
                                                </div>
                                            </div>
                                            <div className={`${report.isLocked ? 'bg-green-400' : 'bg-yellow-400'} text-gray-900 px-4 py-2 rounded-full font-semibold text-sm flex items-center gap-2`}>
                                                {report.isLocked ? (
                                                    <>
                                                        <Lock className="w-4 h-4" />
                                                        🔒 PUBLISHED
                                                    </>
                                                ) : (
                                                    <>
                                                        <Unlock className="w-4 h-4" />
                                                        🔓 EDITING
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <div className="mb-4">
                                            <h4 className="font-semibold text-gray-900 mb-2">Executive Summary</h4>
                                            <div
                                                className="text-gray-700 prose max-w-none"
                                                dangerouslySetInnerHTML={{ __html: report.executiveSummary }}
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-3">
                                            {/* Lock/Unlock Buttons */}
                                            {report.isLocked ? (
                                                <button
                                                    onClick={() => handleUnlockReport(report.reportId, report.companyId)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                    Unlock for Editing
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleLockReport(report.reportId, report.companyId)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                                    >
                                                        <Lock className="w-4 h-4" />
                                                        Lock & Publish to User
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditMode(report.reportId, report.advisory)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Edit Report
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setPreviewReport(report);
                                                    setShowPDFPreview(true);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                                            >
                                                <FileText className="w-4 h-4" />
                                                View PDF
                                            </button>
                                            <button
                                                onClick={() => setSelectedReport(selectedReport === report.reportId ? null : report.reportId)}
                                                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                            >
                                                <Eye className="w-4 h-4" />
                                                {selectedReport === report.reportId ? "Hide" : "View"} Full Report
                                            </button>
                                        </div>

                                        {/* Edit Mode for Unlocked Reports */}
                                        {!report.isLocked && editMode === report.reportId && editedAdvisory && (
                                            <div className="mt-6 pt-6 border-t border-gray-200">
                                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                                    <p className="text-sm text-yellow-800">
                                                        ⚠️ <strong>Editing Mode:</strong> This report is unlocked and hidden from users. Lock it when done editing to publish.
                                                    </p>
                                                </div>
                                                <HTIReportEditor advisory={editedAdvisory} onChange={setEditedAdvisory} />
                                                <div className="flex gap-3 mt-4">
                                                    <button
                                                        onClick={() => handleSave(report.reportId, report.companyId)}
                                                        className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                                                    >
                                                        <Save className="w-4 h-4" />
                                                        Save Changes
                                                    </button>
                                                    <button
                                                        onClick={() => setEditMode(null)}
                                                        className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Full Report Details */}
                                        {selectedReport === report.reportId && report.advisory && (
                                            <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                                                {/* Current State */}
                                                <div>
                                                    <h4 className="font-semibold text-gray-900 mb-2">Current State</h4>
                                                    <p><strong>Maturity Level:</strong> {report.advisory.currentState?.maturityLevel}</p>
                                                    <p><strong>Digital Readiness:</strong> {report.advisory.currentState?.digitalReadiness}</p>
                                                </div>

                                                {/* Recommendations */}
                                                {report.advisory.recommendations && (
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 mb-2">Recommendations</h4>
                                                        <div className="grid md:grid-cols-3 gap-4">
                                                            <div>
                                                                <p className="font-medium text-green-700">NOW (3-6 months)</p>
                                                                <ul className="list-disc list-inside text-sm">
                                                                    {report.advisory.recommendations.now?.map((item: string, i: number) => (
                                                                        <li key={i}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-yellow-700">NEXT (6-12 months)</p>
                                                                <ul className="list-disc list-inside text-sm">
                                                                    {report.advisory.recommendations.next?.map((item: string, i: number) => (
                                                                        <li key={i}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-blue-700">LATER (12-24 months)</p>
                                                                <ul className="list-disc list-inside text-sm">
                                                                    {report.advisory.recommendations.later?.map((item: string, i: number) => (
                                                                        <li key={i}>{item}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


                {/* PDF Preview Modal */}
                {showPDFPreview && previewReport && (
                    <PDFPreviewModal
                        report={previewReport}
                        isOpen={showPDFPreview}
                        onClose={() => setShowPDFPreview(false)}
                    />
                )}
            </div>
        </div>
    );
}
