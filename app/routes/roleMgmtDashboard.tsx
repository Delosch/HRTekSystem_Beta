// Role Management page
import { json, LoaderFunction } from "@remix-run/node";
import { getEnhancedUser } from "~/utils/user.server";
import { useLoaderData } from "@remix-run/react";
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Sidebar from "../components/DashboardComponents/Sidebar";

const sampleTasks = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  title: `Task ${i + 1}`,
  name: `User ${i + 1}`,
  position: `Position ${i + 1}`,
  description: `This is a description of task ${i + 1}.`,
  status: i % 3 === 0 ? "completed" : i % 3 === 1 ? "pending" : "approval",
}));

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getEnhancedUser(request);
  return json({ user });
};

export default function RoleManagementDashboard() {
  const { user } = useLoaderData<typeof loader>();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState(sampleTasks);
  const [visibleCount, setVisibleCount] = useState(8);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTask, setSelectedTask] = useState<
    (typeof sampleTasks)[0] | null
  >(null);
  const [showCreateUserModal, setShowCreateUserModal] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsSidebarCollapsed(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors = {
    completed: "bg-green-50 text-green-900 border border-green-200",
    pending: "bg-red-50 text-red-900 border border-red-200",
    approval: "bg-yellow-50 text-yellow-900 border border-yellow-200",
  };

  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const handleTaskAction = (action: string) => {
    if (!selectedTask) return;

    // Simulate backend process
    const newStatus = action === 'Approve' ? 'completed' : action === 'Revoke Access' ? 'pending' : 'approval';

    setTasks(prev => prev.map(t =>
      t.id === selectedTask.id ? { ...t, status: newStatus } : t
    ));

    setActionFeedback(`${action} successful for ${selectedTask.title}`);
    setTimeout(() => {
      setActionFeedback(null);
      setSelectedTask(null);
    }, 1500);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6]">
      {!isSidebarCollapsed && <Sidebar user={user} />}

      <main className="flex-1 md:ml-64 p-6 sm:p-8">
        <div className="border-b border-gray-200 pb-2 mb-6">
          <h1 className="text-sm font-bold text-gray-700 tracking-widest uppercase">
            Role Management
          </h1>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-lg mb-10">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left Half - Green Theme */}
            <div className="flex-1 bg-green-50 border border-green-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
              <div>
                <h3 className="text-2xl font-semibold text-green-900 mb-6">
                  Editors
                </h3>
                <div className="flex justify-between text-green-800 mb-3 text-lg">
                  <span>Tasks Delegated:</span>
                  <span>{123}</span>
                </div>
                <div className="flex justify-between text-green-800 text-lg">
                  <span>Tasks Approved:</span>
                  <span>{78}</span>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowCreateUserModal(true)}
                  className="bg-green-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-green-800 transition"
                >
                  Create New User
                </button>
              </div>
            </div>

            {/* Right Half */}
            <div className="flex-1 flex flex-col gap-6">
              {/* Top Right - Yellow Theme */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-2xl font-semibold text-yellow-900 mb-6">
                    To Approve
                  </h3>
                  <div className="flex justify-between text-yellow-800 text-lg">
                    <span>Tasks Completed:</span>
                    <span>{45}</span>
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button className="bg-yellow-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-yellow-700 transition">
                    Approve All
                  </button>
                </div>
              </div>

              {/* Bottom Right - Red Theme */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                <div>
                  <h3 className="text-2xl font-semibold text-red-900 mb-6">
                    Pending
                  </h3>
                  <div className="flex justify-between text-red-800 text-lg">
                    <span>Pending Tasks:</span>
                    <span>{12}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-8">
            <button className="bg-blue-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Task Completed: Submit
            </button>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-2 mb-6">
          <h2 className="text-sm font-bold text-gray-700 tracking-widest uppercase">
            Details
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <div className="flex justify-end mb-4">
            <input
              type="text"
              placeholder="Search tasks..."
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm w-64 focus:outline-none focus:ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredTasks.slice(0, visibleCount).map((task) => (
              <button
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className={`px-4 py-2 rounded-xl text-sm font-medium shadow-sm ${statusColors[task.status as keyof typeof statusColors]
                  }
 hover:opacity-90`}
              >
                {task.title}
              </button>
            ))}
          </div>

          {visibleCount < filteredTasks.length && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setVisibleCount((prev) => prev + 8)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:underline font-medium"
              >
                <span>Expand</span>
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Task Modal */}
        {selectedTask && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-[2rem] w-[400px] shadow-2xl relative overflow-hidden">
              {actionFeedback ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 animate-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{actionFeedback}</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">
                      {selectedTask.title}
                    </h3>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[selectedTask.status as keyof typeof statusColors]}`}>
                      {selectedTask.status}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-5 mb-8 space-y-4 border border-slate-100">
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Assigned To</span>
                      <p className="font-bold text-slate-900">{selectedTask.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{selectedTask.position}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Description</span>
                      <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedTask.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => handleTaskAction('Approve')}
                      className="bg-emerald-600 text-white py-3.5 rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100"
                    >
                      Approve Task
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleTaskAction('Review')}
                        className="bg-amber-100 text-amber-700 py-3 rounded-xl font-bold hover:bg-amber-200 transition-all active:scale-95"
                      >
                        Request Review
                      </button>
                      <button
                        onClick={() => handleTaskAction('Revoke Access')}
                        className="bg-rose-50 text-rose-600 py-3 rounded-xl font-bold hover:bg-rose-100 transition-all active:scale-95"
                      >
                        Revoke Access
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={() => setSelectedTask(null)}
                    className="mt-6 w-full text-center text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                  >
                    Cancel & Close
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {showCreateUserModal && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-2xl w-[300px] flex flex-col gap-3">
              <h3 className="text-lg font-bold text-gray-800">
                Create New User
              </h3>
              {"Name Position Task ID".split(" ").map((label) => (
                <div key={label} className="flex flex-col gap-1">
                  <label className="text-sm text-gray-700">{label}</label>
                  <input
                    type="text"
                    className="bg-green-300 px-3 py-2 rounded-md text-sm text-black"
                  />
                </div>
              ))}
              <button className="bg-green-600 text-white mt-2 py-2 rounded">
                Create
              </button>
              <button
                onClick={() => setShowCreateUserModal(false)}
                className="text-sm text-gray-500 underline"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
