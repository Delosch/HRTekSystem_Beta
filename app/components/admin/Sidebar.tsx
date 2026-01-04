import { useState } from "react";
import { Link, NavLink } from "@remix-run/react";
import {
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isExpanded: boolean;
}

interface SidebarItem {
  label: string;
  href?: string;
  icon?: React.ElementType;
  items?: SidebarItem[];
}

const adminSidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
  },
  {
    label: "Companies",
    href: "/admin/companies"
  },
  {
    label: "Payment Verification",
    href: "/admin/payments/verification"
  },
  {
    label: "HTI Approvals",
    href: "/admin/hti"
  },
  //   {
  //     label: "Company Details",
  //     items: [
  //       {
  //         label: "Overview",
  //         href: "/admin/companies/:orgId/overview",
  //       },
  //       {
  //         label: "Users & Roles",
  //         href: "/admin/companies/:orgId/users",
  //       },
  //       {
  //         label: "Response Sheets",
  //         href: "/admin/companies/:orgId/engines",
  //       },
  //       {
  //         label: "AI Report Reviews",
  //         href: "/admin/companies/:orgId/ai-reports",
  //       },
  //       {
  //         label: "Invoice Requests",
  //         href: "/admin/companies/:orgId/invoices",
  //       },
  //     ],
  //   },
  {
    label: 'Website Settings',
    href: "/admin/website/home",
    // items: [
    //   {
    //     label: 'Home Page Content',
    //     href: '/admin/website/home',
    //   },
    //   {
    //     label: 'Testimonials',
    //     href: '/admin/website/testimonials',
    //   },
    //   {
    //     label: 'Announcements & Banners',
    //     href: '/admin/website/banners',
    //   },
    //   {
    //     label: 'SEO & Metadata',
    //     href: '/admin/website/seo',
    //   },
    //   {
    //     label: 'Blog / Insights',
    //     href: '/admin/website/blogs',
    //   },
    //   {
    //     label: 'Integrations',
    //     href: '/admin/website/integrations',
    //   },
    //   {
    //     label: 'Analytics Dashboard',
    //     href: '/admin/website/analytics',
    //   },
    // ],
  },
  {
    label: "Admin Roles",
    href: "/admin/roles",
  },
];

// Utility
function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar({ isExpanded }: SidebarProps) {
  const [openSubMenu, setOpenSubMenu] = useState<string | null>(null);

  const toggleSubMenu = (name: string) => {
    setOpenSubMenu(openSubMenu === name ? null : name);
  };

  return (
    <div
      className={classNames(
        "flex flex-col bg-gray-800 text-white shadow-xl h-screen sticky top-0 transition-all duration-300 ease-in-out z-30",
        isExpanded ? "w-64" : "w-20"
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 px-4 justify-center">
        <span className="text-2xl font-extrabold text-indigo-400">
          {isExpanded ? "AdminPanel" : "AP"}
        </span>
      </div>

      {/* Profile */}
      {isExpanded && (
        <div className="flex items-center p-4 border-b border-gray-700">
          <img
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e"
            alt="Admin Profile"
            className="h-10 w-10 rounded-full border-2 border-indigo-400"
          />
          <div className="ml-3">
            <p className="text-sm font-medium text-white">Admin User</p>
            <Link
              to="/admin/profile"
              className="text-xs text-gray-400 hover:text-indigo-300"
            >
              View Profile
            </Link>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        <ul className="space-y-1">
          {adminSidebarItems.map((item) => (
            <li key={item.label}>
              {item.items ? (
                <>
                  <button
                    onClick={() => toggleSubMenu(item.label)}
                    className={classNames(
                      "flex items-center w-full px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200 focus:outline-none",
                      openSubMenu === item.label
                        ? "bg-gray-700 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      !isExpanded && "justify-center"
                    )}
                  >
                    {isExpanded && (
                      <>
                        <span className="flex-1 text-left whitespace-nowrap">{item.label}</span>
                        <ChevronRightIcon
                          className={classNames(
                            "h-5 w-5 transition-transform duration-200",
                            openSubMenu === item.label ? "rotate-90" : ""
                          )}
                        />
                      </>
                    )}
                    {!isExpanded && (
                      <ChevronRightIcon className="h-5 w-5" />
                    )}
                  </button>
                  {isExpanded && openSubMenu === item.label && (
                    <ul className="mt-1 ml-6 space-y-1 border-l border-gray-700 pl-2">
                      {item.items.map((subItem) => (
                        <li key={subItem.label}>
                          <NavLink
                            to={subItem.href || "#"}
                            className={({ isActive }) =>
                              classNames(
                                "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap",
                                isActive
                                  ? "bg-indigo-600 text-white"
                                  : "text-gray-400 hover:bg-gray-700 hover:text-white"
                              )
                            }
                            end
                          >
                            {subItem.label}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.href || "#"}
                  className={({ isActive }) =>
                    classNames(
                      "flex items-center px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200",
                      isActive
                        ? "bg-indigo-600 text-white shadow-md"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      !isExpanded && "justify-center"
                    )
                  }
                  end
                >
                  {isExpanded && <span className="whitespace-nowrap">{item.label}</span>}
                  {!isExpanded && (
                    <ChevronRightIcon className="h-5 w-5" />
                  )}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      {isExpanded && (
        <div className="border-t border-gray-700 p-4 text-center text-xs text-gray-500">
          © {new Date().getFullYear()} AdminPanel.
          <br />
          All rights reserved.
        </div>
      )}
    </div>
  );
}