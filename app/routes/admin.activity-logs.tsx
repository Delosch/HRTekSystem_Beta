import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
    ChevronLeftIcon,
    ClockIcon,
    UserIcon,
    SignalIcon,
    ArrowPathIcon,
    ShieldCheckIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

interface ActivityLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    details: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export const loader: LoaderFunction = async () => {
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

    const getIcon = (type: string) => {
        switch (type) {
            case 'success': return CheckCircleIcon;
            case 'warning': return ExclamationTriangleIcon;
            case 'error': return ExclamationTriangleIcon;
            default: return InformationCircleIcon;
        }
    };

    const getTypeStyles = (type: string) => {
        switch (type) {
            case 'success': return 'text-emerald-500 bg-emerald-50 border-emerald-100';
            case 'warning': return 'text-amber-500 bg-amber-50 border-amber-100';
            case 'error': return 'text-rose-500 bg-rose-50 border-rose-100';
            default: return 'text-indigo-500 bg-indigo-50 border-indigo-100';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 p-4 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <Link
                        to="/admin"
                        className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700 mb-4 group"
                    >
                        <ChevronLeftIcon className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                        Dashboard Overview
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Intelligence</h1>
                    <p className="text-gray-500 font-medium">Real-time stream of administrative and automated activities.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-400 hover:text-indigo-600 transition-colors">
                        <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button className="px-5 py-2.5 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-xl shadow-gray-900/10 hover:bg-gray-800 transition-all">
                        Export Report
                    </button>
                </div>
            </div>

            {/* Content Table / Timeline */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
                            <SignalIcon className="h-5 w-5" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Event Timeline</h2>
                    </div>
                </div>

                <div className="divide-y divide-gray-50">
                    {activityLogs.map((log: any, idx: number) => {
                        const Icon = getIcon(log.type);
                        const styles = getTypeStyles(log.type);

                        return (
                            <motion.div
                                key={log.id}
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.04 }}
                                className="p-6 hover:bg-gray-50/50 transition-colors group"
                            >
                                <div className="flex items-start gap-6">
                                    <div className={`shrink-0 p-3 rounded-2xl shadow-sm border ${styles} transition-transform group-hover:scale-110`}>
                                        <Icon className="h-6 w-6" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-4 mb-2">
                                            <h3 className="text-base font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                                {log.action}
                                            </h3>
                                            <span className="text-xs font-bold text-gray-400 flex items-center gap-1 group-hover:text-gray-900 transition-colors">
                                                <ClockIcon className="h-3.5 w-3.5" />
                                                {formatTimestamp(log.timestamp)}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
                                            {log.details}
                                        </p>

                                        <div className="mt-4 flex items-center gap-4">
                                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                                <div className="h-5 w-5 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                    <UserIcon className="h-3.5 w-3.5" />
                                                </div>
                                                <span className="text-[11px] font-bold text-gray-600 truncate">{log.user}</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1 bg-gray-50 rounded-lg group-hover:bg-white transition-colors">
                                                <ShieldCheckIcon className="h-4 w-4 text-gray-400" />
                                                <span className="text-[11px] font-bold text-gray-400">Authenticated</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {activityLogs.length === 0 && (
                    <div className="p-20 text-center">
                        <SignalIcon className="h-16 w-16 text-gray-100 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Signal Lost</h3>
                        <p className="text-gray-500 font-medium">No system events have been recorded in the current session.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
