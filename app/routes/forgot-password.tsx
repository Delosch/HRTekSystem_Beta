import { ActionFunction, json } from "@remix-run/node";
import { useActionData, useFetcher, Link } from "@remix-run/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { AnimatedCircles } from "~/components/AnimatedCircles";
import { HoverInput } from "~/components/AuthCards";
import { getUserByEmail, updateUser } from "~/models/user.model";
import { sendPasswordResetEmail } from "~/lib/email.otp.server";


export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const email = formData.get("email") as string;
    const origin = new URL(request.url).origin;
    const crypto = await import("crypto");

    if (!email) {
        return json({ error: "Email is required" }, { status: 400 });
    }

    try {
        const user = await getUserByEmail(email);
        if (!user) {
            // To prevent enumeration attacks, we can say "Sent" even if user not found.
            // But for now, let's keep it helpful for the user.
            return json({ error: "User not found with this email" }, { status: 404 });
        }

        // Generate secure token
        const token = crypto.randomBytes(32).toString('hex');
        const expiry = new Date();
        expiry.setHours(expiry.getHours() + 1); // 1 hour expiry

        // Save token to user record
        const userId = user.pk.replace("USER#", "");
        await updateUser(userId, {
            reset_token: token,
            reset_token_expiry: expiry.toISOString()
        });

        // Send email with link
        const resetLink = `${origin}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
        await sendPasswordResetEmail(email, resetLink);

        console.log(`Password reset link sent to ${email}`);

        return json({ success: true });
    } catch (error: any) {
        console.error("Forgot password error:", error);
        return json({ error: "Failed to process request" }, { status: 500 });
    }
};

export default function ForgotPassword() {
    const actionData = useActionData<{ error?: string; success?: boolean }>();
    const fetcher = useFetcher();
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (actionData?.success) {
            setSubmitted(true);
            toast.success("Reset link sent! Check your email.");
        } else if (actionData?.error) {
            toast.error(actionData.error);
        }
    }, [actionData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Please enter your email");
            return;
        }
        fetcher.submit({ email }, { method: "post" });
    };

    return (
        <section className="relative w-full h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
            <AnimatedCircles />

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
                >
                    <div className="text-center mb-8">
                        <div className="mx-auto w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11.543 12l-1.88 1.88a2 2 0 01-2.828 0l-.66-.66a2 2 0 00-1.414 0l-1.414 1.414a2 2 0 01-1.414 0l-1.88-1.88a2 2 0 010-2.828l3.12-3.12a2 2 0 010 2.828l-.66.66a2 2 0 000 1.414l1.414 1.414a2 2 0 010 1.414l.66.66a2 2 0 001.414 0l1.88-1.88a6 6 0 012.775-5.32c-1.415.828-3.085.828-4.5.828-2.685 0-5.353-.828-7.5-2.25 2.147-1.422 4.815-2.25 7.5-2.25 1.415 0 3.085 0 4.5.828z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                        <p className="text-gray-600 mt-2 text-sm">
                            Enter your email address and we'll send you instructions to reset your password.
                        </p>
                    </div>

                    {!submitted ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-black flex items-center gap-1">
                                    Email Address
                                </label>
                                <HoverInput
                                    id="email"
                                    type="email"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                            >
                                Send Reset Link
                            </button>
                        </form>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                We've sent a password reset link to <span className="font-medium text-gray-900">{email}</span>
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Didn't receive the email? Click to resend
                            </button>
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <Link
                            to="/auth"
                            className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Sign In
                        </Link>
                    </div>
                </motion.div>
            </div>
            <ToastContainer position="bottom-right" />
        </section>
    );
}
