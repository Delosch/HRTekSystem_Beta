import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from 'recharts';

const radarData = [
    {
        criteria: 'Cost',
        Centralized: 9,
        Hybrid: 8,
        Outsourced: 7,
    },
    {
        criteria: 'Flexibility',
        Centralized: 4,
        Hybrid: 8,
        Outsourced: 9,
    },
    {
        criteria: 'Control',
        Centralized: 9,
        Hybrid: 7,
        Outsourced: 4,
    },
    {
        criteria: 'Speed',
        Centralized: 6,
        Hybrid: 8,
        Outsourced: 7,
    },
    {
        criteria: 'Quality',
        Centralized: 8,
        Hybrid: 9,
        Outsourced: 6,
    },
];

export const ModelRadarChart: React.FC = () => {
    return (
        <ResponsiveContainer width="100%" height={380}>
            <RadarChart data={radarData}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis
                    dataKey="criteria"
                    tick={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}
                />
                <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                />
                <Radar
                    name="Centralized"
                    dataKey="Centralized"
                    stroke="#1e3a8a"
                    fill="#1e3a8a"
                    fillOpacity={0.3}
                    strokeWidth={2}
                />
                <Radar
                    name="Hybrid (Recommended)"
                    dataKey="Hybrid"
                    stroke="#14b8a6"
                    fill="#14b8a6"
                    fillOpacity={0.5}
                    strokeWidth={3}
                />
                <Radar
                    name="Outsourced"
                    dataKey="Outsourced"
                    stroke="#94a3b8"
                    fill="#94a3b8"
                    fillOpacity={0.2}
                    strokeWidth={2}
                />
                <Tooltip
                    contentStyle={{
                        backgroundColor: 'white',
                        border: '2px solid #cbd5e1',
                        borderRadius: '8px',
                        padding: '8px 12px',
                    }}
                />
                <Legend
                    wrapperStyle={{ fontSize: '13px', fontWeight: 600 }}
                    iconType="circle"
                />
            </RadarChart>
        </ResponsiveContainer>
    );
};
