import { json, redirect, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useActionData, useNavigation, Form } from "@remix-run/react";
import { useState, useEffect } from "react";
import { getSession, commitSession, createAuthSession } from "~/lib/session.server";
import { createOTP, sendOTPEmail } from "~/lib/email.otp.server";
import { sendLoginOTP } from "~/services/sms.server";
import { ShieldCheck, Mail, Lock, Key, ArrowRight, Loader2, Eye, EyeOff, Smartphone, RefreshCw } from "lucide-react";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || "b2b_platform";
const ADMIN_EMAIL = "atul.dixit@hrteksystems.in";
const ADMIN_PASS_FALLBACK = "Hrteksystem@098";
const ADMIN_PHONE = "+919935959986"; // Master admin phone

async function getAdminRecord() {
    const ddb = getDynamoDBDocumentClient();
    const { Item } = await ddb.send(new GetCommand({
        TableName: USERS_TABLE,
        Key: { pk: "USER#ADMIN_MASTER", sk: "PROFILE" }
    }));
    return Item;
}

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
    const ddb = getDynamoDBDocumentClient();

    if (actionType === "login") {
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (email !== ADMIN_EMAIL) {
            return json({ error: "Invalid admin credentials" }, { status: 401 });
        }

        const adminRecord = await getAdminRecord();
        let isValid = false;

        if (adminRecord && adminRecord.password_hash) {
            isValid = await bcrypt.compare(password, adminRecord.password_hash);
        } else {
            isValid = password === ADMIN_PASS_FALLBACK;
        }

        if (!isValid) {
            return json({ error: "Invalid admin credentials" }, { status: 401 });
        }

        const otp = createOTP();
        await sendOTPEmail(ADMIN_EMAIL, otp);
        // Also send to mobile for double-verification
        await sendLoginOTP(adminRecord?.phone || ADMIN_PHONE, otp);

        console.log("-----------------------------------------");
        console.log(`🔑 [ADMIN OTP] Sent to ${ADMIN_EMAIL} and mobile: ${otp}`);
        console.log("-----------------------------------------");

        session.set("pendingAdminOTP", otp);
        session.set("otpExpiry", Date.now() + 10 * 60 * 1000);

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

        session.unset("pendingAdminOTP");
        session.unset("otpExpiry");

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
            phone: ADMIN_PHONE
        }, "/admin");
    }

    if (actionType === "request_reset") {
        const email = formData.get("email") as string;
        const phone = formData.get("phone") as string;

        if (email !== ADMIN_EMAIL) {
            return json({ error: "Email not authorized for admin reset" }, { status: 403 });
        }

        const otp = createOTP();
        await sendOTPEmail(ADMIN_EMAIL, otp);
        await sendLoginOTP(phone, otp);

        session.set("resetAdminOTP", otp);
        session.set("resetPhone", phone);
        session.set("otpExpiry", Date.now() + 10 * 60 * 1000);

        return json({ step: "reset_otp", message: "Verification codes sent to your email and mobile." }, {
            headers: { "Set-Cookie": await commitSession(session) }
        });
    }

    if (actionType === "verify_reset_otp") {
        const otpInput = formData.get("otp") as string;
        const storedOtp = session.get("resetAdminOTP");
        const expiry = session.get("otpExpiry");

        if (!storedOtp || !expiry || Date.now() > expiry) {
            return json({ error: "OTP expired or invalid.", step: "forgot_password" }, { status: 400 });
        }

        if (otpInput !== storedOtp) {
            return json({ error: "Incorrect OTP", step: "reset_otp" }, { status: 400 });
        }

        return json({ step: "new_password" });
    }

    if (actionType === "save_new_password") {
        const newPassword = formData.get("new_password") as string;
        const storedOtp = session.get("resetAdminOTP");
        const phone = session.get("resetPhone") as string;

        if (!storedOtp) return redirect("/admin/login");

        const password_hash = await bcrypt.hash(newPassword, 12);

        await ddb.send(new UpdateCommand({
            TableName: USERS_TABLE,
            Key: { pk: "USER#ADMIN_MASTER", sk: "PROFILE" },
            UpdateExpression: "SET password_hash = :p, email = :e, phone = :ph, isAdmin = :a",
            ExpressionAttributeValues: {
                ":p": password_hash,
                ":e": ADMIN_EMAIL,
                ":ph": phone || ADMIN_PHONE,
                ":a": true
            }
        }));

        session.unset("resetAdminOTP");
        session.unset("resetPhone");
        session.unset("otpExpiry");

        return json({ step: "login", message: "Password updated successfully. Please login." }, {
            headers: { "Set-Cookie": await commitSession(session) }
        });
    }

    return json({ error: "Invalid action" }, { status: 400 });
}

