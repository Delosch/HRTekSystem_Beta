import { useState, useEffect } from "react";
import { motion, useAnimation, Variants } from "framer-motion";
import type { MetaFunction, ActionFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import { redirect, LoaderFunction } from "@remix-run/node";
import {
  ArrowRightIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { requireUserSession, getSession, commitSession } from "~/lib/session.server";
import { updateUser } from "~/models/user.model";

export const meta: MetaFunction = () => {
  return [
    { title: "Welcome to HR-Tek Systems - Your HR Transformation Journey" },
    { name: "description", content: "Begin your HR maturity journey with AI-powered insights and precision." },
  ];
};

export const loader: LoaderFunction = async ({ request }: { request: Request }) => {
  const cookie_container = await requireUserSession(request);
  if (cookie_container.onboardingStatus === "None") {
    return "allowed";
  }
  else if (cookie_container.onboardingStatus === "Completed") {
    throw new Response("Unauthorized", { status: 401 });
  }
  return "access denied";
};

// Add the action function to handle the session update
export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request.headers.get("Cookie"));
  const user = await requireUserSession(request)
  // Update the onboarding status
  session.set("onboardingStatus", "Company");
  await updateUser(user.userId, { onboardingStatus: "Company" })

  // Commit the session and redirect
  return redirect("/onboarding/company", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};

export default function OnboardingWelcome() {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const controls = useAnimation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      controls.start("visible");
    }, 300);
    return () => clearTimeout(timer);
  }, [controls]);

  // Remove the old handleGetStarted function since we'll use form submission
  // const handleGetStarted = () => {
  //   navigate("/onboarding/company");
  // };

  // Fixed Animation variants with proper TypeScript types
  const modalVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 50
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as any,
        staggerChildren: 0.1
      }
    }
  };

  const contentVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 30
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut" as any
      }
    }
  };

  const cardVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as any
      }
    }
  };

  const statsVariants: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: "easeOut" as any
      }
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4">
        {/* Animated Background */}
        <motion.div
          className="fixed inset-0 bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Refined Corporate Pattern */}
          <motion.div
            className="absolute inset-0 opacity-15"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="corporate-grid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                  <path d="M80 0H0V80" fill="none" stroke="#e5e7eb" strokeWidth="0.5" />
                  <path d="M40 0v80M0 40h80" fill="none" stroke="#e5e7eb" strokeWidth="0.25" />
                  <circle cx="40" cy="40" r="1.5" fill="#3b82f6" opacity="0.1" />
                </pattern>
                <linearGradient id="professional-overlay" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.9" />
                  <stop offset="50%" stopColor="#f1f5f9" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#e2e8f0" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#corporate-grid)" />
              <rect width="100%" height="100%" fill="url(#professional-overlay)" />
            </svg>
          </motion.div>

          {/* Animated Geometric Accents */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl transform -translate-x-36 -translate-y-36 sm:-translate-x-48 sm:-translate-y-48"
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.2, 0.3, 0.2]
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-64 h-64 sm:w-80 sm:h-80 bg-gradient-to-tl from-indigo-100/15 to-transparent rounded-full blur-3xl transform translate-x-32 translate-y-32 sm:translate-x-40 sm:translate-y-40"
              animate={{
                scale: [1.1, 1, 1.1],
                opacity: [0.15, 0.25, 0.15]
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>

          {/* Sophisticated Overlay Lines */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            <div className="absolute top-16 sm:top-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-200/30 to-transparent"></div>
            <div className="absolute bottom-16 sm:bottom-20 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-200/30 to-transparent"></div>
          </motion.div>
        </motion.div>

        {/* Animated Modal */}
        <motion.div
          className="relative w-full max-w-sm sm:max-w-2xl lg:max-w-5xl h-[85vh] max-h-[600px] transform overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.15)] border border-gray-200/60 transition-all"
          variants={modalVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="relative h-full overflow-hidden">
            {/* Premium Modal Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white via-slate-50/30 to-gray-50/40"></div>

            {/* Animated Header Accent */}
            <motion.div
              className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            {/* Layout Container */}
            <div className="relative h-full flex flex-col lg:flex-row">
              {/* Left Side - Brand & Messaging */}
              <div className="flex-1 flex flex-col justify-center px-4 py-6 sm:px-6 lg:px-8">
                <div className="w-full max-w-md mx-auto lg:mx-0">
                  {/* Animated Logo Section */}
                  <motion.div
                    className="mb-4 sm:mb-6"
                    variants={contentVariants}
                  >
                    <div className="flex items-center justify-center lg:justify-start">
                      <motion.div
                        className="relative"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        {/* Logo Glow Effect */}
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl blur-lg opacity-20 scale-110"
                          animate={{
                            opacity: [0.2, 0.3, 0.2],
                            scale: [1.1, 1.2, 1.1]
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                        {/* Main Logo Container */}
                        <motion.div
                          className="relative bg-white rounded-xl p-2 sm:p-3 shadow-xl border border-gray-100 ring-2 ring-blue-100/50"
                          initial={{ scale: 0, rotate: -10 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            delay: 0.4
                          }}
                        >
                          <img
                            src="/logoNavbar.png"
                            alt="HR-Tek System Logo"
                            className="h-10 w-auto max-w-[120px] sm:h-12 lg:h-14 object-contain"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Animated Brand Name */}
                      <motion.div
                        className="ml-3 sm:ml-4"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.6 }}
                      >
                        <h2 className="text-base sm:text-lg lg:text-xl font-bold tracking-tight leading-none flex items-center gap-1">
                          <span className="text-gray-900">HR-Tek</span>{" "}
                          <span className="text-blue-600 font-black">SYSTEM</span>
                        </h2>
                        <p className="text-[10px] font-bold text-gray-500 tracking-wider uppercase">
                          A Delosch Brand
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Animated Main Heading */}
                  <motion.h1
                    className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 leading-tight text-center lg:text-left"
                    variants={contentVariants}
                  >
                    Welcome to Your{" "}
                    <motion.span
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      style={{ backgroundSize: "200% 200%" }}
                    >
                      HR Transformation Journey
                    </motion.span>
                  </motion.h1>

                  {/* Animated Subheading */}
                  <motion.div
                    className="mb-4 text-center lg:text-left"
                    variants={contentVariants}
                  >
                    <p className="text-sm sm:text-base text-gray-700 font-medium mb-2">
                      You&apos;re in the right place.
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                      Unlock smarter decisions and measurable results. Our platform guides your company through its{" "}
                      <span className="font-semibold text-blue-600">HR maturity journey</span> with precision and expertise.
                    </p>
                  </motion.div>

                  {/* Animated Trust Indicators */}
                  <motion.div
                    className="mb-4"
                    variants={contentVariants}
                  >
                    <motion.div
                      className="bg-white rounded-lg border border-gray-200/60 shadow-sm px-3 py-2"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 sm:gap-3 text-xs text-gray-600">
                        {[
                          { icon: CheckCircleIcon, text: "SOC 2" },
                          { icon: CheckCircleIcon, text: "GDPR" },
                          { icon: CheckCircleIcon, text: "ISO 27001" }
                        ].map((item, index) => (
                          <motion.div
                            key={item.text}
                            className="flex items-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{
                              duration: 0.3,
                              delay: 0.8 + (index * 0.1)
                            }}
                          >
                            <item.icon className="h-3 w-3 text-green-500 mr-1" />
                            <span className="font-medium">{item.text}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Updated CTA Button with Form Submission */}
                  <motion.div
                    className="mb-3"
                    variants={contentVariants}
                  >
                    <form method="post">
                      <motion.button
                        type="submit"
                        className="group relative inline-flex items-center px-6 py-3 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 border border-blue-500/20 overflow-hidden w-full justify-center"
                        whileHover={{
                          scale: 1.05,
                          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
                        }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12"
                          animate={{ x: "-100%" }}
                          whileHover={{ x: "200%" }}
                          transition={{ duration: 0.6 }}
                        />

                        <span className="relative">Begin Your Journey</span>
                        <motion.div
                          className="ml-2"
                          animate={{ x: [0, 4, 0] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        >
                          <ArrowRightIcon className="h-4 w-4 flex-shrink-0" />
                        </motion.div>
                      </motion.button>
                    </form>
                  </motion.div>

                  {/* Animated Bottom Note */}
                  <motion.div
                    className="bg-blue-50/80 border border-blue-200/50 rounded-lg py-2 px-3"
                    variants={contentVariants}
                    whileHover={{ scale: 1.02 }}
                  >
                    <p className="text-xs text-gray-600 text-center lg:text-left">
                      <span className="font-semibold text-blue-700">Personalized:</span> AI recommendations based on your profile
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Right Side - Animated Value Props & Stats */}
              <div className="flex-1 flex flex-col justify-center px-4 py-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50/50 to-slate-50/50 border-t lg:border-t-0 lg:border-l border-gray-200/50">
                <div className="w-full max-w-sm mx-auto">
                  {/* Animated Value Props */}
                  <motion.div
                    className="mb-4"
                    variants={contentVariants}
                  >
                    <motion.h3
                      className="text-sm sm:text-base font-semibold text-gray-900 mb-3 text-center"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                    >
                      Why Companies Choose Us
                    </motion.h3>

                    <div className="space-y-3">
                      {[
                        { icon: ChartBarIcon, title: "AI Insights", desc: "Predictive analytics for workforce optimization", color: "from-blue-500 to-blue-600" },
                        { icon: BoltIcon, title: "Fast Setup", desc: "Minutes to deploy, immediate impact", color: "from-green-500 to-green-600" },
                        { icon: ShieldCheckIcon, title: "Enterprise Security", desc: "Bank-level security and compliance", color: "from-purple-500 to-purple-600" }
                      ].map((item, index) => (
                        <motion.div
                          key={item.title}
                          className="flex items-start space-x-3 p-3 rounded-lg bg-white border border-gray-100 shadow-sm"
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{
                            duration: 0.4,
                            delay: 0.6 + (index * 0.1)
                          }}
                          whileHover={{
                            scale: 1.02,
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
                          }}
                        >
                          <motion.div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r ${item.color} text-white shadow-lg flex-shrink-0`}
                            whileHover={{
                              scale: 1.1,
                              rotate: 5
                            }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            <item.icon className="h-4 w-4" />
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm">{item.title}</h4>
                            <p className="text-xs text-gray-600">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Animated Stats */}
                  <motion.div
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                    variants={contentVariants}
                    whileHover={{ scale: 1.02 }}
                  >
                    <motion.h4
                      className="text-sm font-semibold text-gray-900 mb-3 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.6 }}
                    >
                      Proven Results
                    </motion.h4>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: "2-3 min", label: "Setup", color: "text-blue-600" },
                        { value: "24 hrs", label: "Insights", color: "text-green-600" },
                        { value: "40%", label: "Efficiency", color: "text-purple-600" },
                        { value: "500+", label: "Clients", color: "text-indigo-600" }
                      ].map((stat, index) => (
                        <motion.div
                          key={stat.label}
                          className="text-center"
                          variants={statsVariants}
                          initial="hidden"
                          animate="visible"
                          transition={{
                            duration: 0.4,
                            delay: 0.9 + (index * 0.05)
                          }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <motion.div
                            className={`text-lg font-bold ${stat.color}`}
                            animate={{
                              scale: [1, 1.05, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: index * 0.5
                            }}
                          >
                            {stat.value}
                          </motion.div>
                          <div className="text-xs text-gray-600">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
