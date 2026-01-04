import { Link, useNavigate } from "@remix-run/react";
import { useState } from "react";

import {
  Home,
  Settings,
  LogOut,
  LayoutDashboard,
  Compass,
  Puzzle,
  Sliders,
  LineChart,
} from "lucide-react"; // Updated icons


export function Sidebar() {
  const [expanded, setExpanded] = useState(false);
   const navigate = useNavigate();

  return (
    <div
      className={`fixed top-0 left-0 bottom-0 z-40 flex flex-col 
      ${expanded ? "w-60" : "w-16"} 
      transition-all duration-300 ease-in-out
      bg-white/10 backdrop-blur-lg border-r border-white/20 text-white
      shadow-lg px-3 py-6`}
    >
      {/* Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mb-6 text-white hover:text-cyan-300 transition"
      >
        {expanded ? "◀" : "▶"}
      </button>

      {/* Welcome */}
      {expanded && (
        <div className="text-center mb-6 text-sm text-white/80 bg-white/10 rounded-lg py-2 px-3">
          👋 Welcome, User
        </div>
      )}

      {/* Profile */}
      {expanded && (
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-300 to-purple-400 shadow-inner" />
      )}

      {/* Nav Links */}
      <nav className="flex flex-col space-y-2 text-sm font-medium">
        <SidebarLink icon={<Home size={18} />} label="Dashboard" to="/dashboard" expanded={expanded} />
        
        {/* PoC Modules */}
        <SidebarLink icon={<Compass size={18} />} label="Digital Roadmap" to="/roadmap" expanded={expanded} />
        <SidebarLink icon={<Puzzle size={18} />} label="Vendor Fit Engine" to="/vendorFitEngine" expanded={expanded} />
        <SidebarLink icon={<Sliders size={18} />} label="Shared Service Designer" to="/sharedService" expanded={expanded} />
        <SidebarLink icon={<LineChart size={18} />} label="HR Project Tracker" to="/hrProjectTracker" expanded={expanded} />

        <SidebarLink icon={<LayoutDashboard size={18} />} label="Modules" to="/modules" expanded={expanded} />
        <SidebarLink icon={<Settings size={18} />} label="Settings" to="/settings" expanded={expanded} />
      </nav>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Logout */}
      <button
        className="flex items-center justify-center gap-2 text-sm text-white hover:text-red-400 transition mt-6"
        onClick={() =>  navigate("/auth/logout")}
      >
        <LogOut size={18} />
        {expanded && "Logout"}
      </button>
    </div>
  );
}

function SidebarLink({
  to,
  label,
  icon,
  expanded,
}: {
  to: string;
  label: string;
  icon: JSX.Element;
  expanded: boolean;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-3 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-white"
    >
      {icon}
      {expanded && <span>{label}</span>}
    </Link>

  );
}