import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StaffingData {
    name: string;
    value: number;
    fill: string;
    [key: string]: string | number;
}

const COLORS = {
    onshore: '#1e3a8a',
    offshore: '#14b8a6',
    onshoreSenior: '#1e40af',
    onshoreJunior: '#3b82f6',
    offshoreSenior: '#0d9488',
    offshoreJunior: '#2dd4bf',
};

export const StaffingSunburst: React.FC = () => {
    // Inner ring: Location
    const innerData: any[] = [
        { name: 'Onshore', value: 60, fill: COLORS.onshore },
        { name: 'Offshore', value: 40, fill: COLORS.offshore },
    ];

    // Outer ring: Role Level (proportional to inner)
    const outerData: any[] = [
        { name: 'Onshore Senior', value: 25, fill: COLORS.onshoreSenior },
        { name: 'Onshore Junior', value: 35, fill: COLORS.onshoreJunior },
        { name: 'Offshore Senior', value: 15, fill: COLORS.offshoreSenior },
        { name: 'Offshore Junior', value: 25, fill: COLORS.offshoreJunior },
    ];

    return (
        <ResponsiveContainer width="100%" height={350}>
            <PieChart>
                {/* Inner Ring - Location */}
                <Pie
                    data={innerData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    label={({ name, value }) => `${name}: ${value}%`}
                    labelLine={false}
                >
                    {innerData.map((entry, index) => (
                        <Cell key={`inner-${index}`} fill={entry.fill} />
                    ))}
                </Pie>

                {/* Outer Ring - Role Level */}
                <Pie
                    data={outerData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={85}
                    outerRadius={120}
                    label={({ name, value }) => `${value}%`}
                    labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                >
                    {outerData.map((entry, index) => (
                        <Cell key={`outer-${index}`} fill={entry.fill} />
                    ))}
                </Pie>

                <Tooltip />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ fontSize: '12px' }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};
