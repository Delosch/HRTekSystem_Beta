import { Users, AlertTriangle, TrendingUp, TrendingDown, Target, Brain, CheckCircle, Search, Filter, ShieldAlert, Zap, ArrowRight, Activity } from 'lucide-react';

export function StakeholderRisk({ data }: { data: any }) {
  const highRiskCount = data?.meta?.highRiskCount || 24;
  const totalStakeholders = data?.meta?.totalStakeholders || 128;

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Stakeholder Risk Matrix</h2>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-[10px] font-black uppercase rounded-full tracking-widest">High Impact Analysis</span>
          </div>
          <p className="text-slate-600 mt-1.5 font-medium italic opacity-70">Predictive risk modeling for individual and group entities</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right border-r border-slate-200 pr-6">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Stakeholders</p>
            <p className="text-xl font-black text-slate-900 tracking-tighter">{totalStakeholders}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Critical High-Risk</p>
            <p className="text-xl font-black text-red-600 tracking-tighter">{highRiskCount}</p>
          </div>
        </div>
      </div>

      {/* Risk Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Index</p>
            <p className="text-lg font-black text-slate-900 uppercase">{data?.meta?.riskLevel || "Moderate"}</p>
          </div>
        </div>
      </div>

      {/* Stakeholder Table Mockup with Dynamic Data */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Priority Surveillance List</h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-white border border-slate-200 rounded text-[9px] font-black text-slate-500 uppercase tracking-tighter">Filter: High Risk</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 italic font-medium">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stakeholder</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Risk Level</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sentiment</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Probability of Delay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i} className="hover:bg-slate-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 font-black text-[10px] flex items-center justify-center text-slate-500">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <span className="text-sm font-bold text-slate-900 tracking-tight uppercase">Stakeholder Group {i}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-black text-slate-500 uppercase tracking-tighter">{data?.profile?.department || 'Operations'}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                      <span className="text-[10px] font-black text-red-600 uppercase">Critical</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-black rounded uppercase">Negative</span>
                  </td>
                  <td className="px-6 py-4 font-black text-slate-900 text-sm italic">84%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
