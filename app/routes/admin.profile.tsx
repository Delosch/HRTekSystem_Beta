import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { ArrowLeftIcon, User, Mail, Phone, Shield, Calendar } from "lucide-react";

export const loader: LoaderFunction = async () => {
    // TODO: Fetch actual admin profile from session/database
    const adminProfile = {
        name: "Jane Admin",
        email: "admin@hrtek.com",
        phone: "+91 98765 43210",
        role: "Super Admin",
        joinedDate: "2024-01-15",
        lastLogin: new Date().toISOString(),
        permissions: ["Full Access", "User Management", "Content Management", "Analytics"]
    };

    return json({ adminProfile });
};

export default function AdminProfile() {
    const { adminProfile } = useLoaderData<typeof loader>();

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <Link to="/admin" className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-6">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Link>

                <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Profile</h1>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b">
                        <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center">
                            <User className="w-12 h-12 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{adminProfile.name}</h2>
                            <p className="text-gray-600">{adminProfile.role}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Email</p>
                                <p className="font-medium text-gray-900">{adminProfile.email}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Phone className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium text-gray-900">{adminProfile.phone}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Shield className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Role</p>
                                <p className="font-medium text-gray-900">{adminProfile.role}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <Calendar className="w-5 h-5 text-gray-400 mt-1" />
                            <div>
                                <p className="text-sm text-gray-500">Joined Date</p>
                                <p className="font-medium text-gray-900">
                                    {new Date(adminProfile.joinedDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 pt-8 border-t">
                        <h3 className="font-semibold text-gray-900 mb-4">Permissions</h3>
                        <div className="flex flex-wrap gap-2">
                            {adminProfile.permissions.map((permission, idx) => (
                                <span
                                    key={idx}
                                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium"
                                >
                                    {permission}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
