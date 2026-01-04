import { ROLE_DEFINITIONS, type Permission, type AdminRole } from './permissions';

export interface User {
    userId: string;
    email: string;
    name?: string;
    role?: AdminRole;
    customPermissions?: Permission[];
    assignedCompanies?: string[];
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User | null, permission: Permission): boolean {
    if (!user || !user.role) return false;

    // Super Admin has all permissions
    if (user.role === 'Super Admin') return true;

    // Check custom permissions first (overrides)
    if (user.customPermissions?.includes(permission)) return true;

    // Check role default permissions
    const rolePerms = ROLE_DEFINITIONS[user.role]?.permissions || [];
    return rolePerms.includes(permission);
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User | null, permissions: Permission[]): boolean {
    return permissions.some(perm => hasPermission(user, perm));
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User | null, permissions: Permission[]): boolean {
    return permissions.every(perm => hasPermission(user, perm));
}

/**
 * Require a specific permission (throws error if not authorized)
 */
export function requirePermission(user: User | null, permission: Permission): void {
    if (!hasPermission(user, permission)) {
        throw new Error(`Access denied: Missing permission '${permission}'`);
    }
}

/**
 * Require Super Admin role (throws error if not authorized)
 */
export function requireSuperAdmin(user: User | null): void {
    if (!user || user.role !== 'Super Admin') {
        throw new Error('Access denied: Super Admin access required');
    }
}

/**
 * Check if user is Super Admin
 */
export function isSuperAdmin(user: User | null): boolean {
    return user?.role === 'Super Admin';
}

/**
 * Get all permissions for a user (including custom permissions)
 */
export function getUserPermissions(user: User | null): Permission[] {
    if (!user || !user.role) return [];

    // Super Admin has all permissions
    if (user.role === 'Super Admin') {
        return ROLE_DEFINITIONS['Super Admin'].permissions;
    }

    // Combine role permissions with custom permissions
    const rolePerms = ROLE_DEFINITIONS[user.role]?.permissions || [];
    const customPerms = user.customPermissions || [];

    // Remove duplicates
    return Array.from(new Set([...rolePerms, ...customPerms]));
}

/**
 * Check if user can access a specific company
 */
export function canAccessCompany(user: User | null, companyId: string): boolean {
    if (!user) return false;

    // Super Admin can access all companies
    if (user.role === 'Super Admin') return true;

    // Check if user has view all companies permission
    if (hasPermission(user, 'companies.view.all')) return true;

    // Check if company is in assigned companies
    if (user.assignedCompanies?.includes(companyId)) return true;

    return false;
}
