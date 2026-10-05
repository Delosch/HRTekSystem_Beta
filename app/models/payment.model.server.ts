import { PutCommand, QueryCommand, GetCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;

const USERS_TABLE = process.env.DYNAMODB_PAYMENTS_TABLE || process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

try {
    ddbDocClient = getDynamoDBDocumentClient();
} catch (error: unknown) {
    console.error("CRITICAL ERROR: Failed to initialize DynamoDB Document Client.");
    if (error instanceof Error) {
        console.error(`Details: ${error.message}`);
    }
    process.exit(1);
}

// Payment Status Types
export type PaymentStatus =
    | "pending_payment"      // Invoice generated, awaiting payment
    | "payment_submitted"    // User uploaded proof, awaiting verification
    | "payment_approved"     // Admin approved payment, awaiting customer acceptance
    | "payment_verified"     // Customer accepted invoice and payment is finalized
    | "payment_rejected"     // Payment proof rejected or invoice declined
    | "completed"            // All done
    | "request_pending_approval"
    | "request_approved"
    | "request_rejected"
    | "cleared";

export type PaymentMethod = "bank_transfer" | "upi" | "qr_code";
export type InvoiceKind = "PROFORMA" | "FINAL";

// Installment types
export interface SplitDetailRow {
    item: string;
    description: string;
    amount: string;
    hsnCode?: string;
}

export interface InstallmentDetail {
    installmentNumber: number;
    percentage: number;
    splitDetails: SplitDetailRow[];
    amount?: number;       // Calculated: (fullAmount * percentage / 100)
    status: "unpaid" | "payment_submitted" | "paid" | "rejected";
    invoiceId?: string;    // Links to the payment record for this installment
    paidAt?: string;
    enabled?: boolean;     // Manually enabled by admin for payment
}

export type EnginePaymentType = "full" | "milestone";
export type EngineClassification = "core" | "advanced";

export interface FeatureUnlockMapping {
    percentage: number;
    features: string[];
    dueDate?: string;
}

export interface EngineSubscriptionConfig {
    engineName: string;
    engineType: EngineClassification;
    dependencyMapping?: string[];
    defaultPaymentType: EnginePaymentType;
    allowPartialPayment: boolean;
    featureUnlocks?: FeatureUnlockMapping[];
    manualEnabled?: boolean;
    manualDisabled?: boolean;
    overrideNotes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface EngineSubscriptionRecord extends EngineSubscriptionConfig {
    pk: string;
    sk: string;
}

export const CORE_ENGINE_NAMES = [
    "HR Digital Roadmap",
    "HR HCM Vendor Fit",
    "HR Tek Diagnostics",
    "HR Shared Service"
] as const;

export const ADVANCED_ENGINE_NAMES = [
    "HR Shared Service Engine",
    "ICMS",
    "HII"
] as const;

/**
 * CORRECTED Engine Name Mapping
 * Canonical names for engines
 * 
 * CORE ENGINES (100% upfront payment, no partial payments allowed):
 * - HR Digital Roadmap
 * - HR HCM Vendor Fit
 * - HR Tek Diagnostics
 * - HR Shared Service
 * 
 * ADVANCED ENGINES (milestone payments allowed):
 * - HR Shared Service Engine (was incorrectly called "Decision Engine")
 * - ICMS
 * - HII (was incorrectly called "Transformative Engine")
 */
const ENGINE_NAME_CANONICAL_MAP: Record<string, string> = {
    // Core engines
    "hr transformation roadmap generator": "HR Digital Roadmap",
    "hr digital roadmap": "HR Digital Roadmap",
    "hcm vendor fit engine": "HR HCM Vendor Fit",
    "hr hcm vendor fit": "HR HCM Vendor Fit",
    "cognitive hcm vendor fit engine": "HR HCM Vendor Fit",
    "shared service designer": "HR Shared Service",
    "shared services": "HR Shared Service",
    "shared services operating model planner": "HR Shared Service",
    "hr shared services": "HR Shared Service",
    "hr shared service": "HR Shared Service",
    "hr tech diagnostics": "HR Tek Diagnostics",
    "hr technology maturity analysis": "HR Tek Diagnostics",
    "ai-driven hr tech diagnostics": "HR Tek Diagnostics",
    
    // Advanced engines
    "hr shared service engine": "HR Shared Service Engine",
    "decision engine": "HR Shared Service Engine",
    "intelligent change management": "ICMS",
    "intelligent change management system": "ICMS",
    "change management intelligence engine": "ICMS",
    "hr change management": "ICMS",
    "icms": "ICMS",
    "hti - hr transformation intelligence": "HII",
    "hr tech advisory": "HII",
    "hti": "HII",
    "transformative engine": "HII",
    "hr transformation intelligence": "HII",
    "hii": "HII",
};

export function canonicalEngineName(name: string): string {
    const normalized = normalizeEngineName(name);
    return ENGINE_NAME_CANONICAL_MAP[normalized] || name.trim();
}

export function getEngineClassification(engineName: string): EngineClassification | undefined {
    const canonical = canonicalEngineName(engineName);
    if ((CORE_ENGINE_NAMES as readonly string[]).includes(canonical)) return "core";
    if ((ADVANCED_ENGINE_NAMES as readonly string[]).includes(canonical)) return "advanced";
    return undefined;
}

export function getDefaultFeatureUnlockMapping(): FeatureUnlockMapping[] {
    return [
        { percentage: 40, features: ["Dashboard", "Setup"] },
        { percentage: 30, features: ["Workflow", "Reports"] },
        { percentage: 30, features: ["Automation", "Integration"] },
    ];
}

export function buildFeatureUnlockMapping(config?: EngineSubscriptionConfig): FeatureUnlockMapping[] {
    return config?.featureUnlocks && config.featureUnlocks.length > 0
        ? config.featureUnlocks
        : getDefaultFeatureUnlockMapping();
}

export function getUnlockedFeatures(config: EngineSubscriptionConfig | undefined, totalPaidAmount: number, fullAmount: number) {
    const unlockMapping = buildFeatureUnlockMapping(config);
    const progressPercent = fullAmount > 0 ? Math.min(100, Math.round((totalPaidAmount / fullAmount) * 100)) : 0;
    const unlockedFeatures = unlockMapping
        .filter((unlock) => progressPercent >= unlock.percentage)
        .flatMap((unlock) => unlock.features)
        .map((feature) => feature.trim())
        .filter(Boolean);

    return {
        progressPercent,
        unlockedFeatures: Array.from(new Set(unlockedFeatures)),
        nextMilestone: unlockMapping.find((unlock) => progressPercent < unlock.percentage) || null,
    };
}

export function stripInstallmentSuffix(engineName: string): string {
    const match = engineName.match(/^(.*) - Installment #\d+$/);
    return match ? match[1].trim() : engineName;
}

export function isCoreEngine(engineName: string): boolean {
    return getEngineClassification(engineName) === "core";
}

export function isAdvancedEngine(engineName: string): boolean {
    return getEngineClassification(engineName) === "advanced";
}

export interface EngineActivationSnapshot {
    engineName: string;
    activationStatus: "disabled" | "partially_enabled" | "enabled";
    enabledFeatures: string[];
    paymentProgress: number;
    totalPaidAmount: number;
    fullAmount: number;
    updatedAt: string;
}

export interface PaymentActivationInfo {
    engineActivations: EngineActivationSnapshot[];
}

export interface PaymentRecord {
    pk: string;              // COMPANY#{orgId}
    sk: string;              // PAYMENT#{invoiceId}
    invoiceId: string;
    orderId: string;
    companyId: string;
    totalAmount: number;
    gstAmount: number;
    subtotal: number;
    status: PaymentStatus;
    paymentMethod?: PaymentMethod;

    // Invoice details
    invoiceKind?: InvoiceKind;
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    proformaInvoiceNumber?: string;
    finalInvoiceNumber?: string;
    finalInvoiceDate?: string;
    items: Array<{
        engineName: string;
        price: number;
        description: string;
        durationMonths?: number;
    }>;

    // Billing contact details
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

    // Tax breakdown
    cgst?: number;  // Central GST (9%)
    sgst?: number;  // State GST (9%)
    igst?: number;  // Integrated GST (18% for inter-state)
    taxType?: 'CGST_SGST' | 'IGST';

    // Payment proof
    paymentProofUrl?: string;
    transactionId?: string;
    paymentDate?: string;
    paymentNotes?: string;

    // Admin verification
    verifiedBy?: string;
    verifiedAt?: string;
    verificationNotes?: string;
    rejectionReason?: string;

    // Engine subscription config
    engineConfig?: EngineSubscriptionConfig;
    activationInfo?: PaymentActivationInfo;

    // Part payment tracking
    paidAmount?: number;      // Total amount paid so far
    balanceDue?: number;       // Remaining amount to be paid
    advanceAmount?: number;    // First payment percent

    // Invoice locking
    isLocked?: boolean;
    lockedBy?: string;
    lockedAt?: string;
    unlockedBy?: string;
    unlockedAt?: string;

    // Timestamps
    createdAt: string;
    updatedAt: string;

    // Request-first payment workflow metadata (user dashboard)
    workflowType?: "standard" | "request_based";
    engineName?: string;
    employeeCount?: number;
    requestedPaymentPercent?: number;
    requestedBaseAmount?: number;
    approvedRequestedBaseAmount?: number;
    approvedRequestedAmount?: number;
    fullAmount?: number;
    requestNotes?: string;

    // Installment plan (set by admin when approving)
    installments?: InstallmentDetail[];
    currentInstallment?: number; // Which installment is next to pay
    numberOfInstallments?: number;
    paymentType?: "full" | "milestone";
    hsnCode?: string;
}

export interface EngineAccessStatus {
    engineName: string;
    requestStatus: "none" | "pending" | "approved" | "rejected";
    engineType?: EngineClassification;
    paymentType?: EnginePaymentType;
    allowPartialPayment?: boolean;
    manualOverride?: {
        enabled?: boolean;
        disabled?: boolean;
        notes?: string;
    };
    activationStatus?: "disabled" | "partially_enabled" | "enabled";
    paymentProgress?: number;
    enabledFeatures?: string[];
    featureUnlocks?: FeatureUnlockMapping[];
    assessmentUnlocked: boolean;
    reportUnlocked: boolean;
    approvedRequestedAmount: number;
    approvedRequestedBaseAmount: number;
    totalPaidAmount: number;
    fullAmount: number;
    pendingAmount: number;
    remainingAmount: number;
    employeeCount: number | null;
    requestRecord: PaymentRecord | null;
    rejectionReason?: string;
    installments?: InstallmentDetail[];
    currentInstallment?: number;
    numberOfInstallments?: number;
    isIncludedFreeWithAdvanced?: boolean;
    parentAdvancedEngineName?: string;
}

export function normalizeEngineName(name: string): string {
    return (name || "").trim().toLowerCase();
}

function getItemGrossAmount(item: { price?: number }): number {
    const base = Number(item?.price || 0);
    return base + base * 0.18;
}

function mapRequestStatus(status?: PaymentStatus): EngineAccessStatus["requestStatus"] {
    if (status === "request_pending_approval") return "pending";
    if (status === "request_approved") return "approved";
    if (status === "request_rejected") return "rejected";
    return "none";
}

export async function createEnginePaymentRequest(params: {
    orgId: string;
    userId: string;
    engineName: string;
    employeeCount: number;
    fullAmount: number;
    requestedPercent?: number;
    requestNotes?: string;
}): Promise<PaymentRecord> {
    const now = new Date().toISOString();
    const proformaInvoiceNumber = `PFI-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const percent = Math.min(100, Math.max(1, Math.round(params.requestedPercent ?? 100)));
    const fullAmount = Math.max(0, Math.round(params.fullAmount));
    const requestedAmount = Math.round((fullAmount * percent) / 100);
    const requestedBaseAmount = Math.round(requestedAmount / 1.18);
    const requestedGstAmount = requestedAmount - requestedBaseAmount;

    const normalizedEngine = normalizeEngineName(params.engineName);
    const existingRequests = (await getCompanyPayments(params.orgId))
        .filter(
            (payment) =>
                payment.workflowType === "request_based" &&
                normalizeEngineName(payment.engineName || payment.items?.[0]?.engineName || "") === normalizedEngine &&
                (payment.status === "request_pending_approval" || payment.status === "request_rejected")
        )
        .sort(
            (a, b) =>
                new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime()
        );

    const existingRequest = existingRequests[0];

    if (existingRequest) {
        await ddbDocClient.send(
            new UpdateCommand({
                TableName: USERS_TABLE,
                Key: {
                    pk: existingRequest.pk,
                    sk: existingRequest.sk,
                },
                UpdateExpression: `
                    SET #status = :status,
                        #invoiceKind = :invoiceKind,
                        #invoiceNumber = :invoiceNumber,
                        #invoiceDate = :invoiceDate,
                        #proformaInvoiceNumber = :proformaInvoiceNumber,
                        #totalAmount = :totalAmount,
                        #gstAmount = :gstAmount,
                        #subtotal = :subtotal,
                        #items = :items,
                        #employeeCount = :employeeCount,
                        #requestedPaymentPercent = :requestedPaymentPercent,
                        #requestedBaseAmount = :requestedBaseAmount,
                        #approvedRequestedBaseAmount = :approvedRequestedBaseAmount,
                        #approvedRequestedAmount = :approvedRequestedAmount,
                        #fullAmount = :fullAmount,
                        #requestNotes = :requestNotes,
                        #updatedAt = :updatedAt
                `,
                ExpressionAttributeNames: {
                    "#status": "status",
                    "#totalAmount": "totalAmount",
                    "#invoiceKind": "invoiceKind",
                    "#invoiceNumber": "invoiceNumber",
                    "#invoiceDate": "invoiceDate",
                    "#proformaInvoiceNumber": "proformaInvoiceNumber",
                    "#gstAmount": "gstAmount",
                    "#subtotal": "subtotal",
                    "#items": "items",
                    "#employeeCount": "employeeCount",
                    "#requestedPaymentPercent": "requestedPaymentPercent",
                    "#requestedBaseAmount": "requestedBaseAmount",
                    "#approvedRequestedBaseAmount": "approvedRequestedBaseAmount",
                    "#approvedRequestedAmount": "approvedRequestedAmount",
                    "#fullAmount": "fullAmount",
                    "#requestNotes": "requestNotes",
                    "#updatedAt": "updatedAt",
                },
                ExpressionAttributeValues: {
                    ":status": "request_pending_approval",
                    ":invoiceKind": "PROFORMA",
                    ":invoiceNumber": proformaInvoiceNumber,
                    ":invoiceDate": now,
                    ":proformaInvoiceNumber": proformaInvoiceNumber,
                    ":totalAmount": requestedAmount,
                    ":gstAmount": requestedGstAmount,
                    ":subtotal": requestedBaseAmount,
                    ":items": [
                        {
                            engineName: params.engineName,
                            price: requestedBaseAmount,
                            description: `Initial payment request for ${params.engineName}`,
                            durationMonths: 1,
                        },
                    ],
                    ":employeeCount": params.employeeCount,
                    ":requestedPaymentPercent": percent,
                    ":requestedBaseAmount": requestedBaseAmount,
                    ":approvedRequestedBaseAmount": requestedBaseAmount,
                    ":approvedRequestedAmount": requestedAmount,
                    ":fullAmount": fullAmount,
                    ":requestNotes": params.requestNotes || null,
                    ":updatedAt": now,
                },
            })
        );

        return {
            ...existingRequest,
            status: "request_pending_approval",
            invoiceKind: "PROFORMA",
            invoiceNumber: proformaInvoiceNumber,
            invoiceDate: now,
            proformaInvoiceNumber,
            totalAmount: requestedAmount,
            gstAmount: requestedGstAmount,
            subtotal: requestedBaseAmount,
            items: [
                {
                    engineName: params.engineName,
                    price: requestedBaseAmount,
                    description: `Initial payment request for ${params.engineName}`,
                    durationMonths: 1,
                },
            ],
            employeeCount: params.employeeCount,
            requestedPaymentPercent: percent,
            requestedBaseAmount,
            approvedRequestedBaseAmount: requestedBaseAmount,
            approvedRequestedAmount: requestedAmount,
            fullAmount,
            requestNotes: params.requestNotes,
            updatedAt: now,
        };
    }

    const invoiceId = uuidv4();
    const createdAt = now;

    const paymentRequest: PaymentRecord = {
        pk: `COMPANY#${params.orgId}`,
        sk: `PAYMENT#${invoiceId}`,
        invoiceId,
        orderId: uuidv4(),
        companyId: params.orgId,
        totalAmount: requestedAmount,
        gstAmount: requestedGstAmount,
        subtotal: requestedBaseAmount,
        status: "request_pending_approval",
        invoiceKind: "PROFORMA",
        invoiceNumber: proformaInvoiceNumber,
        invoiceDate: createdAt,
        dueDate: createdAt,
        proformaInvoiceNumber,
        items: [
            {
                engineName: params.engineName,
                price: requestedBaseAmount,
                description: `Initial payment request for ${params.engineName}`,
                durationMonths: 1,
            },
        ],
        workflowType: "request_based",
        engineName: params.engineName,
        employeeCount: params.employeeCount,
        requestedPaymentPercent: percent,
        requestedBaseAmount,
        approvedRequestedBaseAmount: requestedBaseAmount,
        approvedRequestedAmount: requestedAmount,
        fullAmount,
        requestNotes: params.requestNotes,
        createdAt,
        updatedAt: createdAt,
    };

    await ddbDocClient.send(
        new PutCommand({
            TableName: USERS_TABLE,
            Item: paymentRequest,
        })
    );

    return paymentRequest;
}

export async function getEngineAccessStatus(orgId: string, engineName: string): Promise<EngineAccessStatus> {
    const normalizedEngine = normalizeEngineName(engineName);
    const canonicalTarget = canonicalEngineName(engineName);
    const payments = await getCompanyPayments(orgId);
    const enginePayments = payments.filter((payment) => {
        // Match by normalized name OR by canonical name
        const paymentNorm = normalizeEngineName(payment.engineName || "");
        const paymentCanonical = canonicalEngineName(payment.engineName || "");
        if (paymentNorm === normalizedEngine || paymentCanonical === canonicalTarget) {
            return true;
        }
        return (payment.items || []).some(
            (item) => {
                const iName = item.engineName || "";
                const iNorm = normalizeEngineName(iName);
                const iCanonical = canonicalEngineName(iName);
                if (iNorm === normalizedEngine || iCanonical === canonicalTarget) return true;
                const match = iName.match(/^(.*) - Installment #(\d+)$/);
                if (match) {
                    const baseName = match[1];
                    if (normalizeEngineName(baseName) === normalizedEngine || canonicalEngineName(baseName) === canonicalTarget) return true;
                }
                return false;
            }
        );
    });

    const requestRecords = enginePayments
        .filter((payment) => payment.workflowType === "request_based")
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    const latestRequest = requestRecords[0] || null;
    const isClearedRequest = latestRequest?.status === "cleared";
    const requestStatus = isClearedRequest ? "none" : mapRequestStatus(latestRequest?.status);

    const approvedRequestedAmount = isClearedRequest
        ? 0
        : Number(latestRequest?.approvedRequestedAmount ?? latestRequest?.totalAmount ?? 0);
    const approvedRequestedBaseAmount = isClearedRequest
        ? 0
        : Number(latestRequest?.approvedRequestedBaseAmount ?? latestRequest?.requestedBaseAmount ?? latestRequest?.subtotal ?? 0);

    const engineConfig = await getEngineSubscriptionConfig(orgId, engineName);
    const engineType = engineConfig?.engineType ?? getEngineClassification(engineName);
    const paymentType = engineConfig?.defaultPaymentType ?? (engineType === "core" ? "full" : "milestone");
    const allowPartialPayment = engineConfig?.allowPartialPayment ?? (engineType === "advanced");
    const manualForceEnabled = engineConfig?.manualEnabled === true;
    const manualForceDisabled = engineConfig?.manualDisabled === true;

    const fullAmount = isClearedRequest ? 0 : Number(latestRequest?.fullAmount || 0);
    const employeeCount = isClearedRequest ? null : typeof latestRequest?.employeeCount === "number" ? latestRequest.employeeCount : null;

    const verifiedPayments = enginePayments.filter(
        (payment) => payment.status === "payment_verified" || payment.status === "completed"
    );

    const totalPaidAmount = verifiedPayments.reduce((sum, payment) => {
        const matchingItems = (payment.items || []).filter(
            (item) => {
                const iName = item.engineName || "";
                const strippedName = stripInstallmentSuffix(iName);
                if (normalizeEngineName(strippedName) === normalizedEngine) return true;
                // Also match by canonical name
                if (canonicalEngineName(strippedName) === canonicalTarget) return true;
                return false;
            }
        );

        if (matchingItems.length === 0) {
            return sum;
        }

        if ((payment.items || []).length === 1) {
            return sum + Number(payment.totalAmount || 0);
        }

        return sum + matchingItems.reduce((itemSum, item) => itemSum + getItemGrossAmount(item), 0);
    }, 0);

    const isFullyPaid = fullAmount > 0 && totalPaidAmount >= fullAmount;
    const advancedUnlock = getUnlockedFeatures(engineConfig ?? undefined, totalPaidAmount, fullAmount);
    const partiallyEnabled = engineType === "advanced" && advancedUnlock.unlockedFeatures.length > 0 && !isFullyPaid;
    
    // Check if this is a core engine included FREE with an advanced engine payment
    // Look across ALL company request_based records (not just this engine's records)
    let isIncludedFreeWithAdvanced = false;
    let parentAdvancedEngineName = "";
    let parentAdvancedTotalPaid = 0;
    let parentAdvancedFullAmount = 0;

    // First check the direct request records for this engine
    const directIncluded = latestRequest && 
        latestRequest.items && 
        latestRequest.items.length > 1 && 
        latestRequest.items.some(item => 
            normalizeEngineName(item.engineName) === normalizedEngine && 
            item.price === 0 &&
            (item.description || "").includes("Included Core Engine")
        );

    if (directIncluded && latestRequest) {
        isIncludedFreeWithAdvanced = true;
        // The parent advanced engine is the main item (first item, or the one with price > 0)
        const parentItem = latestRequest.items!.find(item => item.price > 0) || latestRequest.items![0];
        parentAdvancedEngineName = parentItem?.engineName || latestRequest.engineName || "";
    } else {
        // Also scan other request records where this core engine might be bundled
        const allRequestRecords = payments.filter(p => 
            p.workflowType === "request_based" && 
            p.status !== "cleared" &&
            Array.isArray(p.items) &&
            p.items.some(item => 
                normalizeEngineName(item.engineName) === normalizedEngine && 
                item.price === 0 &&
                (item.description || "").includes("Included Core Engine")
            )
        );
        if (allRequestRecords.length > 0) {
            const parentRecord = allRequestRecords[0];
            isIncludedFreeWithAdvanced = true;
            const parentItem = parentRecord.items!.find(item => item.price > 0) || parentRecord.items![0];
            parentAdvancedEngineName = parentItem?.engineName || parentRecord.engineName || "";
        }
    }

    let coreEnabled = false;
    if (isIncludedFreeWithAdvanced && parentAdvancedEngineName) {
        // Calculate actual payment progress for the PARENT advanced engine
        const parentNormalized = normalizeEngineName(parentAdvancedEngineName);
        const parentPayments = payments.filter(p => {
            if (p.status !== "payment_verified" && p.status !== "completed") return false;
            return (p.items || []).some(item => 
                normalizeEngineName(stripInstallmentSuffix(item.engineName || "")) === parentNormalized
            );
        });
        parentAdvancedTotalPaid = parentPayments.reduce((sum, p) => sum + Number(p.totalAmount || 0), 0);

        // Get the parent's full amount from request records
        const parentRequestRecord = payments.find(p => 
            p.workflowType === "request_based" && 
            p.status !== "cleared" &&
            normalizeEngineName(p.engineName || "") === parentNormalized
        );
        parentAdvancedFullAmount = Number(parentRequestRecord?.fullAmount || 0);

        // Unlock core engine if 50%+ of parent advanced engine is paid
        const paymentPercent = parentAdvancedFullAmount > 0 
            ? Math.round((parentAdvancedTotalPaid / parentAdvancedFullAmount) * 100) 
            : 0;
        coreEnabled = paymentPercent >= 50 || parentAdvancedTotalPaid > 0;
    } else {
        coreEnabled = isFullyPaid;
    }

    const enabled = manualForceEnabled || (!manualForceDisabled && ((engineType === "core" && coreEnabled) || (engineType === "advanced" && advancedUnlock.unlockedFeatures.length > 0)));

    const activationStatus: "disabled" | "partially_enabled" | "enabled" = manualForceDisabled
        ? "disabled"
        : enabled && (engineType === "advanced" ? isFullyPaid : coreEnabled)
            ? "enabled"
            : partiallyEnabled
                ? "partially_enabled"
                : "disabled";

    const assessmentUnlocked = manualForceEnabled
        ? true
        : engineType === "core"
            ? coreEnabled
            : allowPartialPayment
                ? (advancedUnlock.unlockedFeatures.length > 0 || (totalPaidAmount > 0 && verifiedPayments.length > 0))
                : isFullyPaid;

    const reportUnlocked = manualForceEnabled
        ? true
        : engineType === "core"
            ? coreEnabled
            : isFullyPaid;

    const pendingAmount = Math.max(0, (fullAmount || approvedRequestedAmount) - totalPaidAmount);
    const remainingAmount = Math.max(0, fullAmount - totalPaidAmount);

    return {
        engineName,
        requestStatus,
        engineType,
        paymentType,
        allowPartialPayment,
        manualOverride: {
            enabled: engineConfig?.manualEnabled,
            disabled: engineConfig?.manualDisabled,
            notes: engineConfig?.overrideNotes,
        },
        activationStatus,
        paymentProgress: advancedUnlock.progressPercent,
        enabledFeatures: advancedUnlock.unlockedFeatures,
        featureUnlocks: buildFeatureUnlockMapping(engineConfig ?? undefined),
        assessmentUnlocked,
        reportUnlocked,
        approvedRequestedAmount,
        approvedRequestedBaseAmount,
        totalPaidAmount,
        fullAmount,
        pendingAmount,
        remainingAmount,
        employeeCount,
        requestRecord: latestRequest,
        rejectionReason: latestRequest?.rejectionReason,
        installments: latestRequest?.installments,
        currentInstallment: latestRequest?.currentInstallment,
        numberOfInstallments: latestRequest?.numberOfInstallments,
        isIncludedFreeWithAdvanced,
        parentAdvancedEngineName: isIncludedFreeWithAdvanced ? parentAdvancedEngineName : undefined,
    };
}

export async function getEngineAccessStatuses(orgId: string, engineNames: string[]): Promise<Record<string, EngineAccessStatus>> {
    const result: Record<string, EngineAccessStatus> = {};
    for (const engineName of engineNames) {
        result[engineName] = await getEngineAccessStatus(orgId, engineName);
    }
    return result;
}

/**
 * Generate invoice and create payment record
 */
export async function generateInvoice(
    orgId: string,
    cartItems: any[],
    companyDetails: any,
    billingContact?: {
        name: string;
        email: string;
        phone: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
        gstin?: string;
    }
): Promise<PaymentRecord> {
    const invoiceId = uuidv4();
    const invoiceDateObj = new Date();
    const sequence = await getFinalInvoiceSequenceForDate(orgId, invoiceDateObj);
    const invoiceDateString = invoiceDateObj.toISOString().slice(0, 10);
    const proformaInvoiceNumber = `HR-${invoiceDateString}-${sequence.toString().padStart(2, '0')}`;

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);

    // Determine tax type based on state
    const companyState = companyDetails?.state || 'Maharashtra';
    const billingState = billingContact?.state || companyState;
    const isSameState = companyState.toLowerCase() === billingState.toLowerCase();

    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let taxType: 'CGST_SGST' | 'IGST';

    if (isSameState) {
        cgst = subtotal * 0.09; // 9%
        sgst = subtotal * 0.09; // 9%
        taxType = 'CGST_SGST';
    } else {
        igst = subtotal * 0.18; // 18%
        taxType = 'IGST';
    }

    const gstAmount = cgst + sgst + igst;
    const totalAmount = subtotal + gstAmount;

    const invoiceDate = new Date().toISOString();
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    // Attempt to attach an approved installment plan (if any) for the engine in the cart.
    // Admins can create/approve request-based installment plans which are stored as
    // payment records with `workflowType === 'request_based'` and `status === 'request_approved'`.
    // If the cart contains a single engine and an approved plan exists for that engine,
    // copy that plan's `installments` into the generated proforma invoice and calculate
    // installment amounts based on the item's price when necessary.
    let appliedInstallments: InstallmentDetail[] | undefined = undefined;
    let appliedHsnCode: string | undefined = undefined;
    try {
        if (cartItems.length === 1) {
            const cartItem = cartItems[0];
            const cartEngineName = stripInstallmentSuffix(cartItem.displayName || cartItem.productName || cartItem.engineName || "");
            const companyPayments = await getCompanyPayments(orgId);
            const requestRecords = companyPayments.filter(p =>
                p.workflowType === 'request_based' &&
                p.status !== 'cleared' &&
                normalizeEngineName(stripInstallmentSuffix(p.engineName || p.items?.[0]?.engineName || '')) === normalizeEngineName(cartEngineName)
            ).sort((a, b) => {
                // Prioritize approved records
                if (a.status === 'request_approved' && b.status !== 'request_approved') return -1;
                if (b.status === 'request_approved' && a.status !== 'request_approved') return 1;
                return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
            });

            const approvedPlan = requestRecords[0];

            if (approvedPlan && Array.isArray(approvedPlan.installments)) {
                const fullAmountForItem = Number(cartItem.price || 0);
                appliedInstallments = approvedPlan.installments.map(inst => {
                    const pct = Number(inst.percentage || 0);
                    const calculatedAmount = typeof inst.amount === 'number'
                        ? inst.amount
                        : Math.round((fullAmountForItem * pct) / 100);

                    const splitDetails = Array.isArray(inst.splitDetails)
                        ? inst.splitDetails.map(sd => ({
                            item: sd.item || '',
                            description: sd.description || '',
                            hsnCode: sd.hsnCode || '',
                            amount: sd.amount ? String(sd.amount) : String(Math.round((fullAmountForItem * pct) / 100))
                        }))
                        : [];

                    return {
                        ...inst,
                        amount: calculatedAmount,
                        splitDetails
                    } as InstallmentDetail;
                });

                // Also copy HSN code from the approved plan
                if (approvedPlan.hsnCode) {
                    appliedHsnCode = approvedPlan.hsnCode;
                }
            }

            // If no installment plan was found, still try to find the HSN code from the request record
            if (!appliedHsnCode) {
                const requestWithHsn = companyPayments.find(p =>
                    p.workflowType === 'request_based' &&
                    p.hsnCode &&
                    normalizeEngineName(stripInstallmentSuffix(p.engineName || p.items?.[0]?.engineName || '')) === normalizeEngineName(cartEngineName)
                );
                if (requestWithHsn?.hsnCode) {
                    appliedHsnCode = requestWithHsn.hsnCode;
                }
            }
        }
    } catch (error) {
        // Non-fatal: if anything goes wrong while looking up plans, we still generate the invoice
        console.error("Error applying approved installment plan:", error);
    }

    const paymentRecord: PaymentRecord = {
        pk: `COMPANY#${orgId}`,
        sk: `PAYMENT#${invoiceId}`,
        invoiceId,
        orderId: uuidv4(), // Link to order if needed
        companyId: orgId,
        totalAmount,
        gstAmount,
        subtotal,
        invoiceKind: "PROFORMA",
        status: "pending_payment",
        invoiceNumber: proformaInvoiceNumber,
        invoiceDate,
        dueDate,
        proformaInvoiceNumber,
        items: cartItems.map(item => ({
            engineName: item.displayName || item.productName || item.engineName,
            price: item.price,
            durationMonths: item.durationMonths || 1,
            description: `HR Digital Transformation - ${item.displayName || item.productName || item.engineName}`
        })),
        billingContact,
        cgst,
        sgst,
        igst,
        taxType,
        hsnCode: appliedHsnCode,
        createdAt: invoiceDate,
        updatedAt: invoiceDate,
        // Attach installments when an approved plan was found for this cart
        ...(appliedInstallments ? { installments: appliedInstallments, paymentType: 'milestone' } : {})
    };

    const command = new PutCommand({
        TableName: USERS_TABLE,
        Item: paymentRecord
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Proforma invoice generated: ${proformaInvoiceNumber} for company ${orgId}`);
        return paymentRecord;
    } catch (e) {
        console.error("Error generating invoice:", e);
        throw e;
    }
}

/**
 * Submit payment proof (user action)
 */
export async function submitPaymentProof(
    invoiceId: string,
    orgId: string,
    paymentData: {
        paymentMethod: PaymentMethod;
        transactionId?: string;
        paymentProofUrl: string;
        paymentDate: string;
        paymentNotes?: string;
    }
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `
      SET #status = :status,
          paymentMethod = :paymentMethod,
          transactionId = :transactionId,
          paymentProofUrl = :paymentProofUrl,
          paymentDate = :paymentDate,
          paymentNotes = :paymentNotes,
          updatedAt = :updatedAt
    `,
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": "payment_submitted",
            ":paymentMethod": paymentData.paymentMethod,
            ":transactionId": paymentData.transactionId || null,
            ":paymentProofUrl": paymentData.paymentProofUrl,
            ":paymentDate": paymentData.paymentDate,
            ":paymentNotes": paymentData.paymentNotes || null,
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Payment proof submitted for invoice ${invoiceId}`);

        // Sync installment status if this payment is for an installment
        const existing = await getPaymentRecord(invoiceId, orgId);
        for (const item of existing?.items || []) {
            const match = item.engineName.match(/^(.*) - Installment #(\d+)$/);
            if (match) {
                const engineName = match[1];
                const installmentNum = parseInt(match[2]);
                const access = await getEngineAccessStatus(orgId, engineName);
                if (access.requestRecord?.invoiceId) {
                    await updateInstallmentStatus(access.requestRecord.invoiceId, orgId, installmentNum, "payment_submitted");
                }
            }
        }
    } catch (e) {
        console.error("Error submitting payment proof:", e);
        throw e;
    }
}

/**
 * Verify payment (admin action)
 * Also auto-approves all pending reports for this company
 */
export async function verifyPayment(
    invoiceId: string,
    orgId: string,
    adminId: string,
    verificationNotes?: string
): Promise<void> {
    const finalizedAt = new Date().toISOString();

    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `
      SET #status = :status,
          #verifiedBy = :verifiedBy,
          #verifiedAt = :verifiedAt,
          #verificationNotes = :verificationNotes,
          #updatedAt = :updatedAt
    `,
        ExpressionAttributeNames: {
            "#status": "status",
            "#verifiedBy": "verifiedBy",
            "#verifiedAt": "verifiedAt",
            "#verificationNotes": "verificationNotes",
            "#updatedAt": "updatedAt"
        },
        ExpressionAttributeValues: {
            ":status": "payment_approved",
            ":verifiedBy": adminId,
            ":verifiedAt": finalizedAt,
            ":verificationNotes": verificationNotes || null,
            ":updatedAt": finalizedAt
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Payment approved for customer acceptance for invoice ${invoiceId} by admin ${adminId}`);
    } catch (e) {
        console.error("Error approving payment:", e);
        throw e;
    }
}

/**
 * Auto-approve all pending reports for a company after payment verification
 */
async function autoApproveCompanyReports(orgId: string): Promise<void> {
    try {
        // Import ScanCommand and UpdateCommand
        const { ScanCommand } = await import("@aws-sdk/lib-dynamodb");

        // Find all pending reports for this company
        const scanCommand = new ScanCommand({
            TableName: USERS_TABLE,
            FilterExpression: "pk = :pk AND begins_with(sk, :sk_prefix) AND #status = :status",
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":pk": `COMPANY#${orgId}`,
                ":sk_prefix": "ANALYSIS#",
                ":status": "pending"
            }
        });

        const { Items } = await ddbDocClient.send(scanCommand);

        if (!Items || Items.length === 0) {
            console.log(`No pending reports found for company ${orgId}`);
            return;
        }

        // Auto-approve each pending report
        const approvalPromises = Items.map(item => {
            const updateCommand = new UpdateCommand({
                TableName: USERS_TABLE,
                Key: {
                    pk: item.pk,
                    sk: item.sk
                },
                UpdateExpression: "SET #status = :status, approvedAt = :approvedAt, autoApproved = :autoApproved",
                ExpressionAttributeNames: {
                    "#status": "status"
                },
                ExpressionAttributeValues: {
                    ":status": "approved",
                    ":approvedAt": new Date().toISOString(),
                    ":autoApproved": true
                }
            });
            return ddbDocClient.send(updateCommand);
        });

        await Promise.all(approvalPromises);
        console.log(`✅ Auto-approved ${Items.length} reports for company ${orgId}`);
    } catch (error) {
        console.error("Error auto-approving reports:", error);
        // Don't throw - payment verification should succeed even if report approval fails
    }
}

