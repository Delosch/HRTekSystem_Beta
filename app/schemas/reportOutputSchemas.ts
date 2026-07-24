import { z, type ZodType } from "zod";

const NonEmptyText = z.string().trim().min(1);

const NarrativeText = z.string().trim().min(20);

const NonEmptyObject = z
  .record(z.string(), z.unknown())
  .refine(
    (value) => Object.keys(value).length > 0,
    "Object must not be empty"
  );

const UnsafeHtmlPattern =
  /<\s*(script|iframe|object|embed)\b|on[a-z]+\s*=|javascript:/i;

const SafeNarrativeHtml = z
  .string()
  .trim()
  .min(80, "Narrative content is too short")
  .refine(
    (value) => !UnsafeHtmlPattern.test(value),
    "Unsafe HTML was found"
  );

function normalizeScore(value: unknown): unknown {
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? Math.max(0, Math.min(100, value))
      : value;
  }

  if (typeof value === "string") {
    const parsed = Number(value.trim().replace(/%$/, ""));

    return Number.isFinite(parsed)
      ? Math.max(0, Math.min(100, parsed))
      : value;
  }

  return value;
}

const Score0To100 = z.preprocess(
  normalizeScore,
  z.number().finite().min(0).max(100)
);

const Score1To10 = z.preprocess(
  (value) => {
    const parsed =
      typeof value === "string" ? Number(value) : value;

    return typeof parsed === "number" && Number.isFinite(parsed)
      ? Math.max(1, Math.min(10, parsed))
      : value;
  },
  z.number().finite().min(1).max(10)
);

/**
 * Cross-engine HTI advisory
 */
export const HTIAdvisorySchema = z
  .object({
    executiveSummary: SafeNarrativeHtml,

    detailedSections: z
      .array(
        z
          .object({
            title: NonEmptyText,
            content: SafeNarrativeHtml,
          })
          .passthrough()
      )
      .min(1)
      .optional(),

    currentState: z
      .object({
        maturityLevel: NonEmptyText.optional(),
        digitalReadiness: NonEmptyText.optional(),
        keyGaps: z.array(NarrativeText).min(1),
        strengths: z.array(NarrativeText).min(1),
      })
      .passthrough(),

    recommendations: z
      .object({
        now: z.array(NarrativeText).min(1),
        next: z.array(NarrativeText).min(1),
        later: z.array(NarrativeText).min(1),
      })
      .passthrough(),

    riskFlags: z
      .array(
        z
          .object({
            risk: NarrativeText,
            mitigation: NarrativeText,
          })
          .passthrough()
      )
      .min(1),

    dependencies: z.array(z.string()),
    avoidNow: z.array(z.string()),
    successMetrics: z.array(z.string()).optional(),

    transformationReadinessScore: Score0To100.optional(),
    riskExposureIndex: Score0To100.optional(),
    confidenceScore: Score0To100.optional(),

    capabilityHeatmap: z
      .array(
        z
          .object({
            engine: NonEmptyText,
            score: Score0To100,
            status: z.enum([
              "strong",
              "moderate",
              "critical",
            ]),
          })
          .passthrough()
      )
      .optional(),

    priorityMatrix: z
      .array(
        z
          .object({
            initiative: NonEmptyText,
            impact: Score1To10,
            effort: Score1To10,
            timeframe: z.enum([
              "now",
              "next",
              "later",
            ]),
            category: NonEmptyText,
          })
          .passthrough()
      )
      .optional(),

    doNotTransformNow: z
      .array(
        z
          .object({
            area: NonEmptyText,
            reason: NarrativeText,
            category: z.enum([
              "organizational",
              "financial",
              "technical",
              "cultural",
            ]),
            revisitIn: NonEmptyText.optional(),
          })
          .passthrough()
      )
      .optional(),

    auditTrail: z
      .array(
        z
          .object({
            timestamp: NonEmptyText,
            action: NonEmptyText,
            details: NonEmptyText,
          })
          .passthrough()
      )
      .optional(),
  })
  .passthrough();

