import { useLoaderData, useFetcher, Link } from "@remix-run/react";
import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useState } from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    EyeIcon,
    ClockIcon,
    ArrowDownTrayIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ArrowTopRightOnSquareIcon,
    DocumentTextIcon,
    CreditCardIcon,
    CalendarDaysIcon,
    HashtagIcon,
    InboxStackIcon,
    BanknotesIcon,
    ArrowTrendingUpIcon,
    XMarkIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import {
    getPendingPaymentVerifications,
    verifyPayment,
    rejectPayment,
} from "~/models/payment.model.server";
import { getPresignedGetUrl } from "~/lib/s3.server";
import { requireAdminSession } from "~/lib/session.server";

// Type for action responses
interface ActionData {
    success?: boolean;
    message?: string;
    error?: string;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
    await requireAdminSession(request);

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
    const admin = await requireAdminSession(request);
    const formData = await request.formData();
    const intent = formData.get("intent") as string;
    const invoiceId = formData.get("invoiceId") as string;
    const orgId = formData.get("orgId") as string;
    const adminId = admin.userId;

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

    const [showFilters, setShowFilters] = useState(false);
    const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
    const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
    const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
    const [engineFilter, setEngineFilter] = useState<string>('all');
    const [amountFilter, setAmountFilter] = useState({ min: '', max: '' });

    const fetcher = useFetcher<ActionData>();

    const uniqueEngines = Array.from(new Set(
        payments.flatMap((p: any) => p.items?.map((item: any) => item.engineName) || [])
    )).sort();

    const filteredPayments = payments.filter((payment: any) => {
        const matchesSearch =
            payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.companyId.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;

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

        if (paymentMethodFilter !== 'all' && payment.paymentMethod !== paymentMethodFilter) {
            return false;
        }

        if (engineFilter !== 'all') {
            const hasEngine = payment.items?.some((item: any) => item.engineName === engineFilter);
            if (!hasEngine) return false;
        }

        if (amountFilter.min && payment.totalAmount < parseFloat(amountFilter.min)) {
            return false;
        }
        if (amountFilter.max && payment.totalAmount > parseFloat(amountFilter.max)) {
            return false;
        }

        return true;
    });

    const hasActiveFilters =
        dateFilter !== 'all' ||
        paymentMethodFilter !== 'all' ||
        engineFilter !== 'all' ||
        amountFilter.min !== '' ||
        amountFilter.max !== '';

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

