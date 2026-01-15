import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { Layout } from "~/components/Layout";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";
import { requireUserSession } from "~/lib/session.server";
import { getCompanyProfile } from "~/models/company.model";
import { getCompanyReports, EngineReport } from "~/models/report.model";

// --- Loader to Fetch Real Data ---
export async function loader({ request }: LoaderFunctionArgs) {
    const user = await requireUserSession(request);

    let company = null;
    let reports: EngineReport[] = [];

    if (user.organisationId) {
        company = await getCompanyProfile(user.organisationId);
        reports = await getCompanyReports(user.organisationId);
    }

    // Calculate Metrics
    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === 'approved').length; // Assuming 'approved' means "done"
    // For demo, we might count "pending_review" as active
    const activeAssessments = reports.filter(r => r.status === 'pending_review').length;

    const completionRate = totalReports > 0 ? Math.round((completedReports / totalReports) * 100) : 0;

    // Chart Data: Reports by Engine
    const engineCounts: Record<string, number> = {};
    reports.forEach(r => {
        const name = r.engineName || "Unknown";
        engineCounts[name] = (engineCounts[name] || 0) + 1;
    });

    const reportsByEngine = Object.keys(engineCounts).map(name => ({
        name: name.replace(/([A-Z])/g, ' $1').trim(), // De-camelCase if needed
        value: engineCounts[name]
    }));

    // Activity Feed (Top 5 most recent)
    const recentActivity = reports
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5)
        .map(r => ({
            id: r.reportId,
            action: `Generated ${r.engineName} Report`,
            time: new Date(r.createdAt).toLocaleDateString(),
            type: r.status === 'approved' ? 'success' : 'info'
        }));

    return json({
        user,
        company,
        metrics: {
            totalReports,
            activeAssessments,
            completionRate,
            transformationProgress: 15 + (completedReports * 10) // Mock progress calc based on real usage
        },
        charts: {
            reportsByEngine
        },
        recentActivity
    });
}

const COLORS = ["#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#84cc16", "#eab308"];

