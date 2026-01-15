import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
    ArrowLeftIcon,
    UserIcon,
    EnvelopeIcon,
    PhoneIcon,
    ShieldCheckIcon,
    CalendarIcon,
    FingerPrintIcon,
    KeyIcon,
    LockClosedIcon,
    ShieldExclamationIcon,
    IdentificationIcon
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

export const loader: LoaderFunction = async () => {
    // TODO: Fetch actual admin profile from session/database
    const adminProfile = {
        name: "Jane Admin",
        email: "admin@hrtek.ai",
        phone: "+91 98765 43210",
        role: "Super Admin",
        joinedDate: "2024-01-15",
        lastLogin: new Date().toISOString(),
        permissions: ["Full Access", "User Management", "Content Management", "Analytics", "Financial Audit", "AI Governance"]
    };

    return json({ adminProfile });
};

export default function AdminProfile() {
    const { adminProfile } = useLoaderData<typeof loader>();

    return (
        <div className="max-w-4xl mx-auto space-y-10 p-4 animate-in fade-in duration-700">
            {/* Nav */}
            <Link
                to="/admin"
                className="inline-flex items-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4 mr-2" />
                Return to Neural Center
            </Link>

            {/* Profile Matrix */}
            <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden relative">
                {/* Visual Accent */}
                <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600" />

                <div className="px-8 lg:px-12 pb-12 -mt-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="h-32 w-32 bg-white rounded-[2.5rem] p-1 shadow-2xl relative"
                            >
                                <div className="h-full w-full bg-slate-50 rounded-[2.2rem] flex items-center justify-center text-indigo-600 overflow-hidden">
                                    <UserIcon className="h-16 w-16" />
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-10 w-10 bg-emerald-500 border-4 border-white rounded-full flex items-center justify-center text-white">
                                    <ShieldCheckIcon className="h-5 w-5" />
                                </div>
                            </motion.div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black text-gray-900 tracking-tight">{adminProfile.name}</h1>
                                <p className="text-sm font-bold text-indigo-600 uppercase tracking-widest mt-1 flex items-center justify-center md:justify-start gap-2">
                                    <FingerPrintIcon className="h-4 w-4" />
                                    Verified Personnel
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-3">
                            <button className="px-6 py-3 bg-gray-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-800 transition-all shadow-xl shadow-gray-900/10 active:scale-95">
                                Edit Identity
                            </button>
                            <button className="p-3 bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all border border-transparent hover:border-rose-100">
                                <LockClosedIcon className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <EnvelopeIcon className="h-3 w-3" /> Communication Node
                            </p>
                            <p className="text-sm font-bold text-gray-700">{adminProfile.email}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <PhoneIcon className="h-3 w-3" /> Dedicated Link
                            </p>
                            <p className="text-sm font-bold text-gray-700">{adminProfile.phone}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <KeyIcon className="h-3 w-3" /> Security Clearance
                            </p>
                            <p className="text-sm font-bold text-gray-700 uppercase">{adminProfile.role}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <CalendarIcon className="h-3 w-3" /> Activation Date
                            </p>
                            <p className="text-sm font-bold text-gray-700">{new Date(adminProfile.joinedDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <div className="mt-12 pt-12 border-t border-gray-50">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <IdentificationIcon className="h-4 w-4" /> Access Authorized Capabilities
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {adminProfile.permissions.map((permission, idx) => (
                                <motion.span
                                    key={idx}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="px-4 py-2 bg-indigo-50/50 text-indigo-700 border border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm"
                                >
                                    {permission}
                                </motion.span>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 p-8 bg-slate-900 rounded-[2rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <ShieldExclamationIcon className="h-24 w-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <h4 className="text-white font-black text-xs uppercase tracking-widest mb-2">Security Audit Status</h4>
                            <p className="text-indigo-300 text-xs font-medium">Last multi-factor synchronization: {new Date(adminProfile.lastLogin).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
