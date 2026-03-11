import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle } from '../AssessmentComponents';
import { Slider } from '../ui/slider';
import { Rocket, Thermometer, Users, CheckCircle2 } from 'lucide-react';

interface ChangeReadinessSectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const changeApproaches = [
  { id: 'minimal', label: 'Minimal Support', desc: 'Ad-hoc communication', level: 1 },
  { id: 'structured', label: 'Structured Plan', desc: 'Basic change plan', level: 2 },
  { id: 'comprehensive', label: 'Comprehensive', desc: 'Full change program', level: 3 },
  { id: 'advanced', label: 'Advanced OCM', desc: 'Expert-led transformation', level: 4 },
];

export function ChangeReadinessSection({ data, updateData, onComplete }: ChangeReadinessSectionProps) {
  const pastSuccess = data['past-success'] || 50;
  const digitalCapability = data['digital-capability'] || 50;
  const changeApproach = data['change-approach'] || '';

  return (
    <div>
      <SectionHeader
        number={8}
        title="Change Management & Adoption Readiness"
        description="Low adoption readiness increases transformation risk."
      />

      {/* Q29: Past Success */}
      <QuestionCard>
        <QuestionTitle helper="Track record of successful change initiatives">
          Past Transformation Success Rate
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Poor Track Record</span>
            <span className="font-bold text-indigo-600 text-lg">{pastSuccess}%</span>
            <span>Excellent Track Record</span>
          </div>
          <Slider
            value={[pastSuccess]}
            onValueChange={(val) => updateData('past-success', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="mt-4 flex items-center justify-center gap-2">
            {[...Array(5)].map((_, i) => {
              const threshold = (i + 1) * 20;
              return (
                <div
                  key={i}
                  className={`flex-1 h-12 rounded-lg flex items-center justify-center transition-all ${
                    pastSuccess >= threshold
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {pastSuccess >= threshold && <CheckCircle2 className="w-6 h-6" />}
                </div>
              );
            })}
          </div>
        </div>
      </QuestionCard>

      {/* Q30: Digital Capability */}
      <QuestionCard>
        <QuestionTitle helper="Employee comfort level with digital tools">
          Employee Digital Capability
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-slate-600">Readiness Level</span>
            <div className="flex items-center gap-2">
              <Thermometer className={`w-6 h-6 ${digitalCapability > 70 ? 'text-green-500' : digitalCapability > 40 ? 'text-amber-500' : 'text-red-500'}`} />
              <span className="font-bold text-2xl text-slate-900">{digitalCapability}%</span>
            </div>
          </div>
          <div className="relative h-64 bg-gradient-to-t from-red-500 via-amber-500 to-green-500 rounded-lg p-4 flex flex-col justify-between">
            <div className="text-white text-sm font-medium">High Capability</div>
            <div
              className="absolute left-0 right-0 h-1 bg-white shadow-lg transition-all"
              style={{ bottom: `${digitalCapability}%` }}
            />
            <div className="text-white text-sm font-medium">Low Capability</div>
          </div>
          <Slider
            value={[digitalCapability]}
            onValueChange={(val) => updateData('digital-capability', val[0])}
            max={100}
            step={5}
            className="w-full mt-4"
          />
        </div>
      </QuestionCard>

      {/* Q31: Change Management Approach */}
      <QuestionCard>
        <QuestionTitle helper="Planned approach to change management">
          Change Management Maturity
        </QuestionTitle>
        <div className="space-y-3">
          {changeApproaches.map((approach) => (
            <button
              key={approach.id}
              onClick={() => updateData('change-approach', approach.id)}
              className={`w-full p-5 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                changeApproach === approach.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  changeApproach === approach.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {approach.level === 4 ? (
                    <Rocket className="w-6 h-6" />
                  ) : (
                    <span className="text-xl font-bold">{approach.level}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{approach.label}</p>
                  <p className="text-sm text-slate-600">{approach.desc}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-10 rounded ${
                      i < approach.level ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </QuestionCard>
    </div>
  );
}

