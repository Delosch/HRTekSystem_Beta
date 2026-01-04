import { AdminRole, ROLE_DEFINITIONS, Permission, PERMISSIONS } from "~/lib/permissions";
import { Shield, Users, Check } from "lucide-react";

interface RoleCardProps {
    role: AdminRole;
    userCount: number;
    onEditPermissions: () => void;
    onViewUsers: () => void;
}

export function RoleCard({ role, userCount, onEditPermissions, onViewUsers }: RoleCardProps) {
    const roleData = ROLE_DEFINITIONS[role];
    const permissionCount = roleData.permissions.length;

    // Get first 3 permissions for preview
    const previewPermissions = roleData.permissions.slice(0, 3);
    const remainingCount = permissionCount - 3;

    return (
        <div className={`bg-gradient-to-br ${roleData.gradient} rounded-2xl shadow-xl p-6 border-2 border-${roleData.color}-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <span className="text-5xl">{roleData.icon}</span>
                <span className={`px-3 py-1 bg-white bg-opacity-90 text-${roleData.color}-700 rounded-full text-xs font-bold shadow-md`}>
                    {userCount} {userCount === 1 ? 'user' : 'users'}
                </span>
            </div>

            {/* Role Name & Description */}
            <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{role}</h3>
            <p className="text-white text-opacity-90 text-sm mb-4 leading-relaxed">
                {roleData.description}
            </p>

            {/* Permission Preview */}
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-white" />
                    <span className="text-white text-opacity-90 text-xs font-semibold uppercase tracking-wide">
                        Permissions ({permissionCount})
                    </span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {previewPermissions.map(perm => (
                        <span
                            key={perm}
                            className="px-2 py-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-md text-xs text-white font-medium border border-white border-opacity-30"
                        >
                            {PERMISSIONS[perm].name}
                        </span>
                    ))}
                    {remainingCount > 0 && (
                        <span className="px-2 py-1 bg-white bg-opacity-30 backdrop-blur-sm rounded-md text-xs text-white font-bold border border-white border-opacity-40">
                            +{remainingCount} more
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={onEditPermissions}
                    className="flex-1 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 border border-white border-opacity-30 hover:border-opacity-50 flex items-center justify-center gap-2"
                >
                    <Shield className="w-4 h-4" />
                    <span className="text-sm">Edit Permissions</span>
                </button>
                <button
                    onClick={onViewUsers}
                    className="flex-1 bg-white hover:bg-opacity-100 bg-opacity-90 text-gray-900 font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                >
                    <Users className="w-4 h-4" />
                    <span className="text-sm">View Users</span>
                </button>
            </div>
        </div>
    );
}
