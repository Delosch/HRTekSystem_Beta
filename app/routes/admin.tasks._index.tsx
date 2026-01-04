import { Link } from "@remix-run/react";
import { ArrowLeftIcon, CheckCircle, Clock, AlertCircle } from "lucide-react";

export default function AdminTasks() {
    const tasks = [
        { id: 1, title: "Payment Verifications Pending", count: 8, priority: "urgent", link: "/admin/payments/verification" },
        { id: 2, title: "AI Report Approvals Pending", count: 5, priority: "high", link: "/admin/reports" },
        { id: 3, title: "Companies Awaiting Onboarding", count: 2, priority: "urgent", link: "/admin/companies" },
        { id: 4, title: "New Blog Drafts to Review", count: 3, priority: "medium", link: "/admin/blogs" },
    ];

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
            case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-blue-100 text-blue-800 border-blue-200';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Tasks</h1>

                <div className="space-y-4">
                    {tasks.map((task) => (
                        <Link
                            key={task.id}
                            to={task.link}
                            className="block bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border-l-4 border-indigo-600"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                                    <p className="text-sm text-gray-600">{task.count} items pending</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                                    {task.priority.toUpperCase()}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
