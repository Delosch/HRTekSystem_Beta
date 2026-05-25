// dynamo db for use auth { mvp_user ~table name }
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { AuthenticatedUser, DbUserItem, signupSchema, updateUserSchema } from "~/schemas/userSchema";

const USERS_TABLE = process.env.DYNAMODB_USERS_TABLE || process.env.DYNAMODB_TABLE_NAME;
const BCRYPT_SALT_ROUNDS = 12;

// prevents multiple initialization of client
// by initializing at time of module is loaded
let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;
try {
    ddbDocClient = getDynamoDBDocumentClient();
} catch (e: unknown) {
    if (e instanceof Error) {
        console.error(`CRITICAL ERROR: Application cannot start due to DynamoDB client error: ${e.message}`);
    } else {
        console.error("CRITICAL ERROR: Application cannot start due to an unknown DynamoDB client error.");
    }
    process.exit(1);
}

/**
 * Registers a new user in the system.
 * Performs input validation, checks for existing email, hashes password, and stores user data.
 * @param {z.infer<typeof SignupSchema>} userData - User registration data.
 * @returns {Promise<{ userId: string; email: string; }>} The newly created user's ID and email.
 * @throws {Error} If email already exists, validation fails, or a database error occurs.
 */
export async function signupUser(
    userData: z.infer<typeof signupSchema>
): Promise<AuthenticatedUser> {

    const validatedData = signupSchema.parse(userData);
    const {
        first_name,
        last_name,
        email,
        password,
        phone,
        is_term_agree,
        is_marketing_allowed,
        country_iso
    } = validatedData;
    try {
        // now check if email exist via GSI1~ unique_email
        const queryCommand = new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: "email-index",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email,
            },
            Limit: 1,
            ConsistentRead: false
        });
        const existingEmail = await ddbDocClient.send(queryCommand);
        if (existingEmail.Count && existingEmail.Count > 0) {
            throw new Error("Email already registered. Please use different email or login")
        }
        // now check if phone exist via GSI2 ~ unique_phone
        const existingPhone = await ddbDocClient.send(new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: "phone-index",
            KeyConditionExpression: "phone = :phone",
            ExpressionAttributeValues: {
                ":phone": phone,
            },
            Limit: 1,
            ConsistentRead: false
        }));
        if (existingPhone.Count && existingPhone.Count > 0) {
            throw new Error("Phone number already registered. Please use a different phone or login");
        }
        const hash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const userId = randomUUID(); // generate unique identifier
        const newUserItem: DbUserItem = {
            pk: `USER#${userId}`,
            sk: "PROFILE",
            profile_type: "USER",
            email,
            phone,//: `(${country_code})${phone}`
            first_name,
            last_name,
            password_hash: hash, // Store the hash, not the plain password
            is_term_agree,
            is_marketing_allowed: is_marketing_allowed ?? false, // Ensure it's boolean, defaults to false
            is_verified_phone: false,
            is_verified_email: false,
            two_fa_enabled: false,
            onboardingStatus: 'None',
            organisationId: "",
            country_iso,
            createdAt: new Date().toISOString(),
        };
        await ddbDocClient.send(new PutCommand({
            TableName: USERS_TABLE,
            Item: newUserItem,
            ConditionExpression: "attribute_not_exists(unique_id)", // Ensures a new user is created and not an existing one overwritten
        }));

        // Notify Admin
        try {
            const { notifyAdmin } = await import("~/services/admin.notifier.server");
            await notifyAdmin("New User Signup", `A new user has signed up: ${email} (${first_name} ${last_name})`);
        } catch (notifierError) {
            console.warn("Failed to notify admin about signup:", notifierError);
        }

        console.log("User signed up:", email);
        return {
            userId,
            email,
            phone,
            first_name,
            last_name,
            is_verified_email: false,
            is_verified_phone: false,
            two_fa_enabled: false,
            onboardingStatus: 'None',
            organisationId: "",
            country_iso
        };
    } catch (error: unknown) {
        // Handle specific DynamoDB errors or re-throw Zod validation errors
        if (error instanceof z.ZodError) {
            console.error("Signup validation error:", error.issues); // Corrected from error.errors to error.issues
            throw new Error(`Validation failed: ${error.issues.map(e => e.message).join(', ')}`);
        } else if (error instanceof ConditionalCheckFailedException) {
            // This error occurs if attribute_not_exists(PK) fails, meaning an item with that PK already exists.
            // While we query for email, this is a secondary safeguard.
            console.error("DynamoDB ConditionalCheckFailedException during signup:", error);
            throw new Error("A user with this ID already exists. Please try again.");
        } else if (error instanceof Error) {
            console.error("Error during user signup:", error.message);
            // Re-throw the original error message if it's already descriptive
            throw error;
        } else {
            console.error("An unknown error occurred during signup:", error);
            throw new Error("An unexpected error occurred during signup.");
        }
    }
}

