import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { CheckCircle, Clock, XCircle, AlertCircle, FileText } from "lucide-react";

/**
 * User Payment Status Page
 * Route: /payment/status
 * 
 * Shows user their payment submissions and verification status
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    if (!user.organisationId) {
        return json({ error: "Organization ID not found", payments: [] }, { status: 400 });
    }

    // Fetch user's payment records
    // TODO: Implement getCompanyPayments function
    // For now, return empty array
    const payments: any[] = [];

    return json({
        user,
        companyId: user.organisationId,
        payments
    });
}

export default function PaymentStatus() {
    const loaderData = useLoaderData<typeof loader>() as any;
    const payments = loaderData?.payments || [];
    const companyId = loaderData?.companyId || "";

    const getStatusBadge = (status: string) => {
        const styles = {
            verified: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            rejected: "bg-red-100 text-red-800"
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
                {status.toUpperCase()}
            </span>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "verified":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "pending":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case "rejected":
                return <XCircle className="w-5 h-5 text-red-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const pendingCount = payments.filter((p: any) => p.verificationStatus === "pending").length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-center gap-4 mb-4">
                        <FileText className="w-12 h-12 text-blue-300" />
                        <div>
                            <h1 className="text-4xl font-bold">Payment Status</h1>
                            <p className="text-blue-200 mt-2">Track your payment submissions and verification status</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Pending Notification */}
                {pendingCount > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg p-6 mb-8">
                        <div className="flex items-start gap-3">
                            <Clock className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                            <div>
                                <h3 className="text-lg font-semibold text-yellow-900 mb-1">
                                    {pendingCount} Payment{pendingCount > 1 ? "s" : ""} Pending Verification
                                </h3>
                                <p className="text-sm text-yellow-800">
                                    Your payment submission{pendingCount > 1 ? "s are" : " is"} being reviewed by our admin team.
                                    You'll be notified once verification is complete.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payment Submissions */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">Payment Submissions</h2>
                        <p className="text-gray-600 mt-1">View all your payment records and their verification status</p>
                    </div>

                    {payments.length === 0 ? (
                        <div className="text-center py-16">
                            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment Submissions</h3>
                            <p className="text-gray-600 mb-6">You haven't submitted any payments yet</p>
                            <Link
                                to="/payment/checkout"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Make a Payment
                            </Link>
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
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Payment Method
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submitted
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payments.map((payment: any) => (
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">
                                                    ₹{payment.totalAmount.toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    GST: ₹{payment.gstAmount.toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                    {payment.paymentMethod?.replace('_', ' ').toUpperCase() || 'N/A'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    {getStatusIcon(payment.verificationStatus)}
                                                    {getStatusBadge(payment.verificationStatus)}
                                                </div>
                                                {payment.verificationStatus === "rejected" && payment.rejectionReason && (
                                                    <div className="mt-2 text-xs text-red-600">
                                                        Reason: {payment.rejectionReason}
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Info Section */}
                <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">Payment Verification Process</h3>
                    <div className="grid md:grid-cols-3 gap-6 text-sm text-blue-800">
                        <div>
                            <div className="font-semibold mb-1">1. Submit Payment</div>
                            <p>Upload payment proof and details</p>
                        </div>
                        <div>
                            <div className="font-semibold mb-1">2. Admin Review</div>
                            <p>Our team verifies your submission</p>
                        </div>
                        <div>
                            <div className="font-semibold mb-1">3. Access Granted</div>
                            <p>Services activated upon approval</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
