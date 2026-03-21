// components/QuestionnaireEngine.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAutoSaveForm } from "~/hooks/useAutoSaveForm";
import AssessmentSidebar from "./AssessmentSidebar";
import SectionInsights from "./SectionInsights";
import { calculateAssessmentScore } from "~/utils/assessmentScoring";

// Types
interface Question {
  id: string;
  number: string;
  title: string;
  question: string;
  type: "radio" | "dropdown" | "checkbox" | "textarea" | "text" | "scale" | "ranking";
  options?: string[];
  hasOther?: boolean;
  required?: boolean;
  maxLength?: number;
}

interface QuestionnaireStep {
  part: string;
  intro: string;
  questions: Question[];
}

interface ValidationErrors {
  [questionId: string]: string;
}

interface QuestionnaireEngineProps {
  steps: QuestionnaireStep[];
  assessmentId: string;
  title?: string;
  initialFormData?: Record<string, any>;
  initialStep?: number;
  autoSaveKey?: string;
  autoSaveDebounce?: number;
  onStepSave?: (stepData: {
    stepIndex: number;
    stepName: string;
    answers: Record<string, any>;
    progress: number;
  }) => Promise<void>;
  onComplete?: (allData: Record<string, any>) => Promise<void>;
  onNavigateBack?: () => void;
  onError?: (error: Error, context: string) => void;
  className?: string;
  showProgressBar?: boolean;
  showAutoSaveIndicator?: boolean;
}

