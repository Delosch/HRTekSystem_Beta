import { Link, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import {
    ArrowPathIcon,
    BellIcon,
    BuildingOffice2Icon, // For Total Companies & New Company Onboarded activity
    UsersIcon, // For Total Users
    ClipboardDocumentCheckIcon, // For Active Assessments
    CogIcon, // For Engine Usage / System
    ReceiptPercentIcon, // For Pending Invoices / Invoice Requested activity
    PencilSquareIcon, // For Blogs / New Blog Drafts
    ClockIcon, // For Activity logs / Tasks
    CheckCircleIcon, // For tasks/completion
    ExclamationCircleIcon, // For alerts/warnings / Urgent Tasks
    ChartBarIcon, // For Charts / Website Metrics
    PlusIcon, // For Quick Action: Add New Company
    AcademicCapIcon, // For assessments/AI reports
    GlobeAltIcon, // For Website Metrics
    SparklesIcon, // For Testimonials
    ServerStackIcon, // For System Health / CRM Sync
    ArrowLongRightIcon, // For generic activity links
    TagIcon, // For blog categories
    MegaphoneIcon, // For expiring banners
} from "@heroicons/react/24/outline";

// --- Interfaces ---
interface QuickStatCardProps {
    title: string;
    value: string | number;
    description: string;
    iconName: keyof typeof iconMap; // Using keyof typeof iconMap for type safety
    bgColorClass: string;
    textColorClass: string;
    linkHref?: string;
}

interface ActivityLog {
    id: number;
    message: string;
    time: string;
    type: "company" | "assessment" | "report" | "invoice" | "role" | "blog" | "system"; // Updated types
    link?: string;
}

interface TopEngine {
    name: string;
    usagePercentage: number;
    companiesUsed: number;
}

interface WebsiteMetrics {
    visitorsToday: string;
    visitorsThisWeek: string;
    topLandingPages: { name: string; views: string; link: string }[];
    mostSearchedTopics: { topic: string; searches: number }[];
    leadsGenerated: number;
}

interface AdminTask {
    id: number;
    title: string;
    status: "pending" | "review" | "urgent"; // Changed to reflect task types
    link?: string;
}

interface BlogPostActivity {
    id: number;
    title: string;
    status: "published" | "scheduled" | "draft" | "approval";
    date: string;
    link: string;
}

interface SystemHealth {
    crmSyncStatus: "ok" | "warning" | "error";
    analyticsConnection: "ok" | "error";
    bannerExpirationWarnings: number;
    lastSyncTime: string;
}

interface DashboardData {
    adminName: string;
    lastLogin: string;
    notificationCount: number;
    quickStats: QuickStatCardProps[];
    recentActivity: ActivityLog[];
    quickActions: QuickAction[];
    tasks: TaskItem[]; // Keep existing TaskItem interface for now, will map to AdminTask later
    topEngines: TopEngine[];
    websiteMetrics: WebsiteMetrics;
    adminTasks: AdminTask[]; // New Admin Tasks section
    recentBlogActivity: BlogPostActivity[];
    systemHealth: SystemHealth;
}

interface QuickAction {
    name: string;
    href: string;
    iconName: keyof typeof iconMap;
    description: string;
}

interface TaskItem { // This is for 'Your Tasks' (personal tasks)
    id: number;
    title: string;
    status: "pending" | "completed" | "urgent";
    dueDate?: string;
}

// Icon mapping object - maps string identifiers to actual React components
const iconMap = {
    ArrowPathIcon,
    BellIcon,
    BuildingOffice2Icon,
    UsersIcon,
    ClipboardDocumentCheckIcon,
    CogIcon,
    ReceiptPercentIcon,
    PencilSquareIcon,
    ClockIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    ChartBarIcon,
    PlusIcon,
    AcademicCapIcon,
    GlobeAltIcon,
    SparklesIcon,
    ServerStackIcon,
    ArrowLongRightIcon,
    TagIcon,
    MegaphoneIcon,
} as const; // `as const` ensures string literal types for keys

// --- Loader Function ---
export const loader = async () => {
    const now = new Date();
    // Use ISO string to avoid hydration mismatch between server and client
    const currentLoginTime = now.toISOString();

    // Fetch real stats from DynamoDB
    const { getDashboardStats } = await import("~/lib/admin.dashboard.server");
    const stats = await getDashboardStats();

    const data: DashboardData = {
        adminName: "Admin User",
        lastLogin: currentLoginTime,
        notificationCount: stats.pendingPayments + stats.pendingInvoices,
        quickStats: [
            {
                title: "Total Companies",
                value: stats.totalCompanies.toLocaleString(),
                description: "Registered companies on the platform",
                iconName: "BuildingOffice2Icon",
                bgColorClass: "bg-indigo-50",
                textColorClass: "text-indigo-600",
                linkHref: "/admin/companies",
            },
            {
                title: "Total Users",
                value: stats.totalUsers.toLocaleString(),
                description: "All users across all companies",
                iconName: "UsersIcon",
                bgColorClass: "bg-green-50",
                textColorClass: "text-green-600",
                linkHref: "/admin/users",
            },
            {
                title: "Active Assessments",
                value: stats.activeAssessments.toLocaleString(),
                description: "Assessments currently in progress",
                iconName: "ClipboardDocumentCheckIcon",
                bgColorClass: "bg-yellow-50",
                textColorClass: "text-yellow-600",
                linkHref: "/admin/assessments",
            },
            {
                title: "Pending Payments",
                value: stats.pendingPayments.toString(),
                description: "Payment verifications awaiting review",
                iconName: "ReceiptPercentIcon",
                bgColorClass: "bg-orange-50",
                textColorClass: "text-orange-600",
                linkHref: "/admin/payments/verification",
            },
            {
                title: "Pending Invoices",
                value: stats.pendingInvoices.toString(),
                description: "Invoice requests awaiting your action",
                iconName: "ReceiptPercentIcon",
                bgColorClass: "bg-red-50",
                textColorClass: "text-red-600",
                linkHref: "/admin/invoices?status=pending",
            },
        ],
        recentActivity: [
            { id: 1, message: "Payment proof submitted for Invoice #INV-2025-ABC123", time: "2 min ago", type: "invoice", link: "/admin/payments/verification" },
            { id: 2, message: "New company 'Global Solutions' onboarded", time: "5 min ago", type: "company", link: "/admin/companies/global-solutions" },
            { id: 3, message: "Assessment completed for 'Tech Innovations'", time: "1 hour ago", type: "assessment", link: "/admin/assessments/tech-innovations-ai" },
            { id: 4, message: "AI report 'Q2 Marketing Insights' submitted by 'Alpha Corp'", time: "3 hours ago", type: "report", link: "/admin/reports/marketing-insights-q2" },
            { id: 5, message: "Invoice #9876 requested by 'Innovate Labs'", time: "Yesterday", type: "invoice", link: "/admin/invoices/9876" },
            { id: 6, message: "Role 'Analyst' assigned to 'Sarah Connor' in 'Cyberdyne Systems'", time: "2 days ago", type: "role", link: "/admin/roles/analyst" },
            { id: 7, message: "New blog post 'Future of HR Tech' drafted", time: "3 days ago", type: "blog", link: "/admin/blogs/future-of-hr-tech/edit" },
            { id: 8, message: "System performance alert: CPU usage high", time: "4 days ago", type: "system" },
        ],
        quickActions: [
            {
                name: "Add New Company",
                href: "/admin/companies/new",
                iconName: "PlusIcon",
                description: "Onboard a new client to the platform.",
            },
            {
                name: "Create Blog Post",
                href: "/admin/blogs/new",
                iconName: "PencilSquareIcon",
                description: "Draft and publish a new article.",
            },
            {
                name: "Review AI Reports",
                href: "/admin/reports?status=pending",
                iconName: "AcademicCapIcon",
                description: "Approve AI-generated reports.",
            },
        ],
        tasks: [ // This is for 'Your Tasks' (personal tasks)
            { id: 1, title: "Review 3 pending client applications", status: "urgent", dueDate: "Today" },
            { id: 2, title: "Approve new user registrations", status: "pending", dueDate: "ASAP" },
            { id: 3, title: "Update privacy policy document", status: "pending", dueDate: "Jul 31, 2025" },
            { id: 4, title: "Schedule Q3 performance review", status: "completed" },
        ],
        topEngines: [
            { name: "HCM Fit Engine", usagePercentage: 35, companiesUsed: 436 },
            { name: "HR Digital Roadmap", usagePercentage: 25, companiesUsed: 310 },
            { name: "HR Tech Maturity", usagePercentage: 15, companiesUsed: 180 },
            { name: "Shared Services", usagePercentage: 10, companiesUsed: 120 },
            { name: "Change Management", usagePercentage: 8, companiesUsed: 95 },
        ],
        websiteMetrics: {
            visitorsToday: "8,921",
            visitorsThisWeek: "56,789",
            topLandingPages: [
                { name: "/hr-tech-maturity-assessment", views: "1,200", link: "/page/hr-tech-maturity-assessment" },
                { name: "/blog/future-of-hr-tech", views: "950", link: "/blog/future-of-hr-tech" },
                { name: "/contact-us", views: "780", link: "/page/contact-us" },
            ],
            mostSearchedTopics: [
                { topic: "AI in HR", searches: 210 },
                { topic: "Remote work policy", searches: 150 },
                { topic: "Employee engagement", searches: 130 },
            ],
            leadsGenerated: 45,
        },
        adminTasks: [ // Specific Admin Tasks/Action Center
            { id: 1, title: `Payment Verifications Pending: ${stats.pendingPayments}`, status: stats.pendingPayments > 0 ? "urgent" : "pending", link: "/admin/payments/verification" },
            { id: 2, title: "AI Report Approvals Pending: 5", status: "pending", link: "/admin/reports?status=pending" },
            { id: 3, title: "Companies Awaiting Onboarding: 2", status: "urgent", link: "/admin/companies?status=awaiting-onboarding" },
            { id: 4, title: "New Blog Drafts to Review: 3", status: "review", link: "/admin/blogs?status=drafts" },
            { id: 5, title: "Testimonials Pending Review: 8", status: "pending", link: "/admin/testimonials?status=pending" },
            { id: 6, title: "Expiring banners (2 notices)", status: "urgent", link: "/admin/website/banners" },
            { id: 7, title: "SEO notices (3 critical)", status: "urgent", link: "/admin/website/seo" },
        ],
        recentBlogActivity: [
            { id: 1, title: "The Future of Hybrid Workforces", status: "published", date: "Jul 20, 2025", link: "/admin/blogs/hybrid-workforces" },
            { id: 2, title: "Leveraging AI for Talent Acquisition", status: "published", date: "Jul 15, 2025", link: "/admin/blogs/ai-talent-acquisition" },
            { id: 3, title: "Q3 HR Tech Trends Report", status: "scheduled", date: "Aug 01, 2025", link: "/admin/blogs/q3-hr-tech-trends" },
            { id: 4, title: "Onboarding Best Practices 2025 (Draft)", status: "draft", date: "Jul 22, 2025", link: "/admin/blogs/onboarding-best-practices/edit" },
            { id: 5, title: "Employee Wellbeing Strategies (Awaiting Approval)", status: "approval", date: "Jul 24, 2025", link: "/admin/blogs/employee-wellbeing/review" },
        ],
        systemHealth: {
            crmSyncStatus: "ok",
            analyticsConnection: "ok",
            bannerExpirationWarnings: 2,
            lastSyncTime: "2025-07-27 1:05 PM IST",
        },
    };

    return json(data);
};

// --- Reusable Components ---

// Quick Stat Card Component (Uses iconName string)
function QuickStatCard({ title, value, description, iconName, bgColorClass, textColorClass, linkHref }: QuickStatCardProps) {
    const IconComponent = iconMap[iconName];
    if (!IconComponent) {
        console.warn(`Icon ${iconName} not found in iconMap.`);
        return null; // Or render a placeholder/default icon
    }

    const CardContent = (
        <>
            <div>
                <div className="flex items-center mb-2">
                    <IconComponent className={`h-6 w-6 ${textColorClass} mr-2`} aria-hidden="true" />
                    <h3 className="text-sm font-medium text-gray-700">{title}</h3>
                </div>
                <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
            </div>
            <p className="mt-3 text-sm text-gray-500">{description}</p>
        </>
    );

    return linkHref ? (
        <Link to={linkHref} className={`rounded-lg ${bgColorClass} p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-lg transition-shadow duration-200`}>
            {CardContent}
        </Link>
    ) : (
        <div className={`rounded-lg ${bgColorClass} p-5 shadow-sm border border-gray-200 flex flex-col justify-between`}>
            {CardContent}
        </div>
    );
}

// Helper function for conditional class names
function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(" ");
}

