import { json, redirect, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigation, Form } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getSession, commitSession, createAuthSession } from "~/lib/session.server";
import { createOTP, sendOTPEmail } from "~/lib/email.otp";
import { ShieldCheck, Mail, Lock, Key, ArrowRight, Loader2 } from "lucide-react";

const ADMIN_EMAIL = "atul.dixit@hrteksystems.in";
const ADMIN_PASS = "Hrteksystem@098";

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const isAdmin = session.get("isAdmin");
    if (isAdmin) {
        return redirect("/admin");
    }
    return null;
}

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData();
    const actionType = formData.get("_action");
    const session = await getSession(request.headers.get("Cookie"));

    if (actionType === "login") {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
            return json({ error: "Invalid admin credentials" }, { status: 401 });
        }

        const otp = createOTP();
        await sendOTPEmail(ADMIN_EMAIL, otp);

        // Print OTP to terminal for easier access
        console.log("-----------------------------------------");
        console.log(`🔑 [ADMIN OTP] The verification code for ${ADMIN_EMAIL} is: ${otp}`);
        console.log("-----------------------------------------");

        session.set("pendingAdminOTP", otp);
        session.set("otpExpiry", Date.now() + 10 * 60 * 1000); // 10 mins

        return json({ step: "otp" }, {
            headers: { "Set-Cookie": await commitSession(session) }
        });
    }

    if (actionType === "verify_otp") {
        const otpInput = formData.get("otp") as string;
        const storedOtp = session.get("pendingAdminOTP");
        const expiry = session.get("otpExpiry");

        if (!storedOtp || !expiry || Date.now() > expiry) {
            return json({ error: "OTP expired or invalid. Please try again.", step: "login" }, { status: 400 });
        }

        if (otpInput !== storedOtp) {
            return json({ error: "Incorrect OTP", step: "otp" }, { status: 400 });
        }

        // OTP verified, clear pending data and set admin session
        session.unset("pendingAdminOTP");
        session.unset("otpExpiry");

        // Use a valid v4 UUID for the hardcoded admin
        const adminId = "00000000-0000-4000-a000-000000000000";

        return await createAuthSession({
            userId: adminId,
            email: ADMIN_EMAIL,
            first_name: "Atul",
            last_name: "Dixit",
            isAdmin: true,
            onboardingStatus: "Completed",
            is_verified_email: true,
            is_verified_phone: true,
            two_fa_enabled: true,
            country_iso: "IN",
            phone: "(+91)0000000000"
        }, "/admin");
    }

    return json({ error: "Invalid action" }, { status: 400 });
}

export default function AdminLogin() {
    const actionData = useActionData<any>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";
    const [step, setStep] = useState<"login" | "otp">("login");

    useEffect(() => {
        if (actionData?.step) {
            setStep(actionData.step);
        }
    }, [actionData]);

    return (
        <div className="min-h-screen bg-[#000814] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-2xl border border-blue-500/30 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                            <ShieldCheck className="w-10 h-10 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Admin Gateway</h1>
                        <p className="text-blue-200/50">Restricted access for HR-Tek Administrators</p>
                    </div>

                    <Form method="post" className="space-y-6">
                        <input type="hidden" name="_action" value={step === "login" ? "login" : "verify_otp"} />

                        {/* Admin Email & Password Fields */}
                        <div className={`space-y-6 transition-all duration-500 ${step === "otp" ? "opacity-50 pointer-events-none" : ""}`}>
                            <div>
                                <label className="block text-sm font-semibold text-blue-200/70 mb-2 ml-1">Admin Email</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        defaultValue={ADMIN_EMAIL}
                                        readOnly={step === "otp"}
                                        placeholder="admin@hrteksystems.in"
                                        className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-blue-200/70 mb-2 ml-1">Secret Key</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        readOnly={step === "otp"}
                                        placeholder="••••••••••••"
                                        className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* OTP Field - Appears below after initial credentials check */}
                        {step === "otp" && (
                            <div className="pt-6 border-t border-white/10 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                <div className="text-center mb-4">
                                    <p className="text-blue-100/70 text-sm">
                                        Check your mail for the 6-digit code sent to <br />
                                        <span className="text-blue-400 font-semibold">{ADMIN_EMAIL}</span>
                                    </p>
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Key className="h-5 w-5 text-blue-400 group-focus-within:text-blue-300 transition-colors" />
                                    </div>
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        autoFocus
                                        maxLength={6}
                                        placeholder="0 0 0 0 0 0"
                                        className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white text-center text-2xl tracking-[0.5em] placeholder-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {(actionData?.error || actionData?.message) && (
                            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl text-sm text-center">
                                {actionData?.error || actionData?.message}
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg ${step === "login"
                                    ? "bg-blue-600 hover:bg-blue-500 shadow-blue-600/20"
                                    : "bg-green-600 hover:bg-green-500 shadow-green-600/20"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    step === "login" ? (
                                        <>Verify Credentials <ArrowRight className="w-5 h-5" /></>
                                    ) : (
                                        <>Authorize Admin Access <ShieldCheck className="w-5 h-5" /></>
                                    )
                                )}
                            </button>

                            {step === "otp" && (
                                <button
                                    type="button"
                                    onClick={() => setStep("login")}
                                    className="w-full text-blue-400/50 hover:text-blue-400 text-sm font-medium transition-colors"
                                >
                                    Modify Credentials
                                </button>
                            )}
                        </div>
                    </Form>
                </div>

                <p className="text-center mt-8 text-blue-200/20 text-xs tracking-widest uppercase">
                    Secure Neural Link Encryption &copy; 2025 HR-Tek Systems
                </p>
            </div>
        </div>
    );
}
