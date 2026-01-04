// Permission Categories
export const PERMISSION_CATEGORIES = {
    COMPANIES: 'companies',
    WEBSITE: 'website',
    INVOICES: 'invoices',
    USERS: 'users',
    ROLES: 'roles',
    SEO: 'seo',
    REPORTS: 'reports'
} as const;

// Granular Permissions
export const PERMISSIONS = {
    // Companies
    'companies.view.all': { name: 'View All Companies', category: 'companies', description: 'Access to view all companies in the system' },
    'companies.view.assigned': { name: 'View Assigned Companies', category: 'companies', description: 'Access to view only assigned companies' },
    'companies.create': { name: 'Create Companies', category: 'companies', description: 'Create new company accounts' },
    'companies.edit': { name: 'Edit Companies', category: 'companies', description: 'Modify company details and settings' },
    'companies.delete': { name: 'Delete Companies', category: 'companies', description: 'Remove companies from the system' },

    // Company Users
    'company_users.view': { name: 'View Company Users', category: 'companies', description: 'View users within companies' },
    'company_users.create': { name: 'Create Company Users', category: 'companies', description: 'Add new users to companies' },
    'company_users.edit': { name: 'Edit Company Users', category: 'companies', description: 'Modify company user details' },
    'company_users.delete': { name: 'Delete Company Users', category: 'companies', description: 'Remove users from companies' },

    // Website Content
    'website.home.edit': { name: 'Edit Home Page', category: 'website', description: 'Modify home page content and layout' },
    'website.testimonials.view': { name: 'View Testimonials', category: 'website', description: 'Access testimonials section' },
    'website.testimonials.edit': { name: 'Edit Testimonials', category: 'website', description: 'Add, edit, or remove testimonials' },
    'website.banners.edit': { name: 'Edit Banners', category: 'website', description: 'Manage announcements and banners' },
    'website.blogs.view': { name: 'View Blogs', category: 'website', description: 'Access blog posts and insights' },
    'website.blogs.create': { name: 'Create Blogs', category: 'website', description: 'Write new blog posts' },
    'website.blogs.edit': { name: 'Edit Blogs', category: 'website', description: 'Modify existing blog posts' },
    'website.blogs.delete': { name: 'Delete Blogs', category: 'website', description: 'Remove blog posts' },

    // SEO
    'seo.view': { name: 'View SEO Settings', category: 'seo', description: 'Access SEO configuration' },
    'seo.edit': { name: 'Edit SEO & Metadata', category: 'seo', description: 'Modify SEO settings and metadata' },
    'seo.analytics': { name: 'View Analytics', category: 'seo', description: 'Access analytics dashboard' },

    // Invoices
    'invoices.view.all': { name: 'View All Invoices', category: 'invoices', description: 'Access all invoice records' },
    'invoices.view.assigned': { name: 'View Assigned Invoices', category: 'invoices', description: 'View only assigned invoices' },
    'invoices.create': { name: 'Create Invoices', category: 'invoices', description: 'Generate new invoices' },
    'invoices.approve': { name: 'Approve Invoices', category: 'invoices', description: 'Approve payment requests' },
    'invoices.reject': { name: 'Reject Invoices', category: 'invoices', description: 'Reject payment requests' },

    // Users & Roles
    'users.view': { name: 'View Users', category: 'users', description: 'Access user list' },
    'users.create': { name: 'Create Users', category: 'users', description: 'Add new admin users' },
    'users.edit': { name: 'Edit Users', category: 'users', description: 'Modify user details' },
    'users.delete': { name: 'Delete Users', category: 'users', description: 'Remove users from system' },
    'roles.view': { name: 'View Roles', category: 'roles', description: 'Access roles and permissions' },
    'roles.edit': { name: 'Edit Roles', category: 'roles', description: 'Modify roles and permissions' },

    // HTI Reports
    'reports.view': { name: 'View HTI Reports', category: 'reports', description: 'Access HTI advisory reports' },
    'reports.approve': { name: 'Approve Reports', category: 'reports', description: 'Approve HTI reports' },
    'reports.edit': { name: 'Edit Reports', category: 'reports', description: 'Modify HTI report content' },
} as const;

export type Permission = keyof typeof PERMISSIONS;
export type AdminRole = 'Super Admin' | 'Company Manager' | 'Content Editor' | 'SEO Analyst' | 'Finance Admin';

// Role Definitions with Default Permissions
export const ROLE_DEFINITIONS: Record<AdminRole, {
    description: string;
    permissions: Permission[];
    color: string;
    icon: string;
    gradient: string;
}> = {
    'Super Admin': {
        description: 'Full access to all platform features and settings',
        permissions: Object.keys(PERMISSIONS) as Permission[], // All permissions
        color: 'purple',
        icon: '👑',
        gradient: 'from-purple-500 to-indigo-600'
    },
    'Company Manager': {
        description: 'Manage assigned companies\' details, users, engines, and reports',
        permissions: [
            'companies.view.assigned',
            'companies.edit',
            'company_users.view',
            'company_users.create',
            'company_users.edit',
            'reports.view',
            'reports.approve',
            'invoices.view.assigned'
        ],
        color: 'blue',
        icon: '👔',
        gradient: 'from-blue-500 to-cyan-600'
    },
    'Content Editor': {
        description: 'Manage website content, blogs, testimonials, and banners',
        permissions: [
            'website.home.edit',
            'website.testimonials.view',
            'website.testimonials.edit',
            'website.banners.edit',
            'website.blogs.view',
            'website.blogs.create',
            'website.blogs.edit',
            'website.blogs.delete'
        ],
        color: 'green',
        icon: '✍️',
        gradient: 'from-green-500 to-emerald-600'
    },
    'SEO Analyst': {
        description: 'Access and manage SEO settings and analytics',
        permissions: [
            'seo.view',
            'seo.edit',
            'seo.analytics',
            'website.blogs.view'
        ],
        color: 'orange',
        icon: '📊',
        gradient: 'from-orange-500 to-amber-600'
    },
    'Finance Admin': {
        description: 'View and manage invoice requests',
        permissions: [
            'invoices.view.all',
            'invoices.approve',
            'invoices.reject'
        ],
        color: 'red',
        icon: '💰',
        gradient: 'from-red-500 to-rose-600'
    }
};

// Helper to get permissions by category
export function getPermissionsByCategory(category: string): Permission[] {
    return Object.entries(PERMISSIONS)
        .filter(([_, perm]) => perm.category === category)
        .map(([key, _]) => key as Permission);
}

// Helper to get category display name
export function getCategoryDisplayName(category: string): string {
    const names: Record<string, string> = {
        companies: 'Companies & Users',
        website: 'Website Content',
        seo: 'SEO & Analytics',
        invoices: 'Invoices & Payments',
        users: 'User Management',
        roles: 'Roles & Permissions',
        reports: 'HTI Reports'
    };
    return names[category] || category;
}
