import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { createAuthSession } from "~/lib/session.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const adminId = "00000000-0000-4000-a000-000000000000";
  const ADMIN_EMAIL = "atul.dixit@hrteksystems.in";
  const ADMIN_PHONE = "+919935959986";

  // Directly log in as admin and redirect to /admin
  return await createAuthSession(request, {
    userId: adminId,
    email: ADMIN_EMAIL,
    first_name: "Atul",
    last_name: "Dixit",
    isAdmin: true,
    onboardingStatus: "Completed",
    is_verified_email: true,
    is_verified_phone: true,
    two_fa_enabled: true,
    country_iso: "IN",
    phone: ADMIN_PHONE
  }, "/admin");
}
