import { Card } from './ui/card';
import { Sparkles, Target, Zap, TrendingUp, Lightbulb } from 'lucide-react';

interface LivingRoadmapSectionProps {
  scenario: 'conservative' | 'balanced' | 'aggressive';
  data: any;
}

export function LivingRoadmapSection({ scenario, data }: LivingRoadmapSectionProps) {
  const maturityScore = data['overallScore'] || 62;
  const targetMaturity = Math.min(95, maturityScore + 25);
  const adoptionConfidence = data['change-readiness'] || 76;
  
  const currentScenario = scenario || (data['implementation-speed'] === 'sequential' ? 'conservative' : (data['implementation-speed'] === 'phased' ? 'balanced' : 'aggressive'));

  const roadmapData: any = {
    conservative: {
      phases: [
        {
          name: 'Phase 1 (0-8 months)',
          foundational: [
            { name: 'Data Migration & Cleansing', months: [0, 1, 2] },
            { name: 'API Integration Layer', months: [2, 3, 4, 5] },
          ],
          tactical: [
            { name: 'Self-Service Portal', months: [1, 2, 3, 4] },
            { name: 'Mobile App MVP', months: [3, 4, 5, 6] },
          ],
          strategic: [],
          innovative: []
        },
        {
          name: 'Phase 2 (9-18 months)',
          foundational: [
            { name: 'Data Governance Framework', months: [9, 10] },
          ],
          tactical: [
            { name: 'Workflow Automation', months: [9, 10, 11, 12, 13] },
            { name: 'Reporting Enhancement', months: [12, 13, 14] },
          ],
          strategic: [
            { name: 'Core Analytics Platform', months: [14, 15, 16, 17] },
          ],
          innovative: []
        },
        {
          name: 'Phase 3 (19-30 months)',
          foundational: [],
          tactical: [
            { name: 'Advanced Reporting', months: [19, 20, 21] },
          ],
          strategic: [
            { name: 'Predictive Analytics', months: [22, 23, 24, 25] },
          ],
          innovative: [
            { name: 'AI Chatbot Pilot', months: [26, 27, 28, 29] },
          ]
        }
      ]
    },
    balanced: {
      phases: [
        {
          name: 'Phase 1 (0-6 months)',
          foundational: [
            { name: 'API Integration Layer', months: [0, 1, 2, 3] },
            { name: 'Data Migration', months: [0, 1, 2] },
          ],
          tactical: [
            { name: 'Self-Service Portal', months: [1, 2, 3] },
            { name: 'Mobile App', months: [2, 3, 4, 5] },
          ],
          strategic: [],
          innovative: []
        },
        {
          name: 'Phase 2 (7-14 months)',
          foundational: [
            { name: 'Data Governance', months: [7, 8] },
          ],
          tactical: [
            { name: 'Workflow Automation Suite', months: [7, 8, 9, 10, 11] },
          ],
          strategic: [
            { name: 'Analytics Platform', months: [9, 10, 11, 12] },
            { name: 'Integration Optimization', months: [12, 13] },
          ],
          innovative: []
        },
        {
          name: 'Phase 3 (15-24 months)',
          foundational: [],
          tactical: [
            { name: 'Process Optimization', months: [15, 16] },
          ],
          strategic: [
            { name: 'Predictive Talent Analytics', months: [17, 18, 19, 20] },
          ],
          innovative: [
            { name: 'AI Chatbot', months: [17, 18, 19] },
            { name: 'Talent Intelligence', months: [21, 22, 23] },
          ]
        }
      ]
    },
    aggressive: {
      phases: [
        {
          name: 'Phase 1 (0-5 months)',
          foundational: [
            { name: 'Rapid API Integration', months: [0, 1, 2] },
            { name: 'Data Migration', months: [0, 1] },
          ],
          tactical: [
            { name: 'Self-Service Portal', months: [1, 2, 3] },
            { name: 'Mobile App', months: [2, 3, 4] },
          ],
          strategic: [
            { name: 'Core Analytics', months: [3, 4] },
          ],
          innovative: []
        },
        {
          name: 'Phase 2 (6-11 months)',
          foundational: [
            { name: 'Data Governance', months: [6, 7] },
          ],
          tactical: [
            { name: 'Full Workflow Automation', months: [6, 7, 8, 9] },
          ],
          strategic: [
            { name: 'Advanced Analytics Platform', months: [8, 9, 10] },
          ],
          innovative: [
            { name: 'AI Chatbot', months: [9, 10] },
          ]
        },
        {
          name: 'Phase 3 (12-18 months)',
          foundational: [],
          tactical: [],
          strategic: [
            { name: 'Predictive HR Suite', months: [12, 13, 14, 15] },
          ],
          innovative: [
            { name: 'Talent Intelligence AI', months: [14, 15, 16] },
            { name: 'Autonomous HR Processes', months: [16, 17] },
          ]
        }
      ]
    }
  };

  const activeRoadmap = roadmapData[currentScenario];
  const maxMonths = currentScenario === 'conservative' ? 30 : currentScenario === 'balanced' ? 24 : 18;

  const swimlanes = [
    { name: 'Foundational', color: 'bg-slate-600', textColor: 'text-slate-900', bgColor: 'bg-slate-50' },
    { name: 'Tactical', color: 'bg-blue-600', textColor: 'text-blue-900', bgColor: 'bg-blue-50' },
    { name: 'Strategic', color: 'bg-blue-900', textColor: 'text-blue-900', bgColor: 'bg-blue-50' },
    { name: 'Innovative', color: 'bg-teal-600', textColor: 'text-teal-900', bgColor: 'bg-teal-50' },
  ];

  const getAllInitiatives = () => {
    const initiatives: any[] = [];
    activeRoadmap.phases.forEach((phase: any) => {
      phase.foundational.forEach((item: any) => initiatives.push({ ...item, type: 'foundational' }));
      phase.tactical.forEach((item: any) => initiatives.push({ ...item, type: 'tactical' }));
      phase.strategic.forEach((item: any) => initiatives.push({ ...item, type: 'strategic' }));
      phase.innovative.forEach((item: any) => initiatives.push({ ...item, type: 'innovative' }));
    });
    return initiatives;
  };

  const renderInitiativeBar = (initiative: any, swimlane: string) => {
    if (initiative.type !== swimlane.toLowerCase()) return null;

    const startMonth = initiative.months[0];
    const endMonth = initiative.months[initiative.months.length - 1];
    const duration = endMonth - startMonth + 1;
    const left = (startMonth / maxMonths) * 100;
    const width = (duration / maxMonths) * 100;

    const colorMap: any = {
      foundational: 'bg-slate-600',
      tactical: 'bg-blue-600',
      strategic: 'bg-blue-900',
      innovative: 'bg-teal-600'
    };

    return (
      <div
        key={initiative.name}
        className={`absolute h-10 ${colorMap[initiative.type]} rounded shadow-sm flex items-center px-3 text-white text-xs font-medium hover:shadow-lg transition-shadow cursor-pointer`}
        style={{ left: `${left}%`, width: `${width}%` }}
        title={`${initiative.name} (Month ${startMonth}-${endMonth})`}
      >
        <span className="truncate">{initiative.name}</span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 mb-2 italic tracking-tight">
          Adaptive Transformation Roadmap
        </h1>
        <p className="text-slate-600 font-medium">
          Your dynamic roadmap adapts as budgets, priorities, and readiness change. 
          This is a living decision support system.
        </p>
      </div>

      <Card className="p-8 bg-gradient-to-br from-teal-50 to-blue-50 border-2 border-teal-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-teal-300">
            <Target className="w-7 h-7 text-teal-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-black text-slate-900 mb-3 tracking-tight italic">Executive Summary</h2>
            <div className="grid grid-cols-4 gap-6 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Maturity Shift</p>
                <p className="text-2xl font-black text-blue-900">{maturityScore} → {targetMaturity}</p>
                <p className="text-[10px] font-bold text-blue-600">+{targetMaturity - maturityScore} POINTS</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">ROI Forecast</p>
                <p className="text-2xl font-black text-emerald-900">
                  {currentScenario === 'conservative' && '$2.1M'}
                  {currentScenario === 'balanced' && '$2.8M'}
                  {currentScenario === 'aggressive' && '$3.4M'}
                </p>
                <p className="text-[10px] font-bold text-emerald-600">24 MO HORIZON</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Confidence</p>
                <p className="text-2xl font-black text-teal-900">{adoptionConfidence}%</p>
                <p className="text-[10px] font-bold text-teal-600">ADOPTION READY</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Scenario</p>
                <p className="text-2xl font-black text-slate-900 uppercase">{currentScenario}</p>
                <p className="text-[10px] font-bold text-slate-600">PLAN TYPE</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-8 bg-white border-slate-200 shadow-sm overflow-hidden">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="text-lg font-black text-slate-900 italic tracking-tight mb-2">Transformation Timeline</h2>
            <p className="text-sm text-slate-500">Interactive roadmap sequencing across swimlanes.</p>
          </div>
          <div className="flex gap-4">
             {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${[ 'bg-slate-600', 'bg-blue-600', 'bg-blue-900', 'bg-teal-600'][i]}`} />
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{['Base', 'Tactical', 'Strategic', 'AI'][i]}</span>
                </div>
             ))}
          </div>
        </div>

        <div className="space-y-4">
          {swimlanes.map((swimlane, index) => {
            const initiatives = getAllInitiatives();
            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">
                   <span>{swimlane.name}</span>
                </div>
                <div className="relative h-14 bg-slate-50 rounded-2xl border border-slate-100 p-2 overflow-hidden">
                   {initiatives.map((initiative, idx) => renderInitiativeBar(initiative, swimlane.name))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="p-8 bg-slate-900 text-white rounded-3xl shadow-xl overflow-hidden relative">
         <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-32 h-32" />
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
               <TrendingUp className="w-6 h-6 text-teal-400" />
               <h2 className="text-xl font-bold italic tracking-tight">Adaptive Intelligence</h2>
            </div>
            <div className="grid grid-cols-2 gap-12">
               <div>
                  <h4 className="text-teal-400 font-bold mb-2 uppercase tracking-widest text-xs">Risk-Aware Sequencing</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Recalculates dependencies instantly when readiness scores shift, preventing "bottleneck fatigue" in Phase 1.
                  </p>
               </div>
               <div>
                  <h4 className="text-teal-400 font-bold mb-2 uppercase tracking-widest text-xs">Value Optimization</h4>
                  <p className="text-sm text-slate-400 leading-relaxed font-medium">
                    Prioritizes {currentScenario === 'aggressive' ? 'high-impact AI wins' : 'foundational stability'} based on your {currentScenario} profile.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
