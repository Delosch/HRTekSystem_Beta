
import React from 'react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadialBarChart, RadialBar, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

const radarData = [
  { subject: 'Tech Architecture', A: 120, fullMark: 150 },
  { subject: 'Process Intel', A: 98, fullMark: 150 },
  { subject: 'Data Gravity', A: 86, fullMark: 150 },
  { subject: 'Cost & ROI', A: 99, fullMark: 150 },
  { subject: 'Change Velocity', A: 85, fullMark: 150 },
  { subject: 'AI Depth', A: 65, fullMark: 150 },
];

const gaugeData = [
  { name: '18-24', uv: 31.47, pv: 2400, fill: '#8884d8' },
  { name: '25-29', uv: 26.69, pv: 4567, fill: '#83a6ed' },
  { name: '30-34', uv: 15.69, pv: 1398, fill: '#8dd1e1' },
  { name: '35-39', uv: 8.22, pv: 9800, fill: '#82ca9d' },
  { name: '40-49', uv: 8.63, pv: 3908, fill: '#a4de6c' },
  { name: '50+', uv: 2.63, pv: 4800, fill: '#d0ed57' },
  { name: 'unknow', uv: 6.67, pv: 4800, fill: '#ffc658' }
];

const riskData = [
  { name: 'Risk', value: 75, fill: '#ef4444' }
];

export const ExecutiveSummary = () => {
  return (
    <div className="space-y-6 mb-20">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
         <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Executive Intelligence Summary</h2>
            <p className="text-slate-400 text-sm">Aggregated diagnostic outcomes across all 10 dimensions.</p>
         </div>
         <button className="bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-semibold py-2 px-4 rounded shadow-lg shadow-cyan-500/20 transition-all">
            Generate PDF Report
         </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Radar Chart */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>
          <h3 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-wider">Strategic Balance</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                <Radar name="Current State" dataKey="A" stroke="#06b6d4" strokeWidth={2} fill="#06b6d4" fillOpacity={0.3} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
                  itemStyle={{ color: '#06b6d4' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Maturity Gauge */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.1 }}
           className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden"
        >
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
           <h3 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-wider">Overall Maturity</h3>
           <div className="h-64 w-full flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" barSize={10} data={riskData} startAngle={180} endAngle={0}>
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={30} // Use cornerRadius instead of corner
                    fill="#3b82f6"
                  />
                  <text x="50%" y="45%" textAnchor="middle" dominantBaseline="middle" className="fill-white text-4xl font-bold">
                    3.2
                  </text>
                  <text x="50%" y="55%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-400 text-sm">
                    / 5.0
                  </text>
                  <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" className="fill-cyan-400 text-sm font-semibold tracking-wide uppercase">
                    Integrated HR
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
           </div>
        </motion.div>

        {/* Risk Meter */}
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           whileInView={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.2 }}
           className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative overflow-hidden"
        >
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-red-500"></div>
           <h3 className="text-slate-300 font-semibold mb-4 text-sm uppercase tracking-wider">Failure Risk @ Scale</h3>
           <div className="h-64 w-full flex flex-col items-center justify-center">
              <div className="relative w-48 h-24 overflow-hidden mb-4">
                 <div className="absolute top-0 left-0 w-full h-full bg-slate-800 rounded-t-full"></div>
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-t-full opacity-20"></div>
                 <motion.div 
                   className="absolute bottom-0 left-1/2 w-1 h-24 bg-red-500 origin-bottom rounded-full"
                   initial={{ rotate: -90 }}
                   whileInView={{ rotate: 45 }}
                   transition={{ duration: 1.5, type: "spring" }}
                   style={{ zIndex: 10 }}
                 />
                 <div className="absolute bottom-0 left-1/2 w-4 h-4 bg-white rounded-full -translate-x-1/2 translate-y-1/2 z-20"></div>
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-red-500">High</span>
                <p className="text-slate-400 text-xs mt-1">Significant friction points detected in <br/>Process Intelligence & AI Depth.</p>
              </div>
           </div>
        </motion.div>

      </div>
    </div>
  );
};

