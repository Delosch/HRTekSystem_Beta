import { ActionFunction, json, MetaFunction } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
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
    Clock,
    AlertCircle
} from "lucide-react";
import Navbar from "~/components/HomePageComponents/Navbar";
import Footer from "~/components/Footer";
import { sendSupportMessageEmail } from "~/lib/email.service.server";
import { getDynamoDBDocumentClient } from "~/lib/dynamodb.server";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { ToastContainer, toast } from "react-toastify";
import { generateMeta, generateBreadcrumbSchema } from "~/utils/seo";
import { verifyHCaptcha } from "~/utils/captcha.server";
import HCaptcha from "@hcaptcha/react-hcaptcha";

export const meta: MetaFunction = () => {
    return generateMeta({
        title: "Contact Us - Get Started with HR Transformation",
        description: "Ready to transform your HR operations? Contact HRTek System for a consultation. Email: support@hrteksystem.com | Phone: +91-9335870619. We're here to help you succeed.",
        keywords: "contact HRTek, HR consultation, get started, HR transformation inquiry, customer support, sales inquiry",
        url: "https://www.hrteksystem.com/contact",
        image: "https://hrteksystem.com/og-contact.jpg",
    });
};

// Priority Logic Map
const QUERY_TYPES = {
    sales: { label: "Sales Inquiry", priority: "High", responseTime: "Within 24 Hours" },
    marketing: { label: "Marketing & PR", priority: "Medium", responseTime: "Within 24 Hours" },
    support: { label: "Customer Support", priority: "High", responseTime: "Within 24 Hours" },
    partnership: { label: "Partnership Opportunities", priority: "Medium", responseTime: "Within 24 Hours" },
    general: { label: "General Inquiry", priority: "Low", responseTime: "Within 24 Hours" }
};

export const action: ActionFunction = async ({ request }) => {
    const { randomUUID } = await import("crypto");
    const formData = await request.formData();
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const countryCode = formData.get("countryCode") as string;
    const company = formData.get("company") as string;
    const message = formData.get("message") as string;
    const queryTypeKey = formData.get("queryQuery") as keyof typeof QUERY_TYPES || "general";
    const botCheck = formData.get("bot_check") as string;

    // Honeypot Spam Check
    if (botCheck) {
        return json({ success: true, message: "Message sent successfully!" });
    }

    const hCaptchaToken = formData.get("h-captcha-response") as string;
    if (!hCaptchaToken || !(await verifyHCaptcha(hCaptchaToken))) {
        return json({ error: "Please complete the security verification." }, { status: 400 });
    }

    if (!firstName || !email || !message) {
        return json({ error: "Please fill in all required fields" }, { status: 400 });
    }

    // Determine Priority and Labels
    const queryConfig = QUERY_TYPES[queryTypeKey] || QUERY_TYPES.general;
    const priority = queryConfig.priority;
    const fullPhone = `${countryCode} ${phone}`;

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
                phone: fullPhone,
                company,
                message,
                queryType: queryConfig.label,
                priority,
                createdAt: timestamp,
                status: "unread"
            }
        }));

        // Send Email to Support
        await sendSupportMessageEmail({
            name: `${firstName} ${lastName}`,
            email,
            phone: fullPhone,
            company,
            message,
            queryType: queryConfig.label,
            priority
        });

        // Determine specific success message
        let successMsg = "Message sent! We'll get back to you strictly within 24 hours.";
        if (queryTypeKey === 'sales') successMsg = "Thanks for your sales inquiry! Our team will contact you within 24 hours.";
        else if (queryTypeKey === 'support') successMsg = "Support ticket created (High Priority). Expect a response within 24 hours.";
        else if (queryTypeKey === 'marketing') successMsg = "Marketing query received. We'll reach out within 24 hours.";
        else if (queryTypeKey === 'partnership') successMsg = "Partnership proposal received. We'll review and reply within 24 hours.";

        return json({ success: true, message: successMsg });
    } catch (error) {
        console.error("Contact Form Error:", error);
        return json({ error: "Failed to send message. Please try again later." }, { status: 500 });
    }
};

