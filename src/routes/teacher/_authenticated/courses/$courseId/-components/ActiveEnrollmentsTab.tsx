import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Loader2, Users, SaudiRiyal, Calendar, CheckCircle2, PlayCircle } from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import { activeEnrollmentsQueryOptions } from '../-queries/courseDetailExtrasQueries'
import type { ActiveEnrollment, EnrollmentLifecycleStatus } from '../-types/types'

interface ActiveEnrollmentsTabProps {
    courseId: number
    onSelectEnrollment: (enrollmentId: number) => void
}

const STATUS_KEYS: Record<EnrollmentLifecycleStatus, string> = {
    Paid: 'courseDetail.active.statusPaid',
    Scheduled: 'courseDetail.active.statusScheduled',
    InProgress: 'courseDetail.active.statusInProgress',
    Completed: 'courseDetail.active.statusCompleted',
    Cancelled: 'courseDetail.active.statusCancelled',
}

const STATUS_TONE: Record<EnrollmentLifecycleStatus, string> = {
    Paid: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
    Scheduled: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
    InProgress: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
    Completed: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
    Cancelled: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
}

export const ActiveEnrollmentsTab: React.FC<ActiveEnrollmentsTabProps> = ({ courseId, onSelectEnrollment }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const query = useQuery(activeEnrollmentsQueryOptions(courseId))

    if (query.isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 flex justify-center text-slate-400">
                <Loader2 size={28} className="animate-spin" />
            </div>
        )
    }
    if (query.isError) {
        return (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                {t('courseDetail.active.error')}
            </div>
        )
    }
    const items = query.data ?? []
    if (items.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('courseDetail.active.empty')}
            </div>
        )
    }

    return (
        <ul className="space-y-3">
            {items.map((e) => (
                <EnrollmentRow
                    key={e.id}
                    enrollment={e}
                    locale={locale}
                    onView={() => onSelectEnrollment(e.id)}
                />
            ))}
        </ul>
    )
}

const EnrollmentRow: React.FC<{
    enrollment: ActiveEnrollment
    locale: string
    onView: () => void
}> = ({ enrollment, locale, onView }) => {
    const { t } = useTranslation('teacher')
    const fmt = (iso: string) =>
        new Date(iso).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        })

    return (
        <li className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center">
                    <Users size={18} />
                </div>
                <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                        {enrollment.studentName}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <Calendar size={11} />
                        {t('courseDetail.active.startEnd', { start: fmt(enrollment.startDate), end: fmt(enrollment.endDate) })}
                    </p>
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className={`px-2.5 py-1 rounded-md font-bold ${STATUS_TONE[enrollment.status]}`}>
                    {t(STATUS_KEYS[enrollment.status])}
                </span>
                <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-md font-bold text-slate-700 dark:text-slate-200">
                    {enrollment.sessionsCompleted === enrollment.sessionsTotal
                        ? <CheckCircle2 size={11} className="text-emerald-600" />
                        : <PlayCircle size={11} className="text-blue-600" />}
                    {t('courseDetail.active.progressLabel', { done: enrollment.sessionsCompleted, total: enrollment.sessionsTotal })}
                </span>
                <span className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800/40 px-2.5 py-1 rounded-md font-bold text-primary dark:text-secondary">
                    {enrollment.paidAmount}
                    <SaudiRiyal size={11} />
                </span>
                <button
                    type="button"
                    onClick={onView}
                    className="px-3 py-1.5 rounded-md text-xs font-bold bg-primary dark:bg-secondary text-white hover:opacity-85 transition"
                >
                    {t('courseDetail.active.viewSessions')}
                </button>
            </div>
        </li>
    )
}
