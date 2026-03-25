import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useNavigation, useActionData } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { useState } from "react";
import { CreditCard, Building2, Smartphone, QrCode, Upload, CheckCircle, X } from "lucide-react";
import { ENGINE_PRICING, BUNDLE_PRICING } from "~/config/pricing.config";

/**
 * Manual Payment Page
 * Route: /payment/manual
 * 
 * Allows users to make payment via Bank Transfer, UPI, or QR Code
 * and upload payment proof for admin verification
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);
    const { getCompanyProfile } = await import("~/models/company.model.server");
    const companyProfile = await getCompanyProfile(user.organisationId || "");

    const url = new URL(request.url);
    const engineIdsParam = url.searchParams.get("engines") || url.searchParams.get("engine");
    const engineIds = engineIdsParam?.split(",") || [];
    const isBundle = engineIds.length === 5;

    // Pricing calculation based on employee count
    const employeeCount = typeof companyProfile?.employee_count === 'number'
        ? companyProfile.employee_count
        : parseInt(companyProfile?.employee_count || "500");

    const pricingByEmployees = [
        { min: 0, max: 500, roadmap: 275000, vendor: 275000, maturity: 275000, change: 625000, shared: 625000, hti: 4000000 },
        { min: 501, max: 1000, roadmap: 550000, vendor: 550000, maturity: 550000, change: 1250000, shared: 1250000, hti: 8000000 },
        { min: 1001, max: 2000, roadmap: 1100000, vendor: 1100000, maturity: 1100000, change: 2500000, shared: 2500000, hti: 10000000 },
        { min: 2001, max: 3000, roadmap: 1950000, vendor: 1950000, maturity: 1950000, change: 4500000, shared: 4500000, hti: 10000000 },
        { min: 3001, max: 4000, roadmap: 2600000, vendor: 2600000, maturity: 2600000, change: 6000000, shared: 6000000, hti: 10000000 },
        { min: 4001, max: 5000, roadmap: 3250000, vendor: 3250000, maturity: 3250000, change: 7500000, shared: 7500000, hti: 10000000 },
        { min: 5001, max: 7500, roadmap: 4875000, vendor: 4875000, maturity: 4875000, change: 1125000, shared: 1125000, hti: 12000000 },
        { min: 7501, max: 10000, roadmap: 7500000, vendor: 7500000, maturity: 7500000, change: 18500000, shared: 18500000, hti: 12000000 },
    ];

    const tier = pricingByEmployees.find(p => employeeCount >= p.min && employeeCount <= p.max) || pricingByEmployees[0];

    const engineToPriceMap: Record<string, number> = {
        "digital-roadmap": tier.roadmap,
        "HR Transformation Roadmap Generator": tier.roadmap,
        "hcm-vendor-fit": tier.vendor,
        "HCM Vendor Fit Engine": tier.vendor,
        "hr-tech-maturity": tier.maturity,
        "HR Technology Maturity Analysis": tier.maturity,
        "Digital Maturity Assessment": tier.maturity,
        "change-management": tier.change,
        "Intelligent Change Management": tier.change,
        "shared-services": tier.shared,
        "Shared Service Designer": tier.shared,
        "hti-intelligence": tier.hti,
        "HTI - HR Transformation Intelligence": tier.hti,
    };

    let selectedEngines = ENGINE_PRICING.filter(e => engineIds.includes(e.id) || engineIds.includes(e.name));
    
    // If no engines matched by ID or name, but we have a single engine param, try to handle it
    if (selectedEngines.length === 0 && engineIds.length === 1) {
        const found = ENGINE_PRICING.find(e => e.id === engineIds[0] || e.name === engineIds[0]);
        if (found) selectedEngines = [found];
        else {
            // Last resort: create a virtual engine if it's a known name
            const virtualPrice = engineToPriceMap[engineIds[0]];
            if (virtualPrice) {
                selectedEngines = [{
                    id: engineIds[0],
                    name: engineIds[0],
                    basePrice: virtualPrice,
                    description: "Strategic Assessment",
                    category: "assessment"
                }];
            }
        }
    }

    let totalAmount = 0;
    let savings = 0;

    if (isBundle) {
        totalAmount = BUNDLE_PRICING.allEngines.bundlePrice;
        savings = BUNDLE_PRICING.allEngines.savings;
    } else {
        selectedEngines.forEach(e => {
            const dynamicPrice = engineToPriceMap[e.id] || engineToPriceMap[e.name] || e.basePrice;
            totalAmount += dynamicPrice;
        });
    }

    const gst = Math.round(totalAmount * 0.18);
    const grandTotal = totalAmount + gst;

    return json({
        user,
        selectedEngines: selectedEngines.map(e => ({
            ...e,
            price: engineToPriceMap[e.id] || engineToPriceMap[e.name] || e.basePrice
        })),
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

    const paymentMethod = formData.get("paymentMethod") as string;
    const transactionId = formData.get("transactionId") as string;
    const paymentProof = formData.get("paymentProof") as File | null;
    const enginesJson = formData.get("enginesJson") as string;
    const subtotal = parseFloat(formData.get("subtotal") as string) || 0;
    const gst = parseFloat(formData.get("gst") as string) || 0;

    const orgId = user.organisationId;
    if (!orgId) {
        return json({ success: false, message: "No organisation found for user." }, { status: 400 });
    }

    try {
        const { getCompanyProfile } = await import("~/models/company.model.server");
        const companyProfile = await getCompanyProfile(orgId);

        // Parse selected engines from hidden field
        const engines: Array<{ id: string; name: string; price: number }> = enginesJson ? JSON.parse(enginesJson) : [];
        const cartItems = engines.map(e => ({
            engineName: e.name,
            displayName: e.name,
            productName: e.name,
            price: e.price,
        }));

        // Upload payment proof to S3 if provided
        let proofUrl = "";
        if (paymentProof && paymentProof instanceof File && paymentProof.size > 0) {
            try {
                const { uploadFileToS3 } = await import("~/lib/s3.server");
                proofUrl = await uploadFileToS3(paymentProof, "payment-proofs");
            } catch (s3Err) {
                console.warn("S3 upload failed, continuing without proof URL:", s3Err);
            }
        }

        // Create invoice in DynamoDB
        const { generateInvoice, submitPaymentProof } = await import("~/models/payment.model.server");
        const invoice = await generateInvoice(orgId, cartItems, companyProfile, {
            name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
            email: user.email || "",
            phone: (user as any).phone_number || "",
        });

        // Update to payment_submitted status with proof
        await submitPaymentProof(invoice.invoiceId, orgId, {
            paymentMethod: paymentMethod as "bank_transfer" | "upi" | "qr_code",
            transactionId: transactionId || "",
            paymentProofUrl: proofUrl,
            paymentNotes: `Manual payment via ${paymentMethod}`,
        });

        // Notify Admin
        try {
            const { notifyAdmin } = await import("~/services/admin.notifier.server");
            await notifyAdmin(
                "Manual Payment Submitted",
                `Payment proof submitted for verification:\nUser: ${user.first_name} ${user.last_name} (${user.email})\nMethod: ${paymentMethod}\nTransaction ID: ${transactionId}\nAmount: ₹${subtotal + gst}\nInvoice: ${invoice.invoiceNumber}\nVerify at: https://www.hrteksystem.com/admin/payments/verification`
            );
        } catch (notifierError) {
            console.warn("Failed to notify admin about payment:", notifierError);
        }

        return json({
            success: true,
            message: "Payment proof submitted successfully. Admin will verify and activate your engines within 24 hours."
        });
    } catch (error) {
        console.error("Error processing manual payment submission:", error);
        return json({ success: false, message: "Failed to submit payment. Please try again or contact support." }, { status: 500 });
    }
}

export default function ManualPayment() {
    const data = useLoaderData<typeof loader>();
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const isSuccess = actionData?.success;

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
                accountName: "Delosch Technologies Private Limited",
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
                upiId: "deloschtechnologiesprivatelimited@sbi",
                upiName: "Delosch Technologies Private Limited"
            }
        },
        {
            id: "qr",
            name: "QR Code",
            icon: QrCode,
            details: {
                qrImage: "/assets/payment/upi-qr-code.jpg"
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
                        {isSuccess ? (
                            <div className="lg:col-span-3 text-center py-12">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                                    <CheckCircle className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Payment Submitted!</h2>
                                <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                                    {actionData.message}
                                </p>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={() => window.location.href = "/dashboard"}
                                        className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Go to Dashboard
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
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
                                                    Bundle discount applied
                                                </p>
                                            </div>
                                        )}

                                        <div className="space-y-3 mb-4">
                                            {data.selectedEngines.map((engine: any) => (
                                                <div key={engine.id} className="flex justify-between text-sm">
                                                    <span className="text-gray-700">{engine.name}</span>
                                                    <span className="text-gray-900 font-medium">₹{engine.basePrice.toLocaleString('en-IN')}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="border-t border-gray-200 pt-4 space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700">Subtotal</span>
                                                <span className="text-gray-900">₹{data.subtotal.toLocaleString('en-IN')}</span>
                                            </div>
                                            {data.savings > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-green-700">Bundle Savings</span>
                                                    <span className="text-green-700">-₹{data.savings.toLocaleString('en-IN')}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-700">GST (18%)</span>
                                                <span className="text-gray-900">₹{data.gst.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                                                <span className="text-gray-900">Total</span>
                                                <span className="text-blue-600">₹{data.grandTotal.toLocaleString('en-IN')}</span>
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
                                                    <span className="font-semibold text-gray-900">Delosch Technologies Private Limited</span>
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
                                                    <span className="font-mono font-semibold text-gray-900">deloschtechnologiesprivatelimited@sbi</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-700">Name:</span>
                                                    <span className="font-semibold text-gray-900">Delosch Technologies Private Limited</span>
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
                                                <div className="bg-white p-4 rounded-lg inline-block shadow-md">
                                                    <div className="w-72 h-72 rounded-lg flex items-center justify-center overflow-hidden">
                                                        <img
                                                            src="/assets/payment/upi-qr-code.jpg"
                                                            alt="UPI QR Code"
                                                            className="w-full h-full object-contain cursor-zoom-in"
                                                            onClick={() => window.open('/assets/payment/upi-qr-code.jpg', '_blank')}
                                                        />
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
                                        <input type="hidden" name="subtotal" value={data.subtotal} />
                                        <input type="hidden" name="gst" value={data.gst} />
                                        <input type="hidden" name="enginesJson" value={JSON.stringify(data.selectedEngines)} />

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
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
