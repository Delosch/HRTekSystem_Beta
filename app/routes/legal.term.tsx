// app/routes/legal.term.tsx

import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';

export const meta: MetaFunction = () => {
  return [{ title: "Terms and Conditions | HRTek System" }];
};

// --- Data for the Terms and Conditions Page ---
const termsSections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "services", title: "2. Services Covered" },
  { id: "eligibility", title: "3. User Eligibility" },
  { id: "responsibilities", title: "4. User Responsibilities" },
  { id: "prohibited", title: "5. Prohibited Activities" },
  { id: "intellectual-property", title: "6. Intellectual Property Rights" },
  { id: "data-ownership", title: "7. Data Ownership & Usage" },
  { id: "payments", title: "8. Subscription, Payments & Billing" },
  { id: "reports", title: "9. Reports, Insights & Advisory Outputs" },
  { id: "confidentiality", title: "10. Confidentiality" },
  { id: "third-party", title: "11. Third-Party Services" },
  { id: "availability", title: "12. Platform Availability & Maintenance" },
  { id: "liability", title: "13. Limitation of Liability" },
  { id: "indemnification", title: "14. Indemnification" },
  { id: "termination", title: "15. Termination of Services" },
  { id: "governing-law", title: "16. Governing Law & Jurisdiction" },
  { id: "changes", title: "17. Changes to Terms" },
  { id: "contact", title: "18. Contact Information" },
];

