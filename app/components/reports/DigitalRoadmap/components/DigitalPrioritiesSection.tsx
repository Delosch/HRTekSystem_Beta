import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, Info, Target } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DigitalPrioritiesSectionProps {
  data: any;
}

export function DigitalPrioritiesSection({ data }: DigitalPrioritiesSectionProps) {
  const [selectedApproach, setSelectedApproach] = useState<string | null>(null);

  const priorities = data['priorities'] || ['self-service', 'analytics'];
  
  const priorityData = [
    { name: 'Self-Service Portal', readiness: 85, impact: 90, investment: 800, type: 'quick-win', color: '#14b8a6', active: priorities.includes('self-service') },
    { name: 'Mobile App', readiness: priorities.includes('mobile') ? 80 : 75, impact: 85, investment: 1200, type: 'quick-win', color: '#14b8a6', active: priorities.includes('mobile') },
    { name: 'Workflow Automation', readiness: 60, impact: 95, investment: 2000, type: 'strategic', color: '#1e3a8a', active: priorities.includes('automation') },
    { name: 'Analytics Platform', readiness: 45, impact: 90, investment: 1800, type: 'strategic', color: '#1e3a8a', active: priorities.includes('analytics') },
    { name: 'AI Chatbot', readiness: 40, impact: 75, investment: 1500, type: 'tactical', color: '#3b82f6', active: priorities.includes('ai') },
    { name: 'API Integration Layer', readiness: 50, impact: 85, investment: 2200, type: 'foundational', color: '#64748b', active: priorities.includes('integration') },
    { name: 'Data Governance', readiness: 55, impact: 70, investment: 900, type: 'foundational', color: '#64748b', active: true },
    { name: 'Talent Intelligence', readiness: 25, impact: 80, investment: 2500, type: 'innovative', color: '#8b5cf6', active: priorities.includes('ai') },
  ].filter(p => !priorities || p.active);

  const approaches = [
    {
      id: 'phased',
      title: 'Phased Rollout',
      badge: data['implementation-speed'] === 'phased' ? 'Recommended' : null,
      description: 'Staged implementation across business units with learning loops',
      pros: [
        'Lower adoption risk through controlled releases',
        'Ability to refine approach based on early feedback',
        'Easier change management and training logistics',
        'Manageable budget allocation across fiscal periods'
      ],
      cons: [
        'Longer time to full value realization (24-30 months)',
        'Potential for organizational impatience or fatigue',
        'Complexity in managing hybrid old/new processes'
      ]
    },
    {
      id: 'module',
      title: 'Module-by-Module',
      badge: data['implementation-speed'] === 'sequential' ? 'Recommended' : null,
      description: 'Sequential deployment by HR function (Recruit → Onboard → Manage)',
      pros: [
        'Deep functional optimization per module',
        'Allows HR teams to become experts incrementally',
        'Clear success milestones and ROI tracking per function',
        'Lower technical complexity than big bang'
      ],
      cons: [
        'Integration challenges between old and new modules',
        'Inconsistent employee experience during transition',
        'Dependency risks between modules may cause delays'
      ]
    },
    {
      id: 'pilot',
      title: 'Pilot → Scale → Optimize',
      badge: data['implementation-speed'] === 'pilot' || !data['implementation-speed'] ? 'Recommended' : null,
      description: 'Prototype with select group, then expand organization-wide',
      pros: [
        'Real-world validation before major investment',
        'Builds internal case studies and champions',
        'Identifies unforeseen issues in safe environment',
        'Highest confidence in final solution design'
      ],
      cons: [
        'Requires strong executive patience and commitment',
        'Pilot success may not predict scaled performance',
        'Dual-run costs during pilot and transition periods'
      ]
    }
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{data.name}</p>
          <p className="text-xs text-slate-600">Readiness: {data.readiness}%</p>
          <p className="text-xs text-slate-600">Impact: {data.impact}%</p>
          <p className="text-xs text-slate-600">Investment: ${data.investment}K</p>
          <p className="text-xs text-slate-500 mt-1 capitalize">{data.type.replace('-', ' ')}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Digital Priorities & Focus Areas
        </h1>
        <p className="text-slate-600">
          AI-driven prioritization balances business impact, organizational readiness, and investment 
          requirements to sequence initiatives for optimal value delivery and risk management.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 bg-blue-900 text-white col-span-1">
          <p className="text-xs font-bold uppercase tracking-widest opacity-60 mb-2">Priority Focus</p>
          <h3 className="text-3xl font-bold mb-4">{priorities.length} Areas</h3>
          <div className="space-y-2">
             {priorities.map((p: string) => (
               <div key={p} className="flex items-center gap-2 text-sm bg-white/10 px-3 py-1.5 rounded-lg border border-white/20">
                 <div className="w-1.5 h-1.5 bg-teal-400 rounded-full" />
                 <span className="capitalize">{p.replace('-', ' ')}</span>
               </div>
             ))}
          </div>
        </Card>

        {/* Impact vs Readiness Matrix */}
        <Card className="p-8 bg-white border-slate-200 col-span-2">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-2">
              HR Digital Priority Portfolio
            </h2>
            <p className="text-sm text-slate-600">
              Strategic priority based on business impact and organizational readiness.
            </p>
          </div>

          <ResponsiveContainer width="100%" height={280}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                type="number" 
                dataKey="readiness" 
                name="Readiness"
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
              />
              <YAxis 
                type="number" 
                dataKey="impact" 
                name="Impact"
                domain={[0, 100]}
                tick={{ fontSize: 11 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={priorityData}>
                {priorityData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    opacity={0.8}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Transformation Approach */}
      <Card className="p-8 bg-white border-slate-200">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-2 italic">
            Recommended Transformation Strategy
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Based on your urgency for {data['roi-priority'] || 'efficiency'}, 
            AI suggests the following deployment model.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {approaches.map((approach) => (
            <div
              key={approach.id}
              className={`p-6 border-2 rounded-2xl cursor-pointer transition-all ${
                selectedApproach === approach.id || approach.badge
                  ? 'border-blue-500 bg-blue-50/50 shadow-xl shadow-blue-500/10'
                  : 'border-slate-100 hover:border-blue-200 bg-white'
              }`}
              onClick={() => setSelectedApproach(selectedApproach === approach.id ? null : approach.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2 rounded-xl ${approach.badge ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   <Target className="w-5 h-5" />
                </div>
                {approach.badge && (
                  <span className="px-3 py-1 bg-teal-500 text-white text-[10px] font-black rounded-full uppercase tracking-widest">
                    {approach.badge}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">{approach.title}</h3>
              <p className="text-xs text-slate-600 mb-4 font-medium">{approach.description}</p>
              <div className="space-y-2">
                {approach.pros.slice(0, 2).map((pro, i) => (
                  <div key={i} className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                    <span>{pro}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-900 rounded-2xl text-white">
           <div className="flex items-start gap-4">
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                 <Sparkles className="w-6 h-6 text-teal-400" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1">AI Strategic Edge</p>
                 <p className="text-sm text-slate-300 font-medium">
                   Your selection of <span className="text-white font-bold">{priorities.join(' & ')}</span> indicates a 
                   {data['roi-priority'] === 'experience' ? ' employee-centric' : ' efficiency-first'} transformation path. 
                   Expected 12-month value: <span className="text-teal-400 font-bold">${((priorities.length * 400 + 200)).toLocaleString()}K savings.</span>
                 </p>
              </div>
           </div>
        </div>
      </Card>
    </div>
  );
}

