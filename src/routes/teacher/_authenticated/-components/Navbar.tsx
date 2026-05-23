import React from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/hooks/useTheme';
import { updateTheme } from '@/lib/utils/sessionHelpers';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/hooks/useLocale';
import LanguageToggleButton from '@/lib/components/LanguageToggleButton';
import { NotificationsDropdown } from './NotificationsDropdown';

interface NavbarProps {
    /** Open the mobile sidebar drawer. Hidden on md+. */
    onMobileMenu?: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ onMobileMenu }) => {
    const theme = useTheme()
    const isDarkMode = theme === 'dark'
    const { t } = useTranslation('teacher');
    const locale = useLocale();
    const isRtl = locale === 'ar';
    const toggleOffset = isDarkMode ? (isRtl ? -22 : 22) : 0;

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
                        <NotificationsDropdown />

                        {/* Theme Toggle */}
                        <div className="flex items-center">
                            <button
                                onClick={() => updateTheme(isDarkMode ? 'light' : 'dark')}
                                className="relative flex h-8 w-14 items-center rounded-full bg-slate-200 dark:bg-slate-700 p-1 overflow-hidden border border-slate-300/50 dark:border-slate-600 transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900"
                                aria-label={isDarkMode ? t('dashboard.navbar.toggleLightAria') : t('dashboard.navbar.toggleDarkAria')}
                            >
                                <motion.div
                                    animate={{ x: toggleOffset }}
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
                        <LanguageToggleButton className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 px-3 py-1.5 rounded-md transition-all" />
                    </div>

                    {/* End: Menu — only visible on mobile, toggles the sidebar drawer */}
                    <div className="flex items-center md:hidden">
                        <button
                            type="button"
                            onClick={onMobileMenu}
                            aria-label={t('dashboard.sidebar.expandAria')}
                            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                        >
                            <Menu size={28} strokeWidth={1.5} />
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};
