import React, { useState } from "react";

const timeSlots = {
  Morning: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
  Afternoon: ["12:00 PM", "12:30 PM", "1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM"],
};

export default function TimePicker() {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const reset = () => {
    setSelectedSession(null);
    setSelectedTime(null);
    setShowOptions(true);
  };

  return (
    <div className="flex flex-col items-start gap-4 p-4 border border-blue-600 rounded-md shadow-sm w-fit bg-white">
      {/* Select Time Button */}
      <button
        onClick={() => {
          if (selectedTime) {
            reset();
          } else {
            setShowOptions((prev) => !prev);
          }
        }}
        className="px-4 py-2 text-blue-700 font-semibold border-2 border-blue-300 rounded hover:bg-blue-100"
      >
        {selectedTime ? "Change Time" : "Select Time"}
      </button>

      {/* Show session options if time not selected */}
      {showOptions && !selectedTime && (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => setSelectedSession("Morning")}
            className={`px-4 py-2 rounded border text-black ${selectedSession === "Morning" ? "border-blue-400 text-blue-600" : "bg-gray-100"}`}
          >
            Morning
          </button>
          <button
            onClick={() => setSelectedSession("Afternoon")}
            className={`px-4 py-2 rounded border text-black ${selectedSession === "Afternoon" ? "border-blue-400 text-blue-600" : "bg-gray-100"}`}
          >
            Afternoon
          </button>
        </div>
      )}

      {/* Show time options once session is selected and time not yet picked */}
      {showOptions && selectedSession && !selectedTime && (
        <div className="grid grid-cols-2 gap-2">
          {timeSlots[selectedSession].map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className="border text-black px-4 py-2 rounded hover:bg-gray-100"
            >
              {time}
            </button>
          ))}
        </div>
      )}

      {/* Show selected time after picking */}
      {selectedTime && (
        <div className="text-gray-800 font-medium">
          <div>{selectedSession}</div>
          <div className="text-xl font-semibold">{selectedTime}</div>
        </div>
      )}
    </div>
  );
}
