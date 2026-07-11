import { ActionFunction, json } from "@remix-run/node";
import { requireUserSession } from "~/lib/session.server";
import { generateOTP, storeOTP, verifyOTP } from "~/services/payment-otp.server";
import { sendLoginOTP } from "~/services/sms.server";

export const action: ActionFunction = async ({ request }) => {
    const user = await requireUserSession(request);
    if (!user) return json({ error: "Unauthorized" }, { status: 401 });

    let body: any;
    try {
        body = await request.json();
    } catch (err) {
        console.error("Invalid OTP request body:", err);
        return json({ error: "Invalid request format" }, { status: 400 });
    }

    const { intent, phone, otp: otpInput, engineNames, totalAmount } = body;

    if (intent === "send_otp") {
        if (!phone || !/^\d{10}$/.test(phone.replace(/\D/g, ""))) {
            return json({ error: "Invalid phone number" }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, "").slice(-10);
        const otp = generateOTP();
        storeOTP(cleanPhone, otp);

        const smsResult = await sendLoginOTP(cleanPhone, otp);

        if (!smsResult.success) {
            // OTP is still stored — log and continue so dev can test
            console.warn(`[Payment OTP] SMS delivery failed for ${cleanPhone}. OTP: ${otp}. Error: ${smsResult.error}`);
        } else {
            console.log(`[Payment OTP] OTP sent to ${cleanPhone} for: ${engineNames}, Total: ₹${totalAmount}`);
        }

        return json({ success: true });
    }

    if (intent === "verify_otp") {
        if (!phone || !otpInput) {
            return json({ error: "Phone and OTP are required" }, { status: 400 });
        }

        const cleanPhone = phone.replace(/\D/g, "").slice(-10);
        const isValid = verifyOTP(cleanPhone, otpInput);

        if (!isValid) {
            return json({ success: false, error: "Invalid or expired OTP. Please try again." }, { status: 400 });
        }

        return json({ success: true });
    }

    return json({ error: "Invalid intent" }, { status: 400 });
};
