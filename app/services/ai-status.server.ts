const aiReportStatus = new Map<string, 'pending' | 'ready' | 'error'>();

export function getAIStatus(companyId: string): 'pending' | 'ready' | 'error' | undefined {
  console.log(`[Service] Getting status for ${companyId}: ${aiReportStatus.get(companyId)}`);
  return aiReportStatus.get(companyId); // Remove the || 'pending'
}

export function setAIStatus(companyId: string, status: 'pending' | 'ready' | 'error'): void {
  console.log(`[Service] Setting status for ${companyId} to ${status}`);
  aiReportStatus.set(companyId, status);
}

export function hasAIStatus(companyId: string): boolean {
  return aiReportStatus.has(companyId);
}
