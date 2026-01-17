import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { requireUserSession } from "~/lib/session.server";
import { getVerifiedPaymentsByCompany } from "~/models/payment.model.server";
import Sidebar from "../components/DashboardComponents/Sidebar";
import { Receipt, Download, CheckCircle, Calendar, CreditCard, FileText } from "lucide-react";


import { getPresignedGetUrl } from "~/lib/s3.server";

import { getEnhancedUser } from "~/utils/user.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await getEnhancedUser(request);

  if (!user.organisationId) {
    return json({ user, error: "No organization found", payments: [] });
  }

  try {
    const { getCompanyPayments } = await import("~/models/payment.model.server");

    const allPayments = await getCompanyPayments(user.organisationId as string);
    // Filter to show submitted/verified/rejected payments (exclude just invoice generated)
    const rawPayments = allPayments.filter(p =>
      ['payment_submitted', 'payment_verified', 'completed', 'payment_rejected'].includes(p.status)
    );

    // Generate presigned URLs for payment proofs (stored as S3 keys)
    const payments = await Promise.all(rawPayments.map(async (payment) => {
      if (payment.paymentProofUrl && !payment.paymentProofUrl.startsWith("http")) {
        try {
          const signedUrl = await getPresignedGetUrl(payment.paymentProofUrl);
          return { ...payment, paymentProofUrl: signedUrl };
        } catch (err) {
          console.error(`Failed to generate signed URL for key: ${payment.paymentProofUrl}`, err);
          return payment;
        }
      }
      return payment;
    }));

    return json({ user, payments, error: null });
  } catch (error) {
    console.error("Error loading receipts:", error);
    return json({ user, error: "Failed to load payment receipts", payments: [] });
  }
}

export default function ReceiptDashboard() {
  const { user, payments, error } = useLoaderData<typeof loader>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleCard = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      {!isSidebarCollapsed && <Sidebar user={user} />}

      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <Receipt className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Payment Receipts</h1>
          </div>
          <p className="text-gray-600">View all your verified payment receipts and transaction history</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Empty State */}
        {!error && payments.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Receipt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Payment Receipts Yet</h3>
            <p className="text-gray-600 mb-6">
              Your verified payment receipts will appear here once approved by admin.
            </p>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Go to Dashboard
            </Link>
          </div>
        )}

        {/* Payments List */}
        {!error && payments.length > 0 && (
          <div className="space-y-4">
            {payments.map((payment: any, index: number) => (
              <div
                key={payment.paymentId}
                className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Card Header - Always Visible */}
                <div
                  className="p-6 cursor-pointer"
                  onClick={() => toggleCard(index)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {payment.status === 'payment_verified' || payment.status === 'completed' ? (
                          <>
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full">
                              Verified
                            </span>
                          </>
                        ) : payment.status === 'payment_submitted' ? (
                          <>
                            <Clock className="w-5 h-5 text-yellow-600" />
                            <span className="text-sm font-semibold text-yellow-700 bg-yellow-50 px-3 py-1 rounded-full">
                              Verification Pending
                            </span>
                          </>
                        ) : payment.status === 'payment_rejected' ? (
                          <>
                            <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                              <span className="text-red-600 font-bold text-xs">X</span>
                            </div>
                            <span className="text-sm font-semibold text-red-700 bg-red-50 px-3 py-1 rounded-full">
                              Rejected
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {payment.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-1">
                        ₹{payment.totalAmount?.toLocaleString('en-IN')}
                      </h3>
                      <p className="text-gray-600">{payment.items?.[0]?.engineName || 'Payment'}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-gray-600 mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(payment.verifiedAt || payment.createdAt)}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(payment.verifiedAt || payment.createdAt)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedIndex === index && (
                  <div className="px-6 pb-6 pt-2 bg-gray-50 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transaction ID</label>
                          <p className="text-sm font-mono text-gray-900 mt-1">{payment.transactionId || payment.paymentId}</p>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Payment Method</label>
                          <div className="flex items-center gap-2 mt-1">
                            <CreditCard className="w-4 h-4 text-gray-600" />
                            <p className="text-sm text-gray-900">{payment.paymentMethod || 'Bank Transfer'}</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Invoice ID</label>
                          <p className="text-sm font-mono text-gray-900 mt-1">{payment.invoiceId}</p>
                        </div>

                        {payment.paymentNotes && (
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Notes</label>
                            <p className="text-sm text-gray-700 mt-1">{payment.paymentNotes}</p>
                          </div>
                        )}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-3">
                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verified By</label>
                          <p className="text-sm text-gray-900 mt-1">Admin</p>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Verified On</label>
                          <p className="text-sm text-gray-900 mt-1">
                            {formatDate(payment.verifiedAt)} at {formatTime(payment.verifiedAt)}
                          </p>
                        </div>

                        {payment.verificationNotes && (
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin Notes</label>
                            <p className="text-sm text-gray-700 mt-1">{payment.verificationNotes}</p>
                          </div>
                        )}

                        {/* Payment Proof */}
                        {payment.paymentProofUrl && (
                          <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Payment Proof</label>
                            <a
                              href={payment.paymentProofUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                            >
                              <FileText className="w-4 h-4" />
                              View Receipt
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
                      >
                        <Download className="w-4 h-4" />
                        Download Receipt
                      </button>
                      <Link
                        to={`/payment/invoice/${payment.invoiceId}`}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 font-medium"
                      >
                        <Receipt className="w-4 h-4" />
                        View Invoice
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
