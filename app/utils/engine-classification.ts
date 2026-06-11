/**
 * Engine classification utilities — shared between client and server
 * These are pure functions with no server dependencies.
 */

const CORE_ENGINE_CANONICAL_NAMES = [
    "HR Digital Roadmap",
    "HR HCM Vendor Fit",
    "HR Tek Diagnostics",
    "HR Shared Service"
] as const;

const ADVANCED_ENGINE_CANONICAL_NAMES = [
    "HR Shared Service Engine",
    "ICMS",
    "HII"
] as const;

export const CORE_ENGINE_NAMES_CLIENT = [
    "HR Digital Roadmap",
    "HR HCM Vendor Fit",
    "HR Tech Diagnostics",
    "HR Shared Services"
] as const;

export const ADVANCED_ENGINE_NAMES_CLIENT = [
    "HR Shared Service Engine",
    "Intelligent Change Management System",
    "HR Tech Advisory"
] as const;

export function isCoreEngineClient(engineName: string): boolean {
    const canonical = canonicalEngineNameClient(engineName);
    return (CORE_ENGINE_CANONICAL_NAMES as readonly string[]).includes(canonical);
}

export function isAdvancedEngineClient(engineName: string): boolean {
    const canonical = canonicalEngineNameClient(engineName);
    return (ADVANCED_ENGINE_CANONICAL_NAMES as readonly string[]).includes(canonical);
}

export function normalizeEngineNameClient(name: string): string {
    return (name || "").trim().toLowerCase();
}

export const ENGINE_NAME_CANONICAL_MAP_CLIENT: Record<string, string> = {
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
    "ai driven maturity engine": "HR Tek Diagnostics",
    "hr tek diagnostics": "HR Tek Diagnostics",
    
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

export function canonicalEngineNameClient(name: string): string {
    const normalized = normalizeEngineNameClient(name);
    return ENGINE_NAME_CANONICAL_MAP_CLIENT[normalized] || name.trim();
}

export type EngineClassificationType = "core" | "advanced";

export function getEngineClassificationClient(engineName: string): EngineClassificationType | undefined {
    const canonical = canonicalEngineNameClient(engineName);
    if ((CORE_ENGINE_CANONICAL_NAMES as readonly string[]).includes(canonical)) return "core";
    if ((ADVANCED_ENGINE_CANONICAL_NAMES as readonly string[]).includes(canonical)) return "advanced";
    return undefined;
}
