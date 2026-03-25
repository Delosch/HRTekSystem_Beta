import { Shield, AlertTriangle, FileCheck, LifeBuoy } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q26: HR operational risk visibility
const riskVisibilityData = [
  { level: "No visibility", value: 15, fill: "#ef4444" },
  { level: "Reactive", value: 45, fill: "#f59e0b" },
  { level: "Periodic", value: 25, fill: "#cbd5e1" }, // Slate
  { level: "Continuous", value: 10, fill: "#3b82f6" },
  { level: "Predictive", value: 5, fill: "#10b981" },
];

// Q27: Audit readiness of HR systems
const auditReadinessData = [
  { status: "Poor", score: 20 },
  { status: "Basic", score: 40 },
  { status: "Adequate", score: 25 },
  { status: "Strong", score: 10 },
  { status: "Always audit-ready", score: 5 },
];

// Q28: Business continuity for HR operations
const continuityData = [
  { state: "No plan", value: 10, color: "#ef4444" },
  { state: "Documented", value: 30, color: "#f59e0b" },
  { state: "Partially tested", value: 40, color: "#cbd5e1" },
  { state: "Tested regularly", value: 15, color: "#3b82f6" },
  { state: "Autonomous resilience", value: 5, color: "#10b981" },
];

export function Section8Governance({ dimScore }: { dimScore?: number }) {
  return (
    <SectionCard score={dimScore}
      icon={Shield}
      title="8️⃣ Governance, Risk & Resilience"
      description="Assessment of operational risk visibility, compliance audit readiness, and business continuity planning for HR systems."
    >
      <div className="space-y-8">
        
        {/* Q26: HR operational risk visibility */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-slate-500" />
            HR Operational Risk Visibility
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Risk visibility is largely "Reactive" (45%). Only 5% of risk detection is "Predictive".
            <br/><br/>
            <strong>What is the problem:</strong> HR operations (like payroll processing or compliance reporting) are vulnerable to critical failures that are only discovered *after* they impact employees.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={riskVisibilityData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="level" type="category" width={100} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {riskVisibilityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Q27: Audit readiness of HR systems */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-slate-500" />
            Audit Readiness of HR Systems
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Most systems are at a "Basic" (40%) or "Poor" (20%) level of audit readiness.
            <br/><br/>
            <strong>What is the fix for it:</strong> Implement automated compliance logging and continuous control monitoring to shift toward being "Always audit-ready".
          </p>
          <div className="space-y-4">
            {auditReadinessData.map((item) => (
              <div key={item.status}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-medium">{item.status}</span>
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

        {/* Q28: Business continuity for HR operations */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <LifeBuoy className="w-4 h-4 text-slate-500" />
            Business Continuity for HR Operations
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> While 30% have a "Documented" plan, the majority of the organization's continuity plans are only "Partially tested" (40%). 
            <br/><br/>
            <strong>What is the problem:</strong> Untested documentation provides a false sense of security. In a true outage, recovery time objectives (RTOs) will likely not be met.
          </p>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={continuityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {continuityData.map((entry, index) => (
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
              {continuityData.map((item) => (
                <div key={item.state} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.state}</span>
                  </div>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <AIInsight
          type="warning"
          title="Compliance & Resilience Gap"
          description="High operational risk combined with 'Basic' audit readiness exposes the organization to severe compliance penalties. Mandate automated control testing and quarterly disaster recovery drills to close the resilience gap within 6 months."
        />
      </div>
    </SectionCard>
  );
}
