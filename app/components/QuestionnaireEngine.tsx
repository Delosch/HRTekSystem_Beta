// components/QuestionnaireEngine.tsx
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAutoSaveForm } from "~/hooks/useAutoSaveForm";

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
const useFormValidation = (steps: QuestionnaireStep[], formData: any, currentStep: number) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateCurrentStep = useCallback(() => {
    const currentStepErrors: ValidationErrors = {};
    let isValid = true;
    const step = steps[currentStep];

    if (!step) return true;

    step.questions.forEach(q => {
      const qId = q.id;
      const value = formData[qId];
      const otherValue = formData[`${qId}_other`];

      delete currentStepErrors[qId];
      delete currentStepErrors[`${qId}_other`];

      if (q.required) {
        if (q.type === "checkbox") {
          if (!Array.isArray(value) || value.length === 0) {
            currentStepErrors[qId] = `${q.title} is required. Please select at least one option.`;
            isValid = false;
          } else if (value.includes("Other") && (!otherValue || String(otherValue).trim() === "")) {
            currentStepErrors[`${qId}_other`] = `Please specify for "Other" option.`;
            isValid = false;
          }
        } else if (q.type === "radio" || q.type === "dropdown" || q.type === "scale") {
          if (!value) {
            currentStepErrors[qId] = `${q.title} is required. Please select an option.`;
            isValid = false;
          } else if (value === "Other" && (!otherValue || String(otherValue).trim() === "")) {
            currentStepErrors[`${qId}_other`] = `Please specify for "Other" option.`;
            isValid = false;
          }
        } else if (q.type === "textarea" || q.type === "text") {
          if (!value || String(value).trim() === "") {
            currentStepErrors[qId] = `${q.title} is required.`;
            isValid = false;
          }
        }
      }

      if ((q.type === "textarea" || q.type === "text") && q.maxLength && value && String(value).length > q.maxLength) {
        currentStepErrors[qId] = `${q.title} exceeds maximum length of ${q.maxLength} characters.`;
        isValid = false;
      }
    });

    setErrors(prev => ({ ...prev, ...currentStepErrors }));
    return isValid;
  }, [steps, formData, currentStep]);

  return { errors, validateCurrentStep, setErrors };
};

