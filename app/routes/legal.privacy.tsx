import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';

export const meta: MetaFunction = () => {
  return [{ title: "Privacy Policy | HRTek Systems" }];
};

// --- Data for the Privacy Policy Page ---
const policySections = [
  { id: "introduction", title: "1. Introduction" },
  { id: "definitions", title: "2. Definitions" },
  { id: "types-of-information", title: "3. Types of Information We Collect" },
  { id: "methods-of-collection", title: "4. Methods of Data Collection" },
  { id: "purpose-of-collection", title: "5. Purpose of Data Collection and Usage" },
  { id: "legal-basis", title: "6. Legal Basis for Processing" },
  { id: "data-sharing", title: "7. Data Sharing and Disclosures" },
  { id: "cross-border-transfers", title: "8. Cross-Border Data Transfers" },
  { id: "data-retention", title: "9. Data Retention Policy" },
  { id: "data-security", title: "10. Data Security Measures" },
  { id: "your-rights", title: "11. Your Data Protection Rights" },
  { id: "cookies", title: "12. Use of Cookies and Tracking Technologies" },
  { id: "childrens-privacy", title: "13. Children’s Privacy" },
  { id: "updates", title: "14. Updates to This Privacy Policy" },
  { id: "contact-information", title: "15. Contact Information" },
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
    <div className="bg-gray-50 min-h-screen">
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
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-lg text-gray-600">Last Updated: August 25, 2025</p>
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
          <div className="md:col-span-3 space-y-10">
            <PolicySection id="introduction" title="Introduction">
              <p>Delosch Technologies Pvt. Ltd. (“Delosch Technologies”, “we”, “our”, or “us”) is committed to safeguarding the privacy of the individuals whose personal data is collected, processed, stored, or transferred through our digital product — HR Technology Digital Advisory Platform and other HR Technology Platforms in our Flagship HAAS (HR Automation as a Service).</p>
            </PolicySection>

            <PolicySection id="definitions" title="Definitions">
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="font-semibold">'Client'</strong> refers to the organization (employer) that has subscribed to the HAAS product.</li>
                <li><strong className="font-semibold">'User'</strong> refers to any individual authorized by the client to access or interact with HAAS.</li>
                <li><strong className="font-semibold">'Personal Data'</strong> refers to any data relating to an identified or identifiable individual.</li>
                <li><strong className="font-semibold">'Processing'</strong> refers to any operation performed on personal data, including collection, storage, use, sharing, or deletion.</li>
              </ul>
            </PolicySection>

            <PolicySection id="types-of-information" title="Types of Information We Collect">
              <p>We collect various types of information to provide and improve our services. This includes, but is not limited to:</p>
              <ul className="list-disc list-inside space-y-3 mt-4 pl-2">
                <li><strong>Personally Identifiable Information:</strong> Name, email address, phone number, physical address, government-issued identifiers.</li>
                <li><strong>Professional & Employment Data:</strong> Job title, department, employment history, performance reviews, salary information, and other data managed by your employer.</li>
                <li><strong>Device and System Data:</strong> IP address, browser type, operating system, access times, and system logs.</li>
                <li><strong>Optional or Voluntary Information:</strong> Information provided through surveys, feedback forms, or support requests.</li>
              </ul>
            </PolicySection>

            <PolicySection id="methods-of-collection" title="Methods of Data Collection">
              <p>Your data is collected through several methods to ensure the platform functions correctly:</p>
              <ul className="list-disc list-inside space-y-3 mt-4 pl-2">
                <li><strong>Direct Entry:</strong> Information you or your employer provide during the onboarding process.</li>
                <li><strong>Automated Feeds:</strong> Data synchronized from your organization's existing HR systems.</li>
                <li><strong>Third-Party Integrations & APIs:</strong> Data from connected services, such as payroll or benefits providers, as authorized by the Client.</li>
                <li><strong>Surveys and Feedback:</strong> Voluntary information collected through platform features.</li>
              </ul>
            </PolicySection>

            <PolicySection id="purpose-of-collection" title="Purpose of Data Collection and Usage">
              <p>We process your data exclusively for legitimate business purposes related to the services we provide to our Clients. These purposes include:</p>
              <ul className="list-disc list-inside space-y-3 mt-4 pl-2">
                <li><strong>Service Provision:</strong> To deliver our core HR services, including employee management, performance tracking, and analytics.</li>
                <li><strong>Automation:</strong> To automate HR workflows and processes as configured by the Client.</li>
                <li><strong>Analytics and Reporting:</strong> To provide insights and reports to the Client about their workforce.</li>
                <li><strong>Compliance:</strong> To help Clients meet their legal and regulatory obligations.</li>
                <li><strong>Authentication and Security:</strong> To verify user identity and secure access to the platform.</li>
                <li><strong>Support:</strong> To respond to user inquiries and provide technical assistance.</li>
              </ul>
            </PolicySection>

            <PolicySection id="legal-basis" title="Legal Basis for Processing">
              <p>Our legal basis for processing personal data depends on the specific context and jurisdiction. The primary bases are:</p>
              <ul className="list-disc list-inside space-y-3 mt-4 pl-2">
                <li><strong>Consent:</strong> Where you have provided clear consent for us to process your personal data for a specific purpose.</li>
                <li><strong>Contractual Necessity:</strong> Where processing is necessary for the performance of our contract with our Client.</li>
                <li><strong>Legitimate Interest:</strong> Where processing is necessary for our legitimate interests (or those of a third party), provided your rights and interests do not override those interests.</li>
                <li><strong>Legal Obligation:</strong> Where processing is necessary for us to comply with the law.</li>
              </ul>
            </PolicySection>

            <PolicySection id="data-sharing" title="Data Sharing and Disclosures">
              <p>We do not sell your personal data. Data is shared only under the following circumstances:</p>
              <ul className="list-disc list-inside space-y-3 mt-4 pl-2">
                <li>With authorized users within the Client's organization as per their defined roles and permissions.</li>
                <li>With our third-party service providers (e.g., cloud hosting, payroll processors) who are contractually bound to protect the data.</li>
                <li>With government or law enforcement agencies when required by law.</li>
                <li>With internal Delosch Technologies teams for support and development, under strict confidentiality agreements.</li>
              </ul>
            </PolicySection>

            <PolicySection id="cross-border-transfers" title="Cross-Border Data Transfers">
              <p>Your data may be transferred to, and processed in, countries other than the one you reside in. We ensure data protection through legally-recognized mechanisms like Standard Contractual Clauses (SCCs), adequacy decisions, or your explicit consent.</p>
            </PolicySection>

            <PolicySection id="data-retention" title="Data Retention Policy">
              <p>We retain personal data for as long as necessary to fulfill the purposes for which it was collected, to comply with our legal obligations, resolve disputes, and enforce our agreements. Upon termination of a Client's contract, we will delete or anonymize data according to the agreed-upon terms and applicable law.</p>
            </PolicySection>

            <PolicySection id="data-security" title="Data Security Measures">
              <p>We implement robust technical and organizational measures to protect your data, including:</p>
              <ul className="list-disc list-inside space-y-3 mt-4 pl-2">
                <li>End-to-end encryption for data in transit and at rest.</li>
                <li>Strict Role-Based Access Control (RBAC) and Multi-Factor Authentication (MFA).</li>
                <li>Compliance with international standards such as ISO/IEC 27001.</li>
                <li>Continuous monitoring, logging, and regular data backups.</li>
              </ul>
              <p className="mt-4">Users are also responsible for maintaining the security of their accounts by using strong, unique passwords.</p>
            </PolicySection>

            <PolicySection id="your-rights" title="Your Data Protection Rights">
              <p>Depending on your location, you have certain rights regarding your personal data. These may include the right to:</p>
              <ul className="list-disc list-inside space-y-3 mt-4 pl-2">
                <li><strong>Access:</strong> Request a copy of the personal data we hold about you.</li>
                <li><strong>Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data.</li>
                <li><strong>Restrict Processing:</strong> Request a temporary halt to the processing of your data.</li>
                <li><strong>Data Portability:</strong> Request your data in a structured, machine-readable format.</li>
                <li><strong>Object:</strong> Object to our processing of your data.</li>
                <li><strong>Withdraw Consent:</strong> Withdraw your consent at any time.</li>
              </ul>
              <p className="mt-4">To exercise these rights, please contact your employer (the data controller) or reach out to our privacy team at <a href="mailto:support@hrteksystem.com" className="text-green-600 font-medium hover:underline">support@hrteksystem.com</a>.</p>
            </PolicySection>

            <PolicySection id="cookies" title="Use of Cookies and Tracking Technologies">
              <p>We use cookies and similar technologies for session management, remembering user preferences, and performing analytics. You can control or disable cookies through your browser settings, but please note that this may affect the functionality of our platform.</p>
            </PolicySection>

            <PolicySection id="childrens-privacy" title="Children’s Privacy">
              <p>Our services are not intended for individuals under the age of 16. We do not knowingly collect personal data from children. If we become aware that we have inadvertently collected such data, we will take steps to delete it promptly.</p>
            </PolicySection>

            <PolicySection id="updates" title="Updates to This Privacy Policy">
              <p>We may update this policy periodically to reflect changes in our practices or for legal and regulatory reasons. We will post any updates on this page and encourage you to review it regularly.</p>
            </PolicySection>

            <PolicySection id="contact-information" title="Contact Information">
              <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
              <address className="mt-4 not-italic space-y-1">
                <strong>HR Tek System - Delosch Technologies Pvt. Ltd.</strong><br />
                14-15 Madhupuram, IIM Road<br />
                Mubarakpur, Lucknow, 226020<br />
                India<br />
                Email: <a href="mailto:support@hrteksystem.com" className="text-green-600 font-medium hover:underline">support@hrteksystem.com</a>
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
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">{title}</h2>
      <div className="prose prose-lg max-w-none text-gray-700">
        {children}
      </div>
    </section>
  );
}