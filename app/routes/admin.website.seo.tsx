import { useState, useEffect } from "react";
import { ActionFunction, LoaderFunction, json } from "@remix-run/node";
import { Link, useLoaderData, useFetcher } from "@remix-run/react";
import { getPageSeo, updatePageSeo } from "~/models/seo.server";
import {
  TagIcon,
  GlobeAltIcon,
  PencilSquareIcon,
  DocumentMagnifyingGlassIcon,
  MapIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const route = url.searchParams.get("route") || "/";
  const seoData = await getPageSeo(route);

  // Return default structure if null
  const safeData = seoData || {
    route,
    title: "",
    description: "",
    keywords: "",
    ogImage: "",
    canonical: "",
    noIndex: false,
    noFollow: false
  };

  return json({ seoData: safeData, route });
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "savePageSeo") {
    const route = formData.get("route") as string;
    const title = formData.get("title") as string;
    const description = formData.get("metaDescription") as string;
    const ogImage = formData.get("ogImageUrl") as string;
    const canonical = formData.get("canonicalUrl") as string;
    const noIndex = formData.get("noIndex") === "on";
    const noFollow = formData.get("noFollow") === "on";

    await updatePageSeo({
      route,
      title,
      description,
      ogImage,
      canonical,
      noIndex,
      noFollow
    });

    return json({ success: true, message: `SEO for ${route} saved successfully!` });
  }

  // Handle other intents (Engine, Blog) similarly if needed
  return json({ success: false, message: "Invalid intent" });
};

export default function SeoSettingsPage() {
  const { seoData: initialSeoData, route: initialRoute } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<string>("per-page");
  // Define type for fetcher data
  type FetcherData = {
    seoData?: typeof initialSeoData;
    message?: string;
  };
  const fetcher = useFetcher<FetcherData>();

  // Route selector state
  const [selectedRoute, setSelectedRoute] = useState(initialRoute);

  // Form State
  const [pageSeo, setPageSeo] = useState(initialSeoData);

  // Sync state when data is loaded via fetcher or initial loader
  useEffect(() => {
    if (fetcher.data?.seoData) {
      setPageSeo(fetcher.data.seoData);
    } else if (fetcher.state === "idle" && !fetcher.data && selectedRoute === initialRoute) {
      // Fallback to initial if fetcher hasn't run yet
      setPageSeo(initialSeoData);
    }
  }, [fetcher.data, fetcher.state, initialSeoData, initialRoute, selectedRoute]);

  const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRoute = e.target.value;
    setSelectedRoute(newRoute);
    fetcher.load(`.?route=${encodeURIComponent(newRoute)}`);
  };

  const isSaving = fetcher.state === "submitting";

  // Pre-defined routes list for convenience
  const routesList = [
    { label: "Home Page", value: "/" },
    { label: "Contact Us", value: "/contact" },
    { label: "About Us", value: "/about-us" },
    { label: "Services: HCM", value: "/hcm-service" },
    { label: "Services: Roadmap", value: "/roadmap-service" },
    { label: "Services: Shared Service", value: "/shared-service" },
    { label: "Services: Maturity Analysis", value: "/maturity-analysis-service" },
    { label: "Services: Change Management", value: "/change-management-service" },
    { label: "Services: HR Tech Advisory", value: "/hrtech-advisory-service" },
    { label: "Pricing", value: "/pricing" },
    { label: "Careers", value: "/careers" },
    { label: "Blog Listing", value: "/blog" },
    { label: "Testimonials", value: "/testimonials" },
  ];

  return (
    <div className="bg-white shadow-md rounded-lg p-6 font-outfit">
      <h2 className="text-2xl font-semibold text-gray-900 mb-5 flex items-center justify-between">
        <span>SEO & Metadata Manager</span>
        {fetcher.data?.message && (
          <span className="text-sm font-medium text-green-600 animate-fade-in bg-green-50 px-3 py-1 rounded-full">
            {fetcher.data.message}
          </span>
        )}
      </h2>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6 w-full overflow-x-auto">
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
      <div className="min-h-[400px]">
        {/* Per-Page SEO */}
        {activeTab === "per-page" && (
          <section className="space-y-6 max-w-4xl">
            <h3 className="text-xl font-medium text-gray-800 flex items-center mb-4 border-b pb-2">
              <DocumentMagnifyingGlassIcon className="h-6 w-6 mr-2 text-indigo-500" />
              Page Metadata Editor
            </h3>

            <fetcher.Form method="post" className="space-y-6">
              <input type="hidden" name="intent" value="savePageSeo" />

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <label htmlFor="routeSelector" className="block text-sm font-bold text-gray-700 mb-2">Select Page to Edit</label>
                <select
                  id="routeSelector"
                  name="route"
                  value={selectedRoute}
                  onChange={handleRouteChange}
                  className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 font-medium text-gray-900"
                >
                  {routesList.map(r => (
                    <option key={r.value} value={r.value}>{r.label} ({r.value})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label htmlFor="pageTitle" className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                  <input
                    type="text"
                    name="title"
                    id="pageTitle"
                    value={pageSeo.title}
                    onChange={(e) => setPageSeo({ ...pageSeo, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    placeholder="e.g. Home - HRTek System"
                  />
                  <p className="mt-1 text-xs text-gray-500">Recommended length: 50-60 characters</p>
                </div>

                <div>
                  <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    name="metaDescription"
                    id="metaDescription"
                    value={pageSeo.description}
                    onChange={(e) => setPageSeo({ ...pageSeo, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    placeholder="A concise summary of the page content..."
                  />
                  <p className="mt-1 text-xs text-gray-500">Recommended length: 150-160 characters</p>
                </div>

                <div>
                  <label htmlFor="ogImageUrl" className="block text-sm font-medium text-gray-700 mb-1">OG Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="ogImageUrl"
                      id="ogImageUrl"
                      value={pageSeo.ogImage}
                      onChange={(e) => setPageSeo({ ...pageSeo, ogImage: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                      placeholder="https://www.hrteksystem.com/og-image.jpg"
                    />
                    <Link to="/admin/website/branding" className="px-3 py-2 bg-gray-100 border rounded hover:bg-gray-200 text-xs flex items-center">Media</Link>
                  </div>
                </div>

                <div>
                  <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 mb-1">Canonical URL override</label>
                  <input
                    type="text"
                    name="canonicalUrl"
                    id="canonicalUrl"
                    value={pageSeo.canonical}
                    onChange={(e) => setPageSeo({ ...pageSeo, canonical: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    placeholder="Leave blank to use default (https://www.hrteksystem.com{page})"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-6 bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="noIndex"
                    id="noIndex"
                    checked={pageSeo.noIndex}
                    onChange={(e) => setPageSeo({ ...pageSeo, noIndex: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="noIndex" className="ml-2 block text-sm text-gray-900 font-medium">NoIndex</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="noFollow"
                    id="noFollow"
                    checked={pageSeo.noFollow}
                    onChange={(e) => setPageSeo({ ...pageSeo, noFollow: e.target.checked })}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="noFollow" className="ml-2 block text-sm text-gray-900 font-medium">NoFollow</label>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex justify-center py-3 px-6 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 transition-all"
                >
                  {isSaving ? "Saving..." : "Save SEO Settings"}
                </button>
              </div>
            </fetcher.Form>
          </section>
        )}

        {/* Placeholders for other tabs to avoid errors, keeping structure */}
        {activeTab !== "per-page" && (
          <div className="text-center py-10 text-gray-500">
            <p>Advanced configuration for {activeTab} is coming in the next update.</p>
            <p className="text-sm">Please use Per-Page SEO for now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
