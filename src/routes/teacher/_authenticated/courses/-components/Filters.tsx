import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Status styles matching CourseCard - for active filter buttons
const getActiveStatusStyles = (status: 1 | 2 | 3 | 0) => {
    switch (status) {
        case 1: return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
        case 2: return 'bg-[#D1FAE5] dark:bg-emerald-950/30 text-[#065F46] dark:text-emerald-400 border-[#A7F3D0] dark:border-emerald-800/50';
        case 3: return 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50';
        default: return 'bg-primary dark:bg-secondary text-white border-transparent hover:bg-primary/80 dark:hover:bg-secondary/80';
    }
};

interface CourseFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: 1 | 2 | 3 | 0;
    onStatusFilterChange: (status: 1 | 2 | 3 | 0) => void;
}

const inactiveStyles = 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700';

export const CourseFilters = ({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange
}: CourseFiltersProps) => {
    const { t } = useTranslation('teacher');
    const statusOptions = [
        { id: 2 as const, label: t('courses.list.filters.published') },
        { id: 1 as const, label: t('courses.list.filters.drafts') },
        { id: 3 as const, label: t('courses.list.filters.archived') },
    ];
    return (
        <div className="flex flex-row items-center gap-4">
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder={t('courses.list.searchPlaceholder')}
                    className="w-full bg-white dark:bg-slate-900 border border-[#00B5AD] rounded-lg py-2.5 ps-12 pe-4 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-start text-base font-medium"
                />
                <Search className="absolute start-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onStatusFilterChange(0)}
                    className={`px-4 py-1.5 rounded-lg font-bold text-sm shadow-sm transition-all border ${statusFilter === 0 ? getActiveStatusStyles(0) : inactiveStyles}`}
                >
                    {t('courses.list.filters.all')}
                </button>
                {statusOptions.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onStatusFilterChange(filter.id)}
                        className={`px-4 py-1.5 rounded-lg transition-all font-semibold text-sm border ${statusFilter === filter.id ? getActiveStatusStyles(filter.id) : inactiveStyles}`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
