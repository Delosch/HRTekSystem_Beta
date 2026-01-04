import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { getAIStatus } from "~/services/ai-status.server";

// Import the same AI status manager (in production, use shared database)

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
    
    const status = getAIStatus(companyId.trim()) || 'pending'; // Handle undefined here
    
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
