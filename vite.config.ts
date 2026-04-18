import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";


declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  base: '/app/',
  server: {
    port: (process.env.NODE_ENV as string) === "staging" ? 3001 : 3000,
    strictPort: true,
    allowedHosts: [
      "*.ngrok-free.app",
      "staging.hrteksystem.com",
      "www.hrteksystem.com",
      "hrteksystem.com"
    ]
  },
  define: {
    'import.meta.env.VITE_HCAPTCHA_SITE_KEY': JSON.stringify(process.env.VITE_HCAPTCHA_SITE_KEY || process.env.HCAPTCHA_SITE_KEY)
  },
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: [
      'gsap',
      'gsap/ScrollTrigger',
      'gsap/ScrollToPlugin'
    ],
  }
});
