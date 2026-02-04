import { ActionFunction, json, LoaderFunction, redirect } from "@remix-run/node";
import { useActionData, useSearchParams } from "@remix-run/react";
import { useEffect } from "react";
import { loginUser } from "~/models/user.model.server";
import { createAuthSession } from "~/lib/session.server";
import { validateSubmissionHash } from "~/lib/auth.server";
import AuthForm from "~/components/AuthCards";
import Navbar from "~/components/HomePageComponents/Navbar";
import { toast } from "react-toastify";
import { AnimatedCircles } from "~/components/AnimatedCircles";
import { z } from "zod";
import { verifyHCaptcha } from "~/utils/captcha.server";
import { action as authAction } from "./auth._index";

// We can reuse the action from auth._index.tsx or duplicate it. 
// For now, importing it is cleaner if we export it, but I don't see it exported in my previous view.
// I will just copy the action logic or import it if I can.
// Actually, I can just export the action from auth._index.tsx and re-export it here.
// But wait, the file path is dynamic.
// Let's create a standard action handler utility? 
// Or just copy paste to be safe and autonomous.

// ... Copying action logic ...
// Only keeping Login logic ideally, but the form handles both. 
// If the user switches tabs in AuthForm, they might try to signup on /login page.
// So the action must handle both.

// Re-using the exact code from auth._index.tsx is the safest bet to ensure feature parity.

// Enhanced security configurations
const SECURITY_CONFIG = {
    PASSWORD_MIN_LENGTH: 8,
    FORM_TIMEOUT_MINUTES: 10,
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION_MINUTES: 15,
    ALLOWED_CAPTCHA_AGE_MINUTES: 5,
};

// Interface definitions for better type safety
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

// Enhanced password strength validation
const validatePasswordStrength = (password: string): { score: number; isValid: boolean; feedback: string[] } => {
    const checks = {
        length: password.length >= SECURITY_CONFIG.PASSWORD_MIN_LENGTH,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        notCommon: !isCommonPassword(password),
    };

    const score = Object.values(checks).filter(Boolean).length;
    const feedback: string[] = [];

    if (!checks.length) feedback.push("at least 8 characters");
    if (!checks.lowercase) feedback.push("lowercase letter");
    if (!checks.uppercase) feedback.push("uppercase letter");
    if (!checks.numbers) feedback.push("number");
    if (!checks.special) feedback.push("special character");
    if (!checks.notCommon) feedback.push("avoid common passwords");

    return {
        score,
        isValid: score >= 4 && checks.notCommon,
        feedback
    };
};

const isCommonPassword = (password: string): boolean => {
    const commonPasswords = [
        "password", "123456", "password123", "admin", "qwerty", "letmein",
        "welcome", "monkey", "dragon", "password1", "123456789", "football"
    ];
    return commonPasswords.some(common =>
        password.toLowerCase().includes(common.toLowerCase())
    );
};

const validateEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
};

const validatePhoneNumber = (phone: string): boolean => {
    const cleanPhone = phone.replace(/\s/g, "");
    if (cleanPhone.length < 6 || cleanPhone.length > 15) return false;
    if (!/^\d+$/.test(cleanPhone)) return false;
    return true;
};

