import { useLocation, Link, useRouteLoaderData, useNavigate } from "@remix-run/react";
import { sidebarSections } from "./sidebarConfig";
import { Settings, Home, Lock } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";

// Sidebar paths that are payment-gated (core engines only)
const GATED_ENGINE_PATHS = [
    "/roadmapDashboard",
    "/vendorDashboard",
    "/ai-maturity/dashboard",
    "/sharedDashboard",
    "/changeDashboard",
];

interface SidebarProps {
    user?: {
        name?: string;
        first_name?: string;
        last_name?: string;
        role?: string;
        organisationName?: string;
        company?: string;
        photoUrl?: string;
        [key: string]: any;
    };
    onLinkClick?: () => void;
}

export default function Sidebar({ user: propUser, onLinkClick }: SidebarProps = {}) {
    const rootData = useRouteLoaderData("root") as { user?: any };
    const user = propUser || rootData?.user;

    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;

    const [engineAccess, setEngineAccess] = useState<Record<string, boolean>>({});

    // Fetch engine access status once on mount
    useEffect(() => {
        let cancelled = false;
        fetch("/api/engine-access")
            .then(res => res.ok ? res.json() : { accessByPath: {} })
            .then(data => {
                if (!cancelled) {
                    setEngineAccess(data.accessByPath || {});
                }
            })
            .catch(() => { /* silent fail */ });
        return () => { cancelled = true; };
    }, []);

    const isActive = (path: string) =>
        currentPath === path ? "bg-blue-100 border-l-4 border-blue-500 font-semibold" : "";

    const isGatedPath = (path: string) => GATED_ENGINE_PATHS.includes(path);
    const isPathLocked = (path: string) => isGatedPath(path) && !engineAccess[path];

    const handleGatedClick = useCallback((e: React.MouseEvent, path: string, label: string) => {
        if (!isGatedPath(path)) return; // Not gated, let Link handle it
        if (engineAccess[path]) return; // Unlocked, let Link handle it

        // Locked — prevent navigation, show toast, redirect
        e.preventDefault();
        toast.warning(
            `🔒 "${label}" requires payment approval. Redirecting to Payment Dashboard...`,
            { autoClose: 2500 }
        );
        setTimeout(() => {
            navigate("/user-payment-dashboard");
        }, 2500);
    }, [engineAccess, navigate]);

    return (
        <aside className={`bg-[#f8fafc] shadow-lg p-4 text-black overflow-y-auto scrollbar-hide rounded-2xl space-y-6 z-50 transition-all duration-300 ${onLinkClick
            ? "w-full h-full relative"
            : "w-full md:w-64 fixed top-4 left-4 bottom-4 h-[calc(100vh-2rem)]"
            }`}>
            {/* Logo Section */}
            <div className="flex items-center gap-3 px-2 py-2 mb-2 border-b border-slate-100">
                <img src="/hrtek_logo.png" alt="HRTek Logo" className="w-8 h-8 object-contain" />
                <div>
                    <h1 className="font-bold text-slate-900 leading-none">HRTek System</h1>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Workspace</p>
                </div>
            </div>

            {/* Profile */}
            <div className="flex flex-col items-center space-y-2 py-4">
                <img
                    src={user?.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || user?.name || 'User')}&background=0F172A&color=fff`}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.first_name || user?.name || 'User')}&background=0F172A&color=fff`;
                    }}
                />
                <div className="text-center px-2">
                    <p className="text-sm font-bold text-slate-800 truncate max-w-[180px]">
                        {user?.first_name || user?.name || 'User'} {user?.last_name || ''}
                    </p>
                    <p className="text-xs text-slate-500 font-medium truncate max-w-[180px]">
                        {user?.role || 'Team Member'}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">
                        {user?.organisationName || user?.company || 'Organization'}
                    </p>
                </div>
                <Link to="/userSettingsDashboard" className="flex items-center gap-1 text-xs underline mt-2">
                    <Settings className="w-3 h-3" />
                    <span>Settings</span>
                </Link>
            </div>

            {/* Dashboard Navigation */}
            <div>
                <Link
                    to="/"
                    onClick={onLinkClick}
                    className="flex items-center gap-3 px-4 py-3 text-slate-700 hover:bg-blue-50 transition-all duration-300 rounded-xl font-bold text-sm bg-white border border-slate-100 shadow-sm group mb-6"
                >
                    <div className="bg-blue-50 p-1.5 rounded-lg group-hover:bg-blue-600 transition-colors">
                        <Home className="w-4 h-4 text-blue-600 group-hover:text-white" />
                    </div>
                    Back to Website
                </Link>
            </div>

            {/* Render sidebar sections */}
            {sidebarSections.map(({ title, items }) => (
                <div key={title}>
                    <h4 className="text-sm font-semibold mb-2">{title}</h4>
                    <div
                        className={`border rounded-lg ${title !== "Logout" ? "divide-y" : "border-transparent rounded-2xl"
                            } shadow-lg`}
                    >
                        {items.map(({ label, path, icon: Icon, isLogout }) => {
                            const locked = isPathLocked(path);
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    onClick={(e) => {
                                        if (locked) {
                                            handleGatedClick(e, path, label);
                                        } else {
                                            onLinkClick?.();
                                        }
                                    }}
                                    className={`w-full text-left p-2 text-sm flex items-center gap-2 ${isLogout
                                        ? "bg-red-500 text-white hover:bg-red-600 rounded-2xl"
                                        : locked
                                            ? "text-slate-400 cursor-pointer"
                                            : isActive(path)
                                        }`}
                                >
                                    {locked ? (
                                        <Lock className="w-4 h-4 text-orange-500" />
                                    ) : (
                                        <Icon className="w-4 h-4" />
                                    )}
                                    <span className={locked ? "text-slate-400" : ""}>{label}</span>
                                    {locked && (
                                        <span className="ml-auto text-[9px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200">
                                            🔒
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </aside>
    );
}
