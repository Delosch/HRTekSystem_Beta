import { requireUserSession } from "~/lib/session.server";
import { getUserProfile } from "~/models/user.model.server";
import { getCompanyProfile } from "~/models/company.model.server";
import { redirect } from "@remix-run/node";
import {CONFIDENTIAL_CLIENT_NAME,isInternalCompanyIdentifier,resolveReportClientIdentity} from "~/utils/reportClientIdentity";

/**
 * Fetches the user session and supplements it with full profile and organization data
 * for use in dashboards where the sidebar needs complete user information.
 */
export async function getEnhancedUser(request: Request) {
    const userSession = await requireUserSession(request);

    // FETCH FRESH USER PROFILE & COMPANY DATA
    let userProfile: any = {};
    let organisationName =CONFIDENTIAL_CLIENT_NAME;
    let companyLogo: string | null =null;

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

        userProfile =profile || {};
        const sessionOrganisationName =typeof (userSession as any).organisationName ==="string"? (userSession as any ).organisationName.trim(): "";
        const safeSessionOrganisationName =sessionOrganisationName &&!isInternalCompanyIdentifier(sessionOrganisationName)? sessionOrganisationName: "";
        const companyIdentity =resolveReportClientIdentity(company);
        organisationName =companyIdentity.companyName !==CONFIDENTIAL_CLIENT_NAME? companyIdentity.companyName: safeSessionOrganisationName ||CONFIDENTIAL_CLIENT_NAME;
        companyLogo =companyIdentity.logoUrl;

    } catch (e) {
        console.error("Error fetching enhanced user details", e);
    }

    return {
        ...userSession,
        ...userProfile,
        organisationName,
        companyLogo,
        role: userProfile.role || (userSession as any).role || "Team Member",
        name: userProfile.first_name ? `${userProfile.first_name} ${userProfile.last_name || ''}` : (userSession.first_name ? `${userSession.first_name} ${userSession.last_name || ''}` : "User")
    };
}
