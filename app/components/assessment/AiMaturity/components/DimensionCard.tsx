import React from 'react';
import { Dimension } from '../data/diagnosticData';
import { DimensionCharts } from './DimensionCharts';
import { Zap, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

// 1. Add new props interface
interface DimensionCardProps {
  dimension: Dimension;
  answers: Record<number, number>;
  onAnswerSelect: (questionId: number, optionIndex: number) => void;
}

// 2. Accept props and remove local state
export const DimensionCard: React.FC<DimensionCardProps> = ({ dimension, answers, onAnswerSelect }) => {
  const isAIDepth = dimension.id === 6;

  // Theme Logic
  const containerClasses = isAIDepth 
    ? "bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-indigo-100 shadow-lg" 
    : "bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow";

  const headerBorder = isAIDepth ? "border-indigo-100" : "border-slate-100";
  const titleColor = isAIDepth ? "text-indigo-900" : "text-slate-900";
  const subTitleColor = isAIDepth ? "text-indigo-600" : "text-slate-500";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5 }}
      id={`dim-${dimension.id}`}
      className={`rounded-xl border overflow-hidden mb-10 ${containerClasses}`}
    >
      {/* HEADER */}
      <div className={`px-8 py-6 border-b ${headerBorder}`}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            {isAIDepth && <Zap className="w-5 h-5 text-indigo-500 animate-pulse fill-indigo-100" />}
            <span className={`text-xs font-bold uppercase tracking-wider ${subTitleColor}`}>
              {isAIDepth ? 'Intelligence Layer' : `Dimension ${dimension.id}`}
            </span>
          </div>
        </div>
        <h3 className={`text-2xl font-bold ${titleColor}`}>
          {dimension.title.replace(/Dimension \d+: /, '')}
        </h3>
      </div>

      {/* BODY */}
      <div className="p-8">
        <div className="space-y-10">
          {dimension.questions.map((q) => (
            <div key={q.id} className="space-y-4">
              <p className="text-base font-semibold text-slate-800 leading-relaxed">
                {q.text}
              </p>
              
              {/* Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                {q.options.map((opt, idx) => {
                  const isSelected = answers[q.id] === idx;
                  
                  const tileBase = "relative flex flex-col justify-center px-4 py-3 rounded-lg border-2 cursor-pointer transition-all duration-200 min-h-[80px]";
                  const tileState = isSelected
                    ? "border-indigo-500 bg-indigo-50 shadow-sm"
                    : "border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white";

                  return (
                    <div 
                      key={idx}
                      onClick={() => onAnswerSelect(q.id, idx)}
                      className={clsx(tileBase, tileState)}
                    >
                      <div className="flex items-start gap-3 mb-1">
                        <div className={clsx(
                          "h-4 w-4 rounded-full border flex-shrink-0 flex items-center justify-center transition-colors mt-0.5",
                          isSelected ? "border-indigo-500 bg-indigo-500" : "border-slate-300 bg-white"
                        )}>
                          {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <span className={clsx(
                          "text-xs font-bold",
                          isSelected ? "text-indigo-700" : "text-slate-400"
                        )}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                      </div>
                      <span className={clsx(
                        "text-xs font-medium leading-snug ml-7",
                        isSelected ? "text-indigo-900" : "text-slate-600"
                      )}>
                        {opt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* CHARTS SECTION */}
        {Object.keys(answers).some(k => dimension.questions.find(q => q.id === parseInt(k))) && (
           <DimensionCharts 
             questions={dimension.questions} 
             answers={answers} 
           />
        )}
      </div>
    </motion.div>
  );
};
