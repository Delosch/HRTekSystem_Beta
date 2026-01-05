/**
 * IMMEDIATE FIX: Clear the stuck error state
 * Run this script to reset the AI status and stop the infinite polling
 */

import { setAIStatus } from "./app/services/ai-status.server.ts";

// The company ID that's stuck in error state
const stuckCompanyId = "86cf4586-3a71-470f-a63f-edaca44f5c6b";

console.log(`🔧 Clearing error state for company: ${stuckCompanyId}`);

// Set it to 'ready' to stop the polling
setAIStatus(stuckCompanyId, "ready");

console.log(`✅ Status set to 'ready' - polling should stop now`);
console.log(`   Refresh your browser to see the change`);
