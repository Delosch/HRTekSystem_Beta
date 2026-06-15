// app/root.tsx
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useLocation, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import Sidebar from "~/components/admin/Sidebar";
import Header from "~/components/admin/Header";
import { useState } from "react";
import { requireAdminSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  if (url.pathname === "/admin/login") {
    return json({ pendingCount: 0 });
  }
  await requireAdminSession(request);
  try {
    const { getPendingUsers } = await import("~/models/user.model.server");
    const pending = await getPendingUsers();
    return json({ pendingCount: pending.length });
  } catch {
    return json({ pendingCount: 0 });
  }
}


export default function AdminLayout() {
  const { pendingCount } = useLoaderData<typeof loader>();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const location = useLocation();
  const isLoginPage = location.pathname === "/admin/login";

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  if (isLoginPage) {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-slate-50/50 font-inter text-slate-900">
      <Sidebar isExpanded={isSidebarExpanded} pendingCount={pendingCount} />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Header toggleSidebar={toggleSidebar} isSidebarExpanded={isSidebarExpanded} />
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">
          <Outlet /> {/* Renders child routes like admin._index.tsx */}
        </main>
      </div>
    </div>
  );
}

