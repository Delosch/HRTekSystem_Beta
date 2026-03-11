
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'You', score: 65 },
  { name: 'Ind.', score: 45 }, // Industry
  { name: 'Best', score: 85 },
];

export const MiniBarChart = ({ isInverted }: { isInverted?: boolean }) => {
  return (
    <div className="h-24 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fill: isInverted ? '#94a3b8' : '#64748b' }} 
            axisLine={false} 
            tickLine={false} 
          />
          <YAxis hide domain={[0, 100]} />
          <Tooltip 
            cursor={{ fill: 'transparent' }}
            contentStyle={{ 
              backgroundColor: '#1e293b', 
              border: 'none', 
              borderRadius: '4px', 
              fontSize: '12px',
              color: '#fff' 
            }}
          />
          <Bar dataKey="score" radius={[4, 4, 0, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === 0 ? (isInverted ? '#22d3ee' : '#0ea5e9') : (isInverted ? '#475569' : '#cbd5e1')} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

