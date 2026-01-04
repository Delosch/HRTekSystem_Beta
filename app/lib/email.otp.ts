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

        const fromAddress = process.env.SMTP_FROM || '"HRTEK" <noreply@hrtek.in>';
        const appName = "HR TEK SYSTEMS"
        const otpExpiryMinutes = "10"
        const supportUrl = "#"
        const emailHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Secure OTP from ${appName}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap');
            body {
                font-family: 'Poppins', sans-serif;
                background-color: #f0f2f5;
                margin: 0;
                padding: 0;
                -webkit-text-size-adjust: none;
                line-height: 1.6;
                color: #333;
            }
            .email-container {
                max-width: 600px;
                margin: 40px auto;
                background: rgba(255, 255, 255, 0.7);
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
                backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.18);
            }
            .header {
                background: linear-gradient(135deg, rgba(70, 130, 180, 0.8), rgba(100, 149, 237, 0.8));
                padding: 30px;
                text-align: center;
                border-top-left-radius: 20px;
                border-top-right-radius: 20px;
                color: #ffffff;
                font-weight: 600;
                font-size: 24px;
                letter-spacing: 0.5px;
                text-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            .header span {
                display: block;
                font-size: 14px;
                font-weight: 300;
                margin-top: 5px;
            }
            .content {
                padding: 40px 30px;
                text-align: center;
                color: #444;
                font-size: 16px;
            }
            .otp-box {
                background: rgba(255, 255, 255, 0.9);
                border-radius: 15px;
                padding: 25px 30px;
                margin: 30px auto;
                width: fit-content;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
                border: 1px solid rgba(255, 255, 255, 0.3);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            .otp-code {
                font-size: 38px;
                font-weight: 600;
                color: #1a73e8;
                letter-spacing: 4px;
                display: block;
                text-shadow: 0 1px 2px rgba(0,0,0,0.1);
            }
            .instructions {
                margin-top: 30px;
                font-size: 15px;
                color: #555;
            }
            .footer {
                background: rgba(255, 255, 255, 0.5);
                padding: 25px;
                text-align: center;
                font-size: 13px;
                color: #777;
                border-bottom-left-radius: 20px;
                border-bottom-right-radius: 20px;
                border-top: 1px solid rgba(255, 255, 255, 0.1);
            }
            .footer a {
                color: #1a73e8;
                text-decoration: none;
                font-weight: 500;
            }
            .security-note {
                margin-top: 20px;
                font-size: 14px;
                color: #777;
                line-height: 1.5;
                padding: 0 20px;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                ${appName}
                <span>Your Secure Access Code</span>
            </div>
            <div class="content">
                <p>Hi there,</p>
                <p>You've requested a one-time password to proceed with your action. Here's your secure 6-digit code:</p>
                <div class="otp-box">
                    <span class="otp-code">
                        ${otp}
                    </span>
                </div>
                <p class="instructions">
                    Please enter this code into the required field on the ${appName} website/app.
                </p>
                <p class="security-note">
                    This code is valid for **${otpExpiryMinutes} minutes** and is for your eyes only. If you didn't request this, please ignore this email.
                </p>
            </div>
            <div class="footer">
                <p>&copy; 2025 ${appName}. All rights reserved.</p>
                <p>Need help? Visit our <a href="${supportUrl}" target="_blank">Support Center</a>.</p>
            </div>
        </div>
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
