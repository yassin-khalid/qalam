import React, { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { X, Users as UsersIcon, Clock, Send, UserPlus, Loader2 } from 'lucide-react'
import { Course } from '../-types/types'
import {
    approveEnrollmentRequest,
    EnrollmentRequestDetail,
    enrollmentRequestDetailQueryOptions,
    enrollmentRequestsListQueryOptions,
    rejectEnrollmentRequest,
} from '../-queries/enrollmentRequestsQueries'
import { showToast } from '../../../../../lib/utils/toast'

interface EnrollmentRequestsModalProps {
    course: Course
    open: boolean
    onClose: () => void
}

const PLACEHOLDER_EMAIL = (id: number) => `student${id}@placeholder.qalam`

export const EnrollmentRequestsModal: React.FC<EnrollmentRequestsModalProps> = ({
    course,
    open,
    onClose,
}) => {
    const token = localStorage.getItem('token') ?? ''
    const queryClient = useQueryClient()
    const [rejectTargetId, setRejectTargetId] = useState<number | null>(null)

    const listQuery = useQuery({
        ...enrollmentRequestsListQueryOptions(token, {
            courseId: course.id,
            status: 'Pending',
            pageNumber: 1,
            pageSize: 50,
        }),
        enabled: open,
    })

    const requestIds = useMemo(
        () => listQuery.data?.items?.map((item) => item.id) ?? [],
        [listQuery.data],
    )

    const detailsQueries = useQueries({
        queries: requestIds.map((id) =>
            enrollmentRequestDetailQueryOptions(token, id, open),
        ),
    })

    const details = detailsQueries
        .map((q) => q.data)
        .filter((d): d is EnrollmentRequestDetail => Boolean(d))

    const invalidate = () => {
        queryClient.invalidateQueries({ queryKey: ['enrollment-requests'] })
        queryClient.invalidateQueries({ queryKey: ['courses'] })
    }

    const approveMutation = useMutation({
        mutationFn: (id: number) => approveEnrollmentRequest(token, id),
        onSuccess: () => {
            showToast({ type: 'success', message: 'تم قبول الطلب بنجاح' })
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
            showToast({ type: 'success', message: 'تم رفض الطلب' })
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
                        dir="rtl"
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ModalHeader course={course} onClose={onClose} />

                        <div className="px-6 pt-5 pb-3 flex items-center gap-2 text-primary dark:text-secondary">
                            <UserPlus size={20} />
                            <h3 className="font-bold text-lg">طلبات الانضمام للدورة</h3>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
                            {listQuery.isLoading && (
                                <div className="flex items-center justify-center py-12 text-slate-400">
                                    <Loader2 className="animate-spin" size={28} />
                                </div>
                            )}

                            {listQuery.isError && (
                                <div className="text-center py-10 text-sm text-rose-600">
                                    تعذر تحميل الطلبات. حاول لاحقاً.
                                </div>
                            )}

                            {!listQuery.isLoading && details.length === 0 && listQuery.data && (
                                <div className="text-center py-10 text-sm text-slate-400">
                                    لا توجد طلبات انضمام حالياً
                                </div>
                            )}

                            {details.map((detail) => (
                                <RequestRow
                                    key={detail.id}
                                    detail={detail}
                                    isApproving={approveMutation.isPending && approveMutation.variables === detail.id}
                                    isRejecting={rejectMutation.isPending && rejectMutation.variables?.id === detail.id}
                                    onApprove={() => approveMutation.mutate(detail.id)}
                                    onReject={() => setRejectTargetId(detail.id)}
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

const ModalHeader: React.FC<{ course: Course; onClose: () => void }> = ({
    course,
    onClose,
}) => (
    <div className="bg-slate-50 dark:bg-slate-800/40 px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4">
        <button
            type="button"
            aria-label="إغلاق"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition"
        >
            <X size={20} />
        </button>
        <div className="flex-1 text-right">
            <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-snug mb-3">
                {course.title}
            </h2>
            <div className="flex flex-wrap gap-2 justify-end">
                <HeaderPill>{course.subjectNameEn}</HeaderPill>
                <HeaderPill icon={<UsersIcon size={13} />}>{course.sessionTypeNameEn}</HeaderPill>
                <HeaderPill>الثالث الثانوي</HeaderPill>
                <HeaderPill icon={<Clock size={13} />}>{course.teachingModeNameEn}</HeaderPill>
            </div>
        </div>
    </div>
)

const HeaderPill: React.FC<{ children: React.ReactNode; icon?: React.ReactNode }> = ({
    children,
    icon,
}) => (
    <span className="bg-primary text-white px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1">
        {icon}
        {children}
    </span>
)

interface RequestRowProps {
    detail: EnrollmentRequestDetail
    isApproving: boolean
    isRejecting: boolean
    onApprove: () => void
    onReject: () => void
}

const RequestRow: React.FC<RequestRowProps> = ({
    detail,
    isApproving,
    isRejecting,
    onApprove,
    onReject,
}) => (
    <div className="border border-secondary/30 rounded-xl p-4 bg-white dark:bg-slate-900">
        <div className="flex items-start justify-between gap-4">
            <div className="flex gap-2 flex-shrink-0">
                <button
                    type="button"
                    disabled={isApproving || isRejecting}
                    onClick={onApprove}
                    className="bg-secondary hover:bg-primary disabled:opacity-60 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition"
                >
                    {isApproving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    قبول
                </button>
                <button
                    type="button"
                    disabled={isApproving || isRejecting}
                    onClick={onReject}
                    className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-60 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 px-4 py-1.5 rounded-lg text-sm font-bold transition"
                >
                    رفض
                </button>
            </div>
            <div className="flex-1 text-right min-w-0">
                <div className="flex items-center gap-2 justify-end">
                    <h4 className="font-bold text-slate-800 dark:text-white truncate">
                        {detail.requestedByUserName ?? 'طالب'}
                    </h4>
                    <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" aria-hidden />
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                    {PLACEHOLDER_EMAIL(detail.id)}
                </p>
                <p className="text-xs text-slate-400 mt-1">{relativeTimeAr(detail.createdAt)}</p>
            </div>
        </div>

        {detail.notes && (
            <div className="mt-3 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-sm rounded-lg px-4 py-3 text-right">
                {detail.notes}
            </div>
        )}
    </div>
)

const RejectDialog: React.FC<{
    onCancel: () => void
    onConfirm: (reason?: string) => void
    isLoading: boolean
}> = ({ onCancel, onConfirm, isLoading }) => {
    const [reason, setReason] = useState('')
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
                dir="rtl"
                className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 text-right">
                    رفض طلب الانضمام
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-right">
                    يمكنك إضافة سبب الرفض لإطلاع الطالب (اختياري).
                </p>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={500}
                    rows={4}
                    placeholder="سبب الرفض..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3 text-sm text-right text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-secondary resize-none"
                />
                <div className="flex gap-2 mt-4">
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => onConfirm(reason.trim() || undefined)}
                        className="flex-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                    >
                        {isLoading && <Loader2 size={14} className="animate-spin" />}
                        تأكيد الرفض
                    </button>
                    <button
                        type="button"
                        disabled={isLoading}
                        onClick={onCancel}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-sm transition"
                    >
                        إلغاء
                    </button>
                </div>
            </motion.div>
        </motion.div>
    )
}

function relativeTimeAr(iso: string): string {
    const date = new Date(iso)
    const diffMs = Date.now() - date.getTime()
    if (Number.isNaN(diffMs) || diffMs < 0) return 'الآن'

    const min = Math.floor(diffMs / 60_000)
    if (min < 1) return 'منذ لحظات'
    if (min < 60) return formatArabicDuration(min, 'دقيقة', 'دقيقتين', 'دقائق', 'دقيقة')

    const hr = Math.floor(min / 60)
    if (hr < 24) return formatArabicDuration(hr, 'ساعة', 'ساعتين', 'ساعات', 'ساعة')

    const day = Math.floor(hr / 24)
    if (day < 30) return formatArabicDuration(day, 'يوم', 'يومين', 'أيام', 'يوماً')

    const month = Math.floor(day / 30)
    if (month < 12) return formatArabicDuration(month, 'شهر', 'شهرين', 'أشهر', 'شهراً')

    const year = Math.floor(day / 365)
    return formatArabicDuration(year, 'سنة', 'سنتين', 'سنوات', 'سنة')
}

function formatArabicDuration(
    n: number,
    singular: string,
    dual: string,
    plural: string,
    genitive: string,
): string {
    if (n === 1) return `منذ ${singular}`
    if (n === 2) return `منذ ${dual}`
    if (n >= 3 && n <= 10) return `منذ ${n} ${plural}`
    return `منذ ${n} ${genitive}`
}
