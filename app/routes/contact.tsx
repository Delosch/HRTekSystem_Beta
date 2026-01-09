import { ActionFunction, json, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    Phone,
    MapPin,
    Linkedin,
    Send,
    CheckCircle2,
    ArrowRight,
    MessageSquare,
    Globe,
    Clock
} from "lucide-react";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "~/components/Footer";
import { sendSupportMessageEmail } from "~/lib/email.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "crypto";
import { ToastContainer, toast } from "react-toastify";

export const meta: MetaFunction = () => {
    return [{ title: "Contact Us | HRTek System - Transform Your HR" }];
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
                pk: `CONTACT#${msgId}`,
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
            toast.success("Message sent successfully! We'll get back to you shortly.");
            formRef.current?.reset();
        } else if (actionData?.error) {
            toast.error(actionData.error);
        }
    }, [actionData]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
            <Navbar />

            <main className="flex-grow pt-20">
                {/* Premium Hero Section */}
                <div className="relative bg-[#000033] py-24 px-4 overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[128px] -translate-x-1/2 -translate-y-1/2"></div>
                        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-[128px] translate-x-1/2 translate-y-1/2"></div>
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center"
                        >
                            <span className="inline-block px-4 py-1.5 bg-blue-500/10 border border-blue-400/20 rounded-full text-blue-400 text-sm font-bold tracking-widest uppercase mb-6">
                                Connect With Excellence
                            </span>
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-8 tracking-tighter leading-none">
                                Let's Build the Future <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                    of Your Workforce.
                                </span>
                            </h1>
                            <p className="text-xl text-blue-100/70 max-w-2xl mx-auto font-medium leading-relaxed">
                                Our cognitive AI solutions and strategic advisory teams are standing by to help you redefine what's possible in HR.
                            </p>
                        </motion.div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 pb-24 relative z-20">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                        {/* Side Information Panel */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="lg:col-span-4 space-y-8"
                        >
                            <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 p-10 border border-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 group-hover:bg-blue-100 transition-colors duration-500"></div>

                                <h3 className="text-2xl font-black text-[#000033] mb-8 tracking-tight flex items-center gap-3">
                                    <MessageSquare className="w-6 h-6 text-blue-600" />
                                    Global Support
                                </h3>

                                <div className="space-y-10">
                                    <ContactItem
                                        icon={<Mail className="w-6 h-6 text-blue-600" />}
                                        title="Direct Email"
                                        value="support@hrteksystem.com"
                                        href="mailto:support@hrteksystem.com"
                                        color="blue"
                                    />
                                    <ContactItem
                                        icon={<Phone className="w-6 h-6 text-emerald-600" />}
                                        title="Customer Success"
                                        value="+91 9335870619"
                                        subValue="0522-3195292"
                                        color="emerald"
                                    />
                                    <ContactItem
                                        icon={<MapPin className="w-6 h-6 text-rose-600" />}
                                        title="Corporate HQ"
                                        value="Lucknow, Uttar Pradesh"
                                        subValue="India, Asia-Pacific"
                                        color="rose"
                                    />
                                    <ContactItem
                                        icon={<Clock className="w-6 h-6 text-amber-600" />}
                                        title="Response Time"
                                        value="Within 24 Hours"
                                        subValue="Monday - Friday, 9AM - 6PM IST"
                                        color="amber"
                                    />
                                </div>

                                <div className="mt-12 pt-8 border-t border-slate-100">
                                    <h4 className="text-sm font-black text-slate-400 mb-6 uppercase tracking-widest">Connect Digitally</h4>
                                    <a
                                        href="https://in.linkedin.com/company/hr-tek-system"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group inline-flex items-center gap-4 p-4 bg-[#0077b5]/5 border border-[#0077b5]/10 rounded-2xl w-full hover:bg-[#0077b5] hover:text-white transition-all duration-300"
                                    >
                                        <div className="p-3 bg-white rounded-xl shadow-sm text-[#0077b5] group-hover:bg-white/20 group-hover:text-white transition-colors duration-300">
                                            <Linkedin className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="font-black text-sm tracking-tight">HRTEK ON LINKEDIN</p>
                                            <p className="text-xs font-medium opacity-60">Join 5,000+ professionals</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        {/* Glassmorphism Form Panel */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="lg:col-span-8"
                        >
                            <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 p-10 md:p-14 border border-slate-100 relative">
                                <div className="mb-12">
                                    <h2 className="text-3xl font-black text-[#000033] mb-4 tracking-tighter">Initiate Transformation</h2>
                                    <p className="text-slate-500 font-medium">Please fill out the form below. Our high-performance team will analyze your requirements and reach out with a strategic overview.</p>
                                </div>

                                <Form method="post" ref={formRef} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputField
                                            label="First Name"
                                            name="firstName"
                                            placeholder="John"
                                            required
                                        />
                                        <InputField
                                            label="Last Name"
                                            name="lastName"
                                            placeholder="Doe"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputField
                                            label="Business Email"
                                            name="email"
                                            type="email"
                                            placeholder="john@company.com"
                                            required
                                        />
                                        <InputField
                                            label="Phone Number"
                                            name="phone"
                                            type="tel"
                                            placeholder="+91 00000 00000"
                                        />
                                    </div>

                                    <InputField
                                        label="Organization Name"
                                        name="company"
                                        placeholder="HRTek Solutions Pvt Ltd"
                                    />

                                    <div>
                                        <label className="block text-sm font-black text-[#000033] mb-3 uppercase tracking-wider">How can we help your organization? *</label>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none font-medium placeholder:text-slate-400"
                                            placeholder="Tell us about your current challenges, desired outcomes, or technology landscape..."
                                        />
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.01, translateY: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-600/20 hover:shadow-2xl hover:shadow-blue-600/30 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>
                                                <span>DEPLOY MESSAGE</span>
                                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </motion.button>
                                </Form>

                                <div className="mt-8 flex items-center justify-center gap-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5 hover:text-blue-500 transition-colors cursor-default">
                                        <Globe className="w-3.5 h-3.5" />
                                        GDPR COMPLIANT
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                                    <div className="flex items-center gap-1.5 hover:text-emerald-500 transition-colors cursor-default">
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        ISO 27001 SECURE
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </main>

            <Footer />
            <ToastContainer position="bottom-right" theme="colored" />
        </div>
    );
}

