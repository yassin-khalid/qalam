import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle2, Loader2, Send, X } from 'lucide-react'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'

export interface PublishIssue {
    code: string
    severity: 'error' | 'warning'
    message: string
}

interface PublishValidationDialogProps {
    open: boolean
    issues: PublishIssue[]
    isPending: boolean
    onClose: () => void
    onConfirm: () => void
}

export const PublishValidationDialog: React.FC<PublishValidationDialogProps> = ({
    open,
    issues,
    isPending,
    onClose,
    onConfirm,
}) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const blockers = issues.filter((i) => i.severity === 'error')
    const warnings = issues.filter((i) => i.severity === 'warning')
    const canPublish = blockers.length === 0

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => !isPending && onClose()}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        dir={LOCALE_DIRECTION[locale]}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        <header className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${canPublish
                                    ? 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                                    : 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                                    }`}>
                                    {canPublish ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                                </div>
                                <div>
                                    <h2 className="text-base font-black text-slate-800 dark:text-white">
                                        {canPublish
                                            ? t('courses.new.publish.readyTitle')
                                            : t('courses.new.publish.blockedTitle')}
                                    </h2>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                        {canPublish
                                            ? t('courses.new.publish.readySubtitle')
                                            : t('courses.new.publish.blockedSubtitle', { count: blockers.length })}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                aria-label={t('common.closeAria')}
                                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                            >
                                <X size={18} />
                            </button>
                        </header>

                        <div className="px-6 py-4 max-h-[55vh] overflow-y-auto space-y-3">
                            {blockers.length > 0 && (
                                <IssueGroup
                                    title={t('courses.new.publish.errorsTitle')}
                                    issues={blockers}
                                    tone="error"
                                />
                            )}
                            {warnings.length > 0 && (
                                <IssueGroup
                                    title={t('courses.new.publish.warningsTitle')}
                                    issues={warnings}
                                    tone="warning"
                                />
                            )}
                            {canPublish && warnings.length === 0 && (
                                <div className="bg-emerald-50/60 dark:bg-emerald-950/15 border border-emerald-200 dark:border-emerald-900/40 rounded-xl p-4 text-sm text-emerald-800 dark:text-emerald-200 leading-relaxed">
                                    {t('courses.new.publish.allGoodMessage')}
                                </div>
                            )}
                        </div>

                        <footer className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isPending}
                                className="px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
                            >
                                {canPublish
                                    ? t('courses.new.publish.cancel')
                                    : t('courses.new.publish.goBack')}
                            </button>
                            <button
                                type="button"
                                onClick={onConfirm}
                                disabled={!canPublish || isPending}
                                className="px-5 py-2.5 rounded-lg bg-secondary text-white text-sm font-bold flex items-center gap-2 hover:bg-primary transition shadow-md shadow-secondary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                                {t('courses.new.publish.confirm')}
                            </button>
                        </footer>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

const IssueGroup: React.FC<{ title: string; issues: PublishIssue[]; tone: 'error' | 'warning' }> = ({
    title,
    issues,
    tone,
}) => {
    const toneClass =
        tone === 'error'
            ? 'bg-rose-50/60 dark:bg-rose-950/15 border-rose-200 dark:border-rose-900/40 text-rose-800 dark:text-rose-200'
            : 'bg-amber-50/60 dark:bg-amber-950/15 border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200'
    const dot = tone === 'error' ? 'bg-rose-500' : 'bg-amber-500'
    return (
        <div className={`border rounded-xl p-3.5 ${toneClass}`}>
            <h3 className="text-xs font-black uppercase tracking-wider mb-2 opacity-80">{title}</h3>
            <ul className="space-y-1.5">
                {issues.map((issue, i) => (
                    <li key={`${issue.code}-${i}`} className="flex items-start gap-2 text-sm leading-snug">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
                        <span>{issue.message}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}
