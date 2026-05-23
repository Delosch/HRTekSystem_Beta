import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getPendingApprovalRequests } from "~/models/payment.model.server";
import {
    DocumentTextIcon,
    BuildingOffice2Icon,
    CalendarIcon,
    BanknotesIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ExclamationTriangleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    ChevronDownIcon,
    ArrowDownTrayIcon,
    ArrowTopRightOnSquareIcon,
    TableCellsIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

export async function loader({ request }: LoaderFunctionArgs) {
    await requireAdminSession(request);

    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");

    try {
        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        let filterExpression = "begins_with(pk, :invoicePrefix)";
        const expressionValues: any = { ":invoicePrefix": "INVOICE#" };

        if (statusFilter) {
            filterExpression += " AND #status = :statusValue";
            expressionValues[":statusValue"] = statusFilter;
        }

        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: filterExpression,
            ExpressionAttributeNames: statusFilter ? { "#status": "status" } : undefined,
            ExpressionAttributeValues: expressionValues
        });

        const response = await ddbDocClient.send(command);
        const invoices = response.Items || [];

        // Get pending approval payment requests
        const pendingPaymentRequests = await getPendingApprovalRequests();

        return json({
            invoices,
            pendingPaymentRequests,
            totalCount: invoices.length,
            statusFilter,
            error: null as string | null
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return json({
            error: "Failed to fetch invoices from database",
            invoices: [],
            pendingPaymentRequests: [],
            totalCount: 0,
            statusFilter
        });
    }
}

export default function AdminInvoices() {
    const { invoices, pendingPaymentRequests, totalCount, statusFilter, error } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();

    const getStatusStyles = (status: string) => {
        const styles = {
            paid: { color: "text-emerald-700 bg-emerald-50 border-emerald-100", icon: CheckCircleIcon, label: "Settled" },
            pending: { color: "text-amber-700 bg-amber-50 border-amber-100", icon: ClockIcon, label: "Processing" },
            overdue: { color: "text-rose-700 bg-rose-50 border-rose-100", icon: ExclamationTriangleIcon, label: "Overdue" },
            cancelled: { color: "text-gray-500 bg-gray-50 border-gray-100", icon: XCircleIcon, label: "Voided" },
            request_pending_approval: { color: "text-blue-700 bg-blue-50 border-blue-100", icon: ClockIcon, label: "Awaiting Approval" },
        };
        return styles[status as keyof typeof styles] || styles.pending;
    };

    const stats = [
        { label: 'Total Invoices', value: totalCount, icon: DocumentTextIcon, color: 'indigo' },
        { label: 'Pending Approval', value: pendingPaymentRequests.length, icon: ClockIcon, color: 'blue' },
        { label: 'Pending Audit', value: invoices.filter((i: any) => i.status === "pending").length, icon: ClockIcon, color: 'amber' },
        { label: 'Revenue Finalized', value: invoices.filter((i: any) => i.status === "paid").length, icon: CheckCircleIcon, color: 'emerald' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in duration-700">
            {/* Ledger Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                            <BanknotesIcon className="h-6 w-6 text-white" />
                        </div>
                        Financial Ledger
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">Audit, reconcile, and synchronize all primary ingress invoices.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/payments"
                        className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                        <ClockIcon className="h-4 w-4" />
                        Approval Queue
                    </Link>
                    <Link
                        to="/admin/payments/verification"
                        className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <CheckCircleIcon className="h-4 w-4" />
                        Verify Proofs
                    </Link>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search ledger..."
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm font-bold shadow-sm outline-none ring-4 ring-transparent focus:ring-indigo-100 transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] border border-gray-50 shadow-sm flex items-center gap-4 group hover:shadow-md transition-all"
                    >
                        <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600 group-hover:scale-110 transition-transform`}>
                            <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{stat.label}</p>
                            <p className="text-xl font-black text-gray-900">{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Pending Approval Requests Section */}
            {pendingPaymentRequests.length > 0 && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-[2.5rem] border border-blue-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <ClockIcon className="h-6 w-6 text-blue-600" />
                            <div>
                                <h2 className="text-xl font-black text-gray-900">Payment Requests Awaiting Approval</h2>
                                <p className="text-sm text-gray-600 mt-1">{pendingPaymentRequests.length} request(s) pending admin review</p>
                            </div>
                        </div>
                        <Link
                            to="/admin/payments"
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors"
                        >
                            Review All
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Engine</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Company</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Payment %</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Requested</th>
                                    <th className="px-6 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {pendingPaymentRequests.slice(0, 5).map((req: any) => (
                                    <tr key={req.invoiceId} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-900">{req.engineName || "Unknown"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-gray-700">{req.companyId}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-bold text-indigo-600">₹{(req.totalAmount || 0).toLocaleString()}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                                {req.requestedPaymentPercent}%
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-xs text-gray-500">
                                                {new Date(req.createdAt).toLocaleDateString()}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link
                                                to="/admin/payments"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-bold hover:bg-blue-600 hover:text-white transition-all"
                                            >
                                                Review
                                                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Filter Navigation */}
            <div className="flex flex-wrap gap-2 bg-gray-100/50 p-2 rounded-[1.5rem] w-fit">
                {[
                    { label: 'Full Spectrum', value: null, color: 'indigo' },
                    { label: 'Processing', value: 'pending', color: 'amber' },
                    { label: 'Settled', value: 'paid', color: 'emerald' },
                    { label: 'Overdue', value: 'overdue', color: 'rose' }
                ].map((tab) => (
                    <Link
                        key={tab.label}
                        to={tab.value ? `/admin/invoices?status=${tab.value}` : '/admin/invoices'}
                        className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${(statusFilter === tab.value || (!statusFilter && !tab.value))
                            ? `bg-white text-gray-900 shadow-sm border border-gray-100`
                            : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        {tab.label}
                    </Link>
                ))}
            </div>

            {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-2xl p-4 flex items-center gap-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-rose-600" />
                    <p className="text-sm font-bold text-rose-800">{error}</p>
                </div>
            )}

            {/* Ledger Table */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Instrument</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Counterparty</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Audit Value</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">State</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Issuance</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.map((invoice: any, idx: number) => {
                                const status = getStatusStyles(invoice.status);
                                return (
                                    <motion.tr
                                        key={invoice.pk}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 bg-gray-50 text-gray-400 flex items-center justify-center rounded-xl group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                                    <DocumentTextIcon className="h-5 w-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-gray-900">{invoice.invoiceNumber || invoice.pk?.replace("INVOICE#", "")}</p>
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase">UUID: {invoice.invoiceId?.slice(0, 8) || "GEN-ID"}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-2">
                                                <BuildingOffice2Icon className="h-4 w-4 text-gray-300" />
                                                <Link to={`/admin/companies/${invoice.companyId}`} className="text-sm font-bold text-indigo-600 hover:underline">
                                                    {invoice.companyId}
                                                </Link>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="text-sm font-black text-gray-900">₹{invoice.totalAmount?.toLocaleString()}</p>
                                            <p className="text-[10px] font-bold text-emerald-600 uppercase">GST Invoiced</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${status.color}`}>
                                                <status.icon className="h-3 w-3" />
                                                {status.label}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <p className="text-xs font-bold text-gray-700">{invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}</p>
                                                <p className="text-[10px] font-bold text-rose-400">Due: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'Immediate'}</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link
                                                to={`/admin/invoices/${invoice.pk?.replace("INVOICE#", "")}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-100"
                                            >
                                                Audit
                                                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                                            </Link>
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {invoices.length === 0 && (
                    <div className="p-32 text-center">
                        <TableCellsIcon className="h-24 w-24 text-gray-100 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Null Dataset Detected</h3>
                        <p className="text-gray-400 font-medium max-w-sm mx-auto mt-2">No instruments match the current filter criteria in the financial repository.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
