import { ActionFunction, json } from "@remix-run/node";
import { getUserSession } from "~/lib/session.server";
import { sendBookingEmail } from "~/lib/email.service.server";

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const engineName = formData.get("engineName") as string;

    // Optional contact info if not logged in
    let name = formData.get("name") as string;
    let email = formData.get("email") as string;
    let phone = formData.get("phone") as string;

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
        const success = await sendBookingEmail({
            name,
            email,
            date,
            time,
            phoneNumber: phone,
            engineName
        });

        if (success) {
            return json({ success: true, message: "Appointment request sent successfully!" });
        } else {
            return json({ success: false, error: "Failed to send email. Please try again later." }, { status: 500 });
        }
    } catch (error) {
        console.error("Booking error:", error);
        return json({ success: false, error: "Internal server error" }, { status: 500 });
    }
};
