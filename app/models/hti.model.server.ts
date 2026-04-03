import { GetCommand, PutCommand, QueryCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { getLatestAnalysis } from "~/utils/analysis.server";
import { v4 as uuidv4 } from "uuid";

const TABLE_NAME = process.env.DYNAMODB_ASSESSMENTS_TABLE || process.env.DYNAMODB_TABLE_NAME || "b2b_platform";

let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;

try {
    ddbDocClient = getDynamoDBDocumentClient();
} catch (error) {
    console.error("CRITICAL: Failed to initialize DynamoDB for HTI");
    if (error instanceof Error) {
        console.error(`Details: ${error.message}`);
    }
    process.exit(1);
}

// ========================================
// TYPE DEFINITIONS
// ========================================

export type HTIApprovalStatus = "pending" | "approved" | "rejected" | "revision_requested";

export interface HTIEngineData {
    engineName: string;
    completedAt?: string;
    progress: number;
    responses?: Record<string, any>;
    aiAnalysis?: any;
    scores?: Record<string, number>;
    // AI-generated analysis report text (from ANALYSIS# records)
    aiReport?: string;
}

export interface HTIAggregatedInput {
    companyId: string;
    timestamp: string;
    engines: {
        maturity?: HTIEngineData;
        roadmap?: HTIEngineData;
        vendor?: HTIEngineData;
        vendorFit?: HTIEngineData;
        change?: HTIEngineData;
        changeManagement?: HTIEngineData;
        sharedServices?: HTIEngineData;
    };
    completedEnginesCount: number;
    totalEngines: number;
}

export interface HTIAdvisoryContent {
    executiveSummary: string; // Brief overview (1-2 pages)
    detailedSections?: Array<{
        title: string;
        content: string; // Rich HTML content for this specific chapter
    }>;
    currentState: {
        maturityLevel?: string;
        digitalReadiness?: string;
        keyGaps: string[];
        strengths: string[];
    };
    recommendations: {
        now: string[];
        next: string[];
        later: string[];
    };
    riskFlags: Array<{
        risk: string;
        mitigation: string;
    }>;
    dependencies: string[];
    avoidNow: string[];
    successMetrics?: string[];
    recommendedPricing?: {
        tierName: string;
        priceINR: string;
        priceUSD: string;
    };
    // Structured scores (0-100)
    transformationReadinessScore?: number;
    riskExposureIndex?: number;
    confidenceScore?: number;
    // Per-engine capability heatmap
    capabilityHeatmap?: Array<{
        engine: string;
        score: number;
        status: "strong" | "moderate" | "critical";
    }>;
    // Transformation priority matrix (impact vs effort)
    priorityMatrix?: Array<{
        initiative: string;
        impact: number;  // 1-10
        effort: number;  // 1-10
        timeframe: "now" | "next" | "later";
        category: string;
    }>;
    // Structured "do not transform yet" flags
    doNotTransformNow?: Array<{
        area: string;
        reason: string;
        category: "organizational" | "financial" | "technical" | "cultural";
        revisitIn?: string;
    }>;
    // Audit trail
    auditTrail?: Array<{
        timestamp: string;
        action: string;
        details: string;
    }>;
}

export interface HTIAdvisoryReport {
    pk: string; // COMPANY#{companyId}
    sk: string; // HTI_REPORT#{timestamp}

    reportId: string;
    companyId: string;

    status: HTIApprovalStatus;

    generatedAt: string;
    generatedBy: string;

    approvedAt?: string;
    approvedBy?: string;
    adminNotes?: string;

    // Lock/Unlock functionality
    isLocked?: boolean;  // true = visible to users, false = admin editing
    lockedAt?: string;   // timestamp when locked
    lockedBy?: string;   // admin who locked it

    advisory: HTIAdvisoryContent;

    inputData: HTIAggregatedInput;

    llmModel: string;
    llmTokensUsed?: number;
}

// ========================================
// DATA AGGREGATION
// ========================================

// Maps engine names to the section strings used in ANALYSIS# records
const ENGINE_ANALYSIS_SECTION_MAP: Record<string, string> = {
    "HR Technology Maturity Analysis": "AI Maturity Assessment",
    "HR Transformation Roadmap Generator": "Digital Roadmap",
    "Cognitive HCM Vendor Fit": "Vendor Fit Assessment",
    "HCM Vendor Fit Engine": "Vendor Fit Assessment",
    "Intelligent Change Management": "Change Management Assessment",
    "Shared Service Designer": "Shared Services Assessment",
};

/**
 * Attach AI-generated analysis report text to engine data
 */
async function attachAIReport(companyId: string, engineData: HTIEngineData): Promise<HTIEngineData> {
    const sectionName = ENGINE_ANALYSIS_SECTION_MAP[engineData.engineName];
    if (!sectionName) return engineData;
    try {
        const analysisRecord = await getLatestAnalysis(companyId, sectionName);
        if (analysisRecord && analysisRecord.analysis) {
            engineData.aiReport = typeof analysisRecord.analysis === "string"
                ? analysisRecord.analysis
                : JSON.stringify(analysisRecord.analysis);
        }
    } catch (err) {
        console.warn(`Could not fetch AI report for ${engineData.engineName}:`, err);
    }
    return engineData;
}

/**
 * Aggregate data from all 5 HR engines for a company
 * Fetches both raw engine scores/responses AND AI-generated analysis reports
 */
export async function aggregateEngineData(companyId: string): Promise<HTIAggregatedInput> {
    const engineNames = [
        "HR Technology Maturity Analysis",
        "HR Transformation Roadmap Generator",
        "Cognitive HCM Vendor Fit",
        "Intelligent Change Management",
        "Shared Service Designer"
    ];

    const engineDataPromises = engineNames.map(name => getEngineData(companyId, name));
    const engineResults = await Promise.all(engineDataPromises);

    const aggregated: HTIAggregatedInput = {
        companyId,
        timestamp: new Date().toISOString(),
        engines: {},
        completedEnginesCount: 0,
        totalEngines: engineNames.length
    };

    // Map results to structured format and attach AI reports
    if (engineResults[0]) {
        aggregated.engines.maturity = await attachAIReport(companyId, engineResults[0]);
        if (engineResults[0].progress === 100) aggregated.completedEnginesCount++;
    }
    if (engineResults[1]) {
        aggregated.engines.roadmap = await attachAIReport(companyId, engineResults[1]);
        if (engineResults[1].progress === 100) aggregated.completedEnginesCount++;
    }

    // Handle Vendor Fit (Aliasing check)
    if (engineResults[2]) {
        aggregated.engines.vendor = await attachAIReport(companyId, engineResults[2]);
        if (engineResults[2].progress === 100) aggregated.completedEnginesCount++;
    } else {
        // Fallback: Try fetching with the actual DB name "HCM Vendor Fit Engine"
        const altVendorData = await getEngineData(companyId, "HCM Vendor Fit Engine");
        if (altVendorData) {
            altVendorData.engineName = "Cognitive HCM Vendor Fit";
            aggregated.engines.vendor = await attachAIReport(companyId, altVendorData);
            if (altVendorData.progress === 100) aggregated.completedEnginesCount++;
        }
    }

    if (engineResults[3]) {
        aggregated.engines.change = await attachAIReport(companyId, engineResults[3]);
        if (engineResults[3].progress === 100) aggregated.completedEnginesCount++;
    }
    if (engineResults[4]) {
        aggregated.engines.sharedServices = await attachAIReport(companyId, engineResults[4]);
        if (engineResults[4].progress === 100) aggregated.completedEnginesCount++;
    }

    return aggregated;
}

/**
 * Get engine data for a specific company and engine
 */
async function getEngineData(companyId: string, engineName: string): Promise<HTIEngineData | null> {
    try {
        // Try with ENGINE# prefix first (new format)
        let result = await ddbDocClient.send(
            new GetCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: `COMPANY#${companyId.replace("COMPANY#", "")}`,
                    sk: `ENGINE#${engineName}`
                }
            })
        );

        // If not found, try without prefix (legacy format)
        if (!result.Item) {
            result = await ddbDocClient.send(
                new GetCommand({
                    TableName: TABLE_NAME,
                    Key: {
                        pk: `COMPANY#${companyId.replace("COMPANY#", "")}`,
                        sk: engineName
                    }
                })
            );
        }

        if (!result.Item) {
            console.log(`⚠️ Engine data not found for: ${engineName}`);
            return null;
        }

        console.log(`✅ Found engine data for: ${engineName} (progress: ${result.Item.progress}%)`);

        return {
            engineName,
            completedAt: result.Item.completedAt,
            progress: result.Item.progress || 0,
            responses: result.Item.responses,
            aiAnalysis: result.Item.aiAnalysis,
            scores: result.Item.scores
        };
    } catch (error) {
        console.error(`Error fetching engine data for ${engineName}:`, error);
        return null;
    }
}

