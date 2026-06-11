import { Form, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  EnvelopeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  PencilIcon,
  ChevronLeftIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon,
  InboxIcon,
  ClockIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import Squares from "~/components/squareBg";
import { HoverInput } from "~/components/AuthCards";

import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { getSession, commitSession, requireUserSession } from "~/lib/session.server";
import { saveEmailOTP, verifyEmailOTP, updateUser } from "~/models/user.model.server";
import { sendOTPEmail, createOTP } from "~/lib/email.otp.server";

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUserSession(request);
  const formData = await request.formData();
  const action = formData.get("action");

  try {
    if (action === "send_verification") {
      const otp = createOTP();
      await saveEmailOTP(user.userId, otp);

      // Send to the current user's email or the one in the form if we just updated it?
      // Usually send to user.email found in session/db.
      // If the user just updated email, user.email in session might be old until refreshed.
      // But update_email action below updates the session.
      // So here we assume user.email is current.
      await sendOTPEmail(user.email, otp);

      return json({ success: true, message: "Verification email sent!" });
    }

    if (action === "verify_code") {
      const code = formData.get("verification_code") as string;
      if (!code) return json({ error: "Code is required" }, 400);

      const isValid = await verifyEmailOTP(user.userId, code);

      if (isValid) {
        // Update session to reflect verified status
        const session = await getSession(request.headers.get("Cookie"));
        session.set("is_verified_email", true);

        return json(
          { success: true, verified: true },
          { headers: { "Set-Cookie": await commitSession(session) } }
        );
      } else {
        return json({ error: "Invalid or expired verification code" }, 400);
      }
    }

    if (action === "update_email") {
      const newEmail = formData.get("new_email") as string;
      if (!newEmail || !newEmail.includes("@")) {
        return json({ error: "Invalid email address" }, 400);
      }

      // Update user in DB
      const updatedUser = await updateUser(user.userId, { email: newEmail });

      // Update session with new email and unverified status
      const session = await getSession(request.headers.get("Cookie"));
      session.set("email", updatedUser.email);
      session.set("is_verified_email", false);

      // Successfully updated, now trigger OTP send implicitly or let client do it?
      // Better to trigger sending OTP to the NEW email right away
      const otp = createOTP();
      await saveEmailOTP(user.userId, otp);
      await sendOTPEmail(updatedUser.email, otp);

      return json(
        { success: true, email: updatedUser.email, message: "Email updated and verification code sent!" },
        { headers: { "Set-Cookie": await commitSession(session) } }
      );
    }

    return json({ error: "Unknown action" }, 400);
  } catch (e) {
    console.error("Email verification error:", e);
    return json({ error: (e as Error).message }, 500);
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUserSession(request);

  // If already verified, we can optionally redirect or just show success state
  // But let's allow them to see the verified state
  if (user.is_verified_email) {
    // return redirect("/dashboard"); 
    // OR pass verified status to show success screen immediately
  }

  // Mask email for display
  const [local, domain] = user.email.split('@');
  const maskedLocal = local.length > 2
    ? `${local.charAt(0)}***${local.charAt(local.length - 1)}`
    : local;
  const maskedEmail = `${maskedLocal}@${domain}`;

  return json({
    email: user.email,
    masked_email: maskedEmail,
    is_verified: user.is_verified_email
  });
};

export default function EmailVerify() {
  const fetcher = useFetcher<any>();
  const loaderData = useLoaderData<typeof loader>();
  const [step, setStep] = useState<"init" | "code" | "update" | "success">(
    loaderData.is_verified ? "success" : "init"
  );

  const [countdown, setCountdown] = useState(0);
  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [newEmail, setNewEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [particles, setParticles] = useState<Array<{ left: string; top: string; duration: number; delay: number }>>([]);

  // Fix hydration mismatch by generating particles only on client
  useEffect(() => {
    setParticles(
      [...Array(15)].map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 12 + i * 2,
        delay: i * 0.5,
      }))
    );
  }, []);

  // If loader says verified, set success immediately
  useEffect(() => {
    if (loaderData.is_verified && step !== "success") {
      setStep("success");
    }
  }, [loaderData.is_verified]);

  // Derived states
  const isSubmitting = fetcher.state === "submitting";

  // 🔥 FIX: Track the last action submitted so we know what to do when fetcher becomes idle
  const [lastSubmittedAction, setLastSubmittedAction] = useState<string | null>(null);

  // Use useEffect to capture the action when it's submitting
  useEffect(() => {
    if (isSubmitting && fetcher.formData) {
      setLastSubmittedAction(fetcher.formData.get("action") as string);
    }
  }, [isSubmitting, fetcher.formData]);

  const isSendingEmail = isSubmitting && (lastSubmittedAction === "send_verification" || lastSubmittedAction === "update_email");
  const isVerifying = isSubmitting && lastSubmittedAction === "verify_code";

  // Framer Motion shared values
  const cardScale = useMotionValue(1);
  const cardRotateX = useMotionValue(0);
  const cardRotateY = useMotionValue(0);
  const backgroundGradient = useTransform(
    [cardRotateX, cardRotateY],
    (latest: any) => `linear-gradient(${latest[1] * 2}deg, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.1))`
  );

  // Handle fetcher response effects
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      if (fetcher.data.error) {
        if (lastSubmittedAction === "verify_code") {
          setCodeError(fetcher.data.error);
          setVerificationCode(["", "", "", "", "", ""]);
          inputRefs.current[0]?.focus();
        } else {
          alert(fetcher.data.error);
        }
        setIsResending(false);
      } else if (fetcher.data.success) {
        // More robust step transition: if we get success from sending or updating, go to code step
        const isSendSuccess = lastSubmittedAction === "send_verification" || fetcher.data.message?.includes("sent");
        const isUpdateSuccess = lastSubmittedAction === "update_email";
        const isVerifySuccess = lastSubmittedAction === "verify_code" || fetcher.data.verified;

        if (isSendSuccess || isUpdateSuccess) {
          setSuccessMessage(fetcher.data.message || "Verification code sent!");
          setStep("code");
          setCountdown(60);
          setIsResending(false);
        } else if (isVerifySuccess) {
          setStep("success");
        }

        // Clear last action after successful completion
        setLastSubmittedAction(null);
      }
    }
  }, [fetcher.state, fetcher.data, lastSubmittedAction]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "code" && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Focus management
  useEffect(() => {
    if (step === 'code' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setCodeError("");

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (newCode.every(digit => digit) && newCode.join("").length === 6) {
      // Small delay to allow visual update before submit
      setTimeout(() => {
        const codeToSubmit = newCode.join("");
        fetcher.submit(
          { action: "verify_code", verification_code: codeToSubmit },
          { method: "post" }
        );
      }, 300);
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newCode = pastedText.split('').concat(Array(6).fill('')).slice(0, 6);
    setVerificationCode(newCode);

    const lastIndex = Math.min(pastedText.length, 5);
    inputRefs.current[lastIndex]?.focus();

    if (pastedText.length === 6) {
      setTimeout(() => {
        fetcher.submit(
          { action: "verify_code", verification_code: pastedText },
          { method: "post" }
        );
      }, 300);
    }
  };

  const handleSendVerification = () => {
    setCodeError("");
    fetcher.submit(
      { action: "send_verification" },
      { method: "post" }
    );
  };

  const handleResend = () => {
    setIsResending(true);
    setCodeError("");
    setVerificationCode(["", "", "", "", "", ""]);
    fetcher.submit(
      { action: "send_verification" },
      { method: "post" }
    );
  };

  const handleUpdateEmailSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newEmail || !newEmail.includes('@')) return;

    fetcher.submit(
      { action: "update_email", new_email: newEmail },
      { method: "post" }
    );
  };

  const getStepIcon = () => {
    switch (step) {
      case "init": return EnvelopeIcon;
      case "code": return InboxIcon;
      case "update": return PencilIcon;
      case "success": return CheckCircleIcon;
      default: return EnvelopeIcon;
    }
  };

  const getStepColor = () => {
    switch (step) {
      case "init": return "blue";
      case "code": return "indigo";
      case "update": return "purple";
      case "success": return "green";
      default: return "blue";
    }
  };

  const StepIcon = getStepIcon();
  const stepColor = getStepColor();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 overflow-hidden flex items-center justify-center p-4">
      <Squares
        speed={0.3}
        squareSize={50}
        direction="diagonal"
        borderColor="#E7E7E7"
        hoverFillColor="#4F46E5"
      />

      {/* Particles - Fixed Hydration Mismatch */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-blue-200/30 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay
            }}
            style={{
              left: p.left,
              top: p.top
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md">
        <motion.div
          layout
          style={{
            scale: cardScale,
            rotateX: cardRotateX,
            rotateY: cardRotateY,
            background: backgroundGradient
          }}
          onHoverStart={() => cardScale.set(1.02)}
          onHoverEnd={() => cardScale.set(1)}
          className="relative w-full rounded-3xl bg-white/90 backdrop-blur-xl shadow-2xl border border-white/50 p-8 flex flex-col items-center overflow-hidden"
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-t-3xl overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${stepColor === "blue" ? "from-blue-500 to-cyan-500" :
                stepColor === "indigo" ? "from-indigo-500 to-purple-500" :
                  stepColor === "purple" ? "from-purple-500 to-pink-500" :
                    stepColor === "green" ? "from-green-500 to-emerald-500" :
                      "from-blue-500 to-cyan-500"
                }`}
              initial={{ width: "25%" }}
              animate={{
                width: step === "init" ? "25%" :
                  step === "code" ? "75%" :
                    step === "update" ? "50%" :
                      step === "success" ? "100%" : "25%"
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          {/* Icon */}
          <motion.div
            className="relative mb-6"
            animate={{
              rotate: step === "success" ? 360 : 0,
              scale: step === "success" ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <motion.div
              className={`p-4 rounded-full ${stepColor === "blue" ? "bg-blue-100" :
                stepColor === "indigo" ? "bg-indigo-100" :
                  stepColor === "purple" ? "bg-purple-100" :
                    stepColor === "green" ? "bg-green-100" :
                      "bg-blue-100"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <StepIcon className={`w-8 h-8 ${stepColor === "blue" ? "text-blue-600" :
                stepColor === "indigo" ? "text-indigo-600" :
                  stepColor === "purple" ? "text-purple-600" :
                    stepColor === "green" ? "text-green-600" :
                      "text-blue-600"
                }`} />
            </motion.div>

            {(step === "code" || isVerifying || isSendingEmail) && (
              <motion.div
                className={`absolute inset-0 rounded-full ${stepColor === "blue" ? "bg-blue-400/30" :
                  stepColor === "indigo" ? "bg-indigo-400/30" :
                    stepColor === "purple" ? "bg-purple-400/30" :
                      stepColor === "green" ? "bg-green-400/30" :
                        "bg-blue-400/30"
                  }`}
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
          </motion.div>

          <AnimatePresence mode="wait" initial={false}>
            {/* Initial Step */}
            {step === "init" && (
              <motion.div
                key="init"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">Email Verification</h2>
                  <p className="text-gray-600 text-sm">Verify your email address for secure access.</p>
                </div>

                <div className="w-full text-center space-y-2">
                  <p className="text-base text-gray-700 font-medium">
                    Your email: <span className="font-semibold">{loaderData.masked_email}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    We'll send a verification code to this address.
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={handleSendVerification}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold shadow-lg overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSendingEmail}
                >
                  <span className="flex items-center justify-center">
                    {isSendingEmail ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                        Sending Email...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5 mr-2 -rotate-45" />
                        Send Verification Email
                      </>
                    )}
                  </span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep("update")}
                  className="text-sm text-purple-600 hover:text-purple-800 hover:underline transition-colors"
                >
                  Use a different email
                </button>
              </motion.div>
            )}

            {/* Code Step */}
            {step === "code" && (
              <motion.div
                key="code"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">Check Your Email</h2>
                  <p className="text-gray-600 text-sm">
                    We sent a 6-digit verification code to <span className="font-semibold">{loaderData.masked_email}</span>
                  </p>
                </div>

                <div className="w-16 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center shadow-sm mx-auto">
                  <EnvelopeIcon className="w-8 h-8 text-indigo-600" />
                </div>

                <div className="flex space-x-3" onPaste={handleCodePaste}>
                  {verificationCode.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-300 ${codeError
                        ? "border-red-300 bg-red-50 text-red-900"
                        : digit
                          ? "border-indigo-500 bg-indigo-50 text-indigo-900"
                          : "border-gray-200 bg-white text-gray-900 focus:border-indigo-500 focus:bg-indigo-50"
                        }`}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                <AnimatePresence>
                  {codeError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2 text-red-600 text-sm"
                    >
                      <ExclamationCircleIcon className="w-4 h-4" />
                      <span>{codeError}</span>
                    </motion.div>
                  )}
                  {successMessage && !codeError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2 text-green-600 text-sm"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{successMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.button
                  type="button"
                  onClick={() => fetcher.submit({ action: "verify_code", verification_code: verificationCode.join("") }, { method: "post" })}
                  disabled={isVerifying || verificationCode.join("").length !== 6}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg disabled:opacity-50"
                >
                  {isVerifying ? "Verifying..." : "Verify Email"}
                </motion.button>

                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                  <motion.button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || isResending}
                    className={`flex items-center space-x-1 ${countdown > 0 || isResending ? "text-gray-400" : "text-indigo-600 hover:underline"}`}
                  >
                    <ClockIcon className="w-4 h-4" />
                    <span>{isResending ? "Resending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Email"}</span>
                  </motion.button>
                  <button onClick={() => setStep("update")} className="text-purple-600 hover:underline">Change email</button>
                </div>
              </motion.div>
            )}

            {/* Update Step */}
            {step === "update" && (
              <motion.div
                key="update"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-800">Update Email</h2>
                <form onSubmit={handleUpdateEmailSubmit} className="w-full space-y-4">
                  <HoverInput
                    id="new_email"
                    type="email"
                    placeholder="New email address"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <motion.button
                    type="submit"
                    disabled={isSendingEmail}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold shadow-lg"
                  >
                    {isSendingEmail ? "Updating..." : "Send Code to New Email"}
                  </motion.button>
                </form>
                <button onClick={() => setStep(loaderData.is_verified ? "success" : "init")} className="text-gray-500 hover:underline text-sm">Cancel</button>
              </motion.div>
            )}

            {/* Success Step */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center space-y-6 text-center"
              >
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircleIcon className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
                <button
                  onClick={() => window.location.href = "/dashboard"}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg"
                >
                  Continue to Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}