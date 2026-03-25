import { Check } from 'lucide-react';

interface Option {
  value: number;
  label: string;
  text: string;
}

interface RadioTileGroupAgenticProps {
  questionNumber: number;
  questionText: string;
  options: Option[];
  value: number | null;
  onChange: (value: number) => void;
}

export function RadioTileGroupAgentic({
  questionNumber,
  questionText,
  options,
  value,
  onChange,
}: RadioTileGroupAgenticProps) {
  return (
    <div className="space-y-4">
      {/* Question Text - UPDATED: text-slate-900 for black text */}
      <div className="flex gap-2">
        <span className="text-sm text-indigo-600 shrink-0 font-bold">{questionNumber}.</span>
        <p className="text-sm text-slate-900 font-medium leading-relaxed">{questionText}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 ml-5">
        {options.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onChange(isSelected ? 0 : option.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 group ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-50 shadow-md shadow-indigo-100' // Selected: Light Indigo bg, Dark border
                  : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/30' // Default: White bg, Slate border
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Radio Circle */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-600'
                      : 'border-slate-300 bg-white group-hover:border-indigo-400'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Option Text */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    {/* Label (A, B, C...) */}
                    <span className={`text-sm font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-500'}`}>
                      {option.label}.
                    </span>
                    {/* Main Option Text - UPDATED: text-slate-700 for dark grey/black */}
                    <span className={`text-sm ${isSelected ? 'text-indigo-900 font-medium' : 'text-slate-700'}`}>
                      {option.text}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}