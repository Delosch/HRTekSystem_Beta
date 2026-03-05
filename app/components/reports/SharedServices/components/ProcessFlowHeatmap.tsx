import React from 'react';
import { ArrowRight, AlertCircle } from 'lucide-react';

interface ProcessStep {
    id: number;
    name: string;
    avgTime: string;
    bottleneck: boolean;
    phase: string;
}

const processSteps: ProcessStep[] = [
    { id: 1, name: 'Invoice Receipt', avgTime: '0.5h', bottleneck: false, phase: 'Intake' },
    { id: 2, name: 'Data Validation', avgTime: '1.2h', bottleneck: false, phase: 'Intake' },
    { id: 3, name: 'Approval Step 3', avgTime: '4.8h', bottleneck: true, phase: 'Approval' },
    { id: 4, name: 'Payment Processing', avgTime: '0.8h', bottleneck: false, phase: 'Closure' },
    { id: 5, name: 'Archive & Close', avgTime: '0.3h', bottleneck: false, phase: 'Closure' },
];

export const ProcessFlowHeatmap: React.FC = () => {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
                {processSteps.map((step, index) => (
                    <div key={step.id} className="contents">
                        <div
                            className={`relative flex-1 min-w-[140px] p-4 rounded-lg border-2 transition-all duration-300 ${step.bottleneck
                                    ? 'bg-red-50 border-red-400 shadow-lg'
                                    : 'bg-green-50 border-green-200'
                                }`}
                        >
                            <div className="absolute -top-3 left-2 bg-gray-200 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                                {step.phase}
                            </div>
                            <div className="flex items-start justify-between mb-2 mt-2">
                                <div className="text-xs font-bold text-gray-600">
                                    Step {step.id}
                                </div>
                                {step.bottleneck && (
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                )}
                            </div>
                            <div className={`text-sm font-semibold mb-2 ${step.bottleneck ? 'text-red-900' : 'text-gray-800'
                                }`}>
                                {step.name}
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-gray-600">Avg Time:</span>
                                <span className={`text-sm font-bold ${step.bottleneck ? 'text-red-600' : 'text-green-600'
                                    }`}>
                                    {step.avgTime}
                                </span>
                            </div>

                            {/* Heat indicator */}
                            <div className="absolute bottom-2 left-2 right-2 h-1 rounded-full bg-gray-200 overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${step.bottleneck ? 'bg-red-600' : 'bg-green-500'
                                        }`}
                                    style={{
                                        width: step.bottleneck ? '95%' : `${Math.random() * 40 + 20}%`,
                                    }}
                                />
                            </div>
                        </div>

                        {index < processSteps.length - 1 && (
                            <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex items-center gap-6 pt-2">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-xs text-gray-600">Normal Flow</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded" />
                    <span className="text-xs text-gray-600">Bottleneck (Cycle Time &gt; 4h)</span>
                </div>
            </div>
        </div>
    );
};
