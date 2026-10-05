import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation, useFetcher } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { useState } from "react";
import {
    getCompanyPayments,
    getAllEngineSubscriptionConfigs,
    createEnginePaymentRequest,
    saveEngineSubscriptionConfig,
    EngineSubscriptionConfig,
} from "~/models/payment.model.server";
import {
    CORE_ENGINE_NAMES_CLIENT as CORE_ENGINE_NAMES,
    ADVANCED_ENGINE_NAMES_CLIENT as ADVANCED_ENGINE_NAMES,
    canonicalEngineNameClient as canonicalEngineName,
    getEngineClassificationClient as getEngineClassification,
} from "~/utils/engine-classification";
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
        const [company, payments, configs] = await Promise.all([
            getCompanyProfile(orgId || ""),
            getCompanyPayments(orgId || ""),
            getAllEngineSubscriptionConfigs(orgId || ""),
        ]);

        const assignedEngines = payments
            .filter((p) => p.status === "payment_verified")
            .map((p) => p.items?.[0]?.engineName || "")
            .filter(Boolean);

        const availableEngines = [
            ...CORE_ENGINE_NAMES,
            ...ADVANCED_ENGINE_NAMES,
        ].map((name) => ({
            name,
            type: getEngineClassification(name) as "core" | "advanced",
            isAssigned: assignedEngines.includes(name),
            config: configs.find((c) => c.engineName === name),
        }));

        return json({
            company,
            payments,
            configs,
            availableEngines,
            assignedEngines,
            orgId,
        });
    } catch (error) {
        console.error("Error loading client data:", error);
        return json({
            company: null,
            payments: [],
            configs: [],
            availableEngines: [],
            assignedEngines: [],
            orgId,
            error: "Failed to load client data",
        });
    }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    await requireAdminSession(request);
    const { orgId } = params;
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    try {
        if (intent === "assign-engines") {
            const selectedEngines = formData.getAll("selectedEngines") as string[];
            const totalCost = parseInt(formData.get("totalCost") as string);
            const paymentType = formData.get("paymentType") as "full" | "milestone";

            if (!selectedEngines.length || !totalCost) {
                return json<ActionData>(
                    { error: "Please select at least one engine and set total cost" },
                    { status: 400 }
                );
            }

            // Validate that if only advanced engines selected, admin can add core engines
            const selectedCoreCount = selectedEngines.filter((e) =>
                (CORE_ENGINE_NAMES as readonly string[]).includes(e)
            ).length;
            const selectedAdvancedCount = selectedEngines.filter((e) =>
                (ADVANCED_ENGINE_NAMES as readonly string[]).includes(e)
            ).length;

            // Create payment request
            const company = await getCompanyProfile(orgId || "");
            const employeeCount = company?.employee_count || 500;

            // For now, create individual requests for each engine
            for (const engine of selectedEngines) {
                await createEnginePaymentRequest({
                    orgId: orgId || "",
                    userId: "admin",
                    engineName: engine,
                    employeeCount,
                    fullAmount: totalCost / selectedEngines.length,
                    requestedPercent: 100,
                    requestNotes: "Admin subscription assignment",
                });
            }

            return json<ActionData>({
                success: true,
                message: `Assigned ${selectedEngines.length} engine(s) to this client`,
            });
        }

        if (intent === "configure-override") {
            const engineName = formData.get("engineName") as string;
            const overrideAction = formData.get("overrideAction") as "enable" | "disable";
            const overrideNotes = formData.get("overrideNotes") as string;

            if (!engineName) {
                return json<ActionData>(
                    { error: "Engine name is required" },
                    { status: 400 }
                );
            }

            const engineType = getEngineClassification(engineName) || "core";
            await saveEngineSubscriptionConfig(orgId || "", {
                engineName,
                engineType,
                defaultPaymentType: engineType === "core" ? "full" : "milestone",
                allowPartialPayment: engineType === "advanced",
                manualEnabled: overrideAction === "enable" ? true : false,
                manualDisabled: overrideAction === "disable" ? true : false,
                overrideNotes: overrideNotes || `Admin ${overrideAction}d this engine`,
            });

            return json<ActionData>({
                success: true,
                message: `${overrideAction === "enable" ? "Enabled" : "Disabled"} "${engineName}" override`,
            });
        }

        return json<ActionData>({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error in subscription action:", error);
        return json<ActionData>(
            { error: "Failed to process action" },
            { status: 500 }
        );
    }
};

export default function AdminClientSubscriptions() {
    const { company, payments, availableEngines, orgId, error: loaderError } = useLoaderData<typeof loader>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();
    const overrideFetcher = useFetcher<ActionData>();

    const [selectedEngines, setSelectedEngines] = useState<Set<string>>(new Set());
    const [totalCost, setTotalCost] = useState(0);
    const [paymentType, setPaymentType] = useState<"full" | "milestone">("full");
    const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

    const handleEngineToggle = (engineName: string) => {
        const newSelected = new Set(selectedEngines);
        if (newSelected.has(engineName)) {
            newSelected.delete(engineName);
        } else {
            newSelected.add(engineName);
        }
        setSelectedEngines(newSelected);
    };

    const selectedCoreEngines = Array.from(selectedEngines).filter((e) =>
        (CORE_ENGINE_NAMES as readonly string[]).includes(e)
    );
    const selectedAdvancedEngines = Array.from(selectedEngines).filter((e) =>
        (ADVANCED_ENGINE_NAMES as readonly string[]).includes(e)
    );

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Client Subscription Management
                    </h1>
                    <p className="mt-2 text-gray-600">
                        {company?.company_name || "Client"}
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
                    {/* Current Subscriptions */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Current Subscriptions</h2>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {availableEngines.filter((e) => e.isAssigned).length > 0 ? (
                                    availableEngines
                                        .filter((e) => e.isAssigned)
                                        .map((engine) => (
                                            <div key={engine.name} className="p-4">
                                                <p className="font-medium text-gray-900">{engine.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {engine.type === "core" ? "🔴 Core" : "🟢 Advanced"}
                                                </p>
                                                <p className="text-xs text-green-600 mt-1">✓ Active</p>
                                            </div>
                                        ))
                                ) : (
                                    <div className="p-4 text-gray-500 text-sm">No subscriptions yet</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Engine Selection */}
                    <div className="lg:col-span-2">
                        <Form method="post" className="bg-white rounded-lg shadow p-6">
                            <input type="hidden" name="intent" value="assign-engines" />
                            <input type="hidden" name="totalCost" value={totalCost} />
                            <input type="hidden" name="paymentType" value={paymentType} />

                            <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                Assign Engines to Client
                            </h2>

                            {/* Rules */}
                            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                                <p className="font-semibold mb-2">Assignment Rules:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>
                                        <strong>Core Engines:</strong> 100% payment required, automatically assigned
                                    </li>
                                    <li>
                                        <strong>Advanced Engines:</strong> Can be assigned with milestone payments
                                    </li>
                                    <li>
                                        <strong>Flexibility:</strong> Admin can manually add core engines even if only advanced selected
                                    </li>
                                </ul>
                            </div>

                            {/* Core Engines */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">🔴 Core Engines (100% Payment)</h3>
                                <div className="space-y-3">
                                    {availableEngines
                                        .filter((e) => e.type === "core")
                                        .map((engine) => (
                                            <label key={engine.name} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="selectedEngines"
                                                    value={engine.name}
                                                    checked={selectedEngines.has(engine.name)}
                                                    onChange={() => handleEngineToggle(engine.name)}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="ml-3 text-sm text-gray-700">{engine.name}</span>
                                                {engine.isAssigned && (
                                                    <span className="ml-auto text-xs text-green-600">✓ Assigned</span>
                                                )}
                                            </label>
                                        ))}
                                </div>
                            </div>

                            {/* Advanced Engines */}
                            <div className="mb-8">
                                <h3 className="text-sm font-semibold text-gray-900 mb-3">🟢 Advanced Engines (Milestone Payments)</h3>
                                <div className="space-y-3">
                                    {availableEngines
                                        .filter((e) => e.type === "advanced")
                                        .map((engine) => (
                                            <label key={engine.name} className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="selectedEngines"
                                                    value={engine.name}
                                                    checked={selectedEngines.has(engine.name)}
                                                    onChange={() => handleEngineToggle(engine.name)}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="ml-3 text-sm text-gray-700">{engine.name}</span>
                                                {engine.isAssigned && (
                                                    <span className="ml-auto text-xs text-green-600">✓ Assigned</span>
                                                )}
                                            </label>
                                        ))}
                                </div>
                            </div>

                            {/* Payment Configuration */}
                            {selectedEngines.size > 0 && (
                                <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-900 mb-4">Payment Configuration</h3>

                                    {/* Payment Type */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Payment Type
                                        </label>
                                        <select
                                            value={paymentType}
                                            onChange={(e) => setPaymentType(e.target.value as "full" | "milestone")}
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="full">Full Payment (100%)</option>
                                            {selectedAdvancedEngines.length > 0 && (
                                                <option value="milestone">Milestone-Based</option>
                                            )}
                                        </select>
                                    </div>

                                    {/* Total Cost */}
                                    <div className="mb-4">
                                        <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-2">
                                            Total Cost (₹)
                                        </label>
                                        <input
                                            type="number"
                                            id="cost"
                                            min="0"
                                            step="10000"
                                            value={totalCost}
                                            onChange={(e) => setTotalCost(parseInt(e.target.value) || 0)}
                                            placeholder="Enter total cost"
                                            className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>

                                    {/* Summary */}
                                    <div className="p-3 bg-white rounded border border-gray-200">
                                        <p className="text-sm text-gray-700">
                                            <strong>Selected:</strong> {selectedEngines.size} engine(s)
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Total Cost:</strong> ₹{totalCost.toLocaleString("en-IN")}
                                        </p>
                                        <p className="text-sm text-gray-700">
                                            <strong>Cost per engine:</strong> ₹{Math.round(totalCost / selectedEngines.size).toLocaleString("en-IN")}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Submit */}
                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={navigation.state === "submitting" || selectedEngines.size === 0 || totalCost === 0}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    <PlusIcon className="h-4 w-4" />
                                    {navigation.state === "submitting" ? "Assigning..." : "Assign Engines"}
                                </button>
                            </div>
                        </Form>
                    </div>
                </div>

                {/* Override Configuration Section */}
                <div className="mt-8 bg-white rounded-lg shadow p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Advanced Overrides</h2>
                    <p className="text-sm text-gray-600 mb-4">
                        Configure special cases for this client (e.g., enable engine without payment, disable temporarily)
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableEngines.map((engine) => (
                            <div key={engine.name} className="p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <p className="font-medium text-gray-900">{engine.name}</p>
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                        engine.type === "core" ? "bg-orange-100 text-orange-700" : "bg-emerald-100 text-emerald-700"
                                    }`}>
                                        {engine.type === "core" ? "Core" : "Advanced"}
                                    </span>
                                </div>
                                {engine.config?.manualEnabled && (
                                    <p className="text-xs text-green-600 mt-1">✅ Force Enabled</p>
                                )}
                                {engine.config?.manualDisabled && (
                                    <p className="text-xs text-red-600 mt-1">❌ Force Disabled</p>
                                )}
                                <div className="mt-3 flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            overrideFetcher.submit(
                                                { intent: "configure-override", engineName: engine.name, overrideAction: "enable", overrideNotes: "" },
                                                { method: "post" }
                                            );
                                        }}
                                        disabled={overrideFetcher.state === "submitting"}
                                        className="flex-1 px-3 py-2 text-sm border border-green-300 text-green-700 rounded hover:bg-green-50 disabled:opacity-50"
                                    >
                                        Force Enable
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            overrideFetcher.submit(
                                                { intent: "configure-override", engineName: engine.name, overrideAction: "disable", overrideNotes: "" },
                                                { method: "post" }
                                            );
                                        }}
                                        disabled={overrideFetcher.state === "submitting"}
                                        className="flex-1 px-3 py-2 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 disabled:opacity-50"
                                    >
                                        Force Disable
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
