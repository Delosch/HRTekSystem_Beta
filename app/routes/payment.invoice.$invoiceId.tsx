import { useState } from "react";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { LoaderFunction, ActionFunction, redirect, json } from "@remix-run/node";
import {
    Download,
    Upload,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Building2
} from "lucide-react";
import Sidebar from "~/components/DashboardComponents/Sidebar";
import { requireUserSession } from "~/lib/session.server";
import { getPaymentRecord, submitPaymentProof, PaymentMethod, PaymentRecord } from "~/models/payment.model";
import { uploadToS3 } from "~/lib/s3.server";
import { InvoiceTemplate } from "~/components/InvoiceTemplate";

interface LoaderData {
    payment: PaymentRecord;
    companyName: string;
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const user = await requireUserSession(request);
    if (!user) return redirect('/auth');

    const invoiceId = params.invoiceId;
    if (!invoiceId) return redirect('/cartDashboard');

    const payment = await getPaymentRecord(invoiceId, user.organisationId || "");
    if (!payment) return redirect('/cartDashboard');

    // Fetch company details to get company name
    const { getCompanyProfile } = await import("~/models/company.model");
    const companyProfile = await getCompanyProfile(user.organisationId || "");

    return json<LoaderData>({
        payment,
        companyName: companyProfile?.company_name || "Your Company"
    });
};

export const action: ActionFunction = async ({ request, params }) => {
    const user = await requireUserSession(request);
    if (!user) return redirect('/auth');

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "submit_payment_proof") {
        try {
            const invoiceId = params.invoiceId as string;
            const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
            const transactionId = formData.get("transactionId") as string;
            const paymentDate = formData.get("paymentDate") as string;
            const paymentNotes = formData.get("paymentNotes") as string;
            const proofFile = formData.get("proofFile") as File;

            console.log("📝 Payment submission:", { invoiceId, method: paymentMethod, fileSize: proofFile?.size });

            if (!proofFile || proofFile.size === 0) {
                return json({ error: "Please upload payment proof" }, { status: 400 });
            }

            // Upload proof to S3
            console.log("☁️ Uploading to S3...");
            const buffer = await proofFile.arrayBuffer();
            const proofUrl = await uploadToS3(
                Buffer.from(buffer),
                `payment-proofs/${user.organisationId}/${invoiceId}/${proofFile.name}`
            );
            console.log("✅ S3 upload done:", proofUrl);

            console.log("💾 Saving to DynamoDB...");
            await submitPaymentProof(invoiceId, user.organisationId || "", {
                paymentMethod,
                transactionId: transactionId || undefined,
                paymentProofUrl: proofUrl,
                paymentDate,
                paymentNotes: paymentNotes || undefined
            });
            console.log("✅ DynamoDB save done");

            return json({
                success: true,
                message: "Payment proof submitted successfully! Our team will verify it within 1-2 business days."
            });
        } catch (error) {
            console.error("❌ Payment submission error:", error);
            console.error("Error details:", error instanceof Error ? error.message : String(error));
            return json({ error: "Failed to submit payment proof. Please try again." }, { status: 500 });
        }
    }

    return json({ error: "Invalid action" }, { status: 400 });
};

