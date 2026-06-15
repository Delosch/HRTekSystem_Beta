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

    const fromAddress = process.env.SMTP_FROM || '"HRTek System" <no-reply@hrteksystem.com>';
    const logoUrl = `${process.env.APP_URL || 'https://staging.hrteksystem.com'}/hrtek_logo.png`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to HRTek System</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(15,23,42,0.10);border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1d4ed8 100%);padding:36px 40px;text-align:center;">
              <img src="${logoUrl}" alt="HRTek System" height="40" style="height:40px;object-fit:contain;display:block;margin:0 auto 14px;" />
              <p style="margin:0;color:rgba(255,255,255,0.60);font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Account Created</p>
            </td>
          </tr>

          <!-- Welcome Banner -->
          <tr>
            <td style="background:#f0f7ff;border-bottom:1px solid #dbeafe;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:20px;font-weight:800;color:#1e3a8a;">Welcome, ${firstName}! &#127881;</p>
              <p style="margin:4px 0 0;font-size:14px;color:#3b82f6;">Your HRTek System account is ready.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.6;">
                Hello <strong style="color:#0f172a;">${firstName}</strong>, your account has been created by the administrator with the role of <strong style="color:#2563eb;">${role}</strong>.
              </p>

              <!-- Credentials Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:12px;margin:24px 0;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#94a3b8;font-weight:700;letter-spacing:1px;text-transform:uppercase;">Your Login Credentials</p>
                    <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:14px;">
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;font-weight:600;width:80px;">Email</td>
                        <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:700;">${email}</td>
                      </tr>
                      <tr>
                        <td style="padding:6px 0;font-size:13px;color:#64748b;font-weight:600;">Password</td>
                        <td style="padding:6px 0;font-size:14px;color:#0f172a;font-weight:700;font-family:'Courier New',monospace;">${password}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;font-size:14px;color:#ef4444;font-weight:600;">&#9888;&nbsp; Please log in and change your password immediately.</p>

              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="text-align:center;">
                    <a href="${loginUrl}" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.3px;">Log In to Dashboard &rarr;</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" /></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background:#f8fafc;">
              <p style="margin:0 0 4px;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} HRTek System &mdash; A Product of Delosch Technologies Pvt. Ltd.</p>
              <p style="margin:0;font-size:12px;color:#cbd5e1;">If you did not expect this email, please contact your administrator.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: fromAddress,
      to: email,
      subject: "Welcome to HRTek System — Your Account Is Ready",
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

export async function sendRegistrationThankYouEmail({ to, firstName }: { to: string; firstName: string }) {
  try {
    const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
    const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;

    if (!hasSmtp && !hasGmail) {
      console.log(`📧 [Mock Thank You Email] To: ${to}`);
      return false;
    }

    let transporter;
    if (hasSmtp) {
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
      });
    } else {
      transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: { user: process.env.GMAIL_USER, pass: process.env.GOOGLE_APP_PASSWORD },
      });
    }

    const fromAddress = process.env.SMTP_FROM || '"HRTek System" <no-reply@hrteksystem.com>';
    const logoUrl = `${process.env.APP_URL || 'https://staging.hrteksystem.com'}/hrtek_logo.png`;
    const appUrl = process.env.APP_URL || 'https://staging.hrteksystem.com';

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to HR-Tek System</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 32px rgba(15,23,42,0.10);border:1px solid #e2e8f0;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 60%,#1d4ed8 100%);padding:36px 40px;text-align:center;">
              <img src="${logoUrl}" alt="HR-Tek System" height="40" style="height:40px;object-fit:contain;display:block;margin:0 auto 14px;" />
              <p style="margin:0;color:rgba(255,255,255,0.60);font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Registration Confirmation</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 20px;font-size:16px;color:#334155;line-height:1.7;">Dear <strong style="color:#0f172a;">${firstName}</strong>,</p>

              <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.8;">
                Welcome to <strong style="color:#0f172a;">HR-Tek System</strong> — a next-generation HR transformation platform that is incubated at <strong style="color:#1d4ed8;">AIC IIT Delhi</strong>.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.8;">
                Thank you for registering with us and showing interest in our platform. We truly appreciate the opportunity to connect with you.
              </p>

              <p style="margin:0 0 16px;font-size:15px;color:#475569;line-height:1.8;">
                Our business team is currently reviewing your profile and will reach out to you within the next <strong style="color:#0f172a;">1–2 business days</strong> to better understand your requirements and provide tailored guidance.
              </p>

              <p style="margin:0 0 32px;font-size:15px;color:#475569;line-height:1.8;">
                At <strong style="color:#0f172a;">HR-Tek System</strong>, we are committed to partnering with you in building a future-ready HR ecosystem through a world-class HR transformation platform.
              </p>

              <!-- Info box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f7ff;border:1px solid #dbeafe;border-left:4px solid #2563eb;border-radius:12px;margin-bottom:32px;">
                <tr>
                  <td style="padding:18px 24px;">
                    <p style="margin:0 0 6px;font-size:12px;color:#3b82f6;font-weight:700;letter-spacing:1px;text-transform:uppercase;">In the meantime</p>
                    <p style="margin:0;font-size:14px;color:#1e3a8a;line-height:1.6;">You are welcome to explore the platform or share any specific requirements with us. Should you need any immediate assistance, please feel free to reach out via the contact link below.</p>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px;font-size:15px;color:#475569;line-height:1.8;">
                Thank you once again for choosing <strong style="color:#0f172a;">HR-Tek System</strong>.
              </p>

              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding-right:12px;">
                    <a href="${appUrl}/contact" style="display:inline-block;background:linear-gradient(135deg,#1d4ed8,#2563eb);color:#ffffff;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;font-size:13px;">Contact Us &rarr;</a>
                  </td>
                  <td>
                    <a href="${appUrl}" style="display:inline-block;background:#f8fafc;border:1px solid #e2e8f0;color:#475569;text-decoration:none;padding:13px 28px;border-radius:10px;font-weight:700;font-size:13px;">Explore Platform</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" /></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;text-align:center;background:#f8fafc;">
              <p style="margin:0 0 6px;font-size:12px;color:#94a3b8;">&copy; ${new Date().getFullYear()} <strong style="color:#64748b;">HR-Tek System</strong> &mdash; A Product of Delosch Technologies Pvt. Ltd.</p>
              <p style="margin:0 0 6px;font-size:11px;color:#cbd5e1;">Incubated at <strong style="color:#94a3b8;">AIC IIT Delhi</strong> &bull; Lucknow, Uttar Pradesh, India</p>
              <p style="margin:8px 0 0;font-size:11px;color:#cbd5e1;">
                <a href="${appUrl}/terms" style="color:#93c5fd;text-decoration:none;font-weight:600;">Terms &amp; Conditions</a>
                &nbsp;&bull;&nbsp;
                <a href="${appUrl}/privacy" style="color:#93c5fd;text-decoration:none;font-weight:600;">Privacy Policy</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    await transporter.sendMail({
      from: fromAddress,
      to,
      subject: "Welcome to HR-Tek System — Thank You for Registering",
      html: htmlContent,
    });

    console.log(`✅ Registration thank-you email sent to ${to}`);
    return true;

  } catch (error: any) {
    console.error("❌ Failed to send registration thank-you email:", error);
    return false;
  }
}
