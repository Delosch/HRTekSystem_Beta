// app/routes/legal.privacy.tsx

import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';

export const meta: MetaFunction = () => {
  return [{ title: "Privacy Policy | HRTek System" }];
};

// --- Data for the Privacy Policy Page ---
const policySections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "collection", title: "2. Information We Collect" },
  { id: "purpose", title: "3. Purpose of Data Processing" },
  { id: "legal-basis", title: "4. Legal Basis for Processing" },
  { id: "security", title: "5. Data Protection, Security & Retention" },
  { id: "sharing", title: "6. Data Sharing and Disclosure" },
  { id: "cookies", title: "7. Cookies & Tracking Technologies" },
  { id: "ai-governance", title: "8. Data Processing in HR Co-Pilot & Cognitive Intelligence Systems" },
  { id: "transfers", title: "9. International Data Transfers" },
  { id: "rights", title: "10. User Rights" },
  { id: "children", title: "11. Children's Data" },
  { id: "external-links", title: "12. Links to External Websites" },
  { id: "updates", title: "13. Updates to This Privacy Policy" },
  { id: "contact", title: "14. Contact Information" },
];

export default function PrivacyPolicyPage() {
  const [activeId, setActiveId] = useState("introduction");

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
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-lg text-gray-600">HR-Tek System</p>
          <p className="mt-1 text-sm text-gray-500 font-medium uppercase tracking-wider">Last Updated: November 2025</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 md:sticky top-24 self-start">
            <nav className="space-y-1">
              {policySections.map(({ id, title }) => (
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
              <p>This Privacy Policy sets out in detail how we collect, use, disclose, store, and protect personal and organizational information when users access our website, platform, HR Digital Advisory systems, Cognitive Intelligence Models, and HR Co-Pilot solutions.</p>
              <p>We are committed to maintaining the highest standards of data security, confidentiality, and responsible data governance.</p>
            </section>

            <PolicySection id="introduction" title="1. Introduction">
              <p>This Privacy Policy explains the nature of data processed through our HR Tech ecosystem, including diagnostic frameworks, AI-driven advisory engines, and digital transformation tools.</p>
              <p className="mt-4">By accessing or using our services, you acknowledge that you have read and understood this Privacy Policy and agree to the data practices it describes.</p>
            </PolicySection>

            <PolicySection id="collection" title="2. Information We Collect">
              <p>We collect various forms of information to deliver insights, enhance platform performance, and provide intelligent HR advisory capabilities.</p>
              <div className="mt-8 space-y-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">A</span>
                    Information Provided by Users
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">1. Personal Information</h5>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Name, email, phone number</li>
                        <li>Role, designation, and professional identity</li>
                        <li>Account registration details</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">2. Organizational Information</h5>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Company name and demographic details</li>
                        <li>HR workflows, policies, or uploaded process documents</li>
                        <li>Digital maturity inputs and HR function-related data</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">3. Assessment & Diagnostic Inputs</h5>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Answers to HR digital maturity assessments</li>
                        <li>Data submitted in the Roadmap Generator, Vendor Fit Engine, and AI Co-Pilot</li>
                        <li>Operational metrics and strategic preferences</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-800 text-sm uppercase tracking-wide mb-2">4. Communication and Support Data</h5>
                      <ul className="list-disc pl-5 text-sm space-y-1">
                        <li>Queries, support messages, and feedback forms</li>
                        <li>Meeting notes or correspondence shared voluntarily</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">B</span>
                    Information Collected Automatically
                  </h4>
                  <p className="mb-2 text-sm text-gray-700">When users interact with our platform, we collect:</p>
                  <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                    <li>IP address, log history, and approximate location</li>
                    <li>Browser type, device information, OS, and session identifiers</li>
                    <li>Cookies and tracking data</li>
                    <li>Behavioural patterns (navigation, clicks, time spent, feature usage)</li>
                    <li>System logs, error reports, and performance metrics</li>
                  </ul>
                </div>

                <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
                  <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-green-200 text-green-800 flex items-center justify-center text-xs">C</span>
                    HR & Workforce Data (For Advisory and AI Models)
                  </h4>
                  <p className="text-sm text-green-800 mb-4">Depending on usage, the platform may process:</p>
                  <ul className="list-disc pl-5 text-sm text-green-800 space-y-2">
                    <li>Workforce size, HR operations, and performance indicators</li>
                    <li>Technology stack, HRIS/HCM ecosystem, integration status</li>
                    <li>Gap assessments, improvement recommendations, and benchmarking data</li>
                  </ul>
                  <p className="mt-4 font-semibold text-green-900 text-sm">All HR data is treated with strict confidentiality and used solely to generate customized insights.</p>
                </div>
              </div>
            </PolicySection>

            <PolicySection id="purpose" title="3. Purpose of Data Processing">
              <p>We process data in order to deliver a secure, accurate, and personalized HR Digital Advisory experience.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-gray-100 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">A. To Deliver and Enhance Services</h5>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    <li>Generate HR maturity scores, digital audits, and advisory outputs</li>
                    <li>Deliver personalized recommendations through the HR Co-Pilot</li>
                    <li>Automate strategic planning and operating model suggestions</li>
                    <li>Provide analytics dashboards, benchmarking, and reports</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-100 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">B. Platform Reliability & Improvement</h5>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    <li>Train and refine AI/ML models using anonymized data</li>
                    <li>Detect usage patterns and improve system performance</li>
                    <li>Enhance recommendation accuracy and cognitive reasoning</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-100 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">C. Communication & Engagement</h5>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    <li>Send technical notifications, product updates, and alerts</li>
                    <li>Provide onboarding guidance and customer support</li>
                    <li>Respond to tickets, issues, or inquiries</li>
                  </ul>
                </div>
                <div className="p-4 bg-gray-100 rounded-xl">
                  <h5 className="font-bold text-gray-900 mb-2">D. Regulatory, Legal & Security Purposes</h5>
                  <ul className="text-sm space-y-1 list-disc pl-4">
                    <li>Verify identity and secure accounts</li>
                    <li>Prevent unauthorized access, fraud, or policy violations</li>
                    <li>Comply with laws, government requests, or data regulations</li>
                  </ul>
                </div>
              </div>
            </PolicySection>

            <PolicySection id="legal-basis" title="4. Legal Basis for Processing">
              <p>We rely on the following legal bases depending on context:</p>
              <div className="mt-4 overflow-hidden border border-gray-200 rounded-xl">
                <table className="min-w-full divide-y divide-gray-200">
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-50/50">Consent</td>
                      <td className="px-6 py-4 text-sm text-gray-600">when users voluntarily provide information</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-50/50">Contractual necessity</td>
                      <td className="px-6 py-4 text-sm text-gray-600">to deliver subscribed services</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-50/50">Legitimate interest</td>
                      <td className="px-6 py-4 text-sm text-gray-600">analytics, security, AI refinement</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 bg-gray-50/50">Legal obligations</td>
                      <td className="px-6 py-4 text-sm text-gray-600">compliance with statutory requirements</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </PolicySection>

            <PolicySection id="security" title="5. Data Protection, Security & Retention">
              <p>We implement strong technical and organizational measures, including:</p>
              <div className="mt-6 flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <h5 className="font-bold text-gray-900 border-b border-indigo-200 pb-2">Technical Safeguards</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>AES-256 encryption for stored data</li>
                    <li>TLS/HTTPS for secure data transmission</li>
                    <li>Regular vulnerability scans and penetration testing</li>
                    <li>Secure authentication and controlled access</li>
                  </ul>
                </div>
                <div className="flex-1 space-y-4">
                  <h5 className="font-bold text-gray-900 border-b border-indigo-200 pb-2">Organizational Safeguards</h5>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Strict role-based access controls (RBAC)</li>
                    <li>Non-disclosure and confidentiality policies for authorized personnel</li>
                    <li>Audit logs and monitoring for suspicious activities</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
                <h5 className="font-bold text-indigo-900 mb-3">Data Retention</h5>
                <p className="text-sm text-indigo-800">
                  Data is retained only for:
                </p>
                <ul className="list-disc pl-5 mt-2 mb-2 text-sm text-indigo-800">
                  <li>Service delivery</li>
                  <li>Legal requirements</li>
                  <li>Secure archival (if contractually required)</li>
                </ul>
                <p className="text-sm text-indigo-800">Data is deleted or anonymized after the retention period.</p>
              </div>
            </PolicySection>

            <PolicySection id="sharing" title="6. Data Sharing and Disclosure">
              <p>Information is shared strictly on a need-to-know basis:</p>
              <ul className="list-disc pl-5 mt-4 space-y-4">
                <li><strong className="text-gray-900">A. Internal Authorized Staff:</strong> Only trained personnel under confidentiality are allowed controlled access.</li>
                <li><strong className="text-gray-900">B. Verified Third-Party Partners:</strong> We may engage: Secure cloud hosting providers, Analytics or workflow automation tools, Communication service providers. All partners comply with strong data protection obligations.</li>
                <li><strong className="text-gray-900">C. Legal and Regulatory Bodies:</strong> Information may be disclosed if required by: Court orders, Government authorities, Compliance with applicable law.</li>
              </ul>
              <p className="mt-6 font-bold text-green-700 text-lg border-2 border-green-500 border-dashed p-4 text-center rounded-xl">We do NOT sell, trade, or commercially expose user data under any circumstances.</p>
            </PolicySection>

            <PolicySection id="cookies" title="7. Cookies & Tracking Technologies">
              <p>We use cookies to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Enable secure login and session continuity</li>
                <li>Improve UI/UX and performance</li>
                <li>Understand usage patterns and optimize features</li>
              </ul>
              <p className="mt-2">Users may disable cookies; however, some functionalities may be restricted.</p>
              <Link to="/legal/cookie" className="mt-4 inline-flex items-center gap-2 text-green-600 font-bold hover:underline">
                View Full Cookie Policy <ArrowUpRightIcon className="w-4 h-4" />
              </Link>
            </PolicySection>

            <PolicySection id="ai-governance" title="8. Data Processing in HR Co-Pilot & Cognitive Intelligence Systems">
              <p>Our AI-driven systems follow strict ethical and secure data governance:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2 text-sm bg-gray-50 p-6 rounded-2xl border border-gray-200">
                <li>No personally identifiable information (PII) is used for AI training</li>
                <li>Data is aggregated, anonymized, and pattern-based</li>
                <li>Models operate within controlled, auditable workflows</li>
                <li>Users retain ownership of their organizational data</li>
                <li>AI does not make decisions without user validation</li>
                <li>AI outputs do not expose any sensitive or confidential information from other clients</li>
              </ul>
            </PolicySection>

            <PolicySection id="transfers" title="9. International Data Transfers">
              <p>If data is processed or stored outside your jurisdiction, appropriate safeguards are applied:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Compliance with equivalent data protection standards</li>
                <li>Encrypted transfers and restricted access</li>
              </ul>
            </PolicySection>

            <PolicySection id="rights" title="10. User Rights">
              <p>Users may have the following rights depending on their jurisdiction:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm">Right to <span className="font-bold text-gray-900">access</span> their stored data</li>
                <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm">Right to <span className="font-bold text-gray-900">correct</span> inaccurate or incomplete information</li>
                <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm">Right to <span className="font-bold text-gray-900">delete</span> or request erasure</li>
                <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm">Right to <span className="font-bold text-gray-900">restrict or object</span> to certain processing</li>
                <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm">Right to <span className="font-bold text-gray-900">withdraw consent</span> at any time</li>
                <li className="bg-white p-4 rounded-lg border border-gray-100 shadow-sm text-sm">Right to <span className="font-bold text-gray-900">data portability</span> (machine-readable format)</li>
              </ul>
              <p className="mt-4">Requests can be initiated via our contact email.</p>
            </PolicySection>

            <PolicySection id="children" title="11. Children's Data">
              <p>Our services are designed for professional and business use only.</p>
              <p>We do not knowingly collect information from individuals under 18.</p>
              <p>If such data is identified, it will be removed immediately.</p>
            </PolicySection>

            <PolicySection id="external-links" title="12. Links to External Websites">
              <p>Our platform may contain links to third-party websites or resources.</p>
              <p>We are not responsible for:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Their content</li>
                <li>Their data practices</li>
                <li>Their security standards</li>
              </ul>
              <p>Users are encouraged to review respective policies.</p>
            </PolicySection>

            <PolicySection id="updates" title="13. Updates to This Privacy Policy">
              <p>We may update this Policy periodically due to:</p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Regulatory changes</li>
                <li>Platform enhancements</li>
                <li>Introduction of new features</li>
                <li>Security updates</li>
              </ul>
              <p className="mt-4">Any modifications will be reflected in the “Last Updated” section.</p>
            </PolicySection>

            <PolicySection id="contact" title="14. Contact Information">
              <p>For data protection concerns, requests, or clarifications, contact:</p>
              <address className="mt-6 not-italic bg-gray-900 p-8 rounded-3xl border border-gray-800 shadow-2xl">
                <strong className="text-white block mb-4 font-display text-xl">HR-Tek System</strong>
                <div className="space-y-3 text-gray-300">
                  <p className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">@</span>
                    <a href="mailto:support@hrteksystem.com" className="hover:text-green-400 transition-colors">support@hrteksystem.com</a>
                  </p>
                  <p className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">#</span>
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