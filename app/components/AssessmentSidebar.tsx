import { useEffect, useState } from "react";
import { CheckCircle2, Circle, LayoutDashboard, ChevronRight } from "lucide-react";

interface SidebarProps {
  sections: { part: string; questions?: any[] }[];
  formData?: Record<string, any>;
  totalQuestions?: number;
  currentScore?: number;
  title?: string;
}

export default function AssessmentSidebar({
  sections,
  formData = {},
  totalQuestions = 0,
  currentScore = 0,
  title = "Assessment"
}: SidebarProps) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const OFFSET = 120;
          let current = 0;

          sections.forEach((_, index) => {
            const el = document.getElementById(`section-${index}`);
            if (el) {
              const rect = el.getBoundingClientRect();

              if (rect.top <= OFFSET && rect.bottom >= OFFSET) {
                current = index;
              } else if (rect.top <= OFFSET) {
                current = index;
              }
            }
          });

          setActive(current);
          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (index: number) => {
    const el = document.getElementById(`section-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const totalAnswered = Object.entries(formData).filter(
    ([key, val]) => {
      if (key.endsWith("_other")) return false;
      if (val === undefined || val === null) return false;
      if (typeof val === "string") return val.trim() !== "";
      if (Array.isArray(val)) return val.length > 0;
      if (typeof val === "object") return Object.keys(val).length > 0;
      return true;
    }
  ).length;

  const progressPercentage = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0;

  return (
    <div className="h-full flex flex-col bg-white text-slate-900 border-r border-slate-200 shadow-sm w-[420px] flex-shrink-0">

      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-600 rounded-lg shadow-sm shadow-indigo-200">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-tight text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Assessment Engine</p>
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
          Assessment Sections
        </div>

        <nav className="space-y-0.5 px-2">
          {sections.map((section, index) => {
            const displayName = section.part.replace(/^SECTION \d+:\s*/i, '');

            // Calculate completion for this section
            const sectionQuestions = section.questions || [];
            const answeredInSection = sectionQuestions.filter((q: any) => {
              const value = formData[q.id];
              if (value === undefined || value === null) return false;
              if (typeof value === "string") return value.trim() !== "";
              if (Array.isArray(value)) return value.length > 0;
              if (typeof value === "object") return Object.keys(value).length > 0;
              return true;
            }).length;

            const isComplete = sectionQuestions.length > 0 && answeredInSection === sectionQuestions.length;
            const isStarted = answeredInSection > 0;
            const shouldHighlight = isStarted || isComplete;

            return (
              <button
                key={`${section.part}-${index}`}
                onClick={() => scrollToSection(index)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-lg text-sm transition-all group text-left
                  ${shouldHighlight
                    ? 'bg-indigo-50 text-indigo-900 font-medium'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}
                `}
              >
                <div className="flex items-center gap-3 truncate">
                  <div className="flex-shrink-0">
                    {isComplete ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Circle className={`w-4 h-4 ${isStarted ? 'text-indigo-600' : 'text-slate-300'}`} />
                    )}
                  </div>
                  <span className="truncate pr-2" title={displayName}>
                    {displayName}
                  </span>
                </div>

                {isStarted && !isComplete && (
                  <span className="flex-shrink-0 text-[10px] bg-white border border-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded shadow-sm ml-2">
                    {answeredInSection}/{sectionQuestions.length}
                  </span>
                )}

                <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 flex-shrink-0 ml-1" />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}