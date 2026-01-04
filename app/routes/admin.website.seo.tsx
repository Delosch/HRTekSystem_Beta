import { useState } from "react";
import { Link } from "@remix-run/react";
import {
  TagIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  DocumentMagnifyingGlassIcon,
  MapIcon,
  ArrowPathIcon, // Assuming a RobotIcon, or use other generic icon
} from "@heroicons/react/24/outline";

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function SeoSettingsPage() {
  const [activeTab, setActiveTab] = useState<string>("per-page");

  // Dummy State for Per-Page SEO
  const [pageSeo, setPageSeo] = useState({
    route: "/",
    title: "Your Company - AI Solutions for B2B",
    metaDescription: "Leverage AI-driven insights to optimize your business processes and accelerate growth.",
    ogImageUrl: "/images/og-default.jpg",
    canonicalUrl: "https://www.yourcompany.com/",
    noIndex: false,
    noFollow: false,
  });

  // Dummy State for Engine Page Optimization (simplified)
  const [engineSeo, setEngineSeo] = useState({
    selectedEngine: "hcm-fit",
    engineSpecificTitle: "HCM Fit Engine - Streamline HR Processes",
    engineSpecificDescription: "Optimize talent acquisition and HR operations with our advanced HCM Fit Engine.",
    structuredData: `{ "@context": "https://schema.org", "@type": "SoftwareApplication", "name": "HCM Fit Engine", "operatingSystem": "Web", "applicationCategory": "BusinessApplication" }`,
  });

  // Dummy State for Blog SEO Config
  const [blogSeoConfig, setBlogSeoConfig] = useState({
    defaultTitlePrefix: "Blog | ",
    defaultMetaDescription: "Explore our latest insights on B2B AI, industry trends, and case studies.",
    includeAuthorInStructuredData: true,
    socialPreviewImage: "/images/social-blog-default.jpg",
  });

  // Dummy State for Robots.txt
  const [robotsTxtContent, setRobotsTxtContent] = useState(
    `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nDisallow: /admin/\nDisallow: /private/`
  );

  const handleSave = (section: string) => {
    alert(`SEO Settings for "${section}" Saved! (Action: Send data to API)`);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-5">SEO & Metadata</h2>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("per-page")}
            className={classNames(
              activeTab === "per-page"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm"
            )}
          >
            Per-Page SEO
          </button>
          <button
            onClick={() => setActiveTab("engine-optimization")}
            className={classNames(
              activeTab === "engine-optimization"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm"
            )}
          >
            Engine Page SEO
          </button>
          <button
            onClick={() => setActiveTab("blog-config")}
            className={classNames(
              activeTab === "blog-config"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm"
            )}
          >
            Blog SEO Config
          </button>
          <button
            onClick={() => setActiveTab("sitemap")}
            className={classNames(
              activeTab === "sitemap"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm"
            )}
          >
            Sitemap
          </button>
          <button
            onClick={() => setActiveTab("robots-txt")}
            className={classNames(
              activeTab === "robots-txt"
                ? "border-indigo-500 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
              "whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm"
            )}
          >
            Robots.txt
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Per-Page SEO */}
        {activeTab === "per-page" && (
          <section className="space-y-4">
            <h3 className="text-xl font-medium text-gray-800 flex items-center mb-4">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 mr-2 text-indigo-500" /> Per-Page SEO
            </h3>
            <div>
              <label htmlFor="routeSelector" className="block text-sm font-medium text-gray-700 mb-1">Select Route</label>
              <select
                id="routeSelector"
                value={pageSeo.route}
                onChange={(e) => setPageSeo({ ...pageSeo, route: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="/">Home Page</option>
                <option value="/blogs">Blogs Listing</option>
                <option value="/contact">Contact Us</option>
                <option value="/engines/hcm-fit">HCM Fit Engine</option>
                {/* Add more routes dynamically from your app */}
              </select>
            </div>
            <div>
              <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                id="pageTitle"
                value={pageSeo.title}
                onChange={(e) => setPageSeo({ ...pageSeo, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Page Title"
              />
            </div>
            <div>
              <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                id="metaDescription"
                value={pageSeo.metaDescription}
                onChange={(e) => setPageSeo({ ...pageSeo, metaDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="A concise summary of the page content for search engines."
              />
            </div>
            <div>
              <label htmlFor="ogImageUrl" className="block text-sm font-medium text-gray-700 mb-1">OG Image URL (for Social Sharing)</label>
              <input
                type="text"
                id="ogImageUrl"
                value={pageSeo.ogImageUrl}
                onChange={(e) => setPageSeo({ ...pageSeo, ogImageUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="/images/default-og.jpg"
              />
            </div>
            <div>
              <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 mb-1">Canonical URL</label>
              <input
                type="text"
                id="canonicalUrl"
                value={pageSeo.canonicalUrl}
                onChange={(e) => setPageSeo({ ...pageSeo, canonicalUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="https://www.yourwebsite.com/page"
              />
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noIndex"
                  checked={pageSeo.noIndex}
                  onChange={(e) => setPageSeo({ ...pageSeo, noIndex: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="noIndex" className="ml-2 block text-sm text-gray-900">NoIndex</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="noFollow"
                  checked={pageSeo.noFollow}
                  onChange={(e) => setPageSeo({ ...pageSeo, noFollow: e.target.checked })}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="noFollow" className="ml-2 block text-sm text-gray-900">NoFollow</label>
              </div>
            </div>
            <button
              onClick={() => handleSave("Per-Page SEO")}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
            >
              Save Per-Page SEO
            </button>
          </section>
        )}

        {/* Engine Page Optimization */}
        {activeTab === "engine-optimization" && (
          <section className="space-y-4">
            <h3 className="text-xl font-medium text-gray-800 flex items-center mb-4">
              <PencilSquareIcon className="h-6 w-6 mr-2 text-indigo-500" /> Engine Page Optimization
            </h3>
            <div>
              <label htmlFor="engineSelector" className="block text-sm font-medium text-gray-700 mb-1">Select Engine</label>
              <select
                id="engineSelector"
                value={engineSeo.selectedEngine}
                onChange={(e) => setEngineSeo({ ...engineSeo, selectedEngine: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="hcm-fit">HCM Fit Engine</option>
                <option value="shared-services">Shared Services Engine</option>
                {/* Add more engines dynamically */}
              </select>
            </div>
            <div>
              <label htmlFor="engineTitle" className="block text-sm font-medium text-gray-700 mb-1">Specific Title</label>
              <input
                type="text"
                id="engineTitle"
                value={engineSeo.engineSpecificTitle}
                onChange={(e) => setEngineSeo({ ...engineSeo, engineSpecificTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="engineDescription" className="block text-sm font-medium text-gray-700 mb-1">Specific Meta Description</label>
              <textarea
                id="engineDescription"
                value={engineSeo.engineSpecificDescription}
                onChange={(e) => setEngineSeo({ ...engineSeo, engineSpecificDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label htmlFor="structuredData" className="block text-sm font-medium text-gray-700 mb-1">Structured Data (JSON-LD)</label>
              <textarea
                id="structuredData"
                value={engineSeo.structuredData}
                onChange={(e) => setEngineSeo({ ...engineSeo, structuredData: e.target.value })}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="{ ... JSON-LD for this engine ... }"
              />
            </div>
            <button
              onClick={() => handleSave("Engine Page Optimization")}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
            >
              Save Engine SEO
            </button>
          </section>
        )}

        {/* Blog SEO Config */}
        {activeTab === "blog-config" && (
          <section className="space-y-4">
            <h3 className="text-xl font-medium text-gray-800 flex items-center mb-4">
              <TagIcon className="h-6 w-6 mr-2 text-indigo-500" /> Blog SEO Configuration
            </h3>
            <div>
              <label htmlFor="defaultBlogTitlePrefix" className="block text-sm font-medium text-gray-700 mb-1">Default Title Prefix</label>
              <input
                type="text"
                id="defaultBlogTitlePrefix"
                value={blogSeoConfig.defaultTitlePrefix}
                onChange={(e) => setBlogSeoConfig({ ...blogSeoConfig, defaultTitlePrefix: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Blog | "
              />
            </div>
            <div>
              <label htmlFor="defaultBlogMetaDescription" className="block text-sm font-medium text-gray-700 mb-1">Default Meta Description</label>
              <textarea
                id="defaultBlogMetaDescription"
                value={blogSeoConfig.defaultMetaDescription}
                onChange={(e) => setBlogSeoConfig({ ...blogSeoConfig, defaultMetaDescription: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Explore our latest insights..."
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="includeAuthorInStructuredData"
                checked={blogSeoConfig.includeAuthorInStructuredData}
                onChange={(e) => setBlogSeoConfig({ ...blogSeoConfig, includeAuthorInStructuredData: e.target.checked })}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="includeAuthorInStructuredData" className="ml-2 block text-sm text-gray-900">Include Author in Structured Data (JSON-LD)</label>
            </div>
            <div>
              <label htmlFor="socialPreviewImage" className="block text-sm font-medium text-gray-700 mb-1">Default Social Preview Image URL</label>
              <input
                type="text"
                id="socialPreviewImage"
                value={blogSeoConfig.socialPreviewImage}
                onChange={(e) => setBlogSeoConfig({ ...blogSeoConfig, socialPreviewImage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="/images/social-blog-default.jpg"
              />
            </div>
            <button
              onClick={() => handleSave("Blog SEO Config")}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mt-4"
            >
              Save Blog SEO Config
            </button>
          </section>
        )}

        {/* Sitemap */}
        {activeTab === "sitemap" && (
          <section className="space-y-4">
            <h3 className="text-xl font-medium text-gray-800 flex items-center mb-4">
              <MapIcon className="h-6 w-6 mr-2 text-indigo-500" /> Sitemap Management
            </h3>
            <p className="text-gray-600">
              Manage your website's XML sitemap for search engines.
            </p>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Sitemap:</p>
                <Link to="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  /sitemap.xml
                </Link>
              </div>
              <button
                type="button"
                onClick={() => alert("Sitemap regenerated! (Action: Trigger backend regeneration)")}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" /> Regenerate Sitemap
              </button>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
              <h4 className="text-lg font-medium text-gray-800 mb-2">Sitemap Inclusion/Exclusion (Advanced)</h4>
              <p className="text-sm text-gray-600 mb-2">
                Specify pages or sections to include or exclude from your sitemap. This usually requires backend logic.
              </p>
              <div className="flex items-center space-x-4">
                {/* Dummy for show/hide inputs */}
                <input type="text" placeholder="/old-pages/" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                <button className="px-3 py-2 bg-red-500 text-white rounded-md">Exclude</button>
              </div>
            </div>
          </section>
        )}

        {/* Robots.txt */}
        {activeTab === "robots-txt" && (
          <section className="space-y-4">
            <h3 className="text-xl font-medium text-gray-800 flex items-center mb-4">
              <GlobeAltIcon className="h-6 w-6 mr-2 text-indigo-500" /> Robots.txt Editor
            </h3>
            <p className="text-gray-600">
              Edit your `robots.txt` file directly. Be careful, incorrect settings can impact search engine visibility.
            </p>
            <div>
              <label htmlFor="robotsTxtEditor" className="sr-only">Robots.txt Content</label>
              <textarea
                id="robotsTxtEditor"
                value={robotsTxtContent}
                onChange={(e) => setRobotsTxtContent(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-xs bg-gray-50 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => alert("Robots.txt saved! (Action: Update file on server)")}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Robots.txt
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
