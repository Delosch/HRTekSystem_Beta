import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import { json, type LinksFunction, type LoaderFunctionArgs } from "@remix-run/node";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "./tailwind.css";
import "./styles/dashboard-premium.css";
import CookieConsent from "./components/ui/CookieConsent";

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
export default function App() {
  const { ENV } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

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
                  document.body?.removeAttribute('cz-shortcut-listen');
                  document.body?.removeAttribute('vsc-initialized');
                });
                observer.observe(document.documentElement, {
                  attributes: true,
                  subtree: true,
                });
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
