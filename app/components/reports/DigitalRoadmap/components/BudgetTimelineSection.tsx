import { Card } from './ui/card';
import { Sparkles, IndianRupee, Clock, TrendingUp } from 'lucide-react';

interface BudgetTimelineSectionProps {
  scenario: 'conservative' | 'balanced' | 'aggressive';
  data: any;
}

export function BudgetTimelineSection({ scenario, data }: BudgetTimelineSectionProps) {
  const budgetTier = data['budget-range'] === 'high' ? 1.5 : data['budget-range'] === 'low' ? 0.7 : 1;
  const implementationSpeed = data['implementation-speed'] === 'sequential' ? 'conservative' : (data['implementation-speed'] === 'phased' ? 'balanced' : 'aggressive');
  
  const effectiveScenario = scenario || implementationSpeed;

  const scenarioData = {
    conservative: {
      totalBudget: 3200000 * budgetTier,
      timeline: 30,
      roi: 2100000 * budgetTier,
      phases: [
        { phase: 'Phase 1', months: '0-8', budget: 1100000 * budgetTier, focus: 'Foundation & Quick Wins' },
        { phase: 'Phase 2', months: '9-18', budget: 1200000 * budgetTier, focus: 'Process Automation' },
        { phase: 'Phase 3', months: '19-30', budget: 900000 * budgetTier, focus: 'Analytics & Optimization' },
      ],
      milestones: [
        { month: 6, event: 'Self-Service Portal Live', type: 'delivery' },
        { month: 12, event: 'First ROI Measurement', type: 'value' },
        { month: 18, event: 'Workflow Automation Complete', type: 'delivery' },
        { month: 24, event: 'Analytics Platform Deployed', type: 'delivery' },
        { month: 30, event: 'Full Value Realization', type: 'value' },
      ]
    },
    balanced: {
      totalBudget: 4200000 * budgetTier,
      timeline: 24,
      roi: 2800000 * budgetTier,
      phases: [
        { phase: 'Phase 1', months: '0-6', budget: 1400000 * budgetTier, focus: 'Foundation & Core Platform' },
        { phase: 'Phase 2', months: '7-14', budget: 1600000 * budgetTier, focus: 'Automation & Integration' },
        { phase: 'Phase 3', months: '15-24', budget: 1200000 * budgetTier, focus: 'AI & Advanced Analytics' },
      ],
      milestones: [
        { month: 4, event: 'Mobile App & Portal Live', type: 'delivery' },
        { month: 9, event: 'Integration Layer Complete', type: 'delivery' },
        { month: 12, event: '50% ROI Realized', type: 'value' },
        { month: 16, event: 'AI Chatbot Deployed', type: 'delivery' },
        { month: 24, event: 'Full Capability & ROI', type: 'value' },
      ]
    },
    aggressive: {
      totalBudget: 5500000 * budgetTier,
      timeline: 18,
      roi: 3400000 * budgetTier,
      phases: [
        { phase: 'Phase 1', months: '0-5', budget: 2000000 * budgetTier, focus: 'Rapid Platform Deployment' },
        { phase: 'Phase 2', months: '6-11', budget: 2100000 * budgetTier, focus: 'Full Automation Suite' },
        { phase: 'Phase 3', months: '12-18', budget: 1400000 * budgetTier, focus: 'AI & Predictive HR' },
      ],
      milestones: [
        { month: 3, event: 'Core Platform Go-Live', type: 'delivery' },
        { month: 6, event: 'All Integrations Live', type: 'delivery' },
        { month: 9, event: 'AI & Analytics Active', type: 'delivery' },
        { month: 12, event: '70% ROI Realized', type: 'value' },
        { month: 18, event: 'Full Transformation Complete', type: 'value' },
      ]
    }
  };

  const activeData = scenarioData[effectiveScenario];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Budget & Investment Timeline
        </h1>
        <p className="text-slate-600">
          Financial planning with scenario-based timelines enables realistic executive expectations 
          and phased budget allocation aligned to value delivery milestones.
        </p>
      </div>

      {/* Scenario Overview */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-slate-50 border-slate-200">
        <div className="flex items-start gap-4 mb-6">
          <div className="p-3 bg-white rounded-lg border border-blue-200 shadow-sm">
            <Sparkles className="w-6 h-6 text-blue-900" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-1">
              {scenario.charAt(0).toUpperCase() + scenario.slice(1)} Scenario Overview
            </h2>
            <p className="text-sm text-slate-600">
              {scenario === 'conservative' && 'Lower risk approach with extended timeline, allowing for organizational learning and budget spread.'}
              {scenario === 'balanced' && 'Recommended approach balancing speed, risk, and investment for optimal value delivery.'}
              {scenario === 'aggressive' && 'Accelerated transformation requiring higher upfront investment and strong change management.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 rounded">
                <IndianRupee className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Total Investment</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(data.totalBudget / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-900 w-full"></div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-teal-50 rounded">
                <Clock className="w-5 h-5 text-teal-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500">Timeline</p>
                <p className="text-2xl font-bold text-slate-900">{data.timeline} mo</p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-teal-600 w-full"></div>
            </div>
          </div>

          <div className="p-6 bg-white rounded-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-50 rounded">
                <TrendingUp className="w-5 h-5 text-green-700" />
              </div>
              <div>
                <p className="text-xs text-slate-500">24-Month ROI</p>
                <p className="text-2xl font-bold text-slate-900">
                  ${(data.roi / 1000000).toFixed(1)}M
                </p>
              </div>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-600 w-full"></div>
            </div>
          </div>
        </div>
      </Card>

      {/* Combined Budget & Timeline */}
      <Card className="p-8 bg-white border-slate-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Integrated Budget & Timeline View
          </h2>
          <p className="text-sm text-slate-600">
            Phased investment plan aligned to capability delivery and value realization milestones. 
            This view shows budget allocation, key deliverables, and expected ROI timing on a single axis.
          </p>
        </div>

        {/* Timeline Visualization */}
        <div className="relative">
          {/* Timeline Bar */}
          <div className="h-20 bg-slate-100 rounded-lg relative overflow-hidden mb-8">
            {activeData.phases.map((phase: any, index: number) => {
              const [start, end] = (phase.months as string).split('-').map((m: string) => parseInt(m));
              const width = ((end - start + 1) / data.timeline) * 100;
              const left = (start / data.timeline) * 100;
              
              const colors = [
                'bg-blue-900',
                'bg-blue-700',
                'bg-teal-600'
              ];

              return (
                <div
                  key={index}
                  className={`absolute top-0 h-full ${colors[index]} flex flex-col items-center justify-center text-white border-r-2 border-white`}
                  style={{ left: `${left}%`, width: `${width}%` }}
                >
                  <p className="text-xs font-semibold">{phase.phase}</p>
                  <p className="text-xs opacity-80">Months {phase.months}</p>
                </div>
              );
            })}
          </div>

          {/* Phase Details */}
          <div className="space-y-4 mb-8">
            {activeData.phases.map((phase: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900 mb-1">{phase.phase}: {phase.focus}</p>
                  <p className="text-xs text-slate-600">Duration: {phase.months} months</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-blue-900">${(phase.budget / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-slate-500">Budget</p>
                </div>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className="border-t border-slate-200 pt-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Key Milestones & Value Realization</h3>
            
            <div className="relative h-32 bg-slate-50 rounded-lg p-4">
              {/* Timeline axis */}
              <div className="absolute bottom-4 left-4 right-4 h-0.5 bg-slate-300"></div>
              
              {/* Milestone markers */}
              {activeData.milestones.map((milestone: any, index: number) => {
                const position = (milestone.month / activeData.timeline) * 100;
                const isValue = milestone.type === 'value';
                
                return (
                  <div
                    key={index}
                    className="absolute bottom-4"
                    style={{ left: `calc(1rem + ${position}% - 8px)` }}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 border-white shadow-md ${
                      isValue ? 'bg-green-600' : 'bg-blue-900'
                    }`}></div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                      <p className={`text-xs font-medium ${isValue ? 'text-green-900' : 'text-blue-900'}`}>
                        M{milestone.month}
                      </p>
                      <p className="text-xs text-slate-600 max-w-32 text-center">{milestone.event}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex items-center gap-6 justify-center">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-900 rounded-full"></div>
                <span className="text-xs text-slate-600">Platform Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                <span className="text-xs text-slate-600">Value Realization</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900 mb-1">AI Insight</p>
            <p className="text-sm text-slate-700">
              {scenario === 'conservative' && 'This scenario minimizes risk but extends time-to-value. Consider accelerating Phase 1 quick wins to build organizational momentum.'}
              {scenario === 'balanced' && 'Recommended scenario. Optimal balance of risk, investment pace, and value realization based on your readiness profile.'}
              {scenario === 'aggressive' && 'High-speed transformation requires exceptional change management and strong executive air cover. Ensure governance structure is robust before proceeding.'}
            </p>
          </div>
        </div>
      </Card>

      {/* Investment Breakdown */}
      <Card className="p-8 bg-white border-slate-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Investment Category Breakdown
          </h2>
          <p className="text-sm text-slate-600">
            Estimated allocation across technology, services, and organizational change categories.
          </p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Platform & Licenses</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">45%</p>
            <p className="text-xs text-slate-600">${((data.totalBudget * 0.45) / 1000000).toFixed(1)}M</p>
          </div>

          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Implementation Services</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">30%</p>
            <p className="text-xs text-slate-600">${((data.totalBudget * 0.30) / 1000000).toFixed(1)}M</p>
          </div>

          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Change & Training</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">15%</p>
            <p className="text-xs text-slate-600">${((data.totalBudget * 0.15) / 1000000).toFixed(1)}M</p>
          </div>

          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <p className="text-xs text-slate-500 mb-2">Contingency</p>
            <p className="text-2xl font-bold text-slate-900 mb-1">10%</p>
            <p className="text-xs text-slate-600">${((data.totalBudget * 0.10) / 1000000).toFixed(1)}M</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