/**
 * Authenticates a user based on email and password.
 * @param {string} identifier - The user's email or phone.
 * @param {string} password - The user's plain-text password.
 * @returns {Promise<AuthenticatedUser>} The authenticated user's details.
 * @throws {Error} If credentials are invalid, validation fails, or a database error occurs.
 */
export async function loginUser(
    identifier: string, // email or phone
    password: string
): Promise<AuthenticatedUser> {
    try {
        // validate password only (identifier can be email or phone)
        if (!password || password.length < 8) {
            throw new Error("Password must be at least 8 characters long");
        }

        let queryCommand: QueryCommand;

        // Decide: is identifier email or phone?
        if (identifier.includes("@")) {
            // validate email
            const parsed = z.email("Invalid email").parse(identifier.toLowerCase());

            queryCommand = new QueryCommand({
                TableName: USERS_TABLE,
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: {
                    ":email": parsed,
                },
                Limit: 1,
                ConsistentRead: false
            });
        } else {
            // assume phone number; user must provide it in proper format, or you can normalize
            // here, assume user passed full phone like (+91)1234567890 → we'll need country_code and phone
            // or require user to pass country_code + phone separately
            // better to do:
            const phoneInput = identifier.replace(/\s/g, ""); // remove spaces just in case
            // @### here we have redundant steps
            // validate it matches expected pattern
            const phoneMatch = phoneInput.match(/^\(\+(\d{1,4})\)(\d{6,15})$/);
            if (!phoneMatch) {
                throw new Error("Invalid phone number format. Expected format: (+<countrycode>)<number>");
            }

            // Extract values
            const countryCode = phoneMatch[1];        // e.g., "91" or "1242"
            const phoneNumber = phoneMatch[2];
            // build same key used during signup:
            const uniquePhoneKey = `(${countryCode})${phoneNumber}`;

            queryCommand = new QueryCommand({
                TableName: USERS_TABLE,
                IndexName: "phone-index",
                KeyConditionExpression: "phone = :phone",
                ExpressionAttributeValues: {
                    ":phone": uniquePhoneKey,
                },
                Limit: 1,
                ConsistentRead: false
            });
        }

        const res = await ddbDocClient.send(queryCommand);
        if (!res.Items || res.Items.length === 0) {
            throw new Error("Invalid credentials (user not found)");
        }

        const user = res.Items[0] as DbUserItem;

        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            throw new Error("Invalid credentials (wrong password)");
        }

        console.log(`User logged in successfully: ${user.email || user.phone}`);

        return {
            userId: user.pk.replace("USER#", ""),
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            is_verified_phone: user.is_verified_phone,
            is_verified_email: user.is_verified_email,
            onboardingStatus: user.onboardingStatus,
            two_fa_enabled: user.two_fa_enabled,
            organisationId: user.organisationId,
            country_iso: user.country_iso,
            photoUrl: user.photoUrl,
            username: user.username
        };
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            throw new Error(`Validation failed: ${error.issues.map(e => e.message).join(', ')}`);
        } else if (error instanceof Error) {
            console.error("Error during login:", error.message);
            throw error;
        } else {
            console.error("Unknown error during login:", error);
            throw new Error("Unexpected error during login");
        }
    }
}

/**
 * Finds a user by their email address.
 * @param {string} email - The email address to search for.
 * @returns {Promise<DbUserItem | null>} The user item or null if not found.
 */