/**
 * Reject payment (admin action)
 */
export async function rejectPayment(
    invoiceId: string,
    orgId: string,
    adminId: string,
    rejectionReason: string
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `
      SET #status = :status,
          verifiedBy = :verifiedBy,
          verifiedAt = :verifiedAt,
          rejectionReason = :rejectionReason,
          updatedAt = :updatedAt
    `,
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": "payment_rejected",
            ":verifiedBy": adminId,
            ":verifiedAt": new Date().toISOString(),
            ":rejectionReason": rejectionReason,
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Payment rejected for invoice ${invoiceId} by admin ${adminId}`);

        // Sync installment status if this payment is for an installment
        const existing = await getPaymentRecord(invoiceId, orgId);
        for (const item of existing?.items || []) {
            const match = item.engineName.match(/^(.*) - Installment #(\d+)$/);
            if (match) {
                const engineName = match[1];
                const installmentNum = parseInt(match[2]);
                const access = await getEngineAccessStatus(orgId, engineName);
                if (access.requestRecord?.invoiceId) {
                    await updateInstallmentStatus(access.requestRecord.invoiceId, orgId, installmentNum, "rejected");
                }
            }
        }
    } catch (e) {
        console.error("Error rejecting payment:", e);
        throw e;
    }
}

export async function acceptInvoice(
    invoiceId: string,
    orgId: string,
    userId: string
): Promise<void> {
    const existing = await getPaymentRecord(invoiceId, orgId);
    if (!existing) {
        throw new Error(`Invoice ${invoiceId} not found for company ${orgId}`);
    }

    const finalizedAt = new Date().toISOString();
    
    let finalInvoiceNumber = existing.finalInvoiceNumber;
    if (!finalInvoiceNumber) {
        if (existing.proformaInvoiceNumber?.startsWith('HR-')) {
            finalInvoiceNumber = existing.proformaInvoiceNumber;
        } else {
            const invoiceDateObj = new Date(finalizedAt);
            const sequence = await getFinalInvoiceSequenceForDate(orgId, invoiceDateObj);
            const invoiceDateString = invoiceDateObj.toISOString().slice(0, 10);
            finalInvoiceNumber = `HR-${invoiceDateString}-${sequence.toString().padStart(2, '0')}`;
        }
    }

    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `
      SET #status = :status,
          #acceptedBy = :acceptedBy,
          #acceptedAt = :acceptedAt,
          #updatedAt = :updatedAt,
          #invoiceKind = :invoiceKind,
          #finalInvoiceNumber = :finalInvoiceNumber,
          #finalInvoiceDate = :finalInvoiceDate,
          #invoiceNumber = :invoiceNumber,
          #invoiceDate = :invoiceDate,
          #proformaInvoiceNumber = :proformaInvoiceNumber
    `,
        ExpressionAttributeNames: {
            "#status": "status",
            "#acceptedBy": "acceptedBy",
            "#acceptedAt": "acceptedAt",
            "#updatedAt": "updatedAt",
            "#invoiceKind": "invoiceKind",
            "#finalInvoiceNumber": "finalInvoiceNumber",
            "#finalInvoiceDate": "finalInvoiceDate",
            "#invoiceNumber": "invoiceNumber",
            "#invoiceDate": "invoiceDate",
            "#proformaInvoiceNumber": "proformaInvoiceNumber"
        },
        ExpressionAttributeValues: {
            ":status": "payment_verified",
            ":acceptedBy": userId,
            ":acceptedAt": finalizedAt,
            ":updatedAt": finalizedAt,
            ":invoiceKind": "FINAL",
            ":finalInvoiceNumber": finalInvoiceNumber,
            ":finalInvoiceDate": finalizedAt,
            ":invoiceNumber": finalInvoiceNumber,
            ":invoiceDate": finalizedAt,
            ":proformaInvoiceNumber": existing.proformaInvoiceNumber || existing.invoiceNumber || null
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Customer accepted invoice ${invoiceId} for company ${orgId}`);

        for (const item of existing.items || []) {
            const engineName = item.engineName;
            await processEngineActivationForPayment(orgId, invoiceId, engineName);

            // If this invoice includes an installment payment, mark that installment as paid
            const match = engineName.match(/^(.*) - Installment #(\d+)$/);
            if (match) {
                const installmentNum = parseInt(match[2], 10);
                const normalizedEngineName = match[1];
                const access = await getEngineAccessStatus(orgId, normalizedEngineName);
                if (access.requestRecord?.invoiceId) {
                    await updateInstallmentStatus(access.requestRecord.invoiceId, orgId, installmentNum, "paid");
                }
            }
        }

        await autoApproveCompanyReports(orgId);
        console.log(`✅ Auto-approved reports for company ${orgId} after customer invoice acceptance`);
    } catch (e) {
        console.error("Error accepting invoice:", e);
        throw e;
    }
}

