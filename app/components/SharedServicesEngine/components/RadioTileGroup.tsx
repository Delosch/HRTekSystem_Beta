import { Check } from 'lucide-react';

interface Option {
  value: number;
  label: string;
  text: string;
}

interface RadioTileGroupProps {
  questionNumber: number;
  questionText: string;
  options: Option[];
  value: number | null;
  onChange: (value: number) => void;
}

export function RadioTileGroup({
  questionNumber,
  questionText,
  options,
  value,
  onChange,
}: RadioTileGroupProps) {
  return (
    <div className="space-y-4">
      {/* Question Text */}
      <div className="flex gap-2">
        <span className="text-sm text-[#06B6D4] shrink-0">{questionNumber}.</span>
        <p className="text-sm text-gray-900">{questionText}</p>
      </div>

      {/* Options */}
      <div className="space-y-2 ml-5">
        {options.map((option) => {
          const isSelected = value === option.value;
          
          return (
            <button
              key={option.value}
              onClick={() => onChange(isSelected ? 0 : option.value)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-[#06B6D4] bg-gradient-to-r from-[#06B6D4]/5 to-[#1E40AF]/5 shadow-sm'
                  : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-sm'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Radio Circle */}
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    isSelected
                      ? 'border-[#06B6D4] bg-[#06B6D4]'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Option Text */}
                <div className="flex-1">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-sm ${isSelected ? 'text-[#1E40AF]' : 'text-gray-500'}`}>
                      {option.label}.
                    </span>
                    <span className={`text-sm ${isSelected ? 'text-gray-900' : 'text-gray-700'}`}>
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