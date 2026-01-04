import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, useSearchParams } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Receipt, Building2, Calendar, DollarSign, CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";

/**
 * Admin Invoices Page
 * Route: /admin/invoices
 * 
 * Displays all invoices from DynamoDB with filtering
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    // Check admin role (with dev mode bypass)
    const userWithRole = user as any;
    if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
        return json({
            error: "Unauthorized - Admin access required",
            invoices: []
        }, { status: 403 });
    }

    // Get status filter from query params
    const url = new URL(request.url);
    const statusFilter = url.searchParams.get("status");

    try {
        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        // Build filter expression
        let filterExpression = "begins_with(pk, :invoicePrefix)";
        const expressionValues: any = {
            ":invoicePrefix": "INVOICE#"
        };

        if (statusFilter) {
            filterExpression += " AND #status = :statusValue";
            expressionValues[":statusValue"] = statusFilter;
        }

        // Scan for invoices
        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: filterExpression,
            ExpressionAttributeNames: statusFilter ? {
                "#status": "status"
            } : undefined,
            ExpressionAttributeValues: expressionValues
        });

        const response = await ddbDocClient.send(command);
        const invoices = response.Items || [];

        console.log(`📊 Fetched ${invoices.length} invoices from DynamoDB (filter: ${statusFilter || "all"})`);

        return json({
            invoices,
            totalCount: invoices.length,
            statusFilter
        });
    } catch (error) {
        console.error("Error fetching invoices:", error);
        return json({
            error: "Failed to fetch invoices from database",
            invoices: [],
            totalCount: 0,
            statusFilter
        });
    }
}

export default function AdminInvoices() {
    const loaderData = useLoaderData<typeof loader>() as any;
    const invoices = loaderData?.invoices || [];
    const totalCount = loaderData?.totalCount || 0;
    const statusFilter = loaderData?.statusFilter;
    const [searchParams] = useSearchParams();

    const getStatusBadge = (status: string) => {
        const styles = {
            paid: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            overdue: "bg-red-100 text-red-800",
            cancelled: "bg-gray-100 text-gray-800"
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
                {status?.toUpperCase() || "UNKNOWN"}
            </span>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "paid":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "pending":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case "overdue":
                return <AlertCircle className="w-5 h-5 text-red-500" />;
            default:
                return <XCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Receipt className="w-10 h-10 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Invoice Management</h1>
                                <p className="text-gray-600">View and manage all invoices</p>
                            </div>
                        </div>
                        <div className="bg-blue-100 px-4 py-2 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900">
                                {statusFilter ? `${statusFilter.toUpperCase()}: ${totalCount}` : `Total: ${totalCount}`}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex gap-2">
                    <Link
                        to="/admin/invoices"
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${!statusFilter ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        All Invoices
                    </Link>
                    <Link
                        to="/admin/invoices?status=pending"
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === "pending" ? "bg-yellow-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Pending
                    </Link>
                    <Link
                        to="/admin/invoices?status=paid"
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === "paid" ? "bg-green-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Paid
                    </Link>
                    <Link
                        to="/admin/invoices?status=overdue"
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === "overdue" ? "bg-red-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
                            }`}
                    >
                        Overdue
                    </Link>
                </div>

                {/* Error Message */}
                {loaderData?.error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                        <p className="text-sm text-red-800">{loaderData.error}</p>
                    </div>
                )}

                {/* Invoices Table */}
                {invoices.length === 0 ? (
                    <div className="bg-white shadow-md rounded-lg p-16 text-center">
                        <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Invoices Found</h3>
                        <p className="text-gray-600">
                            {statusFilter ? `No ${statusFilter} invoices at this time` : "No invoices have been created yet"}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
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
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {invoices.map((invoice: any) => (
                                        <tr key={invoice.pk} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {invoice.invoiceNumber || invoice.pk?.replace("INVOICE#", "")}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {invoice.invoiceId || "N/A"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                                    {invoice.companyId ? (
                                                        <>
                                                            <Building2 className="w-3 h-3" />
                                                            <Link
                                                                to={`/admin/companies/${invoice.companyId}`}
                                                                className="text-blue-600 hover:text-blue-800 underline"
                                                            >
                                                                {invoice.companyId}
                                                            </Link>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">No company</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                                                    <DollarSign className="w-4 h-4" />
                                                    {invoice.totalAmount ? `₹${invoice.totalAmount.toLocaleString()}` : "N/A"}
                                                </div>
                                                {invoice.gstAmount && (
                                                    <div className="text-xs text-gray-500">
                                                        GST: ₹{invoice.gstAmount.toLocaleString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(invoice.status)}
                                                    {getStatusBadge(invoice.status)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : "N/A"}
                                                </div>
                                                {invoice.dueDate && (
                                                    <div className="text-xs text-gray-500">
                                                        Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    to={`/admin/invoices/${invoice.pk?.replace("INVOICE#", "")}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <Receipt className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-yellow-600" />
                            <div>
                                <p className="text-sm text-gray-600">Pending</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {invoices.filter((i: any) => i.status === "pending").length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Paid</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {invoices.filter((i: any) => i.status === "paid").length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                            <div>
                                <p className="text-sm text-gray-600">Overdue</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {invoices.filter((i: any) => i.status === "overdue").length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