export default function CompanySummary() {
    const { user, company, metrics, charts, recentActivity } = useLoaderData<typeof loader>();

    // Fallback if no company (User hasn't onboarded)
    if (!company) {
        return (
            <Layout>
                <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center text-white">
                    <h1 className="text-4xl font-bold mb-4">Welcome, {user.first_name}!</h1>
                    <p className="text-xl text-gray-400 mb-8">You haven't set up a company profile yet.</p>
                    <Link to="/onboarding/company" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all">
                        Create Company Profile 🚀
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout user={user}>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-4 md:p-8">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl text-white font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        {company.company_name} Dashboard
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Industry: <span className="text-cyan-300">{company.industry}</span> |
                        Logged in as: <span className="text-white">{user.first_name} {user.last_name}</span>
                    </p>
                </motion.div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Transformation Progress"
                        value={`${metrics.transformationProgress}%`}
                        change={metrics.transformationProgress > 0 ? "Active" : "Start now"}
                        trend="up"
                        icon="📈"
                        gradient="from-cyan-500 to-blue-500"
                    />
                    <MetricCard
                        title="Active Assessments"
                        value={metrics.activeAssessments.toString()}
                        change={metrics.activeAssessments > 0 ? "In Progress" : "None"}
                        trend="up"
                        icon="📊"
                        gradient="from-purple-500 to-pink-500"
                    />
                    <MetricCard
                        title="Reports Generated"
                        value={metrics.totalReports.toString()}
                        change="Total"
                        trend="up"
                        icon="🤖"
                        gradient="from-orange-500 to-red-500"
                    />
                    <MetricCard
                        title="Completion Rate"
                        value={`${metrics.completionRate}%`}
                        change="Of total"
                        trend="up"
                        icon="✅"
                        gradient="from-green-500 to-emerald-500"
                    />
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8"
                >
                    <h2 className="text-2xl text-white font-bold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        <QuickActionButton icon="🎯" label="Start Assessment" to="/startTransformationDashboard" />
                        <QuickActionButton icon="📋" label="View Reports" to="/receiptsDashboard" />
                        <QuickActionButton icon="🗺️" label="Roadmap" to="/roadmapDashboard" />
                        <QuickActionButton icon="🔄" label="Change Mgmt" to="/changeDashboard" />
                        <QuickActionButton icon="🏢" label="Vendors" to="/vendorDashboard" />
                        <QuickActionButton icon="⚙️" label="Settings" to="/userSettingsDashboard" />
                    </div>
                </motion.div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

                    {/* Activity Feed */}
                    <div className="lg:col-span-1 space-y-8">
                        <ChartCard title="Recent Activity" icon="🕐">
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-400' : 'bg-blue-400'}`} />
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium group-hover:text-cyan-300 transition-colors">
                                                    {activity.action}
                                                </p>
                                                <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                )) : (
                                    <p className="text-gray-400 text-sm">No recent activity found.</p>
                                )}
                            </div>
                        </ChartCard>
                    </div>

                    {/* Chart: Reports by Engine */}
                    <div className="lg:col-span-2">
                        <ChartCard title="Usage by Engine" icon="📊">
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={charts.reportsByEngine}>
                                    <XAxis dataKey="name" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(148, 163, 184, 0.3)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Bar dataKey="value" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                                        {charts.reportsByEngine.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </div>

                {/* AI Insights & Recommendations (Static for now, but could be dynamic) */}
                <motion.div
                    className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">💡</span>
                        <h2 className="text-2xl font-bold text-white">Latest AI Recommendations for {company.company_name}</h2>
                    </div>
                    {metrics.totalReports > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-cyan-300">Strengths</h3>
                                <ul className="space-y-2 text-gray-200">
                                    <li className="flex items-start gap-2">
                                        <span className="text-green-400 mt-1">✓</span>
                                        <span>Active engagement in <span className="text-cyan-300 font-medium">{charts.reportsByEngine[0]?.name || "Assessment"}</span></span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-orange-300">Next Steps</h3>
                                <ul className="space-y-2 text-gray-200">
                                    <li className="flex items-start gap-2">
                                        <span className="text-orange-400 mt-1">→</span>
                                        <span>Consider exploring the Roadmap Dashboard to visualize next steps.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-300">Start an assessment to generate AI-powered insights for your organization.</p>
                    )}
                </motion.div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(148, 163, 184, 0.3);
                    border-radius: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(148, 163, 184, 0.5);
                }
            `}</style>
        </Layout>
    );
}

// Reuse Sub-Components
function ChartCard({ title, children, icon }: { title: string, children: React.ReactNode, icon?: string }) {
    return (
        <motion.div
            className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            whileHover={{ y: -5 }}
        >
            <div className="flex items-center gap-2 mb-4">
                {icon && <span className="text-2xl">{icon}</span>}
                <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{title}</h3>
            </div>
            {children}
        </motion.div>
    );
}

function MetricCard({ title, value, change, trend, icon, gradient }: {
    title: string,
    value: string,
    change: string,
    trend: 'up' | 'down',
    icon: string,
    gradient: string
}) {
    return (
        <motion.div
            className="relative overflow-hidden bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05, y: -5 }}
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <div className="relative">
                <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{icon}</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {change}
                    </span>
                </div>
                <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
                <p className="text-white text-3xl font-bold">{value}</p>
            </div>
        </motion.div>
    );
}

function QuickActionButton({ icon, label, to }: { icon: string, label: string, to: string }) {
    return (
        <Link to={to}>
            <motion.div
                className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-xl p-4 hover:bg-white/10 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group text-center"
                whileHover={{ scale: 1.05, y: -3 }}
                whileTap={{ scale: 0.95 }}
            >
                <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{icon}</div>
                <p className="text-white text-xs font-medium group-hover:text-cyan-300 transition-colors">{label}</p>
            </motion.div>
        </Link>
    );
}