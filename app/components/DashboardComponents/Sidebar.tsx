import { useLocation, Link } from "@remix-run/react";
import { sidebarSections } from "./sidebarConfig";
import { Settings } from "lucide-react";

interface SidebarProps {
  user?: {
    name?: string;
    role?: string;
    organisationName?: string;
  };
}

export default function Sidebar({ user }: SidebarProps = {}) {
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) =>
    currentPath === path ? "bg-blue-100 border-l-4 border-blue-500 font-semibold" : "";

  return (
    <aside className="w-full md:w-64 bg-[#f8fafc] shadow-lg p-4 text-black fixed top-4 left-4 bottom-4 h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide rounded-2xl space-y-6">
      {/* Profile */}
      <div className="flex flex-col items-center space-y-1">
        <img
          src="/assets/dashboardAssets/pp.png"
          alt="Profile"
          className="w-20 h-20 rounded-full object-cover border-4 border-grey-600"
        />
        <div className="text-center">
          <p className="text-sm font-semibold">{user?.name || 'User'}</p>
          <p className="text-xs text-gray-600">{user?.role || 'Team Member'}</p>
          <p className="text-xs text-gray-500">{user?.organisationName || 'Organization'}</p>
        </div>
        <Link to="/userSettingsDashboard" className="flex items-center gap-1 text-xs underline mt-2">
          <Settings className="w-3 h-3" />
          <span>Settings</span>
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
            {items.map(({ label, path, icon: Icon, isLogout }) => (
              <Link
                key={path}
                to={path}
                className={`w-full text-left p-2 text-sm flex items-center gap-2 ${isLogout
                  ? "bg-red-500 text-white hover:bg-red-600 rounded-2xl"
                  : isActive(path)
                  }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </aside>
  );
}
