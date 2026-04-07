import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, useFetcher, useNavigation } from "@remix-run/react";
import { useState } from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    DocumentTextIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import {
    getPendingApprovalRequests,
    approvePaymentRequest,
    rejectPaymentRequest,
} from "~/models/payment.model.server";
import { requireAdminSession } from "~/lib/session.server";

interface ActionData {
    success?: boolean;
    message?: string;
    error?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await requireAdminSession(request);

    try {
        const pendingRequests = await getPendingApprovalRequests();

        // Calculate statistics
        const totalPending = pendingRequests.length;
        const totalAmount = pendingRequests.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
        const oldestRequest = pendingRequests.length > 0 ? pendingRequests[pendingRequests.length - 1] : null;

        return json({
            requests: pendingRequests,
            stats: {
                totalPending,
                totalAmount,
                oldestDate: oldestRequest?.createdAt || null,
            }
        });
    } catch (error) {
        console.error("Error loading pending approval requests:", error);
        return json({
            requests: [],
            stats: { totalPending: 0, totalAmount: 0, oldestDate: null }
        });
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    const admin = await requireAdminSession(request);
    const formData = await request.formData();
    const intent = formData.get("intent") as string;
    const invoiceId = formData.get("invoiceId") as string;
    const orgId = formData.get("orgId") as string;
    const adminId = admin.userId;

    try {
        if (intent === "approve") {
            const notes = formData.get("notes") as string;
            await approvePaymentRequest(invoiceId, orgId, adminId, notes || undefined);
            return json<ActionData>({ success: true, message: "Payment request approved" });
        }

        if (intent === "reject") {
            const reason = formData.get("reason") as string;
            if (!reason) {
                return json<ActionData>({ error: "Rejection reason is required" }, { status: 400 });
            }
            await rejectPaymentRequest(invoiceId, orgId, adminId, reason);
            return json<ActionData>({ success: true, message: "Payment request rejected" });
        }

        return json<ActionData>({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error processing payment request action:", error);
        return json<ActionData>({ error: "Failed to process action" }, { status: 500 });
    }
};

export default function AdminPaymentRequests() {
    const { requests, stats } = useLoaderData<typeof loader>();
    const fetcher = useFetcher<ActionData>();
    const navigation = useNavigation();

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [approvalNotes, setApprovalNotes] = useState("");
    const [showApprovalModal, setShowApprovalModal] = useState(false);

    const isSubmitting = navigation.state === "submitting";

    const filteredRequests = requests.filter((req: any) => {
        const matchesSearch =
            (req.engineName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.companyId || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (req.invoiceNumber || "").toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const toggleRow = (id: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedRows(newExpanded);
    };

    const handleApprove = (request: any) => {
        setSelectedRequest(request);
        setApprovalNotes("");
        setShowApprovalModal(true);
    };

    const handleReject = (request: any) => {
        setSelectedRequest(request);
        setRejectionReason("");
        setShowRejectModal(true);
    };

    const submitApproval = () => {
        if (!selectedRequest) return;
        fetcher.submit(
            {
                intent: "approve",
                invoiceId: selectedRequest.invoiceId,
                orgId: selectedRequest.companyId,
                notes: approvalNotes,
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

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
                        Review and approve/reject pending payment requests from clients
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Pending Approvals</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalPending}</p>
                        </div>
                        <div className="p-3 bg-amber-100 rounded-lg">
                            <ClockIcon className="h-6 w-6 text-amber-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Total Amount</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {formatCurrency(stats.totalAmount)}
                            </p>
                        </div>
                        <div className="p-3 bg-indigo-100 rounded-lg">
                            <BanknotesIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm font-medium">Oldest Request</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {stats.oldestDate ? formatDate(stats.oldestDate) : "None"}
                            </p>
                        </div>
                        <div className="p-3 bg-emerald-100 rounded-lg">
                            <DocumentTextIcon className="h-6 w-6 text-emerald-600" />
                        </div>
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
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Engine
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Company
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Payment %
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Requested
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {filteredRequests.map((request: any, index: number) => (
                                        <motion.tr
                                            key={request.invoiceId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-2 bg-blue-100 rounded">
                                                        <DocumentTextIcon className="h-4 w-4 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {request.engineName || "Unknown Engine"}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {request.invoiceNumber}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {request.companyId}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-sm font-bold text-indigo-600">
                                                    {formatCurrency(request.totalAmount)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {request.requestedPaymentPercent}%
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(request.createdAt)}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleApprove(request)}
                                                        disabled={isSubmitting}
                                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-50"
                                                    >
                                                        <CheckCircleIcon className="h-4 w-4" />
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(request)}
                                                        disabled={isSubmitting}
                                                        className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium bg-rose-100 text-rose-700 hover:bg-rose-200 disabled:opacity-50"
                                                    >
                                                        <XCircleIcon className="h-4 w-4" />
                                                        Reject
                                                    </button>
                                                    <button
                                                        onClick={() => toggleRow(request.invoiceId)}
                                                        className="inline-flex items-center px-3 py-2 rounded-lg text-xs font-medium bg-gray-100 text-gray-600 hover:bg-gray-200"
                                                    >
                                                        {expandedRows.has(request.invoiceId) ? (
                                                            <ChevronUpIcon className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDownIcon className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Approval Modal */}
            <AnimatePresence>
                {showApprovalModal && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-100 rounded-lg">
                                    <CheckCircleIcon className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Approve Request</h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedRequest.engineName} • {formatCurrency(selectedRequest.totalAmount)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Approval Notes (Optional)
                                    </label>
                                    <textarea
                                        value={approvalNotes}
                                        onChange={(e) => setApprovalNotes(e.target.value)}
                                        placeholder="Add any notes for the client..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        rows={3}
                                    />
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                                    <p className="font-medium mb-1">Request Details:</p>
                                    <ul className="space-y-1 text-xs">
                                        <li>
                                            <strong>Engine:</strong> {selectedRequest.engineName}
                                        </li>
                                        <li>
                                            <strong>Total Amount:</strong> {formatCurrency(selectedRequest.fullAmount)}
                                        </li>
                                        <li>
                                            <strong>Requested:</strong> {formatCurrency(selectedRequest.totalAmount)} (
                                            {selectedRequest.requestedPaymentPercent}%)
                                        </li>
                                        <li>
                                            <strong>Employees:</strong> {selectedRequest.employeeCount}
                                        </li>
                                    </ul>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowApprovalModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitApproval}
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Approving..." : "Approve"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Rejection Modal */}
            <AnimatePresence>
                {showRejectModal && selectedRequest && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            className="bg-white rounded-xl max-w-md w-full p-6"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-rose-100 rounded-lg">
                                    <XCircleIcon className="h-6 w-6 text-rose-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-gray-900">Reject Request</h2>
                                    <p className="text-sm text-gray-500">
                                        {selectedRequest.engineName} • {formatCurrency(selectedRequest.totalAmount)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Rejection Reason *
                                    </label>
                                    <textarea
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Explain why this request is being rejected..."
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                        rows={3}
                                    />
                                </div>

                                <div className="bg-rose-50 rounded-lg p-4 text-sm text-rose-700">
                                    <p className="font-medium">⚠️ Note:</p>
                                    <p className="text-xs mt-1">
                                        The client will receive this rejection reason and can resubmit their request.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowRejectModal(false)}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={submitRejection}
                                        disabled={isSubmitting || !rejectionReason.trim()}
                                        className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Rejecting..." : "Reject"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Success/Error Toast */}
            <AnimatePresence>
                {fetcher.data?.success && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-4 right-4 bg-emerald-600 text-white rounded-lg p-4 shadow-lg"
                    >
                        {fetcher.data.message}
                    </motion.div>
                )}
                {fetcher.data?.error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-4 right-4 bg-rose-600 text-white rounded-lg p-4 shadow-lg"
                    >
                        {fetcher.data.error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
