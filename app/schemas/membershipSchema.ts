import { z } from 'zod';

// Define common fields for reusability
const baseMembershipSchema = z.object({
    userId: z.uuidv4("Invalid user ID format."), // Use z.string().uuid() as uuidv4() is a function call
    companyId: z.uuidv4("Invalid company ID format."),
    isCreator: z.boolean().default(false),
    role: z.string().min(1, "Role cannot be empty.").max(30, "Role too long."),
    permissions: z.array(z.string().min(1, "Permission cannot be empty string.")).min(0, "Permissions must be an array."), // Use min(0) if empty array is allowed
    invited: z.boolean().default(false),
    invitedBy: z.uuidv4("Invalid invitedBy ID format.").optional(), // Assuming invitedBy is a UUID
});

// Refine the base schema with conditional logic using .check()
// .superRefine allows pushing multiple issues
export const membershipSchema = baseMembershipSchema.check((ctx) => {
    const { isCreator, role, invited, invitedBy } = ctx.value;

    if (isCreator && role !== "owner") {
        ctx.issues.push({
            code: "custom",
            path: ["role"],
            message: "Creator must have the role 'owner'.",
            input: role, // You can specify the input field causing issue
        });
    }

    if (!isCreator && role === "owner") {
        ctx.issues.push({
            code: "custom",
            path: ["role"],
            message: "Only the creator can have the role 'owner'.",
            input: role,
        });
    }

    if (invited && !invitedBy) {
        ctx.issues.push({
            code: "custom",
            path: ["invitedBy"],
            message: "`invitedBy` must be provided if `invited` is true.",
            input: invitedBy,
        });
    }

    if (!invited && invitedBy) {
        ctx.issues.push({
            code: "custom",
            path: ["invitedBy"],
            message: "`invitedBy` must not be set if `invited` is false.",
            input: invitedBy,
        });
    }
});

export type MembershipInput = z.infer<typeof membershipSchema>;

// If you absolutely need separate types for semantic clarity
// without duplicating the schema definition, you can do:
export type UserToCompanyInput = MembershipInput;
export type CompanyToMemberInput = MembershipInput;

// Or, if there were subtle differences, you'd extend or union:
// export const userToCompanySchema = membershipSchema.extend({ /* specific user-to-company fields */ });
// export const companyToMemberSchema = membershipSchema.extend({ /* specific company-to-member fields */ });