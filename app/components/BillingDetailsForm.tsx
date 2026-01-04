import { useState } from "react";
import { User, Mail, Phone, MapPin, Building2, CreditCard } from "lucide-react";

interface BillingDetailsFormProps {
    onSubmit: (billingDetails: BillingContact) => void;
    onCancel: () => void;
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

export default function BillingDetailsForm({ onSubmit, onCancel }: BillingDetailsFormProps) {
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(billingDetails);
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing Details</h2>
                <p className="text-gray-600 mb-6">Please provide your billing information for the invoice</p>

                <form onSubmit={handleSubmit} className="space-y-6">
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
                            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'
                                }`}
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
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="john@company.com"
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Phone className="w-4 h-4 inline mr-2" />
                                Phone Number *
                            </label>
                            <input
                                type="tel"
                                value={billingDetails.phone}
                                onChange={(e) => setBillingDetails({ ...billingDetails, phone: e.target.value })}
                                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="9876543210"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                State
                            </label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pincode
                            </label>
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

                    {/* GSTIN (Optional) */}
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
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                        >
                            Continue to Payment
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
