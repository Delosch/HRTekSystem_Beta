import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { createAuthSession } from "~/lib/session.server";
import { loginUser } from "~/models/user.model";

/**
 * TEST LOGIN ROUTE - DEVELOPMENT ONLY
 * Automatically logs in with mass@mail.com for testing
 * ⚠️ REMOVE IN PRODUCTION
 */
export async function action({ request }: ActionFunctionArgs) {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
        throw new Response("Not Found", { status: 404 });
    }

    try {
        const testEmail = "mass@mail.com";
        const testPassword = "Test@123";

        console.log("🧪 TEST LOGIN: Attempting auto-login for", testEmail);

        // Use the standard login function
        const user = await loginUser(testEmail, testPassword);

        console.log("✅ TEST LOGIN: User authenticated, creating session");

        // Create session
        return createAuthSession({
            userId: user.userId,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone || "(+91)0000000000", // Default phone in correct format
            is_verified_phone: user.is_verified_phone || false,
            is_verified_email: user.is_verified_email || false,
            onboardingStatus: user.onboardingStatus || "not_started",
            organisationId: user.organisationId || "",
            country_iso: user.country_iso || "IN",
            two_fa_enabled: user.two_fa_enabled || false
        }, "/dashboard");

    } catch (error) {
        console.error("❌ TEST LOGIN ERROR:", error);
        const errorMessage = error instanceof Error ? error.message : "test_login_failed";
        return redirect(`/auth?error=${encodeURIComponent(errorMessage)}`);
    }
}

export async function loader() {
    // Only allow in development
    if (process.env.NODE_ENV === 'production') {
        throw new Response("Not Found", { status: 404 });
    }

    // Redirect GET requests to auth page
    return redirect("/auth");
}
