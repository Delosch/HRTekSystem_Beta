import { TrendingUp, AlertTriangle, Award, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { AIInsight } from "./AIInsight";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ComposedChart } from "recharts";

interface ExecutiveSummaryProps {
  dimScores?: number[];
  overallScore?: number;
  brandName?: string;
}

function getScoreStatus(score: number): "critical" | "warning" | "success" {
  if (score >= 70) return "success";
  if (score >= 40) return "warning";
  return "critical";
}

export function ExecutiveSummary({ dimScores = [], overallScore = 0, brandName }: ExecutiveSummaryProps) {
  const s = dimScores;

  const compositeIndices = [
    { name: "HR Tech Architecture Health", score: s[0] ?? 0, status: getScoreStatus(s[0] ?? 0), description: `Architecture maturity based on tech stack, customization, dependency, and technical debt responses.` },
    { name: "Decision Latency Index", score: s[2] ?? 0, status: getScoreStatus(s[2] ?? 0), description: `Data gravity and decision speed based on insight generation time, data quality, and correlation ability.` },
    { name: "Change Velocity Index", score: s[4] ?? 0, status: getScoreStatus(s[4] ?? 0), description: `Organizational change adoption speed, fatigue level, and role clarity during transformation.` },
    { name: "Cost Efficiency Score", score: s[3] ?? 0, status: getScoreStatus(s[3] ?? 0), description: `ROI tracking maturity and cost leakage visibility across HR tech investment portfolio.` },
    { name: "AI Depth Score", score: s[5] ?? 0, status: getScoreStatus(s[5] ?? 0), description: `AI use case maturity, data quality, human-AI balance, and explainability/trust.` },
    { name: "Scalability Readiness", score: s[8] ?? 0, status: getScoreStatus(s[8] ?? 0), description: `Readiness for rapid headcount growth, M&A integration, and global localization.` },
  ];

  const maturityLevel = overallScore >= 80 ? 5 : overallScore >= 60 ? 4 : overallScore >= 40 ? 3 : overallScore >= 20 ? 2 : 1;
  const maturityLabels = ["1. Reactive HR", "2. Digitized HR", "3. Integrated HR", "4. Intelligent HR", "5. Autonomous HR"];
  const maturityLevels = maturityLabels.map((level, i) => ({ level, active: i + 1 === maturityLevel }));
  const nextMaturityLabel = maturityLabels[Math.min(maturityLevel, 4)];

  const predictiveRisks = [
    { risk: "Architecture Modernization", severity: (s[0] ?? 0) < 40 ? "critical" : "warning", timeline: (s[0] ?? 0) < 40 ? "6-12 months" : "12-18 months", probability: Math.max(10, 100 - (s[0] ?? 0)), description: `Tech architecture score of ${s[0] ?? 0}% indicates ${(s[0] ?? 0) < 40 ? "urgent" : "planned"} modernization needed.` },
    { risk: "Change Fatigue Risk", severity: (s[4] ?? 0) < 40 ? "critical" : "warning", timeline: "6 months", probability: Math.max(10, 100 - (s[4] ?? 0)), description: `Change velocity score of ${s[4] ?? 0}% suggests ${(s[4] ?? 0) < 40 ? "high" : "moderate"} organizational change fatigue exposure.` },
    { risk: "AI Maturity Gap", severity: (s[5] ?? 0) < 50 ? "critical" : "warning", timeline: "12 months", probability: Math.max(10, 100 - (s[5] ?? 0)), description: `AI depth score of ${s[5] ?? 0}% signals ${(s[5] ?? 0) < 50 ? "significant" : "moderate"} gap to intelligent HR automation.` },
  ];

  const orgName = brandName || "Your Organization";
  const getScoreColor = (score: number, indexName: string) => {
    // Special case for Cost Leakage Index - use purple/alert color
    if (indexName === "Cost Leakage Index") {
      return "bg-gradient-to-r from-purple-500 to-purple-600";
    }
    if (score >= 75) return "bg-gradient-to-r from-emerald-500 to-emerald-600";
    if (score >= 60) return "bg-gradient-to-r from-blue-500 to-blue-600";
    return "bg-gradient-to-r from-amber-500 to-amber-600";
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      critical: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
      warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
      success: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
    };
    return configs[status as keyof typeof configs] || configs.warning;
  };

  return (
    <div className="space-y-6">
      {/* Composite Indices */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-blue-600 shadow-sm">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">🎯 AI-Generated Executive Scorecard</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Composite intelligence indices across 6 critical dimensions
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {compositeIndices.map((index) => {
              const badge = getStatusBadge(index.status);
              return (
                <div
                  key={index.name}
                  className={`${badge.bg} ${badge.border} border rounded-xl p-4 transition-all duration-200 hover:shadow-md`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-slate-700">{index.name}</h4>
                    <div className={`text-2xl font-bold ${badge.text}`}>{index.score}</div>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden mb-2 border border-slate-100/50">
                    <div
                      className={`h-full rounded-full ${getScoreColor(index.score, index.name)}`}
                      style={{ width: `${index.score}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 leading-snug">{index.description}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Maturity Classification */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-indigo-600 shadow-sm">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Organizational Maturity Classification</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                Current State: <strong>Level 3 - Integrated HR</strong>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {maturityLevels.map((level, index) => (
              <div
                key={level.level}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 ${
                  level.active
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-white border-slate-100"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                    level.active
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className={`font-medium ${level.active ? "text-blue-900" : "text-slate-500"}`}>{level.level}</div>
                </div>
                {level.active && (
                  <div className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full font-medium shadow-sm">
                    Current
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
               <CheckCircle2 className="w-4 h-4 text-emerald-600" />
               <h4 className="text-sm font-bold text-slate-800">{orgName} — Overall Maturity Score: {overallScore}%</h4>
            </div>
            <ul className="space-y-1 text-xs text-slate-600 pl-6 list-disc marker:text-emerald-500">
              <li>Raise Decision Latency score (currently {s[2] ?? 0}%) above 75 by unifying HR data sources</li>
              <li>Improve AI Depth score (currently {s[5] ?? 0}%) with multi-process AI deployment</li>
              <li>Reduce tech architecture debt — current score {s[0] ?? 0}%</li>
              <li>Target: advance to {nextMaturityLabel} — requires overall score above {maturityLevel >= 4 ? 80 : maturityLevel >= 3 ? 60 : 40}%</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Predictive Risk Indicators */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-lg bg-slate-800 shadow-sm">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Predictive Risk Indicators</CardTitle>
              <p className="text-sm text-slate-500 mt-1">
                AI-forecasted risks requiring immediate leadership attention
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Risk Impact vs Probability Matrix Graph */}
            <div>
              <h4 className="text-sm font-medium text-slate-900 mb-3">Risk Impact & Probability Matrix</h4>
              <ResponsiveContainer width="100%" height={280}>
                <ComposedChart data={predictiveRisks} layout="vertical" margin={{ left: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="risk" type="category" stroke="#64748b" tick={{ fontSize: 11 }} width={110} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="probability" radius={[0, 4, 4, 0]} barSize={24}>
                    {predictiveRisks.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.probability > 80
                            ? "#ef4444"
                            : entry.probability > 65
                            ? "#f59e0b"
                            : "#10b981"
                        }
                      />
                    ))}
                  </Bar>
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Risk Details Cards */}
            <div className="grid gap-3">
              {predictiveRisks.map((risk) => {
                const badge = getStatusBadge(risk.severity);
                return (
                  <div
                    key={risk.risk}
                    className={`${badge.bg} ${badge.border} border rounded-xl p-4`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className={`text-sm font-bold ${badge.text} mb-1`}>{risk.risk}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{risk.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs mt-3 pt-3 border-t border-slate-200/50">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Timeline:</span>
                        <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{risk.timeline}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-medium">Probability:</span>
                        <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">{risk.probability}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Final AI Recommendations */}
      <div className="grid md:grid-cols-2 gap-4">
        <AIInsight
          type="ai"
          title="Top Priority: Decision Latency Crisis"
          description={
            <>
              <strong>What it shows:</strong> Decision latency is critical (42/100). Executive decisions are delayed by avg 8.7 days.
              <br /><br />
              <strong>What is the problem:</strong> Data is siloed in 14 systems; reports take 3.2 days to compile manually.
              <br /><br />
              <strong>What is the fix for it:</strong> Deploy unified data lake immediately. Projected ROI: 85% reduction in report time, $2.1M value realization.
            </>
          }
        />
        <AIInsight
          type="warning"
          title="Urgent: Scale Architecture Upgrade"
          description={
            <>
              <strong>What it shows:</strong> Scale failure risk is high (42/100). Performance drops to 42% at 10x headcount.
              <br /><br />
              <strong>What is the problem:</strong> Current architecture will hit breaking point in 18 months at 28% YoY growth.
              <br /><br />
              <strong>What is the fix for it:</strong> Migrate to composable, multi-tenant architecture by Q3. Budget: $1.8M; Avoided Cost: $4.2M+.
            </>
          }
        />
      </div>
    </div>
  );
}
