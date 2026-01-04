import { ActionFunction, json, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "~/components/Footer";
import { sendSupportMessageEmail } from "~/lib/email.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { ToastContainer, toast } from "react-toastify";

export const meta: MetaFunction = () => {
    return [{ title: "Contact Us - HRTek System" }];
};

export const action: ActionFunction = async ({ request }) => {
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const company = formData.get("company") as string;
    const message = formData.get("message") as string;

    if (!firstName || !email || !message) {
        return json({ error: "Please fill in all required fields" }, { status: 400 });
    }

    try {
        const ddb = getDynamoDBDocumentClient();
        const msgId = randomUUID();
        const timestamp = new Date().toISOString();

        // Save to DynamoDB
        await ddb.send(new PutCommand({
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: {
                pk: `CONTACT#${msgId}`, // Unique ID
                sk: "MESSAGE",
                profile_type: "CONTACT_MSG",
                firstName,
                lastName,
                email,
                phone,
                company,
                message,
                createdAt: timestamp,
                status: "unread"
            }
        }));

        // Send Email to Support
        await sendSupportMessageEmail({
            name: `${firstName} ${lastName}`,
            email,
            phone,
            company,
            message
        });

        return json({ success: true });
    } catch (error) {
        console.error("Contact Form Error:", error);
        return json({ error: "Failed to send message. Please try again later." }, { status: 500 });
    }
};

export default function ContactUs() {
    const actionData = useActionData<{ error?: string; success?: boolean }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (actionData?.success) {
            toast.success("Message sent successfully! We'll allow 24-48 hours for a response.");
            formRef.current?.reset();
        } else if (actionData?.error) {
            toast.error(actionData.error);
        }
    }, [actionData]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow pt-20">
                {/* Hero Section */}
                <div className="bg-[#0B2A57] text-white py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Have questions about our HR solutions? We're here to help you transform your organization.
                        </p>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 pb-20">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Contact Info Cards */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Info Card */}
                            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h3>
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Email</p>
                                                <a href="mailto:support@hrteksystem.com" className="text-blue-600 hover:underline">support@hrteksystem.com</a>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-green-50 rounded-lg text-green-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Phone</p>
                                                <p className="text-gray-600">+91 9335870619</p>
                                                <p className="text-gray-600">0522-3195292</p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
                                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">Office</p>
                                                <p className="text-gray-600">Lucknow, Uttar Pradesh, India</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* LinkedIn Only */}
                                <div className="pt-6 border-t border-gray-100">
                                    <h4 className="font-semibold text-gray-900 mb-3">Connect with us</h4>
                                    <a
                                        href="https://in.linkedin.com/company/hr-tek-system"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 text-[#0077b5] hover:text-[#005582] transition-colors"
                                    >
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                                        <span className="font-medium">Follow us on LinkedIn</span>
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-xl p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h2>
                                <Form method="post" ref={formRef} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                                            <input type="text" name="firstName" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="John" />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                                            <input type="text" name="lastName" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Doe" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                            <input type="email" name="email" required className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="john@example.com" />
                                        </div>
                                        <div>
                                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <input type="tel" name="phone" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="+91 98765 43210" />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                                        <input type="text" name="company" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all" placeholder="Your Company Ltd." />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                                        <textarea name="message" required rows={5} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 text-white font-bold py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300"
                                    >
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </button>
                                </Form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
            <ToastContainer position="bottom-right" />
        </div>
    );
}
