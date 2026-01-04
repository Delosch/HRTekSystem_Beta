import { redirect } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    // Redirect to admin home for now
    // TODO: Implement analytics engines page
    return redirect("/admin");
};

export default function AnalyticsEngines() {
    return null;
}
