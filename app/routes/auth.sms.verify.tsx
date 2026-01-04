import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { Form, useFetcher, useLoaderData, useNavigate } from "@remix-run/react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import {
  CheckCircleIcon,
  ArrowPathIcon,
  PencilIcon,
  ChevronLeftIcon,
  PhoneIcon,
  PaperAirplaneIcon,
  ExclamationCircleIcon
} from "@heroicons/react/24/outline";
import Squares from "~/components/squareBg";
import countryCode from "app/data/country_code_order.json";
import { HoverInput, SearchableDialCodeSelect } from "~/components/AuthCards";
import { requireUserSession, commitSession, getSession } from "~/lib/session.server";
import { saveOTP, verifyStoredOTP, updateUser } from "~/models/user.model";
import { sendLoginOTP } from "~/services/sms.server";

const countryCodes = countryCode.countryCode;

export const action: ActionFunction = async ({ request }) => {
  try {
    const user = await requireUserSession(request);
    if (!user) {
      console.error("[SMS Verify] Unauthorized - no user session");
      return json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const action = formData.get("action");

    console.log(`[SMS Verify] Action: ${action}, User: ${user.userId}`);

    if (action === "init") {
      const phone = formData.get("phone") as string;
      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      console.log(`[SMS Verify] Generating OTP for user ${user.userId}: ${otp}`);

      // Save to DB
      await saveOTP(user.userId, otp);

      // Send SMS
      // Ensure phone number format is clean for API
      const cleanPhone = phone ? phone.replace(/\D/g, "") : (user.phone || "").replace(/\D/g, "");
      console.log(`[SMS Verify] Sending OTP to phone: ${cleanPhone}`);

      const smsResult = await sendLoginOTP(cleanPhone, otp);

      if (!smsResult.success) {
        console.error("[SMS Verify] SMS Send Error:", smsResult.error);
        return json({ error: "Failed to send SMS. Please try again." }, { status: 500 });
      }

      console.log(`[SMS Verify] OTP sent successfully to ${cleanPhone}`);
      return json({ success: true, message: "OTP sent successfully" });

    } else if (action === "otp") {
      const otp = formData.get("otp") as string;
      console.log(`[SMS Verify] Verifying OTP: ${otp} for user: ${user.userId}`);

      if (!otp) {
        console.error("[SMS Verify] No OTP provided");
        return json({ error: "OTP is required" }, { status: 400 });
      }

      const isValid = await verifyStoredOTP(user.userId, otp);
      console.log(`[SMS Verify] OTP validation result: ${isValid}`);

      if (isValid) {
        // Update session (database is already updated by verifyStoredOTP)
        const session = await getSession(request.headers.get("Cookie"));
        session.set("is_verified_phone", true);

        console.log(`[SMS Verify] OTP verified successfully, session updated`);
        return json(
          { success: true },
          {
            headers: {
              "Set-Cookie": await commitSession(session)
            }
          }
        );
      } else {
        console.warn(`[SMS Verify] Invalid or expired OTP for user ${user.userId}`);
        return json({ error: "Invalid or expired verification code" }, { status: 400 });
      }

    } else if (action === "update") {
      const country_code = formData.get("country_code") as string;
      const phone = formData.get("phone") as string;

      console.log(`[SMS Verify] Updating phone - Country: ${country_code}, Phone: ${phone}`);

      if (!country_code || !phone) {
        console.error("[SMS Verify] Missing country code or phone");
        return json({ error: "Phone number is required" }, { status: 400 });
      }

      // Format: (91)9876543210 - matching what seems to be in DB based on usage
      const formattedPhone = `(${country_code.replace('+', '')})${phone.replace(/\D/g, "")}`;

      await updateUser(user.userId, { phone: formattedPhone });

      // Auto-send OTP to new number
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await saveOTP(user.userId, otp);

      const cleanPhone = formattedPhone.replace(/\D/g, ""); // Send to new number
      const smsResult = await sendLoginOTP(cleanPhone, otp);

      if (!smsResult.success) {
        console.error("[SMS Verify] SMS Send Error (Update):", smsResult.error);
        return json({ error: "Number updated, but failed to send OTP. Please click Resend." }, { status: 500 });
      }

      console.log(`[SMS Verify] Phone updated and OTP sent to new number`);
      return json({ success: true, message: "Number updated and OTP sent" });
    }

    console.error(`[SMS Verify] Unknown action: ${action}`);
    return json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("[SMS Verify] Unexpected error:", e);
    const errorMessage = (e as Error).message || "An unexpected error occurred";

    // Check for specific DynamoDB constraint errors
    if (errorMessage.includes("Phone number is already in use")) {
      return json({ error: "This phone number is already registered to another account." }, { status: 400 });
    }

    return json({ error: errorMessage }, { status: 500 });
  }
};

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  const user = await requireUserSession(request);
  if (!user) {
    return redirect('/auth')
  }

  // Redirect if already verified
  if (user.is_verified_phone) {
    return redirect('/onboarding');
  }

  // Extract number and code if stored in (91)1234567890 format
  let phone = user.phone;
  let code = "+91"; // Default

  // Basic parsing suited for the format I saw in user.model.ts: (code)number
  const match = user.phone?.match(/^\((\d+)\)(\d+)$/);
  if (match) {
    code = "+" + match[1];
    phone = match[2];
  } else if (user.phone) {
    // Fallback if stored differently
    phone = user.phone.replace(/\D/g, "");
  }

  return json({
    country_code: code,
    phone: phone,
    masked_phone: phone ? (phone.slice(0, -4).replace(/./g, "•") + phone.slice(-4)) : "Unknown"
  });
};

