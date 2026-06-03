import React, { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    X,
    SaudiRiyal,
    Loader2,
    Check,
    Pencil,
    Calendar as CalendarIcon,
    Clock,
    Info,
    AlertTriangle,
} from 'lucide-react'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'
import { showToast } from '@/lib/utils/toast'

import {
    scheduleConflictsQueryOptions,
    submitOffer,
    type SubmitOfferInput,
} from '../../-queries/sessionRequestsQueries'
import type {
    PerSessionOfferResponse,
    SessionOffer,
    SessionRequestDetail,
} from '../../-types/types'

interface SubmitOfferModalProps {
    open: boolean
    onClose: () => void
    request: SessionRequestDetail
    existingOffer: SessionOffer | null
}

type PricingMode = 'total' | 'perSession'

const VALIDITY_OPTIONS = [24, 48, 72, 168] as const

interface RowState extends PerSessionOfferResponse {
    // local-only ergonomics
    open: boolean
}

const formatDateInput = (iso: string) => {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return ''
    return d.toISOString().slice(0, 10)
}

export const SubmitOfferModal: React.FC<SubmitOfferModalProps> = ({
    open,
    onClose,
    request,
    existingOffer,
}) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const queryClient = useQueryClient()
    const timeSlots = t('common.timeSlots', { returnObjects: true }) as string[]

    const isUpdate = !!existingOffer

    const [pricingMode, setPricingMode] = useState<PricingMode>(
        existingOffer?.pricePerSession ? 'perSession' : 'total',
    )
    const [totalPrice, setTotalPrice] = useState<string>(
        existingOffer ? String(existingOffer.totalPrice) : '',
    )
    const [perSessionPrice, setPerSessionPrice] = useState<string>(
        existingOffer?.pricePerSession ? String(existingOffer.pricePerSession) : '',
    )
    const [generalNotes, setGeneralNotes] = useState<string>(existingOffer?.generalNotes ?? '')
    const [validityHours, setValidityHours] = useState<number>(existingOffer?.validityHours ?? 48)
    const [rows, setRows] = useState<RowState[]>([])

    // Re-seed when opening or when the existing offer changes.
    useEffect(() => {
        if (!open) return
        const seed = request.sessions.map<RowState>((s) => {
            const prior = existingOffer?.perSessionResponses.find(
                (r) => r.sessionNumber === s.sessionNumber,
            )
            return {
                sessionNumber: s.sessionNumber,
                accept: prior ? prior.accept : true,
                alternativeDate: prior?.alternativeDate,
                alternativeTimeSlotLabel: prior?.alternativeTimeSlotLabel,
                teacherNotes: prior?.teacherNotes,
                open: prior ? !prior.accept : false,
            }
        })
        setRows(seed)
    }, [open, request, existingOffer])

    const calculatedTotal = useMemo(() => {
        if (pricingMode === 'perSession') {
            const p = Number(perSessionPrice)
            return Number.isFinite(p) ? p * request.sessionsCount : 0
        }
        const t = Number(totalPrice)
        return Number.isFinite(t) ? t : 0
    }, [pricingMode, totalPrice, perSessionPrice, request.sessionsCount])

    // Schedule conflicts (BRD §7 Screen 4) — preferred sessions that clash with
    // the teacher's already-committed slots. Only fetched while the modal is open.
    const conflictsQuery = useQuery({ ...scheduleConflictsQueryOptions(request.id), enabled: open })
    const conflictSessionNumbers = useMemo(
        () => new Set((conflictsQuery.data ?? []).map((c) => c.sessionNumber)),
        [conflictsQuery.data],
    )
    // A blocking conflict is one on a session the teacher has agreed to keep as-is.
    const hasBlockingConflict = rows.some((r) => r.accept && conflictSessionNumbers.has(r.sessionNumber))

    const priceRange = request.priceRange ?? null
    const priceOutOfRange =
        !!priceRange && calculatedTotal > 0 && (calculatedTotal < priceRange.min || calculatedTotal > priceRange.max)

    const mutation = useMutation({
        mutationFn: (input: SubmitOfferInput) => submitOffer(input),
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
        const finalTotal = calculatedTotal
        if (finalTotal <= 0) {
            showToast({ type: 'validation', message: t('requests.submitOffer.errors.positivePrice') })
            return
        }
        if (priceOutOfRange && priceRange) {
            showToast({
                type: 'validation',
                message: t('requests.submitOffer.errors.priceOutOfRange', {
                    min: priceRange.min,
                    max: priceRange.max,
                }),
            })
            return
        }
        const missingAlternative = rows.some(
            (r) => !r.accept && (!r.alternativeDate || !r.alternativeTimeSlotLabel),
        )
        if (missingAlternative) {
            showToast({ type: 'validation', message: t('requests.submitOffer.errors.missingAlternative') })
            return
        }
        if (hasBlockingConflict) {
            showToast({ type: 'validation', message: t('requests.submitOffer.errors.scheduleConflict') })
            return
        }
        const perSessionResponses: PerSessionOfferResponse[] = rows.map((r) => ({
            sessionNumber: r.sessionNumber,
            accept: r.accept,
            ...(r.accept
                ? {}
                : {
                    alternativeDate: r.alternativeDate,
                    alternativeTimeSlotLabel: r.alternativeTimeSlotLabel,
                }),
            ...(r.teacherNotes ? { teacherNotes: r.teacherNotes } : {}),
        }))
        mutation.mutate({
            requestId: request.id,
            totalPrice: finalTotal,
            pricePerSession: pricingMode === 'perSession' ? Number(perSessionPrice) : null,
            generalNotes: generalNotes.trim() || null,
            perSessionResponses,
            validityHours,
        })
    }

    const patchRow = (sessionNumber: number, patch: Partial<RowState>) => {
        setRows((prev) => prev.map((r) => (r.sessionNumber === sessionNumber ? { ...r, ...patch } : r)))
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
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <header className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-800/30">
                            <div>
                                <h2 className="text-lg font-black text-slate-800 dark:text-white">
                                    {t(isUpdate ? 'requests.submitOffer.updateTitle' : 'requests.submitOffer.title')}
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                                    {locale === 'ar' ? request.subjectNameAr : request.subjectNameEn} • {request.sessionsCount} {t('requests.card.sessionsLabel')}
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
                            {/* Pricing */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t('requests.submitOffer.pricingMode')}
                                </label>
                                <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl w-full max-w-md">
                                    <ToggleBtn active={pricingMode === 'total'} onClick={() => setPricingMode('total')}>
                                        {t('requests.submitOffer.pricingModeTotal')}
                                    </ToggleBtn>
                                    <ToggleBtn active={pricingMode === 'perSession'} onClick={() => setPricingMode('perSession')}>
                                        {t('requests.submitOffer.pricingModePerSession')}
                                    </ToggleBtn>
                                </div>

                                {pricingMode === 'total' ? (
                                    <PriceInput
                                        label={t('requests.submitOffer.totalPriceLabel')}
                                        value={totalPrice}
                                        onChange={setTotalPrice}
                                    />
                                ) : (
                                    <div className="space-y-2">
                                        <PriceInput
                                            label={t('requests.submitOffer.perSessionPriceLabel')}
                                            value={perSessionPrice}
                                            onChange={setPerSessionPrice}
                                        />
                                        <div className="text-xs font-bold text-primary dark:text-secondary bg-primary/5 dark:bg-secondary/10 rounded-lg px-3 py-2 inline-flex items-center gap-1.5">
                                            <SaudiRiyal size={12} />
                                            {t('requests.submitOffer.calculatedTotal', { total: calculatedTotal })}
                                        </div>
                                    </div>
                                )}

                                {priceRange && (
                                    <p
                                        className={`text-xs font-medium flex items-center gap-1.5 ${priceOutOfRange
                                            ? 'text-rose-600 dark:text-rose-400'
                                            : 'text-slate-500 dark:text-slate-400'
                                            }`}
                                    >
                                        {priceOutOfRange && <AlertTriangle size={12} />}
                                        {t(
                                            priceOutOfRange
                                                ? 'requests.submitOffer.priceOutOfRangeHint'
                                                : 'requests.submitOffer.priceRangeHint',
                                            { min: priceRange.min, max: priceRange.max },
                                        )}
                                    </p>
                                )}
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

                            {/* Per-session agreement */}
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                        {t('requests.submitOffer.perSessionAgreement')}
                                    </label>
                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                                        <Info size={12} />
                                        {t('requests.submitOffer.perSessionHint')}
                                    </span>
                                </div>
                                <ul className="space-y-2.5">
                                    {rows.map((row) => {
                                        const session = request.sessions.find((s) => s.sessionNumber === row.sessionNumber)!
                                        return (
                                            <li
                                                key={row.sessionNumber}
                                                className={`rounded-xl border ${row.accept
                                                    ? 'bg-emerald-50/40 dark:bg-emerald-950/10 border-emerald-200/60 dark:border-emerald-900/40'
                                                    : 'bg-amber-50/40 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-900/40'
                                                    } p-3 space-y-2`}
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0 flex-1">
                                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white truncate">
                                                            {t('requests.detail.sessions.sessionLabel', { number: row.sessionNumber })} — {session.title}
                                                        </h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                                                            <CalendarIcon size={11} />
                                                            {formatDateInput(session.preferredDate)}
                                                            <Clock size={11} className="ms-2" />
                                                            {session.preferredTimeSlotLabel}
                                                            <span className="ms-2">• {session.durationMinutes} {t('requests.detail.sessions.duration', { count: session.durationMinutes }).replace(/\d+\s*/, '')}</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <button
                                                            type="button"
                                                            onClick={() => patchRow(row.sessionNumber, { accept: true, open: false })}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${row.accept
                                                                ? 'bg-emerald-600 text-white border-transparent'
                                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                                                }`}
                                                        >
                                                            <Check size={12} />
                                                            {t('requests.submitOffer.agreeBtn')}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => patchRow(row.sessionNumber, { accept: false, open: true })}
                                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center gap-1 ${!row.accept
                                                                ? 'bg-amber-600 text-white border-transparent'
                                                                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                                                                }`}
                                                        >
                                                            <Pencil size={12} />
                                                            {t('requests.submitOffer.proposeBtn')}
                                                        </button>
                                                    </div>
                                                </div>

                                                {conflictSessionNumbers.has(row.sessionNumber) && (
                                                    <div className="flex items-start gap-1.5 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20 rounded-lg px-2.5 py-1.5">
                                                        <AlertTriangle size={13} className="shrink-0 mt-px" />
                                                        <span>
                                                            {t(
                                                                row.accept
                                                                    ? 'requests.submitOffer.conflictBlocking'
                                                                    : 'requests.submitOffer.conflictResolved',
                                                            )}
                                                        </span>
                                                    </div>
                                                )}

                                                {!row.accept && (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-amber-200/40 dark:border-amber-900/30">
                                                        <div>
                                                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                                                                {t('requests.submitOffer.alternativeDateLabel')} *
                                                            </label>
                                                            <input
                                                                type="date"
                                                                value={row.alternativeDate ? row.alternativeDate.slice(0, 10) : ''}
                                                                onChange={(e) =>
                                                                    patchRow(row.sessionNumber, {
                                                                        alternativeDate: e.target.value
                                                                            ? new Date(e.target.value).toISOString()
                                                                            : undefined,
                                                                    })
                                                                }
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                                                                {t('requests.submitOffer.alternativeSlotLabel')} *
                                                            </label>
                                                            <select
                                                                value={row.alternativeTimeSlotLabel ?? ''}
                                                                onChange={(e) =>
                                                                    patchRow(row.sessionNumber, {
                                                                        alternativeTimeSlotLabel: e.target.value || undefined,
                                                                    })
                                                                }
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                                            >
                                                                <option value="">—</option>
                                                                {timeSlots.map((s) => (
                                                                    <option key={s} value={s}>{s}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 block">
                                                                {t('requests.submitOffer.teacherSessionNotes')}
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={row.teacherNotes ?? ''}
                                                                onChange={(e) => patchRow(row.sessionNumber, { teacherNotes: e.target.value })}
                                                                maxLength={250}
                                                                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>

                            {/* General notes */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {t('requests.submitOffer.generalNotesLabel')}
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={1000}
                                    value={generalNotes}
                                    onChange={(e) => setGeneralNotes(e.target.value)}
                                    placeholder={t('requests.submitOffer.generalNotesPlaceholder')}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
                                />
                                <div className="text-end text-xs text-slate-500 dark:text-slate-400">{generalNotes.length} / 1000</div>
                            </div>
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
                                disabled={mutation.isPending || hasBlockingConflict || priceOutOfRange}
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

const ToggleBtn: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-white dark:bg-slate-800 text-teal-600 dark:text-secondary shadow-sm' : 'text-slate-500'
            }`}
    >
        {children}
    </button>
)

const PriceInput: React.FC<{ label: string; value: string; onChange: (v: string) => void }> = ({ label, value, onChange }) => (
    <div className="space-y-2">
        <label className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</label>
        <div className="relative">
            <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-end text-sm"
            />
            <span className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <SaudiRiyal size={16} />
            </span>
        </div>
    </div>
)
