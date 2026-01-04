import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowLeftIcon, Plus, FileText, Eye, Edit, Trash2 } from "lucide-react";

export const loader: LoaderFunction = async () => {
    // TODO: Fetch from database
    const blogs = [
        { id: "1", title: "The Future of Hybrid Workforces", status: "Published", date: "2025-07-20", views: 1250 },
        { id: "2", title: "Leveraging AI for Talent Acquisition", status: "Published", date: "2025-07-15", views: 980 },
        { id: "3", title: "Q3 HR Tech Trends Report", status: "Published", date: "2025-08-01", views: 1500 },
        { id: "4", title: "Onboarding Best Practices 2025", status: "Draft", date: "2025-07-22", views: 0 },
        { id: "5", title: "Employee Wellbeing Strategies", status: "Pending", date: "2025-07-24", views: 0 },
    ];

    return json({ blogs });
};

export default function AdminBlogs() {
    const { blogs } = useLoaderData<typeof loader>();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-800';
            case 'Draft': return 'bg-gray-100 text-gray-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            default: return 'bg-blue-100 text-blue-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link to="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4">
                            <ArrowLeftIcon className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                    </div>
                    <Link
                        to="/admin/blogs/new"
                        className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Post
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {blogs.map((blog: any) => (
                                    <tr key={blog.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <FileText className="w-5 h-5 text-gray-400 mr-3" />
                                                <span className="font-medium text-gray-900">{blog.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(blog.status)}`}>
                                                {blog.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {new Date(blog.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{blog.views}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <button className="text-blue-600 hover:text-blue-700" title="View">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="text-indigo-600 hover:text-indigo-700" title="Edit">
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button className="text-red-600 hover:text-red-700" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
