import React from 'react';
import { DomainOption } from '../types/types';

interface DomainCardProps {
    option: DomainOption;
    isSelected: boolean;
    onSelect: (id: number) => void;
}

const DomainCard: React.FC<DomainCardProps> = ({ option, isSelected, onSelect }) => {
    return (
        <button
            onClick={() => onSelect(option.id)}
            className={`relative flex items-center justify-between p-6 bg-white dark:bg-slate-800/50 rounded-2xl border-2 transition-all duration-300 w-full hover:shadow-lg ${isSelected
                ? 'border-secondary ring-2 ring-secondary/20 dark:bg-secondary/10 dark:border-secondary'
                : 'border-gray-100 dark:border-slate-700'
                }`}
        >
            <div className="flex items-center gap-4">
                <span className="text-3xl" role="img" aria-label={option.title}>
                    {option.icon}
                </span>
                <span className="text-xl font-bold text-primary dark:text-slate-100">{option.title}</span>
            </div>

            {isSelected && (
                <div className="absolute top-4 right-4 bg-secondary text-white rounded-full w-6 h-6 flex items-center justify-center shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}
        </button>
    );
};

export default DomainCard;
