import React, { useState, useEffect } from "react";
import { Settings, SlidersHorizontal, Users } from "lucide-react";
import Sidebar from "../components/DashboardComponents/Sidebar";
import EngineStatusActions from "../components/DashboardComponents/EngineStatusActions";
import { Link, useLoaderData } from "@remix-run/react";
import { json, LoaderFunction, redirect } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { findEngineData } from "~/models/engine.model";
import { getVerifiedPaymentsByCompany } from "~/models/payment.model";

type EngineName = "HR Transformation Roadmap Generator" |
  "HCM Vendor Fit Engine" | // Corrected name
  "Intelligent Change Management" |
  "HR Technology Maturity Analysis" |
  "Shared Service Designer";

const ENGINE_NAMES: EngineName[] = [
  "HR Transformation Roadmap Generator",
  "HCM Vendor Fit Engine",
  "Intelligent Change Management",
  "HR Technology Maturity Analysis",
  "Shared Service Designer"
];

// Map display names to engine names if needed, or use directly
const ENGINE_DISPLAY_NAMES: Record<string, string> = {
  "HCM Vendor Fit Engine": "HCM Vendor Fit",
};

import { getEnhancedUser } from "~/utils/user.server";


export const loader: LoaderFunction = async ({ request }) => {
  const user = await getEnhancedUser(request);
  if (!user.organisationId) return redirect("/auth");

  // Fetch all engine statuses
  const enginePromises = ENGINE_NAMES.map(name => findEngineData(user.organisationId as string, name));
  const engineResults = await Promise.all(enginePromises);

  const engineStatuses: Record<string, any> = {};
  ENGINE_NAMES.forEach((name, index) => {
    const data = engineResults[index];
    engineStatuses[name] = {
      status: data?.usage_status || "Draft",
      progress: data?.progress || 0
    };
  });

  // Fetch payments
  let payments: any[] = [];
  try {
    payments = await getVerifiedPaymentsByCompany(user.organisationId as string);
  } catch (e) {
    console.error("Failed to fetch payments", e);
  }

  // Get latest payment
  const latestPayment = payments.length > 0 ? payments[0] : null;

  return json({
    user,
    engineStatuses,
    latestPayment
  });
};

export default function statusDashboard() {
  const { user, engineStatuses, latestPayment } = useLoaderData<typeof loader>();
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
      {!isSidebarCollapsed && <Sidebar user={user} />}

      <main className="flex-1 md:ml-64 p-4 sm:p-6 space-y-4">
        {/* Section Divider: User Details */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          <h2 className="text-sm font-bold text-gray-700 tracking-widest uppercase">User Details</h2>
        </div>

        {/* User Details Card */}
        <div className="bg-gradient-to-r from-blue-100 to-white border-l-4 border-blue-600 shadow rounded-xl p-6 flex justify-between items-start flex-wrap gap-4 hover:shadow-md transition-transform hover:scale-[1.01]">
          {/* Left : User Info */}
          <div className="text-left">
            <h2 className="text-lg font-semibold text-[#1F2A5A]">{user.name}</h2>
            <p className="text-sm text-gray-600">{user.role || "Head of HR Department"}</p>
            <p className="text-sm text-gray-600 font-medium text-blue-600">{user.organisationName}</p>
          </div>

          {/* Right : Buttons */}
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <Link to="/engine/Profiling%20Assessment">
              <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition flex items-center gap-2 w-full">
                <SlidersHorizontal className="w-4 h-4" /> Modify Initial Responses
              </button>
            </Link>
            <Link to="/userSettingsDashboard">
              <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition flex items-center gap-2 w-full">
                <Settings className="w-4 h-4" /> User Settings
              </button>
            </Link>
            <Link to="/roleMgmtDashboard">
              <button className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-sm hover:bg-blue-700 transition flex items-center gap-2 w-full">
                <Users className="w-4 h-4" />
                Role Management
              </button>
            </Link>
          </div>
        </div>

        {/* Section Divider: Engine Usage */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          <h2 className="text-sm font-bold text-gray-700 tracking-widest uppercase">Engine Usage</h2>
        </div>

        {/* Engine Cards */}
        {ENGINE_NAMES.map((engine) => {
          const statusInfo = engineStatuses[engine];
          const status = statusInfo?.status || "Draft";
          const displayName = ENGINE_DISPLAY_NAMES[engine] || engine;

          return (
            <div
              key={engine}
              className="bg-gradient-to-r from-teal-100 to-white border-l-4 border-teal-600 shadow rounded-xl p-6 flex justify-between items-start flex-wrap gap-4 hover:shadow-md transition-transform hover:scale-[1.01]"
            >
              {/* Left Side: Engine Info */}
              <div className="text-sm text-gray-700 font-medium">
                <h3 className="text-lg font-semibold text-teal-900 mb-3">{displayName}</h3>
                <div className="flex justify-between w-72">
                  <span className="text-black font-bold">Response:</span>
                  <span className="text-gray-600">{status === "Draft" ? "In Draft" : status}</span>
                </div>
                <div className="flex justify-between w-72">
                  <span className="text-black font-bold">Report:</span>
                  <span className="text-gray-600">
                    {status === "Completed" ? "Available" : "N/A (Response Incomplete)"}
                  </span>
                </div>
              </div>

              {/* Right Side: Status Indicator and Buttons */}
              <EngineStatusActions engineStatus={status} param={engine} />
            </div>
          );
        })}

        {/* Section Divider: Payment Details */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          <h2 className="text-sm font-bold text-gray-700 tracking-widest uppercase">Payment Details</h2>
        </div>

        {/* Payment Card */}
        <div className="bg-gradient-to-r from-purple-100 to-white border-l-4 border-purple-600 shadow rounded-xl p-6 flex justify-between items-start flex-wrap gap-4 hover:shadow-md transition-transform hover:scale-[1.01]">
          <div className="text-sm text-gray-700 font-medium w-full">
            {latestPayment ? (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-bold text-purple-900">Latest Payment Completed</h3>
                  <Link to="/payment/status" className="text-purple-700 hover:text-purple-900 text-xs font-semibold">View All</Link>
                </div>
                <p className="text-gray-600">Date: {new Date(latestPayment.paymentDate || latestPayment.createdAt).toLocaleDateString()}</p>
                <p className="text-gray-600">Amount: ₹{latestPayment.totalAmount?.toLocaleString()}</p>
                <p className="text-gray-600">Invoice: {latestPayment.invoiceNumber}</p>
              </>
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold text-purple-900 mb-2">No Payments Yet</h3>
                  <p className="text-gray-600">Start your journey by purchasing an engine.</p>
                </div>
                <Link to="/pricing">
                  <button className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition">
                    View Pricing
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Section Divider: Response Modification */}
        {/* Placeholder logic: only show if explicitly needed, currently hidden as per plan or show static info */}
        {/* <div className="border-b border-gray-200 pb-2 mb-2">
          <h2 className="text-sm font-bold text-gray-700 tracking-widest uppercase">Response Modification</h2>
        </div> */}

        {/* Response Modification Card - Hidden or Placeholder */}
        {/* <div className="bg-gradient-to-r from-yellow-100 to-white border-l-4 border-yellow-500 shadow rounded-xl p-6 flex flex-col gap-4 hover:shadow-md transition-transform hover:scale-[1.01]">
           <p className="text-sm text-gray-600 italic">No active modification requests.</p>
        </div> */}
      </main>
    </div>
  );
}
