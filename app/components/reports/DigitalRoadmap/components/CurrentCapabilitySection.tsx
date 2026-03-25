import { Card } from './ui/card';
import { Sparkles } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';

interface CurrentCapabilitySectionProps {
  data: any;
}

export function CurrentCapabilitySection({ data }: CurrentCapabilitySectionProps) {
  const manualAreas = data['manual-areas'] || ['onboarding', 'retention'];
  const standardization = data['standardization'] || 45;
  const sopMaturity = data['sop-maturity'] || 35;
  
  const heatmapData = [
    { process: 'Recruit', digitized: 75, automated: manualAreas.includes('recruitment') ? 30 : 65, mobile: 60 },
    { process: 'Onboard', digitized: 55, automated: manualAreas.includes('onboarding') ? 20 : 55, mobile: 35 },
    { process: 'Manage', digitized: 65, automated: manualAreas.includes('performance') ? 40 : 70, mobile: 50 },
    { process: 'Develop', digitized: 40, automated: manualAreas.includes('learning') ? 15 : 45, mobile: 25 },
    { process: 'Retain', digitized: 35, automated: manualAreas.includes('retention') ? 10 : 40, mobile: 20 },
  ];

  const bottleneckData = [
    { area: 'Manual Data Entry', intensity: manualAreas.length * 15 + 20, color: '#dc2626' },
    { area: 'Legacy Systems', intensity: 85 - (standardization / 2), color: '#ea580c' },
    { area: 'Process Gaps', intensity: 100 - standardization, color: '#f59e0b' },
    { area: 'Doc Maturity', intensity: 100 - sopMaturity, color: '#84cc16' },
    { area: 'Reporting', intensity: 75 - (data['data-quality'] / 2 || 30), color: '#10b981' },
  ];

  const riskRadarData = [
    { category: 'UX', current: 45, target: 85 },
    { category: 'Integration', current: 35, target: 80 },
    { category: 'Analytics', current: Number(data['data-quality']) || 30, target: 90 },
    { category: 'Compliance', current: Number(data['compliance-automation']) || 55, target: 90 },
    { category: 'Automation', current: Number(data['automation-percent']) || 40, target: 75 },
  ];

  const getHeatColor = (value: number) => {
    if (value >= 70) return 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]';
    if (value >= 50) return 'bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.2)]';
    if (value >= 30) return 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.2)]';
    return 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 italic tracking-tight">
          Current Digital Capability Landscape
        </h1>
        <p className="text-slate-600 font-medium">
          Diagnostic assessment of your current HR digital maturity across key processes, 
          revealing gaps that drive inefficiency and compliance risk.
        </p>
      </div>

      {/* HR Process Heatmap */}
      <Card className="p-8 bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="mb-8">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Process Maturity Heatmap
          </h2>
          <p className="text-sm text-slate-500">
            Real-time visualization of digital voids across the employee lifecycle.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4 pr-4">HR Process</th>
                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4 px-4">Digitized</th>
                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4 px-4">Automated</th>
                <th className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4 px-4">Mobile</th>
                <th className="text-left text-[10px] font-black text-slate-400 uppercase tracking-widest pb-4 pl-4">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {heatmapData.map((row, index) => (
                <tr key={index} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 pr-4">
                    <span className="text-sm font-bold text-slate-900 italic">{row.process}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`w-full h-12 rounded-xl ${getHeatColor(row.digitized)} flex items-center justify-center transition-all group-hover:scale-[1.02]`}>
                      <span className="text-xs font-black text-white">{row.digitized}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`w-full h-12 rounded-xl ${getHeatColor(row.automated)} flex items-center justify-center transition-all group-hover:scale-[1.02]`}>
                      <span className="text-xs font-black text-white">{row.automated}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`w-full h-12 rounded-xl ${getHeatColor(row.mobile)} flex items-center justify-center transition-all group-hover:scale-[1.02]`}>
                      <span className="text-xs font-black text-white">{row.mobile}%</span>
                    </div>
                  </td>
                  <td className="py-4 pl-4">
                    <div className="flex items-center gap-2">
                      <div className={`h-1.5 w-1.5 rounded-full ${row.digitized < 40 ? 'bg-red-500' : 'bg-blue-500'}`} />
                      <span className="text-[10px] font-bold text-slate-500 uppercase">
                        {row.digitized < 40 ? 'Critical Focus' : 'Optimize'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-8 flex items-center gap-8 justify-center border-t border-slate-50 pt-8">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Critical (0-30%)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-amber-400 rounded-full shadow-sm"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Review (31-50%)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-blue-400 rounded-full shadow-sm"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Good (51-70%)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 bg-emerald-500 rounded-full shadow-sm"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ready (71-100%)</span>
            </div>
          </div>
        </div>

        <div className="mt-8 p-5 bg-teal-50/50 border border-teal-100 rounded-2xl flex items-start gap-4">
          <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-1">AI Diagnostic Insight</p>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              Based on your <span className="text-teal-700 font-bold">{manualAreas.length} manual focus areas</span>, 
              your time-to-value for automation is estimated at <span className="text-teal-700 font-bold">4.2 months</span> with an efficiency gain of <span className="text-teal-700 font-bold">65%</span>.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-8">
        {/* Process Bottlenecks */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm">
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Technology Bottlenecks
            </h2>
            <p className="text-sm text-slate-500">
              Pain point intensity based on standardization and SOP maturity.
            </p>
          </div>

          <div className="h-[280px]">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={bottleneckData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <XAxis type="number" hide domain={[0, 100]} />
                  <YAxis 
                    type="category" 
                    dataKey="area" 
                    width={140} 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#64748b' }} 
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="intensity" radius={[0, 12, 12, 0]} barSize={20}>
                    {bottleneckData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
             </ResponsiveContainer>
          </div>
        </Card>

        {/* Risk Radar */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Capability Gap Radar
            </h2>
            <p className="text-sm text-slate-500">
              Target state blueprint across key transformation pillars.
            </p>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={riskRadarData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 10, fontWeight: 800, fill: '#475569' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar 
                  name="Current" 
                  dataKey="current" 
                  stroke="#94a3b8" 
                  fill="#94a3b8" 
                  fillOpacity={0.2} 
                  strokeWidth={2}
                />
                <Radar 
                  name="Target" 
                  dataKey="target" 
                  stroke="#1e3a8a" 
                  fill="#3b82f6" 
                  fillOpacity={0.3} 
                  strokeWidth={3}
                />
                <Legend iconType="circle" />
                <Tooltip 
                   contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}

