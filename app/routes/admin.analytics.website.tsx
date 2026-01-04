import { Link } from "@remix-run/react";
import { ArrowLeftIcon, Users, TrendingUp, MousePointer, FileText } from "lucide-react";

export default function WebsiteAnalytics() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Link to="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Website Analytics</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <Users className="w-8 h-8 text-blue-600 mb-4" />
                        <h3 className="text-sm text-gray-600 mb-2">Visitors Today</h3>
                        <p className="text-3xl font-bold text-gray-900">8,921</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <TrendingUp className="w-8 h-8 text-green-600 mb-4" />
                        <h3 className="text-sm text-gray-600 mb-2">Visitors This Week</h3>
                        <p className="text-3xl font-bold text-gray-900">56,789</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <MousePointer className="w-8 h-8 text-purple-600 mb-4" />
                        <h3 className="text-sm text-gray-600 mb-2">Leads Generated</h3>
                        <p className="text-3xl font-bold text-gray-900">45</p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4">Top Landing Pages</h2>
                    {[
                        { page: "/hr-tech-maturity-assessment", views: 1200 },
                        { page: "/blog/future-of-hr-tech", views: 950 },
                        { page: "/contact-us", views: 780 },
                    ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center py-3 border-b last:border-0">
                            <span className="text-gray-700">{item.page}</span>
                            <span className="font-semibold text-gray-900">{item.views} views</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
