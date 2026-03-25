import React from 'react';

interface SemiCircleGaugeProps {
    value: number;
    max: number;
    label: string;
    description: string;
}

export function SemiCircleGauge({ value, max, label, description }: SemiCircleGaugeProps) {
    const percentage = (value / max) * 100;
    const angle = (percentage / 100) * 180;

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-40 h-20">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                    {/* Background arc */}
                    <path
                        d="M 20 80 A 80 80 0 0 1 180 80"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="16"
                        strokeLinecap="round"
                    />
                    {/* Colored arc */}
                    <path
                        d="M 20 80 A 80 80 0 0 1 180 80"
                        fill="none"
                        stroke="#14b8a6"
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray={`${(angle / 180) * 251.2} 251.2`}
                        style={{ transition: 'stroke-dasharray 0.5s ease' }}
                    />
                    {/* Needle */}
                    <line
                        x1="100"
                        y1="80"
                        x2={100 + 70 * Math.cos((Math.PI / 180) * (180 - angle))}
                        y2={80 - 70 * Math.sin((Math.PI / 180) * (180 - angle))}
                        stroke="#1e3a8a"
                        strokeWidth="2"
                    />
                    <circle cx="100" cy="80" r="5" fill="#1e3a8a" />
                </svg>
            </div>
            <div className="text-center mt-2">
                <div className="text-3xl font-bold text-gray-900">{value.toFixed(1)}</div>
                <div className="text-sm font-medium text-gray-600">{label}</div>
                <div className="text-xs text-gray-500 mt-1">{description}</div>
            </div>
        </div>
    );
}
