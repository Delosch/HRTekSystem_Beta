import { z } from "zod";

// Enhanced signup schema with security fields
export const signupSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.email("Invalid email address").toLowerCase(),
    password: z.string().min(8, "Password must be 8 characters long"),
    phone: z.string().refine(
        (val) => {
            return /^\(\+\d{1,4}\)\d{6,15}$/.test(val);
        },
        {
            message: "Invalid Phone Number",
        }
    ),
    is_marketing_allowed: z.boolean().optional().default(false),
    is_term_agree: z.coerce.boolean().refine(
        (val) => val === true,
        {
            message: "You must agree to the terms and conditions.",
        }
    ),
    country_iso: z.string().min(2).max(2),
    password_strength_score: z.number(),
    signup_timestamp: z.number()
});

// Rest of your schemas remain the same...
export const loginSchema = z.object({
    identifier: z.string().min(1, "Email or phone number is required"),
    password: z.string().min(8, "Password is required")
});

export const updateUserSchema = z.object({
    first_name: z.string().min(1).optional(),
    last_name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    phone: z.string().optional(),
    is_term_agree: z.boolean().optional(),
    is_marketing_allowed: z.boolean().optional(),
    is_verified_phone: z.boolean().optional(),
    is_verified_email: z.boolean().optional(),
    two_fa_enabled: z.boolean().optional(),
    onboardingStatus: z.string().optional(),
    organisationId: z.string().optional(),
    name: z.string().optional(), // Added for company onboarding
    role: z.string().optional(), // Added for company onboarding

    // ⭐ UPDATED AS REQUESTED — NOW OPTIONAL
    country_iso: z.string().min(2).max(2).optional(),
    photoUrl: z.string().optional(),
    username: z.string().optional(),

}).strict().partial();

// Your existing interfaces remain the same
export interface DbUserItem {
    pk: string;
    sk: "PROFILE"
    profile_type: "USER"
    email: string;
    phone: string;
    first_name: string;
    last_name: string;
    password_hash: string;
    is_term_agree: boolean;
    is_marketing_allowed: boolean;
    is_verified_phone: boolean;
    is_verified_email: boolean;
    two_fa_enabled: boolean;
    onboardingStatus: string;
    organisationId: string;
    createdAt: string;
    country_iso: string;
    photoUrl?: string;
    username?: string;
}

export interface AuthenticatedUser {
    userId: string
    first_name: string
    last_name: string
    email: string
    phone: string
    two_fa_enabled: boolean
    is_verified_phone: boolean
    is_verified_email: boolean
    onboardingStatus: string,
    organisationId: string,
    country_iso: string,
    photoUrl?: string,
    username?: string
}
