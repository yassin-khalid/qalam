import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'react-i18next'
import { createStandardSchemaV1, parseAsStringLiteral, useQueryStates } from 'nuqs'
import {
    SaudiRiyal,
    TrendingUp,
    TrendingDown,
    Wallet,
    Receipt,
    ArrowDownToLine,
    RotateCcw,
    Banknote,
    Download,
} from 'lucide-react'

import { useLocale } from '@/lib/hooks/useLocale'
import { LOCALE_DIRECTION } from '@/lib/i18n'
import { Skeleton } from '@/lib/components/Skeleton'

import {
    financeSummaryQueryOptions,
    financeTransactionsQueryOptions,
} from './-queries/financeQueries'
import type { FinanceTransactionFilter } from './-types/types'

const searchParams = {
    filter: parseAsStringLiteral(['all', 'Payment', 'Refund', 'Payout', 'PlatformFee'] as const).withDefault('all'),
}

export const Route = createFileRoute('/teacher/_authenticated/finance')({
    component: RouteComponent,
    validateSearch: createStandardSchemaV1(searchParams, { partialOutput: true }),
})

function RouteComponent() {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'
    const [params, setParams] = useQueryStates(searchParams)
    const filter = (params.filter ?? 'all') as FinanceTransactionFilter

    const summaryQuery = useQuery(financeSummaryQueryOptions())
    const txQuery = useQuery(financeTransactionsQueryOptions(filter))

    const summary = summaryQuery.data
    const monthDelta =
        summary && summary.earningsLastMonth > 0
            ? ((summary.earningsThisMonth - summary.earningsLastMonth) / summary.earningsLastMonth) * 100
            : 0
    const monthDeltaIsUp = monthDelta >= 0

    return (
        <div dir={LOCALE_DIRECTION[locale]} className="min-h-screen">
            <header className="mb-6">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    {t('finance.breadcrumbDashboard')} / {t('finance.breadcrumbCurrent')}
                </p>
                <h1 className="text-3xl font-black text-primary dark:text-secondary mt-1">
                    {t('finance.heading')}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    {t('finance.subtitle')}
                </p>
            </header>

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                <KpiCard
                    label={t('finance.kpi.totalEarnings')}
                    value={summary?.totalEarningsAllTime}
                    icon={<Wallet size={18} />}
                    tone="primary"
                    loading={summaryQuery.isLoading}
                />
                <KpiCard
                    label={t('finance.kpi.thisMonth')}
                    value={summary?.earningsThisMonth}
                    icon={monthDeltaIsUp ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    tone={monthDeltaIsUp ? 'success' : 'rose'}
                    secondary={
                        summary
                            ? t(monthDeltaIsUp ? 'finance.kpi.deltaUp' : 'finance.kpi.deltaDown', {
                                pct: Math.abs(monthDelta).toFixed(1),
                            })
                            : undefined
                    }
                    loading={summaryQuery.isLoading}
                />
                <KpiCard
                    label={t('finance.kpi.pendingPayout')}
                    value={summary?.pendingPayout}
                    icon={<ArrowDownToLine size={18} />}
                    tone="amber"
                    secondary={
                        summary
                            ? t('finance.kpi.nextPayoutDate', {
                                when: new Date(summary.nextPayoutDate).toLocaleDateString(
                                    isAr ? 'ar-EG' : 'en-US',
                                    { day: 'numeric', month: 'short' },
                                ),
                            })
                            : undefined
                    }
                    loading={summaryQuery.isLoading}
                />
                <KpiCard
                    label={t('finance.kpi.platformFees')}
                    value={summary?.platformFeesThisMonth}
                    icon={<Receipt size={18} />}
                    tone="slate"
                    secondary={t('finance.kpi.platformFeesHint')}
                    loading={summaryQuery.isLoading}
                />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 mb-4">
                {(['all', 'Payment', 'Payout', 'Refund', 'PlatformFee'] as const).map((id) => {
                    const isActive = filter === id
                    return (
                        <button
                            key={id}
                            type="button"
                            onClick={() => setParams({ filter: id })}
                            className={`px-3.5 py-2 rounded-xl text-sm font-bold border transition ${isActive
                                ? 'bg-primary dark:bg-secondary text-white border-transparent'
                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-primary/40 dark:hover:border-secondary/40'
                                }`}
                        >
                            {t(`finance.filters.${id}`)}
                        </button>
                    )
                })}
            </div>

            {/* Transactions */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        {t('finance.transactions.title')}
                    </h2>
                    {summary && (
                        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            {t('finance.transactions.totalCount', { count: summary.transactionsCount })}
                        </span>
                    )}
                </header>

                {txQuery.isLoading ? (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {Array.from({ length: 5 }, (_, i) => (
                            <li key={i} className="px-5 py-3 flex items-center gap-4">
                                <Skeleton className="w-10 h-10" rounded="xl" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-3.5 w-3/5" />
                                    <Skeleton className="h-2.5 w-2/5" />
                                </div>
                                <Skeleton className="h-4 w-16" />
                            </li>
                        ))}
                    </ul>
                ) : !txQuery.data || txQuery.data.length === 0 ? (
                    <div className="py-16 text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('finance.transactions.empty')}
                    </div>
                ) : (
                    <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {txQuery.data.map((tx) => {
                            const isCredit = tx.amount > 0
                            const Icon =
                                tx.type === 'Payment'
                                    ? Banknote
                                    : tx.type === 'Payout'
                                        ? ArrowDownToLine
                                        : tx.type === 'Refund'
                                            ? RotateCcw
                                            : Receipt
                            return (
                                <li key={tx.id} className="px-5 py-3 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isCredit
                                        ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                        }`}>
                                        <Icon size={16} />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                {tx.description}
                                            </p>
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${tx.status === 'Completed'
                                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                                : tx.status === 'Pending'
                                                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                                                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                                                }`}>
                                                {t(`finance.status.${tx.status}`)}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                            {tx.relatedStudentName && <>{tx.relatedStudentName} • </>}
                                            {tx.relatedCourseTitle ?? t(`finance.typeLabels.${tx.type}`)}
                                            {tx.invoiceNumber && <> • {tx.invoiceNumber}</>}
                                        </p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                                            {new Date(tx.createdAt).toLocaleString(isAr ? 'ar-EG' : 'en-US', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </p>
                                    </div>
                                    <div className={`text-end font-black text-sm whitespace-nowrap flex items-center gap-1 ${isCredit ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-700 dark:text-slate-200'}`}>
                                        {isCredit ? '+' : '−'}
                                        {Math.abs(tx.amount).toLocaleString()}
                                        <SaudiRiyal size={12} />
                                    </div>
                                    {tx.invoiceNumber && (
                                        <button
                                            type="button"
                                            aria-label={t('finance.transactions.downloadInvoice')}
                                            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary dark:hover:text-secondary transition shrink-0"
                                        >
                                            <Download size={14} />
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                )}
            </section>
        </div>
    )
}

interface KpiCardProps {
    label: string
    value: number | undefined
    icon: React.ReactNode
    tone: 'primary' | 'success' | 'rose' | 'amber' | 'slate'
    secondary?: string
    loading?: boolean
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon, tone, secondary, loading }) => {
    const toneClass: Record<KpiCardProps['tone'], string> = {
        primary: 'bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary',
        success: 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300',
        rose: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300',
        amber: 'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300',
        slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    }
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-center gap-2.5 mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${toneClass[tone]}`}>
                    {icon}
                </div>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
            </div>
            <div className="flex items-baseline gap-1">
                {loading || value === undefined ? (
                    <div className="h-7 w-20 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ) : (
                    <>
                        <span className="text-2xl font-black text-slate-800 dark:text-white">
                            {value.toLocaleString()}
                        </span>
                        <SaudiRiyal size={14} className="text-slate-400" />
                    </>
                )}
            </div>
            {secondary && <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">{secondary}</p>}
        </div>
    )
}
