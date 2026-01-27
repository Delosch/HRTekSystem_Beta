import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { logout, getSession } from "~/lib/session.server";

export async function action({ request }: ActionFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const isAdmin = session.get("isAdmin");

    // If admin, redirect to admin login, otherwise to home
    const redirectTo = isAdmin ? "/admin/login" : "/";
    return logout(request, redirectTo);
}

export async function loader({ request }: LoaderFunctionArgs) {
    const session = await getSession(request.headers.get("Cookie"));
    const isAdmin = session.get("isAdmin");

    const redirectTo = isAdmin ? "/admin/login" : "/";
    return logout(request, redirectTo);
}
