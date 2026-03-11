import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle } from '../AssessmentComponents';
import { Slider } from '../ui/slider';
import { DollarSign, TrendingUp, Target, Users2 } from 'lucide-react';

interface BudgetVisionSectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const mindsets = [
  { id: 'conservative', label: 'Conservative', desc: 'Risk-averse, incremental', icon: <Target className="w-6 h-6" /> },
  { id: 'balanced', label: 'Balanced', desc: 'Measured investment', icon: <TrendingUp className="w-6 h-6" /> },
  { id: 'aggressive', label: 'Aggressive', desc: 'Bold transformation', icon: <DollarSign className="w-6 h-6" /> },
];

const visionLevels = [
  { id: 'efficiency', label: 'Efficiency Engine', desc: 'Cost reduction focus', level: 1 },
  { id: 'experience', label: 'Experience Platform', desc: 'Employee-centric', level: 2 },
  { id: 'strategic', label: 'Strategic Partner', desc: 'Business enabler', level: 3 },
  { id: 'intelligence', label: 'Intelligence Hub', desc: 'Predictive & prescriptive', level: 4 },
];

export function BudgetVisionSection({ data, updateData, onComplete }: BudgetVisionSectionProps) {
  const budgetReadiness = data['budget-readiness'] || 40;
  const leadershipMindset = data['leadership-mindset'] || '';
  const hrVision = data['hr-vision'] || '';
  const ecosystemOpenness = data['ecosystem-openness'] || 50;

  return (
    <div>
      <SectionHeader
        number={10}
        title="Budget, Investment & Future Vision"
        description="Aligns ambition with funding reality and ecosystem readiness."
      />

      {/* Q35: Budget Readiness */}
      <QuestionCard>
        <QuestionTitle helper="Budget availability and approval likelihood">
          Budget Readiness & Availability
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>No Budget</span>
            <span className="font-bold text-green-600 text-lg">{budgetReadiness}%</span>
            <span>Approved & Ready</span>
          </div>
          <Slider
            value={[budgetReadiness]}
            onValueChange={(val) => updateData('budget-readiness', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { threshold: 25, label: 'Exploring', color: 'red' },
              { threshold: 50, label: 'Planning', color: 'amber' },
              { threshold: 75, label: 'Allocated', color: 'blue' },
              { threshold: 100, label: 'Approved', color: 'green' },
            ].map(({ threshold, label, color }) => (
              <div
                key={threshold}
                className={`p-4 rounded-lg text-center border-2 transition-all ${
                  budgetReadiness >= threshold
                    ? `border-${color}-500 bg-${color}-50`
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <DollarSign className={`w-6 h-6 mx-auto mb-1 ${budgetReadiness >= threshold ? `text-${color}-600` : 'text-slate-400'}`} />
                <p className="text-xs font-semibold text-slate-900">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </QuestionCard>

      {/* Q36: Leadership Mindset */}
      <QuestionCard>
        <QuestionTitle helper="Leadership's investment philosophy">
          Leadership Investment Mindset
        </QuestionTitle>
        <div className="grid grid-cols-3 gap-4">
          {mindsets.map((mindset) => (
            <button
              key={mindset.id}
              onClick={() => updateData('leadership-mindset', mindset.id)}
              className={`p-6 rounded-lg border-2 text-center transition-all ${
                leadershipMindset === mindset.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className={`mx-auto mb-3 ${leadershipMindset === mindset.id ? 'text-indigo-600' : 'text-slate-400'}`}>
                {mindset.icon}
              </div>
              <p className="font-semibold text-slate-900 mb-1">{mindset.label}</p>
              <p className="text-xs text-slate-600">{mindset.desc}</p>
            </button>
          ))}
        </div>
      </QuestionCard>

      {/* Q37: HR Future Vision */}
      <QuestionCard>
        <QuestionTitle helper="Aspirational vision for HR's future state">
          Future Vision for HR
        </QuestionTitle>
        <div className="space-y-3">
          {visionLevels.map((vision) => (
            <button
              key={vision.id}
              onClick={() => updateData('hr-vision', vision.id)}
              className={`w-full p-5 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                hrVision === vision.id
                  ? 'border-teal-600 bg-teal-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-teal-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  hrVision === vision.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {vision.level}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{vision.label}</p>
                  <p className="text-sm text-slate-600">{vision.desc}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-10 rounded ${
                      i < vision.level ? 'bg-teal-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </QuestionCard>

      {/* Q38: Ecosystem Openness */}
      <QuestionCard>
        <QuestionTitle helper="Willingness to work with external partners and vendors">
          Ecosystem & Partner Openness
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Build In-House</span>
            <span className="font-bold text-purple-600 text-lg">{ecosystemOpenness}%</span>
            <span>Partner Ecosystem</span>
          </div>
          <Slider
            value={[ecosystemOpenness]}
            onValueChange={(val) => updateData('ecosystem-openness', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="mt-4 p-5 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-3">
              <Users2 className={`w-8 h-8 ${ecosystemOpenness > 60 ? 'text-purple-600' : 'text-slate-400'}`} />
              <div>
                <p className="font-semibold text-slate-900">
                  {ecosystemOpenness < 30 ? 'In-House First' : ecosystemOpenness < 70 ? 'Hybrid Approach' : 'Partner-Centric'}
                </p>
                <p className="text-sm text-slate-600 mt-1">
                  {ecosystemOpenness < 30 
                    ? 'Preference for building and maintaining internally' 
                    : ecosystemOpenness < 70 
                    ? 'Open to selective partnerships'
                    : 'Embraces best-of-breed vendor ecosystem'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </QuestionCard>
    </div>
  );
}

