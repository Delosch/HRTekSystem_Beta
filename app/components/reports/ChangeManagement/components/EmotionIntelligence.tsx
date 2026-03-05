import { TrendingUp, TrendingDown, Target, MessageSquare, Users, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function EmotionIntelligence({ data }: { data: any }) {
  const dominantEmotion = data?.dominantEmotion || 'Optimism';

  const emotionBreakdown = [
    {
      emotion: 'Anxiety',
      percentage: data?.deepViz?.emotionTracking?.find((e: any) => e.emotion === 'Anxiety')?.value || 28,
      previousPercentage: 33,
      trend: -5,
      color: 'amber',
      rootCause: data?.diagnostics?.riskReasons?.[0] || 'Unclear rollout timeline',
      recommendedMessage: 'Career path clarity + phased rollout communication',
      intervention: 'Manager briefing + rollout clarity session',
      priorityImpact: 'High',
      interventionTaken: 'Town Hall Session',
      beforeScore: 33,
      afterScore: 28,
      improvement: -5,
    },
    {
      emotion: 'Frustration',
      percentage: data?.deepViz?.emotionTracking?.find((e: any) => e.emotion === 'Frustration')?.value || 22,
      previousPercentage: 25,
      trend: -3,
      color: 'red',
      rootCause: 'Insufficient training on complex features',
      recommendedMessage: 'Enhanced support channels + step-by-step guides',
      intervention: 'Advanced training sessions + dedicated support desk',
      priorityImpact: 'Medium',
      interventionTaken: 'Enhanced Training Program',
      beforeScore: 25,
      afterScore: 22,
      improvement: -3,
    },
    {
      emotion: 'Optimism',
      percentage: data?.deepViz?.emotionTracking?.find((e: any) => e.emotion === 'Optimism' || e.emotion === 'Hope')?.value || 35,
      previousPercentage: 23,
      trend: 12,
      color: 'green',
      rootCause: `Leadership alignment in ${data?.profile?.department || 'core teams'}`,
      recommendedMessage: 'Celebrate successes + spotlight champions',
      intervention: 'Recognition program + success story sharing',
      priorityImpact: 'Medium',
      interventionTaken: 'Champion Recognition Program',
      beforeScore: 23,
      afterScore: 35,
      improvement: 12,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Emotion Intelligence</h2>
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-[10px] font-black uppercase rounded-full tracking-widest">Actionable Insights</span>
          </div>
          <p className="text-slate-600 mt-1.5 font-medium italic opacity-70">Sentiment → Root Cause → Intervention Playbook</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dominant Sentiment</p>
          <p className="text-lg font-black text-indigo-600 uppercase tracking-tighter">{dominantEmotion}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {emotionBreakdown.map((emotion) => (
          <div key={emotion.emotion} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-all group">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-sm font-black uppercase tracking-widest ${emotion.color === 'amber' ? 'text-amber-600' :
                emotion.color === 'red' ? 'text-red-600' :
                  'text-emerald-600'
                }`}>
                {emotion.emotion}
              </h3>
              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter ${emotion.priorityImpact === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                }`}>
                {emotion.priorityImpact} PRIORITY
              </span>
            </div>

            <div className="text-4xl font-black text-slate-900 mb-2 tracking-tighter">{emotion.percentage}%</div>

            <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
              <div
                className={`h-full rounded-full ${emotion.color === 'amber' ? 'bg-amber-500' :
                  emotion.color === 'red' ? 'bg-red-500' :
                    'bg-emerald-500'
                  }`}
                style={{ width: `${emotion.percentage}%` }}
              ></div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Root Cause</p>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{emotion.rootCause}</p>
              </div>
              <div className="p-3 bg-white rounded-lg border border-indigo-100 shadow-sm">
                <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">Intervention</p>
                <p className="text-xs font-black text-indigo-900 uppercase tracking-tight">{emotion.intervention}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-6">Sentiment Traversal</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data?.deepViz?.emotionTracking || []}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="emotion" hide />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={4}
                dot={{ fill: '#6366f1', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
