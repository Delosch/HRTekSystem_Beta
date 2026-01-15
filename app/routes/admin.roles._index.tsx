import { useState } from "react";
import { json } from "@remix-run/node";
import { useLoaderData, Link } from "@remix-run/react";
import {
  PencilSquareIcon,
  TrashIcon,
  UserPlusIcon,
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  FingerPrintIcon,
  KeyIcon,
  ChevronRightIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Sparkles, TrendingUp, ShieldAlert, Cpu } from "lucide-react";
import { RoleCard } from "~/components/RoleCard";
import { PermissionEditor } from "~/components/PermissionEditor";
import { ROLE_DEFINITIONS, type AdminRole, type Permission } from "~/lib/permissions";
import { motion, AnimatePresence } from "framer-motion";

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
    email: "admin@hrtek.ai",
    role: "Super Admin",
    status: "Active",
    lastLogin: "2025-12-26 10:00 AM",
  },
  {
    id: "admin-002",
    name: "Emily White",
    email: "emily.w@hrtek.ai",
    role: "Company Manager",
    status: "Active",
    lastLogin: "2025-12-25 03:30 PM",
  },
  {
    id: "admin-003",
    name: "David Green",
    email: "david.g@hrtek.ai",
    role: "Content Editor",
    status: "Active",
    lastLogin: "2025-12-24 11:00 AM",
  },
  {
    id: "admin-004",
    name: "Sophia Chen",
    email: "sophia.c@hrtek.ai",
    role: "SEO Analyst",
    status: "Suspended",
    lastLogin: "2025-12-15 09:00 AM",
  },
  {
    id: "admin-005",
    name: "Michael Brown",
    email: "michael.b@hrtek.ai",
    role: "Finance Admin",
    status: "Active",
    lastLogin: "2025-12-26 09:15 AM",
  },
];

