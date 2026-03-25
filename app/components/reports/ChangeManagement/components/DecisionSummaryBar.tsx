import { Target, TrendingUp, Users, ArrowRight } from 'lucide-react';

export function DecisionSummaryBar({ data }: { data: any }) {
  const recommendation = data?.diagnostics?.recommendations?.[0] || "Address Employee Anxiety";

  return (
    <div className="bg-white border border-indigo-200 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <Target className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Weekly Intelligence Priority</p>
            <div className="flex items-center gap-4 text-slate-900">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl tracking-tighter uppercase">{recommendation.split(' ')[0]} Focus</span>
                <ArrowRight className="w-5 h-5 text-slate-300" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm uppercase tracking-tight">{recommendation}</span>
                <ArrowRight className="w-5 h-5 text-slate-300" />
              </div>
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Predictive: +8% Adoption</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right border-r border-slate-100 pr-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Strategy Owner</p>
            <p className="text-slate-900 font-black text-sm uppercase tracking-tight">Executive Lead</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Index Lift</p>
            <p className="text-indigo-600 font-black text-3xl tracking-tighter leading-none">+15</p>
          </div>
          <button className="px-6 py-3 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-lg hover:bg-black transition-all shadow-lg active:scale-95">
            Optimize Plan
          </button>
        </div>
      </div>
    </div>
  );
}
