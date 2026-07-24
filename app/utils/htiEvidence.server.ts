import techMaturityQuestions from "../../questions/hr-tech-maturity-analysis-updated.json";
import roadmapQuestions from "../../questions/hr-transformation-roadmap-generator.json";
import vendorQuestions from "../../questions/vendor-evaluation.json";
import changeQuestions from "../../questions/intelligent-change-management.json";
import sharedServiceQuestions from "../../questions/shared-service-designer.json";

type UnknownRecord = Record<string, unknown>;

interface QuestionMeta {
  id: string;
  title?: string;
  question?: string;
  section?: string;
  options?: string[];
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function tryParseJson(value: unknown): unknown {
  if (typeof value !== "string") return value;

  const trimmed = value.trim();

  if (
    !(
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    )
  ) {
    return value;
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}

function normalizeDeep(value: unknown): unknown {
  const parsed = tryParseJson(value);

  if (Array.isArray(parsed)) {
    return parsed.map(normalizeDeep);
  }

  if (isRecord(parsed)) {
    return Object.fromEntries(
      Object.entries(parsed).map(([key, nestedValue]) => [
        key,
        normalizeDeep(nestedValue),
      ])
    );
  }

  return parsed;
}

function flattenQuestions(questionBank: unknown): QuestionMeta[] {
  const questions: QuestionMeta[] = [];

  function walk(node: unknown, currentSection?: string) {
    if (Array.isArray(node)) {
      for (const item of node) walk(item, currentSection);
      return;
    }

    if (!isRecord(node)) return;

    const nextSection =
      typeof node.part === "string"
        ? node.part
        : typeof node.section === "string"
          ? node.section
          : currentSection;

    if (typeof node.id === "string" && typeof node.question === "string") {
      questions.push({
        id: node.id,
        title: typeof node.title === "string" ? node.title : undefined,
        question: node.question,
        section: nextSection,
        options: Array.isArray(node.options)
          ? node.options.filter((option): option is string => typeof option === "string")
          : undefined,
      });
    }

    for (const value of Object.values(node)) {
      walk(value, nextSection);
    }
  }

  walk(questionBank);
  return questions;
}

function getQuestionBankForEngine(engineName: string): unknown | null {
  const normalized = engineName.toLowerCase();

  if (
    normalized.includes("technology maturity") ||
    normalized.includes("ai maturity")
  ) {
    return techMaturityQuestions;
  }

  if (
    normalized.includes("transformation roadmap") ||
    normalized.includes("digital roadmap")
  ) {
    return roadmapQuestions;
  }

  if (
    normalized.includes("vendor fit") ||
    normalized.includes("hcm vendor")
  ) {
    return vendorQuestions;
  }

  if (
    normalized.includes("change management")
  ) {
    return changeQuestions;
  }

  if (
    normalized.includes("shared service")
  ) {
    return sharedServiceQuestions;
  }

  return null;
}

function flattenResponseLeaves(
  value: unknown,
  path: string[] = [],
  output: Array<{ key: string; path: string; value: unknown }> = []
) {
  const normalized = normalizeDeep(value);

  if (Array.isArray(normalized)) {
    output.push({
      key: path[path.length - 1] || "array_value",
      path: path.join("."),
      value: normalized,
    });
    return output;
  }

  if (isRecord(normalized)) {
    for (const [key, nestedValue] of Object.entries(normalized)) {
      if (isRecord(nestedValue)) {
        flattenResponseLeaves(nestedValue, [...path, key], output);
      } else {
        output.push({
          key,
          path: [...path, key].join("."),
          value: nestedValue,
        });
      }
    }
    return output;
  }

  output.push({
    key: path[path.length - 1] || "value",
    path: path.join("."),
    value: normalized,
  });

  return output;
}

function formatAnswer(value: unknown, question?: QuestionMeta): string {
  const normalized = normalizeDeep(value);

  if (Array.isArray(normalized)) {
    return normalized.map((item) => String(item)).join(", ");
  }

  if (typeof normalized === "number") {
    if (
      question?.options &&
      Number.isInteger(normalized) &&
      normalized >= 0 &&
      normalized < question.options.length
    ) {
      return `${normalized} — possible option: ${question.options[normalized]}`;
    }

    return String(normalized);
  }

  if (isRecord(normalized)) {
    return JSON.stringify(normalized);
  }

  if (normalized === undefined || normalized === null || normalized === "") {
    return "No answer provided";
  }

  return String(normalized);
}

function formatScoreBlock(scores: unknown): string {
  const normalized = normalizeDeep(scores);

  if (!isRecord(normalized)) return "";

  const lines = Object.entries(normalized)
    .slice(0, 25)
    .map(([key, value]) => `- ${key}: ${String(value)}`);

  if (lines.length === 0) return "";

  return [
    "ENGINE SCORES / METRICS:",
    ...lines,
  ].join("\n");
}

function truncateText(value: unknown, maxLength = 9000): string {
  const text =
    typeof value === "string"
      ? value
      : value === undefined || value === null
        ? ""
        : JSON.stringify(value);

  if (text.length <= maxLength) return text;

  return `${text.slice(0, maxLength)}\n...[truncated for prompt length]`;
}

export function buildEngineEvidenceBlock(params: {
  engineName: string;
  progress?: number;
  responses?: unknown;
  scores?: unknown;
  aiAnalysis?: unknown;
  aiReport?: unknown;
}): string {
  const {
    engineName,
    progress,
    responses,
    scores,
    aiAnalysis,
    aiReport,
  } = params;

  const questionBank = getQuestionBankForEngine(engineName);
  const questions = questionBank ? flattenQuestions(questionBank) : [];
  const questionMap = new Map(questions.map((question) => [question.id, question]));

  const normalizedResponses = normalizeDeep(responses);
  const responseLeaves = flattenResponseLeaves(normalizedResponses);

  const evidenceItems = responseLeaves
    .map((leaf) => {
      const question = questionMap.get(leaf.key);
      if (!question) return null;

      return {
        question,
        answer: formatAnswer(leaf.value, question),
      };
    })
    .filter((item): item is { question: QuestionMeta; answer: string } => item !== null)
    .slice(0, 35);

  const unmappedKeys = responseLeaves
    .filter((leaf) => !questionMap.has(leaf.key))
    .map((leaf) => leaf.path)
    .slice(0, 15);

  const evidenceLines =
    evidenceItems.length > 0
      ? evidenceItems.map(({ question }) => {
          const answer = evidenceItems.find((item) => item.question.id === question.id)?.answer ?? "";
          return [
            `- [${question.section || "Unknown Section"} | ${question.id}${question.title ? ` | ${question.title}` : ""}]`,
            `  Question: ${question.question}`,
            `  Selected answer: ${answer}`,
          ].join("\n");
        })
      : [
          "- No question-label matches were found for this engine response set.",
          "- Use the prior AI analysis and raw response fallback carefully.",
        ];

  const scoreBlock = formatScoreBlock(scores);

  const priorAnalysisBlock = aiReport || aiAnalysis
    ? [
        "PRIOR ENGINE AI ANALYSIS / REPORT:",
        truncateText(aiReport || aiAnalysis),
      ].join("\n")
    : "";

  const rawFallbackBlock =
    evidenceItems.length === 0 && responses
      ? [
          "RAW RESPONSE FALLBACK:",
          truncateText(responses, 5000),
        ].join("\n")
      : "";

  return [
    `ENGINE NAME: ${engineName}`,
    `COMPLETION PROGRESS: ${progress ?? 0}%`,
    "",
    "ASSESSMENT RESPONSE EVIDENCE:",
    ...evidenceLines,
    "",
    unmappedKeys.length > 0
      ? [
          "UNMAPPED RESPONSE KEYS:",
          ...unmappedKeys.map((key) => `- ${key}`),
        ].join("\n")
      : "",
    "",
    scoreBlock,
    "",
    priorAnalysisBlock,
    "",
    rawFallbackBlock,
  ]
    .filter(Boolean)
    .join("\n");
}