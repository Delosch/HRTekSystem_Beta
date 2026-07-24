import React from 'react';
import { RichTextEditor } from './RichTextEditor';
import { ArrayEditor, RiskEditor } from './SimpleEditors';

interface HTIReportEditorProps {
    advisory: {
        executiveSummary: string;
        transformationReadinessScore?: number;
        riskExposureIndex?: number;
        confidenceScore?: number;
        currentState: {
            maturityLevel?: string;
            digitalReadiness?: string;
            keyGaps: string[];
            strengths: string[];
        };
        recommendations: {
            now: string[];
            next: string[];
            later: string[];
        };
        riskFlags: Array<{
            risk: string;
            mitigation: string;
        }>;
        dependencies: string[];
        avoidNow: string[];
        successMetrics?: string[];
    };
    onChange: (advisory: any) => void;
}

export const HTIReportEditor: React.FC<HTIReportEditorProps> = ({ advisory, onChange }) => {
    const updateField = (path: string[], value: any) => {
        const newAdvisory = { ...advisory };
        let current: any = newAdvisory;

        for (let i = 0; i < path.length - 1; i++) {
            current = current[path[i]];
        }
        current[path[path.length - 1]] = value;

        onChange(newAdvisory);
    };

    return (
        <div className="space-y-6">
            {/* Executive Summary - Rich Text */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📝</span>
                    Executive Summary
                </h3>
                <RichTextEditor
                    content={advisory.executiveSummary}
                    onChange={(value) => updateField(['executiveSummary'], value)}
                    placeholder="Enter executive summary with rich formatting..."
                />
            </div>

            {/* Current State */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    Current State Assessment
                </h3>

                {/* KPI Scorecard Manual Inputs */}
                <div className="grid md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Transformation Readiness Score
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={advisory.transformationReadinessScore ?? ''}
                            onChange={(e) =>
                                updateField(
                                    ['transformationReadinessScore'],
                                    e.target.value === '' ? undefined : Number(e.target.value)
                                )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g. 75"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Risk Exposure Index
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={advisory.riskExposureIndex ?? ''}
                            onChange={(e) =>
                                updateField(
                                    ['riskExposureIndex'],
                                    e.target.value === '' ? undefined : Number(e.target.value)
                                )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g. 45"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Advisory Confidence Score
                        </label>
                        <input
                            type="number"
                            min={0}
                            max={100}
                            value={advisory.confidenceScore ?? ''}
                            onChange={(e) =>
                                updateField(
                                    ['confidenceScore'],
                                    e.target.value === '' ? undefined : Number(e.target.value)
                                )
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="e.g. 85"
                        />
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Maturity Level
                        </label>
                        <select
                            value={advisory.currentState.maturityLevel || ''}
                            onChange={(e) => updateField(['currentState', 'maturityLevel'], e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select...</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Digital Readiness
                        </label>
                        <select
                            value={advisory.currentState.digitalReadiness || ''}
                            onChange={(e) => updateField(['currentState', 'digitalReadiness'], e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select...</option>
                            <option value="Not Ready">Not Ready</option>
                            <option value="Partially Ready">Partially Ready</option>
                            <option value="Ready">Ready</option>
                        </select>
                    </div>
                </div>

                <ArrayEditor
                    label="Key Gaps"
                    items={advisory.currentState.keyGaps}
                    onChange={(items) => updateField(['currentState', 'keyGaps'], items)}
                    placeholder="Enter a key gap..."
                />

                <ArrayEditor
                    label="Strengths"
                    items={advisory.currentState.strengths}
                    onChange={(items) => updateField(['currentState', 'strengths'], items)}
                    placeholder="Enter a strength..."
                />
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🎯</span>
                    Strategic Recommendations
                </h3>

                <div className="mb-6">
                    <h4 className="text-md font-semibold text-green-700 mb-2">NOW (3-6 months)</h4>
                    <ArrayEditor
                        label=""
                        items={advisory.recommendations.now}
                        onChange={(items) => updateField(['recommendations', 'now'], items)}
                        placeholder="Enter immediate action..."
                    />
                </div>

                <div className="mb-6">
                    <h4 className="text-md font-semibold text-yellow-700 mb-2">NEXT (6-12 months)</h4>
                    <ArrayEditor
                        label=""
                        items={advisory.recommendations.next}
                        onChange={(items) => updateField(['recommendations', 'next'], items)}
                        placeholder="Enter next action..."
                    />
                </div>

                <div>
                    <h4 className="text-md font-semibold text-blue-700 mb-2">LATER (12-24 months)</h4>
                    <ArrayEditor
                        label=""
                        items={advisory.recommendations.later}
                        onChange={(items) => updateField(['recommendations', 'later'], items)}
                        placeholder="Enter future action..."
                    />
                </div>
            </div>

            {/* Risk Flags */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    Risk Flags
                </h3>
                <RiskEditor
                    risks={advisory.riskFlags}
                    onChange={(risks) => updateField(['riskFlags'], risks)}
                />
            </div>

            {/* Dependencies */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🔗</span>
                    Dependencies
                </h3>
                <ArrayEditor
                    label=""
                    items={advisory.dependencies}
                    onChange={(items) => updateField(['dependencies'], items)}
                    placeholder="Enter a dependency..."
                />
            </div>

            {/* Avoid Now */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">🚫</span>
                    Actions to Avoid Now
                </h3>
                <ArrayEditor
                    label=""
                    items={advisory.avoidNow}
                    onChange={(items) => updateField(['avoidNow'], items)}
                    placeholder="Enter action to avoid..."
                />
            </div>

            {/* Success Metrics */}
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span>
                    Success Metrics
                </h3>
                <ArrayEditor
                    label=""
                    items={advisory.successMetrics || []}
                    onChange={(items) => updateField(['successMetrics'], items)}
                    placeholder="Enter a success metric..."
                />
            </div>
        </div>
    );
};