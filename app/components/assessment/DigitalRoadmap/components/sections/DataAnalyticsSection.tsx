import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle } from '../AssessmentComponents';
import { Slider } from '../ui/slider';
import { Database, BarChart3, TrendingUp, Users, Building, DollarSign } from 'lucide-react';

interface DataAnalyticsSectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const analyticsLevels = [
  { id: 'none', label: 'No Analytics', desc: 'No reporting', level: 0 },
  { id: 'descriptive', label: 'Descriptive', desc: 'Basic reports', level: 1 },
  { id: 'diagnostic', label: 'Diagnostic', desc: 'Trend analysis', level: 2 },
  { id: 'predictive', label: 'Predictive', desc: 'Forecasting', level: 3 },
  { id: 'prescriptive', label: 'Prescriptive', desc: 'Recommendations', level: 4 },
];

const dataConsumers = [
  { id: 'hr', label: 'HR Team', icon: <Users className="w-5 h-5" /> },
  { id: 'executives', label: 'C-Suite', icon: <Building className="w-5 h-5" /> },
  { id: 'managers', label: 'Line Managers', icon: <Users className="w-5 h-5" /> },
  { id: 'finance', label: 'Finance', icon: <DollarSign className="w-5 h-5" /> },
];

export function DataAnalyticsSection({ data, updateData, onComplete }: DataAnalyticsSectionProps) {
  const dataQuality = data['data-quality'] || 40;
  const analyticsLevel = data['analytics-level'] || '';
  const selectedConsumers = data['data-consumers'] || [];
  const businessInfluence = data['business-influence'] || 30;

  const handleConsumerToggle = (id: string) => {
    const current = [...selectedConsumers];
    const index = current.indexOf(id);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(id);
    }
    updateData('data-consumers', current);
  };

  return (
    <div>
      <SectionHeader
        number={6}
        title="Data, Analytics & Decision Making"
        description="Higher analytics maturity unlocks predictive HR decision-making."
      />

      {/* Q21: Data Quality */}
      <QuestionCard>
        <QuestionTitle helper="Quality and reliability of HR data">
          HR Data Quality Score
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Poor Quality</span>
            <span className="font-bold text-green-600 text-lg">{dataQuality}%</span>
            <span>Excellent Quality</span>
          </div>
          <Slider
            value={[dataQuality]}
            onValueChange={(val) => updateData('data-quality', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="grid grid-cols-4 gap-2 mt-4">
            <div className={`p-3 rounded-lg text-center border-2 ${dataQuality >= 25 ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
              <Database className={`w-6 h-6 mx-auto mb-1 ${dataQuality >= 25 ? 'text-green-600' : 'text-slate-400'}`} />
              <p className="text-xs font-medium">Basic</p>
            </div>
            <div className={`p-3 rounded-lg text-center border-2 ${dataQuality >= 50 ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
              <Database className={`w-6 h-6 mx-auto mb-1 ${dataQuality >= 50 ? 'text-green-600' : 'text-slate-400'}`} />
              <p className="text-xs font-medium">Good</p>
            </div>
            <div className={`p-3 rounded-lg text-center border-2 ${dataQuality >= 75 ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
              <Database className={`w-6 h-6 mx-auto mb-1 ${dataQuality >= 75 ? 'text-green-600' : 'text-slate-400'}`} />
              <p className="text-xs font-medium">Strong</p>
            </div>
            <div className={`p-3 rounded-lg text-center border-2 ${dataQuality >= 90 ? 'border-green-500 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
              <Database className={`w-6 h-6 mx-auto mb-1 ${dataQuality >= 90 ? 'text-green-600' : 'text-slate-400'}`} />
              <p className="text-xs font-medium">Excellent</p>
            </div>
          </div>
        </div>
      </QuestionCard>

      {/* Q22: Analytics Maturity Pyramid */}
      <QuestionCard>
        <QuestionTitle helper="Current level of people analytics capability">
          Analytics Maturity Level
        </QuestionTitle>
        <div className="space-y-2">
          {[...analyticsLevels].reverse().map((level, idx) => (
            <button
              key={level.id}
              onClick={() => updateData('analytics-level', level.id)}
              className={`w-full transition-all ${
                analyticsLevel === level.id
                  ? 'border-2 border-indigo-600 bg-indigo-50 shadow-lg'
                  : 'border border-slate-200 bg-white hover:border-indigo-300'
              }`}
              style={{
                padding: '1rem',
                borderRadius: '0.5rem',
                marginLeft: `${idx * 10}%`,
                marginRight: `${idx * 10}%`,
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    analyticsLevel === level.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {level.level}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-slate-900">{level.label}</p>
                    <p className="text-xs text-slate-600">{level.desc}</p>
                  </div>
                </div>
                {analyticsLevel === level.id && (
                  <BarChart3 className="w-6 h-6 text-indigo-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      </QuestionCard>

      {/* Q23: Data Consumers */}
      <QuestionCard>
        <QuestionTitle helper="Who actively uses HR analytics?">
          Data Consumer Stakeholders
        </QuestionTitle>
        <div className="grid grid-cols-2 gap-4">
          {dataConsumers.map((consumer) => (
            <button
              key={consumer.id}
              onClick={() => handleConsumerToggle(consumer.id)}
              className={`p-5 rounded-lg border-2 transition-all text-left ${
                selectedConsumers.includes(consumer.id)
                  ? 'border-teal-600 bg-teal-50'
                  : 'border-slate-200 bg-white hover:border-teal-300'
              }`}
            >
              <div className={`mb-2 ${selectedConsumers.includes(consumer.id) ? 'text-teal-600' : 'text-slate-400'}`}>
                {consumer.icon}
              </div>
              <p className="font-medium text-slate-900">{consumer.label}</p>
            </button>
          ))}
        </div>
      </QuestionCard>

      {/* Q24: Business Influence */}
      <QuestionCard>
        <QuestionTitle helper="How much do HR analytics influence business decisions?">
          Analytics Influence on Business Decisions
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>No Influence</span>
            <span className="font-bold text-indigo-600 text-lg">{businessInfluence}%</span>
            <span>High Influence</span>
          </div>
          <Slider
            value={[businessInfluence]}
            onValueChange={(val) => updateData('business-influence', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg border border-indigo-200">
            <div className="flex items-center gap-3">
              <TrendingUp className={`w-6 h-6 ${businessInfluence > 60 ? 'text-indigo-600' : 'text-slate-400'}`} />
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {businessInfluence < 30 ? 'Low Impact' : businessInfluence < 60 ? 'Moderate Impact' : 'High Impact'}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {businessInfluence < 30 
                    ? 'Analytics rarely inform decisions' 
                    : businessInfluence < 60 
                    ? 'Analytics consulted occasionally'
                    : 'Analytics drive strategic planning'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </QuestionCard>
    </div>
  );
}

