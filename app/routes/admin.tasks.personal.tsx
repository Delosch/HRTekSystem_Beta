import { Link } from "@remix-run/react";
import { ArrowLeftIcon, CheckCircle, Clock } from "lucide-react";

export default function PersonalTasks() {
    const tasks = [
        { id: 1, title: "Review 3 pending client applications", dueDate: "Today", status: "pending" },
        { id: 2, title: "Approve new user registrations", dueDate: "ASAP", status: "pending" },
        { id: 3, title: "Update privacy policy document", dueDate: "Jul 31, 2025", status: "pending" },
        { id: 4, title: "Schedule Q3 performance review", dueDate: "Aug 5, 2025", status: "pending" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Personal Tasks</h1>

                <div className="space-y-3">
                    {tasks.map((task) => (
                        <div key={task.id} className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" className="w-5 h-5 text-indigo-600 rounded" />
                                <div>
                                    <p className="font-medium text-gray-900">{task.title}</p>
                                    <p className="text-sm text-gray-600 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {task.dueDate}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
