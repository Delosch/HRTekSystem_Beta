const aiReportStatus = new Map<string, { status: 'pending' | 'ready' | 'error'; timestamp: number }>();

const TIMEOUT_MS = 60 * 1000; // 60 seconds timeout

export function getAIStatus(companyId: string): 'pending' | 'ready' | 'error' | undefined {
  const entry = aiReportStatus.get(companyId);

  if (!entry) {
    console.log(`[Service] Status for ${companyId}: undefined`);
    return undefined;
  }

  // Auto-expire pending if too old
  if (entry.status === 'pending' && Date.now() - entry.timestamp > TIMEOUT_MS) {
    console.log(`[Service] Status for ${companyId} execution timed out (pending > 60s). Resetting.`);
    aiReportStatus.delete(companyId);
    return undefined;
  }

  console.log(`[Service] Status for ${companyId}: ${entry.status}`);
  return entry.status;
}

export function setAIStatus(companyId: string, status: 'pending' | 'ready' | 'error'): void {
  console.log(`[Service] Setting status for ${companyId} to ${status}`);
  aiReportStatus.set(companyId, { status, timestamp: Date.now() });
}

export function hasAIStatus(companyId: string): boolean {
  return aiReportStatus.has(companyId);
}
