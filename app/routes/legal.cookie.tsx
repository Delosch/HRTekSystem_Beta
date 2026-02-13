// app/routes/legal.cookie.tsx

import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';

export const meta: MetaFunction = () => {
    return [{ title: "Cookie Policy | HRTek System" }];
};

// --- Data for the Cookie Policy Page ---
const policySections = [
    { id: "what-are-cookies", title: "1. What Are Cookies?" },
    { id: "legal-framework", title: "2. Legal Framework" },
    { id: "types-of-cookies", title: "3. Types of Cookies We Use" },
    { id: "third-party", title: "4. Third-Party Cookies" },
    { id: "management", title: "5. Cookie Consent Management" },
    { id: "browser-control", title: "6. How to Control Cookies via Browser" },
    { id: "data-collected", title: "7. Data Collected via Cookies" },
    { id: "retention", title: "8. Data Retention" },
    { id: "transfers", title: "9. International Data Transfers" },
    { id: "updates", title: "10. Updates to This Cookie Policy" },
    { id: "contact", title: "11. Contact Information" },
];

export default function CookiePolicyPage() {
    const [activeId, setActiveId] = useState("what-are-cookies");

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -70% 0px" }
        );

        policySections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            policySections.forEach(({ id }) => {
                const element = document.getElementById(id);
                if (element) {
                    observer.unobserve(element);
                }
            });
        };
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link to="/" className="flex items-center gap-2">
                        <img src="/logo_icon_final.png" alt="HRTek System" className="w-8 h-8 object-contain" />
                        <span className="font-semibold text-lg text-gray-800">HRTek System</span>
                    </Link>
                    <Link to="/auth" className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center gap-1">
                        Go to App <ArrowUpRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Cookie Policy</h1>
                    <p className="mt-2 text-lg text-gray-600">HR-Tek System</p>
                    <p className="mt-1 text-sm text-gray-500 font-medium uppercase tracking-wider">Last Updated: November 2025</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="md:col-span-1 md:sticky top-24 self-start">
                        <nav className="space-y-1">
                            {policySections.map(({ id, title }) => (
                                <button
                                    key={id}
                                    onClick={() => {
                                        const el = document.getElementById(id);
                                        if (el) {
                                            el.scrollIntoView({ behavior: "smooth", block: "start" });

                                            // update URL without creating history entry
                                            window.history.replaceState(null, "", `#${id}`);
                                        }
                                    }}
                                    className={`w-full text-left block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${activeId === id
                                            ? 'bg-green-100 text-green-800'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {title}
                                </button>
                            ))}

                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="md:col-span-3 space-y-12">
                        <section className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                            <p>This Cookie Policy explains how HR-Tek System, operated natively (“Company”, “we”, “us”), uses cookies and similar technologies on its website, web applications, and digital platforms in compliance with the EU General Data Protection Regulation (GDPR) and the ePrivacy Directive (Directive 2002/58/EC).</p>
                            <p className="mt-4">This Policy should be read in conjunction with our Privacy Policy and GDPR Compliance Policy.</p>
                        </section>

                        <PolicySection id="what-are-cookies" title="1. What Are Cookies?">
                            <p>Cookies are small text files that are placed on your device (computer, tablet, mobile phone) when you visit a website. They are widely used to make websites function properly, enhance user experience, enable security features, and provide analytical insights.</p>
                            <p className="mt-4">Cookies may be:</p>
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-sm">
                                    <strong className="text-gray-900 block mb-1">Session Cookies</strong>
                                    deleted when you close your browser
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-sm">
                                    <strong className="text-gray-900 block mb-1">Persistent Cookies</strong>
                                    stored for a defined period
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-sm">
                                    <strong className="text-gray-900 block mb-1">First-Party Cookies</strong>
                                    set by HR-Tek System
                                </div>
                                <div className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-sm">
                                    <strong className="text-gray-900 block mb-1">Third-Party Cookies</strong>
                                    set by external service providers
                                </div>
                            </div>
                        </PolicySection>

                        <PolicySection id="legal-framework" title="2. Legal Framework">
                            <p>We use cookies in accordance with:</p>
                            <ul className="list-disc pl-5 mt-4 space-y-2">
                                <li>GDPR (Regulation EU 2016/679)</li>
                                <li>ePrivacy Directive (EU Cookie Law)</li>
                                <li>Applicable national data protection laws</li>
                            </ul>
                            <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 text-green-800 text-sm">
                                <p><strong>Under these laws:</strong></p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>Strictly necessary cookies do not require consent</li>
                                    <li>All other cookies require prior, explicit user consent</li>
                                </ul>
                            </div>
                        </PolicySection>

                        <PolicySection id="types-of-cookies" title="3. Types of Cookies We Use">
                            <div className="space-y-8">
                                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs">3.1</span>
                                        Strictly Necessary Cookies (Always Active)
                                    </h4>
                                    <p className="text-sm mb-4">These cookies are essential for the operation of our platform and cannot be disabled.</p>
                                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                        <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-widest mb-2">Purpose</h5>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                User authentication and secure login
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                Session management
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                Security and fraud prevention
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                                Load balancing and system stability
                                            </li>
                                        </ul>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">Legal Basis: Legitimate Interest / Contractual Necessity</p>
                                </div>

                                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3.2</span>
                                        Functional Cookies
                                    </h4>
                                    <p className="text-sm mb-4">These cookies enable enhanced functionality and personalization.</p>
                                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                        <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-widest mb-2">Purpose</h5>
                                        <ul className="list-disc pl-5 text-sm text-gray-600">
                                            <li>Remembering user preferences</li>
                                            <li>Language or region settings</li>
                                            <li>Platform configuration choices</li>
                                        </ul>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">Legal Basis: User Consent</p>
                                </div>

                                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">3.3</span>
                                        Analytics & Performance Cookies
                                    </h4>
                                    <p className="text-sm mb-4">These cookies help us understand how users interact with the platform.</p>
                                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                        <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-widest mb-2">Purpose</h5>
                                        <ul className="list-disc pl-5 text-sm text-gray-600">
                                            <li>Monitor traffic and usage patterns</li>
                                            <li>Improve platform performance and UX</li>
                                            <li>Identify errors and optimize features</li>
                                        </ul>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                        <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-widest mb-2">Data Collected</h5>
                                        <ul className="list-disc pl-5 text-sm text-gray-600">
                                            <li>Pages visited</li>
                                            <li>Time spent on features</li>
                                            <li>Navigation paths</li>
                                            <li>Device and browser metadata</li>
                                        </ul>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">Legal Basis: User Consent. Analytics data is aggregated and anonymized wherever possible.</p>
                                </div>

                                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">3.4</span>
                                        Security & Compliance Cookies
                                    </h4>
                                    <p className="text-sm mb-4">These cookies help protect the platform and ensure compliance.</p>
                                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                        <h5 className="font-semibold text-gray-900 text-xs uppercase tracking-widest mb-2">Purpose</h5>
                                        <ul className="list-disc pl-5 text-sm text-gray-600">
                                            <li>Detect suspicious activity</li>
                                            <li>Prevent unauthorized access</li>
                                            <li>Enforce access controls</li>
                                        </ul>
                                    </div>
                                    <p className="text-xs text-gray-400 italic">Legal Basis: Legitimate Interest</p>
                                </div>

                                <div className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                    <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
                                        <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs">3.5</span>
                                        Marketing & Tracking Cookies
                                    </h4>
                                    <p className="font-semibold text-gray-700 mb-2">Currently, HR-Tek System does NOT use marketing, advertising, or cross-site tracking cookies.</p>
                                    <p className="text-sm">If such cookies are introduced in the future:</p>
                                    <ul className="list-disc pl-5 mt-2 text-sm text-gray-600">
                                        <li>Explicit opt-in consent will be obtained</li>
                                        <li>This Policy will be updated accordingly</li>
                                    </ul>
                                </div>
                            </div>
                        </PolicySection>

                        <PolicySection id="third-party" title="4. Third-Party Cookies">
                            <p>We may use GDPR-compliant third-party tools for:</p>
                            <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
                                <li>Cloud hosting</li>
                                <li>Performance monitoring</li>
                                <li>Security analytics</li>
                            </ul>
                            <p>Third-party providers may set cookies subject to their own policies.</p>
                            <p className="mt-2">All such providers are vetted and bound by data protection agreements. A list of third-party processors is available upon request.</p>
                        </PolicySection>

                        <PolicySection id="management" title="5. Cookie Consent Management">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">5.1 Consent Banner</h4>
                                    <p className="text-sm">Upon first visit, users are presented with a cookie banner that allows them to:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                        <li>Accept all cookies</li>
                                        <li>Reject non-essential cookies</li>
                                        <li>Customize cookie preferences</li>
                                    </ul>
                                    <p className="text-sm mt-2">No non-essential cookies are placed before consent is given.</p>
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 mb-2">5.2 Managing or Withdrawing Consent</h4>
                                    <p className="text-sm">Users may:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                        <li>Modify cookie preferences at any time</li>
                                        <li>Withdraw consent without affecting essential services</li>
                                    </ul>
                                    <p className="text-sm mt-2">Cookie settings can be accessed via:</p>
                                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                                        <li>Cookie banner settings</li>
                                        <li>Browser configuration</li>
                                    </ul>
                                </div>
                            </div>
                        </PolicySection>

                        <PolicySection id="browser-control" title="6. How to Control Cookies via Browser">
                            <p>Users may control or delete cookies through browser settings:</p>
                            <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
                                <li>Chrome</li>
                                <li>Firefox</li>
                                <li>Safari</li>
                                <li>Edge</li>
                            </ul>
                            <p>Disabling cookies may limit certain features or functionalities of the platform.</p>
                        </PolicySection>

                        <PolicySection id="data-collected" title="7. Data Collected via Cookies">
                            <p>Cookies may collect:</p>
                            <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
                                <li>IP address (anonymized where possible)</li>
                                <li>Device and browser type</li>
                                <li>Session identifiers</li>
                                <li>Platform interaction data</li>
                            </ul>
                            <p>No cookie data is used to:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Identify individuals directly</li>
                                <li>Make automated decisions with legal or significant effect</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="retention" title="8. Data Retention">
                            <ul className="list-disc pl-5 space-y-1 text-sm">
                                <li>Session cookies expire automatically</li>
                                <li>Persistent cookies are retained only for defined durations</li>
                                <li>Analytics cookies have limited retention periods</li>
                                <li>Cookie data is deleted when no longer required</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="transfers" title="9. International Data Transfers">
                            <p>If cookie-related data is processed outside the EEA:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Appropriate safeguards (SCCs) are applied</li>
                                <li>Data is encrypted and access-controlled</li>
                                <li>GDPR-equivalent protection is ensured</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="updates" title="10. Updates to This Cookie Policy">
                            <p>This Policy may be updated due to:</p>
                            <ul className="list-disc pl-5 mt-2 mb-4 space-y-1">
                                <li>Legal or regulatory changes</li>
                                <li>Introduction of new technologies</li>
                                <li>Platform enhancements</li>
                            </ul>
                            <p>Changes will be reflected in the “Last Updated” date.</p>
                        </PolicySection>

                        <PolicySection id="contact" title="11. Contact Information">
                            <p>For questions regarding cookies or data protection:</p>
                            <address className="mt-6 not-italic bg-gray-100 p-6 rounded-2xl border border-gray-200">
                                <strong className="text-gray-900 block mb-2 font-display text-lg">HR-Tek System</strong>
                                <div className="space-y-1 text-gray-600">
                                    <p className="flex items-center gap-2">
                                        <span className="font-semibold w-16">Email:</span>
                                        <a href="mailto:support@hrteksystem.com" className="text-green-600 hover:text-green-700 hover:underline">support@hrteksystem.com</a>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="font-semibold w-16">Phone:</span>
                                        <span>+91-9335870619</span>
                                    </p>
                                </div>
                            </address>
                        </PolicySection>
                    </div>
                </div>
            </main>
        </div>
    );
}

// --- Helper Component for Sections ---
function PolicySection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
    return (
        <section id={id} className="scroll-mt-24">
            <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-6">{title}</h2>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                {children}
            </div>
        </section>
    );
}
