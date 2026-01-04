import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { ClipboardCheck, Building2, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";

/**
 * Admin Assessments Page
 * Route: /admin/assessments
 * 
 * Displays all assessments from DynamoDB
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    // Check admin role (with dev mode bypass)
    const userWithRole = user as any;
    if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
        return json({
            error: "Unauthorized - Admin access required",
            assessments: []
        }, { status: 403 });
    }

    try {
        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        // Scan for all assessments (pk starts with ASSESSMENT#)
        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :assessmentPrefix)",
            ExpressionAttributeValues: {
                ":assessmentPrefix": "ASSESSMENT#"
            }
        });

        const response = await ddbDocClient.send(command);
        const assessments = response.Items || [];

        console.log(`📊 Fetched ${assessments.length} assessments from DynamoDB`);

        return json({
            assessments,
            totalCount: assessments.length
        });
    } catch (error) {
        console.error("Error fetching assessments:", error);
        return json({
            error: "Failed to fetch assessments from database",
            assessments: [],
            totalCount: 0
        });
    }
}

export default function AdminAssessments() {
    const loaderData = useLoaderData<typeof loader>() as any;
    const assessments = loaderData?.assessments || [];
    const totalCount = loaderData?.totalCount || 0;

    const getStatusBadge = (status: string) => {
        const styles = {
            completed: "bg-green-100 text-green-800",
            in_progress: "bg-yellow-100 text-yellow-800",
            pending: "bg-gray-100 text-gray-800",
            failed: "bg-red-100 text-red-800"
        };

        return (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"}`}>
                {status?.replace("_", " ").toUpperCase() || "UNKNOWN"}
            </span>
        );
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "completed":
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case "in_progress":
                return <Clock className="w-5 h-5 text-yellow-500" />;
            default:
                return <XCircle className="w-5 h-5 text-gray-400" />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <ClipboardCheck className="w-10 h-10 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Assessment Management</h1>
                                <p className="text-gray-600">View and manage all company assessments</p>
                            </div>
                        </div>
                        <div className="bg-blue-100 px-4 py-2 rounded-lg">
                            <p className="text-sm font-semibold text-blue-900">
                                Total Assessments: {totalCount}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {loaderData?.error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                        <p className="text-sm text-red-800">{loaderData.error}</p>
                    </div>
                )}

                {/* Assessments Grid */}
                {assessments.length === 0 ? (
                    <div className="bg-white shadow-md rounded-lg p-16 text-center">
                        <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Assessments Found</h3>
                        <p className="text-gray-600">No assessments have been created yet</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {assessments.map((assessment: any) => (
                            <div
                                key={assessment.pk}
                                className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    {getStatusIcon(assessment.status)}
                                    {getStatusBadge(assessment.status)}
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {assessment.engineName || "Assessment"}
                                </h3>

                                <div className="space-y-2 text-sm text-gray-600">
                                    {assessment.companyId && (
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4" />
                                            <Link
                                                to={`/admin/companies/${assessment.companyId}`}
                                                className="text-blue-600 hover:text-blue-800 underline"
                                            >
                                                {assessment.companyId}
                                            </Link>
                                        </div>
                                    )}

                                    {assessment.created_at && (
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(assessment.created_at).toLocaleDateString()}
                                        </div>
                                    )}

                                    {assessment.progress !== undefined && (
                                        <div className="mt-3">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span>Progress</span>
                                                <span>{assessment.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${assessment.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <Link
                                        to={`/admin/assessments/${assessment.pk.replace("ASSESSMENT#", "")}`}
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <ClipboardCheck className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total</p>
                                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Completed</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {assessments.filter((a: any) => a.status === "completed").length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-yellow-600" />
                            <div>
                                <p className="text-sm text-gray-600">In Progress</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {assessments.filter((a: any) => a.status === "in_progress").length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-8 h-8 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-600">Other</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {assessments.filter((a: any) => a.status !== "completed" && a.status !== "in_progress").length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
