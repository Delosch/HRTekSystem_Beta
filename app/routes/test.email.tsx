import { json, LoaderFunction } from "@remix-run/node";

export const loader: LoaderFunction = async () => {
    const nodemailer = await import("nodemailer");
    // 1. Read config directly to debug what is actually loaded
    const config = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS ? "****" : "MISSING", // Mask password
        secure: process.env.SMTP_SECURE
    };

    console.log("📧 Testing Email Configuration:", config);

    try {
        // 2. Setup Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true', // true for 465
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 3. Verify connection configuration
        await transporter.verify();
        console.log("✅ SMTP Connection Verified");

        // 4. Send Test Email
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'test@example.com',
            to: process.env.SMTP_USER, // Send to yourself
            subject: "HRTek Email Test Success!",
            text: "If you are reading this, your email configuration is working correctly!",
            html: "<h1>It Works!</h1><p>Your HRTek email system is correctly configured.</p>"
        });

        return json({
            success: true,
            message: "Email sent successfully!",
            messageId: info.messageId,
            config: config // echoing safe config back
        });

    } catch (error: any) {
        console.error("❌ Email Test Failed:", error);
        return json({
            success: false,
            message: "Email Test Failed",
            error: error.message,
            stack: error.stack,
            config: config
        }, { status: 500 });
    }
};

import { useLoaderData } from "@remix-run/react";

// ... (loader stays the same)

export default function TestEmail() {
    const data = useLoaderData<any>();

    return (
        <div className="p-10 font-sans max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Email System Test Result</h1>

            <div className={`p-6 rounded-lg border ${data.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <h2 className={`text-xl font-semibold mb-2 ${data.success ? 'text-green-800' : 'text-red-800'}`}>
                    {data.success ? '✅ Success!' : '❌ Failed'}
                </h2>

                <p className="mb-4">{data.message}</p>

                {data.error && (
                    <div className="bg-white p-4 rounded border border-gray-300 overflow-auto">
                        <p className="font-bold text-red-600">Error Details:</p>
                        <pre className="text-sm mt-2">{data.error}</pre>
                    </div>
                )}

                <div className="mt-6">
                    <p className="font-bold text-gray-700">Configuration Used:</p>
                    <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
                        {JSON.stringify(data.config, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
