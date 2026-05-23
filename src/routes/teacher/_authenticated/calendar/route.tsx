import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useMemo, useState } from 'react'
import {
    ChevronLeft,
    ChevronRight,
    Loader2,
    CalendarClock,
    Clock,
    Video,
    MapPin,
    PlayCircle,
} from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import { LOCALE_DIRECTION } from '@/lib/i18n'

import { MonthGrid, computeDayKey } from './-components/MonthGrid'
import { sessionsListQueryOptions } from '../sessions/-queries/sessionsQueries'
import type { SessionListItem } from '../sessions/-types/types'

export const Route = createFileRoute('/teacher/_authenticated/calendar')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'

    const today = new Date()
    const [view, setView] = useState<{ year: number; month: number }>({
        year: today.getFullYear(),
        month: today.getMonth(),
    })
    const [selectedDayKey, setSelectedDayKey] = useState<string | null>(
        computeDayKey(today.getFullYear(), today.getMonth(), today.getDate()),
    )

    const allQuery = useQuery(sessionsListQueryOptions('all'))

    const sessionsByDayKey = useMemo(() => {
        const map = new Map<string, SessionListItem[]>()
        for (const s of allQuery.data ?? []) {
            const d = new Date(s.startsAt)
            const k = computeDayKey(d.getFullYear(), d.getMonth(), d.getDate())
            const arr = map.get(k)
            if (arr) arr.push(s)
            else map.set(k, [s])
        }
        // Sort each day's sessions by time
        for (const [, arr] of map) arr.sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
        return map
    }, [allQuery.data])

    const selectedSessions = selectedDayKey ? sessionsByDayKey.get(selectedDayKey) ?? [] : []

    const monthLabel = new Date(view.year, view.month, 1).toLocaleDateString(
        isAr ? 'ar-EG' : 'en-US',
        { month: 'long', year: 'numeric' },
    )

    const stepMonth = (delta: number) => {
        const d = new Date(view.year, view.month + delta, 1)
        setView({ year: d.getFullYear(), month: d.getMonth() })
    }

    const goToday = () => {
        const t = new Date()
        setView({ year: t.getFullYear(), month: t.getMonth() })
        setSelectedDayKey(computeDayKey(t.getFullYear(), t.getMonth(), t.getDate()))
    }

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            <header className="mb-6">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {t('calendar.breadcrumbDashboard')} / {t('calendar.breadcrumbCurrent')}
                </p>
                <h1 className="text-3xl font-black text-primary dark:text-secondary mt-1">
                    {t('calendar.heading')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('calendar.subtitle')}
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Calendar */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => stepMonth(-1)}
                                    aria-label={t('calendar.prevMonth')}
                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    {isAr ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => stepMonth(1)}
                                    aria-label={t('calendar.nextMonth')}
                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    {isAr ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={goToday}
                                    className="ms-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                                >
                                    {t('calendar.today')}
                                </button>
                            </div>
                            <h2 className="text-base font-black text-slate-800 dark:text-white">{monthLabel}</h2>
                        </div>

                        {allQuery.isLoading ? (
                            <div className="flex items-center justify-center py-20 text-slate-400">
                                <Loader2 size={28} className="animate-spin" />
                            </div>
                        ) : (
                            <MonthGrid
                                year={view.year}
                                month={view.month}
                                sessionsByDayKey={sessionsByDayKey}
                                selectedDayKey={selectedDayKey}
                                onSelect={(k) => setSelectedDayKey(k)}
                            />
                        )}
                    </div>
                </div>

                {/* Day panel */}
                <aside className="lg:col-span-4">
                    <div className="lg:sticky lg:top-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-3">
                        <header>
                            <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                                <CalendarClock size={15} className="text-primary dark:text-secondary" />
                                {selectedDayKey
                                    ? new Date(
                                        Number(selectedDayKey.split('-')[0]),
                                        Number(selectedDayKey.split('-')[1]),
                                        Number(selectedDayKey.split('-')[2]),
                                    ).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                    })
                                    : t('calendar.pickADay')}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                {selectedSessions.length === 0
                                    ? t('calendar.noSessionsThisDay')
                                    : t('calendar.sessionsCount', { count: selectedSessions.length })}
                            </p>
                        </header>

                        <ul className="space-y-2">
                            {selectedSessions.map((s) => {
                                const start = new Date(s.startsAt)
                                return (
                                    <li key={s.id}>
                                        <Link
                                            to="/teacher/sessions/$sessionId"
                                            params={{ sessionId: s.id }}
                                            className="block p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:border-primary dark:hover:border-secondary transition group"
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                        {s.sessionTitle}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                        {s.courseTitle}
                                                    </p>
                                                </div>
                                                <span className="text-[11px] font-black text-primary dark:text-secondary whitespace-nowrap">
                                                    {start.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                <span className="inline-flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {t('common.durationMinutesShort', { count: s.durationMinutes })}
                                                </span>
                                                <span className="inline-flex items-center gap-1">
                                                    {s.teachingMode === 'Online' ? <Video size={11} /> : <MapPin size={11} />}
                                                    {s.teachingMode === 'Online'
                                                        ? t('sessions.card.teachingOnline')
                                                        : t('sessions.card.teachingInPerson')}
                                                </span>
                                                <span className="ms-auto inline-flex items-center gap-1 font-bold text-primary dark:text-secondary group-hover:underline">
                                                    <PlayCircle size={11} />
                                                    {t('sessions.list.viewDetails')}
                                                </span>
                                            </div>
                                        </Link>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    )
}
