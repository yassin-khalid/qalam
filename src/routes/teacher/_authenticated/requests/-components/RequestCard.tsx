import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import {
    Users as UsersIcon,
    Clock,
    Calendar as CalendarIcon,
    Paperclip,
    Video,
    MapPin,
    ChevronLeft,
    Eye,
    Sparkles,
    Inbox as InboxIcon,
    UserRoundCheck,
    Megaphone,
} from 'lucide-react'
import type {
    RequestInboxTab,
    SessionRequestListItem,
} from '../-types/types'
import { useLocale } from '@/lib/hooks/useLocale'

interface RequestCardProps {
    request: SessionRequestListItem
    index: number
}

const formatRelative = (
    iso: string,
    t: (k: string, opts?: any) => string,
    future: boolean,
): string => {
    const ms = future ? new Date(iso).getTime() - Date.now() : Date.now() - new Date(iso).getTime()
    if (ms < 60_000) return t('requests.relative.now')
    const minutes = Math.floor(Math.abs(ms) / 60_000)
    const hours = Math.floor(minutes / 60)
    if (hours < 24) {
        return t(future ? 'requests.relative.inHours' : 'requests.relative.hoursAgo', { count: Math.max(1, hours) })
    }
    const days = Math.floor(hours / 24)
    return t(future ? 'requests.relative.inDays' : 'requests.relative.daysAgo', { count: days })
}

const Stat: React.FC<{ icon: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
        <span className="text-primary dark:text-secondary shrink-0">{icon}</span>
        <span className="truncate">{children}</span>
    </div>
)

export const RequestCard: React.FC<RequestCardProps> = ({ request, index }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'

    const offersCountKey =
        request.offersCount === 0 ? 'requests.card.offersCount_zero'
            : request.offersCount === 1 ? 'requests.card.offersCount_one'
                : 'requests.card.offersCount_other'

    // Badge reflects the teacher's target status on the request (Notified /
    // Viewed / OfferSubmitted), independent of which tab is active.
    const statusBadge: { label: string; tone: 'amber' | 'teal' | 'rose' | 'slate' } | null = (() => {
        switch (request.targetStatus) {
            case 'Notified': return { label: t('requests.card.statusNotified'), tone: 'amber' }
            case 'Viewed': return { label: t('requests.card.statusViewed'), tone: 'slate' }
            case 'OfferSubmitted': return { label: t('requests.card.statusOfferSubmitted'), tone: 'teal' }
            default: return null
        }
    })()

    const toneClasses: Record<string, string> = {
        amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/40',
        teal: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40',
        rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-900/40',
        slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    }

    const isDirected = request.requestKind === 'Directed'

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            className={`bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden flex flex-col h-full shadow-sm hover:shadow-md transition-shadow ${isDirected
                ? 'border-primary/40 dark:border-secondary/40 ring-1 ring-primary/15 dark:ring-secondary/20'
                : 'border-slate-100 dark:border-slate-800'
                }`}
        >
            {/* Request-kind banner: Directed requests are visually prioritised. */}
            <div
                className={`flex items-center gap-1.5 px-5 py-1.5 text-[11px] font-bold border-b ${isDirected
                    ? 'bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary border-primary/15 dark:border-secondary/20'
                    : 'bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800'
                    }`}
            >
                {isDirected ? <UserRoundCheck size={13} /> : <Megaphone size={13} />}
                {t(isDirected ? 'requests.card.kindDirected' : 'requests.card.kindPublished')}
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 dark:bg-secondary/15 flex items-center justify-center text-primary dark:text-secondary text-base font-black shrink-0">
                            {(isAr ? request.subjectNameAr : request.subjectNameEn).slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight truncate">
                                {isAr ? request.subjectNameAr : request.subjectNameEn}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {request.studentDisplayName}
                                {request.studentGradeLabel ? ` • ${request.studentGradeLabel}` : ''}
                            </p>
                        </div>
                    </div>
                    {statusBadge && (
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold border whitespace-nowrap ${toneClasses[statusBadge.tone]}`}>
                            {statusBadge.label}
                        </span>
                    )}
                </div>

                {request.unitNames.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {request.unitNames.slice(0, 3).map((u) => (
                            <span key={u} className="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-[11px] font-bold">
                                {u}
                            </span>
                        ))}
                        {request.unitNames.length > 3 && (
                            <span className="bg-slate-50 dark:bg-slate-800 text-slate-400 px-2.5 py-1 rounded-md text-[11px] font-bold">
                                +{request.unitNames.length - 3}
                            </span>
                        )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-2 text-xs">
                    <Stat icon={<Clock size={13} />}>
                        {request.sessionsCount} {t('requests.card.sessionsLabel')} • {t('requests.card.totalDuration', { count: request.totalMinutes })}
                    </Stat>
                    <Stat icon={request.teachingMode === 'Online' ? <Video size={13} /> : <MapPin size={13} />}>
                        {request.teachingMode === 'Online' ? t('requests.card.teachingOnline') : t('requests.card.teachingInPerson')}
                    </Stat>
                    <Stat icon={<UsersIcon size={13} />}>
                        {request.sessionType === 'Individual'
                            ? t('requests.card.participantsSingle')
                            : t('requests.card.participantsGroup', { count: request.participantsCount })}
                    </Stat>
                    <Stat icon={<CalendarIcon size={13} />}>
                        {request.preferredDatesSummary}
                    </Stat>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                    <div className="flex items-center gap-2">
                        <Sparkles size={13} className="text-amber-500" />
                        <span className="font-bold">{t(offersCountKey, { count: request.offersCount })}</span>
                    </div>
                    {request.attachmentsCount > 0 && (
                        <span className="flex items-center gap-1 font-medium">
                            <Paperclip size={13} />
                            {request.attachmentsCount}
                        </span>
                    )}
                </div>
            </div>

            <Link
                to="/teacher/requests/$requestId"
                params={{ requestId: request.id }}
                className="bg-slate-50 dark:bg-slate-800/50 hover:bg-primary hover:text-white dark:hover:bg-secondary px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-sm font-bold text-slate-700 dark:text-slate-200 transition-colors group"
            >
                <span className="flex items-center gap-2">
                    <Eye size={15} />
                    {t('requests.card.viewDetails')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 group-hover:text-white/80">
                    {t('requests.card.expiresIn', { relative: formatRelative(request.expiresAt, t, true) })}
                </span>
                {isAr ? <ChevronLeft size={16} /> : <ChevronLeft size={16} className="rotate-180" />}
            </Link>
        </motion.div>
    )
}

export const EmptyInbox: React.FC<{ tab: RequestInboxTab }> = ({ tab }) => {
    const { t } = useTranslation('teacher')
    return (
        <div className="col-span-full bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
            <InboxIcon className="mx-auto mb-3 text-slate-300 dark:text-slate-700" size={56} />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {t(`requests.inbox.empty.${tab}`)}
            </p>
        </div>
    )
}
