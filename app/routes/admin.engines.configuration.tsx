import { json, type LoaderFunctionArgs, type ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Form, useActionData, useNavigation } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { useState } from "react";
import {
    getAllEngineSubscriptionConfigs,
    saveEngineSubscriptionConfig,
    EngineSubscriptionConfig,
    getDefaultFeatureUnlockMapping,
} from "~/models/payment.model.server";
import {
    CORE_ENGINE_NAMES_CLIENT as CORE_ENGINE_NAMES,
    ADVANCED_ENGINE_NAMES_CLIENT as ADVANCED_ENGINE_NAMES,
    canonicalEngineNameClient as canonicalEngineName,
    getEngineClassificationClient as getEngineClassification,
} from "~/utils/engine-classification";
import {
    CheckIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    PencilIcon,
} from "@heroicons/react/24/outline";

interface ActionData {
    success?: boolean;
    message?: string;
    error?: string;
    config?: EngineSubscriptionConfig;
}

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    await requireAdminSession(request);
    const { orgId } = params;

    try {
        const configs = await getAllEngineSubscriptionConfigs(orgId || "");
        
        // Get list of all available engines
        const allEngines = [
            ...CORE_ENGINE_NAMES,
            ...ADVANCED_ENGINE_NAMES,
        ].map((name) => ({
            name,
            type: getEngineClassification(name) as "core" | "advanced",
            hasConfig: configs.some((c) => c.engineName === name),
        }));

        return json({
            configs,
            allEngines,
            orgId,
        });
    } catch (error) {
        console.error("Error loading engine configs:", error);
        return json({
            configs: [],
            allEngines: [...CORE_ENGINE_NAMES, ...ADVANCED_ENGINE_NAMES].map((name) => ({
                name,
                type: getEngineClassification(name) as "core" | "advanced",
                hasConfig: false,
            })),
            orgId,
            error: "Failed to load engine configurations",
        });
    }
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
    await requireAdminSession(request);
    const { orgId } = params;
    const formData = await request.formData();
    const intent = formData.get("intent") as string;

    try {
        if (intent === "save-config") {
            const engineName = formData.get("engineName") as string;
            const engineType = formData.get("engineType") as "core" | "advanced";
            const defaultPaymentType = formData.get("defaultPaymentType") as "full" | "milestone";
            const allowPartialPayment = formData.get("allowPartialPayment") === "true";
            const dependencyMapping = (formData.get("dependencyMapping") as string || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);
            const manuallyEnabled = formData.get("manuallyEnabled") === "true";
            const manuallyDisabled = formData.get("manuallyDisabled") === "true";
            const overrideNotes = (formData.get("overrideNotes") as string) || "";

            // Parse feature unlocks
            const featureUnlocks = [];
            let idx = 0;
            while (formData.has(`featureUnlock_${idx}_percentage`)) {
                const percentage = parseInt(formData.get(`featureUnlock_${idx}_percentage`) as string);
                const featuresStr = formData.get(`featureUnlock_${idx}_features`) as string;
                const features = featuresStr
                    .split(",")
                    .map((f) => f.trim())
                    .filter(Boolean);
                if (percentage >= 0 && percentage <= 100 && features.length > 0) {
                    featureUnlocks.push({ percentage, features });
                }
                idx++;
            }

            // Validation
            if (!engineName || !engineType) {
                return json<ActionData>(
                    { error: "Engine name and type are required" },
                    { status: 400 }
                );
            }

            // Core engines cannot have partial payments
            if (engineType === "core" && allowPartialPayment) {
                return json<ActionData>(
                    { error: "Core engines cannot allow partial payments" },
                    { status: 400 }
                );
            }

            const config: EngineSubscriptionConfig = {
                engineName: canonicalEngineName(engineName),
                engineType,
                dependencyMapping: dependencyMapping.length > 0 ? dependencyMapping : undefined,
                defaultPaymentType,
                allowPartialPayment: engineType === "advanced" ? allowPartialPayment : false,
                featureUnlocks: featureUnlocks.length > 0 ? featureUnlocks : getDefaultFeatureUnlockMapping(),
                manualEnabled: manuallyEnabled,
                manualDisabled: manuallyDisabled,
                overrideNotes,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            await saveEngineSubscriptionConfig(orgId || "", config);

            return json<ActionData>({
                success: true,
                message: `Configuration saved for "${config.engineName}"`,
                config,
            });
        }

        return json<ActionData>({ error: "Invalid action" }, { status: 400 });
    } catch (error) {
        console.error("Error in engine config action:", error);
        return json<ActionData>(
            { error: "Failed to save configuration" },
            { status: 500 }
        );
    }
};

