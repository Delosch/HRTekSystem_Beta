import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  ChartPieIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  CubeTransparentIcon,
  ReceiptPercentIcon,
} from "@heroicons/react/24/outline";
import { getCompanyProfile } from "~/models/company.model"; // Import your actual function

interface CompanyDetail {
  id: string;
  name: string;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const orgId = params.orgId;
  
  if (!orgId) {
    throw new Response("Company ID not provided", { status: 404 });
  }

  try {
    // Use your actual database function instead of dummy data
    const company_data = await getCompanyProfile(orgId);
    
    if (!company_data) {
      throw new Response("Company Not Found", { status: 404 });
    }

    const company: CompanyDetail = {
      id: orgId,
      name: company_data.company_name || company_data.brand_name || "Unknown Company"
    };

    return json({ company });
  } catch (error) {
    console.error("Error loading company for layout:", error);
    throw new Response("Company Not Found", { status: 404 });
  }
};

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function OrgDetailLayout() {
  const { company } = useLoaderData<typeof loader>();

  const navItems = [
    { name: "Overview", href: "overview", icon: ChartPieIcon },
    { name: "Users & Roles", href: "users", icon: UsersIcon },
    { name: "Response Sheets", href: "engines", icon: ClipboardDocumentListIcon },
    { name: "AI Report Reviews", href: "ai-reports", icon: CubeTransparentIcon },
    { name: "Invoice Requests", href: "invoices", icon: ReceiptPercentIcon },
  ];

  return (
    <div className="bg-gray-100 min-h-full">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        {company.name} <span className="text-gray-500">({company.id})</span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sub-Navigation Sidebar */}
        <nav className="lg:w-60 flex-shrink-0 bg-white shadow-md rounded-lg p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    classNames(
                      "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                      isActive
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )
                  }
                  end // Ensures exact matching for active links
                >
                  <item.icon className="mr-3 h-5 w-5" aria-hidden="true" />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Main Content Area for nested routes */}
        <div className="flex-1">
          <Outlet /> {/* This will render the specific company page */}
        </div>
      </div>
    </div>
  );
}
