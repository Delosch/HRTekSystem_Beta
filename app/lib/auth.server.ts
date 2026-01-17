import crypto from "crypto";

interface FormSecurityData {
    action: string;
    email: string;
    password: string;
    confirmedPassword: string;
    submissionHash: string;
    formTimestamp: string;
    countryIso2: string;
    phoneCountryCode: string;
    hcaptchaToken: string;
    passwordsMatchVerified: string;
    clientValidationPassed: string;
    passwordStrengthScore?: string;
}

export const validateSubmissionHash = (
    submissionHash: string,
    formData: FormSecurityData,
    timestamp: number
): boolean => {
    try {
        const secureData = {
            action: formData.action,
            password: formData.password,
            confirmPassword: formData.confirmedPassword,
            timestamp: timestamp,
            countryComposite: `${formData.countryIso2}_${formData.phoneCountryCode}`,
            email: formData.email || ""
        };

        const dataString = Object.values(secureData).join('|');

        const secureHash = crypto.createHash('sha256').update(dataString).digest('hex');
        const expectedSecureHash = secureHash.slice(0, 16);

        if (expectedSecureHash === submissionHash) {
            return true;
        }

        let simpleHash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            simpleHash = ((simpleHash << 5) - simpleHash) + char;
            simpleHash = simpleHash & simpleHash;
        }

        const expectedSimpleHash = Math.abs(simpleHash).toString(36);
        return expectedSimpleHash === submissionHash;

    } catch (error) {
        console.warn("Hash validation error:", error);
        return false;
    }
};