export async function getUserByEmail(email: string): Promise<DbUserItem | null> {
    try {
        const queryCommand = new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: "email-index",
            KeyConditionExpression: "email = :email",
            ExpressionAttributeValues: {
                ":email": email.toLowerCase(),
            },
            Limit: 1,
            ConsistentRead: false
        });

        const res = await ddbDocClient.send(queryCommand);
        if (!res.Items || res.Items.length === 0) {
            return null;
        }

        return res.Items[0] as DbUserItem;
    } catch (error) {
        console.error("Error finding user by email:", error);
        return null;
    }
}

export async function getUserByPhone(phone: string): Promise<DbUserItem | null> {
    try {
        const queryCommand = new QueryCommand({
            TableName: USERS_TABLE,
            IndexName: "phone-index",
            KeyConditionExpression: "phone = :phone",
            ExpressionAttributeValues: {
                ":phone": phone,
            },
            Limit: 1,
            ConsistentRead: false
        });

        const res = await ddbDocClient.send(queryCommand);
        if (!res.Items || res.Items.length === 0) {
            return null;
        }

        return res.Items[0] as DbUserItem;
    } catch (error) {
        console.error("Error finding user by phone:", error);
        return null;
    }
}
// updating the user
export async function updateUser(
    userId: string,
    updateData: z.infer<typeof updateUserSchema>
): Promise<DbUserItem> {
    try {
        const validatedData = updateUserSchema.parse(updateData);
        if (Object.keys(validatedData).length === 0) {
            throw new Error("Update data cannot be empty.");
        }

        const pk = `USER#${userId}`;
        const sk = "PROFILE";

        const updateExpressions: string[] = [];
        const expressionAttributeNames: Record<string, string> = {};
        const expressionAttributeValues: Record<string, unknown> = {};

        // Special handling for password, email, and phone
        if (validatedData.password) {
            const hash = await bcrypt.hash(validatedData.password, BCRYPT_SALT_ROUNDS);
            updateExpressions.push("#password_hash = :password_hash");
            expressionAttributeNames["#password_hash"] = "password_hash";
            expressionAttributeValues[":password_hash"] = hash;
        }

        if (validatedData.email) {
            // Check for email uniqueness before updating
            const existingEmail = await ddbDocClient.send(new QueryCommand({
                TableName: USERS_TABLE,
                IndexName: "email-index",
                KeyConditionExpression: "email = :email",
                ExpressionAttributeValues: { ":email": validatedData.email },
                Limit: 1,
            }));

            if (existingEmail.Count && existingEmail.Count > 0) {
                // If a different user already has this email, throw an error
                if (existingEmail.Items?.[0]?.pk !== pk) {
                    throw new Error("Email is already in use by another user.");
                }
            }
            updateExpressions.push("#email = :email");
            expressionAttributeNames["#email"] = "email";
            expressionAttributeValues[":email"] = validatedData.email;
            // Also set email verification to false on change
            updateExpressions.push("#is_verified_email = :is_verified_email");
            expressionAttributeNames["#is_verified_email"] = "is_verified_email";
            expressionAttributeValues[":is_verified_email"] = false;
        }

        if (validatedData.phone) {
            // Check for phone uniqueness before updating
            const existingPhone = await ddbDocClient.send(new QueryCommand({
                TableName: USERS_TABLE,
                IndexName: "phone-index",
                KeyConditionExpression: "phone = :phone",
                ExpressionAttributeValues: { ":phone": validatedData.phone },
                Limit: 1,
            }));

            if (existingPhone.Count && existingPhone.Count > 0) {
                // If a different user already has this phone, throw an error
                if (existingPhone.Items?.[0]?.pk !== pk) {
                    throw new Error("Phone number is already in use by another user.");
                }
            }
            updateExpressions.push("#phone = :phone");
            expressionAttributeNames["#phone"] = "phone";
            expressionAttributeValues[":phone"] = validatedData.phone;
            // Also set phone verification to false on change
            updateExpressions.push("#is_verified_phone = :is_verified_phone");
            expressionAttributeNames["#is_verified_phone"] = "is_verified_phone";
            expressionAttributeValues[":is_verified_phone"] = false;
        }

        // Build expressions for all other fields dynamically
        for (const [key, value] of Object.entries(validatedData)) {
            // Skip the special fields we already handled
            if (key === "password" || key === "email" || key === "phone") continue;

            const namePlaceholder = `#${key}`;
            const valuePlaceholder = `:${key}`;
            updateExpressions.push(`${namePlaceholder} = ${valuePlaceholder}`);
            expressionAttributeNames[namePlaceholder] = key;
            expressionAttributeValues[valuePlaceholder] = value;
        }

        const updateCommand = new UpdateCommand({
            TableName: USERS_TABLE,
            Key: { pk, sk },
            UpdateExpression: `SET ${updateExpressions.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ConditionExpression: "attribute_exists(pk)", // Ensure the item exists before updating
            ReturnValues: "ALL_NEW", // Return the updated item
        });

        const result = await ddbDocClient.send(updateCommand);

        if (!result.Attributes) {
            throw new Error("Update failed: no attributes returned.");
        }

        console.log(`User ${userId} updated successfully.`);
        return result.Attributes as DbUserItem;

    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            console.error("Update validation error:", error.issues);
            throw new Error(`Validation failed: ${error.issues.map(e => e.message).join(', ')}`);
        } else if (error instanceof ConditionalCheckFailedException) {
            console.error("DynamoDB ConditionalCheckFailedException during update:", error);
            throw new Error(`User with ID ${userId} not found.`);
        } else if (error instanceof Error) {
            console.error("Error during user update:", error.message);
            throw error;
        } else {
            console.error("An unknown error occurred during update:", error);
            throw new Error("An unexpected error occurred during update.");
        }
    }
}

export async function getUserProfile(userId: string): Promise<DbUserItem | null> {
    const command = new GetCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `USER#${userId}`,
            sk: "PROFILE",
        },
    });

    try {
        const { Item } = await ddbDocClient.send(command);
        return Item as DbUserItem | null;
    } catch (error: unknown) {
        console.error(`Error fetching company profile for ID ${userId}:`, error);
        throw new Error("Failed to retrieve company profile.");
    }
}

