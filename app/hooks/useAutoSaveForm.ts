import { useEffect, useState, useRef, useCallback } from "react";

export function useAutoSaveForm<T extends object>(key: string, initialData: T,
  options?: {
    debounce?: number;
    onSave?: (data: T) => void;
    onSaveError?: (error: Error) => void;
    onSaveToServer?: (data: T) => Promise<void>;
  }
) {
  const [formData, setFormData] = useState<T>(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const debounceTime = options?.debounce ?? 2000;
  const isFirstRender = useRef(true);
  const optionsRef = useRef(options);

  // Update options ref whenever they change
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  // Load saved data on component mount from local storage
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          setFormData(prev => ({ ...prev, ...parsed }));
        }
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, [key]);

  const saveToServer = useCallback(async (data: T) => {
    setIsSaving(true);
    try {
      if (optionsRef.current?.onSaveToServer) {
        await optionsRef.current.onSaveToServer(data);
      } else {
        // Fallback for demo/dev
        await new Promise((res) => setTimeout(res, 500));
      }
      optionsRef.current?.onSave?.(data);
    } catch (e) {
      console.error("Failed to save to server:", e);
      optionsRef.current?.onSaveError?.(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Auto-save whenever data changes
  useEffect(() => {
    // Avoid saving on initial render
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    localStorage.setItem(key, JSON.stringify(formData));

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      saveToServer(formData);
    }, debounceTime);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [formData, key, debounceTime, saveToServer]);

  const clearData = useCallback(() => {
    localStorage.removeItem(key);
    setFormData(initialData);
  }, [key, initialData]);

  return { formData, setFormData, saveToServer, isSaving, clearData };
}