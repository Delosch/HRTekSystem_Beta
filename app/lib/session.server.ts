/*
 * This module provides session management using DynamoDB as a custom session storage.
 * It replaces the file-based storage with a more robust, scalable, and production-ready solution.
 */

import { createSessionStorage, createCookie, redirect, json } from "@remix-run/node";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import {
    PutCommand,
    GetCommand,
    DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { authSessionSchema, SessionData, sessionDataSchema } from "~/schemas/sessionSchema";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";

// Prevents multiple DynamoDB client initializations.
let ddbDocClient: ReturnType<typeof getDynamoDBDocumentClient>;
try {
    ddbDocClient = getDynamoDBDocumentClient();
} catch (e: unknown) {
    if (e instanceof Error) {
        console.error(`⚠️ WARNING: DynamoDB client initialization failed: ${e.message}`);
    } else {
        console.error("⚠️ WARNING: DynamoDB client initialization failed with an unknown error.");
    }
    // Removed process.exit(1) to prevent dev server crashes on temporary network issues
}

// Define the name of your DynamoDB table.
// Ensure this table exists in your DynamoDB instance with `sessionId` as the primary key.
const SESSIONS_TABLE = "sessions";
// Session duration: 24 hours
const expiryTime = 60 * 60 * 24;

// Create a cookie to store the session ID on the client.
const session_cookie = createCookie("__session", {
    // Use environment secret if available, with fallbacks for local security
    secrets: process.env.SESSION_SECRET ? [process.env.SESSION_SECRET] : ["4d186321c1a7f0f354b297e8914ab240", "5d41402abc4b2a76b9719d911017c592", "16e2d966d4ab046e2442bc008b4da566"],
    httpOnly: true,
    maxAge: expiryTime,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: '/',
});

export const { getSession, commitSession, destroySession } = createSessionStorage({
    cookie: session_cookie,

    /**
     * Creates a new session in the DynamoDB table.
     * @param data The session data to store.
     * @param expires An optional expiration date.
     * @returns The unique session ID.
     */
    async createData(data, expires) {
        const sessionId = uuidv4();
        // DynamoDB uses epoch time for TTL.
        // It's important to have a TTL attribute enabled on the DynamoDB table for this to work.
        // If Remix provides an 'expires' date (from cookie maxAge), use it.
        // Otherwise, default to Date.now() + expiryTime.
        const expiresAt = expires ? Math.floor(expires.getTime() / 1000) : Math.floor(Date.now() / 1000) + expiryTime;

        // Use the PutCommand to store the session data.
        const command = new PutCommand({
            TableName: SESSIONS_TABLE,
            Item: {
                sessionId,
                data,
                expiresAt: expiresAt,
            },
        });

        await ddbDocClient.send(command);
        console.log(`✅ [SESSION STORAGE] Created session: ${sessionId}`);
        return sessionId;
    },

    /**
     * Reads session data from the DynamoDB table.
     * @param sessionId The ID of the session to retrieve.
     * @returns The session data, or null if not found or expired.
     */
    async readData(sessionId) {
        if (!sessionId) {
            return null;
        }

        // Add retry logic to prevent race conditions during session creation
        // DynamoDB writes are eventually consistent by default, so a slight delay
        // might occur before the item is readable.
        for (let i = 0; i < 2; i++) {
            const command = new GetCommand({
                TableName: SESSIONS_TABLE,
                Key: { sessionId },
            });

            const { Item } = await ddbDocClient.send(command);

            if (Item) {
                console.log(`🔍 [SESSION STORAGE] Reading session: ${sessionId} - Found`);

                const nowInSeconds = Math.floor(Date.now() / 1000);
                // Check if the session has expired based on the TTL.
                if (Item.expiresAt && Item.expiresAt < nowInSeconds) {
                    // If expired, delete the session and return null.
                    const command = new DeleteCommand({
                        TableName: SESSIONS_TABLE,
                        Key: { sessionId },
                    });
                    await ddbDocClient.send(command);
                    return null;
                }

                // Return the session data if it's valid.
                return Item.data;
            }

            // If not found, wait slightly before retrying
            if (i === 0) {
                console.warn(`⏳ [SESSION STORAGE] Session ${sessionId} not found on first attempt, retrying in 50ms...`);
                await new Promise(r => setTimeout(r, 50));
            }
        }

        console.log(`🔍 [SESSION STORAGE] Reading session: ${sessionId} - Not Found`);
        return null;
    },

    /**
     * Updates an existing session's data in the DynamoDB table.
     * @param sessionId The ID of the session to update.
     * @param data The new session data.
     * @param expires An optional new expiration date.
     */
    async updateData(sessionId, data, expires) {
        if (!sessionId) {
            return;
        }
        const expiresAt = expires ? Math.floor(expires.getTime() / 1000) : Math.floor(Date.now() / 1000) + expiryTime;

        const command = new PutCommand({
            TableName: SESSIONS_TABLE,
            Item: {
                sessionId,
                data,
                expiresAt: expiresAt,
            },
        });

        await ddbDocClient.send(command);
        console.log(`update [SESSION STORAGE] Updated session: ${sessionId}`);
    },

    /**
     * Deletes a session from the DynamoDB table.
     * @param sessionId The ID of the session to delete.
     */
    async deleteData(sessionId) {
        if (!sessionId) {
            return;
        }
        const command = new DeleteCommand({
            TableName: SESSIONS_TABLE,
            Key: { sessionId },
        });

        await ddbDocClient.send(command);
        console.log(`🗑️ [SESSION STORAGE] Deleted session: ${sessionId}`);
    }
});


/**
 * Creates an authenticated session for a user.
 *
 * @param data - The user data to store in the session, validated by authSessionSchema.
 * @param redirectTo - The URL to redirect to after successful session creation.
 * @returns A Remix Response object for redirection.
 * @throws {Response} A Remix Response object with an error status if validation or session commitment fails.
 */
export async function createAuthSession(
    request: Request,
    data: any,
    redirectTo: string = '/auth/drx' // Default redirect path
): Promise<Response> {
    let validatedData: z.infer<typeof authSessionSchema>;
    try {
        validatedData = authSessionSchema.parse(data);
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.error("❌ Session Data Validation Failed:", JSON.stringify(error.flatten().fieldErrors, null, 2));
        } else {
            console.error("❌ Session login failed: Unknown validation error");
        }
        return json({ error: "Authentication successful, but session initialization failed. Please contact support." }, { status: 400 });
    }

    const session = await getSession(request.headers.get("Cookie"));

    // Set all validated user data into the session
    Object.entries(validatedData).forEach(([key, value]) => {
        session.set(key, value);
    });

    try {
        return redirect(redirectTo, {
            headers: {
                "Set-Cookie": await commitSession(session),
            },
        });
    } catch (error) {
        console.error("Failed to commit session:", error);
        // Return an internal server error response if session commitment fails
        return json({ message: "Failed to create session." }, { status: 500 });
    }
}

