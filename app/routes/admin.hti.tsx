import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useFetcher, Link } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { useState, Fragment } from "react";
import {
    CpuChipIcon,
    CheckBadgeIcon,
    XCircleIcon,
    ClockIcon,
    ExclamationTriangleIcon,
    EyeIcon,
    PencilSquareIcon,
    DocumentCheckIcon,
    LockClosedIcon,
    LockOpenIcon,
    SparklesIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ScaleIcon,
    ArrowPathIcon,
    ArrowTopRightOnSquareIcon,
    CommandLineIcon
} from "@heroicons/react/24/outline";
import { HTIReportEditor } from "~/components/HTIReportEditor";
import { PDFPreviewModal } from "~/components/PDFPreviewModal";
import { motion, AnimatePresence } from "framer-motion";

export async function loader({ request }: LoaderFunctionArgs) {
    await requireAdminSession(request);

    let pendingApprovals: any[] = [];
    let approvedReports: any[] = [];

    try {
        const { getPendingApprovals } = await import("~/models/hti.model.server");
        const pendingReports = await getPendingApprovals();

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
            isLocked: report.isLocked ?? true,
            lockedAt: report.lockedAt,
            lockedBy: report.lockedBy,
            completedEngines: report.inputData?.completedEnginesCount || 5,
            totalEngines: report.inputData?.totalEngines || 5,
            executiveSummary: report.advisory?.executiveSummary || "No summary available",
            advisory: report.advisory
        }));
    } catch (error) {
        console.error("Error fetching HTI reports:", error);
    }

    return json({
        pendingApprovals,
        approvedReports
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const admin = await requireAdminSession(request);
    const formData = await request.formData();
    const action = formData.get("action");
    const reportId = formData.get("reportId");
    const companyId = formData.get("companyId");
    const notes = formData.get("notes");

    try {
        const { processAdminApproval } = await import("~/services/hti.service.server");
        const result = await processAdminApproval(
            companyId as string,
            reportId as string,
            action as "approve" | "reject" | "request_revision",
            admin.userId,
            notes as string
        );

        if (!result.success) {
            return json({ error: result.error }, { status: 400 });
        }
        return json({ success: true });
    } catch (error) {
        return json({ error: "Failed to process approval" }, { status: 500 });
    }
}

export default function AdminHTIApprovals() {
    const { pendingApprovals, approvedReports } = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const fetcher = useFetcher();

    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
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
            setEditMode(null);
            window.location.reload();
        }
    };

    const handlePreviewPDF = (report: any) => {
        setPreviewReport({ ...report, advisory: editMode === report.reportId ? editedAdvisory : report.advisory });
        setShowPDFPreview(true);
    };

    const handleLockReport = async (reportId: string, companyId: string) => {
        if (!confirm('Finalize and lock this report for user visibility?')) return;
        const response = await fetch('/api/hti/lock', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId, companyId, action: 'lock' })
        });
        if (response.ok) window.location.reload();
    };

    const handleUnlockReport = async (reportId: string, companyId: string) => {
        if (!confirm('Unlock this report? This will retract it from user view.')) return;
        const response = await fetch('/api/hti/lock', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reportId, companyId, action: 'unlock' })
        });
        if (response.ok) window.location.reload();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-12 p-4 animate-in fade-in duration-700">
            {/* Intel Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                        >
                            <CpuChipIcon className="h-5 w-5" />
                        </motion.div>
                        <span className="text-xs font-black text-indigo-600 uppercase tracking-[0.2em]">Neural Intelligence Subsystem</span>
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">HTI Advisory <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Governance</span></h1>
                    <p className="text-gray-500 font-medium mt-1">Review, refine, and authenticate AI-driven transformation roadmaps.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Status: Active</span>
                    </div>
                </div>
            </div>

            {/* Core Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2 bg-gradient-to-br from-indigo-700 to-violet-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:scale-110 transition-transform duration-700">
                        <SparklesIcon className="h-32 w-32 text-white" />
                    </div>
                    <h3 className="text-white/60 text-xs font-black uppercase tracking-[0.2em] mb-4">Pending Authorization</h3>
                    <p className="text-5xl font-black text-white mb-6 leading-none">{pendingApprovals.length}</p>
                    <div className="flex items-center gap-2 text-indigo-100 text-sm font-bold">
                        <ClockIcon className="h-4 w-4" />
                        Awaiting recursive sanity audit
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Authored Reports</p>
                    <div>
                        <p className="text-4xl font-black text-gray-900">{approvedReports.length}</p>
                        <p className="text-xs font-bold text-emerald-600 mt-2 flex items-center gap-1">
                            <CheckBadgeIcon className="h-3.5 w-3.5" /> High Fidelity
                        </p>
                    </div>
                </div>
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col justify-between">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Model Precision</p>
                    <div>
                        <p className="text-4xl font-black text-gray-900 uppercase">99.4<span className="text-lg">%</span></p>
                        <p className="text-xs font-bold text-indigo-400 mt-2">v4.2-Turbo-Audit</p>
                    </div>
                </div>
            </div>

            {/* Pending Stream */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-4">
                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                        <ArrowPathIcon className="h-5 w-5 text-indigo-500 animate-spin-slow" />
                        Validation Queue
                    </h2>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">FIFO Processing</span>
                </div>

                {pendingApprovals.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-white border-2 border-dashed border-gray-100 rounded-[3rem] p-20 text-center"
                    >
                        <CheckBadgeIcon className="h-16 w-16 text-emerald-100 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-gray-900">Consistency Buffer Empty</h3>
                        <p className="text-sm text-gray-400 font-medium">No advisory reports are currently awaiting manual vetting.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 gap-8">
                        {pendingApprovals.map((report: any, idx: number) => (
                            <motion.div
                                key={report.reportId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
                            >
                                <div className="p-8 lg:p-12 flex flex-col lg:flex-row gap-12">
                                    {/* Left: Metadata Sidepanel */}
                                    <div className="lg:w-80 space-y-8 border-b lg:border-b-0 lg:border-r border-gray-50 pb-8 lg:pb-0 lg:pr-12">
                                        <div>
                                            <span className="inline-flex px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100 mb-4 animate-pulse">
                                                Review Required
                                            </span>
                                            <h3 className="text-xl font-bold text-gray-900 truncate mb-1">#{report.companyId}</h3>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">Report ID: {report.reportId.slice(0, 12)}</p>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                    <CommandLineIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generator Source</p>
                                                    <p className="text-xs font-bold text-gray-700">{report.generatedBy}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                                    <ClockIcon className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ingress Timestamp</p>
                                                    <p className="text-xs font-bold text-gray-700">{new Date(report.generatedAt).toLocaleString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <Link to={`/admin/companies/${report.companyId}`} className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-2xl hover:bg-indigo-50 transition-colors group/link">
                                            <span className="text-xs font-bold text-indigo-700">Observe Context</span>
                                            <ArrowTopRightOnSquareIcon className="h-4 w-4 text-indigo-400 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
                                        </Link>
                                    </div>

                                    {/* Right: Summary & Editor Preview */}
                                    <div className="flex-1 space-y-8">
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                <SparklesIcon className="h-3 w-3 text-indigo-400" /> Intelligence Summary
                                            </h4>
                                            <div className="p-6 bg-slate-50/50 rounded-3xl border border-gray-100 relative overflow-hidden">
                                                <div className="prose prose-sm font-medium text-gray-600 leading-relaxed max-w-none" dangerouslySetInnerHTML={{ __html: report.executiveSummary }} />
                                            </div>
                                        </div>

                                        {/* Dynamic Controls */}
                                        <div className="flex flex-wrap items-center gap-4">
                                            <button
                                                onClick={() => setSelectedReportId(selectedReportId === report.reportId ? null : report.reportId)}
                                                className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 hover:border-indigo-400 hover:text-indigo-600 transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                <EyeIcon className="h-4 w-4" />
                                                {selectedReportId === report.reportId ? 'Hide Introspection' : 'Deep Introspect'}
                                            </button>

                                            {editMode !== report.reportId ? (
                                                <button
                                                    onClick={() => handleEditMode(report.reportId, report.advisory)}
                                                    className="px-6 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-600 hover:text-white transition-all flex items-center gap-2 shadow-sm border border-indigo-100"
                                                >
                                                    <PencilSquareIcon className="h-4 w-4" />
                                                    Refine advisory data
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSave(report.reportId, report.companyId)}
                                                    className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                                                >
                                                    <DocumentCheckIcon className="h-4 w-4" />
                                                    Commit Refinement
                                                </button>
                                            )}

                                            <button
                                                onClick={() => handlePreviewPDF(report)}
                                                className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 transition-all flex items-center gap-2 shadow-sm"
                                            >
                                                <ScaleIcon className="h-4 w-4" />
                                                Render Validation PDF
                                            </button>
                                        </div>

                                        {/* Content Inspector */}
                                        <AnimatePresence>
                                            {selectedReportId === report.reportId && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="space-y-6 pt-4">
                                                        {editMode === report.reportId ? (
                                                            <div className="bg-white rounded-[2rem] border border-indigo-100 p-8 shadow-inner">
                                                                <HTIReportEditor advisory={editedAdvisory} onChange={setEditedAdvisory} />
                                                            </div>
                                                        ) : (
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                <div className="p-6 bg-emerald-50/30 rounded-3xl border border-emerald-100/50">
                                                                    <h5 className="text-[10px] font-black text-emerald-800 uppercase tracking-widest mb-3">Roadmap Priorities</h5>
                                                                    <div className="text-xs font-bold space-y-2 text-emerald-900">
                                                                        <p>NOW: {report.advisory.recommendations?.now?.length || 0} initiatives</p>
                                                                        <p>NEXT: {report.advisory.recommendations?.next?.length || 0} objectives</p>
                                                                    </div>
                                                                </div>
                                                                <div className="p-6 bg-rose-50/30 rounded-3xl border border-rose-100/50">
                                                                    <h5 className="text-[10px] font-black text-rose-800 uppercase tracking-widest mb-3">Risk Exposure</h5>
                                                                    <p className="text-xs font-bold text-rose-900">{report.advisory.riskFlags?.length || 0} identified flags</p>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Decision Footer */}
                                        <div className="pt-8 border-t border-gray-50">
                                            <div className="flex flex-col sm:flex-row gap-6">
                                                <div className="flex-1">
                                                    <textarea
                                                        value={adminNotes}
                                                        onChange={(e) => setAdminNotes(e.target.value)}
                                                        placeholder="Append audit consensus notes (stored in governance log)..."
                                                        className="w-full bg-gray-50 border-none rounded-2xl px-6 py-3 text-xs font-medium focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                                                        rows={2}
                                                    />
                                                </div>
                                                <div className="flex gap-2">
                                                    <Form method="post" className="flex gap-2">
                                                        <input type="hidden" name="reportId" value={report.reportId} />
                                                        <input type="hidden" name="companyId" value={report.companyId} />
                                                        <input type="hidden" name="notes" value={adminNotes} />

                                                        <button
                                                            name="action" value="approve"
                                                            className="h-12 px-8 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all"
                                                        >
                                                            Authorize
                                                        </button>
                                                        <button
                                                            name="action" value="reject"
                                                            className="h-12 w-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center hover:bg-rose-600 hover:text-white transition-all"
                                                            title="Reject Advisory"
                                                        >
                                                            <XCircleIcon className="h-6 w-6" />
                                                        </button>
                                                    </Form>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </section>

            {/* Approved Repository */}
            {approvedReports.length > 0 && (
                <section className="space-y-6 pt-12">
                    <div className="flex items-center justify-between px-4">
                        <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                            <DocumentCheckIcon className="h-5 w-5 text-emerald-500" />
                            Validated Intelligence Repository
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {approvedReports.map((report: any) => (
                            <div key={report.reportId} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between mb-6">
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${report.isLocked ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                        {report.isLocked ? <LockClosedIcon className="h-3 w-3" /> : <LockOpenIcon className="h-3 w-3" />}
                                        {report.isLocked ? 'Synchronized' : 'Drafting'}
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400">{new Date(report.approvedAt).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{report.companyId}</h3>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.1em] mb-4">Advisory Model v4.1</p>

                                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => handlePreviewPDF(report)}
                                        className="flex-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-[10px] font-black uppercase hover:bg-gray-900 hover:text-white transition-all"
                                    >
                                        Inspect PDF
                                    </button>
                                    <button
                                        onClick={() => report.isLocked ? handleUnlockReport(report.reportId, report.companyId) : handleLockReport(report.reportId, report.companyId)}
                                        className={`p-2 rounded-xl transition-all ${report.isLocked ? 'text-gray-400 hover:text-indigo-600' : 'text-emerald-600 bg-emerald-50'}`}
                                    >
                                        {report.isLocked ? <LockOpenIcon className="h-5 w-5" /> : <LockClosedIcon className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {showPDFPreview && previewReport && (
                <PDFPreviewModal
                    report={previewReport}
                    isOpen={showPDFPreview}
                    onClose={() => setShowPDFPreview(false)}
                />
            )}
        </div>
    );
}
