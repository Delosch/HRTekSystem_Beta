import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
    UsersIcon,
    UserPlusIcon,
    AtSymbolIcon,
    DevicePhoneMobileIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    CheckCircleIcon,
    EllipsisHorizontalIcon,
    ChevronRightIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const USER_CHART_DATA = [
    { name: 'Jan', newUsers: 40 },
    { name: 'Feb', newUsers: 30 },
    { name: 'Mar', newUsers: 60 },
    { name: 'Apr', newUsers: 45 },
    { name: 'May', newUsers: 90 },
    { name: 'Jun', newUsers: 75 },
    { name: 'Jul', newUsers: 110 },
];

export async function loader({ request }: LoaderFunctionArgs) {
    await requireAdminSession(request);

    try {
        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :userPrefix)",
            ExpressionAttributeValues: {
                ":userPrefix": "USER#"
            }
        });

        const response = await ddbDocClient.send(command);
        const users = response.Items || [];

        return json({
            users,
            totalCount: users.length,
            verifiedEmails: users.filter((u: any) => u.is_verified_email).length,
            withOrg: users.filter((u: any) => u.organisationId).length,
            verifiedPhones: users.filter((u: any) => u.is_verified_phone).length,
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        return json({
            error: "Failed to fetch users from database",
            users: [],
            totalCount: 0,
            verifiedEmails: 0,
            withOrg: 0,
            verifiedPhones: 0
        });
    }
}

export default function AdminUsers() {
    const data = useLoaderData<typeof loader>();
    const { users, totalCount, verifiedEmails, withOrg, verifiedPhones } = data;

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Directory</h1>
                    <p className="text-gray-500 font-medium">Manage user accounts, authentication status, and organizational links.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        to="new"
                        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                    >
                        <UserPlusIcon className="h-5 w-5" />
                        Add User
                    </Link>
                </div>
            </div>

            {/* Top Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Monthly Sign-ups</h2>
                        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                            New Users/Month
                        </div>
                    </div>
                    <div className="h-[140px] w-full overflow-hidden">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={USER_CHART_DATA}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip
                                    cursor={{ fill: '#f9fafb' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="newUsers" radius={[6, 6, 0, 0]}>
                                    {USER_CHART_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index === USER_CHART_DATA.length - 1 ? '#6366F1' : '#E0E7FF'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="grid grid-cols-1 shrink-0 gap-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
                            <p className="text-3xl font-extrabold text-gray-900">{totalCount}</p>
                        </div>
                        <UsersIcon className="h-10 w-10 text-indigo-100" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Verified Users</p>
                            <p className="text-3xl font-extrabold text-emerald-500">{verifiedEmails}</p>
                        </div>
                        <AtSymbolIcon className="h-10 w-10 text-emerald-50" />
                    </div>
                </div>

                <div className="grid grid-cols-1 shrink-0 gap-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Company Users</p>
                            <p className="text-3xl font-extrabold text-purple-600">{withOrg}</p>
                        </div>
                        <BuildingOfficeIcon className="h-10 w-10 text-purple-50" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Phone Verified</p>
                            <p className="text-3xl font-extrabold text-orange-500">{verifiedPhones}</p>
                        </div>
                        <DevicePhoneMobileIcon className="h-10 w-10 text-orange-50" />
                    </div>
                </div>
            </div>

            {/* Main Table Section */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                            <FunnelIcon className="h-4 w-4" />
                            Filter
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User Account</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Security</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {users.map((user: any, idx: number) => (
                                    <motion.tr
                                        key={user.pk}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group hover:bg-gray-50/30 transition-colors"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-100 border border-white shadow-sm flex items-center justify-center text-gray-600 font-bold text-sm overflow-hidden">
                                                    {user.photoUrl ? (
                                                        <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span>{(user.first_name || "U")[0]}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-xs font-medium text-gray-400 flex items-center gap-1">
                                                        <AtSymbolIcon className="h-3 w-3" />
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {user.organisationId ? (
                                                <Link to={`/admin/companies/${user.organisationId}`} className="group/org flex items-center gap-2">
                                                    <div className="p-1.5 bg-gray-50 rounded-lg group-hover/org:bg-indigo-50 transition-colors">
                                                        <BuildingOfficeIcon className="h-4 w-4 text-gray-400 group-hover/org:text-indigo-500" />
                                                    </div>
                                                    <span className="text-xs font-bold text-gray-600 group-hover/org:text-indigo-900 transition-colors">
                                                        {user.organisationId}
                                                    </span>
                                                </Link>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-300">Independent</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <TooltipWrapper content="Email Verified">
                                                    <CheckCircleIcon className={`h-5 w-5 ${user.is_verified_email ? 'text-emerald-500' : 'text-gray-200'}`} />
                                                </TooltipWrapper>
                                                <TooltipWrapper content="Phone Verified">
                                                    <DevicePhoneMobileIcon className={`h-5 w-5 ${user.is_verified_phone ? 'text-emerald-500' : 'text-gray-200'}`} />
                                                </TooltipWrapper>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="inline-flex text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-600 uppercase tracking-tighter">
                                                    {user.onboardingStatus || "Draft"}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] font-medium text-gray-400">
                                                    <CalendarIcon className="h-3 w-3" />
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "Pending"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    to={`/admin/users/${user.pk.replace("USER#", "")}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                >
                                                    <ChevronRightIcon className="h-5 w-5" />
                                                </Link>
                                                <button className="p-2 text-gray-300 hover:text-gray-600 rounded-xl transition-all">
                                                    <EllipsisHorizontalIcon className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {users.length === 0 && (
                    <div className="p-32 text-center">
                        <UsersIcon className="h-20 w-20 text-gray-100 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-gray-900">No users found</h3>
                        <p className="text-gray-500 font-medium mb-8">Ready to grow? Add the first user to your system.</p>
                        <Link to="new" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-bold shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">
                            Add User
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

// Simple Helper for Tooltip-like behavior (Visual only)
function TooltipWrapper({ children, content }: { children: React.ReactNode, content: string }) {
    return (
        <div className="relative group/tip">
            {children}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] font-bold rounded opacity-0 group-hover/tip:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {content}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </div>
        </div>
    );
}
