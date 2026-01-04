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
 * @param text The input string.
 * @returns Parsed JSON object.
 * @throws SyntaxError if the text is not valid JSON.
 */
function directParse(text: string): any {
    return JSON.parse(text.trim());
}

/**
 * Extracts and parses JSON from a markdown code block (e.g., ```json{...}``` or ```{...}```).
 * @param text The input string potentially containing markdown.
 * @returns Parsed JSON object.
 * @throws Error if no valid JSON block is found or parsing fails.
 */
function parseFromMarkdownBlock(text: string): any {
    const jsonMatch = text.match(/```(?:json\n)?([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
        return JSON.parse(jsonMatch[1].trim());
    }
    throw new Error('No markdown JSON block found');
}

/**
 * Extracts and parses JSON by finding the first '{' and last '}' characters.
 * This is useful if there's leading/trailing non-JSON text.
 * @param text The input string.
 * @returns Parsed JSON object.
 * @throws Error if valid JSON boundaries are not found or parsing fails.
 */
function extractByBraceBoundaries(text: string): any {
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || firstBrace >= lastBrace) {
        throw new Error('No valid JSON boundaries found');
    }

    const jsonCandidate = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(jsonCandidate);
}

/**
 * Aggressively cleans the string by removing all backticks and then attempting to extract by brace boundaries.
 * This handles cases where backticks might appear inside or outside the JSON structure, but not as full markdown blocks.
 * @param text The input string.
 * @returns Parsed JSON object.
 * @throws Error if extraction or parsing fails after cleanup.
 */
function aggressiveCleanupAndExtract(text: string): any {
    const cleaned = text.replace(/`/g, '').trim(); // Remove all backticks
    return extractByBraceBoundaries(cleaned);
}

/**
 * Cleans the string by removing non-ASCII characters (often hallucinations) and then extracts by brace boundaries.
 * @param text The input string.
 * @returns Parsed JSON object.
 */
function asciiCleanupAndExtract(text: string): any {
    // Remove non-ASCII characters
    const cleaned = text.replace(/[^\x00-\x7F]/g, "").trim();
    return extractByBraceBoundaries(cleaned);
}

/**
 * Attempts to repair common JSON errors using regex replacement.
 * @param text The input string.
 * @returns Parsed JSON object.
 */
function repairJson(text: string): any {
    let repaired = text.trim();
    // Fix trailing commas
    repaired = repaired.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
    // Try to quote unquoted keys (simple case)
    repaired = repaired.replace(/([{,]\s*)(\w+)(\s*:)/g, '$1"$2"$3');
    // Remove "JSON:" prefix if present
    repaired = repaired.replace(/^JSON:/i, '');

    return extractByBraceBoundaries(repaired);
}

export function postProcessAiResponse<T = any>(responseText: string): JsonProcessingResult<T> {
    if (!responseText || responseText.trim().length === 0) {
        return { success: false, error: 'Empty response text provided' };
    }

    const strategies = [
        { name: 'directParse', fn: directParse },
        { name: 'parseFromMarkdownBlock', fn: parseFromMarkdownBlock },
        { name: 'extractByBraceBoundaries', fn: extractByBraceBoundaries },
        { name: 'aggressiveCleanupAndExtract', fn: aggressiveCleanupAndExtract },
        { name: 'asciiCleanupAndExtract', fn: asciiCleanupAndExtract },
        { name: 'repairJson', fn: repairJson }, // Robust repair
    ];

    for (const strategy of strategies) {
        try {
            const data = strategy.fn(responseText);
            if (data && typeof data === 'object') {
                return { success: true, data: data as T, strategyUsed: strategy.name };
            }
        } catch (e: any) {
            console.warn(`Strategy '${strategy.name}' failed: ${e.message}`);
        }
    }

    console.error("❌ FAILED JSON RESPONSE START:\n", responseText.slice(0, 500));
    console.error("... END:\n", responseText.slice(-500));

    return { success: false, error: 'All parsing strategies failed' };
}