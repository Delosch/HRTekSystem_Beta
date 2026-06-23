import { useState, useCallback } from "react";
import type { HTIAdvisoryContent } from "~/models/hti.model.server";

/**
 * Custom hook for generating strategic advisory reports via the dedicated
 * /api/report/generate resource route.
 *
 * This avoids using Remix's useFetcher which posts to the page's own action,
 * causing turbo-stream decoding errors when the AI call times out (504).
 */
export function useReportGenerator() {
    const [reportData, setReportData] = useState<HTIAdvisoryContent | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [reportError, setReportError] = useState<string | undefined>(undefined);

    const generate = useCallback(async (engineName: string, answers: any) => {
        if (isGenerating || reportData) return;

        setIsGenerating(true);
        setReportError(undefined);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 120_000); // 120s client-side timeout

        try {
            const res = await fetch("/api/report/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ engineName, answers: answers || {} }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                const errBody = await res.json().catch(() => ({}));
                throw new Error(errBody.error || `Server error (${res.status})`);
            }

            const result = await res.json();
            if (result.success && result.advisory) {
                setReportData(result.advisory);
            } else {
                throw new Error(result.error || "Unknown error");
            }
        } catch (err: any) {
            clearTimeout(timeoutId);
            if (err.name === "AbortError") {
                setReportError(
                    "Report generation timed out. The AI model is taking longer than expected — please try again."
                );
            } else {
                setReportError(err.message || "Failed to generate AI report");
            }
            console.error(`[${engineName}] Report Generation Error:`, err);
        } finally {
            setIsGenerating(false);
        }
    }, [isGenerating, reportData]);

    return { reportData, isGenerating, reportError, generate };
}
