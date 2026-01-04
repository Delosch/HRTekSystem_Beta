import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getPendingPaymentVerifications } from "~/models/payment.model";

/**
 * Fetches real dashboard statistics from DynamoDB
 */
export async function getDashboardStats() {
    const ddbDocClient = getDynamoDBDocumentClient();
    const tableName = process.env.DYNAMODB_TABLE_NAME;

    let totalCompanies = 0;
    let totalUsers = 0;
    let activeAssessments = 0;
    let pendingPayments = 0;
    let pendingInvoices = 0;

    try {
        // Count companies (pk starts with COMPANY#)
        const companiesCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :companyPrefix)",
            ExpressionAttributeValues: {
                ":companyPrefix": "COMPANY#"
            },
            Select: "COUNT"
        });
        const companiesResult = await ddbDocClient.send(companiesCommand);
        totalCompanies = companiesResult.Count || 0;

        // Count users (pk starts with USER#)
        const usersCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :userPrefix)",
            ExpressionAttributeValues: {
                ":userPrefix": "USER#"
            },
            Select: "COUNT"
        });
        const usersResult = await ddbDocClient.send(usersCommand);
        totalUsers = usersResult.Count || 0;

        // Count active assessments (you may need to adjust this based on your schema)
        const assessmentsCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :assessmentPrefix)",
            ExpressionAttributeValues: {
                ":assessmentPrefix": "ASSESSMENT#"
            },
            Select: "COUNT"
        });
        const assessmentsResult = await ddbDocClient.send(assessmentsCommand);
        activeAssessments = assessmentsResult.Count || 0;

        // Get pending payments
        const pendingPaymentsList = await getPendingPaymentVerifications();
        pendingPayments = pendingPaymentsList.length;

        // Count pending invoices
        const invoicesCommand = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :invoicePrefix)",
            ExpressionAttributeValues: {
                ":invoicePrefix": "INVOICE#"
            },
            Select: "COUNT"
        });
        const invoicesResult = await ddbDocClient.send(invoicesCommand);
        pendingInvoices = invoicesResult.Count || 0;

        console.log(`📊 Real Dashboard Stats from DynamoDB:`);
        console.log(`   Companies: ${totalCompanies}`);
        console.log(`   Users: ${totalUsers}`);
        console.log(`   Assessments: ${activeAssessments}`);
        console.log(`   Pending Payments: ${pendingPayments}`);
        console.log(`   Pending Invoices: ${pendingInvoices}`);

    } catch (error) {
        console.error("❌ Error fetching dashboard stats from DynamoDB:", error);
        // Return zeros if there's an error
    }

    return {
        totalCompanies,
        totalUsers,
        activeAssessments,
        pendingPayments,
        pendingInvoices
    };
}
