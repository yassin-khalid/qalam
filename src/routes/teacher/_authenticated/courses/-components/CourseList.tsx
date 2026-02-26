import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ApiResponse } from '../-types/types';
import { CourseCard } from './CourseCard';

interface CourseListProps {
    isLoading: boolean;
    apiData: ApiResponse | null;
    pageNumber: number;
    onPageChange: (page: number) => void;
}

export const CourseList = ({ isLoading, apiData, pageNumber, onPageChange }: CourseListProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-[500px] bg-slate-100 dark:bg-slate-800 animate-pulse rounded-3xl" />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-w-0">
                {apiData?.items.map((course, index) => (
                    <CourseCard key={course.id} course={course} index={index} />
                ))}
            </div>

            {/* Pagination */}
            {apiData && apiData.totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-10">
                    <button
                        disabled={!apiData.hasPreviousPage}
                        onClick={() => onPageChange(pageNumber - 1)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        <ChevronRight size={24} />
                    </button>

                    <div className="flex gap-2">
                        {Array.from({ length: apiData.totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => onPageChange(i + 1)}
                                className={`w-12 h-12 rounded-xl font-bold text-lg transition-all ${pageNumber === i + 1 ? 'bg-[#003333] dark:bg-teal-600 text-white shadow-lg' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>

                    <button
                        disabled={!apiData.hasNextPage}
                        onClick={() => onPageChange(pageNumber + 1)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                        <ChevronLeft size={24} />
                    </button>
                </div>
            )}
        </div>
    );
};
