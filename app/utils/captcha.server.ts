
interface CaptchaConfig {
    secretKey?: string;
    allowedAgeMinutes?: number;
}

const DEFAULT_CONFIG: CaptchaConfig = {
    secretKey: process.env.HCAPTCHA_SECRET_KEY,
    allowedAgeMinutes: 5,
};

export const verifyHCaptcha = async (
    token: string,
    config: CaptchaConfig = DEFAULT_CONFIG
): Promise<boolean> => {
    try {
        const secret = config.secretKey || process.env.HCAPTCHA_SECRET_KEY;
        const allowedAge = config.allowedAgeMinutes || 5;

        if (!secret) {
            console.error("HCAPTCHA_SECRET_KEY not configured");
            return false;
        }

        const params = new URLSearchParams({
            secret,
            response: token,
        });

        const response = await fetch("https://api.hcaptcha.com/siteverify", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString(),
        });

        if (!response.ok) {
            console.error(`hCaptcha API error: ${response.status}`);
            return false;
        }

        const data = await response.json();

        if (data.success) {
            const challengeTimestamp = new Date(data.challenge_ts).getTime();
            const now = Date.now();
            const ageMinutes = (now - challengeTimestamp) / (1000 * 60);

            if (ageMinutes > allowedAge) {
                console.warn("hCaptcha token expired");
                return false;
            }

            return true;
        }

        console.warn("hCaptcha validation failed:", data["error-codes"]);
        return false;
    } catch (error) {
        console.error("hCaptcha verification error:", error);
        return false;
    }
};
