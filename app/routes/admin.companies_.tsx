import { useLoaderData, useFetcher } from "@remix-run/react";
import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  ChevronUpDownIcon,
  EyeIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getAllCompanyProfiles } from "~/models/company.model.server";

// Types
type CompanyStatus = "Active" | "Pending Verification";
interface Company {
  id: string;
  name: string;
  industry: string;
  registrationDate: string;
  status: CompanyStatus;
  totalMembers: number;
}

// Helper for class names
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// Loader -- now supports query params for searching/filtering/sorting
export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const pageKey = url.searchParams.get("pageKey");
  const limit = parseInt(url.searchParams.get("limit") || "2");
  const search = url.searchParams.get("search")?.toLowerCase() || "";
  const industry = url.searchParams.get("industry") || "";
  const status = url.searchParams.get("status") || "";
  const sortBy = url.searchParams.get("sortBy") || "name";
  const sortDir = url.searchParams.get("sortDir") || "asc";

  // Use your GSI for efficient fetching (profile_type-index)
  const data = await getAllCompanyProfiles(limit, pageKey);

  if (!data) {
    return json({ companies: [], lastKey: null, hasMore: false });
  }

  // Map only COMPANY items and shape to Company interface
  let companies = data.items
    .filter((item: any) => item.profile_type === "COMPANY") // GSI result - only COMPANY
    .map((item: any) => ({
      id: item.pk?.split("#")[1] || item.pk || "unknown",
      name: item.company_name || item.brand_name || "Unknown Company",
      industry: item.industry || "Not Specified",
      registrationDate: item.createdAt
        ? new Date(item.createdAt).toISOString().split("T")
        : "Unknown",
      status: item.is_onboarding_completed ? "Active" : "Pending Verification",
      totalMembers: item.total_members || 0,
    }));

  // Simple filters
  if (search) {
    companies = companies.filter(c =>
      c.name.toLowerCase().includes(search) ||
      c.industry.toLowerCase().includes(search)
    );
  }
  if (industry) {
    companies = companies.filter(c => c.industry === industry);
  }
  if (status) {
    companies = companies.filter(c => c.status === status);
  }

  // Basic sorting
  companies.sort((a, b) => {
    let vA = a[sortBy as keyof Company], vB = b[sortBy as keyof Company];
    if (sortBy === "registrationDate") {
      vA = new Date(a.registrationDate).getTime();
      vB = new Date(b.registrationDate).getTime();
    }
    if (vA < vB) return sortDir === "asc" ? -1 : 1;
    if (vA > vB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return json({
    companies,
    lastKey: data.lastKey,
    hasMore: !!data.lastKey
  });
};

export default function CompaniesIndexPage() {
  const { companies: initialCompanies, lastKey: initialLastKey, hasMore: initialHasMore } =
    useLoaderData<typeof loader>();

  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [lastKey, setLastKey] = useState<string | null>(initialLastKey);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [search, setSearch] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc"|"desc">("asc");
  const fetcher = useFetcher<typeof loader>();

  // Pagination
  const loadMore = () => {
    const params = new URLSearchParams({
      pageKey: lastKey ?? "",
      limit: "10",
      search,
      industry,
      status,
      sortBy,
      sortDir
    });
    fetcher.load(`/admin/companies?${params.toString()}`);
  };
  useEffect(() => {
    if (fetcher.data && fetcher.data.companies) {
      setCompanies((prev) => [...prev, ...fetcher.data.companies]);
      setLastKey(fetcher.data.lastKey);
      setHasMore(fetcher.data.hasMore);
    }
  }, [fetcher.data]);

  const handleFilter = () => {
    setCompanies([]);
    setLastKey(null);
    setHasMore(false);
    const params = new URLSearchParams({
      limit: "10",
      search,
      industry,
      status,
      sortBy,
      sortDir
    });
    fetcher.load(`/admin/companies?${params.toString()}`);
  };

  // Sorting - toggle direction on header click
  const handleSort = (field: keyof Company) => {
    if (sortBy === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
    handleFilter();
  };

  return (
    <div className="bg-gray-100 min-h-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">All Companies</h1>
      </div>
      <div className="bg-white shadow-md rounded-lg p-6">
        {/* Search + Filters */}
        <div className="mb-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <select value={industry} onChange={e => setIndustry(e.target.value)} className="flex-shrink-0 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Industries</option>
            <option value="Technology">Technology</option>
            <option value="Consulting">Consulting</option>
            <option value="Construction">Construction</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Retail">Retail</option>
          </select>
          <select value={status} onChange={e => setStatus(e.target.value)} className="flex-shrink-0 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500">
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Pending Verification">Pending Verification</option>
          </select>
          <button
            onClick={handleFilter}
            className="px-4 py-2 bg-indigo-600 rounded text-white text-sm font-semibold shadow hover:bg-indigo-700"
          >
            Filter
          </button>
        </div>
        {/* Companies Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Company Name
                    <ChevronUpDownIcon className="ml-1 h-4 w-4 text-gray-400" />
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("industry")}
                >
                  Industry
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("registrationDate")}
                >
                  Registration Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Members
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">View</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {companies.map((company) => (
                <tr key={company.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {company.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.registrationDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                      className={classNames(
                        company.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800",
                        "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                      )}
                    >
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.totalMembers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a
                      href={`/admin/companies/${company.id}/overview`}
                      className="text-indigo-600 hover:text-indigo-900 inline-flex items-center"
                    >
                      <EyeIcon className="h-5 w-5 mr-1" /> View
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination Controls */}
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {companies.length} companies
          </div>
          <div className="flex gap-3">
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={fetcher.state === "loading"}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {fetcher.state === "loading" ? (
                  <>
                    <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
