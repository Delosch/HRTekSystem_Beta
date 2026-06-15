import { motion, AnimatePresence } from "framer-motion";
import { LoaderFunction, json, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { requireUserSession, getSession, commitSession } from "~/lib/session.server";
import { getUserProfile } from "~/models/user.model.server";
import { Clock, CheckCircle, XCircle, Mail, LogOut, RefreshCcw } from "lucide-react";

export const loader: LoaderFunction = async ({ request }) => {
    const user = await requireUserSession(request);
    
    // Refresh user profile from DB to get latest status
    const profile = await getUserProfile(user.userId);
    const status = profile?.onboardingStatus ?? "None";
    
    // If approved, update the session cookie before redirecting so drx sees the new status
    if (status === "Approved") {
        const session = await getSession(request.headers.get("Cookie"));
        session.set("onboardingStatus", "Approved");
        session.set("is_verified_email", true);
        session.set("is_verified_phone", true);
        return redirect("/auth/drx", {
            headers: { "Set-Cookie": await commitSession(session) },
        });
    }

    if (status === "Company" || status === "Assessment" || status === "Completed") {
        return redirect("/auth/drx");
    }
    
    return json({ 
        firstName: profile?.first_name || "there",
        email: profile?.email || "",
        status,
        rejectionReason: (profile as any)?.rejectionReason ?? null
    });
};

export default function PendingApproval() {
    const { firstName, email, status, rejectionReason } = useLoaderData<typeof loader>();
    const [searchParams] = useSearchParams();
    const urlStatus = searchParams.get("status");
    const isRejected = status === "Rejected" || urlStatus === "rejected";

    return (
        <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden flex items-center justify-center p-4">
            {/* Subtle dot pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#1e3a8a 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            
            {/* Decorative blobs */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100 rounded-full blur-[100px] opacity-40 -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-100 rounded-full blur-[80px] opacity-40 translate-y-1/3 -translate-x-1/4" />

            <div className="relative z-10 w-full max-w-2xl px-6 py-12 md:py-16 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                >
                    {/* Logo */}
                    <div className="flex justify-center mb-8">
                        <img src="/hrtek_logo.png" alt="HRTek System" className="h-10 w-auto object-contain" />
                    </div>

                    {/* Animated Icon */}
                    <div className="flex justify-center mb-8">
                        <div className="relative w-20 h-20">
                            <motion.div 
                                animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                className={`absolute inset-0 ${isRejected ? 'bg-rose-400' : 'bg-blue-400'} rounded-full blur-2xl`}
                            />
                            <div className={`relative w-20 h-20 bg-white border-2 ${isRejected ? 'border-rose-200 shadow-rose-100' : 'border-blue-200 shadow-blue-100'} rounded-3xl flex items-center justify-center shadow-xl`}>
                                {isRejected ? (
                                    <XCircle className="w-9 h-9 text-rose-500" />
                                ) : (
                                    <Clock className="w-9 h-9 text-blue-600" />
                                )}
                            </div>
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
                        {isRejected ? "Account Not Approved" : "Account Under Review"}
                    </h1>
                    
                    <p className="text-slate-500 text-lg mb-10 leading-relaxed max-w-lg mx-auto">
                        Hi <span className="text-slate-900 font-bold">{firstName}</span>, 
                        {isRejected 
                            ? " unfortunately your account could not be approved at this time." 
                            : " your identity has been verified. Our team is now conducting a quick security review of your registration."}
                    </p>

                    {/* Status Card */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 mb-8 text-left shadow-xl shadow-slate-100/80 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-[0.04]">
                            {isRejected ? (
                                <XCircle className="w-28 h-28 text-rose-700" fill="currentColor" />
                            ) : (
                                <CheckCircle className="w-28 h-28 text-blue-700" fill="currentColor" />
                            )}
                        </div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-2.5 mb-6">
                                <div className={`w-2 h-2 ${isRejected ? 'bg-rose-500' : 'bg-amber-400 animate-pulse'} rounded-full`} />
                                <span className={`${isRejected ? 'text-rose-600' : 'text-amber-600'} text-xs font-black uppercase tracking-widest`}>
                                    {isRejected ? "Registration Rejected" : "Pending Specialist Approval"}
                                </span>
                            </div>

                            {isRejected ? (
                                <>
                                    <h3 className="text-xl font-bold text-slate-900 mb-4">Reason for Rejection</h3>
                                    <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 mb-6">
                                        <p className="text-rose-900 text-sm leading-relaxed">
                                            {rejectionReason || "No specific reason was provided. This usually happens if the provided business details could not be verified or if there was a discrepancy in the registration information."}
                                        </p>
                                    </div>
                                    <p className="text-slate-600 text-sm leading-relaxed">
                                        If you believe this is a mistake or would like to provide additional information, please contact our support team.
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-slate-900 mb-5">What happens next?</h3>
                                    <ul className="space-y-5 text-sm">
                                        <li className="flex items-start gap-4">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[11px] text-blue-700 font-bold shrink-0 mt-0.5">1</span>
                                            <span className="text-slate-600 leading-relaxed">An HR transformation specialist will review your profile (usually within <span className="text-slate-900 font-semibold">1–2 business days</span>).</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[11px] text-blue-700 font-bold shrink-0 mt-0.5">2</span>
                                            <span className="text-slate-600 leading-relaxed">Once approved, you will receive an automatic email notification to <strong className="text-slate-900">{email}</strong>.</span>
                                        </li>
                                        <li className="flex items-start gap-4">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[11px] text-blue-700 font-bold shrink-0 mt-0.5">3</span>
                                            <span className="text-slate-600 leading-relaxed">You'll then have full access to register your company and start your <span className="text-slate-900 font-semibold">Digital Maturity Assessment</span>.</span>
                                        </li>
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-3 justify-center">
                        {!isRejected && (
                            <button 
                                onClick={() => window.location.reload()}
                                className="px-10 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Refresh Status
                            </button>
                        )}
                        <a 
                            href="mailto:support@hrteksystem.com"
                            className={`px-10 py-4 rounded-2xl ${isRejected ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200' : 'bg-white border-2 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50'} font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2`}
                        >
                            <Mail className="w-4 h-4" />
                            Contact Support
                        </a>
                        <a 
                            href="/auth/logout"
                            className="px-8 py-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-4 h-4" />
                            Log Out
                        </a>
                    </div>

                    <p className="mt-10 text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">
                        © {new Date().getFullYear()} HRTek System — A Product of Delosch Technologies
                    </p>
                </motion.div>
            </div>
        </section>
    );
}