// Progress Bar Component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-5">
      <motion.div
        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-in-out"
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
  // const otherInputValue = value?.otherValue;

  return (
    <div className="question-item bg-gray-50 p-5 rounded-lg shadow-sm border border-gray-200">
      <p className="font-semibold text-base text-gray-800 mb-1.5">
        {question.number}. {question.title} {question.required && <span className="text-red-500">*</span>}
      </p>
      <p className="text-sm text-gray-700 mb-3">{question.question}</p>

      {/* Checkbox Input Type */}
      {question.type === "checkbox" && (
        <div className="checkbox-group grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options?.map((opt, idx) => (
            <label key={idx} className="flex items-center space-x-2 text-gray-700 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-150">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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

      {/* Radio Input Type */}
      {question.type === "radio" && (
        <div className="radio-group grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options?.map((opt, idx) => (
            <label key={idx} className="flex items-center space-x-2 text-gray-700 cursor-pointer p-1.5 rounded-md hover:bg-gray-100 transition-colors duration-150">
              <input
                type="radio"
                name={qId}
                className="form-radio h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                checked={value === opt}
                onChange={() => onChange(qId, opt)}
              />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}

      {/* Scale Input Type */}
      {question.type === "scale" && (
        <div className="scale-group flex flex-wrap justify-center sm:justify-start gap-2">
          {question.options?.map((opt, idx) => (
            <label key={idx} className={`flex flex-col items-center justify-center w-10 h-10 rounded-full border-2 text-sm font-semibold cursor-pointer transition-all duration-200
                                      ${value === opt ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'border-gray-300 text-gray-700 bg-white hover:bg-blue-50 hover:border-blue-400'}`}>
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
        <div className="dropdown-group relative">
          <select
            value={value || ""}
            onChange={(e) => onChange(qId, e.target.value)}
            className="w-full px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-800 text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm pr-8"
          >
            <option disabled value="">Please select an option...</option>
            {question.options?.map((opt, idx) => (
              <option key={idx} value={opt}>{opt}</option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1.5 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      )}

      {/* Textarea Input Type */}
      {question.type === "textarea" && (
        <textarea
          value={value || ""}
          onChange={(e) => onChange(qId, e.target.value)}
          placeholder="Your answer..."
          rows={3}
          className="w-full px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      )}

      {/* Text Input Type */}
      {question.type === "text" && (
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(qId, e.target.value)}
          placeholder="Your answer..."
          className="w-full px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      )}

      {/* Ranking Input Type (Placeholder - implements as select for now) */}
      {question.type === "ranking" && (
        <div className="ranking-group">
          {question.options?.map((opt, idx) => (
            <div key={idx} className="flex items-center space-x-2 mb-2 p-2 bg-white rounded border border-gray-200">
              <span className="text-xs font-bold text-gray-400 w-4">{idx + 1}.</span>
              <span className="text-sm flex-1">{opt}</span>
              <select
                value={value?.[opt] || ""}
                onChange={(e) => {
                  const newValue = { ...(value || {}) };
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
              className="w-full px-3 py-1.5 mt-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              value={otherValue || ""} // <--- 4. Use the new prop here
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
          className="text-red-600 text-xs mt-1.5 error-message"
        >
          {error}
        </motion.p>
      )}
      {otherError && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-xs mt-1.5 error-message"
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

  // 🔥 DEBUG LOGS (STEP 2)
  console.log("🔥 Steps received:", steps);
  console.log("🔥 Current step:", steps?.[initialStep]);


  const [currentStep, setCurrentStep] = useState(initialStep);
  const [showToast, setShowToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Auto-save form hook
  const effectiveKey = autoSaveKey || `draft_${assessmentId}`;
  const { formData, setFormData, saveToServer, isSaving, clearData } = useAutoSaveForm<any>(
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
  );

  // Validation hook
  const { errors, validateCurrentStep, setErrors } = useFormValidation(steps, formData, currentStep);

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

  const handleSaveCurrentStep = async () => {
    if (!onStepSave) return;

    setIsSubmitting(true);
    const sectionAnswers: Record<string, any> = {};

    for (const q of currentStepData.questions) {
      const qId = q.id;
      if (formData[qId] !== undefined) {
        let answer = formData[qId];
        if (q.hasOther && (answer === "Other" || (Array.isArray(answer) && answer.includes("Other")))) {
          const otherText = formData[`${qId}_other`];
          if (otherText) {
            if (Array.isArray(answer)) {
              answer = answer.map(item => item === "Other" ? `Other (${otherText})` : item);
            } else {
              answer = `Other (${otherText})`;
            }
          }
        }
        sectionAnswers[qId] = answer;
      }
    }

    try {
      await onStepSave({
        stepIndex: currentStep,
        stepName: currentStepData.part,
        answers: sectionAnswers,
        progress,
      });

      setShowToast(true);
      setTimeout(() => setShowToast(false), 1500);
    } catch (error: any) {
      console.error("Failed to save current step:", error);
      onError?.(error, "step-save");
      setShowErrorToast(true);
      setTimeout(() => setShowErrorToast(false), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const isValid = validateCurrentStep();
    if (!isValid) {
      const firstErrorElement = document.querySelector('.error-message');
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (onStepSave) {
      await handleSaveCurrentStep();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep((p) => p + 1);
      setErrors({});
    } else {
      // Final completion
      if (onComplete) {
        try {
          await onComplete(formData);
        } catch (error: any) {
          onError?.(error, "completion");
        }
      }
      if (saveToServer) {
        await saveToServer(formData);
      }
      clearData();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((p) => p - 1);
      setErrors({});
    } else if (onNavigateBack) {
      onNavigateBack();
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8 font-inter ${className}`}>
      {/* Success Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-md text-sm z-50 transition-all duration-300"
          >
            ✅ Progress Saved!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Toast */}
      <AnimatePresence>
        {showErrorToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow-md text-sm z-50 transition-all duration-300"
          >
            ❌ Error saving progress. Please try again.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Container */}
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-2xl p-6 sm:p-8 space-y-6 border border-gray-200">
        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-4">
          {title}
        </h1>

        {showProgressBar && <ProgressBar progress={progress} />}

        {showAutoSaveIndicator && isSaving && (
          <div className="text-center text-xs text-gray-500 mb-3 animate-pulse">
            Auto-saving draft...
          </div>
        )}

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            key={currentStepData.part}
          >
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-1.5">{currentStepData.part}</h2>
              <p className="text-sm text-gray-600">{currentStepData.intro}</p>
            </div>

            <div className="space-y-6">
              {currentStepData.questions.map((question) => (
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
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6 pt-3 border-t border-gray-200">
          <button
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="px-7 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isSubmitting ? "Saving..." : (currentStep === steps.length - 1 ? "Finish" : "Next")}
          </button>
        </div>
      </div>
    </div>
  );
}

// Export types for use in other components
export type { Question, QuestionnaireStep, QuestionnaireEngineProps };