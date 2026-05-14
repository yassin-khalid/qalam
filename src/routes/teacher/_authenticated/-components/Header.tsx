
import ThemeToggleButton from '@/lib/components/ThemeToggleButton';
import { useLocale } from '@/lib/hooks/useLocale';
import { Plus } from 'lucide-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    const { t } = useTranslation('teacher');
    const locale = useLocale();
    const today = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    return (
        <header className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-6">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white">{title}</h1>
                <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-secondary text-white rounded-2xl font-bold shadow-lg shadow-secondary/20 hover:brightness-110 transition-all">
                    <Plus className="w-6 h-6" />
                    {t('dashboard.addNew')}
                </button>
            </div>

            <div className="flex items-center gap-4">
                <ThemeToggleButton className="w-12 h-12 flex items-center justify-center bg-white dark:bg-secondary shadow-sm rounded-2xl border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" />

                <div className="px-5 py-3 bg-white dark:bg-secondary rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 font-medium">
                    {t('dashboard.todayPrefix')} {today}
                </div>
            </div>
        </header>
    );
};
