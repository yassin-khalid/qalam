
import React from 'react';
// import { ViewType } from '../types';
import { getRouter } from '@/router';
import { Link, LinkProps } from '@tanstack/react-router';
import QalamLogo from '@/lib/components/QalamLogo';
import { BarChart, Bell, Box, Calendar, ChevronLeft, ChevronRight, Grid, HelpCircle, LucideIcon, Settings, Truck } from 'lucide-react';


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
        <Icon className='text-white/70 hover:text-white group-hover:scale-110 transition-transform' />

        {!isCollapsed && <span className="text-lg font-medium whitespace-nowrap">{label}</span>}

        {hasDot && (
            <span className={`absolute ${isCollapsed ? 'top-3 right-5' : 'left-6'} w-2 h-2 bg-rose-500 rounded-full border-2 border-qalam-teal dark:border-qalam-navy-dark`}></span>
        )}
    </Link>
);

interface SidebarProps {
    // currentView: ViewType;
    // onViewChange: (view: ViewType) => void;
    isCollapsed: boolean;
    onToggle: () => void;
    onTitleChange: (title: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle, onTitleChange }) => {
    return (
        <aside className={`sidebar-transition h-screen p-4 flex flex-col sticky top-0 shrink-0 z-40 ${isCollapsed ? 'w-24' : 'w-80'}`}>
            <div className="bg-secondary dark:bg-primary h-full rounded-[2.5rem] flex flex-col text-white shadow-2xl relative transition-colors duration-300">

                {/* Toggle Button */}
                <button
                    onClick={onToggle}
                    className="absolute -left-3 top-10 w-8 h-8 bg-qalam-teal dark:bg-primary border border-white/20 rounded-full flex items-center justify-center text-white hover:scale-110 transition-transform z-50 shadow-md"
                >
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                </button>

                {/* Logo Section */}
                <div className={`p-4 transition-all duration-300 mb-4 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                    <div className="rounded-4xl p-4 flex items-center justify-center aspect-16/10 overflow-hidden shadow-sm">
                        <div className="flex flex-col items-center">
                            <QalamLogo
                                className={`w-32 h-32`}
                            />
                            {/* {!isCollapsed && <span className="text-qalam-teal text-3xl font-bold -mt-2">قلم</span>} */}
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 py-2 sidebar-scroll overflow-y-auto space-y-1">
                    <NavItem isCollapsed={isCollapsed} icon={Grid} label="لوحة التحكم" linkProps={{ to: '/teacher', activeProps: { className: 'bg-white/20 dark:bg-white/10 rounded-2xl text-white' } }} onClick={() => onTitleChange('لوحة التحكم')} />
                    <NavItem isCollapsed={isCollapsed} icon={Box} label="المنتجات" linkProps={{ to: '/teacher/products', activeProps: { className: 'bg-white/20 dark:bg-white/10 rounded-2xl text-white' } }} onClick={() => onTitleChange('المنتجات')} />
                    <NavItem isCollapsed={isCollapsed} icon={Calendar} label="التقويم" linkProps={{ to: '/teacher/calendar', activeProps: { className: 'bg-white/20 dark:bg-white/10 rounded-2xl text-white' } }} onClick={() => onTitleChange('التقويم')} />
                    <NavItem isCollapsed={isCollapsed} icon={Truck} label="الموردون" linkProps={{ to: '/teacher/suppliers', activeProps: { className: 'bg-white/20 dark:bg-white/10 rounded-2xl text-white' } }} onClick={() => onTitleChange('الموردون')} />
                    <NavItem isCollapsed={isCollapsed} icon={BarChart} label="التقارير" linkProps={{ to: '/teacher/reports', activeProps: { className: 'bg-white/20 dark:bg-white/10 rounded-2xl text-white' } }} onClick={() => onTitleChange('التقارير')} />

                    <div className="my-6 border-t border-white/10 mx-6"></div>

                    <NavItem isCollapsed={isCollapsed} icon={Bell} label="الإشعارات" linkProps={{ to: '/teacher/notifications', activeProps: { className: 'bg-white/20 dark:bg-white/10 rounded-2xl text-white' } }} hasDot onClick={() => onTitleChange('الإشعارات')} />
                    <NavItem isCollapsed={isCollapsed} icon={Settings} label="الإعدادات" linkProps={{ to: '/teacher/settings', activeProps: { className: 'bg-white/20 dark:bg-white/10 rounded-2xl text-white' } }} onClick={() => onTitleChange('الإعدادات')} />
                    <NavItem isCollapsed={isCollapsed} icon={HelpCircle} label="الدعم" linkProps={{ to: '/teacher/support', activeProps: { className: 'bg-white/20 dark:bg-white/10 rounded-2xl text-white' } }} onClick={() => onTitleChange('الدعم')} />
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
                                    <span className="text-[10px] text-white/70 whitespace-nowrap">مرحبًا بعودتك 👋</span>
                                    <span className="text-sm font-bold truncate">عبدالفتاح</span>
                                </div>
                            )}
                        </div>
                        {/* {!isCollapsed && <span className="material-icons-outlined text-white/50 text-sm group-hover:translate-x-1 transition-transform">chevron_left</span>} */}
                        {!isCollapsed && <ChevronLeft className="w-4 h-4 text-white/50 group-hover:translate-x-1 transition-transform" />}
                    </div>
                </div>
            </div>
        </aside>
    );
};
