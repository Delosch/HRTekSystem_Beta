import { useState, useEffect } from "react";
import { useLoaderData, Form, useActionData, useNavigation, useSearchParams } from "@remix-run/react";
import { LoaderFunction, ActionFunction, redirect, json } from "@remix-run/node";
import {
    Download,
    Upload,
    CheckCircle,
    Clock,
    AlertCircle,
    FileText,
    Building2,
    Lock,
    X,
    ArrowRight
} from "lucide-react";
import Sidebar from "~/components/DashboardComponents/Sidebar";
import { InvoiceTemplate } from "~/components/InvoiceTemplate";
import type { PaymentMethod, PaymentRecord } from "~/models/payment.model.server";

interface LoaderData {
    payment: PaymentRecord;
    companyName: string;
    companyAddress?: string;
    companyGSTIN?: string;
    billingContact?: {
        name: string;
        email: string;
        phone: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        gstin?: string;
    };
    user: any;
}

export const loader: LoaderFunction = async ({ request, params }) => {
    const { getEnhancedUser } = await import("~/utils/user.server");
    const user = await getEnhancedUser(request);
    if (!user) return redirect('/auth');

    const invoiceId = params.invoiceId;
    if (!invoiceId) return redirect('/cartDashboard');

    const { getPaymentRecord, getCompanyPayments, normalizeEngineName } = await import("~/models/payment.model.server");
    const payment = await getPaymentRecord(invoiceId, user.organisationId || "");
    if (!payment) return redirect('/cartDashboard');

    console.log("🔍 [INVOICE LOADER] Loading invoice:", invoiceId);
    console.log("🔍 [INVOICE LOADER] Payment status:", payment.status);
    console.log("🔍 [INVOICE LOADER] Payment has installments:", Array.isArray(payment.installments), payment.installments?.length || 0);
    console.log("🔍 [INVOICE LOADER] Payment hsnCode:", payment.hsnCode);

    // Fetch the latest installment statuses from the request record
    // (installment status updates go to the request record, not the invoice record)
    try {
        const companyPayments = await getCompanyPayments(user.organisationId || "");
        const engineName = payment.engineName || payment.items?.[0]?.engineName || "";
        console.log("🔍 [INVOICE LOADER] Engine name from payment:", engineName);
        console.log("🔍 [INVOICE LOADER] Total company payments found:", companyPayments.length);

        if (engineName) {
            const cleanedName = engineName.replace(/ - Installment #\d+$/, "");
            const normalizedEngineName = normalizeEngineName(cleanedName);
            console.log("🔍 [INVOICE LOADER] Normalized engine name:", normalizedEngineName);
            
            // Log all request_based records for debugging
            const allRequestBased = companyPayments.filter(p => p.workflowType === "request_based");
            console.log("🔍 [INVOICE LOADER] Request-based records found:", allRequestBased.length);
            allRequestBased.forEach((p, i) => {
                console.log(`🔍 [INVOICE LOADER]   Request ${i}: engine="${p.engineName}", itemEngine="${p.items?.[0]?.engineName}", installments=${p.installments?.length || 0}, status="${p.status}", hsnCode="${p.hsnCode}"`);
            });
            
            const requestRecords = companyPayments.filter(p => {
                if (p.workflowType !== "request_based") return false;
                if (p.status === "cleared") return false;
                
                const pEngineName = normalizeEngineName(p.engineName || "");
                const pItemEngineName = normalizeEngineName(p.items?.[0]?.engineName || "");
                
                const match = pEngineName === normalizedEngineName || pItemEngineName === normalizedEngineName;
                console.log(`🔍 [INVOICE LOADER]   Comparing: "${pEngineName}" or "${pItemEngineName}" === "${normalizedEngineName}" => ${match}`);
                return match;
            }).sort((a, b) => {
                // Prioritize approved records
                if (a.status === 'request_approved' && b.status !== 'request_approved') return -1;
                if (b.status === 'request_approved' && a.status !== 'request_approved') return 1;
                return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
            });
            
            console.log("🔍 [INVOICE LOADER] Matching request records:", requestRecords.length);
            const requestRecord = requestRecords[0];

            if (requestRecord && Array.isArray(requestRecord.installments)) {
                console.log("🔍 [INVOICE LOADER] ✅ Found request record with", requestRecord.installments.length, "installments");
                requestRecord.installments.forEach((inst: any) => {
                    console.log(`🔍 [INVOICE LOADER]   Inst ${inst.installmentNumber}: ${inst.percentage}%, status=${inst.status}, splitDetails=${inst.splitDetails?.length || 0}`);
                });
                
                if (Array.isArray(payment.installments)) {
                    console.log("🔍 [INVOICE LOADER] Merging into existing payment installments");
                    payment.installments = payment.installments.map(inst => {
                        const latestInst = requestRecord.installments!.find(
                            (ri: any) => ri.installmentNumber === inst.installmentNumber
                        );
                        if (latestInst) {
                            return { ...inst, status: latestInst.status || inst.status, splitDetails: latestInst.splitDetails || inst.splitDetails };
                        }
                        return inst;
                    });
                } else {
                    console.log("🔍 [INVOICE LOADER] Payment had NO installments - copying from request record");
                    payment.installments = requestRecord.installments;
                    payment.paymentType = requestRecord.paymentType || 'milestone';
                }
            } else {
                console.log("🔍 [INVOICE LOADER] ❌ No matching request record found with installments");
            }

            // Also grab HSN code from the request record if the payment doesn't have one
            if (!payment.hsnCode && requestRecord?.hsnCode) {
                console.log("🔍 [INVOICE LOADER] Copying hsnCode from request:", requestRecord.hsnCode);
                payment.hsnCode = requestRecord.hsnCode;
            }
        } else {
            console.log("🔍 [INVOICE LOADER] ⚠️ No engine name found on payment, skipping request record lookup");
        }
    } catch (err) {
        console.error("🔍 [INVOICE LOADER] ❌ ERROR in installment merge:", err);
    }

    console.log("🔍 [INVOICE LOADER] FINAL payment.installments:", payment.installments?.length || 0);
    console.log("🔍 [INVOICE LOADER] FINAL payment.hsnCode:", payment.hsnCode);

    // Fetch company details to get company name and billing info
    const { getCompanyProfile } = await import("~/models/company.model.server");
    const companyProfile = await getCompanyProfile(user.organisationId || "").catch((err) => {
        console.warn("Unable to load company profile for invoice page", err);
        return null;
    });

    return json<LoaderData>({
        payment,
        companyName: companyProfile?.company_name || "Your Company",
        companyAddress: companyProfile?.address || undefined,
        companyGSTIN: companyProfile?.govid_type === "GST" ? companyProfile?.pan_gst_adhaar : undefined,
        billingContact: payment.billingContact || undefined,
        user
    });
};

export const action: ActionFunction = async ({ request, params }) => {
    const { requireUserSession } = await import("~/lib/session.server");
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
            const proofFileEntry = formData.get("proofFile");

            if (!(proofFileEntry instanceof File)) {
                return json({ error: "Please upload payment proof" }, { status: 400 });
            }

            const proofFile = proofFileEntry;

            console.log("📝 Payment submission:", { invoiceId, method: paymentMethod, fileSize: proofFile?.size });

            if (!proofFile || proofFile.size === 0) {
                return json({ error: "Please upload payment proof" }, { status: 400 });
            }

            // Upload proof to S3
            console.log("☁️ Uploading to S3...");
            const sanitizedFileName = proofFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
            const { uploadToS3 } = await import("~/lib/s3.server");
            const proofUrl = await uploadToS3(
                proofFile,
                `payment-proofs/${user.organisationId}/${invoiceId}/${sanitizedFileName}`
            );
            console.log("✅ S3 upload done:", proofUrl);

            console.log("💾 Saving to DynamoDB...");
            const { submitPaymentProof } = await import("~/models/payment.model.server");
            await submitPaymentProof(invoiceId, user.organisationId || "", {
                paymentMethod,
                transactionId: transactionId || undefined,
                paymentProofUrl: proofUrl,
                paymentDate,
                paymentNotes: paymentNotes || undefined
            });
            console.log("✅ DynamoDB save done");

            // Also clear the cart here to be absolutely sure
            const { clearCart } = await import("~/models/cart.model.server");
            await clearCart(user.organisationId || "");
            console.log("✅ Cart cleared after payment proof submission");

            try {
                const { notifyAdmin } = await import("~/services/admin.notifier.server");
                await notifyAdmin(
                    "Payment Proof Submitted",
                    `A payment proof has been submitted for verification.\n\nCompany: ${user.organisationId || "Unknown"}\nInvoice: ${invoiceId}\nPayment Method: ${paymentMethod}\nTransaction ID: ${transactionId || "N/A"}\nPayment Date: ${paymentDate}\nAmount: ${payment.totalAmount}`
                );
            } catch (notifierError) {
                console.warn("Failed to notify admin about payment proof submission:", notifierError);
            }

            return redirect(`/payment/invoice/${invoiceId}?proofSubmitted=1`);
        } catch (error) {
            console.error("❌ Payment submission error:", error);
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            console.error("Error details:", errorMessage);
            return json({ error: `Failed to submit payment proof: ${errorMessage}` }, { status: 500 });
        }
    }

    return json({ error: "Invalid action" }, { status: 400 });
};

