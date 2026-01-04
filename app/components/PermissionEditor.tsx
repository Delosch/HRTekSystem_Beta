import { useState } from "react";
import { AdminRole, ROLE_DEFINITIONS, Permission, PERMISSIONS, PERMISSION_CATEGORIES, getCategoryDisplayName, getPermissionsByCategory } from "~/lib/permissions";
import { X, Shield, Check, Search } from "lucide-react";

interface PermissionEditorProps {
    role: AdminRole;
    currentPermissions: Permission[];
    isOpen: boolean;
    onClose: () => void;
    onSave: (permissions: Permission[]) => void;
}

export function PermissionEditor({ role, currentPermissions, isOpen, onClose, onSave }: PermissionEditorProps) {
    const [selectedPermissions, setSelectedPermissions] = useState<Set<Permission>>(new Set(currentPermissions));
    const [searchTerm, setSearchTerm] = useState("");
    const roleData = ROLE_DEFINITIONS[role];

    if (!isOpen) return null;

    const togglePermission = (permission: Permission) => {
        const newSelected = new Set(selectedPermissions);
        if (newSelected.has(permission)) {
            newSelected.delete(permission);
        } else {
            newSelected.add(permission);
        }
        setSelectedPermissions(newSelected);
    };

    const handleSave = () => {
        onSave(Array.from(selectedPermissions));
        onClose();
    };

    const handleSelectAll = (category: string) => {
        const categoryPerms = getPermissionsByCategory(category);
        const newSelected = new Set(selectedPermissions);
        categoryPerms.forEach(perm => newSelected.add(perm));
        setSelectedPermissions(newSelected);
    };

    const handleDeselectAll = (category: string) => {
        const categoryPerms = getPermissionsByCategory(category);
        const newSelected = new Set(selectedPermissions);
        categoryPerms.forEach(perm => newSelected.delete(perm));
        setSelectedPermissions(newSelected);
    };

    // Filter permissions by search term
    const filteredPermissions = Object.entries(PERMISSIONS).filter(([key, perm]) =>
        perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        perm.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const categories = Object.values(PERMISSION_CATEGORIES);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className={`bg-gradient-to-r ${roleData.gradient} text-white p-6`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <span className="text-5xl">{roleData.icon}</span>
                            <div>
                                <h3 className="text-2xl font-bold">Edit Permissions</h3>
                                <p className="text-white text-opacity-90 text-sm">{role}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-lg transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="mt-4 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search permissions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white bg-opacity-20 backdrop-blur-sm border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                        />
                    </div>
                </div>

                {/* Permission Count */}
                <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <p className="text-sm text-gray-600">
                        <span className="font-semibold text-gray-900">{selectedPermissions.size}</span> of{" "}
                        <span className="font-semibold text-gray-900">{Object.keys(PERMISSIONS).length}</span> permissions selected
                    </p>
                </div>

                {/* Permissions List */}
                <div className="p-6 overflow-y-auto max-h-[50vh]">
                    {searchTerm ? (
                        // Search Results
                        <div className="space-y-2">
                            {filteredPermissions.map(([key, perm]) => (
                                <label
                                    key={key}
                                    className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedPermissions.has(key as Permission)}
                                        onChange={() => togglePermission(key as Permission)}
                                        className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 mt-0.5"
                                    />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{perm.name}</p>
                                        <p className="text-xs text-gray-500">{perm.description}</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                                            {getCategoryDisplayName(perm.category)}
                                        </span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    ) : (
                        // Grouped by Category
                        <div className="space-y-6">
                            {categories.map(category => {
                                const categoryPerms = getPermissionsByCategory(category);
                                const selectedCount = categoryPerms.filter(p => selectedPermissions.has(p)).length;

                                return (
                                    <div key={category} className="border border-gray-200 rounded-xl overflow-hidden">
                                        {/* Category Header */}
                                        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="font-bold text-gray-900">{getCategoryDisplayName(category)}</h4>
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {selectedCount} of {categoryPerms.length} selected
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleSelectAll(category)}
                                                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                                                    >
                                                        Select All
                                                    </button>
                                                    <span className="text-gray-300">|</span>
                                                    <button
                                                        onClick={() => handleDeselectAll(category)}
                                                        className="text-xs text-gray-600 hover:text-gray-800 font-medium"
                                                    >
                                                        Deselect All
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Permissions */}
                                        <div className="p-3 space-y-1">
                                            {categoryPerms.map(perm => (
                                                <label
                                                    key={perm}
                                                    className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedPermissions.has(perm)}
                                                        onChange={() => togglePermission(perm)}
                                                        className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500 mt-0.5"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{PERMISSIONS[perm].name}</p>
                                                        <p className="text-xs text-gray-500">{PERMISSIONS[perm].description}</p>
                                                    </div>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
                    <button
                        onClick={() => setSelectedPermissions(new Set(roleData.permissions))}
                        className="text-sm text-gray-600 hover:text-gray-900 font-medium"
                    >
                        Reset to Default
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            className={`px-6 py-2 bg-gradient-to-r ${roleData.gradient} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-200 flex items-center gap-2`}
                        >
                            <Check className="w-4 h-4" />
                            Save Permissions
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
