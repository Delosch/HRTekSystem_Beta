import { Card } from './ui/card';
import { Sparkles, TrendingUp, Shield, Users, BarChart3 } from 'lucide-react';

interface OverviewProps {
  overallScore: number;
  risk: number;
  adoption: number;
  financial: number;
}

export function OverviewSection({ overallScore, risk, adoption, financial }: OverviewProps) {
  const roiValue = (financial * 0.05).toFixed(1); // Rough ROI calculation based on budget readiness

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 italic tracking-tight">
          Strategic Digital Transformation Roadmap
        </h1>
        <p className="text-slate-600 max-w-3xl font-medium">
          Enterprise intelligence platform for HR transformation leaders. Diagnose capability gaps, 
          prioritize investments, and generate living roadmaps aligned to business strategy.
        </p>
      </div>

      {/* Executive Summary Cards */}
      <div className="grid grid-cols-4 gap-6">
        <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-blue-50 rounded-xl">
              <BarChart3 className="w-5 h-5 text-blue-700" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900">{overallScore}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">/ 100</div>
            </div>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Digital Maturity</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {overallScore > 70 ? "Advanced digital capability. Ready for AI orchestration." : overallScore > 40 ? "Moderate digital capability. Key automation gaps identified." : "Foundation stage. Significant process standardization required."}
          </p>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-teal-50 rounded-xl">
              <TrendingUp className="w-5 h-5 text-teal-700" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900">${roiValue}M</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. ROI</div>
            </div>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">24-Month Value</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Projected value from efficiency gains, reduced attrition, and improved compliance.
          </p>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-amber-50 rounded-xl">
              <Users className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900">{adoption}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Adoption</div>
            </div>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Change Readiness</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {adoption > 60 ? "Strong change readiness. Leadership alignment is high." : "Moderate readiness. Training infrastructure needs investment."}
          </p>
        </Card>

        <Card className="p-6 bg-white border-slate-200 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="p-2.5 bg-red-50 rounded-xl">
              <Shield className="w-5 h-5 text-red-700" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-slate-900">{risk}%</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Risk Level</div>
            </div>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Transformation Risk</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            {risk > 50 ? "High risk profile. Prioritize data governance and compliance." : "Manageable risk. Focus on execution excellence."}
          </p>
        </Card>
      </div>


      {/* AI Platform Intelligence */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-slate-50 border-slate-200">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white rounded-lg border border-teal-200 shadow-sm">
            <Sparkles className="w-6 h-6 text-teal-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 mb-3">
              AI-Powered Intelligence Platform
            </h2>
            <div className="grid grid-cols-2 gap-x-12 gap-y-3">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Automated Diagnostics:</span> AI analyzes your responses to assess digital maturity across 50+ HR capabilities
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Intelligent Prioritization:</span> Machine learning weighs business impact, readiness, and dependencies to sequence initiatives
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Living Roadmap:</span> Roadmap adapts automatically as budgets, timelines, or strategic priorities change
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Risk & ROI Modeling:</span> Scenario planning with predictive analytics for adoption, cost, and value realization
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Enterprise-Grade Security:</span> SOC 2 compliant, role-based access, audit trails, and data encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Value Proposition */}
      <div className="grid grid-cols-3 gap-6">
        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">For CHROs</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Align HR transformation directly to business strategy. Quantify ROI and secure 
            executive buy-in with data-driven roadmaps and risk assessments.
          </p>
        </Card>

        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">For CIOs & IT Leaders</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Understand integration complexity, architecture dependencies, and technical debt. 
            Plan modernization with clear sequencing and scalability.
          </p>
        </Card>

        <Card className="p-6 bg-white border-slate-200">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">For Transformation Teams</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Gain visibility into change readiness, adoption risks, and governance requirements. 
            Build execution confidence with phased, realistic plans.
          </p>
        </Card>
      </div>
    </div>
  );
}