// --- Main Dashboard Component ---
export default function AdminDashboardIndex() {
    const {
        adminName,
        lastLogin,
        notificationCount,
        quickStats,
        recentActivity,
        quickActions,
        tasks, // Your personal tasks
        topEngines,
        websiteMetrics,
        adminTasks, // Admin-level tasks/action center
        recentBlogActivity,
        systemHealth,
    } = useLoaderData<typeof loader>();

    const handleRefresh = () => {
        // In a production app, you'd use useRevalidator from Remix for a soft refresh:
        // import { useRevalidator } from "@remix-run/react";
        // const revalidator = useRevalidator();
        // revalidator.revalidate();
        alert("Refreshing dashboard data...");
        window.location.reload(); // Simple full page refresh for demo purposes
    };

    const handleNotificationsClick = () => {
        alert(`You have ${notificationCount} new notifications! Redirecting to /admin/notifications.`);
        // window.location.href = "/admin/notifications"; // Example redirect
    };

    return (
        <div className="bg-gray-100 min-h-screen pb-10">


            {/* 2. Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
                {quickStats.map((stat) => (
                    <QuickStatCard key={stat.title} {...stat} />
                ))}
            </div>

            {/* Main Content Grid: Recent Activity, Quick Actions, Admin Tasks, System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* 3. Recent Activity Feed */}
                <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <ul className="divide-y divide-gray-200">
                        {recentActivity.length > 0 ? (
                            recentActivity.map((activity) => {
                                const ActivityIcon = {
                                    company: BuildingOffice2Icon,
                                    assessment: ClipboardDocumentCheckIcon,
                                    report: AcademicCapIcon,
                                    invoice: ReceiptPercentIcon,
                                    role: UsersIcon, // Or a more specific role icon if available
                                    blog: PencilSquareIcon,
                                    system: CogIcon,
                                }[activity.type];

                                return (
                                    <li key={activity.id} className="py-4 flex items-center justify-between">
                                        <div className="flex items-center">
                                            <span className="mr-3 text-gray-500">
                                                {ActivityIcon && <ActivityIcon className="h-5 w-5" />}
                                            </span>
                                            <p className="text-sm text-gray-800">
                                                {activity.link ? (
                                                    <Link to={activity.link} className="hover:underline text-indigo-600">
                                                        {activity.message}
                                                    </Link>
                                                ) : (
                                                    activity.message
                                                )}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500">{activity.time}</span>
                                    </li>
                                );
                            })
                        ) : (
                            <p className="text-sm text-gray-500 py-3">No recent activity to display.</p>
                        )}
                    </ul>
                    <div className="mt-6 text-center">
                        <Link
                            to="/admin/activity-logs"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            View All Activity
                        </Link>
                    </div>
                </div>

                {/* Quick Actions (existing) */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        {quickActions.map((action) => {
                            const ActionIcon = iconMap[action.iconName];
                            if (!ActionIcon) {
                                console.warn(`Icon ${action.iconName} not found for quick action.`);
                                return null;
                            }
                            return (
                                <Link
                                    key={action.name}
                                    to={action.href}
                                    className="block p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 group"
                                >
                                    <div className="flex items-center mb-2">
                                        <ActionIcon className="h-6 w-6 text-indigo-500 mr-3 group-hover:text-indigo-600" aria-hidden="true" />
                                        <h3 className="text-lg font-medium text-gray-800 group-hover:text-gray-900">{action.name}</h3>
                                    </div>
                                    <p className="text-sm text-gray-600">{action.description}</p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* More Dashboard Sections Grid: Top Performing Engines, Website Metrics, Admin Tasks, Blog Activity, System Health */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                {/* 4. Top Performing Engines */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Engines</h2>
                    <div className="space-y-4">
                        {topEngines.length > 0 ? (
                            topEngines.map((engine) => (
                                <div key={engine.name} className="flex items-center">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className="bg-indigo-600 h-2.5 rounded-full"
                                            style={{ width: `${engine.usagePercentage}%` }}
                                        ></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700 whitespace-nowrap">
                                        {engine.name} ({engine.usagePercentage}%)
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500">No engine usage data available.</p>
                        )}
                    </div>
                    <div className="mt-6 text-center">
                        <Link
                            to="/admin/analytics/engines"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            View Full Report
                        </Link>
                    </div>
                </div>

                {/* 5. Website Metrics Snapshot */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <GlobeAltIcon className="h-6 w-6 text-blue-500 mr-2" />
                        Website Metrics Snapshot
                    </h2>
                    <div className="space-y-4 text-sm text-gray-700">
                        <p className="flex justify-between items-center">
                            <span>Visitors Today:</span>
                            <span className="font-semibold text-lg text-indigo-700">{websiteMetrics.visitorsToday}</span>
                        </p>
                        <p className="flex justify-between items-center">
                            <span>Visitors This Week:</span>
                            <span className="font-semibold text-lg text-indigo-700">{websiteMetrics.visitorsThisWeek}</span>
                        </p>
                        <p className="flex justify-between items-center">
                            <span>Leads Generated:</span>
                            <span className="font-semibold text-lg text-green-700">{websiteMetrics.leadsGenerated}</span>
                        </p>
                        <div className="mt-4">
                            <h3 className="font-medium text-gray-800 mb-2">Top Landing Pages:</h3>
                            <ul className="space-y-1">
                                {websiteMetrics.topLandingPages.map((page, index) => (
                                    <li key={index} className="flex justify-between items-center">
                                        <Link to={page.link} className="hover:underline text-indigo-600 truncate">{page.name}</Link>
                                        <span className="ml-2 text-gray-500">{page.views} views</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4">
                            <h3 className="font-medium text-gray-800 mb-2">Most Searched Blog Topics:</h3>
                            <ul className="space-y-1">
                                {websiteMetrics.mostSearchedTopics.map((topic, index) => (
                                    <li key={index} className="flex justify-between items-center">
                                        <span className="text-gray-700">{topic.topic}</span>
                                        <span className="ml-2 text-gray-500">{topic.searches} searches</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <div className="mt-6 text-center">
                        <Link
                            to="/admin/analytics/website"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            View All Website Analytics
                        </Link>
                    </div>
                </div>

                {/* 6. Admin Tasks / Action Center */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <ExclamationCircleIcon className="h-6 w-6 text-orange-500 mr-2" />
                        Admin Action Center
                    </h2>
                    <ul className="divide-y divide-gray-200">
                        {adminTasks.length > 0 ? (
                            adminTasks.map((task) => (
                                <li key={task.id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center">
                                        {task.status === "urgent" && (
                                            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" aria-hidden="true" />
                                        )}
                                        {task.status === "pending" && (
                                            <ClockIcon className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                                        )}
                                        {task.status === "review" && (
                                            <PencilSquareIcon className="h-5 w-5 text-blue-500 mr-3" aria-hidden="true" />
                                        )}
                                        <span className={classNames(
                                            task.status === "urgent" ? "text-red-700 font-semibold" : "text-gray-800",
                                            "text-sm"
                                        )}>
                                            {task.link ? <Link to={task.link} className="hover:underline">{task.title}</Link> : task.title}
                                        </span>
                                    </div>
                                    {task.status === "urgent" && <span className="text-xs text-red-600 font-semibold">URGENT</span>}
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 py-3">No immediate admin actions pending.</p>
                        )}
                    </ul>
                    <div className="mt-6 text-center">
                        <Link
                            to="/admin/tasks"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            View All Admin Tasks
                        </Link>
                    </div>
                </div>

                {/* 7. Recent Blog Activity */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <PencilSquareIcon className="h-6 w-6 text-purple-500 mr-2" />
                        Recent Blog Activity
                    </h2>
                    <ul className="divide-y divide-gray-200">
                        {recentBlogActivity.length > 0 ? (
                            recentBlogActivity.map((post) => (
                                <li key={post.id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center">
                                        {post.status === "published" && <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />}
                                        {post.status === "scheduled" && <ClockIcon className="h-5 w-5 text-blue-500 mr-3" />}
                                        {post.status === "draft" && <PencilSquareIcon className="h-5 w-5 text-gray-400 mr-3" />}
                                        {post.status === "approval" && <ExclamationCircleIcon className="h-5 w-5 text-orange-500 mr-3" />}
                                        <Link to={post.link} className="text-sm font-medium text-gray-800 hover:underline">
                                            {post.title}
                                        </Link>
                                    </div>
                                    <span className="text-xs text-gray-500">{post.date}</span>
                                </li>
                            ))
                        ) : (
                            <p className="text-sm text-gray-500 py-3">No recent blog activity.</p>
                        )}
                    </ul>
                    <div className="mt-6 text-center">
                        <Link
                            to="/admin/blogs"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            Manage All Blogs
                        </Link>
                    </div>
                </div>

                {/* 8. System Health */}
                <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                        <ServerStackIcon className="h-6 w-6 text-gray-500 mr-2" />
                        System Health
                    </h2>
                    <div className="space-y-3 text-sm">
                        <p className="flex justify-between items-center">
                            <span className="text-gray-700">CRM Sync Status:</span>
                            <span className={classNames(
                                systemHealth.crmSyncStatus === "ok" ? "text-green-600" : "text-red-600",
                                "font-medium"
                            )}>
                                {systemHealth.crmSyncStatus.toUpperCase()}
                            </span>
                        </p>
                        <p className="flex justify-between items-center">
                            <span className="text-gray-700">Analytics Connection:</span>
                            <span className={classNames(
                                systemHealth.analyticsConnection === "ok" ? "text-green-600" : "text-red-600",
                                "font-medium"
                            )}>
                                {systemHealth.analyticsConnection.toUpperCase()}
                            </span>
                        </p>
                        <p className="flex justify-between items-center">
                            <span className="text-gray-700">Banner Expiration Warnings:</span>
                            <span className={classNames(
                                systemHealth.bannerExpirationWarnings > 0 ? "text-red-600" : "text-green-600",
                                "font-medium"
                            )}>
                                {systemHealth.bannerExpirationWarnings}
                            </span>
                        </p>
                        <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                            Last System Check: {systemHealth.lastSyncTime}
                        </p>
                    </div>
                    <div className="mt-6 text-center">
                        <Link
                            to="/admin/system/health"
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            View System Details
                        </Link>
                    </div>
                </div>
            </div>

            {/* Existing Personal Tasks Section (now separate from Admin Action Center) */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Personal Tasks</h2>
                <ul className="divide-y divide-gray-200">
                    {tasks.length > 0 ? (
                        tasks.map((task) => (
                            <li key={task.id} className="py-3 flex items-center justify-between">
                                <div className="flex items-center">
                                    {task.status === "completed" && (
                                        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" aria-hidden="true" />
                                    )}
                                    {task.status === "pending" && (
                                        <ClockIcon className="h-5 w-5 text-gray-400 mr-3" aria-hidden="true" />
                                    )}
                                    {task.status === "urgent" && (
                                        <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-3" aria-hidden="true" />
                                    )}
                                    <span className={classNames(
                                        task.status === "completed" ? "text-gray-500 line-through" : "text-gray-800",
                                        "text-sm font-medium"
                                    )}>
                                        {task.title}
                                    </span>
                                </div>
                                {task.dueDate && (
                                    <span className={classNames(
                                        task.status === "urgent" ? "text-red-600 font-semibold" : "text-gray-500",
                                        "text-xs"
                                    )}>
                                        {task.dueDate}
                                    </span>
                                )}
                            </li>
                        ))
                    ) : (
                        <p className="text-sm text-gray-500 py-3">No personal tasks assigned.</p>
                    )}
                </ul>
                <div className="mt-6 text-center">
                    <Link
                        to="/admin/tasks/personal" // A page for personal tasks
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Manage All Personal Tasks
                    </Link>
                </div>
            </div>

            {/* Bonus: Customize Dashboard Layout (Conceptual Section) */}
            <div className="mt-8 bg-white rounded-lg shadow-md p-6 border border-gray-200 text-center">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Customize Your Dashboard</h2>
                <p className="text-gray-600 mb-4">
                    In a production-grade system, you can offer features like:
                </p>
                <ul className="list-disc list-inside text-gray-600 text-left mx-auto max-w-md space-y-2">
                    <li>**Drag-and-drop widgets:** Rearrange sections to suit your workflow.</li>
                    <li>**Select what cards to show:** Personalize your view by hiding/showing specific metrics.</li>
                    <li>**Role-based widget visibility:** Configure different dashboards for various admin roles.</li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                    (These features require complex UI state management and backend persistence, beyond the scope of this static example.)
                </p>
            </div>
        </div>
    );
}
