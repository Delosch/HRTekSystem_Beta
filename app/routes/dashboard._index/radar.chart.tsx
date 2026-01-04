import { Legend, PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { RadarChartData } from "../v2.$id/schemas";

export const DynamicRadarChart = ({ data }: { data: RadarChartData }) => {
  if (!data || !data.labels || !Array.isArray(data.labels)) {
    return <div className="text-center py-8 text-gray-500">Radar chart data loading...</div>;
  }

  const radarData = data.labels.map((label: string, index: number) => ({
    subject: label.split(' ')[0], // Shortened for display
    current: data.current_scores?.[index] || 0,
    benchmark: data.industry_benchmarks?.[index] || 0,
    target: data.target_scores?.[index] || 0,
    fullMark: 5,
  }));
  const improvementAreas = data.labels.filter((label: string, index: number) =>
    (data.current_scores?.[index] || 0) < (data.industry_benchmarks?.[index] || 0)
  );
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
      <div className="bg-white rounded-xl p-6 shadow overflow-visible flex flex-col justify-between h-full">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-[#1F2A5A]">Maturity Score</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="#e0e0e0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#666', fontSize: 12 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 5]}
                  tick={{ fill: '#666', fontSize: 10 }}
                  axisLine={false}
                />
                <Radar
                  name="Target"
                  dataKey="target"
                  stroke={data.colors?.target?.replace('0.6', '1') || '#ffc658'}
                  fill={data.colors?.target || 'rgba(75, 192, 192, 0.6)'}
                  strokeWidth={2}
                />
                <Radar
                  name="Benchmark"
                  dataKey="benchmark"
                  stroke={data.colors?.benchmark?.replace('0.6', '1') || '#82ca9d'}
                  fill={data.colors?.benchmark || 'rgba(255, 99, 132, 0.6)'}
                  strokeWidth={2}
                />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke={data.colors?.current?.replace('0.6', '1') || '#8884d8'}
                  fill={data.colors?.current || 'rgba(54, 162, 235, 0.6)'}
                  strokeWidth={2}
                />
                <Tooltip />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-md font-semibold text-[#1F2A5A] mb-2">Areas of Improvement</h4>
          <ul className="list-disc list-inside space-y-2">
            {improvementAreas.map((area: string, index: number) => {
              const areaIndex = data.labels.indexOf(area);
              const currentScore = data.current_scores?.[areaIndex] || 0;
              const benchmarkScore = data.industry_benchmarks?.[areaIndex] || 0;
              

              return (
                <li key={index} className="text-sm text-red-800 flex justify-between items-center">
                  <span className="font-medium">{area}</span>
                  
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      </div>

      );
};


