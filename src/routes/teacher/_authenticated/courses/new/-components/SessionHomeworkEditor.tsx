import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { BookOpenCheck, Plus, Trash2, X } from 'lucide-react'

import { LOCALE_DIRECTION } from '@/lib/i18n'
import { useLocale } from '@/lib/hooks/useLocale'
import type { SessionHomeworkItem } from '../route'

interface SessionHomeworkEditorProps {
    homework: SessionHomeworkItem[]
    onChange: (next: SessionHomeworkItem[]) => void
}

export const SessionHomeworkEditor: React.FC<SessionHomeworkEditorProps> = ({
    homework,
    onChange,
}) => {
    const { t } = useTranslation('teacher')
    const locale = useLocale()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [dueOffsetDays, setDueOffsetDays] = useState<string>('')

    const resetForm = () => {
        setTitle('')
        setDescription('')
        setDueOffsetDays('')
        setOpen(false)
    }

    const handleAdd = () => {
        if (!title.trim()) return
        const next: SessionHomeworkItem = {
            id: `hw-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            title: title.trim(),
            description: description.trim() || null,
            dueOffsetDays: dueOffsetDays ? Number(dueOffsetDays) : null,
        }
        onChange([...homework, next])
        resetForm()
    }

    const handleRemove = (id: string) => onChange(homework.filter((h) => h.id !== id))

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <BookOpenCheck size={13} className="text-primary dark:text-secondary" />
                    {t('courses.new.sections.sessions.homework.title')}
                </div>
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary dark:bg-secondary text-white hover:opacity-85 transition inline-flex items-center gap-1"
                >
                    <Plus size={11} />
                    {t('courses.new.sections.sessions.homework.add')}
                </button>
            </div>

            {homework.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic py-2 px-2.5 rounded-md border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40">
                    {t('courses.new.sections.sessions.homework.empty')}
                </p>
            ) : (
                <ul className="space-y-1.5">
                    {homework.map((hw) => (
                        <li
                            key={hw.id}
                            className="p-2.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-800 dark:text-white truncate">
                                        {hw.title}
                                    </p>
                                    {hw.description && (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                                            {hw.description}
                                        </p>
                                    )}
                                    {hw.dueOffsetDays != null && (
                                        <p className="text-[10px] text-primary dark:text-secondary font-bold mt-1">
                                            {t('courses.new.sections.sessions.homework.dueOffset', { count: hw.dueOffsetDays })}
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    aria-label={t('courses.new.sections.sessions.homework.remove')}
                                    onClick={() => handleRemove(hw.id)}
                                    className="p-1 rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition shrink-0"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                        className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4"
                        onClick={resetForm}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            dir={LOCALE_DIRECTION[locale]}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <header className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between">
                                <h3 className="text-base font-black text-slate-800 dark:text-white">
                                    {t('courses.new.sections.sessions.homework.dialogTitle')}
                                </h3>
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    aria-label={t('common.closeAria')}
                                    className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 dark:focus-visible:ring-secondary/40"
                                >
                                    <X size={16} />
                                </button>
                            </header>

                            <div className="p-5 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {t('courses.new.sections.sessions.homework.titleLabel')} *
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={150}
                                        autoFocus
                                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {t('courses.new.sections.sessions.homework.descriptionLabel')}
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={3}
                                        maxLength={500}
                                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm resize-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                                        {t('courses.new.sections.sessions.homework.dueOffsetLabel')}
                                    </label>
                                    <input
                                        type="number"
                                        min={0}
                                        max={365}
                                        value={dueOffsetDays}
                                        onChange={(e) => setDueOffsetDays(e.target.value)}
                                        placeholder={t('courses.new.sections.sessions.homework.dueOffsetPlaceholder')}
                                        className="w-full px-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm"
                                    />
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                        {t('courses.new.sections.sessions.homework.dueOffsetHint')}
                                    </p>
                                </div>
                            </div>

                            <footer className="px-5 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex gap-2">
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-sm font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                                >
                                    {t('courses.new.sections.sessions.homework.cancel')}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAdd}
                                    disabled={!title.trim()}
                                    className="flex-1 px-4 py-2.5 rounded-lg bg-secondary text-white text-sm font-bold hover:bg-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
                                >
                                    {t('courses.new.sections.sessions.homework.confirmAdd')}
                                </button>
                            </footer>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
