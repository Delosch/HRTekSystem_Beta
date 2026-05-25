import { useState, useRef, useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useMotionTemplate,
} from "framer-motion";
import { Form, Link, useActionData } from "@remix-run/react";
import HCaptcha from "@hcaptcha/react-hcaptcha";
import countryCode from "app/data/country_code_order.json";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  LockClosedIcon,
  PhoneIcon,
  EyeIcon,
  EyeSlashIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { getUserCountryFromIP } from "~/utils/ip.detector";
import Logo from "./ui/Logo";

export interface Country {
  iso2: string;
  code: string;
  country: string;
  flag: string;
}

interface DialCodeSelectProps {
  value: string;
  onChange: (dialCode: string, countryIso?: string) => void;
  countries: Country[];
  selectedCountryIso: string;
}

interface PasswordInputProps {
  label: string;
  id: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  show: boolean;
  setShow: (show: boolean) => void;
  hint?: string;
  error?: boolean;
  success?: boolean;
  autoFocus?: boolean;
  strength?: { score: number; feedback: string[]; checks?: any };
  showStrength?: boolean;
}

interface SecurityVerificationProps {
  verified: boolean;
  loading: boolean;
  onTrigger: () => void;
}

interface HoverInputProps {
  id: string;
  type?: string;
  placeholder: string;
  showToggle?: [boolean, (show: boolean) => void];
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
}

interface LabelInputProps {
  label: string;
  id: string;
  type?: string;
  placeholder: string;
}

interface GradientButtonProps {
  text: string;
}

const countryCodes: Country[] = countryCode.countryCode;

// Enhanced mapping system with ISO2 + dial code composite mapping
const createEnhancedCountryMappings = (countries: Country[]) => {
  const countryByIso: Record<string, Country> = Object.fromEntries(
    countries.map((c: Country) => [c.iso2, c])
  );

  const countryByDial: Record<string, Country> = Object.fromEntries(
    countries.map((c: Country) => [c.code, c])
  );

  const countryByComposite: Record<string, Country> = Object.fromEntries(
    countries.map((c: Country) => [`${c.iso2}_${c.code}`, c])
  );

  // Define primary countries for shared dial codes (strict priority)
  const primaryCountryForDialCode: Record<string, string> = {
    "+1": "US", // USA is primary for +1 (not Canada)
    "+44": "GB", // UK is primary for +44
    "+590": "GP", // Guadeloupe is primary
    "+599": "CW", // Curaçao is primary
    "+7": "RU", // Russia is primary (not Kazakhstan)
    "+262": "RE", // Réunion is primary (not Mayotte)
    "+212": "MA", // Morocco is primary (not Western Sahara)
    "+358": "FI", // Finland is primary (not Åland Islands)
    "+61": "AU", // Australia is primary
    "+64": "NZ", // New Zealand is primary
    "+33": "FR", // France is primary
    "+39": "IT", // Italy is primary
    "+672": "AQ", // Antarctica is primary (not Norfolk Island)
  };

  // Create dial code to primary country mapping
  const primaryCountryByDialCode: Record<string, Country> = {};

  countries.forEach((country) => {
    const dialCode = country.code;
    const primaryIso = primaryCountryForDialCode[dialCode];

    if (primaryIso && country.iso2 === primaryIso) {
      primaryCountryByDialCode[dialCode] = country;
    } else if (!primaryCountryByDialCode[dialCode]) {
      primaryCountryByDialCode[dialCode] = country;
    }
  });

  return {
    countryByIso,
    countryByDial,
    countryByComposite,
    primaryCountryByDialCode,
  };
};

