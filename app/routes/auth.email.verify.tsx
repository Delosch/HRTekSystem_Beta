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
import { saveEmailOTP, verifyEmailOTP, updateUser, getUserProfile } from "~/models/user.model.server";
import { sendOTPEmail, createOTP } from "~/lib/email.otp.server";
import { sendTemplateSMS } from "~/services/sms.server";
import { notifyAdmin } from "~/services/admin.notifier.server";

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
        // 1. Update user status in DB to "PendingApproval" (or keep "None" as per current admin filter)
        // Admin's getPendingUsers looks for "None". I'll keep it "None" for now, or update it if needed.
        // But the user requested " restrict the user , user acnt see anything after that ".
        // So I'll explicitly set it to "None" just to be sure it's in the pending pool.
        await updateUser(user.userId, { onboardingStatus: "None" });

        // 2. Send Welcome notifications (SMS and Email)
        const profile = await getUserProfile(user.userId);
        const firstName = profile?.first_name ?? "there";
        const lastName = profile?.last_name ?? "";
        const userPhone = (profile?.phone ?? "").replace(/\D/g, "");
        const userEmail  = profile?.email ?? user.email;

        try {
          // Welcome SMS
          const welcomeTemplate = process.env.SMS_WELCOME_TEMPLATE_NAME;
          if (welcomeTemplate && userPhone.length >= 10) {
            await sendTemplateSMS({ mobileNo: userPhone, templateName: welcomeTemplate, params: firstName })
              .catch(e => console.warn("[SMS Welcome] Failed:", e));
          }

          // Welcome Email
          const nodemailer = await import("nodemailer");
          const hasSmtp  = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
          const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;
          if (hasSmtp || hasGmail) {
            const transporter = hasSmtp
              ? nodemailer.default.createTransport({
                  host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT) || 587,
                  secure: process.env.SMTP_SECURE === "true",
                  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
                })
              : nodemailer.default.createTransport({
                  service: "Gmail",
                  auth: { user: process.env.GMAIL_USER, pass: process.env.GOOGLE_APP_PASSWORD },
                });
            await transporter.sendMail({
              from: process.env.SMTP_FROM || '"HRTek System" <noreply@hrteksystem.com>',
              to: userEmail,
              subject: "Thank you for registering with HRTek System",
              html: `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"></head>
              <body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
                <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 16px;">
                  <tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                      <tr><td style="background:linear-gradient(135deg,#023e8a 0%,#0353a4 100%);padding:40px 48px;text-align:center;">
                        <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Thank You, ${firstName}!</h1>
                        <p style="color:#93c5fd;margin:8px 0 0;font-size:15px;">Your registration with HRTek System is confirmed</p>
                      </td></tr>
                      <tr><td style="padding:40px 48px;color:#334155;">
                        <p style="font-size:15px;line-height:1.6;margin:0 0 20px;">Hi <strong>${firstName}</strong>, thank you for registering with <strong>HRTek System</strong> — your partner in HR transformation.</p>
                        <div style="background:#eff6ff;border-left:4px solid #3b82f6;border-radius:8px;padding:20px;margin:0 0 24px;">
                          <p style="margin:0;font-size:15px;color:#1e40af;font-weight:600;">Our Sales Team Will Contact You Shortly</p>
                          <p style="margin:8px 0 0;font-size:14px;color:#1d4ed8;line-height:1.5;">One of our HR transformation specialists will reach out to you within 1–2 business days to guide you through the next steps.</p>
                        </div>
                        <p style="font-size:13px;color:#94a3b8;margin:0;">Questions? <a href="mailto:support@hrteksystem.com" style="color:#2563eb;">support@hrteksystem.com</a></p>
                      </td></tr>
                      <tr><td style="background:#f8fafc;padding:16px 48px;text-align:center;color:#94a3b8;font-size:12px;border-top:1px solid #e2e8f0;">
                        © ${new Date().getFullYear()} HRTekSystem Pvt. Ltd.
                      </td></tr>
                    </table>
                  </td></tr>
                </table>
              </body></html>`,
            }).catch(e => console.warn("[Email Welcome] Failed:", e));
          }

          // 3. Notify Admin about company registration request
          await notifyAdmin("Company Registration Request", `User ${firstName} ${lastName} (${userEmail}) has completed verification and is waiting for approval to register their company.`);

        } catch (notifierError) {
          console.warn("Post-verification notification error:", notifierError);
        }

        // Update session to reflect verified status
        const session = await getSession(request.headers.get("Cookie"));
        session.set("is_verified_email", true);
        session.set("onboardingStatus", "None"); // Keep as "None" for admin dashboard compatibility

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
  const [showSalesPopup, setShowSalesPopup] = useState(false);

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
                  onClick={() => setShowSalesPopup(true)}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg"
                >
                  Continue
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Sales Team Popup — full-screen overlay after email verification */}
      <AnimatePresence>
        {showSalesPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#05060a]/95 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 32 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="relative w-full max-w-lg text-center"
            >
              {/* Glow */}
              <div className="absolute inset-0 -z-10 bg-indigo-600/20 rounded-full blur-[80px]" />

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 bg-indigo-600/20 rounded-full animate-ping" />
                  <div className="relative w-20 h-20 bg-indigo-600/10 border border-indigo-500/30 rounded-full flex items-center justify-center">
                    <svg className="w-9 h-9 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                  </div>
                </div>
              </div>

              <h1 className="text-3xl font-black text-white mb-3 tracking-tight">
                You're All Set!
              </h1>
              <p className="text-slate-400 text-base mb-8 leading-relaxed max-w-sm mx-auto">
                Thank you for registering with <span className="text-white font-semibold">HRTek System</span>. Your account is now under review.
              </p>

              {/* Key message card */}
              <div className="bg-white/[0.05] border border-white/10 rounded-2xl p-6 mb-8 text-left">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white font-bold text-base mb-1">Our Sales Team Will Contact You Shortly</p>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      One of our HR transformation specialists will reach out to you within <span className="text-slate-300 font-medium">1–2 business days</span> to discuss your requirements and guide you through onboarding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 justify-center text-xs text-slate-500 mb-8">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Your account is pending admin approval
              </div>

              <button
                onClick={() => { window.location.href = "/pending-approval"; }}
                className="w-full py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base transition-colors shadow-lg shadow-indigo-600/30"
              >
                Got It — Take Me to My Account
              </button>

              <p className="mt-4 text-xs text-slate-600">
                © {new Date().getFullYear()} HRTekSystem Pvt. Ltd.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}