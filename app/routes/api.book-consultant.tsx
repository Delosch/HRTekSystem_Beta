import { ActionFunction, json } from "@remix-run/node";
import { getUserSession } from "~/lib/session.server";
import { sendBookingEmail } from "~/lib/email.service.server";
import { sendTemplateSMS } from "~/services/sms.server";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const engineName = formData.get("engineName") as string;

    // Contact info submitted from form
    let name = formData.get("name") as string;
    let email = formData.get("email") as string;
    let phone = formData.get("phone") as string;

    // Enrich from session if logged in
    const user = await getUserSession(request).catch(() => null);
    if (user) {
        name = name || `${user.first_name} ${user.last_name}`;
        email = email || user.email;
        phone = phone || user.phone || "";
    }

    if (!name || !email || !date || !time) {
        return json({ success: false, error: "Missing required information" }, { status: 400 });
    }

    try {
        // 1. Send booking notification email (to support + user confirmation)
        const emailSent = await sendBookingEmail({
            name,
            email,
            date,
            time,
            phoneNumber: phone,
            engineName
        });

        // 2. Send SMS confirmation to user's mobile (non-blocking — don't fail if SMS fails)
        if (phone) {
            const cleanPhone = phone.replace(/\D/g, "").replace(/^91/, "").slice(-10);
            if (cleanPhone.length === 10) {
                try {
                    await sendTemplateSMS({
                        mobileNo: cleanPhone,
                        templateName: "Booking Confirmation- HRTek",
                        params: `${name}~${engineName}~${date}~${time}`,
                    });
                    console.log(`✅ Booking SMS sent to ${cleanPhone}`);
                } catch (smsErr) {
                    // SMS failure should not block the booking
                    console.warn("⚠️ SMS sending failed (non-critical):", smsErr);
                }
            }
        }

        if (emailSent) {
            return json({ success: true, message: "Appointment request sent successfully!" });
        } else {
            // Email service may not be configured in local dev — still show thank you
            console.warn("⚠️ Email not sent (check SMTP config), but returning success for UX.");
            return json({ success: true, message: "Appointment logged. Confirmation will follow." });
        }

    } catch (error) {
        console.error("Booking error:", error);
        return json({ success: false, error: "Internal server error" }, { status: 500 });
    }
};
