import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle } from '../AssessmentComponents';
import { Slider } from '../ui/slider';
import { FileCheck, Book, AlertCircle, BarChart } from 'lucide-react';

interface ProcessMaturitySectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const processAreas = [
  { id: 'recruitment', label: 'Recruitment & Onboarding' },
  { id: 'performance', label: 'Performance Management' },
  { id: 'payroll', label: 'Payroll & Compensation' },
  { id: 'learning', label: 'Learning & Development' },
  { id: 'offboarding', label: 'Offboarding & Exit' },
];

export function ProcessMaturitySection({ data, updateData, onComplete }: ProcessMaturitySectionProps) {
  const standardization = data['standardization'] || 25;
  const sopMaturity = data['sop-maturity'] || 25;
  const manualAreas = data['manual-areas'] || [];
  const benchmarking = data['benchmarking'] || false;

  const handleManualAreaToggle = (id: string) => {
    const current = [...manualAreas];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    updateData('manual-areas', current);
  };

  return (
    <div>
      <SectionHeader
        number={2}
        title="HR Process Maturity & Standardization"
        description="Standardized processes are the foundation for automation and analytics."
      />

      {/* Q6: Process Standardization */}
      <QuestionCard>
        <QuestionTitle helper="How standardized are your HR processes across the organization?">
          Process Standardization Level
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Fragmented</span>
            <span className="font-bold text-indigo-600 text-lg">{standardization}%</span>
            <span>Fully Standardized</span>
          </div>
          <Slider
            value={[standardization]}
            onValueChange={(val) => updateData('standardization', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="mt-4 p-4 bg-slate-50 rounded-lg">
            <div className="flex items-start gap-3">
              <FileCheck className={`w-5 h-5 mt-0.5 ${standardization > 70 ? 'text-green-500' : 'text-amber-500'}`} />
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {standardization < 40 ? 'Low Standardization' : standardization < 70 ? 'Moderate Standardization' : 'High Standardization'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {standardization < 40 
                    ? 'Significant variation across departments and locations' 
                    : standardization < 70 
                    ? 'Some consistency with documented guidelines'
                    : 'Consistent processes with clear documentation'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </QuestionCard>

      {/* Q7: SOP Maturity */}
      <QuestionCard>
        <QuestionTitle helper="Level of Standard Operating Procedure documentation">
          SOP Documentation Maturity
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Undocumented</span>
            <span className="font-bold text-purple-600 text-lg">{sopMaturity}%</span>
            <span>Fully Documented</span>
          </div>
          <Slider
            value={[sopMaturity]}
            onValueChange={(val) => updateData('sop-maturity', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[25, 50, 75, 100].map((threshold) => (
              <div
                key={threshold}
                className={`p-3 rounded-lg text-center border-2 ${
                  sopMaturity >= threshold
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-slate-200 bg-slate-50'
                }`}
              >
                <Book className={`w-5 h-5 mx-auto mb-1 ${sopMaturity >= threshold ? 'text-purple-600' : 'text-slate-400'}`} />
                <p className="text-xs font-medium">{threshold}%</p>
              </div>
            ))}
          </div>
        </div>
      </QuestionCard>

      {/* Q8: Manual Process Areas */}
      <QuestionCard>
        <QuestionTitle helper="Which areas still rely heavily on manual work?">
          Manual Process Touchpoints
        </QuestionTitle>
        <div className="space-y-3">
          {processAreas.map((area) => {
            const isManual = manualAreas.includes(area.id);
            return (
              <button
                key={area.id}
                onClick={() => handleManualAreaToggle(area.id)}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                  isManual
                    ? 'border-red-500 bg-red-50'
                    : 'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertCircle className={`w-5 h-5 ${isManual ? 'text-red-500' : 'text-green-500'}`} />
                  <span className="font-medium text-slate-900">{area.label}</span>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  isManual ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {isManual ? 'Manual' : 'Automated'}
                </span>
              </button>
            );
          })}
        </div>
      </QuestionCard>

      {/* Q9: Benchmarking */}
      <QuestionCard>
        <QuestionTitle helper="Do you track HR metrics against industry benchmarks?">
          Process Benchmarking
        </QuestionTitle>
        <div className="flex gap-4">
          <button
            onClick={() => updateData('benchmarking', true)}
            className={`flex-1 p-6 rounded-lg border-2 transition-all ${
              benchmarking === true
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <BarChart className="w-8 h-8 text-indigo-600 mb-2" />
            <p className="font-semibold text-slate-900 mb-1">Yes</p>
            <p className="text-xs text-slate-600">We actively benchmark HR processes</p>
          </button>
          <button
            onClick={() => updateData('benchmarking', false)}
            className={`flex-1 p-6 rounded-lg border-2 transition-all ${
              benchmarking === false
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <AlertCircle className="w-8 h-8 text-slate-400 mb-2" />
            <p className="font-semibold text-slate-900 mb-1">No</p>
            <p className="text-xs text-slate-600">Not currently benchmarking</p>
          </button>
        </div>
      </QuestionCard>
    </div>
  );
}

