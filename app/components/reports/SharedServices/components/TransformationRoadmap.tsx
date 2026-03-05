import React from 'react';
import { CheckCircle2, Circle, Clock, User } from 'lucide-react';

interface RoadmapStep {
    phase: string;
    status: 'completed' | 'in-progress' | 'not-started';
    duration: string;
    owner?: string;
    dependency?: string;
}

interface TransformationRoadmapProps {
    steps: RoadmapStep[];
}

export function TransformationRoadmap({ steps }: TransformationRoadmapProps) {
    const getIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return <CheckCircle2 className="w-6 h-6 text-green-600" />;
            case 'in-progress':
                return <Clock className="w-6 h-6 text-amber-600" />;
            default:
                return <Circle className="w-6 h-6 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'in-progress':
                return 'bg-amber-100 text-amber-800 border-amber-300';
            default:
                return 'bg-gray-100 text-gray-600 border-gray-300';
        }
    };

    return (
        <div className="relative">
            {/* Timeline line */}
            <div className="absolute top-8 left-0 right-0 h-0.5 bg-gray-300" />

            <div className="relative flex justify-between gap-4">
                {steps.map((step, idx) => (
                    <div key={idx} className="flex flex-col items-center flex-1">
                        {/* Icon */}
                        <div className="bg-white p-2 rounded-full border-2 border-gray-300 relative z-10">
                            {getIcon(step.status)}
                        </div>

                        {/* Phase name */}
                        <div className="mt-4 text-center w-full">
                            <div className="font-semibold text-gray-900 text-lg">{step.phase}</div>
                            <div className="text-sm text-gray-500 mt-1 mb-2">{step.duration}</div>

                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs text-left w-full">
                                <div className="mb-1"><strong>Owner:</strong> {step.owner || 'TBD'}</div>
                                <div className="mb-2"><strong>Dep:</strong> {step.dependency || '-'}</div>
                                <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(step.status)}`}>
                                    {step.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
