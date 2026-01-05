import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getAIStatus } from "~/services/ai-status.server";

// Import the same AI status manager (in production, use shared database)

// ✅ Track when errors were first detected to force timeout
const errorTimestamps = new Map<string, number>();

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const url = new URL(request.url);
    const companyId = url.searchParams.get("companyId");

    if (!companyId) {
      return json({
        status: 'error',
        error: 'Company ID is required',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    let status = getAIStatus(companyId.trim()) || 'pending'; // Handle undefined here

    // ✅ FIX: Force timeout if error persists too long
    if (status === 'error') {
      const now = Date.now();
      if (!errorTimestamps.has(companyId)) {
        errorTimestamps.set(companyId, now);
      }

      const errorDuration = (now - errorTimestamps.get(companyId)!) / 1000;

      // After 5 seconds of error state, return 'timeout' to force UI to show error
      if (errorDuration > 5) {
        console.log(`⚠️ Forcing timeout for ${companyId} after ${errorDuration}s in error state`);
        status = 'timeout' as any;
      }
    } else {
      // Clear error timestamp if not in error state
      errorTimestamps.delete(companyId);
    }

    return json({
      status,
      companyId: companyId.trim(),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("AI Status API error:", error);
    return json({
      status: 'error',
      error: 'Failed to check AI report status',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
