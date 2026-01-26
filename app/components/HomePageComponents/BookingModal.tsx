import React, { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import TimeSelector from "./TimeSelector";
import { useFetcher } from "@remix-run/react";
import { toast } from "react-toastify";

interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    engineName: string;
    user?: any;
}

export default function BookingModal({ isOpen, onClose, engineName, user }: BookingModalProps) {
    const [selected, setSelected] = useState<Date | undefined>(undefined);
    const [selectedTime, setSelectedTime] = useState("");

    const fetcher = useFetcher<{ success: boolean; message?: string; error?: string }>();

    useEffect(() => {
        if (fetcher.data?.success) {
            toast.success(fetcher.data.message || "Booking request sent!");
            onClose();
        } else if (fetcher.data?.error) {
            toast.error(fetcher.data.error);
        }
    }, [fetcher.data, onClose]);

    const handleBooking = () => {
        if (!selected || !selectedTime) {
            toast.error("Please select both a date and time");
            return;
        }

        const formData = new FormData();
        formData.append("date", selected.toLocaleDateString());
        formData.append("time", selectedTime);
        formData.append("engineName", engineName);

        if (!user) {
            const name = (document.getElementById("booking-name") as HTMLInputElement)?.value;
            const email = (document.getElementById("booking-email") as HTMLInputElement)?.value;
            if (!name || !email) {
                toast.error("Please provide your name and email");
                return;
            }
            formData.append("name", name);
            formData.append("email", email);
        }

        fetcher.submit(formData, { method: "post", action: "/api/book-consultant" });
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4"
            onClick={onClose}
        >
            <div
                className="bg-white w-full max-w-5xl max-h-[95vh] overflow-y-auto rounded-3xl shadow-2xl relative p-6 md:p-12 animate-scaleIn no-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 hover:scale-110 transition-all font-bold text-2xl p-2"
                    aria-label="Close"
                >
                    ✕
                </button>

                {/* Modal Content */}
                <div>
                    <h2 className="text-blue-600 text-3xl font-extrabold mb-4">
                        Ready to Transform Your HR Strategy?
                    </h2>
                    <p className="text-gray-700 leading-relaxed mb-8">
                        If you're interested in learning more about how our solutions can help your
                        organization—or if you'd like expert guidance tailored to your HR goals—
                        <br />
                        <span className="font-semibold text-black">
                            Select a convenient date and time
                        </span>{" "}
                        below, and take the next step toward building a future-ready HR Architecture.
                    </p>

                    {/* Form for non-logged in users */}
                    {!user && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div>
                                <label htmlFor="booking-name" className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                                <input id="booking-name" type="text" placeholder="John Doe" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black" />
                            </div>
                            <div>
                                <label htmlFor="booking-email" className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                                <input id="booking-email" type="email" placeholder="john@example.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all text-black" />
                            </div>
                        </div>
                    )}

                    {/* Calendar and Time Slots */}
                    <div className="flex flex-col lg:flex-row gap-8 mb-8">
                        {/* Calendar */}
                        <div className="flex-1 bg-white rounded-xl shadow-md p-4 flex justify-center">
                            <DayPicker
                                mode="single"
                                selected={selected}
                                onSelect={setSelected}
                                fromDate={new Date()}
                                disabled={{ before: new Date() }}
                                modifiersClassNames={{
                                    selected: "bg-blue-600 text-white rounded-full",
                                    today: "text-blue-700 font-bold",
                                }}
                                className="text-center text-black"
                            />
                        </div>

                        {/* Time Slots */}
                        <div className="flex-1 bg-white rounded-xl shadow-md p-4">
                            <TimeSelector onSelect={(time) => setSelectedTime(time)} />
                        </div>

                        {/* Image */}
                        <div className="hidden lg:block flex-2">
                            <img
                                src="/assets/homepageAssets/bookAppointment.png"
                                alt="Client booking appointment illustration"
                                className="w-full h-full object-cover rounded-xl shadow-lg"
                            />
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all font-semibold"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleBooking}
                            disabled={fetcher.state !== "idle"}
                            className="px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95 disabled:bg-blue-300 flex items-center gap-2"
                        >
                            {fetcher.state !== "idle" ? "Booking..." : "Book Appointment"}
                        </button>
                    </div>
                </div>
            </div>
            <style>
                {`
  .no-scrollbar::-webkit-scrollbar {
    display: none;
  }
  .no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  @keyframes fadeIn {
    from { opacity: 0 }
    to { opacity: 1 }
  }
  @keyframes scaleIn {
    from { transform: scale(0.95); opacity: 0 }
    to { transform: scale(1); opacity: 1 }
  }
  .animate-fadeIn { animation: fadeIn 0.25s ease-out }
  .animate-scaleIn { animation: scaleIn 0.25s ease-out }
`}
            </style>
        </div>
    );
}
