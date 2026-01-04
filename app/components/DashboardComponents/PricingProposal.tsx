import React from "react";
import { DollarSign } from "lucide-react";

interface PricingRow {
  phase: string;
  components: string;
  range: string;
  justification: string;
}

interface PricingStructureProps {
  clientName: string;
  projectName: string;
  pricingData: PricingRow[];
}

export default function PricingStructure({
  clientName,
  projectName,
  pricingData,
}: PricingStructureProps) {
  return (
    <section className="bg-white shadow-xl rounded-2xl p-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-emerald-100 via-sky-100 to-rose-100 rounded-2xl" />

      <div className="relative z-10 space-y-6">
        <div className="flex items-center gap-3 mb-4">
          <DollarSign className="w-8 h-8 text-amber-600" />
          <h2 className="text-3xl font-bold text-gray-900">Commercial Framework</h2>
        </div>

        <p className="text-gray-700 leading-relaxed">
          In alignment with the proposed phased approach and the unique requirements of{" "}
          <strong>{clientName}</strong>, we have developed a structured investment model
          for the <strong>{projectName}</strong> engagement. This model has been carefully
          designed to ensure:
          <li><strong>Value optimization</strong> – aligning costs with tangible business impact</li>
          <li><strong>Transparency</strong> – providing clarity on each component of the engagement</li>
          <li><strong>Flexibility</strong> – accommodating evolving client priorities across phases</li>
          <li><strong>Trust-building</strong> – reinforcing a long-term partnership orientation</li>
          <br />
          The recommended framework is outlined below:
        </p>

        {/* Pricing Table */}
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border border-gray-200 rounded-xl overflow-hidden text-sm">
            <thead className="bg-gradient-to-r from-amber-100 to-sky-100">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b">
                  Phased Approach
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b">
                  Service Components
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b">
                  Pricing Range
                </th>
                <th className="px-4 py-3 text-left font-semibold text-gray-800 border-b">
                  Justification
                </th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {pricingData.map((row, idx) => (
                <tr
                  key={idx}
                  className={
                    idx % 3 === 0
                      ? "hover:bg-amber-50"
                      : idx % 3 === 1
                      ? "hover:bg-sky-50"
                      : "hover:bg-emerald-50"
                  }
                >
                  <td className="px-4 py-3 border-b">{row.phase}</td>
                  <td className="px-4 py-3 border-b">{row.components}</td>
                  <td className="px-4 py-3 border-b">{row.range}</td>
                  <td className="px-4 py-3 border-b">{row.justification}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
