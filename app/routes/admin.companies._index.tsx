import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Building2, Users, Calendar, MapPin, CheckCircle, XCircle } from "lucide-react";

/**
 * Admin Companies List Page
 * Route: /admin/companies
 * 
 * Displays all companies from DynamoDB
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    // Check admin role (with dev mode bypass)
    const userWithRole = user as any;
    if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
        return json({
            error: "Unauthorized - Admin access required",
            companies: []
        }, { status: 403 });
    }

    try {
        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        // Scan for all companies (pk starts with COMPANY#)
        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :companyPrefix)",
            ExpressionAttributeValues: {
                ":companyPrefix": "COMPANY#"
            }
        });

        const response = await ddbDocClient.send(command);
        const companies = response.Items || [];

        console.log(`📊 Fetched ${companies.length} companies from DynamoDB`);

        return json({
            companies,
            totalCount: companies.length
        });
    } catch (error) {
        console.error("Error fetching companies:", error);
        return json({
            error: "Failed to fetch companies from database",
            companies: [],
            totalCount: 0
        });
    }
}

export default function AdminCompanies() {
    const loaderData = useLoaderData<typeof loader>() as any;
    const companies = loaderData?.companies || [];
    const totalCount = loaderData?.totalCount || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Building2 className="w-10 h-10 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Company Management</h1>
                                <p className="text-gray-600">View and manage all registered companies</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-blue-100 px-4 py-2 rounded-lg">
                                <p className="text-sm font-semibold text-blue-900">
                                    Total Companies: {totalCount}
                                </p>
                            </div>
                            <Link
                                to="/admin/companies/new"
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                + Add Company
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {loaderData?.error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                        <p className="text-sm text-red-800">{loaderData.error}</p>
                    </div>
                )}

                {/* Companies Grid */}
                {companies.length === 0 ? (
                    <div className="bg-white shadow-md rounded-lg p-16 text-center">
                        <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Companies Found</h3>
                        <p className="text-gray-600 mb-6">No companies have been registered yet</p>
                        <Link
                            to="/admin/companies/new"
                            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                        >
                            + Add First Company
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Industry
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {companies.map((company: any) => (
                                        <tr key={company.pk} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {company.companyName || company.name || "Unnamed Company"}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: {company.pk?.replace("COMPANY#", "") || "N/A"}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                                    {company.location || company.city ? (
                                                        <>
                                                            <MapPin className="w-3 h-3" />
                                                            {company.location || company.city}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">No location</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {company.industry || <span className="text-gray-400">N/A</span>}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-1">
                                                    {company.isActive || company.status === "active" ? (
                                                        <>
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                            <span className="text-sm text-green-700">Active</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <XCircle className="w-4 h-4 text-gray-400" />
                                                            <span className="text-sm text-gray-500">Inactive</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {company.created_at ? new Date(company.created_at).toLocaleDateString() : "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    to={`/admin/companies/${company.pk?.replace("COMPANY#", "")}`}
                                                    className="text-blue-600 hover:text-blue-900"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Companies</p>
                                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Active</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {companies.filter((c: any) => c.isActive || c.status === "active").length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <XCircle className="w-8 h-8 text-gray-600" />
                            <div>
                                <p className="text-sm text-gray-600">Inactive</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {companies.filter((c: any) => !c.isActive && c.status !== "active").length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
