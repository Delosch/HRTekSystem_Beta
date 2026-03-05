import { Sparkles, TrendingUp, DollarSign, AlertTriangle, Target, Layers } from 'lucide-react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ScatterChart, Scatter, ZAxis, ReferenceLine, LineChart, Line, Legend
} from 'recharts';
import { SSTIResult, calculateCostSavings, identifyRisks, getTransformationPhase, getAgenticRecommendation, getDomainStrategicImportance } from '../utils/calculations';

interface ExecutiveSummaryProps {
  sstiResult: SSTIResult;
}

export function ExecutiveSummary({ sstiResult }: ExecutiveSummaryProps) {
  const { sstiScore, classification, domainScores } = sstiResult;

  // 1. Matrix Data (Strategic Importance vs Maturity)
  const matrixData = domainScores.map(ds => ({
    name: ds.domainName.split(' ')[0], 
    x: ds.score, 
    y: getDomainStrategicImportance(ds.domainId), 
    z: 100 
  }));

  // 2. Trend Data (Projected ROI)
  const trendData = [
    { year: 'Baseline', value: 0 },
    { year: 'Year 1', value: sstiScore * 1.5 },
    { year: 'Year 2', value: sstiScore * 2.8 },
    { year: 'Year 3', value: sstiScore * 4.2 },
  ];

  // Radar Data
  const radarData = domainScores.map((ds) => ({
    domain: ds.domainName.split(' ')[0],
    score: ds.score,
    fullMark: 100,
  }));

  // Calculations
  const risks = identifyRisks(domainScores);
  const highRisks = risks.filter((r) => r.level === 'high');
  const financialDomainScore = domainScores.find((ds) => ds.domainId === 7)?.score || 0;
  const averageScore = domainScores.reduce((sum, ds) => sum + ds.score, 0) / domainScores.length;
  const { currentCost, projectedSavings } = calculateCostSavings(financialDomainScore, averageScore);
  
  // Calculate Gauge Fill
  // 270 degrees is the visible part of the circle (leaving 90 degree gap at bottom)
  const gaugePercentage = (sstiScore / 100) * 270; 

  return (
    <section id="executive-summary" className="bg-[#0B1120] py-20 px-6 lg:px-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* HEADER */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#06B6D4]/10 rounded-full border border-[#06B6D4]/30 text-[#06B6D4] text-sm font-medium">
            <Sparkles className="w-4 h-4" /> AI-Generated Executive Report
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">Transformation Intelligence</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Based on your inputs, we have architected a 3-year transformation roadmap tailored to your organization's maturity profile.
          </p>
        </div>

        {/* TOP ROW: SSTI Score & High-Level KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Score Card */}
          <div className="lg:col-span-1 bg-slate-900/50 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#06B6D4] to-[#1E40AF]" />
            <div className="relative w-48 h-48 mb-6">
              {/* SVG Rotation: Keeps gauge oriented correctly (gap at bottom) */}
              <svg className="w-full h-full rotate-[135deg]">
                <circle cx="96" cy="96" r="88" stroke="#1e293b" strokeWidth="12" fill="none" strokeDasharray="553" strokeDashoffset="138" strokeLinecap="round" />
                <circle 
                  cx="96" 
                  cy="96" 
                  r="88" 
                  stroke="url(#scoreGradient)" 
                  strokeWidth="12" 
                  fill="none" 
                  strokeLinecap="round" 
                  strokeDasharray="553" 
                  // 553 is circumference. We start full and subtract the length we want to show.
                  strokeDashoffset={553 - (gaugePercentage / 270) * (553 - 138)} 
                  className="transition-all duration-1000 ease-out" 
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06B6D4" />
                    <stop offset="100%" stopColor="#1E40AF" />
                  </linearGradient>
                </defs>
              </svg>
              
              {/* FIXED: Removed -rotate-[135deg] class. Text is now straight. */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-bold text-white">{sstiScore}</span>
                <span className="text-sm text-slate-400">SSTI Score</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-xl font-medium text-[#06B6D4] mb-1">{classification}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest">Maturity Classification</div>
            </div>
          </div>

          {/* KPI Tiles */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
               <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><AlertTriangle className="w-6 h-6" /></div>
                 <span className="text-xs font-mono text-slate-500">CRITICAL</span>
               </div>
               <div className="text-3xl font-bold text-white mb-1">{highRisks.length}</div>
               <div className="text-sm text-slate-400">Priority Risk Areas Identified</div>
            </div>
            <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
               <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><DollarSign className="w-6 h-6" /></div>
                 <span className="text-xs font-mono text-slate-500">PROJECTED</span>
               </div>
               <div className="text-3xl font-bold text-white mb-1">${(projectedSavings / 1000).toFixed(1)}M</div>
               <div className="text-sm text-slate-400">Annual Efficiency Savings</div>
            </div>
            <div className="bg-slate-800/40 p-6 rounded-xl border border-slate-700/50 backdrop-blur-sm">
               <div className="flex items-start justify-between mb-4">
                 <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><Layers className="w-6 h-6" /></div>
                 <span className="text-xs font-mono text-slate-500">ROADMAP</span>
               </div>
               <div className="text-3xl font-bold text-white mb-1">Phase {getTransformationPhase(sstiScore)}</div>
               <div className="text-sm text-slate-400">Current Transformation Stage</div>
            </div>

            {/* AI Insight Tile - Spans 3 columns */}
            <div className="md:col-span-3 bg-gradient-to-r from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 flex items-center justify-between">
              <div>
                <h4 className="text-[#06B6D4] font-semibold mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Recommended Agentic Module
                </h4>
                <p className="text-white text-lg">{getAgenticRecommendation(domainScores.find(d=>d.domainId===9)?.score||0)}</p>
              </div>
              <button className="px-6 py-2 bg-[#06B6D4] hover:bg-[#0891b2] text-white font-medium rounded-lg transition-colors">
                Activate Module
              </button>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: BIG CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. DOMAIN MATURITY RADAR */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#06B6D4]" /> Domain Maturity Heatmap
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="domain" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="score" stroke="#06B6D4" strokeWidth={3} fill="#06B6D4" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 2. STRATEGIC MATRIX */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
             <h3 className="text-xl font-semibold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" /> Strategic Maturity Matrix
            </h3>
            <p className="text-sm text-slate-400 mb-6">Visualizing Maturity (X) vs. Strategic Impact (Y) for each domain.</p>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" dataKey="x" name="Maturity" unit="%" stroke="#94a3b8" domain={[0, 100]} />
                  <YAxis type="number" dataKey="y" name="Impact" unit="%" stroke="#94a3b8" domain={[0, 100]} />
                  <ZAxis type="number" dataKey="z" range={[100, 300]} />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({active, payload}) => {
                      if(active && payload && payload.length) {
                        return (
                          <div className="bg-slate-800 p-2 border border-slate-600 rounded text-white text-xs">
                             <p className="font-bold">{payload[0].payload.name}</p>
                             <p>Maturity: {payload[0].value}%</p>
                             <p>Impact: {payload[1].value}%</p>
                          </div>
                        )
                      }
                      return null;
                  }} />
                  <ReferenceLine x={50} stroke="#475569" strokeDasharray="3 3" />
                  <ReferenceLine y={50} stroke="#475569" strokeDasharray="3 3" />
                  <Scatter name="Domains" data={matrixData} fill="#06B6D4">
                    {matrixData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.x < 50 ? '#ef4444' : entry.x > 80 ? '#22c55e' : '#facc15'} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: FINANCIAL TREND */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8">
            <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" /> 3-Year Value Realization
            </h3>
            <div className="h-72 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                    <XAxis dataKey="year" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                    <Line type="monotone" dataKey="value" stroke="#22c55e" strokeWidth={3} dot={{ r: 6, fill: '#22c55e' }} activeDot={{ r: 8 }} />
                 </LineChart>
               </ResponsiveContainer>
            </div>
        </div>

      </div>
    </section>
  );
}