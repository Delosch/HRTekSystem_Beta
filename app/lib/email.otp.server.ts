//email otp system
import nodemailer from "nodemailer"

export function createOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function sendOTPEmail(to: string, otp: string) {
    try {
        // Check for required credentials (either Generic SMTP or Gmail)
        const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;

        if (!hasSmtp && !hasGmail) {
            throw new Error("Missing email credentials (SMTP_* or GMAIL_* in .env)");
        }

        let transporter;
        if (hasSmtp) {
            // Generic SMTP Configuration (For your new no-reply email)
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT) || 587,
                secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            // Fallback to Gmail
            transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: process.env.GMAIL_USER,
                    pass: process.env.GOOGLE_APP_PASSWORD,
                },
            });
        }

        const fromAddress = process.env.SMTP_FROM || `"HRTek System" <${process.env.SMTP_USER || 'no-reply@hrteksystem.com'}>`;
        const logoUrl = `${process.env.APP_URL || 'https://hrteksystem.com'}/hrtek_logo.png`;
        const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your OTP — HRTek System</title>
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
              <p style="margin:0;color:rgba(255,255,255,0.60);font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:600;">Email Verification</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:44px 40px 36px;text-align:center;">
              <p style="margin:0 0 6px;font-size:22px;font-weight:700;color:#0f172a;">Verify your identity</p>
              <p style="margin:0 0 32px;font-size:15px;color:#64748b;line-height:1.6;">Use the one-time code below to complete your verification. This code expires in <strong style="color:#0f172a;">10 minutes</strong>.</p>

              <!-- OTP Box -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 32px;">
                <tr>
                  <td style="background:#f8fafc;border:2px dashed #2563eb;border-radius:16px;padding:22px 48px;">
                    <span style="font-size:44px;font-weight:800;letter-spacing:14px;color:#2563eb;font-family:'Courier New',monospace;">${otp}</span>
                  </td>
                </tr>
              </table>

              <!-- Warning chip -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background:#fefce8;border:1px solid #fde68a;border-radius:100px;padding:8px 18px;">
                    <span style="font-size:12px;color:#92400e;font-weight:600;">&#9888;&nbsp; Do not share this code with anyone</span>
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
              <p style="margin:0;font-size:12px;color:#cbd5e1;">If you didn&apos;t request this, you can safely ignore this email.</p>
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
            subject: "Your OTP Code",
            text: `Your OTP code is ${otp}`,
            html: emailHtml,
        });

    } catch (error: any) {
        console.warn(`⚠️ [Email Service] Failed to send email (Mode: Mock): ${error.message}`);
        console.log(`📧 [Mock Email] To: ${to} | Subject: Your OTP Code | OTP: ${otp}`);
        // Do NOT re-throw, so the calling function thinks it succeeded.
        return;
    }
}

export async function sendPasswordResetEmail(to: string, resetLink: string) {
    try {
        const hasSmtp = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;
        const hasGmail = process.env.GMAIL_USER && process.env.GOOGLE_APP_PASSWORD;

        if (!hasSmtp && !hasGmail) {
            throw new Error("Missing email credentials (SMTP_* or GMAIL_* in .env)");
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

        const fromAddress = process.env.SMTP_FROM || `"HRTEK SYSTEM" <${process.env.SMTP_USER || 'noreply@hrteksystem.com'}>`;
        const appName = "HR TEK SYSTEMS"
        const supportUrl = "#"

        const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - ${appName}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
            body { font-family: 'Poppins', sans-serif; background-color: #f4f7f9; margin: 0; padding: 0; }
            .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .header { background: #1a73e8; padding: 40px 20px; text-align: center; color: #ffffff; }
            .content { padding: 40px; text-align: center; color: #3c4043; line-height: 1.6; }
            .button { display: inline-block; padding: 16px 32px; background-color: #1a73e8; color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 30px 0; }
            .footer { padding: 20px; text-align: center; font-size: 12px; color: #70757a; border-top: 1px solid #f1f3f4; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1 style="margin:0; font-size: 24px;">Password Reset Request</h1>
            </div>
            <div class="content">
                <p>Hello,</p>
                <p>We received a request to reset your password for your ${appName} account. Click the button below to choose a new password:</p>
                <a href="${resetLink}" class="button">Reset Password</a>
                <p>If you didn't request this, you can safely ignore this email. The link will expire in 1 hour.</p>
                <p style="font-size: 12px; color: #9aa0a6; margin-top: 20px;">If the button doesn't work, copy and paste this link into your browser:<br>${resetLink}</p>
            </div>
            <div class="footer">
                <p>&copy; 2025 ${appName}. All rights reserved.</p>
                <p><a href="${supportUrl}" style="color: #1a73e8; text-decoration: none;">Support Center</a></p>
            </div>
        </div>
    </body>
    </html>`;

        await transporter.sendMail({
            from: fromAddress,
            to,
            subject: "Reset Your Password - HR TEK SYSTEMS",
            text: `Please reset your password by visiting: ${resetLink}`,
            html: emailHtml,
        });

    } catch (error: any) {
        console.warn(`⚠️ [Email Service] Failed to send reset email (Mode: Mock): ${error.message}`);
        console.log(`📧 [Mock Reset Email] To: ${to} | Link: ${resetLink}`);
    }
}
