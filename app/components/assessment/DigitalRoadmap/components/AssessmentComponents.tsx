import React from 'react';

interface SectionHeaderProps {
  title: string;
  description: string;
  number: number;
}

export function SectionHeader({ title, description, number }: SectionHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-300 shadow-sm p-8 mb-8 bg-white overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-500 -mx-8 -mt-8 mb-6" />
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-600 text-white font-bold text-lg">
          {number}
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">{title}</h2>
      </div>
      <p className="text-slate-600 text-sm border-l-4 border-indigo-200 pl-4 py-2 bg-indigo-50/50 rounded-r">
        {description}
      </p>
    </div>
  );
}

interface QuestionCardProps {
  children: React.ReactNode;
  className?: string;
}

export function QuestionCard({ children, className = '' }: QuestionCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm hover:shadow-md border border-slate-300 p-6 mb-6 transition-shadow ${className}`}>
      {children}
    </div>
  );
}

interface QuestionTitleProps {
  children: React.ReactNode;
  helper?: string;
}

export function QuestionTitle({ children, helper }: QuestionTitleProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{children}</h3>
      {helper && <p className="text-sm text-slate-500">{helper}</p>}
    </div>
  );
}

interface SelectableCardProps {
  label: string;
  icon?: React.ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export function SelectableCard({ label, icon, selected, onClick, disabled }: SelectableCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative p-4 rounded-xl border-2 transition-all text-left ${
        selected
          ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-100'
          : 'border-slate-100 bg-slate-50 hover:border-indigo-200 hover:bg-white hover:shadow-sm'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {icon && <div className="mb-2 text-indigo-600">{icon}</div>}
      <p className="font-medium text-slate-900 text-sm">{label}</p>
      {selected && (
        <div className="absolute top-2 right-2 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </button>
  );
}
