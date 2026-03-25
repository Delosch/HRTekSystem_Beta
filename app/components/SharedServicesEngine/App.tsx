import { useState, useRef } from 'react';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DomainSection } from './components/DomainSection';
import { assessmentData } from './data/assessment-data';
import { calculateSSTI } from './utils/calculations';
import { Menu, Zap } from 'lucide-react';

function App() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleAnswerChange = (questionId: number, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };


  const sstiResult = calculateSSTI(answers);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-96 bg-[#0F172A] transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <DashboardSidebar 
          currentScore={sstiResult.sstiScore}
          answers={answers}
          totalQuestions={sstiResult.totalQuestions}
          onNavigate={(domainId) => {
            const element = document.getElementById(`domain-${domainId}`);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
              setIsSidebarOpen(false);
            }
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between shrink-0">
          <div className="font-bold text-slate-900">Shared Services Engine</div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-5xl mx-auto px-6 py-12">
            
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
                  Enterprise Shared Services Engine
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl leading-relaxed">
                  Assess your current maturity across 9 key transformation domains. 
                  Generate your AI-driven roadmap and readiness score.
                </p>
              </div>

              
            
            </div>

            {/* Domain Sections */}
            <div className="space-y-6">
              {assessmentData.map((domain) => (
                <DomainSection
                  key={domain.id}
                  domainId={domain.id}
                  title={domain.name}
                  description={domain.description}
                  questions={domain.questions}
                  answers={answers}
                  onAnswerChange={handleAnswerChange}
                  isAgentic={domain.id === 9}
                />
              ))}
            </div>

            {/* Footer / Copyright (Optional replacement for Executive Summary) */}
            <div className="mt-20 pt-10 border-t border-slate-200 text-center text-slate-400 text-sm">
              <p>&copy; 2026 Enterprise Shared Services Engine. All rights reserved.</p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;