export async function declineInvoice(
    invoiceId: string,
    orgId: string,
    userId: string,
    declineReason?: string
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `
      SET #status = :status,
          #declinedBy = :declinedBy,
          #declinedAt = :declinedAt,
          #declineReason = :declineReason,
          #updatedAt = :updatedAt
    `,
        ExpressionAttributeNames: {
            "#status": "status",
            "#declinedBy": "declinedBy",
            "#declinedAt": "declinedAt",
            "#declineReason": "declineReason",
            "#updatedAt": "updatedAt"
        },
        ExpressionAttributeValues: {
            ":status": "payment_rejected",
            ":declinedBy": userId,
            ":declinedAt": new Date().toISOString(),
            ":declineReason": declineReason || null,
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Customer declined invoice ${invoiceId} for company ${orgId}`);
    } catch (e) {
        console.error("Error declining invoice:", e);
        throw e;
    }
}

/**
 * Get payment record
 */
export async function getPaymentRecord(
    invoiceId: string,
    orgId: string
): Promise<PaymentRecord | null> {
    const command = new GetCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        }
    });

    try {
        const { Item } = await ddbDocClient.send(command);
        return Item as PaymentRecord || null;
    } catch (e) {
        console.error("Error fetching payment record:", e);
        throw e;
    }
}

/**
 * Get all active installment plans (for admin)
 * Approved requests that have an installments array
 */
export async function getActiveInstallmentPlans(): Promise<PaymentRecord[]> {
    const command = new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "#status = :status AND attribute_exists(#installments) AND begins_with(sk, :skPrefix)",
        ExpressionAttributeNames: {
            "#status": "status",
            "#installments": "installments"
        },
        ExpressionAttributeValues: {
            ":status": "request_approved",
            ":skPrefix": "PAYMENT#"
        }
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        return (Items as PaymentRecord[]) || [];
    } catch (e) {
        console.error("Error fetching active installment plans:", e);
        throw e;
    }
}

/**
 * Get all payments for a company
 */
export async function getCompanyPayments(orgId: string): Promise<PaymentRecord[]> {
    const command = new QueryCommand({
        TableName: USERS_TABLE,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
        ExpressionAttributeValues: {
            ":pk": `COMPANY#${orgId}`,
            ":skPrefix": "PAYMENT#"
        },
        ScanIndexForward: false // Most recent first
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        return (Items as PaymentRecord[]) || [];
    } catch (e) {
        console.error("Error fetching company payments:", e);
        throw e;
    }
}