    const getPaymentMethodStyles = (method: string) => {
        const styles = {
            bank_transfer: { color: "text-blue-600 bg-blue-50 border-blue-100", text: "Bank Transfer" },
            upi: { color: "text-purple-600 bg-purple-50 border-purple-100", text: "UPI" },
            qr_code: { color: "text-emerald-600 bg-emerald-50 border-emerald-100", text: "QR Code" }
        };
        return styles[method as keyof typeof styles] || styles.bank_transfer;
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">FinOps Verification</h1>
                    <p className="text-gray-500 font-medium">Audit and approve high-value transactions across the platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium shadow-sm outline-none"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2.5 rounded-xl border transition-all ${showFilters ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 text-gray-500 hover:border-indigo-300'}`}
                    >
                        <FunnelIcon className="h-5 w-5" />
                    </button>
                </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                        <InboxStackIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Awaiting Verification</p>
                        <p className="text-3xl font-black text-gray-900">{stats.totalPending}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
                        <BanknotesIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pending Volume</p>
                        <p className="text-3xl font-black text-gray-900">₹{stats.totalAmount.toLocaleString()}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-5">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl">
                        <ArrowTrendingUpIcon className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Velocity (24h)</p>
                        <p className="text-3xl font-black text-gray-900">{stats.todaySubmissions}</p>
                    </div>
                </div>
            </div>

            {/* Action Notifications */}
            <AnimatePresence>
                {fetcher.data?.success && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3"
                    >
                        <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                        <p className="text-sm font-bold text-emerald-800">{fetcher.data.message}</p>
                    </motion.div>
                )}
                {fetcher.data?.error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3"
                    >
                        <XCircleIcon className="h-5 w-5 text-rose-600" />
                        <p className="text-sm font-bold text-rose-800">{fetcher.data.error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Temporal Filter</label>
                                <select
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value as any)}
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-indigo-100 transition-all cursor-pointer"
                                >
                                    <option value="all">Fecundity (All Time)</option>
                                    <option value="today">Synchronized Today</option>
                                    <option value="week">Past 168 Hours</option>
                                    <option value="month">Last 30 Cycles</option>
                                    <option value="custom">Manual Spectrum</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Modality</label>
                                <select
                                    value={paymentMethodFilter}
                                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-indigo-100 transition-all cursor-pointer"
                                >
                                    <option value="all">All Channels</option>
                                    <option value="bank_transfer">Bank Wire</option>
                                    <option value="upi">Unified (UPI)</option>
                                    <option value="qr_code">Static QR</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Product Engine</label>
                                <select
                                    value={engineFilter}
                                    onChange={(e) => setEngineFilter(e.target.value)}
                                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold text-gray-700 outline-none ring-2 ring-transparent focus:ring-indigo-100 transition-all cursor-pointer"
                                >
                                    <option value="all">All Engines</option>
                                    {uniqueEngines.map((engine) => (
                                        <option key={engine} value={engine}>{engine}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase mb-2">Value Range</label>
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        placeholder="Min"
                                        value={amountFilter.min}
                                        onChange={(e) => setAmountFilter({ ...amountFilter, min: e.target.value })}
                                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-100 transition-all"
                                    />
                                    <input
                                        type="number"
                                        placeholder="Max"
                                        value={amountFilter.max}
                                        onChange={(e) => setAmountFilter({ ...amountFilter, max: e.target.value })}
                                        className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-2.5 text-sm font-bold outline-none ring-2 ring-transparent focus:ring-indigo-100 transition-all"
                                    />
                                </div>
                            </div>
                            {hasActiveFilters && (
                                <div className="lg:col-span-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                    <p className="text-xs font-bold text-indigo-600">Filtering active: {filteredPayments.length} results</p>
                                    <button onClick={clearAllFilters} className="text-xs font-black text-rose-500 uppercase tracking-widest hover:text-rose-600 transition-colors">Clear Global Filters</button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Table */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Instrument</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Counterparty</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Value (INR)</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Protocol</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Chronology</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Audit Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredPayments.map((payment: any, idx: number) => {
                                const methodStyles = getPaymentMethodStyles(payment.paymentMethod);
                                return (
                                    <Fragment key={payment.invoiceId}>
                                        <motion.tr
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-gray-50/50 transition-colors"
                                        >
                                            <td className="px-6 py-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 bg-indigo-50 text-indigo-600 flex items-center justify-center rounded-xl shadow-sm border border-indigo-100">
                                                        <DocumentTextIcon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-gray-900">{payment.invoiceNumber}</p>
                                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">ID: #{payment.invoiceId.slice(0, 8)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div>
                                                    <p className="text-sm font-bold text-gray-700 truncate max-w-[140px]">{payment.companyId}</p>
                                                    <Link to={`/admin/companies/${payment.companyId}`} className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 group/link mt-0.5">
                                                        Deep Audit <ArrowTopRightOnSquareIcon className="h-2.5 w-2.5 transition-transform group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-sm font-black text-gray-900">₹{payment.totalAmount.toLocaleString()}</p>
                                                <p className="text-[10px] font-bold text-emerald-600 uppercase">Input Inclusive</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex justify-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${methodStyles.color}`}>
                                                        {methodStyles.text}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <p className="text-xs font-bold text-gray-600">
                                                    {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending'}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5 italic">Synchronized</p>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    {payment.signedProofUrl && (
                                                        <button
                                                            onClick={() => viewProof(payment.signedProofUrl)}
                                                            className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                                            title="Inspect Artifact"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleVerify(payment)}
                                                        className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all shadow-sm border border-emerald-100"
                                                        title="Finalize Verification"
                                                    >
                                                        <CheckCircleIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(payment)}
                                                        className="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-600 hover:text-white transition-all shadow-sm border border-rose-100"
                                                        title="Revoke Transaction"
                                                    >
                                                        <XCircleIcon className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleRow(payment.invoiceId)}
                                                        className="p-2 bg-gray-50 text-gray-400 rounded-lg hover:bg-gray-100 transition-all border border-gray-100"
                                                    >
                                                        {expandedRows.has(payment.invoiceId) ? <ChevronUpIcon className="h-4 w-4 text-indigo-600" /> : <ChevronDownIcon className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </motion.tr>
                                        <AnimatePresence>
                                            {expandedRows.has(payment.invoiceId) && (
                                                <motion.tr
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="bg-slate-50/50"
                                                >
                                                    <td colSpan={6} className="px-8 py-6">
                                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <InboxStackIcon className="h-3 w-3" /> Artifact Line Items
                                                                </h4>
                                                                <div className="space-y-2">
                                                                    {payment.items.map((item: any, i: number) => (
                                                                        <div key={i} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                                                                            <div>
                                                                                <p className="text-sm font-bold text-gray-900">{item.engineName}</p>
                                                                                <p className="text-[10px] font-bold text-gray-400 mt-0.5">Deployment Ready</p>
                                                                            </div>
                                                                            <p className="text-sm font-black text-gray-900">₹{item.price.toLocaleString()}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                            <div className="space-y-4">
                                                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                                                    <HashtagIcon className="h-3 w-3" /> Transaction Metadata
                                                                </h4>
                                                                <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                                                                    <div className="flex justify-between border-b border-gray-50 pb-2">
                                                                        <span className="text-xs font-bold text-gray-400">System Trace ID</span>
                                                                        <span className="text-xs font-bold text-gray-900 font-mono">{payment.transactionId || 'NOT_LOGGED'}</span>
                                                                    </div>
                                                                    <div className="pt-2">
                                                                        <span className="text-[10px] font-black text-gray-400 uppercase mb-2 block">Synchronizer Notes</span>
                                                                        <p className="text-sm font-medium text-gray-600 italic">
                                                                            {payment.paymentNotes || "No evidentiary notes recorded by counterparty during ingress."}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            )}
                                        </AnimatePresence>
                                    </Fragment>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {filteredPayments.length === 0 && (
                    <div className="p-24 text-center">
                        <InboxStackIcon className="h-20 w-20 text-gray-100 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Spectrum Clear</h3>
                        <p className="text-gray-500 font-medium">No pending transactions currently requiring administrative audit.</p>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            <AnimatePresence>
                {showRejectModal && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-[2.5rem] max-w-lg w-full p-10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6">
                                <button onClick={() => setShowRejectModal(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                            <div className="h-16 w-16 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-8">
                                <XCircleIcon className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Revoke Transaction</h3>
                            <p className="text-gray-500 font-medium mb-8">
                                You are about to reject payment for <span className="text-gray-900 font-bold underline">#{selectedPayment?.invoiceNumber}</span>. Please specify the audit discrepancy.
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="e.g., Evidence mismatch, insufficient artifacts provided..."
                                rows={4}
                                className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 text-sm font-medium focus:ring-4 focus:ring-rose-500/5 outline-none transition-all mb-8"
                            />
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowRejectModal(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitRejection}
                                    className="flex-1 px-6 py-4 bg-gray-900 text-white rounded-2xl text-sm font-bold shadow-xl shadow-gray-900/20 hover:bg-gray-800 transition-all"
                                >
                                    Confirm Revocation
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Proof View Modal */}
            <AnimatePresence>
                {showProofModal && (
                    <div className="fixed inset-0 bg-gray-950/95 z-[200] flex flex-col p-8" onClick={() => setShowProofModal(false)}>
                        <div className="flex items-center justify-between mb-8" onClick={e => e.stopPropagation()}>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight">FinOps Evidence</h3>
                                <p className="text-indigo-400 font-bold uppercase tracking-widest text-xs">Artifact Validation Mode</p>
                            </div>
                            <div className="flex gap-4">
                                <a
                                    href={proofImageUrl}
                                    download
                                    className="p-3 bg-white/10 text-white rounded-2xl hover:bg-white/20 transition-all border border-white/10 flex items-center gap-3 font-bold text-sm"
                                >
                                    <ArrowDownTrayIcon className="h-5 w-5 text-indigo-400" />
                                    Download Original
                                </a>
                                <button
                                    onClick={() => setShowProofModal(false)}
                                    className="p-3 bg-white text-gray-900 rounded-2xl font-bold flex items-center justify-center shadow-2xl"
                                >
                                    <XMarkIcon className="h-6 w-6" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center overflow-auto rounded-[3rem] bg-black/40 border border-white/5" onClick={e => e.stopPropagation()}>
                            <img src={proofImageUrl} alt="Evidence Artifact" className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl" />
                        </div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function Fragment({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
