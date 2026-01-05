/**
 * Utility script to reset AI status for testing
 * Run this to clear the error state and test the assessment flow again
 */

import { setAIStatus } from "./app/services/ai-status.server";

const companyId = "86cf4586-3a71-470f-a63f-edaca44f5c6b"; // Your test company ID

console.log(`🔄 Resetting AI status for company: ${companyId}`);

// Clear the status by setting it to undefined (will be treated as new)
// Since the status is in-memory, you can also just restart the server
console.log("✅ To reset the status, restart your dev server with: npm run dev");
console.log("   Or wait for the next assessment submission to trigger a new generation");

// If you want to manually set it to pending to trigger a retry:
// setAIStatus(companyId, "pending");
// console.log("✅ Status reset to pending - AI generation will retry on next page load");
