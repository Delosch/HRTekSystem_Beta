import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Question } from '../data/diagnosticData';

interface DimensionChartsProps {
  questions: Question[];
  answers: Record<number, number>;
}

const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']; // Red to Blue

export const DimensionCharts: React.FC<DimensionChartsProps> = ({ questions, answers }) => {
  // 1. Prepare Bar Chart Data (Question Level Scores)
  // We assume options index 0 = Score 1, index 4 = Score 5
  const barData = questions.map((q, index) => ({
    name: `Q${index + 1}`,
    fullText: q.text,
    score: (answers[q.id] !== undefined ? answers[q.id] + 1 : 0), // Convert 0-index to 1-5 score
  }));

  // 2. Prepare Pie Chart Data (Maturity Distribution)
  const distribution = [0, 0, 0, 0, 0]; // Counts for scores 1, 2, 3, 4, 5
  questions.forEach((q) => {
    const val = answers[q.id];
    if (val !== undefined) {
      // val is 0-4 index, so it maps to distribution[val]
      distribution[val]++;
    }
  });

  const pieData = distribution
    .map((count, index) => ({
      name: ['Ad-hoc', 'Developing', 'Defined', 'Managed', 'Optimized'][index],
      value: count,
      score: index + 1,
    }))
    .filter((d) => d.value > 0);

  // Calculate Section Score
  const totalScore = barData.reduce((acc, curr) => acc + curr.score, 0);
  const maxScore = questions.length * 5;
  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;

  // Don't render if no answers yet
  const hasAnswers = Object.keys(answers).length > 0;
  if (!hasAnswers) return null;

  return (
    <div className="mt-8 border-t border-slate-100 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-slate-800">Section Insights</h4>
        <div className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium border border-indigo-100">
          Performance: {percentage}%
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* BAR CHART: Question Level Scores */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h5 className="text-sm text-slate-500 mb-4 font-medium">Question-Level Scores</h5>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <YAxis 
                  domain={[0, 5]} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12 }} 
                />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-800 text-white text-xs p-2 rounded shadow-lg max-w-[200px]">
                          <p className="font-semibold mb-1">{data.name}: Score {data.score}</p>
                          <p className="text-slate-300">{data.fullText}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.score === 0 ? '#e2e8f0' : entry.score < 3 ? '#fbbf24' : '#22c55e'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PIE CHART: Maturity Distribution */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <h5 className="text-sm text-slate-500 mb-4 font-medium">Maturity Distribution</h5>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.score - 1]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" iconType="circle" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
