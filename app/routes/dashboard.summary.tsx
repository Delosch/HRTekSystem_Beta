import { Layout } from "~/components/Layout";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, LineChart, Line, Area, AreaChart } from "recharts";
import { motion } from "framer-motion";
import { Link } from "@remix-run/react";

export default function CompanySummary() {
    // Dummy data — replace with real data later
    const employeesData = [
        { name: "<50", value: 10 },
        { name: "51–200", value: 20 },
        { name: "201–500", value: 30 },
        { name: "501–1000", value: 15 },
        { name: "1000+", value: 25 }
    ];

    const industryData = [
        { name: "IT / Software", value: 40 },
        { name: "Manufacturing", value: 20 },
        { name: "Healthcare", value: 10 },
        { name: "Retail / FMCG", value: 10 },
        { name: "Financial Services", value: 10 },
        { name: "Education", value: 5 },
        { name: "Other", value: 5 }
    ];

    const goalsData = [
        { name: "Market Expansion", value: 1 },
        { name: "Cost Reduction", value: 1 },
        { name: "Innovation", value: 1 },
        { name: "Customer Experience", value: 0 },
        { name: "Employee Engagement", value: 1 },
        { name: "Sustainability", value: 0 }
    ];

    const digitalStrategyData = [
        { name: "Well-defined strategy", value: 50 },
        { name: "Some initiatives", value: 30 },
        { name: "Exploring", value: 15 },
        { name: "Not a focus", value: 5 }
    ];

    const cultureData = [
        { name: "Innovative & Agile", value: 30 },
        { name: "Risk-Averse & Stable", value: 20 },
        { name: "Hierarchical", value: 10 },
        { name: "Collaborative", value: 25 },
        { name: "Customer-Centric", value: 10 },
        { name: "Results-Driven", value: 5 }
    ];

    const learningData = [
        { name: "Deeply embedded", value: 40 },
        { name: "Encouraged", value: 30 },
        { name: "Some departments", value: 20 },
        { name: "Not really", value: 10 }
    ];

    const investmentData = [
        { name: "Very high", value: 35 },
        { name: "Moderate", value: 40 },
        { name: "Cautious", value: 15 },
        { name: "Low", value: 10 }
    ];

    const itLandscapeData = [
        { name: "Cloud-First", value: 50 },
        { name: "On-Premise", value: 20 },
        { name: "Hybrid", value: 25 },
        { name: "Legacy Systems", value: 5 }
    ];

    // New data for enhanced dashboard
    const transformationProgress = [
        { month: "Jan", progress: 15 },
        { month: "Feb", progress: 28 },
        { month: "Mar", progress: 42 },
        { month: "Apr", progress: 58 },
        { month: "May", progress: 65 },
        { month: "Jun", progress: 73 }
    ];

    const recentActivities = [
        { id: 1, action: "Completed Tech Maturity Assessment", time: "2 hours ago", type: "success" },
        { id: 2, action: "New Vendor Evaluation Started", time: "5 hours ago", type: "info" },
        { id: 3, action: "Change Management Dashboard Updated", time: "1 day ago", type: "update" },
        { id: 4, action: "Roadmap Milestone Achieved", time: "2 days ago", type: "success" },
        { id: 5, action: "AI Analysis Report Generated", time: "3 days ago", type: "info" }
    ];

    const COLORS = ["#06b6d4", "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#f97316", "#84cc16", "#eab308"];

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 p-4 md:p-8">
                {/* Hero Section with Key Metrics */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl md:text-5xl text-white font-bold mb-2 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                        HR Transformation Dashboard
                    </h1>
                    <p className="text-gray-400 text-lg">Welcome back! Here's your company's transformation overview</p>
                </motion.div>

                {/* Key Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MetricCard
                        title="Transformation Progress"
                        value="73%"
                        change="+8%"
                        trend="up"
                        icon="📈"
                        gradient="from-cyan-500 to-blue-500"
                    />
                    <MetricCard
                        title="Active Assessments"
                        value="5"
                        change="+2"
                        trend="up"
                        icon="📊"
                        gradient="from-purple-500 to-pink-500"
                    />
                    <MetricCard
                        title="AI Insights Generated"
                        value="127"
                        change="+23"
                        trend="up"
                        icon="🤖"
                        gradient="from-orange-500 to-red-500"
                    />
                    <MetricCard
                        title="Completion Rate"
                        value="89%"
                        change="+5%"
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
                        <QuickActionButton icon="📋" label="View Reports" to="/analysisDashboard" />
                        <QuickActionButton icon="🗺️" label="Roadmap" to="/roadmapDashboard" />
                        <QuickActionButton icon="🔄" label="Change Mgmt" to="/changeDashboard" />
                        <QuickActionButton icon="🏢" label="Vendors" to="/vendorDashboard" />
                        <QuickActionButton icon="⚙️" label="Settings" to="/userSettingsDashboard" />
                    </div>
                </motion.div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Left Column - Progress & AI Insights */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Transformation Progress Chart */}
                        <ChartCard title="Transformation Progress Over Time" icon="📈">
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={transformationProgress}>
                                    <defs>
                                        <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" stroke="#94a3b8" />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                            border: '1px solid rgba(148, 163, 184, 0.3)',
                                            borderRadius: '8px'
                                        }}
                                    />
                                    <Area type="monotone" dataKey="progress" stroke="#06b6d4" fillOpacity={1} fill="url(#progressGradient)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        {/* AI-Powered Insights */}
                        <motion.div
                            className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 border border-purple-500/30 backdrop-blur-xl rounded-2xl shadow-2xl p-6"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <span className="text-3xl">🤖</span>
                                <h3 className="text-xl font-bold text-white">AI-Powered Insights</h3>
                            </div>
                            <div className="space-y-4">
                                <InsightCard
                                    type="success"
                                    title="Strong Digital Foundation"
                                    description="Your cloud-first approach positions you well for rapid transformation. Consider expanding hybrid capabilities."
                                />
                                <InsightCard
                                    type="warning"
                                    title="Change Management Focus Needed"
                                    description="Employee engagement scores suggest increased communication around transformation initiatives would be beneficial."
                                />
                                <InsightCard
                                    type="info"
                                    title="Vendor Optimization Opportunity"
                                    description="Analysis shows potential 23% cost savings through vendor consolidation in shared services."
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Recent Activity */}
                    <div className="space-y-8">
                        <ChartCard title="Recent Activity" icon="🕐">
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {recentActivities.map((activity, index) => (
                                    <motion.div
                                        key={activity.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg p-4 transition-all duration-300 cursor-pointer group"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'success' ? 'bg-green-400' :
                                                    activity.type === 'info' ? 'bg-blue-400' :
                                                        'bg-purple-400'
                                                }`} />
                                            <div className="flex-1">
                                                <p className="text-white text-sm font-medium group-hover:text-cyan-300 transition-colors">
                                                    {activity.action}
                                                </p>
                                                <p className="text-gray-400 text-xs mt-1">{activity.time}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </ChartCard>
                    </div>
                </div>

                {/* Analytics Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Pie chart: Number of Employees */}
                    <ChartCard title="Number of Employees" icon="👥">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={employeesData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {employeesData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Pie chart: Industry */}
                    <ChartCard title="Industry / Sector" icon="🏭">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={industryData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={80}
                                    label
                                >
                                    {industryData.map((_, idx) => (
                                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Bar chart: Strategic Goals */}
                    <ChartCard title="Strategic Goals Selected" icon="🎯">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={goalsData}>
                                <XAxis dataKey="name" tick={{ fill: "#e0e7ff", fontSize: 10 }} />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="value" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Pie chart: Digital strategy */}
                    <ChartCard title="Digital Strategy Maturity" icon="💻">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={digitalStrategyData} cx="50%" cy="50%" dataKey="value" nameKey="name" outerRadius={80} label>
                                    {digitalStrategyData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Pie chart: Culture */}
                    <ChartCard title="Organizational Culture" icon="🏢">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={cultureData} cx="50%" cy="50%" dataKey="value" nameKey="name" outerRadius={80} label>
                                    {cultureData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Bar chart: Continuous learning */}
                    <ChartCard title="Culture of Continuous Learning" icon="📚">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={learningData}>
                                <XAxis dataKey="name" tick={{ fill: "#e0e7ff", fontSize: 10 }} />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Pie chart: Investment mindset */}
                    <ChartCard title="Leadership Investment Mindset" icon="💰">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={investmentData} cx="50%" cy="50%" dataKey="value" nameKey="name" outerRadius={80} label>
                                    {investmentData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>

                    {/* Pie chart: IT Landscape */}
                    <ChartCard title="Current IT Landscape" icon="☁️">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={itLandscapeData} cx="50%" cy="50%" dataKey="value" nameKey="name" outerRadius={80} label>
                                    {itLandscapeData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                                        border: '1px solid rgba(148, 163, 184, 0.3)',
                                        borderRadius: '8px'
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                {/* Key Insights Summary */}
                <motion.div
                    className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border border-cyan-500/30 backdrop-blur-xl rounded-2xl shadow-2xl p-8"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.6 }}
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">💡</span>
                        <h2 className="text-2xl font-bold text-white">Key Insights & Recommendations</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-cyan-300">Strengths</h3>
                            <ul className="space-y-2 text-gray-200">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Strong <span className="text-cyan-300 font-medium">cloud-first infrastructure</span> with 50% adoption</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>High <span className="text-cyan-300 font-medium">leadership investment appetite</span> (75% moderate-to-high)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Culture favors <span className="text-cyan-300 font-medium">innovation & collaboration</span> (55% combined)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-400 mt-1">✓</span>
                                    <span>Well-defined <span className="text-cyan-300 font-medium">digital strategy</span> in place (50%)</span>
                                </li>
                            </ul>
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-lg font-semibold text-orange-300">Areas for Improvement</h3>
                            <ul className="space-y-2 text-gray-200">
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">→</span>
                                    <span>Expand focus on <span className="text-orange-300 font-medium">customer experience</span> initiatives</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">→</span>
                                    <span>Strengthen <span className="text-orange-300 font-medium">sustainability</span> as a strategic goal</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">→</span>
                                    <span>Reduce dependency on <span className="text-orange-300 font-medium">legacy systems</span> (currently 5%)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-orange-400 mt-1">→</span>
                                    <span>Enhance <span className="text-orange-300 font-medium">continuous learning culture</span> across all departments</span>
                                </li>
                            </ul>
                        </div>
                    </div>
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

// Enhanced chart container with icon
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

// Metric card component
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
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                        {change}
                    </span>
                </div>
                <h3 className="text-gray-400 text-sm mb-2">{title}</h3>
                <p className="text-white text-3xl font-bold">{value}</p>
            </div>
        </motion.div>
    );
}

// Quick action button
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

// Insight card component
function InsightCard({ type, title, description }: {
    type: 'success' | 'warning' | 'info',
    title: string,
    description: string
}) {
    const colors = {
        success: 'border-green-500/30 bg-green-900/20',
        warning: 'border-yellow-500/30 bg-yellow-900/20',
        info: 'border-blue-500/30 bg-blue-900/20'
    };

    const icons = {
        success: '✅',
        warning: '⚠️',
        info: 'ℹ️'
    };

    return (
        <motion.div
            className={`${colors[type]} border rounded-xl p-4 hover:scale-[1.02] transition-transform duration-300`}
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl">{icons[type]}</span>
                <div>
                    <h4 className="text-white font-semibold mb-1">{title}</h4>
                    <p className="text-gray-300 text-sm">{description}</p>
                </div>
            </div>
        </motion.div>
    );
}