export async function getFinalInvoiceSequenceForDate(orgId: string, date: Date): Promise<number> {
    const payments = await getCompanyPayments(orgId);
    const targetDate = date.toISOString().slice(0, 10);
    const sameDayFinalInvoices = payments.filter(payment =>
        payment.invoiceKind === "FINAL" &&
        typeof payment.finalInvoiceDate === "string" &&
        payment.finalInvoiceDate.startsWith(targetDate)
    );
    return sameDayFinalInvoices.length + 1;
}

export async function getEngineSubscriptionConfig(orgId: string, engineName: string): Promise<EngineSubscriptionConfig | null> {
    const normalized = normalizeEngineName(canonicalEngineName(engineName));
    const command = new GetCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `ENGINE_CONFIG#${normalized}`
        }
    });

    try {
        const { Item } = await ddbDocClient.send(command);
        return Item ? (Item as EngineSubscriptionConfig) : null;
    } catch (e) {
        console.error("Error fetching engine subscription config:", e);
        throw e;
    }
}

export async function getAllEngineSubscriptionConfigs(orgId: string): Promise<EngineSubscriptionConfig[]> {
    const command = new QueryCommand({
        TableName: USERS_TABLE,
        KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
        ExpressionAttributeValues: {
            ":pk": `COMPANY#${orgId}`,
            ":skPrefix": "ENGINE_CONFIG#"
        },
        ScanIndexForward: false
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        return (Items as EngineSubscriptionConfig[]) || [];
    } catch (e) {
        console.error("Error fetching all engine subscription configs:", e);
        throw e;
    }
}

export async function saveEngineSubscriptionConfig(orgId: string, config: EngineSubscriptionConfig): Promise<EngineSubscriptionConfig> {
    const canonicalName = canonicalEngineName(config.engineName);
    const normalized = normalizeEngineName(canonicalName);
    const now = new Date().toISOString();
    const savedConfig: EngineSubscriptionConfig = {
        ...config,
        engineName: canonicalName,
        engineType: config.engineType,
        defaultPaymentType: config.engineType === "core" ? "full" : config.defaultPaymentType,
        allowPartialPayment: config.engineType === "core" ? false : config.allowPartialPayment,
        updatedAt: now,
        createdAt: config.createdAt || now,
    };

    const command = new PutCommand({
        TableName: USERS_TABLE,
        Item: {
            pk: `COMPANY#${orgId}`,
            sk: `ENGINE_CONFIG#${normalized}`,
            ...savedConfig,
        }
    });

    try {
        await ddbDocClient.send(command);
        return savedConfig;
    } catch (e) {
        console.error("Error saving engine subscription config:", e);
        throw e;
    }
}

export async function processEngineActivationForPayment(orgId: string, invoiceId: string, engineName: string): Promise<void> {
    const normalizedEngineName = stripInstallmentSuffix(engineName);
    const accessStatus = await getEngineAccessStatus(orgId, normalizedEngineName);
    const snapshot: EngineActivationSnapshot = {
        engineName: normalizedEngineName,
        activationStatus: accessStatus.activationStatus || "disabled",
        enabledFeatures: accessStatus.enabledFeatures || [],
        paymentProgress: accessStatus.paymentProgress || 0,
        totalPaidAmount: accessStatus.totalPaidAmount,
        fullAmount: accessStatus.fullAmount,
        updatedAt: new Date().toISOString(),
    };

    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `SET #activationInfo = :activationInfo, #updatedAt = :updatedAt`,
        ExpressionAttributeNames: {
            "#activationInfo": "activationInfo",
            "#updatedAt": "updatedAt"
        },
        ExpressionAttributeValues: {
            ":activationInfo": { engineActivations: [snapshot] },
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
    } catch (e) {
        console.error("Error updating engine activation info:", e);
        throw e;
    }
}

/**
 * Get all pending payment verifications (for admin)
 * Includes both payment_submitted (proof uploaded) and pending_payment (invoice created, awaiting proof)
 */
export async function getPendingPaymentVerifications(): Promise<PaymentRecord[]> {
    // TODO: Create GSI on status field for better performance
    // For now, using Scan with filter (works but slower for large datasets)

    const command = new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "(#status = :status1 OR #status = :status2) AND begins_with(sk, :skPrefix)",
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status1": "payment_submitted",
            ":status2": "pending_payment",
            ":skPrefix": "PAYMENT#"
        }
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        const payments = (Items as PaymentRecord[]) || [];

        // Sort by submission date (newest first)
        return payments.sort((a, b) => {
            const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            return dateB - dateA;
        });
    } catch (e) {
        console.error("Error fetching pending verifications:", e);
        return [];
    }
}

