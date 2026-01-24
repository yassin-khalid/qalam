
import ThemeToggleButton from '@/lib/components/ThemeToggleButton';
import { Moon, Plus, Sun } from 'lucide-react';
import React from 'react';

interface HeaderProps {
    title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
    const toggleDarkMode = () => {
        document.documentElement.classList.toggle('dark');
    };

    const today = new Intl.DateTimeFormat('ar-SA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    return (
        <header className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-6">
                <h1 className="text-4xl font-bold text-slate-800 dark:text-white">{title}</h1>
                <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-qalam-teal/20 hover:brightness-110 transition-all">
                    <Plus className="w-6 h-6" />
                    إضافة جديد
                </button>
            </div>

            <div className="flex items-center gap-4">
                {/* <button
                    onClick={toggleDarkMode}
                    className="w-12 h-12 flex items-center justify-center bg-white dark:bg-qalam-navy-dark shadow-sm rounded-2xl border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                    <Moon className="w-6 h-6 dark:hidden" />
                    <Sun className="w-6 h-6 hidden dark:block" />
                </button> */}
                <ThemeToggleButton className="w-12 h-12 flex items-center justify-center bg-white dark:bg-primary shadow-sm rounded-2xl border border-slate-100 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors" />

                <div className="px-5 py-3 bg-white dark:bg-primary rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 font-medium">
                    اليوم: {today}
                </div>
            </div>
        </header>
    );
};
