import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import {
    ClipboardDocumentCheckIcon,
    BuildingOfficeIcon,
    CalendarIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    ArrowRightIcon,
    MagnifyingGlassIcon,
    ChartBarIcon
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export async function loader({ request }: LoaderFunctionArgs) {
    await requireAdminSession(request);

    try {
        const ddbDocClient = getDynamoDBDocumentClient();
        const tableName = process.env.DYNAMODB_TABLE_NAME;

        const command = new ScanCommand({
            TableName: tableName,
            FilterExpression: "begins_with(pk, :assessmentPrefix)",
            ExpressionAttributeValues: {
                ":assessmentPrefix": "ASSESSMENT#"
            }
        });

        const response = await ddbDocClient.send(command);
        const assessments = response.Items || [];

        return json({
            assessments,
            totalCount: assessments.length,
            completedCount: assessments.filter((a: any) => a.status === "completed").length,
            inProgressCount: assessments.filter((a: any) => a.status === "in_progress").length,
            pendingCount: assessments.filter((a: any) => a.status === "pending").length,
        });
    } catch (error) {
        console.error("Error fetching assessments:", error);
        return json({
            error: "Failed to fetch assessments from database",
            assessments: [],
            totalCount: 0,
            completedCount: 0,
            inProgressCount: 0,
            pendingCount: 0
        });
    }
}

export default function AdminAssessments() {
    const data = useLoaderData<typeof loader>();
    const { assessments, totalCount, completedCount, inProgressCount, pendingCount } = data;

    const STATUS_DATA = [
        { name: 'Completed', value: completedCount, color: '#10B981' },
        { name: 'In Progress', value: inProgressCount, color: '#F59E0B' },
        { name: 'Pending', value: pendingCount, color: '#6366F1' },
    ].filter(d => d.value > 0);

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Assessment Engine</h1>
                    <p className="text-gray-500 font-medium">Track client progress, engine utilization, and completion rates.</p>
                </div>
                <div className="relative max-w-xs">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search assessments..."
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 transition-all font-medium shadow-sm"
                    />
                </div>
            </div>

            {/* Assessment Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
                    <div className="h-40 w-40 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={STATUS_DATA}
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={8}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {STATUS_DATA.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">{totalCount}</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Total</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 shrink-0 gap-4">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Completed</p>
                            <p className="text-3xl font-extrabold text-gray-900">{completedCount}</p>
                        </div>
                        <CheckCircleIcon className="h-10 w-10 text-emerald-50" />
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">In Progress</p>
                            <p className="text-3xl font-extrabold text-gray-900">{inProgressCount}</p>
                        </div>
                        <ClockIcon className="h-10 w-10 text-amber-50" />
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <ChartBarIcon className="h-24 w-24" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Efficiency Rating</h3>
                    <p className="text-sm text-gray-500 mb-6 font-medium">Platform average completion rate: {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%</p>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                            className="h-full bg-indigo-600 rounded-full"
                        />
                    </div>
                    <p className="mt-4 text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Optimizing Performance</p>
                </div>
            </div>

            {/* Assessment Grid */}
            {assessments.length === 0 ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-20 text-center">
                    <ClipboardDocumentCheckIcon className="h-16 w-16 text-gray-100 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-900">Queue is empty</h3>
                    <p className="text-gray-500 font-medium">Check back later when companies start their journey.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence>
                        {assessments.map((assessment: any, idx: number) => (
                            <motion.div
                                key={assessment.pk}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.05 }}
                                whileHover={{ y: -4 }}
                                className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 group transition-all hover:shadow-md relative overflow-hidden"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className={`p-2 rounded-xl ${assessment.status === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                                            assessment.status === 'in_progress' ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'
                                        }`}>
                                        <ClipboardDocumentCheckIcon className="h-6 w-6" />
                                    </div>
                                    <div className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${assessment.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                                            assessment.status === 'in_progress' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-gray-50 text-gray-600 border border-gray-100'
                                        }`}>
                                        {assessment.status?.replace('_', ' ')}
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                    {assessment.engineName || "Advisory Engine"}
                                </h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                                        <BuildingOfficeIcon className="h-4 w-4 text-gray-300" />
                                        <Link to={`/admin/companies/${assessment.companyId}`} className="hover:text-indigo-600 underline decoration-gray-200">
                                            {assessment.companyId}
                                        </Link>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                                        <CalendarIcon className="h-4 w-4 opacity-70" />
                                        Initiated {new Date(assessment.created_at).toLocaleDateString()}
                                    </div>
                                </div>

                                {assessment.progress !== undefined && (
                                    <div className="mb-6">
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-tighter mb-2">
                                            <span>Completeness</span>
                                            <span className="text-gray-900">{assessment.progress}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 rounded-full"
                                                style={{ width: `${assessment.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="pt-4 border-t border-gray-50">
                                    <Link
                                        to={`/admin/assessments/${assessment.pk.replace("ASSESSMENT#", "")}`}
                                        className="flex items-center justify-between text-sm font-bold text-indigo-600 group hover:translate-x-1 transition-transform"
                                    >
                                        Inspect Assessment
                                        <ArrowRightIcon className="h-4 w-4" />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