export default function ContactUs() {
    const actionData = useActionData<{ error?: string; success?: boolean; message?: string }>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const formRef = useRef<HTMLFormElement>(null);
    const captchaRef = useRef<HCaptcha>(null);
    const [siteKey, setSiteKey] = useState("");
    const [captchaToken, setCaptchaToken] = useState("");

    const [selectedQuery, setSelectedQuery] = useState<keyof typeof QUERY_TYPES>("sales");
    const [responseTime, setResponseTime] = useState(QUERY_TYPES.sales.responseTime);

    // Update response time when query type changes
    useEffect(() => {
        setResponseTime(QUERY_TYPES[selectedQuery]?.responseTime || "Within 24 Hours");
    }, [selectedQuery]);

    useEffect(() => {
        if (actionData?.success) {
            toast.success(actionData.message || "Message sent successfully!");
            formRef.current?.reset();
            captchaRef.current?.resetCaptcha();
            setCaptchaToken("");
        } else if (actionData?.error) {
            toast.error(actionData.error);
            captchaRef.current?.resetCaptcha();
            setCaptchaToken("");
        }
    }, [actionData]);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const key = (window as any).ENV?.VITE_HCAPTCHA_SITE_KEY;
            if (key) setSiteKey(key);
        }
    }, []);

    const onCaptchaVerify = (token: string) => {
        setCaptchaToken(token);
    };

    const handleCopyPaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        toast.warning("Copy-pasting is disabled for security reasons.");
    };

    // Breadcrumb Schema
    const breadcrumbSchema = generateBreadcrumbSchema([
        { name: "Home", url: "/" },
        { name: "Contact Us", url: "/contact" }
    ]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-outfit">
            <link rel="canonical" href="https://www.hrteksystem.com/contact" />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <Navbar />

            <main className="flex-grow">
                {/* Premium Hero Section */}
                <div className="relative bg-gradient-to-br from-[#001845] via-[#023e8a] to-[#0077b6] overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                            backgroundSize: '40px 40px'
                        }}></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-28 text-center z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                <span className="text-white/90 text-sm font-medium">Connect With Excellence</span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                                Let's Build the Future
                                <span className="block bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                                    of Your Workforce
                                </span>
                            </h1>

                            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
                                Our cognitive AI solutions and strategic advisory teams are standing by to help you redefine what's possible in HR.
                            </p>
                        </motion.div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#F8FAFC" />
                        </svg>
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

                                    {/* Enhanced Response Time Section */}
                                    <div className="flex items-start gap-6 group cursor-pointer">
                                        <div className="p-4 rounded-2xl transition-colors duration-300 bg-amber-50 group-hover:bg-amber-100">
                                            <Clock className="w-6 h-6 text-amber-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Response</p>
                                            <p className="text-lg font-black text-[#000033] tracking-tight transition-all duration-300">
                                                {responseTime}
                                            </p>
                                            <p className="text-sm font-medium text-slate-500 mt-0.5">
                                                Based on {QUERY_TYPES[selectedQuery].priority} Priority
                                            </p>
                                        </div>
                                    </div>
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
                                            <p className="font-black text-sm tracking-tight">HR-TEK ON LINKEDIN</p>
                                            <p className="text-xs font-medium opacity-60">Join 5,000+ professionals</p>
                                        </div>
                                        <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </a>
                                </div>
                            </div>
                        </motion.div>

                        {/* Form Panel */}
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

                                        {/* Mobile Number with Country Code */}
                                        <div>
                                            <label className="block text-sm font-black text-[#000033] mb-3 uppercase tracking-wider">Phone Number</label>
                                            <div className="flex gap-3">
                                                <select
                                                    name="countryCode"
                                                    className="w-24 px-3 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-sm"
                                                    defaultValue="+91"
                                                >
                                                    <option value="+93">AF +93</option>
                                                    <option value="+355">AL +355</option>
                                                    <option value="+213">DZ +213</option>
                                                    <option value="+1684">AS +1684</option>
                                                    <option value="+376">AD +376</option>
                                                    <option value="+244">AO +244</option>
                                                    <option value="+1264">AI +1264</option>
                                                    <option value="+672">AQ +672</option>
                                                    <option value="+1268">AG +1268</option>
                                                    <option value="+54">AR +54</option>
                                                    <option value="+374">AM +374</option>
                                                    <option value="+297">AW +297</option>
                                                    <option value="+61">AU +61</option>
                                                    <option value="+43">AT +43</option>
                                                    <option value="+994">AZ +994</option>
                                                    <option value="+1242">BS +1242</option>
                                                    <option value="+973">BH +973</option>
                                                    <option value="+880">BD +880</option>
                                                    <option value="+1246">BB +1246</option>
                                                    <option value="+375">BY +375</option>
                                                    <option value="+32">BE +32</option>
                                                    <option value="+501">BZ +501</option>
                                                    <option value="+229">BJ +229</option>
                                                    <option value="+1441">BM +1441</option>
                                                    <option value="+975">BT +975</option>
                                                    <option value="+591">BO +591</option>
                                                    <option value="+387">BA +387</option>
                                                    <option value="+267">BW +267</option>
                                                    <option value="+55">BR +55</option>
                                                    <option value="+246">IO +246</option>
                                                    <option value="+673">BN +673</option>
                                                    <option value="+359">BG +359</option>
                                                    <option value="+226">BF +226</option>
                                                    <option value="+257">BI +257</option>
                                                    <option value="+855">KH +855</option>
                                                    <option value="+237">CM +237</option>
                                                    <option value="+1">CA +1</option>
                                                    <option value="+238">CV +238</option>
                                                    <option value="+1345">KY +1345</option>
                                                    <option value="+236">CF +236</option>
                                                    <option value="+235">TD +235</option>
                                                    <option value="+56">CL +56</option>
                                                    <option value="+86">CN +86</option>
                                                    <option value="+61">CX +61</option>
                                                    <option value="+61">CC +61</option>
                                                    <option value="+57">CO +57</option>
                                                    <option value="+269">KM +269</option>
                                                    <option value="+242">CG +242</option>
                                                    <option value="+243">CD +243</option>
                                                    <option value="+682">CK +682</option>
                                                    <option value="+506">CR +506</option>
                                                    <option value="+385">HR +385</option>
                                                    <option value="+53">CU +53</option>
                                                    <option value="+357">CY +357</option>
                                                    <option value="+420">CZ +420</option>
                                                    <option value="+45">DK +45</option>
                                                    <option value="+253">DJ +253</option>
                                                    <option value="+1767">DM +1767</option>
                                                    <option value="+1809">DO +1809</option>
                                                    <option value="+593">EC +593</option>
                                                    <option value="+20">EG +20</option>
                                                    <option value="+503">SV +503</option>
                                                    <option value="+240">GQ +240</option>
                                                    <option value="+291">ER +291</option>
                                                    <option value="+372">EE +372</option>
                                                    <option value="+251">ET +251</option>
                                                    <option value="+500">FK +500</option>
                                                    <option value="+298">FO +298</option>
                                                    <option value="+679">FJ +679</option>
                                                    <option value="+358">FI +358</option>
                                                    <option value="+33">FR +33</option>
                                                    <option value="+594">GF +594</option>
                                                    <option value="+689">PF +689</option>
                                                    <option value="+241">GA +241</option>
                                                    <option value="+220">GM +220</option>
                                                    <option value="+995">GE +995</option>
                                                    <option value="+49">DE +49</option>
                                                    <option value="+233">GH +233</option>
                                                    <option value="+350">GI +350</option>
                                                    <option value="+30">GR +30</option>
                                                    <option value="+299">GL +299</option>
                                                    <option value="+1473">GD +1473</option>
                                                    <option value="+590">GP +590</option>
                                                    <option value="+1671">GU +1671</option>
                                                    <option value="+502">GT +502</option>
                                                    <option value="+224">GN +224</option>
                                                    <option value="+245">GW +245</option>
                                                    <option value="+592">GY +592</option>
                                                    <option value="+509">HT +509</option>
                                                    <option value="+39">VA +39</option>
                                                    <option value="+504">HN +504</option>
                                                    <option value="+852">HK +852</option>
                                                    <option value="+36">HU +36</option>
                                                    <option value="+354">IS +354</option>
                                                    <option value="+91">IN +91</option>
                                                    <option value="+62">ID +62</option>
                                                    <option value="+98">IR +98</option>
                                                    <option value="+964">IQ +964</option>
                                                    <option value="+353">IE +353</option>
                                                    <option value="+972">IL +972</option>
                                                    <option value="+39">IT +39</option>
                                                    <option value="+225">CI +225</option>
                                                    <option value="+1876">JM +1876</option>
                                                    <option value="+81">JP +81</option>
                                                    <option value="+962">JO +962</option>
                                                    <option value="+7">KZ +7</option>
                                                    <option value="+254">KE +254</option>
                                                    <option value="+686">KI +686</option>
                                                    <option value="+850">KP +850</option>
                                                    <option value="+82">KR +82</option>
                                                    <option value="+965">KW +965</option>
                                                    <option value="+996">KG +996</option>
                                                    <option value="+856">LA +856</option>
                                                    <option value="+371">LV +371</option>
                                                    <option value="+961">LB +961</option>
                                                    <option value="+266">LS +266</option>
                                                    <option value="+231">LR +231</option>
                                                    <option value="+218">LY +218</option>
                                                    <option value="+423">LI +423</option>
                                                    <option value="+370">LT +370</option>
                                                    <option value="+352">LU +352</option>
                                                    <option value="+853">MO +853</option>
                                                    <option value="+389">MK +389</option>
                                                    <option value="+261">MG +261</option>
                                                    <option value="+265">MW +265</option>
                                                    <option value="+60">MY +60</option>
                                                    <option value="+960">MV +960</option>
                                                    <option value="+223">ML +223</option>
                                                    <option value="+356">MT +356</option>
                                                    <option value="+692">MH +692</option>
                                                    <option value="+596">MQ +596</option>
                                                    <option value="+222">MR +222</option>
                                                    <option value="+230">MU +230</option>
                                                    <option value="+262">YT +262</option>
                                                    <option value="+52">MX +52</option>
                                                    <option value="+691">FM +691</option>
                                                    <option value="+373">MD +373</option>
                                                    <option value="+377">MC +377</option>
                                                    <option value="+976">MN +976</option>
                                                    <option value="+382">ME +382</option>
                                                    <option value="+1664">MS +1664</option>
                                                    <option value="+212">MA +212</option>
                                                    <option value="+258">MZ +258</option>
                                                    <option value="+95">MM +95</option>
                                                    <option value="+264">NA +264</option>
                                                    <option value="+674">NR +674</option>
                                                    <option value="+977">NP +977</option>
                                                    <option value="+31">NL +31</option>
                                                    <option value="+599">AN +599</option>
                                                    <option value="+687">NC +687</option>
                                                    <option value="+64">NZ +64</option>
                                                    <option value="+505">NI +505</option>
                                                    <option value="+227">NE +227</option>
                                                    <option value="+234">NG +234</option>
                                                    <option value="+683">NU +683</option>
                                                    <option value="+672">NF +672</option>
                                                    <option value="+1670">MP +1670</option>
                                                    <option value="+47">NO +47</option>
                                                    <option value="+968">OM +968</option>
                                                    <option value="+92">PK +92</option>
                                                    <option value="+680">PW +680</option>
                                                    <option value="+970">PS +970</option>
                                                    <option value="+507">PA +507</option>
                                                    <option value="+675">PG +675</option>
                                                    <option value="+595">PY +595</option>
                                                    <option value="+51">PE +51</option>
                                                    <option value="+63">PH +63</option>
                                                    <option value="+48">PL +48</option>
                                                    <option value="+351">PT +351</option>
                                                    <option value="+1787">PR +1787</option>
                                                    <option value="+974">QA +974</option>
                                                    <option value="+40">RO +40</option>
                                                    <option value="+7">RU +7</option>
                                                    <option value="+250">RW +250</option>
                                                    <option value="+590">BL +590</option>
                                                    <option value="+290">SH +290</option>
                                                    <option value="+1869">KN +1869</option>
                                                    <option value="+1758">LC +1758</option>
                                                    <option value="+590">MF +590</option>
                                                    <option value="+508">PM +508</option>
                                                    <option value="+1784">VC +1784</option>
                                                    <option value="+685">WS +685</option>
                                                    <option value="+378">SM +378</option>
                                                    <option value="+239">ST +239</option>
                                                    <option value="+966">SA +966</option>
                                                    <option value="+221">SN +221</option>
                                                    <option value="+381">RS +381</option>
                                                    <option value="+248">SC +248</option>
                                                    <option value="+232">SL +232</option>
                                                    <option value="+65">SG +65</option>
                                                    <option value="+421">SK +421</option>
                                                    <option value="+386">SI +386</option>
                                                    <option value="+677">SB +677</option>
                                                    <option value="+252">SO +252</option>
                                                    <option value="+27">ZA +27</option>
                                                    <option value="+34">ES +34</option>
                                                    <option value="+94">LK +94</option>
                                                    <option value="+249">SD +249</option>
                                                    <option value="+597">SR +597</option>
                                                    <option value="+47">SJ +47</option>
                                                    <option value="+268">SZ +268</option>
                                                    <option value="+46">SE +46</option>
                                                    <option value="+41">CH +41</option>
                                                    <option value="+963">SY +963</option>
                                                    <option value="+886">TW +886</option>
                                                    <option value="+992">TJ +992</option>
                                                    <option value="+255">TZ +255</option>
                                                    <option value="+66">TH +66</option>
                                                    <option value="+670">TL +670</option>
                                                    <option value="+228">TG +228</option>
                                                    <option value="+690">TK +690</option>
                                                    <option value="+676">TO +676</option>
                                                    <option value="+1868">TT +1868</option>
                                                    <option value="+216">TN +216</option>
                                                    <option value="+90">TR +90</option>
                                                    <option value="+993">TM +993</option>
                                                    <option value="+1649">TC +1649</option>
                                                    <option value="+688">TV +688</option>
                                                    <option value="+256">UG +256</option>
                                                    <option value="+380">UA +380</option>
                                                    <option value="+971">AE +971</option>
                                                    <option value="+44">GB +44</option>
                                                    <option value="+1">US +1</option>
                                                    <option value="+598">UY +598</option>
                                                    <option value="+998">UZ +998</option>
                                                    <option value="+678">VU +678</option>
                                                    <option value="+58">VE +58</option>
                                                    <option value="+84">VN +84</option>
                                                    <option value="+1284">VG +1284</option>
                                                    <option value="+1340">VI +1340</option>
                                                    <option value="+681">WF +681</option>
                                                    <option value="+967">YE +967</option>
                                                    <option value="+260">ZM +260</option>
                                                    <option value="+263">ZW +263</option>
                                                </select>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    placeholder="98765 43210"
                                                    className="flex-1 px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <InputField
                                            label="Organization Name"
                                            name="company"
                                            placeholder="HRTek Solutions Pvt Ltd"
                                        />

                                        {/* Query Type Dropdown */}
                                        <div>
                                            <label htmlFor="queryQuery" className="block text-sm font-black text-[#000033] mb-3 uppercase tracking-wider">Query Type *</label>
                                            <div className="relative">
                                                <select
                                                    name="queryQuery"
                                                    id="queryQuery"
                                                    required
                                                    value={selectedQuery}
                                                    onChange={(e) => setSelectedQuery(e.target.value as keyof typeof QUERY_TYPES)}
                                                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium appearance-none cursor-pointer"
                                                >
                                                    {Object.entries(QUERY_TYPES).map(([key, config]) => (
                                                        <option key={key} value={key}>{config.label}</option>
                                                    ))}
                                                </select>
                                                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                                    <AlertCircle className="w-5 h-5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Secured Textarea */}
                                    <div>
                                        <label className="block text-sm font-black text-[#000033] mb-3 uppercase tracking-wider">
                                            How can we help your organization? *
                                            <span className="ml-2 text-[10px] text-red-400 normal-case font-normal">(Copy-paste disabled)</span>
                                        </label>
                                        <textarea
                                            name="message"
                                            required
                                            rows={5}
                                            onPaste={handleCopyPaste}
                                            className="w-full px-6 py-4 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none font-medium placeholder:text-slate-400"
                                            placeholder="Tell us about your current challenges, desired outcomes, or technology landscape..."
                                        />
                                    </div>

                                    <div className="flex justify-center mb-6">
                                        {siteKey && (
                                            <HCaptcha
                                                sitekey={siteKey}
                                                onVerify={onCaptchaVerify}
                                                ref={captchaRef}
                                            />
                                        )}
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
                                                <span>SEND MESSAGE</span>
                                                <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                            </>
                                        )}
                                    </motion.button>
                                    {/* Honeypot Field */}
                                    <div style={{ display: 'none', opacity: 0, position: 'absolute', left: '-9999px' }} aria-hidden="true">
                                        <label htmlFor="bot_check">Do not fill this field</label>
                                        <input type="text" name="bot_check" id="bot_check" tabIndex={-1} autoComplete="off" />
                                    </div>
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
