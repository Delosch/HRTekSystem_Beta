import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { getEngineAccessStatuses } from "~/models/payment.model.server";

// Map sidebar engine paths to payment dashboard engine names
const SIDEBAR_PATH_TO_PAYMENT_ENGINE: Record<string, string> = {
  "/roadmapDashboard": "HR Digital Roadmap",
  "/vendorDashboard": "HR HCM Vendor Fit",
  "/ai-maturity/dashboard": "HR Tech Diagnostics",
  "/sharedDashboard": "HR Shared Services",
  "/changeDashboard": "Intelligent Change Management System",
};

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireUserSession(request);
    if (!user?.organisationId) {
      return json({ accessByPath: {} });
    }

    const paymentEngineNames = [...new Set(Object.values(SIDEBAR_PATH_TO_PAYMENT_ENGINE))];
    const paymentAccessMap = await getEngineAccessStatuses(user.organisationId, paymentEngineNames);

    // Build path → unlocked map
    const accessByPath: Record<string, boolean> = {};
    for (const [path, paymentName] of Object.entries(SIDEBAR_PATH_TO_PAYMENT_ENGINE)) {
      const access = paymentAccessMap[paymentName];
      accessByPath[path] = access?.assessmentUnlocked ?? false;
    }

    return json({ accessByPath });
  } catch {
    return json({ accessByPath: {} });
  }
}
