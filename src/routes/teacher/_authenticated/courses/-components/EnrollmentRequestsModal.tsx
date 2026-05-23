import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    X,
    Users as UsersIcon,
    Clock,
    Send,
    UserPlus,
    Loader2,
    ChevronDown,
    Calendar as CalendarIcon,
    SaudiRiyal,
    NotebookPen,
    AlertCircle,
} from 'lucide-react'
import { Course } from '../-types/types'
import {
    approveEnrollmentRequest,
    enrollmentRequestDetailQueryOptions,
    enrollmentRequestsListQueryOptions,
    rejectEnrollmentRequest,
    RequestStatus,
    RequestStatusLabel,
    RequestStatusStyles,
    GroupMemberConfirmationLabel,
    GroupMemberConfirmationStyles,
    EnrollmentRequestListItem,
    EnrollmentRequestDetail,
} from '../-queries/enrollmentRequestsQueries'
import { showToast } from '../../../../../lib/utils/toast'
import { useTranslation } from 'react-i18next'
import { useLocale } from '@/lib/hooks/useLocale'
import { LOCALE_DIRECTION } from '@/lib/i18n'

interface EnrollmentRequestsModalProps {
    course: Course
    open: boolean
    onClose: () => void
}

type StatusTab = RequestStatus | 'all'

export const EnrollmentRequestsModal: React.FC<EnrollmentRequestsModalProps> = ({
    course,
    open,
    onClose,
}) => {
    const token = localStorage.getItem('token') ?? ''
    const queryClient = useQueryClient()
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const [statusTab, setStatusTab] = useState<StatusTab>(RequestStatus.Pending)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [rejectTargetId, setRejectTargetId] = useState<number | null>(null)

    const STATUS_TABS: { id: StatusTab; label: string }[] = [
        { id: 'all', label: t('courses.enrollment.tabs.all') },
        { id: RequestStatus.Pending, label: t('courses.enrollment.tabs.pending') },
        { id: RequestStatus.Approved, label: t('courses.enrollment.tabs.approved') },
        { id: RequestStatus.Rejected, label: t('courses.enrollment.tabs.rejected') },
        { id: RequestStatus.Cancelled, label: t('courses.enrollment.tabs.cancelled') },
    ]

    const listQuery = useQuery({
        ...enrollmentRequestsListQueryOptions(token, {
            courseId: course.id,
            status: statusTab === 'all' ? undefined : statusTab,
            pageNumber: 1,
            pageSize: 50,
        }),
        enabled: open,
    })

    const items = listQuery.data?.items ?? []

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] })
        queryClient.invalidateQueries({ queryKey: ['courses'] })
    }

    const approveMutation = useMutation({
        mutationFn: (id: number) => approveEnrollmentRequest(token, id),
        onSuccess: () => {
            showToast({ type: 'success', message: t('courses.enrollment.toasts.approved') })
            invalidate()
        },
        onError: (error: Error) => {
            showToast({ type: 'server', message: error.message })
        },
    })

    const rejectMutation = useMutation({
        mutationFn: ({ id, reason }: { id: number; reason?: string }) =>
            rejectEnrollmentRequest(token, id, reason),
        onSuccess: () => {
            showToast({ type: 'success', message: t('courses.enrollment.toasts.rejected') })
            setRejectTargetId(null)
            invalidate()
        },
        onError: (error: Error) => {
            showToast({ type: 'server', message: error.message })
        },
    })

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        key="panel"
                        initial={{ opacity: 0, scale: 0.96, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 12 }}
                        transition={{ duration: 0.22 }}
                        dir={LOCALE_DIRECTION[locale]}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ModalHeader course={course} onClose={onClose} closeAria={t('courses.enrollment.closeAria')} />

                        <div className="px-6 pt-5 pb-2 flex items-center gap-2 text-primary dark:text-secondary">
                            <UserPlus size={20} />
                            <h3 className="font-bold text-lg">{t('courses.enrollment.modalTitle')}</h3>
                        </div>

                        <StatusTabs
                            tabs={STATUS_TABS}
                            value={statusTab}
                            onChange={(s) => { setStatusTab(s); setExpandedId(null) }}
                        />

                        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-3 space-y-3">
                            {listQuery.isLoading && (
                                <div className="flex items-center justify-center py-12 text-slate-400">
                                    <Loader2 className="animate-spin" size={28} />
                                </div>
                            )}

                            {listQuery.isError && (
                                <div className="text-center py-10 text-sm text-rose-600">
                                    {t('courses.enrollment.loadError')}
                                </div>
                            )}

                            {!listQuery.isLoading && items.length === 0 && (
                                <div className="text-center py-10 text-sm text-slate-500 dark:text-slate-400">
                                    {t('courses.enrollment.empty')}
                                </div>
                            )}

                            {items.map((item) => (
                                <RequestRow
                                    key={item.id}
                                    item={item}
                                    token={token}
                                    expanded={expandedId === item.id}
                                    onToggle={() => setExpandedId((prev) => prev === item.id ? null : item.id)}
                                    isApproving={approveMutation.isPending && approveMutation.variables === item.id}
                                    isRejecting={rejectMutation.isPending && rejectMutation.variables?.id === item.id}
                                    onApprove={() => approveMutation.mutate(item.id)}
                                    onReject={() => setRejectTargetId(item.id)}
                                />
                            ))}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {rejectTargetId !== null && (
                <RejectDialog
                    key="reject"
                    onCancel={() => setRejectTargetId(null)}
                    onConfirm={(reason) => rejectMutation.mutate({ id: rejectTargetId, reason })}
                    isLoading={rejectMutation.isPending}
                />
            )}
        </AnimatePresence>
    )
}

