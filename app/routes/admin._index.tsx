import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
    ArrowPathIcon,
    BuildingOffice2Icon,
    UsersIcon,
    ClipboardDocumentCheckIcon,
    ReceiptPercentIcon,
    PencilSquareIcon,
    ClockIcon,
    GlobeAltIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie
} from 'recharts';
import { motion } from "framer-motion";

// --- Interfaces ---
interface QuickStatCardProps {
    title: string;
    value: string | number;
    trend?: { value: string; positive: boolean };
    description: string;
    icon: React.ElementType;
    color: string;
    linkHref?: string;
}

const CHART_DATA = [
    { name: 'Jan', companies: 45, users: 120 },
    { name: 'Feb', companies: 52, users: 180 },
    { name: 'Mar', companies: 61, users: 250 },
    { name: 'Apr', companies: 75, users: 310 },
    { name: 'May', companies: 88, users: 440 },
    { name: 'Jun', companies: 105, users: 480 },
    { name: 'Jul', companies: 124, users: 550 },
];

const ENGINE_USAGE = [
    { name: 'HCM Fit', value: 35, color: '#4F46E5' },
    { name: 'Digital Roadmap', value: 25, color: '#10B981' },
    { name: 'Maturity', value: 20, color: '#F59E0B' },
    { name: 'Shared Services', value: 15, color: '#EC4899' },
    { name: 'Change Mgmt', value: 5, color: '#6366F1' },
];

// --- Loader Function ---
export const loader = async () => {
    const { getDashboardStats } = await import("~/lib/admin.dashboard.server");
    const stats = await getDashboardStats();

    return json({
        stats,
        currentDate: new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    });
};

// --- Components ---

function MetricCard({ title, value, trend, description, icon: Icon, color, linkHref }: QuickStatCardProps) {
    // Determine dynamic background and text classes based on color name
    const colors: Record<string, { bg: string, text: string }> = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        yellow: { bg: 'bg-amber-50', text: 'text-amber-600' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
        red: { bg: 'bg-rose-50', text: 'text-rose-600' }
    };

    const colorClasses = colors[color] || colors.indigo;

    const CardContent = (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full relative overflow-hidden group transition-all duration-300 hover:shadow-md"
        >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="h-12 w-12" />
            </div>

            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl ${colorClasses.bg} ${colorClasses.text}`}>
                    <Icon className="h-6 w-6" />
                </div>
                {trend && (
                    <div className={`flex items-center text-xs font-bold ${trend.positive ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {trend.positive ? <ArrowTrendingUpIcon className="h-3 w-3 mr-1" /> : <ArrowTrendingDownIcon className="h-3 w-3 mr-1" />}
                        {trend.value}
                    </div>
                )}
            </div>

            <div className="mt-auto">
                <h3 className="text-sm font-medium text-gray-500">{title}</h3>
                <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
                </div>
                <p className="mt-1 text-xs text-gray-400">{description}</p>
            </div>
        </motion.div>
    );

    return linkHref ? <Link to={linkHref}>{CardContent}</Link> : CardContent;
}

