import { ActionFunction, json, LoaderFunction, redirect} from "@remix-run/node";
import { z } from "zod";
import crypto from "crypto";
import { signupUser, loginUser } from "~/models/user.model";
import { createAuthSession, requireUserSession } from "~/lib/session.server";
import { useActionData } from "@remix-run/react";
import { useEffect } from "react";
// import Squares from "~/components/squareBg";
import AuthForm from "~/components/AuthCards";
import { ToastContainer, toast } from "react-toastify";
import { AnimatedCircles } from "~/components/AnimatedCircles";

// export const loader: LoaderFunction = async ({request}:{request:Request})=>{
//     const user = await requireUserSession(request);
//     if(!user){
//         return {"msg":"success"}
//     }
//     // else
//         // throw redirect('/auth/drx')
// }

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

// Enhanced hCaptcha verification with better error handling
const verifyHCaptcha = async (token: string): Promise<boolean> => {
    try {
        const secret = process.env.HCAPTCHA_SECRET_KEY;
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

            if (ageMinutes > SECURITY_CONFIG.ALLOWED_CAPTCHA_AGE_MINUTES) {
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

// Enhanced submission hash validation
const validateSubmissionHash = (
    submissionHash: string,
    formData: FormSecurityData,
    timestamp: number
): boolean => {
    try {
        // FIXED: Use exact same structure as frontend
        const secureData = {
            action: formData.action,
            password: formData.password,
            confirmPassword: formData.confirmedPassword,
            timestamp: timestamp,
            countryComposite: `${formData.countryIso2}_${formData.phoneCountryCode}`,
            email: formData.email || "" // ADDED: Include email
        };

        const dataString = Object.values(secureData).join('|');

        // Try secure hash validation first (SHA-256)
        const secureHash = crypto.createHash('sha256').update(dataString).digest('hex');
        const expectedSecureHash = secureHash.slice(0, 16);

        console.log('Hash validation debug:', {
            receivedHash: submissionHash,
            expectedSecureHash,
            dataString,
            formData: {
                action: formData.action,
                email: formData.email,
                timestamp: timestamp,
                countryComposite: `${formData.countryIso2}_${formData.phoneCountryCode}`
            }
        });

        if (expectedSecureHash === submissionHash) {
            return true;
        }

        // Fallback to simple hash validation
        let simpleHash = 0;
        for (let i = 0; i < dataString.length; i++) {
            const char = dataString.charCodeAt(i);
            simpleHash = ((simpleHash << 5) - simpleHash) + char;
            simpleHash = simpleHash & simpleHash;
        }

        const expectedSimpleHash = Math.abs(simpleHash).toString(36);
        console.log('Simple hash debug:', {
            receivedHash: submissionHash,
            expectedSimpleHash
        });

        return expectedSimpleHash === submissionHash;

    } catch (error) {
        console.warn("Hash validation error:", error);
        return false;
    }
};

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

// Main action function
export const action: ActionFunction = async ({ request }: { request: Request }) => {
    const startTime = Date.now();
    const clientIp = request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") || "127.0.0.1"; // Use localhost instead of "unknown"
    const userAgent = request.headers.get("user-agent") || "unknown";

    try {
        const form = await request.formData();
        console.log("See here ------------\n", form);

        // Extract and validate all form data
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

        // Basic field validation
        if (!formData.email || !formData.action || !formData.password || (!formData.confirmedPassword && formData.action==="sign_up") ||
            !formData.submissionHash || !formData.hcaptchaToken) {
            return json({ error: "Missing required security fields" }, { status: 400 });
        }

        // 1. VALIDATE HCAPTCHA
        const captchaValid = await verifyHCaptcha(formData.hcaptchaToken);
        if (!captchaValid) {
            console.warn("Failed captcha attempt", { ip: clientIp, timestamp: Date.now() });
            return json({
                error: "Security verification failed. Please refresh and try again."
            }, { status: 400 });
        }

        // 2. VALIDATE FORM TIMESTAMP
        if (formData.formTimestamp) {
            const submissionTime = parseInt(formData.formTimestamp);
            const currentTime = Date.now();
            const timeWindow = SECURITY_CONFIG.FORM_TIMEOUT_MINUTES * 60 * 1000;

            if (currentTime - submissionTime > timeWindow) {
                return json({
                    error: "Form submission expired. Please refresh and try again."
                }, { status: 400 });
            }
        }

        // 3. VALIDATE SUBMISSION HASH
        const hashValid = validateSubmissionHash(
            formData.submissionHash,
            formData,
            formData.formTimestamp ? parseInt(formData.formTimestamp) : Date.now()
        );

        if (!hashValid) {
            console.warn("Submission hash validation failed", {
                ip: clientIp,
                userAgent: userAgent.slice(0, 100),
                timestamp: Date.now(),
                action: formData.action
            });

            return json({
                error: "Form integrity check failed. Please refresh and try again."
            }, { status: 400 });
        }



        // 5. VALIDATE CLIENT-SIDE SECURITY CHECKS
        if (formData.passwordsMatchVerified !== "true" || formData.clientValidationPassed !== "true") {
            return json({
                error: "Client-side validation failed. Please refresh and try again."
            }, { status: 400 });
        }

        // 6. VALIDATE EMAIL FORMAT
        if (!validateEmail(formData.email)) {
            return json({ error: "Invalid email format" }, { status: 400 });
        }


        // PROCESS BASED ON ACTION
        if (formData.action === "sign_up") {
            // 4. VALIDATE PASSWORD CONFIRMATION
            if (formData.password !== formData.confirmedPassword) {
                return json({
                    error: "Password confirmation failed. Passwords do not match."
                }, { status: 400 });
            }
            // 7. VALIDATE PASSWORD STRENGTH
            const passwordValidation = validatePasswordStrength(formData.password);
            if (!passwordValidation.isValid) {
                return json({
                    error: `Password does not meet security requirements. Missing: ${passwordValidation.feedback.join(', ')}`
                }, { status: 400 });
            }

            // 8. VALIDATE COUNTRY/PHONE DATA CONSISTENCY
            const countryDialComposite = form.get("country_dial_composite") as string;
            if (countryDialComposite) {
                const [expectedIso, expectedDialCode] = countryDialComposite.split('_');
                if (formData.countryIso2 !== expectedIso || formData.phoneCountryCode !== expectedDialCode) {
                    return json({
                        error: "Country and phone code data inconsistency detected."
                    }, { status: 400 });
                }
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

// Allows:
// - "M"
// - "M."
// - "Sharma"
const isValidLastName =
    lastName.length >= 2 || /^[A-Za-z]\.?$/.test(lastName);

if (!isValidFirstName || !isValidLastName) {
    return json({
        error: "Invalid name format. First name must have at least 2 characters. Last name can be an initial (e.g., M or M.) or a full name."
    }, { status: 400 });
}


            if (!validatePhoneNumber(phone)) {
                return json({ error: "Invalid phone number format" }, { status: 400 });
            }

            const strengthScore = formData.passwordStrengthScore ?
                parseInt(formData.passwordStrengthScore) : 0;
            if (strengthScore < 4) {
                return json({
                    error: "Password does not meet minimum security requirements"
                }, { status: 400 });
            }

            console.log("Secure signup submission validated", {
                email: formData.email,
                country: formData.countryIso2,
                passwordStrength: strengthScore,
                timestamp: Date.now(),
                ip: clientIp,
                processingTime: Date.now() - startTime
            });

            // Prepare data for your existing signupUser function
            const signupData = {
                first_name: firstName,
                last_name: lastName,
                email: formData.email.toLowerCase(),
                password: formData.password, // Will be hashed in signupUser
                phone: `(${formData.phoneCountryCode})${phone.replace(/\s/g, "")}`,
                country_iso: formData.countryIso2,
                is_marketing_allowed: subscribeMarketing,
                is_term_agree: agreeTerms,
                password_strength_score: strengthScore,
                signup_timestamp: Date.now(),
            };

            try {
                console.log("signing up _-_-_-_-_-_\n", signupData)
                const user = await signupUser(signupData);

                // Create session data compatible with your authSessionSchema
                const sessionData = {
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
                };
                console.log("now try to make session ~~~~~~~~~\n", user)
                return await createAuthSession(sessionData);
            } catch (error) {
                console.log("error in create auth session@@@\n", error)
                if (error instanceof Error) {
                    if (error.message.includes("email already exists") ||
                        error.message.includes("Email already registered")) {
                        return json({
                            error: "An account with this email already exists"
                        }, { status: 409 });
                    }
                    if (error.message.includes("phone") ||
                        error.message.includes("Phone number already registered")) {
                        return json({
                            error: "This phone number is already registered"
                        }, { status: 409 });
                    }
                }
                throw error;
            }
        }

        else if (formData.action === "sign_in") {
            console.log("Secure login submission validated", {
                email: formData.email,
                timestamp: Date.now(),
                ip: clientIp,
                processingTime: Date.now() - startTime
            });

            try {
                const user = await loginUser(formData.email.toLowerCase(), formData.password);

                // Create session data compatible with your authSessionSchema
                const sessionData = {
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
                };

                return await createAuthSession(sessionData);
            } catch (error) {
                console.warn("Failed login attempt", {
                    email: formData.email,
                    ip: clientIp,
                    timestamp: Date.now(),
                    error: error instanceof Error ? error.message : "Unknown error"
                });

                return json({
                    error: "Invalid email or password. Please check your credentials and try again."
                }, { status: 401 });
            }
        }
        else {
            return json({ error: "Invalid action specified" }, { status: 400 });
        }

    } catch (error: unknown) {
        console.error("Authentication error:", error);

        if (error instanceof z.ZodError) {
            return json({
                error: "Validation failed: " + error.issues.map((i) => i.message).join(", ")
            }, { status: 400 });
        }

        if (error instanceof Error) {
            if (error.message.includes("password") ||
                error.message.includes("security") ||
                error.message.includes("validation")) {
                console.warn("Security validation failed:", {
                    error: error.message,
                    timestamp: Date.now(),
                    ip: clientIp,
                    userAgent: userAgent.slice(0, 100)
                });
            }

            if (process.env.NODE_ENV === "production") {
                return json({
                    error: "An error occurred during authentication. Please try again."
                }, { status: 500 });
            }

            return json({ error: error.message }, { status: 400 });
        }

        return json({
            error: "An unexpected error occurred. Please try again."
        }, { status: 500 });
    }
};

// Your existing AuthForm component remains the same - just import ityyy
export default function Auth() {
    const actionData = useActionData<{ error?: string; success?: string }>();
    console.log(actionData?.error)
    useEffect(() => {
        if (actionData?.error) {
            toast.error(actionData.error);
        } else if (actionData?.success) {
            toast.success(actionData.success);
        }
        console.log("toasting effect ran with:", actionData);
    }, [actionData])
    return (
         <section className="relative w-full h-screen bg-white flex items-center justify-center p-4">
            {/* New Animated Background */}
            <AnimatedCircles />
            
            {/* The AuthForm component now controls the main layout */}
            <div className="relative z-10">
                <AuthForm />
            </div>

            <ToastContainer position="bottom-right" />
        </section>
    );
}