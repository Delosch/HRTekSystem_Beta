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
    | "payment_verified"     // Admin verified payment
    | "payment_rejected"     // Payment proof rejected
    | "completed"            // All done
    | "request_pending_approval"
    | "request_approved"
    | "request_rejected";

export type PaymentMethod = "bank_transfer" | "upi" | "qr_code";
export type InvoiceKind = "PROFORMA" | "FINAL";

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
}

export interface EngineAccessStatus {
    engineName: string;
    requestStatus: "none" | "pending" | "approved" | "rejected";
    assessmentUnlocked: boolean;
    reportUnlocked: boolean;
    approvedRequestedAmount: number;
    approvedRequestedBaseAmount: number;
    totalPaidAmount: number;
    fullAmount: number;
    pendingAmount: number;
    employeeCount: number | null;
    requestRecord: PaymentRecord | null;
}

function normalizeEngineName(name: string): string {
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
    requestedPercent: number;
    requestNotes?: string;
}): Promise<PaymentRecord> {
    const now = new Date().toISOString();
    const proformaInvoiceNumber = `PFI-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const percent = Math.min(100, Math.max(1, Math.round(params.requestedPercent)));
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
    const payments = await getCompanyPayments(orgId);
    const enginePayments = payments.filter((payment) => {
        if (normalizeEngineName(payment.engineName || "") === normalizedEngine) {
            return true;
        }
        return (payment.items || []).some(
            (item) => normalizeEngineName(item.engineName || "") === normalizedEngine
        );
    });

    const requestRecords = enginePayments
        .filter((payment) => payment.workflowType === "request_based")
        .sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());

    const latestRequest = requestRecords[0] || null;
    const requestStatus = mapRequestStatus(latestRequest?.status);

    const approvedRequestedAmount = Number(
        latestRequest?.approvedRequestedAmount ?? latestRequest?.totalAmount ?? 0
    );
    const approvedRequestedBaseAmount = Number(
        latestRequest?.approvedRequestedBaseAmount ?? latestRequest?.requestedBaseAmount ?? latestRequest?.subtotal ?? 0
    );

    const fullAmount = Number(latestRequest?.fullAmount || 0);
    const employeeCount = typeof latestRequest?.employeeCount === "number" ? latestRequest.employeeCount : null;

    const verifiedPayments = enginePayments.filter(
        (payment) => payment.status === "payment_verified" || payment.status === "completed"
    );

    const totalPaidAmount = verifiedPayments.reduce((sum, payment) => {
        const matchingItems = (payment.items || []).filter(
            (item) => normalizeEngineName(item.engineName || "") === normalizedEngine
        );

        if (matchingItems.length === 0) {
            return sum;
        }

        if ((payment.items || []).length === 1) {
            return sum + Number(payment.totalAmount || 0);
        }

        return sum + matchingItems.reduce((itemSum, item) => itemSum + getItemGrossAmount(item), 0);
    }, 0);

    const hasLegacyPaid = totalPaidAmount > 0 && !latestRequest;
    const assessmentUnlocked = hasLegacyPaid || (requestStatus === "approved" && totalPaidAmount >= approvedRequestedAmount);
    const reportUnlocked = hasLegacyPaid || (fullAmount > 0 && totalPaidAmount >= fullAmount);
    const pendingAmount = Math.max(0, (fullAmount || approvedRequestedAmount) - totalPaidAmount);

    return {
        engineName,
        requestStatus,
        assessmentUnlocked,
        reportUnlocked,
        approvedRequestedAmount,
        approvedRequestedBaseAmount,
        totalPaidAmount,
        fullAmount,
        pendingAmount,
        employeeCount,
        requestRecord: latestRequest,
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
    const proformaInvoiceNumber = `PFI-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

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
        createdAt: invoiceDate,
        updatedAt: invoiceDate
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
    const existing = await getPaymentRecord(invoiceId, orgId);
    const finalizedAt = new Date().toISOString();
    const finalInvoiceNumber = `FIN-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

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
            "#verifiedBy": "verifiedBy",
            "#verifiedAt": "verifiedAt",
            "#verificationNotes": "verificationNotes",
            "#updatedAt": "updatedAt",
            "#invoiceKind": "invoiceKind",
            "#finalInvoiceNumber": "finalInvoiceNumber",
            "#finalInvoiceDate": "finalInvoiceDate",
            "#invoiceNumber": "invoiceNumber",
            "#invoiceDate": "invoiceDate",
            "#proformaInvoiceNumber": "proformaInvoiceNumber",
        },
        ExpressionAttributeValues: {
            ":status": "payment_verified",
            ":verifiedBy": adminId,
            ":verifiedAt": finalizedAt,
            ":verificationNotes": verificationNotes || null,
            ":updatedAt": finalizedAt,
            ":invoiceKind": "FINAL",
            ":finalInvoiceNumber": finalInvoiceNumber,
            ":finalInvoiceDate": finalizedAt,
            ":invoiceNumber": finalInvoiceNumber,
            ":invoiceDate": finalizedAt,
            ":proformaInvoiceNumber": existing?.proformaInvoiceNumber || existing?.invoiceNumber || null,
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Payment verified for invoice ${invoiceId} by admin ${adminId}`);

        // Auto-approve all pending reports for this company
        await autoApproveCompanyReports(orgId);
        console.log(`✅ Auto-approved all reports for company ${orgId} after payment verification`);
    } catch (e) {
        console.error("Error verifying payment:", e);
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
    } catch (e) {
        console.error("Error rejecting payment:", e);
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
                paidEngines.add(item.engineName.trim());
            }
        });
    });

    return engineNames.every(engine => paidEngines.has(engine.trim()));
}

/**
 * Get list of verified paid engines for a company
 */
export async function getVerifiedPaidEngines(orgId: string): Promise<string[]> {
    const payments = await getCompanyPayments(orgId);

    const verifiedPayments = payments.filter(p => p.status === "payment_verified");
    const paidEngines = new Set(
        verifiedPayments.flatMap(p => p.items.map(item => item.engineName))
    );

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
        
        const engineItem = p.items?.find(i => i.engineName.trim() === engineName.trim());
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
        p.items?.some(i => i.engineName.trim() === engineName.trim())
    );

    if (pendingPayment) {
        return { status: "pending", record: pendingPayment };
    }

    // Check for rejected payment (so they can try again)
    const rejectedPayment = payments.find(p => 
        p.status === "payment_rejected" && 
        p.items?.some(i => i.engineName.trim() === engineName.trim())
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

