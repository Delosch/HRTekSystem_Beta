import { useState } from "react";
import { Search, Bell, ChevronRight } from "lucide-react";

interface DashboardHeaderProps {
    breadcrumbs: Array<{ label: string; href?: string }>;
    onExportReport?: () => void;
    onNewComparison?: () => void;
    onSearch?: (query: string) => void;
    userName?: string;
    userAvatar?: string;
    notificationCount?: number;
}

export default function DashboardHeader({
    breadcrumbs,
    onExportReport,
    onNewComparison,
    onSearch,
    userName = "User",
    userAvatar,
    notificationCount = 0,
}: DashboardHeaderProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [showNotifications, setShowNotifications] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (onSearch && searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-full px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Branding + Breadcrumb */}
                    <div className="flex items-center gap-6">
                        <a href="/" className="flex items-center gap-2 group border-r border-gray-200 pr-6">
                            <img src="/hrtek_logo.png" alt="HRTEK" className="h-8 w-auto object-contain transition-transform group-hover:scale-105" />
                            <span className="text-gray-900 font-black text-sm tracking-tighter">HRTEK <span className="text-blue-600">SYSTEM</span></span>
                        </a>
                        <div className="flex items-center gap-2 text-sm">
                            {breadcrumbs.map((crumb, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    {crumb.href ? (
                                        <a
                                            href={crumb.href}
                                            className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
                                        >
                                            {crumb.label}
                                        </a>
                                    ) : (
                                        <span className="text-gray-900 font-semibold">{crumb.label}</span>
                                    )}
                                    {index < breadcrumbs.length - 1 && (
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative hidden md:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search vendors..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64 transition-all"
                            />
                        </form>

                        {/* Export Report Button */}
                        {onExportReport && (
                            <button
                                onClick={onExportReport}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm hover:shadow"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    />
                                </svg>
                                Export Report
                            </button>
                        )}

                        {/* New Comparison Button */}
                        {onNewComparison && (
                            <button
                                onClick={onNewComparison}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-sm hover:shadow"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 4v16m8-8H4"
                                    />
                                </svg>
                                New Comparison
                            </button>
                        )}

                        {/* Notifications */}
                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <Bell className="w-5 h-5" />
                                {notificationCount > 0 && (
                                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                                        {notificationCount > 9 ? "9+" : notificationCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                                    <div className="px-4 py-2 border-b border-gray-100">
                                        <h3 className="font-semibold text-gray-900">Notifications</h3>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {[1, 2, 3].map((i) => (
                                            <div key={i} className="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors">
                                                <p className="text-sm font-medium text-gray-900">New vendor evaluation completed</p>
                                                <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="px-4 py-2 border-t border-gray-100">
                                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                                            View all notifications
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* User Profile */}
                        <div className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                            {userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt={userName}
                                    className="w-8 h-8 rounded-full ring-2 ring-gray-200"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold ring-2 ring-gray-200">
                                    {userName.charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="text-sm font-medium text-gray-700 hidden md:block">
                                {userName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
