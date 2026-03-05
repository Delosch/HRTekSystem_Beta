import { Question } from '../types/assessment';
import { motion } from 'framer-motion';
import { CheckCircle, Circle } from 'lucide-react';

interface QuestionCardProps {
    question: Question;
    response: number | undefined;
    onResponse: (value: number | undefined) => void;
    questionNumber: number;
}

function ScoreBadge({ value }: { value: number }) {
    const colors: Record<number, string> = {
        0: 'bg-red-100 text-red-700 border-red-300',
        1: 'bg-orange-100 text-orange-700 border-orange-300',
        2: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        3: 'bg-blue-100 text-blue-700 border-blue-300',
        4: 'bg-green-100 text-green-700 border-green-300',
    };
    return (
        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold border ${colors[value]}`}>
            {value}
        </span>
    );
}

export function QuestionCard({ question, response, onResponse, questionNumber }: QuestionCardProps) {
    return (
        <div className="bg-white border border-slate-200 hover:border-slate-300 transition-colors rounded-xl shadow-sm">
            <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-semibold text-slate-700">
                        {questionNumber}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 text-lg">{question.question}</h4>
                    </div>
                </div>

                <div className="space-y-2 ml-12">
                    {question.options.map((option) => (
                        <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                            onClick={() => onResponse(response === option.value ? undefined : option.value)}
                            className={`
                                w-full text-left p-4 rounded-lg border-2 transition-all
                                ${response === option.value
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'}
                            `}
                        >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-0.5">
                                    {response === option.value
                                        ? <CheckCircle className="w-5 h-5 text-blue-600" />
                                        : <Circle className="w-5 h-5 text-slate-300" />
                                    }
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ScoreBadge value={option.value} />
                                        <span className="font-medium text-slate-900">{option.label}</span>
                                    </div>
                                    <p className="text-sm text-slate-600">{option.description}</p>
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}
