export type QuestionType = 'checkbox' | 'radio' | 'dropdown' | 'textarea';

export interface Question {
  id: string; // unique key
  number: number;
  title: string;
  question: string;
  type: QuestionType;
  options?: string[];
  hasOther?: boolean;
}

export interface Step {
  part: string;
  intro: string;
  questions: Question[];
}

export type ProfilingSteps = Step[];