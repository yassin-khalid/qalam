import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Check, X, Users as UsersIcon, Clock, SaudiRiyal } from 'lucide-react'

import { showToast } from '@/lib/utils/toast'
import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'

import {
    approveEnrollmentRequest,
    enrollmentRequestsListQueryOptions,
    rejectEnrollmentRequest,
    RequestStatus,
    type EnrollmentRequestListItem,
} from '../../-queries/enrollmentRequestsQueries'

interface EnrollmentRequestsTabProps {
    courseId: number
}

export const EnrollmentRequestsTab: React.FC<EnrollmentRequestsTabProps> = ({ courseId }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const queryClient = useQueryClient()
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') ?? '' : ''
    const [rejectTargetId, setRejectTargetId] = useState<number | null>(null)
    const [rejectReason, setRejectReason] = useState('')

    const listQuery = useQuery(
        enrollmentRequestsListQueryOptions(token, {
            courseId,
            pageNumber: 1,
            pageSize: 50,
        }),
    )

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] })
    }

    const approveMutation = useMutation({
        mutationFn: (id: number) => approveEnrollmentRequest(token, id),
        onSuccess: () => {
            showToast({ type: 'success', message: t('courseDetail.requests.approveSuccess') })
            invalidate()
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            rejectEnrollmentRequest(token, id, reason),
        onSuccess: () => {
            showToast({ type: 'success', message: t('courseDetail.requests.rejectSuccess') })
            setRejectTargetId(null)
            setRejectReason('')
            invalidate()
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    if (listQuery.isLoading) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-12 flex justify-center text-slate-400">
                <Loader2 size={28} className="animate-spin" />
            </div>
        )
    }

    if (listQuery.isError) {
        return (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-300 rounded-2xl p-6 text-center text-sm font-bold">
                {t('courseDetail.requests.error')}
            </div>
        )
    }

    const items = listQuery.data?.items ?? []

    if (items.length === 0) {
        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                {t('courseDetail.requests.empty')}
            </div>
        )
    }

    return (
        <div className="space-y-3">
            {items.map((item) => (
                <RequestRow
                    key={item.id}
                    item={item}
                    onApprove={() => approveMutation.mutate(item.id)}
                    onReject={() => setRejectTargetId(item.id)}
                    isApproving={approveMutation.isPending && approveMutation.variables === item.id}
                    isRejecting={rejectMutation.isPending && rejectMutation.variables?.id === item.id}
                />
            ))}

            <AnimatePresence>
                {rejectTargetId !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !rejectMutation.isPending && setRejectTargetId(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            dir={LOCALE_DIRECTION[locale]}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
                        >
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                                {t('courseDetail.requests.rejectDialog.title')}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                {t('courseDetail.requests.rejectDialog.message')}
                            </p>
                            <textarea
                                rows={3}
                                maxLength={500}
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder={t('courseDetail.requests.rejectDialog.placeholder')}
                                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
                            />
                            <div className="flex gap-2 mt-4">
                                <button
                                    type="button"
                                    disabled={rejectMutation.isPending}
                                    onClick={() =>
                                        rejectMutation.mutate({
                                            id: rejectTargetId,
                                            reason: rejectReason.trim() || undefined,
                                        })
                                    }
                                    className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                >
                                    {rejectMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                    {t('courseDetail.requests.rejectDialog.confirm')}
                                </button>
                                <button
                                    type="button"
                                    disabled={rejectMutation.isPending}
                                    onClick={() => {
                                        setRejectTargetId(null)
                                        setRejectReason('')
                                    }}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-sm transition"
                                >
                                    {t('courseDetail.requests.rejectDialog.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const RequestRow: React.FC<{
    item: EnrollmentRequestListItem
    isApproving: boolean
    isRejecting: boolean
    onApprove: () => void
    onReject: () => void
}> = ({ item, isApproving, isRejecting, onApprove, onReject }) => {
    const { t } = useTranslation('teacher')
    const isPending = item.status === RequestStatus.Pending

    const statusKey =
        item.status === RequestStatus.Pending ? 'courseDetail.requests.statusPending'
            : item.status === RequestStatus.Approved ? 'courseDetail.requests.statusApproved'
                : item.status === RequestStatus.Rejected ? 'courseDetail.requests.statusRejected'
                    : 'courseDetail.requests.statusCancelled'

    const tone =
        item.status === RequestStatus.Pending ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/40'
            : item.status === RequestStatus.Approved ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-900/40'

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${tone}`}>
                            {t(statusKey)}
                        </span>
                        <h4 className="font-bold text-slate-800 dark:text-white truncate">
                            {item.requestedByUserName ?? `#${item.id}`}
                        </h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-xs">
                        <Stat icon={<UsersIcon size={12} />}>{t('courseDetail.requests.membersCount', { count: item.groupMemberCount })}</Stat>
                        <Stat icon={<Clock size={12} />}>{t('courseDetail.requests.totalMinutes', { count: item.totalMinutes })}</Stat>
                        <Stat icon={<SaudiRiyal size={12} />}>{item.estimatedTotalPrice}</Stat>
                        <Stat>{item.sessionTypeNameEn ?? '—'}</Stat>
                    </div>
                </div>
                {isPending && (
                    <div className="flex gap-2 shrink-0">
                        <button
                            type="button"
                            disabled={isApproving || isRejecting}
                            onClick={onApprove}
                            className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold flex items-center gap-1.5 transition"
                        >
                            {isApproving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                            {t('courseDetail.requests.approve')}
                        </button>
                        <button
                            type="button"
                            disabled={isApproving || isRejecting}
                            onClick={onReject}
                            className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition"
                        >
                            <X size={12} />
                            {t('courseDetail.requests.reject')}
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

const Stat: React.FC<{ icon?: React.ReactNode; children: React.ReactNode }> = ({ icon, children }) => (
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-md px-2.5 py-1.5">
        <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-medium">
            {icon && <span className="text-primary dark:text-secondary">{icon}</span>}
            <span className="truncate">{children}</span>
        </div>
    </div>
)
