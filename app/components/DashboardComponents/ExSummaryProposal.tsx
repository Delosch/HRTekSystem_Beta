import React from "react";
import { FileText } from "lucide-react";

interface ExecutiveSummaryProps {
  clientName: string;
  priorities: string[];
  outcomes: string[];
  objectives: string[];
  constraints: string[];
}

export default function ExecutiveSummary({
  clientName,
  priorities,
  outcomes,
  objectives,
  constraints,
}: ExecutiveSummaryProps) {
  return (
    <section className="bg-white shadow-xl rounded-2xl p-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-rose-100 via-amber-100 to-sky-100 rounded-2xl" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-8 h-8 text-emerald-600" />
          <h2 className="text-3xl font-bold text-gray-900">Executive Summary</h2>
        </div>

        <p className="text-gray-700 leading-relaxed">
          This proposal outlines a comprehensive solution designed to address your
          business challenges and unlock new opportunities for growth. By combining
          innovative strategies, scalable technology, and industry expertise, we aim to
          deliver measurable value and long-term impact.
        </p>

        {/* 4 dynamic boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Priorities */}
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              1. {clientName} has articulated the need to pursue the following strategic priorities:
            </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {priorities.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Outcomes */}
          <div className="bg-rose-50 border border-rose-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-rose-800 mb-2">2. These priorities must be advanced while carefully managing the following operational considerations:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {constraints.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Secondary Objectives */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-emerald-800 mb-2">3. In parallel, the client has outlined additional enabling initiatives that are intended to strengthen capabilities and accelerate delivery, supported by targeted solutions and features:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {objectives.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Constraints */}
          <div className="bg-sky-50 border border-sky-100 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-sky-800 mb-2">4. Expected Outcomes </h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              {outcomes.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        
      </div>
    </section>
  );
}
