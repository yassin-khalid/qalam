
import React from 'react';
import { getRouter } from '@/router';
import { Link, LinkProps } from '@tanstack/react-router';
import { Bell, Box, Calendar, CalendarClock, ChevronLeft, ChevronRight, Grid, Inbox, Library, LucideIcon, UserRound, Wallet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/lib/hooks/useLocale';


const router = getRouter()
type Router = typeof router

interface NavItemProps {
    icon: LucideIcon;
    label: string;
    // view: ViewType;
    // Use LinkProps with our router type as the TRouter generic
    linkProps: LinkProps<'a', Router>,
    // isActive: boolean;
    // onClick: (view: ViewType) => void;
    isCollapsed: boolean;
    hasDot?: boolean;
    onClick?: () => void;

}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, linkProps, isCollapsed, hasDot, onClick }) => (
    <Link
        {...linkProps}
        onClick={onClick}
        className={`relative group w-full flex items-center transition-all duration-200 py-3 ${isCollapsed ? 'justify-center px-0' : 'px-8 gap-4'
            } `}
    >
        <Icon className='' />
        {/* text-white/70 hover:text-white group-hover:scale-110 transition-transform */}
        {!isCollapsed && <span className="text-lg font-medium whitespace-nowrap">{label}</span>}

        {hasDot && (
            <span className={`absolute ${isCollapsed ? 'top-3 end-5' : 'start-6'} w-2 h-2 bg-rose-500 rounded-full border-2 border-primary dark:border-secondary`}></span>
        )}
    </Link>
);

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
    onTitleChange: (title: string) => void;
    /**
     * Called when a nav item is clicked on a small screen — the parent
     * uses this to dismiss the off-canvas drawer.
     */
    onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, onTitleChange, onMobileClose }) => {
    const { t } = useTranslation('teacher');
    const locale = useLocale();
    const handleNavClick = (label: string) => {
        onTitleChange(label)
        onMobileClose?.()
    }
    const isRtl = locale === 'ar';
    const ExpandIcon = isRtl ? ChevronRight : ChevronLeft;
    const CollapseIcon = isRtl ? ChevronLeft : ChevronRight;
    return (
        <aside aria-label={t('dashboard.sidebar.dashboard')} className={`sidebar-transition h-screen px-1.5 flex flex-col sticky top-0 shrink-0 z-40 ${isCollapsed ? 'w-24' : 'w-80'}`}>
            <div className="bg-primary dark:bg-secondary h-full rounded-lg flex flex-col text-white shadow-2xl relative transition-colors duration-300">

                {/* Desktop-only collapse/expand toggle */}
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={isCollapsed ? t('dashboard.sidebar.expandAria') : t('dashboard.sidebar.collapseAria')}
                    aria-expanded={!isCollapsed}
                    className="hidden md:flex absolute -start-3 top-10 w-8 h-8 bg-primary dark:bg-white border border-white/20 rounded-full items-center justify-center text-white dark:text-secondary hover:scale-110 transition-transform z-50 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 focus-visible:ring-offset-primary dark:focus-visible:ring-offset-white"
                >
                    {isCollapsed ? <ExpandIcon className="w-4 h-4" /> : <CollapseIcon className="w-4 h-4" />}
                </button>

                {/* Logo Section */}
                <div className={`p-4 transition-all duration-300 mb-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    <div className={`flex items-center justify-center aspect-16/10 overflow-hidden ${isCollapsed ? 'p-2 shadow-none rounded-2xl' : 'p-4 shadow-sm rounded-4xl'}`}>
                        <div className="flex flex-col items-center">
                            <img src="/qalam-logo-dark.svg" alt="Qalam Dark Logo" className={`w-32 h-32`} />
                            {/* {!isCollapsed && <span className="text-qalam-teal text-3xl font-bold -mt-2">قلم</span>} */}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 sidebar-scroll overflow-y-auto space-y-1">
                    <NavItem isCollapsed={isCollapsed} icon={Grid} label={t('dashboard.sidebar.dashboard')} linkProps={{ to: '/teacher/dashboard', activeProps: { className: 'bg-white/20 dark:bg-white dark:text-secondary rounded-2xl text-white' } }} onClick={() => handleNavClick(t('dashboard.sidebar.dashboard'))} />
                    <NavItem isCollapsed={isCollapsed} icon={Box} label={t('dashboard.sidebar.courses')} linkProps={{ to: '/teacher/courses', activeProps: { className: 'bg-white/20 dark:bg-white dark:text-secondary rounded-2xl text-white' } }} onClick={() => handleNavClick(t('dashboard.sidebar.courses'))} />
                    <NavItem isCollapsed={isCollapsed} icon={Inbox} label={t('dashboard.sidebar.studentRequests')} linkProps={{ to: '/teacher/requests', activeProps: { className: 'bg-white/20 dark:bg-white dark:text-secondary rounded-2xl text-white' } }} hasDot onClick={() => handleNavClick(t('dashboard.sidebar.studentRequests'))} />
                    <NavItem isCollapsed={isCollapsed} icon={CalendarClock} label={t('dashboard.sidebar.sessions')} linkProps={{ to: '/teacher/sessions', activeProps: { className: 'bg-white/20 dark:bg-white dark:text-secondary rounded-2xl text-white' } }} onClick={() => handleNavClick(t('dashboard.sidebar.sessions'))} />
                    <NavItem isCollapsed={isCollapsed} icon={Calendar} label={t('dashboard.sidebar.calendar')} linkProps={{ to: '/teacher/calendar', activeProps: { className: 'bg-white/20 dark:bg-white dark:text-secondary rounded-2xl text-white' } }} onClick={() => handleNavClick(t('dashboard.sidebar.calendar'))} />
                    <NavItem isCollapsed={isCollapsed} icon={Library} label={t('dashboard.sidebar.content')} linkProps={{ to: '/teacher/content', activeProps: { className: 'bg-white/20 dark:bg-white dark:text-secondary rounded-2xl text-white' } }} onClick={() => handleNavClick(t('dashboard.sidebar.content'))} />
                    <NavItem isCollapsed={isCollapsed} icon={Wallet} label={t('dashboard.sidebar.finance')} linkProps={{ to: '/teacher/finance', activeProps: { className: 'bg-white/20 dark:bg-white dark:text-secondary rounded-2xl text-white' } }} onClick={() => handleNavClick(t('dashboard.sidebar.finance'))} />

                    <div className="my-6 border-t border-white/10 mx-6"></div>

                    <NavItem isCollapsed={isCollapsed} icon={UserRound} label={t('dashboard.sidebar.profile')} linkProps={{ to: '/teacher/profile', activeProps: { className: 'bg-white/20 dark:bg-white dark:text-secondary rounded-2xl text-white' } }} onClick={() => handleNavClick(t('dashboard.sidebar.profile'))} />
                    <NavItem isCollapsed={isCollapsed} icon={Bell} label={t('dashboard.sidebar.notifications')} linkProps={{ to: '/teacher/notifications', activeProps: { className: 'bg-white/20 dark:bg-white dark:text-secondary rounded-2xl text-white' } }} hasDot onClick={() => handleNavClick(t('dashboard.sidebar.notifications'))} />
                </nav>

                {/* User Profile */}
                <div className={`p-3 bg-white/10 dark:bg-white/5 m-3 rounded-3xl transition-all ${isCollapsed ? 'items-center' : ''}`}>
                    <div className={`flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'justify-between'} cursor-pointer group`}>
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 bg-white rounded-2xl flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/20 shadow-sm">
                                <img
                                    alt="User"
                                    className="w-full h-full object-cover"
                                    src="https://api.dicebear.com/7.x/shapes/svg?seed=A"
                                />
                            </div>
                            {!isCollapsed && (
                                <div className="flex flex-col min-w-0">
                                    <span className="text-[10px] text-white/70 whitespace-nowrap">{t('dashboard.greeting')}</span>
                                    <span className="text-sm font-bold truncate">عبدالفتاح</span>
                                </div>
                            )}
                        </div>
                        {/* {!isCollapsed && <span className="material-icons-outlined text-white/50 text-sm group-hover:translate-x-1 transition-transform">chevron_left</span>} */}
                        {!isCollapsed && <CollapseIcon className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />}
                    </div>
                </div>
            </div>
        </aside>
    );
};