const sanitizeInput = (input: string): string => {
    return input.trim().replace(/[<>'"&]/g, '');
};

// Start of Action
export const action: ActionFunction = async ({ request }: { request: Request }) => {
    // Import here to avoid circular dep if needed, or just standard import
    const { signupUser, loginUser } = await import("~/models/user.model.server");

    const startTime = Date.now();
    const clientIp = request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "unknown";

    try {
        const form = await request.formData();
        const formData: FormSecurityData = {
            action: sanitizeInput(form.get("action") as string || ""),
            email: sanitizeInput(form.get("email") as string || ""),
            password: form.get("password") as string || "",
            confirmedPassword: form.get("confirmed_password") as string || "",
            submissionHash: form.get("submission_hash") as string || "",
            formTimestamp: form.get("form_timestamp") as string || "",
            countryIso2: sanitizeInput(form.get("country_iso2") as string || ""),
            phoneCountryCode: sanitizeInput(form.get("phone_country_code") as string || ""),
            hcaptchaToken: form.get("hcaptcha_token") as string || "",
            passwordsMatchVerified: form.get("passwords_match_verified") as string || "",
            clientValidationPassed: form.get("client_validation_passed") as string || "",
            passwordStrengthScore: form.get("password_strength_score") as string,
        };

        if (!formData.email || !formData.action || !formData.password || (!formData.confirmedPassword && formData.action === "sign_up") ||
            !formData.submissionHash || !formData.hcaptchaToken) {
            return json({ error: "Missing required security fields" }, { status: 400 });
        }

        const captchaValid = await verifyHCaptcha(formData.hcaptchaToken);
        if (!captchaValid) {
            return json({ error: "Security verification failed. Please refresh and try again." }, { status: 400 });
        }

        if (formData.formTimestamp) {
            const submissionTime = parseInt(formData.formTimestamp);
            const currentTime = Date.now();
            if (currentTime - submissionTime > SECURITY_CONFIG.FORM_TIMEOUT_MINUTES * 60 * 1000) {
                return json({ error: "Form submission expired. Please refresh and try again." }, { status: 400 });
            }
        }

        const hashValid = validateSubmissionHash(
            formData.submissionHash,
            formData,
            formData.formTimestamp ? parseInt(formData.formTimestamp) : Date.now()
        );

        if (!hashValid) {
            return json({ error: "Form integrity check failed. Please refresh and try again." }, { status: 400 });
        }

        if (formData.passwordsMatchVerified !== "true" || formData.clientValidationPassed !== "true") {
            return json({ error: "Client-side validation failed. Please refresh and try again." }, { status: 400 });
        }

        if (!validateEmail(formData.email)) {
            return json({ error: "Invalid email format" }, { status: 400 });
        }

        if (formData.action === "sign_up") {
            if (formData.password !== formData.confirmedPassword) {
                return json({ error: "Password confirmation failed. Passwords do not match." }, { status: 400 });
            }
            const passwordValidation = validatePasswordStrength(formData.password);
            if (!passwordValidation.isValid) {
                return json({ error: `Password does not meet security requirements. Missing: ${passwordValidation.feedback.join(', ')}` }, { status: 400 });
            }

            const firstName = sanitizeInput(form.get("firstname") as string || "");
            const lastName = sanitizeInput(form.get("lastname") as string || "");
            const phone = sanitizeInput(form.get("phone") as string || "");
            const agreeTerms = form.get("agreeTerms") ? true : false;
            const subscribeMarketing = form.get("subscribeMarketing") ? true : false;

            if (!firstName || !lastName || !phone || !formData.phoneCountryCode || !agreeTerms) {
                return json({ error: "Missing required signup information" }, { status: 400 });
            }

            if (!agreeTerms) {
                return json({ error: "Terms and conditions must be accepted" }, { status: 400 });
            }

            const isValidFirstName = firstName.length >= 2;
            const isValidLastName = lastName.length >= 2 || /^[A-Za-z]\.?$/.test(lastName);

            if (!isValidFirstName || !isValidLastName) {
                return json({
                    error: "Invalid name format. First name must have at least 2 characters. Last name can be an initial (e.g., M or M.) or a full name."
                }, { status: 400 });
            }
            if (!validatePhoneNumber(phone)) {
                return json({ error: "Invalid phone number format" }, { status: 400 });
            }

            const strengthScore = formData.passwordStrengthScore ? parseInt(formData.passwordStrengthScore) : 0;
            const signupData = {
                first_name: firstName,
                last_name: lastName,
                email: formData.email.toLowerCase(),
                password: formData.password,
                phone: `(${formData.phoneCountryCode})${phone.replace(/\s/g, "")}`,
                country_iso: formData.countryIso2,
                is_marketing_allowed: subscribeMarketing,
                is_term_agree: agreeTerms,
                password_strength_score: strengthScore,
                signup_timestamp: Date.now(),
            };

            const user = await signupUser(signupData);

            const url = new URL(request.url);
            const redirectTo = url.searchParams.get("redirectTo") || "/auth/drx";

            return await createAuthSession({
                userId: user.userId,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                phone: user.phone,
                is_verified_phone: user.is_verified_phone,
                is_verified_email: user.is_verified_email,
                onboardingStatus: user.onboardingStatus,
                organisationId: user.organisationId,
                country_iso: user.country_iso,
                two_fa_enabled: user.two_fa_enabled,
            }, redirectTo);
        }

        if (formData.action === "sign_in") {
            try {
                const user = await loginUser(formData.email.toLowerCase(), formData.password);
                const url = new URL(request.url);
                const redirectTo = url.searchParams.get("redirectTo") || "/auth/drx";

                return await createAuthSession({
                    userId: user.userId,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    email: user.email,
                    phone: user.phone,
                    is_verified_phone: user.is_verified_phone,
                    is_verified_email: user.is_verified_email,
                    onboardingStatus: user.onboardingStatus,
                    organisationId: user.organisationId,
                    two_fa_enabled: user.two_fa_enabled,
                    country_iso: user.country_iso
                }, redirectTo);
            } catch (error) {
                return json({ error: "Invalid email or password. Please check your credentials and try again." }, { status: 401 });
            }
        }

        return json({ error: "Invalid action specified" }, { status: 400 });

    } catch (error: unknown) {
        console.error("Authentication error:", error);
        if (error instanceof z.ZodError) {
            return json({ error: "Validation failed: " + error.issues.map((i) => i.message).join(", ") }, { status: 400 });
        }
        return json({ error: error instanceof Error ? error.message : "An unexpected error occurred." }, { status: 500 });
    }
};

export default function Login() {
    const actionData = useActionData<{ error?: string; success?: string }>();
    return (
        <div className="min-h-screen flex flex-col bg-white">
            <Navbar />
            <section className="relative flex-1 flex items-center justify-center p-4 pt-20">
                <AnimatedCircles />
                <div className="relative z-10">
                    <AuthForm initialIsLogin={true} />
                </div>
            </section>
        </div>
    );
}
