import { FastForward, BatteryWarning, UserCheck, Zap } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q16: Time to adopt new HR processes
const adoptionTimeData = [
  { time: ">12 months", value: 15, fill: "#ef4444" },
  { time: "6-12 months", value: 45, fill: "#f59e0b" },
  { time: "3-6 months", value: 25, fill: "#3b82f6" },
  { time: "<3 months", value: 10, fill: "#10b981" },
  { time: "Continuous adoption", value: 5, fill: "#059669" },
];

// Q17: Change fatigue level in organization
const fatigueData = [
  { level: "Severe", value: 20, color: "#ef4444" },
  { level: "High", value: 35, color: "#f59e0b" },
  { level: "Moderate", value: 30, color: "#cbd5e1" }, // Slate
  { level: "Low", value: 10, color: "#3b82f6" },
  { level: "Adaptive culture", value: 5, color: "#10b981" },
];

// Q18: Role clarity during transformation
const roleClarityData = [
  { status: "Highly unclear", score: 25 },
  { status: "Partially unclear", score: 40 },
  { status: "Defined", score: 20 },
  { status: "Well-defined", score: 10 },
  { status: "Product ownership model", score: 5 },
];

export function Section5ChangeVelocity({ dimScore }: { dimScore?: number }) {
  return (
    <SectionCard score={dimScore}
      icon={Zap}
      title="5️⃣ Organizational Change Velocity"
      description="Analysis of the organization's agility, speed of process adoption, change fatigue, and clarity of roles during transformation."
    >
      <div className="space-y-8">
        
        {/* Q16: Time to adopt new HR processes */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <FastForward className="w-4 h-4 text-slate-500" />
            Time to Adopt New HR Processes
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Adoption heavily trails at "6-12 months" (45%), with 15% taking "{'>'}12 months".
            <br/><br/>
            <strong>What is the problem:</strong> Transformation ROI is delayed significantly because the workforce is too slow to transition to new operating procedures and tools.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={adoptionTimeData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="time" type="category" width={130} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {adoptionTimeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Q17: Change fatigue level */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <BatteryWarning className="w-4 h-4 text-slate-500" />
            Change Fatigue Level in Organization
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> 55% of the organization reports "High" or "Severe" change fatigue.
            <br/><br/>
            <strong>What is the fix for it:</strong> Pause sequential tech rollouts. Shift focus to continuous, bite-sized process improvements ("Adaptive culture") rather than massive "big bang" deployments.
          </p>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={fatigueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {fatigueData.map((entry, index) => (
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
              {fatigueData.map((item) => (
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

        {/* Q18: Role clarity during transformation */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-500" />
            Role Clarity During Transformation
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> 65% find roles either "Partially unclear" or "Highly unclear" during change initiatives.
            <br/><br/>
            <strong>What is the problem:</strong> Without a "Product ownership model", accountability is diffused, resulting in transformation projects stalling out post-implementation.
          </p>
          <div className="space-y-4">
            {roleClarityData.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-medium">{item.status}</span>
                  <span className="text-slate-500">{item.score}% distribution</span>
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
          type="warning"
          title="Transformation Burnout Risk"
          description="High change fatigue coupled with unclear roles is severely degrading the organization's change velocity. Moving toward a persistent 'Product ownership model' for HR technology rather than project-based implementations will improve adoption times by an estimated 40%."
        />
      </div>
    </SectionCard>
  );
}
