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
import { motion } from "framer-motion";

import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import "./tailwind.css";
import "./styles/dashboard-premium.css";
import CookieConsent from "./components/ui/CookieConsent";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "HRTek System - AI-Powered HR Transformation Platform" },
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

  const headers = new Headers();
  // Optimization: Only commit session if user is logged in or a session already exists.
  // This prevents flooding DynamoDB with empty sessions for guest visitors/bots.
  if (user || cookie) {
    headers.set("Set-Cookie", await commitSession(session));
  }

  return json(
    {
      user,
      ENV: {
        VITE_HCAPTCHA_SITE_KEY: process.env.VITE_HCAPTCHA_SITE_KEY || process.env.HCAPTCHA_SITE_KEY || "",
      },
    },
    { headers }
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
  const is404 = isRouteErrorResponse(error) && error.status === 404;
  const is500 = isRouteErrorResponse(error) && error.status === 500;

  console.error("Root ErrorBoundary caught error:", error);

  return (
    <html lang="en" suppressHydrationWarning>
      <head suppressHydrationWarning>
        <Meta />
        <Links />
      </head>
      <body className="bg-slate-50 min-h-screen flex items-center justify-center p-6 font-sans antialiased overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-100/40 blur-[100px]" 
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              x: [0, -40, 0],
              y: [0, -20, 0]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full bg-indigo-100/30 blur-[120px]" 
          />
        </div>

        <div className="relative z-10 max-w-2xl w-full">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-3xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] p-12 md:p-16 text-center border border-white relative overflow-hidden"
          >
            {/* Stress Line */}
            <div className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r ${is404 ? 'from-blue-500 to-indigo-600' : 'from-rose-500 to-orange-600'}`} />
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-12"
            >
              <img src="/hrtek_logo.png" alt="HRTek Logo" className="h-10 w-auto mx-auto mb-10 opacity-80" />
            </motion.div>

            <div className={`w-28 h-28 ${is404 ? 'bg-blue-50' : 'bg-rose-50'} rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-inner group transition-transform hover:scale-105 duration-500`}>
              {is404 ? (
                <svg className="w-12 h-12 text-blue-500 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-12 h-12 text-rose-500 group-hover:animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              )}
            </div>

            <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-4 leading-tight">
              {is404 ? "Location Insight Not Found" : "Intelligence Link Interrupted"}
            </h1>
            
            <p className="text-slate-500 mb-12 max-w-sm mx-auto font-medium leading-relaxed text-lg">
              {is404 
                ? "The requested digital pathway either doesn't exist or has been moved within our ecosystem."
                : "We've encountered a synchronized system error. Our recovery agents have been alerted."}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center px-12 py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 text-xs uppercase tracking-widest group"
              >
                Return to Command
                <motion.span 
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2"
                >
                  &rarr;
                </motion.span>
              </a>
              <a
                href="/contact"
                className="inline-flex items-center justify-center px-12 py-5 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold hover:bg-slate-50 transition-all text-xs uppercase tracking-widest"
              >
                Contact Specialist
              </a>
            </div>

            {process.env.NODE_ENV === "development" && !is404 && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-12 p-6 bg-slate-900 rounded-2xl text-left border border-slate-800 overflow-hidden shadow-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-black">Diagnostic Kernel Dump</p>
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500/50" />
                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                  </div>
                </div>
                <pre className="text-xs text-rose-400 font-mono overflow-auto max-h-48 scrollbar-hide">
                  {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
                </pre>
              </motion.div>
            )}
          </motion.div>
          
          <div className="mt-10 text-center">
            <div className="inline-block px-4 py-1.5 bg-slate-200/50 rounded-full backdrop-blur-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                System_Code: {isRouteErrorResponse(error) ? error.status : "500_INT_FAILURE"}
              </span>
            </div>
          </div>
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
