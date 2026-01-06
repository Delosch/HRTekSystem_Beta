import { requireUserSession } from "~/lib/session.server";
import { getUserProfile } from "~/models/user.model";
import { getCompanyProfile } from "~/models/company.model";
import { redirect } from "@remix-run/node";

/**
 * Fetches the user session and supplements it with full profile and organization data
 * for use in dashboards where the sidebar needs complete user information.
 */
export async function getEnhancedUser(request: Request) {
    const userSession = await requireUserSession(request);

    // FETCH FRESH USER PROFILE & COMPANY DATA
    let userProfile: any = {};
    let organisationName = "";

    try {
        const [profile, company] = await Promise.all([
            getUserProfile(userSession.userId).catch((e: any) => {
                console.error("User profile fetch failed", e);
                return null;
            }),
            userSession.organisationId ? getCompanyProfile(userSession.organisationId).catch((e: any) => {
                console.error("Company profile fetch failed", e);
                return null;
            }) : Promise.resolve(null)
        ]);

        userProfile = profile || {};
        if (company) {
            organisationName = company.company_name;
        }
    } catch (e) {
        console.error("Error fetching enhanced user details", e);
    }

    return {
        ...userSession,
        ...userProfile,
        organisationName: organisationName || (userSession as any).organisationName || "Organization",
        role: userProfile.role || (userSession as any).role || "Team Member",
        name: userProfile.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}` : (userSession.first_name ? `${userSession.first_name} ${userSession.last_name || ''}` : "User")
    };
}
