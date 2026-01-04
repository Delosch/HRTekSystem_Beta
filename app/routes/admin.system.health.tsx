import { Link } from "@remix-run/react";
import { ArrowLeftIcon, CheckCircle, XCircle, AlertTriangle, Server } from "lucide-react";

export default function SystemHealth() {
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>
                <h1 className="text-3xl font-bold text-gray-900 mb-8">System Health</h1>

                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Server className="w-6 h-6 text-gray-600" />
                                <span className="font-semibold text-gray-900">CRM Sync Status</span>
                            </div>
                            <span className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                OK
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Server className="w-6 h-6 text-gray-600" />
                                <span className="font-semibold text-gray-900">Analytics Connection</span>
                            </div>
                            <span className="flex items-center gap-2 text-green-600">
                                <CheckCircle className="w-5 h-5" />
                                OK
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Server className="w-6 h-6 text-gray-600" />
                                <span className="font-semibold text-gray-900">Banner Expiration Warnings</span>
                            </div>
                            <span className="flex items-center gap-2 text-yellow-600">
                                <AlertTriangle className="w-5 h-5" />
                                2 Warnings
                            </span>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <p className="text-sm text-gray-600">Last System Check:</p>
                        <p className="text-lg font-semibold text-gray-900">{new Date().toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
