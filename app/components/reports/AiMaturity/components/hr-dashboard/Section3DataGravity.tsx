import { Database, Clock, Filter, ShieldCheck, Link2 } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q9: Time taken to generate leadership HR insights
const insightTimeData = [
  { time: "Weeks", value: 15, fill: "#ef4444" },
  { time: "Days", value: 50, fill: "#f59e0b" }, // Current bottleneck
  { time: "Hours", value: 25, fill: "#3b82f6" },
  { time: "Near real-time", value: 8, fill: "#10b981" },
  { time: "Real-time", value: 2, fill: "#059669" },
];

// Q10: Number of manual interventions before data is usable
const manualInterventionsData = [
  { interventions: "5+", percentage: 20 },
  { interventions: "3-4", percentage: 45 },
  { interventions: "2", percentage: 25 },
  { interventions: "1", percentage: 8 },
  { interventions: "Zero", percentage: 2 },
];

// Q11: Confidence in HR data used for decisions
const confidenceData = [
  { level: "Very low", value: 10, color: "#ef4444" },
  { level: "Low", value: 25, color: "#f59e0b" },
  { level: "Moderate", value: 45, color: "#cbd5e1" }, // Slate
  { level: "High", value: 15, color: "#3b82f6" },
  { level: "Board-level confidence", value: 5, color: "#1e3a8a" },
];

// Q12: Ability to correlate HR data with business outcomes
const correlationData = [
  { ability: "Not possible", score: 15 },
  { ability: "Limited", score: 50 },
  { ability: "Moderate", score: 25 },
  { ability: "Strong", score: 8 },
  { ability: "Automated correlation", score: 2 },
];

export function Section3DataGravity({ dimScore }: { dimScore?: number }) {
  return (
    <SectionCard score={dimScore}
      icon={Database}
      title="3️⃣ Data Gravity & Decision Latency"
      description="Evaluation of data accessibility, manual processing overhead, data confidence, and business impact correlation."
    >
      <div className="space-y-8">
        
        {/* Q9: Insight Generation Time */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            Time Taken to Generate Leadership HR Insights
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> 50% of critical insights take "Days" to generate, and 15% take "Weeks".
            <br/><br/>
            <strong>What is the problem:</strong> High decision latency. By the time leadership receives the data, the operational context has often changed.
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={insightTimeData} layout="vertical" margin={{ left: 20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="time" type="category" width={100} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                {insightTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Q10: Manual Interventions */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-500" />
            Manual Interventions Before Data is Usable
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> 65% of reports require 3 or more manual interventions (data cleaning, merging in Excel, formatting).
            <br/><br/>
            <strong>What is the fix for it:</strong> Establish automated ETL pipelines to feed a centralized HR data lake, driving interventions toward "Zero".
          </p>
          <div className="grid grid-cols-5 gap-2">
            {manualInterventionsData.map((item) => (
              <div 
                key={item.interventions} 
                className="flex flex-col items-center justify-center p-3 rounded-xl border bg-white border-slate-200"
              >
                <div className="text-xl font-bold text-slate-700 mb-1">{item.percentage}%</div>
                <div className="text-xs font-medium text-slate-500">{item.interventions} steps</div>
              </div>
            ))}
          </div>
        </div>

        {/* Q11: Data Confidence */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-slate-500" />
            Confidence in HR Data Used for Decisions
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> The majority sits at "Moderate" (45%) or lower confidence. Only 5% reaches "Board-level confidence".
            <br/><br/>
            <strong>What is the problem:</strong> Data skepticism causes leaders to rely on gut feeling rather than metrics, undermining the value of the HR Tech stack.
          </p>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={confidenceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {confidenceData.map((entry, index) => (
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
              {confidenceData.map((item) => (
                <div key={item.level} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.level}</span>
                  </div>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Q12: Business Outcome Correlation */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Link2 className="w-4 h-4 text-slate-500" />
            Ability to Correlate HR Data with Business Outcomes
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Correlation capabilities are primarily "Limited" (50%).
            <br/><br/>
            <strong>What is the problem:</strong> HR is seen as a cost center because it cannot definitively prove how talent metrics (e.g., turnover, engagement) impact business KPIs (e.g., revenue, CSAT).
          </p>
          <div className="space-y-4">
            {correlationData.map((item) => (
              <div key={item.ability}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-medium">{item.ability}</span>
                  <span className="text-slate-500">{item.score}% volume</span>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-100">
                  <div
                    className="h-full rounded-full transition-all duration-500 shadow-sm bg-indigo-500"
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights */}
        <AIInsight
          type="ai"
          title="Data Gravity Remediation"
          description="High manual intervention (3+ steps) is severely impacting decision latency. Implement an automated unified data fabric. Projected impact: Move 60% of 'Days' reporting into 'Hours', and increase Board-level confidence by 40%."
        />
      </div>
    </SectionCard>
  );
}
