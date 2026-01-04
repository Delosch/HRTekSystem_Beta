import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { Sparkles, TrendingUp } from "lucide-react";
import { RoleCard } from "~/components/RoleCard";
import { PermissionEditor } from "~/components/PermissionEditor";
import { ROLE_DEFINITIONS, type AdminRole, type Permission } from "~/lib/permissions";

// Types
type AdminStatus = "Active" | "Suspended";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  lastLogin: string;
}

// Dummy Data
const dummyAdminUsers: AdminUser[] = [
  {
    id: "admin-001",
    name: "Platform Administrator",
    email: "admin@yourcompany.com",
    role: "Super Admin",
    status: "Active",
    lastLogin: "2025-12-26 10:00 AM",
  },
  {
    id: "admin-002",
    name: "Emily White",
    email: "emily.w@yourcompany.com",
    role: "Company Manager",
    status: "Active",
    lastLogin: "2025-12-25 03:30 PM",
  },
  {
    id: "admin-003",
    name: "David Green",
    email: "david.g@yourcompany.com",
    role: "Content Editor",
    status: "Active",
    lastLogin: "2025-12-24 11:00 AM",
  },
  {
    id: "admin-004",
    name: "Sophia Chen",
    email: "sophia.c@yourcompany.com",
    role: "SEO Analyst",
    status: "Suspended",
    lastLogin: "2025-12-15 09:00 AM",
  },
  {
    id: "admin-005",
    name: "Michael Brown",
    email: "michael.b@yourcompany.com",
    role: "Finance Admin",
    status: "Active",
    lastLogin: "2025-12-26 09:15 AM",
  },
];

