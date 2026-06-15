import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
    Activity,
    Users,
    Building2,
    CheckCircle2,
    CreditCard,
    ArrowUpRight,
    ArrowDownRight,
    RefreshCw,
    FileText,
    ChevronRight,
    Clock,
    Sparkles,
    Zap,
    Globe,
    History,
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie
} from "recharts";
import { motion } from "framer-motion";

interface MetricCardProps {
    title: string;
    value: string | number;
    trend?: { value: string; positive: boolean };
    description: string;
    icon: React.ElementType;
    color: string;
    linkHref?: string;
}

export const loader = async () => {
    const { getDashboardStats } = await import("~/lib/admin.dashboard.server");
    const stats = await getDashboardStats();
    return json({
        stats,
        currentDate: new Date().toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
        }),
    });
};

function MetricCard({ title, value, trend, description, icon: Icon, color, linkHref }: MetricCardProps) {
    const colors: Record<string, { bg: string; text: string; lightBg: string }> = {
        blue:    { bg: "bg-blue-600",    text: "text-blue-600",    lightBg: "bg-blue-50"   },
        emerald: { bg: "bg-emerald-500", text: "text-emerald-500", lightBg: "bg-emerald-50" },
        amber:   { bg: "bg-amber-500",   text: "text-amber-500",   lightBg: "bg-amber-50"  },
        orange:  { bg: "bg-orange-500",  text: "text-orange-500",  lightBg: "bg-orange-50" },
        rose:    { bg: "bg-rose-500",    text: "text-rose-500",    lightBg: "bg-rose-50"   },
        indigo:  { bg: "bg-indigo-600",  text: "text-indigo-600",  lightBg: "bg-indigo-50" },
    };
    const c = colors[color] || colors.blue;

    const Content = (
        <motion.div
            whileHover={{ y: -4 }}
            className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50"
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${c.lightBg} ${c.text} border border-slate-100/50`}>
                    <Icon className="h-6 w-6" strokeWidth={2.5} />
                </div>
                {trend && (
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-tight ${trend.positive ? "text-emerald-600" : "text-rose-600"}`}>
                        {trend.positive
                            ? <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={3} />
                            : <ArrowDownRight className="h-3.5 w-3.5" strokeWidth={3} />
                        }
                        {trend.value}
                    </div>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-[13px] font-bold text-slate-400 uppercase tracking-widest leading-none">{title}</h3>
                <p className="text-3xl font-black text-[#000033] tracking-tighter">{value}</p>
                <p className="text-[11px] font-medium text-slate-400 mt-1">{description}</p>
            </div>
        </motion.div>
    );

    return linkHref ? <Link to={linkHref}>{Content}</Link> : Content;
}