export default function AuthForm({ initialIsLogin = true }: { initialIsLogin?: boolean }) {
  // FIXED: Add proper hydration control
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLogin, setIsLogin] = useState(initialIsLogin);
  useEffect(() => {
    setIsLogin(initialIsLogin);
  }, [initialIsLogin]);

  const actionData = useActionData<{ error?: string; success?: string }>();

  // Country and phone control with enhanced mapping
  const [selectedCountryIso, setSelectedCountryIso] = useState("IN");
  const [selectedDialCode, setSelectedDialCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [ipDetectionComplete, setIpDetectionComplete] = useState(false);

  // ADDED: State for submission hash
  const [submissionHash, setSubmissionHash] = useState<string>("");

  // Use enhanced mapping system
  const {
    countryByIso,
    countryByDial,
    countryByComposite,
    primaryCountryByDialCode,
  } = createEnhancedCountryMappings(countryCodes);

  // Smart Password Flow States
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStep, setPasswordStep] = useState("initial");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
    checks?: any;
  }>({
    score: 0,
    feedback: [],
  });

  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const captchaRef = useRef<HCaptcha>(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const [siteKey, setSiteKey] = useState<string | null>(null);

  // Reset Captcha on Error
  useEffect(() => {
    if (actionData?.error) {
      showToast(actionData.error, "error");
      resetCaptchaUi();
      // Force regeneration of submission hash on error to ensure freshness
      const regenerateHash = async () => {
        const { hash: freshHash, timestamp: freshTimestamp } = await generateSecureSubmissionHash();
        setSubmissionHash(freshHash);
        setFormTimestamp(freshTimestamp);
      };
      regenerateHash();
    }
  }, [actionData]);

  // FIXED: Ensure client-side only operations
  useEffect(() => {
    setIsHydrated(true);

    if (typeof window !== "undefined") {
      const key = (window as any).ENV?.VITE_HCAPTCHA_SITE_KEY;

      if (key && typeof key === "string") {
        setSiteKey(key);
        console.log("✅ hCaptcha site key loaded");
      } else {
        console.error("❌ VITE_HCAPTCHA_SITE_KEY missing in window.ENV");
      }
    }
  }, []);


  // FIXED: Single IP detection with proper error handling and client-side check
  useEffect(() => {
    if (!isHydrated || ipDetectionComplete) return;

    let isMounted = true;

    const detectUserCountry = async () => {
      try {
        const result = await getUserCountryFromIP(countryCodes);

        if (!isMounted) return;

        if (result) {
          setSelectedCountryIso(result.iso);
          setSelectedDialCode(result.dialCode);

          const detectedCountry = countryByIso[result.iso];
          if (detectedCountry) {
            showToast(
              `📍 Location detected: ${detectedCountry.flag} ${detectedCountry.country}`,
              "success"
            );
          }
        } else {
          setSelectedCountryIso("US");
          setSelectedDialCode("+1");
          showToast("📍 Using default location: 🇺🇸 United States", "info");
        }
      } catch (error) {
        if (!isMounted) return;

        console.warn("Country detection failed:", error);
        setSelectedCountryIso("US");
        setSelectedDialCode("+1");
        showToast(
          "📍 Location detection failed, using default: 🇺🇸 United States",
          "error"
        );
      } finally {
        if (isMounted) {
          setIpDetectionComplete(true);
        }
      }
    };

    // Delay detection to prevent hydration issues
    const timeoutId = setTimeout(detectUserCountry, 1000);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [isHydrated, ipDetectionComplete, countryByIso]);

  // ENHANCED: Generate secure submission hash when form data changes
  const generateSecureSubmissionHash = async () => {
    try {
      const timestamp = Date.now();
      const formData = {
        action: isLogin ? "sign_in" : "sign_up",
        password: password,
        confirmPassword: confirmPassword,
        timestamp: timestamp,
        countryComposite: `${selectedCountryIso}_${selectedDialCode}`,
        // ADDED: Include email for better validation
        email: email || "", // Make sure email is included
      };

      const dataString = Object.values(formData).join("|");
      console.log("datastring .....\n", dataString);
      const encoder = new TextEncoder();
      const data = encoder.encode(dataString);

      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      return { hash: hashHex.slice(0, 16), timestamp };
    } catch (error) {
      console.warn(
        "Failed to generate secure hash, falling back to simple hash:",
        error
      );
      const timestamp = Date.now();
      return { hash: generateSimpleSubmissionHash(), timestamp };
    }
  };

  // Fallback simple hash function
  const generateSimpleSubmissionHash = () => {
    const timestamp = Date.now();
    const formData = {
      action: isLogin ? "sign_in" : "sign_up",
      password: password,
      confirmPassword: confirmPassword,
      timestamp: timestamp,
      countryComposite: `${selectedCountryIso}_${selectedDialCode}`,
      email: email || "", // Consistent with secure hash
    };

    const dataString = Object.values(formData).join("|");
    let hash = 0;
    for (let i = 0; i < dataString.length; i++) {
      const char = dataString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }

    return Math.abs(hash).toString(36);
  };

  // ADDED: Add email field state
  const [email, setEmail] = useState("");
  const [formTimestamp, setFormTimestamp] = useState(Date.now());
  // ADDED: Generate hash when form data changes
  useEffect(() => {
    if (isHydrated && (password || confirmPassword)) {
      const generateHash = async () => {
        const { hash, timestamp } = await generateSecureSubmissionHash();
        setSubmissionHash(hash);
        setFormTimestamp(timestamp);
      };

      const timeoutId = setTimeout(generateHash, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [
    isHydrated,
    password,
    confirmPassword,
    isLogin,
    selectedCountryIso,
    selectedDialCode,
    email,
  ]);

  const showToast = (message: string, type: string = "error") => {
    setToast({ show: true, message, type });
    const duration = type === "success" || type === "info" ? 4000 : 3000;
    setTimeout(
      () => setToast({ show: false, message: "", type: "" }),
      duration
    );
  };

  // Enhanced Password Strength Checker
  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const feedback: string[] = [];

    if (!checks.length) feedback.push("8+ chars");
    if (!checks.lowercase) feedback.push("lowercase");
    if (!checks.uppercase) feedback.push("uppercase");
    if (!checks.numbers) feedback.push("number");
    if (!checks.special) feedback.push("special char");

    return { score, feedback, checks };
  };

  // Smart Password Logic
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setConfirmPassword("");
    const strength = checkPasswordStrength(value);
    setPasswordStrength(strength);

    if (passwordStep === "mismatch") {
      setPasswordStep("initial");
    }
  };

  const handlePasswordKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      e.key === "Enter" &&
      password.length >= 6 &&
      passwordStrength.score >= 3
    ) {
      e.preventDefault();
      setPasswordStep("confirm");
      setConfirmPassword("");
      setTimeout(() => {
        document.getElementById("confirmPassword")?.focus();
      }, 100);
    }
  };

  const handleConfirmPasswordChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value.length > 0) {
      if (value === password) {
        setPasswordStep("verified");
        showToast("Passwords match!", "success");
      } else if (value.length >= password.length) {
        setPasswordStep("mismatch");
        showToast("Passwords don't match. Please try again.", "error");
        setTimeout(() => {
          setPasswordStep("initial");
          setPassword("");
          setConfirmPassword("");
          setPasswordStrength({ score: 0, feedback: [] });
          document.getElementById("password")?.focus();
        }, 1500);
      }
    }
  };

  const handleConfirmPasswordKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Escape") {
      e.preventDefault();
      setPasswordStep("initial");
      setConfirmPassword("");
      document.getElementById("password")?.focus();
    }
  };

  // Captcha handling
  const handleCaptchaVerify = (token: string) => {
    console.log("hCaptcha verified, token:", token);
    setCaptchaToken(token);
    setCaptchaVerified(true);
    setCaptchaLoading(false);
  };


  const handleCaptchaError = (err: any) => {
    setCaptchaVerified(false);
    setCaptchaToken("");
    setCaptchaLoading(false);
    showToast("Security verification failed. Please try again.");
    console.error("hCaptcha error:", err);
  };

  const handleCaptchaExpired = () => {
    setCaptchaVerified(false);
    setCaptchaToken("");
    setCaptchaLoading(false);
    showToast("Security verification expired. Please verify again.");
  };

  const triggerCaptcha = () => {
    if (captchaVerified || captchaLoading) return;

    if (captchaRef.current) {
      setCaptchaLoading(true);
      //captchaRef.current.execute();
    }
  };





  const resetCaptchaUi = () => {
    setCaptchaVerified(false);
    setCaptchaToken("");
    setCaptchaLoading(false);
    captchaRef.current?.resetCaptcha();
  };


  // ENHANCED: Updated handleSubmit with fresh hash generation
  const handleSubmit = async (e: React.FormEvent) => {
    if (isLogin) {
      resetCaptchaUi();
    }

    // Generate fresh hash right before submission
    const { hash: freshHash, timestamp: freshTimestamp } = await generateSecureSubmissionHash();
    setSubmissionHash(freshHash);
    setFormTimestamp(freshTimestamp);

    // Enhanced password validation before submission
    if (!isLogin) {
      if (password !== confirmPassword) {
        e.preventDefault();
        showToast(
          "Passwords don't match. Please verify your passwords.",
          "error"
        );
        setPasswordStep("mismatch");
        return;
      }

      if (password.length < 8 || passwordStrength.score < 3) {
        e.preventDefault();
        showToast("Password doesn't meet security requirements.", "error");
        return;
      }
    }

    if (!captchaVerified || !captchaToken) {
      e.preventDefault();
      showToast("Please complete the security verification");
      triggerCaptcha();
      return;
    }
  };
  const navigate = useNavigate();

  const handleFormSwitch = () => {
    const nextMode = isLogin ? "signup" : "login";
    navigate(`/auth?mode=${nextMode}`, { replace: true });
    resetCaptchaUi();
    setPassword("");
    setConfirmPassword("");
    setPasswordStep("initial");
    setPasswordStrength({ score: 0, feedback: [] });
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const isIndia = selectedCountryIso === 'IN' || selectedDialCode === '+91';

    if (isIndia) {
      // Remove non-numeric characters immediately
      const numericVal = val.replace(/\D/g, "");
      // Limit to 10 digits
      if (numericVal.length > 10) return;
      setPhone(numericVal);
    } else {
      setPhone(val);
    }
  };

  // FIXED: Enhanced dial code change handler with ISO2 mapping (no country auto-change)
  const handleDialChange = (dialCode: string, countryIso?: string) => {
    setSelectedDialCode(dialCode);

    // If country ISO is provided (from selection), use it directly
    if (countryIso) {
      setSelectedCountryIso(countryIso);
    }
    // Do NOT auto-change country based on dial code selection
  };
  // Show loading skeleton during hydration
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="mx-auto w-full max-w-6xl grid md:grid-cols-2 rounded-2xl shadow-2xl bg-white overflow-hidden">
          {/* Skeleton for Image Panel */}
          <div className="p-10 bg-gray-50 hidden md:flex flex-col justify-center animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-8"></div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
          {/* Skeleton for Form */}
          <div className="p-5">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
              </div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded mt-4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* ENHANCED: Toast with different colors for different types */}
      {toast.show && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`px-4 py-2 rounded-md shadow-lg text-sm font-medium ${toast.type === "error"
              ? "bg-red-500 text-white"
              : toast.type === "success"
                ? "bg-green-500 text-white"
                : toast.type === "info"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-500 text-white"
              }`}
          >
            {toast.message}
          </motion.div>
        </div>
      )}
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="mx-auto w-full max-w-6xl grid md:grid-cols-2 rounded-2xl shadow-2xl overflow-hidden bg-white">
          {/* Left Column: AI HR Images/Features */}
          <div className="hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
            {/* Top Section: Logo and Brand Name */}
            <Logo />

            {/* Middle Section: Main Headline */}
            <div className="my-12">
              <h1 className="text-4xl font-bold leading-tight tracking-tight">
                Empower Your Workforce with Intelligent HR
              </h1>
            </div>

            {/* Bottom Section: Vision Statement */}
            <div>
              <blockquote className="border-l-4 border-green-500 pl-4">
                <p className="text-gray-300 italic">
                  "At HRTek System, we believe in transforming the way
                  organizations manage their human resources. Our vision is to
                  empower businesses with innovative HR technology solutions
                  that drive efficiency and enhance employee engagement."
                </p>
              </blockquote>
              <div className="mt-6 h-px w-20 bg-gradient-to-r from-green-500 to-transparent"></div>
            </div>

            {/* Decorative background element */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-x-16 -translate-y-16"></div>
          </div>

          {/* Right Column: Auth Form */}
          <div className="w-full p-3 md:p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-4">
                  <h2 className="text-lg font-bold text-neutral-800">
                    {isLogin ? "Welcome Back" : "Welcome to HR-Tek System"}
                  </h2>
                  <p className="mt-1 text-xs text-neutral-600">
                    {isLogin
                      ? "Sign in to your account to continue"
                      : "Create your account to get started"}
                  </p>
                </div>

                <Form
                  method="POST"
                  className="space-y-2.5"
                  onSubmit={handleSubmit}
                >
                  {!isLogin && (
                    <motion.div
                      className="flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LabelInput
                        label="First name"
                        id="firstname"
                        placeholder="Tyler"
                      />
                      <LabelInput
                        label="Last name"
                        id="lastname"
                        placeholder="Durden"
                      />
                    </motion.div>
                  )}
                  <div className="space-y-2">
                    <div className="flex flex-col space-y-1">
                      <label className="text-xs font-medium text-black flex items-center gap-1">
                        Email Address
                      </label>
                      <HoverInput
                        id="email"
                        placeholder="you@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  {!isLogin && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, delay: 0.05 }}
                    >
                      <div className="space-y-2">
                        <div className="flex flex-col space-y-1">
                          <label className="text-xs font-medium text-black flex items-center gap-1">
                            <PhoneIcon className="h-3 w-3" />
                            Phone Number
                          </label>
                          <div className="flex gap-2">
                            <SearchableDialCodeSelect
                              value={selectedDialCode}
                              onChange={handleDialChange}
                              countries={countryCodes}
                              selectedCountryIso={selectedCountryIso}
                            />
                            <div className="flex-1">
                              <HoverInput
                                id="phone"
                                type="tel"
                                placeholder="Enter phone number"
                                value={phone}
                                onChange={handlePhoneChange}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {/* Password Section */}
                  <AnimatePresence mode="wait">
                    {!isLogin ? (
                      <motion.div
                        key="signup-passwords"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.2 }}
                        className="flex flex-col gap-4"
                      >
                        {/* Create Password Field */}
                        <CleanPasswordInput
                          label="Create Password"
                          id="password"
                          value={password}
                          onChange={(e) => {
                            handlePasswordChange(e);
                          }}
                          onKeyDown={handlePasswordKeyDown}
                          show={showPassword}
                          setShow={setShowPassword}
                          hint="Enter a strong password"
                          error={passwordStep === "mismatch"}
                          strength={passwordStrength}
                          showStrength={true}
                        />

                        {/* Confirm Password Field – appears once password is strong enough */}
                        <AnimatePresence>
                          {passwordStrength?.score >= 4 && (
                            <motion.div
                              key="confirm-password"
                              initial={{ opacity: 0, y: -8 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -8 }}
                              transition={{ duration: 0.25 }}
                            >
                              <CleanPasswordInput
                                label="Confirm Password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={handleConfirmPasswordChange}
                                onKeyDown={handleConfirmPasswordKeyDown}
                                show={showConfirmPassword}
                                setShow={setShowConfirmPassword}
                                hint={
                                  confirmPassword &&
                                    confirmPassword === password
                                    ? "Passwords match"
                                    : "Re-enter your password"
                                }
                                error={
                                  confirmPassword.length > 0 &&
                                  confirmPassword !== password
                                }
                                success={
                                  confirmPassword === password &&
                                  confirmPassword.length > 0
                                }
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="login-password"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CleanPasswordInput
                          label="Password"
                          id="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          show={showPassword}
                          setShow={setShowPassword}
                        />
                        <div className="flex justify-end mt-1">
                          <Link
                            to="/forgot-password"
                            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors"
                          >
                            Forgot Password?
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!isLogin && (
                    <motion.div
                      className="space-y-1.5"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, delay: 0.15 }}
                    >
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="agreeTerms"
                          name="agreeTerms"
                          required
                          className="mt-0.5 h-3 w-3 text-green-600 border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                        />
                        <label
                          htmlFor="agreeTerms"
                          className="text-xs text-gray-700 leading-tight"
                        >
                          I agree to the{" "}

                          <a
                            href="/legal/term"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 underline"
                          >
                            Terms & Conditions
                          </a>{" "}
                          and{" "}
                          <a
                            href="/legal/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 underline"
                          >
                            Privacy Policy
                          </a>
                        </label>
                      </div>

                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          id="subscribeMarketing"
                          name="subscribeMarketing"
                          className="mt-0.5 h-3 w-3 text-green-600 border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                        />
                        <label
                          htmlFor="subscribeMarketing"
                          className="text-xs text-gray-700 leading-tight"
                        >
                          Subscribe to newsletters, marketing emails, and SMS
                          updates
                        </label>
                      </div>
                    </motion.div>
                  )}

                  {isHydrated && siteKey && (
                    <div className="mt-2 flex justify-start">
                      <HCaptcha
                        ref={captchaRef}
                        sitekey={siteKey}
                        size="normal"
                        onVerify={handleCaptchaVerify}
                        onError={handleCaptchaError}
                        onExpire={handleCaptchaExpired}
                      />
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, delay: isLogin ? 0.1 : 0.2 }}
                  >
                    <CustomSecurityVerification
                      verified={captchaVerified}
                      loading={captchaLoading}
                      onTrigger={triggerCaptcha}
                    />
                  </motion.div>

                  <div className="pt-2 flex gap-3">
                    <div className="flex-[2]">
                      <GradientButton
                        text={isLogin ? "Sign in →" : "Sign up →"}
                      />
                    </div>
                    <Link to="/" className="flex-1">
                      <button
                        type="button"
                        className="w-full h-9 rounded-md border-2 border-neutral-200 font-bold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-all text-sm uppercase tracking-wider shadow-sm"
                      >
                        Cancel
                      </button>
                    </Link>
                  </div>
                  <input
                    type="hidden"
                    name="action"
                    value={isLogin ? "sign_in" : "sign_up"}
                  />
                  <input
                    type="hidden"
                    name="hcaptcha_token"
                    value={captchaToken}
                  />
                  <input
                    type="hidden"
                    name="country_iso2"
                    value={selectedCountryIso}
                  />
                  <input
                    type="hidden"
                    name="phone_country_code"
                    value={selectedDialCode}
                  />
                  <input type="hidden" name="phone" value={phone} />
                  <input
                    type="hidden"
                    name="country_dial_composite"
                    value={`${selectedCountryIso}_${selectedDialCode}`}
                  />

                  {/* Enhanced security fields */}
                  <input type="hidden" name="password" value={password} />
                  <input
                    type="hidden"
                    name="confirmed_password"
                    value={isLogin ? "" : confirmPassword}
                  />
                  <input
                    type="hidden"
                    name="passwords_match_verified"
                    value={
                      isLogin
                        ? "true"
                        : password === confirmPassword
                          ? "true"
                          : "false"
                    }
                  />

                  {!isLogin && (
                    <input
                      type="hidden"
                      name="password_strength_score"
                      value={passwordStrength.score}
                    />
                  )}

                  {/* FIXED: Use the dynamically generated submission hash */}
                  <input
                    type="hidden"
                    name="submission_hash"
                    value={submissionHash}
                  />
                  <input
                    type="hidden"
                    name="form_timestamp"
                    value={formTimestamp}
                  />
                  <input
                    type="hidden"
                    name="client_validation_passed"
                    value="true"
                  />
                </Form>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleFormSwitch}
                    className="text-xs text-neutral-600 hover:text-neutral-800 transition-colors"
                  >
                    {isLogin
                      ? "Don't have an account? Sign up"
                      : "Have an account? Log in"}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div >


    </>
  );
}
// FIXED: Enhanced SearchableDialCodeSelect with proper ISO2 + dial code mapping
export const SearchableDialCodeSelect = ({
  value,
  onChange,
  countries,
  selectedCountryIso,
}: DialCodeSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = 40;

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const filteredCountries = countries.filter(
    (country: Country) =>
      country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.flag.includes(searchTerm) ||
      country.country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // FIXED: Get display country using both ISO2 and dial code for precise mapping
  const getDisplayCountry = (): Country | undefined => {
    // First priority: Find exact match with both ISO2 and dial code
    const exactMatch = countries.find(
      (c: Country) => c.iso2 === selectedCountryIso && c.code === value
    );
    if (exactMatch) return exactMatch;

    // Second priority: Use the selected country's details but with current dial code
    const selectedCountry = countries.find(
      (c: Country) => c.iso2 === selectedCountryIso
    );
    if (selectedCountry) {
      // Return selected country info but display the current dial code
      return { ...selectedCountry, code: value };
    }

    // Fallback: First country with this dial code
    return countries.find((c: Country) => c.code === value);
  };

  const displayCountry = getDisplayCountry();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  // FIXED: Handle selection with both dial code and ISO2
  const handleSelect = (country: Country) => {
    // Pass both dial code and ISO2 to ensure proper mapping
    onChange(country.code, country.iso2);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    } else if (e.key === "Enter" && filteredCountries.length > 0) {
      handleSelect(filteredCountries[0]);
    }
  };

  return (
    <motion.div
      ref={dropdownRef}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"
          } circle at ${mouseX}px ${mouseY}px,
            rgba(77,77,255,0.1),
            transparent 80%
          )
        `,
      }}
      className="relative rounded-md p-[2px] transition duration-300"
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-24 bg-gray-50 border border-gray-300 rounded-md px-2 py-1.5 text-sm text-black shadow-inner focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer font-mono text-left flex items-center justify-between"
      >
        <span className="truncate">
          {displayCountry ? (
            <span className="flex items-center gap-1">
              <span>{displayCountry.flag}</span>
              <span>{value}</span>
            </span>
          ) : (
            "+--"
          )}
        </span>
        <ChevronDownIcon
          className={`w-3 h-3 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 z-50 mt-1 w-64 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden"
          >
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search dial codes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-8 pr-8 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country: Country) => {
                  // FIXED: Check for exact match using both dial code and ISO2
                  const isCurrentSelection =
                    value === country.code &&
                    selectedCountryIso === country.iso2;
                  const isPrimaryForCode =
                    countries.filter((c) => c.code === country.code)[0]
                      ?.iso2 === country.iso2;
                  return (
                    <button
                      key={`${country.code}-${country.iso2}`}
                      type="button"
                      onClick={() => handleSelect(country)}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 focus:bg-gray-100 focus:outline-none flex items-center gap-2 ${isCurrentSelection
                        ? "bg-green-50 text-green-700 border-l-4 border-green-500"
                        : value === country.code
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700"
                        }`}
                    >
                      <span className="text-base">{country.flag}</span>
                      <span className="font-mono font-medium">
                        {country.code}
                      </span>
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-xs text-gray-600">
                          {country.country}
                        </span>
                        <div className="flex items-center gap-1">
                          {isPrimaryForCode && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-1 rounded">
                              Primary
                            </span>
                          )}
                          <span className="text-xs text-gray-500">
                            ({country.iso2})
                          </span>
                          {isCurrentSelection && (
                            <span className="text-xs bg-green-100 text-green-600 px-1 rounded">
                              Selected
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  No dial codes found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Clean Password Input Component
export const CleanPasswordInput = ({
  label,
  id,
  value,
  onChange,
  onKeyDown,
  show,
  setShow,
  hint,
  error,
  success,
  autoFocus,
  strength,
  showStrength,
}: PasswordInputProps) => {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = 60;

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const getInputClasses = () => {
    const baseClasses =
      "w-full border rounded-md px-3 py-1.5 pr-10 text-sm text-black shadow-inner focus:outline-none transition-all duration-200";

    if (error) {
      return `${baseClasses} bg-red-50 border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500`;
    } else if (success) {
      return `${baseClasses} bg-green-50 border-green-300 focus:border-green-500 focus:ring-1 focus:ring-green-500`;
    } else {
      return `${baseClasses} bg-gray-50 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`;
    }
  };

  const getStrengthColor = () => {
    if (!strength) return "bg-gray-300";
    const { score } = strength;
    if (score <= 1) return "bg-red-500";
    if (score <= 2) return "bg-orange-500";
    if (score <= 3) return "bg-yellow-500";
    if (score <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (!strength) return "";
    const { score } = strength;
    if (score <= 1) return "Very Weak";
    if (score <= 2) return "Weak";
    if (score <= 3) return "Fair";
    if (score <= 4) return "Good";
    return "Strong";
  };

  return (
    <div className="flex flex-col space-y-1">
      <label
        htmlFor={id}
        className="text-xs font-medium text-black flex items-center justify-between"
      >
        <span>{label}</span>
        {hint && (
          <span
            className={`text-xs ${error
              ? "text-red-500"
              : success
                ? "text-green-600"
                : "text-gray-500"
              }`}
          >
            {hint}
          </span>
        )}
      </label>

      <motion.div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mouseX.set(e.clientX - rect.left);
          mouseY.set(e.clientY - rect.top);
        }}
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${visible ? radius + "px" : "0px"
            } circle at ${mouseX}px ${mouseY}px,
              ${error
              ? "rgba(239,68,68,0.1)"
              : success
                ? "rgba(34,197,94,0.1)"
                : "rgba(77,77,255,0.1)"
            },
              transparent 80%
            )
          `,
        }}
        className="relative rounded-md p-[2px] transition duration-300"
      >
        <div className="relative">
          <input
            ref={inputRef}
            id={id}
            name={id}
            required
            type={show ? "text" : "password"}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            className={getInputClasses()}
            placeholder="••••••••"
            suppressHydrationWarning={true}
          />

          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {show ? (
              <EyeSlashIcon className="h-3.5 w-3.5" />
            ) : (
              <EyeIcon className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </motion.div>

      {showStrength && strength && value.length > 0 && (
        <div className="mt-2 space-y-1">
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${getStrengthColor().replace(
                "bg-",
                "text-"
              )}`}
            >
              {getStrengthText()}
            </span>
            <span className="text-xs text-gray-500">{strength.score}/5</span>
          </div>
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${getStrengthColor()} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: `${(strength.score / 5) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          {strength.feedback.length > 0 && (
            <p className="text-xs text-gray-500">
              Missing: {strength.feedback.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// Custom Security Verification Component
export const CustomSecurityVerification = ({
  verified,
  loading,
  onTrigger,
}: SecurityVerificationProps) => {
  const [visible, setVisible] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = 60;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onTrigger();
    }
  };
  return (
    <motion.div
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onMouseMove={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - rect.left);
        mouseY.set(e.clientY - rect.top);
      }}
      className="relative rounded-md p-[2px] transition duration-300"
      style={{
        background: useMotionTemplate`
          radial-gradient(
            ${visible ? radius + "px" : "0px"
          } circle at ${mouseX}px ${mouseY}px,
            ${verified
            ? "rgba(34,197,94,0.3)"
            : loading
              ? "rgba(59,130,246,0.3)"
              : "rgba(77,77,255,0.3)"
          },
            transparent 80%
          )
        `,
      }}
    >
      <motion.button
        type="button"
        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 
        focus:outline-none focus:ring-1 focus:ring-offset-1 ${verified
            ? "border border-green-300 bg-green-50 text-green-700 focus:ring-green-500"
            : loading
              ? "border border-blue-300 bg-blue-50 text-blue-700 focus:ring-blue-500"
              : "border border-gray-300 bg-gray-50 text-gray-700 hover:border-gray-400 focus:ring-blue-500"
          }`}
        onClick={onTrigger}
        onKeyDown={handleKeyDown}
        disabled={loading}
        aria-label={
          loading
            ? "Security verification in progress"
            : verified
              ? "Security verification completed"
              : "Click to start security verification"
        }
        aria-pressed={verified}
      >
        <div className="flex items-center gap-2">
          <motion.div
            className="flex items-center justify-center"
            animate={loading ? { rotate: 360 } : { rotate: 0 }}
            transition={{
              duration: 1,
              repeat: loading ? Infinity : 0,
              ease: "linear",
            }}
          >
            {loading ? (
              <ArrowPathIcon className="h-3.5 w-3.5 text-blue-600" />
            ) : verified ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <CheckCircleIcon className="h-3.5 w-3.5 text-green-600" />
              </motion.div>
            ) : (
              <LockClosedIcon className="h-3.5 w-3.5 text-gray-600" />
            )}
          </motion.div>
          <span className="text-xs">
            {loading
              ? "Verifying..."
              : verified
                ? "Security verified"
                : "Verify security"}
          </span>
        </div>
        <div className="flex items-center gap-0.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className={`w-1 h-1 rounded-full ${verified
                ? "bg-green-500"
                : loading
                  ? "bg-blue-500"
                  : "bg-gray-400"
                }`}
              animate={
                loading
                  ? {
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 1, 0.5],
                  }
                  : {}
              }
              transition={{
                duration: 1.5,
                repeat: loading ? Infinity : 0,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </motion.button>
    </motion.div>
  );
};

// Helper Components
const LabelInput = ({
  label,
  id,
  type = "text",
  placeholder,
}: LabelInputProps) => {
  return (
    <div className="flex flex-col space-y-1 flex-1">
      <label htmlFor={id} className="text-xs font-medium text-black">
        {label}
      </label>
      <HoverInput id={id} type={type} placeholder={placeholder} />
    </div>
  );
};

// FIXED: HoverInput with hydration-safe autofill fix
export const HoverInput = ({
  id,
  type = "text",
  placeholder,
  showToggle,
  value,
  onChange,
  onFocus,
}: HoverInputProps) => {
  const [visible, setVisible] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const radius = 60;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getAutoComplete = (type: string, id: string) => {
    if (id === "email") return "email";
    if (id === "phone") return "tel";
    if (id === "firstname") return "given-name";
    if (id === "lastname") return "family-name";
    if (id === "password") return "current-password";
    if (id === "confirmPassword") return "new-password";
    return "off";
  };

  return (
    <>
      {/* FIXED: Only inject styles after hydration */}
      {isClient && (
        <style suppressHydrationWarning={true}>
          {`
            input:-webkit-autofill,
            input:-webkit-autofill:hover,
            input:-webkit-autofill:focus,
            input:-webkit-autofill:active {
              -webkit-box-shadow: 0 0 0 30px rgb(249 250 251) inset !important;
              -webkit-text-fill-color: rgb(0 0 0) !important;
              transition: background-color 5000s ease-in-out 0s;
            }
          `}
        </style>
      )}

      <motion.div
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          mouseX.set(e.clientX - rect.left);
          mouseY.set(e.clientY - rect.top);
        }}
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${visible ? radius + "px" : "0px"
            } circle at ${mouseX}px ${mouseY}px,
              rgba(77,77,255,0.1),
              transparent 80%
            )
          `,
        }}
        className="relative rounded-md p-[2px] transition duration-300"
      >
        <div className="relative">
          <input
            id={id}
            name={id}
            required
            type={showToggle ? (showToggle[0] ? "text" : "password") : type}
            placeholder={placeholder}
            className="w-full bg-gray-50 border border-gray-300 rounded-md px-3 py-1.5 text-sm text-black shadow-inner focus:outline-none"
            value={value}
            onChange={onChange}
            onFocus={onFocus}
            autoComplete={getAutoComplete(type, id)}
            inputMode={type === "tel" ? "tel" : undefined}
            spellCheck={type === "tel" || type === "email" ? false : undefined}
            suppressHydrationWarning={true}
          />
          {showToggle && (
            <button
              type="button"
              onClick={() => showToggle[1](!showToggle[0])}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showToggle[0] ? (
                <EyeSlashIcon className="h-3.5 w-3.5" />
              ) : (
                <EyeIcon className="h-3.5 w-3.5" />
              )}
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
};

const GradientButton = ({ text }: GradientButtonProps) => {
  return (
    <button
      type="submit"
      className="relative block w-full h-9 rounded-md bg-gradient-to-br from-black to-neutral-600 font-medium text-white shadow-inner group"
    >
      {text}
      <span className="absolute inset-x-0 -bottom-px block h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 blur-sm transition duration-500 group-hover:opacity-100" />
    </button>
  );
};