// ========================================
// ADVISORY REPORT OPERATIONS
// ========================================

/**
 * Save a new HTI advisory report
 */
export async function saveAdvisoryReport(
    companyId: string,
    generatedBy: string,
    advisory: HTIAdvisoryContent,
    inputData: HTIAggregatedInput,
    llmModel: string = "deepseek.v3-v1:0"
): Promise<string> {
    const reportId = `hti_${uuidv4()}`;
    const timestamp = new Date().toISOString();

    const report: HTIAdvisoryReport = {
        pk: `COMPANY#${companyId}`,
        sk: `HTI_REPORT#${timestamp}`,
        reportId,
        companyId,
        status: "pending",
        generatedAt: timestamp,
        generatedBy,
        advisory,
        inputData,
        llmModel
    };

    await ddbDocClient.send(
        new PutCommand({
            TableName: TABLE_NAME,
            Item: report
        })
    );

    console.log(`✅ HTI Advisory Report saved: ${reportId}`);
    return reportId;
}

/**
 * Get a specific advisory report
 */
export async function getAdvisoryReport(
    companyId: string,
    reportId: string
): Promise<HTIAdvisoryReport | null> {
    try {
        // Query by reportId (need to scan or use GSI in production)
        const result = await ddbDocClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
                FilterExpression: "reportId = :reportId",
                ExpressionAttributeValues: {
                    ":pk": `COMPANY#${companyId}`,
                    ":sk": "HTI_REPORT#",
                    ":reportId": reportId
                }
            })
        );

        if (!result.Items || result.Items.length === 0) {
            return null;
        }

        return result.Items[0] as HTIAdvisoryReport;
    } catch (error) {
        console.error(`Error fetching advisory report ${reportId}:`, error);
        return null;
    }
}

