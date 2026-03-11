import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle } from '../AssessmentComponents';
import { Slider } from '../ui/slider';
import { Building2, Users, Target, Clock } from 'lucide-react';

interface OperatingModelSectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const operatingModels = [
  { id: 'centralized', label: 'Centralized', desc: 'Single HR function' },
  { id: 'decentralized', label: 'Decentralized', desc: 'Business unit HR' },
  { id: 'hybrid', label: 'Hybrid', desc: 'Mixed model' },
  { id: 'shared-services', label: 'Shared Services', desc: 'CoE + SSC + HRBP' },
];

export function OperatingModelSection({ data, updateData, onComplete }: OperatingModelSectionProps) {
  const operatingModel = data['operating-model'] || '';
  const sharedServicesMaturity = data['shared-services-maturity'] || 30;
  const slaTracking = data['sla-tracking'] || false;
  const effortSplit = data['effort-split'] || 70;

  return (
    <div>
      <SectionHeader
        number={7}
        title="HR Operating Model & Shared Services"
        description="Defines how HR time is spent and where automation frees capacity."
      />

      {/* Q25: Operating Model */}
      <QuestionCard>
        <QuestionTitle helper="Current HR service delivery model">
          HR Operating Model
        </QuestionTitle>
        <div className="grid grid-cols-2 gap-4">
          {operatingModels.map((model) => (
            <button
              key={model.id}
              onClick={() => updateData('operating-model', model.id)}
              className={`p-6 rounded-lg border-2 text-left transition-all ${
                operatingModel === model.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <Building2 className={`w-8 h-8 mb-3 ${operatingModel === model.id ? 'text-indigo-600' : 'text-slate-400'}`} />
              <p className="font-semibold text-slate-900 mb-1">{model.label}</p>
              <p className="text-xs text-slate-600">{model.desc}</p>
            </button>
          ))}
        </div>
      </QuestionCard>

      {/* Q26: Shared Services Maturity */}
      <QuestionCard>
        <QuestionTitle helper="Maturity of HR shared services capability">
          Shared Services Maturity
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>No Shared Services</span>
            <span className="font-bold text-purple-600 text-lg">{sharedServicesMaturity}%</span>
            <span>Mature SSC</span>
          </div>
          <Slider
            value={[sharedServicesMaturity]}
            onValueChange={(val) => updateData('shared-services-maturity', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className={`p-4 rounded-lg text-center ${sharedServicesMaturity < 33 ? 'bg-red-50 border-2 border-red-500' : 'bg-slate-50'}`}>
              <p className="text-sm font-semibold text-slate-900">Emerging</p>
              <p className="text-xs text-slate-600 mt-1">0-33%</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${sharedServicesMaturity >= 33 && sharedServicesMaturity < 66 ? 'bg-amber-50 border-2 border-amber-500' : 'bg-slate-50'}`}>
              <p className="text-sm font-semibold text-slate-900">Developing</p>
              <p className="text-xs text-slate-600 mt-1">33-66%</p>
            </div>
            <div className={`p-4 rounded-lg text-center ${sharedServicesMaturity >= 66 ? 'bg-green-50 border-2 border-green-500' : 'bg-slate-50'}`}>
              <p className="text-sm font-semibold text-slate-900">Mature</p>
              <p className="text-xs text-slate-600 mt-1">66-100%</p>
            </div>
          </div>
        </div>
      </QuestionCard>

      {/* Q27: SLA Tracking */}
      <QuestionCard>
        <QuestionTitle helper="Are HR service level agreements tracked?">
          SLA Tracking & Monitoring
        </QuestionTitle>
        <div className="flex gap-4">
          <button
            onClick={() => updateData('sla-tracking', true)}
            className={`flex-1 p-6 rounded-lg border-2 transition-all ${
              slaTracking === true
                ? 'border-green-600 bg-green-50'
                : 'border-slate-200 bg-white hover:border-green-300'
            }`}
          >
            <Target className={`w-10 h-10 mx-auto mb-3 ${slaTracking === true ? 'text-green-600' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900 text-center mb-1">Yes</p>
            <p className="text-xs text-slate-600 text-center">SLAs tracked & reported</p>
          </button>
          <button
            onClick={() => updateData('sla-tracking', false)}
            className={`flex-1 p-6 rounded-lg border-2 transition-all ${
              slaTracking === false
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <Clock className={`w-10 h-10 mx-auto mb-3 ${slaTracking === false ? 'text-indigo-600' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900 text-center mb-1">No</p>
            <p className="text-xs text-slate-600 text-center">No formal SLA tracking</p>
          </button>
        </div>
      </QuestionCard>

      {/* Q28: Effort Split */}
      <QuestionCard>
        <QuestionTitle helper="How is HR effort divided between transactional and strategic work?">
          HR Effort Split: Transactional vs Strategic
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-red-600">{effortSplit}%</p>
              <p className="text-xs text-slate-600 mt-1">Transactional</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{100 - effortSplit}%</p>
              <p className="text-xs text-slate-600 mt-1">Strategic</p>
            </div>
          </div>
          <div className="relative h-8 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full bg-red-500 transition-all"
              style={{ width: `${effortSplit}%` }}
            />
            <div
              className="absolute right-0 top-0 h-full bg-green-500 transition-all"
              style={{ width: `${100 - effortSplit}%` }}
            />
          </div>
          <Slider
            value={[effortSplit]}
            onValueChange={(val) => updateData('effort-split', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-700">
              {effortSplit > 70 
                ? '🔴 High transactional burden - automation opportunity' 
                : effortSplit > 40 
                ? '🟡 Balanced mix - room for improvement'
                : '🟢 Strategic focus - good automation coverage'}
            </p>
          </div>
        </div>
      </QuestionCard>
    </div>
  );
}

