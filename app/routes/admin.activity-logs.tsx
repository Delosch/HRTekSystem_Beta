import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowLeftIcon, ClockIcon, UserIcon, ActivityIcon } from "lucide-react";

interface ActivityLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export const loader: LoaderFunction = async () => {
    // TODO: Fetch actual activity logs from database
    // For now, returning mock data
    const activityLogs: ActivityLog[] = [
        {
            id: '1',
            timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
            user: 'Admin User',
            action: 'Payment Verified',
            details: 'Verified payment for invoice INV-2024-001',
            type: 'success'
        },
        {
            id: '2',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            user: 'System',
            action: 'New Company Registration',
            details: 'Tech Solutions Pvt Ltd registered',
            type: 'info'
        },
        {
            id: '3',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            user: 'Admin User',
            action: 'Report Approved',
            details: 'Approved AI report for company XYZ Corp',
            type: 'success'
        },
        {
            id: '4',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            user: 'Admin User',
            action: 'Blog Post Created',
            details: 'Published new blog post: "HR Transformation Trends 2024"',
            type: 'info'
        },
        {
            id: '5',
            timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
            user: 'System',
            action: 'Assessment Completed',
            details: 'Company ABC completed HR Roadmap assessment',
            type: 'info'
        },
        {
            id: '6',
            timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
            user: 'Admin User',
            action: 'Payment Rejected',
            details: 'Rejected payment proof for invoice INV-2024-002 - Invalid document',
            type: 'warning'
        },
        {
            id: '7',
            timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
            user: 'System',
            action: 'Cart Updated',
            details: 'Company DEF added HCM Vendor Fit Engine to cart',
            type: 'info'
        },
        {
            id: '8',
            timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
            user: 'Admin User',
            action: 'Company Profile Updated',
            details: 'Updated profile for GHI Industries',
            type: 'info'
        }
    ];

    return json({ activityLogs });
};

export default function AdminActivityLogs() {
    const { activityLogs } = useLoaderData<typeof loader>();

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-100 text-green-800 border-green-200';
            case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'error': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/admin"
                        className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
                    >
                        <ArrowLeftIcon className="w-4 h-4 mr-2" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
                    <p className="text-gray-600 mt-2">Complete history of system activities and admin actions</p>
                </div>

                {/* Activity Timeline */}
                <div className="bg-white rounded-lg shadow-md border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                                <ActivityIcon className="w-6 h-6 text-indigo-600" />
                                Recent Activity
                            </h2>
                            <span className="text-sm text-gray-500">
                                {activityLogs.length} total activities
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-200">
                        {activityLogs.map((log) => (
                            <div
                                key={log.id}
                                className="p-6 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Icon */}
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(log.type)}`}>
                                        <ActivityIcon className="w-5 h-5" />
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {log.action}
                                                </h3>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {log.details}
                                                </p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <UserIcon className="w-3 h-3" />
                                                        {log.user}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <ClockIcon className="w-3 h-3" />
                                                        {formatTimestamp(log.timestamp)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Type Badge */}
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getTypeColor(log.type)}`}>
                                                {log.type}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {activityLogs.length === 0 && (
                        <div className="p-12 text-center">
                            <ActivityIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
                            <p className="text-gray-600">Activity logs will appear here as actions are performed</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
