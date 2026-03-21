import { useEffect, useState } from "react";
import { QuestionSchema } from "./questionSchema";
import { useLocation, useNavigate, useFetcher } from "@remix-run/react";
import { useAutoSaveForm } from "~/hooks/useAutoSaveForm";
import { useFormValidation } from "../../hooks/useFormValidation";
import { AnimatePresence, motion, Reorder } from "framer-motion";

function DragHandleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-400 cursor-grab active:cursor-grabbing">
      <circle cx="9" cy="6" r="1.5" fill="currentColor" />
      <circle cx="15" cy="6" r="1.5" fill="currentColor" />
      <circle cx="9" cy="12" r="1.5" fill="currentColor" />
      <circle cx="15" cy="12" r="1.5" fill="currentColor" />
      <circle cx="9" cy="18" r="1.5" fill="currentColor" />
      <circle cx="15" cy="18" r="1.5" fill="currentColor" />
    </svg>
  );
}

// New component for rendering the ranking question
function RankingQuestion({ question, value, onChange }: {
  question: Question;
  value: any;
  onChange: (questionId: string, value: any) => void;
}) {
  // The 'value' from the form state is the source of truth.
  // We initialize our local state with it, or with the default options if no value exists yet.
  const [orderedItems, setOrderedItems] = useState(value ?? question.options ?? []);

  // This effect ensures that if the form data is loaded asynchronously (e.g., from auto-save),
  // our component's state reflects the latest value from the parent.
  useEffect(() => {
    setOrderedItems(value ?? question.options ?? []);
  }, [value, question.options]);

  const handleReorder = (newOrder: string[]) => {
    // Update the local state for a responsive UI
    setOrderedItems(newOrder);
    // Propagate the change up to the main form state
    onChange(question.id, newOrder);
  };

  return (
    <div className="ranking-group space-y-2">
      <Reorder.Group axis="y" values={orderedItems} onReorder={handleReorder}>
        {orderedItems.map((item: string, index: number) => (
          <Reorder.Item
            key={`${item}-${index}`}
            value={item}
            className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-4"
            // Add some visual feedback while dragging
            whileDrag={{ scale: 1.02, boxShadow: "0px 4px 12px rgba(0,0,0,0.1)" }}
          >
            <DragHandleIcon />
            <span className="flex-shrink-0 w-6 h-6 bg-gray-200 text-gray-700 font-bold text-xs rounded-full flex items-center justify-center">
              {index + 1}
            </span>
            <span className="flex-grow text-sm text-gray-800">{item}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}

export default function EngineFormRender({
  data, engineName, existingResponses, savedProgress = 0
}: { data: QuestionSchema, engineName: string, existingResponses?: any, savedProgress?: number }) {
  const [startFresh, setStartFresh] = useState(false);
  const navigate = useNavigate()
  const [started, setStarted] = useState(false);
  const { pathname } = useLocation()

  // Safety check: If data is undefined or doesn't have parts
  if (!data || !data.parts || !Array.isArray(data.parts) || data.parts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-black bg-gradient-to-br from-slate-200 via-zinc-400 to-white">
        <div className="max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-red-600">⚠️ Assessment Not Available</h1>
          <p className="text-gray-700 mb-6">
            The assessment questions for "{engineName}" have not been loaded yet.
          </p>
          <p className="text-sm text-gray-600 mb-8">
            Please contact your administrator to upload the question set for this assessment engine.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const fetcher = useFetcher();

  // Handle completion redirect or state updates
  useEffect(() => {
    if (fetcher.data && (fetcher.data as any).redirect) {
      window.location.href = (fetcher.data as any).redirect;
    }
  }, [fetcher.data]);

  const handleStepSave = async (stepData: any) => {
    const payload = {
      assessment_id: data.pk,
      progress: stepData.progress,
      section: stepData.stepName,
      answers: stepData.answers,
      currentStepIndex: stepData.stepIndex,
      params: engineName
    };

    fetcher.submit(payload, {
      method: 'POST',
      encType: 'application/json',
      action: pathname
    });
  };

  const handleComplete = async (allData: any) => {
    // Final progress save with 100%
    const payload = {
      assessment_id: data.pk,
      progress: 100,
      section: "Completion",
      answers: allData,
      params: engineName
    };

    fetcher.submit(payload, {
      method: "POST",
      encType: "application/json",
      action: pathname
    });
  };

  if (!started) {
    const hasExistingData = !!(existingResponses && Object.keys(existingResponses).length > 0);

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 via-blue-50 to-white px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center space-y-6 border border-slate-100">
          <img src="/hrtek_logo.png" alt="HRTek" className="h-10 mx-auto object-contain" />
          <h1 className="text-2xl font-black text-slate-900">{engineName} Assessment</h1>
          {hasExistingData ? (
            <>
              <p className="text-slate-600 text-sm leading-relaxed">
                You have a saved session with <span className="font-bold text-blue-600">{savedProgress}%</span> progress. Would you like to continue where you left off?
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => { setStartFresh(false); setStarted(true);}}
                  className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg transition-all"
                >
                  Continue with Saved Responses ({savedProgress}%)
                </button>
                <button
                  onClick={() => { setStartFresh(true); setStarted(true);}}
                  className="w-full px-8 py-4 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold text-base transition-all"
                >
                  Start Fresh
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-slate-600 text-sm leading-relaxed">
                Welcome! This assessment will help us understand your HR landscape. Answer all sections and save your progress at any time.
              </p>
              <button
                onClick={() => { setStartFresh(false); setStarted(true);}}
                className="w-full px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base shadow-lg transition-all"
              >
                Begin Assessment →
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  

  return <FormSheet
    key={startFresh ? "fresh" : "resume"}
    steps={data.parts}
    assessmentId={data.pk}
    title={`${engineName} Assessment`}
    initialFormData={startFresh ? {} : (existingResponses || {})}
    autoSaveKey={`assessment_${engineName}`}
    autoSaveDebounce={5000}
    onStepSave={handleStepSave}
    onComplete={handleComplete}
    onNavigateBack={() => { navigate(-1) }}
    onAutoSaveToServer={handleStepSave}
    onError={
      (error: Error, context: string) => {
        console.error(`Error in ${context}: `, error)
      }
    }
  />;
}

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

const FormSheet = ({
  steps,
  assessmentId,
  title = "Form",
  initialFormData = {},
  initialStep = 0,
  autoSaveKey = "questionnaireDraft",
  autoSaveDebounce = 3000,
  onStepSave,
  onComplete,
  onNavigateBack,
  onError,
  onAutoSaveToServer,
  className = "",
  showProgressBar = true,
  showAutoSaveIndicator = true
}: QuestionnaireEngineProps) => {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [showToast, setShowToast] = useState(false);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  // auto save hooking system
  const { formData, setFormData, saveToServer } = useAutoSaveForm<any>(
    autoSaveKey,
    initialFormData,
    {
      debounce: autoSaveDebounce,
      onSaveToServer: async (data: any) => {
        if (onAutoSaveToServer) {
          await onAutoSaveToServer({
            stepIndex: currentStep,
            stepName: steps[currentStep].part,
            answers: data,
            progress: ((currentStep + 1) / steps.length) * 100
          });
        }
      },
      onSave: () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1500);
      }
    }
  );

  // validation hook
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
      window.scrollTo({ top: 0, behavior: "smooth" });
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
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((p) => p - 1);
      setErrors({});
      window.scrollTo({ top: 0, behavior: "smooth" });
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
      <div className="max-w-3xl w-full bg-white rounded-xl shadow-2xl p-4 sm:p-8 space-y-6 border border-gray-200">
        <h1 className="text-2xl font-extrabold text-gray-900 text-center mb-4">
          {title}
        </h1>

        {showProgressBar && <ProgressBar progress={progress} />}

    

        {/* Current Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            key={currentStepData.part}
          >
            <div className="mb-6 space-y-1">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                Section {currentStep + 1}
              </span>

              <h2 className="text-2xl font-bold text-gray-900">
                {currentStepData.part}
              </h2>

              <p className="text-sm text-gray-600">
                {currentStepData.intro}
              </p>
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
            type="button"
            onClick={handlePrevious}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-lg bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Previous
          </button>
          <button
            type="button"
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
  onAutoSaveToServer?: (stepData: any) => Promise<void>;
  className?: string;
  showProgressBar?: boolean;
  showAutoSaveIndicator?: boolean;
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
  otherValue?: any;
  onChange: (questionId: string, value: any) => void;
  error?: string;
  otherError?: string;
}) {

  const qId = question.id;
  const checkboxValue = Array.isArray(value) ? value : [];

  const getMaxSelections = (q: any) => {
    // 1️⃣ Explicit backend config always wins
    if (q.maxSelections) return q.maxSelections;

    const text = `${q.title} ${q.question}`.toLowerCase();

    // 2️⃣ Match ALL known patterns:
    // - Select 3
    // - Select up to 3
    // - Select top 3
    // - Select max 3
    const match = text.match(
      /select\s+(?:up\s+to\s+|top\s+|max\s+)?(\d+)/i
    );

    return match ? Number(match[1]) : undefined;
  };

  const maxSelections = getMaxSelections(question);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 shadow-sm">
      <p className="text-sm font-semibold text-blue-600 tracking-wide">
        {question.number}. {question.title} {question.required && <span className="text-red-500">*</span>}
      </p>
      <p className="text-base font-medium text-gray-900">{question.question}</p>

      {/* Checkbox Input Type */}
      {question.type === "checkbox" && (
        <div className="checkbox-group grid grid-cols-1 sm:grid-cols-2 gap-2">
          {question.options?.map((opt, idx) => (
            <label
              key={idx}
              className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all
  ${checkboxValue.includes(opt)
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-blue-300"
                }`}
            >
              <input
                type="checkbox"
                checked={checkboxValue.includes(opt)}
                onChange={(e) => {
                  if (e.target.checked) {
                    if (
                      maxSelections !== undefined &&
                      checkboxValue.length >= maxSelections
                    ) {
                      return; // 🚫 HARD STOP
                    }
                    onChange(qId, [...checkboxValue, opt]);
                  } else {
                    onChange(qId, checkboxValue.filter(v => v !== opt));
                  }
                }}
              />

              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </div>
      )}
      {/* ranking input type */}
      {question.type === "ranking" && (
        <RankingQuestion
          question={question}
          value={value}
          onChange={onChange}
        />
      )}

      {/* Radio Input Type */}
      {question.type === "radio" && (
        <div className="grid grid-cols-2 gap-4">
          {question.options?.map((opt, idx) => (
            <label
  key={idx}
  className={`flex items-center gap-3 border rounded-xl p-4 cursor-pointer transition-all
  ${
    value === opt
      ? "border-blue-500 bg-blue-50"
      : "border-gray-200 hover:border-blue-300"
  }`}
>
              <input
                type="radio"
                name={qId}
                className="hidden"
                checked={value === opt}
                onChange={() => onChange(qId, opt)}
              />

              <span className="text-xs font-semibold text-gray-500">
  {String.fromCharCode(65 + idx)}
</span>
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
            value={value ?? ""}
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
          value={value ?? ""}
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
          value={value ?? ""}
          onChange={(e) => onChange(qId, e.target.value)}
          placeholder="Your answer..."
          className="w-full px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
        />
      )}

      {/* "Other" Input Field */}
      <AnimatePresence>
        {question.hasOther && (
          ((question.type === "checkbox" && checkboxValue.includes("Other")) ||
            (question.type === "radio" && value === "Other") ||
            (question.type === "dropdown" && value === "Other") ||
            (question.type === "scale" && value === "Other")) && (
            <input
              type="text"
              name={`${qId}_other`}
              placeholder="Please specify..."
              className="w-full px-3 py-1.5 mt-2 rounded-md border border-gray-300 bg-white text-gray-800 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
