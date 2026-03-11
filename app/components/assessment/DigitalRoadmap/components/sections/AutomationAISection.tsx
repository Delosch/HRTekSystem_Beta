import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle } from '../AssessmentComponents';
import { Slider } from '../ui/slider';
import { Switch } from '../ui/switch';
import { Bot, Sparkles, MessageSquare, Search, FileText, Calendar } from 'lucide-react';

interface AutomationAISectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const automationLevels = [
  { id: 'none', label: 'No Automation', level: 0 },
  { id: 'basic', label: 'Basic Workflows', level: 1 },
  { id: 'moderate', label: 'Moderate Automation', level: 2 },
  { id: 'advanced', label: 'Advanced RPA', level: 3 },
  { id: 'intelligent', label: 'AI-Driven', level: 4 },
];

const aiUseCases = [
  { id: 'chatbot', label: 'HR Chatbot', icon: <MessageSquare className="w-6 h-6" /> },
  { id: 'screening', label: 'Resume Screening', icon: <Search className="w-6 h-6" /> },
  { id: 'insights', label: 'Predictive Analytics', icon: <Sparkles className="w-6 h-6" /> },
  { id: 'onboarding', label: 'Smart Onboarding', icon: <FileText className="w-6 h-6" /> },
  { id: 'scheduling', label: 'Interview Scheduling', icon: <Calendar className="w-6 h-6" /> },
];

export function AutomationAISection({ data, updateData, onComplete }: AutomationAISectionProps) {
  const automationLevel = data['automation-level'] || '';
  const automationPercent = data['automation-percent'] || 20;
  const aiComfort = data['ai-comfort'] || 50;
  const selectedUseCases = data['ai-use-cases'] || [];

  const handleUseCaseToggle = (id: string) => {
    const current = [...selectedUseCases];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    updateData('ai-use-cases', current);
  };

  return (
    <div>
      <SectionHeader
        number={5}
        title="Automation, AI & Digital Enablers"
        description="Guides how aggressively your roadmap can introduce AI and automation."
      />

      {/* Q17: Automation Level */}
      <QuestionCard>
        <QuestionTitle helper="Current level of HR process automation">
          Automation Maturity Level
        </QuestionTitle>
        <div className="space-y-3">
          {automationLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => updateData('automation-level', level.id)}
              className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                automationLevel === level.id
                  ? 'border-indigo-600 bg-indigo-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-indigo-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  automationLevel === level.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {level.level}
                </div>
                <span className="font-medium text-slate-900">{level.label}</span>
              </div>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 rounded ${
                      i <= level.level ? 'bg-indigo-600' : 'bg-slate-200'
                    }`}
                  />
                ))}
              </div>
            </button>
          ))}
        </div>
      </QuestionCard>

      {/* Q18: Automation Percentage */}
      <QuestionCard>
        <QuestionTitle helper="Estimated percentage of HR processes that are automated">
          Percentage of Processes Automated
        </QuestionTitle>
        <div className="space-y-4">
          <div className="relative">
            <div className="flex items-center justify-center mb-4">
              <div className="relative w-40 h-40">
                <svg className="transform -rotate-90 w-40 h-40">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-slate-200"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 70}`}
                    strokeDashoffset={`${2 * Math.PI * 70 * (1 - automationPercent / 100)}`}
                    className="text-indigo-600 transition-all duration-500"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-indigo-600">{automationPercent}%</span>
                </div>
              </div>
            </div>
          </div>
          <Slider
            value={[automationPercent]}
            onValueChange={(val) => updateData('automation-percent', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
        </div>
      </QuestionCard>

      {/* Q19: AI Comfort */}
      <QuestionCard>
        <QuestionTitle helper="Organization's readiness and comfort with AI adoption">
          AI Comfort & Readiness Level
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Low Confidence</span>
            <span className="font-bold text-purple-600 text-lg">{aiComfort}%</span>
            <span>High Confidence</span>
          </div>
          <Slider
            value={[aiComfort]}
            onValueChange={(val) => updateData('ai-comfort', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="mt-4 p-4 rounded-lg" style={{
            background: `linear-gradient(to right, rgb(239, 68, 68) 0%, rgb(251, 146, 60) 33%, rgb(250, 204, 21) 66%, rgb(34, 197, 94) 100%)`,
            opacity: 0.2
          }}>
            <div className="relative h-8 flex items-center" style={{ background: 'white', borderRadius: '0.5rem', padding: '0.5rem' }}>
              <div
                className="absolute h-6 w-2 bg-purple-600 rounded transition-all"
                style={{ left: `calc(${aiComfort}% - 4px)` }}
              />
            </div>
          </div>
        </div>
      </QuestionCard>

      {/* Q20: AI Use Cases */}
      <QuestionCard>
        <QuestionTitle helper="Select AI use cases of interest">
          Priority AI Use Cases
        </QuestionTitle>
        <div className="grid grid-cols-2 gap-4">
          {aiUseCases.map((useCase) => (
            <button
              key={useCase.id}
              onClick={() => handleUseCaseToggle(useCase.id)}
              className={`p-5 rounded-lg border-2 transition-all text-left ${
                selectedUseCases.includes(useCase.id)
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-slate-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className={`mb-3 ${selectedUseCases.includes(useCase.id) ? 'text-purple-600' : 'text-slate-400'}`}>
                {useCase.icon}
              </div>
              <p className="font-medium text-slate-900">{useCase.label}</p>
              {selectedUseCases.includes(useCase.id) && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    Selected
                  </span>
                </div>
              )}
            </button>
          ))}
        </div>
      </QuestionCard>
    </div>
  );
}

