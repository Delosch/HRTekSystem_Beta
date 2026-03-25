// Types for the HR-Tek Global Change Intelligence Assessment

export interface QuestionOption {
    value: number;
    label: string;
    description: string;
}

export interface Question {
    id: string;
    question: string;
    options: QuestionOption[];
    weight?: number;
}

export interface Section {
    id: string;
    title: string;
    shortTitle: string;
    description: string;
    questions: Question[];
    indexMapping: string;
}

export interface Response {
    [questionId: string]: number;
}

export interface IndexScore {
    name: string;
    score: number;
    maxScore: number;
    percentage: number;
    status: 'green' | 'amber' | 'red';
    description: string;
}

export interface CompositeScore {
    overall: number;
    category: string;
    interpretation: string;
    transformationRiskIndex: number;
    adoptionProbabilityIndex: number;
    financialFeasibilityScore: number;
}

export interface SectionScore {
    sectionId: string;
    score: number;
    maxScore: number;
    percentage: number;
    status: 'green' | 'amber' | 'red';
}

export const SCORE_OPTIONS: QuestionOption[] = [
    { value: 0, label: 'Critical Risk', description: 'Severe gaps requiring immediate attention' },
    { value: 1, label: 'Weak', description: 'Significant weaknesses present' },
    { value: 2, label: 'Developing', description: 'Basic capabilities in place' },
    { value: 3, label: 'Mature', description: 'Well-established practices' },
    { value: 4, label: 'Best Practice', description: 'Global standard excellence' }
];
