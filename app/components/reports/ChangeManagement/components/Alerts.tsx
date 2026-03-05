import { AlertTriangle, ShieldAlert, Zap, Bell, CheckCircle } from 'lucide-react';

export function Alerts({ data }: { data: any }) {
  const risks = data?.diagnostics?.riskReasons || [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Active Surveillance</h2>
          <p className="text-slate-600 mt-1.5 font-medium italic opacity-70">Automated risk detection and priority alerting</p>
        </div>
      </div>

      <div className="space-y-4">
        {risks.map((risk: string, i: number) => (
          <div key={i} className="bg-white rounded-2xl border border-red-100 p-6 flex items-start gap-5 hover:border-red-300 transition-colors shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center flex-shrink-0">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-widest">Priority Alert</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase italic">Just Detected</span>
              </div>
              <p className="text-lg font-black text-slate-900 tracking-tight uppercase">{risk}</p>
              <div className="mt-4 flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-600 uppercase">Immediate Action Required</span>
                </div>
                <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline">Deploy Playbook</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
