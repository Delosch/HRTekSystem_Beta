import { json, type LoaderFunctionArgs, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher, useNavigation, useParams } from "@remix-run/react";
import { useState } from "react";
import {
    CheckCircleIcon,
    XCircleIcon,
    LockClosedIcon,
    LockOpenIcon,
    PencilSquareIcon,
    DocumentTextIcon,
    BanknotesIcon,
    CalendarIcon,
    ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { requireAdminSession } from "~/lib/session.server";
import {
    getPaymentRecord,
    lockInvoice,
    unlockInvoice,
    updateInvoicePaymentStatus,
    PaymentRecord,
} from "~/models/payment.model.server";
import { getCompanyProfile } from "~/models/company.model.server";

interface LoaderData {
    invoice: PaymentRecord | null;
    companyName: string;
    error?: string;
}

interface ActionData {
    success?: boolean;
    error?: string;
    message?: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const admin = await requireAdminSession(request);
    const invoiceId = params.invoiceId;

    if (!invoiceId) {
        return redirect("/admin/invoices");
    }

    try {
        // Get all company invoices to find the one
        const { getDynamoDBDocumentClient } = await import("~/lib/dynamodb.server");
        const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");

        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "sk = :sk",
            ExpressionAttributeValues: {
                ":sk": `PAYMENT#${invoiceId}`,
            },
        });

        const response = await ddbDocClient.send(scanCommand);
        const invoice = (response.Items?.[0] as PaymentRecord) || null;

        if (!invoice) {
            return json<LoaderData>({
                invoice: null,
                companyName: "",
                error: "Invoice not found",
            });
        }

        const companyProfile = await getCompanyProfile(invoice.companyId);

        return json<LoaderData>({
            invoice,
            companyName: companyProfile?.company_name || invoice.companyId,
        });
    } catch (error) {
        console.error("Error loading invoice:", error);
        return json<LoaderData>({
            invoice: null,
            companyName: "",
            error: "Failed to load invoice",
        });
    }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    const admin = await requireAdminSession(request);
    const invoiceId = params.invoiceId as string;
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    try {
        // Get company ID from invoice
        const { getDynamoDBDocumentClient } = await import("~/lib/dynamodb.server");
        const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");

        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        const scanCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "sk = :sk",
            ExpressionAttributeValues: {
                ":sk": `PAYMENT#${invoiceId}`,
            },
        });

        const response = await ddbDocClient.send(scanCommand);
        const invoice = (response.Items?.[0] as PaymentRecord) || null;

        if (!invoice) {
            return json<ActionData>({ error: "Invoice not found" }, { status: 404 });
        }

        if (intent === "lock") {
            await lockInvoice(invoiceId, invoice.companyId, admin.userId);
            return json<ActionData>({ success: true, message: "Invoice locked successfully" });
        }

        if (intent === "unlock") {
            await unlockInvoice(invoiceId, invoice.companyId, admin.userId);
            return json<ActionData>({ success: true, message: "Invoice unlocked successfully" });
        }

        if (intent === "add_payment") {
            const paidAmount = Number(formData.get("paidAmount") || 0);
            const paymentNotes = formData.get("paymentNotes") as string;

            if (paidAmount <= 0) {
                return json<ActionData>({ error: "Payment amount must be greater than 0" }, { status: 400 });
            }

            await updateInvoicePaymentStatus(invoiceId, invoice.companyId, paidAmount, paymentNotes || undefined);
            return json<ActionData>({ success: true, message: "Payment added successfully" });
        }

        return json<ActionData>({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error processing action:", error);
        return json<ActionData>({ error: "Failed to process action" }, { status: 500 });
    }
};

