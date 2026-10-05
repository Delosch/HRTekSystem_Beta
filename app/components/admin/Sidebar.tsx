import { useState } from "react";
import { Link, NavLink, useLocation } from "@remix-run/react";
import {
  LayoutDashboard,
  Building2,
  Users,
  CheckSquare,
  Sparkles,
  CreditCard,
  ShieldCheck,
  ListTodo,
  BarChart3,
  Globe,
  Settings2,
  ChevronRight,
  LogOut,
  UserCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isExpanded: boolean;
}

interface SidebarItem {
  label: string;
  href: string;
  icon: any;
}

const adminSidebarItems: SidebarItem[] = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Companies", href: "/admin/companies", icon: Building2 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Assessments", href: "/admin/assessments", icon: CheckSquare },
  { label: "Reports", href: "/admin/reports", icon: Sparkles },
  { label: "Payments", href: "/admin/payments", icon: CreditCard },
  { label: "Review Reports", href: "/admin/hti", icon: ShieldCheck },
  { label: "Activity", href: "/admin/activity-logs", icon: ListTodo },
  { label: "Analytics", href: "/admin/website/analytics", icon: BarChart3 },
  { label: "Website", href: "/admin/website/home", icon: Globe },
  { label: "Permissions", href: "/admin/roles", icon: ShieldCheck },
];

export default function Sidebar({ isExpanded }: SidebarProps) {
  const location = useLocation();

  return (
    <motion.div
      animate={{ width: isExpanded ? 280 : 88 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="flex flex-col bg-[#000033] text-white shadow-2xl h-screen sticky top-0 z-30 overflow-hidden"
    >
      {/* Brand Logo */}
      <div className="flex items-center h-24 px-6 mb-4">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="h-10 w-10 flex-shrink-0 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40 transform hover:rotate-12 transition-transform">
            <LayoutDashboard className="h-6 w-6 text-white" />
          </div>
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex flex-col"
              >
                <span className="text-xl font-black tracking-tighter text-white">
                  HR<span className="text-indigo-400">Tek</span> Admin
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar py-4">
        {adminSidebarItems.map((item) => (
          <NavLink
            key={item.label}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl text-[13px] font-bold transition-all duration-200 group relative ${isActive
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 active:scale-95"
                : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`
            }
            end={item.href === "/admin"}
          >
            <item.icon className="h-5 w-5 shrink-0 transition-transform group-hover:scale-110" />
            <AnimatePresence mode="wait">
              {isExpanded && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="whitespace-nowrap"
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {!isExpanded && (
              <div className="absolute left-full ml-6 px-3 py-2 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-2xl border border-white/5">
                {item.label}
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer / Profile Mini */}
      <div className="p-4 mt-auto">
        <Link
          to="/admin/profile"
          className="flex items-center gap-3 p-3 rounded-[20px] bg-white/5 hover:bg-white/10 transition-all group border border-white/5"
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-xs font-black text-white shadow-lg overflow-hidden shrink-0">
            AD
          </div>
          <AnimatePresence mode="wait">
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 min-w-0"
              >
                <p className="text-xs font-black text-white truncate uppercase tracking-tight leading-none mb-1">Administrator</p>
                <p className="text-[10px] font-bold text-slate-500 truncate leading-none">Manage Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
          {isExpanded && (
            <Settings2 className="h-4 w-4 text-slate-500 group-hover:text-white transition-colors rotate-0 group-hover:rotate-90" />
          )}
        </Link>
      </div>
    </motion.div>
  );
}
