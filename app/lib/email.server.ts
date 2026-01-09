import nodemailer from "nodemailer";

interface WelcomeEmailParams {
    email: string;
    firstName: string;
    password?: string; // Optional if you are just sending a magic link, but here we send creds
    role: string;
    loginUrl: string;
}

export async function sendWelcomeEmail({ email, firstName, password, role, loginUrl }: WelcomeEmailParams) {
    try {
        const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;

        if (!hasSmtp && !hasGmail) {
            console.warn("⚠️ [Email Service] Missing credentials. Skipping welcome email.");
            console.log(`📧 [Mock Welcome Email] To: ${email} | Password: ${password}`);
            return false;
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

        const fromAddress = process.env.SMTP_FROM || '"HRTek Systems" <noreply@hrteksystems.com>';

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                .header { background-color: #0f172a; color: white; padding: 30px; text-align: center; }
                .content { padding: 40px; color: #334155; }
                .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 20px; }
                .credentials-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
                .footer { background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to HRTek Systems</h1>
                </div>
                <div class="content">
                    <p>Hello <strong>${firstName}</strong>,</p>
                    <p>Your account has been successfully created by the administrator. You have been assigned the role of <strong>${role}</strong>.</p>
                    
                    <p>Here are your login credentials:</p>
                    
                    <div class="credentials-box">
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Password:</strong> ${password}</p>
                    </div>

                    <p>Please log in and change your password immediately.</p>
                    
                    <div style="text-align: center;">
                        <a href="${loginUrl}" class="button">Log In to Dashboard</a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; ${new Date().getFullYear()} HRTek Systems. All rights reserved.</p>
                    <p>If you did not expect this email, please contact your administrator.</p>
                </div>
            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"HRTek Systems" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
            to: email,
            subject: "Welcome to HRTek - Your Account Credentials",
            html: htmlContent
        });

        console.log(`✅ Welcome email sent to ${email}`);
        return true;

    } catch (error: any) {
        console.error("❌ Failed to send welcome email:", error);
        console.log(`📧 [Mock Welcome Email Fallback] To: ${email} | Password: ${password}`);
        return false;
    }
}

interface SupportEmailParams {
    name: string;
    email: string;
    phone?: string;
    company?: string;
    message: string;
}

export async function sendSupportMessageEmail({ name, email, phone, company, message }: SupportEmailParams) {
    try {
        const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;

        if (!hasSmtp && !hasGmail) {
            console.warn("⚠️ [Email Service] Missing credentials. Skipping support email.");
            console.log(`📧 [Mock Support Email] From: ${email} | Msg: ${message}`);
            return false;
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

        const supportEmail = process.env.SUPPORT_EMAIL || "support@hrteksystem.com";

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: sans-serif; padding: 20px; }
                .box { border: 1px solid #ccc; padding: 15px; border-radius: 5px; background: #f9f9f9; }
                .label { font-weight: bold; color: #555; }
            </style>
        </head>
        <body>
            <h2>New Contact Message</h2>
            <div class="box">
                <p><span class="label">Name:</span> ${name}</p>
                <p><span class="label">Email:</span> ${email}</p>
                <p><span class="label">Phone:</span> ${phone || 'N/A'}</p>
                <p><span class="label">Company:</span> ${company || 'N/A'}</p>
                <hr/>
                <p><span class="label">Message:</span></p>
                <p>${message.replace(/\n/g, '<br/>')}</p>
            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"${name}" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`, // Authenticated sender remains the system email
            replyTo: email,
            to: supportEmail,
            subject: `[Support Query] from ${name}`,
            html: htmlContent
        });

        console.log(`✅ Support email sent to ${supportEmail}`);
        return true;

    } catch (error: any) {
        console.error("❌ Failed to send support email:", error);
        return false;
    }
}