export default function AdminInvoiceDetail() {
    const { invoice, companyName, error } = useLoaderData<LoaderData>();
    const fetcher = useFetcher<ActionData>();
    const navigation = useNavigation();
    const params = useParams();

    const [isEditingPayment, setIsEditingPayment] = useState(false);
    const [paidAmount, setPaidAmount] = useState("");
    const [paymentNotes, setPaymentNotes] = useState("");

    if (error) {
        return (
            <div className="max-w-7xl mx-auto p-4 py-12 text-center">
                <XCircleIcon className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{error}</h1>
                <button
                    onClick={() => window.history.back()}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                    <ArrowLeftIcon className="h-4 w-4 inline mr-2" />
                    Go Back
                </button>
            </div>
        );
    }

    if (!invoice) {
        return (
            <div className="max-w-7xl mx-auto p-4 py-12 text-center">
                <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Invoice not found</h1>
            </div>
        );
    }

    const isLocked = invoice.isLocked || false;
    const isSubmitting = navigation.state === "submitting";
    const balanceDue = (invoice.balanceDue ?? invoice.totalAmount) || 0;
    const paidAmountTotal = invoice.paidAmount || 0;

    const handleAddPayment = () => {
        if (!paidAmount || Number(paidAmount) <= 0) return;

        fetcher.submit(
            {
                intent: "add_payment",
                paidAmount,
                paymentNotes,
            },
            { method: "post" }
        );

        setPaidAmount("");
        setPaymentNotes("");
        setIsEditingPayment(false);
    };

    const handleLockToggle = () => {
        fetcher.submit(
            {
                intent: isLocked ? "unlock" : "lock",
            },
            { method: "post" }
        );
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ArrowLeftIcon className="h-6 w-6 text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Invoice Details</h1>
                        <p className="text-gray-500 mt-1">Invoice #{invoice.invoiceNumber}</p>
                    </div>
                </div>
                <button
                    onClick={handleLockToggle}
                    disabled={isSubmitting}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                        isLocked
                            ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                            : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    } disabled:opacity-50`}
                >
                    {isLocked ? (
                        <>
                            <LockClosedIcon className="h-4 w-4" />
                            Unlock Invoice
                        </>
                    ) : (
                        <>
                            <LockOpenIcon className="h-4 w-4" />
                            Lock Invoice
                        </>
                    )}
                </button>
            </div>

            {/* Status Banner */}
            {isLocked && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3"
                >
                    <LockClosedIcon className="h-5 w-5 text-rose-600" />
                    <div>
                        <p className="font-medium text-rose-900">This invoice is locked</p>
                        <p className="text-sm text-rose-700">
                            Locked by {invoice.lockedBy} on {invoice.lockedAt ? new Date(invoice.lockedAt).toLocaleDateString() : "Unknown date"}
                        </p>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Invoice Information Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
                            Invoice Information
                        </h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Invoice Number</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{invoice.invoiceNumber}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Invoice Type</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">{invoice.invoiceKind || "PROFORMA"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Invoice Date</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                    {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Due Date</p>
                                <p className="text-lg font-bold text-gray-900 mt-1">
                                    {new Date(invoice.dueDate).toLocaleDateString("en-IN")}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Company & Billing Details */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Company & Billing</h2>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-600 font-medium">Company ID</p>
                                <p className="text-base font-bold text-gray-900 mt-1">{companyName}</p>
                            </div>
                            {invoice.billingContact && (
                                <>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Billing Contact</p>
                                        <p className="text-base font-bold text-gray-900 mt-1">{invoice.billingContact.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Email</p>
                                        <p className="text-base text-gray-900 mt-1">{invoice.billingContact.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600 font-medium">Phone</p>
                                        <p className="text-base font-bold text-gray-900 mt-1">{invoice.billingContact.phone}</p>
                                    </div>
                                    {invoice.billingContact.gstin && (
                                        <div>
                                            <p className="text-sm text-gray-600 font-medium">GSTIN</p>
                                            <p className="text-base font-bold text-gray-900 mt-1">{invoice.billingContact.gstin}</p>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </motion.div>

                    {/* Line Items */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                    >
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Line Items</h2>

                        <div className="space-y-4">
                            {invoice.items?.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center pb-4 border-b border-gray-200 last:border-0">
                                    <div>
                                        <p className="font-medium text-gray-900">{item.engineName}</p>
                                        <p className="text-sm text-gray-500">{item.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-gray-900">₹{(item.price || 0).toLocaleString()}</p>
                                        {item.durationMonths && (
                                            <p className="text-xs text-gray-500">{item.durationMonths} month(s)</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Payment Summary */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 p-6 shadow-sm"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BanknotesIcon className="h-5 w-5 text-indigo-600" />
                            Payment Summary
                        </h3>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-700">Subtotal</span>
                                <span className="font-bold text-gray-900">₹{(invoice.subtotal || 0).toLocaleString()}</span>
                            </div>
                            {invoice.cgst && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">CGST (9%)</span>
                                    <span className="font-bold text-gray-900">₹{Math.round(invoice.cgst).toLocaleString()}</span>
                                </div>
                            )}
                            {invoice.sgst && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">SGST (9%)</span>
                                    <span className="font-bold text-gray-900">₹{Math.round(invoice.sgst).toLocaleString()}</span>
                                </div>
                            )}
                            {invoice.igst && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-700">IGST (18%)</span>
                                    <span className="font-bold text-gray-900">₹{Math.round(invoice.igst).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="border-t border-indigo-300 pt-3">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="font-medium text-gray-900">Total Amount</span>
                                    <span className="text-xl font-bold text-indigo-600">₹{(invoice.totalAmount || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div className="bg-white rounded-lg p-3 space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Paid Amount</span>
                                    <span className="font-bold text-emerald-600">₹{paidAmountTotal.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Balance Due</span>
                                    <span className={`font-bold ${balanceDue > 0 ? "text-rose-600" : "text-emerald-600"}`}>
                                        ₹{balanceDue.toLocaleString()}
                                    </span>
                                </div>
                            </div>

                            {balanceDue === 0 && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2">
                                    <CheckCircleIcon className="h-5 w-5 text-emerald-600" />
                                    <p className="text-sm font-medium text-emerald-700">Fully Paid</p>
                                </div>
                            )}
                        </div>
                    </motion.div>

                    {/* Add Payment Section */}
                    {!isLocked && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Record Payment</h3>

                            {isEditingPayment ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Amount *
                                        </label>
                                        <div className="flex items-center">
                                            <span className="text-gray-500 mr-2">₹</span>
                                            <input
                                                type="number"
                                                value={paidAmount}
                                                onChange={(e) => setPaidAmount(e.target.value)}
                                                placeholder="Enter amount"
                                                max={balanceDue}
                                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">Max: ₹{balanceDue.toLocaleString()}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Notes (Optional)
                                        </label>
                                        <textarea
                                            value={paymentNotes}
                                            onChange={(e) => setPaymentNotes(e.target.value)}
                                            placeholder="Add notes about this payment..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                        />
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setIsEditingPayment(false)}
                                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddPayment}
                                            disabled={isSubmitting || !paidAmount}
                                            className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Adding..." : "Add Payment"}
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditingPayment(true)}
                                    disabled={balanceDue === 0}
                                    className="w-full px-4 py-3 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <PencilSquareIcon className="h-4 w-4" />
                                    {balanceDue > 0 ? "Record Payment" : "No Balance Due"}
                                </button>
                            )}
                        </motion.div>
                    )}

                    {/* Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
                    >
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Status</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Invoice Status</span>
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                    {invoice.status}
                                </span>
                            </div>
                            {isLocked && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Lock Status</span>
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                                        <LockClosedIcon className="h-3 w-3" />
                                        Locked
                                    </span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Success Toast */}
            <AnimatePresence>
                {fetcher.data?.success && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-4 right-4 bg-emerald-600 text-white rounded-lg p-4 shadow-lg"
                    >
                        {fetcher.data.message}
                    </motion.div>
                )}
                {fetcher.data?.error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        className="fixed bottom-4 right-4 bg-rose-600 text-white rounded-lg p-4 shadow-lg"
                    >
                        {fetcher.data.error}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
