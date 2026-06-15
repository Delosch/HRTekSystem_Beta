import { useState, useRef } from "react";
import { User, Mail, Phone, MapPin, Building2, CreditCard, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";

interface BillingDetailsFormProps {
    onSubmit: (billingDetails: BillingContact) => void;
    onCancel: () => void;
    cartItems?: { productName: string; price: number }[];
    total?: number;
}

export interface BillingContact {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    gstin?: string;
}

type Step = "form" | "otp";

export default function BillingDetailsForm({ onSubmit, onCancel, cartItems = [], total = 0 }: BillingDetailsFormProps) {
    const [step, setStep] = useState<Step>("form");
    const [billingDetails, setBillingDetails] = useState<BillingContact>({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "Maharashtra",
        pincode: "",
        gstin: ""
    });

    const [errors, setErrors] = useState<Partial<BillingContact>>({});

    // OTP state
    const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
    const [otpError, setOtpError] = useState("");
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const validate = () => {
        const newErrors: Partial<BillingContact> = {};

        if (!billingDetails.name.trim()) newErrors.name = "Name is required";
        if (!billingDetails.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(billingDetails.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!billingDetails.phone.trim()) {
            newErrors.phone = "Phone is required";
        } else if (!/^\d{10}$/.test(billingDetails.phone.replace(/\D/g, ""))) {
            newErrors.phone = "Phone must be 10 digits";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSendOtp = async () => {
        if (!validate()) return;

        setIsSendingOtp(true);
        setOtpError("");

        const engineNames = cartItems.map(i => i.productName).join(", ");

        try {
            const res = await fetch("/api/payment-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    intent: "send_otp",
                    phone: billingDetails.phone,
                    engineNames,
                    totalAmount: total.toLocaleString("en-IN")
                })
            });

            const result = await res.json();

            if (result.success) {
                setStep("otp");
                setOtpDigits(["", "", "", "", "", ""]);
                setTimeout(() => otpRefs.current[0]?.focus(), 100);
            } else {
                setOtpError(result.error || "Failed to send OTP. Please try again.");
            }
        } catch {
            setOtpError("Network error. Please try again.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        const digit = value.replace(/\D/g, "").slice(-1);
        const newDigits = [...otpDigits];
        newDigits[index] = digit;
        setOtpDigits(newDigits);
        setOtpError("");

        if (digit && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent) => {
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (pasted.length === 6) {
            setOtpDigits(pasted.split(""));
            otpRefs.current[5]?.focus();
        }
    };

    const handleVerifyOtp = async () => {
        const otp = otpDigits.join("");
        if (otp.length < 6) {
            setOtpError("Please enter the complete 6-digit OTP.");
            return;
        }

        setIsVerifyingOtp(true);
        setOtpError("");

        try {
            const res = await fetch("/api/payment-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    intent: "verify_otp",
                    phone: billingDetails.phone,
                    otp
                })
            });

            const result = await res.json();

            if (result.success) {
                onSubmit(billingDetails);
            } else {
                setOtpError(result.error || "Invalid OTP. Please try again.");
            }
        } catch {
            setOtpError("Network error. Please try again.");
        } finally {
            setIsVerifyingOtp(false);
        }
    };

    const indianStates = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl max-h-[90vh] overflow-y-auto">

                {/* ── BILLING DETAILS STEP ── */}
                {step === "form" && (
                    <>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing Details</h2>
                        <p className="text-gray-600 mb-6">Please provide your billing information for the invoice</p>

                        <form
                            onSubmit={(e) => { e.preventDefault(); handleSendOtp(); }}
                            className="space-y-6"
                        >
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    value={billingDetails.name}
                                    onChange={(e) => setBillingDetails({ ...billingDetails, name: e.target.value })}
                                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="John Doe"
                                />
                                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                            </div>

                            {/* Email & Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Mail className="w-4 h-4 inline mr-2" />
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        value={billingDetails.email}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, email: e.target.value })}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="john@company.com"
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Phone className="w-4 h-4 inline mr-2" />
                                        Phone Number * <span className="text-xs text-blue-600 font-normal">(OTP will be sent here)</span>
                                    </label>
                                    <input
                                        type="tel"
                                        value={billingDetails.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "").slice(0, 10);
                                            setBillingDetails({ ...billingDetails, phone: value });
                                        }}
                                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="9876543210"
                                        maxLength={10}
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    Address
                                </label>
                                <textarea
                                    value={billingDetails.address}
                                    onChange={(e) => setBillingDetails({ ...billingDetails, address: e.target.value })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    rows={2}
                                    placeholder="Street address, building name, etc."
                                />
                            </div>

                            {/* City, State, Pincode */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Building2 className="w-4 h-4 inline mr-2" />
                                        City
                                    </label>
                                    <input
                                        type="text"
                                        value={billingDetails.city}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, city: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="Mumbai"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                    <select
                                        value={billingDetails.state}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, state: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    >
                                        {indianStates.map(state => (
                                            <option key={state} value={state}>{state}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                                    <input
                                        type="text"
                                        value={billingDetails.pincode}
                                        onChange={(e) => setBillingDetails({ ...billingDetails, pincode: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        placeholder="400001"
                                        maxLength={6}
                                    />
                                </div>
                            </div>

                            {/* GSTIN */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <CreditCard className="w-4 h-4 inline mr-2" />
                                    GSTIN (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={billingDetails.gstin}
                                    onChange={(e) => setBillingDetails({ ...billingDetails, gstin: e.target.value.toUpperCase() })}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="22AAAAA0000A1Z5"
                                    maxLength={15}
                                />
                                <p className="text-xs text-gray-500 mt-1">Enter your 15-digit GSTIN if you have one</p>
                            </div>

                            {otpError && (
                                <p className="text-red-500 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-3">{otpError}</p>
                            )}

                            {/* Buttons */}
                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="flex-1 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSendingOtp}
                                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSendingOtp ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Sending OTP...
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck className="w-4 h-4" />
                                            Continue to Payment
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </>
                )}

                {/* ── OTP VERIFICATION STEP ── */}
                {step === "otp" && (
                    <div className="text-center">
                        {/* Icon */}
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-8 h-8 text-blue-600" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Mobile</h2>
                        <p className="text-gray-600 mb-1">
                            We've sent a 6-digit OTP to
                        </p>
                        <p className="text-gray-900 font-semibold mb-6">+91 {billingDetails.phone}</p>

                        {/* Payment summary */}
                        {cartItems.length > 0 && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
                                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Payment Summary</p>
                                {cartItems.map((item, i) => (
                                    <div key={i} className="flex justify-between text-sm text-gray-700">
                                        <span>{item.productName}</span>
                                        <span className="font-medium">₹{item.price.toLocaleString("en-IN")}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between text-sm font-bold text-gray-900 border-t border-blue-200 mt-2 pt-2">
                                    <span>Total (incl. GST)</span>
                                    <span className="text-blue-700">₹{total.toLocaleString("en-IN")}</span>
                                </div>
                            </div>
                        )}

                        {/* OTP Input Boxes */}
                        <div className="flex justify-center gap-3 mb-4" onPaste={handleOtpPaste}>
                            {otpDigits.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { otpRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    value={digit}
                                    onChange={(e) => handleOtpChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                    maxLength={1}
                                    className={`w-12 h-14 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:border-blue-500 transition-colors ${
                                        otpError ? "border-red-400 bg-red-50" : digit ? "border-blue-400 bg-blue-50" : "border-gray-300"
                                    }`}
                                />
                            ))}
                        </div>

                        {otpError && (
                            <p className="text-red-500 text-sm mb-4">{otpError}</p>
                        )}

                        {/* Verify Button */}
                        <button
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp || otpDigits.join("").length < 6}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold mb-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isVerifyingOtp ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Verify & Proceed to Payment"
                            )}
                        </button>

                        {/* Resend & Back */}
                        <div className="flex items-center justify-between text-sm">
                            <button
                                onClick={() => setStep("form")}
                                className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Change Details
                            </button>
                            <button
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                            >
                                {isSendingOtp ? "Sending..." : "Resend OTP"}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