export default function InvoicePage() {
    const { payment, companyName, companyAddress, companyGSTIN, billingContact, user } = useLoaderData<LoaderData>();
    const actionData = useActionData<{ success?: boolean; message?: string; error?: string }>();
    const navigation = useNavigation();
    const [searchParams] = useSearchParams();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const isSubmitting = navigation.state === "submitting";
    const proofSubmitted = searchParams.get("proofSubmitted") === "1";

    useEffect(() => {
        if (actionData?.success || proofSubmitted) {
            setShowSuccessModal(true);
        }
    }, [actionData, proofSubmitted]);

    useEffect(() => {
        if (!proofSubmitted) return;

        const nextUrl = new URL(window.location.href);
        nextUrl.searchParams.delete("proofSubmitted");
        window.history.replaceState({}, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    }, [proofSubmitted]);

    useEffect(() => {
        if (!actionData?.error) return;

        window.scrollTo({ top: 0, behavior: "smooth" });
        const errorBanner = document.querySelector(".success-error-messages");
        if (errorBanner instanceof HTMLElement) {
            errorBanner.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [actionData?.error]);

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
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${badge.color}`}>
                <Icon className="w-4 h-4" />
                {badge.text}
            </span>
        );
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page {
                        size: A4;
                        margin: 12mm 10mm;
                    }

                    /* Reset everything */
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                        font-size: 11px !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    /* Hide all non-invoice elements */
                    nav, .sidebar, button, .print\\:hidden, footer,
                    #payment-upload-form, #payment-methods-section,
                    .success-error-messages, [class*="print:hidden"] {
                        display: none !important;
                    }

                    /* Reset the flex layout so sidebar margin is removed */
                    .flex.flex-col.md\\:flex-row.min-h-screen {
                        display: block !important;
                        min-height: auto !important;
                        background: white !important;
                    }

                    /* Remove sidebar margin and padding from main */
                    main {
                        margin: 0 !important;
                        margin-left: 0 !important;
                        padding: 0 !important;
                        width: 100% !important;
                    }

                    /* Reset max-width container */
                    .max-w-5xl {
                        max-width: 100% !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .space-y-6 > :not(#invoice-content) {
                        display: none !important;
                    }
                    .space-y-6 > #invoice-content {
                        display: block !important;
                    }

                    /* Invoice content card - remove decorative styles */
                    #invoice-content {
                        border: none !important;
                        box-shadow: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        border-radius: 0 !important;
                        background: white !important;
                    }

                    /* Invoice badge at the top */
                    #invoice-content > div > .mb-4 {
                        margin-bottom: 8px !important;
                    }

                    /* InvoiceTemplate root container */
                    #invoice-content .max-w-5xl {
                        max-width: 100% !important;
                        border: 1px solid #e2e8f0 !important;
                        box-shadow: none !important;
                        display: block !important;
                    }

                    /* Inner padding for the invoice template */
                    #invoice-content .px-8.py-6 {
                        padding: 20px 24px !important;
                    }

                    /* Header section: ensure side-by-side layout */
                    #invoice-content .flex.flex-col.xl\\:flex-row {
                        display: flex !important;
                        flex-direction: row !important;
                        justify-content: space-between !important;
                    }

                    /* Logo image */
                    #invoice-content img {
                        max-height: 48px !important;
                    }

                    /* Rounded cards in Bill To / Payment Details - flatten for print */
                    #invoice-content .rounded-3xl {
                        border-radius: 8px !important;
                        padding: 12px 16px !important;
                        page-break-inside: avoid;
                    }

                    /* Grid columns - force side-by-side */
                    #invoice-content .grid.grid-cols-1.lg\\:grid-cols-2,
                    #invoice-content .grid.grid-cols-1.md\\:grid-cols-2 {
                        display: grid !important;
                        grid-template-columns: 1fr 1fr !important;
                        gap: 16px !important;
                    }

                    /* Table styling for print */
                    #invoice-content table {
                        width: 100% !important;
                        border-collapse: collapse !important;
                        page-break-inside: avoid;
                    }

                    #invoice-content thead tr {
                        background-color: #f1f5f9 !important;
                    }

                    #invoice-content th, #invoice-content td {
                        padding: 8px 12px !important;
                        font-size: 10px !important;
                    }

                    #invoice-content tbody tr {
                        background-color: white !important;
                    }

                    /* Background colors must be preserved */
                    .bg-slate-100, .bg-slate-50 {
                        background-color: #f8fafc !important;
                    }

                    /* Font sizes for print */
                    #invoice-content h1 {
                        font-size: 18px !important;
                    }

                    #invoice-content .text-3xl {
                        font-size: 20px !important;
                    }

                    #invoice-content .text-2xl {
                        font-size: 16px !important;
                    }

                    #invoice-content .text-lg {
                        font-size: 13px !important;
                    }

                    /* Prevent page breaks inside important sections */
                    #invoice-content > div {
                        page-break-inside: avoid;
                    }

                    /* Ensure total summary and terms don't break across pages */
                    #invoice-content .mb-10,
                    #invoice-content .pb-10 {
                        margin-bottom: 16px !important;
                        padding-bottom: 16px !important;
                        page-break-inside: avoid;
                    }

                    /* Signature box */
                    #invoice-content .h-24 {
                        height: 60px !important;
                        border-radius: 8px !important;
                    }

                    /* Footer text */
                    #invoice-content .pt-8 {
                        padding-top: 12px !important;
                    }

                    /* Hide the locked overlay in print */
                    #invoice-content .absolute.inset-0 {
                        display: none !important;
                    }

                    /* Hide rejection reason in print */
                    #invoice-content .bg-red-50 {
                        display: none !important;
                    }
                }
            `}} />

            <div className="print:hidden">
                {!isSidebarCollapsed && <Sidebar user={user} />}
            </div>

            <main className="flex-1 md:ml-64 p-6 sm:p-10">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* Error Banner */}
                    {actionData?.error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 success-error-messages">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div>
                                <h3 className="font-semibold text-red-900">Error</h3>
                                <p className="text-sm text-red-800">{actionData.error}</p>
                            </div>
                        </div>
                    )}

                    {/* ── SECTION 1: Invoice Card ── */}
                    <div className="bg-white rounded-xl shadow-md p-8 border border-gray-200 relative print:shadow-none print:border-none print:m-0 print:p-0" id="invoice-content">
                        {/* Locked Overlay */}
                        {payment.status === "payment_rejected" && (
                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 rounded-xl flex items-center justify-center border-4 border-slate-100">
                                <div className="text-center p-8 max-w-md">
                                    <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-200">
                                        <Lock className="w-10 h-10 text-slate-400" />
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-900 mb-2 uppercase tracking-tighter">Document Locked</h3>
                                    <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                                        {payment.status === "pending_payment" && "This invoice will be fully accessible once the payment has been initiated and verified by our finance team."}
                                        {payment.status === "payment_submitted" && "Verification in progress. Your submitted proof is being cross-checked with our bank statements."}
                                        {payment.status === "payment_rejected" && "Verification failed. The uploaded proof was not acknowledged. Please resubmit the transaction details."}
                                    </p>
                                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-slate-900 text-white rounded-xl shadow-lg">
                                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                                        <span className="text-xs font-black uppercase tracking-widest">
                                            {payment.status === "pending_payment" && "Awaiting Settlement"}
                                            {payment.status === "payment_submitted" && "Audit Underway"}
                                            {payment.status === "payment_rejected" && "Settlement Rejected"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Invoice Content */}
                        <div>
                            <div className="mb-4 flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${payment.status === "payment_verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-indigo-50 text-indigo-700 border-indigo-200"}`}>
                                    {payment.status === "payment_verified" ? "FINAL INVOICE" : "PROFORMA INVOICE"}
                                </span>
                            </div>
                            <InvoiceTemplate
                                invoiceLabel={payment.status === "payment_verified" ? "Final Invoice" : "Proforma Invoice"}
                                invoiceNumber={payment.status === "payment_verified" ? (payment.finalInvoiceNumber || payment.invoiceNumber) : (payment.proformaInvoiceNumber || payment.invoiceNumber)}
                                invoiceDate={payment.status === "payment_verified" ? (payment.finalInvoiceDate || payment.invoiceDate) : payment.invoiceDate}
                                dueDate={payment.dueDate || payment.invoiceDate}
                                companyName={companyName}
                                companyAddress={companyAddress}
                                companyGSTIN={companyGSTIN}
                                billingContact={billingContact}
                                items={payment.items || []}
                                subtotal={payment.subtotal ?? 0}
                                gstAmount={payment.gstAmount ?? 0}
                                cgst={payment.cgst}
                                sgst={payment.sgst}
                                igst={payment.igst}
                                totalAmount={payment.totalAmount ?? 0}
                                paymentMethod={payment.paymentMethod}
                                hsnCode={payment.hsnCode}
                                paymentType={payment.paymentType}
                                paidAmount={payment.paidAmount ?? 0}
                                balanceDue={payment.balanceDue ?? 0}
                                installments={payment.installments}
                            />
                            {payment.status === "payment_rejected" && payment.rejectionReason && (
                                <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-lg">
                                    <h3 className="font-semibold text-red-900 mb-2">Payment Rejected:</h3>
                                    <p className="text-sm text-red-800">{payment.rejectionReason}</p>
                                    <p className="text-sm text-red-800 mt-2">Please resubmit valid payment proof.</p>
                                </div>
                            )}
                        </div>

                        {/* Payment Methods (inside invoice card) */}
                        {(payment.status === "pending_payment" || payment.status === "payment_rejected") && (
                            <div id="payment-methods-section" className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Building2 className="w-6 h-6 text-blue-600" />
                                    Payment Methods
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg p-6 shadow-md border border-blue-100">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-center">Scan & Pay via UPI</h4>
                                            <div className="text-center mb-3">
                                                <p className="text-xs text-gray-600 mb-1">UPI ID:</p>
                                                <p className="text-sm font-mono font-semibold text-gray-900 bg-gray-50 px-3 py-1 rounded">deloschtechnologiesprivatelimited@sbi</p>
                                            </div>
                                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Google Pay</span>
                                                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">PhonePe</span>
                                                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">Paytm</span>
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">BHIM</span>
                                            </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-6 shadow-md border border-blue-100">
                                        <h4 className="font-semibold text-gray-900 mb-4">Bank Transfer / NEFT / RTGS</h4>
                                        <div className="space-y-3 text-sm">
                                            <div><p className="text-gray-600 text-xs">Account Name:</p><p className="font-semibold text-gray-900">Delosch Technologies Private Limited</p></div>
                                            <div><p className="text-gray-600 text-xs">Bank Name:</p><p className="font-semibold text-gray-900">State Bank of India</p></div>
                                            <div><p className="text-gray-600 text-xs">Account Number:</p><p className="font-mono font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">00000020532076408</p></div>
                                            <div><p className="text-gray-600 text-xs">IFSC Code:</p><p className="font-mono font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">SBIN0010175</p></div>
                                            <div><p className="text-gray-600 text-xs">Branch:</p><p className="font-semibold text-gray-900">IIM Branch Lucknow</p></div>
                                            <div className="pt-3 border-t border-gray-200"><p className="text-xs text-gray-600"><strong>Note:</strong> Please use Invoice Number as reference</p></div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" />Payment Instructions:</h4>
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

                    {/* ── Action Buttons ── */}
                    <div className="flex gap-4 print:hidden">
                        <button
                            onClick={downloadInvoice}
                            disabled={payment.status !== "payment_verified"}
                            className={`flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-all ${payment.status === "payment_verified" ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
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

                    {/* ── SECTION 2: Upload Payment Proof ── */}
                    {(payment.status === "pending_payment" || payment.status === "payment_rejected") && (
                        <div id="payment-upload-form" className="pt-4">
                            {/* Section Divider */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-gray-200" />
                                <div className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full shadow-md whitespace-nowrap">
                                    <Upload className="w-4 h-4" />
                                    Step 2: Submit Payment Proof
                                </div>
                                <div className="flex-1 h-px bg-gray-200" />
                            </div>

                            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                                {/* Card Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                                    <h2 className="text-2xl font-bold text-white mb-1">Upload Payment Proof</h2>
                                    <p className="text-blue-100 text-sm">After completing your payment, upload the screenshot or receipt below for verification.</p>
                                </div>

                                {/* Card Body */}
                                <div className="p-8">
                                    <Form method="post" encType="multipart/form-data" className="space-y-6">
                                        <input type="hidden" name="intent" value="submit_payment_proof" />

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method *</label>
                                            <select name="paymentMethod" required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                                                <option value="">Select payment method</option>
                                                <option value="bank_transfer">Bank Transfer / NEFT / RTGS</option>
                                                <option value="upi">UPI Payment</option>
                                                <option value="qr_code">QR Code Payment</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Transaction ID / Reference Number</label>
                                            <input type="text" name="transactionId" placeholder="Enter transaction ID or UTR number" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Date *</label>
                                            <input type="date" name="paymentDate" required max={new Date().toISOString().split('T')[0]} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Payment Proof (Screenshot/Receipt) *</label>
                                            <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
                                                <div className="space-y-1 text-center">
                                                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                                                    <div className="flex text-sm text-gray-600">
                                                        <label className="cursor-pointer font-medium text-blue-600 hover:text-blue-500">
                                                            <span>Upload a file</span>
                                                            <input type="file" name="proofFile" required accept="image/*,.pdf" onChange={handleFileChange} className="sr-only" />
                                                        </label>
                                                        <p className="pl-1">or drag and drop</p>
                                                    </div>
                                                    <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                                                    {selectedFile && <p className="text-sm text-green-600 font-medium mt-2">Selected: {selectedFile.name}</p>}
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                                            <textarea name="paymentNotes" rows={3} placeholder="Any additional information about the payment" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold px-6 py-4 rounded-lg shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Submitting...</>
                                            ) : (
                                                <><Upload className="w-5 h-5" />Submit Payment Proof</>
                                            )}
                                        </button>
                                    </Form>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Verification Status Banner */}
                    {payment.status === "payment_submitted" && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <Clock className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-blue-900 mb-1">Payment Under Verification</h3>
                                    <p className="text-sm text-blue-800">Your payment proof has been submitted. Our team is reviewing it and will verify within 1-2 business days.</p>
                                    {payment.paymentDate && <p className="text-sm text-blue-700 mt-2">Payment Date: {new Date(payment.paymentDate).toISOString().split('T')[0]}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Verified Status Banner */}
                    {payment.status === "payment_verified" && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                            <div className="flex items-start gap-3">
                                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-semibold text-green-900 mb-1">Payment Verified!</h3>
                                    <p className="text-sm text-green-800">Your payment has been successfully verified. You now have full access to all purchased engines.</p>
                                    {payment.verifiedAt && <p className="text-sm text-green-700 mt-2">Verified on: {new Date(payment.verifiedAt).toISOString().split('T')[0]}</p>}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </main>

            {/* ── Success Popup Modal ── */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
                        {/* Green Header */}
                        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-10 text-center">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Proof Submitted!</h2>
                        </div>

                        {/* Body */}
                        <div className="px-8 py-6 text-center">
                            <p className="text-gray-600 mb-2">Your payment proof has been successfully submitted.</p>
                            <p className="text-gray-500 text-sm mb-6">Our team will review and verify it within <span className="font-semibold text-gray-700">1–2 business days</span>. You'll be notified once verified.</p>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 text-left">
                                <div className="flex items-center gap-2 text-blue-700 text-sm font-semibold mb-1">
                                    <Clock className="w-4 h-4" /> What happens next?
                                </div>
                                <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
                                    <li>Admin reviews your payment screenshot</li>
                                    <li>Invoice is unlocked after verification</li>
                                    <li>Your engine access is activated</li>
                                </ul>
                            </div>

                            <div className="flex flex-col gap-3">
                                <a
                                    href="/dashboard"
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                                >
                                    Go to Dashboard <ArrowRight className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => setShowSuccessModal(false)}
                                    className="w-full py-3 border border-gray-200 text-gray-600 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" /> Stay on this page
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export function ErrorBoundary({ error }: { error: Error }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
            <div className="max-w-xl w-full rounded-3xl border border-gray-200 bg-white p-10 shadow-xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice page error</h1>
                <p className="text-gray-600 mb-4">An unexpected error occurred while loading the invoice.</p>
                <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-800">
                    {error.message}
                </div>
                <a href="/cartDashboard" className="mt-6 inline-flex items-center justify-center px-5 py-3 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700">
                    Go back to cart
                </a>
            </div>
        </div>
    );
}

