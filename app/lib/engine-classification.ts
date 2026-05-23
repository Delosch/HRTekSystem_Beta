/**
 * Shared engine classification utilities
 * Safe to use on both client and server side
 */

export const CORE_ENGINE_NAMES = [
    "HR Digital Roadmap",
    "HR HCM Vendor Fit",
    "HR Tek Diagnostics",
    "HR Shared Service"
] as const;

export const ADVANCED_ENGINE_NAMES = [
    "HR Shared Service Engine",
    "ICMS",
    "HII"
] as const;

export type EngineClassification = "core" | "advanced";

const ENGINE_NAME_CANONICAL_MAP: Record<string, string> = {
    // Core engines
    "hr transformation roadmap generator": "HR Digital Roadmap",
    "hr digital roadmap": "HR Digital Roadmap",
    "hcm vendor fit engine": "HR HCM Vendor Fit",
    "hr hcm vendor fit": "HR HCM Vendor Fit",
    "cognitive hcm vendor fit engine": "HR HCM Vendor Fit",
    "shared service designer": "HR Shared Service",
    "shared services": "HR Shared Service",
    "shared services operating model planner": "HR Shared Service",
    "hr shared services": "HR Shared Service",
    "hr shared service": "HR Shared Service",
    "hr tech diagnostics": "HR Tek Diagnostics",
    "hr technology maturity analysis": "HR Tek Diagnostics",
    "ai-driven hr tech diagnostics": "HR Tek Diagnostics",
    
    // Advanced engines
    "hr shared service engine": "HR Shared Service Engine",
    "decision engine": "HR Shared Service Engine",
    "intelligent change management system": "ICMS",
    "intelligent change management": "ICMS",
    "hr change management": "ICMS",
    "icms": "ICMS",
    "hti - hr transformation intelligence": "HII",
    "hr tech advisory": "HII",
    "hti": "HII",
    "transformative engine": "HII",
    "hr transformation intelligence": "HII",
    "hii": "HII",
};

function normalizeEngineName(name: string): string {
    return name.toLowerCase().trim();
}

export function canonicalEngineName(name: string): string {
    const normalized = normalizeEngineName(name);
    return ENGINE_NAME_CANONICAL_MAP[normalized] || name.trim();
}

export function getEngineClassification(engineName: string): EngineClassification | undefined {
    const canonical = canonicalEngineName(engineName);
    if ((CORE_ENGINE_NAMES as readonly string[]).includes(canonical)) return "core";
    if ((ADVANCED_ENGINE_NAMES as readonly string[]).includes(canonical)) return "advanced";
    return undefined;
}

export function isCoreEngine(engineName: string): boolean {
    return getEngineClassification(engineName) === "core";
}

export function isAdvancedEngine(engineName: string): boolean {
    return getEngineClassification(engineName) === "advanced";
}
