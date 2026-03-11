import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle, SelectableCard } from '../AssessmentComponents';
import { Monitor, Users, DollarSign, GraduationCap, TrendingUp, Frown, Meh, Smile } from 'lucide-react';

interface DigitalCapabilitySectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const hrAreas = [
  { id: 'core-hr', label: 'Core HR / HRIS', icon: <Monitor className="w-6 h-6" /> },
  { id: 'ats', label: 'Applicant Tracking (ATS)', icon: <Users className="w-6 h-6" /> },
  { id: 'payroll', label: 'Payroll & Benefits', icon: <DollarSign className="w-6 h-6" /> },
  { id: 'learning', label: 'Learning Management (LMS)', icon: <GraduationCap className="w-6 h-6" /> },
  { id: 'performance', label: 'Performance Management', icon: <TrendingUp className="w-6 h-6" /> },
];

const painPoints = [
  { id: 'manual-entry', label: 'Manual Data Entry' },
  { id: 'multiple-logins', label: 'Multiple Systems / Logins' },
  { id: 'no-integration', label: 'Lack of Integration' },
  { id: 'poor-ux', label: 'Poor User Experience' },
  { id: 'no-mobile', label: 'No Mobile Access' },
  { id: 'reporting', label: 'Weak Reporting Capabilities' },
];

export function DigitalCapabilitySection({ data, updateData, onComplete }: DigitalCapabilitySectionProps) {
  const digitizedAreas = data['digitized-areas'] || [];
  const selectedPainPoints = data['pain-points'] || [];
  const satisfaction = data['user-satisfaction'] || '';

  const handleAreaToggle = (id: string) => {
    const current = [...digitizedAreas];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    updateData('digitized-areas', current);
  };

  const handlePainPointToggle = (id: string) => {
    const current = [...selectedPainPoints];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else if (current.length < 3) {
      current.push(id);
    }
    updateData('pain-points', current);
  };

  return (
    <div>
      <SectionHeader
        number={3}
        title="Current Digital Capability Landscape"
        description="Identifies system gaps blocking experience and insight."
      />

      {/* Q10: Digitized Areas */}
      <QuestionCard>
        <QuestionTitle helper="Select all HR areas that are currently digitized">
          Which HR areas are digitized?
        </QuestionTitle>
        <div className="grid grid-cols-2 gap-4">
          {hrAreas.map((area) => (
            <SelectableCard
              key={area.id}
              label={area.label}
              icon={area.icon}
              selected={digitizedAreas.includes(area.id)}
              onClick={() => handleAreaToggle(area.id)}
            />
          ))}
        </div>
        <div className="mt-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm font-medium text-blue-900">
            Digitization Coverage: {digitizedAreas.length} of {hrAreas.length} areas
          </p>
          <div className="w-full bg-indigo-200 rounded-full h-2 mt-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all"
              style={{ width: `${(digitizedAreas.length / hrAreas.length) * 100}%` }}
            />
          </div>
        </div>
      </QuestionCard>

      {/* Q11: Pain Points */}
      <QuestionCard>
        <QuestionTitle helper="Select up to 3 biggest pain points">
          Top User Pain Points
        </QuestionTitle>
        <div className="grid grid-cols-2 gap-3">
          {painPoints.map((pain) => (
            <button
              key={pain.id}
              onClick={() => handlePainPointToggle(pain.id)}
              disabled={selectedPainPoints.length >= 3 && !selectedPainPoints.includes(pain.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedPainPoints.includes(pain.id)
                  ? 'border-red-500 bg-red-50'
                  : 'border-slate-200 bg-white hover:border-red-300'
              } ${selectedPainPoints.length >= 3 && !selectedPainPoints.includes(pain.id) ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center gap-2">
                {selectedPainPoints.includes(pain.id) && (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">
                      {selectedPainPoints.indexOf(pain.id) + 1}
                    </span>
                  </div>
                )}
                <p className="font-medium text-slate-900 text-sm">{pain.label}</p>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-slate-500 mt-3">{selectedPainPoints.length} of 3 selected</p>
      </QuestionCard>

      {/* Q12: User Satisfaction */}
      <QuestionCard>
        <QuestionTitle helper="Overall employee satisfaction with current HR systems">
          User Satisfaction Level
        </QuestionTitle>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => updateData('user-satisfaction', 'low')}
            className={`p-6 rounded-lg border-2 text-center transition-all ${
              satisfaction === 'low'
                ? 'border-red-500 bg-red-50'
                : 'border-slate-200 bg-white hover:border-red-300'
            }`}
          >
            <Frown className={`w-12 h-12 mx-auto mb-2 ${satisfaction === 'low' ? 'text-red-500' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900">Low</p>
            <p className="text-xs text-slate-600 mt-1">Frequent complaints</p>
          </button>
          <button
            onClick={() => updateData('user-satisfaction', 'medium')}
            className={`p-6 rounded-lg border-2 text-center transition-all ${
              satisfaction === 'medium'
                ? 'border-amber-500 bg-amber-50'
                : 'border-slate-200 bg-white hover:border-amber-300'
            }`}
          >
            <Meh className={`w-12 h-12 mx-auto mb-2 ${satisfaction === 'medium' ? 'text-amber-500' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900">Medium</p>
            <p className="text-xs text-slate-600 mt-1">Acceptable but improving</p>
          </button>
          <button
            onClick={() => updateData('user-satisfaction', 'high')}
            className={`p-6 rounded-lg border-2 text-center transition-all ${
              satisfaction === 'high'
                ? 'border-green-500 bg-green-50'
                : 'border-slate-200 bg-white hover:border-green-300'
            }`}
          >
            <Smile className={`w-12 h-12 mx-auto mb-2 ${satisfaction === 'high' ? 'text-green-500' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900">High</p>
            <p className="text-xs text-slate-600 mt-1">Positive feedback</p>
          </button>
        </div>
      </QuestionCard>
    </div>
  );
}

