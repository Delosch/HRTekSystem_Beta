// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation } from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import Sidebar from "~/components/admin/Sidebar";
import Header from "~/components/admin/Header";
import { useState } from "react";
import { requireAdminSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname === "/admin/login") {
    return null;
  }
  await requireAdminSession(request);
  return null;
}


export default function AdminLayout() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();
  const isLoginPage = location.pathname === "/admin/login";

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  if (isLoginPage) {
    return (
      <>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </>
    );
  }

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

