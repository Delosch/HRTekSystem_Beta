
interface DecentroResponse {
    status: string;
    message?: string;
    data?: any;
    error?: any;
}

const DECENTRO_CONFIG = {
    baseUrl: "https://in.staging.decentro.tech",
    clientId: "DeloschTechnologies_9_sop",
    clientSecret: "27e67337a05e4cef931fbd788996f3ba",
    moduleSecret: "370b6a1f132e4c0bb2b1808299445d04"
};

const HEADERS = {
    "client_id": DECENTRO_CONFIG.clientId,
    "client_secret": DECENTRO_CONFIG.clientSecret,
    "module_secret": DECENTRO_CONFIG.moduleSecret,
    "Content-Type": "application/json"
};

import { randomUUID } from "node:crypto";

export async function verifyBusinessId(type: "GST" | "PAN" | "CIN", id: string): Promise<DecentroResponse> {
    const consent = "Y";
    const consentPurpose = "For company verification during onboarding";
    const endpoint = `${DECENTRO_CONFIG.baseUrl}/kyc/public_registry/validate`;
    const referenceId = randomUUID();

    let documentType = "";
    switch (type) {
        case "GST":
            documentType = "GSTIN_DETAILED";
            break;
        case "PAN":
            documentType = "PAN_DETAILED";
            break;
        case "CIN":
            documentType = "CIN";
            break;
        default:
            throw new Error("Invalid ID type");
    }

    const payload = {
        reference_id: referenceId,
        document_type: documentType,
        id_number: id,
        consent,
        consent_purpose: consentPurpose
    };

    try {
        console.log(`[Decentro] Verifying ${type} (${id}) using ${documentType} at ${endpoint}...`);

        const response = await fetch(endpoint, {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.status === "SUCCESS") {
            console.log(`[Decentro] ${type} Verification Successful`, data);
            return {
                status: "success",
                data: data.data // Check if data.data contains the extraction
            };
        } else {
            console.error(`[Decentro] ${type} Verification Failed`, data);
            return {
                status: "error",
                message: data.message || "Verification failed",
                error: data.error
            };
        }

    } catch (error) {
        console.error(`[Decentro] API Error:`, error);
        return {
            status: "error",
            message: "Internal server error during verification"
        };
    }
}
