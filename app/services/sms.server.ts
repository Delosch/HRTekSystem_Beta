import { json } from "@remix-run/node";

interface SendSMSParams {
    mobileNo: string;
    templateParams: string; // e.g., "1234" or "1234~User"
}

// Configuration from Environment Variables
const SMS_API_URL = "https://api.bulksmsadmin.com/BulkSMSapi/keyApiSendSMS/SendSmsTemplateName";
// Fallback to the values you provided if env vars aren't set yet
const SMS_API_KEY = process.env.SMS_API_KEY || "JHs9zb2GhUMtOCb";
const SMS_SENDER_ID = process.env.SMS_SENDER_ID || "DELOSC";
const SMS_TEMPLATE_NAME = process.env.SMS_TEMPLATE_NAME || "Login ID- HR-Tek System";

/**
 * Sends a Login OTP SMS using the configured template
 * @param mobileNo - The recipient's mobile number (without +91 if strictly Indian, but API docs say no country code needed if 10 digits, usually safer to strip +91 if present)
 * @param otp - The dynamic value to send (e.g., the OTP code)
 */
export async function sendLoginOTP(mobileNo: string, otp: string) {
    try {
        // 1. Prepare the payload based on documentation
        const payload = {
            sender: SMS_SENDER_ID,
            templateName: SMS_TEMPLATE_NAME,
            smsReciever: [
                {
                    mobileNo: mobileNo,
                    templateParams: otp, // The "22" in your example
                },
            ],
        };

        console.log("📨 Sending SMS via PRP API...", JSON.stringify(payload, null, 2));

        // 2. Make the API Request
        const response = await fetch(SMS_API_URL, {
            method: "POST",
            headers: {
                "apikey": SMS_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        // 3. Log and Return Result
        // API returns isSuccess: true on success
        if (response.ok && (data.status === "success" || data.isSuccess === true)) {
            console.log("✅ SMS Sent Successfully:", data);
            return { success: true, data };
        } else {
            console.error("❌ SMS Failed:", data);
            return { success: false, error: data.message || data.returnMessage || "Unknown error", data };
        }
    } catch (error) {
        console.error("❌ SMS API Error:", error);
        return { success: false, error: "Network or Server Error" };
    }
}

/**
 * Generic function to send any template message
 */
export async function sendTemplateSMS({
    mobileNo,
    templateName,
    params,
}: {
    mobileNo: string;
    templateName: string;
    params: string;
}) {
    try {
        const payload = {
            sender: SMS_SENDER_ID,
            templateName: templateName,
            smsReciever: [
                {
                    mobileNo: mobileNo,
                    templateParams: params,
                },
            ],
        };

        const response = await fetch(SMS_API_URL, {
            method: "POST",
            headers: {
                "apikey": SMS_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        return await response.json();
    } catch (error) {
        console.error("SMS Error:", error);
        throw error;
    }
}
