// app/routes/legal.gdpr.tsx

import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';

export const meta: MetaFunction = () => {
    return [{ title: "GDPR Compliance Policy | HRTek Systems" }];
};

// --- Data for the GDPR Policy Page ---
const gdprSections = [
    { id: "purpose", title: "1. Purpose & Scope" },
    { id: "definitions", title: "2. Definitions (GDPR-Aligned)" },
    { id: "role", title: "3. Role Under GDPR" },
    { id: "lawful-basis", title: "4. Lawful Basis for Processing" },
    { id: "principles", title: "5. GDPR Principles We Follow" },
    { id: "categories", title: "6. Categories of Personal Data Processed" },
    { id: "design-default", title: "7. Data Protection by Design & by Default" },
    { id: "security", title: "8. Data Security Measures" },
    { id: "rights", title: "9. Data Subject Rights" },
    { id: "dsr-process", title: "10. Data Subject Request (DSR) Process" },
    { id: "retention", title: "11. Data Retention & Deletion" },
    { id: "sub-processors", title: "12. Sub-Processors & Third Parties" },
    { id: "transfers", title: "13. International Data Transfers" },
    { id: "breach-management", title: "14. Personal Data Breach Management" },
    { id: "ai-analytics", title: "15. AI, Analytics & Automated Processing" },
    { id: "training", title: "16. Training & Awareness" },
    { id: "review", title: "17. Policy Review & Accountability" },
    { id: "supervisory", title: "18. Supervisory Authority & Complaints" },
    { id: "contact", title: "19. Contact Details" },
];

