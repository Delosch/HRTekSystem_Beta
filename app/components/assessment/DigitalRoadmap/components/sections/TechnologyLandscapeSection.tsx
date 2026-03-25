import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle } from '../AssessmentComponents';
import { Slider } from '../ui/slider';
import { Server, Link, Wrench, Database } from 'lucide-react';

interface TechnologyLandscapeSectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const hcmPlatforms = [
  { id: 'oracle', label: 'Oracle HCM Cloud' },
  { id: 'sap', label: 'SAP SuccessFactors' },
  { id: 'workday', label: 'Workday' },
  { id: 'adp', label: 'ADP' },
  { id: 'bamboo', label: 'BambooHR' },
  { id: 'namely', label: 'Namely' },
  { id: 'other', label: 'Other / Custom' },
];

const systemTypes = [
  { id: 'hcm', label: 'HCM', icon: <Database className="w-5 h-5" /> },
  { id: 'erp', label: 'ERP', icon: <Server className="w-5 h-5" /> },
  { id: 'crm', label: 'CRM', icon: <Server className="w-5 h-5" /> },
  { id: 'bi', label: 'BI Tools', icon: <Server className="w-5 h-5" /> },
  { id: 'collab', label: 'Collaboration', icon: <Server className="w-5 h-5" /> },
  { id: 'wellness', label: 'Wellness', icon: <Server className="w-5 h-5" /> },
];

export function TechnologyLandscapeSection({ data, updateData, onComplete }: TechnologyLandscapeSectionProps) {
  const hcmPlatform = data['hcm-platform'] || '';
  const toolCount = data['tool-count'] || 5;
  const integratedSystems = data['integrated-systems'] || [];
  const vendorOptimization = data['vendor-optimization'] || 30;

  const handleSystemToggle = (id: string) => {
    const current = [...integratedSystems];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    updateData('integrated-systems', current);
  };

  return (
    <div>
      <SectionHeader
        number={4}
        title="Technology Landscape & Architecture"
        description="Architecture clarity determines your future scalability and cost efficiency."
      />

      {/* Q13: HCM Platform */}
      <QuestionCard>
        <QuestionTitle helper="Select your primary HCM/HRIS platform">
          Primary HCM Platform
        </QuestionTitle>
        <div className="grid grid-cols-3 gap-3">
          {hcmPlatforms.map((platform) => (
            <button
              key={platform.id}
              onClick={() => updateData('hcm-platform', platform.id)}
              className={`p-4 rounded-lg border-2 text-center transition-all ${
                hcmPlatform === platform.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <Server className={`w-8 h-8 mx-auto mb-2 ${hcmPlatform === platform.id ? 'text-indigo-600' : 'text-slate-400'}`} />
              <p className="font-medium text-slate-900 text-sm">{platform.label}</p>
            </button>
          ))}
        </div>
      </QuestionCard>

      {/* Q14: Tool Count */}
      <QuestionCard>
        <QuestionTitle helper="How many HR-related tools and systems are in use?">
          Number of HR Tools & Systems
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-600">Tool Count</span>
            <span className="font-bold text-indigo-600 text-2xl">{toolCount}</span>
          </div>
          <Slider
            value={[toolCount]}
            onValueChange={(val) => updateData('tool-count', val[0])}
            min={1}
            max={30}
            step={1}
            className="w-full"
          />
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className={`p-3 rounded-lg text-center ${toolCount <= 5 ? 'bg-green-50 border-2 border-green-500' : 'bg-slate-50'}`}>
              <p className="text-xs font-semibold text-slate-700">Lean</p>
              <p className="text-xs text-slate-600">1-5 tools</p>
            </div>
            <div className={`p-3 rounded-lg text-center ${toolCount > 5 && toolCount <= 15 ? 'bg-amber-50 border-2 border-amber-500' : 'bg-slate-50'}`}>
              <p className="text-xs font-semibold text-slate-700">Moderate</p>
              <p className="text-xs text-slate-600">6-15 tools</p>
            </div>
            <div className={`p-3 rounded-lg text-center ${toolCount > 15 ? 'bg-red-50 border-2 border-red-500' : 'bg-slate-50'}`}>
              <p className="text-xs font-semibold text-slate-700">Complex</p>
              <p className="text-xs text-slate-600">16+ tools</p>
            </div>
          </div>
        </div>
      </QuestionCard>

      {/* Q15: Integration Map */}
      <QuestionCard>
        <QuestionTitle helper="Which systems are integrated with HR?">
          System Integration Architecture
        </QuestionTitle>
        <div className="mb-6">
          <div className="flex justify-center gap-4 mb-6">
            {systemTypes.map((system) => (
              <button
                key={system.id}
                onClick={() => handleSystemToggle(system.id)}
                className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                  integratedSystems.includes(system.id)
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-slate-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className={integratedSystems.includes(system.id) ? 'text-indigo-600' : 'text-slate-400'}>
                  {system.icon}
                </div>
                <span className="text-xs font-medium text-slate-900">{system.label}</span>
              </button>
            ))}
          </div>
          <div className="relative">
            <div className="flex items-center justify-center gap-4">
              <Link className="w-6 h-6 text-indigo-600" />
              <div className="flex-1 h-1 bg-gradient-to-r from-indigo-600 to-teal-600 rounded"></div>
              <Link className="w-6 h-6 text-teal-600" />
            </div>
            <p className="text-center text-sm text-slate-600 mt-3">
              {integratedSystems.length} of {systemTypes.length} systems integrated
            </p>
          </div>
        </div>
      </QuestionCard>

      {/* Q16: Vendor Optimization */}
      <QuestionCard>
        <QuestionTitle helper="How optimized are your vendor contracts and licenses?">
          Vendor Contract Optimization
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Not Optimized</span>
            <span className="font-bold text-purple-600 text-lg">{vendorOptimization}%</span>
            <span>Fully Optimized</span>
          </div>
          <Slider
            value={[vendorOptimization]}
            onValueChange={(val) => updateData('vendor-optimization', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
            <div className="flex items-center gap-3">
              <Wrench className="w-6 h-6 text-purple-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {vendorOptimization < 40 ? 'Low Optimization' : vendorOptimization < 70 ? 'Moderate Optimization' : 'High Optimization'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {vendorOptimization < 40 
                    ? 'Significant cost savings opportunity' 
                    : vendorOptimization < 70 
                    ? 'Some optimization potential remains'
                    : 'Well-managed vendor relationships'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </QuestionCard>
    </div>
  );
}

