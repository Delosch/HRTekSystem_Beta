import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, Check, Shield, Lock, Settings, BarChart, Globe } from "lucide-react";

type CookieCategory = "necessary" | "functional" | "analytics" | "security" | "marketing";

interface CookiePreferences {
    necessary: boolean;
    functional: boolean;
    analytics: boolean;
    security: boolean;
    marketing: boolean;
}

const defaultPreferences: CookiePreferences = {
    necessary: true,
    functional: false,
    analytics: false,
    security: false,
    marketing: false,
};

export default function CookieConsent() {
    const [showBanner, setShowBanner] = useState(false);
    const [showPreferences, setShowPreferences] = useState(false);
    const [preferences, setPreferences] = useState<CookiePreferences>(defaultPreferences);
    const [expandedCategory, setExpandedCategory] = useState<CookieCategory | null>(null);

    useEffect(() => {
        // Handle trigger from Footer or other components
        const handleExternalTrigger = () => {
            setShowPreferences(true);
            setShowBanner(false);
        };
        window.addEventListener("open-cookie-settings", handleExternalTrigger);

        const savedConsent = localStorage.getItem("cookie_consent");
        if (!savedConsent) {
            const timer = setTimeout(() => setShowBanner(true), 1000);
            return () => {
                clearTimeout(timer);
                window.removeEventListener("open-cookie-settings", handleExternalTrigger);
            };
        } else {
            try {
                const parsed = JSON.parse(savedConsent);

                // Migrate old data if keys are missing
                const hasAllKeys = "necessary" in parsed &&
                    "functional" in parsed &&
                    "analytics" in parsed &&
                    "security" in parsed &&
                    "marketing" in parsed;

                const mergedPreferences = {
                    necessary: parsed.necessary ?? true,
                    functional: parsed.functional ?? false,
                    analytics: parsed.analytics ?? false,
                    security: parsed.security ?? (parsed.necessary ?? true),
                    marketing: parsed.marketing ?? false,
                };

                setPreferences(mergedPreferences);

                // Sync with Google Analytics
                updateGAConsent(mergedPreferences);

                // If schema was old, update localStorage to include the marketing key
                if (!hasAllKeys) {
                    localStorage.setItem("cookie_consent", JSON.stringify(mergedPreferences));
                }
            } catch (e) {
                setPreferences(defaultPreferences);
            }
        }

        return () => window.removeEventListener("open-cookie-settings", handleExternalTrigger);
    }, []);

    const updateGAConsent = (prefs: CookiePreferences) => {
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('consent', 'update', {
                'analytics_storage': prefs.analytics ? 'granted' : 'denied',
                'functionality_storage': prefs.functional ? 'granted' : 'denied',
                'ad_storage': prefs.marketing ? 'granted' : 'denied',
                'ad_user_data': prefs.marketing ? 'granted' : 'denied',
                'ad_personalization': prefs.marketing ? 'granted' : 'denied',
                'security_storage': prefs.security ? 'granted' : 'denied',
            });
        }
    };

    const handleAcceptAll = () => {
        const allAccepted: CookiePreferences = {
            necessary: true,
            functional: true,
            analytics: true,
            security: true,
            marketing: true,
        };
        savePreferences(allAccepted);
    };

    const handleRejectAll = () => {
        const allRejected: CookiePreferences = {
            necessary: true,
            functional: false,
            analytics: false,
            security: false,
            marketing: false,
        };
        savePreferences(allRejected);
    };

    const savePreferences = (prefs: CookiePreferences) => {
        localStorage.setItem("cookie_consent", JSON.stringify(prefs));
        setPreferences(prefs);
        updateGAConsent(prefs);
        setShowBanner(false);
        setShowPreferences(false);
    };

    const toggleCategory = (category: CookieCategory) => {
        setExpandedCategory(expandedCategory === category ? null : category);
    };

    const togglePreference = (category: CookieCategory) => {
        if (category === "necessary") return; // Cannot toggle essential
        setPreferences(prev => ({ ...prev, [category]: !prev[category] }));
    };

    if (!showBanner && !showPreferences) return null;

    return (
        <AnimatePresence>
            {showBanner && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
                >
                    <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-6 sm:p-8 md:flex md:items-center md:justify-between gap-6 ring-1 ring-black/5">
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-900 mb-2 font-display">
                                We value your privacy
                            </h2>
                            <p className="text-gray-600 text-sm leading-relaxed max-w-3xl">
                                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic.
                                By clicking "Accept All", you consent to our use of cookies.
                                Read our <Link to="/legal/cookie" className="text-indigo-600 hover:text-indigo-700 font-medium underline decoration-indigo-200 underline-offset-2">Cookie Policy</Link> and <Link to="/legal/privacy" className="text-indigo-600 hover:text-indigo-700 font-medium underline decoration-indigo-200 underline-offset-2">Privacy Policy</Link>.
                            </p>
                        </div>
                        <div className="mt-6 md:mt-0 flex flex-col sm:flex-row gap-3 min-w-fit">
                            <button
                                onClick={() => setShowPreferences(true)}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                            >
                                Customize
                            </button>
                            <button
                                onClick={handleRejectAll}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                            >
                                Reject All
                            </button>
                            <button
                                onClick={handleAcceptAll}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 shadow-lg shadow-gray-900/20 transition-all duration-200 transform hover:translate-y-px"
                            >
                                Accept All
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
            {showPreferences && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Cookie Preferences</h3>
                                <p className="text-sm text-gray-500 mt-1">Manage your cookie settings</p>
                            </div>
                            <button
                                onClick={() => setShowPreferences(false)}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            <p className="text-sm text-gray-600 mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                You can choose which cookies you want to accept. Essential cookies are necessary for the website to function properly and cannot be disabled.
                            </p>
                            {/* Necessary */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div
                                    className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors cursor-pointer"
                                    onClick={() => toggleCategory("necessary")}
                                >
                                    <div className="flex items-center gap-3">
                                        <Shield className="w-5 h-5 text-green-500" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900">Strictly Necessary</span>
                                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Always Active</span>
                                            </div>
                                        </div>
                                    </div>
                                    {expandedCategory === "necessary" ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>
                                <AnimatePresence>
                                    {expandedCategory === "necessary" && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden bg-gray-50 border-t border-gray-100"
                                        >
                                            <div className="p-5 text-sm text-gray-600">
                                                These cookies are essential for the operation of our platform and cannot be disabled. They include user authentication, secure login, session management, and fraud prevention. (Legal Basis: Legitimate Interest / Contractual Necessity)
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Functional */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="w-full px-5 py-4 flex items-center justify-between bg-white">
                                    <div
                                        className="flex-1 flex items-center gap-3 cursor-pointer"
                                        onClick={() => toggleCategory("functional")}
                                    >
                                        <Globe className="w-5 h-5 text-blue-500" />
                                        <span className="font-semibold text-gray-900">Functional Cookies</span>
                                        {expandedCategory === "functional" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <div className="ml-4">
                                        <Toggle
                                            active={preferences.functional}
                                            onChange={() => togglePreference("functional")}
                                        />
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedCategory === "functional" && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden bg-gray-50 border-t border-gray-100"
                                        >
                                            <div className="p-5 text-sm text-gray-600">
                                                These cookies enable enhanced functionality and personalization, such as remembering your preferences, language, or region settings. (Legal Basis: User Consent)
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Analytics */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="w-full px-5 py-4 flex items-center justify-between bg-white">
                                    <div
                                        className="flex-1 flex items-center gap-3 cursor-pointer"
                                        onClick={() => toggleCategory("analytics")}
                                    >
                                        <BarChart className="w-5 h-5 text-purple-500" />
                                        <span className="font-semibold text-gray-900">Analytics & Performance</span>
                                        {expandedCategory === "analytics" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <div className="ml-4">
                                        <Toggle
                                            active={preferences.analytics}
                                            onChange={() => togglePreference("analytics")}
                                        />
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedCategory === "analytics" && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden bg-gray-50 border-t border-gray-100"
                                        >
                                            <div className="p-5 text-sm text-gray-600">
                                                These cookies help us understand how users interact with the platform, monitor traffic, and improve performance. Data is aggregated and anonymized. (Legal Basis: User Consent)
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Security */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="w-full px-5 py-4 flex items-center justify-between bg-white">
                                    <div
                                        className="flex-1 flex items-center gap-3 cursor-pointer"
                                        onClick={() => toggleCategory("security")}
                                    >
                                        <Lock className="w-5 h-5 text-orange-500" />
                                        <span className="font-semibold text-gray-900">Security & Compliance</span>
                                        {expandedCategory === "security" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <div className="ml-4">
                                        <Toggle
                                            active={preferences.security}
                                            onChange={() => togglePreference("security")}
                                        />
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedCategory === "security" && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden bg-gray-50 border-t border-gray-100"
                                        >
                                            <div className="p-5 text-sm text-gray-600">
                                                These cookies help protect the platform, detect suspicious activity, and ensure compliance. (Legal Basis: Legitimate Interest)
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                            {/* Marketing */}
                            <div className="border border-gray-200 rounded-xl overflow-hidden">
                                <div className="w-full px-5 py-4 flex items-center justify-between bg-white">
                                    <div
                                        className="flex-1 flex items-center gap-3 cursor-pointer"
                                        onClick={() => toggleCategory("marketing")}
                                    >
                                        <Settings className="w-5 h-5 text-gray-500" />
                                        <span className="font-semibold text-gray-900">Marketing & Tracking</span>
                                        {expandedCategory === "marketing" ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                                    </div>
                                    <div className="ml-4">
                                        <Toggle
                                            active={preferences.marketing}
                                            onChange={() => togglePreference("marketing")}
                                        />
                                    </div>
                                </div>
                                <AnimatePresence>
                                    {expandedCategory === "marketing" && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: "auto" }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden bg-gray-50 border-t border-gray-100"
                                        >
                                            <div className="p-5 text-sm text-gray-600">
                                                Currently, HR-Tek System does NOT use marketing, advertising, or cross-site tracking cookies. If such cookies are introduced in the future, explicit opt-in consent will be obtained.
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        {/* Footer */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                            <button
                                onClick={handleRejectAll}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                                Reject All
                            </button>
                            <button
                                onClick={() => savePreferences(preferences)}
                                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20"
                            >
                                Save Preferences
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function Toggle({ active, onChange }: { active: boolean; onChange: () => void }) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onChange(); }}
            className={`w-12 h-7 rounded-full transition-colors duration-200 flex items-center px-1 ${active ? "bg-indigo-600" : "bg-gray-200"
                }`}
        >
            <motion.div
                layout
                className="w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: active ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
        </button>
    );
}
