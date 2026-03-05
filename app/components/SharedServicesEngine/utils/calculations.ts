import { assessmentData } from '../data/assessment-data';

// Domain weights for SSTI calculation
export const DOMAIN_WEIGHTS = {
  1: 0.15, // Operating Model
  2: 0.10, // Service Experience
  3: 0.15, // Process
  4: 0.15, // Technology
  5: 0.10, // Data
  6: 0.10, // Governance
  7: 0.10, // Financial
  8: 0.10, // Change
  9: 0.05, // Agentic
};

export interface DomainScore {
  domainId: number;
  domainName: string;
  score: number; // 0-100
  answeredCount: number;
  totalCount: number;
}

export interface SSTIResult {
  sstiScore: number; // 0-100
  classification: string;
  domainScores: DomainScore[];
  totalAnswered: number;
  totalQuestions: number;
  isComplete: boolean;
}

export function calculateDomainScore(
  domainId: number,
  answers: Record<number, number>
): DomainScore {
  const domain = assessmentData.find((d) => d.id === domainId);
  if (!domain) {
    return {
      domainId,
      domainName: '',
      score: 0,
      answeredCount: 0,
      totalCount: 0,
    };
  }

  const questionIds = domain.questions.map((q) => q.id);
  const answeredQuestions = questionIds.filter((id) => answers[id] > 0);
  const totalQuestions = questionIds.length;

  // Calculate score as percentage
  const totalPossible = totalQuestions * 5; // Max score per question is 5
  const actualScore = answeredQuestions.reduce((sum, id) => sum + (answers[id] || 0), 0);
  const score = totalQuestions > 0 ? (actualScore / totalPossible) * 100 : 0;

  return {
    domainId,
    domainName: domain.name,
    score: Math.round(score),
    answeredCount: answeredQuestions.length,
    totalCount: totalQuestions,
  };
}

export function calculateSSTI(answers: Record<number, number>): SSTIResult {
  const domainScores = assessmentData.map((domain) =>
    calculateDomainScore(domain.id, answers)
  );

  // Calculate weighted SSTI score
  let weightedSum = 0;
  domainScores.forEach((ds) => {
    const weight = DOMAIN_WEIGHTS[ds.domainId as keyof typeof DOMAIN_WEIGHTS] || 0;
    weightedSum += ds.score * weight;
  });

  const sstiScore = Math.round(weightedSum);

  // Determine classification
  let classification = '';
  if (sstiScore <= 30) classification = 'Fragmented HR';
  else if (sstiScore <= 50) classification = 'Foundational';
  else if (sstiScore <= 70) classification = 'Structured';
  else if (sstiScore <= 85) classification = 'Integrated SSC';
  else classification = 'Intelligent Agentic Shared Services';

  const totalAnswered = Object.keys(answers).filter((key) => answers[parseInt(key)] > 0)
    .length;
  const totalQuestions = 54;
  const cappedAnswered = Math.min(totalAnswered, totalQuestions);

  return {
    sstiScore,
    classification,
    domainScores,
    totalAnswered: cappedAnswered,
    totalQuestions,
    isComplete: cappedAnswered >= totalQuestions,
  };
}

export function identifyRisks(domainScores: DomainScore[]): {
  category: string;
  level: 'high' | 'medium' | 'low';
}[] {
  const risks: { category: string; level: 'high' | 'medium' | 'low' }[] = [];

  domainScores.forEach((ds) => {
    if (ds.score < 40) {
      risks.push({ category: ds.domainName, level: 'high' });
    } else if (ds.score < 60) {
      risks.push({ category: ds.domainName, level: 'medium' });
    }
  });

  return risks;
}

export function calculateCostSavings(
  financialDomainScore: number,
  averageScore: number
): {
  currentCost: number;
  projectedSavings: number;
} {
  // Mock calculation - in reality this would be based on real data
  const baseCost = 1000000; // $1M baseline
  const currentEfficiency = averageScore / 100;
  const targetEfficiency = 0.85; // 85% efficiency target

  const currentCost = baseCost / (currentEfficiency || 0.1); // Avoid division by zero
  const projectedCost = baseCost / targetEfficiency;
  const projectedSavings = Math.max(0, currentCost - projectedCost);

  return {
    currentCost: Math.round(currentCost),
    projectedSavings: Math.round(projectedSavings),
  };
}

export function getTransformationPhase(sstiScore: number): 1 | 2 | 3 {
  if (sstiScore < 50) return 1;
  if (sstiScore < 75) return 2;
  return 3;
}

export function getAgenticRecommendation(agenticScore: number): string {
  if (agenticScore < 40) return 'AI-Powered Chatbot Implementation';
  if (agenticScore < 60) return 'Intelligent Workflow Automation';
  if (agenticScore < 80) return 'Autonomous Ticket Routing';
  return 'Predictive Analytics & Self-Healing Systems';
}

// NEW: Helper for Strategic Matrix Chart
export function getDomainStrategicImportance(domainId: number): number {
  // This maps each domain to a 'Strategic Impact' score (Y-axis on matrix)
  // In a real app, this might come from user input or separate weighting
  const importanceMap: Record<number, number> = {
    1: 85, // Operating Model
    2: 90, // Service Experience
    3: 70, // Process
    4: 95, // Technology
    5: 80, // Data
    6: 75, // Governance
    7: 60, // Financial
    8: 65, // Change
    9: 98, // Agentic
  };
  return importanceMap[domainId] || 50;
}