import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp } from 'lucide-react';

interface Question {
  id: string;
  title?: string;
  question: string;
  type: string;
  options?: string[];
}

interface SectionInsightsProps {
  questions: Question[];
  formData: Record<string, any>;
  sectionName: string;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#10b981'];
const LABELS = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];

function hasAnswer(value: any): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string') return value.trim() !== '';
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') return Object.keys(value).length > 0;
  return true;
}

function findSelectedIndex(question: Question, value: any): number {
  const options = question.options || [];
  if (typeof value !== 'string' || options.length === 0) return -1;

  const normalized = value.trim().toLowerCase();
  return options.findIndex((opt) => opt.trim().toLowerCase() === normalized);
}

export default function SectionInsights({ questions, formData, sectionName }: SectionInsightsProps) {
  // Calculate metrics
  const answeredQuestions = questions.filter((q) => hasAnswer(formData[q.id]));

  const totalAnswered = answeredQuestions.length;
  const completionPercent = questions.length > 0 ? Math.round((totalAnswered / questions.length) * 100) : 0;

  // Prepare bar chart data
  const barData = questions.map((q, index) => {
    const value = formData[q.id];
    const selectedIndex = findSelectedIndex(q, value);
    const score = selectedIndex >= 0 ? selectedIndex + 1 : 0;

    return {
      name: `Q${index + 1}`,
      value: score,
      color: score > 0 ? COLORS[Math.min(selectedIndex, COLORS.length - 1)] : '#e5e7eb'
    };
  });

  // Prepare distribution data for pie chart
  const distribution = [0, 0, 0, 0, 0];
  answeredQuestions.forEach((q) => {
    const selectedIndex = findSelectedIndex(q, formData[q.id]);
    if (selectedIndex >= 0 && selectedIndex < distribution.length) {
      distribution[selectedIndex]++;
    }
  });

  let achieved = 0;
  let possible = 0;
  answeredQuestions.forEach((q) => {
    const selectedIndex = findSelectedIndex(q, formData[q.id]);
    if (selectedIndex < 0) return;
    achieved += selectedIndex;
    possible += Math.max(1, (q.options?.length || 1) - 1);
  });
  const performancePercent = possible > 0 ? Math.round((achieved / possible) * 100) : 0;

  const pieData = distribution
    .map((count, i) => ({
      name: LABELS[i],
      value: count,
      color: COLORS[i]
    }))
    .filter(d => d.value > 0);

  if (totalAnswered === 0) {
    return null;
  }

  return (
    <div className="mt-12 space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-indigo-600" />
          Section Insights
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="px-3 py-1 bg-indigo-50 rounded-full text-indigo-700 font-medium">
            Performance: {performancePercent}%
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-slate-600">Completion:</span>
            <span className="font-bold text-indigo-600">{completionPercent}%</span>
          </div>
          <div className="px-3 py-1 bg-indigo-50 rounded-full text-indigo-700 font-medium">
            {totalAnswered}/{questions.length} Questions
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Bar Chart: Question Responses */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h4 className="text-sm font-semibold text-slate-700 mb-4">Question-Level Selection</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar dataKey="value" fill="#6366f1" radius={[8, 8, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-xs text-slate-500 mt-3">Selected option score per question</p>
        </div>

        {/* Pie Chart: Response Distribution */}
        {pieData.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h4 className="text-sm font-semibold text-slate-700 mb-4">Distribution Spread</h4>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              Distribution of responses across categories
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 rounded-xl p-6 border border-indigo-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-slate-600 mb-1">Questions Answered</p>
            <p className="text-2xl font-bold text-indigo-600">{totalAnswered}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Completion Rate</p>
            <p className="text-2xl font-bold text-indigo-600">{completionPercent}%</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Remaining</p>
            <p className="text-2xl font-bold text-slate-600">{questions.length - totalAnswered}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
