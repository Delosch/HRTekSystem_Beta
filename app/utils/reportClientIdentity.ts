export const CONFIDENTIAL_CLIENT_NAME = "Confidential Client";

export type ReportCompanyIdentitySource = {
    company_name?: unknown;
    brand_name?: unknown;
    logo_url?: unknown;
};

export type ReportClientIdentity = {
    /**
     * Primary client-facing organisation name.
     *
     * Resolution order:
     * 1. company_name
     * 2. brand_name
     * 3. "Confidential Client"
     */
    companyName: string;

    /**
     * Client-facing brand name.
     *
     * Uses brand_name when it is valid. Otherwise it falls back to the
     * resolved companyName so consumers always receive a safe display value.
     */
    brandName: string;

    /**
     * Trimmed logo URL when supplied; otherwise null.
     */
    logoUrl: string | null;
};

const UUID_PATTERN =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const INTERNAL_COMPANY_KEY_PATTERN =
    /^COMPANY#/i;

function cleanString(value: unknown): string | null {
    if (typeof value !== "string") {
        return null;
    }

    const trimmedValue = value.trim();

    return trimmedValue.length > 0
        ? trimmedValue
        : null;
}

/**
 * Returns true when a value looks like an internal company identifier and
 * should therefore not be rendered as a client-facing organisation name.
 */
export function isInternalCompanyIdentifier(
    value: unknown,
): boolean {
    const cleanedValue = cleanString(value);

    if (!cleanedValue) {
        return false;
    }

    return (
        UUID_PATTERN.test(cleanedValue) ||
        INTERNAL_COMPANY_KEY_PATTERN.test(cleanedValue)
    );
}

function cleanDisplayName(
    value: unknown,
): string | null {
    const cleanedValue = cleanString(value);

    if (
        !cleanedValue ||
        isInternalCompanyIdentifier(cleanedValue)
    ) {
        return null;
    }

    return cleanedValue;
}

/**
 * Resolves safe client-facing identity values for report rendering.
 *
 * Company IDs are deliberately not accepted as a display-name fallback.
 */
export function resolveReportClientIdentity(
    company: ReportCompanyIdentitySource | null | undefined,
): ReportClientIdentity {
    const companyNameCandidate =
        cleanDisplayName(company?.company_name);

    const brandNameCandidate =
        cleanDisplayName(company?.brand_name);

    const companyName =
        companyNameCandidate ??
        brandNameCandidate ??
        CONFIDENTIAL_CLIENT_NAME;

    const brandName =
        brandNameCandidate ??
        companyName;

    const logoUrl =
        cleanString(company?.logo_url);

    return {
        companyName,
        brandName,
        logoUrl,
    };
}
