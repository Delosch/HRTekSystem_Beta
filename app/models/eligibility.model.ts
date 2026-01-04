import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { completedEngine } from "./engine.model";
import { hasVerifiedPaymentForEngines } from "./payment.model";

const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";
const ddbDocClient = getDynamoDBDocumentClient();

/**
 * Eligibility Model
 * Handles DynamoDB operations for transformation eligibility tracking
 */

export interface EligibilityRecord {
    pk: string;
    sk: string;
    isEligible: boolean;
    completedEngines: string[];
    paidEngines: string[];
    eligibilityDate?: string;
    minimumEnginesRequired: number;
    createdAt: string;
    updatedAt: string;
}

/**
 * Create or update eligibility record
 */
export async function createEligibilityRecord(
    companyId: string,
    data: Partial<EligibilityRecord>
): Promise<EligibilityRecord> {
    const now = new Date().toISOString();

    const record: EligibilityRecord = {
        pk: `COMPANY#${companyId}`,
        sk: "ELIGIBILITY#TRANSFORMATION",
        isEligible: data.isEligible || false,
        completedEngines: data.completedEngines || [],
        paidEngines: data.paidEngines || [],
        eligibilityDate: data.isEligible ? now : undefined,
        minimumEnginesRequired: 3,
        createdAt: data.createdAt || now,
        updatedAt: now
    };

    await ddbDocClient.send(
        new PutCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Item: record
        })
    );

    return record;
}

/**
 * Update eligibility status
 */
export async function updateEligibilityStatus(
    companyId: string,
    status: {
        isEligible: boolean;
        completedEngines: string[];
        paidEngines: string[];
    }
): Promise<void> {
    const now = new Date().toISOString();

    await ddbDocClient.send(
        new UpdateCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: {
                pk: `COMPANY#${companyId}`,
                sk: "ELIGIBILITY#TRANSFORMATION"
            },
            UpdateExpression: "SET isEligible = :eligible, completedEngines = :completed, paidEngines = :paid, updatedAt = :updated, eligibilityDate = :eligDate",
            ExpressionAttributeValues: {
                ":eligible": status.isEligible,
                ":completed": status.completedEngines,
                ":paid": status.paidEngines,
                ":updated": now,
                ":eligDate": status.isEligible ? now : null
            }
        })
    );
}

/**
 * Get eligibility record for a company
 */
export async function getEligibilityRecord(
    companyId: string
): Promise<EligibilityRecord | null> {
    const result = await ddbDocClient.send(
        new GetCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: {
                pk: `COMPANY#${companyId}`,
                sk: "ELIGIBILITY#TRANSFORMATION"
            }
        })
    );

    return result.Item as EligibilityRecord || null;
}

/**
 * Check if company meets eligibility criteria
 */
export async function checkEligibility(companyId: string): Promise<{
    eligible: boolean;
    completedEngines: string[];
    paidEngines: string[];
    completedCount: number;
    paidCount: number;
    missingRequirements: string[];
}> {
    // Get completed engines
    const completedEngines = await completedEngine(companyId);

    // Check which engines have verified payment
    const paidEngines: string[] = [];
    for (const engineName of completedEngines) {
        const hasPaid = await hasVerifiedPaymentForEngines(companyId, [engineName]);
        if (hasPaid) {
            paidEngines.push(engineName);
        }
    }

    const completedCount = completedEngines.length;
    const paidCount = paidEngines.length;
    const minimumRequired = 3;

    const missingRequirements: string[] = [];

    if (completedCount < minimumRequired) {
        missingRequirements.push(`Complete ${minimumRequired - completedCount} more engine(s)`);
    }

    if (paidCount < minimumRequired) {
        missingRequirements.push(`Payment verification needed for ${minimumRequired - paidCount} engine(s)`);
    }

    const eligible = completedCount >= minimumRequired && paidCount >= minimumRequired;

    return {
        eligible,
        completedEngines,
        paidEngines,
        completedCount,
        paidCount,
        missingRequirements
    };
}
