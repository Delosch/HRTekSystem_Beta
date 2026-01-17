import { useState } from "react";
import { useLoaderData, useNavigate, Form, useActionData } from "@remix-run/react";
import { LoaderFunction, ActionFunction, redirect, json } from "@remix-run/node";
import {
    CreditCard,
    Building2,
    QrCode,
    Download,
    Upload,
    CheckCircle,
    AlertCircle,
    FileText
} from "lucide-react";
import Sidebar from "~/components/DashboardComponents/Sidebar";
import { requireUserSession } from "~/lib/session.server";
import { getEnhancedUser } from "~/utils/user.server";
import { getCartItems, clearCart } from "~/models/cart.model";
import { generateInvoice, submitPaymentProof, getPaymentRecord, PaymentMethod } from "~/models/payment.model";
import { getCompanyProfile } from "~/models/company.model";
import { uploadToS3 } from "~/lib/s3.server";
import BillingDetailsForm, { BillingContact } from "~/components/BillingDetailsForm";

interface LoaderData {
    cartItems: any[];
    subtotal: number;
    gst: number;
    total: number;
    companyDetails: any;
    bankDetails: {
        accountName: string;
        accountNumber: string;
        ifscCode: string;
        bankName: string;
        branch: string;
    };
    upiDetails: {
        upiId: string;
        qrCodeUrl: string;
    };
    user: any;
}

export const loader: LoaderFunction = async ({ request }) => {
    const user = await getEnhancedUser(request);
    if (!user) return redirect('/auth');

    const cartItems = await getCartItems(user.organisationId || "");
    const companyDetails = await getCompanyProfile(user.organisationId || "");

    if (cartItems.length === 0) {
        return redirect('/cartDashboard');
    }

    const subtotal = cartItems.reduce((sum: number, item: any) => sum + (item.price || 0), 0);
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    // Your company's payment details (store in env variables in production)
    // Your company's payment details
    const bankDetails = {
        accountName: "HR-Tek System",
        accountNumber: "00000020532076408",
        ifscCode: "SBIN0010175",
        bankName: "State Bank of India",
        branch: "IIM Branch Lucknow"
    };

    const upiDetails = {
        upiId: process.env.UPI_ID || "hrteksystems@sbi",
        qrCodeUrl: "/assets/payment/upi-qr-code.jpg"
    };

    return json<LoaderData>({
        cartItems,
        subtotal,
        gst,
        total,
        companyDetails,
        bankDetails,
        upiDetails,
        user
    });
};

export const action: ActionFunction = async ({ request }) => {
    const user = await requireUserSession(request);
    if (!user) return redirect('/auth');

    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    if (intent === "generate_invoice") {
        try {
            const cartItems = await getCartItems(user.organisationId || "");
            const companyDetails = await getCompanyProfile(user.organisationId || "");

            // Get billing contact from form data
            const billingContactStr = formData.get("billingContact") as string;
            const billingContact = billingContactStr ? JSON.parse(billingContactStr) : undefined;

            const invoice = await generateInvoice(
                user.organisationId || "",
                cartItems,
                companyDetails,
                billingContact
            );

            // Clear cart after invoice generation
            await clearCart(user.organisationId || "");

            return redirect(`/payment/invoice/${invoice.invoiceId}`);
        } catch (error) {
            console.error("Error generating invoice:", error);
            return json({ error: "Failed to generate invoice" }, { status: 500 });
        }
    }

    if (intent === "submit_payment_proof") {
        try {
            const invoiceId = formData.get("invoiceId") as string;
            const paymentMethod = formData.get("paymentMethod") as PaymentMethod;
            const transactionId = formData.get("transactionId") as string;
            const paymentDate = formData.get("paymentDate") as string;
            const paymentNotes = formData.get("paymentNotes") as string;
            const proofFile = formData.get("proofFile") as File;

            // Upload proof to S3
            const proofUrl = await uploadToS3(
                proofFile,
                `payment-proofs/${user.organisationId}/${invoiceId}/${proofFile.name}`
            );

            await submitPaymentProof(invoiceId, user.organisationId || "", {
                paymentMethod,
                transactionId,
                paymentProofUrl: proofUrl,
                paymentDate,
                paymentNotes
            });

            // Also clear the cart here to be absolutely sure
            await clearCart(user.organisationId || "");

            return json({ success: true, message: "Payment proof submitted successfully" });
        } catch (error) {
            console.error("Error submitting payment proof:", error);
            return json({ error: "Failed to submit payment proof" }, { status: 500 });
        }
    }

    return json({ error: "Invalid intent" }, { status: 400 });
};

