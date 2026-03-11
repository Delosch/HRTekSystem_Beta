import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle, SelectableCard } from '../AssessmentComponents';
import { Slider } from '../ui/slider';
import { TrendingUp, Target, Lightbulb, Users, DollarSign, Globe, BarChart3, Zap } from 'lucide-react';

interface BusinessStrategySectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const businessDrivers = [
  { id: 'growth', label: 'Revenue Growth & Market Expansion', icon: <TrendingUp className="w-6 h-6" /> },
  { id: 'efficiency', label: 'Cost Efficiency & Productivity', icon: <DollarSign className="w-6 h-6" /> },
  { id: 'innovation', label: 'Digital Innovation & Transformation', icon: <Lightbulb className="w-6 h-6" /> },
  { id: 'talent', label: 'Talent Acquisition & Retention', icon: <Users className="w-6 h-6" /> },
  { id: 'global', label: 'Global Expansion & Scalability', icon: <Globe className="w-6 h-6" /> },
  { id: 'analytics', label: 'Data-Driven Decision Making', icon: <BarChart3 className="w-6 h-6" /> },
  { id: 'agility', label: 'Business Agility & Speed', icon: <Zap className="w-6 h-6" /> },
];

const hrRoles = [
  { id: 'transactional', label: 'Transactional Admin', level: 1 },
  { id: 'compliance', label: 'Compliance Partner', level: 2 },
  { id: 'strategic', label: 'Strategic Advisor', level: 3 },
  { id: 'intelligence', label: 'Intelligence Hub', level: 4 },
];

const sponsors = [
  { id: 'chro', label: 'CHRO' },
  { id: 'ceo', label: 'CEO' },
  { id: 'coo', label: 'COO' },
  { id: 'cfo', label: 'CFO' },
  { id: 'cio', label: 'CIO/CTO' },
];

const outcomes = [
  { id: 'employee-experience', label: 'Employee Experience' },
  { id: 'talent-quality', label: 'Talent Quality' },
  { id: 'cost-reduction', label: 'Cost Reduction' },
  { id: 'speed', label: 'Speed to Decision' },
  { id: 'compliance', label: 'Risk & Compliance' },
  { id: 'analytics', label: 'People Analytics' },
];

export function BusinessStrategySection({ data, updateData, onComplete }: BusinessStrategySectionProps) {
  const selectedDrivers = data['drivers'] || [];
  const alignmentScore = data['alignment'] || 50;
  const hrRole = data['hr-role'] || '';
  const sponsor = data['sponsor'] || '';
  const selectedOutcomes = data['outcomes'] || [];

  const handleDriverToggle = (id: string) => {
    const current = [...selectedDrivers];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else if (current.length < 3) {
      current.push(id);
    }
    updateData('drivers', current);
  };

  const handleOutcomeToggle = (id: string) => {
    const current = [...selectedOutcomes];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    updateData('outcomes', current);
  };

  return (
    <div>
      <SectionHeader
        number={1}
        title="Business Strategy & Transformation Intent"
        description="This aligns HR transformation with business strategy and leadership priorities."
      />

      {/* Q1: Business Drivers */}
      <QuestionCard>
        <QuestionTitle helper="Select up to 3 primary drivers">
          What are the top business drivers for your HR transformation?
        </QuestionTitle>
        <div className="grid grid-cols-2 gap-4">
          {businessDrivers.map((driver) => (
            <SelectableCard
              key={driver.id}
              label={driver.label}
              icon={driver.icon}
              selected={selectedDrivers.includes(driver.id)}
              onClick={() => handleDriverToggle(driver.id)}
              disabled={selectedDrivers.length >= 3 && !selectedDrivers.includes(driver.id)}
            />
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">{selectedDrivers.length} of 3 selected</p>
      </QuestionCard>

      {/* Q2: Strategy Alignment */}
      <QuestionCard>
        <QuestionTitle helper="How well aligned is HR transformation with overall business strategy?">
          HR-Business Strategy Alignment
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Disconnected</span>
            <span className="font-bold text-indigo-600 text-lg">{alignmentScore}%</span>
            <span>Fully Aligned</span>
          </div>
          <Slider
            value={[alignmentScore]}
            onValueChange={(val) => updateData('alignment', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </QuestionCard>

      {/* Q3: Future HR Role */}
      <QuestionCard>
        <QuestionTitle helper="Select the target maturity level for HR's role">
          What role should HR play in the future?
        </QuestionTitle>
        <div className="space-y-3">
          {hrRoles.map((role) => (
            <button
              key={role.id}
              onClick={() => updateData('hr-role', role.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                hrRole === role.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  hrRole === role.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {role.level}
                </div>
                <span className="font-medium text-slate-900">{role.label}</span>
              </div>
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 rounded ${
                      i < role.level ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </QuestionCard>

      {/* Q4: Executive Sponsor */}
      <QuestionCard>
        <QuestionTitle helper="Who is championing this transformation?">
          Executive Sponsorship Level
        </QuestionTitle>
        <div className="grid grid-cols-3 gap-4">
          {sponsors.map((s) => (
            <button
              key={s.id}
              onClick={() => updateData('sponsor', s.id)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                sponsor === s.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <p className="font-bold text-lg text-slate-900">{s.label}</p>
            </button>
          ))}
        </div>
      </QuestionCard>

      {/* Q5: Outcome Priorities */}
      <QuestionCard>
        <QuestionTitle helper="Select all priority outcomes">
          What outcomes matter most?
        </QuestionTitle>
        <div className="grid grid-cols-3 gap-3">
          {outcomes.map((outcome) => (
            <button
              key={outcome.id}
              onClick={() => handleOutcomeToggle(outcome.id)}
              className={`px-4 py-3 rounded-full border-2 text-sm font-medium transition-all ${
                selectedOutcomes.includes(outcome.id)
                  ? 'border-teal-600 bg-teal-50 text-teal-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
              }`}
            >
              {outcome.label}
            </button>
          ))}
        </div>
      </QuestionCard>
    </div>
  );
}

