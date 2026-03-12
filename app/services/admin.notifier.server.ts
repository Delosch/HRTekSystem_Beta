import nodemailer from "nodemailer";

const ADMIN_EMAIL = "atul.dixit@hrteksystems.in";

export async function notifyAdmin(subject: string, message: string) {
    try {
        const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;

        if (!hasSmtp && !hasGmail) {
            console.warn("Missing email credentials for admin notification. Logging to console.");
            console.log(`📢 [Admin Notification] Subject: ${subject} | Message: ${message}`);
            return;
        }

        let transporter;
        if (hasSmtp) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GOOGLE_APP_PASSWORD,
                },
            });
        }

        const fromAddress = process.env.SMTP_FROM || `"HRTEK SYSTEM" <${process.env.SMTP_USER || 'noreply@www.hrteksystem.com'}>`;

        await transporter.sendMail({
            from: fromAddress,
            to: ADMIN_EMAIL,
            subject: `[ADMIN ALERT] ${subject}`,
            text: message,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="color: #1e40af; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">${subject}</h2>
                    <p style="font-size: 16px; line-height: 1.6;">${message}</p>
                    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
                    <p style="font-size: 12px; color: #6b7280;">This is an automated system alert from HR-Tek Systems Dashboard.</p>
                </div>
            `,
        });

        console.log(`✅ Admin notification sent: ${subject}`);
    } catch (error) {
        console.error("❌ Failed to send admin notification:", error);
    }
}
