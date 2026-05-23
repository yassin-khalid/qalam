import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Trash2, Loader2, BookOpenCheck, CalendarDays } from 'lucide-react'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'
import { showToast } from '@/lib/utils/toast'

import {
    addSessionHomework,
    deleteSessionHomework,
} from '../../-queries/sessionsQueries'
import type { SessionDetail } from '../../-types/types'

export const HomeworkTab: React.FC<{ session: SessionDetail }> = ({ session }) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const queryClient = useQueryClient()

    const [addOpen, setAddOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueAt, setDueAt] = useState('')

    const addMutation = useMutation({
        mutationFn: () =>
            addSessionHomework(session.id, {
                title,
                description: description.trim() || null,
                dueAt: dueAt ? new Date(dueAt).toISOString() : null,
            }),
        onSuccess: () => {
            showToast({ type: 'success', message: t('sessions.detail.toasts.homeworkAdded') })
            queryClient.invalidateQueries({ queryKey: ['sessions', 'detail', session.id] })
            setAddOpen(false)
            setTitle('')
            setDescription('')
            setDueAt('')
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteSessionHomework(session.id, id),
        onSuccess: () => {
            showToast({ type: 'success', message: t('sessions.detail.toasts.homeworkDeleted') })
            queryClient.invalidateQueries({ queryKey: ['sessions', 'detail', session.id] })
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <header className="flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-base font-bold text-slate-800 dark:text-white">
                        {t('sessions.detail.homework.title')}
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {t('sessions.detail.homework.subtitle')}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    className="px-4 py-2 rounded-lg bg-primary dark:bg-secondary text-white text-sm font-bold flex items-center gap-2 hover:opacity-85 transition"
                >
                    <Plus size={14} />
                    {t('sessions.detail.homework.addCta')}
                </button>
            </header>

            {session.homework.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium text-center py-8 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                    {t('sessions.detail.homework.empty')}
                </p>
            ) : (
                <ul className="space-y-2.5">
                    {session.homework.map((hw) => (
                        <li
                            key={hw.id}
                            className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-secondary/15 text-primary dark:text-secondary flex items-center justify-center shrink-0">
                                        <BookOpenCheck size={16} />
                                    </div>
                                    <div className="min-w-0">
                                        <h4 className="text-sm font-bold text-slate-800 dark:text-white">{hw.title}</h4>
                                        {hw.description && (
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                {hw.description}
                                            </p>
                                        )}
                                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                            <span className="flex items-center gap-1">
                                                <CalendarDays size={11} />
                                                {hw.dueAt
                                                    ? t('sessions.detail.homework.dueAt', {
                                                        when: new Date(hw.dueAt).toLocaleDateString(
                                                            locale === 'ar' ? 'ar-EG' : 'en-US',
                                                            { day: 'numeric', month: 'short' },
                                                        ),
                                                    })
                                                    : t('sessions.detail.homework.noDue')}
                                            </span>
                                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                                                {t('sessions.detail.homework.submittedRatio', {
                                                    submitted: hw.submittedCount,
                                                    total: hw.totalStudents,
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    aria-label={t('sessions.detail.homework.delete')}
                                    onClick={() => deleteMutation.mutate(hw.id)}
                                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition shrink-0"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <AnimatePresence>
                {addOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={() => !addMutation.isPending && setAddOpen(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            dir={LOCALE_DIRECTION[locale]}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4"
                        >
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                                {t('sessions.detail.homework.addCta')}
                            </h3>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {t('sessions.detail.homework.titleLabel')}
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={150}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {t('sessions.detail.homework.descriptionLabel')}
                                </label>
                                <textarea
                                    rows={3}
                                    maxLength={1000}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                    {t('sessions.detail.homework.dueAtLabel')}
                                </label>
                                <input
                                    type="date"
                                    value={dueAt}
                                    onChange={(e) => setDueAt(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                                />
                            </div>

                            <div className="flex gap-2 pt-1">
                                <button
                                    type="button"
                                    disabled={!title.trim() || addMutation.isPending}
                                    onClick={() => addMutation.mutate()}
                                    className="flex-1 bg-secondary text-white hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition"
                                >
                                    {addMutation.isPending && <Loader2 size={14} className="animate-spin" />}
                                    {t('sessions.detail.homework.submit')}
                                </button>
                                <button
                                    type="button"
                                    disabled={addMutation.isPending}
                                    onClick={() => setAddOpen(false)}
                                    className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold text-sm transition"
                                >
                                    {t('sessions.detail.homework.cancel')}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    )
}
