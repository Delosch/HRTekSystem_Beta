import { Link } from "@remix-run/react";
import { ArrowLeftIcon, Settings } from "lucide-react";

export default function WebsiteSettings() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Website Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to="/admin/website/home" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <Settings className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Home Page</h3>
                        <p className="text-sm text-gray-600">Manage homepage content and layout</p>
                    </Link>

                    <Link to="/admin/website/blogs" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <Settings className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Blog Settings</h3>
                        <p className="text-sm text-gray-600">Configure blog appearance and features</p>
                    </Link>

                    <Link to="/admin/website/seo" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <Settings className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">SEO Settings</h3>
                        <p className="text-sm text-gray-600">Optimize search engine visibility</p>
                    </Link>

                    <Link to="/admin/website/banners" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <Settings className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Banners</h3>
                        <p className="text-sm text-gray-600">Manage website banners and notices</p>
                    </Link>

                    <Link to="/admin/website/testimonials" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <Settings className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Testimonials</h3>
                        <p className="text-sm text-gray-600">Manage customer testimonials</p>
                    </Link>

                    <Link to="/admin/website/branding" className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                        <Settings className="w-8 h-8 text-indigo-600 mb-4" />
                        <h3 className="font-semibold text-gray-900 mb-2">Branding</h3>
                        <p className="text-sm text-gray-600">Customize colors, logos, and fonts</p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
