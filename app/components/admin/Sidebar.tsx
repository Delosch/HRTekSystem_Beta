import { useState } from "react";
import { Link, NavLink, useLocation } from "@remix-run/react";
import {
  ChevronRightIcon,
  HomeIcon,
  BuildingOffice2Icon,
  CreditCardIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ChartPieIcon,
  PresentationChartLineIcon,
  ListBulletIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isExpanded: boolean;
}

interface SidebarItem {
  label: string;
  href?: string;
  icon: React.ElementType;
  items?: SidebarItem[];
}

const adminSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: HomeIcon,
  },
  {
    label: "Companies",
    href: "/admin/companies",
    icon: BuildingOffice2Icon,
  },
  {
    label: "Users",
    href: "/admin/users",
    icon: UserGroupIcon,
  },
  {
    label: "Assessments",
    href: "/admin/assessments",
    icon: AcademicCapIcon,
  },
  {
    label: "AI Analysis",
    href: "/admin/reports",
    icon: SparklesIcon,
  },
  {
    label: "Payments",
    href: "/admin/payments/verification",
    icon: CreditCardIcon,
  },
  {
    label: "HTI Approvals",
    href: "/admin/hti",
    icon: ShieldCheckIcon,
  },
  {
    label: "System Logs",
    href: "/admin/activity-logs",
    icon: ListBulletIcon,
  },
  {
    label: 'Website Analytics',
    href: "/admin/website/analytics",
    icon: PresentationChartLineIcon,
  },
  {
    label: 'Website Content',
    href: "/admin/website/home",
    icon: GlobeAltIcon,
  },
  {
    label: "Roles & Security",
    href: "/admin/roles",
    icon: ShieldCheckIcon,
  },
];

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ isExpanded }: SidebarProps) {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);
  const location = useLocation();

  const toggleSubMenu = (name: string) => {
    setOpenSubMenu(openSubMenu === name ? null : name);
  };

  return (
    <motion.div
      animate={{ width: isExpanded ? 260 : 88 }}
      className="flex flex-col bg-slate-900 text-white shadow-2xl h-screen sticky top-0 transition-all duration-300 ease-in-out z-30 overflow-hidden"
    >
      {/* Brand Logo */}
      <div className="flex items-center h-20 px-6 border-b border-white/5 bg-slate-950/20">
        <div className="h-10 w-10 flex-shrink-0 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/40">
          <ChartPieIcon className="h-6 w-6 text-white" />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="ml-4 text-xl font-bold tracking-tight text-white"
            >
              HR<span className="text-indigo-400">Tek</span> Admin
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-8 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2">
        {adminSidebarItems.map((item) => (
          <div key={item.label}>
            {item.items ? (
              <div className="space-y-1">
                <button
                  onClick={() => toggleSubMenu(item.label)}
                  className={classNames(
                    "flex items-center w-full px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 focus:outline-none group",
                    openSubMenu === item.label
                      ? "bg-white/5 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className={classNames(
                    "h-6 w-6 shrink-0 transition-colors",
                    openSubMenu === item.label ? "text-indigo-400" : "group-hover:text-indigo-400"
                  )} />
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-1 items-center ml-4"
                      >
                        <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                        <ChevronRightIcon
                          className={classNames(
                            "h-4 w-4 transition-transform duration-200 opacity-50",
                            openSubMenu === item.label ? "rotate-90" : ""
                          )}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            ) : (
              <NavLink
                to={item.href || "#"}
                className={({ isActive }) =>
                  classNames(
                    "flex items-center px-3 py-3 rounded-xl text-sm font-bold transition-all duration-200 group relative",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-white"
                  )
                }
                end
              >
                <item.icon className="h-6 w-6 shrink-0" />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="ml-4 whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl border border-white/10">
                    {item.label}
                  </div>
                )}
              </NavLink>
            )}
          </div>
        ))}
      </nav>

      {/* Footer / Profile Mini */}
      <div className="p-4 border-t border-white/5 bg-slate-950/20">
        <Link to="/admin/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors group">
          <div className="h-8 w-8 rounded-lg bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-md">
            AD
          </div>
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-hidden"
              >
                <p className="text-xs font-bold text-white truncate">Administrator</p>
                <p className="text-[10px] font-medium text-slate-500 truncate italic">Manage Platform</p>
              </motion.div>
            )}
          </AnimatePresence>
          {isExpanded && <Cog6ToothIcon className="h-5 w-5 text-slate-600 group-hover:text-indigo-400 transition-colors" />}
        </Link>
      </div>
    </motion.div>
  );
}