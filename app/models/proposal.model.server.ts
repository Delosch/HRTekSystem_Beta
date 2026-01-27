import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { PutCommand, GetCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const DYNAMODB_TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";
const ddbDocClient = getDynamoDBDocumentClient();

/**
 * Proposal Model
 * Handles transformation proposal storage and retrieval
 */

export interface ProposalPhase {
    name: string;
    duration: number; // in months
    deliverables: string[];
}

export interface Proposal {
    pk: string;
    sk: string;
    proposalId: string;
    companyId: string;
    status: "draft" | "sent" | "accepted" | "rejected";

    // Scope
    selectedEngines: string[];
    transformationScope: string;

    // Costing
    baseCost: number;
    additionalCosts: Array<{ item: string; cost: number }>;
    totalCost: number;
    currency: string;

    // Timeline
    estimatedDuration: number; // months
    phases: ProposalPhase[];

    // Metadata
    generatedAt: string;
    generatedBy: "system" | string;
    sentAt?: string;
    acceptedAt?: string;
    rejectedAt?: string;

    // Admin edits
    adminNotes?: string;
    customizations?: any;

    createdAt: string;
    updatedAt: string;
}

/**
 * Create proposal
 */
export async function createProposal(data: Omit<Proposal, "pk" | "sk" | "createdAt" | "updatedAt">): Promise<Proposal> {
    const now = new Date().toISOString();

    const proposal: Proposal = {
        ...data,
        pk: `COMPANY#${data.companyId}`,
        sk: `PROPOSAL#${data.proposalId}`,
        createdAt: now,
        updatedAt: now
    };

    await ddbDocClient.send(
        new PutCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Item: proposal
        })
    );

    return proposal;
}

/**
 * Get proposal by ID
 */
export async function getProposal(companyId: string, proposalId: string): Promise<Proposal | null> {
    const result = await ddbDocClient.send(
        new GetCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: {
                pk: `COMPANY#${companyId}`,
                sk: `PROPOSAL#${proposalId}`
            }
        })
    );

    return result.Item as Proposal || null;
}

/**
 * Get all proposals for a company
 */
export async function getCompanyProposals(companyId: string): Promise<Proposal[]> {
    const result = await ddbDocClient.send(
        new QueryCommand({
            TableName: DYNAMODB_TABLE_NAME,
            KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
            ExpressionAttributeValues: {
                ":pk": `COMPANY#${companyId}`,
                ":sk": "PROPOSAL#"
            }
        })
    );

    return (result.Items as Proposal[]) || [];
}

/**
 * Update proposal status
 */
export async function updateProposalStatus(
    companyId: string,
    proposalId: string,
    status: "sent" | "accepted" | "rejected"
): Promise<void> {
    const now = new Date().toISOString();
    const statusField = status === "sent" ? "sentAt" : status === "accepted" ? "acceptedAt" : "rejectedAt";

    await ddbDocClient.send(
        new UpdateCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: {
                pk: `COMPANY#${companyId}`,
                sk: `PROPOSAL#${proposalId}`
            },
            UpdateExpression: `SET #status = :status, ${statusField} = :now, updatedAt = :updated`,
            ExpressionAttributeNames: {
                "#status": "status"
            },
            ExpressionAttributeValues: {
                ":status": status,
                ":now": now,
                ":updated": now
            }
        })
    );
}

/**
 * Update proposal (for admin edits)
 */
export async function updateProposal(
    companyId: string,
    proposalId: string,
    updates: Partial<Proposal>
): Promise<void> {
    const now = new Date().toISOString();

    // Build update expression dynamically
    const updateExpressions: string[] = [];
    const expressionAttributeValues: any = { ":updated": now };
    const expressionAttributeNames: any = {};

    Object.entries(updates).forEach(([key, value]) => {
        if (key !== "pk" && key !== "sk" && key !== "proposalId" && key !== "companyId") {
            updateExpressions.push(`#${key} = :${key}`);
            expressionAttributeValues[`:${key}`] = value;
            expressionAttributeNames[`#${key}`] = key;
        }
    });

    if (updateExpressions.length === 0) return;

    updateExpressions.push("updatedAt = :updated");

    await ddbDocClient.send(
        new UpdateCommand({
            TableName: DYNAMODB_TABLE_NAME,
            Key: {
                pk: `COMPANY#${companyId}`,
                sk: `PROPOSAL#${proposalId}`
            },
            UpdateExpression: `SET ${updateExpressions.join(", ")}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues
        })
    );
}
