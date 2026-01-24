
import React from 'react';
import { Check } from 'lucide-react';

interface ValidationItemProps {
  label: string;
  isMet: boolean;
  isActive: boolean;
}

const ValidationItem: React.FC<ValidationItemProps> = ({ label, isMet, isActive }) => {
  return (
    <div
      className={`flex items-center gap-3 transition-all duration-300 ${isMet
        ? 'text-[#00B5B5] dark:text-[#00B5B5]'
        : isActive
          ? 'text-[#003049] dark:text-slate-300'
          : 'text-slate-400 dark:text-slate-600'
        }`}
    >
      <div
        className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${isMet
          ? 'bg-[#00B5B5] border-[#00B5B5] scale-105 shadow-sm shadow-[#00B5B5]/20'
          : 'bg-transparent border-slate-200 dark:border-slate-800'
          }`}
      >
        {isMet ? (
          <Check className="w-4 h-4 text-white stroke-[3px]" />
        ) : (
          <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full" />
        )}
      </div>
      <span className={`text-sm font-medium ${isMet ? 'opacity-100' : 'opacity-80'}`}>
        {label}
      </span>
    </div>
  );
};

export default ValidationItem;