export default function TermsAndConditionsPage() {
  const [activeId, setActiveId] = useState("acceptance");

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

    termsSections.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      termsSections.forEach(({ id }) => {
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
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Terms and Conditions</h1>
          <p className="mt-2 text-lg text-gray-600">HR-Tek System</p>
          <p className="mt-1 text-sm text-gray-500 font-medium uppercase tracking-wider">Last Updated: November 2025</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 md:sticky top-24 self-start">
            <nav className="space-y-1">
              {termsSections.map(({ id, title }) => (
                <button
                  key={id}
                  onClick={() => {
                    const el = document.getElementById(id);
                    if (el) {
                      el.scrollIntoView({ behavior: "smooth", block: "start" });

                      // update URL hash WITHOUT adding history entry
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
            <section className="prose prose-lg max-w-none text-gray-700">
              <p>These Terms and Conditions (“Terms”) govern your use of the HR-Tek System platform, website, AI-driven HR advisory tools, and all services offered (“Company”, “we”, “our”, “us”).</p>
              <p>By accessing or using our services, you agree to be bound by these Terms. If you do not agree, you may not access or use the platform.</p>
            </section>

            <TermsSection id="acceptance" title="1. Acceptance of Terms">
              <p>By creating an account, accessing the platform, or using any service, you confirm that:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>You have read and understood these Terms</li>
                <li>You are authorized to use the platform on behalf of your organization</li>
                <li>You comply with all applicable laws and regulations</li>
              </ul>
              <p className="mt-4 font-medium text-gray-900">These Terms constitute a legally binding agreement between you (the “User”, “Client”, “Customer”) and the Company.</p>
            </TermsSection>

            <TermsSection id="services" title="2. Services Covered">
              <p>These Terms apply to all services provided through HR-Tek System, including:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>HR Digital Maturity Assessments</li>
                <li>HR Roadmap Generator</li>
                <li>HCM Vendor Fit Engine</li>
                <li>HR Co-Pilot & Cognitive Intelligence Models</li>
                <li>Automation, analytics, and dashboard modules</li>
                <li>Consultation or advisory reports generated by the system</li>
              </ul>
              <p className="mt-4">The Company may modify, add, or remove features without prior notice to enhance performance or security.</p>
            </TermsSection>

            <TermsSection id="eligibility" title="3. User Eligibility">
              <p>To use the platform, you must:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Be at least 18 years old</li>
                <li>Use the services for business or organizational purposes only</li>
                <li>Provide accurate and truthful information during registration</li>
                <li>Not be prohibited under applicable laws from receiving services</li>
              </ul>
            </TermsSection>

            <TermsSection id="responsibilities" title="4. User Responsibilities">
              <p>Users agree to:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Maintain confidentiality of login credentials</li>
                <li>Ensure information provided in assessments or forms is accurate</li>
                <li>Use the platform ethically and lawfully</li>
                <li>Not misuse or attempt to disrupt any system or service</li>
                <li>Immediately notify us of any unauthorized access</li>
              </ul>
              <p className="mt-4 font-semibold text-gray-900 italic">You are responsible for all activities conducted under your account.</p>
            </TermsSection>

            <TermsSection id="prohibited" title="5. Prohibited Activities">
              <p>Users shall not:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Copy, distribute, or reverse-engineer the platform</li>
                <li>Use the platform for competing product development</li>
                <li>Upload harmful content such as viruses, malware, or malicious scripts</li>
                <li>Attempt unauthorized access to systems, data, or user accounts</li>
                <li>Manipulate results or alter system-generated insights</li>
                <li>Resell or commercially exploit platform outputs without permission</li>
              </ul>
              <p className="mt-4 border-l-4 border-red-500 pl-4 text-red-700 italic">Violation of these conditions may result in suspension or termination.</p>
            </TermsSection>

            <TermsSection id="intellectual-property" title="6. Intellectual Property Rights">
              <ul className="list-disc pl-5 space-y-4">
                <li>All content, frameworks, algorithms, designs, assessments, AI models, and trademarks belong exclusively to HR-Tek System.</li>
                <li>Users receive a limited, non-transferable, non-exclusive license to access and use the platform for internal business purposes.</li>
                <li>Users may not copy, reproduce, or distribute any part of the platform without written approval.</li>
              </ul>
              <p className="mt-4 font-bold text-gray-900 underline">Any unauthorized use may result in legal action.</p>
            </TermsSection>

            <TermsSection id="data-ownership" title="7. Data Ownership & Usage">
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">A. Ownership</h4>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Users retain full ownership of the data they upload or input.</li>
                    <li>System-generated insights, reports, and recommendations are the intellectual property of the Company but licensed to the client for internal use.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2 mb-3">B. Use of Data</h4>
                  <p>We may use anonymized and aggregated data to:</p>
                  <ul className="list-disc pl-5 mt-2 space-y-2">
                    <li>Improve AI models</li>
                    <li>Enhance platform accuracy and functionality</li>
                    <li>Conduct benchmarking and industry research (without identifiers)</li>
                  </ul>
                  <p className="mt-4 font-semibold text-green-700">Personal or organizational identifiable data will never be sold.</p>
                </div>
              </div>
            </TermsSection>

            <TermsSection id="payments" title="8. Subscription, Payments & Billing">
              <p>If you subscribe to paid services:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Fees, billing cycles, and pricing will be communicated during onboarding or checkout.</li>
                <li>Payments must be made through approved payment methods.</li>
                <li>Failure to pay may result in account suspension or restricted access.</li>
                <li>All fees are non-refundable unless stated otherwise in writing.</li>
              </ul>
              <p className="mt-4 bg-gray-100 p-4 rounded-lg text-sm text-gray-600">Taxes or additional charges may apply depending on jurisdiction.</p>
            </TermsSection>

            <TermsSection id="reports" title="9. Reports, Insights & Advisory Outputs">
              <p>The platform provides:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Automated HR insights</li>
                <li>Digital maturity scores</li>
                <li>AI-driven recommendations</li>
                <li>HR strategic roadmaps</li>
              </ul>
              <p className="mt-6 text-gray-700">While results aim to be accurate, they are dependent on the data provided by users.</p>
              <p className="mt-2 font-bold text-gray-900">The Company is not liable for any organizational decisions made solely based on system-generated outputs.</p>
            </TermsSection>

            <TermsSection id="confidentiality" title="10. Confidentiality">
              <p>Both parties agree to maintain confidentiality regarding:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Business information</li>
                <li>HR process and policy documents</li>
                <li>Uploaded workforce or operational data</li>
                <li>Any proprietary methodologies</li>
              </ul>
              <p className="mt-4">Confidential information will not be disclosed unless:</p>
              <ul className="list-disc pl-5 mt-2 space-y-2">
                <li>Required by law</li>
                <li>Authorized by the user</li>
                <li>Needed for security, compliance, or fraud prevention</li>
              </ul>
            </TermsSection>

            <TermsSection id="third-party" title="11. Third-Party Services">
              <p>The platform may integrate or link to third-party services. We are not responsible for:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Their availability</li>
                <li>Their content</li>
                <li>Their data handling practices</li>
              </ul>
              <p className="mt-4 font-medium italic">Users must review their respective Terms & Privacy Policies.</p>
            </TermsSection>

            <TermsSection id="availability" title="12. Platform Availability & Maintenance">
              <p>We strive to maintain high uptime and reliability but do not guarantee:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Uninterrupted access</li>
                <li>Error-free operation</li>
                <li>Absolute security against cyber threats</li>
              </ul>
              <p className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-800">Scheduled maintenance or system upgrades may temporarily restrict access.</p>
            </TermsSection>

            <TermsSection id="liability" title="13. Limitation of Liability">
              <p>To the fullest extent permitted by law, the Company shall not be liable for:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Loss of profits, revenue, or business opportunities</li>
                <li>Errors, delays, or interruptions in service</li>
                <li>Data loss due to user error or external attacks</li>
                <li>Decisions made based on system-generated recommendations</li>
                <li>Any indirect, incidental, or consequential damages</li>
              </ul>
              <p className="mt-6 p-4 border border-gray-200 rounded-lg font-bold text-gray-900 text-center">Our liability, if applicable, is limited to the amount paid by the user in the last 12 months.</p>
            </TermsSection>

            <TermsSection id="indemnification" title="14. Indemnification">
              <p>Users agree to indemnify and hold harmless the Company from any claims, damages, liabilities, and expenses arising from:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Misuse of the platform</li>
                <li>Violation of these Terms</li>
                <li>Breach of applicable laws</li>
                <li>Unauthorized use of intellectual property</li>
              </ul>
            </TermsSection>

            <TermsSection id="termination" title="15. Termination of Services">
              <p>We reserve the right to suspend or terminate user access if:</p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>Terms are violated</li>
                <li>Payment obligations are not met</li>
                <li>Unauthorized or harmful activity is detected</li>
                <li>Legal or security risks arise</li>
              </ul>
              <p className="mt-4">Upon termination, user access to data and platform features may be restricted.</p>
            </TermsSection>

            <TermsSection id="governing-law" title="16. Governing Law & Jurisdiction">
              <p>These Terms are governed by the laws of India.</p>
              <p className="mt-4">Any disputes arising from these Terms shall be subject to the jurisdiction of the courts of India, primarily based in <span className="font-bold underline decoration-dotted decoration-green-500">Lucknow</span>.</p>
            </TermsSection>

            <TermsSection id="changes" title="17. Changes to Terms">
              <p>We may update these Terms from time to time.</p>
              <p className="mt-4">Users will be notified of significant changes through the platform or by email. Continued use of the services implies acceptance of updated Terms.</p>
            </TermsSection>

            <TermsSection id="contact" title="18. Contact Information">
              <p>For queries related to these Terms, contact:</p>
              <address className="mt-6 not-italic bg-gray-100 p-6 rounded-2xl border border-gray-200">
                <strong className="text-gray-900 block mb-2 font-display text-lg">HR-Tek System</strong>
                <div className="space-y-1 text-gray-600">
                  <p className="flex items-center gap-2">
                    <span className="font-semibold w-16">Email:</span>
                    <a href="mailto:Support@hrteksystem.com" className="text-green-600 hover:text-green-700 hover:underline">Support@hrteksystem.com</a>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-semibold w-16">Phone:</span>
                    <span>+91-9335870619 : 0522-3195392</span>
                  </p>
                </div>
              </address>
            </TermsSection>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- Helper Component for Sections ---
function TermsSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-800 border-b-2 border-green-500 pb-2 mb-6">{title}</h2>
      <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
        {children}
      </div>
    </section>
  );
}
