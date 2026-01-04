import { useEffect, useState, useRef } from "react";

export function useAutoSaveForm<T extends object>(key: string, initialData: T,
  options?: {
    debounce?: number;
    onSave?: () => void
  }
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTime = options?.debounce ?? 2000;
  // Load saved data on component mount from local storage
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, [key]);

  // Auto-save whenever data changes
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(formData));

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveToServer();
    }, debounceTime);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [formData]);


  // Add future: save to DB / API here
  const saveToServer = async () => {
    setIsSaving(true);
    try {
      // replace with real API call if needed
      await new Promise((res) => setTimeout(res, 500));
      options?.onSave?.();  // e.g., show toast
    } catch (e) {
      console.error("Failed to save to server:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return { formData, setFormData, saveToServer };
}