const ModalHeader: React.FC<{ course: Course; onClose: () => void; closeAria: string }> = ({
    course,
    onClose,
    closeAria,
}) => {
    const locale = useLocale()
    return (
        <div className="bg-slate-50 dark:bg-slate-800/40 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
            <button
                type="button"
                aria-label={closeAria}
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition"
            >
                <X size={20} />
            </button>
            <div className="flex-1 text-start">
                <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-snug mb-3">
                    {course.title}
                </h2>
                <div className="flex flex-wrap gap-2 justify-start">
                    <HeaderPill>{locale === 'ar' ? (course as any).subjectNameAr ?? course.subjectNameEn : course.subjectNameEn}</HeaderPill>
                    <HeaderPill icon={<UsersIcon size={13} />}>{locale === 'ar' ? (course as any).sessionTypeNameAr ?? course.sessionTypeNameEn : course.sessionTypeNameEn}</HeaderPill>
                    <HeaderPill icon={<Clock size={13} />}>{locale === 'ar' ? (course as any).teachingModeNameAr ?? course.teachingModeNameEn : course.teachingModeNameEn}</HeaderPill>
                </div>
            </div>
        </div>
    )
}

const HeaderPill: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({
    children,
    icon,
}) => (
    <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
        {icon}
        {children}
    </span>
)

