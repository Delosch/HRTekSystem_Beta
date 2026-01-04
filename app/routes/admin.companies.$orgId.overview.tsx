import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  BriefcaseIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  UsersIcon,
  BoltIcon, // For engines/modules
  DocumentTextIcon, // For forms
  ChartBarIcon, // For AI reports
  CurrencyDollarIcon,
  ExclamationCircleIcon, // For invoices
} from "@heroicons/react/24/outline";
import { getCompanyProfile } from "~/models/company.model";
import { getUserProfile } from "~/models/user.model";

export function ErrorBoundary({ error }: { error: Error }) {
  return <div>Error: {error.message}</div>;
}
// Dummy Data (replace with actual data fetching)
interface CompanyOverview {
  id: string;
  name: string;
  industry: string;
  registrationDate: string;
  status: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  activeEngines: string[];
  totalSubmittedForms: number;
  totalAIReportsGenerated: number;
  invoiceRequestStatus: "Pending" | "Completed" | "Overdue";
  memberCount: number;
  activeMemberCount: number;
  isFullyOnboarded: boolean;
  isVerified: boolean;
}



export const loader = async ({ params }: LoaderFunctionArgs) => {
  const orgId = params.orgId;
  if (orgId) {
    // const company = detailedCompaniesData[orgId];
    // from db
    const company_data = await getCompanyProfile(orgId)
    // if (!company) {
    //   throw new Response("Company Overview Not Found", { status: 404 });
    // }
    const company_admin = await getUserProfile(company_data?.createdBy?.userId)
    const jstruct = {
      id: orgId,
      name: company_data?.company_name,
      industry: company_data?.industry,
      registrationDate: company_data?.createdAt,
      status: "Active",
      email: company_admin?.email,
      phone: company_admin?.phone,
      website: company_data?.website_url,
      address: company_data?.address,
      activeEngines: ["Market Analysis Tool"],
      totalSubmittedForms: 35,
      totalAIReportsGenerated: 20,
      invoiceRequestStatus: "Pending",
      memberCount: 8,
      activeMemberCount: 7,
      isFullyOnboarded: company_data?.is_onboarding_completed,
      isVerified: false,
    }
    console.log(jstruct)
    return jstruct;
  }
};

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CompanyOverviewPage() {
  const  company  = useLoaderData();
  console.log(company)
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 mb-5">Company Profile</h2>

      {/* Company Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6 mb-8">
        <div>
          <dt className="text-sm font-medium text-gray-500">Industry</dt>
          <dd className="mt-1 text-sm text-gray-900 flex items-center">
            <BriefcaseIcon className="h-4 w-4 mr-2 text-gray-500" />
            {company.industry}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
          <dd className="mt-1 text-sm text-gray-900 flex items-center">
            <CalendarDaysIcon className="h-4 w-4 mr-2 text-gray-500" />
            {company.registrationDate}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Status</dt>
          <dd className="mt-1 text-sm text-gray-900 flex items-center">
            <span
              className={classNames(
                company.status === "Active"
                  ? "bg-green-100 text-green-800"
                  : company.status === "Blocked"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800",
                "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
              )}
            >
              {company.status}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Email</dt>
          <dd className="mt-1 text-sm text-gray-900 flex items-center">
            <a href={`mailto:${company.email}`} className="text-indigo-600 hover:underline">
              {company.email}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Phone</dt>
          <dd className="mt-1 text-sm text-gray-900">{company.phone}</dd>
        </div>
        <div>
          <dt className="text-sm font-medium text-gray-500">Website</dt>
          <dd className="mt-1 text-sm text-gray-900 flex items-center">
            <GlobeAltIcon className="h-4 w-4 mr-2 text-gray-500" />
            <a href={`https://${company.website}`} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              {company.website}
            </a>
          </dd>
        </div>
        <div className="md:col-span-2 lg:col-span-3">
          <dt className="text-sm font-medium text-gray-500">Address</dt>
          <dd className="mt-1 text-sm text-gray-900">{company.address}</dd>
        </div>
      </div>

      <hr className="my-8 border-gray-200" />

      <h2 className="text-2xl font-semibold text-gray-900 mb-5">Usage & Activity</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Active Engines */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
          <BoltIcon className="h-6 w-6 text-indigo-500 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-500">Active Engines/Modules</p>
            <p className="text-lg font-semibold text-gray-900">{company.activeEngines.join(", ")}</p>
          </div>
        </div>
        {/* Total Submitted Forms */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
          <DocumentTextIcon className="h-6 w-6 text-green-500 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-500">Total Submitted Forms</p>
            <p className="text-lg font-semibold text-gray-900">{company.totalSubmittedForms}</p>
          </div>
        </div>
        {/* Total AI Reports Generated */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
          <ChartBarIcon className="h-6 w-6 text-blue-500 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-500">Total AI Reports Generated</p>
            <p className="text-lg font-semibold text-gray-900">{company.totalAIReportsGenerated}</p>
          </div>
        </div>
        {/* Invoice Request Status */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
          <CurrencyDollarIcon className="h-6 w-6 text-purple-500 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-500">Invoice Request Status</p>
            <p className="text-lg font-semibold text-gray-900">
              <span
                className={classNames(
                  company.invoiceRequestStatus === "Completed"
                    ? "text-green-600"
                    : company.invoiceRequestStatus === "Pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                )}
              >
                {company.invoiceRequestStatus}
              </span>
            </p>
          </div>
        </div>
        {/* Member Count */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
          <UsersIcon className="h-6 w-6 text-orange-500 mr-4" />
          <div>
            <p className="text-sm font-medium text-gray-500">Members (Active)</p>
            <p className="text-lg font-semibold text-gray-900">
              {company.memberCount} ({company.activeMemberCount})
            </p>
          </div>
        </div>
      </div>

      <hr className="my-8 border-gray-200" />

      <h2 className="text-2xl font-semibold text-gray-900 mb-5">Compliance & Onboarding</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Onboarded Flag */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
          {company.isFullyOnboarded ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-4" />
          ) : (
            <ExclamationCircleIcon className="h-6 w-6 text-yellow-500 mr-4" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">Onboarding Status</p>
            <p className="text-lg font-semibold text-gray-900">
              {company.isFullyOnboarded ? "Fully Onboarded" : "Pending Onboarding"}
            </p>
          </div>
        </div>
        {/* Verified Flag */}
        <div className="bg-gray-50 p-4 rounded-lg flex items-center">
          {company.isVerified ? (
            <CheckCircleIcon className="h-6 w-6 text-green-500 mr-4" />
          ) : (
            <ExclamationCircleIcon className="h-6 w-6 text-red-500 mr-4" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-500">Verification Status</p>
            <p className="text-lg font-semibold text-gray-900">
              {company.isVerified ? "Verified" : "Unverified"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
