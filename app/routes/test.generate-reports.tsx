import { json, LoaderFunction } from "@remix-run/node";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

export const loader: LoaderFunction = async () => {
    const ddbDocClient = getDynamoDBDocumentClient();
    const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "b2b_platform";
    const timestamp = new Date().toISOString();

    // Sample Company ID (we'll attach reports to this ID)
    // You can replace this with a real company ID from your DB if you want specific mapping
    const SAMPLE_COMPANY_ID = "company_" + Date.now();

    // 1. Create a dummy company profile so names show up
    const companyProfile = {
        pk: `COMPANY#${SAMPLE_COMPANY_ID}`,
        sk: "PROFILE",
        company_name: "Demo Corp International",
        industry: "Technology",
        size: "1000-5000",
        createdAt: timestamp,
        type: "company"
    };

    // 2. Sample Reports
    const sampleReports = [
        {
            pk: `COMPANY#${SAMPLE_COMPANY_ID}`,
            sk: `ANALYSIS#${new Date(Date.now() - 86400000).toISOString()}`, // 1 day ago
            section: "HR Technology Maturity Analysis",
            status: "approved",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            assessment_id: "test-assessment-maturity-001",
            result: {
                executive_summary: "The organization demonstrates a 'Defined' level of HR technology maturity. Core systems are in place, but integration is limited.",
                key_strengths: [
                    "Strong foundational HRIS implementation",
                    "Digital payroll processing",
                    "Basic employee self-service adoption"
                ],
                critical_gaps: [
                    "Lack of unified data analytics",
                    "Manual performance management processes",
                    "Disparate recruiting tools"
                ],
                strategic_recommendations: "Prioritize the implementation of an integration layer to connect core HRIS with talent management systems."
            }
        },
        {
            pk: `COMPANY#${SAMPLE_COMPANY_ID}`,
            sk: `ANALYSIS#${new Date(Date.now() - 172800000).toISOString()}`, // 2 days ago
            section: "HR Transformation Roadmap Generator",
            status: "approved",
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            assessment_id: "test-assessment-roadmap-002",
            result: {
                roadmap_overview: "A 18-month transformation roadmap focusing on cloud migration and employee experience enhancement.",
                phase_1_immediate: "Q1-Q2: Cloud HRIS Migration and Data Cleansing",
                phase_2_medium_term: "Q3-Q4: Talent Management Suite Implementation",
                phase_3_long_term: "Year 2: AI-driven People Analytics & Predictive Modeling",
                estimated_roi: "Expected 25% reduction in administrative overhead within 12 months."
            }
        },
        {
            pk: `COMPANY#${SAMPLE_COMPANY_ID}`,
            sk: `ANALYSIS#${new Date().toISOString()}`, // Just now
            section: "HCM Vendor Fit Engine",
            status: "pending", // One pending report to test status badges
            createdAt: new Date().toISOString(),
            assessment_id: "test-assessment-vendor-003",
            result: {
                vendor_analysis: "Based on requirements for scalability and global compliance, Tier 1 vendors are recommended.",
                top_matches: [
                    "Workday HCM",
                    "SAP SuccessFactors",
                    "Oracle HCM Cloud"
                ],
                fit_score: {
                    "Workday": 92,
                    "SAP": 88,
                    "Oracle": 85
                },
                recommendation: "Workday is the primary recommendation due to superior user experience ratings and unified architecture."
            }
        }
    ];

    try {
        // Insert Company
        await ddbDocClient.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: companyProfile
        }));

        // Insert Reports
        for (const report of sampleReports) {
            await ddbDocClient.send(new PutCommand({
                TableName: TABLE_NAME,
                Item: report
            }));
        }

        return json({
            success: true,
            message: "Successfully generated 3 test reports and 1 test company.",
            companyId: SAMPLE_COMPANY_ID,
            reportsCreated: sampleReports.length
        });

    } catch (error) {
        console.error("Failed to generate test reports:", error);
        return json({
            success: false,
            message: "Failed to generate reports",
            error: String(error)
        }, { status: 500 });
    }
};

export default function GenReports() {
    return (
        <div className="p-10 font-sans">
            <h1 className="text-2xl font-bold mb-4">Generating Test Data...</h1>
            <p>If this page loads successfully, check the JSON response above.</p>
        </div>
    );
}
