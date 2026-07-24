export const REPORT_PROMPT_IDS = {
  DIGITAL_MATURITY: "digital_maturity",
  VENDOR_FIT: "vendor_fit",
  DIGITAL_TRANSFORMATION:
    "digital_transformation",
  SHARED_SERVICE: "shared_service",
  CHANGE_MANAGEMENT: "change_management",
  TECH_MATURITY: "tech_maturity",
} as const;

export type ReportPromptId =
  (typeof REPORT_PROMPT_IDS)[keyof typeof REPORT_PROMPT_IDS];

export const HTI_REPORT_TYPES = {
  CROSS_ENGINE: "crossEngine",
  SHARED_SERVICES: "sharedServices",
  CHANGE_MANAGEMENT: "changeManagement",
  VENDOR_FIT: "vendorFit",
  DIGITAL_ROADMAP: "digitalRoadmap",
  AI_MATURITY: "aiMaturity",
} as const;

export type HTIReportType =
  (typeof HTI_REPORT_TYPES)[keyof typeof HTI_REPORT_TYPES];

export type HTIEngineInputKey =
  | "maturity"
  | "roadmap"
  | "vendorFit"
  | "changeManagement"
  | "sharedServices";

export interface ReportEngineConfig {
  displayName: string;
  aliases: readonly string[];
  promptId: ReportPromptId;
  routeSlug: string;
  htiReportType: Exclude<
    HTIReportType,
    "crossEngine"
  >;
  htiInputKey: HTIEngineInputKey;

  /**
   * Current analysis records normally use displayName.
   * Legacy names remain available for read compatibility.
   */
  analysisSections: readonly string[];
}

export const ENGINES = {
  PROFILING: {
    displayName: "Profiling Assessment",

    aliases: [
      "Digital Maturity Assessment",
      "AI Driven Maturity Engine",
      "HR AI Based Digital Maturity",
    ],

    promptId:
      REPORT_PROMPT_IDS.DIGITAL_MATURITY,

    routeSlug: "profiling-assessment",

    htiReportType:
      HTI_REPORT_TYPES.AI_MATURITY,

    htiInputKey: "maturity",

    analysisSections: [
      "Profiling Assessment",
      "Digital Maturity Assessment",
    ],
  },

  HR_TECH_MATURITY: {
    displayName:
      "HR Technology Maturity Analysis",

    aliases: [
      "HR Tech Maturity Analysis",
      "Tech Maturity Engine",
      "Tech Maturity",
    ],

    promptId:
      REPORT_PROMPT_IDS.TECH_MATURITY,

    routeSlug: "hr-tech-maturity",

    htiReportType:
      HTI_REPORT_TYPES.AI_MATURITY,

    htiInputKey: "maturity",

    analysisSections: [
      "HR Technology Maturity Analysis",
      "HR Tech Maturity Analysis",
      "AI Maturity Assessment",
    ],
  },

  ROADMAP: {
    displayName:
      "HR Transformation Roadmap Generator",

    aliases: [
      "HR Transformation Roadmap",
      "Digital Roadmap",
    ],

    promptId:
      REPORT_PROMPT_IDS
        .DIGITAL_TRANSFORMATION,

    routeSlug: "digital-roadmap",

    htiReportType:
      HTI_REPORT_TYPES.DIGITAL_ROADMAP,

    htiInputKey: "roadmap",

    analysisSections: [
      "HR Transformation Roadmap Generator",
      "Digital Roadmap",
    ],
  },

  VENDOR_FIT: {
    displayName: "HCM Vendor Fit Engine",

    aliases: [
      "Cognitive HCM Vendor Fit",
      "HCM Vendor Fit",
    ],

    promptId:
      REPORT_PROMPT_IDS.VENDOR_FIT,

    routeSlug: "hcm-vendor-fit",

    htiReportType:
      HTI_REPORT_TYPES.VENDOR_FIT,

    htiInputKey: "vendorFit",

    analysisSections: [
      "HCM Vendor Fit Engine",
      "Cognitive HCM Vendor Fit",
      "Vendor Fit Assessment",
    ],
  },

  CHANGE_MANAGEMENT: {
    displayName:
      "Intelligent Change Management",

    aliases: [
      "Change Management Readiness",
      "Change Management Assessment",
    ],

    promptId:
      REPORT_PROMPT_IDS.CHANGE_MANAGEMENT,

    routeSlug: "change-management",

    htiReportType:
      HTI_REPORT_TYPES.CHANGE_MANAGEMENT,

    htiInputKey: "changeManagement",

    analysisSections: [
      "Intelligent Change Management",
      "Change Management Readiness",
      "Change Management Assessment",
    ],
  },

  SHARED_SERVICES: {
    displayName: "Shared Service Designer",

    aliases: [
      "Shared Services Designer",
      "SSC/COE Shared Service Planner",
      "Shared Services Assessment",
    ],

    promptId:
      REPORT_PROMPT_IDS.SHARED_SERVICE,

    routeSlug: "shared-services",

    htiReportType:
      HTI_REPORT_TYPES.SHARED_SERVICES,

    htiInputKey: "sharedServices",

    analysisSections: [
      "Shared Service Designer",
      "Shared Services Designer",
      "Shared Services Assessment",
    ],
  },
} as const satisfies Record<
  string,
  ReportEngineConfig
