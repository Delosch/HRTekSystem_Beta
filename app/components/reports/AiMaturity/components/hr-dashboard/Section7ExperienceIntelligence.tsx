import { HeartHandshake, Activity, LineChart, UserCog } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q23: Ability to measure employee effort & friction
const effortMeasurementData = [
  { level: "Not measured", value: 20, fill: "#ef4444" },
  { level: "Anecdotal", value: 35, fill: "#f59e0b" },
  { level: "Survey-based", value: 30, fill: "#cbd5e1" }, // Slate
  { level: "Behavioural analytics", value: 10, fill: "#3b82f6" },
  { level: "Experience intell.", value: 5, fill: "#10b981" },
];

// Q24: Alignment between EX & CX outcomes
const alignmentData = [
  { status: "No alignment", value: 25, color: "#ef4444" },
  { status: "Weak", value: 40, color: "#f59e0b" },
  { status: "Moderate", value: 20, color: "#cbd5e1" },
  { status: "Strong", value: 10, color: "#3b82f6" },
  { status: "Causal linkage", value: 5, color: "#1e3a8a" },
];

// Q25: Personalization of employee journeys
const personalizationData = [
  { stage: "None", score: 20 },
  { stage: "Rule-based", score: 50 },
  { stage: "Segment-based", score: 15 },
  { stage: "Context-aware", score: 10 },
  { stage: "AI-personalized", score: 5 },
];

export function Section7ExperienceIntelligence({ dimScore }: { dimScore?: number }) {
  return (
    <SectionCard score={dimScore}
      icon={HeartHandshake}
      title="7️⃣ Experience Intelligence (EX ≠ UX)"
      description="Measurement of employee friction, alignment between Employee Experience (EX) and Customer Experience (CX), and journey personalization."
    >
      <div className="space-y-8">
        
        {/* Q23: Measure employee effort & friction */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-slate-500" />
            Ability to Measure Employee Effort & Friction
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Measurement relies heavily on lagging indicators like "Survey-based" (30%) or is merely "Anecdotal" (35%).
            <br/><br/>
            <strong>What is the problem:</strong> The organization cannot proactively identify points of digital friction before they cause employee burnout or turnover.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={effortMeasurementData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="level" type="category" width={130} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {effortMeasurementData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Q24: Alignment between EX & CX outcomes */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <LineChart className="w-4 h-4 text-slate-500" />
            Alignment Between EX & CX Outcomes
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> EX and CX alignment is predominantly "Weak" (40%) or has "No alignment" (25%).
            <br/><br/>
            <strong>What is the fix for it:</strong> Establish cross-functional data models to prove the "Causal linkage" between employee engagement scores and customer satisfaction metrics.
          </p>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={alignmentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {alignmentData.map((entry, index) => (
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
              {alignmentData.map((item) => (
                <div key={item.status} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.status}</span>
                  </div>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Q25: Personalization of employee journeys */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-slate-500" />
            Personalization of Employee Journeys
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> 50% of the employee journeys are strictly "Rule-based", applying a one-size-fits-all approach to onboarding, learning, and development.
            <br/><br/>
            <strong>What is the problem:</strong> Lack of personalization drives down technology adoption rates as employees feel the HR portal is irrelevant to their specific daily needs.
          </p>
          <div className="space-y-4">
            {personalizationData.map((item) => (
              <div key={item.stage}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-medium">{item.stage}</span>
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
          title="Digital Friction Alert"
          description="The reliance on annual engagement surveys combined with 'Rule-based' portals creates a rigid employee experience. Deploying behavioral analytics tools to map digital friction can identify process bottlenecks before they result in productivity drops."
        />
      </div>
    </SectionCard>
  );
}
