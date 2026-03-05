import { TrendingUp, TrendingDown, AlertTriangle, Users, Target, Activity, Brain, CheckCircle, Clock, Zap, AlertCircle, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DecisionSummaryBar } from './DecisionSummaryBar';

export function DashboardOverview({ data, responses, questions }: { data: any, responses?: any, questions?: any }) {
  const readinessScore = data?.readinessAssessment?.overallScore || 72;
  const highRiskPerc = data?.meta?.highRiskStakeholders || "18%";
  const dominantEmotion = data?.dominantEmotion || "Optimism";
  const adoptionRisk = data?.meta?.riskLevel || "Medium";

  const kpiData = [
    {
      title: 'Change Readiness Index',
      value: readinessScore,
      change: '+5',
      trend: 'up',
      icon: Target,
      color: 'blue',
      description: '0-100 real-time score',
      riskBand: readinessScore > 70 ? 'Stable' : 'Volatile',
      interpretation: readinessScore > 70 ? 'High readiness with strong momentum' : 'Moderate readiness with improving momentum',
      baseline: `Baseline: ${readinessScore - 5}`,
      confidenceLevel: 85
    },
    {
      title: 'High-Risk Stakeholders',
      value: highRiskPerc,
      change: '-3%',
      trend: 'down',
      icon: Users,
      color: 'red',
      description: 'Flagged for intervention',
      absolute: `${data?.meta?.highRiskCount || 23} of ${data?.meta?.totalStakeholders || 128}`,
      severity: data?.meta?.riskLevel === 'High' ? 'Critical' : 'Medium',
      weekTrend: 'down',
      confidenceLevel: 92
    },
    {
      title: 'Dominant Emotion',
      value: dominantEmotion,
      change: '+12%',
      trend: 'up',
      icon: Activity,
      color: dominantEmotion === 'Optimism' || dominantEmotion === 'Hope' ? 'green' : 'amber',
      description: 'Current sentiment leader',
      context: `Driven by ${data?.profile?.department || 'Operations'}`,
      warning: 'Resistance pockets identified',
      confidenceLevel: 88
    },
    {
      title: 'Predicted Adoption Risk',
      value: adoptionRisk,
      change: 'Stable',
      trend: 'neutral',
      icon: AlertTriangle,
      color: adoptionRisk === 'High' ? 'red' : 'yellow',
      description: 'Next 30-day forecast',
      probability: adoptionRisk === 'High' ? '70-85%' : '45-60%',
      driver: data?.diagnostics?.riskReasons?.[0] || 'Communication gaps',
      confidenceLevel: 78
    },
  ];

  const departmentPerformance = data?.deepViz?.deptRiskHeatmap?.map((d: any) => ({
    dept: d.dept,
    crs: d.crs,
    engagement: d.impact,
    adoption: d.crs - 5
  })) || [
      { dept: 'HR', crs: 85, engagement: 92, adoption: 88 },
      { dept: 'Engineering', crs: 72, engagement: 78, adoption: 70 },
      { dept: 'Sales', crs: 48, engagement: 52, adoption: 45 },
      { dept: 'Operations', crs: 65, engagement: 68, adoption: 62 },
      { dept: 'Finance', crs: 78, engagement: 82, adoption: 75 },
    ];

  return (
    <div className="space-y-6">
      {/* Decision Summary Bar - NEW */}
      <DecisionSummaryBar data={data} />

      {/* Professional Header with System Health */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Change Intelligence Engine</h2>
            <span className="px-3 py-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase rounded-full shadow-sm tracking-widest">v1.2 MVP</span>
          </div>
          <p className="text-slate-600 mt-1.5 font-medium italic opacity-70 italic font-medium">Real-time analysis for {data?.profile?.organizationName || 'Strategic Organization'}</p>
        </div>
        <div className="flex items-center gap-6">
          {/* System Confidence */}
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">System Confidence</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-green-600 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <span className="text-lg font-black text-indigo-600 tracking-tighter">85%</span>
            </div>
            <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter mt-0.5">High Stability</p>
          </div>
          {/* Data Health */}
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Data Coverage</p>
            <div className="flex items-center gap-2 mt-1 justify-end">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span className="text-lg font-black text-indigo-600 tracking-tighter">{Math.round(data?.progress?.completeness || 96)}%</span>
            </div>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter mt-0.5">Live Sync Active</p>
          </div>
        </div>
      </div>

      {/* Enhanced KPI Cards with Context */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-xl shadow-sm ${kpi.color === 'blue' ? 'bg-blue-50 shadow-blue-100' :
                  kpi.color === 'red' ? 'bg-red-50 shadow-red-100' :
                    kpi.color === 'green' ? 'bg-emerald-50 shadow-emerald-100' :
                      'bg-amber-50 shadow-amber-100'
                  }`}>
                  <Icon className={`w-5 h-5 ${kpi.color === 'blue' ? 'text-blue-600' :
                    kpi.color === 'red' ? 'text-red-600' :
                      kpi.color === 'green' ? 'text-emerald-600' :
                        'text-amber-600'
                    }`} />
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${kpi.trend === 'up' ? 'bg-emerald-100 text-emerald-700' :
                  kpi.trend === 'down' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                  {kpi.trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                  {kpi.trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                  <span>{kpi.change}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1.5">{kpi.title}</p>
                <p className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{kpi.value}</p>

                {/* Risk Band / Severity */}
                {kpi.riskBand && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[9px] font-black uppercase tracking-widest mb-2 border border-blue-200">
                    <Target className="w-3 h-3" />
                    {kpi.riskBand}
                  </div>
                )}
                {kpi.severity && (
                  <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest mb-2 border ${kpi.severity === 'Critical' ? 'bg-red-100 text-red-800 border-red-200' :
                    kpi.severity === 'Medium' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      'bg-blue-100 text-blue-800 border-blue-200'
                    }`}>
                    <AlertCircle className="w-3 h-3" />
                    {kpi.severity} Risk
                  </div>
                )}

                {/* Interpretation */}
                {kpi.interpretation && (
                  <p className="text-xs text-slate-700 font-bold mb-1.5 leading-snug">{kpi.interpretation}</p>
                )}

                {/* Additional Context */}
                <div className="space-y-1 mt-2">
                  {kpi.baseline && <p className="text-[10px] text-slate-400 font-medium uppercase">{kpi.baseline}</p>}
                  {kpi.absolute && <p className="text-xs text-slate-800 font-black">{kpi.absolute}</p>}
                  {kpi.context && <p className="text-[10px] text-emerald-600 font-black uppercase font-black uppercase">✓ {kpi.context}</p>}
                  {kpi.warning && <p className="text-[10px] text-red-600 font-black uppercase">⚠ {kpi.warning}</p>}
                  {kpi.probability && <p className="text-[10px] text-slate-500 font-bold">PROBABILITY: {kpi.probability}</p>}
                  {kpi.driver && <p className="text-[10px] text-amber-600 font-black uppercase">DRIVER: {kpi.driver}</p>}
                </div>

                {/* Confidence Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">AI Confidence</span>
                    <span className="text-[10px] font-black text-slate-900">{kpi.confidenceLevel}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1 mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                      style={{ width: `${kpi.confidenceLevel}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Key Drivers This Period - CRITICAL NEW SECTION */}
      <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-8">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-indigo-600 rounded-2xl shadow-xl">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black text-slate-900 mb-1 uppercase tracking-tight">Primary Change Drivers</h3>
            <p className="text-sm text-slate-500 mb-6 font-medium">Cognitive Engine Analysis for {data?.profile?.organizationName}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(data?.diagnostics?.recommendations || []).slice(0, 3).map((rec: string, i: number) => {
                const colors = ['red', 'emerald', 'amber'];
                const color = colors[i % 3];
                return (
                  <div key={i} className={`bg-white rounded-xl border border-${color}-100 p-5 shadow-sm hover:shadow-md transition-all group`}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`w-8 h-8 rounded-lg bg-${color}-50 flex items-center justify-center`}>
                        {i === 0 ? <AlertTriangle className={`w-4 h-4 text-${color}-600`} /> :
                          i === 1 ? <CheckCircle className={`w-4 h-4 text-${color}-600`} /> :
                            <Zap className={`w-4 h-4 text-${color}-600`} />}
                      </div>
                      <div>
                        <p className={`text-[10px] font-black uppercase tracking-widest text-${color}-700 mb-1`}>Critical Insight</p>
                        <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors uppercase leading-tight line-clamp-2">{rec}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-2 mt-4 pt-4 border-t border-${color}-50`}>
                      <span className={`text-[10px] font-black text-${color}-900 uppercase tracking-tighter`}>IMPACT:</span>
                      <span className={`text-[10px] text-${color}-700 font-bold uppercase tracking-tighter`}>Strategic Mitigation</span>
                    </div>
                  </div>
                );
              })}
              {(!data?.diagnostics?.recommendations || data.diagnostics.recommendations.length === 0) && (
                <div className="col-span-3 py-6 text-center text-slate-400 italic">
                  No specific driver analyzed. System using global benchmarks.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Department Performance - SIMPLIFIED FOR MVP */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Departmental Matrix</h3>
            <p className="text-sm text-slate-500 mt-1 font-medium">Comparative Readiness by Operational Unit</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">CRS Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-tighter">Engagement</span>
            </div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={departmentPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="dept" stroke="#94A3B8" style={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }} axisLine={false} tickLine={false} />
            <YAxis stroke="#94A3B8" domain={[0, 100]} style={{ fontSize: '10px', fontWeight: '900' }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: '#F8FAFC' }}
              contentStyle={{
                backgroundColor: '#FFF',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                padding: '12px'
              }}
            />
            <Bar dataKey="crs" fill="#2563EB" radius={[4, 4, 0, 0]} name="CRS Score" barSize={40} />
            <Bar dataKey="engagement" fill="#10B981" radius={[4, 4, 0, 0]} name="Engagement" barSize={40} />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-indigo-600 mt-1 flex-shrink-0" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Observation</p>
                <p className="text-sm text-slate-900 font-bold leading-relaxed">{`${data?.profile?.department || 'Operations'} shows the most volatility.`}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Strategic Lever</p>
                <p className="text-sm text-slate-600 font-medium leading-relaxed">Prioritize manager-led briefings for lower-scoring departments to bridge the adoption gap.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Prioritized Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Priority 1 */}
        <div className="bg-white border-l-8 border-red-600 rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-red-600 text-white rounded-lg font-black text-xs">P1</div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Critical Priority</h4>
              <p className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-tight">{data?.topIntervention || "Address Communication Barriers"}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OWNER: LEADERSHIP</span>
                <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-black rounded uppercase">Urgent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority 2 */}
        <div className="bg-white border-l-8 border-indigo-600 rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-indigo-600 text-white rounded-lg font-black text-xs">P2</div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Strategy Build</h4>
              <p className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-tight">Enable Mid-Management Champions</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OWNER: HR/PRODUCT</span>
                <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-[10px] font-black rounded uppercase">Next 7 Days</span>
              </div>
            </div>
          </div>
        </div>

        {/* Priority 3 */}
        <div className="bg-white border-l-8 border-emerald-600 rounded-xl shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="p-2.5 bg-emerald-600 text-white rounded-lg font-black text-xs">P3</div>
            <div className="flex-1">
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Sentiment Drive</h4>
              <p className="font-bold text-slate-900 text-sm mb-3 uppercase tracking-tight">Celebrate Quick Wins</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OWNER: OPS LEADS</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded uppercase">Continuous</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
