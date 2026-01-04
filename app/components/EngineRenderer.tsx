import { useState } from "react";
import Questionnaire from "./Questionnaire"; // your current code refactored into here
import type { ProfilingSteps } from "~/types/profilingAssessment";

export default function EngineRenderer({
  data,
  engineName
}: {
  data: ProfilingSteps;
  engineName: string;
}) {
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white bg-gradient-to-br from-indigo-950 via-gray-900 to-indigo-950">
        <h1 className="text-3xl font-bold mb-4">{engineName} Assessment</h1>
        <p className="text-gray-300 mb-8 max-w-md text-center">
          Welcome! This is a brief assessment to help us understand your preferences.
        </p>
        <button
          onClick={() => setStarted(true)}
          className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-semibold"
        >
          Get Started
        </button>
      </div>
    );
  }

  return <Questionnaire data={data} />;
}
