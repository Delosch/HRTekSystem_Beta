import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import { requireAdminSession } from "~/lib/session.server";
import { getUserProfile } from "~/models/user.model.server";
import { 
    UserIcon, 
    AtSymbolIcon, 
    DevicePhoneMobileIcon, 
    BuildingOfficeIcon, 
    CalendarIcon,
    ShieldCheckIcon,
    ArrowLeftIcon,
    FingerPrintIcon,
    MapPinIcon,
    EnvelopeIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export async function loader({ request, params }: LoaderFunctionArgs) {
    await requireAdminSession(request);
    const { userId } = params;

    if (!userId) {
        throw new Response("User ID is required", { status: 400 });
    }

    const user = await getUserProfile(userId);

    if (!user) {
        throw new Response("User Not Found", { status: 404 });
    }

    return json({ user });
}

export default function UserDetail() {
    const { user } = useLoaderData<typeof loader>();

    return (
        <div className="max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Breadcrumbs & Navigation */}
            <div className="flex items-center gap-4">
                <Link 
                    to="/admin/users" 
                    className="p-2 transition-all hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeftIcon className="h-5 w-5" />
                </Link>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <Link to="/admin" className="hover:text-indigo-600">Admin</Link>
                    <span>/</span>
                    <Link to="/admin/users" className="hover:text-indigo-600">Users</Link>
                    <span>/</span>
                    <span className="text-gray-900">User Profile</span>
                </div>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-indigo-400"></div>
                <div className="px-8 pb-8">
                    <div className="relative flex flex-col items-center sm:flex-row sm:items-end gap-6 -mt-12">
                        <div className="h-32 w-32 rounded-3xl bg-white p-1 border-4 border-white shadow-xl">
                            <div className="h-full w-full rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-4xl font-bold overflow-hidden">
                                {user.photoUrl ? (
                                    <img src={user.photoUrl} alt="" className="h-full w-full object-cover" />
                                ) : (
                                    <span>{(user.first_name || "U")[0]}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left pt-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                                {user.first_name} {user.last_name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-2">
                                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                                    <AtSymbolIcon className="h-4 w-4" />
                                    {user.email}
                                </span>
                                <span className="h-1 w-1 bg-gray-300 rounded-full hidden sm:block"></span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${user.is_verified_email ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-gray-50 text-gray-400 border border-gray-100'}`}>
                                    {user.is_verified_email ? 'Active License' : 'Unverified Account'}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 pb-2">
                            <button className="px-6 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm shadow-lg shadow-gray-900/10 hover:bg-black transition-all active:scale-95">
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Secondary Stats */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Verification Details</h2>
                        <div className="space-y-4">
                            <VerificationTile 
                                icon={EnvelopeIcon} 
                                title="Email" 
                                value={user.email}
                                verified={user.is_verified_email} 
                            />
                            <VerificationTile 
                                icon={DevicePhoneMobileIcon} 
                                title="Phone" 
                                value={user.phone || "Not provided"}
                                verified={user.is_verified_phone} 
                            />
                            <VerificationTile 
                                icon={ShieldCheckIcon} 
                                title="Two-Factor" 
                                value={user.two_fa_enabled ? "Enabled" : "Disabled"}
                                verified={user.two_fa_enabled} 
                            />
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Account Information</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">User ID</span>
                                <span className="text-xs font-mono font-bold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                    {user.pk.replace("USER#", "")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Registered On</span>
                                <span className="text-sm font-bold text-gray-900">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : 'Unknown'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-500">Onboarding</span>
                                <span className="text-sm font-bold text-indigo-600">
                                    {user.onboardingStatus || "None"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Details */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Core Info Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-indigo-50 rounded-xl">
                                    <BuildingOfficeIcon className="h-5 w-5 text-indigo-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Organization</h3>
                            </div>
                            {user.organisationId ? (
                                <Link to={`/admin/companies/${user.organisationId}`} className="group block">
                                    <div className="p-4 bg-gray-50 rounded-2xl group-hover:bg-indigo-50 transition-all border border-transparent group-hover:border-indigo-100">
                                        <div className="text-sm font-bold text-gray-900 group-hover:text-indigo-700">{user.organisationId}</div>
                                        <div className="text-xs text-gray-500 mt-1">Primary Organization Link</div>
                                    </div>
                                </Link>
                            ) : (
                                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                                    <span className="text-sm font-medium text-gray-400">Independent Professional</span>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-purple-50 rounded-xl">
                                    <MapPinIcon className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="font-bold text-gray-900">Location</h3>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="text-sm font-bold text-gray-900">Country: {user.country_iso || "Not Set"}</div>
                                <div className="text-xs text-gray-500 mt-1">Timezone & Regional Preferences</div>
                            </div>
                        </div>
                    </div>

                    {/* Placeholder for User Activity/Logs */}
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View Full Log</button>
                        </div>
                        <div className="p-12 text-center">
                            <CalendarIcon className="h-12 w-12 text-gray-100 mx-auto mb-4" />
                            <p className="text-sm font-medium text-gray-400">Activity tracking for this user will appear here.</p>
                        </div>
                    </div>

                    {/* Dangerous Actions */}
                    <div className="bg-red-50/50 p-6 rounded-3xl border border-red-100 flex items-center justify-between">
                        <div>
                            <h3 className="text-red-900 font-bold">Manage Account</h3>
                            <p className="text-red-700/60 text-xs font-medium">Deactivate or delete this user account.</p>
                        </div>
                        <button className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-extrabold hover:bg-red-50 transition-all shadow-sm">
                            Deactivate User
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function VerificationTile({ icon: Icon, title, value, verified }: { icon: any, title: string, value: string, verified: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${verified ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</p>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[150px]">{value}</p>
                </div>
            </div>
            {verified && (
                <ShieldCheckIcon className="h-5 w-5 text-emerald-500" />
            )}
        </div>
    );
}
