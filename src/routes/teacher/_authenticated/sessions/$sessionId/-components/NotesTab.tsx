import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Save } from 'lucide-react'

import { showToast } from '@/lib/utils/toast'

import { updateSessionNotes } from '../../-queries/sessionsQueries'
import type { SessionDetail } from '../../-types/types'

export const NotesTab: React.FC<{ session: SessionDetail }> = ({ session }) => {
    const { t } = useTranslation('teacher')
    const queryClient = useQueryClient()
    const [draft, setDraft] = useState(session.notes ?? '')

    // Keep the local buffer in sync if the upstream session refetches.
    useEffect(() => {
        setDraft(session.notes ?? '')
    }, [session.notes])

    const mutation = useMutation({
        mutationFn: () => updateSessionNotes(session.id, draft),
        onSuccess: () => {
            showToast({ type: 'success', message: t('sessions.detail.toasts.notesSaved') })
            queryClient.invalidateQueries({ queryKey: ['sessions', 'detail', session.id] })
        },
        onError: (err: Error) => showToast({ type: 'server', message: t(err.message, { defaultValue: err.message }) }),
    })

    const isDirty = (session.notes ?? '') !== draft

    return (
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 space-y-4">
            <header>
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    {t('sessions.detail.notes.title')}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {t('sessions.detail.notes.subtitle')}
                </p>
            </header>

            <textarea
                rows={10}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={t('sessions.detail.notes.placeholder')}
                maxLength={4000}
                className="w-full px-3.5 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 text-sm resize-y leading-relaxed"
            />

            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={() => mutation.mutate()}
                    disabled={!isDirty || mutation.isPending}
                    className="px-5 py-2.5 rounded-lg bg-primary dark:bg-secondary text-white text-sm font-bold flex items-center gap-2 hover:opacity-85 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                    {t('sessions.detail.notes.save')}
                </button>
            </div>
        </section>
    )
}
