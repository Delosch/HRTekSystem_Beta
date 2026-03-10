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
            from: process.env.SMTP_FROM || `"HRTek Systems" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
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
    queryType?: string;
    priority?: string;
}

export async function sendSupportMessageEmail({ name, email, phone, company, message, queryType, priority }: SupportEmailParams) {
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
                .priority-high { color: red; font-weight: bold; }
                .priority-medium { color: orange; font-weight: bold; }
            </style>
        </head>
        <body>
            <h2>New Contact Message</h2>
            <div class="box">
                <p><span class="label">Priority:</span> <span class="${priority === 'High' ? 'priority-high' : priority === 'Medium' ? 'priority-medium' : ''}">${priority || 'Normal'}</span></p>
                <p><span class="label">Query Type:</span> ${queryType || 'General'}</p>
                <hr/>
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
            from: `"${name}" <${email}>`, // Use user's email as the sender
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
export async function sendBookingEmail({ name, email, date, time, phoneNumber, engineName }: { name: string, email: string, date: string, time: string, phoneNumber?: string, engineName?: string }) {
    try {
        const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;

        if (!hasSmtp && !hasGmail) {
            console.warn("⚠️ [Email Service] Missing credentials. Skipping booking email.");
            console.log(`📧 [Mock Booking Email] For: ${email} | Date: ${date} | Time: ${time}`);
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
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 20px; }
                .card { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
                .header { background: #0f172a; color: white; padding: 32px; text-align: center; }
                .content { padding: 40px; }
                .item { margin-bottom: 20px; }
                .label { font-size: 14px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 4px; }
                .value { font-size: 18px; color: #0f172a; font-weight: 500; }
                .footer { text-align: center; padding: 24px; font-size: 14px; color: #94a3b8; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h2 style="margin: 0;">New Consultation Booking</h2>
                </div>
                <div class="content">
                    <div class="item">
                        <div class="label">Client Name</div>
                        <div class="value">${name}</div>
                    </div>
                    <div class="item">
                        <div class="label">Email Address</div>
                        <div class="value">${email}</div>
                    </div>
                    <div class="item">
                        <div class="label">Phone Number</div>
                        <div class="value">${phoneNumber || 'Not provided'}</div>
                    </div>
                    <div class="item">
                        <div class="label">Interested In</div>
                        <div class="value">${engineName || 'General Consultation'}</div>
                    </div>
                    <div style="background: #f1f5f9; padding: 24px; border-radius: 8px; margin-top: 32px;">
                        <h3 style="margin: 0 0 16px 0; color: #0f172a; font-size: 16px;">Appointment Details</h3>
                        <div style="display: flex; gap: 40px;">
                            <div>
                                <div class="label">Date</div>
                                <div class="value">${date}</div>
                            </div>
                            <div>
                                <div class="label">Time</div>
                                <div class="value">${time}</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="footer">
                    Sent via HRTek System - Automatic Booking Notification
                </div>
            </div>
        </body>
        </html>
        `;

        // 1. Notify support team
        await transporter.sendMail({
            from: `"HRTek Bookings" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
            to: supportEmail,
            subject: `[Booking] ${name} - ${engineName || "Consultation"} - ${date} at ${time}`,
            html: htmlContent
        });

        // 2. Send user a confirmation email
        const userConfirmHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 20px; }
                .card { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
                .header { background: linear-gradient(135deg, #001845, #0077b6); color: white; padding: 32px; text-align: center; }
                .content { padding: 40px; }
                .info-box { background: #f1f5f9; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px; margin: 20px 0; }
                .label { font-size: 11px; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
                .value { font-size: 16px; color: #0f172a; font-weight: 600; margin-top: 4px; }
                .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h2 style="margin:0; font-size:24px; font-weight:800;">Booking Confirmed ✓</h2>
                    <p style="margin:8px 0 0; opacity:0.8;">Your expert consultation is scheduled</p>
                </div>
                <div class="content">
                    <p style="color:#475569;">Hello <strong>${name}</strong>,</p>
                    <p style="color:#475569;">Thank you for booking a consultation with HRTek System. Here are your appointment details:</p>
                    <div class="info-box">
                        <div style="margin-bottom:16px"><div class="label">Engine / Service</div><div class="value">${engineName || "Expert Consultation"}</div></div>
                        <div style="display:flex; gap:40px;">
                            <div><div class="label">Date</div><div class="value">${date}</div></div>
                            <div><div class="label">Time</div><div class="value">${time}</div></div>
                        </div>
                    </div>
                    <p style="color:#64748b; font-size:14px;">Our team will reach out to you at <strong>${email}</strong>${phoneNumber ? ` or <strong>${phoneNumber}</strong>` : ""} within 48 hours to confirm the session.</p>
                </div>
                <div class="footer">© ${new Date().getFullYear()} HRTek System — A Brand of Delosch Technologies Pvt Ltd</div>
            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"HRTek System" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
            to: email,
            subject: `Booking Confirmed: ${engineName || "Consultation"} on ${date} at ${time}`,
            html: userConfirmHtml
        });

        console.log(`✅ Booking emails sent — support: ${supportEmail} | user: ${email}`);
        return true;

    } catch (error: any) {
        console.error("❌ Failed to send booking email:", error);
        return false;
    }
}

export async function sendTaskAssignedEmail({ name, email, task, position, id }: { name: string, email: string, task: string, position: string, id: string }) {
    try {
        const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;

        if (!hasSmtp && !hasGmail) {
            console.warn("⚠️ [Email Service] Missing credentials. Skipping task assignment email.");
            console.log(`📧 [Mock Task Email] To: ${email} | Task: ${task}`);
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

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: 'Inter', sans-serif; background-color: #f1f5f9; padding: 40px 20px; }
                .card { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
                .header { background: #059669; color: white; padding: 40px 32px; text-align: center; }
                .content { padding: 32px; }
                .task-box { background: #f8fafc; border-left: 4px solid #059669; padding: 20px; border-radius: 8px; margin: 24px 0; }
                .label { font-size: 11px; color: #64748b; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .value { font-size: 16px; color: #0f172a; font-weight: 600; }
                .footer { text-align: center; padding: 24px; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="header">
                    <h2 style="margin: 0; font-size: 24px; font-weight: 800;">New Task Assigned</h2>
                </div>
                <div class="content">
                    <p style="margin: 0 0 24px 0; color: #475569; font-size: 15px;">Hello <strong>${name}</strong>,</p>
                    <p style="margin: 0; color: #475569; font-size: 15px;">A new task has been assigned to your profile in the HRTek System.</p>
                    
                    <div class="task-box">
                        <div style="margin-bottom: 16px;">
                            <div class="label">Task Title</div>
                            <div class="value">${task}</div>
                        </div>
                        <div style="display: grid; grid-template-cols: 1fr 1fr; gap: 20px;">
                            <div>
                                <div class="label">Position</div>
                                <div class="value">${position}</div>
                            </div>
                            <div>
                                <div class="label">User ID</div>
                                <div class="value">${id}</div>
                            </div>
                        </div>
                    </div>

                    <p style="margin: 0; color: #64748b; font-size: 13px; line-height: 1.6;">Please log in to your dashboard to view the full details and start working on this assignment.</p>
                </div>
                <div class="footer">
                    &copy; ${new Date().getFullYear()} HRTek System - Role Management Module
                </div>
            </div>
        </body>
        </html>
        `;

        await transporter.sendMail({
            from: `"HRTek Role Mgmt" <${process.env.SMTP_USER || process.env.GMAIL_USER}>`,
            to: email,
            subject: `New Task Assignment: ${task}`,
            html: htmlContent
        });

        console.log(`✅ Task assignment email sent to ${email}`);
        return true;

    } catch (error: any) {
        console.error("❌ Failed to send task assignment email:", error);
        return false;
    }
}