export default function AdminEngineConfiguration() {
    const { configs, allEngines, orgId, error: loaderError } = useLoaderData<typeof loader>();
    const actionData = useActionData<ActionData>();
    const navigation = useNavigation();

    const [selectedEngine, setSelectedEngine] = useState<string>("");
    const [isEditMode, setIsEditMode] = useState(false);
    const [featureUnlocks, setFeatureUnlocks] = useState<Array<{ percentage: number; features: string }>>([
        { percentage: 40, features: "Dashboard, Setup" },
        { percentage: 30, features: "Workflow, Reports" },
        { percentage: 30, features: "Automation, Integration" },
    ]);

    const currentConfig = selectedEngine
        ? configs.find((c) => c.engineName === selectedEngine)
        : null;

    const currentEngineType = selectedEngine
        ? allEngines.find((e) => e.name === selectedEngine)?.type || "core"
        : "core";

    return (
        <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Engine Configuration Management</h1>
                    <p className="mt-2 text-gray-600">
                        Configure payment types, dependencies, and feature unlocks for each engine
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
                    {/* Engine List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 border-b border-gray-200">
                                <h2 className="text-lg font-semibold text-gray-900">Engines</h2>
                            </div>
                            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                                {allEngines.map((engine) => (
                                    <button
                                        key={engine.name}
                                        onClick={() => setSelectedEngine(engine.name)}
                                        className={`w-full text-left px-6 py-3 hover:bg-gray-50 transition-colors ${
                                            selectedEngine === engine.name ? "bg-blue-50 border-l-4 border-blue-600" : ""
                                        }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-gray-900">{engine.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {engine.type === "core" ? "🔴 Core" : "🟢 Advanced"}
                                                </p>
                                            </div>
                                            {engine.hasConfig && (
                                                <CheckIcon className="h-5 w-5 text-green-600" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Configuration Form */}
                    <div className="lg:col-span-2">
                        {selectedEngine ? (
                            <Form method="post" className="bg-white rounded-lg shadow p-6">
                                <input type="hidden" name="intent" value="save-config" />
                                <input type="hidden" name="engineName" value={selectedEngine} />

                                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                                    Configure: {selectedEngine}
                                </h2>

                                {/* Basic Info */}
                                <div className="space-y-6">
                                    {/* Engine Type (read-only) */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">
                                            Engine Type
                                        </label>
                                        <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-300">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                                                currentEngineType === "core"
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-green-100 text-green-800"
                                            }`}>
                                                {currentEngineType === "core" ? "🔴 Core Engine" : "🟢 Advanced Engine"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rules Info */}
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                        {currentEngineType === "core" ? (
                                            <div className="text-sm text-blue-700">
                                                <p className="font-semibold mb-2">Core Engine Rules:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>100% upfront payment MANDATORY</li>
                                                    <li>No partial payments allowed</li>
                                                    <li>Access ONLY after payment verification</li>
                                                    <li>Installments NOT supported</li>
                                                </ul>
                                            </div>
                                        ) : (
                                            <div className="text-sm text-green-700">
                                                <p className="font-semibold mb-2">Advanced Engine Features:</p>
                                                <ul className="list-disc list-inside space-y-1">
                                                    <li>Milestone-based payments allowed</li>
                                                    <li>Progressive feature unlocking</li>
                                                    <li>Customizable payment splits</li>
                                                    <li>Installment system integration</li>
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    {/* Default Payment Type */}
                                    <div>
                                        <label htmlFor="defaultPaymentType" className="block text-sm font-medium text-gray-700">
                                            Default Payment Type
                                        </label>
                                        <select
                                            id="defaultPaymentType"
                                            name="defaultPaymentType"
                                            defaultValue={currentConfig?.defaultPaymentType || (currentEngineType === "core" ? "full" : "milestone")}
                                            disabled={currentEngineType === "core"}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="full">Full Payment (100%)</option>
                                            {currentEngineType === "advanced" && (
                                                <option value="milestone">Milestone-Based</option>
                                            )}
                                        </select>
                                    </div>

                                    {/* Partial Payment Toggle */}
                                    {currentEngineType === "advanced" && (
                                        <div>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="allowPartialPayment"
                                                    value="true"
                                                    defaultChecked={currentConfig?.allowPartialPayment ?? true}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="ml-2 text-sm font-medium text-gray-700">
                                                    Allow Partial Payments
                                                </span>
                                            </label>
                                        </div>
                                    )}

                                    {/* Dependency Mapping */}
                                    <div>
                                        <label htmlFor="dependencyMapping" className="block text-sm font-medium text-gray-700">
                                            Dependency Mapping (Core Engines this depends on)
                                        </label>
                                        <input
                                            type="text"
                                            id="dependencyMapping"
                                            name="dependencyMapping"
                                            placeholder="e.g., HR Digital Roadmap, HR HCM Vendor Fit"
                                            defaultValue={currentConfig?.dependencyMapping?.join(", ") || ""}
                                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <p className="mt-1 text-sm text-gray-500">
                                            {currentEngineType === "advanced"
                                                ? "Comma-separated list of core engines required for this engine"
                                                : "Not applicable for core engines"}
                                        </p>
                                    </div>

                                    {/* Feature Unlock Mapping */}
                                    {currentEngineType === "advanced" && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                                Feature Unlock Mapping (Milestone %)
                                            </label>
                                            <div className="space-y-3">
                                                {featureUnlocks.map((unlock, idx) => (
                                                    <div key={idx} className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="100"
                                                            name={`featureUnlock_${idx}_percentage`}
                                                            defaultValue={unlock.percentage}
                                                            placeholder="Percentage"
                                                            className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                                                        />
                                                        <input
                                                            type="text"
                                                            name={`featureUnlock_${idx}_features`}
                                                            defaultValue={unlock.features}
                                                            placeholder="Features (comma-separated)"
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="mt-2 text-sm text-gray-500">
                                                Example: 40% unlocks Dashboard + Setup, 70% unlocks Workflow + Reports, etc.
                                            </p>
                                        </div>
                                    )}

                                    {/* Admin Override */}
                                    <div className="pt-4 border-t border-gray-200">
                                        <p className="text-sm font-semibold text-gray-900 mb-3">Admin Override (Advanced)</p>
                                        <div className="space-y-3">
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="manuallyEnabled"
                                                    value="true"
                                                    defaultChecked={currentConfig?.manualEnabled ?? false}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    Manually Enable (override payment requirements)
                                                </span>
                                            </label>
                                            <label className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    name="manuallyDisabled"
                                                    value="true"
                                                    defaultChecked={currentConfig?.manualDisabled ?? false}
                                                    className="rounded border-gray-300"
                                                />
                                                <span className="ml-2 text-sm text-gray-700">
                                                    Manually Disable (block access)
                                                </span>
                                            </label>
                                            <input
                                                type="text"
                                                name="overrideNotes"
                                                placeholder="Reason for override..."
                                                defaultValue={currentConfig?.overrideNotes || ""}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Submit */}
                                <div className="mt-6 flex gap-3">
                                    <button
                                        type="submit"
                                        disabled={navigation.state === "submitting"}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {navigation.state === "submitting" ? "Saving..." : "Save Configuration"}
                                    </button>
                                </div>
                            </Form>
                        ) : (
                            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                                <p>Select an engine to configure</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
