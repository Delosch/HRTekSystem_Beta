import { Card } from './ui/card';
import { Sparkles, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

interface ChangeReadinessSectionProps {
  data: any;
}

export function ChangeReadinessSection({ data }: ChangeReadinessSectionProps) {
  const readinessScore = data['adoptionProbability'] || data['digital-capability'] || 68;
  const resistanceRisk = 100 - (data['past-success'] || 58);
  const overallScore = data['overallScore'] || 62;

  const governanceAreas = [
    { area: 'Vision & Leadership', status: overallScore > 75 ? 'ready' : (overallScore > 50 ? 'partial' : 'gap'), score: Math.round(overallScore * 1.1) > 100 ? 100 : Math.round(overallScore * 1.1) },
    { area: 'Platform & Technology', status: 'partial', score: data['api-readiness'] || 65 },
    { area: 'Change Enablement', status: (data['change-approach'] === 'advanced' || data['change-approach'] === 'comprehensive') ? 'ready' : 'gap', score: data['change-approach'] === 'advanced' ? 85 : data['change-approach'] === 'comprehensive' ? 70 : 35 },
    { area: 'Operating Model', status: 'partial', score: data['hr-business-partners'] ? 75 : 55 },
  ];

  const getStatusIcon = (status: string) => {
    if (status === 'ready') return <CheckCircle2 className="w-5 h-5 text-green-600" />;
    if (status === 'partial') return <AlertCircle className="w-5 h-5 text-amber-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  const getStatusBg = (status: string) => {
    if (status === 'ready') return 'bg-green-50 border-green-200';
    if (status === 'partial') return 'bg-amber-50 border-amber-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Change Readiness & Resource Alignment
        </h1>
        <p className="text-slate-600">
          Assessing organizational preparedness for transformation reduces adoption failure risk 
          and enables proactive planning for training, communication, and leadership engagement.
        </p>
      </div>

      {/* Change Readiness Score */}
      <Card className="p-8 bg-white border-slate-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Change Readiness & Adoption Risk
          </h2>
          <p className="text-sm text-slate-600">
            This assessment predicts employee adoption challenges early, allowing proactive change 
            enablement planning. Score combines leadership support, past change success, and culture factors.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12">
          {/* Readiness Thermometer */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Adoption Readiness</h3>
            <div className="flex items-start gap-6">
              {/* Thermometer Visual */}
              <div className="relative w-20 h-80 bg-slate-100 rounded-full overflow-hidden border-4 border-slate-200">
                <div 
                  className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-500 via-amber-500 to-red-500 transition-all duration-500"
                  style={{ height: `${readinessScore}%` }}
                ></div>
                <div 
                  className="absolute w-full text-center transition-all duration-500"
                  style={{ bottom: `${readinessScore}%`, transform: 'translateY(50%)' }}
                >
                  <div className="bg-white px-2 py-1 rounded-full border-2 border-blue-900 inline-block">
                    <span className="text-sm font-bold text-blue-900">{readinessScore}%</span>
                  </div>
                </div>
              </div>

              {/* Scale Labels */}
              <div className="flex-1 flex flex-col justify-between h-80 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 text-right text-xs font-semibold text-slate-500">100%</div>
                  <div>
                    <p className="text-sm font-semibold text-green-900">High Readiness</p>
                    <p className="text-xs text-slate-600">Strong change culture</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 text-right text-xs font-semibold text-slate-500">70%</div>
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Moderate</p>
                    <p className="text-xs text-slate-600">Targeted support needed</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 text-right text-xs font-semibold text-slate-500">40%</div>
                  <div>
                    <p className="text-sm font-semibold text-red-900">Low Readiness</p>
                    <p className="text-xs text-slate-600">High change resistance</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-12 text-right text-xs font-semibold text-slate-500">0%</div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Not Ready</p>
                    <p className="text-xs text-slate-600">Transformation at risk</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">Moderate readiness.</span> Leadership 
                support is strong, but training infrastructure and change champions network need development.
              </p>
            </div>
          </div>

          {/* Resistance Risk */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Resistance Risk Indicator</h3>
            
            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-slate-700">Overall Risk</span>
                  <span className="text-sm font-semibold text-amber-900">{resistanceRisk}%</span>
                </div>
                <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-500"
                    style={{ width: `${resistanceRisk}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-slate-700">Executive Sponsorship</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-900">Strong</span>
                    <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div className="w-full h-full bg-green-600"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <span className="text-sm text-slate-700">Middle Management Buy-In</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-amber-900">Moderate</span>
                    <div className="w-16 h-2 bg-amber-200 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-amber-600"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <span className="text-sm text-slate-700">End-User Awareness</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-900">Low</span>
                    <div className="w-16 h-2 bg-red-200 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-red-600"></div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm text-slate-700">Past Change Success</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-green-900">High</span>
                    <div className="w-16 h-2 bg-green-200 rounded-full overflow-hidden">
                      <div className="w-5/6 h-full bg-green-600"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-slate-700">
                <span className="font-medium text-slate-900">Moderate resistance risk.</span> Focus 
                change enablement on middle managers and frontline employees through early engagement programs.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900 mb-1">AI Insight</p>
            <p className="text-sm text-slate-700">
              Organizations with readiness scores of 65-75% achieve full adoption 6 months faster when 
              they invest in change champions programs and role-based training roadmaps early in Phase 1.
            </p>
          </div>
        </div>
      </Card>

      {/* Governance & Support Needs */}
      <Card className="p-8 bg-white border-slate-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Transformation Governance & Support Needs
          </h2>
          <p className="text-sm text-slate-600">
            Capability gaps in governance areas increase transformation failure probability. This assessment 
            identifies where to invest in structure, roles, and enablement before platform deployment.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {governanceAreas.map((area, index) => (
            <div key={index} className={`p-6 border rounded-lg ${getStatusBg(area.status)}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {getStatusIcon(area.status)}
                  <h3 className="text-sm font-semibold text-slate-900">{area.area}</h3>
                </div>
                <span className="text-lg font-bold text-slate-900">{area.score}%</span>
              </div>

              <div className="w-full h-2 bg-white rounded-full overflow-hidden mb-4">
                <div 
                  className={`h-full transition-all duration-500 ${
                    area.status === 'ready' ? 'bg-green-600' : 
                    area.status === 'partial' ? 'bg-amber-600' : 'bg-red-600'
                  }`}
                  style={{ width: `${area.score}%` }}
                ></div>
              </div>

              <p className="text-sm text-slate-700">
                {area.area === 'Vision & Leadership' && 'Clear strategic vision and executive commitment. Governance structure approved.'}
                {area.area === 'Platform & Technology' && 'Core platform selected. Integration and data migration planning in progress.'}
                {area.area === 'Change Enablement' && 'No formal change management office. Training plan and communication strategy needed.'}
                {area.area === 'Operating Model' && 'HR processes documented but not optimized. Target operating model design required.'}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-900 mb-2">Critical Gap: Change Enablement</h4>
              <p className="text-sm text-slate-700 mb-3">
                Lack of formal change enablement structure increases transformation failure probability 
                by 35%. Recommended actions before Phase 1 deployment:
              </p>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-slate-700">Establish Change Management Office (CMO) with dedicated resources</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-slate-700">Develop role-based training curriculum and delivery plan</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-slate-700">Create change champions network across business units and regions</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-sm text-slate-700">Design communication strategy with stakeholder engagement plan</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </Card>

      {/* Readiness Comparison */}
      <Card className="p-8 bg-white border-slate-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            HR vs Organization-Wide Change Readiness
          </h2>
          <p className="text-sm text-slate-600">
            Comparing HR department readiness against broader organizational change capability reveals 
            alignment gaps and informs stakeholder engagement strategy.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-700">HR Department Readiness</span>
                <span className="text-lg font-bold text-blue-900">{Math.round(readinessScore * 1.1) > 100 ? 100 : Math.round(readinessScore * 1.1)}%</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-900 transition-all duration-500" style={{ width: `${Math.round(readinessScore * 1.1) > 100 ? 100 : Math.round(readinessScore * 1.1)}%` }}></div>
              </div>
              <p className="text-xs text-slate-600 mt-2">HR team is engaged and aligned on transformation goals</p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-700">Organization-Wide Readiness</span>
                <span className="text-lg font-bold text-slate-500">{readinessScore}%</span>
              </div>
              <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-slate-400 transition-all duration-500" style={{ width: `${readinessScore}%` }}></div>
              </div>
              <p className="text-xs text-slate-600 mt-2">Broader organization has moderate change experience</p>
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-lg border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-900 mb-3">Alignment Analysis</h4>
            <p className="text-sm text-slate-700 mb-4">
              HR's higher readiness creates an opportunity to position the team as change advocates. 
              However, broader organizational skepticism requires strong executive messaging and quick wins 
              to build confidence.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-xs text-slate-600">HR can lead by example</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-slate-600">Need cross-functional champions</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-slate-600">Communication must address broader skepticism</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

