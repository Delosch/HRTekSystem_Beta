import { motion } from 'framer-motion';
import { Card } from './ui/card';
import { Sparkles, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface StrategicDriversSectionProps {
  data: any;
}

export function StrategicDriversSection({ data }: StrategicDriversSectionProps) {
  const selectedDrivers = data['drivers'] || ['growth', 'efficiency', 'analytics'];
  const selectedOutcomes = data['outcomes'] || ['employee-experience', 'cost-reduction', 'analytics'];
  const alignmentLevel = data['alignment'] || 58;

  const driverLabels: Record<string, string> = {
    growth: 'Revenue Growth',
    efficiency: 'Cost Efficiency',
    innovation: 'Digital Innovation',
    talent: 'Talent Acquisition',
    global: 'Global Expansion',
    analytics: 'Data-Driven',
    agility: 'Business Agility'
  };

  const outcomeLabels: Record<string, string> = {
    'employee-experience': 'Employee Experience',
    'talent-quality': 'Talent Quality',
    'cost-reduction': 'Cost Reduction',
    'speed': 'Decision Speed',
    'compliance': 'Risk & Compliance',
    'analytics': 'People Analytics'
  };

  const driversData = selectedDrivers.map((d: string, i: number) => ({
    name: driverLabels[d] || d,
    value: 100 / selectedDrivers.length,
    color: ['#1e3a8a', '#3b82f6', '#60a5fa', '#93c5fd'][i % 4]
  }));

  const priorityData = selectedOutcomes.map((o: string) => ({
    driver: outcomeLabels[o] || o,
    priority: Math.floor(Math.random() * (95 - 75 + 1) + 75) // Simulated priority score
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2 italic tracking-tight">
          Strategic Drivers & Transformation Intent
        </h1>
        <p className="text-slate-600 font-medium">
          Understanding business motivations and strategic alignment ensures your transformation 
          roadmap addresses actual organizational priorities, not just technology trends.
        </p>
      </div>

      {/* Key Transformation Drivers */}
      <Card className="p-8 bg-white border-slate-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            Primary Transformation Drivers
          </h2>
          <p className="text-sm text-slate-500">
            Current business priorities driving this transformation lifecycle.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={driversData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {driversData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex flex-col justify-center space-y-5">
            {driversData.map((driver: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-4 h-4 rounded-full shadow-sm" 
                    style={{ backgroundColor: driver.color }}
                  ></div>
                  <span className="text-sm font-bold text-slate-700">{driver.name}</span>
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Driver</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-4">
          <Sparkles className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Intelligence Insight</p>
            <p className="text-sm text-slate-700 font-medium">
              Your focus on <span className="text-indigo-700 font-bold">{driverLabels[selectedDrivers[0]]}</span> suggests prioritizing mobile enablement and AI orchestration in Phase 1 to demonstrate immediate strategic value.
            </p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-8">
        {/* Driver Priority Ranking */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Outcome Prioritization
            </h2>
            <p className="text-sm text-slate-500">
              Urgency weighting based on executive emphasis and budget allocation.
            </p>
          </div>

          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical" margin={{ left: 20, right: 30 }}>
                <XAxis type="number" hide domain={[0, 100]} />
                <YAxis 
                  type="category" 
                  dataKey="driver" 
                  width={140} 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="priority" 
                  fill="#1e3a8a" 
                  radius={[0, 12, 12, 0]} 
                  barSize={20}
                >
                   {priorityData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={['#1e3a8a', '#3b82f6', '#60a5fa'][index % 3]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* HR Strategy Alignment */}
        <Card className="p-8 bg-white border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Strategic Alignment
            </h2>
            <p className="text-sm text-slate-500">
              Connectivity level between HR transformation and business goals.
            </p>
          </div>

          <div className="space-y-8">
            <div className="text-center">
              <span className={`text-6xl font-black italic tracking-tighter ${alignmentLevel > 70 ? 'text-emerald-600' : alignmentLevel > 40 ? 'text-blue-600' : 'text-amber-600'}`}>
                {alignmentLevel}%
              </span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Alignment Index</p>
            </div>

            <div className="relative pt-4">
               <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${alignmentLevel}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${alignmentLevel > 70 ? 'from-emerald-500 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'from-blue-600 to-indigo-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]'}`}
                  />
               </div>
               <div className="flex justify-between mt-3">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Isolated</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Connected</span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Strategic</span>
               </div>
            </div>

            <p className="text-xs text-slate-500 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
              {alignmentLevel > 70 
                ? "Highly Strategic Alignment. Your HR transformation objectives are inextricably linked to organizational performance metrics."
                : alignmentLevel > 40 
                ? "Connected Alignment. Good integration with business objectives, but requires more focused executive buy-in."
                : "Basic Alignment. Transformation goals are currently viewed as operational upgrades rather than strategic drivers."}
            </p>
          </div>
        </Card>
      </div>


      {/* Transformation Ambition */}
      <Card className="p-8 bg-white border-slate-200">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-2">
            Transformation Ambition (2-Year Vision)
          </h2>
          <p className="text-sm text-slate-600">
            Your target maturity level defines roadmap scope, investment requirements, and capability needs. 
            This shows a clear progression path rather than a one-size-fits-all approach.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Pyramid Visual */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Level 4 */}
              <div className="mb-2 flex items-center">
                <div className="w-1/4 h-16 bg-gradient-to-r from-blue-900 to-blue-800 rounded-l-lg flex items-center justify-center text-white text-xs font-medium border-r-4 border-white">
                  L4
                </div>
                <div className="flex-1 px-4">
                  <p className="text-sm font-semibold text-slate-900">Predictive HR Ecosystem</p>
                </div>
              </div>

              {/* Level 3 - Target */}
              <div className="mb-2 flex items-center">
                <div className="w-1/2 h-16 bg-gradient-to-r from-teal-600 to-teal-500 rounded-l-lg flex items-center justify-center text-white text-xs font-medium border-r-4 border-white relative">
                  <span>L3</span>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                    <div className="bg-teal-600 text-white text-xs px-2 py-1 rounded-full shadow-lg whitespace-nowrap">
                      Target
                    </div>
                  </div>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-sm font-semibold text-slate-900">AI-Powered HR</p>
                </div>
              </div>

              {/* Level 2 - Current */}
              <div className="mb-2 flex items-center">
                <div className="w-3/4 h-16 bg-gradient-to-r from-slate-400 to-slate-300 rounded-l-lg flex items-center justify-center text-white text-xs font-medium border-r-4 border-white relative">
                  <span>L2</span>
                  <div className="absolute -right-2 top-1/2 -translate-y-1/2">
                    <div className="bg-slate-500 text-white text-xs px-2 py-1 rounded-full shadow-lg whitespace-nowrap">
                      Current
                    </div>
                  </div>
                </div>
                <div className="flex-1 px-4">
                  <p className="text-sm font-semibold text-slate-900">Automate & Optimize</p>
                </div>
              </div>

              {/* Level 1 */}
              <div className="flex items-center">
                <div className="w-full h-16 bg-gradient-to-r from-slate-200 to-slate-100 rounded-l-lg flex items-center justify-center text-slate-600 text-xs font-medium border-r-4 border-white">
                  L1
                </div>
                <div className="flex-1 px-4">
                  <p className="text-sm font-semibold text-slate-900">Fix Basics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progression Flow */}
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 border-l-4 border-slate-300 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-500">LEVEL 1</span>
                <span className="text-sm font-semibold text-slate-900">Fix Basics</span>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Digitize core processes, eliminate paper, establish data hygiene
              </p>
              <p className="text-xs text-slate-500">Foundation for future automation</p>
            </div>

            <div className="flex justify-center">
              <ChevronRight className="w-5 h-5 text-slate-300 rotate-90" />
            </div>

            <div className="p-4 bg-blue-50 border-l-4 border-blue-300 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-blue-600">LEVEL 2</span>
                <span className="text-sm font-semibold text-slate-900">Automate & Optimize</span>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Workflow automation, self-service, mobile access, basic analytics
              </p>
              <p className="text-xs text-slate-500">Risk: Integration complexity, change fatigue</p>
            </div>

            <div className="flex justify-center">
              <ChevronRight className="w-5 h-5 text-teal-400 rotate-90" />
            </div>

            <div className="p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-teal-600">LEVEL 3 (TARGET)</span>
                <span className="text-sm font-semibold text-slate-900">AI-Powered HR</span>
              </div>
              <p className="text-sm text-slate-600 mb-2">
                Chatbots, predictive analytics, talent intelligence, proactive recommendations
              </p>
              <p className="text-xs text-slate-500">Requires: Data platform, AI governance, skills upskilling</p>
            </div>

            <div className="flex justify-center">
              <ChevronRight className="w-5 h-5 text-slate-200 rotate-90" />
            </div>

            <div className="p-4 bg-slate-50 border-l-4 border-slate-200 rounded-r-lg opacity-60">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400">LEVEL 4</span>
                <span className="text-sm font-semibold text-slate-600">Predictive HR Ecosystem</span>
              </div>
              <p className="text-sm text-slate-500 mb-2">
                Autonomous HR processes, real-time workforce intelligence, AI-driven decisions
              </p>
              <p className="text-xs text-slate-400">Future state beyond current roadmap horizon</p>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-slate-900 mb-1">AI Insight</p>
            <p className="text-sm text-slate-700">
              Reaching Level 3 from your current Level 2 requires 18-24 months, $4.2M investment, 
              and foundational work in data integration, governance, and AI infrastructure.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

