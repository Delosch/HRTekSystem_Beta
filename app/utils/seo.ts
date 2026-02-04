import { MetaFunction } from "@remix-run/node";

interface SEOConfig {
    title: string;
    description: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: string;
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}

export function generateMeta(config: SEOConfig): ReturnType<MetaFunction> {
    const {
        title,
        description,
        keywords,
        image = "https://www.hrteksystem.com/logo_icon_final.png",
        url = "https://www.hrteksystem.com",
        type = "website",
        author = "HRTek System",
        publishedTime,
        modifiedTime,
    } = config;

    const fullTitle = `${title} | HRTek System`;

    return [
        // Basic Meta Tags
        { title: fullTitle },
        { name: "description", content: description },
        { name: "keywords", content: keywords || "HR transformation, HCM, digital maturity, HR technology, workforce management" },
        { name: "author", content: author },
        { name: "robots", content: "index, follow" },
        { name: "googlebot", content: "index, follow" },
        { name: "language", content: "English" },
        { name: "revisit-after", content: "7 days" },

        // Open Graph Tags
        { property: "og:title", content: fullTitle },
        { property: "og:description", content: description },
        { property: "og:type", content: type },
        { property: "og:url", content: url },
        { property: "og:image", content: image },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },
        { property: "og:site_name", content: "HRTek System" },
        { property: "og:locale", content: "en_US" },

        // Twitter Card Tags
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@hrtek_system" },
        { name: "twitter:creator", content: "@hrtek_system" },
        { name: "twitter:title", content: fullTitle },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },

        // Article specific (if applicable)
        ...(publishedTime ? [{ property: "article:published_time", content: publishedTime }] : []),
        ...(modifiedTime ? [{ property: "article:modified_time", content: modifiedTime }] : []),

        // Additional SEO
        { name: "theme-color", content: "#000033" },
        { name: "mobile-web-app-capable", content: "yes" },
        { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
    ];
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": `https://www.hrteksystem.com${item.url}`
        }))
    };
}

export function generateFAQSchema(faqs: { question: string; answer: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

export function generateBlogPostSchema(post: {
    title: string;
    description: string;
    image: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    url: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": post.title,
        "description": post.description,
        "image": post.image,
        "author": {
            "@type": "Person",
            "name": post.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "HRTek System",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.hrteksystem.com/logo_icon_final.png"
            }
        },
        "datePublished": post.datePublished,
        "dateModified": post.dateModified || post.datePublished,
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": post.url
        }
    };
}

export function generateServiceSchema(service: {
    name: string;
    description: string;
    provider: string;
    areaServed: string;
    url: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": service.name,
        "description": service.description,
        "provider": {
            "@type": "Organization",
            "name": service.provider
        },
        "areaServed": service.areaServed,
        "url": service.url
    };
}
