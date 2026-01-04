import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import {
    CheckCircle,
    XCircle,
    Eye,
    Clock,
    Download,
    Search,
    Filter,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    FileText,
    CreditCard,
    Calendar,
    Hash,
    Package,
    DollarSign,
    TrendingUp
} from "lucide-react";
import {
    getPendingPaymentVerifications,
    verifyPayment,
    rejectPayment,
    getPaymentRecord,
    PaymentRecord
} from "~/models/payment.model";
import { getPresignedGetUrl } from "~/lib/s3.server";

// Type for action responses
interface ActionData {
    success?: boolean;
    message?: string;
    error?: string;
}

// Helper for class names
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    // TODO: Add admin authentication check
    // const admin = await requireAdminSession(request);

    try {
        const pendingPayments = await getPendingPaymentVerifications();

        // Get presigned URLs for payment proofs
        const paymentsWithUrls = await Promise.all(
            pendingPayments.map(async (payment) => {
                let proofUrl = null;
                if (payment.paymentProofUrl) {
                    try {
                        proofUrl = await getPresignedGetUrl(payment.paymentProofUrl);
                    } catch (e) {
                        console.error("Error getting presigned URL:", e);
                    }
                }
                return { ...payment, signedProofUrl: proofUrl };
            })
        );

        // Calculate statistics
        const totalPending = paymentsWithUrls.length;
        const totalAmount = paymentsWithUrls.reduce((sum, p) => sum + p.totalAmount, 0);
        const todaySubmissions = paymentsWithUrls.filter(p => {
            const submittedDate = new Date(p.updatedAt).toDateString();
            const today = new Date().toDateString();
            return submittedDate === today;
        }).length;

        return json({
            payments: paymentsWithUrls,
            stats: {
                totalPending,
                totalAmount,
                todaySubmissions
            }
        });
    } catch (error) {
        console.error("Error loading pending payments:", error);
        return json({ payments: [], stats: { totalPending: 0, totalAmount: 0, todaySubmissions: 0 } });
    }
};

