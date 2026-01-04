import { PutCommand, QueryCommand, GetCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;

const USERS_TABLE = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

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
    | "completed";           // All done

export type PaymentMethod = "bank_transfer" | "upi" | "qr_code";

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
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    items: Array<{
        engineName: string;
        price: number;
        description: string;
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
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

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
        status: "pending_payment",
        invoiceNumber,
        invoiceDate,
        dueDate,
        items: cartItems.map(item => ({
            engineName: item.productName,
            price: item.price,
            description: `HR Digital Transformation - ${item.productName}`
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
        console.log(`Invoice generated: ${invoiceNumber} for company ${orgId}`);
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
          verificationNotes = :verificationNotes,
          updatedAt = :updatedAt
    `,
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": "payment_verified",
            ":verifiedBy": adminId,
            ":verifiedAt": new Date().toISOString(),
            ":verificationNotes": verificationNotes || null,
            ":updatedAt": new Date().toISOString()
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
 */
export async function getPendingPaymentVerifications(): Promise<PaymentRecord[]> {
    // TODO: Create GSI on status field for better performance
    // For now, using Scan with filter (works but slower for large datasets)

    const command = new ScanCommand({
        TableName: USERS_TABLE,
        FilterExpression: "#status = :status AND begins_with(sk, :skPrefix)",
        ExpressionAttributeNames: {
            "#status": "status"
        },
        ExpressionAttributeValues: {
            ":status": "payment_submitted",
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
 */
export async function hasVerifiedPaymentForEngines(
    orgId: string,
    engineNames: string[]
): Promise<boolean> {
    const payments = await getCompanyPayments(orgId);

    const verifiedPayments = payments.filter(p => p.status === "payment_verified");
    const paidEngines = new Set(
        verifiedPayments.flatMap(p => p.items.map(item => item.engineName))
    );

    return engineNames.every(engine => paidEngines.has(engine));
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

