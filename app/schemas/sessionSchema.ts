import { z } from "zod";

//this schema is for the data to bet set in session
// we need to think how we are gonna attach linking with other db

/**
 * authSessionSchema:
 * This schema is used for validating data when it's initially provided
 * to create or update a user's session (e.g., from a login or sign up).
 * It includes validation rules for input data.
 */
export const authSessionSchema = z.object({
    userId: z.string().min(1, "User ID is required"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address").toLowerCase(),
    phone: z.string().optional().default(""),
    is_verified_phone: z.boolean().default(false),
    is_verified_email: z.boolean().default(false),
    organisationId: z.string().optional().default(""),
    onboardingStatus: z.string().optional().default("None"),
    two_fa_enabled: z.boolean().default(false),
    country_iso: z.string().optional().default("IN"),
    photoUrl: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    isAdmin: z.boolean().optional().default(false),
})

/**
 * sessionDataSchema:
 * This schema defines the exact structure of the data that is stored within
 * the session and retrieved from it. It's typically less strict on input validation
 * (as that's handled by authSessionSchema) but ensures type consistency for retrieved data.
 * All fields here should match what you expect to get from `session.get()`.
 */
export const sessionDataSchema = z.object({
    userId: z.string().min(1),
    first_name: z.string().optional().default(""),
    last_name: z.string().optional().default(""),
    email: z.string().email().optional().default(""),
    phone: z.string().optional().default(""),
    is_verified_phone: z.boolean().optional().default(false),
    is_verified_email: z.boolean().optional().default(false),
    onboardingStatus: z.string().optional().default("None"),
    organisationId: z.string().optional().default(""),
    country_iso: z.string().optional().default("IN"),
    photoUrl: z.string().nullable().optional(),
    username: z.string().nullable().optional(),
    isAdmin: z.boolean().optional().default(false),
});

/**
 * SessionData:
 * A TypeScript type derived directly from `sessionDataSchema` for strong type-checking
 * when working with session data throughout your application.
 */
export type SessionData = z.infer<typeof sessionDataSchema>;
