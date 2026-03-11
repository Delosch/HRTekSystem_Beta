import { Settings, Users, Gavel, Handshake } from "lucide-react";
import { SectionCard } from "./SectionCard";
import { AIInsight } from "./AIInsight";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

// Q32: HR role distribution
const roleDistributionData = [
  { role: "Mostly transactional", value: 40, fill: "#ef4444" },
  { role: "Ops heavy", value: 30, fill: "#f59e0b" },
  { role: "Balanced", value: 15, fill: "#cbd5e1" }, // Slate
  { role: "Strategic heavy", value: 10, fill: "#3b82f6" },
  { role: "Product & analytics led", value: 5, fill: "#10b981" },
];

// Q33: Decision rights clarity in HR
const decisionRightsData = [
  { clarity: "Unclear", value: 25, color: "#ef4444" },
  { clarity: "Partially clear", value: 40, color: "#f59e0b" },
  { clarity: "Clear", value: 20, color: "#cbd5e1" },
  { clarity: "Well governed", value: 10, color: "#3b82f6" },
  { clarity: "Product governance", value: 5, color: "#1e3a8a" },
];

// Q34: Dependency on consultants/vendors
const vendorDependencyData = [
  { level: "Total dependency", score: 20 },
  { level: "High", score: 35 },
  { level: "Moderate", score: 25 },
  { level: "Low", score: 15 },
  { level: "Internal capability", score: 5 },
];

export function Section10OperatingModel({ dimScore }: { dimScore?: number }) {
  return (
    <SectionCard score={dimScore}
      icon={Settings}
      title="🔟 HR Operating Model Intelligence"
      description="Diagnosing role distribution, decision rights clarity, and the level of dependency on external consultants versus internal capability."
    >
      <div className="space-y-8">
        
        {/* Q32: HR role distribution */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            HR Role Distribution
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> 70% of the HR workforce is consumed by "Mostly transactional" (40%) and "Ops heavy" (30%) tasks.
            <br/><br/>
            <strong>What is the problem:</strong> The operating model is inverted. Very little capacity (5%) is dedicated to being "Product & analytics led", stifling strategic HR initiatives.
          </p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roleDistributionData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="role" type="category" width={140} stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }} 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                {roleDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Q33: Decision rights clarity in HR */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Gavel className="w-4 h-4 text-slate-500" />
            Decision Rights Clarity in HR
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> Decision authority is "Partially clear" (40%) or outright "Unclear" (25%).
            <br/><br/>
            <strong>What is the fix for it:</strong> Move away from consensus-driven ambiguity. Implement a strict "Product governance" framework where digital HR product owners have explicit, documented decision rights over their domains.
          </p>
          <div className="grid md:grid-cols-2 gap-4 items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={decisionRightsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {decisionRightsData.map((entry, index) => (
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
              {decisionRightsData.map((item) => (
                <div key={item.clarity} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.clarity}</span>
                  </div>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Q34: Dependency on consultants/vendors */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-slate-500" />
            Dependency on Consultants / Vendors
          </h4>
          <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
            <strong>What it shows:</strong> A dangerous 55% of the organization has a "High" or "Total dependency" on external consultants to operate or upgrade HR systems.
            <br/><br/>
            <strong>What is the problem:</strong> Operational knowledge is walking out the door at the end of every vendor contract, preventing the development of mature "Internal capability" and inflating TCO.
          </p>
          <div className="space-y-4">
            {vendorDependencyData.map((item) => (
              <div key={item.level}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-700 font-medium">{item.level}</span>
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
          title="Operating Model Transformation Required"
          description="The current operating model is highly transactional and overly reliant on external vendors. To move to a Level 4 (Intelligent HR) maturity, the organization must reskill 20% of its 'Ops heavy' workforce into 'Product & analytics led' roles and aggressively insource Tier 1 system administration."
        />
      </div>
    </SectionCard>
  );
}
