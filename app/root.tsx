import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import type { LinksFunction } from "@remix-run/node";
import "react-toastify/dist/ReactToastify.css";
import "./tailwind.css";
import "./styles/dashboard-premium.css";

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

// FIXED: Single App component with proper HTML structure
export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />

        {/* Favicon & Metadata from RealFaviconGenerator */}
        <link
          rel="icon"
          type="image/png"
          href="/hrtek_logo.png"
        />
        <link rel="shortcut icon" href="/hrtek_logo.png" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <meta name="apple-mobile-web-app-title" content="MyWebSite" />
        <link rel="manifest" href="/site.webmanifest" />
        {/* ADDED: Fix browser extension hydration issues */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Remove browser extension attributes before hydration
              if (typeof window !== 'undefined') {
                const observer = new MutationObserver(() => {
                  if (document.body && document.body.hasAttribute('cz-shortcut-listen')) {
                    document.body.removeAttribute('cz-shortcut-listen');
                  }
                  if (document.body && document.body.hasAttribute('vsc-initialized')) {
                    document.body.removeAttribute('vsc-initialized');
                  }
                });
                
                if (document.body) {
                  observer.observe(document.body, {
                    attributes: true,
                    attributeFilter: ['cz-shortcut-listen', 'vsc-initialized']
                  });
                }
              }
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning={true}>
        {/* Child routes render here via Outlet */}
        <Outlet />

        {/* Remix required components */}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
