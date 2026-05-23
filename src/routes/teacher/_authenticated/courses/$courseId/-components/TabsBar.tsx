import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Info,
    UserPlus,
    Users,
    CalendarClock,
    Library,
    BarChart3,
    LucideIcon,
} from 'lucide-react'
import type { CourseDetailTab } from '../-types/types'

interface TabsBarProps {
    value: CourseDetailTab
    onChange: (next: CourseDetailTab) => void
}

const TABS: { id: CourseDetailTab; icon: LucideIcon }[] = [
    { id: 'overview', icon: Info },
    { id: 'requests', icon: UserPlus },
    { id: 'active', icon: Users },
    { id: 'sessions', icon: CalendarClock },
    { id: 'content', icon: Library },
    { id: 'analytics', icon: BarChart3 },
]

export const TabsBar: React.FC<TabsBarProps> = ({ value, onChange }) => {
    const { t } = useTranslation('teacher')
    return (
        <div role="tablist" aria-label={t('courseDetail.tabs.overview')} className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
            {TABS.map(({ id, icon: Icon }) => {
                const isActive = value === id
                return (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => onChange(id)}
                        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40 ${isActive
                            ? 'bg-white dark:bg-slate-800 text-primary dark:text-secondary shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                            }`}
                    >
                        <Icon size={14} />
                        {t(`courseDetail.tabs.${id}`)}
                    </button>
                )
            })}
        </div>
    )
}
