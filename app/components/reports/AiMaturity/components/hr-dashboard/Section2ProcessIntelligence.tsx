import { Activity, GitMerge, Clock, Search } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q5: HR processes visibility across lifecycle [cite: 59]
const visibilityData = [
  { stage: "No visibility", value: 10, fill: "#cbd5e1" }, // [cite: 63]
  { stage: "Step-based", value: 40, fill: "#94a3b8" }, // [cite: 64]
  { stage: "SLA-based", value: 30, fill: "#60a5fa" }, // [cite: 65]
  { stage: "Flow-based", value: 15, fill: "#3b82f6" }, // [cite: 66]
  { stage: "Value-stream based", value: 5, fill: "#1e3a8a" }, // [cite: 68]
];

// Q6: Process handoffs across functions cause [cite: 69]
const handoffData = [
  { name: "Frequent breakdowns", value: 25, color: "#ef4444" }, // [cite: 70]
  { name: "Delays", value: 35, color: "#f59e0b" }, // [cite: 72]
  { name: "Rework", value: 20, color: "#8b5cf6" }, // [cite: 74]
  { name: "Minor friction", value: 15, color: "#3b82f6" }, // [cite: 75]
  { name: "Seamless transitions", value: 5, color: "#10b981" }, // [cite: 76]
];

// Q8: Root cause analysis of HR issues is [cite: 85]
const rcaMaturity = [
  { level: "Not done", score: 10 }, // [cite: 86]
  { level: "Anecdotal", score: 40 }, // [cite: 90]
  { level: "Periodic", score: 30 }, // [cite: 91]
  { level: "Systematic", score: 15 }, // [cite: 92]
  { level: "AI-assisted", score: 5 }, // [cite: 93]
];

export function Section2ProcessIntelligence({ dimScore }: { dimScore?: number }) {
  return (
    <SectionCard score={dimScore}
      icon={Activity}
      title="2️⃣ Process Intelligence & Friction Mapping"
      description="Analysis of process visibility, cross-functional handoff friction, cycle times, and root cause analysis maturity." // 
    >
      <div className="space-y-8">
        
        {/* Q5: Process Visibility */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />
            Process Visibility Across Lifecycle
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> The organization primarily operates with "Step-based" visibility (40%), lacking end-to-end insights.
            <br/><br/>
            <strong>What is the problem:</strong> Inability to see bottlenecks across the entire employee lifecycle leads to isolated fixes rather than systemic improvements.
          </p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={visibilityData} margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="stage" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                {visibilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Q6: Process Handoffs */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-slate-500" />
            Cross-Functional Handoff Friction
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Handoffs frequently cause "Delays" (35%) and "Frequent breakdowns" (25%). Only 5% are seamless.
            <br/><br/>
            <strong>What is the problem:</strong> Data silos between HR, IT, and Finance cause dropped tickets during onboarding and offboarding.
          </p>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={handoffData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {handoffData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  cursor={{ fill: 'transparent' }} 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-3">
              {handoffData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Q7: Average Cycle Time vs Benchmark */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Average HR Cycle Time
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Cycle times are currently "25-50% slower" than industry benchmarks.
            <br/><br/>
            <strong>What is the fix for it:</strong> Implement robotic process automation (RPA) for high-volume data entry tasks to reach baseline benchmarks within 6 months.
          </p>
          <div className="grid grid-cols-5 gap-2">
            {[">50% slower", "25-50% slower", "At benchmark", "10-25% faster", "Top quartile"].map((status, index) => { // [cite: 78, 79, 81, 83, 84]
              const isActive = status === "25-50% slower";
              return (
                <div 
                  key={status} 
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isActive ? "bg-amber-50 border-amber-300 shadow-sm" : "bg-white border-slate-200 opacity-60"
                  }`}
                >
                  <div className={`text-xs font-bold mb-1 ${isActive ? "text-amber-700" : "text-slate-500"}`}>
                    {status}
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Q8: Root Cause Analysis */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-500" />
            Root Cause Analysis Capability
          </h4>
          <div className="space-y-4 mt-4">
            {rcaMaturity.map((item) => (
              <div key={item.level}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-medium">{item.level}</span>
                  <span className="text-slate-500">{item.score}% distribution</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm bg-blue-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <AIInsight
          type="warning"
          title="Process Friction Alert"
          description="High handoff friction and slow cycle times indicate workflow fragmentation. Moving from 'Step-based' to 'Flow-based' process design could reduce cycle times by 35% and eliminate 80% of current handoff delays."
        />
      </div>
    </SectionCard>
  );
}