export default function GDPRPolicyPage() {
    const [activeId, setActiveId] = useState("purpose");

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

        gdprSections.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            gdprSections.forEach(({ id }) => {
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
                        <svg className="w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M12 21a9 9 0 1 0 0 -18a9 9 0 0 0 0 18z" /><path d="M12 3v2" /><path d="M3 12h2" /><path d="M12 19v2" /><path d="M21 12h-2" /></svg>
                        <span className="font-semibold text-lg text-gray-800">HRTek Systems</span>
                    </Link>
                    <Link to="/auth" className="text-sm font-medium text-green-600 hover:text-green-800 flex items-center gap-1">
                        Go to App <ArrowUpRightIcon className="w-4 h-4" />
                    </Link>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">GDPR Compliance Policy</h1>
                    <p className="mt-2 text-lg text-gray-600">HR-Tek System</p>
                    <p className="mt-1 text-sm text-gray-500 font-medium uppercase tracking-wider">Last Updated: November 2025</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <aside className="md:col-span-1 md:sticky top-24 self-start">
                        <nav className="space-y-1">
                            {gdprSections.map(({ id, title }) => (
                                <a
                                    key={id}
                                    href={`#${id}`}
                                    className={`block px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${activeId === id
                                        ? 'bg-green-100 text-green-800'
                                        : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    {title}
                                </a>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <div className="md:col-span-3 space-y-12">
                        <section className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                            <p>This GDPR Compliance Policy describes how HR-Tek System, operated as a standalone platform (“Company”, “we”, “us”), complies with the EU General Data Protection Regulation (GDPR) – Regulation (EU) 2016/679 when processing personal data of individuals located in the European Economic Area (EEA).</p>
                            <p className="mt-4">This Policy supplements our Privacy Policy, Terms & Conditions, and Internal Data Security Protocols.</p>
                        </section>

                        <PolicySection id="purpose" title="1. Purpose & Scope">
                            <p>The purpose of this Policy is to:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Define our approach to lawful, fair, and transparent data processing</li>
                                <li>Explain how personal data is collected, used, protected, and retained</li>
                                <li>Outline the rights of data subjects under GDPR</li>
                                <li>Demonstrate compliance with GDPR Articles 5, 6, 24, 25, 30, and 32</li>
                            </ul>
                            <p className="mt-4">This Policy applies to:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>All personal data processed through HR-Tek System</li>
                                <li>All employees, contractors, interns, and third parties</li>
                                <li>All EU/EEA data subjects whose data is processed through our platform</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="definitions" title="2. Definitions (GDPR-Aligned)">
                            <ul className="list-disc pl-5 mt-2 space-y-2">
                                <li><strong className="text-gray-900">Personal Data:</strong> Any information relating to an identified or identifiable natural person</li>
                                <li><strong className="text-gray-900">Data Subject:</strong> An individual whose personal data is processed</li>
                                <li><strong className="text-gray-900">Controller:</strong> Entity that determines the purpose and means of processing</li>
                                <li><strong className="text-gray-900">Processor:</strong> Entity that processes data on behalf of the Controller</li>
                                <li><strong className="text-gray-900">Processing:</strong> Any operation performed on personal data</li>
                                <li><strong className="text-gray-900">PII:</strong> Personally Identifiable Information</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="role" title="3. Role Under GDPR">
                            <p>Depending on the service context:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Clients are typically the Data Controllers</li>
                                <li>HR-Tek System acts as a Data Processor</li>
                                <li>In limited operational cases (e.g., website inquiries), HR-Tek System may act as a Data Controller</li>
                            </ul>
                            <p className="mt-4">All processing is governed by contractual agreements and documented instructions.</p>
                        </PolicySection>

                        <PolicySection id="lawful-basis" title="4. Lawful Basis for Processing (Article 6)">
                            <p>We process personal data only when a lawful basis exists:</p>
                            <ul className="list-decimal pl-5 mt-2 space-y-1">
                                <li><strong className="text-gray-900">Consent</strong> – freely given, informed, and revocable</li>
                                <li><strong className="text-gray-900">Contractual Necessity</strong> – to deliver subscribed services</li>
                                <li><strong className="text-gray-900">Legal Obligation</strong> – regulatory or statutory compliance</li>
                                <li><strong className="text-gray-900">Legitimate Interest</strong> – platform security, analytics, improvement (without overriding rights)</li>
                            </ul>
                            <p className="mt-4">Sensitive data is processed only where explicitly permitted by law.</p>
                        </PolicySection>

                        <PolicySection id="principles" title="5. GDPR Principles We Follow (Article 5)">
                            <p>We adhere to the following principles:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Lawfulness, Fairness & Transparency</li>
                                <li>Purpose Limitation – data used only for defined purposes</li>
                                <li>Data Minimization – only necessary data collected</li>
                                <li>Accuracy – reasonable steps to keep data updated</li>
                                <li>Storage Limitation – retained only as long as required</li>
                                <li>Integrity & Confidentiality – secured against unauthorized access</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="categories" title="6. Categories of Personal Data Processed">
                            <p>Depending on usage, we may process:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Identification data (name, email, phone number)</li>
                                <li>Professional data (designation, company details)</li>
                                <li>Login and authentication data</li>
                                <li>HR assessment inputs linked to users</li>
                                <li>Communication records (support tickets, emails)</li>
                                <li>Technical data (IP address, logs, device info)</li>
                            </ul>
                            <p className="mt-4">We do not intentionally process special category data unless contractually required and legally permitted.</p>
                        </PolicySection>

                        <PolicySection id="design-default" title="7. Data Protection by Design & by Default (Article 25)">
                            <p>We implement privacy controls at every stage:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Secure default settings</li>
                                <li>Role-based access controls (RBAC)</li>
                                <li>Encrypted storage and transmission</li>
                                <li>Minimal data exposure</li>
                                <li>Controlled AI model usage with anonymization</li>
                            </ul>
                            <p className="mt-4">Privacy considerations are embedded into system architecture.</p>
                        </PolicySection>

                        <PolicySection id="security" title="8. Data Security Measures (Article 32)">
                            <p>We apply appropriate technical and organizational measures, including:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>AES-256 encryption (data at rest)</li>
                                <li>TLS/HTTPS encryption (data in transit)</li>
                                <li>MFA and strong authentication</li>
                                <li>Continuous monitoring and audit logs</li>
                                <li>Secure cloud infrastructure</li>
                                <li>Incident response and breach management procedures</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="rights" title="9. Data Subject Rights (Articles 12–23)">
                            <p>EEA data subjects have the right to:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Access their personal data</li>
                                <li>Rectification of inaccurate data</li>
                                <li>Erasure (“Right to be Forgotten”)</li>
                                <li>Restriction of processing</li>
                                <li>Data Portability</li>
                                <li>Objection to processing</li>
                                <li>Withdraw Consent at any time</li>
                            </ul>
                            <p className="mt-4">Requests are handled within 30 days, unless extended lawfully.</p>
                        </PolicySection>

                        <PolicySection id="dsr-process" title="10. Data Subject Request (DSR) Process">
                            <p>To submit a GDPR request, data subjects may contact us with:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Proof of identity</li>
                                <li>Description of the request</li>
                            </ul>
                            <p className="mt-4">Requests can be sent to:</p>
                            <a href="mailto:support@hrteksystem.com" className="text-green-600 hover:text-green-700 hover:underline font-bold block mt-2">support@hrteksystem.com (recommended GDPR mailbox)</a>
                        </PolicySection>

                        <PolicySection id="retention" title="11. Data Retention & Deletion">
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Data is retained only for contractual, legal, or operational necessity</li>
                                <li>Upon contract termination, data is deleted or anonymized</li>
                                <li>Secure deletion and archival procedures are followed</li>
                                <li>Retention schedules are documented internally</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="sub-processors" title="12. Sub-Processors & Third Parties">
                            <p>We may engage vetted sub-processors such as:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Cloud infrastructure providers</li>
                                <li>Analytics tools</li>
                                <li>Communication services</li>
                            </ul>
                            <p className="mt-4">All sub-processors:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Are GDPR-compliant</li>
                                <li>Are bound by Data Processing Agreements</li>
                                <li>Follow equivalent security standards</li>
                            </ul>
                            <p className="mt-4">A list of sub-processors is available upon request.</p>
                        </PolicySection>

                        <PolicySection id="transfers" title="13. International Data Transfers (Chapter V)">
                            <p>If personal data is transferred outside the EEA:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>Standard Contractual Clauses (SCCs) are applied</li>
                                <li>Transfers are encrypted and access-controlled</li>
                                <li>Equivalent data protection safeguards are ensured</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="breach-management" title="14. Personal Data Breach Management (Articles 33 & 34)">
                            <p>In case of a personal data breach:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>We assess impact immediately</li>
                                <li>Notify the Data Controller without undue delay</li>
                                <li>Support regulatory notification within 72 hours (if required)</li>
                                <li>Maintain breach registers and corrective actions</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="ai-analytics" title="15. AI, Analytics & Automated Processing">
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>No automated decisions with legal or significant effect are made without human oversight</li>
                                <li>AI models use anonymized and aggregated datasets</li>
                                <li>No client data is reused across organizations</li>
                                <li>AI outputs are advisory, not deterministic</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="training" title="16. Training & Awareness">
                            <p>All employees and contractors receive:</p>
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>GDPR awareness training</li>
                                <li>Data protection and confidentiality training</li>
                                <li>Secure handling guidelines</li>
                            </ul>
                            <p className="mt-4">Compliance is mandatory and monitored.</p>
                        </PolicySection>

                        <PolicySection id="review" title="17. Policy Review & Accountability">
                            <ul className="list-disc pl-5 mt-2 space-y-1">
                                <li>GDPR compliance is reviewed annually</li>
                                <li>Internal audits are conducted periodically</li>
                                <li>Documentation is maintained as per Article 30 (RoPA)</li>
                            </ul>
                        </PolicySection>

                        <PolicySection id="supervisory" title="18. Supervisory Authority & Complaints">
                            <p>Data subjects have the right to lodge a complaint with their local Data Protection Authority (DPA) if they believe their rights have been violated.</p>
                        </PolicySection>

                        <PolicySection id="contact" title="19. Contact Details (GDPR & Privacy)">
                            <address className="mt-6 not-italic bg-gray-100 p-6 rounded-2xl border border-gray-200">
                                <strong className="text-gray-900 block mb-2 font-display text-lg">HR-Tek System</strong>
                                <div className="space-y-1 text-gray-600">
                                    <p className="flex items-center gap-2">
                                        <span className="font-semibold w-16">Email:</span>
                                        <a href="mailto:support@hrteksystem.com" className="text-green-600 hover:text-green-700 hover:underline">support@hrteksystem.com</a>
                                    </p>
                                    <p className="flex items-center gap-2">
                                        <span className="font-semibold w-16">Phone:</span>
                                        <span>+91-9335870619 : 0522-3195392</span>
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