export const loader = async () => {
  return json({ adminUsers: dummyAdminUsers });
};

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function AdminRolesPage() {
  const { adminUsers } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState<string>("roles-permissions");
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [sendEmailNotification, setSendEmailNotification] = useState(true);
  const [newAdmin, setNewAdmin] = useState({
    name: "",
    email: "",
    role: "Content Editor" as AdminRole,
  });

  // Permission Editor State
  const [editingRole, setEditingRole] = useState<AdminRole | null>(null);
  const [rolePermissions, setRolePermissions] = useState<Record<AdminRole, Permission[]>>(
    Object.fromEntries(
      Object.entries(ROLE_DEFINITIONS).map(([role, data]) => [role, data.permissions])
    ) as Record<AdminRole, Permission[]>
  );

  // Users viewing state
  const [viewingUsersForRole, setViewingUsersForRole] = useState<AdminRole | null>(null);

  const handleEditAdmin = (adminId: string) => {
    alert(`Edit admin user: ${adminId} (Action: Open edit form/modal)`);
  };

  const handleToggleStatus = (adminId: string, currentStatus: AdminStatus) => {
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    alert(`Admin user: ${adminId} status changed to ${newStatus}!`);
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm("Are you sure you want to delete this admin user?")) {
      alert(`Admin user: ${adminId} deleted!`);
    }
  };

  const handleAddAdmin = () => {
    if (!newAdmin.name || !newAdmin.email) {
      alert("Please fill in all required fields");
      return;
    }

    if (sendEmailNotification) {
      alert(`✉️ Welcome email sent to ${newAdmin.email}`);
    }

    alert(`✅ New admin created successfully!\n\nName: ${newAdmin.name}\nEmail: ${newAdmin.email}\nRole: ${newAdmin.role}`);
    setShowAddAdminModal(false);
    setNewAdmin({ name: "", email: "", role: "Content Editor" });
    setSendEmailNotification(true);
  };

  const handleViewActivity = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setShowActivityLog(true);
  };

  const handleSavePermissions = (role: AdminRole, permissions: Permission[]) => {
    setRolePermissions(prev => ({ ...prev, [role]: permissions }));
    alert(`✅ Permissions updated for ${role}!`);
  };

  // Get user count for each role
  const getRoleUserCount = (role: AdminRole) => {
    return adminUsers.filter(u => u.role === role).length;
  };

  // Get users for a specific role
  const getUsersForRole = (role: AdminRole) => {
    return adminUsers.filter(u => u.role === role);
  };

  // Calculate stats
  const totalAdmins = adminUsers.length;
  const activeAdmins = adminUsers.filter(u => u.status === "Active").length;
  const totalRoles = Object.keys(ROLE_DEFINITIONS).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <ShieldCheckIcon className="w-10 h-10 text-indigo-600" />
                Admin Roles & Permissions
              </h1>
              <p className="text-gray-600">Manage access control and permissions for admin users</p>
            </div>
            <button
              onClick={() => setShowAddAdminModal(true)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105"
            >
              <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add New Admin
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-indigo-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Admins</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalAdmins}</p>
                </div>
                <UserGroupIcon className="w-12 h-12 text-indigo-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Users</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{activeAdmins}</p>
                </div>
                <TrendingUp className="w-12 h-12 text-green-500 opacity-50" />
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Roles</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{totalRoles}</p>
                </div>
                <Sparkles className="w-12 h-12 text-purple-500 opacity-50" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-md mb-6">
          <nav className="flex border-b border-gray-200" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("roles-permissions")}
              className={classNames(
                activeTab === "roles-permissions"
                  ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                "flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm transition-all duration-200"
              )}
            >
              <ShieldCheckIcon className="h-5 w-5 inline-block mr-2 -mt-0.5" />
              Roles & Permissions
            </button>
            <button
              onClick={() => setActiveTab("admin-users")}
              className={classNames(
                activeTab === "admin-users"
                  ? "border-indigo-500 text-indigo-600 bg-indigo-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50",
                "flex-1 whitespace-nowrap py-4 px-6 border-b-2 font-semibold text-sm transition-all duration-200"
              )}
            >
              <UserGroupIcon className="h-5 w-5 inline-block mr-2 -mt-0.5" />
              Admin Users List
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {/* Roles & Permissions Tab */}
          {activeTab === "roles-permissions" && (
            <section>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Predefined Roles</h2>
                <p className="text-gray-600">
                  Manage access levels and permissions for different admin roles. Click "Edit Permissions" to customize.
                </p>
              </div>

              {/* Role Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(Object.keys(ROLE_DEFINITIONS) as AdminRole[]).map((role) => (
                  <RoleCard
                    key={role}
                    role={role}
                    userCount={getRoleUserCount(role)}
                    onEditPermissions={() => setEditingRole(role)}
                    onViewUsers={() => setViewingUsersForRole(role)}
                  />
                ))}
              </div>

              {/* Info Box */}
              <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 rounded-xl p-6 shadow-md">
                <div className="flex items-start gap-4">
                  <ShieldCheckIcon className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-semibold text-gray-900 mb-2">About Granular Permissions</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      Each role has specific permissions that control access to different areas of the platform.
                      Super Admins have full access to all features. Other roles have restricted access based on their responsibilities.
                      You can customize permissions for each role using the "Edit Permissions" button.
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Admin Users List Tab */}
          {activeTab === "admin-users" && (
            <section>
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                {adminUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No admin users found.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Last Login
                          </th>
                          <th className="relative px-6 py-3">
                            <span className="sr-only">Actions</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {adminUsers.map((admin) => {
                          const roleData = ROLE_DEFINITIONS[admin.role];
                          return (
                            <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleData.gradient} flex items-center justify-center text-white font-bold text-lg`}>
                                    {admin.name[0]}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {admin.email}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${roleData.gradient} text-white`}>
                                  <span>{roleData.icon}</span>
                                  {admin.role}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={classNames(
                                    admin.status === "Active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800",
                                    "px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                                  )}
                                >
                                  {admin.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {admin.lastLogin}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button
                                    onClick={() => handleEditAdmin(admin.id)}
                                    className="text-indigo-600 hover:text-indigo-900 p-1 rounded-md hover:bg-gray-100"
                                    title="Edit Admin"
                                  >
                                    <PencilSquareIcon className="h-5 w-5" />
                                  </button>
                                  <button
                                    onClick={() => handleToggleStatus(admin.id, admin.status)}
                                    className={classNames(
                                      admin.status === "Active"
                                        ? "text-orange-600 hover:text-orange-900"
                                        : "text-green-600 hover:text-green-900",
                                      "p-1 rounded-md hover:bg-gray-100"
                                    )}
                                    title={admin.status === "Active" ? "Suspend Admin" : "Activate Admin"}
                                  >
                                    {admin.status === "Active" ? (
                                      <LockClosedIcon className="h-5 w-5" />
                                    ) : (
                                      <LockOpenIcon className="h-5 w-5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleViewActivity(admin)}
                                    className="text-blue-600 hover:text-blue-900 p-1 rounded-md hover:bg-gray-100"
                                    title="View Activity Log"
                                  >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteAdmin(admin.id)}
                                    className="text-red-600 hover:text-red-900 p-1 rounded-md hover:bg-gray-100"
                                    title="Delete Admin"
                                  >
                                    <TrashIcon className="h-5 w-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Permission Editor Modal */}
        {editingRole && (
          <PermissionEditor
            role={editingRole}
            currentPermissions={rolePermissions[editingRole]}
            isOpen={!!editingRole}
            onClose={() => setEditingRole(null)}
            onSave={(permissions) => handleSavePermissions(editingRole, permissions)}
          />
        )}

        {/* View Users Modal */}
        {viewingUsersForRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {viewingUsersForRole} Users
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {getUsersForRole(viewingUsersForRole).length} users with this role
                  </p>
                </div>
                <button
                  onClick={() => setViewingUsersForRole(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {getUsersForRole(viewingUsersForRole).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${ROLE_DEFINITIONS[user.role].gradient} flex items-center justify-center text-white font-bold text-xl`}>
                        {user.name[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                    <span
                      className={classNames(
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800",
                        "px-3 py-1 rounded-full text-xs font-semibold"
                      )}
                    >
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewingUsersForRole(null)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add New Admin Modal */}
        {showAddAdminModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Admin</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Role *</label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as AdminRole })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {(Object.keys(ROLE_DEFINITIONS) as AdminRole[]).map((role) => (
                      <option key={role} value={role}>
                        {ROLE_DEFINITIONS[role].icon} {role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    checked={sendEmailNotification}
                    onChange={(e) => setSendEmailNotification(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="sendEmail" className="ml-2 text-sm text-gray-700">
                    Send welcome email to new admin
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddAdminModal(false);
                    setNewAdmin({ name: "", email: "", role: "Content Editor" });
                    setSendEmailNotification(true);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddAdmin}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 font-semibold"
                >
                  Create Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Log Modal */}
        {showActivityLog && selectedAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[80vh] overflow-y-auto shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  Activity Log - {selectedAdmin.name}
                </h3>
                <button
                  onClick={() => setShowActivityLog(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                {[
                  { date: "2025-12-26 10:30 AM", action: "Logged in", details: "IP: 192.168.1.1" },
                  { date: "2025-12-26 09:15 AM", action: "Updated blog post", details: "Post: HR Tech Trends 2025" },
                  { date: "2025-12-25 04:45 PM", action: "Approved payment", details: "Invoice #INV-2025-001" },
                  { date: "2025-12-25 02:30 PM", action: "Created new company", details: "Company: Tech Solutions Ltd" },
                  { date: "2025-12-24 11:00 AM", action: "Role changed", details: `From Content Editor to ${selectedAdmin.role}` },
                ].map((log, idx) => (
                  <div key={idx} className="border-l-4 border-indigo-500 pl-4 py-3 bg-gray-50 rounded-r-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-900">{log.action}</p>
                        <p className="text-sm text-gray-600">{log.details}</p>
                      </div>
                      <span className="text-xs text-gray-500">{log.date}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowActivityLog(false)}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}