const StatusTabs: React.FC<{ tabs: { id: StatusTab; label: string }[]; value: StatusTab; onChange: (v: StatusTab) => void }> = ({ tabs, value, onChange }) => (
    <div className="px-6 pb-2 flex gap-2 flex-wrap">
        {tabs.map((tab) => {
            const isActive = value === tab.id
            return (
                <button
                    key={String(tab.id)}
                    type="button"
                    onClick={() => onChange(tab.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${isActive
                            ? 'bg-primary dark:bg-secondary text-white border-transparent'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                >
                    {tab.label}
                </button>
            )
        })}
    </div>
)

interface RequestRowProps {
    item: EnrollmentRequestListItem
    token: string
    expanded: boolean
    onToggle: () => void
    isApproving: boolean
    isRejecting: boolean
    onApprove: () => void
    onReject: () => void
}

const RequestRow: React.FC<RequestRowProps> = ({
    item,
    token,
    expanded,
    onToggle,
    isApproving,
    isRejecting,
    onApprove,
    onReject,
}) => {
    const isPending = item.status === RequestStatus.Pending
    const { t } = useTranslation('teacher')
    const locale = useLocale()

    return (
        <div className="border border-secondary/30 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
            <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-2 shrink-0">
                        {isPending && (
                            <>
                                <button
                                    type="button"
                                    disabled={isApproving || isRejecting}
                                    onClick={onApprove}
                                    className="bg-secondary hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition"
                                >
                                    {isApproving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                    {t('courses.enrollment.approve')}
                                </button>
                                <button
                                    type="button"
                                    disabled={isApproving || isRejecting}
                                    onClick={onReject}
                                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-lg text-sm font-bold transition"
                                >
                                    {t('courses.enrollment.reject')}
                                </button>
                            </>
                        )}
                    </div>
                    <div className="flex-1 min-w-0 text-start space-y-1">
                        <div className="flex items-center justify-start gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${RequestStatusStyles[item.status]}`}>
                                {RequestStatusLabel[item.status]}
                            </span>
                            <h4 className="font-bold text-slate-800 dark:text-white truncate min-w-0">
                                {item.requestedByUserName ?? t('courses.enrollment.defaultStudent')}
                            </h4>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{relativeTime(item.createdAt, locale, t)}</p>
                    </div>
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-start">
                    <RowStat icon={<UsersIcon size={13} />} label={t('courses.enrollment.stats.members')} value={`${item.groupMemberCount}`} />
                    <RowStat icon={<Clock size={13} />} label={t('courses.enrollment.stats.total')} value={`${item.totalMinutes} ${t('courses.enrollment.stats.totalSuffixMin')}`} />
                    <RowStat icon={<SaudiRiyal size={13} />} label={t('courses.enrollment.stats.price')} value={`${item.estimatedTotalPrice}`} />
                    <RowStat label={t('courses.enrollment.stats.mode')} value={(locale === 'ar' ? (item as any).sessionTypeNameAr : item.sessionTypeNameEn) ?? '—'} />
                </div>
            </div>

            <button
                type="button"
                onClick={onToggle}
                className="w-full px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-center gap-1.5 transition"
            >
                {expanded ? t('courses.enrollment.details.hide') : t('courses.enrollment.details.show')}
                <ChevronDown size={14} className={expanded ? 'rotate-180 transition' : 'transition'} />
            </button>

            <AnimatePresence initial={false}>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                    >
                        <RequestDetailPanel id={item.id} token={token} />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

const RowStat: React.FC<{ icon?: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="bg-slate-50 dark:bg-slate-800/40 rounded-lg px-3 py-2">
        <div className="flex items-center justify-start gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
            {icon}
            <span>{label}</span>
        </div>
        <div className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{value}</div>
    </div>
)

const RequestDetailPanel: React.FC<{ id: number; token: string }> = ({ id, token }) => {
    const detailQuery = useQuery(enrollmentRequestDetailQueryOptions(token, id))
    const { t } = useTranslation('teacher')
    const locale = useLocale()

    if (detailQuery.isLoading) {
        return (
            <div className="px-4 py-6 flex items-center justify-center text-slate-400">
                <Loader2 size={20} className="animate-spin" />
            </div>
        )
    }
    if (detailQuery.isError || !detailQuery.data) {
        return (
            <div className="px-4 py-4 text-center text-sm text-rose-600">
                {t('courses.enrollment.detailError')}
            </div>
        )
    }

    const detail: EnrollmentRequestDetail = detailQuery.data

    return (
        <div className="px-4 py-4 bg-slate-50/30 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 space-y-4 text-start">
            {(detail.preferredStartDate || detail.preferredEndDate) && (
                <DetailSection icon={<CalendarIcon size={14} />} title={t('courses.enrollment.details.preferredPeriod')}>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        {formatDate(detail.preferredStartDate, locale)}
                        <span className="mx-2 text-slate-400">—</span>
                        {formatDate(detail.preferredEndDate, locale)}
                    </p>
                </DetailSection>
            )}

            {detail.proposedScheduleDates && detail.proposedScheduleDates.length > 0 && (
                <DetailSection icon={<CalendarIcon size={14} />} title={t('courses.enrollment.details.proposedScheduleDates')}>
                    <ul className="space-y-1.5">
                        {detail.proposedScheduleDates.map((s) => (
                            <li
                                key={s.sessionNumber}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2 flex items-center justify-between gap-3"
                            >
                                <span className="text-xs text-slate-500 dark:text-slate-400 shrink-0">{s.durationMinutes} {t('courses.enrollment.details.durationMin')}</span>
                                <div className="flex-1 min-w-0 text-start">
                                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                        {t('courses.enrollment.details.sessionLine', { number: s.sessionNumber })}{s.title ? ` — ${s.title}` : ''}
                                    </div>
                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {formatDate(s.date, locale)}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </DetailSection>
            )}

            {detail.notes && (
                <DetailSection icon={<NotebookPen size={14} />} title={t('courses.enrollment.details.notes')}>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                        {detail.notes}
                    </p>
                </DetailSection>
            )}

            {detail.rejectionReason && (
                <DetailSection icon={<AlertCircle size={14} />} title={t('courses.enrollment.details.previousRejectionReason')} tone="rose">
                    <p className="text-sm text-rose-700 dark:text-rose-300 whitespace-pre-wrap">
                        {detail.rejectionReason}
                    </p>
                </DetailSection>
            )}

            {detail.groupMembers && detail.groupMembers.length > 0 && (
                <DetailSection icon={<UsersIcon size={14} />} title={t('courses.enrollment.details.groupMembers')}>
                    <ul className="space-y-1.5">
                        {detail.groupMembers.map((m) => (
                            <li
                                key={m.studentId}
                                className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2"
                            >
                                <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${GroupMemberConfirmationStyles[m.confirmationStatus]}`}>
                                    {GroupMemberConfirmationLabel[m.confirmationStatus]}
                                </span>
                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                    {m.studentName ?? t('courses.enrollment.studentLabel', { id: m.studentId })}
                                </span>
                            </li>
                        ))}
                    </ul>
                </DetailSection>
            )}

            {detail.proposedSessions && detail.proposedSessions.length > 0 && (
                <DetailSection icon={<CalendarIcon size={14} />} title={t('courses.enrollment.details.proposedSessions')}>
                    <ul className="space-y-1.5">
                        {detail.proposedSessions.map((s) => (
                            <li
                                key={s.sessionNumber}
                                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-2"
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-slate-500 dark:text-slate-400">{s.durationMinutes} {t('courses.enrollment.details.durationMin')}</span>
                                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">
                                        {t('courses.enrollment.details.sessionLine', { number: s.sessionNumber })}{s.title ? ` — ${s.title}` : ''}
                                    </span>
                                </div>
                                {s.notes && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.notes}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                </DetailSection>
            )}

            {detail.selectedAvailabilityIds && detail.selectedAvailabilityIds.length > 0 && (
                <DetailSection icon={<Clock size={14} />} title={t('courses.enrollment.details.selectedAvailability')}>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {t('courses.enrollment.details.selectedAvailabilityCount', { count: detail.selectedAvailabilityIds.length })}
                    </p>
                </DetailSection>
            )}
        </div>
    )
}

const DetailSection: React.FC<{
    icon: React.ReactNode
    title: string
    tone?: 'default' | 'rose'
    children: React.ReactNode
}> = ({ icon, title, tone = 'default', children }) => (
    <div className="space-y-1.5">
        <div className={`flex items-center justify-start gap-1.5 text-xs font-bold ${tone === 'rose' ? 'text-rose-600 dark:text-rose-400' : 'text-primary dark:text-secondary'}`}>
            {icon}
            <span>{title}</span>
        </div>
        {children}
    </div>
)

const RejectDialog: React.FC<{
    onCancel: () => void
    onConfirm: (reason?: string) => void
    isLoading: boolean
}> = ({ onCancel, onConfirm, isLoading }) => {
    const [reason, setReason] = useState('')
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                dir={LOCALE_DIRECTION[locale]}
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 text-start">
                    {t('courses.enrollment.rejectDialog.title')}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-start">
                    {t('courses.enrollment.rejectDialog.subtitle')}
                </p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder={t('courses.enrollment.rejectDialog.placeholder')}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-start text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-secondary resize-none"
                />
                <div className="flex gap-2 mt-4">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => onConfirm(reason.trim() || undefined)}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        {t('courses.enrollment.rejectDialog.confirm')}
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onCancel}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-sm transition"
                    >
                        {t('courses.enrollment.rejectDialog.cancel')}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

function formatDate(value: string | null | undefined, locale: string): string {
    if (!value) return '—'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return value
    return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date)
}

function relativeTime(iso: string, locale: string, t: (key: string, opts?: any) => string): string {
    const date = new Date(iso)
    const diffMs = Date.now() - date.getTime()
    if (Number.isNaN(diffMs) || diffMs < 0) return t('courses.enrollment.relativeTime.now')

    const sec = Math.floor(diffMs / 1000)
    const min = Math.floor(sec / 60)
    if (min < 1) return t('courses.enrollment.relativeTime.moments')

    try {
        const rtf = new Intl.RelativeTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', { numeric: 'auto' })
        if (min < 60) return rtf.format(-min, 'minute')
        const hr = Math.floor(min / 60)
        if (hr < 24) return rtf.format(-hr, 'hour')
        const day = Math.floor(hr / 24)
        if (day < 30) return rtf.format(-day, 'day')
        const month = Math.floor(day / 30)
        if (month < 12) return rtf.format(-month, 'month')
        const year = Math.floor(day / 365)
        return rtf.format(-year, 'year')
    } catch {
        return t('courses.enrollment.relativeTime.moments')
    }
}
