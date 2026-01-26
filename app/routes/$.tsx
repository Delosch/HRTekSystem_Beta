import { Link, useRouteError, isRouteErrorResponse } from "@remix-run/react";
import { MetaFunction } from "@remix-run/node";
import { motion } from "framer-motion";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "~/components/Footer";

export const meta: MetaFunction = () => {
    return [
        { title: "404 - Page Not Found | HRTek System" },
        { name: "description", content: "The page you are looking for does not exist in the HRTek System ecosystem." },
    ];
};

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col bg-white overflow-hidden font-sans">
            <Navbar />

            <main className="flex-grow flex items-center justify-center relative py-20 px-4">
                {/* Premium Background Effects */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {/* Brand-colored glowing orbs */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            x: [0, 100, 0],
                            y: [0, 50, 0],
                        }}
                        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-[#00B5E2]/10 rounded-full blur-[120px]"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            x: [0, -80, 0],
                            y: [0, -60, 0],
                        }}
                        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-[#000033]/5 rounded-full blur-[140px]"
                    />

                    {/* Subtle Grid Pattern */}
                    <div className="absolute inset-0 opacity-[0.03]"
                        style={{
                            backgroundImage: `radial-gradient(#00C2FF 1px, transparent 1px)`,
                            backgroundSize: '40px 40px'
                        }}
                    />
                </div>

                <div className="max-w-5xl w-full text-center relative z-10 px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
                    >
                        {/* The 404 Visual */}
                        <div className="relative inline-block mb-8">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.08 }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className="text-[14rem] md:text-[22rem] font-black text-[#000033] leading-none select-none tracking-tighter"
                            >
                                404
                            </motion.div>

                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div
                                    animate={{
                                        y: [0, -10, 0],
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="relative"
                                >
                                    <h1 className="text-8xl md:text-[12rem] font-black text-[#000033] tracking-tight flex items-baseline gap-1">
                                        4
                                        <span className="text-[#00B5E2] inline-block -rotate-12 animate-pulse">0</span>
                                        4
                                    </h1>
                                    {/* Glowing line under 404 */}
                                    <motion.div
                                        initial={{ scaleX: 0 }}
                                        animate={{ scaleX: 1 }}
                                        transition={{ delay: 1, duration: 1.5, ease: "circOut" }}
                                        className="h-1.5 w-full bg-gradient-to-r from-transparent via-[#00B5E2] to-transparent mt-[-10px] md:mt-[-20px] rounded-full blur-[1px]"
                                    />
                                </motion.div>
                            </div>
                        </div>

                        {/* Message */}
                        <div className="max-w-2xl mx-auto space-y-6">
                            <motion.h2
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                                className="text-4xl md:text-5xl font-bold text-[#000033] tracking-tight"
                            >
                                Page Not Found
                            </motion.h2>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="text-lg md:text-xl text-gray-500 font-medium leading-relaxed"
                            >
                                The link you followed might be broken, or the page may have been moved.
                                Either way, let's get you back to the right path within the
                                <span className="text-[#00B5E2] font-semibold"> HR-Tek System</span>.
                            </motion.p>
                        </div>

                        {/* Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7, duration: 0.8 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-12"
                        >
                            <Link
                                to="/"
                                className="group relative w-full sm:w-auto px-10 py-5 bg-[#000033] text-white font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,51,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(0,0,51,0.4)] transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-[#00B5E2] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <span className="relative z-10 flex items-center gap-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Return Home
                                </span>
                            </Link>

                            <Link
                                to="/contact"
                                className="w-full sm:w-auto px-10 py-5 bg-white text-[#000033] border-2 border-[#000033]/10 font-bold rounded-2xl hover:bg-gray-50 hover:border-[#000033] shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-3"
                            >
                                <svg className="w-6 h-6 text-[#00B5E2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                                Support Center
                            </Link>
                        </motion.div>
                    </motion.div>
                </div>
            </main>

            <Footer />
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();
    const is404 = isRouteErrorResponse(error) && error.status === 404;

    return (
        <div className="min-h-screen flex flex-col bg-white overflow-hidden font-sans">
            <Navbar />
            <main className="flex-grow flex items-center justify-center relative py-20 px-4 text-center">
                <div className="max-w-4xl w-full relative z-10">
                    <h1 className="text-9xl font-black text-[#000033] mb-8">
                        {isRouteErrorResponse(error) ? error.status : "Error"}
                    </h1>
                    <h2 className="text-3xl font-bold text-gray-900 mb-6">
                        {is404 ? "Page Not Found" : "An unexpected error occurred"}
                    </h2>
                    <p className="text-xl text-gray-600 mb-10 max-w-lg mx-auto">
                        {is404
                            ? "We couldn't find the page you were looking for."
                            : "Something went wrong on our end. We're working to fix it."}
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 bg-[#000033] text-white font-bold px-10 py-5 rounded-2xl shadow-xl hover:bg-[#00B5E2] transition-all duration-300"
                    >
                        Back to Home
                    </Link>
                </div>
            </main>
            <Footer />
        </div>
    );
}
