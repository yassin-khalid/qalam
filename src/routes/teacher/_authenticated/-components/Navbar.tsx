import React, { useState } from 'react';
import { Bell, Globe, Menu, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/hooks/useTheme';
import { updateTheme } from '@/lib/utils/sessionHelpers';

export const Navbar: React.FC = () => {
    const theme = useTheme()
    const isDarkMode = theme === 'dark'

    const [hasNotification, setHasNotification] = useState(true);

    return (
        <nav className="sticky top-0 z-40 shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 transition-colors">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex flex-row-reverse justify-between items-center h-14">
                    {/* Start: Logo and Controls */}
                    <div className="flex items-center gap-4 sm:gap-6">
                        {/* Logo */}
                        <div className="relative flex items-center justify-center w-9 h-9 rounded-full border-2 border-[#FFC107] bg-white dark:bg-slate-800 shadow-sm shrink-0">
                            <span className="text-lg font-black text-black dark:text-white -translate-y-px">A</span>
                        </div>

                        {/* Notification */}
                        <button
                            className="relative p-2 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-all"
                            onClick={() => setHasNotification(false)}
                        >
                            <Bell size={20} strokeWidth={2} />
                            {hasNotification && (
                                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
                            )}
                        </button>

                        {/* Theme Toggle */}
                        <div className="flex items-center">
                            <button
                                onClick={() => updateTheme(isDarkMode ? 'light' : 'dark')}
                                className="relative flex h-8 w-14 items-center rounded-full bg-slate-200 dark:bg-slate-700 p-1 overflow-hidden border border-slate-300/50 dark:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                                aria-label={isDarkMode ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
                            >
                                <motion.div
                                    animate={{ x: isDarkMode ? -22 : 0 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border border-slate-200/80 dark:border-slate-500/50"
                                >
                                    {isDarkMode ? (
                                        <Moon size={12} fill="currentColor" className="text-amber-500" />
                                    ) : (
                                        <Sun size={12} fill="currentColor" className="text-amber-500" />
                                    )}
                                </motion.div>
                            </button>
                        </div>

                        {/* Language Selector */}
                        <button className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 px-2 py-1 rounded-md transition-all">
                            <Globe size={20} strokeWidth={2} />
                            <span className="text-sm font-semibold tracking-wide">EN</span>
                        </button>
                    </div>

                    {/* End: Menu */}
                    <div className="flex items-center">
                        <button className="p-2 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all">
                            <Menu size={28} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