export default function PaymentCheckout() {
    const data = useLoaderData<LoaderData>();
    const actionData = useActionData();
    const navigate = useNavigate();
    const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("bank_transfer");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showBillingForm, setShowBillingForm] = useState(false);
    const [billingDetails, setBillingDetails] = useState<BillingContact | null>(null);

    const paymentMethods = [
        {
            id: "bank_transfer" as PaymentMethod,
            name: "Bank Transfer / NEFT / RTGS",
            icon: Building2,
            description: "Direct bank transfer to our account"
        },
        {
            id: "upi" as PaymentMethod,
            name: "UPI Payment",
            icon: CreditCard,
            description: "Pay using UPI apps like Google Pay, PhonePe, Paytm"
        },
        {
            id: "qr_code" as PaymentMethod,
            name: "QR Code",
            icon: QrCode,
            description: "Scan QR code to pay instantly"
        }
    ];

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            {!isSidebarCollapsed && <Sidebar user={data.user} />}

            <main className="flex-1 md:ml-64 p-6 sm:p-10">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Payment Checkout</h1>
                        <p className="text-gray-600 mt-2">Complete your payment to unlock HR transformation engines</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column - Payment Methods */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Payment Method Selection */}
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Method</h2>

                                <div className="space-y-3">
                                    {paymentMethods.map((method) => {
                                        const Icon = method.icon;
                                        return (
                                            <button
                                                key={method.id}
                                                onClick={() => setSelectedMethod(method.id)}
                                                className={`w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${selectedMethod === method.id
                                                    ? "border-blue-500 bg-blue-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                <div className={`p-3 rounded-lg ${selectedMethod === method.id ? "bg-blue-100" : "bg-gray-100"
                                                    }`}>
                                                    <Icon className={`w-6 h-6 ${selectedMethod === method.id ? "text-blue-600" : "text-gray-600"
                                                        }`} />
                                                </div>
                                                <div className="flex-1 text-left">
                                                    <h3 className="font-semibold text-gray-900">{method.name}</h3>
                                                    <p className="text-sm text-gray-600">{method.description}</p>
                                                </div>
                                                {selectedMethod === method.id && (
                                                    <CheckCircle className="w-6 h-6 text-blue-600" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Payment Details Based on Selected Method */}
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Details</h2>

                                {selectedMethod === "bank_transfer" && (
                                    <div className="space-y-4">
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-blue-900 mb-3">Bank Account Details</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Account Name:</span>
                                                    <span className="font-medium text-gray-900">{data.bankDetails.accountName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Account Number:</span>
                                                    <span className="font-mono font-medium text-gray-900">{data.bankDetails.accountNumber}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">IFSC Code:</span>
                                                    <span className="font-mono font-medium text-gray-900">{data.bankDetails.ifscCode}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bank Name:</span>
                                                    <span className="font-medium text-gray-900">{data.bankDetails.bankName}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Branch:</span>
                                                    <span className="font-medium text-gray-900">{data.bankDetails.branch}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex gap-2">
                                                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                <div className="text-sm text-yellow-800">
                                                    <p className="font-medium mb-1">Important Instructions:</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        <li>Please mention invoice number in transaction remarks</li>
                                                        <li>Upload payment proof after completing the transfer</li>
                                                        <li>Payment verification may take 1-2 business days</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedMethod === "upi" && (
                                    <div className="space-y-4">
                                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                            <h3 className="font-semibold text-purple-900 mb-3">UPI Payment Details</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">UPI ID:</span>
                                                    <span className="font-mono font-medium text-gray-900">{data.upiDetails.upiId}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 mb-2">Or scan this QR code:</p>
                                            <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                                                <img
                                                    src={data.upiDetails.qrCodeUrl}
                                                    alt="UPI QR Code"
                                                    className="w-48 h-48"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {selectedMethod === "qr_code" && (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <p className="text-sm text-gray-600 mb-4">Scan this QR code with any UPI app to pay</p>
                                            <div className="inline-block p-6 bg-white border-2 border-gray-200 rounded-lg">
                                                <img
                                                    src={data.upiDetails.qrCodeUrl}
                                                    alt="Payment QR Code"
                                                    className="w-64 h-64"
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-4">
                                                Works with Google Pay, PhonePe, Paytm, and all UPI apps
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Generate Invoice Button */}
                            <button onClick={() => setShowBillingForm(true)} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold px-6 py-4 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"><FileText className="w-5 h-5" />Generate Invoice & Proceed to Payment</button>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 sticky top-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

                                {/* Cart Items */}
                                <div className="space-y-3 mb-4 pb-4 border-b border-gray-200">
                                    {data.cartItems.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600">{item.productName}</span>
                                            <span className="font-medium text-gray-900">₹{item.price.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Pricing Breakdown */}
                                <div className="space-y-2 text-sm mb-4">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Subtotal</span>
                                        <span className="font-medium text-gray-900">₹{data.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">GST (18%)</span>
                                        <span className="font-medium text-gray-900">₹{data.gst.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Total */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                                        <span className="text-2xl font-bold text-blue-600">₹{data.total.toLocaleString()}</span>
                                    </div>
                                </div>

                                {/* Company Details */}
                                <div className="mt-6 pt-6 border-t border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">Billing To:</h3>
                                    <div className="text-sm text-gray-600 space-y-1">
                                        <p className="font-medium text-gray-900">{data.companyDetails?.companyName}</p>
                                        <p>{data.companyDetails?.industry}</p>
                                        <p>GST: {data.companyDetails?.pan_gst_adhaar}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Billing Details Form Modal */}
            {showBillingForm && (
                <BillingDetailsForm
                    onSubmit={(details) => {
                        setBillingDetails(details);
                        setShowBillingForm(false);

                        // Submit form with billing details
                        const form = document.createElement('form');
                        form.method = 'post';
                        form.style.display = 'none';

                        const intentInput = document.createElement('input');
                        intentInput.name = 'intent';
                        intentInput.value = 'generate_invoice';
                        form.appendChild(intentInput);

                        const billingInput = document.createElement('input');
                        billingInput.name = 'billingContact';
                        billingInput.value = JSON.stringify(details);
                        form.appendChild(billingInput);

                        document.body.appendChild(form);
                        form.submit();
                    }}
                    onCancel={() => setShowBillingForm(false)}
                />
            )}
        </div>
    );
}

