import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { useMemo } from 'react'
import {
    SaudiRiyal,
    Users,
    Inbox,
    Bell,
    Clock,
    Video,
    MapPin,
    ChevronLeft,
    Plus,
    Calendar as CalendarIcon,
    Sparkles,
    PlayCircle,
} from 'lucide-react'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'
import { Skeleton } from '@/lib/components/Skeleton'

import { financeSummaryQueryOptions } from '../finance/-queries/financeQueries'
import { sessionsListQueryOptions } from '../sessions/-queries/sessionsQueries'
import { inboxQueryOptions } from '../requests/-queries/sessionRequestsQueries'
import { notificationsListQueryOptions } from '../notifications/-queries/notificationsQueries'

export const Route = createFileRoute('/teacher/_authenticated/dashboard')({
    component: RouteComponent,
})

function RouteComponent() {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'

    const financeQuery = useQuery(financeSummaryQueryOptions())
    const upcomingQuery = useQuery(sessionsListQueryOptions('upcoming'))
    const newRequestsQuery = useQuery(
        inboxQueryOptions('new', { search: '', teachingMode: 'all', sessionType: 'all', sort: 'newest' }),
    )
    const unreadNotificationsQuery = useQuery(notificationsListQueryOptions('unread'))

    const nextSession = upcomingQuery.data?.[0]
    const nextUpcoming = useMemo(() => (upcomingQuery.data ?? []).slice(1, 4), [upcomingQuery.data])
    const topNewRequests = useMemo(
        () => (newRequestsQuery.data?.items ?? []).slice(0, 3),
        [newRequestsQuery.data],
    )

    const nextSessionStart = nextSession ? new Date(nextSession.startsAt) : null
    const nextSessionInMs = nextSession ? new Date(nextSession.startsAt).getTime() - Date.now() : 0
    const nextSessionRelative = (() => {
        if (!nextSession) return null
        const m = Math.max(0, Math.floor(nextSessionInMs / 60_000))
        const h = Math.floor(m / 60)
        const d = Math.floor(h / 24)
        if (d > 0) return t('requests.relative.inDays', { count: d })
        if (h > 0) return t('requests.relative.inHours', { count: h })
        return t('common.durationMinutesShort', { count: m })
    })()

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            {/* Header */}
            <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {t('dashboardPage.todayLabel', {
                            date: new Date().toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                            }),
                        })}
                    </p>
                    <h1 className="text-3xl font-black text-primary dark:text-secondary mt-1">
                        {t('dashboardPage.heading')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('dashboardPage.subtitle')}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Link
                        to="/teacher/courses/new"
                        search={{} as any}
                        className="px-4 py-2.5 rounded-lg bg-secondary text-white text-sm font-bold flex items-center gap-2 hover:bg-primary transition shadow-md shadow-secondary/20"
                    >
                        <Plus size={14} />
                        {t('dashboardPage.actions.createCourse')}
                    </Link>
                    <Link
                        to="/teacher/requests"
                        className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2"
                    >
                        <Inbox size={14} />
                        {t('dashboardPage.actions.viewRequests')}
                    </Link>
                </div>
            </header>

            {/* KPI strip */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <Kpi
                    icon={<SaudiRiyal size={18} />}
                    tone="primary"
                    label={t('dashboardPage.kpi.thisMonth')}
                    value={financeQuery.data?.earningsThisMonth}
                    suffix={<SaudiRiyal size={12} className="text-slate-400" />}
                    loading={financeQuery.isLoading}
                />
                <Kpi
                    icon={<Users size={18} />}
                    tone="success"
                    label={t('dashboardPage.kpi.upcomingSessions')}
                    value={upcomingQuery.data?.length ?? 0}
                    loading={upcomingQuery.isLoading}
                />
                <Kpi
                    icon={<Inbox size={18} />}
                    tone="amber"
                    label={t('dashboardPage.kpi.newRequests')}
                    value={newRequestsQuery.data?.counts.new ?? 0}
                    loading={newRequestsQuery.isLoading}
                    actionHref="/teacher/requests"
                />
                <Kpi
                    icon={<Bell size={18} />}
                    tone="rose"
                    label={t('dashboardPage.kpi.unreadNotifications')}
                    value={unreadNotificationsQuery.data?.counts.unread ?? 0}
                    loading={unreadNotificationsQuery.isLoading}
                    actionHref="/teacher/notifications"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Next session — hero */}
                <div className="lg:col-span-8">
                    <section className="bg-gradient-to-br from-primary to-secondary text-white rounded-2xl p-5 md:p-6 shadow-lg shadow-primary/20 dark:shadow-secondary/20 relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pointer-events-none">
                            <Sparkles className="absolute top-4 end-4" size={120} />
                        </div>
                        <header className="flex items-center gap-2 text-white/80 mb-3 relative">
                            <PlayCircle size={16} />
                            <p className="text-xs font-black uppercase tracking-wider">
                                {t('dashboardPage.nextSession.label')}
                            </p>
                        </header>

                        {upcomingQuery.isLoading ? (
                            <div className="space-y-3 relative">
                                <Skeleton className="h-6 w-3/4 bg-white/20" />
                                <Skeleton className="h-4 w-1/2 bg-white/15" />
                                <div className="flex gap-2 pt-2">
                                    <Skeleton className="h-6 w-20 bg-white/15" />
                                    <Skeleton className="h-6 w-24 bg-white/15" />
                                    <Skeleton className="h-6 w-16 bg-white/15" />
                                </div>
                            </div>
                        ) : !nextSession ? (
                            <p className="text-base font-medium text-white/90 relative">
                                {t('dashboardPage.nextSession.empty')}
                            </p>
                        ) : (
                            <div className="relative space-y-4">
                                <div>
                                    <h2 className="text-xl md:text-2xl font-black leading-tight">
                                        {nextSession.sessionTitle}
                                    </h2>
                                    <p className="text-sm text-white/80 mt-1">{nextSession.courseTitle}</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <Chip>
                                        <CalendarIcon size={12} />
                                        {nextSessionStart!.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
                                            weekday: 'short',
                                            day: 'numeric',
                                            month: 'short',
                                        })}
                                    </Chip>
                                    <Chip>
                                        <Clock size={12} />
                                        {nextSessionStart!.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </Chip>
                                    <Chip>
                                        {t('common.durationMinutesShort', { count: nextSession.durationMinutes })}
                                    </Chip>
                                    <Chip>
                                        {nextSession.teachingMode === 'Online' ? <Video size={12} /> : <MapPin size={12} />}
                                        {nextSession.teachingMode === 'Online'
                                            ? t('sessions.card.teachingOnline')
                                            : t('sessions.card.teachingInPerson')}
                                    </Chip>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {nextSessionRelative && (
                                        <span className="text-sm font-bold bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20">
                                            {t('dashboardPage.nextSession.startsIn', { relative: nextSessionRelative })}
                                        </span>
                                    )}
                                    <Link
                                        to="/teacher/sessions/$sessionId"
                                        params={{ sessionId: nextSession.id }}
                                        className="ms-auto px-4 py-2 rounded-lg bg-white text-primary dark:text-secondary text-sm font-black inline-flex items-center gap-2 hover:bg-slate-50 transition"
                                    >
                                        {t('dashboardPage.nextSession.cta')}
                                        {isAr ? <ChevronLeft size={14} /> : <ChevronLeft size={14} className="rotate-180" />}
                                    </Link>
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Upcoming sessions mini-list */}
                    <section className="mt-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                {t('dashboardPage.upcoming.title')}
                            </h2>
                            <Link
                                to="/teacher/sessions"
                                className="text-xs font-bold text-primary dark:text-secondary hover:underline inline-flex items-center gap-1"
                            >
                                {t('dashboardPage.upcoming.seeAll')}
                                {isAr ? <ChevronLeft size={12} /> : <ChevronLeft size={12} className="rotate-180" />}
                            </Link>
                        </header>
                        {upcomingQuery.isLoading ? (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                {Array.from({ length: 3 }, (_, i) => (
                                    <li key={i} className="px-5 py-3 flex items-center gap-3">
                                        <Skeleton className="w-10 h-10" rounded="xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-3.5 w-2/3" />
                                            <Skeleton className="h-2.5 w-1/3" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Skeleton className="h-2.5 w-10" />
                                            <Skeleton className="h-2.5 w-12" />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : nextUpcoming.length === 0 ? (
                            <p className="py-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                                {t('dashboardPage.upcoming.empty')}
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                {nextUpcoming.map((s) => {
                                    const start = new Date(s.startsAt)
                                    return (
                                        <li key={s.id}>
                                            <Link
                                                to="/teacher/sessions/$sessionId"
                                                params={{ sessionId: s.id }}
                                                className="px-5 py-3 flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center shrink-0">
                                                    {s.teachingMode === 'Online' ? <Video size={16} /> : <MapPin size={16} />}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                        {s.sessionTitle}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                        {s.courseTitle}
                                                    </p>
                                                </div>
                                                <div className="text-end text-xs whitespace-nowrap">
                                                    <p className="font-black text-slate-700 dark:text-slate-200">
                                                        {start.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })}
                                                    </p>
                                                    <p className="text-slate-500 dark:text-slate-400">
                                                        {start.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </Link>
                                        </li>
                                    )
                                })}
                            </ul>
                        )}
                    </section>
                </div>

                {/* Right rail */}
                <aside className="lg:col-span-4 space-y-5">
                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                            <h2 className="text-base font-bold text-slate-800 dark:text-white">
                                {t('dashboardPage.newRequests.title')}
                            </h2>
                            <Link
                                to="/teacher/requests"
                                className="text-xs font-bold text-primary dark:text-secondary hover:underline inline-flex items-center gap-1"
                            >
                                {t('dashboardPage.upcoming.seeAll')}
                                {isAr ? <ChevronLeft size={12} /> : <ChevronLeft size={12} className="rotate-180" />}
                            </Link>
                        </header>
                        {newRequestsQuery.isLoading ? (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                {Array.from({ length: 3 }, (_, i) => (
                                    <li key={i} className="px-5 py-3 space-y-2">
                                        <div className="flex justify-between gap-2">
                                            <Skeleton className="h-3.5 w-2/3" />
                                            <Skeleton className="h-4 w-14" />
                                        </div>
                                        <Skeleton className="h-2.5 w-1/2" />
                                        <Skeleton className="h-2 w-1/3" />
                                    </li>
                                ))}
                            </ul>
                        ) : topNewRequests.length === 0 ? (
                            <p className="py-8 px-5 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                                {t('dashboardPage.newRequests.empty')}
                            </p>
                        ) : (
                            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                                {topNewRequests.map((r) => (
                                    <li key={r.id}>
                                        <Link
                                            to="/teacher/requests/$requestId"
                                            params={{ requestId: r.id }}
                                            className="px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition block"
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                    {isAr ? r.subjectNameAr : r.subjectNameEn}
                                                </p>
                                                <span className="text-[10px] font-bold text-primary dark:text-secondary bg-primary/10 dark:bg-secondary/15 px-2 py-0.5 rounded whitespace-nowrap">
                                                    {r.sessionsCount} {t('requests.card.sessionsLabel')}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                                {r.studentDisplayName}
                                                {r.studentGradeLabel ? ` • ${r.studentGradeLabel}` : ''}
                                            </p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
                                                {r.preferredDatesSummary}
                                            </p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-3">
                            {t('dashboardPage.quickLinks.title')}
                        </h2>
                        <div className="space-y-2">
                            <QuickLink to="/teacher/calendar" icon={<CalendarIcon size={15} />}>
                                {t('dashboardPage.quickLinks.calendar')}
                            </QuickLink>
                            <QuickLink to="/teacher/content" icon={<Sparkles size={15} />}>
                                {t('dashboardPage.quickLinks.content')}
                            </QuickLink>
                            <QuickLink to="/teacher/finance" icon={<SaudiRiyal size={15} />}>
                                {t('dashboardPage.quickLinks.finance')}
                            </QuickLink>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    )
}

// ----- small subcomponents ---------------------------------------------------

interface KpiProps {
    icon: React.ReactNode
    tone: 'primary' | 'success' | 'amber' | 'rose'
    label: string
    value: number | undefined
    suffix?: React.ReactNode
    loading?: boolean
    actionHref?: '/teacher/requests' | '/teacher/notifications'
}

const Kpi: React.FC<KpiProps> = ({ icon, tone, label, value, suffix, loading, actionHref }) => {
    const toneClass = {
        primary: 'bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary',
        success: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
        amber: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
        rose: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
    }[tone]

    const body = (
        <>
            <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneClass}`}>{icon}</div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
            </div>
            <div className="flex items-baseline gap-1">
                {loading || value === undefined ? (
                    <div className="h-7 w-16 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : (
                    <>
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                            {value.toLocaleString()}
                        </span>
                        {suffix}
                    </>
                )}
            </div>
        </>
    )

    const baseClass = 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 block hover:border-primary/40 dark:hover:border-secondary/40 transition-colors'

    if (actionHref) {
        return <Link to={actionHref} className={baseClass}>{body}</Link>
    }
    return <div className={baseClass}>{body}</div>
}

const Chip: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <span className="bg-white/10 backdrop-blur-md text-white px-2.5 py-1 rounded-md text-[11px] font-bold border border-white/20 inline-flex items-center gap-1">
        {children}
    </span>
)

interface QuickLinkProps {
    to: '/teacher/calendar' | '/teacher/content' | '/teacher/finance'
    icon: React.ReactNode
    children: React.ReactNode
}

const QuickLink: React.FC<QuickLinkProps> = ({ to, icon, children }) => {
    const locale = useLocale()
    const isAr = locale === 'ar'
    return (
        <Link
            to={to}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-primary/5 dark:hover:bg-secondary/10 border border-slate-100 dark:border-slate-800 hover:border-primary/40 dark:hover:border-secondary/40 transition group"
        >
            <span className="text-primary dark:text-secondary shrink-0">{icon}</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 flex-1">{children}</span>
            <span className="text-slate-400 dark:text-slate-500 group-hover:text-primary dark:group-hover:text-secondary transition">
                {isAr ? <ChevronLeft size={14} /> : <ChevronLeft size={14} className="rotate-180" />}
            </span>
        </Link>
    )
}
