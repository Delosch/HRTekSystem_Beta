# Batch SEO Update Script

This document contains the exact code changes needed for each remaining page.

## Pricing Page (`app/routes/pricing.tsx`)

### Add to imports:
```typescript
import { generateMeta, generateBreadcrumbSchema } from "~/utils/seo";
```

### Replace meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "Pricing Plans - Affordable HR Transformation Solutions",
    description: "Explore HRTek System's flexible pricing plans for HR transformation. Choose from Starter, Professional, or Enterprise packages. Transparent pricing with no hidden fees.",
    keywords: "HR software pricing, HCM pricing, HR transformation cost, affordable HR solutions, enterprise HR pricing",
    url: "https://hrteksystem.com/pricing",
    image: "https://hrteksystem.com/og-pricing.jpg",
  });
};
```

### Add breadcrumb in component:
```typescript
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Pricing", url: "/pricing" }
]);

// In JSX:
<link rel="canonical" href="https://hrteksystem.com/pricing" />
<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
```

---

## Careers Page (`app/routes/careers.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "Careers at HRTek System - Join Our Team",
    description: "Explore exciting career opportunities at HRTek System. Join our innovative team transforming HR technology. We're hiring talented professionals passionate about HR innovation.",
    keywords: "HRTek careers, HR tech jobs, join HRTek, HR technology careers, work at HRTek",
    url: "https://hrteksystem.com/careers",
    image: "https://hrteksystem.com/og-careers.jpg",
  });
};
```

---

## Testimonials Page (`app/routes/testimonials.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "Client Testimonials - Success Stories | HRTek System",
    description: "Read what our clients say about HRTek System. Discover success stories from organizations that transformed their HR operations with our AI-powered solutions.",
    keywords: "HRTek testimonials, client reviews, success stories, customer feedback, HR transformation results",
    url: "https://hrteksystem.com/testimonials",
    image: "https://hrteksystem.com/og-testimonials.jpg",
  });
};
```

---

## Video Tutorials Page (`app/routes/video-tutorials.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "Video Tutorials - Learn HRTek System",
    description: "Watch our comprehensive video tutorials to master HRTek System. Step-by-step guides for HR transformation, assessment tools, and platform features.",
    keywords: "HRTek tutorials, HR software training, video guides, how to use HRTek, platform tutorials",
    url: "https://hrteksystem.com/video-tutorials",
    image: "https://hrteksystem.com/og-tutorials.jpg",
  });
};
```

---

## Roadmap Service Page (`app/routes/roadmap-service.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HR Transformation Roadmap Generator - Strategic Planning",
    description: "Generate AI-powered HR transformation roadmaps tailored to your organization. Strategic planning with ROI focus, timeline optimization, and actionable milestones.",
    keywords: "HR roadmap, transformation planning, HR strategy, digital roadmap, HR transformation timeline",
    url: "https://hrteksystem.com/roadmap-service",
    image: "https://hrteksystem.com/og-roadmap.jpg",
  });
};
```

### Service Schema:
```typescript
const serviceSchema = generateServiceSchema({
  name: "HR Transformation Roadmap Generator",
  description: "AI-powered strategic roadmap generation for HR digital transformation",
  provider: "HRTek System",
  areaServed: "Global",
  url: "https://hrteksystem.com/roadmap-service"
});
```

---

## HCM Service Page (`app/routes/hcm-service.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HCM Vendor Selection Engine - Find Your Perfect Match",
    description: "AI-powered HCM vendor matching that analyzes your needs and recommends the best HR technology solutions. Save time and make confident decisions with our cognitive selection engine.",
    keywords: "HCM vendor selection, HR software selection, HCM comparison, vendor matching, HRIS selection",
    url: "https://hrteksystem.com/hcm-service",
    image: "https://hrteksystem.com/og-hcm.jpg",
  });
};
```

### Service Schema:
```typescript
const serviceSchema = generateServiceSchema({
  name: "HCM Vendor Fit Engine",
  description: "Cognitive Selection Engine for HCM vendor matching and evaluation",
  provider: "HRTek System",
  areaServed: "Global",
  url: "https://hrteksystem.com/hcm-service"
});
```

---

## Shared Service Page (`app/routes/shared-service.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HR Shared Services Designer - Optimize Service Delivery",
    description: "Design and optimize your HR shared services model. Improve efficiency, reduce costs, and enhance employee experience with our architectural planning tools.",
    keywords: "HR shared services, service delivery model, HR operations, shared service center, HR optimization",
    url: "https://hrteksystem.com/shared-service",
    image: "https://hrteksystem.com/og-shared.jpg",
  });
};
```

---

## Maturity Analysis Service (`app/routes/maturity-analysis-service.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HR Digital Maturity Analysis - Benchmark Your Progress",
    description: "Assess your HR technology maturity with AI-driven diagnostics. Benchmark against industry standards, identify gaps, and get actionable recommendations.",
    keywords: "HR maturity assessment, digital maturity, HR benchmarking, technology assessment, HR diagnostics",
    url: "https://hrteksystem.com/maturity-analysis-service",
    image: "https://hrteksystem.com/og-maturity.jpg",
  });
};
```

---

## Change Management Service (`app/routes/change-management-service.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "Intelligent Change Management - Smooth HR Transformation",
    description: "Navigate HR transformation with intelligent change management. AI-powered adoption strategies, stakeholder engagement, and smooth transition planning.",
    keywords: "change management, HR transformation, adoption strategy, organizational change, change leadership",
    url: "https://hrteksystem.com/change-management-service",
    image: "https://hrteksystem.com/og-change.jpg",
  });
};
```

---

## HR Tech Advisory Service (`app/routes/hrtech-advisory-service.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HR Tech Advisory - Expert Strategic Guidance",
    description: "Get expert HR technology advisory services. Strategic guidance for technology selection, implementation planning, and digital transformation success.",
    keywords: "HR tech advisory, HR consulting, technology consulting, HR strategy, digital advisory",
    url: "https://hrteksystem.com/hrtech-advisory-service",
    image: "https://hrteksystem.com/og-advisory.jpg",
  });
};
```

---

## Recommendation Page (`app/routes/recommendation.tsx`)

### Meta function:
```typescript
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "HR Recommendations - Personalized Insights",
    description: "Get personalized HR transformation recommendations based on your assessment. AI-powered insights tailored to your organization's needs and goals.",
    keywords: "HR recommendations, personalized insights, HR advice, transformation guidance",
    url: "https://hrteksystem.com/recommendation",
    image: "https://hrteksystem.com/og-recommendation.jpg",
  });
};
```

---

## Implementation Checklist

For EACH page above:

1. ✅ Add import: `import { generateMeta, generateBreadcrumbSchema, generateServiceSchema } from "~/utils/seo";`
2. ✅ Replace the meta function with the code above
3. ✅ Add breadcrumb schema in the component
4. ✅ Update canonical URL to full URL
5. ✅ Add service schema (for service pages only)
6. ✅ Optimize images with alt tags and lazy loading

---

## Quick Reference Pattern

```typescript
// 1. Imports
import { generateMeta, generateBreadcrumbSchema } from "~/utils/seo";

// 2. Meta
export const meta: MetaFunction = () => {
  return generateMeta({
    title: "Page Title",
    description: "Description",
    keywords: "keywords",
    url: "https://hrteksystem.com/page",
    image: "https://hrteksystem.com/og-image.jpg",
  });
};

// 3. In Component
const breadcrumbSchema = generateBreadcrumbSchema([
  { name: "Home", url: "/" },
  { name: "Page", url: "/page" }
]);

return (
  <>
    <link rel="canonical" href="https://hrteksystem.com/page" />
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
    {/* Rest of page */}
  </>
);
```

---

## Pages Status

- [x] Homepage
- [x] Blog
- [x] Contact
- [x] About Us
- [ ] Pricing
- [ ] Careers
- [ ] Testimonials
- [ ] Video Tutorials
- [ ] Roadmap Service
- [ ] HCM Service
- [ ] Shared Service
- [ ] Maturity Analysis Service
- [ ] Change Management Service
- [ ] HR Tech Advisory Service
- [ ] Recommendation

**Progress: 4/15 pages (27%)**
