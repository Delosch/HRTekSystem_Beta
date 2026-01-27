import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = () => {
    const baseUrl = "https://hrteksystem.com";

    const routes = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/about-us", priority: "0.9", changefreq: "monthly" },
        { url: "/careers", priority: "0.8", changefreq: "weekly" },
        { url: "/blog", priority: "0.9", changefreq: "weekly" },
        { url: "/pricing", priority: "1.0", changefreq: "weekly" },
        { url: "/contact", priority: "0.9", changefreq: "monthly" },
        { url: "/testimonials", priority: "0.8", changefreq: "monthly" },
        { url: "/video-tutorials", priority: "0.8", changefreq: "weekly" },

        // Service Pages
        { url: "/roadmap-service", priority: "0.9", changefreq: "monthly" },
        { url: "/hcm-service", priority: "0.9", changefreq: "monthly" },
        { url: "/shared-service", priority: "0.9", changefreq: "monthly" },
        { url: "/maturity-analysis-service", priority: "0.9", changefreq: "monthly" },
        { url: "/change-management-service", priority: "0.9", changefreq: "monthly" },
        { url: "/hrtech-advisory-service", priority: "0.9", changefreq: "monthly" },

        // Legal Pages
        { url: "/legal/term", priority: "0.5", changefreq: "yearly" },
        { url: "/legal/privacy", priority: "0.5", changefreq: "yearly" },
        { url: "/legal/cookie", priority: "0.5", changefreq: "yearly" },
        { url: "/legal/gdpr", priority: "0.5", changefreq: "yearly" },
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
${routes
            .map(
                (route) => `  <url>
    <loc>${baseUrl}${route.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
            )
            .join("\n")}
</urlset>`;

    return new Response(sitemap, {
        status: 200,
        headers: {
            "Content-Type": "application/xml",
            "xml-version": "1.0",
            "encoding": "UTF-8",
            "Cache-Control": "public, max-age=3600",
        },
    });
};
