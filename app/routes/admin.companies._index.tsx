import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
    BuildingOffice2Icon,
    PlusIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    MapPinIcon,
    CalendarDaysIcon,
    ChevronRightIcon,
    CheckBadgeIcon,
    NoSymbolIcon,
    ArrowTrendingUpIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const CHART_DATA = [
    { name: 'Jan', count: 12 },
    { name: 'Feb', count: 18 },
    { name: 'Mar', count: 25 },
    { name: 'Apr', count: 32 },
    { name: 'May', count: 45 },
    { name: 'Jun', count: 58 },
    { name: 'Jul', count: 72 },
];

export async function loader({ request }: LoaderFunctionArgs) {
    await requireAdminSession(request);

    try {
        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :companyPrefix)",
            ExpressionAttributeValues: {
                ":companyPrefix": "COMPANY#"
            }
        });

        const response = await ddbDocClient.send(command);
        const companies = response.Items || [];

        return json({
            companies,
            totalCount: companies.length,
            activeCount: companies.filter((c: any) => c.isActive || c.status === "active").length,
            inactiveCount: companies.filter((c: any) => !c.isActive && c.status !== "active").length,
        });
    } catch (error) {
        console.error("Error fetching companies:", error);
        return json({
            error: "Failed to fetch companies from database",
            companies: [],
            totalCount: 0,
            activeCount: 0,
            inactiveCount: 0
        });
    }
}

export default function AdminCompanies() {
    const data = useLoaderData<typeof loader>();
    const { companies, totalCount, activeCount, inactiveCount } = data;

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Company List</h1>
                    <p className="text-gray-500 font-medium">Manage accounts, status, and industries.</p>
                </div>
                <Link
                    to="/admin/companies/new"
                    className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Company
                </Link>
            </div>

            {/* Stats & Growth Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                                <ArrowTrendingUpIcon className="h-6 w-6" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-900">Growth Trend</h2>
                        </div>
                        <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">+14% MoM</span>
                    </div>
                    <div className="h-[180px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" hide />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#6366F1" fillOpacity={1} fill="url(#colorCount)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Registered</p>
                            <p className="text-2xl font-bold text-gray-900">{totalCount}</p>
                        </div>
                        <BuildingOffice2Icon className="h-10 w-10 text-gray-100" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Accounts</p>
                            <p className="text-2xl font-bold text-emerald-600">{activeCount}</p>
                        </div>
                        <CheckBadgeIcon className="h-10 w-10 text-emerald-50" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Inactive/Pending</p>
                            <p className="text-2xl font-bold text-rose-500">{inactiveCount}</p>
                        </div>
                        <NoSymbolIcon className="h-10 w-10 text-rose-50" />
                    </div>
                </div>
            </div>

            {/* List View */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find a company..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-all">
                            <FunnelIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Company Profile</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            <AnimatePresence mode="popLayout">
                                {companies.map((company: any, idx: number) => (
                                    <motion.tr
                                        key={company.pk}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group hover:bg-gray-50/50 transition-colors"
                                    >
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                    {(company.companyName || company.company_name || company.name || company.brand_name || "U")[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                        {company.companyName || company.company_name || company.name || company.brand_name || "Unnamed Company"}
                                                    </div>
                                                    <div className="text-xs font-semibold text-gray-400">
                                                        {company.industry || "General Industry"}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                                                    <MapPinIcon className="h-4 w-4 text-gray-400" />
                                                    {company.location || company.address || company.city || "Remote/Global"}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                                                    <CalendarDaysIcon className="h-3.5 w-3.5" />
                                                    Member since {company.created_at ? new Date(company.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            {company.isActive || company.status === "active" ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold ring-1 ring-inset ring-emerald-600/10">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 text-gray-500 text-xs font-bold ring-1 ring-inset ring-gray-600/10">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <Link
                                                to={`/admin/companies/${company.pk?.replace("COMPANY#", "")}`}
                                                className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-700 hover:translate-x-1 transition-all"
                                            >
                                                Manage
                                                <ChevronRightIcon className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {companies.length === 0 && (
                    <div className="p-20 text-center">
                        <BuildingOffice2Icon className="h-16 w-16 text-gray-100 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900">No organizations found</h3>
                        <p className="text-gray-500 font-medium mb-6">Start by adding your first client company.</p>
                        <Link
                            to="/admin/companies/new"
                            className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-xl"
                        >
                            Get Started
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
