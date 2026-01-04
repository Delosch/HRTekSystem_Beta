import React, { useState, useEffect } from "react";
import Sidebar from "../components/DashboardComponents/Sidebar";

export default function RoleManagementDashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F7F6F3]">
      {!isSidebarCollapsed && <Sidebar />}

      <main className="flex-1 md:ml-64 p-4 sm:p-6">
        <embed
    src="assets/dashboardAssets/proposals/Project Proposal- Momentum.pdf"
    type="application/pdf"
    width="100%"
    height="800px"
  />
      </main>
    </div>
  );
}