/**
 * Check if company has verified payments for specific engines
 * Includes a 30-day expiration check
 */
export async function hasVerifiedPaymentForEngines(
    orgId: string,
    engineNames: string[]
): Promise<boolean> {
    const payments = await getCompanyPayments(orgId);

    const paidEngines = new Set<string>();
    
    payments.forEach(p => {
        if (p.status !== "payment_verified" && p.status !== "completed") return;
        
        p.items?.forEach(item => {
            const duration = item.durationMonths || 1;
            const verifiedAt = new Date(p.verifiedAt || p.updatedAt);
            const expiresAt = new Date(verifiedAt);
            expiresAt.setMonth(expiresAt.getMonth() + duration);
            
            if (new Date() < expiresAt) {
                let eName = item.engineName.trim();
                const match = eName.match(/^(.*) - Installment #(\d+)$/);
                if (match) eName = match[1].trim();
                paidEngines.add(eName);
                // Also add canonical name so different variants match
                paidEngines.add(canonicalEngineName(eName));
            }
        });
    });

    // Also include core engines that are included with advanced engine payments at >= 50% progress
    const advancedPayments = payments.filter(p => {
        const mainEngine = p.items?.[0]?.engineName;
        return mainEngine && getEngineClassification(mainEngine) === "advanced";
    });

    for (const payment of advancedPayments) {
        const paidAmount = payment.paidAmount || payment.totalAmount || 0;
        const fullAmount = payment.fullAmount || payment.totalAmount || 0;
        const paymentPercent = fullAmount > 0 ? Math.round((paidAmount / fullAmount) * 100) : 0;

        if (paymentPercent >= 50 && payment.items && payment.items.length > 1) {
            // Add core engines (price 0) from this payment
            for (const item of payment.items.slice(1)) {
                if (item.price === 0) {
                    paidEngines.add(item.engineName.trim());
                    paidEngines.add(canonicalEngineName(item.engineName.trim()));
                }
            }
        }

        // For advanced engines: if ANY installment is paid, add the engine itself as accessible
        // (assessmentUnlocked at milestone level is handled by getEngineAccessStatus, but
        //  hasVerifiedPaymentForEngines should also recognise partial payments for advanced engines)
        if (payment.status === "payment_verified" || payment.status === "completed") {
            const mainEngine = payment.items?.[0]?.engineName;
            if (mainEngine && getEngineClassification(mainEngine) === "advanced") {
                paidEngines.add(mainEngine.trim());
                paidEngines.add(canonicalEngineName(mainEngine.trim()));
            }
        }
    }

    // Check by both raw name and canonical name
    return engineNames.every(engine => 
        paidEngines.has(engine.trim()) || paidEngines.has(canonicalEngineName(engine))
    );
}

/**
 * Get list of verified paid engines for a company
 */
export async function getVerifiedPaidEngines(orgId: string): Promise<string[]> {
    const payments = await getCompanyPayments(orgId);

    const verifiedPayments = payments.filter(p => p.status === "payment_verified");
    const paidEngines = new Set(
        verifiedPayments.flatMap(p => p.items.map(item => {
            let eName = item.engineName.trim();
            const match = eName.match(/^(.*) - Installment #(\d+)$/);
            if (match) eName = match[1].trim();
            return eName;
        }))
    );

    // Also include core engines that are included with advanced engine payments at >= 50% progress
    const advancedPayments = payments.filter(p => {
        const mainEngine = p.items?.[0]?.engineName;
        return mainEngine && getEngineClassification(mainEngine) === "advanced";
    });

    for (const payment of advancedPayments) {
        const paidAmount = payment.paidAmount || payment.totalAmount || 0;
        const fullAmount = payment.fullAmount || payment.totalAmount || 0;
        const paymentPercent = fullAmount > 0 ? Math.round((paidAmount / fullAmount) * 100) : 0;

        if (paymentPercent >= 50 && payment.items && payment.items.length > 1) {
            // Add core engines (price 0) from this payment
            for (const item of payment.items.slice(1)) {
                if (item.price === 0) {
                    paidEngines.add(item.engineName.trim());
                }
            }
        }
    }

    return Array.from(paidEngines);
}

/**
 * Get count of verified paid engines
 */
export async function getVerifiedPaidEnginesCount(orgId: string): Promise<number> {
    const paidEngines = await getVerifiedPaidEngines(orgId);
    return paidEngines.length;
}

/**
 * Check if company is eligible for HR Digital Transformation
 * Requires 3+ verified paid engines
 */
export async function isEligibleForTransformation(orgId: string): Promise<{
    eligible: boolean;
    paidCount: number;
    requiredCount: number;
    paidEngines: string[];
}> {
    const paidEngines = await getVerifiedPaidEngines(orgId);
    const paidCount = paidEngines.length;
    const requiredCount = 5;

    return {
        eligible: paidCount >= requiredCount,
        paidCount,
        requiredCount,
        paidEngines
    };
}

/**
 * Get the detailed payment status for a specific engine
 */
export async function getEnginePaymentStatus(orgId: string, engineName: string) {
    const payments = await getCompanyPayments(orgId);
    
    // Check for verified and active payment
    let activePayment = null;
    let maxExpiresAt = 0;

    for (const p of payments) {
        if (p.status !== "payment_verified" && p.status !== "completed") continue;
        
        const engineItem = p.items?.find(i => {
            let eName = i.engineName.trim();
            const match = eName.match(/^(.*) - Installment #(\d+)$/);
            if (match) eName = match[1].trim();
            return eName === engineName.trim();
        });
        if (!engineItem) continue;

        const duration = engineItem.durationMonths || 1;
        const verifiedAt = new Date(p.verifiedAt || p.updatedAt);
        const expiresAt = new Date(verifiedAt);
        expiresAt.setMonth(expiresAt.getMonth() + duration);

        if (new Date() < expiresAt) {
            if (expiresAt.getTime() > maxExpiresAt) {
                maxExpiresAt = expiresAt.getTime();
                activePayment = p;
            }
        }
    }

    if (activePayment) {
        return { 
            status: "paid", 
            record: activePayment, 
            expiresAt: new Date(maxExpiresAt).toISOString() 
        };
    }

    // Check for pending verification
    const pendingPayment = payments.find(p => 
        p.status === "payment_submitted" && 
        p.items?.some(i => {
            let eName = i.engineName.trim();
            const match = eName.match(/^(.*) - Installment #(\d+)$/);
            if (match) eName = match[1].trim();
            return eName === engineName.trim();
        })
    );

    if (pendingPayment) {
        return { status: "pending", record: pendingPayment };
    }

    // Check for rejected payment (so they can try again)
    const rejectedPayment = payments.find(p => 
        p.status === "payment_rejected" && 
        p.items?.some(i => {
            let eName = i.engineName.trim();
            const match = eName.match(/^(.*) - Installment #(\d+)$/);
            if (match) eName = match[1].trim();
            return eName === engineName.trim();
        })
    );

    if (rejectedPayment) {
        return { status: "rejected", record: rejectedPayment };
    }

    return { status: "unpaid", record: null };
}


/**
 * Get all verified payments for a company (for receipts page)
 */
export async function getVerifiedPaymentsByCompany(companyId: string): Promise<PaymentRecord[]> {
    try {
        const result = await ddbDocClient.send(
            new QueryCommand({
                TableName: USERS_TABLE,
                KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
                FilterExpression: "#status = :status",
                ExpressionAttributeNames: {
                    "#status": "status"
                },
                ExpressionAttributeValues: {
                    ":pk": `COMPANY#${companyId}`,
                    ":sk": "PAYMENT#",
                    ":status": "payment_verified"
                },
                ScanIndexForward: false
            })
        );

        return (result.Items || []) as PaymentRecord[];
    } catch (error) {
        console.error("Error fetching verified payments:", error);
        return [];
    }
}

/**
 * Get all pending approval payment requests (admin queue)
 * Returns requests in status: request_pending_approval
 */
export async function getPendingApprovalRequests(): Promise<PaymentRecord[]> {
    const command = new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "#status = :status AND begins_with(sk, :skPrefix)",
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": "request_pending_approval",
            ":skPrefix": "PAYMENT#"
        }
    });

    try {
        const { Items } = await ddbDocClient.send(command);
        const payments = (Items as PaymentRecord[]) || [];

        // Sort by creation date (newest first)
        return payments.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateB - dateA;
        });
    } catch (e) {
        console.error("Error fetching pending approval requests:", e);
        return [];
    }
}

