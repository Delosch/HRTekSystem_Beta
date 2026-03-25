interface Question {
  id: string;
  type: string;
  options?: string[];
  required?: boolean;
}

interface Section {
  part: string;
  questions: Question[];
}

function hasAnswer(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function optionScore(question: Question, value: any): number {
  const options = question.options || [];
  if (options.length === 0) return hasAnswer(value) ? 1 : 0;

  if (typeof value === "string") {
    const index = options.findIndex((opt) => opt === value);
    if (index >= 0) return index + 1;
    return hasAnswer(value) ? 1 : 0;
  }

  if (Array.isArray(value)) {
    const pickedScores = value
      .map((item) => {
        if (typeof item !== "string") return 0;
        const index = options.findIndex((opt) => opt === item);
        return index >= 0 ? index + 1 : 0;
      })
      .filter((score) => score > 0);

    if (pickedScores.length === 0) return 0;
    return Math.round(pickedScores.reduce((sum, score) => sum + score, 0) / pickedScores.length);
  }

  return hasAnswer(value) ? 1 : 0;
}

function optionIndex(question: Question, value: any): number {
  const options = question.options || [];
  if (options.length === 0 || typeof value !== "string") return -1;

  const normalized = value.trim().toLowerCase();
  const index = options.findIndex((opt) => opt.trim().toLowerCase() === normalized);
  return index;
}

function isScoringSection(section: Section): boolean {
  const part = section.part?.toLowerCase() || "";
  return part.includes("scoring") && !part.includes("non-scoring");
}

/**
 * Calculate assessment score based on answered questions
 * For simple assessments without numeric values, we use completion as score
 * Returns a score from 0-100
 */
export function calculateAssessmentScore(
  formData: Record<string, any>,
  sections: Section[]
): number {
  const scoringSections = sections.filter(isScoringSection);
  if (scoringSections.length === 0) return 0;

  const sectionPercentages = scoringSections.map((section) => {
    let achieved = 0;
    let possible = 0;

    section.questions.forEach((question) => {
      const value = formData[question.id];
      if (!hasAnswer(value)) return;

      const maxForQuestion = Math.max(1, (question.options?.length || 1) - 1);
      const selectedIndex = optionIndex(question, value);

      if (selectedIndex >= 0) {
        achieved += selectedIndex;
      }
      possible += maxForQuestion;
    });

    if (possible === 0) return 0;
    return Math.round((achieved / possible) * 100);
  });

  const total = sectionPercentages.reduce((sum, percent) => sum + percent, 0);
  return Math.round(total / scoringSections.length);
}

/**
 * Calculate score for a specific section
 */
export function calculateSectionScore(
  formData: Record<string, any>,
  questions: Question[]
): {
  answered: number;
  total: number;
  percentage: number;
} {
  const total = questions.length;
  const answered = questions.filter((q) => hasAnswer(formData[q.id])).length;

  const percentage = total > 0 ? Math.round((answered / total) * 100) : 0;

  return { answered, total, percentage };
}
