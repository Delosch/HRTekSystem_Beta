import React from 'react';

interface RadialProgressProps {
    value: number;
    label: string;
    description: string;
}

export function RadialProgress({ value, label, description }: RadialProgressProps) {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (value / 100) * circumference;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="12"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-3xl font-bold text-gray-900">{value}%</div>
                </div>
            </div>
            <div className="text-center mt-2">
                <div className="text-sm font-medium text-gray-600">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{description}</div>
            </div>
        </div>
    );
}