function ContactItem({ icon, title, value, subValue, href, color }: { icon: React.ReactNode, title: string, value: string, subValue?: string, href?: string, color: string }) {
    const colorClasses: Record<string, string> = {
        blue: "bg-blue-50 group-hover:bg-blue-100",
        emerald: "bg-emerald-50 group-hover:bg-emerald-100",
        rose: "bg-rose-50 group-hover:bg-rose-100",
        amber: "bg-amber-50 group-hover:bg-amber-100"
    };

    return (
        <div className="flex items-start gap-6 group cursor-pointer">
            <div className={`p-4 rounded-2xl transition-colors duration-300 ${colorClasses[color]}`}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
                {href ? (
                    <a href={href} className="text-lg font-black text-[#000033] hover:text-blue-600 transition-colors tracking-tight">{value}</a>
                ) : (
                    <p className="text-lg font-black text-[#000033] tracking-tight">{value}</p>
                )}
                {subValue && <p className="text-sm font-medium text-slate-500 mt-0.5">{subValue}</p>}
            </div>
        </div>
    );
}

function InputField({ label, name, type = "text", placeholder, required = false }: { label: string, name: string, type?: string, placeholder: string, required?: boolean }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-black text-[#000033] mb-3 uppercase tracking-wider">{label} {required && "*"}</label>
            <input
                type={type}
                name={name}
                id={name}
                required={required}
                className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-400"
                placeholder={placeholder}
            />
        </div>
    );
}
