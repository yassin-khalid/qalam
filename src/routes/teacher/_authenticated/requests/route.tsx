import { createFileRoute, Outlet, useLocation } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { createStandardSchemaV1, parseAsString, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { useLocale } from '@/lib/hooks/useLocale'
import { LOCALE_DIRECTION } from '@/lib/i18n'
import { SkeletonCard } from '@/lib/components/Skeleton'

import { InboxTabs } from './-components/InboxTabs'
import { InboxFiltersBar } from './-components/InboxFiltersBar'
import { EmptyInbox, RequestCard } from './-components/RequestCard'
import { inboxQueryOptions } from './-queries/sessionRequestsQueries'
import type { InboxFilters, RequestInboxTab } from './-types/types'

// IMPORTANT: a parent route's `validateSearch` validates ALL descendant routes'
// search params too. If a child route ever needs its own `?tab=` query param,
// it MUST use a different key (see sessions/route.tsx which uses `view` for
// this reason). Do not narrow these enums to new values that a child route
// might want to set independently.
const searchParams = {
    tab: parseAsStringLiteral(['new', 'active', 'negotiating', 'accepted', 'rejected'] as const).withDefault('new'),
    search: parseAsString.withDefault(''),
    mode: parseAsStringLiteral(['all', 'Online', 'InPerson'] as const).withDefault('all'),
    type: parseAsStringLiteral(['all', 'Individual', 'Group'] as const).withDefault('all'),
    sort: parseAsStringLiteral(['newest', 'urgent', 'fewest-offers'] as const).withDefault('newest'),
}

export const Route = createFileRoute('/teacher/_authenticated/requests')({
    component: RouteComponent,
    validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
})

function RouteComponent() {
    const location = useLocation()
    const isDetailPage = /\/teacher\/requests\/[^/]+/.test(location.pathname)
    if (isDetailPage) return <Outlet />

    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const [params, setParams] = useQueryStates(searchParams)

    const filters: InboxFilters = {
        search: params.search ?? '',
        teachingMode: (params.mode ?? 'all') as InboxFilters['teachingMode'],
        sessionType: (params.type ?? 'all') as InboxFilters['sessionType'],
        sort: (params.sort ?? 'newest') as InboxFilters['sort'],
    }
    const tab = (params.tab ?? 'new') as RequestInboxTab

    const inboxQuery = useQuery(inboxQueryOptions(tab, filters))

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {t('requests.inbox.breadcrumbDashboard')} / {t('requests.inbox.breadcrumbCurrent')}
                    </p>
                    <h1 className="text-3xl font-black text-primary dark:text-secondary mt-1">
                        {t('requests.inbox.heading')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('requests.inbox.subtitle')}
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-4">
                <InboxTabs
                    value={tab}
                    counts={inboxQuery.data?.counts}
                    onChange={(next) => setParams({ tab: next })}
                />
            </div>

            {/* Filters */}
            <div className="mb-5">
                <InboxFiltersBar
                    filters={filters}
                    onChange={(next) =>
                        setParams({
                            search: next.search as any,
                            mode: next.teachingMode as any,
                            type: next.sessionType as any,
                            sort: next.sort,
                        })
                    }
                />
            </div>

            {/* Body */}
            {inboxQuery.isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }, (_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : inboxQuery.isError ? (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                    {t('requests.inbox.error')}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {inboxQuery.data && inboxQuery.data.items.length === 0 ? (
                        <EmptyInbox tab={tab} />
                    ) : (
                        inboxQuery.data?.items.map((request, idx) => (
                            <RequestCard key={request.id} request={request} index={idx} tab={tab} />
                        ))
                    )}
                </div>
            )}
        </div>
    )
}
