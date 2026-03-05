import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { Activity, Brain, ArrowRight, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';

interface DomainChartsProps {
  questions: any[];
  answers: Record<number, number>;
  domainId?: number;
  domainWeight?: number;
  domainName?: string;
}

// Score → colour (1-5 scale)
const scoreColor = (v: number) =>
  v >= 5 ? '#10b981' : v >= 4 ? '#3b82f6' : v >= 3 ? '#f59e0b' : v >= 2 ? '#f97316' : v >= 1 ? '#ef4444' : '#e2e8f0';

const MATURITY_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#3b82f6', '#10b981'];
const MATURITY_LABELS = ['Ad-hoc', 'Developing', 'Defined', 'Managed', 'Optimized'];

export function DomainCharts({ questions, answers, domainWeight }: DomainChartsProps) {
  const barData = questions.map((q, index) => ({
    name: `Q${index + 1}`,
    val: answers[q.id] || 0,
    color: scoreColor(answers[q.id] || 0),
  }));

  const distribution = [0, 0, 0, 0, 0];
  questions.forEach(q => {
    const s = answers[q.id];
    if (s >= 1 && s <= 5) distribution[s - 1]++;
  });

  const pieData = distribution.map((count, i) => ({
    name: MATURITY_LABELS[i], val: count, color: MATURITY_COLORS[i],
  })).filter(d => d.val > 0);

  const totalScore = barData.reduce((acc, d) => acc + d.val, 0);
  const answeredQs = questions.filter(q => answers[q.id] > 0);
  const performance = Math.round((totalScore / (questions.length * 5)) * 100) || 0;
  const indexScore = answeredQs.length > 0
    ? (answeredQs.reduce((s, q) => s + answers[q.id], 0) / answeredQs.length).toFixed(1)
    : '—';

  const weightPercent = domainWeight ? Math.round(domainWeight * 100) : null;

  // ── Diagnostic values ──────────────────────────────────────────────────
  const riskLevel = performance >= 70 ? 'Low' : performance >= 50 ? 'Medium' : performance >= 30 ? 'High' : 'Critical';
  const maturityBand = performance >= 80 ? 'Optimized' : performance >= 60 ? 'Managed' : performance >= 40 ? 'Defined' : performance > 0 ? 'Developing' : 'Ad-hoc';

  const topQ = answeredQs.length > 0 ? answeredQs.reduce((b, q) => answers[q.id] > answers[b.id] ? q : b) : null;
  const gapQ = answeredQs.length > 0 ? answeredQs.reduce((w, q) => answers[q.id] < answers[w.id] ? q : w) : null;
  const hasGap = gapQ !== null && answers[gapQ.id] <= 3;

  const strongCount = questions.filter(q => answers[q.id] >= 4).length;
  const gapCount = questions.filter(q => answers[q.id] > 0 && answers[q.id] <= 2).length;

  // Band pip thresholds
  const bandThresholds = [0, 20, 40, 60, 80];

  return (
    <div className="mt-12 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-cyan-600 text-white rounded-2xl shadow-lg shadow-blue-200">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] block mb-0.5">Domain Analysis</span>
            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter italic">Section Insights</h4>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {weightPercent !== null && (
            <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border bg-cyan-50 text-cyan-700 border-cyan-100">
              SSTI Weight: {weightPercent}%
            </span>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Live Audit</span>
          </div>
          <span className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg text-white ${
            performance >= 70 ? 'bg-emerald-600 shadow-emerald-200'
            : performance >= 50 ? 'bg-blue-600 shadow-blue-200'
            : performance >= 30 ? 'bg-amber-500 shadow-amber-200'
            : 'bg-red-600 shadow-red-200'
          }`}>
            Performance: {performance}%
          </span>
        </div>
      </div>

      {/* ── Row 1: Core Metrics (Multicolour) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Card 1 — Domain Index (Blue-Cyan gradient) */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-xl shadow-blue-200">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-20 h-20" />
          </div>
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest block mb-2">Domain Index</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-5xl font-black italic tracking-tighter">{indexScore}</span>
            {answeredQs.length > 0 && <span className="text-lg font-bold text-white/40">/5.0</span>}
          </div>
          <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${performance}%` }} />
          </div>
          <p className="mt-2 text-[9px] font-black text-white/50 uppercase tracking-widest">
            {answeredQs.length}/{questions.length} questions answered
          </p>
        </div>

        {/* Card 2 — Maturity Band (colour-coded per tier) */}
        <div className={`relative overflow-hidden p-6 rounded-3xl text-white shadow-xl ${
          performance >= 80 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-200'
          : performance >= 60 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-200'
          : performance >= 40 ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-200'
          : performance > 0  ? 'bg-gradient-to-br from-red-500  to-rose-600  shadow-red-200'
                             : 'bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-200'
        }`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp className="w-20 h-20" />
          </div>
          <span className="text-[9px] font-black text-white/60 uppercase tracking-widest block mb-2">Maturity Band</span>
          <span className="text-4xl font-black italic tracking-tighter block">{maturityBand}</span>
          <div className="mt-4 flex gap-1.5">
            {bandThresholds.map((threshold, i) => {
              const nextThreshold = bandThresholds[i + 1] ?? 101;
              const isActive = performance >= threshold && performance < nextThreshold;
              const isPast = performance >= nextThreshold;
              return <div key={i} className={`flex-1 h-1.5 rounded-full ${isActive ? 'bg-white' : isPast ? 'bg-white/60' : 'bg-white/20'}`} />;
            })}
          </div>
          <p className="mt-2 text-[9px] font-black text-white/50 uppercase tracking-widest">
            Ad-hoc → Developing → Defined → Managed → Optimized
          </p>
        </div>

        {/* Card 3 — Section Health (Dark slate) */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-xl shadow-slate-300">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-20 h-20" />
          </div>
          <span className="text-[9px] font-black text-white/40 uppercase tracking-widest block mb-2">Section Health</span>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black italic tracking-tighter">{performance}%</span>
            <Activity className={`w-5 h-5 mb-1 ${performance >= 70 ? 'text-emerald-400' : performance >= 40 ? 'text-amber-400' : 'text-red-400'}`} />
          </div>
          {answeredQs.length > 0 && (
            <div className="mt-4 flex gap-2">
              <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[9px] font-black uppercase rounded-lg">{strongCount} Optimized</span>
              <span className="px-2 py-1 bg-red-500/20 text-red-400 text-[9px] font-black uppercase rounded-lg">{gapCount} Gaps</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Diagnostic Metrics ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Risk Level */}
        <div className={`relative overflow-hidden p-6 rounded-3xl text-white shadow-lg ${
          riskLevel === 'Low'      ? 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-emerald-200'
          : riskLevel === 'Medium' ? 'bg-gradient-to-br from-amber-500 to-yellow-600 shadow-amber-200'
          : riskLevel === 'High'   ? 'bg-gradient-to-br from-orange-500 to-red-600 shadow-orange-200'
                                   : 'bg-gradient-to-br from-red-600 to-rose-700 shadow-red-300'
        }`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <AlertTriangle className="w-20 h-20" />
          </div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle className="w-3.5 h-3.5 text-white/60" />
            <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Risk Level</span>
          </div>
          <span className="text-4xl font-black italic tracking-tighter block">{riskLevel}</span>
          <p className="text-[9px] font-black text-white/60 mt-3 uppercase tracking-widest">
            {riskLevel === 'Low'      ? 'On track — maintain' :
             riskLevel === 'Medium'   ? 'Monitor closely' :
             riskLevel === 'High'     ? 'Intervention recommended' :
                                       'Immediate action required'}
          </p>
        </div>

        {/* Top Strength */}
        <div className="p-6 bg-white rounded-3xl border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <TrendingUp className="w-16 h-16 text-emerald-600" />
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="p-1 bg-emerald-100 rounded-lg">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Top Strength</span>
          </div>
          {topQ ? (
            <>
              <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{topQ.text}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-5 h-2 rounded-full ${i <= answers[topQ.id] ? 'bg-emerald-500' : 'bg-slate-100'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-black text-emerald-600">{answers[topQ.id]}/5</span>
              </div>
            </>
          ) : (
            <span className="text-slate-300 text-sm italic">Answer questions to reveal</span>
          )}
        </div>

        {/* Key Gap */}
        <div className="p-6 bg-white rounded-3xl border border-red-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-5">
            <TrendingDown className="w-16 h-16 text-red-500" />
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <div className="p-1 bg-red-100 rounded-lg">
              <TrendingDown className="w-3 h-3 text-red-500" />
            </div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Key Gap</span>
          </div>
          {hasGap ? (
            <>
              <p className="text-sm font-bold text-slate-800 leading-snug line-clamp-2">{gapQ!.text}</p>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className={`w-5 h-2 rounded-full ${i <= answers[gapQ!.id] ? 'bg-red-400' : 'bg-slate-100'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-black text-red-600">{answers[gapQ!.id]}/5</span>
              </div>
            </>
          ) : (
            <span className="text-slate-300 text-sm italic">
              {answeredQs.length > 0 ? 'No critical gaps detected' : 'Answer questions to reveal'}
            </span>
          )}
        </div>
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question-Level Scores</span>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={`w-1 h-3 rounded-full ${performance > i * 20 ? 'bg-blue-500' : 'bg-slate-100'}`} />
              ))}
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 10, left: -30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <YAxis axisLine={false} tickLine={false} domain={[0, 5]} ticks={[0, 2.5, 5]} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} />
                <Bar dataKey="val" radius={[6, 6, 0, 0]} barSize={36}>
                  {barData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Maturity Distribution</span>
            <span className="text-[8px] font-black text-slate-400 uppercase border border-slate-200 rounded-full px-3 py-1">Live Audit</span>
          </div>
          <div className="h-64 w-full flex flex-col items-center">
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} innerRadius={65} outerRadius={90} paddingAngle={4} dataKey="val" stroke="none" startAngle={90} endAngle={-270}>
                      {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.08)' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-3 mt-2">
                  {pieData.map((item, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[8px] font-bold text-slate-500 uppercase">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                <Activity className="w-8 h-8 text-slate-300 mb-2" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Distribution pending</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:gap-3 transition-all">
        <ArrowRight className="w-3 h-3" /> Full Domain Strategy
      </button>
    </div>
  );
}
