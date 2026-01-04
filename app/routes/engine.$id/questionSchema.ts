export interface QuestionSchema {
    pk: string,
    sk: string,
    createdAt: string,
    createdBy: string
    questionSection: string,
    parts: QuestionSection[]
}
interface QuestionSection {
    intro: string,
    part: string
    questions: QuestionSegments[]
}
interface QuestionSegments {
    id: string,
    required: boolean,
    title: string,
    type: "radio" | "dropdown" | "checkbox" | "textarea" | "text" | "scale" | "ranking",
    question: string
    number: string,
    options?: string[]
    hasOther?: boolean
    maxLength?: number
}