export const action = async ({ request }: ActionFunctionArgs) => {
    // TODO: Add admin authentication check
    // const admin = await requireAdminSession(request);

    const formData = await request.formData();
    const intent = formData.get("intent") as string;
    const invoiceId = formData.get("invoiceId") as string;
    const orgId = formData.get("orgId") as string;
    const adminId = "admin-user-id"; // TODO: Get from session

    try {
        if (intent === "verify") {
            const notes = formData.get("notes") as string;
            await verifyPayment(invoiceId, orgId, adminId, notes || undefined);
            return json<ActionData>({ success: true, message: "Payment verified successfully" });
        }

        if (intent === "reject") {
            const reason = formData.get("reason") as string;
            if (!reason) {
                return json<ActionData>({ error: "Rejection reason is required" }, { status: 400 });
            }
            await rejectPayment(invoiceId, orgId, adminId, reason);
            return json<ActionData>({ success: true, message: "Payment rejected" });
        }

        return json<ActionData>({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error processing payment action:", error);
        return json<ActionData>({ error: "Failed to process action" }, { status: 500 });
    }
};

export default function AdminPaymentVerification() {
    const { payments, stats } = useLoaderData<typeof loader>();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
    const [showProofModal, setShowProofModal] = useState(false);
    const [proofImageUrl, setProofImageUrl] = useState("");

    // Advanced Filters
    const [showFilters, setShowFilters] = useState(false);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    const [engineFilter, setEngineFilter] = useState<string>('all');
    const [amountFilter, setAmountFilter] = useState({ min: '', max: '' });

    const fetcher = useFetcher<ActionData>();

    // Get unique engines from all payments
    const uniqueEngines = Array.from(new Set(
        payments.flatMap((p: any) => p.items?.map((item: any) => item.engineName) || [])
    )).sort();

    // Apply all filters
    const filteredPayments = payments.filter((payment: any) => {
        // Search filter
        const matchesSearch =
            payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.companyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

        // Date filter
        const paymentDate = new Date(payment.paymentDate || payment.updatedAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let matchesDate = true;
        if (dateFilter === 'today') {
            const paymentDateOnly = new Date(paymentDate);
            paymentDateOnly.setHours(0, 0, 0, 0);
            matchesDate = paymentDateOnly.getTime() === today.getTime();
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(today);
            weekAgo.setDate(weekAgo.getDate() - 7);
            matchesDate = paymentDate >= weekAgo;
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(today);
            monthAgo.setMonth(monthAgo.getMonth() - 1);
            matchesDate = paymentDate >= monthAgo;
        } else if (dateFilter === 'custom' && customDateRange.start && customDateRange.end) {
            const start = new Date(customDateRange.start);
            const end = new Date(customDateRange.end);
            end.setHours(23, 59, 59, 999);
            matchesDate = paymentDate >= start && paymentDate <= end;
        }

        if (!matchesDate) return false;

        // Payment method filter
        if (paymentMethodFilter !== 'all' && payment.paymentMethod !== paymentMethodFilter) {
            return false;
        }

        // Engine filter
        if (engineFilter !== 'all') {
            const hasEngine = payment.items?.some((item: any) => item.engineName === engineFilter);
            if (!hasEngine) return false;
        }

        // Amount filter
        if (amountFilter.min && payment.totalAmount < parseFloat(amountFilter.min)) {
            return false;
        }
        if (amountFilter.max && payment.totalAmount > parseFloat(amountFilter.max)) {
            return false;
        }

        return true;
    });

    // Calculate filtered stats
    const filteredStats = {
        count: filteredPayments.length,
        totalAmount: filteredPayments.reduce((sum: number, p: any) => sum + p.totalAmount, 0)
    };

    // Check if any filters are active
    const hasActiveFilters =
        dateFilter !== 'all' ||
        paymentMethodFilter !== 'all' ||
        engineFilter !== 'all' ||
        amountFilter.min !== '' ||
        amountFilter.max !== '';

    // Clear all filters
    const clearAllFilters = () => {
        setDateFilter('all');
        setCustomDateRange({ start: '', end: '' });
        setPaymentMethodFilter('all');
        setEngineFilter('all');
        setAmountFilter({ min: '', max: '' });
        setSearchTerm('');
    };

    const toggleRow = (invoiceId: string) => {
        const newExpanded = new Set(expandedRows);
        if (newExpanded.has(invoiceId)) {
            newExpanded.delete(invoiceId);
        } else {
            newExpanded.add(invoiceId);
        }
        setExpandedRows(newExpanded);
    };

    const handleVerify = (payment: any) => {
        if (confirm(`Verify payment for invoice ${payment.invoiceNumber}?`)) {
            fetcher.submit(
                {
                    intent: "verify",
                    invoiceId: payment.invoiceId,
                    orgId: payment.companyId,
                    notes: ""
                },
                { method: "post" }
            );
        }
    };

    const handleReject = (payment: any) => {
        setSelectedPayment(payment);
        setShowRejectModal(true);
    };

    const submitRejection = () => {
        if (!rejectionReason.trim()) {
            alert("Please provide a rejection reason");
            return;
        }

        fetcher.submit(
            {
                intent: "reject",
                invoiceId: selectedPayment.invoiceId,
                orgId: selectedPayment.companyId,
                reason: rejectionReason
            },
            { method: "post" }
        );

        setShowRejectModal(false);
        setRejectionReason("");
        setSelectedPayment(null);
    };

    const viewProof = (url: string) => {
        setProofImageUrl(url);
        setShowProofModal(true);
    };

    const getPaymentMethodBadge = (method: string) => {
        const badges = {
            bank_transfer: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: CreditCard, text: "Bank Transfer" },
            upi: { color: "bg-purple-100 text-purple-800 border-purple-200", icon: CreditCard, text: "UPI" },
            qr_code: { color: "bg-green-100 text-green-800 border-green-200", icon: CreditCard, text: "QR Code" }
        };
        const badge = badges[method as keyof typeof badges] || badges.bank_transfer;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badge.color}`}>
                <Icon className="w-3.5 h-3.5" />
                {badge.text}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment Verification</h1>
                    <p className="text-gray-600 mt-2">Review and verify pending payment submissions</p>
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm font-medium">Pending Payments</p>
                                <p className="text-3xl font-bold mt-2">{stats.totalPending}</p>
                            </div>
                            <Clock className="w-12 h-12 text-blue-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm font-medium">Total Amount</p>
                                <p className="text-3xl font-bold mt-2">₹{stats.totalAmount.toLocaleString()}</p>
                            </div>
                            <DollarSign className="w-12 h-12 text-green-200" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm font-medium">Today's Submissions</p>
                                <p className="text-3xl font-bold mt-2">{stats.todaySubmissions}</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-purple-200" />
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {fetcher.data?.success && (
                    <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-green-800">{fetcher.data.message}</p>
                    </div>
                )}

                {fetcher.data?.error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-800">{fetcher.data.error}</p>
                    </div>
                )}

                {/* Search and Filter */}
                <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                    <div className="flex gap-4 mb-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by invoice number, company ID, or transaction ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-medium transition-colors ${showFilters || hasActiveFilters
                                    ? 'bg-blue-50 border-blue-500 text-blue-700'
                                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                            {hasActiveFilters && (
                                <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {[dateFilter !== 'all', paymentMethodFilter !== 'all', engineFilter !== 'all', amountFilter.min || amountFilter.max].filter(Boolean).length}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Date Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                                    <select
                                        value={dateFilter}
                                        onChange={(e) => setDateFilter(e.target.value as any)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Time</option>
                                        <option value="today">Today</option>
                                        <option value="week">Last 7 Days</option>
                                        <option value="month">Last 30 Days</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>

                                {/* Payment Method Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                                    <select
                                        value={paymentMethodFilter}
                                        onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Methods</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                        <option value="upi">UPI</option>
                                        <option value="qr_code">QR Code</option>
                                    </select>
                                </div>

                                {/* Engine Filter */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Engine</label>
                                    <select
                                        value={engineFilter}
                                        onChange={(e) => setEngineFilter(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">All Engines</option>
                                        {uniqueEngines.map((engine) => (
                                            <option key={engine} value={engine}>{engine}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Amount Range */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Amount Range</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={amountFilter.min}
                                            onChange={(e) => setAmountFilter({ ...amountFilter, min: e.target.value })}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={amountFilter.max}
                                            onChange={(e) => setAmountFilter({ ...amountFilter, max: e.target.value })}
                                            className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Custom Date Range */}
                            {dateFilter === 'custom' && (
                                <div className="grid grid-cols-2 gap-4 mt-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                        <input
                                            type="date"
                                            value={customDateRange.start}
                                            onChange={(e) => setCustomDateRange({ ...customDateRange, start: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                        <input
                                            type="date"
                                            value={customDateRange.end}
                                            onChange={(e) => setCustomDateRange({ ...customDateRange, end: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Active Filters & Clear Button */}
                            {hasActiveFilters && (
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                                    <div className="flex flex-wrap gap-2">
                                        {dateFilter !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                                📅 {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'Last 7 Days' : dateFilter === 'month' ? 'Last 30 Days' : 'Custom Range'}
                                                <button onClick={() => setDateFilter('all')} className="hover:text-blue-900">×</button>
                                            </span>
                                        )}
                                        {paymentMethodFilter !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                                                💳 {paymentMethodFilter.replace('_', ' ').toUpperCase()}
                                                <button onClick={() => setPaymentMethodFilter('all')} className="hover:text-purple-900">×</button>
                                            </span>
                                        )}
                                        {engineFilter !== 'all' && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                                🔧 {engineFilter}
                                                <button onClick={() => setEngineFilter('all')} className="hover:text-green-900">×</button>
                                            </span>
                                        )}
                                        {(amountFilter.min || amountFilter.max) && (
                                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                                                💰 ₹{amountFilter.min || '0'} - ₹{amountFilter.max || '∞'}
                                                <button onClick={() => setAmountFilter({ min: '', max: '' })} className="hover:text-orange-900">×</button>
                                            </span>
                                        )}
                                    </div>
                                    <button
                                        onClick={clearAllFilters}
                                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Clear All Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Filtered Results Summary */}
                    {hasActiveFilters && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                Showing <span className="font-bold">{filteredStats.count}</span> payment{filteredStats.count !== 1 ? 's' : ''}
                                {' '}totaling <span className="font-bold">₹{filteredStats.totalAmount.toLocaleString()}</span>
                                {' '}(filtered from {stats.totalPending} total)
                            </p>
                        </div>
                    )}
                </div>

                {/* Payments Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {filteredPayments.length === 0 ? (
                        <div className="text-center py-12">
                            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Payments</h3>
                            <p className="text-gray-600">
                                {searchTerm ? "No payments match your search" : "All payments have been processed"}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Invoice
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Transaction ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                        <th className="px-6 py-3"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredPayments.map((payment: any) => (
                                        <>
                                            <tr key={payment.invoiceId} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {payment.invoiceNumber}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {new Date(payment.invoiceDate).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                        {payment.companyId}
                                                    </div>
                                                    <a
                                                        href={`/admin/companies/${payment.companyId}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 mt-1"
                                                    >
                                                        <ExternalLink className="w-3 h-3" />
                                                        View Dashboard
                                                    </a>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-semibold text-gray-900">
                                                        ₹{payment.totalAmount.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        GST: ₹{payment.gstAmount.toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getPaymentMethodBadge(payment.paymentMethod || 'bank_transfer')}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {payment.transactionId ? (
                                                        <div className="flex items-center gap-1.5">
                                                            <Hash className="w-3.5 h-3.5 text-gray-400" />
                                                            <span className="text-sm font-mono text-gray-900">
                                                                {payment.transactionId}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-gray-400">N/A</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {payment.signedProofUrl && (
                                                            <button
                                                                onClick={() => viewProof(payment.signedProofUrl)}
                                                                className="text-indigo-600 hover:text-indigo-900 p-1.5 rounded-md hover:bg-indigo-50 transition-colors"
                                                                title="View Payment Proof"
                                                            >
                                                                <Eye className="h-5 w-5" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => handleVerify(payment)}
                                                            disabled={fetcher.state === "submitting"}
                                                            className="text-green-600 hover:text-green-900 p-1.5 rounded-md hover:bg-green-50 disabled:opacity-50 transition-colors"
                                                            title="Verify Payment"
                                                        >
                                                            <CheckCircle className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(payment)}
                                                            disabled={fetcher.state === "submitting"}
                                                            className="text-red-600 hover:text-red-900 p-1.5 rounded-md hover:bg-red-50 disabled:opacity-50 transition-colors"
                                                            title="Reject Payment"
                                                        >
                                                            <XCircle className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button
                                                        onClick={() => toggleRow(payment.invoiceId)}
                                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                                    >
                                                        {expandedRows.has(payment.invoiceId) ? (
                                                            <ChevronUp className="w-5 h-5" />
                                                        ) : (
                                                            <ChevronDown className="w-5 h-5" />
                                                        )}
                                                    </button>
                                                </td>
                                            </tr>
                                            {expandedRows.has(payment.invoiceId) && (
                                                <tr>
                                                    <td colSpan={8} className="px-6 py-4 bg-gray-50">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            {/* Invoice Items */}
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                    <Package className="w-4 h-4" />
                                                                    Invoice Items
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {payment.items.map((item: any, idx: number) => (
                                                                        <div key={idx} className="bg-white rounded-lg p-3 border border-gray-200">
                                                                            <div className="flex justify-between items-start">
                                                                                <div>
                                                                                    <p className="text-sm font-medium text-gray-900">{item.engineName}</p>
                                                                                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                                                                                </div>
                                                                                <p className="text-sm font-semibold text-gray-900">₹{item.price.toLocaleString()}</p>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>

                                                            {/* Payment Notes */}
                                                            <div>
                                                                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                    <FileText className="w-4 h-4" />
                                                                    Payment Notes
                                                                </h4>
                                                                {payment.paymentNotes ? (
                                                                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                                                                        <p className="text-sm text-gray-700">{payment.paymentNotes}</p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-sm text-gray-400 italic">No notes provided</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Rejection Modal */}
                {showRejectModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Payment</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Invoice: {selectedPayment?.invoiceNumber}
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter reason for rejection..."
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
                            />
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setShowRejectModal(false);
                                        setRejectionReason("");
                                        setSelectedPayment(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitRejection}
                                    disabled={fetcher.state === "submitting"}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg"
                                >
                                    {fetcher.state === "submitting" ? "Rejecting..." : "Reject Payment"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Proof Modal */}
                {showProofModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50" onClick={() => setShowProofModal(false)}>
                        <div className="max-w-4xl w-full bg-white rounded-lg p-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">Payment Proof</h3>
                                <div className="flex gap-2">
                                    <a
                                        href={proofImageUrl}
                                        download
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download
                                    </a>
                                    <button
                                        onClick={() => setShowProofModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-[70vh] overflow-auto">
                                <img src={proofImageUrl} alt="Payment Proof" className="w-full h-auto rounded-lg" />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
