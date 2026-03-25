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
const SMS_TEMPLATE_NAME = process.env.SMS_TEMPLATE_NAME || "Login ID- Delosch";

export async function sendLoginOTP(mobileNo: string, otp: string) {
    try {
        // 1. Prepare and clean the mobile number
        // Strip any non-digits
        let cleanMobile = mobileNo.replace(/\D/g, "");

        // If it starts with 91 and is 12 digits, strip the 91 (for domestic Indian SMS)
        if (cleanMobile.length === 12 && cleanMobile.startsWith("91")) {
            cleanMobile = cleanMobile.substring(2);
        }

        // If it's less than 10 digits, it's definitely wrong
        if (cleanMobile.length < 10) {
            console.error("❌ Invalid mobile number length:", cleanMobile);
            return { success: false, error: "Invalid mobile number" };
        }

        const payload = {
            sender: SMS_SENDER_ID,
            templateName: SMS_TEMPLATE_NAME,
            smsReciever: [
                {
                    mobileNo: cleanMobile,
                    templateParams: otp,
                },
            ],
        };

        console.log(`📨 API Request: POST ${SMS_API_URL}`);
        console.log(`📨 Recipient: ${cleanMobile}, OTP: ${otp}`);

        // 2. Make the API Request
        const response = await fetch(SMS_API_URL, {
            method: "POST",
            headers: {
                "apikey": SMS_API_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        let data: any;
        const responseText = await response.text();
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error("❌ SMS API returned non-JSON response:", responseText);
            return { success: false, error: "Invalid API response format" };
        }

        // 3. Log and Return Result
        // Be more permissive with success checks as different APIs/versions might return different formats
        const isSuccess =
            response.ok &&
            (data.status === "success" ||
                data.isSuccess === true ||
                data.isSuccess === "true" ||
                data.ResponseStatus === "Success" ||
                data.status === "1");

        if (isSuccess) {
            console.log("✅ SMS Sent Successfully to:", cleanMobile);
            return { success: true, data };
        } else {
            console.error("❌ SMS Failed for:", cleanMobile);
            console.error("❌ API Response:", data || responseText);
            return {
                success: false,
                error: data.message || data.returnMessage || data.reason || "Provider error",
                data
            };
        }
    } catch (error) {
        console.error("❌ SMS API Error (Exception):", error);
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
