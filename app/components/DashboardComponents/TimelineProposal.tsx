import React from "react";
import { Clock } from "lucide-react";

interface TimelinePhase {
  title: string; // e.g. "Week 1-2"
  color: "sky" | "amber" | "emerald" | "rose"; // to theme the card
  items: string[];
}

interface ProjectTimelineProps {
  engagementDuration: string;
  phases: string[];
  timelineData: TimelinePhase[];
}

export default function ProjectTimeline({
  engagementDuration,
  phases,
  timelineData,
}: ProjectTimelineProps) {
  return (
    <section className="bg-white shadow-xl rounded-2xl p-10 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-sky-100 via-rose-100 to-amber-100 rounded-2xl" />
      <div className="relative z-10 space-y-8">
        {/* Heading */}
        <div className="flex items-center gap-3 mb-4">
          <Clock className="w-8 h-8 text-rose-600" />
          <h2 className="text-3xl font-bold text-gray-900">
            Project Timelines
          </h2>
        </div>

        {/* Subheading */}
        <p className="text-lg font-medium text-gray-700">
          Engagement Duration:{" "}
          <span className="font-semibold">{engagementDuration}</span>
          <br />
          Phases:{" "}
          <span className="text-rose-700 font-semibold">
            {phases.join(" ➝ ")}
          </span>
        </p>

        {/* Timeline Boxes */}
       <div className="flex flex-col md:flex-row justify-center gap-8 mt-6 flex-wrap">
  {timelineData.map((phase, idx) => (
    <div
      key={idx}
      className="rounded-2xl p-6 w-72 shadow hover:shadow-lg transition relative"
      style={{
        backgroundColor: `${phase.color}20`, // 20 = light opacity (like Tailwind -50)
        border: `1px solid ${phase.color}40`, // lighter border
      }}
    >
      <h3
        className="text-xl font-bold mb-3"
        style={{ color: phase.color }}
      >
        {phase.title}
      </h3>
      <ul className="list-disc list-outside pl-5 text-gray-700 space-y-2">
        {phase.items.map((item, itemIdx) => (
          <li key={itemIdx} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  ))}
</div>

      </div>
    </section>
  );
}
