import { CheckCircle2, Circle, LayoutDashboard, ChevronRight } from 'lucide-react';
import { assessmentData } from '../data/assessment-data';

interface DashboardSidebarProps {
  currentScore: number;
  answers: Record<number, number>;
  totalQuestions: number;
  onNavigate: (domainId: number) => void;
}

export function DashboardSidebar({
  currentScore,
  answers,
  totalQuestions,
  onNavigate,
}: DashboardSidebarProps) {

  const totalAnswered = Object.keys(answers).length;
  const progressPercentage = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-white text-slate-900 border-r border-slate-200 shadow-sm">

      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <img src="/hrtek_logo.png" alt="HRTek Logo" className="w-8 h-8 object-contain" />
            <div className="h-6 w-[1.5px] bg-slate-200 mx-1"></div>
            <div>
              <h2 className="font-bold text-lg tracking-tight text-slate-900 leading-none">HRTek</h2>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-0.5">Assessment</p>
            </div>
          </div>
        </div>

        {/* Progress Widget */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <div className="flex justify-between items-end mb-2">
            <span className="text-sm text-slate-500 font-medium">Completion</span>
            <span className="text-xl font-bold text-indigo-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="mt-3 flex justify-between items-center">
            <span className="text-xs text-slate-500">Current Score</span>
            <span className="text-xs font-mono text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded shadow-sm">
              {currentScore > 0 ? currentScore : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Transformation Domains
        </div>

        <nav className="space-y-0.5 px-2">
          {assessmentData && assessmentData.length > 0 ? (
            assessmentData.map((domain) => {
              const questionsInDomain = domain.questions.map(q => q.id);
              const answeredCount = questionsInDomain.filter(id => answers[id]).length;
              const isComplete = answeredCount === questionsInDomain.length && questionsInDomain.length > 0;
              const isStarted = answeredCount > 0;

              return (
                <button
                  key={domain.id}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(domain.id);
                  }}
                  className={`
                    w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all group cursor-pointer pointer-events-auto relative z-10
                    ${isStarted
                      ? 'bg-indigo-50 text-indigo-900 font-medium'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className={`w-4 h-4 ${isStarted ? 'text-indigo-600' : 'text-slate-300'}`} />
                    )}
                    <span className="text-left pr-2">
                      {domain.name}
                    </span>
                  </div>

                  {isStarted && !isComplete && (
                    <span className="text-[10px] bg-white border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded shadow-sm">
                      {answeredCount}/{questionsInDomain.length}
                    </span>
                  )}

                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
                </button>
              );
            })
          ) : (
            <div className="p-4 text-sm text-red-400">
              Error: No assessment data found.
            </div>
          )}
        </nav>
      </div>

      {/* Footer Removed */}
    </div>
  );
}