/**
 * Normal engine report schemas.
 *
 * These validate required top-level structures while preserving
 * additional nested fields used by current dashboards.
 */

const DigitalMaturitySchema = z
  .object({
    assessment_metadata: NonEmptyObject,
    organization_profile: NonEmptyObject,
    maturity_analysis: NonEmptyObject,
    visualization_data: NonEmptyObject,
    strategic_insights: NonEmptyObject,
    detailed_recommendations: NonEmptyObject,
    industry_benchmarking: NonEmptyObject,
    risk_assessment: NonEmptyObject,
    success_metrics: NonEmptyObject,
  })
  .passthrough();

const VendorFitSchema = z
  .object({
    meta: NonEmptyObject,
    profile: z.record(z.string(), z.unknown()),
    answers: NonEmptyObject,

    scores: z
      .object({
        satisfaction: Score0To100,
        painIndex: Score0To100,
        integrationComplexity: Score0To100,
        decisionAgility: Score0To100,
        changeReadiness: Score0To100,
        fitScore: Score0To100,
        fitBand: z.enum([
          "Excellent vendor readiness",
          "Moderate – some alignment gaps",
          "Needs alignment before vendor search",
        ]),
      })
      .passthrough(),

    fitVector: NonEmptyObject,
    diagnostics: NonEmptyObject,
    viz: NonEmptyObject,
  })
  .passthrough();

const DigitalTransformationSchema = z
  .object({
    meta: NonEmptyObject,
    prioritizedInitiatives: z.array(z.unknown()).min(1),
    roadmap: NonEmptyObject,
    quickWins: z.array(z.unknown()),
    longTermBets: z.array(z.unknown()),
    toolsAndVendors: NonEmptyObject,
    scenarioPlanning: NonEmptyObject,
    consulting_report: NonEmptyObject,
  })
  .passthrough();

const SharedServiceSchema = z
  .object({
    meta: NonEmptyObject,
    narrativeAnalysis: NonEmptyObject,
    currentStateAnalysis: NonEmptyObject,
    recommendedModel: NonEmptyObject,
    processOptimization: NonEmptyObject,
    technologyRoadmap: NonEmptyObject,
    kpiFramework: NonEmptyObject,
    implementationRoadmap: NonEmptyObject,
  })
  .passthrough();

const ChangeManagementSchema = z
  .object({
    meta: NonEmptyObject,
    narrativeAnalysis: NonEmptyObject,
    readinessAssessment: NonEmptyObject,
    stakeholderAnalysis: NonEmptyObject,
    communicationStrategy: NonEmptyObject,
    trainingStrategy: NonEmptyObject,
    resistanceManagement: NonEmptyObject,
    implementationRoadmap: NonEmptyObject,
    successMetrics: NonEmptyObject,
    riskMitigation: NonEmptyObject,
  })
  .passthrough();

const TechMaturitySchema = z
  .object({
    meta: NonEmptyObject,
    dimensionScores: NonEmptyObject,
    overallAssessment: NonEmptyObject,
    technologyInventory: NonEmptyObject,
    optimizationRoadmap: NonEmptyObject,
    investmentSummary: NonEmptyObject,
    riskAssessment: NonEmptyObject,
    governanceModel: NonEmptyObject,
    consulting_report: NonEmptyObject,
  })
  .passthrough();

const GenericReportSchema = z
  .record(z.string(), z.unknown())
  .refine(
    (value) => Object.keys(value).length > 0,
    "Generated report must not be empty"
  );

const ReportSchemas: Record<string, ZodType> = {
  digital_maturity: DigitalMaturitySchema,
  vendor_fit: VendorFitSchema,
  digital_transformation: DigitalTransformationSchema,
  shared_service: SharedServiceSchema,
  change_management: ChangeManagementSchema,
  tech_maturity: TechMaturitySchema,
};

export function getReportOutputSchema(
  promptId: string
): ZodType {
  return ReportSchemas[promptId] ?? GenericReportSchema;
}