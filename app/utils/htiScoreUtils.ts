export type HTIScoreValue = number | null;

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Number(value.toFixed(1))));
}

export function toHTIScore(value: unknown): HTIScoreValue {
  if (typeof value === "number" && Number.isFinite(value)) {
    return clampScore(value);
  }

  if (typeof value === "string") {
    const match = value.match(/-?\d+(?:\.\d+)?/);
    if (!match) return null;

    const parsed = Number(match[0]);
    if (!Number.isFinite(parsed)) return null;

    return clampScore(parsed);
  }

  return null;
}

function stripHtml(value: unknown): string {
  if (typeof value !== "string") return "";

  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function collectAdvisoryText(advisory: any): string {
  const parts: string[] = [];

  parts.push(stripHtml(advisory?.executiveSummary));
  parts.push(stripHtml(advisory?.currentState?.digitalReadiness));
  parts.push(stripHtml(advisory?.currentState?.maturityLevel));

  if (Array.isArray(advisory?.detailedSections)) {
    for (const section of advisory.detailedSections) {
      parts.push(stripHtml(section?.title));
      parts.push(stripHtml(section?.content));
    }
  }

  if (Array.isArray(advisory?.successMetrics)) {
    parts.push(advisory.successMetrics.join(" "));
  }

  return parts.join(" ");
}

function extractScoreFromText(text: string, patterns: RegExp[]): HTIScoreValue {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const score = toHTIScore(match[1]);
      if (score !== null) return score;
    }
  }

  return null;
}

function averageCapabilityHeatmap(advisory: any): HTIScoreValue {
  const scores = Array.isArray(advisory?.capabilityHeatmap)
    ? advisory.capabilityHeatmap
        .map((item: any) => toHTIScore(item?.score))
        .filter((score: HTIScoreValue): score is number => score !== null)
    : [];

  if (scores.length === 0) return null;

  const average = scores.reduce((sum: number, score: number) => sum + score, 0) / scores.length;
  return clampScore(average);
}

function deriveConfidenceFromInput(inputData: any): HTIScoreValue {
  const completed = toHTIScore(inputData?.completedEnginesCount);
  const total = toHTIScore(inputData?.totalEngines);

  if (completed === null || total === null || total <= 0) return null;

  return clampScore((completed / total) * 100);
}

export function deriveHTIScores(advisory: any, inputData?: any) {
  const text = collectAdvisoryText(advisory);

  const readinessScore =
    toHTIScore(advisory?.transformationReadinessScore) ??
    toHTIScore(advisory?.currentState?.digitalReadiness) ??
    extractScoreFromText(text, [
      /Transformation\s+Readiness(?:\s+Score|\s+Index)?\D{0,40}(\d+(?:\.\d+)?)/i,
      /Readiness\D{0,30}(\d+(?:\.\d+)?)\s*%/i,
      /Composite\s+score\s+of\s+(\d+(?:\.\d+)?)/i,
    ]) ??
    averageCapabilityHeatmap(advisory);

  const riskScore =
    toHTIScore(advisory?.riskExposureIndex) ??
    extractScoreFromText(text, [
      /Transformation\s+Risk\s+Index\D{0,40}(\d+(?:\.\d+)?)/i,
      /Risk\s+Exposure\s+Index\D{0,40}(\d+(?:\.\d+)?)/i,
      /Risk\s+Index\D{0,40}(\d+(?:\.\d+)?)/i,
    ]);

  const confidenceScore =
    toHTIScore(advisory?.confidenceScore) ??
    extractScoreFromText(text, [
      /Advisory\s+Confidence\D{0,40}(\d+(?:\.\d+)?)/i,
      /Confidence\s+Score\D{0,40}(\d+(?:\.\d+)?)/i,
      /Confidence\s+of\s+(\d+(?:\.\d+)?)\s*%/i,
    ]) ??
    deriveConfidenceFromInput(inputData);

  return {
    readinessScore,
    riskScore,
    confidenceScore,
  };
}

export function formatHTIScore(score: HTIScoreValue, suffix = ""): string {
  if (score === null) return "N/A";

  const formatted = Number.isInteger(score) ? String(score) : score.toFixed(1);
  return `${formatted}${suffix}`;
}