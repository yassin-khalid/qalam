import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
    Clock,
    Calendar as CalendarIcon,
    Video,
    MapPin,
    Users as UsersIcon,
    ChevronLeft,
    PlayCircle,
} from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import type { SessionListItem, SessionStatus } from '../-types/types'

interface SessionCardProps {
    session: SessionListItem
    index: number
}

const STATUS_TONE: Record<SessionStatus, string> = {
    Scheduled: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/40',
    InProgress: 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300 border-blue-200 dark:border-blue-900/40',
    Completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40',
    Missed: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-900/40',
    Cancelled: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
}

const formatRelative = (
    iso: string,
    t: (k: string, opts?: any) => string,
): { isFuture: boolean; relative: string } => {
    const ms = new Date(iso).getTime() - Date.now()
    const future = ms > 0
    const minutes = Math.floor(Math.abs(ms) / 60_000)
    if (minutes < 60) {
        return {
            isFuture: future,
            relative: t(future ? 'requests.relative.inHours' : 'requests.relative.hoursAgo', { count: 1 }),
        }
    }
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
        return {
            isFuture: future,
            relative: t(future ? 'requests.relative.inHours' : 'requests.relative.hoursAgo', { count: hours }),
        }
    }
    const days = Math.floor(hours / 24)
    return {
        isFuture: future,
        relative: t(future ? 'requests.relative.inDays' : 'requests.relative.daysAgo', { count: days }),
    }
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, index }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'

    const start = new Date(session.startsAt)
    const dateLabel = start.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })
    const timeLabel = start.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
    })
    const { isFuture, relative } = formatRelative(session.startsAt, t)

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="p-5 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                            {t('sessions.card.sessionLabel', { number: session.sessionNumber })} • {session.sourceLabel}
                        </p>
                        <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight mt-1 truncate">
                            {session.sessionTitle}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {session.courseTitle}
                        </p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border whitespace-nowrap ${STATUS_TONE[session.status]}`}>
                        {t(`sessions.status.${session.status}`)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <StatLine icon={<CalendarIcon size={13} />}>
                        {dateLabel} • {timeLabel}
                    </StatLine>
                    <StatLine icon={<Clock size={13} />}>
                        {t('sessions.list.durationMinutes', { count: session.durationMinutes })}
                    </StatLine>
                    <StatLine icon={session.teachingMode === 'Online' ? <Video size={13} /> : <MapPin size={13} />}>
                        {session.teachingMode === 'Online' ? t('sessions.card.teachingOnline') : t('sessions.card.teachingInPerson')}
                    </StatLine>
                    <StatLine icon={<UsersIcon size={13} />}>
                        {session.sessionType === 'Individual'
                            ? t('sessions.card.individual')
                            : t('sessions.card.group', { count: session.studentsCount })}
                    </StatLine>
                </div>
            </div>

            <Link
                to="/teacher/sessions/$sessionId"
                params={{ sessionId: session.id }}
                className="bg-slate-50 dark:bg-slate-800/50 hover:bg-primary hover:text-white dark:hover:bg-secondary px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors group"
            >
                <span className="flex items-center gap-2">
                    <PlayCircle size={15} />
                    {t('sessions.list.viewDetails')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80">
                    {t(isFuture ? 'sessions.list.startsIn' : 'sessions.list.startedAgo', { relative })}
                </span>
                {isAr ? <ChevronLeft size={16} /> : <ChevronLeft size={16} className="rotate-180" />}
            </Link>
        </motion.div>
    )
}

const StatLine: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
        <span className="text-primary dark:text-secondary shrink-0">{icon}</span>
        <span className="truncate">{children}</span>
    </div>
)
