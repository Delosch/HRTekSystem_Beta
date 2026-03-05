import { useState } from 'react';
import { Settings, AlertTriangle, Database, Lock, Bell, Sliders, Info, CheckCircle, RotateCcw, Shield } from 'lucide-react';

export function SettingsPanel({ data }: { data: any }) {
  const [showImpactWarning, setShowImpactWarning] = useState(false);

  const resetToDefaults = () => {
    if (confirm('Reset all settings to recommended defaults? This will not affect your data.')) {
      alert('Settings reset to recommended defaults');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">System Configuration</h2>
          <p className="text-slate-600 mt-1.5 font-medium italic opacity-70">Safe controls • Impact guidance • Best-practice guardrails</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-4 mb-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
          <Shield className="w-8 h-8 text-emerald-600" />
          <div>
            <p className="text-sm font-black text-emerald-900 uppercase tracking-tight">System Health: Optimal</p>
            <p className="text-xs text-emerald-700 font-medium">All engines operating within recommended safety margins</p>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Risk Thresholds</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { label: 'Critical CRS Threshold', value: 45 },
                { label: 'Warning CRS Threshold', value: 65 },
              ].map((setting) => (
                <div key={setting.label}>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{setting.label}</label>
                  <input
                    type="number"
                    defaultValue={setting.value}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