/**
 * Retrieves the user's session data.
 *
 * @param request - The incoming Request object.
 * @returns The parsed session data, or null if no valid session exists.
 */
export async function getUserSession(request: Request): Promise<SessionData | null> {
    const session = await getSession(request.headers.get("Cookie"));
    const userId = session.get("userId");

    if (!userId) {
        return null; // No user ID in session, so no active user session
    }

    try {
        // Retrieve all session data and validate against the schema
        const sessionData: SessionData = {
            userId: session.get("userId"),
            first_name: session.get("first_name"),
            last_name: session.get("last_name"),
            email: session.get("email"),
            phone: session.get("phone"),
            is_verified_phone: session.get("is_verified_phone"),
            is_verified_email: session.get("is_verified_email"),
            onboardingStatus: session.get("onboardingStatus"),
            organisationId: session.get("organisationId"),
            country_iso: session.get("country_iso"),
            two_fa_enabled: session.get("two_fa_enabled") ?? false,
            photoUrl: session.get("photoUrl") ?? null,
            username: session.get("username") ?? null,
            isAdmin: session.get("isAdmin") ?? false
        };

        // Ensure all required fields are present and valid according to sessionDataSchema
        const validatedSessionData = sessionDataSchema.parse(sessionData);
        return validatedSessionData;
    } catch (error) {
        console.error("Error parsing or validating session data:", error);
        // If session data is corrupted or invalid, destroy it to prevent issues
        // and return null, effectively logging the user out.
        const headers = new Headers();
        headers.append("Set-Cookie", await destroySession(session));
        throw redirect("/auth", { headers }); // Redirect to login after destroying bad session
    }
}

/**
 * Requires an authenticated user session. If no session is found,
 * it redirects to the login page.
 *
 * @param request - The incoming Request object.
 * @returns The user's session data if authenticated.
 * @throws {Response} A Remix Response object for redirection if no session is found.
 */
export async function requireUserSession(request: Request): Promise<SessionData> {
    const userSession = await getUserSession(request);

    if (!userSession) {
        // If no user session, redirect to login page with the original URL as redirectTo
        const url = new URL(request.url);
        const redirectTo = url.pathname + url.search;
        throw redirect(`/auth?redirectTo=${encodeURIComponent(redirectTo)}`);
    }

    return userSession;
}

/**
 * Requires an authenticated admin session. If no admin session is found,
 * it redirects to the admin login page.
 *
 * @param request - The incoming Request object.
 * @returns The user's session data if authenticated as admin.
 * @throws {Response} A Remix Response object for redirection if no admin session is found.
 */
export async function requireAdminSession(request: Request): Promise<SessionData> {
    const userSession = await getUserSession(request);

    if (!userSession || !userSession.isAdmin) {
        throw redirect('/admin/login');
    }

    return userSession;
}

/**
 * Destroys the current user session and redirects to a specified path.
 *
 * @param request - The incoming Request object.
 * @param redirectTo - The URL to redirect to after logout. Defaults to '/'.
 * @returns A Remix Response object for redirection.
 */
export async function logout(request: Request, redirectTo: string = '/'): Promise<Response> {
    const session = await getSession(request.headers.get("Cookie"));
    try {
        return redirect(redirectTo, {
            headers: {
                "Set-Cookie": await destroySession(session),
            },
        });
    } catch (error) {
        console.error("Failed to destroy session during logout:", error);
        // Even if destroying fails, attempt to redirect to prevent infinite loops
        return redirect(redirectTo, { status: 500 });
    }
}
