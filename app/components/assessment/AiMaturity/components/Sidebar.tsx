import React from 'react';
import { LayoutDashboard, Circle, ChevronRight } from 'lucide-react';
import { diagnosticData } from '../data/diagnosticData';
import clsx from 'clsx';

// 1. Define Props
interface SidebarProps {
  progress: number;
  isComplete: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ progress, isComplete }) => {
  return (
    // 2. Changed w-64 to w-80 to make it wider
    <div className="fixed inset-y-0 left-0 w-96 bg-white border-r border-slate-200 flex flex-col z-10 shadow-sm">
      
      {/* Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-sm shadow-indigo-200">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 tracking-tight">HR Tek Systems</h2>
            <p className="text-xs text-slate-500">Diagnostic Engine v3.0</p>
          </div>
        </div>

        {/* Progress Bar Updated to use props */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs text-slate-500 font-semibold uppercase">Progress</span>
            <span className="text-sm font-bold text-indigo-600">{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-0.5">
        {diagnosticData.map((dim) => (
          <button
            key={dim.id}
            onClick={() => {
              const el = document.getElementById(`dim-${dim.id}`);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-50 group"
          >
            <div className="flex items-center gap-3">
              <Circle className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-400 transition-colors" />
              {/* Increased max-w so text doesn't cut off as early */}
              <span className="truncate max-w-[280px] font-medium" title={dim.title.split(':')[1].trim()}>
                {dim.title.split(':')[1].trim()}
              </span>
            </div>
            <ChevronRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        {/* Dynamic Button State based on isComplete prop */}
        <button 
          disabled={!isComplete}
          className={clsx(
            "w-full py-2.5 border text-sm font-medium rounded-lg transition-all shadow-sm",
            isComplete 
              ? "bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 cursor-pointer shadow-indigo-200" 
              : "bg-white border-slate-200 text-slate-400 cursor-not-allowed"
          )}
        >
          Generate Report
        </button>
      </div>
    </div>
  );
};