/**
 * Admin approves a payment request
 * Changes status from request_pending_approval to request_approved
 */
export async function approvePaymentRequest(
    invoiceId: string,
    orgId: string,
    adminId: string,
    approvalNotes?: string,
    installments?: Array<{ installmentNumber: number; percentage: number; splitDetails: SplitDetailRow[]; featureUnlocks?: string[] }>,
    options?: {
        hsnCode?: string;
        paymentType?: EnginePaymentType;
        allocatedCoreEngines?: string[];
    }
): Promise<void> {
    const existing = await getPaymentRecord(invoiceId, orgId);
    const fullAmount = existing?.fullAmount || existing?.totalAmount || 0;
    const engineName = existing?.engineName || existing?.items?.[0]?.engineName || "";
    const engineType = getEngineClassification(engineName);

    // Determine payment type: core engines are always "full"
    const resolvedPaymentType: EnginePaymentType = engineType === "core" ? "full" : (options?.paymentType || "full");

    if (engineType === "core" && installments && installments.length > 1) {
        console.warn("Core engine request cannot include installment plan. Forcing single 100% installment.");
        installments = undefined;
    }

    let installmentPlan: InstallmentDetail[] | undefined;
    let numberOfInstallments: number | undefined;

    if (installments && installments.length > 0) {
        numberOfInstallments = installments.length;
        installmentPlan = installments.map((inst) => ({
            installmentNumber: inst.installmentNumber,
            percentage: inst.percentage,
            splitDetails: inst.splitDetails,
            amount: Math.round((fullAmount * inst.percentage) / 100),
            status: "unpaid" as const,
            featureUnlocks: inst.featureUnlocks,
        }));
    }

    // Build updated items array with allocated core engines
    let updatedItems = existing?.items ? [...existing.items] : [];
    if (options?.allocatedCoreEngines && options.allocatedCoreEngines.length > 0) {
        for (const coreEngine of options.allocatedCoreEngines) {
            if (!updatedItems.some(item => item.engineName === coreEngine)) {
                updatedItems.push({
                    engineName: coreEngine,
                    price: 0,
                    description: `Included Core Engine: ${coreEngine}`,
                    durationMonths: 1,
                });
            }
        }
    }

    const updateExprParts = [
        "#status = :status",
        "#verifiedBy = :verifiedBy",
        "#verifiedAt = :verifiedAt",
        "#verificationNotes = :verificationNotes",
        "#updatedAt = :updatedAt",
        "#paymentType = :paymentType",
        "#items = :items",
    ];
    const exprNames: Record<string, string> = {
        "#status": "status",
        "#verifiedBy": "verifiedBy",
        "#verifiedAt": "verifiedAt",
        "#verificationNotes": "verificationNotes",
        "#updatedAt": "updatedAt",
        "#paymentType": "paymentType",
        "#items": "items",
    };
    const exprValues: Record<string, any> = {
        ":status": "request_approved",
        ":verifiedBy": adminId,
        ":verifiedAt": new Date().toISOString(),
        ":verificationNotes": approvalNotes || null,
        ":updatedAt": new Date().toISOString(),
        ":paymentType": resolvedPaymentType,
        ":items": updatedItems,
    };

    // HSN code
    if (options?.hsnCode) {
        updateExprParts.push("#hsnCode = :hsnCode");
        exprNames["#hsnCode"] = "hsnCode";
        exprValues[":hsnCode"] = options.hsnCode;
    }

    if (installmentPlan) {
        updateExprParts.push("#installments = :installments");
        updateExprParts.push("#numberOfInstallments = :numberOfInstallments");
        updateExprParts.push("#currentInstallment = :currentInstallment");
        exprNames["#installments"] = "installments";
        exprNames["#numberOfInstallments"] = "numberOfInstallments";
        exprNames["#currentInstallment"] = "currentInstallment";
        exprValues[":installments"] = installmentPlan;
        exprValues[":numberOfInstallments"] = numberOfInstallments;
        exprValues[":currentInstallment"] = 1;
    }

    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `SET ${updateExprParts.join(", ")}`,
        ExpressionAttributeNames: exprNames,
        ExpressionAttributeValues: exprValues,
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Payment request approved for invoice ${invoiceId} by admin ${adminId} with ${numberOfInstallments || 0} installments, paymentType=${resolvedPaymentType}`);
    } catch (e) {
        console.error("Error approving payment request:", e);
        throw e;
    }
}

/**
 * Update installment status after payment verification
 */
export async function updateInstallmentStatus(
    invoiceId: string,
    orgId: string,
    installmentNumber: number,
    newStatus: "paid" | "rejected" | "payment_submitted"
): Promise<void> {
    const existing = await getPaymentRecord(invoiceId, orgId);
    if (!existing || !existing.installments) return;

    const updatedInstallments = existing.installments.map((inst) => {
        if (inst.installmentNumber === installmentNumber) {
            return {
                ...inst,
                status: newStatus,
                paidAt: newStatus === "paid" ? new Date().toISOString() : undefined,
            };
        }
        return inst;
    });

    // DO NOT auto-increment currentInstallment here. Admin must explicitly enable the next installment.
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `SET #installments = :installments, #updatedAt = :updatedAt`,
        ExpressionAttributeNames: {
            "#installments": "installments",
            "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
            ":installments": updatedInstallments,
            ":updatedAt": new Date().toISOString(),
        },
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Installment ${installmentNumber} updated to ${newStatus} for invoice ${invoiceId}`);
    } catch (e) {
        console.error("Error updating installment status:", e);
        throw e;
    }
}

/**
 * Enable a specific installment manually (Admin initiated)
 */
export async function enableInstallment(
    invoiceId: string,
    orgId: string,
    installmentNumber: number
): Promise<void> {
    const existing = await getPaymentRecord(invoiceId, orgId);
    if (!existing || !existing.installments) return;

    const updatedInstallments = existing.installments.map((inst) => {
        if (inst.installmentNumber === installmentNumber) {
            return {
                ...inst,
                enabled: true
            };
        }
        return inst;
    });

    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `SET #installments = :installments, #currentInstallment = :currentInstallment, #updatedAt = :updatedAt`,
        ExpressionAttributeNames: {
            "#installments": "installments",
            "#currentInstallment": "currentInstallment",
            "#updatedAt": "updatedAt",
        },
        ExpressionAttributeValues: {
            ":installments": updatedInstallments,
            ":currentInstallment": installmentNumber,
            ":updatedAt": new Date().toISOString(),
        },
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Installment ${installmentNumber} manually enabled for invoice ${invoiceId}`);
    } catch (e) {
        console.error("Error enabling installment:", e);
        throw e;
    }
}

/**
 * Admin rejects a payment request
 * Changes status from request_pending_approval to request_rejected
 */
export async function rejectPaymentRequest(
    invoiceId: string,
    orgId: string,
    adminId: string,
    rejectionReason: string
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `
            SET #status = :status,
                #verifiedBy = :verifiedBy,
                #verifiedAt = :verifiedAt,
                #rejectionReason = :rejectionReason,
                #updatedAt = :updatedAt
        `,
        ExpressionAttributeNames: {
            "#status": "status",
            "#verifiedBy": "verifiedBy",
            "#verifiedAt": "verifiedAt",
            "#rejectionReason": "rejectionReason",
            "#updatedAt": "updatedAt"
        },
        ExpressionAttributeValues: {
            ":status": "request_rejected",
            ":verifiedBy": adminId,
            ":verifiedAt": new Date().toISOString(),
            ":rejectionReason": rejectionReason,
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Payment request rejected for invoice ${invoiceId} by admin ${adminId}`);
    } catch (e) {
        console.error("Error rejecting payment request:", e);
        throw e;
    }
}

