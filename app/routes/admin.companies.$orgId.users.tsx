import { useLoaderData } from "@remix-run/react";
import { json } from "@remix-run/node";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  TrashIcon,
  UserPlusIcon,
  LockClosedIcon,
  LockOpenIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

// Dummy Data (replace with actual data fetching)
type UserRole = "Owner" | "Admin" | "Member" | "Viewer";
type UserStatus = "Active" | "Blocked";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  lastActive: string;
  status: UserStatus;
}

const usersData: Record<string, User[]> = {
  "org-101": [
    {
      id: "usr-001",
      name: "Alice Johnson",
      email: "alice@acme.com",
      role: "Owner",
      lastActive: "2025-07-25",
      status: "Active",
    },
    {
      id: "usr-002",
      name: "Bob Smith",
      email: "bob@acme.com",
      role: "Admin",
      lastActive: "2025-07-24",
      status: "Active",
    },
    {
      id: "usr-003",
      name: "Charlie Brown",
      email: "charlie@acme.com",
      role: "Member",
      lastActive: "2025-07-20",
      status: "Active",
    },
    {
      id: "usr-004",
      name: "Diana Prince",
      email: "diana@acme.com",
      role: "Viewer",
      lastActive: "2025-07-18",
      status: "Blocked",
    },
  ],
  "org-102": [
    {
      id: "usr-005",
      name: "Eve Green",
      email: "eve@globalsol.com",
      role: "Owner",
      lastActive: "2025-07-26",
      status: "Active",
    },
    {
      id: "usr-006",
      name: "Frank White",
      email: "frank@globalsol.com",
      role: "Member",
      lastActive: "2025-07-23",
      status: "Active",
    },
  ],
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const orgId = params.orgId;
  const users = usersData[orgId || ""] || [];
  return json({ users });
};

// Helper for conditional classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function CompanyUsersPage() {
  const { users } = useLoaderData<typeof loader>();

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-semibold text-gray-900">Users & Roles</h2>
        <button
          type="button"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add New Member
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Email
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Role
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Last Active
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {user.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.role}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.lastActive}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    className={classNames(
                      user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800",
                      "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    )}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-gray-100"
                      title="Change Role"
                    >
                      <KeyIcon className="h-5 w-5" />
                    </button>
                    {user.status === "Active" ? (
                      <button
                        type="button"
                        className="text-orange-600 hover:text-orange-900 p-1 rounded-md hover:bg-gray-100"
                        title="Block User"
                      >
                        <LockClosedIcon className="h-5 w-5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="text-green-600 hover:text-green-900 p-1 rounded-md hover:bg-gray-100"
                        title="Unblock User"
                      >
                        <LockOpenIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
                      title="Delete User"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Optional: Role Matrix */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Role Permissions Matrix</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
          <p>
            This section would display a matrix outlining what each role (Owner, Admin, Member, Viewer) can
            access and perform within this specific company's account. This can be dynamic based on your
            application's actual permission system.
          </p>
          <ul className="mt-2 list-disc list-inside space-y-1">
            <li><strong>Owner:</strong> Full control over company settings and all data.</li>
            <li><strong>Admin:</strong> Manage users, forms, reports, but not company-level billing.</li>
            <li><strong>Member:</strong> Submit forms, view reports, limited user management.</li>
            <li><strong>Viewer:</strong> Only view forms and reports.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}