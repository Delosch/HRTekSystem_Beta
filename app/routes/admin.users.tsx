import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { Users, Mail, Phone, Building2, Calendar, CheckCircle, XCircle, UserPlus } from "lucide-react";

/**
 * Admin Users Page
 * Route: /admin/users
 * 
 * Displays all users from DynamoDB
 */

export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    // Check admin role (with dev mode bypass)
    const userWithRole = user as any;
    if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
        return json({
            error: "Unauthorized - Admin access required",
            users: []
        }, { status: 403 });
    }

    try {
        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        // Scan for all users (pk starts with USER#)
        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :userPrefix)",
            ExpressionAttributeValues: {
                ":userPrefix": "USER#"
            }
        });

        const response = await ddbDocClient.send(command);
        const users = response.Items || [];

        console.log(`📊 Fetched ${users.length} users from DynamoDB`);

        return json({
            users,
            totalCount: users.length
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return json({
            error: "Failed to fetch users from database",
            users: [],
            totalCount: 0
        });
    }
}

export default function AdminUsers() {
    const loaderData = useLoaderData<typeof loader>() as any;
    const users = loaderData?.users || [];
    const totalCount = loaderData?.totalCount || 0;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Users className="w-10 h-10 text-blue-600" />
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                                <p className="text-gray-600">View and manage all registered users</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Link
                                to="new"
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                <UserPlus className="w-5 h-5" />
                                <span className="font-medium">Add User</span>
                            </Link>
                            <div className="bg-blue-100 px-4 py-2 rounded-lg">
                                <p className="text-sm font-semibold text-blue-900">
                                    Total Users: {totalCount}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {loaderData?.error && (
                    <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4">
                        <p className="text-sm text-red-800">{loaderData.error}</p>
                    </div>
                )}

                {/* Users Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    {users.length === 0 ? (
                        <div className="text-center py-16">
                            <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Users Found</h3>
                            <p className="text-gray-600">No registered users in the system</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Contact
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Organization
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
                                    {users.map((user: any) => (
                                        <tr key={user.pk} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-sm text-gray-500 flex items-center gap-1">
                                                        <Mail className="w-3 h-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                                    {user.phone ? (
                                                        <>
                                                            <Phone className="w-3 h-3" />
                                                            {user.phone}
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">No phone</span>
                                                    )}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {user.country_iso || "N/A"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                                    {user.organisationId ? (
                                                        <>
                                                            <Building2 className="w-3 h-3" />
                                                            <Link
                                                                to={`/admin/companies/${user.organisationId}`}
                                                                className="text-blue-600 hover:text-blue-800 underline"
                                                            >
                                                                {user.organisationId}
                                                            </Link>
                                                        </>
                                                    ) : (
                                                        <span className="text-gray-400">No organization</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-1">
                                                        {user.is_verified_email ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-gray-300" />
                                                        )}
                                                        <span className="text-xs text-gray-600">Email</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        {user.is_verified_phone ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <XCircle className="w-4 h-4 text-gray-300" />
                                                        )}
                                                        <span className="text-xs text-gray-600">Phone</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {user.onboardingStatus || "Unknown"}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <Link
                                                    to={`/admin/users/${user.pk.replace("USER#", "")}`}
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
                    )}
                </div>

                {/* Stats */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-blue-600" />
                            <div>
                                <p className="text-sm text-gray-600">Total Users</p>
                                <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <div>
                                <p className="text-sm text-gray-600">Verified Email</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter((u: any) => u.is_verified_email).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-8 h-8 text-purple-600" />
                            <div>
                                <p className="text-sm text-gray-600">With Organization</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter((u: any) => u.organisationId).length}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <Phone className="w-8 h-8 text-orange-600" />
                            <div>
                                <p className="text-sm text-gray-600">Verified Phone</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {users.filter((u: any) => u.is_verified_phone).length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