/**
 * Get all advisory reports for a company
 */
export async function getCompanyAdvisories(companyId: string): Promise<HTIAdvisoryReport[]> {
    try {
        const result = await ddbDocClient.send(
            new QueryCommand({
                TableName: TABLE_NAME,
                KeyConditionExpression: "pk = :pk AND begins_with(sk, :sk)",
                ExpressionAttributeValues: {
                    ":pk": `COMPANY#${companyId}`,
                    ":sk": "HTI_REPORT#"
                },
                ScanIndexForward: false, // Most recent first
                ConsistentRead: true
            })
        );

        return (result.Items || []) as HTIAdvisoryReport[];
    } catch (error) {
        console.error(`Error fetching company advisories for ${companyId}:`, error);
        return [];
    }
}

/**
 * Get all pending approvals (admin function)
 * Uses paginated scan to ensure all records are returned regardless of table size.
 */
export async function getPendingApprovals(): Promise<HTIAdvisoryReport[]> {
    try {
        const allItems: any[] = [];
        let lastEvaluatedKey: Record<string, any> | undefined = undefined;

        do {
            const result: any = await ddbDocClient.send(
                new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "begins_with(#sk, :prefix) AND #status = :status",
                    ExpressionAttributeNames: {
                        "#sk": "sk",
                        "#status": "status"
                    },
                    ExpressionAttributeValues: {
                        ":prefix": "HTI_REPORT#",
                        ":status": "pending"
                    },
                    ...(lastEvaluatedKey ? { ExclusiveStartKey: lastEvaluatedKey } : {})
                })
            );
            allItems.push(...(result.Items || []));
            lastEvaluatedKey = result.LastEvaluatedKey;
        } while (lastEvaluatedKey);

        console.log(`📊 Found ${allItems.length} pending HTI reports`);
        return allItems as HTIAdvisoryReport[];
    } catch (error) {
        console.error("Error fetching pending approvals:", error);
        return [];
    }
}

/**
 * Get ALL HTI reports across all companies (admin function - for stats)
 */
export async function getAllHTIReports(): Promise<HTIAdvisoryReport[]> {
    try {
        const allItems: any[] = [];
        let lastEvaluatedKey: Record<string, any> | undefined = undefined;

        do {
            const result: any = await ddbDocClient.send(
                new ScanCommand({
                    TableName: TABLE_NAME,
                    FilterExpression: "begins_with(#sk, :prefix)",
                    ExpressionAttributeNames: {
                        "#sk": "sk"
                    },
                    ExpressionAttributeValues: {
                        ":prefix": "HTI_REPORT#"
                    },
                    ...(lastEvaluatedKey ? { ExclusiveStartKey: lastEvaluatedKey } : {})
                })
            );
            allItems.push(...(result.Items || []));
            lastEvaluatedKey = result.LastEvaluatedKey;
        } while (lastEvaluatedKey);

        console.log(`📊 Found ${allItems.length} total HTI reports`);
        return allItems as HTIAdvisoryReport[];
    } catch (error) {
        console.error("Error fetching all HTI reports:", error);
        return [];
    }
}

/**
 * Update approval status of an advisory report
 */
