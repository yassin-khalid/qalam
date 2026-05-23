import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { createStandardSchemaV1, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { CalendarClock, History, Layers } from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import { LOCALE_DIRECTION } from '@/lib/i18n'
import { SkeletonCard } from '@/lib/components/Skeleton'

import { SessionCard } from './-components/SessionCard'
import { sessionsListQueryOptions } from './-queries/sessionsQueries'
import type { SessionsListFilter } from './-types/types'

const searchParams = {
    // Note: distinct from the child route's `tab` param so they don't collide
    // when the user is on `/teacher/sessions/$id?tab=meeting` (the parent's
    // validator otherwise rejects the child's value as not in its enum).
    view: parseAsStringLiteral(['upcoming', 'past', 'all'] as const).withDefault('upcoming'),
}

export const Route = createFileRoute('/teacher/_authenticated/sessions')({
    component: RouteComponent,
    validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
})

const TAB_DEFS: { id: SessionsListFilter; icon: React.ComponentType<{ size?: number; className?: string }> }[] = [
    { id: 'upcoming', icon: CalendarClock },
    { id: 'past', icon: History },
    { id: 'all', icon: Layers },
]

function RouteComponent() {
    const location = useLocation()
    const isDetailPage = /\/teacher\/sessions\/[^/]+/.test(location.pathname)
    if (isDetailPage) return <Outlet />

    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const [params, setParams] = useQueryStates(searchParams)

    const view = (params.view ?? 'upcoming') as SessionsListFilter
    const listQuery = useQuery(sessionsListQueryOptions(view))

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            <header className="mb-6">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {t('sessions.list.breadcrumbDashboard')} / {t('sessions.list.breadcrumbCurrent')}
                </p>
                <h1 className="text-3xl font-black text-primary dark:text-secondary mt-1">
                    {t('sessions.list.heading')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('sessions.list.subtitle')}
                </p>
            </header>

            <div className="mb-5 flex flex-wrap gap-2">
                {TAB_DEFS.map(({ id, icon: Icon }) => {
                    const isActive = view === id
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setParams({ view: id })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isActive
                                ? 'bg-primary dark:bg-secondary text-white border-transparent shadow-md shadow-primary/20 dark:shadow-secondary/20'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-primary/40 dark:hover:border-secondary/40'
                                }`}
                        >
                            <Icon size={16} />
                            {t(`sessions.list.tabs.${id}`)}
                        </button>
                    )
                })}
            </div>

            {listQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : listQuery.isError ? (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                    {t('sessions.list.error')}
                </div>
            ) : !listQuery.data || listQuery.data.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                    {t(`sessions.list.empty.${view}`)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {listQuery.data.map((session, idx) => (
                        <SessionCard key={session.id} session={session} index={idx} />
                    ))}
                </div>
            )}
        </div>
    )
}