export async function saveOTP(userId: string, otp: string): Promise<void> {
    // Check for 60-second cooldown
    const userProfile = await getUserProfile(userId);
    if (userProfile && (userProfile as any).last_otp_sent_at) {
        const lastSent = (userProfile as any).last_otp_sent_at;
        const now = Date.now();
        const diff = (now - lastSent) / 1000;
        if (diff < 60) {
            throw new Error(`Please wait ${Math.ceil(60 - diff)} seconds before requesting a new OTP.`);
        }
    }

    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    const now = Date.now();

    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `USER#${userId}`,
            sk: "PROFILE",
        },
        UpdateExpression: "SET phone_verification_otp = :otp, phone_verification_expiry = :expiry, last_otp_sent_at = :lastSent",
        ExpressionAttributeValues: {
            ":otp": otp,
            ":expiry": otpExpiry,
            ":lastSent": now
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`OTP saved for user ${userId}`);
    } catch (error) {
        console.error(`Failed to save OTP for user ${userId}:`, error);
        throw new Error("Failed to generate OTP. Please try again.");
    }
}

export async function verifyStoredOTP(userId: string, otp: string): Promise<boolean> {
    try {
        console.log(`[VerifyOTP] User: ${userId}, Received Input: '${otp}'`);

        // Use ConsistentRead to ensure we get the latest OTP
        const command = new GetCommand({
            TableName: USERS_TABLE,
            Key: {
                pk: `USER#${userId}`,
                sk: "PROFILE",
            },
            ConsistentRead: true, // CRITICAL: Ensure we read the write immediately
        });

        const { Item: user } = await ddbDocClient.send(command);

        if (!user) {
            console.error(`[VerifyOTP] User profile not found for ID: ${userId}`);
            return false;
        }

        // Bypassing type check since these fields are dynamic
        const storedOtp = (user as any).phone_verification_otp;
        const expiry = (user as any).phone_verification_expiry;
        const now = Date.now();

        console.log(`[VerifyOTP] Stored: '${storedOtp}', Expiry: ${expiry}, CurrentTime: ${now}`);

        if (!storedOtp || !expiry) {
            console.warn(`[VerifyOTP] No active OTP found for user ${userId}. Stored: ${storedOtp}, Expiry: ${expiry}`);
            return false;
        }

        if (now > expiry) {
            console.warn(`[VerifyOTP] OTP expired for user ${userId}. Diff: ${now - expiry}ms`);
            return false;
        }

        // Ensure string comparison
        const storedOtpStr = String(storedOtp).trim();
        const inputOtpStr = String(otp).trim();

        console.log(`[VerifyOTP] DEBUG VALUES:`);
        console.log(`  -> User ID: ${userId}`);
        console.log(`  -> Stored OTP: '${storedOtpStr}' (Type: ${typeof storedOtp})`);
        console.log(`  -> Input OTP : '${inputOtpStr}' (Type: ${typeof otp})`);
        console.log(`  -> Match?: ${storedOtpStr === inputOtpStr}`);

        const isValid = storedOtpStr === inputOtpStr;
        console.log(`[VerifyOTP] Verification Result: ${isValid}`);

        if (isValid) {
            // Clear OTP after successful use and set verified status
            console.log(`[VerifyOTP] Success! Clearing OTP and setting verified status.`);
            await ddbDocClient.send(new UpdateCommand({
                TableName: USERS_TABLE,
                Key: {
                    pk: `USER#${userId}`,
                    sk: "PROFILE",
                },
                UpdateExpression: "REMOVE phone_verification_otp, phone_verification_expiry SET is_verified_phone = :verified",
                ExpressionAttributeValues: {
                    ":verified": true
                }
            }));
        }


        return isValid;
    } catch (error) {
        console.error(`Error verifying OTP for user ${userId}:`, error);
        return false;
    }
}