/**
 * Lock an invoice (prevent further edits)
 * Only ADMIN role can lock/unlock
 */
export async function lockInvoice(
    invoiceId: string,
    orgId: string,
    adminId: string
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `SET #isLocked = :isLocked, #lockedBy = :lockedBy, #lockedAt = :lockedAt, #updatedAt = :updatedAt`,
        ExpressionAttributeNames: {
            "#isLocked": "isLocked",
            "#lockedBy": "lockedBy",
            "#lockedAt": "lockedAt",
            "#updatedAt": "updatedAt"
        },
        ExpressionAttributeValues: {
            ":isLocked": true,
            ":lockedBy": adminId,
            ":lockedAt": new Date().toISOString(),
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Invoice locked: ${invoiceId}`);
    } catch (e) {
        console.error("Error locking invoice:", e);
        throw e;
    }
}

/**
 * Unlock an invoice (allow edits)
 * Only ADMIN role can unlock
 */
export async function unlockInvoice(
    invoiceId: string,
    orgId: string,
    adminId: string
): Promise<void> {
    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `SET #isLocked = :isLocked, #unlockedBy = :unlockedBy, #unlockedAt = :unlockedAt, #updatedAt = :updatedAt`,
        ExpressionAttributeNames: {
            "#isLocked": "isLocked",
            "#unlockedBy": "unlockedBy",
            "#unlockedAt": "unlockedAt",
            "#updatedAt": "updatedAt"
        },
        ExpressionAttributeValues: {
            ":isLocked": false,
            ":unlockedBy": adminId,
            ":unlockedAt": new Date().toISOString(),
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Invoice unlocked: ${invoiceId}`);
    } catch (e) {
        console.error("Error unlocking invoice:", e);
        throw e;
    }
}

/**
 * Update invoice payment status (for part payments)
 */
export async function updateInvoicePaymentStatus(
    invoiceId: string,
    orgId: string,
    paidAmount: number,
    paymentNotes?: string
): Promise<void> {
    const existing = await getPaymentRecord(invoiceId, orgId);
    if (!existing) throw new Error("Invoice not found");

    const previousPaid = existing.paidAmount || 0;
    const newPaidAmount = previousPaid + paidAmount;
    const balanceDue = Math.max(0, (existing.totalAmount || 0) - newPaidAmount);

    const newStatus = balanceDue === 0 ? "payment_verified" : "part_paid";

    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `COMPANY#${orgId}`,
            sk: `PAYMENT#${invoiceId}`
        },
        UpdateExpression: `
            SET #status = :status,
                #paidAmount = :paidAmount,
                #balanceDue = :balanceDue,
                #paymentNotes = :paymentNotes,
                #updatedAt = :updatedAt
        `,
        ExpressionAttributeNames: {
            "#status": "status",
            "#paidAmount": "paidAmount",
            "#balanceDue": "balanceDue",
            "#paymentNotes": "paymentNotes",
            "#updatedAt": "updatedAt"
        },
        ExpressionAttributeValues: {
            ":status": newStatus,
            ":paidAmount": newPaidAmount,
            ":balanceDue": balanceDue,
            ":paymentNotes": paymentNotes || null,
            ":updatedAt": new Date().toISOString()
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Invoice payment updated: ${invoiceId}, Paid: ₹${newPaidAmount}, Balance: ₹${balanceDue}`);

        // ✅ NEW: Unlock assessment/report based on payment percentage
        for (const item of existing?.items || []) {
            const engineName = item.engineName;
            // Skip installment items - handle only base engines
            if (!engineName.includes(" - Installment #")) {
                await unlockAccessByPaymentPercentage(invoiceId, orgId, engineName);
            }
        }
    } catch (e) {
        console.error("Error updating invoice payment:", e);
        throw e;
    }
}

/**
 * Unlock assessment/report based on payment percentage
 * 50% payment → Unlock Assessment
 * 100% payment → Unlock Report
 */
export async function unlockAccessByPaymentPercentage(
    invoiceId: string,
    orgId: string,
    engineName: string
): Promise<void> {
    try {
        // Get current payment record
        const paymentRecord = await getPaymentRecord(invoiceId, orgId);
        if (!paymentRecord) {
            console.warn(`No payment record found for ${invoiceId}`);
            return;
        }

        const totalAmount = paymentRecord.totalAmount || 0;
        const paidAmount = paymentRecord.paidAmount || 0;

        if (totalAmount <= 0) return;

        // Calculate payment percentage
        const paymentPercentage = (paidAmount / totalAmount) * 100;

        console.log(`💰 Payment Progress: ₹${paidAmount} / ₹${totalAmount} = ${paymentPercentage.toFixed(2)}%`);

        // Determine what to unlock
        const shouldUnlockAssessment = paymentPercentage >= 50;
        const shouldUnlockReport = paymentPercentage >= 100;

        if (!shouldUnlockAssessment && !shouldUnlockReport) {
            console.log(`⏳ Payment is ${paymentPercentage.toFixed(2)}% - waiting for 50% to unlock assessment`);
            return;
        }

        // Find and update the access record for this engine
        const scanCommand = new ScanCommand({
            TableName: USERS_TABLE,
            FilterExpression: "pk = :pk AND begins_with(sk, :sk) AND #engine = :engine",
            ExpressionAttributeNames: {
                "#engine": "engineName"
            },
            ExpressionAttributeValues: {
                ":pk": `COMPANY#${orgId}`,
                ":sk": "ENGINE_ACCESS#",
                ":engine": engineName
            }
        });

        const response = await ddbDocClient.send(scanCommand);
        const accessRecord = response.Items?.[0];

        if (!accessRecord) {
            console.warn(`No access record found for engine: ${engineName}`);
            return;
        }

        // Build update expression based on what needs to be unlocked
        let updateExpression = "SET #updatedAt = :updatedAt";
        const expressionValues: any = { ":updatedAt": new Date().toISOString() };
        const expressionNames: any = { "#updatedAt": "updatedAt" };

        if (shouldUnlockAssessment) {
            updateExpression += ", #assessmentUnlocked = :true, #assessmentUnlockedAt = :now";
            expressionNames["#assessmentUnlocked"] = "assessmentUnlocked";
            expressionNames["#assessmentUnlockedAt"] = "assessmentUnlockedAt";
            expressionValues[":true"] = true;
            expressionValues[":now"] = new Date().toISOString();
        }

        if (shouldUnlockReport) {
            updateExpression += ", #reportUnlocked = :true, #reportUnlockedAt = :now";
            expressionNames["#reportUnlocked"] = "reportUnlocked";
            expressionNames["#reportUnlockedAt"] = "reportUnlockedAt";
            expressionValues[":true"] = true;
            expressionValues[":now"] = new Date().toISOString();
        }

        const updateCommand = new UpdateCommand({
            TableName: USERS_TABLE,
            Key: {
                pk: accessRecord.pk,
                sk: accessRecord.sk
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeNames: expressionNames,
            ExpressionAttributeValues: expressionValues
        });

        await ddbDocClient.send(updateCommand);

        if (shouldUnlockAssessment) {
            console.log(`✅ [50% REACHED] Assessment unlocked for ${engineName}`);
        }
        if (shouldUnlockReport) {
            console.log(`✅ [100% REACHED] Report unlocked for ${engineName}`);
        }

    } catch (error) {
        console.error("Error unlocking access by payment percentage:", error);
        // Don't throw - this is non-critical
    }
}

