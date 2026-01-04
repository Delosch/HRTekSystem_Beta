import { json, type ActionFunctionArgs } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { lockReport, unlockReport } from "~/models/hti.model";

/**
 * API Route: HTI Report Lock/Unlock
 * POST /api/hti/lock
 * Body: { reportId, companyId, action: "lock" | "unlock" }
 */

export async function action({ request }: ActionFunctionArgs) {
    try {
        const user = await requireUserSession(request);

        // Check if user is admin
        const userWithRole = user as any;
        if (userWithRole.role !== "admin" && process.env.NODE_ENV === "production") {
            return json(
                { error: "Unauthorized: Admin access required" },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { reportId, companyId, action } = body;

        if (!reportId || !companyId || !action) {
            return json(
                { error: "Missing required fields: reportId, companyId, action" },
                { status: 400 }
            );
        }

        if (!["lock", "unlock"].includes(action)) {
            return json(
                { error: "Invalid action. Must be: lock or unlock" },
                { status: 400 }
            );
        }

        let result;
        if (action === "lock") {
            result = await lockReport(companyId, reportId, user.userId);
        } else {
            result = await unlockReport(companyId, reportId, user.userId);
        }

        if (!result.success) {
            return json(
                { error: result.error },
                { status: 400 }
            );
        }

        return json({
            success: true,
            message: `Report ${action}ed successfully`,
            reportId,
            isLocked: action === "lock"
        });
    } catch (error) {
        console.error("Error processing lock/unlock:", error);
        return json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