export async function saveEmailOTP(userId: string, otp: string): Promise<void> {
    // Check for 60-second cooldown
    const userProfile = await getUserProfile(userId);
    if (userProfile && (userProfile as any).last_email_otp_sent_at) {
        const lastSent = (userProfile as any).last_email_otp_sent_at;
        const now = Date.now();
        const diff = (now - lastSent) / 1000;
        if (diff < 60) {
            throw new Error(`Please wait ${Math.ceil(60 - diff)} seconds before requesting a new OTP.`);
        }
    }

    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
    const now = Date.now();

    const command = new UpdateCommand({
        TableName: USERS_TABLE,
        Key: {
            pk: `USER#${userId}`,
            sk: "PROFILE",
        },
        UpdateExpression: "SET email_verification_otp = :otp, email_verification_expiry = :expiry, last_email_otp_sent_at = :lastSent",
        ExpressionAttributeValues: {
            ":otp": otp,
            ":expiry": otpExpiry,
            ":lastSent": now
        }
    });

    try {
        await ddbDocClient.send(command);
        console.log(`Email OTP saved for user ${userId}`);
    } catch (error) {
        console.error(`Failed to save Email OTP for user ${userId}:`, error);
        throw new Error("Failed to generate OTP. Please try again.");
    }
}

export async function verifyEmailOTP(userId: string, otp: string): Promise<boolean> {
    try {
        const user = await getUserProfile(userId);
        if (!user) return false;

        // Bypassing type check since these fields are dynamic
        const storedOtp = (user as any).email_verification_otp;
        const expiry = (user as any).email_verification_expiry;

        if (!storedOtp || !expiry) {
            console.warn(`No Email OTP found for user ${userId}`);
            return false;
        }

        if (Date.now() > expiry) {
            console.warn(`Email OTP expired for user ${userId}`);
            return false;
        }

        const isValid = storedOtp === otp;

        if (isValid) {
            // Clear OTP after successful use and set verified status
            await ddbDocClient.send(new UpdateCommand({
                TableName: USERS_TABLE,
                Key: {
                    pk: `USER#${userId}`,
                    sk: "PROFILE",
                },
                UpdateExpression: "REMOVE email_verification_otp, email_verification_expiry SET is_verified_email = :verified",
                ExpressionAttributeValues: {
                    ":verified": true
                }
            }));
        }

        return isValid;
    } catch (error) {
        console.error(`Error verifying Email OTP for user ${userId}:`, error);
        return false;
    }
}

export async function deleteUser(userId: string): Promise<void> {
    const pk = `USER#${userId}`;
    const sk = "PROFILE";

    const deleteCommand = new DeleteCommand({
        TableName: USERS_TABLE,
        Key: { pk, sk },
    });

    try {
        await ddbDocClient.send(deleteCommand);
        console.log(`User ${userId} deleted successfully.`);
    } catch (error) {
        console.error(`Error deleting user ${userId}:`, error);
        throw new Error("Failed to delete user account.");
    }
}