/**
 * Clear all payment requests for a company (for testing)
 */
export async function clearAllPaymentRequests(orgId: string): Promise<void> {
    try {
        const payments = await getCompanyPayments(orgId);
        let clearedCount = 0;
        let preservedCount = 0;
        
        for (const payment of payments) {
            // ── PRESERVE approved request_based records ──
            // These records hold the installment plan definitions, HSN codes,
            // and split details configured by the admin. Wiping them causes
            // new invoices to lose this configuration data.
            const isApprovedRequestRecord =
                payment.workflowType === "request_based" &&
                (payment.status === "request_approved" ||
                 (Array.isArray(payment.installments) && payment.installments.length > 0));

            if (isApprovedRequestRecord) {
                console.log(`🛡️ Preserving approved request record ${payment.invoiceId} (engine: ${payment.engineName}, installments: ${payment.installments?.length || 0})`);
                
                // Reset only the installment statuses back to "unpaid" so the
                // plan can be re-used for a fresh payment cycle, but keep all
                // structural data (amounts, percentages, splitDetails, hsnCode)
                if (Array.isArray(payment.installments) && payment.installments.length > 0) {
                    const resetInstallments = payment.installments.map(inst => ({
                        ...inst,
                        status: "unpaid" as const,
                        paidAt: undefined,
                        paidAmount: undefined,
                    }));
                    
                    const resetCommand = new UpdateCommand({
                        TableName: USERS_TABLE,
                        Key: {
                            pk: `COMPANY#${orgId}`,
                            sk: `PAYMENT#${payment.invoiceId}`
                        },
                        UpdateExpression: `SET #installments = :installments, #currentInstallment = :currentInstallment, #updatedAt = :updatedAt`,
                        ExpressionAttributeNames: {
                            "#installments": "installments",
                            "#currentInstallment": "currentInstallment",
                            "#updatedAt": "updatedAt",
                        },
                        ExpressionAttributeValues: {
                            ":installments": resetInstallments,
                            ":currentInstallment": 1,
                            ":updatedAt": new Date().toISOString(),
                        }
                    });
                    
                    try {
                        await ddbDocClient.send(resetCommand);
                    } catch (e) {
                        console.error(`Error resetting installment statuses for ${payment.invoiceId}:`, e);
                    }
                }
                
                preservedCount++;
                continue;
            }
            
            // ── CLEAR all other records (transactional payments, pending/rejected requests) ──
            const command = new UpdateCommand({
                TableName: USERS_TABLE,
                Key: {
                    pk: `COMPANY#${orgId}`,
                    sk: `PAYMENT#${payment.invoiceId}`
                },
                UpdateExpression: `SET #status = :status, #updatedAt = :updatedAt, #totalAmount = :zero, #fullAmount = :zero, #paidAmount = :zero, #balanceDue = :zero, #approvedRequestedAmount = :zero, #approvedRequestedBaseAmount = :zero, #requestedBaseAmount = :zero, #requestedPaymentPercent = :zero, #items = :emptyItems, #installments = :emptyInstallments, #workflowType = :workflowType, #engineName = :emptyString, #requestNotes = :emptyString, #paymentType = :full`,
                ExpressionAttributeNames: {
                    "#status": "status",
                    "#updatedAt": "updatedAt",
                    "#totalAmount": "totalAmount",
                    "#fullAmount": "fullAmount",
                    "#paidAmount": "paidAmount",
                    "#balanceDue": "balanceDue",
                    "#approvedRequestedAmount": "approvedRequestedAmount",
                    "#approvedRequestedBaseAmount": "approvedRequestedBaseAmount",
                    "#requestedBaseAmount": "requestedBaseAmount",
                    "#requestedPaymentPercent": "requestedPaymentPercent",
                    "#items": "items",
                    "#installments": "installments",
                    "#workflowType": "workflowType",
                    "#engineName": "engineName",
                    "#requestNotes": "requestNotes",
                    "#paymentType": "paymentType",
                },
                ExpressionAttributeValues: {
                    ":status": "cleared",
                    ":updatedAt": new Date().toISOString(),
                    ":zero": 0,
                    ":emptyItems": [],
                    ":emptyInstallments": [],
                    ":workflowType": "standard",
                    ":emptyString": "",
                    ":full": "full",
                }
            });

            try {
                await ddbDocClient.send(command);
                clearedCount++;
            } catch (e) {
                console.error(`Error clearing payment ${payment.invoiceId}:`, e);
            }
        }

        console.log(`✅ Reset complete for company ${orgId}: cleared ${clearedCount} records, preserved ${preservedCount} approved request records`);
    } catch (error) {
        console.error("Error clearing payment requests:", error);
        throw error;
    }
}
