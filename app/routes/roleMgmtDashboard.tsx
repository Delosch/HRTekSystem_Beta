import { ActionFunction, json, LoaderFunction } from "@remix-run/node";
import { getEnhancedUser } from "~/utils/user.server";
import { useLoaderData, useFetcher } from "@remix-run/react";
import React, { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import Sidebar from "../components/DashboardComponents/Sidebar";
import { sendTaskAssignedEmail } from "~/lib/email.service.server";
import { toast } from "react-toastify";

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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent") as string;
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const position = formData.get("position") as string;
  const task = formData.get("task") as string;
  const id = formData.get("id") as string;

  if (intent === "assign_task") {
    if (!name || !email || !position || !task || !id) {
      return json({ success: false, error: "All fields are required" }, { status: 400 });
    }
    const emailSent = await sendTaskAssignedEmail({ name, email, task, position, id });
    if (emailSent) {
      return json({ success: true, message: `Task assigned and email sent to ${email}` });
    }
    return json({ success: false, error: "Failed to send email notification" }, { status: 500 });
  }

  if (intent === "approve_task" || intent === "revoke_access" || intent === "review_task") {
    const taskId = formData.get("taskId");
    // In a real app, you would update the database here.
    return json({
      success: true,
      message: `${intent.replace('_', ' ').toUpperCase()} successful for task ID ${taskId}`
    });
  }

  return json({ success: false, error: "Unknown action" }, { status: 400 });
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

  const fetcher = useFetcher<{ success: boolean; message?: string; error?: string }>();

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.success(fetcher.data.message);
      setShowCreateUserModal(false);
    } else if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.data]);

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

  const handleTaskAction = (actionType: string) => {
    if (!selectedTask) return;

    const intent = actionType === 'Approve' ? 'approve_task'
      : actionType === 'Revoke Access' ? 'revoke_access'
        : 'review_task';

    fetcher.submit(
      { intent, taskId: selectedTask.id.toString() },
      { method: "post" }
    );

    // Locally update for immediate feedback
    const newStatus = actionType === 'Approve' ? 'completed'
      : actionType === 'Revoke Access' ? 'pending'
        : 'approval';

    setTasks(prev => prev.map(t =>
      t.id === (selectedTask as any).id ? { ...t, status: newStatus } : t
    ));

    setActionFeedback(`${actionType} successful for ${selectedTask.title}`);
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
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center animate-in fade-in duration-300 backdrop-blur-sm">
            <fetcher.Form method="post" className="bg-white p-8 rounded-[2rem] w-[400px] shadow-2xl flex flex-col gap-5 border border-slate-100">
              <input type="hidden" name="intent" value="assign_task" />
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                Create New User
              </h3>

              <div className="space-y-4">
                {[
                  { label: "Name", name: "name", placeholder: "e.g. John Doe", type: "text" },
                  { label: "Email", name: "email", placeholder: "e.g. john@example.com", type: "email" },
                  { label: "Position", name: "position", placeholder: "e.g. Senior Designer", type: "text" },
                  { label: "Task Title", name: "task", placeholder: "e.g. Brand Refresh", type: "text" },
                  { label: "User ID", name: "id", placeholder: "e.g. USER-123", type: "text" },
                ].map((field) => (
                  <div key={field.name} className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                    <input
                      name={field.name}
                      type={field.type}
                      placeholder={field.placeholder}
                      required
                      className="bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-xl text-sm text-emerald-900 placeholder:text-emerald-300 focus:ring-2 focus:ring-emerald-500 focus:bg-white outline-none transition-all font-semibold"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={fetcher.state !== "idle"}
                  className="bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-lg shadow-emerald-100 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {fetcher.state !== "idle" ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : "Create & Send Task"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateUserModal(false)}
                  className="w-full text-center text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors py-2"
                >
                  Cancel
                </button>
              </div>
            </fetcher.Form>
          </div>
        )}
      </main>
    </div>
  );
}