>;

const ENGINE_LIST =
  Object.values(
    ENGINES
  ) as ReportEngineConfig[];

function normalizeIdentifier(
  value: string
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

const engineNameLookup =
  new Map<string, ReportEngineConfig>();

const engineSlugLookup =
  new Map<string, ReportEngineConfig>();

for (const engine of ENGINE_LIST) {
  const allNames = [
    engine.displayName,
    ...engine.aliases,
  ];

  for (const name of allNames) {
    const key = normalizeIdentifier(name);

    const existing =
      engineNameLookup.get(key);

    if (
      existing &&
      existing.displayName !==
        engine.displayName
    ) {
      throw new Error(
        `Duplicate report engine alias "${name}"`
      );
    }

    engineNameLookup.set(key, engine);
  }

  engineSlugLookup.set(
    normalizeIdentifier(engine.routeSlug),
    engine
  );
}

export function resolveReportEngine(
  value: string | null | undefined
): ReportEngineConfig | null {
  if (!value) {
    return null;
  }

  return (
    engineNameLookup.get(
      normalizeIdentifier(value)
    ) ?? null
  );
}

export function resolveReportEngineBySlug(
  value: string | null | undefined
): ReportEngineConfig | null {
  if (!value) {
    return null;
  }

  return (
    engineSlugLookup.get(
      normalizeIdentifier(value)
    ) ?? null
  );
}

const CANONICAL_PROMPT_IDS =
  new Set<ReportPromptId>(
    Object.values(REPORT_PROMPT_IDS)
  );

const LEGACY_PROMPT_ID_ALIASES:
  Record<string, ReportPromptId> = {
    shared_services:
      REPORT_PROMPT_IDS.SHARED_SERVICE,

    digital_roadmap:
      REPORT_PROMPT_IDS
        .DIGITAL_TRANSFORMATION,
  };

export function normalizePromptId(
  value: string | null | undefined
): ReportPromptId | null {
  if (!value) {
    return null;
  }

  const normalized =
    value.trim().toLowerCase();

  if (
    CANONICAL_PROMPT_IDS.has(
      normalized as ReportPromptId
    )
  ) {
    return normalized as ReportPromptId;
  }

  return (
    LEGACY_PROMPT_ID_ALIASES[
      normalized
    ] ?? null
  );
}

export function getAnalysisSectionCandidates(
  engineName: string
): readonly string[] {
  const engine =
    resolveReportEngine(engineName);

  return engine?.analysisSections ?? [
    engineName,
  ];
}