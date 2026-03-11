import React from 'react';
import { Button } from './ui/button';
import { Download, FileText, Calendar, ArrowLeft, TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Users } from 'lucide-react';
import { AssessmentData } from '../App';

interface ResultsDashboardProps {
  assessmentData: AssessmentData;
  onReset: () => void;
}

export function ResultsDashboard({ assessmentData, onReset }: ResultsDashboardProps) {
  // Calculate scores
  const calculateOverallScore = () => {
    let total = 0;
    let count = 0;

    // Data quality and maturity scores
    const scores = [
      assessmentData['alignment'] || 0,
      assessmentData['standardization'] || 0,
      assessmentData['sop-maturity'] || 0,
      assessmentData['data-quality'] || 0,
      assessmentData['automation-percent'] || 0,
      assessmentData['ai-comfort'] || 0,
      assessmentData['business-influence'] || 0,
      assessmentData['shared-services-maturity'] || 0,
      assessmentData['past-success'] || 0,
      assessmentData['digital-capability'] || 0,
      assessmentData['compliance-automation'] || 0,
      assessmentData['budget-readiness'] || 0,
      assessmentData['ecosystem-openness'] || 0,
    ];

    scores.forEach(score => {
      if (score) {
        total += score;
        count++;
      }
    });

    return count > 0 ? Math.round(total / count) : 0;
  };

  const overallScore = calculateOverallScore();

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 70) return 'bg-green-50 border-green-500';
    if (score >= 40) return 'bg-amber-50 border-amber-500';
    return 'bg-red-50 border-red-500';
  };

  // Calculate index scores
  const indices = {
    governance: Math.round(((assessmentData['standardization'] || 0) + (assessmentData['compliance-automation'] || 0)) / 2),
    capability: Math.round(((assessmentData['data-quality'] || 0) + (assessmentData['digital-capability'] || 0)) / 2),
    infrastructure: Math.round(((assessmentData['automation-percent'] || 0) + (assessmentData['vendor-optimization'] || 0)) / 2),
    strategy: Math.round(((assessmentData['alignment'] || 0) + (assessmentData['business-influence'] || 0)) / 2),
    maturity: Math.round(((assessmentData['sop-maturity'] || 0) + (assessmentData['shared-services-maturity'] || 0)) / 2),
  };

  const transformationRisk = 100 - Math.round(((assessmentData['past-success'] || 0) + (assessmentData['digital-capability'] || 0)) / 2);
  const adoptionProbability = Math.round(((assessmentData['past-success'] || 0) + (assessmentData['digital-capability'] || 0) + (assessmentData['ai-comfort'] || 0)) / 3);
  const financialFeasibility = assessmentData['budget-readiness'] || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Your HR Digital Roadmap</h1>
              <p className="text-slate-600 mt-1">Strategic Transformation Assessment Results</p>
            </div>
            <Button onClick={onReset} variant="outline" className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Assessment
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Overall Score */}
        <div className="mb-12 text-center">
          <div className="inline-block">
            <div className="relative w-64 h-64 mx-auto mb-6">
              <svg className="transform -rotate-90 w-64 h-64">
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke="currentColor"
                  strokeWidth="20"
                  fill="transparent"
                  className="text-slate-200"
                />
                <circle
                  cx="128"
                  cy="128"
                  r="110"
                  stroke="currentColor"
                  strokeWidth="20"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 110}`}
                  strokeDashoffset={`${2 * Math.PI * 110 * (1 - overallScore / 100)}`}
                  className={`transition-all duration-1000 ${
                    overallScore >= 70 ? 'text-green-500' : overallScore >= 40 ? 'text-amber-500' : 'text-red-500'
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-6xl font-bold ${getScoreColor(overallScore)}`}>{overallScore}</span>
                <span className="text-sm text-slate-600 mt-2">Change Intelligence Score</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {overallScore >= 70 ? 'Ready for Transformation' : overallScore >= 40 ? 'Building Momentum' : 'Foundation Required'}
            </h2>
            <p className="text-slate-600 max-w-2xl">
              {overallScore >= 70 
                ? 'Your organization demonstrates strong digital maturity and readiness for advanced HR transformation initiatives.'
                : overallScore >= 40 
                ? 'You have solid foundations in place. Focus on strengthening key areas to accelerate transformation.'
                : 'Start with foundational improvements in processes, data quality, and change readiness before pursuing advanced initiatives.'}
            </p>
          </div>
        </div>

        {/* GCISM Indices */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">GCISM Index Heatmap</h3>
          <div className="grid grid-cols-5 gap-4">
            {Object.entries(indices).map(([key, value]) => (
              <div key={key} className={`p-6 rounded-xl border-2 ${getScoreBgColor(value)}`}>
                <div className="text-center">
                  <p className="text-sm font-semibold text-slate-700 uppercase mb-2">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </p>
                  <p className={`text-4xl font-bold ${getScoreColor(value)}`}>{value}</p>
                  <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        value >= 70 ? 'bg-green-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Transformation Risk Index</p>
                <p className="text-3xl font-bold text-red-600">{transformationRisk}%</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              {transformationRisk > 60 ? 'High risk - prioritize change management' : transformationRisk > 30 ? 'Moderate risk - monitor closely' : 'Low risk - favorable conditions'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Adoption Probability</p>
                <p className="text-3xl font-bold text-green-600">{adoptionProbability}%</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              {adoptionProbability > 60 ? 'High probability - strong readiness' : adoptionProbability > 30 ? 'Moderate - invest in training' : 'Low - focus on capability building'}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Financial Feasibility</p>
                <p className="text-3xl font-bold text-blue-600">{financialFeasibility}%</p>
              </div>
            </div>
            <p className="text-xs text-slate-600">
              {financialFeasibility > 60 ? 'Strong budget alignment' : financialFeasibility > 30 ? 'Budget planning needed' : 'Secure funding first'}
            </p>
          </div>
        </div>

        {/* Roadmap Timeline */}
        <div className="bg-white rounded-xl shadow-md border border-slate-200 p-8 mb-12">
          <h3 className="text-2xl font-bold text-slate-900 mb-6">Recommended Transformation Timeline</h3>
          <div className="grid grid-cols-4 gap-4">
            {[
              { period: '6 Months', focus: 'Quick Wins', items: ['Process standardization', 'Data quality', 'Basic automation'] },
              { period: '12 Months', focus: 'Foundation', items: ['System integration', 'Analytics platform', 'Change program'] },
              { period: '18 Months', focus: 'Acceleration', items: ['Advanced automation', 'AI pilots', 'Shared services'] },
              { period: '24 Months', focus: 'Optimization', items: ['Predictive analytics', 'Full AI adoption', 'Continuous improvement'] },
            ].map((phase, idx) => (
              <div key={idx} className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-lg p-5 border-2 border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <p className="font-bold text-slate-900">{phase.period}</p>
                  </div>
                  <p className="text-sm font-semibold text-blue-700 mb-2">{phase.focus}</p>
                  <ul className="space-y-1">
                    {phase.items.map((item, i) => (
                      <li key={i} className="text-xs text-slate-700 flex items-start gap-1">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {idx < 3 && (
                  <div className="absolute top-1/2 -right-2 w-4 h-0.5 bg-blue-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Items */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Quick Wins (0-6 months)
            </h4>
            <ul className="space-y-3">
              {[
                'Standardize core HR processes',
                'Implement basic workflow automation',
                'Establish data governance framework',
                'Launch employee experience survey',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6">
            <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Long-Term Priorities (12-24 months)
            </h4>
            <ul className="space-y-3">
              {[
                'Deploy AI-powered analytics platform',
                'Implement predictive workforce planning',
                'Establish Center of Excellence',
                'Achieve intelligent automation',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* CTAs */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Next Steps</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Download your comprehensive roadmap report or schedule a strategic consultation with our HR transformation experts.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              <Download className="w-5 h-5 mr-2" />
              Download Executive Report
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <FileText className="w-5 h-5 mr-2" />
              Download Detailed Roadmap
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              <Calendar className="w-5 h-5 mr-2" />
              Book Advisory Session
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