export const loader = async () => {
  return json({ adminUsers: dummyAdminUsers });
};

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

  const [viewingUsersForRole, setViewingUsersForRole] = useState<AdminRole | null>(null);

  const handleEditAdmin = (adminId: string) => {
    console.log(`Edit admin: ${adminId}`);
  };

  const handleToggleStatus = (adminId: string, currentStatus: AdminStatus) => {
    console.log(`Admin ${adminId} toggled`);
  };

  const handleDeleteAdmin = (adminId: string) => {
    if (confirm("Permanently revoke this administrator's credentials?")) {
      console.log(`Deleted ${adminId}`);
    }
  };

  const handleAddAdmin = () => {
    setShowAddAdminModal(false);
    setNewAdmin({ name: "", email: "", role: "Content Editor" });
  };

  const handleSavePermissions = (role: AdminRole, permissions: Permission[]) => {
    setRolePermissions(prev => ({ ...prev, [role]: permissions }));
    setEditingRole(null);
  };

  const getRoleUserCount = (role: AdminRole) => adminUsers.filter(u => u.role === role).length;
  const getUsersForRole = (role: AdminRole) => adminUsers.filter(u => u.role === role);

  const stats = [
    { label: 'Authorized Personas', value: adminUsers.length, icon: UserGroupIcon, color: 'indigo' },
    { label: 'Active Sessions', value: adminUsers.filter(u => u.status === "Active").length, icon: FingerPrintIcon, color: 'emerald' },
    { label: 'Governance Tiers', value: Object.keys(ROLE_DEFINITIONS).length, icon: KeyIcon, color: 'violet' },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-4 animate-in fade-in duration-700">
      {/* Security Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 px-2.5 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-2">
              <ShieldAlert className="h-3 w-3" />
              Secure Governance Zone
            </div>
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">Access <span className="text-indigo-600">Architect</span></h1>
          <p className="text-gray-500 font-medium mt-1">Manage recursive permissions and hierarchical authority across the platform.</p>
        </div>
        <button
          onClick={() => setShowAddAdminModal(true)}
          className="inline-flex items-center px-8 py-3.5 bg-gray-900 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-gray-900/20 hover:bg-gray-800 active:scale-95 transition-all"
        >
          <UserPlusIcon className="-ml-1 mr-3 h-5 w-5" />
          Onboard Admin
        </button>
      </div>

      {/* Cyber Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-sm flex items-center gap-6 group hover:shadow-md transition-all"
          >
            <div className={`h-16 w-16 rounded-[1.5rem] bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center group-hover:scale-110 transition-transform`}>
              <stat.icon className="h-8 w-8" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex bg-gray-100/50 p-2 rounded-[2rem] w-fit">
        {[
          { id: 'roles-permissions', label: 'Identity Archetypes', icon: ShieldCheckIcon },
          { id: 'admin-users', label: 'Operator Directory', icon: UserGroupIcon }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-sm border border-gray-100' : 'text-gray-400 hover:text-gray-600'
              }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content Buffer */}
      <AnimatePresence mode="wait">
        {activeTab === "roles-permissions" ? (
          <motion.section
            key="roles"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

            <div className="bg-indigo-900 rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 p-12 opacity-10 scale-150 rotate-12 group-hover:rotate-0 transition-transform duration-1000">
                <FingerPrintIcon className="h-48 w-48 text-white" />
              </div>
              <div className="relative z-10 max-w-2xl">
                <h3 className="text-white text-2xl font-black uppercase tracking-tight mb-4 flex items-center gap-3">
                  <Cpu className="h-6 w-6 text-indigo-400" />
                  Granular Entitlement Protocol
                </h3>
                <p className="text-indigo-200 font-medium leading-relaxed">
                  Security architecture follows the Principle of Least Privilege (PoLP). Each identity archetypes is mapped to specific capability nodes.
                  Modification of these entries results in immediate systemic reconfiguration across all active operator sessions.
                </p>
                <div className="mt-8 flex gap-4">
                  <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-black uppercase">
                    <CheckCircleIcon className="h-4 w-4" /> Real-time Sync
                  </div>
                  <div className="flex items-center gap-2 text-indigo-300 text-[10px] font-black uppercase">
                    <CheckCircleIcon className="h-4 w-4" /> Audit Logged
                  </div>
                </div>
              </div>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="users"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Validated ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Contact Node</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Assigned Tier</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Utility Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {adminUsers.map((admin) => {
                    const roleData = ROLE_DEFINITIONS[admin.role];
                    return (
                      <tr key={admin.id} className="group hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${roleData.gradient} flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-100`}>
                              {admin.name[0]}
                            </div>
                            <div>
                              <p className="text-sm font-black text-gray-900">{admin.name}</p>
                              <p className="text-[10px] font-bold text-gray-400">ID: {admin.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-gray-600">
                          {admin.email}
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r ${roleData.gradient} text-white shadow-sm`}>
                            {admin.role}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            <div className={`h-2 w-2 rounded-full ${admin.status === "Active" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                            <span className={`text-xs font-bold ${admin.status === "Active" ? "text-emerald-700" : "text-rose-700"}`}>{admin.status}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                            <button className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                            <button className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-sm">
                              <TrashIcon className="h-4 w-4" />
                            </button>
                            <div className="h-8 w-px bg-gray-100 mx-2" />
                            <button className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-900 hover:text-white transition-all">
                              <EllipsisHorizontalIcon className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Modal Overlays (Minimal Revamp) */}
      <AnimatePresence>
        {editingRole && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-slate-900/80 backdrop-blur-md">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-[3rem] shadow-2xl w-full max-w-4xl p-12 relative overflow-hidden">
              <PermissionEditor
                role={editingRole}
                currentPermissions={rolePermissions[editingRole]}
                isOpen={!!editingRole}
                onClose={() => setEditingRole(null)}
                onSave={(permissions) => handleSavePermissions(editingRole, permissions)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Admin Modal (Cyber Polished) */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-[100] bg-gray-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[3rem] max-w-xl w-full p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="h-16 w-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-8">
              <UserPlusIcon className="h-10 w-10" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Onboard Persona</h3>
            <p className="text-gray-500 font-medium mb-10 italic">Configure systemic credentials for a secondary operator.</p>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Full Legal Identity</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="Enter identity name..."
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Secured Communication Node (Email)</label>
                <input
                  type="email"
                  className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                  placeholder="operator@system.node"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Governance Authority Tier</label>
                <select className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-black focus:ring-4 focus:ring-indigo-100 outline-none appearance-none cursor-pointer">
                  {(Object.keys(ROLE_DEFINITIONS) as AdminRole[]).map((role) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="flex-1 px-4 py-4 rounded-2xl text-xs font-black uppercase text-gray-400 hover:text-gray-600 transition-colors"
              >
                Abstain
              </button>
              <button
                onClick={handleAddAdmin}
                className="flex-1 px-8 py-4 bg-gray-900 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-gray-800 shadow-xl shadow-gray-900/10 active:scale-95 transition-all"
              >
                Commit Entry
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}