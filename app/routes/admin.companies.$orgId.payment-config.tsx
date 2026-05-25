import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { useState, useEffect } from "react";
import {
    getCompanyPayments,
    PaymentRecord,
    InstallmentDetail,
} from "~/models/payment.model.server";
import { isCoreEngineClient as isCoreEngine, CORE_ENGINE_NAMES_CLIENT as CORE_ENGINE_NAMES } from "~/utils/engine-classification";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { getCompanyProfile } from "~/models/company.model.server";
import {
    CheckIcon,
    ExclamationTriangleIcon,
    PlusIcon,
    TrashIcon,
} from "@heroicons/react/24/outline";

interface ActionData {
    success?: boolean;
    message?: string;
    error?: string;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await requireAdminSession(request);
    const { orgId } = params;

    try {
        const [company, payments] = await Promise.all([
            getCompanyProfile(orgId || ""),
            getCompanyPayments(orgId || ""),
        ]);

        // Filter for pending payment requests
        const pendingPayments = payments.filter(
            (p) => p.status === "request_pending_approval" || p.status === "pending_payment"
        );

        return json({
            company,
            payments: pendingPayments,
            orgId,
        });
    } catch (error) {
        console.error("Error loading payments:", error);
        return json({
            company: null,
            payments: [],
            orgId,
            error: "Failed to load payment data",
        });
    }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    await requireAdminSession(request);
    const { orgId } = params;
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    try {
        if (intent === "configure-payment") {
            const invoiceId = formData.get("invoiceId") as string;
            const paymentType = formData.get("paymentType") as "full" | "milestone";
            const fullAmount = parseInt(formData.get("fullAmount") as string);

            if (!invoiceId || !fullAmount) {
                return json<ActionData>(
                    { error: "Invoice ID and full amount are required" },
                    { status: 400 }
                );
            }

            const hsnCode = formData.get("hsnCode") as string;
            if (!hsnCode) {
                return json<ActionData>(
                    { error: "HSN Code is required" },
                    { status: 400 }
                );
            }

            const allocatedCoreEngines = formData.getAll("coreEngines") as string[];

            // Parse milestone configurations
            const installments: InstallmentDetail[] = [];
            let idx = 0;

            while (formData.has(`milestone_${idx}_percentage`)) {
                const percentage = parseInt(formData.get(`milestone_${idx}_percentage`) as string);
                const amount = Math.round((fullAmount * percentage) / 100);
                const dueDate = formData.get(`milestone_${idx}_dueDate`) as string;
                const features = (formData.get(`milestone_${idx}_features`) as string || "")
                    .split(",")
                    .map((f) => f.trim())
                    .filter(Boolean);

                if (percentage > 0 && percentage <= 100) {
                    installments.push({
                        installmentNumber: idx + 1,
                        percentage,
                        status: "unpaid",
                        amount,
                        splitDetails: [
                            {
                                item: `Milestone ${idx + 1}`,
                                description: `Payment for ${percentage}% of services`,
                                amount: amount.toString(),
                            },
                        ],
                        enabled: true,
                    });
                }
                idx++;
            }

            if (installments.length === 0 && paymentType === "milestone") {
                return json<ActionData>(
                    { error: "At least one milestone must be configured for milestone-based payment" },
                    { status: 400 }
                );
            }

            // Verify percentages add up to 100 for milestone payments
            if (paymentType === "milestone") {
                const totalPercentage = installments.reduce((sum, i) => sum + i.percentage, 0);
                if (totalPercentage !== 100) {
                    return json<ActionData>(
                        { error: `Milestone percentages must total 100%. Current total: ${totalPercentage}%` },
                        { status: 400 }
                    );
                }
            }

            // Retrieve the original payment to append core engines to items
            const payments = await getCompanyPayments(orgId || "");
            const payment = payments.find(p => p.invoiceId === invoiceId);
            
            if (!payment) {
                return json<ActionData>({ error: "Payment record not found" }, { status: 404 });
            }

            const updatedItems = [...(payment.items || [])];
            for (const coreEngine of allocatedCoreEngines) {
                // Ensure it's not already added
                if (!updatedItems.some(item => item.engineName === coreEngine)) {
                    updatedItems.push({
                        engineName: coreEngine,
                        price: 0,
                        description: `Included Core Engine: ${coreEngine}`,
                        durationMonths: 1,
                    });
                }
            }

            // Save payment configuration to DynamoDB
            const ddbDocClient = getDynamoDBDocumentClient();
            const USERS_TABLE = process.env.DYNAMODB_PAYMENTS_TABLE || process.env.DYNAMODB_TABLE_NAME || "b2b_platform";
            
            await ddbDocClient.send(
                new UpdateCommand({
                    TableName: USERS_TABLE,
                    Key: {
                        pk: `COMPANY#${orgId}`,
                        sk: `PAYMENT#${invoiceId}`,
                    },
                    UpdateExpression: "SET #installments = :installments, #hsnCode = :hsnCode, #paymentType = :paymentType, #items = :items",
                    ExpressionAttributeNames: {
                        "#installments": "installments",
                        "#hsnCode": "hsnCode",
                        "#paymentType": "paymentType",
                        "#items": "items"
                    },
                    ExpressionAttributeValues: {
                        ":installments": installments.length > 0 ? installments : null,
                        ":hsnCode": hsnCode,
                        ":paymentType": paymentType,
                        ":items": updatedItems
                    }
                })
            );

            return json<ActionData>({
                success: true,
                message: `Payment configuration saved for invoice ${invoiceId}`,
            });
        }

        return json<ActionData>({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error in payment config action:", error);
        return json<ActionData>(
            { error: "Failed to save payment configuration" },
            { status: 500 }
        );
    }
};

export default function AdminPaymentConfiguration() {
    const { company, payments, orgId, error: loaderError } = useLoaderData<typeof loader>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();

    const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(
        payments.length > 0 ? payments[0] : null
    );
    const [paymentType, setPaymentType] = useState<"full" | "milestone">("full");
    const [hsnCode, setHsnCode] = useState<string>("");
    const [selectedCoreEngines, setSelectedCoreEngines] = useState<string[]>([]);
    const [milestones, setMilestones] = useState<
        Array<{ percentage: number; dueDate: string; features: string }>
    >([
        { percentage: 40, dueDate: "", features: "Dashboard, Setup" },
        { percentage: 30, dueDate: "", features: "Workflow, Reports" },
        { percentage: 30, dueDate: "", features: "Automation, Integration" },
    ]);

    const fullAmount = selectedPayment?.fullAmount || selectedPayment?.totalAmount || 0;
    const totalPercentage = milestones.reduce((sum, m) => sum + m.percentage, 0);
    const mainEngineName = selectedPayment?.items?.[0]?.engineName || "";
    const isCore = isCoreEngine(mainEngineName);

    // Reset fields when a new payment is selected
    React.useEffect(() => {
        if (selectedPayment) {
            setHsnCode(selectedPayment.hsnCode || "");
            setPaymentType(isCore ? "full" : (selectedPayment.paymentType || "full"));
            if (selectedPayment.installments && selectedPayment.installments.length > 0) {
                setMilestones(selectedPayment.installments.map(inst => ({
                    percentage: inst.percentage,
                    dueDate: "", 
                    features: inst.splitDetails?.[0]?.description || ""
                })));
            } else {
                setMilestones([
                    { percentage: 40, dueDate: "", features: "Dashboard, Setup" },
                    { percentage: 30, dueDate: "", features: "Workflow, Reports" },
                    { percentage: 30, dueDate: "", features: "Automation, Integration" },
                ]);
            }
            // Extract already allocated core engines
            const existingCoreEngines = selectedPayment.items?.slice(1)
                .filter(i => isCoreEngine(i.engineName))
                .map(i => i.engineName) || [];
            setSelectedCoreEngines(existingCoreEngines);
        }
    }, [selectedPayment, isCore]);

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Payment Configuration</h1>
                    <p className="mt-2 text-gray-600">
                        {company?.company_name || "Client"} - Configure payment terms and milestones
                    </p>
                </div>

                {/* Alerts */}
                {loaderError && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {loaderError}
                    </div>
                )}
                {actionData?.success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center">
                        <CheckIcon className="h-5 w-5 mr-2" />
                        {actionData.message}
                    </div>
                )}
                {actionData?.error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-center">
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        {actionData.error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Invoices to Configure</h2>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                {payments.length > 0 ? (
                                    payments.map((payment) => (
                                        <button
                                            key={payment.invoiceId}
                                            onClick={() => setSelectedPayment(payment)}
                                            className={`w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors ${
                                                selectedPayment?.invoiceId === payment.invoiceId
                                                    ? "bg-blue-50 border-l-4 border-blue-600"
                                                    : ""
                                            }`}
                                        >
                                            <p className="font-medium text-gray-900">
                                                {payment.items?.[0]?.engineName || "Unknown"}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                ₹{(payment.fullAmount || payment.totalAmount || 0).toLocaleString("en-IN")}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {payment.invoiceNumber}
                                            </p>
                                        </button>
                                    ))
                                ) : (
                                    <div className="p-4 text-gray-500 text-sm">No invoices to configure</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Configuration Form */}
                    <div className="lg:col-span-2">
                        {selectedPayment ? (
                            <Form method="post" className="bg-white rounded-lg shadow p-6">
                                <input type="hidden" name="intent" value="configure-payment" />
                                <input type="hidden" name="invoiceId" value={selectedPayment.invoiceId} />
                                <input type="hidden" name="fullAmount" value={fullAmount} />

                                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                    Payment Terms: {selectedPayment.items?.[0]?.engineName}
                                </h2>

                                {/* Invoice Summary */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">Invoice Number</p>
                                            <p className="font-semibold text-gray-900">
                                                {selectedPayment.invoiceNumber}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Total Amount</p>
                                            <p className="font-semibold text-gray-900">
                                                ₹{fullAmount.toLocaleString("en-IN")}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* HSN Code Input */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        HSN Code *
                                    </label>
                                    <input
                                        type="text"
                                        name="hsnCode"
                                        value={hsnCode}
                                        onChange={(e) => setHsnCode(e.target.value)}
                                        required
                                        placeholder="e.g., 998311"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">This HSN code will be applied to the entire request.</p>
                                </div>

                                {/* Payment Type Selection (Hidden for Core) */}
                                {!isCore && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-3">
                                            Payment Type
                                        </label>
                                        <div className="space-y-3">
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="paymentType"
                                                    value="full"
                                                    checked={paymentType === "full"}
                                                    onChange={() => setPaymentType("full")}
                                                    className="rounded-full border-gray-300"
                                                />
                                                <span className="ml-3 text-sm font-medium text-gray-700">
                                                    Full Payment (100% Upfront)
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="radio"
                                                    name="paymentType"
                                                    value="milestone"
                                                    checked={paymentType === "milestone"}
                                                    onChange={() => setPaymentType("milestone")}
                                                    className="rounded-full border-gray-300"
                                                />
                                                <span className="ml-3 text-sm font-medium text-gray-700">
                                                    Milestone-Based Payment
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                )}
                                {isCore && (
                                    <input type="hidden" name="paymentType" value="full" />
                                )}

                                {/* Allocate Core Engines (Advanced Only) */}
                                {!isCore && (
                                    <div className="mb-6 p-4 border border-indigo-100 bg-indigo-50/50 rounded-lg">
                                        <h3 className="text-sm font-semibold text-indigo-900 mb-3">Allocate Core Engines (Included at no extra cost)</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {CORE_ENGINE_NAMES.map(engine => (
                                                <label key={engine} className="flex items-center gap-2">
                                                    <input 
                                                        type="checkbox"
                                                        name="coreEngines"
                                                        value={engine}
                                                        checked={selectedCoreEngines.includes(engine)}
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                setSelectedCoreEngines(prev => [...prev, engine]);
                                                            } else {
                                                                setSelectedCoreEngines(prev => prev.filter(E => E !== engine));
                                                            }
                                                        }}
                                                        className="rounded text-indigo-600 focus:ring-indigo-500"
                                                    />
                                                    <span className="text-sm text-gray-700">{engine}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Milestone Configuration */}
                                {paymentType === "milestone" && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <label className="block text-sm font-medium text-gray-700">
                                                Payment Milestones
                                            </label>
                                            <span className={`text-sm font-medium ${
                                                totalPercentage === 100 ? "text-green-600" : "text-red-600"
                                            }`}>
                                                Total: {totalPercentage}%
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {milestones.map((milestone, idx) => (
                                                <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Percentage */}
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Payment %
                                                            </label>
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    name={`milestone_${idx}_percentage`}
                                                                    value={milestone.percentage}
                                                                    onChange={(e) => {
                                                                        const newMilestones = [...milestones];
                                                                        newMilestones[idx].percentage = parseInt(e.target.value) || 0;
                                                                        setMilestones(newMilestones);
                                                                    }}
                                                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                                                />
                                                                <span className="text-sm font-medium text-gray-600">
                                                                    ₹{Math.round((fullAmount * milestone.percentage) / 100).toLocaleString("en-IN")}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Due Date */}
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                                Due Date
                                                            </label>
                                                            <input
                                                                type="date"
                                                                name={`milestone_${idx}_dueDate`}
                                                                value={milestone.dueDate}
                                                                onChange={(e) => {
                                                                    const newMilestones = [...milestones];
                                                                    newMilestones[idx].dueDate = e.target.value;
                                                                    setMilestones(newMilestones);
                                                                }}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                                            />
                                                        </div>
                                                    </div>

                                                    {/* Features Unlocked */}
                                                    <div className="mt-3">
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Features Unlocked at this Milestone
                                                        </label>
                                                        <input
                                                            type="text"
                                                            name={`milestone_${idx}_features`}
                                                            value={milestone.features}
                                                            onChange={(e) => {
                                                                const newMilestones = [...milestones];
                                                                newMilestones[idx].features = e.target.value;
                                                                setMilestones(newMilestones);
                                                            }}
                                                            placeholder="e.g., Dashboard, Setup, Reports"
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add Milestone Button */}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setMilestones([...milestones, { percentage: 0, dueDate: "", features: "" }]);
                                            }}
                                            className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 mt-3"
                                        >
                                            <PlusIcon className="h-4 w-4" />
                                            Add Milestone
                                        </button>
                                    </div>
                                )}

                                {/* Summary */}
                                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <p className="text-sm text-blue-700">
                                        <strong>Summary:</strong> {paymentType === "full"
                                            ? "Client pays 100% upfront"
                                            : `Client pays in ${milestones.length} milestones`}
                                    </p>
                                </div>

                                {/* Submit */}
                                <div className="flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={navigation.state === "submitting" || (paymentType === "milestone" && totalPercentage !== 100)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {navigation.state === "submitting" ? "Saving..." : "Save Payment Configuration"}
                                    </button>
                                </div>
                            </Form>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                                <p>No invoices to configure</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