export async function updateApprovalStatus(
    companyId: string,
    reportId: string,
    status: HTIApprovalStatus,
    adminId: string,
    adminNotes?: string
): Promise<boolean> {
    try {
        // First, get the report to find its sk
        const report = await getAdvisoryReport(companyId, reportId);
        if (!report) {
            console.error(`Report ${reportId} not found`);
            return false;
        }

        const updateExpression =
            "SET #status = :status, approvedBy = :adminId, approvedAt = :timestamp" +
            (status === "approved" ? ", isLocked = :locked" : "") +
            (adminNotes ? ", adminNotes = :notes" : "");

        const expressionAttributeValues: Record<string, any> = {
            ":status": status,
            ":adminId": adminId,
            ":timestamp": new Date().toISOString()
        };

        // Auto-lock when approving
        if (status === "approved") {
            expressionAttributeValues[":locked"] = true;
        }

        if (adminNotes) {
            expressionAttributeValues[":notes"] = adminNotes;
        }

        await ddbDocClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: report.pk,
                    sk: report.sk
                },
                UpdateExpression: updateExpression,
                ExpressionAttributeNames: {
                    "#status": "status"
                },
                ExpressionAttributeValues: expressionAttributeValues
            })
        );

        console.log(`✅ Advisory ${reportId} status updated to: ${status}`);
        return true;
    } catch (error) {
        console.error(`Error updating approval status for ${reportId}:`, error);
        return false;
    }
}

/**
 * Update advisory content (for admin editing)
 */
export async function updateAdvisoryContent(
    companyId: string,
    reportId: string,
    advisory: HTIAdvisoryContent
): Promise<{ success: boolean; error?: string }> {
    try {
        // First, get the report to find its sk
        const report = await getAdvisoryReport(companyId, reportId);
        if (!report) {
            return { success: false, error: "Report not found" };
        }

        // Check if report is locked (no edits allowed when locked)
        if (report.status === "approved" && report.isLocked) {
            return { success: false, error: "Report is locked. Unlock it first to edit." };
        }

        await ddbDocClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: `COMPANY#${companyId}`,
                    sk: report.sk
                },
                UpdateExpression: "SET advisory = :advisory, updatedAt = :timestamp",
                ExpressionAttributeValues: {
                    ":advisory": advisory,
                    ":timestamp": new Date().toISOString()
                }
            })
        );

        console.log(`✅ Updated advisory content for report: ${reportId}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating advisory content:", error);
        return { success: false, error: "Failed to update advisory content" };
    }
}

/**
 * Get latest approved advisory for a company
 */
export async function getLatestApprovedAdvisory(companyId: string): Promise<HTIAdvisoryReport | null> {
    const advisories = await getCompanyAdvisories(companyId);
    const approved = advisories.filter(a => a.status === "approved");

    if (approved.length === 0) {
        return null;
    }

    // Already sorted by most recent first
    return approved[0];
}

/**
 * Lock report (make visible to users)
 */
export async function lockReport(
    companyId: string,
    reportId: string,
    adminId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const report = await getAdvisoryReport(companyId, reportId);
        if (!report) {
            return { success: false, error: "Report not found" };
        }

        if (report.status !== "approved") {
            return { success: false, error: "Only approved reports can be locked" };
        }

        await ddbDocClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: report.pk,
                    sk: report.sk
                },
                UpdateExpression: "SET isLocked = :locked, lockedAt = :timestamp, lockedBy = :adminId",
                ExpressionAttributeValues: {
                    ":locked": true,
                    ":timestamp": new Date().toISOString(),
                    ":adminId": adminId
                }
            })
        );

        console.log(`✅ Report ${reportId} locked by ${adminId}`);
        return { success: true };
    } catch (error) {
        console.error(`Error locking report ${reportId}:`, error);
        return { success: false, error: "Failed to lock report" };
    }
}

/**
 * Unlock report (hide from users, allow editing)
 */
export async function unlockReport(
    companyId: string,
    reportId: string,
    adminId: string
): Promise<{ success: boolean; error?: string }> {
    try {
        const report = await getAdvisoryReport(companyId, reportId);
        if (!report) {
            return { success: false, error: "Report not found" };
        }

        if (report.status !== "approved") {
            return { success: false, error: "Only approved reports can be unlocked" };
        }

        await ddbDocClient.send(
            new UpdateCommand({
                TableName: TABLE_NAME,
                Key: {
                    pk: report.pk,
                    sk: report.sk
                },
                UpdateExpression: "SET isLocked = :locked, lockedAt = :timestamp, lockedBy = :adminId",
                ExpressionAttributeValues: {
                    ":locked": false,
                    ":timestamp": new Date().toISOString(),
                    ":adminId": adminId
                }
            })
        );

        console.log(`✅ Report ${reportId} unlocked by ${adminId}`);
        return { success: true };
    } catch (error) {
        console.error(`Error unlocking report ${reportId}:`, error);
        return { success: false, error: "Failed to unlock report" };
    }
}

