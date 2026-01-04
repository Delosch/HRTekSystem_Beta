// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import Sidebar from "~/components/admin/Sidebar";
import Header from "~/components/admin/Header";
import { useState } from "react";


export default function AdminLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };
  return (
    <div className="flex h-screen bg-gray-100 font-inter">
      <Sidebar isExpanded={isSidebarExpanded} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} isSidebarExpanded={isSidebarExpanded} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet /> {/* Renders child routes like admin._index.tsx */}
        </main>
      </div>
      <ScrollRestoration />
      <Scripts />
    </div>
  );
}