export default function AdminLogin() {
    const actionData = useActionData<any>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting" || navigation.state === "loading";
    const [step, setStep] = useState<"login" | "otp" | "forgot_password" | "reset_otp" | "new_password">("login");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (actionData?.step) {
            setStep(actionData.step);
        }
    }, [actionData]);

    return (
        <div className="min-h-screen bg-[#000814] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/20 rounded-3xl border border-blue-500/30 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            <ShieldCheck className="w-10 h-10 text-blue-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-2 tracking-tight uppercase">Admin <span className="text-blue-500">Gateway</span></h1>
                        <p className="text-blue-200/40 text-xs font-bold uppercase tracking-widest">Secure Executive Access</p>
                    </div>

                    <Form method="post" className="space-y-6">
                        <input type="hidden" name="_action" value={
                            step === "login" ? "login" :
                                step === "otp" ? "verify_otp" :
                                    step === "forgot_password" ? "request_reset" :
                                        step === "reset_otp" ? "verify_reset_otp" : "save_new_password"
                        } />

                        {step === "login" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 ml-1">Admin Identity</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/50 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            defaultValue={ADMIN_EMAIL}
                                            className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-3 ml-1">
                                        <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest">Secret Key</label>
                                        <button
                                            type="button"
                                            onClick={() => setStep("forgot_password")}
                                            className="text-[10px] font-black text-blue-500/50 hover:text-blue-400 uppercase tracking-widest transition-colors"
                                        >
                                            Reset Key?
                                        </button>
                                    </div>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/50 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            className="block w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/50 hover:text-blue-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === "forgot_password" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20 mb-6">
                                    <p className="text-xs text-blue-200 font-medium leading-relaxed">Identity verification required. OTP will be sent to your authorized email and mobile number.</p>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 ml-1">Email Verification</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="Enter admin email"
                                        className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 ml-1">Mobile Verification</label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/50" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            required
                                            placeholder="+91 XXXXX XXXXX"
                                            className="block w-full pl-12 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {(step === "otp" || step === "reset_otp") && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="text-center space-y-2">
                                    <h2 className="text-xl font-black text-white uppercase tracking-tight">Verify Identity</h2>
                                    <p className="text-blue-200/40 text-[10px] font-bold uppercase tracking-widest">6-Digit Code Transmitted</p>
                                </div>
                                <div className="relative group">
                                    <Key className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-blue-500" />
                                    <input
                                        type="text"
                                        name="otp"
                                        required
                                        autoFocus
                                        maxLength={6}
                                        placeholder="0 0 0 0 0 0"
                                        className="block w-full pl-16 pr-5 py-5 bg-white/5 border border-white/20 rounded-3xl text-white text-3xl font-black tracking-[0.4em] text-center focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {step === "new_password" && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-xl font-black text-white text-center uppercase tracking-tight mb-8">Override Security Key</h2>
                                <div>
                                    <label className="block text-[10px] font-black text-blue-400 uppercase tracking-widest mb-3 ml-1">New Secret Key</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500/50" />
                                        <input
                                            type="password"
                                            name="new_password"
                                            required
                                            placeholder="••••••••••••"
                                            className="block w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-blue-200/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {(actionData?.error || actionData?.message) && (
                            <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest text-center border animate-in zoom-in-95 duration-300 ${actionData?.error ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-green-500/10 border-green-500/30 text-green-400'}`}>
                                {actionData?.error || actionData?.message}
                            </div>
                        )}

                        <div className="space-y-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className={`w-full py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-black uppercase tracking-widest text-xs shadow-xl ${step === "login" || step === "forgot_password"
                                    ? "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20"
                                    : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20"
                                    }`}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        {step === "login" && <>Grant Access <ArrowRight className="w-5 h-5" /></>}
                                        {step === "otp" && <>Confirm Authorization <ShieldCheck className="w-5 h-5" /></>}
                                        {step === "forgot_password" && <>Initiate Reset <RefreshCw className="w-5 h-5" /></>}
                                        {step === "reset_otp" && <>Verify Identity <ShieldCheck className="w-5 h-5" /></>}
                                        {step === "new_password" && <>Update Security Key <Lock className="w-5 h-5" /></>}
                                    </>
                                )}
                            </button>

                            {(step !== "login") && (
                                <button
                                    type="button"
                                    onClick={() => setStep("login")}
                                    className="w-full text-blue-500/50 hover:text-blue-400 text-[10px] font-black uppercase tracking-widest transition-colors py-2"
                                >
                                    Return to Gateway
                                </button>
                            )}
                        </div>
                    </Form>
                </div>

                <p className="text-center mt-12 text-blue-200/10 text-[9px] font-black tracking-[0.2em] uppercase">
                    &copy; 2026 Neural Link Security Protocol — HR-Tek Systems
                </p>
            </div>
        </div>
    );
}
