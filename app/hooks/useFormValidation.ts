import { useState } from "react";

export function useFormValidation(steps: any[], formData: any, currentStep: number) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateCurrentStep = () => {
    const step = steps[currentStep];
    const newErrors: Record<string, string> = {};

    step.questions.forEach((q: any) => {
      const value = formData[q.id];

      if (q.required && (value === undefined || value === "" || value === null || (Array.isArray(value) && value.length === 0))) {
        newErrors[q.id] = "This field is required";
      }

      if (
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return { errors, validateCurrentStep, setErrors };
}