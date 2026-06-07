import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    X,
    SaudiRiyal,
    Loader2,
    Calendar as CalendarIcon,
    Clock,
    Check,
    AlertTriangle,
    CalendarOff,
} from 'lucide-react'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'
import { showToast } from '@/lib/utils/toast'

import {
    availabilityMatchQueryOptions,
    submitOffer,
    updateOffer,
} from '../../-queries/sessionRequestsQueries'
import type {
    AvailabilityStatus,
    SessionOffer,
    SessionRequestDetail,
} from '../../-types/types'

interface SubmitOfferModalProps {
    open: boolean
    onClose: () => void
    request: SessionRequestDetail
    existingOffer: SessionOffer | null
}

const VALIDITY_OPTIONS = [24, 48, 72, 168] as const

const formatDate = (iso: string, isAr: boolean) =>
    new Date(iso).toLocaleDateString(isAr ? 'ar-EG' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    })

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({
    open,
    onClose,
    request,
    existingOffer,
}) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const isAr = locale === 'ar'
    const queryClient = useQueryClient()

    const isUpdate = !!existingOffer

    const [price, setPrice] = useState<string>(existingOffer ? String(existingOffer.price) : '')
    const [teacherNotes, setTeacherNotes] = useState<string>(existingOffer?.teacherNotes ?? '')
    const [validityHours, setValidityHours] = useState<number>(48)
    const [commitmentConfirmed, setCommitmentConfirmed] = useState<boolean>(false)

    // Re-seed when opening or when the existing offer changes.
    useEffect(() => {
        if (!open) return
        setPrice(existingOffer ? String(existingOffer.price) : '')
        setTeacherNotes(existingOffer?.teacherNotes ?? '')
        setValidityHours(48)
        setCommitmentConfirmed(false)
    }, [open, existingOffer])

    // Per-session availability against the teacher's schedule — informational
    // only (it never blocks submitting; the student's timing is accepted as-is).
    const availabilityQuery = useQuery({
        ...availabilityMatchQueryOptions(request.id),
        enabled: open,
    })
    const availabilityBySession = new Map(
        (availabilityQuery.data ?? []).map((a) => [a.sequenceNumber, a]),
    )

    const numericPrice = Number(price)
    const priceValid = Number.isFinite(numericPrice) && numericPrice > 0
    const canSubmit = priceValid && (isUpdate || commitmentConfirmed)

    const mutation = useMutation({
        mutationFn: () =>
            isUpdate && existingOffer
                ? updateOffer({
                    id: existingOffer.id,
                    price: numericPrice,
                    teacherNotes: teacherNotes.trim() || null,
                    validityHours,
                })
                : submitOffer({
                    sessionRequestId: request.id,
                    price: numericPrice,
                    teacherNotes: teacherNotes.trim() || null,
                    validityHours,
                    commitmentConfirmed,
                }),
        onSuccess: () => {
            showToast({
                type: 'success',
                message: t(isUpdate ? 'requests.submitOffer.toasts.updated' : 'requests.submitOffer.toasts.created'),
            })
            queryClient.invalidateQueries({ queryKey: ['session-requests'] })
            queryClient.invalidateQueries({ queryKey: ['session-offers'] })
            onClose()
        },
        onError: (err: Error) => {
            showToast({
                type: 'server',
                message: t(err.message, { defaultValue: t('requests.submitOffer.toasts.failed') }),
            })
        },
    })

    const handleSubmit = () => {
        if (!priceValid) {
            showToast({ type: 'validation', message: t('requests.submitOffer.errors.positivePrice') })
            return
        }
        if (!isUpdate && !commitmentConfirmed) {
            showToast({ type: 'validation', message: t('requests.submitOffer.errors.commitmentRequired') })
            return
        }
        mutation.mutate()
    }

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 16, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 16, scale: 0.97 }}
                        transition={{ duration: 0.22 }}
                        dir={LOCALE_DIRECTION[locale]}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <header className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                                    {t(isUpdate ? 'requests.submitOffer.updateTitle' : 'requests.submitOffer.title')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                    {isAr ? request.subjectNameAr : request.subjectNameEn} • {request.sessionsCount} {t('requests.card.sessionsLabel')}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label={t('common.closeAria')}
                                className="p-2 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                            >
                                <X size={20} />
                            </button>
                        </header>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {isUpdate && (
                                <div className="flex items-start gap-2 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-lg px-3 py-2.5">
                                    <AlertTriangle size={14} className="shrink-0 mt-px" />
                                    <span>{t('requests.submitOffer.updateNotice')}</span>
                                </div>
                            )}

                            {/* Price */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t('requests.submitOffer.totalPriceLabel')}
                                </label>
                                <div className="relative max-w-xs">
                                    <input
                                        type="number"
                                        min={0}
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="0"
                                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-end text-sm"
                                    />
                                    <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                                        <SaudiRiyal size={16} />
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {t('requests.submitOffer.priceHint')}
                                </p>
                            </div>

                            {/* Session dates + availability (read-only) */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {t('requests.submitOffer.sessionDatesLabel')}
                                    </label>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                        {t('requests.submitOffer.sessionDatesHint')}
                                    </span>
                                </div>
                                <ul className="space-y-2">
                                    {request.sessions.map((s) => {
                                        const match = availabilityBySession.get(s.sequenceNumber)
                                        return (
                                            <li
                                                key={s.id}
                                                className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 px-3 py-2.5"
                                            >
                                                <div className="min-w-0">
                                                    <p className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                        {t('requests.detail.sessions.sessionLabel', { number: s.sequenceNumber })}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                                                        <CalendarIcon size={11} />
                                                        {formatDate(s.preferredDate, isAr)}
                                                        <Clock size={11} className="ms-1.5" />
                                                        {s.preferredTimeSlotLabel}
                                                    </p>
                                                </div>
                                                <AvailabilityBadge
                                                    status={match?.status}
                                                    loading={availabilityQuery.isLoading}
                                                />
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>

                            {/* Validity */}
                            <div className="space-y-2.5">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t('requests.submitOffer.validityLabel')}
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {VALIDITY_OPTIONS.map((h) => {
                                        const active = validityHours === h
                                        return (
                                            <button
                                                key={h}
                                                type="button"
                                                onClick={() => setValidityHours(h)}
                                                className={`px-3 py-2 rounded-lg text-xs font-bold border transition ${active
                                                    ? 'bg-primary dark:bg-secondary text-white border-transparent'
                                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                                                    }`}
                                            >
                                                {t('requests.submitOffer.validityOption', { hours: h })}
                                            </button>
                                        )
                                    })}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                    {t('requests.submitOffer.validityHint')}
                                </p>
                            </div>

                            {/* Teacher notes */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t('requests.submitOffer.generalNotesLabel')}
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={1000}
                                    value={teacherNotes}
                                    onChange={(e) => setTeacherNotes(e.target.value)}
                                    placeholder={t('requests.submitOffer.generalNotesPlaceholder')}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
                                />
                                <div className="text-end text-xs text-slate-500 dark:text-slate-400">{teacherNotes.length} / 1000</div>
                            </div>

                            {/* Commitment (create only) */}
                            {!isUpdate && (
                                <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 px-3.5 py-3">
                                    <input
                                        type="checkbox"
                                        checked={commitmentConfirmed}
                                        onChange={(e) => setCommitmentConfirmed(e.target.checked)}
                                        className="mt-0.5 w-4 h-4 accent-primary dark:accent-secondary"
                                    />
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                                        {t('requests.submitOffer.commitmentLabel')}
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* Footer */}
                        <footer className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={mutation.isPending}
                                className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                {t('requests.submitOffer.cancel')}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={mutation.isPending || !canSubmit}
                                className="px-5 py-2.5 rounded-lg bg-secondary text-white text-sm font-bold hover:bg-primary transition shadow-md shadow-secondary/20 flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {mutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                {t(isUpdate ? 'requests.submitOffer.update' : 'requests.submitOffer.submit')}
                            </button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const AvailabilityBadge: React.FC<{ status?: AvailabilityStatus; loading: boolean }> = ({ status, loading }) => {
    const { t } = useTranslation('teacher')
    if (loading || !status) {
        return <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600 animate-pulse shrink-0" />
    }
    const map = {
        Available: {
            icon: <Check size={12} />,
            cls: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40',
        },
        Conflict: {
            icon: <AlertTriangle size={12} />,
            cls: 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-900/40',
        },
        OutsideAvailability: {
            icon: <CalendarOff size={12} />,
            cls: 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-900/40',
        },
    } as const
    const v = map[status]
    return (
        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold border whitespace-nowrap ${v.cls}`}>
            {v.icon}
            {t(`requests.submitOffer.availability.${status}`)}
        </span>
    )
}
