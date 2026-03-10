import { useState, useEffect, useRef } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { useFetcher } from "@remix-run/react";
import { toast } from "react-toastify";
import { CheckCircle2, X, Calendar, Clock, User, Mail, Phone, Cpu } from "lucide-react";

const TIME_SLOTS = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM",
    "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM",
    "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM",
    "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM", "5:00 PM",
];

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    engineName: string;
    user?: any;
}

export default function BookingModal({ isOpen, onClose, engineName, user }: BookingModalProps) {
    const [selected, setSelected] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState("");
    const [name, setName] = useState(user?.name || "");
    const [email, setEmail] = useState(user?.email || "");
    const [mobile, setMobile] = useState("");
    const [showThankYou, setShowThankYou] = useState(false);

    const fetcher = useFetcher<{ success: boolean; message?: string; error?: string }>();

    // Show thank-you screen on success — and keep it visible
    useEffect(() => {
        if (fetcher.data?.success) {
            setShowThankYou(true);
        } else if (fetcher.data?.error) {
            toast.error(fetcher.data.error);
        }
    }, [fetcher.data]);

    // Track previous isOpen so we ONLY reset when modal freshly opens (false → true)
    const prevOpenRef = useRef(false);
    useEffect(() => {
        const justOpened = !prevOpenRef.current && isOpen;
        prevOpenRef.current = isOpen;

        if (justOpened) {
            // Fresh open — reset the form
            setSelected(undefined);
            setSelectedTime("");
            setName(user?.name || "");
            setEmail(user?.email || "");
            setMobile("");
            setShowThankYou(false);
        }
    }, [isOpen, user]);

    const handleBooking = () => {
        if (!name.trim()) {
            toast.error("Please enter your full name");
            return;
        }
        if (!email.trim()) {
            toast.error("Please enter your email address");
            return;
        }
        if (!mobile.trim()) {
            toast.error("Please enter your mobile number");
            return;
        }
        if (!selected) {
            toast.error("Please select a date");
            return;
        }
        if (!selectedTime) {
            toast.error("Please select a time slot");
            return;
        }

        const formData = new FormData();
        formData.append("date", selected.toLocaleDateString());
        formData.append("time", selectedTime);
        formData.append("engineName", engineName);
        formData.append("name", name.trim());
        formData.append("email", email.trim());
        formData.append("phone", mobile.trim());

        fetcher.submit(formData, { method: "post", action: "/api/book-consultant" });
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }}
            onClick={showThankYou ? undefined : onClose}
        >
            <div
                className="bg-white w-full max-w-5xl max-h-[95vh] rounded-3xl relative animate-scaleIn flex flex-col overflow-hidden"
                style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,0,0,0.08)" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* === STICKY HEADER — always visible === */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Cpu className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest leading-none">Consultation for</p>
                            <p className="text-sm font-black text-slate-800 leading-tight">{engineName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-red-100 hover:text-red-600 text-gray-500 transition-all"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* === SCROLLABLE BODY === */}
                <div className="overflow-y-auto no-scrollbar flex-1">

                {/* Thank You Screen */}
                {showThankYou ? (
                    <div className="flex flex-col items-center justify-center text-center px-8 py-20 gap-6">
                        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
                            <CheckCircle2 className="w-12 h-12 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-black text-slate-900">Booking Confirmed!</h2>
                        <p className="text-slate-600 text-lg max-w-md leading-relaxed">
                            Your appointment for{" "}
                            <span className="font-bold text-blue-600">{engineName}</span> has been received.
                            <br />
                            Our team will contact you within <span className="font-bold text-slate-900">48 hours</span>.
                        </p>
                        <p className="text-slate-400 text-sm">
                            A confirmation has been sent to <span className="font-semibold text-slate-600">{email}</span>{mobile ? ` and ${mobile}` : ""}.
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-4 px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all"
                        >
                            Close
                        </button>
                    </div>
                ) : (
                    <div className="p-6 md:p-8">

                        {/* Contact Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                    <User className="w-3 h-3 inline mr-1" />Full Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                    <Mail className="w-3 h-3 inline mr-1" />Email Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@example.com"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
                                    <Phone className="w-3 h-3 inline mr-1" />Mobile Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value)}
                                    placeholder="+91 9876543210"
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-black text-sm"
                                />
                            </div>
                        </div>

                        {/* Calendar and Time */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-8">
                            {/* Calendar */}
                            <div className="flex-1 bg-slate-50 rounded-2xl p-4 flex flex-col items-center border border-slate-100">
                                <div className="flex items-center gap-2 mb-3 self-start">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Date</span>
                                </div>
                                <DayPicker
                                    mode="single"
                                    selected={selected}
                                    onSelect={setSelected}
                                    startMonth={new Date()}
                                    disabled={{ before: new Date() }}
                                    modifiersClassNames={{
                                        selected: "bg-blue-600 text-white rounded-full",
                                        today: "text-blue-700 font-bold",
                                    }}
                                    className="text-center text-black"
                                />
                            </div>

                            {/* Time Dropdown */}
                            <div className="flex-1 bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col">
                                <div className="flex items-center gap-2 mb-4">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Select Time Slot</span>
                                </div>
                                <select
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all cursor-pointer"
                                >
                                    <option value="">-- Choose a time --</option>
                                    {TIME_SLOTS.map((slot) => (
                                        <option key={slot} value={slot}>{slot}</option>
                                    ))}
                                </select>

                                {selected && selectedTime && (
                                    <div className="mt-6 p-4 bg-blue-600 text-white rounded-2xl text-sm">
                                        <p className="text-xs font-bold uppercase tracking-widest text-blue-200 mb-1">Your Appointment</p>
                                        <p className="font-bold">{selected.toLocaleDateString("en-GB", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                                        <p className="text-blue-100">{selectedTime}</p>
                                    </div>
                                )}
                            </div>

                            {/* Image */}
                            <div className="hidden lg:block w-56 flex-shrink-0">
                                <img
                                    src="/assets/homepageAssets/bookAppointment.png"
                                    alt="Book appointment illustration"
                                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={onClose}
                                className="px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all font-semibold text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleBooking}
                                disabled={fetcher.state !== "idle"}
                                className="px-8 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:bg-blue-300 text-sm flex items-center gap-2"
                            >
                                {fetcher.state !== "idle" ? "Booking..." : "Confirm Appointment"}
                            </button>
                        </div>
                    </div>
                )}
                </div> {/* end scrollable body */}
            </div>

            <style>{`
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  @keyframes scaleIn { from { transform: scale(0.95); opacity: 0 } to { transform: scale(1); opacity: 1 } }
  .animate-fadeIn { animation: fadeIn 0.25s ease-out }
  .animate-scaleIn { animation: scaleIn 0.25s ease-out }
`}</style>
        </div>
    );
}