export default function AuthVerify() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"init" | "otp" | "update" | "success">("init");
  const [countdown, setCountdown] = useState(60);
  const [selectedCountry, setSelectedCountry] = useState("+91");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newNumber, setNewNumber] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const fetcher = useFetcher<any>();
  const loaderData = useLoaderData<typeof loader>();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [particles, setParticles] = useState<Array<{ left: string; top: string; duration: number; delay: number }>>([]);

  // Fix hydration mismatch by generating particles only on client
  useEffect(() => {
    setParticles(
      [...Array(15)].map((_, i) => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        duration: 10 + i * 2,
        delay: i * 0.5,
      }))
    );
  }, []);

  // Enhanced animation values
  const cardScale = useMotionValue(1);
  const cardRotateX = useMotionValue(0);
  const cardRotateY = useMotionValue(0);
  const backgroundGradient = useTransform(
    [cardRotateX, cardRotateY],
    (latest: number[]) => `linear-gradient(${latest[1] * 2}deg, rgba(90, 149, 83, 0.05), rgba(34, 197, 94, 0.1))`
  );

  // Handle fetcher state changes for loading feedback
  useEffect(() => {
    if (fetcher.state === "submitting") {
      const formData = fetcher.formData as FormData | undefined;
      const action = formData?.get("action");
      if (action === "init") {
        setIsSendingOtp(true);
        setOtpError("");
        setResendMessage(null);
      } else if (action === "otp") {
        setIsVerifying(true);
        setOtpError("");
      } else if (action === "update") {
        // Clear any previous errors when starting update
        setOtpError("");
      }
    } else if (fetcher.state === "idle") {
      setIsSendingOtp(false);
      setIsVerifying(false);

      const data = fetcher.data as { error?: string; success?: boolean } | null;
      const formData = fetcher.formData as FormData | undefined;
      const action = formData?.get("action");

      if (data?.error) {
        // Show error for any action
        setOtpError(data.error);

        // If update failed, maybe we should stay on update step or show error clearly
        // For now, since handleUpdateNumberSubmit forces step 'otp', we show error there
      } else if (data?.success) {
        if (action === "init") {
          setResendMessage("Code sent!");
        } else if (action === "otp") {
          setStep("success");
          setTimeout(() => navigate("/onboarding"), 1500);
        } else if (action === "update") {
          // Update successful, we are already on 'otp' step due to optimistic update in handler
          setResendMessage("Code sent to new number!");
        }
      }
    }
  }, [fetcher.state, fetcher.data, fetcher.formData]);

  // Countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setResendMessage("You can resend the code now.");
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  // Focus management for OTP
  useEffect(() => {
    if (step === 'otp' && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [step]);

  // Enhanced OTP handling with auto-navigation
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when complete
    if (newOtp.every(digit => digit) && newOtp.join("").length === 6) {
      setTimeout(() => handleOtpSubmit(newOtp.join("")), 300);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedText.split('').concat(Array(6).fill('')).slice(0, 6);
    setOtp(newOtp);

    const lastIndex = Math.min(pastedText.length, 5);
    inputRefs.current[lastIndex]?.focus();

    if (pastedText.length === 6) {
      setTimeout(() => handleOtpSubmit(pastedText), 300);
    }
  };

  const handleVerifyClick = () => {
    setStep("otp");
    setIsSendingOtp(true);
    fetcher.submit(
      {
        action: "init",
        country_code: loaderData.country_code,
        phone: loaderData.phone
      },
      { method: "post" }
    );
    setCountdown(60);
  };

  const handleOtpSubmit = async (otpValue?: string) => {
    const otpToSubmit = otpValue || otp.join("");
    if (otpToSubmit.length !== 6) {
      setOtpError("Please enter all 6 digits");
      return;
    }

    setOtpError("");
    fetcher.submit(
      {
        action: "otp",
        otp: otpToSubmit
      },
      { method: "post" }
    );
  };

  const handleResend = () => {
    setCountdown(60);
    setResendMessage(null);
    setOtpError("");
    setOtp(["", "", "", "", "", ""]);
    setIsResending(true);

    fetcher.submit(
      {
        action: "init",
        country_code: loaderData.country_code,
        phone: loaderData.phone
      },
      { method: "post" }
    );

    setTimeout(() => setIsResending(false), 1000);
  };

  const handleUpdateNumberSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const phoneInput = e.currentTarget.querySelector<HTMLInputElement>('#phone');
    const submittedPhone = phoneInput?.value;

    if (!submittedPhone || !selectedCountry) {
      console.error("Phone number or country code missing for update.");
      return;
    }

    fetcher.submit(
      {
        action: "update",
        country_code: selectedCountry,
        phone: submittedPhone
      },
      { method: "post" }
    );

    setStep("otp");
    setCountdown(60);
    setOtp(["", "", "", "", "", ""]);
  };

  const getStepIcon = () => {
    switch (step) {
      case "init": return PhoneIcon;
      case "otp": return CheckCircleIcon;
      case "update": return PencilIcon;
      case "success": return CheckCircleIcon;
      default: return PhoneIcon;
    }
  };

  const getStepColor = () => {
    switch (step) {
      case "init": return "green";
      case "otp": return "blue";
      case "update": return "purple";
      case "success": return "green";
      default: return "green";
    }
  };

  const StepIcon = getStepIcon();
  const stepColor = getStepColor();

  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 overflow-hidden flex items-center justify-center p-4">
      <Squares
        speed={0.3}
        squareSize={50}
        direction="diagonal"
        borderColor="#E7E7E7"
        hoverFillColor="#5A9553"
      />

      {/* Enhanced Background Particles - Fixed Hydration Mismatch */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-green-200/30 rounded-full"
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
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-t-3xl overflow-hidden">
            <motion.div
              className={`h-full bg-gradient-to-r ${stepColor === "green" ? "from-green-500 to-emerald-500" :
                stepColor === "blue" ? "from-blue-500 to-indigo-500" :
                  stepColor === "purple" ? "from-purple-500 to-violet-500" :
                    "from-green-500 to-emerald-500"
                }`}
              initial={{ width: "25%" }}
              animate={{
                width: step === "init" ? "25%" :
                  step === "otp" ? "75%" :
                    step === "update" ? "50%" :
                      step === "success" ? "100%" : "25%"
              }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          </div>

          {/* Enhanced Icon with Color Coordination */}
          <motion.div
            className="relative mb-6"
            animate={{
              rotate: step === "success" ? 360 : 0,
              scale: step === "success" ? [1, 1.2, 1] : 1
            }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            <motion.div
              className={`p-4 rounded-full ${stepColor === "green" ? "bg-green-100" :
                stepColor === "blue" ? "bg-blue-100" :
                  stepColor === "purple" ? "bg-purple-100" :
                    "bg-green-100"
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <StepIcon className={`w-8 h-8 ${stepColor === "green" ? "text-green-600" :
                stepColor === "blue" ? "text-blue-600" :
                  stepColor === "purple" ? "text-purple-600" :
                    "text-green-600"
                }`} />
            </motion.div>

            {/* Pulse animation for active states */}
            {(step === "otp" || isVerifying || isSendingOtp) && (
              <motion.div
                className={`absolute inset-0 rounded-full ${stepColor === "green" ? "bg-green-400/30" :
                  stepColor === "blue" ? "bg-blue-400/30" :
                    stepColor === "purple" ? "bg-purple-400/30" :
                      "bg-green-400/30"
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
                  <h2 className="text-2xl font-bold text-gray-800">Phone Verification</h2>
                  <p className="text-gray-600 text-sm">Verify your phone number for secure access.</p>
                </div>

                <div className="w-full text-center space-y-2">
                  <p className="text-base text-gray-700 font-medium">
                    Your number: <span className="font-semibold">{`${loaderData.country_code} ${loaderData.masked_phone}`}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    We'll send a verification code to this number.
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={handleVerifyClick}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg overflow-hidden group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={isSendingOtp}
                >
                  <span className="flex items-center justify-center">
                    {isSendingOtp ? (
                      <>
                        <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                        Sending Code...
                      </>
                    ) : (
                      <>
                        <PaperAirplaneIcon className="w-5 h-5 mr-2 -rotate-45" />
                        Send Verification Code
                      </>
                    )}
                  </span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => setStep("update")}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                >
                  Use a different number
                </button>
              </motion.div>
            )}

            {/* Enhanced OTP Step */}
            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">Enter Verification Code</h2>
                  <p className="text-gray-600 text-sm">
                    A 6-digit code has been sent to <span className="font-semibold">{`${loaderData.country_code} ${loaderData.masked_phone}`}</span>
                  </p>
                </div>

                {/* Premium OTP Input */}
                <div className="flex space-x-3" onPaste={handleOtpPaste}>
                  {otp.map((digit, index) => (
                    <motion.input
                      key={index}
                      ref={(el) => inputRefs.current[index] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value.replace(/\D/g, ''))}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 transition-all duration-300 ${otpError
                        ? "border-red-300 bg-red-50 text-red-900"
                        : digit
                          ? "border-blue-500 bg-blue-50 text-blue-900"
                          : "border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:bg-blue-50"
                        }`}
                      whileFocus={{ scale: 1.1 }}
                      animate={{
                        scale: digit ? [1, 1.1, 1] : 1,
                      }}
                      autoComplete="one-time-code"
                    />
                  ))}
                </div>

                {/* Enhanced Error/Success Messages */}
                <AnimatePresence>
                  {otpError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      className="flex items-center space-x-2 text-red-600 text-sm"
                    >
                      <ExclamationCircleIcon className="w-4 h-4" />
                      <span>{otpError}</span>
                    </motion.div>
                  )}

                  {resendMessage && !otpError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.9 }}
                      className="flex items-center space-x-2 text-green-600 text-sm"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{resendMessage}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Verification Button */}
                <motion.button
                  type="button"
                  onClick={() => handleOtpSubmit()}
                  disabled={isVerifying || otp.join("").length !== 6}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                  whileHover={{ scale: isVerifying ? 1 : 1.02 }}
                  whileTap={{ scale: isVerifying ? 1 : 0.98 }}
                >
                  <AnimatePresence mode="wait">
                    {isVerifying ? (
                      <motion.div
                        key="verifying"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        <ArrowPathIcon className="w-5 h-5 mr-2 animate-spin" />
                        Verifying...
                      </motion.div>
                    ) : (
                      <motion.span
                        key="verify"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center justify-center"
                      >
                        Verify Code
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>

                {/* Enhanced Resend and Update Options */}
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm">
                  <motion.button
                    type="button"
                    onClick={handleResend}
                    disabled={countdown > 0 || isResending}
                    className={`flex items-center space-x-1 transition-colors ${countdown > 0 || isResending
                      ? "text-gray-400 cursor-not-allowed"
                      : "text-green-600 hover:text-green-800 hover:underline"
                      }`}
                    whileHover={countdown <= 0 ? { scale: 1.05 } : {}}
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${isResending ? 'animate-spin' : ''}`} />
                    <span>
                      {isResending ? "Sending..." : countdown > 0 ? `Resend in ${countdown}s` : "Resend Code"}
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => {
                      setStep("update");
                      setOtpError("");
                      setResendMessage(null);
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    Update phone number
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Enhanced Update Number Step - DETACHED DROPDOWN */}
            {step === "update" && (
              <motion.div
                key="update"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center space-y-6"
              >
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-gray-800">Update Phone Number</h2>
                  <p className="text-gray-600 text-sm">Enter the new number you wish to use.</p>
                </div>

                <form onSubmit={handleUpdateNumberSubmit} className="w-full space-y-4">
                  <input type="hidden" name="phone_country_code" value={selectedCountry} />

                  {/* ENHANCED: Detached dropdown that opens outside card bounds */}
                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-2 w-full">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="w-full sm:w-1/3  relative z-50" // High z-index for dropdown
                    >
                      <SearchableDialCodeSelect
                        value={selectedCountry}
                        onChange={(dialCode: string, countryIso?: string) => {
                          setSelectedCountry(dialCode);
                        }}
                        countries={countryCodes}
                        selectedCountryIso={loaderData.country_code}
                      />
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="w-full sm:w-2/3"
                    >
                      <HoverInput
                        id="phone"
                        type="tel"
                        placeholder="Enter phone number"
                        value={newNumber}
                        onChange={(e) => setNewNumber(e.target.value)}
                      />
                    </motion.div>
                  </div>

                  <motion.button
                    type="submit"
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 text-white font-semibold shadow-lg overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={!newNumber || isSendingOtp}
                  >
                    <span className="flex items-center justify-center">
                      {isSendingOtp ? (
                        <>
                          <ArrowPathIcon className="w-5 h-5 animate-spin mr-2" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <PaperAirplaneIcon className="w-5 h-5 mr-2 -rotate-45" />
                          Send Code to New Number
                        </>
                      )}
                    </span>
                  </motion.button>

                  <motion.button
                    type="button"
                    onClick={() => {
                      setStep("otp");
                      setResendMessage(null);
                      setOtpError("");
                    }}
                    className="w-full text-center text-sm text-gray-500 hover:text-gray-700 hover:underline transition-colors py-2"
                    whileHover={{ scale: 1.02 }}
                  >
                    <ChevronLeftIcon className="w-4 h-4 inline mr-1" />
                    Cancel
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Enhanced Success Step */}
            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full flex flex-col items-center space-y-6 text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircleIcon className="w-10 h-10 text-green-600" />
                  </div>

                  {/* Success particles */}
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-2 h-2 bg-green-400 rounded-full"
                      initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                      animate={{
                        x: Math.cos(i * 45 * Math.PI / 180) * 60,
                        y: Math.sin(i * 45 * Math.PI / 180) * 60,
                        opacity: [0, 1, 0],
                        scale: [0, 1, 0]
                      }}
                      transition={{
                        duration: 1.5,
                        delay: 0.3,
                        ease: "easeOut"
                      }}
                    />
                  ))}
                </motion.div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900">Verification Complete!</h2>
                  <p className="text-gray-600 text-sm">
                    Your phone number has been successfully verified
                  </p>
                </div>

                <motion.button
                  type="button"
                  onClick={() => window.location.href = "/dashboard"}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold shadow-lg"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 }}
                >
                  Continue to Dashboard
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Decorative elements */}
          <div className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-green-200 to-blue-200 rounded-full opacity-20 blur-xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full opacity-20 blur-xl" />
        </motion.div>
      </div>
    </section>
  );
}
