import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BlobBackground from "~/components/BlobBackground";
import type { ProfilingSteps } from "~/types/profilingAssessment";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useAutoSaveForm } from "~/hooks/useAutoSaveForm";



function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="w-full bg-white/20 rounded-full h-2 mb-4">
      <div
        className="bg-green-500 h-2 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export default function Questionnaire() {
  const [currentStep, setCurrentStep] = useState(0);
  const LoaderData = useLoaderData<ProfilingSteps>();
  const profilingSteps = LoaderData.parts;
  const navigate = useNavigate();
  const step = profilingSteps[currentStep];
  const progress = ((currentStep + 1) / profilingSteps.length) * 100;
  const [showToast, setShowToast] = useState(false);
  const { formData, setFormData, saveToServer, isSaving } = useAutoSaveForm<any>(
    "profilingDraft",
    {},
    {
      debounce: 3000,
      onSave: () => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 1500);
      },
    }
  );

  const handleChange = (qKey: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [qKey]: value }));
  };

  const handleSaveCurrentStep = async () => {
    const sectionAnswers: Record<string, any> = Object.entries(formData)
      .filter(([key]) => key.startsWith(`step${currentStep}_`))
      .reduce((acc, [key, val]) => {
        acc[key] = val;
        return acc;
      }, {} as Record<string, any>);

    await fetch("/onboarding/profilingAssessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assessment_id: LoaderData.pk,
        progress,
        section: step.part,
        answers: sectionAnswers,
      }),
    });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-950 via-gray-900 to-indigo-950 px-4 py-8 text-white">
      <BlobBackground />
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded shadow-lg text-sm z-50"
          >
            ✅ Saved!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl relative z-10">
        <ProgressBar progress={progress} />

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} key={step.part}>
          <h2 className="text-xl sm:text-2xl font-bold mb-2">{step.part}</h2>
          <p className="text-sm text-gray-300 mb-4">{step.intro}</p>

          <div className="space-y-6">
            {step.questions.map((q) => {
              const qKey = `step${currentStep}_q${q.number}`;
              const value = formData[qKey] || "";
              const checkboxValue = Array.isArray(value) ? value : [];

              return (
                <div key={q.number}>
                  <p className="font-semibold text-sm mb-1">{q.number}. {q.title}</p>
                  <p className="text-xs text-gray-400 mb-2">{q.question}</p>

                  {q.type === "checkbox" && q.options?.map((opt, idx) => (
                    <label key={idx} className="flex items-center space-x-2 text-sm mb-1">
                      <input
                        type="checkbox"
                        checked={checkboxValue.includes(opt)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            handleChange(qKey, [...checkboxValue, opt]);
                          } else {
                            handleChange(qKey, checkboxValue.filter((v) => v !== opt));
                          }
                        }}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}

                  {q.type === "radio" && q.options?.map((opt, idx) => (
                    <label key={idx} className="flex items-center space-x-2 text-sm mb-1">
                      <input
                        type="radio"
                        name={qKey}
                        checked={value === opt}
                        onChange={() => handleChange(qKey, opt)}
                      />
                      <span>{opt}</span>
                    </label>
                  ))}

                  {q.type === "dropdown" && (
                    <select
                      value={value}
                      onChange={(e) => handleChange(qKey, e.target.value)}
                      className="w-full px-2 py-1 rounded bg-white/20 text-sm"
                    >
                      <option disabled value="">Please select an option...</option>
                      {q.options?.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  )}

                  <AnimatePresence>
                    {q.hasOther && (
                      <>
                        {q.type === "checkbox" && checkboxValue.includes("Other") && (
                          <motion.input
                            key="other-checkbox"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            type="text"
                            placeholder="Please specify..."
                            className="w-full px-2 py-1 mt-1 rounded bg-white/20 text-xs"
                            value={formData[`${qKey}_other`] || ""}
                            onChange={(e) => handleChange(`${qKey}_other`, e.target.value)}
                          />
                        )}

                        {q.type === "dropdown" && value === "Other" && (
                          <motion.input
                            key="other-dropdown"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            type="text"
                            placeholder="Please specify..."
                            className="w-full px-2 py-1 mt-1 rounded bg-white/20 text-xs"
                            value={formData[`${qKey}_other`] || ""}
                            onChange={(e) => handleChange(`${qKey}_other`, e.target.value)}
                          />
                        )}

                        {q.type === "radio" && value === "Other" && (
                          <motion.input
                            key="other-radio"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            type="text"
                            placeholder="Please specify..."
                            className="w-full px-2 py-1 mt-1 rounded bg-white/20 text-xs"
                            value={formData[`${qKey}_other`] || ""}
                            onChange={(e) => handleChange(`${qKey}_other`, e.target.value)}
                          />
                        )}
                      </>
                    )}
                  </AnimatePresence>

                  {q.type === "textarea" && (
                    <textarea
                      value={value}
                      onChange={(e) => handleChange(qKey, e.target.value)}
                      placeholder="Your answer..."
                      className="w-full px-2 py-1 rounded bg-white/20 text-sm"
                    />
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 rounded bg-gray-600/40 hover:bg-gray-600/60 disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={async () => {
              await handleSaveCurrentStep();
              if (currentStep < profilingSteps.length - 1) {
                setCurrentStep((p) => p + 1);
              } else {
                await saveToServer();
                alert("Form completed!");
                navigate("/dashboard");//payment
              }
            }}
            className="px-6 py-2 rounded bg-green-600 hover:bg-green-700"
          >
            {currentStep === profilingSteps.length - 1 ? "Finish" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
