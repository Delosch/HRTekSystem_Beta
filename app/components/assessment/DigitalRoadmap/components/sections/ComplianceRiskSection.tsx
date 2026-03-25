import React from 'react';
import { SectionHeader, QuestionCard, QuestionTitle } from '../AssessmentComponents';
import { Slider } from '../ui/slider';
import { Shield, FileCheck, Lock, AlertTriangle } from 'lucide-react';

interface ComplianceRiskSectionProps {
  data: any;
  updateData: (key: string, value: any) => void;
  onComplete: () => void;
}

const privacyLevels = [
  { id: 'basic', label: 'Basic Compliance', desc: 'Minimal controls', level: 1 },
  { id: 'managed', label: 'Managed', desc: 'Documented policies', level: 2 },
  { id: 'advanced', label: 'Advanced', desc: 'Proactive monitoring', level: 3 },
  { id: 'world-class', label: 'World Class', desc: 'Best-in-class governance', level: 4 },
];

export function ComplianceRiskSection({ data, updateData, onComplete }: ComplianceRiskSectionProps) {
  const complianceAutomation = data['compliance-automation'] || 30;
  const auditTrails = data['audit-trails'] || false;
  const privacyMaturity = data['privacy-maturity'] || '';

  return (
    <div>
      <SectionHeader
        number={9}
        title="Compliance, Risk & Governance"
        description="Strong governance protects scale and regulatory confidence."
      />

      {/* Q32: Compliance Automation */}
      <QuestionCard>
        <QuestionTitle helper="Level of automated compliance monitoring">
          Compliance Automation Level
        </QuestionTitle>
        <div className="space-y-4">
          <div className="flex justify-between text-sm text-slate-600 mb-2">
            <span>Manual Processes</span>
            <span className="font-bold text-green-600 text-lg">{complianceAutomation}%</span>
            <span>Fully Automated</span>
          </div>
          <Slider
            value={[complianceAutomation]}
            onValueChange={(val) => updateData('compliance-automation', val[0])}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="mt-4 p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200">
            <div className="flex items-start gap-4">
              <Shield className={`w-8 h-8 ${complianceAutomation > 60 ? 'text-green-600' : 'text-amber-600'} flex-shrink-0`} />
              <div>
                <p className="font-semibold text-slate-900 mb-2">
                  {complianceAutomation < 30 ? 'High Risk - Manual Compliance' : 
                   complianceAutomation < 60 ? 'Moderate - Partial Automation' : 
                   'Low Risk - Strong Automation'}
                </p>
                <p className="text-sm text-slate-700">
                  {complianceAutomation < 30 
                    ? 'Significant manual effort required for compliance monitoring and reporting.' 
                    : complianceAutomation < 60 
                    ? 'Some automated controls in place, but gaps remain.'
                    : 'Comprehensive automated compliance monitoring reduces risk exposure.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </QuestionCard>

      {/* Q33: Audit Trails */}
      <QuestionCard>
        <QuestionTitle helper="Comprehensive audit trail capabilities">
          Audit Trail & Activity Logging
        </QuestionTitle>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => updateData('audit-trails', true)}
            className={`p-8 rounded-lg border-2 transition-all ${
              auditTrails === true
                ? 'border-green-600 bg-green-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-green-300'
            }`}
          >
            <FileCheck className={`w-12 h-12 mx-auto mb-3 ${auditTrails === true ? 'text-green-600' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900 text-center mb-2">Comprehensive</p>
            <p className="text-xs text-slate-600 text-center">Full audit trails maintained</p>
            {auditTrails === true && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                ✓ Enabled
              </div>
            )}
          </button>
          <button
            onClick={() => updateData('audit-trails', false)}
            className={`p-8 rounded-lg border-2 transition-all ${
              auditTrails === false
                ? 'border-red-600 bg-red-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-red-300'
            }`}
          >
            <AlertTriangle className={`w-12 h-12 mx-auto mb-3 ${auditTrails === false ? 'text-red-600' : 'text-slate-400'}`} />
            <p className="font-semibold text-slate-900 text-center mb-2">Limited/None</p>
            <p className="text-xs text-slate-600 text-center">Incomplete or no audit trails</p>
            {auditTrails === false && (
              <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                ⚠ Risk
              </div>
            )}
          </button>
        </div>
      </QuestionCard>

      {/* Q34: Data Privacy Maturity */}
      <QuestionCard>
        <QuestionTitle helper="Data privacy and governance maturity level">
          Data Privacy & Governance Maturity
        </QuestionTitle>
        <div className="space-y-3">
          {privacyLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => updateData('privacy-maturity', level.id)}
              className={`w-full p-5 rounded-lg border-2 text-left transition-all flex items-center justify-between ${
                privacyMaturity === level.id
                  ? 'border-purple-600 bg-purple-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-purple-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  privacyMaturity === level.id ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {level.level === 4 ? (
                    <Lock className="w-6 h-6" />
                  ) : (
                    <span className="text-xl font-bold">{level.level}</span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{level.label}</p>
                  <p className="text-sm text-slate-600">{level.desc}</p>
                </div>
              </div>
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-10 rounded ${
                      i < level.level ? 'bg-purple-600' : 'bg-slate-200'
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

