import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { createStandardSchemaV1, parseAsStringLiteral, useQueryStates } from 'nuqs'
import { Bell, CheckCheck, Loader2 } from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import { LOCALE_DIRECTION } from '@/lib/i18n'
import { SkeletonRow } from '@/lib/components/Skeleton'
import { showToast } from '@/lib/utils/toast'

import { NotificationItem } from './-components/NotificationItem'
import {
    markAllNotificationsAsRead,
    markNotificationAsRead,
    notificationsListQueryOptions,
} from './-queries/notificationsQueries'
import type { NotificationFilter } from './-types/types'

const searchParams = {
    filter: parseAsStringLiteral(['all', 'unread'] as const).withDefault('all'),
}

export const Route = createFileRoute('/teacher/_authenticated/notifications')({
    component: RouteComponent,
    validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
})

function RouteComponent() {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const queryClient = useQueryClient()
    const [params, setParams] = useQueryStates(searchParams)
    const filter = (params.filter ?? 'all') as NotificationFilter

    const listQuery = useQuery(notificationsListQueryOptions(filter))

    const readMutation = useMutation({
        mutationFn: (id: number) => markNotificationAsRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const readAllMutation = useMutation({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => {
            showToast({ type: 'success', message: t('notifications.toasts.allRead') })
            queryClient.invalidateQueries({ queryKey: ['notifications'] })
        },
    })

    const counts = listQuery.data?.counts

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            <header className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-3">
                <div>
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {t('notifications.breadcrumbDashboard')} / {t('notifications.breadcrumbCurrent')}
                    </p>
                    <h1 className="text-3xl font-black text-primary dark:text-secondary mt-1">
                        {t('notifications.heading')}
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {t('notifications.subtitle')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => readAllMutation.mutate()}
                    disabled={!counts || counts.unread === 0 || readAllMutation.isPending}
                    className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed self-start"
                >
                    {readAllMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                    {t('notifications.markAllRead')}
                </button>
            </header>

            <div className="mb-5 flex flex-wrap gap-2">
                {(['all', 'unread'] as const).map((id) => {
                    const isActive = filter === id
                    const count = counts?.[id]
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setParams({ filter: id })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all ${isActive
                                ? 'bg-primary dark:bg-secondary text-white border-transparent shadow-md shadow-primary/20 dark:shadow-secondary/20'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-primary/40 dark:hover:border-secondary/40'
                                }`}
                        >
                            {t(`notifications.tabs.${id}`)}
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

            {listQuery.isLoading ? (
                <ul className="space-y-2">
                    {Array.from({ length: 5 }, (_, i) => (
                        <li key={i}><SkeletonRow /></li>
                    ))}
                </ul>
            ) : listQuery.isError ? (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                    {t('notifications.error')}
                </div>
            ) : !listQuery.data || listQuery.data.items.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center">
                    <Bell size={48} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        {t(`notifications.empty.${filter}`)}
                    </p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {listQuery.data.items.map((n, idx) => (
                        <li key={n.id}>
                            <NotificationItem
                                notification={n}
                                index={idx}
                                onActivate={(id) => readMutation.mutate(id)}
                            />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}
