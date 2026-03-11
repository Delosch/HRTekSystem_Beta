import { Maximize2, Network, Globe, TrendingUp } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q29: Readiness for rapid headcount growth
const growthReadinessData = [
  { level: "Not ready", value: 15, fill: "#ef4444" },
  { level: "High risk", value: 35, fill: "#f59e0b" },
  { level: "Moderate risk", value: 30, fill: "#cbd5e1" }, // Slate
  { level: "Low risk", value: 15, fill: "#3b82f6" },
  { level: "Plug-and-scale", value: 5, fill: "#10b981" },
];

// Q30: M&A / restructuring readiness of HR systems
const maReadinessData = [
  { status: "Not supported", value: 20, color: "#ef4444" },
  { status: "Manual heavy", value: 40, color: "#f59e0b" },
  { status: "Semi-supported", value: 25, color: "#cbd5e1" },
  { status: "Well supported", value: 10, color: "#3b82f6" },
  { status: "Designed for change", value: 5, color: "#10b981" },
];

// Q31: Localization & compliance flexibility
const localizationData = [
  { flex: "Very limited", score: 15 },
  { flex: "Limited", score: 45 },
  { flex: "Moderate", score: 25 },
  { flex: "High", score: 10 },
  { flex: "Global-by-design", score: 5 },
];

export function Section9Scalability({ dimScore }: { dimScore?: number }) {
  return (
    <SectionCard score={dimScore}
      icon={Maximize2}
      title="9️⃣ Scalability, M&A & Global Readiness"
      description="Evaluation of system capacity to handle rapid headcount growth, M&A agility, and global localization."
    >
      <div className="space-y-8">
        
        {/* Q29: Readiness for rapid headcount growth */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            Readiness for Rapid Headcount Growth
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Growth readiness is currently at "High risk" (35%) or "Moderate risk" (30%).
            <br/><br/>
            <strong>What is the problem:</strong> The core HRIS pricing model and API rate limits will break down if the organization experiences a 2x surge in headcount, leading to a system crash and massive cost overruns.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={growthReadinessData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="level" type="category" width={110} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {growthReadinessData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Q30: M&A / restructuring readiness */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Network className="w-4 h-4 text-slate-500" />
            M&A / Restructuring Readiness of HR Systems
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Data integration post-M&A is "Manual heavy" (40%) and 20% of systems are "Not supported" for tenant migration.
            <br/><br/>
            <strong>What is the fix for it:</strong> Decouple organizational hierarchy data from the core HCM into an agile organizational design tool, enabling the business to model restructuring without breaking payroll integrations.
          </p>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={maReadinessData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {maReadinessData.map((entry, index) => (
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
              {maReadinessData.map((item) => (
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

        {/* Q31: Localization & compliance flexibility */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            Localization & Compliance Flexibility
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> The current tech stack has "Limited" (45%) ability to handle regional compliance variations (e.g., GDPR in Europe vs. local labor laws in APAC).
            <br/><br/>
            <strong>What is the problem:</strong> Launching a new international office takes 3x longer than the industry average because HR systems cannot dynamically adapt to local regulations.
          </p>
          <div className="space-y-4">
            {localizationData.map((item) => (
              <div key={item.flex}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-medium">{item.flex}</span>
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
          type="warning"
          title="Scale Failure Risk"
          description="The combined score across M&A readiness and global localization indicates the system is too rigid for enterprise scale. The architecture currently acts as a bottleneck to corporate expansion rather than an enabler. Target a 'Designed for change' multi-tenant model by next fiscal year."
        />
      </div>
    </SectionCard>
  );
}