export default function AdminDashboardIndex() {
    const { stats, currentDate } = useLoaderData<typeof loader>();

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 p-4">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Analytics</h1>
                    <p className="text-gray-500 font-medium">Welcome back, Admin. Here's what's happening today, {currentDate}.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
                        <ArrowPathIcon className="h-4 w-4" /> Refresh Data
                    </button>
                    <Link to="/admin/reports/generate" className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/20">
                        Generate Audit
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <MetricCard
                    title="Total Companies"
                    value={stats.totalCompanies}
                    trend={{ value: "+12%", positive: true }}
                    description="Registered across platform"
                    icon={BuildingOffice2Icon}
                    color="indigo"
                    linkHref="/admin/companies"
                />
                <MetricCard
                    title="Total Users"
                    value={stats.totalUsers}
                    trend={{ value: "+18%", positive: true }}
                    description="Active account holders"
                    icon={UsersIcon}
                    color="green"
                    linkHref="/admin/users"
                />
                <MetricCard
                    title="Active Assessments"
                    value={stats.activeAssessments}
                    trend={{ value: "+5%", positive: true }}
                    description="Engines currently in use"
                    icon={ClipboardDocumentCheckIcon}
                    color="yellow"
                    linkHref="/admin/assessments"
                />
                <MetricCard
                    title="Pending Payments"
                    value={stats.pendingPayments}
                    trend={{ value: "-2%", positive: false }}
                    description="Awaiting verification"
                    icon={ReceiptPercentIcon}
                    color="orange"
                    linkHref="/admin/payments/verification"
                />
                <MetricCard
                    title="Pending Invoices"
                    value={stats.pendingInvoices}
                    description="Action required"
                    icon={PencilSquareIcon}
                    color="red"
                    linkHref="/admin/invoices?status=pending"
                />
            </div>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Growth Chart */}
                <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Platform Growth</h2>
                            <p className="text-sm text-gray-400">User & Company onboardings over the last 7 months</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
                                <span className="text-xs font-semibold text-gray-500">Users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                <span className="text-xs font-semibold text-gray-500">Companies</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[350px] w-full font-medium">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={CHART_DATA}>
                                <defs>
                                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9ca3af', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Area type="monotone" dataKey="users" stroke="#6366F1" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={3} />
                                <Area type="monotone" dataKey="companies" stroke="#10B981" fillOpacity={1} fill="url(#colorCompanies)" strokeWidth={3} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Engine Distribution */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Engine Utilization</h2>
                    <p className="text-sm text-gray-400 mb-8">Market share by assessment type</p>

                    <div className="h-[280px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={ENGINE_USAGE}
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {ENGINE_USAGE.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    <div className="space-y-3 mt-auto">
                        {ENGINE_USAGE.map((item) => (
                            <div key={item.name} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                                    <span className="text-sm font-medium text-gray-600">{item.name}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-900">{item.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Row: Recent Activity & Action Center */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Activity */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-900">Live Activity Feed</h2>
                        <Link to="/admin/activity-logs" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View History</Link>
                    </div>
                    <div className="p-8 space-y-6">
                        {[
                            { id: 1, msg: "Payment proof submitted for #INV-2025-ABC", time: "2m ago", type: "success" },
                            { id: 2, msg: "Global Solutions completed HCM Assessment", time: "15m ago", type: "info" },
                            { id: 3, msg: "New company 'Vortex Ltd' onboarded", time: "1h ago", type: "success" },
                            { id: 4, msg: "AI report pending secondary review", time: "3h ago", type: "warning" },
                            { id: 5, msg: "System sync with CRM completed", time: "5h ago", type: "info" },
                        ].map((item) => (
                            <div key={item.id} className="flex items-start gap-4">
                                <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${item.type === 'success' ? 'bg-emerald-500' :
                                        item.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="text-sm text-gray-800 font-medium">{item.msg}</p>
                                    <span className="text-xs text-gray-400 font-medium">{item.time}</span>
                                </div>
                                <button className="text-gray-300 hover:text-indigo-500 transition-colors">
                                    <ClockIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Admin Tasks / Action Center */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-8 border-b border-gray-50">
                        <h2 className="text-xl font-bold text-gray-900">Action Center</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-8">
                        <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100/50 hover:bg-indigo-50 transition-colors">
                            <UsersIcon className="h-8 w-8 text-indigo-600 mb-4" />
                            <h3 className="font-bold text-gray-900">User Approvals</h3>
                            <p className="text-sm text-gray-500 mb-4">12 users awaiting account verification</p>
                            <Link to="/admin/users?status=pending" className="text-sm font-bold text-indigo-600 flex items-center">
                                Verify Now <ArrowPathIcon className="h-4 w-4 ml-2" />
                            </Link>
                        </div>
                        <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100/50 hover:bg-emerald-50 transition-colors">
                            <ReceiptPercentIcon className="h-8 w-8 text-emerald-600 mb-4" />
                            <h3 className="font-bold text-gray-900">Revenue Check</h3>
                            <p className="text-sm text-gray-500 mb-4">Check latest subscription payouts</p>
                            <Link to="/admin/payments/verification" className="text-sm font-bold text-emerald-600 flex items-center">
                                Analyze <ArrowPathIcon className="h-4 w-4 ml-2" />
                            </Link>
                        </div>
                        <div className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100/50 hover:bg-orange-50 transition-colors">
                            <SparklesIcon className="h-8 w-8 text-orange-600 mb-4" />
                            <h3 className="font-bold text-gray-900">AI Insights</h3>
                            <p className="text-sm text-gray-500 mb-4">5 new suggestions for client roadmap</p>
                            <Link to="/admin/hti" className="text-sm font-bold text-orange-600 flex items-center">
                                Review AI <ArrowPathIcon className="h-4 w-4 ml-2" />
                            </Link>
                        </div>
                        <div className="bg-purple-50/50 p-6 rounded-2xl border border-purple-100/50 hover:bg-purple-50 transition-colors">
                            <GlobeAltIcon className="h-8 w-8 text-purple-600 mb-4" />
                            <h3 className="font-bold text-gray-900">Web Traffic</h3>
                            <p className="text-sm text-gray-500 mb-4">Visitors up by 25% this week</p>
                            <Link to="/admin/website/home" className="text-sm font-bold text-purple-600 flex items-center">
                                Details <ArrowPathIcon className="h-4 w-4 ml-2" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
