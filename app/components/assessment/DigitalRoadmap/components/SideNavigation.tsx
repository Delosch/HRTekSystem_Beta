import React from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface Section {
  id: string;
  title: string;
}

interface SideNavigationProps {
  sections: Section[];
  currentSection: number;
  onSectionClick: (index: number) => void;
  sectionCompletion: { [key: string]: boolean };
}

export function SideNavigation({ sections, currentSection, onSectionClick, sectionCompletion }: SideNavigationProps) {
  return (
    <aside className="fixed left-0 top-24 h-[calc(100vh-6rem)] w-80 bg-white border-r border-slate-200 shadow-lg overflow-y-auto">
      <div className="p-6">
        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
          Assessment Sections
        </h3>
        <nav className="space-y-1">
          {sections.map((section, index) => {
            const isActive = currentSection === index;
            const isComplete = sectionCompletion[section.id];
            
            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(index)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex-shrink-0">
                  {isComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : isActive ? (
                    <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    </div>
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${isActive ? 'font-semibold' : ''}`}>
                    {section.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Section {index + 1}</p>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}

