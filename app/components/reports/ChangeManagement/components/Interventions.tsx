import { Target, Zap, Clock, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export function Interventions({ data }: { data: any }) {
  const recommendations = data?.diagnostics?.recommendations || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Intervention Playbook</h2>
          <p className="text-slate-600 mt-1.5 font-medium italic opacity-70">Tactical responses to identified risks and sentiment drivers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec: string, i: number) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all border-l-4 border-l-indigo-600">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                <Target className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">Strategy {i + 1}</h3>
                <p className="text-lg font-bold text-slate-800 leading-tight">{rec}</p>
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase">High Impact</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-[10px] font-black text-slate-500 uppercase">48h Window</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
