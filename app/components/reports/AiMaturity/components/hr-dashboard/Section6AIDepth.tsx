import { BrainCircuit, DatabaseZap, Scale, ShieldAlert } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q19: AI use cases maturity
const useCasesData = [
  { stage: "No AI", value: 20, fill: "#cbd5e1" },
  { stage: "Chatbots only", value: 45, fill: "#94a3b8" },
  { stage: "Narrow use cases", value: 25, fill: "#60a5fa" },
  { stage: "Multi-process AI", value: 8, fill: "#3b82f6" },
  { stage: "AI orchestrated HR", value: 2, fill: "#1e3a8a" },
];

// Q20: Quality of data feeding AI models
const dataQualityData = [
  { quality: "Poor", value: 15, color: "#ef4444" },
  { quality: "Inconsistent", value: 45, color: "#f59e0b" },
  { quality: "Clean", value: 25, color: "#cbd5e1" }, // Slate
  { quality: "Governed", value: 10, color: "#3b82f6" },
  { quality: "ML-ready", value: 5, color: "#10b981" },
];

// Q21: Human-AI decision balance
const decisionBalanceData = [
  { balance: "Fully human", score: 35 },
  { balance: "Human dominant", score: 40 },
  { balance: "AI assisted", score: 15 },
  { balance: "AI recommended", score: 8 },
  { balance: "AI augmented governance", score: 2 },
];

// Q22: Explainability & trust in AI decisions
const explainabilityData = [
  { level: "No trust", value: 15, fill: "#ef4444" },
  { level: "Low trust", value: 35, fill: "#f59e0b" },
  { level: "Moderate trust", value: 35, fill: "#3b82f6" },
  { level: "High trust", value: 10, fill: "#10b981" },
  { level: "Auditable AI", value: 5, fill: "#059669" },
];

export function Section6AIDepth({ dimScore }: { dimScore?: number }) {
  return (
    <SectionCard score={dimScore}
      icon={BrainCircuit}
      title="6️⃣ AI Depth (Not AI-washing)"
      description="Evaluation of genuine AI adoption, data readiness for machine learning, decision automation, and algorithmic trust."
    >
      <div className="space-y-8">
        
        {/* Q19: AI use cases maturity */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <BrainCircuit className="w-4 h-4 text-slate-500" />
            AI Use Cases Maturity
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> The majority of the organization relies on basic "Chatbots only" (45%) or has "No AI" (20%).
            <br/><br/>
            <strong>What is the problem:</strong> The organization is stuck in the "AI-washing" phase, using superficial AI tools rather than leveraging AI to fundamentally re-architect HR processes.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={useCasesData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="stage" type="category" width={130} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {useCasesData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Q20: Quality of data feeding AI models */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <DatabaseZap className="w-4 h-4 text-slate-500" />
            Quality of Data Feeding AI Models
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Data quality is largely "Inconsistent" (45%) or "Poor" (15%). Only 5% is truly "ML-ready".
            <br/><br/>
            <strong>What is the fix for it:</strong> Halt new AI feature deployments until a robust data governance framework is established to prevent "garbage in, garbage out" scenarios.
          </p>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={dataQualityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dataQualityData.map((entry, index) => (
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
              {dataQualityData.map((item) => (
                <div key={item.quality} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.quality}</span>
                  </div>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Q21: Human-AI decision balance */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Scale className="w-4 h-4 text-slate-500" />
            Human-AI Decision Balance
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Decisions are heavily biased toward "Human dominant" (40%) and "Fully human" (35%). 
            <br/><br/>
            <strong>What is the problem:</strong> The organization is failing to capitalize on AI's ability to augment decision-making in high-volume areas like resume screening and compensation modeling.
          </p>
          <div className="space-y-4">
            {decisionBalanceData.map((item) => (
              <div key={item.balance}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-medium">{item.balance}</span>
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

        {/* Q22: Explainability & trust in AI decisions */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            Explainability & Trust in AI Decisions
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Trust is lagging, with 50% indicating "Low trust" or "No trust" in algorithmic outputs.
            <br/><br/>
            <strong>What is the fix for it:</strong> Implement an "Auditable AI" policy where all AI-generated recommendations (especially in talent acquisition and performance) require a transparent, human-readable logic trail.
          </p>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {explainabilityData.map((item, index) => {
              const isActive = item.level === "Low trust";
              return (
                <div 
                  key={item.level} 
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isActive ? "bg-amber-50 border-amber-300 shadow-sm" : "bg-white border-slate-200 opacity-60"
                  }`}
                >
                  <div className={`text-[10px] sm:text-xs font-bold mb-1 ${isActive ? "text-amber-700" : "text-slate-500"}`}>
                    {item.level}
                  </div>
                  {isActive && <div className="w-2 h-2 rounded-full bg-amber-500 mt-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* AI Insights */}
        <AIInsight
          type="warning"
          title="AI Readiness Deficit"
          description="The organization exhibits a classic 'AI-washing' profile. While chatbots are deployed, the underlying data architecture is too inconsistent to support multi-process AI. Upgrading data quality to 'Governed' status is a mandatory prerequisite before scaling AI use cases."
        />
      </div>
    </SectionCard>
  );
}
