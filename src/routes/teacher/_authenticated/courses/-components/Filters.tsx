import { Search } from 'lucide-react';

// Status styles matching CourseCard - for active filter buttons
const getActiveStatusStyles = (status: number) => {
    switch (status) {
        case 1: return 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
        case 2: return 'bg-[#D1FAE5] dark:bg-emerald-950/30 text-[#065F46] dark:text-emerald-400 border-[#A7F3D0] dark:border-emerald-800/50';
        case 3: return 'bg-slate-100 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
        default: return 'bg-[#003333] dark:bg-teal-600 text-white border-transparent';
    }
};

interface CourseFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    statusFilter: number;
    onStatusFilterChange: (status: number) => void;
}

const inactiveStyles = 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-700';

export const CourseFilters = ({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusFilterChange
}: CourseFiltersProps) => {
    return (
        <div className="flex flex-row items-center gap-4">
            <div className="flex-1 relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="ابحث عن دورة بالاسم أو المادة..."
                    className="w-full bg-white dark:bg-slate-900 border border-[#00B5AD] rounded-lg py-2.5 pr-12 pl-4 focus:outline-none focus:ring-2 focus:ring-teal-500/10 transition-all text-slate-800 dark:text-slate-100 placeholder:text-slate-400 text-right text-base font-medium"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onStatusFilterChange(0)}
                    className={`px-6 py-2.5 rounded-xl font-black text-base shadow-lg transition-all border ${statusFilter === 0 ? getActiveStatusStyles(0) : inactiveStyles}`}
                >
                    الكل
                </button>
                {[
                    { id: 2, label: 'منشورة' },
                    { id: 1, label: 'مسودات' },
                    { id: 3, label: 'متوقفة' }
                ].map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onStatusFilterChange(filter.id)}
                        className={`px-6 py-2.5 rounded-xl transition-all font-bold text-base border ${statusFilter === filter.id ? getActiveStatusStyles(filter.id) : inactiveStyles}`}
                    >
                        {filter.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
