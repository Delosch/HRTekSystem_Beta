import { RadioTileGroup } from './RadioTileGroup';
import { RadioTileGroupAgentic } from './RadioTileGroupAgentic';
import { DomainCharts } from './DomainCharts';
import { DOMAIN_WEIGHTS } from '../utils/calculations';
import { Sparkles } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
}

interface DomainSectionProps {
  domainId: number;
  title: string;
  description: string;
  questions: Question[];
  answers: Record<number, number>;
  onAnswerChange: (questionId: number, value: number) => void;
  isAgentic?: boolean;
}

export function DomainSection({
  domainId,
  title,
  description,
  questions,
  answers,
  onAnswerChange,
  isAgentic = false,
}: DomainSectionProps) {
  
  const convertOptions = (options: string[]) => {
    return options.map((text, index) => ({
      value: index + 1,
      label: String.fromCharCode(65 + index), 
      text,
    }));
  };

  const answeredInDomain = questions.filter((q) => answers[q.id] > 0).length;
  const completionPercent = (answeredInDomain / questions.length) * 100;

  // AGENTIC SECTION (LIGHT THEME)
  if (isAgentic) {
    return (
      <section id={`domain-${domainId}`} className="scroll-mt-4 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 rounded-xl shadow-lg border border-indigo-100 overflow-hidden mb-8 relative">
        
        {/* Decorative background blobs - kept subtle */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-100/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
        
        <div className="relative z-10 p-8">
          <div className="mb-8 pb-6 border-b border-indigo-100">
             <div className="flex items-center justify-between mb-3">
               <div className="flex items-center gap-2">
                 <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
                 <span className="text-sm font-semibold text-indigo-600 tracking-wide uppercase">Domain {domainId} - Differentiator Layer</span>
               </div>
               
               <div className="flex items-center gap-3">
                 <span className="text-xs text-indigo-500 font-medium">
                   {answeredInDomain}/{questions.length} Completed
                 </span>
                 <div className="w-32 h-2 bg-indigo-100/50 rounded-full overflow-hidden border border-indigo-100">
                   <div
                     className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 transition-all duration-500 ease-out"
                     style={{ width: `${completionPercent}%` }}
                   />
                 </div>
               </div>
             </div>
             
             {/* HEADER TEXT: Updated to slate-900 (Black) */}
             <h2 className="text-3xl font-bold text-slate-900 mb-2">{title}</h2>
             <p className="text-slate-600 text-lg leading-relaxed mb-4">{description}</p>
          </div>

          <div className="space-y-8">
            {questions.map((question) => (
              <div key={question.id}>
                {/* Clean component usage - no messy CSS overrides needed anymore */}
                <RadioTileGroupAgentic
                  questionNumber={question.id}
                  questionText={question.text}
                  options={convertOptions(question.options)}
                  value={answers[question.id] ?? null}
                  onChange={(value) => onAnswerChange(question.id, value)}
                />
              </div>
            ))}
          </div>
          
          {answeredInDomain > 0 && (
             <div className="mt-8 pt-8 border-t border-indigo-100">
                <p className="text-indigo-600 mb-4 font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Agentic Readiness Analysis
                </p>
                <DomainCharts
                  questions={questions}
                  answers={answers}
                  domainId={domainId}
                  domainWeight={DOMAIN_WEIGHTS[domainId as keyof typeof DOMAIN_WEIGHTS]}
                  domainName={title}
                />
             </div>
          )}
        </div>
      </section>
    );
  }

  // Standard Domain Styling
  return (
    <section id={`domain-${domainId}`} className="scroll-mt-4 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8 transition-all hover:shadow-md">
      <div className="p-8">
        <div className="mb-8 pb-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[#06B6D4] font-semibold tracking-wide uppercase">Domain {domainId}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 font-medium">
                {answeredInDomain}/{questions.length} Completed
              </span>
              <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#06B6D4] to-[#1E40AF] transition-all duration-500 ease-out"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600 text-lg leading-relaxed">{description}</p>
        </div>

        <div className="space-y-10">
          {questions.map((question) => (
            <RadioTileGroup
              key={question.id}
              questionNumber={question.id}
              questionText={question.text}
              options={convertOptions(question.options)}
              value={answers[question.id] ?? null}
              onChange={(value) => onAnswerChange(question.id, value)}
            />
          ))}
        </div>

        {answeredInDomain > 0 && (
          <DomainCharts
            questions={questions}
            answers={answers}
            domainId={domainId}
            domainWeight={DOMAIN_WEIGHTS[domainId as keyof typeof DOMAIN_WEIGHTS]}
            domainName={title}
          />
        )}
      </div>
    </section>
  );
}