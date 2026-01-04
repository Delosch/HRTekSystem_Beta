// app/routes/legal.terms.tsx

import type { MetaFunction } from "@remix-run/node";
import { useState, useEffect } from "react";
import { Link } from "@remix-run/react";
import { ArrowUpRightIcon } from '@heroicons/react/24/solid';

export const meta: MetaFunction = () => {
  return [{ title: "Terms and Conditions | HRTek Systems" }];
};

// --- Data for the Terms and Conditions Page ---
const termsSections = [
  { id: "definitions", title: "1. Definitions" },
  { id: "eligibility", title: "2. Eligibility and Access" },
  { id: "global-availability", title: "3. Global Service Availability" },
  { id: "license", title: "4. License and Usage" },
  { id: "client-responsibilities", title: "5. Client Responsibilities" },
  { id: "subscriptions", title: "6. Subscriptions, Pricing, and Payments" },
  { id: "intellectual-property", title: "7. Intellectual Property Rights" },
  { id: "data-privacy", title: "8. Data Privacy and Protection" },
  { id: "confidentiality", title: "9. Confidentiality" },
  { id: "system-availability", title: "10. System Availability" },
  { id: "third-party", title: "11. Third-Party Integrations" },
  { id: "termination", title: "12. Termination of Use" },
  { id: "disclaimers", title: "13. Disclaimers and No Warranty" },
  { id: "liability", title: "14. Limitation of Liability" },
  { id: "governing-law", title: "15. Governing Law and Jurisdiction" },
  { id: "international-use", title: "16. International Use and Compliance" },
  { id: "changes-to-terms", title: "17. Changes to Terms" },
  { id: "contact", title: "18. Contact Us" },
];

