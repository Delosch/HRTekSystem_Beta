import { DollarSign, Eye, TrendingDown, LineChart } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q13: Visibility into HR tech TCO
const tcoVisibilityData = [
  { level: "No visibility", value: 15, fill: "#ef4444" },
  { level: "License only", value: 45, fill: "#f59e0b" },
  { level: "Partial TCO", value: 25, fill: "#3b82f6" },
  { level: "Full TCO", value: 10, fill: "#10b981" },
  { level: "ROI tracked", value: 5, fill: "#059669" },
];

// Q14: HR cost leakage due to inefficiencies
const costLeakageData = [
  { name: "Unknown", value: 20, color: "#94a3b8" },
  { name: "Very high", value: 35, color: "#ef4444" },
  { name: "High", value: 25, color: "#f59e0b" },
  { name: "Moderate", value: 15, color: "#3b82f6" },
  { name: "Minimal", value: 5, color: "#10b981" },
];

// Q15: ROI tracking of HR tech investments
const roiTrackingData = [
  { stage: "Not tracked", score: 30 },
  { stage: "Anecdotal", score: 40 },
  { stage: "Periodic", score: 15 },
  { stage: "KPI-based", score: 10 },
  { stage: "Value-realization engine", score: 5 },
];

export function Section4CostROI({ dimScore }: { dimScore?: number }) {
  return (
    <SectionCard score={dimScore}
      icon={DollarSign}
      title="4️⃣ Cost, ROI & Economic Leakage"
      description="Financial diagnostics covering Total Cost of Ownership (TCO) visibility, inefficiency cost leakage, and ROI tracking maturity."
    >
      <div className="space-y-8">
        
        {/* Q13: Visibility into HR tech TCO */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Eye className="w-4 h-4 text-slate-500" />
            Visibility into HR Tech TCO (Total Cost of Ownership)
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Most of the organization (45%) only tracks "License only" costs. 15% has "No visibility".
            <br/><br/>
            <strong>What is the problem:</strong> Hidden costs (maintenance, integration, manual workarounds) are not factored into HR budgets, making the stack look cheaper than it actually is.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={tcoVisibilityData} margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="level" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                {tcoVisibilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Q14: HR Cost Leakage */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-slate-500" />
            HR Cost Leakage Due to Inefficiencies
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Cost leakage is predominantly "Very high" (35%) or "High" (25%), with a significant 20% being completely "Unknown".
            <br/><br/>
            <strong>What is the fix for it:</strong> Consolidate overlapping point solutions and automate manual data-entry processes to stem the leakage.
          </p>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={costLeakageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {costLeakageData.map((entry, index) => (
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
              {costLeakageData.map((item) => (
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

        {/* Q15: ROI Tracking */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <LineChart className="w-4 h-4 text-slate-500" />
            ROI Tracking of HR Tech Investments
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> 70% of tracking is either "Not tracked" or merely "Anecdotal".
            <br/><br/>
            <strong>What is the problem:</strong> Without a continuous value-realization engine, HR struggles to justify budget requests for future technological upgrades.
          </p>
          <div className="space-y-4">
            {roiTrackingData.map((item) => (
              <div key={item.stage}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-medium">{item.stage}</span>
                  <span className="text-slate-500">{item.score}% volume</span>
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
          title="Critical Financial Leakage Detected"
          description="The combination of 'License only' TCO visibility and 'Anecdotal' ROI tracking is masking an estimated $1.8M in annual economic leakage due to manual inefficiencies and redundant software licenses. Moving to a 'Value-realization engine' is recommended before any new vendor procurement."
        />
      </div>
    </SectionCard>
  );
}
