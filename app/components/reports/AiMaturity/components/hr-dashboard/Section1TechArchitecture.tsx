import { Cpu, Settings2, UserCog } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q1: How is your HR tech stack architected?
const architectureData = [
  { name: "Tool-based", value: 15, color: "#cbd5e1" },
  { name: "Function-based", value: 25, color: "#94a3b8" },
  { name: "Suite-based", value: 45, color: "#60a5fa" },
  { name: "Platform-based", value: 70, color: "#3b82f6" },
  { name: "Product-based", value: 10, color: "#1e3a8a" },
];

// Q4: HR tech technical debt level
const techDebtData = [
  { category: "Legacy Systems", value: 68 },
  { category: "Configuration Debt", value: 55 },
  { category: "Manual Processes", value: 45 },
  { category: "API Dependencies", value: 32 },
];

// NEW - Q2: Degree of customization vs configuration
const customizationData = [
  { level: "Heavy customization", value: 45, fill: "#ef4444" },
  { level: "Moderate customization", value: 25, fill: "#f59e0b" },
  { level: "Mostly configuration", value: 15, fill: "#3b82f6" },
  { level: "Config + extensions", value: 10, fill: "#10b981" },
  { level: "Low-code/composable", value: 5, fill: "#059669" },
];

// NEW - Q3: Dependency on individuals for system operations
const dependencyData = [
  { role: "Core HRIS", dependency: 85, status: "Critical" },
  { role: "Payroll", dependency: 75, status: "High" },
  { role: "Recruiting", dependency: 40, status: "Moderate" },
  { role: "Learning", dependency: 20, status: "Low" },
  { role: "Analytics", dependency: 90, status: "Critical" },
];

export function Section1TechArchitecture({ dimScore, data }: { dimScore?: number; data?: any }) {
  const architecture = data?.[1] ?? 3; // Q1
  const customization = data?.[2] ?? 2; // Q2
  const dependency = data?.[3] ?? 3; // Q3
  const debt = data?.[4] ?? 2; // Q4

  const archPercentage = (architecture / 4) * 100;
  const customizationPercentage = (customization / 4) * 100;
  const dependencyPercentage = (dependency / 4) * 100;
  const debtPercentage = (debt / 4) * 100;

  const getDependencyColor = (score: number) => {
    if (score >= 75) return "bg-red-500";
    if (score >= 50) return "bg-amber-500";
    if (score >= 25) return "bg-blue-500";
    return "bg-emerald-500";
  };

  return (
    <SectionCard score={dimScore}
      icon={Cpu}
      title="1️⃣ HR Tech Architecture Depth"
      description="Deep analysis of system architecture maturity, configuration flexibility, operational dependencies, and technical debt."
    >
      <div className="space-y-8">
        {/* Q1: Architecture Maturity Gauge */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3">Architecture Maturity Progression</h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>Current State Score:</strong> {archPercentage}/100.
            <br/><br/>
            <strong>Analysis:</strong> {architecture < 3 ? "Your current architecture is restrictive and lacks the flexibility to scale modern AI solutions." : "Your architecture shows good maturity and foundation for digital transformation."}
          </p>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
             <div className="h-full bg-blue-600 transition-all duration-700" style={{ width: `${archPercentage}%` }} />
          </div>
        </div>

        {/* NEW - Q2: Degree of Customization */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-slate-500" />
            Degree of Customization vs Configuration
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>Current Flex Score:</strong> {customizationPercentage}/100.
            <br/><br/>
            {customization < 2 ? "High customization is currently your biggest blocker to agility." : "You have managed to keep a healthy balance between configuration and extensions."}
          </p>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
             <div className={`h-full transition-all duration-700 ${customization < 2 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${customizationPercentage}%` }} />
          </div>
        </div>

        {/* NEW - Q3: Dependency on Individuals */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <UserCog className="w-4 h-4 text-slate-500" />
            Dependency Risk Score
          </h4>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
             <div className={`h-full transition-all duration-700 ${dependency > 2 ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${dependencyPercentage}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">Dependency score of {dependencyPercentage}% indicates {dependency > 2 ? 'High' : 'Low'} operational risk.</p>
        </div>

        {/* Q4: Technical Debt Heatmap */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3">Technical Debt Risk</h4>
          <div className="h-4 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
             <div className={`h-full transition-all duration-700 ${debt > 2 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${debtPercentage}%` }} />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic">Technical debt levels are at {debtPercentage}%. Higher scores represent better legacy management.</p>
        </div>

        {/* AI Insights */}
        <AIInsight
          type="ai"
          title="Architecture Upgrade Roadmap"
          description="Migrate to composable architecture in 3 phases: (1) Replace heavy customizations with low-code extensions (Q2-Q3), (2) Document key-person processes into automated workflows (Q4), (3) Micro-frontend HR portal (Q1 next year). Projected TCO reduction: 32% over 3 years."
        />
      </div>
    </SectionCard>
  );
}