export default function InvoicePage() {
    const { payment, companyName } = useLoaderData<LoaderData>();
    const actionData = useActionData<{ success?: boolean; message?: string; error?: string }>();
    const navigation = useNavigation();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const isSubmitting = navigation.state === "submitting";

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const downloadInvoice = () => {
        // In production, generate PDF invoice
        window.print();
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending_payment: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Pending Payment" },
            payment_submitted: { color: "bg-blue-100 text-blue-800", icon: Upload, text: "Under Verification" },
            payment_verified: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Payment Verified" },
            payment_rejected: { color: "bg-red-100 text-red-800", icon: AlertCircle, text: "Payment Rejected" },
            completed: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Completed" }
        };

        const badge = badges[status as keyof typeof badges] || badges.pending_payment;
        const Icon = badge.icon;

        return (
            <span className={`inline - flex items - center gap - 2 px - 3 py - 1 rounded - full text - sm font - semibold ${badge.color} `}>
                <Icon className="w-4 h-4" />
                {badge.text}
            </span>
        );
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            {!isSidebarCollapsed && <Sidebar />}

            <main className="flex-1 md:ml-64 p-6 sm:p-10">
                <div className="max-w-5xl mx-auto">
                    {/* Success/Error Messages */}
                    {actionData?.success && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-green-900">Success!</h3>
                                <p className="text-sm text-green-800">{actionData.message}</p>
                            </div>
                        </div>
                    )}

                    {actionData?.error && (
                        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Error</h3>
                                <p className="text-sm text-red-800">{actionData.error}</p>
                            </div>
                        </div>
                    )}

                    {/* Invoice Header - Locked/Unlocked State */}
                    <div className="bg-white rounded-xl shadow-md p-8 mb-6 border border-gray-200 relative" id="invoice-content">
                        {/* Locked Overlay - Show until payment verified */}
                        {payment.status !== "payment_verified" && (
                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center">
                                <div className="text-center p-8 max-w-md">
                                    <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <FileText className="w-10 h-10 text-orange-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Invoice Locked</h3>
                                    <p className="text-gray-600 mb-4">
                                        {payment.status === "pending_payment" && "Complete payment and upload proof to unlock invoice access."}
                                        {payment.status === "payment_submitted" && "Your payment is under verification. Invoice will be unlocked once admin approves."}
                                        {payment.status === "payment_rejected" && "Payment was rejected. Please resubmit valid payment proof."}
                                    </p>
                                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-lg">
                                        <Clock className="w-4 h-4 text-orange-600" />
                                        <span className="text-sm font-medium text-orange-800">
                                            {payment.status === "pending_payment" && "Awaiting Payment"}
                                            {payment.status === "payment_submitted" && "Under Admin Review"}
                                            {payment.status === "payment_rejected" && "Payment Rejected"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invoice Content - Blurred when locked */}
                        <div className={payment.status !== "payment_verified" ? "blur-sm pointer-events-none select-none" : ""}>
                            <InvoiceTemplate
                                invoiceNumber={payment.invoiceNumber}
                                invoiceDate={payment.invoiceDate}
                                dueDate={payment.dueDate}
                                companyName={companyName}
                                companyAddress={undefined}
                                companyGSTIN={undefined}
                                items={payment.items}
                                subtotal={payment.subtotal}
                                gstAmount={payment.gstAmount}
                                totalAmount={payment.totalAmount}
                                paymentMethod={payment.paymentMethod}
                            />

                            {/* Rejection Reason */}
                            {payment.status === "payment_rejected" && payment.rejectionReason && (
                                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <h3 className="font-semibold text-red-900 mb-2">Payment Rejected:</h3>
                                    <p className="text-sm text-red-800">{payment.rejectionReason}</p>
                                    <p className="text-sm text-red-800 mt-2">Please resubmit valid payment proof.</p>
                                </div>
                            )}
                        </div>


                        {/* Payment Methods Section */}
                        {(payment.status === "pending_payment" || payment.status === "payment_rejected") && (
                            <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                    Payment Methods
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* UPI Payment Section */}
                                    <div className="bg-white rounded-lg p-6 shadow-md border border-blue-100">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-center">Scan & Pay via UPI</h4>
                                        <div className="flex flex-col items-center">
                                            <div className="bg-white p-4 rounded-lg border-2 border-blue-200 mb-3">
                                                <img
                                                    src="/assets/payment/upi-qr-code.jpg"
                                                    alt="UPI QR Code"
                                                    className="w-48 h-48 object-contain"
                                                />
                                            </div>
                                            <div className="text-center mb-3">
                                                <p className="text-xs text-gray-600 mb-1">UPI ID:</p>
                                                <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded">
                                                    deloschtechnologiesprivatelimited@sbi
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Google Pay</span>
                                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">PhonePe</span>
                                                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Paytm</span>
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">BHIM</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bank Transfer Section */}
                                    <div className="bg-white rounded-lg p-6 shadow-md border border-blue-100">
                                        <h4 className="font-semibold text-gray-900 mb-4">Bank Transfer / NEFT / RTGS</h4>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <p className="text-gray-600 text-xs">Account Name:</p>
                                                <p className="font-semibold text-gray-900">Delosch Technologies (P) Ltd.</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-xs">Bank Name:</p>
                                                <p className="font-semibold text-gray-900">State Bank of India</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-xs">Account Number:</p>
                                                <p className="font-mono font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">00000020532076408</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-xs">IFSC Code:</p>
                                                <p className="font-mono font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">SBIN0010175</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-600 text-xs">Branch:</p>
                                                <p className="font-semibold text-gray-900">IIM Branch Lucknow</p>
                                            </div>
                                            <div className="pt-3 border-t border-gray-200">
                                                <p className="text-xs text-gray-600">
                                                    <strong>Note:</strong> Please use Invoice Number as reference
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Payment Instructions */}
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        Payment Instructions:
                                    </h4>
                                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                        <li>Scan the QR code or use the UPI ID for instant payment</li>
                                        <li>For bank transfer, use the account details provided above</li>
                                        <li>After payment, upload the screenshot/receipt below</li>
                                        <li>Include Transaction ID/UTR number for faster verification</li>
                                        <li>Our team will verify within 1-2 business days</li>
                                    </ol>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons - Only enabled after verification */}
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={downloadInvoice}
                        disabled={payment.status !== "payment_verified"}
                        className={`flex items - center gap - 2 px - 6 py - 3 font - semibold rounded - lg transition - all ${payment.status === "payment_verified"
                            ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            } `}
                        title={payment.status !== "payment_verified" ? "Available after payment verification" : "Download Invoice"}
                    >
                        <Download className="w-5 h-5" />
                        {payment.status === "payment_verified" ? "Download Invoice" : "🔒 Download Locked"}
                    </button>

                    {payment.status === "payment_verified" && (
                        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Invoice Unlocked</span>
                        </div>
                    )}
                </div>

                {/* Payment Proof Upload Form */}
                {(payment.status === "pending_payment" || payment.status === "payment_rejected") && (
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload Payment Proof</h2>

                        <Form method="post" encType="multipart/form-data" className="space-y-6">
                            <input type="hidden" name="intent" value="submit_payment_proof" />

                            {/* Payment Method */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Method *
                                </label>
                                <select
                                    name="paymentMethod"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Select payment method</option>
                                    <option value="bank_transfer">Bank Transfer / NEFT / RTGS</option>
                                    <option value="upi">UPI Payment</option>
                                    <option value="qr_code">QR Code Payment</option>
                                </select>
                            </div>

                            {/* Transaction ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Transaction ID / Reference Number
                                </label>
                                <input
                                    type="text"
                                    name="transactionId"
                                    placeholder="Enter transaction ID or UTR number"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Payment Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Date *
                                </label>
                                <input
                                    type="date"
                                    name="paymentDate"
                                    required
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Payment Proof File */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Payment Proof (Screenshot/Receipt) *
                                </label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600">
                                            <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                                                <span>Upload a file</span>
                                                <input
                                                    type="file"
                                                    name="proofFile"
                                                    required
                                                    accept="image/*,.pdf"
                                                    onChange={handleFileChange}
                                                    className="sr-only"
                                                />
                                            </label>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                        {selectedFile && (
                                            <p className="text-sm text-green-600 font-medium mt-2">
                                                Selected: {selectedFile.name}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    name="paymentNotes"
                                    rows={3}
                                    placeholder="Any additional information about the payment"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-4 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        Submit Payment Proof
                                    </>
                                )}
                            </button>
                        </Form>
                    </div>
                )}

                {/* Verification Status */}
                {payment.status === "payment_submitted" && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-1">Payment Under Verification</h3>
                                <p className="text-sm text-blue-800">
                                    Your payment proof has been submitted successfully. Our team is reviewing it and will verify within 1-2 business days.
                                    You'll receive an email notification once verified.
                                </p>
                                {payment.paymentDate && (
                                    <p className="text-sm text-blue-700 mt-2">
                                        Payment Date: {new Date(payment.paymentDate).toISOString().split('T')[0]}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Verified Status */}
                {payment.status === "payment_verified" && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-green-900 mb-1">Payment Verified!</h3>
                                <p className="text-sm text-green-800">
                                    Your payment has been successfully verified. You now have access to all purchased engines.
                                </p>
                                {payment.verifiedAt && (
                                    <p className="text-sm text-green-700 mt-2">
                                        Verified on: {new Date(payment.verifiedAt).toISOString().split('T')[0]}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