export default function TermsAndConditionsPage() {
  const [activeId, setActiveId] = useState("definitions");

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
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Terms and Conditions</h1>
          <p className="mt-2 text-lg text-gray-600">Effective Date: August 25, 2025</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="md:col-span-1 md:sticky top-24 self-start">
            <nav className="space-y-1">
              {termsSections.map(({ id, title }) => (
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
            <section className="prose prose-lg max-w-none text-gray-700">
              <p>These Terms and Conditions (“Terms”) govern your access to and use of the HR Tek System Web-based HR Digital Advisory Platform (“Platform” or “Service”), a global software-as-a-service (SaaS) solution designed to enable digital transformation in human resource management.</p>
              <p>By accessing or using our services, you agree to be bound by these Terms and to comply with all applicable local, state, national, and international laws. If you do not agree with these Terms, please do not use our Platform.</p>
            </section>

            <TermsSection id="definitions" title="1. Definitions">
              <ul className="list-disc list-inside space-y-2">
                <li><strong className="font-semibold">“Company” / “We” / “Our” / “Us”</strong> refers to HR Tek System, its subsidiaries, affiliates, officers, employees, and authorized representatives.</li>
                <li><strong className="font-semibold">“Client” / “You” / “Your”</strong> refers to any individual, company, or legal entity using the platform, either in trial, demo, or subscription mode.</li>
                <li><strong className="font-semibold">“Platform”</strong> refers to the cloud-based software including all modules, features, user interfaces, and backend systems provided by HR Tek System.</li>
                <li><strong className="font-semibold">“Services”</strong> refers to all consulting tools, dashboards, reports, insights, and associated functions delivered through the Platform.</li>
                <li><strong className="font-semibold">“Content”</strong> includes text, data, audio, graphics, reports, assessments, algorithms, and code available via the Platform.</li>
              </ul>
            </TermsSection>

            <TermsSection id="eligibility" title="2. Eligibility and Access">
              <ul className="list-disc list-inside space-y-2">
                <li>You represent and warrant that you are authorized to access the Platform on behalf of your organization and are at least 18 years of age.</li>
                <li>You must provide accurate, complete, and current registration information.</li>
                <li>HR Tek System reserves the right to suspend or terminate access for any violation of eligibility criteria or Terms.</li>
              </ul>
            </TermsSection>

            <TermsSection id="global-availability" title="3. Global Service Availability">
              <p>HR Tek System is designed for global use. Clients across regions and jurisdictions can access the platform, subject to:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Local internet regulations and export controls.</li>
                <li>Region-specific data privacy requirements (e.g., GDPR in Europe, CCPA in California, LGPD in Brazil).</li>
                <li>Local language support and currency configurations (as applicable in future versions).</li>
              </ul>
            </TermsSection>

            <TermsSection id="license" title="4. License and Usage">
              <ul className="list-disc list-inside space-y-2">
                <li>We grant you a non-exclusive, non-transferable, revocable, and limited license to use the Platform for your internal HR transformation purposes only.</li>
                <li>You are prohibited from sublicensing, reselling, or making the platform publicly accessible to third parties.</li>
              </ul>
            </TermsSection>

            <TermsSection id="client-responsibilities" title="5. Client Responsibilities">
              <p>You agree to:</p>
              <ul className="list-disc list-inside space-y-2 mt-2">
                <li>Ensure that user credentials are confidential and not shared with unauthorized personnel.</li>
                <li>Use the Platform in accordance with all applicable laws and not for any illegal or harmful activity.</li>
                <li>Input only authorized and accurate organizational data into the system.</li>
              </ul>
            </TermsSection>

            <TermsSection id="subscriptions" title="6. Subscriptions, Pricing, and Payments">
              <ul className="list-disc list-inside space-y-2">
                <li>Certain advanced services or modules require paid subscriptions based on your business size and region.</li>
                <li>Pricing is structured based on client type (small, mid-sized, enterprise) and geographic pricing tiers.</li>
                <li>All fees are charged in the selected billing currency and are non-refundable unless specified otherwise.</li>
                <li>Taxes and compliance costs (e.g., VAT, GST, digital service tax) are the responsibility of the client.</li>
                <li>HR Tek System reserves the right to modify pricing and plans with 30 days’ prior notice.</li>
              </ul>
            </TermsSection>

            <TermsSection id="intellectual-property" title="7. Intellectual Property Rights">
              <ul className="list-disc list-inside space-y-2">
                <li>All content, source code, interfaces, algorithms, and documentation are the exclusive property of HR Tek System or its licensors.</li>
                <li>You may not copy, reproduce, reverse engineer, decompile, or modify any part of the Platform.</li>
                <li>All trademarks, service marks, logos, and trade names are the property of their respective owners.</li>
              </ul>
            </TermsSection>

            <TermsSection id="data-privacy" title="8. Data Privacy and Protection">
              <p>HR Tek System complies with international data protection laws. By using our services, you consent to cross-border transfer of data where required. For more information, please refer to our <Link to="/legal/privacy" className="text-green-600 font-medium hover:underline">Privacy Policy</Link>.</p>
            </TermsSection>

            <TermsSection id="confidentiality" title="9. Confidentiality">
              <ul className="list-disc list-inside space-y-2">
                <li>Both parties shall keep confidential any proprietary or non-public information exchanged during usage of the platform.</li>
                <li>Confidential information may not be disclosed without prior written consent, except as required by law.</li>
              </ul>
            </TermsSection>

            <TermsSection id="system-availability" title="10. System Availability and Service Limitations">
              <ul className="list-disc list-inside space-y-2">
                <li>We strive for 99.9% uptime, but occasional downtimes may occur due to maintenance, updates, or third-party outages.</li>
                <li>HR Tek System is not liable for any loss due to service interruptions, technical errors, or system limitations.</li>
                <li>Advisory insights generated are based on system logic and user input – they do not constitute legal or investment advice.</li>
              </ul>
            </TermsSection>

            <TermsSection id="third-party" title="11. Third-Party Integrations">
              <p>The platform may integrate with third-party services. We are not responsible for any data breach, limitation, or failure arising from these third-party services.</p>
            </TermsSection>

            <TermsSection id="termination" title="12. Termination of Use">
              <p>We may suspend, limit, or terminate your access if you violate these Terms, your subscription expires or is unpaid, or you engage in harmful activities. Upon termination, access will be revoked, and you are responsible for downloading your data beforehand.</p>
            </TermsSection>

            <TermsSection id="disclaimers" title="13. Disclaimers and No Warranty">
              <p>The platform is provided on an “as-is” and “as-available” basis. We do not warrant uninterrupted access, accuracy of results, or compatibility with your infrastructure. We are not responsible for business decisions made based on advisory output from the Platform.</p>
            </TermsSection>

            <TermsSection id="liability" title="14. Limitation of Liability">
              <p>To the extent permitted by law, HR Tek System shall not be liable for any indirect, incidental, special, or consequential damages, loss of profits, revenue, or data. Any claims shall not exceed the amount paid by you in the past 6 months.</p>
            </TermsSection>

            <TermsSection id="governing-law" title="15. Governing Law and Jurisdiction">
              <p>These Terms shall be governed by the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the competent courts in Lucknow, India.</p>
            </TermsSection>

            <TermsSection id="international-use" title="16. International Use and Compliance">
              <p>You are responsible for ensuring compliance with local laws and regulations while using the Platform. We do not guarantee that our services are appropriate or lawful in all territories.</p>
            </TermsSection>

            <TermsSection id="changes-to-terms" title="17. Changes to Terms">
              <p>We may update these Terms from time to time. Material changes will be communicated via email or platform notification. Continued use after changes implies acceptance.</p>
            </TermsSection>

            <TermsSection id="contact" title="18. Contact Us">
              <p>For questions or support, please contact HR Tek System at <a href="mailto:support@hrteksystem.com" className="text-green-600 font-medium hover:underline">support@hrteksystem.com</a>.</p>
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
      <h2 className="text-2xl font-bold text-gray-800 border-b pb-2 mb-4">{title}</h2>
      <div className="prose prose-lg max-w-none text-gray-700">
        {children}
      </div>
    </section>
  );
}