export default function AdminDashboardIndex() {
    const { stats, currentDate } = useLoaderData<typeof loader>();

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 p-2 md:p-6 font-inter">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[#000033] tracking-tight mb-2">System Analytics</h1>
                    <p className="text-slate-500 font-medium text-lg">
                        Welcome back, Admin. Here's what's happening today,{" "}
                        <span className="text-indigo-600 font-bold">{currentDate}.</span>
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white border border-slate-200 text-[#000033] px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm active:scale-95"
                    >
                        <RefreshCw className="h-4 w-4" strokeWidth={2.5} /> Refresh Data
                    </button>
                    <Link to="/admin/hti" className="bg-indigo-600 text-white px-8 py-3 rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                        Review Reports
                    </Link>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                <MetricCard
                    title="Total Companies"
                    value={stats.totalCompanies}
                    trend={stats.companyTrend}
                    description="Registered across platform"
                    icon={Building2}
                    color="blue"
                    linkHref="/admin/companies"
                />
                <MetricCard
                    title="Total Users"
                    value={stats.totalUsers}
                    trend={stats.userTrend}
                    description="Active account holders"
                    icon={Users}
                    color="emerald"
                    linkHref="/admin/users"
                />
                <MetricCard
                    title="Active Assessments"
                    value={stats.activeAssessments}
                    description="Engines currently in progress"
                    icon={CheckCircle2}
                    color="amber"
                    linkHref="/admin/assessments"
                />
                <MetricCard
                    title="Pending Payments"
                    value={stats.pendingPayments}
                    description="Awaiting verification"
                    icon={CreditCard}
                    color="orange"
                    linkHref="/admin/payments/verification"
                />
                <MetricCard
                    title="Pending HTI Reports"
                    value={stats.pendingHTIReports}
                    description="Awaiting admin review"
                    icon={FileText}
                    color="rose"
                    linkHref="/admin/hti"
                />
            </div>

            {/* Analytics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
                {/* Platform Growth Chart */}
                <div className="lg:col-span-8 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-10 relative z-10">
                        <div>
                            <h2 className="text-2xl font-black text-[#000033] tracking-tight">Platform Growth</h2>
                            <p className="text-sm font-medium text-slate-400">User & Company onboardings — last 7 months</p>
                        </div>
                        <div className="flex gap-6">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/30" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Users</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30" />
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Companies</span>
                            </div>
                        </div>
                    </div>
                    <div className="h-[400px] w-full relative z-10">
                        {stats.monthlyGrowth.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthlyGrowth} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366F1" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorCompanies" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.5} />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }} dy={15} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#94A3B8", fontSize: 11, fontWeight: 700 }} allowDecimals={false} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: "20px", border: "none", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)", padding: "16px 20px", backgroundColor: "#000033", color: "#fff" }}
                                        itemStyle={{ color: "#fff", fontSize: "12px", fontWeight: 800 }}
                                        cursor={{ stroke: "#6366F1", strokeWidth: 2, strokeDasharray: "4 4" }}
                                    />
                                    <Area type="monotone" dataKey="users"     stroke="#6366F1" fillOpacity={1} fill="url(#colorUsers)"     strokeWidth={4} animationDuration={2000} />
                                    <Area type="monotone" dataKey="companies" stroke="#10B981" fillOpacity={1} fill="url(#colorCompanies)" strokeWidth={4} animationDuration={2500} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex items-center justify-center text-slate-300">
                                <p className="text-sm font-bold">No growth data yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Engine Utilization Donut */}
                <div className="lg:col-span-4 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center">
                    <div className="w-full mb-8">
                        <h2 className="text-2xl font-black text-[#000033] tracking-tight">Engine Utilization</h2>
                        <p className="text-sm font-medium text-slate-400">
                            {stats.activeAssessments > 0
                                ? `${stats.activeAssessments} assessment${stats.activeAssessments === 1 ? "" : "s"} in progress`
                                : "Assessment usage by type"}
                        </p>
                    </div>

                    {stats.engineUsage.length > 0 ? (
                        <>
                            <div className="h-[300px] w-full flex items-center justify-center relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={stats.engineUsage}
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {stats.engineUsage.map((entry: any, index: number) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            content={({ active, payload }) =>
                                                active && payload?.length ? (
                                                    <div className="bg-[#000033] text-white p-4 rounded-2xl shadow-2xl">
                                                        <p className="text-xs font-black uppercase tracking-widest mb-1">{payload[0].name}</p>
                                                        <p className="text-2xl font-black">{payload[0].value}%</p>
                                                    </div>
                                                ) : null
                                            }
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="w-full space-y-4 mt-8">
                                {stats.engineUsage.map((item: any) => (
                                    <div key={item.name} className="flex items-center justify-between group cursor-default">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full ring-4 ring-slate-50 transition-all group-hover:scale-125" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm font-bold text-slate-600 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{item.name}</span>
                                        </div>
                                        <span className="text-sm font-black text-[#000033] bg-slate-50 px-2 py-1 rounded-lg">{item.percentage}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-center">
                            <div>
                                <Activity className="h-12 w-12 text-slate-100 mx-auto mb-3" />
                                <p className="text-sm font-bold text-slate-300">No engine data yet</p>
                                <p className="text-xs text-slate-300 mt-1">Usage will appear once companies start assessments</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12 pb-10">
                {/* Live Activity Feed */}
                <div className="lg:col-span-7 bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-xl">
                                <History className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-[#000033] tracking-tight">Live Activity Feed</h2>
                        </div>
                        <Link to="/admin/activity-logs" className="text-xs font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 flex items-center gap-2 group">
                            View All <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    {stats.recentActivity.length > 0 ? (
                        <div className="p-8 space-y-8">
                            {stats.recentActivity.map((item: any) => (
                                <div key={item.id} className="flex items-start gap-6 group">
                                    <div className={`mt-1.5 h-3 w-3 rounded-full ring-4 shrink-0 transition-all group-hover:scale-125 ${
                                        item.type === "success" ? "bg-emerald-500 ring-emerald-50" :
                                        item.type === "warning" ? "bg-orange-500 ring-orange-50" :
                                        item.type === "error"   ? "bg-rose-500 ring-rose-50"     :
                                        "bg-blue-500 ring-blue-50"
                                    }`} />
                                    <div className="flex-1">
                                        <p className="text-[15px] text-[#000033] font-bold group-hover:text-indigo-600 transition-colors leading-tight">{item.msg}</p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <Clock className="h-3 w-3 text-slate-300" />
                                            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{item.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-16 text-center">
                            <History className="h-10 w-10 text-slate-100 mx-auto mb-3" />
                            <p className="text-sm font-bold text-slate-300">No recent activity yet</p>
                        </div>
                    )}
                </div>

                {/* Action Center */}
                <div className="lg:col-span-5 flex flex-col gap-8">
                    <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex-1">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-rose-100 text-rose-600 rounded-xl">
                                <Zap className="h-5 w-5" strokeWidth={2.5} />
                            </div>
                            <h2 className="text-2xl font-black text-[#000033] tracking-tight">Action Center</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-indigo-50/50 p-6 rounded-[24px] border border-indigo-100/50 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 group">
                                <Users className="h-10 w-10 text-indigo-600 mb-4 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                                <h3 className="font-black text-[#000033] leading-none mb-2">User Approvals</h3>
                                <p className="text-xs font-medium text-slate-500 mb-6">
                                    {stats.pendingUsers > 0
                                        ? `${stats.pendingUsers} user${stats.pendingUsers === 1 ? "" : "s"} unverified`
                                        : "All users verified"}
                                </p>
                                <Link to="/admin/users" className="text-[11px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2 hover:gap-3 transition-all">
                                    Manage Users <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="bg-emerald-50/50 p-6 rounded-[24px] border border-emerald-100/50 hover:bg-white hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 group">
                                <CheckCircle2 className="h-10 w-10 text-emerald-600 mb-4 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                                <h3 className="font-black text-[#000033] leading-none mb-2">Revenue Check</h3>
                                <p className="text-xs font-medium text-slate-500 mb-6">
                                    {stats.pendingPayments > 0
                                        ? `${stats.pendingPayments} payment${stats.pendingPayments === 1 ? "" : "s"} pending`
                                        : "No pending payments"}
                                </p>
                                <Link to="/admin/payments/verification" className="text-[11px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-2 hover:gap-3 transition-all">
                                    Check Payments <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="bg-amber-50/50 p-6 rounded-[24px] border border-amber-100/50 hover:bg-white hover:shadow-xl hover:shadow-amber-500/10 transition-all duration-300 group">
                                <Sparkles className="h-10 w-10 text-amber-500 mb-4 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                                <h3 className="font-black text-[#000033] leading-none mb-2">AI Insights</h3>
                                <p className="text-xs font-medium text-slate-500 mb-6">
                                    {stats.pendingHTIReports > 0
                                        ? `${stats.pendingHTIReports} report${stats.pendingHTIReports === 1 ? "" : "s"} awaiting review`
                                        : "No pending HTI reports"}
                                </p>
                                <Link to="/admin/hti" className="text-[11px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2 hover:gap-3 transition-all">
                                    See Reports <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>

                            <div className="bg-purple-50/50 p-6 rounded-[24px] border border-purple-100/50 hover:bg-white hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 group">
                                <Globe className="h-10 w-10 text-purple-600 mb-4 transition-transform group-hover:scale-110" strokeWidth={2.5} />
                                <h3 className="font-black text-[#000033] leading-none mb-2">Website</h3>
                                <p className="text-xs font-medium text-slate-500 mb-6">Manage content & settings</p>
                                <Link to="/admin/website/analytics" className="text-[11px] font-black uppercase tracking-widest text-purple-600 flex items-center gap-2 hover:gap-3 transition-all">
                                    Open Website <ChevronRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
