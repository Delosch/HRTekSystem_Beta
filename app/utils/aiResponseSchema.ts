import { z, ZodSchema } from "zod";

/**
 * Interface for the result of the post-processing operation.
 */
export interface JsonProcessingResult<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    strategyUsed?: string;
}

/**
 * Attempts to parse a string directly as JSON.
 */
function directParse(text: string): any {
    return JSON.parse(text.trim());
}

function parseFromMarkdownBlock(text: string): any {
    const jsonMatch = text.match(/```(?:json\n)?([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
    }
    throw new Error('No markdown JSON block found');
}

function extractByBraceBoundaries(text: string): any {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        throw new Error('No valid JSON boundaries found');
    }
    const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonCandidate);
}

function aggressiveCleanupAndExtract(text: string): any {
    const cleaned = text.replace(/`/g, '').trim();
    return extractByBraceBoundaries(cleaned);
}

/**
 * Post-processes an AI response string to reliably extract and validate JSON.
 *
 * @param responseText The raw string response from the AI.
 * @param schema Optional Zod schema to validate structure.
 * @returns A JsonProcessingResult object.
 */
export function postProcessAiResponse<T = any>(
    responseText: string,
    schema?: ZodSchema<T>
): JsonProcessingResult<T> {
    if (!responseText || responseText.trim().length === 0) {
        return { success: false, error: 'Empty response text provided' };
    }

    const strategies = [
        { name: 'directParse', fn: directParse },
        { name: 'parseFromMarkdownBlock', fn: parseFromMarkdownBlock },
        { name: 'extractByBraceBoundaries', fn: extractByBraceBoundaries },
        { name: 'aggressiveCleanupAndExtract', fn: aggressiveCleanupAndExtract },
    ];

    for (const strategy of strategies) {
        try {
            const parsed = strategy.fn(responseText);
            if (typeof parsed === 'object' && parsed !== null) {
                if (schema) {
                    const result = schema.safeParse(parsed);
                    if (!result.success) {
                        console.warn(`Validation failed using '${strategy.name}':`, result.error.format());
                        continue;
                    }
                    return { success: true, data: result.data, strategyUsed: strategy.name };
                } else {
                    return { success: true, data: parsed, strategyUsed: strategy.name };
                }
            }
        } catch (e: any) {
            console.warn(`Strategy '${strategy.name}' failed: ${e.message}`);
        }
    }

    return { success: false, error: 'All parsing and validation strategies failed' };
}