import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";


const RADAR_COLORS: Record<string, string> = {
  High: "#3cb371", // Green
  Medium: "#f4c430", // Yellow
  Low: "#ffa500", // Orange
  Critical: "#ff4500", // Red
};

interface RadarChartCardProps {
  data: {
    subject: string;
    A: number;
    fullMark: number;
    category: keyof typeof RADAR_COLORS;
  }[];
  title?: string;
  className?: string;
}

export function RadarChartCard({ data, title = "Maturity Score", className }: RadarChartCardProps) {
  const improvementAreas = data.filter(
    (item) => item.category === "Low" || item.category === "Critical"
  );

  const fallbackAreas = data.filter(
    (item) => item.category === "Medium"
  );

  let recommendationText;

  if (improvementAreas.length > 0) {
    recommendationText = (
      <>
        <strong>Areas for Improvement:</strong> {improvementAreas.map((item) => item.subject).join(", ")}
      </>
    );
  } else if (fallbackAreas.length > 0) {
    recommendationText = (
      <>
        <strong>Focus Areas:</strong> {fallbackAreas.map((item) => item.subject).join(", ")}
      </>
    );
  } else {
    recommendationText = (
      <>While your current modules perform well, optimizing intermediate processes can unlock even greater efficiency and future scalability.</>
    );
  }

  return (
    <div className={`rounded-2xl bg-white p-6 shadow-sm ${className ?? ""}`}>
      <h2 className="text-xl font-semibold text-[#0c1a4b]">{title}</h2>
      <div className="flex justify-center items-center">
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fill: '#0c1a4b', fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} />
            <Radar
              name="Maturity"
              dataKey="A"
              stroke="#3b82f6"
              fill="#3b82f6"
              fillOpacity={0.3}
            />
            {data.map((entry, index) => (
              <circle
                key={`dot-${index}`}
                cx={
                  200 +
                  120 *
                    Math.cos(
                      (2 * Math.PI * index) / data.length - Math.PI / 2
                    ) *
                    (entry.A / entry.fullMark)
                }
                cy={
                  200 +
                  120 *
                    Math.sin(
                      (2 * Math.PI * index) / data.length - Math.PI / 2
                    ) *
                    (entry.A / entry.fullMark)
                }
                r={6}
                fill={RADAR_COLORS[entry.category]}
                stroke="#fff"
                strokeWidth={2}
              />
            ))}
          </RadarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-6 text-sm text-[#0c1a4b] text-center px-4">
        {recommendationText}
      </div>
    </div>
  );
}
