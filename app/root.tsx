import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
} from "@remix-run/react";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";

import "react-toastify/dist/ReactToastify.css";
import "./tailwind.css";
import "./styles/dashboard-premium.css";

/* ============================
   ✅ LOADER
   ============================ */
export async function loader({ request }: LoaderFunctionArgs) {
  return {
    ENV: {
      VITE_HCAPTCHA_SITE_KEY: process.env.VITE_HCAPTCHA_SITE_KEY ?? "",
    },
  };
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

        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
