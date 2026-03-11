import { Card } from './ui/card';
import { Sparkles, Shield, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface GovernanceSectionProps {
  data: any;
}

export function GovernanceSection({ data }: GovernanceSectionProps) {
  const kpiMaturity = data['data-quality'] || 45;
  const complianceAutomation = data['compliance-automation'] || 55;

  const kpis = [
    { category: 'Efficiency', metric: 'HR Cost per Employee', current: '$420', target: '$310', status: 'off', impact: 'High' },
    { category: 'Experience', metric: 'Employee eNPS', current: '24', target: '45', status: 'steady', impact: 'Med' },
    { category: 'Service', metric: 'First Response Time', current: '18h', target: '2.5h', status: 'on', impact: 'High' },
    { category: 'Compliance', metric: 'Data Error Rate', current: '12%', target: '< 2%', status: 'off', impact: 'Critical' },
  ];

  const scorecard = [
    { area: 'Data Privacy & GDPR', score: data['data-privacy'] || 85, status: 'secure' },
    { area: 'Algorithm Bias Controls', score: data['ai-familiarity'] > 60 ? 65 : 25, status: 'warning' },
    { area: 'Identity Management', score: 75, status: 'secure' },
    { area: 'Integration Security', score: data['api-readiness'] || 45, status: 'warning' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tight">
          Governance & KPI Framework
        </h1>
        <p className="text-slate-600 font-medium">
          Strategic oversight and measurement framework to ensure compliance with 
          {complianceAutomation}% automation readiness in governance processes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Governance Scorecard */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">Digital Governance Scorecard</h2>
            <p className="text-sm text-slate-500">Security and compliance health across pillars.</p>
          </div>
          <div className="space-y-4">
            {scorecard.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-slate-700">{item.area}</span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    item.score > 70 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full ${item.score > 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${item.score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* KPI Target Maturity */}
        <Card className="p-8 bg-slate-900 text-white shadow-xl">
          <div className="mb-8">
             <div className="flex items-center gap-3 mb-2">
                <Shield className="w-6 h-6 text-teal-400" />
                <h2 className="text-lg font-bold">Transformation KPIs</h2>
             </div>
             <p className="text-sm text-slate-400">Target metrics for roadmap success.</p>
          </div>
          <div className="space-y-6">
             {kpis.map((kpi, i) => (
               <div key={i} className="flex items-center justify-between group">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-400 mb-1">{kpi.category}</p>
                    <p className="text-sm font-bold text-white">{kpi.metric}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-400 line-through">{kpi.current}</p>
                    <p className="text-sm font-black text-white">{kpi.target}</p>
                  </div>
               </div>
             ))}
          </div>
        </Card>
      </div>

      <div className="p-6 bg-blue-50 border border-blue-100 rounded-3xl flex items-start gap-4">
         <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0" />
         <div>
            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">AI Governance Insight</p>
            <p className="text-sm text-slate-700 font-medium">
              Based on your {scorecard.filter(s => s.status === 'warning').length} governance gaps, 
              we recommend prioritizing <span className="text-blue-900 font-bold">Algorithm Bias Controls</span> 
              before scaling AI initiatives to mitigate legal and ethical risks.
            </p>
         </div>
      </div>
    </div>
  );
}
