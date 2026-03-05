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
    userId: z.string().uuid("Invalid user ID format"),
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address").toLowerCase(),
    phone: z.string().refine(
        (val) => {
            // Updated to support (+CC)NUMBER, +CCNUMBER, and standard international formats
            return /^\(\+\d{1,4}\)\d{6,15}$/.test(val) || /^\+\d{8,15}$/.test(val);
        },
        {
            message: "Invalid Phone Number format",
        }
    ),
    is_verified_phone: z.boolean(),
    is_verified_email: z.boolean(),
    organisationId: z.string().optional(),
    onboardingStatus: z.string(),
    two_fa_enabled: z.boolean(),
    country_iso: z.string().min(2).max(2),
    photoUrl: z.string().optional(),
    username: z.string().optional(),
    isAdmin: z.boolean().optional(),
})

/**
 * sessionDataSchema:
 * This schema defines the exact structure of the data that is stored within
 * the session and retrieved from it. It's typically less strict on input validation
 * (as that's handled by authSessionSchema) but ensures type consistency for retrieved data.
 * All fields here should match what you expect to get from `session.get()`.
 */
export const sessionDataSchema = z.object({
    userId: z.string().uuid(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    is_verified_phone: z.boolean(),
    is_verified_email: z.boolean(),
    onboardingStatus: z.string(),
    organisationId: z.string().optional(),
    country_iso: z.string().min(2).max(2),
    photoUrl: z.string().optional(),
    username: z.string().optional(),
    isAdmin: z.boolean().optional(),
});

/**
 * SessionData:
 * A TypeScript type derived directly from `sessionDataSchema` for strong type-checking
 * when working with session data throughout your application.
 */
export type SessionData = z.infer<typeof sessionDataSchema>;
