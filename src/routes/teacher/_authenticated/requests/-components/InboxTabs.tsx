import React from 'react'
import { useTranslation } from 'react-i18next'
import { Inbox, Send, MessagesSquare, CheckCircle2, XCircle } from 'lucide-react'
import type { InboxCounts, RequestInboxTab } from '../-types/types'

interface InboxTabsProps {
    value: RequestInboxTab
    counts: InboxCounts | undefined
    onChange: (tab: RequestInboxTab) => void
}

const TAB_ORDER: { id: RequestInboxTab; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'new', icon: Inbox },
    { id: 'active', icon: Send },
    { id: 'negotiating', icon: MessagesSquare },
    { id: 'accepted', icon: CheckCircle2 },
    { id: 'rejected', icon: XCircle },
]

export const InboxTabs: React.FC<InboxTabsProps> = ({ value, counts, onChange }) => {
    const { t } = useTranslation('teacher')
    return (
        <div role="tablist" aria-label={t('requests.inbox.heading')} className="flex flex-wrap gap-2">
            {TAB_ORDER.map(({ id, icon: Icon }) => {
                const isActive = value === id
                const count = counts?.[id]
                return (
                    <button
                        key={id}
                        type="button"
                        role="tab"
                        aria-selected={isActive}
                        aria-current={isActive ? 'page' : undefined}
                        onClick={() => onChange(id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40 ${isActive
                            ? 'bg-primary dark:bg-secondary text-white border-transparent shadow-md shadow-primary/20 dark:shadow-secondary/20'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-primary/40 dark:hover:border-secondary/40'
                            }`}
                    >
                        <Icon size={16} />
                        <span>{t(`requests.inbox.tabs.${id}`)}</span>
                        {count !== undefined && (
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-black ${isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}>
                                {count}
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
