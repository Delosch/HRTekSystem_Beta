import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { json, type LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "./tailwind.css";
import "./styles/dashboard-premium.css";
import CookieConsent from "./components/ui/CookieConsent";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "HRTek System – AI-Powered HR Transformation Platform" },
    { charSet: "utf-8" },
    { name: "viewport", content: "width=device-width, initial-scale=1" },
    { name: "description", content: "AI-powered HR transformation platform offering digital maturity assessment, HCM vendor selection, roadmap generation, and change management solutions." },
  ];
};

/* ============================
   ✅ LOADER
   ============================ */
import { getUserSession, getSession, commitSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const cookie = request.headers.get("Cookie");
  const session = await getSession(cookie);
  const user = await getUserSession(request).catch(() => null);

  return json(
    {
      user,
      ENV: {
        VITE_HCAPTCHA_SITE_KEY: process.env.VITE_HCAPTCHA_SITE_KEY || process.env.HCAPTCHA_SITE_KEY || "",
      },
    },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
}

/* ============================
   LINKS
   ============================ */
export const links: LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

/* ============================
   APP ROOT
   ============================ */
export function ErrorBoundary() {
  const error = useRouteError();
  console.error("Root ErrorBoundary caught error:", error);

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-50 min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-slate-100">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-8">
            {isRouteErrorResponse(error)
              ? `${error.status} ${error.statusText}`
              : error instanceof Error
                ? error.message
                : "An unexpected error occurred"}
          </p>
          <a
            href="/"
            className="inline-block px-8 py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all shadow-lg"
          >
            Back to Home
          </a>
        </div>
        <Scripts />
      </body>
    </html>
  );
}


export default function App() {
  const data = useLoaderData<typeof loader>();
  const ENV = data?.ENV || {};

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <Meta />
        <Links />

        {/* Google Consent Mode v2 - Default Denied State */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              
              // Initialize consent to 'denied' as per GDPR/DMA requirements
              gtag('consent', 'default', {
                'ad_storage': 'denied',
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'analytics_storage': 'denied',
                'functionality_storage': 'denied',
                'security_storage': 'granted', // Essential for basic platform safety
                'wait_for_update': 500
              });

              gtag('js', new Date());
              // Config with IP Anonymization enabled by default
              gtag('config', 'G-ZSWQ6ZNXVQ', { 'anonymize_ip': true });
            `,
          }}
        />
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-ZSWQ6ZNXVQ"></script>

        {/* JSON-LD Schema Markup for Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "HRTek System",
              "alternateName": "HR-Tek System",
              "url": "https://www.hrteksystem.com",
              "logo": "https://www.hrteksystem.com/logo_icon_final.png",
              "description": "AI-powered HR transformation platform offering digital maturity assessment, HCM vendor selection, roadmap generation, and change management solutions.",
              "foundingDate": "2025",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Lucknow",
                "addressRegion": "Uttar Pradesh",
                "addressCountry": "IN"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-9335870619",
                "contactType": "Customer Service",
                "email": "support@hrteksystem.com",
                "availableLanguage": ["English", "Hindi"]
              },
              "sameAs": [
                "https://in.linkedin.com/company/hr-tek-system",
                "https://twitter.com/hrtek_system",
                "https://facebook.com/hrteksystem"
              ],
              "brand": {
                "@type": "Brand",
                "name": "Delosch Technologies Pvt Ltd"
              }
            }),
          }}
        />

        {/* JSON-LD Schema for SoftwareApplication */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "HRTek System",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "INR"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127"
              },
              "description": "Comprehensive HR transformation platform with AI-powered assessments, vendor matching, and strategic roadmap generation."
            }),
          }}
        />

        {/* ✅ EXPOSE ENV TO CLIENT (CRITICAL) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(ENV)};`,
          }}
        />

        {/* Favicon */}
        <link rel="icon" href="/hrtek_logo.png" />
        <link rel="apple-touch-icon" href="/hrtek_logo.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* ✅ Hydration safety (browser extensions) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                const observer = new MutationObserver(() => {
                  if (document.body) {
                    document.body.removeAttribute('cz-shortcut-listen');
                    document.body.removeAttribute('vsc-initialized');
                  }
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                });
                if (document.body) {
                  observer.observe(document.body, {
                     attributes: true,
                     subtree: true,
                  });
                }
              }
            `,
          }}
        />
      </head>

      <body suppressHydrationWarning>
        <Outlet />
        <CookieConsent />
        <ToastContainer position="bottom-right" theme="colored" />

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
