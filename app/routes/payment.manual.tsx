import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { useState } from "react";
import { CreditCard, Building2, Smartphone, QrCode, Upload, CheckCircle, X } from "lucide-react";
import { ENGINE_PRICING, BUNDLE_PRICING } from "~/config/pricing.config";
import { formatCurrency } from "~/services/pricing.calculator";

/**
 * Manual Payment Page
 * Route: /payment/manual
 * 
 * Allows users to make payment via Bank Transfer, UPI, or QR Code
 * and upload payment proof for admin verification
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    const url = new URL(request.url);
    const engineIds = url.searchParams.get("engines")?.split(",") || [];
    const isBundle = engineIds.length === 5;

    let selectedEngines = ENGINE_PRICING.filter(e => engineIds.includes(e.id));
    let totalAmount = 0;
    let savings = 0;

    if (isBundle) {
        totalAmount = BUNDLE_PRICING.allEngines.bundlePrice;
        savings = BUNDLE_PRICING.allEngines.savings;
    } else {
        totalAmount = selectedEngines.reduce((sum, e) => sum + e.basePrice, 0);
    }

    const gst = totalAmount * 0.18;
    const grandTotal = totalAmount + gst;

    return json({
        user,
        selectedEngines,
        isBundle,
        subtotal: totalAmount,
        savings,
        gst,
        grandTotal
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const user = await requireUserSession(request);
    const formData = await request.formData();

    const paymentMethod = formData.get("paymentMethod");
    const transactionId = formData.get("transactionId");
    const amount = formData.get("amount");
    const paymentProof = formData.get("paymentProof");

    // Notify Admin
    try {
        const { notifyAdmin } = await import("~/services/admin.notifier.server");
        await notifyAdmin(
            "Manual Payment Submitted",
            `A user has submitted payment proof for verification:\n
            User: ${user.first_name} ${user.last_name} (${user.email})\n
            Method: ${paymentMethod}\n
            Transaction ID: ${transactionId}\n
            Amount: ${amount}\n
            Link to verify: https://hrteksystem.com/admin/payments/verification`
        );
    } catch (notifierError) {
        console.warn("Failed to notify admin about payment:", notifierError);
    }

    return json({
        success: true,
        message: "Payment proof submitted successfully. Admin will verify and activate your engines within 24 hours."
    });
}

export default function ManualPayment() {
    const data = useLoaderData<typeof loader>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    const [selectedMethod, setSelectedMethod] = useState<"bank" | "upi" | "qr">("bank");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        const items = e.clipboardData.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    setFileName("pasted-image.png");
                    const url = URL.createObjectURL(blob);
                    setPreviewUrl(url);

                    // Create a mockup file for the input
                    const file = new File([blob], "pasted-image.png", { type: blob.type });
                    const container = new DataTransfer();
                    container.items.add(file);
                    const input = document.getElementById("payment-proof") as HTMLInputElement;
                    if (input) {
                        input.files = container.files;
                    }
                }
            }
        }
    };

    const paymentMethods = [
        {
            id: "bank",
            name: "Bank Transfer / NEFT",
            icon: Building2,
            details: {
                accountName: "HR-Tek System",
                accountNumber: "00000020532076408",
                ifscCode: "SBIN0010175",
                bankName: "State Bank of India",
                branch: "IIM Branch Lucknow"
            }
        },
        {
            id: "upi",
            name: "UPI Payment",
            icon: Smartphone,
            details: {
                upiId: "hrteksystems@paytm",
                upiName: "HR Tek Systems"
            }
        },
        {
            id: "qr",
            name: "QR Code",
            icon: QrCode,
            details: {
                qrImage: "/assets/payment/upi-qr.png"
            }
        }
    ];

    return (
        <div
            className="min-h-screen bg-gray-50 py-12 select-none"
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            <div className="max-w-6xl mx-auto px-6">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
                    <p className="text-gray-600 mb-8">Choose your preferred payment method and submit proof for verification</p>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left: Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-gray-50 rounded-xl p-6">
                                <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

                                {data.isBundle && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                                        <p className="text-sm font-semibold text-green-800">
                                            🎉 Bundle Discount Applied!
                                        </p>
                                        <p className="text-xs text-green-700">
                                            Save {formatCurrency(data.savings, "INR")}
                                        </p>
                                    </div>
                                )}

                                <div className="space-y-3 mb-4">
                                    {data.selectedEngines.map((engine: any) => (
                                        <div key={engine.id} className="flex justify-between text-sm">
                                            <span className="text-gray-700">{engine.name}</span>
                                            <span className="text-gray-900 font-medium">
                                                {formatCurrency(engine.basePrice, "INR")}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-200 pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">Subtotal</span>
                                        <span className="text-gray-900">{formatCurrency(data.subtotal, "INR")}</span>
                                    </div>
                                    {data.savings > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-green-700">Bundle Savings</span>
                                            <span className="text-green-700">-{formatCurrency(data.savings, "INR")}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-700">GST (18%)</span>
                                        <span className="text-gray-900">{formatCurrency(data.gst, "INR")}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                                        <span className="text-gray-900">Total</span>
                                        <span className="text-blue-600">{formatCurrency(data.grandTotal, "INR")}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Payment Methods */}
                        <div className="lg:col-span-2">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Payment Method</h2>

                            {/* Payment Method Tabs */}
                            <div className="flex gap-4 mb-6">
                                {paymentMethods.map((method) => {
                                    const Icon = method.icon;
                                    return (
                                        <button
                                            key={method.id}
                                            onClick={() => setSelectedMethod(method.id as any)}
                                            className={`flex-1 p-4 rounded-lg border-2 transition-all ${selectedMethod === method.id
                                                ? "border-blue-600 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                                }`}
                                        >
                                            <Icon className={`w-6 h-6 mx-auto mb-2 ${selectedMethod === method.id ? "text-blue-600" : "text-gray-600"
                                                }`} />
                                            <p className={`text-sm font-medium ${selectedMethod === method.id ? "text-blue-600" : "text-gray-700"
                                                }`}>
                                                {method.name}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Payment Details */}
                            <div className="bg-blue-50 rounded-xl p-6 mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Details</h3>

                                {selectedMethod === "bank" && (
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Account Name:</span>
                                            <span className="font-semibold text-gray-900">HR-Tek System</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Account Number:</span>
                                            <span className="font-mono font-semibold text-gray-900">00000020532076408</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">IFSC Code:</span>
                                            <span className="font-mono font-semibold text-gray-900">SBIN0010175</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Bank Name:</span>
                                            <span className="font-semibold text-gray-900">State Bank of India</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Branch:</span>
                                            <span className="font-semibold text-gray-900">IIM Branch Lucknow</span>
                                        </div>
                                    </div>
                                )}

                                {selectedMethod === "upi" && (
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">UPI ID:</span>
                                            <span className="font-mono font-semibold text-gray-900">hrteksystems@paytm</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Name:</span>
                                            <span className="font-semibold text-gray-900">HR Tek Systems</span>
                                        </div>
                                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-xs text-yellow-800">
                                                💡 <strong>Tip:</strong> Use any UPI app (Google Pay, PhonePe, Paytm) to send payment to the above UPI ID
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {selectedMethod === "qr" && (
                                    <div className="text-center">
                                        <div className="bg-white p-4 rounded-lg inline-block">
                                            <div className="w-64 h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                                <QrCode className="w-32 h-32 text-gray-400" />
                                                <p className="text-xs text-gray-500 mt-2">QR Code will be displayed here</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-4">
                                            Scan this QR code with any UPI app to make payment
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Upload Payment Proof */}
                            <Form method="post" encType="multipart/form-data" className="space-y-6">
                                <input type="hidden" name="paymentMethod" value={selectedMethod} />
                                <input type="hidden" name="amount" value={data.grandTotal} />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Transaction ID / Reference Number *
                                    </label>
                                    <input
                                        type="text"
                                        name="transactionId"
                                        required
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter transaction ID from your payment app"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Upload Payment Proof (Screenshot) *
                                    </label>
                                    <div
                                        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-all group relative bg-white overflow-hidden min-h-[200px] flex flex-col items-center justify-center"
                                        onPaste={handlePaste}
                                    >
                                        {previewUrl ? (
                                            <div className="relative w-full h-full flex flex-col items-center">
                                                <img
                                                    src={previewUrl}
                                                    alt="Payment Proof Preview"
                                                    className="max-h-64 object-contain rounded-lg shadow-md mb-4"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => { setPreviewUrl(null); setFileName(null); }}
                                                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-lg"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <p className="text-sm font-medium text-green-600 flex items-center gap-1">
                                                    <CheckCircle className="w-4 h-4" /> {fileName}
                                                </p>
                                            </div>
                                        ) : (
                                            <>
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3 group-hover:text-blue-500 transition-colors" />
                                                <input
                                                    type="file"
                                                    name="paymentProof"
                                                    accept="image/*"
                                                    required
                                                    className="hidden"
                                                    id="payment-proof"
                                                    onChange={handleFileChange}
                                                />
                                                <label htmlFor="payment-proof" className="cursor-pointer">
                                                    <span className="text-blue-600 font-bold hover:text-blue-700">
                                                        Click/Paste to upload
                                                    </span>
                                                    <span className="text-gray-600"> or drag and drop</span>
                                                    <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                                                </label>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>⚠️ Important:</strong> Please upload a clear screenshot of your payment confirmation.
                                        Our admin will verify and activate your engines within 24 hours.
                                    </p>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${isSubmitting
                                        ? "bg-gray-400 cursor-not-allowed"
                                        : "bg-blue-600 hover:bg-blue-700"
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Submitting...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            Submit Payment Proof
                                        </span>
                                    )}
                                </button>
                            </Form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