// Custom validation hook
const useFormValidation = (steps: QuestionnaireStep[], formData: any) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateAll = () => {
    const newErrors: ValidationErrors = {};

    steps.forEach(section => {
      section.questions.forEach(q => {
        const value = formData[q.id];

        // ✅ NORMAL REQUIRED VALIDATION
        if (
          q.required &&
          (
            value === undefined ||
            value === "" ||
            (Array.isArray(value) && value.length === 0)
          )
        ) {
          newErrors[q.id] = "This field is required";
        }

    
        

        // ✅ "OTHER" FIELD VALIDATION
        if (
          q.required &&
          q.hasOther &&
          (
            value === "Other" ||
            (Array.isArray(value) && value.includes("Other"))
          ) &&
          !formData[`${q.id}_other`]
        ) {
          newErrors[`${q.id}_other`] = "Please specify";
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, setErrors, validateAll };
};



// Progress Bar Component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-slate-200 rounded-full h-1.5 mb-8">
      <motion.div
        className="bg-indigo-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5 }}
      />
    </div>
  );
}

// Question Renderer Component
function QuestionRenderer({
  question,
  value,
  otherValue,
  onChange,
  error,
  otherError
}: {
  question: Question;
  value: any;
  otherValue: string;
  onChange: (questionId: string, value: any) => void;
  error?: string;
  otherError?: string;
}) {
  const qId = question.id;
  const checkboxValue = Array.isArray(value) ? value : [];

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <span className="text-sm text-indigo-600 shrink-0 font-bold">{question.number}.</span>
        <div>
          {question.title && (
            <p className="text-sm text-indigo-500 font-bold uppercase tracking-wider mb-1">
              {question.title}
            </p>
          )}
          <p className="text-base text-slate-800 font-semibold leading-relaxed">{question.question}</p>
        </div>
      </div>

      {/* Radio Input Type - TILE GRID LAYOUT */}
      {question.type === "radio" && (
        <div className="grid gap-3 ml-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {question.options?.map((opt, idx) => {
            const selected = value === opt;
            const label = String.fromCharCode(65 + idx); // A, B, C, D...

            return (
              <div
                key={idx}
                onClick={() => onChange(qId, opt)}
                className={`relative flex flex-col justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 min-h-[80px] cursor-pointer ${
                  selected
                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                    : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white"
                }`}
              >
                <div className="flex items-start gap-3 mb-1">
                  <div className={`h-4 w-4 border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5 rounded-full ${
                    selected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 bg-white"
                  }`}>
                    {selected && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-bold ${selected ? "text-indigo-700" : "text-slate-400"}`}>
                    {label}
                  </span>
                </div>
                <span className={`text-xs font-medium leading-snug ml-7 ${
                  selected ? "text-indigo-900" : "text-slate-600"
                }`}>
                  {opt}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkbox Input Type */}
      {question.type === "checkbox" && (
        <div className="checkbox-group grid grid-cols-1 sm:grid-cols-2 gap-2 ml-5">
          {question.options?.map((opt, idx) => (
            <label key={idx} className="flex items-center space-x-2 text-gray-700 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-150">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                checked={checkboxValue.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    onChange(qId, [...checkboxValue, opt]);
                  } else {
                    onChange(qId, checkboxValue.filter((v) => v !== opt));
                  }
                }}
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Scale Input Type */}
      {question.type === "scale" && (
        <div className="scale-group flex flex-wrap justify-center sm:justify-start gap-2 ml-5">
          {question.options?.map((opt, idx) => (
            <label key={idx} className={`flex flex-col items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold cursor-pointer transition-all duration-200
                                      ${value === opt ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'border-slate-300 text-slate-700 bg-white hover:bg-indigo-50 hover:border-indigo-400'}`}>
              <input
                type="radio"
                name={qId}
                className="hidden"
                checked={value === opt}
                onChange={() => onChange(qId, opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Dropdown Input Type */}
      {question.type === "dropdown" && (
        <div className="dropdown-group relative ml-5">
          <select
            value={value ?? ""}
            onChange={(e) => onChange(qId, e.target.value)}
            className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm pr-8"
          >
            <option disabled value="">Please select an option...</option>
            {question.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-slate-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      )}

      {/* Textarea Input Type */}
      {question.type === "textarea" && (
        <textarea
          value={value ?? ""}
          onChange={(e) => onChange(qId, e.target.value)}
          placeholder="Your answer..."
          rows={3}
          className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ml-5"
        />
      )}

      {/* Text Input Type */}
      {question.type === "text" && (
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(qId, e.target.value)}
          placeholder="Your answer..."
          className="w-full px-3 py-1.5 rounded-md border border-slate-300 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm ml-5"
        />
      )}

      {/* Ranking Input Type (Placeholder - implements as select for now) */}
      {question.type === "ranking" && (
        <div className="ranking-group ml-5">
          {question.options?.map((opt, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-2 p-2 bg-white rounded border border-slate-200">
              <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}.</span>
              <span className="text-sm flex-1">{opt}</span>
              <select
                value={value?.[opt] ?? ""}
                onChange={(e) => {
                  const newValue = { ...(value ?? {}) };
                  newValue[opt] = e.target.value;
                  onChange(qId, newValue);
                }}
                className="text-xs border rounded p-1"
              >
                <option value="">Rank</option>
                {question.options?.map((_, i) => (
                  <option key={i} value={i + 1}>{i + 1}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* "Other" Input Field */}
      <AnimatePresence>
        {question.hasOther && (
          ((question.type === "checkbox" && checkboxValue.includes("Other")) ||
            (question.type === "radio" && value === "Other") ||
            (question.type === "dropdown" && value === "Other") ||
            (question.type === "scale" && value === "Other")) && (
            <motion.input
              key={`other-input-${question.id}`}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              type="text"
              placeholder="Please specify..."
              className="w-full px-3 py-1.5 mt-2 ml-5 rounded-md border border-slate-300 bg-white text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              value={otherValue ?? ""}
              onChange={(e) => onChange(`${qId}_other`, e.target.value)}
            />
          )
        )}
      </AnimatePresence>

      {/* Error Messages */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-xs mt-1.5 ml-5 error-message"
        >
          {error}
        </motion.p>
      )}
      {otherError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-xs mt-1.5 ml-5 error-message"
        >
          {otherError}
        </motion.p>
      )}
    </div>
  );
}

// Main Questionnaire Engine Component
export default function QuestionnaireEngine({
  steps,
  assessmentId,
  title = "Assessment Form",
  initialFormData = {},
  initialStep = 0,
  autoSaveKey,
  autoSaveDebounce = 3000,
  onStepSave,
  onComplete,
  onNavigateBack,
  onError,
  className = "",
  showProgressBar = true,
  showAutoSaveIndicator = true,
}: QuestionnaireEngineProps) {




  const [showToast, setShowToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);



  // Auto-save form hook
  const effectiveKey = autoSaveKey || `draft_${assessmentId}`;
  const { formData, setFormData, saveToServer } = useAutoSaveForm<any>(
    effectiveKey,
    initialFormData,
    {
      debounce: autoSaveDebounce,
      onSave: () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1500);
      },
      onSaveError: (error: Error) => {
        console.error("Auto-save failed:", error);
        onError?.(error, "auto-save");
        setShowErrorToast(true);
        setTimeout(() => setShowErrorToast(false), 3000);
      }
    }
  )
  const totalQuestions = steps.reduce(
    (acc, s) => acc + s.questions.length,
    0
  );

  const answeredQuestions = Object.entries(formData).filter(
    ([key, val]) => !key.endsWith("_other") && val !== undefined && val !== ""
  ).length;

  const progress =
    totalQuestions === 0
      ? 0
      : Math.min(
        100,
        Math.round((answeredQuestions / totalQuestions) * 100)
      );

  // Calculate current score
  const currentScore = calculateAssessmentScore(formData, steps);

  // Validation hook
  const { errors, setErrors, validateAll } = useFormValidation(steps, formData);

  const handleChange = (questionId: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [questionId]: value }));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      if (questionId.endsWith('_other')) {
        delete newErrors[questionId];
      } else {
        delete newErrors[`${questionId}_other`];
      }
      return newErrors;
    });
  };

  const handleSaveAll = async () => {
    if (!onStepSave) return;

    if (!validateAll()) {
      return;
    }

    setIsSubmitting(true);

    const allAnswers: Record<string, any> = {};

    for (const section of steps) {
      for (const q of section.questions) {
        const qId = q.id;

        if (formData[qId] !== undefined) {
          let answer = formData[qId];

          if (
            q.hasOther &&
            (answer === "Other" ||
              (Array.isArray(answer) && answer.includes("Other")))
          ) {
            const otherText = formData[`${qId}_other`];
            if (otherText) {
              if (Array.isArray(answer)) {
                answer = answer.map(item =>
                  item === "Other" ? `Other (${otherText})` : item
                );
              } else {
                answer = `Other (${otherText})`;
              }
            }
          }

          allAnswers[qId] = answer;
        }
      }
    }

    try {
      await onStepSave({
        stepIndex: 0,
        stepName: "All Sections",
        answers: allAnswers,
        progress,
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    } catch (error: any) {
      console.error("Save failed:", error);
      onError?.(error, "save");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Sidebar */}
      <AssessmentSidebar
        sections={steps}
        formData={formData}
        totalQuestions={totalQuestions}
        currentScore={currentScore}
        title={title}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-5xl mx-auto px-6 py-12">

        {/* Toasts */}
        <AnimatePresence>
          {showToast && (
            <motion.div className="fixed top-4 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md text-sm z-50">
              ✅ Progress Saved!
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showErrorToast && (
            <motion.div className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md text-sm z-50">
              ❌ Error saving progress.
            </motion.div>
          )}
        </AnimatePresence>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              {title}
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
              Complete the assessment sections below to generate your profile.
            </p>
          </div>
        </div>

        {showProgressBar && <ProgressBar progress={progress} />}

        {/* Form Sections */}
        <div className="space-y-6">
          {steps.map((section, sectionIndex) => {
            const questionsInSection = section.questions;
            const answeredInSection = questionsInSection.filter(
              q => formData[q.id] !== undefined && formData[q.id] !== ""
            ).length;
            const completionPercent = questionsInSection.length > 0
              ? (answeredInSection / questionsInSection.length) * 100
              : 0;

            return (
              <section
                key={`${section.part}-${sectionIndex}`}
                id={`section-${sectionIndex}`}
                className="scroll-mt-4 rounded-xl overflow-hidden mb-10 border bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-8">
                  <div className="mb-8 pb-6 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold tracking-wide uppercase text-[#06B6D4]">
                        Section {sectionIndex + 1}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-medium">
                          {answeredInSection}/{questionsInSection.length} Completed
                        </span>
                        <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#06B6D4] to-[#1E40AF] transition-all duration-500 ease-out"
                            style={{ width: `${completionPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold mb-2 text-slate-900">{section.part}</h2>
                    <p className="text-slate-600 text-lg leading-relaxed">{section.intro}</p>
                  </div>

                  <div className="space-y-10">
                  {section.questions.map((question) => (
                    <QuestionRenderer
                      key={question.id}
                      question={question}
                      value={formData[question.id]}
                      otherValue={formData[`${question.id}_other`]}
                      onChange={handleChange}
                      error={errors[question.id]}
                      otherError={errors[`${question.id}_other`]}
                    />
                  ))}
                  </div>

                  {/* Section Insights - Show charts when questions are answered */}
                  {answeredInSection > 0 && (
                    <SectionInsights
                      questions={section.questions}
                      formData={formData}
                      sectionName={section.part}
                    />
                  )}

                </div>
              </section>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="mt-12">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSubmitting}
            className="w-full max-w-md mx-auto block py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
          >
            {isSubmitting ? "Saving..." : "Save Assessment"}
          </button>
        </div>

        <div className="mt-20 pt-10 border-t border-slate-200 text-center text-slate-400 text-sm">
          <p>&copy; 2026 Assessment Engine. All rights reserved.</p>
        </div>

      </div>
    </div>
  </div>
</div>
  );
}


export type { Question, QuestionnaireStep, QuestionnaireEngineProps };