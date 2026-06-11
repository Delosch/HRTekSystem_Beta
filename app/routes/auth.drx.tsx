// dynamic redirect and scope based session generator
// its only there to manage pre authform after that change redirect towards dashboard or onboarding and have control from admin

import { json, redirect, type LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserSession } from "~/lib/session.server";
// import {requireUnVerifiedSession } from "~/lib/session.server";

/**
 * Loader function for the DRX route.
 * This route acts as a dynamic redirector based on user verification status.
 *
 * It first ensures a user session exists. If not, it redirects to the login page.
 * Then, it checks the user's phone and email verification status:
 * - If phone is not verified, redirects to the phone verification page.
 * - Else if email is not verified, redirects to the email verification page.
 * - Else if (both phone and email are verified), redirects to the onboarding page.
 *
 * If, for any unexpected reason, no redirect occurs, it returns a JSON response
 * with a message, though this scenario should ideally not be hit with the current logic.
 *
 * @param {Object} args - The arguments object containing the request.
 * @param {Request} args.request - The incoming Request object.
 * @returns {Promise<Response>} A Remix Response object for redirection or JSON data.
 */
export const loader: LoaderFunction = async ({ request }) => {
  // Ensure a user session exists. If not, requireUserSession will throw a redirect.
  // This handles authentication and basic session data integrity.
  //  NONE, COMPANY, ASSESSMENT, COMPLETE ~ onboardingStatus states
  const cookie_container= await requireUserSession(request);
  console.log(cookie_container)
  // Log user details for debugging (optional in production)
  const phoneVerified= cookie_container.is_verified_phone;
  const emailVerified= cookie_container.is_verified_email;
  console.log("DRX Loader: User session found for userId:", cookie_container.userId);
  console.log("Verification Status:", {
    phoneVerified,
    emailVerified,
  });

  // Dynamic redirection logic based on verification status
  if (!phoneVerified && cookie_container.country_iso==="IN") {
    console.log("Redirecting to phone verification for userId:", cookie_container.userId);
    throw redirect("/auth/sms/verify"); // Redirect to phone verification page
  } else if (!emailVerified) {
    console.log("Redirecting to email verification for userId:", cookie_container.userId);
    throw redirect("/auth/email/verify"); // Redirect to email verification page
  } else if(phoneVerified && emailVerified) {
    // All verifications complete, redirect to onboarding or dashboard
    // @@ now we will check if a company profile is already linked with the user or not if yes load that load that 
    // const company_list = getUserCompanyMemberships(user.userId)
    
    if(cookie_container.organisationId==="" || cookie_container.organisationId.length === 0){
      throw redirect("/create-or-join")
    }
    else if (cookie_container.onboardingStatus === "Company"){
      throw redirect("/onboarding/company")
    }
    else if(cookie_container.onboardingStatus==="Assessment"){
      throw redirect("/onboarding/profilingAssessment")
    }
    else if(cookie_container.onboardingStatus ==="Completed"){
      throw redirect("/dashboard")
    }
    console.log("All verifications complete. Redirecting to onboarding for userId:", cookie_container.userId);
    throw redirect("/onboarding"); // Redirect to the onboarding page and now it will see for sub completed form
  }

  // This part of the code should ideally not be reached if the redirects are working as intended.
  // It's included as a fallback, but the primary purpose of this loader is redirection.
  return json({ message: "Unexpected state: No redirect occurred." });
};

/**
 * Default component for the DRX route.
 * This component will only render if, for some unexpected reason,
 * the loader does not issue a redirect.
 * It displays a simple message indicating an unexpected state.
 */
export default function DRX() {
  const { message } = useLoaderData<typeof loader>();

  return (
    <section className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {message}
        </h1>
        <p className="text-gray-600">
          If you are seeing this page, there might be an issue with internal system, please contact the website admin
        </p>
      </div>
    </section>
  );
}
