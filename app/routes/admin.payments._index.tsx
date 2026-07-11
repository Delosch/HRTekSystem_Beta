import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, useNavigation, Link } from "@remix-run/react";
import { useState } from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DocumentTextIcon,
    BanknotesIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
    CheckBadgeIcon,
    PlusIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { requireAdminSession } from "~/lib/session.server";

// Inlined from payment.model.server to avoid Vite's server-only module detection
interface SplitDetailRow {
    item: string;
    description: string;
    amount: string;
}
type EnginePaymentType = "full" | "milestone";
import { isCoreEngineClient as isCoreEngine, isAdvancedEngineClient as isAdvancedEngine, CORE_ENGINE_NAMES_CLIENT as CORE_ENGINE_NAMES } from "~/utils/engine-classification";

interface ActionData {
    success?: boolean;
    message?: string;
    error?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await requireAdminSession(request);

    try {
        const { getPendingApprovalRequests, getActiveInstallmentPlans } = await import("~/models/payment.model.server");
        const pendingRequests = await getPendingApprovalRequests();
        const activePlans = await getActiveInstallmentPlans();
        const totalPending = pendingRequests.length;
        const totalAmount = pendingRequests.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const oldestRequest = pendingRequests.length > 0 ? pendingRequests[pendingRequests.length - 1] : null;

        return json({
            requests: pendingRequests,
            activePlans,
            stats: { totalPending, totalAmount, oldestDate: oldestRequest?.createdAt || null }
        });
    } catch (error) {
        console.error("Error loading pending approval requests:", error);
        return json({ requests: [], activePlans: [], stats: { totalPending: 0, totalAmount: 0, oldestDate: null } });
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const admin = await requireAdminSession(request);
    const formData = await request.formData();
    const intent = formData.get("intent") as string;
    const invoiceId = formData.get("invoiceId") as string;
    const orgId = formData.get("orgId") as string;
    const adminId = admin.userId;

    const { approvePaymentRequest, rejectPaymentRequest, enableInstallment } = await import("~/models/payment.model.server");

    try {
        if (intent === "approve") {
            const notes = formData.get("notes") as string;
            const installmentsJson = formData.get("installments") as string;
            const hsnCode = formData.get("hsnCode") as string;
            const paymentType = (formData.get("paymentType") as EnginePaymentType) || "full";
            const allocatedCoreEnginesJson = formData.get("allocatedCoreEngines") as string;

            let installments: Array<{ installmentNumber: number; percentage: number; splitDetails: SplitDetailRow[]; featureUnlocks?: string[] }> | undefined;
            if (installmentsJson) {
                try {
                    installments = JSON.parse(installmentsJson);
                } catch {
                    return json<ActionData>({ error: "Invalid installment data" }, { status: 400 });
                }
            }

            let allocatedCoreEngines: string[] | undefined;
            if (allocatedCoreEnginesJson) {
                try {
                    allocatedCoreEngines = JSON.parse(allocatedCoreEnginesJson);
                } catch {
                    allocatedCoreEngines = undefined;
                }
            }

            await approvePaymentRequest(invoiceId, orgId, adminId, notes || undefined, installments, {
                hsnCode: hsnCode || undefined,
                paymentType,
                allocatedCoreEngines,
            });
            return json<ActionData>({ success: true, message: "Payment request approved with installment plan" });
        }

        if (intent === "reject") {
            const reason = formData.get("reason") as string;
            if (!reason) {
                return json<ActionData>({ error: "Rejection reason is required" }, { status: 400 });
            }
            await rejectPaymentRequest(invoiceId, orgId, adminId, reason);
            return json<ActionData>({ success: true, message: "Payment request rejected" });
        }

        if (intent === "enable_installment") {
            const installmentNumber = parseInt(formData.get("installmentNumber") as string, 10);
            await enableInstallment(invoiceId, orgId, installmentNumber);
            return json<ActionData>({ success: true, message: `Installment ${installmentNumber} enabled successfully` });
        }

        return json<ActionData>({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error processing payment request action:", error);
        return json<ActionData>({ error: "Failed to process action" }, { status: 500 });
    }
};

interface SplitRow {
    item: string;
    description: string;
    amount: string;
    hsnCode?: string;
}

interface InstallmentRow {
    installmentNumber: number;
    percentage: string;
    splitRows: SplitRow[];
    featureUnlocks?: string;
}

export default function AdminPaymentRequests() {
    const { requests, activePlans, stats } = useLoaderData<typeof loader>();
    const fetcher = useFetcher<ActionData>();
    const navigation = useNavigation();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [approvalNotes, setApprovalNotes] = useState("");
    const [showApprovalModal, setShowApprovalModal] = useState(false);

    const [installmentRows, setInstallmentRows] = useState<InstallmentRow[]>([
        { installmentNumber: 1, percentage: "100", splitRows: [{ item: "", description: "", amount: "", hsnCode: "" }], featureUnlocks: "" },
    ]);
    const [hsnCode, setHsnCode] = useState("");
    const [selectedCoreEngines, setSelectedCoreEngines] = useState<string[]>([]);
    const [approvalPaymentType, setApprovalPaymentType] = useState<"full" | "milestone">("full");

    const isSubmitting = navigation.state === "submitting";

    const filteredRequests = requests.filter((req: any) => {
        const term = searchTerm.toLowerCase();
        return (
            (req.engineName || "").toLowerCase().includes(term) ||
            (req.companyId || "").toLowerCase().includes(term) ||
            (req.invoiceNumber || "").toLowerCase().includes(term)
        );
    });

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) newExpanded.delete(id);
        else newExpanded.add(id);
        setExpandedRows(newExpanded);
    };

    const handleApprove = (request: any) => {
        setSelectedRequest(request);
        setApprovalNotes("");
        setHsnCode("");
        setSelectedCoreEngines([]);
        const engineIsCore = isCoreEngine(request.engineName || "");
        setApprovalPaymentType(engineIsCore ? "full" : "full");
        setInstallmentRows([
            { installmentNumber: 1, percentage: "100", splitRows: [{ item: "", description: "", amount: "", hsnCode: "" }], featureUnlocks: "" },
        ]);
        setShowApprovalModal(true);
    };

    const handleReject = (request: any) => {
        setSelectedRequest(request);
        setRejectionReason("");
        setShowRejectModal(true);
    };

    // Installment row handlers
    const addInstallmentRow = () => {
        const nextNumber = installmentRows.length + 1;
        setInstallmentRows([
            ...installmentRows,
            { installmentNumber: nextNumber, percentage: "", splitRows: [{ item: "", description: "", amount: "", hsnCode: "" }], featureUnlocks: "" },
        ]);
    };

    const removeInstallmentRow = (index: number) => {
        if (installmentRows.length <= 1) return;
        const updated = installmentRows.filter((_, i) => i !== index).map((row, i) => ({ ...row, installmentNumber: i + 1 }));
        setInstallmentRows(updated);
    };

    const updateInstallmentPct = (index: number, value: string) => {
        const updated = [...installmentRows];
        updated[index] = { ...updated[index], percentage: value };
        setInstallmentRows(updated);
    };

    // Split row handlers within an installment
    const addSplitRow = (instIndex: number) => {
        const updated = [...installmentRows];
        updated[instIndex] = {
            ...updated[instIndex],
            splitRows: [...updated[instIndex].splitRows, { item: "", description: "", amount: "", hsnCode: "" }],
        };
        setInstallmentRows(updated);
    };

    const removeSplitRow = (instIndex: number, splitIndex: number) => {
        const updated = [...installmentRows];
        if (updated[instIndex].splitRows.length <= 1) return;
        updated[instIndex] = {
            ...updated[instIndex],
            splitRows: updated[instIndex].splitRows.filter((_, i) => i !== splitIndex),
        };
        setInstallmentRows(updated);
    };

    const updateSplitRow = (instIndex: number, splitIndex: number, field: keyof SplitRow, value: string) => {
        const updated = [...installmentRows];
        const newSplitRows = [...updated[instIndex].splitRows];
        newSplitRows[splitIndex] = { ...newSplitRows[splitIndex], [field]: value };
        updated[instIndex] = { ...updated[instIndex], splitRows: newSplitRows };
        setInstallmentRows(updated);
    };

    const totalPercentage = installmentRows.reduce((sum, row) => sum + (parseFloat(row.percentage) || 0), 0);
    const isPercentageValid = Math.abs(totalPercentage - 100) < 0.01;

    const submitApproval = () => {
        if (!selectedRequest || !isPercentageValid) return;

        const installments = installmentRows.map((row) => ({
            installmentNumber: row.installmentNumber,
            percentage: parseFloat(row.percentage) || 0,
            splitDetails: row.splitRows.filter((s) => s.item.trim() || s.description.trim() || s.amount.trim() || (s.hsnCode || "").trim()),
            featureUnlocks: (row.featureUnlocks || "").split(",").map(f => f.trim()).filter(Boolean),
        }));

        fetcher.submit(
            {
                intent: "approve",
                invoiceId: selectedRequest.invoiceId,
                orgId: selectedRequest.companyId,
                notes: approvalNotes,
                installments: JSON.stringify(installments),
                hsnCode,
                paymentType: approvalPaymentType,
                allocatedCoreEngines: JSON.stringify(selectedCoreEngines),
            },
            { method: "post" }
        );
        setShowApprovalModal(false);
    };

    const submitRejection = () => {
        if (!selectedRequest) return;
        fetcher.submit(
            {
                intent: "reject",
                invoiceId: selectedRequest.invoiceId,
                orgId: selectedRequest.companyId,
                reason: rejectionReason,
            },
            { method: "post" }
        );
        setShowRejectModal(false);
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                            <ClockIcon className="h-6 w-6 text-white" />
                        </div>
                        Payment Approval Queue
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Review requests, configure installment plans, and approve/reject
                    </p>
                </div>
                <Link
                    to="/admin/payments/verification"
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-lg transition-colors"
                >
                    <CheckBadgeIcon className="h-5 w-5" />
                    Payment Verification
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div><p className="text-gray-500 text-sm font-medium">Pending Approvals</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPending}</p></div>
                        <div className="p-3 bg-amber-100 rounded-lg"><ClockIcon className="h-6 w-6 text-amber-600" /></div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div><p className="text-gray-500 text-sm font-medium">Total Amount</p><p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.totalAmount)}</p></div>
                        <div className="p-3 bg-indigo-100 rounded-lg"><BanknotesIcon className="h-6 w-6 text-indigo-600" /></div>
                    </div>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div><p className="text-gray-500 text-sm font-medium">Oldest Request</p><p className="text-2xl font-bold text-gray-900 mt-1">{stats.oldestDate ? formatDate(stats.oldestDate) : "None"}</p></div>
                        <div className="p-3 bg-emerald-100 rounded-lg"><DocumentTextIcon className="h-6 w-6 text-emerald-600" /></div>
                    </div>
                </motion.div>
            </div>

            {/* Search Bar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-2">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by engine name, company ID, or invoice..."
                        className="bg-transparent w-full outline-none text-sm text-gray-700 placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                {filteredRequests.length === 0 ? (
                    <div className="text-center py-12">
                        <CheckCircleIcon className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                        <p className="text-gray-600 font-medium">No pending approval requests</p>
                        <p className="text-gray-400 text-sm">All payment requests have been reviewed</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Engine</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Full Amount</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Employees</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requested</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRequests.map((request: any) => {
                                    const isExpanded = expandedRows.has(request.invoiceId);
                                    return (
                                        <motion.tr
                                            key={request.invoiceId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-100 rounded"><DocumentTextIcon className="h-4 w-4 text-blue-600" /></div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">{request.engineName || "Unknown Engine"}</p>
                                                        <div className="flex items-center gap-1 mt-0.5">
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                                isCoreEngine(request.engineName || "") ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                                                            }`}>
                                                                {isCoreEngine(request.engineName || "") ? "Core" : "Advanced"}
                                                            </span>
                                                            <p className="text-xs text-gray-500">{request.invoiceNumber}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-medium text-gray-900">{request.companyId}</p></td>
                                            <td className="px-6 py-4 whitespace-nowrap"><p className="text-sm font-bold text-indigo-600">{formatCurrency(request.fullAmount || request.totalAmount)}</p></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{request.employeeCount || "N/A"}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap"><p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p></td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleApprove(request)} disabled={isSubmitting} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50">
                                                        <CheckCircleIcon className="h-4 w-4" /> Configure & Approve
                                                    </button>
                                                    <button onClick={() => handleReject(request)} disabled={isSubmitting} className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50">
                                                        <XCircleIcon className="h-4 w-4" /> Reject
                                                    </button>
                                                    <button onClick={() => toggleRow(request.invoiceId)} className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200">
                                                        {isExpanded ? <ChevronUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Approval Modal with Installment Configuration + Split Table */}
            <AnimatePresence>
                {showApprovalModal && selectedRequest && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 rounded-lg"><CheckCircleIcon className="h-6 w-6 text-emerald-600" /></div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900">Configure & Approve</h2>
                                        <p className="text-sm text-gray-500">{selectedRequest.engineName} • {formatCurrency(selectedRequest.fullAmount || selectedRequest.totalAmount)}</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowApprovalModal(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="h-6 w-6" /></button>
                            </div>

                            <div className="space-y-5">
                                {/* Request Summary */}
                                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div><strong>Engine:</strong> {selectedRequest.engineName}</div>
                                        <div><strong>Company:</strong> {selectedRequest.companyId}</div>
                                        <div><strong>Full Amount:</strong> {formatCurrency(selectedRequest.fullAmount || selectedRequest.totalAmount)}</div>
                                        <div><strong>Employees:</strong> {selectedRequest.employeeCount}</div>
                                    </div>
                                    <div className="mt-2">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold uppercase ${
                                            isCoreEngine(selectedRequest.engineName || "") ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                                        }`}>
                                            {isCoreEngine(selectedRequest.engineName || "") ? "🔴 Core Engine – Full Payment Only" : "🟢 Advanced Engine – Milestone Payments Allowed"}
                                        </span>
                                    </div>
                                </div>

                                {/* HSN Code Input */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-900 mb-1">HSN Code *</label>
                                    <input
                                        type="text"
                                        value={hsnCode}
                                        onChange={(e) => setHsnCode(e.target.value)}
                                        placeholder="e.g., 998311"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <p className="text-[10px] text-gray-400 mt-0.5">Applied to the Proforma Invoice for this request</p>
                                </div>

                                {/* Payment Type Toggle (Advanced Only) */}
                                {isAdvancedEngine(selectedRequest.engineName || "") && (
                                    <div>
                                        <label className="block text-sm font-bold text-gray-900 mb-2">Payment Type</label>
                                        <div className="flex gap-3">
                                            <label className="flex items-center gap-2">
                                                <input type="radio" checked={approvalPaymentType === "full"} onChange={() => { setApprovalPaymentType("full"); setInstallmentRows([{ installmentNumber: 1, percentage: "100", splitRows: [{ item: "", description: "", amount: "" }], featureUnlocks: "" }]); }} className="text-indigo-600" />
                                                <span className="text-sm">Full Payment (100%)</span>
                                            </label>
                                            <label className="flex items-center gap-2">
                                                <input type="radio" checked={approvalPaymentType === "milestone"} onChange={() => setApprovalPaymentType("milestone")} className="text-indigo-600" />
                                                <span className="text-sm">Milestone-Based</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Allocate Core Engines (Advanced Only) */}
                                {isAdvancedEngine(selectedRequest.engineName || "") && (
                                    <div className="p-4 border border-indigo-100 bg-indigo-50/50 rounded-lg">
                                        <h3 className="text-sm font-semibold text-indigo-900 mb-2">Allocate Core Engines (Included at no extra cost)</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {CORE_ENGINE_NAMES.map(engine => (
                                                <label key={engine} className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedCoreEngines.includes(engine)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) setSelectedCoreEngines(prev => [...prev, engine]);
                                                            else setSelectedCoreEngines(prev => prev.filter(E => E !== engine));
                                                        }}
                                                        className="rounded text-indigo-600"
                                                    />
                                                    <span className="text-xs text-gray-700">{engine}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Installment Configuration (available for all to allow itemized splits) */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <label className="block text-sm font-bold text-gray-900">
                                            {approvalPaymentType === "milestone" ? "Installment Plan & Splits" : "Payment Split Details"}
                                        </label>
                                        {approvalPaymentType === "milestone" && (
                                            <button type="button" onClick={addInstallmentRow} className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100">
                                                <PlusIcon className="h-3.5 w-3.5" /> Add Installment
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {installmentRows.map((inst, instIndex) => {
                                            const instAmount = selectedRequest
                                                ? Math.round(((selectedRequest.fullAmount || selectedRequest.totalAmount) * (parseFloat(inst.percentage) || 0)) / 100)
                                                : 0;
                                            return (
                                                <div key={instIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                                    {/* Installment header */}
                                                    <div className="flex items-center gap-3 p-3 bg-gray-50">
                                                        <div className="flex items-center justify-center h-8 w-8 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold shrink-0">
                                                            {inst.installmentNumber}
                                                        </div>
                                                        <div className="flex-1 flex items-center gap-3">
                                                            <div className="w-32">
                                                                <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Percentage (%)</label>
                                                                <input
                                                                    type="number" min="1" max="100"
                                                                    value={inst.percentage}
                                                                    onChange={(e) => updateInstallmentPct(instIndex, e.target.value)}
                                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                                />
                                                            </div>
                                                            {inst.percentage && (
                                                                <span className="text-xs text-indigo-600 font-semibold mt-3">= {formatCurrency(instAmount)}</span>
                                                            )}
                                                        </div>
                                                        {installmentRows.length > 1 && (
                                                            <button type="button" onClick={() => removeInstallmentRow(instIndex)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg">
                                                                <TrashIcon className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Split Details Table */}
                                                    <div className="p-3">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="text-xs font-semibold text-gray-600">Split Details</label>
                                                            <button type="button" onClick={() => addSplitRow(instIndex)} className="text-[10px] font-medium text-indigo-600 hover:text-indigo-800">
                                                                + Add Row
                                                            </button>
                                                        </div>
                                                        <table className="w-full text-xs border border-gray-200 rounded">
                                                            <thead>
                                                                <tr className="bg-gray-100">
                                                                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-b">Item</th>
                                                                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-b">Description</th>
                                                                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-b w-24">HSN</th>
                                                                    <th className="px-2 py-1.5 text-left font-semibold text-gray-600 border-b w-24">Amount</th>
                                                                    <th className="px-2 py-1.5 border-b w-8"></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {inst.splitRows.map((split, splitIndex) => (
                                                                    <tr key={splitIndex} className="border-b border-gray-100">
                                                                        <td className="px-1 py-1">
                                                                            <input
                                                                                type="text" value={split.item}
                                                                                onChange={(e) => updateSplitRow(instIndex, splitIndex, "item", e.target.value)}
                                                                                placeholder="e.g. License Fee"
                                                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1">
                                                                            <input
                                                                                type="text" value={split.description}
                                                                                onChange={(e) => updateSplitRow(instIndex, splitIndex, "description", e.target.value)}
                                                                                placeholder="e.g. Annual license for module A"
                                                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1">
                                                                            <input
                                                                                type="text" value={split.hsnCode || ""}
                                                                                onChange={(e) => updateSplitRow(instIndex, splitIndex, "hsnCode", e.target.value)}
                                                                                placeholder="HSN Code"
                                                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1">
                                                                            <input
                                                                                type="text" value={split.amount}
                                                                                onChange={(e) => updateSplitRow(instIndex, splitIndex, "amount", e.target.value)}
                                                                                placeholder="₹0"
                                                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                                            />
                                                                        </td>
                                                                        <td className="px-1 py-1 text-center">
                                                                            {inst.splitRows.length > 1 && (
                                                                                <button type="button" onClick={() => removeSplitRow(instIndex, splitIndex)} className="text-rose-400 hover:text-rose-600">
                                                                                    <TrashIcon className="h-3.5 w-3.5" />
                                                                                </button>
                                                                            )}
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        {/* Feature Unlock Mapping */}
                                                        <div className="mt-3">
                                                            <label className="text-xs font-semibold text-indigo-700">Features Unlocked at this Milestone</label>
                                                            <input
                                                                type="text"
                                                                value={inst.featureUnlocks || ""}
                                                                onChange={(e) => {
                                                                    const updated = [...installmentRows];
                                                                    updated[instIndex] = { ...updated[instIndex], featureUnlocks: e.target.value };
                                                                    setInstallmentRows(updated);
                                                                }}
                                                                placeholder="e.g. Dashboard, Setup, Reports"
                                                                className="w-full mt-1 px-2 py-1.5 border border-indigo-200 rounded text-xs bg-indigo-50/50 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Percentage total indicator */}
                                    <div className={`mt-2 flex items-center gap-2 text-xs font-medium ${isPercentageValid ? "text-emerald-600" : "text-rose-600"}`}>
                                        <div className={`h-2 w-2 rounded-full ${isPercentageValid ? "bg-emerald-500" : "bg-rose-500"}`} />
                                        Total: {totalPercentage}% {isPercentageValid ? "✓" : "(must equal 100%)"}
                                    </div>
                                </div>

                                {/* Approval Notes */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Approval Notes (Optional)</label>
                                    <textarea value={approvalNotes} onChange={(e) => setApprovalNotes(e.target.value)} placeholder="Add any notes for the client..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={2} />
                                </div>

                                <div className="flex gap-3">
                                    <button onClick={() => setShowApprovalModal(false)} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
                                    <button onClick={submitApproval} disabled={isSubmitting || !isPercentageValid} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50">
                                        {isSubmitting ? "Approving..." : isCoreEngine(selectedRequest?.engineName || "") ? "Approve" : `Approve with ${installmentRows.length} Installment${installmentRows.length > 1 ? "s" : ""}`}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Active Installment Plans */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm mt-8">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center gap-3">
                    <BanknotesIcon className="h-5 w-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-gray-900">Active Installment Plans</h2>
                </div>
                {(!activePlans || activePlans.length === 0) ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No active installment plans</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Engine</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Installments Progress</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Remaining</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {activePlans.map((plan: any) => {
                                    const totalPaidAmount = plan.installments?.filter((i: any) => i.status === "paid").reduce((sum: number, i: any) => sum + (i.amount || 0), 0) || 0;
                                    const fullAmount = plan.fullAmount || plan.totalAmount || 0;
                                    const remainingAmount = Math.max(0, fullAmount - totalPaidAmount);
                                    const paidPercentage = fullAmount > 0 ? (totalPaidAmount / fullAmount) * 100 : 0;
                                    const nextUnpaid = plan.installments?.find((i: any) => (i.status === "unpaid" || i.status === "rejected") && !i.enabled);
                                    
                                    return (
                                        <tr key={plan.invoiceId} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{plan.companyId}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{plan.engineName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${paidPercentage}%` }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-500">{paidPercentage.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(remainingAmount)}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                {nextUnpaid ? (
                                                    <button
                                                        onClick={() => {
                                                            fetcher.submit(
                                                                {
                                                                    intent: "enable_installment",
                                                                    invoiceId: plan.invoiceId,
                                                                    orgId: plan.companyId,
                                                                    installmentNumber: String(nextUnpaid.installmentNumber)
                                                                },
                                                                { method: "post" }
                                                            );
                                                        }}
                                                        disabled={isSubmitting}
                                                        className="px-3 py-1 bg-indigo-600 text-white rounded shadow-sm hover:bg-indigo-700 disabled:opacity-50 text-xs"
                                                    >
                                                        Enable Pay (Inst {nextUnpaid.installmentNumber})
                                                    </button>
                                                ) : (
                                                    <span className="text-emerald-600 flex items-center gap-1 text-xs">
                                                        <CheckCircleIcon className="h-4 w-4" /> Fully Enabled / Paid
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            <AnimatePresence>
                {showRejectModal && selectedRequest && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl max-w-md w-full p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-rose-100 rounded-lg"><XCircleIcon className="h-6 w-6 text-rose-600" /></div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Reject Request</h2>
                                    <p className="text-sm text-gray-500">{selectedRequest.engineName} • {formatCurrency(selectedRequest.fullAmount || selectedRequest.totalAmount)}</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rejection Reason *</label>
                                    <textarea value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} placeholder="Explain why this request is being rejected..." className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500" rows={3} />
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setShowRejectModal(false)} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">Cancel</button>
                                    <button onClick={submitRejection} disabled={isSubmitting || !rejectionReason.trim()} className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50">
                                        {isSubmitting ? "Rejecting..." : "Reject"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Toast */}
            <AnimatePresence>
                {fetcher.data?.success && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-4 right-4 bg-emerald-600 text-white rounded-lg p-4 shadow-lg">
                        {fetcher.data.message}
                    </motion.div>
                )}
                {fetcher.data?.error && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="fixed bottom-4 right-4 bg-rose-600 text-white rounded-lg p-4 shadow-lg">
                        {fetcher.data.error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
