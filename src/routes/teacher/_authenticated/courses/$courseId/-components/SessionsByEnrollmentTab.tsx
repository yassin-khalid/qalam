import React from 'react'
import { useTranslation } from 'react-i18next'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Loader2, CalendarDays, Clock, PlayCircle, ChevronLeft } from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import {
    activeEnrollmentsQueryOptions,
    enrollmentSessionsQueryOptions,
} from '../-queries/courseDetailExtrasQueries'

interface SessionsByEnrollmentTabProps {
    courseId: number
    selectedEnrollmentId: number | null
    onSelectEnrollment: (id: number) => void
}

export const SessionsByEnrollmentTab: React.FC<SessionsByEnrollmentTabProps> = ({
    courseId,
    selectedEnrollmentId,
    onSelectEnrollment,
}) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'

    const enrollmentsQuery = useQuery(activeEnrollmentsQueryOptions(courseId))
    const sessionsQuery = useQuery(
        enrollmentSessionsQueryOptions(selectedEnrollmentId ?? 0, selectedEnrollmentId !== null),
    )

    const selected = enrollmentsQuery.data?.find((e) => e.id === selectedEnrollmentId)

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Enrollment list */}
            <aside className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-3">
                <header className="px-2 py-2">
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">
                        {t('courseDetail.sessions.enrollmentsTitle')}
                    </h3>
                </header>
                {enrollmentsQuery.isLoading ? (
                    <div className="flex justify-center py-10 text-slate-400">
                        <Loader2 size={24} className="animate-spin" />
                    </div>
                ) : (
                    <ul className="space-y-1">
                        {(enrollmentsQuery.data ?? []).map((e) => {
                            const isActive = e.id === selectedEnrollmentId
                            return (
                                <li key={e.id}>
                                    <button
                                        type="button"
                                        onClick={() => onSelectEnrollment(e.id)}
                                        className={`w-full text-start px-3 py-2.5 rounded-xl text-sm transition ${isActive
                                            ? 'bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary font-bold'
                                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                                            }`}
                                    >
                                        <p className="font-bold truncate">{e.studentName}</p>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            {t('courseDetail.active.progressLabel', { done: e.sessionsCompleted, total: e.sessionsTotal })}
                                        </p>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </aside>

            {/* Sessions panel */}
            <section className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                {selectedEnrollmentId === null ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center py-10">
                        {t('courseDetail.sessions.empty')}
                    </p>
                ) : sessionsQuery.isLoading ? (
                    <div className="flex justify-center py-10 text-slate-400">
                        <Loader2 size={24} className="animate-spin" />
                    </div>
                ) : sessionsQuery.data && sessionsQuery.data.length > 0 ? (
                    <>
                        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                            {t('courseDetail.sessions.sessionsTitle', { name: selected?.studentName ?? '' })}
                        </h3>
                        <ul className="space-y-2">
                            {sessionsQuery.data.map((s) => (
                                <li
                                    key={s.sessionId}
                                    className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                                >
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center shrink-0">
                                            <PlayCircle size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                {t('sessions.card.sessionLabel', { number: s.sessionNumber })} — {s.sessionTitle}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                                <CalendarDays size={11} />
                                                {new Date(s.startsAt).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}
                                                <Clock size={11} className="ms-1" />
                                                {t('sessions.list.durationMinutes', { count: s.durationMinutes })}
                                                <span className="ms-2 font-bold text-primary dark:text-secondary">
                                                    {t(`sessions.status.${s.status}`)}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/teacher/sessions/$sessionId"
                                        params={{ sessionId: s.sessionId }}
                                        className="px-3 py-1.5 rounded-md text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 shrink-0"
                                    >
                                        {t('courseDetail.sessions.openSession')}
                                        {isAr ? <ChevronLeft size={12} /> : <ChevronLeft size={12} className="rotate-180" />}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </>
                ) : (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center py-10">
                        {t('courseDetail.sessions.emptyEnrollment')}
                    </p>
                )}
            </section>
        </div>
    )
}
