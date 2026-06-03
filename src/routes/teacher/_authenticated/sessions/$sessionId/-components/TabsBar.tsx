import React from 'react'
import { useTranslation } from 'react-i18next'
import {
    Info,
    Video,
    FileText,
    Library,
    BookOpenCheck,
    StickyNote,
    UserCheck,
    Star,
    LucideIcon,
} from 'lucide-react'
import type { SessionDetailTab } from '../../-types/types'

const TABS: { id: SessionDetailTab; icon: LucideIcon }[] = [
    { id: 'info', icon: Info },
    { id: 'meeting', icon: Video },
    { id: 'files', icon: FileText },
    { id: 'library', icon: Library },
    { id: 'homework', icon: BookOpenCheck },
    { id: 'notes', icon: StickyNote },
    { id: 'attendance', icon: UserCheck },
    { id: 'feedback', icon: Star },
]

interface TabsBarProps {
    value: SessionDetailTab
    onChange: (next: SessionDetailTab) => void
}

export const TabsBar: React.FC<TabsBarProps> = ({ value, onChange }) => {
    const { t } = useTranslation('teacher')
    return (
        <div role="tablist" aria-label={t('sessions.detail.tabs.info')} className="flex flex-wrap gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-x-auto">
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
                        {t(`sessions.detail.tabs.${id}`)}
                    </button>
                )
            })}
        </div>
    )
}
