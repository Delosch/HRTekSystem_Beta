import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useActionData, useLoaderData, useNavigation, Form, Link } from "@remix-run/react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import { AnimatedCircles } from "~/components/AnimatedCircles";
import { CleanPasswordInput } from "~/components/AuthCards";
import { getUserByEmail, updateUser } from "~/models/user.model.server";

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");
    const email = url.searchParams.get("email");

    if (!token || !email) {
        return redirect("/auth");
    }

    const user = await getUserByEmail(email);

    if (!user || user.reset_token !== token) {
        throw json({ error: "Invalid or expired reset link" }, { status: 400 });
    }

    // Check if token expired
    if (user.reset_token_expiry) {
        const expiry = new Date(user.reset_token_expiry);
        if (new Date() > expiry) {
            throw json({ error: "Reset link has expired" }, { status: 400 });
        }
    }

    return json({ email, token });
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const email = formData.get("email") as string;
    const token = formData.get("token") as string;

    if (password !== confirmPassword) {
        return json({ error: "Passwords do not match" }, { status: 400 });
    }

    if (password.length < 8) {
        return json({ error: "Password must be at least 8 characters long" }, { status: 400 });
    }

    try {
        const user = await getUserByEmail(email);
        if (!user || user.reset_token !== token) {
            return json({ error: "Invalid reset session" }, { status: 400 });
        }

        // Update user (updateUser handles hashing when 'password' is provided)
        const userId = user.pk.replace("USER#", "");
        await updateUser(userId, {
            password,
            reset_token: "",
            reset_token_expiry: ""
        });

        return redirect("/auth?reset=success");
    } catch (error) {
        console.error("Reset password error:", error);
        return json({ error: "Failed to reset password" }, { status: 500 });
    }
};

export default function ResetPassword() {
    const { email, token } = useLoaderData<typeof loader>();
    const actionData = useActionData<{ error?: string; success?: boolean }>();
    const navigation = useNavigation();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const isSubmitting = navigation.state === "submitting";

    useEffect(() => {
        if (actionData?.error) {
            toast.error(actionData.error);
        }
    }, [actionData]);

    if (actionData?.success) {
        return (
            <section className="relative w-full h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
                <AnimatedCircles />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-gray-100 text-center"
                >
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Password Reset!</h2>
                    <p className="text-gray-600 mb-8">
                        Your password has been successfully updated. You can now use your new password to sign in.
                    </p>
                    <Link
                        to="/auth"
                        className="block w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                    >
                        Go to Login
                    </Link>
                </motion.div>
            </section>
        );
    }

    return (
        <section className="relative w-full h-screen bg-white flex items-center justify-center p-4 overflow-hidden">
            <AnimatedCircles />

            <div className="relative z-10 w-full max-w-md">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
                >
                    <div className="text-center mb-10">
                        <div className="mx-auto w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                            <svg className="w-7 h-7 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">Set New Password</h2>
                        <p className="text-gray-500 mt-3 text-sm">
                            Create a strong password for <span className="text-indigo-600 font-medium">{email}</span>
                        </p>
                    </div>

                    <Form method="post" className="space-y-6">
                        <input type="hidden" name="email" value={email} />
                        <input type="hidden" name="token" value={token} />

                        <CleanPasswordInput
                            label="New Password"
                            id="password"
                            value={password}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                            show={showPassword}
                            setShow={setShowPassword}
                            score={0}
                            feedback={[]}
                        />

                        <CleanPasswordInput
                            label="Confirm New Password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                            show={showConfirmPassword}
                            setShow={setShowConfirmPassword}
                            hint={confirmPassword.length > 0 && confirmPassword !== password ? "Passwords do not match" : ""}
                            error={confirmPassword.length > 0 && confirmPassword !== password}
                            score={0}
                            feedback={[]}
                        />

                        <button
                            type="submit"
                            disabled={isSubmitting || password !== confirmPassword || password.length < 8}
                            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl font-bold shadow-lg hover:shadow-indigo-500/30 hover:shadow-2xl hover:translate-y-[-2px] active:translate-y-[0px] transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Updating...</span>
                                </div>
                            ) : (
                                "Update Password"
                            )}
                        </button>
                    </Form>
                </motion.div>
            </div>
            <ToastContainer position="bottom-right" />
        </section>
    );
}
